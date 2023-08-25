import { ToolType } from "../Common/CSVEnum";
import Common from "../../../framework/plugin_boosts/utils/Common";
import { root } from "./GameRoot";
import Plate from "./Plate";
import Device from "../../../framework/plugin_boosts/misc/Device";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PlateAgent extends cc.Component {

    @property({type:cc.Enum(ToolType)})
    tool_id:ToolType = 0;

    onLoad () {
        Common.newButton(this.node,"PlateAgent", "onClick")    
    }
    start () {}
    
    onClick(node)
    {
        Device.playEffectURL("Audio/click_game")
        let plates = root.getList(Plate).filter(v=>v.tool_id == this.tool_id && v.food );
        let plate = plates.pop()
        plate && plate.onClick();
    }

}