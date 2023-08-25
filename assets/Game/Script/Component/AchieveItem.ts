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
import UIAchieve from "../UI/UIAchieve";
import CClientInstance from "../../../framework/CClientInstance";

const {ccclass, property} = cc._decorator;



/**
 * 成就每一栏
 */
@ccclass
export default class AchieveItem extends cc.Component {
    
    /** 名字 */
    @property(cc.Label)
    labName:cc.Label = null;

    /** 描述 */
    @property(cc.Label)
    labDescribe:cc.Label = null;

    /** 进度文字 */
    @property(cc.Label)
    labPro:cc.Label = null;

    /** 奖励数 */
    @property(cc.Label)
    labAwardNum:cc.Label = null;

    /** 任务完成进度条 */
    @property(cc.ProgressBar)
    proTask:cc.ProgressBar = null;

    /**进度文本**/
    @property(cc.Label)
    proTxt:cc.Label = null;

    /** 奖励icon */
    @property(cc.Sprite)
    sprAward:cc.Sprite = null;

    /** 领取奖励按钮 */
    @property(cc.Node)
    btnGetAward:cc.Node = null;

    /**已领取的文本**/
    @property(cc.Node)
    getLabel:cc.Node = null;

    //星星数组
    @property([cc.Node])
    starNodeArr:cc.Node[] = [];

    //金币icon
    @property(cc.Node)
    goldIcon:cc.Node = null;

    //钻石icon
    @property(cc.Node)
    gemIcon:cc.Node = null;

    //數量文本
    @property(cc.Label)
    numTxt:cc.Label = null;
    
    private data = null;
    
    onLoad () {
        
    }

    /**显示数据内容**/
    showData(data)
    {
        this.data = data;
        this.showIconAndTitle();
        this.setProgress();
        this.setGetBtn();
        this.setStarNum();
    }

    /**显示icon 和 标题**/
    showIconAndTitle()
    {
        this.labName.string = csv.Text.get(this.data.name).text;
        this.labDescribe.string = csv.Text.get(this.data.describe).text;

        let boo = false;
        let num = 0;
        //金币icon的显示
        if(this.data.diamond > 0)
        {
            boo = true;
            num = this.data.diamond;
        }else
        {
            num = this.data.coin;
        }
        this.goldIcon.active = !boo;
        this.gemIcon.active = boo;

        
        this.numTxt.string = num + "";
    }

    //设置进度条
    setProgress()
    {
        let num = 0
        if(this.data.condition == 8 || this.data.condition == 9)
        {//制作和连击
            num = this.idTurnValue(this.data.condition,this.data.data2);
        }else
        {
            num = this.idTurnValue(this.data.condition);
        }
    
        num = num > this.data.data1 ? this.data.data1 : num;

        let pro = Math.floor(num/this.data.data1*10)*0.1;
        this.proTask.progress = pro;
        this.proTxt.string = num + "/" + this.data.data1;
    }

    //设置星星
    setStarNum()
    {
        let num = this.data.ID%10;
        for(let i = 0; i < this.starNodeArr.length; i++)
        {
            if(i < num)
            {
                this.starNodeArr[i].getChildByName("Star_yellow").active = true;
            }else
            {
                this.starNodeArr[i].getChildByName("Star_yellow").active = false;
            }
        }

        if(num >= this.starNodeArr.length){
            this.proTask.progress = 1;
            this.proTxt.string = this.data.data1 + "/" + this.data.data1;
        }
    }

    //设置领取按钮
    setGetBtn()
    {
        let boo = false;
        if(this.checkComplete(this.data.ID))
        {
            boo = true;
        }

        if(!boo)
        {
            if(this.data.condition == 8 || this.data.condition == 9)
            {
                if(this.checkTaskReach(this.data.condition,this.data.data1,this.data.data2))
                {
                    this.btnGetAward.getComponent(cc.Button).interactable = true;
                }else
                {
                    this.btnGetAward.getComponent(cc.Button).interactable = false;
                }
            }else
            {
                if(this.checkTaskReach(this.data.condition,this.data.data1))
                {
                    this.btnGetAward.getComponent(cc.Button).interactable = true;
                }else
                {
                    this.btnGetAward.getComponent(cc.Button).interactable = false;
                }
            }
            
        }

        this.getLabel.active = boo;
        this.btnGetAward.active = !boo;
    }

    //检测任务是否已完成
    checkComplete(id:number)
    {
        for(let i = 0; i  < UserInfo.total_achieve_completetask.length; i++)
        {
            if(UserInfo.total_achieve_completetask[i] == id)
            {
                return true;
            }
        }
        return false;
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

    onDestroy()
    {
        
    }

    //点击领取按钮
    click_get()
    {
        if(this.checkComplete(this.data.ID))
        {//已经领取过就不做处理
            return;
        }

        if(this.data.diamond > 0)
        {//钻石
            UserInfo.addData("diamond",this.data.diamond,true);
            ViewManager.instance.show("UI/UIGetMoney","diamond",Number(this.data.diamond));
        }else
        {//金币
            UserInfo.addData("coin",this.data.coin,true);
            ViewManager.instance.show("UI/UIGetMoney","coin",Number(this.data.coin));
        }

        // Toast.make("领取成功");

        //放入已完成列表中
        UserInfo.total_achieve_completetask.push(this.data.ID);
        //从未完成列表中删除
        let  index = UserInfo.total_achieve_task.indexOf(this.data.ID);
        UserInfo.total_achieve_task.splice(index,1);
        //将新的id放入列表中
        if(this.data.next_id > 0)
        {
            UserInfo.total_achieve_task.push(this.data.next_id);
        }

        //如果已經完成最后一个任务
        if(this.data.next_id == -1)
        {
            UserInfo.total_zuihou_completetask.push(this.data.ID);
        }

        this.setGetBtn();
        UserInfo.save("total_achieve_completetask");
        UserInfo.save("total_achieve_task");
        UserInfo.save("total_zuihou_completetask");
        event.emit("completeAchieveTask");
    }

  
    start () {}
}