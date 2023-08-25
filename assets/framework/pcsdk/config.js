export default {
    Env: 100,                       // 100表示线上环境，110表示测试环境
    IsDebug: false,                 // 是否debug模式，debug模式会打印log，也可以通过stat模块setDebug进行修改
    AdCacheDuration: 30,            // 广告列表缓存持续时间间隔
    IsUseShareModule: false,        // 是否使用分享模块

    GameId: 1000059,                      // 必填，游戏ID，运营提供；
    ChannelId: 20592,                   // 必填，游戏渠道ID，运营提供；
    Secret: 'NUNEOEVCNkVMdTY1MmQ1YWU5YTQzYzc4ZGNlOWU5OGUyM2FhMjAzM2U5MTc2',                  // 必填，游戏的key
    MidasPay: {                     // 米大师虚拟支付配置
        OfferId: "xxx",             // 必填，在米大师申请的应用id
        ZoneId: "1",                // 分区ID，默认：1
        Mode: "game",               // 支付的类型，不同的支付类型有各自额外要传的附加参数，默认：game
        CurrencyType: "CNY",        // 币种，默认：CNY
        Platform: 'android'         // 申请接入时的平台，platform与应用id有关。默认：android（ios暂时没有开放，这里需要配置Platform，开放后，删掉此配置，sdk已经判断平台）
    }
};