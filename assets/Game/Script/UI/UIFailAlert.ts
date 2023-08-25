import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import { MissionEndType } from "../Common/EnumConst";
import Food from "../Game/Food";
import Common from "../../../framework/plugin_boosts/utils/Common";
import View from "../../../framework/plugin_boosts/ui/View";
import StatHepler from "../Common/StatHelper";
import Sit from "../Game/Sit";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIFailAlert extends cc.Component {

    @property(cc.Node)
    pointer:cc.Node = null;

    @property(cc.Label)
    msgLabel:cc.Label = null;

    @property(cc.Widget)
    maskWidget:cc.Widget = null;


    onLoad()
    {
        this.node.on(cc.Node.EventType.TOUCH_END,  this.onClick,this)
    }

    onDestroy()
    {
        this.node.off(cc.Node.EventType.TOUCH_END,this.onClick,this);
    }

    start () {

    }

    onShown(endType:MissionEndType , foodOrCustomer:Food | Sit)
    {
        StatHepler.level_end_event =  MissionEndType[endType]

        let d = csv.FailData.get(endType)
        this.msgLabel.string = csv.Text.get(d.Tip).text;
        this.pointer.active = false
        this.scheduleOnce(_=>{
            /**
             * 只有下一帧 才能获取到正确的节点坐标
             */
            let point = Common.getPositionToNodeSpaceAR(foodOrCustomer.node,this.node,cc.v2(0,0.5))
            this.pointer.position = point;
            this.pointer.active = true;
            this.maskWidget.updateAlignment();
        })
    }

    onClick()
    {
        this.getComponent(View).hide();
        event.emit("Click_Fail_Alert")
    }

}
