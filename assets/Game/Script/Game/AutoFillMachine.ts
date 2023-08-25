import { FoodType, ToolType } from "../Common/CSVEnum";
import { root } from "./GameRoot";
import Plate from "./Plate";
import FSM from "../../../framework/plugin_boosts/components/FSM";
import ProgressTimer from "../Component/ProgressTimer";
import ChujvBase from "./ChujvBase";
import Device from "../../../framework/plugin_boosts/misc/Device";
import { R } from "./GameRes";

const {ccclass, property} = cc._decorator;

enum State {
    Working,
    Stop
}

@ccclass
export default class AutoFillMachine extends ChujvBase {

    food_id:FoodType = 0;
    
    @property({type:cc.Enum(ToolType)})
    tool_id:ToolType = 0;
    
    cook_time:number = 0;

    level:number = 1

    fsm:FSM

    plateTobeFill:Plate = null;

    @property(ProgressTimer)
    timer:ProgressTimer = null;

    tool_data:csv.ChujvData_Row = null;

    onLoad () {
        this.fsm = this.addComponent(FSM)
        this.fsm.init(this);
        this.fsm.addStates(State);
        this.fsm.enterState(State.Stop);

        this.tool_data = csv.ChujvData.get(this.tool_id)
        this.food_id = this.tool_data.ShicaiID;
        
    }

    getFood() {
    }

    
    start () {
        // 默认不装满 
        // this.fillAll();
    }

    fillAll()
    {
        let plates = root.getList(Plate).filter(v=>v.tool_id == this.tool_id && v.isEmpty())
        plates.forEach(plate=>plate.addFoodByType(this.food_id))
    }

    //--------------------------------------state----------------------------------------//
    onEnter_WorkingState(state,plate){
        //start working 
        this.timer.node.active = true;
        this.plateTobeFill = plate;
        this.log("制作开始 = ",FoodType[this.food_id])
        let makeTime = this.tool_data["Time"+this.level]/1000
        this.cook_time = makeTime
        state.audio =  Device.playEffect(R.audio_drink_fill,true)
    }
    
    onExit_WorkingState(state){
        // this.plateTobeFill.addFoodByType(this.food_id);
        this.fillAll();
        this.log("制作 ok = " ,FoodType[this.food_id])
        Device.stopEffect(state.audio)
    }
    onUpdate_WorkingState(state,dt:number){
        //woking 
        this.timer.percent = Math.min(1, this.fsm.timeElapsed/this.cook_time);
        if(this.fsm.timeElapsed > this.cook_time){
            this.fsm.changeState(State.Stop);
        }
    }

    onEnter_StopState(state){
        this.timer.node.active = false;
    }
    
    onExit_StopState(state){

    }

    onUpdate_StopState(state,dt:number){
        let plate = root.getList(Plate).find(v=>v.tool_id == this.tool_id && v.isEmpty())
        if(plate){
            this.fsm.changeState(State.Working,plate);
        }
    }
    ///--------------------------------------state end----------------------------------------//


}