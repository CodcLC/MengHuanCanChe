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
 * banner广告物
 */
@ccclass
export default class BannerItem extends cc.Component {
    
    @property(cc.Sprite)
    sprIcon:cc.Sprite = null;

    @property(cc.Label)
    labName:cc.Label = null;

    onLoad () {
        // this.labName["_sgNode"].enableBold(true);
    }

    private data:BannerData;

  

    init(data:BannerData){
        this.data = data;

        Common.setDisplay(this.sprIcon,data.banner_icon);
        
        this.labName.string = data.banner_name;

        this.node.on(cc.Node.EventType.TOUCH_END,this.onNavigateTo,this);
    }
   
    /** 按下跳转 */
    onNavigateTo(){
        if(cc.sys.platform == cc.sys.WECHAT_GAME){
            wx.navigateToMiniProgram({appId:this.data.banner_appid,path:this.data.banner_path});
        }
    }


    onDestroy()
    {
        
    }


    start () {}
}

interface BannerData{
    banner_icon?:string,
    banner_name?:string,
    banner_appid?:string,
    banner_path?:string
}