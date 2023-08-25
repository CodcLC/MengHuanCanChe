# SDK使用文档


### 安装步骤
1、得到sdk压缩包，解压后，拷贝sdk文件夹到您微信开发者项目xxx目录下

2、在游戏game.js中引入sdk，将下面这段代码放到game.js中。
~~切记放入**require("weapp-adapter.js");**下面一行，因为window在weapp-adapter已经声明了。sdk放在第一行会报错。~~
```
require('./xxx/sdk/sdk.js');
```

3、管理员或开发者身份在微信小程序后台→设置→开发者设置中添加 request合法域名
prod 100 线上域名：https://dataapi.d3games.com
dev  110 测试域名：https://pre-dataapi.d3games.com

4、配置config.js中的相应配置项目
```
export default {
    Env: 100,                       // 100表示线上环境，110表示测试环境
    IsDebug: false,                 // 是否debug模式，debug模式会打印log，也可以通过stat模块setDebug进行修改
    AdCacheDuration: 30,            // 广告列表缓存持续时间间隔
    IsUseShareModule: false,        // 是否使用分享模块
    
    GameId: 100000,                 // 必填，游戏ID，运营提供；
    ChannelId: 100,                 // 必填，游戏渠道ID，运营提供；
    Secret: 'NUI3QTMwMTlycTg4MmQ0ZjRmZDBi',  // 必填，游戏的key
    
    MidasPay: {                     // 米大师虚拟支付配置
        OfferId: "xxx",             // 必填，在米大师申请的应用id
        ZoneId: "1",                // 分区ID，默认：1
        Mode: "game",               // 支付的类型，不同的支付类型有各自额外要传的附加参数，默认：game
        CurrencyType: "CNY",        // 币种，默认：CNY
        Platform: 'android'         // 申请接入时的平台，platform与应用id有关。默认：android（ios暂时没有开放，这里需要配置Platform，开放后，删掉此配置，sdk已经判断平台）
    }
};
```
5、开发游戏使用的开发语言为Typescript的话，请复制sdk.d.ts文件到开发工程中；
使用的是其他语言开发，可以忽略这个文件。

**ps：PCSDK目前只实现了小游戏的功能，后续考虑多平台支持...**




## 用户操作: stat模块

### 登陆

 **简介：**

登录游戏成功后，设置用户ID、用户注册时间、用户来源渠道、邀请来源

**参数说明：**

| 参数     | 类型   | 必填 | 说明   | 示例   |
| -------- | ------ | ---- | ------ |------ |
| data     | object | 是   | 用户登录信息 | {userId: xxx, regTime:xxx} |

**请求示例：**

```
PCSDK.stat.setLogind({ userId: xxx, regTime: xxx }).then(res => {
    cc.log(res)
}).catch(err => {
    cc.log(err)
});
```

### 数据打点

 **简介：**

游戏数据打点功能：后台配置打点类型

**参数说明：**

| 参数     | 类型   | 必填 | 说明   |
| -------- | ------ | ---- | ------ |
| dot_type | number | 是   | 打点类型 |
| options  | objecgt| 否   | 扩展参数 |

**请求示例1：**

```
PCSDK.stat.dot(10001).then(res => {
    cc.log(res)
}).catch(err => {
    cc.log(err)
});
```
**请求示例2：**

```
PCSDK.stat.dot(10001, { res_id: 10001 }).then(res => {
    cc.log(res)
}).catch(err => {
    cc.log(err)
});
```



## 事件操作: event模块

 **简介：**

事件是一种观察者的设计模式，对象可以发布事件，然后其它对象可以观察该对象，等待这些时刻到来并通过运行代码来响应。事件本质是一种通信方式，是一种消息，只有存在多个对象，多个模块的情况下，才有可能需要用到事件进行通信。模块化开发后，可以使用自定义事件进行各模块间协作了。

事件必须要提供以下几种功能:

绑定事件：事件绑定必须要指定事件的类型和事件的处理函数，事件函数里面this一般都是当前实例，这个在某些情况下可能不适用，我们需要重新指定事件处理函数运行时的上下文环境。因此确定事件绑定时三个参数分别为:事件类型、事件处理函数、事件处理函数执行上下文。事件绑定要干什么呢，其实很简单，事件绑定只用将相应的事件名称和事件处理函数记录下来即可，由于一种事件可以绑定多次，执行时依次执行，所有事件类型下的处理函数存储使用的是数组。

触发事件：事件触发的基本功能就是去执行用户所绑定的事件，所以只用在事件触发时去检查有没有指定的执行函数，如果有则调用即可。

取消绑定事件：事件取消中需要做的就是已经绑定的事件处理函数移除掉即可。


仅触发一次的事件：它所绑定的事件仅会执行一次，此方法在一些特定情况下非常有用，不需要用户手动取消绑定这个事件。

基于以上事件的分析，SDK中集成了一套自定义事件封装，提供了几个api


**PCSDK.event.add(evt: string, handler: Function, context: any)：**

定义：绑定事件，第一个参数为事件的类型，第二个参数是事件处理函数，第三个参数为事件处理函数的执行上下文环境

**请求示例：**

```
private addEvent(){
    super.addEvent();
    PCSDK.event.add('update.money', this.handleUpdateMoney, this);
}

private handleUpdateMoney (money){
    console.error(money);
}
```


**PCSDK.event.remove(evt: string, handler: Function, context: any)：**

定义：移除绑定类型的事件，

**请求示例：**

```
private removeEvent(){
    super.removeEvent();
    PCSDK.event.remove('share.aysnc.gold', this.handleUpdateMoney, this);
}
```


**PCSDK.event.once(evt: string, handler: Function, context: any)：**

定义：绑定一次性事件，触发后自动移除这个绑定事件，参数同上

**请求示例：**

```
private constructor(){
    PCSDK.event.once('share.aysnc.gold', this.handleShareAsyncGold, this);
}

private handleShareAsyncGold (){
    ...
}
```


**PCSDK.event.emit(evt: string, ...args: any[])：**

定义：触发事件，第一关参数事件类型，后面的参数执行事件处理函数传递的参数

```
private onAddMoney(){
    PCSDK.event.emit('update.money', 1000);
}
```


**PCSDK.event.removeAll(evt: string)：**

定义：移除所有evt类型事件

#### SDK内置了两个小游戏生命周期事件。小游戏onShow事件：app.show，事件处理函数接收小游戏onShow所获取得到的参数；小游戏onHide事件：app.hide，可供在游戏端监听使用

**请求示例1：**

```
private addEvent(){
    super.addEvent();
    PCSDK.event.add('app.show', this.onShow, this);
    PCSDK.event.add('app.hide', this.onHide, this);
}

private removeEvent(){
    super.removeEvent();
    PCSDK.event.remove('app.show', this.onShow, this);
    PCSDK.event.remove('app.hide', this.onHide, this);
}

private onShow(opts) {
    let { user_invite_uid } = opts.query;
}

private onHide(){

}
```



## 平台操作: platform模块

### 授权按钮

 **简介：**

微信的信息授权按钮，显示在所有ui的最上层，如果一个页面多个地方使用的话，切换场景后，或者打开弹出框，需要对这些授权按钮进行管理:

a、打开其他场景或者弹出框隐藏之前的授权按钮

b、关闭新打开的场景弹出框显示之前的授权按钮

c、授权成功后，销毁所有授权按钮


**PCSDK.platform.createUserBtn(
        type: string,
        params: Array<_UserInfoButtonObject> | _UserInfoButtonObject,
        opts: { isDebug?: boolean; callback: (status: number, ret: _getUserInfoSuccessObject | null) => void; context: any }
    ): void：**

定义：创建用户授权信息按钮。该方法接收3个参数，第一个参数type为信息按钮分类（可按照界面来划分）；第二个参数params为按钮的位置样式（参照微信createUserInfoButton api的参数），可以传递多个按钮的位置样式；第三个参数是一个对象，isDebug可选择传递，true表示debug状态，按钮显示黑色样式，方便调试，callback监听按钮的操作回调，callback回传两个参数，一个是status：1（授权成功） 0（授权失败）  -1（取消授权）取消授权会弹出是否调整到设置界面设置，另外一个是授权返回信息，当status状态为1的时候返回wx.getUserInfo返回的数据信息，status为0或者-1返回null

_UserInfoButtonObject、_getUserInfoSuccessObject 请在sdk.d.ts参考声明定义

**请求示例1：**

```
PCSDK.platform.createUserBtn('homePage',
    {
        type: 'image',
        image: 'https://caveman-test-resource.hortorgames.com/resource/btn_enter.png',
        style: { left:xxx ......}
    },
    {
        isDebug: true,
        callback: (status: number, ret) => {
            console.error('ret', status, ret);
            // 进行授权统计打点
            status === 1 && ret && ret.userInfo && Analytics.I.agreeAuth(DataManager.I.UserModel.UserCurrLevel, ret.userInfo);
        },
        context: this
    });
```



**请求示例2：**

```
PCSDK.platform.createUserBtn('homePage',
    [
        {
            type: 'image',
            image: 'https://caveman-test-resource.hortorgames.com/resource/btn_enter.png',
            style: { left:xxx ......}
        },
        {
            type: 'text',
            style: { left:xxx ......}
        }
    ],
    {
        isDebug: true,
        callback: (status: number, ret) => {
            console.error('ret', status, ret);
            // 进行授权统计打点
            status && ret && ret.userInfo && Analytics.I.agreeAuth(DataManager.I.UserModel.UserCurrLevel, ret.userInfo);
        },
        context: this
    });
```



**PCSDK.platform.showUserBtn(type: string): void：**

定义：根据类型显示用户授权信息按钮。该方法接收1个参数，用户信息按钮分类类型，显示多个信息按钮管理


**请求示例：**

```
protected onOpen() {
    super.onOpen();
    PCSDK.platform.showUserBtn('homePage');
}
```



**PCSDK.platform.hideUserBtn(type: string): void：**

定义：根据类型隐藏用户授权信息按钮。该方法接收1个参数，用户信息按钮分类类型，隐藏多个信息按钮管理


**请求示例：**

```
protected onClose() {
    super.onClose();
    PCSDK.platform.hideUserBtn('homePage');
}
```


**PCSDK.platform.destoryUserBtn(type: string): void：**

定义：根据类型销毁对应类型用户授权信息按钮。该方法接收1个参数，用户信息按钮分类类型，销毁多个信息按钮管理



**PCSDK.platform.destoryAllUserBtn(): void：**

定义：销毁所有的授权信息按钮

#### 以上两个api可不手动调用，SDK已经在授权成功回调监听里面自动调用了destoryAllUserBtn 销毁所有的授权信息按钮功能

