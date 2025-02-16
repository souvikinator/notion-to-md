(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // (disabled):worker_threads
  var require_worker_threads = __commonJS({
    "(disabled):worker_threads"() {
    }
  });

  // node_modules/flexsearch/dist/flexsearch.bundle.module.min.js
  var t;
  function u(a) {
    return "undefined" !== typeof a ? a : true;
  }
  function v(a) {
    const b = Array(a);
    for (let c = 0; c < a; c++) b[c] = x();
    return b;
  }
  function x() {
    return /* @__PURE__ */ Object.create(null);
  }
  function aa(a, b) {
    return b.length - a.length;
  }
  function C(a) {
    return "string" === typeof a;
  }
  function D(a) {
    return "object" === typeof a;
  }
  function E(a) {
    return "function" === typeof a;
  }
  function F(a, b) {
    var c = ba;
    if (a && (b && (a = G(a, b)), this.H && (a = G(a, this.H)), this.J && 1 < a.length && (a = G(a, this.J)), c || "" === c)) {
      b = a.split(c);
      if (this.filter) {
        a = this.filter;
        c = b.length;
        const d = [];
        for (let e = 0, f = 0; e < c; e++) {
          const h = b[e];
          h && !a[h] && (d[f++] = h);
        }
        a = d;
      } else a = b;
      return a;
    }
    return a;
  }
  var ba = /[\p{Z}\p{S}\p{P}\p{C}]+/u;
  var ca = /[\u0300-\u036f]/g;
  function I(a, b) {
    const c = Object.keys(a), d = c.length, e = [];
    let f = "", h = 0;
    for (let g = 0, k, m; g < d; g++) k = c[g], (m = a[k]) ? (e[h++] = J(b ? "(?!\\b)" + k + "(\\b|_)" : k), e[h++] = m) : f += (f ? "|" : "") + k;
    f && (e[h++] = J(b ? "(?!\\b)(" + f + ")(\\b|_)" : "(" + f + ")"), e[h] = "");
    return e;
  }
  function G(a, b) {
    for (let c = 0, d = b.length; c < d && (a = a.replace(b[c], b[c + 1]), a); c += 2) ;
    return a;
  }
  function J(a) {
    return new RegExp(a, "g");
  }
  function da(a) {
    let b = "", c = "";
    for (let d = 0, e = a.length, f; d < e; d++) (f = a[d]) !== c && (b += c = f);
    return b;
  }
  var fa = { encode: ea, F: false, G: "" };
  function ea(a) {
    return F.call(this, ("" + a).toLowerCase(), false);
  }
  var ha = {};
  var K = {};
  function ia(a) {
    L(a, "add");
    L(a, "append");
    L(a, "search");
    L(a, "update");
    L(a, "remove");
  }
  function L(a, b) {
    a[b + "Async"] = function() {
      const c = this, d = arguments;
      var e = d[d.length - 1];
      let f;
      E(e) && (f = e, delete d[d.length - 1]);
      e = new Promise(function(h) {
        setTimeout(function() {
          c.async = true;
          const g = c[b].apply(c, d);
          c.async = false;
          h(g);
        });
      });
      return f ? (e.then(f), this) : e;
    };
  }
  function ja(a, b, c, d) {
    const e = a.length;
    let f = [], h, g, k = 0;
    d && (d = []);
    for (let m = e - 1; 0 <= m; m--) {
      const n = a[m], w = n.length, q = x();
      let r = !h;
      for (let l = 0; l < w; l++) {
        const p = n[l], A = p.length;
        if (A) for (let B = 0, z, y; B < A; B++) if (y = p[B], h) {
          if (h[y]) {
            if (!m) {
              if (c) c--;
              else if (f[k++] = y, k === b) return f;
            }
            if (m || d) q[y] = 1;
            r = true;
          }
          if (d && (z = (g[y] || 0) + 1, g[y] = z, z < e)) {
            const H = d[z - 2] || (d[z - 2] = []);
            H[H.length] = y;
          }
        } else q[y] = 1;
      }
      if (d) h || (g = q);
      else if (!r) return [];
      h = q;
    }
    if (d) for (let m = d.length - 1, n, w; 0 <= m; m--) {
      n = d[m];
      w = n.length;
      for (let q = 0, r; q < w; q++) if (r = n[q], !h[r]) {
        if (c) c--;
        else if (f[k++] = r, k === b) return f;
        h[r] = 1;
      }
    }
    return f;
  }
  function ka(a, b) {
    const c = x(), d = x(), e = [];
    for (let f = 0; f < a.length; f++) c[a[f]] = 1;
    for (let f = 0, h; f < b.length; f++) {
      h = b[f];
      for (let g = 0, k; g < h.length; g++) k = h[g], c[k] && !d[k] && (d[k] = 1, e[e.length] = k);
    }
    return e;
  }
  function M(a) {
    this.l = true !== a && a;
    this.cache = x();
    this.h = [];
  }
  function la(a, b, c) {
    D(a) && (a = a.query);
    let d = this.cache.get(a);
    d || (d = this.search(a, b, c), this.cache.set(a, d));
    return d;
  }
  M.prototype.set = function(a, b) {
    if (!this.cache[a]) {
      var c = this.h.length;
      c === this.l ? delete this.cache[this.h[c - 1]] : c++;
      for (--c; 0 < c; c--) this.h[c] = this.h[c - 1];
      this.h[0] = a;
    }
    this.cache[a] = b;
  };
  M.prototype.get = function(a) {
    const b = this.cache[a];
    if (this.l && b && (a = this.h.indexOf(a))) {
      const c = this.h[a - 1];
      this.h[a - 1] = this.h[a];
      this.h[a] = c;
    }
    return b;
  };
  var na = { memory: { charset: "latin:extra", D: 3, B: 4, m: false }, performance: { D: 3, B: 3, s: false, context: { depth: 2, D: 1 } }, match: { charset: "latin:extra", G: "reverse" }, score: { charset: "latin:advanced", D: 20, B: 3, context: { depth: 3, D: 9 } }, "default": {} };
  function oa(a, b, c, d, e, f, h, g) {
    setTimeout(function() {
      const k = a(c ? c + "." + d : d, JSON.stringify(h));
      k && k.then ? k.then(function() {
        b.export(a, b, c, e, f + 1, g);
      }) : b.export(a, b, c, e, f + 1, g);
    });
  }
  function N(a, b) {
    if (!(this instanceof N)) return new N(a);
    var c;
    if (a) {
      C(a) ? a = na[a] : (c = a.preset) && (a = Object.assign({}, c[c], a));
      c = a.charset;
      var d = a.lang;
      C(c) && (-1 === c.indexOf(":") && (c += ":default"), c = K[c]);
      C(d) && (d = ha[d]);
    } else a = {};
    let e, f, h = a.context || {};
    this.encode = a.encode || c && c.encode || ea;
    this.register = b || x();
    this.D = e = a.resolution || 9;
    this.G = b = c && c.G || a.tokenize || "strict";
    this.depth = "strict" === b && h.depth;
    this.l = u(h.bidirectional);
    this.s = f = u(a.optimize);
    this.m = u(a.fastupdate);
    this.B = a.minlength || 1;
    this.C = a.boost;
    this.map = f ? v(e) : x();
    this.A = e = h.resolution || 1;
    this.h = f ? v(e) : x();
    this.F = c && c.F || a.rtl;
    this.H = (b = a.matcher || d && d.H) && I(b, false);
    this.J = (b = a.stemmer || d && d.J) && I(b, true);
    if (c = b = a.filter || d && d.filter) {
      c = b;
      d = x();
      for (let g = 0, k = c.length; g < k; g++) d[c[g]] = 1;
      c = d;
    }
    this.filter = c;
    this.cache = (b = a.cache) && new M(b);
  }
  t = N.prototype;
  t.append = function(a, b) {
    return this.add(a, b, true);
  };
  t.add = function(a, b, c, d) {
    if (b && (a || 0 === a)) {
      if (!d && !c && this.register[a]) return this.update(a, b);
      b = this.encode(b);
      if (d = b.length) {
        const m = x(), n = x(), w = this.depth, q = this.D;
        for (let r = 0; r < d; r++) {
          let l = b[this.F ? d - 1 - r : r];
          var e = l.length;
          if (l && e >= this.B && (w || !n[l])) {
            var f = O(q, d, r), h = "";
            switch (this.G) {
              case "full":
                if (2 < e) {
                  for (f = 0; f < e; f++) for (var g = e; g > f; g--) if (g - f >= this.B) {
                    var k = O(q, d, r, e, f);
                    h = l.substring(f, g);
                    P(this, n, h, k, a, c);
                  }
                  break;
                }
              case "reverse":
                if (1 < e) {
                  for (g = e - 1; 0 < g; g--) h = l[g] + h, h.length >= this.B && P(
                    this,
                    n,
                    h,
                    O(q, d, r, e, g),
                    a,
                    c
                  );
                  h = "";
                }
              case "forward":
                if (1 < e) {
                  for (g = 0; g < e; g++) h += l[g], h.length >= this.B && P(this, n, h, f, a, c);
                  break;
                }
              default:
                if (this.C && (f = Math.min(f / this.C(b, l, r) | 0, q - 1)), P(this, n, l, f, a, c), w && 1 < d && r < d - 1) {
                  for (e = x(), h = this.A, f = l, g = Math.min(w + 1, d - r), e[f] = 1, k = 1; k < g; k++) if ((l = b[this.F ? d - 1 - r - k : r + k]) && l.length >= this.B && !e[l]) {
                    e[l] = 1;
                    const p = this.l && l > f;
                    P(this, m, p ? f : l, O(h + (d / 2 > h ? 0 : 1), d, r, g - 1, k - 1), a, c, p ? l : f);
                  }
                }
            }
          }
        }
        this.m || (this.register[a] = 1);
      }
    }
    return this;
  };
  function O(a, b, c, d, e) {
    return c && 1 < a ? b + (d || 0) <= a ? c + (e || 0) : (a - 1) / (b + (d || 0)) * (c + (e || 0)) + 1 | 0 : 0;
  }
  function P(a, b, c, d, e, f, h) {
    let g = h ? a.h : a.map;
    if (!b[c] || h && !b[c][h]) a.s && (g = g[d]), h ? (b = b[c] || (b[c] = x()), b[h] = 1, g = g[h] || (g[h] = x())) : b[c] = 1, g = g[c] || (g[c] = []), a.s || (g = g[d] || (g[d] = [])), f && g.includes(e) || (g[g.length] = e, a.m && (a = a.register[e] || (a.register[e] = []), a[a.length] = g));
  }
  t.search = function(a, b, c) {
    c || (!b && D(a) ? (c = a, a = c.query) : D(b) && (c = b));
    let d = [], e;
    let f, h = 0;
    if (c) {
      a = c.query || a;
      b = c.limit;
      h = c.offset || 0;
      var g = c.context;
      f = c.suggest;
    }
    if (a && (a = this.encode("" + a), e = a.length, 1 < e)) {
      c = x();
      var k = [];
      for (let n = 0, w = 0, q; n < e; n++) if ((q = a[n]) && q.length >= this.B && !c[q]) if (this.s || f || this.map[q]) k[w++] = q, c[q] = 1;
      else return d;
      a = k;
      e = a.length;
    }
    if (!e) return d;
    b || (b = 100);
    g = this.depth && 1 < e && false !== g;
    c = 0;
    let m;
    g ? (m = a[0], c = 1) : 1 < e && a.sort(aa);
    for (let n, w; c < e; c++) {
      w = a[c];
      g ? (n = pa(
        this,
        d,
        f,
        b,
        h,
        2 === e,
        w,
        m
      ), f && false === n && d.length || (m = w)) : n = pa(this, d, f, b, h, 1 === e, w);
      if (n) return n;
      if (f && c === e - 1) {
        k = d.length;
        if (!k) {
          if (g) {
            g = 0;
            c = -1;
            continue;
          }
          return d;
        }
        if (1 === k) return qa(d[0], b, h);
      }
    }
    return ja(d, b, h, f);
  };
  function pa(a, b, c, d, e, f, h, g) {
    let k = [], m = g ? a.h : a.map;
    a.s || (m = ra(m, h, g, a.l));
    if (m) {
      let n = 0;
      const w = Math.min(m.length, g ? a.A : a.D);
      for (let q = 0, r = 0, l, p; q < w; q++) if (l = m[q]) {
        if (a.s && (l = ra(l, h, g, a.l)), e && l && f && (p = l.length, p <= e ? (e -= p, l = null) : (l = l.slice(e), e = 0)), l && (k[n++] = l, f && (r += l.length, r >= d))) break;
      }
      if (n) {
        if (f) return qa(k, d, 0);
        b[b.length] = k;
        return;
      }
    }
    return !c && k;
  }
  function qa(a, b, c) {
    a = 1 === a.length ? a[0] : [].concat.apply([], a);
    return c || a.length > b ? a.slice(c, c + b) : a;
  }
  function ra(a, b, c, d) {
    c ? (d = d && b > c, a = (a = a[d ? b : c]) && a[d ? c : b]) : a = a[b];
    return a;
  }
  t.contain = function(a) {
    return !!this.register[a];
  };
  t.update = function(a, b) {
    return this.remove(a).add(a, b);
  };
  t.remove = function(a, b) {
    const c = this.register[a];
    if (c) {
      if (this.m) for (let d = 0, e; d < c.length; d++) e = c[d], e.splice(e.indexOf(a), 1);
      else Q(this.map, a, this.D, this.s), this.depth && Q(this.h, a, this.A, this.s);
      b || delete this.register[a];
      if (this.cache) {
        b = this.cache;
        for (let d = 0, e, f; d < b.h.length; d++) f = b.h[d], e = b.cache[f], e.includes(a) && (b.h.splice(d--, 1), delete b.cache[f]);
      }
    }
    return this;
  };
  function Q(a, b, c, d, e) {
    let f = 0;
    if (a.constructor === Array) if (e) b = a.indexOf(b), -1 !== b ? 1 < a.length && (a.splice(b, 1), f++) : f++;
    else {
      e = Math.min(a.length, c);
      for (let h = 0, g; h < e; h++) if (g = a[h]) f = Q(g, b, c, d, e), d || f || delete a[h];
    }
    else for (let h in a) (f = Q(a[h], b, c, d, e)) || delete a[h];
    return f;
  }
  t.searchCache = la;
  t.export = function(a, b, c, d, e, f) {
    let h = true;
    "undefined" === typeof f && (h = new Promise((m) => {
      f = m;
    }));
    let g, k;
    switch (e || (e = 0)) {
      case 0:
        g = "reg";
        if (this.m) {
          k = x();
          for (let m in this.register) k[m] = 1;
        } else k = this.register;
        break;
      case 1:
        g = "cfg";
        k = { doc: 0, opt: this.s ? 1 : 0 };
        break;
      case 2:
        g = "map";
        k = this.map;
        break;
      case 3:
        g = "ctx";
        k = this.h;
        break;
      default:
        "undefined" === typeof c && f && f();
        return;
    }
    oa(a, b || this, c, g, d, e, k, f);
    return h;
  };
  t.import = function(a, b) {
    if (b) switch (C(b) && (b = JSON.parse(b)), a) {
      case "cfg":
        this.s = !!b.opt;
        break;
      case "reg":
        this.m = false;
        this.register = b;
        break;
      case "map":
        this.map = b;
        break;
      case "ctx":
        this.h = b;
    }
  };
  ia(N.prototype);
  function sa(a) {
    a = a.data;
    var b = self._index;
    const c = a.args;
    var d = a.task;
    switch (d) {
      case "init":
        d = a.options || {};
        a = a.factory;
        b = d.encode;
        d.cache = false;
        b && 0 === b.indexOf("function") && (d.encode = Function("return " + b)());
        a ? (Function("return " + a)()(self), self._index = new self.FlexSearch.Index(d), delete self.FlexSearch) : self._index = new N(d);
        break;
      default:
        a = a.id, b = b[d].apply(b, c), postMessage("search" === d ? { id: a, msg: b } : { id: a });
    }
  }
  var ta = 0;
  function S(a) {
    if (!(this instanceof S)) return new S(a);
    var b;
    a ? E(b = a.encode) && (a.encode = b.toString()) : a = {};
    (b = (self || window)._factory) && (b = b.toString());
    const c = "undefined" === typeof window && self.exports, d = this;
    this.o = ua(b, c, a.worker);
    this.h = x();
    if (this.o) {
      if (c) this.o.on("message", function(e) {
        d.h[e.id](e.msg);
        delete d.h[e.id];
      });
      else this.o.onmessage = function(e) {
        e = e.data;
        d.h[e.id](e.msg);
        delete d.h[e.id];
      };
      this.o.postMessage({ task: "init", factory: b, options: a });
    }
  }
  T("add");
  T("append");
  T("search");
  T("update");
  T("remove");
  function T(a) {
    S.prototype[a] = S.prototype[a + "Async"] = function() {
      const b = this, c = [].slice.call(arguments);
      var d = c[c.length - 1];
      let e;
      E(d) && (e = d, c.splice(c.length - 1, 1));
      d = new Promise(function(f) {
        setTimeout(function() {
          b.h[++ta] = f;
          b.o.postMessage({ task: a, id: ta, args: c });
        });
      });
      return e ? (d.then(e), this) : d;
    };
  }
  function ua(a, b, c) {
    let d;
    try {
      d = b ? new (require_worker_threads())["Worker"](__dirname + "/node/node.js") : a ? new Worker(URL.createObjectURL(new Blob(["onmessage=" + sa.toString()], { type: "text/javascript" }))) : new Worker(C(c) ? c : "worker/worker.js", { type: "module" });
    } catch (e) {
    }
    return d;
  }
  function U(a) {
    if (!(this instanceof U)) return new U(a);
    var b = a.document || a.doc || a, c;
    this.K = [];
    this.h = [];
    this.A = [];
    this.register = x();
    this.key = (c = b.key || b.id) && V(c, this.A) || "id";
    this.m = u(a.fastupdate);
    this.C = (c = b.store) && true !== c && [];
    this.store = c && x();
    this.I = (c = b.tag) && V(c, this.A);
    this.l = c && x();
    this.cache = (c = a.cache) && new M(c);
    a.cache = false;
    this.o = a.worker;
    this.async = false;
    c = x();
    let d = b.index || b.field || b;
    C(d) && (d = [d]);
    for (let e = 0, f, h; e < d.length; e++) f = d[e], C(f) || (h = f, f = f.field), h = D(h) ? Object.assign({}, a, h) : a, this.o && (c[f] = new S(h), c[f].o || (this.o = false)), this.o || (c[f] = new N(h, this.register)), this.K[e] = V(f, this.A), this.h[e] = f;
    if (this.C) for (a = b.store, C(a) && (a = [a]), b = 0; b < a.length; b++) this.C[b] = V(a[b], this.A);
    this.index = c;
  }
  function V(a, b) {
    const c = a.split(":");
    let d = 0;
    for (let e = 0; e < c.length; e++) a = c[e], 0 <= a.indexOf("[]") && (a = a.substring(0, a.length - 2)) && (b[d] = true), a && (c[d++] = a);
    d < c.length && (c.length = d);
    return 1 < d ? c : c[0];
  }
  function X(a, b) {
    if (C(b)) a = a[b];
    else for (let c = 0; a && c < b.length; c++) a = a[b[c]];
    return a;
  }
  function Y(a, b, c, d, e) {
    a = a[e];
    if (d === c.length - 1) b[e] = a;
    else if (a) if (a.constructor === Array) for (b = b[e] = Array(a.length), e = 0; e < a.length; e++) Y(a, b, c, d, e);
    else b = b[e] || (b[e] = x()), e = c[++d], Y(a, b, c, d, e);
  }
  function Z(a, b, c, d, e, f, h, g) {
    if (a = a[h]) if (d === b.length - 1) {
      if (a.constructor === Array) {
        if (c[d]) {
          for (b = 0; b < a.length; b++) e.add(f, a[b], true, true);
          return;
        }
        a = a.join(" ");
      }
      e.add(f, a, g, true);
    } else if (a.constructor === Array) for (h = 0; h < a.length; h++) Z(a, b, c, d, e, f, h, g);
    else h = b[++d], Z(a, b, c, d, e, f, h, g);
  }
  t = U.prototype;
  t.add = function(a, b, c) {
    D(a) && (b = a, a = X(b, this.key));
    if (b && (a || 0 === a)) {
      if (!c && this.register[a]) return this.update(a, b);
      for (let d = 0, e, f; d < this.h.length; d++) f = this.h[d], e = this.K[d], C(e) && (e = [e]), Z(b, e, this.A, 0, this.index[f], a, e[0], c);
      if (this.I) {
        let d = X(b, this.I), e = x();
        C(d) && (d = [d]);
        for (let f = 0, h, g; f < d.length; f++) if (h = d[f], !e[h] && (e[h] = 1, g = this.l[h] || (this.l[h] = []), !c || !g.includes(a))) {
          if (g[g.length] = a, this.m) {
            const k = this.register[a] || (this.register[a] = []);
            k[k.length] = g;
          }
        }
      }
      if (this.store && (!c || !this.store[a])) {
        let d;
        if (this.C) {
          d = x();
          for (let e = 0, f; e < this.C.length; e++) f = this.C[e], C(f) ? d[f] = b[f] : Y(b, d, f, 0, f[0]);
        }
        this.store[a] = d || b;
      }
    }
    return this;
  };
  t.append = function(a, b) {
    return this.add(a, b, true);
  };
  t.update = function(a, b) {
    return this.remove(a).add(a, b);
  };
  t.remove = function(a) {
    D(a) && (a = X(a, this.key));
    if (this.register[a]) {
      for (var b = 0; b < this.h.length && (this.index[this.h[b]].remove(a, !this.o), !this.m); b++) ;
      if (this.I && !this.m) for (let c in this.l) {
        b = this.l[c];
        const d = b.indexOf(a);
        -1 !== d && (1 < b.length ? b.splice(d, 1) : delete this.l[c]);
      }
      this.store && delete this.store[a];
      delete this.register[a];
    }
    return this;
  };
  t.search = function(a, b, c, d) {
    c || (!b && D(a) ? (c = a, a = "") : D(b) && (c = b, b = 0));
    let e = [], f = [], h, g, k, m, n, w, q = 0;
    if (c) if (c.constructor === Array) k = c, c = null;
    else {
      a = c.query || a;
      k = (h = c.pluck) || c.index || c.field;
      m = c.tag;
      g = this.store && c.enrich;
      n = "and" === c.bool;
      b = c.limit || b || 100;
      w = c.offset || 0;
      if (m && (C(m) && (m = [m]), !a)) {
        for (let l = 0, p; l < m.length; l++) if (p = va.call(this, m[l], b, w, g)) e[e.length] = p, q++;
        return q ? e : [];
      }
      C(k) && (k = [k]);
    }
    k || (k = this.h);
    n = n && (1 < k.length || m && 1 < m.length);
    const r = !d && (this.o || this.async) && [];
    for (let l = 0, p, A, B; l < k.length; l++) {
      let z;
      A = k[l];
      C(A) || (z = A, A = z.field, a = z.query || a, b = z.limit || b, g = z.enrich || g);
      if (r) r[l] = this.index[A].searchAsync(a, b, z || c);
      else {
        d ? p = d[l] : p = this.index[A].search(a, b, z || c);
        B = p && p.length;
        if (m && B) {
          const y = [];
          let H = 0;
          n && (y[0] = [p]);
          for (let W = 0, ma, R; W < m.length; W++) if (ma = m[W], B = (R = this.l[ma]) && R.length) H++, y[y.length] = n ? [R] : R;
          H && (p = n ? ja(y, b || 100, w || 0) : ka(p, y), B = p.length);
        }
        if (B) f[q] = A, e[q++] = p;
        else if (n) return [];
      }
    }
    if (r) {
      const l = this;
      return new Promise(function(p) {
        Promise.all(r).then(function(A) {
          p(l.search(
            a,
            b,
            c,
            A
          ));
        });
      });
    }
    if (!q) return [];
    if (h && (!g || !this.store)) return e[0];
    for (let l = 0, p; l < f.length; l++) {
      p = e[l];
      p.length && g && (p = wa.call(this, p));
      if (h) return p;
      e[l] = { field: f[l], result: p };
    }
    return e;
  };
  function va(a, b, c, d) {
    let e = this.l[a], f = e && e.length - c;
    if (f && 0 < f) {
      if (f > b || c) e = e.slice(c, c + b);
      d && (e = wa.call(this, e));
      return { tag: a, result: e };
    }
  }
  function wa(a) {
    const b = Array(a.length);
    for (let c = 0, d; c < a.length; c++) d = a[c], b[c] = { id: d, doc: this.store[d] };
    return b;
  }
  t.contain = function(a) {
    return !!this.register[a];
  };
  t.get = function(a) {
    return this.store[a];
  };
  t.set = function(a, b) {
    this.store[a] = b;
    return this;
  };
  t.searchCache = la;
  t.export = function(a, b, c, d, e, f) {
    let h;
    "undefined" === typeof f && (h = new Promise((g) => {
      f = g;
    }));
    e || (e = 0);
    d || (d = 0);
    if (d < this.h.length) {
      const g = this.h[d], k = this.index[g];
      b = this;
      setTimeout(function() {
        k.export(a, b, e ? g : "", d, e++, f) || (d++, e = 1, b.export(a, b, g, d, e, f));
      });
    } else {
      let g, k;
      switch (e) {
        case 1:
          g = "tag";
          k = this.l;
          c = null;
          break;
        case 2:
          g = "store";
          k = this.store;
          c = null;
          break;
        default:
          f();
          return;
      }
      oa(a, this, c, g, d, e, k, f);
    }
    return h;
  };
  t.import = function(a, b) {
    if (b) switch (C(b) && (b = JSON.parse(b)), a) {
      case "tag":
        this.l = b;
        break;
      case "reg":
        this.m = false;
        this.register = b;
        for (let d = 0, e; d < this.h.length; d++) e = this.index[this.h[d]], e.register = b, e.m = false;
        break;
      case "store":
        this.store = b;
        break;
      default:
        a = a.split(".");
        const c = a[0];
        a = a[1];
        c && a && this.index[c].import(a, b);
    }
  };
  ia(U.prototype);
  var ya = { encode: xa, F: false, G: "" };
  var za = [J("[\xE0\xE1\xE2\xE3\xE4\xE5]"), "a", J("[\xE8\xE9\xEA\xEB]"), "e", J("[\xEC\xED\xEE\xEF]"), "i", J("[\xF2\xF3\xF4\xF5\xF6\u0151]"), "o", J("[\xF9\xFA\xFB\xFC\u0171]"), "u", J("[\xFD\u0177\xFF]"), "y", J("\xF1"), "n", J("[\xE7c]"), "k", J("\xDF"), "s", J(" & "), " and "];
  function xa(a) {
    var b = a = "" + a;
    b.normalize && (b = b.normalize("NFD").replace(ca, ""));
    return F.call(this, b.toLowerCase(), !a.normalize && za);
  }
  var Ba = { encode: Aa, F: false, G: "strict" };
  var Ca = /[^a-z0-9]+/;
  var Da = { b: "p", v: "f", w: "f", z: "s", x: "s", "\xDF": "s", d: "t", n: "m", c: "k", g: "k", j: "k", q: "k", i: "e", y: "e", u: "o" };
  function Aa(a) {
    a = xa.call(this, a).join(" ");
    const b = [];
    if (a) {
      const c = a.split(Ca), d = c.length;
      for (let e = 0, f, h = 0; e < d; e++) if ((a = c[e]) && (!this.filter || !this.filter[a])) {
        f = a[0];
        let g = Da[f] || f, k = g;
        for (let m = 1; m < a.length; m++) {
          f = a[m];
          const n = Da[f] || f;
          n && n !== k && (g += n, k = n);
        }
        b[h++] = g;
      }
    }
    return b;
  }
  var Fa = { encode: Ea, F: false, G: "" };
  var Ga = [J("ae"), "a", J("oe"), "o", J("sh"), "s", J("th"), "t", J("ph"), "f", J("pf"), "f", J("(?![aeo])h(?![aeo])"), "", J("(?!^[aeo])h(?!^[aeo])"), ""];
  function Ea(a, b) {
    a && (a = Aa.call(this, a).join(" "), 2 < a.length && (a = G(a, Ga)), b || (1 < a.length && (a = da(a)), a && (a = a.split(" "))));
    return a || [];
  }
  var Ia = { encode: Ha, F: false, G: "" };
  var Ja = J("(?!\\b)[aeo]");
  function Ha(a) {
    a && (a = Ea.call(this, a, true), 1 < a.length && (a = a.replace(Ja, "")), 1 < a.length && (a = da(a)), a && (a = a.split(" ")));
    return a || [];
  }
  K["latin:default"] = fa;
  K["latin:simple"] = ya;
  K["latin:balance"] = Ba;
  K["latin:advanced"] = Fa;
  K["latin:extra"] = Ia;
  var flexsearch_bundle_module_min_default = { Index: N, Document: U, Worker: S, registerCharset: function(a, b) {
    K[a] = b;
  }, registerLanguage: function(a, b) {
    ha[a] = b;
  } };

  // <stdin>
  (function() {
    "use strict";
    const index = new flexsearch_bundle_module_min_default.Document({
      tokenize: "forward",
      document: {
        id: "id",
        index: [
          {
            field: "title"
          },
          {
            field: "tags"
          },
          {
            field: "content"
          },
          {
            field: "date",
            tokenize: "strict",
            encode: false
          }
        ],
        store: ["title", "summary", "date", "permalink"]
      }
    });
    function showResults(items) {
      const template = document.querySelector("template").content;
      const fragment = document.createDocumentFragment();
      const results = document.querySelector(".search-results");
      results.textContent = "";
      const itemsLength = Object.keys(items).length;
      if (itemsLength === 0 && query.value === "") {
        document.querySelector(".search-no-results").classList.add("d-none");
        document.querySelector(".search-no-recent").classList.remove("d-none");
      } else if (itemsLength === 0 && query.value !== "") {
        document.querySelector(".search-no-recent").classList.add("d-none");
        const queryNoResults = document.querySelector(".query-no-results");
        queryNoResults.innerText = query.value;
        document.querySelector(".search-no-results").classList.remove("d-none");
      } else {
        document.querySelector(".search-no-recent").classList.add("d-none");
        document.querySelector(".search-no-results").classList.add("d-none");
      }
      for (const id in items) {
        const item = items[id];
        const result = template.cloneNode(true);
        const a = result.querySelector("a");
        const time = result.querySelector("time");
        const content = result.querySelector(".content");
        a.innerHTML = item.title;
        a.href = item.permalink;
        time.innerText = item.date;
        content.innerHTML = item.summary;
        fragment.appendChild(result);
      }
      results.appendChild(fragment);
    }
    function doSearch() {
      const query2 = document.querySelector(".search-text").value.trim();
      const limit = 99;
      const results = index.search({
        query: query2,
        enrich: true,
        limit
      });
      const items = {};
      results.forEach(function(result) {
        result.result.forEach(function(r) {
          items[r.id] = r.doc;
        });
      });
      showResults(items);
    }
    function enableUI() {
      const searchform = document.querySelector(".search-form");
      searchform.addEventListener("submit", function(e) {
        e.preventDefault();
        doSearch();
      });
      searchform.addEventListener("input", function() {
        doSearch();
      });
      document.querySelector(".search-loading").classList.add("d-none");
      document.querySelector(".search-input").classList.remove("d-none");
      document.querySelector(".search-text").focus();
    }
    function buildIndex() {
      document.querySelector(".search-loading").classList.remove("d-none");
      fetch("/search-index.json").then(function(response) {
        return response.json();
      }).then(function(data) {
        data.forEach(function(item) {
          index.add(item);
        });
      });
    }
    buildIndex();
    enableUI();
  })();
})();
/*!
 * FlexSearch for Bootstrap based Thulite sites
 * Copyright 2021-2024 Thulite
 * Licensed under the MIT License
 * Based on https://github.com/frjo/hugo-theme-zen/blob/main/assets/js/search.js
 */
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL2ZsZXhzZWFyY2gvZGlzdC9mbGV4c2VhcmNoLmJ1bmRsZS5tb2R1bGUubWluLmpzIiwgIjxzdGRpbj4iXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKiFcclxuICogRmxleFNlYXJjaC5qcyB2MC43LjQxIChCdW5kbGUubW9kdWxlKVxyXG4gKiBBdXRob3IgYW5kIENvcHlyaWdodDogVGhvbWFzIFdpbGtlcmxpbmdcclxuICogTGljZW5jZTogQXBhY2hlLTIuMFxyXG4gKiBIb3N0ZWQgYnkgTmV4dGFwcHMgR21iSFxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vbmV4dGFwcHMtZGUvZmxleHNlYXJjaFxyXG4gKi9cbnZhciB0O2Z1bmN0aW9uIHUoYSl7cmV0dXJuXCJ1bmRlZmluZWRcIiE9PXR5cGVvZiBhP2E6ITB9ZnVuY3Rpb24gdihhKXtjb25zdCBiPUFycmF5KGEpO2ZvcihsZXQgYz0wO2M8YTtjKyspYltjXT14KCk7cmV0dXJuIGJ9ZnVuY3Rpb24geCgpe3JldHVybiBPYmplY3QuY3JlYXRlKG51bGwpfWZ1bmN0aW9uIGFhKGEsYil7cmV0dXJuIGIubGVuZ3RoLWEubGVuZ3RofWZ1bmN0aW9uIEMoYSl7cmV0dXJuXCJzdHJpbmdcIj09PXR5cGVvZiBhfWZ1bmN0aW9uIEQoYSl7cmV0dXJuXCJvYmplY3RcIj09PXR5cGVvZiBhfWZ1bmN0aW9uIEUoYSl7cmV0dXJuXCJmdW5jdGlvblwiPT09dHlwZW9mIGF9O2Z1bmN0aW9uIEYoYSxiKXt2YXIgYz1iYTtpZihhJiYoYiYmKGE9RyhhLGIpKSx0aGlzLkgmJihhPUcoYSx0aGlzLkgpKSx0aGlzLkomJjE8YS5sZW5ndGgmJihhPUcoYSx0aGlzLkopKSxjfHxcIlwiPT09Yykpe2I9YS5zcGxpdChjKTtpZih0aGlzLmZpbHRlcil7YT10aGlzLmZpbHRlcjtjPWIubGVuZ3RoO2NvbnN0IGQ9W107Zm9yKGxldCBlPTAsZj0wO2U8YztlKyspe2NvbnN0IGg9YltlXTtoJiYhYVtoXSYmKGRbZisrXT1oKX1hPWR9ZWxzZSBhPWI7cmV0dXJuIGF9cmV0dXJuIGF9Y29uc3QgYmE9L1tcXHB7Wn1cXHB7U31cXHB7UH1cXHB7Q31dKy91LGNhPS9bXFx1MDMwMC1cXHUwMzZmXS9nO1xuZnVuY3Rpb24gSShhLGIpe2NvbnN0IGM9T2JqZWN0LmtleXMoYSksZD1jLmxlbmd0aCxlPVtdO2xldCBmPVwiXCIsaD0wO2ZvcihsZXQgZz0wLGssbTtnPGQ7ZysrKWs9Y1tnXSwobT1hW2tdKT8oZVtoKytdPUooYj9cIig/IVxcXFxiKVwiK2srXCIoXFxcXGJ8XylcIjprKSxlW2grK109bSk6Zis9KGY/XCJ8XCI6XCJcIikraztmJiYoZVtoKytdPUooYj9cIig/IVxcXFxiKShcIitmK1wiKShcXFxcYnxfKVwiOlwiKFwiK2YrXCIpXCIpLGVbaF09XCJcIik7cmV0dXJuIGV9ZnVuY3Rpb24gRyhhLGIpe2ZvcihsZXQgYz0wLGQ9Yi5sZW5ndGg7YzxkJiYoYT1hLnJlcGxhY2UoYltjXSxiW2MrMV0pLGEpO2MrPTIpO3JldHVybiBhfWZ1bmN0aW9uIEooYSl7cmV0dXJuIG5ldyBSZWdFeHAoYSxcImdcIil9ZnVuY3Rpb24gZGEoYSl7bGV0IGI9XCJcIixjPVwiXCI7Zm9yKGxldCBkPTAsZT1hLmxlbmd0aCxmO2Q8ZTtkKyspKGY9YVtkXSkhPT1jJiYoYis9Yz1mKTtyZXR1cm4gYn07dmFyIGZhPXtlbmNvZGU6ZWEsRjohMSxHOlwiXCJ9O2Z1bmN0aW9uIGVhKGEpe3JldHVybiBGLmNhbGwodGhpcywoXCJcIithKS50b0xvd2VyQ2FzZSgpLCExKX07Y29uc3QgaGE9e30sSz17fTtmdW5jdGlvbiBpYShhKXtMKGEsXCJhZGRcIik7TChhLFwiYXBwZW5kXCIpO0woYSxcInNlYXJjaFwiKTtMKGEsXCJ1cGRhdGVcIik7TChhLFwicmVtb3ZlXCIpfWZ1bmN0aW9uIEwoYSxiKXthW2IrXCJBc3luY1wiXT1mdW5jdGlvbigpe2NvbnN0IGM9dGhpcyxkPWFyZ3VtZW50czt2YXIgZT1kW2QubGVuZ3RoLTFdO2xldCBmO0UoZSkmJihmPWUsZGVsZXRlIGRbZC5sZW5ndGgtMV0pO2U9bmV3IFByb21pc2UoZnVuY3Rpb24oaCl7c2V0VGltZW91dChmdW5jdGlvbigpe2MuYXN5bmM9ITA7Y29uc3QgZz1jW2JdLmFwcGx5KGMsZCk7Yy5hc3luYz0hMTtoKGcpfSl9KTtyZXR1cm4gZj8oZS50aGVuKGYpLHRoaXMpOmV9fTtmdW5jdGlvbiBqYShhLGIsYyxkKXtjb25zdCBlPWEubGVuZ3RoO2xldCBmPVtdLGgsZyxrPTA7ZCYmKGQ9W10pO2ZvcihsZXQgbT1lLTE7MDw9bTttLS0pe2NvbnN0IG49YVttXSx3PW4ubGVuZ3RoLHE9eCgpO2xldCByPSFoO2ZvcihsZXQgbD0wO2w8dztsKyspe2NvbnN0IHA9bltsXSxBPXAubGVuZ3RoO2lmKEEpZm9yKGxldCBCPTAseix5O0I8QTtCKyspaWYoeT1wW0JdLGgpe2lmKGhbeV0pe2lmKCFtKWlmKGMpYy0tO2Vsc2UgaWYoZltrKytdPXksaz09PWIpcmV0dXJuIGY7aWYobXx8ZClxW3ldPTE7cj0hMH1pZihkJiYoej0oZ1t5XXx8MCkrMSxnW3ldPXosejxlKSl7Y29uc3QgSD1kW3otMl18fChkW3otMl09W10pO0hbSC5sZW5ndGhdPXl9fWVsc2UgcVt5XT0xfWlmKGQpaHx8KGc9cSk7ZWxzZSBpZighcilyZXR1cm5bXTtoPXF9aWYoZClmb3IobGV0IG09ZC5sZW5ndGgtMSxuLHc7MDw9bTttLS0pe249ZFttXTt3PW4ubGVuZ3RoO2ZvcihsZXQgcT0wLHI7cTx3O3ErKylpZihyPVxubltxXSwhaFtyXSl7aWYoYyljLS07ZWxzZSBpZihmW2srK109cixrPT09YilyZXR1cm4gZjtoW3JdPTF9fXJldHVybiBmfWZ1bmN0aW9uIGthKGEsYil7Y29uc3QgYz14KCksZD14KCksZT1bXTtmb3IobGV0IGY9MDtmPGEubGVuZ3RoO2YrKyljW2FbZl1dPTE7Zm9yKGxldCBmPTAsaDtmPGIubGVuZ3RoO2YrKyl7aD1iW2ZdO2ZvcihsZXQgZz0wLGs7ZzxoLmxlbmd0aDtnKyspaz1oW2ddLGNba10mJiFkW2tdJiYoZFtrXT0xLGVbZS5sZW5ndGhdPWspfXJldHVybiBlfTtmdW5jdGlvbiBNKGEpe3RoaXMubD0hMCE9PWEmJmE7dGhpcy5jYWNoZT14KCk7dGhpcy5oPVtdfWZ1bmN0aW9uIGxhKGEsYixjKXtEKGEpJiYoYT1hLnF1ZXJ5KTtsZXQgZD10aGlzLmNhY2hlLmdldChhKTtkfHwoZD10aGlzLnNlYXJjaChhLGIsYyksdGhpcy5jYWNoZS5zZXQoYSxkKSk7cmV0dXJuIGR9TS5wcm90b3R5cGUuc2V0PWZ1bmN0aW9uKGEsYil7aWYoIXRoaXMuY2FjaGVbYV0pe3ZhciBjPXRoaXMuaC5sZW5ndGg7Yz09PXRoaXMubD9kZWxldGUgdGhpcy5jYWNoZVt0aGlzLmhbYy0xXV06YysrO2ZvcigtLWM7MDxjO2MtLSl0aGlzLmhbY109dGhpcy5oW2MtMV07dGhpcy5oWzBdPWF9dGhpcy5jYWNoZVthXT1ifTtNLnByb3RvdHlwZS5nZXQ9ZnVuY3Rpb24oYSl7Y29uc3QgYj10aGlzLmNhY2hlW2FdO2lmKHRoaXMubCYmYiYmKGE9dGhpcy5oLmluZGV4T2YoYSkpKXtjb25zdCBjPXRoaXMuaFthLTFdO3RoaXMuaFthLTFdPXRoaXMuaFthXTt0aGlzLmhbYV09Y31yZXR1cm4gYn07Y29uc3QgbmE9e21lbW9yeTp7Y2hhcnNldDpcImxhdGluOmV4dHJhXCIsRDozLEI6NCxtOiExfSxwZXJmb3JtYW5jZTp7RDozLEI6MyxzOiExLGNvbnRleHQ6e2RlcHRoOjIsRDoxfX0sbWF0Y2g6e2NoYXJzZXQ6XCJsYXRpbjpleHRyYVwiLEc6XCJyZXZlcnNlXCJ9LHNjb3JlOntjaGFyc2V0OlwibGF0aW46YWR2YW5jZWRcIixEOjIwLEI6Myxjb250ZXh0OntkZXB0aDozLEQ6OX19LFwiZGVmYXVsdFwiOnt9fTtmdW5jdGlvbiBvYShhLGIsYyxkLGUsZixoLGcpe3NldFRpbWVvdXQoZnVuY3Rpb24oKXtjb25zdCBrPWEoYz9jK1wiLlwiK2Q6ZCxKU09OLnN0cmluZ2lmeShoKSk7ayYmay50aGVuP2sudGhlbihmdW5jdGlvbigpe2IuZXhwb3J0KGEsYixjLGUsZisxLGcpfSk6Yi5leHBvcnQoYSxiLGMsZSxmKzEsZyl9KX07ZnVuY3Rpb24gTihhLGIpe2lmKCEodGhpcyBpbnN0YW5jZW9mIE4pKXJldHVybiBuZXcgTihhKTt2YXIgYztpZihhKXtDKGEpP2E9bmFbYV06KGM9YS5wcmVzZXQpJiYoYT1PYmplY3QuYXNzaWduKHt9LGNbY10sYSkpO2M9YS5jaGFyc2V0O3ZhciBkPWEubGFuZztDKGMpJiYoLTE9PT1jLmluZGV4T2YoXCI6XCIpJiYoYys9XCI6ZGVmYXVsdFwiKSxjPUtbY10pO0MoZCkmJihkPWhhW2RdKX1lbHNlIGE9e307bGV0IGUsZixoPWEuY29udGV4dHx8e307dGhpcy5lbmNvZGU9YS5lbmNvZGV8fGMmJmMuZW5jb2RlfHxlYTt0aGlzLnJlZ2lzdGVyPWJ8fHgoKTt0aGlzLkQ9ZT1hLnJlc29sdXRpb258fDk7dGhpcy5HPWI9YyYmYy5HfHxhLnRva2VuaXplfHxcInN0cmljdFwiO3RoaXMuZGVwdGg9XCJzdHJpY3RcIj09PWImJmguZGVwdGg7dGhpcy5sPXUoaC5iaWRpcmVjdGlvbmFsKTt0aGlzLnM9Zj11KGEub3B0aW1pemUpO3RoaXMubT11KGEuZmFzdHVwZGF0ZSk7dGhpcy5CPWEubWlubGVuZ3RofHwxO3RoaXMuQz1cbmEuYm9vc3Q7dGhpcy5tYXA9Zj92KGUpOngoKTt0aGlzLkE9ZT1oLnJlc29sdXRpb258fDE7dGhpcy5oPWY/dihlKTp4KCk7dGhpcy5GPWMmJmMuRnx8YS5ydGw7dGhpcy5IPShiPWEubWF0Y2hlcnx8ZCYmZC5IKSYmSShiLCExKTt0aGlzLko9KGI9YS5zdGVtbWVyfHxkJiZkLkopJiZJKGIsITApO2lmKGM9Yj1hLmZpbHRlcnx8ZCYmZC5maWx0ZXIpe2M9YjtkPXgoKTtmb3IobGV0IGc9MCxrPWMubGVuZ3RoO2c8aztnKyspZFtjW2ddXT0xO2M9ZH10aGlzLmZpbHRlcj1jO3RoaXMuY2FjaGU9KGI9YS5jYWNoZSkmJm5ldyBNKGIpfXQ9Ti5wcm90b3R5cGU7dC5hcHBlbmQ9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gdGhpcy5hZGQoYSxiLCEwKX07XG50LmFkZD1mdW5jdGlvbihhLGIsYyxkKXtpZihiJiYoYXx8MD09PWEpKXtpZighZCYmIWMmJnRoaXMucmVnaXN0ZXJbYV0pcmV0dXJuIHRoaXMudXBkYXRlKGEsYik7Yj10aGlzLmVuY29kZShiKTtpZihkPWIubGVuZ3RoKXtjb25zdCBtPXgoKSxuPXgoKSx3PXRoaXMuZGVwdGgscT10aGlzLkQ7Zm9yKGxldCByPTA7cjxkO3IrKyl7bGV0IGw9Ylt0aGlzLkY/ZC0xLXI6cl07dmFyIGU9bC5sZW5ndGg7aWYobCYmZT49dGhpcy5CJiYod3x8IW5bbF0pKXt2YXIgZj1PKHEsZCxyKSxoPVwiXCI7c3dpdGNoKHRoaXMuRyl7Y2FzZSBcImZ1bGxcIjppZigyPGUpe2ZvcihmPTA7ZjxlO2YrKylmb3IodmFyIGc9ZTtnPmY7Zy0tKWlmKGctZj49dGhpcy5CKXt2YXIgaz1PKHEsZCxyLGUsZik7aD1sLnN1YnN0cmluZyhmLGcpO1AodGhpcyxuLGgsayxhLGMpfWJyZWFrfWNhc2UgXCJyZXZlcnNlXCI6aWYoMTxlKXtmb3IoZz1lLTE7MDxnO2ctLSloPWxbZ10raCxoLmxlbmd0aD49dGhpcy5CJiZQKHRoaXMsbixcbmgsTyhxLGQscixlLGcpLGEsYyk7aD1cIlwifWNhc2UgXCJmb3J3YXJkXCI6aWYoMTxlKXtmb3IoZz0wO2c8ZTtnKyspaCs9bFtnXSxoLmxlbmd0aD49dGhpcy5CJiZQKHRoaXMsbixoLGYsYSxjKTticmVha31kZWZhdWx0OmlmKHRoaXMuQyYmKGY9TWF0aC5taW4oZi90aGlzLkMoYixsLHIpfDAscS0xKSksUCh0aGlzLG4sbCxmLGEsYyksdyYmMTxkJiZyPGQtMSlmb3IoZT14KCksaD10aGlzLkEsZj1sLGc9TWF0aC5taW4odysxLGQtciksZVtmXT0xLGs9MTtrPGc7aysrKWlmKChsPWJbdGhpcy5GP2QtMS1yLWs6citrXSkmJmwubGVuZ3RoPj10aGlzLkImJiFlW2xdKXtlW2xdPTE7Y29uc3QgcD10aGlzLmwmJmw+ZjtQKHRoaXMsbSxwP2Y6bCxPKGgrKGQvMj5oPzA6MSksZCxyLGctMSxrLTEpLGEsYyxwP2w6Zil9fX19dGhpcy5tfHwodGhpcy5yZWdpc3RlclthXT0xKX19cmV0dXJuIHRoaXN9O1xuZnVuY3Rpb24gTyhhLGIsYyxkLGUpe3JldHVybiBjJiYxPGE/YisoZHx8MCk8PWE/YysoZXx8MCk6KGEtMSkvKGIrKGR8fDApKSooYysoZXx8MCkpKzF8MDowfWZ1bmN0aW9uIFAoYSxiLGMsZCxlLGYsaCl7bGV0IGc9aD9hLmg6YS5tYXA7aWYoIWJbY118fGgmJiFiW2NdW2hdKWEucyYmKGc9Z1tkXSksaD8oYj1iW2NdfHwoYltjXT14KCkpLGJbaF09MSxnPWdbaF18fChnW2hdPXgoKSkpOmJbY109MSxnPWdbY118fChnW2NdPVtdKSxhLnN8fChnPWdbZF18fChnW2RdPVtdKSksZiYmZy5pbmNsdWRlcyhlKXx8KGdbZy5sZW5ndGhdPWUsYS5tJiYoYT1hLnJlZ2lzdGVyW2VdfHwoYS5yZWdpc3RlcltlXT1bXSksYVthLmxlbmd0aF09ZykpfVxudC5zZWFyY2g9ZnVuY3Rpb24oYSxiLGMpe2N8fCghYiYmRChhKT8oYz1hLGE9Yy5xdWVyeSk6RChiKSYmKGM9YikpO2xldCBkPVtdLGU7bGV0IGYsaD0wO2lmKGMpe2E9Yy5xdWVyeXx8YTtiPWMubGltaXQ7aD1jLm9mZnNldHx8MDt2YXIgZz1jLmNvbnRleHQ7Zj1jLnN1Z2dlc3R9aWYoYSYmKGE9dGhpcy5lbmNvZGUoXCJcIithKSxlPWEubGVuZ3RoLDE8ZSkpe2M9eCgpO3ZhciBrPVtdO2ZvcihsZXQgbj0wLHc9MCxxO248ZTtuKyspaWYoKHE9YVtuXSkmJnEubGVuZ3RoPj10aGlzLkImJiFjW3FdKWlmKHRoaXMuc3x8Znx8dGhpcy5tYXBbcV0pa1t3KytdPXEsY1txXT0xO2Vsc2UgcmV0dXJuIGQ7YT1rO2U9YS5sZW5ndGh9aWYoIWUpcmV0dXJuIGQ7Ynx8KGI9MTAwKTtnPXRoaXMuZGVwdGgmJjE8ZSYmITEhPT1nO2M9MDtsZXQgbTtnPyhtPWFbMF0sYz0xKToxPGUmJmEuc29ydChhYSk7Zm9yKGxldCBuLHc7YzxlO2MrKyl7dz1hW2NdO2c/KG49cGEodGhpcyxkLGYsYixoLDI9PT1lLHcsXG5tKSxmJiYhMT09PW4mJmQubGVuZ3RofHwobT13KSk6bj1wYSh0aGlzLGQsZixiLGgsMT09PWUsdyk7aWYobilyZXR1cm4gbjtpZihmJiZjPT09ZS0xKXtrPWQubGVuZ3RoO2lmKCFrKXtpZihnKXtnPTA7Yz0tMTtjb250aW51ZX1yZXR1cm4gZH1pZigxPT09aylyZXR1cm4gcWEoZFswXSxiLGgpfX1yZXR1cm4gamEoZCxiLGgsZil9O1xuZnVuY3Rpb24gcGEoYSxiLGMsZCxlLGYsaCxnKXtsZXQgaz1bXSxtPWc/YS5oOmEubWFwO2Euc3x8KG09cmEobSxoLGcsYS5sKSk7aWYobSl7bGV0IG49MDtjb25zdCB3PU1hdGgubWluKG0ubGVuZ3RoLGc/YS5BOmEuRCk7Zm9yKGxldCBxPTAscj0wLGwscDtxPHc7cSsrKWlmKGw9bVtxXSlpZihhLnMmJihsPXJhKGwsaCxnLGEubCkpLGUmJmwmJmYmJihwPWwubGVuZ3RoLHA8PWU/KGUtPXAsbD1udWxsKToobD1sLnNsaWNlKGUpLGU9MCkpLGwmJihrW24rK109bCxmJiYocis9bC5sZW5ndGgscj49ZCkpKWJyZWFrO2lmKG4pe2lmKGYpcmV0dXJuIHFhKGssZCwwKTtiW2IubGVuZ3RoXT1rO3JldHVybn19cmV0dXJuIWMmJmt9ZnVuY3Rpb24gcWEoYSxiLGMpe2E9MT09PWEubGVuZ3RoP2FbMF06W10uY29uY2F0LmFwcGx5KFtdLGEpO3JldHVybiBjfHxhLmxlbmd0aD5iP2Euc2xpY2UoYyxjK2IpOmF9XG5mdW5jdGlvbiByYShhLGIsYyxkKXtjPyhkPWQmJmI+YyxhPShhPWFbZD9iOmNdKSYmYVtkP2M6Yl0pOmE9YVtiXTtyZXR1cm4gYX10LmNvbnRhaW49ZnVuY3Rpb24oYSl7cmV0dXJuISF0aGlzLnJlZ2lzdGVyW2FdfTt0LnVwZGF0ZT1mdW5jdGlvbihhLGIpe3JldHVybiB0aGlzLnJlbW92ZShhKS5hZGQoYSxiKX07XG50LnJlbW92ZT1mdW5jdGlvbihhLGIpe2NvbnN0IGM9dGhpcy5yZWdpc3RlclthXTtpZihjKXtpZih0aGlzLm0pZm9yKGxldCBkPTAsZTtkPGMubGVuZ3RoO2QrKyllPWNbZF0sZS5zcGxpY2UoZS5pbmRleE9mKGEpLDEpO2Vsc2UgUSh0aGlzLm1hcCxhLHRoaXMuRCx0aGlzLnMpLHRoaXMuZGVwdGgmJlEodGhpcy5oLGEsdGhpcy5BLHRoaXMucyk7Ynx8ZGVsZXRlIHRoaXMucmVnaXN0ZXJbYV07aWYodGhpcy5jYWNoZSl7Yj10aGlzLmNhY2hlO2ZvcihsZXQgZD0wLGUsZjtkPGIuaC5sZW5ndGg7ZCsrKWY9Yi5oW2RdLGU9Yi5jYWNoZVtmXSxlLmluY2x1ZGVzKGEpJiYoYi5oLnNwbGljZShkLS0sMSksZGVsZXRlIGIuY2FjaGVbZl0pfX1yZXR1cm4gdGhpc307XG5mdW5jdGlvbiBRKGEsYixjLGQsZSl7bGV0IGY9MDtpZihhLmNvbnN0cnVjdG9yPT09QXJyYXkpaWYoZSliPWEuaW5kZXhPZihiKSwtMSE9PWI/MTxhLmxlbmd0aCYmKGEuc3BsaWNlKGIsMSksZisrKTpmKys7ZWxzZXtlPU1hdGgubWluKGEubGVuZ3RoLGMpO2ZvcihsZXQgaD0wLGc7aDxlO2grKylpZihnPWFbaF0pZj1RKGcsYixjLGQsZSksZHx8Znx8ZGVsZXRlIGFbaF19ZWxzZSBmb3IobGV0IGggaW4gYSkoZj1RKGFbaF0sYixjLGQsZSkpfHxkZWxldGUgYVtoXTtyZXR1cm4gZn10LnNlYXJjaENhY2hlPWxhO1xudC5leHBvcnQ9ZnVuY3Rpb24oYSxiLGMsZCxlLGYpe2xldCBoPSEwO1widW5kZWZpbmVkXCI9PT10eXBlb2YgZiYmKGg9bmV3IFByb21pc2UobT0+e2Y9bX0pKTtsZXQgZyxrO3N3aXRjaChlfHwoZT0wKSl7Y2FzZSAwOmc9XCJyZWdcIjtpZih0aGlzLm0pe2s9eCgpO2ZvcihsZXQgbSBpbiB0aGlzLnJlZ2lzdGVyKWtbbV09MX1lbHNlIGs9dGhpcy5yZWdpc3RlcjticmVhaztjYXNlIDE6Zz1cImNmZ1wiO2s9e2RvYzowLG9wdDp0aGlzLnM/MTowfTticmVhaztjYXNlIDI6Zz1cIm1hcFwiO2s9dGhpcy5tYXA7YnJlYWs7Y2FzZSAzOmc9XCJjdHhcIjtrPXRoaXMuaDticmVhaztkZWZhdWx0OlwidW5kZWZpbmVkXCI9PT10eXBlb2YgYyYmZiYmZigpO3JldHVybn1vYShhLGJ8fHRoaXMsYyxnLGQsZSxrLGYpO3JldHVybiBofTtcbnQuaW1wb3J0PWZ1bmN0aW9uKGEsYil7aWYoYilzd2l0Y2goQyhiKSYmKGI9SlNPTi5wYXJzZShiKSksYSl7Y2FzZSBcImNmZ1wiOnRoaXMucz0hIWIub3B0O2JyZWFrO2Nhc2UgXCJyZWdcIjp0aGlzLm09ITE7dGhpcy5yZWdpc3Rlcj1iO2JyZWFrO2Nhc2UgXCJtYXBcIjp0aGlzLm1hcD1iO2JyZWFrO2Nhc2UgXCJjdHhcIjp0aGlzLmg9Yn19O2lhKE4ucHJvdG90eXBlKTtmdW5jdGlvbiBzYShhKXthPWEuZGF0YTt2YXIgYj1zZWxmLl9pbmRleDtjb25zdCBjPWEuYXJnczt2YXIgZD1hLnRhc2s7c3dpdGNoKGQpe2Nhc2UgXCJpbml0XCI6ZD1hLm9wdGlvbnN8fHt9O2E9YS5mYWN0b3J5O2I9ZC5lbmNvZGU7ZC5jYWNoZT0hMTtiJiYwPT09Yi5pbmRleE9mKFwiZnVuY3Rpb25cIikmJihkLmVuY29kZT1GdW5jdGlvbihcInJldHVybiBcIitiKSgpKTthPyhGdW5jdGlvbihcInJldHVybiBcIithKSgpKHNlbGYpLHNlbGYuX2luZGV4PW5ldyBzZWxmLkZsZXhTZWFyY2guSW5kZXgoZCksZGVsZXRlIHNlbGYuRmxleFNlYXJjaCk6c2VsZi5faW5kZXg9bmV3IE4oZCk7YnJlYWs7ZGVmYXVsdDphPWEuaWQsYj1iW2RdLmFwcGx5KGIsYykscG9zdE1lc3NhZ2UoXCJzZWFyY2hcIj09PWQ/e2lkOmEsbXNnOmJ9OntpZDphfSl9fTtsZXQgdGE9MDtmdW5jdGlvbiBTKGEpe2lmKCEodGhpcyBpbnN0YW5jZW9mIFMpKXJldHVybiBuZXcgUyhhKTt2YXIgYjthP0UoYj1hLmVuY29kZSkmJihhLmVuY29kZT1iLnRvU3RyaW5nKCkpOmE9e307KGI9KHNlbGZ8fHdpbmRvdykuX2ZhY3RvcnkpJiYoYj1iLnRvU3RyaW5nKCkpO2NvbnN0IGM9XCJ1bmRlZmluZWRcIj09PXR5cGVvZiB3aW5kb3cmJnNlbGYuZXhwb3J0cyxkPXRoaXM7dGhpcy5vPXVhKGIsYyxhLndvcmtlcik7dGhpcy5oPXgoKTtpZih0aGlzLm8pe2lmKGMpdGhpcy5vLm9uKFwibWVzc2FnZVwiLGZ1bmN0aW9uKGUpe2QuaFtlLmlkXShlLm1zZyk7ZGVsZXRlIGQuaFtlLmlkXX0pO2Vsc2UgdGhpcy5vLm9ubWVzc2FnZT1mdW5jdGlvbihlKXtlPWUuZGF0YTtkLmhbZS5pZF0oZS5tc2cpO2RlbGV0ZSBkLmhbZS5pZF19O3RoaXMuby5wb3N0TWVzc2FnZSh7dGFzazpcImluaXRcIixmYWN0b3J5OmIsb3B0aW9uczphfSl9fVQoXCJhZGRcIik7VChcImFwcGVuZFwiKTtUKFwic2VhcmNoXCIpO1xuVChcInVwZGF0ZVwiKTtUKFwicmVtb3ZlXCIpO2Z1bmN0aW9uIFQoYSl7Uy5wcm90b3R5cGVbYV09Uy5wcm90b3R5cGVbYStcIkFzeW5jXCJdPWZ1bmN0aW9uKCl7Y29uc3QgYj10aGlzLGM9W10uc2xpY2UuY2FsbChhcmd1bWVudHMpO3ZhciBkPWNbYy5sZW5ndGgtMV07bGV0IGU7RShkKSYmKGU9ZCxjLnNwbGljZShjLmxlbmd0aC0xLDEpKTtkPW5ldyBQcm9taXNlKGZ1bmN0aW9uKGYpe3NldFRpbWVvdXQoZnVuY3Rpb24oKXtiLmhbKyt0YV09ZjtiLm8ucG9zdE1lc3NhZ2Uoe3Rhc2s6YSxpZDp0YSxhcmdzOmN9KX0pfSk7cmV0dXJuIGU/KGQudGhlbihlKSx0aGlzKTpkfX1cbmZ1bmN0aW9uIHVhKGEsYixjKXtsZXQgZDt0cnl7ZD1iP25ldyAocmVxdWlyZShcIndvcmtlcl90aHJlYWRzXCIpW1wiV29ya2VyXCJdKShfX2Rpcm5hbWUgKyBcIi9ub2RlL25vZGUuanNcIik6YT9uZXcgV29ya2VyKFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW1wib25tZXNzYWdlPVwiK3NhLnRvU3RyaW5nKCldLHt0eXBlOlwidGV4dC9qYXZhc2NyaXB0XCJ9KSkpOm5ldyBXb3JrZXIoQyhjKT9jOlwid29ya2VyL3dvcmtlci5qc1wiLHt0eXBlOlwibW9kdWxlXCJ9KX1jYXRjaChlKXt9cmV0dXJuIGR9O2Z1bmN0aW9uIFUoYSl7aWYoISh0aGlzIGluc3RhbmNlb2YgVSkpcmV0dXJuIG5ldyBVKGEpO3ZhciBiPWEuZG9jdW1lbnR8fGEuZG9jfHxhLGM7dGhpcy5LPVtdO3RoaXMuaD1bXTt0aGlzLkE9W107dGhpcy5yZWdpc3Rlcj14KCk7dGhpcy5rZXk9KGM9Yi5rZXl8fGIuaWQpJiZWKGMsdGhpcy5BKXx8XCJpZFwiO3RoaXMubT11KGEuZmFzdHVwZGF0ZSk7dGhpcy5DPShjPWIuc3RvcmUpJiYhMCE9PWMmJltdO3RoaXMuc3RvcmU9YyYmeCgpO3RoaXMuST0oYz1iLnRhZykmJlYoYyx0aGlzLkEpO3RoaXMubD1jJiZ4KCk7dGhpcy5jYWNoZT0oYz1hLmNhY2hlKSYmbmV3IE0oYyk7YS5jYWNoZT0hMTt0aGlzLm89YS53b3JrZXI7dGhpcy5hc3luYz0hMTtjPXgoKTtsZXQgZD1iLmluZGV4fHxiLmZpZWxkfHxiO0MoZCkmJihkPVtkXSk7Zm9yKGxldCBlPTAsZixoO2U8ZC5sZW5ndGg7ZSsrKWY9ZFtlXSxDKGYpfHwoaD1mLGY9Zi5maWVsZCksaD1EKGgpP09iamVjdC5hc3NpZ24oe30sYSxoKTphLFxudGhpcy5vJiYoY1tmXT1uZXcgUyhoKSxjW2ZdLm98fCh0aGlzLm89ITEpKSx0aGlzLm98fChjW2ZdPW5ldyBOKGgsdGhpcy5yZWdpc3RlcikpLHRoaXMuS1tlXT1WKGYsdGhpcy5BKSx0aGlzLmhbZV09ZjtpZih0aGlzLkMpZm9yKGE9Yi5zdG9yZSxDKGEpJiYoYT1bYV0pLGI9MDtiPGEubGVuZ3RoO2IrKyl0aGlzLkNbYl09VihhW2JdLHRoaXMuQSk7dGhpcy5pbmRleD1jfWZ1bmN0aW9uIFYoYSxiKXtjb25zdCBjPWEuc3BsaXQoXCI6XCIpO2xldCBkPTA7Zm9yKGxldCBlPTA7ZTxjLmxlbmd0aDtlKyspYT1jW2VdLDA8PWEuaW5kZXhPZihcIltdXCIpJiYoYT1hLnN1YnN0cmluZygwLGEubGVuZ3RoLTIpKSYmKGJbZF09ITApLGEmJihjW2QrK109YSk7ZDxjLmxlbmd0aCYmKGMubGVuZ3RoPWQpO3JldHVybiAxPGQ/YzpjWzBdfWZ1bmN0aW9uIFgoYSxiKXtpZihDKGIpKWE9YVtiXTtlbHNlIGZvcihsZXQgYz0wO2EmJmM8Yi5sZW5ndGg7YysrKWE9YVtiW2NdXTtyZXR1cm4gYX1cbmZ1bmN0aW9uIFkoYSxiLGMsZCxlKXthPWFbZV07aWYoZD09PWMubGVuZ3RoLTEpYltlXT1hO2Vsc2UgaWYoYSlpZihhLmNvbnN0cnVjdG9yPT09QXJyYXkpZm9yKGI9YltlXT1BcnJheShhLmxlbmd0aCksZT0wO2U8YS5sZW5ndGg7ZSsrKVkoYSxiLGMsZCxlKTtlbHNlIGI9YltlXXx8KGJbZV09eCgpKSxlPWNbKytkXSxZKGEsYixjLGQsZSl9ZnVuY3Rpb24gWihhLGIsYyxkLGUsZixoLGcpe2lmKGE9YVtoXSlpZihkPT09Yi5sZW5ndGgtMSl7aWYoYS5jb25zdHJ1Y3Rvcj09PUFycmF5KXtpZihjW2RdKXtmb3IoYj0wO2I8YS5sZW5ndGg7YisrKWUuYWRkKGYsYVtiXSwhMCwhMCk7cmV0dXJufWE9YS5qb2luKFwiIFwiKX1lLmFkZChmLGEsZywhMCl9ZWxzZSBpZihhLmNvbnN0cnVjdG9yPT09QXJyYXkpZm9yKGg9MDtoPGEubGVuZ3RoO2grKylaKGEsYixjLGQsZSxmLGgsZyk7ZWxzZSBoPWJbKytkXSxaKGEsYixjLGQsZSxmLGgsZyl9dD1VLnByb3RvdHlwZTtcbnQuYWRkPWZ1bmN0aW9uKGEsYixjKXtEKGEpJiYoYj1hLGE9WChiLHRoaXMua2V5KSk7aWYoYiYmKGF8fDA9PT1hKSl7aWYoIWMmJnRoaXMucmVnaXN0ZXJbYV0pcmV0dXJuIHRoaXMudXBkYXRlKGEsYik7Zm9yKGxldCBkPTAsZSxmO2Q8dGhpcy5oLmxlbmd0aDtkKyspZj10aGlzLmhbZF0sZT10aGlzLktbZF0sQyhlKSYmKGU9W2VdKSxaKGIsZSx0aGlzLkEsMCx0aGlzLmluZGV4W2ZdLGEsZVswXSxjKTtpZih0aGlzLkkpe2xldCBkPVgoYix0aGlzLkkpLGU9eCgpO0MoZCkmJihkPVtkXSk7Zm9yKGxldCBmPTAsaCxnO2Y8ZC5sZW5ndGg7ZisrKWlmKGg9ZFtmXSwhZVtoXSYmKGVbaF09MSxnPXRoaXMubFtoXXx8KHRoaXMubFtoXT1bXSksIWN8fCFnLmluY2x1ZGVzKGEpKSlpZihnW2cubGVuZ3RoXT1hLHRoaXMubSl7Y29uc3Qgaz10aGlzLnJlZ2lzdGVyW2FdfHwodGhpcy5yZWdpc3RlclthXT1bXSk7a1trLmxlbmd0aF09Z319aWYodGhpcy5zdG9yZSYmKCFjfHwhdGhpcy5zdG9yZVthXSkpe2xldCBkO1xuaWYodGhpcy5DKXtkPXgoKTtmb3IobGV0IGU9MCxmO2U8dGhpcy5DLmxlbmd0aDtlKyspZj10aGlzLkNbZV0sQyhmKT9kW2ZdPWJbZl06WShiLGQsZiwwLGZbMF0pfXRoaXMuc3RvcmVbYV09ZHx8Yn19cmV0dXJuIHRoaXN9O3QuYXBwZW5kPWZ1bmN0aW9uKGEsYil7cmV0dXJuIHRoaXMuYWRkKGEsYiwhMCl9O3QudXBkYXRlPWZ1bmN0aW9uKGEsYil7cmV0dXJuIHRoaXMucmVtb3ZlKGEpLmFkZChhLGIpfTtcbnQucmVtb3ZlPWZ1bmN0aW9uKGEpe0QoYSkmJihhPVgoYSx0aGlzLmtleSkpO2lmKHRoaXMucmVnaXN0ZXJbYV0pe2Zvcih2YXIgYj0wO2I8dGhpcy5oLmxlbmd0aCYmKHRoaXMuaW5kZXhbdGhpcy5oW2JdXS5yZW1vdmUoYSwhdGhpcy5vKSwhdGhpcy5tKTtiKyspO2lmKHRoaXMuSSYmIXRoaXMubSlmb3IobGV0IGMgaW4gdGhpcy5sKXtiPXRoaXMubFtjXTtjb25zdCBkPWIuaW5kZXhPZihhKTstMSE9PWQmJigxPGIubGVuZ3RoP2Iuc3BsaWNlKGQsMSk6ZGVsZXRlIHRoaXMubFtjXSl9dGhpcy5zdG9yZSYmZGVsZXRlIHRoaXMuc3RvcmVbYV07ZGVsZXRlIHRoaXMucmVnaXN0ZXJbYV19cmV0dXJuIHRoaXN9O1xudC5zZWFyY2g9ZnVuY3Rpb24oYSxiLGMsZCl7Y3x8KCFiJiZEKGEpPyhjPWEsYT1cIlwiKTpEKGIpJiYoYz1iLGI9MCkpO2xldCBlPVtdLGY9W10saCxnLGssbSxuLHcscT0wO2lmKGMpaWYoYy5jb25zdHJ1Y3Rvcj09PUFycmF5KWs9YyxjPW51bGw7ZWxzZXthPWMucXVlcnl8fGE7az0oaD1jLnBsdWNrKXx8Yy5pbmRleHx8Yy5maWVsZDttPWMudGFnO2c9dGhpcy5zdG9yZSYmYy5lbnJpY2g7bj1cImFuZFwiPT09Yy5ib29sO2I9Yy5saW1pdHx8Ynx8MTAwO3c9Yy5vZmZzZXR8fDA7aWYobSYmKEMobSkmJihtPVttXSksIWEpKXtmb3IobGV0IGw9MCxwO2w8bS5sZW5ndGg7bCsrKWlmKHA9dmEuY2FsbCh0aGlzLG1bbF0sYix3LGcpKWVbZS5sZW5ndGhdPXAscSsrO3JldHVybiBxP2U6W119QyhrKSYmKGs9W2tdKX1rfHwoaz10aGlzLmgpO249biYmKDE8ay5sZW5ndGh8fG0mJjE8bS5sZW5ndGgpO2NvbnN0IHI9IWQmJih0aGlzLm98fHRoaXMuYXN5bmMpJiZbXTtmb3IobGV0IGw9MCxwLEEsQjtsPFxuay5sZW5ndGg7bCsrKXtsZXQgejtBPWtbbF07QyhBKXx8KHo9QSxBPXouZmllbGQsYT16LnF1ZXJ5fHxhLGI9ei5saW1pdHx8YixnPXouZW5yaWNofHxnKTtpZihyKXJbbF09dGhpcy5pbmRleFtBXS5zZWFyY2hBc3luYyhhLGIsenx8Yyk7ZWxzZXtkP3A9ZFtsXTpwPXRoaXMuaW5kZXhbQV0uc2VhcmNoKGEsYix6fHxjKTtCPXAmJnAubGVuZ3RoO2lmKG0mJkIpe2NvbnN0IHk9W107bGV0IEg9MDtuJiYoeVswXT1bcF0pO2ZvcihsZXQgVz0wLG1hLFI7VzxtLmxlbmd0aDtXKyspaWYobWE9bVtXXSxCPShSPXRoaXMubFttYV0pJiZSLmxlbmd0aClIKysseVt5Lmxlbmd0aF09bj9bUl06UjtIJiYocD1uP2phKHksYnx8MTAwLHd8fDApOmthKHAseSksQj1wLmxlbmd0aCl9aWYoQilmW3FdPUEsZVtxKytdPXA7ZWxzZSBpZihuKXJldHVybltdfX1pZihyKXtjb25zdCBsPXRoaXM7cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHApe1Byb21pc2UuYWxsKHIpLnRoZW4oZnVuY3Rpb24oQSl7cChsLnNlYXJjaChhLFxuYixjLEEpKX0pfSl9aWYoIXEpcmV0dXJuW107aWYoaCYmKCFnfHwhdGhpcy5zdG9yZSkpcmV0dXJuIGVbMF07Zm9yKGxldCBsPTAscDtsPGYubGVuZ3RoO2wrKyl7cD1lW2xdO3AubGVuZ3RoJiZnJiYocD13YS5jYWxsKHRoaXMscCkpO2lmKGgpcmV0dXJuIHA7ZVtsXT17ZmllbGQ6ZltsXSxyZXN1bHQ6cH19cmV0dXJuIGV9O2Z1bmN0aW9uIHZhKGEsYixjLGQpe2xldCBlPXRoaXMubFthXSxmPWUmJmUubGVuZ3RoLWM7aWYoZiYmMDxmKXtpZihmPmJ8fGMpZT1lLnNsaWNlKGMsYytiKTtkJiYoZT13YS5jYWxsKHRoaXMsZSkpO3JldHVybnt0YWc6YSxyZXN1bHQ6ZX19fWZ1bmN0aW9uIHdhKGEpe2NvbnN0IGI9QXJyYXkoYS5sZW5ndGgpO2ZvcihsZXQgYz0wLGQ7YzxhLmxlbmd0aDtjKyspZD1hW2NdLGJbY109e2lkOmQsZG9jOnRoaXMuc3RvcmVbZF19O3JldHVybiBifXQuY29udGFpbj1mdW5jdGlvbihhKXtyZXR1cm4hIXRoaXMucmVnaXN0ZXJbYV19O3QuZ2V0PWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLnN0b3JlW2FdfTtcbnQuc2V0PWZ1bmN0aW9uKGEsYil7dGhpcy5zdG9yZVthXT1iO3JldHVybiB0aGlzfTt0LnNlYXJjaENhY2hlPWxhO3QuZXhwb3J0PWZ1bmN0aW9uKGEsYixjLGQsZSxmKXtsZXQgaDtcInVuZGVmaW5lZFwiPT09dHlwZW9mIGYmJihoPW5ldyBQcm9taXNlKGc9PntmPWd9KSk7ZXx8KGU9MCk7ZHx8KGQ9MCk7aWYoZDx0aGlzLmgubGVuZ3RoKXtjb25zdCBnPXRoaXMuaFtkXSxrPXRoaXMuaW5kZXhbZ107Yj10aGlzO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtrLmV4cG9ydChhLGIsZT9nOlwiXCIsZCxlKyssZil8fChkKyssZT0xLGIuZXhwb3J0KGEsYixnLGQsZSxmKSl9KX1lbHNle2xldCBnLGs7c3dpdGNoKGUpe2Nhc2UgMTpnPVwidGFnXCI7az10aGlzLmw7Yz1udWxsO2JyZWFrO2Nhc2UgMjpnPVwic3RvcmVcIjtrPXRoaXMuc3RvcmU7Yz1udWxsO2JyZWFrO2RlZmF1bHQ6ZigpO3JldHVybn1vYShhLHRoaXMsYyxnLGQsZSxrLGYpfXJldHVybiBofTtcbnQuaW1wb3J0PWZ1bmN0aW9uKGEsYil7aWYoYilzd2l0Y2goQyhiKSYmKGI9SlNPTi5wYXJzZShiKSksYSl7Y2FzZSBcInRhZ1wiOnRoaXMubD1iO2JyZWFrO2Nhc2UgXCJyZWdcIjp0aGlzLm09ITE7dGhpcy5yZWdpc3Rlcj1iO2ZvcihsZXQgZD0wLGU7ZDx0aGlzLmgubGVuZ3RoO2QrKyllPXRoaXMuaW5kZXhbdGhpcy5oW2RdXSxlLnJlZ2lzdGVyPWIsZS5tPSExO2JyZWFrO2Nhc2UgXCJzdG9yZVwiOnRoaXMuc3RvcmU9YjticmVhaztkZWZhdWx0OmE9YS5zcGxpdChcIi5cIik7Y29uc3QgYz1hWzBdO2E9YVsxXTtjJiZhJiZ0aGlzLmluZGV4W2NdLmltcG9ydChhLGIpfX07aWEoVS5wcm90b3R5cGUpO3ZhciB5YT17ZW5jb2RlOnhhLEY6ITEsRzpcIlwifTtjb25zdCB6YT1bSihcIltcXHUwMGUwXFx1MDBlMVxcdTAwZTJcXHUwMGUzXFx1MDBlNFxcdTAwZTVdXCIpLFwiYVwiLEooXCJbXFx1MDBlOFxcdTAwZTlcXHUwMGVhXFx1MDBlYl1cIiksXCJlXCIsSihcIltcXHUwMGVjXFx1MDBlZFxcdTAwZWVcXHUwMGVmXVwiKSxcImlcIixKKFwiW1xcdTAwZjJcXHUwMGYzXFx1MDBmNFxcdTAwZjVcXHUwMGY2XFx1MDE1MV1cIiksXCJvXCIsSihcIltcXHUwMGY5XFx1MDBmYVxcdTAwZmJcXHUwMGZjXFx1MDE3MV1cIiksXCJ1XCIsSihcIltcXHUwMGZkXFx1MDE3N1xcdTAwZmZdXCIpLFwieVwiLEooXCJcXHUwMGYxXCIpLFwiblwiLEooXCJbXFx1MDBlN2NdXCIpLFwia1wiLEooXCJcXHUwMGRmXCIpLFwic1wiLEooXCIgJiBcIiksXCIgYW5kIFwiXTtmdW5jdGlvbiB4YShhKXt2YXIgYj1hPVwiXCIrYTtiLm5vcm1hbGl6ZSYmKGI9Yi5ub3JtYWxpemUoXCJORkRcIikucmVwbGFjZShjYSxcIlwiKSk7cmV0dXJuIEYuY2FsbCh0aGlzLGIudG9Mb3dlckNhc2UoKSwhYS5ub3JtYWxpemUmJnphKX07dmFyIEJhPXtlbmNvZGU6QWEsRjohMSxHOlwic3RyaWN0XCJ9O2NvbnN0IENhPS9bXmEtejAtOV0rLyxEYT17YjpcInBcIix2OlwiZlwiLHc6XCJmXCIsejpcInNcIix4Olwic1wiLFwiXFx1MDBkZlwiOlwic1wiLGQ6XCJ0XCIsbjpcIm1cIixjOlwia1wiLGc6XCJrXCIsajpcImtcIixxOlwia1wiLGk6XCJlXCIseTpcImVcIix1Olwib1wifTtmdW5jdGlvbiBBYShhKXthPXhhLmNhbGwodGhpcyxhKS5qb2luKFwiIFwiKTtjb25zdCBiPVtdO2lmKGEpe2NvbnN0IGM9YS5zcGxpdChDYSksZD1jLmxlbmd0aDtmb3IobGV0IGU9MCxmLGg9MDtlPGQ7ZSsrKWlmKChhPWNbZV0pJiYoIXRoaXMuZmlsdGVyfHwhdGhpcy5maWx0ZXJbYV0pKXtmPWFbMF07bGV0IGc9RGFbZl18fGYsaz1nO2ZvcihsZXQgbT0xO208YS5sZW5ndGg7bSsrKXtmPWFbbV07Y29uc3Qgbj1EYVtmXXx8ZjtuJiZuIT09ayYmKGcrPW4saz1uKX1iW2grK109Z319cmV0dXJuIGJ9O3ZhciBGYT17ZW5jb2RlOkVhLEY6ITEsRzpcIlwifTtjb25zdCBHYT1bSihcImFlXCIpLFwiYVwiLEooXCJvZVwiKSxcIm9cIixKKFwic2hcIiksXCJzXCIsSihcInRoXCIpLFwidFwiLEooXCJwaFwiKSxcImZcIixKKFwicGZcIiksXCJmXCIsSihcIig/IVthZW9dKWgoPyFbYWVvXSlcIiksXCJcIixKKFwiKD8hXlthZW9dKWgoPyFeW2Flb10pXCIpLFwiXCJdO2Z1bmN0aW9uIEVhKGEsYil7YSYmKGE9QWEuY2FsbCh0aGlzLGEpLmpvaW4oXCIgXCIpLDI8YS5sZW5ndGgmJihhPUcoYSxHYSkpLGJ8fCgxPGEubGVuZ3RoJiYoYT1kYShhKSksYSYmKGE9YS5zcGxpdChcIiBcIikpKSk7cmV0dXJuIGF8fFtdfTt2YXIgSWE9e2VuY29kZTpIYSxGOiExLEc6XCJcIn07Y29uc3QgSmE9SihcIig/IVxcXFxiKVthZW9dXCIpO2Z1bmN0aW9uIEhhKGEpe2EmJihhPUVhLmNhbGwodGhpcyxhLCEwKSwxPGEubGVuZ3RoJiYoYT1hLnJlcGxhY2UoSmEsXCJcIikpLDE8YS5sZW5ndGgmJihhPWRhKGEpKSxhJiYoYT1hLnNwbGl0KFwiIFwiKSkpO3JldHVybiBhfHxbXX07S1tcImxhdGluOmRlZmF1bHRcIl09ZmE7S1tcImxhdGluOnNpbXBsZVwiXT15YTtLW1wibGF0aW46YmFsYW5jZVwiXT1CYTtLW1wibGF0aW46YWR2YW5jZWRcIl09RmE7S1tcImxhdGluOmV4dHJhXCJdPUlhO2V4cG9ydCBkZWZhdWx0IHtJbmRleDpOLERvY3VtZW50OlUsV29ya2VyOlMscmVnaXN0ZXJDaGFyc2V0OmZ1bmN0aW9uKGEsYil7S1thXT1ifSxyZWdpc3Rlckxhbmd1YWdlOmZ1bmN0aW9uKGEsYil7aGFbYV09Yn19O1xuIiwgIi8qIVxyXG4gKiBGbGV4U2VhcmNoIGZvciBCb290c3RyYXAgYmFzZWQgVGh1bGl0ZSBzaXRlc1xyXG4gKiBDb3B5cmlnaHQgMjAyMS0yMDI0IFRodWxpdGVcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXHJcbiAqIEJhc2VkIG9uIGh0dHBzOi8vZ2l0aHViLmNvbS9mcmpvL2h1Z28tdGhlbWUtemVuL2Jsb2IvbWFpbi9hc3NldHMvanMvc2VhcmNoLmpzXHJcbiAqL1xyXG5cclxuLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYsIGd1YXJkLWZvci1pbiAqL1xyXG5cclxuLyoqXHJcbiAqIEBmaWxlXHJcbiAqIEEgSmF2YVNjcmlwdCBmaWxlIGZvciBmbGV4c2VhcmNoLlxyXG4gKi9cclxuXHJcbi8vIGltcG9ydCAqIGFzIEZsZXhTZWFyY2ggZnJvbSAnZmxleHNlYXJjaCc7XHJcbmltcG9ydCBJbmRleCBmcm9tICdmbGV4c2VhcmNoJztcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcblxyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gY29uc3QgaW5kZXggPSBuZXcgRmxleFNlYXJjaC5Eb2N1bWVudCh7XHJcbiAgY29uc3QgaW5kZXggPSBuZXcgSW5kZXguRG9jdW1lbnQoe1xyXG4gICAgdG9rZW5pemU6ICdmb3J3YXJkJyxcclxuICAgIGRvY3VtZW50OiB7XHJcbiAgICAgIGlkOiAnaWQnLFxyXG4gICAgICBpbmRleDogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIGZpZWxkOiAndGl0bGUnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBmaWVsZDogJ3RhZ3MnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBmaWVsZDogJ2NvbnRlbnQnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBmaWVsZDogICdkYXRlJyxcclxuICAgICAgICAgIHRva2VuaXplOiAnc3RyaWN0JyxcclxuICAgICAgICAgIGVuY29kZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIF0sXHJcbiAgICAgIHN0b3JlOiBbJ3RpdGxlJywnc3VtbWFyeScsJ2RhdGUnLCdwZXJtYWxpbmsnXVxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBzaG93UmVzdWx0cyhpdGVtcykge1xyXG4gICAgY29uc3QgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCd0ZW1wbGF0ZScpLmNvbnRlbnQ7XHJcbiAgICBjb25zdCBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcclxuXHJcbiAgICBjb25zdCByZXN1bHRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlYXJjaC1yZXN1bHRzJyk7XHJcbiAgICByZXN1bHRzLnRleHRDb250ZW50ID0gJyc7XHJcblxyXG4gICAgY29uc3QgaXRlbXNMZW5ndGggPSBPYmplY3Qua2V5cyhpdGVtcykubGVuZ3RoO1xyXG5cclxuICAgIC8vIFNob3cvaGlkZSBcIk5vIHJlY2VudCBzZWFyY2hlc1wiIGFuZCBcIk5vIHNlYXJjaCByZXN1bHRzXCIgbWVzc2FnZXNcclxuICAgIGlmICgoaXRlbXNMZW5ndGggPT09IDApICYmIChxdWVyeS52YWx1ZSA9PT0gJycpKSB7XHJcbiAgICAgIC8vIEhpZGUgXCJObyBzZWFyY2ggcmVzdWx0c1wiIG1lc3NhZ2VcclxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlYXJjaC1uby1yZXN1bHRzJykuY2xhc3NMaXN0LmFkZCgnZC1ub25lJyk7XHJcbiAgICAgIC8vIFNob3cgXCJObyByZWNlbnQgc2VhcmNoZXNcIiBtZXNzYWdlXHJcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWFyY2gtbm8tcmVjZW50JykuY2xhc3NMaXN0LnJlbW92ZSgnZC1ub25lJyk7XHJcbiAgICB9IGVsc2UgaWYgKChpdGVtc0xlbmd0aCA9PT0gMCkgJiYgKHF1ZXJ5LnZhbHVlICE9PSAnJykpIHtcclxuICAgICAgLy8gSGlkZSBcIk5vIHJlY2VudCBzZWFyY2hlc1wiIG1lc3NhZ2VcclxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlYXJjaC1uby1yZWNlbnQnKS5jbGFzc0xpc3QuYWRkKCdkLW5vbmUnKTtcclxuICAgICAgLy8gU2hvdyBcIk5vIHNlYXJjaCByZXN1bHRzXCIgbWVzc2FnZVxyXG4gICAgICBjb25zdCBxdWVyeU5vUmVzdWx0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5xdWVyeS1uby1yZXN1bHRzJyk7XHJcbiAgICAgIHF1ZXJ5Tm9SZXN1bHRzLmlubmVyVGV4dCA9IHF1ZXJ5LnZhbHVlO1xyXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VhcmNoLW5vLXJlc3VsdHMnKS5jbGFzc0xpc3QucmVtb3ZlKCdkLW5vbmUnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIEhpZGUgYm90aCBcIk5vIHJlY2VudCBzZWFyY2hlc1wiIGFuZCBcIk5vIHNlYXJjaCByZXN1bHRzXCIgbWVzc2FnZXNcclxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlYXJjaC1uby1yZWNlbnQnKS5jbGFzc0xpc3QuYWRkKCdkLW5vbmUnKTtcclxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlYXJjaC1uby1yZXN1bHRzJykuY2xhc3NMaXN0LmFkZCgnZC1ub25lJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChjb25zdCBpZCBpbiBpdGVtcykge1xyXG4gICAgICBjb25zdCBpdGVtID0gaXRlbXNbaWRdO1xyXG4gICAgICBjb25zdCByZXN1bHQgPSB0ZW1wbGF0ZS5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgIGNvbnN0IGEgPSByZXN1bHQucXVlcnlTZWxlY3RvcignYScpO1xyXG4gICAgICBjb25zdCB0aW1lID0gcmVzdWx0LnF1ZXJ5U2VsZWN0b3IoJ3RpbWUnKTtcclxuICAgICAgY29uc3QgY29udGVudCA9IHJlc3VsdC5xdWVyeVNlbGVjdG9yKCcuY29udGVudCcpO1xyXG4gICAgICBhLmlubmVySFRNTCA9IGl0ZW0udGl0bGU7XHJcbiAgICAgIGEuaHJlZiA9IGl0ZW0ucGVybWFsaW5rO1xyXG4gICAgICB0aW1lLmlubmVyVGV4dCA9IGl0ZW0uZGF0ZTtcclxuICAgICAgY29udGVudC5pbm5lckhUTUwgPSBpdGVtLnN1bW1hcnk7XHJcbiAgICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKHJlc3VsdCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzdWx0cy5hcHBlbmRDaGlsZChmcmFnbWVudCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkb1NlYXJjaCgpIHtcclxuICAgIGNvbnN0IHF1ZXJ5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlYXJjaC10ZXh0JykudmFsdWUudHJpbSgpO1xyXG4gICAgY29uc3QgbGltaXQgPSA5OTtcclxuICAgIGNvbnN0IHJlc3VsdHMgPSBpbmRleC5zZWFyY2goe1xyXG4gICAgICBxdWVyeTogcXVlcnksXHJcbiAgICAgIGVucmljaDogdHJ1ZSxcclxuICAgICAgbGltaXQ6IGxpbWl0LFxyXG4gICAgfSk7XHJcbiAgICBjb25zdCBpdGVtcyA9IHt9O1xyXG5cclxuICAgIHJlc3VsdHMuZm9yRWFjaChmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgIHJlc3VsdC5yZXN1bHQuZm9yRWFjaChmdW5jdGlvbiAocikge1xyXG4gICAgICAgIGl0ZW1zW3IuaWRdID0gci5kb2M7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgc2hvd1Jlc3VsdHMoaXRlbXMpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZW5hYmxlVUkoKSB7XHJcbiAgICBjb25zdCBzZWFyY2hmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlYXJjaC1mb3JtJyk7XHJcbiAgICBzZWFyY2hmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZG9TZWFyY2goKTtcclxuICAgIH0pO1xyXG4gICAgc2VhcmNoZm9ybS5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgZG9TZWFyY2goKTtcclxuICAgIH0pO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlYXJjaC1sb2FkaW5nJykuY2xhc3NMaXN0LmFkZCgnZC1ub25lJyk7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VhcmNoLWlucHV0JykuY2xhc3NMaXN0LnJlbW92ZSgnZC1ub25lJyk7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VhcmNoLXRleHQnKS5mb2N1cygpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYnVpbGRJbmRleCgpIHtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWFyY2gtbG9hZGluZycpLmNsYXNzTGlzdC5yZW1vdmUoJ2Qtbm9uZScpO1xyXG4gICAgZmV0Y2goXCIvc2VhcmNoLWluZGV4Lmpzb25cIilcclxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgIGluZGV4LmFkZChpdGVtKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBidWlsZEluZGV4KCk7XHJcbiAgZW5hYmxlVUkoKTtcclxufSkoKTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7OztBQU9BLE1BQUk7QUFBRSxXQUFTLEVBQUUsR0FBRTtBQUFDLFdBQU0sZ0JBQWMsT0FBTyxJQUFFLElBQUU7QUFBQSxFQUFFO0FBQUMsV0FBUyxFQUFFLEdBQUU7QUFBQyxVQUFNLElBQUUsTUFBTSxDQUFDO0FBQUUsYUFBUSxJQUFFLEdBQUUsSUFBRSxHQUFFLElBQUksR0FBRSxDQUFDLElBQUUsRUFBRTtBQUFFLFdBQU87QUFBQSxFQUFDO0FBQUMsV0FBUyxJQUFHO0FBQUMsV0FBTyx1QkFBTyxPQUFPLElBQUk7QUFBQSxFQUFDO0FBQUMsV0FBUyxHQUFHLEdBQUUsR0FBRTtBQUFDLFdBQU8sRUFBRSxTQUFPLEVBQUU7QUFBQSxFQUFNO0FBQUMsV0FBUyxFQUFFLEdBQUU7QUFBQyxXQUFNLGFBQVcsT0FBTztBQUFBLEVBQUM7QUFBQyxXQUFTLEVBQUUsR0FBRTtBQUFDLFdBQU0sYUFBVyxPQUFPO0FBQUEsRUFBQztBQUFDLFdBQVMsRUFBRSxHQUFFO0FBQUMsV0FBTSxlQUFhLE9BQU87QUFBQSxFQUFDO0FBQUUsV0FBUyxFQUFFLEdBQUUsR0FBRTtBQUFDLFFBQUksSUFBRTtBQUFHLFFBQUcsTUFBSSxNQUFJLElBQUUsRUFBRSxHQUFFLENBQUMsSUFBRyxLQUFLLE1BQUksSUFBRSxFQUFFLEdBQUUsS0FBSyxDQUFDLElBQUcsS0FBSyxLQUFHLElBQUUsRUFBRSxXQUFTLElBQUUsRUFBRSxHQUFFLEtBQUssQ0FBQyxJQUFHLEtBQUcsT0FBSyxJQUFHO0FBQUMsVUFBRSxFQUFFLE1BQU0sQ0FBQztBQUFFLFVBQUcsS0FBSyxRQUFPO0FBQUMsWUFBRSxLQUFLO0FBQU8sWUFBRSxFQUFFO0FBQU8sY0FBTSxJQUFFLENBQUM7QUFBRSxpQkFBUSxJQUFFLEdBQUUsSUFBRSxHQUFFLElBQUUsR0FBRSxLQUFJO0FBQUMsZ0JBQU0sSUFBRSxFQUFFLENBQUM7QUFBRSxlQUFHLENBQUMsRUFBRSxDQUFDLE1BQUksRUFBRSxHQUFHLElBQUU7QUFBQSxRQUFFO0FBQUMsWUFBRTtBQUFBLE1BQUMsTUFBTSxLQUFFO0FBQUUsYUFBTztBQUFBLElBQUM7QUFBQyxXQUFPO0FBQUEsRUFBQztBQUFDLE1BQU0sS0FBRztBQUFULE1BQW9DLEtBQUc7QUFDaG9CLFdBQVMsRUFBRSxHQUFFLEdBQUU7QUFBQyxVQUFNLElBQUUsT0FBTyxLQUFLLENBQUMsR0FBRSxJQUFFLEVBQUUsUUFBTyxJQUFFLENBQUM7QUFBRSxRQUFJLElBQUUsSUFBRyxJQUFFO0FBQUUsYUFBUSxJQUFFLEdBQUUsR0FBRSxHQUFFLElBQUUsR0FBRSxJQUFJLEtBQUUsRUFBRSxDQUFDLElBQUcsSUFBRSxFQUFFLENBQUMsTUFBSSxFQUFFLEdBQUcsSUFBRSxFQUFFLElBQUUsWUFBVSxJQUFFLFlBQVUsQ0FBQyxHQUFFLEVBQUUsR0FBRyxJQUFFLEtBQUcsTUFBSSxJQUFFLE1BQUksTUFBSTtBQUFFLFVBQUksRUFBRSxHQUFHLElBQUUsRUFBRSxJQUFFLGFBQVcsSUFBRSxhQUFXLE1BQUksSUFBRSxHQUFHLEdBQUUsRUFBRSxDQUFDLElBQUU7QUFBSSxXQUFPO0FBQUEsRUFBQztBQUFDLFdBQVMsRUFBRSxHQUFFLEdBQUU7QUFBQyxhQUFRLElBQUUsR0FBRSxJQUFFLEVBQUUsUUFBTyxJQUFFLE1BQUksSUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLEdBQUUsRUFBRSxJQUFFLENBQUMsQ0FBQyxHQUFFLElBQUcsS0FBRyxFQUFFO0FBQUMsV0FBTztBQUFBLEVBQUM7QUFBQyxXQUFTLEVBQUUsR0FBRTtBQUFDLFdBQU8sSUFBSSxPQUFPLEdBQUUsR0FBRztBQUFBLEVBQUM7QUFBQyxXQUFTLEdBQUcsR0FBRTtBQUFDLFFBQUksSUFBRSxJQUFHLElBQUU7QUFBRyxhQUFRLElBQUUsR0FBRSxJQUFFLEVBQUUsUUFBTyxHQUFFLElBQUUsR0FBRSxJQUFJLEVBQUMsSUFBRSxFQUFFLENBQUMsT0FBSyxNQUFJLEtBQUcsSUFBRTtBQUFHLFdBQU87QUFBQSxFQUFDO0FBQUUsTUFBSSxLQUFHLEVBQUMsUUFBTyxJQUFHLEdBQUUsT0FBRyxHQUFFLEdBQUU7QUFBRSxXQUFTLEdBQUcsR0FBRTtBQUFDLFdBQU8sRUFBRSxLQUFLLE9BQU0sS0FBRyxHQUFHLFlBQVksR0FBRSxLQUFFO0FBQUEsRUFBQztBQUFFLE1BQU0sS0FBRyxDQUFDO0FBQVYsTUFBWSxJQUFFLENBQUM7QUFBRSxXQUFTLEdBQUcsR0FBRTtBQUFDLE1BQUUsR0FBRSxLQUFLO0FBQUUsTUFBRSxHQUFFLFFBQVE7QUFBRSxNQUFFLEdBQUUsUUFBUTtBQUFFLE1BQUUsR0FBRSxRQUFRO0FBQUUsTUFBRSxHQUFFLFFBQVE7QUFBQSxFQUFDO0FBQUMsV0FBUyxFQUFFLEdBQUUsR0FBRTtBQUFDLE1BQUUsSUFBRSxPQUFPLElBQUUsV0FBVTtBQUFDLFlBQU0sSUFBRSxNQUFLLElBQUU7QUFBVSxVQUFJLElBQUUsRUFBRSxFQUFFLFNBQU8sQ0FBQztBQUFFLFVBQUk7QUFBRSxRQUFFLENBQUMsTUFBSSxJQUFFLEdBQUUsT0FBTyxFQUFFLEVBQUUsU0FBTyxDQUFDO0FBQUcsVUFBRSxJQUFJLFFBQVEsU0FBUyxHQUFFO0FBQUMsbUJBQVcsV0FBVTtBQUFDLFlBQUUsUUFBTTtBQUFHLGdCQUFNLElBQUUsRUFBRSxDQUFDLEVBQUUsTUFBTSxHQUFFLENBQUM7QUFBRSxZQUFFLFFBQU07QUFBRyxZQUFFLENBQUM7QUFBQSxRQUFDLENBQUM7QUFBQSxNQUFDLENBQUM7QUFBRSxhQUFPLEtBQUcsRUFBRSxLQUFLLENBQUMsR0FBRSxRQUFNO0FBQUEsSUFBQztBQUFBLEVBQUM7QUFBRSxXQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLFVBQU0sSUFBRSxFQUFFO0FBQU8sUUFBSSxJQUFFLENBQUMsR0FBRSxHQUFFLEdBQUUsSUFBRTtBQUFFLFVBQUksSUFBRSxDQUFDO0FBQUcsYUFBUSxJQUFFLElBQUUsR0FBRSxLQUFHLEdBQUUsS0FBSTtBQUFDLFlBQU0sSUFBRSxFQUFFLENBQUMsR0FBRSxJQUFFLEVBQUUsUUFBTyxJQUFFLEVBQUU7QUFBRSxVQUFJLElBQUUsQ0FBQztBQUFFLGVBQVEsSUFBRSxHQUFFLElBQUUsR0FBRSxLQUFJO0FBQUMsY0FBTSxJQUFFLEVBQUUsQ0FBQyxHQUFFLElBQUUsRUFBRTtBQUFPLFlBQUcsRUFBRSxVQUFRLElBQUUsR0FBRSxHQUFFLEdBQUUsSUFBRSxHQUFFLElBQUksS0FBRyxJQUFFLEVBQUUsQ0FBQyxHQUFFLEdBQUU7QUFBQyxjQUFHLEVBQUUsQ0FBQyxHQUFFO0FBQUMsZ0JBQUcsQ0FBQztBQUFFLGtCQUFHLEVBQUU7QUFBQSx1QkFBWSxFQUFFLEdBQUcsSUFBRSxHQUFFLE1BQUksRUFBRSxRQUFPO0FBQUE7QUFBRSxnQkFBRyxLQUFHLEVBQUUsR0FBRSxDQUFDLElBQUU7QUFBRSxnQkFBRTtBQUFBLFVBQUU7QUFBQyxjQUFHLE1BQUksS0FBRyxFQUFFLENBQUMsS0FBRyxLQUFHLEdBQUUsRUFBRSxDQUFDLElBQUUsR0FBRSxJQUFFLElBQUc7QUFBQyxrQkFBTSxJQUFFLEVBQUUsSUFBRSxDQUFDLE1BQUksRUFBRSxJQUFFLENBQUMsSUFBRSxDQUFDO0FBQUcsY0FBRSxFQUFFLE1BQU0sSUFBRTtBQUFBLFVBQUM7QUFBQSxRQUFDLE1BQU0sR0FBRSxDQUFDLElBQUU7QUFBQSxNQUFDO0FBQUMsVUFBRyxFQUFFLE9BQUksSUFBRTtBQUFBLGVBQVcsQ0FBQyxFQUFFLFFBQU0sQ0FBQztBQUFFLFVBQUU7QUFBQSxJQUFDO0FBQUMsUUFBRyxFQUFFLFVBQVEsSUFBRSxFQUFFLFNBQU8sR0FBRSxHQUFFLEdBQUUsS0FBRyxHQUFFLEtBQUk7QUFBQyxVQUFFLEVBQUUsQ0FBQztBQUFFLFVBQUUsRUFBRTtBQUFPLGVBQVEsSUFBRSxHQUFFLEdBQUUsSUFBRSxHQUFFLElBQUksS0FBRyxJQUMvM0MsRUFBRSxDQUFDLEdBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRTtBQUFDLFlBQUcsRUFBRTtBQUFBLGlCQUFZLEVBQUUsR0FBRyxJQUFFLEdBQUUsTUFBSSxFQUFFLFFBQU87QUFBRSxVQUFFLENBQUMsSUFBRTtBQUFBLE1BQUM7QUFBQSxJQUFDO0FBQUMsV0FBTztBQUFBLEVBQUM7QUFBQyxXQUFTLEdBQUcsR0FBRSxHQUFFO0FBQUMsVUFBTSxJQUFFLEVBQUUsR0FBRSxJQUFFLEVBQUUsR0FBRSxJQUFFLENBQUM7QUFBRSxhQUFRLElBQUUsR0FBRSxJQUFFLEVBQUUsUUFBTyxJQUFJLEdBQUUsRUFBRSxDQUFDLENBQUMsSUFBRTtBQUFFLGFBQVEsSUFBRSxHQUFFLEdBQUUsSUFBRSxFQUFFLFFBQU8sS0FBSTtBQUFDLFVBQUUsRUFBRSxDQUFDO0FBQUUsZUFBUSxJQUFFLEdBQUUsR0FBRSxJQUFFLEVBQUUsUUFBTyxJQUFJLEtBQUUsRUFBRSxDQUFDLEdBQUUsRUFBRSxDQUFDLEtBQUcsQ0FBQyxFQUFFLENBQUMsTUFBSSxFQUFFLENBQUMsSUFBRSxHQUFFLEVBQUUsRUFBRSxNQUFNLElBQUU7QUFBQSxJQUFFO0FBQUMsV0FBTztBQUFBLEVBQUM7QUFBRSxXQUFTLEVBQUUsR0FBRTtBQUFDLFNBQUssSUFBRSxTQUFLLEtBQUc7QUFBRSxTQUFLLFFBQU0sRUFBRTtBQUFFLFNBQUssSUFBRSxDQUFDO0FBQUEsRUFBQztBQUFDLFdBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRTtBQUFDLE1BQUUsQ0FBQyxNQUFJLElBQUUsRUFBRTtBQUFPLFFBQUksSUFBRSxLQUFLLE1BQU0sSUFBSSxDQUFDO0FBQUUsVUFBSSxJQUFFLEtBQUssT0FBTyxHQUFFLEdBQUUsQ0FBQyxHQUFFLEtBQUssTUFBTSxJQUFJLEdBQUUsQ0FBQztBQUFHLFdBQU87QUFBQSxFQUFDO0FBQUMsSUFBRSxVQUFVLE1BQUksU0FBUyxHQUFFLEdBQUU7QUFBQyxRQUFHLENBQUMsS0FBSyxNQUFNLENBQUMsR0FBRTtBQUFDLFVBQUksSUFBRSxLQUFLLEVBQUU7QUFBTyxZQUFJLEtBQUssSUFBRSxPQUFPLEtBQUssTUFBTSxLQUFLLEVBQUUsSUFBRSxDQUFDLENBQUMsSUFBRTtBQUFJLFdBQUksRUFBRSxHQUFFLElBQUUsR0FBRSxJQUFJLE1BQUssRUFBRSxDQUFDLElBQUUsS0FBSyxFQUFFLElBQUUsQ0FBQztBQUFFLFdBQUssRUFBRSxDQUFDLElBQUU7QUFBQSxJQUFDO0FBQUMsU0FBSyxNQUFNLENBQUMsSUFBRTtBQUFBLEVBQUM7QUFBRSxJQUFFLFVBQVUsTUFBSSxTQUFTLEdBQUU7QUFBQyxVQUFNLElBQUUsS0FBSyxNQUFNLENBQUM7QUFBRSxRQUFHLEtBQUssS0FBRyxNQUFJLElBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxJQUFHO0FBQUMsWUFBTSxJQUFFLEtBQUssRUFBRSxJQUFFLENBQUM7QUFBRSxXQUFLLEVBQUUsSUFBRSxDQUFDLElBQUUsS0FBSyxFQUFFLENBQUM7QUFBRSxXQUFLLEVBQUUsQ0FBQyxJQUFFO0FBQUEsSUFBQztBQUFDLFdBQU87QUFBQSxFQUFDO0FBQUUsTUFBTSxLQUFHLEVBQUMsUUFBTyxFQUFDLFNBQVEsZUFBYyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsTUFBRSxHQUFFLGFBQVksRUFBQyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsT0FBRyxTQUFRLEVBQUMsT0FBTSxHQUFFLEdBQUUsRUFBQyxFQUFDLEdBQUUsT0FBTSxFQUFDLFNBQVEsZUFBYyxHQUFFLFVBQVMsR0FBRSxPQUFNLEVBQUMsU0FBUSxrQkFBaUIsR0FBRSxJQUFHLEdBQUUsR0FBRSxTQUFRLEVBQUMsT0FBTSxHQUFFLEdBQUUsRUFBQyxFQUFDLEdBQUUsV0FBVSxDQUFDLEVBQUM7QUFBRSxXQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZUFBVyxXQUFVO0FBQUMsWUFBTSxJQUFFLEVBQUUsSUFBRSxJQUFFLE1BQUksSUFBRSxHQUFFLEtBQUssVUFBVSxDQUFDLENBQUM7QUFBRSxXQUFHLEVBQUUsT0FBSyxFQUFFLEtBQUssV0FBVTtBQUFDLFVBQUUsT0FBTyxHQUFFLEdBQUUsR0FBRSxHQUFFLElBQUUsR0FBRSxDQUFDO0FBQUEsTUFBQyxDQUFDLElBQUUsRUFBRSxPQUFPLEdBQUUsR0FBRSxHQUFFLEdBQUUsSUFBRSxHQUFFLENBQUM7QUFBQSxJQUFDLENBQUM7QUFBQSxFQUFDO0FBQUUsV0FBUyxFQUFFLEdBQUUsR0FBRTtBQUFDLFFBQUcsRUFBRSxnQkFBZ0IsR0FBRyxRQUFPLElBQUksRUFBRSxDQUFDO0FBQUUsUUFBSTtBQUFFLFFBQUcsR0FBRTtBQUFDLFFBQUUsQ0FBQyxJQUFFLElBQUUsR0FBRyxDQUFDLEtBQUcsSUFBRSxFQUFFLFlBQVUsSUFBRSxPQUFPLE9BQU8sQ0FBQyxHQUFFLEVBQUUsQ0FBQyxHQUFFLENBQUM7QUFBRyxVQUFFLEVBQUU7QUFBUSxVQUFJLElBQUUsRUFBRTtBQUFLLFFBQUUsQ0FBQyxNQUFJLE9BQUssRUFBRSxRQUFRLEdBQUcsTUFBSSxLQUFHLGFBQVksSUFBRSxFQUFFLENBQUM7QUFBRyxRQUFFLENBQUMsTUFBSSxJQUFFLEdBQUcsQ0FBQztBQUFBLElBQUUsTUFBTSxLQUFFLENBQUM7QUFBRSxRQUFJLEdBQUUsR0FBRSxJQUFFLEVBQUUsV0FBUyxDQUFDO0FBQUUsU0FBSyxTQUFPLEVBQUUsVUFBUSxLQUFHLEVBQUUsVUFBUTtBQUFHLFNBQUssV0FBUyxLQUFHLEVBQUU7QUFBRSxTQUFLLElBQUUsSUFBRSxFQUFFLGNBQVk7QUFBRSxTQUFLLElBQUUsSUFBRSxLQUFHLEVBQUUsS0FBRyxFQUFFLFlBQVU7QUFBUyxTQUFLLFFBQU0sYUFBVyxLQUFHLEVBQUU7QUFBTSxTQUFLLElBQUUsRUFBRSxFQUFFLGFBQWE7QUFBRSxTQUFLLElBQUUsSUFBRSxFQUFFLEVBQUUsUUFBUTtBQUFFLFNBQUssSUFBRSxFQUFFLEVBQUUsVUFBVTtBQUFFLFNBQUssSUFBRSxFQUFFLGFBQVc7QUFBRSxTQUFLLElBQ3hvRCxFQUFFO0FBQU0sU0FBSyxNQUFJLElBQUUsRUFBRSxDQUFDLElBQUUsRUFBRTtBQUFFLFNBQUssSUFBRSxJQUFFLEVBQUUsY0FBWTtBQUFFLFNBQUssSUFBRSxJQUFFLEVBQUUsQ0FBQyxJQUFFLEVBQUU7QUFBRSxTQUFLLElBQUUsS0FBRyxFQUFFLEtBQUcsRUFBRTtBQUFJLFNBQUssS0FBRyxJQUFFLEVBQUUsV0FBUyxLQUFHLEVBQUUsTUFBSSxFQUFFLEdBQUUsS0FBRTtBQUFFLFNBQUssS0FBRyxJQUFFLEVBQUUsV0FBUyxLQUFHLEVBQUUsTUFBSSxFQUFFLEdBQUUsSUFBRTtBQUFFLFFBQUcsSUFBRSxJQUFFLEVBQUUsVUFBUSxLQUFHLEVBQUUsUUFBTztBQUFDLFVBQUU7QUFBRSxVQUFFLEVBQUU7QUFBRSxlQUFRLElBQUUsR0FBRSxJQUFFLEVBQUUsUUFBTyxJQUFFLEdBQUUsSUFBSSxHQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUU7QUFBRSxVQUFFO0FBQUEsSUFBQztBQUFDLFNBQUssU0FBTztBQUFFLFNBQUssU0FBTyxJQUFFLEVBQUUsVUFBUSxJQUFJLEVBQUUsQ0FBQztBQUFBLEVBQUM7QUFBQyxNQUFFLEVBQUU7QUFBVSxJQUFFLFNBQU8sU0FBUyxHQUFFLEdBQUU7QUFBQyxXQUFPLEtBQUssSUFBSSxHQUFFLEdBQUUsSUFBRTtBQUFBLEVBQUM7QUFDeFcsSUFBRSxNQUFJLFNBQVMsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLFFBQUcsTUFBSSxLQUFHLE1BQUksSUFBRztBQUFDLFVBQUcsQ0FBQyxLQUFHLENBQUMsS0FBRyxLQUFLLFNBQVMsQ0FBQyxFQUFFLFFBQU8sS0FBSyxPQUFPLEdBQUUsQ0FBQztBQUFFLFVBQUUsS0FBSyxPQUFPLENBQUM7QUFBRSxVQUFHLElBQUUsRUFBRSxRQUFPO0FBQUMsY0FBTSxJQUFFLEVBQUUsR0FBRSxJQUFFLEVBQUUsR0FBRSxJQUFFLEtBQUssT0FBTSxJQUFFLEtBQUs7QUFBRSxpQkFBUSxJQUFFLEdBQUUsSUFBRSxHQUFFLEtBQUk7QUFBQyxjQUFJLElBQUUsRUFBRSxLQUFLLElBQUUsSUFBRSxJQUFFLElBQUUsQ0FBQztBQUFFLGNBQUksSUFBRSxFQUFFO0FBQU8sY0FBRyxLQUFHLEtBQUcsS0FBSyxNQUFJLEtBQUcsQ0FBQyxFQUFFLENBQUMsSUFBRztBQUFDLGdCQUFJLElBQUUsRUFBRSxHQUFFLEdBQUUsQ0FBQyxHQUFFLElBQUU7QUFBRyxvQkFBTyxLQUFLLEdBQUU7QUFBQSxjQUFDLEtBQUs7QUFBTyxvQkFBRyxJQUFFLEdBQUU7QUFBQyx1QkFBSSxJQUFFLEdBQUUsSUFBRSxHQUFFLElBQUksVUFBUSxJQUFFLEdBQUUsSUFBRSxHQUFFLElBQUksS0FBRyxJQUFFLEtBQUcsS0FBSyxHQUFFO0FBQUMsd0JBQUksSUFBRSxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFFLHdCQUFFLEVBQUUsVUFBVSxHQUFFLENBQUM7QUFBRSxzQkFBRSxNQUFLLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLGtCQUFDO0FBQUM7QUFBQSxnQkFBSztBQUFBLGNBQUMsS0FBSztBQUFVLG9CQUFHLElBQUUsR0FBRTtBQUFDLHVCQUFJLElBQUUsSUFBRSxHQUFFLElBQUUsR0FBRSxJQUFJLEtBQUUsRUFBRSxDQUFDLElBQUUsR0FBRSxFQUFFLFVBQVEsS0FBSyxLQUFHO0FBQUEsb0JBQUU7QUFBQSxvQkFBSztBQUFBLG9CQUNuZjtBQUFBLG9CQUFFLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsb0JBQUU7QUFBQSxvQkFBRTtBQUFBLGtCQUFDO0FBQUUsc0JBQUU7QUFBQSxnQkFBRTtBQUFBLGNBQUMsS0FBSztBQUFVLG9CQUFHLElBQUUsR0FBRTtBQUFDLHVCQUFJLElBQUUsR0FBRSxJQUFFLEdBQUUsSUFBSSxNQUFHLEVBQUUsQ0FBQyxHQUFFLEVBQUUsVUFBUSxLQUFLLEtBQUcsRUFBRSxNQUFLLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFFO0FBQUEsZ0JBQUs7QUFBQSxjQUFDO0FBQVEsb0JBQUcsS0FBSyxNQUFJLElBQUUsS0FBSyxJQUFJLElBQUUsS0FBSyxFQUFFLEdBQUUsR0FBRSxDQUFDLElBQUUsR0FBRSxJQUFFLENBQUMsSUFBRyxFQUFFLE1BQUssR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDLEdBQUUsS0FBRyxJQUFFLEtBQUcsSUFBRSxJQUFFO0FBQUUsdUJBQUksSUFBRSxFQUFFLEdBQUUsSUFBRSxLQUFLLEdBQUUsSUFBRSxHQUFFLElBQUUsS0FBSyxJQUFJLElBQUUsR0FBRSxJQUFFLENBQUMsR0FBRSxFQUFFLENBQUMsSUFBRSxHQUFFLElBQUUsR0FBRSxJQUFFLEdBQUUsSUFBSSxNQUFJLElBQUUsRUFBRSxLQUFLLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLENBQUMsTUFBSSxFQUFFLFVBQVEsS0FBSyxLQUFHLENBQUMsRUFBRSxDQUFDLEdBQUU7QUFBQyxzQkFBRSxDQUFDLElBQUU7QUFBRSwwQkFBTSxJQUFFLEtBQUssS0FBRyxJQUFFO0FBQUUsc0JBQUUsTUFBSyxHQUFFLElBQUUsSUFBRSxHQUFFLEVBQUUsS0FBRyxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUcsR0FBRSxHQUFFLElBQUUsR0FBRSxJQUFFLENBQUMsR0FBRSxHQUFFLEdBQUUsSUFBRSxJQUFFLENBQUM7QUFBQSxrQkFBQztBQUFBO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQSxRQUFDO0FBQUMsYUFBSyxNQUFJLEtBQUssU0FBUyxDQUFDLElBQUU7QUFBQSxNQUFFO0FBQUEsSUFBQztBQUFDLFdBQU87QUFBQSxFQUFJO0FBQzViLFdBQVMsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxXQUFPLEtBQUcsSUFBRSxJQUFFLEtBQUcsS0FBRyxNQUFJLElBQUUsS0FBRyxLQUFHLE1BQUksSUFBRSxNQUFJLEtBQUcsS0FBRyxPQUFLLEtBQUcsS0FBRyxNQUFJLElBQUUsSUFBRTtBQUFBLEVBQUM7QUFBQyxXQUFTLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLFFBQUksSUFBRSxJQUFFLEVBQUUsSUFBRSxFQUFFO0FBQUksUUFBRyxDQUFDLEVBQUUsQ0FBQyxLQUFHLEtBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRSxNQUFJLElBQUUsRUFBRSxDQUFDLElBQUcsS0FBRyxJQUFFLEVBQUUsQ0FBQyxNQUFJLEVBQUUsQ0FBQyxJQUFFLEVBQUUsSUFBRyxFQUFFLENBQUMsSUFBRSxHQUFFLElBQUUsRUFBRSxDQUFDLE1BQUksRUFBRSxDQUFDLElBQUUsRUFBRSxNQUFJLEVBQUUsQ0FBQyxJQUFFLEdBQUUsSUFBRSxFQUFFLENBQUMsTUFBSSxFQUFFLENBQUMsSUFBRSxDQUFDLElBQUcsRUFBRSxNQUFJLElBQUUsRUFBRSxDQUFDLE1BQUksRUFBRSxDQUFDLElBQUUsQ0FBQyxLQUFJLEtBQUcsRUFBRSxTQUFTLENBQUMsTUFBSSxFQUFFLEVBQUUsTUFBTSxJQUFFLEdBQUUsRUFBRSxNQUFJLElBQUUsRUFBRSxTQUFTLENBQUMsTUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFFLENBQUMsSUFBRyxFQUFFLEVBQUUsTUFBTSxJQUFFO0FBQUEsRUFBRztBQUN4VyxJQUFFLFNBQU8sU0FBUyxHQUFFLEdBQUUsR0FBRTtBQUFDLFVBQUksQ0FBQyxLQUFHLEVBQUUsQ0FBQyxLQUFHLElBQUUsR0FBRSxJQUFFLEVBQUUsU0FBTyxFQUFFLENBQUMsTUFBSSxJQUFFO0FBQUksUUFBSSxJQUFFLENBQUMsR0FBRTtBQUFFLFFBQUksR0FBRSxJQUFFO0FBQUUsUUFBRyxHQUFFO0FBQUMsVUFBRSxFQUFFLFNBQU87QUFBRSxVQUFFLEVBQUU7QUFBTSxVQUFFLEVBQUUsVUFBUTtBQUFFLFVBQUksSUFBRSxFQUFFO0FBQVEsVUFBRSxFQUFFO0FBQUEsSUFBTztBQUFDLFFBQUcsTUFBSSxJQUFFLEtBQUssT0FBTyxLQUFHLENBQUMsR0FBRSxJQUFFLEVBQUUsUUFBTyxJQUFFLElBQUc7QUFBQyxVQUFFLEVBQUU7QUFBRSxVQUFJLElBQUUsQ0FBQztBQUFFLGVBQVEsSUFBRSxHQUFFLElBQUUsR0FBRSxHQUFFLElBQUUsR0FBRSxJQUFJLE1BQUksSUFBRSxFQUFFLENBQUMsTUFBSSxFQUFFLFVBQVEsS0FBSyxLQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBRyxLQUFLLEtBQUcsS0FBRyxLQUFLLElBQUksQ0FBQyxFQUFFLEdBQUUsR0FBRyxJQUFFLEdBQUUsRUFBRSxDQUFDLElBQUU7QUFBQSxVQUFPLFFBQU87QUFBRSxVQUFFO0FBQUUsVUFBRSxFQUFFO0FBQUEsSUFBTTtBQUFDLFFBQUcsQ0FBQyxFQUFFLFFBQU87QUFBRSxVQUFJLElBQUU7QUFBSyxRQUFFLEtBQUssU0FBTyxJQUFFLEtBQUcsVUFBSztBQUFFLFFBQUU7QUFBRSxRQUFJO0FBQUUsU0FBRyxJQUFFLEVBQUUsQ0FBQyxHQUFFLElBQUUsS0FBRyxJQUFFLEtBQUcsRUFBRSxLQUFLLEVBQUU7QUFBRSxhQUFRLEdBQUUsR0FBRSxJQUFFLEdBQUUsS0FBSTtBQUFDLFVBQUUsRUFBRSxDQUFDO0FBQUUsV0FBRyxJQUFFO0FBQUEsUUFBRztBQUFBLFFBQUs7QUFBQSxRQUFFO0FBQUEsUUFBRTtBQUFBLFFBQUU7QUFBQSxRQUFFLE1BQUk7QUFBQSxRQUFFO0FBQUEsUUFDcGY7QUFBQSxNQUFDLEdBQUUsS0FBRyxVQUFLLEtBQUcsRUFBRSxXQUFTLElBQUUsTUFBSSxJQUFFLEdBQUcsTUFBSyxHQUFFLEdBQUUsR0FBRSxHQUFFLE1BQUksR0FBRSxDQUFDO0FBQUUsVUFBRyxFQUFFLFFBQU87QUFBRSxVQUFHLEtBQUcsTUFBSSxJQUFFLEdBQUU7QUFBQyxZQUFFLEVBQUU7QUFBTyxZQUFHLENBQUMsR0FBRTtBQUFDLGNBQUcsR0FBRTtBQUFDLGdCQUFFO0FBQUUsZ0JBQUU7QUFBRztBQUFBLFVBQVE7QUFBQyxpQkFBTztBQUFBLFFBQUM7QUFBQyxZQUFHLE1BQUksRUFBRSxRQUFPLEdBQUcsRUFBRSxDQUFDLEdBQUUsR0FBRSxDQUFDO0FBQUEsTUFBQztBQUFBLElBQUM7QUFBQyxXQUFPLEdBQUcsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLEVBQUM7QUFDMUwsV0FBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLFFBQUksSUFBRSxDQUFDLEdBQUUsSUFBRSxJQUFFLEVBQUUsSUFBRSxFQUFFO0FBQUksTUFBRSxNQUFJLElBQUUsR0FBRyxHQUFFLEdBQUUsR0FBRSxFQUFFLENBQUM7QUFBRyxRQUFHLEdBQUU7QUFBQyxVQUFJLElBQUU7QUFBRSxZQUFNLElBQUUsS0FBSyxJQUFJLEVBQUUsUUFBTyxJQUFFLEVBQUUsSUFBRSxFQUFFLENBQUM7QUFBRSxlQUFRLElBQUUsR0FBRSxJQUFFLEdBQUUsR0FBRSxHQUFFLElBQUUsR0FBRSxJQUFJLEtBQUcsSUFBRSxFQUFFLENBQUM7QUFBRSxZQUFHLEVBQUUsTUFBSSxJQUFFLEdBQUcsR0FBRSxHQUFFLEdBQUUsRUFBRSxDQUFDLElBQUcsS0FBRyxLQUFHLE1BQUksSUFBRSxFQUFFLFFBQU8sS0FBRyxLQUFHLEtBQUcsR0FBRSxJQUFFLFNBQU8sSUFBRSxFQUFFLE1BQU0sQ0FBQyxHQUFFLElBQUUsS0FBSSxNQUFJLEVBQUUsR0FBRyxJQUFFLEdBQUUsTUFBSSxLQUFHLEVBQUUsUUFBTyxLQUFHLElBQUk7QUFBQTtBQUFNLFVBQUcsR0FBRTtBQUFDLFlBQUcsRUFBRSxRQUFPLEdBQUcsR0FBRSxHQUFFLENBQUM7QUFBRSxVQUFFLEVBQUUsTUFBTSxJQUFFO0FBQUU7QUFBQSxNQUFNO0FBQUEsSUFBQztBQUFDLFdBQU0sQ0FBQyxLQUFHO0FBQUEsRUFBQztBQUFDLFdBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRTtBQUFDLFFBQUUsTUFBSSxFQUFFLFNBQU8sRUFBRSxDQUFDLElBQUUsQ0FBQyxFQUFFLE9BQU8sTUFBTSxDQUFDLEdBQUUsQ0FBQztBQUFFLFdBQU8sS0FBRyxFQUFFLFNBQU8sSUFBRSxFQUFFLE1BQU0sR0FBRSxJQUFFLENBQUMsSUFBRTtBQUFBLEVBQUM7QUFDcGMsV0FBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxTQUFHLElBQUUsS0FBRyxJQUFFLEdBQUUsS0FBRyxJQUFFLEVBQUUsSUFBRSxJQUFFLENBQUMsTUFBSSxFQUFFLElBQUUsSUFBRSxDQUFDLEtBQUcsSUFBRSxFQUFFLENBQUM7QUFBRSxXQUFPO0FBQUEsRUFBQztBQUFDLElBQUUsVUFBUSxTQUFTLEdBQUU7QUFBQyxXQUFNLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQztBQUFBLEVBQUM7QUFBRSxJQUFFLFNBQU8sU0FBUyxHQUFFLEdBQUU7QUFBQyxXQUFPLEtBQUssT0FBTyxDQUFDLEVBQUUsSUFBSSxHQUFFLENBQUM7QUFBQSxFQUFDO0FBQ2hMLElBQUUsU0FBTyxTQUFTLEdBQUUsR0FBRTtBQUFDLFVBQU0sSUFBRSxLQUFLLFNBQVMsQ0FBQztBQUFFLFFBQUcsR0FBRTtBQUFDLFVBQUcsS0FBSyxFQUFFLFVBQVEsSUFBRSxHQUFFLEdBQUUsSUFBRSxFQUFFLFFBQU8sSUFBSSxLQUFFLEVBQUUsQ0FBQyxHQUFFLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFFLENBQUM7QUFBQSxVQUFPLEdBQUUsS0FBSyxLQUFJLEdBQUUsS0FBSyxHQUFFLEtBQUssQ0FBQyxHQUFFLEtBQUssU0FBTyxFQUFFLEtBQUssR0FBRSxHQUFFLEtBQUssR0FBRSxLQUFLLENBQUM7QUFBRSxXQUFHLE9BQU8sS0FBSyxTQUFTLENBQUM7QUFBRSxVQUFHLEtBQUssT0FBTTtBQUFDLFlBQUUsS0FBSztBQUFNLGlCQUFRLElBQUUsR0FBRSxHQUFFLEdBQUUsSUFBRSxFQUFFLEVBQUUsUUFBTyxJQUFJLEtBQUUsRUFBRSxFQUFFLENBQUMsR0FBRSxJQUFFLEVBQUUsTUFBTSxDQUFDLEdBQUUsRUFBRSxTQUFTLENBQUMsTUFBSSxFQUFFLEVBQUUsT0FBTyxLQUFJLENBQUMsR0FBRSxPQUFPLEVBQUUsTUFBTSxDQUFDO0FBQUEsTUFBRTtBQUFBLElBQUM7QUFBQyxXQUFPO0FBQUEsRUFBSTtBQUNuWCxXQUFTLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsUUFBSSxJQUFFO0FBQUUsUUFBRyxFQUFFLGdCQUFjLE1BQU0sS0FBRyxFQUFFLEtBQUUsRUFBRSxRQUFRLENBQUMsR0FBRSxPQUFLLElBQUUsSUFBRSxFQUFFLFdBQVMsRUFBRSxPQUFPLEdBQUUsQ0FBQyxHQUFFLE9BQUs7QUFBQSxTQUFRO0FBQUMsVUFBRSxLQUFLLElBQUksRUFBRSxRQUFPLENBQUM7QUFBRSxlQUFRLElBQUUsR0FBRSxHQUFFLElBQUUsR0FBRSxJQUFJLEtBQUcsSUFBRSxFQUFFLENBQUMsRUFBRSxLQUFFLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDLEdBQUUsS0FBRyxLQUFHLE9BQU8sRUFBRSxDQUFDO0FBQUEsSUFBQztBQUFBLFFBQU0sVUFBUSxLQUFLLEVBQUUsRUFBQyxJQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQyxNQUFJLE9BQU8sRUFBRSxDQUFDO0FBQUUsV0FBTztBQUFBLEVBQUM7QUFBQyxJQUFFLGNBQVk7QUFDL1IsSUFBRSxTQUFPLFNBQVMsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxRQUFJLElBQUU7QUFBRyxvQkFBYyxPQUFPLE1BQUksSUFBRSxJQUFJLFFBQVEsT0FBRztBQUFDLFVBQUU7QUFBQSxJQUFDLENBQUM7QUFBRyxRQUFJLEdBQUU7QUFBRSxZQUFPLE1BQUksSUFBRSxJQUFHO0FBQUEsTUFBQyxLQUFLO0FBQUUsWUFBRTtBQUFNLFlBQUcsS0FBSyxHQUFFO0FBQUMsY0FBRSxFQUFFO0FBQUUsbUJBQVEsS0FBSyxLQUFLLFNBQVMsR0FBRSxDQUFDLElBQUU7QUFBQSxRQUFDLE1BQU0sS0FBRSxLQUFLO0FBQVM7QUFBQSxNQUFNLEtBQUs7QUFBRSxZQUFFO0FBQU0sWUFBRSxFQUFDLEtBQUksR0FBRSxLQUFJLEtBQUssSUFBRSxJQUFFLEVBQUM7QUFBRTtBQUFBLE1BQU0sS0FBSztBQUFFLFlBQUU7QUFBTSxZQUFFLEtBQUs7QUFBSTtBQUFBLE1BQU0sS0FBSztBQUFFLFlBQUU7QUFBTSxZQUFFLEtBQUs7QUFBRTtBQUFBLE1BQU07QUFBUSx3QkFBYyxPQUFPLEtBQUcsS0FBRyxFQUFFO0FBQUU7QUFBQSxJQUFNO0FBQUMsT0FBRyxHQUFFLEtBQUcsTUFBSyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFFLFdBQU87QUFBQSxFQUFDO0FBQzVZLElBQUUsU0FBTyxTQUFTLEdBQUUsR0FBRTtBQUFDLFFBQUcsRUFBRSxTQUFPLEVBQUUsQ0FBQyxNQUFJLElBQUUsS0FBSyxNQUFNLENBQUMsSUFBRyxHQUFFO0FBQUEsTUFBQyxLQUFLO0FBQU0sYUFBSyxJQUFFLENBQUMsQ0FBQyxFQUFFO0FBQUk7QUFBQSxNQUFNLEtBQUs7QUFBTSxhQUFLLElBQUU7QUFBRyxhQUFLLFdBQVM7QUFBRTtBQUFBLE1BQU0sS0FBSztBQUFNLGFBQUssTUFBSTtBQUFFO0FBQUEsTUFBTSxLQUFLO0FBQU0sYUFBSyxJQUFFO0FBQUEsSUFBQztBQUFBLEVBQUM7QUFBRSxLQUFHLEVBQUUsU0FBUztBQUFFLFdBQVMsR0FBRyxHQUFFO0FBQUMsUUFBRSxFQUFFO0FBQUssUUFBSSxJQUFFLEtBQUs7QUFBTyxVQUFNLElBQUUsRUFBRTtBQUFLLFFBQUksSUFBRSxFQUFFO0FBQUssWUFBTyxHQUFFO0FBQUEsTUFBQyxLQUFLO0FBQU8sWUFBRSxFQUFFLFdBQVMsQ0FBQztBQUFFLFlBQUUsRUFBRTtBQUFRLFlBQUUsRUFBRTtBQUFPLFVBQUUsUUFBTTtBQUFHLGFBQUcsTUFBSSxFQUFFLFFBQVEsVUFBVSxNQUFJLEVBQUUsU0FBTyxTQUFTLFlBQVUsQ0FBQyxFQUFFO0FBQUcsYUFBRyxTQUFTLFlBQVUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxHQUFFLEtBQUssU0FBTyxJQUFJLEtBQUssV0FBVyxNQUFNLENBQUMsR0FBRSxPQUFPLEtBQUssY0FBWSxLQUFLLFNBQU8sSUFBSSxFQUFFLENBQUM7QUFBRTtBQUFBLE1BQU07QUFBUSxZQUFFLEVBQUUsSUFBRyxJQUFFLEVBQUUsQ0FBQyxFQUFFLE1BQU0sR0FBRSxDQUFDLEdBQUUsWUFBWSxhQUFXLElBQUUsRUFBQyxJQUFHLEdBQUUsS0FBSSxFQUFDLElBQUUsRUFBQyxJQUFHLEVBQUMsQ0FBQztBQUFBLElBQUM7QUFBQSxFQUFDO0FBQUUsTUFBSSxLQUFHO0FBQUUsV0FBUyxFQUFFLEdBQUU7QUFBQyxRQUFHLEVBQUUsZ0JBQWdCLEdBQUcsUUFBTyxJQUFJLEVBQUUsQ0FBQztBQUFFLFFBQUk7QUFBRSxRQUFFLEVBQUUsSUFBRSxFQUFFLE1BQU0sTUFBSSxFQUFFLFNBQU8sRUFBRSxTQUFTLEtBQUcsSUFBRSxDQUFDO0FBQUUsS0FBQyxLQUFHLFFBQU0sUUFBUSxjQUFZLElBQUUsRUFBRSxTQUFTO0FBQUcsVUFBTSxJQUFFLGdCQUFjLE9BQU8sVUFBUSxLQUFLLFNBQVEsSUFBRTtBQUFLLFNBQUssSUFBRSxHQUFHLEdBQUUsR0FBRSxFQUFFLE1BQU07QUFBRSxTQUFLLElBQUUsRUFBRTtBQUFFLFFBQUcsS0FBSyxHQUFFO0FBQUMsVUFBRyxFQUFFLE1BQUssRUFBRSxHQUFHLFdBQVUsU0FBUyxHQUFFO0FBQUMsVUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRztBQUFFLGVBQU8sRUFBRSxFQUFFLEVBQUUsRUFBRTtBQUFBLE1BQUMsQ0FBQztBQUFB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Q0FBQyxHQUFFLEdBQUUsQ0FBQyxJQUFFLEdBQ3p3QixLQUFLLE1BQUksRUFBRSxDQUFDLElBQUUsSUFBSSxFQUFFLENBQUMsR0FBRSxFQUFFLENBQUMsRUFBRSxNQUFJLEtBQUssSUFBRSxTQUFLLEtBQUssTUFBSSxFQUFFLENBQUMsSUFBRSxJQUFJLEVBQUUsR0FBRSxLQUFLLFFBQVEsSUFBRyxLQUFLLEVBQUUsQ0FBQyxJQUFFLEVBQUUsR0FBRSxLQUFLLENBQUMsR0FBRSxLQUFLLEVBQUUsQ0FBQyxJQUFFO0FBQUUsUUFBRyxLQUFLLEVBQUUsTUFBSSxJQUFFLEVBQUUsT0FBTSxFQUFFLENBQUMsTUFBSSxJQUFFLENBQUMsQ0FBQyxJQUFHLElBQUUsR0FBRSxJQUFFLEVBQUUsUUFBTyxJQUFJLE1BQUssRUFBRSxDQUFDLElBQUUsRUFBRSxFQUFFLENBQUMsR0FBRSxLQUFLLENBQUM7QUFBRSxTQUFLLFFBQU07QUFBQSxFQUFDO0FBQUMsV0FBUyxFQUFFLEdBQUUsR0FBRTtBQUFDLFVBQU0sSUFBRSxFQUFFLE1BQU0sR0FBRztBQUFFLFFBQUksSUFBRTtBQUFFLGFBQVEsSUFBRSxHQUFFLElBQUUsRUFBRSxRQUFPLElBQUksS0FBRSxFQUFFLENBQUMsR0FBRSxLQUFHLEVBQUUsUUFBUSxJQUFJLE1BQUksSUFBRSxFQUFFLFVBQVUsR0FBRSxFQUFFLFNBQU8sQ0FBQyxPQUFLLEVBQUUsQ0FBQyxJQUFFLE9BQUksTUFBSSxFQUFFLEdBQUcsSUFBRTtBQUFHLFFBQUUsRUFBRSxXQUFTLEVBQUUsU0FBTztBQUFHLFdBQU8sSUFBRSxJQUFFLElBQUUsRUFBRSxDQUFDO0FBQUEsRUFBQztBQUFDLFdBQVMsRUFBRSxHQUFFLEdBQUU7QUFBQyxRQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUUsRUFBRSxDQUFDO0FBQUEsUUFBTyxVQUFRLElBQUUsR0FBRSxLQUFHLElBQUUsRUFBRSxRQUFPLElBQUksS0FBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQUUsV0FBTztBQUFBLEVBQUM7QUFDNWUsV0FBUyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLFFBQUUsRUFBRSxDQUFDO0FBQUUsUUFBRyxNQUFJLEVBQUUsU0FBTyxFQUFFLEdBQUUsQ0FBQyxJQUFFO0FBQUEsYUFBVSxFQUFFLEtBQUcsRUFBRSxnQkFBYyxNQUFNLE1BQUksSUFBRSxFQUFFLENBQUMsSUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFFLElBQUUsR0FBRSxJQUFFLEVBQUUsUUFBTyxJQUFJLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsUUFBTyxLQUFFLEVBQUUsQ0FBQyxNQUFJLEVBQUUsQ0FBQyxJQUFFLEVBQUUsSUFBRyxJQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUUsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxFQUFDO0FBQUMsV0FBUyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLFFBQUcsSUFBRSxFQUFFLENBQUMsRUFBRSxLQUFHLE1BQUksRUFBRSxTQUFPLEdBQUU7QUFBQyxVQUFHLEVBQUUsZ0JBQWMsT0FBTTtBQUFDLFlBQUcsRUFBRSxDQUFDLEdBQUU7QUFBQyxlQUFJLElBQUUsR0FBRSxJQUFFLEVBQUUsUUFBTyxJQUFJLEdBQUUsSUFBSSxHQUFFLEVBQUUsQ0FBQyxHQUFFLE1BQUcsSUFBRTtBQUFFO0FBQUEsUUFBTTtBQUFDLFlBQUUsRUFBRSxLQUFLLEdBQUc7QUFBQSxNQUFDO0FBQUMsUUFBRSxJQUFJLEdBQUUsR0FBRSxHQUFFLElBQUU7QUFBQSxJQUFDLFdBQVMsRUFBRSxnQkFBYyxNQUFNLE1BQUksSUFBRSxHQUFFLElBQUUsRUFBRSxRQUFPLElBQUksR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxRQUFPLEtBQUUsRUFBRSxFQUFFLENBQUMsR0FBRSxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLEVBQUM7QUFBQyxNQUFFLEVBQUU7QUFDM2QsSUFBRSxNQUFJLFNBQVMsR0FBRSxHQUFFLEdBQUU7QUFBQyxNQUFFLENBQUMsTUFBSSxJQUFFLEdBQUUsSUFBRSxFQUFFLEdBQUUsS0FBSyxHQUFHO0FBQUcsUUFBRyxNQUFJLEtBQUcsTUFBSSxJQUFHO0FBQUMsVUFBRyxDQUFDLEtBQUcsS0FBSyxTQUFTLENBQUMsRUFBRSxRQUFPLEtBQUssT0FBTyxHQUFFLENBQUM7QUFBRSxlQUFRLElBQUUsR0FBRSxHQUFFLEdBQUUsSUFBRSxLQUFLLEVBQUUsUUFBTyxJQUFJLEtBQUUsS0FBSyxFQUFFLENBQUMsR0FBRSxJQUFFLEtBQUssRUFBRSxDQUFDLEdBQUUsRUFBRSxDQUFDLE1BQUksSUFBRSxDQUFDLENBQUMsSUFBRyxFQUFFLEdBQUUsR0FBRSxLQUFLLEdBQUUsR0FBRSxLQUFLLE1BQU0sQ0FBQyxHQUFFLEdBQUUsRUFBRSxDQUFDLEdBQUUsQ0FBQztBQUFFLFVBQUcsS0FBSyxHQUFFO0FBQUMsWUFBSSxJQUFFLEVBQUUsR0FBRSxLQUFLLENBQUMsR0FBRSxJQUFFLEVBQUU7QUFBRSxVQUFFLENBQUMsTUFBSSxJQUFFLENBQUMsQ0FBQztBQUFHLGlCQUFRLElBQUUsR0FBRSxHQUFFLEdBQUUsSUFBRSxFQUFFLFFBQU8sSUFBSSxLQUFHLElBQUUsRUFBRSxDQUFDLEdBQUUsQ0FBQyxFQUFFLENBQUMsTUFBSSxFQUFFLENBQUMsSUFBRSxHQUFFLElBQUUsS0FBSyxFQUFFLENBQUMsTUFBSSxLQUFLLEVBQUUsQ0FBQyxJQUFFLENBQUMsSUFBRyxDQUFDLEtBQUcsQ0FBQyxFQUFFLFNBQVMsQ0FBQztBQUFHLGNBQUcsRUFBRSxFQUFFLE1BQU0sSUFBRSxHQUFFLEtBQUssR0FBRTtBQUFDLGtCQUFNLElBQUUsS0FBSyxTQUFTLENBQUMsTUFBSSxLQUFLLFNBQVMsQ0FBQyxJQUFFLENBQUM7QUFBRyxjQUFFLEVBQUUsTUFBTSxJQUFFO0FBQUEsVUFBQztBQUFBO0FBQUEsTUFBQztBQUFDLFVBQUcsS0FBSyxVQUFRLENBQUMsS0FBRyxDQUFDLEtBQUssTUFBTSxDQUFDLElBQUc7QUFBQyxZQUFJO0FBQy9mLFlBQUcsS0FBSyxHQUFFO0FBQUMsY0FBRSxFQUFFO0FBQUUsbUJBQVEsSUFBRSxHQUFFLEdBQUUsSUFBRSxLQUFLLEVBQUUsUUFBTyxJQUFJLEtBQUUsS0FBSyxFQUFFLENBQUMsR0FBRSxFQUFFLENBQUMsSUFBRSxFQUFFLENBQUMsSUFBRSxFQUFFLENBQUMsSUFBRSxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsRUFBRSxDQUFDLENBQUM7QUFBQSxRQUFDO0FBQUMsYUFBSyxNQUFNLENBQUMsSUFBRSxLQUFHO0FBQUEsTUFBQztBQUFBLElBQUM7QUFBQyxXQUFPO0FBQUEsRUFBSTtBQUFFLElBQUUsU0FBTyxTQUFTLEdBQUUsR0FBRTtBQUFDLFdBQU8sS0FBSyxJQUFJLEdBQUUsR0FBRSxJQUFFO0FBQUEsRUFBQztBQUFFLElBQUUsU0FBTyxTQUFTLEdBQUUsR0FBRTtBQUFDLFdBQU8sS0FBSyxPQUFPLENBQUMsRUFBRSxJQUFJLEdBQUUsQ0FBQztBQUFBLEVBQUM7QUFDcE8sSUFBRSxTQUFPLFNBQVMsR0FBRTtBQUFDLE1BQUUsQ0FBQyxNQUFJLElBQUUsRUFBRSxHQUFFLEtBQUssR0FBRztBQUFHLFFBQUcsS0FBSyxTQUFTLENBQUMsR0FBRTtBQUFDLGVBQVEsSUFBRSxHQUFFLElBQUUsS0FBSyxFQUFFLFdBQVMsS0FBSyxNQUFNLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLEdBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRSxDQUFDLEtBQUssSUFBRyxJQUFJO0FBQUMsVUFBRyxLQUFLLEtBQUcsQ0FBQyxLQUFLLEVBQUUsVUFBUSxLQUFLLEtBQUssR0FBRTtBQUFDLFlBQUUsS0FBSyxFQUFFLENBQUM7QUFBRSxjQUFNLElBQUUsRUFBRSxRQUFRLENBQUM7QUFBRSxlQUFLLE1BQUksSUFBRSxFQUFFLFNBQU8sRUFBRSxPQUFPLEdBQUUsQ0FBQyxJQUFFLE9BQU8sS0FBSyxFQUFFLENBQUM7QUFBQSxNQUFFO0FBQUMsV0FBSyxTQUFPLE9BQU8sS0FBSyxNQUFNLENBQUM7QUFBRSxhQUFPLEtBQUssU0FBUyxDQUFDO0FBQUEsSUFBQztBQUFDLFdBQU87QUFBQSxFQUFJO0FBQ3ZWLElBQUUsU0FBTyxTQUFTLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxVQUFJLENBQUMsS0FBRyxFQUFFLENBQUMsS0FBRyxJQUFFLEdBQUUsSUFBRSxNQUFJLEVBQUUsQ0FBQyxNQUFJLElBQUUsR0FBRSxJQUFFO0FBQUksUUFBSSxJQUFFLENBQUMsR0FBRSxJQUFFLENBQUMsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxJQUFFO0FBQUUsUUFBRyxFQUFFLEtBQUcsRUFBRSxnQkFBYyxNQUFNLEtBQUUsR0FBRSxJQUFFO0FBQUEsU0FBUztBQUFDLFVBQUUsRUFBRSxTQUFPO0FBQUUsV0FBRyxJQUFFLEVBQUUsVUFBUSxFQUFFLFNBQU8sRUFBRTtBQUFNLFVBQUUsRUFBRTtBQUFJLFVBQUUsS0FBSyxTQUFPLEVBQUU7QUFBTyxVQUFFLFVBQVEsRUFBRTtBQUFLLFVBQUUsRUFBRSxTQUFPLEtBQUc7QUFBSSxVQUFFLEVBQUUsVUFBUTtBQUFFLFVBQUcsTUFBSSxFQUFFLENBQUMsTUFBSSxJQUFFLENBQUMsQ0FBQyxJQUFHLENBQUMsSUFBRztBQUFDLGlCQUFRLElBQUUsR0FBRSxHQUFFLElBQUUsRUFBRSxRQUFPLElBQUksS0FBRyxJQUFFLEdBQUcsS0FBSyxNQUFLLEVBQUUsQ0FBQyxHQUFFLEdBQUUsR0FBRSxDQUFDLEVBQUUsR0FBRSxFQUFFLE1BQU0sSUFBRSxHQUFFO0FBQUksZUFBTyxJQUFFLElBQUUsQ0FBQztBQUFBLE1BQUM7QUFBQyxRQUFFLENBQUMsTUFBSSxJQUFFLENBQUMsQ0FBQztBQUFBLElBQUU7QUFBQyxVQUFJLElBQUUsS0FBSztBQUFHLFFBQUUsTUFBSSxJQUFFLEVBQUUsVUFBUSxLQUFHLElBQUUsRUFBRTtBQUFRLFVBQU0sSUFBRSxDQUFDLE1BQUksS0FBSyxLQUFHLEtBQUssVUFBUSxDQUFDO0FBQUUsYUFBUSxJQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsSUFDdGYsRUFBRSxRQUFPLEtBQUk7QUFBQyxVQUFJO0FBQUUsVUFBRSxFQUFFLENBQUM7QUFBRSxRQUFFLENBQUMsTUFBSSxJQUFFLEdBQUUsSUFBRSxFQUFFLE9BQU0sSUFBRSxFQUFFLFNBQU8sR0FBRSxJQUFFLEVBQUUsU0FBTyxHQUFFLElBQUUsRUFBRSxVQUFRO0FBQUcsVUFBRyxFQUFFLEdBQUUsQ0FBQyxJQUFFLEtBQUssTUFBTSxDQUFDLEVBQUUsWUFBWSxHQUFFLEdBQUUsS0FBRyxDQUFDO0FBQUEsV0FBTTtBQUFDLFlBQUUsSUFBRSxFQUFFLENBQUMsSUFBRSxJQUFFLEtBQUssTUFBTSxDQUFDLEVBQUUsT0FBTyxHQUFFLEdBQUUsS0FBRyxDQUFDO0FBQUUsWUFBRSxLQUFHLEVBQUU7QUFBTyxZQUFHLEtBQUcsR0FBRTtBQUFDLGdCQUFNLElBQUUsQ0FBQztBQUFFLGNBQUksSUFBRTtBQUFFLGdCQUFJLEVBQUUsQ0FBQyxJQUFFLENBQUMsQ0FBQztBQUFHLG1CQUFRLElBQUUsR0FBRSxJQUFHLEdBQUUsSUFBRSxFQUFFLFFBQU8sSUFBSSxLQUFHLEtBQUcsRUFBRSxDQUFDLEdBQUUsS0FBRyxJQUFFLEtBQUssRUFBRSxFQUFFLE1BQUksRUFBRSxPQUFPLE1BQUksRUFBRSxFQUFFLE1BQU0sSUFBRSxJQUFFLENBQUMsQ0FBQyxJQUFFO0FBQUUsZ0JBQUksSUFBRSxJQUFFLEdBQUcsR0FBRSxLQUFHLEtBQUksS0FBRyxDQUFDLElBQUUsR0FBRyxHQUFFLENBQUMsR0FBRSxJQUFFLEVBQUU7QUFBQSxRQUFPO0FBQUMsWUFBRyxFQUFFLEdBQUUsQ0FBQyxJQUFFLEdBQUUsRUFBRSxHQUFHLElBQUU7QUFBQSxpQkFBVSxFQUFFLFFBQU0sQ0FBQztBQUFBLE1BQUM7QUFBQSxJQUFDO0FBQUMsUUFBRyxHQUFFO0FBQUMsWUFBTSxJQUFFO0FBQUssYUFBTyxJQUFJLFFBQVEsU0FBUyxHQUFFO0FBQUMsZ0JBQVEsSUFBSSxDQUFDLEVBQUUsS0FBSyxTQUFTLEdBQUU7QUFBQyxZQUFFLEVBQUU7QUFBQSxZQUFPO0FBQUEsWUFDaGdCO0FBQUEsWUFBRTtBQUFBLFlBQUU7QUFBQSxVQUFDLENBQUM7QUFBQSxRQUFDLENBQUM7QUFBQSxNQUFDLENBQUM7QUFBQSxJQUFDO0FBQUMsUUFBRyxDQUFDLEVBQUUsUUFBTSxDQUFDO0FBQUUsUUFBRyxNQUFJLENBQUMsS0FBRyxDQUFDLEtBQUssT0FBTyxRQUFPLEVBQUUsQ0FBQztBQUFFLGFBQVEsSUFBRSxHQUFFLEdBQUUsSUFBRSxFQUFFLFFBQU8sS0FBSTtBQUFDLFVBQUUsRUFBRSxDQUFDO0FBQUUsUUFBRSxVQUFRLE1BQUksSUFBRSxHQUFHLEtBQUssTUFBSyxDQUFDO0FBQUcsVUFBRyxFQUFFLFFBQU87QUFBRSxRQUFFLENBQUMsSUFBRSxFQUFDLE9BQU0sRUFBRSxDQUFDLEdBQUUsUUFBTyxFQUFDO0FBQUEsSUFBQztBQUFDLFdBQU87QUFBQSxFQUFDO0FBQUUsV0FBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxRQUFJLElBQUUsS0FBSyxFQUFFLENBQUMsR0FBRSxJQUFFLEtBQUcsRUFBRSxTQUFPO0FBQUUsUUFBRyxLQUFHLElBQUUsR0FBRTtBQUFDLFVBQUcsSUFBRSxLQUFHLEVBQUUsS0FBRSxFQUFFLE1BQU0sR0FBRSxJQUFFLENBQUM7QUFBRSxZQUFJLElBQUUsR0FBRyxLQUFLLE1BQUssQ0FBQztBQUFHLGFBQU0sRUFBQyxLQUFJLEdBQUUsUUFBTyxFQUFDO0FBQUEsSUFBQztBQUFBLEVBQUM7QUFBQyxXQUFTLEdBQUcsR0FBRTtBQUFDLFVBQU0sSUFBRSxNQUFNLEVBQUUsTUFBTTtBQUFFLGFBQVEsSUFBRSxHQUFFLEdBQUUsSUFBRSxFQUFFLFFBQU8sSUFBSSxLQUFFLEVBQUUsQ0FBQyxHQUFFLEVBQUUsQ0FBQyxJQUFFLEVBQUMsSUFBRyxHQUFFLEtBQUksS0FBSyxNQUFNLENBQUMsRUFBQztBQUFFLFdBQU87QUFBQSxFQUFDO0FBQUMsSUFBRSxVQUFRLFNBQVMsR0FBRTtBQUFDLFdBQU0sQ0FBQyxD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QztBQUFFLE1BQUksS0FBRyxFQUFDLFFBQU8sSUFBRyxHQUFFLE9BQUcsR0FBRSxTQUFRO0FBQUUsTUFBTSxLQUFHO0FBQVQsTUFBc0IsS0FBRyxFQUFDLEdBQUUsS0FBSSxHQUFFLEtBQUksR0FBRSxLQUFJLEdBQUUsS0FBSSxHQUFFLEtBQUksUUFBUyxLQUFJLEdBQUUsS0FBSSxHQUFFLEtBQUksR0FBRSxLQUFJLEdBQUUsS0FBSSxHQUFFLEtBQUksR0FBRSxLQUFJLEdBQUUsS0FBSSxHQUFFLEtBQUksR0FBRSxJQUFHO0FBQUUsV0FBUyxHQUFHLEdBQUU7QUFBQyxRQUFFLEdBQUcsS0FBSyxNQUFLLENBQUMsRUFBRSxLQUFLLEdBQUc7QUFBRSxVQUFNLElBQUUsQ0FBQztBQUFFLFFBQUcsR0FBRTtBQUFDLFlBQU0sSUFBRSxFQUFFLE1BQU0sRUFBRSxHQUFFLElBQUUsRUFBRTtBQUFPLGVBQVEsSUFBRSxHQUFFLEdBQUUsSUFBRSxHQUFFLElBQUUsR0FBRSxJQUFJLE1BQUksSUFBRSxFQUFFLENBQUMsT0FBSyxDQUFDLEtBQUssVUFBUSxDQUFDLEtBQUssT0FBTyxDQUFDLElBQUc7QUFBQyxZQUFFLEVBQUUsQ0FBQztBQUFFLFlBQUksSUFBRSxHQUFHLENBQUMsS0FBRyxHQUFFLElBQUU7QUFBRSxpQkFBUSxJQUFFLEdBQUUsSUFBRSxFQUFFLFFBQU8sS0FBSTtBQUFDLGNBQUUsRUFBRSxDQUFDO0FBQUUsZ0JBQU0sSUFBRSxHQUFHLENBQUMsS0FBRztBQUFFLGVBQUcsTUFBSSxNQUFJLEtBQUcsR0FBRSxJQUFFO0FBQUEsUUFBRTtBQUFDLFVBQUUsR0FBRyxJQUFFO0FBQUEsTUFBQztBQUFBLElBQUM7QUFBQyxXQUFPO0FBQUEsRUFBQztBQUFFLE1BQUksS0FBRyxFQUFDLFFBQU8sSUFBRyxHQUFFLE9BQUcsR0FBRSxHQUFFO0FBQUUsTUFBTSxLQUFHLENBQUMsRUFBRSxJQUFJLEdBQUUsS0FBSSxFQUFFLElBQUksR0FBRSxLQUFJLEVBQUUsSUFBSSxHQUFFLEtBQUksRUFBRSxJQUFJLEdBQUUs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
