import ViewManager from "../../../framework/plugin_boosts/ui/ViewManager";
import { root } from "./GameRoot";
import Plate from "./Plate";
import BakeMachine from "./BakeMachine";
import AutoFillMachine from "./AutoFillMachine";
import Device from "../../../framework/plugin_boosts/misc/Device";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UpgradeButton extends cc.Component {
    tool_id:number = 0;

    onLoad () {

    }

    start () {
        
    }

    onClick()
    {
        Device.playEffectURL("Audio/click_ui")
        ViewManager.instance.show("UI/UIShopGoBuy",this.tool_id,function(newlv){
            // 刷新盘子
            root.updateAllTools();
        })
    }

}