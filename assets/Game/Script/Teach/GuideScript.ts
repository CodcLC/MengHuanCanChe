import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import { root } from "../Game/GameRoot";
import Util from "../Common/Util";
import { UserInfo } from "../Common/UserInfo";
import ViewManager from "../../../framework/plugin_boosts/ui/ViewManager";
import View from "../../../framework/plugin_boosts/ui/View";
import UIShopUp from "../UI/UIShopUp";
import CustomerSpawner from "../Game/CustomerSpawner";
import Customer from "../Game/Customer";
import NoobGuider from "../../../framework/plugin_boosts/components/NoobGuider";
import { MissionEndType, MissionSpecialType } from "../Common/EnumConst";
import BakeMachine from "../Game/BakeMachine";
import Food, { FoodState } from "../Game/Food";

const { ccclass, property } = cc._decorator;

enum LogicType {
    waitEnter = 1, //直接 进入关卡
    waitCustomer = 2, //特殊人物
    waitTime = 3, //等等时间 
    waitAllCooked = 4, //等待所有烤熟
    waitClick = 11, //等待点击 
    waitAnyInput = 12, //等等点击 任意
    waitClickShopFood = 13, // 等待点击食材
    waitClickShopTool = 14, //等待点击厨具
    waitDoubleClick = 15, //等待双击 
    waitClickSit = 16, //等待点击customer 
    waitCloseFailReason = 20, //关掉失败难度
    //特殊引导 
    //升级一下饮料
    wait_100 = 100,
    //点击饮料升级
    wait_102 = 102, //100 的前置点击 
}


enum TriggerType {
    Login = 1,
    LevelStart,
    LevelComplete,
    Burt,// 特殊触发烤糊
    LevelWin,//游戏胜利触发
}

@ccclass
export default class GuiderScript {

    guiderView: View;

    guider: NoobGuider;

    lastStep: number = 0;

    is_in_guide = false;

    tempNode: cc.Node = null;


    static init() {

    }

    constructor() {
        /**
         * 触发时机
         */
        event.on("Login", this.onLogin, this);
        event.on("LevelStart", this.onLevelStart, this);
        event.on("LevelCompleteAndBack", this.onLevelCompleteAndBack, this);
        event.on("SceneChange", this.destroyGuider, this);
        event.on("Cooked", this.onCooked, this);
        event.on("Burnt", this.onBurnt, this);
        event.on("LevelWin", this.onLevelWin, this);
        event.on("Game.Fail", this.onGameFail, this);
    }

    destroyGuider() {
        this.guider = null;
        this.guiderView = null;
    }

    onGameFail() {
        //特殊引导
        this.exec(6);
    }

    onLevelWin() {
        // if(ViewManager.instance.isVisible("UI/UIReAward")){
        //     ViewManager.instance.hide("UI/UIReAward")
        // }
        if (root) {
            this.exec(5)
        }
    }

    //------------------------------------------------------------------------------//
    onCooked(food: Food) {
        let allCooked = root.getList(BakeMachine).every(v => {
            if (!v.isEmpty() && v.cookingFood) {
                if (v.cookingFood.fsm.isInState(FoodState.Cooked)) {
                    return true;
                } else {
                    return false
                }
            }
            return true;
        })
        if (allCooked)
            event.emit("CookedAll", food.node);
    }

    onBurnt(food: Food) {
        //非烤糊关卡触发 4 
        if (UserInfo.firstBurnt && root.missionType2 != MissionSpecialType.BurntNotAllowed) {
            //找到烤糊的设备 
            let tool = root.getList(BakeMachine).find(v => v.cookingFood == food)
            this.tempNode = tool.node;
            UserInfo.firstBurnt = false
            UserInfo.save('firstBurnt')
            this.exec(4);
        }
    }

    onLogin() {
        // this.exec(1, -1);
    }

    onLevelStart(level) {
        if (UserInfo.playingLevel == 101) {
            //101 
            root.levelUpEnabled = false;
        }
        this.exec(2, UserInfo.playingLevel);
    }

    onLevelCompleteAndBack(level) {
        this.exec(3, level);
    }

    triggerAnyTime = [TriggerType.Burt, 6]

    check(v, triggerType, level) {
        if (triggerType == TriggerType.LevelStart || triggerType == TriggerType.LevelComplete) {
            return v.param == level && v.ID >= this.lastStep && triggerType == v.trigger_condition
        } else {
            if (triggerType == v.trigger_condition) {
                if (this.triggerAnyTime.indexOf(triggerType) != -1) {
                    return true;
                }
                return v.ID > this.lastStep
            }
        }
    }

    /**
     *
     */
    async exec(triggerType, level?) {
        // event.emit("GotoLevel", 1, 101)
        // await event.wait("onGameEnter")
        if (this.is_in_guide) return;
        this.is_in_guide = true

        let teach_info = csv.TeachData.values.find(v => {
            if (v.sign_ban) {
                if (v.sign_ban > UserInfo.guide_step) {
                    return this.check(v, triggerType, level)
                } else return false
            } else {
                return this.check(v, triggerType, level)
            }
        })
        this.onBeginGuide(triggerType)
        while (teach_info) {
            let cmd = LogicType[teach_info.operation]
            let func = this[cmd]
            if (teach_info.sign_set > 0) {
                // 标记已完成
                UserInfo.guide_step = teach_info.sign_set
                UserInfo.save("guide_step")
            }
            await func.call(this, teach_info)
            this.lastStep = teach_info.ID;
            g.logColor(`完成引导 ${cmd} :  ${teach_info.ID} `)
            if (teach_info.next_id == -1) {
                break;
            }
            teach_info = csv.TeachData.get(teach_info.next_id)
        }
        this.is_in_guide = false
        if (this.guider) {
            this.guiderView.hide();
        }
        this.onEndGuide(triggerType)
    }

    onBeginGuide(triggerType) {
        if (root) {
            root.topUI.lj_no_limit = true
            if (triggerType == TriggerType.Burt) {
                root.pause();
            }
        }
    }

    onEndGuide(triggerType) {
        if (root && root.customerSpawner) {
            // root.customerSpawner.spawnSpecial = false;
            root.customerSpawner.recovery();
            root.topUI.lj_no_limit = false;
        }
        if (triggerType == TriggerType.Burt) {
            root && root.resume();
        }
    }

    async waitEnter(data: csv.TeachData_Row) {
        // 1 data1 为关卡ID 
        UserInfo.chapter = 1;
        UserInfo.playingLevel = Number(data.data1);
        Util.loadScene("S1")
    }

    async waitCustomer(data: csv.TeachData_Row) {
        // 2
        //data1 为顾客数量
        if (root) {
            root.numOfSpecialCustomer = Number(data.data1)
            root.customerSpawner.spawnSpecial = true;
        }
        //等待第一个顾客出现
        if (data.data2 == '1') {
            let [sit] = await event.wait("CustomerWait")
            this.tempNode = sit.node;
        }
    }

    findUINode(type, path) {
        let node = null;
        if (type == "UI") {
            node = cc.find("Canvas/ViewManager/" + path);
            if (node == null) {
                node = cc.find("Canvas/mapSlot/" + path);
            }
        } else {
            node = cc.find(path);
        }
        return node
    }

    async waitClick(data: csv.TeachData_Row, targetNode: cc.Node = null) {
        //11 
        //data1 为ui 路径 
        await this.initGuider();
        await event.sleep(0.1);
        let [type, path] = data.data1.split(":")
        let node = targetNode;
        if (node == null) {
            node = this.findUINode(type, path);
        }
        if (node == null) return console.error(`${path} not found `)
        this.showMsg(data)
        // root && root.pause();
        if (root) {
            root.pauseBakers()
            //pause timer 
            cc.director.getScheduler().pauseTarget(root.topUI)
        }
        this.guider.showMask()
        await this.guider.waitClick(node, parseInt(data.data2))
        if (root) {
            root.resumeBakes();
            cc.director.getScheduler().resumeTarget(root.topUI)
        }
        this.guider.hideMask();
        // root && root.resume([CustomerSpawner,Customer])
        this.guider.hidePointer();
        this.guider.hideMessage();
    }

    async waitClickSit(data: csv.TeachData_Row) {
        let target = cc.find(data.data1, this.tempNode)
        await this.waitClick(data, target)
    }

    async initGuider() {
        if (!this.guider) {
            ViewManager.instance.show("UI/UIGuider")
            let [view, ret] = await event.wait("UIGuider.onShown.After")
            this.guiderView = view;
            this.guider = this.guiderView.getComponent(NoobGuider);
        } else {
            this.guiderView.show();
        }
    }

    showMsg(data: csv.TeachData_Row) {
        if (data.data6 != "-1")
            this.guider && this.guider.showMessage(data.data6, data.data9, data.data10, data.data7, data.data8)
    }

    async waitAllCooked(data: csv.TeachData_Row) {
        //4 
        this.showMsg(data)
        this.guider.hidePointer()
        this.guider.hideMask();
        let [node] = await event.wait("CookedAll")
        this.tempNode = node;
    }

    async waitDoubleClick(data: csv.TeachData_Row) {
        this.showMsg(data)
        await this.guider.waitDoubleClick(this.tempNode);
        root && root.resume();
    }

    async waitTime(data: csv.TeachData_Row) {
        //3 
        let sec = Number(data.data1) / 1000;
        this.showMsg(data)
        if (data.data6 == "-1" || data.data6 == "0") {
            this.guider.hideMessage();
        }
        this.guider.hidePointer()
        this.guider.hideMask();
        await event.sleep(sec);
    }

    async waitAnyInput(data: csv.TeachData_Row) {
        await this.initGuider();
        this.showMsg(data)
        this.guider.hidePointer()
        this.guider.hideMask();
        await this.guider.waitAnyKey();
        this.guider.hideMessage();
        await event.sleep(0.3);
    }

    async waitCloseFailReason(data: csv.TeachData_Row) {
        await this.initGuider();
        let d = csv.MissionData.get(UserInfo.playingLevel);
        if(d.FailReason){
            this.guider.showMessage(d.FailReason, data.data9, data.data10, data.data7, data.data8)
            this.guider.hidePointer();
            await this.guider.waitAnyKey();
            this.guider.hideMessage();
            await event.sleep(0.3);
        }
    }

    async waitClickShopTool(data: csv.TeachData_Row) {
        //14
        let tool_id = Number(data.data1)
        this.showMsg(data)
        let view = ViewManager.instance.view("UI/UIShopUp")
        if (view == null) {
            [view] = await event.wait("UIShopUp.onShown.After")
        }
        let ui = view.getComponent(UIShopUp)
        let node = ui.idGetItemNode(tool_id) as cc.Node;
        if (node)
            await this.guider.waitClick(node)
        view = ViewManager.instance.view("UI/UIShopGoBuy")
        if (view == null) {
            //如果没有打开过等待打开界面 后在继续
            await event.wait("UIShopGoBuy.onShown.After")
        }
    }

    async waitClickShopFood(data: csv.TeachData_Row) {
        //13
        await this.waitClickShopTool(data);
    }

    param_100: boolean = false;
    async wait_100(data: csv.TeachData_Row) {
        // 100 
        //check 1104 是否升级 
        let lv = UserInfo.getToolLevelData(data.data2)
        if(lv == 1)
        {
            this.param_100 = true;
        }else{
            return;
        }
        await this.waitClick(data)
        await ViewManager.instance.show("UI/UIShopGoBuy",data.data2,function(){
            root.updateAllTools();
        })
    }
    async wait_102(data: csv.TeachData_Row) {
        if (this.param_100) {
            await this.waitClick(data)
        }
    }

    //------------------------------------------------------------------------------//
}
export let Guider: GuiderScript = new GuiderScript();