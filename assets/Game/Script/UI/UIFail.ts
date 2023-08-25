import View from "../../../framework/plugin_boosts/ui/View";
import Util from "../Common/Util";
import { UserInfo ,LevelData} from "../Common/UserInfo";
import Common from "../../../framework/plugin_boosts/utils/Common";
import ViewManager from "../../../framework/plugin_boosts/ui/ViewManager";
import { Toast } from "../../../framework/plugin_boosts/ui/ToastManager";
import { MissionEndType, MissionSpecialType, Const, MissionType } from "../Common/EnumConst";
import Device from "../../../framework/plugin_boosts/misc/Device";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import GameRoot, { root } from "../Game/GameRoot";
import Platform from "../../../framework/Platform";
const {ccclass, property} = cc._decorator;

@ccclass
export default class UIFail extends cc.Component {

    @property(cc.Label)
    levelLable:cc.Label = null;

    /** 进度文字 */
    @property(cc.Label)
    proLable:cc.Label = null;

    @property(cc.ProgressBar)
    proBar:cc.ProgressBar = null;

    /** 目标类型对应的图标 */
    @property(cc.Sprite)
    dirIcon:cc.Sprite = null;

    /** 是否完成的√和× */
    @property(cc.Sprite)
    isComIcon:cc.Sprite = null;

    /** 特殊目标图标 */
    @property(cc.Sprite)
    specialIcon:cc.Sprite = null;

    /** 特殊目标是否完成的图标 */
    @property(cc.Sprite)
    specialIsCom:cc.Sprite = null;

    @property(cc.Node)
    shopMarkNode:cc.Node = null;

    @property(cc.Node)
    nodeTvicon:cc.Node = null;

    @property(cc.Label)
    labAgain:cc.Label = null;

    private _level:number;

    private _data:LevelData;

    private _reason:MissionEndType;

    private MAXLV = 3;

    onLoad(){
        
    }

    start () {

    }

    onShown (reason) {
        cc.audioEngine.stopAllEffects();
        
        Device.playEffectURL("Audio/" + csv.ConfigData.sound_battle_fail + ".mp3");
        this._level = UserInfo.playingLevel;
        this._data = UserInfo.getLevelData(this._level);
        this._reason = reason;

        root.pause();
        
        this.initBar();
        this.initLab();
        this.initBtn();
    }

    /** 初始化按钮 */
    private initBtn(){
        let mark = false;
        for(let i in UserInfo.food_levelDatastr){
            if(UserInfo.food_levelDatastr[i] < this.MAXLV){
                mark = true;
                break;
            }
        }
        if(!mark){
            for(let i in UserInfo.tool_levelDatastr){
                if(UserInfo.tool_levelDatastr[i] < this.MAXLV){
                    mark = true;
                    break;
                }
            }
        }

        this.shopMarkNode.active = mark;

        this.nodeTvicon.active = !root.auto_serve;
        let [backtype,isBtnGray] = Util.judgeBtnType("get_auto");
        if(backtype == "share"){
            Common.setDisplay(this.nodeTvicon.getComponent(cc.Sprite),"Texture/UI/Share_icon");
        }else{
            Common.setDisplay(this.nodeTvicon.getComponent(cc.Sprite),"Texture/UI/TV_icon");
        }
        this.nodeTvicon.parent.getComponent(cc.Button).interactable = !isBtnGray;
    }

    /** 初始化文字 */
    private initLab(){
        let mission = csv.MissionData.get(this._level);
        let lvNum = mission.desc.split("_")[1];
        this.levelLable.string = UserInfo.chapter + "-" + lvNum;

        let text = "";
        let textX = 0;
        if(root.auto_serve){
            text = "重新开始";
            textX = 0;
        }else{
            text = csv.Text.get(41).text;
            textX = 30;
        }
        this.labAgain.string = text;
        this.labAgain.node.x = textX;
    }

    /** 初始化进度条内容 */
    private initBar(){
        let mission = csv.MissionData.get(this._level);
        // 当前完成数
        let current = UserInfo.target_mission_num || 0;
        this.proLable.string = current + "/" + mission.MissionStar1;
        this.proBar.progress = current / mission.MissionStar1;

        let res_dta = csv.PlayerRes.get(mission.MissionObj1);
        Common.setDisplay(this.dirIcon,"Texture/UI/" + res_dta.image);

        let isComUrl = this.proBar.progress >= 1 ? "YES" : "NO";
        Common.setDisplay(this.isComIcon,"Texture/UI/" + isComUrl);


        let target2 = mission.MissionObj2;
        if(target2 > 0){
            this.specialIcon.node.active = true;
            if(target2 == 3){
                Common.setDisplay(this.specialIcon,"Texture/UI/No_Icon2");
            }else if(target2 == 4){
                Common.setDisplay(this.specialIcon,"Texture/UI/No_Icon3");
            }else if(target2 ==5){
                Common.setDisplay(this.specialIcon,"Texture/UI/No_Icon1");
            }
            if(this._reason == MissionEndType.BurntNotAllowed){
                Common.setDisplay(this.specialIsCom,"Texture/UI/NO");
            }else if(this._reason == MissionEndType.AngryNotAllowed){
                Common.setDisplay(this.specialIsCom,"Texture/UI/NO");
            }else{
                Common.setDisplay(this.specialIsCom,"Texture/UI/YES");
            }
        }else{
            this.specialIcon.node.active = false;
        }
        
    }


    click_close(){
        this.getComponent(View).hide();
        Util.loadScene("Home");
    }

    /** 升级餐厅按钮 */
    click_upCanting(){
        ViewManager.instance.show("UI/UIShopUp",()=>{
            Util.loadScene("Home");
        });
    }

    click_again(){
        if(UserInfo.power <= 0){
            
            Toast.make("体力不足");
            return;
        }

        if(root.auto_serve){
            UserInfo.addData("power",-1);
            Util.loadScene("S"+UserInfo.chapter);
        }else{
            
            Util.typeDoCallback("get_auto",()=>{
                UserInfo.addData("power",-1);
                Util.loadScene("S"+UserInfo.chapter,"auto");
            });

        }



    }
}
