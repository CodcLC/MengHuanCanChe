namespace ClientCore {
    export class CBehavClientSessionInterface extends Share.CUnitBehavior {
        private m_oBehavSession: CBehavSession;
        private m_oBehavPlayer: CBehavPlayer;
        private m_oBehavAccount: CBehavAccount;
        private m_oBehavPlayerList: CBehavPlayerList;
        private m_oBehavWorldGate: CBehavWorldGate;
        private m_oBehavSceneCtrl: Share.CBehavSceneCtrl;
        private m_oBehavProperty: Share.CBehavProperty;
        private m_onGemChanged = new Share.CDelegate<(nPrevValue: number, nNextValue: number) => void>();
        private m_onCoinChanged = new Share.CDelegate<(nPrevValue: number, nNextValue: number) => void>();
        private m_onLevelChanged = new Share.CDelegate <(nPrevValue: number, nNextValue: number) => void>();
        private m_onExpChanged = new Share.CDelegate<(nPrevValue: number, nNextValue: number) => void>();
        private m_oBehavReborn:CBehavReborn;
        private m_oBehavUpgrade:CBehavUpgrade;
        private m_oBehavShop:CBehavShop;
        private m_oBehavPropertyCalc: Share.CBehavPropertyCalc;
        private m_oBehavOffline: ClientCore.CBehavOffline;
        private m_oBehavFriend: ClientCore.CBehavFriend;
        private m_oBehavMail: ClientCore.CBehavMail;

        public constructor(s: Share.CUnit) {
            super(s);
        }

        protected _awake() {
            this.m_oBehavSession = this.getComponent(CBehavSession);
            this.m_oBehavPlayer = this.getComponent(CBehavPlayer);
            this.m_oBehavAccount = this.getComponent(CBehavAccount);
            this.m_oBehavPlayerList = this.getComponent(CBehavPlayerList);
            this.m_oBehavWorldGate = this.getComponent(CBehavWorldGate);
            this.m_oBehavSceneCtrl = this.getComponent(Share.CBehavSceneCtrl);
            this.m_oBehavProperty = this.getComponent(Share.CBehavProperty);
            this.m_oBehavReborn = this.getComponent(CBehavReborn);
            this.m_oBehavUpgrade = this.getComponent(CBehavUpgrade);
            this.m_oBehavShop = this.getComponent(CBehavShop);
            this.m_oBehavPropertyCalc = this.getComponent(Share.CBehavPropertyCalc);
            this.m_oBehavOffline = this.getComponent(ClientCore.CBehavOffline);
            this.m_oBehavFriend = this.getComponent(ClientCore.CBehavFriend);
            this.m_oBehavMail = this.getComponent(ClientCore.CBehavMail);
            this.m_oBehavProperty.OnPropertyChanged.add((eType, name, prevValue, nextValue) => {
                if (eType === Share.EPropertyContainerType.Property) {
                    switch (name) {
                        case Share.EPropertyType[Share.EPropertyType.Gem]:
                            this.m_onGemChanged.invoke(prevValue, nextValue);
                            break;
                        case Share.EPropertyType[Share.EPropertyType.Coin]:
                            this.m_onCoinChanged.invoke(prevValue, nextValue);
                            break;
                        case Share.EPropertyType[Share.EPropertyType.Level]:
                            this.m_onLevelChanged.invoke(prevValue, nextValue);
                            break;
                        case Share.EPropertyType[Share.EPropertyType.Exp]:
                            this.m_onExpChanged.invoke(prevValue, nextValue);
                            break;
                    }
                }
            });
        }

        get BehavSession(){
            return this.m_oBehavSession;
        }

        get BehavPropertyCalc(){
            return this.m_oBehavPropertyCalc;
        }

        get BehavProperty(){
            return this.m_oBehavProperty;
        }

        get OnGemChanged() {
            return this.m_onGemChanged;
        }

        get OnCoinChanged(){
            return this.m_onCoinChanged;
        }

        get OnLevelChanged(){
            return this.m_onLevelChanged;
        }

        get OnExpChanged(){
            return this.m_onExpChanged;
        }

        public get AccountInfo() {
            return this.m_oBehavAccount.AccountInfo;
        }

        public get PlayerInfo() {
            return this.m_oBehavPlayer.PlayerInfo;
        }

        get Scene() {
            return this.m_oBehavSceneCtrl.Scene;
        }

        get OnBeforeSwitchScene() {
            return this.m_oBehavSceneCtrl.OnBeforeSwitchScene;
        }

        get OnAfterSwitchScene() {
            return this.m_oBehavSceneCtrl.OnAfterSwitchScene;
        }

        get HasMercenary2() {
            return this.m_oBehavPlayer.PlayerInfo.Mercenary2EndTimestamp > (Date.now() / 1000) >>> 0;
        }

        wxLogin(code:string):Promise<Share.IErrorMsg<Share.IWxLoginRet>>{
            let oRpcArg = new Share.CWxLoginArg();
            oRpcArg.val.data = {code:code};
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }

        login(oArg: Share.ILoginArg): Promise<Share.IErrorMsg<any>> {
            return this.m_oBehavSession.login(oArg);
        }

        logout(): Promise<Share.IErrorMsg<any>> {
            return this.m_oBehavSession.logout();
        }

        setGuaJiTimescale(value: number) {
            this.m_oBehavSceneCtrl.Scene.BehavTimerMgr.TimerMgr.TimeScale = value;
        }

        createPlayer(strPlayerName: string): Promise<Share.IErrorMsg<any>> {
            return this.m_oBehavPlayerList.createPlayer(strPlayerName);
        }

        enterWorld(nPlayerIndex: number, strInviterUID: string, strInviterAct:string="", shareType:number=-1): Promise<Share.IErrorMsg<any>> {
            return this.m_oBehavWorldGate.enterWorld(nPlayerIndex, strInviterUID, strInviterAct, shareType);
        }

        leaveWorld(): Promise<Share.IErrorMsg<any>> {
            return this.m_oBehavWorldGate.leaveWorld();
        }

        save(oPlayerInfo:Share.IPlayerInfo){
            return this.m_oBehavPlayer.save(oPlayerInfo);
        }

        saveUserData(oPlayerInfo:Share.IPlayerInfo){
            return this.m_oBehavPlayer.saveUserData(oPlayerInfo);
        }

        startRain(){
            return this.m_oBehavPlayer.startRain();
        }

        openTractor(){
            return this.m_oBehavPlayer.openTractor();
        }

        gotoMarket(){
            return this.m_oBehavPlayer.gotoMarket();
        }

        reborn(){
            return this.m_oBehavReborn.reborn();
        }

        upgradeProperty(nPropertyID: Share.EPropertyType, nTimes: number = 1){
            return this.m_oBehavUpgrade.upgradeProperty(nPropertyID, nTimes);
        }

        buy(nShopID: number, nGoodsID: number, nCount: number = 1){
            return this.m_oBehavShop.buy(nShopID, nGoodsID, nCount);
        }

        claimOfflineReward(bDouble: boolean){
            return this.m_oBehavOffline.claim(bDouble);
        }

        getOfflineReward(){
            return this.m_oBehavOffline.getOfflineReward();
        }

        claimInviteReward(nInviteAttrID: number){
            return this.m_oBehavFriend.claimInviteReward(nInviteAttrID);
        }

        getInvitees(){
            return this.m_oBehavFriend.getInvitees();
        }

        getInviteesByShareType(shareType:Share.EShareType, startTime:number, endTime:number){
            return this.m_oBehavFriend.getInviteesByShareType(shareType, startTime, endTime);
        }

        reqAddFriend(playerAct:string){
            return this.m_oBehavFriend.reqAddFriend(playerAct);
        }

        addFriend(playerAct:string){
            return this.m_oBehavFriend.addFriend(playerAct);
        }

        ignoreFriendRequest(playerAct:string){
            return this.m_oBehavFriend.ignoreFriendRequest(playerAct);
        }

        dali(playerAct:string){
            return this.m_oBehavFriend.dali(playerAct);
        }

        daoluan(playerAct:string){
            return this.m_oBehavFriend.daoluan(playerAct);
        }

        fire(playerAct:string){
            return this.m_oBehavFriend.fire(playerAct);
        }

        modifyMail(id:string, status:number){
            return this.m_oBehavMail.modifyMail(id, status);
        }

        queryPlayer(playerAct:string): Promise<Share.IErrorMsg<Share.IQueryPlayerRet>> {
            let oRpcArg = new Share.CQueryPlayerArg();
            oRpcArg.val.data = {accountName:playerAct};
            return this.m_oBehavSession.callRpc(oRpcArg.val)/**.then((data: Share.IErrorMsg<Share.IRpcGetInviteesRet>) => {
                // if (data.errno == Share.EErrorNo.Success) {
                //     return data;
                // }
                return data;
            })*/
        }

        queryUserData(playerAct:string):Promise<Share.IErrorMsg<Share.IQueryUserDataRet>>{
            let oRpcArg = new Share.CQueryUserDataArg();
            oRpcArg.val.data = {ActName:playerAct};
            return this.m_oBehavSession.callRpc(oRpcArg.val)
        }

        getRandomUser():Promise<Share.IErrorMsg<Share.IQueryUserDataRet>>{
            let oRpcArg = new Share.CGetRandomUserArg();
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }

        getTick():Promise<Share.IErrorMsg<Share.IRpcGetTickRet>>{
            let oRpcArg = new Share.CGetTickArg();
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }
    }
}