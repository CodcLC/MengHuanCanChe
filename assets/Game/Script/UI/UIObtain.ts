import View from "../../../framework/plugin_boosts/ui/View";
import Util from "../Common/Util";
import { UserInfo ,LevelData} from "../Common/UserInfo";
import Common from "../../../framework/plugin_boosts/utils/Common";
import Plate from "../Game/Plate";
import Platform from "../../../framework/Platform";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import { Toast } from "../../../framework/plugin_boosts/ui/ToastManager";
import Device from "../../../framework/plugin_boosts/misc/Device";
import StatHepler from "../Common/StatHelper";
import ViewManager from "../../../framework/plugin_boosts/ui/ViewManager";
const {ccclass, property} = cc._decorator;

/**
 * 增加资源界面(金币，钻石)
 */
@ccclass
export default class UIObtain extends cc.Component {

    @property(cc.Sprite)
    titleCoins:cc.Sprite = null;

    @property(cc.Sprite)
    titleDiamonds:cc.Sprite = null;

    @property(cc.Label)
    leftTitleLab:cc.Label = null;

    @property(cc.Sprite)
    leftIcon:cc.Sprite = null;

    @property(cc.Label)
    leftBtnLab:cc.Label = null;

    @property(cc.Button)
    leftBtn:cc.Button = null;

    @property(cc.Sprite)
    rightIconUp:cc.Sprite = null;

    @property(cc.Sprite)
    rightIconDown:cc.Sprite = null;

    @property(cc.Button)
    rightBtn:cc.Button = null;

    @property(cc.Sprite)
    rightBtnIcon:cc.Sprite = null;

    @property(cc.Label)
    rightBtnLab:cc.Label = null;

    @property(cc.Label)
    shareLimitLab:cc.Label = null;

    @property(cc.Prefab)
    moneyParticle:cc.Prefab = null;

    private _data:any;

    private _getNum:number;

    private _soundURL:string;

    private _isBtnGray:boolean;

    onLoad(){
        
    }

    onShown (data) {

        this.rightBtn.node.off("touchend");
        this._data = data;
        switch(data.type){
            case "coin":{
                this.initCoinGet();
                break;
            }
            case "diamond":{
                this.initDiamondGet();
                break;
            }
        }
        this.rightBtn.interactable = true;

        let wayList = this.getWay();
        
        if(wayList != null){
            
            data.way = wayList[0];
            this.rightBtn.interactable = !(<boolean>wayList[1]);
        }

        switch(data.way){
            case "share":{
                this.rightBtn.node.on("touchend",this.onShareGet,this);
                this.initShareGet();
                
                break;
            }
            case "video":{
                this.rightBtn.node.on("touchend",this.onVideoGet,this);
                this.initVideoGet();
                
                break;
            }
        }

    }

    /** 获取分享还是看视频方式 */
    getWay(){
        let type = "default";
        if(this._data.type == "coin"){
            type = "get_coin";
        }else if(this._data.type == "diamond") {
            type = "get_diamond";
        }

        let wayList = Util.judgeBtnType(type);
        
        return wayList;
    }


    /** 初始化分享获得界面 */
    private initShareGet(){
        Common.setDisplay(this.rightBtnIcon,"Texture/UI/Share_icon");
        let num = 0;
        switch(this._data.type){
            case "coin":{
                num = csv.ConfigData.reward_coin_share;
                break;
            }
            case "diamond":{
                num = csv.ConfigData.reward_diamond_share;
                break;
            }
        }
        this.rightBtnLab.string = "分享到群+" + num;
        this._getNum = num;
        this.shareLimitLab.node.active = true;
        let shareLabNum = UserInfo.dayShareTime >= csv.ConfigData.reward_total_limit ? csv.ConfigData.reward_total_limit : UserInfo.dayShareTime;
        this.shareLimitLab.string = "每日上限(" + shareLabNum + "/" + csv.ConfigData.reward_total_limit + ")";
        if(UserInfo.dayShareTime >= csv.ConfigData.reward_total_limit){
            this.rightBtn.interactable = false;
            this.rightBtn.node.off("touchend");
        }else{
            this.rightBtn.interactable = true;
        }

        
    }

    /** 初始化看视频获得界面 */
    private initVideoGet(){
        Common.setDisplay(this.rightBtnIcon,"Texture/UI/TV_icon");
        let num = 0;
        switch(this._data.type){
            case "coin":{
                num = csv.ConfigData.reward_coin_advertisement;
                break;
            }
            case "diamond":{
                num = csv.ConfigData.reward_diamond_advertisement;
                break;
            }
        }
        this.rightBtnLab.string = "观看视频+" + num;
        this._getNum = num;
        this.shareLimitLab.node.active = false;

    }

    /** 初始化获得金币的界面 */
    private initCoinGet(){
        this._soundURL = "Audio/" + csv.ConfigData.sound_reward_coin + ".mp3";
        this.titleCoins.node.active = true; // 获得金币
        this.titleDiamonds.node.active = false;
        this.leftTitleLab.string = "精致金币包";
        // Common.setDisplay(this.leftIcon,"Texture/UI/bonus_gold"); 
        Common.setDisplay(this.rightIconUp,"Texture/UI/coin");
        Common.setDisplay(this.rightIconDown,"Texture/UI/coin");
        
    }

    /** 初始化获得钻石的界面 */
    private initDiamondGet(){
        this._soundURL = "Audio/" + csv.ConfigData.sound_reward_diamond + ".mp3";
        this.titleDiamonds.node.active = true; // 获得钻石
        this.titleCoins.node.active = false;
        this.leftTitleLab.string = "超多钻石";
        Common.setDisplay(this.leftIcon,"Texture/UI/chongzhi"); 
        Common.setDisplay(this.rightIconUp,"Texture/UI/DiamondIcon");
        Common.setDisplay(this.rightIconDown,"Texture/UI/DiamondIcon");
        
    }


    start () {

    }

    private onShareGet(){

        cc.log("Share");
        // let particleNode = cc.instantiate(this.moneyParticle);
        // let particleSprite = particleNode.getComponent(cc.ParticleSystem);
        // Common.setDisplay(particleSprite,"Texture/UI/coin");
        // this.rightIconDown.node.addChild(particleNode);
        // this.scheduleOnce(function(){
        //     if(particleNode){
        //         particleNode.destroy();
        //     }
        // }.bind(this),2);
        let shareConfig = Util.shareConfigs.default;
        if(this._data.type == "coin"){
            shareConfig = Util.shareConfigs.get_coin;
        }else if(this._data.type == "diamond") {
            shareConfig = Util.shareConfigs.get_diamond;
        }
        Platform.doShare(shareConfig,()=>{
            StatHepler.userAction("分享增加" + this._data.type);
            UserInfo.addData(this._data.type,Number(this._getNum),true);
            UserInfo.addData("dayShareTime",1,true);
            Device.playEffectURL(this._soundURL);
            ViewManager.instance.show("UI/UIGetMoney",this._data.type,Number(this._getNum));
            this.onShown(this._data);
        },this);
        
        this.click_close();
        
    }

    private onVideoGet(){
        let shareConfig = Util.shareConfigs.default;
        if(this._data.type == "coin"){
            shareConfig = Util.shareConfigs.get_coin;
        }else if(this._data.type == "diamond") {
            shareConfig = Util.shareConfigs.get_diamond;
        }
        Platform.watch_video(shareConfig,()=>{
            StatHepler.userAction("看视频增加"+ this._data.type);
            UserInfo.addData(this._data.type,Number(this._getNum),true);
            Device.playEffectURL(this._soundURL);
            UserInfo.addData("dayVideoTime",1,true);
            ViewManager.instance.show("UI/UIGetMoney",this._data.type,Number(this._getNum));
            this.onShown(this._data);
        },this);
       
        this.click_close();

    }

    click_close(){
        this.getComponent(View).hide(); 
    }
    private onLeftBtn(){

    }

}
