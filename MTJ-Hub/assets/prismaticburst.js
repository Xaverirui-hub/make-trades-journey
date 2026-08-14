/* ============================================================================
   PrismaticBurst — MTJ theme port
   ----------------------------------------------------------------------------
   Vanilla ES module port of the React Bits <PrismaticBurst /> component.

   Same treatment as galaxy / webthreads / lightfall: upstream ships React +
   `ogl`, but ogl only wraps one full-screen fragment shader in renderer /
   program / triangle / texture boilerplate. All of that is written directly
   against WebGL2 here, so nothing is fetched from a CDN at runtime and the
   effect is ~9 KB from our own origin.

   WebGL2 is required, not preferred: the shader is `#version 300 es` and uses
   `texture()`. No WebGL2 context means nothing mounts.

   The shader writes alpha 1.0 - it is designed to be composited with
   `mix-blend-mode: lighten`, which is what makes its black background drop
   away over the page. Do not "fix" that to a transparent clear colour; the
   burst relies on the blend.

   Theme: purple into gold. The gradient is a 1-D texture the ray march samples
   along its length, so the ramp reads as both colours rather than a blend of
   the two into mud.
   ========================================================================== */

const VERT = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision highp float;
precision highp int;

out vec4 fragColor;

uniform vec2  uResolution;
uniform float uTime;
uniform float uIntensity;
uniform float uSpeed;
uniform int   uAnimType;
uniform vec2  uMouse;
uniform int   uColorCount;
uniform float uDistort;
uniform vec2  uOffset;
uniform sampler2D uGradient;
uniform float uNoiseAmount;
uniform int   uRayCount;

float hash21(vec2 p){
    p = floor(p);
    float f = 52.9829189 * fract(dot(p, vec2(0.065, 0.005)));
    return fract(f);
}

mat2 rot30(){ return mat2(0.8, -0.5, 0.5, 0.8); }

float layeredNoise(vec2 fragPx){
    vec2 p = mod(fragPx + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
    vec2 q = rot30() * p;
    float n = 0.0;
    n += 0.40 * hash21(q);
    n += 0.25 * hash21(q * 2.0 + 17.0);
    n += 0.20 * hash21(q * 4.0 + 47.0);
    n += 0.10 * hash21(q * 8.0 + 113.0);
    n += 0.05 * hash21(q * 16.0 + 191.0);
    return n;
}

vec3 rayDir(vec2 frag, vec2 res, vec2 offset, float dist){
    float focal = res.y * max(dist, 1e-3);
    return normalize(vec3(2.0 * (frag - offset) - res, focal));
}

float edgeFade(vec2 frag, vec2 res, vec2 offset){
    vec2 toC = frag - 0.5 * res - offset;
    float r = length(toC) / (0.5 * min(res.x, res.y));
    float x = clamp(r, 0.0, 1.0);
    float q = x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
    float s = q * 0.5;
    s = pow(s, 1.5);
    float tail = 1.0 - pow(1.0 - s, 2.0);
    s = mix(s, tail, 0.2);
    float dn = (layeredNoise(frag * 0.15) - 0.5) * 0.0015 * s;
    return clamp(s + dn, 0.0, 1.0);
}

mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1.0,0.0,0.0, 0.0,c,-s, 0.0,s,c); }
mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c,0.0,s, 0.0,1.0,0.0, -s,0.0,c); }
mat3 rotZ(float a){ float c = cos(a), s = sin(a); return mat3(c,-s,0.0, s,c,0.0, 0.0,0.0,1.0); }

vec3 sampleGradient(float t){
    t = clamp(t, 0.0, 1.0);
    return texture(uGradient, vec2(t, 0.5)).rgb;
}

vec2 rot2(vec2 v, float a){
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c) * v;
}

float bendAngle(vec3 q, float t){
    return 0.8 * sin(q.x * 0.55 + t * 0.6)
         + 0.7 * sin(q.y * 0.50 - t * 0.5)
         + 0.6 * sin(q.z * 0.60 + t * 0.7);
}

void main(){
    vec2 frag = gl_FragCoord.xy;
    float t = uTime * uSpeed;
    float jitterAmp = 0.1 * clamp(uNoiseAmount, 0.0, 1.0);
    vec3 dir = rayDir(frag, uResolution, uOffset, 1.0);
    float marchT = 0.0;
    vec3 col = vec3(0.0);
    float n = layeredNoise(frag);
    vec4 c = cos(t * 0.2 + vec4(0.0, 33.0, 11.0, 0.0));
    mat2 M2 = mat2(c.x, c.y, c.z, c.w);
    float amp = clamp(uDistort, 0.0, 50.0) * 0.15;

    mat3 rot3dMat = mat3(1.0);
    if(uAnimType == 1){
      vec3 ang = vec3(t * 0.31, t * 0.21, t * 0.17);
      rot3dMat = rotZ(ang.z) * rotY(ang.y) * rotX(ang.x);
    }
    mat3 hoverMat = mat3(1.0);
    if(uAnimType == 2){
      vec2 m = uMouse * 2.0 - 1.0;
      vec3 ang = vec3(m.y * 0.6, m.x * 0.6, 0.0);
      hoverMat = rotY(ang.y) * rotX(ang.x);
    }

    for(int i = 0; i < 44; ++i){
        vec3 P = marchT * dir;
        P.z -= 2.0;
        float rad = length(P);
        vec3 Pl = P * (10.0 / max(rad, 1e-6));

        if(uAnimType == 0){ Pl.xz *= M2; }
        else if(uAnimType == 1){ Pl = rot3dMat * Pl; }
        else { Pl = hoverMat * Pl; }

        float stepLen = min(rad - 0.3, n * jitterAmp) + 0.1;

        float grow = smoothstep(0.35, 3.0, marchT);
        float a1 = amp * grow * bendAngle(Pl * 0.6, t);
        float a2 = 0.5 * amp * grow * bendAngle(Pl.zyx * 0.5 + 3.1, t * 0.9);
        vec3 Pb = Pl;
        Pb.xz = rot2(Pb.xz, a1);
        Pb.xy = rot2(Pb.xy, a2);

        float rayPattern = smoothstep(
            0.5, 0.7,
            sin(Pb.x + cos(Pb.y) * cos(Pb.z)) *
            sin(Pb.z + sin(Pb.y) * cos(Pb.x + t))
        );

        if(uRayCount > 0){
            float ang = atan(Pb.y, Pb.x);
            float comb = 0.5 + 0.5 * cos(float(uRayCount) * ang);
            comb = pow(comb, 3.0);
            rayPattern *= smoothstep(0.15, 0.95, comb);
        }

        vec3 spectralDefault = 1.0 + vec3(
            cos(marchT * 3.0 + 0.0),
            cos(marchT * 3.0 + 1.0),
            cos(marchT * 3.0 + 2.0)
        );

        float saw = fract(marchT * 0.25);
        float tRay = saw * saw * (3.0 - 2.0 * saw);
        vec3 userGradient = 2.0 * sampleGradient(tRay);
        vec3 spectral = (uColorCount > 0) ? userGradient : spectralDefault;
        vec3 base = (0.05 / (0.4 + stepLen)) * smoothstep(5.0, 0.0, rad) * spectral;

        col += base * rayPattern;
        marchT += stepLen;
    }

    col *= edgeFade(frag, uResolution, uOffset);
    col *= uIntensity;

    fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

const ANIM = { rotate: 0, rotate3d: 1, hover: 2 };

/* MTJ: violet through to gold. Ordered dark -> light so the ray march reads
   as a beam that warms toward its tip rather than as two colours fighting. */
const DEFAULTS = {
  colors: ['#4B1FA8', '#8B4FE8', '#E8C877'],
  intensity: 1.3,
  speed: 0.4,
  animationType: 'rotate3d',
  distort: 1.2,
  offset: { x: 0, y: 0 },
  hoverDampness: 0.25,
  rayCount: 22,
  noiseAmount: 0.8,
  maxDpr: 1.4   /* 44-step march per pixel - keep the pixel count honest */
};

function hexToRgb255(hex) {
  let h = String(hex).trim().replace(/^#/, '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const v = parseInt(h.slice(0, 6), 16);
  if (isNaN(v)) return [255, 255, 255];
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
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
 * Mount the burst into `target` (selector or element).
 * Adds `.is-live` once the first frame has drawn.
 * Returns a teardown function, or null if nothing mounted.
 */
export function mountPrismaticBurst(target, options = {}) {
  const host = typeof target === 'string' ? document.querySelector(target) : target;
  if (!host) return null;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return null;

  const o = Object.assign({}, DEFAULTS, options);

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
  /* the shader is built to be composited, not alpha-blended */
  canvas.style.mixBlendMode = o.mixBlendMode || 'lighten';

  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, powerPreference: 'low-power' });
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
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 0, 0,
     3, -1, 2, 0,
    -1,  3, 0, 2
  ]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'position');
  const aUv = gl.getAttribLocation(program, 'uv');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
  if (aUv >= 0) { gl.enableVertexAttribArray(aUv); gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8); }

  const U = {};
  ['uResolution', 'uTime', 'uIntensity', 'uSpeed', 'uAnimType', 'uMouse',
   'uColorCount', 'uDistort', 'uOffset', 'uGradient', 'uNoiseAmount', 'uRayCount']
    .forEach(n => { U[n] = gl.getUniformLocation(program, n); });

  /* 1-D gradient ramp the march samples along its length */
  const cols = (o.colors || []).slice(0, 64);
  const data = new Uint8Array(Math.max(1, cols.length) * 4);
  if (cols.length) {
    cols.forEach((c, i) => {
      const [r, g, b] = hexToRgb255(c);
      data[i * 4] = r; data[i * 4 + 1] = g; data[i * 4 + 2] = b; data[i * 4 + 3] = 255;
    });
  } else { data.set([255, 255, 255, 255]); }

  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, Math.max(1, cols.length), 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(U.uGradient, 0);

  gl.uniform1f(U.uIntensity, o.intensity);
  gl.uniform1f(U.uSpeed, o.speed);
  gl.uniform1i(U.uAnimType, ANIM[o.animationType] ?? 1);
  gl.uniform1i(U.uColorCount, cols.length);
  gl.uniform1f(U.uDistort, o.distort);
  gl.uniform2f(U.uOffset, Number(o.offset?.x) || 0, Number(o.offset?.y) || 0);
  gl.uniform1f(U.uNoiseAmount, o.noiseAmount);
  gl.uniform1i(U.uRayCount, Math.max(0, Math.floor(o.rayCount || 0)));

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr);
    const w = Math.max(1, Math.round((host.clientWidth || 1) * dpr));
    const h = Math.max(1, Math.round((host.clientHeight || 1) * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(U.uResolution, w, h);
  }
  resize();

  const tgt = [0.5, 0.5], sm = [0.5, 0.5];
  function onPointer(e) {
    const r = host.getBoundingClientRect();
    tgt[0] = Math.min(1, Math.max(0, (e.clientX - r.left) / Math.max(r.width, 1)));
    tgt[1] = Math.min(1, Math.max(0, (e.clientY - r.top) / Math.max(r.height, 1)));
  }
  window.addEventListener('pointermove', onPointer, { passive: true });

  let raf = 0, live = false, visible = true, last = performance.now(), accum = 0;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.max(0, now - last) * 0.001;
    last = now;
    if (!visible || document.hidden) return;
    accum += dt;

    const tau = 0.02 + Math.min(1, Math.max(0, o.hoverDampness)) * 0.5;
    const a = 1 - Math.exp(-dt / tau);
    sm[0] += (tgt[0] - sm[0]) * a;
    sm[1] += (tgt[1] - sm[1]) * a;

    gl.uniform2f(U.uMouse, sm[0], sm[1]);
    gl.uniform1f(U.uTime, accum);
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
    if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
    if (io) io.disconnect();
    window.removeEventListener('pointermove', onPointer);
    gl.deleteTexture(tex);
    const ext = gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    host.classList.remove('is-live');
  };
}

export default mountPrismaticBurst;
