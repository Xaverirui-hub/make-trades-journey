/* =====================================================================
   MTJ 测验插图 —— 看图作答用的小图产生器

   为什么存在:测验原本全是文字,一题四个选项读下来很累,而交易本来是
   看图的事。与其把「双顶长什么样」写成一段文字,不如直接画给他看。

   为什么是共用档而不是写进每一课:25 门课都要用,内嵌就是 25 份副本。
   这里跟 nav.js 一样,一个档全站共用。

   用法:题目资料里放一个 fig 规格,渲染器呼叫
     MTJQuizFig(spec)            → 回传 <svg> 字串(题目上方的大图)
     MTJQuizFig(spec, {mini:1})  → 小一号(当四个选项用)

   规格是宣告式的,题目资料才不会变成一大坨座标:
     { k:[收盘价...],                    K 线
       ma:[{p:6,role:'fast'},...],       叠在 K 线上的 EMA
       osc:{k:[...],d:[...]},            震荡指标面板(0–100,含 20/50/80)
       hist:{bars:[...],line:[...],sig:[...]},  柱状图 + 两条线
       lv:[{p:价位,kind:'res'|'sup',t:'标签'}],
       zone:[{from:,to:,kind:,t:}],
       band:true,                        布林带(由 k 自动算)
       mark:[{x:0~1,t:'标签',c:'gold',dir:'up'}],
       veil:0.72                         盖住右边 28%,问「接下来会怎样」
     }
   ===================================================================== */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var C = {
    bull: '#2CD98A', bear: '#FF5C63', gold: '#E8C877', goldB: '#FCE9A8',
    cyan: '#2FE0D6', violet: '#9B6BF2', text: '#EDEBE2',
    muted: '#9A968C', muted2: '#6f6c64', line: 'rgba(255,255,255,.08)'
  };
  /* 快线金、慢线紫 —— 与课程内的图同一套规矩,学员不用重新认颜色 */
  var ROLE = { fast: C.gold, slow: C.violet, k: C.cyan, d: C.gold, price: C.text };

  var MONO = "'JetBrains Mono',monospace";
  var SANS = "'Noto Sans SC',sans-serif";

  function esc(v) { return Math.round(v * 10) / 10; }
  function el(tag, attrs, kids) {
    var s = '<' + tag;
    for (var k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) s += ' ' + k + '="' + attrs[k] + '"';
    return kids !== undefined ? s + '>' + kids + '</' + tag + '>' : s + '/>';
  }
  function txt(x, y, str, o) {
    o = o || {};
    return el('text', {
      x: esc(x), y: esc(y), 'text-anchor': o.a || 'middle',
      'font-family': o.cjk ? SANS : MONO, 'font-size': o.s || 9.5,
      'font-weight': o.w || 600, fill: o.c || C.muted,
      'letter-spacing': o.ls || null
    }, String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;'));
  }

  function ema(arr, p) {
    var out = [], k = 2 / (p + 1), e = arr[0];
    for (var i = 0; i < arr.length; i++) { e = i ? arr[i] * k + e * (1 - k) : arr[0]; out.push(e); }
    return out;
  }
  function sma(arr, w, i) {
    var s = arr.slice(Math.max(0, i - w + 1), i + 1);
    return s.reduce(function (a, b) { return a + b; }, 0) / s.length;
  }
  function sd(arr, w, i) {
    var s = arr.slice(Math.max(0, i - w + 1), i + 1);
    var m = s.reduce(function (a, b) { return a + b; }, 0) / s.length;
    return Math.sqrt(s.reduce(function (a, b) { return a + (b - m) * (b - m); }, 0) / s.length);
  }

  /* 由收盘价推出 OHLC —— 固定乱数,同一题每次画出来都一样,
     否则学员重看会看到不同的图,答案就对不上了 */
  function ohlc(closes, seed) {
    var rnd = seed || 7;
    function rand() { rnd = (rnd * 9301 + 49297) % 233280; return rnd / 233280; }
    var span = Math.max.apply(null, closes) - Math.min.apply(null, closes) || 1;
    return closes.map(function (c, i) {
      var o = i ? closes[i - 1] : c - (closes[1] - closes[0]) * 0.6;
      var amp = Math.abs(c - o) * 0.55 + span * 0.03;
      return { o: o, c: c,
               h: Math.max(o, c) + amp * (0.35 + rand() * 0.8),
               l: Math.min(o, c) - amp * (0.35 + rand() * 0.8) };
    });
  }

  function MTJQuizFig(spec, opt) {
    opt = opt || {};
    var mini = !!opt.mini;
    var W = opt.w || (mini ? 300 : 640);
    var H = opt.h || (mini ? 132 : 240);
    var padL = mini ? 8 : 14, padR = mini ? 8 : 14;
    var padT = mini ? 10 : 18, padB = mini ? 10 : 22;

    var out = '';
    /* 各面板把「x 比例 → y 像素」登记进来,mark 才贴得到线上 */
    var ATTACH = {};
    var hasOsc = !!spec.osc, hasHist = !!spec.hist;
    var priceH, oscTop = 0;
    if (hasOsc || hasHist) { priceH = (H - padT - padB) * (spec.k ? 0.58 : 0); oscTop = padT + priceH + (spec.k ? 10 : 0); }
    else priceH = H - padT - padB;

    /* ---------- 价格面板 ---------- */
    var X, Y, n;
    if ((spec.k && spec.k.length) || (spec.ohlc && spec.ohlc.length)) {
      /* ohlc 是逐根指定的:认形态的题要精确的实体/影线比例,由收盘价反推做不到 */
      var raw = spec.ohlc || null;
      var k = raw ? raw.map(function (c) { return c.c; }) : spec.k;
      n = k.length;
      var vals = raw ? raw.reduce(function (a, c) { return a.concat([c.o, c.h, c.l, c.c]); }, []) : k.slice();
      var mas = (spec.ma || []).map(function (m) { return { d: ema(k, m.p), role: m.role || 'fast', p: m.p }; });
      mas.forEach(function (m) { vals = vals.concat(m.d); });
      var bU, bM, bL;
      if (spec.band) {
        bM = k.map(function (_, i) { return sma(k, 20 > n ? Math.max(4, Math.floor(n / 2)) : 20, i); });
        var w = 20 > n ? Math.max(4, Math.floor(n / 2)) : 20;
        bU = k.map(function (_, i) { return bM[i] + 2 * sd(k, w, i); });
        bL = k.map(function (_, i) { return bM[i] - 2 * sd(k, w, i); });
        vals = vals.concat(bU).concat(bL);
      }
      (spec.lv || []).forEach(function (l) { vals.push(l.p); });
      (spec.tl || []).forEach(function (t) { vals.push(t.p1, t.p2); });
      if (spec.cloud) vals = vals.concat(spec.cloud.a).concat(spec.cloud.b);
      (spec.zone || []).forEach(function (z) { vals.push(z.from, z.to); });
      var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
      var pd = (mx - mn) * 0.12 || 1; mn -= pd; mx += pd;
      var pw = W - padL - padR;
      X = function (i) { return padL + pw * (i + 0.5) / n; };
      Y = function (v) { return padT + (mx - v) / (mx - mn) * priceH; };
      /* 宽度上限本来是照密集排列设的;只有一两根时那样会细得像根针 */
      var cap = n <= 3 ? (mini ? 26 : 46) : (mini ? 8 : 14);
      var bw = Math.min(pw / n * 0.55, cap);
      ATTACH.k = function (fx) { return Y(k[Math.min(n - 1, Math.round(fx * (n - 1)))]); };
      if (mas.length) { ATTACH.fast = function (fx) { return Y(mas[0].d[Math.min(n - 1, Math.round(fx * (n - 1)))]); };
        if (mas[1]) ATTACH.slow = function (fx) { return Y(mas[1].d[Math.min(n - 1, Math.round(fx * (n - 1)))]); }; }

      /* 区间 / 价位线画在最底下 */
      (spec.zone || []).forEach(function (z) {
        var col = z.kind === 'sup' ? C.bull : z.kind === 'res' ? C.bear : C.gold;
        out += el('rect', { x: padL, y: esc(Y(z.to)), width: esc(pw), height: esc(Math.abs(Y(z.from) - Y(z.to))),
                            rx: 4, fill: col, 'fill-opacity': .1, stroke: col, 'stroke-opacity': .34 });
        if (z.t && !mini) out += txt(padL + 6, Y(z.to) - 5, z.t, { a: 'start', c: col, s: 9, cjk: /[一-龥]/.test(z.t) });
      });
      /* 云:两条先行带之间填色。A 在 B 上是青(上升云),在下是红。
         中途可能换色,所以逐段切开画 —— 整片一个颜色会把交叉那一刻抹掉。 */
      if (spec.cloud) {
        var ca = spec.cloud.a, cb = spec.cloud.b, cn = Math.min(ca.length, cb.length);
        var run = [], runUp = ca[0] >= cb[0];
        var flush = function () {
          if (run.length < 2) { run = []; return; }
          var top = run.map(function (i) { return (i === run[0] ? 'M' : 'L') + esc(X(i)) + ',' + esc(Y(ca[i])); }).join(' ');
          var bot = run.slice().reverse().map(function (i) { return 'L' + esc(X(i)) + ',' + esc(Y(cb[i])); }).join(' ');
          out += el('path', { d: top + ' ' + bot + ' Z', fill: runUp ? C.cyan : C.bear,
                              'fill-opacity': .16, stroke: 'none' });
          run = [];
        };
        for (var ci = 0; ci < cn; ci++) {
          var up = ca[ci] >= cb[ci];
          if (up !== runUp) { if (run.length) { run.push(ci); flush(); } runUp = up; }
          run.push(ci);
        }
        flush();
        /* 云的两条边界线画细一点 —— 主角是那片色块 */
        [[ca, C.cyan], [cb, C.bear]].forEach(function (pair) {
          out += el('path', { d: pair[0].slice(0, cn).map(function (v, i) { return (i ? 'L' : 'M') + esc(X(i)) + ',' + esc(Y(v)); }).join(' '),
                              stroke: pair[1], 'stroke-width': 1, fill: 'none', 'stroke-opacity': .5 });
        });
      }
      /* 斜线:趋势线、通道边。x 用 0~1 的比例,p 用价格 */
      (spec.tl || []).forEach(function (t) {
        var tcol = t.kind === 'bad' ? C.bear : t.kind === 'sup' ? C.bull : C.gold;
        var xa = padL + pw * t.x1, xb = padL + pw * t.x2;
        out += el('line', { x1: esc(xa), y1: esc(Y(t.p1)), x2: esc(xb), y2: esc(Y(t.p2)),
          stroke: tcol, 'stroke-width': mini ? 1.5 : 2,
          'stroke-dasharray': t.dash ? '5 4' : null,
          'stroke-opacity': t.kind === 'bad' ? .9 : .85 });
        if (t.t && !mini) out += txt(xb - 4, Y(t.p2) - 7, t.t, { a: 'end', c: tcol, s: 9, cjk: /[一-龥]/.test(t.t) });
      });
      (spec.lv || []).forEach(function (l) {
        var col = l.kind === 'sup' ? C.bull : l.kind === 'res' ? C.bear : C.gold;
        out += el('line', { x1: padL, x2: W - padR, y1: esc(Y(l.p)), y2: esc(Y(l.p)),
                            stroke: col, 'stroke-width': 1.2, 'stroke-dasharray': '5 4', 'stroke-opacity': .8 });
        if (l.t && !mini) out += txt(padL + 6, Y(l.p) - 5, l.t, { a: 'start', c: col, s: 9, cjk: /[一-龥]/.test(l.t) });
      });

      if (spec.band) {
        var up = bU.map(function (v, i) { return (i ? 'L' : 'M') + esc(X(i)) + ',' + esc(Y(v)); }).join(' ');
        var lo = bL.map(function (v, i) { return (i ? 'L' : 'M') + esc(X(i)) + ',' + esc(Y(v)); }).join(' ');
        var loRev = bL.map(function (v, i) { return 'L' + esc(X(n - 1 - i)) + ',' + esc(Y(bL[n - 1 - i])); }).join(' ');
        out += el('path', { d: up + ' ' + loRev + ' Z', fill: C.gold, 'fill-opacity': .06, stroke: 'none' });
        out += el('path', { d: up, stroke: C.gold, 'stroke-width': 1.4, fill: 'none' });
        out += el('path', { d: lo, stroke: C.gold, 'stroke-width': 1.4, fill: 'none' });
        out += el('path', { d: bM.map(function (v, i) { return (i ? 'L' : 'M') + esc(X(i)) + ',' + esc(Y(v)); }).join(' '),
                            stroke: C.cyan, 'stroke-width': 1.4, fill: 'none', 'stroke-dasharray': '5 4' });
      }

      /* K 线 */
      (raw || ohlc(k, spec.seed)).forEach(function (c, i) {
        var col = c.c >= c.o ? C.bull : C.bear, x = X(i);
        out += el('line', { x1: esc(x), x2: esc(x), y1: esc(Y(c.h)), y2: esc(Y(c.l)), stroke: col, 'stroke-width': 1.2 });
        out += el('rect', { x: esc(x - bw / 2), y: esc(Y(Math.max(c.o, c.c))), width: esc(bw),
                            height: esc(Math.max(Math.abs(Y(c.o) - Y(c.c)), 1.6)), rx: 1.6, fill: col });
      });

      /* 均线 */
      mas.forEach(function (m) {
        out += el('path', { d: m.d.map(function (v, i) { return (i ? 'L' : 'M') + esc(X(i)) + ',' + esc(Y(v)); }).join(' '),
                            stroke: ROLE[m.role] || C.gold, 'stroke-width': mini ? 1.6 : 2.1, fill: 'none' });
      });
      /* 均线名只在大图标,小图靠颜色分辨就够 */
      if (!mini && mas.length) {
        mas.forEach(function (m, i) {
          var last = m.d[n - 1];
          out += txt(W - padR - 2, Y(last) + 3.4,
            (m.role === 'fast' ? 'fast 快线' : 'slow 慢线'),
            { a: 'end', c: ROLE[m.role], s: 8.5, cjk: true });
        });
      }
    }

    /* ---------- 震荡指标面板 ---------- */
    if (hasOsc) {
      var oh = H - padB - oscTop;
      var ok = spec.osc.k || [], od = spec.osc.d || [];
      var on = Math.max(ok.length, od.length);
      var oX = function (i) { return padL + (W - padL - padR) * (i + 0.5) / on; };
      var oY = function (v) { return oscTop + (100 - v) / 100 * oh; };
      ATTACH.oscK = function (fx) { return ok.length ? oY(ok[Math.min(ok.length - 1, Math.round(fx * (ok.length - 1)))]) : null; };
      ATTACH.oscD = function (fx) { return od.length ? oY(od[Math.min(od.length - 1, Math.round(fx * (od.length - 1)))]) : null; };
      [20, 50, 80].forEach(function (lv) {
        out += el('line', { x1: padL, x2: W - padR, y1: esc(oY(lv)), y2: esc(oY(lv)),
                            stroke: lv === 50 ? C.muted2 : C.muted2, 'stroke-width': 1,
                            'stroke-dasharray': lv === 50 ? '2 5' : '4 4', 'stroke-opacity': lv === 50 ? .5 : .75 });
        if (!mini) out += txt(padL - 2, oY(lv) + 3, lv, { a: 'end', c: C.muted2, s: 8.5 });
      });
      [[ok, ROLE.k], [od, ROLE.d]].forEach(function (pair) {
        if (!pair[0].length) return;
        out += el('path', { d: pair[0].map(function (v, i) { return (i ? 'L' : 'M') + esc(oX(i)) + ',' + esc(oY(v)); }).join(' '),
                            stroke: pair[1], 'stroke-width': mini ? 1.6 : 2, fill: 'none' });
      });
    }

    /* ---------- 柱状图面板(MACD) ---------- */
    if (hasHist) {
      var hh = H - padB - oscTop;
      var hb = spec.hist.bars || [], hl = spec.hist.line || [], hs = spec.hist.sig || [];
      var hn = Math.max(hb.length, hl.length);
      var all = hb.concat(hl).concat(hs);
      var hmx = Math.max.apply(null, all.map(Math.abs)) || 1;
      var hX = function (i) { return padL + (W - padL - padR) * (i + 0.5) / hn; };
      var hY = function (v) { return oscTop + hh / 2 - v / hmx * hh * 0.42; };
      out += el('line', { x1: padL, x2: W - padR, y1: esc(hY(0)), y2: esc(hY(0)),
                          stroke: C.muted2, 'stroke-width': 1, 'stroke-dasharray': '5 4' });
      ATTACH.line = function (fx) { return hl.length ? hY(hl[Math.min(hl.length - 1, Math.round(fx * (hl.length - 1)))]) : null; };
      ATTACH.sig = function (fx) { return hs.length ? hY(hs[Math.min(hs.length - 1, Math.round(fx * (hs.length - 1)))]) : null; };
      ATTACH.hist = function (fx) { return hb.length ? hY(hb[Math.min(hb.length - 1, Math.round(fx * (hb.length - 1)))]) : null; };
      var bwh = Math.min((W - padL - padR) / hn * 0.55, 10);
      hb.forEach(function (v, i) {
        out += el('rect', { x: esc(hX(i) - bwh / 2), y: esc(hY(Math.max(v, 0))), width: esc(bwh),
                            height: esc(Math.max(Math.abs(hY(v) - hY(0)), 1)), rx: 1,
                            fill: v >= 0 ? C.bull : C.bear, 'fill-opacity': .7 });
      });
      [[hl, C.gold], [hs, C.cyan]].forEach(function (pair) {
        if (!pair[0].length) return;
        out += el('path', { d: pair[0].map(function (v, i) { return (i ? 'L' : 'M') + esc(hX(i)) + ',' + esc(hY(v)); }).join(' '),
                            stroke: pair[1], 'stroke-width': mini ? 1.5 : 2, fill: 'none' });
      });
    }


    /* ---------- 纯折线(权益曲线之类) ---------- */
    if (spec.lines && spec.lines.length) {
      var lw = W - padL - padR, lh = H - padT - padB - (spec.xlab ? 12 : 0);
      var allv = [];
      spec.lines.forEach(function (L) { allv = allv.concat(L.v); });
      (spec.hline || []).forEach(function (h) { allv.push(h.v); });
      var lmn = Math.min.apply(null, allv), lmx = Math.max.apply(null, allv);
      var lpd = (lmx - lmn) * 0.12 || 1; lmn -= lpd; lmx += lpd;
      var LN = Math.max.apply(null, spec.lines.map(function (L) { return L.v.length; }));
      var LX = function (i) { return padL + lw * i / (LN - 1); };
      var LY = function (v) { return padT + (lmx - v) / (lmx - lmn) * lh; };
      (spec.hline || []).forEach(function (h) {
        out += el('line', { x1: padL, x2: W - padR, y1: esc(LY(h.v)), y2: esc(LY(h.v)),
          stroke: C[h.c] || C.muted2, 'stroke-width': 1, 'stroke-dasharray': '5 4', 'stroke-opacity': .7 });
        if (h.t && !mini) out += txt(padL + 4, LY(h.v) - 5, h.t, { a: 'start', c: C[h.c] || C.muted2, s: 9, cjk: /[一-龥]/.test(h.t) });
      });
      spec.lines.forEach(function (L) {
        var col = C[L.c] || ROLE[L.role] || C.gold;
        out += el('path', { d: L.v.map(function (v, i) { return (i ? 'L' : 'M') + esc(LX(i)) + ',' + esc(LY(v)); }).join(' '),
          stroke: col, 'stroke-width': mini ? 1.6 : 2.2, fill: 'none' });
        if (L.t && !mini) out += txt(LX(L.v.length - 1) - 3, LY(L.v[L.v.length - 1]) - 7, L.t,
          { a: 'end', c: col, s: 9.5, w: 700, cjk: /[一-龥]/.test(L.t) });
      });
      if (spec.xlab && !mini) out += txt(W / 2, H - 5, spec.xlab, { c: C.muted2, s: 9, cjk: /[一-龥]/.test(spec.xlab) });
    }

    /* ---------- 对比条(成本拆解、胜率比较之类) ---------- */
    if (spec.bars && spec.bars.length) {
      var bwid = W - padL - padR, bhgt = H - padT - padB - 16;
      var bmx = Math.max.apply(null, spec.bars.map(function (b) { return Math.abs(b.v); })) || 1;
      var slot = bwid / spec.bars.length;
      var bb = Math.min(slot * 0.5, mini ? 26 : 54);
      spec.bars.forEach(function (b, i) {
        var cx = padL + slot * (i + 0.5);
        var hgt = Math.abs(b.v) / bmx * bhgt;
        var col = C[b.c] || C.gold;
        out += el('rect', { x: esc(cx - bb / 2), y: esc(padT + bhgt - hgt), width: esc(bb), height: esc(Math.max(hgt, 2)),
          rx: 4, fill: col, 'fill-opacity': .28, stroke: col, 'stroke-opacity': .8 });
        if (!mini) {
          out += txt(cx, padT + bhgt - hgt - 6, b.n === undefined ? b.v : b.n, { c: col, s: 10.5, w: 700 });
          out += txt(cx, padT + bhgt + 14, b.t, { c: C.muted, s: 9.5, cjk: /[一-龥]/.test(b.t) });
        }
      });
    }
    /* ---------- 标记 ---------- */
    (spec.mark || []).forEach(function (m) {
      var mx2 = padL + (W - padL - padR) * m.x;
      var col = C[m.c] || m.c || C.gold;
      var my = m.y !== undefined ? m.y : (padT + priceH * 0.5);
      if (m.v !== undefined && Y) my = Y(m.v);
      /* at 指定要贴哪一条 —— 环飘在半空中等于没指到东西 */
      if (m.at && ATTACH[m.at]) { var got = ATTACH[m.at](m.x); if (got !== null) my = got; }
      var dir = m.dir === 'down' ? 1 : -1;
      /* 空心环 —— 实心圆会把它要指的东西盖掉 */
      out += el('circle', { cx: esc(mx2), cy: esc(my), r: mini ? 5 : 6.5, fill: 'none', stroke: col, 'stroke-width': 2 });
      if (m.t && !mini)
        out += txt(mx2, my + dir * (m.dir === 'down' ? 22 : -14), m.t,
                   { c: col, s: 9.5, w: 700, cjk: /[一-龥]/.test(m.t) });
    });

    /* ---------- 盖住右侧,问「接下来会怎样」 ---------- */
    if (spec.veil) {
      var vx = padL + (W - padL - padR) * spec.veil;
      out += el('rect', { x: esc(vx), y: 0, width: esc(W - vx), height: H, fill: 'rgba(9,9,12,.93)' });
      out += el('line', { x1: esc(vx), x2: esc(vx), y1: 0, y2: H, stroke: C.gold, 'stroke-width': 1, 'stroke-dasharray': '4 4', 'stroke-opacity': .6 });
      out += txt(vx + (W - vx) / 2, H / 2, '?', { c: C.gold, s: mini ? 22 : 34, w: 700 });
    }

    /* ---------- 角落标签 ----------
       本来只打算放 A/B/C/D,底框写死 20px 宽、文字置中在 x=16。
       放长一点的字(GUIDANCE、DECISION DAY)就会伸到画布左边外面。
       改成照字数撑宽,单个字母的宽度仍维持 20px。 */
    if (spec.tag) {
      var tagW = Math.max(20, String(spec.tag).length * 6.1 + 10);
      out += el('rect', { x: 6, y: 6, width: esc(tagW), height: 16, rx: 4, fill: 'rgba(232,200,119,.16)', stroke: C.gold, 'stroke-opacity': .5 });
      out += txt(6 + tagW / 2, 18, spec.tag, { c: C.goldB, s: 10, w: 700 });
    }
    if (spec.cap && !mini) out += txt(W / 2, H - 5, spec.cap, { c: C.muted2, s: 9, cjk: /[一-龥]/.test(spec.cap) });

    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="quizfig" preserveAspectRatio="xMidYMid meet" ' +
           'xmlns="' + NS + '" role="img">' + out + '</svg>';
  }

  window.MTJQuizFig = MTJQuizFig;
})();
