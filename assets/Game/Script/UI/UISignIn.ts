import View from "../../../framework/plugin_boosts/ui/View";
import Common from "../../../framework/plugin_boosts/utils/Common";
import { UserInfo } from "../Common/UserInfo";
import Platform from "../../../framework/Platform";
import Home from "../Home";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import Util from "../Common/Util";

const {ccclass, property} = cc._decorator;


class DayItem{
    dayLabel:cc.Label;
    countLabel:cc.Label;
    icon:cc.Sprite;
    animation:cc.Animation;
}

@ccclass
export default class UISignIn extends cc.Component {

    @property(cc.Layout)
    dayRoot:cc.Layout = null

    items:DayItem[] = []

    @property(cc.Animation)
    animation:cc.Animation = null;

    @property(cc.Node)
    template:cc.Node = null;

    @property(cc.Node)
    node_claim:cc.Node = null;

    @property(cc.Node)
    iconNode:cc.Node = null;

    @property(cc.Node)
    adNode:cc.Node = null;


    @property(cc.Label)
    adLab:cc.Label = null;

    @property(cc.Prefab)
    coin:cc.Prefab = null;

    @property(cc.Prefab)
    diamond:cc.Prefab = null;

    private _btnData;

    /** 当天该签的天数 */
    signOrder:number = 0;

    onLoad()
    {
        this.dayRoot.showlist((node,cfg)=>{
            let item = new DayItem()
            item.dayLabel = Common.find("day", node,cc.Label);
            item.countLabel = Common.find("number",node,cc.Label);
            item.icon = Common.find("CoinIcon",node,cc.Sprite);
            item.animation = node.getComponent(cc.Animation);
            this.items.push(item);
            
        },Array(7),this.template);
        // this
        cc.log("当前签到第",UserInfo.lastSign_day,"天");
        this.dayRoot.node.parent.y = 100;
    }

    start () {

    }

    //视频 签到
    click_claim_double()
    {
        if(this._btnData[0] == "share"){
            Platform.doShare(Util.shareConfigs["get_sign_double"],()=>{
                if(UserInfo.lastSign_type == SignType.Single){
                    this.addAward(1);
                }else{
                    this.addAward(2);
                }
                UserInfo.addData("dayShareTime",1,true);
                UserInfo.lastSign_type = SignType.Double;
                this.doSign();
       
            },this);
        }else{
            Platform.watch_video(Util.shareConfigs["get_sign_double"],()=>{
                if(UserInfo.lastSign_type == SignType.Single){
                    this.addAward(1);
                }else{
                    this.addAward(2);
                }
                UserInfo.addData("dayVideoTime",1,true);
                UserInfo.lastSign_type = SignType.Double;
                this.doSign();
            })
        }
        
    }

    addAward(mult?:number){
        if(this.signOrder == 0) return;
        let sign_data = csv.Sign7.get(this.signOrder);
        let res_data = csv.PlayerRes.get(sign_data.ResType);
        mult = mult ? mult : 1;

        UserInfo.addData(res_data.name.toString(),Number(sign_data.Num)*mult,true);
    }

    doSign()
    {
        this.unscheduleAllCallbacks();
        if(g.isNextDay(UserInfo.lastSign_time)){
            UserInfo.lastSign_day = UserInfo.lastSign_day + 1;
        }
        UserInfo.lastSign_time = Date.now();
        //UserInfo.lastSign_day = UserInfo.lastSign_day + 1

        UserInfo.save();
        // refresh view
        event.emit("UpdHomeView");
        this.updateView();
    }

    click_claim()
    {
        if ( g.isNextDay(UserInfo.lastSign_time))
        {
            UserInfo.lastSign_type = SignType.Single;
            this.doSign();
            this.addAward(1);

            cc.log("click claim",UserInfo.lastSign_day,csv.Sign7.get(UserInfo.lastSign_day).ResType);
            if(csv.Sign7.get(UserInfo.lastSign_day).ResType == 1 ){
                cc.log(" come in coin");
                //this.getMoney("coin");
            } else{
                cc.log("come in diamond ");
                //this.getMoney("DiamondIcon");
            }

        }
    }

    private getMoney(type:string){
        
        if(type === "coin"){
            this.schedule(function(){
                cc.log("inisitate coin");
                let coin = cc.instantiate(this.coin);
                this.items[UserInfo.lastSign_day].icon.node.addChild(coin);
                //this.iconNode.addChild(coin);
                coin.setPosition(0,0);
                //coin.runAction(cc.moveTo(0.5,30,30));
                Common.moveBezier2(coin,coin.position,(this.coin.x+30,this.coin.y+100));
            }.bind(this),0.1,8);

        }else{
            this.schedule(function(){
                let diamond = cc.instantiate(this.diamond);
                this.iconNode.addChild(diamond);
                diamond.setPosition(0,0);
                Common.moveBezier2(diamond,diamond.position,(this.diamond.x+30,this.diamond.y+100));
            }.bind(this),0.1,8);
        }
        
    }



    click_close(){
        this.getComponent(View).hide(); 
    }
    
    updateItem(v,i)
    {
        let sign_data = csv.Sign7.get(i+1);
        let res_data = csv.PlayerRes.get(sign_data.ResType);
        if(i < UserInfo.lastSign_day){
            if (g.isNextDay(UserInfo.lastSign_time)){
                v.animation.stepTo(2/4);          
            }else{
                if(i == UserInfo.lastSign_day - 1){
                    // 已签到 单倍
                    if(UserInfo.lastSign_type == SignType.Single){
                        v.animation.stepTo(0);
                    }else if(UserInfo.lastSign_type == SignType.Double){
                        // 已签到 双倍
                        v.animation.stepTo(2/4);
                    }
                }else{
                    v.animation.stepTo(2/4);
                }
                
            }
            
        }else if(i == UserInfo.lastSign_day){
            //将要签到
            if (g.isNextDay(UserInfo.lastSign_time)){
                //可以签到
                v.animation.stepTo(1/4);
                this.signOrder = i + 1;
            }else
                //暂时不能签到
                v.animation.stepTo(1)
        }else{
            //未签
            v.animation.stepTo(1)
        }
        v.dayLabel.string = `第${sign_data.ID}天`;
        v.countLabel.string = "x"+sign_data.Num;
        Common.setDisplay(v.icon,"Texture/UI/"+res_data.image);
    }

    updateView()
    {
        this.adLab.string = "领取双倍";
        //判断上一次签到时间 是否已经过去一天了
        this.node_claim.active = false;
        if ( g.isNextDay(UserInfo.lastSign_time))
        {
            UserInfo.lastSign_type = SignType.Null;
            if(UserInfo.lastSign_day >= this.items.length){
                UserInfo.lastSign_day = 0;
            }
            //未签到
            this.animation.stepTo(0);
            //2 s后显示 
            this.scheduleOnce(_=>{
                this.node_claim.active = true;
            },2)
        }else{
            //本日已领取//再领一次
            this.animation.stepTo(1);
            if(UserInfo.lastSign_type == SignType.Single){
                this.adLab.string = "再领一次";
                this.animation.stepTo(0);
            }
        }

        this.items.forEach((v,i)=>{
            this.updateItem(v,i);
        })

        this.updBtn();
    }

    updBtn(){
        this._btnData = Util.judgeBtnType("get_sign_double");

        let icon = this.adNode.getChildByName("TV_icon").getComponent(cc.Sprite);
        this._btnData[0] == "share" ? Common.setDisplay(icon,"Texture/UI/Share_icon") : Common.setDisplay(icon,"Texture/UI/TV_icon");
        this.adNode.getComponent(cc.Button).interactable = !this._btnData[1];
    }

    onShown()
    {
        Platform.showBannerAd("sign",this,true);
        // show items;
        this.updateView();
        
    }

    onHidden()
    {
        Platform.hideBannerAd();
    }

}

enum SignType{
    Null = 0,
    Single = 1,
    Double = 2,
}
