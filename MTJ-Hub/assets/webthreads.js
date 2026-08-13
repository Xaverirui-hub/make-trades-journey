/* ============================================================================
   WebThreads — MTJ theme port
   ----------------------------------------------------------------------------
   Vanilla ES module port of the React Bits <WebThreads /> component.

   Same treatment as assets/galaxy.js: the upstream ships React + `ogl`, but
   ogl only contributed renderer/program/triangle boilerplate around a single
   full-screen fragment shader. That boilerplate is written directly against
   WebGL2 here, so there is no CDN fetch at runtime, nothing to be blocked
   behind the Great Firewall, and the whole effect is ~7 KB from our origin.

   WebGL2 is required, not optional: the shader is `#version 300 es`. If the
   browser cannot give us a WebGL2 context we mount nothing and the page keeps
   its existing glow + particle background.

   Theme: three golds instead of the upstream violet/pink/white -
   --gold-deep at the first thread, --gold-bright at the last, and a warm
   near-white hot core.
   ========================================================================== */

const VERT = `#version 300 es
in vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2  iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uThreadCount;
uniform float uFrequency;
uniform float uSpread;
uniform float uTaper;
uniform float uPosition;
uniform float uFanMode;
uniform float uGlow;
uniform float uFalloff;
uniform float uThickness;
uniform float uBrightness;
uniform float uOpacity;
uniform float uMirror;
uniform float uShimmer;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec2  uMouse;
uniform float uMouseStrength;
uniform float uEnableMouse;
uniform float uMouseActive;
out vec4 fragColor;

#define TAU 6.28318530718
#define MAX_THREADS 10

float glowAt(float x, float str, float dist){
  return dist / pow(max(x, 1e-4), str);
}

void main(){
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  float n = max(uThreadCount, 1.0);

  float pinchX = uFanMode < 0.5 ? 0.5 : (uFanMode < 1.5 ? 0.0 : 1.0);
  if(uEnableMouse > 0.5){
    pinchX = mix(pinchX, uMouse.x, clamp(uMouseStrength, 0.0, 1.0) * uMouseActive);
  }

  float spreadDx = uSpread * abs(uv.x - pinchX);
  float baseT = iTime * uSpeed;
  float tauOverN = TAU / n;
  float mirror = uMirror > 0.5 ? sign(pinchX - uv.x) : 1.0;
  bool doShimmer = uShimmer > 0.5;
  float shimmerT = iTime * 1.7;
  float invThickness = 1.0 / max(uThickness, 0.01);
  float xFreq = uv.x * uFrequency;
  float yOff = uv.y - uPosition;
  float ciScale = n > 1.0 ? 1.0 / (n - 1.0) : 0.0;

  vec3 col = vec3(0.0);
  float gsum = 0.0;

  for(int idx = 0; idx < MAX_THREADS; idx++){
    float i = float(idx);
    if(i >= n) break;

    float amplitude = spreadDx * (1.0 + i * uTaper);
    float shimmer = doShimmer ? sin(shimmerT + i * 1.3) * 0.35 : 0.0;
    float phase = (baseT + i * tauOverN) * mirror + shimmer;

    float sdf = abs(yOff + sin(xFreq + phase) * amplitude) * invThickness;

    float g = glowAt(sdf, uFalloff, uGlow);
    float ci = i * ciScale;
    vec3 threadCol = mix(uColor1, uColor2, ci);

    col += g * threadCol;
    gsum += g;
  }

  float coreAmt = smoothstep(0.5, 2.2, gsum);
  col = mix(col, uColor3 * gsum, coreAmt * 0.5);

  float bright = uBrightness;
  if(uEnableMouse > 0.5){
    vec2 md = uv - uMouse;
    float d2 = dot(md, md);
    bright += clamp(uMouseStrength, 0.0, 1.0) * uMouseActive * exp(-d2 * 6.0) * 0.6;
  }
  col *= bright;

  float alpha = clamp(gsum, 0.0, 1.0) * uOpacity;
  vec3 outRgb = col * alpha;   /* premultiplied */

  if(uGrain > 0.5){
    float gv = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453) - 0.5) * uGrainIntensity;
    outRgb = clamp(outRgb + gv, 0.0, 1.0);
    alpha  = clamp(alpha + gv, 0.0, 1.0);
  }

  fragColor = vec4(outRgb, alpha);
}
`;

const FAN = { center: 0, left: 1, right: 2 };

/* MTJ palette: --gold-deep -> --gold-bright, warm near-white core. */
const DEFAULTS = {
  color1: '#C9A227',
  color2: '#FCE9A8',
  color3: '#FFF6DC',
  speed: 0.16,
  threadCount: 6,
  frequency: 4.2,
  spread: 0.2,
  taper: 1.0,
  position: 0.5,
  fanMode: 'center',
  glow: 0.02,
  falloff: 0.62,
  thickness: 1.15,
  brightness: 0.52,
  opacity: 0.95,
  mirror: true,
  shimmer: false,
  grain: true,
  grainIntensity: 0.035,
  mouseInteraction: true,
  mouseStrength: 0.28,
  maxDpr: 2
};

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
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
 * Mount the threads into `target` (selector or element).
 * Adds `.is-live` to the host only once the first frame has actually drawn,
 * so a failure never leaves a blank rectangle where the page background was.
 * Returns a teardown function, or null if nothing mounted.
 */
export function mountWebThreads(target, options = {}) {
  const host = typeof target === 'string' ? document.querySelector(target) : target;
  if (!host) return null;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return null;

  const o = Object.assign({}, DEFAULTS, options);

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  /* WebGL2 is mandatory here - the shader is #version 300 es. */
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
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
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  [
    'iResolution', 'iTime', 'uSpeed', 'uThreadCount', 'uFrequency', 'uSpread',
    'uTaper', 'uPosition', 'uFanMode', 'uGlow', 'uFalloff', 'uThickness',
    'uBrightness', 'uOpacity', 'uMirror', 'uShimmer', 'uGrain', 'uGrainIntensity',
    'uColor1', 'uColor2', 'uColor3', 'uMouse', 'uMouseStrength', 'uEnableMouse',
    'uMouseActive'
  ].forEach(n => { U[n] = gl.getUniformLocation(program, n); });

  gl.uniform1f(U.uSpeed, o.speed);
  gl.uniform1f(U.uThreadCount, Math.round(o.threadCount));
  gl.uniform1f(U.uFrequency, o.frequency);
  gl.uniform1f(U.uSpread, o.spread);
  gl.uniform1f(U.uTaper, o.taper);
  gl.uniform1f(U.uPosition, o.position);
  gl.uniform1f(U.uFanMode, FAN[o.fanMode] ?? 0);
  gl.uniform1f(U.uGlow, o.glow);
  gl.uniform1f(U.uFalloff, o.falloff);
  gl.uniform1f(U.uThickness, o.thickness);
  gl.uniform1f(U.uBrightness, o.brightness);
  gl.uniform1f(U.uOpacity, o.opacity);
  gl.uniform1f(U.uMirror, o.mirror ? 1 : 0);
  gl.uniform1f(U.uShimmer, o.shimmer ? 1 : 0);
  gl.uniform1f(U.uGrain, o.grain ? 1 : 0);
  gl.uniform1f(U.uGrainIntensity, o.grainIntensity);
  gl.uniform3fv(U.uColor1, hexToRgb(o.color1));
  gl.uniform3fv(U.uColor2, hexToRgb(o.color2));
  gl.uniform3fv(U.uColor3, hexToRgb(o.color3));
  gl.uniform1f(U.uMouseStrength, o.mouseStrength);
  gl.uniform1f(U.uEnableMouse, o.mouseInteraction ? 1 : 0);

  /* The shader premultiplies, so blend with ONE rather than SRC_ALPHA. */
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr);
    const w = Math.max(1, Math.round(host.clientWidth * dpr));
    const h = Math.max(1, Math.round(host.clientHeight * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(U.iResolution, w, h);
  }
  resize();

  const cur = [0.5, 0.5];
  const tgt = [0.5, 0.5];
  let curActive = 0, tgtActive = 0;

  /* The host sits behind the page content and is pointer-events:none, so the
     pointer is tracked on the window and mapped into host space. */
  function onMove(e) {
    const r = host.getBoundingClientRect();
    tgt[0] = (e.clientX - r.left) / r.width;
    tgt[1] = 1 - (e.clientY - r.top) / r.height;
    tgtActive = 1;
  }
  function onLeave() { tgtActive = 0; }
  if (o.mouseInteraction) {
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave, { passive: true });
  }

  let raf = 0, live = false, visible = true, lost = false;
  const t0 = performance.now();

  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (!visible || lost) return;

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

  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); lost = true; });
  canvas.addEventListener('webglcontextrestored', () => { lost = true; });

  host.appendChild(canvas);
  raf = requestAnimationFrame(frame);

  const ro = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(host); else window.addEventListener('resize', resize);

  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '120px' })
    : null;
  if (io) io.observe(host);

  const onVis = () => { if (document.hidden) visible = false; };
  document.addEventListener('visibilitychange', onVis);

  return function destroy() {
    cancelAnimationFrame(raf);
    if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
    if (io) io.disconnect();
    document.removeEventListener('visibilitychange', onVis);
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

export default mountWebThreads;
