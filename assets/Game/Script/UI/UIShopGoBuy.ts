import View from "../../../framework/plugin_boosts/ui/View";
import Util from "../Common/Util";
import { UserInfo ,LevelData} from "../Common/UserInfo";
import Common from "../../../framework/plugin_boosts/utils/Common";
import Plate from "../Game/Plate";
import Platform from "../../../framework/Platform";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import { Toast } from "../../../framework/plugin_boosts/ui/ToastManager";
import { ifError } from "assert";
import ViewManager from "../../../framework/plugin_boosts/ui/ViewManager";
import { root } from "../Game/GameRoot";
import UIShopUp from "./UIShopUp";
import { toASCII } from "punycode";
import Device from "../../../framework/plugin_boosts/misc/Device";
import GuiderScript, { Guider } from "../Teach/GuideScript";


const {ccclass, property} = cc._decorator;
/**
 * 点击商品购买界面
 */
@ccclass
export default class UIShopGoBuy extends cc.Component {

    /** 标题 */
    @property(cc.Label)
    titleLab:cc.Label = null;

    /** 升级 */
    @property(cc.Label)
    lvLab:cc.Label = null;

    /** 消耗的数字 */
    @property(cc.Label)
    consumeLab:cc.Label = null;

    /** 提示 */
    @property(cc.Label)
    tipLab:cc.Label = null;

    /** 可以购买的显示内容 */
    @property(cc.Node)
    canContentLayNode:cc.Node = null;

    /** 不能购买显示内容 */
    @property(cc.Node)
    noCanContentLayNode:cc.Node = null;


    /** 分享或视频按钮 */
    @property(cc.Node)
    shareVideoBtnNode:cc.Node = null;

    /** 升级按钮 */
    @property(cc.Node)
    confirmBtnNode:cc.Node = null;

    /** 可以升级界面 */
    @property(cc.Node)
    canUpNode:cc.Node = null;

    /** 不能升级界面 */
    @property(cc.Node)
    cantUpNode:cc.Node = null;

    @property(cc.Node)
    bgUnLock:cc.Node = null;

    @property(cc.Node)
    bgLock:cc.Node = null;

    /** 是否分享 */
    isShare:boolean = false;

    /** 对应商品 */
    id:number;

    private MAXLV = 3;

    private _config:csv.ChujvData_Row | csv.ShicaiData_Row;

    /** 商品等级 */
    private _lvNum:number;

    /** 是否满级 */
    private isLvFull:boolean;

    /** 商品类型 */
    private type:ItemType;

    private _callBack:Function;

    private _isLock:boolean;


    onLoad(){
        
    }

    start () {

    }

    onShown (id:number,callBack:Function,isLock:boolean) {
        this.id = Number(id);
        this._callBack = callBack;
        this._isLock = isLock;

        this.init();
        
    }

    /** 初始化 */
    init(){
        this.initData();

        this.initShow();
        
    }


    /** 初始化数据 */
    initData(){
        if(this.id > 1000){
            this._config = csv.ChujvData.get(this.id);
            this._lvNum = UserInfo.getToolLevelData(this.id);
            this.type = ItemType.Chuju;
        }else{
            this._config = csv.ShicaiData.get(this.id);
            this._lvNum = UserInfo.getFoodLevelData(this.id);
            this.type = ItemType.Shicai;
        }
       
    }


    /** 初始化显示 */
    initShow(){
        if(this._isLock){
            this.bgLock.active = true;
            this.bgUnLock.active = false;

            
            let t = csv.Text.get(csv.MissionData.get(this._config.unlock).text).text;
            this.bgLock.getChildByName("content").getComponent(cc.Label).string = "需要解锁" + t;
            return;
        }else{
            this.bgLock.active = false;
            this.bgUnLock.active = true;
        }

        this.canUpNode.active = false;
        this.cantUpNode.active = false;
        this.confirmBtnNode.active = false;
        this.shareVideoBtnNode.active = false;


        this.titleLab.string = csv.Text.get(this._config.text).text;

        // 满级
        if(this._lvNum >= this.MAXLV){
            this.isLvFull = true;
            this.lvLab.string = "Lv." + this.MAXLV;
            this.cantUpNode.active = true;
            this.confirmBtnNode.active = true;

            this.confirmBtnNode.children[0].getComponent(cc.Label).string = "确认";
        }else{
            // 未满级
            this.isLvFull = false;
            this.lvLab.string = "升级到Lv." + (this._lvNum + 1);
            this.canUpNode.active = true;
            
            this.consumeLab.string = this._config["GoldLv" + this._lvNum];
            this.tipLab.string = csv.Text.get(this._config.tips_text).text || "";


            // 金币足够
            if(Number(this.consumeLab.string) <= UserInfo.coin){
                this.confirmBtnNode.active = true;
                this.confirmBtnNode.children[0].getComponent(cc.Label).string = "升级";
            }else{
                // 金币不够
                this.shareVideoBtnNode.active = true;
                // this.shareVideoBtnNode.getChildByName("btnLab").getComponent(cc.Label).string = "看视频+" + csv.ConfigData.reward_coin_advertisement;
                let [btnType, is_disabled] = Util.judgeBtnType("money_notengough")
                let btn = this.shareVideoBtnNode.getComponent(cc.Button);
                let icon = Common.find("TV_icon",this.shareVideoBtnNode,cc.Sprite);
                let label = Common.find("btnLab" ,this.shareVideoBtnNode,cc.Label);
                Util.setShareBtn({
                    btn,
                    icon,
                    label,
                    btnType,
                    is_disabled,
                    video_text:"看视频 +"+ csv.ConfigData.reward_coin_advertisement,
                    share_text:"分享 +" + csv.ConfigData.reward_coin_share,
                    handler:Common.handler(this.node,"UIShopGoBuy" , "click_wayToGetCoin")
                })
                
            }
        }

        this.initContent();

    }

    /** 升级内容显示初始化 */
    private initContent(){
        if(this.isLvFull){
            if(this.type == ItemType.Chuju){
                for(let i = 0;i < this.noCanContentLayNode.children.length;i++){
                    let node = this.noCanContentLayNode.children[i];
                    this.oneShowChujuNoCan(node,i);
                }
                
                
            }else if (this.type == ItemType.Shicai){
                for(let i = 0;i < this.noCanContentLayNode.children.length;i++){
                    let node = this.noCanContentLayNode.children[i];
                    this.oneShowShicaiNoCan(node,i);
                }
            }
        }else{
            if(this.type == ItemType.Chuju){
                for(let i = 0;i < this.canContentLayNode.children.length;i++){
                    let node = this.canContentLayNode.children[i];
                    this.oneShowChujuCan(node,i);
                }
                
                
            }else if (this.type == ItemType.Shicai){
                for(let i = 0;i < this.canContentLayNode.children.length;i++){
                    let node = this.canContentLayNode.children[i];
                    this.oneShowShicaiCan(node,i);
                }
            }
        }
    }


    /** 显示一个食材未满级内容 */
    private oneShowShicaiCan(node:cc.Node,order:number){
        node.active = true;
        
        if(order == 0){
            let num = (<csv.ShicaiData_Row>this._config)["SellGold"+Math.min(this._lvNum,this.MAXLV)];
            let num2 = (<csv.ShicaiData_Row>this._config)["SellGold"+Math.min(this._lvNum+1,this.MAXLV)];
            node.children[0].getComponent(cc.Label).string = num;
            node.children[1].getComponent(cc.Label).string = num2;

            Common.setDisplay(node.children[0].children[0].getComponent(cc.Sprite),"Texture/UI/CoinIcon");
            Common.setDisplay(node.children[1].children[0].getComponent(cc.Sprite),"Texture/UI/CoinIcon");

        }else{
            node.active = false;
        }
    }

    /** 显示一个食材满级内容 */
    private oneShowShicaiNoCan(node:cc.Node,order:number){
        node.active = true;
        
        if(order == 0){
            let num = (<csv.ShicaiData_Row>this._config)["SellGold"+Math.min(this._lvNum,this.MAXLV)];
            node.getComponent(cc.Label).string = num;
            Common.setDisplay(node.children[0].getComponent(cc.Sprite),"Texture/UI/CoinIcon");
        }else{
            node.active = false;
        }
    }

    /** 显示一个厨具满级内容 */
    private oneShowChujuNoCan(node:cc.Node,order:number){
        node.active = true;
        
        if(order == 0){
            let num = (<csv.ChujvData_Row>this._config)["num"+Math.min(this._lvNum,this.MAXLV)];
            node.getComponent(cc.Label).string = num;
            Common.setDisplay(node.children[0].getComponent(cc.Sprite),"Texture/UI/plate");
        }else{
            let num = (<csv.ChujvData_Row>this._config)["Time"+Math.min(this._lvNum,this.MAXLV)] / 1000;
            if(Math.round(num) == 0){
                node.active = false;
                return;
            } 
            node.getComponent(cc.Label).string = num.toString();
            Common.setDisplay(node.children[0].getComponent(cc.Sprite),"Texture/UI/TIME_SMALL");
        }
    }

    /** 显示一个厨具未满级内容 */
    private oneShowChujuCan(node:cc.Node,order:number){
        node.active = true;
        
        if(order == 0){
            let num = (<csv.ChujvData_Row>this._config)["num"+Math.min(this._lvNum,this.MAXLV)];
            let num2 = (<csv.ChujvData_Row>this._config)["num"+Math.min(this._lvNum+1,this.MAXLV)];
            node.children[0].getComponent(cc.Label).string = num;
            node.children[1].getComponent(cc.Label).string = num2;

            Common.setDisplay(node.children[0].children[0].getComponent(cc.Sprite),"Texture/UI/plate");
            Common.setDisplay(node.children[1].children[0].getComponent(cc.Sprite),"Texture/UI/plate");
        }else{
            let num = (<csv.ChujvData_Row>this._config)["Time"+Math.min(this._lvNum,this.MAXLV)] / 1000;
            let num2 = (<csv.ChujvData_Row>this._config)["Time"+Math.min(this._lvNum+1,this.MAXLV)] / 1000;
            if(Math.round(num) == 0){
                node.active = false;
                return;
            } 
            node.children[0].getComponent(cc.Label).string = num.toString();
            node.children[1].getComponent(cc.Label).string = num2.toString();

            Common.setDisplay(node.children[0].children[0].getComponent(cc.Sprite),"Texture/UI/TIME_SMALL");
            Common.setDisplay(node.children[1].children[0].getComponent(cc.Sprite),"Texture/UI/TIME_SMALL");
        }
    }

    /** 确认按钮 */
    onBtnConfirm(){
        if(this.isLvFull || this._isLock){
            this.click_close();
        }else{
            let consume = Number(this.consumeLab.string);
            if(consume <= UserInfo.coin){
                UserInfo.addData("coin",-1 * consume);
                if(this.type == ItemType.Chuju){
                    UserInfo.setToolLevelData(this.id,Math.min(this._lvNum + 1,this.MAXLV));
                    UserInfo.daily_money_for_chujv += consume;
                    UserInfo.total_money_for_chujv += consume;
                }else if(this.type == ItemType.Shicai){
                    UserInfo.setFoodLevelData(this.id,Math.min(this._lvNum + 1,this.MAXLV));                
                    UserInfo.daily_money_for_food += consume;
                    UserInfo.total_money_for_food += consume;
                }
                !Guider.is_in_guide && Toast.make("升级成功");

                Device.playEffectURL("Audio/" + csv.ConfigData.sound_level_up + ".mp3");

                UserInfo.save();
                this.click_close();
                this._callBack && this._callBack();
                //UIShopUp.instance.onShown();
            }
            
        }

    }

    click_close(){
    
        this.getComponent(View).hide(); 
    }

    onDestroy(){
   
    }

    /** 视频或分享获得金币 */
    click_wayToGetCoin(evt,btnType){
        if(btnType == "share"){
            Platform.doShare(Util.shareConfigs["money_notengough"],()=>{
                UserInfo.addData("coin",csv.ConfigData.reward_coin_share,true);
                UserInfo.addData("dayShareTime",1,true);
                
                this.click_close();
                ViewManager.instance.show("UI/UIGetMoney","coin",csv.ConfigData.reward_coin_share);
            },this);
        }else{
            let f = ()=>{};
            if(this.isInGame()){
                root.pause();
                f = ()=>{
                    root.resume();
                };
            }
            Platform.watch_video(Util.shareConfigs["money_notengough"],()=>{
                UserInfo.addData("coin",csv.ConfigData.reward_coin_advertisement,true);
                UserInfo.addData("dayVideoTime",1,true);
                
                this.click_close();
                ViewManager.instance.show("UI/UIGetMoney","coin",csv.ConfigData.reward_coin_advertisement,()=>{
                    f();
                });
            },this,()=>{
                f();
            });
        }
    }

    isInGame(){
        return root ? root.isValid : false;
    }

}

enum ItemType{
    Chuju,
    Shicai,
}

