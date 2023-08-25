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


const {ccclass, property} = cc._decorator;
/**
 * 商店界面
 */
@ccclass
export default class UIShopUp extends cc.Component {


    /** 对应章节数据 */
    private _data:csv.CantingData_Row;

    private LINE = 3;

    private SPACEXBASE = 110;

    /** 每行餐具个数 */
    private lineNum:number;

    /** 每一列的父节点 */
    @property([cc.Layout])
    private lineLayoutList:cc.Layout[] = [];

    @property(cc.Node)
    private deskNode:cc.Node = null;

    @property(cc.Button)
    private btnPreChap:cc.Button = null;

    @property(cc.Button)
    private btnNextChap:cc.Button = null;

    @property(cc.Sprite)
    private sprChapSel:cc.Sprite = null;

    /** 寻找图片的路径 */
    private _url:string;

    @property(cc.Prefab)
    private shopItemPre:cc.Prefab = null;

    private _nowNewId:number;

    private MAXLV = 3;

    /** 最小关卡数 */
    private MIXCHAP = 1;

    /** 最大关卡数 */
    private MAXCHAP = 4;

    /** 现在选择的章节商城 */
    private _nowSelChap = null;

    private itemPool:cc.NodePool;

    static instance:UIShopUp;

    _callBack:Function;

    onLoad(){
        
    }

    start () {

    }

    onShown (callBack:Function) {
        //this.clearAll();
        this._callBack = callBack;
        UIShopUp.instance = this;
        
        let chapSel = this._nowSelChap ? this._nowSelChap : UserInfo.chapter;
        this._data = csv.CantingData.get(chapSel);
        this._url = "Texture/" + "S" + chapSel + "/Elements/";
        this._nowNewId = this.getNowNewId();
        this.initLine();
        this.updChapSel();
    }

    /** 获得当前关卡的id */
    getNowNewId(){
        for(let i in UserInfo.levelDatas){
            if(UserInfo.levelDatas[i].star == 0){
                return Number(i);
            }
        }
    }

    /** 初始化每列 */
    private initLine(){
        let total = this._data.Shicai.length + this._data.Chuju.length;
        this.lineNum = Math.ceil(total / this.LINE);
        !this.itemPool && (this.itemPool = new cc.NodePool());
        let totalList = this.getTotalList();

        for(let i = 0;i < this.lineLayoutList.length;i++){
            this.lineLayoutList[i].node.rotation = -1 * (this.lineLayoutList[i].node.parent.rotation);
        
            for(let l = 0;l < this.lineNum;l++){
                if(totalList.length == 0){
                    break;
                }
                let id = totalList.shift();
                if(this.lineLayoutList[i].node.children.length > 0){
                    if(this.lineLayoutList[i].node.children[l]){
                        this.lineLayoutList[i].node.children[l].getComponent("ShopItem").id = Number(id);
                        this.lineLayoutList[i].node.children[l].getComponent("ShopItem").nowNewId = this._nowNewId;
                        this.lineLayoutList[i].node.children[l].getComponent("ShopItem").init();
                        continue;
                    }
                }
                let node = null;
                if(this.itemPool.size() > 0){
                    node = this.itemPool.get();
                }else{
                    node = cc.instantiate(this.shopItemPre);
                }
                let nodeScript = node.getComponent("ShopItem");

                let chapSel = this._nowSelChap ? this._nowSelChap : UserInfo.chapter;
                nodeScript.id = Number(id);
                nodeScript.nowNewId = this._nowNewId;
                nodeScript.nowSelChap = chapSel;
                node.parent = this.lineLayoutList[i].node;
                nodeScript.init();
                //this.lineLayoutList[i].node.addChild(node);
            }

            if(totalList.length == 0){
                break;
            }
        }

        this.initSize();

    }

    /** 获取厨具食物总数组 */
    private getTotalList(){
        let list = [];
        
        for(let j = 0;j < this._data.Shicai.length;j++){
            list.push(this._data.Shicai[j]);
        }

        for(let k = 0;k < this._data.Chuju.length;k++){
            list.push(this._data.Chuju[k]);
        }

        return list;
    }

    /** 初始化大小 */
    private initSize(){
        for(let i = 0;i < this.lineLayoutList.length;i++){

            this.lineLayoutList[i].spacingX = this.SPACEXBASE - ((this.lineNum - 3) * 25);

        }
    }

    /** 清空节点 */
    private clearAll(){
        for(let i = 0;i < this.lineLayoutList.length;i++){
            if(!this.lineLayoutList[i].node) return;
            for(let j = 0;j < this.lineLayoutList[i].node.children.length;j++){
                let thing = this.lineLayoutList[i].node.children[j];
                //thing.destroy();
                this.itemPool.put(thing);
                j--;
            }
            this.lineLayoutList[i].node.children.length = 0;
        }

    }

    /** 刷新章节选择按钮和提示 */
    private updChapSel(){
        let chapSel = this._nowSelChap ? this._nowSelChap : UserInfo.chapter;

        
        this.btnPreChap.interactable = !(chapSel <= this.MIXCHAP);
        
        this.btnNextChap.interactable = !(chapSel >= this.MAXCHAP);

        Common.setDisplay(this.sprChapSel,"Texture/UI/labS" + chapSel);
    }

    idGetItemNode(id:number){
        for(let i = 0;i < this.lineLayoutList.length;i++){
            if(!this.lineLayoutList[i].node) return cc.log("商品未加载完成"),false;
            for(let j = 0;j < this.lineLayoutList[i].node.children.length;j++){
                let s = this.lineLayoutList[i].node.children[j];
                if(s.getComponent("ShopItem").id == id){
                    return s;
                }
            }
        }
        return cc.log("没有找到"),false;
    }

    /** 上一章按钮 */
    click_preChap(){
        let chapSel = this._nowSelChap ? this._nowSelChap : UserInfo.chapter;
        this._nowSelChap = --chapSel;
        this.clearAll();
        this.onShown(null);
    }

    /** 下一章按钮 */
    click_nextChap(){
        let chapSel = this._nowSelChap ? this._nowSelChap : UserInfo.chapter;
        this._nowSelChap = ++chapSel;
        this.clearAll();
        this.onShown(null);
    }


    click_close(){
        this.clearAll();
        this._nowSelChap = null;
        this._callBack && this._callBack();
        this.getComponent(View).hide(); 
    }

    onDestroy(){
        this.clearAll();
        if(this.itemPool){
            this.itemPool.clear();
        };
    }

    click_addCoin(){
        
        ViewManager.instance.show("UI/UIObtain",{type:"coin",way:"share"});
        
    }
 
}
