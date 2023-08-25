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

const {ccclass, property} = cc._decorator;

/**
 * 成就界面
 */
@ccclass
export default class UIAchieve extends cc.Component {

    @property(cc.Node)
    nodeContent:cc.Node;

    @property(cc.Prefab)
    preItem:cc.Prefab;
 
    private _achieveList:csv.Task_Row[] = [];

    private _isFirst = true;

    //任务列表数组
    private _taskList = [];
    
    //节点数组
    private _nodeList = [];

    onLoad(){
        this._isFirst = true;
        this.initData(); 
        this.showPanel();
        event.on("completeAchieveTask",this.updateTask.bind(this),this);
    }

    onDestroy()
    {
        this._taskList = null;
        event.off("completeAchieveTask");
    }
    
    onShown () {
        if(this._isFirst){
            this._isFirst = false;
            return;
        } 
        this.showPanel();
    }

    /**初始化数据**/
    initData()
    {
        if(typeof(UserInfo.total_zuihou_completetask) == "object" && !UserInfo.total_zuihou_completetask.length)
        {
            UserInfo.total_zuihou_completetask = [];
        }
        this._taskList = [];
        csv.Task.values.forEach((v,i)=>{
            if(v.type == 3)
            {
                this._taskList[v.ID] = v
            }
        });

        // if(UserInfo.total_achieve_task.length > 0)
        // {//如果已经初始化数据 就不做处理
        //     return;
        // }

        // if(UserInfo.total_achieve_task.length == 0 && UserInfo.total_achieve_completetask[1001])
        // {//所有的任务都已经完成
        //     return;
        // }

        this._taskList.forEach((v,i)=>{
            // 每项成就第一个
            if(i%10 == 1)
            {
                let can = true;
                // 判断是否是已经完成过的任务
                for(let j = 0;j < UserInfo.total_achieve_completetask.length;j++){
                    let id = UserInfo.total_achieve_completetask[j];
                    if(csv.Task.get(id).group == csv.Task.get(i).group){
                        if(id == i){
                            i = csv.Task.get(id).next_id;
                            if(i == -1){
                                can = false;
                                break;
                            }else{
                                j = -1;
                                continue;
                            }
                        }
                     
                    }
                }

                // 检查最终完成数组
                if(can){
                    for(let n = 0; n < UserInfo.total_zuihou_completetask.length; n++){
                        let tempid = UserInfo.total_zuihou_completetask[n];
                        if(csv.Task.get(i).group == csv.Task.get(tempid).group){
                            can = false;
                            break;
                        }
                    }
                }

                // 防止重复添加
                if(can) {
                    let can2 = true;
                    for(let k in UserInfo.total_achieve_task){
                        let id2 = UserInfo.total_achieve_task[k];
                        if(id2 == i){
                            can2 = false;
                            break;
                        } 
                    }
                    can2 && UserInfo.total_achieve_task.push(i);
                }
            }
        });

        this.fixData();


    }

    /** 修复数据 */
    fixData(){
        for(let i = 0; i < UserInfo.total_achieve_task.length; i++){
            let id = UserInfo.total_achieve_task[i];
            let delId = null;
            for(let j = 0; j < UserInfo.total_achieve_task.length; j++){
                let id2 = UserInfo.total_achieve_task[j];
                if(csv.Task.get(id2).group == csv.Task.get(id).group && id2 != id){
                    delId = Number(id) >= Number(id2) ? id2 : id;
                    break;
                }
            }
            if(delId){
                let index = UserInfo.total_achieve_task.indexOf(delId);
                UserInfo.total_achieve_task.splice(index,1);
                i--;
            }
                
        }

        for(let i = 0; i < UserInfo.total_achieve_task.length; i++){
            let id = UserInfo.total_achieve_task[i];
            let delId = null;
            for(let j = 0; j < UserInfo.total_zuihou_completetask.length; j++){
                let id2 = UserInfo.total_zuihou_completetask[j];
                if(csv.Task.get(id2).group == csv.Task.get(id).group){
                    delId = id;
                    break;
                }
            }
            if(delId){
                let index = UserInfo.total_achieve_task.indexOf(delId);
                UserInfo.total_achieve_task.splice(index,1);
                i--;
            }
                
        }
    }

    //显示面板数据
    showPanel()
    {
        let self = this;
        let leng = 0
        let count = 0;
        self.nodeContent.height = 0;
        this.clreaNode();
       
        this.itemSort();

        leng += UserInfo.total_achieve_task.length;
        let heig = 0;
        //显示已接的任务
        for(let i = 0; i < UserInfo.total_achieve_task.length; i++)
        {
            let tempD = this._taskList[UserInfo.total_achieve_task[i]];
            if(tempD.unlock && !UserInfo.unlock_chapters[tempD.unlock]){
                continue;
            }

            let node = cc.instantiate(self.preItem);
            heig = node.height;
            node.getComponent("AchieveItem").showData(this._taskList[UserInfo.total_achieve_task[i]]);
            this.nodeContent.addChild(node);
            this._nodeList.push(node);
        }

        this.sortComplete();
        UserInfo.total_zuihou_completetask.forEach((v,i)=>{
            let node = cc.instantiate(self.preItem);
            node.getComponent("AchieveItem").showData(this._taskList[v]);
            self.nodeContent.addChild(node);
            self._nodeList.push(node);
            count++;
        })
        leng += count;

        // UserInfo.total_achieve_completetask.forEach((v,i)=>{
        //     let node = cc.instantiate(self.preItem);
        //     node.getComponent("AchieveItem").showData(this._taskList[v]);
        //     self.nodeContent.addChild(node);
        //     self._nodeList.push(node);
        //     count++;
        // })
        

        self.nodeContent.height = leng*(heig + 10) -10;
    }


    updateTask()
    {
        this.showPanel();
    }

    start () {

    }

    sortComplete()
    {
        if(UserInfo.total_zuihou_completetask.length == 0 )
        {
            return;
        }
       
        UserInfo.total_zuihou_completetask.sort((a,b)=>{
            let dataA =  this._taskList[a];
            let dataB =  this._taskList[b];
            if(dataA.group < dataB.group)
            {
                return -1;
            }
            return 0;
        })
    }

    /** 成就排序 */
    itemSort(){
        if(UserInfo.total_achieve_task.length == 0)
        {
            return;
        }

          //先根据组排序
        // UserInfo.total_achieve_task.sort((a,b)=>{
        //     let dataA =  this._taskList[a];
        //     let dataB =  this._taskList[b];

        //     let  booA = false;
        //     let  booB = false;
        //     if(dataA.condition == 8 || dataA.condition == 9)
        //     {
        //         booA = this.checkTaskReach(dataA.condition,dataA.data1,dataA.data2);
        //     }else
        //     {
        //         booA = this.checkTaskReach(dataA.condition,dataA.data1);
        //     }

        //     if(dataB.condition == 8 || dataB.condition == 9)
        //     {
        //         booB = this.checkTaskReach(dataB.condition,dataB.data1,dataB.data2);
        //     }else
        //     {
        //         booB = this.checkTaskReach(dataB.condition,dataB.data1);
        //     }

        //     if(dataA.group < dataB.group)
        //         {
        //             return -1;
        //         }
        //     return 1;
        // })

         //再根据完成度排序
        UserInfo.total_achieve_task.sort((a,b)=>{
            let dataA =  this._taskList[a];
            let dataB =  this._taskList[b];
            let  booA = false;
            let  booB = false;
            if(dataA.condition == 8 || dataA.condition == 9)
            {
                booA = this.checkTaskReach(dataA.condition,dataA.data1,dataA.data2);
            }else
            {
                booA = this.checkTaskReach(dataA.condition,dataA.data1);
            }

            if(dataB.condition == 8 || dataB.condition == 9)
            {
                booB = this.checkTaskReach(dataB.condition,dataB.data1,dataB.data2);
            }else
            {
                booB = this.checkTaskReach(dataB.condition,dataB.data1);
            }

            if(booA && booB){
                return dataA.group - dataB.group;
            }

            if(booA)
            {
                return -1;
            }

            if(booB){
                return 1;
            }

            if(!booA && !booB){
                return dataA.group - dataB.group;
            }
       
        })

        //再对达标的进行重新排序
        // UserInfo.total_achieve_task.sort((a,b)=>{
        //     let dataA =  this._taskList[a];
        //     let dataB =  this._taskList[b];
        //     let  booA = false;
        //     let  booB = false;
        //     if(dataA.condition == 8 || dataA.condition == 9)
        //     {
        //         booA = this.checkTaskReach(dataA.condition,dataA.data1,dataA.data2);
        //     }else
        //     {
        //         booA = this.checkTaskReach(dataA.condition,dataA.data1);
        //     }

        //     if(dataB.condition == 8 || dataB.condition == 9)
        //     {
        //         booB = this.checkTaskReach(dataB.condition,dataB.data1,dataB.data2);
        //     }else
        //     {
        //         booB = this.checkTaskReach(dataB.condition,dataB.data1);
        //     }

        //     if(booA && booB)
        //     {
        //         if(dataA.group < dataB.group)
        //         {
        //             return -1;
        //         }
        //     }
        //     return 0;
        // })
    }

    /** 获得成就的数量 */
    getAchieveFirstList(){
        if(this._achieveList.length > 0) return;
        let oldGroup = 0;
     
        csv.Task.values.forEach((value:csv.Task_Row)=>{
            if(value.type == 3 && value.group > 0 && value.group != oldGroup){
                this._achieveList.push(value);
                oldGroup = value.group;
                
            }
        })
    }

    //检测任务是否达到任务条件
    checkTaskReach(id,num,dataId?:number)
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
                end = UserInfo.total_food_makeStatData[dataId];
                break;
            case 9://连击  （ 次数  X连击 ）
                end = UserInfo["total_combo_" + dataId];
                break;
            case 11://使用布丁 （ 次数 ）
                end = UserInfo.total_use_puding;
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
                end = UserInfo.total_customer;
                break;
            case 7://赚取金币 （ 数量 ）
                end = UserInfo.total_earn_gold;
                break;
            case 8:// 制作  （ 次数  食物ID ）
                end = UserInfo.total_food_makeStatData[dataId];
                break;
            case 9://连击  （ 次数  X连击 ）
                end = UserInfo["total_combo_" + dataId];
                break;
            case 11://使用布丁 （ 次数 ）
                end = UserInfo.total_use_puding;
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

        return end;
    }
    
    click_close(){

        this.clreaNode();
        UserInfo.save();
        this.getComponent(View).hide(); 
     
    }

    clreaNode()
    {
        if(!this._nodeList)
        {
            return;
        }

        for(let i = 0; i < this._nodeList.length; i++)
        {
            if(this._nodeList[i])
            {
                this._nodeList[i].destroy();
            }
        }
    }

 
}
