const {ccclass, property} = cc._decorator;

export let R:GameRes = null;
@ccclass
export default class GameRes extends cc.Component {
    /**
     * 升级 按钮
     */
    @property(cc.Prefab)
    prefab_upgradeButton:cc.Prefab = null;

    @property({type: cc.AudioClip})
    audio_cooking:cc.Prefab = null;

    @property({type: cc.AudioClip})
    audio_cooking2:cc.Prefab = null;

    @property({type: cc.AudioClip})
    audio_drink_fill:cc.Prefab = null;

    @property(cc.Prefab)
    prefab_cooking:cc.Prefab = null;

    @property(cc.Prefab)
    prefab_burnt:cc.Prefab = null;

    @property(cc.Prefab)
    prefab_topUI:cc.Prefab = null;

    @property(cc.Prefab)
    prefab_cake:cc.Prefab = null;

    @property([cc.Prefab])
    prefab_npc:cc.Prefab[] = [];


    onLoad () {
        R = this;
    }
    start () {}
}