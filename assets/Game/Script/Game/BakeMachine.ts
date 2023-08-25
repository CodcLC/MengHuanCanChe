import Food, { FoodState } from "./Food";
import { root } from "./GameRoot";
import Plate from "./Plate";
import DoubleClick from "../Component/DoubleClick";
import { FoodType, ToolType } from "../Common/CSVEnum";
import Common from "../../../framework/plugin_boosts/utils/Common";
import ProgressTimer from "../Component/ProgressTimer";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import { Toast } from "../../../framework/plugin_boosts/ui/ToastManager";
import { R } from "./GameRes";
import DrawCallReorder from "../Component/DrawCallReorder";
import DrawCallOptimizer, {  DCIndex } from "../Component/DrawCallOptimizer";
import ChujvBase from "./ChujvBase";
import UpgradeButton from "./UpgradeButton";
import { UserInfo } from "../Common/UserInfo";
import Device from "../../../framework/plugin_boosts/misc/Device";
import { MissionSpecialType } from "../Common/EnumConst";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BakeMachine extends ChujvBase  {

    @property(cc.Node)
    slot_food:cc.Node = null;

    @property(ProgressTimer)
    progress_timer:ProgressTimer = null;

    @property()
    auto_fill_all:boolean = false;

    // /**
    //  * 是否使用有特殊烘烤形象
    //  */
    // @property({type:cc.Prefab,tooltip:"使用有特殊烘烤形象"})
    // prefab_baking:cc.Prefab = null;

    cookingFood:Food = null;

    effects:{[index:string]:cc.Node} = {}

    getFood() {
        return this.cookingFood;
    }

    onLoad () {
        this.button = Common.newButton(this.node,"BakeMachine","onClick");
        this.init();
    }
    
    onDestroy()
    {
    }

    start () {
        this.progress_timer.node.active = false;
    }


    addFood()
    {
        let food :Food ;
        let foodNode;
        // if(this.prefab_baking){
        //     foodNode = cc.instantiate(this.prefab_baking);
        //     food = foodNode.getComponent(Food) 
        // }else{
        let food_id = this.tool_data.ShicaiID
        foodNode = root.getFoodById(food_id);
        food = foodNode.getComponent(Food) 
        // }
        food.reset();
        foodNode.parent = this.slot_food;
        foodNode.opacity = 255;
        foodNode.position = cc.Vec2.ZERO;
        foodNode.on("Cooked",this.onCooked,this);
        foodNode.on("StartCooking",this.onStartCooking,this);

        foodNode.on("Burnt",this.onBurnt,this);
        foodNode.on("BurntExit",this.onBurntExit,this);
        foodNode.on("Ready",this.onReady,this);
        foodNode.on("Cooking",this.onCooking,this)
        foodNode.on("Burning",this.onBurning,this)
        //todo check level 
        let makeTime = this.tool_data["Time"+this.level]/1000
        food.startCook(makeTime,this.tool_data.ShaohuTime/1000);
        this.cookingFood = food;
        this.progress_timer.setStyle(0);
    }

    playEffect(name){
        //yu
        let fx = this.effects[name]
        if(fx == null){
            fx = cc.instantiate(R["prefab_"+name]);
            fx.parent =  this.node;
            this.effects[name] = fx;
        }else{
            fx.active = true;
        }
    }

    stopEffect(name){
        let fx = this.effects[name]
        if(fx){
            fx.active = false;
        }
    }

    onStartCooking(){
        this.playEffect("cooking")
    }

    onBurntExit(){
        this.stopEffect("burnt")
    }

    removeFood()
    {
        if(this.cookingFood)
        {
            this.cookingFood.node.off("Cooked",this.onCooked,this)
            this.cookingFood.node.off("StartCooking",this.onStartCooking,this);
            this.cookingFood.node.off("Burnt",this.onBurnt,this)
            this.cookingFood.node.off("BurntExit",this.onBurntExit,this);
            this.cookingFood.node.off("Cooking",this.onCooking,this)
            this.cookingFood.node.off("Burning",this.onBurning,this)
            this.cookingFood.node.off("Ready",this.onReady,this)
        }
        // this.cookingFood.node.removeFromParent();
        // root.recycle(this.cookingFood.node);
        this.cookingFood = null;
        this.progress_timer.node.active = false;
        this.stopEffect("cooking")
        this.stopEffect("burnt")
    }

    onBurnt(food:Food)
    {
        this.progress_timer.node.active = false;
        this.playEffect("burnt")
    }

    onBurning(percent)
    {
        this.progress_timer.percent = percent;
    }

    onCooking(percent)
    {
        this.progress_timer.node.active = true;
        this.progress_timer.percent = percent;
    }

    onCooked(food:Food)
    {
        ///move to plate
        // this.cookingFood.updateAvatar();
        this.progress_timer.setStyle(1);
        this.stopEffect("cooking")
    }

    autoFill(){
        let plates = root.getList(Plate).filter(v=>v.tool_id == this.tool_id && v.isEmpty())
        // addFoodByType(this.food_id);
        plates.forEach(v=>{
            v.addFood();
            v.food.makeCooked();
        })
        if(plates.length == 0){
            this.log("没有盘子放了")
        }
        root.recycle(this.cookingFood.node);
        this.removeFood();
    }

    onReady(food:Food)
    {
        this.progress_timer.node.active = false;
        if(this.auto_fill_all)
        {
            // this.moveToPlate(true);
            this.autoFill();
        }
    }

    onClick()
    {
        Device.playEffectURL("Audio/click_game")
        if(this.cookingFood == null)
            this.addFood()
        else if(this.cookingFood.fsm.isInState(FoodState.Cooked))
        {
            this.moveToPlate();
        }

    }
    //装盘 
    moveToPlate()
    {
        // let BakeMachines = root.getList(); GuanlianID
        let plates = root.getList(Plate);
        let next_tool_id = csv.ChujvData.get(this.tool_id).NextChujv
        let food_data = csv.ShicaiData.get(this.cookingFood.food_id)
        let qianzi_id = food_data.QianZhiID;
        plates.sort((a,b)=>a.index-b.index)
        let fill = plates.some.bind(plates);
        fill(v=>{
            if(qianzi_id <= 0 && v.isEmpty() && v.tool_id == next_tool_id)
            {
                // v.moveFromBake(this.cookingFood)
                // this.removeFood();
                // return true;
                v.addFood();
                // if(this.prefab_baking)
                //     this.cookingFood.node.destroy();
                // else
                this.cookingFood.fsm.changeState(FoodState.Ready)
                root.recycle(this.cookingFood.node);
                this.removeFood();
                return true;
            }else if(qianzi_id > 0 && !v.isEmpty()){
                if(v.tool_id == next_tool_id && v.food && v.food.food_id == qianzi_id){
                    // this.log(v.food);
                    // v.moveFromBake(this.cookingFood)
                    if(v.food.addIngredient(this.cookingFood.food_id)){
                        this.cookingFood.fsm.changeState(FoodState.Ready)
                        root.recycle(this.cookingFood.node);
                        v.food.updateAvatar();
                        this.removeFood();
                        return true;
                    }
                }
            }
            return false;
        })
    }

    onDoubleClick()
    {
        //烤糊关卡不能双击
        if (root.missionType2 == MissionSpecialType.DiscardNotAllowed) return;
        if(this.cookingFood == null) return false;
        let canDiscard = this.cookingFood.fsm.isInState(FoodState.Burnt)
        if(canDiscard)
        {
            root.dropFood(this.cookingFood)
            this.removeFood();
        }
    }
}