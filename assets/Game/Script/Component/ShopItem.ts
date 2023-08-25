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
import UIShopUp from "../UI/UIShopUp";
import Device from "../../../framework/plugin_boosts/misc/Device";

const {ccclass, property} = cc._decorator;



/**
 * 商城物品
 */
@ccclass
export default class ShopItem extends cc.Component {
    
    id:number;

    private _config:csv.ShicaiData_Row | csv.ChujvData_Row;

    private _lvNum:number;

    private MAXLV = 3;

    /** 当前最新关卡的id */
    nowNewId:number;

    /** 价格 */
    @property(cc.Label)
    priceLab:cc.Label = null;

    /** 商品 */
    @property(cc.Sprite)
    itemSprite:cc.Sprite = null;

    /** 锁住的锅 */
    @property(cc.Node)
    lockNode:cc.Node = null;

    /** 满级的显示 */
    @property(cc.Node)
    maxLVNode:cc.Node = null;

    /** 推荐 */
    @property(cc.Node)
    recommendNode:cc.Node = null;

    /** 寻找图片的路径 */
    private _url:string;

    /** 现在选择的章节商城 */
    nowSelChap;

    onLoad () {
        // this.node.on(cc.Node.EventType.TOUCH_END,this.onClickBuy,this);

        //this.init();
    }

    /** 初始化 */
    init(chapSel?){
        !this.nowSelChap && (this.nowSelChap = chapSel ? chapSel : UserInfo.chapter);
        this.initData();

        this.initShow();
        
    }


    /** 初始化显示 */
    initShow(){
        this.maxLVNode.active = false;
        this.itemSprite.node.active = false;
        this.priceLab.node.parent.active = false;
        this.recommendNode.active = false;
        this.lockNode.active = false;
        
        //Common.setDisplay(spr,this._url + this._config.icon + "_" + this._lvNum);
        Common.setDisplay(this.itemSprite,this._url + this._config.icon);
        if(this.nowNewId < this._config.unlock){
            this.lockNode.active = true;
            //this.node.off(cc.Node.EventType.TOUCH_END,this.onClickBuy,this);
            return;
        }
        
        if(this._lvNum > 0){
            this.itemSprite.node.active = true;
            if(this._lvNum == this.MAXLV){
                this.maxLVNode.active = true;
                
                return;
            }        
            this.priceLab.node.parent.active = true;
            this.priceLab.string = this._config["GoldLv" + this._lvNum];

        }else{
            this.lockNode.active = true;
        }
    }

    /** 初始化数据 */
    initData(){
        this._url = "Texture/" + "S" + this.nowSelChap + "/Elements/";
        if(this.id > 1000){
            this._config = csv.ChujvData.get(this.id);
            this._lvNum = UserInfo.getToolLevelData(this.id);
        }else{
            this._config = csv.ShicaiData.get(this.id);
            this._lvNum = UserInfo.getFoodLevelData(this.id);
        }

    }

    



    onDestroy()
    {
        // this.node.off(cc.Node.EventType.TOUCH_END,this.onClickBuy,this);
    }

    onClickBuy()
    {
        Device.playEffectURL("Audio/" + csv.ConfigData.sound_click_ui + ".mp3");
        if(this.lockNode.active){
            ViewManager.instance.show("UI/UIShopGoBuy",this.id,UIShopUp.instance.onShown.bind(UIShopUp.instance,UIShopUp.instance._callBack),this.lockNode.active);
            return;
        }
        ViewManager.instance.show("UI/UIShopGoBuy",this.id,UIShopUp.instance.onShown.bind(UIShopUp.instance,UIShopUp.instance._callBack));
    }

    start () {}
}