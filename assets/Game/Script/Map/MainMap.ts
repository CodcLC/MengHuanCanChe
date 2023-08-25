import Entrance from "./Entrance";
import { UserInfo } from "../Common/UserInfo";
import ViewManager from "../../../framework/plugin_boosts/ui/ViewManager";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";

const {ccclass, property} = cc._decorator;


@ccclass
export default class MainMap extends cc.Component {

    @property([cc.SpriteFrame])
    entranceStarDisplays:cc.SpriteFrame[] = []

    public static instance:MainMap = null;

    @property(cc.Node)
    entranceRoot:cc.Node = null;

    @property(cc.Node)
    chapterNode:cc.Node = null;

    entrancies:Entrance[] = []

    @property(cc.Prefab)
    entrancePrefab:cc.Prefab=  null;

    @property
    chapter:number = 1;

    currentLevelNode:cc.Node = null;

    scrollview:cc.ScrollView = null;

    onLoad () {
        MainMap.instance = this;

        this.scrollview = this.getComponent(cc.ScrollView);

        
        this.loadEntrances();

        event.on("onRefreshMap",this.freshMap,this);
        event.on("MapLoaded", this.onMapLoaded,this);
    }

    onDestroy()
    {
        event.off(this);
    }

    freshMap(level:number){
        let isComplete = true;
        for(let i = 0;i < this.entrancies.length;i++){
            let level_data = UserInfo.getLevelData(this.entrancies[i].level);
            if(level_data.star == 0){
                isComplete = false;
            }
            if(level == null){
                this.entrancies[i].freshShow();
                continue;
            }
            if(this.entrancies[i].level == level){
                this.entrancies[i].freshShow();

                continue;
            }
        }
        
        
        this.chapterNode && (this.chapterNode.active = isComplete);

        
        
    }

    loadEntrances()
    {
        let data = csv.CantingData.get(this.chapter);
        
        var isComplete = true;
        let isFindFirst = false;
        this.currentLevelNode = this.entranceRoot.children[this.entranceRoot.children.length-1]
        this.entranceRoot.children.forEach((v,i)=>{
            let id = data.Mission[i]
            let entranceNode = cc.instantiate(this.entrancePrefab)
            v.removeComponent(cc.Sprite);
            entranceNode.parent = v;
            let entrance = entranceNode.getOrAddComponent(Entrance)
            entrance.level = id;
            entrance.levelNum = i + 1;
            entrance.isNew = false;
            let level_data = UserInfo.getLevelData(entrance.level);
            if(level_data.star == 0){
                isComplete = false;
                if(!isFindFirst){
                    isFindFirst = true;
                    entrance.isNew = true;
                    this.currentLevelNode = v;
                }
            }
            this.entrancies.push(entrance);
        })
        if(this.chapterNode)
        {
            this.chapterNode.active = isComplete;
        }
    }

    btnOnOpenChapter(){
        ViewManager.instance.show("UI/UIChapterSelector");
    }

    start () {
        UserInfo.chapter = this.chapter;
    }

    onMapLoaded()
    {
        this.scheduleOnce(()=>{
            this.scrollToCurrent();
        },0);
    }

    /**
     * 滚动到当前关卡位置
     */
    scrollToCurrent()
    {
        // this.currentLevelEntrance
        let x = this.currentLevelNode.x + this.entranceRoot.x;
        let p =  x / this.scrollview.content.width;
        if(p >0.7&& p<1.0 ) 
        {
            p = 1.0
        }
        if(p < 0.15 )
        {
            p = 0;
        }
        this.scrollview.scrollToPercentHorizontal(p,0.1);
    }   
}