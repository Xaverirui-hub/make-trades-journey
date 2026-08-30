/* ---------------------------------------------------------------------------
   Source     React Bits — <Particles />   https://reactbits.dev
   Copyright  (c) 2026 David Haz
   Licence    MIT + Commons Clause License Condition v1.0
              https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md

   本档是独立重写的原生 JS 移植版,作为 Make Trades Journey 网站的一部分使用。
   Commons Clause 禁止贩售或散布元件本身(含移植版);此处不单独贩售、不单独散布。
   完整第三方声明见 assets/THIRD-PARTY-NOTICES.md
   --------------------------------------------------------------------------- */
/* ============================================================================
   Particles — MTJ theme port
   ----------------------------------------------------------------------------
   Vanilla ES module port of the React Bits <Particles /> component.

   The other four ports were full-screen quads, where ogl only contributed a
   renderer and a triangle. This one is different: it is a real 3-D point cloud
   seen through a perspective camera, so dropping ogl means supplying the three
   matrices it was providing - projection, view and model - by hand. That is
   the only reason this file carries ~40 lines of mat4 maths; everything else
   is the same deal as before: no CDN, ~7 KB from our own origin, nothing to be
   blocked behind the Great Firewall.

   Theme: MTJ golds with a minority of violet. The palette is sampled per
   particle, so the violet share is literally its share of the array - one
   entry in five, rather than a colour blended into everything.
   ========================================================================== */

const VERT = `
attribute vec3 position;
attribute vec4 random;
attribute vec3 color;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uSpread;
uniform float uBaseSize;
uniform float uSizeRandomness;

varying vec4 vRandom;
varying vec3 vColor;

void main(){
  vRandom = random;
  vColor = color;

  vec3 pos = position * uSpread;
  pos.z *= 10.0;

  vec4 mPos = modelMatrix * vec4(pos, 1.0);
  float t = uTime;
  mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
  mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
  mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);

  vec4 mvPos = viewMatrix * mPos;

  if (uSizeRandomness == 0.0) {
    gl_PointSize = uBaseSize;
  } else {
    gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
  }

  gl_Position = projectionMatrix * mvPos;
}
`;

const FRAG = `
precision highp float;

uniform float uTime;
uniform float uAlphaParticles;
varying vec4 vRandom;
varying vec3 vColor;

void main(){
  vec2 uv = gl_PointCoord.xy;
  float d = length(uv - vec2(0.5));

  if(uAlphaParticles < 0.5){
    if(d > 0.5) discard;
    gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
  } else {
    float circle = smoothstep(0.5, 0.4, d) * 0.8;
    gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
  }
}
`;

/* MTJ palette: four golds to one violet, so violet reads as an accent rather
   than a second theme colour. */
const DEFAULTS = {
  particleCount: 220,
  particleSpread: 10,
  speed: 0.1,
  particleColors: ['#FCE9A8', '#E8C877', '#C9A227', '#E8C877', '#9B6BF2'],
  moveParticlesOnHover: true,
  particleHoverFactor: 1,
  alphaParticles: true,
  particleBaseSize: 100,
  sizeRandomness: 1,
  cameraDistance: 20,
  disableRotation: false,
  fov: 15,
  maxDpr: 1.5
};

/* --- minimal column-major mat4, only what the camera needs --------------- */
function perspective(fovDeg, aspect, near, far) {
  const f = 1 / Math.tan((fovDeg * Math.PI / 180) / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0
  ]);
}
function identity() {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}
function multiply(a, b) {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] +
                     a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
  }
  return o;
}
function translation(x, y, z) {
  const m = identity(); m[12] = x; m[13] = y; m[14] = z; return m;
}
function rotX(a) { const c = Math.cos(a), s = Math.sin(a); const m = identity();
  m[5] = c; m[6] = s; m[9] = -s; m[10] = c; return m; }
function rotY(a) { const c = Math.cos(a), s = Math.sin(a); const m = identity();
  m[0] = c; m[2] = -s; m[8] = s; m[10] = c; return m; }
function rotZ(a) { const c = Math.cos(a), s = Math.sin(a); const m = identity();
  m[0] = c; m[1] = s; m[4] = -s; m[5] = c; return m; }

function hexToRgb(hex) {
  let h = String(hex).replace(/^#/, '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const v = parseInt(h.slice(0, 6), 16);
  if (isNaN(v)) return [1, 1, 1];
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
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
 * Mount the particle field into `target` (selector or element).
 * Adds `.is-live` once the first frame has drawn.
 * Returns a teardown function, or null if nothing mounted.
 */
export function mountParticles(target, options = {}) {
  const host = typeof target === 'string' ? document.querySelector(target) : target;
  if (!host) return null;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return null;

  const o = Object.assign({}, DEFAULTS, options);

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'display:block;width:100%;height:100%;';
  const gl = canvas.getContext('webgl', {
    alpha: true, depth: false, antialias: true, premultipliedAlpha: false, powerPreference: 'low-power'
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

  /* --- geometry: a uniform ball of points, same distribution as upstream --- */
  const count = Math.max(1, Math.round(o.particleCount));
  const positions = new Float32Array(count * 3);
  const randoms = new Float32Array(count * 4);
  const colors = new Float32Array(count * 3);
  const palette = o.particleColors && o.particleColors.length ? o.particleColors : DEFAULTS.particleColors;
  for (let i = 0; i < count; i++) {
    let x, y, z, len;
    do {
      x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; z = Math.random() * 2 - 1;
      len = x * x + y * y + z * z;
    } while (len > 1 || len === 0);
    const r = Math.cbrt(Math.random());
    positions.set([x * r, y * r, z * r], i * 3);
    randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
    colors.set(hexToRgb(palette[(Math.random() * palette.length) | 0]), i * 3);
  }

  function attrib(name, data, size) {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, name);
    if (loc >= 0) { gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0); }
    return b;
  }
  attrib('position', positions, 3);
  attrib('random', randoms, 4);
  attrib('color', colors, 3);

  const U = {};
  ['modelMatrix', 'viewMatrix', 'projectionMatrix', 'uTime', 'uSpread',
   'uBaseSize', 'uSizeRandomness', 'uAlphaParticles']
    .forEach(n => { U[n] = gl.getUniformLocation(program, n); });

  const dprNow = () => Math.min(window.devicePixelRatio || 1, o.maxDpr);
  gl.uniform1f(U.uSpread, o.particleSpread);
  gl.uniform1f(U.uBaseSize, o.particleBaseSize * dprNow());
  gl.uniform1f(U.uSizeRandomness, o.sizeRandomness);
  gl.uniform1f(U.uAlphaParticles, o.alphaParticles ? 1 : 0);
  gl.uniformMatrix4fv(U.viewMatrix, false, translation(0, 0, -o.cameraDistance));

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.disable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);

  function resize() {
    const dpr = dprNow();
    const w = Math.max(1, Math.round((host.clientWidth || 1) * dpr));
    const h = Math.max(1, Math.round((host.clientHeight || 1) * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform1f(U.uBaseSize, o.particleBaseSize * dpr);
    gl.uniformMatrix4fv(U.projectionMatrix, false, perspective(o.fov, w / h, 0.1, 100));
  }
  resize();

  const mouse = { x: 0, y: 0 };
  function onMove(e) {
    const r = host.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / Math.max(r.width, 1)) * 2 - 1;
    mouse.y = -(((e.clientY - r.top) / Math.max(r.height, 1)) * 2 - 1);
  }
  if (o.moveParticlesOnHover) window.addEventListener('pointermove', onMove, { passive: true });

  let raf = 0, live = false, visible = true, last = performance.now(), elapsed = 0, rz = 0;

  function frame(t) {
    raf = requestAnimationFrame(frame);
    const delta = t - last;
    last = t;
    if (!visible || document.hidden) return;
    elapsed += delta * o.speed;

    gl.uniform1f(U.uTime, elapsed * 0.001);

    const px = o.moveParticlesOnHover ? -mouse.x * o.particleHoverFactor : 0;
    const py = o.moveParticlesOnHover ? -mouse.y * o.particleHoverFactor : 0;
    let model = translation(px, py, 0);
    if (!o.disableRotation) {
      rz += 0.01 * o.speed;
      model = multiply(model, rotX(Math.sin(elapsed * 0.0002) * 0.1));
      model = multiply(model, rotY(Math.cos(elapsed * 0.0005) * 0.15));
      model = multiply(model, rotZ(rz));
    }
    gl.uniformMatrix4fv(U.modelMatrix, false, model);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, count);

    if (!live) { live = true; host.classList.add('is-live'); }
  }

  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); visible = false; });

  host.appendChild(canvas);
  raf = requestAnimationFrame(frame);

  const ro = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(host); else window.addEventListener('resize', resize);

  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '80px' })
    : null;
  if (io) io.observe(host);

  /* Page visibility is read inside the frame loop rather than latched on a
     visibilitychange handler - latching it is what left the other effects
     permanently parked once the tab had been hidden. */

  return function destroy() {
    cancelAnimationFrame(raf);
    if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
    if (io) io.disconnect();
    if (o.moveParticlesOnHover) window.removeEventListener('pointermove', onMove);
    const ext = gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    host.classList.remove('is-live');
  };
}

export default mountParticles;
