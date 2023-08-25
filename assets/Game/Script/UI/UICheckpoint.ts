import View from "../../../framework/plugin_boosts/ui/View";
import Util from "../Common/Util";
import { UserInfo ,LevelData} from "../Common/UserInfo";
import Common from "../../../framework/plugin_boosts/utils/Common";
import ViewManager from "../../../framework/plugin_boosts/ui/ViewManager";
import { Toast } from "../../../framework/plugin_boosts/ui/ToastManager";
import Platform from "../../../framework/Platform";
import Device from "../../../framework/plugin_boosts/misc/Device";
const {ccclass, property} = cc._decorator;
import { event } from "../../../framework/plugin_boosts/utils/EventManager";

/**
 * 开始 界面
 */
@ccclass
export default class UICheckpoint extends cc.Component {
    @property(cc.Label)
    titleLabel:cc.Label = null;
    @property(cc.Label)
    targetLabel:cc.Label = null;
    @property(cc.Label)
    targetType:cc.Label = null;

    @property(cc.Sprite)
    icon:cc.Sprite = null;

    @property(cc.Sprite)
    mission2Icon:cc.Sprite = null;

    @property([cc.Node])
    star_light:cc.Node[] = []

    @property(cc.Button)
    btn_start:cc.Button = null;

    @property(cc.Button)
    btn_ShareStart:cc.Button = null;

    private _level:number;

    private _isShare:boolean = false;

    onLoad(){
        
    }

    start () {

    }

    onShown (level) {
        this._level = level;
        let mission = csv.MissionData.get(level);
        //let lvNum = mission.desc.split("_")[1];
        let title = csv.Text.get(mission.text).text;
        this.titleLabel.string = title;
        this.targetLabel.string = mission.MissionStar1.toString();


        let res_dta = csv.PlayerRes.get(mission.MissionObj1);
        Common.setDisplay(this.icon,"Texture/UI/" + res_dta.image);

        this.initMission2();
        
        this.initBtn();

        let data= UserInfo.getLevelData(level);
        this.star_light.forEach((v,i)=>{
            if(i >= data.star){
                v.active = false;
            } else {
                v.active = true;
            }
        })

        
    }

    /** 初始化任务2显示 */
    private initMission2(){
        let mission = csv.MissionData.get(this._level);
        let target2 = mission.MissionObj2;
        /** 3烤糊 4生气 */
        if(target2 == 3){
            this.mission2Icon.node.active = true;
            Common.setDisplay(this.mission2Icon,"Texture/UI/No_Icon2");
        }else if(target2 == 4){
            this.mission2Icon.node.active = true;
            Common.setDisplay(this.mission2Icon,"Texture/UI/No_Icon3");
        }else if(target2 == 5){
            this.mission2Icon.node.active = true;
            Common.setDisplay(this.mission2Icon,"Texture/UI/No_Icon1");
        }else{
            this.mission2Icon.node.active = false;
        }
    }

    /** 初始化按钮显示 */
    private initBtn(){
        let data= UserInfo.getLevelData(this._level);
  
        if( data.star == 3){
            this.btn_start.node.active = false;
        } else {
            if(UserInfo.power <= 0){
                this.btn_start.node.active = false;
            }else{
                this.btn_start.node.active = true;
            }
        }

        let btnConfirg = Util.judgeBtnType("play_free");
        this._isShare = btnConfirg[0] == "share";
        //this.btn_ShareStart.interactable = !btnConfirg[1];
        if(this._isShare){
            Common.setDisplay(this.btn_ShareStart.node.getChildByName("Share_icon").getComponent(cc.Sprite),"Texture/UI/Share_icon");
        }else{
            Common.setDisplay(this.btn_ShareStart.node.getChildByName("Share_icon").getComponent(cc.Sprite),"Texture/UI/TV_icon");
        }
    }


    click_close(){
        this.getComponent(View).hide();
    }
    click_start(){
        if(!Util.isLogin){return event.emit("UNLOGIN") }
        
        UserInfo.playingLevel = this._level;  
        UserInfo.isCoinDouble = false;
        if(UserInfo.power <= 0){
            Toast.make("体力不足");
            return;
        }
        UserInfo.addData("power",-1);
        UserInfo.save("power");
        if(UserInfo.power < (UserInfo.powerAddLimit + csv.ConfigData.live_limit)){   
                event.emit("powerUsed");
        }
        Util.loadScene("S"+UserInfo.chapter);

        if(!UserInfo.isOffBgm)
        {
            Device.playMusic("Audio/" + csv.ConfigData.sound_music_2 + ".mp3");
        }
        
        this.log("start level")
    }

    /** 分享不耗体力开始 */
    click_shareStart(){
        if(!Util.isLogin){return event.emit("UNLOGIN") }

        if(this._isShare){
            Platform.doShare(Util.shareConfigs["play_free"],()=>{
                UserInfo.playingLevel = this._level;  
                UserInfo.isCoinDouble = true;
                //UserInfo.addData("dayShareTime",1,true);
                Util.loadScene("S"+UserInfo.chapter);
                
                if(!UserInfo.isOffBgm)
                {
                    Device.playMusic("Audio/" + csv.ConfigData.sound_music_2 + ".mp3");
                }
                
            },this)
        }else{
            Platform.watch_video(Util.shareConfigs["play_free"],()=>{
                UserInfo.playingLevel = this._level;  
                UserInfo.isCoinDouble = true;
     
                Util.loadScene("S"+UserInfo.chapter);

                if(!UserInfo.isOffBgm)
                {
                    Device.playMusic("Audio/" + csv.ConfigData.sound_music_2 + ".mp3");
                }
            },this)
        }
        

        
    }
}
