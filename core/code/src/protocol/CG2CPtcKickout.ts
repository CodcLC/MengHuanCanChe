namespace ClientCore{
    class CG2CPtcKickout{
        public static onProcess(data: Share.IPtcKickoutArg, oSession: Share.CSession) {
            let oBehavSession = <CBehavSession>oSession.getUserData();
            if(oBehavSession == null || oBehavSession.isDestroyed())
                return;
            oBehavSession.beKickout();
        }
    }
    Share.CSingleton(Share.CProtocolMgr).registerController(CG2CPtcKickout, Share.EProtocolType.Kickout);
}