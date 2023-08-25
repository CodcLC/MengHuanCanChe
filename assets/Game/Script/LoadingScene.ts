import { event } from "../../framework/plugin_boosts/utils/EventManager";
import Util from "./Common/Util";
import CConfig, { GameLogic } from "./GameLogic";
import Platform from "../../framework/Platform";
import Net from "../../framework/plugin_boosts/misc/Net";
import { Config } from "./Common/EnumConst";
import { UserInfo } from "./Common/UserInfo";
import LocalTimeSystem from "./Common/LocalTimeSystem";

const {ccclass, property} = cc._decorator;


const prefabsTobeLoad = {
    S1: "Prefab/GameRes",
    S2: "Prefab/GameRes",
    S3: "Prefab/GameRes",
    S4: "Prefab/GameRes",
    Home: null,
}

let is_first = true
let with_server = false;


@ccclass
export default class LoadingScene extends cc.Component {

    static targetScene:string = null

    static param:any = null;

    static ResPrefab:cc.Prefab = null

    @property(cc.Label)
    label:cc.Label = null;
    tips:csv.Tips_Row[] = null;

    @property(cc.Label)
    percentLabel:cc.Label = null;

    @property(cc.ProgressBar)
    bar:cc.ProgressBar = null;

    @property
    defaultSceneName:string = "Home"

    onLoad () {
        LoadingScene.targetScene = LoadingScene.targetScene || this.defaultSceneName;
    }
    
    start () {
        
        this.bar.progress = 0;
        this.label.string = "加载中..."
        cc.log("当前版本号  ",Config.version);
        this.doLoading();
    }

    async login()
    {
        if(is_first)
        {
            is_first = false;
            if(with_server){
                // 登陆
                Share.CLogHelper.registerPrinter(console);
                let cfgstr = await Util.requestConfig()
                if (cfgstr)
                    CConfig.parse(cfgstr);
                else {
                    cc.log("========== error request config!")
                    this.label.string = '配置文件请求失败'
                    this.unschedule(this.showTip);
                    return false;
                }
                Platform.setShareFailTipEnable(CConfig.initConfig.simulationShareSwitch);
                let uid = 0
                if(CConfig.initConfig.needInput || cc.sys.isBrowser){
                    uid = await Util.getUserInput();
                }
                await Util.login(uid);
            }else{
                Util.isLogin = true;
                Platform.login();
                Platform.initShare(null);
            }
        }
        return true;
    }

    doLoading()
    {
        //登陆成功后
        if(cc.sys.WECHAT_GAME == cc.sys.platform && false)
        {
            this.downloadCsvs()
        }else{
            csv.loadDir("Config/csv",this.onAllCsvLoaded,this)
            csv.load("Config/csv/Tips.csv",this.onLoadTips,this);
        }
    }

    loadRemoteCsv(csvName)
    {
        return new Promise<any>((resolve,reject)=>{
            if (csv.isLoaded(csvName)){
                resolve();
            }else{
                let server_csv_path = Config.remote_url + Config.version + Config.csv_path
                let remote_csv_url = server_csv_path +csvName+".csv?r=" + Date.now()
                cc.log("load remote csv " , remote_csv_url);
                Net.httpGet(remote_csv_url,(code,res)=>{
                    if(code){
                        // cc.log(res);
                        csv.loadString(csvName,res,resolve);
                    }else{
                        cc.log("下载 csv 文件失败 ,尝试去读本地csv")
                        csv.load("Config/csv/"+csvName,resolve);
                    }
                })
            }
            
        })
    }

    downloadCsvs()
    {
        this.loadRemoteCsv("Tips").then(this.onLoadTips.bind(this));
        Promise.all(Config.csvs.map(v=>{
            return this.loadRemoteCsv(v);
        })).then(this.onAllCsvLoaded.bind(this)).catch(v=>{
            this.label.string ="配置文件加载失败:code:1"
        })
    }

    onLoadTips()
    {
        this.tips = csv.Tips.values;
        this.showTip();
    }

    showTip()
    {
        if(this.tips){
            let tip = g.getRandomInArray(this.tips) as csv.Tips_Row;
            this.label.string = tip.Tishi
        }
    }

    // onEnable(){
    //     this.schedule(this.showTip,2);
    // }

    // onDisable()
    // {
    //     this.unschedule(this.showTip);
    // }
    /** 另一天重置的值 */
    checkDayChange(){
        let lastTime = UserInfo.lastLoginTime || 0;
        let nowTime = LocalTimeSystem.getSec() * 1000;
        if(lastTime == 0 || g.isNextDay(lastTime)){
            UserInfo.dayShareTime = 0;
            UserInfo.dayVideoTime = 0;
            UserInfo.total_continuous_login ++;
            UserInfo.total_login ++ 
            UserInfo.daily_login ++ 
            let offset = nowTime - lastTime;
            //超过24小时未登陆 ，连续登陆 归0 
            if(offset > 86400000 ) //24*60*60*1000
            {
                UserInfo.total_continuous_login = 0;
            }
            UserInfo.clearDailyData();
        }
        
        UserInfo.lastLoginTime = nowTime
        // UserInfo.addData("daily_login",1)
        // UserInfo.addData("total_login",1)
        // let d = g.isGreaterDate(nowTime,lastTime)
        
        UserInfo.save();
    }

    onAllCsvLoaded()
    {
        // create success 
        //todo:  cache index , dont' do it the second time 
        csv.createIndex("ConfigData","Key","config_data")
        // this.label.string = "登陆中..."
        this.login().then(v=>{
            if(v == false) return;
            if(UserInfo.guide_step == 0){
                //特殊处理，
                UserInfo.chapter = 1;
                UserInfo.playingLevel = 101
                LoadingScene.targetScene = "S1"
            }
            this.checkDayChange();
            this.loadNextScene();
        })
    }

    loadNextScene()
    {
        cc.director.preloadScene(LoadingScene.targetScene,(c,t,i)=>{
            this.percentLabel.string = `${(c/t*100).toFixed(1)}%`
            this.bar.progress = c/t;
        },_=>{
            event.emit("SceneChange")
            // cc.director.loadScene(LoadingScene.targetScene,_=>{
            //     this.onLoadFinished()
            // });
            let prefabPath = prefabsTobeLoad[LoadingScene.targetScene]
            if(prefabPath)
            {
                cc.loader.loadRes(prefabPath, cc.Prefab , (err,prefab)=>{
                    cc.director.loadScene(LoadingScene.targetScene,_=>{
                        let node = cc.instantiate(prefab)
                        cc.director.getScene().addChild(node,-1);
                        this.onLoadFinished()
                    })
                })
            }else{
                cc.director.loadScene(LoadingScene.targetScene,_=>{
                    this.onLoadFinished()
                });
            }
        })
    }

    onLoadFinished(node?)
    {
        let root = cc.find("Canvas")
        if(root)
        {
            root.getComponents(cc.Component).forEach((v:any)=>{
                if(v != this &&  v.onLoadFinished)
                {
                    v.onLoadFinished(LoadingScene.param,node)
                }
            })
        }
    }
}