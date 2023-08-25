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
import ViewManager from "../../../framework/plugin_boosts/ui/ViewManager";

const {ccclass, property} = cc._decorator;

/**
 * 成就界面
 */
@ccclass
export default class UIDaily extends cc.Component {

    //任务条的预制体
    @property(cc.Prefab)
    taskItemPrefab:cc.Prefab = null;

    //领取按钮
    @property(cc.Node)
    giftBnt:cc.Node = null;

    //显示容器
    @property(cc.Node)
    showContent:cc.Node = null;

    //时间文本
    @property(cc.Label)
    timeTxt:cc.Label = null;

    //进度条
    @property(cc.ProgressBar)
    progress:cc.ProgressBar = null;

    //进度文本
    @property(cc.Label)
    proTxt:cc.Label = null;

    private _isFirst = true;

    //任务数组
    private _taskList = [];

    private _dateTime = 0;

    //随机任务的数量
    private _randNum = 3;

    //节点数组
    private _nodeList = [];

    //临时任务数据
    private _taskData = [];

    //更新时间
    private _dailyTime = 0;

    //活跃度数据
    private  _yuedata = null;

    onLoad(){
        this._isFirst = true;
        this.initData();
        this.showPanel();
        event.on("updataDailyItem",this.upDataItem.bind(this),this);
        event.on("updataDailyAcitve",this.updateActiveStatu.bind(this),this);
        event.on("dailyUpdateTask",this.upDataItem.bind(this),this);
    }

    onDestroy()
    {
        event.off("updataDailyItem");
        event.off("updataDailyAcitve");
    }
    
    onShown () {
        if(this._isFirst){
            this._isFirst = false;
            return;
        } 
        this.initData();
        this.showPanel();
    }

    //初始化数据
    initData()
    {
       
        this._taskList = [];
        this._taskData = [];
        this._dateTime = this.getZtime();
        csv.Task.values.forEach((v,i)=>{
            if(v.type == 2)
            {
                this._taskList.push(v);
            }
        });
        
        this.createTaskList();
    }

    showPanel()
    {
        csv.Task.values.forEach((v,i)=>{
            if(v.type == 1)
            {
                this._yuedata = v;
            }
        });

        this._randNum = csv.ConfigData.daily_task_num;
        this._randNum = this._randNum > this._taskList.length ? this._taskList.length : this._randNum;

        this.setButtonStatu();
        this.addTaskItem();
        this.setProgress();
        this.setTimeTxt();
    }

    //活跃度更新刷新状态
    updateActiveStatu()
    {
        this.setProgress();
        this.setButtonStatu();
    }

    //设置进度
    setProgress()
    {
        let num = this.getActiveNum();
        let  active = UserInfo.daily_vitality;
        active = UserInfo.daily_vitality > num ? num : UserInfo.daily_vitality;
        let pro = Math.floor((UserInfo.daily_vitality /num)*10)/10;
        pro = pro > 1 ? 1 : pro;
        this.progress.progress = pro;
        this.proTxt.string = UserInfo.daily_vitality + "/" + num;
    }

    //创建一个任务数组
    createTaskList()
    {
        if(UserInfo.daily_dayTask.length > 0)
        {
            return;
        }

        //创建每天需要做的任务
        let count = 0;
        while(count < this._randNum)
        {
            let index = this.randIndex();
            if(UserInfo.daily_dayTask.indexOf(index) == -1)
            {
                UserInfo.daily_dayTask.push(index);
                UserInfo.daily_dailyTask[index] = 0;
                count++;
            }
        }
    }

    //随机数
    randIndex()
    {
        let index = 0;
        index = Math.floor(Math.random()*this._taskList.length);
        return this._taskList[index].ID;
    }

    upDataItem()
    {
        this.clreaData();
        this.addTaskItem();
    }

    //添加任务
    addTaskItem()
    {
       
         //排序
         UserInfo.daily_dayTask.sort((a,b)=>{    

            if(!UserInfo.daily_taskReward[a])
            {
                return -1;
            }

            return 0;
        }
        )

         //排序
         UserInfo.daily_dayTask.sort((a,b)=>{
             
            if(!UserInfo.daily_taskReward[a])
            {
                let dataA = this.getData(a);
                let dataB = this.getData(b);
                let booA = false;
                let booB = false;
                if(dataA.condition == 8 || dataA.condition == 9)
                {//类型 8 和 9 参数不一样
                    booA = this.checkTaskComplete(dataA.condition,dataA.data1,dataA.data2);
                   
                }else
                {
                    booA = this.checkTaskComplete(dataA.condition,dataA.data1);
                }

                if(dataB.condition == 8 || dataB.condition == 9)
                {//类型 8 和 9 参数不一样
                    booB = this.checkTaskComplete(dataB.condition,dataB.data1,dataB.data2);
                }else
                {
                    booB = this.checkTaskComplete(dataB.condition,dataB.data1);
                }

                if(booA)
                {
                    return -1;
                }
            }
            return 0;
            }
        )

        //排序
        UserInfo.daily_dayTask.sort((a,b)=>{
             
            if(!UserInfo.daily_taskReward[a])
            {
                let dataA = this.getData(a);
                let dataB = this.getData(b);
                let booA = false;
                let booB = false;
                if(dataA.condition == 8 || dataA.condition == 9)
                {//类型 8 和 9 参数不一样
                    booA = this.checkTaskComplete(dataA.condition,dataA.data1,dataA.data2);
                   
                }else
                {
                    booA = this.checkTaskComplete(dataA.condition,dataA.data1);
                }

                if(dataB.condition == 8 || dataB.condition == 9)
                {//类型 8 和 9 参数不一样
                    booB = this.checkTaskComplete(dataB.condition,dataB.data1,dataB.data2);
                }else
                {
                    booB = this.checkTaskComplete(dataB.condition,dataB.data1);
                }

                if(!booA && !booB)
                {
                    if(dataA.group < dataB.group)
                    {
                        return -1;
                    }
                }
            }
            return 0;
            }
        )

        //显示任务条
        this._taskData = [];
        this._nodeList = [];
        let heigt = 0;
        let leng = UserInfo.daily_dayTask.length;
        if(this.showContent){
            this.showContent.height = 0;
            if(!UserInfo.daily_dayTask)
            {
                UserInfo.daily_dayTask = [];
            }
            for(let i = 0; i < UserInfo.daily_dayTask.length; i++)
            {
                let node = cc.instantiate(this.taskItemPrefab);
                heigt = node.height;
                node.y = i*node.height;
                this._nodeList.push(node);
                let data = this.getData(UserInfo.daily_dayTask[i]);
                this._taskData[i] = data;
                //显示条条的数据
                node.getComponent("DailyItem").showData(data);
                this.showContent.addChild(node);
            }
            this.showContent.height = (heigt + 5)*leng - 5;
        }
    }

    //返回当前任务的需要值
    getData(id)
    {
        if(!this._taskList)
        {
            this._taskList = [];
        }
        for(let i = 0; i < this._taskList.length; i++)
        {
            if(id == this._taskList[i].ID)
            {
                return this._taskList[i];
            }
        }
    }

    //刷新任务
    updateTask()
    {
        UserInfo.daily_dailyTask = {};
    }

    //设置时间文本
    setTimeTxt()
    {

        let time = this.getTime();
        let rubTime = this._dateTime + 24*3600*1000 - time;
    
        if(rubTime > 0)
        {
            this.timeTxt.string = "" + this.timeFormat(rubTime/1000);
        }else
        {
            this._dateTime = this.getZtime();
            this.timeTxt.string = "00:00:00";
        }
    }

    //设置时间格式
    timeFormat(rubTime:number):string
    {
        let str = "";
        let h = Math.floor(rubTime/3600%24);
        if(h >= 10)
        {
            str += h+ ":";
        }else
        {
            str += "0"+h+":";
        }

        let m = Math.floor(rubTime / 60%60);
        if(m >= 10)
        {
            str += m + ":";
        }else
        {
            str += "0"+m+":";
        }

        let s = Math.floor(rubTime % 60);
        if(s >= 10)
        {
            str += s + "";
        }else
        {
            str += "0"+s;
        }
        return str;
    }

    //点击领取奖励
    click_get()
    {
        var needNum = this.getActiveNum();
        if(UserInfo.daily_vitality < needNum)
        {
            Toast.make("活跃度没达到");
            return;
        }

        if(this._yuedata.diamond > 0)
        {
            ViewManager.instance.show("UI/UIGetMoney","diamond",Number(this._yuedata.diamond));
        }else{
            ViewManager.instance.show("UI/UIGetMoney","coin",Number(this._yuedata.diamond.coin));
        }
        // let str = "恭喜获得" + num + "钻";
        // Toast.make(str);

        UserInfo.addData("daily_activeReward",1,true);
        this.setButtonStatu();
    }

    //获取系统当前时间
    getTime()
    {
        var date = new Date();
        return date.getTime();
    }

    //设置按钮的状态
    setButtonStatu()
    {
        var node = this.node.getChildByName("leftSprite")
        var needNum = this.getActiveNum();
        if(UserInfo.daily_vitality >= needNum)
        {
            if(UserInfo.daily_activeReward  == 0)
            {
                node.getChildByName("getBtn").active = true;
                this.node.getChildByName("leftSprite").getChildByName("proNode").active = false;
                node.getChildByName("noticeTxt").getComponent(cc.Label).string = "";
            }else
            {
                this.node.getChildByName("leftSprite").getChildByName("proNode").active = false;
                node.getChildByName("noticeTxt").getComponent(cc.Label).string = "已领取奖励"; 
                node.getChildByName("getBtn").active = false;
            }
        }else
        {
            if(UserInfo.daily_activeReward > 0)
            {
                node.getChildByName("noticeTxt").getComponent(cc.Label).string = "已领取奖励"; 
            }else{
                node.getChildByName("noticeTxt").getComponent(cc.Label).string = "活跃度达到三点可领取奖励"; 
            }
            node.getChildByName("getBtn").active = false;
        }
    }

    getActiveData()
    {
        for(let i = 0; i < this._taskList.length; i++)
        {
            if(this._taskList[i].type == 1)
            {
                return this._taskList[i];
            }
        }
        return 3;
    }

    //获取需要的活跃度值
    getActiveNum()
    {
        for(let i = 0; i < this._taskList.length; i++)
        {
            if(this._taskList[i].type == 1)
            {
                return this._taskList[i].data1;
            }
        }
        return 3;
    }

    //获取钻石数量
    getActiveDia()
    {
        for(let i = 0; i < this._taskList.length; i++)
        {
            if(this._taskList[i].type == 1)
            {
                return this._taskList[i].diamond;
            }
        }
        return 50;
    }

    start () {

    }

    //检测任务是否完成
    checkTaskComplete(id,num,dataId?:number)
    {   
        let end;
        switch(id){
            case 1://登陆天数 （ 天数 ）
                end = UserInfo.total_login;
                break;
            case 2://活跃度
                end = UserInfo.daily_vitality;
                break;
            case 6://服务客人 （ 次数 ）
                end = UserInfo.daily_customer;
                break;
            case 7://赚取金币 （ 数量 ）
                end = UserInfo.daily_earn_gold;
                break;
            case 8:// 制作  （ 次数  食物ID ）
                end = UserInfo.daily_food_makeStatData[dataId];
                break;
            case 9://连击  （ 次数  X连击 ）
                end = UserInfo["daily_combo_" + dataId];
                break;
            case 11://使用布丁 （ 次数 ）
                end = UserInfo.daily_cake_use;
                break;
            case 12://使用复活 （ 次数 ）
                end = UserInfo.daily_revivive;
                break;
            case 13://使用更多客人 （ 次数 ）
                end = UserInfo.daily_user_more_customer;
                break;
            case 14://使用更多时间 （ 次数 ）
                end = UserInfo.daily_user_more_time;
                break;
            case 16://收到赞 （ 次数）
                end = UserInfo.daily_likes;
                break;
            case 21://花费金币升级食物 （ 金币数量 ）
                end = UserInfo.daily_money_for_food;
                break;
            case 22://花费金币升级厨具 （ 金币数量 ）
                end = UserInfo.daily_money_for_chujv;
                break;
        }
        
        if(!end)
        {
            end = 0;
        }
        return num <= end
    }

    /** 成就ID转为对应值 */
    idTurnValue(id:number,dataId?:number){
        let end;
        switch(id){
            case 1://登陆天数 （ 天数 ）
                end = UserInfo.total_login;
                break;
            case 2://活跃度
                end = UserInfo.daily_vitality;
                break;
            case 6://服务客人 （ 次数 ）
                end = UserInfo.daily_customer;
                break;
            case 7://赚取金币 （ 数量 ）
                end = UserInfo.daily_earn_gold;
                break;
            case 8:// 制作  （ 次数  食物ID ）
                end = UserInfo.daily_food_makeStatData[dataId];
                break;
            case 9://连击  （ 次数  X连击 ）
                end = UserInfo["daily_combo_" + dataId];
                break;
            case 11://使用布丁 （ 次数 ）
                end = UserInfo.daily_cake_use;
                break;
            case 12://使用复活 （ 次数 ）
                end = UserInfo.daily_revivive;
                break;
            case 13://使用更多客人 （ 次数 ）
                end = UserInfo.daily_user_more_customer;
                break;
            case 14://使用更多时间 （ 次数 ）
                end = UserInfo.daily_user_more_time;
                break;
            case 16://收到赞 （ 次数）
                end = UserInfo.daily_likes;
                break;
            case 21://花费金币升级食物 （ 金币数量 ）
                end = UserInfo.daily_money_for_food;
                break;
            case 22://花费金币升级厨具 （ 金币数量 ）
                end = UserInfo.daily_money_for_chujv;
                break;
        }
        if(!end)
        {
            end = 0;
        }
        return end;
    }
    
    click_close(){

        UserInfo.save();
        this.getComponent(View).hide(); 

        this.clreaData();
     
    }

    clreaData()
    {
        if( this._nodeList)
        {
            for(let i = 0; i < this._nodeList.length; i++)
            {
                if(this._nodeList[i])
                {
                    this._nodeList[i].destroy();
                }
            }
        }
    }

    //获取当天的零点时间
    getZtime()
    {
        let date1 = new Date();
        let str = date1.getFullYear() + "/" + (date1.getMonth() + 1) + "/" + date1.getDate() + " "+"00:00:00"
        let date2 = new Date(str);
        return date2.getTime();
    }

    update(dt)
    {
        this._dailyTime += dt;
        if(this._dailyTime > 1)
        {
            this._dailyTime = 0;
            this.setTimeTxt();
        }
    }
}
