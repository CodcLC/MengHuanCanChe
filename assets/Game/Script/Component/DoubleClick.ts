const {ccclass, property} = cc._decorator;
const DOUBLECLICK_TIMEOUT = 300;
@ccclass
export default class DoubleClick extends cc.Component {
    _lastClickedTime:number = 0;

    onLoad () {
        this.node.on(cc.Node.EventType.TOUCH_END,this.onClick,this);
    }

    onDestroy()
    {
        this.node.off(cc.Node.EventType.TOUCH_END,this.onClick,this);
    }

    onClick()
    {
        //double click 
        let now = Date.now()
        let offset = now - this._lastClickedTime;
        if(offset < DOUBLECLICK_TIMEOUT){
            this.getComponents(cc.Component).forEach(v=>{
                let func = v['onDoubleClick'] as Function
                if(func)
                {
                    func.call(v);
                }
            })
        }
        this._lastClickedTime = now;
    }

    start () {}
}