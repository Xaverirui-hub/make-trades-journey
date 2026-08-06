
document.getElementById('yr').textContent=new Date().getFullYear();
const RM=window.matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ---------------- MA & S/R candle engine ---------------- */
const NS='http://www.w3.org/2000/svg';
const C={bull:'#2CD98A',bear:'#FF5C63',gold:'#E8C877',muted:'#9A968C',cyan:'#2FE0D6'};
function el(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function makeSeries(wp,n,noise,seed){const r=rng(seed),out=[];
  for(let i=0;i<n;i++){const t=i/(n-1);let a=wp[0],b=wp[wp.length-1];
    for(let j=0;j<wp.length-1;j++){if(t>=wp[j].x&&t<=wp[j+1].x){a=wp[j];b=wp[j+1];break;}}
    const lt=(b.x-a.x)?(t-a.x)/(b.x-a.x):0,s=lt*lt*(3-2*lt);
    out.push(a.p+(b.p-a.p)*s+(r()-0.5)*2*noise);}
  return out;}
function sma(a,p){const o=[];for(let i=0;i<a.length;i++){if(i<p-1){o.push(null);continue;}let s=0;for(let k=i-p+1;k<=i;k++)s+=a[k];o.push(s/p);}return o;}
function ema(a,p){const o=[],k=2/(p+1);let e=a[0];for(let i=0;i<a.length;i++){e=i?a[i]*k+e*(1-k):a[0];o.push(e);}return o;}
function pathFrom(pts){return pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');}
function candlesFromSeries(S,seed,wick){const r=rng(seed+99),cs=[];
  for(let i=0;i<S.length;i++){const o=i?S[i-1]:S[0]-(S[1]-S[0])*0.4;const c=S[i];
    const w=wick*(0.45+r());const h=Math.max(o,c)+w,l=Math.min(o,c)-w;cs.push({o,h,l,c});}
  return cs;}
function genFollow(last,dir,n){const out=[];let prev=last;const s=dir==='up'?1:-1;const steps=[3.4,3.9,3.6];
  for(let i=0;i<n;i++){const o=prev,c=o+s*steps[i];const h=Math.max(o,c)+(dir==='up'?1.2:0.7),l=Math.min(o,c)-(dir==='up'?0.7:1.2);
    out.push({o,h,l,c,proj:true});prev=c;}return out;}

const CHARTS={
  ma_smooth:{series:makeSeries([{x:0,p:50},{x:.28,p:59},{x:.5,p:53},{x:.72,p:64},{x:1,p:58}],30,2.4,7),overlays:[{type:'sma',period:8,cls:'ma1'}]},
  ma_smavsema:{series:makeSeries([{x:0,p:52},{x:.38,p:64},{x:.5,p:62},{x:.6,p:49},{x:1,p:60}],30,1.7,11),overlays:[{type:'ema',period:7,cls:'ma1'},{type:'sma',period:7,cls:'ma2'}]},
  ma_periods:{series:makeSeries([{x:0,p:40},{x:.3,p:50},{x:.5,p:47},{x:.7,p:60},{x:1,p:70}],36,2.6,5),overlays:[{type:'sma',period:6,cls:'ma1'},{type:'sma',period:16,cls:'ma3'}]},
  ma_trend:{series:makeSeries([{x:0,p:46},{x:.28,p:60},{x:.48,p:54},{x:.68,p:47},{x:1,p:63}],32,2,9),overlays:[{type:'sma',period:8,cls:'ma1'}],trendShade:true},
  ma_dynamic:{series:makeSeries([{x:0,p:42},{x:.12,p:50},{x:.2,p:46},{x:.34,p:56},{x:.44,p:51},{x:.6,p:62},{x:.7,p:57},{x:.85,p:66},{x:1,p:59}],28,1.3,3),
    overlays:[{type:'ema',period:9,cls:'ma1'}],dots:[{x:.2,color:'bull'},{x:.44,color:'bull'}],entry:{dir:'up',pad:2.6,back:2},entryStyle:'bounce'},
  ma_cross:{series:makeSeries([{x:0,p:62},{x:.28,p:46},{x:.5,p:59},{x:.62,p:54},{x:.78,p:59},{x:.9,p:55.5},{x:1,p:55.8}],40,1.3,2),overlays:[{type:'ema',period:6,cls:'ma1'},{type:'ema',period:16,cls:'ma3'}],entry:{dir:'up',pad:2,back:2},entryStyle:'cross'},

  sr_basics:{series:makeSeries([{x:0,p:50},{x:.12,p:61},{x:.24,p:49.5},{x:.36,p:61},{x:.48,p:49.5},{x:.6,p:61},{x:.72,p:49.5},{x:.85,p:60.5},{x:1,p:53}],30,0.8,8),
    levels:[{price:61,kind:'res',label:'Resistance 阻力'},{price:49.5,kind:'sup',label:'Support 支撑'}],
    dots:[{x:.12,color:'bear'},{x:.24,color:'bull'},{x:.36,color:'bear'},{x:.48,color:'bull'},{x:.6,color:'bear'},{x:.72,color:'bull'}]},
  sr_touches:{series:makeSeries([{x:0,p:44},{x:.14,p:60},{x:.24,p:52},{x:.38,p:60.3},{x:.5,p:53},{x:.64,p:60},{x:.74,p:54},{x:.88,p:60.2},{x:1,p:56}],32,0.7,14),
    levels:[{price:60.2,kind:'res',label:'Resistance 阻力'}],
    dots:[{x:.14,color:'bear',label:'1'},{x:.38,color:'bear',label:'2'},{x:.64,color:'bear',label:'3'},{x:.88,color:'bear',label:'4'}]},
  sr_flip:{series:makeSeries([{x:0,p:46},{x:.12,p:57},{x:.2,p:51},{x:.34,p:57.5},{x:.42,p:51},{x:.52,p:58},{x:.6,p:66},{x:.7,p:60},{x:.82,p:58.5},{x:1,p:58.3}],30,1,6),
    levels:[{price:58,kind:'flip',label:'Flip 反转位'}],dots:[{x:.12,color:'bear'},{x:.34,color:'bear'}],breaks:[{x:.56,dir:'up',label:'Breakout'}],entry:{dir:'up',pad:2.4,back:2}},
  sr_breakout:{series:makeSeries([{x:0,p:64},{x:.12,p:53},{x:.22,p:60},{x:.34,p:52.5},{x:.44,p:60},{x:.54,p:52},{x:.6,p:46},{x:.72,p:51.7},{x:.82,p:52},{x:1,p:51.8}],30,1,10),
    levels:[{price:52.5,kind:'sup',label:'Support → Resistance'}],breaks:[{x:.57,dir:'down',label:'Breakdown'}],entry:{dir:'down',pad:2.4,back:2}},
  sr_zone:{series:makeSeries([{x:0,p:48},{x:.16,p:59},{x:.28,p:52},{x:.44,p:60},{x:.56,p:53},{x:.72,p:59.5},{x:1,p:54}],28,0.9,4),
    zones:[{from:58,to:61.5,kind:'res',label:'Resistance zone 阻力区'}],dots:[{x:.16,color:'bear'},{x:.44,color:'bear'},{x:.72,color:'bear'}]}
};

const NECK={sr_flip:58,sr_breakout:52.5};
function badge(svg,x,y,num,col,label,dy,delay){
  const g=el('g',{class:'mk'},svg);g.style.transitionDelay=delay+'s';
  el('circle',{cx:x,cy:y,r:8,fill:col,stroke:'#08080a','stroke-width':1.5,class:'mk-ring'},g);
  const t=el('text',{x:x,y:y+3.2,'text-anchor':'middle','font-family':"'JetBrains Mono',monospace",'font-weight':'700','font-size':'10'},g);
  t.setAttribute('fill','#08080a');t.textContent=num;
  if(label){const lt=el('text',{x:x,y:y+dy,'text-anchor':'middle','font-family':"'JetBrains Mono',monospace",'font-size':'9','font-weight':'600'},g);lt.setAttribute('fill',col);lt.textContent=label;}
}
function renderCandleChart(container){
  const spec=CHARTS[container.dataset.chart];if(!spec)return;
  const S=spec.series,n=S.length;
  const real=candlesFromSeries(S,spec.seed||7,spec.wick||0.9);
  const entry=spec.entry;
  const follow=entry?genFollow(real[n-1].c,entry.dir,3):[];
  const all=real.concat(follow);
  const W=720,H=350,padL=12,padR=98,padT=30,padB=28;
  const step=(W-padL-padR)/all.length,bodyW=Math.min(step*0.62,22);
  const overlays=(spec.overlays||[]).map(o=>({cls:o.cls,_d:(o.type==='ema'?ema(S,o.period):sma(S,o.period))}));
  let vals=[];all.forEach(c=>{vals.push(c.h,c.l);});
  overlays.forEach(o=>o._d.forEach(v=>{if(v!=null)vals.push(v);}));
  (spec.levels||[]).forEach(l=>vals.push(l.price));
  (spec.zones||[]).forEach(z=>{vals.push(z.from,z.to);});
  if(entry){vals.push(real[n-1].c+entry.pad,real[n-1].c-entry.pad);}
  let mn=Math.min.apply(null,vals),mx=Math.max.apply(null,vals);const pd=(mx-mn)*0.1||1;mn-=pd;mx+=pd;
  const Xc=i=>padL+step*(i+0.5);
  const Y=p=>padT+(mx-p)/(mx-mn)*(H-padT-padB);
  const svg=el('svg',{viewBox:'0 0 '+W+' '+H,preserveAspectRatio:'xMidYMid meet',class:'pc-svg'});
  // baseline
  el('line',{x1:8,x2:W-8,y1:H-10,y2:H-10,class:'axis'},svg);
  // trend shading
  if(spec.trendShade&&overlays[0]){const m=overlays[0]._d;let seg=null;
    const flush=s=>{if(s)el('rect',{x:Xc(s.from)-step/2,y:padT,width:Math.max(Xc(s.to)-Xc(s.from)+step,1),height:H-padT-padB,class:'trend-band '+(s.bull?'band-bull':'band-bear')},svg);};
    for(let i=0;i<n;i++){if(m[i]==null)continue;const bull=S[i]>=m[i];if(!seg||seg.bull!==bull){flush(seg);seg={bull:bull,from:i,to:i};}else seg.to=i;}flush(seg);}
  // zones
  (spec.zones||[]).forEach(z=>{el('rect',{x:padL,y:Y(z.to),width:W-padL-padR,height:Math.abs(Y(z.from)-Y(z.to)),rx:4,class:'lvl-zone zone-'+z.kind},svg);
    const tt=el('text',{x:W-padR+8,y:(Y(z.from)+Y(z.to))/2+3,class:'lvl-label'},svg);tt.setAttribute('fill',C.muted);tt.textContent=z.label||'';});
  // entry zone (cyan) behind candles
  let ez=null;
  if(entry){const ep=real[n-1].c;const x0=Xc(n-entry.back)-step/2;const x1=W-padR;
    ez={x0:x0,x1:x1,yT:Y(ep+entry.pad),yB:Y(ep-entry.pad)};
    el('rect',{x:x0,y:ez.yT,width:x1-x0,height:ez.yB-ez.yT,rx:5,class:'entry-zone'},svg);}
  // levels behind candles
  (spec.levels||[]).forEach(l=>{el('line',{x1:padL,x2:W-padR,y1:Y(l.price),y2:Y(l.price),class:'lvl-line lvl-'+l.kind},svg);
    const col=l.kind==='res'?C.bear:l.kind==='sup'?C.bull:C.gold;
    const tt=el('text',{x:W-padR+8,y:Y(l.price)+3,class:'lvl-label'},svg);tt.setAttribute('fill',col);tt.textContent=l.label||'';});
  // candles
  all.forEach((c,i)=>{const isP=!!c.proj,cx=Xc(i);
    const g=el('g',{class:'cndl'+(isP?' proj':'')},svg);g.style.setProperty('--i',i);
    if(isP)g.style.setProperty('--pd',(n*70+380+(i-n)*300));
    const up=c.c>=c.o,cls=up?'bull':'bear';
    el('line',{x1:cx,x2:cx,y1:Y(c.h),y2:Y(c.l),class:'wick '+cls},g);
    const top=Y(Math.max(c.o,c.c)),bot=Y(Math.min(c.o,c.c));
    el('rect',{x:cx-bodyW/2,y:top,width:bodyW,height:Math.max(bot-top,2),rx:2.5,class:'body '+cls},g);});
  // overlays (MA) on top
  overlays.forEach(o=>{const p2=[];o._d.forEach((v,i)=>{if(v!=null)p2.push([Xc(i),Y(v)]);});
    if(p2.length>1)el('path',{d:pathFrom(p2),class:'ma-line '+(o.cls||'ma1'),pathLength:1},svg);});
  // entry box + dual-entry markers
  if(ez){el('rect',{x:ez.x0,y:ez.yT,width:ez.x1-ez.x0,height:ez.yB-ez.yT,rx:5,class:'entry-box'},svg);
    const dir=entry.dir,key=container.dataset.chart,dyU=dir==='up'?-13:18;
    if(spec.entryStyle==='bounce'){
      badge(svg,Xc(n-1),Y(real[n-1].c),'1',C.gold,'Tap 触及',dir==='up'?18:-13,1.0);
      badge(svg,Xc(n),Y(all[n].c),'2',C.cyan,'Bounce 反弹',dir==='up'?-13:18,1.35);
    }else if(spec.entryStyle==='cross'){
      const a=overlays[0]._d,bb=overlays[1]._d;let ci=Math.round(n*0.4);
      for(let i=1;i<n;i++){if(a[i-1]!=null&&bb[i-1]!=null&&(a[i-1]-bb[i-1])<=0&&(a[i]-bb[i])>0){ci=i;break;}}
      badge(svg,Xc(ci),Y(bb[ci]),'1',C.gold,'Golden Cross 金叉',-13,1.0);
      badge(svg,Xc(n-1),Y(real[n-1].c),'2',C.cyan,'Pullback 回踩',dyU,1.35);
    }else{
      const neck=NECK[key];
      if(neck!=null){let mi=Math.round(n*0.5),best=-1e9;
        for(let i=Math.round(n*0.5);i<n;i++){const ex=dir==='up'?S[i]-neck:neck-S[i];if(ex>best){best=ex;mi=i;}}
        let boI=mi;for(let i=mi;i>0;i--){const bn=dir==='up'?S[i]>=neck:S[i]<=neck,bp=dir==='up'?S[i-1]>=neck:S[i-1]<=neck;if(bn&&!bp){boI=i;break;}}
        badge(svg,Xc(boI),Y(neck),'1',C.gold,'Breakout 突破',dyU,1.0);}
      badge(svg,Xc(n-1),Y(real[n-1].c),'2',C.cyan,'Retest 回踩',dyU,1.35);
    }}
  // dots
  (spec.dots||[]).forEach((dt,di)=>{const i=Math.round(dt.x*(n-1));const g=el('g',{class:'mk'},svg);g.style.transitionDelay=(0.9+di*0.1)+'s';
    const col=dt.color==='bull'?C.bull:dt.color==='bear'?C.bear:C.gold;const yy=Y(real[i].c);
    el('circle',{cx:Xc(i),cy:yy,r:5,class:'mk-ring',fill:'none',stroke:col,'stroke-width':2},g);
    el('circle',{cx:Xc(i),cy:yy,r:2,fill:col},g);
    if(dt.label){const tx=el('text',{x:Xc(i),y:yy-14,'text-anchor':'middle',class:'mk-lbl'},g);tx.setAttribute('fill',col);tx.textContent=dt.label;}});
  // breaks
  (spec.breaks||[]).forEach((bk,bi)=>{const i=Math.round(bk.x*(n-1));const g=el('g',{class:'mk'},svg);g.style.transitionDelay=(1.05+bi*0.1)+'s';
    const x=Xc(i),y0=Y(real[i].c),dir=bk.dir==='up'?-1:1,col=bk.dir==='up'?C.bull:C.bear;
    el('line',{x1:x,y1:y0-dir*15,x2:x,y2:y0+dir*17,stroke:col,'stroke-width':2},g);
    el('path',{d:'M'+x+','+(y0+dir*19)+' L'+(x-4)+','+(y0+dir*11)+' M'+x+','+(y0+dir*19)+' L'+(x+4)+','+(y0+dir*11),stroke:col,'stroke-width':2,fill:'none','stroke-linecap':'round'},g);
    if(bk.label){const tx=el('text',{x:x,y:y0+dir*31,'text-anchor':'middle',class:'mk-lbl'},g);tx.setAttribute('fill',col);tx.textContent=bk.label;}});
  // MA crossovers
  if(spec.crossDetect&&overlays.length>=2){const a=overlays[0]._d,b=overlays[1]._d;
    for(let i=1;i<n;i++){if(a[i]==null||b[i]==null||a[i-1]==null||b[i-1]==null)continue;
      const prev=a[i-1]-b[i-1],cur=a[i]-b[i];
      if((prev<=0&&cur>0)||(prev>=0&&cur<0)){const golden=cur>0;const g=el('g',{class:'mk'},svg);g.style.transitionDelay='1.2s';
        const x=Xc(i),yv=Y((a[i]+b[i])/2),col=golden?C.bull:C.bear;
        el('rect',{x:x-4.5,y:yv-4.5,width:9,height:9,transform:'rotate(45 '+x+' '+yv+')',fill:'none',stroke:col,'stroke-width':2},g);
        const tx=el('text',{x:x,y:golden?yv+24:yv-13,'text-anchor':'middle',class:'mk-lbl'},g);tx.setAttribute('fill',col);tx.textContent=golden?'Golden Cross 金叉':'Death Cross 死叉';}}}
  // projection arrow
  if(entry){const x1=Xc(n-1),yy1=Y(real[n-1].c),x2=Xc(all.length-1),yy2=Y(all[all.length-1].c);
    const arw=el('g',{class:'proj-arrow '+entry.dir},svg);
    el('line',{x1:x1,y1:yy1,x2:x2,y2:yy2,class:'proj-line'},arw);
    const ang=Math.atan2(yy2-yy1,x2-x1),ah=8;
    el('path',{d:'M'+x2+','+yy2+' L'+(x2-ah*Math.cos(ang-0.5))+','+(yy2-ah*Math.sin(ang-0.5))+' M'+x2+','+yy2+' L'+(x2-ah*Math.cos(ang+0.5))+','+(yy2-ah*Math.sin(ang+0.5)),class:'proj-head'},arw);}
  container.appendChild(svg);
}
document.querySelectorAll('.pchart[data-chart]').forEach(renderCandleChart);

/* ---------------- reveal on scroll ---------------- */
const io=new IntersectionObserver((ents)=>{
  ents.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
},{threshold:.18,rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
// charts animate: add 'in' to nearest pattern/inforow ancestor container that holds cndl
document.querySelectorAll('.chart').forEach(ch=>{
  const o=new IntersectionObserver((ents)=>{ents.forEach(e=>{if(e.isIntersecting){ch.classList.add('in');o.unobserve(ch);}});},{threshold:.25});
  o.observe(ch);
});
document.querySelectorAll('.anatomy-box').forEach(box=>{
  const o=new IntersectionObserver((ents)=>{ents.forEach(e=>{if(e.isIntersecting){box.querySelector('.anatomy-svg')&&box.querySelector('.anatomy-svg').closest('.anatomy-box').classList.add('in');o.unobserve(box);}});},{threshold:.25});
  o.observe(box);
});

/* progress bar + active nav */
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
  const cv=document.getElementById('heroChart');if(!cv)return;
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
    // price range
    let mn=Infinity,mx=-Infinity;candles.forEach(k=>{mn=Math.min(mn,k.lo);mx=Math.max(mx,k.hi);});
    const pad=(mx-mn)*0.15;mn-=pad;mx+=pad;
    const Y=p=>h-((p-mn)/(mx-mn))*(h*0.9)-h*0.05;
    ctx.clearRect(0,0,w,h);
    const step=cw+gap;const startX=w-candles.length*step+gap/2;
    candles.forEach((k,i)=>{
      k.grow=Math.min(1,k.grow+0.09);
      const x=startX+i*step+cw/2;const up=k.c>=k.o;
      const col=up?'#2CD98A':'#FF5C63';
      ctx.strokeStyle=col;ctx.globalAlpha=0.85*k.grow;ctx.lineWidth=1.4*dpr;
      ctx.beginPath();ctx.moveTo(x,Y(k.hi));ctx.lineTo(x,Y(k.lo));ctx.stroke();
      const bt=Y(Math.max(k.o,k.c)),bb=Y(Math.min(k.o,k.c));
      const bh=Math.max((bb-bt)*k.grow,1.5);
      ctx.globalAlpha=k.grow;ctx.shadowColor=col;ctx.shadowBlur=10*dpr;ctx.fillStyle=col;
      ctx.fillRect(x-cw/2,bt+((bb-bt)-bh)/2,cw,bh);ctx.shadowBlur=0;
    });
    ctx.globalAlpha=1;
    requestAnimationFrame(frame);
  }
  if(!RM){requestAnimationFrame(frame);} else {
    // static single frame
    last=performance.now();frame(performance.now());
  }
})();
