/* =====================================================================
   LightTunnel — MTJ edition
   由 React Bits 的 LightTunnel 移植成原生 ES module,剥掉 ogl。

   配色:原版是紫配紫。MTJ 是黑底金主调、紫做点缀,所以光缆与脉冲走金色
   (缆身 --gold,脉冲 --gold-bright),隧道体着色留给紫,而且透明度压得很低
   —— 紫只负责给纵深一点冷色,不参与前景。与站上其余六个特效同一套逻辑。

   着色器需要 fwidth。ES 3.00 的导数函数是核心特性,不必像 gridscan 那样
   去要 OES_standard_derivatives —— 但代价是必须 WebGL2,拿不到就返回 null,
   呼叫端自己降级。
   ===================================================================== */

const VERT = `#version 300 es
in vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed, uFlowDir, uPulseSpeed, uPulseLength, uPulseBlend, uPulseWidth;
uniform float uCableCount, uThickness, uRimWidth, uWaviness, uSway, uSize;
uniform vec2 uCenter, uMouseOffset;
uniform float uGlow, uFadeNear, uFadeFar, uBrightness, uColorVariance, uOpacity;
uniform vec3 uCableColor, uPulseColor, uTunnelColor;
uniform float uTunnelOpacity, uGrain, uGrainIntensity;
out vec4 fragColor;

void main(){
  float size        = uSize * 2.0;
  float speedBase   = uSpeed * 4.0 * uFlowDir;
  float waviness    = uWaviness * 0.15;
  float rotationOsc = uSway * 0.5;
  float baseThick   = uThickness * 0.35 + 0.05;
  float borderWt    = uRimWidth * 0.15 + 0.01;
  float cables      = floor(uCableCount);

  vec2 res = iResolution.xy;
  vec2 uv  = (gl_FragCoord.xy - 0.5 * res) / min(res.y, res.x);
  uv -= (uCenter + uMouseOffset);
  uv /= (size + 0.0001);

  float r     = length(uv);
  float angle = atan(uv.y, uv.x);
  float depth = -log(r + 0.0001);

  float swing = sin(iTime * (uSpeed * 0.5 + 0.1)) * rotationOsc;
  float wave  = sin(depth * 1.2 + iTime * speedBase * 0.25) * waviness;

  float aNorm = (angle / 6.2831853) + 0.5;
  float aFin  = fract(aNorm + wave + swing);

  float cableID = floor(aFin * cables);
  float gvX     = fract(aFin * cables) - 0.5;

  float rand      = fract(sin(cableID * 12.9898) * 43758.5453);
  float randSpeed = (0.4 + rand * 0.6) * speedBase * uPulseSpeed;
  float thick     = baseThick * (0.6 + rand * 0.4);

  vec3 cableCol = uCableColor;
  cableCol *= 1.0 + (rand - 0.5) * 0.4 * uColorVariance;
  cableCol  = mix(cableCol, uPulseColor, rand * 0.25 * uColorVariance);

  float scroll = depth + (iTime * randSpeed);
  float pf     = fract(scroll);

  float d        = abs(gvX);
  float wireMask = smoothstep(thick, thick - 0.05, d);
  float rimGlow  = smoothstep(borderWt, 0.0, abs(d - thick));

  float pThick    = thick * uPulseWidth;
  float pulseMask = smoothstep(pThick, pThick - 0.05 * uPulseWidth, d);

  float pDist = abs(pf - 0.5);
  float pTot  = uPulseLength;
  float pCore = pTot * (1.0 - uPulseBlend);
  float pLo   = min(pCore, pTot - max(fwidth(scroll), 1e-4));
  float pulse = 1.0 - smoothstep(pLo, pTot, pDist);

  float aBody  = wireMask * uTunnelOpacity;
  float aRim   = rimGlow;
  float aPulse = clamp(pulse * pulseMask, 0.0, 1.0);

  vec3 col = uTunnelColor * aBody
           + cableCol * aRim * 1.3 * uGlow
           + uPulseColor * pulse * 3.0 * pulseMask;

  float fade  = smoothstep(0.0, uFadeNear, r) * smoothstep(uFadeFar, uFadeFar - 0.9, r);
  float inten = clamp(aBody + aRim + aPulse, 0.0, 1.0) * fade;

  vec3  outRgb = col * uBrightness;
  float alpha  = clamp(inten, 0.0, 1.0) * uOpacity;
  outRgb *= alpha;                       // 预乘 alpha

  if(uGrain > 0.5){
    float g = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453) - 0.5) * uGrainIntensity;
    outRgb = clamp(outRgb + g, 0.0, 1.0);
    alpha  = clamp(alpha + g, 0.0, 1.0);
  }
  fragColor = vec4(outRgb, alpha);
}
`;

const hexToRgb = (hex) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
};

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn('[lighttunnel] shader:', gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

/* MTJ 预设:整条光缆都是金的 —— 深金实心芯 + 亮金边 + 近白热金脉冲穿行。
   三层同一个色相、不同明度,所以再怎么加强都不会偏色。

   缆芯(uTunnelColor × uTunnelOpacity)之前填的是紫、透明度 0.07,等于
   光缆只有一圈描边、中间是空的。现在填深金并把透明度拉到 0.34,光缆变
   实心,这是「更炫」最有效的一档 —— 而且完全没离开金色。

   亮度只加在外围:中心靠 fadeNear 挖空,页面那边还有暗晕和井兜着,
   所以 glow / brightness 调高不吃表单可读性(改完实测过对比度)。 */
export const MTJ_TUNNEL = {
  cableColor: '#E8C877',      // 缆身:亮金
  pulseColor: '#FFEFC0',      // 脉冲:近白的热金,冲过去时最亮的一点
  tunnelColor: '#D9AE3A',     // 缆芯:深金,给光缆厚度
  tunnelOpacity: 0.44,
  speed: 0.11,
  flowDirection: 'outward',
  pulseSpeed: 2.4,            // 脉冲跑得更快
  pulseLength: 0.32,          // 拖尾更长
  pulseBlend: 1,
  pulseWidth: 0.95,
  cableCount: 26,             // 更密
  thickness: 0.3,
  rimWidth: 0.17,             // 边缘光更宽
  waviness: 0.38,
  sway: 0.55,
  size: 1.0,
  centerX: 0,
  centerY: 0,
  glow: 1.28,
  fadeNear: 0.66,             // 中心留空,别动 —— 表单靠它
  fadeFar: 2.0,
  brightness: 1.1,
  colorVariance: true,
  grain: true,
  grainIntensity: 0.045,
  opacity: 1.0,
  mouseInteraction: true,
  mouseStrength: 0.12,
  maxDpr: 2
};

export function mountLightTunnel(target, opts = {}) {
  const host = typeof target === 'string' ? document.querySelector(target) : target;
  if (!host) return null;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  const o = { ...MTJ_TUNNEL, ...opts };

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  const gl = canvas.getContext('webgl2', {
    alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false
  });
  if (!gl) return null;                    // 没有 WebGL2 就不画,呼叫端自己降级

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, 'position');
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('[lighttunnel] link:', gl.getProgramInfoLog(prog));
    return null;
  }
  gl.useProgram(prog);

  /* 覆盖整个裁剪空间的单个三角形,比两个三角形的 quad 少一条对角接缝 */
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);   // 预乘 alpha
  gl.clearColor(0, 0, 0, 0);

  const U = {};
  const u = (n) => (U[n] = U[n] !== undefined ? U[n] : gl.getUniformLocation(prog, n));
  const f = (n, v) => gl.uniform1f(u(n), v);
  const v2 = (n, a, b) => gl.uniform2f(u(n), a, b);
  const v3 = (n, c) => gl.uniform3f(u(n), c[0], c[1], c[2]);

  function pushStatics() {
    f('uSpeed', o.speed);
    f('uFlowDir', o.flowDirection === 'outward' ? -1 : 1);
    f('uPulseSpeed', o.pulseSpeed);
    f('uPulseLength', o.pulseLength);
    f('uPulseBlend', o.pulseBlend);
    f('uPulseWidth', o.pulseWidth);
    f('uCableCount', o.cableCount);
    f('uThickness', o.thickness);
    f('uRimWidth', o.rimWidth);
    f('uWaviness', o.waviness);
    f('uSway', o.sway);
    f('uSize', o.size);
    v2('uCenter', o.centerX, o.centerY);
    f('uGlow', o.glow);
    f('uFadeNear', o.fadeNear);
    f('uFadeFar', o.fadeFar);
    f('uBrightness', o.brightness);
    f('uColorVariance', o.colorVariance ? 1 : 0);
    f('uOpacity', o.opacity);
    v3('uCableColor', hexToRgb(o.cableColor));
    v3('uPulseColor', hexToRgb(o.pulseColor));
    v3('uTunnelColor', hexToRgb(o.tunnelColor));
    f('uTunnelOpacity', o.tunnelOpacity);
    f('uGrain', o.grain ? 1 : 0);
    f('uGrainIntensity', o.grainIntensity);
  }
  pushStatics();

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

  let cur = [0.5, 0.5], tgt = [0.5, 0.5];
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    tgt = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
  };
  const onLeave = () => { tgt = [0.5, 0.5]; };
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseleave', onLeave);

  let raf = 0, onScreen = true;
  const t0 = performance.now();

  const frame = (t) => {
    /* 每帧读 document.hidden,不用事件去锁一个布尔值 —— 之前几支特效
       就是靠事件把 visible 设成 false 之后没人负责设回来,页面切回来就死了。 */
    if (document.hidden || !onScreen) { raf = 0; return; }
    f('iTime', (t - t0) * 0.001);

    const k = o.mouseInteraction ? 0.05 : 0.05;
    const gx = o.mouseInteraction ? tgt[0] : 0.5;
    const gy = o.mouseInteraction ? tgt[1] : 0.5;
    cur[0] += k * (gx - cur[0]);
    cur[1] += k * (gy - cur[1]);
    v2('uMouseOffset', (cur[0] - 0.5) * o.mouseStrength, (cur[1] - 0.5) * o.mouseStrength);

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
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.remove();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  };
}
