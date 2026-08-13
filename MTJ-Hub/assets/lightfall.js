/* ============================================================================
   Lightfall — MTJ theme port
   ----------------------------------------------------------------------------
   Vanilla ES module port of the React Bits <Lightfall /> component.

   Third of the same treatment (see galaxy.js, webthreads.js): upstream ships
   React + `ogl`, but ogl only wraps a single full-screen fragment shader in
   renderer/program/triangle boilerplate. That boilerplate is written straight
   against WebGL1 here, so nothing is fetched from a CDN at runtime and the
   whole effect is ~8 KB from our own origin.

   This shader is the heaviest of the three - the tunnel solve runs a 39-step
   loop three times per pixel before the streak loop even starts - so the pixel
   ratio is capped harder than the others and the frame loop parks the moment
   the cover scrolls out of view.

   Theme: three golds falling through a warm amber ambience, instead of the
   upstream blue/violet/pink over electric blue.
   ========================================================================== */

const VERT = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;

uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;

uniform vec3  uBgColor;
uniform vec3  uMouseColor;
uniform float uSpeed;
uniform int   uStreakCount;
uniform float uStreakWidth;
uniform float uStreakLength;
uniform float uGlow;
uniform float uDensity;
uniform float uTwinkle;
uniform float uZoom;
uniform float uBgGlow;
uniform float uOpacity;
uniform float uMouseEnabled;
uniform float uMouseStrength;
uniform float uMouseRadius;
uniform vec3  uBlack;

varying vec2 vUv;

vec3 palette(float h){
  int count = uColorCount;
  if(count < 1) count = 1;
  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
  if(idx <= 0) return uColor0;
  if(idx == 1) return uColor1;
  if(idx == 2) return uColor2;
  if(idx == 3) return uColor3;
  if(idx == 4) return uColor4;
  if(idx == 5) return uColor5;
  if(idx == 6) return uColor6;
  return uColor7;
}

vec3 tanhv(vec3 x){
  vec3 e = exp(-2.0 * x);
  return (1.0 - e) / (1.0 + e);
}

vec2 sceneC(vec2 frag, vec2 r){
  vec2 P = (frag + frag - r) / r.x;
  float z = 0.0;
  float d = 1e3;
  vec4 O = vec4(0.0);
  for(int k = 0; k < 39; k++){
    if(d <= 1e-4) break;
    O = z * normalize(vec4(P, uZoom, 0.0)) - vec4(0.0, 4.0, 1.0, 0.0) / 4.5;
    d = 1.0 - sqrt(length(O * O));
    z += d;
  }
  return vec2(O.x, atan(O.z, O.y));
}

void mainImage(out vec4 o, vec2 C){
  vec2 r = iResolution.xy;
  vec2 uv0 = (C + C - r) / r.x;
  float T = 0.1 * iTime * uSpeed + 9.0;
  float angRings = max(1.0, floor(6.28318530718 * max(uDensity, 0.05) + 0.5));
  vec2 Y = vec2(5e-3, 6.28318530718 / angRings);

  vec2 c0  = sceneC(C, r);
  vec2 cdx = sceneC(C + vec2(1.0, 0.0), r);
  vec2 cdy = sceneC(C + vec2(0.0, 1.0), r);
  vec2 dCx = cdx - c0;
  vec2 dCy = cdy - c0;
  dCx.y -= 6.28318530718 * floor(dCx.y / 6.28318530718 + 0.5);
  dCy.y -= 6.28318530718 * floor(dCy.y / 6.28318530718 + 0.5);
  vec2 fw = abs(dCx) + abs(dCy);
  C = c0;

  vec2 P = vec2(2.0, 1.0) * uv0 - (r / r.x) * vec2(0.0, 1.0);
  vec4 O = vec4(uBgColor * 90.0 * uBgGlow / (1e3 * dot(P, P) + 6.0), 0.0);

  float mGlow = 0.0;
  if(uMouseEnabled > 0.5){
    vec2 mN = (iMouse + iMouse - r) / r.x;
    float md = length(uv0 - mN);
    mGlow = exp(-md * md / max(uMouseRadius * uMouseRadius, 1e-4)) * uMouseStrength;
    O.rgb += uMouseColor * mGlow * 0.25;
  }

  float zr = 5e-4 * uStreakWidth;
  vec2 rr = vec2(max(length(fw), 1e-5));
  float tail = 19.0 / max(uStreakLength, 0.05);

  for(int m = 0; m < 16; m++){
    if(m >= uStreakCount) break;
    float jf = float(m) + 1.0;
    float ic = fract(sin(dot(vec2(jf, floor(C.x / Y.x + 0.5)), vec2(7.0, 11.0)) * 73.0));
    vec2 Pp = C - (T + T * ic) * vec2(0.0, 1.0);
    Pp -= floor(Pp / Y + 0.5) * Y;
    float h = fract(8663.0 * ic);
    vec3 col = palette(h);
    float weight = mix(1.5, 1.0 + sin(T + 7.0 * h + 4.0), uTwinkle);
    weight *= (1.0 + mGlow * 2.0);
    vec2 inner = vec2(length(max(Pp, vec2(-1.0, 0.0))), length(Pp) - zr) - zr;
    vec2 sm = vec2(1.0) - smoothstep(-rr, rr, inner);
    O.rgb += dot(sm, vec2(exp(tail * Pp.y), 3.0)) * col * weight;
    C.x += Y.x / 8.0;
  }

  /* Black-point trim. Upstream hard-codes vec3(0.04, 0.08, 0.02), which takes
     twice as much green as red and four times as much as blue - fine under a
     blue/violet palette, but on warm light it removes the green that makes
     gold gold and the dim mid-field turns magenta. Themed via uniform. */
  vec3 colr = sqrt(tanhv(max(O.rgb * uGlow - uBlack, 0.0)));
  o = vec4(colr, uOpacity);
}

void main(){
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`;

const MAX_COLORS = 8;

/* MTJ palette: three golds falling through a warm amber ambience. */
const DEFAULTS = {
  /* Upstream violet/pink kept - they are what make the fall read as depth -
     but the pale near-white streak (#A6C8FF) becomes MTJ gold, so the
     brightest thing on screen is the brand colour rather than a cold white. */
  colors: ['#E8C877', '#5227FF', '#FF9FFC'],
  backgroundColor: '#0A29FF',
  speed: 0.5,
  streakCount: 3,
  streakWidth: 1,
  streakLength: 1,
  glow: 1,
  density: 0.6,
  twinkle: 1,
  zoom: 3,
  backgroundGlow: 0.45,
  opacity: 1,
  mouseInteraction: true,
  mouseStrength: 0.5,
  mouseRadius: 1,
  mouseDampening: 0.15,
  /* Between upstream's [0.04,0.08,0.02] and a neutral trim: the ambient is
     blue again so it can take some green off, but not so much that the dim
     tails of the gold streak turn magenta the way the full 0.08 did. */
  black: [0.04, 0.06, 0.02],
  maxDpr: 1.35   /* heaviest of the three shaders - keep the pixel count down */
};

function hexToRgb(hex) {
  const c = String(hex).replace('#', '').padEnd(6, '0');
  return [
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255
  ];
}

function prepColors(input) {
  const base = (input && input.length ? input : DEFAULTS.colors).slice(0, MAX_COLORS);
  const arr = [];
  for (let i = 0; i < MAX_COLORS; i++) arr.push(hexToRgb(base[Math.min(i, base.length - 1)]));
  const avg = [0, 0, 0];
  for (let i = 0; i < base.length; i++) {
    avg[0] += arr[i][0]; avg[1] += arr[i][1]; avg[2] += arr[i][2];
  }
  avg[0] /= base.length; avg[1] /= base.length; avg[2] /= base.length;
  return { arr, count: base.length, avg };
}

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) || 'shader compile failed');
  }
  return sh;
}

/**
 * Mount the lightfall into `target` (selector or element).
 * Adds `.is-live` to the host only after the first frame has drawn, so a
 * failure leaves the existing cover rather than a black rectangle.
 * Returns a teardown function, or null if nothing mounted.
 */
export function mountLightfall(target, options = {}) {
  const host = typeof target === 'string' ? document.querySelector(target) : target;
  if (!host) return null;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return null;

  const o = Object.assign({}, DEFAULTS, options);

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power'
  });
  if (!gl) return null;

  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'link failed');
    }
  } catch (e) {
    return null;
  }
  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    // position   uv
    -1, -1, 0, 0,
     3, -1, 2, 0,
    -1,  3, 0, 2
  ]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'position');
  const aUv = gl.getAttribLocation(program, 'uv');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
  gl.enableVertexAttribArray(aUv);
  gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

  const U = {};
  [
    'iResolution', 'iMouse', 'iTime', 'uColor0', 'uColor1', 'uColor2', 'uColor3',
    'uColor4', 'uColor5', 'uColor6', 'uColor7', 'uColorCount', 'uBgColor',
    'uMouseColor', 'uSpeed', 'uStreakCount', 'uStreakWidth', 'uStreakLength',
    'uGlow', 'uDensity', 'uTwinkle', 'uZoom', 'uBgGlow', 'uOpacity',
    'uMouseEnabled', 'uMouseStrength', 'uMouseRadius', 'uBlack'
  ].forEach(n => { U[n] = gl.getUniformLocation(program, n); });

  const { arr, count, avg } = prepColors(o.colors);
  arr.forEach((c, i) => gl.uniform3fv(U['uColor' + i], c));
  gl.uniform1i(U.uColorCount, count);
  gl.uniform3fv(U.uBgColor, hexToRgb(o.backgroundColor));
  gl.uniform3fv(U.uMouseColor, avg);
  gl.uniform1f(U.uSpeed, o.speed);
  gl.uniform1i(U.uStreakCount, Math.max(1, Math.min(16, Math.round(o.streakCount))));
  gl.uniform1f(U.uStreakWidth, o.streakWidth);
  gl.uniform1f(U.uStreakLength, o.streakLength);
  gl.uniform1f(U.uGlow, o.glow);
  gl.uniform1f(U.uDensity, o.density);
  gl.uniform1f(U.uTwinkle, o.twinkle);
  gl.uniform1f(U.uZoom, o.zoom);
  gl.uniform1f(U.uBgGlow, o.backgroundGlow);
  gl.uniform1f(U.uOpacity, o.opacity);
  gl.uniform1f(U.uMouseEnabled, o.mouseInteraction ? 1 : 0);
  gl.uniform1f(U.uMouseStrength, o.mouseStrength);
  gl.uniform1f(U.uMouseRadius, o.mouseRadius);
  gl.uniform3fv(U.uBlack, o.black);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr);
    const w = Math.max(1, Math.round(host.clientWidth * dpr));
    const h = Math.max(1, Math.round(host.clientHeight * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform3f(U.iResolution, w, h, 1);
  }
  resize();

  /* Host is pointer-events:none behind the cover copy, so track on window. */
  const target2 = [0, 0];
  const curM = [0, 0];
  function onMove(e) {
    const r = host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr);
    target2[0] = (e.clientX - r.left) * dpr;
    target2[1] = (r.height - (e.clientY - r.top)) * dpr;
    if (o.mouseDampening <= 0) { curM[0] = target2[0]; curM[1] = target2[1]; }
  }
  if (o.mouseInteraction) window.addEventListener('pointermove', onMove, { passive: true });

  let raf = 0, live = false, visible = true, lost = false, last = 0;

  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (!visible || lost) { last = t; return; }

    gl.uniform1f(U.iTime, t * 0.001);
    if (o.mouseDampening > 0) {
      if (!last) last = t;
      const dt = (t - last) / 1000;
      last = t;
      const f = Math.min(1, 1 - Math.exp(-dt / Math.max(1e-4, o.mouseDampening)));
      curM[0] += (target2[0] - curM[0]) * f;
      curM[1] += (target2[1] - curM[1]) * f;
    } else { last = t; }
    gl.uniform2f(U.iMouse, curM[0], curM[1]);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!live) { live = true; host.classList.add('is-live'); }
  }

  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); lost = true; });
  canvas.addEventListener('webglcontextrestored', () => { lost = true; });

  host.appendChild(canvas);
  raf = requestAnimationFrame(frame);

  const ro = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(host); else window.addEventListener('resize', resize);

  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '80px' })
    : null;
  if (io) io.observe(host);

  const onVis = () => { if (document.hidden) visible = false; };
  document.addEventListener('visibilitychange', onVis);

  return function destroy() {
    cancelAnimationFrame(raf);
    if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
    if (io) io.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    if (o.mouseInteraction) window.removeEventListener('pointermove', onMove);
    const ext = gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    host.classList.remove('is-live');
  };
}

export default mountLightfall;
