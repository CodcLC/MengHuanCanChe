import { wxsdk, WxShareInfo } from "./wxsdk/sdk";
import { Toast } from "./plugin_boosts/ui/ToastManager";
import BKTool from "./qqsdk/BKTool";
import SpriteFrameCache from "./plugin_boosts/misc/SpriteFrameCache";
import Signal from "./plugin_boosts/misc/Signal";
import { event } from "./plugin_boosts/utils/EventManager";
import { GameConfig } from "./wxsdk/GameConfigs";

enum WxCommands {
    Hide = 99,
    Next,
    RankSmall,
    Rank,
}

export interface ShareInfo {
    title: string,
    imageUrl: string,
    query?: string,
    ald_desc?: string
    // id?:string,
    queryObjects: Object | { id: string },
    share_weight: number,
}


export default class Platform {
    static bannnerRefreshEnabled = true;
    static _refreshEnabled = false;
    static onEnterForegroundSignal = new Signal();

    static isAndroid = false
    static isIOS = false;

    static _shareConfig: any;

    static getOpenID() {
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            // wechat 
            let userInfo = wxsdk.userInfo
            if (userInfo && userInfo.openID) {
                return userInfo.openID
            } else {
                return ""
            }
        } else if (cc.sys.QQ_PLAY == cc.sys.platform) {
            return GameStatusInfo.openId;
        } else {
            return "123"
        }
    }

    static getNick() {
        if (cc.sys.QQ_PLAY == cc.sys.platform) {
            return BKTool.getNick();
        } else if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            return (wxsdk.userInfo && wxsdk.userInfo.nickName) || "自已"
        } else {
            return "玩家自已"
        }
    }

    static getHead() {
        if (cc.sys.QQ_PLAY == cc.sys.platform) {
            return BKTool.getHead();
        } else if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            // avatarUrl:"https://wx.qlogo.cn/mmopen/vi_32/QlHaicGZOD7do9LuX5W4APHYSrUBqVaGULuwISLUf35IyOOYZ3IXl7nF5mW36JiaQ9snziawrAvkknX41SmeYa9AQ/132"city:""country:""gender:1language:"zh_CN"nickName:"Damon Ren⁶⁶⁶"province:""
            let userInfo = wxsdk.userInfo
            if (userInfo && userInfo.avatarUrl) {
                return userInfo.avatarUrl
            } else {
                return "https://tank.wdfunny.com/speed_logo/2.jpg"
            }
        }
        return "https://tank.wdfunny.com/speed_logo/1.jpg"
    }

    private static loadHeadQQ(sp) {
        let self = this;
        let absolutePath = "GameSandBox://_head/" + GameStatusInfo.openId + ".jpg";
        let isExit = BK.FileUtil.isFileExist(absolutePath);
        cc.log(absolutePath + " is exit :" + isExit);
        //如果指定目录中存在此图像就直接显示否则从网络获取
        if (isExit) {
            cc.loader.load(absolutePath, function (err, texture) {
                if (err == null) {
                    sp.spriteFrame = new cc.SpriteFrame(texture);
                }
            });
        } else {
            BK.MQQ.Account.getHeadEx(GameStatusInfo.openId, function (oId, imgPath) {
                cc.log("openId:" + oId + " imgPath:" + imgPath);
                var image = new Image();
                image.onload = function () {
                    var tex = new cc.Texture2D();
                    tex.initWithElement(image);
                    tex.handleLoadedTexture();
                    sp.spriteFrame = new cc.SpriteFrame(tex);
                }
                image.src = imgPath;
            });
        }
    }

    static loadSelfHead(sprite) {
        if (cc.sys.QQ_PLAY == cc.sys.platform) {
            this.loadHeadQQ(sprite);
        } else {
            SpriteFrameCache.instance.getSpriteFrame(Platform.getHead()).then(sf => sprite.spriteFrame = sf)
        }
    }

    static exit() {
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            wx.offShow(Platform.onEnterForeground)
            wx.offHide(Platform.onEnterBackground)
        } else if (cc.sys.QQ_PLAY == cc.sys.platform) {

        }
    }

    static configGetSignal: Signal = new Signal();

    static login(p?) {
        this.isAndroid = cc.sys.os == "Android"
        cc.log("================= os", cc.sys.os);
        this.isIOS = cc.sys.os == "iOS"
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            wxsdk.login(p)
            // wxsdk.requestConfig(data=>{
            //     this.configGetSignal.fire(data)
            // })
            // get conf 
            wx.onShow(Platform.onEnterForeground)
            wx.onHide(Platform.onEnterBackground)
        } else if (cc.sys.QQ_PLAY == cc.sys.platform) {
            BKTool.login();
            BK.onEnterForeground(Platform.onEnterForeground);
            BK.onEnterBackground(Platform.onEnterBackground);
        }
    }

    static defaultShareConfig: ShareInfo = null;

    static initShare(cfg: ShareInfo) {
        this.defaultShareConfig = cfg;
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            wxsdk.showShareMenu(cfg);
        }
    }


    static getGameID() {
        if (cc.sys.QQ_PLAY == cc.sys.platform) {
            GameStatusInfo.gameId;
        }
        return "speed_wanyiwan";
    }

    static getLaunchOptions() {
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            return wx.getLaunchOptionsSync()
        }
        return {}
    }


    static getCity() {
        return ""
    }

    static share(calback?, target?) {
        this.doShare(this.defaultShareConfig, calback, target);
    }

    static _shareTipEnabled: boolean = true;

    static setShareFailTipEnable(b) {
        this._shareTipEnabled = b;
    }

    static shareCount = 0

    static doShare(share_cfg: ShareInfo, callback?, target?) {
        share_cfg = share_cfg || this.defaultShareConfig
        cc.log("######开始分享")
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            wxsdk.openShare(share_cfg);
            let t = new Date().getTime()
            Platform.onEnterForegroundSignal.on(() => {
                Platform.onEnterForegroundSignal.clear();
                let d = new Date().getTime() - t;
                if (!this._shareTipEnabled) {
                    if (callback)
                        callback.call(target)
                } else {
                    if (d > 1500) {
                        if(Math.random() < 0.5)
                        {
                            this.shareCount = 0;
                            setTimeout(_ => {
                                if (callback)
                                    callback.call(target)
                            }, 500)
                        }else{
                            if(this.shareCount >= 2){
                                this.shareCount = 0;
                                setTimeout(_ => {
                                    if (callback)
                                        callback.call(target)
                                }, 500)
                            }
                            else{
                                //用户及时返回分享失败 
                                Toast.make("分享失败,请尝试换其它群分享")
                            }
                        }
                    } else {
                        //用户及时返回分享失败 
                        Toast.make("分享失败,请尝试换其它群分享")
                    }

                }
            })
        } else if (cc.sys.QQ_PLAY == cc.sys.platform) {
            BKTool.share(v => {
                if (v == "success") {
                    callback && callback.call(target)
                } else {
                    // Toast.make("分享失败")
                }
            })
        } else {
            callback && callback.call(target)
        }
        this.shareCount ++
    }

    static watch_video(share_cfg: ShareInfo,callback, target?,failCallback?:Function) {
        cc.log("######开始看视频")
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            wxsdk.loadVideoAd((code, isEnded) => {
                if (code == "load") {
                    cc.audioEngine.pauseMusic();
                    // if(Platform.bannnerRefreshEnabled)
                    // {
                    //     this.showBannerAd();
                    // }
                    Platform._refreshEnabled = false;
                }
                else if (code == "close") {
                    Platform._refreshEnabled = true;
                    if (!isEnded)
                        Toast.make("必须看完视频,才能获取奖励"),failCallback && failCallback();
                    else
                        callback && callback.call(target)
                }
                else if (code == "error"){
                    Toast.make("请稍后重试");
                    failCallback && failCallback();
                }
            },share_cfg)
        } else if (cc.sys.QQ_PLAY == cc.sys.platform) {
            //关闭背景
            cc.audioEngine.pauseMusic();
            let isFinish = false;
            BKTool.loadVideoAd((v, video) => {
                if (v == "load") {
                    video.show()
                } else if (v == "finish") {
                    isFinish = true;

                } else if (v == "close") {
                    if (!isFinish)
                        Toast.make("必须看完视频,才能获取奖励")
                    else
                        callback && callback.call(target)
                }
            });
        } else {
            callback && callback.call(target)
        }
    }

    /**
     * 
     * @param idName 广告id
     * @param component 当前页面脚本
     * @param isNewGet 是否重新获取banner
     */
    static showBannerAd(idName?:string,component?,isNewGet:boolean = false) {
        cc.log("######显示Banner广告")
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            // wxsdk.showBannerAd(idName,component,isNewGet);
        } else if (cc.sys.QQ_PLAY == cc.sys.platform) {
            BKTool.showBannerAd();
        } else {

        }
    }

    static hideBannerAd() {
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            wxsdk.hideBannerAd();
        } else if (cc.sys.QQ_PLAY == cc.sys.platform) {
            BKTool.hideBannerAd();
        } else {

        }
    }

    static reloadBannerAd(b = 1) {
        if (b) {
            wxsdk.hideBannerAd()
            wxsdk.loadBannerAd(v => {
                if (v == "load")
                    wxsdk.showBannerAd();
            })
        } else {
            wxsdk.showBannerAd();
        }

    }

    static initBannerAd(b = 1) {
        if (b == 0) return;
        if (cc.sys.QQ_PLAY == cc.sys.platform) {
            setInterval(_ => {
                cc.log("######加载QQ Banner广告")
                BKTool.hideBannerAd()
                BKTool.loadBannerAd(v => {
                    if (v == "load")
                        BKTool.showBannerAd();
                })
            }, 30000)
        } else if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            setInterval(_ => {
                if (Platform.bannnerRefreshEnabled && Platform._refreshEnabled) {
                    cc.log("######加载WX Banner广告")
                    wxsdk.hideBannerAd()
                    wxsdk.loadBannerAd(v => {
                        if (v == "load")
                            wxsdk.showBannerAd();
                    })
                }
            }, 40000)
        }
    }

    static jumpTo() {
        // var desGameId = 1234; //跳转的gameid，必须为数字
        // var extendInfo = ""; //额外参数，必须为字符串
        // BK.QQ.skipGame(desGameId, extendInfo);
    }

    static showRankDialog() {
        cc.log("[Platform]#showRankDialog");
        Toast.make("#[Platform]#showRankDialog")

        // ViewManager.instance.show("Game/RankDialog")
    }

    // Andriod 发送游戏快捷方式到桌面

    static onEnterForeground() {
        cc.log("=====================onEnterForeground=====================")
        if (cc.sys.platform == cc.sys.QQ_PLAY) {
            //onEnterForeground
            // Device.resumeMusic()
            cc.audioEngine.resumeMusic()
        } else {
            cc.audioEngine.resumeMusic()
        }
        Platform.onEnterForegroundSignal.fire();
        event.emit("onEnterForeground")
    }

    static onEnterBackground() {
        // BK.onEnterBackground(enterBackgroundListener);
        event.emit("onEnterBackground")
    }

    static onGameExit() {
        // BK.onGameClose(gameCloseListener);
    }

    static showSmallRank() {
        wxsdk.postMessage(WxCommands.RankSmall);
    }

    static showRank() {
        wxsdk.postMessage(WxCommands.Rank);
    }

    static hideRank() {
        wxsdk.postMessage(WxCommands.RankSmall)
    }

    static getRankList(callback, target?) {
        cc.log("[Platform]#获取排行榜数据");
        if (cc.sys.platform == cc.sys.QQ_PLAY) {
            return BKTool.getRankList((errorCode, list) => {
                callback && callback.call(target, errorCode, list);
            })
        } else if (cc.sys.platform == cc.sys.WECHAT_GAME) {

        }
    }

    static uploadScore(score) {
        cc.log("[Platform]#上传分数");
        if (!score) { cc.log("score 上传失败：null"); return }
        if (cc.sys.platform == cc.sys.QQ_PLAY) {
            BKTool.uploadScore(score);
        } else if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            // wxsdk.postMessage(WxCommands., score);
            wxsdk.uploadScore(score)
        } else {
            // Toast.make("#[Platform]#uploadScore")
        }
    }


    //------------------------------------------------------------------------------//

    static removeFile(f) {
        var path = cc.url.raw(f);
        if (cc.loader.md5Pipe) {
            path = cc.loader.md5Pipe.transformURL(path);
        }
        if (CC_WECHATGAME) {
            wx.getFileSystemManager().removeSavedFile({
                filePath: path,
                success: _ => {
                    cc.log("删除成功", f)
                },
                fail: _ => {
                    cc.log("删除失败", f)
                }
            })
        }
    }
}