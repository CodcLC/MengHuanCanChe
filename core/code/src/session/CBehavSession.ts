namespace ClientCore {
    export class CBehavSession extends Share.CUnitBehavior {
        private m_oSession: Share.CSession;
        private m_strUrl: string;
        private m_oClientCore: CBehavClientCore;
        private m_bToClose: boolean;
        private m_onClosed = new Share.CAsyncDelegate<() => void>();
        private m_strAccountName: string;
        private m_strSign:string;
        private m_strChannelToken:string;
        private m_oSessionUID: Share.CObjResUID;
        private m_oLastLoginSessionUID: Share.CObjResUID;
        private m_strSessionToken: string;
        private m_oBehavAccount: CBehavAccount;
        private m_oPingTimer;
        private m_onRelogin = new Share.CDelegate<() => Promise<Share.IErrorMsg<any>>>();
        private m_onKickout = new Share.CAsyncDelegate<() => void>();
        private m_onInvite = new Share.CDelegate<(data:Share.IPtcInviteArg) => Promise<Share.IErrorMsg<any>>>();
        private m_onFriendRequest = new Share.CDelegate<(data:Share.IPtcFriendRequestArg) => Promise<Share.IErrorMsg<any>>>();
        private m_onFriendResponse = new Share.CDelegate<(data:Share.IPtcAddFriendArg) => Promise<Share.IErrorMsg<any>>>();
        private m_bKickouted = false;
        private m_inAreas = false;

        constructor(s: Share.CUnit, oClientCore: CBehavClientCore) {
            super(s);
            this.m_oClientCore = oClientCore;
            this.m_strUrl = oClientCore.GameServer;
        }

        get OnRelogin(){
            return this.m_onRelogin;
        }

        get SessionUID(){
            return this.m_oSessionUID;
        }

        get SessionToken(){
            return this.m_strSessionToken;
        }

        get InAreas(){
            return this.m_inAreas;
        }

        protected _awake(){
            this.m_oBehavAccount = this.getComponent(CBehavAccount);
        }

        public get BehavAccount(){
            return this.m_oBehavAccount;
        }

        public get ClientCore() {
            return this.m_oClientCore;
        }

        public get OnClosed() {
            return this.m_onClosed;
        }

        public get OnInvite(){
            return this.m_onInvite;
        }

        public get OnFriendRequest(){
            return this.m_onFriendRequest;
        }

        public get OnFriendResponse(){
            return this.m_onFriendResponse;
        }

        protected _destroy() {
            if (this.m_oSession != null)
                this.m_oSession.close();
        }

        private _reconnect(times: number): Promise<Share.EErrorNo> {
            if (times <= 0)
                return Promise.resolve(Share.EErrorNo.Fail);
            return this._connect().then((data) => {
                if (data == Share.EErrorNo.Success)
                    return Promise.reject(null);
                if (times == 1)
                    return Promise.reject(data);
                return Share.CPromiseHelper.delay(1000).then(() => {
                    return this._reconnect(--times);
                });
            }).catch((err) => {
                if (err == null)
                    return Share.EErrorNo.Success;
                return err;
            });
        }

        private _connect(): Promise<Share.EErrorNo> {
            if (this.m_strUrl == null || this.m_strUrl === "")
                return Promise.resolve(Share.EErrorNo.InvalidArguments);
            if (!this.isClosed())
                return Promise.resolve(Share.EErrorNo.Connected);
            let oSendReceiver: Share.ISendReceiveLinker;
            return CWSConnector.connect(this.m_strUrl).then((data: Share.ISendReceiveLinker) => {
                oSendReceiver = data;
                if (oSendReceiver == null)
                    return Promise.reject<Share.EErrorNo>(new Error("connect failed"));
                if (this.isDisabled()) {
                    oSendReceiver.close();
                    return Promise.reject(new Error("Behavior Disabled"));
                }
                let oSession = new Share.CSession(oSendReceiver, (sr: Share.ISendReceiveLinker) => {
                    // if (!this.m_bToClose) {
                    //     this._reconnect(10);
                    // }
                    sr.close();
                });
                oSendReceiver.onClose(()=>{
                    oSession.close();
                })
                if (this.isDisabled()) {
                    oSession.close();
                    return Promise.reject(new Error("Behavior Disabled"));
                }
                this.m_bToClose = false;
                oSession.setUserData(this);
                oSession.onClose(() => {
                    this.close();
                    oSession.setUserData(null);
                    Share.CLogHelper.info("session closed");
                    // this.OnClosed.invoke();
                });
                this.m_oSession = oSession;
                return Share.EErrorNo.Success;
            }).catch((err) => {
                Share.CLogHelper.warn(err);
                return Share.EErrorNo.Fail;
            });
        }

        get isLogined(){
            return !this.isClosed() && this.m_oSessionUID != null;
        }

        public close(): void {
            if (this.m_oSession != null){
                this.m_oSession.close();
                this.m_oSession = null;
            }
            this.m_oSessionUID = null;
            this.m_bToClose = true;
            if (this.m_oPingTimer){
                clearTimeout(this.m_oPingTimer);
                this.m_oPingTimer = null;
            }
        }

        public isClosed(): boolean {
            return this.m_oSession == null || this.m_oSession.isClosed();
        }

        private _restartPing(){
            if(this.isClosed())
                return;
            if(this.m_oPingTimer)
                clearTimeout(this.m_oPingTimer);
            this.m_oSession.sendPtc(new Share.CProtocolArg(Share.EProtocolType.Ping));
            this.m_oPingTimer = setTimeout(() => {
                this._restartPing();
            }, 30000);
        }

        private _login(): Promise<Share.IErrorMsg<CBehavAccount>>{
            if(!this.m_strAccountName/** || !this.m_strSign*/)
                return Promise.resolve(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(Share.EErrorNo.InvalidArguments));
            if (this.m_oSession.isClosed())
                return Promise.resolve(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(Share.EErrorNo.SessionClosed));
            if(this.isLogined)
                return Promise.resolve(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(Share.EErrorNo.InvalidOperation));
            let oRpcArg = new Share.CLoginArg();
            oRpcArg.val.data = {
                accountName: this.m_strAccountName,
                sign: this.m_strSign,
                channelToken: this.m_strChannelToken
            };
            return this.m_oSession.callRpc(oRpcArg.val).then((oRpcRet: Share.IErrorMsg<Share.ILoginRet>) => {
                if (oRpcRet.errno != 0)
                    return Promise.reject(Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(oRpcRet));
                this.m_strSessionToken = oRpcRet.ext.sessionToken;
                this.m_oSessionUID = oRpcRet.ext.sessionUID;
                this.m_oBehavAccount.setAccountInfo(oRpcRet.ext.accoutInfo);
                this.m_oLastLoginSessionUID = this.m_oSessionUID;
                this.m_inAreas = oRpcRet.ext.inAreas;
                return Promise.reject(Share.CSingleton(Share.CErrorMsgHelper).successMsg(this.m_oBehavAccount));
            }).catch((error) => {
                if (error.errno != 0 && error.errno != Share.EErrorNo.TryAgain)
                    this.m_oSession.close();
                if(error.errno == 0)
                    this._restartPing();
                else
                    this.m_oSessionUID = null;
                return error;
            });
        }

        public login(oArg: Share.ILoginArg): Promise<Share.IErrorMsg<CBehavAccount>> {
            this.m_bKickouted = false;
            this.m_strAccountName = oArg.accountName;
            this.m_strSign = oArg.sign;
            this.m_strChannelToken = oArg.channelToken;
            let p = Promise.resolve(Share.EErrorNo.Success);
            if (this.isClosed())
                p = this._reconnect(10);
            return p.then((data) => {
                if (data != Share.EErrorNo.Success)
                    return Share.CSingleton(Share.CErrorMsgHelper).errorMsg(data);
                return this._login();
            });
        }

        public logout(): Promise<Share.IErrorMsg<any>> {
            if (!this.isLogined)
                return Promise.resolve(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(Share.EErrorNo.Fail));
            let oRpcArg = new Share.CLogoutArg();
            oRpcArg.val.data.accountName = this.m_oBehavAccount.AccountInfo.accountName;
            return this.m_oSession.callRpc(oRpcArg.val).then((data: Share.IErrorMsg<Share.IRpcLogoutRet>) => {
                if (data.errno == 0) {
                    this.m_oSession.close();
                }
                return Promise.reject(null);
            }).catch((error) => {
                if (error == null){
                    this.m_oSessionUID = null;
                    return Share.CSingleton(Share.CErrorMsgHelper).successMsg();
                }
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }

        public beKickout() {
            this.m_bKickouted = true;
            Share.CLogHelper.warn("be kickout");
            this.m_onKickout.invoke();
            if (this.m_oSession)
                this.m_oSession.close();
        }

        private _reLogin(bLogin:boolean =false): Promise<Share.IErrorMsg<any>>{
            if(this.m_bKickouted)
                return Promise.resolve(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(Share.EErrorNo.Fail));
            if(this.isLogined)
                return Promise.resolve(Share.CSingleton(Share.CErrorMsgHelper).successMsg());
            if(bLogin){
                return this.login({
                    accountName: this.m_strAccountName,
                    sign: this.m_strSign,
                    channelToken: this.m_strChannelToken
                }).then((data) => {
                    if (data.errno == 0) {
                        return Promise.all(this.m_onRelogin.invoke()).then((datas: Share.IErrorMsg<any>[]) => {
                            if (datas == null)
                                return Share.CSingleton(Share.CErrorMsgHelper).successMsg();
                            for (let i = 0; i != datas.length; ++i) {
                                if (datas[i].errno != 0)
                                    return datas[i];
                            }
                            return Share.CSingleton(Share.CErrorMsgHelper).successMsg();
                        });
                    }
                    if(data.errno == Share.EErrorNo.TryAgain){
                        return Share.CPromiseHelper.delay(500).then(()=>{
                            return this._reLogin(true)
                        });
                    }
                    return data;
                });
            }
            let p = Promise.resolve(Share.EErrorNo.Success);
            if(this.isClosed())
                p = this._reconnect(10);
            return p.then((data)=>{
                if(data != Share.EErrorNo.Success)
                    return Promise.reject(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(data));
                let oRpcArg = new Share.CReLoginArg();
                oRpcArg.val.data = {
                    accountName: this.m_strAccountName,
                    sessionUID: this.m_oLastLoginSessionUID,
                    sessionToken: this.m_strSessionToken
                };
                return this.m_oSession.callRpc(oRpcArg.val);
            }).then((data: Share.IErrorMsg<Share.IRpcReLoginRet>)=>{
                if(data.errno == 0)
                    return Promise.reject(null);
                return this._reLogin(true);
            }).then((data)=>{
                if(data.errno == 0)
                    return Promise.reject(null);
                return Promise.reject(data);
            }).catch((error)=>{
                if(error == null)
                    return Share.CSingleton(Share.CErrorMsgHelper).successMsg();
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            })
        }

        onInvite(data:Share.IPtcInviteArg) {
            this.m_onInvite.invoke(data);
        }

        onFriendRequest(data:Share.IPtcFriendRequestArg){
            this.m_onFriendRequest.invoke(data);
        }

        onFriendResponse(data:Share.IPtcAddFriendArg){
            this.m_onFriendResponse.invoke(data);
        }

        public callRpc<T, U>(arg: Share.CProtocolArg<T>, timeoutMilliSeconds: number = 20000): Promise<U> {
            if (this.isLogined || arg.type == Share.EProtocolType.ReLogin || arg.type == Share.EProtocolType.Login)
                return this.m_oSession.callRpc(arg, timeoutMilliSeconds);
            return this._reLogin().then((data)=>{
                if(data.errno != 0){
                    this.OnClosed.invoke();
                    return Promise.reject<U>(new Error("send on a closed session"));
                }
                return this.m_oSession.callRpc<T, U>(arg, timeoutMilliSeconds);
            });
        }

        public sendPtc<T>(arg: Share.CProtocolArg<T>): void {
            if (this.isLogined || arg.type == Share.EProtocolType.ReLogin || arg.type == Share.EProtocolType.Login)
                return this.m_oSession.sendPtc(arg);
            this._reLogin().then((data) => {
                if (data.errno == 0)
                    return this.m_oSession.sendPtc(arg);
                else
                    this.OnClosed.invoke();
            });
        }
    }
}