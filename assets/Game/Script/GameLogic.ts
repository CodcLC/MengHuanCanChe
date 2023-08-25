import CClientInstance from "../../framework/CClientInstance";

export default class CConfig {
    // private static m_strInitConfigDir = "https://snh48client.xidea-inc.com/version_nc/";

    // public static get InitConfigPath() {
    //     if (Laya.Browser.onMiniGame){
    //         return this.m_strInitConfigDir + CVersion.Value + ".init" + ".json";
    //     }else{
    //         return CVersion.Value + ".init" + ".json";
    //     }
    // }

    static initConfig: { GameServer: string, HttpServer: string, Table: string, AdApi: string, AdGameId: number, AdChannelId: number, UseHttps: boolean, baseURL: string, needInput: number, simulationShareSwitch: boolean,bannerSwitch:boolean };

    static parse(data: string) {
        this.initConfig = JSON.parse(data.toString());
    }
}

export class GameLogic {
    static m_oClientCore: ClientCore.CBehavClientCore;
    static oSessionInterface: ClientCore.CBehavClientSessionInterface;

    static Init(){
        if (null != Share.CSingleton(CClientInstance).ClientCore)
            return;

        Share.CSingleton(CClientInstance).create();
        this.m_oClientCore = Share.CSingleton(CClientInstance).ClientCore;
        // let initConfig;
        return this.m_oClientCore.Init().then((data) => {
            if (!data)
                return Share.CLogHelper.error("init failed");
            Share.CLogHelper.info("init success");
        }).then(()=>{
            let oAllClientTable = new Share.CAllClientTable();
            return this.m_oClientCore.Load({ gameServer: CConfig.initConfig.GameServer, httpServer: CConfig.initConfig.HttpServer, clientTable: oAllClientTable, useHttps: CConfig.initConfig.UseHttps });
        }).then((data) => {
            if (!data) {
                return Promise.reject(Share.CSingleton(Share.CErrorMsgHelper).createErrorMsg(-1, 'load failed'));
            }
            Share.CLogHelper.info("load success");
            this.oSessionInterface = Share.CSingleton(CClientInstance).createAccountSession();
        });
    }

    static c2s_login(strAccountName:string){
        return this._login(strAccountName).then((data)=>{
            if(data.errno != 0)
                return Promise.reject(data);
            if (this.oSessionInterface.AccountInfo == null || this.oSessionInterface.AccountInfo.playerUIDs.length === 0){
                return this._createPlayer();
            }
            return Share.CSingleton(Share.CErrorMsgHelper).successMsg();
        }).then((data)=>{
            if(data.errno != 0)
                return Promise.reject(data);

            return this._enterWorld(1, "", "", 0);
        }).then(data=>{
            if (data.errno != 0)
                return Promise.reject(data);

                //this.start();
        });
    }

    static _login(strAccountName: string, channelToken:string=""): Promise<Share.IErrorMsg<any>>{
        return this.oSessionInterface.login({ accountName: strAccountName, sign: "", channelToken:channelToken }).then((data) => {
            if (data.errno == Share.EErrorNo.TryAgain) {
                return Share.CPromiseHelper.delay(1000).then(() => {
                    return this._login(strAccountName, channelToken);
                });
            }
            if (data.errno != 0) {
                Share.CLogHelper.warn("login failed: ", data.errmsg);
                return data;
            }
            Share.CLogHelper.info("login success");
            return data;
        });
    }

    static _createPlayer(strPlayerName?: string): Promise<Share.IErrorMsg<any>>{
        return this.oSessionInterface.createPlayer(strPlayerName).then((data) => {
            Share.CLogHelper.info("createPlayer:", JSON.stringify(data));
            return data;
        });
    }

    static _enterWorld(nPlayerIndex: number = 1, strInviterUID: string = "", strInviterAct?: string, shareType?: number) {
        return this.oSessionInterface.enterWorld(nPlayerIndex, strInviterUID, strInviterAct, shareType).then((data) => {
            Share.CLogHelper.info("enterWorld:", JSON.stringify(data));
            return data;
        });
    }
}