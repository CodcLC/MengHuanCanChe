namespace ClientCore {
    export class CBehavWorldGate extends Share.CUnitBehavior {
        private m_oBehavAccount: CBehavAccount;
        private m_oBehavPlayer: CBehavPlayer;
        private m_oBehavSession: CBehavSession;
        private m_oBehavSceneCtrl: Share.CBehavSceneCtrl;
        private m_nEnterWorldPlayerIndex:number;

        public constructor(s: Share.CUnit) {
            super(s);
        }

        protected _awake() {
            this.m_oBehavAccount = this.getComponent(CBehavAccount);
            this.m_oBehavPlayer = this.getComponent(CBehavPlayer);
            this.m_oBehavSession = this.getComponent(CBehavSession);
            this.m_oBehavSceneCtrl = this.getComponent(Share.CBehavSceneCtrl);
            this.m_oBehavSession.OnRelogin.add(this._onRelogin, this);
        }

        private _onRelogin(): Promise<Share.IErrorMsg<any>> {
            if(this.m_oBehavPlayer.PlayerInfo == null || this.m_nEnterWorldPlayerIndex == null)
                return Promise.resolve(Share.CSingleton(Share.CErrorMsgHelper).successMsg());
            return this.enterWorld(this.m_nEnterWorldPlayerIndex);
        }

        enterWorld(nPlayerIndex: number, strInviterUID: string="", strInviterAct:string="", shareType:number=-1):Promise<Share.IErrorMsg<any>>{
            let oRpcArg = new Share.CProtocolArg<Share.IRpcEnterWorldArg>(Share.EProtocolType.EnterWorld);
            oRpcArg.data = {
                playerIndex: nPlayerIndex,
                inviterUID: strInviterUID,
                inviterAct: strInviterAct,
                shareType: shareType
            };
            let scene;
            return this.m_oBehavSession.callRpc(oRpcArg).then((data: Share.IErrorMsg<Share.IRpcEnterWorldRet>)=>{
                if(data.errno != 0){
                    return Promise.reject(data);
                }
                this.m_nEnterWorldPlayerIndex = nPlayerIndex;
                this.m_oBehavPlayer.setPlayerInfo(data.ext);
                scene = new CUnitScene();
                scene.BehavScene.ID = 1;
                return this.m_oBehavSceneCtrl.enterScene(scene.BehavScene);
            }).then((nErrorNo: Share.EErrorNo)=>{
                if (nErrorNo != Share.EErrorNo.Success) {
                    scene.destroy();
                    return Promise.reject(Share.CSingleton(Share.CErrorMsgHelper).createErrorMsg(nErrorNo, ""));
                }
                return Promise.reject(null);
            }).catch((error)=>{
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }

        leaveWorld():Promise<Share.IErrorMsg<any>>{
            let oRpcArg = new Share.CProtocolArg<Share.IRpcLeaveWorldArg>(Share.EProtocolType.LeaveWorld);
            oRpcArg.data = {
                accountName: this.m_oBehavAccount.AccountInfo.accountName,
                sessionUID: this.m_oBehavSession.SessionUID,
                sessionToken: this.m_oBehavSession.SessionToken
            };
            return this.m_oBehavSession.callRpc(oRpcArg).then((data: Share.IErrorMsg<Share.IRpcLeaveWorldRet>) => {
                if (data.errno == 0) {
                    let scene = this.m_oBehavSceneCtrl.Scene;
                    if (scene) {
                        this.m_oBehavSceneCtrl.leaveScene().then(()=>{
                            scene.destroy();
                        })
                    }
                    this.m_nEnterWorldPlayerIndex = null;
                    this.m_oBehavPlayer.setPlayerInfo(null);
                }
                return Promise.reject(data);
            }).catch((error) => {
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }
    }
}