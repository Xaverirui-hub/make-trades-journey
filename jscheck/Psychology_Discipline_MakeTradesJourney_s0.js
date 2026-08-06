
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

/* ============ 1. prospect-theory value function ============ */
function drawLossAversion(box){
  const W=720,H=360,cx=W/2,cy=H/2-6,pw=250,ph=132;
  const s=svgFor(box,W,H);
  /* Kahneman & Tversky: v(x)=x^0.88 for gains, -2.25*(-x)^0.88 for losses */
  const A=0.88, LAM=2.25, MAXX=100;
  const vmax=Math.pow(MAXX,A), vmin=-LAM*Math.pow(MAXX,A);
  const X=x=>cx+x/MAXX*pw;
  const Y=v=>cy-v/(-vmin)*ph;
  const V=x=>x>=0?Math.pow(x,A):-LAM*Math.pow(-x,A);
  /* axes */
  el('line',{x1:cx-pw-14,x2:cx+pw+14,y1:cy,y2:cy,stroke:'rgba(232,200,119,.28)'},s);
  el('line',{x1:cx,x2:cx,y1:cy-ph-20,y2:cy+ph+26,stroke:'rgba(232,200,119,.28)'},s);
  txt(s,cx+pw+20,cy+4,'GAIN 获利',{'font-size':10,fill:C.bull,'font-family':SC});
  txt(s,cx-pw-20,cy+4,'LOSS 亏损',{'text-anchor':'end','font-size':10,fill:C.bear,'font-family':SC});
  txt(s,cx+8,cy-ph-26,'VALUE / how it feels  感受强度',{'font-size':9.5,fill:C.muted2,'font-family':SC});
  /* curve */
  let d='';
  for(let x=-MAXX;x<=MAXX;x+=2){ d+=(d?'L':'M')+X(x).toFixed(1)+','+Y(V(x)).toFixed(1); }
  el('path',{d:d,fill:'none',stroke:C.gold,'stroke-width':2.6,class:'rline'},s);
  /* reference: +100 vs -100 */
  const gy=Y(V(100)), ly=Y(V(-100));
  [[100,gy,C.bull,'+$100','feels like +1.0'],[-100,ly,C.bear,'−$100','feels like −2.25']].forEach((r,i)=>{
    const g=el('g',{style:'--i:'+(i+2),class:'rlbl'},s);
    el('line',{x1:X(r[0]),x2:cx,y1:r[1],y2:r[1],stroke:r[2],'stroke-width':1,'stroke-dasharray':'4 4','stroke-opacity':.7},g);
    el('circle',{cx:X(r[0]),cy:r[1],r:4.5,fill:r[2]},g);
    txt(g,X(r[0])+(r[0]>0?12:-12),r[1]+(r[0]>0?-6:16),r[3],
      {'text-anchor':r[0]>0?'start':'end','font-size':12.5,fill:r[2],'font-weight':700});
    txt(g,X(r[0])+(r[0]>0?12:-12),r[1]+(r[0]>0?9:31),r[4],
      {'text-anchor':r[0]>0?'start':'end','font-size':10,fill:C.muted2});
  });
  /* the asymmetry bracket */
  const bx=cx-26;
  const g2=el('g',{style:'--i:5',class:'rlbl'},s);
  el('path',{d:'M'+bx+','+gy+' L'+(bx-10)+','+gy+' L'+(bx-10)+','+ly+' L'+bx+','+ly,
    fill:'none',stroke:C.goldB,'stroke-width':1.2,'stroke-opacity':.7},g2);
  txt(g2,bx-16,(gy+ly)/2+4,'2.25×',{'text-anchor':'end','font-size':15,fill:C.goldB,'font-weight':700});
  txt(s,W/2,H-10,'Same amount of money. Losses are felt about twice as strongly.　同样的金额，亏损的感受强度大约是两倍。',
    {'text-anchor':'middle','font-size':10.5,fill:C.muted,'font-family':SC});
}

/* ============ 2. disposition effect ============ */
function drawDisposition(box){
  const W=720,H=300,L=136,R=112,T=54,B=64;
  const s=svgFor(box,W,H);
  const pw=W-L-R, maxMin=270;
  const X=m=>L+m/maxMin*pw;
  const rows=[
    {t:'WINNER 获利单',zh:'"lock it in" 先落袋为安',min:25,r:'+0.6R',c:C.bull,note:'closed early — plan said 1:2'},
    {t:'LOSER 亏损单',zh:'"it will come back" 等它回来',min:240,r:'−3.2R',c:C.bear,note:'stop widened twice'}
  ];
  txt(s,L,T-24,'HOW LONG THE POSITION WAS HELD  持仓时间',{'font-size':9.5,fill:C.muted2,'letter-spacing':'.18em','font-family':SC});
  [0,60,120,180,240].forEach(m=>{
    el('line',{x1:X(m),x2:X(m),y1:T-8,y2:T+128,stroke:'rgba(232,200,119,.07)','stroke-dasharray':'3 5'},s);
    txt(s,X(m),T+150,m+'m',{'text-anchor':'middle','font-size':9.5,fill:C.muted2});
  });
  rows.forEach((r,i)=>{
    const y=T+i*66, bh=32;
    const g=el('g',{style:'--i:'+i},s);
    txt(g,L-16,y+bh/2-2,r.t,{'text-anchor':'end','font-size':11.5,fill:r.c,'font-weight':700});
    txt(g,L-16,y+bh/2+13,r.zh,{'text-anchor':'end','font-size':9.5,fill:C.muted2,'font-family':SC});
    const bar=el('rect',{x:L,y:y,width:X(r.min)-L,height:bh,rx:6,fill:r.c,'fill-opacity':.3,
      stroke:r.c,'stroke-opacity':.6},g);
    bar.setAttribute('class','rbar');
    bar.style.transformOrigin='left'; bar.style.transform='scaleX(0)';
    txt(g,X(r.min)+14,y+bh/2-1,r.r,{'font-size':15,fill:r.c,'font-weight':700,class:'rlbl'});
    txt(g,X(r.min)+14,y+bh/2+14,r.min+' min',{'font-size':9.5,fill:C.muted2,class:'rlbl'});
    /* note sits under the bar — a short bar has no room for it inside */
    txt(g,L+2,y+bh+13,r.note,{'font-size':9.5,fill:'rgba(255,255,255,.45)',class:'rlbl'});
  });
  txt(s,W/2,H-14,'Winners cut short, losers held long — the exact inverse of what 1:2 requires.',
    {'text-anchor':'middle','font-size':10.5,fill:C.goldB});
  txt(s,W/2,H-1,'赢单抱不住，亏单放不掉 —— 跟 1:2 系统的要求刚好相反。',
    {'text-anchor':'middle','font-size':10,fill:C.muted,'font-family':SC});
}

/* ============ 3. revenge spiral ============ */
function drawSpiral(box){
  const W=720,H=400,cx=W/2,cy=H/2+4,R=126;
  const s=svgFor(box,W,H);
  const steps=[
    {t:'A normal loss',zh:'一笔正常的亏损',c:C.muted},
    {t:'"I want it back — now"',zh:'想马上把它赚回来',c:C.amber},
    {t:'Size goes up',zh:'仓位放大',c:C.amber},
    {t:'Setup check skipped',zh:'跳过 setup 检查',c:C.bear},
    {t:'A bigger loss',zh:'更大的亏损',c:C.bear}
  ];
  const n=steps.length;
  /* connecting ring */
  el('circle',{cx:cx,cy:cy,r:R,fill:'none',stroke:'rgba(255,92,99,.18)','stroke-width':1.4,
    'stroke-dasharray':'6 6'},s);
  steps.forEach((st,i)=>{
    const a=-Math.PI/2+i*2*Math.PI/n;
    const x=cx+Math.cos(a)*R, y=cy+Math.sin(a)*R;
    const g=el('g',{style:'--i:'+i},s);
    el('circle',{cx:x,cy:y,r:30,fill:'#0a0a0e',stroke:st.c,'stroke-opacity':.6,'stroke-width':1.6,class:'rbar'},g);
    txt(g,x,y+5,String(i+1),{'text-anchor':'middle','font-size':17,fill:st.c,'font-weight':700,class:'rlbl'});
    /* label placed outward */
    const lx=cx+Math.cos(a)*(R+52), ly=cy+Math.sin(a)*(R+52);
    const anchor=Math.abs(Math.cos(a))<0.28?'middle':(Math.cos(a)>0?'start':'end');
    txt(g,lx,ly-3,st.t,{'text-anchor':anchor,'font-size':11.5,fill:st.c,'font-weight':700,class:'rlbl'});
    txt(g,lx,ly+13,st.zh,{'text-anchor':anchor,'font-size':10.5,fill:C.muted2,'font-family':SC,class:'rlbl'});
    /* arrow to next node along the ring */
    const a2=-Math.PI/2+(i+1)*2*Math.PI/n;
    const pad=0.30;
    const s1=a+pad, s2=a2-pad;
    const p1=[cx+Math.cos(s1)*R, cy+Math.sin(s1)*R];
    const p2=[cx+Math.cos(s2)*R, cy+Math.sin(s2)*R];
    el('path',{d:'M'+p1[0].toFixed(1)+','+p1[1].toFixed(1)+' A'+R+','+R+' 0 0 1 '+p2[0].toFixed(1)+','+p2[1].toFixed(1),
      fill:'none',stroke:'rgba(255,92,99,.5)','stroke-width':1.6,class:'rlbl'},g);
    const tang=[-Math.sin(s2),Math.cos(s2)], ah=7;
    const ang=Math.atan2(tang[1],tang[0]);
    el('path',{d:'M'+p2[0].toFixed(1)+','+p2[1].toFixed(1)
      +' L'+(p2[0]-ah*Math.cos(ang-0.5)).toFixed(1)+','+(p2[1]-ah*Math.sin(ang-0.5)).toFixed(1)
      +' M'+p2[0].toFixed(1)+','+p2[1].toFixed(1)
      +' L'+(p2[0]-ah*Math.cos(ang+0.5)).toFixed(1)+','+(p2[1]-ah*Math.sin(ang+0.5)).toFixed(1),
      fill:'none',stroke:C.bear,'stroke-width':1.8,'stroke-linecap':'round',class:'rlbl'},g);
  });
  /* centre */
  const cg=el('g',{style:'--i:6',class:'rlbl'},s);
  txt(cg,cx,cy-8,'EACH LAP',{'text-anchor':'middle','font-size':10,fill:C.muted2,'letter-spacing':'.2em'});
  txt(cg,cx,cy+12,'bigger size,',{'text-anchor':'middle','font-size':12,fill:C.bear});
  txt(cg,cx,cy+28,'worse judgement',{'text-anchor':'middle','font-size':12,fill:C.bear});
  txt(cg,cx,cy+46,'每转一圈：仓位更大，判断更差',{'text-anchor':'middle','font-size':10,fill:C.muted2,'font-family':SC});
  txt(s,W/2,H-8,'The daily stop exists to break this loop at step 2.　每日停损的作用，就是在第 2 步打断这个循环。',
    {'text-anchor':'middle','font-size':10.5,fill:C.goldB,'font-family':SC});
}

/* ============ 4. expectancy by emotion ============ */
function drawEmotionR(box){
  const W=720,H=320,L=64,R=40,T=46,B=66;
  const s=svgFor(box,W,H);
  const data=[
    {e:'1',lab:'Fearful',zh:'恐惧',v:-0.15},
    {e:'2',lab:'Hesitant',zh:'犹豫',v:0.05},
    {e:'3',lab:'Neutral',zh:'平静',v:0.42},
    {e:'4',lab:'Eager',zh:'急躁',v:-0.22},
    {e:'5',lab:'Euphoric / Revenge',zh:'上头',v:-0.68}
  ];
  const pw=W-L-R, ph=H-T-B, mn=-0.8, mx=0.6;
  const X=i=>L+pw/data.length*(i+0.5), Y=v=>T+ph-(v-mn)/(mx-mn)*ph;
  [-0.8,-0.4,0,0.4].forEach(v=>{
    el('line',{x1:L,x2:L+pw,y1:Y(v),y2:Y(v),stroke:v===0?'rgba(232,200,119,.3)':'rgba(232,200,119,.07)',
      'stroke-dasharray':v===0?'none':'3 5'},s);
    txt(s,L-10,Y(v)+3.5,(v>0?'+':'')+v.toFixed(1)+'R',{'text-anchor':'end','font-size':9.5,fill:C.muted2});
  });
  const bw=pw/data.length*0.48;
  data.forEach((d,i)=>{
    const g=el('g',{style:'--i:'+i},s);
    const col=d.v>=0.3?C.bull:(d.v>=0?C.gold:(d.v>-0.4?C.amber:C.bear));
    const y0=Y(0), y1=Y(d.v);
    const bar=el('rect',{x:X(i)-bw/2,y:Math.min(y0,y1),width:bw,height:Math.abs(y1-y0),rx:4,
      fill:col,'fill-opacity':.42,stroke:col,'stroke-opacity':.6},g);
    bar.setAttribute('class','rbar');
    bar.style.transformOrigin=(d.v>=0?'bottom':'top');
    txt(g,X(i),d.v>=0?y1-10:y1+17,(d.v>0?'+':'')+d.v.toFixed(2)+'R',
      {'text-anchor':'middle','font-size':12.5,fill:col,'font-weight':700,class:'rlbl'});
    txt(g,X(i),T+ph+22,d.e+' · '+d.lab,{'text-anchor':'middle','font-size':10.5,fill:C.text});
    txt(g,X(i),T+ph+37,d.zh,{'text-anchor':'middle','font-size':10,fill:C.muted2,'font-family':SC});
  });
  txt(s,L,T-20,'EXPECTANCY BY EMOTION LOGGED AT ENTRY  依进场时的情绪分组',
    {'font-size':9.5,fill:C.muted2,'letter-spacing':'.16em','font-family':SC});
  txt(s,W/2,H-12,'Both ends of the scale lose money. Calm is not a mood — it is a filter.',
    {'text-anchor':'middle','font-size':10.5,fill:C.goldB});
  txt(s,W/2,H-1,'量表的两端都在亏钱。平静不是一种心情，它是一道过滤器。',
    {'text-anchor':'middle','font-size':10,fill:C.muted,'font-family':SC});
}

const RENDER={lossaversion:drawLossAversion,disposition:drawDisposition,spiral:drawSpiral,emotionR:drawEmotionR};
document.querySelectorAll('.rchart[data-r]').forEach(b=>{const f=RENDER[b.dataset.r];if(f)f(b);});

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

