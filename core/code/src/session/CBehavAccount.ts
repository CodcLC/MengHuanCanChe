namespace ClientCore {
    export class CBehavAccount extends Share.CUnitBehavior {
        private m_oAccountInfo: Share.IAccountInfo;
        private m_oBehavSession: CBehavSession;
        private m_oBehavPlayer: CBehavPlayer;

        public constructor(s: Share.CUnit) {
            super(s);
        }

        protected _awake(){
            this.m_oBehavSession = this.getComponent(CBehavSession);
            this.m_oBehavPlayer = this.getComponent(CBehavPlayer);
        }

        get BehavPlayer(){
            return this.m_oBehavPlayer;
        }

        public get BehavSession(){
            return this.m_oBehavSession;
        }

        public get AccountInfo(){
            return this.m_oAccountInfo;
        }

        setAccountInfo(oAccountInfo: Share.IAccountInfo) {
            this.m_oAccountInfo = oAccountInfo;
        }

        getPlayerBriefInfo(nPlayerIndex: number): string {
            let oPlayer = this.m_oAccountInfo.playerUIDs[nPlayerIndex];
            return oPlayer;
        }
    }
}