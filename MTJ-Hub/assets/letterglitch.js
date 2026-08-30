/* ---------------------------------------------------------------------------
   Source     React Bits — <LetterGlitch />   https://reactbits.dev
   Copyright  (c) 2026 David Haz
   Licence    MIT + Commons Clause License Condition v1.0
              https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md

   本档是独立重写的原生 JS 移植版,作为 Make Trades Journey 网站的一部分使用。
   Commons Clause 禁止贩售或散布元件本身(含移植版);此处不单独贩售、不单独散布。
   完整第三方声明见 assets/THIRD-PARTY-NOTICES.md
   --------------------------------------------------------------------------- */
/* ============================================================================
   LetterGlitch — MTJ theme port
   ----------------------------------------------------------------------------
   Vanilla ES module port of the React Bits <LetterGlitch /> component.

   Unlike galaxy / webthreads / lightfall this one is plain canvas 2D, so there
   was no dependency to strip - the port is about the same three things the
   others needed: it must not run when the user asked for reduced motion, it
   must stop when it scrolls out of view, and it must fail into the page
   background rather than a black rectangle.

   Two deliberate departures from upstream:
   - the container is transparent, not `backgroundColor: #000`. This sits
     behind a cover, and an opaque black box would punch a hole through the
     page's own glow and watermark layers.
   - the grid is rebuilt on element resize via ResizeObserver rather than on
     window resize, because the host is a cover whose height comes from svh.

   Colour: upstream's terminal palette, kept as-is. Gold was tried and lost -
   a gold field under a gold headline flattens into one plane, and the green
   is what makes this read as a machine console rather than as decoration.
   ========================================================================== */

const DEFAULTS = {
  glitchColors: ['#2b4539', '#61dca3', '#61b3dc'],
  glitchSpeed: 55,
  centerVignette: false,
  outerVignette: true,
  smooth: true,
  characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789',
  fontSize: 16,
  charWidth: 10,
  charHeight: 20,
  maxDpr: 2
};

function hexToRgb(hex) {
  let h = String(hex).replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => r + r + g + g + b + b);
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

/**
 * Mount the glitch field into `target` (selector or element).
 * Adds `.is-live` once the first frame is drawn.
 * Returns a teardown function, or null if nothing mounted.
 */
export function mountLetterGlitch(target, options = {}) {
  const host = typeof target === 'string' ? document.querySelector(target) : target;
  if (!host) return null;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return null;

  const o = Object.assign({}, DEFAULTS, options);
  const chars = Array.from(o.characters);

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'display:block;width:100%;height:100%;';
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const randChar = () => chars[(Math.random() * chars.length) | 0];
  const randColor = () => o.glitchColors[(Math.random() * o.glitchColors.length) | 0];

  let letters = [];
  let columns = 0, rows = 0;
  let cssW = 0, cssH = 0;

  function build() {
    const dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr);
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return false;
    if (w === cssW && h === cssH) return false;
    cssW = w; cssH = h;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    columns = Math.ceil(w / o.charWidth);
    rows = Math.ceil(h / o.charHeight);
    letters = new Array(columns * rows);
    for (let i = 0; i < letters.length; i++) {
      letters[i] = { char: randChar(), color: randColor(), target: randColor(), progress: 1 };
    }
    return true;
  }

  function draw() {
    if (!letters.length) return;
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.font = o.fontSize + 'px monospace';
    ctx.textBaseline = 'top';
    for (let i = 0; i < letters.length; i++) {
      const l = letters[i];
      ctx.fillStyle = l.color;
      ctx.fillText(l.char, (i % columns) * o.charWidth, ((i / columns) | 0) * o.charHeight);
    }
  }

  function scramble() {
    const n = Math.max(1, (letters.length * 0.05) | 0);
    for (let i = 0; i < n; i++) {
      const idx = (Math.random() * letters.length) | 0;
      const l = letters[idx];
      if (!l) continue;
      l.char = randChar();
      l.target = randColor();
      if (o.smooth) { l.progress = 0; }
      else { l.color = l.target; l.progress = 1; }
    }
  }

  function ease() {
    let redraw = false;
    for (let i = 0; i < letters.length; i++) {
      const l = letters[i];
      if (l.progress >= 1) continue;
      l.progress = Math.min(1, l.progress + 0.05);
      const a = hexToRgb(l.color) || { r: 0, g: 0, b: 0 };
      const b = hexToRgb(l.target);
      if (!b) continue;
      l.color = 'rgb(' +
        Math.round(a.r + (b.r - a.r) * l.progress) + ',' +
        Math.round(a.g + (b.g - a.g) * l.progress) + ',' +
        Math.round(a.b + (b.b - a.b) * l.progress) + ')';
      redraw = true;
    }
    return redraw;
  }

  let raf = 0, live = false, visible = true, last = 0;

  function frame() {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    const now = Date.now();
    let redraw = false;
    if (now - last >= o.glitchSpeed) { scramble(); last = now; redraw = true; }
    if (o.smooth && ease()) redraw = true;
    if (redraw) draw();
    if (!live) { live = true; host.classList.add('is-live'); }
  }

  host.appendChild(canvas);

  /* vignettes are plain overlays, kept as elements so CSS can mask them too */
  function vignette(bg) {
    const d = document.createElement('div');
    d.setAttribute('aria-hidden', 'true');
    d.style.cssText = 'position:absolute;inset:0;pointer-events:none;background:' + bg + ';';
    host.appendChild(d);
    return d;
  }
  const vOuter = o.outerVignette
    ? vignette('radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(6,6,8,1) 100%)') : null;
  const vCenter = o.centerVignette
    ? vignette('radial-gradient(circle, rgba(6,6,8,.8) 0%, rgba(0,0,0,0) 60%)') : null;

  build();
  draw();
  raf = requestAnimationFrame(frame);

  const ro = 'ResizeObserver' in window
    ? new ResizeObserver(() => { if (build()) draw(); }) : null;
  if (ro) ro.observe(host);
  else window.addEventListener('resize', () => { if (build()) draw(); });

  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '80px' })
    : null;
  if (io) io.observe(host);

  /* Page visibility is checked inside the frame loop, not latched here.
     An earlier version set visible=false on visibilitychange and had nothing
     that ever set it back: once the tab was hidden the loop stayed parked
     until an intersection change happened to fire, which for an element that
     was already fully on screen never came. Derive, do not latch. */

  return function destroy() {
    cancelAnimationFrame(raf);
    if (ro) ro.disconnect();
    if (io) io.disconnect();
    [canvas, vOuter, vCenter].forEach(el => { if (el && el.parentNode) el.parentNode.removeChild(el); });
    host.classList.remove('is-live');
  };
}

export default mountLetterGlitch;
