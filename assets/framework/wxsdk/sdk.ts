import { event } from "../plugin_boosts/utils/EventManager";
import { GameConfig } from "./GameConfigs";
import WxRankDialog from './WxRankDialog';

class Global
{
    static videoAd= undefined
    static bannerAd= undefined

    static videoAdLoadCount= 0 //视频广告加载次数
    static bannerAdLoadCount= 0 //banner广告加载次数
    static video_close_callback: (ret: any) => void;
    static video_error_callback: () => void;
    static video_load_callback: () => void;
}


export interface WxShareInfo{
    title:string,
    imageUrl:string,
    query?:string, 
    ald_desc?:string    
    // id?:string,
    queryObjects:Object|{id:string}
}

class WxSdk {
    _userInfo: any = {}
    _loginCode :any;
    _openId:string = "";
    
    _db:any;
    _version: number;
    _systemInfo:any;

    public get Ver(): number { return this._version; }

    public get userInfo(){return this._userInfo}

    public get parent() {
        if(!g.iswxgame()) return ""
        let info = wx.getLaunchOptionsSync();
        if(info.scene == 1007 || info.scene == 1008) {//通过分享进入游戏
            let openId = info.query["userId"];
            return openId
        }
        return ""; //默认
    }

    public set openId(v){
        this._openId =v
    }

    public get openId(){
        return this._openId 
    }


    constructor() {
        if(g.iswxgame()) {
            if(this._version == null)
            {
                this._systemInfo = wx.getSystemInfoSync();
                let ver = this._systemInfo.SDKVersion.replace(/\./g, "")
                this._version = parseInt(ver);
            }

            wx.onShow(()=>{
                if(Global.bannerAd){
                    if(!this._systemInfo) this._systemInfo = wx.getSystemInfoSync();
                    cc.log("banner setPosition");
                    Global.bannerAd.style.left = this._systemInfo.windowWidth/2 - Global.bannerAd.style.realWidth/2 +0.1;
                    Global.bannerAd.style.top = this._systemInfo.windowHeight - Global.bannerAd.style.realHeight +0.1;
                }
            });
        }
    }

    requestDB(tbname,callback,target)
    {
        this._db.collection(tbname).get({
            success: function(res){
                cc.log("get "+ tbname +" succ:" , res.data)
                // self._shareConfig = res.data;
                if(callback)callback.call(target,res.data);
            }, fail: (res)=>{
                cc.log("get "+ tbname +" fail:")
                if(callback) callback.call(target)
            }
        });
    }
    

    requestConfig(callback)
    {
        this._db.collection("t_conf").get({
            success: function(res){
                cc.log("get configs succ:" , res.data)
                // self._shareConfig = res.data;
                if(callback)callback(res.data);
            }, fail: (res)=>{
                cc.log("get configs fail:" , res)
                if(callback) callback(null)
            }
        });
    }


    /**
     * 打开分享
     * @param share_cfg {WxShareInfo}
     */
    async openShare(share_cfg:WxShareInfo) {
        if(!g.iswxgame()) return;
        let info = {} as WxShareInfo
        info.title = '风靡海外的烹饪游戏来了！还等什么，一起来玩吧！';//share_cfg.title;
        info.imageUrl = 'https://test.bitgame-inc.com/static/ct/shareImg/share1.jpg';//share_cfg.imageUrl;
        wx.shareAppMessage({
            title: info.title,
            imageUrl: info.imageUrl,
            success: _=> cc.log('分享成功'),
            fail: _ => cc.error(_),
            complete: _ => cc.log('分享完成'),
        });
        // let querys:any = share_cfg ? share_cfg.queryObjects || {} : {};
        // if(info != null) {
        //     let uid = (this.openId) || 0
        //     let querystr = ""
        //     querystr = Object.keys(querys).reduce((sum,k)=>{
        //         let v = querys[k]
        //         return sum + `${k}=${v}&`
        //     },querystr)
        //     info.query = querystr + "&time="+ new Date().getTime() +"&userId="  + uid;
        //     info.ald_desc = share_cfg.ald_desc;
        //     cc.log("open Share",info)
        //     wx.aldShareAppMessage(info);
        // }
    }

    private createButton(callback, x?, y?, width?, height?) {
        cc.log("-------------createButton");
        let button = wx.createUserInfoButton({
            type: "text",
            text:"     ",
            style: {
                x: x || 0, y: y || 0,
                width: width || cc.winSize.width,
                height: height || cc.winSize.height,
                lineHeight:40,
                backgroundColor:'#00000000',
                color:'#ffffff'
            }
        });
        button.onTap(function(res){
            button.destroy();
            if(res && res.userInfo) {
                if(callback) callback(res.userInfo);
            } else if(callback) callback(null);
        });
    }


    private getUserInfo(callback) {
        cc.log("-------------getUserInfo");
        wx.getUserInfo({
            withCredentials: true,
            lang: "zh_CN",
            success: (res)=>{
                cc.log("getUserInfo success.", res);
                if(callback) callback(res);
            }, fail: (res)=>{
                cc.log("getUserInfo:", res);
                if(callback) callback(null);
            },
            complete: null
        });         
    }

    oldAuthUser(callback) {
        wx.authorize({
            scope: "scope.userInfo",
            success: (res)=>{
                cc.log(res);
                if(callback) callback(true);
            }, fail: (res)=>{
                cc.log(res);
                if(callback) callback(false);
            }, complete: null
        });
    }


    public showShareMenu(shareConfig) {
        let self = this;
        cc.log('*****开始设置被动分享');
        wx.showShareMenu({
            withShareTicket: true,
            success: (res)=>{
                cc.log(res);
            },fail: (res)=>{
                cc.log(res);
            },complete: null
        });
        // wx.aldOnShareAppMessage(function(){
        //     return shareConfig;
        // });
        wx.onShareAppMessage(() => {
            return {
                title: '风靡海外的烹饪游戏来了！还等什么，一起来玩吧！',
                imageUrl: 'https://test.bitgame-inc.com/static/ct/shareImg/share1.jpg',
                success: _=> cc.log('分享成功'),
                fail: _ => cc.error(_),
                complete: _ => cc.log('分享完成'),
            };
        });
    }


    private wxLogin(callback) {
        wx.login({
            success: (res)=>{
                cc.log("code ", res.code);
                this._loginCode = res.code;
                event.emit("wxlogin",res.code);
                if(callback) callback(true);
            }, fail: (res)=>{
                if(callback) callback(false);
            }, complete: null
        });
    }

    
    private authUserInfo(callback) {
        this.wxLogin((isLogin)=>{
            if(!isLogin) return;
            wx.getSetting({
                success: (res)=>{
                    let auth = res.authSetting;
                    if(auth["scope.userInfo"]){
                        if(callback) callback(true);
                    } else if(callback) callback(false);
                }, fail: null,
                complete: null,
            });
        });
    }


    private loginToServer(userInfo) {
        if(userInfo==null) userInfo={};
        for (let k in userInfo){
            this._userInfo[k] = userInfo[k]
        }
        
        event.emit("wxUserInfo" , userInfo,this._loginCode);
        
    }

    public login(p,x?, y?, width?, height?){
        if(!g.iswxgame())return
        let self = this;
        //wx.cloud.init({traceUser: true});
        // this._db = wx.cloud.database({env: "release-2c87c4"});//测试环境
        //this._db = wx.cloud.database();
        self.authUserInfo((isAuth)=>{
            // p : login and getUserInfo
            if(p)
            {
                if(self._version >= 220 && !isAuth) {
                    self.createButton((userInfo)=>{
                        self.loginToServer(userInfo);
                    }, x, y, width, height);
                } else {
                    if(!isAuth){ self.oldAuthUser((isAuth)=>{
                        if(isAuth) {
                            self.getUserInfo((userInfo)=>{
                                self.loginToServer(userInfo);     
                            });
                        }else self.loginToServer(null);
                    })} else self.getUserInfo((userInfo)=>{
                        self.loginToServer(userInfo);
                    });
                }
            }
        });
    }



    //发送消息到子域
    public postMessage(cmd, data?) {
        if(g.iswxgame()) {
            wx.getOpenDataContext().postMessage({
                cmd: cmd,
                data: data
            });
        }
    }

    public uploadScore(score,callback?)
    {
        var kvDataList=new Array();
        kvDataList.push({
            key:"score",
            value:score+""
        });

        let obj = {
            KVDataList:kvDataList,
            success:function(d){
                if(callback) callback(d)
            },
            fail:function(){},
            complete:function(){},
        }
        wx.setUserCloudStorage(obj)
        // "wxgame": {
        //     "score": 16,
        //     "update_time": 1513080573
        // },
        // "cost_ms": 36500
    }

    public loadBannerAd(callback?,idName?:string){
        if(Global.bannerAd)
        {
            Global.bannerAd.destroy()
            Global.bannerAd = null;
        }
        if(!this._systemInfo)
            this._systemInfo = wx.getSystemInfoSync();
            

        let isPor = this._systemInfo.screenWidth <= this._systemInfo.screenHeight;
        let fixHeight = isPor ? this._systemInfo.screenHeight : this._systemInfo.screenWidth;
        let fixWidth = isPor ? this._systemInfo.screenWidth : (this._systemInfo.screenHeight/3);
        let bannerAd = wx.createBannerAd({
            adUnitId: GameConfig.banner_ad_id[idName],
            style: {
                left: 0,
                top: 0,//cc.visibleRect.height
                width: fixWidth
            }
        })
        bannerAd.onLoad(()=>{
            Global.bannerAd = bannerAd;
            Global.bannerAdLoadCount = 0;
            /** 加0.1适配IPHONEX */
            bannerAd.style.left = this._systemInfo.screenWidth/2 - bannerAd.style.realWidth/2 + 0.1;
            bannerAd.style.top = this._systemInfo.screenHeight - bannerAd.style.realHeight + 0.1;
            if(callback) callback("load" ,bannerAd)
        })
        bannerAd.onError((err) =>{
            //加载失败
            cc.log("wxsdk bannerAd onError code:" + err.code + " msg:" + err.msg);
            Global.bannerAdLoadCount += 1;
            if (Global.bannerAdLoadCount < 4) {
                this.loadBannerAd(callback,idName);
            }
            if(callback) callback("error")
        });
    }

    public showBannerAd(idName?:string,component?,isNewGet:boolean = false): any {
        cc.log("Wxsdk 显示banner广告",Global.bannerAd)
        if (Global.bannerAd && !isNewGet) {
            if(!component || !component.node|| !component.node.active) return;
            Global.bannerAd.show();
        } else {
            cc.log("Wxsdk 不存在banner资源....");
            this.loadBannerAd((v,ad)=>{
                if(v=="load")
                {
                    this.showBannerAd(idName,component)
                }
            },idName);
        }
    }

    hideBannerAd() {
        if (Global.bannerAd) {
            Global.bannerAd.style.left = -9999;
            Global.bannerAd.hide();
            // Global.bannerAd = null;
        } 
    }

    loadVideoAd(callback,share_cfg) {
        cc.log("============wxsdk.loadVideoAD");
        // if (!Global.videoAd ) { //如果没有广告资源就加载新的视频广告
        if(Global.videoAd)
        {
            Global.videoAd.offClose(Global.video_close_callback);
            Global.videoAd.offError(Global.video_error_callback);
            Global.videoAd.offLoad(Global.video_load_callback);
        }
        let videoAd = wx.createRewardedVideoAd({
            adUnitId:share_cfg.videoId
            // adUnitId: GameConfig.video_ad_id
        })
        // this.hideBannerAd();
        videoAd.load().then(()=>{videoAd.show();});
        let self = this;
        Global.video_error_callback = function()
        {
            //加载失败
            Global.videoAdLoadCount += 1;
            //尝试4次
            // if (Global.videoAdLoadCount < 4) {
            //     self.loadVideoAd(callback);
            // }
            if(callback) callback("error")
        }

        Global.video_close_callback = function (ret) {
            //播放结束
            cc.log("wxsdk onClose...");
            if(callback) callback("close",ret.isEnded)
            Global.videoAd = null;
        }

        Global.video_load_callback = function(){
            //加载成功
            cc.log("wxsdk onLoad");
            Global.videoAd = videoAd;
            Global.videoAdLoadCount = 0;
            // this.showBannerAd();
            if(callback) callback("load" , videoAd)
        }

        videoAd.onError(Global.video_error_callback);
        videoAd.onClose(Global.video_close_callback);
        videoAd.onLoad(Global.video_load_callback);
    }

}

export let wxsdk:WxSdk = new WxSdk();