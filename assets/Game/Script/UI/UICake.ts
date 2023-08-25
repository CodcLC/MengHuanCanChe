

import View from "../../../framework/plugin_boosts/ui/View";
import { UserInfo ,LevelData} from "../Common/UserInfo";
import { Toast } from "../../../framework/plugin_boosts/ui/ToastManager";
import LocalTimeSystem from "../Common/LocalTimeSystem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    //拥有蛋糕数量的文本
    @property(cc.Label)
    haveTxt:cc.Label = null;

    //当前的最大容量
    @property(cc.Label)
    currCapacity:cc.Label = null;

    //下一个的最大容量
    @property(cc.Label)
    nextCapacity:cc.Label = null;

    //升级需要的数量文本
    @property(cc.Label)
    needTxt:cc.Label = null;

    //倒计时文本
    @property(cc.Label)
    timeTxt:cc.Label = null;

    //第一个标题文本
    @property(cc.Label)
    titleTxt:cc.Label = null;

    //第二个标题文本
    @property(cc.Label)
    titleTxtS:cc.Label = null;

    //领取按钮
    @property(cc.Node)
    getBtn:cc.Node = null;

    //第二个领取按钮
    @property(cc.Node)
    getBtnS:cc.Node = null;

    //第二个倒计时文本
    @property(cc.Label)
    timeTxtS:cc.Label = null;

    //第一个领取文本
    @property(cc.Label)
    getTxt:cc.Label = null;

    //第一个领取文本
    @property(cc.Label)
    getTxtS:cc.Label = null;

    //升级按钮
    @property(cc.Node)
    upBtn:cc.Node = null;

    private _isFirst = true;

    private _priceList = [];

    //多长时间更新一次文本
    private _updateTime = 1;

    //当前按钮
    private _currBtn = null;
    //当前时间文本
    private _currTimeTxt = null;
    //倒计时标题
    private _currTitleTxt = null;
    //当前领取文本
    private _currGetTxt = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._isFirst = true;
        this.initData();
        this.shoePanel();
    }

    onShown () {
        if(this._isFirst){
            this._isFirst = false;
            return;
        } 
        this.shoePanel();
    }

    //初始化数据
    initData()
    {
        //初始化最大的容量
        // if(UserInfo.cake_max_num === 0)
        // {
        //     cc.log("ddddddddd");
        //     UserInfo.cake_max_num = UserInfo.cake_up_num*csv.ConfigData.pudding_increase_num + csv.ConfigData.pudding_num;
        //     UserInfo.addData("cake_num" , csv.ConfigData.pudding_num , true);
        // }

        //初始化领取记录时间
        if(UserInfo.cake_get_time == 0)
        {
            UserInfo.cake_get_time = this.getTime();
            UserInfo.save();
        }

        this._priceList = csv.ConfigData.pudding_increase_price.split("&");
    }

    start () {

    }

    //显示面板数据
    shoePanel()
    {
        this.setMaxStatu();
        this.setHaveTxt();
        this.setCapacityTxt();
        this.setNeedTxt();
        this.setTimeTxt();
    }

    //设置最大状态的的处理
    setMaxStatu()
    {
        let boo = false;
        if(csv.ConfigData.pudding_increase_limit <=  UserInfo.cake_up_num)
        {
            // let node = this.node.getChildByName("UISHOPGoBuy").getChildByName("bg").getChildByName("Btn_share");
            // node.getChildByName("uptxt").setPosition(cc.v2(0,0));
            // node.getChildByName("needTxt").active = false;
            // node.getChildByName("DiamondIcon").active = false;
            // node.getComponent(cc.Button).interactable = false;

            let node2 = this.node.getChildByName("bg").getChildByName("Lv_Can_BG");
            node2.getChildByName("param_2").active = false;
            node2.getChildByName("maxNotice").active = true;
            boo = true;
            this._currTimeTxt = this.timeTxtS;
            this._currTitleTxt = this.titleTxtS;
            this._currGetTxt = this.getTxtS;
        }else
        {
            this._currGetTxt = this.getTxt;
            this._currTitleTxt = this.titleTxt;
            this._currTimeTxt = this.timeTxt;
        }

        this.upBtn.active = !boo;
        this.getBtn.active = !boo;
        this.getBtnS.active = boo;
    }

    //设置拥有数量文本
    setHaveTxt()
    {
        this.haveTxt.string = UserInfo.cake_num + "/" + UserInfo.cake_max_num;
    }

    //设置容量文本
    setCapacityTxt()
    {
        if(UserInfo.cake_up_num >= csv.ConfigData.pudding_increase_limit)
        {//设置下一容量文本
            this.currCapacity.string = UserInfo.cake_max_num + "";
            this.nextCapacity.string = "";
        }else
        {
            this.currCapacity.string = UserInfo.cake_max_num + "";
            this.nextCapacity.string = UserInfo.cake_max_num + csv.ConfigData.pudding_increase_num + "";
        }
    }

    //设置需要的文本
    setNeedTxt()
    {
        if(csv.ConfigData.pudding_increase_limit <=  UserInfo.cake_up_num)
        {
            this.needTxt.string = 0 + "";
        }else
        {
            this.needTxt.string = this._priceList[UserInfo.cake_up_num];
        }
    }

    //设置时间文本
    setTimeTxt()
    {
        let  boo = false;
        if(UserInfo.cake_get_num > 0)
        {//如果有可以领取的奖励就显示为领取奖励状态
            this.setButtonColor();
            boo = true;
        }else
        {
            let time = this.getTime();
            let rubTime = UserInfo.cake_get_time + csv.ConfigData.pudding_recover_time - time;
            if(rubTime > 0)
            {
                this._currTimeTxt.string =  this.timeFormat(rubTime/1000) + "";
            }else
            {
                UserInfo.addData("cake_get_num" , 1 , true);
                boo = true;
                this.setButtonColor();
            }
        }

        this._currTimeTxt.node.active = !boo;
        //倒计时标题
        this._currTitleTxt.node.active = !boo;
        //当前领取文本
        this._currGetTxt.node.active = boo;
    }
    

    //设置按钮为灰色状态
    setButtonColor()
    {
        if(UserInfo.cake_get_num > 0 )
        {
            if(UserInfo.cake_max_num <= UserInfo.cake_num)
            {
                if(this.getBtn.getComponent(cc.Button).interactable == true)
                    this.getBtn.getComponent(cc.Button).interactable = false;
            }else
            {
                if(this.getBtn.getComponent(cc.Button).interactable == false)
                    this.getBtn.getComponent(cc.Button).interactable = true;
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

    //点击升级按钮
    click_up()
    {
        if(csv.ConfigData.pudding_increase_limit <=  UserInfo.cake_up_num)
        {//判断已经达到最大升级次数
            Toast.make("已达到最大次数");
            return;
        }

        let needNum = parseInt(this._priceList[UserInfo.cake_up_num]);

        //判断价格是否足够

        if(needNum > UserInfo.diamond)
        {
            Toast.make("钻石不足");
            return;
        }

        Toast.make("升级成功");

        UserInfo.addData("cake_max_num" , csv.ConfigData.pudding_increase_num , true);
        UserInfo.addData("cake_up_num" , 1 , true);

        //钻石数量的改变
        UserInfo.addData("diamond" , needNum*(-1) , true);
        UserInfo.save();

        //
        this.setMaxStatu();

        //升级成功刷新需要文本
        this.setNeedTxt();
        //升级成功刷新容量文本
        this.setCapacityTxt();
        //拥有数量的文本
        this.setHaveTxt();
        
    }

    //点击领取按钮
    click_get()
    {
        //不可领取奖励
        if(UserInfo.cake_get_num <= 0)
        {
            return;
        }

        //可以领取奖励但是达到上限
        if(UserInfo.cake_get_num > 0 && UserInfo.cake_max_num <= UserInfo.cake_num)
        {
            Toast.make("已经达到上限");
            return;
        }

        let num = 0
        if(csv.ConfigData.pudding_increase_num + UserInfo.cake_num - UserInfo.cake_max_num > 0)
        {
            num = UserInfo.cake_max_num - UserInfo.cake_num;
        }else
        {
            num = csv.ConfigData.pudding_increase_num
        }

        //领取奖励
        UserInfo.addData("cake_get_num" , -UserInfo.cake_get_num , true);
        UserInfo.addData("cake_num" , num , true);
        UserInfo.cake_get_time = this.getTime();
        //更新时间文本
        this.setTimeTxt();
        //拥有数量的文本
        this.setHaveTxt();
    }

    click_close(){
        this.getComponent(View).hide(); 
    }

    //获取系统当前时间
    getTime()
    {
        // var date = new Date();
        // return date.getTime();
        return LocalTimeSystem.getSec()*1e3;
    }

    update (dt) {
        this._updateTime += dt;
        if(this._updateTime >= 1)
        {//更新时间文本
            this._updateTime = 0;
            this.setTimeTxt();
        }
    }
}
