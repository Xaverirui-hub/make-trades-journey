/* ============================================================================
   Galaxy — MTJ theme port
   ----------------------------------------------------------------------------
   Vanilla ES module port of the React Bits <Galaxy /> component.

   The original ships as React + `ogl`. Everything ogl contributed here was
   boilerplate around a single full-screen fragment shader (renderer, program,
   a 3-vertex triangle), so this port writes that boilerplate directly against
   WebGL1 and drops the dependency entirely. That matters for us: no CDN
   fetch at runtime, nothing to be blocked behind the Great Firewall, and the
   whole effect is ~9 KB served from our own origin.

   Theme: the upstream shader derives each star's hue from a random base
   colour, so `hueShift` alone only rotates a rainbow — it never lands on a
   single brand colour. We keep saturation near zero (grey stars) and multiply
   the final colour by an MTJ gold tint, so every star is on-palette by
   construction. `uTint` is the only uniform added to the original shader.

   Degrades quietly: no WebGL, or prefers-reduced-motion, and nothing mounts —
   the page keeps its existing glow / particle background.
   ========================================================================== */

const VERT = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform float uTime;
uniform vec3  uResolution;
uniform vec2  uFocal;
uniform vec2  uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2  uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool  uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool  uTransparent;
uniform vec3  uTint;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float tri(float x){ return abs(fract(x) * 2.0 - 1.0); }
float tris(float x){
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}
float trisn(float x){
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}
vec3 hsv2rgb(vec3 c){
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare){
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv){
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++){
    for (int x = -1; x <= 1; x++){
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + offset;
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);

      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0),
                      tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;

      col += star * size * base;
    }
  }
  return col;
}

void main(){
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);

  if (uAutoCenterRepulsion > 0.0){
    vec2 centerUV = vec2(0.0, 0.0);
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion){
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    uv += mouseNorm * 0.1 * uMouseActiveFactor;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;
  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);
  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER){
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  col *= uTint;

  if (uTransparent){
    float alpha = smoothstep(0.0, 0.3, length(col));
    gl_FragColor = vec4(col, min(alpha, 1.0));
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`;

/* MTJ palette --------------------------------------------------------------
   --gold #E8C877 as the tint, pushed slightly warm so the brightest cores
   read as --gold-bright rather than white. */
const DEFAULTS = {
  focal: [0.5, 0.5],
  rotation: [1.0, 0.0],
  starSpeed: 0.28,
  density: 0.85,
  hueShift: 40,
  speed: 0.65,
  glowIntensity: 0.26,
  saturation: 0.12,
  twinkleIntensity: 0.35,
  rotationSpeed: 0.035,
  repulsionStrength: 2,
  autoCenterRepulsion: 0,
  mouseInteraction: true,
  mouseRepulsion: false,
  transparent: true,
  tint: [0.95, 0.80, 0.49],
  maxDpr: 1.5
};

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) || 'shader compile failed');
  }
  return sh;
}

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch (e) {
    return false;
  }
}

/**
 * Mount the galaxy into `target` (selector or element).
 * Adds `.is-live` to the host only once the first frame has actually drawn,
 * so a failure never leaves a black rectangle where the page background was.
 * Returns a teardown function, or null if nothing mounted.
 */
export function mountGalaxy(target, options = {}) {
  const host = typeof target === 'string' ? document.querySelector(target) : target;
  if (!host) return null;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !supportsWebGL()) return null;

  const o = Object.assign({}, DEFAULTS, options);

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', {
    alpha: o.transparent,
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

  /* One oversized triangle covers the clip volume — cheaper than a quad and
     what ogl's Triangle geometry does under the hood. */
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
    'uTime', 'uResolution', 'uFocal', 'uRotation', 'uStarSpeed', 'uDensity',
    'uHueShift', 'uSpeed', 'uMouse', 'uGlowIntensity', 'uSaturation',
    'uMouseRepulsion', 'uTwinkleIntensity', 'uRotationSpeed',
    'uRepulsionStrength', 'uMouseActiveFactor', 'uAutoCenterRepulsion',
    'uTransparent', 'uTint'
  ].forEach(n => { U[n] = gl.getUniformLocation(program, n); });

  gl.uniform2fv(U.uFocal, o.focal);
  gl.uniform2fv(U.uRotation, o.rotation);
  gl.uniform1f(U.uDensity, o.density);
  gl.uniform1f(U.uHueShift, o.hueShift);
  gl.uniform1f(U.uSpeed, o.speed);
  gl.uniform1f(U.uGlowIntensity, o.glowIntensity);
  gl.uniform1f(U.uSaturation, o.saturation);
  gl.uniform1i(U.uMouseRepulsion, o.mouseRepulsion ? 1 : 0);
  gl.uniform1f(U.uTwinkleIntensity, o.twinkleIntensity);
  gl.uniform1f(U.uRotationSpeed, o.rotationSpeed);
  gl.uniform1f(U.uRepulsionStrength, o.repulsionStrength);
  gl.uniform1f(U.uAutoCenterRepulsion, o.autoCenterRepulsion);
  gl.uniform1i(U.uTransparent, o.transparent ? 1 : 0);
  gl.uniform3fv(U.uTint, o.tint);

  if (o.transparent) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
  } else {
    gl.clearColor(0, 0, 0, 1);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr);
    const w = Math.max(1, Math.round(host.clientWidth * dpr));
    const h = Math.max(1, Math.round(host.clientHeight * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform3f(U.uResolution, w, h, w / h);
  }
  resize();

  const targetMouse = { x: 0.5, y: 0.5 };
  const smoothMouse = { x: 0.5, y: 0.5 };
  let targetActive = 0;
  let smoothActive = 0;

  function onMove(e) {
    const r = host.getBoundingClientRect();
    targetMouse.x = (e.clientX - r.left) / r.width;
    targetMouse.y = 1 - (e.clientY - r.top) / r.height;
    targetActive = 1;
  }
  function onLeave() { targetActive = 0; }

  /* The host is pointer-events:none (it lives behind the content), so track
     the pointer on the window and derive position relative to the host. */
  if (o.mouseInteraction) {
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave, { passive: true });
  }

  let raf = 0;
  let live = false;
  let visible = true;
  let lost = false;

  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (!visible || lost || document.hidden) return;

    const time = t * 0.001;
    gl.uniform1f(U.uTime, time);
    gl.uniform1f(U.uStarSpeed, (time * o.starSpeed) / 10);

    const k = 0.05;
    smoothMouse.x += (targetMouse.x - smoothMouse.x) * k;
    smoothMouse.y += (targetMouse.y - smoothMouse.y) * k;
    smoothActive += (targetActive - smoothActive) * k;
    gl.uniform2f(U.uMouse, smoothMouse.x, smoothMouse.y);
    gl.uniform1f(U.uMouseActiveFactor, smoothActive);

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

  /* Don't burn a GPU on a star field nobody is looking at. */
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '120px' })
    : null;
  if (io) io.observe(host);

  /* Page visibility is checked inside the frame loop, not latched here.
     An earlier version set visible=false on visibilitychange and had nothing
     that ever set it back: once the tab was hidden the loop stayed parked
     until an intersection change happened to fire, which for an element that
     was already fully on screen never came. Derive, do not latch. */

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

export default mountGalaxy;
