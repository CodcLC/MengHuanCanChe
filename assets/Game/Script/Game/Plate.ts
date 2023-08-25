import Food, { FoodState } from "./Food";
import { root } from "./GameRoot";
import Customer from "./Customer";
import DoubleClick from "../Component/DoubleClick";
import { FoodType, ToolType } from "../Common/CSVEnum";
import Common from "../../../framework/plugin_boosts/utils/Common";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import Locker from "../../../framework/plugin_boosts/misc/Locker";
import { R } from "./GameRes";
import DrawCallOptimizer, { DCIndex } from "../Component/DrawCallOptimizer";
import UpgradeButton from "./UpgradeButton";
import ChujvBase from "./ChujvBase";
import Device from "../../../framework/plugin_boosts/misc/Device";
import AutoFillMachine from "./AutoFillMachine";
import { MissionSpecialType } from "../Common/EnumConst";

const { ccclass, property } = cc._decorator;
enum PlateState {
    Empty,
    Food_To_Plate,
    Food_Ready,
}

enum Index {
    None,
    index_1,
    index_2,
    index_3,
    index_4,
    index_5,
    index_6,
}

@ccclass
export default class Plate extends ChujvBase {

    food: Food = null;

    @property({ type: cc.Enum(Index) })
    index: number = Index.None;

    @property({ type: cc.Enum(ToolType) })
    tool_id: ToolType = 0;

    @property
    invisible_plate: boolean = false;

    @property
    isLocked: boolean = false;

    button: cc.Button = null;

    state: PlateState = PlateState.Empty;

    food_id: number = 0;

    food_qianzhi_id: number = 0;

    upgradeNode: cc.Node = null;

    @property(cc.Node)
    slot: cc.Node = null;

    onLoad() {
        this.button = Common.newButton(this.node, "Plate", "onClick");
        this.food_id = csv.ChujvData.get(this.tool_id).ShicaiID
        this.food_qianzhi_id = csv.ShicaiData.get(this.food_id).QianZhiID;

        this.init();

        this.slot = this.node.getChildByName("slot")
    }

    onDestroy() {

    }

    getFood() {
        return this.food;
    }

    start() {
        if (this.invisible_plate) {
            this.getComponent(cc.Sprite).enabled = false;
            this.button.interactable = false;
        }
    }

    isEmpty() {
        return !this.food && !this.isLocked;
    }

    removeFood() {
        this.food.node.off("onChanged", this.onFoodChanged, this);
        this.food.ingredients.splice(0);
        this.state = PlateState.Empty;
        if (this.food.is_drink)
            this.getComponent(cc.Sprite).enabled = true;
        this.food = null;
        this.button.interactable = false;
    }


    // 上菜
    commitTask() {

        let customers = root.getCustomers();
        customers = customers.filter(v => v.sit.orderList.find(o => o.food.isSame(this.food)))
        if (customers.length > 1) {
            customers.sort((a, b) => {
                return a.leftTime - b.leftTime;
            })
        }
        let customer = customers.length > 0 && customers[0]
        let order = customer && customer.sit.orderList.find(o => o.food.isSame(this.food))
        if (order) {
            Common.changeParent(this.food.node, order.node)
            order.finish()

            // this.warn("上菜咯!" ,[this.food.food_id,...this.food.ingredients].map(v=>FoodType[v]).join("+"))
            let move = cc.moveTo(0.4, cc.Vec2.ZERO).easing(cc.easeSineInOut())
            // let seq = cc.sequence(move,cc.callFunc(order.onFinishedFly,order))
            let food = this.food;
            this.removeFood();
            //todo:阻止座位隐藏
            customer.pauseLoseLeftTime();
            let seq = cc.sequence(move, cc.callFunc(_ => {
                //
                customer.resumeLoseLeftTime();
                //动画
                root.recycle(food.node);
                order.onFinishedFly();
                //连击处理
                event.emit("onOrderFinish", order)
            }))
            food.node.runAction(seq)

            // Common.moveToOrigin(this.food.node,0.4);
        } else {
            // this.log("task not found ");
        }
    }

    onFoodChanged(food: Food) {
        this.checkNeedAuto()
    }

    addFood(food?: Food) {
        if (food == null) {
            // 通常从烤盘里过来
            return this.addFoodByType(this.food_id);
        }
        this.food = food;
        // food is ready to serve
        this.food.fsm.changeState(FoodState.Ready);
        food.node.on("onChanged", this.onFoodChanged, this);
        // if(root.auto_serve) this.commitTask();  
        this.button.interactable = true;
    }

    addFoodByType(food_id: FoodType) {
        let foodNode = root.getFoodById(food_id);
        foodNode.parent = this.node;
        if (this.slot) {
            foodNode.position = this.slot.position;
        } else {
            foodNode.position = cc.v2(0, 14)
        }
        this.food = foodNode.getComponent(Food);
        this.food.clearIngredients();
        if (this.food.is_drink) {
            this.getComponent(cc.Sprite).enabled = false;
        }
        this.food.fsm.changeState(FoodState.Ready);
        this.food.updateAvatar();
        this.button.interactable = true;
        this.state = PlateState.Food_Ready;
    }

    onClick() {
        //饮料机饮
        if (root.getList(AutoFillMachine).some(v => v.tool_id == this.tool_id))
            Device.playEffectURL("Audio/click_drink")
        else
            Device.playEffectURL("Audio/click_game")

        if (!this.isEmpty() && !this.isLocked) {
            if (this.food_qianzhi_id > 0) {
                //有前置 id ，要找能合成的食物所在的盘
                let plates = root.getList(Plate)
                plates.sort((a, b) => a.index - b.index)
                plates.some(v => {
                    if (v.food && v.food.mix(this.food_id)) {
                        root.recycle(this.food.node);
                        this.removeFood();
                        return true;
                    }
                    return false;
                })
            } else {
                //没有前置id ，提交
                this.commitTask()
            }
        } else {
            this.log("empty plate!")
        }
    }

    onDoubleClick() {
        if (root.missionType2 == MissionSpecialType.DiscardNotAllowed) return;
        if (this.food && this.food.is_drink)
            return;
        if (this.food == null) return false;
        let canDiscard = this.food.fsm.isInState(FoodState.Ready)
        if (canDiscard) {
            root.dropFood(this.food)
            this.removeFood();
        }
    }

    moveFromBake(cookingFood: Food) {
        Common.changeParent(cookingFood.node, this.node);
        this.state = PlateState.Food_To_Plate
        let move = cc.moveTo(0.3, cc.v2(0, 10)).easing(cc.easeSineInOut())
        let seq = cc.sequence(move, cc.callFunc(_ => {
            this.state = PlateState.Food_Ready;
            this.checkNeedAuto();
        }))
        cookingFood.node.runAction(seq);
        this.addFood(cookingFood);
    }

    onEnable() {
        this.schedule(this.checkNeedAuto, 0.5)
    }

    onDisable() {
        this.unschedule(this.checkNeedAuto);
    }

    checkNeedAuto() {
        if (root.auto_serve && this.food && this.state == PlateState.Food_Ready) {
            //自动上菜 - 
            this.commitTask();
        }
    }



}