/* ===========================================================================
   MTJ · RotatingText —— React Bits <RotatingText /> 的原生移植

   上游是 React + motion/react:AnimatePresence 管进出场,layout 管容器宽度,
   spring 管每个字。这里一件依赖都不装 —— 全站没有打包步骤,加一个
   motion 就等于给一行 CTA 文字背上一整套动画库。

   三件事必须自己接:

   1. spring。CSS 没有弹簧,但有 linear() ——把弹簧的位移曲线采样成
      折线塞进去,得到的运动跟真弹簧看不出差别(含过冲)。
      x(t) = 1 − e^(−ζω₀t)·(cos ω_d t + ζω₀/ω_d · sin ω_d t)
      不支持 linear() 的浏览器退回一条带过冲的 cubic-bezier。

   2. AnimatePresence mode="wait"。旧的字先全部退场,再建新的进场 ——
      不是淡入淡出叠在一起。所以是两段,中间等一个 exit 时长。

   3. layout。两句话不一样长,容器宽度得跟着动,不然右边的箭头会跳。
      量出新宽度,transition 过去。

   逐字错开(staggerFrom last/first/center)照抄上游。

   用法:
     MTJRotatingText(el, { texts:['打 开 课 程','开 始 学 习'], … })
   返回 { stop, start, destroy }。
   =========================================================================== */
(function (root) {
  'use strict';

  /* ---------- 弹簧 → linear() ---------- */
  var springCache = {};
  function spring(stiffness, damping, mass) {
    var key = stiffness + '/' + damping + '/' + mass;
    if (springCache[key]) return springCache[key];

    var w0 = Math.sqrt(stiffness / mass);
    var z = damping / (2 * Math.sqrt(stiffness * mass));
    var f;
    if (z < 1) {
      var wd = w0 * Math.sqrt(1 - z * z);
      f = function (t) {
        return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
      };
    } else {
      /* 临界/过阻尼:没有过冲,单调爬到 1 */
      f = function (t) { return 1 - (1 + w0 * t) * Math.exp(-w0 * t); };
    }

    /* 稳定时间:最后一次偏离 1 超过千分之一的时刻,再留一点尾巴 */
    var step = 1 / 240, dur = step;
    for (var t = 0; t < 6; t += step) if (Math.abs(f(t) - 1) > 0.001) dur = t;
    dur += step * 8;

    var N = 56, pts = [];
    for (var i = 0; i <= N; i++) pts.push(Math.round(f(dur * i / N) * 1e4) / 1e4);

    var out = { ease: 'linear(' + pts.join(',') + ')', ms: Math.round(dur * 1000) };
    if (!supportsLinear()) out.ease = 'cubic-bezier(.18,1.25,.42,1)';
    springCache[key] = out;
    return out;
  }

  var _lin = null;
  function supportsLinear() {
    if (_lin === null) {
      try { _lin = !!(root.CSS && CSS.supports && CSS.supports('transition-timing-function', 'linear(0,1)')); }
      catch (e) { _lin = false; }
    }
    return _lin;
  }

  /* ---------- 切字 ---------- */
  function graphemes(text) {
    /* Segmenter 才认得组合字与 emoji;没有就退回 Array.from(至少认代理对) */
    try {
      if (root.Intl && Intl.Segmenter) {
        var seg = new Intl.Segmenter('en', { granularity: 'grapheme' });
        return Array.from(seg.segment(text), function (s) { return s.segment; });
      }
    } catch (e) {}
    return Array.from(text);
  }

  function split(text, by) {
    if (by === 'words') {
      return text.split(' ').map(function (w, i, a) {
        return { chars: [w], space: i !== a.length - 1 };
      });
    }
    return text.split(' ').map(function (w, i, a) {
      return { chars: graphemes(w), space: i !== a.length - 1 };
    });
  }

  /* ---------- 主体 ---------- */
  function RotatingText(host, opts) {
    if (!host) return null;
    opts = opts || {};

    var texts = opts.texts || [];
    if (texts.length < 1) return null;

    var interval = opts.rotationInterval || 2600;
    var stagger = opts.staggerDuration != null ? opts.staggerDuration : 0.025;
    var from = opts.staggerFrom || 'last';
    var splitBy = opts.splitBy || 'characters';
    var sp = spring(opts.stiffness || 400, opts.damping || 30, opts.mass || 1);

    var idx = 0, timer = null, busy = false, dead = false;

    host.classList.add('rt');
    host.innerHTML = '';

    /* 读屏软件只念一份完整的句子;逐字的那份 aria-hidden */
    var sr = document.createElement('span');
    sr.className = 'rt-sr';
    host.appendChild(sr);

    var stage = null;

    function delayOf(i, total) {
      if (from === 'first') return i * stagger;
      if (from === 'last') return (total - 1 - i) * stagger;
      if (from === 'center') return Math.abs(Math.floor(total / 2) - i) * stagger;
      return Math.abs((+from || 0) - i) * stagger;
    }

    function build(text) {
      var box = document.createElement('span');
      box.className = 'rt-stage';
      box.setAttribute('aria-hidden', 'true');

      var words = split(text, splitBy);
      var total = words.reduce(function (n, w) { return n + w.chars.length; }, 0);
      var seen = 0, cells = [];

      words.forEach(function (w) {
        var wrap = document.createElement('span');
        wrap.className = 'rt-word';
        w.chars.forEach(function (c) {
          var el = document.createElement('span');
          el.className = 'rt-char';
          el.textContent = c;
          el.style.transitionDuration = sp.ms + 'ms';
          el.style.transitionTimingFunction = sp.ease;
          el.style.transitionDelay = delayOf(seen, total).toFixed(3) + 's';
          wrap.appendChild(el);
          cells.push(el);
          seen++;
        });
        if (w.space) {
          var sps = document.createElement('span');
          sps.className = 'rt-space';
          sps.textContent = ' ';
          wrap.appendChild(sps);
        }
        box.appendChild(wrap);
      });

      box._cells = cells;
      box._span = total ? (total - 1) * stagger * 1000 : 0;
      return box;
    }

    /* 量宽度靠离屏克隆 —— 直接把新文字塞进去再读 offsetWidth,
       会先闪一帧旧宽度的错位。 */
    function widthOf(text) {
      var probe = build(text);
      probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;left:-9999px;top:0;';
      probe._cells.forEach(function (c) { c.style.transition = 'none'; c.style.opacity = '1'; });
      host.appendChild(probe);
      var w = probe.getBoundingClientRect().width;
      host.removeChild(probe);
      return w;
    }

    function mount(text, animate) {
      var box = build(text);
      box._cells.forEach(function (c) { c.classList.add('rt-in'); });   /* 起点:下方、透明 */
      host.appendChild(box);
      stage = box;
      sr.textContent = text;

      if (!animate) {
        box._cells.forEach(function (c) {
          c.style.transition = 'none';
          c.classList.remove('rt-in');
        });
        /* 下一帧再把 transition 还回去,不然首次轮换会没有动画 */
        requestAnimationFrame(function () {
          box._cells.forEach(function (c) { c.style.transition = ''; });
        });
        return;
      }
      /* 强制回流,让浏览器认下起点,再翻到终点 */
      void box.offsetWidth;
      box._cells.forEach(function (c) { c.classList.remove('rt-in'); });
    }

    function go(next) {
      if (dead || busy || next === idx) return;
      busy = true;

      var old = stage;
      var w = widthOf(texts[next]);
      host.style.width = w.toFixed(1) + 'px';

      /* 第一段:旧字往上退场 */
      old._cells.forEach(function (c) { c.classList.add('rt-out'); });

      setTimeout(function () {
        if (dead) return;
        if (old && old.parentNode) old.parentNode.removeChild(old);
        idx = next;
        mount(texts[idx], true);              /* 第二段:新字从下方进场 */
        setTimeout(function () { busy = false; }, sp.ms + stage._span);
      }, Math.round(sp.ms * 0.55) + old._span);   /* 退场不必走完整条弹簧 */
    }

    function next() { go(idx === texts.length - 1 ? 0 : idx + 1); }

    /* 宽度也用同一条弹簧,箭头才不会跟着抽动 */
    host.style.transition = 'width ' + sp.ms + 'ms ' + sp.ease;

    mount(texts[0], false);
    requestAnimationFrame(function () {
      if (!dead) host.style.width = host.getBoundingClientRect().width.toFixed(1) + 'px';
    });

    var api = {
      next: next,
      start: function () { if (!timer && !dead) timer = setInterval(next, interval); },
      stop: function () { if (timer) { clearInterval(timer); timer = null; } },
      destroy: function () { dead = true; api.stop(); host.innerHTML = ''; }
    };
    if (opts.auto !== false) api.start();
    return api;
  }

  root.MTJRotatingText = RotatingText;
})(window);
