import PoolManager from "../../../framework/plugin_boosts/misc/PoolManager";
import Customer, { CustomerState } from "./Customer";
import { UserInfo } from "../Common/UserInfo";
import { root } from "./GameRoot";
import { MissionEndType } from "../Common/EnumConst";
import { R } from "./GameRes";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CustomerSpawner extends cc.Component {
    pool: PoolManager = null;

    interval: number = 0;

    customers: Customer[] = []

    spawnSpecial:boolean = false;

    onLoad() {
        this.pool = new PoolManager(this.node, this.onCreateObject, this);
        this.pool.onRecycleSignal.add(this.onRecycleObject, this);
        let level = UserInfo.playingLevel;
        let row = csv.MissionData.get(level)
        this.interval = row.Timemin / 1000;
    }

    recovery()
    {
        if(this.spawnSpecial)
        {
            this.spawnSpecial = false;
            this.spawn();
            this.unschedule(this.spawn);
            this.schedule(this.spawn, this.interval)
        }
    }

    onDestroy() {
        this.pool.clear();
    }

    start() {
        this.spawn();
    }

    onRecycleObject(v: cc.Node) {
        let customer = v.getComponent(Customer);
        this.customers.splice(this.customers.indexOf(customer), 1);
    }

    onCreateObject(v) {
        return cc.instantiate(v);
    }

    onEnable() {
        this.schedule(this.spawn, this.interval)
    }

    onDisable() {
        this.unschedule(this.spawn);
    }

    spawn() {
        if(this.spawnSpecial){
            if (root.numOfSpecialCustomer <= 0 ) {
                // let len = this.customers.reduce((sum, v) => {
                //     return sum + (v.is_special && (v.fsm.isInState(CustomerState.Waiting) || v.fsm.isInState(CustomerState.Arriving)) ? 1 : 0)
                // }, 0)
                // if (len > 0) {
                //     return;
                // }
                return;
            }
        }
        // if(!UserInfo.is_chanllenge3star)
        // {
        //顾客数量 不足
        if (root.missionEndType == MissionEndType.Customer) {
            let customerLength = this.customers.reduce((sum, v) => {
                return sum + ((v.fsm.isInState(CustomerState.Waiting) || v.fsm.isInState(CustomerState.Arriving)) ? 1 : 0)
            }, 0)
            if (root.topUI.customerLeft - customerLength <= 0)
                return;
        }
        // }
        let prefab = g.getRandomInArray(R.prefab_npc) as cc.Prefab;
        let node = this.pool.get(prefab)
        if(node){
            let customer = node.getOrAddComponent(Customer);
            this.customers.push(customer);
            node.position = cc.Vec2.ZERO;
            customer.startShopping();
            if (root.numOfSpecialCustomer-- > 0) {
                customer.is_special = true;
            } else {
                customer.is_special = false;
            }
        }
    }

}