import { UserInfo } from "../Common/UserInfo";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import LocalTimeSystem from "../Common/LocalTimeSystem";
const {ccclass, property} = cc._decorator;

@ccclass
export default class TaskLayer extends cc.Component {

    @property(cc.Label)
    timeTxt:cc.Label = null;

    //红点
    @property(cc.Node)
    hotNode:cc.Node = null;

    //第二个红点
    @property(cc.Node)
    hotNodeT:cc.Node = null;

    private _updateTime = 0;

    //随机任务的数量
    private _randNum = 3;

     //临时任务数据
     private _taskData = [];

      //任务数组
    private _taskList = [];

    private _dateTime = 0;

    //成就初始化任务
    private _achieveList = [];

    //刷新红点的间隔时间
    private _hotTime = 0;

    start () {
        let levelData = UserInfo.getLevelData(csv.ConfigData.pudding_open_mission-1);
        if(levelData.star > 0)
        {
            this.initTask();
            this.showCakeData();
        }
        
        let lv = UserInfo.getLevelData(csv.ConfigData.task_open_mission-1);
        if(lv.star > 0)
        {
            this.showDaily();
        }
        
        let lv2 = UserInfo.getLevelData(csv.ConfigData.achievement_open_mission-1);
        if(lv2.star > 0)
        {
            this.initAchieveData();
            this.checkAchieveHot();
        }
        
        event.on("getDailyReward",this.addActive.bind(this),this);
    }

    onDestroy()
    {
        event.off("getDailyReward");
    }

     //显示蛋糕数据
     showCakeData()
     {
         this.setTimeTxt();
         this.setHaveTxt();
     }

     initTask()
     {
        

        this._randNum = csv.ConfigData.daily_task_num;
        this._taskList = [];
        this._taskData = [];

        let count = 0;
        csv.Task.values.forEach((v,i)=>{
            if(v.type == 2)
            {
                this._taskList.push(v);
                let data = this.getData(v.ID);
                this._taskData[v.ID] = data;
                count++;
            }
        });

        if(this._randNum > count)
        {
            this._randNum = count;
        }

        this.createTaskList();

        this.achieveInit();
     }

     //创建一个任务数组
    createTaskList()
    {
        if(typeof(UserInfo.daily_dayTask) == "object" && !UserInfo.daily_dayTask.length)
        {
            UserInfo.daily_dayTask = [];
        }
        if(UserInfo.daily_dayTask && UserInfo.daily_dayTask.length > 0)
        {
            return;
        }

        //创建每天需要做的任务
        let count = 0;
        while(count < this._randNum)
        {
            let index = this.randIndex();
            if(UserInfo.daily_dayTask && UserInfo.daily_dayTask.indexOf(index) == -1)
            {
                UserInfo.daily_dayTask.push(index);
                count++;
            }
        }
        UserInfo.save("daily_dayTask");
    }

     //返回当前任务的需要值
     getData(id)
     {
         for(let i = 0; i < this._taskList.length; i++)
         {
             if(id == this._taskList[i].ID)
             {
                 return this._taskList[i];
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
 
     //设置拥有的数量
     //设置拥有数量文本
     setHaveTxt()
     {
         if(UserInfo.cake_max_num === 0)
         {
             UserInfo.addData("cake_max_num" , csv.ConfigData.pudding_num , true);
             // UserInfo.cake_max_num = UserInfo.cake_up_num*csv.ConfigData.pudding_increase_num + csv.ConfigData.pudding_num;
             UserInfo.addData("cake_num" , csv.ConfigData.pudding_num , true);
         }
     }
 
      //设置时间文本
      setTimeTxt()
      {
          if(UserInfo.cake_get_num > 0)
          {//如果有可以领取的奖励就显示为领取奖励状态
              this.timeTxt.string = "可领取";
          }else
          {
              if(UserInfo.cake_get_time == 0)
              {
                 UserInfo.cake_get_time = this.getTime();
                 UserInfo.save("cake_get_time");
              }
 
              let time = this.getTime();
              let rubTime = UserInfo.cake_get_time + csv.ConfigData.pudding_recover_time - time;
            //   let rubTime = UserInfo.cake_get_time + 30*1000 - time;
              if(rubTime > 0)
              {
                  this.timeTxt.string = "" + this.timeFormat(rubTime/1000);
              }else
              {
                  UserInfo.addData("cake_get_num" , 1 , true);
                  UserInfo.save("cake_get_num");
                  this.timeTxt.string = "可领取";
              }
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
 
      //获取系统当前时间
     getTime()
     {
         return LocalTimeSystem.getSec()*1e3;
     }

     showDaily()
     {
        this.addActive();
        this._dateTime = this.getZtime();
     }

     //添加活跃度
    addActive()
    {
        if(!UserInfo.daily_dayTask)
        {
            return;
        }

        this.hotNode.active = false;

        for(let i = 0; i < UserInfo.daily_dayTask.length; i++)
        {
            let index = UserInfo.daily_dayTask[i];
            
            // if( !UserInfo.daily_dailyTask[index])
            // {
            //     let boo = this.checkTaskComplete(this._taskData[index].condition, this._taskData[index].data1);
            //     if(boo)
            //     {//增加活跃度
            //         UserInfo.daily_dailyTask[index] = 1;
            //         UserInfo.addData("daily_vitality",1,true);
            //         UserInfo.save();
            //     }
            // }

            //显示红点
            if(!UserInfo.daily_taskReward[index] && this._taskData && this._taskData.length > 0)
            {
                let boo = false;
                if(this._taskData[index].condition == 8 || this._taskData[index].condition == 9)
                {
                    boo = this.checkTaskComplete(this._taskData[index].condition, this._taskData[index].data1,this._taskData[index].data2);
                    if(boo)
                    {//增加活跃度
                    this.hotNode.active = true;
                    }
                }else
                {
                    boo = this.checkTaskComplete(this._taskData[index].condition, this._taskData[index].data1);
                    if(boo)
                    {//增加活跃度
                    this.hotNode.active = true;
                    }
                }
            }
        }
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

    update (dt) {

        this._updateTime += dt;
        let levelData = UserInfo.getLevelData(csv.ConfigData.pudding_open_mission-1);
        if(levelData.star > 0)
        {
            this.setTimeTxt();
        }
        
        let lv = UserInfo.getLevelData(csv.ConfigData.task_open_mission-1);
        if(lv.star > 0)
        {
            
            if(this._updateTime >= 1)
            {//更新时间文本
                this._updateTime = 0;
                this.setDailyTimeTxt();
            }
        }

        let lv2 = UserInfo.getLevelData(csv.ConfigData.achievement_open_mission-1);
        if(lv2.star > 0)
        {
            //刷新红点
            this._hotTime += dt;
            if(this._hotTime >= 3)
            {
                this._hotTime = 0;
                this.addActive();
                this.checkAchieveHot();
            }
        }
        
    }


    //获取当天的零点时间
    getZtime()
    {
        let date1 = LocalTimeSystem.getDate();
        let str = date1.getFullYear() + "/" + (date1.getMonth() + 1) + "/" + date1.getDate() + " "+"00:00:00"
        let date2 = new Date(str);
        return date2.getTime();
    }

    //设置时间文本
    setDailyTimeTxt()
    {

        let time = this.getTime();
        let rubTime = this._dateTime + 24*3600*1000 - time;

        if(rubTime > 0)
        {
          
        }else
        {
            //刷新数据
            if(UserInfo.daily_activeReward > 0)
            {
                UserInfo.addData("daily_activeReward",-UserInfo.daily_activeReward,true);
            }

            UserInfo.daily_taskReward = {};
            UserInfo.daily_dailyTask = {};
            UserInfo.daily_dayTask = [];
            this._dateTime = this.getZtime();
            this.initTask();
            UserInfo.save("daily_activeReward");
            UserInfo.save("daily_taskReward");
            UserInfo.save("daily_dailyTask");
            UserInfo.save("daily_dayTask");
            //刷新所有的任务
            event.emit("dailyUpdateTask");
        }
    }

     /**初始化数据**/
     initAchieveData()
     {
         let  taskList = [];
         csv.Task.values.forEach((v,i)=>{
             if(v.type == 3)
             {
                 taskList[v.ID] = v
             }
         });

         if(typeof(UserInfo.total_achieve_task) == "object" && !UserInfo.total_achieve_task.length)
        {
            UserInfo.total_achieve_task = [];
        }

        if(typeof(UserInfo.total_achieve_completetask) == "object" && !UserInfo.total_achieve_completetask.length)
        {
            UserInfo.total_achieve_completetask = [];
        }
               
         if(UserInfo.total_achieve_task.length > 0)
         {//如果已经初始化数据 就不做处理
             return;
         }
 
         if(UserInfo.total_achieve_task.length == 0 && UserInfo.total_achieve_completetask[1001])
         {//所有的任务都已经完成
             return;
         }
 
         taskList.forEach((v,i)=>{
             if(i%10 == 1)
             {
                 UserInfo.total_achieve_task.push(i);
             }
         })
     }

    //设置成就的红点显示
    checkAchieveHot()
    {
        this.hotNodeT.active = false;
        if(!UserInfo.total_achieve_task || UserInfo.total_achieve_task.length == 0)
        {
            return;
        }
        
        let boo = false;
        UserInfo.total_achieve_task.forEach((v,i)=>{
            let data =  this._achieveList[v];
            if(data.condition == 8 || data.condition == 9)
            {
                boo = this.checkAchieveTaskReach(data.condition,data.data1,data.data2);
                if(boo)
                {
                    this.hotNodeT.active = true;
                }
            }else
            {
                boo = this.checkAchieveTaskReach(data.condition,data.data1);
                if(boo)
                {
                    this.hotNodeT.active = true;
                }
            }
         }
        );
    }

    //成就初始化数据
    achieveInit()
    {
        this._achieveList = [];
        csv.Task.values.forEach((v,i)=>{
            if(v.group > 0)
            {
                this._achieveList[v.ID] = v
            }
        });
    }

     //检测任务是否达到任务条件
     checkAchieveTaskReach(id,num,dataId?:number)
     {   
         let end = 0;
         switch(id){
            case 1://登陆天数 （ 天数 ）
                end = UserInfo.total_login;
                break;
            case 2://活跃度
                end = UserInfo.daily_vitality;
                break;
            case 6://服务客人 （ 次数 ）
                end = UserInfo.total_customer;
                break;
            case 7://赚取金币 （ 数量 ）
                end = UserInfo.total_earn_gold;
                break;
            case 8:// 制作  （ 次数  食物ID ）
                end = UserInfo.daily_food_makeStatData[dataId];
                break;
            case 9://连击  （ 次数  X连击 ）
                end = UserInfo["total_combo_" + dataId];
                break;
            case 11://使用布丁 （ 次数 ）
                end = UserInfo.daily_cake_use;
                break;
            case 12://使用复活 （ 次数 ）
                end = UserInfo.total_revivive;
                break;
            case 13://使用更多客人 （ 次数 ）
                end = UserInfo.total_user_more_customer;
                break;
            case 14://使用更多时间 （ 次数 ）
                end = UserInfo.total_user_more_time;
                break;
            case 16://收到赞 （ 次数）
                end = UserInfo.total_likes;
                break;
            case 21://花费金币升级食物 （ 金币数量 ）
                end = UserInfo.total_money_for_food;
                break;
            case 22://花费金币升级厨具 （ 金币数量 ）
                end = UserInfo.total_money_for_chujv;
                break;
        }
        if(!end)
        {
            end = 0;
        }
         return num <= end
     }
}
