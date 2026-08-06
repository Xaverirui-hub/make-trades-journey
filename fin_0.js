
document.getElementById('yr').textContent=new Date().getFullYear();
const RM=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const NS='http://www.w3.org/2000/svg';
const C={bull:'#2CD98A',bear:'#FF5C63',gold:'#E8C877',goldB:'#FCE9A8',goldD:'#C9A227',
         muted:'#9A968C',muted2:'#6f6c64',cyan:'#2FE0D6',text:'#EDEBE2'};
const MONO="'JetBrains Mono',monospace";

function el(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function txt(p,x,y,s,o){const t=el('text',Object.assign({x:x,y:y,'font-family':MONO,'font-size':11,fill:C.muted},o||{}),p);t.textContent=s;return t;}
function svgFor(box,w,h){const s=el('svg',{viewBox:'0 0 '+w+' '+h,preserveAspectRatio:'xMidYMid meet'});box.appendChild(s);return s;}

/* ============ Stochastic Oscillator charts ============ */

/* 1. MT5 sub-window: %K / %D */
function drawSTOMT5(box){
  const W=780,H=450,L=46,R=36,T=14,B=18;
  const s=svgFor(box,W,H);
  const pT=14,pH=196,oY0=252,oH=158;
  const cd=[[100,102,103,99],[102,101,104,100],[101,104,105,100],[104,103,106,102],
            [103,100,104,99],[100,98,101,97],[98,96,99,95],[96,98,100,95],
            [98,101,102,97],[101,104,105,100],[104,107,108,103],[107,106,109,105],
            [106,109,110,105],[109,112,113,108],[112,114,116,111],[114,116,117,113]];
  const n=cd.length,plotW=W-L-R,bw=plotW/n*0.62;
  const X=i=>L+plotW/n*(i+0.5);
  const Yp=v=>pT+pH-(v-90)/(117-90)*pH;
  const Yo=v=>oY0+oH-(v/100)*oH;
  el('rect',{x:L-6,y:pT-10,width:plotW+12,height:pH+16,rx:8,fill:'rgba(255,255,255,.014)',stroke:'rgba(232,200,119,.10)'},s);
  txt(s,L+plotW/2,pT+16,'PRICE  价格 — dips below the range, then reclaims it',{'text-anchor':'middle','font-size':9,fill:C.muted2,'letter-spacing':'.14em'});
  cd.forEach((k,i)=>{
    const g=el('g',{style:'--i:'+i,class:'cndl'},s);
    const up=k.c>=k.o, col=up?C.bull:C.bear, x=X(i);
    el('line',{x1:x,x2:x,y1:Yp(k[3]),y2:Yp(k[2]),class:'wick '+(up?'bull':'bear')},g);
    const y1=Yp(Math.max(k[0],k[1])),y2=Yp(Math.min(k[0],k[1]));
    el('rect',{x:x-bw/2,y:y1,width:bw,height:Math.max(y2-y1,2),rx:1.5,class:'body '+(up?'bull':'bear')},g);
  });
  el('rect',{x:L-6,y:oY0-10,width:plotW+12,height:oH+16,rx:8,fill:'rgba(255,255,255,.014)',stroke:'rgba(232,200,119,.10)'},s);
  [80,50,20].forEach(v=>{el('line',{x1:L,x2:L+plotW,y1:Yo(v),y2:Yo(v),class:'rgrid'},s);txt(s,L-8,Yo(v)+3.5,v,{'text-anchor':'end',class:'rax'});});
  el('rect',{x:L,y:Yo(80),width:plotW,height:Yo(0)-Yo(80),fill:'rgba(255,92,99,.05)'},s);
  el('rect',{x:L,y:Yo(20),width:plotW,height:Yo(20)-Yo(0),fill:'rgba(44,217,138,.05)'},s);
  const kArr=[55,48,62,58,38,22,8,15,32,48,63,58,68,78,85,82];
  const dArr=[55,52,55,56,53,39,23,15,18,32,48,56,63,68,77,82];
  const line=(arr,col,w,delay)=>{const pts=arr.map((v,i)=>[X(i),Yo(v)]);
    el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
      stroke:col,'stroke-width':w,'stroke-linecap':'round',class:'rline',style:'transition-delay:'+delay+'s'},s);};
  line(kArr,C.cyan,2,.15);line(dArr,C.gold,2.2,.3);
  const lg=el('g',{style:'--i:17'},s);
  el('line',{x1:L+250,y1:oY0+oH+22,x2:L+268,y2:oY0+oH+22,stroke:C.cyan,'stroke-width':2},lg);
  txt(lg,L+274,oY0+oH+26,'%K (5)',{'font-size':10,fill:C.cyan});
  el('line',{x1:L+330,y1:oY0+oH+22,x2:L+348,y2:oY0+oH+22,stroke:C.gold,'stroke-width':2.2},lg);
  txt(lg,L+354,oY0+oH+26,'%D (3)',{'font-size':10,fill:C.gold});
  txt(lg,L+430,oY0+oH+26,'Stochastic Oscillator (5,3,3) · MT5 sub-window',{'font-size':9.5,fill:C.muted2,'letter-spacing':'.14em'});
}

/* 2. overbought / oversold levels */
function drawSTOLevels(box){
  const W=780,H=340,L=46,R=24,T=26,B=34;
  const s=svgFor(box,W,H);
  const plotW=W-L-R,plotH=H-T-B;
  const X=i=>L+plotW/24*(i+0.5);
  const Y=v=>T+plotH-(v/100)*plotH;
  [80,50,20].forEach(v=>{el('line',{x1:L,x2:L+plotW,y1:Y(v),y2:Y(v),class:'rgrid'},s);txt(s,L-8,Y(v)+3.5,v,{'text-anchor':'end',class:'rax'});});
  el('rect',{x:L,y:Y(100),width:plotW,height:Y(80)-Y(100),fill:'rgba(255,92,99,.06)'},s);
  el('rect',{x:L,y:Y(20),width:plotW,height:Y(0)-Y(20),fill:'rgba(44,217,138,.06)'},s);
  txt(s,L+plotW/2,Y(80)-10,'OVERBOUGHT  超买区',{'text-anchor':'middle','font-size':9,fill:C.bear,'letter-spacing':'.18em','opacity':.75});
  txt(s,L+plotW/2,Y(20)+16,'OVERSOLD  超卖区',{'text-anchor':'middle','font-size':9,fill:C.bull,'letter-spacing':'.18em','opacity':.75});
  const kArr=[50,44,38,30,24,18,12,9,14,22,30,38,46,55,64,72,78,84,88,86,80,72,63,55];
  const dArr=[null,null,44,37.3,30.7,24,18,13,11.7,15,22,30,38,46.3,55,63.7,71.3,78,83.3,86,84.7,79.3,71.7,63.3];
  const line=(arr,col,w,delay)=>{const pts=arr.map((v,i)=>v==null?null:[X(i),Y(v)]).filter(Boolean);
    el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
      stroke:col,'stroke-width':w,'stroke-linecap':'round',class:'rline',style:'transition-delay:'+delay+'s'},s);};
  line(kArr,C.cyan,2,.1);line(dArr,C.gold,2,.25);
  const g1=el('g',{style:'--i:8'},s);
  el('circle',{cx:X(7),cy:Y(9),r:5,fill:C.bull,class:'rlbl'},g1);
  txt(g1,X(7),Y(9)+18,'%K 9 — oversold  超卖',{'text-anchor':'middle','font-size':10,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif"});
  const g2=el('g',{style:'--i:18'},s);
  el('circle',{cx:X(18),cy:Y(88),r:5,fill:C.bear,class:'rlbl'},g2);
  txt(g2,X(18),Y(88)-14,'%K 88 — overbought  超买',{'text-anchor':'middle','font-size':10,fill:C.bear,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L+plotW/2,H-8,'%K CYAN · %D GOLD — STRETCHED ZONES AT THE EDGES',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.18em'});
}

/* 3. golden cross (low) / death cross (high) */
function drawSTOCross(box){
  const W=780,H=360,L=46,R=24,T=22,B=26;
  const s=svgFor(box,W,H);
  const pw=(W-L-R-30)/2;
  const X0=(ox,i)=>ox+pw/10*(i+0.5);
  const Y=(v,oT)=>oT+150-(v/100)*150;
  const panel=(ox,title,zoneV,zoneCol,kArr,dArr,crossI,crossLvl,crossCol,crossTxt,arrowDir)=>{
    const oT=T+16;
    el('rect',{x:ox-6,y:oT-12,width:pw+12,height:174,rx:8,fill:'rgba(255,255,255,.014)',stroke:'rgba(232,200,119,.10)'},s);
    txt(s,ox+pw/2,oT+6,title,{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.14em'});
    [zoneV].forEach(v=>{el('line',{x1:ox,x2:ox+pw,y1:Y(v,oT),y2:Y(v,oT),class:'rgrid'},s);txt(s,ox-8,Y(v,oT)+3.5,v,{'text-anchor':'end',class:'rax'});});
    el('rect',{x:ox,y:zoneV>50?Y(100,oT):Y(20,oT),width:pw,height:zoneV>50?(Y(80,oT)-Y(100,oT)):(Y(20,oT)-Y(0,oT)),fill:zoneCol},s);
    const line=(arr,col,w,delay)=>{const pts=arr.map((v,i)=>v==null?null:[X0(ox,i),Y(v,oT)]).filter(Boolean);
      el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
        stroke:col,'stroke-width':w,'stroke-linecap':'round',class:'rline',style:'transition-delay:'+delay+'s'},s);};
    line(kArr,C.cyan,2,.1);line(dArr,C.gold,2,.25);
    el('line',{x1:X0(ox,crossI),x2:X0(ox,crossI),y1:Y(100,oT),y2:Y(0,oT),stroke:crossCol,'stroke-width':1,'stroke-dasharray':'3 4','opacity':.6,class:'rline'},s);
    const g=el('g',{style:'--i:10'},s);
    el('circle',{cx:X0(ox,crossI),cy:Y(crossLvl,oT),r:6,fill:'none',stroke:crossCol,'stroke-width':2.2,class:'rlbl'},g);
    el('path',{d:'M'+(X0(ox,crossI)+18)+','+(Y(crossLvl,oT)+ (arrowDir>0?22:-22))+' L'+(X0(ox,crossI)+18)+','+(Y(crossLvl,oT)+(arrowDir>0?2:-2)),
      stroke:crossCol,'stroke-width':2,'stroke-linecap':'round',class:'rline'},g);
    txt(g,X0(ox,crossI),Y(crossLvl,oT)+(arrowDir>0?-12:26),crossTxt,{'text-anchor':'middle','font-size':11,'font-weight':700,fill:crossCol,'font-family':"'Noto Sans SC',sans-serif"});
  };
  panel(L,'GOLDEN CROSS BELOW 20  低位金叉',20,'rgba(44,217,138,.07)',
    [55,42,30,20,12,8,10,18,28,40],[null,null,42.3,30.7,20.7,13.3,10,12,18.7,28.7],
    7,15,C.bull,'金叉 · BUY',1);
  panel(L+pw+30,'DEATH CROSS ABOVE 80  高位死叉',80,'rgba(255,92,99,.07)',
    [45,55,65,74,82,88,90,84,74,62],[null,null,55,64.7,73.7,81.3,86.7,87.3,82.7,73.3],
    7,85,C.bear,'死叉 · SELL',-1);
  txt(s,L+pw+15,H-6,'%K  CYAN · %D  GOLD   —  LOCATION DECIDES QUALITY',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.16em'});
}

/* 4. bearish divergence */
function drawSTODivergence(box){
  const W=780,H=440,L=46,R=24,T=16,B=20;
  const s=svgFor(box,W,H);
  const pT=16,pH=196,oY0=252,oH=158;
  const n=18,plotW=W-L-R;
  const X=i=>L+plotW*(i/(n-1));
  const Yp=v=>pT+pH-(v-74)/(108-74)*pH;
  const Yo=v=>oY0+oH-(v/100)*oH;
  el('rect',{x:L-6,y:pT-8,width:plotW+12,height:pH+14,rx:8,fill:'rgba(255,255,255,.014)',stroke:'rgba(232,200,119,.10)'},s);
  txt(s,L+plotW/2,pT+10,'PRICE  价格 — NEW HIGH 新高',{'text-anchor':'middle','font-size':9,fill:C.muted2,'letter-spacing':'.14em'});
  const price=[78,80,84,88,92,97,100,96,90,92,97,102,106,102,96,92,90,91];
  const kArr=[40,45,52,60,66,70,68,60,52,50,55,58,62,56,48,42,40,41];
  const dArr=[null,null,45.7,52.3,59.3,65.3,68,66,60,54,52.3,54.3,58.3,58.7,55.3,48.7,43.3,41];
  const poly=(arr,Xf,Yf,col,w,delay)=>{const pts=arr.map((v,i)=>[Xf(i),Yf(v)]);
    el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
      stroke:col,'stroke-width':w,'stroke-linecap':'round',class:'rline',style:'transition-delay:'+delay+'s'},s);};
  poly(price,X,Yp,C.text,2.2,.1);
  el('rect',{x:L-6,y:oY0-8,width:plotW+12,height:oH+14,rx:8,fill:'rgba(255,255,255,.014)',stroke:'rgba(232,200,119,.10)'},s);
  txt(s,L+plotW/2,oY0+10,'%K  随机指标 — LOWER HIGH 更低的高点',{'text-anchor':'middle','font-size':9,fill:C.muted2,'letter-spacing':'.14em','font-family':"'Noto Sans SC',sans-serif"});
  [80,50,20].forEach(v=>{el('line',{x1:L,x2:L+plotW,y1:Yo(v),y2:Yo(v),class:'rgrid'},s);txt(s,L-8,Yo(v)+3.5,v,{'text-anchor':'end',class:'rax'});});
  poly(dArr,X,Yo,C.gold,1.4,.35);
  poly(kArr,X,Yo,C.cyan,2.1,.2);
  [6,12].forEach(i=>el('line',{x1:X(i),x2:X(i),y1:pT,y2:Yo(0),stroke:'rgba(232,200,119,.22)','stroke-width':1,'stroke-dasharray':'3 5',class:'rline'},s));
  const tg1=el('g',{style:'--i:14'},s);
  el('line',{x1:X(6),y1:Yp(100),x2:X(12),y2:Yp(106),stroke:C.bull,'stroke-width':1.8,'stroke-dasharray':'5 4',class:'rline'},tg1);
  txt(tg1,(X(6)+X(12))/2,Yp(106)-10,'HIGHER HIGH 更高的高点',{'text-anchor':'middle','font-size':10,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif"});
  const tg2=el('g',{style:'--i:15'},s);
  el('line',{x1:X(5),y1:Yo(70),x2:X(12),y2:Yo(62),stroke:C.bear,'stroke-width':1.8,'stroke-dasharray':'5 4',class:'rline'},tg2);
  txt(tg2,(X(5)+X(12))/2,Yo(62)-10,'LOWER HIGH 更低的高点',{'text-anchor':'middle','font-size':10,fill:C.bear,'font-family':"'Noto Sans SC',sans-serif"});
  const g3=el('g',{style:'--i:16'},s);
  el('circle',{cx:X(6),cy:Yp(100),r:5,fill:C.bull,class:'rlbl'},g3);
  el('circle',{cx:X(12),cy:Yp(106),r:5,fill:C.bull,class:'rlbl'},g3);
  el('circle',{cx:X(5),cy:Yo(70),r:5,fill:C.bear,class:'rlbl'},g3);
  el('circle',{cx:X(12),cy:Yo(62),r:5,fill:C.bear,class:'rlbl'},g3);
  txt(s,L+plotW/2,H-6,'BEARISH DIVERGENCE  顶背离 — PRICE UP, %K DOWN',{'text-anchor':'middle','font-size':10,'font-weight':700,fill:C.bear,'letter-spacing':'.16em','font-family':"'Noto Sans SC',sans-serif"});
}

/* 5. fast vs slow */
function drawSTOSlow(box){
  const W=780,H=340,L=46,R=24,T=26,B=34;
  const s=svgFor(box,W,H);
  const plotW=W-L-R,plotH=H-T-B;
  const X=i=>L+plotW/22*(i+0.5);
  const Y=v=>T+plotH-(v/100)*plotH;
  [80,50,20].forEach(v=>{el('line',{x1:L,x2:L+plotW,y1:Y(v),y2:Y(v),class:'rgrid'},s);txt(s,L-8,Y(v)+3.5,v,{'text-anchor':'end',class:'rax'});});
  const fast=[45,60,52,48,70,55,40,62,48,38,58,66,50,72,60,46,64,52,42,60,70,58];
  const slow=[null,null,52.3,53.3,57.7,55,49,53.3,49.3,48,48,54,58,62.7,59.3,57.3,50.7,54,52.7,51.3,57.3,62.7];
  const line=(arr,col,w,delay,dash)=>{const pts=arr.map((v,i)=>v==null?null:[X(i),Y(v)]).filter(Boolean);
    el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
      stroke:col,'stroke-width':w,'stroke-linecap':'round','stroke-dasharray':dash||'none',class:'rline',style:'transition-delay:'+delay+'s'},s);};
  line(fast,C.cyan,1.6,.1,'2 3');
  line(slow,C.gold,2.6,.3);
  const g1=el('g',{style:'--i:12'},s);
  el('circle',{cx:X(13),cy:Y(72),r:5,fill:C.cyan,class:'rlbl'},g1);
  txt(g1,X(13),Y(72)-14,'FAST %K (5,1,3)  快速 — 毛刺多',{'text-anchor':'middle','font-size':10,fill:C.cyan,'font-family':"'Noto Sans SC',sans-serif"});
  const g2=el('g',{style:'--i:20'},s);
  el('circle',{cx:X(13),cy:Y(62.7),r:5,fill:C.gold,class:'rlbl'},g2);
  txt(g2,X(13),Y(62.7)+20,'SLOW %K (5,3,3)  慢速 — 更平滑',{'text-anchor':'middle','font-size':10,fill:C.gold,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L+plotW/2,H-8,'FAST JUMPS · SLOW FILTERS — SAME RULES, LESS NOISE',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.16em'});
}

/* 6. trend filter — buy dips in an uptrend */
function drawSTOTrend(box){
  const W=780,H=440,L=46,R=24,T=16,B=20;
  const s=svgFor(box,W,H);
  const pT=16,pH=196,oY0=252,oH=158;
  const n=18,plotW=W-L-R;
  const X=i=>L+plotW*(i/(n-1));
  const Yp=v=>pT+pH-(v-56)/(100-56)*pH;
  const Yo=v=>oY0+oH-(v/100)*oH;
  el('rect',{x:L-6,y:pT-8,width:plotW+12,height:pH+14,rx:8,fill:'rgba(255,255,255,.014)',stroke:'rgba(232,200,119,.10)'},s);
  txt(s,L+plotW/2,pT+10,'PRICE  价格 — UPTREND, HIGHER LOWS 上升趋势 · 更高的低点',{'text-anchor':'middle','font-size':9,fill:C.muted2,'letter-spacing':'.14em','font-family':"'Noto Sans SC',sans-serif"});
  const price=[60,64,70,66,62,68,76,80,84,80,75,82,90,94,98,93,88,95];
  const kArr=[50,55,62,58,48,40,45,55,65,60,50,44,52,62,70,64,56,60];
  const dArr=[null,null,55.7,58.3,56,50,44.3,46.7,55,60,58.3,54.7,48.7,49.3,56,61.3,63.3,60];
  const poly=(arr,Xf,Yf,col,w,delay)=>{const pts=arr.map((v,i)=>[Xf(i),Yf(v)]);
    el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
      stroke:col,'stroke-width':w,'stroke-linecap':'round',class:'rline',style:'transition-delay:'+delay+'s'},s);};
  poly(price,X,Yp,C.text,2.2,.1);
  const tg=el('g',{style:'--i:13'},s);
  el('line',{x1:X(4),y1:Yp(62),x2:X(16),y2:Yp(88),stroke:C.gold,'stroke-width':1.6,'stroke-dasharray':'6 4',class:'rline'},tg);
  txt(tg,X(16)+6,Yp(88)-6,'TRENDLINE 趋势线',{'font-size':9.5,fill:C.gold,'font-family':"'Noto Sans SC',sans-serif"});
  el('rect',{x:L-6,y:oY0-8,width:plotW+12,height:oH+14,rx:8,fill:'rgba(255,255,255,.014)',stroke:'rgba(232,200,119,.10)'},s);
  txt(s,L+plotW/2,oY0+10,'%K 随机指标 — DIPS STAY ABOVE 20 回调不破 20',{'text-anchor':'middle','font-size':9,fill:C.muted2,'letter-spacing':'.14em','font-family':"'Noto Sans SC',sans-serif"});
  [80,50,20].forEach(v=>{el('line',{x1:L,x2:L+plotW,y1:Yo(v),y2:Yo(v),class:'rgrid'},s);txt(s,L-8,Yo(v)+3.5,v,{'text-anchor':'end',class:'rax'});});
  poly(dArr,X,Yo,C.gold,1.4,.35);
  poly(kArr,X,Yo,C.cyan,2.1,.2);
  [6,12].forEach(i=>el('line',{x1:X(i),x2:X(i),y1:pT,y2:Yo(0),stroke:'rgba(232,200,119,.22)','stroke-width':1,'stroke-dasharray':'3 5',class:'rline'},s));
  [[6,45],[12,52]].forEach((p,i)=>{
    const g=el('g',{style:'--i:'+(14+i)},s);
    el('circle',{cx:X(p[0]),cy:Yo(p[1]),r:5,fill:C.bull,class:'rlbl'},g);
    txt(g,X(p[0]),Yo(p[1])+(i?20:-12),'BUY DIP 回调买入',{'text-anchor':'middle','font-size':10,'font-weight':700,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif"});
  });
  txt(s,L+plotW/2,H-6,'IN AN UPTREND, BUY THE TURN — NOT THE 20 LINE',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.16em'});
}

const RENDER={stoMT5:drawSTOMT5,stoLevels:drawSTOLevels,stoCross:drawSTOCross,stoDivergence:drawSTODivergence,stoSlow:drawSTOSlow,stoTrend:drawSTOTrend};
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

