namespace ClientCore{
    class CG2CPtcSyncProperty{
        public static onProcess(data: Share.IPtcSyncPropertyArg, oSession: Share.CSession) {
            let oBehavSession = <CBehavSession>oSession.getUserData();
            if(oBehavSession == null || oBehavSession.isDestroyed())
                return;
            if(oBehavSession.BehavAccount && oBehavSession.BehavAccount.BehavPlayer)
                oBehavSession.BehavAccount.BehavPlayer.BeSyncProperty(data.name, data.value);
        }
    }
    Share.CSingleton(Share.CProtocolMgr).registerController(CG2CPtcSyncProperty, Share.EProtocolType.SyncProperty);
}