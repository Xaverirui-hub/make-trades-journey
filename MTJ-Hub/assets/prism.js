/* ============================================================================
   Prism — MTJ port
   ----------------------------------------------------------------------------
   Vanilla ES module port of the React Bits <Prism /> component.

   Same treatment as galaxy.js / webthreads.js / lightfall.js: upstream ships
   React + `ogl`, but ogl here only wraps a single full-screen fragment shader
   in renderer/program/triangle boilerplate. That boilerplate is written
   straight against WebGL1 below, so the site keeps its no-build, no-CDN,
   zero-dependency shape and the whole effect is ~7 KB from our own origin.

   The shader is a raymarched pyramid: 100 steps per pixel, each accumulating
   a sine-banded colour divided by the distance estimate. That is the single
   most expensive thing on the site, so:
     - the pixel ratio is capped at 2; the reference demo itself runs at 1
     - the frame loop parks the moment the cover scrolls out of view
     - prefers-reduced-motion skips the mount entirely and the CSS gradient
       underneath is what people see

   Colours are upstream's — no hue shift, no attempt to force it into the
   site's gold.

   One thing the props table gets you wrong: it lists noise's default as 0.5,
   but the demo on reactbits.dev — the one that actually looks good — runs it
   at 0. That 0.5 film grain is the whole difference between "lit" and "hazy".

   The headline stays readable without a heavy scrim because it sits inside
   the pyramid's dark interior, which is how the reference composes it too.
   ========================================================================== */

const VERT = `
attribute vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }
`;

/* Upstream's fragment shader, unchanged apart from dropping uScale (the
   compiler strips it anyway — uPxScale is what actually carries the scale). */
const FRAG = `
precision highp float;

uniform vec2  iResolution;
uniform float iTime;

uniform float uHeight;
uniform float uBaseHalf;
uniform mat3  uRot;
uniform int   uUseBaseWobble;
uniform float uGlow;
uniform vec2  uOffsetPx;
uniform float uNoise;
uniform float uSaturation;
uniform float uHueShift;
uniform float uColorFreq;
uniform float uBloom;
uniform float uCenterShift;
uniform float uInvBaseHalf;
uniform float uInvHeight;
uniform float uMinAxis;
uniform float uPxScale;
uniform float uTimeScale;

vec4 tanh4(vec4 x){
  vec4 e2x = exp(2.0 * x);
  return (e2x - 1.0) / (e2x + 1.0);
}

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
}

float sdOctaAnisoInv(vec3 p){
  vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);
  float m = q.x + q.y + q.z - 1.0;
  return m * uMinAxis * 0.5773502691896258;
}

float sdPyramidUpInv(vec3 p){
  float oct = sdOctaAnisoInv(p);
  float halfSpace = -p.y;
  return max(oct, halfSpace);
}

mat3 hueRotation(float a){
  float c = cos(a), s = sin(a);
  mat3 W = mat3(0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114);
  mat3 U = mat3(0.701, -0.587, -0.114, -0.299, 0.413, -0.114, -0.300, -0.588, 0.886);
  mat3 V = mat3(0.168, -0.331, 0.500, 0.328, 0.035, -0.500, -0.497, 0.296, 0.201);
  return W + U * c + V * s;
}

void main(){
  vec2 f = (gl_FragCoord.xy - 0.5 * iResolution.xy - uOffsetPx) * uPxScale;

  float z = 5.0;
  float d = 0.0;

  vec3 p;
  vec4 o = vec4(0.0);

  float centerShift = uCenterShift;
  float cf = uColorFreq;

  mat2 wob = mat2(1.0);
  if (uUseBaseWobble == 1) {
    float t = iTime * uTimeScale;
    float c0 = cos(t + 0.0);
    float c1 = cos(t + 33.0);
    float c2 = cos(t + 11.0);
    wob = mat2(c0, c1, c2, c0);
  }

  const int STEPS = 100;
  for (int i = 0; i < STEPS; i++) {
    p = vec3(f, z);
    p.xz = p.xz * wob;
    p = uRot * p;
    vec3 q = p;
    q.y += centerShift;
    d = 0.1 + 0.2 * abs(sdPyramidUpInv(q));
    z -= d;
    o += (sin((p.y + z) * cf + vec4(0.0, 1.0, 2.0, 3.0)) + 1.0) / d;
  }

  o = tanh4(o * o * (uGlow * uBloom) / 1e5);

  vec3 col = o.rgb;
  float n = rand(gl_FragCoord.xy + vec2(iTime));
  col += (n - 0.5) * uNoise;
  col = clamp(col, 0.0, 1.0);

  float L = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);

  if (abs(uHueShift) > 0.0001) {
    col = clamp(hueRotation(uHueShift) * col, 0.0, 1.0);
  }

  gl_FragColor = vec4(col, o.a);
}
`;

const DEFAULTS = {
  height: 3.5,
  baseWidth: 5.5,
  animationType: 'rotate',   /* 'rotate' | 'hover' | '3drotate' */
  glow: 1,
  offset: { x: 0, y: 0 },
  noise: 0.5,
  transparent: true,
  scale: 3.6,
  hueShift: 0,
  colorFrequency: 1,
  hoverStrength: 2,
  inertia: 0.05,
  bloom: 1,
  timeScale: 0.5,
  /* minHalfWidth:横向至少要看得到几个世界单位(半宽)。
     上游的 uPxScale = 1/(bufferHeight*0.1*scale) 只看高度,所以 f.y 恒等於
     5/scale,f.x 则随长宽比走。他们的示例框是 1.83:1,算出来 f.x≈2.54,棱镜
     刚好撑满 —— 一般桌面封面(约 1.5:1 到 2.5:1)套同一条公式就是同样的构图。
     但封面若接近正方或更高(窄视窗、拉长的封面),f.x 会掉到 1.4 以下,等於把
     镜头怼进棱镜内部,只剩一团过曝的光。这里给一个下限:横向不够就改按宽度
     取景,宁可上下留白,也不要切进去。设成 null 就完全照上游。 */
  minHalfWidth: 2.4,
  /* 属性表写 noise 预设 0.5,但官网那个好看的 Demo 实际跑的是 0 ——
     0.5 的胶片颗粒就是「朦」的来源。要那个通透的样子就把它关掉。
     颗粒关掉之後 dpr 1 就够(官网 Demo 也正是 dpr 1),不用超采样。 */
  minDpr: 1,
  maxDpr: 2
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

/* Upstream builds the rotation from yaw/pitch/roll and hands ogl a column-major
   mat3. WebGL1 uniformMatrix3fv takes the same column-major layout, so the
   index order below is copied verbatim rather than re-derived. */
function setMat3FromEuler(yawY, pitchX, rollZ, out) {
  const cy = Math.cos(yawY), sy = Math.sin(yawY);
  const cx = Math.cos(pitchX), sx = Math.sin(pitchX);
  const cz = Math.cos(rollZ), sz = Math.sin(rollZ);

  out[0] = cy * cz + sy * sx * sz;
  out[1] = cx * sz;
  out[2] = -sy * cz + cy * sx * sz;
  out[3] = -cy * sz + sy * sx * cz;
  out[4] = cx * cz;
  out[5] = sy * sz + cy * sx * cz;
  out[6] = sy * cx;
  out[7] = -sx;
  out[8] = cy * cx;
  return out;
}

export function mountPrism(target, options = {}) {
  const host = typeof target === 'string' ? document.querySelector(target) : target;
  if (!host) return null;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return null;

  const o = Object.assign({}, DEFAULTS, options);

  const H = Math.max(0.001, o.height);
  const BASE_HALF = Math.max(0.001, o.baseWidth) * 0.5;
  const SCALE = Math.max(0.001, o.scale);
  const TS = Math.max(0, o.timeScale);
  const HOVSTR = Math.max(0, o.hoverStrength || 1);
  const INERT = Math.max(0, Math.min(1, o.inertia || 0.12));
  const SAT = o.transparent ? 1.5 : 1;

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

  /* Full-screen triangle, same three verts ogl's Triangle geometry uses. */
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  [
    'iResolution', 'iTime', 'uHeight', 'uBaseHalf', 'uRot', 'uUseBaseWobble',
    'uGlow', 'uOffsetPx', 'uNoise', 'uSaturation', 'uHueShift', 'uColorFreq',
    'uBloom', 'uCenterShift', 'uInvBaseHalf', 'uInvHeight', 'uMinAxis',
    'uPxScale', 'uTimeScale'
  ].forEach(n => { U[n] = gl.getUniformLocation(program, n); });

  gl.uniform1f(U.uHeight, H);
  gl.uniform1f(U.uBaseHalf, BASE_HALF);
  gl.uniform1f(U.uGlow, Math.max(0, o.glow));
  gl.uniform1f(U.uNoise, Math.max(0, o.noise));
  gl.uniform1f(U.uSaturation, SAT);
  gl.uniform1f(U.uHueShift, o.hueShift || 0);
  gl.uniform1f(U.uColorFreq, Math.max(0, o.colorFrequency || 1));
  gl.uniform1f(U.uBloom, Math.max(0, o.bloom || 1));
  gl.uniform1f(U.uCenterShift, H * 0.25);
  gl.uniform1f(U.uInvBaseHalf, 1 / BASE_HALF);
  gl.uniform1f(U.uInvHeight, 1 / H);
  gl.uniform1f(U.uMinAxis, Math.min(BASE_HALF, H));
  gl.uniform1f(U.uTimeScale, TS);
  gl.uniform1i(U.uUseBaseWobble, o.animationType === 'rotate' ? 1 : 0);

  const rotBuf = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  gl.uniformMatrix3fv(U.uRot, false, rotBuf);

  /* Upstream turns blending off and lets the canvas alpha do the compositing
     against the page. Matching that is what makes the glow read as light
     floating over the cover rather than a flat panel sitting on it. */
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.disable(gl.BLEND);
  gl.clearColor(0, 0, 0, 0);

  let dpr = 1;
  function resize() {
    dpr = Math.min(Math.max(window.devicePixelRatio || 1, o.minDpr), o.maxDpr);
    const w = Math.max(1, Math.round(host.clientWidth * dpr));
    const h = Math.max(1, Math.round(host.clientHeight * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(U.iResolution, w, h);
    gl.uniform2f(U.uOffsetPx, (o.offset?.x ?? 0) * dpr, (o.offset?.y ?? 0) * dpr);
    var px = 1 / ((h || 1) * 0.1 * SCALE);          /* 上游:只看高度 */
    if (o.minHalfWidth) {                            /* 横向切太进去就兜底 */
      var minPx = o.minHalfWidth / ((w || 1) * 0.5);
      if (px < minPx) px = minPx;
    }
    gl.uniform1f(U.uPxScale, px);
  }
  resize();

  /* Hover mode reads the pointer against the window, not the host: the host is
     pointer-events:none behind the cover copy and would never see the move. */
  const pointer = { x: 0, y: 0, inside: false };
  function onMove(e) {
    const ww = Math.max(1, window.innerWidth);
    const wh = Math.max(1, window.innerHeight);
    pointer.x = Math.max(-1, Math.min(1, (e.clientX - ww * 0.5) / (ww * 0.5)));
    pointer.y = Math.max(-1, Math.min(1, (e.clientY - wh * 0.5) / (wh * 0.5)));
    pointer.inside = true;
  }
  function onLeave() { pointer.inside = false; }
  if (o.animationType === 'hover') {
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('blur', onLeave);
  }

  /* 3drotate uses randomised frequencies so two mounts never march in step. */
  const rnd = Math.random;
  const wX = 0.3 + rnd() * 0.6;
  const wY = 0.2 + rnd() * 0.7;
  const wZ = 0.1 + rnd() * 0.5;
  const phX = rnd() * Math.PI * 2;
  const phZ = rnd() * Math.PI * 2;

  let yaw = 0, pitch = 0, roll = 0;
  const lerp = (a, b, t) => a + (b - a) * t;

  let raf = 0, live = false, visible = true, lost = false;
  const t0 = performance.now();

  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (!visible || lost || document.hidden) return;

    const time = (t - t0) * 0.001;
    gl.uniform1f(U.iTime, time);

    if (o.animationType === 'hover') {
      const targetYaw = (pointer.inside ? -pointer.x : 0) * 0.6 * HOVSTR;
      const targetPitch = (pointer.inside ? pointer.y : 0) * 0.6 * HOVSTR;
      yaw = lerp(yaw, targetYaw, INERT);
      pitch = lerp(pitch, targetPitch, INERT);
      roll = lerp(roll, 0, 0.1);
      gl.uniformMatrix3fv(U.uRot, false, setMat3FromEuler(yaw, pitch, roll, rotBuf));
    } else if (o.animationType === '3drotate') {
      const ts = time * TS;
      yaw = ts * wY;
      pitch = Math.sin(ts * wX + phX) * 0.6;
      roll = Math.sin(ts * wZ + phZ) * 0.5;
      gl.uniformMatrix3fv(U.uRot, false, setMat3FromEuler(yaw, pitch, roll, rotBuf));
    }
    /* 'rotate' leaves uRot at identity — the wobble lives in the shader. */

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

  return function destroy() {
    cancelAnimationFrame(raf);
    if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
    if (io) io.disconnect();
    if (o.animationType === 'hover') {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('blur', onLeave);
    }
    const ext = gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    host.classList.remove('is-live');
  };
}

export default mountPrism;
