namespace ClientCore {
    export class CBehavReborn extends Share.CUnitBehavior {

        private m_oBehavSession: CBehavSession;

        constructor(oUnit) {
            super(oUnit);
        }

        protected _awake() {
            this.m_oBehavSession = this.getComponent(CBehavSession);
        }

        reborn(): Promise<Share.IErrorMsg<Share.IRpcRebornRet>> {
            let oRpcArg = new Share.CProtocolArg<Share.IRpcRebornArg>(Share.EProtocolType.Reborn);
            oRpcArg.data = {
            };
            return this.m_oBehavSession.callRpc(oRpcArg).then((data: Share.IErrorMsg<Share.IRpcRebornRet>) => {
                if (data.errno == Share.EErrorNo.Success)
                    return Promise.reject(null);
                return Promise.reject(data);
            }).catch((error) => {
                if (error == null) {
                    return Share.CSingleton(Share.CErrorMsgHelper).successMsg({});
                }
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }
    }
}