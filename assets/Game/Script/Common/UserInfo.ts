import DataCenter, { dc, field } from "../../../framework/plugin_boosts/misc/DataCenter";
import Util from "./Util";
import { Config } from "./EnumConst";
import LocalTimeSystem from "./LocalTimeSystem";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import { root } from "../Game/GameRoot";

export class LevelData{
    d = [0,0]
    constructor(v?){
        if(v)
            this.d = v.d
    }

    set star(n: number){
        this.d[0] = n;
    }

    get star(){return this.d[0]}

    /** 是否获取过3星奖励 */
    set isGetAdward3Star(b){
        this.d[1] = b ;
    }
    get isGetAdward3Star(){return this.d[1]}

}


@dc("UserInfo")
export default class UserInfoDC extends DataCenter {

    /**
     * 保存时间 
     */
    @field()
    save_timestamps = 0;

    @field()
    data_version:number = Config.version_dc

    @field()
    parentUserId:string = ""

    @field()
    userId:string = ""

    /**
     * 当前所在章节
     */
    @field()
    chapter:number = 1;

    /**
     * 当前正在玩的关卡
     */
    @field()
    playingLevel:number = 1;

    /**
     * 当前任务进度
     */
    @field()
    target_mission_num:number = 0;

    /**
     * 当前关获得的金币
     */
    @field()
    current_coin:number = 0;

    /**
     * 当前关的连击获得的金币
     */
    @field()
    doubleHit:number = 0;

    /**
     * 是否是复活状态
     */
    is_revive:boolean = false;

    /**
     * 是否是挑战三星状态 
     */
    is_chanllenge3star:boolean = false;

    /**
     * 是否破记录
     */
    is_break_record:boolean = false;



    /**
     * 引导标记
     */
    @field()
    guide_step:number = 0;

    ///------------------------------------------------------------------------------//
    /**
     * 绑定 levelDatas ，自动保存，解析,无法直接使用，请用levelDatas
     */
    @field()
    private levelDatastr:string = '{} '
    /**
     * 用户关卡数据 
     */
    levelDatas:{[index:number]:LevelData} = {}
    ///------------------------------------------------------------------------------//
    @field()
    food_levelDatastr:{[index:number]:number} = {}

    @field()
    tool_levelDatastr:{[index:number]:number} = {}

    ///------------------------------------------------------------------------------//

    @field()
    lastSign_time:number = 0;

    @field()
    lastSign_type:number = 0;

	unlock_chapters:{[index:number]:boolean} = {}

    /**
     * 签到第几天
     */
    @field()
    lastSign_day:number = 0;

    /** 当天分享次数 */
    @field()
    dayShareTime:number = 0;

    /** 当天视频次数 */
    @field()
    dayVideoTime:number = 0;

    @field()
    coin:number = 0;

    @field()
    diamond:number = 0;

    @field()
    like:number = 0;

    /** 体力 */
    @field()
    power:number = 5;

    /** 音效开关 */
    @field()
    soundEffectOn:boolean = true;

    /** 背景音乐开关 */
    @field()
    soundBgOn:boolean = true;

    /** 上次退出背景是否静音 */
     @field()
    isOffBgm:boolean = false;

    //是否第一个登陆
    @field()
    isFristOne:number = 0;

    /** 获得金币是否双倍 */
    @field()
    isCoinDouble:boolean = false;

    /** 上次登录时间戳 */
    @field()
    lastLoginTime:number = 0;

    /** 首次登录时间戳 */
    @field()
    firstLoginTime:number = 0;

    /** 体力恢复预期时间 */
    @field()
    powerRecoverTime:number = 0;

    /** 体力恢复所需时间 */
    @field()
    powerNeedTime:number = 0;
    @field()
    hasTimer:boolean = false;

    

    /**
     * 收藏状态(0未点开,1点开,2领取奖励)
     */
    @field()
    collectState:number = 0;

    /**
     * 体力上限增加值
     */
    @field()
    powerAddLimit:number = 0;

    /**
     * 第一次烤糊
     */
    @field()
    firstBurnt:boolean = true;

//---------------------------------蛋糕----------------------------------------//
//当前拥有不蛋糕的数量
@field()
cake_num:number = 0;

//蛋糕容量升级的次数
@field()
cake_up_num:number = 0;

//领取奖励的时间
@field()
cake_get_time:number = 0;

//蛋糕的当前上限值
@field()
cake_max_num:number = 0;

//当前上线能领取的数量
@field()
cake_get_num:number = 0;

//---------------------------------蛋糕----------------------------------------//


//--------------------------------------成就----------------------------------------//

/**最後完成任務的列表**/
    @field()
    total_zuihou_completetask:number[] = [];

    //连续登陆次数
    @field()
    total_continuous_login:number = 0;

    /**成就的任务列表**/
    @field()
    total_achieve_task:number[] = [];

    /**成就领取奖励列表**/
    @field()
    total_achieve_completetask:number[] = [];

    /**
     * 总：登陆天数 
     */
    @field()
    total_login:number = 0;

    /**总：服务的客人总数 */
    @field()
    total_customer:number = 0;

    /**赢取的金币数量 */
    @field()
    total_earn_gold:number = 0;

    /**制作  （ 食物ID    次数 ） */
    @field()
    total_make_food:number = 0;
    /** 连击  （ X连击     次数 ） */
    @field()
    total_combo_2:number = 0;
    @field()
    total_combo_3:number = 0;
    @field()
    total_combo_4:number = 0;
    @field()
    total_combo_5:number = 0;

    //使用蛋糕的数量 
    total_cake_use:number = 0;
    /**使用布丁 （ 次数 ） */
    @field()
    total_use_puding:number = 0;

    /**使用复活 （ 次数 ） */
    @field()
    total_revivive:number = 0;

    /**使用更多客人 （ 次数 ） */
    @field()
    total_user_more_customer:number = 0;
    /** 14.使用更多时间*/
    @field()
    total_user_more_time:number = 0;
    /**收到赞 （ 次数） */
    @field()
    total_likes:number = 0;

    /** 花费金币升级食物 （ 金币数量 ） */
    @field()
    total_money_for_food:number = 0;
    /**花费金币升级厨具 （ 金币数量 ） */
    @field()
    total_money_for_chujv:number = 0;

    /** 成就领取奖励记录 */
    @field()
    achieve_award_data:{[index:number]:number} = {}

//--------------------------------------日常----------------------------------------//
    @field()
    daily_autoCommit:number = 0;
    /**领取活跃度的奖励**/
    @field()
    daily_activeReward:number = 0;

    /**任务id数组**/
    @field()
    daily_dayTask:number[] = [];
/**
     * 登陆天数 
     */
    @field()
    daily_login:number = 0;


    /**服务的客人总数 */
    @field()
    daily_customer:number = 0;

    /**赢取的金币数量 */
    @field()
    daily_earn_gold:number = 0;

    /**制作  （ 食物ID    次数 ） */
    @field()
    daily_make_food:number = 0;

    /** 连击  （ X连击     次数 ） */
    @field()
    daily_combo_2:number = 0;
    @field()
    daily_combo_3:number = 0;
    @field()
    daily_combo_4:number = 0;
    @field()
    daily_combo_5:number = 0;

    //使用蛋糕的数量 
    @field()
    daily_cake_use:number = 0;
    /**使用布丁 （ 次数 ） */
    @field()
    daily_use_puding:number = 0;

    /**使用复活 （ 次数 ） */
    @field()
    daily_revivive:number = 0;

    /**使用更多客人 （ 次数 ） */
    @field()
    daily_user_more_customer:number = 0;
    /** 14.使用更多时间*/
    @field()
    daily_user_more_time:number = 0;
    /**收到赞 （ 次数） */
    @field()
    daily_likes:number = 0;

    /** 花费金币升级食物 （ 金币数量 ） */
    @field()
    daily_money_for_food:number = 0;
    /**花费金币升级厨具 （ 金币数量 ） */
    @field()
    daily_money_for_chujv:number = 0;
    /** 活跃度*/
    @field()
    daily_vitality:number = 0;

    /**每天随机的任务数组**/
    @field()
    daily_dailyTask:{[idex:number]:number} = {};

    //领取任务奖励的数组
    @field()
    daily_taskReward:{[idex:number]:number} = {};


    //------------------------------------------------------------------------------//
    @field()
    daily_food_makeStatData:{[idex:number]:number} = {}

    @field()
    total_food_makeStatData:{[idex:number]:number} = {}

    constructor()
    {
        super();
        event.on("UserInfo.coin",this.onCoinChanged,this)
    }

    init()
    {
        this.updateUnlockChapters()
        
    }

    recordFoodMake(foodId)
    {
        UserInfo.daily_make_food ++
        UserInfo.total_make_food ++
        let c = UserInfo.daily_food_makeStatData[foodId] || 0
        c ++ ;
        UserInfo.daily_food_makeStatData[foodId] = c
        UserInfo.total_food_makeStatData[foodId] = c 
    }

    onCoinChanged(nv,v)
    {
        let c = nv- v;
        if(root)
        {
            if(c > 0){
                UserInfo.daily_earn_gold += c 
                UserInfo.total_earn_gold += c
            }
        }
    }

    /**
     * @warnning [注意其它 数据 不要带daily_前缀，会被清掉]
     * @description 清除每日数据
     */
    clearDailyData()
    {
        let ks = this.allkeys;
        for(var i in ks)
        {
            let k = ks[i]
            if(k.startsWith("daily_")){
                UserInfo.resetValue(k);
            }
        }
    }

    /** 有限制的增加体力 */
    addPowerLimit(num:number){
        UserInfo.power += num;
        !UserInfo.powerAddLimit && (UserInfo.powerAddLimit = 0);
        let power = UserInfo.power > (UserInfo.powerAddLimit + csv.ConfigData.live_limit) ? (UserInfo.powerAddLimit + csv.ConfigData.live_limit) : UserInfo.power;
        UserInfo.setData("power",power);
        UserInfo.save("power");
    }

    getLevelData(level)
    {
        let d = this.levelDatas[level]
        if(!d)
        {
            d = new LevelData()
            this.levelDatas[level] = d;
        }
        return d;
    }

    getFoodLevelData(level)
    {
        let d = this.food_levelDatastr[level]
        if(!d)
        {
            d = 1;
            this.food_levelDatastr[level] = d;
        }
        return d;
    }

    setFoodLevelData(level,lvNum)
    {
        if(!lvNum || !level){
            return;
        }

        let d = this.food_levelDatastr[level];
        if(!d){
            this.food_levelDatastr[level] = lvNum;
        }else{
            if(lvNum > d){
                this.food_levelDatastr[level] = lvNum;
            }
        }
        

        return this.food_levelDatastr[level];
    }

    getToolLevelData(level)
    {
        let d = this.tool_levelDatastr[level]
        if(!d)
        {
            d = 1;
            this.tool_levelDatastr[level] = d;
        }
        return d;
    }

    setToolLevelData(level,lvNum)
    {
        if(!lvNum || !level){
            return;
        }

        let d = this.tool_levelDatastr[level]
        if(!d)
        {
            this.tool_levelDatastr[level] = lvNum;
        }else{
            if(lvNum > d){
                this.tool_levelDatastr[level] = lvNum;
            }
        }
        return this.tool_levelDatastr[level];
    }


    onLoadAll()
    {
        this.levelDatas = this.parseJson(this.levelDatastr);
        for(var k in this.levelDatas){
            let v = this.levelDatas[k]
            this.levelDatas[k] = new LevelData(v)
        }
    }

    updateUnlockChapters()
    {
        this.unlock_chapters[1] = true;
        // this.unlock_chapters
        csv.CantingData.values.forEach(row=>{
            let isUnlocked = row.Mission.every(v=>{
                let lvdata = UserInfo.getLevelData(v)
                return lvdata.star > 0;
            })
            this.unlock_chapters[row.next_id] = true;//isUnlocked;
        })
    }

    onBeforeSaveAll()
    {
        //upload to server 
        this.setValue("levelDatastr",JSON.stringify(this.levelDatas))
    }

    onAfterSaveAll(){
        UserInfo.save_timestamps = LocalTimeSystem.getSec();
        UserInfo.save('save_timestamps')
        Util.syncUserInfo(this.toString());
    }


    unlockChapter(chapter:number,star = 1)
    {
        let chapter_d = csv.CantingData.get(chapter)
        chapter_d.Mission.forEach(v=>{
            let vd = UserInfo.getLevelData(v)
            vd.star = star;
        })
        UserInfo.save();
    }
}

export let UserInfo:UserInfoDC = DataCenter.register(UserInfoDC);
g.setGlobalInstance(UserInfo,"UserInfo")