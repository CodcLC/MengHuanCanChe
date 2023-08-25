import View from "../../../framework/plugin_boosts/ui/View";
import Util from "../Common/Util";
import { UserInfo ,LevelData} from "../Common/UserInfo";
import Common from "../../../framework/plugin_boosts/utils/Common";
import Plate from "../Game/Plate";
import Platform from "../../../framework/Platform";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import { Toast } from "../../../framework/plugin_boosts/ui/ToastManager";
import { ifError } from "assert";
import ViewManager from "../../../framework/plugin_boosts/ui/ViewManager";
import { root } from "../Game/GameRoot";
import UIShopUp from "../UI/UIShopUp";
import Device from "../../../framework/plugin_boosts/misc/Device";
import BannerItem from "./BannerItem";

const {ccclass, property} = cc._decorator;

var MOVETIME = 4;
var MOVEDURING = 1.5;
/** 显示4个一组 */
var SHOWNUM = 4;

/**
 * 猜你喜欢
 */
@ccclass
export default class GuessLikeBar extends cc.Component {
    

    @property(cc.Node)
    nodeLay:cc.Node = null;

    @property(cc.Prefab)
    preBanItem:cc.Prefab = null;

    private oldYLay:number = null;

    private oldXLay:number = null;

    private itemHeight:number = null;

    private itemWidth:number = null;

    /** 移动次数 */
    private _moveNum = 0;

    private _datas:BannerData[] = [];

    /** 默认刚开始移动方向(1为向上或者向左 -1相反) */
    private _dirStart:number = 1;

    @property({visible:true,tooltip:"1水平 \n2竖直"})
    moveDir:MoveDir = 0;

    testDatas:BannerData[] = [
        {banner_icon:"",banner_name:"飞机大战1"},
        {banner_icon:"",banner_name:"坦克大战2"},
        {banner_icon:"",banner_name:"虫虫大战3"},
        {banner_icon:"",banner_name:"豆豆大战4"},
        {banner_icon:"",banner_name:"傻逼大战5"},
        {banner_icon:"",banner_name:"蠢逼大战6"},
        {banner_icon:"",banner_name:"人人大战7"},
        {banner_icon:"",banner_name:"哦哦大战8"},
    ]

    onLoad () {
        this.init();
    }


    init(){
        Util.getPCBanListLike((datas:BannerData[])=>{
            cc.log("bar_bannerList",datas);
            if(datas && datas.length > 0){
                this._datas = datas;
                this.updView(datas);
            }     
        });
        // this._datas = this.testDatas;
        // this.updView(this.testDatas);
    }

    moveStart(){
        if(this._datas.length <= SHOWNUM){
            return;
        }
        this.schedule(()=>{
            let f = cc.callFunc(()=>{
                
                // this.nodeLay.children.forEach((value,index)=>{
      
                //     value.zIndex -= 1;
                //     value.zIndex < 0 && (value.zIndex = this.nodeLay.childrenCount - 1);
                    
                // });
                // this.nodeLay.y = this.oldYLay;
                // this.nodeLay.x = this.oldXLay;
                // this.nodeLay.getComponent(cc.Layout).updateLayout();
                this._moveNum++;
            });

            

            let move = this.getMove();
            this.nodeLay.runAction(cc.sequence(
                move,
                f
            ));
            
        },MOVETIME);
    }


    getMoveDir(){
        let canMNum = this._datas.length - SHOWNUM;
        if(this._moveNum >= canMNum){
            this._dirStart *= -1;
            this._moveNum = 0;
        }
        return this._dirStart;
    }

    /** 移动猜你喜欢后的排序 */
    reSortItem(){

    }

    getMove(){
        let dir = this.getMoveDir();
        if(this.moveDir && this.moveDir == MoveDir.Horizon){
            return cc.moveBy(MOVEDURING,cc.v2((this.itemWidth + this.nodeLay.getComponent(cc.Layout).spacingX)*(-1)*(dir),0));
        }else{
            return cc.moveBy(MOVEDURING,cc.v2(0,((this.itemHeight + this.nodeLay.getComponent(cc.Layout).spacingY)*(dir) )));
        }
    }


    /** 更新显示 */
    updView(datas:BannerData[]){
        !this.oldYLay && (this.oldYLay = this.nodeLay.y);
        !this.oldXLay && (this.oldXLay = this.nodeLay.x);
        for(let i in datas){
            let node = cc.instantiate(this.preBanItem);
            !this.itemHeight && (this.itemHeight = node.height);
            !this.itemWidth && (this.itemWidth = node.width);
            node.parent = this.nodeLay;
            (<BannerItem>node.getComponent("BannerItem")).labName.node.color = new cc.Color(255,255,255);
            node.zIndex = Number(i);
            let script :BannerItem = node.getComponent("BannerItem");
            script.init(datas[i]);
        }
        this.moveStart();
    }


   


    onDestroy()
    {
        
    }


    start () {}
}

export interface BannerData{
    banner_icon?:string,
    banner_name?:string,
    banner_appid?:string,
    banner_path?:string
}

export enum MoveDir{
    Horizon = 1,
}