import Customer from "./Customer";
import Order from "./Order";
import { root } from "./GameRoot";
import Food from "./Food";
import Common from "../../../framework/plugin_boosts/utils/Common";
import PsSpawner from "../../../framework/plugin_boosts/components/PsSpawner";
import { MissionType } from "../Common/EnumConst";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Sit extends cc.Component {

    orderList:Order[] = [];

    customer:Customer = null;

    @property(cc.ProgressBar)
    emotionProgress:cc.ProgressBar = null;

    @property(cc.Sprite)
    emotionSprite:cc.Sprite = null;

    @property([cc.Node])
    slot_foods:cc.Node[] = [];

    psSpanwer:PsSpawner = null;

    @property(cc.Node)
    node_like:cc.Node = null;

    progress_height:number = 0;

    like_pos_percent = 0;


    set_like_position(v)
    {
        this.node_like.active = root.missionType == MissionType.Like
        this.node_like.y = v * this.progress_height ;
        this.like_pos_percent = v;
        
    }

    onLoad () {
        this.node.active = false;
        this.psSpanwer = this.addComponent(PsSpawner);
        this.progress_height = this.emotionSprite.node.height;
    }

    start () {
        
    }

    show()
    {
        this.emotionProgress.progress = 1;
        this.node.active = true;
        this.slot_foods.forEach(v=>{
            let order = v.getOrAddComponent(Order)
            v.active = !order.isEmpty();
        })
        this.setProgressStyle("Texture/UI/Green")
    }

    hide()
    {
        this.node.active = false;
        //hide its order 
        if(this.node_like.active)
        {
            root.topUI.play_getLike(this.node_like);
        }
        this.reset();
    }

    setProgressStyle(path)
    {
        // this.emotionProgress.s
        let sp = this.emotionProgress.getComponent(cc.Sprite)
        Common.setDisplay(sp,path)
    }

    /**
     * 
     * @param p 
     */
    updateProgress(p)
    {
        this.emotionProgress.progress = p
        if(p < this.like_pos_percent){
            // lose like
            this.node_like.active = false;
        }else{
            if(root.missionType == MissionType.Like)
                this.node_like.active = true;
        }
    }




    addToOrder(food:Food){
        let i = this.orderList.length
        let order = this.slot_foods[i].getOrAddComponent(Order)
        order.food = food;
        food.node.parent = order.node;
        cc.log("food.food_id：" + food.food_id);

        switch (food.food_id) {
            case 201: // 鱿鱼
            case 203: // 大阪烧
            case 205: // 刨冰
            case 305: // 热狗
                order.node.setScale(0.6, 0.6);
                break;
            case 301: // 鱼盒
                order.node.setScale(0.72, 0.72);
                break;
            case 308: // 可乐
                order.node.setScale(0.54, 0.54);
                break;
            case 309: // 薯条
                order.node.setScale(0.54, 0.54);
                break;
            case 401: // 牛排
                order.node.setScale(0.6, 0.6);
                break;
            case 404: // 意面
                order.node.setScale(0.7, 0.7);
                break;
            case 407: // 果汁
                order.node.setScale(0.44, 0.44);
                break;   
            case 408: // 蛋糕
                order.node.setScale(0.75, 0.75);
                break;
            default:
                order.node.setScale(0.52, 0.52); 
                break;
        }
        this.orderList.push(order);
        order.node.on("onFinished",this.onOrderFinished,this);
        order.node.on("onFinishedFly",this.onOrderFinishedFly,this);
    }

    isEmpty()
    {
        return this.customer == null;
    }

    resetOrderList()
    {
        this.slot_foods.forEach(v=>{
            let order = v.getOrAddComponent(Order)
            if(!order.isEmpty()){
                root.recycle(order.food.node);
            }
            order.reset();
        })
        this.orderList.splice(0);
    }

    reset()
    {
        this.resetOrderList();
        if(this.customer && this.customer.fsm)
            this.warn("reset sit !",this.customer.fsm.c.name)
        this.customer = null;
    }
    // checkOrdersFinished()
    // {
    //     return this.orderList.length == 0;
    // }

    onOrderFinishedFly(order:Order,food:Food)
    {
        //获取订单节点相对于座位节点的位置
        let pos = Common.getPositionToNodeSpaceAR(food.node,this.node);
        food.node.active = false;
        event.emit("TransactionSuccess",food)
        if(root.missionType == MissionType.Gold||root.missionType == MissionType.Plate){
            root.topUI.play_getCoin(food);
        }else{
            //其它关卡（点赞 ）直接 给金币
            root.topUI.invalidate();
        }
        //恢复努气 
        this.customer.addLeftTime(csv.ConfigData.anger_recover/ 10000)
        this.psSpanwer.play("Prefab/anim/order_complete",pos).then(_=>{
            order.node.active = false
            //move gold to 
        })
    }

    //检测所有 订单和动画 全部完成
    checkAllFinished()
    {
        return this.orderList.length == 0 && this.slot_foods.every(v=>v.active == false)
    }

    onOrderFinished(order:Order)
    {
        //remove this order    // this.customer.
        this.orderList = this.orderList.filter(v=>v!=order)
        this.log("完成订单")
    }

}