
declare namespace csv{
    
    interface CantingData_Row {
        
        /**
         * @type {number}
         * @description ID
         */
        ID?:number,

        /**
         * @type {string}
         * @description 备注
         */
        desc?:string,

        /**
         * @type {number}
         * @description 章节名
         */
        ChapterName?:number,

        /**
         * @type {number}
         * @description 下一章节
         */
        next_id?:number,

        /**
         * @type {number}
         * @description 餐厅图标
         */
        icon?:number,

        /**
         * @type {[number]}
         * @description 食材
         */
        Shicai?:[number],

        /**
         * @type {[number]}
         * @description 厨具
         */
        Chuju?:[number],

        /**
         * @type {[number]}
         * @description 所属关卡
         */
        Mission?:[number]
    };
    
    export class CantingData{
        static get(id:number|string):CantingData_Row
        static values:CantingData_Row[];
        static search(predicate: (value: CantingData_Row, index: number) => boolean):CantingData_Row[]
        static size:number;
    }


    interface ChujvData_Row {
        
        /**
         * @type {number}
         * @description ﻿ID
         */
        ID?:number,

        /**
         * @type {string}
         * @description 备注
         */
        desc?:string,

        /**
         * @type {number}
         * @description 开启
         */
        unlock?:number,

        /**
         * @type {number}
         * @description 名称
         */
        text?:number,

        /**
         * @type {number}
         * @description 商店图标
         */
        icon?:number,

        /**
         * @type {number}
         * @description 提示
         */
        tips_text?:number,

        /**
         * @type {number}
         * @description 关联
         */
        NextChujv?:number,

        /**
         * @type {number}
         * @description 食材
         */
        ShicaiID?:number,

        /**
         * @type {number}
         * @description 升级1
         */
        GoldLv1?:number,

        /**
         * @type {number}
         * @description 升级2
         */
        GoldLv2?:number,

        /**
         * @type {number}
         * @description 个数1
         */
        num1?:number,

        /**
         * @type {number}
         * @description 个数2
         */
        num2?:number,

        /**
         * @type {number}
         * @description 个数3
         */
        num3?:number,

        /**
         * @type {number}
         * @description 制作1
         */
        Time1?:number,

        /**
         * @type {number}
         * @description 制作2
         */
        Time2?:number,

        /**
         * @type {number}
         * @description 制作3
         */
        Time3?:number,

        /**
         * @type {number}
         * @description 烧糊
         */
        ShaohuTime?:number
    };
    
    export class ChujvData{
        static get(id:number|string):ChujvData_Row
        static values:ChujvData_Row[];
        static search(predicate: (value: ChujvData_Row, index: number) => boolean):ChujvData_Row[]
        static size:number;
    }


    export class ConfigData{
        
        /**
         * @type {number}
         * @description 奖利限制次数（分享）
         */
        static reward_total_limit?:number;

        /**
         * @type {number}
         * @description 奖励限制次数（视频）
         */
        static reward_total_limit_advertisement?:number;

        /**
         * @type {number}
         * @description 体力奖励_视频
         */
        static reward_live_advertisement?:number;

        /**
         * @type {number}
         * @description 体力奖励_分享
         */
        static reward_live_share?:number;

        /**
         * @type {number}
         * @description 金币奖励_视频
         */
        static reward_coin_advertisement?:number;

        /**
         * @type {number}
         * @description 金币奖励_分享
         */
        static reward_coin_share?:number;

        /**
         * @type {number}
         * @description 钻石奖励_视频
         */
        static reward_diamond_advertisement?:number;

        /**
         * @type {number}
         * @description 钻石奖励_分享
         */
        static reward_diamond_share?:number;

        /**
         * @type {number}
         * @description 金币获取倍率_免费开始游戏
         */
        static reward_coin_times_free_game?:number;

        /**
         * @type {number}
         * @description 金币获取倍率_结算双倍金币
         */
        static reward_coin_times_end_game?:number;

        /**
         * @type {number}
         * @description 体力上限
         */
        static live_limit?:number;

        /**
         * @type {number}
         * @description 体力上限增加（添加至我的小程序）
         */
        static live_limit_gain?:number;

        /**
         * @type {number}
         * @description 体力增加（添加至我的小程序）
         */
        static live_limit_gain_extra?:number;

        /**
         * @type {number}
         * @description 玩家初始钻石
         */
        static initial_diamond?:number;

        /**
         * @type {number}
         * @description 玩家初始金币
         */
        static initial_coin?:number;

        /**
         * @type {number}
         * @description 三星通关获得额外体力
         */
        static perfect_clearance_diamond_reward?:number;

        /**
         * @type {number}
         * @description 自动上菜使用上限
         */
        static auto_server_limit?:number;

        /**
         * @type {number}
         * @description 自动上菜每日免费次数
         */
        static auto_server_freeTime?:number;

        /**
         * @type {number}
         * @description 恢复体力时间
         */
        static live_recovery_time?:number;

        /**
         * @type {number}
         * @description 恢复体力文本_恢复中
         */
        static live_recovery_1?:number;

        /**
         * @type {number}
         * @description 恢复体力文本_已满
         */
        static live_recovery_2?:number;

        /**
         * @type {string}
         * @description 小提示文本
         */
        static tips_text?:string;

        /**
         * @type {string}
         * @description 连击获得金币
         */
        static comboHits?:string;

        /**
         * @type {number}
         * @description 连击时间
         */
        static comboTime?:number;

        /**
         * @type {number}
         * @description 生气条恢复
         */
        static anger_recover?:number;

        /**
         * @type {string}
         * @description 未完成三星_购买时间（无论哪个类型）
         */
        static not_perfect_to_buy_time?:string;

        /**
         * @type {string}
         * @description 音乐_游戏背景
         */
        static sound_music_1?:string;

        /**
         * @type {string}
         * @description 音乐_战斗背景
         */
        static sound_music_2?:string;

        /**
         * @type {string}
         * @description 音效_战斗胜利
         */
        static sound_battle_victory?:string;

        /**
         * @type {string}
         * @description 音效_战斗失败
         */
        static sound_battle_fail?:string;

        /**
         * @type {string}
         * @description 音效_战斗复活
         */
        static sound_battle_revive?:string;

        /**
         * @type {string}
         * @description 音效_点击UI
         */
        static sound_click_ui?:string;

        /**
         * @type {string}
         * @description 音效_成功升级食材和厨具
         */
        static sound_level_up?:string;

        /**
         * @type {string}
         * @description 音效_获得金币
         */
        static sound_reward_coin?:string;

        /**
         * @type {string}
         * @description 音效_获得钻石
         */
        static sound_reward_diamond?:string;

        /**
         * @type {string}
         * @description 音效_倒计时关卡_倒计时
         */
        static sound_clock_tick?:string;

        /**
         * @type {number}
         * @description 日常任务数
         */
        static daily_task_num?:number;

        /**
         * @type {number}
         * @description 日常_开启关卡
         */
        static task_open_mission?:number;

        /**
         * @type {number}
         * @description 成就_开启关卡
         */
        static achievement_open_mission?:number;

        /**
         * @type {number}
         * @description 布丁_开启关卡
         */
        static pudding_open_mission?:number;

        /**
         * @type {number}
         * @description 布丁_数量
         */
        static pudding_num?:number;

        /**
         * @type {number}
         * @description 布丁_恢复时间
         */
        static pudding_recover_time?:number;

        /**
         * @type {number}
         * @description 布丁_恢复个数
         */
        static pudding_recover_num?:number;

        /**
         * @type {number}
         * @description 布丁_扩充上限数量
         */
        static pudding_increase_num?:number;

        /**
         * @type {number}
         * @description 布丁_扩充上限次数
         */
        static pudding_increase_limit?:number;

        /**
         * @type {string}
         * @description 布丁_扩充价格
         */
        static pudding_increase_price?:string
    }

    interface FailData_Row {
        
        /**
         * @type {number}
         * @description ID
         */
        ID?:number,

        /**
         * @type {string}
         * @description 备注
         */
        desc?:string,

        /**
         * @type {number}
         * @description 警告
         */
        Tip?:number,

        /**
         * @type {number}
         * @description 内容
         */
        TetTitle?:number,

        /**
         * @type {number}
         * @description 描述
         */
        TxtContent?:number,

        /**
         * @type {number}
         * @description 复活
         */
        cost?:number,

        /**
         * @type {number}
         * @description 增加数
         */
        reward?:number,

        /**
         * @type {string}
         * @description 图标
         */
        Icon?:string
    };
    
    export class FailData{
        static get(id:number|string):FailData_Row
        static values:FailData_Row[];
        static search(predicate: (value: FailData_Row, index: number) => boolean):FailData_Row[]
        static size:number;
    }


    interface MissionData_Row {
        
        /**
         * @type {number}
         * @description ﻿ID
         */
        ID?:number,

        /**
         * @type {string}
         * @description 备注
         */
        desc?:string,

        /**
         * @type {number}
         * @description 名称
         */
        text?:number,

        /**
         * @type {number}
         * @description 类型 1-顾客数 2-时间
         */
        EndObj?:number,

        /**
         * @type {number}
         * @description 值
         */
        EndObj1?:number,

        /**
         * @type {number}
         * @description 条件  1-金币 2-菜品 5-点赞
         */
        MissionObj1?:number,

        /**
         * @type {number}
         * @description 1星
         */
        MissionStar1?:number,

        /**
         * @type {number}
         * @description 2星
         */
        MissionStar2?:number,

        /**
         * @type {number}
         * @description 3星
         */
        MissionStar3?:number,

        /**
         * @type {number}
         * @description 特殊 3-不能烤糊 4-不能生气
         */
        MissionObj2?:number,

        /**
         * @type {number}
         * @description 顾客间隔
         */
        Timemin?:number,

        /**
         * @type {number[]}
         * @description 掉落钻石
         */
        Zuanshi?:number[],

        /**
         * @type {number}
         * @description 标记
         */
        JiesuoXing?:number,

        /**
         * @type {number}
         * @description 食谱1
         */
        ShipuID1?:number,

        /**
         * @type {number}
         * @description 食谱2
         */
        ShipuID2?:number,

        /**
         * @type {number}
         * @description 食谱3
         */
        ShipuID3?:number,

        /**
         * @type {number}
         * @description 食谱4
         */
        ShipuID4?:number,

        /**
         * @type {number}
         * @description 食谱5
         */
        ShipuID5?:number,

        /**
         * @type {number}
         * @description 食谱6
         */
        ShipuID6?:number,

        /**
         * @type {number}
         * @description 食谱7
         */
        ShipuID7?:number,

        /**
         * @type {number}
         * @description 食谱8
         */
        ShipuID8?:number,

        /**
         * @type {number}
         * @description 食谱9
         */
        ShipuID9?:number,

        /**
         * @type {number}
         * @description 食谱10
         */
        ShipuID10?:number,

        /**
         * @type {number}
         * @description 食谱11
         */
        ShipuID11?:number,

        /**
         * @type {number}
         * @description 食谱12
         */
        ShipuID12?:number,

        /**
         * @type {number}
         * @description 食谱13
         */
        ShipuID13?:number,

        /**
         * @type {number}
         * @description 食谱14
         */
        ShipuID14?:number,

        /**
         * @type {number}
         * @description 食谱15
         */
        ShipuID15?:number,

        /**
         * @type {number}
         * @description 食谱16
         */
        ShipuID16?:number,

        /**
         * @type {number}
         * @description 食谱17
         */
        ShipuID17?:number,

        /**
         * @type {number}
         * @description 食谱18
         */
        ShipuID18?:number,

        /**
         * @type {number}
         * @description 食谱19
         */
        ShipuID19?:number,

        /**
         * @type {number}
         * @description 食谱20
         */
        ShipuID20?:number,

        /**
         * @type {string}
         * @description 
         */
        FailReason?:string
    };
    
    export class MissionData{
        static get(id:number|string):MissionData_Row
        static values:MissionData_Row[];
        static search(predicate: (value: MissionData_Row, index: number) => boolean):MissionData_Row[]
        static size:number;
    }


    interface PlayerRes_Row {
        
        /**
         * @type {any}
         * @description ID
         */
        ID?:any,

        /**
         * @type {any}
         * @description name
         */
        name?:any,

        /**
         * @type {any}
         * @description image
         */
        image?:any,

        /**
         * @type {any}
         * @description desc
         */
        desc?:any
    };
    
    export class PlayerRes{
        static get(id:number|string):PlayerRes_Row
        static values:PlayerRes_Row[];
        static search(predicate: (value: PlayerRes_Row, index: number) => boolean):PlayerRes_Row[]
        static size:number;
    }


    interface RecipeData_Row {
        
        /**
         * @type {number}
         * @description ID
         */
        ID?:number,

        /**
         * @type {string}
         * @description 备注
         */
        desc?:string,

        /**
         * @type {[number]}
         * @description 食谱
         */
        ShicaiIDs?:[number],

        /**
         * @type {number}
         * @description 恢复
         */
        RecoveryTime?:number,

        /**
         * @type {number}
         * @description 点赞
         */
        GeizanTime?:number,

        /**
         * @type {number}
         * @description 等待
         */
        WaitTime?:number
    };
    
    export class RecipeData{
        static get(id:number|string):RecipeData_Row
        static values:RecipeData_Row[];
        static search(predicate: (value: RecipeData_Row, index: number) => boolean):RecipeData_Row[]
        static size:number;
    }


    interface ShicaiData_Row {
        
        /**
         * @type {number}
         * @description ﻿ID
         */
        ID?:number,

        /**
         * @type {string}
         * @description 备注
         */
        desc?:string,

        /**
         * @type {number}
         * @description 名称
         */
        text?:number,

        /**
         * @type {number}
         * @description 商店图标
         */
        icon?:number,

        /**
         * @type {number}
         * @description 提示
         */
        tips_text?:number,

        /**
         * @type {number}
         * @description 开启
         */
        unlock?:number,

        /**
         * @type {[number]}
         * @description 组合
         */
        ZuheID?:[number],

        /**
         * @type {number}
         * @description 售价1
         */
        SellGold1?:number,

        /**
         * @type {number}
         * @description 售价2
         */
        SellGold2?:number,

        /**
         * @type {number}
         * @description 售价3
         */
        SellGold3?:number,

        /**
         * @type {number}
         * @description 升级1
         */
        GoldLv1?:number,

        /**
         * @type {number}
         * @description 升级2
         */
        GoldLv2?:number,

        /**
         * @type {number}
         * @description 前置ID
         */
        QianZhiID?:number
    };
    
    export class ShicaiData{
        static get(id:number|string):ShicaiData_Row
        static values:ShicaiData_Row[];
        static search(predicate: (value: ShicaiData_Row, index: number) => boolean):ShicaiData_Row[]
        static size:number;
    }


    interface Sign7_Row {
        
        /**
         * @type {any}
         * @description ID
         */
        ID?:any,

        /**
         * @type {any}
         * @description ResType
         */
        ResType?:any,

        /**
         * @type {any}
         * @description Num
         */
        Num?:any
    };
    
    export class Sign7{
        static get(id:number|string):Sign7_Row
        static values:Sign7_Row[];
        static search(predicate: (value: Sign7_Row, index: number) => boolean):Sign7_Row[]
        static size:number;
    }


    interface Task_Row {
        
        /**
         * @type {number}
         * @description ﻿ID
         */
        ID?:number,

        /**
         * @type {string}
         * @description 备注
         */
        desc?:string,

        /**
         * @type {number}
         * @description 名称
         */
        name?:number,

        /**
         * @type {number}
         * @description 描述
         */
        describe?:number,

        /**
         * @type {number}
         * @description 类型
         */
        type?:number,

        /**
         * @type {number}
         * @description 组
         */
        group?:number,

        /**
         * @type {number}
         * @description 下一ID
         */
        next_id?:number,

        /**
         * @type {number}
         * @description 条件
         */
        condition?:number,

        /**
         * @type {number}
         * @description 参数1
         */
        data1?:number,

        /**
         * @type {number}
         * @description 参数2
         */
        data2?:number,

        /**
         * @type {number}
         * @description 钻石
         */
        diamond?:number,

        /**
         * @type {number}
         * @description 金币
         */
        coin?:number,

        /**
         * @type {number}
         * @description 解锁大关卡
         */
        unlock?:number
    };
    
    export class Task{
        static get(id:number|string):Task_Row
        static values:Task_Row[];
        static search(predicate: (value: Task_Row, index: number) => boolean):Task_Row[]
        static size:number;
    }


    interface TeachData_Row {
        
        /**
         * @type {number}
         * @description ﻿ID
         */
        ID?:number,

        /**
         * @type {string}
         * @description 备注1
         */
        desc1?:string,

        /**
         * @type {string}
         * @description 备注2
         */
        desc2?:string,

        /**
         * @type {number}
         * @description 组
         */
        group?:number,

        /**
         * @type {number}
         * @description 下个ID
         */
        next_id?:number,

        /**
         * @type {number}
         * @description 触发时机
         */
        trigger_condition?:number,

        /**
         * @type {number}
         * @description 参数
         */
        param?:number,

        /**
         * @type {number}
         * @description 禁止
         */
        sign_ban?:number,

        /**
         * @type {number}
         * @description 产生
         */
        sign_set?:number,

        /**
         * @type {number}
         * @description 逻辑
         */
        operation?:number,

        /**
         * @type {string}
         * @description 参数1
         */
        data1?:string,

        /**
         * @type {string}
         * @description 参数2
         */
        data2?:string,

        /**
         * @type {string}
         * @description 参数3
         */
        data3?:string,

        /**
         * @type {string}
         * @description 参数4
         */
        data4?:string,

        /**
         * @type {string}
         * @description 参数5
         */
        data5?:string,

        /**
         * @type {string}
         * @description 文本
         */
        data6?:string,

        /**
         * @type {string}
         * @description 参数7
         */
        data7?:string,

        /**
         * @type {string}
         * @description 参数8
         */
        data8?:string,

        /**
         * @type {string}
         * @description 参数9
         */
        data9?:string,

        /**
         * @type {string}
         * @description 参数10
         */
        data10?:string
    };
    
    export class TeachData{
        static get(id:number|string):TeachData_Row
        static values:TeachData_Row[];
        static search(predicate: (value: TeachData_Row, index: number) => boolean):TeachData_Row[]
        static size:number;
    }


    interface Text_Row {
        
        /**
         * @type {number}
         * @description ﻿ID
         */
        ID?:number,

        /**
         * @type {string}
         * @description 备注
         */
        desc?:string,

        /**
         * @type {string}
         * @description 文本
         */
        text?:string
    };
    
    export class Text{
        static get(id:number|string):Text_Row
        static values:Text_Row[];
        static search(predicate: (value: Text_Row, index: number) => boolean):Text_Row[]
        static size:number;
    }


    interface Tips_Row {
        
        /**
         * @type {any}
         * @description ID
         */
        ID?:any,

        /**
         * @type {any}
         * @description Tishi
         */
        Tishi?:any,

        /**
         * @type {any}
         * @description YaoQing
         */
        YaoQing?:any
    };
    
    export class Tips{
        static get(id:number|string):Tips_Row
        static values:Tips_Row[];
        static search(predicate: (value: Tips_Row, index: number) => boolean):Tips_Row[]
        static size:number;
    }


}