# todo list

- 游戏内音效
  - [x] 点击A -- 点击除了饮料杯子以外的东西
  - [x] 点击B -- 点击饮料杯子
  - [x] 需烹饪类食材，烹饪中
  - [x] 需烹饪类食材，熟了
  - [x] 饮料准备中
  - [x] 倒计时结束提示音
  - [x] 连击有5个槽（4种连击效果），对应5个完成音效
  - [x] 获得一个赞
- [x] 签到领取 / 通过观看视频、分享获得
- [x] 游戏烹饪特效，烤糊特效
- [x] 数据保存时间戳 ，比较先后顺序
- [x] 服务器时间同步
- [x] bug 连击x5 
- [x] 金币获取顺序问题 => A, B ,连击
- [ ] 打包脚本
- [ ] 获取某关卡是否解锁
- [ ] 角色动画 
## 未确定 问题：
1.  添加教学后，初始进入游戏，会有两次界面加载（ 主界面 + 关卡） 这块看如何处理 
  
## 已完成问题：
- 1-1 1-2 正常游戏  1-3 故意烤糊食物，目前无法触发烤糊教学 - 完成
- 1-1 成功完成三星后，还有面糊处于烹饪 yn状态，等待15秒过后，会出现烤糊教学实际上应该是弹出界面后，游戏所有内容应当暂停才对   -完成
- **教学中**，产生标记 的处理位置，需要进行调整
     调整到：该条教学触发（之前是完成），就给玩家添加标记  -完成

- **主界面** 以第一章举例，游戏的摄像机最左边，默认在了第二关，而不是整个地图的最左边     
- **游戏结算**
    点赞关卡的金币统计明显有错误
- **教学**
    教学中的文本，处理换行的时候，默认给个间隔 -行间距
- **关卡进度条**
    如 1-3 玩家需要完成 6 个食物，即可达到1星
    但玩家完成了1个食物，看起来只完成了 5%-10%
- **连击槽**
    我们目前 没有原作中的 五段连击槽  - 等美术资源统一处理
- **金币显示**
    关卡 1-14 开启自动上菜以后，很快就会导致金币显示消失 （ 100% 出现）
---

## 棘手bug:
- 偶先 BUG ： 频率有点高
    1. A.  面糊烤熟了之后，有顾客需求 面糊+枫糖
    点了枫糖（ 这时候显示还没变），然后再点 面糊
    就成功完成了顾客的需求
    整个过程中：完全看不到枫糖效果
    2.  某种特殊情况下，会导致所有的烹饪食物，烤好了但是显示的是 烤糊的资源
- 解决方案：
  - getFoodById 拿到后清楚所有食物上的数据 
  - 在上菜前，更新 外形


       

游戏当下内容明确
- [ ] 关卡数据采集