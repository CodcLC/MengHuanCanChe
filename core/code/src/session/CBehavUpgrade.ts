namespace ClientCore {
    export class CBehavUpgrade extends Share.CUnitBehavior {

        private m_oBehavSession: CBehavSession;

        constructor(oUnit) {
            super(oUnit);
        }

        protected _awake() {
            this.m_oBehavSession = this.getComponent(CBehavSession);
        }

        upgradeProperty(nPropertyID:Share.EPropertyType, nTimes:number = 1): Promise<Share.IErrorMsg<Share.IRpcUpgradePropertyRet>> {
            let oRpcArg = new Share.CProtocolArg<Share.IRpcUpgradePropertyArg>(Share.EProtocolType.UpgradeProperty);
            oRpcArg.data = {
                propertyID: nPropertyID,
                times: nTimes
            };
            return this.m_oBehavSession.callRpc(oRpcArg).then((data: Share.IErrorMsg<Share.IRpcUpgradePropertyRet>) => {
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