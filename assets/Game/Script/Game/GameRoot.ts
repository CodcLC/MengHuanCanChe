import BakeMachine from "./BakeMachine";
import Customer from "./Customer";
import Food, { FoodState } from "./Food";
import Plate from "./Plate";
import PoolManager from "../../../framework/plugin_boosts/misc/PoolManager";
import { FoodType } from "../Common/CSVEnum";
import Common from "../../../framework/plugin_boosts/utils/Common";
import Sit from "./Sit";
import { UserInfo } from "../Common/UserInfo";
import { MissionType, MissionSpecialType, MissionEndType } from "../Common/EnumConst";
import GameTopUI from "./GameTopUI";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import CustomerSpawner from "./CustomerSpawner";
import AutoFillMachine from "./AutoFillMachine";
import ViewManager from "../../../framework/plugin_boosts/ui/ViewManager";
import { Toast } from "../../../framework/plugin_boosts/ui/ToastManager";
import Ingredient from "./Ingredient";
import Buff from "./Buff";
import MaterialInput from "./MaterialInput";
import PlateAgent from "./PlateAgent";
import ChujvBase from "./ChujvBase";
import Device from "../../../framework/plugin_boosts/misc/Device";
import StatHepler from "../Common/StatHelper";
import { R } from "./GameRes";
import { notDeepEqual } from "assert";

const { ccclass, property } = cc._decorator;

export let root: GameRoot = null;
@ccclass
export default class GameRoot extends cc.Component {
    pool: PoolManager;

    @property([cc.Prefab])
    foodPrefabs: cc.Prefab[] = []

    @property({ type: [cc.Enum(FoodType)] })
    foodTypes: FoodType[] = [];

    @property(cc.Node)
    slot_customers: cc.Node = null;

    @property(cc.Node)
    node_dustbin: cc.Node = null;

    auto_serve: boolean = false;

    typesToObjects: { [index: string]: cc.Component[] } = {}
    typeIndicies: any[] = []

    levelUpEnabled:boolean = true;

    /**
     * 当前关卡配置数据 
     */
    levelData: csv.MissionData_Row;
    /**
     * 当前订单索引 
     */
    currentOrderIndex: number = 1;
    currentOrder: csv.RecipeData_Row;

    /**
     * 任务目标类型
     */
    missionType: MissionType = 0;
    missionType2: MissionSpecialType = 0;

    /**
     * 关卡结束类型
     */
    missionEndType: MissionEndType = 0;
    missionEndNumber: number = 0

    topUI: GameTopUI = null;

    canMixTable: csv.ShicaiData_Row[] = null

    data_comboHits: number[] = null;


    /**
     * 本关特殊顾客数量 
     */
    numOfSpecialCustomer: number = 0

    customerSpawner: CustomerSpawner = null;

    onLoad() {
        root = this;
        g.setGlobalInstance(this, "root")
        
        this.customerSpawner = this.getComponentInChildren(CustomerSpawner);

        this.pool = new PoolManager(null, this.onCreateFood, this)
        // UserInfo.playingLevel = 0;
        this.levelData = csv.MissionData.get(UserInfo.playingLevel)
        this.missionType = this.levelData.MissionObj1
        this.missionType2 = this.levelData.MissionObj2;
        this.missionEndType = this.levelData.EndObj;
        this.missionEndNumber = this.levelData.EndObj1;
        this.data_comboHits = csv.ConfigData.comboHits.split("&").map(v => Number(v))
        this.currentOrderIndex = 1;

        event.on("Burnt", this.onBurnt, this);
        event.on("Angry", this.onAngry, this);
        event.on("LevelComplete", this.onLevelComplete, this);
        event.on("ComboHit", this.onComboHit, this);
        event.on("TransactionSuccess", this.onTrasactionSucc, this);

        event.on("onAddTimeAgain", this.continueLevel, this);

        // let chapter_data = csv.CantingData.get(UserInfo.chapter) this.canMixTable
        this.canMixTable = csv.ShicaiData.search(v => {
            return v.ZuheID.length > 1 && v.ID.toString().startsWith(UserInfo.chapter.toString());
        })

        //读取配置 显示 当前关可用的厨具
        let chapter_data = csv.CantingData.get(UserInfo.chapter)


        let tools_init = t => {
            let tools: any = this.getList(t);
            tools.forEach(v => {
                if (!v.food_id) {
                    let tool_id = v.tool_id || v.targetToolId
                    let shicai_data = csv.ChujvData.get(tool_id);
                    this.setSicaiVisible(v, shicai_data.ShicaiID)
                } else {
                    this.setSicaiVisible(v, v.food_id)
                }
            })
        }

        tools_init(Ingredient)
        tools_init(MaterialInput);
        tools_init(BakeMachine);
        tools_init(Plate);
        tools_init(PlateAgent);

        UserInfo.is_revive = false;
        UserInfo.is_chanllenge3star = false;
        UserInfo.is_break_record = false

        UserInfo.current_coin = 0;
        UserInfo.doubleHit = 0;
        UserInfo.target_mission_num = 0;
        
        event.emit("EnterLevel")
    }

    start() {
        if(!UserInfo.isOffBgm && UserInfo.isFristOne == 0)
        {
            UserInfo.isFristOne  = 1;
            //第一次登陆默认开启音乐
            Device.playMusic("Audio/" + csv.ConfigData.sound_music_2 + ".mp3");
            UserInfo.isOffBgm = false;
            UserInfo.soundBgOn = true;
            UserInfo.save("isOffBgm");
            UserInfo.save("soundBgOn");

            // Device.playMusic("Audio/" + csv.ConfigData.sound_music_1 + ".mp3");
        }
        

        this.initTopUI()
        StatHepler.startLevel()
        event.emit("LevelStart");
        this.scheduleOnce(this.updateAllTools,0);
    }

    initTopUI()
    {
        let node = cc.instantiate(R.prefab_topUI)
        node.parent = this.node;
        this.node.emit("auto_start",node.getComponent("GameTopUI"));
    }

    updateAllTools()
    {

        this.updateTools(BakeMachine);
        this.updateTools(Plate);
        this.updateTools(AutoFillMachine)
    }

    setSicaiVisible(v, food_id) {
        let shicai_data = csv.ShicaiData.get(food_id);
        if (shicai_data) {
            if (UserInfo.playingLevel >= shicai_data.unlock) {
                v.node.active = true;
                // v.progress_timer && v.progress_timer.node.active = true
            } else {
                v.node.active = false;
                v.progress_timer && (v.progress_timer.node.active = false)
            }
        }
    }

    /**
     * 食物能卖多少钱
     */
    getFoodMoney(food: Food) {
        let data = csv.ShicaiData.get(food.food_id);
        let lv = UserInfo.getFoodLevelData(food.food_id);
        let c = data["SellGold" + lv]
        let s = 0
        s = food.ingredients.reduce((sum, v) => {
            let vd = csv.ShicaiData.get(v);
            let vlv = UserInfo.getFoodLevelData(v)
            let coin = vd["SellGold" + vlv]
            return sum + coin;
        }, 0)

        this.log(`卖掉：${c}+${s}`)
        return c + s;
    }

    onTrasactionSucc(food: Food) {
        let coin = this.getFoodMoney(food)
        UserInfo.recordFoodMake(food.full_id);
        //--------------------------------------保存用户数据----------------------------------------//
        //添加到当前关获取到的金币 
        UserInfo.addData("current_coin", coin)
        
        //--------------------------------------end----------------------------------------//
        if (root.missionType == MissionType.Plate) {
            // UserInfo.target_mission_num += 1;
            UserInfo.addData("target_mission_num", 1)
        } else if(root.missionType == MissionType.Gold) {
            // UserInfo.target_mission_num += coin;
            UserInfo.addData("target_mission_num", coin)
        }
        
    }

    onComboHit(hit) {
        let lv_data = UserInfo.getLevelData(UserInfo.playingLevel);
        let idx = cc.misc.clampf(hit-1,0,3);
        let c = this.data_comboHits[idx]
        UserInfo.addData("doubleHit", c)
        UserInfo.addData("current_coin", c)
        if(idx == 0)
        {
            UserInfo.daily_combo_2 ++ 
            UserInfo.total_combo_2 ++ 
        }else if(idx == 1){
            UserInfo.daily_combo_3 ++
            UserInfo.total_combo_3 ++ 
        }else if(idx == 2){
            UserInfo.daily_combo_4 ++
            UserInfo.total_combo_4 ++
        }else if(idx ==3 ){
            UserInfo.daily_combo_5 ++
            UserInfo.total_combo_5 ++ 
        }
        
        
        if (root.missionType == MissionType.Gold)
            UserInfo.addData("target_mission_num", c)
        //延迟刷新
        this.topUI.invalidate();
    }

    async onLevelComplete(t) {
        // if(UserInfo.playingLevel == UserInfo.level)
        //     UserInfo.level += 1;
        // UserInfo.save();
        cc.audioEngine.stopAllEffects();
        await event.sleep(1);
        
        ViewManager.instance.show("UI/UIThrough", t);

    }

    /**
     * 获得当前星级
     * @param mission_compelete_num 完成的值 
     */
    getStar(mission_compelete_num) {
        let min_stars = [this.levelData.MissionStar1, this.levelData.MissionStar2, this.levelData.MissionStar3]
        let star = 0;
        min_stars.every((v, i) => {
            if (mission_compelete_num >= v) {
                star = i + 1;
                return true;
            }
            return false
        })
        return star;
    }

    onDestroy() {
        event.off(this);
        cc.audioEngine.stopAllEffects();
        this.pool.clear();
        StatHepler.endLevel();
        UserInfo.save();
        root = null;
    }

    async onBurnt(food: Food) {
        //烤糊
        if (this.levelData.MissionObj2 == MissionEndType.BurntNotAllowed) {
            let buff = this.getComponent(Buff);
            if (buff && buff.enabled && buff.type == Buff.Immnue_Burnt) {
                return
            }
            this.log(food);
            this.pause();
            if (!UserInfo.is_revive) {
                ViewManager.instance.show("UI/UIFailAlert", MissionEndType.BurntNotAllowed, food)
                await event.wait("Click_Fail_Alert")
                ViewManager.instance.show("UI/UIFailReason", MissionEndType.BurntNotAllowed);
            } else
                ViewManager.instance.show("UI/UIFail", MissionEndType.BurntNotAllowed);
        }
    }

    async onAngry(customer: Customer) {
        if (this.levelData.MissionObj2 == MissionEndType.AngryNotAllowed) {
            let buff = this.getComponent(Buff);
            if (buff && buff.enabled && buff.type == Buff.Immnue_Angry) {
                return
            }
            this.pause();

            if (!UserInfo.is_revive) {
                ViewManager.instance.show("UI/UIFailAlert", MissionEndType.AngryNotAllowed, customer.sit)
                await event.wait("Click_Fail_Alert")
                ViewManager.instance.show("UI/UIFailReason", MissionEndType.AngryNotAllowed);
            } else
                ViewManager.instance.show("UI/UIFail", MissionEndType.AngryNotAllowed);
        }
    }

    nextOrderData(): csv.RecipeData_Row {
        //order 
        // let randIndex = g.randomInt(0,21);
        let nind = this.currentOrderIndex
        let bRand = 0;
        if (UserInfo.is_chanllenge3star || this.currentOrderIndex >= 20) {
            nind = g.randomInt(0, 20);
            bRand = 1;
        }
        let order_number = this.levelData["ShipuID" + nind]
        // order_number
        if (!order_number) {
            //TODO: level finished ?
            return null;
        }
        let order = csv.RecipeData.get(order_number);
        if (!bRand)
            this.currentOrderIndex++
        this.currentOrder = order
        return this.currentOrder;
    }

    getCustomers(): Customer[] {
        // return this.slot_customers.children.map(v=>v.getComponent(Customer));
        return this.customerSpawner.customers;
    }

    // get static list by type 
    getList<T extends cc.Component>(type: { prototype: T }): T[] {
        //******除Customer 不缓存 
        let objects = this.typesToObjects[this.typeIndicies.indexOf(type)] as T[];
        if (!objects) {
            objects = this.node.getComponentsInChildren<T>(type);
            this.typesToObjects[this.typeIndicies.length] = objects;
            this.typeIndicies.push(type);
        }
        return objects;
    }

    // 101 , [102,103] 104 
    canMix(food_id: number, food_ingredients: number[], ingredient_id: number): boolean {
        let qianzhiId = csv.ShicaiData.get(ingredient_id).QianZhiID;
        let canMix = qianzhiId == food_id;
        if (food_ingredients.length == 0) return canMix;
        if (food_ingredients.length > 0) {
            //ingredients 里有 将要存进去的前置id 
            //a-b  从小到大
            canMix = food_ingredients.some(x => qianzhiId == x)
            if (!canMix) {
                let temp = [food_id]
                temp = temp.concat(food_ingredients)
                temp.push(ingredient_id)
                temp.sort((a, b) => a - b)
                let ccc = temp.join("-");
                let cfg = this.canMixTable.find(v => v.ZuheID.join("-") == ccc)
                if (cfg) {
                    return true;
                } else {
                    return false;
                }
            }
        }
        // 不能重复
        return canMix && !food_ingredients.some(v => v == ingredient_id);
    }

    //自动上菜
    setAutoServe(b) {
        // let plates = this.getList(Plate);
        // plates = plates.filter(v=>!v.isEmpty())
        // slot_customers 
        if (b != this.auto_serve) {
            this.auto_serve = b;
            Toast.make("开启自动上菜")
            this.node.emit("AutoServeChanged", b);
        }
    }

    onLoadFinished(param){
        if(param == "auto")
            this.node.on("auto_start",(scr)=>{
                scr.autoSet();
            },this);
    }

    onCreateFood(id) {
        return cc.instantiate(this.foodPrefabs[this.foodTypes.indexOf(id)]);
    }

    //从pool 里拿food 节点
    getFoodById(id: number) {
        // return cc.instantiate(this.foodPrefabs[id]); 
        let node = this.pool.get(id);
        node.active = true;
        node.opacity = 255;
        node.scale = 1;
        node.stopAllActions();
        return node;
    }

    //创建 一个成品food 
    createFood(v: number) {
        let food_cfg = csv.ShicaiData.get(v)
        if (!food_cfg) return null;
        let ids = food_cfg.ZuheID;
        let base_id = v
        if (ids.length > 1)
            base_id = ids[0]
        let foodNode = root.getFoodById(base_id);
        let food = foodNode.getComponent(Food);
        food.food_id = base_id;
        food.full_id = v;
        food.reset();
        if (ids.length > 0)
            food.addIngredients(ids.slice(1))
        ///已是成品
        food.makeCooked()
        food.updateAvatar();
        return food;
    }

    recycle(food_node: cc.Node) {
        this.pool.put(food_node);
    }

    dropFood(food: Food, isSpecialBaking?) {
        food.discard();
        Common.changeParent(food.node, root.node_dustbin);
        let move = cc.moveTo(0.5, cc.Vec2.ZERO).easing(cc.easeSineOut())
        let callback
        if (isSpecialBaking)
            callback = cc.callFunc(food.node.destroy, this);
        else
            callback = cc.callFunc(_ => { root.recycle(food.node) });
        let discardAction = cc.sequence(move, cc.fadeOut(0.3), callback);
        food.node.runAction(discardAction);
    }

    pauseBakers() {
        let bakers = this.getList(BakeMachine);
        bakers.forEach(v => v.cookingFood && v.cookingFood.fsm.pause())
    }

    resumeBakes() {
        let bakers = this.getList(BakeMachine);
        bakers.forEach(v => v.cookingFood && v.cookingFood.fsm.resume())
    }

    pause(excludes?) {
        //AutoFillMachine fsm.pause
        let fillers = this.getList(AutoFillMachine);
        fillers.forEach(v => v.fsm.pause());
        //CustomerSpawner enable = false
        if (!excludes || excludes.indexOf(CustomerSpawner) == -1) {
            let spawners = this.getList(CustomerSpawner)
            spawners.forEach(v => v.enabled = false)
        }
        //Plate enable = false
        let plates = this.getList(Plate);
        plates.forEach(v => v.enabled = false);
        //BakeMachine .food fsm.pause 
        this.pauseBakers()
        //Customer fsm.pause node.pauseAllActions
        if (!excludes || excludes.indexOf(Customer) == -1) {
            let customers = this.getCustomers();
            customers.forEach(v => {
                v.fsm.pause()
                v.node.pauseAllActions();
            })
        }
        //pause timer 
        cc.director.getScheduler().pauseTarget(this.topUI)
    }

    resume(excludes?) {
        //AutoFillMachine fsm.pause
        let fillers = this.getList(AutoFillMachine);
        fillers.forEach(v => v.fsm.resume());
        //CustomerSpawner enable = false
        if (!excludes || excludes.indexOf(CustomerSpawner) == -1) {
            let spawners = this.getList(CustomerSpawner)
            spawners.forEach(v => v.enabled = true)
        }
        //Plate enable = false
        let plates = this.getList(Plate);
        plates.forEach(v => v.enabled = true);
        //BakeMachine .food fsm.pause 
        this.resumeBakes()
        //Customer fsm.pause node.pauseAllActions
        if (!excludes || excludes.indexOf(Customer) == -1) {
            let customers = this.getCustomers();
            customers.forEach(v => {
                v.fsm.resume();
                v.node.resumeAllActions();
            })
        }
        cc.director.getScheduler().resumeTarget(this.topUI)
    }

    _doRevive() {
        let data = csv.FailData.get(root.missionEndType)
        let c = data.reward;
        if (root.missionEndType == MissionEndType.Customer)
            root.topUI.customerLeft = c;
        else if (root.missionEndType == MissionEndType.Time)
            root.topUI.timeLeft = c / 1000;
        root.topUI.invalidate();
        this.resume();
    }

    /**
     * 复活处理
     * @param c 复活参数 
     */
    doRevive() {
        UserInfo.is_revive = true;
        UserInfo.daily_revivive ++ 
        UserInfo.total_revivive ++;
        this._doRevive();
    }

    /**
     * 特殊死亡
     * 复活处理2 
     */
    doRevive2() {
        UserInfo.is_revive = true;
        UserInfo.daily_revivive ++ 
        UserInfo.total_revivive ++;
        ///------------------------------------------------------------------------------//    
        if (root.missionType2 == MissionSpecialType.BurntNotAllowed) {
            let buff = this.node.addComponent(Buff); // 烧糊免疫 5 s 
            buff.type = Buff.Immnue_Burnt;
        } else if (root.missionType2 == MissionSpecialType.AngryNotAllowed) {
            let buff = this.node.addComponent(Buff); // 生气免疫 5 s 
            buff.type = Buff.Immnue_Angry;
        }
        this.resume();
        //------------------------------------------------------------------------------//
    }


    challenge_timeLeft: number = 0;
    /**
     * 加时间挑战三星
     */
    continueLevel() {
        this.resume()
        if (root.missionEndType == MissionEndType.Customer){
            UserInfo.daily_user_more_customer ++ 
            UserInfo.total_user_more_customer ++ 
        }else if (root.missionEndType == MissionEndType.Time){
            UserInfo.daily_user_more_time ++
            UserInfo.total_user_more_time ++
        }
        UserInfo.is_chanllenge3star = true;
        this._doRevive();
    }

    /**
     * 更新厨具（升级过后），盘子，烤盘
     */
    updateTools(t: { prototype: ChujvBase }) {
        let tools = this.getList(t);
        tools.forEach((v, i) => {
            let tool_id = v.tool_id;
            let lv_tool = UserInfo.getToolLevelData(tool_id);
            let tool_data = csv.ChujvData.get(tool_id);
            v.level = lv_tool;
            let num = tool_data["num" + lv_tool]
            if (v.index <= num) {
                // v.node.active = true
                v.setLocked(false)
            } else {
                // v.node.active = false;
                v.setLocked(true)
            }
        })
    }

    /**
     * 立马三星过关
     */
    win() {
        let lv = UserInfo.getLevelData(UserInfo.playingLevel)
        lv.star = 3;
        UserInfo.current_coin = 100;
        UserInfo.target_mission_num = this.levelData.MissionStar3
        ViewManager.instance.show("UI/UIThrough", root.missionEndType);
    }

    lose()
    {
        ViewManager.instance.show("UI/UIFail");
    }

}