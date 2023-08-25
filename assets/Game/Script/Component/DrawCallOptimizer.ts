import Common from "../../../framework/plugin_boosts/utils/Common";
import DrawCallReorder from "./DrawCallReorder";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";

const {ccclass, property} = cc._decorator;
export enum DCIndex {
    index0,
    index1,
    index2,
    index3,
    index4,
    index5,
    index6,
    index7,
    index8,
    index9,
}

let optimizers = {}

@ccclass
export default class DrawCallOptimizer extends cc.Component {
    @property([cc.Node])
    tobeOptimizeNodes:cc.Node[] =[]

    @property(cc.Node)
    newLayer:cc.Node = null;

    @property({type:cc.Enum(DCIndex)})
    orderId:DCIndex = DCIndex.index0;

    onLoad () {
        this.newLayer = this.newLayer || this.node;
        event.on("DC.optimize" , this.optimize,this)
        event.on("DC.optimizeAll" , this.optimizeAll,this)
        optimizers[this.orderId] = this;
    }

    static getOptimizer(orderId):DrawCallOptimizer
    {
        return optimizers[orderId]
    }

    onDestroy()
    {
        delete optimizers[this.orderId]
        event.off(this);
    }
    
    start () {
        this.tobeOptimizeNodes.forEach(v=>Common.changeParent(v,this.newLayer || this.node));
        this.optimizeAll();
    }

    optimize(reorders:DrawCallReorder[])
    {
        reorders.forEach(v=>{
            if(v.orderId == this.orderId)
                Common.changeParent(v.node,this.newLayer);
        })
    }

    optimizeAll()
    {
        let reorders = cc.director.getScene().getComponentsInChildren(DrawCallReorder)
        this.optimize(reorders)
    }

    optimizeTarget(node:cc.Node)
    {
        Common.changeParent(node,this.newLayer);
    }
    
}