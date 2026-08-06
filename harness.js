// Node harness: run the course's chart functions with stubbed DOM to catch runtime errors.
const fs = require('fs');
const src = fs.readFileSync('/tmp/mtj/course_script.js', 'utf8');

function makeEl() {
  const e = {
    setAttribute() {}, textContent: '', children: 0,
    style: {},
    classList: { add() {}, toggle() {} },
    appendChild() { this.children++; },
    getContext: () => ({
      clearRect() {}, createRadialGradient: () => ({ addColorStop() {} }),
      beginPath() {}, arc() {}, fill() {}, fillRect() {}, moveTo() {}, lineTo() {}, stroke() {},
    }),
    clientWidth: 800, clientHeight: 300, width: 0, height: 0,
  };
  return e;
}
const boxes = [];
const fakeDoc = {
  getElementById: () => makeEl(),
  querySelectorAll: () => [],
  createElement: () => makeEl(),
  createElementNS: () => makeEl(),
  head: { appendChild() {} },
  documentElement: { scrollHeight: 100 },
};
global.document = fakeDoc;
global.window = { addEventListener() {}, scrollY: 0, innerHeight: 800, innerWidth: 800, devicePixelRatio: 1, matchMedia: () => ({ matches: false }) };
global.addEventListener = () => {};
global.innerWidth = 800;
global.innerHeight = 800;
global.IntersectionObserver = class { constructor() {} observe() {} unobserve() {} };
global.requestAnimationFrame = () => {};
global.performance = { now: () => 0 };

// evaluate script (defines el/txt/svgFor/C/etc + draw fns + runs render call w/ empty qSA)
eval(src + '\n;globalThis.__fns={drawTrendline:drawTrendline,drawTLTypes:drawTLTypes,drawChannel:drawChannel,drawChannelTypes:drawChannelTypes,drawBreakout:drawBreakout,drawFakeout:drawFakeout,drawMAConfluence:drawMAConfluence};');
const F = globalThis.__fns;

// now call every draw function with a fake box that records appended svg
function fakeBox() {
  const b = { appended: 0, last: null, appendChild(e) { this.appended++; this.last = e; } };
  boxes.push(b);
  return b;
}

const fns = ['drawTrendline','drawTLTypes','drawChannel','drawChannelTypes','drawBreakout','drawFakeout','drawMAConfluence'];
let ok = 0;
for (const fn of fns) {
  if (typeof F[fn] !== 'function') { console.log('MISSING FUNCTION:', fn); process.exitCode = 1; continue; }
  try {
    const b = fakeBox();
    F[fn](b);
    const n = b.appended;
    const inner = b.last ? b.last.children : 0;
    console.log(`OK  ${fn} -> svg root + ${inner} child elements`);
    ok++;
  } catch (e) {
    console.log(`FAIL ${fn}: ${e.message}`);
    console.log(e.stack.split('\n').slice(0,4).join('\n'));
    process.exitCode = 1;
  }
}
console.log(`\n${ok}/${fns.length} draw functions executed without errors`);
