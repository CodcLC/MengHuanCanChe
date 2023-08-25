import { root } from "./GameRoot";
import FSM from "../../../framework/plugin_boosts/components/FSM";
import { FoodType } from "../Common/CSVEnum";
import { event } from "../../../framework/plugin_boosts/utils/EventManager";
import Device from "../../../framework/plugin_boosts/misc/Device";
import { R } from "./GameRes";

const {ccclass, property} = cc._decorator;


export enum FoodState
{
    Fresh,
    Cooking, 
    Cooked , //做完未装盘
    Ready,// 装盘完成， 可以交付

    Burnt,//overcook
    Discard,// 丢弃
}

@ccclass
export default class Food extends cc.Component {

    cooking_time:number = 0;

    burnt_time:number  = 0;

    full_id:FoodType = 0;

    @property({type:cc.Enum(FoodType)})
    food_id:FoodType = 0;

    @property
    is_drink:boolean = false;

    @property(cc.SpriteFrame) 
    burntSpriteFrame:cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    cookedSpriteFrame:cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    uncookedSpriteFrame:cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    bottomSpriteFrame:cc.SpriteFrame = null;

    _mainFoodSprite:cc.Sprite = null;

    ingredients:number[] = []

    _fsm:FSM = null;

    food_warned = false;
    
    onLoad () {
        
    }

    get fsm(){
        if(!this._fsm){
            this._fsm = this.addComponent(FSM);
            this._fsm.init(this);
            this._fsm.addStates(FoodState);
            this._fsm.enterState(FoodState.Fresh)
        }
        return this._fsm;
    }

    get mainFoodSprite()
    {
        this._mainFoodSprite = this.getComponent(cc.Sprite)
        return this._mainFoodSprite
    }

    reset()
    {
        this.food_warned = false;
        this.fsm.resume();
        this.clearIngredients();
        this.mainFoodSprite.spriteFrame = this.uncookedSpriteFrame;
    }



//--------------------------------------states----------------------------------------//   
    onEnter_FreshState(state){}
    onExit_FreshState(state){}
    onUpdate_FreshState(state,dt:number){}
    
    onEnter_CookingState(state){
        this.mainFoodSprite.spriteFrame = this.uncookedSpriteFrame;
        state.audio = Device.playEffect(R.audio_cooking,true)
        this.node.emit("StartCooking");
    }
    onExit_CookingState(state){
        Device.stopEffect(state.audio);
        Device.playEffectURL("Audio/time")
    }
    onUpdate_CookingState(state,dt:number){
        let percent = Math.min(1,this.fsm.timeElapsed/ this.cooking_time)
        this.node.emit("Cooking",percent);
        if(this.fsm.timeElapsed > this.cooking_time){
            if(this.burnt_time <= 0)
            {
                this.fsm.changeState(FoodState.Ready);
            }else{
                this.fsm.changeState(FoodState.Cooked);
            }
            event.emit("Cooked",this);
        }
    }

    onEnter_CookedState(state){

        this.node.emit("Cooked",this);
        
        state.audio = Device.playEffect(R.audio_cooking2,true)
        this.mainFoodSprite.spriteFrame = this.cookedSpriteFrame;
        // state.cookingAudio = Device.playEffectURL()
    }


    onExit_CookedState(state){
        Device.stopEffect(state.audio);
    }
    
    onUpdate_CookedState(state,dt:number){
        let percent = Math.min(1,this.fsm.timeElapsed/ this.burnt_time)
        this.node.emit("Burning",percent);
        if(this.fsm.timeElapsed > this.burnt_time)
        {
            this.fsm.changeState(FoodState.Burnt);
        }
        if(!this.food_warned && this.fsm.timeElapsed > this.burnt_time - 3)
        {
            this.food_warned = true;
            Device.vibrate();
        }
    }

    
    onEnter_ReadyState(state){
        this.node.emit("Ready",this);
        this.mainFoodSprite.spriteFrame = this.cookedSpriteFrame;
    }
    onExit_ReadyState(state){}
    onUpdate_ReadyState(state,dt:number){}
    
    onEnter_BurntState(state){
        this.node.emit("Burnt",this);
        event.emit("Burnt", this);
        this.mainFoodSprite.spriteFrame = this.burntSpriteFrame;

    }
    onExit_BurntState(state){
        this.node.emit("BurntExit",this);
    }
    onUpdate_BurntState(state,dt:number){}
    
    
    onEnter_DiscardState(state){}
    onExit_DiscardState(state){}
    onUpdate_DiscardState(state,dt:number){}
    //--------------------------------------states end----------------------------------------//
    
    startCook(cooking_time,burnt_time)
    {
        this.cooking_time = cooking_time;
        this.burnt_time = burnt_time;
        this.fsm.changeState(FoodState.Cooking);
        this.updateAvatar();
    }

    //丢
    discard()
    {
        this.fsm.changeState(FoodState.Discard);
    }

    // a : 1 -2 -4
    // b : 1- 3 -5
    // add ingredient  changes food id 
    mix(id)
    {
        let can = root.canMix(this.food_id,this.ingredients,id);
        if(can){
            this.ingredients.push(id);
            // update avatar by food_cfg 
            this.updateAvatar();
            // sort 
            this.ingredients.sort((a,b)=>a-b)
            this.node.emit("onChanged" , this);
        }
        return can;
    }

    clearIngredients()
    {
        this.ingredients.splice(0);
    }

    addIngredients(ingreds:number[])
    {
        this.ingredients.push(...ingreds);
    }

    addIngredient(ing:number)
    {
        if(!this.ingredients.some(v=>v==ing)){
            this.ingredients.push(ing);
            return true;
        }
        return false;
    }

    get has_bottom()
    {
        return this.bottomSpriteFrame!=null //this.node.children.some(v=>v.name == this.node.name);
    }

    updateBottomAvatar()
    {
        if(this.has_bottom){
            this.mainFoodSprite.spriteFrame = this.bottomSpriteFrame;
        }else{
            this.mainFoodSprite.spriteFrame = this.cookedSpriteFrame;
        }
    }

    makeCooked()
    {
        this.updateBottomAvatar()
        this.fsm.changeState(FoodState.Ready);
    }

    //更新状态 
    updateAvatar()
    {
        // let food_id = this.food_id;
        let food_id_name = this.food_id.toString()
        if(! (this.fsm.isInState(FoodState.Ready) || this.fsm.isInState(FoodState.Cooked))){
            this.node.children.forEach(v=>v.active = false)
        }else{
            this.node.children.forEach(v=>{
                if(this.ingredients.some(x=> x.toString() == v.name ) || v.name == food_id_name){
                    v.active = true
                }else{
                    v.active = false;
                }
            })
            this.updateBottomAvatar()
        }
    }

    isSame(v:Food)
    {
        return this.food_id == v.food_id 
        && v.ingredients.length == this.ingredients.length 
        && v.ingredients.every((x,i)=>x == this.ingredients[i] )
    }

    // fresh cooking ready 

}