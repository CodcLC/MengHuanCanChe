import LoadingScene from "../LoadingScene";
import Net from "../../../framework/plugin_boosts/misc/Net";
import CConfig, { GameLogic } from "../GameLogic";
import { UserInfo } from "./UserInfo";
import { Config } from "./EnumConst";
import Platform, { ShareInfo } from "../../../framework/Platform";
import { Loading } from "../../../framework/plugin_boosts/ui/LoadingManager";
import CClientInstance from "../../../framework/CClientInstance";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import { wxsdk } from "../../../framework/wxsdk/sdk";
import { Toast } from "../../../framework/plugin_boosts/ui/ToastManager";
import ViewManager from "../../../framework/plugin_boosts/ui/ViewManager";
import LocalTimeSystem from "./LocalTimeSystem";
import Common from "../../../framework/plugin_boosts/utils/Common";


/**
 * 主逻辑
 */
export default class Util {
    

    static loadScene(sceneName, param = null) {
        LoadingScene.param = param
        LoadingScene.targetScene = sceneName
        cc.director.loadScene("Loading")
    }

    static isLogin = true;

    static configString: string = null;

    static shareConfigs: { [index: string]: ShareInfo } = {};

    static requestConfig(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.configString == null) {
                Net.httpGet(Config.remote_url + Config.version + Config.version_file_path +"?r=" + Date.now(), function (code, res) {
                    if (code) {
                        cc.log(res);
                        Util.configString = res;
                        resolve(res)
                    } else {
                        resolve(null);
                    }
                })
            } else {
                resolve(Util.configString)
            }
        })
    }


    /** 判断按钮类型  （视频还是分享） */
    static judgeBtnType(name:string){
        if(Util.shareConfigs == null) return ["share",true]
        let config = Util.shareConfigs[name];
        if(config == null){
            return ["share",true]
        }
        let shareNum = config["share"];
        let videoNum = config["video"];
        let backtype = "";
        if(shareNum == null || videoNum == null){
            return ["share",true]
        }
        let isBtnGray = false;
        
        if(UserInfo.dayVideoTime >= csv.ConfigData.reward_total_limit_advertisement){
            if(shareNum == 0){
                backtype = "video";
                isBtnGray = true;
            }else{
                backtype = "share";
                if(UserInfo.dayShareTime >= csv.ConfigData.reward_total_limit){
                    isBtnGray = true;
                }
            }
        }else{
            if(shareNum == 0){
                backtype = "video";
            }else{
                if(UserInfo.dayShareTime >= csv.ConfigData.reward_total_limit){
                    backtype = "video";
                }else{
                    let list = [shareNum,videoNum];
                    let randomE = this.getRandomOrder(list);
                    if(randomE == 0) backtype = "share";
                    if(randomE == 1) backtype = "video";
                }
            }
        }

        return [backtype,isBtnGray];
    }

    /** 分享或者视频某个回调 
     * @param name shareconfigs的名字
     * @param callback  成功回调
     * @param beforeVideoCall 视频开始之前要执行的
     * @param videoFailCall 视频失败回调
     * @param isAddTime 是否增加视频或者分享次数(默认为true)
    */
    static typeDoCallback(name:string,callback:Function,beforeVideoCall?:Function,videoFailCall?:Function,isAddTime:boolean = true){
        let [backtype,isBtnGray] = Util.judgeBtnType(name);
        if(isBtnGray){
            Toast.make("今日次数已达到上限");
            return;
        }

        if(backtype == "share"){
            Platform.doShare(Util.shareConfigs[name],()=>{
                callback && callback();
                isAddTime && UserInfo.addData("dayShareTime",1,true);
            },this);
        }else if(backtype == "video"){
            beforeVideoCall && beforeVideoCall();
            Platform.watch_video(Util.shareConfigs[name],()=>{
                callback && callback();
                isAddTime && UserInfo.addData("dayVideoTime",1,true);
            },this,_=>{
                videoFailCall && videoFailCall();
            });
        }

        
    }
    
    

    /** 按照数组概率取其中的一个 */
    static getRandomOrder(list:number[]){
        let total = 0;
        // 装概率的数组
        let proList : number[] = [];
        proList.push(0);
        for(let i = 0;i < list.length;i++){
            let now = list[i];
            
            proList.push(now + total);

            total += now;
        }

        let random = parseInt((Math.random() * (total + 1)).toString());
        if(random == 0){
            return 0;
        }
        if(random == total){
            return list.length - 1;
        }
        for (let j = 1;j < proList.length;j++){
            if(random <= proList[j] && random > proList[j-1]){
                return (j - 1);
            }
        }

    }


    static requestShareConfigs(): Promise<{[index:string]:ShareInfo}> {
        return new Promise((resolve, reject) => {
            if (this.shareConfigs == null) {
                Net.httpGet(Config.remote_url + Config.version + Config.config_path + Config.share_cfg_filename + "?r=" + Date.now(), function (code, res: string) {
                    if (code) {
                        cc.log(res);
                        Util.shareConfigs = JSON.parse(res);
                        resolve(Util.shareConfigs)
                    } else {
                        resolve(null);
                    }
                })
            } else {
                resolve(Util.shareConfigs)
            }
        })

    }

    static syncUserInfo(a) {
        if(!this.isLogin) return;
        cc.log(">>>>>> start sync userinfo to server ")
        
        if(GameLogic.oSessionInterface)
        {
            GameLogic.oSessionInterface.save({ UserData: a } as Share.IPlayerInfo).then(v => {
                if(v.errno == 0){
                    cc.log("<<<<<< syncUserInfo:", v)
                }else{
                    cc.log("<<<< 保存用户数据失败")
                }
            }).catch(v=>{
                //保存失败
                cc.log("<<<< 保存用户数据失败")
            })
        }
    }

    static async loginWithCode(code: string): Promise<string> {
        let wxloginUrl = Share.CSingleton(CClientInstance).ClientCore.HttpServer + "/account/wxLogin?code=" + code;
        return new Promise<string>((resolve, reject) => {
            Net.httpGet(wxloginUrl, (code, res) => {
                if (code) {
                    // {"errno":1,"errmsg":"Invalid Arguments"}失败返回
                    //{"errno":0,"errmsg":"","ext":{"session_key":"K5Y9Xiq4wkT2TR/BFAHthA==","openid":"oFJsZ4wzz-3OrKHKz63Vnbqwi35o"}}
                    let ret = JSON.parse(res);
                    cc.log(res);
                    if (ret.errno == 0) {
                        resolve(ret.ext.openid);
                    } else {
                        resolve(null);
                    }
                } else {
                    resolve(null)
                }
            })
        })
    }

    static async getUserInput()
    {
        await event.sleep(0.1);
        ViewManager.instance.show("UI/UIInput")
        let [str] = await event.wait("UIInput.finished")
        return str;
    }

    static async login(defaultId) {
        this.isLogin =  false;
        
        // await GameLogic.Init()
        // let shareConfigs = await this.requestShareConfigs()
        // if (shareConfigs)
        //     //初始化分享配置 
        //     Platform.initShare(shareConfigs.default)
        let userId = ''
        // get code 
        Platform.login()
        Loading.show(10, "登陆中");
        // 获取分享配置 
        if(defaultId == 0 )
        {
            if (cc.sys.platform == cc.sys.WECHAT_GAME) {
                cc.log("请登陆-----------")
                let [code] = await event.wait("wxlogin")
                cc.log("---get openid with code:" , code);
                let openId = await this.loginWithCode(code)
                if (openId) {
                    wxsdk.openId = openId;
                    userId = openId;
                } else {
                    cc.log("登录失败")
                    Toast.make("登陆失败!")
                    return
                }
            }
        }else{
            userId = defaultId
            // let s = `{"level":20,"chapter":1,"playingLevel":101,"target_mission_num":17,"current_coin":17,"doubleHit":3,"guide_step":1001,"levelDatastr":"{'101':{'d':[1,0]},'102':{'d':[1,0]},'103':{'d':[1,0]},'104':{'d':[1,0]},'105':{'d':[1,0]},'106':{'d':[1,0]},'107':{'d':[1,0]},'108':{'d':[1,0]},'109':{'d':[1,0]},'110':{'d':[1,0]},'111':{'d':[1,0]},'112':{'d':[1,0]},'113':{'d':[1,0]},'114':{'d':[1,0]},'115':{'d':[1,0]},'116':{'d':[1,0]},'117':{'d':[1,0]},'118':{'d':[1,0]},'119':{'d':[1,0]},'120':{'d':[1,0]},'201':{'d':[0,0]},'301':{'d':[0,0]},'401':{'d':[0,0]}}","food_levelDatastr":"{'101':1,'102':1,'106':1}","tool_levelDatastr":"{'1102':1,'1103':1,'1104':1}","lastSign_time":0,"lastSign_type":0,"lastSign_day":0,"dayShareTime":0,"coin":1111110,"diamond":111110,"like":0,"power":5,"soundEffectOn":true,"soundBgOn":true,"isCoinDouble":false,"lastLoginTime":1554803311080,"firstBurnt":true}`
        }
        cc.log(">>>> loign with :" + userId)
        // await GameLogic.c2s_login(userId);
        LocalTimeSystem.init(GameLogic.oSessionInterface.AccountInfo.lastLoginTimestamp);
        let info = GameLogic.oSessionInterface.PlayerInfo;
        cc.log("<<<< sync data from server :", info.UserData);
        if (!isEmpty(info.UserData)) {
            let serverData = JSON.parse(info.UserData);
            //服务器保存数据 的时间 大于当前存储的时间 就使用服务器上的数据 
            if(serverData.userId == UserInfo.userId){
                if(serverData.save_timestamps >= UserInfo.save_timestamps)
                {
                    console.warn("服务器数据最新，使用服务器上数据 覆盖本地！！！")
                    UserInfo.loadFromJsonObject(serverData);
                    UserInfo.save();
                }else{
                    console.warn("服务器不是最新的， 尝试同步一次数据 ")
                }
            }else{
                console.warn("切换用户，使用服务器上数据 覆盖本地！！！")
                UserInfo.loadFromJsonObject(serverData);
                UserInfo.save();
            }
        } else {
            console.warn("新用户，初始化本地数据和服务器数据 ")
            Platform.setShareFailTipEnable(GameLogic.oSessionInterface.BehavSession.InAreas);
            UserInfo.resetAndSave({coin:csv.ConfigData.initial_coin,diamond:csv.ConfigData.initial_diamond,firstLoginTime:LocalTimeSystem.getSec() * 1e3});

        }
        //登录 成功
        this.isLogin =  true;
        UserInfo.userId = userId;
        UserInfo.save("userId")
        await event.sleep(0.5);
        event.emit("Login");
        this.reportLoginPC();
        Loading.hide();
    }


    /** PCsdk上报登录 */
    static reportLoginPC(){
        if(cc.sys.platform == cc.sys.WECHAT_GAME){
            let launchOption = wx.getLaunchOptionsSync();
            let channelId = "";
            let userId = "";
            if (launchOption.query && (<any>launchOption.query).channel_id){
                channelId = (<any>launchOption.query).channel_id;
            }
            if(launchOption.query && (<any>launchOption.query).userId){
                userId = (<any>launchOption.query).userId;
            }
    
            //, regTime: UserInfo.firstLoginTime,channelId:channelId,inviteUid:userId 
            // PCSDK.stat.setLogind({ userId: UserInfo.userId});
        }
        
    }

    /** 获取广告（猜你喜欢） */
    static async getPCBanListLike(callback?:Function){
        if(cc.sys.platform == cc.sys.WECHAT_GAME){
            let list = await this.getPCBanList(50);
            callback && callback(list);
        }
    }

    /** 获取广告（抽屉） */
    static async getPCBanListDrawer(callback?:Function){
        if(cc.sys.platform == cc.sys.WECHAT_GAME){
            let list = await this.getPCBanList(70);
            callback && callback(list);
        }
    }

    static getPCBanList(type:number){
        if(cc.sys.platform == cc.sys.WECHAT_GAME){
            // return PCSDK.stat.bannerList(type).then((data)=>{
            //     cc.log("bannerData",data);
            //     let bannerList = data.banner_list;
            //     // .filter((e)=>{
            //     //     return e.banner_online == "1" && (
            //     //         e.banner_system == "2" ||
            //     //         (cc.Browser.onIOS && e.banner_system == "0") || 
            //     //         (Laya.Browser.onAndroid && e.banner_system == "1")
            //     //     ) && (e.banner_gender == "0" || GameLogic.oSessionInterface.PlayerInfo.Gender == +e.banner_gender)
            //     // });
        
            //     bannerList = bannerList.sort((a, b)=>{
            //         return +a.banner_sort - +b.banner_sort;
            //     });
                

            //     return Promise.resolve(bannerList);
            // });
            
        }
        
    }

    static setShareBtn(options: {btn: cc.Button; icon: cc.Sprite; label: cc.Label; btnType: string|boolean ; is_disabled:  string|boolean; video_text: string; share_text: string; handler:cc.Component.EventHandler}) {
        options.btn.clickEvents.splice(0);
        options.handler.customEventData = options.btnType as string,
        options.btn.clickEvents.push(options.handler);
        if(options.btnType == "share")
            options.label.string = options.share_text,
            Common.setDisplay(options.icon,"Texture/UI/Share_icon")
        else
            options.label.string = options.video_text,
            Common.setDisplay(options.icon,"Texture/UI/TV_icon")
        if(options.is_disabled){
            options.btn.interactable = false
            options.btn.node.opacity = 130;
        }else{
            options.btn.interactable = true;
            options.btn.node.opacity = 255;
        }
    }
}