namespace ClientCore{
    class CG2CPtcInvite{
        public static onProcess(data: Share.IPtcInviteArg, oSession: Share.CSession) {
            let oBehavSession = <CBehavSession>oSession.getUserData();
            if(oBehavSession == null || oBehavSession.isDestroyed())
                return;
            oBehavSession.onInvite(data);
        }
    }
    Share.CSingleton(Share.CProtocolMgr).registerController(CG2CPtcInvite, Share.EProtocolType.Invite);
}