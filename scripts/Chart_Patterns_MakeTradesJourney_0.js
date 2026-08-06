
document.getElementById('yr').textContent=new Date().getFullYear();
const RM=window.matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ---------------- Chart-pattern candle engine ---------------- */
const NS='http://www.w3.org/2000/svg';
const C={bull:'#2CD98A',bear:'#FF5C63',gold:'#E8C877',muted:'#9A968C',cyan:'#2FE0D6',neck:'#EDE7D8'};
function el(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function makeSeries(wp,n,noise,seed){const r=rng(seed),out=[];
  for(let i=0;i<n;i++){const t=i/(n-1);let a=wp[0],b=wp[wp.length-1];
    for(let j=0;j<wp.length-1;j++){if(t>=wp[j].x&&t<=wp[j+1].x){a=wp[j];b=wp[j+1];break;}}
    const lt=(b.x-a.x)?(t-a.x)/(b.x-a.x):0,s=lt*lt*(3-2*lt);
    out.push(a.p+(b.p-a.p)*s+(r()-0.5)*2*noise);}
  return out;}
function pathFrom(pts){return pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');}
function candlesFromSeries(S,seed,wick){const r=rng(seed+99),cs=[];
  for(let i=0;i<S.length;i++){const o=i?S[i-1]:S[0]-(S[1]-S[0])*0.4;const c=S[i];
    const w=wick*(0.45+r());const h=Math.max(o,c)+w,l=Math.min(o,c)-w;cs.push({o,h,l,c});}
  return cs;}
function genFollow(last,dir,n){const out=[];let prev=last;const s=dir==='up'?1:-1;const steps=[3.2,3.7,3.4];
  for(let i=0;i<n;i++){const o=prev,c=o+s*steps[i];const h=Math.max(o,c)+(dir==='up'?1.1:0.7),l=Math.min(o,c)-(dir==='up'?0.7:1.1);
    out.push({o,h,l,c,proj:true});prev=c;}return out;}
function lineAt(ln,xf){const a=ln.pts[0],b=ln.pts[ln.pts.length-1];return a.p+(b.p-a.p)*((xf-a.x)/((b.x-a.x)||1));}
// for sloped patterns, which drawn line is the one that breaks (index into spec.lines)
const BOLINE={sym:0,bflag:0,rflag:1,pen:0,rwedge:1,fwedge:0};

// helper builders
function L(pts,cls){return{pts:pts,cls:cls};}
const CHARTS={
  dtop:{n:34,noise:0.7,seed:3,series:[{x:0,p:49},{x:.16,p:62},{x:.3,p:54},{x:.48,p:61.5},{x:.6,p:54},{x:.68,p:49},{x:.82,p:53.6},{x:1,p:53.3}],
    lines:[L([{x:.16,p:61.9},{x:.48,p:61.9}],'pline-neck'),L([{x:.24,p:54},{x:1,p:54}],'pline-neck')],
    labels:[{x:.16,p:62,t:'Top 1'},{x:.48,p:61.5,t:'Top 2'},{x:.9,p:54,t:'Neckline 颈线',c:C.neck,dy:12}],
    entry:{dir:'down',pad:1.4,back:2},target:{p:46.3,fromX:.6,label:'Target 目标'}},
  dbot:{n:34,noise:0.7,seed:4,series:[{x:0,p:59},{x:.16,p:46},{x:.3,p:54},{x:.48,p:46.5},{x:.6,p:54},{x:.68,p:59},{x:.82,p:54.4},{x:1,p:54.7}],
    lines:[L([{x:.16,p:46.2},{x:.48,p:46.2}],'pline-neck'),L([{x:.24,p:54},{x:1,p:54}],'pline-neck')],
    labels:[{x:.16,p:46,t:'Bottom 1',dy:14},{x:.48,p:46.5,t:'Bottom 2',dy:14},{x:.9,p:54,t:'Neckline 颈线'}],
    entry:{dir:'up',pad:1.4,back:2},target:{p:62,fromX:.6,label:'Target 目标'}},
  hs:{n:38,noise:0.7,seed:6,series:[{x:0,p:49},{x:.1,p:58},{x:.18,p:52},{x:.32,p:64},{x:.44,p:52},{x:.56,p:58},{x:.66,p:52},{x:.74,p:47},{x:.87,p:51.6},{x:1,p:51.4}],
    lines:[L([{x:.18,p:52},{x:1,p:52}],'pline-neck')],
    labels:[{x:.1,p:58,t:'L Shoulder'},{x:.32,p:64,t:'Head 头'},{x:.56,p:58,t:'R Shoulder'},{x:.93,p:52,t:'Neckline'}],
    entry:{dir:'down',pad:1.3,back:2},target:{p:40,fromX:.66,label:'Target 目标'}},
  ihs:{n:38,noise:0.7,seed:8,series:[{x:0,p:51},{x:.1,p:42},{x:.18,p:48},{x:.32,p:36},{x:.44,p:48},{x:.56,p:42},{x:.66,p:48},{x:.74,p:53},{x:.87,p:48.4},{x:1,p:48.6}],
    lines:[L([{x:.18,p:48},{x:1,p:48}],'pline-neck')],
    labels:[{x:.1,p:42,t:'L Shoulder',dy:14},{x:.32,p:36,t:'Head 头',dy:14},{x:.56,p:42,t:'R Shoulder',dy:14},{x:.93,p:48,t:'Neckline'}],
    entry:{dir:'up',pad:1.3,back:2},target:{p:56,fromX:.66,label:'Target 目标'}},
  ttop:{n:36,noise:0.7,seed:5,series:[{x:0,p:50},{x:.12,p:61},{x:.22,p:53.5},{x:.35,p:61},{x:.46,p:53.5},{x:.59,p:61},{x:.7,p:53.5},{x:.79,p:48},{x:.9,p:52.8},{x:1,p:52.6}],
    lines:[L([{x:.12,p:61},{x:.59,p:61}],'pline-neck'),L([{x:.22,p:53.5},{x:1,p:53.5}],'pline-neck')],
    labels:[{x:.35,p:61,t:'Resistance 阻力'},{x:.9,p:53.5,t:'Neckline',dy:13}],
    entry:{dir:'down',pad:1.3,back:2},target:{p:46,fromX:.72,label:'Target 目标'}},
  tbot:{n:36,noise:0.7,seed:9,series:[{x:0,p:58},{x:.12,p:49},{x:.22,p:56.5},{x:.35,p:49},{x:.46,p:56.5},{x:.59,p:49},{x:.7,p:56.5},{x:.79,p:62},{x:.9,p:57.2},{x:1,p:57.4}],
    lines:[L([{x:.12,p:49},{x:.59,p:49}],'pline-neck'),L([{x:.22,p:56.5},{x:1,p:56.5}],'pline-neck')],
    labels:[{x:.35,p:49,t:'Support 支撑',dy:14},{x:.9,p:56.5,t:'Neckline'}],
    entry:{dir:'up',pad:1.3,back:2},target:{p:64,fromX:.72,label:'Target 目标'}},

  asc:{n:34,noise:0.7,seed:2,series:[{x:0,p:48},{x:.12,p:60},{x:.22,p:50},{x:.35,p:60},{x:.45,p:53},{x:.57,p:60},{x:.66,p:56},{x:.75,p:64},{x:.87,p:60.3},{x:1,p:60.6}],
    lines:[L([{x:.1,p:60},{x:.75,p:60}],'pline-neck'),L([{x:.22,p:50},{x:.66,p:56.4}],'pline-trend')],
    labels:[{x:.4,p:60,t:'Resistance 阻力'}],
    entry:{dir:'up',pad:1.3,back:2},target:{p:72,fromX:.75,label:'Target 目标'}},
  desc:{n:34,noise:0.7,seed:11,series:[{x:0,p:62},{x:.12,p:50},{x:.22,p:60},{x:.35,p:50},{x:.45,p:57},{x:.57,p:50},{x:.66,p:54},{x:.75,p:46},{x:.87,p:49.7},{x:1,p:49.5}],
    lines:[L([{x:.1,p:50},{x:.75,p:50}],'pline-neck'),L([{x:.22,p:60},{x:.66,p:53.6}],'pline-trend')],
    labels:[{x:.4,p:50,t:'Support 支撑',dy:14}],
    entry:{dir:'down',pad:1.3,back:2},target:{p:38,fromX:.75,label:'Target 目标'}},
  sym:{n:36,noise:0.7,seed:7,series:[{x:0,p:44},{x:.14,p:59},{x:.24,p:50},{x:.34,p:57},{x:.42,p:52},{x:.52,p:55.5},{x:.6,p:53.5},{x:.68,p:55},{x:.74,p:62},{x:.86,p:56.5},{x:1,p:56.8}],
    lines:[L([{x:.14,p:59},{x:.68,p:55}],'pline-trend'),L([{x:.24,p:50},{x:.6,p:53.5}],'pline-trend')],
    labels:[{x:.4,p:63,t:'Coil 收敛',c:C.gold}],
    entry:{dir:'up',pad:1.3,back:2},target:{p:68,fromX:.74,label:'Target 目标'}},
  bflag:{n:32,noise:0.45,seed:1,series:[{x:0,p:41},{x:.24,p:64},{x:.31,p:59},{x:.38,p:62.5},{x:.45,p:57.5},{x:.52,p:60.5},{x:.59,p:55.5},{x:.66,p:64},{x:.8,p:60.5},{x:1,p:61.5}],
    lines:[L([{x:.24,p:65},{x:.52,p:61.5}],'pline-trend'),L([{x:.31,p:57.8},{x:.59,p:54.3}],'pline-trend')],
    labels:[{x:.12,p:50,t:'Pole 旗杆',c:C.gold},{x:.45,p:64.5,t:'Flag 旗面'}],
    entry:{dir:'up',pad:1.4,back:2},target:{p:71,fromX:.66,label:'Measured move 量度'}},
  rflag:{n:32,noise:0.45,seed:10,series:[{x:0,p:64},{x:.24,p:41},{x:.31,p:46},{x:.38,p:42.5},{x:.45,p:47.5},{x:.52,p:44.5},{x:.59,p:49.5},{x:.66,p:41},{x:.8,p:44.5},{x:1,p:43.5}],
    lines:[L([{x:.31,p:47},{x:.59,p:50.5}],'pline-trend'),L([{x:.38,p:41.3},{x:.52,p:43.3}],'pline-trend')],
    labels:[{x:.12,p:55,t:'Pole 旗杆',c:C.gold,dy:14},{x:.45,p:41,t:'Flag 旗面',dy:14}],
    entry:{dir:'down',pad:1.4,back:2},target:{p:34,fromX:.66,label:'Measured move 量度'}},
  pen:{n:30,noise:0.4,seed:13,series:[{x:0,p:44},{x:.3,p:62},{x:.37,p:60},{x:.43,p:61.6},{x:.49,p:58.8},{x:.54,p:60},{x:.59,p:59.3},{x:.66,p:64.5},{x:.8,p:60.5},{x:1,p:61.5}],
    lines:[L([{x:.3,p:62.9},{x:.59,p:60.2}],'pline-trend'),L([{x:.37,p:59},{x:.59,p:58.4}],'pline-trend')],
    labels:[{x:.14,p:53,t:'Pole 旗杆',c:C.gold}],
    entry:{dir:'up',pad:1.4,back:2},target:{p:72,fromX:.66,label:'Measured move 量度'}},
  rect:{n:34,noise:0.6,seed:8,series:[{x:0,p:46},{x:.12,p:60},{x:.2,p:54},{x:.32,p:60},{x:.4,p:54},{x:.52,p:60},{x:.6,p:54},{x:.68,p:60},{x:.76,p:65},{x:.88,p:60.3},{x:1,p:60.6}],
    lines:[L([{x:.1,p:60},{x:.76,p:60}],'pline-neck'),L([{x:.12,p:54},{x:.68,p:54}],'pline-neck')],
    labels:[{x:.4,p:60,t:'Resistance'},{x:.4,p:54,t:'Support',dy:14}],
    entry:{dir:'up',pad:1.3,back:2},target:{p:66,fromX:.76,label:'Target 目标'}},
  rwedge:{n:32,noise:0.45,seed:6,series:[{x:0,p:46},{x:.12,p:54},{x:.19,p:50},{x:.29,p:57},{x:.37,p:54},{x:.47,p:59.5},{x:.55,p:57.5},{x:.63,p:61},{x:.7,p:55.5},{x:.82,p:58},{x:1,p:53.5}],
    lines:[L([{x:.12,p:54.9},{x:.63,p:61.9}],'pline-trend'),L([{x:.19,p:49},{x:.55,p:56.8}],'pline-trend')],
    labels:[{x:.34,p:63,t:'Rising Wedge 上升楔形',c:C.gold}],
    entry:{dir:'down',pad:1.4,back:2},target:{p:49,fromX:.7,label:'Target 目标'}},
  fwedge:{n:32,noise:0.45,seed:12,series:[{x:0,p:63},{x:.12,p:55},{x:.19,p:59},{x:.29,p:52},{x:.37,p:55},{x:.47,p:49.5},{x:.55,p:51.5},{x:.63,p:48},{x:.7,p:53.5},{x:.82,p:51},{x:1,p:56.5}],
    lines:[L([{x:.19,p:59.9},{x:.55,p:52.2}],'pline-trend'),L([{x:.12,p:54},{x:.63,p:47}],'pline-trend')],
    labels:[{x:.34,p:47,t:'Falling Wedge 下降楔形',c:C.gold,dy:14}],
    entry:{dir:'up',pad:1.4,back:2},target:{p:61,fromX:.7,label:'Target 目标'}},
  cup:{n:40,noise:0.55,seed:4,series:[{x:0,p:60},{x:.09,p:56},{x:.18,p:51},{x:.27,p:48},{x:.36,p:47.5},{x:.45,p:49},{x:.54,p:52},{x:.63,p:57},{x:.7,p:60},{x:.76,p:57},{x:.82,p:58.5},{x:.87,p:64},{x:.94,p:60.4},{x:1,p:60.8}],
    lines:[L([{x:.02,p:60},{x:.87,p:60}],'pline-neck')],
    labels:[{x:.36,p:47.5,t:'Cup 杯',dy:15},{x:.78,p:56.6,t:'Handle 柄',dy:14}],
    entry:{dir:'up',pad:1.3,back:2},target:{p:72,fromX:.87,label:'Target 目标'}}
};

// broken level per pattern (for breakout entry marker)
const NECK={dtop:54,dbot:54,hs:52,ihs:48,ttop:53.5,tbot:56.5,asc:60,desc:50,sym:55.5,bflag:59,rflag:47,pen:59.8,rect:60,rwedge:57,fwedge:51,cup:60};
function badge(svg,x,y,num,col,label,dy,delay){
  const g=el('g',{class:'mk'},svg);g.style.transitionDelay=delay+'s';
  el('circle',{cx:x,cy:y,r:8,fill:col,stroke:'#08080a','stroke-width':1.5,class:'mk-ring'},g);
  const t=el('text',{x:x,y:y+3.2,'text-anchor':'middle','font-family':"'JetBrains Mono',monospace",'font-weight':'700','font-size':'10'},g);
  t.setAttribute('fill','#08080a');t.textContent=num;
  if(label){const lt=el('text',{x:x,y:y+dy,'text-anchor':'middle','font-family':"'JetBrains Mono',monospace",'font-size':'9','font-weight':'600'},g);lt.setAttribute('fill',col);lt.textContent=label;}
}
function renderCandleChart(container){
  const spec=CHARTS[container.dataset.chart];if(!spec)return;
  const S=makeSeries(spec.series,Math.max(20,Math.round(spec.n*0.78)),spec.noise,spec.seed),n=S.length;
  const real=candlesFromSeries(S,spec.seed||7,spec.wick||0.95);
  const entry=spec.entry;
  const follow=entry?genFollow(real[n-1].c,entry.dir,3):[];
  const all=real.concat(follow);
  const W=720,H=372,padL=12,padR=96,padT=34,padB=30;
  const step=(W-padL-padR)/all.length,bodyW=Math.min(step*0.64,22);
  let vals=[];all.forEach(c=>{vals.push(c.h,c.l);});
  (spec.lines||[]).forEach(l=>l.pts.forEach(pt=>vals.push(pt.p)));
  if(entry)vals.push(real[n-1].c+entry.pad,real[n-1].c-entry.pad);
  if(spec.target)vals.push(spec.target.p);
  (spec.labels||[]).forEach(lb=>vals.push(lb.p));
  let mn=Math.min.apply(null,vals),mx=Math.max.apply(null,vals);const pd=(mx-mn)*0.1||1;mn-=pd;mx+=pd;
  const Xc=i=>padL+step*(i+0.5);
  const Y=p=>padT+(mx-p)/(mx-mn)*(H-padT-padB);
  const svg=el('svg',{viewBox:'0 0 '+W+' '+H,preserveAspectRatio:'xMidYMid meet',class:'pc-svg'});
  el('line',{x1:8,x2:W-8,y1:H-10,y2:H-10,class:'axis'},svg);
  // entry zone fill (behind)
  let ez=null;
  if(entry){const ep=real[n-1].c,x0=Xc(n-entry.back)-step/2,x1=W-padR;
    ez={x0:x0,x1:x1,yT:Y(ep+entry.pad),yB:Y(ep-entry.pad)};
    el('rect',{x:x0,y:ez.yT,width:x1-x0,height:ez.yB-ez.yT,rx:5,class:'entry-zone'},svg);}
  // candles
  all.forEach((c,i)=>{const isP=!!c.proj,cx=Xc(i);
    const g=el('g',{class:'cndl'+(isP?' proj':'')},svg);g.style.setProperty('--i',i);
    if(isP)g.style.setProperty('--pd',(n*60+420+(i-n)*300));
    const up=c.c>=c.o,cls=up?'bull':'bear';
    el('line',{x1:cx,x2:cx,y1:Y(c.h),y2:Y(c.l),class:'wick '+cls},g);
    const top=Y(Math.max(c.o,c.c)),bot=Y(Math.min(c.o,c.c));
    el('rect',{x:cx-bodyW/2,y:top,width:bodyW,height:Math.max(bot-top,2),rx:2.5,class:'body '+cls},g);});
  // pattern lines (on top)
  (spec.lines||[]).forEach(Ln=>{const pts=Ln.pts.map(pt=>[Xc(Math.round(pt.x*(n-1))),Y(pt.p)]);
    const a={d:pathFrom(pts),class:'pline '+(Ln.cls||'pline-trend')};if((Ln.cls||'pline-trend')==='pline-trend')a.pathLength=1;el('path',a,svg);});
  // breakout entry marker (1) — on the neckline OR the sloped trendline
  if(entry){const dir=entry.dir,key=container.dataset.chart,bl=BOLINE[key];
    const levelAt=xf=> bl!=null ? lineAt(spec.lines[bl],xf) : NECK[key];
    if(levelAt(0.5)!=null){
      let mi=Math.round(n*0.5),best=-1e9;
      for(let i=Math.round(n*0.5);i<n;i++){const lv=levelAt(i/(n-1));const ex=dir==='up'?S[i]-lv:lv-S[i];if(ex>best){best=ex;mi=i;}}
      let boI=mi;for(let i=mi;i>0;i--){const lv=levelAt(i/(n-1)),lp=levelAt((i-1)/(n-1));const bn=dir==='up'?S[i]>=lv:S[i]<=lv,bp=dir==='up'?S[i-1]>=lp:S[i-1]<=lp;if(bn&&!bp){boI=i;break;}}
      const boP=levelAt(boI/(n-1));
      if(bl!=null){const lp=spec.lines[bl].pts[spec.lines[bl].pts.length-1];
        el('line',{x1:Xc(Math.round(lp.x*(n-1))),y1:Y(lp.p),x2:Xc(boI),y2:Y(boP),class:'pline-neck'},svg);}
      badge(svg,Xc(boI),Y(boP),'1',C.gold,'Breakout 突破',dir==='up'?-13:18,1.0);}}
  // target line
  if(spec.target){const tp=spec.target.p,fx=Math.round((spec.target.fromX!=null?spec.target.fromX:0.55)*(n-1));
    el('line',{x1:Xc(fx),y1:Y(tp),x2:W-padR,y2:Y(tp),class:'pline-target'},svg);
    const tt=el('text',{x:W-padR+8,y:Y(tp)+3,class:'lvl-label plabel'},svg);tt.setAttribute('fill',C.cyan);tt.textContent=spec.target.label||'Target';}
  // entry box + retest entry marker (2)
  if(ez){el('rect',{x:ez.x0,y:ez.yT,width:ez.x1-ez.x0,height:ez.yB-ez.yT,rx:5,class:'entry-box'},svg);
    badge(svg,Xc(n-1),Y(real[n-1].c),'2',C.cyan,'Retest 回踩',entry.dir==='up'?18:-13,1.35);}
  // labels
  (spec.labels||[]).forEach(lb=>{const tt=el('text',{x:Xc(Math.round(lb.x*(n-1))),y:Y(lb.p)+(lb.dy||-10),'text-anchor':lb.anchor||'middle',class:'plabel'},svg);
    tt.setAttribute('fill',lb.c||C.muted);tt.textContent=lb.t;});
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
