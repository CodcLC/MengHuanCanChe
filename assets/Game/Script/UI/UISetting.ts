import View from "../../../framework/plugin_boosts/ui/View";
import { UserInfo } from "../Common/UserInfo";
import Device from "../../../framework/plugin_boosts/misc/Device";
import { Toast } from "../../../framework/plugin_boosts/ui/ToastManager";
import Platform from "../../../framework/Platform";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UISetting extends cc.Component {


    @property(cc.Node)
    soundEffectNode:cc.Node = null;

    @property(cc.Node)
    soundBgNode:cc.Node = null;

    @property(cc.Node)
    soundEffectNodeOff:cc.Node = null;

    @property(cc.Node)
    soundBgNodeOff:cc.Node = null;

    @property(cc.Label)
    labUID:cc.Label = null;

    @property(cc.Button)
    btnCopyUid:cc.Button = null;

    onLoad(){
        
    }

    onShown(){
        Platform.showBannerAd("set",this,true);
        this.initView();
    }


    /** 初始化显示 */
    private initView(){
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

        this.labUID.string = "UID:" + UserInfo.userId;

    }

    start () {
        
    }

    click_close(){
        this.getComponent(View).hide(); 
    }
    
    click_soundEffect()
    {
        Device.setSFXEnable(!Device.isSfxEnabled);
        UserInfo.soundEffectOn = Device.isSfxEnabled;
        UserInfo.save("soundEffectOn");
        cc.log("EFFECT:",UserInfo.soundEffectOn)
        this.initView();
    }

    click_soundBg()
    {
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

    click_copyUid(){
        if(cc.sys.platform == cc.sys.WECHAT_GAME){
            wx.setClipboardData({
                data:UserInfo.userId,
                success:() =>{
                    Toast.make("复制成功");
                },

                fail:()=>{
                    Toast.make("复制失败，请重试");
                },

                complete :()=> {
                },
            })
        }
    }

    click_kefu(){
        
    }

    onHidden()
    {
        Platform.hideBannerAd();
    }

}
