import ViewManager from "../../framework/plugin_boosts/ui/ViewManager";
import Platform from "../../framework/Platform";
import { event } from "../../framework/plugin_boosts/utils/EventManager";
import { UserInfo } from "./Common/UserInfo";
import Common from "../../framework/plugin_boosts/utils/Common";
import GuiderScript from "./Teach/GuideScript";
import Device from "../../framework/plugin_boosts/misc/Device";
import StatHepler from "./Common/StatHelper";
import { Loading } from "../../framework/plugin_boosts/ui/LoadingManager";
import Util from "./Common/Util";
import { Toast } from "../../framework/plugin_boosts/ui/ToastManager";
import { emit } from "cluster";
import { Config } from "./Common/EnumConst";
import LocalTimeSystem from "./Common/LocalTimeSystem";
const {ccclass, property} = cc._decorator;


let is_first:boolean = true;


@ccclass
export default class Home extends cc.Component {

    @property(cc.Node)
    mapSlot:cc.Node =  null;
    
    @property(cc.Node)
    node_btn_chapter:cc.Node = null;

    @property(cc.Sprite)
    canTingIcon:cc.Sprite = null;

    @property(cc.Label)
    powerMax:cc.Label = null;

    @property(cc.Node)
    btnCollectNode:cc.Node = null;

    @property(cc.Node)
    signMarkNode:cc.Node = null;

    from:string = ""


    @property(cc.Node)
    node_cake:cc.Node = null;

    @property(cc.Node)
    node_daily:cc.Node = null

    @property(cc.Node)
    node_achievement:cc.Node = null;

    @property(cc.Node) 
    node_left_bg:cc.Node = null;

    onLoadFinished(from)
    {
        this.from = from;
    }

    onLoad()
    {
        event.on("ChangeChapter" , this.changeChapter,this);
        //event.on("powerUsed",this.checkPower,this);
        event.on("powerUsed",this.updatePower,this);
        event.on("UNLOGIN", this.onUnLogin,this);
        event.on("UpdHomeView",this.updShow,this);
        UserInfo.init();
        GuiderScript.init();
        // loader 
        if(!is_first)
        {
            this.checkPower();
            this.updShow();
            Device.setBGMEnable(UserInfo.isOffBgm)
            Device.setSFXEnable(UserInfo.soundBgOn)
        } 

        let levelData = UserInfo.getLevelData(csv.ConfigData.task_open_mission-1);
        //已解锁 
        this.node_daily.active = levelData.star > 0

        let lv = UserInfo.getLevelData(csv.ConfigData.achievement_open_mission-1);
        //已解锁 
        this.node_achievement.active = lv.star > 0

        let lv2 = UserInfo.getLevelData(csv.ConfigData.pudding_open_mission-1);
        //已解锁 
        this.node_cake.active = lv2.star > 0
        
        //左侧背景
        this.node_left_bg.active = levelData.star > 0 || lv.star > 0 || lv2.star > 0;
    }

    /** 刷新显示 */
    updShow(){
        this.powerMax.string = "/" + (UserInfo.powerAddLimit + csv.ConfigData.live_limit);

        this.btnCollectNode.active = UserInfo.collectState != 2;

        /** 签到红点 */
        this.signMarkNode.active = g.isNextDay(UserInfo.lastSign_time);          
    }

    onUnLogin()
    {
        Toast.make("未登录!")
    }

    /** 体力回复 */
    checkPower(){
        if(!UserInfo.powerRecoverTime || UserInfo.powerRecoverTime < 0){
            UserInfo.powerRecoverTime = 0;
        }

        if(UserInfo.power >=  (UserInfo.powerAddLimit + csv.ConfigData.live_limit)){
            cc.log("体力满");
            UserInfo.powerRecoverTime = 0;
            UserInfo.save("powerRecoverTime");
            this.unschedule(this.checkPower); 
        }else{
            // 判断是否完成体力恢复
            if(UserInfo.powerRecoverTime > LocalTimeSystem.getSec()*1e3){
                // 未完成1点体力恢复
                if (!cc.director.getScheduler().isScheduled(this.checkPower,this))
                {
                    // cc.log((UserInfo.powerRecoverTime -LocalTimeSystem.getSec()*1e3)/1e3 + "后恢复体力");
                    this.schedule(this.checkPower,1);  
                }
            }else{
                // 恢复1点以上体力
                let coverTime = csv.ConfigData.live_recovery_time;
                let powerCount = (Math.floor( Math.abs(( LocalTimeSystem.getSec()*1e3 - UserInfo.powerRecoverTime )/coverTime)) + 1) || 1;    //增加的体力个数
                if(UserInfo.power + powerCount > (UserInfo.powerAddLimit + csv.ConfigData.live_limit)){
                    UserInfo.setData("power",(UserInfo.powerAddLimit + csv.ConfigData.live_limit));
                }else{
                    UserInfo.addData("power",powerCount);
                }
                UserInfo.save("power");
                // cc.log("恢复体力" + powerCount);

                if( UserInfo.power < (UserInfo.powerAddLimit + csv.ConfigData.live_limit)){
                    // 重置下一个体力回复的时间
                    UserInfo.powerRecoverTime = UserInfo.powerRecoverTime + (powerCount)*coverTime;
                    //this.unschedule(this.checkPower);  
                    this.schedule(this.checkPower,1);  
                    // cc.log("恢复体力 后未满 继续恢复");
                }else{
                    // 体力恢复满    
                    UserInfo.powerRecoverTime = 0;
                    this.unschedule(this.checkPower); 
                    // cc.log("恢复体力 后满");
                }
            UserInfo.save("powerRecoverTime");
            }
        }
        // if(UserInfo.hasTimer){
        //     UserInfo.hasTimer = false;
        //     UserInfo.save("hasTimer");
        // }
    }



    updatePower(){
        if(UserInfo.power < (UserInfo.powerAddLimit + csv.ConfigData.live_limit) && UserInfo.powerRecoverTime == 0){
            let coverTime = csv.ConfigData.live_recovery_time;
            UserInfo.powerRecoverTime = LocalTimeSystem.getSec()*1e3 + coverTime; //消耗体力后记录预期恢复时间

            UserInfo.save("powerRecoverTime"); 
            this.checkPower();
        }
    }
    
    onPowerTimer(){
        if( UserInfo.power < (UserInfo.powerAddLimit + csv.ConfigData.live_limit)  &&  UserInfo.powerRecoverTime != 0 ){
            //UserInfo.addData("power",1,true);
        }
    }
    

    onGameHide(){
       
    }
    onGameShow(){
        cc.log("back Scene",wx.getLaunchOptionsSync().scene);
        if(wx.getLaunchOptionsSync().scene == 1104 && UserInfo && UserInfo.collectState == 1){         
            
            UserInfo.powerAddLimit = csv.ConfigData.live_limit_gain;
            UserInfo.collectState = 2;

            event.emit("UpdHomeView");

            UserInfo.addPowerLimit(csv.ConfigData.live_limit_gain_extra);
            Toast.make("恭喜获得体力与体力上限");
            UserInfo.save();
        }
    }
    

    onLogin()
    {
        this.updateChapter();
        //!!! 测试体力
        //UserInfo.powerRecoverTime = LocalTimeSystem.getSec()*1e3;//LocalTimeSystem.getSec()*1e3 + 20*1e3;
        
        this.checkPower();

        this.updShow();

        this.checkCollect();

        if(CC_WECHATGAME)
        {
            wx.onShow(this.onGameShow.bind(this));
            wx.onHide(this.onGameHide.bind(this));
            
        }
    }

    onDestroy()
    {
        event.off(this);
    }

    start () {
        if(is_first) this.onLogin();
        this.updateChapter();
        
        if(!UserInfo.isOffBgm)
        {//第一次登陆默认开启音乐
            Device.playMusic("Audio/" + csv.ConfigData.sound_music_2 + ".mp3");
            UserInfo.isOffBgm = false;
            UserInfo.soundBgOn = true;
            UserInfo.save("isOffBgm");
            UserInfo.save("soundBgOn");
        }

        // if(!UserInfo.soundBgOn){
        //     UserInfo.isOffBgm = true;
        //     UserInfo.save("isOffBgm");
        // }

        // if(!UserInfo.isOffBgm)
        // {
        //     Device.playMusic("Audio/" + csv.ConfigData.sound_music_1 + ".mp3");
        // }
        // cc.log("HOME:",UserInfo.soundBgOn,UserInfo.soundEffectOn);

        this.changeChapter(UserInfo.chapter);
        is_first = false
    }


    /** 检查收藏是否点开过 */
    checkCollect(){
        if(UserInfo.collectState == 1){
            UserInfo.powerAddLimit = csv.ConfigData.live_limit_gain;
            UserInfo.collectState = 2;

            event.emit("UpdHomeView");

            UserInfo.addPowerLimit(csv.ConfigData.live_limit_gain_extra);
            this.scheduleOnce(()=>{
                Toast.make("恭喜获得体力与体力上限");
            },1);
            UserInfo.save();
        }
    }

    /** 更新章节信息 */
    updateChapter()
    {
        let unlock = UserInfo.unlock_chapters[2]
        // this.node_btn_chapter.active = unlock

        this.powerMax.string = "/" + (UserInfo.powerAddLimit + csv.ConfigData.live_limit);
      
    }


    changeChapter(chapterId)
    {
        chapterId = Math.max(1,chapterId);
        this.mapSlot.destroyAllChildren()
        Loading.show(3,"加载地图...")
        cc.loader.loadRes("Prefab/Map/S" + chapterId , cc.Prefab,(err,res)=>{
            if(this.mapSlot)
            {
                let node = cc.instantiate(res)
                node.name = "S" + chapterId
                this.mapSlot.addChild(node);
                ViewManager.instance.hide("UI/UIChapterSelector")
            }
            if(this.from == "win")
            {
                event.emit("LevelCompleteAndBack",UserInfo.playingLevel)
            }
            event.emit("MapLoaded")
            Loading.hide()
        })
        cc.log("Texture/UI/" + csv.CantingData.get(chapterId).icon);
        Common.setDisplay(this.canTingIcon,"Texture/UI/" + csv.CantingData.get(chapterId).icon , _=>{
            
        });
    }

    powerGet()
    {
        if(UserInfo.power >= (UserInfo.powerAddLimit + csv.ConfigData.live_limit)){
            UserInfo.powerNeedTime = 0;
            UserInfo.powerRecoverTime = 0;
            UserInfo.save();
        }
        if(UserInfo.powerRecoverTime > UserInfo.lastLoginTime){
           UserInfo.powerNeedTime = UserInfo.powerRecoverTime - UserInfo.lastLoginTime;
           UserInfo.save("powerNeedTime");
        }else{
           let powerCount = Math.floor((UserInfo.lastLoginTime - UserInfo.powerRecoverTime)/600000);
           UserInfo.powerNeedTime = UserInfo.lastLoginTime - powerCount*600000;
           UserInfo.power += powerCount;
           UserInfo.save("power"); 
        }
    }

    update(dt){
        
    }

   
    click_setting()
    {
        ViewManager.instance.show("UI/UISetting")
        
    }

    click_collection()
    {
        ViewManager.instance.show("UI/UICollection")
        
    }
    click_signIn()
    {
        if(!Util.isLogin){return event.emit("UNLOGIN") }
        ViewManager.instance.show("UI/UISignIn")
        
    }

    click_share()
    {
        StatHepler.userAction("直接分享");
        Platform.share(()=>{

        },this);
    }

    click_chapter()
    {
        ViewManager.instance.show("UI/UIChapterSelector");
    }
    
    click_addCoin(){
        if(!Util.isLogin){return event.emit("UNLOGIN") }
        ViewManager.instance.show("UI/UIObtain",{type:"coin",way:"share"});
        StatHepler.userAction("点击金币");
    }

    click_addDiamond(){
        if(!Util.isLogin){return event.emit("UNLOGIN") }
        ViewManager.instance.show("UI/UIObtain",{type:"diamond",way:"video"});
        StatHepler.userAction("点击钻石");
    }

    click_addPower(){
        if(!Util.isLogin){return event.emit("UNLOGIN") }
        StatHepler.userAction("点击体力");
        ViewManager.instance.show("UI/UIAddEnergy");
        //this.unschedule(this.scheduleFunc);
    }

    click_goShop(){
        if(!Util.isLogin){return event.emit("UNLOGIN") }
        ViewManager.instance.show("UI/UIShopUp");
    }


    /** 点击蛋糕**/
    click_cakeBtn(){
        ViewManager.instance.show("UI/UICake");
    }

    /**点击日常**/
    click_daily()
    {
        ViewManager.instance.show("UI/UIDaily");
    }

    /**点击成就**/
    click_aciheve()
    {
        ViewManager.instance.show("UI/UIAchieve");
    }

    /**点击侧边栏**/
    click_adDrawer()
    {
        ViewManager.instance.show("UI/UIAdDrawer");
    }
}
