import { UserInfo } from "../Common/UserInfo";

import GameRes, { R } from "./GameRes";

import UpgradeButton from "./UpgradeButton";

import DrawCallOptimizer, { DCIndex } from "../Component/DrawCallOptimizer";
import Common from "../../../framework/plugin_boosts/utils/Common";
import { ToolType } from "../Common/CSVEnum";
import DoubleClick from "../Component/DoubleClick";
import { root } from "./GameRoot";

const {ccclass, property} = cc._decorator;
enum Index {
    None,
    index_1,
    index_2,
    index_3,
    index_4,
    index_5,
    index_6,
}
@ccclass
export default abstract class ChujvBase extends cc.Component {
    @property({type:cc.Enum(Index)})
    index:number = Index.None;

    upgradeNode:cc.Node = null;
    button:cc.Button = null;

    @property
    isLocked:boolean = false;

    @property({type:cc.Enum(ToolType)})
    tool_id:ToolType = 0;

    level:number = 1;

    tool_data:csv.ChujvData_Row = null;

    init()
    {
        this.addComponent(DoubleClick)
        this.tool_data = csv.ChujvData.get(this.tool_id)
    }
    
    resetUpgradeButton()
    {
        if(this.node.active == false) return;
        // 判断 当前等级
        // 当前盘子是1  级 ,index  为3 则不显示 ,只显示 index
        if(!root.levelUpEnabled)return;
        let d = UserInfo.getToolLevelData(this.tool_id)
        let num = csv.ChujvData.get(this.tool_id)["num" + d]
        if(this.index - num == 1){
            if(!this.upgradeNode){
                this.upgradeNode = cc.instantiate(R.prefab_upgradeButton)
                this.upgradeNode.parent = this.node;
                this.upgradeNode.position  = cc.v2(-15,15)
                this.upgradeNode.getOrAddComponent(UpgradeButton).tool_id = this.tool_id;
                let optimizer = DrawCallOptimizer.getOptimizer(DCIndex.index0)
                optimizer && optimizer.optimizeTarget(this.upgradeNode);
            }
        }
    }

    setLocked(v)
    {
        this.isLocked = v;
        this.button && (this.button.interactable = !v)
        this.node.opacity = v ? 60:255;
        if(v){
            //locked add button 
            // this.upgradeNode = cc.instantiate()
            this.resetUpgradeButton();
        }else{
            if(this.upgradeNode)
                this.upgradeNode.active = false;
        }
    }

    abstract getFood();

    isEmpty(){
        return this.getFood() == null  && !this.isLocked ;
    }
}