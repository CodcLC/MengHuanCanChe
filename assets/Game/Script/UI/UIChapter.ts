import Common from "../../../framework/plugin_boosts/utils/Common";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import { UserInfo } from "../Common/UserInfo";
import Device from "../../../framework/plugin_boosts/misc/Device";
import { stat } from "fs";

const {ccclass, property} = cc._decorator;

interface ChapterItem{
    nameLabel?:cc.Label,
    starLabel?:cc.Label,
    btn:cc.Button,
    node:cc.Node
}

@ccclass
export default class UIChapter extends cc.Component {

    items:ChapterItem[] = []

    onLoad () {
        cc.find("MainBG",this.node).children.forEach(v=>{
            let item = {} as ChapterItem;
            item.node = v;
            item.btn = Common.newButton(v,"UIChapter","clickChapter",this.node)
            
            item.nameLabel = Common.find("NameBg/New Label",v,cc.Label);

            

            item.starLabel = Common.find("starP/starNum" , v,cc.Label)
            this.items.push(item);
        })

        csv.CantingData.values.forEach((v,i)=>{
            let t = csv.Text.get(v.ChapterName).text;
            let item = this.items[i];
            item.node.attr({chapter:v.ID})
            item.node.opacity = UserInfo.unlock_chapters[v.ID] ? 255:150;
            item.btn.interactable = UserInfo.unlock_chapters[v.ID];
            item.nameLabel.string = t;
        })
    }

    clickChapter(node)
    {
        event.emit("ChangeChapter",node.target.chapter)
    }

    start () {

    }

    onShown(){
        csv.CantingData.values.forEach((v,i)=>{
            let t = csv.Text.get(v.ChapterName).text;
            let item = this.items[i];
            item.node.attr({chapter:v.ID})
            item.node.opacity = UserInfo.unlock_chapters[v.ID] ? 255:100;
            item.btn.interactable = UserInfo.unlock_chapters[v.ID];
            item.nameLabel.string = t;

            if(UserInfo.unlock_chapters[v.ID]){
                let starNums = 0;
                for(let i = 0;i < v.Mission.length;i++){
                    starNums += UserInfo.getLevelData(v.Mission[i]).star || 0;
                }
                
                item.starLabel.string =  starNums + "/" + (v.Mission.length * 3);
                item.starLabel.node.x = 25;
            }else{
                item.starLabel.string =  "未解锁";
                item.starLabel.node.x = 10;
            }
            
        })
    }
}