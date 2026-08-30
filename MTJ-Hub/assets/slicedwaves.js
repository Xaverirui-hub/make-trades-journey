/* ---------------------------------------------------------------------------
   Source     React Bits — <SlicedWaves />   https://reactbits.dev
   Copyright  (c) 2026 David Haz
   Licence    MIT + Commons Clause License Condition v1.0
              https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md

   本档是独立重写的原生 JS 移植版,作为 Make Trades Journey 网站的一部分使用。
   Commons Clause 禁止贩售或散布元件本身(含移植版);此处不单独贩售、不单独散布。
   完整第三方声明见 assets/THIRD-PARTY-NOTICES.md
   --------------------------------------------------------------------------- */
/* ============================================================================
   SlicedWaves — MTJ theme port
   ----------------------------------------------------------------------------
   Vanilla ES module port of the React Bits <SlicedWaves /> component.

   Last of the six. Same treatment: upstream ships React + `ogl`, ogl only
   wraps one full-screen fragment shader, so it is written straight against
   WebGL2 here - no CDN at runtime, ~7 KB from our own origin.

   WebGL2 is required: the shader is `#version 300 es`. Note it uses fwidth(),
   which IS core at ES 3.00 - unlike gridscan.js, whose shader is ES 1.00 and
   therefore needs the OES_standard_derivatives extension on a WebGL1 context.
   Same function, opposite requirement; the version directive decides.

   Premultiplied output (`vec4(col * a, a)`), so premultipliedAlpha plus
   ONE / ONE_MINUS_SRC_ALPHA.

   Theme: each bar cycles between color2 (bottom of travel) and color1 (top),
   so those two are what the eye reads - both gold. color3 is an accent tint
   mixed in across the field at up to 45%, so violet arrives as a sweep on one
   side rather than as a second body colour.
   ========================================================================== */

const VERT = `#version 300 es
in vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uColumns;
uniform float uRows;
uniform float uThickness;
uniform float uSpeed;
uniform float uTravel;
uniform float uWaveSpread;
uniform float uRowOffset;
uniform float uSoftness;
uniform float uGlow;
uniform float uBrightness;
uniform float uContrast;
uniform float uOpacity;
uniform float uVertical;
uniform float uAlternate;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uMouseRadius;
uniform float uEnableMouse;
uniform float uMouseActive;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;

void main(){
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  vec2 grid = vec2(max(uColumns, 1.0), max(uRows, 1.0));
  vec2 p = uv * grid;
  vec2 gv = fract(p) - 0.5;
  vec2 id = floor(p);

  float barCoord, waveId, offId, along;
  if (uVertical > 0.5){
    barCoord = gv.x; waveId = id.y; offId = id.x; along = uv.y;
  } else {
    barCoord = gv.y; waveId = id.x; offId = id.y; along = uv.x;
  }

  float dir = 1.0;
  if (uAlternate > 0.5 && mod(offId, 2.0) >= 1.0) dir = -1.0;

  float phase = iTime * uSpeed + waveId * uWaveSpread + cos(offId * uRowOffset);
  float mv = sin(phase) * 0.5 + 0.5;
  if (dir < 0.0) mv = 1.0 - mv;

  float infl = 0.0;
  if (uEnableMouse > 0.5){
    float md = distance(uv, uMouse);
    infl = smoothstep(uMouseRadius, 0.0, md) * uMouseStrength * uMouseActive;
  }

  float thick = clamp(uThickness + infl * 0.25, 0.0, 1.0);
  float startPos = (0.5 - thick * 0.5) * uTravel;
  float endPos = (-0.5 + thick * 0.5) * uTravel;
  float pos = mix(startPos, endPos, mv);

  float aa = max(uSoftness, 0.0005);
  float d = abs(barCoord + pos) - thick * 0.5;
  float aaWidth = fwidth(uVertical > 0.5 ? p.x : p.y);
  float edge = max(aa, aaWidth);
  float mask = smoothstep(edge, -edge, d);
  float glow = exp(-max(d, 0.0) * (7.0 / (uGlow + 0.001))) * clamp(uGlow, 0.0, 1.0);
  float intensity = clamp(mask + glow * (1.0 - mask), 0.0, 1.0);

  if (uGrain > 0.5){
    float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453);
    intensity = clamp(intensity + (g - 0.5) * uGrainIntensity, 0.0, 1.0);
  }

  float tint = mv;
  vec3 grad = mix(uColor2, uColor1, tint);
  grad = mix(grad, uColor3, clamp(along, 0.0, 1.0) * 0.45);

  vec3 col = grad * uBrightness * (1.0 + infl * 0.6);
  col = (col - 0.5) * uContrast + 0.5;
  col = clamp(col, 0.0, 1.0);

  float a = intensity * uOpacity;
  fragColor = vec4(col * a, a);
}
`;

const DEFAULTS = {
  color1: '#FCE9A8',   /* top of travel - gold-bright */
  color2: '#C9A227',   /* bottom of travel - gold-deep */
  color3: '#7C4DD8',   /* accent sweep across the field - violet */
  columns: 14,
  rows: 8,
  barThickness: 0.1,
  speed: 0.3,
  travel: 0.7,
  waveSpread: 0.9,
  rowOffset: 1.0,
  softness: 0.05,
  glow: 0.25,
  brightness: 1.0,
  contrast: 1.0,
  opacity: 0.5,
  orientation: 'horizontal',
  alternate: false,
  mouseInteraction: true,
  mouseStrength: 1,
  mouseRadius: 0.3,
  grain: true,
  grainIntensity: 0.045,
  maxDpr: 1.5
};

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex));
  if (!m) return [1, 1, 1];
  return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
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
 * Mount the sliced wave grid into `target` (selector or element).
 * Adds `.is-live` once the first frame has drawn.
 * Returns a teardown function, or null if nothing mounted.
 */
export function mountSlicedWaves(target, options = {}) {
  const host = typeof target === 'string' ? document.querySelector(target) : target;
  if (!host) return null;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return null;

  const o = Object.assign({}, DEFAULTS, options);

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'display:block;width:100%;height:100%;';
  const gl = canvas.getContext('webgl2', {
    alpha: true, premultipliedAlpha: true, antialias: false,
    depth: false, stencil: false, powerPreference: 'low-power'
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
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  ['iResolution', 'iTime', 'uColumns', 'uRows', 'uThickness', 'uSpeed', 'uTravel',
   'uWaveSpread', 'uRowOffset', 'uSoftness', 'uGlow', 'uBrightness', 'uContrast',
   'uOpacity', 'uVertical', 'uAlternate', 'uMouse', 'uMouseStrength', 'uMouseRadius',
   'uEnableMouse', 'uMouseActive', 'uGrain', 'uGrainIntensity',
   'uColor1', 'uColor2', 'uColor3']
    .forEach(n => { U[n] = gl.getUniformLocation(program, n); });

  gl.uniform1f(U.uColumns, Math.max(1, Math.round(o.columns)));
  gl.uniform1f(U.uRows, Math.max(1, Math.round(o.rows)));
  gl.uniform1f(U.uThickness, o.barThickness);
  gl.uniform1f(U.uSpeed, o.speed);
  gl.uniform1f(U.uTravel, o.travel);
  gl.uniform1f(U.uWaveSpread, o.waveSpread);
  gl.uniform1f(U.uRowOffset, o.rowOffset);
  gl.uniform1f(U.uSoftness, o.softness);
  gl.uniform1f(U.uGlow, o.glow);
  gl.uniform1f(U.uBrightness, o.brightness);
  gl.uniform1f(U.uContrast, o.contrast);
  gl.uniform1f(U.uOpacity, o.opacity);
  gl.uniform1f(U.uVertical, o.orientation === 'vertical' ? 1 : 0);
  gl.uniform1f(U.uAlternate, o.alternate ? 1 : 0);
  gl.uniform1f(U.uMouseStrength, o.mouseStrength);
  gl.uniform1f(U.uMouseRadius, o.mouseRadius);
  gl.uniform1f(U.uEnableMouse, o.mouseInteraction ? 1 : 0);
  gl.uniform1f(U.uGrain, o.grain ? 1 : 0);
  gl.uniform1f(U.uGrainIntensity, o.grainIntensity);
  gl.uniform3fv(U.uColor1, hexToRgb(o.color1));
  gl.uniform3fv(U.uColor2, hexToRgb(o.color2));
  gl.uniform3fv(U.uColor3, hexToRgb(o.color3));

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr);
    const w = Math.max(1, Math.round((host.clientWidth || 1) * dpr));
    const h = Math.max(1, Math.round((host.clientHeight || 1) * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(U.iResolution, w, h);
  }
  resize();

  const tgt = [0.5, 0.5], cur = [0.5, 0.5];
  let tgtActive = 0, curActive = 0;
  function onMove(e) {
    const r = host.getBoundingClientRect();
    tgt[0] = (e.clientX - r.left) / Math.max(r.width, 1);
    tgt[1] = 1 - (e.clientY - r.top) / Math.max(r.height, 1);
    tgtActive = 1;
  }
  function onLeave() { tgtActive = 0; }
  if (o.mouseInteraction) {
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave, { passive: true });
  }

  let raf = 0, live = false, visible = true;
  const t0 = performance.now();

  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) return;

    gl.uniform1f(U.iTime, (t - t0) * 0.001);
    cur[0] += 0.05 * (tgt[0] - cur[0]);
    cur[1] += 0.05 * (tgt[1] - cur[1]);
    curActive += 0.05 * (tgtActive - curActive);
    gl.uniform2f(U.uMouse, cur[0], cur[1]);
    gl.uniform1f(U.uMouseActive, curActive);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!live) { live = true; host.classList.add('is-live'); }
  }

  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); visible = false; });

  host.appendChild(canvas);
  raf = requestAnimationFrame(frame);

  const ro = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(host); else window.addEventListener('resize', resize);

  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 })
    : null;
  if (io) io.observe(host);

  /* Page visibility is read in the loop, never latched. */

  return function destroy() {
    cancelAnimationFrame(raf);
    if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
    if (io) io.disconnect();
    if (o.mouseInteraction) {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    }
    const ext = gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    host.classList.remove('is-live');
  };
}

export default mountSlicedWaves;
