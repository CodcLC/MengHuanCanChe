# 发布说明 
### 切换分支
```
git checkout dev_1.0  // 线上版本
```
### *打包前确定* 

发布新版本需要修改三个地方
1. EnumConst.ts   config.version  
    ``` 
    export let Config = {
        ...
        version :"2.0"
        ...
    }
    ```
2. cocos 构建    远程服务器地址
   ```比如： https://g.bitgame-inc.com/static/ct/2.0  ```
3. 远程服务器新建一个版本目录 
    ```
        创建目录 ：www/static/ct/2.0
    ```
    

##### 修改EnumConst.ts 如果需要
```
export let Config = {
    remote_url :'https://g.bitgame-inc.com/static/ct/',  //服务器根目录 
    config_path:"/configs/",        //配置文件目录 
    csv_path:"/configs/csv/",   //csv文件目录 
    share_cfg_filename:"share_config.json", //分享配置
    version_file_path:"/version.txt",  // Corejs版本文件配置
    version : "1.0",   //当前版本
    release: false,   // 是否发布版
    version_dc: 1,   //UserInfo  版本
    //所有csv 文件 
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
        "Tips"
    ]
}
```
##### *cocos creator 构建发布*
**远程服务器地址**
```
体验版本：
    https://g.bitgame-inc.com/static/ct/${版本号}
    appid:wx8f744184e2fe795c
正式版本：
    https://pub.bitgame-inc.com/static/ct/${版本号}
    appid:wx075ef5278da53be9
```

##### 服务器拷贝相关文件
1. 打包完成后
2.  执行
    ``` npm run tiny-png //压缩编译后的png```
3. 复制相关资源到服务器目录 
    - **资源目录**：*copy* build/wechatgame/res -> /res
    - **csv文件配置** *copy* assets/resources/Config/csv -> /configs/csv
    - **分享配置**：/configs/share_config.json
    - **Corejs版本文件配置** /version.txt 

###### 删除 res 目录 
###### 打开开发者工具上传代码 
