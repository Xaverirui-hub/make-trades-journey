// minimal DOM stubs to smoke-test the page scripts
function fakeEl(){
  const e = {
    attrs:{}, style:{}, classList:{_s:new Set(),
      add(...c){c.forEach(x=>this._s.add(x));},
      remove(...c){c.forEach(x=>this._s.delete(x));},
      contains(c){return this._s.has(c);},
      toggle(c){this._s.has(c)?this._s.delete(c):this._s.add(c);}},
    setAttribute(k,v){this.attrs[k]=v;},
    getAttribute(k){return this.attrs[k];},
    appendChild(){return this;}, textContent:'', innerHTML:'', value:'0',
    dataset:{}, scrollIntoView(){}, clientWidth: 800, clientHeight: 300,
    getContext: () => noopCtx,
  };
  return e;
}
const noopCtx = new Proxy({}, {get:(t,p)=> (p==='createRadialGradient')? ()=>({addColorStop(){}}): (typeof p==='string'? ()=>{} : undefined), set:()=>true});
global.document = {
  documentElement: { scrollHeight: 2400, clientHeight: 800 },
  createElementNS: () => fakeEl(),
  createElement: () => fakeEl(),
  createTextNode: () => fakeEl(),
  getElementById: () => fakeEl(),
  querySelector: () => null,
  querySelectorAll: () => [],
  head: { appendChild(){}, },
  body: fakeEl(),
};
global.window = {
  matchMedia: () => ({matches:false}),
  addEventListener(){}, innerWidth: 1280, innerHeight: 800,
  devicePixelRatio: 1, scrollY: 0,
};
global.IntersectionObserver = class { constructor(){} observe(){} unobserve(){} };
global.localStorage = { getItem:()=>null, setItem(){} };
global.requestAnimationFrame = () => 0;
global.performance = { now: () => 0 };
global.addEventListener = () => {};
global.innerWidth = 1280; global.innerHeight = 800;
