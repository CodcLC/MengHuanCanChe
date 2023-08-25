import Order from "./Order";
import FSM from "../../../framework/plugin_boosts/components/FSM";
import NumTrigger from "../../../framework/plugin_boosts/misc/NumTrigger";
import Sit from "./Sit";
import { root } from "./GameRoot";
import Food from "./Food";
import Common from "../../../framework/plugin_boosts/utils/Common";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import { UserInfo } from "../Common/UserInfo";
import { ValueChangeAction } from "../../../framework/plugin_boosts/misc/BoostsAction";

const {ccclass, property} = cc._decorator;

export enum CustomerState
{
    None,
    Arriving,//
    Waiting ,//
    Leaving, //离开 
    Hidden,
}

const FINISHED = 1;
const UNFINISHED = 0;


@ccclass
export default class Customer extends cc.Component {

    sit:Sit = null;

    duration:number = 0;

    leftTime:number = 0;
    
    fsm:FSM = null;

    trigger:NumTrigger = new NumTrigger();

    @property()
    speed:number = 300; //100 - 500

    /**
     * 特殊顾客时间 不能丢失
     */
    @property
    is_special:boolean = false;

    @property
    skeleton:sp.Skeleton = null;

    mixTime:number = 0.2;
    
    onLoad()
    {
        this.skeleton = this.getComponentInChildren(sp.Skeleton);
        this.fsm = this.addComponent(FSM)
        this.fsm.init(this);
        this.fsm.addStates(CustomerState);
        this.fsm.enterState(CustomerState.None);
        this.trigger.add(2/3, 1   ,this.updateEmotion.bind(this,"smile"));
        this.trigger.add(1/3, 2/3 ,this.updateEmotion.bind(this,"normal")); 
        this.trigger.add(1/20,   1/3 ,this.updateEmotion.bind(this,"anger"));
        this.trigger.add(0,   1/20 ,this.updateEmotion.bind(this,"bottom"));

        this.skeleton.setMix("walk",  "idle_happy",this.mixTime);

    }

//--------------------------------------state begin----------------------------------------//
    onEnter_ArrivingState(state){
        this.skeleton.clearTracks()
        this.skeleton.node.scaleX = 1;
        this.skeleton.setAnimation(0,"idle_happy",true)
        this.skeleton.setAnimation(0,"walk",true);
    }
    onExit_ArrivingState(state){
        this.skeleton.setAnimation(0,"idle_happy",true);
    }
    onUpdate_ArrivingState(state,dt:number){
        
    }

    //离开 
    onEnter_LeavingState(state,finish_state){
        root.topUI.loseCustomer();
        //哪个方向离开 
        // let dest =  cc.winSize.width * g.getRandomInArray([-1,1])
        let dest =  cc.winSize.width
        let dist = dest - this.node.x ;
        let move = cc.moveTo(Math.abs(dist/this.speed),cc.v2(dest,0))
        this.skeleton.node.scaleX = -1;
        this.skeleton.addAnimation(1,"walk",true);
        let callback = cc.callFunc(_=>{
            this.fsm.changeState(CustomerState.Hidden);
        })
        this.node.runAction(cc.sequence(move,callback))
    }
    onExit_LeavingState(state){

    }
    onUpdate_LeavingState(state,dt:number){
        
    }

    onEnter_HiddenState(state){
        this.node.removeFromParent();
    }
    onExit_HiddenState(state){

    }
    onUpdate_HiddenState(state,dt:number){

    }

    _pauseLeftTimer:boolean = false

    pauseLoseLeftTime()
    {
        this._pauseLeftTimer = true
    }

    resumeLoseLeftTime()
    {
        this._pauseLeftTimer = false
    }
    
    onEnter_WaitingState(state){
        //读取下一个订单
        let order = root.nextOrderData()
        if(order == null){
            //没有订单可用
            this.log("level finished !")
            this.fsm.changeState(CustomerState.Leaving);
            return;
        }
        this.sit.resetOrderList();
        //生成订单节点
        if(order.ShicaiIDs.length <= 0)
        {
            this.error("空订单？？？？？？？？？？")
        }
        order.ShicaiIDs.forEach(v=>{
            let food = root.createFood(v)
            if(food)
                this.sit.addToOrder(food);
        })
        this.sit.set_like_position((order.WaitTime - order.GeizanTime)/order.WaitTime);
        //设置等等时间 
        
        this.duration = order.WaitTime/1000;
        this.leftTime = 1;
        //显示订单列表 和等待进度 
        this.sit.show();

    }

    onExit_WaitingState(state){
        //reset 
        this.sit.hide();
    }

    onUpdate_WaitingState(state,dt:number){

        if(!this.is_special && !this._pauseLeftTimer)
        {
            this.leftTime -= dt/this.duration;
            this.trigger.update(this.leftTime);
            this.sit.updateProgress(this.leftTime)
        }
        if(this.leftTime <= 0)
        {
            this.fsm.changeState(CustomerState.Leaving,UNFINISHED);
            
        }else{
            if (this.sit.checkAllFinished()){
                this.accepted();
                this.sit.customer = null;
            }
        }
    }
    
    //--------------------------------------state end----------------------------------------//

    addLeftTime(t:number)
    {
        let o = this.leftTime;
        this.leftTime += t;
        this.leftTime = Math.min(1,this.leftTime);
        let valueAction  = new ValueChangeAction(0.5,o,this.leftTime,v=>{
            this.sit.updateProgress(v);
            this.trigger.reset();
        });
        this.node.runAction(cc.sequence(valueAction,cc.callFunc(this.trigger.reset,this.trigger)))
        // this.trigger.reset();
    }

    //选择目标坐下
    startShopping()
    {
        let sits = root.getList(Sit).filter(v=>v.isEmpty())
        if(sits.length == 0) {
            this.log("no sit found!")
            this.node.removeFromParent();
            return ;
        }
        let sit = g.getRandomInArray(sits) as Sit;
        this.fsm.changeState(CustomerState.Arriving);
        let relpos = Common.getRelatePosition(sit.node,this.node,cc.v2(0,0));
        let dist = relpos.x - this.node.x;
        let move = cc.moveTo(Math.abs(dist/this.speed), cc.v2(relpos.x,0))
        this.setSit(sit);
        this.node.runAction(cc.sequence(move,cc.callFunc(_=>{
            this.startWait();
        })))
    }

    setSit(sit:Sit)
    {
        this.sit = sit;
        sit.customer = this;
    }

    startWait()
    {
        event.emit("CustomerWait",this.sit);
        this.fsm.changeState(CustomerState.Waiting);
    }

    accepted()
    {
        UserInfo.addData("daily_customer",1)
        UserInfo.addData("total_customer",1)
        //完成订单后退出
        this.fsm.changeState(CustomerState.Leaving,FINISHED)
    }

    updateEmotion(name)
    {
        this.warn("i am " + name)
        if(name == "smile")
        {
            this.sit.setProgressStyle("Texture/UI/Green")
            this.skeleton.setAnimation(0,"idle_happy",true)
        }else if (name == "normal")
        {
            this.sit.setProgressStyle("Texture/UI/Yellow")
            this.skeleton.setAnimation(0,"idle_common",true)
        }
        else if(name == "anger")
        {
            this.sit.setProgressStyle("Texture/UI/Red")
            this.skeleton.setAnimation(0,"idle_unhappy",true)
        }else if(name == "bottom")
        {
            event.emit("Angry",this);
            this.skeleton.setAnimation(0,"idle_angry",true)
        }
    }


    start () {

    }
}