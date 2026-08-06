
document.getElementById('yr').textContent=new Date().getFullYear();
const RM=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const NS='http://www.w3.org/2000/svg';
const C={bull:'#2CD98A',bear:'#FF5C63',gold:'#E8C877',goldB:'#FCE9A8',goldD:'#C9A227',
         muted:'#9A968C',muted2:'#6f6c64',cyan:'#2FE0D6',text:'#EDEBE2'};
const MONO="'JetBrains Mono',monospace";

function el(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function txt(p,x,y,s,o){const t=el('text',Object.assign({x:x,y:y,'font-family':MONO,'font-size':11,fill:C.muted},o||{}),p);t.textContent=s;return t;}
function svgFor(box,w,h){const s=el('svg',{viewBox:'0 0 '+w+' '+h,preserveAspectRatio:'xMidYMid meet'});box.appendChild(s);return s;}

/* ============ 1. recovery curve ============ */
function drawRecovery(box){
  const W=720,H=340,L=54,R=150,T=26,B=44;
  const s=svgFor(box,W,H);
  const data=[10,20,30,40,50,60,70].map(l=>({l:l,g:l/(100-l)*100}));
  const maxG=240, plotW=W-L-R, plotH=H-T-B;
  const X=i=>L+plotW/data.length*(i+0.5);
  const Y=v=>T+plotH-Math.min(v,maxG)/maxG*plotH;
  [0,60,120,180,240].forEach(g=>{
    el('line',{x1:L,x2:L+plotW,y1:Y(g),y2:Y(g),class:'rgrid'},s);
    txt(s,L-8,Y(g)+3.5,g+'%',{'text-anchor':'end',class:'rax'});
  });
  const bw=plotW/data.length*0.56;
  data.forEach((d,i)=>{
    const g=el('g',{style:'--i:'+i},s);
    const y=Y(d.g),hgt=T+plotH-y;
    const grad='rg'+i;
    const lg=el('linearGradient',{id:grad,x1:0,y1:0,x2:0,y2:1},s);
    el('stop',{offset:'0%','stop-color':C.bear,'stop-opacity':.85},lg);
    el('stop',{offset:'100%','stop-color':C.bear,'stop-opacity':.18},lg);
    el('rect',{x:X(i)-bw/2,y:y,width:bw,height:hgt,rx:3,fill:'url(#'+grad+')',
      stroke:'rgba(255,92,99,.45)','stroke-width':1,class:'rbar'},g);
    txt(g,X(i),y-9,'+'+d.g.toFixed(d.g<100?1:0)+'%',{'text-anchor':'middle',fill:C.goldB,'font-size':11,'font-weight':700,class:'rlbl'});
    txt(g,X(i),T+plotH+18,'−'+d.l+'%',{'text-anchor':'middle',fill:C.muted,'font-size':10.5});
  });
  const pts=data.map((d,i)=>[X(i),Y(d.g)]);
  el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
    stroke:C.gold,'stroke-opacity':.55,class:'rline'},s);
  txt(s,L+plotW/2,H-8,'LOSS TAKEN  亏损幅度',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.18em'});
  /* callout */
  const cx=W-R+16;
  el('rect',{x:cx,y:T+30,width:126,height:116,rx:12,fill:'rgba(255,92,99,.07)',stroke:'rgba(255,92,99,.35)'},s);
  txt(s,cx+63,T+54,'BEYOND THE CHART',{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'letter-spacing':'.16em'});
  txt(s,cx+63,T+84,'−90%',{'text-anchor':'middle','font-size':22,fill:C.bear,'font-weight':700});
  txt(s,cx+63,T+109,'needs +900%',{'text-anchor':'middle','font-size':11,fill:C.goldB});
  txt(s,cx+63,T+130,'要赚 900% 才回本',{'text-anchor':'middle','font-size':9.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 2. losing streak equity ============ */
function drawStreak(box){
  const W=720,H=340,L=52,R=118,T=24,B=42;
  const s=svgFor(box,W,H);
  const risks=[{r:1,c:C.bull},{r:3,c:C.gold},{r:5,c:'#FF9A4D'},{r:10,c:C.bear}];
  const N=10,plotW=W-L-R,plotH=H-T-B,minY=30,maxY=100;
  const X=n=>L+plotW*(n/N);
  const Y=v=>T+plotH-(v-minY)/(maxY-minY)*plotH;
  [30,50,70,90,100].forEach(v=>{
    el('line',{x1:L,x2:L+plotW,y1:Y(v),y2:Y(v),class:'rgrid'},s);
    txt(s,L-8,Y(v)+3.5,v+'%',{'text-anchor':'end',class:'rax'});
  });
  for(let n=0;n<=N;n+=2) txt(s,X(n),T+plotH+18,n,{'text-anchor':'middle','font-size':10,fill:C.muted2});
  txt(s,L+plotW/2,H-8,'CONSECUTIVE LOSSES  连续亏损次数',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.18em'});
  risks.forEach((rk,i)=>{
    const pts=[];for(let n=0;n<=N;n++)pts.push([X(n),Y(Math.max(minY,100*Math.pow(1-rk.r/100,n)))]);
    el('path',{d:pts.map((p,j)=>(j?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
      stroke:rk.c,'stroke-width':2.2,class:'rline',style:'transition-delay:'+(.15+i*.12)+'s'},s);
    const endv=100*Math.pow(1-rk.r/100,N);
    const g=el('g',{style:'--i:'+(i+7)},s);
    el('circle',{cx:X(N),cy:Y(Math.max(minY,endv)),r:4,fill:rk.c,class:'rlbl'},g);
    txt(g,L+plotW+14,Y(Math.max(minY,endv))+4,rk.r+'% risk → '+endv.toFixed(1)+'%',
      {'font-size':10.5,fill:rk.c,class:'rlbl'});
  });
}

/* ============ 3. lot sizes ============ */
function drawLots(box){
  const W=720,H=250,s=svgFor(box,W,H);
  const rows=[{n:'1.00',t:'STANDARD 标准手',u:'100,000 units / 100 oz',fx:'$10.00',au:'$100.00',c:C.gold},
              {n:'0.10',t:'MINI 迷你手',u:'10,000 units / 10 oz',fx:'$1.00',au:'$10.00',c:C.cyan},
              {n:'0.01',t:'MICRO 微型手',u:'1,000 units / 1 oz',fx:'$0.10',au:'$1.00',c:C.bull}];
  const cw=(W-40)/3;
  txt(s,20+cw*1.5,18,'VALUE OF ONE MOVE  一点波动值多少钱',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.2em'});
  rows.forEach((r,i)=>{
    const x=20+cw*i, g=el('g',{style:'--i:'+i},s);
    el('rect',{x:x+6,y:36,width:cw-12,height:H-56,rx:14,fill:'rgba(255,255,255,.018)',
      stroke:'rgba(232,200,119,.12)',class:'rbar'},g);
    txt(g,x+cw/2,78,r.n,{'text-anchor':'middle','font-size':34,'font-weight':700,fill:r.c,class:'rlbl'});
    txt(g,x+cw/2,98,'LOT',{'text-anchor':'middle','font-size':9,fill:C.muted2,'letter-spacing':'.24em'});
    txt(g,x+cw/2,120,r.t,{'text-anchor':'middle','font-size':10.5,fill:C.text,'font-family':"'Noto Sans SC',sans-serif"});
    txt(g,x+cw/2,137,r.u,{'text-anchor':'middle','font-size':9.5,fill:C.muted2});
    el('line',{x1:x+24,x2:x+cw-24,y1:152,y2:152,stroke:'rgba(232,200,119,.12)'},g);
    txt(g,x+22,175,'EURUSD / pip',{'font-size':9.5,fill:C.muted2});
    txt(g,x+cw-22,175,r.fx,{'text-anchor':'end','font-size':13,fill:C.text,'font-weight':700});
    txt(g,x+22,199,'XAUUSD / $1.00',{'font-size':9.5,fill:C.muted2});
    txt(g,x+cw-22,199,r.au,{'text-anchor':'end','font-size':13,fill:C.goldB,'font-weight':700});
  });
}

/* ============ 4. stop placement ============ */
function drawStopPlace(box){
  const W=720,H=340,L=20,R=170,T=28,B=34;
  const s=svgFor(box,W,H);
  const series=[62,60,57,54,51,49,47.5,48.5,50.5,49,47,46.2,48,51,54,57,60,63];
  const lowIdx=11, plotW=W-L-R, plotH=H-T-B;
  const mn=42,mx=66;
  const step=plotW/series.length;
  const X=i=>L+step*(i+0.5);
  const Y=p=>T+(mx-p)/(mx-mn)*plotH;
  const bw=Math.min(step*0.56,15);
  /* stops */
  const swingLow=46.2;
  const goodStop=swingLow-2.8, badStop=48.6;
  el('rect',{x:L,y:Y(swingLow),width:plotW,height:Y(goodStop)-Y(swingLow),
    fill:'rgba(44,217,138,.07)',class:'rbar',style:'--i:9'},s);
  [[badStop,C.bear,'✕  TOO TIGHT  太紧','inside the noise 在噪音里'],
   [goodStop,C.bull,'✓  BELOW STRUCTURE  结构之外','buffer added 有缓冲']].forEach((d,i)=>{
    const g=el('g',{style:'--i:'+(i+3)},s);
    el('line',{x1:L,x2:L+plotW,y1:Y(d[0]),y2:Y(d[0]),stroke:d[1],'stroke-width':1.6,
      'stroke-dasharray':'6 4',class:'rlbl'},g);
    txt(g,L+plotW+12,Y(d[0])-2,d[2],{'font-size':10.5,fill:d[1],'font-weight':700,class:'rlbl'});
    txt(g,L+plotW+12,Y(d[0])+13,d[3],{'font-size':9.5,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  });
  /* candles */
  series.forEach((c,i)=>{
    const o=i?series[i-1]:series[0]+1.5;
    const up=c>=o, col=up?C.bull:C.bear;
    const hi=Math.max(o,c)+0.9, lo=Math.min(o,c)-0.9;
    const g=el('g',{style:'--i:'+i,class:'rbar'},s);
    el('line',{x1:X(i),x2:X(i),y1:Y(hi),y2:Y(lo),stroke:col,'stroke-width':1.6,'stroke-opacity':.85},g);
    const top=Y(Math.max(o,c));
    el('rect',{x:X(i)-bw/2,y:top,width:bw,height:Math.max(Math.abs(Y(o)-Y(c)),1.6),rx:1.5,
      fill:col,'fill-opacity':.75},g);
  });
  /* swing low marker */
  el('circle',{cx:X(lowIdx),cy:Y(swingLow),r:5,fill:'none',stroke:C.gold,'stroke-width':1.4,
    'stroke-dasharray':'3 3',class:'rlbl',style:'--i:14'},s);
  /* label sits inside the shaded buffer band — the band itself shows the gap */
  txt(s,X(lowIdx),Y(swingLow)+22,'swing low 摆动低点',{'text-anchor':'middle','font-size':9.5,fill:C.gold,
    'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:14'});
}

/* ============ 5. R:R required win rate ============ */
function drawRR(box){
  const W=720,H=330,L=54,R=28,T=30,B=52;
  const s=svgFor(box,W,H);
  const data=[{r:'1 : 0.5',v:66.7,ok:false},{r:'1 : 1',v:50,ok:false},{r:'1 : 2',v:33.3,ok:true},
              {r:'1 : 3',v:25,ok:true},{r:'1 : 5',v:16.7,ok:true}];
  const plotW=W-L-R,plotH=H-T-B,maxV=75;
  const X=i=>L+plotW/data.length*(i+0.5);
  const Y=v=>T+plotH-v/maxV*plotH;
  [0,25,50,75].forEach(g=>{
    el('line',{x1:L,x2:L+plotW,y1:Y(g),y2:Y(g),class:'rgrid'},s);
    txt(s,L-8,Y(g)+3.5,g+'%',{'text-anchor':'end',class:'rax'});
  });
  const bw=plotW/data.length*0.5;
  data.forEach((d,i)=>{
    const g=el('g',{style:'--i:'+i},s);
    const col=d.ok?C.bull:C.bear, y=Y(d.v);
    const id='rrg'+i;
    const lg=el('linearGradient',{id:id,x1:0,y1:0,x2:0,y2:1},s);
    el('stop',{offset:'0%','stop-color':col,'stop-opacity':.8},lg);
    el('stop',{offset:'100%','stop-color':col,'stop-opacity':.15},lg);
    el('rect',{x:X(i)-bw/2,y:y,width:bw,height:T+plotH-y,rx:3,fill:'url(#'+id+')',
      stroke:col,'stroke-opacity':.45,class:'rbar'},g);
    txt(g,X(i),y-10,d.v.toFixed(1)+'%',{'text-anchor':'middle','font-size':13,'font-weight':700,fill:col,class:'rlbl'});
    txt(g,X(i),T+plotH+20,d.r,{'text-anchor':'middle','font-size':12,fill:C.text});
  });
  txt(s,L+plotW/2,H-10,'REWARD : RISK  盈亏比 — 打平所需最低胜率',
    {'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.16em','font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 6. expectancy comparison ============ */
function drawExpect(box){
  const W=720,H=340,s=svgFor(box,W,H);
  const sys=[{n:'SYSTEM A',zh:'40% 胜率 · 1:2',winV:80,lossV:60,win:'+80R',loss:'−60R',net:20,c:C.bull},
             {n:'SYSTEM B',zh:'90% 胜率 · 1:0.1',winV:9,lossV:10,win:'+9R',loss:'−10R',net:-1,c:C.bear}];
  const cw=(W-46)/2, base=232, BARMAX=120;
  sys.forEach((sy,i)=>{
    const x=16+cw*i+(i?14:0), g=el('g',{style:'--i:'+i*2},s);
    el('rect',{x:x,y:16,width:cw-14,height:H-46,rx:16,fill:'rgba(255,255,255,.016)',
      stroke:'rgba(232,200,119,.12)'},g);
    txt(g,x+22,44,sy.n,{'font-size':12,fill:sy.c,'font-weight':700,'letter-spacing':'.2em'});
    txt(g,x+22,62,sy.zh,{'font-size':11,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
    txt(g,x+cw-36,44,'100 trades',{'text-anchor':'end','font-size':9.5,fill:C.muted2});
    /* gross win / gross loss bars */
    const bx=x+34, bw2=34;
    /* scale each panel to its own biggest bar — the cross-system comparison
       lives in the NET box, so per-panel scaling keeps both readable */
    const sc=BARMAX/Math.max(sy.winV,sy.lossV);
    const gw=sy.winV*sc, gl=sy.lossV*sc;
    const gg=el('g',{style:'--i:'+(i*2+1)},g);
    el('rect',{x:bx,y:base-gw,width:bw2,height:gw,rx:3,fill:C.bull,'fill-opacity':.55,
      stroke:C.bull,'stroke-opacity':.5,class:'rbar'},gg);
    txt(gg,bx+bw2/2,base-gw-9,sy.win,{'text-anchor':'middle','font-size':11.5,fill:C.bull,'font-weight':700,class:'rlbl'});
    txt(gg,bx+bw2/2,base+16,'WINS',{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'letter-spacing':'.14em'});
    el('rect',{x:bx+58,y:base-gl,width:bw2,height:gl,rx:3,fill:C.bear,'fill-opacity':.55,
      stroke:C.bear,'stroke-opacity':.5,class:'rbar'},gg);
    txt(gg,bx+58+bw2/2,base-gl-9,sy.loss,{'text-anchor':'middle','font-size':11.5,fill:C.bear,'font-weight':700,class:'rlbl'});
    txt(gg,bx+58+bw2/2,base+16,'LOSSES',{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'letter-spacing':'.14em'});
    el('line',{x1:bx-10,x2:bx+108,y1:base,y2:base,stroke:'rgba(232,200,119,.2)'},gg);
    /* net */
    const nx=x+cw-118;
    el('rect',{x:nx,y:base-104,width:96,height:120,rx:12,
      fill:sy.net>0?'rgba(44,217,138,.09)':'rgba(255,92,99,.09)',
      stroke:sy.net>0?'rgba(44,217,138,.4)':'rgba(255,92,99,.4)',class:'rbar',style:'--i:'+(i*2+2)},g);
    txt(g,nx+48,base-76,'NET  净结果',{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'letter-spacing':'.14em','font-family':"'Noto Sans SC',sans-serif"});
    txt(g,nx+48,base-38,(sy.net>0?'+':'')+sy.net+'R',{'text-anchor':'middle','font-size':30,'font-weight':700,
      fill:sy.net>0?C.bull:C.bear,class:'rlbl',style:'--i:'+(i*2+3)});
    txt(g,nx+48,base-14,'per 100 trades',{'text-anchor':'middle','font-size':9,fill:C.muted2});
    txt(g,x+22,H-42,'Expectancy '+(sy.net>0?'+':'')+(sy.net/100).toFixed(2)+'R / trade',
      {'font-size':10.5,fill:sy.net>0?C.bull:C.bear});
  });
}

/* ============ 7. leverage myth ============ */
function drawLeverage(box){
  const W=720,H=260,s=svgFor(box,W,H);
  const cols=[{l:'1 : 20',m:1325},{l:'1 : 100',m:265},{l:'1 : 500',m:53}];
  const cw=(W-40)/3;
  txt(s,20+cw*1.5,20,'0.10 LOTS XAUUSD  ·  $5.00 STOP',
    {'text-anchor':'middle','font-size':10,fill:C.gold,'letter-spacing':'.22em'});
  cols.forEach((c,i)=>{
    const x=20+cw*i, g=el('g',{style:'--i:'+i},s);
    el('rect',{x:x+7,y:38,width:cw-14,height:H-64,rx:14,fill:'rgba(255,255,255,.016)',
      stroke:'rgba(232,200,119,.12)',class:'rbar'},g);
    txt(g,x+cw/2,72,c.l,{'text-anchor':'middle','font-size':22,'font-weight':700,fill:C.text,class:'rlbl'});
    txt(g,x+cw/2,90,'LEVERAGE 杠杆',{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'letter-spacing':'.2em','font-family':"'Noto Sans SC',sans-serif"});
    el('rect',{x:x+26,y:106,width:cw-52,height:54,rx:10,fill:'rgba(255,92,99,.1)',
      stroke:'rgba(255,92,99,.45)',class:'rbar'},g);
    txt(g,x+cw/2,130,'−$50.00',{'text-anchor':'middle','font-size':21,'font-weight':700,fill:C.bear,class:'rlbl'});
    txt(g,x+cw/2,148,'LOSS IF STOPPED  止损亏损',{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'letter-spacing':'.1em','font-family':"'Noto Sans SC',sans-serif"});
    txt(g,x+cw/2,182,'margin 保证金',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
    txt(g,x+cw/2,204,'$'+c.m.toLocaleString(),{'text-anchor':'middle','font-size':17,fill:C.cyan,'font-weight':700,class:'rlbl'});
  });
  txt(s,W/2,H-10,'Loss is identical. Only the margin changes.  亏损完全相同，改变的只有保证金。',
    {'text-anchor':'middle','font-size':10.5,fill:C.goldB,'font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 8. three lines of defence ============ */
function drawDefense(box){
  const W=720,H=250,L=126,R=120,T=42,B=40;
  const s=svgFor(box,W,H);
  const rows=[{k:'PER TRADE 单笔',p:1,v:50,c:C.bull},
              {k:'PER DAY 每日',p:3,v:150,c:C.gold},
              {k:'PER MONTH 每月',p:10,v:500,c:C.bear}];
  const plotW=W-L-R, maxP=10, rh=(H-T-B)/3;
  txt(s,L,26,'$5,000 ACCOUNT  ·  HARD CAPS',{'font-size':10,fill:C.muted2,'letter-spacing':'.22em'});
  rows.forEach((r,i)=>{
    const y=T+rh*i+rh*0.18, bh=rh*0.5;
    const g=el('g',{style:'--i:'+i},s);
    txt(g,L-14,y+bh/2+4,r.k,{'text-anchor':'end','font-size':10.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
    el('rect',{x:L,y:y,width:plotW,height:bh,rx:5,fill:'rgba(255,255,255,.03)'},g);
    const bar=el('rect',{x:L,y:y,width:plotW*(r.p/maxP),height:bh,rx:5,fill:r.c,'fill-opacity':.4,
      stroke:r.c,'stroke-opacity':.6},g);
    bar.setAttribute('class','rbar'); bar.style.transformOrigin='left'; bar.style.transform='scaleX(0)';
    txt(g,L+plotW+14,y+bh/2+4,'$'+r.v+'  ·  '+r.p+'%',{'font-size':12.5,fill:r.c,'font-weight':700,class:'rlbl'});
  });
  txt(s,L,H-14,'Hit line 1 → size the next trade.  Hit line 2 → stop for the day.  Hit line 3 → stop and review.',
    {'font-size':9.5,fill:C.muted2});
}

const RENDER={recovery:drawRecovery,streak:drawStreak,lots:drawLots,stopplace:drawStopPlace,
              rr:drawRR,expect:drawExpect,leverage:drawLeverage,defense:drawDefense};
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

