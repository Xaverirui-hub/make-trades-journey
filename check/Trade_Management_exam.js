
document.getElementById('yr').textContent=new Date().getFullYear();
const RM=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const NS='http://www.w3.org/2000/svg';
const C={bull:'#2CD98A',bear:'#FF5C63',gold:'#E8C877',goldB:'#FCE9A8',goldD:'#C9A227',
         muted:'#9A968C',muted2:'#6f6c64',cyan:'#2FE0D6',text:'#EDEBE2'};
const MONO="'JetBrains Mono',monospace";

function el(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function txt(p,x,y,s,o){const t=el('text',Object.assign({x:x,y:y,'font-family':MONO,'font-size':11,fill:C.muted},o||{}),p);t.textContent=s;return t;}
function svgFor(box,w,h){const s=el('svg',{viewBox:'0 0 '+w+' '+h,preserveAspectRatio:'xMidYMid meet'});box.appendChild(s);return s;}

/* ============ 1. trailing stop ratchet ============ */
function drawTrail(box){
  const W=720,H=340,L=48,R=140,T=28,B=44;
  const s=svgFor(box,W,H);
  const price=[60,63,61,66,69,67,72,75,73,78,82,80,86,90,88,93,96,94,90,84];
  const N=price.length, plotW=W-L-R, plotH=H-T-B;
  const mn=54,mx=100;
  const X=i=>L+plotW*(i/(N-1));
  const Y=v=>T+(mx-v)/(mx-mn)*plotH;
  [60,70,80,90,100].forEach(g=>{
    el('line',{x1:L,x2:L+plotW,y1:Y(g),y2:Y(g),class:'rgrid'},s);
    txt(s,L-8,Y(g)+3.5,g,{'text-anchor':'end',class:'rax'});
  });
  /* trailing stop: steps up after each higher swing low, never back down */
  const stops=[[0,57],[2,57],[3,61],[5,61],[6,66],[8,66],[9,70],[11,70],[12,75],[13,75],[14,79],[16,79],[17,83],[19,83]];
  const sg=el('g',{style:'--i:3'},s);
  stops.forEach((st,j)=>{
    const x0=X(st[0]), x1=(j+1<stops.length?X(stops[j+1][0]):X(N-1));
    el('line',{x1:x0,x2:x1,y1:Y(st[1]),y2:Y(st[1]),stroke:C.cyan,'stroke-width':1.6,
      'stroke-dasharray':'6 4','stroke-opacity':.85,class:'rlbl'},sg);
  });
  /* price path */
  const pts=price.map((p,i)=>[X(i),Y(p)]);
  el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
    stroke:C.goldB,'stroke-width':2.2,'fill':'none','stroke-linejoin':'round',class:'rline'},s);
  /* entry + exit */
  el('circle',{cx:X(0),cy:Y(60),r:5,fill:C.bull,class:'rlbl',style:'--i:9'},s);
  txt(s,X(0),Y(60)-11,'ENTRY 进场',{'text-anchor':'middle','font-size':9.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:9'});
  /* exit where price closes below the trailing stop (bar 19, stop 83) */
  const ex=19, exStop=83;
  el('circle',{cx:X(ex),cy:Y(exStop),r:6,fill:C.bear,'stroke':'#060608','stroke-width':2,class:'rlbl',style:'--i:12'},s);
  txt(s,X(ex),Y(exStop)+22,'EXIT 出场',{'text-anchor':'middle','font-size':9.5,fill:C.bear,'font-weight':700,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:12'});
  /* callout */
  const cx=W-R+16;
  el('rect',{x:cx,y:T+14,width:112,height:104,rx:12,fill:'rgba(47,224,214,.06)',stroke:'rgba(47,224,214,.32)'},s);
  txt(s,cx+56,T+38,'RATCHET',{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'letter-spacing':'.18em'});
  txt(s,cx+56,T+62,'+2.8R',{'text-anchor':'middle','font-size':24,fill:C.cyan,'font-weight':700});
  txt(s,cx+56,T+86,'captured',{'text-anchor':'middle','font-size':10,fill:C.goldB});
  txt(s,cx+56,T+106,'锁住利润',{'text-anchor':'middle','font-size':9.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L+plotW/2,H-8,'TRAILING STOP  追踪止损 — 只上不下',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.16em','font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 2. scaling out math ============ */
function drawScaleOut(box){
  const W=720,H=340,L=48,R=28,T=26,B=58;
  const s=svgFor(box,W,H);
  const price=[60,62,64,66,67,66,69,71,72,71,74,76,77,76,79,81,82,81,80,78];
  const N=price.length, plotW=W-L-R, plotH=H-T-B;
  const mn=54,mx=86;
  const X=i=>L+plotW*(i/(N-1));
  const Y=v=>T+(mx-v)/(mx-mn)*plotH;
  /* target levels: 1R=66, 2R=72, 3R=78 */
  const tps=[[66,'TP1 · +1R'],[72,'TP2 · +2R'],[78,'TP3 · +3R']];
  tps.forEach((tp,i)=>{
    el('line',{x1:L,x2:L+plotW,y1:Y(tp[0]),y2:Y(tp[0]),stroke:C.goldD,'stroke-width':1,
      'stroke-dasharray':'5 5','stroke-opacity':.55,class:'rlbl',style:'--i:'+(i+2)},s);
    txt(s,L+plotW-6,Y(tp[0])-5,tp[1],{'text-anchor':'end','font-size':10,fill:C.gold,'font-weight':700,class:'rlbl',style:'--i:'+(i+2)});
  });
  /* price path */
  const pts=price.map((p,i)=>[X(i),Y(p)]);
  el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
    stroke:C.goldB,'stroke-width':2.2,'fill':'none','stroke-linejoin':'round',class:'rline'},s);
  el('circle',{cx:X(0),cy:Y(60),r:5,fill:C.bull,class:'rlbl',style:'--i:8'},s);
  txt(s,X(0),Y(60)-11,'ENTRY 进场',{'text-anchor':'middle','font-size':9.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:8'});
  /* position remaining: 3/3 -> 2/3 -> 1/3 -> 0 */
  const bh=26, baseY=H-40;
  const fracs=[{x:3,f:1,l:'3/3 · full 满仓'},{x:7,f:2/3,l:'2/3'},{x:11,f:1/3,l:'1/3'},{x:17,f:0,l:'0 · flat 全平'}];
  txt(s,L+plotW/2,H-8,'POSITION REMAINING  持仓比例逐级减少',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.14em','font-family':"'Noto Sans SC',sans-serif"});
  fracs.forEach((fr,i)=>{
    const g=el('g',{style:'--i:'+(i+4)},s);
    el('rect',{x:X(fr.x)-plotW*0.16,y:baseY-bh,width:plotW*0.32*Math.max(fr.f,0.06),height:bh,rx:4,
      fill:C.bull,'fill-opacity':.5,stroke:C.bull,'stroke-opacity':.65,class:'rbar'},g);
    txt(g,X(fr.x),baseY-bh-8,fr.l,{'text-anchor':'middle','font-size':10,fill:fr.f>0?C.bull:C.bear,'font-weight':700,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  });
  /* realized R ladder */
  const rx=L, ry=H-20;
  txt(s,L,ry-6,'REALIZED R',{'font-size':8.5,fill:C.muted2,'letter-spacing':'.14em'});
  txt(s,L,ry+8,'1/3×1R + 1/3×2R + 1/3×3R',{'font-size':10,fill:C.muted,'font-family':"'JetBrains Mono',monospace"});
  txt(s,L+plotW,ry+8,'= 2.0R',{'text-anchor':'end','font-size':13,fill:C.goldB,'font-weight':700});
}

/* ============ 3. break-even move ============ */
function drawBE(box){
  const W=720,H=340,L=48,R=28,T=30,B=46;
  const s=svgFor(box,W,H);
  const price=[70,72,74,76,77,76.5,75,73,71,70.2,70];
  const N=price.length, plotW=W-L-R, plotH=H-T-B;
  const mn=60,mx=82;
  const X=i=>L+plotW*(i/(N-1));
  const Y=v=>T+(mx-v)/(mx-mn)*plotH;
  [62,66,70,74,78].forEach(g=>{
    el('line',{x1:L,x2:L+plotW,y1:Y(g),y2:Y(g),class:'rgrid'},s);
    txt(s,L-8,Y(g)+3.5,g,{'text-anchor':'end',class:'rax'});
  });
  const entry=70, beAt=3; /* price reaches +1R at bar 3, stop moved to entry */
  /* original stop below entry */
  const stop0=64;
  el('line',{x1:L,x2:X(beAt),y1:Y(stop0),y2:Y(stop0),stroke:C.bear,'stroke-width':1.6,
    'stroke-dasharray':'6 4','stroke-opacity':.8,class:'rlbl',style:'--i:2'},s);
  txt(s,L+4,Y(stop0)-5,'SL −1R',{'font-size':10,fill:C.bear,'font-weight':700,class:'rlbl',style:'--i:2'});
  /* BE line after the move */
  el('line',{x1:X(beAt),x2:X(N-1),y1:Y(entry),y2:Y(entry),stroke:C.gold,'stroke-width':2,
    'stroke-dasharray':'8 4',class:'rlbl',style:'--i:3'},s);
  txt(s,X(beAt)+8,Y(entry)-6,'STOP → BE',{'font-size':10,fill:C.gold,'font-weight':700,class:'rlbl',style:'--i:3'});
  /* +1R trigger marker */
  el('line',{x1:X(beAt),x2:X(beAt),y1:Y(78),y2:Y(64),stroke:C.gold,'stroke-width':1,
    'stroke-dasharray':'3 4','stroke-opacity':.5,class:'rlbl',style:'--i:4'},s);
  txt(s,X(beAt),Y(76.5)+12,'+1R',{'text-anchor':'middle','font-size':11,fill:C.goldB,'font-weight':700,class:'rlbl',style:'--i:4'});
  /* price path */
  const pts=price.map((p,i)=>[X(i),Y(p)]);
  el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
    stroke:C.goldB,'stroke-width':2.2,'fill':'none','stroke-linejoin':'round',class:'rline'},s);
  el('circle',{cx:X(0),cy:Y(entry),r:5,fill:C.bull,class:'rlbl',style:'--i:8'},s);
  txt(s,X(0),Y(entry)-11,'ENTRY 进场',{'text-anchor':'middle','font-size':9.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:8'});
  /* exit at BE = 0R */
  el('circle',{cx:X(N-1),cy:Y(entry),r:6,fill:C.gold,'stroke':'#060608','stroke-width':2,class:'rlbl',style:'--i:9'},s);
  txt(s,X(N-1),Y(entry)+22,'EXIT 0R · BE',{'text-anchor':'middle','font-size':10,fill:C.gold,'font-weight':700,class:'rlbl',style:'--i:9'});
  txt(s,L+plotW/2,H-8,'BREAK-EVEN  保本出场 — 最差从 −1R 变成 0R',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.14em','font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 4. time stop ============ */
function drawTimeStop(box){
  const W=720,H=340,L=48,R=28,T=30,B=46;
  const s=svgFor(box,W,H);
  const price=[70,70.8,71.2,70.6,71,70.4,70.8,71.1,70.5,70.9,71.2,70.7,71];
  const N=price.length, plotW=W-L-R, plotH=H-T-B;
  const mn=62,mx=80;
  const X=i=>L+plotW*(i/(N-1));
  const Y=v=>T+(mx-v)/(mx-mn)*plotH;
  [64,68,72,76].forEach(g=>{
    el('line',{x1:L,x2:L+plotW,y1:Y(g),y2:Y(g),class:'rgrid'},s);
    txt(s,L-8,Y(g)+3.5,g,{'text-anchor':'end',class:'rax'});
  });
  /* flat range band */
  el('rect',{x:L,y:Y(71.4),width:plotW,height:Y(70.2)-Y(71.4),
    fill:'rgba(232,200,119,.05)',class:'rbar',style:'--i:2'},s);
  txt(s,L+4,Y(71.4)+12,'flat range 横盘区间',{'font-size':9,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:2'});
  /* price path — goes nowhere */
  const pts=price.map((p,i)=>[X(i),Y(p)]);
  el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
    stroke:C.goldB,'stroke-width':2,'fill':'none','stroke-linejoin':'round',class:'rline'},s);
  el('circle',{cx:X(0),cy:Y(70),r:5,fill:C.bull,class:'rlbl',style:'--i:8'},s);
  txt(s,X(0),Y(70)-11,'ENTRY 进场',{'text-anchor':'middle','font-size':9.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:8'});
  /* time stop trigger at bar N=8 */
  const Nbar=8;
  el('line',{x1:X(Nbar),x2:X(Nbar),y1:T,y2:T+plotH,stroke:C.bear,'stroke-width':1.5,
    'stroke-dasharray':'5 4','stroke-opacity':.85,class:'rlbl',style:'--i:6'},s);
  txt(s,X(Nbar),T+14,'N BARS',{'text-anchor':'middle','font-size':9,fill:C.bear,'font-weight':700,'letter-spacing':'.1em',class:'rlbl',style:'--i:6'});
  /* exit at ~BE */
  el('circle',{cx:X(Nbar),cy:Y(70.9),r:6,fill:C.bear,'stroke':'#060608','stroke-width':2,class:'rlbl',style:'--i:9'},s);
  txt(s,X(Nbar),Y(70.9)+22,'EXIT ~0R',{'text-anchor':'middle','font-size':10,fill:C.bear,'font-weight':700,class:'rlbl',style:'--i:9'});
  txt(s,L+plotW/2,H-8,'TIME STOP  时间止损 — 横盘 N 根就走',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.14em','font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 5. trailing vs fixed ============ */
function drawCompare(box){
  const W=720,H=300,L=54,R=30,T=26,B=52;
  const s=svgFor(box,W,H);
  const data=[{k:'Win Rate 胜率',a:52,b:40,ua:'%',ub:'%'},
              {k:'Avg Win 平均盈利',a:1.8,b:3.6,ua:'R',ub:'R'},
              {k:'Expectancy 期望值',a:0.34,b:0.62,ua:'R',ub:'R'}];
  const plotW=W-L-R,plotH=H-T-B;
  const maxV=[60,4,0.8];
  const X=i=>L+plotW/data.length*(i+0.5);
  const bw=Math.min(plotW/data.length*0.28,46);
  data.forEach((d,i)=>{
    const sc=maxV[i];
    const yA=T+plotH-d.a/sc*plotH;
    const yB=T+plotH-d.b/sc*plotH;
    const g=el('g',{style:'--i:'+i*2},s);
    el('rect',{x:X(i)-bw-4,y:yA,width:bw,height:T+plotH-yA,rx:3,fill:C.gold,'fill-opacity':.5,
      stroke:C.gold,'stroke-opacity':.55,class:'rbar'},g);
    txt(g,X(i)-bw-4+bw/2,yA-8,d.a.toFixed(d.a%1?2:0)+d.ua,{'text-anchor':'middle','font-size':11,fill:C.gold,'font-weight':700,class:'rlbl'});
    const g2=el('g',{style:'--i:'+(i*2+1)},s);
    el('rect',{x:X(i)+4,y:yB,width:bw,height:T+plotH-yB,rx:3,fill:C.cyan,'fill-opacity':.5,
      stroke:C.cyan,'stroke-opacity':.55,class:'rbar'},g2);
    txt(g2,X(i)+4+bw/2,yB-8,d.b.toFixed(d.b%1?2:0)+d.ub,{'text-anchor':'middle','font-size':11,fill:C.cyan,'font-weight':700,class:'rlbl'});
    txt(s,X(i),T+plotH+20,d.k,{'text-anchor':'middle','font-size':10.5,fill:C.text,'font-family':"'Noto Sans SC',sans-serif"});
  });
  /* legend */
  txt(s,L,14,'FIXED 固定',{'font-size':10,fill:C.gold,'font-weight':700,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L+80,14,'TRAILING 追踪',{'font-size':10,fill:C.cyan,'font-weight':700,'font-family':"'Noto Sans SC',sans-serif"});
}

const RENDER={trail:drawTrail,scaleout:drawScaleOut,be:drawBE,timestop:drawTimeStop,compare:drawCompare};
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

