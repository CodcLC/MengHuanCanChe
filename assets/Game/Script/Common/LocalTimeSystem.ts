import { GameLogic } from "../GameLogic";

export default class LocalTimeSystem {
    static utc_sec: number
    static timer: any;
    static timeOutOfSync: boolean = true;
    static init(utc_sec: number) {
        if (utc_sec == null || utc_sec == undefined) return;
        LocalTimeSystem.utc_sec = utc_sec;
        cc.game.on(cc.game.EVENT_SHOW, this.onShown, this)
        cc.game.on(cc.game.EVENT_HIDE, this.onHidden, this)
        this.timeOutOfSync = false

        g.setGlobalInstance(LocalTimeSystem, "TimeSystem");
        cc.log("初始化系统时间 ", utc_sec)
        this.startTimer();
    }

    static startTimer() {
        this.timer = setInterval(_ => {
            LocalTimeSystem.utc_sec += 1;
        }, 1000);
    }

    static stopTimer() {
        clearInterval(this.timer);
    }

    static getSec(): number {
        // if (this.timeOutOfSync) {
        //     cc.log("时间未同步,获取的时间可能不准确")
        // }
        return LocalTimeSystem.utc_sec || new Date().getTime() / 1000;
    }

    static getDate() {
        // if (this.timeOutOfSync) {
        //     cc.log("时间未同步,获取的时间可能不准确")
        // }
        if (LocalTimeSystem.utc_sec) {
            let date = new Date()
            date.setTime(LocalTimeSystem.utc_sec * 1000);
            return date;
        }
        return new Date();
    }

    static lastLocalTime: number;
    static onHidden() {
        cc.log("game enter background")
        // this.stopTimer();
        this.timeOutOfSync = true;
    }
    static onShown() {
        cc.log("game enter foreground")
        // this.startTimer();
        GameLogic.oSessionInterface.getTick().then(v => {
            cc.log("同步时间 ", v)
            this.timeOutOfSync = false;
            LocalTimeSystem.utc_sec = v.ext.tick
        })
    }
}