/* ============================================================================
   Orb — React Bits <Orb /> 原生移植

   上游是 React + `ogl`。ogl 在这里也只做一件事:把一个全屏三角交给一个片元
   着色器。所以直接写 WebGL1,着色器整段照抄,一个字没改 —— 这一支刻意不做
   主题化,配色就是上游那三颗(紫 / 青 / 深蓝),hue 保持 0。

   跟上游唯一不同的是混合方式。着色器最後输出的是
       gl_FragColor = vec4(col.rgb * col.a, col.a);
   已经预乘过 alpha 了,而上游给 ogl 的是 premultipliedAlpha:false,配的是
   SRC_ALPHA / ONE_MINUS_SRC_ALPHA —— 等于把 alpha 乘了两次,球的边缘会比
   应有的暗一圈。这里用 ONE / ONE_MINUS_SRC_ALPHA,让它按预乘的方式合成。

   球是透明底的,只画中间那颗;外面留空,所以它是叠在页面既有的深色封面上,
   不是盖住它。
   ========================================================================== */

const VERT = `
precision highp float;
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

/* ↓↓↓ 以下整段与上游一致 ↓↓↓ */
const FRAG = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform float hue;
uniform float hover;
uniform float rot;
uniform float hoverIntensity;
uniform vec3 backgroundColor;
varying vec2 vUv;

vec3 rgb2yiq(vec3 c) {
  float y = dot(c, vec3(0.299, 0.587, 0.114));
  float i = dot(c, vec3(0.596, -0.274, -0.322));
  float q = dot(c, vec3(0.211, -0.523, 0.312));
  return vec3(y, i, q);
}

vec3 yiq2rgb(vec3 c) {
  float r = c.x + 0.956 * c.y + 0.621 * c.z;
  float g = c.x - 0.272 * c.y - 0.647 * c.z;
  float b = c.x - 1.106 * c.y + 1.703 * c.z;
  return vec3(r, g, b);
}

vec3 adjustHue(vec3 color, float hueDeg) {
  float hueRad = hueDeg * 3.14159265 / 180.0;
  vec3 yiq = rgb2yiq(color);
  float cosA = cos(hueRad);
  float sinA = sin(hueRad);
  float i = yiq.y * cosA - yiq.z * sinA;
  float q = yiq.y * sinA + yiq.z * cosA;
  yiq.y = i;
  yiq.z = q;
  return yiq2rgb(yiq);
}

vec3 hash33(vec3 p3) {
  p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
  p3 += dot(p3, p3.yxz + 19.19);
  return -1.0 + 2.0 * fract(vec3(
    p3.x + p3.y,
    p3.x + p3.z,
    p3.y + p3.z
  ) * p3.zyx);
}

float snoise3(vec3 p) {
  const float K1 = 0.333333333;
  const float K2 = 0.166666667;
  vec3 i = floor(p + (p.x + p.y + p.z) * K1);
  vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
  vec3 e = step(vec3(0.0), d0 - d0.yzx);
  vec3 i1 = e * (1.0 - e.zxy);
  vec3 i2 = 1.0 - e.zxy * (1.0 - e);
  vec3 d1 = d0 - (i1 - K2);
  vec3 d2 = d0 - (i2 - K1);
  vec3 d3 = d0 - 0.5;
  vec4 h = max(0.6 - vec4(
    dot(d0, d0),
    dot(d1, d1),
    dot(d2, d2),
    dot(d3, d3)
  ), 0.0);
  vec4 n = h * h * h * h * vec4(
    dot(d0, hash33(i)),
    dot(d1, hash33(i + i1)),
    dot(d2, hash33(i + i2)),
    dot(d3, hash33(i + 1.0))
  );
  return dot(vec4(31.316), n);
}

vec4 extractAlpha(vec3 colorIn) {
  float a = max(max(colorIn.r, colorIn.g), colorIn.b);
  return vec4(colorIn.rgb / (a + 1e-5), a);
}

const vec3 baseColor1 = vec3(0.611765, 0.262745, 0.996078);
const vec3 baseColor2 = vec3(0.298039, 0.760784, 0.913725);
const vec3 baseColor3 = vec3(0.062745, 0.078431, 0.600000);
const float innerRadius = 0.6;
const float noiseScale = 0.65;

float light1(float intensity, float attenuation, float dist) {
  return intensity / (1.0 + dist * attenuation);
}
float light2(float intensity, float attenuation, float dist) {
  return intensity / (1.0 + dist * dist * attenuation);
}

vec4 draw(vec2 uv) {
  vec3 color1 = adjustHue(baseColor1, hue);
  vec3 color2 = adjustHue(baseColor2, hue);
  vec3 color3 = adjustHue(baseColor3, hue);

  float ang = atan(uv.y, uv.x);
  float len = length(uv);
  float invLen = len > 0.0 ? 1.0 / len : 0.0;

  float bgLuminance = dot(backgroundColor, vec3(0.299, 0.587, 0.114));

  float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.5)) * 0.5 + 0.5;
  float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
  float d0 = distance(uv, (r0 * invLen) * uv);
  float v0 = light1(1.0, 10.0, d0);

  v0 *= smoothstep(r0 * 1.05, r0, len);
  float innerFade = smoothstep(r0 * 0.8, r0 * 0.95, len);
  v0 *= mix(innerFade, 1.0, bgLuminance * 0.7);
  float cl = cos(ang + iTime * 2.0) * 0.5 + 0.5;

  float a = iTime * -1.0;
  vec2 pos = vec2(cos(a), sin(a)) * r0;
  float d = distance(uv, pos);
  float v1 = light2(1.5, 5.0, d);
  v1 *= light1(1.0, 50.0, d0);

  float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
  float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);

  vec3 colBase = mix(color1, color2, cl);
  float fadeAmount = mix(1.0, 0.1, bgLuminance);

  vec3 darkCol = mix(color3, colBase, v0);
  darkCol = (darkCol + v1) * v2 * v3;
  darkCol = clamp(darkCol, 0.0, 1.0);

  vec3 lightCol = (colBase + v1) * mix(1.0, v2 * v3, fadeAmount);
  lightCol = mix(backgroundColor, lightCol, v0);
  lightCol = clamp(lightCol, 0.0, 1.0);

  vec3 finalCol = mix(darkCol, lightCol, bgLuminance);

  return extractAlpha(finalCol);
}

vec4 mainImage(vec2 fragCoord) {
  vec2 center = iResolution.xy * 0.5;
  float size = min(iResolution.x, iResolution.y);
  vec2 uv = (fragCoord - center) / size * 2.0;

  float angle = rot;
  float s = sin(angle);
  float c = cos(angle);
  uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);

  uv.x += hover * hoverIntensity * 0.1 * sin(uv.y * 10.0 + iTime);
  uv.y += hover * hoverIntensity * 0.1 * sin(uv.x * 10.0 + iTime);

  return draw(uv);
}

void main() {
  vec2 fragCoord = vUv * iResolution.xy;
  vec4 col = mainImage(fragCoord);
  gl_FragColor = vec4(col.rgb * col.a, col.a);
}
`;
/* ↑↑↑ 以上整段与上游一致 ↑↑↑ */

const DEFAULTS = {
  hue: 0,                    /* 0 = 上游原色,不做主题化 */
  hoverIntensity: 0.35,
  rotateOnHover: true,
  forceHoverState: false,
  backgroundColor: '#000000',
  rotationSpeed: 0.3,
  maxDpr: 2
};

function hexToVec3(color) {
  const h = String(color).replace('#', '');
  const s = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(s, 16);
  if (isNaN(n)) return [0, 0, 0];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) || 'compile failed');
  }
  return sh;
}

export function mountOrb(target, options = {}) {
  const host = typeof target === 'string' ? document.querySelector(target) : target;
  if (!host) return null;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return null;

  const o = Object.assign({}, DEFAULTS, options);

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  /* 画布样式定死在这里,不依赖页面 CSS —— 少了那条规则,canvas 会以自己的
     装置像素尺寸当行内元素排版,只看得到左上角一块。 */
  Object.assign(canvas.style, {
    position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block'
  });

  const gl = canvas.getContext('webgl', {
    alpha: true, premultipliedAlpha: true, antialias: true,
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

  /* 着色器输出的是预乘过的 alpha,所以是 ONE 不是 SRC_ALPHA */
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

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
  ['iTime', 'iResolution', 'hue', 'hover', 'rot', 'hoverIntensity', 'backgroundColor']
    .forEach(n => { U[n] = gl.getUniformLocation(program, n); });

  gl.uniform1f(U.hue, o.hue);
  gl.uniform1f(U.hoverIntensity, o.hoverIntensity);
  gl.uniform3fv(U.backgroundColor, hexToVec3(o.backgroundColor));

  function resize() {
    const dpr = Math.min(o.maxDpr, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(host.clientWidth * dpr));
    const h = Math.max(1, Math.round(host.clientHeight * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform3f(U.iResolution, w, h, w / h);
  }

  const ro = ('ResizeObserver' in window) ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(host); else window.addEventListener('resize', resize);

  /* 上游把滑鼠事件挂在容器上。这里容器是 pointer-events:none 的背景层,
     挂上去一个事件都收不到 —— 改挂 window,再自己换算成容器内座标。 */
  let targetHover = 0;
  const onMove = e => {
    const r = host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const size = Math.min(r.width, r.height);
    const uvX = ((e.clientX - r.left - r.width / 2) / size) * 2;
    const uvY = ((e.clientY - r.top - r.height / 2) / size) * 2;
    targetHover = Math.sqrt(uvX * uvX + uvY * uvY) < 0.8 ? 1 : 0;
  };
  const onLeave = () => { targetHover = 0; };
  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('mouseout', onLeave, { passive: true });

  host.appendChild(canvas);
  resize();

  let raf = 0, dead = false, visible = true, last = 0, hover = 0, rot = 0;
  const io = ('IntersectionObserver' in window)
    ? new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '80px' })
    : null;
  if (io) io.observe(host);

  function frame(t) {
    if (dead) return;
    raf = requestAnimationFrame(frame);
    const dt = last ? (t - last) * 0.001 : 0;
    last = t;
    if (!visible) return;                      /* 卷出视窗就别画了 */
    resize();

    const eff = o.forceHoverState ? 1 : targetHover;
    hover += (eff - hover) * 0.1;
    if (o.rotateOnHover && eff > 0.5) rot += dt * o.rotationSpeed;

    gl.uniform1f(U.iTime, t * 0.001);
    gl.uniform1f(U.hover, hover);
    gl.uniform1f(U.rot, rot);
    gl.clear(gl.COLOR_BUFFER_BIT);
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
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
      if (canvas.parentElement) canvas.parentElement.removeChild(canvas);
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    }
  };
}

export default mountOrb;
