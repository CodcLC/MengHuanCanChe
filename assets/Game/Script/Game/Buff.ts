const {ccclass, property} = cc._decorator;

@ccclass
export default class Buff extends cc.Component {

    duration = 5;
    leftTime = 0;

    static Immnue_Burnt = 0
    static Immnue_Angry = 1

    type:number = 0;

    onLoad () {

    }
    
    start () {

    }

    onEnable()
    {
        this.leftTime = this.duration;
        this.schedule(this.countdown,1);
    }

    countdown()
    {
        if(this.leftTime <= 0){
            this.enabled = false;
            //销毁buff 
            this.log(":remove buff")
            this.destroy();
        }
        this.leftTime -- 
    }

    onDisable()
    {
        this.unschedule(this.countdown);
    }

}