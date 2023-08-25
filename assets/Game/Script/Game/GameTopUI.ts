import GameRoot, { root } from "./GameRoot";
import Common from "../../../framework/plugin_boosts/utils/Common";
import PsSpawner from "../../../framework/plugin_boosts/components/PsSpawner";
import PoolManager from "../../../framework/plugin_boosts/misc/PoolManager";
import { create } from "domain";
import Food from "./Food";
import { UserInfo } from "../Common/UserInfo";
import { MissionEndType, MissionSpecialType, Const } from "../Common/EnumConst";
import Util from "../Common/Util";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import Order from "./Order";
import PsFxPlayer from "../../../framework/plugin_boosts/components/PsFxPlayer";
import ViewManager from "../../../framework/plugin_boosts/ui/ViewManager";
import Device from "../../../framework/plugin_boosts/misc/Device";
import PhaseBar from "../Component/PhaseBar";
import Platform from "../../../framework/Platform";
import { R } from "./GameRes";
import Locker from "../../../framework/plugin_boosts/misc/Locker";
import { Toast } from "../../../framework/plugin_boosts/ui/ToastManager";
import { CustomerState } from "./Customer";

const { ccclass, property } = cc._decorator;


@ccclass
export default class GameTopUI extends cc.Component {

    /**
     * 任务目标的icon
     */
    @property(cc.Sprite)
    missionIcon: cc.Sprite = null;

    @property([cc.Node])
    node_stars: cc.Node[] = [];

    @property(cc.ProgressBar)
    progress_mission: cc.ProgressBar = null;

    fxPool: PoolManager;

    @property(cc.Label)
    countdownLabel: cc.Label = null;

    @property(cc.Sprite)
    missionEndIcon: cc.Sprite = null;

    @property(cc.Label)
    missionCompleteLabel: cc.Label = null;

    @property(cc.Sprite)
    mission2Icon: cc.Sprite = null;

    @property(PhaseBar)
    lianjiProgress: PhaseBar = null;

    @property(cc.Sprite)
    lianjiTimer: cc.Sprite = null;


    lianji_count: number = 0;

    @property(PsSpawner)
    fxSpawner: PsSpawner = null;

    timeLeft: number = 0;
    customerLeft: number = 0;

    bar_width: number = 0;

    state: string = "";
    lj_step: number = 1 / 60;

    sp_stars: cc.Sprite[] = []

    //无限连击
    _lj_no_limit: boolean = false;

    @property(cc.Node)
    autoCommitCircle: cc.Node = null;

    @property(cc.Node)
    node_pudding: cc.Node = null;

    onLoad() {

        this.autoCommitCircle.active = false;
        root.topUI = this;
        this.sp_stars = this.node_stars.map(v => v.getComponent(cc.Sprite));
        //------------------------------------------------------------------------------//
        //设置任务目标图标
        let res_data = csv.PlayerRes.get(root.missionType)
        Common.setDisplay(this.missionIcon, "Texture/UI/" + res_data.image);
        //设置星星位置 :2019-4-16：被要求固定位置
        // let width = this.progress_mission.node.width;
        // this.node_stars[0].x = root.levelData.MissionStar1 / root.levelData.MissionStar3 * width;
        // this.node_stars[1].x = root.levelData.MissionStar2 / root.levelData.MissionStar3 * width;
        // this.node_stars[2].x = width
        //------------------------------------------------------------------------------//
        this.bar_width = this.progress_mission.node.width
        this.progress_mission.progress = 0;

        this.fxPool = new PoolManager(this.node, this.onCreateObject, this);
        //------------------------------------------------------------------------------//
        // MissionSpecialType
        // MissionEndType
        //设置任务 2
        let missionIconPath = "No_Icon1"
        this.mission2Icon.node.active = true;
        if (root.missionType2 == MissionSpecialType.AngryNotAllowed) {
            missionIconPath = "No_Icon3"
            Common.setDisplay(this.mission2Icon, "Texture/UI/" + missionIconPath)
        } else if (root.missionType2 == MissionSpecialType.BurntNotAllowed) {
            missionIconPath = "No_Icon2"
            Common.setDisplay(this.mission2Icon, "Texture/UI/" + missionIconPath)
        } else if (root.missionType2 == MissionSpecialType.DiscardNotAllowed) {
            missionIconPath = "No_Icon1"
            Common.setDisplay(this.mission2Icon, "Texture/UI/" + missionIconPath)
        }
        else {
            this.mission2Icon.node.active = false;
        }

        //------------------------------------------------------------------------------//
        //设置 结束icon
        let endIcon = ""
        if (root.missionEndType == MissionEndType.Time) {
            endIcon = "TIME_SMALL"
            this.timeLeft = root.levelData.EndObj1;
            this.schedule(this.updateTimer, 1);
            this.updateTimer();
        } else {
            endIcon = "PLP_SMALL"
            this.customerLeft = root.levelData.EndObj1;
            this.countdownLabel.string = this.customerLeft.toString();
        }
        Common.setDisplay(this.missionEndIcon, "Texture/UI/" + endIcon)
        //OrderFinished
        event.on("onOrderFinish", this.onOrderFinish, this);
        // init 
        this.lianjiProgress.progress = 0;
        this.lianjiTimer.fillRange = 0;

        this.lj_step = 1 / 60 * csv.ConfigData.comboTime / 1000;
    }



    onDestroy() {
        event.off(this);
        this.fxPool.clear();
    }

    onOrderFinish(order: Order) {
        //order 
        this.lianji_count++;
        this.lianji_count = Math.min(this.lianji_count, 5);
        this.lianjiProgress.progress = this.lianji_count
        if (this.state == "ljtimer") {
            event.emitDelay(0.6, "ComboHit", this.lianji_count - 1);
            // let idx = Math.min(Math.max(0,this.lianji_count - 2),3);
            let idx = cc.misc.clampf(this.lianji_count - 2, 0, 3);
            this.fxSpawner.play("Prefab/anim/uifx_combo", cc.Vec2.ZERO, null, null, "Texture/UI/" + Const.ComboImages[idx])
        }
        Device.playEffectURL("Audio/hit_" + (this.lianji_count))
        this.startLjTimer();
    }

    set lj_no_limit(b) {
        this._lj_no_limit = b;
        if (!b) {
            this.resetLj();
        }
    }

    resetLj() {
        this.state = ""
        this.lianji_count = 0;
        this.lianjiProgress.progress = 0;
        this.lianjiTimer.fillRange = 0;
    }

    //连击 计时状态 
    private async startLjTimer() {
        this.lianjiTimer.fillRange = 1
        if (this.state == "ljtimer") return;

        this.state = "ljtimer"
        if (this._lj_no_limit) {
            return;
        }
        while (this.lianjiTimer.fillRange > 0) {
            this.lianjiTimer.fillRange -= this.lj_step;
            await Common.sleep(this.lj_step);
        }
        this.resetLj();
    }

    finishMission() {
        //是否达成最低条件
        let lvdata = UserInfo.getLevelData(UserInfo.playingLevel);
        let star = root.getStar(UserInfo.target_mission_num);
        if (star > 0) {
            //todo: 突破才保存星级
            if (star > lvdata.star) {
                lvdata.star = star;
                UserInfo.is_break_record = true;
            }
        } else {
            return false;
        }
        return true;
    }

    public loseCustomer() {
        --this.customerLeft
        this.invalidate();
        if (this.customerLeft <= 0) {
            //游戏结束
            if (root.missionEndType == MissionEndType.Customer) {
                root.pause()
                if (!this.finishMission()) {
                    //弹出 “顾客不足”
                    this.log("游戏结束")
                    if (!UserInfo.is_revive)
                        ViewManager.instance.show("UI/UIFailReason", MissionEndType.Customer);
                    else {
                        ViewManager.instance.show("UI/UIFail")
                    }
                    return;
                } else {
                    //胜利
                    event.emit("LevelComplete", MissionEndType.Customer)

                }
            }
        }
    }

    private updateTimer() {
        this.timeLeft--;
        this.invalidate();
        if (this.timeLeft <= 10) {
            Device.playEffectURL("Audio/" + (csv.ConfigData.sound_clock_tick || "click_ui"), false);
        }
        if (this.timeLeft <= 0) {
            //游戏结束
            //弹出时间不足
            if (root.missionEndType == MissionEndType.Time) {
                root.pause()
                if (!this.finishMission()) {
                    this.log("弹出时间不足")
                    if (!UserInfo.is_revive)
                        ViewManager.instance.show("UI/UIFailReason", MissionEndType.Time);
                    else
                        ViewManager.instance.show("UI/UIFail")
                    return;
                } else {
                    ///胜利
                    event.emit("LevelComplete", MissionEndType.Time)
                }
            }
        }
    }

    /***
 * 刷新数据显示 
 */
    invalidate() {
        if (root.missionEndType == MissionEndType.Customer)
            this.countdownLabel.string = this.customerLeft.toString();
        else if (root.missionEndType == MissionEndType.Time)
            this.countdownLabel.string = this.timeLeft.toString();
        this.missionCompleteLabel.string = UserInfo.target_mission_num.toString();
    }

    private onCreateObject(path) {
        let node = new cc.Node();
        let sprite = node.addComponent(cc.Sprite);
        Common.setDisplay(sprite, "Texture/UI/" + path);
        return node;
    }

    start() {
        this.node_pudding.active = UserInfo.playingLevel >= csv.ConfigData.pudding_open_mission
    }

    private updateStars() {
        let w = this.bar_width
        let s1 = root.levelData.MissionStar1
        let s2 = root.levelData.MissionStar2
        let s3 = root.levelData.MissionStar3
        let c = UserInfo.target_mission_num
        let wholeProgress = 0
        let star = 0;
        if (c >= s1) {
            // 1 星
            Common.setDisplay(this.sp_stars[0], "Texture/UI/Star_yellow");
            star = 1
        } if (c >= s2) {
            // 2 星
            star = 2
            Common.setDisplay(this.sp_stars[1], "Texture/UI/Star_yellow");
        } if (c >= s3) {
            //// 3 星
            star = 3
            Common.setDisplay(this.sp_stars[2], "Texture/UI/Star_yellow");
        }
        if (star == 0) {
            let progress = c / s1
            wholeProgress = this.node_stars[0].x / w * progress;
        } else if (star == 1) {
            let progress = (c - s1) / (s2 - s1)
            wholeProgress = this.node_stars[0].x / w + progress * (this.node_stars[1].x - this.node_stars[0].x) / w;
        } else if (star == 2) {
            let progress = (c - s2) / (s3 - s2)
            wholeProgress = this.node_stars[1].x / w + progress * (this.node_stars[2].x - this.node_stars[1].x) / w;
        } else if (star == 3) {
            wholeProgress = 1
        }
        this.progress_mission.progress = wholeProgress
    }

    /**
     * 
     * 获取金币
     * @param food 
     */
    public play_getCoin(food: Food) {
        let pos = Common.getPositionToNodeSpaceAR(food.node, this.node);
        let item = this.fxPool.get("coin")
        let pos2 = Common.getPositionToNodeSpaceAR(this.missionIcon.node, this.node)
        item.position = pos;
        let move = cc.moveTo(0.3, pos2).easing(cc.easeSineOut())

        let seq = cc.sequence(move, cc.callFunc(_ => {
            item.removeFromParent();
            // get coin 
            let scale = cc.scaleTo(0.1, 2)
            let scale2 = cc.scaleTo(0.1, 1)
            this.missionIcon.node.runAction(cc.sequence(scale, scale2));
            this.invalidate();
            // this.missionCompleteLabel.string = UserInfo.target_mission_num.toString();
            this.updateStars();
            // update 
            Device.playEffectURL("Audio/reward_coin")
        }))
        item.runAction(seq);
    }

    //获取赞的动画  
    public play_getLike(zan_node: cc.Node) {
        let pos = Common.getPositionToNodeSpaceAR(zan_node, this.node);
        let item = this.fxPool.get("zan")
        let pos2 = Common.getPositionToNodeSpaceAR(this.missionIcon.node, this.node)
        item.position = pos;
        let move = cc.moveTo(0.3, pos2).easing(cc.easeSineOut())
        //提前加数据 ，延迟显示 
        UserInfo.target_mission_num++
        UserInfo.daily_likes++
        UserInfo.total_likes++

        let seq = cc.sequence(move, cc.callFunc(_ => {
            item.removeFromParent();
            // get coin 

            Device.playEffectURL("Audio/zan")

            let scale = cc.scaleTo(0.1, 2)
            let scale2 = cc.scaleTo(0.1, 1)
            this.missionIcon.node.runAction(cc.sequence(scale, scale2));
            // UserInfo.addData("like",1);
            // let lv_data = UserInfo.getLevelData(UserInfo.playingLevel)
            this.invalidate();
            this.updateStars();
        }))
        item.runAction(seq);
    }

    //点击蛋糕
    click_cake(e) {
        if (UserInfo.cake_num - 1 < 0) {
            Toast.make("蛋糕不足")
        } else {
            if (this.offerCake(e.target)) {
                UserInfo.daily_cake_use++
                UserInfo.total_cake_use++
                UserInfo.cake_num--;
            }
        }
    }

    //给蛋糕
    offerCake(selfNode) {
        let customers = root.getCustomers().filter(v => v.fsm.isInState(CustomerState.Waiting));
        if (customers.length > 1) {
            customers.sort((a, b) => {
                return b.leftTime - a.leftTime;
            })
        }
        let customer = customers && customers[customers.length - 1]
        if (customer) {
            let cakeNode = cc.instantiate(R.prefab_cake)
            cakeNode.parent = selfNode;
            Common.changeParent(cakeNode, customer.sit.node)
            let centerY = customer.sit.node.height / 2;
            let move = cc.moveTo(0.4, cc.v2(-50, centerY)).easing(cc.easeSineInOut())
            customer.pauseLoseLeftTime();
            let seq = cc.sequence(move, cc.callFunc(_ => {
                customer.resumeLoseLeftTime()
                customer.addLeftTime(1 - customer.leftTime);
                cakeNode.runAction(cc.sequence(cc.fadeOut(0.3), cc.callFunc(cakeNode.destroy, cakeNode)))
                //动画
            }))
            cakeNode.runAction(seq)
            return true
        }
        return false;
    }

    autoSet(){
        root.setAutoServe(true);
        let b = false;
        if (!this.autoCommitCircle.active) {
            b = true
        }
        this.autoCommitCircle.active = true;
        if (b)
            this.autoCommitCircle.runAction(cc.rotateBy(3.0, 360).repeatForever());
    }

    click_auto() {
        if(root.auto_serve)
            return;
        //每日上限
        if (UserInfo.daily_autoCommit > csv.ConfigData.auto_server_limit) {
            Toast.make("今日次数已达到上限");
            return;
        }
        let f = ()=>{
            if(!this.isValid) return;
            UserInfo.daily_autoCommit++
            root.setAutoServe(true);
            let b = false;
            if (!this.autoCommitCircle.active) {
                b = true
            }
            this.autoCommitCircle.active = true;
            if (b)
                this.autoCommitCircle.runAction(cc.rotateBy(3.0, 360).repeatForever());
            this.autoCommitCircle.parent.scale = 1;
            this.autoCommitCircle.parent.getComponent(cc.Animation).stop();
        }

        if(UserInfo.daily_autoCommit < csv.ConfigData.auto_server_freeTime){
            f();
        }else{
            Util.typeDoCallback("get_auto",()=>{
                f();
                if(!this.isValid) return;
                root.resume();
            },_=>{
                root.pause();
            },_=>{
                root.resume();
            })
        }
        // uncomment after 1000uv reached 
        // Platform.watch_video(v=>{
        
        
        // })
    }

    click_unlock(sender, msg) {

    }

    click_pause() {
        // Util.loadScene("Home")
        ViewManager.instance.show("UI/UIExit")
    }

}