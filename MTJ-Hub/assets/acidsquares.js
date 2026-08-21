/* =====================================================================
   AcidSquares — MTJ edition
   由 React Bits 的 AcidSquares 移植成原生 ES module,剥掉 ogl。

   配色:原版是紫 → 粉 → 白。MTJ 是黑底金主调、紫做点缀,所以
   走廊深处留给紫(只负责纵深的冷色),晶面与最亮的边缘走金 —— 与站上
   其余七个特效同一套逻辑。

   没有移植 blur 后处理:原版那条路要两张 RenderTarget 做两趟高斯模糊,
   而 blur 预设就是 0(不启用)。为了不把这支档变成一个迷你渲染框架,
   这里只做主 pass;真要模糊,用 CSS filter 更省事。

   着色器是 #version 300 es,所以必须 WebGL2;拿不到就回 null,
   呼叫端自己降级(封面本来就有静态底色)。
   ===================================================================== */

const VERT = `#version 300 es
in vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed, uWaveDepth, uZoom, uDensity, uSpread, uStepSize;
uniform float uGlow, uExposure, uColorShift, uContrast, uBrightness, uOpacity, uSteps;
uniform float uBloom, uBloomAt;
uniform vec3 uColor1, uColor2, uColor3;
uniform vec2 uMouse;
uniform float uMouseStrength, uMouseRadius, uEnableMouse, uMouseActive;
uniform float uGrain, uGrainIntensity;
out vec4 fragColor;

void main(){
  vec2 frag = gl_FragCoord.xy;
  float zoom = max(uZoom, 0.05);
  float aspect = iResolution.x / iResolution.y;
  vec2 ndc = (2.0 * frag - iResolution.xy) / iResolution.y;
  vec2 dir = ndc * (0.5 / zoom);

  vec2 mouseNdc = vec2(uMouse.x * aspect, uMouse.y);
  float mr = max(uMouseRadius, 0.01);
  vec2 md = ndc - mouseNdc;
  float dent = exp(-dot(md, md) / (mr * mr)) * (3.0 * uMouseStrength * uEnableMouse * uMouseActive);

  float travel  = sin(iTime * uSpeed) * uWaveDepth;
  float density = max(uDensity, 1.0);
  float spread  = clamp(uSpread, 0.05, 0.6);
  float stepSz  = max(uStepSize, 0.0005);
  float gain    = max(uGlow, 0.0);

  vec3 tOffset = vec3(0.0, dent, travel);
  vec3 p = vec3(0.0);
  float s = 0.0, glow = 0.0;

  for(int i = 0; i < 64; i++){
    if(float(i) >= uSteps) break;
    p += vec3(dir * s, s);
    vec3 q = p + tOffset;
    s += density - length(q.xz) + length(ceil(q).xy);
    s = stepSz + abs(s) * spread;
    glow += gain / s;
  }

  float e = glow / max(uExposure, 1.0);
  float shimmer = 0.5 + 0.5 * dot(cos(iTime * uColorShift + p), vec3(0.3333));
  float v = tanh(e * uBrightness * mix(0.7, 1.05, shimmer));
  v = clamp((v - 0.5) * uContrast + 0.5, 0.0, 1.0);

  vec3 col = mix(uColor1, uColor2, smoothstep(0.0, 0.55, v));
  col = mix(col, uColor3, smoothstep(0.55, 1.0, v));
  col *= v;

  /* 晶面之间那些最亮的棱,额外补一圈热光晕。
     遮罩取 v 的高段,所以只有本来就亮的边会发光,暗处不会整片泛白;
     halo 用饱和金、只有最核心才推到浅金,免得溢出后变成银白 —— 这站的金
     不能烧掉。 */
  float hot = smoothstep(uBloomAt, 1.0, v);
  col += mix(uColor2, uColor3, hot) * hot * hot * uBloom;

  float a = clamp(v + hot * hot * uBloom * 0.45, 0.0, 1.0) * uOpacity;
  vec3 outRgb = col * a;                    // 预乘 alpha
  if(uGrain > 0.5){
    float g = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453) - 0.5) * uGrainIntensity;
    outRgb = clamp(outRgb + g, 0.0, 1.0);
    a = clamp(a + g, 0.0, 1.0);
  }
  fragColor = vec4(outRgb, a);
}
`;

const hexToRgb = (hex) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
};

const STEPS = { low: 20, medium: 32, high: 48 };

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn('[acidsquares] shader:', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

/* MTJ 预设:紫在深处撑纵深,金是晶面,亮金是最烫的那条边 */
export const MTJ_ACID = {
  color1: '#4B2E8F',      // 走廊深处
  color2: '#E8C877',      // 晶面
  color3: '#FCE9A8',      // 最亮的边
  detail: 'medium',
  speed: 0.62,
  waveDepth: 1,
  zoom: 1.35,
  density: 10.0,
  glow: 1.35,
  exposure: 2200,
  bloom: 0.85,        // 热光晕强度
  bloomAt: 0.52,      // 从哪一段亮度开始发光,越低发光范围越大
  spread: 0.3,
  stepSize: 0.002,
  colorShift: 0.35,
  contrast: 1.12,
  brightness: 1.0,
  opacity: 1.0,
  mouseInteraction: true,
  mouseStrength: 0.1,
  mouseRadius: 0.35,
  grain: true,
  grainIntensity: 0.045,
  maxDpr: 2
};

export function mountAcidSquares(target, opts = {}) {
  const host = typeof target === 'string' ? document.querySelector(target) : target;
  if (!host) return null;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  const o = { ...MTJ_ACID, ...opts };

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  const gl = canvas.getContext('webgl2', {
    alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false
  });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, 'position');
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('[acidsquares] link:', gl.getProgramInfoLog(prog));
    return null;
  }
  gl.useProgram(prog);

  /* 覆盖整个裁剪空间的单个三角形 */
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const U = {};
  const u = (n) => (U[n] !== undefined ? U[n] : (U[n] = gl.getUniformLocation(prog, n)));
  const f = (n, v) => gl.uniform1f(u(n), v);
  const v2 = (n, a, b) => gl.uniform2f(u(n), a, b);
  const v3 = (n, c) => gl.uniform3f(u(n), c[0], c[1], c[2]);

  f('uSpeed', o.speed);        f('uWaveDepth', o.waveDepth);
  f('uZoom', o.zoom);          f('uDensity', o.density);
  f('uSpread', o.spread);      f('uStepSize', o.stepSize);
  f('uGlow', o.glow);          f('uExposure', o.exposure);
  f('uColorShift', o.colorShift); f('uContrast', o.contrast);
  f('uBloom', o.bloom);        f('uBloomAt', o.bloomAt);
  f('uBrightness', o.brightness); f('uOpacity', o.opacity);
  f('uSteps', STEPS[o.detail] || STEPS.medium);
  v3('uColor1', hexToRgb(o.color1));
  v3('uColor2', hexToRgb(o.color2));
  v3('uColor3', hexToRgb(o.color3));
  f('uMouseStrength', o.mouseStrength);
  f('uMouseRadius', o.mouseRadius);
  f('uEnableMouse', o.mouseInteraction ? 1 : 0);
  f('uGrain', o.grain ? 1 : 0);
  f('uGrainIntensity', o.grainIntensity);

  host.appendChild(canvas);

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr);
    const r = host.getBoundingClientRect();
    const w = Math.max(1, Math.floor(r.width * dpr));
    const h = Math.max(1, Math.floor(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      v2('iResolution', w, h);
    }
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  let cur = [0, 0], tgt = [0, 0], act = 0, actTgt = 0;
  const onMove = (e) => {
    const r = host.getBoundingClientRect();
    tgt = [((e.clientX - r.left) / r.width - 0.5) * 2, -((e.clientY - r.top) / r.height - 0.5) * 2];
    actTgt = 1;
  };
  const onLeave = () => { actTgt = 0; };
  host.addEventListener('mousemove', onMove);
  host.addEventListener('mouseleave', onLeave);

  let raf = 0, onScreen = true;
  const t0 = performance.now();

  const frame = (t) => {
    /* 每帧读 document.hidden,不用事件去锁一个布尔值 —— 那样切回分页会死。 */
    if (document.hidden || !onScreen) { raf = 0; return; }
    f('iTime', (t - t0) * 0.001);
    cur[0] += 0.05 * (tgt[0] - cur[0]);
    cur[1] += 0.05 * (tgt[1] - cur[1]);
    v2('uMouse', cur[0], cur[1]);
    act += 0.05 * ((o.mouseInteraction ? actTgt : 0) - act);
    f('uMouseActive', act);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!raf && !document.hidden && onScreen) raf = requestAnimationFrame(frame); };

  const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; start(); }, { threshold: 0 });
  io.observe(host);
  document.addEventListener('visibilitychange', start);
  start();

  return {
    destroy() {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', start);
      host.removeEventListener('mousemove', onMove);
      host.removeEventListener('mouseleave', onLeave);
      canvas.remove();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  };
}
