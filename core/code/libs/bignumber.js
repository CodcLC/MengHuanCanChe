var e = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
    return typeof e;
} : function(e) {
    return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
};

!function(r) {
    function n(e) {
        var r = 0 | e;
        return 0 < e || e === r ? r : r - 1;
    }
    function t(e) {
        for (var r, n, t = 1, i = e.length, o = e[0] + ""; t < i; ) {
            for (r = e[t++] + "", n = m - r.length; n--; r = "0" + r) ;
            o += r;
        }
        for (i = o.length; 48 === o.charCodeAt(--i); ) ;
        return o.slice(0, i + 1 || 1);
    }
    function i(e, r) {
        var n, t, i = e.c, o = r.c, s = e.s, f = r.s, u = e.e, c = r.e;
        if (!s || !f) return null;
        if (n = i && !i[0], t = o && !o[0], n || t) return n ? t ? 0 : -f : s;
        if (s != f) return s;
        if (n = s < 0, t = u == c, !i || !o) return t ? 0 : !i ^ n ? 1 : -1;
        if (!t) return c < u ^ n ? 1 : -1;
        for (f = (u = i.length) < (c = o.length) ? u : c, s = 0; s < f; s++) if (i[s] != o[s]) return i[s] > o[s] ^ n ? 1 : -1;
        return u == c ? 0 : c < u ^ n ? 1 : -1;
    }
    function o(e, r, n, t) {
        if (e < r || n < e || e !== (e < 0 ? h(e) : p(e))) throw Error(g + (t || "Argument") + ("number" == typeof e ? e < r || n < e ? " out of range: " : " not an integer: " : " not a primitive number: ") + e);
    }
    function s(e) {
        return "[object Array]" == Object.prototype.toString.call(e);
    }
    function f(e) {
        var r = e.c.length - 1;
        return n(e.e / m) == r && e.c[r] % 2 != 0;
    }
    function u(e, r) {
        return (1 < e.length ? e.charAt(0) + "." + e.slice(1) : e) + (r < 0 ? "e" : "e+") + r;
    }
    function c(e, r, n) {
        var t, i;
        if (r < 0) {
            for (i = n + "."; ++r; i += n) ;
            e = i + e;
        } else if (++r > (t = e.length)) {
            for (i = n, r -= t; --r; i += n) ;
            e += i;
        } else r < t && (e = e.slice(0, r) + "." + e.slice(r));
        return e;
    }
    var l, a = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i, h = Math.ceil, p = Math.floor, g = "[BigNumber Error] ", w = g + "Number primitive has more than 15 significant digits: ", d = 1e14, m = 14, v = 9007199254740991, y = [ 1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13 ], N = 1e7, O = 1e9;
    (l = function r(l) {
        function b(e, r) {
            var n, t, i, s, f, u, c, l, h = this;
            if (!(h instanceof b)) return new b(e, r);
            if (null == r) {
                if (e instanceof b) return h.s = e.s, h.e = e.e, void (h.c = (e = e.c) ? e.slice() : e);
                if ((u = "number" == typeof e) && 0 * e == 0) {
                    if (h.s = 1 / e < 0 ? (e = -e, -1) : 1, e === ~~e) {
                        for (s = 0, f = e; 10 <= f; f /= 10, s++) ;
                        return h.e = s, void (h.c = [ e ]);
                    }
                    l = e + "";
                } else {
                    if (!a.test(l = e + "")) return D(h, l, u);
                    h.s = 45 == l.charCodeAt(0) ? (l = l.slice(1), -1) : 1;
                }
                -1 < (s = l.indexOf(".")) && (l = l.replace(".", "")), 0 < (f = l.search(/e/i)) ? (s < 0 && (s = f), 
                s += +l.slice(f + 1), l = l.substring(0, f)) : s < 0 && (s = l.length);
            } else {
                if (o(r, 2, Y.length, "Base"), l = e + "", 10 == r) return R(h = new b(e instanceof b ? e : l), F + h.e + 1, k);
                if (u = "number" == typeof e) {
                    if (0 * e != 0) return D(h, l, u, r);
                    if (h.s = 1 / e < 0 ? (l = l.slice(1), -1) : 1, b.DEBUG && 15 < l.replace(/^0\.0*|\./, "").length) throw Error(w + e);
                    u = !1;
                } else h.s = 45 === l.charCodeAt(0) ? (l = l.slice(1), -1) : 1;
                for (n = Y.slice(0, r), s = f = 0, c = l.length; f < c; f++) if (n.indexOf(t = l.charAt(f)) < 0) {
                    if ("." == t) {
                        if (s < f) {
                            s = c;
                            continue;
                        }
                    } else if (!i && (l == l.toUpperCase() && (l = l.toLowerCase()) || l == l.toLowerCase() && (l = l.toUpperCase()))) {
                        i = !0, f = -1, s = 0;
                        continue;
                    }
                    return D(h, e + "", u, r);
                }
                -1 < (s = (l = _(l, r, 10, h.s)).indexOf(".")) ? l = l.replace(".", "") : s = l.length;
            }
            for (f = 0; 48 === l.charCodeAt(f); f++) ;
            for (c = l.length; 48 === l.charCodeAt(--c); ) ;
            if (l = l.slice(f, ++c)) {
                if (c -= f, u && b.DEBUG && 15 < c && (v < e || e !== p(e))) throw Error(w + h.s * e);
                if (j < (s = s - f - 1)) h.c = h.e = null; else if (s < z) h.c = [ h.e = 0 ]; else {
                    if (h.e = s, h.c = [], f = (s + 1) % m, s < 0 && (f += m), f < c) {
                        for (f && h.c.push(+l.slice(0, f)), c -= m; f < c; ) h.c.push(+l.slice(f, f += m));
                        l = l.slice(f), f = m - l.length;
                    } else f -= c;
                    for (;f--; l += "0") ;
                    h.c.push(+l);
                }
            } else h.c = [ h.e = 0 ];
        }
        function E(e, r, n, i) {
            var s, f, l, a, h;
            if (null == n ? n = k : o(n, 0, 8), !e.c) return e.toString();
            if (s = e.c[0], l = e.e, null == r) h = t(e.c), h = 1 == i || 2 == i && l <= q ? u(h, l) : c(h, l, "0"); else if (f = (e = R(new b(e), r, n)).e, 
            a = (h = t(e.c)).length, 1 == i || 2 == i && (r <= f || f <= q)) {
                for (;a < r; h += "0", a++) ;
                h = u(h, f);
            } else if (r -= l, h = c(h, f, "0"), a < f + 1) {
                if (0 < --r) for (h += "."; r--; h += "0") ;
            } else if (0 < (r += f - a)) for (f + 1 == a && (h += "."); r--; h += "0") ;
            return e.s < 0 && s ? "-" + h : h;
        }
        function A(e, r) {
            var n, t, i = 0;
            for (s(e[0]) && (e = e[0]), n = new b(e[0]); ++i < e.length; ) {
                if (!(t = new b(e[i])).s) {
                    n = t;
                    break;
                }
                r.call(n, t) && (n = t);
            }
            return n;
        }
        function S(e, r, n) {
            for (var t = 1, i = r.length; !r[--i]; r.pop()) ;
            for (i = r[0]; 10 <= i; i /= 10, t++) ;
            return (n = t + n * m - 1) > j ? e.c = e.e = null : n < z ? e.c = [ e.e = 0 ] : (e.e = n, 
            e.c = r), e;
        }
        function R(e, r, n, t) {
            var i, o, s, f, u, c, l, a = e.c, g = y;
            if (a) {
                e: {
                    for (i = 1, f = a[0]; 10 <= f; f /= 10, i++) ;
                    if ((o = r - i) < 0) o += m, s = r, l = (u = a[c = 0]) / g[i - s - 1] % 10 | 0; else if ((c = h((o + 1) / m)) >= a.length) {
                        if (!t) break e;
                        for (;a.length <= c; a.push(0)) ;
                        u = l = 0, s = (o %= m) - m + (i = 1);
                    } else {
                        for (u = f = a[c], i = 1; 10 <= f; f /= 10, i++) ;
                        l = (s = (o %= m) - m + i) < 0 ? 0 : u / g[i - s - 1] % 10 | 0;
                    }
                    if (t = t || r < 0 || null != a[c + 1] || (s < 0 ? u : u % g[i - s - 1]), t = n < 4 ? (l || t) && (0 == n || n == (e.s < 0 ? 3 : 2)) : 5 < l || 5 == l && (4 == n || t || 6 == n && (0 < o ? 0 < s ? u / g[i - s] : 0 : a[c - 1]) % 10 & 1 || n == (e.s < 0 ? 8 : 7)), 
                    r < 1 || !a[0]) return a.length = 0, t ? (r -= e.e + 1, a[0] = g[(m - r % m) % m], 
                    e.e = -r || 0) : a[0] = e.e = 0, e;
                    if (0 == o ? (a.length = c, f = 1, c--) : (a.length = c + 1, f = g[m - o], a[c] = 0 < s ? p(u / g[i - s] % g[s]) * f : 0), 
                    t) for (;;) {
                        if (0 == c) {
                            for (o = 1, s = a[0]; 10 <= s; s /= 10, o++) ;
                            for (s = a[0] += f, f = 1; 10 <= s; s /= 10, f++) ;
                            o != f && (e.e++, a[0] == d && (a[0] = 1));
                            break;
                        }
                        if (a[c] += f, a[c] != d) break;
                        a[c--] = 0, f = 1;
                    }
                    for (o = a.length; 0 === a[--o]; a.pop()) ;
                }
                e.e > j ? e.c = e.e = null : e.e < z && (e.c = [ e.e = 0 ]);
            }
            return e;
        }
        var P, _, D, L, B, U, I, T, x, C, M = b.prototype = {
            constructor: b,
            toString: null,
            valueOf: null
        }, G = new b(1), F = 20, k = 4, q = -7, $ = 21, z = -1e7, j = 1e7, H = !1, V = 1, W = 0, X = {
            decimalSeparator: ".",
            groupSeparator: ",",
            groupSize: 3,
            secondaryGroupSize: 0,
            fractionGroupSeparator: " ",
            fractionGroupSize: 0
        }, Y = "0123456789abcdefghijklmnopqrstuvwxyz";
        return b.clone = r, b.ROUND_UP = 0, b.ROUND_DOWN = 1, b.ROUND_CEIL = 2, b.ROUND_FLOOR = 3, 
        b.ROUND_HALF_UP = 4, b.ROUND_HALF_DOWN = 5, b.ROUND_HALF_EVEN = 6, b.ROUND_HALF_CEIL = 7, 
        b.ROUND_HALF_FLOOR = 8, b.EUCLID = 9, b.config = b.set = function(r) {
            var n, t;
            if (null != r) {
                if ("object" != (void 0 === r ? "undefined" : e(r))) throw Error(g + "Object expected: " + r);
                if (r.hasOwnProperty(n = "DECIMAL_PLACES") && (o(t = r[n], 0, O, n), F = t), r.hasOwnProperty(n = "ROUNDING_MODE") && (o(t = r[n], 0, 8, n), 
                k = t), r.hasOwnProperty(n = "EXPONENTIAL_AT") && (s(t = r[n]) ? (o(t[0], -O, 0, n), 
                o(t[1], 0, O, n), q = t[0], $ = t[1]) : (o(t, -O, O, n), q = -($ = t < 0 ? -t : t))), 
                r.hasOwnProperty(n = "RANGE")) if (s(t = r[n])) o(t[0], -O, -1, n), o(t[1], 1, O, n), 
                z = t[0], j = t[1]; else {
                    if (o(t, -O, O, n), !t) throw Error(g + n + " cannot be zero: " + t);
                    z = -(j = t < 0 ? -t : t);
                }
                if (r.hasOwnProperty(n = "CRYPTO")) {
                    if ((t = r[n]) !== !!t) throw Error(g + n + " not true or false: " + t);
                    if (t) {
                        if ("undefined" == typeof crypto || !crypto || !crypto.getRandomValues && !crypto.randomBytes) throw H = !t, 
                        Error(g + "crypto unavailable");
                        H = t;
                    } else H = t;
                }
                if (r.hasOwnProperty(n = "MODULO_MODE") && (o(t = r[n], 0, 9, n), V = t), r.hasOwnProperty(n = "POW_PRECISION") && (o(t = r[n], 0, O, n), 
                W = t), r.hasOwnProperty(n = "FORMAT")) {
                    if ("object" != e(t = r[n])) throw Error(g + n + " not an object: " + t);
                    X = t;
                }
                if (r.hasOwnProperty(n = "ALPHABET")) {
                    if ("string" != typeof (t = r[n]) || /^.$|\.|(.).*\1/.test(t)) throw Error(g + n + " invalid: " + t);
                    Y = t;
                }
            }
            return {
                DECIMAL_PLACES: F,
                ROUNDING_MODE: k,
                EXPONENTIAL_AT: [ q, $ ],
                RANGE: [ z, j ],
                CRYPTO: H,
                MODULO_MODE: V,
                POW_PRECISION: W,
                FORMAT: X,
                ALPHABET: Y
            };
        }, b.isBigNumber = function(e) {
            return e instanceof b || e && !0 === e._isBigNumber || !1;
        }, b.maximum = b.max = function() {
            return A(arguments, M.lt);
        }, b.minimum = b.min = function() {
            return A(arguments, M.gt);
        }, b.random = (L = 9007199254740992, B = Math.random() * L & 2097151 ? function() {
            return p(Math.random() * L);
        } : function() {
            return 8388608 * (1073741824 * Math.random() | 0) + (8388608 * Math.random() | 0);
        }, function(e) {
            var r, n, t, i, s, f = 0, u = [], c = new b(G);
            if (null == e ? e = F : o(e, 0, O), i = h(e / m), H) if (crypto.getRandomValues) {
                for (r = crypto.getRandomValues(new Uint32Array(i *= 2)); f < i; ) 9e15 <= (s = 131072 * r[f] + (r[f + 1] >>> 11)) ? (n = crypto.getRandomValues(new Uint32Array(2)), 
                r[f] = n[0], r[f + 1] = n[1]) : (u.push(s % 1e14), f += 2);
                f = i / 2;
            } else {
                if (!crypto.randomBytes) throw H = !1, Error(g + "crypto unavailable");
                for (r = crypto.randomBytes(i *= 7); f < i; ) 9e15 <= (s = 281474976710656 * (31 & r[f]) + 1099511627776 * r[f + 1] + 4294967296 * r[f + 2] + 16777216 * r[f + 3] + (r[f + 4] << 16) + (r[f + 5] << 8) + r[f + 6]) ? crypto.randomBytes(7).copy(r, f) : (u.push(s % 1e14), 
                f += 7);
                f = i / 7;
            }
            if (!H) for (;f < i; ) (s = B()) < 9e15 && (u[f++] = s % 1e14);
            for (i = u[--f], e %= m, i && e && (s = y[m - e], u[f] = p(i / s) * s); 0 === u[f]; u.pop(), 
            f--) ;
            if (f < 0) u = [ t = 0 ]; else {
                for (t = -1; 0 === u[0]; u.splice(0, 1), t -= m) ;
                for (f = 1, s = u[0]; 10 <= s; s /= 10, f++) ;
                f < m && (t -= m - f);
            }
            return c.e = t, c.c = u, c;
        }), _ = function() {
            function e(e, r, n, t) {
                for (var i, o, s = [ 0 ], f = 0, u = e.length; f < u; ) {
                    for (o = s.length; o--; s[o] *= r) ;
                    for (s[0] += t.indexOf(e.charAt(f++)), i = 0; i < s.length; i++) s[i] > n - 1 && (null == s[i + 1] && (s[i + 1] = 0), 
                    s[i + 1] += s[i] / n | 0, s[i] %= n);
                }
                return s.reverse();
            }
            var r = "0123456789";
            return function(n, i, o, s, f) {
                var u, l, a, h, p, g, w, d, m = n.indexOf("."), v = F, y = k;
                for (0 <= m && (h = W, W = 0, n = n.replace(".", ""), g = (d = new b(i)).pow(n.length - m), 
                W = h, d.c = e(c(t(g.c), g.e, "0"), 10, o, r), d.e = d.c.length), a = h = (w = e(n, i, o, f ? (u = Y, 
                r) : (u = r, Y))).length; 0 == w[--h]; w.pop()) ;
                if (!w[0]) return u.charAt(0);
                if (m < 0 ? --a : (g.c = w, g.e = a, g.s = s, w = (g = P(g, d, v, y, o)).c, p = g.r, 
                a = g.e), m = w[l = a + v + 1], h = o / 2, p = p || l < 0 || null != w[l + 1], p = y < 4 ? (null != m || p) && (0 == y || y == (g.s < 0 ? 3 : 2)) : h < m || m == h && (4 == y || p || 6 == y && 1 & w[l - 1] || y == (g.s < 0 ? 8 : 7)), 
                l < 1 || !w[0]) n = p ? c(u.charAt(1), -v, u.charAt(0)) : u.charAt(0); else {
                    if (w.length = l, p) for (--o; ++w[--l] > o; ) w[l] = 0, l || (++a, w = [ 1 ].concat(w));
                    for (h = w.length; !w[--h]; ) ;
                    for (m = 0, n = ""; m <= h; n += u.charAt(w[m++])) ;
                    n = c(n, a, u.charAt(0));
                }
                return n;
            };
        }(), P = function() {
            function e(e, r, n) {
                var t, i, o, s, f = 0, u = e.length, c = r % N, l = r / N | 0;
                for (e = e.slice(); u--; ) f = ((i = c * (o = e[u] % N) + (t = l * o + (s = e[u] / N | 0) * c) % N * N + f) / n | 0) + (t / N | 0) + l * s, 
                e[u] = i % n;
                return f && (e = [ f ].concat(e)), e;
            }
            function r(e, r, n, t) {
                var i, o;
                if (n != t) o = t < n ? 1 : -1; else for (i = o = 0; i < n; i++) if (e[i] != r[i]) {
                    o = e[i] > r[i] ? 1 : -1;
                    break;
                }
                return o;
            }
            function t(e, r, n, t) {
                for (var i = 0; n--; ) e[n] -= i, i = e[n] < r[n] ? 1 : 0, e[n] = i * t + e[n] - r[n];
                for (;!e[0] && 1 < e.length; e.splice(0, 1)) ;
            }
            return function(i, o, s, f, u) {
                var c, l, a, h, g, w, v, y, N, O, E, A, S, P, _, D, L, B = i.s == o.s ? 1 : -1, U = i.c, I = o.c;
                if (!(U && U[0] && I && I[0])) return new b(i.s && o.s && (U ? !I || U[0] != I[0] : I) ? U && 0 == U[0] || !I ? 0 * B : B / 0 : NaN);
                for (N = (y = new b(B)).c = [], B = s + (l = i.e - o.e) + 1, u || (u = d, l = n(i.e / m) - n(o.e / m), 
                B = B / m | 0), a = 0; I[a] == (U[a] || 0); a++) ;
                if (I[a] > (U[a] || 0) && l--, B < 0) N.push(1), h = !0; else {
                    for (P = U.length, D = I.length, B += 2, 1 < (g = p(u / (I[a = 0] + 1))) && (I = e(I, g, u), 
                    U = e(U, g, u), D = I.length, P = U.length), S = D, E = (O = U.slice(0, D)).length; E < D; O[E++] = 0) ;
                    L = I.slice(), L = [ 0 ].concat(L), _ = I[0], I[1] >= u / 2 && _++;
                    do {
                        if (g = 0, (c = r(I, O, D, E)) < 0) {
                            if (A = O[0], D != E && (A = A * u + (O[1] || 0)), 1 < (g = p(A / _))) for (u <= g && (g = u - 1), 
                            v = (w = e(I, g, u)).length, E = O.length; 1 == r(w, O, v, E); ) g--, t(w, D < v ? L : I, v, u), 
                            v = w.length, c = 1; else 0 == g && (c = g = 1), v = (w = I.slice()).length;
                            if (v < E && (w = [ 0 ].concat(w)), t(O, w, E, u), E = O.length, -1 == c) for (;r(I, O, D, E) < 1; ) g++, 
                            t(O, D < E ? L : I, E, u), E = O.length;
                        } else 0 === c && (g++, O = [ 0 ]);
                        N[a++] = g, O[0] ? O[E++] = U[S] || 0 : (O = [ U[S] ], E = 1);
                    } while ((S++ < P || null != O[0]) && B--);
                    h = null != O[0], N[0] || N.splice(0, 1);
                }
                if (u == d) {
                    for (a = 1, B = N[0]; 10 <= B; B /= 10, a++) ;
                    R(y, s + (y.e = a + l * m - 1) + 1, f, h);
                } else y.e = l, y.r = +h;
                return y;
            };
        }(), U = /^(-?)0([xbo])(?=\w[\w.]*$)/i, I = /^([^.]+)\.$/, T = /^\.([^.]+)$/, x = /^-?(Infinity|NaN)$/, 
        C = /^\s*\+(?=[\w.])|^\s+|\s+$/g, D = function(e, r, n, t) {
            var i, o = n ? r : r.replace(C, "");
            if (x.test(o)) e.s = isNaN(o) ? null : o < 0 ? -1 : 1, e.c = e.e = null; else {
                if (!n && (o = o.replace(U, function(e, r, n) {
                    return i = "x" == (n = n.toLowerCase()) ? 16 : "b" == n ? 2 : 8, t && t != i ? e : r;
                }), t && (i = t, o = o.replace(I, "$1").replace(T, "0.$1")), r != o)) return new b(o, i);
                if (b.DEBUG) throw Error(g + "Not a" + (t ? " base " + t : "") + " number: " + r);
                e.c = e.e = e.s = null;
            }
        }, M.absoluteValue = M.abs = function() {
            var e = new b(this);
            return e.s < 0 && (e.s = 1), e;
        }, M.comparedTo = function(e, r) {
            return i(this, new b(e, r));
        }, M.decimalPlaces = M.dp = function(e, r) {
            var t, i, s;
            if (null != e) return o(e, 0, O), null == r ? r = k : o(r, 0, 8), R(new b(this), e + this.e + 1, r);
            if (!(t = this.c)) return null;
            if (i = ((s = t.length - 1) - n(this.e / m)) * m, s = t[s]) for (;s % 10 == 0; s /= 10, 
            i--) ;
            return i < 0 && (i = 0), i;
        }, M.dividedBy = M.div = function(e, r) {
            return P(this, new b(e, r), F, k);
        }, M.dividedToIntegerBy = M.idiv = function(e, r) {
            return P(this, new b(e, r), 0, 1);
        }, M.exponentiatedBy = M.pow = function(e, r) {
            var n, t, i, o, s, u, c, l = this;
            if ((e = new b(e)).c && !e.isInteger()) throw Error(g + "Exponent not an integer: " + e);
            if (null != r && (r = new b(r)), o = 14 < e.e, !l.c || !l.c[0] || 1 == l.c[0] && !l.e && 1 == l.c.length || !e.c || !e.c[0]) return c = new b(Math.pow(+l.valueOf(), o ? 2 - f(e) : +e)), 
            r ? c.mod(r) : c;
            if (s = e.s < 0, r) {
                if (r.c ? !r.c[0] : !r.s) return new b(NaN);
                (t = !s && l.isInteger() && r.isInteger()) && (l = l.mod(r));
            } else {
                if (9 < e.e && (0 < l.e || l.e < -1 || (0 == l.e ? 1 < l.c[0] || o && 24e7 <= l.c[1] : l.c[0] < 8e13 || o && l.c[0] <= 9999975e7))) return i = l.s < 0 && f(e) ? -0 : 0, 
                -1 < l.e && (i = 1 / i), new b(s ? 1 / i : i);
                W && (i = h(W / m + 2));
            }
            for (o ? (n = new b(.5), u = f(e)) : u = e % 2, s && (e.s = 1), c = new b(G); ;) {
                if (u) {
                    if (!(c = c.times(l)).c) break;
                    i ? c.c.length > i && (c.c.length = i) : t && (c = c.mod(r));
                }
                if (o) {
                    if (R(e = e.times(n), e.e + 1, 1), !e.c[0]) break;
                    o = 14 < e.e, u = f(e);
                } else {
                    if (!(e = p(e / 2))) break;
                    u = e % 2;
                }
                l = l.times(l), i ? l.c && l.c.length > i && (l.c.length = i) : t && (l = l.mod(r));
            }
            return t ? c : (s && (c = G.div(c)), r ? c.mod(r) : i ? R(c, W, k, void 0) : c);
        }, M.integerValue = function(e) {
            var r = new b(this);
            return null == e ? e = k : o(e, 0, 8), R(r, r.e + 1, e);
        }, M.isEqualTo = M.eq = function(e, r) {
            return 0 === i(this, new b(e, r));
        }, M.isFinite = function() {
            return !!this.c;
        }, M.isGreaterThan = M.gt = function(e, r) {
            return 0 < i(this, new b(e, r));
        }, M.isGreaterThanOrEqualTo = M.gte = function(e, r) {
            return 1 === (r = i(this, new b(e, r))) || 0 === r;
        }, M.isInteger = function() {
            return !!this.c && n(this.e / m) > this.c.length - 2;
        }, M.isLessThan = M.lt = function(e, r) {
            return i(this, new b(e, r)) < 0;
        }, M.isLessThanOrEqualTo = M.lte = function(e, r) {
            return -1 === (r = i(this, new b(e, r))) || 0 === r;
        }, M.isNaN = function() {
            return !this.s;
        }, M.isNegative = function() {
            return this.s < 0;
        }, M.isPositive = function() {
            return 0 < this.s;
        }, M.isZero = function() {
            return !!this.c && 0 == this.c[0];
        }, M.minus = function(e, r) {
            var t, i, o, s, f = this, u = f.s;
            if (r = (e = new b(e, r)).s, !u || !r) return new b(NaN);
            if (u != r) return e.s = -r, f.plus(e);
            var c = f.e / m, l = e.e / m, a = f.c, h = e.c;
            if (!c || !l) {
                if (!a || !h) return a ? (e.s = -r, e) : new b(h ? f : NaN);
                if (!a[0] || !h[0]) return h[0] ? (e.s = -r, e) : new b(a[0] ? f : 3 == k ? -0 : 0);
            }
            if (c = n(c), l = n(l), a = a.slice(), u = c - l) {
                for ((s = u < 0) ? (u = -u, o = a) : (l = c, o = h), o.reverse(), r = u; r--; o.push(0)) ;
                o.reverse();
            } else for (i = (s = (u = a.length) < (r = h.length)) ? u : r, u = r = 0; r < i; r++) if (a[r] != h[r]) {
                s = a[r] < h[r];
                break;
            }
            if (s && (o = a, a = h, h = o, e.s = -e.s), 0 < (r = (i = h.length) - (t = a.length))) for (;r--; a[t++] = 0) ;
            for (r = d - 1; u < i; ) {
                if (a[--i] < h[i]) {
                    for (t = i; t && !a[--t]; a[t] = r) ;
                    --a[t], a[i] += d;
                }
                a[i] -= h[i];
            }
            for (;0 == a[0]; a.splice(0, 1), --l) ;
            return a[0] ? S(e, a, l) : (e.s = 3 == k ? -1 : 1, e.c = [ e.e = 0 ], e);
        }, M.modulo = M.mod = function(e, r) {
            var n, t, i = this;
            return e = new b(e, r), !i.c || !e.s || e.c && !e.c[0] ? new b(NaN) : !e.c || i.c && !i.c[0] ? new b(i) : (9 == V ? (t = e.s, 
            e.s = 1, n = P(i, e, 0, 3), e.s = t, n.s *= t) : n = P(i, e, 0, V), (e = i.minus(n.times(e))).c[0] || 1 != V || (e.s = i.s), 
            e);
        }, M.multipliedBy = M.times = function(e, r) {
            var t, i, o, s, f, u, c, l, a, h, p, g, w, v, y, O = this, E = O.c, A = (e = new b(e, r)).c;
            if (!(E && A && E[0] && A[0])) return !O.s || !e.s || E && !E[0] && !A || A && !A[0] && !E ? e.c = e.e = e.s = null : (e.s *= O.s, 
            E && A ? (e.c = [ 0 ], e.e = 0) : e.c = e.e = null), e;
            for (i = n(O.e / m) + n(e.e / m), e.s *= O.s, (c = E.length) < (h = A.length) && (w = E, 
            E = A, A = w, o = c, c = h, h = o), o = c + h, w = []; o--; w.push(0)) ;
            for (v = d, y = N, o = h; 0 <= --o; ) {
                for (t = 0, p = A[o] % y, g = A[o] / y | 0, s = o + (f = c); o < s; ) t = ((l = p * (l = E[--f] % y) + (u = g * l + (a = E[f] / y | 0) * p) % y * y + w[s] + t) / v | 0) + (u / y | 0) + g * a, 
                w[s--] = l % v;
                w[s] = t;
            }
            return t ? ++i : w.splice(0, 1), S(e, w, i);
        }, M.negated = function() {
            var e = new b(this);
            return e.s = -e.s || null, e;
        }, M.plus = function(e, r) {
            var t, i = this, o = i.s;
            if (r = (e = new b(e, r)).s, !o || !r) return new b(NaN);
            if (o != r) return e.s = -r, i.minus(e);
            var s = i.e / m, f = e.e / m, u = i.c, c = e.c;
            if (!s || !f) {
                if (!u || !c) return new b(o / 0);
                if (!u[0] || !c[0]) return c[0] ? e : new b(u[0] ? i : 0 * o);
            }
            if (s = n(s), f = n(f), u = u.slice(), o = s - f) {
                for (0 < o ? (f = s, t = c) : (o = -o, t = u), t.reverse(); o--; t.push(0)) ;
                t.reverse();
            }
            for ((o = u.length) - (r = c.length) < 0 && (t = c, c = u, u = t, r = o), o = 0; r; ) o = (u[--r] = u[r] + c[r] + o) / d | 0, 
            u[r] = d === u[r] ? 0 : u[r] % d;
            return o && (u = [ o ].concat(u), ++f), S(e, u, f);
        }, M.precision = M.sd = function(e, r) {
            var n, t, i;
            if (null != e && e !== !!e) return o(e, 1, O), null == r ? r = k : o(r, 0, 8), R(new b(this), e, r);
            if (!(n = this.c)) return null;
            if (t = (i = n.length - 1) * m + 1, i = n[i]) {
                for (;i % 10 == 0; i /= 10, t--) ;
                for (i = n[0]; 10 <= i; i /= 10, t++) ;
            }
            return e && this.e + 1 > t && (t = this.e + 1), t;
        }, M.shiftedBy = function(e) {
            return o(e, -v, v), this.times("1e" + e);
        }, M.squareRoot = M.sqrt = function() {
            var e, r, i, o, s, f = this, u = f.c, c = f.s, l = f.e, a = F + 4, h = new b("0.5");
            if (1 !== c || !u || !u[0]) return new b(!c || c < 0 && (!u || u[0]) ? NaN : u ? f : 1 / 0);
            if (0 == (c = Math.sqrt(+f)) || c == 1 / 0 ? (((r = t(u)).length + l) % 2 == 0 && (r += "0"), 
            c = Math.sqrt(r), l = n((l + 1) / 2) - (l < 0 || l % 2), i = new b(r = c == 1 / 0 ? "1e" + l : (r = c.toExponential()).slice(0, r.indexOf("e") + 1) + l)) : i = new b(c + ""), 
            i.c[0]) for ((c = (l = i.e) + a) < 3 && (c = 0); ;) if (s = i, i = h.times(s.plus(P(f, s, a, 1))), 
            t(s.c).slice(0, c) === (r = t(i.c)).slice(0, c)) {
                if (i.e < l && --c, "9999" != (r = r.slice(c - 3, c + 1)) && (o || "4999" != r)) {
                    +r && (+r.slice(1) || "5" != r.charAt(0)) || (R(i, i.e + F + 2, 1), e = !i.times(i).eq(f));
                    break;
                }
                if (!o && (R(s, s.e + F + 2, 0), s.times(s).eq(f))) {
                    i = s;
                    break;
                }
                a += 4, c += 4, o = 1;
            }
            return R(i, i.e + F + 1, k, e);
        }, M.toExponential = function(e, r) {
            return null != e && (o(e, 0, O), e++), E(this, e, r, 1);
        }, M.toFixed = function(e, r) {
            return null != e && (o(e, 0, O), e = e + this.e + 1), E(this, e, r);
        }, M.toFormat = function(e, r) {
            var n = this.toFixed(e, r);
            if (this.c) {
                var t, i = n.split("."), o = +X.groupSize, s = +X.secondaryGroupSize, f = X.groupSeparator, u = i[0], c = i[1], l = this.s < 0, a = l ? u.slice(1) : u, h = a.length;
                if (s && (t = o, o = s, h -= s = t), 0 < o && 0 < h) {
                    for (t = h % o || o, u = a.substr(0, t); t < h; t += o) u += f + a.substr(t, o);
                    0 < s && (u += f + a.slice(t)), l && (u = "-" + u);
                }
                n = c ? u + X.decimalSeparator + ((s = +X.fractionGroupSize) ? c.replace(new RegExp("\\d{" + s + "}\\B", "g"), "$&" + X.fractionGroupSeparator) : c) : u;
            }
            return n;
        }, M.toFraction = function(e) {
            var r, n, i, o, s, f, u, c, l, a, h, p, w = this, d = w.c;
            if (null != e && (!(c = new b(e)).isInteger() && (c.c || 1 !== c.s) || c.lt(G))) throw Error(g + "Argument " + (c.isInteger() ? "out of range: " : "not an integer: ") + e);
            if (!d) return w.toString();
            for (n = new b(G), a = i = new b(G), o = l = new b(G), p = t(d), f = n.e = p.length - w.e - 1, 
            n.c[0] = y[(u = f % m) < 0 ? m + u : u], e = !e || 0 < c.comparedTo(n) ? 0 < f ? n : a : c, 
            u = j, j = 1 / 0, c = new b(p), l.c[0] = 0; h = P(c, n, 0, 1), 1 != (s = i.plus(h.times(o))).comparedTo(e); ) i = o, 
            o = s, a = l.plus(h.times(s = a)), l = s, n = c.minus(h.times(s = n)), c = s;
            return s = P(e.minus(i), o, 0, 1), l = l.plus(s.times(a)), i = i.plus(s.times(o)), 
            l.s = a.s = w.s, r = P(a, o, f *= 2, k).minus(w).abs().comparedTo(P(l, i, f, k).minus(w).abs()) < 1 ? [ a.toString(), o.toString() ] : [ l.toString(), i.toString() ], 
            j = u, r;
        }, M.toNumber = function() {
            return +this;
        }, M.toPrecision = function(e, r) {
            return null != e && o(e, 1, O), E(this, e, r, 2);
        }, M.toString = function(e) {
            var r, n = this.s, i = this.e;
            return null === i ? n ? (r = "Infinity", n < 0 && (r = "-" + r)) : r = "NaN" : (r = t(this.c), 
            null == e ? r = i <= q || $ <= i ? u(r, i) : c(r, i, "0") : (o(e, 2, Y.length, "Base"), 
            r = _(c(r, i, "0"), 10, e, n, !0)), n < 0 && this.c[0] && (r = "-" + r)), r;
        }, M.valueOf = M.toJSON = function() {
            var e, r = this.e;
            return null === r ? this.toString() : (e = t(this.c), e = r <= q || $ <= r ? u(e, r) : c(e, r, "0"), 
            this.s < 0 ? "-" + e : e);
        }, M._isBigNumber = !0, null != l && b.set(l), b;
    }()).default = l.BigNumber = l, "function" == typeof define && define.amd ? define(function() {
        return l;
    }) : "undefined" != typeof module && module.exports ? module.exports = l : (r || (r = "undefined" != typeof self && self ? self : window), 
    r.BigNumber = l), window.BigNumber = l;
}(void 0);