import { FoodType } from "../Common/CSVEnum";
import { root } from "./GameRoot";
import Plate from "./Plate";
import Common from "../../../framework/plugin_boosts/utils/Common";
import Device from "../../../framework/plugin_boosts/misc/Device";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Ingredient extends cc.Component {
    
    @property({type:cc.Enum(FoodType)})
    food_id:FoodType = 0;

    button:cc.Button = null;
    onLoad () {
        this.button = Common.newButton(this.node,"Ingredient","onClick");
    }

    onDestroy()
    {
    }
    
    onClick()
    {
        Device.playEffectURL("Audio/click_game")
        let plates = root.getList(Plate)
        plates.some(v=>{
            if(v.food )
            {
                // let food_id = v.food.food_id
                return  v.food.mix(this.food_id)
            }
            return false;
        })
    }


}