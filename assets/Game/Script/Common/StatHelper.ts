import { UserInfo } from "./UserInfo";
import { root } from "../Game/GameRoot";

const {ccclass, property} = cc._decorator;

export enum EventType{
    paySuccess,
    payFail,
    tools,
    revive,
    award,
}

@ccclass
export default class StatHepler  {
    static level_end_event:string = "";
    static current_lv_desc:string = ""
    static isInLevel = false;
    static startLevel()
    {
        StatHepler.level_end_event = "playing"
        this.current_lv_desc = root.levelData.desc
        if(cc.sys.platform == cc.sys.WECHAT_GAME)
        {
            // wx.aldStage.onStart({
            //     stageId:UserInfo.playingLevel.toString(),
            //     stageName:this.current_lv_desc,
            //     userId:UserInfo.userId
            // });
        }
        this.isInLevel = true;
    }

    static userAction(eventName,k?,v?)
    {
        if(cc.sys.platform == cc.sys.WECHAT_GAME)
        {
            if(k){
                let param = {}
                param[k] = v;
                // wx.aldSendEvent(eventName,param)
            }else{
                let param = {}
                param["userId"] = UserInfo.userId;
                // wx.aldSendEvent(eventName)
            }
        }
    }

    static doLevelEvent(eventType:EventType,itemName,itemId,itemCount,itemMoney){
        if(!this.isInLevel) return;
        if(cc.sys.platform == cc.sys.WECHAT_GAME)
        {
            // wx.aldStage.onRunning({
            //     stageId:UserInfo.playingLevel.toString(),
            //     stageName:this.current_lv_desc,
            //     userId:UserInfo.userId,
            //     event:EventType[eventType],
            //     params:{
            //         itemName,itemId,itemCount,itemMoney
            //     }
            // })
        }
    }

    static endLevel()
    {
        //统计
        //------------------------------------------------------------------------------//
        let desc = ""
        let ald_event = StatHepler.level_end_event
        switch(StatHepler.level_end_event)
        {
            case "complete":
                desc = "完成关卡"
                break;
            case "fail":
                desc = "关卡失败"
                break;
            case "playing":
                desc = "中途退出"
                ald_event = "fail"
                break;
        }
        if(cc.sys.platform == cc.sys.WECHAT_GAME)
        {
            // wx.aldStage.onEnd({
            //     stageId:UserInfo.playingLevel.toString(),
            //     stageName:this.current_lv_desc,
            //     userId:UserInfo.userId,
            //     event:ald_event,
            //     params:{
            //         desc
            //     }
            // });
        }
        this.isInLevel = false;
        //------------------------------------------------------------------------------//
    }

}