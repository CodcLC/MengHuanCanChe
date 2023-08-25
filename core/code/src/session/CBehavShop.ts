namespace ClientCore {
    export class CBehavShop extends Share.CUnitBehavior {

        private m_oBehavSession: CBehavSession;

        constructor(oUnit) {
            super(oUnit);
        }

        protected _awake() {
            this.m_oBehavSession = this.getComponent(CBehavSession);
        }

        buy(nShopID: number, nGoodsID: number, nCount: number = 1): Promise<Share.IErrorMsg<Share.IRpcBuyRet>> {
            let oRpcArg = new Share.CProtocolArg<Share.IRpcBuyArg>(Share.EProtocolType.Buy);
            oRpcArg.data = {
                shopID: nShopID,
                goodsID: nGoodsID,
                count:nCount
            };
            return this.m_oBehavSession.callRpc(oRpcArg).then((data: Share.IErrorMsg<Share.IRpcBuyRet>) => {
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