import View from "../../../framework/plugin_boosts/ui/View";
import Util from "../Common/Util";
import { UserInfo ,LevelData} from "../Common/UserInfo";
import Common from "../../../framework/plugin_boosts/utils/Common";
import Plate from "../Game/Plate";
import Platform from "../../../framework/Platform";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import { Toast } from "../../../framework/plugin_boosts/ui/ToastManager";
import StatHepler, { EventType } from "../Common/StatHelper";
import { root } from "../Game/GameRoot";
import ViewManager from "../../../framework/plugin_boosts/ui/ViewManager";
import CConfig from "../GameLogic";


const {ccclass, property} = cc._decorator;

/**
 * 奖励界面
 */
@ccclass
export default class UIReAward extends cc.Component {

    private isShare = true;

    /** 增加的体力值 */
    private addPower:number;

    private _level:number;

    private _data:LevelData;

    @property(cc.Node)
    getAwardNode:cc.Node = null;

    @property(cc.Node)
    nodeGiveAward:cc.Node = null;

    @property(cc.Node)
    nodeBg:cc.Node = null;

    @property(cc.Label) 
    getLab:cc.Label = null;

    private _isBtnGray:boolean;

    onLoad(){
        

        this.addPower =  csv.ConfigData.perfect_clearance_diamond_reward;
        this.getLab.string = "体力+" + this.addPower;

    }

    onShown (level) {
        
        Platform.showBannerAd("award",this,true);

        this._level = level;
        this._data = UserInfo.getLevelData(this._level);

        this.initWay();
        

        if(!this.isShare){
            Common.setDisplay(this.getAwardNode.getComponent(cc.Sprite),"Texture/UI/DefineBtn");
            let icon = this.getAwardNode.getChildByName("icon");
            icon.active = true;
            Common.setDisplay(icon.getComponent(cc.Sprite),"Texture/UI/TV_icon");
            this.getAwardNode.getChildByName("lab").getComponent(cc.Label).string = "领取奖励";
        }else{
            Common.setDisplay(this.getAwardNode.getComponent(cc.Sprite),"Texture/UI/DefineBtn");
            let icon = this.getAwardNode.getChildByName("icon");
            icon.active = true;
            Common.setDisplay(icon.getComponent(cc.Sprite),"Texture/UI/Share_icon");
            this.getAwardNode.getChildByName("lab").getComponent(cc.Label).string = "领取奖励";
        }

        // this.nodeBg.y = -40;
        // this.scheduleOnce(_=>{
        //     this.nodeBg.y = 40;
        // },1.5);
        this.nodeBg.y = 70;
        this.nodeGiveAward.y = -150;
    }


    initWay(){
        let list = Util.judgeBtnType("get_3star_life");
        if(list != null){
            list[0] == "share" ? (this.isShare = true) : (this.isShare = false);
            
            this.getAwardNode.getComponent(cc.Button).interactable = true;
        }
    }

    start () {

    }

    click_close(){
        if(root) ViewManager.instance.show("UI/UIThrough");
        this.getComponent(View).hide(); 
    }

    /** 分享获得体力 */
    click_share(){
        let f = ()=>{
            if(!this.isValid) return;
            UserInfo.addData("power",this.addPower);
            Toast.make("获得" + this.addPower + "点体力");
            this._data.isGetAdward3Star = 1;
            StatHepler.doLevelEvent(EventType.award,"三星过关奖励",1,2,1)
            StatHepler.userAction("三星过关奖励","power", this.addPower);
            event.emit("onRefreshMap",this._level);
            UserInfo.save();
            this.getComponent(View).hide(); 
        };
        if(!this.isShare){
            Platform.watch_video(Util.shareConfigs["get_3star_life"],()=>{
                UserInfo.addData("dayVideoTime",1,true);
                f();
            },this);
            return;
        }
        Platform.doShare(Util.shareConfigs["get_3star_life"],()=>{
            //UserInfo.addData("dayShareTime",1,true);
            f();          
        },this);
    }
    
    onHidden()
    {
        event.emit("LevelWin")
        Platform.hideBannerAd();
    }

}
