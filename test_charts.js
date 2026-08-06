// Functional test: run the course's JS with a minimal DOM shim and verify each
// draw function produces a valid SVG tree.
const fs = require('fs');
const src = fs.readFileSync('/tmp/mtj/check.js', 'utf8');

function makeNode(tag) {
  return { tag, attrs: {}, children: [], textContent: '', style: {},
    setAttribute(k, v) { this.attrs[k] = v; },
    appendChild(c) { this.children.push(c); return c; } };
}
const made = [];
const document = {
  createElementNS(ns, t) { const n = makeNode(t); made.push(n); return n; },
  createElement(t) { return makeNode(t); },
  getElementById(id) { const n = makeNode('stub-' + id); n.getContext = () => ({}); return n; },
  querySelectorAll() { return []; },
  head: makeNode('head'),
  documentElement: { scrollHeight: 4000 }
};
const window = {
  matchMedia: () => ({ matches: true }),
  addEventListener() {},
  innerWidth: 1280, innerHeight: 800, scrollY: 0, devicePixelRatio: 1
};
global.document = document;
global.window = window;
global.innerWidth = 1280;
global.innerHeight = 800;
global.IntersectionObserver = class { constructor() {} observe() {} };
global.requestAnimationFrame = () => {};
global.addEventListener = () => {};

const api = new Function(src + '\nreturn {drawDemand,drawSupply,drawRTB,drawInvalid,drawZoneLine,drawTrend,RENDER};')();

// verify the four required + two bonus chart functions exist and render
const fns = ['drawDemand', 'drawSupply', 'drawRTB', 'drawInvalid', 'drawZoneLine', 'drawTrend'];
let fail = 0;
for (const fn of fns) {
  if (typeof api[fn] !== 'function') { console.log('MISSING', fn); fail++; continue; }
  made.length = 0;
  const box = makeNode('box');
  api[fn](box);
  const svg = box.children[0];
  const ok = svg && svg.tag === 'svg' && svg.children.length > 0;
  const texts = svg.children.filter(c => c.tag === 'text').length;
  const rects = svg.children.filter(c => c.tag === 'rect').length;
  const paths = svg.children.filter(c => c.tag === 'path').length;
  console.log(`${fn}: svg=${!!svg} elems=${svg ? svg.children.length : 0} text=${texts} rect=${rects} path=${paths} ${ok ? 'OK' : 'FAIL'}`);
  if (!ok) fail++;
}
// RENDER map must reference all six
console.log('RENDER keys:', Object.keys(api.RENDER).join(','));
if (!api.RENDER.demand || !api.RENDER.supply || !api.RENDER.rtb || !api.RENDER.invalid || !api.RENDER.zoneline || !api.RENDER.trend) { fail++; console.log('RENDER map incomplete'); }
console.log(fail === 0 ? 'ALL CHART TESTS PASSED' : ('FAILURES: ' + fail));
process.exit(fail === 0 ? 0 : 1);
