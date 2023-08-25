namespace ClientCore {
    export class CBehavPlayerList extends Share.CUnitBehavior {
        private m_oBehavAccount: CBehavAccount;
        private m_oBehavSession: CBehavSession;

        public constructor(s: Share.CUnit) {
            super(s);
        }

        protected _awake() {
            this.m_oBehavSession = this.getComponent(CBehavSession);
            this.m_oBehavAccount = this.getComponent(CBehavAccount);
        }

        public get BehavSession() {
            return this.m_oBehavSession;
        }

        public getPlayerList():string[]{
            if(this.m_oBehavAccount.AccountInfo== null)
                return null;
            return this.m_oBehavAccount.AccountInfo.playerUIDs;
        }

        public getPlayerCount():number{
            if (this.m_oBehavAccount.AccountInfo == null || this.m_oBehavAccount.AccountInfo.playerUIDs == null)
                return 0;
            let nCount = 0;
            let arr = this.m_oBehavAccount.AccountInfo.playerUIDs;
            for(let i = 0; i != arr.length; ++i){
                if(arr[i])
                    nCount++;
            }
            return nCount;
        }

        createPlayer(strPlayerName?:string):Promise<Share.IErrorMsg<any>>{
            let oRpcArg = new Share.CProtocolArg<Share.IRpcCreatePlayerArg>(Share.EProtocolType.CreatePlayer);
            oRpcArg.data = {
                playerName: strPlayerName
            };
            return this.m_oBehavSession.callRpc(oRpcArg).then((data: Share.IErrorMsg<Share.IRpcCreatePlayerRet>)=>{
                if(data.errno == Share.EErrorNo.Success){
                    this.m_oBehavAccount.AccountInfo.playerUIDs[data.ext.index] = data.ext.playerUID;
                }
                return Promise.reject(data);
            }).catch((error)=>{
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }
    }
}