/* ============================================================================
   LiquidChrome — MTJ theme port
   ----------------------------------------------------------------------------
   Vanilla ES module port of the React Bits <LiquidChrome /> component.

   Upstream ships React + `ogl`. ogl here does exactly one thing — hand a
   full-screen triangle to a single fragment shader — so it is written straight
   against WebGL1 and the shader source stays byte-for-byte GLSL ES 1.00, no
   version juggling and no CDN at runtime.

   WebGL1, not 2, on purpose: this shader needs nothing from ES 3.00, and the
   `for (float i = 1.0; i < 10.0; i++)` loop already satisfies WebGL1's
   constant-bound requirement.

   Two departures from upstream, both deliberate:

   1. Theme. Upstream's uBaseColor is a neutral dark grey and the whole image
      is `base / abs(sin(...))` — the base colour IS the palette, and it has to
      stay dark or the division blows the frame to white. So the MTJ gold is
      normalised and pushed back down to that ~0.11 level, and a violet accent
      is mixed in on a slow diagonal phase. Violet arrives as a drift across
      one side rather than a second body colour, same treatment as
      slicedwaves.js.

   2. A floor under the divisor. `1/abs(sin(x))` is unbounded: wherever sin
      crosses zero the pixel goes to pure white and the gold is gone at exactly
      the places the eye is drawn to. Clamping the divisor caps the highlight
      at base/floor, so the ridges read as lit metal instead of blown-out paper.

   Resolution: rendered at CSS pixels (dpr capped at 1.25), like upstream's
   `scale = 1`. This shader costs 9 samples x a 9-iteration loop per pixel;
   at dpr 2 on a laptop that is four times the work for a background nobody
   is looking at directly.

   Upstream's own defaults and its published props table disagree (speed
   0.2 vs 1.0, amplitude 0.3 vs 0.6, frequency 3/3 vs 2.5/1.5). The values
   below are tuned for a hero sitting behind white type — calmer than either.
   ========================================================================== */

const VERT = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
uniform float uTime;
uniform vec3  uResolution;
uniform vec3  uBaseColor;
uniform vec3  uAccentColor;
uniform float uAccentMix;
uniform float uAmplitude;
uniform float uFrequencyX;
uniform float uFrequencyY;
uniform float uFloor;
uniform vec2  uMouse;
varying vec2 vUv;

vec4 renderImage(vec2 uvCoord){
  vec2 fragCoord = uvCoord * uResolution.xy;
  vec2 uv = (2.0 * fragCoord - uResolution.xy) / min(uResolution.x, uResolution.y);
  vec2 uv0 = uv;                       /* 扭曲之前的坐标,紫色要挂在这上面 */

  for (float i = 1.0; i < 10.0; i++){
    uv.x += uAmplitude / i * cos(i * uFrequencyX * uv.y + uTime + uMouse.x * 3.14159);
    uv.y += uAmplitude / i * cos(i * uFrequencyY * uv.x + uTime + uMouse.y * 3.14159);
  }

  vec2  diff    = (uvCoord - uMouse);
  float dist    = length(diff);
  float falloff = exp(-dist * 20.0);
  float ripple  = sin(10.0 * dist - uTime * 2.0) * 0.03;
  uv += (diff / (dist + 0.0001)) * ripple * falloff;

  /* 紫色挂在【未扭曲】的 uv0 上,不是上面那个被搅过的 uv。
     用 uv 的话相位会跟着整片液体一起横扫,某些时刻全屏都是紫的 ——
     那不是「微加一点」,那是换了个主题色。挂在 uv0 上它就固定在画面的
     一角,只随时间缓慢移动。
     smoothstep 再把它收窄:全场淡淡掺一点紫,结果只是金被洗灰。 */
  float s = 0.5 + 0.5 * sin(uv0.x * 0.9 - uv0.y * 0.7 + uTime * 0.18);
  float a = smoothstep(0.58, 1.0, s);
  vec3 base = mix(uBaseColor, uAccentColor, a * uAccentMix);

  /* 除数给个下限。1/abs(sin) 没有上界,sin 过零的地方会直接烧成纯白 ——
     偏偏那正是眼睛会看的地方,金色在那里就没了。 */
  float d = max(abs(sin(uTime - uv.y - uv.x)), uFloor);
  return vec4(base / d, 1.0);
}

void main(){
  vec3 col = vec3(0.0);
  float px = 1.0 / min(uResolution.x, uResolution.y);
  for (int i = 0; i < SAMPLES; i++){
    for (int j = 0; j < SAMPLES; j++){
      vec2 off = (vec2(float(i), float(j)) - float(SAMPLES - 1) * 0.5) * px;
      col += renderImage(vUv + off).rgb;
    }
  }
  gl_FragColor = vec4(col / float(SAMPLES * SAMPLES), 1.0);
}
`;

const DEFAULTS = {
  /* 用 --gold-deep 不用 --gold-bright:亮脊被除数放大到接近 1,而 #E8C877
     的蓝通道有红的一半,拉到那个亮度就读成暖白,金色没了。#C9A227 的蓝只有
     红的两成,同样亮度下还认得出是金的。 */
  baseColor:   '#C9A227',
  accentColor: '#9B6BF2',   /* MTJ 紫 */
  baseLevel:   0.115,       /* 把主题色压回上游 [0.1,0.1,0.1] 那个量级 */
  accentLevel: 0.132,       /* 紫的明度稍高一点,不然混进去看不出来 */
  accentMix:   0.70,
  speed:       0.34,
  amplitude:   0.45,
  frequencyX:  2.5,
  frequencyY:  1.5,
  /* 亮脊封顶 = baseLevel / floor ≈ 0.79。留在 1 以下,高光才是「亮的金」
     而不是「白的」。 */
  floor:       0.145,
  interactive: true,
  /* 上游是 3×3 超采样 —— 每个像素把那个九次谐波的循环跑九遍。2×2 省掉
     55% 的着色量,而上面那个除数下限已经把最尖的脊剪平了,真正需要抗锯齿
     的边本来就没剩多少;两者的差别在这个尺度上看不出来。
     这是为手机省的:桌面上本来就跑得动。 */
  samples:     2,
  maxDpr:      1
};

/* 十六进制 → 归一化後再压到指定明度。直接用 #E8C877 当 base 会整片过曝:
   这颗色的亮度 0.78,而上游的 base 是 0.1。 */
function tint(hex, level) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const lum = Math.max(1e-4, 0.2126 * r + 0.7152 * g + 0.0722 * b);
  const k = level / lum;
  return new Float32Array([r * k, g * k, b * k]);
}

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s) || 'compile failed');
  }
  return s;
}

export function mountLiquidChrome(target, options = {}) {
  const host = typeof target === 'string' ? document.querySelector(target) : target;
  if (!host) return null;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return null;

  const o = Object.assign({}, DEFAULTS, options);

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  /* 画布样式在这里定死,不依赖页面 CSS —— 页面那条规则一旦被弄丢,canvas
     会以自己的装置像素尺寸当行内元素排版,只看得到左上角一块。 */
  Object.assign(canvas.style, {
    position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block'
  });

  const gl = canvas.getContext('webgl', {
    alpha: false, antialias: false, depth: false, stencil: false,
    powerPreference: 'low-power'
  });
  if (!gl) return null;

  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    /* SAMPLES 必须是编译期常量:WebGL1 的 GLSL 只接受常量循环边界 */
    const samp = Math.max(1, Math.min(3, Math.round(o.samples)));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER,
      '#define SAMPLES ' + samp + '\n' + FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'link failed');
    }
  } catch (e) {
    return null;
  }
  gl.useProgram(program);

  /* 一个覆盖全屏的大三角,不是两个三角拼的矩形:少一条对角接缝,少一次插值。 */
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
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
  ['uTime', 'uResolution', 'uBaseColor', 'uAccentColor', 'uAccentMix',
   'uAmplitude', 'uFrequencyX', 'uFrequencyY', 'uFloor', 'uMouse']
    .forEach(n => { U[n] = gl.getUniformLocation(program, n); });

  gl.uniform3fv(U.uBaseColor, tint(o.baseColor, o.baseLevel));
  gl.uniform3fv(U.uAccentColor, tint(o.accentColor, o.accentLevel));
  gl.uniform1f(U.uAccentMix, o.accentMix);
  gl.uniform1f(U.uAmplitude, o.amplitude);
  gl.uniform1f(U.uFrequencyX, o.frequencyX);
  gl.uniform1f(U.uFrequencyY, o.frequencyY);
  gl.uniform1f(U.uFloor, o.floor);
  gl.uniform2f(U.uMouse, 0.5, 0.5);

  function resize() {
    const dpr = Math.min(o.maxDpr, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(host.clientWidth * dpr));
    const h = Math.max(1, Math.round(host.clientHeight * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform3f(U.uResolution, w, h, w / h);
  }

  const ro = ('ResizeObserver' in window) ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(host); else window.addEventListener('resize', resize);

  function pointer(clientX, clientY) {
    const r = host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    gl.uniform2f(U.uMouse,
      (clientX - r.left) / r.width,
      1 - (clientY - r.top) / r.height);
  }
  const onMove = e => pointer(e.clientX, e.clientY);
  const onTouch = e => { if (e.touches.length) pointer(e.touches[0].clientX, e.touches[0].clientY); };
  if (o.interactive) {
    /* 监听挂在 window 上,不是容器上 —— 容器是 pointer-events:none 的背景层,
       挂在它身上一个事件都收不到。 */
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
  }

  host.appendChild(canvas);
  resize();

  let raf = 0, dead = false, visible = true;
  const io = ('IntersectionObserver' in window)
    ? new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '80px' })
    : null;
  if (io) io.observe(host);

  function frame(t) {
    if (dead) return;
    raf = requestAnimationFrame(frame);
    if (!visible) return;                 /* 卷出视窗就别画了 */
    resize();
    gl.uniform1f(U.uTime, t * 0.001 * o.speed);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  raf = requestAnimationFrame(frame);
  requestAnimationFrame(() => host.classList.add('is-live'));

  return {
    destroy() {
      dead = true;
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
      if (io) io.disconnect();
      if (o.interactive) {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('touchmove', onTouch);
      }
      if (canvas.parentElement) canvas.parentElement.removeChild(canvas);
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    }
  };
}

export default mountLiquidChrome;
