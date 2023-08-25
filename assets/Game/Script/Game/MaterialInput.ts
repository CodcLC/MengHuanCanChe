import { root } from "./GameRoot";
import BakeMachine from "./BakeMachine";
import { FoodType, ToolType } from "../Common/CSVEnum";
import Common from "../../../framework/plugin_boosts/utils/Common";
import Plate from "./Plate";
import Device from "../../../framework/plugin_boosts/misc/Device";

const {ccclass, property} = cc._decorator;


enum MaterialType{
    ["Bake_烤"] = 0,
    ["NoBake_不烤"] = 1,
}

@ccclass
export default class MaterialInput extends cc.Component {
    
    @property({type:cc.Enum(ToolType)})
    targetToolId:ToolType = 0;

    @property({type:cc.Enum(MaterialType)})
    materialType:MaterialType = 0;

    button:cc.Button = null;

    nextToolId:number = 0;

    onLoad () {
        this.button = Common.newButton(this.node,"MaterialInput","onClick")
        this.nextToolId = csv.ChujvData.get(this.targetToolId).NextChujv;
    }

    onDestroy()
    {
    }

    moveToBake()
    {
        let machines = root.getList(BakeMachine);
        let emptySlots = machines.filter(v=>v.isEmpty() && v.tool_id == (this.nextToolId ||this.targetToolId) )
        if(emptySlots.length > 0)
        {
            emptySlots.sort((a,b)=>b.index - a.index)
            let slot = emptySlots.pop()
            slot.addFood();
            return true;
        }return false
    }

    moveToPlate()
    {
        let plates = root.getList(Plate);
        plates = plates.filter(v=>v.isEmpty() &&  v.tool_id == this.nextToolId  )
        plates.sort((a,b)=>b.index - a.index)
        let plate = plates.pop();
        plate && plate.addFood();
    }

    onClick()
    {
        Device.playEffectURL("Audio/click_game")
        if(this.materialType == 0)
        {
            this.moveToBake();
        }else{
            this.moveToPlate();
        }
    }

    start () {

    }

}