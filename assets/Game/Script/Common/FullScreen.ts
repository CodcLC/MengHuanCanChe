const {ccclass, property} = cc._decorator;



@ccclass
export default class FullScreen extends cc.Component {

    fullScreen() {
        if (cc.sys.isNative) {
            return;
        }
        let el = document.documentElement;
        //@ts-ignore
        let rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;      
        if(rfs) {
            rfs.call(el);
        };

        this.node.active = false;
    }

    exitFullScreen() {
        if (cc.sys.isNative) {
            return;
        }
        //@ts-ignore
        let efs = document.exitFullscreen || document.mozCancelFullScreen || document.webkitCancelFullScreen || document.msExitFullscreen;      
        if(efs) {
            efs.call(document);
        };
    }

    // update (dt) {}
}
