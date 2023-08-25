import Common from "../../../framework/plugin_boosts/utils/Common";
import { UserInfo } from "../Common/UserInfo";
import View from "../../../framework/plugin_boosts/ui/View";
import Util from "../Common/Util";
import { Toast } from "../../../framework/plugin_boosts/ui/ToastManager";
import ViewManager from "../../../framework/plugin_boosts/ui/ViewManager";
import { root } from "../Game/GameRoot";
import { MissionEndType } from "../Common/EnumConst";
import Device from "../../../framework/plugin_boosts/misc/Device";
import StatHepler, { EventType } from "../Common/StatHelper";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIFailReason extends cc.Component {


    @property(cc.Label)
    titleLabel:cc.Label = null;

    @property(cc.Sprite)
    icon:cc.Sprite = null;

    @property(cc.Label)
    moneyLabel:cc.Label = null;

    @property(cc.Sprite)
    moneyIcon:cc.Sprite = null;

    @property(cc.Label)
    contentLabel:cc.Label = null;

    @property(cc.Label)
    costLabel:cc.Label = null;

    //结束类型
    endType:number = 0;

    data_fail:csv.FailData_Row

    onLoad () {
        
    }

    start () {
        
    }

    click_close(){
        this.getComponent(View).hide();
        StatHepler.level_end_event =  "fail"
        ViewManager.instance.show("UI/UIFail",this.endType)
        // Util.loadScene("Home")
    }

    click_buy()
    {
        //this.endType
        let cost = this.data_fail.cost;
        if(UserInfo.diamond - cost >= 0)
        {
            UserInfo.addData("diamond" , -cost,true);
            this.getComponent(View).hide();
            if(this.endType >= MissionEndType.BurntNotAllowed)
            {
                // 特殊复活
                root.doRevive2();
            }else{
                //时间 或者 顾客数复活
                root.doRevive()
            }
            StatHepler.doLevelEvent(EventType.revive,MissionEndType[this.endType],this.endType,1,cost);
        }else{
            Toast.make("钻石不足")
        }
    }

    onHidden(){
        root.resume();
    }

    onShown(type)
    {
        root.pause();
        Device.playEffectURL("Audio/" + csv.ConfigData.sound_battle_revive + ".mp3");
        this.endType = type;
        let data = csv.FailData.get(type)
        this.data_fail = data;
        Common.setDisplay(this.icon ,"Texture/UI/"+data.Icon)
        // Common.setDisplay(this.moneyIcon,data.PropID)
        this.moneyLabel.string = `拥有: ${UserInfo.diamond}`
        this.titleLabel.string = csv.Text.get(data.TetTitle).text;
        this.contentLabel.string = csv.Text.get(data.TxtContent).text;
        this.costLabel.string = data.cost.toString();
        //20000  
        //3 
        UserInfo.save()
        event.emit("Game.Fail");
    }

}