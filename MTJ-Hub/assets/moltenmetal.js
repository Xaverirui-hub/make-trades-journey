/* ---------------------------------------------------------------------------
   Source     React Bits — <MoltenMetal />   https://reactbits.dev
   Copyright  (c) 2026 David Haz
   Licence    MIT + Commons Clause License Condition v1.0
              https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md

   本档是独立重写的原生 JS 移植版,作为 Make Trades Journey 网站的一部分使用。
   Commons Clause 禁止贩售或散布元件本身(含移植版);此处不单独贩售、不单独散布。
   完整第三方声明见 assets/THIRD-PARTY-NOTICES.md
   --------------------------------------------------------------------------- */
/* ============================================================================
   MoltenMetal — MTJ theme port
   ----------------------------------------------------------------------------
   Vanilla ES module port of the React Bits <MoltenMetal /> component.

   Same treatment as the other ports: upstream ships React + `ogl`, but ogl only
   wraps one full-screen fragment shader in renderer / program / triangle
   boilerplate. Written straight against WebGL2 here - no CDN at runtime,
   ~7 KB from our own origin.

   WebGL2 is required, not preferred: the shader is `#version 300 es`.

   The shader premultiplies (`fragColor = vec4(col * a, a)`), so the context is
   created with premultipliedAlpha and the blend is ONE / ONE_MINUS_SRC_ALPHA.
   Using SRC_ALPHA here double-darkens every filament.

   Theme - and the reason the palette is assigned the way it is:
   the three colours are bands of *brightness*, not three equal parts. color1 is
   the dim outer glow, color2 the mid filaments, color3 the hot cores. Alpha is
   the same value as brightness, so the dim band is also the most transparent.
   Putting violet on color1 therefore leaves it only in the faintest edges,
   while gold owns the midtones and cores - which is all the eye actually
   registers. Gold mostly, violet a little, by construction rather than by
   tuning an opacity until it looks right.
   ========================================================================== */

const VERT = `#version 300 es
in vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uScale;
uniform float uDetail;
uniform float uGlow;
uniform float uCoreSize;
uniform float uSwirl;
uniform float uFold;
uniform float uBlackPoint;
uniform float uBrightness;
uniform float uColorMode;
uniform float uGrain;
uniform float uGrainIntensity;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform bool uEnableMouse;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;

float hash(vec2 p){
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main(){
  float time = iTime * uSpeed;
  vec2 p = uScale * ((gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y) - 0.5;

  vec2 drift = vec2(0.0);
  if (uEnableMouse) drift = (uMouse - 0.5) * uMouseStrength * 2.0;
  p += drift;

  vec2 i = p;
  float c = 0.0;
  float r = length(p + vec2(sin(time), sin(time * 0.3 + 5.0)) * 0.5);
  float d = length(p);
  float rot = d + time + p.x * uSwirl;

  float cosRot = cos(rot);
  mat2 warp = mat2(cos(rot - sin(time / 5.0)), sin(rot), -sin(cosRot - time), cosRot) * uFold;
  float glowCore = uGlow * uCoreSize;

  for (float n = 0.0; n < 8.0; n++){
    if (n >= uDetail) break;
    p *= warp;
    float t = r - time / (n + 3.0);
    i -= p + vec2(cos(t - i.x - r) + sin(t + i.y), sin(t - i.y) + cos(t + i.x) + r);
    c += glowCore / length(vec2(sin(i.x + t), cos(i.y + t)));
  }

  c /= 6.0;

  float intensity = max(c - uBlackPoint, 0.0) * uBrightness;
  float g = clamp(intensity, 0.0, 1.0);

  float mid = 0.5;
  if (uColorMode > 1.5) mid = 0.65;
  else if (uColorMode > 0.5) mid = 0.35;

  vec3 col = mix(uColor1, uColor2, smoothstep(0.0, mid, g));
  col = mix(col, uColor3, smoothstep(mid, 1.0, g));

  float a = g;
  if (uGrain > 0.5){
    float gr = hash(gl_FragCoord.xy + iTime);
    a += (gr - 0.5) * uGrainIntensity;
  }
  a = clamp(a, 0.0, 1.0) * uOpacity;
  fragColor = vec4(col * a, a);
}
`;

const MODE = { molten: 0, ember: 1, frost: 2 };

const DEFAULTS = {
  color1: '#7C4DD8',   /* dim outer glow - the only place violet appears */
  color2: '#E8C877',   /* mid filaments - MTJ gold, the bulk of what reads */
  color3: '#FCE9A8',   /* hot cores - gold-bright */
  speed: 0.3,
  scale: 4,
  detail: 3,
  glow: 1.6,
  coreSize: 0.1,
  swirl: 1,
  fold: -0.2,
  blackPoint: 0.05,
  brightness: 1.25,
  colorMode: 'ember',  /* mid 0.35 pushes more area into the gold bands */
  grain: true,
  grainIntensity: 0.045,
  mouseInteraction: true,
  mouseStrength: 0.25,
  opacity: 1,
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
 * Mount the molten field into `target` (selector or element).
 * Adds `.is-live` once the first frame has drawn.
 * Returns a teardown function, or null if nothing mounted.
 */
export function mountMoltenMetal(target, options = {}) {
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
  ['iResolution', 'iTime', 'uSpeed', 'uScale', 'uDetail', 'uGlow', 'uCoreSize',
   'uSwirl', 'uFold', 'uBlackPoint', 'uBrightness', 'uColorMode', 'uGrain',
   'uGrainIntensity', 'uOpacity', 'uMouse', 'uMouseStrength', 'uEnableMouse',
   'uColor1', 'uColor2', 'uColor3']
    .forEach(n => { U[n] = gl.getUniformLocation(program, n); });

  gl.uniform1f(U.uSpeed, o.speed);
  gl.uniform1f(U.uScale, o.scale);
  gl.uniform1f(U.uDetail, o.detail);
  gl.uniform1f(U.uGlow, o.glow);
  gl.uniform1f(U.uCoreSize, Math.max(o.coreSize, 0.001));
  gl.uniform1f(U.uSwirl, o.swirl);
  gl.uniform1f(U.uFold, o.fold);
  gl.uniform1f(U.uBlackPoint, o.blackPoint);
  gl.uniform1f(U.uBrightness, o.brightness);
  gl.uniform1f(U.uColorMode, MODE[o.colorMode] ?? 0);
  gl.uniform1f(U.uGrain, o.grain ? 1 : 0);
  gl.uniform1f(U.uGrainIntensity, o.grainIntensity);
  gl.uniform1f(U.uOpacity, o.opacity);
  gl.uniform1f(U.uMouseStrength, o.mouseStrength);
  gl.uniform1i(U.uEnableMouse, o.mouseInteraction ? 1 : 0);
  gl.uniform3fv(U.uColor1, hexToRgb(o.color1));
  gl.uniform3fv(U.uColor2, hexToRgb(o.color2));
  gl.uniform3fv(U.uColor3, hexToRgb(o.color3));

  /* premultiplied output - ONE, not SRC_ALPHA */
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
  function onMove(e) {
    const r = host.getBoundingClientRect();
    tgt[0] = (e.clientX - r.left) / Math.max(r.width, 1);
    tgt[1] = 1 - (e.clientY - r.top) / Math.max(r.height, 1);
  }
  function onLeave() { tgt[0] = 0.5; tgt[1] = 0.5; }
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
    gl.uniform2f(U.uMouse, cur[0], cur[1]);

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

  /* Page visibility is read inside the loop, never latched - latching is what
     left the earlier effects permanently parked after a hidden tab. */

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

export default mountMoltenMetal;
