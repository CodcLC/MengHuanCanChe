namespace ClientCore {
    export class CBehavPlayer extends Share.CUnitBehavior {
        private m_oPlayerInfo: Share.IPlayerInfo;
        private m_oBehavSession: CBehavSession;
        private m_oBehavProperty: Share.CBehavProperty;
        private m_oBehavPropertyCalc: Share.CBehavPropertyCalc;
        private m_oSyncGuaJiExtExpTimer:any;
        private m_nDeltaGuaJiExtExp:number = 0;

        constructor(s: Share.CUnit) {
            super(s);
        }

        protected _awake() {
            this.m_oBehavSession = this.getComponent(CBehavSession);
            this.m_oBehavProperty = this.getComponent(Share.CBehavProperty);
            this.m_oBehavProperty.register(Share.EPropertyContainerType.VirtualProperty, {});
            this.m_oBehavProperty.register(Share.EPropertyContainerType.ViewProperty, {});
            this.m_oBehavPropertyCalc = this.getComponent(Share.CBehavPropertyCalc);
            // this.m_oBehavProperty.OnPropertyChanged.add((eType, name, prevValue, nextValue)=>{
            //     if(eType === Share.EPropertyContainerType.VirtualProperty && name === Share.EPropertyType[Share.EPropertyType.GuaJiExtExp]){
            //         this._onGuaJiExtExpChanged(prevValue, nextValue);
            //         return;
            //     }
            // });
        }

        private _onGuaJiExtExpChanged(prevValue:number, nextValue:number){
            let deltaValue = nextValue - prevValue;
            this._syncDeltaGuaJiExtExp(deltaValue); 
        }

        private _syncDeltaGuaJiExtExp(deltaValue:number){
            // if (deltaValue <= 0)
            //     return;
            // this.m_nDeltaGuaJiExtExp += deltaValue;
            // if(this.m_oSyncGuaJiExtExpTimer != null){
            //     return;
            // }
            // this.m_oSyncGuaJiExtExpTimer = setTimeout(() => {
            //     let d = this.m_nDeltaGuaJiExtExp;
            //     this.m_nDeltaGuaJiExtExp = 0;
            //     let oRpcArg = new Share.CProtocolArg<Share.IRpcGuaJiExtExpChangedArg>(Share.EProtocolType.GuaJiExtExpChanged);
            //     oRpcArg.data = {
            //         GuaJiExtExp: d
            //     };
            //     this.m_oBehavSession.callRpc(oRpcArg).then((data: Share.IErrorMsg<Share.IRpcGuaJiExtExpChangedRet>) => {
            //         if (data.errno == Share.EErrorNo.Success) {
            //             let nGuaJiExtExp = this.m_oBehavPropertyCalc.GuaJiExtExp;
            //             if (nGuaJiExtExp > d)
            //                 this.m_oBehavPropertyCalc.GuaJiExtExp -= d;
            //             else
            //                 this.m_oBehavPropertyCalc.GuaJiExtExp = 0;
            //         }
            //         return Promise.reject(data);
            //     }).catch((error) => {
            //         this.m_oSyncGuaJiExtExpTimer = null;
            //         return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            //     });
            // }, 1000);
        }

        get BehavSession() {
            return this.m_oBehavSession;
        }

        get PlayerInfo() {
            return this.m_oPlayerInfo;
        }

        BeSyncProperty(name:string, value:number|string){
            this.m_oBehavProperty.set(Share.EPropertyContainerType.Property, name, value);
        }

        setPlayerInfo(oPlayerInfo: Share.IPlayerInfo) {
            this.m_oPlayerInfo = oPlayerInfo;
            this.m_oBehavProperty.register(Share.EPropertyContainerType.Property, <{ [name: string]: number }>oPlayerInfo);
        }

        protected _destroy(){
            if(this.m_oSyncGuaJiExtExpTimer)
                clearTimeout(this.m_oSyncGuaJiExtExpTimer);
        }

        /** 保存玩家数据 */
        save(oPlayerInfo:Share.IPlayerInfo):Promise<Share.IErrorMsg<any>>{
            // if (!this.m_oBehavSession.isLogined)
            //     return Promise.resolve(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(Share.EErrorNo.Fail));

            let oRpcArg = new Share.CProtocolArg<Share.IRpcSavePlayerArg>(Share.EProtocolType.SavePlayer);
            oRpcArg.data = {
                coin:oPlayerInfo.Coin,
                gem:oPlayerInfo.Gem,
                notificationLastShowTime:oPlayerInfo.NotificationLastShowTime,
                userData:oPlayerInfo.UserData,
                statistics:oPlayerInfo.Statistics,
            };
            return this.m_oBehavSession.callRpc(oRpcArg).then((data: Share.IErrorMsg<Share.IRpcSavePlayerRet>) => {
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(null);
            }).catch((error)=>{
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }

        /** 保存玩家概要数据 */
        saveUserData(oPlayerInfo:Share.IPlayerInfo):Promise<Share.IErrorMsg<any>>{
            // if (!this.m_oBehavSession.isLogined)
            //     return Promise.resolve(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(Share.EErrorNo.Fail));

            let oRpcArg = new Share.CProtocolArg<Share.IRpcSaveUserDataArg>(Share.EProtocolType.SaveUserData);
            oRpcArg.data = {
                nickName:oPlayerInfo.Name,
                avatar:oPlayerInfo.Avatar,
                customData:oPlayerInfo.CustomData,
            };
            return this.m_oBehavSession.callRpc(oRpcArg).then((data: Share.IErrorMsg<any>) => {
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(null);
            }).catch((error)=>{
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }

        /** 开始下雨 */
        startRain():Promise<Share.IErrorMsg<Share.IRpcStartRainRet>>{
            // if (!this.m_oBehavSession.isLogined)
            //     return Promise.resolve(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(Share.EErrorNo.Fail));

            let oRpcArg = new Share.CProtocolArg<Share.IRpcStartRainArg>(Share.EProtocolType.StartRain);
            return this.m_oBehavSession.callRpc(oRpcArg).then((data: Share.IErrorMsg<Share.IRpcStartRainRet>) => {
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(data);
            }).catch((error)=>{
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }

        /** 开放拖拉机 */
        openTractor():Promise<Share.IErrorMsg<any>>{
            // if (!this.m_oBehavSession.isLogined)
            //     return Promise.resolve(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(Share.EErrorNo.Fail));

            let oRpcArg = new Share.CProtocolArg<Share.IRpcOpenTractorArg>(Share.EProtocolType.OpenTractor);
            return this.m_oBehavSession.callRpc(oRpcArg).then((data: Share.IErrorMsg<any>) => {
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(data);
            }).catch((error)=>{
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }

        /** 去集市 */
        gotoMarket():Promise<Share.IErrorMsg<any>>{
            // if (!this.m_oBehavSession.isLogined)
            //     return Promise.resolve(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(Share.EErrorNo.Fail));

            let oRpcArg = new Share.CProtocolArg<Share.IRpcGotoMarketArg>(Share.EProtocolType.GotoMarket);
            return this.m_oBehavSession.callRpc(oRpcArg).then((data: Share.IErrorMsg<any>) => {
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(data);
            }).catch((error)=>{
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }
    }
}