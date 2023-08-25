declare namespace Share {
    class CAsyncDelegate<T extends Function> {
        private m_oDelegate;
        static isNullOrEmpty(onDelegate: CDelegate<any>): boolean;
        isEmpty(): boolean;
        clear(): void;
        add(onFunc: T, self?: object): void;
        remove(onFunc: T): void;
        invoke(...args: any[]): Promise<any[]>;
    }
}
declare namespace Share {
    class CObjResNode<T extends IObjRes> {
        private m_oObjRes;
        private m_oPrev;
        private m_oNext;
        readonly Data: T;
        readonly Next: CObjResNode<T>;
        readonly Prev: CObjResNode<T>;
    }
    class CObjResMgr<T extends IObjRes> {
        private m_oObjRes;
        private m_oFreeIndex;
        private m_nSize;
        private m_nSizeOfPool;
        private m_onObjConstructor;
        private m_onObjDestructor;
        private m_oHead;
        private m_oTail;
        constructor(nSizeOfPool: number, objConstructor: (nObjType: number) => T, objDestructor?: (oObj: T) => void);
        begin(): CObjResNode<T>;
        end(): CObjResNode<T>;
        rbegin(): CObjResNode<T>;
        rend(): CObjResNode<T>;
        getSize(): number;
        createObj(nObjType: number): T;
        getObj(oUID: CObjResUID): T;
        releaseObj(oUID: CObjResUID): void;
        releaseAll(): void;
        private _getObjRes(oUID);
        private _releaseObj(oObjResInfo);
    }
}
declare namespace Share {
    class CUnit {
        private m_oBehaviorList;
        private m_bIsDestroyed;
        private m_oMsgReceiver;
        constructor(...args: (CUnitBehaviorContainer[] | CUnitBehaviorContainer)[]);
        isDestroyed(): boolean;
        getComponent<T extends CUnitBehavior>(b: {
            BehaviorId: string;
            new (s: CUnit, ...args: any[]): T;
        }): T;
        destroy(): void;
        sendMsg<T extends CUnitBehavior>(oDst: T, nMsgId: number, ...args: any[]): void;
        sendMsgToUnit(oDst: CUnit, nMsgId: number, ...args: any[]): void;
    }
}
declare namespace Share {
    abstract class CUnitBehavior {
        private m_oOwner;
        private m_bIsDisabled;
        static readonly BehaviorId: string;
        readonly Unit: CUnit;
        constructor(s: CUnit);
        protected _registerMsg(nMsgId: number, onCallback: (oSrc: CUnit, ...args: any[]) => void): void;
        setDisable(bDisable: boolean): void;
        getComponent<T extends CUnitBehavior>(b: {
            BehaviorId: string;
            new (s: CUnit, ...args: any[]): T;
        }): T;
        destroy(): void;
        isDestroyed(): boolean;
        isDisabled(): boolean;
        sendMsg<T extends CUnitBehavior>(oDst: T, nMsgId: number, ...args: any[]): void;
        sendMsgToUnit(oDst: CUnit, nMsgId: number, ...args: any[]): void;
        protected _awake(): void;
        protected _start(): void;
        protected _destroy(): void;
        protected _enable(): void;
        protected _disable(): void;
    }
}
declare namespace Share {
    abstract class CEffect implements IObjRes {
        private m_oUID;
        private m_bRemoved;
        readonly UID: CObjResUID;
        qconstructor(oUID: CObjResUID): void;
        qdestructor(): void;
        getObjType(): number;
        isRemoved(): boolean;
        add(oBehavEffect: CBehavEffect, args: any[]): void;
        remove(): void;
        isAddForever(): boolean;
        protected abstract _onAdd(oBehavEffect: CBehavEffect, args: any[]): void;
        protected abstract _onRemove(): void;
        protected abstract _isAddForever(): boolean;
        protected abstract _getObjType(): EEffectType;
    }
}
declare namespace Share {
    enum EProtocolType {
        Login = 1,
        Logout = 2,
        Kickout = 3,
        ReLogin = 4,
        EnterWorld = 5,
        LeaveWorld = 6,
        CreatePlayer = 7,
        Ping = 8,
        FinishGuaJi = 9,
        SyncProperty = 10,
        UseBooster = 11,
        Reborn = 12,
        UpgradeProperty = 13,
        Buy = 14,
        SavePlayer = 15,
        ClaimOfflineReward = 16,
        ClaimInviteReward = 17,
        GetInvitees = 18,
        Invite = 19,
        StartRain = 20,
        QueryPlayer = 21,
        GetInviteesByShareType = 22,
        OpenTractor = 23,
        GotoMarket = 24,
        SaveUserData = 25,
        GetRandomUser = 26,
        FriendRequest = 27,
        AddFriend = 28,
        QueryUserData = 29,
        IgnoreFriendRequest = 30,
        DaLi = 31,
        DaoLuan = 32,
        Fire = 33,
        WxLogin = 34,
        GetAccessToken = 35,
        GetWXACodeUnlimit = 36,
        ModifyMail = 37,
        GetTick = 38,
    }
}
declare namespace Share {
    type protocolClass = {
        onCall?: (data: any, oSession: CSession) => any;
        onProcess?: (data: {}, oSession: CSession) => void;
    };
    class CProtocolMgr {
        private m_oControllers;
        registerController(c: protocolClass, eType: EProtocolType): void;
        getController(eType: EProtocolType): protocolClass;
    }
}
declare namespace ClientCore {
    interface IFinishGuaJiRet {
        delaySummonMilliSecond: number;
    }
}
declare namespace ClientCore {
    class CUnitClientSession extends Share.CUnit {
        private m_oInterface;
        readonly BehavInterface: CBehavClientSessionInterface;
        constructor(oClientCore: CBehavClientCore);
    }
}
declare namespace Share {
    class COctStream {
        private m_oBuffer;
        private m_oDataView;
        private m_nSize;
        private m_nPopIndex;
        readonly Capacity: number;
        readonly Size: number;
        readonly Buffer: Uint8Array;
        Assign(oData: Uint8Array, begin?: number, size?: number): void;
        Clear(): void;
        Reserve(nCapacity: number): void;
        private Resize(nSize);
        pushUInt8(val: number): COctStream;
        pushInt8(val: number): COctStream;
        pushUInt16(val: number): COctStream;
        pushInt16(val: number): COctStream;
        pushUInt32(val: number): COctStream;
        pushInt32(val: number): COctStream;
        pushUInt64(val: CInt64): COctStream;
        pushInt64(val: CInt64): COctStream;
        pushFloat(val: number): COctStream;
        pushDouble(val: number): COctStream;
        pushString(val: string): COctStream;
        pushData(val: IData): COctStream;
        popUInt8(): number;
        popInt8(): number;
        popUInt16(): number;
        popInt16(): number;
        popUInt32(): number;
        popInt32(): number;
        popUInt64(): CInt64;
        popInt64(): CInt64;
        popFloat(): number;
        popDouble(): number;
        popString(): string;
        popData(val: IData): void;
        toString(): string;
    }
}
declare namespace Share {
    class CPromiseHelper {
        static resolve<R>(value: R | PromiseLike<R>): Promise<R>;
        static reject<R>(error: any): Promise<R>;
        static all<T>(values: (T | PromiseLike<T>)[]): Promise<T[]>;
        static race<T>(promises: (T | PromiseLike<T>)[]): Promise<T>;
        static delay(millseconds: number): Promise<void>;
        static createPromise<T>(): {
            callback: (error, data?: T) => any;
            promise: Promise<T>;
        };
        static promisify<U>(func: (...params: (any | ((error: any, value: any) => U))[]) => any, self?: {}): (...args: any[]) => Promise<U>;
    }
}
declare namespace Share {
    class CQueue<T> {
        private m_aList;
        private m_nBegin;
        private m_nEnd;
        constructor();
        reserve(nCapacity: number): void;
        at(nIndex: number): T;
        set(nIndex: number, oValue: T): void;
        clear(): void;
        pop(): T;
        push(oItem: T): T;
        getCount(): number;
        isEmpty(): boolean;
        isFull(): boolean;
    }
}
declare namespace Share {
    function CSingleton<T>(c: {
        __singleton$?: T;
        new (): T;
    }): T;
}
declare namespace Share {
    class CTimer {
        private m_bDestroyed;
        readonly isDestroyed: boolean;
        destroy(): void;
    }
    class CTimerMgr implements IObjRes {
        private static m_oObjMgr;
        private static m_oGlobalTimerMgr;
        private m_oUID;
        private m_nTimeScale;
        private m_oTimers;
        private m_oExtTimers;
        private m_nCurTime;
        private readonly m_onFrameLoopFunc;
        private m_oFrameLoop;
        private m_nDeltaTime;
        static create(oFrameLoop: IFrameLoop, nBaseTime?: number): CTimerMgr;
        static release(oTimerMgr: CTimerMgr): void;
        static global(): CTimerMgr;
        readonly CurTime: number;
        TimeScale: number;
        private constructor();
        private _execTimer();
        private _tick(level);
        private _init(oFrameLoop, nBaseTime);
        qconstructor(oUID: CObjResUID): void;
        qdestructor(): void;
        getObjType(): number;
        start(nMilliSeconds: number, onCallback: (nCurrent: number, nCount: number) => void, nCount?: number, nFirstMilliSeconds?: number): CTimer;
        startOnce(nMilliSeconds: number, onCallback: (nCurrent: number, nCount: number) => void): CTimer;
        startForever(nMilliSeconds: number, onCallback: (nCurrent: number, nCount: number) => void, nFirstMilliSeconds?: number): CTimer;
        stop(oTimer: CTimer): void;
        private _addTimerExecFunc(execTime, func);
    }
}
declare namespace Share {
    type __BehaviorType = {
        BehaviorId: string;
        new (o: CUnit, ...args: any[]): CUnitBehavior;
    };
    type CUnitBehaviorContainer = {
        c: __BehaviorType;
        args: any[];
    };
    function CUBC<T extends CUnitBehavior>(c: {
        BehaviorId: string;
        new (o: CUnit, ...args: any[]): T;
    }, ...args: any[]): CUnitBehaviorContainer;
}
declare namespace Share {
    class CDelegate<T extends Function> {
        private m_oFuncList;
        static isNullOrEmpty(onDelegate: CDelegate<any>): boolean;
        isEmpty(): boolean;
        clear(): void;
        add(onFunc: T, self?: object): void;
        remove(onFunc: T): void;
        invoke(...args: any[]): any[];
    }
}
declare namespace Share {
    enum EErrorNo {
        Fail = -1,
        Success = 0,
        InvalidArguments = 1,
        InvalidSQL = 2,
        InvalidOperation = 3,
        ConnectFailed = 4,
        Timeout = 5,
        ServerOffline = 6,
        InvalidToken = 7,
        InvalidSession = 8,
        Logining = 9,
        Logouting = 10,
        TryAgain = 11,
        SessionClosed = 12,
        BehaviorDisabled = 13,
        Connected = 14,
        InvalidLevel = 15,
        NoEnoughItem = 16,
        LowLevel = 17,
        PrerequisitesAreNotMet = 18,
        RepeatRequest = 19,
        AlreadyFriend = 20,
    }
    class CErrorMsgHelper {
        private errorMap;
        constructor();
        createErrorMsg<T>(errno: number, errmsg: string, ext?: T): IErrorMsg<T>;
        errorMsg<T>(errno: EErrorNo, ext?: T): {
            errno: number;
            errmsg: string;
        };
        successMsg<T>(ext?: T): IErrorMsg<T>;
        toErrorMsg(err: any): any;
    }
}
declare namespace Share {
    interface IData {
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
}
declare namespace Share {
    interface IFrameLoop {
        readonly onFrame: CDelegate<(nDeltaTime: number) => void>;
    }
}
declare namespace Share {
    class CObjResUIDHelper {
        private static s_nIndexLen;
        private static s_nCheckNumLen;
        static toUID(nIndex: number, nCheckNum: number): CObjResUID;
        static toIndex(uid: CObjResUID): number;
        static toCheckNum(uid: CObjResUID): number;
        static getMaxIndex(): number;
        static getMaxCheckNum(): number;
    }
    class CObjResUID {
        readonly m_nIndex: number;
        readonly m_nCheckNum: number;
        constructor(nIndex: number, nCheckNum: number);
        static isNullOrZero(oUID: CObjResUID): boolean;
        isZero(): boolean;
        valueOf(): number;
        toString(): string;
    }
    interface IObjRes {
        qconstructor(uid: CObjResUID): any;
        qdestructor(): any;
        getObjType(): number;
    }
}
declare namespace Share {
    interface IErrorMsg<T> {
        errno: number;
        errmsg: string;
        ext?: T;
    }
}
declare namespace Share {
    class CUtf8Encoding {
        private static throwOnInvalid;
        private static fallbackCharacter;
        private static _index(index, arr);
        private static _identity(x);
        static Encode(s: string): Uint8Array;
        static Decode(bytes: Uint8Array, index?: number, count?: number): string;
    }
}
declare namespace Share {
    class CAllClientTable implements Share.IData {
        readonly m_oGlobalConfigMgr: CGlobalConfigData;
        readonly m_oShareSwitchMgr: CShareSwitchData;
        readonly m_oFramLandAttrMgr: CFarmLandAttrMgrData;
        readonly m_oCropAttrMgr: CCropAttrMgrData;
        readonly m_oUnitAttrMgr: CUnitAttrMgrData;
        readonly m_oTechAttrMgr: CTechAttrMgrData;
        readonly m_oInviteAttrMgr: CInviteAttrMgrData;
        readonly m_oFarmSkinAttrMgr: CFarmSkinAttrMgrData;
        readonly m_oFarmAttrMgr: CFarmAttrMgrData;
        readonly m_oGemItemAttrMgr: CGemItemAttrMgrData;
        readonly m_oUnlockAttrMgr: CUnlockAttrMgrData;
        readonly m_oWheelAttrMgr: CWheelAttrMgrData;
        readonly m_oSevenDaysAttrMgr: CSevenDaysAttrMgrData;
        readonly m_oInviteClintAttrMgr: CInviteClientAttrMgrData;
        readonly m_oAutoRewardAttrMgr: CAutoRewardAttrMgrData;
        readonly m_oJobAttrMgr: CJobAttrMgrData;
        readonly m_oFarmerAttrMgr: CFarmerAttrMgrData;
        readonly m_oGuideTaskAttrMgr: CGuideTaskAttrMgrData;
        readonly m_oDialogueAttrMgr: CDialogueAttrMgrData;
        readonly m_oTreasureFirstAttrMgr: CTreasureFirstAttrMgrData;
        readonly m_oTreasureSecondAttrMgr: CTreasureSecondAttrMgrData;
        readonly m_oBubbleFirstAttrMgr: CBubbleFirstAttrMgrData;
        readonly m_oBubbleSecondAttrMgr: CBubbleSecondAttrMgrData;
        readonly m_oProvinceAttrMgr: CProvinceAttrMgrData;
        marshal(oct: Share.COctStream): void;
        unMarshal(oct: Share.COctStream): void;
    }
}
declare namespace Share {
    class CAutoRewardAttr {
        id: number;
        rate: number;
        seed: number;
        specialcrop: number;
        gem: number;
        woodbox: number;
        goldbox: number;
    }
    class CAutoRewardAttrMgr {
        private m_oMgrData;
        init(oMgrData: CAutoRewardAttrMgrData): void;
        get(id: number): CAutoRewardAttr;
        readonly data: {
            [nId: number]: CAutoRewardAttr;
        };
        readonly list: CAutoRewardAttr[];
    }
    class CAutoRewardAttrMgrData implements IData {
        m_oData: {
            [nId: number]: CAutoRewardAttr;
        };
        m_lData: CAutoRewardAttr[];
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
}
declare namespace Share {
    class CBubbleFirstAttr {
        id: number;
        name: string;
        type: number;
        count: number;
        number: number;
        contribution: number;
        game: number;
        share: number;
        video: number;
        official: number;
        prop: number;
        itemId: number;
    }
    class CBubbleFirstAttrMgr {
        private m_oMgrData;
        init(oMgrData: CBubbleFirstAttrMgrData): void;
        get(id: number): CBubbleFirstAttr;
        readonly data: {
            [nId: number]: CBubbleFirstAttr;
        };
        readonly list: CBubbleFirstAttr[];
    }
    class CBubbleFirstAttrMgrData implements IData {
        m_oData: {
            [nId: number]: CBubbleFirstAttr;
        };
        m_lData: CBubbleFirstAttr[];
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
}
declare namespace Share {
    class CBubbleSecondAttr {
        id: number;
        content: string;
        type: number;
        prop: number;
        desc: string;
        voice: string;
    }
    class CBubbleSecondAttrMgr {
        private m_oMgrData;
        init(oMgrData: CBubbleSecondAttrMgrData): void;
        get(id: number): CBubbleSecondAttr;
        readonly data: {
            [nId: number]: CBubbleSecondAttr;
        };
        readonly list: CBubbleSecondAttr[];
    }
    class CBubbleSecondAttrMgrData implements IData {
        m_oData: {
            [nId: number]: CBubbleSecondAttr;
        };
        m_lData: CBubbleSecondAttr[];
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
}
declare namespace Share {
    class CCropAttr {
        id: number;
        name: string;
        lvupcost: number;
        lvcostunit: string;
        producttime: number;
        halflv: number;
        baseproduct: number;
        prounit: string;
        farmlandid: number;
        itembg: string;
        spine: string;
        unlocklv: number;
        share: number;
        percent: number;
        tips: string;
        enable: number;
        probability: number;
        type: number;
        harvest: string;
        cash: number;
        ordercrop: number;
        orderneed: string;
        gem: number;
        from: string;
        proname: string;
        videocrop: number;
        officer: number;
    }
    class CCropAttrMgr {
        private m_oMgrData;
        init(oMgrData: CCropAttrMgrData): void;
        get(id: number): CCropAttr;
        readonly data: {
            [nId: number]: CCropAttr;
        };
        readonly list: CCropAttr[];
    }
    class CCropAttrMgrData implements IData {
        m_oCrops: {
            [nId: number]: CCropAttr;
        };
        m_aCrops: CCropAttr[];
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
}
declare namespace Share {
    class CDialogueAttr {
        id: number;
        dialogue: string;
        audio: string;
        position_x: number;
        position_y: number;
    }
    class CDialogueAttrMgr {
        private m_oMgrData;
        init(oMgrData: CDialogueAttrMgrData): void;
        get(id: number): CDialogueAttr;
        readonly data: {
            [nId: number]: CDialogueAttr;
        };
        readonly list: CDialogueAttr[];
    }
    class CDialogueAttrMgrData implements IData {
        m_oData: {
            [nId: number]: CDialogueAttr;
        };
        m_lData: CDialogueAttr[];
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
}
declare namespace Share {
    class CFarmAttr {
        id: number;
        skinadd: number;
        needgold: number;
        needgoldunit: string;
        tractortimes: number;
        seedlimit: number;
        seedlimitunit: string;
        openfarm: number;
        openfarmunit: string;
        skinname: string;
        skindes: string;
        job: string;
        level: string;
        quality: number;
        pond: number;
        icon: number;
    }
    class CFarmAttrMgrData implements IData {
        m_oData: {
            [nId: number]: CFarmAttr;
        };
        m_lData: CFarmAttr[];
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
    class CFarmAttrMgr {
        private m_oMgrData;
        init(oMgrData: CFarmAttrMgrData): void;
        get(id: number): CFarmAttr;
        readonly data: {
            [nId: number]: CFarmAttr;
        };
        readonly list: CFarmAttr[];
    }
}
declare namespace Share {
    class CFarmerAttr {
        id: number;
        workstate: string;
        effect: number;
        worktime: number;
        rate: number;
        farmerX: number;
        price: number;
    }
    class CFarmerAttrMgrData implements IData {
        m_oData: {
            [nId: number]: CFarmerAttr;
        };
        m_lData: CFarmerAttr[];
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
    class CFarmerAttrMgr {
        private m_oMgrData;
        init(oMgrData: CFarmerAttrMgrData): void;
        get(id: number): CFarmerAttr;
        readonly data: {
            [nId: number]: CFarmerAttr;
        };
        readonly list: CFarmerAttr[];
    }
}
declare namespace Share {
    class CFarmLandAttr {
        id: number;
        crops: number[];
        landcostunit: string;
        landunlockcost: number;
    }
    class CFarmLandAttrMgrData implements IData {
        m_oFarmLands: {
            [nId: number]: CFarmLandAttr;
        };
        m_lData: CFarmLandAttr[];
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
    class CFarmLandAttrMgr {
        private m_oMgrData;
        init(oMgrData: CFarmLandAttrMgrData): void;
        get(id: number): CFarmLandAttr;
        readonly data: {
            [nId: number]: CFarmLandAttr;
        };
        readonly list: CFarmLandAttr[];
    }
}
declare namespace Share {
    class CFarmSkinAttr {
        id: number;
        skinadd: number;
        skinname: string;
        skindes: string;
        price: number;
        times: number;
        onshow: number;
    }
    class CFarmSkinAttrMgrData implements IData {
        m_oData: {
            [nId: number]: CFarmSkinAttr;
        };
        m_lData: CFarmSkinAttr[];
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
    class CFarmSkinAttrMgr {
        private m_oMgrData;
        init(oMgrData: CFarmSkinAttrMgrData): void;
        get(id: number): CFarmSkinAttr;
        readonly data: {
            [nId: number]: CFarmSkinAttr;
        };
        readonly list: CFarmSkinAttr[];
    }
}
declare namespace Share {
    class CGemItemAttr {
        id: number;
        itemname: string;
        effect: number;
        des: string;
        gemcost: number;
        limit: number;
    }
    class CGemItemAttrMgrData implements IData {
        m_oData: {
            [nId: number]: CGemItemAttr;
        };
        m_lData: CGemItemAttr[];
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
    class CGemItemAttrMgr {
        private m_oMgrData;
        init(oMgrData: CGemItemAttrMgrData): void;
        get(id: number): CGemItemAttr;
        readonly data: {
            [nId: number]: CGemItemAttr;
        };
        readonly list: CGemItemAttr[];
    }
}
declare namespace Share {
    class CGlobalConfigAttr {
        appid: string;
        secret: string;
        heartlimit: number;
        ShareRandom: number;
        notice: string;
        initialgem: number;
        initialgold: number;
        initialseed: number;
        seedprofit: number;
        invitecloudtime: number;
        farmertime: number;
        initialcloudtime: number;
        farmercontinue: number;
        gopherInterval: number;
        newrewardtype: number;
        newbeereward: string;
        tractorinvite: number;
        sliverbox: number;
        goldbox: number;
        sliverboxnum: number;
        goldboxnum: number;
        woodbox: number;
        tractortimenew: string;
        woodboxrate: string;
        gopherreward: number;
        gophertime: number;
        sliverboxCD: number;
        goldboxCD: number;
        cropunlocknum: number;
        coppernum: number;
        slivernum: number;
        goldnum: number;
        firstgold: number;
        copperproduct: number;
        sliverproduct: number;
        goldproduct: number;
        purchasegift1: number;
        purchasegift2: number;
        purchasegift3: number;
        mooncard1gem: number;
        mooncard2gem: number;
        mooncard1box: number;
        mooncard2box: number;
        redpocket: number;
        newredpocket: number;
        bigredpocket: number;
        sharefriend: number;
        sharefriendbig: string;
        sharefriendcrop: number;
        timedgift1invite: number;
        timedgift2invite: number;
        timedgift3invite: number;
        timedgifttrigger: number;
        timedgift1reward: string;
        timedgift2reward: string;
        timedgift3reward1: string;
        timedgift3reward2: string;
        goldshare: string;
        goldsharetimes: number;
        goldshareover: number;
        npcfarmland: string;
        npcfarmlandlv: number;
        freegemsperday: number;
        freegemsdays: number;
        freegemstimes: number;
        noticetime: number;
        treasuremaptrigger: number;
        treasuremaprand: string;
        treasuremapsbox: string;
        treasuremaplbox: string;
        treasuremapclick1: number;
        treasuremapclick2: number;
        treasurecropid: number;
        publicaccountgems: number;
        stealgold: string;
        maketroublegold: string;
        tendlimit: number;
        friendlimit: number;
        energygift: number;
        energybiggift: number;
        newplayerenergy: number;
        energylimit: number;
        energyrecovery: number;
        maketroublefriend: number;
        maketroubleenemy: number;
        helpgold: string;
        treasuremaptime: number;
        redheart: number;
        blackheart: number;
        gohpergemlimit: number;
        energyfastcost: number;
        jobclickreward: number;
        sharegold: number;
        sharegoldtimes: number;
        newbuildlv: number;
        sharegoldmin: number;
        sharegoldclose: number;
        balloonclick: number;
        appinfo: string;
        balloontime: number;
        farmerlimit: number;
        jobclicktime: number;
        wheelpiece: number;
        moblieappid: string;
        mobliename: string;
        hirefriendtimes: number;
        friendjob: number;
        tractorCDgem: number;
        balloonmiss: number;
        platinumnum: number;
        platinumproduct: number;
        platinumunlock: number;
        goldA: number;
        goldB: number;
        goldC: number;
        goldD: number;
        platinumA: number;
        platinumB: number;
        platinumC: number;
        platinumD: number;
        timedgiftskin: number;
        clearSize: number;
        orderrandom: number;
        orderCD: number;
        claimlimit: number;
        claimclicktime: number;
        callbackreward: string;
        callbacktime: number;
        activeplayerreward: string;
        backreward: string;
        guoyuanappid: string;
        IOSshare: string;
        ANDshare: string;
        sharetimea: number;
        IOSsharedaily2: string;
        ANDsharedaily2: string;
        orderCDclear: number;
        harvesttime: number;
        gemsharevideo: number;
        gemsharedata1: string;
        gemsharedata2: string;
        gemsharedata2config: string;
        gemsharedata1configday1: string;
        gemsharedata1configday2: string;
        gemshareCD: number;
        gemsharevideolimit: number;
        yunvideolimit: number;
        autorewardrate: number;
        autorewardcd: number;
        autorewardlimit: number;
        bubbleshowCD: number;
        bubbleduring: number;
        bubblefirstduring: number;
        totalvideolimit: number;
        shareaward: string;
        shareawardlimit: number;
    }
    class CGlobalConfigData implements IData {
        m_oAttr: CGlobalConfigAttr;
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
    class CGlobalConfigMgr {
        private m_oMgrData;
        readonly Data: CGlobalConfigAttr;
        init(oMgrData: CGlobalConfigData): void;
    }
}
declare namespace Share {
    class CGuideTaskAttr {
        id: number;
        taskdes: string;
        data: number;
    }
    class CGuideTaskAttrMgr {
        private m_oMgrData;
        init(oMgrData: CGuideTaskAttrMgrData): void;
        get(id: number): CGuideTaskAttr;
        readonly data: {
            [nId: number]: CGuideTaskAttr;
        };
        readonly list: CGuideTaskAttr[];
    }
    class CGuideTaskAttrMgrData implements IData {
        m_oData: {
            [nId: number]: CGuideTaskAttr;
        };
        m_lData: CGuideTaskAttr[];
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
}
declare namespace Share {
    class CInviteAttr {
        id: number;
        Count: number;
        AddPropertyID: number[];
        AddValue: number[];
        Title: string;
        Desc: string;
    }
    class CInviteAttrMgrData implements IData {
        m_oAttrs: {
            [id: number]: CInviteAttr;
        };
        length: number;
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
    class CInviteAttrMgr {
        private m_oMgrData;
        init(oMgrData: CInviteAttrMgrData): void;
        getAllInviteAttrs(): {
            [id: number]: CInviteAttr;
        };
        getInviteAttr(nInviteID: number): CInviteAttr;
    }
}
declare namespace Share {
    class CInviteClientAttr {
        id: number;
        invite: number;
        gem: number;
        radish: number;
    }
    class CInviteClientAttrMgr {
        private m_oMgrData;
        init(oMgrData: CInviteClientAttrMgrData): void;
        get(id: number): CInviteClientAttr;
        readonly data: {
            [nId: number]: CInviteClientAttr;
        };
        readonly list: CInviteClientAttr[];
    }
    class CInviteClientAttrMgrData implements IData {
        m_oData: {
            [nId: number]: CInviteClientAttr;
        };
        m_lData: CInviteClientAttr[];
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
}
declare namespace Share {
    class CJobAttr {
        id: number;
        jobname: string;
        jobdes: string;
        jobnum: number;
    }
    class CJobAttrMgr {
        private m_oMgrData;
        init(oMgrData: CJobAttrMgrData): void;
        get(id: number): CJobAttr;
        readonly data: {
            [nId: number]: CJobAttr;
        };
        readonly list: CJobAttr[];
    }
    class CJobAttrMgrData implements IData {
        m_oData: {
            [nId: number]: CJobAttr;
        };
        m_lData: CJobAttr[];
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
}
declare namespace Share {
    class CProvinceAttr {
        id: number;
        province: string;
        label: string;
    }
    class CProvinceAttrMgr {
        private m_oMgrData;
        init(oMgrData: CProvinceAttrMgrData): void;
        get(id: number): CProvinceAttr;
        readonly data: {
            [nId: number]: CProvinceAttr;
        };
        readonly list: CProvinceAttr[];
    }
    class CProvinceAttrMgrData implements IData {
        m_oData: {
            [nId: number]: CProvinceAttr;
        };
        m_lData: CProvinceAttr[];
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
}
declare namespace Share {
    class CSevenDaysAttr {
        id: number;
        gem: number;
        goldhour: number;
        woodbox: number;
        goldbox: number;
    }
    class CSevenDaysAttrMgr {
        private m_oMgrData;
        init(oMgrData: CSevenDaysAttrMgrData): void;
        get(id: number): CSevenDaysAttr;
        readonly data: {
            [nId: number]: CSevenDaysAttr;
        };
        readonly list: CSevenDaysAttr[];
    }
    class CSevenDaysAttrMgrData implements IData {
        m_oData: {
            [nId: number]: CSevenDaysAttr;
        };
        m_lData: CSevenDaysAttr[];
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
}
declare namespace Share {
    class CShareSwitchAttr {
        SHARE_FRIENDS: boolean;
        SHARE_PROMOTION: boolean;
        SHARE_ORDER: boolean;
        SEVEN_LOGIN: boolean;
        DIAMOND_REDPACK: boolean;
        SHARE_OFF_LINE: boolean;
        SHARE_OLD_MAN: boolean;
        NEWPLAYER_GUIDE: boolean;
        FUNCTION_GUIDE: boolean;
        LIMIT_GIFT: boolean;
        NOVICE_SHARE: boolean;
        NOVICE_SHARE_SWITCH: boolean;
        NOVICE_GEM: boolean;
        NOVICE_GEM_SWITCH: boolean;
        TREASURE_SWITCH: boolean;
        MAIL_SWITCH: boolean;
        GIFT_CODE_SWITCH: boolean;
        SOCIAL_SWITCH: boolean;
        TURNTABLE_SWITCH: boolean;
        FOLLOW_REWARD_SWITCH: boolean;
        ENERGY_SWITCH: boolean;
        SHARE_SWITCH: boolean;
        SCENE_MOVE: boolean;
        EMPOLYEE_SWITCH: boolean;
        zhishengFX: boolean;
        queqianFX: boolean;
        BALLOON: boolean;
        EXCHANGE: boolean;
        PRIVATE_CHAT: boolean;
        SHARE_FORBID: boolean;
        COMMIT_FILE_SIZE: boolean;
        CLEAR_CACHE: boolean;
        OLD_USER_REGRESS: boolean;
        GARDEN_SWITCH: boolean;
        Mondayshare: boolean;
        BOX_VIDEO: boolean;
    }
    class CShareSwitchData implements IData {
        m_oAttr: CShareSwitchAttr;
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
    class CShareSwitchMgr {
        private m_oMgrData;
        readonly Data: CShareSwitchAttr;
        init(oMgrData: CShareSwitchData): void;
    }
}
declare namespace Share {
    class CTechAttr {
        id: number;
        type: number;
        icon: number;
        name: string;
        level: string;
        des: string;
        effect: number;
        effecttype: number;
        costtype: number;
        techcost: number;
        techcostunit: string;
        landunlock: number;
        nexttech: number;
        farmlandid: number;
        lasttech: number;
    }
    class CTechAttrMgrData implements IData {
        m_oData: {
            [nId: number]: CTechAttr;
        };
        m_lData: CTechAttr[];
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
    class CTechAttrMgr {
        private m_oMgrData;
        init(oMgrData: CTechAttrMgrData): void;
        get(id: number): CTechAttr;
        readonly data: {
            [nId: number]: CTechAttr;
        };
        readonly list: CTechAttr[];
    }
}
declare namespace Share {
    class CTreasureFirstAttr {
        id: number;
        min: number;
        max: number;
        one: number;
        two: number;
        three: number;
        four: number;
        five: number;
    }
    class CTreasureFirstAttrMgr {
        private m_oMgrData;
        init(oMgrData: CTreasureFirstAttrMgrData): void;
        get(id: number): CTreasureFirstAttr;
        readonly data: {
            [nId: number]: CTreasureFirstAttr;
        };
        readonly list: CTreasureFirstAttr[];
    }
    class CTreasureFirstAttrMgrData implements IData {
        m_oData: {
            [nId: number]: CTreasureFirstAttr;
        };
        m_lData: CTreasureFirstAttr[];
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
}
declare namespace Share {
    class CTreasureSecondAttr {
        id: number;
        storeroom: number;
        goodsId: number;
        num: number;
        weight: number;
    }
    class CTreasureSecondAttrMgr {
        private m_oMgrData;
        init(oMgrData: CTreasureSecondAttrMgrData): void;
        get(id: number): CTreasureSecondAttr;
        readonly data: {
            [nId: number]: CTreasureSecondAttr;
        };
        readonly list: CTreasureSecondAttr[];
    }
    class CTreasureSecondAttrMgrData implements IData {
        m_oData: {
            [nId: number]: CTreasureSecondAttr;
        };
        m_lData: CTreasureSecondAttr[];
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
}
declare namespace Share {
    class CUnitAttr {
        id: number;
        name: string;
        nameunit: string;
        percent: number[];
        unit: string;
    }
    class CUnitAttrMgrData implements IData {
        m_oData: {
            [nId: number]: CUnitAttr;
        };
        m_lData: CUnitAttr[];
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
    class CUnitAttrMgr {
        private m_oMgrData;
        init(oMgrData: CUnitAttrMgrData): void;
        get(id: number): CUnitAttr;
        readonly data: {
            [nId: number]: CUnitAttr;
        };
        readonly list: CUnitAttr[];
    }
}
declare namespace Share {
    class CUnlockAttr {
        id: number;
        tips: string;
        farmland: number;
        lvcostunit: string;
        harvesttimes: number;
        movetimes: number;
        close: number;
    }
    class CUnlockAttrMgr {
        private m_oMgrData;
        init(oMgrData: CUnlockAttrMgrData): void;
        get(id: number): CUnlockAttr;
        readonly data: {
            [nId: number]: CUnlockAttr;
        };
        readonly list: CUnlockAttr[];
    }
    class CUnlockAttrMgrData implements IData {
        m_oData: {
            [nId: number]: CUnlockAttr;
        };
        m_lData: CUnlockAttr[];
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
}
declare namespace Share {
    class CWheelAttr {
        id: number;
        prob: number;
        type: number;
        data: number;
    }
    class CWheelAttrMgr {
        private m_oMgrData;
        init(oMgrData: CWheelAttrMgrData): void;
        get(id: number): CWheelAttr;
        readonly data: {
            [nId: number]: CWheelAttr;
        };
        readonly list: CWheelAttr[];
    }
    class CWheelAttrMgrData implements IData {
        m_oData: {
            [nId: number]: CWheelAttr;
        };
        m_lData: CWheelAttr[];
        marshal(oct: COctStream): void;
        unMarshal(oct: COctStream): void;
    }
}
declare namespace Share {
    class CBattleSceneFrameLoop implements IFrameLoop {
        readonly onFrame: CDelegate<(nDeltaTime: number) => void>;
        private m_oBaseTimerMgr;
        private m_oTimer;
        private m_nIntervalMilliSeconds;
        constructor(nIntervalMilliSeconds?: number);
        private _frameLoop();
        stop(): void;
    }
}
declare namespace Share {
    class CBehavEffect extends CUnitBehavior {
        private m_oEffectMgr;
        private static m_aEffectConstructors;
        constructor(oUnit: any);
        protected _awake(): void;
        add(eEffectType: EEffectType, args: any[]): CObjResUID;
        remove(oEffectUID: CObjResUID): void;
    }
}
declare namespace Share {
    class CBehavProperty extends CUnitBehavior {
        private readonly m_onPropertyChanged;
        private readonly m_onPropertyRegistered;
        private readonly m_aPropertyContainers;
        readonly OnPropertyChanged: CAsyncDelegate<(eType: EPropertyContainerType, name: string, prevValue: string | number, nextValue: string | number) => void>;
        readonly OnPropertyRegistered: CAsyncDelegate<(eType: EPropertyContainerType, container: {
            [name: string]: string | number;
        }) => void>;
        constructor(oUnit: any);
        register(eType: EPropertyContainerType, container: {
            [name: string]: number | string;
        }): void;
        add(eType: EPropertyContainerType, name: string, value: number): void;
        set(eType: EPropertyContainerType, name: string, value: number | string): void;
        get(eType: EPropertyContainerType, name: string): number | string;
    }
}
declare namespace Share {
    class CBehavPropertyCalc extends CUnitBehavior {
        private m_oBehavProperty;
        constructor(oUnit: any);
        protected _awake(): void;
        getOfflineCoinPerSecond(): number;
    }
}
declare namespace Share {
    class CBehavScene extends CUnitBehavior {
        private m_oBehavTimerMgr;
        private readonly m_onEnter;
        private readonly m_onLeave;
        private m_nID;
        private readonly m_oSceneCtrlMgr;
        ID: number;
        readonly OnEnter: CDelegate<(oSceneCtrl: CBehavSceneCtrl) => void>;
        readonly OnLeave: CDelegate<(oSceneCtrl: CBehavSceneCtrl) => void>;
        readonly BehavTimerMgr: CBehavTimerMgr;
        constructor(oUnit: any);
        protected _awake(): void;
        begin(): CObjResNode<CSceneCtrlUID>;
        end(): CObjResNode<CSceneCtrlUID>;
        rbegin(): CObjResNode<CSceneCtrlUID>;
        rend(): CObjResNode<CSceneCtrlUID>;
        readonly Size: number;
        get(oUID: CObjResUID): CBehavSceneCtrl;
        add(oSceneCtrl: CBehavSceneCtrl): void;
        remove(oSceneCtrl: CBehavSceneCtrl): void;
        kickOutAll(): Promise<EErrorNo[]>;
        protected _destroy(): void;
    }
}
declare namespace Share {
    class CBehavSceneCtrl extends CUnitBehavior {
        private readonly m_onBeforeSwitchScene;
        private readonly m_onAfterSwitchScene;
        private m_oCurScene;
        private m_oUID;
        readonly OnBeforeSwitchScene: CDelegate<(oSceneCtrl: CBehavSceneCtrl, oPrevScene: CBehavScene, oNextScene: CBehavScene) => void>;
        readonly OnAfterSwitchScene: CDelegate<(oSceneCtrl: CBehavSceneCtrl, oPrevScene: CBehavScene, oNextScene: CBehavScene) => void>;
        readonly Scene: CBehavScene;
        readonly UID: CObjResUID;
        constructor(oUnit: any);
        private _setUID(oUID);
        enterScene(oScene: CBehavScene): Promise<EErrorNo>;
        leaveScene(): Promise<EErrorNo>;
        protected _destroy(): void;
    }
}
declare namespace Share {
    class CBehavTimerMgr extends CUnitBehavior {
        private m_oTimerMgr;
        readonly TimerMgr: CTimerMgr;
        constructor(oUnit: any);
        init(oFrameLoop: IFrameLoop, nBaseTime?: number): void;
        protected _destroy(): void;
    }
}
declare namespace Share {
    class CFrameLoopTimerImpl implements IFrameLoop {
        readonly onFrame: CDelegate<(nDeltaTime: number) => void>;
        private m_oTimer;
        private m_nLastMilliTimestamp;
        constructor();
        private _frameLoop();
        stop(): void;
    }
}
declare namespace Share {
    class CEffectAddProperty extends CEffect {
        private m_oBehavProperty;
        private m_strPropertyField;
        private m_nPropertyValue;
        protected _getObjType(): EEffectType;
        protected _onAdd(oBehavEffect: CBehavEffect, args: any[]): void;
        protected _onRemove(): void;
        protected _isAddForever(): boolean;
    }
}
declare namespace Share {
    class CSceneCtrlUID implements IObjRes {
        private m_oUID;
        private m_oBehavSceneCtrl;
        readonly UID: CObjResUID;
        BehavSceneCtrl: CBehavSceneCtrl;
        qconstructor(oUID: CObjResUID): void;
        qdestructor(): void;
        getObjType(): number;
    }
}
declare namespace Share {
    enum EAIType {
        GuaJiNpc = 2,
    }
}
declare namespace Share {
    enum EBoosterType {
        Booster1 = 1,
        Booster2 = 2,
        Booster3 = 3,
    }
}
declare namespace Share {
    enum EEffectType {
        AddProperty = 1,
    }
}
declare namespace Share {
    enum EPropertyContainerType {
        Property = 0,
        VirtualProperty = 1,
        ViewProperty = 2,
    }
}
declare namespace Share {
    enum EPropertyType {
        Exp = 1,
        Level = 2,
        Gem = 3,
        Coin = 4,
        OfflineSeconds = 5,
        InviteRewardCount = 6,
        InviteCount = 7,
        Friends = 8,
        FriendRequests = 9,
        FriendSocial = 10,
        Heart = 11,
        HeartRecord = 12,
        CloudTime = 13,
        Mail = 14,
    }
}
declare namespace Share {
    enum EShareType {
        cloudShare = 1,
        inviteShare = 2,
        tractorShare = 3,
        farmerShare = 4,
        otherShare = 5,
        offlineShare = 6,
        payShare = 7,
        rebBoxShare = 8,
        pyqShare = 9,
        xslbShare = 10,
        leadShare = 11,
        CBTShare = 12,
        TLShare = 13,
        EmpolyeeShare = 14,
        openLand = 15,
        upgradeGold = 16,
        xsflShare = 17,
        OldUserShare = 18,
        orderShare = 19,
        DcrMoodShare = 20,
        Gopher = 21,
        newGuideAward = 22,
        cardBagYuanbaoShare = 23,
        cardBagTiliShare = 24,
        repeatPieceShare = 25,
        zhuanpanPieceShare = 26,
        shareAward = 27,
    }
}
declare namespace Share {
    enum ESkillType {
        PlayerAttack = 1,
        Mercenary1Attack = 2,
        Mercenary2Attack = 3,
        Booster1 = 4,
        Booster2 = 5,
        Booster3 = 6,
        CastBooster1 = 7,
    }
}
declare namespace Share {
    enum EUnitMessageType {
        Attack = 0,
    }
}
declare namespace Share {
    interface IPtcFriendRequestArg {
        account: string;
        name: string;
        avatar: string;
    }
    class CPtcFriendRequestArg {
        readonly val: CProtocolArg<IPtcFriendRequestArg>;
    }
    interface IPtcAddFriendArg {
        account: string;
        name: string;
        avatar: string;
    }
    class CPtcAddFriendArg {
        readonly val: CProtocolArg<IPtcFriendRequestArg>;
    }
}
declare namespace Share {
    class CConsoleLogPrinter implements ILogPrinter {
        private _getTime();
        debug(...args: any[]): void;
        info(...args: any[]): void;
        warn(...args: any[]): void;
        error(...args: any[]): void;
    }
}
declare namespace Share {
    class CInt64 {
        private low_;
        private high_;
        private static IntCache_;
        private static TWO_PWR_16_DBL_;
        private static TWO_PWR_24_DBL_;
        private static TWO_PWR_32_DBL_;
        private static TWO_PWR_31_DBL_;
        private static TWO_PWR_48_DBL_;
        private static TWO_PWR_64_DBL_;
        private static TWO_PWR_63_DBL_;
        static ZERO: any;
        private static ONE;
        private static NEG_ONE;
        static MAX_VALUE: CInt64;
        static MIN_VALUE: CInt64;
        private static TWO_PWR_24_;
        static fromInt(value: number): any;
        static fromNumber(value: any): any;
        constructor(low: number, high: number);
        static fromBits(lowBits: any, highBits: any): CInt64;
        static fromString(str: any, opt_radix?: number): CInt64;
        toInt(): number;
        toNumber(): number;
        hashCode(): number;
        toString(opt_radix?: number): string;
        getHighBits(): number;
        getLowBits(): number;
        getLowBitsUnsigned(): number;
        getNumBitsAbs(): number;
        isZero(): boolean;
        isNegative(): boolean;
        isOdd(): boolean;
        private equalsLong(other);
        private notEqualsLong(other);
        equals(other: number | string | CInt64): boolean;
        static from(other: number | string | CInt64): CInt64;
        lessThan(other: number | string | CInt64): boolean;
        lessThanOrEqual(other: number | string | CInt64): boolean;
        greaterThan(other: number | string | CInt64): boolean;
        greaterThanOrEqual(other: number | string | CInt64): boolean;
        compare(otherV: number | string | CInt64): 0 | 1 | -1;
        negate(): CInt64;
        add: (otherV: string | number | CInt64) => CInt64;
        subtract(other: number | string | CInt64): CInt64;
        multiply(otherV: number | string | CInt64): CInt64;
        div(otherV: number | string | CInt64): CInt64;
        modulo(otherV: number | string | CInt64): CInt64;
        not(): CInt64;
        and(otherV: number | string | CInt64): CInt64;
        or(otherV: number | string | CInt64): CInt64;
        xor(otherV: number | string | CInt64): CInt64;
        shiftLeft(numBits: number): CInt64;
        shiftRight(numBits: number): CInt64;
        shiftRightUnsigned(numBits: number): CInt64;
        inc: () => any;
        dec: () => any;
        valueOf: () => any;
        unaryPlus: () => any;
        unaryMinus: () => CInt64;
        inv: () => CInt64;
    }
}
declare namespace Share {
    interface IPtcKickoutArg {
    }
    class CPtcKickoutArg {
        readonly val: CProtocolArg<IPtcKickoutArg>;
    }
}
declare namespace Share {
    interface IPtcSyncPropertyArg {
        name: string;
        value: number | string;
    }
    class CPtcSyncPropertyArg {
        readonly val: CProtocolArg<IPtcSyncPropertyArg>;
    }
}
declare namespace Share {
    interface IRpcBuyArg {
        shopID: number;
        goodsID: number;
        count: number;
    }
    interface IRpcBuyRet {
    }
    class CBuyArg {
        readonly val: CProtocolArg<IRpcBuyArg>;
    }
}
declare namespace Share {
    interface IRpcClaimInviteRewardArg {
        inviteAttrId: number;
    }
    interface IRpcClaimInviteRewardRet {
    }
    class CClaimInviteRewardArg {
        readonly val: CProtocolArg<IRpcClaimInviteRewardArg>;
    }
}
declare namespace Share {
    interface IRpcClaimOfflineRewardArg {
        bDouble: boolean;
    }
    interface IRpcClaimOfflineRewardRet {
    }
    class CClaimOfflineRewardArg {
        readonly val: CProtocolArg<IRpcClaimOfflineRewardArg>;
    }
}
declare namespace Share {
    interface IRpcCreatePlayerArg {
        playerName: string;
    }
    interface IRpcCreatePlayerRet {
        index: number;
        playerUID: string;
    }
    class CCreatePlayerArg {
        readonly val: CProtocolArg<IRpcCreatePlayerArg>;
    }
}
declare namespace Share {
    interface IRpcEnterWorldArg {
        playerIndex: number;
        inviterUID: string;
        inviterAct: string;
        shareType: number;
    }
    interface IPlayerInfo {
        [name: string]: number | string;
        _UID: string;
        Name: string;
        Avatar: string;
        Gender: number;
        Coin: string;
        Gem: number;
        LastEnterWorldTimestamp: number;
        LastLeaveWorldTimestamp: number;
        Level: number;
        Exp: number;
        CustomData: string;
        cloudlastTime: number;
        CloudTime: number;
        tractorOpenTime: number;
        shougeTimes: number;
        OfflineSeconds: number;
        InviterUID: string;
        InviteCount: number;
        InviteRewardCount: number;
        NotificationLastShowTime: number;
        UserData: string;
        DataTimestamp: number;
        Friends: string;
        FriendRequests: string;
        FriendSocial: string;
        Heart: number;
        HeartRecord: string;
        RecruitStatus: number;
        Mail: string;
        Statistics: string;
    }
    interface IRpcEnterWorldRet extends IPlayerInfo {
    }
    class CEnterWorldArg {
        readonly val: CProtocolArg<IRpcEnterWorldArg>;
    }
    interface IFriendSocial {
        [actName: string]: Share.ISocialData;
    }
    interface ISocialData {
        actName: string;
        careTimestamp?: number;
        recruitState?: number;
        fired?: boolean;
        recruitTimestamp?: number;
    }
    interface IHeartRecord {
        actName: string;
        type: ERecordType;
        timestamp: number;
    }
    enum ERecordType {
        DaLi = 0,
        DaoLuan = 1,
    }
    interface IMail {
        _UID: string;
        Platform: string;
        Type: string;
        Title: string;
        Content: string;
        Attachment: string;
        Status: number;
        Timestamp: number;
    }
}
declare namespace Share {
    interface IRpcFinishGuaJiArg {
        Enemies: number[];
        SummonBoss: boolean;
    }
    interface IRpcFinishGuaJiRet {
    }
    class CFinishGuaJiArg {
        readonly val: CProtocolArg<IRpcFinishGuaJiArg>;
    }
}
declare namespace Share {
    interface IRpcFriendRequestArg {
        playerAct: string;
    }
    class CFriendRequestArg {
        readonly val: CProtocolArg<IRpcFriendRequestArg>;
    }
    interface IRpcAddFriendArg {
        playerAct: string;
    }
    class CAddFriendArg {
        readonly val: CProtocolArg<IRpcAddFriendArg>;
    }
    interface IRpcIgnoreFriendRequestArg {
        playerAct: string;
    }
    class CIgnoreFriendRequestArg {
        readonly val: CProtocolArg<IRpcIgnoreFriendRequestArg>;
    }
    interface IRpcDaLiArg {
        playerAct: string;
    }
    class CDaLiArg {
        readonly val: CProtocolArg<IRpcDaLiArg>;
    }
    interface IRpcDaoLuanArg {
        playerAct: string;
    }
    class CDaoLuanArg {
        readonly val: CProtocolArg<IRpcDaoLuanArg>;
    }
    interface IRpcFireArg {
        playerAct: string;
    }
    class CFireArg {
        readonly val: CProtocolArg<IRpcFireArg>;
    }
    interface IRpcModifyMailArg {
        id: string;
        status: number;
    }
    class CModifyMailArg {
        readonly val: CProtocolArg<IRpcModifyMailArg>;
    }
}
declare namespace Share {
    interface IGetAccessTokenArg {
    }
    interface IGetAccessTokenRet {
        access_token: string;
        expires_in: number;
        errcode: number;
        errmsg: string;
    }
    class CGetAccessTokenArg {
        readonly val: CProtocolArg<IGetAccessTokenArg>;
    }
}
declare namespace Share {
    interface IRpcGetInviteesArg {
    }
    interface IRpcGetInviteesRet {
        invitees: IPlayerInfo[];
    }
    class CGetInviteesArg {
        readonly val: CProtocolArg<IRpcGetInviteesArg>;
    }
}
declare namespace Share {
    interface IRpcGetInviteesByShareTypeArg {
        shareType: Share.EShareType;
        startTime: number;
        endTime: number;
    }
    interface IRpcGetInviteesByShareTypeRet {
        invitees: {
            actName: string;
            timestamp: number;
        }[];
    }
    class CGetInviteesByShareTypeArg {
        readonly val: CProtocolArg<IRpcGetInviteesByShareTypeArg>;
    }
}
declare namespace Share {
    interface IGetRandomUserArg {
    }
    class CGetRandomUserArg {
        readonly val: CProtocolArg<IGetRandomUserArg>;
    }
}
declare namespace Share {
    interface IRpcGetTickArg {
    }
    interface IRpcGetTickRet {
        tick: number;
    }
    class CGetTickArg {
        readonly val: CProtocolArg<IRpcGetTickArg>;
    }
}
declare namespace Share {
    interface IGetWXACodeUnlimitArg {
        access_token: string;
        scene: string;
        page?: string;
        width?: number;
        auto_color?: boolean;
        line_color?: Object;
        is_hyaline?: boolean;
    }
    interface IGetWXACodeUnlimitRet {
        access_token: string;
        expires_in: number;
        errcode: number;
        errmsg: string;
    }
    class CGetWXACodeUnlimitArg {
        readonly val: CProtocolArg<IGetWXACodeUnlimitArg>;
    }
}
declare namespace Share {
    interface IRpcGotoMarketArg {
    }
    class CGotoMarketArg {
        readonly val: CProtocolArg<IRpcGotoMarketArg>;
    }
}
declare namespace Share {
    interface IRpcLeaveWorldArg {
        accountName: string;
        sessionUID: CObjResUID;
        sessionToken: string;
    }
    interface IRpcLeaveWorldRet {
    }
    class CLeaveWorldArg {
        readonly val: CProtocolArg<IRpcLeaveWorldArg>;
    }
}
declare namespace Share {
    interface ILoginArg {
        accountName: string;
        sign: string;
        channelToken?: string;
    }
    class CLoginArg {
        readonly val: CProtocolArg<ILoginArg>;
    }
    interface IAccountInfo {
        uid: string;
        accountName: string;
        channelID: string;
        lastLoginTimestamp: number;
        lastLogoutTimestamp: number;
        createTimestamp: number;
        playerUIDs: string[];
    }
    interface ILoginRet {
        accoutInfo: IAccountInfo;
        sessionUID: CObjResUID;
        sessionToken: string;
        inAreas: boolean;
    }
}
declare namespace Share {
    interface IRpcLogoutArg {
        accountName: string;
    }
    interface IRpcLogoutRet {
    }
    class CLogoutArg {
        readonly val: CProtocolArg<IRpcLogoutArg>;
    }
}
declare namespace Share {
    interface IRpcOpenTractorArg {
    }
    class COpenTractorArg {
        readonly val: CProtocolArg<IRpcOpenTractorArg>;
    }
}
declare namespace Share {
    interface IQueryPlayerArg {
        accountName: string;
    }
    interface IQueryPlayerRet {
        Name: string;
        Avatar: string;
    }
    class CQueryPlayerArg {
        readonly val: CProtocolArg<IQueryPlayerArg>;
    }
}
declare namespace Share {
    interface IQueryUserDataArg {
        ActName: string;
    }
    interface IQueryUserDataRet {
        ActName: string;
        Name: string;
        Avatar: string;
        Gender: number;
        Heart: number;
        RecruitStatus: number;
        LastLoginTimestamp: number;
        CustomData: string;
        CreateTimestamp: number;
        InviterUID: string;
    }
    class CQueryUserDataArg {
        readonly val: CProtocolArg<IQueryUserDataArg>;
    }
}
declare namespace Share {
    interface IRpcRebornArg {
    }
    interface IRpcRebornRet {
    }
    class CRebornArg {
        readonly val: CProtocolArg<IRpcRebornArg>;
    }
}
declare namespace Share {
    interface IRpcReLoginArg {
        accountName: string;
        sessionUID: CObjResUID;
        sessionToken: string;
    }
    interface IRpcReLoginRet {
        account: IAccountInfo;
        player: IPlayerInfo;
    }
    class CReLoginArg {
        readonly val: CProtocolArg<IRpcReLoginArg>;
    }
}
declare namespace Share {
    interface IRpcSavePlayerArg {
        coin: string;
        gem: number;
        notificationLastShowTime: number;
        userData: string;
        statistics: string;
    }
    interface IRpcSavePlayerRet {
    }
    class CSavePlayerArg {
        readonly val: CProtocolArg<IRpcSavePlayerArg>;
    }
}
declare namespace Share {
    interface IRpcSaveUserDataArg {
        nickName: string;
        avatar: string;
        customData: string;
    }
    class CSaveUserDataArg {
        readonly val: CProtocolArg<IRpcSaveUserDataArg>;
    }
}
declare namespace Share {
    interface IRpcStartRainArg {
    }
    interface IRpcStartRainRet {
        cloudlastTime: number;
        cloudTime: number;
    }
    class CStartRainArg {
        readonly val: CProtocolArg<IRpcStartRainArg>;
    }
}
declare namespace Share {
    interface IRpcUpgradePropertyArg {
        propertyID: EPropertyType;
        times: number;
    }
    interface IRpcUpgradePropertyRet {
    }
    class CUpgradePropertyArg {
        readonly val: CProtocolArg<IRpcUpgradePropertyArg>;
    }
}
declare namespace Share {
    interface IRpcUseBoosterArg {
        boosterType: EBoosterType;
    }
    interface IRpcUseBoosterRet {
    }
    class CUseBoosterArg {
        readonly val: CProtocolArg<IRpcUseBoosterArg>;
    }
}
declare namespace Share {
    interface IWxLoginArg {
        code: string;
    }
    interface IWxLoginRet {
        openid: string;
        session_key: string;
        unionid: string;
        errcode: number;
        errmsg: string;
    }
    class CWxLoginArg {
        readonly val: CProtocolArg<IWxLoginArg>;
    }
}
declare namespace Share {
    class CLinkedListNode<T> {
        data: T;
        private prev;
        private next;
        private owner;
        constructor(owner: CLinkedList<T>);
        getPrev(): CLinkedListNode<T>;
        getNext(): CLinkedListNode<T>;
    }
    class CLinkedList<T> {
        private head;
        private tail;
        private m_nCount;
        constructor();
        begin(): CLinkedListNode<T>;
        end(): CLinkedListNode<T>;
        rbegin(): CLinkedListNode<T>;
        rend(): () => CLinkedListNode<T>;
        clear(): void;
        insertBefore(node: CLinkedListNode<T>, data: T): CLinkedListNode<T>;
        insertAfter(node: CLinkedListNode<T>, data: T): CLinkedListNode<T>;
        remove(node: CLinkedListNode<T>): boolean;
        removeRange(begin: CLinkedListNode<T>, end: CLinkedListNode<T>): boolean;
        count(): number;
    }
}
declare namespace Share {
    class CProtocolArg<T extends {}> {
        readonly type: EProtocolType;
        data: T;
        constructor(type: EProtocolType);
    }
    class CRpcSendTask implements IObjRes {
        private m_oUId;
        m_oSendTimeout: any;
        m_oCallback: (error: any, data?: any) => any;
        qconstructor(uid: CObjResUID): void;
        qdestructor(): void;
        getObjType(): number;
        getUID(): CObjResUID;
    }
    class CRpcTaskMgr {
        private m_oMgr;
        constructor();
        createRpcTask(): CRpcSendTask;
        releaseRpcTask(uid: CObjResUID): void;
        releaseAllRpcTask(): void;
        getRpcTask(uid: CObjResUID): CRpcSendTask;
    }
}
declare namespace Share {
    class CSession {
        private m_nToRecvLen;
        private m_strRecvData;
        private m_oSendReceiver;
        private m_onError;
        private m_onClose;
        private m_onUnBind;
        private m_oRpcTaskMgr;
        private m_strRemoteIp;
        private m_oUserData;
        constructor(oSendreceiver: ISendReceiver, unbindCallback?: (oSendReceiver: ISendReceiver) => void);
        getUserData(): any;
        setUserData(oUserData: any): void;
        private _onRecv(data);
        unbindCallback(callback: (oSendReceiver: ISendReceiver) => void): void;
        unbind(): void;
        getRemoteIp(): string;
        isClosed(): boolean;
        close(): void;
        callRpc<T, U>(arg: CProtocolArg<T>, timeoutMilliSeconds?: number): Promise<U>;
        sendPtc<T>(arg: CProtocolArg<T>): void;
        onError(callback: (err: Error) => void): void;
        onClose(callback: () => void): void;
    }
}
declare namespace Share {
    interface ILinker {
        isClosed(): boolean;
        close(): void;
        onClose(callback: () => void): void;
    }
}
declare namespace Share {
    interface ISendReceiveLinker extends ISendReceiver, ILinker {
    }
}
declare namespace Share {
    interface ISendReceiver {
        send(data: string | ArrayBuffer): Promise<void>;
        onRecv(callback: (data: string | ArrayBuffer) => void): void;
        onError(callback: (err: Error) => void): void;
        getRemoteIp(): string;
    }
}
declare namespace Share {
    interface ILogPrinter {
        debug(...args: any[]): void;
        info(...args: any[]): void;
        warn(...args: any[]): void;
        error(...args: any[]): void;
    }
    enum ELogLevel {
        none = -1,
        debug = 0,
        info = 1,
        warn = 2,
        error = 3,
    }
    class CLogHelper {
        private static m_oLogPrinter;
        static registerPrinter(printer: ILogPrinter, ...logLevel: ELogLevel[]): void;
        private static _registerPrinter(printer, logLevel);
        static debug(...args: any[]): void;
        static info(...args: any[]): void;
        static warn(...args: any[]): void;
        static error(...args: any[]): void;
    }
}
declare namespace ClientCore {
    interface IGuaJiRet {
        success: boolean;
        reviveMilliSeconds: number;
    }
}
declare namespace ClientCore {
    interface IRequestGuaJiRet {
        delaySummonMilliSecond: number;
        summonBoss: boolean;
    }
}
declare namespace ClientCore {
    class CBehavClientCore extends Share.CUnitBehavior {
        private m_bUseHttps;
        private m_strGameServer;
        private m_strHttpServer;
        readonly UseHttps: boolean;
        readonly GameServer: string;
        readonly HttpServer: string;
        constructor(oUnit: any);
        protected _awake(): void;
        Init(): Promise<boolean>;
        Load(oArg: {
            gameServer: string;
            httpServer: string;
            clientTable: Share.CAllClientTable;
            useHttps: boolean;
        }): Promise<boolean>;
        CreateAccountSession(): CBehavClientSessionInterface;
        DestroyClientSession(oAccount: CBehavAccount): void;
    }
}
declare namespace ClientCore {
    class CUnitClientCore extends Share.CUnit {
        private m_oClientCore;
        constructor();
        readonly ClientCore: CBehavClientCore;
    }
}
declare namespace ClientCore {
    class CWSConnector {
        static connect(url: string): Promise<Share.ISendReceiveLinker>;
    }
}
declare namespace ClientCore {
    class CWSSendReceiver implements Share.ISendReceiveLinker {
        private m_onRecv;
        private m_onError;
        private m_onClose;
        private m_strRemoteUrl;
        private m_oWebSocket;
        constructor(ws: any, remoteUrl: string);
        isClosed(): boolean;
        close(): void;
        send(data: string | ArrayBuffer): Promise<void>;
        onRecv(callback: (data: string | ArrayBuffer) => void): void;
        onError(callback: (err: Error) => void): void;
        onClose(callback: () => void): void;
        getRemoteIp(): string;
    }
}
declare namespace ClientCore {
}
declare namespace ClientCore {
}
declare namespace ClientCore {
}
declare namespace ClientCore {
}
declare namespace ClientCore {
    class CBehavSceneInterface extends Share.CUnitBehavior {
        private m_oBehavScene;
        constructor(s: Share.CUnit);
        readonly OnEnter: Share.CDelegate<(oSceneCtrl: Share.CBehavSceneCtrl) => void>;
        readonly OnLeave: Share.CDelegate<(oSceneCtrl: Share.CBehavSceneCtrl) => void>;
        protected _awake(): void;
    }
}
declare namespace ClientCore {
    class CUnitScene extends Share.CUnit {
        private m_oBehavScene;
        readonly BehavScene: Share.CBehavScene;
        constructor();
    }
}
declare namespace ClientCore {
    class CBehavAccount extends Share.CUnitBehavior {
        private m_oAccountInfo;
        private m_oBehavSession;
        private m_oBehavPlayer;
        constructor(s: Share.CUnit);
        protected _awake(): void;
        readonly BehavPlayer: CBehavPlayer;
        readonly BehavSession: CBehavSession;
        readonly AccountInfo: Share.IAccountInfo;
        setAccountInfo(oAccountInfo: Share.IAccountInfo): void;
        getPlayerBriefInfo(nPlayerIndex: number): string;
    }
}
declare namespace ClientCore {
    class CBehavClientSessionInterface extends Share.CUnitBehavior {
        private m_oBehavSession;
        private m_oBehavPlayer;
        private m_oBehavAccount;
        private m_oBehavPlayerList;
        private m_oBehavWorldGate;
        private m_oBehavSceneCtrl;
        private m_oBehavProperty;
        private m_onGemChanged;
        private m_onCoinChanged;
        private m_onLevelChanged;
        private m_onExpChanged;
        private m_oBehavReborn;
        private m_oBehavUpgrade;
        private m_oBehavShop;
        private m_oBehavPropertyCalc;
        private m_oBehavOffline;
        private m_oBehavFriend;
        private m_oBehavMail;
        constructor(s: Share.CUnit);
        protected _awake(): void;
        readonly BehavSession: CBehavSession;
        readonly BehavPropertyCalc: Share.CBehavPropertyCalc;
        readonly BehavProperty: Share.CBehavProperty;
        readonly OnGemChanged: Share.CDelegate<(nPrevValue: number, nNextValue: number) => void>;
        readonly OnCoinChanged: Share.CDelegate<(nPrevValue: number, nNextValue: number) => void>;
        readonly OnLevelChanged: Share.CDelegate<(nPrevValue: number, nNextValue: number) => void>;
        readonly OnExpChanged: Share.CDelegate<(nPrevValue: number, nNextValue: number) => void>;
        readonly AccountInfo: Share.IAccountInfo;
        readonly PlayerInfo: Share.IPlayerInfo;
        readonly Scene: Share.CBehavScene;
        readonly OnBeforeSwitchScene: Share.CDelegate<(oSceneCtrl: Share.CBehavSceneCtrl, oPrevScene: Share.CBehavScene, oNextScene: Share.CBehavScene) => void>;
        readonly OnAfterSwitchScene: Share.CDelegate<(oSceneCtrl: Share.CBehavSceneCtrl, oPrevScene: Share.CBehavScene, oNextScene: Share.CBehavScene) => void>;
        readonly HasMercenary2: boolean;
        wxLogin(code: string): Promise<Share.IErrorMsg<Share.IWxLoginRet>>;
        login(oArg: Share.ILoginArg): Promise<Share.IErrorMsg<any>>;
        logout(): Promise<Share.IErrorMsg<any>>;
        setGuaJiTimescale(value: number): void;
        createPlayer(strPlayerName: string): Promise<Share.IErrorMsg<any>>;
        enterWorld(nPlayerIndex: number, strInviterUID: string, strInviterAct?: string, shareType?: number): Promise<Share.IErrorMsg<any>>;
        leaveWorld(): Promise<Share.IErrorMsg<any>>;
        save(oPlayerInfo: Share.IPlayerInfo): Promise<Share.IErrorMsg<any>>;
        saveUserData(oPlayerInfo: Share.IPlayerInfo): Promise<Share.IErrorMsg<any>>;
        startRain(): Promise<Share.IErrorMsg<Share.IRpcStartRainRet>>;
        openTractor(): Promise<Share.IErrorMsg<any>>;
        gotoMarket(): Promise<Share.IErrorMsg<any>>;
        reborn(): Promise<Share.IErrorMsg<Share.IRpcRebornRet>>;
        upgradeProperty(nPropertyID: Share.EPropertyType, nTimes?: number): Promise<Share.IErrorMsg<Share.IRpcUpgradePropertyRet>>;
        buy(nShopID: number, nGoodsID: number, nCount?: number): Promise<Share.IErrorMsg<Share.IRpcBuyRet>>;
        claimOfflineReward(bDouble: boolean): Promise<Share.IErrorMsg<Share.IRpcClaimOfflineRewardRet>>;
        getOfflineReward(): number;
        claimInviteReward(nInviteAttrID: number): Promise<Share.IErrorMsg<Share.IRpcClaimInviteRewardRet>>;
        getInvitees(): Promise<Share.IErrorMsg<Share.IRpcGetInviteesRet>>;
        getInviteesByShareType(shareType: Share.EShareType, startTime: number, endTime: number): Promise<Share.IErrorMsg<Share.IRpcGetInviteesByShareTypeRet>>;
        reqAddFriend(playerAct: string): Promise<{}>;
        addFriend(playerAct: string): Promise<{}>;
        ignoreFriendRequest(playerAct: string): Promise<{}>;
        dali(playerAct: string): Promise<{}>;
        daoluan(playerAct: string): Promise<{}>;
        fire(playerAct: string): Promise<{}>;
        modifyMail(id: string, status: number): Promise<{}>;
        queryPlayer(playerAct: string): Promise<Share.IErrorMsg<Share.IQueryPlayerRet>>;
        queryUserData(playerAct: string): Promise<Share.IErrorMsg<Share.IQueryUserDataRet>>;
        getRandomUser(): Promise<Share.IErrorMsg<Share.IQueryUserDataRet>>;
        getTick(): Promise<Share.IErrorMsg<Share.IRpcGetTickRet>>;
    }
}
declare namespace ClientCore {
    class CBehavFriend extends Share.CUnitBehavior {
        private m_oBehavSession;
        constructor(oUnit: any);
        protected _awake(): void;
        getInvitees(): Promise<Share.IErrorMsg<Share.IRpcGetInviteesRet>>;
        getInviteesByShareType(shareType: Share.EShareType, startTime: number, endTime: number): Promise<Share.IErrorMsg<Share.IRpcGetInviteesByShareTypeRet>>;
        claimInviteReward(nInviteAttrID: number): Promise<Share.IErrorMsg<Share.IRpcClaimInviteRewardRet>>;
        reqAddFriend(playerAct: string): Promise<{}>;
        addFriend(playerAct: string): Promise<{}>;
        ignoreFriendRequest(playerAct: string): Promise<{}>;
        dali(playerAct: string): Promise<{}>;
        daoluan(playerAct: string): Promise<{}>;
        fire(playerAct: string): Promise<{}>;
    }
}
declare namespace ClientCore {
    class CBehavMail extends Share.CUnitBehavior {
        private m_oBehavSession;
        constructor(oUnit: any);
        protected _awake(): void;
        modifyMail(id: string, status: number): Promise<{}>;
    }
}
declare namespace ClientCore {
    class CBehavOffline extends Share.CUnitBehavior {
        private m_oBehavSession;
        private m_oBehavProperty;
        private m_oBehavPropertyCalc;
        constructor(oUnit: any);
        protected _awake(): void;
        claim(bDouble: boolean): Promise<Share.IErrorMsg<Share.IRpcClaimOfflineRewardRet>>;
        getOfflineReward(): number;
    }
}
declare namespace ClientCore {
    class CBehavPlayer extends Share.CUnitBehavior {
        private m_oPlayerInfo;
        private m_oBehavSession;
        private m_oBehavProperty;
        private m_oBehavPropertyCalc;
        private m_oSyncGuaJiExtExpTimer;
        private m_nDeltaGuaJiExtExp;
        constructor(s: Share.CUnit);
        protected _awake(): void;
        private _onGuaJiExtExpChanged(prevValue, nextValue);
        private _syncDeltaGuaJiExtExp(deltaValue);
        readonly BehavSession: CBehavSession;
        readonly PlayerInfo: Share.IPlayerInfo;
        BeSyncProperty(name: string, value: number | string): void;
        setPlayerInfo(oPlayerInfo: Share.IPlayerInfo): void;
        protected _destroy(): void;
        save(oPlayerInfo: Share.IPlayerInfo): Promise<Share.IErrorMsg<any>>;
        saveUserData(oPlayerInfo: Share.IPlayerInfo): Promise<Share.IErrorMsg<any>>;
        startRain(): Promise<Share.IErrorMsg<Share.IRpcStartRainRet>>;
        openTractor(): Promise<Share.IErrorMsg<any>>;
        gotoMarket(): Promise<Share.IErrorMsg<any>>;
    }
}
declare namespace ClientCore {
    class CBehavPlayerAttacker extends Share.CUnitBehavior {
        constructor(s: Share.CUnit);
    }
}
declare namespace ClientCore {
    class CBehavPlayerList extends Share.CUnitBehavior {
        private m_oBehavAccount;
        private m_oBehavSession;
        constructor(s: Share.CUnit);
        protected _awake(): void;
        readonly BehavSession: CBehavSession;
        getPlayerList(): string[];
        getPlayerCount(): number;
        createPlayer(strPlayerName?: string): Promise<Share.IErrorMsg<any>>;
    }
}
declare namespace ClientCore {
    class CBehavReborn extends Share.CUnitBehavior {
        private m_oBehavSession;
        constructor(oUnit: any);
        protected _awake(): void;
        reborn(): Promise<Share.IErrorMsg<Share.IRpcRebornRet>>;
    }
}
declare namespace ClientCore {
    class CBehavSession extends Share.CUnitBehavior {
        private m_oSession;
        private m_strUrl;
        private m_oClientCore;
        private m_bToClose;
        private m_onClosed;
        private m_strAccountName;
        private m_strSign;
        private m_strChannelToken;
        private m_oSessionUID;
        private m_oLastLoginSessionUID;
        private m_strSessionToken;
        private m_oBehavAccount;
        private m_oPingTimer;
        private m_onRelogin;
        private m_onKickout;
        private m_onInvite;
        private m_onFriendRequest;
        private m_onFriendResponse;
        private m_bKickouted;
        private m_inAreas;
        constructor(s: Share.CUnit, oClientCore: CBehavClientCore);
        readonly OnRelogin: Share.CDelegate<() => Promise<Share.IErrorMsg<any>>>;
        readonly SessionUID: Share.CObjResUID;
        readonly SessionToken: string;
        readonly InAreas: boolean;
        protected _awake(): void;
        readonly BehavAccount: CBehavAccount;
        readonly ClientCore: CBehavClientCore;
        readonly OnClosed: Share.CAsyncDelegate<() => void>;
        readonly OnInvite: Share.CDelegate<(data: Share.IPtcInviteArg) => Promise<Share.IErrorMsg<any>>>;
        readonly OnFriendRequest: Share.CDelegate<(data: Share.IPtcFriendRequestArg) => Promise<Share.IErrorMsg<any>>>;
        readonly OnFriendResponse: Share.CDelegate<(data: Share.IPtcAddFriendArg) => Promise<Share.IErrorMsg<any>>>;
        protected _destroy(): void;
        private _reconnect(times);
        private _connect();
        readonly isLogined: boolean;
        close(): void;
        isClosed(): boolean;
        private _restartPing();
        private _login();
        login(oArg: Share.ILoginArg): Promise<Share.IErrorMsg<CBehavAccount>>;
        logout(): Promise<Share.IErrorMsg<any>>;
        beKickout(): void;
        private _reLogin(bLogin?);
        onInvite(data: Share.IPtcInviteArg): void;
        onFriendRequest(data: Share.IPtcFriendRequestArg): void;
        onFriendResponse(data: Share.IPtcAddFriendArg): void;
        callRpc<T, U>(arg: Share.CProtocolArg<T>, timeoutMilliSeconds?: number): Promise<U>;
        sendPtc<T>(arg: Share.CProtocolArg<T>): void;
    }
}
declare namespace ClientCore {
    class CBehavShop extends Share.CUnitBehavior {
        private m_oBehavSession;
        constructor(oUnit: any);
        protected _awake(): void;
        buy(nShopID: number, nGoodsID: number, nCount?: number): Promise<Share.IErrorMsg<Share.IRpcBuyRet>>;
    }
}
declare namespace ClientCore {
    class CBehavUpgrade extends Share.CUnitBehavior {
        private m_oBehavSession;
        constructor(oUnit: any);
        protected _awake(): void;
        upgradeProperty(nPropertyID: Share.EPropertyType, nTimes?: number): Promise<Share.IErrorMsg<Share.IRpcUpgradePropertyRet>>;
    }
}
declare namespace ClientCore {
    class CBehavVirtualProperty extends Share.CUnitBehavior {
    }
}
declare namespace ClientCore {
    class CBehavWorldGate extends Share.CUnitBehavior {
        private m_oBehavAccount;
        private m_oBehavPlayer;
        private m_oBehavSession;
        private m_oBehavSceneCtrl;
        private m_nEnterWorldPlayerIndex;
        constructor(s: Share.CUnit);
        protected _awake(): void;
        private _onRelogin();
        enterWorld(nPlayerIndex: number, strInviterUID?: string, strInviterAct?: string, shareType?: number): Promise<Share.IErrorMsg<any>>;
        leaveWorld(): Promise<Share.IErrorMsg<any>>;
    }
}
declare namespace Share {
    interface IPtcInviteArg {
        avatar: string;
        invitee: string;
        inviteeAct: string;
        shareType: Share.EShareType;
        timestamp: number;
    }
    class CPtcInviteArg {
        readonly val: CProtocolArg<IPtcInviteArg>;
    }
}
