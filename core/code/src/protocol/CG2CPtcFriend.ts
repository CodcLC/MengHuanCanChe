namespace ClientCore{
    class CG2CPtcFriendRequest{
        public static onProcess(data: Share.IPtcFriendRequestArg, oSession: Share.CSession) {
            let oBehavSession = <CBehavSession>oSession.getUserData();
            if(oBehavSession == null || oBehavSession.isDestroyed())
                return;
            oBehavSession.onFriendRequest(data);
        }
    }
    Share.CSingleton(Share.CProtocolMgr).registerController(CG2CPtcFriendRequest, Share.EProtocolType.FriendRequest);

    class CG2CPtcFriendResponse{
        public static onProcess(data: Share.IPtcAddFriendArg, oSession: Share.CSession) {
            let oBehavSession = <CBehavSession>oSession.getUserData();
            if(oBehavSession == null || oBehavSession.isDestroyed())
                return;
            oBehavSession.onFriendRequest(data);
        }
    }
    Share.CSingleton(Share.CProtocolMgr).registerController(CG2CPtcFriendResponse, Share.EProtocolType.AddFriend);
}