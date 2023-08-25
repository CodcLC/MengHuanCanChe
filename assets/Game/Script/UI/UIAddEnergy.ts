import View from "../../../framework/plugin_boosts/ui/View";
import Util from "../Common/Util";
import { UserInfo ,LevelData} from "../Common/UserInfo";
import Common from "../../../framework/plugin_boosts/utils/Common";
import Plate from "../Game/Plate";
import Platform from "../../../framework/Platform";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import { Toast } from "../../../framework/plugin_boosts/ui/ToastManager";
import StatHepler from "../Common/StatHelper";
import LocalTimeSystem from "../Common/LocalTimeSystem";

const {ccclass, property} = cc._decorator;

/**
 * 增加资源界面(体力)
 */
@ccclass
export default class UIObtain extends cc.Component {

  
    @property(cc.Label)
    videoBtnLab:cc.Label = null;

    @property(cc.Label)
    shareBtnLab:cc.Label = null;

    @property(cc.Label)
    tipLab:cc.Label = null;

    @property(cc.Label)
    shareLab:cc.Label = null;

    @property(cc.Button)
    shareBtn:cc.Button = null;

    @property(cc.Button)
    videoBtn:cc.Button = null;

    //leftTime:number = UserInfo.powerNeedTime;
    private _isFirst = false;
    


    
    onShown () {
        this.videoBtnLab.string = "体力+" + csv.ConfigData.reward_live_advertisement;
        this.shareBtnLab.string = "体力+" + csv.ConfigData.reward_live_share;

        this._isFirst = true;

        this.init();

    }


    private init(){
        if(UserInfo.power >= (UserInfo.powerAddLimit + csv.ConfigData.live_limit)){
            this.tipLab.string = csv.Text.get(csv.ConfigData.live_recovery_2).text;
            this.tipLab.node.children[0].active = false;
        }else{
            this.tipLab.node.children[0].active = true;
            // 回复时间
            this._isFirst && this.CountDown();
            this._isFirst = false;
            this.schedule(this.CountDown,1);
            
        }

        let shareLabNum = UserInfo.dayShareTime >= csv.ConfigData.reward_total_limit ? csv.ConfigData.reward_total_limit : UserInfo.dayShareTime;
        this.shareLab.string = "每日：" + shareLabNum + "/" + csv.ConfigData.reward_total_limit;
        if(UserInfo.dayShareTime >= csv.ConfigData.reward_total_limit){
            this.shareBtn.interactable = false;
        }else{
            this.shareBtn.interactable = true;
        }

        // 视频上限
        if(UserInfo.dayVideoTime >= csv.ConfigData.reward_total_limit_advertisement){
            this.videoBtn.interactable = false;
        }else{
            this.videoBtn.interactable = true;
        }
    }

     CountDown() {

        
        let leftTime = UserInfo.powerRecoverTime - LocalTimeSystem.getSec()*1e3 + 1e3;
        cc.log("UIAddEnergy TimerTick",leftTime/1000);
        if(leftTime < 0){
            this.unschedule(this.CountDown);
 
            // cc.log("end countdown",UserInfo.power);
            // UserInfo.addData("power",1,true);
    
            // if( UserInfo.power < csv.ConfigData.live_limit ){
            //     let coverTime = csv.ConfigData.live_recovery_time < 1000 ? csv.ConfigData.live_recovery_time*1000 : csv.ConfigData.live_recovery_time;
            //     UserInfo.powerRecoverTime = coverTime + LocalTimeSystem.getSec()*1e3;
            // }else{
            //     UserInfo.powerRecoverTime = 0;
            // }
  
            this.init();
            return;
        }


        let minutes = Math.floor((leftTime/1000) / 60);
        let seconds = Math.floor((leftTime/1000) % 60);
        let lab = minutes + ":" + seconds ;
        if(seconds < 10){
            lab = minutes +":0" + seconds ;
        }
        let afterLab = csv.Text.get(csv.ConfigData.live_recovery_1).text;
        if(this.tipLab){
            this.tipLab.string = lab + "后" + afterLab;
        }

    }

        
    

    start () {

    }

    onShareGet(){
        Platform.doShare(Util.shareConfigs["get_life"],()=>{
            StatHepler.userAction("分享增加体力");
            UserInfo.addData("power",csv.ConfigData.reward_live_share,true);
            UserInfo.addData("dayShareTime",1,true);
            this.init();
        },this);
    }

    onVideoGet(){
        // Toast.make("暂无视频")
        Platform.watch_video(Util.shareConfigs["get_life"],()=>{
            StatHepler.userAction("观看视频增加体力");
            UserInfo.addData("power",csv.ConfigData.reward_live_advertisement,true);
            UserInfo.addData("dayVideoTime",1,true);
            this.init();  
        },this);
    }

    click_close(){
        event.off("timerPowerAdd");
        this.getComponent(View).hide(); 
        this.unschedule(this.CountDown)
    }

    private onLeftBtn(){

    }

}
