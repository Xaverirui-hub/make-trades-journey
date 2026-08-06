
document.getElementById('yr').textContent=new Date().getFullYear();
const RM=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const NS='http://www.w3.org/2000/svg';
const C={bull:'#2CD98A',bear:'#FF5C63',gold:'#E8C877',goldB:'#FCE9A8',goldD:'#C9A227',
         muted:'#9A968C',muted2:'#6f6c64',cyan:'#2FE0D6',text:'#EDEBE2',amber:'#FF9A4D'};
const MONO="'JetBrains Mono',monospace";
const SC="'Noto Sans SC',sans-serif";

function el(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function txt(p,x,y,s,o){const t=el('text',Object.assign({x:x,y:y,'font-family':MONO,'font-size':11,fill:C.muted},o||{}),p);t.textContent=s;return t;}
function svgFor(box,w,h){const s=el('svg',{viewBox:'0 0 '+w+' '+h,preserveAspectRatio:'xMidYMid meet'});box.appendChild(s);return s;}

/* ============ 1. blind vs journalled ============ */
function drawBlind(box){
  const W=720,H=310,s=svgFor(box,W,H);
  const series=[0,1.8,1.0,2.6,1.9,3.4,2.7,4.2,3.6,5.1,4.4,6.0];
  const cw=(W-46)/2;
  const panels=[
    {x:16,title:'WITHOUT A JOURNAL',zh:'没有日志',col:C.muted2,ann:false},
    {x:16+cw+14,title:'WITH A JOURNAL',zh:'有日志',col:C.gold,ann:true}
  ];
  panels.forEach((p,pi)=>{
    const g=el('g',{style:'--i:'+pi},s);
    el('rect',{x:p.x,y:16,width:cw-14,height:H-46,rx:16,fill:'rgba(255,255,255,.016)',
      stroke:p.ann?'rgba(232,200,119,.22)':'rgba(232,200,119,.1)',class:'rbar'},g);
    txt(g,p.x+20,42,p.title,{'font-size':10,fill:p.col,'letter-spacing':'.2em'});
    txt(g,p.x+20,58,p.zh,{'font-size':11,fill:C.muted2,'font-family':SC});
    const L=p.x+30,R2=p.x+cw-34,T=78,B2=H-60,pw=R2-L,ph=B2-T;
    const mx=6.4;
    const X=i=>L+pw*(i/(series.length-1)), Y=v=>B2-v/mx*ph;
    el('line',{x1:L,x2:R2,y1:B2,y2:B2,stroke:'rgba(232,200,119,.14)'},g);
    const d=series.map((v,i)=>(i?'L':'M')+X(i).toFixed(1)+','+Y(v).toFixed(1)).join(' ');
    if(p.ann){
      el('path',{d:d+' L'+X(series.length-1).toFixed(1)+','+B2+' L'+L+','+B2+' Z',
        fill:C.bull,'fill-opacity':.07},g);
      el('path',{d:d,fill:'none',stroke:C.bull,'stroke-width':2,class:'rline'},g);
      /* annotations only on the journalled side */
      [[1,'GP',C.bull],[4,'BO',C.bear],[7,'GP',C.bull],[10,'NEWS',C.bear]].forEach((a,ai)=>{
        const gg=el('g',{style:'--i:'+(ai+3),class:'rlbl'},g);
        el('circle',{cx:X(a[0]),cy:Y(series[a[0]]),r:3.4,fill:a[2]},gg);
        txt(gg,X(a[0]),Y(series[a[0]])-10,a[1],{'text-anchor':'middle','font-size':8.5,fill:a[2]});
      });
      txt(g,p.x+20,H-38,'setup · session · rules · emotion',{'font-size':9.5,fill:C.gold});
      txt(g,p.x+20,H-24,'知道为什么赚、哪里在漏',{'font-size':10,fill:C.muted,'font-family':SC});
    }else{
      el('path',{d:d,fill:'none',stroke:'rgba(154,150,140,.22)','stroke-width':2,'stroke-dasharray':'4 5'},g);
      txt(g,(L+R2)/2,(T+B2)/2+4,'?',{'text-anchor':'middle','font-size':46,fill:'rgba(154,150,140,.3)','font-weight':700});
      txt(g,p.x+20,H-38,'balance only',{'font-size':9.5,fill:C.muted2});
      txt(g,p.x+20,H-24,'只知道余额，不知道原因',{'font-size':10,fill:C.muted2,'font-family':SC});
    }
    const fin=el('g',{style:'--i:'+(pi+5),class:'rlbl'},g);
    txt(fin,R2,T-6,'+$3,240',{'text-anchor':'end','font-size':14,fill:p.ann?C.bull:C.muted,'font-weight':700});
  });
}

/* ============ 2. four quadrants ============ */
function drawQuadrant(box){
  const W=720,H=380,s=svgFor(box,W,H);
  const L=112,T=46,pw=W-L-40,ph=H-T-62, hw=pw/2, hh=ph/2;
  const cells=[
    {c:0,r:0,t:'BROKE + LOSS',zh:'破规则 · 输',d:'活该，但诚实',col:C.muted2,bg:'rgba(154,150,140,.05)'},
    {c:1,r:0,t:'BROKE + WIN',zh:'破规则 · 赢',d:'最危险',col:C.bear,bg:'rgba(255,92,99,.1)'},
    {c:0,r:1,t:'KEPT + LOSS',zh:'守规则 · 输',d:'好的亏损',col:C.gold,bg:'rgba(232,200,119,.07)'},
    {c:1,r:1,t:'KEPT + WIN',zh:'守规则 · 赢',d:'正循环',col:C.bull,bg:'rgba(44,217,138,.09)'}
  ];
  cells.forEach((q,i)=>{
    const x=L+q.c*hw, y=T+(1-q.r)*hh;
    const g=el('g',{style:'--i:'+i},s);
    el('rect',{x:x+4,y:y+4,width:hw-8,height:hh-8,rx:12,fill:q.bg,
      stroke:q.col,'stroke-opacity':q.col===C.bear?.5:.28,'stroke-width':q.col===C.bear?1.6:1,class:'rbar'},g);
    txt(g,x+hw/2,y+hh/2-16,q.t,{'text-anchor':'middle','font-size':12,fill:q.col,'font-weight':700,'letter-spacing':'.12em',class:'rlbl'});
    txt(g,x+hw/2,y+hh/2+6,q.zh,{'text-anchor':'middle','font-size':13,fill:C.text,'font-family':SC,class:'rlbl'});
    txt(g,x+hw/2,y+hh/2+26,q.d,{'text-anchor':'middle','font-size':11,fill:q.col,'font-family':SC,class:'rlbl'});
  });
  /* axes */
  el('line',{x1:L,x2:L,y1:T,y2:T+ph,stroke:'rgba(232,200,119,.22)'},s);
  el('line',{x1:L,x2:L+pw,y1:T+ph,y2:T+ph,stroke:'rgba(232,200,119,.22)'},s);
  /* cells put KEPT on the top row (r=1) — labels must match that order */
  txt(s,L-14,T+hh/2+4,'KEPT',{'text-anchor':'end','font-size':10.5,fill:C.bull,'letter-spacing':'.14em'});
  txt(s,L-14,T+hh/2+20,'守规则',{'text-anchor':'end','font-size':10,fill:C.muted2,'font-family':SC});
  txt(s,L-14,T+hh+hh/2+4,'BROKE',{'text-anchor':'end','font-size':10.5,fill:C.bear,'letter-spacing':'.14em'});
  txt(s,L-14,T+hh+hh/2+20,'破规则',{'text-anchor':'end','font-size':10,fill:C.muted2,'font-family':SC});
  txt(s,L+hw/2,T+ph+22,'LOSS  亏损',{'text-anchor':'middle','font-size':10.5,fill:C.muted,'font-family':SC});
  txt(s,L+hw+hw/2,T+ph+22,'WIN  获利',{'text-anchor':'middle','font-size':10.5,fill:C.muted,'font-family':SC});
  txt(s,L-96,T-14,'PROCESS 过程',{'font-size':9.5,fill:C.muted2,'letter-spacing':'.16em','font-family':SC});
  txt(s,L+pw,T+ph+44,'OUTCOME 结果',{'text-anchor':'end','font-size':9.5,fill:C.muted2,'letter-spacing':'.16em','font-family':SC});
  txt(s,W/2,H-8,'You control the vertical axis. You do not control the horizontal one.  你能控制纵轴，控制不了横轴。',
    {'text-anchor':'middle','font-size':10.5,fill:C.goldB,'font-family':SC});
}

/* ============ 3. expectancy by setup ============ */
function drawSetupBars(box){
  const W=720,H=330,L=150,R=64,T=34,B=46;
  const s=svgFor(box,W,H);
  const data=[{n:'Golden Pocket 黄金口袋',v:0.62,c:26},{n:'Breakout 突破',v:0.18,c:31},
              {n:'Range Fade 区间反转',v:-0.09,c:19},{n:'News Spike 数据行情',v:-0.48,c:14}];
  const pw=W-L-R, ph=H-T-B, mn=-0.7, mx=0.8;
  const X=v=>L+(v-mn)/(mx-mn)*pw, rh=ph/data.length;
  [-0.5,0,0.5].forEach(v=>{
    el('line',{x1:X(v),x2:X(v),y1:T,y2:T+ph,stroke:v===0?'rgba(232,200,119,.3)':'rgba(232,200,119,.07)',
      'stroke-dasharray':v===0?'none':'3 5'},s);
    txt(s,X(v),T+ph+18,(v>0?'+':'')+v.toFixed(1)+'R',{'text-anchor':'middle','font-size':9.5,fill:C.muted2});
  });
  data.forEach((d,i)=>{
    const y=T+rh*i+rh*0.24, bh=rh*0.48;
    const g=el('g',{style:'--i:'+i},s);
    txt(g,L-14,y+bh/2+4,d.n,{'text-anchor':'end','font-size':11,fill:C.text,'font-family':SC});
    const col=d.v>=0?C.bull:C.bear;
    const x0=X(0), x1=X(d.v);
    const bar=el('rect',{x:Math.min(x0,x1),y:y,width:Math.abs(x1-x0),height:bh,rx:4,
      fill:col,'fill-opacity':.42,stroke:col,'stroke-opacity':.6},g);
    bar.setAttribute('class','rbar');
    bar.style.transformOrigin=(d.v>=0?'left':'right'); bar.style.transform='scaleX(0)';
    txt(g,d.v>=0?x1+10:x1-10,y+bh/2+4,(d.v>0?'+':'')+d.v.toFixed(2)+'R',
      {'text-anchor':d.v>=0?'start':'end','font-size':12.5,fill:col,'font-weight':700,class:'rlbl'});
    txt(g,L-14,y+bh/2+18,d.c+' trades',{'text-anchor':'end','font-size':9,fill:C.muted2});
  });
  txt(s,L,T-14,'EXPECTANCY PER TRADE  每笔期望值',{'font-size':9.5,fill:C.muted2,'letter-spacing':'.18em','font-family':SC});
  const overall=(0.62*26+0.18*31+(-0.09)*19+(-0.48)*14)/(26+31+19+14);
  el('line',{x1:X(overall),x2:X(overall),y1:T-4,y2:T+ph+4,stroke:C.gold,'stroke-width':1.4,'stroke-dasharray':'5 4',class:'rlbl'},s);
  txt(s,X(overall),H-10,'overall '+(overall>0?'+':'')+overall.toFixed(2)+'R  整体平均',
    {'text-anchor':'middle','font-size':10,fill:C.gold,'font-family':SC});
}

/* ============ 4. sample size trap ============ */
function drawSample(box){
  const W=720,H=320,L=76,R=100,T=40,B=52;
  const s=svgFor(box,W,H);
  /* 95% CI for p=0.5 : ±1.96*sqrt(0.25/n) */
  const ns=[20,50,100,200];
  const data=ns.map(n=>{const e=1.96*Math.sqrt(0.25/n)*100;return {n:n,lo:50-e,hi:50+e,e:e};});
  const pw=W-L-R, ph=H-T-B, mn=20, mx=80;
  const X=v=>L+(v-mn)/(mx-mn)*pw, rh=ph/data.length;
  [20,35,50,65,80].forEach(v=>{
    el('line',{x1:X(v),x2:X(v),y1:T-6,y2:T+ph,stroke:v===50?'rgba(232,200,119,.4)':'rgba(232,200,119,.07)',
      'stroke-width':v===50?1.4:1,'stroke-dasharray':v===50?'none':'3 5'},s);
    txt(s,X(v),T+ph+20,v+'%',{'text-anchor':'middle','font-size':9.5,fill:v===50?C.gold:C.muted2});
  });
  txt(s,X(50),T-16,'TRUE WIN RATE 50%  真实胜率',{'text-anchor':'middle','font-size':9.5,fill:C.gold,'letter-spacing':'.1em','font-family':SC});
  data.forEach((d,i)=>{
    const y=T+rh*i+rh/2, g=el('g',{style:'--i:'+i},s);
    txt(g,L-16,y+4,d.n+' trades',{'text-anchor':'end','font-size':11.5,fill:C.text});
    txt(g,L-16,y+18,d.n+' 笔',{'text-anchor':'end','font-size':9.5,fill:C.muted2,'font-family':SC});
    const col=d.e>15?C.bear:(d.e>8?C.amber:C.bull);
    const bar=el('rect',{x:X(d.lo),y:y-11,width:X(d.hi)-X(d.lo),height:22,rx:11,
      fill:col,'fill-opacity':.2,stroke:col,'stroke-opacity':.55},g);
    bar.setAttribute('class','rbar');
    bar.style.transformOrigin='center'; bar.style.transform='scaleX(0)';
    el('line',{x1:X(d.lo),x2:X(d.lo),y1:y-11,y2:y+11,stroke:col,'stroke-width':1.6,class:'rlbl'},g);
    el('line',{x1:X(d.hi),x2:X(d.hi),y1:y-11,y2:y+11,stroke:col,'stroke-width':1.6,class:'rlbl'},g);
    txt(g,X(d.hi)+14,y+4,d.lo.toFixed(0)+'% – '+d.hi.toFixed(0)+'%',{'font-size':11,fill:col,'font-weight':700,class:'rlbl'});
  });
  txt(s,W/2,H-10,'Range you could observe by chance alone (95%)　单纯因为运气，你可能观察到的胜率范围',
    {'text-anchor':'middle','font-size':10,fill:C.muted,'font-family':SC});
}

const RENDER={blind:drawBlind,quadrant:drawQuadrant,setupbars:drawSetupBars,sample:drawSample};
document.querySelectorAll('.rchart[data-r]').forEach(b=>{const f=RENDER[b.dataset.r];if(f)f(b);});

/* scaleX bars need their own end-state */
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

