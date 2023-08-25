import MainMap from "./MainMap";
import ViewManager from "../../../framework/plugin_boosts/ui/ViewManager";
import { UserInfo } from "../Common/UserInfo";
import Util from "../Common/Util";
import Device from "../../../framework/plugin_boosts/misc/Device";

const {ccclass, property} = cc._decorator;
export enum EntranceState{
    Locked,
    Latest,
    Passed,
}
@ccclass
export default class Entrance extends cc.Component {

    private state:EntranceState = null

    sprite:cc.Sprite = null;

    levelNum:number = 0;

    level:number = 0;

    ACTION_TAG = 1;

    @property(cc.Label)
    labelLevel:cc.Label = null

    @property(cc.Sprite)
    spriteStar:cc.Sprite =  null;

    @property(cc.Button)
    getAwardBtn:cc.Button =  null;

    animation:cc.Animation;

    data:csv.MissionData_Row;

    button:cc.Button;

    /** 是否是最新关卡 */
    isNew:boolean;

    private FULLSTARNUM = 3;
    
    onLoad () {
        this.sprite = this.getComponent(cc.Sprite);
        
        this.animation = this.getComponent(cc.Animation);

        this.button = this.getComponent(cc.Button);
        
        this.data = csv.MissionData.get(this.level);
    }

    start () {
        this.init(); 

    }

    init(){
        this.node.getActionByTag(this.ACTION_TAG) && this.node.stopActionByTag(this.ACTION_TAG);

        this.labelLevel.string = this.levelNum.toString();
        let level_data = UserInfo.getLevelData(this.level);

        if(level_data.star > 0){
            this.setState(EntranceState.Passed)
        }else{
            if(this.isNew){
                this.setState(EntranceState.Latest)
                this.playAction();
            }else{
                this.setState(EntranceState.Locked)
            }
        }
        
        //test level 
    }

    /** 更新显示信息 */
    freshShow(){
        this.init();
    }

    /** 缩放动作 */
    playAction(){
        let action = cc.repeatForever(
            cc.sequence(
                cc.scaleTo(0.15,0.9,1.1),
                cc.scaleTo(0.2,1.1,0.9),
                cc.scaleTo(0.15,1,1),
                cc.delayTime(0.7)
            )
        );
        action.setTag(this.ACTION_TAG);
        this.node.runAction(action);
    }

    setState(state:EntranceState)
    {
        this.state = state;
        let isBoss = this.levelNum %5 == 0 && this.levelNum != 0;
        let target = isBoss? 1:0;
        this.button.interactable = true;
        let level_data = UserInfo.getLevelData(this.level);
        let mission = csv.MissionData.get(this.level);
        switch(state)
        {
            case EntranceState.Latest:
                this.animation.stepTo(target,"map_entrance_new");//
                this.spriteStar.node.active = false;
                break;
            case EntranceState.Locked:
                this.animation.stepTo(target,"map_entrance_locked");//
                this.spriteStar.node.active = false;
                this.button.interactable = false
                break;
            case EntranceState.Passed:
                this.animation.stepTo(target,"map_entrance_passed");//
                this.spriteStar.node.active = true;
                this.spriteStar.spriteFrame = MainMap.instance.entranceStarDisplays[level_data.star - 1];
                break;
        }

        
        if(!level_data.isGetAdward3Star && level_data.star == this.FULLSTARNUM && mission.JiesuoXing == 1){
            this.getAwardBtn.node.active = true;
        }else{
            this.getAwardBtn.node.active = false;
        }
    }
    

    onClick()
    {
        Device.playEffectURL("Audio/" + csv.ConfigData.sound_click_ui + ".mp3");
        ViewManager.instance.show("UI/UICheckpoint",this.level);
    
        //Util.loadScene("S"+UserInfo.chapter);
        this.log("start level")
    }

    onBtnGift(){
        Device.playEffectURL("Audio/" + csv.ConfigData.sound_click_ui + ".mp3");
        ViewManager.instance.show("UI/UIReAward",this.level);
    }
}