
declare namespace PCSDK {
    // 统计平台API
    export const stat: _StatInterface;

    // 获取数据API
    export const data: _DataInterface;

    // 游戏平台API
    export const game: _GameInterface;

    // 分享和视频
    export const share: _ShareInterface;

    // 事件管理API
    export const event: _EventInterface;

    // 在线参数API
    export const online: _OnlineInterface;

    // config.js配置操作类
    export const config: _ConfigInterface;

    // 本地缓存API
    export const storage: _StorageInterface;

    // 小游戏平台API
    export const platform: _PlatformInterface;

    // 设置debug模式
    export function setDebug(isDebug: boolean): void;

    // 获取sdk版本号 
    export const SDKVersion: string;
}

declare namespace Base64 {
    export const VERSION: string;
    export function atob(a: any): any;
    export function btoa(b: any): any;
    export function btou(b: any): any;
    export function decode(a: any): any;
    export function encode(u: any, urisafe?: any): any;
    export function encodeURI(u: any): any;
    export function extendString(): void;
    export function fromBase64(a: any): any;
    export function noConflict(): any;
    export function toBase64(u: any, urisafe?: any): any;
    export function utob(u: any): any;
}

interface _StatInterface {
    /**
     * 游戏登录后，设置openId(用于支付)、userId、注册时间regTime、注册用户来源渠道channelId、注册用户来源邀请者inviteUid
     */
    setLogind(data: _LoginData): void;

    /**
     * 数据打点
     * @param dote_type     打点类型
     * @param options       扩展参数
     */
    dot(dote_type: number, options?: any): Promise<any>;

    /**
     * 事件打点
     * @param event_key     事件key
     * @param event_source  触发事件场景/页面名称 eg：结算页面、排行榜、签到。。。
     * @param options       扩展参数
     */
    event(event_key: string, event_source: string, options?: any): Promise<any>;

    /**
     * 启动上报 
     * tips：PC老项目有使用过launchkey，须获取得到launchKey传递，其他游戏接入不用传递
     * @param launch_key    launchkey值
     */
    launch(launch_key?: string): Promise<any>;

    /**
     * loading完成，加载游戏资源完成时调用
     */
    loadingFinish(): Promise<any>;

    /**
     * 统计在线时长，onHide的时候调用
     * tips：sdk自动已调用 
     * @param time_len      离线时长（秒）
     */
    // onlineTimelen(time_len: number): Promise<any>;

    /**
     * 拒绝授权
     */
    refuseAuth(): Promise<any>;

    /**
     * Log上报 - 注册用户上报，登录自己的游戏服务器成功后调用
     * tips：login登录后，调用setLogin提供regTime、userId
     */
    reg(): Promise<any>;

    /**
     * Log上报 - 有效用户上报 — 游戏按照各自的规定点上报有效用户数据
     * tips tips tips：请确保active在reg执行完成后再去调用。
     */
    active(): Promise<any>;

    /**
     * 视频广告 - 统计
     * @param video_key     视频key
     * @param stat_type     视频类型 => 0播放中断, 1播放成功，2 拉取视频失败
     */
    // videoStat(video_key: string, stat_type: number): Promise<any>;

    /**
     * 分享统计 - 分享,会话点击
     * tips：login登录后，调用setLogin提供regTime、userId、channelId
     * @param share_id      分享ID
     * @param stat_type     分享类型 => 0分享成功，1会话点击进入
     * @param type          分享成功type=0，点击分享进入游戏type=1，点击分享进入游戏注册成功type=2
     */
    // shareStat(share_id: any, stat_type: number, type: number): Promise<any>;

    /**
     * 分享列表
     */
    shareList(): Promise<any>;

    /**
     * banner统计
     * @param banner_data   banner数据信息
     * @param click_type    点击类型 => 0 点击icon，-1 弹框【取消】
     * @param location      banner位置 => 100结算页面，110游戏页面，120关卡底部，130首页，140签到页，150复活页，160头部banner，170转盘页
     */
    // bannerStat(banner_data: any, click_type: number, banner_location: number): Promise<any>;

    /**
     * 广告点击跳转
     * @param location      banner位置 => 100结算页面，110游戏页面，120关卡底部，130首页，140签到页，150复活页，160头部banner，170转盘页
     * @param banner_data   单项banner广告数据，通过bannerList获取到的数据列表，点击项的单元数据
     * @param opts          扩展参数
     * {
     *      extraData： 需要传递给目标小程序的数据
     *      envVersion：要打开的小程序版本 develop 	开发版	trial	体验版	release	正式版
     * }
     */
    bannerNavigateTo(location: number, banner_data: any, opts?: { extraData?: string; envVersion?: string }): Promise<any>;

    /**
     * 添加曝光数据
     * @param location      banner位置 => 100结算页面，110游戏页面，120关卡底部，130首页，140签到页，150复活页，160头部banner，170转盘页
     * @param banner_data   banner广告数据列表或者单项banner广告数据：eg { banner_id : xxx, ... } || [{ banner_id : xxx, ... },{ banner_id : xxx, ... },{ banner_id : xxx, ... }]
     * tip1：支持多项曝光列表数据和一个banner数据
     */
    addExposure(location: number, banner_data: Array<any> | any): void;

    /**
     * tips：sdk自动已调用 曝光请求，onHide的时候调用
     */
    // bannerExposure(): Promise<any>;

    /**
     * 获取广告列表
     * @param banner_type   banner广告类型 => 50 猜你喜欢  70 抽屉式广告位  40 悬浮框
     */
    bannerList(banner_type: number): Promise<any>;

    /**
     * 广点通打点
     * @param gdt_vid       广告gdt id
     * @param aid           广告id 
     */
    // adStat(gdt_vid: string, aid: string): Promise<any>;

    /**
     * 用户log - 登录
     * tips：sdk自动已自动调用 
     * @param type {Number}           登录步骤类型：1、启动 ；2、登陆完成
     */
    // login(type: number): Promise<any>;

    /**
     * 用户log - 登出，监听游戏onHide时请求
     * @param last_level {Number} 最新关卡进度
     */
    logout(last_level: number): Promise<any>;

    /**
     * 用户log - 授权成功，游戏授权后请求
     * @param last_level {Number}     最新关卡进度
     * @param userinfo   {_UserInfo}  平台授权后返回userinfo信息
     */
    authorize(last_level: number, userinfo: _UserInfo): Promise<any>;

    /**
     * 用户log - 添加资源变更，金币、钻石、体力等等资源有变更的时候触发
     * @param res_data {Array<_LogResData> | _LogResData} 一项或者多项资源数据
     */
    addLogRes(res_data: Array<_LogResData> | _LogResData): Promise<any>;

    /**
     * 用户log - 添加关卡数据
     * @param level_data {Array<_LogLevelData> | _LogLevelData} 一项或者多项关卡数据
     * tips：请在游戏关卡界面onHide事件中触发level_data数据type为3（主动退出-onhide）
     */
    addLogLevel(level_data: Array<_LogLevelData> | _LogLevelData): Promise<any>;
}

interface _GameInterface {
    /**
     * 请求游戏环境
     * @param version       // 后端服务器版本号，必填
     */
    env(version: string): Promise<any>;

    /**
     * 发起登录流程，返回登录数据信息，具体返回数据详情请看api文档
     * @param isRelogin Boolean 是否重新登录
     * tips：如果是重新登录，SDK内已经处理：token清空
     */
    login(isRelogin?: boolean): Promise<any>;

    /**
     * 获取登录游戏后，游戏数据信息
     */
    getAllData(): Promise<any>;

    /**
     * 分享视频广告成功统计
     * @param stat_type  统计类型 0分享 1视频
     */
    adStat(stat_type: number): Promise<any>;

    /**
     * 获取今日福利列表
     */
    getGoldPool(): Promise<any>;

    /**
     * 设置好友邀请和唤醒
     * user_invite_uid 邀请者uid
     */
    setInviteFriend(user_invite_uid: number): Promise<any>;

    /**
     * 观看视频获得金币
     */
    setLookVideoToGold(): Promise<any>;

    /**
     * 领取好友邀请和唤醒所获得的金币
     * @param type 1：邀请好友类型，2：唤醒好友类型
     */
    getPoolGoldByType(type: number): Promise<any>;
}

interface _ShareInterface {
    /**
     * 初始化分享，shareKey表示的是右上角转发key，请前往后台配置
     * @param shareKey 
     */
    init(shareKey?: string): void;

    /**
     * 发起分享
     * @param shareKey  后台配置的分享key
     * @param params    {Object?} 分享链接携带参数
     * @param opts      {Object?} 扩展参数
     *      配置shareImg表示自定义图片，不走后台配置分享图片
     *      配置shareTitle表示自定义标题，不走后台配置分享描述，shareTitle搭配格式化参数formater（对象或者数组方式），参照下面例子：
     *         eg1：share( xxx, xxx, { shareTitle: '{from}邀请了{to}', formater: { from: '张三', to: '李四'} } ) => shareTitle转换成：张三邀请了李四
     *         eg2：share( xxx, xxx, { shareTitle: '{1}邀请了{0}', formater: ...['李四', '张三'] } ) => shareTitle转换成：李四邀请了张三
     */
    share(shareKey: string, params: any, opts?: any): Promise<any>;

    /**
     * 分享自动入口
     * @param shareKey  通过shareKey获取得到shareType，传递shareType给shareWithType接口
     * @param params    context: 函数执行上下文 fail: Function 失败函数 success: Function 成功函数
     */
    shareDispatch(shareKey: string, params?: { success?: Function, fail?: Function, context?: any }): void;

    /**
     * 分享自动入口
     * @param shareType  Object 分享类型，有以下枚举值
     * {
     *       None = -1,          // -1无分享无视频
     *       Share = 0,          // 0分享
     *       ShareAysnc = 1,     // 1异步分享
     *       Video = 2,          // 2看视频
     *       VideoToShare = 3,   // 3无视频则分享
     *       VideoAndShare = 4   // 4视频和分享(控制分享和视频两个按钮的显示) ，
     * }
     * @param shareKey  
     * @param params    context: 函数执行上下文 fail: Function 失败函数 success: Function 成功函数
     */
    shareWithType(shareType: number, shareKey: string, params?: { success?: Function, fail?: Function, context?: any }): void;

    onceAsync(shareKey: string, handler: Function, context: any): void;

    triggerAsync(shareKey: string, shareTickets: string, params?: any): void;
}

interface _EventInterface {
    /**
     * 触发事件
     * @param evt 事件名称
     * @param args 事件监听函数的参数
     */
    emit(evt: string, ...args: any[]): _EventInterface;

    /**
     * 注册事件
     * tip1: 监听小游戏onShow事件：监听key为app.show
     * tip2: 监听小游戏onHide事件：监听key为app.hide
     * @param evt 事件名称
     */
    add(evt: string, handler: Function, context: any): _EventInterface;

    /**
     * 注册一次事件
     * @param evt 事件名称
     */
    once(evt: string, listener: Function, context?: any): _EventInterface;

    /**
     * 移除事件
     * @param evt 事件名称
     */
    remove(evt: string, handler: Function, context: any): _EventInterface;

    /**
     * 移除所有evt事件
     * @param evt 事件名称
     */
    removeAll(evt: string): _EventInterface;
}

interface _DataInterface {
    setEnvEnum(code: number): void;

    Token: string;          // 游戏使用到的token

    Authorize: boolean;     // 是否登录授权验证

    Version: string;        // 版本号

    CdnUrl: string;         // CDN动态url

    GameApi: string;        // 游戏api path

    Scene: string;          // 游戏场景来源

    ReferrerInfo: _RefererInfoData;  // getLaunchOptions 来源信息。从另一个小程序、公众号或 App 进入小程序时返回。否则返回 {}。(参见后文注意)

    UserId: number;         // 游戏user_id

    RegTime: number;        // 用户第一次创建注册时间戳

    ShareId: number;        // 分享id

    ShareKey: number;       // 分享Key

    Platform: string;       // 游戏手机平台  ios/android/devtools

    ChannelId: number;      // 渠道id

    InviteType: any;        // 会话邀请类型

    InviteUid: any;         // 用户来源邀请者ID，login后获取得到

    QueryUserInviteUid: any;// 分享后进入获取得到的query的邀请者id

    Shield: number;         // 是否开启屏蔽，0否，1是

    ShareTicket: string;    // 会话群分享ticket

    SystemId: number;       // 系统类型: 0 iOS, 1 Android

    LaunchKey: string;      // 启动key,自动生成并缓存

    LaunchSource: string;   // 启动来源，0正常进入，1分享会话进入
}

interface _OnlineInterface {
    /**
     * 设置Debug模式
     * 默认在非Debug模式下，是受请求时间间隔的限制的，即两次请求的时间间隔应该大于10分钟；而在Debug模式下，是不受时间间隔限制的。
     * @param isDebug 是否debug模式
     */
    setDebugMode(isDebug: boolean): void;

    /**
     * 请求在线参数
     * 在游戏启动时候请求在线参数，最早的获取得的在线参数。
     */
    updateOnlineConfig(): Promise<any>;

    /**
     * 获取在线参数
     * @param key 在线参数key
     */
    getParams(key: string): any;

    /**
     * 获取数值在线参数
     * @param key 在线参数key
     * @param defaultVal 获取不到使用默认值
     */
    getParamsObj(key: string, defaultVal?: any);

    /**
     * 获取数值在线参数
     * @param key 在线参数key
     * @param defaultVal 获取不到使用默认值
     */
    getParamsInt(key: string, defaultVal?: number): number;

    /**
     * 获取数值在线参数
     * @param key 在线参数key
     * @param defaultVal 获取不到使用默认值
     */
    getParamsString(key: string, defaultVal?: string): string;
}

interface _ConfigInterface {
    /**
     * 合并覆盖配置：合并config.js配置信息
     * @param conf Object 配置信息 
     */
    merge(conf: any): void;
}

interface _StorageInterface {
    /**
     * 设置本地存储
     * @param expiration 过期时间(秒)
     */
    set(key: string, value: Object, expiration?: number): void;

    /**
     * 获取缓存
     * @param key 
     */
    get(key: string): any;

    /**
     * 移除缓存
     * @param key 
     */
    remove(key: string): void;

    /**
     * 清除缓存 
     */
    clear(): void;

    /**
     * 判断缓存是否存在
     * @param key 
     */
    isExist(key: string): boolean;
}

interface _PlatformInterface {
    /**
     * 创建授权按钮
     * @param type      页面类型
     * @param params    按钮样式，参照微信授权按钮参数
     * @param opts {Object}
     * {
     *      isDebug:boolean     是否是调试模式
     *      callback:(status: number, ret: _getUserInfoSuccessObject | null ) => void 
     *                          回调函数
     *                          参数status： 1（授权成功） 0（授权失败）  -1（取消授权）取消授权会弹出是否调整到设置界面设置
     *                          参数ret：当status状态为1的时候返回wx.getUserInfo返回的数据信息_getUserInfoSuccessObject，status为0或者-1返回null
     *      context:any         函数执行上下文
     * }
     */
    createUserBtn(
        type: string,
        params: Array<_UserInfoButtonObject> | _UserInfoButtonObject,
        opts: { isDebug?: boolean; callback: (status: number, ret: _getUserInfoSuccessObject | null) => void; context: any }
    ): void;

    /**
     * 根据类型显示授权按钮
     * @param type 
     */
    showUserBtn(type: string): void;

    /**
     * 根据类型隐藏授权按钮
     * @param type 
     */
    hideUserBtn(type: string): void;

    /**
     * 根据类型销毁授权按钮
     * @param type 
     */
    destoryUserBtn(type: string): void;

    /**
     * 销毁所有授权按钮
     */
    destoryAllUserBtn(): void;

    /**
     * 多平台发起支付
     * @param params {Object} 
     * {
     *      money: 支付花费钱，单位元
     *      desc:  支付道具的描述
     * }
     */
    pay(params: { money: number; desc: string });

    /**
     * 多平台用户支付log
     * @param params {Object}
     * {
     *      type:       支付类型：0支付失败，1支付成功，-1取消支付
     *      source:     触发支付的页面
     *      amount:     实际支付金额，单位分
     *      buy_id:     购买内容ID
     *      buy_name:   购买内容名称
     *      item_info:  获得的道具内容：道具id及数量，逗号分隔，多项使用分号分隔 => 1,1;2,10;3,100
     * }
     */
    logPay(params: { type: number; source: string; amount: number; buy_id: string | number; buy_name: string; item_info: string });

    /**
     * 获取视频是否正在播放中
     */
    isVideoPlaying(): boolean;

    /**
     * 场震动
     */
    vibrateLong(): Promise<any>;

    /**
     * 短震动
     */
    vibrateShort(): Promise<any>;

    /**
     * 开启关闭群排行
     * @param val 
     */
    updateShareMenu(val: boolean): void;

    /**
     * 检测更新
     * @param data 参数与wx.showModal一模一样，可不传递，不传递更新状态下弹出默认的弹出框：title=>更新提示 content=>新版本已经准备好，是否重启应用？
     */
    checkUpdate(data?: _ShowModalObject): void;

    /**
     * 显示模态弹出框
     * @param data 
     */
    showModal(data: _ShowModalObject): void;

    /**
     * 复制文本
     * @param str 
     */
    copy(str: string): Promise<any>;
}

interface _LoginData {
    openId?: string;
    userId?: number | string;
    regTime?: number | string;
    channelId?: number | string;
    inviteUid?: number | string;
}

interface _LogLevelData {
    /**
     * 关卡ID
     */
    id: string | number;

    /**
     * 操作次数
     */
    anum?: number;

    /**
     * 是否使用复活，rnum传递true，表示使用复活，复活次数+1；传递false或者不传递没有使用复活，复活次数不变
     */
    rnum?: boolean;

    /**
     * 耗时，单位秒
     */
    ctime?: number;

    /**
     * 是否第一次体验关卡，1是，0否
     */
    first?: number;

    /**
     * 结束类型，1、通关；2、失败；3、主动退出-onhide
     */
    type?: number;
}

interface _LogResData {
    /**
     * 资源ID，客户端自定义配置
     */
    id: string | number;

    /**
     * 资源名称，客户端自定义配置
     */
    name: string;

    /**
     * 类型，0减少，1增加
     */
    type: number;

    /**
     * 变化数量
     */
    cnum: number;

    /**
     * 变化后剩余数量
     */
    onum: number;

    /**
     * 变化原因，客户端自定义配置
     */
    reason: string;
}

interface _ExposureData {
    banner_id: string | number;
}

interface _RefererInfoData {
    /**
     * 来源小程序、公众号或 App 的 appId
     */
    appId: string;

    /**
     * 来源小程序传过来的数据，scene=1037或1038时支持
     */
    extData: any;
}

interface _UserInfo {
    /**
     * 用户昵称
     */
    nickName: string;

    /**
     * 用户头像图片的 URL。URL 最后一个数值代表正方形头像大小（有 0、46、64、96、132 数值可选，0 代表 640x640 的正方形头像，
     * 46 表示 46x46 的正方形头像，剩余数值以此类推。默认132），用户没有头像时该项为空。若用户更换头像，原有头像 URL 将失效。
     */
    avatarUrl: string;

    /**
     * 用户性别，gender 的合法值 0：未知 1：男性 2：女性
     */
    gender: number;

    /**
     * 用户所在国家
     */
    country: string;

    /**
     * 用户所在身份
     */
    province: string;

    /**
     * 用户所在城市
     */
    city: string;

    /**
     * 显示 country，province，city 所用的语言
     * language 的合法值   en：英文  zh_CN：简体中文  zh_TW：繁体中文
     */
    language: string;
}

interface _ShowModalObject {
    title?: string;

    content?: string;

    showCancel?: boolean;

    cancelText?: string;

    cancelColor?: string;

    confirmText?: string;

    confirmColor?: string;

    success?: (result: _ShowModalSuccessObject) => void;

    fail?: (err) => void;

    complete?: () => void;
}

interface _ShowModalSuccessObject {
    /**
     * 为 true 时，表示用户点击了确定按钮
     */
    confirm: boolean;

    /**
     * 为 true 时，表示用户点击了取消（用于 Android 系统区分点击蒙层关闭还是点击取消按钮关闭）
     */
    cancel: boolean;
}


interface _getUserInfoSuccessObject {
    /**
     * 用户信息对象，不包含 openid 等敏感信息
     */
    userInfo: _UserInfo;

    /**
     * 不包括敏感信息的原始数据字符串，用于计算签名。
     */
    rawData: string;

    /**
     * 使用 sha1( rawData + sessionkey ) 得到字符串，用于校验用户信息，参考文档 [signature](./signature.md)。
     */
    signature: string;

    /**
     * 包括敏感数据在内的完整用户信息的加密数据，详细见[加密数据解密算法](./signature.md#加密数据解密算法)
     */
    encryptedData: string;

    /**
     * 加密算法的初始向量，详细见[加密数据解密算法](./signature.md#加密数据解密算法)
     */
    iv: string;
}

interface _UserInfoButtonObject {
    /**
     * 按钮的类型
     */
    type: string;

    /**
     * 按钮上的文本，仅当 type 为 text 时有效
     */
    text?: string;

    /**
     * 按钮的背景图片，仅当 type 为 image 时有效
     */
    image?: string;

    /**
     * 按钮的样式
     */
    style: _ButtonStyle;

    /**
     * 是否带上登录态信息。当 withCredentials 为 true 时，要求此前有调用过 wx.login 且登录态尚未过期，
     * 此时返回的数据会包含 encryptedData, iv 等敏感信息；当 withCredentials 为 false 时，不要求有登录态，
     * 返回的数据不包含 encryptedData, iv 等敏感信息。
     */
    withCredentials?: boolean;
}

interface _ButtonStyle {
    left: number;

    top: number;

    width: number;

    height: number;

    backgroundColor?: string;

    borderColor?: string;

    textAlign?: string;

    borderWidth?: number;

    borderRadius?: number;

    fontSize?: number;

    lineHeight?: number;
}