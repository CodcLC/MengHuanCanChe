namespace ClientCore {
    export class CBehavClientCore extends Share.CUnitBehavior {
        private m_bUseHttps: boolean;
        private m_strGameServer: string;
        private m_strHttpServer: string;

        get UseHttps(){
            return this.m_bUseHttps;
        }

        get GameServer(){
            return this.m_strGameServer;
        }

        get HttpServer(){
            return this.m_strHttpServer;
        }

        constructor(oUnit) {
            super(oUnit);
        }

        protected _awake() {
        }

        public Init(): Promise<boolean> {
            return Promise.resolve(true);
        }

        public Load(oArg: { gameServer: string, httpServer:string, clientTable: Share.CAllClientTable, useHttps: boolean }): Promise<boolean> {
            this.m_bUseHttps = oArg.useHttps;
            this.m_strGameServer = (this.m_bUseHttps ? "wss:" : "ws:") + oArg.gameServer;
            this.m_strHttpServer = (this.m_bUseHttps ? "https:" : "http:") + oArg.httpServer;
            Share.CSingleton(Share.CGlobalConfigMgr).init(oArg.clientTable.m_oGlobalConfigMgr);
            Share.CSingleton(Share.CShareSwitchMgr).init(oArg.clientTable.m_oShareSwitchMgr);
            Share.CSingleton(Share.CFarmLandAttrMgr).init(oArg.clientTable.m_oFramLandAttrMgr);
            Share.CSingleton(Share.CCropAttrMgr).init(oArg.clientTable.m_oCropAttrMgr);
            Share.CSingleton(Share.CUnitAttrMgr).init(oArg.clientTable.m_oUnitAttrMgr);
            Share.CSingleton(Share.CTechAttrMgr).init(oArg.clientTable.m_oTechAttrMgr);
            Share.CSingleton(Share.CInviteAttrMgr).init(oArg.clientTable.m_oInviteAttrMgr);
            Share.CSingleton(Share.CFarmSkinAttrMgr).init(oArg.clientTable.m_oFarmSkinAttrMgr);
            Share.CSingleton(Share.CFarmAttrMgr).init(oArg.clientTable.m_oFarmAttrMgr);
            Share.CSingleton(Share.CGemItemAttrMgr).init(oArg.clientTable.m_oGemItemAttrMgr);
            Share.CSingleton(Share.CUnlockAttrMgr).init(oArg.clientTable.m_oUnlockAttrMgr);
            Share.CSingleton(Share.CWheelAttrMgr).init(oArg.clientTable.m_oWheelAttrMgr);
            Share.CSingleton(Share.CSevenDaysAttrMgr).init(oArg.clientTable.m_oSevenDaysAttrMgr);
            Share.CSingleton(Share.CInviteClientAttrMgr).init(oArg.clientTable.m_oInviteClintAttrMgr);
            Share.CSingleton(Share.CAutoRewardAttrMgr).init(oArg.clientTable.m_oAutoRewardAttrMgr);
            Share.CSingleton(Share.CJobAttrMgr).init(oArg.clientTable.m_oJobAttrMgr);
            Share.CSingleton(Share.CFarmerAttrMgr).init(oArg.clientTable.m_oFarmerAttrMgr);
            Share.CSingleton(Share.CGuideTaskAttrMgr).init(oArg.clientTable.m_oGuideTaskAttrMgr);
            Share.CSingleton(Share.CDialogueAttrMgr).init(oArg.clientTable.m_oDialogueAttrMgr);
            Share.CSingleton(Share.CTreasureFirstAttrMgr).init(oArg.clientTable.m_oTreasureFirstAttrMgr);
            Share.CSingleton(Share.CTreasureSecondAttrMgr).init(oArg.clientTable.m_oTreasureSecondAttrMgr);
            Share.CSingleton(Share.CBubbleFirstAttrMgr).init(oArg.clientTable.m_oBubbleFirstAttrMgr);
            Share.CSingleton(Share.CBubbleSecondAttrMgr).init(oArg.clientTable.m_oBubbleSecondAttrMgr);
            Share.CSingleton(Share.CProvinceAttrMgr).init(oArg.clientTable.m_oProvinceAttrMgr);
            return Promise.resolve(true);
        }

        public CreateAccountSession(){
            let oUnitClientSession = new CUnitClientSession(this);
            return oUnitClientSession.BehavInterface;
        }

        public DestroyClientSession(oAccount: CBehavAccount){
            oAccount.destroy();
        }
    }
}