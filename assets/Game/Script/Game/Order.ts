import Food from "./Food";
import { root } from "./GameRoot";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Order extends cc.Component {

    _isFinish:boolean = false;
    
    food:Food = null;

    onLoad () {
        
    }

    start () {}

    isEmpty()
    {
        return this.food == null;
    }

    reset()
    {
        this.food = null;
        this.node.active = true;
        this._isFinish = false;
    }
    

    finish(){
        this.node.emit("onFinished",this)
        this._isFinish = true;
    }

    isFinish()
    {
        return this._isFinish;
    }

    //完成食物飞到订单的动画 
    onFinishedFly()
    {
        if(this.food){
            let foodNode = this.food.node
            let scale = cc.scaleTo(0.1,2)
            let scale2 = cc.scaleTo(0.1,1)
            let seq = cc.sequence(scale,scale2,cc.callFunc(_=>{
                this.node.emit("onFinishedFly",this,this.food)
            }))
            foodNode.runAction(seq)
        }
    }

}