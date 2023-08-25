namespace ClientCore {
    export class CBehavFriend extends Share.CUnitBehavior {

        private m_oBehavSession: CBehavSession;

        constructor(oUnit) {
            super(oUnit);
        }

        protected _awake() {
            this.m_oBehavSession = this.getComponent(CBehavSession);
        }

        getInvitees(): Promise<Share.IErrorMsg<Share.IRpcGetInviteesRet>> {
            let oRpcArg = new Share.CGetInviteesArg();
            return this.m_oBehavSession.callRpc(oRpcArg.val)/**.then((data: Share.IErrorMsg<Share.IRpcGetInviteesRet>) => {
                // if (data.errno == Share.EErrorNo.Success) {
                //     return data;
                // }
                return data;
            })*/
        }

        getInviteesByShareType(shareType:Share.EShareType, startTime:number, endTime:number): Promise<Share.IErrorMsg<Share.IRpcGetInviteesByShareTypeRet>> {
            let oRpcArg = new Share.CGetInviteesByShareTypeArg();
            oRpcArg.val.data = {shareType:shareType, startTime:startTime, endTime:endTime};
            return this.m_oBehavSession.callRpc(oRpcArg.val)/**.then((data: Share.IErrorMsg<Share.IRpcGetInviteesRet>) => {
                // if (data.errno == Share.EErrorNo.Success) {
                //     return data;
                // }
                return data;
            })*/
        }

        claimInviteReward(nInviteAttrID: number): Promise<Share.IErrorMsg<Share.IRpcClaimInviteRewardRet>> {
            let oRpcArg = new Share.CClaimInviteRewardArg();
            oRpcArg.val.data = {
                inviteAttrId: nInviteAttrID
            };
            return this.m_oBehavSession.callRpc(oRpcArg.val).then((data: Share.IErrorMsg<Share.IRpcClaimInviteRewardRet>) => {
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

        reqAddFriend(playerAct:string){
            let oRpcArg = new Share.CFriendRequestArg();
            oRpcArg.val.data = {
                playerAct: playerAct
            };
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }

        addFriend(playerAct:string){
            let oRpcArg = new Share.CAddFriendArg();
            oRpcArg.val.data = {
                playerAct: playerAct
            };
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }

        ignoreFriendRequest(playerAct:string){
            let oRpcArg = new Share.CIgnoreFriendRequestArg();
            oRpcArg.val.data = {
                playerAct: playerAct
            };
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }

        dali(playerAct:string){
            let oRpcArg = new Share.CDaLiArg();
            oRpcArg.val.data = {
                playerAct: playerAct
            };
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }

        daoluan(playerAct:string){
            let oRpcArg = new Share.CDaoLuanArg();
            oRpcArg.val.data = {
                playerAct: playerAct
            };
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }

        fire(playerAct:string){
            let oRpcArg = new Share.CFireArg();
            oRpcArg.val.data = {
                playerAct: playerAct
            };
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }
    }
}