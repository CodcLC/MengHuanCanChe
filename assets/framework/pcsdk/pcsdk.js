import Stat from "./libs/stat.min.js";
import config from "./config";

(function (win) {
    if(cc.sys.platform == cc.sys.WECHAT_GAME){
        let entry = Stat.build(config);
        win.PCSDK = win.PCSDK || {};
        win.PCSDK.stat = entry.Stat;
        win.PCSDK.data = entry.Data;
        win.PCSDK.event = entry.Event;
        win.PCSDK.online = entry.Online;
        win.PCSDK.config = entry.Config;
        win.PCSDK.storage = entry.Storage;
        win.PCSDK.platform = entry.Platform;
        win.PCSDK.setDebug = entry.setDebug;
        win.PCSDK.SDKVersion = entry.SDKVersion;
        
        if (typeof module !== 'undefined') {
            module.exports = win.PCSDK;
        }
    } 
})(typeof GameGlobal === 'object' ? GameGlobal : window);