/* ---------------------------------------------------------------------------
   Source     React Bits — <Hyperspeed />   https://reactbits.dev
   Copyright  (c) 2026 David Haz
   Licence    MIT + Commons Clause License Condition v1.0
              https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md

   本档是独立重写的原生 JS 移植版,作为 Make Trades Journey 网站的一部分使用。
   Commons Clause 禁止贩售或散布元件本身(含移植版);此处不单独贩售、不单独散布。
   完整第三方声明见 assets/THIRD-PARTY-NOTICES.md
   --------------------------------------------------------------------------- */
/* =====================================================================
   Hyperspeed — MTJ edition
   Ported from the React Bits component to a plain ES module.

   Colour note: the original runs magenta against cyan. MTJ is a single
   gold accent on near black, so depth here comes from luminance instead
   of a second hue: deep amber in the far lane, cream gold in the near
   one. The roadside sticks are the one exception — they read as candles,
   so they take the site's bull/bear green and red.
   ===================================================================== */
/* three + postprocessing 是自架的,不是 CDN —— esm.sh 在大陆连不上,
   而首页封面的失败是无声的,所以那边看到的一直是一片静止的背景。
   要换版本看 assets/vendor/README.md,那支档案不要手改。 */
import {
  THREE, BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset
} from './vendor/three-postprocessing.js';

export const MTJ_PRESET = {
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 22,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [400 * 0.03, 400 * 0.2],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x08080b,
    islandColor: 0x0d0d12,
    background: 0x060608,
    shoulderLines: 0x3a3020,
    brokenLines: 0x3a3020,
    leftCars: [0xe8c877, 0xc9a227, 0xfce9a8],
    rightCars: [0x8a6d1f, 0xc9a227, 0xe8c877],
    /* 路边的立柱长得就像 K 棒,所以直接用站上的涨跌色,一根绿一根红随机。
       不是新调色 —— 这两个就是全站 K 线图在用的 --bull / --bear。 */
    sticks: [0x2CD98A, 0xFF5C63]
  }
};

const nsin = v => Math.sin(v) * 0.5 + 0.5;
const random = b => Array.isArray(b) ? Math.random() * (b[1] - b[0]) + b[0] : Math.random() * b;
const pickRandom = a => Array.isArray(a) ? a[Math.floor(Math.random() * a.length)] : a;
function lerp(current, target, speed = 0.1, limit = 0.001) {
  let change = (target - current) * speed;
  if (Math.abs(change) < limit) change = target - current;
  return change;
}

const turbulentUniforms = {
  uFreq: { value: new THREE.Vector4(4, 8, 8, 1) },
  uAmp: { value: new THREE.Vector4(25, 5, 10, 10) }
};

const distortions = {
  turbulentDistortion: {
    uniforms: turbulentUniforms,
    getDistortion: `
      uniform vec4 uFreq;
      uniform vec4 uAmp;
      float nsin(float val){ return sin(val) * 0.5 + 0.5; }
      #define PI 3.14159265358979
      float getDistortionX(float progress){
        return (
          cos(PI * progress * uFreq.r + uTime) * uAmp.r +
          pow(cos(PI * progress * uFreq.g + uTime * (uFreq.g / uFreq.r)), 2.) * uAmp.g
        );
      }
      float getDistortionY(float progress){
        return (
          -nsin(PI * progress * uFreq.b + uTime) * uAmp.b +
          -pow(nsin(PI * progress * uFreq.a + uTime / (uFreq.b / uFreq.a)), 5.) * uAmp.a
        );
      }
      vec3 getDistortion(float progress){
        return vec3(
          getDistortionX(progress) - getDistortionX(0.0125),
          getDistortionY(progress) - getDistortionY(0.0125),
          0.
        );
      }
    `,
    getJS: (progress, time) => {
      const uFreq = turbulentUniforms.uFreq.value;
      const uAmp = turbulentUniforms.uAmp.value;
      const getX = p => Math.cos(Math.PI * p * uFreq.x + time) * uAmp.x +
        Math.pow(Math.cos(Math.PI * p * uFreq.y + time * (uFreq.y / uFreq.x)), 2) * uAmp.y;
      const getY = p => -nsin(Math.PI * p * uFreq.z + time) * uAmp.z -
        Math.pow(nsin(Math.PI * p * uFreq.w + time / (uFreq.z / uFreq.w)), 5) * uAmp.w;
      const distortion = new THREE.Vector3(
        getX(progress) - getX(progress + 0.007),
        getY(progress) - getY(progress + 0.007), 0
      );
      return distortion.multiply(new THREE.Vector3(-2, -5, 0)).add(new THREE.Vector3(0, 0, -10));
    }
  }
};

/* ---------------------------------------------------------------- shaders */
const carLightsFragment = `
  #define USE_FOG;
  ${THREE.ShaderChunk['fog_pars_fragment']}
  varying vec3 vColor;
  varying vec2 vUv;
  uniform vec2 uFade;
  void main() {
    vec3 color = vec3(vColor);
    float alpha = smoothstep(uFade.x, uFade.y, vUv.x);
    gl_FragColor = vec4(color, alpha);
    if (gl_FragColor.a < 0.0001) discard;
    ${THREE.ShaderChunk['fog_fragment']}
  }
`;

const carLightsVertex = `
  #define USE_FOG;
  ${THREE.ShaderChunk['fog_pars_vertex']}
  attribute vec3 aOffset;
  attribute vec3 aMetrics;
  attribute vec3 aColor;
  uniform float uTravelLength;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vColor;
  #include <getDistortion_vertex>
  void main() {
    vec3 transformed = position.xyz;
    float radius = aMetrics.r;
    float myLength = aMetrics.g;
    float speed = aMetrics.b;
    transformed.xy *= radius;
    transformed.z *= myLength;
    transformed.z += myLength - mod(uTime * speed + aOffset.z, uTravelLength);
    transformed.xy += aOffset.xy;
    float progress = abs(transformed.z / uTravelLength);
    transformed.xyz += getDistortion(progress);
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
    gl_Position = projectionMatrix * mvPosition;
    vUv = uv;
    vColor = aColor;
    ${THREE.ShaderChunk['fog_vertex']}
  }
`;

const sideSticksVertex = `
  #define USE_FOG;
  ${THREE.ShaderChunk['fog_pars_vertex']}
  attribute float aOffset;
  attribute vec3 aColor;
  attribute vec2 aMetrics;
  uniform float uTravelLength;
  uniform float uTime;
  varying vec3 vColor;
  mat4 rotationY(in float angle){
    return mat4(cos(angle),0,sin(angle),0, 0,1.0,0,0, -sin(angle),0,cos(angle),0, 0,0,0,1);
  }
  #include <getDistortion_vertex>
  void main(){
    vec3 transformed = position.xyz;
    float width = aMetrics.x;
    float height = aMetrics.y;
    transformed.xy *= vec2(width, height);
    float time = mod(uTime * 60. * 2. + aOffset, uTravelLength);
    transformed = (rotationY(3.14/2.) * vec4(transformed,1.)).xyz;
    transformed.z += -uTravelLength + time;
    float progress = abs(transformed.z / uTravelLength);
    transformed.xyz += getDistortion(progress);
    transformed.y += height / 2.;
    transformed.x += -width / 2.;
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
    gl_Position = projectionMatrix * mvPosition;
    vColor = aColor;
    ${THREE.ShaderChunk['fog_vertex']}
  }
`;

const sideSticksFragment = `
  #define USE_FOG;
  ${THREE.ShaderChunk['fog_pars_fragment']}
  varying vec3 vColor;
  void main(){
    gl_FragColor = vec4(vec3(vColor), 1.);
    ${THREE.ShaderChunk['fog_fragment']}
  }
`;

const roadBaseFragment = `
  #define USE_FOG;
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uTime;
  #include <roadMarkings_vars>
  ${THREE.ShaderChunk['fog_pars_fragment']}
  void main() {
    vec2 uv = vUv;
    vec3 color = vec3(uColor);
    #include <roadMarkings_fragment>
    gl_FragColor = vec4(color, 1.);
    ${THREE.ShaderChunk['fog_fragment']}
  }
`;

const roadMarkings_vars = `
  uniform float uLanes;
  uniform vec3 uBrokenLinesColor;
  uniform vec3 uShoulderLinesColor;
  uniform float uShoulderLinesWidthPercentage;
  uniform float uBrokenLinesWidthPercentage;
  uniform float uBrokenLinesLengthPercentage;
`;

const roadMarkings_fragment = `
  uv.y = mod(uv.y + uTime * 0.05, 1.);
  float laneWidth = 1.0 / uLanes;
  float brokenLineWidth = laneWidth * uBrokenLinesWidthPercentage;
  float laneEmptySpace = 1. - uBrokenLinesLengthPercentage;
  float brokenLines = step(1.0 - brokenLineWidth, fract(uv.x * 2.0)) * step(laneEmptySpace, fract(uv.y * 10.0));
  float sideLines = step(1.0 - brokenLineWidth, fract((uv.x - laneWidth * (uLanes - 1.0)) * 2.0)) + step(brokenLineWidth, uv.x);
  brokenLines = mix(brokenLines, sideLines, uv.x);
  color = mix(color, uBrokenLinesColor, brokenLines);
`;

const islandFragment = roadBaseFragment
  .replace('#include <roadMarkings_fragment>', '')
  .replace('#include <roadMarkings_vars>', '');
const roadFragment = roadBaseFragment
  .replace('#include <roadMarkings_fragment>', roadMarkings_fragment)
  .replace('#include <roadMarkings_vars>', roadMarkings_vars);

const roadVertex = `
  #define USE_FOG;
  uniform float uTime;
  ${THREE.ShaderChunk['fog_pars_vertex']}
  uniform float uTravelLength;
  varying vec2 vUv;
  #include <getDistortion_vertex>
  void main() {
    vec3 transformed = position.xyz;
    vec3 distortion = getDistortion((transformed.y + uTravelLength / 2.) / uTravelLength);
    transformed.x += distortion.x;
    transformed.z += distortion.y;
    transformed.y += -1. * distortion.z;
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
    gl_Position = projectionMatrix * mvPosition;
    vUv = uv;
    ${THREE.ShaderChunk['fog_vertex']}
  }
`;

/* ---------------------------------------------------------------- objects */
class CarLights {
  constructor(webgl, options, colors, speed, fade) {
    Object.assign(this, { webgl, options, colors, speed, fade });
  }
  init() {
    const options = this.options;
    const curve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1));
    const geometry = new THREE.TubeGeometry(curve, 40, 1, 8, false);
    const instanced = new THREE.InstancedBufferGeometry().copy(geometry);
    instanced.instanceCount = options.lightPairsPerRoadWay * 2;
    const laneWidth = options.roadWidth / options.lanesPerRoad;
    const aOffset = [], aMetrics = [], aColor = [];
    let colors = Array.isArray(this.colors)
      ? this.colors.map(c => new THREE.Color(c))
      : new THREE.Color(this.colors);

    for (let i = 0; i < options.lightPairsPerRoadWay; i++) {
      const radius = random(options.carLightsRadius);
      const length = random(options.carLightsLength);
      const speed = random(this.speed);
      const carLane = i % options.lanesPerRoad;
      let laneX = carLane * laneWidth - options.roadWidth / 2 + laneWidth / 2;
      const carWidth = random(options.carWidthPercentage) * laneWidth;
      laneX += random(options.carShiftX) * laneWidth;
      const offsetY = random(options.carFloorSeparation) + radius * 1.3;
      const offsetZ = -random(options.length);
      aOffset.push(laneX - carWidth / 2, offsetY, offsetZ);
      aOffset.push(laneX + carWidth / 2, offsetY, offsetZ);
      aMetrics.push(radius, length, speed, radius, length, speed);
      const color = pickRandom(colors);
      aColor.push(color.r, color.g, color.b, color.r, color.g, color.b);
    }
    instanced.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 3, false));
    instanced.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 3, false));
    instanced.setAttribute('aColor', new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false));

    const material = new THREE.ShaderMaterial({
      fragmentShader: carLightsFragment,
      vertexShader: carLightsVertex,
      transparent: true,
      uniforms: Object.assign(
        { uTime: { value: 0 }, uTravelLength: { value: options.length }, uFade: { value: this.fade } },
        this.webgl.fogUniforms, options.distortion.uniforms
      )
    });
    material.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader.replace('#include <getDistortion_vertex>', options.distortion.getDistortion);
    };
    const mesh = new THREE.Mesh(instanced, material);
    mesh.frustumCulled = false;
    this.webgl.scene.add(mesh);
    this.mesh = mesh;
  }
  update(time) { this.mesh.material.uniforms.uTime.value = time; }
}

class LightsSticks {
  constructor(webgl, options) { Object.assign(this, { webgl, options }); }
  init() {
    const options = this.options;
    const instanced = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(1, 1));
    const totalSticks = options.totalSideLightSticks;
    instanced.instanceCount = totalSticks;
    const stickoffset = options.length / (totalSticks - 1);
    const aOffset = [], aColor = [], aMetrics = [];
    let colors = Array.isArray(options.colors.sticks)
      ? options.colors.sticks.map(c => new THREE.Color(c))
      : new THREE.Color(options.colors.sticks);

    for (let i = 0; i < totalSticks; i++) {
      const width = random(options.lightStickWidth);
      const height = random(options.lightStickHeight);
      aOffset.push((i - 1) * stickoffset * 2 + stickoffset * Math.random());
      const color = pickRandom(colors);
      aColor.push(color.r, color.g, color.b);
      aMetrics.push(width, height);
    }
    instanced.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 1, false));
    instanced.setAttribute('aColor', new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false));
    instanced.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 2, false));

    const material = new THREE.ShaderMaterial({
      fragmentShader: sideSticksFragment,
      vertexShader: sideSticksVertex,
      side: THREE.DoubleSide,
      uniforms: Object.assign(
        { uTravelLength: { value: options.length }, uTime: { value: 0 } },
        this.webgl.fogUniforms, options.distortion.uniforms
      )
    });
    material.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader.replace('#include <getDistortion_vertex>', options.distortion.getDistortion);
    };
    const mesh = new THREE.Mesh(instanced, material);
    mesh.frustumCulled = false;
    this.webgl.scene.add(mesh);
    this.mesh = mesh;
  }
  update(time) { this.mesh.material.uniforms.uTime.value = time; }
}

class Road {
  constructor(webgl, options) { Object.assign(this, { webgl, options }); this.uTime = { value: 0 }; }
  createPlane(side, width, isRoad) {
    const options = this.options;
    const geometry = new THREE.PlaneGeometry(
      isRoad ? options.roadWidth : options.islandWidth, options.length, 20, 100
    );
    let uniforms = {
      uTravelLength: { value: options.length },
      uColor: { value: new THREE.Color(isRoad ? options.colors.roadColor : options.colors.islandColor) },
      uTime: this.uTime
    };
    if (isRoad) {
      uniforms = Object.assign(uniforms, {
        uLanes: { value: options.lanesPerRoad },
        uBrokenLinesColor: { value: new THREE.Color(options.colors.brokenLines) },
        uShoulderLinesColor: { value: new THREE.Color(options.colors.shoulderLines) },
        uShoulderLinesWidthPercentage: { value: options.shoulderLinesWidthPercentage },
        uBrokenLinesLengthPercentage: { value: options.brokenLinesLengthPercentage },
        uBrokenLinesWidthPercentage: { value: options.brokenLinesWidthPercentage }
      });
    }
    const material = new THREE.ShaderMaterial({
      fragmentShader: isRoad ? roadFragment : islandFragment,
      vertexShader: roadVertex,
      side: THREE.DoubleSide,
      uniforms: Object.assign(uniforms, this.webgl.fogUniforms, options.distortion.uniforms)
    });
    material.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader.replace('#include <getDistortion_vertex>', options.distortion.getDistortion);
    };
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.z = -options.length / 2;
    mesh.position.x += (options.islandWidth / 2 + options.roadWidth / 2) * side;
    this.webgl.scene.add(mesh);
    return mesh;
  }
  init() {
    this.leftRoadWay = this.createPlane(-1, this.options.roadWidth, true);
    this.rightRoadWay = this.createPlane(1, this.options.roadWidth, true);
    this.island = this.createPlane(0, this.options.islandWidth, false);
  }
  update(time) { this.uTime.value = time; }
}

/* ------------------------------------------------------------------- app */
class App {
  constructor(container, options) {
    this.options = options;
    this.container = container;
    this.hasValidSize = false;
    this.disposed = false;

    const w = Math.max(1, container.offsetWidth);
    const h = Math.max(1, container.offsetHeight);

    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.composer = new EffectComposer(this.renderer);
    container.append(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(options.fov, w / h, 0.1, 10000);
    this.camera.position.set(0, 8, -5);
    this.scene = new THREE.Scene();
    this.scene.background = null;

    const fog = new THREE.Fog(options.colors.background, options.length * 0.2, options.length * 500);
    this.scene.fog = fog;
    this.fogUniforms = {
      fogColor: { value: fog.color },
      fogNear: { value: fog.near },
      fogFar: { value: fog.far }
    };
    this.clock = new THREE.Clock();

    this.road = new Road(this, options);
    this.leftCarLights = new CarLights(this, options, options.colors.leftCars,
      options.movingAwaySpeed, new THREE.Vector2(0, 1 - options.carLightsFade));
    this.rightCarLights = new CarLights(this, options, options.colors.rightCars,
      options.movingCloserSpeed, new THREE.Vector2(1, 0 + options.carLightsFade));
    this.leftSticks = new LightsSticks(this, options);

    this.fovTarget = options.fov;
    this.speedUpTarget = 0;
    this.speedUp = 0;
    this.timeOffset = 0;

    ['tick', 'init', 'onResize', 'speedUpNow', 'slowDown'].forEach(k => { this[k] = this[k].bind(this); });
    window.addEventListener('resize', this.onResize);
    if (w > 0 && h > 0) this.hasValidSize = true;
  }

  onResize() {
    const width = this.container.offsetWidth, height = this.container.offsetHeight;
    if (width <= 0 || height <= 0) { this.hasValidSize = false; return; }
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.composer.setSize(width, height);
    this.hasValidSize = true;
  }

  initPasses() {
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.bloomPass = new EffectPass(this.camera, new BloomEffect({
      luminanceThreshold: 0.2, luminanceSmoothing: 0, resolutionScale: 1
    }));
    const smaaPass = new EffectPass(this.camera, new SMAAEffect({
      preset: SMAAPreset.MEDIUM,
      searchImage: SMAAEffect.searchImageDataURL,
      areaImage: SMAAEffect.areaImageDataURL
    }));
    this.renderPass.renderToScreen = false;
    this.bloomPass.renderToScreen = false;
    smaaPass.renderToScreen = true;
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(smaaPass);
  }

  init() {
    this.initPasses();
    const o = this.options;
    this.road.init();
    this.leftCarLights.init();
    this.leftCarLights.mesh.position.setX(-o.roadWidth / 2 - o.islandWidth / 2);
    this.rightCarLights.init();
    this.rightCarLights.mesh.position.setX(o.roadWidth / 2 + o.islandWidth / 2);
    this.leftSticks.init();
    this.leftSticks.mesh.position.setX(-(o.roadWidth + o.islandWidth / 2));

    /* pointer-events are off on the canvas so the hero stays clickable;
       the whole hero drives the speed-up instead                       */
    const host = this.container.closest('.hero') || this.container;
    host.addEventListener('mousedown', this.speedUpNow);
    host.addEventListener('mouseup', this.slowDown);
    host.addEventListener('mouseleave', this.slowDown);
    host.addEventListener('touchstart', this.speedUpNow, { passive: true });
    host.addEventListener('touchend', this.slowDown, { passive: true });
    this._host = host;

    this.tick();
  }

  speedUpNow() { this.fovTarget = this.options.fovSpeedUp; this.speedUpTarget = this.options.speedUp; }
  slowDown() { this.fovTarget = this.options.fov; this.speedUpTarget = 0; }

  update(delta) {
    const lerpPercentage = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta);
    this.speedUp += lerp(this.speedUp, this.speedUpTarget, lerpPercentage, 0.00001);
    this.timeOffset += this.speedUp * delta;
    const time = this.clock.elapsedTime + this.timeOffset;

    this.rightCarLights.update(time);
    this.leftCarLights.update(time);
    this.leftSticks.update(time);
    this.road.update(time);

    let updateCamera = false;
    const fovChange = lerp(this.camera.fov, this.fovTarget, lerpPercentage);
    if (fovChange !== 0) { this.camera.fov += fovChange * delta * 6; updateCamera = true; }
    if (this.options.distortion.getJS) {
      const d = this.options.distortion.getJS(0.025, time);
      this.camera.lookAt(new THREE.Vector3(
        this.camera.position.x + d.x, this.camera.position.y + d.y, this.camera.position.z + d.z
      ));
      updateCamera = true;
    }
    if (updateCamera) this.camera.updateProjectionMatrix();
  }

  tick() {
    if (this.disposed) return;
    if (!this.hasValidSize) {
      const w = this.container.offsetWidth, h = this.container.offsetHeight;
      if (w > 0 && h > 0) { this.onResize(); }
      else { requestAnimationFrame(this.tick); return; }
    }
    /* stop burning GPU while the hero is scrolled out of view */
    if (this._visible !== false) {
      const delta = this.clock.getDelta();
      this.composer.render(delta);
      this.update(delta);
    } else {
      this.clock.getDelta();
    }
    requestAnimationFrame(this.tick);
  }

  dispose() {
    this.disposed = true;
    this.scene?.traverse(o => {
      if (!o.isMesh) return;
      o.geometry?.dispose();
      Array.isArray(o.material) ? o.material.forEach(m => m.dispose()) : o.material?.dispose();
    });
    this.scene?.clear();
    this.composer?.dispose();
    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
    this.renderer?.domElement?.remove();
    window.removeEventListener('resize', this.onResize);
    if (this._host) {
      this._host.removeEventListener('mousedown', this.speedUpNow);
      this._host.removeEventListener('mouseup', this.slowDown);
      this._host.removeEventListener('mouseleave', this.slowDown);
      this._host.removeEventListener('touchstart', this.speedUpNow);
      this._host.removeEventListener('touchend', this.slowDown);
    }
  }
}

/* ------------------------------------------------------------------ mount */
export function mountHyperspeed(selector = '#hyperspeed', overrides = {}) {
  const container = document.querySelector(selector);
  if (!container) return null;

  /* motion preference and WebGL support are both hard gates: the hero has
     its own glow, particles and watermark, so failing here degrades to a
     perfectly good static cover instead of a blank box                  */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  try {
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return null;
  } catch { return null; }

  const options = {
    ...MTJ_PRESET, ...overrides,
    colors: { ...MTJ_PRESET.colors, ...(overrides.colors || {}) }
  };
  options.distortion = distortions[options.distortion] || distortions.turbulentDistortion;

  const app = new App(container, options);
  app.init();
  container.classList.add('is-live');

  const io = new IntersectionObserver(
    entries => entries.forEach(e => { app._visible = e.isIntersecting; }),
    { threshold: 0 }
  );
  io.observe(container);

  return app;
}
