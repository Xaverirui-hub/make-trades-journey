
function makeEl(){ return { setAttribute(){}, appendChild(){}, getContext(){ return new Proxy({}, {get:()=>()=>{}}); },
  addEventListener(){}, style:{}, classList:{add(){},toggle(){}}, textContent:'' }; }
const boxes = ['rsiLevels','rsiFormula','rsiDivergence','rsiTrend','rsi50','rsiPractice','rsiMisuse']
  .map(k=>({dataset:{r:k}, appendChild(){}, classList:{add(){}} }));
global.document = {
  documentElement:{ scrollHeight:2000 },
  getElementById(){ return makeEl(); },
  createElementNS(){ return makeEl(); },
  createElement(){ return makeEl(); },
  querySelectorAll(sel){ return sel.includes('.rchart') ? boxes : []; },
  head:{ appendChild(){} }, body:{ classList:{ contains(){return false}, add(){}, remove(){} } }
};
global.window = { matchMedia(){ return {matches:true}; }, addEventListener(){}, scrollY:0, innerWidth:1200, innerHeight:800, devicePixelRatio:1 };
global.innerWidth=1200; global.innerHeight=800;
global.addEventListener=()=>{};
global.IntersectionObserver = class { observe(){} unobserve(){} };
global.requestAnimationFrame = ()=>{};
global.localStorage = { getItem(){return null}, setItem(){} };
global.performance = { now(){return 0} };


document.getElementById('yr').textContent=new Date().getFullYear();
const RM=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const NS='http://www.w3.org/2000/svg';
const C={bull:'#2CD98A',bear:'#FF5C63',gold:'#E8C877',goldB:'#FCE9A8',goldD:'#C9A227',
         muted:'#9A968C',muted2:'#6f6c64',cyan:'#2FE0D6',text:'#EDEBE2'};
const MONO="'JetBrains Mono',monospace";

function el(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function txt(p,x,y,s,o){const t=el('text',Object.assign({x:x,y:y,'font-family':MONO,'font-size':11,fill:C.muted},o||{}),p);t.textContent=s;return t;}
function svgFor(box,w,h){const s=el('svg',{viewBox:'0 0 '+w+' '+h,preserveAspectRatio:'xMidYMid meet'});box.appendChild(s);return s;}

/* ============ RSI.01 levels 70/30 ============ */
function drawRSILevels(box){
  const W=720,H=300,L=46,R=26,T=20,B=30;
  const s=svgFor(box,W,H);
  const vals=[52,58,63,60,66,71,74,70,64,58,52,46,41,35,31,28,32,38,44,50,56,61,65,62,57,53,49,54,60,66,72,68,61,55,48,42,47,53,58,64];
  const n=vals.length, plotW=W-L-R, plotH=H-T-B;
  const X=i=>L+plotW*(i/(n-1));
  const Y=v=>T+plotH-(v/100)*plotH;
  el('rect',{x:L,y:Y(100),width:plotW,height:Y(70)-Y(100),fill:'rgba(255,92,99,.07)',class:'rbar',style:'--i:0'},s);
  el('rect',{x:L,y:Y(30),width:plotW,height:Y(0)-Y(30),fill:'rgba(44,217,138,.07)',class:'rbar',style:'--i:1'},s);
  [[70,C.bear,'OVERBOUGHT 超买'],[50,C.gold,'50 MIDLINE 中线'],[30,C.bull,'OVERSOLD 超卖']].forEach(d=>{
    el('line',{x1:L,x2:L+plotW,y1:Y(d[0]),y2:Y(d[0]),stroke:d[1],'stroke-opacity':.55,'stroke-dasharray':'6 5','stroke-width':1.2},s);
    txt(s,L+plotW+6,Y(d[0])+3.5,d[2],{'font-size':9,fill:d[1],'font-family':"'Noto Sans SC',sans-serif",'letter-spacing':'.05em'});
  });
  [20,40,60,80].forEach(v=>{el('line',{x1:L,x2:L+plotW,y1:Y(v),y2:Y(v),class:'rgrid'},s);});
  const pts=vals.map((v,i)=>[X(i),Y(v)]);
  el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')+' L'+X(n-1).toFixed(1)+','+Y(0).toFixed(1)+' L'+X(0).toFixed(1)+','+Y(0).toFixed(1)+' Z',
    fill:'rgba(232,200,119,.08)',class:'rbar',style:'--i:2'},s);
  el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),stroke:C.gold,'stroke-width':2.2,fill:'none',class:'rline'},s);
  const peak=6, trough=11;
  txt(s,X(peak),Y(vals[peak])-10,'74',{'text-anchor':'middle','font-size':12,'font-weight':700,fill:C.bear,class:'rlbl'});
  txt(s,X(trough),Y(vals[trough])+18,'28',{'text-anchor':'middle','font-size':12,'font-weight':700,fill:C.bull,class:'rlbl'});
  txt(s,L+plotW/2,H-10,'RSI (14) — 0–100 OSCILLATOR  震荡指标',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.16em','font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ RSI.02 formula intuition ============ */
function drawRSIFormula(box){
  const W=720,H=290,s=svgFor(box,W,H);
  const sc=[
    {t:'STRONG UPTREND 强势上涨',g:13,l:2.5,rsi:84,c:C.bull},
    {t:'BALANCED 势均力敌',g:6,l:6,rsi:50,c:C.gold},
    {t:'STRONG DOWNTREND 强势下跌',g:2.5,l:13,rsi:16,c:C.bear}];
  const cw=(W-40)/3, base=158, SC=90/13;
  txt(s,20+cw*1.5,18,'AVG GAIN ÷ AVG LOSS — LAST 14 PERIODS  14 期平均涨幅 ÷ 平均跌幅',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.14em','font-family':"'Noto Sans SC',sans-serif"});
  sc.forEach((c,i)=>{
    const x=20+cw*i, g=el('g',{style:'--i:'+i},s);
    el('rect',{x:x+7,y:32,width:cw-14,height:H-62,rx:14,fill:'rgba(255,255,255,.016)',stroke:'rgba(232,200,119,.12)',class:'rbar'},g);
    txt(g,x+cw/2,54,c.t,{'text-anchor':'middle','font-size':9.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
    const gh=c.g*SC, lh=c.l*SC;
    el('rect',{x:x+cw/2-42,y:base-gh,width:34,height:gh,rx:3,fill:C.bull,'fill-opacity':.6,stroke:C.bull,'stroke-opacity':.5,class:'rbar'},g);
    txt(g,x+cw/2-25,base-gh-7,'+'+c.g,{'text-anchor':'middle','font-size':11,fill:C.bull,'font-weight':700,class:'rlbl'});
    el('rect',{x:x+cw/2+8,y:base,width:34,height:lh,rx:3,fill:C.bear,'fill-opacity':.6,stroke:C.bear,'stroke-opacity':.5,class:'rbar'},g);
    txt(g,x+cw/2+25,base+lh+15,'−'+c.l,{'text-anchor':'middle','font-size':11,fill:C.bear,'font-weight':700,class:'rlbl'});
    txt(g,x+cw/2-25,base+14,'GAIN 涨',{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
    txt(g,x+cw/2+25,base+14,'LOSS 跌',{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
    el('rect',{x:x+cw/2-46,y:base+44,width:92,height:46,rx:10,fill:'rgba(232,200,119,.08)',stroke:'rgba(232,200,119,.35)',class:'rbar'},g);
    txt(g,x+cw/2,base+63,'RSI',{'text-anchor':'middle','font-size':9,fill:C.muted2,'letter-spacing':'.18em'});
    txt(g,x+cw/2,base+80,c.rsi,{'text-anchor':'middle','font-size':19,'font-weight':700,fill:c.c,class:'rlbl'});
  });
  txt(s,W/2,H-12,'Bigger ratio → RSI toward 100 · 比值越大，RSI 越接近 100',{'text-anchor':'middle','font-size':10,fill:C.goldB,'font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ RSI.03 divergence ============ */
function drawRSIDivergence(box){
  const W=720,H=390,L=46,R=30,T=22,B=18;
  const s=svgFor(box,W,H);
  const topH=150, gap=26;
  const botY=T+topH+gap, botH=H-B-botY;
  const plotW=W-L-R;
  const X=i=>L+plotW*(i/4);
  const P=[{v:100},{v:112},{v:106},{v:98},{v:107}];
  const pmn=92,pmx=116;
  const PY=v=>T+(pmx-v)/(pmx-pmn)*topH;
  const RS=[{v:58},{v:47},{v:52},{v:62},{v:71}];
  const RY=v=>botY+(100-v)/100*botH;
  txt(s,L,T-8,'PRICE  价格',{'font-size':9.5,fill:C.text,'letter-spacing':'.2em'});
  txt(s,L,botY-8,'RSI (14)  相对强弱指标',{'font-size':9.5,fill:C.gold,'letter-spacing':'.1em','font-family':"'Noto Sans SC',sans-serif"});
  [70,50,30].forEach(v=>{el('line',{x1:L,x2:L+plotW,y1:RY(v),y2:RY(v),stroke:'rgba(255,255,255,.06)','stroke-dasharray':'4 4'},s);});
  const ppts=P.map((p,i)=>[X(i),PY(p.v)]);
  el('path',{d:ppts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),stroke:C.text,'stroke-width':2,fill:'none',class:'rline'},s);
  P.forEach((p,i)=>{el('circle',{cx:X(i),cy:PY(p.v),r:4,fill:C.text,class:'rlbl'},s);});
  const rpts=RS.map((r,i)=>[X(i),RY(r.v)]);
  el('path',{d:rpts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),stroke:C.gold,'stroke-width':2,fill:'none',class:'rline'},s);
  RS.forEach((r,i)=>{el('circle',{cx:X(i),cy:RY(r.v),r:4,fill:C.gold,class:'rlbl'},s);});
  [0,1,2,3].forEach(i=>{el('line',{x1:X(i),x2:X(i),y1:PY(P[i].v),y2:RY(RS[i].v),stroke:'rgba(232,200,119,.22)','stroke-dasharray':'3 5'},s);});
  /* bearish divergence: P0->P1 up, R0->R1 down */
  el('line',{x1:X(0),x2:X(1),y1:PY(P[0].v),y2:PY(P[1].v),stroke:C.bear,'stroke-width':1.7,'stroke-dasharray':'6 4',class:'rlbl'},s);
  el('line',{x1:X(0),x2:X(1),y1:RY(RS[0].v),y2:RY(RS[1].v),stroke:C.bear,'stroke-width':1.7,'stroke-dasharray':'6 4',class:'rlbl'},s);
  /* bullish divergence: P2->P3 down, R2->R3 up */
  el('line',{x1:X(2),x2:X(3),y1:PY(P[2].v),y2:PY(P[3].v),stroke:C.bull,'stroke-width':1.7,'stroke-dasharray':'6 4',class:'rlbl'},s);
  el('line',{x1:X(2),x2:X(3),y1:RY(RS[2].v),y2:RY(RS[3].v),stroke:C.bull,'stroke-width':1.7,'stroke-dasharray':'6 4',class:'rlbl'},s);
  txt(s,X(0),PY(P[0].v)+16,'1',{'text-anchor':'middle','font-size':11,fill:C.muted2});
  txt(s,X(1),PY(P[1].v)-10,'2 · higher high',{'text-anchor':'middle','font-size':10,fill:C.bear,class:'rlbl'});
  txt(s,X(2),PY(P[2].v)+16,'3',{'text-anchor':'middle','font-size':11,fill:C.muted2});
  txt(s,X(3),PY(P[3].v)+16,'4 · lower low',{'text-anchor':'middle','font-size':10,fill:C.bull,class:'rlbl'});
  txt(s,X(1),RY(RS[1].v)+16,'RSI lower high 不创新高',{'text-anchor':'middle','font-size':9.5,fill:C.bear,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  txt(s,X(3),RY(RS[3].v)-10,'RSI higher low 不创新低',{'text-anchor':'middle','font-size':9.5,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  txt(s,L+plotW/2,T+topH-14,'PRICE HIGHER HIGH 2>1 · RSI LOWER HIGH — BEARISH 顶背离',{'text-anchor':'middle','font-size':9.5,fill:C.bear,'letter-spacing':'.08em',class:'rlbl'});
  txt(s,L+plotW/2,H-12,'PRICE LOWER LOW 4<3 · RSI HIGHER LOW — BULLISH 底背离',{'text-anchor':'middle','font-size':9.5,fill:C.bull,'letter-spacing':'.08em',class:'rlbl'});
}

/* ============ RSI.04 trend context ============ */
function drawRSITrend(box){
  const W=720,H=370,L=46,R=26,T=20,B=16;
  const s=svgFor(box,W,H);
  const topH=152, gap=26;
  const botY=T+topH+gap, botH=H-B-botY;
  const plotW=W-L-R;
  const n=16;
  const X=i=>L+plotW*(i/(n-1));
  const prices=[100,104,103,109,113,111,118,122,120,127,131,129,136,140,138,146];
  const pmn=96,pmx=150;
  const PY=v=>T+(pmx-v)/(pmx-pmn)*topH;
  const rsi=[58,62,60,66,70,68,72,75,73,76,79,77,74,78,80,77];
  const RY=v=>botY+(100-v)/100*botH;
  txt(s,L,T-8,'PRICE — UPTREND  价格 · 上升趋势',{'font-size':9.5,fill:C.text,'letter-spacing':'.12em','font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L,botY-8,'RSI (14)  趋势中 70 是常态',{'font-size':9.5,fill:C.gold,'letter-spacing':'.1em','font-family':"'Noto Sans SC',sans-serif"});
  el('rect',{x:L,y:RY(100),width:plotW,height:RY(70)-RY(100),fill:'rgba(255,92,99,.09)',class:'rbar',style:'--i:0'},s);
  el('line',{x1:L,x2:L+plotW,y1:RY(70),y2:RY(70),stroke:C.bear,'stroke-opacity':.55,'stroke-dasharray':'6 5'},s);
  el('line',{x1:L,x2:L+plotW,y1:RY(50),y2:RY(50),stroke:C.gold,'stroke-opacity':.4,'stroke-dasharray':'4 5'},s);
  txt(s,L+plotW+5,RY(70)+3.5,'70',{'font-size':9,fill:C.bear});
  txt(s,L+plotW+5,RY(50)+3.5,'50',{'font-size':9,fill:C.gold});
  const ppts=prices.map((p,i)=>[X(i),PY(p)]);
  el('path',{d:ppts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),stroke:C.text,'stroke-width':2,fill:'none',class:'rline'},s);
  el('line',{x1:X(0),x2:X(n-1),y1:PY(99),y2:PY(141),stroke:C.bull,'stroke-width':1.6,'stroke-dasharray':'7 5','stroke-opacity':.8,class:'rlbl'},s);
  txt(s,X(n-1)+4,PY(141)-7,'trendline 趋势线',{'font-size':9,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  const rpts=rsi.map((v,i)=>[X(i),RY(v)]);
  el('path',{d:rpts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),stroke:C.gold,'stroke-width':2,fill:'none',class:'rline'},s);
  txt(s,X(4)+8,RY(rsi[4])-9,'✕ SHORT HERE = LOSS 这里做空 = 亏',{'font-size':9.5,fill:C.bear,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  const zi0=12, zi1=14;
  el('rect',{x:X(zi0),y:RY(50),width:X(zi1)-X(zi0),height:RY(40)-RY(50),fill:'rgba(44,217,138,.14)',class:'rbar',style:'--i:1'},s);
  txt(s,(X(zi0)+X(zi1))/2,RY(50)-8,'✓ BUY ZONE 40–50 买入区',{'text-anchor':'middle','font-size':9,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  txt(s,L+plotW/2,H-11,'RSI 70–80 FOR WEEKS = STRONG TREND, NOT A SHORT  连续数周 70–80 = 强趋势，不是做空信号',{'text-anchor':'middle','font-size':9.5,fill:C.goldB,'font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ RSI.05 50 midline ============ */
function drawRSI50(box){
  const W=720,H=290,L=46,R=30,T=22,B=30;
  const s=svgFor(box,W,H);
  const vals=[38,34,31,35,41,46,44,49,55,52,58,63,61,66,70,68,72];
  const n=vals.length, plotW=W-L-R, plotH=H-T-B;
  const X=i=>L+plotW*(i/(n-1));
  const Y=v=>T+plotH-(v/100)*plotH;
  el('rect',{x:L,y:Y(100),width:plotW,height:Y(50)-Y(100),fill:'rgba(44,217,138,.07)',class:'rbar',style:'--i:0'},s);
  el('rect',{x:L,y:Y(50),width:plotW,height:Y(0)-Y(50),fill:'rgba(255,92,99,.05)',class:'rbar',style:'--i:1'},s);
  [70,30].forEach(v=>{el('line',{x1:L,x2:L+plotW,y1:Y(v),y2:Y(v),stroke:'rgba(255,255,255,.07)','stroke-dasharray':'5 5'},s);});
  el('line',{x1:L,x2:L+plotW,y1:Y(50),y2:Y(50),stroke:C.gold,'stroke-width':1.6,'stroke-dasharray':'8 5','stroke-opacity':.9},s);
  txt(s,L+plotW+6,Y(50)+3.5,'50',{'font-size':9,fill:C.gold});
  const pts=vals.map((v,i)=>[X(i),Y(v)]);
  el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),stroke:C.cyan,'stroke-width':2.2,fill:'none',class:'rline'},s);
  const ci=7;
  el('circle',{cx:X(ci),cy:Y(55),r:6,fill:'none',stroke:C.bull,'stroke-width':2,class:'rlbl'},s);
  el('line',{x1:X(ci),x2:X(ci),y1:Y(55),y2:Y(55)-36,stroke:C.bull,'stroke-width':1.4,'stroke-dasharray':'3 4',class:'rlbl'},s);
  txt(s,X(ci),Y(55)-44,'CROSS 突破',{'text-anchor':'middle','font-size':10,fill:C.bull,'font-weight':700,class:'rlbl'});
  txt(s,X(ci),Y(55)-30,'momentum turns bullish 动能转多',{'text-anchor':'middle','font-size':8.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  txt(s,L+14,Y(26),'BEARS 空方掌控',{'font-size':9,fill:C.bear,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L+14,Y(76),'BULLS 多方掌控',{'font-size':9,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L+plotW/2,H-10,'ABOVE 50 BULLS · BELOW 50 BEARS  50 上方多方 · 下方空方',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.1em','font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ RSI.06 price action practice ============ */
function drawRSIPractice(box){
  const W=720,H=390,L=46,R=30,T=22,B=18;
  const s=svgFor(box,W,H);
  const topH=152, gap=26;
  const botY=T+topH+gap, botH=H-B-botY;
  const plotW=W-L-R;
  const n=18;
  const X=i=>L+plotW*(i/(n-1));
  const prices=[104,108,105,112,116,113,109,114,110,103,98,102,106,101,95,99,104,108];
  const pmn=90,pmx=120;
  const PY=v=>T+(pmx-v)/(pmx-pmn)*topH;
  const rsi=[55,60,52,66,71,64,58,68,63,52,44,50,56,48,38,46,54,60];
  const RY=v=>botY+(100-v)/100*botH;
  txt(s,L,T-8,'PRICE — RANGE WITH LEVELS  价格 · 震荡 + 关键位',{'font-size':9.5,fill:C.text,'letter-spacing':'.08em','font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L,botY-8,'RSI (14) — CONFIRMATION FILTER  确认过滤器',{'font-size':9.5,fill:C.gold,'letter-spacing':'.08em','font-family':"'Noto Sans SC',sans-serif"});
  const res=114, sup=98;
  el('line',{x1:L,x2:L+plotW,y1:PY(res),y2:PY(res),stroke:C.bear,'stroke-width':1.5,'stroke-dasharray':'8 5','stroke-opacity':.8},s);
  txt(s,L+plotW+6,PY(res)+3.5,'RESISTANCE 阻力',{'font-size':9,fill:C.bear,'font-family':"'Noto Sans SC',sans-serif"});
  el('line',{x1:L,x2:L+plotW,y1:PY(sup),y2:PY(sup),stroke:C.bull,'stroke-width':1.5,'stroke-dasharray':'8 5','stroke-opacity':.8},s);
  txt(s,L+plotW+6,PY(sup)+3.5,'SUPPORT 支撑',{'font-size':9,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif"});
  const ppts=prices.map((p,i)=>[X(i),PY(p)]);
  el('path',{d:ppts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),stroke:C.text,'stroke-width':2,fill:'none',class:'rline'},s);
  [50,30].forEach(v=>{el('line',{x1:L,x2:L+plotW,y1:RY(v),y2:RY(v),stroke:'rgba(255,255,255,.06)','stroke-dasharray':'4 4'},s);});
  el('line',{x1:L,x2:L+plotW,y1:RY(70),y2:RY(70),stroke:C.bear,'stroke-opacity':.5,'stroke-dasharray':'6 5'},s);
  const rpts=rsi.map((v,i)=>[X(i),RY(v)]);
  el('path',{d:rpts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),stroke:C.gold,'stroke-width':2,fill:'none',class:'rline'},s);
  const si=4, li=14;
  el('circle',{cx:X(si),cy:PY(res),r:5,fill:'none',stroke:C.bear,'stroke-width':2,class:'rlbl'},s);
  el('line',{x1:X(si),x2:X(si),y1:PY(res),y2:RY(rsi[si]),stroke:'rgba(255,92,99,.4)','stroke-dasharray':'3 5'},s);
  txt(s,X(si),RY(rsi[si])+16,'71 overbought 超买',{'text-anchor':'middle','font-size':9,fill:C.bear,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  el('line',{x1:X(si)+5,x2:X(si)+5,y1:PY(prices[si]),y2:PY(prices[si])+28,stroke:C.bear,'stroke-width':2.4,class:'rlbl'},s);
  txt(s,X(si)+15,PY(prices[si])+20,'SELL 做空',{'font-size':9,fill:C.bear,'font-weight':700,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  el('circle',{cx:X(li),cy:PY(sup),r:5,fill:'none',stroke:C.bull,'stroke-width':2,class:'rlbl'},s);
  el('line',{x1:X(li),x2:X(li),y1:PY(sup),y2:RY(rsi[li]),stroke:'rgba(44,217,138,.4)','stroke-dasharray':'3 5'},s);
  txt(s,X(li),RY(rsi[li])+16,'38 oversold 超卖',{'text-anchor':'middle','font-size':9,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  el('line',{x1:X(li)+5,x2:X(li)+5,y1:PY(prices[li]),y2:PY(prices[li])+28,stroke:C.bull,'stroke-width':2.4,class:'rlbl'},s);
  txt(s,X(li)+15,PY(prices[li])+20,'BUY 做多',{'font-size':9,fill:C.bull,'font-weight':700,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  txt(s,L+plotW/2,H-11,'LEVEL + RSI EXTREME + PRICE ACTION = ONE TRADE  关键位 + RSI 极端 + 价格行为 = 一笔交易',{'text-anchor':'middle','font-size':9.5,fill:C.goldB,'font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ RSI.07 misuse list ============ */
function drawRSIMisuse(box){
  const W=720,H=320,s=svgFor(box,W,H);
  const rows=[
    ['1','Fade every 70 in a trend','趋势里见 70 就反手做空'],
    ['2','Trade divergence with no level','没有关键位就光靠背离交易'],
    ['3','Chase the 50 cross at market','50 穿越就市价追单'],
    ['4','Trust M1–M5 RSI','在 M1–M5 上信任 RSI'],
    ['5','Let the indicator replace the plan','让指标代替交易计划做决定']];
  const rh=(H-50)/rows.length;
  txt(s,W/2,26,'FIVE WAYS RSI GETS MISUSED  五种误用',{'text-anchor':'middle','font-size':10.5,fill:C.muted2,'letter-spacing':'.18em','font-family':"'Noto Sans SC',sans-serif"});
  rows.forEach((r,i)=>{
    const y=38+rh*i, g=el('g',{style:'--i:'+i},s);
    el('rect',{x:20,y:y+4,width:W-40,height:rh-12,rx:10,fill:'rgba(255,92,99,.05)',stroke:'rgba(255,92,99,.22)',class:'rbar'},g);
    el('circle',{cx:50,cy:y+rh/2-1,r:13,fill:'rgba(255,92,99,.15)',class:'rlbl'},g);
    txt(g,50,y+rh/2+4,'✕',{'text-anchor':'middle','font-size':13,fill:C.bear,'font-weight':700,class:'rlbl'});
    txt(g,78,y+rh/2-3,r[1],{'font-size':12.5,fill:C.text,'font-weight':600});
    txt(g,78,y+rh/2+13,r[2],{'font-size':10.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
    txt(g,W-30,y+rh/2+4,r[0],{'text-anchor':'end','font-size':16,'font-weight':700,fill:'rgba(255,92,99,.35)'});
  });
}

const RENDER={rsiLevels:drawRSILevels,rsiFormula:drawRSIFormula,rsiDivergence:drawRSIDivergence,
              rsiTrend:drawRSITrend,rsi50:drawRSI50,rsiPractice:drawRSIPractice,rsiMisuse:drawRSIMisuse};
document.querySelectorAll('.rchart[data-r]').forEach(b=>{const f=RENDER[b.dataset.r];if(f)f(b);});


/* scaleX bars need their own keyframe since .rbar uses scaleY */
const styleFix=document.createElement('style');
styleFix.textContent='.in .rbar[style*="scaleX"]{transform:scaleX(1)!important;}';
document.head.appendChild(styleFix);

/* ---------------- reveal on scroll ---------------- */
const io=new IntersectionObserver((ents)=>{
  ents.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
},{threshold:.18,rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.reveal').forEach(x=>io.observe(x));
document.querySelectorAll('.rchart').forEach(ch=>{
  const o=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){ch.classList.add('in');o.unobserve(ch);}});},{threshold:.2});
  o.observe(ch);
});

/* ---------------- progress bar + active nav ---------------- */
const prog=document.getElementById('progress');
const navlinks=[...document.querySelectorAll('.secnav a')];
const secs=navlinks.map(a=>document.querySelector(a.getAttribute('href')));
function onScroll(){
  const st=window.scrollY,dh=document.documentElement.scrollHeight-window.innerHeight;
  prog.style.width=(dh>0?(st/dh*100):0)+'%';
  let idx=-1;secs.forEach((s,i)=>{if(s&&s.getBoundingClientRect().top<=window.innerHeight*0.4)idx=i;});
  navlinks.forEach((a,i)=>a.classList.toggle('active',i===idx));
}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ---------------- gold particle field ---------------- */
(function(){
  const cv=document.getElementById('particles'),ctx=cv.getContext('2d');
  let w,h,parts=[],dpr=Math.min(window.devicePixelRatio||1,2);
  function resize(){w=cv.width=innerWidth*dpr;h=cv.height=innerHeight*dpr;cv.style.width=innerWidth+'px';cv.style.height=innerHeight+'px';}
  resize();addEventListener('resize',resize);
  const N=RM?0:Math.min(90,Math.floor(innerWidth/16));
  for(let i=0;i<N;i++)parts.push({x:Math.random()*w,y:Math.random()*h,
    r:(Math.random()*1.6+0.4)*dpr,vy:-(Math.random()*0.25+0.05)*dpr,vx:(Math.random()-0.5)*0.15*dpr,
    a:Math.random()*0.5+0.15,tw:Math.random()*Math.PI*2});
  function draw(){
    ctx.clearRect(0,0,w,h);
    for(const p of parts){
      p.y+=p.vy;p.x+=p.vx;p.tw+=0.02;
      if(p.y<-10){p.y=h+10;p.x=Math.random()*w;}
      const fl=0.5+0.5*Math.sin(p.tw);
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);
      g.addColorStop(0,'rgba(252,233,168,'+(p.a*fl)+')');
      g.addColorStop(1,'rgba(232,200,119,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*4,0,6.283);ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  if(!RM)draw();
})();

/* ---------------- hero live candle ticker ---------------- */
(function(){
  const cv=document.getElementById('heroChart');if(!cv||RM)return;
  const ctx=cv.getContext('2d');let w,h,dpr=Math.min(window.devicePixelRatio||1,2);
  function resize(){w=cv.width=cv.clientWidth*dpr;h=cv.height=cv.clientHeight*dpr;}
  resize();addEventListener('resize',resize);
  let candles=[],price=100,cw=16*dpr,gap=8*dpr;
  function makeCandle(){
    const o=price,delta=(Math.random()-0.48)*7;price=Math.max(60,Math.min(140,price+delta));
    const c=price,hi=Math.max(o,c)+Math.random()*4,lo=Math.min(o,c)-Math.random()*4;
    return{o,c,hi,lo,grow:0};
  }
  const total=()=>Math.ceil(w/(cw+gap))+2;
  for(let i=0;i<total();i++)candles.push(makeCandle());
  let acc=0,last=performance.now();
  function frame(now){
    const dt=now-last;last=now;acc+=dt;
    if(acc>620){acc=0;candles.push(makeCandle());if(candles.length>total()+2)candles.shift();}
    let mn=Infinity,mx=-Infinity;candles.forEach(k=>{mn=Math.min(mn,k.lo);mx=Math.max(mx,k.hi);});
    const pad=(mx-mn)*0.15;mn-=pad;mx+=pad;
    const Y=p=>h-((p-mn)/(mx-mn))*(h*0.9)-h*0.05;
    ctx.clearRect(0,0,w,h);
    const stp=cw+gap;const startX=w-candles.length*stp+gap/2;
    candles.forEach((k,i)=>{
      k.grow=Math.min(1,k.grow+0.09);
      const x=startX+i*stp+cw/2;const up=k.c>=k.o;
      const col=up?'#2CD98A':'#FF5C63';
      ctx.strokeStyle=col;ctx.globalAlpha=0.85*k.grow;ctx.lineWidth=1.4*dpr;
      ctx.beginPath();ctx.moveTo(x,Y(k.hi));ctx.lineTo(x,Y(k.lo));ctx.stroke();
      const bt=Y(Math.max(k.o,k.c)),bb=Y(Math.min(k.o,k.c));
      const bh=Math.max((bb-bt)*k.grow,1.5);
      ctx.fillStyle=col;ctx.globalAlpha=0.7*k.grow;
      ctx.fillRect(x-cw/2,bt+((bb-bt)-bh)/2,cw,bh);
    });
    ctx.globalAlpha=1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

