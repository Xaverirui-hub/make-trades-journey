
document.getElementById('yr').textContent=new Date().getFullYear();
const RM=window.matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ---------------- candle pattern data ---------------- */
const P={
  intro_demo:[{o:44,c:48,h:50,l:42},{o:48,c:46,h:52,l:44},{o:46,c:53,h:55,l:45},{o:53,c:51,h:57,l:49},{o:51,c:58,h:60,l:50},{o:58,c:55,h:61,l:53}],
  history_demo:[{o:50,c:56,h:57,l:48},{o:56,c:52,h:58,l:50},{o:52,c:58,h:60,l:51},{o:58,c:62,h:64,l:56},{o:62,c:57,h:64,l:55}],
  spinning:[{o:47,c:51,h:60,l:39},{o:51,c:47,h:60,l:39}],
  marubozu_up:[{o:40,c:60,h:60,l:40,highlight:true}],
  marubozu_down:[{o:60,c:40,h:60,l:40,highlight:true}],
  doji_longlegged:[{o:50,c:50.5,h:63,l:37}],
  doji_dragonfly:[{o:59,c:59.6,h:60.5,l:37}],
  doji_gravestone:[{o:41,c:41.6,h:63,l:40}],
  doji_traditional:[{o:50,c:50.4,h:56,l:44}],
  longdoji_up:[{o:39,c:57,h:59,l:38},{o:57,c:57.5,h:63,l:52,highlight:true}],
  longdoji_down:[{o:61,c:43,h:62,l:41},{o:43,c:43.5,h:49,l:37,highlight:true}],
  hammer:[{o:64,c:60,h:65,l:59},{o:60,c:56,h:61,l:55},{o:56,c:52,h:57,l:51},{o:52,c:54,h:55,l:44,highlight:true}],
  shooting_star:[{o:40,c:44,h:45,l:39},{o:44,c:48,h:49,l:43},{o:48,c:52,h:53,l:47},{o:52,c:50,h:61,l:49,highlight:true}],
  inverted_hammer:[{o:64,c:60,h:65,l:59},{o:60,c:56,h:61,l:55},{o:56,c:52,h:57,l:51},{o:51,c:53,h:62,l:50,highlight:true}],
  hanging_man:[{o:40,c:44,h:45,l:39},{o:44,c:48,h:49,l:43},{o:48,c:52,h:53,l:47},{o:53,c:51,h:54,l:43,highlight:true}],
  engulf_bull:[{o:60,c:56,h:61,l:55},{o:56,c:53,h:57,l:52},{o:53,c:51,h:54,l:50},{o:50.5,c:59,h:60,l:49.5,highlight:true}],
  engulf_bear:[{o:40,c:44,h:45,l:39},{o:44,c:47,h:48,l:43},{o:47,c:49,h:50,l:46},{o:49.5,c:41,h:50.5,l:40,highlight:true}],
  tweezer_bottom:[{o:60,c:56,h:61,l:55},{o:56,c:52,h:57,l:51},{o:52,c:47,h:53,l:44,highlight:true},{o:47,c:52,h:53,l:44,highlight:true}],
  tweezer_top:[{o:40,c:44,h:45,l:39},{o:44,c:48,h:49,l:43},{o:48,c:53,h:57,l:47,highlight:true},{o:53,c:48,h:57,l:47,highlight:true}],
  soldiers:[{o:42,c:48,h:49,l:41},{o:47,c:53,h:54,l:46},{o:52,c:58,h:59,l:51}],
  crows:[{o:58,c:52,h:59,l:51},{o:53,c:47,h:54,l:46},{o:48,c:42,h:49,l:41}],
  morning_star:[{o:60,c:50,h:61,l:49},{o:47,c:46,h:48,l:45,highlight:true},{o:49,c:59,h:60,l:48}],
  evening_star:[{o:40,c:50,h:51,l:39},{o:53,c:54,h:55,l:52,highlight:true},{o:51,c:41,h:52,l:40}],
  inside_up:[{o:58,c:48,h:59,l:47},{o:50,c:54,h:55,l:49,highlight:true},{o:54,c:60,h:61,l:53}],
  inside_down:[{o:42,c:52,h:53,l:41},{o:50,c:46,h:51,l:45,highlight:true},{o:46,c:40,h:47,l:39}]
};

const NS='http://www.w3.org/2000/svg';
// expected follow-through direction after each pattern
const DIR={hammer:'up',inverted_hammer:'up',engulf_bull:'up',tweezer_bottom:'up',soldiers:'up',
  morning_star:'up',inside_up:'up',marubozu_up:'up',longdoji_down:'up',
  shooting_star:'down',hanging_man:'down',engulf_bear:'down',tweezer_top:'down',crows:'down',
  evening_star:'down',inside_down:'down',marubozu_down:'down',longdoji_up:'down'};
function genFollow(last,dir,n){
  const out=[];let prev=last;const s=dir==='up'?1:-1;const steps=[4.3,4.9,4.5];
  for(let i=0;i<n;i++){const o=prev,c=o+s*steps[i];
    const h=Math.max(o,c)+(dir==='up'?1.5:0.8),l=Math.min(o,c)-(dir==='up'?0.8:1.5);
    out.push({o,h,l,c,proj:true});prev=c;}
  return out;
}
function renderChart(container){
  const key=container.dataset.pattern;const base=P[key];if(!base)return;
  const dir=DIR[key];
  const follow=dir?genFollow(base[base.length-1].c,dir,3):[];
  const cs=base.concat(follow);
  const step=48,bodyW=22,padX=24,padTop=22,padBot=22,H=250;
  const W=padX*2+step*cs.length;
  let min=Infinity,max=-Infinity;
  cs.forEach(c=>{min=Math.min(min,c.l);max=Math.max(max,c.h);});
  const sp=(max-min)||1,pd=sp*0.12;min-=pd;max+=pd;
  const y=p=>padTop+(max-p)/(max-min)*(H-padTop-padBot);
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('viewBox','0 0 '+W+' '+H);
  svg.setAttribute('preserveAspectRatio','xMidYMid meet');
  // baseline
  const axis=document.createElementNS(NS,'line');
  axis.setAttribute('x1',8);axis.setAttribute('x2',W-8);
  axis.setAttribute('y1',H-10);axis.setAttribute('y2',H-10);
  axis.setAttribute('class','axis');svg.appendChild(axis);
  // ---- forecast zone + boundary (behind candles) ----
  const projStartDelay=base.length*85+420;
  if(dir){
    const bx=padX+base.length*step;
    const zone=document.createElementNS(NS,'rect');
    zone.setAttribute('x',bx);zone.setAttribute('y',12);zone.setAttribute('width',W-bx-6);zone.setAttribute('height',H-24);
    zone.setAttribute('rx',8);zone.setAttribute('class','proj-zone '+dir);svg.appendChild(zone);
    const sep=document.createElementNS(NS,'line');
    sep.setAttribute('x1',bx);sep.setAttribute('x2',bx);sep.setAttribute('y1',16);sep.setAttribute('y2',H-16);
    sep.setAttribute('class','proj-sep');svg.appendChild(sep);
    const glyph=document.createElementNS(NS,'text');
    glyph.setAttribute('x',W-13);glyph.setAttribute('y',28);glyph.setAttribute('text-anchor','end');
    glyph.setAttribute('class','proj-glyph '+dir);glyph.textContent=dir==='up'?'\u25B2':'\u25BC';svg.appendChild(glyph);
  }
  // ---- candles ----
  cs.forEach((c,i)=>{
    const isP=!!c.proj,cx=padX+i*step+step/2;
    const g=document.createElementNS(NS,'g');
    g.setAttribute('class','cndl'+(c.highlight?' hl':'')+(isP?' proj':''));
    g.style.setProperty('--i',i);
    if(isP)g.style.setProperty('--pd',(projStartDelay+(i-base.length)*300));
    const up=c.c>=c.o,cls=up?'bull':'bear';
    if(c.highlight){
      const halo=document.createElementNS(NS,'rect');
      halo.setAttribute('x',cx-step/2+7);halo.setAttribute('y',y(c.h)-9);
      halo.setAttribute('width',step-14);halo.setAttribute('height',(y(c.l)-y(c.h))+18);
      halo.setAttribute('rx',9);halo.setAttribute('class','cndl-halo');g.appendChild(halo);
    }
    const wick=document.createElementNS(NS,'line');
    wick.setAttribute('x1',cx);wick.setAttribute('x2',cx);
    wick.setAttribute('y1',y(c.h));wick.setAttribute('y2',y(c.l));
    wick.setAttribute('class','wick '+cls);g.appendChild(wick);
    const top=y(Math.max(c.o,c.c)),bot=y(Math.min(c.o,c.c));
    const body=document.createElementNS(NS,'rect');
    body.setAttribute('x',cx-bodyW/2);body.setAttribute('y',top);
    body.setAttribute('width',bodyW);body.setAttribute('height',Math.max(bot-top,2.5));
    body.setAttribute('rx',3);body.setAttribute('class','body '+cls);g.appendChild(body);
    svg.appendChild(g);
  });
  // ---- trend arrow (on top) ----
  if(dir){
    const lb=base[base.length-1],lp=cs[cs.length-1];
    const x1=padX+(base.length-1)*step+step/2,yy1=y(lb.c);
    const x2=padX+(cs.length-1)*step+step/2,yy2=y(lp.c);
    const arw=document.createElementNS(NS,'g');arw.setAttribute('class','proj-arrow '+dir);
    const ln=document.createElementNS(NS,'line');
    ln.setAttribute('x1',x1);ln.setAttribute('y1',yy1);ln.setAttribute('x2',x2);ln.setAttribute('y2',yy2);
    ln.setAttribute('class','proj-line');arw.appendChild(ln);
    const ang=Math.atan2(yy2-yy1,x2-x1),ah=8;
    const h1x=x2-ah*Math.cos(ang-0.5),h1y=yy2-ah*Math.sin(ang-0.5);
    const h2x=x2-ah*Math.cos(ang+0.5),h2y=yy2-ah*Math.sin(ang+0.5);
    const head=document.createElementNS(NS,'path');
    head.setAttribute('d','M'+x2+','+yy2+' L'+h1x+','+h1y+' M'+x2+','+yy2+' L'+h2x+','+h2y);
    head.setAttribute('class','proj-head');arw.appendChild(head);
    svg.appendChild(arw);
  }
  container.appendChild(svg);
}
document.querySelectorAll('.chart[data-pattern]').forEach(renderChart);

/* ---------------- anatomy diagram ---------------- */
(function(){
  const mount=document.getElementById('anatomy-mount');if(!mount)return;
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('viewBox','0 0 500 320');svg.setAttribute('class','anatomy-svg');
  function label(x,y,t,anchor,color,size){
    const el=document.createElementNS(NS,'text');
    el.setAttribute('x',x);el.setAttribute('y',y);el.setAttribute('text-anchor',anchor||'start');
    el.setAttribute('fill',color||'#9A968C');el.setAttribute('font-family',"'JetBrains Mono',monospace");
    el.setAttribute('font-size',size||'10.5');el.setAttribute('letter-spacing','.04em');el.textContent=t;svg.appendChild(el);
  }
  function tick(x1,y1,x2,y2,dot){const l=document.createElementNS(NS,'line');
    l.setAttribute('x1',x1);l.setAttribute('y1',y1);l.setAttribute('x2',x2);l.setAttribute('y2',y2);
    l.setAttribute('stroke','rgba(232,200,119,.32)');l.setAttribute('stroke-width','1');l.setAttribute('stroke-dasharray','2 3');svg.appendChild(l);
    if(dot){const c=document.createElementNS(NS,'circle');c.setAttribute('cx',x1);c.setAttribute('cy',y1);c.setAttribute('r','1.8');c.setAttribute('fill','rgba(232,200,119,.6)');svg.appendChild(c);}}
  function candle(cx,glow,bodyTop,bodyBot,highY,lowY){
    const g=document.createElementNS(NS,'g');g.setAttribute('class','cndl');g.style.setProperty('--i',0);
    const w=document.createElementNS(NS,'line');
    w.setAttribute('x1',cx);w.setAttribute('x2',cx);w.setAttribute('y1',highY);w.setAttribute('y2',lowY);
    w.setAttribute('class','wick '+glow);g.appendChild(w);
    const b=document.createElementNS(NS,'rect');
    b.setAttribute('x',cx-22);b.setAttribute('y',bodyTop);b.setAttribute('width',44);
    b.setAttribute('height',bodyBot-bodyTop);b.setAttribute('rx',4);b.setAttribute('class','body '+glow);g.appendChild(b);
    svg.appendChild(g);
  }
  // ---- BULLISH candle (left) : cx=175, high36 low284, close(top)=108 open(bot)=196 ----
  candle(175,'bull',108,196,36,284);
  // left anatomy labels (anchor end at x=118) with ticks pointing to the candle
  tick(175,72,124,72,true);  label(118,76,'UPPER SHADOW','end','#9A968C');
  tick(153,152,124,152,true);label(118,156,'REAL BODY','end','#2CD98A');
  tick(175,240,124,240,true);label(118,244,'LOWER SHADOW','end','#9A968C');
  // right price labels (anchor start at x=232)
  tick(175,36,226,36,true);  label(232,40,'HIGH','start','#B9B4A6');
  tick(197,108,226,108,true);label(232,112,'CLOSE','start','#B9B4A6');
  tick(197,196,226,196,true);label(232,200,'OPEN','start','#B9B4A6');
  tick(175,284,226,284,true);label(232,288,'LOW','start','#B9B4A6');
  label(175,308,'BULLISH','middle','#2CD98A','11');
  // ---- BEARISH candle (right) : cx=400, high36 low284, open(top)=108 close(bot)=196 ----
  candle(400,'bear',108,196,36,284);
  tick(400,36,451,36,true);  label(457,40,'HIGH','start','#B9B4A6');
  tick(422,108,451,108,true);label(457,112,'OPEN','start','#B9B4A6');
  tick(422,196,451,196,true);label(457,200,'CLOSE','start','#B9B4A6');
  tick(400,284,451,284,true);label(457,288,'LOW','start','#B9B4A6');
  label(400,308,'BEARISH','middle','#FF5C63','11');
  mount.appendChild(svg);
})();

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
