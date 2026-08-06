
document.getElementById('yr').textContent=new Date().getFullYear();
const RM=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const NS='http://www.w3.org/2000/svg';
const C={bull:'#2CD98A',bear:'#FF5C63',gold:'#E8C877',goldB:'#FCE9A8',goldD:'#C9A227',
         muted:'#9A968C',muted2:'#6f6c64',cyan:'#2FE0D6',text:'#EDEBE2'};
const MONO="'JetBrains Mono',monospace";

function el(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function txt(p,x,y,s,o){const t=el('text',Object.assign({x:x,y:y,'font-family':MONO,'font-size':11,fill:C.muted},o||{}),p);t.textContent=s;return t;}
function svgFor(box,w,h){const s=el('svg',{viewBox:'0 0 '+w+' '+h,preserveAspectRatio:'xMidYMid meet'});box.appendChild(s);return s;}

/* ============ 1. pre-market checklist ============ */
function drawChecklist(box){
  const W=720,H=350,s=svgFor(box,W,H);
  txt(s,W/2,30,'PRE-MARKET CHECKLIST  盘前检查清单',{'text-anchor':'middle','font-size':13,'font-weight':700,fill:C.goldB,'letter-spacing':'.22em'});
  txt(s,W/2,50,'10 minutes · no pass, no trade  十分钟 · 不过关不下单',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.14em','font-family':"'Noto Sans SC',sans-serif"});
  const items=[
    {en:'Market bias written on chart',zh:'方向已写在图上',tag:'BIAS',c:C.gold},
    {en:'Key levels marked',zh:'关键位已标注',tag:'LEVELS',c:C.gold},
    {en:'Economic calendar checked',zh:'财经日历已查',tag:'NEWS',c:C.cyan},
    {en:'Entry · Stop · Target on chart',zh:'进 · 止 · 目标已标图',tag:'PLAN',c:C.gold},
    {en:'Risk % confirmed',zh:'风险比例已确认',tag:'RISK',c:C.bull},
    {en:'Daily cap −1R armed',zh:'每日上限已启动',tag:'CAP',c:C.bear}
  ];
  items.forEach((it,i)=>{
    const y=74+i*38, g=el('g',{style:'--i:'+i},s);
    el('line',{x1:44,x2:W-150,y1:y,y2:y,stroke:'rgba(232,200,119,.07)'},s);
    el('rect',{x:56,y:y-11,width:20,height:20,rx:5,fill:'rgba(255,255,255,.02)',stroke:it.c,'stroke-opacity':.55,class:'rbar'},g);
    const tick=el('path',{d:'M62 '+(y-3)+' l5 5 l10 -12',stroke:it.c,'stroke-width':2.4,'fill':'none',
      'stroke-linecap':'round','stroke-linejoin':'round','stroke-dasharray':30,'stroke-dashoffset':30,class:'rline'},g);
    tick.style.transitionDelay=(.25+i*.08)+'s';
    txt(g,92,y+5,it.en,{'font-size':12.5,fill:C.text,'font-weight':600});
    txt(g,92,y+21,it.zh,{'font-size':10,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
    const tw=it.tag.length*7.5+18;
    el('rect',{x:W-142,y:y-11,width:tw,height:20,rx:10,fill:'rgba(232,200,119,.05)',stroke:'rgba(232,200,119,.22)',class:'rbar'},g);
    txt(g,W-142+tw/2,y+5,it.tag,{'text-anchor':'middle','font-size':9.5,fill:it.c,'letter-spacing':'.14em',class:'rlbl'});
  });
  const by=74+items.length*38+12;
  el('rect',{x:56,y:by,width:W-112,height:34,rx:9,fill:'rgba(44,217,138,.06)',stroke:'rgba(44,217,138,.35)',class:'rbar',style:'--i:7'},s);
  txt(s,W/2,by+22,'ALL PASSED → TRADE  全部通过 → 才能交易',{'text-anchor':'middle','font-size':11.5,'font-weight':700,fill:C.bull,'letter-spacing':'.18em','font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
}

/* ============ 2. session flow ============ */
function drawRoutine(box){
  const W=720,H=330,s=svgFor(box,W,H);
  txt(s,W/2,26,'THE TRADING DAY  交易的一天',{'text-anchor':'middle','font-size':13,'font-weight':700,fill:C.goldB,'letter-spacing':'.22em'});
  const phases=[
    {t:'PRE-MARKET',zh:'盘前',sub:'checklist ✓',c:C.bull},
    {t:'SESSION',zh:'时段',sub:'wait for setup 等形态',c:C.gold},
    {t:'EXECUTE',zh:'执行',sub:'as written 照计划',c:C.gold},
    {t:'MANAGE',zh:'管理',sub:'stop · target 止·标',c:C.gold},
    {t:'REVIEW',zh:'复盘',sub:'5 questions 五问',c:C.bull}
  ];
  const n=phases.length, bw=104, gap=(W-60-bw*n)/(n-1), y0=96, bh=64;
  const X=i=>30+bw*i+gap*i;
  phases.forEach((p,i)=>{
    const g=el('g',{style:'--i:'+i},s);
    el('rect',{x:X(i),y:y0,width:bw,height:bh,rx:12,fill:'rgba(255,255,255,.02)',
      stroke:p.c,'stroke-opacity':.5,class:'rbar'},g);
    txt(g,X(i)+bw/2,y0+26,p.t,{'text-anchor':'middle','font-size':11,'font-weight':700,fill:p.c,'letter-spacing':'.12em',class:'rlbl'});
    txt(g,X(i)+bw/2,y0+43,p.zh,{'text-anchor':'middle','font-size':10,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
    txt(g,X(i)+bw/2,y0+58,p.sub,{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
    if(i<n-1){
      const ax=X(i)+bw+gap/2;
      el('line',{x1:ax-9,x2:ax+9,y1:y0+bh/2,y2:y0+bh/2,stroke:C.gold,'stroke-opacity':.5,'stroke-width':1.6},g);
      el('path',{d:'M'+(ax+9)+' '+(y0+bh/2)+' l-6 -4 m6 4 l-6 4',stroke:C.gold,'stroke-opacity':.5,'stroke-width':1.6,'fill':'none'},g);
    }
  });
  /* danger zones above the flow */
  const d1=X(1)+bw+gap/2, d2=X(2)+bw+gap/2;
  [[d1,'FOMO ZONE','冲动追价',C.bear],[d2,'TILT ZONE','失控报复',C.bear]].forEach((d,i)=>{
    const g=el('g',{style:'--i:'+(i+5)},s);
    el('line',{x1:d[0],x2:d[0],y1:64,y2:y0-2,stroke:d[3],'stroke-opacity':.55,'stroke-width':1.4,'stroke-dasharray':'4 4',class:'rlbl'},g);
    el('path',{d:'M'+(d[0]-6)+' 64 l6 -7 l6 7 z',fill:d[3],'fill-opacity':.85,class:'rlbl'},g);
    txt(g,d[0],58,d[1],{'text-anchor':'middle','font-size':9,'font-weight':700,fill:d[3],'letter-spacing':'.1em',class:'rlbl'});
    txt(g,d[0],76,d[2],{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
  });
  /* revenge loop: red dashed arc back from REVIEW to EXECUTE */
  const loop=el('path',{d:'M'+(X(4)+bw/2)+' '+(y0+bh+14)+' C '+(X(4)+bw/2+70)+' '+(y0+bh+64)+' '+(X(3)+bw/2-60)+' '+(y0+bh+64)+' '+(X(3)+bw/2)+' '+(y0+bh+14),
    stroke:C.bear,'stroke-opacity':.6,'stroke-width':1.6,'fill':'none','stroke-dasharray':'6 5',class:'rline'},s);
  loop.style.transitionDelay='.7s';
  el('path',{d:'M'+(X(3)+bw/2)+' '+(y0+bh+14)+' l-7 -4 m7 4 l7 -4',stroke:C.bear,'stroke-opacity':.6,'stroke-width':1.6,'fill':'none',class:'rlbl',style:'--i:8'},s);
  txt(s,(X(3)+X(4))/2+bw/2,y0+bh+68,'REVENGE LOOP  报复回路 — break it with the cooldown rule  用冷却规则打断它',
    {'text-anchor':'middle','font-size':10,fill:C.bear,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:8'});
  /* green exit path down from REVIEW */
  const ex=el('path',{d:'M'+(X(4)+bw/2)+' '+(y0+bh)+' l0 30',stroke:C.bull,'stroke-opacity':.6,'stroke-width':1.6,'stroke-dasharray':'4 4',class:'rline'},s);
  ex.style.transitionDelay='.9s';
  txt(s,X(4)+bw/2+14,y0+bh+44,'journal → done  日志 → 收工',{'font-size':9.5,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:9'});
  txt(s,W/2,H-12,'06:00 checklist · session window · 15:00 review  06:00 清单 · 时段窗口 · 15:00 复盘',
    {'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.12em','font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 3. drawdown cycle ============ */
function drawDrawdown(box){
  const W=720,H=340,L=48,R=128,T=30,B=42;
  const s=svgFor(box,W,H);
  const plotW=W-L-R, plotH=H-T-B, mn=70, mx=122;
  const X=i=>L+plotW*(i/30);
  const Y=v=>T+(mx-v)/(mx-mn)*plotH;
  [70,80,90,100,110,120].forEach(v=>{
    el('line',{x1:L,x2:L+plotW,y1:Y(v),y2:Y(v),class:'rgrid'},s);
    txt(s,L-8,Y(v)+3.5,v,{'text-anchor':'end',class:'rax'});
  });
  for(let i=0;i<=30;i+=5) txt(s,X(i),T+plotH+18,i,{'text-anchor':'middle','font-size':10,fill:C.muted2});
  txt(s,L+plotW/2,H-8,'TRADE NUMBER  交易序号',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.18em'});
  /* zone bands */
  const z1=T+plotH-Y(100), z2=T+plotH-Y(94), z3=T+plotH-Y(84);
  const bands=[
    {y:Y(100),h:Y(70)-Y(100),c:'rgba(44,217,138,.05)',l:'NORMAL 正常'},
    {y:Y(94),h:Y(70)-Y(94),c:'rgba(232,200,119,.06)',l:'WARNING 警戒 −3R'},
    {y:Y(84),h:Y(70)-Y(84),c:'rgba(255,92,99,.07)',l:'COOLDOWN 冷却 −6R'}
  ];
  bands.forEach((b,i)=>{
    const g=el('g',{style:'--i:'+i},s);
    el('rect',{x:L,y:b.y,width:plotW,height:b.h,fill:b.c,class:'rbar'},g);
    txt(g,L+10,b.y+14,b.l,{'font-size':9,fill:C.muted2,'letter-spacing':'.1em','font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  });
  /* equity: no plan (red, keeps trading) */
  const noPlan=[100,102,104,103,105,107,109,111,112,110,108,106,104,101,99,96,93,90,87,84,81,78,75,72,70,70,70,70,70,70,70];
  const pts=noPlan.map((v,i)=>[X(i),Y(v)]);
  el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
    stroke:C.bear,'stroke-opacity':.8,'stroke-width':2,'stroke-dasharray':'7 5',class:'rline'},s);
  /* equity: with plan (gold, halves size at -3R, stops at -6R, recovers) */
  const plan=[100,102,104,103,105,107,109,111,112,110,108,106,104,101,99,96,93,90,88,86,88,91,95,100,106,112,117,121,124,126,128];
  const pts2=plan.map((v,i)=>[X(i),Y(v)]);
  el('path',{d:pts2.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
    stroke:C.gold,'stroke-width':2.4,class:'rline',style:'transition-delay:.5s'},s);
  /* markers */
  [[X(16),Y(94),'−3R · halve size 减半',C.gold,'--i:8'],[X(20),Y(86),'−6R · stop & review 停机',C.bear,'--i:9'],[X(30),Y(128),'+28R plan 计划 +28R',C.bull,'--i:10']].forEach(m=>{
    const g=el('g',{style:m[4]},s);
    el('circle',{cx:m[0],cy:m[1],r:5,fill:m[3],class:'rlbl'},g);
    txt(g,m[0],m[1]-11,m[2],{'text-anchor':'middle','font-size':10,'font-weight':700,fill:m[3],class:'rlbl','font-family':"'Noto Sans SC',sans-serif"});
  });
  txt(s,W-R+6,T+8,'RED  no plan  无计划',{'font-size':9.5,fill:C.bear,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,W-R+6,T+24,'GOLD  with plan  有计划',{'font-size':9.5,fill:C.gold,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L+plotW/2,H-26,'The streak is identical. Only the response differs.  连亏完全一样，不同的只是应对。',
    {'text-anchor':'middle','font-size':10,fill:C.goldB,'font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 4. habit formation ============ */
function drawHabit(box){
  const W=720,H=340,s=svgFor(box,W,H);
  txt(s,W/2,26,'EFFORT REQUIRED  所需意志力',{'text-anchor':'middle','font-size':12,'font-weight':700,fill:C.goldB,'letter-spacing':'.2em'});
  /* effort curve */
  const L=46,R=30,T=40,B=120,plotW=W-L-R,plotH=86;
  const X=i=>L+plotW*(i/30);
  const eff=d=>95*Math.exp(-d/6)+12;
  const Y=v=>T+plotH-(v-10)/(110-10)*plotH;
  el('line',{x1:L,x2:L+plotW,y1:Y(107),y2:Y(107),stroke:'rgba(232,200,119,.08)','stroke-dasharray':'3 5'},s);
  const pts=[];for(let i=0;i<=30;i++)pts.push([X(i),Y(eff(i))]);
  el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
    stroke:C.cyan,'stroke-width':2.2,class:'rline'},s);
  [[7,'day 07 · first win 初见成效',C.gold],[21,'day 21 · routine 已成日常',C.cyan],[30,'day 30 · automatic 自动执行',C.bull]].forEach((m,i)=>{
    const g=el('g',{style:'--i:'+(i+3)},s);
    el('circle',{cx:X(m[0]),cy:Y(eff(m[0])),r:5,fill:m[2],class:'rlbl'},g);
    txt(g,X(m[0]),Y(eff(m[0]))-11,m[1],{'text-anchor':'middle','font-size':9.5,fill:m[2],class:'rlbl','font-family':"'Noto Sans SC',sans-serif"});
  });
  txt(s,L, T+plotH+16,'day 1',{'font-size':9,fill:C.muted2});
  txt(s,L+plotW, T+plotH+16,'day 30',{'text-anchor':'end','font-size':9,fill:C.muted2});
  /* 30-day grid */
  const gy=200, gr=11, gx0=72, gapX=64, gapY=40, cols=10;
  for(let d=0;d<30;d++){
    const c=d%cols, r=Math.floor(d/cols);
    const col=d<7?'#FF9A4D':(d<22?C.gold:C.bull);
    const g=el('g',{style:'--i:'+d},s);
    el('circle',{cx:gx0+c*gapX,cy:gy+r*gapY,r:gr,fill:col,'fill-opacity':.16,
      stroke:col,'stroke-opacity':.7,'stroke-width':1.4,class:'rbar'},g);
    txt(g,gx0+c*gapX,gy+r*gapY+3.5,d+1,{'text-anchor':'middle','font-size':7.5,fill:col,class:'rlbl'});
  }
  [[1,'START 开始'],[7,'',''],[21,'',''],[30,'KEEP 保持']].forEach(m=>{
    const c=(m[0]-1)%cols, r=Math.floor((m[0]-1)/cols);
    if(m[1]){
      txt(s,gx0+c*gapX,gy+r*gapY+gr+18,m[1],{'text-anchor':'middle','font-size':9,fill:C.goldB,'font-family':"'Noto Sans SC',sans-serif"});
      el('circle',{cx:gx0+c*gapX,cy:gy+r*gapY,r:gr+5,fill:'none',stroke:C.goldB,'stroke-opacity':.5,'stroke-dasharray':'3 3',class:'rlbl',style:'--i:31'},s);
    }
  });
  const ly=gy+2*gapY+gr+34;
  [[0,'WEEK 1 · effort 第 1 周 · 靠意志',C.gold],[1,'WEEK 2-3 · routine 第 2-3 周 · 成日常',C.gold],[2,'WEEK 4 · automatic 第 4 周 · 自动化',C.bull]].forEach((m,i)=>{
    el('circle',{cx:66+i*210,cy:ly-3,r:5,fill:m[2],'fill-opacity':.5,stroke:m[2],'stroke-opacity':.8},s);
    txt(s,78+i*210,ly,m[1],{'font-size':9.5,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
  });
}

const RENDER={checklist:drawChecklist,routine:drawRoutine,drawdown:drawDrawdown,habit:drawHabit};
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

