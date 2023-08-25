import View from "../../../framework/plugin_boosts/ui/View";
import Util from "../Common/Util";
import { UserInfo ,LevelData} from "../Common/UserInfo";
import Common from "../../../framework/plugin_boosts/utils/Common";
import Plate from "../Game/Plate";
import Platform from "../../../framework/Platform";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import { Toast } from "../../../framework/plugin_boosts/ui/ToastManager";
import Device from "../../../framework/plugin_boosts/misc/Device";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    moneyNum: cc.Label = null;

    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.Prefab)
    moneyParticle:cc.Prefab = null;
    
    @property(cc.Prefab)
    coin:cc.Prefab = null;

    @property(cc.Prefab)
    diamond:cc.Prefab = null;

    @property(cc.Node)
    diamondPos:cc.Node = null;

    @property(cc.Node)
    coinPos:cc.Node = null;

    private _callFunc:Function;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        
    }

    initView(type:string,num:number){
        
        if(type ==="diamond"){
            cc.log("diamond");
            this.moneyNum.string = "+" + num;
            Common.setDisplay(this.icon,"Texture/UI/"+"DiamondIcon");
        }else{
            this.moneyNum.string = "+" + num;
            Common.setDisplay(this.icon,"Texture/UI/"+"coin");
        }
        //this.getMoney(type);
    }

    private getMoney(type:string){
        
        if(type === "coin"){
            this.schedule(function(){
                let coin = cc.instantiate(this.coin);
                this.icon.node.addChild(coin);
                coin.setPosition(0,0);
                this.moveBezier(coin,coin.position,this.coinPos.position);
            }.bind(this),0.1,8);

        }else{
            this.schedule(function(){
                let diamond = cc.instantiate(this.diamond);
                this.icon.node.addChild(diamond);
                diamond.setPosition(0,0);
                this.moveBezier(diamond,diamond.position,this.diamondPos.position);
            }.bind(this),0.1,8);
        }
        
    }


    moveBezier(node,from,to,callback = null,dur = 1,delay = 0)
    {
        let bezier = []
        let x = from.x, y = from.y
        let ex = to.x, ey = to.y;
        bezier[0] = cc.v2(x, y)
        bezier[1] = cc.v2(x + Math.abs(ex - x+ 100) * 0.5, y + Math.abs(ey - y+100) * 0.5)
        bezier[2] = cc.v2(ex, ey)
        node.runAction(cc.sequence(cc.delayTime(delay),cc.bezierTo(dur, bezier) , cc.fadeOut(0.1),cc.callFunc(callback)));
    }

    onShown(msg,num:number,callback?:Function)
    {
        this._callFunc = callback;
        this.initView(msg,num);
        this.scheduleOnce(function(){
            this.getComponent(View).hide();
            this._callFunc && this._callFunc();
            }.bind(this),1);
    }
}
