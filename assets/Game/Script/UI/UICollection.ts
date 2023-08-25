import View from "../../../framework/plugin_boosts/ui/View";
import { UserInfo } from "../Common/UserInfo";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import Home from "../Home";
import { Toast } from "../../../framework/plugin_boosts/ui/ToastManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UICollection extends cc.Component {

    start () {
        
        
    }

    onShown(){
        if(UserInfo.collectState != 1){
            UserInfo.collectState = 1;
            UserInfo.save();
        }
    }

    getAward(){
        // if(!UserInfo.isCollected){
        //     UserInfo.powerAddLimit = csv.ConfigData.live_limit_gain;
        //     UserInfo.isCollected = true;

        //     event.emit("UpdHomeView");

        //     UserInfo.addPowerLimit(csv.ConfigData.live_limit_gain_extra);
        //     Toast.make("恭喜获得体力与体力上限");
        //     UserInfo.save();
        // }
    }

    click_close(){
        //TODO: 后期改为小程序打开再给奖励
        //this.getAward();
        
        this.getComponent(View).hide();
    }
}
