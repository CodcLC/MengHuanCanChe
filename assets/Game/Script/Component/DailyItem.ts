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
import { instantiate } from './../../../../creator.d';

const {ccclass, property} = cc._decorator;



/**
 * 每日任务条
 */
@ccclass
export default class DailyItem extends cc.Component {
    
    //icon
    @property(cc.Sprite)
    icon:cc.Sprite = null;

    //title
    @property(cc.Label)
    titleTxt:cc.Label = null;

    //notice
    @property(cc.Label)
    noticeTxt:cc.Label = null;

    //进度条
    @property(cc.ProgressBar)
    progrees:cc.ProgressBar = null;

    //进度文本
    @property(cc.Label)
    proTxt:cc.Label = null;

    //金币图标
    @property(cc.Node)
    goldIcon:cc.Node = null;

    //钻石图标
    @property(cc.Node)
    gemIcon:cc.Node = null;

    //数量文本
    @property(cc.Label)
    numTxt:cc.Label = null;

    //领取按钮
    @property(cc.Button)
    getBtn:cc.Button = null;

    //已领取
    @property(cc.Node)
    getLabel:cc.Node = null;

    private _data = null;
    
    onLoad () {
        
    }

    onDestroy()
    {
        
    }

    showData(data)
    {
        this._data = data;
        let str = csv.Text.get(data.name).text;
        this.titleTxt.string = str;

        this.noticeTxt.string = csv.Text.get(data.describe).text;

        let boo = false;
        let num = 0;
        //设置图标
        if(data.diamond > 0)
        {
            boo = true;
            num = data.diamond;
        }else
        {
            num = data.coin;
        }

        this.goldIcon.active = !boo;
        this.gemIcon.active = boo;
        this.numTxt.string = num + "";

        

        let completeNum = 0
        if(data.condition == 8 || data.condition == 9)
        {
            completeNum = this.idTurnValue(data.condition,data.data2);
        }else
        {
            completeNum = this.idTurnValue(data.condition);
        }

        // cc.log("rrrrrrrrrrrrr",data.condition);

        completeNum = completeNum > data.data1 ? data.data1 : completeNum;
        
        let pro = Math.floor((completeNum/data.data1)*10)/10;
        pro = pro > 1 ? 1 : pro;

        this.progrees.progress = pro;

        this.proTxt.string = completeNum + "/" + data.data1;

        this.getBtn.interactable = false;
        this.getLabel.active = false;
        //显示领取按钮
        if(!UserInfo.daily_taskReward[data.ID])
        {
            if(completeNum >= data.data1)
            {
                this.getBtn.interactable = true;
                this.getBtn.node.active = true;
                this.getLabel.active = false;
                this.getBtn.getComponent(cc.Button).interactable = true;
            }
        }else
        {
            this.getBtn.interactable = true;
            this.getBtn.node.active = false;
            this.getLabel.active = true;
            this.getBtn.getComponent(cc.Button).interactable = false;
        }
    }

    //点击领取按钮
    click_get()
    {
        if(UserInfo.daily_taskReward[this._data.ID])
        {
            return;
        }

        if(this._data.diamond > 0)
        {
            UserInfo.addData("diamond",this._data.diamond,true);
            ViewManager.instance.show("UI/UIGetMoney","diamond",Number(this._data.diamond));
        }else
        {
            UserInfo.addData("coin",this._data.coin,true);
            ViewManager.instance.show("UI/UIGetMoney","coin",Number(this._data.coin));
        }

        // Toast.make("领取奖励成功");
        UserInfo.daily_taskReward[this._data.ID] = 1;
        this.getBtn.interactable = true;
        this.getBtn.node.active = false;
        this.getLabel.active = true;//已领取
        this.getBtn.getComponent(cc.Button).interactable = false;

        if( !UserInfo.daily_dailyTask[this._data.ID])
        {
            UserInfo.daily_dailyTask[this._data.ID] = 1;
            UserInfo.addData("daily_vitality",1,true);
        }

        UserInfo.save("diamond");
        UserInfo.save("coin");
        UserInfo.save("daily_vitality");
        UserInfo.save("daily_taskReward");

        event.emit("getDailyReward");
        event.emit("updataDailyItem");
        event.emit("updataDailyAcitve");
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

    start () {}
}