var Share;
(function (Share) {
    class CAsyncDelegate {
        constructor() {
            this.m_oDelegate = new Share.CDelegate();
        }
        static isNullOrEmpty(onDelegate) {
            return onDelegate == null || onDelegate.isEmpty();
        }
        isEmpty() {
            return this.m_oDelegate.isEmpty();
        }
        clear() {
            this.m_oDelegate.clear();
        }
        add(onFunc, self) {
            this.m_oDelegate.add(onFunc, self);
        }
        remove(onFunc) {
            this.m_oDelegate.remove(onFunc);
        }
        invoke(...args) {
            return Promise.resolve().then(() => {
                return this.m_oDelegate.invoke(...args);
            });
        }
    }
    Share.CAsyncDelegate = CAsyncDelegate;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CObjResNode {
        constructor() {
            this.m_oObjRes = null;
            this.m_oPrev = null;
            this.m_oNext = null;
        }
        get Data() {
            return this.m_oObjRes;
        }
        get Next() {
            return this.m_oNext;
        }
        get Prev() {
            return this.m_oPrev;
        }
    }
    Share.CObjResNode = CObjResNode;
    class CObjResInfo {
        constructor() {
            this.m_nIndex = 0;
            this.m_nCheckNum = 1;
            this.m_oData = new CObjResNode();
        }
    }
    class CObjResMgr {
        constructor(nSizeOfPool, objConstructor, objDestructor) {
            this.m_oObjRes = [];
            this.m_oFreeIndex = [];
            this.m_nSize = 0;
            this.m_nSizeOfPool = 0;
            this.m_oHead = new CObjResNode();
            this.m_oTail = new CObjResNode();
            this.m_nSizeOfPool = nSizeOfPool < 0 ? 0 : nSizeOfPool;
            this.m_onObjConstructor = objConstructor;
            this.m_onObjDestructor = objDestructor;
            this.m_oHead["m_oNext"] = this.m_oTail;
            this.m_oTail["m_oPrev"] = this.m_oHead;
        }
        begin() {
            return this.m_oHead.Next;
        }
        end() {
            return this.m_oTail;
        }
        rbegin() {
            return this.m_oTail.Prev;
        }
        rend() {
            return this.m_oHead;
        }
        getSize() {
            return this.m_nSize;
        }
        createObj(nObjType) {
            let oObjResInfo = null;
            if (nObjType >= this.m_oFreeIndex.length)
                this.m_oFreeIndex[nObjType] = new Share.CQueue();
            if (this.m_oFreeIndex[nObjType] == null)
                this.m_oFreeIndex[nObjType] = new Share.CQueue();
            let oObjectFreeIndexCache = this.m_oFreeIndex[nObjType];
            if (oObjectFreeIndexCache.isEmpty()) {
                oObjResInfo = new CObjResInfo();
                this.m_oObjRes.push(oObjResInfo);
                oObjResInfo.m_nIndex = this.m_oObjRes.length - 1;
                oObjResInfo.m_nCheckNum = 1;
            }
            else {
                let nFreeIndex = oObjectFreeIndexCache.pop();
                oObjResInfo = this.m_oObjRes[nFreeIndex];
                oObjResInfo.m_nIndex = nFreeIndex;
            }
            if (oObjResInfo.m_oData["m_oObjRes"] == null) {
                let t = oObjResInfo.m_oData["m_oObjRes"] = this.m_onObjConstructor(nObjType);
                if (t == null || t.getObjType() != nObjType)
                    throw "object type error";
            }
            oObjResInfo.m_oUID = Share.CObjResUIDHelper.toUID(oObjResInfo.m_nIndex, oObjResInfo.m_nCheckNum);
            ++this.m_nSize;
            let t = oObjResInfo.m_oData["m_oObjRes"];
            oObjResInfo.m_oData["m_oPrev"] = this.m_oTail.Prev;
            oObjResInfo.m_oData["m_oNext"] = this.m_oTail;
            this.m_oTail["m_oPrev"]["m_oNext"] = oObjResInfo.m_oData;
            this.m_oTail["m_oPrev"] = oObjResInfo.m_oData;
            t.qconstructor(oObjResInfo.m_oUID);
            return t;
        }
        getObj(oUID) {
            let oObjResInfo = this._getObjRes(oUID);
            if (null == oObjResInfo)
                return null;
            return oObjResInfo.m_oData["m_oObjRes"];
        }
        releaseObj(oUID) {
            let oObjResInfo = this._getObjRes(oUID);
            this._releaseObj(oObjResInfo);
        }
        releaseAll() {
            for (let i = 0; i != this.m_oObjRes.length; i++) {
                let oObjResInfo = this.m_oObjRes[i];
                this._releaseObj(oObjResInfo);
            }
        }
        _getObjRes(oUID) {
            let nIndex = Share.CObjResUIDHelper.toIndex(oUID);
            let nCheckNum = Share.CObjResUIDHelper.toCheckNum(oUID);
            if (nCheckNum == 0)
                return null;
            if (nIndex >= this.m_oObjRes.length)
                return null;
            let oRet = this.m_oObjRes[nIndex];
            if (oRet == null || oRet.m_nCheckNum != nCheckNum)
                return null;
            return oRet;
        }
        _releaseObj(oObjResInfo) {
            if (null == oObjResInfo || oObjResInfo.m_oData["m_oObjRes"] == null || Share.CObjResUID.isNullOrZero(oObjResInfo.m_oUID))
                return;
            let oObj = oObjResInfo.m_oData["m_oObjRes"];
            let nObjType = oObj.getObjType();
            oObj.qdestructor();
            --this.m_nSize;
            let nIndex = Share.CObjResUIDHelper.toIndex(oObjResInfo.m_oUID);
            oObjResInfo.m_oUID = Share.CObjResUIDHelper.toUID(0, 0);
            let oRet = this.m_oObjRes[nIndex];
            if (oRet.m_nCheckNum >= Share.CObjResUIDHelper.getMaxCheckNum())
                oRet.m_nCheckNum = 1;
            else
                ++oRet.m_nCheckNum;
            let oPrev = oObjResInfo.m_oData["m_oPrev"];
            let oNext = oObjResInfo.m_oData["m_oNext"];
            oPrev["m_oNext"] = oNext;
            oNext["m_oPrev"] = oPrev;
            oObjResInfo.m_oData["m_oNext"] = null;
            oObjResInfo.m_oData["m_oPrev"] = null;
            if (this.m_nSize >= this.m_nSizeOfPool) {
                oRet.m_oData["m_oObjRes"] = null;
            }
            this.m_oFreeIndex[nObjType].push(oRet.m_nIndex);
            oRet.m_nIndex = this.m_oFreeIndex[nObjType].getCount() - 1;
        }
    }
    Share.CObjResMgr = CObjResMgr;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CUnit {
        constructor(...args) {
            this.m_oBehaviorList = [];
            this.m_bIsDestroyed = false;
            this.m_oMsgReceiver = {};
            if (args != null && args.length != 0) {
                for (let i = 0; i != args.length; ++i) {
                    if (args[i]["length"] === undefined) {
                        let cubc = args[i];
                        let behav = cubc.c;
                        let t = new behav(this, ...cubc.args);
                        t["__BehavId"] = behav.BehaviorId;
                        t["__BehavLvl"] = i;
                        this[behav.BehaviorId] = t;
                        this.m_oBehaviorList.push(t);
                    }
                    else {
                        let u = args[i];
                        for (let j = 0; j != u.length; ++j) {
                            let behav = u[j].c;
                            let t = new behav(this, ...u[j].args);
                            t["__BehavId"] = behav.BehaviorId;
                            t["__BehavLvl"] = i;
                            this[behav.BehaviorId] = t;
                            this.m_oBehaviorList.push(t);
                        }
                    }
                }
            }
            for (let i = 0; i != this.m_oBehaviorList.length; ++i) {
                let t = this.m_oBehaviorList[i];
                t["_awake"].call(t);
            }
            for (let i = 0; i != this.m_oBehaviorList.length; ++i) {
                let t = this.m_oBehaviorList[i];
                t["_start"].call(t);
            }
        }
        isDestroyed() {
            return this.m_bIsDestroyed;
        }
        getComponent(b) {
            if (this.isDestroyed())
                return null;
            let t = this[b.BehaviorId];
            return t == null ? null : t;
        }
        destroy() {
            if (this.isDestroyed())
                return;
            this.m_bIsDestroyed = true;
            let aBehaviorList = this.m_oBehaviorList;
            setTimeout(() => {
                let nLen = aBehaviorList.length;
                for (let i = nLen - 1; i >= 0; --i)
                    aBehaviorList[i]['_destroy'].call(aBehaviorList[i]);
            }, 0);
        }
        sendMsg(oDst, nMsgId, ...args) {
            if (oDst == null)
                return;
            let oMsgReceiver = oDst.Unit.m_oMsgReceiver[nMsgId];
            if (oMsgReceiver == null)
                return;
            let onCallbak = oMsgReceiver[oDst["__BehavId"]];
            if (onCallbak == null)
                return;
            Promise.resolve().then(() => {
                onCallbak(this, args);
            });
        }
        sendMsgToUnit(oDst, nMsgId, ...args) {
            if (oDst == null)
                return;
            let oMsgReceiver = oDst.m_oMsgReceiver[nMsgId];
            if (oMsgReceiver == null)
                return;
            Promise.resolve().then(() => {
                for (var field in oMsgReceiver) {
                    let onCallbak = oMsgReceiver[field];
                    if (onCallbak == null)
                        continue;
                    onCallbak(this, args);
                }
            });
        }
    }
    Share.CUnit = CUnit;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CUnitBehavior {
        constructor(s) {
            this.m_bIsDisabled = false;
            this.m_oOwner = s;
        }
        static get BehaviorId() {
            if (this["s_nBehaviorId"] == null) {
                if (!CUnitBehavior["maxBehaviorId"])
                    CUnitBehavior["maxBehaviorId"] = 0;
                this["s_nBehaviorId"] = (++CUnitBehavior["maxBehaviorId"]).toString();
            }
            return this["s_nBehaviorId"];
        }
        get Unit() {
            return this.m_oOwner;
        }
        _registerMsg(nMsgId, onCallback) {
            let oMsgReceiver = this.m_oOwner["m_oMsgReceiver"];
            if (oMsgReceiver[nMsgId] == null)
                oMsgReceiver[nMsgId] = {};
            let t = oMsgReceiver[nMsgId];
            t[this["__BehavId"]] = onCallback;
        }
        setDisable(bDisable) {
            if (this.m_bIsDisabled == bDisable)
                return;
            this.m_bIsDisabled = bDisable;
            if (this.m_bIsDisabled) {
                setTimeout(() => {
                    this._disable();
                }, 0);
            }
            else {
                setTimeout(() => {
                    this._enable();
                }, 0);
            }
        }
        getComponent(b) {
            if (this.m_oOwner == null)
                return null;
            let t = this.m_oOwner.getComponent(b);
            if (t == null)
                return null;
            if (t["__BehavLvl"] > this["__BehavLvl"])
                throw new Error("Cannot get high level behavior");
            return this.m_oOwner.getComponent(b);
        }
        destroy() {
            this.m_oOwner.destroy();
        }
        isDestroyed() {
            return this.m_oOwner.isDestroyed();
        }
        isDisabled() {
            return this.isDestroyed() || this.m_bIsDisabled;
        }
        sendMsg(oDst, nMsgId, ...args) {
            return this.m_oOwner.sendMsg(oDst, nMsgId, args);
        }
        sendMsgToUnit(oDst, nMsgId, ...args) {
            return this.m_oOwner.sendMsgToUnit(oDst, nMsgId, args);
        }
        _awake() { }
        _start() { }
        _destroy() { }
        _enable() { }
        _disable() { }
    }
    Share.CUnitBehavior = CUnitBehavior;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CEffect {
        get UID() {
            return this.m_oUID;
        }
        qconstructor(oUID) {
            this.m_oUID = oUID;
        }
        qdestructor() {
            this.remove();
        }
        getObjType() {
            return;
        }
        isRemoved() {
            return this.m_bRemoved;
        }
        add(oBehavEffect, args) {
            this._onAdd(oBehavEffect, args);
        }
        remove() {
            if (this.isRemoved)
                return;
            this.m_bRemoved = true;
            this._onRemove();
        }
        isAddForever() {
            return this._isAddForever();
        }
    }
    Share.CEffect = CEffect;
})(Share || (Share = {}));
var Share;
(function (Share) {
    let EProtocolType;
    (function (EProtocolType) {
        EProtocolType[EProtocolType["Login"] = 1] = "Login";
        EProtocolType[EProtocolType["Logout"] = 2] = "Logout";
        EProtocolType[EProtocolType["Kickout"] = 3] = "Kickout";
        EProtocolType[EProtocolType["ReLogin"] = 4] = "ReLogin";
        EProtocolType[EProtocolType["EnterWorld"] = 5] = "EnterWorld";
        EProtocolType[EProtocolType["LeaveWorld"] = 6] = "LeaveWorld";
        EProtocolType[EProtocolType["CreatePlayer"] = 7] = "CreatePlayer";
        EProtocolType[EProtocolType["Ping"] = 8] = "Ping";
        EProtocolType[EProtocolType["FinishGuaJi"] = 9] = "FinishGuaJi";
        EProtocolType[EProtocolType["SyncProperty"] = 10] = "SyncProperty";
        EProtocolType[EProtocolType["UseBooster"] = 11] = "UseBooster";
        EProtocolType[EProtocolType["Reborn"] = 12] = "Reborn";
        EProtocolType[EProtocolType["UpgradeProperty"] = 13] = "UpgradeProperty";
        EProtocolType[EProtocolType["Buy"] = 14] = "Buy";
        EProtocolType[EProtocolType["SavePlayer"] = 15] = "SavePlayer";
        EProtocolType[EProtocolType["ClaimOfflineReward"] = 16] = "ClaimOfflineReward";
        EProtocolType[EProtocolType["ClaimInviteReward"] = 17] = "ClaimInviteReward";
        EProtocolType[EProtocolType["GetInvitees"] = 18] = "GetInvitees";
        EProtocolType[EProtocolType["Invite"] = 19] = "Invite";
        EProtocolType[EProtocolType["StartRain"] = 20] = "StartRain";
        EProtocolType[EProtocolType["QueryPlayer"] = 21] = "QueryPlayer";
        EProtocolType[EProtocolType["GetInviteesByShareType"] = 22] = "GetInviteesByShareType";
        EProtocolType[EProtocolType["OpenTractor"] = 23] = "OpenTractor";
        EProtocolType[EProtocolType["GotoMarket"] = 24] = "GotoMarket";
        EProtocolType[EProtocolType["SaveUserData"] = 25] = "SaveUserData";
        EProtocolType[EProtocolType["GetRandomUser"] = 26] = "GetRandomUser";
        EProtocolType[EProtocolType["FriendRequest"] = 27] = "FriendRequest";
        EProtocolType[EProtocolType["AddFriend"] = 28] = "AddFriend";
        EProtocolType[EProtocolType["QueryUserData"] = 29] = "QueryUserData";
        EProtocolType[EProtocolType["IgnoreFriendRequest"] = 30] = "IgnoreFriendRequest";
        EProtocolType[EProtocolType["DaLi"] = 31] = "DaLi";
        EProtocolType[EProtocolType["DaoLuan"] = 32] = "DaoLuan";
        EProtocolType[EProtocolType["Fire"] = 33] = "Fire";
        EProtocolType[EProtocolType["WxLogin"] = 34] = "WxLogin";
        EProtocolType[EProtocolType["GetAccessToken"] = 35] = "GetAccessToken";
        EProtocolType[EProtocolType["GetWXACodeUnlimit"] = 36] = "GetWXACodeUnlimit";
        EProtocolType[EProtocolType["ModifyMail"] = 37] = "ModifyMail";
        EProtocolType[EProtocolType["GetTick"] = 38] = "GetTick";
    })(EProtocolType = Share.EProtocolType || (Share.EProtocolType = {}));
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CProtocolMgr {
        constructor() {
            this.m_oControllers = [];
        }
        registerController(c, eType) {
            this.m_oControllers[eType] = c;
        }
        getController(eType) {
            return this.m_oControllers[eType];
        }
    }
    Share.CProtocolMgr = CProtocolMgr;
})(Share || (Share = {}));
var ClientCore;
(function (ClientCore) {
    class CUnitClientSession extends Share.CUnit {
        constructor(oClientCore) {
            super([Share.CUBC(ClientCore.CBehavSession, oClientCore), Share.CUBC(ClientCore.CBehavAccount), Share.CUBC(ClientCore.CBehavPlayerList), Share.CUBC(ClientCore.CBehavPlayer), Share.CUBC(ClientCore.CBehavWorldGate), Share.CUBC(Share.CBehavSceneCtrl),
                Share.CUBC(Share.CBehavEffect), Share.CUBC(Share.CBehavProperty), Share.CUBC(Share.CBehavPropertyCalc),
                Share.CUBC(ClientCore.CBehavReborn), Share.CUBC(ClientCore.CBehavUpgrade), Share.CUBC(ClientCore.CBehavShop),
                Share.CUBC(ClientCore.CBehavOffline), Share.CUBC(ClientCore.CBehavFriend), Share.CUBC(ClientCore.CBehavMail), Share.CUBC(ClientCore.CBehavClientSessionInterface)]);
            this.m_oInterface = this.getComponent(ClientCore.CBehavClientSessionInterface);
        }
        get BehavInterface() {
            return this.m_oInterface;
        }
    }
    ClientCore.CUnitClientSession = CUnitClientSession;
})(ClientCore || (ClientCore = {}));
var Share;
(function (Share) {
    class COctStream {
        constructor() {
            this.m_oBuffer = new Uint8Array(16);
            this.m_oDataView = new DataView(this.m_oBuffer.buffer);
            this.m_nSize = 0;
            this.m_nPopIndex = 0;
        }
        get Capacity() {
            return this.m_oBuffer === null ? 0 : this.m_oBuffer.byteLength;
        }
        get Size() {
            return this.m_nSize;
        }
        get Buffer() {
            return this.m_oBuffer;
        }
        Assign(oData, begin, size) {
            if (!begin)
                begin = 0;
            if (!size)
                size = oData ? oData.length : 0;
            if (size == 0) {
                this.Clear();
                return;
            }
            this.m_oBuffer = oData.subarray(begin, begin + size);
            this.m_oDataView = new DataView(this.m_oBuffer.buffer);
            this.m_nSize = size;
            this.m_nPopIndex = 0;
        }
        Clear() {
            this.m_nSize = 0;
            this.m_nPopIndex = 0;
        }
        Reserve(nCapacity) {
            if (nCapacity <= this.Capacity)
                return;
            let oNewBuffer = new Uint8Array(nCapacity);
            oNewBuffer.set(this.m_oBuffer);
            this.m_oBuffer = oNewBuffer;
            this.m_oDataView = new DataView(this.m_oBuffer.buffer);
        }
        Resize(nSize) {
            let nCapacity = this.Capacity;
            if (nSize <= nCapacity) {
                this.m_nSize = nSize;
                return;
            }
            this.Reserve(nCapacity * 2 > nSize ? nCapacity * 2 : nSize);
            this.m_nSize = nSize;
        }
        pushUInt8(val) {
            let nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 1);
            this.m_oDataView.setUint8(nOffset, val);
            return this;
        }
        pushInt8(val) {
            let nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 1);
            this.m_oDataView.setInt8(nOffset, val);
            return this;
        }
        pushUInt16(val) {
            let nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 2);
            this.m_oDataView.setUint16(nOffset, val, true);
            return this;
        }
        pushInt16(val) {
            let nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 2);
            this.m_oDataView.setInt16(nOffset, val, true);
            return this;
        }
        pushUInt32(val) {
            let nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 4);
            this.m_oDataView.setUint32(nOffset, val, true);
            return this;
        }
        pushInt32(val) {
            let nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 4);
            this.m_oDataView.setInt32(nOffset, val, true);
            return this;
        }
        pushUInt64(val) {
            let nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 8);
            this.m_oDataView.setUint32(nOffset, val.getLowBits(), true);
            this.m_oDataView.setUint32(nOffset + 4, val.getHighBits(), true);
            return this;
        }
        pushInt64(val) {
            let nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 8);
            this.m_oDataView.setUint32(nOffset, val.getLowBits(), true);
            this.m_oDataView.setUint32(nOffset + 4, val.getHighBits(), true);
            return this;
        }
        pushFloat(val) {
            let nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 4);
            this.m_oDataView.setFloat32(nOffset, val, true);
            return this;
        }
        pushDouble(val) {
            let nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 8);
            this.m_oDataView.setFloat64(nOffset, val, true);
            return this;
        }
        pushString(val) {
            let oBytes = Share.CUtf8Encoding.Encode(val);
            let nLen = oBytes.length;
            let nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 4 + oBytes.length);
            this.m_oDataView.setUint32(nOffset, nLen, true);
            nOffset += 4;
            this.m_oBuffer.set(oBytes, nOffset);
            return this;
        }
        pushData(val) {
            val.marshal(this);
            return this;
        }
        popUInt8() {
            let val = this.m_oDataView.getUint8(this.m_nPopIndex++);
            return val;
        }
        popInt8() {
            let val = this.m_oDataView.getInt8(this.m_nPopIndex++);
            return val;
        }
        popUInt16() {
            let val = this.m_oDataView.getUint16(this.m_nPopIndex, true);
            this.m_nPopIndex += 2;
            return val;
        }
        popInt16() {
            let val = this.m_oDataView.getInt16(this.m_nPopIndex, true);
            this.m_nPopIndex += 2;
            return val;
        }
        popUInt32() {
            let val = this.m_oDataView.getUint32(this.m_nPopIndex, true);
            this.m_nPopIndex += 4;
            return val;
        }
        popInt32() {
            let val = this.m_oDataView.getInt32(this.m_nPopIndex, true);
            this.m_nPopIndex += 4;
            return val;
        }
        popUInt64() {
            let low = this.m_oDataView.getUint32(this.m_nPopIndex, true);
            this.m_nPopIndex += 4;
            let high = this.m_oDataView.getUint32(this.m_nPopIndex, true);
            this.m_nPopIndex += 4;
            return new Share.CInt64(low, high);
        }
        popInt64() {
            let low = this.m_oDataView.getUint32(this.m_nPopIndex, true);
            this.m_nPopIndex += 4;
            let high = this.m_oDataView.getUint32(this.m_nPopIndex, true);
            this.m_nPopIndex += 4;
            return new Share.CInt64(low, high);
        }
        popFloat() {
            let val = this.m_oDataView.getFloat32(this.m_nPopIndex, true);
            this.m_nPopIndex += 4;
            return val;
        }
        popDouble() {
            let val = this.m_oDataView.getFloat64(this.m_nPopIndex, true);
            this.m_nPopIndex += 8;
            return val;
        }
        popString() {
            let nLen = this.popUInt32();
            let strData = Share.CUtf8Encoding.Decode(this.m_oBuffer, this.m_nPopIndex, nLen);
            this.m_nPopIndex += nLen;
            return strData;
        }
        popData(val) {
            val.unMarshal(this);
        }
        toString() {
            if (this.Size === 0)
                return "";
            let str = Share.CUtf8Encoding.Decode(this.m_oBuffer, 0, this.Size);
            return str;
        }
    }
    Share.COctStream = COctStream;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CPromiseHelper {
        static resolve(value) {
            return Promise.resolve(value);
        }
        static reject(error) {
            return Promise.reject(error);
        }
        static all(values) {
            return Promise.all(values);
        }
        static race(promises) {
            return Promise.race(promises);
        }
        static delay(millseconds) {
            let cb;
            let oPromise = new Promise(function (resolve, reject) {
                cb = function (err, data) {
                    if (err == null)
                        resolve(data);
                    else
                        reject(err);
                };
            });
            setTimeout(function () {
                cb(null, null);
            }, millseconds);
            return oPromise;
        }
        static createPromise() {
            let cb;
            let oPromise = new Promise(function (resolve, reject) {
                cb = function (err, data) {
                    if (err == null)
                        resolve(data);
                    else
                        reject(err);
                };
            });
            return {
                callback: cb,
                promise: oPromise
            };
        }
        static promisify(func, self) {
            return function () {
                var args = [];
                for (var i = 0; i < arguments.length; i++)
                    args.push(arguments[i]);
                var cb;
                var promise = new Promise(function (resolve, reject) {
                    cb = function (err, data) {
                        if (err == null)
                            resolve(data);
                        else
                            reject(err);
                    };
                });
                func.apply((self ? self : this), args.concat(cb));
                return promise;
            };
        }
    }
    Share.CPromiseHelper = CPromiseHelper;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CQueue {
        constructor() {
            this.m_aList = [];
            this.m_nBegin = 0;
            this.m_nEnd = 0;
            this.reserve(2);
        }
        reserve(nCapacity) {
            let nRealCapacity = nCapacity + 1;
            if (nRealCapacity <= this.m_aList.length)
                return;
            let dwCurCount = this.getCount();
            let aNewList = [];
            for (let i = this.m_nBegin; i != this.m_nEnd; i = (i + 1) % this.m_aList.length) {
                let value = this.m_aList[i];
                aNewList.push(value);
            }
            aNewList[nRealCapacity - 1] = null;
            this.m_aList = aNewList;
            this.m_nBegin = 0;
            this.m_nEnd = dwCurCount;
        }
        at(nIndex) {
            if ((!this.m_aList) || nIndex < 0 || nIndex >= this.getCount())
                throw "out of range";
            return this.m_aList[(this.m_nBegin + nIndex) % this.m_aList.length];
        }
        set(nIndex, oValue) {
            if ((!this.m_aList) || nIndex < 0 || nIndex >= this.getCount())
                throw "out of range";
            this.m_aList[(this.m_nBegin + nIndex) % this.m_aList.length] = oValue;
        }
        clear() {
            this.m_nEnd = this.m_nBegin = 0;
            this.m_aList = [];
        }
        pop() {
            let ret = this.at(0);
            this.m_aList[this.m_nBegin] = undefined;
            this.m_nBegin = (this.m_nBegin + 1) % this.m_aList.length;
            return ret;
        }
        push(oItem) {
            if (this.isFull())
                this.reserve(2 * this.getCount());
            this.m_aList[this.m_nEnd] = oItem;
            this.m_nEnd = (this.m_nEnd + 1) % this.m_aList.length;
            return oItem;
        }
        getCount() {
            return this.m_nEnd < this.m_nBegin ? this.m_aList.length - this.m_nBegin + this.m_nEnd : this.m_nEnd - this.m_nBegin;
        }
        isEmpty() {
            return this.m_nBegin == this.m_nEnd;
        }
        isFull() {
            return (this.m_nEnd + 1) % this.m_aList.length == this.m_nBegin;
        }
    }
    Share.CQueue = CQueue;
})(Share || (Share = {}));
var Share;
(function (Share) {
    function CSingleton(c) {
        return c.__singleton$ ? c.__singleton$ : (c.__singleton$ = new c());
    }
    Share.CSingleton = CSingleton;
})(Share || (Share = {}));
var Share;
(function (Share) {
    const aTimeOffsets = [100, 10100, 1010100, 101010100, 10101010100];
    const nTimeSize = aTimeOffsets[0];
    class CTimer {
        constructor() {
            this.m_bDestroyed = false;
        }
        get isDestroyed() {
            return this.m_bDestroyed;
        }
        destroy() {
            this.m_bDestroyed = true;
        }
    }
    Share.CTimer = CTimer;
    class CTimerMgr {
        constructor() {
            this.m_nTimeScale = 1;
            this.m_oTimers = [];
            this.m_oExtTimers = [];
            this.m_nCurTime = 0;
            this.m_nDeltaTime = 0;
            this.m_onFrameLoopFunc = (nDeltaTime) => {
                if (nDeltaTime <= 0 || this.m_nTimeScale <= 0)
                    return;
                this.m_nDeltaTime += nDeltaTime * this.m_nTimeScale;
                while (this.m_nDeltaTime >= nDeltaTime) {
                    this._execTimer();
                    this.m_nDeltaTime -= nDeltaTime;
                    this.m_nCurTime += nDeltaTime;
                }
            };
        }
        static create(oFrameLoop, nBaseTime = 0) {
            let oObj = this.m_oObjMgr.createObj(0);
            oObj._init(oFrameLoop, nBaseTime);
            return oObj;
        }
        static release(oTimerMgr) {
            oTimerMgr && this.m_oObjMgr.releaseObj(oTimerMgr.m_oUID);
        }
        static global() {
            if (this.m_oGlobalTimerMgr == null) {
                this.m_oGlobalTimerMgr = CTimerMgr.create(Share.CSingleton(Share.CFrameLoopTimerImpl));
            }
            return this.m_oGlobalTimerMgr;
        }
        get CurTime() {
            return this.m_nCurTime;
        }
        get TimeScale() {
            return this.m_nTimeScale;
        }
        set TimeScale(nValue) {
            this.m_nTimeScale = nValue < 0 ? 0 : nValue;
        }
        _execTimer() {
            if (this.m_oTimers.length === 0)
                return;
            let oTimers = this.m_oTimers[0];
            if (oTimers == null)
                return;
            for (; this.m_nCurTime >= oTimers.endTime - nTimeSize + oTimers.offset; this._tick(0)) {
                let oTimerFuncs = oTimers.execInfo;
                let execFunc = oTimerFuncs[oTimers.offset];
                if (execFunc == null)
                    continue;
                for (let i = 0; i != execFunc.length; ++i)
                    execFunc[i].execFunc();
            }
        }
        _tick(level) {
            if (level >= this.m_oTimers.length)
                return;
            if (level < 0)
                level = 0;
            let curTimers = this.m_oTimers[level];
            let preExecInfo = curTimers.execInfo[curTimers.offset];
            if (preExecInfo)
                curTimers.execInfo[curTimers.offset] = null;
            let timeInterval = level === 0 ? aTimeOffsets[level] : aTimeOffsets[level] - aTimeOffsets[level - 1];
            let nStep = ((aTimeOffsets[level] - (level === 0 ? 0 : aTimeOffsets[level - 1])) / nTimeSize) | 0;
            if (level === 0 && curTimers.offset >= curTimers.execInfo.length) {
                if (this.m_nCurTime >= curTimers.endTime)
                    curTimers.offset = nTimeSize - 1;
                else
                    curTimers.offset = ((this.m_nCurTime + timeInterval - curTimers.endTime) / nStep) | 0;
            }
            curTimers.offset++;
            if (curTimers.offset < nTimeSize)
                return;
            curTimers.offset = 0;
            curTimers.endTime = curTimers.endTime + timeInterval;
            curTimers.execInfo = [];
            if (level === this.m_oTimers.length - 1) {
                let nLen = this.m_oExtTimers.length;
                let aExtTimers = this.m_oExtTimers;
                this.m_oExtTimers = [];
                for (let i = 0; i != nLen; ++i) {
                    this._addTimerExecFunc(aExtTimers[i].execTime, aExtTimers[i].execFunc);
                }
                return;
            }
            let oNextTimers = this.m_oTimers[level + 1];
            let oNextTimer = oNextTimers.execInfo[oNextTimers.offset];
            this._tick(level + 1);
            if (oNextTimer == null)
                return;
            let beginTime = curTimers.endTime - timeInterval;
            for (let i = 0; i != oNextTimer.length; ++i) {
                let execInfo = oNextTimer[i];
                let offset = ((execInfo.execTime - beginTime) / nStep) | 0;
                if (curTimers.execInfo[offset] == null)
                    curTimers.execInfo[offset] = [];
                curTimers.execInfo[offset].push(execInfo);
            }
        }
        _init(oFrameLoop, nBaseTime) {
            let nLen = aTimeOffsets.length;
            this.m_oTimers = [];
            for (let i = 0; i != nLen; ++i) {
                this.m_oTimers.push({
                    endTime: nBaseTime + aTimeOffsets[i],
                    offset: 0,
                    execInfo: []
                });
            }
            this.m_oExtTimers = [];
            this.m_oFrameLoop = oFrameLoop;
            this.m_oFrameLoop.onFrame.add(this.m_onFrameLoopFunc);
        }
        qconstructor(oUID) {
            this.m_oUID = oUID;
        }
        qdestructor() {
            this.m_oUID = null;
            this.m_nCurTime = 0;
            this.m_oTimers = [];
            this.m_oExtTimers = [];
            this.m_nTimeScale = 1;
            if (this.m_oFrameLoop) {
                this.m_oFrameLoop.onFrame.remove(this.m_onFrameLoopFunc);
                this.m_oFrameLoop = null;
            }
        }
        getObjType() {
            return 0;
        }
        start(nMilliSeconds, onCallback, nCount = 0, nFirstMilliSeconds = nMilliSeconds) {
            let oTimer = new CTimer();
            let nCurrent = 0;
            let nCurTime = this.m_nCurTime;
            let func = () => {
                if (oTimer.isDestroyed)
                    return;
                onCallback(nCurrent++, nCount);
                if ((nCount === 0 || nCurrent < nCount) && !oTimer.isDestroyed)
                    this._addTimerExecFunc(nCurTime + nFirstMilliSeconds + nMilliSeconds * nCurrent, func);
                else
                    oTimer.destroy();
            };
            this._addTimerExecFunc(nCurTime + nFirstMilliSeconds, func);
            return oTimer;
        }
        startOnce(nMilliSeconds, onCallback) {
            return this.start(nMilliSeconds, onCallback, 1, nMilliSeconds);
        }
        startForever(nMilliSeconds, onCallback, nFirstMilliSeconds = nMilliSeconds) {
            return this.start(nMilliSeconds, onCallback, 0, nFirstMilliSeconds);
        }
        stop(oTimer) {
            oTimer.destroy();
        }
        _addTimerExecFunc(execTime, func) {
            let bAdd = false;
            for (let level = 0; level != this.m_oTimers.length; ++level) {
                let curTimers = this.m_oTimers[level];
                if (execTime >= curTimers.endTime)
                    continue;
                bAdd = true;
                let beginTime = curTimers.endTime - (level === 0 ? aTimeOffsets[level] : aTimeOffsets[level] - aTimeOffsets[level - 1]);
                let nStep = ((aTimeOffsets[level] - (level === 0 ? 0 : aTimeOffsets[level - 1])) / nTimeSize) | 0;
                let offset = ((execTime - beginTime) / nStep) | 0;
                if (curTimers.execInfo[offset] == null)
                    curTimers.execInfo[offset] = [];
                curTimers.execInfo[offset].push({
                    execTime: execTime,
                    execFunc: func
                });
                break;
            }
            if (!bAdd) {
                this.m_oExtTimers.push({
                    execTime: execTime,
                    execFunc: func
                });
            }
        }
    }
    CTimerMgr.m_oObjMgr = new Share.CObjResMgr(0, (nObjType) => {
        return new CTimerMgr();
    });
    Share.CTimerMgr = CTimerMgr;
})(Share || (Share = {}));
var Share;
(function (Share) {
    function CUBC(c, ...args) {
        return {
            c: c,
            args: args
        };
    }
    Share.CUBC = CUBC;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CDelegate {
        constructor() {
            this.m_oFuncList = new Share.CLinkedList();
        }
        static isNullOrEmpty(onDelegate) {
            return onDelegate == null || onDelegate.isEmpty();
        }
        isEmpty() {
            return this.m_oFuncList.count() == 0;
        }
        clear() {
            this.m_oFuncList.clear();
        }
        add(onFunc, self) {
            if (onFunc == null)
                return;
            this.m_oFuncList.insertBefore(this.m_oFuncList.end(), { func: onFunc, self: self });
        }
        remove(onFunc) {
            if (onFunc == null)
                return;
            let end = this.m_oFuncList.end();
            for (let node = this.m_oFuncList.begin(); node != end; node = node.getNext()) {
                if (node.data.func === onFunc) {
                    this.m_oFuncList.remove(node);
                    break;
                }
            }
        }
        invoke(...args) {
            let end = this.m_oFuncList.end();
            let self = this;
            let ret = [];
            (function () {
                for (let node = self.m_oFuncList.begin(); node != end;) {
                    let data = node.data;
                    node = node.getNext();
                    if (data.self)
                        ret.push(data.func.apply(data.self, args));
                    else
                        ret.push(data.func.apply(this, args));
                }
            })();
            return ret;
        }
    }
    Share.CDelegate = CDelegate;
})(Share || (Share = {}));
var Share;
(function (Share) {
    let EErrorNo;
    (function (EErrorNo) {
        EErrorNo[EErrorNo["Fail"] = -1] = "Fail";
        EErrorNo[EErrorNo["Success"] = 0] = "Success";
        EErrorNo[EErrorNo["InvalidArguments"] = 1] = "InvalidArguments";
        EErrorNo[EErrorNo["InvalidSQL"] = 2] = "InvalidSQL";
        EErrorNo[EErrorNo["InvalidOperation"] = 3] = "InvalidOperation";
        EErrorNo[EErrorNo["ConnectFailed"] = 4] = "ConnectFailed";
        EErrorNo[EErrorNo["Timeout"] = 5] = "Timeout";
        EErrorNo[EErrorNo["ServerOffline"] = 6] = "ServerOffline";
        EErrorNo[EErrorNo["InvalidToken"] = 7] = "InvalidToken";
        EErrorNo[EErrorNo["InvalidSession"] = 8] = "InvalidSession";
        EErrorNo[EErrorNo["Logining"] = 9] = "Logining";
        EErrorNo[EErrorNo["Logouting"] = 10] = "Logouting";
        EErrorNo[EErrorNo["TryAgain"] = 11] = "TryAgain";
        EErrorNo[EErrorNo["SessionClosed"] = 12] = "SessionClosed";
        EErrorNo[EErrorNo["BehaviorDisabled"] = 13] = "BehaviorDisabled";
        EErrorNo[EErrorNo["Connected"] = 14] = "Connected";
        EErrorNo[EErrorNo["InvalidLevel"] = 15] = "InvalidLevel";
        EErrorNo[EErrorNo["NoEnoughItem"] = 16] = "NoEnoughItem";
        EErrorNo[EErrorNo["LowLevel"] = 17] = "LowLevel";
        EErrorNo[EErrorNo["PrerequisitesAreNotMet"] = 18] = "PrerequisitesAreNotMet";
        EErrorNo[EErrorNo["RepeatRequest"] = 19] = "RepeatRequest";
        EErrorNo[EErrorNo["AlreadyFriend"] = 20] = "AlreadyFriend";
    })(EErrorNo = Share.EErrorNo || (Share.EErrorNo = {}));
    class CErrorMsgHelper {
        constructor() {
            this.errorMap = [];
            this.errorMap[EErrorNo.InvalidArguments] = "Invalid Arguments";
            this.errorMap[EErrorNo.InvalidSQL] = "Invalid SQL";
            this.errorMap[EErrorNo.InvalidOperation] = "Invalid Operation";
            this.errorMap[EErrorNo.ConnectFailed] = "Connect Failed";
            this.errorMap[EErrorNo.Timeout] = "Timeout";
            this.errorMap[EErrorNo.ServerOffline] = "ServerOffline";
            this.errorMap[EErrorNo.InvalidToken] = "InvalidToken";
            this.errorMap[EErrorNo.InvalidSession] = "InvalidSession";
            this.errorMap[EErrorNo.TryAgain] = "Try again";
            this.errorMap[EErrorNo.SessionClosed] = "Session Closed";
            this.errorMap[EErrorNo.BehaviorDisabled] = "Behavior Disabled";
            this.errorMap[EErrorNo.Connected] = "Connected";
            this.errorMap[EErrorNo.InvalidLevel] = "InvalidLevel";
            this.errorMap[EErrorNo.NoEnoughItem] = "No enough item";
            this.errorMap[EErrorNo.LowLevel] = "Low level";
            this.errorMap[EErrorNo.PrerequisitesAreNotMet] = "Prerequisites are not met";
        }
        createErrorMsg(errno, errmsg, ext) {
            var t = {
                errno: errno ? errno : 0,
                errmsg: errmsg ? errmsg : ""
            };
            if (ext != null)
                t['ext'] = ext;
            return t;
        }
        errorMsg(errno, ext) {
            var t = {
                errno: errno ? errno : 0,
                errmsg: this.errorMap[errno] ? this.errorMap[errno] : ""
            };
            if (ext != null)
                t['ext'] = ext;
            return t;
        }
        successMsg(ext) {
            var t = {
                errno: 0,
                errmsg: ""
            };
            if (ext != null)
                t['ext'] = ext;
            return t;
        }
        toErrorMsg(err) {
            if (err == null)
                return this.successMsg();
            if (err.errno == null)
                return this.errorMsg(-1, err.toString());
            return err;
        }
    }
    Share.CErrorMsgHelper = CErrorMsgHelper;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CObjResUIDHelper {
        static toUID(nIndex, nCheckNum) {
            return new CObjResUID(nIndex, nCheckNum);
        }
        static toIndex(uid) {
            return uid.m_nIndex;
        }
        static toCheckNum(uid) {
            return uid.m_nCheckNum;
        }
        static getMaxIndex() {
            return (1 << CObjResUIDHelper.s_nIndexLen) - 1;
        }
        static getMaxCheckNum() {
            return (1 << CObjResUIDHelper.s_nCheckNumLen) - 1;
        }
    }
    CObjResUIDHelper.s_nIndexLen = 30;
    CObjResUIDHelper.s_nCheckNumLen = 22;
    Share.CObjResUIDHelper = CObjResUIDHelper;
    class CObjResUID {
        constructor(nIndex, nCheckNum) {
            this.m_nIndex = 0;
            this.m_nCheckNum = 0;
            this.m_nIndex = nIndex;
            this.m_nCheckNum = nCheckNum;
        }
        static isNullOrZero(oUID) {
            return oUID == null || oUID.isZero();
        }
        isZero() {
            return this.m_nCheckNum == 0 && this.m_nIndex == 0;
        }
        valueOf() {
            return this.m_nIndex * (CObjResUIDHelper.getMaxCheckNum() + 1) + this.m_nCheckNum;
        }
        toString() {
            return this.valueOf().toString();
        }
    }
    Share.CObjResUID = CObjResUID;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CUtf8Encoding {
        static _index(index, arr) {
            if (index < 0 || index >= arr.length) {
                throw new Error("IndexOutOfRangeException");
            }
            return index;
        }
        static _identity(x) {
            return x;
        }
        static Encode(s) {
            var outputBytes = null;
            var outputIndex = 0;
            var writtenBytes = {};
            var hasBuffer = outputBytes != null;
            var record = 0;
            var write = function (args) {
                var len = args.length;
                for (var j = 0; j < len; j = (j + 1) | 0) {
                    var code = args[this._index(j, args)];
                    if (hasBuffer) {
                        if (outputIndex >= outputBytes.length) {
                            throw new Error("ArgumentException bytes");
                        }
                        outputBytes[this._index(this._identity(outputIndex, (outputIndex = (outputIndex + 1) | 0)), outputBytes)] = code;
                    }
                    else {
                        outputBytes.push(code);
                    }
                    record = (record + 1) | 0;
                }
            };
            if (!hasBuffer) {
                outputBytes = [];
            }
            for (var i = 0; i < s.length; i = (i + 1) | 0) {
                var charcode = s.charCodeAt(i);
                if ((charcode >= 55296) && (charcode <= 56319)) {
                    var next = s.charCodeAt(((i + 1) | 0));
                    if (!((next >= 56320) && (next <= 57343))) {
                        charcode = CUtf8Encoding.fallbackCharacter;
                    }
                }
                else if ((charcode >= 56320) && (charcode <= 57343)) {
                    charcode = CUtf8Encoding.fallbackCharacter;
                }
                if (charcode < 128) {
                    write([charcode]);
                }
                else if (charcode < 2048) {
                    write([(192 | (charcode >> 6)), (128 | (charcode & 63))]);
                }
                else if (charcode < 55296 || charcode >= 57344) {
                    write([(224 | (charcode >> 12)), (128 | ((charcode >> 6) & 63)), (128 | (charcode & 63))]);
                }
                else {
                    i = (i + 1) | 0;
                    var code = (65536 + (((charcode & 1023) << 10) | (s.charCodeAt(i) & 1023))) | 0;
                    write([(240 | (code >> 18)), (128 | ((code >> 12) & 63)), (128 | ((code >> 6) & 63)), (128 | (code & 63))]);
                }
            }
            writtenBytes.v = record;
            if (hasBuffer) {
                return null;
            }
            return new Uint8Array(outputBytes);
        }
        static Decode(bytes, index, count) {
            index = index != null ? index : 0;
            count = count != null ? count : bytes.byteLength;
            var chars = null;
            var charIndex = 0;
            var position = index;
            var result = "";
            var surrogate1 = 0;
            var addFallback = false;
            var endpoint = (position + count) | 0;
            for (; position < endpoint; position = (position + 1) | 0) {
                var accumulator = 0;
                var extraBytes = 0;
                var hasError = false;
                var firstByte = bytes[this._index(position, bytes)];
                if (firstByte <= 127) {
                    accumulator = firstByte;
                }
                else if ((firstByte & 64) === 0) {
                    hasError = true;
                }
                else if ((firstByte & 224) === 192) {
                    accumulator = firstByte & 31;
                    extraBytes = 1;
                }
                else if ((firstByte & 240) === 224) {
                    accumulator = firstByte & 15;
                    extraBytes = 2;
                }
                else if ((firstByte & 248) === 240) {
                    accumulator = firstByte & 7;
                    extraBytes = 3;
                }
                else if ((firstByte & 252) === 248) {
                    accumulator = firstByte & 3;
                    extraBytes = 4;
                    hasError = true;
                }
                else if ((firstByte & 254) === 252) {
                    accumulator = firstByte & 3;
                    extraBytes = 5;
                    hasError = true;
                }
                else {
                    accumulator = firstByte;
                    hasError = false;
                }
                while (extraBytes > 0) {
                    position = (position + 1) | 0;
                    if (position >= endpoint) {
                        hasError = true;
                        break;
                    }
                    var extraByte = bytes[this._index(position, bytes)];
                    extraBytes = (extraBytes - 1) | 0;
                    if ((extraByte & 192) !== 128) {
                        position = (position - 1) | 0;
                        hasError = true;
                        break;
                    }
                    accumulator = (accumulator << 6) | (extraByte & 63);
                }
                var characters = null;
                addFallback = false;
                if (!hasError) {
                    if (surrogate1 > 0 && !((accumulator >= 56320) && (accumulator <= 57343))) {
                        hasError = true;
                        surrogate1 = 0;
                    }
                    else if ((accumulator >= 55296) && (accumulator <= 56319)) {
                        surrogate1 = accumulator & 65535;
                    }
                    else if ((accumulator >= 56320) && (accumulator <= 57343)) {
                        hasError = true;
                        addFallback = true;
                        surrogate1 = 0;
                    }
                    else {
                        characters = (accumulator > 65535 ? (accumulator -= 65536,
                            String.fromCharCode(55296 + (accumulator >> 10), 56320
                                + (accumulator & 1023))) : String.fromCharCode(accumulator));
                        surrogate1 = 0;
                    }
                }
                if (hasError) {
                    if (this.throwOnInvalid) {
                        throw new Error("Invalid character in UTF8 text");
                    }
                    result = (result || "") + String.fromCharCode(this.fallbackCharacter);
                }
                else if (surrogate1 === 0) {
                    result = (result || "") + (characters || "");
                }
            }
            if (surrogate1 > 0 || addFallback) {
                if (this.throwOnInvalid) {
                    throw new Error("Invalid character in UTF8 text");
                }
                if (result.length > 0 && result.charCodeAt(((result.length - 1) | 0)) === this.fallbackCharacter) {
                    result = (result || "") + String.fromCharCode(this.fallbackCharacter);
                }
                else {
                    result = (result || "") + (((this.fallbackCharacter + this.fallbackCharacter) | 0));
                }
            }
            return result;
        }
    }
    CUtf8Encoding.fallbackCharacter = 65533;
    Share.CUtf8Encoding = CUtf8Encoding;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CAllClientTable {
        constructor() {
            this.m_oGlobalConfigMgr = new Share.CGlobalConfigData();
            this.m_oShareSwitchMgr = new Share.CShareSwitchData();
            this.m_oFramLandAttrMgr = new Share.CFarmLandAttrMgrData();
            this.m_oCropAttrMgr = new Share.CCropAttrMgrData();
            this.m_oUnitAttrMgr = new Share.CUnitAttrMgrData();
            this.m_oTechAttrMgr = new Share.CTechAttrMgrData();
            this.m_oInviteAttrMgr = new Share.CInviteAttrMgrData();
            this.m_oFarmSkinAttrMgr = new Share.CFarmSkinAttrMgrData();
            this.m_oFarmAttrMgr = new Share.CFarmAttrMgrData();
            this.m_oGemItemAttrMgr = new Share.CGemItemAttrMgrData();
            this.m_oUnlockAttrMgr = new Share.CUnlockAttrMgrData();
            this.m_oWheelAttrMgr = new Share.CWheelAttrMgrData();
            this.m_oSevenDaysAttrMgr = new Share.CSevenDaysAttrMgrData();
            this.m_oInviteClintAttrMgr = new Share.CInviteClientAttrMgrData();
            this.m_oAutoRewardAttrMgr = new Share.CAutoRewardAttrMgrData();
            this.m_oJobAttrMgr = new Share.CJobAttrMgrData();
            this.m_oFarmerAttrMgr = new Share.CFarmerAttrMgrData();
            this.m_oGuideTaskAttrMgr = new Share.CGuideTaskAttrMgrData();
            this.m_oDialogueAttrMgr = new Share.CDialogueAttrMgrData();
            this.m_oTreasureFirstAttrMgr = new Share.CTreasureFirstAttrMgrData();
            this.m_oTreasureSecondAttrMgr = new Share.CTreasureSecondAttrMgrData();
            this.m_oBubbleFirstAttrMgr = new Share.CBubbleFirstAttrMgrData();
            this.m_oBubbleSecondAttrMgr = new Share.CBubbleSecondAttrMgrData();
            this.m_oProvinceAttrMgr = new Share.CProvinceAttrMgrData();
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                if (this[field] == null)
                    continue;
                this[field] = obj[field];
            }
        }
    }
    Share.CAllClientTable = CAllClientTable;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CAutoRewardAttr {
        constructor() {
            this.id = 0;
            this.rate = 0;
            this.seed = 0;
            this.specialcrop = 0;
            this.gem = 0;
            this.woodbox = 0;
            this.goldbox = 0;
        }
    }
    Share.CAutoRewardAttr = CAutoRewardAttr;
    class CAutoRewardAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        get(id) {
            return this.m_oMgrData.m_oData[id];
        }
        get data() {
            return this.m_oMgrData.m_oData;
        }
        get list() {
            return this.m_oMgrData.m_lData;
        }
    }
    Share.CAutoRewardAttrMgr = CAutoRewardAttrMgr;
    class CAutoRewardAttrMgrData {
        constructor() {
            this.m_oData = {};
            this.m_lData = [];
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CAutoRewardAttrMgrData = CAutoRewardAttrMgrData;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CBubbleFirstAttr {
        constructor() {
            this.id = 0;
            this.name = "";
            this.type = 0;
            this.count = 0;
            this.number = 0;
            this.contribution = 0;
            this.game = 0;
            this.share = 0;
            this.video = 0;
            this.official = 0;
            this.prop = 0;
            this.itemId = 0;
        }
    }
    Share.CBubbleFirstAttr = CBubbleFirstAttr;
    class CBubbleFirstAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        get(id) {
            return this.m_oMgrData.m_oData[id];
        }
        get data() {
            return this.m_oMgrData.m_oData;
        }
        get list() {
            return this.m_oMgrData.m_lData;
        }
    }
    Share.CBubbleFirstAttrMgr = CBubbleFirstAttrMgr;
    class CBubbleFirstAttrMgrData {
        constructor() {
            this.m_oData = {};
            this.m_lData = [];
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CBubbleFirstAttrMgrData = CBubbleFirstAttrMgrData;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CBubbleSecondAttr {
        constructor() {
            this.id = 0;
            this.content = "";
            this.type = 0;
            this.prop = 0;
            this.desc = "";
            this.voice = "";
        }
    }
    Share.CBubbleSecondAttr = CBubbleSecondAttr;
    class CBubbleSecondAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        get(id) {
            return this.m_oMgrData.m_oData[id];
        }
        get data() {
            return this.m_oMgrData.m_oData;
        }
        get list() {
            return this.m_oMgrData.m_lData;
        }
    }
    Share.CBubbleSecondAttrMgr = CBubbleSecondAttrMgr;
    class CBubbleSecondAttrMgrData {
        constructor() {
            this.m_oData = {};
            this.m_lData = [];
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CBubbleSecondAttrMgrData = CBubbleSecondAttrMgrData;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CCropAttr {
        constructor() {
            this.id = 0;
            this.name = "";
            this.lvupcost = 0;
            this.lvcostunit = "";
            this.producttime = 0;
            this.halflv = 0;
            this.baseproduct = 0;
            this.prounit = "";
            this.farmlandid = 0;
            this.itembg = "";
            this.spine = "";
            this.unlocklv = 0;
            this.share = 0;
            this.percent = 0;
            this.tips = "";
            this.enable = 0;
            this.probability = 0;
            this.type = 0;
            this.harvest = "";
            this.cash = 0;
            this.ordercrop = 0;
            this.orderneed = "";
            this.gem = 0;
            this.from = "";
            this.proname = "";
            this.videocrop = 0;
            this.officer = 0;
        }
    }
    Share.CCropAttr = CCropAttr;
    class CCropAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        get(id) {
            return this.m_oMgrData.m_oCrops[id];
        }
        get data() {
            return this.m_oMgrData.m_oCrops;
        }
        get list() {
            return this.m_oMgrData.m_aCrops;
        }
    }
    Share.CCropAttrMgr = CCropAttrMgr;
    class CCropAttrMgrData {
        constructor() {
            this.m_oCrops = {};
            this.m_aCrops = [];
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CCropAttrMgrData = CCropAttrMgrData;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CDialogueAttr {
        constructor() {
            this.id = 0;
            this.dialogue = "";
            this.audio = "";
            this.position_x = 0;
            this.position_y = 0;
        }
    }
    Share.CDialogueAttr = CDialogueAttr;
    class CDialogueAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        get(id) {
            return this.m_oMgrData.m_oData[id];
        }
        get data() {
            return this.m_oMgrData.m_oData;
        }
        get list() {
            return this.m_oMgrData.m_lData;
        }
    }
    Share.CDialogueAttrMgr = CDialogueAttrMgr;
    class CDialogueAttrMgrData {
        constructor() {
            this.m_oData = {};
            this.m_lData = [];
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CDialogueAttrMgrData = CDialogueAttrMgrData;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CFarmAttr {
        constructor() {
            this.id = 0;
            this.skinadd = 0;
            this.needgold = 0;
            this.needgoldunit = "";
            this.tractortimes = 0;
            this.seedlimit = 0;
            this.seedlimitunit = "";
            this.openfarm = 0;
            this.openfarmunit = "";
            this.skinname = "";
            this.skindes = "";
            this.job = "";
            this.level = "";
            this.quality = 0;
            this.pond = 0;
            this.icon = 0;
        }
    }
    Share.CFarmAttr = CFarmAttr;
    class CFarmAttrMgrData {
        constructor() {
            this.m_oData = {};
            this.m_lData = [];
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CFarmAttrMgrData = CFarmAttrMgrData;
    class CFarmAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        get(id) {
            return this.m_oMgrData.m_oData[id];
        }
        get data() {
            return this.m_oMgrData.m_oData;
        }
        get list() {
            return this.m_oMgrData.m_lData;
        }
    }
    Share.CFarmAttrMgr = CFarmAttrMgr;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CFarmerAttr {
        constructor() {
            this.id = 0;
            this.workstate = "";
            this.effect = 0;
            this.worktime = 0;
            this.rate = 0;
            this.farmerX = 0;
            this.price = 0;
        }
    }
    Share.CFarmerAttr = CFarmerAttr;
    class CFarmerAttrMgrData {
        constructor() {
            this.m_oData = {};
            this.m_lData = [];
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CFarmerAttrMgrData = CFarmerAttrMgrData;
    class CFarmerAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        get(id) {
            return this.m_oMgrData.m_oData[id];
        }
        get data() {
            return this.m_oMgrData.m_oData;
        }
        get list() {
            return this.m_oMgrData.m_lData;
        }
    }
    Share.CFarmerAttrMgr = CFarmerAttrMgr;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CFarmLandAttr {
        constructor() {
            this.id = 0;
            this.crops = [];
            this.landcostunit = "";
            this.landunlockcost = 0;
        }
    }
    Share.CFarmLandAttr = CFarmLandAttr;
    class CFarmLandAttrMgrData {
        constructor() {
            this.m_oFarmLands = {};
            this.m_lData = [];
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CFarmLandAttrMgrData = CFarmLandAttrMgrData;
    class CFarmLandAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        get(id) {
            return this.m_oMgrData.m_oFarmLands[id];
        }
        get data() {
            return this.m_oMgrData.m_oFarmLands;
        }
        get list() {
            return this.m_oMgrData.m_lData;
        }
    }
    Share.CFarmLandAttrMgr = CFarmLandAttrMgr;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CFarmSkinAttr {
        constructor() {
            this.id = 0;
            this.skinadd = 0;
            this.skinname = "";
            this.skindes = "";
            this.price = 0;
            this.times = 0;
            this.onshow = 0;
        }
    }
    Share.CFarmSkinAttr = CFarmSkinAttr;
    class CFarmSkinAttrMgrData {
        constructor() {
            this.m_oData = {};
            this.m_lData = [];
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CFarmSkinAttrMgrData = CFarmSkinAttrMgrData;
    class CFarmSkinAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        get(id) {
            return this.m_oMgrData.m_oData[id];
        }
        get data() {
            return this.m_oMgrData.m_oData;
        }
        get list() {
            return this.m_oMgrData.m_lData;
        }
    }
    Share.CFarmSkinAttrMgr = CFarmSkinAttrMgr;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CGemItemAttr {
        constructor() {
            this.id = 0;
            this.itemname = "";
            this.effect = 0;
            this.des = "";
            this.gemcost = 0;
            this.limit = 0;
        }
    }
    Share.CGemItemAttr = CGemItemAttr;
    class CGemItemAttrMgrData {
        constructor() {
            this.m_oData = {};
            this.m_lData = [];
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CGemItemAttrMgrData = CGemItemAttrMgrData;
    class CGemItemAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        get(id) {
            return this.m_oMgrData.m_oData[id];
        }
        get data() {
            return this.m_oMgrData.m_oData;
        }
        get list() {
            return this.m_oMgrData.m_lData;
        }
    }
    Share.CGemItemAttrMgr = CGemItemAttrMgr;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CGlobalConfigAttr {
        constructor() {
            this.appid = "";
            this.secret = "";
            this.heartlimit = 0;
            this.ShareRandom = 0;
            this.notice = "";
            this.initialgem = 0;
            this.initialgold = 0;
            this.initialseed = 0;
            this.seedprofit = 0;
            this.invitecloudtime = 0;
            this.farmertime = 0;
            this.initialcloudtime = 0;
            this.farmercontinue = 0;
            this.gopherInterval = 0;
            this.newrewardtype = 0;
            this.newbeereward = "0";
            this.tractorinvite = 0;
            this.sliverbox = 0;
            this.goldbox = 0;
            this.sliverboxnum = 0;
            this.goldboxnum = 0;
            this.woodbox = 0;
            this.tractortimenew = "0";
            this.woodboxrate = "0";
            this.gopherreward = 0;
            this.gophertime = 0;
            this.sliverboxCD = 0;
            this.goldboxCD = 0;
            this.cropunlocknum = 0;
            this.coppernum = 0;
            this.slivernum = 0;
            this.goldnum = 0;
            this.firstgold = 0;
            this.copperproduct = 0;
            this.sliverproduct = 0;
            this.goldproduct = 0;
            this.purchasegift1 = 0;
            this.purchasegift2 = 0;
            this.purchasegift3 = 0;
            this.mooncard1gem = 0;
            this.mooncard2gem = 0;
            this.mooncard1box = 0;
            this.mooncard2box = 0;
            this.redpocket = 0;
            this.newredpocket = 0;
            this.bigredpocket = 0;
            this.sharefriend = 0;
            this.sharefriendbig = "0";
            this.sharefriendcrop = 0;
            this.timedgift1invite = 0;
            this.timedgift2invite = 0;
            this.timedgift3invite = 0;
            this.timedgifttrigger = 0;
            this.timedgift1reward = "0";
            this.timedgift2reward = "0";
            this.timedgift3reward1 = "0";
            this.timedgift3reward2 = "0";
            this.goldshare = "0";
            this.goldsharetimes = 0;
            this.goldshareover = 0;
            this.npcfarmland = "0";
            this.npcfarmlandlv = 0;
            this.freegemsperday = 0;
            this.freegemsdays = 0;
            this.freegemstimes = 0;
            this.noticetime = 0;
            this.treasuremaptrigger = 0;
            this.treasuremaprand = "0";
            this.treasuremapsbox = "0";
            this.treasuremaplbox = "0";
            this.treasuremapclick1 = 0;
            this.treasuremapclick2 = 0;
            this.treasurecropid = 0;
            this.publicaccountgems = 0;
            this.stealgold = "0";
            this.maketroublegold = "0";
            this.tendlimit = 0;
            this.friendlimit = 0;
            this.energygift = 0;
            this.energybiggift = 0;
            this.newplayerenergy = 0;
            this.energylimit = 0;
            this.energyrecovery = 0;
            this.maketroublefriend = 0;
            this.maketroubleenemy = 0;
            this.helpgold = "0";
            this.treasuremaptime = 0;
            this.redheart = 0;
            this.blackheart = 0;
            this.gohpergemlimit = 0;
            this.energyfastcost = 0;
            this.jobclickreward = 0;
            this.sharegold = 0;
            this.sharegoldtimes = 0;
            this.newbuildlv = 0;
            this.sharegoldmin = 0;
            this.sharegoldclose = 0;
            this.balloonclick = 0;
            this.appinfo = "";
            this.balloontime = 0;
            this.farmerlimit = 0;
            this.jobclicktime = 0;
            this.wheelpiece = 0;
            this.moblieappid = "";
            this.mobliename = "";
            this.hirefriendtimes = 0;
            this.friendjob = 0;
            this.tractorCDgem = 0;
            this.balloonmiss = 0;
            this.platinumnum = 0;
            this.platinumproduct = 0;
            this.platinumunlock = 0;
            this.goldA = 0;
            this.goldB = 0;
            this.goldC = 0;
            this.goldD = 0;
            this.platinumA = 0;
            this.platinumB = 0;
            this.platinumC = 0;
            this.platinumD = 0;
            this.timedgiftskin = 0;
            this.clearSize = 0;
            this.orderrandom = 0;
            this.orderCD = 0;
            this.claimlimit = 0;
            this.claimclicktime = 0;
            this.callbackreward = "";
            this.callbacktime = 0;
            this.activeplayerreward = "";
            this.backreward = "";
            this.guoyuanappid = "";
            this.IOSshare = "";
            this.ANDshare = "";
            this.sharetimea = 0;
            this.IOSsharedaily2 = "";
            this.ANDsharedaily2 = "";
            this.orderCDclear = 0;
            this.harvesttime = 0;
            this.gemsharevideo = 0;
            this.gemsharedata1 = "";
            this.gemsharedata2 = "";
            this.gemsharedata2config = "";
            this.gemsharedata1configday1 = "";
            this.gemsharedata1configday2 = "";
            this.gemshareCD = 0;
            this.gemsharevideolimit = 0;
            this.yunvideolimit = 0;
            this.autorewardrate = 0;
            this.autorewardcd = 0;
            this.autorewardlimit = 0;
            this.bubbleshowCD = 0;
            this.bubbleduring = 0;
            this.bubblefirstduring = 0;
            this.totalvideolimit = 0;
            this.shareaward = "";
            this.shareawardlimit = 0;
        }
    }
    Share.CGlobalConfigAttr = CGlobalConfigAttr;
    class CGlobalConfigData {
        constructor() {
            this.m_oAttr = new CGlobalConfigAttr();
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CGlobalConfigData = CGlobalConfigData;
    class CGlobalConfigMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        get Data() {
            return this.m_oMgrData.m_oAttr;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
    }
    Share.CGlobalConfigMgr = CGlobalConfigMgr;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CGuideTaskAttr {
        constructor() {
            this.id = 0;
            this.taskdes = "";
            this.data = 0;
        }
    }
    Share.CGuideTaskAttr = CGuideTaskAttr;
    class CGuideTaskAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        get(id) {
            return this.m_oMgrData.m_oData[id];
        }
        get data() {
            return this.m_oMgrData.m_oData;
        }
        get list() {
            return this.m_oMgrData.m_lData;
        }
    }
    Share.CGuideTaskAttrMgr = CGuideTaskAttrMgr;
    class CGuideTaskAttrMgrData {
        constructor() {
            this.m_oData = {};
            this.m_lData = [];
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CGuideTaskAttrMgrData = CGuideTaskAttrMgrData;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CInviteAttr {
        constructor() {
            this.id = 0;
            this.Count = 0;
            this.AddPropertyID = [];
            this.AddValue = [];
            this.Title = "";
            this.Desc = "";
        }
    }
    Share.CInviteAttr = CInviteAttr;
    class CInviteAttrMgrData {
        constructor() {
            this.m_oAttrs = {};
            this.length = 0;
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CInviteAttrMgrData = CInviteAttrMgrData;
    class CInviteAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        getAllInviteAttrs() {
            return this.m_oMgrData.m_oAttrs;
        }
        getInviteAttr(nInviteID) {
            return this.m_oMgrData.m_oAttrs[nInviteID];
        }
    }
    Share.CInviteAttrMgr = CInviteAttrMgr;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CInviteClientAttr {
        constructor() {
            this.id = 0;
            this.invite = 0;
            this.gem = 0;
            this.radish = 0;
        }
    }
    Share.CInviteClientAttr = CInviteClientAttr;
    class CInviteClientAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        get(id) {
            return this.m_oMgrData.m_oData[id];
        }
        get data() {
            return this.m_oMgrData.m_oData;
        }
        get list() {
            return this.m_oMgrData.m_lData;
        }
    }
    Share.CInviteClientAttrMgr = CInviteClientAttrMgr;
    class CInviteClientAttrMgrData {
        constructor() {
            this.m_oData = {};
            this.m_lData = [];
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CInviteClientAttrMgrData = CInviteClientAttrMgrData;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CJobAttr {
        constructor() {
            this.id = 0;
            this.jobname = "";
            this.jobdes = "";
            this.jobnum = 0;
        }
    }
    Share.CJobAttr = CJobAttr;
    class CJobAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        get(id) {
            return this.m_oMgrData.m_oData[id];
        }
        get data() {
            return this.m_oMgrData.m_oData;
        }
        get list() {
            return this.m_oMgrData.m_lData;
        }
    }
    Share.CJobAttrMgr = CJobAttrMgr;
    class CJobAttrMgrData {
        constructor() {
            this.m_oData = {};
            this.m_lData = [];
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CJobAttrMgrData = CJobAttrMgrData;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CProvinceAttr {
        constructor() {
            this.id = 0;
            this.province = "";
            this.label = "";
        }
    }
    Share.CProvinceAttr = CProvinceAttr;
    class CProvinceAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        get(id) {
            return this.m_oMgrData.m_oData[id];
        }
        get data() {
            return this.m_oMgrData.m_oData;
        }
        get list() {
            return this.m_oMgrData.m_lData;
        }
    }
    Share.CProvinceAttrMgr = CProvinceAttrMgr;
    class CProvinceAttrMgrData {
        constructor() {
            this.m_oData = {};
            this.m_lData = [];
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CProvinceAttrMgrData = CProvinceAttrMgrData;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CSevenDaysAttr {
        constructor() {
            this.id = 0;
            this.gem = 0;
            this.goldhour = 0;
            this.woodbox = 0;
            this.goldbox = 0;
        }
    }
    Share.CSevenDaysAttr = CSevenDaysAttr;
    class CSevenDaysAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        get(id) {
            return this.m_oMgrData.m_oData[id];
        }
        get data() {
            return this.m_oMgrData.m_oData;
        }
        get list() {
            return this.m_oMgrData.m_lData;
        }
    }
    Share.CSevenDaysAttrMgr = CSevenDaysAttrMgr;
    class CSevenDaysAttrMgrData {
        constructor() {
            this.m_oData = {};
            this.m_lData = [];
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CSevenDaysAttrMgrData = CSevenDaysAttrMgrData;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CShareSwitchAttr {
        constructor() {
            this.SHARE_FRIENDS = true;
            this.SHARE_PROMOTION = true;
            this.SHARE_ORDER = true;
            this.SEVEN_LOGIN = true;
            this.DIAMOND_REDPACK = true;
            this.SHARE_OFF_LINE = true;
            this.SHARE_OLD_MAN = true;
            this.NEWPLAYER_GUIDE = true;
            this.FUNCTION_GUIDE = true;
            this.LIMIT_GIFT = true;
            this.NOVICE_SHARE = true;
            this.NOVICE_SHARE_SWITCH = true;
            this.NOVICE_GEM = true;
            this.NOVICE_GEM_SWITCH = true;
            this.TREASURE_SWITCH = true;
            this.MAIL_SWITCH = true;
            this.GIFT_CODE_SWITCH = true;
            this.SOCIAL_SWITCH = true;
            this.TURNTABLE_SWITCH = true;
            this.FOLLOW_REWARD_SWITCH = true;
            this.ENERGY_SWITCH = true;
            this.SHARE_SWITCH = true;
            this.SCENE_MOVE = true;
            this.EMPOLYEE_SWITCH = true;
            this.zhishengFX = true;
            this.queqianFX = true;
            this.BALLOON = true;
            this.EXCHANGE = true;
            this.PRIVATE_CHAT = true;
            this.SHARE_FORBID = false;
            this.COMMIT_FILE_SIZE = true;
            this.CLEAR_CACHE = true;
            this.OLD_USER_REGRESS = true;
            this.GARDEN_SWITCH = true;
            this.Mondayshare = true;
            this.BOX_VIDEO = true;
        }
    }
    Share.CShareSwitchAttr = CShareSwitchAttr;
    class CShareSwitchData {
        constructor() {
            this.m_oAttr = new CShareSwitchAttr();
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = !!obj[field];
            }
        }
    }
    Share.CShareSwitchData = CShareSwitchData;
    class CShareSwitchMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        get Data() {
            return this.m_oMgrData.m_oAttr;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
    }
    Share.CShareSwitchMgr = CShareSwitchMgr;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CTechAttr {
        constructor() {
            this.id = 0;
            this.type = 0;
            this.icon = 0;
            this.name = "";
            this.level = "";
            this.des = "";
            this.effect = 0;
            this.effecttype = 0;
            this.costtype = 0;
            this.techcost = 0;
            this.techcostunit = "";
            this.landunlock = 0;
            this.nexttech = 0;
            this.farmlandid = 0;
            this.lasttech = 0;
        }
    }
    Share.CTechAttr = CTechAttr;
    class CTechAttrMgrData {
        constructor() {
            this.m_oData = {};
            this.m_lData = [];
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CTechAttrMgrData = CTechAttrMgrData;
    class CTechAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        get(id) {
            return this.m_oMgrData.m_oData[id];
        }
        get data() {
            return this.m_oMgrData.m_oData;
        }
        get list() {
            return this.m_oMgrData.m_lData;
        }
    }
    Share.CTechAttrMgr = CTechAttrMgr;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CTreasureFirstAttr {
        constructor() {
            this.id = 0;
            this.min = 0;
            this.max = 0;
            this.one = 0;
            this.two = 0;
            this.three = 0;
            this.four = 0;
            this.five = 0;
        }
    }
    Share.CTreasureFirstAttr = CTreasureFirstAttr;
    class CTreasureFirstAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        get(id) {
            return this.m_oMgrData.m_oData[id];
        }
        get data() {
            return this.m_oMgrData.m_oData;
        }
        get list() {
            return this.m_oMgrData.m_lData;
        }
    }
    Share.CTreasureFirstAttrMgr = CTreasureFirstAttrMgr;
    class CTreasureFirstAttrMgrData {
        constructor() {
            this.m_oData = {};
            this.m_lData = [];
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CTreasureFirstAttrMgrData = CTreasureFirstAttrMgrData;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CTreasureSecondAttr {
        constructor() {
            this.id = 0;
            this.storeroom = 0;
            this.goodsId = 0;
            this.num = 0;
            this.weight = 0;
        }
    }
    Share.CTreasureSecondAttr = CTreasureSecondAttr;
    class CTreasureSecondAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        get(id) {
            return this.m_oMgrData.m_oData[id];
        }
        get data() {
            return this.m_oMgrData.m_oData;
        }
        get list() {
            return this.m_oMgrData.m_lData;
        }
    }
    Share.CTreasureSecondAttrMgr = CTreasureSecondAttrMgr;
    class CTreasureSecondAttrMgrData {
        constructor() {
            this.m_oData = {};
            this.m_lData = [];
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CTreasureSecondAttrMgrData = CTreasureSecondAttrMgrData;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CUnitAttr {
        constructor() {
            this.id = 0;
            this.name = "";
            this.nameunit = "";
            this.percent = [];
            this.unit = "";
        }
    }
    Share.CUnitAttr = CUnitAttr;
    class CUnitAttrMgrData {
        constructor() {
            this.m_oData = {};
            this.m_lData = [];
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CUnitAttrMgrData = CUnitAttrMgrData;
    class CUnitAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        get(id) {
            return this.m_oMgrData.m_oData[id];
        }
        get data() {
            return this.m_oMgrData.m_oData;
        }
        get list() {
            return this.m_oMgrData.m_lData;
        }
    }
    Share.CUnitAttrMgr = CUnitAttrMgr;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CUnlockAttr {
        constructor() {
            this.id = 0;
            this.tips = "";
            this.farmland = 0;
            this.lvcostunit = "";
            this.harvesttimes = 0;
            this.movetimes = 0;
            this.close = 0;
        }
    }
    Share.CUnlockAttr = CUnlockAttr;
    class CUnlockAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        get(id) {
            return this.m_oMgrData.m_oData[id];
        }
        get data() {
            return this.m_oMgrData.m_oData;
        }
        get list() {
            return this.m_oMgrData.m_lData;
        }
    }
    Share.CUnlockAttrMgr = CUnlockAttrMgr;
    class CUnlockAttrMgrData {
        constructor() {
            this.m_oData = {};
            this.m_lData = [];
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CUnlockAttrMgrData = CUnlockAttrMgrData;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CWheelAttr {
        constructor() {
            this.id = 0;
            this.prob = 0;
            this.type = 0;
            this.data = 0;
        }
    }
    Share.CWheelAttr = CWheelAttr;
    class CWheelAttrMgr {
        constructor() {
            this.m_oMgrData = null;
        }
        init(oMgrData) {
            this.m_oMgrData = oMgrData;
        }
        get(id) {
            return this.m_oMgrData.m_oData[id];
        }
        get data() {
            return this.m_oMgrData.m_oData;
        }
        get list() {
            return this.m_oMgrData.m_lData;
        }
    }
    Share.CWheelAttrMgr = CWheelAttrMgr;
    class CWheelAttrMgrData {
        constructor() {
            this.m_oData = {};
            this.m_lData = [];
        }
        marshal(oct) {
            oct.pushString(JSON.stringify(this));
        }
        unMarshal(oct) {
            let obj = JSON.parse(oct.popString());
            for (let field in obj) {
                this[field] = obj[field];
            }
        }
    }
    Share.CWheelAttrMgrData = CWheelAttrMgrData;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CBattleSceneFrameLoop {
        constructor(nIntervalMilliSeconds = 10) {
            this.onFrame = new Share.CDelegate();
            this.m_oBaseTimerMgr = Share.CTimerMgr.global();
            this.m_nIntervalMilliSeconds = nIntervalMilliSeconds;
            this._frameLoop();
        }
        _frameLoop() {
            this.m_oTimer = this.m_oBaseTimerMgr.startForever(this.m_nIntervalMilliSeconds, () => {
                this.onFrame.invoke(this.m_nIntervalMilliSeconds);
            });
        }
        stop() {
            if (this.m_oTimer) {
                this.m_oTimer.destroy();
                this.m_oTimer = null;
            }
        }
    }
    Share.CBattleSceneFrameLoop = CBattleSceneFrameLoop;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CBehavEffect extends Share.CUnitBehavior {
        constructor(oUnit) {
            super(oUnit);
        }
        _awake() {
            if (null == CBehavEffect.m_aEffectConstructors) {
                CBehavEffect.m_aEffectConstructors = [];
                CBehavEffect.m_aEffectConstructors[Share.EEffectType.AddProperty] = Share.CEffectAddProperty;
            }
            this.m_oEffectMgr = new Share.CObjResMgr(0, (nObjType) => {
                let con = CBehavEffect.m_aEffectConstructors[nObjType];
                if (con == null)
                    return null;
                return new con();
            });
        }
        add(eEffectType, args) {
            let oEffect = this.m_oEffectMgr.createObj(eEffectType);
            if (null == oEffect)
                return null;
            oEffect.add(this, args);
            if (oEffect.isAddForever())
                this.m_oEffectMgr.releaseObj(oEffect.UID);
            return oEffect.UID;
        }
        remove(oEffectUID) {
            this.m_oEffectMgr.releaseObj(oEffectUID);
        }
    }
    Share.CBehavEffect = CBehavEffect;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CBehavProperty extends Share.CUnitBehavior {
        constructor(oUnit) {
            super(oUnit);
            this.m_onPropertyChanged = new Share.CAsyncDelegate();
            this.m_onPropertyRegistered = new Share.CAsyncDelegate();
            this.m_aPropertyContainers = [];
        }
        get OnPropertyChanged() {
            return this.m_onPropertyChanged;
        }
        get OnPropertyRegistered() {
            return this.m_onPropertyRegistered;
        }
        register(eType, container) {
            this.m_aPropertyContainers[eType] = container;
            this.m_onPropertyRegistered.invoke(eType, container);
        }
        add(eType, name, value) {
            if (this.m_aPropertyContainers[eType] == null)
                return;
            let oContainer = this.m_aPropertyContainers[eType];
            if (!oContainer[name])
                oContainer[name] = 0;
            let preValue = oContainer[name];
            oContainer[name] += value;
            let nextValue = oContainer[name];
            if (preValue !== nextValue) {
                setTimeout(() => {
                    this.m_onPropertyChanged.invoke(eType, name, preValue, nextValue);
                }, 0);
            }
        }
        set(eType, name, value) {
            if (this.m_aPropertyContainers[eType] == null)
                return;
            let oContainer = this.m_aPropertyContainers[eType];
            let preValue = oContainer[name];
            if (!preValue)
                preValue = 0;
            oContainer[name] = value;
            let nextValue = oContainer[name];
            if (preValue !== nextValue) {
                setTimeout(() => {
                    this.m_onPropertyChanged.invoke(eType, name, preValue, nextValue);
                }, 0);
            }
        }
        get(eType, name) {
            if (this.m_aPropertyContainers[eType] == null)
                return;
            let oContainer = this.m_aPropertyContainers[eType];
            return oContainer[name] ? oContainer[name] : null;
        }
    }
    Share.CBehavProperty = CBehavProperty;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CBehavPropertyCalc extends Share.CUnitBehavior {
        constructor(oUnit) {
            super(oUnit);
        }
        _awake() {
            this.m_oBehavProperty = this.getComponent(Share.CBehavProperty);
        }
        getOfflineCoinPerSecond() {
            let nLevel = this.m_oBehavProperty.get(Share.EPropertyContainerType.Property, Share.EPropertyType[Share.EPropertyType.Level]);
            return Math.pow(2, nLevel - 1) * 20;
        }
    }
    Share.CBehavPropertyCalc = CBehavPropertyCalc;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CBehavScene extends Share.CUnitBehavior {
        constructor(oUnit) {
            super(oUnit);
            this.m_onEnter = new Share.CDelegate();
            this.m_onLeave = new Share.CDelegate();
            this.m_nID = 0;
            this.m_oSceneCtrlMgr = new Share.CObjResMgr(0, () => {
                return new Share.CSceneCtrlUID();
            });
        }
        get ID() {
            return this.m_nID;
        }
        set ID(value) {
            this.m_nID = value;
        }
        get OnEnter() {
            return this.m_onEnter;
        }
        get OnLeave() {
            return this.m_onLeave;
        }
        get BehavTimerMgr() {
            return this.m_oBehavTimerMgr;
        }
        _awake() {
            this.m_oBehavTimerMgr = this.getComponent(Share.CBehavTimerMgr);
            this.m_oBehavTimerMgr.init(Share.CSingleton(Share.CBattleSceneFrameLoop));
        }
        begin() {
            return this.m_oSceneCtrlMgr.begin();
        }
        end() {
            return this.m_oSceneCtrlMgr.end();
        }
        rbegin() {
            return this.m_oSceneCtrlMgr.rbegin();
        }
        rend() {
            return this.m_oSceneCtrlMgr.rend();
        }
        get Size() {
            return this.m_oSceneCtrlMgr.getSize();
        }
        get(oUID) {
            let o = this.m_oSceneCtrlMgr.getObj(oUID);
            return o == null ? null : o.BehavSceneCtrl;
        }
        add(oSceneCtrl) {
            let o = this.m_oSceneCtrlMgr.createObj(0);
            o.BehavSceneCtrl = oSceneCtrl;
            oSceneCtrl["_setUID"].call(oSceneCtrl, o.UID);
            this.m_onEnter.invoke(oSceneCtrl);
        }
        remove(oSceneCtrl) {
            this.m_onLeave.invoke(oSceneCtrl);
            let oUID = oSceneCtrl.UID;
            oSceneCtrl["_setUID"].call(oSceneCtrl, null);
            this.m_oSceneCtrlMgr.releaseObj(oUID);
        }
        kickOutAll() {
            let promises = [];
            let end = this.m_oSceneCtrlMgr.end();
            for (let it = this.m_oSceneCtrlMgr.begin(); it != end;) {
                let data = it.Data;
                it = it.Next;
                promises.push(data.BehavSceneCtrl.leaveScene());
            }
            return Promise.all(promises);
        }
        _destroy() {
            this.kickOutAll();
        }
    }
    Share.CBehavScene = CBehavScene;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CBehavSceneCtrl extends Share.CUnitBehavior {
        constructor(oUnit) {
            super(oUnit);
            this.m_onBeforeSwitchScene = new Share.CDelegate();
            this.m_onAfterSwitchScene = new Share.CDelegate();
        }
        get OnBeforeSwitchScene() {
            return this.m_onBeforeSwitchScene;
        }
        get OnAfterSwitchScene() {
            return this.m_onAfterSwitchScene;
        }
        get Scene() {
            return this.m_oCurScene;
        }
        get UID() {
            return this.m_oUID;
        }
        _setUID(oUID) {
            this.m_oUID = oUID;
        }
        enterScene(oScene) {
            if (oScene == this.m_oCurScene)
                return Promise.resolve(Share.EErrorNo.Success);
            return Promise.resolve().then(() => {
                let oPrevScene = this.m_oCurScene;
                this.m_onBeforeSwitchScene.invoke(this, oPrevScene, oScene);
                if (oPrevScene)
                    oPrevScene.remove(this);
                this.m_oCurScene = oScene;
                if (oScene)
                    oScene.add(this);
                this.m_onAfterSwitchScene.invoke(this, oPrevScene, oScene);
                return Share.EErrorNo.Success;
            });
        }
        leaveScene() {
            return this.enterScene(null);
        }
        _destroy() {
            this.leaveScene();
        }
    }
    Share.CBehavSceneCtrl = CBehavSceneCtrl;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CBehavTimerMgr extends Share.CUnitBehavior {
        constructor(oUnit) {
            super(oUnit);
        }
        get TimerMgr() {
            return this.m_oTimerMgr;
        }
        init(oFrameLoop, nBaseTime = 0) {
            this.m_oTimerMgr = Share.CTimerMgr.create(oFrameLoop, nBaseTime);
        }
        _destroy() {
            Share.CTimerMgr.release(this.m_oTimerMgr);
        }
    }
    Share.CBehavTimerMgr = CBehavTimerMgr;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CFrameLoopTimerImpl {
        constructor() {
            this.onFrame = new Share.CDelegate();
            this.m_nLastMilliTimestamp = Date.now();
            this._frameLoop();
        }
        _frameLoop() {
            this.m_oTimer = setTimeout(() => {
                let nLastMilliTimestamp = this.m_nLastMilliTimestamp;
                this.m_nLastMilliTimestamp = Date.now();
                this.onFrame.invoke(this.m_nLastMilliTimestamp - nLastMilliTimestamp);
                this._frameLoop();
            }, 1);
        }
        stop() {
            if (this.m_oTimer) {
                clearTimeout(this.m_oTimer);
                this.m_oTimer = null;
            }
        }
    }
    Share.CFrameLoopTimerImpl = CFrameLoopTimerImpl;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CEffectAddProperty extends Share.CEffect {
        _getObjType() {
            return Share.EEffectType.AddProperty;
        }
        _onAdd(oBehavEffect, args) {
            this.m_oBehavProperty = oBehavEffect.getComponent(Share.CBehavProperty);
            if (this.m_oBehavProperty == null)
                return;
            this.m_strPropertyField = args[0];
            this.m_nPropertyValue = args[1];
            this.m_oBehavProperty.add(Share.EPropertyContainerType.Property, this.m_strPropertyField, this.m_nPropertyValue);
        }
        _onRemove() {
            if (this.m_oBehavProperty == null)
                return;
            this.m_oBehavProperty.add(Share.EPropertyContainerType.Property, this.m_strPropertyField, -this.m_nPropertyValue);
        }
        _isAddForever() {
            return false;
        }
    }
    Share.CEffectAddProperty = CEffectAddProperty;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CSceneCtrlUID {
        get UID() {
            return this.m_oUID;
        }
        get BehavSceneCtrl() {
            return this.m_oBehavSceneCtrl;
        }
        set BehavSceneCtrl(oValue) {
            this.m_oBehavSceneCtrl = oValue;
        }
        qconstructor(oUID) {
            this.m_oUID = oUID;
        }
        qdestructor() {
            this.m_oUID = null;
        }
        getObjType() {
            return 0;
        }
    }
    Share.CSceneCtrlUID = CSceneCtrlUID;
})(Share || (Share = {}));
var Share;
(function (Share) {
    let EAIType;
    (function (EAIType) {
        EAIType[EAIType["GuaJiNpc"] = 2] = "GuaJiNpc";
    })(EAIType = Share.EAIType || (Share.EAIType = {}));
})(Share || (Share = {}));
var Share;
(function (Share) {
    let EBoosterType;
    (function (EBoosterType) {
        EBoosterType[EBoosterType["Booster1"] = 1] = "Booster1";
        EBoosterType[EBoosterType["Booster2"] = 2] = "Booster2";
        EBoosterType[EBoosterType["Booster3"] = 3] = "Booster3";
    })(EBoosterType = Share.EBoosterType || (Share.EBoosterType = {}));
})(Share || (Share = {}));
var Share;
(function (Share) {
    let EEffectType;
    (function (EEffectType) {
        EEffectType[EEffectType["AddProperty"] = 1] = "AddProperty";
    })(EEffectType = Share.EEffectType || (Share.EEffectType = {}));
})(Share || (Share = {}));
var Share;
(function (Share) {
    let EPropertyContainerType;
    (function (EPropertyContainerType) {
        EPropertyContainerType[EPropertyContainerType["Property"] = 0] = "Property";
        EPropertyContainerType[EPropertyContainerType["VirtualProperty"] = 1] = "VirtualProperty";
        EPropertyContainerType[EPropertyContainerType["ViewProperty"] = 2] = "ViewProperty";
    })(EPropertyContainerType = Share.EPropertyContainerType || (Share.EPropertyContainerType = {}));
})(Share || (Share = {}));
var Share;
(function (Share) {
    let EPropertyType;
    (function (EPropertyType) {
        EPropertyType[EPropertyType["Exp"] = 1] = "Exp";
        EPropertyType[EPropertyType["Level"] = 2] = "Level";
        EPropertyType[EPropertyType["Gem"] = 3] = "Gem";
        EPropertyType[EPropertyType["Coin"] = 4] = "Coin";
        EPropertyType[EPropertyType["OfflineSeconds"] = 5] = "OfflineSeconds";
        EPropertyType[EPropertyType["InviteRewardCount"] = 6] = "InviteRewardCount";
        EPropertyType[EPropertyType["InviteCount"] = 7] = "InviteCount";
        EPropertyType[EPropertyType["Friends"] = 8] = "Friends";
        EPropertyType[EPropertyType["FriendRequests"] = 9] = "FriendRequests";
        EPropertyType[EPropertyType["FriendSocial"] = 10] = "FriendSocial";
        EPropertyType[EPropertyType["Heart"] = 11] = "Heart";
        EPropertyType[EPropertyType["HeartRecord"] = 12] = "HeartRecord";
        EPropertyType[EPropertyType["CloudTime"] = 13] = "CloudTime";
        EPropertyType[EPropertyType["Mail"] = 14] = "Mail";
    })(EPropertyType = Share.EPropertyType || (Share.EPropertyType = {}));
})(Share || (Share = {}));
var Share;
(function (Share) {
    let EShareType;
    (function (EShareType) {
        EShareType[EShareType["cloudShare"] = 1] = "cloudShare";
        EShareType[EShareType["inviteShare"] = 2] = "inviteShare";
        EShareType[EShareType["tractorShare"] = 3] = "tractorShare";
        EShareType[EShareType["farmerShare"] = 4] = "farmerShare";
        EShareType[EShareType["otherShare"] = 5] = "otherShare";
        EShareType[EShareType["offlineShare"] = 6] = "offlineShare";
        EShareType[EShareType["payShare"] = 7] = "payShare";
        EShareType[EShareType["rebBoxShare"] = 8] = "rebBoxShare";
        EShareType[EShareType["pyqShare"] = 9] = "pyqShare";
        EShareType[EShareType["xslbShare"] = 10] = "xslbShare";
        EShareType[EShareType["leadShare"] = 11] = "leadShare";
        EShareType[EShareType["CBTShare"] = 12] = "CBTShare";
        EShareType[EShareType["TLShare"] = 13] = "TLShare";
        EShareType[EShareType["EmpolyeeShare"] = 14] = "EmpolyeeShare";
        EShareType[EShareType["openLand"] = 15] = "openLand";
        EShareType[EShareType["upgradeGold"] = 16] = "upgradeGold";
        EShareType[EShareType["xsflShare"] = 17] = "xsflShare";
        EShareType[EShareType["OldUserShare"] = 18] = "OldUserShare";
        EShareType[EShareType["orderShare"] = 19] = "orderShare";
        EShareType[EShareType["DcrMoodShare"] = 20] = "DcrMoodShare";
        EShareType[EShareType["Gopher"] = 21] = "Gopher";
        EShareType[EShareType["newGuideAward"] = 22] = "newGuideAward";
        EShareType[EShareType["cardBagYuanbaoShare"] = 23] = "cardBagYuanbaoShare";
        EShareType[EShareType["cardBagTiliShare"] = 24] = "cardBagTiliShare";
        EShareType[EShareType["repeatPieceShare"] = 25] = "repeatPieceShare";
        EShareType[EShareType["zhuanpanPieceShare"] = 26] = "zhuanpanPieceShare";
        EShareType[EShareType["shareAward"] = 27] = "shareAward";
    })(EShareType = Share.EShareType || (Share.EShareType = {}));
})(Share || (Share = {}));
var Share;
(function (Share) {
    let ESkillType;
    (function (ESkillType) {
        ESkillType[ESkillType["PlayerAttack"] = 1] = "PlayerAttack";
        ESkillType[ESkillType["Mercenary1Attack"] = 2] = "Mercenary1Attack";
        ESkillType[ESkillType["Mercenary2Attack"] = 3] = "Mercenary2Attack";
        ESkillType[ESkillType["Booster1"] = 4] = "Booster1";
        ESkillType[ESkillType["Booster2"] = 5] = "Booster2";
        ESkillType[ESkillType["Booster3"] = 6] = "Booster3";
        ESkillType[ESkillType["CastBooster1"] = 7] = "CastBooster1";
    })(ESkillType = Share.ESkillType || (Share.ESkillType = {}));
})(Share || (Share = {}));
var Share;
(function (Share) {
    let EUnitMessageType;
    (function (EUnitMessageType) {
        EUnitMessageType[EUnitMessageType["Attack"] = 0] = "Attack";
    })(EUnitMessageType = Share.EUnitMessageType || (Share.EUnitMessageType = {}));
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CPtcFriendRequestArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.FriendRequest);
        }
    }
    Share.CPtcFriendRequestArg = CPtcFriendRequestArg;
    class CPtcAddFriendArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.AddFriend);
        }
    }
    Share.CPtcAddFriendArg = CPtcAddFriendArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CConsoleLogPrinter {
        _getTime() {
            let time = new Date();
            return "[" + time.getFullYear() + "/" + (time.getMonth() + 1) + "/" + time.getDate() + " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + "]";
        }
        debug(...args) {
            console.debug("[DEBUG]" + this._getTime(), ...args);
        }
        info(...args) {
            console.info("[INFO]" + this._getTime(), ...args);
        }
        warn(...args) {
            console.warn("[WARN]" + this._getTime(), ...args);
        }
        error(...args) {
            console.error("[ERROR]" + this._getTime(), ...args);
        }
    }
    Share.CConsoleLogPrinter = CConsoleLogPrinter;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CInt64 {
        constructor(low, high) {
            this.add = function (otherV) {
                let other = CInt64.from(otherV);
                var a48 = this.high_ >>> 16;
                var a32 = this.high_ & 65535;
                var a16 = this.low_ >>> 16;
                var a00 = this.low_ & 65535;
                var b48 = other.high_ >>> 16;
                var b32 = other.high_ & 65535;
                var b16 = other.low_ >>> 16;
                var b00 = other.low_ & 65535;
                var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
                c00 += a00 + b00;
                c16 += c00 >>> 16;
                c00 &= 65535;
                c16 += a16 + b16;
                c32 += c16 >>> 16;
                c16 &= 65535;
                c32 += a32 + b32;
                c48 += c32 >>> 16;
                c32 &= 65535;
                c48 += a48 + b48;
                c48 &= 65535;
                return CInt64.fromBits(c16 << 16 | c00, c48 << 16 | c32);
            };
            this.inc = function () {
                return this.add(CInt64.ONE);
            };
            this.dec = function () {
                return this.add(CInt64.NEG_ONE);
            };
            this.valueOf = function () {
                return this.toNumber();
            };
            this.unaryPlus = function () {
                return this;
            };
            this.unaryMinus = this.negate;
            this.inv = this.not;
            this.low_ = low | 0;
            this.high_ = high | 0;
        }
        static fromInt(value) {
            if (-128 <= value && value < 128) {
                var cachedObj = CInt64.IntCache_[value];
                if (cachedObj) {
                    return cachedObj;
                }
            }
            var obj = new CInt64(value | 0, value < 0 ? -1 : 0);
            if (-128 <= value && value < 128) {
                CInt64.IntCache_[value] = obj;
            }
            return obj;
        }
        ;
        static fromNumber(value) {
            if (isNaN(value) || !isFinite(value)) {
                return CInt64.ZERO;
            }
            else if (value <= -CInt64.TWO_PWR_63_DBL_) {
                return CInt64.MIN_VALUE;
            }
            else if (value + 1 >= CInt64.TWO_PWR_63_DBL_) {
                return CInt64.MAX_VALUE;
            }
            else if (value < 0) {
                return CInt64.fromNumber(-value).negate();
            }
            else {
                return new CInt64(value % CInt64.TWO_PWR_32_DBL_ | 0, value / CInt64.TWO_PWR_32_DBL_ | 0);
            }
        }
        ;
        static fromBits(lowBits, highBits) {
            return new CInt64(lowBits, highBits);
        }
        ;
        static fromString(str, opt_radix) {
            if (str.length == 0) {
                throw Error('number format error: empty string');
            }
            var radix = opt_radix || 10;
            if (radix < 2 || 36 < radix) {
                throw Error('radix out of range: ' + radix);
            }
            if (str.charAt(0) == '-') {
                return CInt64.fromString(str.substring(1), radix).negate();
            }
            else if (str.indexOf('-') >= 0) {
                throw Error('number format error: interior "-" character: ' + str);
            }
            var radixToPower = CInt64.fromNumber(Math.pow(radix, 8));
            var result = CInt64.ZERO;
            for (var i = 0; i < str.length; i += 8) {
                var size = Math.min(8, str.length - i);
                var value = parseInt(str.substring(i, i + size), radix);
                if (size < 8) {
                    var power = CInt64.fromNumber(Math.pow(radix, size));
                    result = result.multiply(power).add(CInt64.fromNumber(value));
                }
                else {
                    result = result.multiply(radixToPower);
                    result = result.add(CInt64.fromNumber(value));
                }
            }
            return result;
        }
        toInt() {
            return this.low_;
        }
        ;
        toNumber() {
            return this.high_ * CInt64.TWO_PWR_32_DBL_ + this.getLowBitsUnsigned();
        }
        ;
        hashCode() {
            return this.high_ ^ this.low_;
        }
        toString(opt_radix) {
            var radix = opt_radix || 10;
            if (radix < 2 || 36 < radix) {
                throw Error('radix out of range: ' + radix);
            }
            if (this.isZero()) {
                return '0';
            }
            if (this.isNegative()) {
                if (this.equalsLong(CInt64.MIN_VALUE)) {
                    var radixLong = CInt64.fromNumber(radix);
                    var div = this.div(radixLong);
                    let rem = div.multiply(radixLong).subtract(this);
                    return div.toString(radix) + rem.toInt().toString(radix);
                }
                else {
                    return '-' + this.negate().toString(radix);
                }
            }
            var radixToPower = CInt64.fromNumber(Math.pow(radix, 6));
            let rem = this;
            var result = '';
            while (true) {
                var remDiv = rem.div(radixToPower);
                var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
                var digits = intval.toString(radix);
                rem = remDiv;
                if (rem.isZero()) {
                    return digits + result;
                }
                else {
                    while (digits.length < 6) {
                        digits = '0' + digits;
                    }
                    result = '' + digits + result;
                }
            }
        }
        getHighBits() {
            return this.high_;
        }
        ;
        getLowBits() {
            return this.low_;
        }
        ;
        getLowBitsUnsigned() {
            return this.low_ >= 0 ? this.low_ : CInt64.TWO_PWR_32_DBL_ + this.low_;
        }
        ;
        getNumBitsAbs() {
            if (this.isNegative()) {
                if (this.equalsLong(CInt64.MIN_VALUE)) {
                    return 64;
                }
                else {
                    return this.negate().getNumBitsAbs();
                }
            }
            else {
                var val = this.high_ != 0 ? this.high_ : this.low_;
                for (var bit = 31; bit > 0; bit--) {
                    if ((val & 1 << bit) != 0) {
                        break;
                    }
                }
                return this.high_ != 0 ? bit + 33 : bit + 1;
            }
        }
        ;
        isZero() {
            return this.high_ == 0 && this.low_ == 0;
        }
        ;
        isNegative() {
            return this.high_ < 0;
        }
        ;
        isOdd() {
            return (this.low_ & 1) == 1;
        }
        ;
        equalsLong(other) {
            return this.high_ == other.high_ && this.low_ == other.low_;
        }
        ;
        notEqualsLong(other) {
            return this.high_ != other.high_ || this.low_ != other.low_;
        }
        ;
        equals(other) {
            return this.compare(other) === 0;
        }
        ;
        static from(other) {
            let t = typeof other;
            let m = other;
            if (other === 'number')
                return CInt64.fromNumber(m);
            if (other === 'string')
                return CInt64.fromString(m);
            return m;
        }
        lessThan(other) {
            return this.compare(other) < 0;
        }
        lessThanOrEqual(other) {
            return this.compare(other) <= 0;
        }
        greaterThan(other) {
            return this.compare(other) > 0;
        }
        greaterThanOrEqual(other) {
            return this.compare(other) >= 0;
        }
        compare(otherV) {
            let other = CInt64.from(otherV);
            if (this.equalsLong(other)) {
                return 0;
            }
            var thisNeg = this.isNegative();
            var otherNeg = other.isNegative();
            if (thisNeg && !otherNeg) {
                return -1;
            }
            if (!thisNeg && otherNeg) {
                return 1;
            }
            if (this.subtract(other).isNegative()) {
                return -1;
            }
            else {
                return 1;
            }
        }
        negate() {
            if (this.equalsLong(CInt64.MIN_VALUE)) {
                return CInt64.MIN_VALUE;
            }
            else {
                return this.not().add(CInt64.ONE);
            }
        }
        ;
        subtract(other) {
            return this.add(CInt64.from(other).negate());
        }
        ;
        multiply(otherV) {
            let other = CInt64.from(otherV);
            if (this.isZero()) {
                return CInt64.ZERO;
            }
            else if (other.isZero()) {
                return CInt64.ZERO;
            }
            if (this.equalsLong(CInt64.MIN_VALUE)) {
                return other.isOdd() ? CInt64.MIN_VALUE : CInt64.ZERO;
            }
            else if (other.equalsLong(CInt64.MIN_VALUE)) {
                return this.isOdd() ? CInt64.MIN_VALUE : CInt64.ZERO;
            }
            if (this.isNegative()) {
                if (other.isNegative()) {
                    return this.negate().multiply(other.negate());
                }
                else {
                    return this.negate().multiply(other).negate();
                }
            }
            else if (other.isNegative()) {
                return this.multiply(other.negate()).negate();
            }
            if (this.lessThan(CInt64.TWO_PWR_24_) && other.lessThan(CInt64.TWO_PWR_24_)) {
                return CInt64.fromNumber(this.toNumber() * other.toNumber());
            }
            var a48 = this.high_ >>> 16;
            var a32 = this.high_ & 65535;
            var a16 = this.low_ >>> 16;
            var a00 = this.low_ & 65535;
            var b48 = other.high_ >>> 16;
            var b32 = other.high_ & 65535;
            var b16 = other.low_ >>> 16;
            var b00 = other.low_ & 65535;
            var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
            c00 += a00 * b00;
            c16 += c00 >>> 16;
            c00 &= 65535;
            c16 += a16 * b00;
            c32 += c16 >>> 16;
            c16 &= 65535;
            c16 += a00 * b16;
            c32 += c16 >>> 16;
            c16 &= 65535;
            c32 += a32 * b00;
            c48 += c32 >>> 16;
            c32 &= 65535;
            c32 += a16 * b16;
            c48 += c32 >>> 16;
            c32 &= 65535;
            c32 += a00 * b32;
            c48 += c32 >>> 16;
            c32 &= 65535;
            c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
            c48 &= 65535;
            return CInt64.fromBits(c16 << 16 | c00, c48 << 16 | c32);
        }
        ;
        div(otherV) {
            let other = CInt64.from(otherV);
            if (other.isZero()) {
                throw Error('division by zero');
            }
            else if (this.isZero()) {
                return CInt64.ZERO;
            }
            if (this.equalsLong(CInt64.MIN_VALUE)) {
                if (other.equalsLong(CInt64.ONE) || other.equalsLong(CInt64.NEG_ONE)) {
                    return CInt64.MIN_VALUE;
                }
                else if (other.equalsLong(CInt64.MIN_VALUE)) {
                    return CInt64.ONE;
                }
                else {
                    var halfThis = this.shiftRight(1);
                    var approx1 = halfThis.div(other).shiftLeft(1);
                    if (approx1.equalsLong(CInt64.ZERO)) {
                        return other.isNegative() ? CInt64.ONE : CInt64.NEG_ONE;
                    }
                    else {
                        let rem = this.subtract(other.multiply(approx1));
                        var result = approx1.add(rem.div(other));
                        return result;
                    }
                }
            }
            else if (other.equalsLong(CInt64.MIN_VALUE)) {
                return CInt64.ZERO;
            }
            if (this.isNegative()) {
                if (other.isNegative()) {
                    return this.negate().div(other.negate());
                }
                else {
                    return this.negate().div(other).negate();
                }
            }
            else if (other.isNegative()) {
                return this.div(other.negate()).negate();
            }
            var res = CInt64.ZERO;
            let rem = this;
            while (rem.greaterThanOrEqual(other)) {
                var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));
                var log2 = Math.ceil(Math.log(approx) / Math.LN2);
                var delta = log2 <= 48 ? 1 : Math.pow(2, log2 - 48);
                var approxRes = CInt64.fromNumber(approx);
                var approxRem = approxRes.multiply(other);
                while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
                    approx -= delta;
                    approxRes = CInt64.fromNumber(approx);
                    approxRem = approxRes.multiply(other);
                }
                if (approxRes.isZero()) {
                    approxRes = CInt64.ONE;
                }
                res = res.add(approxRes);
                rem = rem.subtract(approxRem);
            }
            return res;
        }
        ;
        modulo(otherV) {
            let other = CInt64.from(otherV);
            return this.subtract(this.div(other).multiply(other));
        }
        ;
        not() {
            return CInt64.fromBits(~this.low_, ~this.high_);
        }
        ;
        and(otherV) {
            let other = CInt64.from(otherV);
            return CInt64.fromBits(this.low_ & other.low_, this.high_ & other.high_);
        }
        ;
        or(otherV) {
            let other = CInt64.from(otherV);
            return CInt64.fromBits(this.low_ | other.low_, this.high_ | other.high_);
        }
        ;
        xor(otherV) {
            let other = CInt64.from(otherV);
            return CInt64.fromBits(this.low_ ^ other.low_, this.high_ ^ other.high_);
        }
        ;
        shiftLeft(numBits) {
            numBits &= 63;
            if (numBits == 0) {
                return this;
            }
            else {
                var low = this.low_;
                if (numBits < 32) {
                    var high = this.high_;
                    return CInt64.fromBits(low << numBits, high << numBits | low >>> 32 - numBits);
                }
                else {
                    return CInt64.fromBits(0, low << numBits - 32);
                }
            }
        }
        ;
        shiftRight(numBits) {
            numBits &= 63;
            if (numBits == 0) {
                return this;
            }
            else {
                var high = this.high_;
                if (numBits < 32) {
                    var low = this.low_;
                    return CInt64.fromBits(low >>> numBits | high << 32 - numBits, high >> numBits);
                }
                else {
                    return CInt64.fromBits(high >> numBits - 32, high >= 0 ? 0 : -1);
                }
            }
        }
        ;
        shiftRightUnsigned(numBits) {
            numBits &= 63;
            if (numBits == 0) {
                return this;
            }
            else {
                var high = this.high_;
                if (numBits < 32) {
                    var low = this.low_;
                    return CInt64.fromBits(low >>> numBits | high << 32 - numBits, high >>> numBits);
                }
                else if (numBits == 32) {
                    return CInt64.fromBits(high, 0);
                }
                else {
                    return CInt64.fromBits(high >>> numBits - 32, 0);
                }
            }
        }
    }
    CInt64.IntCache_ = {};
    CInt64.TWO_PWR_16_DBL_ = 1 << 16;
    CInt64.TWO_PWR_24_DBL_ = 1 << 24;
    CInt64.TWO_PWR_32_DBL_ = CInt64.TWO_PWR_16_DBL_ * CInt64.TWO_PWR_16_DBL_;
    CInt64.TWO_PWR_31_DBL_ = CInt64.TWO_PWR_32_DBL_ / 2;
    CInt64.TWO_PWR_48_DBL_ = CInt64.TWO_PWR_32_DBL_ * CInt64.TWO_PWR_16_DBL_;
    CInt64.TWO_PWR_64_DBL_ = CInt64.TWO_PWR_32_DBL_ * CInt64.TWO_PWR_32_DBL_;
    CInt64.TWO_PWR_63_DBL_ = CInt64.TWO_PWR_64_DBL_ / 2;
    CInt64.ZERO = CInt64.fromInt(0);
    CInt64.ONE = CInt64.fromInt(1);
    CInt64.NEG_ONE = CInt64.fromInt(-1);
    CInt64.MAX_VALUE = CInt64.fromBits(4.294967295E9 | 0, 2147483647 | 0);
    CInt64.MIN_VALUE = CInt64.fromBits(0, 2.147483648E9 | 0);
    CInt64.TWO_PWR_24_ = CInt64.fromInt(1 << 24);
    Share.CInt64 = CInt64;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CPtcKickoutArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.Kickout);
        }
    }
    Share.CPtcKickoutArg = CPtcKickoutArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CPtcSyncPropertyArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.SyncProperty);
        }
    }
    Share.CPtcSyncPropertyArg = CPtcSyncPropertyArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CBuyArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.Buy);
        }
    }
    Share.CBuyArg = CBuyArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CClaimInviteRewardArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.ClaimInviteReward);
        }
    }
    Share.CClaimInviteRewardArg = CClaimInviteRewardArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CClaimOfflineRewardArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.ClaimOfflineReward);
        }
    }
    Share.CClaimOfflineRewardArg = CClaimOfflineRewardArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CCreatePlayerArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.CreatePlayer);
        }
    }
    Share.CCreatePlayerArg = CCreatePlayerArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CEnterWorldArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.EnterWorld);
        }
    }
    Share.CEnterWorldArg = CEnterWorldArg;
    let ERecordType;
    (function (ERecordType) {
        ERecordType[ERecordType["DaLi"] = 0] = "DaLi";
        ERecordType[ERecordType["DaoLuan"] = 1] = "DaoLuan";
    })(ERecordType = Share.ERecordType || (Share.ERecordType = {}));
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CFinishGuaJiArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.FinishGuaJi);
        }
    }
    Share.CFinishGuaJiArg = CFinishGuaJiArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CFriendRequestArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.FriendRequest);
        }
    }
    Share.CFriendRequestArg = CFriendRequestArg;
    class CAddFriendArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.AddFriend);
        }
    }
    Share.CAddFriendArg = CAddFriendArg;
    class CIgnoreFriendRequestArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.IgnoreFriendRequest);
        }
    }
    Share.CIgnoreFriendRequestArg = CIgnoreFriendRequestArg;
    class CDaLiArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.DaLi);
        }
    }
    Share.CDaLiArg = CDaLiArg;
    class CDaoLuanArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.DaoLuan);
        }
    }
    Share.CDaoLuanArg = CDaoLuanArg;
    class CFireArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.Fire);
        }
    }
    Share.CFireArg = CFireArg;
    class CModifyMailArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.ModifyMail);
        }
    }
    Share.CModifyMailArg = CModifyMailArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CGetAccessTokenArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.GetAccessToken);
        }
    }
    Share.CGetAccessTokenArg = CGetAccessTokenArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CGetInviteesArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.GetInvitees);
        }
    }
    Share.CGetInviteesArg = CGetInviteesArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CGetInviteesByShareTypeArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.GetInviteesByShareType);
        }
    }
    Share.CGetInviteesByShareTypeArg = CGetInviteesByShareTypeArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CGetRandomUserArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.GetRandomUser);
        }
    }
    Share.CGetRandomUserArg = CGetRandomUserArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CGetTickArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.GetTick);
        }
    }
    Share.CGetTickArg = CGetTickArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CGetWXACodeUnlimitArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.GetWXACodeUnlimit);
        }
    }
    Share.CGetWXACodeUnlimitArg = CGetWXACodeUnlimitArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CGotoMarketArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.GotoMarket);
        }
    }
    Share.CGotoMarketArg = CGotoMarketArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CLeaveWorldArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.LeaveWorld);
        }
    }
    Share.CLeaveWorldArg = CLeaveWorldArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CLoginArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.Login);
        }
    }
    Share.CLoginArg = CLoginArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CLogoutArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.Logout);
        }
    }
    Share.CLogoutArg = CLogoutArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class COpenTractorArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.OpenTractor);
        }
    }
    Share.COpenTractorArg = COpenTractorArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CQueryPlayerArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.QueryPlayer);
        }
    }
    Share.CQueryPlayerArg = CQueryPlayerArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CQueryUserDataArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.QueryUserData);
        }
    }
    Share.CQueryUserDataArg = CQueryUserDataArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CRebornArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.Reborn);
        }
    }
    Share.CRebornArg = CRebornArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CReLoginArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.ReLogin);
        }
    }
    Share.CReLoginArg = CReLoginArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CSavePlayerArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.SavePlayer);
        }
    }
    Share.CSavePlayerArg = CSavePlayerArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CSaveUserDataArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.SaveUserData);
        }
    }
    Share.CSaveUserDataArg = CSaveUserDataArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CStartRainArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.StartRain);
        }
    }
    Share.CStartRainArg = CStartRainArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CUpgradePropertyArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.UpgradeProperty);
        }
    }
    Share.CUpgradePropertyArg = CUpgradePropertyArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CUseBoosterArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.UseBooster);
        }
    }
    Share.CUseBoosterArg = CUseBoosterArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CWxLoginArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.WxLogin);
        }
    }
    Share.CWxLoginArg = CWxLoginArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CLinkedListNode {
        constructor(owner) {
            this.owner = owner;
        }
        getPrev() { return this.prev; }
        getNext() { return this.next; }
    }
    Share.CLinkedListNode = CLinkedListNode;
    class CLinkedList {
        constructor() {
            this.head = new CLinkedListNode(this);
            this.tail = new CLinkedListNode(this);
            this.m_nCount = 0;
            this.head["prev"] = null;
            this.head["next"] = this.tail;
            this.tail["prev"] = this.head;
            this.tail["next"] = null;
        }
        begin() { return this.head.getNext(); }
        end() { return this.tail; }
        rbegin() { return this.tail.getPrev(); }
        rend() { return this.begin; }
        clear() {
            this.m_nCount = 0;
            this.head["prev"] = null;
            this.head["next"] = this.tail;
            this.tail["prev"] = this.head;
            this.tail["next"] = null;
        }
        insertBefore(node, data) {
            let owner = node["owner"];
            if (owner !== this)
                return null;
            if (node === this.head)
                return null;
            let prev = node["prev"];
            let newNode = new CLinkedListNode(this);
            newNode.data = data;
            newNode["next"] = node;
            newNode["prev"] = prev;
            node["prev"] = newNode;
            prev["next"] = newNode;
            ++this.m_nCount;
            return newNode;
        }
        insertAfter(node, data) {
            let owner = node["owner"];
            if (owner !== this)
                return null;
            if (node === this.tail)
                return null;
            let next = node["next"];
            let newNode = new CLinkedListNode(this);
            newNode.data = data;
            newNode["next"] = next;
            newNode["prev"] = node;
            node["next"] = newNode;
            next["prev"] = newNode;
            ++this.m_nCount;
            return newNode;
        }
        remove(node) {
            let owner = node["owner"];
            if (owner !== this)
                return false;
            if (node === this.tail || node === this.head)
                return false;
            let prev = node["prev"];
            let next = node["next"];
            node["prev"] = null;
            node["next"] = null;
            node["owner"] = null;
            prev["next"] = next;
            next["prev"] = prev;
            --this.m_nCount;
            return true;
        }
        removeRange(begin, end) {
            if (begin["owner"] !== this || end["owner"] !== this)
                return false;
            if (begin === this.tail || begin === this.head || end === this.head || end === this.head.getNext())
                return false;
            if (begin === end)
                return true;
            let prev = begin["prev"];
            let next = end;
            let removeCount = 0;
            for (let node = begin; node != next; node = node.getNext()) {
                if (node == null || node === this.tail)
                    return false;
            }
            for (let node = begin; node != next; node = node.getNext()) {
                ++removeCount;
            }
            prev["next"] = next;
            next["prev"] = prev;
            this.m_nCount -= removeCount;
            return true;
        }
        count() {
            return this.m_nCount;
        }
    }
    Share.CLinkedList = CLinkedList;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CProtocolArg {
        constructor(type) {
            this.type = type;
            this.data = {};
        }
    }
    Share.CProtocolArg = CProtocolArg;
    class CRpcSendTask {
        qconstructor(uid) {
            this.m_oUId = uid;
        }
        qdestructor() {
            if (this.m_oSendTimeout) {
                clearTimeout(this.m_oSendTimeout);
                this.m_oSendTimeout = null;
            }
            this.m_oCallback = null;
            this.m_oUId = null;
        }
        getObjType() {
            return 0;
        }
        getUID() {
            return this.m_oUId;
        }
    }
    Share.CRpcSendTask = CRpcSendTask;
    class CRpcTaskMgr {
        constructor() {
            this.m_oMgr = new Share.CObjResMgr(1000, (nObjType) => {
                return new CRpcSendTask();
            });
        }
        createRpcTask() {
            return this.m_oMgr.createObj(0);
        }
        releaseRpcTask(uid) {
            this.m_oMgr.releaseObj(uid);
        }
        releaseAllRpcTask() {
            this.m_oMgr.releaseAll();
        }
        getRpcTask(uid) {
            return this.m_oMgr.getObj(uid);
        }
    }
    Share.CRpcTaskMgr = CRpcTaskMgr;
})(Share || (Share = {}));
var Share;
(function (Share) {
    class CSession {
        constructor(oSendreceiver, unbindCallback) {
            this.m_nToRecvLen = 0;
            this.m_strRecvData = "";
            this.m_oSendReceiver = null;
            this.m_onError = null;
            this.m_onClose = null;
            this.m_onUnBind = null;
            this.m_oRpcTaskMgr = new Share.CRpcTaskMgr();
            this.m_strRemoteIp = "";
            this.m_oSendReceiver = oSendreceiver;
            this.m_onUnBind = unbindCallback;
            this.m_strRemoteIp = oSendreceiver.getRemoteIp();
            if (this.m_oSendReceiver) {
                this.m_oSendReceiver.onRecv((data) => {
                    this._onRecv(data);
                });
                this.m_oSendReceiver.onError((err) => {
                    if (this.m_onError)
                        this.m_onError(err);
                });
            }
        }
        getUserData() {
            return this.m_oUserData;
        }
        setUserData(oUserData) {
            this.m_oUserData = oUserData;
        }
        _onRecv(data) {
            if (typeof data !== "string")
                return this.close();
            let strData = data.toString();
            if (!strData || !strData.length)
                return;
            if (this.m_nToRecvLen == 0) {
                let n = 0;
                for (; n != strData.length; ++n) {
                    if (strData[n] == '{')
                        break;
                }
                if (n == strData.length)
                    this.m_strRecvData += strData;
                else {
                    this.m_strRecvData += strData.substr(0, n);
                    let t = Number(this.m_strRecvData);
                    if (isNaN(t)) {
                        return this.close();
                    }
                    this.m_nToRecvLen = t;
                    this.m_strRecvData = "";
                    this._onRecv(strData.substr(n));
                }
            }
            else {
                if (this.m_nToRecvLen >= 10485760)
                    return this.close();
                if (this.m_strRecvData.length + strData.length >= this.m_nToRecvLen) {
                    let n = this.m_nToRecvLen - this.m_strRecvData.length;
                    this.m_strRecvData += strData.substr(0, n);
                    let t = null;
                    try {
                        t = JSON.parse(this.m_strRecvData);
                    }
                    catch (e) {
                        return this.close();
                    }
                    if (t.type == undefined || !t.data)
                        return this.close();
                    this.m_strRecvData = "";
                    this.m_nToRecvLen = 0;
                    if (t.uid) {
                        if (t.isReply) {
                            let oUID = new Share.CObjResUID(t.uid.m_nIndex, t.uid.m_nCheckNum);
                            let sendTask = this.m_oRpcTaskMgr.getRpcTask(oUID);
                            if (sendTask) {
                                let cb = sendTask.m_oCallback;
                                this.m_oRpcTaskMgr.releaseRpcTask(oUID);
                                cb(null, t.data);
                            }
                        }
                        else {
                            let controller = Share.CSingleton(Share.CProtocolMgr).getController(t.type);
                            if (controller && controller.onCall) {
                                Promise.resolve(controller.onCall(t.data, this)).then((data) => {
                                    if (this.m_oSendReceiver == null)
                                        return;
                                    let r = { uid: t.uid, isReply: true, type: t.type, data: data };
                                    try {
                                        let st = JSON.stringify(r);
                                        this.m_oSendReceiver.send(st.length + st);
                                    }
                                    catch (e) { }
                                });
                            }
                        }
                    }
                    else {
                        let controller = Share.CSingleton(Share.CProtocolMgr).getController(t.type);
                        if (controller && controller.onProcess) {
                            controller.onProcess(t.data, this);
                        }
                    }
                    this._onRecv(strData.substr(n));
                }
                else {
                    this.m_strRecvData += strData;
                }
            }
        }
        unbindCallback(callback) {
            this.m_onUnBind = callback;
        }
        unbind() {
            this.m_nToRecvLen = 0;
            this.m_strRecvData = "";
            let oSendReceiver = this.m_oSendReceiver;
            if (this.m_oSendReceiver) {
                this.m_oSendReceiver.onRecv(null);
                this.m_oSendReceiver.onError(null);
            }
            this.m_oSendReceiver = null;
            let onUnBind = this.m_onUnBind;
            if (onUnBind && oSendReceiver) {
                setTimeout(() => {
                    onUnBind(oSendReceiver);
                }, 0);
            }
        }
        getRemoteIp() {
            return this.m_strRemoteIp;
        }
        isClosed() {
            return this.m_oSendReceiver == null;
        }
        close() {
            if (this.isClosed())
                return;
            let onClose = this.m_onClose;
            let oSendReceiver = this.m_oSendReceiver;
            this.unbind();
            if (oSendReceiver != null) {
                if (onClose) {
                    setTimeout(() => {
                        onClose();
                    }, 0);
                }
                this.m_oSendReceiver = null;
            }
        }
        callRpc(arg, timeoutMilliSeconds = 30000) {
            if (this.isClosed()) {
                return Promise.reject(new Error("send on a closed session"));
            }
            let self = this;
            let timeout = timeoutMilliSeconds;
            if (timeout <= 0)
                return Promise.reject(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(Share.EErrorNo.Timeout));
            let sendTask = this.m_oRpcTaskMgr.createRpcTask();
            let taskUID = sendTask.getUID();
            let pr = Share.CPromiseHelper.createPromise();
            sendTask.m_oCallback = pr.callback;
            sendTask.m_oSendTimeout = setTimeout(() => {
                this.m_oRpcTaskMgr.releaseRpcTask(taskUID);
                pr.callback(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(Share.EErrorNo.Timeout));
            }, timeout);
            let sendData = JSON.stringify({
                type: arg.type,
                uid: taskUID,
                data: arg.data
            });
            this.m_oSendReceiver.send(sendData.length + sendData);
            return pr.promise;
        }
        sendPtc(arg) {
            if (this.isClosed()) {
                return;
            }
            let sendData = JSON.stringify({
                type: arg.type,
                data: arg.data
            });
            this.m_oSendReceiver.send(sendData.length + sendData);
        }
        onError(callback) {
            this.m_onError = callback;
        }
        onClose(callback) {
            this.m_onClose = callback;
        }
    }
    Share.CSession = CSession;
})(Share || (Share = {}));
var Share;
(function (Share) {
    let ELogLevel;
    (function (ELogLevel) {
        ELogLevel[ELogLevel["none"] = -1] = "none";
        ELogLevel[ELogLevel["debug"] = 0] = "debug";
        ELogLevel[ELogLevel["info"] = 1] = "info";
        ELogLevel[ELogLevel["warn"] = 2] = "warn";
        ELogLevel[ELogLevel["error"] = 3] = "error";
    })(ELogLevel = Share.ELogLevel || (Share.ELogLevel = {}));
    class CLogHelper {
        static registerPrinter(printer, ...logLevel) {
            if (printer == null)
                return;
            if (logLevel == null || logLevel.length == 0)
                logLevel = [ELogLevel.debug, ELogLevel.info, ELogLevel.warn, ELogLevel.error];
            for (let i = 0; i != logLevel.length; ++i)
                this._registerPrinter(printer, logLevel[i]);
        }
        static _registerPrinter(printer, logLevel) {
            if (printer == null || logLevel == null || logLevel == ELogLevel.none)
                return;
            if (this.m_oLogPrinter == null)
                this.m_oLogPrinter = [];
            if (this.m_oLogPrinter[logLevel] == null)
                this.m_oLogPrinter[logLevel] = [];
            this.m_oLogPrinter[logLevel].push(printer);
        }
        static debug(...args) {
            if (this.m_oLogPrinter == null)
                return;
            let oLogPrinters = this.m_oLogPrinter[ELogLevel.debug];
            if (oLogPrinters == null)
                return;
            for (let i = 0; i != oLogPrinters.length; ++i)
                oLogPrinters[i].debug(...args);
        }
        static info(...args) {
            if (this.m_oLogPrinter == null)
                return;
            let oLogPrinters = this.m_oLogPrinter[ELogLevel.debug];
            if (oLogPrinters == null)
                return;
            for (let i = 0; i != oLogPrinters.length; ++i)
                oLogPrinters[i].info(...args);
        }
        static warn(...args) {
            if (this.m_oLogPrinter == null)
                return;
            let oLogPrinters = this.m_oLogPrinter[ELogLevel.debug];
            if (oLogPrinters == null)
                return;
            for (let i = 0; i != oLogPrinters.length; ++i)
                oLogPrinters[i].warn(...args);
        }
        static error(...args) {
            if (this.m_oLogPrinter == null)
                return;
            let oLogPrinters = this.m_oLogPrinter[ELogLevel.debug];
            if (oLogPrinters == null)
                return;
            for (let i = 0; i != oLogPrinters.length; ++i)
                oLogPrinters[i].error(...args);
        }
    }
    Share.CLogHelper = CLogHelper;
})(Share || (Share = {}));
var ClientCore;
(function (ClientCore) {
    class CBehavClientCore extends Share.CUnitBehavior {
        constructor(oUnit) {
            super(oUnit);
        }
        get UseHttps() {
            return this.m_bUseHttps;
        }
        get GameServer() {
            return this.m_strGameServer;
        }
        get HttpServer() {
            return this.m_strHttpServer;
        }
        _awake() {
        }
        Init() {
            return Promise.resolve(true);
        }
        Load(oArg) {
            this.m_bUseHttps = oArg.useHttps;
            this.m_strGameServer = (this.m_bUseHttps ? "wss:" : "ws:") + oArg.gameServer;
            this.m_strHttpServer = (this.m_bUseHttps ? "https:" : "http:") + oArg.httpServer;
            Share.CSingleton(Share.CGlobalConfigMgr).init(oArg.clientTable.m_oGlobalConfigMgr);
            Share.CSingleton(Share.CShareSwitchMgr).init(oArg.clientTable.m_oShareSwitchMgr);
            Share.CSingleton(Share.CFarmLandAttrMgr).init(oArg.clientTable.m_oFramLandAttrMgr);
            Share.CSingleton(Share.CCropAttrMgr).init(oArg.clientTable.m_oCropAttrMgr);
            Share.CSingleton(Share.CUnitAttrMgr).init(oArg.clientTable.m_oUnitAttrMgr);
            Share.CSingleton(Share.CTechAttrMgr).init(oArg.clientTable.m_oTechAttrMgr);
            Share.CSingleton(Share.CInviteAttrMgr).init(oArg.clientTable.m_oInviteAttrMgr);
            Share.CSingleton(Share.CFarmSkinAttrMgr).init(oArg.clientTable.m_oFarmSkinAttrMgr);
            Share.CSingleton(Share.CFarmAttrMgr).init(oArg.clientTable.m_oFarmAttrMgr);
            Share.CSingleton(Share.CGemItemAttrMgr).init(oArg.clientTable.m_oGemItemAttrMgr);
            Share.CSingleton(Share.CUnlockAttrMgr).init(oArg.clientTable.m_oUnlockAttrMgr);
            Share.CSingleton(Share.CWheelAttrMgr).init(oArg.clientTable.m_oWheelAttrMgr);
            Share.CSingleton(Share.CSevenDaysAttrMgr).init(oArg.clientTable.m_oSevenDaysAttrMgr);
            Share.CSingleton(Share.CInviteClientAttrMgr).init(oArg.clientTable.m_oInviteClintAttrMgr);
            Share.CSingleton(Share.CAutoRewardAttrMgr).init(oArg.clientTable.m_oAutoRewardAttrMgr);
            Share.CSingleton(Share.CJobAttrMgr).init(oArg.clientTable.m_oJobAttrMgr);
            Share.CSingleton(Share.CFarmerAttrMgr).init(oArg.clientTable.m_oFarmerAttrMgr);
            Share.CSingleton(Share.CGuideTaskAttrMgr).init(oArg.clientTable.m_oGuideTaskAttrMgr);
            Share.CSingleton(Share.CDialogueAttrMgr).init(oArg.clientTable.m_oDialogueAttrMgr);
            Share.CSingleton(Share.CTreasureFirstAttrMgr).init(oArg.clientTable.m_oTreasureFirstAttrMgr);
            Share.CSingleton(Share.CTreasureSecondAttrMgr).init(oArg.clientTable.m_oTreasureSecondAttrMgr);
            Share.CSingleton(Share.CBubbleFirstAttrMgr).init(oArg.clientTable.m_oBubbleFirstAttrMgr);
            Share.CSingleton(Share.CBubbleSecondAttrMgr).init(oArg.clientTable.m_oBubbleSecondAttrMgr);
            Share.CSingleton(Share.CProvinceAttrMgr).init(oArg.clientTable.m_oProvinceAttrMgr);
            return Promise.resolve(true);
        }
        CreateAccountSession() {
            let oUnitClientSession = new ClientCore.CUnitClientSession(this);
            return oUnitClientSession.BehavInterface;
        }
        DestroyClientSession(oAccount) {
            oAccount.destroy();
        }
    }
    ClientCore.CBehavClientCore = CBehavClientCore;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CUnitClientCore extends Share.CUnit {
        constructor() {
            super(Share.CUBC(ClientCore.CBehavClientCore));
            this.m_oClientCore = this.getComponent(ClientCore.CBehavClientCore);
        }
        get ClientCore() {
            return this.m_oClientCore;
        }
    }
    ClientCore.CUnitClientCore = CUnitClientCore;
})(ClientCore || (ClientCore = {}));
if (typeof window !== 'undefined') {
    window["Share"] = Share;
    window["ClientCore"] = ClientCore;
}
var ClientCore;
(function (ClientCore) {
    class CWSConnector {
        static connect(url) {
            let ws;
            try {
                ws = new WebSocket(url);
            }
            catch (e) {
                return Promise.reject(e);
            }
            ws.binaryType = "arraybuffer";
            let pr = Share.CPromiseHelper.createPromise();
            ws.onopen = () => {
                pr.callback(null, new ClientCore.CWSSendReceiver(ws, url));
                ws.onerror = null;
            };
            ws.onerror = (event) => {
                pr.callback(event.data);
            };
            return pr.promise;
        }
    }
    ClientCore.CWSConnector = CWSConnector;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CWSSendReceiver {
        constructor(ws, remoteUrl) {
            this.m_oWebSocket = ws;
            this.m_strRemoteUrl = remoteUrl;
            ws.onmessage = (evt) => {
                if (this.m_onRecv)
                    this.m_onRecv(evt.data);
            };
            ws.onerror = (evt) => {
                if (this.m_onError)
                    this.m_onError(evt.data);
            };
            ws.onclose = (evt) => {
                if (this.m_onClose)
                    this.m_onClose();
            };
        }
        isClosed() {
            return this.m_oWebSocket == null;
        }
        close() {
            if (this.isClosed())
                return;
            if (!this.m_oWebSocket)
                return;
            this.m_oWebSocket.close();
            this.m_oWebSocket = null;
        }
        send(data) {
            this.m_oWebSocket.send(data);
            return Promise.resolve();
        }
        onRecv(callback) {
            this.m_onRecv = callback;
        }
        onError(callback) {
            this.m_onError = callback;
        }
        onClose(callback) {
            this.m_onClose = callback;
        }
        getRemoteIp() {
            return this.m_strRemoteUrl;
        }
    }
    ClientCore.CWSSendReceiver = CWSSendReceiver;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CG2CPtcFriendRequest {
        static onProcess(data, oSession) {
            let oBehavSession = oSession.getUserData();
            if (oBehavSession == null || oBehavSession.isDestroyed())
                return;
            oBehavSession.onFriendRequest(data);
        }
    }
    Share.CSingleton(Share.CProtocolMgr).registerController(CG2CPtcFriendRequest, Share.EProtocolType.FriendRequest);
    class CG2CPtcFriendResponse {
        static onProcess(data, oSession) {
            let oBehavSession = oSession.getUserData();
            if (oBehavSession == null || oBehavSession.isDestroyed())
                return;
            oBehavSession.onFriendRequest(data);
        }
    }
    Share.CSingleton(Share.CProtocolMgr).registerController(CG2CPtcFriendResponse, Share.EProtocolType.AddFriend);
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CG2CPtcInvite {
        static onProcess(data, oSession) {
            let oBehavSession = oSession.getUserData();
            if (oBehavSession == null || oBehavSession.isDestroyed())
                return;
            oBehavSession.onInvite(data);
        }
    }
    Share.CSingleton(Share.CProtocolMgr).registerController(CG2CPtcInvite, Share.EProtocolType.Invite);
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CG2CPtcKickout {
        static onProcess(data, oSession) {
            let oBehavSession = oSession.getUserData();
            if (oBehavSession == null || oBehavSession.isDestroyed())
                return;
            oBehavSession.beKickout();
        }
    }
    Share.CSingleton(Share.CProtocolMgr).registerController(CG2CPtcKickout, Share.EProtocolType.Kickout);
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CG2CPtcSyncProperty {
        static onProcess(data, oSession) {
            let oBehavSession = oSession.getUserData();
            if (oBehavSession == null || oBehavSession.isDestroyed())
                return;
            if (oBehavSession.BehavAccount && oBehavSession.BehavAccount.BehavPlayer)
                oBehavSession.BehavAccount.BehavPlayer.BeSyncProperty(data.name, data.value);
        }
    }
    Share.CSingleton(Share.CProtocolMgr).registerController(CG2CPtcSyncProperty, Share.EProtocolType.SyncProperty);
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CBehavSceneInterface extends Share.CUnitBehavior {
        constructor(s) {
            super(s);
        }
        get OnEnter() {
            return this.m_oBehavScene.OnEnter;
        }
        get OnLeave() {
            return this.m_oBehavScene.OnLeave;
        }
        _awake() {
            this.m_oBehavScene = this.getComponent(Share.CBehavScene);
        }
    }
    ClientCore.CBehavSceneInterface = CBehavSceneInterface;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CUnitScene extends Share.CUnit {
        constructor() {
            super(Share.CUBC(Share.CBehavTimerMgr), [Share.CUBC(Share.CBehavScene), Share.CUBC(ClientCore.CBehavSceneInterface)]);
            this.m_oBehavScene = this.getComponent(Share.CBehavScene);
        }
        get BehavScene() {
            return this.m_oBehavScene;
        }
    }
    ClientCore.CUnitScene = CUnitScene;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CBehavAccount extends Share.CUnitBehavior {
        constructor(s) {
            super(s);
        }
        _awake() {
            this.m_oBehavSession = this.getComponent(ClientCore.CBehavSession);
            this.m_oBehavPlayer = this.getComponent(ClientCore.CBehavPlayer);
        }
        get BehavPlayer() {
            return this.m_oBehavPlayer;
        }
        get BehavSession() {
            return this.m_oBehavSession;
        }
        get AccountInfo() {
            return this.m_oAccountInfo;
        }
        setAccountInfo(oAccountInfo) {
            this.m_oAccountInfo = oAccountInfo;
        }
        getPlayerBriefInfo(nPlayerIndex) {
            let oPlayer = this.m_oAccountInfo.playerUIDs[nPlayerIndex];
            return oPlayer;
        }
    }
    ClientCore.CBehavAccount = CBehavAccount;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CBehavClientSessionInterface extends Share.CUnitBehavior {
        constructor(s) {
            super(s);
            this.m_onGemChanged = new Share.CDelegate();
            this.m_onCoinChanged = new Share.CDelegate();
            this.m_onLevelChanged = new Share.CDelegate();
            this.m_onExpChanged = new Share.CDelegate();
        }
        _awake() {
            this.m_oBehavSession = this.getComponent(ClientCore.CBehavSession);
            this.m_oBehavPlayer = this.getComponent(ClientCore.CBehavPlayer);
            this.m_oBehavAccount = this.getComponent(ClientCore.CBehavAccount);
            this.m_oBehavPlayerList = this.getComponent(ClientCore.CBehavPlayerList);
            this.m_oBehavWorldGate = this.getComponent(ClientCore.CBehavWorldGate);
            this.m_oBehavSceneCtrl = this.getComponent(Share.CBehavSceneCtrl);
            this.m_oBehavProperty = this.getComponent(Share.CBehavProperty);
            this.m_oBehavReborn = this.getComponent(ClientCore.CBehavReborn);
            this.m_oBehavUpgrade = this.getComponent(ClientCore.CBehavUpgrade);
            this.m_oBehavShop = this.getComponent(ClientCore.CBehavShop);
            this.m_oBehavPropertyCalc = this.getComponent(Share.CBehavPropertyCalc);
            this.m_oBehavOffline = this.getComponent(ClientCore.CBehavOffline);
            this.m_oBehavFriend = this.getComponent(ClientCore.CBehavFriend);
            this.m_oBehavMail = this.getComponent(ClientCore.CBehavMail);
            this.m_oBehavProperty.OnPropertyChanged.add((eType, name, prevValue, nextValue) => {
                if (eType === Share.EPropertyContainerType.Property) {
                    switch (name) {
                        case Share.EPropertyType[Share.EPropertyType.Gem]:
                            this.m_onGemChanged.invoke(prevValue, nextValue);
                            break;
                        case Share.EPropertyType[Share.EPropertyType.Coin]:
                            this.m_onCoinChanged.invoke(prevValue, nextValue);
                            break;
                        case Share.EPropertyType[Share.EPropertyType.Level]:
                            this.m_onLevelChanged.invoke(prevValue, nextValue);
                            break;
                        case Share.EPropertyType[Share.EPropertyType.Exp]:
                            this.m_onExpChanged.invoke(prevValue, nextValue);
                            break;
                    }
                }
            });
        }
        get BehavSession() {
            return this.m_oBehavSession;
        }
        get BehavPropertyCalc() {
            return this.m_oBehavPropertyCalc;
        }
        get BehavProperty() {
            return this.m_oBehavProperty;
        }
        get OnGemChanged() {
            return this.m_onGemChanged;
        }
        get OnCoinChanged() {
            return this.m_onCoinChanged;
        }
        get OnLevelChanged() {
            return this.m_onLevelChanged;
        }
        get OnExpChanged() {
            return this.m_onExpChanged;
        }
        get AccountInfo() {
            return this.m_oBehavAccount.AccountInfo;
        }
        get PlayerInfo() {
            return this.m_oBehavPlayer.PlayerInfo;
        }
        get Scene() {
            return this.m_oBehavSceneCtrl.Scene;
        }
        get OnBeforeSwitchScene() {
            return this.m_oBehavSceneCtrl.OnBeforeSwitchScene;
        }
        get OnAfterSwitchScene() {
            return this.m_oBehavSceneCtrl.OnAfterSwitchScene;
        }
        get HasMercenary2() {
            return this.m_oBehavPlayer.PlayerInfo.Mercenary2EndTimestamp > (Date.now() / 1000) >>> 0;
        }
        wxLogin(code) {
            let oRpcArg = new Share.CWxLoginArg();
            oRpcArg.val.data = { code: code };
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }
        login(oArg) {
            return this.m_oBehavSession.login(oArg);
        }
        logout() {
            return this.m_oBehavSession.logout();
        }
        setGuaJiTimescale(value) {
            this.m_oBehavSceneCtrl.Scene.BehavTimerMgr.TimerMgr.TimeScale = value;
        }
        createPlayer(strPlayerName) {
            return this.m_oBehavPlayerList.createPlayer(strPlayerName);
        }
        enterWorld(nPlayerIndex, strInviterUID, strInviterAct = "", shareType = -1) {
            return this.m_oBehavWorldGate.enterWorld(nPlayerIndex, strInviterUID, strInviterAct, shareType);
        }
        leaveWorld() {
            return this.m_oBehavWorldGate.leaveWorld();
        }
        save(oPlayerInfo) {
            return this.m_oBehavPlayer.save(oPlayerInfo);
        }
        saveUserData(oPlayerInfo) {
            return this.m_oBehavPlayer.saveUserData(oPlayerInfo);
        }
        startRain() {
            return this.m_oBehavPlayer.startRain();
        }
        openTractor() {
            return this.m_oBehavPlayer.openTractor();
        }
        gotoMarket() {
            return this.m_oBehavPlayer.gotoMarket();
        }
        reborn() {
            return this.m_oBehavReborn.reborn();
        }
        upgradeProperty(nPropertyID, nTimes = 1) {
            return this.m_oBehavUpgrade.upgradeProperty(nPropertyID, nTimes);
        }
        buy(nShopID, nGoodsID, nCount = 1) {
            return this.m_oBehavShop.buy(nShopID, nGoodsID, nCount);
        }
        claimOfflineReward(bDouble) {
            return this.m_oBehavOffline.claim(bDouble);
        }
        getOfflineReward() {
            return this.m_oBehavOffline.getOfflineReward();
        }
        claimInviteReward(nInviteAttrID) {
            return this.m_oBehavFriend.claimInviteReward(nInviteAttrID);
        }
        getInvitees() {
            return this.m_oBehavFriend.getInvitees();
        }
        getInviteesByShareType(shareType, startTime, endTime) {
            return this.m_oBehavFriend.getInviteesByShareType(shareType, startTime, endTime);
        }
        reqAddFriend(playerAct) {
            return this.m_oBehavFriend.reqAddFriend(playerAct);
        }
        addFriend(playerAct) {
            return this.m_oBehavFriend.addFriend(playerAct);
        }
        ignoreFriendRequest(playerAct) {
            return this.m_oBehavFriend.ignoreFriendRequest(playerAct);
        }
        dali(playerAct) {
            return this.m_oBehavFriend.dali(playerAct);
        }
        daoluan(playerAct) {
            return this.m_oBehavFriend.daoluan(playerAct);
        }
        fire(playerAct) {
            return this.m_oBehavFriend.fire(playerAct);
        }
        modifyMail(id, status) {
            return this.m_oBehavMail.modifyMail(id, status);
        }
        queryPlayer(playerAct) {
            let oRpcArg = new Share.CQueryPlayerArg();
            oRpcArg.val.data = { accountName: playerAct };
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }
        queryUserData(playerAct) {
            let oRpcArg = new Share.CQueryUserDataArg();
            oRpcArg.val.data = { ActName: playerAct };
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }
        getRandomUser() {
            let oRpcArg = new Share.CGetRandomUserArg();
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }
        getTick() {
            let oRpcArg = new Share.CGetTickArg();
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }
    }
    ClientCore.CBehavClientSessionInterface = CBehavClientSessionInterface;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CBehavFriend extends Share.CUnitBehavior {
        constructor(oUnit) {
            super(oUnit);
        }
        _awake() {
            this.m_oBehavSession = this.getComponent(ClientCore.CBehavSession);
        }
        getInvitees() {
            let oRpcArg = new Share.CGetInviteesArg();
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }
        getInviteesByShareType(shareType, startTime, endTime) {
            let oRpcArg = new Share.CGetInviteesByShareTypeArg();
            oRpcArg.val.data = { shareType: shareType, startTime: startTime, endTime: endTime };
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }
        claimInviteReward(nInviteAttrID) {
            let oRpcArg = new Share.CClaimInviteRewardArg();
            oRpcArg.val.data = {
                inviteAttrId: nInviteAttrID
            };
            return this.m_oBehavSession.callRpc(oRpcArg.val).then((data) => {
                if (data.errno == Share.EErrorNo.Success)
                    return Promise.reject(null);
                return Promise.reject(data);
            }).catch((error) => {
                if (error == null) {
                    return Share.CSingleton(Share.CErrorMsgHelper).successMsg({});
                }
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }
        reqAddFriend(playerAct) {
            let oRpcArg = new Share.CFriendRequestArg();
            oRpcArg.val.data = {
                playerAct: playerAct
            };
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }
        addFriend(playerAct) {
            let oRpcArg = new Share.CAddFriendArg();
            oRpcArg.val.data = {
                playerAct: playerAct
            };
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }
        ignoreFriendRequest(playerAct) {
            let oRpcArg = new Share.CIgnoreFriendRequestArg();
            oRpcArg.val.data = {
                playerAct: playerAct
            };
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }
        dali(playerAct) {
            let oRpcArg = new Share.CDaLiArg();
            oRpcArg.val.data = {
                playerAct: playerAct
            };
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }
        daoluan(playerAct) {
            let oRpcArg = new Share.CDaoLuanArg();
            oRpcArg.val.data = {
                playerAct: playerAct
            };
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }
        fire(playerAct) {
            let oRpcArg = new Share.CFireArg();
            oRpcArg.val.data = {
                playerAct: playerAct
            };
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }
    }
    ClientCore.CBehavFriend = CBehavFriend;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CBehavMail extends Share.CUnitBehavior {
        constructor(oUnit) {
            super(oUnit);
        }
        _awake() {
            this.m_oBehavSession = this.getComponent(ClientCore.CBehavSession);
        }
        modifyMail(id, status) {
            let oRpcArg = new Share.CModifyMailArg();
            oRpcArg.val.data = {
                id: id,
                status: status,
            };
            return this.m_oBehavSession.callRpc(oRpcArg.val);
        }
    }
    ClientCore.CBehavMail = CBehavMail;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CBehavOffline extends Share.CUnitBehavior {
        constructor(oUnit) {
            super(oUnit);
        }
        _awake() {
            this.m_oBehavSession = this.getComponent(ClientCore.CBehavSession);
            this.m_oBehavProperty = this.getComponent(Share.CBehavProperty);
            this.m_oBehavPropertyCalc = this.getComponent(Share.CBehavPropertyCalc);
        }
        claim(bDouble) {
            let oRpcArg = new Share.CProtocolArg(Share.EProtocolType.ClaimOfflineReward);
            oRpcArg.data = {
                bDouble: bDouble
            };
            return this.m_oBehavSession.callRpc(oRpcArg).then((data) => {
                if (data.errno == Share.EErrorNo.Success)
                    return Promise.reject(null);
                return Promise.reject(data);
            }).catch((error) => {
                if (error == null) {
                    return Share.CSingleton(Share.CErrorMsgHelper).successMsg({});
                }
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }
        getOfflineReward() {
            let nOfflineSeconds = this.m_oBehavProperty.get(Share.EPropertyContainerType.Property, Share.EPropertyType[Share.EPropertyType.OfflineSeconds]);
            return this.m_oBehavPropertyCalc.getOfflineCoinPerSecond() * nOfflineSeconds;
        }
    }
    ClientCore.CBehavOffline = CBehavOffline;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CBehavPlayer extends Share.CUnitBehavior {
        constructor(s) {
            super(s);
            this.m_nDeltaGuaJiExtExp = 0;
        }
        _awake() {
            this.m_oBehavSession = this.getComponent(ClientCore.CBehavSession);
            this.m_oBehavProperty = this.getComponent(Share.CBehavProperty);
            this.m_oBehavProperty.register(Share.EPropertyContainerType.VirtualProperty, {});
            this.m_oBehavProperty.register(Share.EPropertyContainerType.ViewProperty, {});
            this.m_oBehavPropertyCalc = this.getComponent(Share.CBehavPropertyCalc);
        }
        _onGuaJiExtExpChanged(prevValue, nextValue) {
            let deltaValue = nextValue - prevValue;
            this._syncDeltaGuaJiExtExp(deltaValue);
        }
        _syncDeltaGuaJiExtExp(deltaValue) {
        }
        get BehavSession() {
            return this.m_oBehavSession;
        }
        get PlayerInfo() {
            return this.m_oPlayerInfo;
        }
        BeSyncProperty(name, value) {
            this.m_oBehavProperty.set(Share.EPropertyContainerType.Property, name, value);
        }
        setPlayerInfo(oPlayerInfo) {
            this.m_oPlayerInfo = oPlayerInfo;
            this.m_oBehavProperty.register(Share.EPropertyContainerType.Property, oPlayerInfo);
        }
        _destroy() {
            if (this.m_oSyncGuaJiExtExpTimer)
                clearTimeout(this.m_oSyncGuaJiExtExpTimer);
        }
        save(oPlayerInfo) {
            let oRpcArg = new Share.CProtocolArg(Share.EProtocolType.SavePlayer);
            oRpcArg.data = {
                coin: oPlayerInfo.Coin,
                gem: oPlayerInfo.Gem,
                notificationLastShowTime: oPlayerInfo.NotificationLastShowTime,
                userData: oPlayerInfo.UserData,
                statistics: oPlayerInfo.Statistics,
            };
            return this.m_oBehavSession.callRpc(oRpcArg).then((data) => {
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(null);
            }).catch((error) => {
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }
        saveUserData(oPlayerInfo) {
            let oRpcArg = new Share.CProtocolArg(Share.EProtocolType.SaveUserData);
            oRpcArg.data = {
                nickName: oPlayerInfo.Name,
                avatar: oPlayerInfo.Avatar,
                customData: oPlayerInfo.CustomData,
            };
            return this.m_oBehavSession.callRpc(oRpcArg).then((data) => {
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(null);
            }).catch((error) => {
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }
        startRain() {
            let oRpcArg = new Share.CProtocolArg(Share.EProtocolType.StartRain);
            return this.m_oBehavSession.callRpc(oRpcArg).then((data) => {
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(data);
            }).catch((error) => {
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }
        openTractor() {
            let oRpcArg = new Share.CProtocolArg(Share.EProtocolType.OpenTractor);
            return this.m_oBehavSession.callRpc(oRpcArg).then((data) => {
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(data);
            }).catch((error) => {
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }
        gotoMarket() {
            let oRpcArg = new Share.CProtocolArg(Share.EProtocolType.GotoMarket);
            return this.m_oBehavSession.callRpc(oRpcArg).then((data) => {
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(data);
            }).catch((error) => {
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }
    }
    ClientCore.CBehavPlayer = CBehavPlayer;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CBehavPlayerAttacker extends Share.CUnitBehavior {
        constructor(s) {
            super(s);
        }
    }
    ClientCore.CBehavPlayerAttacker = CBehavPlayerAttacker;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CBehavPlayerList extends Share.CUnitBehavior {
        constructor(s) {
            super(s);
        }
        _awake() {
            this.m_oBehavSession = this.getComponent(ClientCore.CBehavSession);
            this.m_oBehavAccount = this.getComponent(ClientCore.CBehavAccount);
        }
        get BehavSession() {
            return this.m_oBehavSession;
        }
        getPlayerList() {
            if (this.m_oBehavAccount.AccountInfo == null)
                return null;
            return this.m_oBehavAccount.AccountInfo.playerUIDs;
        }
        getPlayerCount() {
            if (this.m_oBehavAccount.AccountInfo == null || this.m_oBehavAccount.AccountInfo.playerUIDs == null)
                return 0;
            let nCount = 0;
            let arr = this.m_oBehavAccount.AccountInfo.playerUIDs;
            for (let i = 0; i != arr.length; ++i) {
                if (arr[i])
                    nCount++;
            }
            return nCount;
        }
        createPlayer(strPlayerName) {
            let oRpcArg = new Share.CProtocolArg(Share.EProtocolType.CreatePlayer);
            oRpcArg.data = {
                playerName: strPlayerName
            };
            return this.m_oBehavSession.callRpc(oRpcArg).then((data) => {
                if (data.errno == Share.EErrorNo.Success) {
                    this.m_oBehavAccount.AccountInfo.playerUIDs[data.ext.index] = data.ext.playerUID;
                }
                return Promise.reject(data);
            }).catch((error) => {
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }
    }
    ClientCore.CBehavPlayerList = CBehavPlayerList;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CBehavReborn extends Share.CUnitBehavior {
        constructor(oUnit) {
            super(oUnit);
        }
        _awake() {
            this.m_oBehavSession = this.getComponent(ClientCore.CBehavSession);
        }
        reborn() {
            let oRpcArg = new Share.CProtocolArg(Share.EProtocolType.Reborn);
            oRpcArg.data = {};
            return this.m_oBehavSession.callRpc(oRpcArg).then((data) => {
                if (data.errno == Share.EErrorNo.Success)
                    return Promise.reject(null);
                return Promise.reject(data);
            }).catch((error) => {
                if (error == null) {
                    return Share.CSingleton(Share.CErrorMsgHelper).successMsg({});
                }
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }
    }
    ClientCore.CBehavReborn = CBehavReborn;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CBehavSession extends Share.CUnitBehavior {
        constructor(s, oClientCore) {
            super(s);
            this.m_onClosed = new Share.CAsyncDelegate();
            this.m_onRelogin = new Share.CDelegate();
            this.m_onKickout = new Share.CAsyncDelegate();
            this.m_onInvite = new Share.CDelegate();
            this.m_onFriendRequest = new Share.CDelegate();
            this.m_onFriendResponse = new Share.CDelegate();
            this.m_bKickouted = false;
            this.m_inAreas = false;
            this.m_oClientCore = oClientCore;
            this.m_strUrl = oClientCore.GameServer;
        }
        get OnRelogin() {
            return this.m_onRelogin;
        }
        get SessionUID() {
            return this.m_oSessionUID;
        }
        get SessionToken() {
            return this.m_strSessionToken;
        }
        get InAreas() {
            return this.m_inAreas;
        }
        _awake() {
            this.m_oBehavAccount = this.getComponent(ClientCore.CBehavAccount);
        }
        get BehavAccount() {
            return this.m_oBehavAccount;
        }
        get ClientCore() {
            return this.m_oClientCore;
        }
        get OnClosed() {
            return this.m_onClosed;
        }
        get OnInvite() {
            return this.m_onInvite;
        }
        get OnFriendRequest() {
            return this.m_onFriendRequest;
        }
        get OnFriendResponse() {
            return this.m_onFriendResponse;
        }
        _destroy() {
            if (this.m_oSession != null)
                this.m_oSession.close();
        }
        _reconnect(times) {
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
        _connect() {
            if (this.m_strUrl == null || this.m_strUrl === "")
                return Promise.resolve(Share.EErrorNo.InvalidArguments);
            if (!this.isClosed())
                return Promise.resolve(Share.EErrorNo.Connected);
            let oSendReceiver;
            return ClientCore.CWSConnector.connect(this.m_strUrl).then((data) => {
                oSendReceiver = data;
                if (oSendReceiver == null)
                    return Promise.reject(new Error("connect failed"));
                if (this.isDisabled()) {
                    oSendReceiver.close();
                    return Promise.reject(new Error("Behavior Disabled"));
                }
                let oSession = new Share.CSession(oSendReceiver, (sr) => {
                    sr.close();
                });
                oSendReceiver.onClose(() => {
                    oSession.close();
                });
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
                });
                this.m_oSession = oSession;
                return Share.EErrorNo.Success;
            }).catch((err) => {
                Share.CLogHelper.warn(err);
                return Share.EErrorNo.Fail;
            });
        }
        get isLogined() {
            return !this.isClosed() && this.m_oSessionUID != null;
        }
        close() {
            if (this.m_oSession != null) {
                this.m_oSession.close();
                this.m_oSession = null;
            }
            this.m_oSessionUID = null;
            this.m_bToClose = true;
            if (this.m_oPingTimer) {
                clearTimeout(this.m_oPingTimer);
                this.m_oPingTimer = null;
            }
        }
        isClosed() {
            return this.m_oSession == null || this.m_oSession.isClosed();
        }
        _restartPing() {
            if (this.isClosed())
                return;
            if (this.m_oPingTimer)
                clearTimeout(this.m_oPingTimer);
            this.m_oSession.sendPtc(new Share.CProtocolArg(Share.EProtocolType.Ping));
            this.m_oPingTimer = setTimeout(() => {
                this._restartPing();
            }, 30000);
        }
        _login() {
            if (!this.m_strAccountName)
                return Promise.resolve(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(Share.EErrorNo.InvalidArguments));
            if (this.m_oSession.isClosed())
                return Promise.resolve(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(Share.EErrorNo.SessionClosed));
            if (this.isLogined)
                return Promise.resolve(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(Share.EErrorNo.InvalidOperation));
            let oRpcArg = new Share.CLoginArg();
            oRpcArg.val.data = {
                accountName: this.m_strAccountName,
                sign: this.m_strSign,
                channelToken: this.m_strChannelToken
            };
            return this.m_oSession.callRpc(oRpcArg.val).then((oRpcRet) => {
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
                if (error.errno == 0)
                    this._restartPing();
                else
                    this.m_oSessionUID = null;
                return error;
            });
        }
        login(oArg) {
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
        logout() {
            if (!this.isLogined)
                return Promise.resolve(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(Share.EErrorNo.Fail));
            let oRpcArg = new Share.CLogoutArg();
            oRpcArg.val.data.accountName = this.m_oBehavAccount.AccountInfo.accountName;
            return this.m_oSession.callRpc(oRpcArg.val).then((data) => {
                if (data.errno == 0) {
                    this.m_oSession.close();
                }
                return Promise.reject(null);
            }).catch((error) => {
                if (error == null) {
                    this.m_oSessionUID = null;
                    return Share.CSingleton(Share.CErrorMsgHelper).successMsg();
                }
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }
        beKickout() {
            this.m_bKickouted = true;
            Share.CLogHelper.warn("be kickout");
            this.m_onKickout.invoke();
            if (this.m_oSession)
                this.m_oSession.close();
        }
        _reLogin(bLogin = false) {
            if (this.m_bKickouted)
                return Promise.resolve(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(Share.EErrorNo.Fail));
            if (this.isLogined)
                return Promise.resolve(Share.CSingleton(Share.CErrorMsgHelper).successMsg());
            if (bLogin) {
                return this.login({
                    accountName: this.m_strAccountName,
                    sign: this.m_strSign,
                    channelToken: this.m_strChannelToken
                }).then((data) => {
                    if (data.errno == 0) {
                        return Promise.all(this.m_onRelogin.invoke()).then((datas) => {
                            if (datas == null)
                                return Share.CSingleton(Share.CErrorMsgHelper).successMsg();
                            for (let i = 0; i != datas.length; ++i) {
                                if (datas[i].errno != 0)
                                    return datas[i];
                            }
                            return Share.CSingleton(Share.CErrorMsgHelper).successMsg();
                        });
                    }
                    if (data.errno == Share.EErrorNo.TryAgain) {
                        return Share.CPromiseHelper.delay(500).then(() => {
                            return this._reLogin(true);
                        });
                    }
                    return data;
                });
            }
            let p = Promise.resolve(Share.EErrorNo.Success);
            if (this.isClosed())
                p = this._reconnect(10);
            return p.then((data) => {
                if (data != Share.EErrorNo.Success)
                    return Promise.reject(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(data));
                let oRpcArg = new Share.CReLoginArg();
                oRpcArg.val.data = {
                    accountName: this.m_strAccountName,
                    sessionUID: this.m_oLastLoginSessionUID,
                    sessionToken: this.m_strSessionToken
                };
                return this.m_oSession.callRpc(oRpcArg.val);
            }).then((data) => {
                if (data.errno == 0)
                    return Promise.reject(null);
                return this._reLogin(true);
            }).then((data) => {
                if (data.errno == 0)
                    return Promise.reject(null);
                return Promise.reject(data);
            }).catch((error) => {
                if (error == null)
                    return Share.CSingleton(Share.CErrorMsgHelper).successMsg();
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }
        onInvite(data) {
            this.m_onInvite.invoke(data);
        }
        onFriendRequest(data) {
            this.m_onFriendRequest.invoke(data);
        }
        onFriendResponse(data) {
            this.m_onFriendResponse.invoke(data);
        }
        callRpc(arg, timeoutMilliSeconds = 20000) {
            if (this.isLogined || arg.type == Share.EProtocolType.ReLogin || arg.type == Share.EProtocolType.Login)
                return this.m_oSession.callRpc(arg, timeoutMilliSeconds);
            return this._reLogin().then((data) => {
                if (data.errno != 0) {
                    this.OnClosed.invoke();
                    return Promise.reject(new Error("send on a closed session"));
                }
                return this.m_oSession.callRpc(arg, timeoutMilliSeconds);
            });
        }
        sendPtc(arg) {
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
    ClientCore.CBehavSession = CBehavSession;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CBehavShop extends Share.CUnitBehavior {
        constructor(oUnit) {
            super(oUnit);
        }
        _awake() {
            this.m_oBehavSession = this.getComponent(ClientCore.CBehavSession);
        }
        buy(nShopID, nGoodsID, nCount = 1) {
            let oRpcArg = new Share.CProtocolArg(Share.EProtocolType.Buy);
            oRpcArg.data = {
                shopID: nShopID,
                goodsID: nGoodsID,
                count: nCount
            };
            return this.m_oBehavSession.callRpc(oRpcArg).then((data) => {
                if (data.errno == Share.EErrorNo.Success)
                    return Promise.reject(null);
                return Promise.reject(data);
            }).catch((error) => {
                if (error == null) {
                    return Share.CSingleton(Share.CErrorMsgHelper).successMsg({});
                }
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }
    }
    ClientCore.CBehavShop = CBehavShop;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CBehavUpgrade extends Share.CUnitBehavior {
        constructor(oUnit) {
            super(oUnit);
        }
        _awake() {
            this.m_oBehavSession = this.getComponent(ClientCore.CBehavSession);
        }
        upgradeProperty(nPropertyID, nTimes = 1) {
            let oRpcArg = new Share.CProtocolArg(Share.EProtocolType.UpgradeProperty);
            oRpcArg.data = {
                propertyID: nPropertyID,
                times: nTimes
            };
            return this.m_oBehavSession.callRpc(oRpcArg).then((data) => {
                if (data.errno == Share.EErrorNo.Success)
                    return Promise.reject(null);
                return Promise.reject(data);
            }).catch((error) => {
                if (error == null) {
                    return Share.CSingleton(Share.CErrorMsgHelper).successMsg({});
                }
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }
    }
    ClientCore.CBehavUpgrade = CBehavUpgrade;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CBehavVirtualProperty extends Share.CUnitBehavior {
    }
    ClientCore.CBehavVirtualProperty = CBehavVirtualProperty;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    class CBehavWorldGate extends Share.CUnitBehavior {
        constructor(s) {
            super(s);
        }
        _awake() {
            this.m_oBehavAccount = this.getComponent(ClientCore.CBehavAccount);
            this.m_oBehavPlayer = this.getComponent(ClientCore.CBehavPlayer);
            this.m_oBehavSession = this.getComponent(ClientCore.CBehavSession);
            this.m_oBehavSceneCtrl = this.getComponent(Share.CBehavSceneCtrl);
            this.m_oBehavSession.OnRelogin.add(this._onRelogin, this);
        }
        _onRelogin() {
            if (this.m_oBehavPlayer.PlayerInfo == null || this.m_nEnterWorldPlayerIndex == null)
                return Promise.resolve(Share.CSingleton(Share.CErrorMsgHelper).successMsg());
            return this.enterWorld(this.m_nEnterWorldPlayerIndex);
        }
        enterWorld(nPlayerIndex, strInviterUID = "", strInviterAct = "", shareType = -1) {
            let oRpcArg = new Share.CProtocolArg(Share.EProtocolType.EnterWorld);
            oRpcArg.data = {
                playerIndex: nPlayerIndex,
                inviterUID: strInviterUID,
                inviterAct: strInviterAct,
                shareType: shareType
            };
            let scene;
            return this.m_oBehavSession.callRpc(oRpcArg).then((data) => {
                if (data.errno != 0) {
                    return Promise.reject(data);
                }
                this.m_nEnterWorldPlayerIndex = nPlayerIndex;
                this.m_oBehavPlayer.setPlayerInfo(data.ext);
                scene = new ClientCore.CUnitScene();
                scene.BehavScene.ID = 1;
                return this.m_oBehavSceneCtrl.enterScene(scene.BehavScene);
            }).then((nErrorNo) => {
                if (nErrorNo != Share.EErrorNo.Success) {
                    scene.destroy();
                    return Promise.reject(Share.CSingleton(Share.CErrorMsgHelper).createErrorMsg(nErrorNo, ""));
                }
                return Promise.reject(null);
            }).catch((error) => {
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        }
        leaveWorld() {
            let oRpcArg = new Share.CProtocolArg(Share.EProtocolType.LeaveWorld);
            oRpcArg.data = {
                accountName: this.m_oBehavAccount.AccountInfo.accountName,
                sessionUID: this.m_oBehavSession.SessionUID,
                sessionToken: this.m_oBehavSession.SessionToken
            };
            return this.m_oBehavSession.callRpc(oRpcArg).then((data) => {
                if (data.errno == 0) {
                    let scene = this.m_oBehavSceneCtrl.Scene;
                    if (scene) {
                        this.m_oBehavSceneCtrl.leaveScene().then(() => {
                            scene.destroy();
                        });
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
    ClientCore.CBehavWorldGate = CBehavWorldGate;
})(ClientCore || (ClientCore = {}));
var Share;
(function (Share) {
    class CPtcInviteArg {
        constructor() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.Invite);
        }
    }
    Share.CPtcInviteArg = CPtcInviteArg;
})(Share || (Share = {}));
