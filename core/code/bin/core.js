var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Share;
(function (Share) {
    var CUnit = (function () {
        function CUnit() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this.m_oBehaviorList = [];
            this.m_bIsDestroyed = false;
            if (args == null || args.length == 0)
                return;
            for (var i = 0; i != args.length; ++i) {
                var t = new args[i](this);
                this[args[i].BehaviorId] = t;
                this.m_oBehaviorList.push(t);
            }
            for (var i = 0; i != this.m_oBehaviorList.length; ++i) {
                var t = this.m_oBehaviorList[i];
                t["_awake"].call(t);
            }
            for (var i = 0; i != this.m_oBehaviorList.length; ++i) {
                var t = this.m_oBehaviorList[i];
                t["_start"].call(t);
            }
        }
        CUnit.prototype.isDestroyed = function () {
            return this.m_bIsDestroyed;
        };
        CUnit.prototype.getComponent = function (b) {
            if (this.isDestroyed())
                return null;
            var t = this[b.BehaviorId];
            return t == null ? null : t;
        };
        CUnit.prototype.destroy = function () {
            if (this.isDestroyed())
                return;
            this.m_bIsDestroyed = true;
            var aBehaviorList = this.m_oBehaviorList;
            setTimeout(function () {
                var nLen = aBehaviorList.length;
                for (var i = nLen - 1; i >= 0; --i)
                    aBehaviorList[i]['_destroy'].call(aBehaviorList[i]);
            }, 0);
        };
        return CUnit;
    }());
    Share.CUnit = CUnit;
})(Share || (Share = {}));
var Share;
(function (Share) {
    var CUnitBehavior = (function () {
        function CUnitBehavior(s) {
            this.m_bIsDisabled = false;
            this.m_oOwner = s;
        }
        Object.defineProperty(CUnitBehavior, "BehaviorId", {
            get: function () {
                if (this["s_nBehaviorId"] == null) {
                    if (!CUnitBehavior["maxBehaviorId"])
                        CUnitBehavior["maxBehaviorId"] = 0;
                    this["s_nBehaviorId"] = (++CUnitBehavior["maxBehaviorId"]).toString();
                }
                return this["s_nBehaviorId"];
            },
            enumerable: true,
            configurable: true
        });
        CUnitBehavior.prototype.setDisable = function (bDisable) {
            var _this = this;
            if (this.m_bIsDisabled == bDisable)
                return;
            this.m_bIsDisabled = bDisable;
            if (this.m_bIsDisabled) {
                setTimeout(function () {
                    _this._disable();
                }, 0);
            }
            else {
                setTimeout(function () {
                    _this._enable();
                }, 0);
            }
        };
        CUnitBehavior.prototype.getComponent = function (b) {
            return this.m_oOwner == null ? null : this.m_oOwner.getComponent(b);
        };
        CUnitBehavior.prototype.destroy = function () {
            this.m_oOwner.destroy();
        };
        CUnitBehavior.prototype.isDestroyed = function () {
            return this.m_oOwner.isDestroyed();
        };
        CUnitBehavior.prototype._awake = function () { };
        CUnitBehavior.prototype._start = function () { };
        CUnitBehavior.prototype._destroy = function () { };
        CUnitBehavior.prototype._enable = function () { };
        CUnitBehavior.prototype._disable = function () { };
        return CUnitBehavior;
    }());
    Share.CUnitBehavior = CUnitBehavior;
})(Share || (Share = {}));
var Share;
(function (Share) {
    var EProtocolType;
    (function (EProtocolType) {
        EProtocolType[EProtocolType["Login"] = 1] = "Login";
        EProtocolType[EProtocolType["Logout"] = 2] = "Logout";
        EProtocolType[EProtocolType["Kickout"] = 3] = "Kickout";
    })(EProtocolType = Share.EProtocolType || (Share.EProtocolType = {}));
})(Share || (Share = {}));
var Share;
(function (Share) {
    var CProtocolMgr = (function () {
        function CProtocolMgr() {
            this.m_oControllers = [];
        }
        CProtocolMgr.prototype.registerController = function (c, eType) {
            this.m_oControllers[eType] = c;
        };
        CProtocolMgr.prototype.getController = function (eType) {
            return this.m_oControllers[eType];
        };
        return CProtocolMgr;
    }());
    Share.CProtocolMgr = CProtocolMgr;
})(Share || (Share = {}));
var Share;
(function (Share) {
    var CLoginArg = (function () {
        function CLoginArg() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.Login);
        }
        return CLoginArg;
    }());
    Share.CLoginArg = CLoginArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    var ELogLevel;
    (function (ELogLevel) {
        ELogLevel[ELogLevel["none"] = -1] = "none";
        ELogLevel[ELogLevel["debug"] = 0] = "debug";
        ELogLevel[ELogLevel["info"] = 1] = "info";
        ELogLevel[ELogLevel["warn"] = 2] = "warn";
        ELogLevel[ELogLevel["error"] = 3] = "error";
    })(ELogLevel = Share.ELogLevel || (Share.ELogLevel = {}));
    var CLogHelper = (function () {
        function CLogHelper() {
        }
        CLogHelper.registerPrinter = function (printer) {
            var logLevel = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                logLevel[_i - 1] = arguments[_i];
            }
            if (printer == null)
                return;
            if (logLevel == null || logLevel.length == 0)
                logLevel = [ELogLevel.debug, ELogLevel.info, ELogLevel.warn, ELogLevel.error];
            for (var i = 0; i != logLevel.length; ++i)
                this._registerPrinter(printer, logLevel[i]);
        };
        CLogHelper._registerPrinter = function (printer, logLevel) {
            if (printer == null || logLevel == null || logLevel == ELogLevel.none)
                return;
            if (this.m_oLogPrinter == null)
                this.m_oLogPrinter = [];
            if (this.m_oLogPrinter[logLevel] == null)
                this.m_oLogPrinter[logLevel] = [];
            this.m_oLogPrinter[logLevel].push(printer);
        };
        CLogHelper.debug = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (this.m_oLogPrinter == null)
                return;
            var oLogPrinters = this.m_oLogPrinter[ELogLevel.debug];
            if (oLogPrinters == null)
                return;
            for (var i = 0; i != oLogPrinters.length; ++i)
                (_a = oLogPrinters[i]).debug.apply(_a, args);
            var _a;
        };
        CLogHelper.info = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (this.m_oLogPrinter == null)
                return;
            var oLogPrinters = this.m_oLogPrinter[ELogLevel.debug];
            if (oLogPrinters == null)
                return;
            for (var i = 0; i != oLogPrinters.length; ++i)
                (_a = oLogPrinters[i]).info.apply(_a, args);
            var _a;
        };
        CLogHelper.warn = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (this.m_oLogPrinter == null)
                return;
            var oLogPrinters = this.m_oLogPrinter[ELogLevel.debug];
            if (oLogPrinters == null)
                return;
            for (var i = 0; i != oLogPrinters.length; ++i)
                (_a = oLogPrinters[i]).warn.apply(_a, args);
            var _a;
        };
        CLogHelper.error = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (this.m_oLogPrinter == null)
                return;
            var oLogPrinters = this.m_oLogPrinter[ELogLevel.debug];
            if (oLogPrinters == null)
                return;
            for (var i = 0; i != oLogPrinters.length; ++i)
                (_a = oLogPrinters[i]).error.apply(_a, args);
            var _a;
        };
        return CLogHelper;
    }());
    Share.CLogHelper = CLogHelper;
})(Share || (Share = {}));
var Share;
(function (Share) {
    var CObjResInfo = (function () {
        function CObjResInfo() {
            this.m_nIndex = 0;
            this.m_nCheckNum = 1;
        }
        return CObjResInfo;
    }());
    Share.CObjResInfo = CObjResInfo;
    var CObjResMgr = (function () {
        function CObjResMgr(nSizeOfPool, objConstructor, objDestructor) {
            this.m_oObjRes = [];
            this.m_oFreeIndex = [];
            this.m_nSize = 0;
            this.m_nSizeOfPool = 0;
            this.m_nSizeOfPool = nSizeOfPool < 0 ? 0 : nSizeOfPool;
            this.m_onObjConstructor = objConstructor;
            this.m_onObjDestructor = objDestructor;
        }
        CObjResMgr.prototype.getSize = function () {
            return this.m_nSize;
        };
        CObjResMgr.prototype.createObj = function (nObjType) {
            var oObjResInfo = null;
            if (nObjType >= this.m_oFreeIndex.length)
                this.m_oFreeIndex[nObjType] = new Share.CQueue();
            if (this.m_oFreeIndex[nObjType] == null)
                this.m_oFreeIndex[nObjType] = new Share.CQueue();
            var oObjectFreeIndexCache = this.m_oFreeIndex[nObjType];
            if (oObjectFreeIndexCache.isEmpty()) {
                oObjResInfo = new CObjResInfo();
                this.m_oObjRes.push(oObjResInfo);
                oObjResInfo.m_nIndex = this.m_oObjRes.length - 1;
                oObjResInfo.m_nCheckNum = 1;
            }
            else {
                var nFreeIndex = oObjectFreeIndexCache.pop();
                oObjResInfo = this.m_oObjRes[nFreeIndex];
                oObjResInfo.m_nIndex = nFreeIndex;
            }
            if (oObjResInfo.m_oObjRes == null) {
                oObjResInfo.m_oObjRes = this.m_onObjConstructor(nObjType);
                if (oObjResInfo.m_oObjRes == null || oObjResInfo.m_oObjRes.getObjType() != nObjType)
                    throw "object type error";
            }
            oObjResInfo.m_oUID = Share.CObjResUIDHelper.toUID(oObjResInfo.m_nIndex, oObjResInfo.m_nCheckNum);
            ++this.m_nSize;
            oObjResInfo.m_oObjRes.qconstructor(oObjResInfo.m_oUID);
            return oObjResInfo.m_oObjRes;
        };
        CObjResMgr.prototype.getObj = function (oUID) {
            var oObjResInfo = this._getObjRes(oUID);
            if (null == oObjResInfo)
                return null;
            return oObjResInfo.m_oObjRes;
        };
        CObjResMgr.prototype.releaseObj = function (oUID) {
            var oObjResInfo = this._getObjRes(oUID);
            this._releaseObj(oObjResInfo);
        };
        CObjResMgr.prototype.releaseAll = function () {
            for (var i = 0; i != this.m_oObjRes.length; i++) {
                var oObjResInfo = this.m_oObjRes[i];
                this._releaseObj(oObjResInfo);
            }
        };
        CObjResMgr.prototype._getObjRes = function (oUID) {
            var nIndex = Share.CObjResUIDHelper.toIndex(oUID);
            var nCheckNum = Share.CObjResUIDHelper.toCheckNum(oUID);
            if (nCheckNum == 0)
                return null;
            if (nIndex >= this.m_oObjRes.length)
                return null;
            var oRet = this.m_oObjRes[nIndex];
            if (oRet == null || oRet.m_nCheckNum != nCheckNum)
                return null;
            return oRet;
        };
        CObjResMgr.prototype._releaseObj = function (oObjResInfo) {
            if (null == oObjResInfo || oObjResInfo.m_oObjRes == null || oObjResInfo.m_oUID.isZero())
                return;
            var oObj = oObjResInfo.m_oObjRes;
            var nObjType = oObj.getObjType();
            oObj.qdestructor();
            --this.m_nSize;
            var nIndex = Share.CObjResUIDHelper.toIndex(oObjResInfo.m_oUID);
            oObjResInfo.m_oUID = Share.CObjResUIDHelper.toUID(0, 0);
            var oRet = this.m_oObjRes[nIndex];
            if (oRet.m_nCheckNum >= Share.CObjResUIDHelper.getMaxCheckNum())
                oRet.m_nCheckNum = 1;
            else
                ++oRet.m_nCheckNum;
            if (this.m_nSize >= this.m_nSizeOfPool) {
                oRet.m_oObjRes = null;
            }
            this.m_oFreeIndex[nObjType].push(oRet.m_nIndex);
            oRet.m_nIndex = this.m_oFreeIndex[nObjType].getCount() - 1;
        };
        return CObjResMgr;
    }());
    Share.CObjResMgr = CObjResMgr;
})(Share || (Share = {}));
var Share;
(function (Share) {
    var COctStream = (function () {
        function COctStream() {
            this.m_oBuffer = new Uint8Array(16);
            this.m_oDataView = new DataView(this.m_oBuffer.buffer);
            this.m_nSize = 0;
            this.m_nPopIndex = 0;
        }
        Object.defineProperty(COctStream.prototype, "Capacity", {
            get: function () {
                return this.m_oBuffer === null ? 0 : this.m_oBuffer.byteLength;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(COctStream.prototype, "Size", {
            get: function () {
                return this.m_nSize;
            },
            enumerable: true,
            configurable: true
        });
        COctStream.prototype.Assign = function (oData, begin, size) {
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
        };
        COctStream.prototype.Clear = function () {
            this.m_nSize = 0;
            this.m_nPopIndex = 0;
        };
        COctStream.prototype.Reserve = function (nCapacity) {
            if (nCapacity <= this.Capacity)
                return;
            var oNewBuffer = new Uint8Array(nCapacity);
            oNewBuffer.set(this.m_oBuffer);
            this.m_oBuffer = oNewBuffer;
            this.m_oDataView = new DataView(this.m_oBuffer.buffer);
        };
        COctStream.prototype.Resize = function (nSize) {
            var nCapacity = this.Capacity;
            if (nSize <= nCapacity) {
                this.m_nSize = nSize;
                return;
            }
            this.Reserve(nCapacity * 2 > nSize ? nCapacity * 2 : nSize);
            this.m_nSize = nSize;
        };
        COctStream.prototype.pushUInt8 = function (val) {
            var nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 1);
            this.m_oDataView.setUint8(nOffset, val);
            return this;
        };
        COctStream.prototype.pushInt8 = function (val) {
            var nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 1);
            this.m_oDataView.setInt8(nOffset, val);
            return this;
        };
        COctStream.prototype.pushUInt16 = function (val) {
            var nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 2);
            this.m_oDataView.setUint16(nOffset, val, true);
            return this;
        };
        COctStream.prototype.pushInt16 = function (val) {
            var nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 2);
            this.m_oDataView.setInt16(nOffset, val, true);
            return this;
        };
        COctStream.prototype.pushUInt32 = function (val) {
            var nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 4);
            this.m_oDataView.setUint32(nOffset, val, true);
            return this;
        };
        COctStream.prototype.pushInt32 = function (val) {
            var nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 4);
            this.m_oDataView.setInt32(nOffset, val, true);
            return this;
        };
        COctStream.prototype.pushUInt64 = function (val) {
            var nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 8);
            this.m_oDataView.setUint32(nOffset, val.getLowBits(), true);
            this.m_oDataView.setUint32(nOffset + 4, val.getHighBits(), true);
            return this;
        };
        COctStream.prototype.pushInt64 = function (val) {
            var nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 8);
            this.m_oDataView.setUint32(nOffset, val.getLowBits(), true);
            this.m_oDataView.setUint32(nOffset + 4, val.getHighBits(), true);
            return this;
        };
        COctStream.prototype.pushFloat = function (val) {
            var nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 4);
            this.m_oDataView.setFloat32(nOffset, val, true);
            return this;
        };
        COctStream.prototype.pushDouble = function (val) {
            var nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 8);
            this.m_oDataView.setFloat64(nOffset, val, true);
            return this;
        };
        COctStream.prototype.pushString = function (val) {
            var oBytes = Share.CUtf8Encoding.Encode(val);
            var nLen = oBytes.length;
            var nOffset = this.m_nSize;
            this.Resize(this.m_nSize + 4 + oBytes.length);
            this.m_oDataView.setUint32(nOffset, nLen, true);
            nOffset += 4;
            this.m_oBuffer.set(oBytes, nOffset);
            return this;
        };
        COctStream.prototype.pushData = function (val) {
            val.Marshal(this);
            return this;
        };
        COctStream.prototype.popUInt8 = function () {
            var val = this.m_oDataView.getUint8(this.m_nPopIndex++);
            return val;
        };
        COctStream.prototype.popInt8 = function () {
            var val = this.m_oDataView.getInt8(this.m_nPopIndex++);
            return val;
        };
        COctStream.prototype.popUInt16 = function () {
            var val = this.m_oDataView.getUint16(this.m_nPopIndex);
            this.m_nPopIndex += 2;
            return val;
        };
        COctStream.prototype.popInt16 = function () {
            var val = this.m_oDataView.getInt16(this.m_nPopIndex);
            this.m_nPopIndex += 2;
            return val;
        };
        COctStream.prototype.popUInt32 = function () {
            var val = this.m_oDataView.getUint32(this.m_nPopIndex);
            this.m_nPopIndex += 4;
            return val;
        };
        COctStream.prototype.popInt32 = function () {
            var val = this.m_oDataView.getInt32(this.m_nPopIndex);
            this.m_nPopIndex += 4;
            return val;
        };
        COctStream.prototype.popUInt64 = function () {
            var low = this.m_oDataView.getUint32(this.m_nPopIndex);
            this.m_nPopIndex += 4;
            var high = this.m_oDataView.getUint32(this.m_nPopIndex);
            this.m_nPopIndex += 4;
            return new Share.CInt64(low, high);
        };
        COctStream.prototype.popInt64 = function () {
            var low = this.m_oDataView.getUint32(this.m_nPopIndex);
            this.m_nPopIndex += 4;
            var high = this.m_oDataView.getUint32(this.m_nPopIndex);
            this.m_nPopIndex += 4;
            return new Share.CInt64(low, high);
        };
        COctStream.prototype.popFloat = function () {
            var val = this.m_oDataView.getFloat32(this.m_nPopIndex);
            this.m_nPopIndex += 4;
            return val;
        };
        COctStream.prototype.popDouble = function () {
            var val = this.m_oDataView.getFloat64(this.m_nPopIndex);
            this.m_nPopIndex += 8;
            return val;
        };
        COctStream.prototype.popString = function () {
            var nLen = this.popUInt32();
            var strData = Share.CUtf8Encoding.Decode(this.m_oBuffer, this.m_nPopIndex, nLen);
            this.m_nPopIndex += nLen;
            return strData;
        };
        COctStream.prototype.popData = function (val) {
            val.UnMarshal(this);
        };
        return COctStream;
    }());
    Share.COctStream = COctStream;
})(Share || (Share = {}));
var Share;
(function (Share) {
    var CPromiseHelper = (function () {
        function CPromiseHelper() {
        }
        CPromiseHelper.resolve = function (value) {
            return Promise.resolve(value);
        };
        CPromiseHelper.reject = function (error) {
            return Promise.reject(error);
        };
        CPromiseHelper.all = function (values) {
            return Promise.all(values);
        };
        CPromiseHelper.race = function (promises) {
            return Promise.race(promises);
        };
        CPromiseHelper.delay = function (millseconds) {
            var cb;
            var oPromise = new Promise(function (resolve, reject) {
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
        };
        CPromiseHelper.createPromise = function () {
            var cb;
            var oPromise = new Promise(function (resolve, reject) {
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
        };
        CPromiseHelper.promisify = function (func, self) {
            var selfthis = this;
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
                func.apply((self ? self : selfthis), args.concat(cb));
                return promise;
            };
        };
        return CPromiseHelper;
    }());
    Share.CPromiseHelper = CPromiseHelper;
})(Share || (Share = {}));
var Share;
(function (Share) {
    var CQueue = (function () {
        function CQueue() {
            this.m_aList = [];
            this.m_nBegin = 0;
            this.m_nEnd = 0;
            this.reserve(2);
        }
        CQueue.prototype.reserve = function (nCapacity) {
            var nRealCapacity = nCapacity + 1;
            if (nRealCapacity <= this.m_aList.length)
                return;
            var dwCurCount = this.getCount();
            var aNewList = [];
            for (var i = this.m_nBegin; i != this.m_nEnd; i = (i + 1) % this.m_aList.length) {
                var value = this.m_aList[i];
                aNewList.push(value);
            }
            aNewList[nRealCapacity - 1] = null;
            this.m_aList = aNewList;
            this.m_nBegin = 0;
            this.m_nEnd = dwCurCount;
        };
        CQueue.prototype.at = function (nIndex) {
            if ((!this.m_aList) || nIndex < 0 || nIndex >= this.getCount())
                throw "out of range";
            return this.m_aList[(this.m_nBegin + nIndex) % this.m_aList.length];
        };
        CQueue.prototype.clear = function () {
            this.m_nEnd = this.m_nBegin = 0;
            this.m_aList = [];
        };
        CQueue.prototype.pop = function () {
            var ret = this.at(0);
            this.m_aList[this.m_nBegin] = undefined;
            this.m_nBegin = (this.m_nBegin + 1) % this.m_aList.length;
            return ret;
        };
        CQueue.prototype.push = function (oItem) {
            if (this.isFull())
                this.reserve(2 * this.getCount());
            this.m_aList[this.m_nEnd] = oItem;
            this.m_nEnd = (this.m_nEnd + 1) % this.m_aList.length;
            return oItem;
        };
        CQueue.prototype.getCount = function () {
            return this.m_nEnd < this.m_nBegin ? this.m_aList.length - this.m_nBegin + this.m_nEnd : this.m_nEnd - this.m_nBegin;
        };
        CQueue.prototype.isEmpty = function () {
            return this.m_nBegin == this.m_nEnd;
        };
        CQueue.prototype.isFull = function () {
            return (this.m_nEnd + 1) % this.m_aList.length == this.m_nBegin;
        };
        return CQueue;
    }());
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
    var CConsoleLogPrinter = (function () {
        function CConsoleLogPrinter() {
        }
        CConsoleLogPrinter.prototype._getTime = function () {
            var time = new Date();
            return "[" + time.getFullYear() + "/" + time.getMonth() + "/" + time.getDate() + " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + "]";
        };
        CConsoleLogPrinter.prototype.debug = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.debug.apply(console, ["[DEBUG]" + this._getTime()].concat(args));
        };
        CConsoleLogPrinter.prototype.info = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.info.apply(console, ["[INFO]" + this._getTime()].concat(args));
        };
        CConsoleLogPrinter.prototype.warn = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.warn.apply(console, ["[WARN]" + this._getTime()].concat(args));
        };
        CConsoleLogPrinter.prototype.error = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.error.apply(console, ["[ERROR]" + this._getTime()].concat(args));
        };
        return CConsoleLogPrinter;
    }());
    Share.CConsoleLogPrinter = CConsoleLogPrinter;
})(Share || (Share = {}));
var Share;
(function (Share) {
    var EErrorNo;
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
        EErrorNo[EErrorNo["TryAgain"] = 9] = "TryAgain";
    })(EErrorNo = Share.EErrorNo || (Share.EErrorNo = {}));
    var CErrorMsgHelper = (function () {
        function CErrorMsgHelper() {
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
        }
        CErrorMsgHelper.prototype.errorMessage = function (errno, errmsg, ext) {
            var t = {
                errno: errno ? errno : 0,
                errmsg: errmsg ? errmsg : ""
            };
            if (ext != null)
                t['ext'] = ext;
            return t;
        };
        CErrorMsgHelper.prototype.errorMsg = function (errno, ext) {
            var t = {
                errno: errno ? errno : 0,
                errmsg: this.errorMap[errno] ? this.errorMap[errno] : ""
            };
            if (ext != null)
                t['ext'] = ext;
            return t;
        };
        CErrorMsgHelper.prototype.successMsg = function (ext) {
            var t = {
                errno: 0,
                errmsg: ""
            };
            if (ext != null)
                t['ext'] = ext;
            return t;
        };
        CErrorMsgHelper.prototype.toErrorMsg = function (err) {
            if (err == null)
                return this.successMsg();
            if (err.errno == null)
                return this.errorMsg(-1, err.toString());
            return err;
        };
        return CErrorMsgHelper;
    }());
    Share.CErrorMsgHelper = CErrorMsgHelper;
})(Share || (Share = {}));
var Share;
(function (Share) {
    var CObjResUIDHelper = (function () {
        function CObjResUIDHelper() {
        }
        CObjResUIDHelper.toUID = function (nIndex, nCheckNum) {
            return new CObjResUID(nIndex, nCheckNum);
        };
        CObjResUIDHelper.toIndex = function (uid) {
            return uid.m_nIndex;
        };
        CObjResUIDHelper.toCheckNum = function (uid) {
            return uid.m_nCheckNum;
        };
        CObjResUIDHelper.getMaxIndex = function () {
            return (1 << CObjResUIDHelper.s_nIndexLen) - 1;
        };
        CObjResUIDHelper.getMaxCheckNum = function () {
            return (1 << CObjResUIDHelper.s_nCheckNumLen) - 1;
        };
        CObjResUIDHelper.s_nIndexLen = 30;
        CObjResUIDHelper.s_nCheckNumLen = 22;
        return CObjResUIDHelper;
    }());
    Share.CObjResUIDHelper = CObjResUIDHelper;
    var CObjResUID = (function () {
        function CObjResUID(nIndex, nCheckNum) {
            this.m_nIndex = 0;
            this.m_nCheckNum = 0;
            this.m_nIndex = nIndex;
            this.m_nCheckNum = nCheckNum;
        }
        CObjResUID.prototype.isZero = function () {
            return this.m_nCheckNum == 0 && this.m_nIndex == 0;
        };
        CObjResUID.prototype.valueOf = function () {
            return this.m_nIndex * (CObjResUIDHelper.getMaxCheckNum() + 1) + this.m_nCheckNum;
        };
        CObjResUID.prototype.toString = function () {
            return this.valueOf().toString();
        };
        return CObjResUID;
    }());
    Share.CObjResUID = CObjResUID;
})(Share || (Share = {}));
var Share;
(function (Share) {
    var CUtf8Encoding = (function () {
        function CUtf8Encoding() {
        }
        CUtf8Encoding._index = function (index, arr) {
            if (index < 0 || index >= arr.length) {
                throw new Error("IndexOutOfRangeException");
            }
            return index;
        };
        CUtf8Encoding._identity = function (x) {
            return x;
        };
        CUtf8Encoding.Encode = function (s) {
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
        };
        CUtf8Encoding.Decode = function (bytes, index, count) {
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
        };
        CUtf8Encoding.fallbackCharacter = 65533;
        return CUtf8Encoding;
    }());
    Share.CUtf8Encoding = CUtf8Encoding;
})(Share || (Share = {}));
var Share;
(function (Share) {
    var CInt64 = (function () {
        function CInt64(low, high) {
            this.add = function (otherV) {
                var other = CInt64.from(otherV);
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
        CInt64.fromInt = function (value) {
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
        };
        ;
        CInt64.fromNumber = function (value) {
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
        };
        ;
        CInt64.fromBits = function (lowBits, highBits) {
            return new CInt64(lowBits, highBits);
        };
        ;
        CInt64.fromString = function (str, opt_radix) {
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
        };
        CInt64.prototype.toInt = function () {
            return this.low_;
        };
        ;
        CInt64.prototype.toNumber = function () {
            return this.high_ * CInt64.TWO_PWR_32_DBL_ + this.getLowBitsUnsigned();
        };
        ;
        CInt64.prototype.hashCode = function () {
            return this.high_ ^ this.low_;
        };
        CInt64.prototype.toString = function (opt_radix) {
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
                    var rem_1 = div.multiply(radixLong).subtract(this);
                    return div.toString(radix) + rem_1.toInt().toString(radix);
                }
                else {
                    return '-' + this.negate().toString(radix);
                }
            }
            var radixToPower = CInt64.fromNumber(Math.pow(radix, 6));
            var rem = this;
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
        };
        CInt64.prototype.getHighBits = function () {
            return this.high_;
        };
        ;
        CInt64.prototype.getLowBits = function () {
            return this.low_;
        };
        ;
        CInt64.prototype.getLowBitsUnsigned = function () {
            return this.low_ >= 0 ? this.low_ : CInt64.TWO_PWR_32_DBL_ + this.low_;
        };
        ;
        CInt64.prototype.getNumBitsAbs = function () {
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
        };
        ;
        CInt64.prototype.isZero = function () {
            return this.high_ == 0 && this.low_ == 0;
        };
        ;
        CInt64.prototype.isNegative = function () {
            return this.high_ < 0;
        };
        ;
        CInt64.prototype.isOdd = function () {
            return (this.low_ & 1) == 1;
        };
        ;
        CInt64.prototype.equalsLong = function (other) {
            return this.high_ == other.high_ && this.low_ == other.low_;
        };
        ;
        CInt64.prototype.notEqualsLong = function (other) {
            return this.high_ != other.high_ || this.low_ != other.low_;
        };
        ;
        CInt64.prototype.equals = function (other) {
            return this.compare(other) === 0;
        };
        ;
        CInt64.from = function (other) {
            var t = typeof other;
            var m = other;
            if (other === 'number')
                return CInt64.fromNumber(m);
            if (other === 'string')
                return CInt64.fromString(m);
            return m;
        };
        CInt64.prototype.lessThan = function (other) {
            return this.compare(other) < 0;
        };
        CInt64.prototype.lessThanOrEqual = function (other) {
            return this.compare(other) <= 0;
        };
        CInt64.prototype.greaterThan = function (other) {
            return this.compare(other) > 0;
        };
        CInt64.prototype.greaterThanOrEqual = function (other) {
            return this.compare(other) >= 0;
        };
        CInt64.prototype.compare = function (otherV) {
            var other = CInt64.from(otherV);
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
        };
        CInt64.prototype.negate = function () {
            if (this.equalsLong(CInt64.MIN_VALUE)) {
                return CInt64.MIN_VALUE;
            }
            else {
                return this.not().add(CInt64.ONE);
            }
        };
        ;
        CInt64.prototype.subtract = function (other) {
            return this.add(CInt64.from(other).negate());
        };
        ;
        CInt64.prototype.multiply = function (otherV) {
            var other = CInt64.from(otherV);
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
        };
        ;
        CInt64.prototype.div = function (otherV) {
            var other = CInt64.from(otherV);
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
                        var rem_2 = this.subtract(other.multiply(approx1));
                        var result = approx1.add(rem_2.div(other));
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
            var rem = this;
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
        };
        ;
        CInt64.prototype.modulo = function (otherV) {
            var other = CInt64.from(otherV);
            return this.subtract(this.div(other).multiply(other));
        };
        ;
        CInt64.prototype.not = function () {
            return CInt64.fromBits(~this.low_, ~this.high_);
        };
        ;
        CInt64.prototype.and = function (otherV) {
            var other = CInt64.from(otherV);
            return CInt64.fromBits(this.low_ & other.low_, this.high_ & other.high_);
        };
        ;
        CInt64.prototype.or = function (otherV) {
            var other = CInt64.from(otherV);
            return CInt64.fromBits(this.low_ | other.low_, this.high_ | other.high_);
        };
        ;
        CInt64.prototype.xor = function (otherV) {
            var other = CInt64.from(otherV);
            return CInt64.fromBits(this.low_ ^ other.low_, this.high_ ^ other.high_);
        };
        ;
        CInt64.prototype.shiftLeft = function (numBits) {
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
        };
        ;
        CInt64.prototype.shiftRight = function (numBits) {
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
        };
        ;
        CInt64.prototype.shiftRightUnsigned = function (numBits) {
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
        };
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
        return CInt64;
    }());
    Share.CInt64 = CInt64;
})(Share || (Share = {}));
var Share;
(function (Share) {
    var CPtcKickoutArg = (function () {
        function CPtcKickoutArg() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.Kickout);
        }
        return CPtcKickoutArg;
    }());
    Share.CPtcKickoutArg = CPtcKickoutArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    var CDelegate = (function () {
        function CDelegate() {
            this.m_oFuncList = new Share.CLinkedList();
        }
        CDelegate.isNullOrEmpty = function (onDelegate) {
            return onDelegate == null || onDelegate.isEmpty();
        };
        CDelegate.prototype.isEmpty = function () {
            return this.m_oFuncList.count() == 0;
        };
        CDelegate.prototype.clear = function () {
            this.m_oFuncList.clear();
        };
        CDelegate.prototype.add = function (onFunc) {
            if (onFunc == null)
                return;
            this.m_oFuncList.insertBefore(this.m_oFuncList.end(), onFunc);
        };
        CDelegate.prototype.remove = function (onFunc) {
            if (onFunc == null)
                return;
            var end = this.m_oFuncList.end();
            for (var node = this.m_oFuncList.begin(); node != end; node = node.getNext()) {
                if (node.data === onFunc) {
                    this.m_oFuncList.remove(node);
                    break;
                }
            }
        };
        CDelegate.prototype.invoke = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var end = this.m_oFuncList.end();
            var self = this;
            (function () {
                for (var node = self.m_oFuncList.begin(); node != end; node = node.getNext()) {
                    node.data.call(this, args);
                }
            })();
        };
        return CDelegate;
    }());
    Share.CDelegate = CDelegate;
})(Share || (Share = {}));
var Share;
(function (Share) {
    var CLogoutArg = (function () {
        function CLogoutArg() {
            this.val = new Share.CProtocolArg(Share.EProtocolType.Logout);
        }
        return CLogoutArg;
    }());
    Share.CLogoutArg = CLogoutArg;
})(Share || (Share = {}));
var Share;
(function (Share) {
    var CLinkedListNode = (function () {
        function CLinkedListNode(owner) {
            this.owner = owner;
        }
        CLinkedListNode.prototype.getPrev = function () { return this.prev; };
        CLinkedListNode.prototype.getNext = function () { return this.next; };
        return CLinkedListNode;
    }());
    Share.CLinkedListNode = CLinkedListNode;
    var CLinkedList = (function () {
        function CLinkedList() {
            this.head = new CLinkedListNode(this);
            this.tail = new CLinkedListNode(this);
            this.m_nCount = 0;
            this.head["prev"] = null;
            this.head["next"] = this.tail;
            this.tail["prev"] = this.head;
            this.tail["next"] = null;
        }
        CLinkedList.prototype.begin = function () { return this.head.getNext(); };
        CLinkedList.prototype.end = function () { return this.tail; };
        CLinkedList.prototype.rbegin = function () { return this.tail.getPrev(); };
        CLinkedList.prototype.rend = function () { return this.begin; };
        CLinkedList.prototype.clear = function () {
            this.m_nCount = 0;
            this.head["prev"] = null;
            this.head["next"] = this.tail;
            this.tail["prev"] = this.head;
            this.tail["next"] = null;
        };
        CLinkedList.prototype.insertBefore = function (node, data) {
            var owner = node["owner"];
            if (owner !== this)
                return null;
            if (node === this.head)
                return null;
            var prev = node["prev"];
            var newNode = new CLinkedListNode(this);
            newNode.data = data;
            newNode["next"] = node;
            newNode["prev"] = prev;
            node["prev"] = newNode;
            prev["next"] = newNode;
            ++this.m_nCount;
            return newNode;
        };
        CLinkedList.prototype.insertAfter = function (node, data) {
            var owner = node["owner"];
            if (owner !== this)
                return null;
            if (node === this.tail)
                return null;
            var next = node["next"];
            var newNode = new CLinkedListNode(this);
            newNode.data = data;
            newNode["next"] = next;
            newNode["prev"] = node;
            node["next"] = newNode;
            next["prev"] = newNode;
            ++this.m_nCount;
            return newNode;
        };
        CLinkedList.prototype.remove = function (node) {
            var owner = node["owner"];
            if (owner !== this)
                return false;
            if (node === this.tail || node === this.head)
                return false;
            var prev = node["prev"];
            var next = node["next"];
            node["prev"] = null;
            node["next"] = null;
            node["owner"] = null;
            prev["next"] = next;
            next["prev"] = prev;
            --this.m_nCount;
            return true;
        };
        CLinkedList.prototype.removeRange = function (begin, end) {
            if (begin["owner"] !== this || end["owner"] !== this)
                return false;
            if (begin === this.tail || begin === this.head || end === this.head || end === this.head.getNext())
                return false;
            if (begin === end)
                return true;
            var prev = begin["prev"];
            var next = end;
            var removeCount = 0;
            for (var node = begin; node != next; node = node.getNext()) {
                if (node == null || node === this.tail)
                    return false;
            }
            for (var node = begin; node != next; node = node.getNext()) {
                ++removeCount;
            }
            prev["next"] = next;
            next["prev"] = prev;
            this.m_nCount -= removeCount;
            return true;
        };
        CLinkedList.prototype.count = function () {
            return this.m_nCount;
        };
        return CLinkedList;
    }());
    Share.CLinkedList = CLinkedList;
})(Share || (Share = {}));
var Share;
(function (Share) {
    var CProtocolArg = (function () {
        function CProtocolArg(type) {
            this.type = type;
            this.data = {};
        }
        return CProtocolArg;
    }());
    Share.CProtocolArg = CProtocolArg;
    var CRpcSendTask = (function () {
        function CRpcSendTask() {
        }
        CRpcSendTask.prototype.qconstructor = function (uid) {
            this.m_oUId = uid;
        };
        CRpcSendTask.prototype.qdestructor = function () {
            if (this.m_oSendTimeout) {
                clearTimeout(this.m_oSendTimeout);
                this.m_oSendTimeout = null;
            }
            this.m_oCallback = null;
            this.m_oUId = null;
        };
        CRpcSendTask.prototype.getObjType = function () {
            return 0;
        };
        CRpcSendTask.prototype.getUID = function () {
            return this.m_oUId;
        };
        return CRpcSendTask;
    }());
    Share.CRpcSendTask = CRpcSendTask;
    var CRpcTaskMgr = (function () {
        function CRpcTaskMgr() {
            this.m_oMgr = new Share.CObjResMgr(1000, function (nObjType) {
                return new CRpcSendTask();
            });
        }
        CRpcTaskMgr.prototype.createRpcTask = function () {
            return this.m_oMgr.createObj(0);
        };
        CRpcTaskMgr.prototype.releaseRpcTask = function (uid) {
            this.m_oMgr.releaseObj(uid);
        };
        CRpcTaskMgr.prototype.releaseAllRpcTask = function () {
            this.m_oMgr.releaseAll();
        };
        CRpcTaskMgr.prototype.getRpcTask = function (uid) {
            return this.m_oMgr.getObj(uid);
        };
        return CRpcTaskMgr;
    }());
    Share.CRpcTaskMgr = CRpcTaskMgr;
})(Share || (Share = {}));
var Share;
(function (Share) {
    var CSession = (function () {
        function CSession(owner) {
            this.m_strToken = "";
            this.m_nToRecvLen = 0;
            this.m_strRecvData = "";
            this.m_oCloseTimer = null;
            this.m_oSendReceiver = null;
            this.m_onError = null;
            this.m_onClose = null;
            this.m_onUnBind = null;
            this.m_oRpcTaskMgr = new Share.CRpcTaskMgr();
            this.m_strRemoteIp = "";
            this.m_oOwner = owner;
        }
        CSession.prototype.qconstructor = function (uid) {
            this.m_oUId = uid;
            this.m_strToken = Math.random().toString();
        };
        CSession.prototype.qdestructor = function () {
            this.close();
            this.m_strToken = "";
            this.m_oUId = null;
        };
        CSession.prototype.getObjType = function () {
            return 0;
        };
        CSession.prototype.getUID = function () {
            return this.m_oUId;
        };
        CSession.prototype.getRemoteUID = function () {
            return this.m_oRemoteUid;
        };
        CSession.prototype.getRemoteToken = function () {
            return this.m_strRemoteToken;
        };
        CSession.prototype.getUserData = function () {
            return this.m_oUserData;
        };
        CSession.prototype.setUserData = function (oUserData) {
            this.m_oUserData = oUserData;
        };
        CSession.prototype._onRecv = function (data) {
            var _this = this;
            if (typeof data !== "string")
                return this.close();
            var strData = data.toString();
            if (!strData || !strData.length)
                return;
            if (this.m_nToRecvLen == 0) {
                var n = 0;
                for (; n != strData.length; ++n) {
                    if (strData[n] == '{')
                        break;
                }
                if (n == strData.length)
                    this.m_strRecvData += strData;
                else {
                    this.m_strRecvData += strData.substr(0, n);
                    var t = Number(this.m_strRecvData);
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
                    var n = this.m_nToRecvLen - this.m_strRecvData.length;
                    this.m_strRecvData += strData.substr(0, n);
                    var t_1 = null;
                    try {
                        t_1 = JSON.parse(this.m_strRecvData);
                    }
                    catch (e) {
                        return this.close();
                    }
                    if (t_1.type == undefined || !t_1.data)
                        return this.close();
                    this.m_strRecvData = "";
                    this.m_nToRecvLen = 0;
                    if (t_1.uid) {
                        if (t_1.isReply) {
                            var oUID = new Share.CObjResUID(t_1.uid.m_nIndex, t_1.uid.m_nCheckNum);
                            var sendTask = this.m_oRpcTaskMgr.getRpcTask(oUID);
                            if (sendTask) {
                                var cb = sendTask.m_oCallback;
                                this.m_oRpcTaskMgr.releaseRpcTask(oUID);
                                cb(null, t_1.data);
                            }
                        }
                        else {
                            var controller = Share.CSingleton(Share.CProtocolMgr).getController(t_1.type);
                            if (controller && controller.onCall) {
                                controller.onCall(t_1.data, this).then(function (data) {
                                    if (_this.m_oSendReceiver == null)
                                        return;
                                    var r = { uid: t_1.uid, isReply: true, type: t_1.type, data: data };
                                    try {
                                        var st = JSON.stringify(r);
                                        _this.m_oSendReceiver.send(st.length + st);
                                    }
                                    catch (e) { }
                                });
                            }
                        }
                    }
                    else {
                        var controller = Share.CSingleton(Share.CProtocolMgr).getController(t_1.type);
                        if (controller && controller.onProcess) {
                            controller.onProcess(t_1.data, this);
                        }
                    }
                    this._onRecv(strData.substr(n));
                }
                else {
                    this.m_strRecvData += strData;
                }
            }
        };
        CSession.prototype.getToken = function () {
            return this.m_strToken;
        };
        CSession.prototype.bind = function (oSendreceiver, oRemoteUid, strRemoteToken, unbindCallback) {
            var _this = this;
            if (this.m_oSendReceiver === oSendreceiver) {
                this.m_onUnBind = unbindCallback;
                return;
            }
            var oUID = this.m_oUId;
            this.unbind();
            this.m_oSendReceiver = oSendreceiver;
            this.m_oRemoteUid = oRemoteUid;
            this.m_strRemoteToken = strRemoteToken;
            this.m_onUnBind = unbindCallback;
            this.m_strRemoteIp = oSendreceiver.getRemoteIp();
            if (this.m_oSendReceiver) {
                this._cancelClose();
                this.m_oSendReceiver.onRecv(function (data) {
                    _this._onRecv(data);
                });
                this.m_oSendReceiver.onError(function (err) {
                    if (_this.m_onError)
                        _this.m_onError(err);
                });
            }
        };
        CSession.prototype._cancelClose = function () {
            if (!this.m_oCloseTimer)
                return;
            clearTimeout(this.m_oCloseTimer);
            this.m_oCloseTimer = null;
        };
        CSession.prototype.unbind = function () {
            this.m_nToRecvLen = 0;
            this.m_strRecvData = "";
            var oSendReceiver = this.m_oSendReceiver;
            if (this.m_oSendReceiver) {
                this.m_oSendReceiver.onRecv(null);
                this.m_oSendReceiver.onError(null);
            }
            this.m_oSendReceiver = null;
            var onUnBind = this.m_onUnBind;
            if (onUnBind && oSendReceiver) {
                setTimeout(function () {
                    onUnBind(oSendReceiver);
                }, 0);
            }
        };
        CSession.prototype.getRemoteIp = function () {
            return this.m_strRemoteIp;
        };
        CSession.prototype.isClosed = function () {
            return this.m_oSendReceiver == null;
        };
        CSession.prototype.isClosing = function () {
            return this.m_oCloseTimer != null;
        };
        CSession.prototype.close = function () {
            if (this.isClosed())
                return;
            var onClose = this.m_onClose;
            var oSendReceiver = this.m_oSendReceiver;
            if (this.m_oCloseTimer) {
                clearTimeout(this.m_oCloseTimer);
                this.m_oCloseTimer = null;
            }
            this.unbind();
            if (oSendReceiver != null) {
                if (onClose) {
                    setTimeout(function () {
                        onClose();
                    }, 0);
                }
                this.m_oSendReceiver = null;
            }
            this.m_oOwner.release(this.m_oUId);
        };
        CSession.prototype.closeAfter = function (nMilliSeconds) {
            var _this = this;
            if (this.isClosed())
                return;
            if (this.m_oCloseTimer) {
                clearTimeout(this.m_oCloseTimer);
                this.m_oCloseTimer = null;
            }
            this.m_oCloseTimer = setTimeout(function () {
                _this.close();
            }, nMilliSeconds);
        };
        CSession.prototype.callRpc = function (arg, timeoutMilliSeconds) {
            var _this = this;
            if (timeoutMilliSeconds === void 0) { timeoutMilliSeconds = 30000; }
            if (this.isClosed()) {
                return Promise.reject(new Error("send on a closed session"));
            }
            var self = this;
            var timeout = timeoutMilliSeconds;
            if (timeout <= 0)
                return Promise.reject(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(Share.EErrorNo.Timeout));
            var sendTask = this.m_oRpcTaskMgr.createRpcTask();
            var taskUID = sendTask.getUID();
            var pr = Share.CPromiseHelper.createPromise();
            sendTask.m_oCallback = pr.callback;
            sendTask.m_oSendTimeout = setTimeout(function () {
                _this.m_oRpcTaskMgr.releaseRpcTask(taskUID);
                pr.callback(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(Share.EErrorNo.Timeout));
            }, timeout);
            var sendData = JSON.stringify({
                type: arg.type,
                uid: taskUID,
                data: arg.data
            });
            this.m_oSendReceiver.send(sendData.length + sendData);
            return pr.promise;
        };
        CSession.prototype.sendPtc = function (arg) {
            if (this.isClosed()) {
                return;
            }
            var sendData = JSON.stringify({
                type: arg.type,
                data: arg.data
            });
            this.m_oSendReceiver.send(sendData.length + sendData);
        };
        CSession.prototype.onError = function (callback) {
            this.m_onError = callback;
        };
        CSession.prototype.onClose = function (callback) {
            this.m_onClose = callback;
        };
        return CSession;
    }());
    Share.CSession = CSession;
})(Share || (Share = {}));
var Share;
(function (Share) {
    var CSessionMgr = (function () {
        function CSessionMgr() {
            var _this = this;
            this.m_oMgr = new Share.CObjResMgr(0, function (nObjType) {
                return new Share.CSession(_this);
            });
        }
        CSessionMgr.prototype.bind = function (oSendReceiver, options, unbindCallback) {
            var _this = this;
            if (!options || !options.nAuthMilliSeconds) {
                var oSession_1 = this.m_oMgr.createObj(0);
                oSession_1.bind(oSendReceiver, null, null, function (ot) {
                    oSession_1 = null;
                    if (unbindCallback)
                        unbindCallback(oSendReceiver);
                });
                oSendReceiver.onClose(function () {
                    if (oSession_1 == null)
                        return;
                    oSession_1.close();
                });
                return Promise.resolve(oSession_1);
            }
            var pr = Share.CPromiseHelper.createPromise();
            if (options.bIsConnector) {
                var ti_1 = setTimeout(function () {
                    oSendReceiver.close();
                }, options.nAuthMilliSeconds);
                if (options.oRemoteUid) {
                    oSendReceiver.send(JSON.stringify({
                        type: "reconnect",
                        uid: options.oRemoteUid,
                        token: options.strRemoteToken
                    }));
                }
                else {
                    oSendReceiver.send(JSON.stringify({}));
                }
                oSendReceiver.onRecv(function (data) {
                    var msg;
                    var message = data.toString();
                    try {
                        msg = JSON.parse(message);
                    }
                    catch (e) {
                        oSendReceiver.close();
                        pr.callback(e);
                        return;
                    }
                    if (msg.errno != 0) {
                        oSendReceiver.close();
                        pr.callback(null, null);
                        return;
                    }
                    var oSession = _this.m_oMgr.createObj(0);
                    oSendReceiver.onRecv(null);
                    oSendReceiver.onClose(null);
                    clearTimeout(ti_1);
                    oSession.bind(oSendReceiver, msg.uid, msg.token, function (ot) {
                        oSession = null;
                        if (unbindCallback)
                            unbindCallback(oSendReceiver);
                    });
                    oSendReceiver.onClose(function () {
                        if (oSession == null)
                            return;
                        oSession.close();
                    });
                    pr.callback(null, oSession);
                });
                oSendReceiver.onClose(function () {
                    clearTimeout(ti_1);
                    pr.callback(null, null);
                });
                return pr.promise;
            }
            oSendReceiver.onRecv(function (data) {
                var msg;
                var message = data.toString();
                try {
                    msg = JSON.parse(message);
                }
                catch (e) {
                    pr.callback(e);
                    return;
                }
                var oSession;
                if (msg.type === "reconnect") {
                    if (!msg.uid) {
                        pr.callback(null, null);
                        return;
                    }
                    var oUID = new Share.CObjResUID(msg.uid.m_nIndex, msg.uid.m_nCheckNum);
                    oSession = _this.get(oUID);
                    if (!oSession || oSession.isClosed() || !oSession.getToken() || oSession.getToken() !== msg.token) {
                        pr.callback(null, null);
                        return;
                    }
                }
                else {
                    oSession = _this.m_oMgr.createObj(0);
                }
                oSendReceiver.send(JSON.stringify(Share.CSingleton(Share.CErrorMsgHelper).successMsg({
                    uid: oSession.getUID(),
                    token: oSession.getToken()
                })));
                oSendReceiver.onRecv(null);
                oSendReceiver.onClose(null);
                oSession.bind(oSendReceiver, null, null, function (ot) {
                    oSession = null;
                    if (unbindCallback)
                        unbindCallback(oSendReceiver);
                });
                oSendReceiver.onClose(function () {
                    if (oSession == null)
                        return;
                    oSession.closeAfter(options.nAuthMilliSeconds);
                });
                pr.callback(null, oSession);
            });
            oSendReceiver.onClose(function () {
                pr.callback(null, null);
            });
            return pr.promise;
        };
        CSessionMgr.prototype.release = function (uid) {
            this.m_oMgr.releaseObj(uid);
        };
        CSessionMgr.prototype.releaseAll = function () {
            this.m_oMgr.releaseAll();
        };
        CSessionMgr.prototype.get = function (uid) {
            return this.m_oMgr.getObj(uid);
        };
        return CSessionMgr;
    }());
    Share.CSessionMgr = CSessionMgr;
})(Share || (Share = {}));
var ClientCore;
(function (ClientCore) {
    var CAccount = (function (_super) {
        __extends(CAccount, _super);
        function CAccount() {
            var _this = _super.call(this, ClientCore.CBehavAccount) || this;
            _this.m_oBehavAccount = _this.getComponent(ClientCore.CBehavAccount);
            return _this;
        }
        Object.defineProperty(CAccount.prototype, "BehavAccount", {
            get: function () {
                return this.m_oBehavAccount;
            },
            enumerable: true,
            configurable: true
        });
        return CAccount;
    }(Share.CUnit));
    ClientCore.CAccount = CAccount;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    var CBehavAccount = (function (_super) {
        __extends(CBehavAccount, _super);
        function CBehavAccount(s) {
            return _super.call(this, s) || this;
        }
        Object.defineProperty(CBehavAccount.prototype, "AccountInfo", {
            get: function () {
                return this.m_oAccountInfo;
            },
            enumerable: true,
            configurable: true
        });
        CBehavAccount.prototype.setAccountInfo = function (oAccountInfo) {
            this.m_oAccountInfo = oAccountInfo;
        };
        return CBehavAccount;
    }(Share.CUnitBehavior));
    ClientCore.CBehavAccount = CBehavAccount;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    var CAllClientTable = (function () {
        function CAllClientTable() {
        }
        CAllClientTable.prototype.Marshal = function (oct) {
        };
        CAllClientTable.prototype.UnMarshal = function (oct) {
        };
        return CAllClientTable;
    }());
    ClientCore.CAllClientTable = CAllClientTable;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    var CBehavClientCore = (function (_super) {
        __extends(CBehavClientCore, _super);
        function CBehavClientCore(oUnit) {
            return _super.call(this, oUnit) || this;
        }
        Object.defineProperty(CBehavClientCore.prototype, "BehavSession", {
            get: function () {
                return this.m_oBehavSession;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CBehavClientCore.prototype, "BehavLogin", {
            get: function () {
                return this.m_oBehavLogin;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CBehavClientCore.prototype, "UseHttps", {
            get: function () {
                return this.m_bUseHttps;
            },
            enumerable: true,
            configurable: true
        });
        CBehavClientCore.prototype._awake = function () {
            this.m_oBehavSession = this.getComponent(ClientCore.CBehavSession);
            this.m_oBehavLogin = this.getComponent(ClientCore.CBehavLogin);
        };
        CBehavClientCore.prototype.Init = function () {
            return Promise.resolve(true);
        };
        CBehavClientCore.prototype.Load = function (oArg) {
            this.m_bUseHttps = oArg.useHttps;
            this.m_oBehavSession.setUrl((this.m_bUseHttps ? "wss:" : "ws:") + oArg.gameServer);
            return Promise.resolve(true);
        };
        return CBehavClientCore;
    }(Share.CUnitBehavior));
    ClientCore.CBehavClientCore = CBehavClientCore;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    var CBehavLogin = (function (_super) {
        __extends(CBehavLogin, _super);
        function CBehavLogin(s) {
            return _super.call(this, s) || this;
        }
        CBehavLogin.prototype._awake = function () {
            this.m_oSession = this.getComponent(ClientCore.CBehavSession);
        };
        Object.defineProperty(CBehavLogin.prototype, "Account", {
            get: function () {
                return this.m_oAccount;
            },
            enumerable: true,
            configurable: true
        });
        CBehavLogin.prototype.login = function (oArg) {
            var _this = this;
            var p = Promise.resolve(Share.EErrorNo.Success);
            if (this.m_oSession.isClosed())
                p = this.m_oSession.connect();
            return p.then(function (errno) {
                if (errno != Share.EErrorNo.Success)
                    return Promise.reject(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(errno));
                var oRpcArg = new Share.CLoginArg();
                oRpcArg.val.data = oArg;
                return _this.m_oSession.callRpc(oRpcArg.val);
            }).then(function (oRpcRet) {
                if (oRpcRet.errno != 0)
                    return Promise.reject(Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(oRpcRet));
                var oAccount = new ClientCore.CAccount();
                _this.m_oAccount = oAccount.BehavAccount;
                _this.m_oAccount.setAccountInfo(oRpcRet.ext);
                return Promise.reject(Share.CSingleton(Share.CErrorMsgHelper).successMsg(oAccount.BehavAccount));
            }).catch(function (error) {
                if (error.errno != 0 && error.errno != Share.EErrorNo.TryAgain)
                    _this.m_oSession.close();
                return error;
            });
        };
        CBehavLogin.prototype.logout = function () {
            var _this = this;
            if (this.m_oAccount == null || this.m_oAccount.isDestroyed() || !this.m_oAccount.AccountInfo || this.m_oSession.isClosed())
                return Promise.resolve(Share.CSingleton(Share.CErrorMsgHelper).errorMsg(Share.EErrorNo.Fail));
            var oRpcArg = new Share.CLogoutArg();
            oRpcArg.val.data.accountName = this.m_oAccount.AccountInfo.accountName;
            return this.m_oSession.callRpc(oRpcArg.val).then(function (data) {
                if (data.errno == 0) {
                    _this.m_oSession.close();
                }
                return Promise.reject(null);
            }).catch(function (error) {
                if (error == null)
                    return Share.CSingleton(Share.CErrorMsgHelper).successMsg();
                return Share.CSingleton(Share.CErrorMsgHelper).toErrorMsg(error);
            });
        };
        CBehavLogin.prototype.beKickout = function () {
            this.m_oSession.close();
            Share.CLogHelper.warn("be kickout");
        };
        CBehavLogin.prototype.onSessionClose = function () {
            if (this.m_oAccount) {
                this.m_oAccount.destroy();
                this.m_oAccount = null;
            }
        };
        return CBehavLogin;
    }(Share.CUnitBehavior));
    ClientCore.CBehavLogin = CBehavLogin;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    var CBehavSession = (function (_super) {
        __extends(CBehavSession, _super);
        function CBehavSession(s) {
            return _super.call(this, s) || this;
        }
        CBehavSession.prototype._awake = function () {
            this.m_oClientCore = this.getComponent(ClientCore.CBehavClientCore);
        };
        Object.defineProperty(CBehavSession.prototype, "ClientCore", {
            get: function () {
                return this.m_oClientCore;
            },
            enumerable: true,
            configurable: true
        });
        CBehavSession.prototype.setUrl = function (strUrl) {
            this.m_strUrl = strUrl;
        };
        CBehavSession.prototype.connect = function () {
            return this._connect(false);
        };
        CBehavSession.prototype._connect = function (bReconnect) {
            var _this = this;
            if (this.m_strUrl == null || this.m_strUrl === "")
                return Promise.resolve(Share.EErrorNo.InvalidArguments);
            this.close();
            var oSendReceiver;
            return ClientCore.CWSConnector.connect(this.m_strUrl).then(function (data) {
                oSendReceiver = data;
                if (oSendReceiver == null)
                    return Promise.reject(new Error("connect failed"));
                var options = {
                    nAuthMilliSeconds: 10000,
                    bIsConnector: true,
                    oRemoteUid: undefined,
                    strRemoteToken: undefined
                };
                if (bReconnect) {
                    options.oRemoteUid = _this.m_oRemoteUID;
                    options.strRemoteToken = _this.m_strRemoteToken;
                }
                return Share.CSingleton(Share.CSessionMgr).bind(oSendReceiver, options, function (sr) {
                    sr.close();
                });
            }).then(function (oSession) {
                if (oSession == null)
                    return Promise.reject(new Error("connect failed"));
                oSession.setUserData(_this);
                oSession.onClose(function () {
                    oSession.setUserData(null);
                    oSession = null;
                    Share.CLogHelper.info("session closed");
                });
                _this.m_oSession = oSession;
                _this.m_oRemoteUID = oSession.getRemoteUID();
                _this.m_strRemoteToken = oSession.getRemoteToken();
                return Share.EErrorNo.Success;
            }).catch(function (err) {
                Share.CLogHelper.warn(err);
                return Share.EErrorNo.Fail;
            });
        };
        CBehavSession.prototype.close = function () {
            if (this.m_oSession == null)
                return;
            this.m_oSession.close();
        };
        CBehavSession.prototype.isClosed = function () {
            return this.m_oSession == null || this.m_oSession.isClosed();
        };
        CBehavSession.prototype.callRpc = function (arg, timeoutMilliSeconds) {
            if (timeoutMilliSeconds === void 0) { timeoutMilliSeconds = 30000; }
            return this.m_oSession.callRpc(arg, timeoutMilliSeconds);
        };
        CBehavSession.prototype.sendPtc = function (arg) {
            return this.m_oSession.sendPtc(arg);
        };
        return CBehavSession;
    }(Share.CUnitBehavior));
    ClientCore.CBehavSession = CBehavSession;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    var CClientCore = (function (_super) {
        __extends(CClientCore, _super);
        function CClientCore() {
            var _this = _super.call(this, ClientCore.CBehavClientCore, ClientCore.CBehavSession, ClientCore.CBehavLogin) || this;
            _this.m_oClientCore = _this.getComponent(ClientCore.CBehavClientCore);
            return _this;
        }
        Object.defineProperty(CClientCore.prototype, "ClientCore", {
            get: function () {
                return this.m_oClientCore;
            },
            enumerable: true,
            configurable: true
        });
        return CClientCore;
    }(Share.CUnit));
    ClientCore.CClientCore = CClientCore;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    var CWSConnector = (function () {
        function CWSConnector() {
        }
        CWSConnector.connect = function (url) {
            var ws;
            try {
                ws = new WebSocket(url);
            }
            catch (e) {
                return Promise.reject(e);
            }
            ws.binaryType = "arraybuffer";
            var pr = Share.CPromiseHelper.createPromise();
            ws.onopen = function () {
                pr.callback(null, new ClientCore.CWSSendReceiver(ws, url));
            };
            return pr.promise;
        };
        return CWSConnector;
    }());
    ClientCore.CWSConnector = CWSConnector;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    var CWSSendReceiver = (function () {
        function CWSSendReceiver(ws, remoteUrl) {
            var _this = this;
            this.m_oWebSocket = ws;
            this.m_strRemoteUrl = remoteUrl;
            ws.onmessage = function (evt) {
                if (_this.m_onRecv)
                    _this.m_onRecv(evt.data);
            };
            ws.onerror = function (evt) {
                if (_this.m_onError)
                    _this.m_onError(evt.data);
            };
            ws.onclose = function (evt) {
                if (_this.m_onClose)
                    _this.m_onClose();
            };
        }
        CWSSendReceiver.prototype.isClosed = function () {
            return this.m_oWebSocket == null;
        };
        CWSSendReceiver.prototype.close = function () {
            if (this.isClosed())
                return;
            if (!this.m_oWebSocket)
                return;
            this.m_oWebSocket.close();
            this.m_oWebSocket = null;
        };
        CWSSendReceiver.prototype.send = function (data) {
            this.m_oWebSocket.send(data);
            return Promise.resolve();
        };
        CWSSendReceiver.prototype.onRecv = function (callback) {
            this.m_onRecv = callback;
        };
        CWSSendReceiver.prototype.onError = function (callback) {
            this.m_onError = callback;
        };
        CWSSendReceiver.prototype.onClose = function (callback) {
            this.m_onClose = callback;
        };
        CWSSendReceiver.prototype.getRemoteIp = function () {
            return this.m_strRemoteUrl;
        };
        return CWSSendReceiver;
    }());
    ClientCore.CWSSendReceiver = CWSSendReceiver;
})(ClientCore || (ClientCore = {}));
var ClientCore;
(function (ClientCore) {
    var CG2CPtcKickout = (function () {
        function CG2CPtcKickout() {
        }
        CG2CPtcKickout.onProcess = function (data, oSession) {
            var oBehavSession = oSession.getUserData();
            if (oBehavSession == null || oBehavSession.isDestroyed())
                return;
            var oBehavLogin = oBehavSession.ClientCore.BehavLogin;
            oBehavLogin.beKickout();
        };
        return CG2CPtcKickout;
    }());
    Share.CSingleton(Share.CProtocolMgr).registerController(CG2CPtcKickout, Share.EProtocolType.Kickout);
})(ClientCore || (ClientCore = {}));
