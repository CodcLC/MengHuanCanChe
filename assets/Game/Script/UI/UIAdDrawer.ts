import View from "../../../framework/plugin_boosts/ui/View";
import Util from "../Common/Util";
import { UserInfo ,LevelData} from "../Common/UserInfo";
import Common from "../../../framework/plugin_boosts/utils/Common";
import Plate from "../Game/Plate";
import Platform from "../../../framework/Platform";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import { Toast } from "../../../framework/plugin_boosts/ui/ToastManager";
import StatHepler from "../Common/StatHelper";
import LocalTimeSystem from "../Common/LocalTimeSystem";
import { BannerData } from "../Component/GuessLikeBar";
import BannerItem from "../Component/BannerItem";

const {ccclass, property} = cc._decorator;

var OUTTIME = 0.15;
var SCALE = 1.8;
/**
 * 侧边栏UI
 */
@ccclass
export default class UIAdDrawer extends cc.Component {

    @property(cc.Node)
    nodeBg:cc.Node = null;

    @property(cc.Node)
    nodeLay:cc.Node = null;

    
    @property(cc.Prefab)
    preBanItem:cc.Prefab = null;

    private _canTouch:boolean;
    

    onLoad(){
        Util.getPCBanListDrawer((datas:BannerData[])=>{
            this.updShow(datas);
        });
    }

    
    onShown () {
        this.moveOutSide();

    }

    updShow(datas:BannerData[]){
        datas.forEach((value,index)=>{
            let node = cc.instantiate(this.preBanItem);
            node.scale = SCALE;
            node.width *= SCALE;
            node.height *= SCALE;
            node.parent = this.nodeLay;
            let script :BannerItem = node.getComponent("BannerItem");
            script.labName.node.scale = 0.8;
            script.init(value);
        });
    }


    /** 侧边栏移动出来 */
    moveOutSide(){
        this._canTouch = !1;

        let dis = this.nodeBg.width + 20;
        this.nodeBg.x -= dis;

        let move = cc.moveBy(OUTTIME,cc.v2(dis,0));
        let f = cc.callFunc(()=>{
            this._canTouch = !0;
           
        });
        this.nodeBg.runAction(cc.sequence(
            move,
            f
        ));
    }
        
    

  
    click_close(){
        this.getComponent(View).hide(); 
        
    }

    private onLeftBtn(){

    }

}
