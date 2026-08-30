/* ---------------------------------------------------------------------------
   Source     React Bits — <GridScan />   https://reactbits.dev
   Copyright  (c) 2026 David Haz
   Licence    MIT + Commons Clause License Condition v1.0
              https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md

   本档是独立重写的原生 JS 移植版,作为 Make Trades Journey 网站的一部分使用。
   Commons Clause 禁止贩售或散布元件本身(含移植版);此处不单独贩售、不单独散布。
   完整第三方声明见 assets/THIRD-PARTY-NOTICES.md
   --------------------------------------------------------------------------- */
/* ============================================================================
   GridScan — MTJ theme port
   ----------------------------------------------------------------------------
   Vanilla ES module port of the React Bits <GridScan /> component.

   Upstream lists three dependencies. All three are gone here:

   - face-api.js  — only ever used for the optional `enableWebcam` face
                    tracking. A public marketing page has no business asking
                    for a camera, and the models are a multi-megabyte CDN
                    fetch. Dropped outright; the pointer drives the parallax.
   - three        — used for WebGLRenderer / ShaderMaterial / Vector maths
                    around what is, again, one full-screen fragment shader.
                    Written directly against WebGL here.
   - postprocessing — bloom + chromatic aberration. Dropped with the composer;
                    the shader already carries its own halo term (uBloomOpacity)
                    which is what most of the glow came from anyway.

   Result: no CDN at runtime, ~9 KB from our own origin, no camera permission
   prompt, nothing to be blocked behind the Great Firewall.

   fwidth(): the shader is GLSL ES 1.00 and uses derivatives, so this asks for
   a WebGL1 context and enables OES_standard_derivatives. Asking for WebGL2
   looks like the modern choice and is wrong here - WebGL2 makes derivatives
   core only for `#version 300 es`, and it does not expose the extension at
   all, so an ES 1.00 shader compiled on a WebGL2 context fails outright with
   "'fwidth' : no matching overloaded function found". Verified both ways in
   the browser before settling on this.

   Colour handling: upstream converts sRGB -> linear via three and then encodes
   back to sRGB on output. Net identity, so the hex values are passed straight
   through here rather than round-tripped through a colour space we do not
   otherwise manage.

   Theme: violet grid, gold scan beam.
   ========================================================================== */

const VERT = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG_BODY = `
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec2 uSkew;
uniform float uTilt;
uniform float uYaw;
uniform float uLineThickness;
uniform vec3 uLinesColor;
uniform vec3 uScanColor;
uniform float uGridScale;
uniform float uLineStyle;
uniform float uLineJitter;
uniform float uScanOpacity;
uniform float uScanDirection;
uniform float uNoise;
uniform float uBloomOpacity;
uniform float uScanGlow;
uniform float uScanSoftness;
uniform float uPhaseTaper;
uniform float uScanDuration;
uniform float uScanDelay;
varying vec2 vUv;

float smoother01(float a, float b, float x){
  float t = clamp((x - a) / max(1e-5, (b - a)), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 p = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
    vec3 ro = vec3(0.0);
    vec3 rd = normalize(vec3(p, 2.0));

    float cR = cos(uTilt), sR = sin(uTilt);
    rd.xy = mat2(cR, -sR, sR, cR) * rd.xy;
    float cY = cos(uYaw), sY = sin(uYaw);
    rd.xz = mat2(cY, -sY, sY, cY) * rd.xz;

    vec2 skew = clamp(uSkew, vec2(-0.7), vec2(0.7));
    rd.xy += skew * rd.z;

    vec3 color = vec3(0.0);
    float minT = 1e20;
    float gridScale = max(1e-5, uGridScale);
    float fadeStrength = 2.0;
    vec2 gridUV = vec2(0.0);
    float hitIsY = 1.0;

    for (int i = 0; i < 4; i++){
        float isY = float(i < 2);
        float pos = mix(-0.2, 0.2, float(i)) * isY + mix(-0.5, 0.5, float(i - 2)) * (1.0 - isY);
        float num = pos - (isY * ro.y + (1.0 - isY) * ro.x);
        float den = isY * rd.y + (1.0 - isY) * rd.x;
        float t = num / den;
        vec3 h = ro + rd * t;
        float depthBoost = smoothstep(0.0, 3.0, h.z);
        h.xy += skew * 0.15 * depthBoost;
        bool use = t > 0.0 && t < minT;
        gridUV = use ? mix(h.zy, h.xz, isY) / gridScale : gridUV;
        minT = use ? t : minT;
        hitIsY = use ? isY : hitIsY;
    }

    vec3 hit = ro + rd * minT;
    float dist = length(hit - ro);

    float jitterAmt = clamp(uLineJitter, 0.0, 1.0);
    if (jitterAmt > 0.0) {
      vec2 j = vec2(sin(gridUV.y * 2.7 + iTime * 1.8), cos(gridUV.x * 2.3 - iTime * 1.6)) * (0.15 * jitterAmt);
      gridUV += j;
    }
    float fx = fract(gridUV.x), fy = fract(gridUV.y);
    float ax = min(fx, 1.0 - fx), ay = min(fy, 1.0 - fy);
    float wx = fwidth(gridUV.x), wy = fwidth(gridUV.y);
    float halfPx = max(0.0, uLineThickness) * 0.5;
    float tx = halfPx * wx, ty = halfPx * wy;
    float lineX = 1.0 - smoothstep(tx, tx + wx, ax);
    float lineY = 1.0 - smoothstep(ty, ty + wy, ay);
    if (uLineStyle > 0.5) {
      float vy = fract(gridUV.y * 4.0), vx = fract(gridUV.x * 4.0);
      if (uLineStyle < 1.5) { lineX *= step(vy, 0.5); lineY *= step(vx, 0.5); }
      else {
        float cy = abs(fract(gridUV.y * 6.0) - 0.5), cx = abs(fract(gridUV.x * 6.0) - 0.5);
        lineX *= 1.0 - smoothstep(0.18, 0.18 + fwidth(gridUV.y * 6.0), cy);
        lineY *= 1.0 - smoothstep(0.18, 0.18 + fwidth(gridUV.x * 6.0), cx);
      }
    }
    float primaryMask = max(lineX, lineY);

    vec2 gridUV2 = (hitIsY > 0.5 ? hit.xz : hit.zy) / gridScale;
    if (jitterAmt > 0.0) {
      vec2 j2 = vec2(cos(gridUV2.y * 2.1 - iTime * 1.4), sin(gridUV2.x * 2.5 + iTime * 1.7)) * (0.15 * jitterAmt);
      gridUV2 += j2;
    }
    float ax2 = min(fract(gridUV2.x), 1.0 - fract(gridUV2.x));
    float ay2 = min(fract(gridUV2.y), 1.0 - fract(gridUV2.y));
    float wx2 = fwidth(gridUV2.x), wy2 = fwidth(gridUV2.y);
    float lineX2 = 1.0 - smoothstep(halfPx * wx2, halfPx * wx2 + wx2, ax2);
    float lineY2 = 1.0 - smoothstep(halfPx * wy2, halfPx * wy2 + wy2, ay2);
    float altMask = max(lineX2, lineY2);

    float edgeDistX = min(abs(hit.x + 0.5), abs(hit.x - 0.5));
    float edgeDistY = min(abs(hit.y + 0.2), abs(hit.y - 0.2));
    float edgeDist = mix(edgeDistY, edgeDistX, hitIsY);
    altMask *= 1.0 - smoothstep(gridScale * 0.5, gridScale * 2.0, edgeDist);

    float lineMask = max(primaryMask, altMask);
    float fade = exp(-dist * fadeStrength);

    float dur = max(0.05, uScanDuration);
    float del = max(0.0, uScanDelay);
    float widthScale = max(0.1, uScanGlow);
    float sigma = max(0.001, 0.18 * widthScale * uScanSoftness);
    float sigmaA = sigma * 2.0;

    float cycle = dur + del;
    float tCycle = mod(iTime, cycle);
    float phase = clamp((tCycle - del) / dur, 0.0, 1.0);
    if (uScanDirection > 0.5 && uScanDirection < 1.5) {
      phase = 1.0 - phase;
    } else if (uScanDirection > 1.5) {
      float t2 = mod(max(0.0, iTime - del), 2.0 * dur);
      phase = (t2 < dur) ? (t2 / dur) : (1.0 - (t2 - dur) / dur);
    }
    float dz = abs(hit.z - phase * 2.0);
    float taper = clamp(uPhaseTaper, 0.0, 0.49);
    float phaseWindow = smoother01(0.0, taper, phase) * (1.0 - smoother01(1.0 - taper, 1.0, phase));
    float op = clamp(uScanOpacity, 0.0, 1.0);
    float combinedPulse = exp(-0.5 * (dz * dz) / (sigma * sigma)) * phaseWindow * op;
    float combinedAura = exp(-0.5 * (dz * dz) / (sigmaA * sigmaA)) * 0.25 * phaseWindow * op;

    color = uLinesColor * lineMask * fade + uScanColor * combinedPulse + uScanColor * combinedAura;

    float n = fract(sin(dot(gl_FragCoord.xy + vec2(iTime * 123.4), vec2(12.9898, 78.233))) * 43758.5453123);
    color += (n - 0.5) * uNoise;
    color = clamp(color, 0.0, 1.0);

    float alpha = clamp(max(lineMask, combinedPulse), 0.0, 1.0);
    float gx = 1.0 - smoothstep(tx * 2.0, tx * 2.0 + wx * 2.0, ax);
    float gy = 1.0 - smoothstep(ty * 2.0, ty * 2.0 + wy * 2.0, ay);
    alpha = max(alpha, max(gx, gy) * fade * clamp(uBloomOpacity, 0.0, 1.0));
    fragColor = vec4(color, alpha);
}

void main(){
  vec4 c;
  mainImage(c, vUv * iResolution.xy);
  gl_FragColor = c;
}
`;

const STYLE = { solid: 0, dashed: 1, dotted: 2 };
const DIR = { forward: 0, backward: 1, pingpong: 2 };

const DEFAULTS = {
  sensitivity: 0.55,
  lineThickness: 1,
  linesColor: '#4A3C7D',   /* violet grid */
  scanColor: '#E8C877',    /* MTJ gold beam */
  scanOpacity: 0.55,
  gridScale: 0.1,
  lineStyle: 'solid',
  lineJitter: 0.08,
  scanDirection: 'pingpong',
  bloomIntensity: 0.6,
  noiseIntensity: 0.01,
  scanGlow: 0.5,
  scanSoftness: 2,
  scanPhaseTaper: 0.9,
  scanDuration: 2.0,
  scanDelay: 2.0,
  snapBackDelay: 250,
  maxDpr: 1.75
};

function hexToRgb01(hex) {
  let h = String(hex).trim().replace(/^#/, '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const v = parseInt(h.slice(0, 6), 16);
  if (isNaN(v)) return [1, 1, 1];
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* Unity-style critically damped spring, same easing curve upstream got from
   three's MathUtils - kept because the parallax feel depends on it. */
function smoothDamp(cur, target, state, key, smoothTime, dt) {
  smoothTime = Math.max(1e-4, smoothTime);
  const omega = 2 / smoothTime;
  const x = omega * dt;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = cur - target;
  const temp = (state[key] + omega * change) * dt;
  state[key] = (state[key] - omega * temp) * exp;
  let out = target + (change + temp) * exp;
  if ((target - cur) * (out - target) > 0) { out = target; state[key] = 0; }
  return out;
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
 * Mount the grid into `target` (selector or element).
 * Adds `.is-live` once the first frame has drawn.
 * Returns a teardown function, or null if nothing mounted.
 */
export function mountGridScan(target, options = {}) {
  const host = typeof target === 'string' ? document.querySelector(target) : target;
  if (!host) return null;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return null;

  const o = Object.assign({}, DEFAULTS, options);

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';

  const opts = { alpha: true, antialias: true, premultipliedAlpha: false, powerPreference: 'low-power' };
  const gl = canvas.getContext('webgl', opts);
  if (!gl || !gl.getExtension('OES_standard_derivatives')) return null;
  const frag = '#extension GL_OES_standard_derivatives : enable\n' + FRAG_BODY;

  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, frag));
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
  ['iResolution', 'iTime', 'uSkew', 'uTilt', 'uYaw', 'uLineThickness', 'uLinesColor',
   'uScanColor', 'uGridScale', 'uLineStyle', 'uLineJitter', 'uScanOpacity',
   'uScanDirection', 'uNoise', 'uBloomOpacity', 'uScanGlow', 'uScanSoftness',
   'uPhaseTaper', 'uScanDuration', 'uScanDelay']
    .forEach(n => { U[n] = gl.getUniformLocation(program, n); });

  gl.uniform1f(U.uLineThickness, o.lineThickness);
  gl.uniform3fv(U.uLinesColor, hexToRgb01(o.linesColor));
  gl.uniform3fv(U.uScanColor, hexToRgb01(o.scanColor));
  gl.uniform1f(U.uGridScale, o.gridScale);
  gl.uniform1f(U.uLineStyle, STYLE[o.lineStyle] ?? 0);
  gl.uniform1f(U.uLineJitter, clamp(o.lineJitter, 0, 1));
  gl.uniform1f(U.uScanOpacity, clamp(o.scanOpacity, 0, 1));
  gl.uniform1f(U.uScanDirection, DIR[o.scanDirection] ?? 2);
  gl.uniform1f(U.uNoise, o.noiseIntensity);
  gl.uniform1f(U.uBloomOpacity, o.bloomIntensity);
  gl.uniform1f(U.uScanGlow, o.scanGlow);
  gl.uniform1f(U.uScanSoftness, o.scanSoftness);
  gl.uniform1f(U.uPhaseTaper, o.scanPhaseTaper);
  gl.uniform1f(U.uScanDuration, o.scanDuration);
  gl.uniform1f(U.uScanDelay, o.scanDelay);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr);
    const w = Math.max(1, Math.round((host.clientWidth || 1) * dpr));
    const h = Math.max(1, Math.round((host.clientHeight || 1) * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform3f(U.iResolution, w, h, dpr);
  }
  resize();

  /* sensitivity mapping, straight from upstream */
  const s = clamp(o.sensitivity, 0, 1);
  const skewScale = lerp(0.06, 0.2, s);
  const tiltScale = lerp(0.12, 0.3, s);
  const yawScale = lerp(0.1, 0.28, s);
  const smoothTime = lerp(0.45, 0.12, s);
  const yBoost = lerp(1.2, 1.6, s);

  const look = { x: 0, y: 0 }, lookT = { x: 0, y: 0 };
  const vel = { lx: 0, ly: 0 };
  let leaveTimer = null;

  function onMove(e) {
    const r = host.getBoundingClientRect();
    if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
    lookT.x = ((e.clientX - r.left) / Math.max(r.width, 1)) * 2 - 1;
    lookT.y = -(((e.clientY - r.top) / Math.max(r.height, 1)) * 2 - 1);
  }
  function onLeave() {
    if (leaveTimer) clearTimeout(leaveTimer);
    leaveTimer = setTimeout(() => { lookT.x = 0; lookT.y = 0; }, Math.max(0, o.snapBackDelay));
  }
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerleave', onLeave, { passive: true });

  let raf = 0, live = false, visible = true, last = performance.now();

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
    last = now;
    if (!visible || document.hidden) return;

    look.x = smoothDamp(look.x, lookT.x, vel, 'lx', smoothTime, dt);
    look.y = smoothDamp(look.y, lookT.y, vel, 'ly', smoothTime, dt);

    gl.uniform2f(U.uSkew, look.x * skewScale, -look.y * yBoost * skewScale);
    gl.uniform1f(U.uTilt, 0);
    gl.uniform1f(U.uYaw, clamp(look.x * yawScale, -0.6, 0.6));
    gl.uniform1f(U.iTime, now / 1000);

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
    ? new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0.01 })
    : null;
  if (io) io.observe(host);

  return function destroy() {
    cancelAnimationFrame(raf);
    if (leaveTimer) clearTimeout(leaveTimer);
    if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
    if (io) io.disconnect();
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerleave', onLeave);
    const ext = gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    host.classList.remove('is-live');
  };
}

export default mountGridScan;
