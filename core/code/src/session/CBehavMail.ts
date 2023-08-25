namespace ClientCore {
    export class CBehavMail extends Share.CUnitBehavior {

        private m_oBehavSession: CBehavSession;

        constructor(oUnit) {
            super(oUnit);
        }

        protected _awake() {
            this.m_oBehavSession = this.getComponent(CBehavSession);
        }

        modifyMail(id:string, status:number){
            let oRpcArg = new Share.CModifyMailArg();
            oRpcArg.val.data = {
                id:id,
                status:status,
            };
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }
    }
}