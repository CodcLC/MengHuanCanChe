const {ccclass, property} = cc._decorator;

@ccclass
export default class PhaseBar extends cc.Component {


    @property(cc.SpriteFrame)
    normalFrame:cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    selectedFrame:cc.SpriteFrame = null;

    children:cc.Sprite[] = []

    onLoad () {
        this.children = this.node.children.map(v=>v.getComponent(cc.Sprite))
    }

    start () {

    }

    /**
     * @param v  1 ~ children.length
     */
    set progress(num:number)
    {
        this.children.forEach((v,i)=>{
            if(i +1 <= num)
            {
                v.spriteFrame = this.selectedFrame;
            }else{
                v.spriteFrame=  this.normalFrame;
            }
        })
    }
}