declare namespace Share {
    class CUnit {
        private m_oBehaviorList;
        private m_bIsDestroyed;
        constructor(...args: {
            BehaviorId: string;
            new (o: CUnit): CUnitBehavior;
        }[]);
        isDestroyed(): boolean;
        getComponent<T extends CUnitBehavior>(b: {
            BehaviorId: string;
            new (s: CUnit): T;
        }): T;
        destroy(): void;
    }
}
declare namespace Share {
    abstract class CUnitBehavior {
        private m_oOwner;
        private m_bIsDisabled;
        static readonly BehaviorId: string;
        constructor(s: CUnit);
        setDisable(bDisable: boolean): void;
        getComponent<T extends CUnitBehavior>(b: {
            BehaviorId: string;
            new (s: CUnit): T;
        }): T;
        destroy(): void;
        isDestroyed(): boolean;
        protected _awake(): void;
        protected _start(): void;
        protected _destroy(): void;
        protected _enable(): void;
        protected _disable(): void;
    }
}
declare namespace Share {
    enum EProtocolType {
        Login = 1,
        Logout = 2,
        Kickout = 3,
    }
}
declare namespace Share {
    type protocolClass = {
        onCall?: (data: any, oSession: CSession) => Promise<any>;
        onProcess?: (data: {}, oSession: CSession) => void;
    };
    class CProtocolMgr {
        private m_oControllers;
        registerController(c: protocolClass, eType: EProtocolType): void;
        getController(eType: EProtocolType): protocolClass;
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
        lastLoginTimestamp: number;
        lastLogoutTimestamp: number;
        createTimestamp: number;
        playerUIDs: string[];
    }
    interface ILoginRet extends IAccountInfo {
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
declare namespace Share {
    class CObjResInfo {
        m_oObjRes: IObjRes;
        m_nIndex: number;
        m_nCheckNum: number;
        m_oUID: CObjResUID;
    }
    class CObjResMgr<T extends IObjRes> {
        private m_oObjRes;
        private m_oFreeIndex;
        private m_nSize;
        private m_nSizeOfPool;
        private m_onObjConstructor;
        private m_onObjDestructor;
        constructor(nSizeOfPool: number, objConstructor: (nObjType: number) => T, objDestructor?: (oObj: T) => void);
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
    class COctStream {
        private m_oBuffer;
        private m_oDataView;
        private m_nSize;
        private m_nPopIndex;
        readonly Capacity: number;
        readonly Size: number;
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
    class CConsoleLogPrinter implements ILogPrinter {
        private _getTime();
        debug(...args: any[]): void;
        info(...args: any[]): void;
        warn(...args: any[]): void;
        error(...args: any[]): void;
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
        TryAgain = 9,
    }
    class CErrorMsgHelper {
        private errorMap;
        constructor();
        errorMessage<T>(errno: number, errmsg: string, ext?: T): IErrorMsg<T>;
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
        Marshal(oct: COctStream): void;
        UnMarshal(oct: COctStream): void;
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
    class CDelegate<T extends Function> {
        private m_oFuncList;
        static isNullOrEmpty(onDelegate: CDelegate<any>): boolean;
        isEmpty(): boolean;
        clear(): void;
        add(onFunc: T): void;
        remove(onFunc: T): void;
        invoke(...args: any[]): void;
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
    class CSession implements IObjRes {
        private m_oUId;
        private m_strToken;
        private m_nToRecvLen;
        private m_strRecvData;
        private m_oCloseTimer;
        private m_oSendReceiver;
        private m_onError;
        private m_onClose;
        private m_onUnBind;
        private m_oRpcTaskMgr;
        private m_oOwner;
        private m_oRemoteUid;
        private m_strRemoteToken;
        private m_strRemoteIp;
        private m_oUserData;
        constructor(owner: CSessionMgr);
        qconstructor(uid: CObjResUID): void;
        qdestructor(): void;
        getObjType(): number;
        getUID(): CObjResUID;
        getRemoteUID(): CObjResUID;
        getRemoteToken(): string;
        getUserData(): any;
        setUserData(oUserData: any): void;
        private _onRecv(data);
        getToken(): string;
        bind(oSendreceiver: ISendReceiver, oRemoteUid?: CObjResUID, strRemoteToken?: string, unbindCallback?: (oSendReceiver: ISendReceiver) => void): void;
        private _cancelClose();
        unbind(): void;
        getRemoteIp(): string;
        isClosed(): boolean;
        isClosing(): boolean;
        close(): void;
        closeAfter(nMilliSeconds: number): void;
        callRpc<T, U>(arg: CProtocolArg<T>, timeoutMilliSeconds?: number): Promise<U>;
        sendPtc<T>(arg: CProtocolArg<T>): void;
        onError(callback: (err: Error) => void): void;
        onClose(callback: () => void): void;
    }
}
declare namespace Share {
    class CSessionMgr {
        private m_oMgr;
        constructor();
        bind(oSendReceiver: ISendReceiveLinker, options?: {
            nAuthMilliSeconds?: number;
            bIsConnector?: boolean;
            oRemoteUid?: CObjResUID;
            strRemoteToken?: string;
        }, unbindCallback?: (oSendReceiver: ISendReceiveLinker) => void): Promise<CSession>;
        release(uid: CObjResUID): void;
        releaseAll(): void;
        get(uid: CObjResUID): CSession;
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
declare namespace ClientCore {
    class CAccount extends Share.CUnit {
        private m_oBehavAccount;
        constructor();
        readonly BehavAccount: CBehavAccount;
    }
}
declare namespace ClientCore {
    class CBehavAccount extends Share.CUnitBehavior {
        private m_oAccountInfo;
        constructor(s: Share.CUnit);
        readonly AccountInfo: Share.IAccountInfo;
        setAccountInfo(oAccountInfo: Share.IAccountInfo): void;
    }
}
declare namespace ClientCore {
    class CAllClientTable implements Share.IData {
        Marshal(oct: Share.COctStream): void;
        UnMarshal(oct: Share.COctStream): void;
    }
}
declare namespace ClientCore {
    class CBehavClientCore extends Share.CUnitBehavior {
        private m_oBehavSession;
        private m_oBehavLogin;
        private m_bUseHttps;
        readonly BehavSession: CBehavSession;
        readonly BehavLogin: CBehavLogin;
        readonly UseHttps: boolean;
        constructor(oUnit: any);
        protected _awake(): void;
        Init(): Promise<boolean>;
        Load(oArg: {
            gameServer: string;
            clientTable: CAllClientTable;
            useHttps: boolean;
        }): Promise<boolean>;
    }
}
declare namespace ClientCore {
    class CBehavLogin extends Share.CUnitBehavior {
        private m_oSession;
        private m_oAccount;
        constructor(s: Share.CUnit);
        protected _awake(): void;
        readonly Account: CBehavAccount;
        login(oArg: Share.ILoginArg): Promise<Share.IErrorMsg<CBehavAccount>>;
        logout(): Promise<Share.IErrorMsg<any>>;
        beKickout(): void;
        onSessionClose(): void;
    }
}
declare namespace ClientCore {
    class CBehavSession extends Share.CUnitBehavior {
        private m_oSession;
        private m_strUrl;
        private m_oRemoteUID;
        private m_strRemoteToken;
        private m_oClientCore;
        constructor(s: Share.CUnit);
        protected _awake(): void;
        readonly ClientCore: CBehavClientCore;
        setUrl(strUrl: string): void;
        connect(): Promise<Share.EErrorNo>;
        private _connect(bReconnect);
        close(): void;
        isClosed(): boolean;
        callRpc<T, U>(arg: Share.CProtocolArg<T>, timeoutMilliSeconds?: number): Promise<U>;
        sendPtc<T>(arg: Share.CProtocolArg<T>): void;
    }
}
declare namespace ClientCore {
    class CClientCore extends Share.CUnit {
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
