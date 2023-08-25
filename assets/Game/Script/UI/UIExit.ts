import View from "../../../framework/plugin_boosts/ui/View";
import Util from "../Common/Util";
import { root } from "../Game/GameRoot";
import Device from "../../../framework/plugin_boosts/misc/Device";
import { UserInfo } from "../Common/UserInfo";
import Platform from "../../../framework/Platform";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIExit extends cc.Component {

    @property(cc.Label)
    titleLab:cc.Label = null;

    @property(cc.Node)
    soundEffectNode:cc.Node = null;

    @property(cc.Node)
    soundEffectNodeOff:cc.Node = null;

    @property(cc.Node)
    soundBgNode:cc.Node = null;

    @property(cc.Node)
    soundBgNodeOff:cc.Node = null;


    onLoad () {

    }

    start () {

    }

    private initView(){
        this.titleLab.node.parent.getComponent(cc.Widget).verticalCenter = 100;
        this.titleLab.string = csv.Text.get(csv.MissionData.get(UserInfo.playingLevel).text).text;

        if(Device.isSfxEnabled){
            this.soundEffectNode.active = true;
            this.soundEffectNodeOff.active = false;
        }else{
            this.soundEffectNode.active = false;
            this.soundEffectNodeOff.active = true;
        }

        if(Device.isBgmEnabled){
            this.soundBgNode.active = true;
            this.soundBgNodeOff.active = false;
        }else{
            this.soundBgNode.active = false;
            this.soundBgNodeOff.active = true;
        }
    }


    click_close(){
        this.getComponent(View).hide(); 
    }
    
    click_soundEffect()
    {
        Device.setSFXEnable(!Device.isSfxEnabled);
        UserInfo.soundEffectOn = Device.isSfxEnabled;
        UserInfo.save("soundEffectOn");
        this.initView();
    }

    click_soundBg()
    {
        // Device.setBGMEnable(!Device.isBgmEnabled);
        // UserInfo.soundBgOn = Device.isBgmEnabled;
        // UserInfo.save("soundBgOn");
        // this.initView(); 
        if(UserInfo.isOffBgm){
            Device.isBgmEnabled = true;
            Device.playMusic("Audio/" + csv.ConfigData.sound_music_2 + ".mp3");
            UserInfo.isOffBgm = false;
            UserInfo.soundBgOn = true;
            UserInfo.save("isOffBgm");
            UserInfo.save("soundBgOn");
            this.initView();   
        }else{
            Device.setBGMEnable(!Device.isBgmEnabled);
            UserInfo.soundBgOn = Device.isBgmEnabled;
            UserInfo.save("soundBgOn");
            cc.log("BGM:",UserInfo.soundBgOn)
            this.initView();   
        }
    }

    click_back()
    {
        // cc.director.resume();
        
        root.resume();
        Util.loadScene("Home")
    }

    click_continue()
    {
        // cc.director.resume();
        root.resume();
        this.getComponent(View).hide();
    }

    onShown()
    {
        // cc.director.pause()
        root.pause();

        this.initView();
        Platform.showBannerAd("set",this,true);
    }

    onDestroy(){
        Platform.hideBannerAd();
    }

    onHidden()
    {
        Platform.hideBannerAd();
    }
}