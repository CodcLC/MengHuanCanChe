namespace ClientCore {
    export class CBehavOffline extends Share.CUnitBehavior {

        private m_oBehavSession: CBehavSession;
        private m_oBehavProperty: Share.CBehavProperty;
        private m_oBehavPropertyCalc: Share.CBehavPropertyCalc;

        constructor(oUnit) {
            super(oUnit);
        }

        protected _awake() {
            this.m_oBehavSession = this.getComponent(CBehavSession);
            this.m_oBehavProperty = this.getComponent(Share.CBehavProperty);
            this.m_oBehavPropertyCalc = this.getComponent(Share.CBehavPropertyCalc);
        }

        claim(bDouble: boolean): Promise<Share.IErrorMsg<Share.IRpcClaimOfflineRewardRet>> {
            let oRpcArg = new Share.CProtocolArg<Share.IRpcClaimOfflineRewardArg>(Share.EProtocolType.ClaimOfflineReward);
            oRpcArg.data = {
                bDouble: bDouble
            };
            return this.m_oBehavSession.callRpc(oRpcArg).then((data: Share.IErrorMsg<Share.IRpcClaimOfflineRewardRet>) => {
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

        getOfflineReward():number{
            let nOfflineSeconds = <number>this.m_oBehavProperty.get(Share.EPropertyContainerType.Property, Share.EPropertyType[Share.EPropertyType.OfflineSeconds]);
            return this.m_oBehavPropertyCalc.getOfflineCoinPerSecond() * nOfflineSeconds;
        }
    }
}