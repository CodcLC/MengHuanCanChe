const {ccclass, property} = cc._decorator;

enum Style{
    Make = 0,
    Burnt = 1,
}

@ccclass
export default class ProgressTimer extends cc.Component {

    style:Style = Style.Make;
    @property([cc.SpriteFrame])
    bgs:cc.SpriteFrame[] = []

    @property([cc.SpriteFrame])
    tops:cc.SpriteFrame[] = []

    sprite:cc.Sprite = null;

    bgSprite:cc.Sprite = null;
    

    onLoad () {
        this.bgSprite = this.getComponent(cc.Sprite);
        this.sprite = this.getComponentInChildren(cc.Sprite);
    }

    start () {

    }

    setStyle(style)
    {
        this.style = style;
        this.bgSprite.spriteFrame = this.bgs[style];
        this.sprite.spriteFrame = this.tops[style]
    }

    set percent(v:number)
    {
        this.sprite.fillRange = -v;
    }


}