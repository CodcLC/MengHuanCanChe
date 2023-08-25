
/**
 *  MissionObj1 ：过关需求类型 
    1: 金币
    2 : 菜品
    5 : 点赞
    MissionStar1：过关条件
 */
export enum MissionType{
    Gold = 1,
    Plate = 2,
    Like = 5
}

/**
 * 
 * 特殊类型任务 
 */
export enum MissionSpecialType{
    BurntNotAllowed = 3, //不能烤糊
    AngryNotAllowed = 4 , //不能让顾客生气
    DiscardNotAllowed = 5, //不能丢弃，*(目前未配置)
}


//结束类型
/**
 * EndObj  类型
 * EndObj1  数值
 * 2 :时间 ：未完成任务 ，提示时间 不足，加30钻石 额外20s时间 （显示当前钻石数)
 * 1 :顾客数量 :如果结束了，还未完成最低任务，提示客人不足加30钻石 额外3个客人（显示当前钻石数)
 * 
 */
export enum MissionEndType{
    Customer = 1 , 
    Time = 2,
    BurntNotAllowed = 3, //不能烤糊
    AngryNotAllowed = 4 , //不能让顾客生气
    DiscardNotAllowed = 5, //不能丢弃，*(目前未配置)
}


export let ComboImages = ["Combo2" , "Combo3" , "Combo4" , "Combo5"]

/**
 * 
 */
export let Const = {
    ComboImages:ComboImages,
    
}

export let Config = {
    remote_url :'https://pub.bitgame-inc.com/static/ct/',
    config_path:"/configs/",
    csv_path:"/configs/csv/",
    share_cfg_filename:"share_config.json",
    version_file_path:"/version.txt",
    version : "1.8",
    release: false,
    version_dc: 1,
    csvs:[
        "CantingData",
        "ChujvData",
        "ConfigData",
        "FailData" , 
        "MissionData",
        "PlayerRes",
        "RecipeData",
        "ShicaiData",
        "Sign7" , 
        "TeachData",
        "Text",
        "Tips",
        "Task"
    ]
}