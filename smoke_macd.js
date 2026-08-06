// Runtime smoke test for MACD course charts + exam data
const fs = require('fs');
const html = fs.readFileSync('/tmp/mtj/MTJ-Hub/courses/MACD_Indicator_MakeTradesJourney.html', 'utf8');

// --- minimal DOM stubs ---
const NS = 'http://www.w3.org/2000/svg';
global.C = {bull:'#2CD98A',bear:'#FF5C63',gold:'#E8C877',goldB:'#FCE9A8',goldD:'#C9A227',muted:'#9A968C',muted2:'#6f6c64',cyan:'#2FE0D6',text:'#EDEBE2'};
global.MONO = "'JetBrains Mono',monospace";
function el(t,a,p){const e={tag:t,attrs:a||{},children:[],textContent:''};if(p)p.children.push(e);return e;}
function txt(p,x,y,s,o){const t=el('text',Object.assign({x:x,y:y},o||{}),p);t.textContent=String(s);return t;}
function svgFor(box,w,h){const s=el('svg',{viewBox:'0 0 '+w+' '+h});box.children.push(s);return s;}
global.el=el; global.txt=txt; global.svgFor=svgFor;
global.document = {querySelectorAll(){return [];}, createElementNS(){return el('x');}};

// --- extract main chart script (block 0), cut at RENDER forEach ---
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const main = blocks[0];
const chartPart = main.slice(main.indexOf('/* ============ MT5 MACD indicator charts ============ */'),
                            main.indexOf("document.querySelectorAll('.rchart[data-r]')"));
eval(chartPart);

// --- RENDER map: const inside eval doesn't leak; re-eval the object literal ---
const rendM = chartPart.match(/const RENDER=(\{[\s\S]*?\});/);
const RENDER = eval('(' + rendM[1] + ')');

// --- run each draw fn with a fresh box ---
const names = Object.keys(RENDER);
let fails = 0;
for (const n of names){
  const box = {children:[]};
  try{
    RENDER[n](box);
    const svg = box.children[0];
    if(!svg) throw new Error('no svg produced');
    let count=0, bad=0;
    (function walk(e){
      count++;
      if(e.attrs){
        for(const [k,v] of Object.entries(e.attrs)){
          if(typeof v==='string' && (v.includes('NaN')||v.includes('undefined'))) {bad++; console.log('  bad attr', n, k, v);}
        }
      }
      (e.children||[]).forEach(walk);
    })(svg);
    console.log(`OK  ${n.padEnd(14)} elements=${String(count).padStart(4)}  badAttrs=${bad}`);
    if(bad) fails++;
  }catch(e){ fails++; console.log(`ERR ${n}: ${e.message}`); }
}

// --- exam data validation ---
const exam = blocks[1];
const qm = exam.match(/const EXAM_QUESTIONS = (\[[\s\S]*?\]);/);
if(!qm){ console.log('ERR: EXAM_QUESTIONS not found'); fails++; }
else{
  const Q = JSON.parse(qm[1]);
  console.log(`exam questions: ${Q.length}`);
  Q.forEach((q,i)=>{
    const ok = Array.isArray(q.opts) && q.opts.length===4 && Number.isInteger(q.ans) && q.ans>=0 && q.ans<q.opts.length && q.why && q.why_zh;
    if(!ok){ fails++; console.log(`ERR q${i+1}: ans=${q.ans} opts=${q.opts&&q.opts.length} why=${!!q.why} why_zh=${!!q.why_zh}`); }
  });
  if(Q.length!==5){ fails++; console.log('ERR: need 5 questions'); }
}
if(!exam.includes('mtj_exam_pass_20')){ fails++; console.log('ERR: exam key not pass_20'); }
if(!html.includes('课程全部完成!恭喜毕业!回到目录查看你的学习成果。')){ fails++; console.log('ERR: graduation message missing'); }
if(!html.includes('移 动 平 均 收 敛 散 发')){ fails++; console.log('ERR: hero zh missing'); }
if(!html.includes('<title>MACD Indicator')){ fails++; console.log('ERR: title missing'); }

// --- RENDER keys vs data-r in HTML ---
const dataRs = [...html.matchAll(/data-r="([^"]+)"/g)].map(m=>m[1]);
const missing = dataRs.filter(d=>!RENDER[d]);
const extra = Object.keys(RENDER).filter(r=>!dataRs.includes(r));
console.log(`data-r in html: ${dataRs.join(',')}`);
if(missing.length){fails++; console.log('ERR missing render:', missing);}
if(extra.length){fails++; console.log('ERR extra render:', extra);}

// --- ensure old risk content is gone ---
for(const frag of ['Position Sizing','亏损的不对称','The Math of Loss','drawRecovery','drawLeverage','mtj_exam_pass_10','Module 11 已解锁']){
  if(html.includes(frag)){ fails++; console.log('ERR leftover risk content:', frag); }
}
console.log(fails===0 ? '\nALL CHECKS PASSED' : `\n${fails} FAILURES`);
process.exit(fails===0?0:1);
