import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import { UserInfo } from "../Common/UserInfo";
import View from "../../../framework/plugin_boosts/ui/View";

const { ccclass, property } = cc._decorator;

//UIInputDialog.finished
@ccclass
export default class UIInput extends cc.Component {

    @property(cc.Node)
    node_btn_close: cc.Node = null;

    @property(cc.Node)
    node_btn_wx:cc.Node = null;

    onLoad() { }
    start() { }

    buffer: string = ""

    @property(cc.EditBox)
    editbox:cc.EditBox = null;

    onShown() {
        this.node_btn_close.active = false;
        // UserInfo.userId
        this.editbox.string = UserInfo.userId
        this.buffer = this.editbox.string
        this.check(this.editbox.string)

        if(cc.sys.platform == cc.sys.WECHAT_GAME)
        {
            this.node_btn_wx.active = true;
        }else{
            this.node_btn_wx.active = false;
        }
    }

    endFinish(editbox: cc.EditBox) {
        this.buffer = editbox.string;
        this.check(this.buffer)
        if(this.node_btn_close.active)
        {
            this.getComponent(View).hide();
        }
    }

    check(s)
    {
        if (isEmpty(s)) {
            this.node_btn_close.active = false
        } else {
            this.node_btn_close.active = true
        }
    }

    onEditing(s) {
        this.buffer = s;
        this.check(s);
    }

    click_wxlogin()
    {
        this.buffer = '0';
        this.getComponent(View).hide();
    }

    onHidden() {
        event.emit("UIInput.finished", this.buffer)
    }

}