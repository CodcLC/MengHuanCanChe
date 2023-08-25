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
import Device from "../../../framework/plugin_boosts/misc/Device";
import StatHepler, { EventType } from "../Common/StatHelper";
import { MissionEndType } from "../Common/EnumConst";
import CConfig from "../GameLogic";


const {ccclass, property} = cc._decorator;
/**
 * 成功通过界面
 */
@ccclass
export default class UIThrough extends cc.Component {

    @property(cc.Label)
    levelLable:cc.Label = null;

    @property(cc.Label)
    doubleHitLable:cc.Label = null;

    @property(cc.Label)
    zuanshiLable:cc.Label = null;

    @property(cc.Button)
    addTimeBtn:cc.Button = null;

    @property(cc.Button)
    shareBtn:cc.Button = null;

    @property(cc.Label)
    coinLable:cc.Label = null;

    @property(cc.Node)
    coinDoubleNode:cc.Node = null;

    @property(cc.Node)
    continueNodeLeft:cc.Node = null;

    @property(cc.Node)
    continueNodeMid:cc.Node = null;

    @property(cc.Node)
    wayTypeNode:cc.Node = null;

    private _level:number;

    private _data:LevelData;
    private FULLSTARNUM = 3;
    /** 倍数 */
    private _mult:number = 1;

    private _isShare:boolean = true;
    private _isBtnGray:boolean = false;


    onLoad(){
        
    }

    start () {

    }

    onShown () {
        root.pause();

        Device.playEffectURL("Audio/" + csv.ConfigData.sound_battle_victory + ".mp3");
        this._level = UserInfo.playingLevel;
        this._data = UserInfo.getLevelData(this._level);
        this._mult = UserInfo.isCoinDouble ? 2 : 1;
        
        this.initView();

        UserInfo.save()
        
        
    }

    /** 加奖励 */
    private addAward(mult:number = 1){
        if(!this.coinLable || !this.zuanshiLable)
        {
            return;
        }
        let addCoin = mult * (Number(this.coinLable.string));
        let addDia = Number(this.zuanshiLable.string);
        UserInfo.addData("coin",addCoin , true);
        UserInfo.addData("diamond",addDia, true);
    }

    /** 显示初始化 */
    private initView(){
        
        this.initStars();
        this.initLabel();
        this.initBtn();
    }

    /** 初始化按钮 */
    private initBtn(){
        let starNum = root.getStar(UserInfo.target_mission_num);
        let wayList = Util.judgeBtnType("get_double_coin");
        wayList[0] == "share" ? (this._isShare = true) : (this._isShare = false);
        this._isBtnGray = <boolean>wayList[1];

        this.continueNodeLeft.active = true;
        this.continueNodeMid.active = false;
        // 未满星有加时间重玩按钮
        if(starNum < this.FULLSTARNUM && !UserInfo.is_chanllenge3star){
            this.shareBtn.node.active = false;
            this.addTimeBtn.node.active = true;
            let lblTips = this.addTimeBtn.node.getChildByName("tips").getChildByName("tipLabel").getComponent(cc.Label);
            let lblReduce = this.addTimeBtn.node.getChildByName("addNeed").getComponent(cc.Label);
 
            // 消耗钻石数 
            let config = csv.MissionData.get(this._level);
            let l = csv.ConfigData.not_perfect_to_buy_time.split('&');
            lblReduce.string = l[0];
            if(config.EndObj == 2){
                lblTips.string = "是否增加" + (Number(l[1])/1000) + "时间，挑战三星？";
            }else if(config.EndObj == 1){
                lblTips.string = "是否增加" + csv.FailData.get(1).reward + "个顾客，挑战三星？";
            }
            
            
        }else{
            this.shareBtn.node.active = true;
            this.addTimeBtn.node.active = false;
            if(this._isShare){
                Common.setDisplay( this.wayTypeNode.getComponent(cc.Sprite),"Texture/UI/Share_icon");
            }else{
                Common.setDisplay( this.wayTypeNode.getComponent(cc.Sprite),"Texture/UI/TV_icon");
            }
            
            this.shareBtn.interactable = true;

            if(UserInfo.isCoinDouble){  
                this.continueNodeLeft.active = false;
                this.continueNodeMid.active = true;
                this.shareBtn.node.active = false;
            }
        }
    }

    /** 初始化文字 */
    private initLabel(){
        let mission = csv.MissionData.get(this._level);
        
        let lvNum = mission.desc.split("_")[1];
        this.levelLable.string = UserInfo.chapter + "-" + lvNum;

        this.doubleHitLable.string = (UserInfo.doubleHit || 0).toString();

        this.coinLable.string = (UserInfo.current_coin || 0).toString();
        this.coinDoubleNode.active = UserInfo.isCoinDouble ? true :false;
        let starNum = root.getStar(UserInfo.target_mission_num);
        this.zuanshiLable.string = (mission.Zuanshi[starNum-1] || 0).toString();
    }


    /** 初始化星星 */
    private initStars(){
        
        let stars = this.node.getChildByName("bg").getChildByName("stars");
        let starNum = root.getStar(UserInfo.target_mission_num);//this._data.star;

        for(let i = 0;i < stars.children.length;i++){
            if(i + 1 <= starNum){
                Common.setDisplay(stars.children[i].getComponent(cc.Sprite),"Texture/UI/Star_yellow");
            }else{
                Common.setDisplay(stars.children[i].getComponent(cc.Sprite),"Texture/UI/Star_gray");
            }
        }
        
        if(UserInfo.is_break_record && root.getStar(UserInfo.target_mission_num) == this.FULLSTARNUM && CConfig.initConfig && CConfig.initConfig.bannerSwitch){
            ViewManager.instance.show("UI/UIReAward",this._level);
  
        }else{
            event.emit("LevelWin");
        }
    }

    click_addTimeAgain(){
        let l = csv.ConfigData.not_perfect_to_buy_time.split('&');
        let diamond = Number(l[0]) || 0;
        if(UserInfo.diamond < diamond){
            Toast.make("钻石不足");
            return;
        }

        UserInfo.addData("diamond" , diamond*(-1) , true);
        this.getComponent(View).hide();

        let config = csv.MissionData.get(this._level);
        if(config.EndObj == 2){
            // 时间
            event.emit("onAddTimeAgain",Number(l[1])/1000);
            StatHepler.doLevelEvent(EventType.revive,"延时继续",config.EndObj,1,diamond);
        }else if(config.EndObj == 1){
            // 顾客
            event.emit("onAddTimeAgain",csv.FailData.get(1).reward);
            StatHepler.doLevelEvent(EventType.revive,"增加顾客继续",config.EndObj,1,diamond);
        }
    }

    /** 分享 双倍金币 */
    click_share(){
        if(this._isShare){
            Platform.doShare(Util.shareConfigs["get_double_coin"],()=>{
                this.addAward(2);
                StatHepler.doLevelEvent(EventType.award,"分享双倍",null,1,1);
                StatHepler.level_end_event = "complete"
                //UserInfo.addData("dayShareTime",1,true);
                Util.loadScene("Home","win");
            },this);
        }else{
            Platform.watch_video(Util.shareConfigs["get_double_coin"],()=>{
                this.addAward(2);   
                StatHepler.level_end_event = "complete"
                UserInfo.addData("dayVideoTime",1,true);
                Util.loadScene("Home","win");
            },this);
        }
        
    }

    click_close(){
        this.addAward(this._mult);
        //this.getComponent(View).hide();
        StatHepler.level_end_event = "complete"
        Util.loadScene("Home","win");
    }
    click_again(){
        this.addAward(this._mult);
        StatHepler.level_end_event = "complete"
        Util.loadScene("Home","win");
        // this.log("start level")
    }
}
