namespace ClientCore {
    export class CUnitClientSession extends Share.CUnit {
        private m_oInterface: CBehavClientSessionInterface;

        public get BehavInterface() {
            return this.m_oInterface;
        }

        constructor(oClientCore: CBehavClientCore) {
            super([Share.CUBC(CBehavSession, oClientCore), Share.CUBC(CBehavAccount), Share.CUBC(CBehavPlayerList), Share.CUBC(CBehavPlayer), Share.CUBC(CBehavWorldGate), Share.CUBC(Share.CBehavSceneCtrl),
                Share.CUBC(Share.CBehavEffect), Share.CUBC(Share.CBehavProperty), Share.CUBC(Share.CBehavPropertyCalc),
                Share.CUBC(CBehavReborn), Share.CUBC(CBehavUpgrade), Share.CUBC(CBehavShop), 
                Share.CUBC(CBehavOffline), Share.CUBC(CBehavFriend), Share.CUBC(CBehavMail), Share.CUBC(CBehavClientSessionInterface)]);
            this.m_oInterface = this.getComponent(CBehavClientSessionInterface);
        }
    }
}