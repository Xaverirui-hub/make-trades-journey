
document.getElementById('yr').textContent=new Date().getFullYear();
const RM=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const NS='http://www.w3.org/2000/svg';
const C={bull:'#2CD98A',bear:'#FF5C63',gold:'#E8C877',goldB:'#FCE9A8',goldD:'#C9A227',
         muted:'#9A968C',muted2:'#6f6c64',cyan:'#2FE0D6',text:'#EDEBE2'};
const MONO="'JetBrains Mono',monospace";

function el(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function txt(p,x,y,s,o){const t=el('text',Object.assign({x:x,y:y,'font-family':MONO,'font-size':11,fill:C.muted},o||{}),p);t.textContent=s;return t;}
function svgFor(box,w,h){const s=el('svg',{viewBox:'0 0 '+w+' '+h,preserveAspectRatio:'xMidYMid meet'});box.appendChild(s);return s;}

/* ============ MT5 MACD indicator charts ============ */
function genMACD(n,pf,ps,psig){
  const price=[];let v=100;
  for(let i=0;i<n;i++){
    v+=Math.sin(i*0.30)*0.8+Math.sin(i*0.13)*1.5+Math.sin(i*0.045+2)*2.2+(Math.random()-0.5)*0.35;
    price.push(v);
  }
  const ema=(arr,per)=>{const k=2/(per+1),out=[];let e=arr[0];arr.forEach(x=>{e=x*k+e*(1-k);out.push(e);});return out;};
  const ef=ema(price,pf),es=ema(price,ps);
  const macd=ef.map((e,i)=>e-es[i]);
  const sig=ema(macd,psig);
  return {price,macd,sig,hist:macd.map((m,i)=>m-sig[i])};
}
function pathFor(pts){return pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');}
function scaleFor(vals,padR){
  let mn=Math.min.apply(null,vals),mx=Math.max.apply(null,vals);
  const pad=(mx-mn)*padR;return {mn:mn-pad,mx:mx+pad};
}
function countCross(a,b){let c=0;for(let i=1;i<a.length;i++){if((a[i-1]-b[i-1])*(a[i]-b[i])<=0)c++;}return c;}

/* ============ 1. MT5 accessory-window layout ============ */
function drawMACDLayout(box){
  const W=720,H=300,L=34,R=24,T=30,B=26;
  const s=svgFor(box,W,H);
  const d=genMACD(60,12,26,9);
  const sc=scaleFor(d.macd.concat(d.sig).concat(d.hist),0.15);
  const plotW=W-L-R,plotH=H-T-B,n=d.macd.length;
  const X=i=>L+plotW*(i/(n-1));
  const Y=v=>T+(sc.mx-v)/(sc.mx-sc.mn)*plotH;
  const zeroY=Y(0);
  el('line',{x1:L,x2:L+plotW,y1:zeroY,y2:zeroY,stroke:C.muted2,'stroke-width':1.1,'stroke-dasharray':'6 4'},s);
  txt(s,L+4,zeroY-6,'0 · ZERO AXIS 零轴',{'font-size':9,fill:C.muted2,'letter-spacing':'.08em'});
  const bw=Math.max(plotW/n*0.6,2);
  d.hist.forEach((h,i)=>{
    const g=el('g',{style:'--i:'+Math.min(i,20)},s);
    const y=Y(Math.max(h,0));
    el('rect',{x:X(i)-bw/2,y:y,width:bw,height:Math.max(Math.abs(Y(h)-zeroY),1),rx:1,
      fill:h>=0?C.bull:C.bear,'fill-opacity':h>=0?.72:.66,class:'rbar'},g);
  });
  el('path',{d:pathFor(d.macd.map((v,i)=>[X(i),Y(v)])),stroke:C.gold,'stroke-width':2.2,class:'macdline'},s);
  el('path',{d:pathFor(d.sig.map((v,i)=>[X(i),Y(v)])),stroke:C.cyan,'stroke-width':1.7,class:'macdline',style:'transition-delay:.4s'},s);
  txt(s,L,16,'MACD (12, 26, 9)',{'font-size':11,fill:C.goldB,'font-weight':700,'letter-spacing':'.1em'});
  el('line',{x1:L+128,x2:L+146,y1:12,y2:12,stroke:C.gold,'stroke-width':2.4},s);
  txt(s,L+150,16,'MACD line',{'font-size':9,fill:C.muted});
  el('line',{x1:L+224,x2:L+242,y1:12,y2:12,stroke:C.cyan,'stroke-width':2.4},s);
  txt(s,L+246,16,'Signal',{'font-size':9,fill:C.muted});
  el('rect',{x:L+296,y:8,width:10,height:8,rx:2,fill:C.bull,'fill-opacity':.72},s);
  el('rect',{x:L+310,y:8,width:10,height:8,rx:2,fill:C.bear,'fill-opacity':.66},s);
  txt(s,L+324,16,'Histogram',{'font-size':9,fill:C.muted});
  txt(s,L+plotW/2,zeroY-14,'ABOVE ZERO = BULLS 零轴上方 = 多方控盘',{'text-anchor':'middle','font-size':9.5,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:23'});
  txt(s,L+plotW/2,zeroY+22,'BELOW ZERO = BEARS 零轴下方 = 空方控盘',{'text-anchor':'middle','font-size':9.5,fill:C.bear,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:24'});
}

/* ============ 2. formula chain ============ */
function drawMACDFormula(box){
  const W=720,H=216,L=14,T=14;
  const s=svgFor(box,W,H);
  const d=genMACD(30,12,26,9),n=d.macd.length;
  const sc=scaleFor(d.macd,0.18);
  const bx=[L,L+186,L+356],bw=[162,160,220],bh=150;
  const X=i=>bx[1]+30+bw[1]*0.62*(i/(n-1));
  const Y=v=>T+38+(sc.mx-v)/(sc.mx-sc.mn)*82;
  /* panel A: inputs */
  el('rect',{x:bx[0],y:T,width:bw[0],height:bh,rx:14,fill:'rgba(255,255,255,.016)',stroke:'rgba(232,200,119,.12)'},s);
  txt(s,bx[0]+16,T+20,'STEP 1 · 第一步',{'font-size':9.5,fill:C.goldD,'letter-spacing':'.18em'});
  el('rect',{x:bx[0]+16,y:T+36,width:12,height:12,rx:3,fill:C.gold,'fill-opacity':.85},s);
  txt(s,bx[0]+36,T+47,'EMA(12) 快线',{'font-size':11,fill:C.text,'font-family':"'Noto Sans SC',sans-serif"});
  el('rect',{x:bx[0]+16,y:T+60,width:12,height:12,rx:3,fill:C.muted,'fill-opacity':.8},s);
  txt(s,bx[0]+36,T+71,'EMA(26) 慢线',{'font-size':11,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,bx[0]+16,T+104,'FAST − SLOW',{'font-size':10,fill:C.muted2,'letter-spacing':'.1em'});
  txt(s,bx[0]+16,T+122,'快线减慢线',{'font-size':10,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,bx[0]+bw[0]/2,T+bh+12,'−',{'text-anchor':'middle','font-size':20,fill:C.goldB,'font-weight':700});
  /* panel B: MACD line sparkline */
  el('rect',{x:bx[1],y:T,width:bw[1],height:bh,rx:14,fill:'rgba(255,255,255,.016)',stroke:'rgba(232,200,119,.12)'},s);
  txt(s,bx[1]+16,T+20,'= MACD LINE 线',{'font-size':9.5,fill:C.gold,'letter-spacing':'.12em'});
  el('path',{d:pathFor(d.macd.map((v,i)=>[X(i),Y(v)])),stroke:C.gold,'stroke-width':2.2,class:'macdline'},s);
  el('line',{x1:bx[1]+30,x2:bx[1]+30+bw[1]*0.62,y1:Y(0),y2:Y(0),stroke:C.muted2,'stroke-width':1,'stroke-dasharray':'4 4'},s);
  txt(s,bx[1]+16,T+bh-16,'EMA12 − EMA26',{'font-size':10,fill:C.muted2});
  /* arrow */
  txt(s,bx[1]+bw[1]+6,T+bh/2,'→',{'font-size':20,fill:C.goldD,'font-weight':700});
  /* panel C: histogram bars */
  el('rect',{x:bx[2],y:T,width:bw[2],height:bh,rx:14,fill:'rgba(255,255,255,.016)',stroke:'rgba(232,200,119,.12)'},s);
  txt(s,bx[2]+16,T+20,'= HISTOGRAM 柱状图',{'font-size':9.5,fill:C.gold,'letter-spacing':'.12em'});
  const hsc=scaleFor(d.hist,0.2),hbw=bw[2]*0.6/30;
  const HX=i=>bx[2]+20+bw[2]*0.6*(i/(n-1));
  const HY=v=>T+44+(hsc.mx-v)/(hsc.mx-hsc.mn)*86;
  const hz=HY(0);
  el('line',{x1:bx[2]+20,x2:bx[2]+20+bw[2]*0.6,y1:hz,y2:hz,stroke:C.muted2,'stroke-width':1,'stroke-dasharray':'4 4'},s);
  d.hist.forEach((h,i)=>{
    const g=el('g',{style:'--i:'+Math.min(i,18)},s);
    const y=HY(Math.max(h,0));
    el('rect',{x:HX(i)-hbw/2,y:y,width:hbw,height:Math.max(Math.abs(HY(h)-hz),1),rx:1,
      fill:h>=0?C.bull:C.bear,'fill-opacity':h>=0?.72:.66,class:'rbar'},g);
  });
  txt(s,bx[2]+16,T+bh-16,'LINE − SIGNAL 线减信号',{'font-size':10,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,W/2,H-8,'Build order: line → signal → histogram. 顺序：先有线，再有信号，最后有柱。',
    {'text-anchor':'middle','font-size':10,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 3. golden / death cross ============ */
function drawMACDCross(box){
  const W=720,H=276,L=14,T=30,R=14,B=14;
  const s=svgFor(box,W,H);
  const gm=[-4.0,-3.6,-3.1,-2.6,-2.1,-1.6,-1.2,-0.9,-0.7,-0.55,-0.45,-0.35,-0.25,-0.12,0.0,0.2,0.5,0.85,1.2,1.6,2.0,2.4,2.7,2.9,3.0,2.9,2.7,2.4];
  const gs=[-2.5,-2.1,-1.7,-1.3,-1.0,-0.8,-0.65,-0.5,-0.35,-0.22,-0.12,-0.05,0.0,0.02,0.0,-0.05,-0.1,-0.05,0.1,0.35,0.7,1.1,1.5,1.9,2.3,2.6,2.7,2.55];
  const dm=gs.map(v=>-v),ds=gm.map(v=>-v);
  const pw=(W-L-R-12)/2,n=gm.length;
  function panel(px,title,ln,sg,verdict,col,arrowUp){
    const sc=scaleFor(ln.concat(sg),0.12);
    const plotW=pw-36,plotH=H-T-B-14;
    const X=i=>px+26+plotW*(i/(n-1));
    const Y=v=>T+8+(sc.mx-v)/(sc.mx-sc.mn)*plotH;
    const zeroY=Y(0);
    el('line',{x1:px+26,x2:px+26+plotW,y1:zeroY,y2:zeroY,stroke:C.muted2,'stroke-width':1,'stroke-dasharray':'5 4'},s);
    const diffs=ln.map((v,i)=>v-sg[i]);
    const bw=Math.max(plotW/n*0.62,1.5);
    diffs.forEach((h,i)=>{
      const g=el('g',{style:'--i:'+Math.min(i,16)},s);
      const y=Y(Math.max(h,0));
      el('rect',{x:X(i)-bw/2,y:y,width:bw,height:Math.max(Math.abs(Y(h)-zeroY),1),rx:1,
        fill:h>=0?C.bull:C.bear,'fill-opacity':h>=0?.68:.62,class:'rbar'},g);
    });
    el('path',{d:pathFor(ln.map((v,i)=>[X(i),Y(v)])),stroke:C.gold,'stroke-width':2.2,class:'macdline'},s);
    el('path',{d:pathFor(sg.map((v,i)=>[X(i),Y(v)])),stroke:C.cyan,'stroke-width':1.7,class:'macdline',style:'transition-delay:.35s'},s);
    let ci=-1;
    for(let i=1;i<n;i++){const a=diffs[i-1],b=diffs[i];if(a*b<=0){ci=i;break;}}
    const cxp=X(ci),cyp=Y(ln[ci]);
    el('line',{x1:cxp,x2:cxp,y1:Y(sc.mx),y2:Y(sc.mn),stroke:col,'stroke-width':1.1,'stroke-dasharray':'3 3',class:'rlbl',style:'--i:20'},s);
    const cg=el('g',{style:'--i:21'},s);
    el('circle',{cx:cxp,cy:cyp,r:6,fill:col,'fill-opacity':.25,stroke:col,'stroke-width':2,class:'rlbl'},cg);
    el('path',{d:arrowUp?'M'+cxp+' '+(cyp+16)+' l-6 -9 M'+cxp+' '+(cyp+16)+' l6 -9':'M'+cxp+' '+(cyp-16)+' l-6 9 M'+cxp+' '+(cyp-16)+' l6 9',
      stroke:col,'stroke-width':2.2,'fill':'none','stroke-linecap':'round',class:'rlbl',style:'--i:22'},cg);
    txt(s,px+26+plotW/2,T+plotH+22,title,{'text-anchor':'middle','font-size':10.5,fill:col,'font-weight':700,'letter-spacing':'.14em'});
    txt(s,px+26+plotW/2,T+plotH+37,verdict,{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
    txt(s,px+26+plotW/2,T-2,'LINE 线 / SIGNAL 信号',{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'letter-spacing':'.12em'});
  }
  panel(L,'GOLDEN CROSS 金叉','momentum turning up 动能转强','bull',true);
  panel(L+pw+12,'DEATH CROSS 死叉','momentum turning down 动能转弱','bear',false);
}

/* ============ 4. histogram contraction ============ */
function drawMACDHist(box){
  const W=720,H=262,L=30,R=24,T=28,B=24;
  const s=svgFor(box,W,H);
  const hist=[0.1,0.25,0.5,0.8,1.2,1.6,2.0,2.35,2.6,2.75,2.8,2.75,2.6,2.4,2.15,1.85,1.55,1.25,0.95,0.7,0.5,0.35,0.25,0.18,0.14,0.1,0.05,0.0,-0.1,-0.3,-0.55,-0.8,-1.0,-1.05,-0.95,-0.75,-0.5,-0.3,-0.15,-0.05,0.0,0.05,0.1,0.12];
  const macd=[-3.6,-3.4,-3.1,-2.7,-2.2,-1.7,-1.2,-0.7,-0.3,0.05,0.35,0.6,0.85,1.1,1.35,1.6,1.85,2.1,2.3,2.5,2.7,2.85,3.0,3.15,3.3,3.4,3.5,3.58,3.62,3.6,3.55,3.48,3.4,3.3,3.2,3.1,3.0,2.9,2.82,2.75,2.7,2.66,2.63,2.6];
  const sig=macd.map((m,i)=>m-hist[i]);
  const n=hist.length;
  const sc=scaleFor(macd.concat(sig),0.12);
  const plotW=W-L-R,plotH=H-T-B;
  const X=i=>L+plotW*(i/(n-1));
  const Y=v=>T+(sc.mx-v)/(sc.mx-sc.mn)*plotH;
  const zeroY=Y(0);
  const peak=10,crossIdx=27;
  el('rect',{x:X(peak),y:T,width:X(crossIdx)-X(peak),height:plotH,fill:'rgba(255,92,99,.05)',class:'rbar',style:'--i:2'},s);
  const bw=Math.max(plotW/n*0.6,2);
  hist.forEach((h,i)=>{
    const g=el('g',{style:'--i:'+Math.min(i,20)},s);
    const y=Y(Math.max(h,0));
    el('rect',{x:X(i)-bw/2,y:y,width:bw,height:Math.max(Math.abs(Y(h)-zeroY),1),rx:1,
      fill:h>=0?C.bull:C.bear,'fill-opacity':h>=0?.7:.64,class:'rbar'},g);
  });
  el('path',{d:pathFor(macd.map((v,i)=>[X(i),Y(v)])),stroke:C.gold,'stroke-width':2.2,class:'macdline'},s);
  el('path',{d:pathFor(sig.map((v,i)=>[X(i),Y(v)])),stroke:C.cyan,'stroke-width':1.7,class:'macdline',style:'transition-delay:.4s'},s);
  el('line',{x1:L,x2:L+plotW,y1:zeroY,y2:zeroY,stroke:C.muted2,'stroke-width':1,'stroke-dasharray':'6 4'},s);
  /* peak marker */
  el('line',{x1:X(peak),x2:X(peak),y1:T,y2:T+plotH,stroke:C.gold,'stroke-width':1.1,'stroke-dasharray':'3 3',class:'rlbl',style:'--i:22'},s);
  txt(s,X(peak),T+16,'PEAK 动能顶峰',{'text-anchor':'middle','font-size':9.5,fill:C.goldB,'font-weight':700,class:'rlbl',style:'--i:22'});
  txt(s,(X(peak)+X(crossIdx))/2,T+34,'MOMENTUM DECAY 动能衰减区',{'text-anchor':'middle','font-size':9.5,fill:C.bear,'font-weight':700,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:23'});
  txt(s,X(crossIdx),zeroY-12,'CROSS 交叉',{'text-anchor':'middle','font-size':9.5,fill:C.cyan,'font-weight':700,class:'rlbl',style:'--i:24'});
  txt(s,L+plotW/2,H-6,'Bars shrink toward zero before the lines cross — momentum dies first. 柱子先朝零收缩，线才交叉——动能先熄火。',
    {'text-anchor':'middle','font-size':10,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 5. zero line zones ============ */
function drawMACDZero(box){
  const W=720,H=250,L=30,R=24,T=30,B=24;
  const s=svgFor(box,W,H);
  const z=[-3.2,-3.0,-2.8,-2.5,-2.2,-1.9,-1.6,-1.35,-1.1,-0.9,-0.7,-0.55,-0.42,-0.3,-0.2,-0.12,-0.05,0.04,0.14,0.26,0.4,0.58,0.78,1.0,1.24,1.5,1.75,2.0,2.25,2.5,2.7,2.85,2.95,3.0,3.0,2.95,2.85,2.7,2.55,2.4];
  const n=z.length;
  const sc=scaleFor(z,0.12);
  const plotW=W-L-R,plotH=H-T-B;
  const X=i=>L+plotW*(i/(n-1));
  const Y=v=>T+(sc.mx-v)/(sc.mx-sc.mn)*plotH;
  const zeroY=Y(0);
  el('rect',{x:L,y:T,width:plotW,height:zeroY-T,fill:'rgba(44,217,138,.05)'},s);
  el('rect',{x:L,y:zeroY,width:plotW,height:T+plotH-zeroY,fill:'rgba(255,92,99,.05)'},s);
  el('line',{x1:L,x2:L+plotW,y1:zeroY,y2:zeroY,stroke:C.goldB,'stroke-width':1.6},s);
  txt(s,L+8,T+14,'BULLS IN CONTROL 多方控盘',{'font-size':10,fill:C.bull,'font-weight':700,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:2'});
  txt(s,L+8,T+plotH-6,'BEARS IN CONTROL 空方控盘',{'font-size':10,fill:C.bear,'font-weight':700,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:3'});
  /* small bars consistent with line sign */
  const bw=Math.max(plotW/n*0.55,2);
  z.forEach((v,i)=>{
    const g=el('g',{style:'--i:'+Math.min(i,18)},s);
    const hv=v*0.16;
    const y=Y(Math.max(hv,0));
    el('rect',{x:X(i)-bw/2,y:y,width:bw,height:Math.max(Math.abs(Y(hv)-zeroY),1),rx:1,
      fill:hv>=0?C.bull:C.bear,'fill-opacity':hv>=0?.5:.45,class:'rbar'},g);
  });
  el('path',{d:pathFor(z.map((v,i)=>[X(i),Y(v)])),stroke:C.gold,'stroke-width':2.2,class:'macdline'},s);
  /* zero cross marker */
  let zi=-1;for(let i=1;i<n;i++){if(z[i-1]*z[i]<=0){zi=i;break;}}
  el('line',{x1:X(zi),x2:X(zi),y1:T,y2:T+plotH,stroke:C.gold,'stroke-width':1.1,'stroke-dasharray':'3 3',class:'rlbl',style:'--i:20'},s);
  const cg=el('g',{style:'--i:21'},s);
  el('circle',{cx:X(zi),cy:zeroY,r:6,fill:C.goldB,'fill-opacity':.25,stroke:C.goldB,'stroke-width':2,class:'rlbl'},cg);
  txt(s,X(zi),zeroY-12,'ZERO CROSS 上穿零轴',{'text-anchor':'middle','font-size':9.5,fill:C.goldB,'font-weight':700,class:'rlbl',style:'--i:22'});
  txt(s,L+plotW/2,H-6,'Zero is the border: line above = net buyers, below = net sellers. 零轴是分界线：线在上方=净买方，在下方=净卖方。',
    {'text-anchor':'middle','font-size':10,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 6. divergence ============ */
function drawMACDDiv(box){
  const W=720,H=330,L=14,T=26,R=14,B=10;
  const s=svgFor(box,W,H);
  const pw=(W-L-R-12)/2;
  const px=[100,101,102.5,103,102,101.5,102,103.5,104,104.8,105.2,104.5,103.8,104.2,105.3,106,106.4];
  const mx=[0.5,0.9,1.4,1.7,1.5,1.2,1.0,1.3,1.6,1.9,2.2,1.8,1.4,1.2,1.5,1.75,1.6];
  const py=[100,99,98,97.5,98,98.5,97.8,96.8,96,95.5,96,96.6,95.8,94.9,94.2,93.8];
  const my=[0,-0.4,-1.0,-1.8,-1.6,-1.2,-0.95,-1.1,-1.35,-1.5,-1.55,-1.35,-1.2,-1.35,-1.5,-1.5];
  function panel(x,price,macd,title,zh,verdict,ph1,ph2,mh1,mh2,up){
    el('rect',{x:x,y:T,width:pw,height:H-T-B,rx:14,fill:'rgba(255,255,255,.016)',stroke:'rgba(232,200,119,.12)'},s);
    txt(s,x+16,T+18,title,{'font-size':10.5,fill:C.text,'font-weight':700,'letter-spacing':'.12em'});
    txt(s,x+16,T+33,zh,{'font-size':9.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
    /* price plot */
    const psc=scaleFor(price,0.08);
    const X=i=>x+18+pw*0.5*(i/(price.length-1));
    const PY=v=>T+52+(psc.mx-v)/(psc.mx-psc.mn)*74;
    el('path',{d:pathFor(price.map((v,i)=>[X(i),PY(v)])),stroke:C.text,'stroke-width':2,class:'macdline'},s);
    el('line',{x1:X(ph1),x2:X(ph2),y1:PY(price[ph1]),y2:PY(price[ph2]),stroke:C.text,'stroke-width':1.1,'stroke-dasharray':'4 4','stroke-opacity':.6,class:'rlbl',style:'--i:8'},s);
    [ph1,ph2].forEach((hi,i)=>{
      const g=el('g',{style:'--i:'+(9+i)},s);
      el('circle',{cx:X(hi),cy:PY(price[hi]),r:4.5,fill:C.text,class:'rlbl'},g);
      txt(g,X(hi),PY(price[hi])+(up?-12:16),up?(i?'HH 更高高点':'H1'):(i?'LL 更低低点':'L1'),
        {'text-anchor':'middle','font-size':8.5,fill:C.text,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
    });
    txt(s,x+pw*0.25,T+140,'PRICE 价格',{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'letter-spacing':'.12em'});
    /* macd plot */
    const msc=scaleFor(macd,0.12);
    const MX=i=>x+18+pw*0.5*(i/(macd.length-1));
    const MY=v=>T+152+(msc.mx-v)/(msc.mx-msc.mn)*74;
    el('line',{x1:x+18,x2:x+18+pw*0.5,y1:MY(0),y2:MY(0),stroke:C.muted2,'stroke-width':1,'stroke-dasharray':'5 4'},s);
    el('path',{d:pathFor(macd.map((v,i)=>[MX(i),MY(v)])),stroke:C.gold,'stroke-width':2,class:'macdline'},s);
    el('line',{x1:MX(mh1),x2:MX(mh2),y1:MY(macd[mh1]),y2:MY(macd[mh2]),stroke:C.gold,'stroke-width':1.1,'stroke-dasharray':'4 4','stroke-opacity':.6,class:'rlbl',style:'--i:10'},s);
    [mh1,mh2].forEach((hi,i)=>{
      const g=el('g',{style:'--i:'+(11+i)},s);
      el('circle',{cx:MX(hi),cy:MY(macd[hi]),r:4.5,fill:C.gold,class:'rlbl'},g);
      txt(g,MX(hi),MY(macd[hi])+(up?-12:16),up?(i?'LH 更低高点':'M1'):(i?'HL 更高低点':'M1'),
        {'text-anchor':'middle','font-size':8.5,fill:C.gold,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
    });
    txt(s,x+pw*0.25,T+240,'MACD',{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'letter-spacing':'.12em'});
    const tag=el('g',{style:'--i:13'},s);
    el('rect',{x:x+16,y:T+252,width:pw-32,height:34,rx:9,fill:up?'rgba(255,92,99,.09)':'rgba(44,217,138,.09)',
      stroke:up?'rgba(255,92,99,.4)':'rgba(44,217,138,.4)',class:'rlbl'},tag);
    txt(s,x+pw/2,T+265,verdict,{'text-anchor':'middle','font-size':10.5,fill:up?C.bear:C.bull,'font-weight':700,class:'rlbl'});
    txt(s,x+pw/2,T+280,up?'WARNING · NOT A TRIGGER 预警 · 不是触发':'WARNING · NOT A TRIGGER 预警 · 不是触发',
      {'text-anchor':'middle','font-size':8.5,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  }
  panel(L,px,mx,'TOP DIVERGENCE 顶背离','price HH + MACD LH 价格更高高点 · MACD 更低高点','PRICE HIGHER HIGH, MACD LOWER HIGH 价格新高，动能不新高',10,16,10,16,true);
  panel(L+pw+12,py,my,'BOTTOM DIVERGENCE 底背离','price LL + MACD HL 价格更低低点 · MACD 更高低点','PRICE LOWER LOW, MACD HIGHER LOW 价格新低，动能不新低',3,15,3,15,false);
}

/* ============ 7. parameter comparison ============ */
function drawMACDParams(box){
  const W=720,H=252,L=30,R=20,T=28,B=26;
  const s=svgFor(box,W,H);
  const d1=genMACD(50,12,26,9),d2=genMACD(50,5,35,5);
  const c1=countCross(d1.macd,d1.sig),c2=countCross(d2.macd,d2.sig);
  const sc=scaleFor(d1.macd.concat(d2.macd),0.15);
  const plotW=W-L-R,plotH=H-T-B,n=d1.macd.length;
  const X=i=>L+plotW*(i/(n-1));
  const Y=v=>T+(sc.mx-v)/(sc.mx-sc.mn)*plotH;
  const zeroY=Y(0);
  el('line',{x1:L,x2:L+plotW,y1:zeroY,y2:zeroY,stroke:C.muted2,'stroke-width':1,'stroke-dasharray':'6 4'},s);
  el('path',{d:pathFor(d1.macd.map((v,i)=>[X(i),Y(v)])),stroke:C.gold,'stroke-width':2.4,class:'macdline'},s);
  el('path',{d:pathFor(d2.macd.map((v,i)=>[X(i),Y(v)])),stroke:C.cyan,'stroke-width':1.5,class:'macdline',style:'transition-delay:.35s'},s);
  /* cross markers on the fast line */
  d2.macd.forEach((v,i)=>{
    if(i>0&&(d2.macd[i-1]-d2.sig[i-1])*(v-d2.sig[i])<=0){
      const g=el('g',{style:'--i:18'},s);
      el('circle',{cx:X(i),cy:Y(v),r:3,fill:C.cyan,'fill-opacity':.9,class:'rlbl'},g);
    }
  });
  txt(s,L,16,'DEFAULT 默认 12/26/9',{'font-size':10.5,fill:C.gold,'font-weight':700,'letter-spacing':'.08em'});
  el('line',{x1:L+150,x2:L+168,y1:12,y2:12,stroke:C.gold,'stroke-width':2.4},s);
  txt(s,L+172,16,c1+' crosses 次交叉',{'font-size':9.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L+286,16,'FAST 快速 5/35/5',{'font-size':10.5,fill:C.cyan,'font-weight':700,'letter-spacing':'.08em'});
  el('line',{x1:L+410,x2:L+428,y1:12,y2:12,stroke:C.cyan,'stroke-width':2.4},s);
  txt(s,L+432,16,c2+' crosses 次交叉 · dots=每叉',{'font-size':9.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L+plotW/2,H-8,'Same market, two settings — smaller periods cross more and earlier. 同一段行情、两套参数——周期越小交叉越多越早。',
    {'text-anchor':'middle','font-size':10,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 8. trend vs range ============ */
function drawMACDTrend(box){
  const W=720,H=320,L=14,T=26,R=14,B=10;
  const s=svgFor(box,W,H);
  const pw=(W-L-R-12)/2;
  function panel(x,title,zh,price,macd,trendLine){
    el('rect',{x:x,y:T,width:pw,height:H-T-B,rx:14,fill:'rgba(255,255,255,.016)',stroke:'rgba(232,200,119,.12)'},s);
    txt(s,x+16,T+18,title,{'font-size':10.5,fill:C.text,'font-weight':700,'letter-spacing':'.1em'});
    txt(s,x+16,T+33,zh,{'font-size':9.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
    const n=price.length;
    const psc=scaleFor(price,0.08);
    const X=i=>x+18+pw*0.58*(i/(n-1));
    const PY=v=>T+52+(psc.mx-v)/(psc.mx-psc.mn)*72;
    el('path',{d:pathFor(price.map((v,i)=>[X(i),PY(v)])),stroke:C.text,'stroke-width':2,class:'macdline'},s);
    if(trendLine){
      el('line',{x1:X(0),y1:PY(price[0]),x2:X(n-1),y2:PY(price[n-1]),stroke:C.gold,'stroke-width':1.4,'stroke-dasharray':'6 4','stroke-opacity':.8,class:'rlbl',style:'--i:6'},s);
    }
    txt(s,x+pw*0.29,T+134,'PRICE 价格',{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'letter-spacing':'.12em'});
    const msc=scaleFor(macd,0.15);
    const MX=i=>x+18+pw*0.58*(i/(n-1));
    const MY=v=>T+150+(msc.mx-v)/(msc.mx-msc.mn)*76;
    el('line',{x1:x+18,x2:x+18+pw*0.58,y1:MY(0),y2:MY(0),stroke:C.muted2,'stroke-width':1,'stroke-dasharray':'5 4'},s);
    el('path',{d:pathFor(macd.map((v,i)=>[MX(i),MY(v)])),stroke:C.gold,'stroke-width':2,class:'macdline'},s);
    return {X:MX,Y:MY,baseY:MY(0)};
  }
  /* left: uptrend */
  const upP=[100,101,100.5,102,103,102.5,104,105.5,105,106,107.5,108,107.5,109,110.5,112];
  const upM=[-1.2,-1.0,-0.8,-0.6,-0.4,-0.2,0.05,0.3,0.6,0.9,1.2,1.5,1.8,2.1,2.4,2.7];
  const upS=upM.map((v,i)=>v+[0.6,0.55,0.5,0.45,0.4,0.35,0.3,0.25,0.2,0.15,0.1,0.05,0.0,-0.05,-0.1,-0.15][i]);
  const A=panel(L,'UPTREND + GOLDEN CROSS 上升趋势 + 金叉','顺趋势回踩 · 零轴上方金叉',upP,upM,true);
  const upn=upM.length;
  const upX=i=>L+18+pw*0.58*(i/(upn-1));
  const upSc=scaleFor(upM,0.15);
  const upY=v=>T+150+(upSc.mx-v)/(upSc.mx-upSc.mn)*76;
  let ui=-1;for(let i=1;i<upn;i++){if((upM[i-1]-upS[i-1])*(upM[i]-upS[i])<=0){ui=i;break;}}
  el('path',{d:pathFor(upS.map((v,i)=>[upX(i),upY(v)])),stroke:C.cyan,'stroke-width':1.6,class:'macdline',style:'transition-delay:.4s'},s);
  const ug=el('g',{style:'--i:14'},s);
  el('circle',{cx:upX(ui),cy:upY(upM[ui]),r:5,fill:C.bull,'fill-opacity':.3,stroke:C.bull,'stroke-width':2,class:'rlbl'},ug);
  txt(s,upX(ui),upY(upM[ui])-12,'✓',{'text-anchor':'middle','font-size':14,fill:C.bull,'font-weight':700,class:'rlbl'});
  txt(s,L+pw/2,T+272,'VALID — WITH THE TREND 顺势有效',{'text-anchor':'middle','font-size':10,fill:C.bull,'font-weight':700,'letter-spacing':'.08em',class:'rlbl',style:'--i:15'});
  txt(s,L+pw/2,T+288,'golden cross above zero 零轴上方金叉',{'text-anchor':'middle','font-size':9,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:15'});
  /* right: range */
  const rP=[100,101,99.5,100.8,99.2,101.2,99,100.6,99.4,101,99.3,100.8,99.5,101.1,99.4,100.5];
  const rM=[-0.6,0.2,-0.4,0.5,-0.3,0.4,-0.5,0.3,-0.2,0.4,-0.4,0.3,-0.5,0.4,-0.3,0.2];
  const rS=rM.map(v=>v-0.15);
  const Bx=L+pw+12;
  const RB=panel(Bx,'RANGE + CROSSES 震荡区间 + 交叉','横盘来回摆 · 假信号工厂',rP,rM,false);
  const rn=rM.length;
  const rX=i=>Bx+18+pw*0.58*(i/(rn-1));
  const rSc=scaleFor(rM,0.15);
  const rY=v=>T+150+(rSc.mx-v)/(rSc.mx-rSc.mn)*76;
  el('path',{d:pathFor(rS.map((v,i)=>[rX(i),rY(v)])),stroke:C.cyan,'stroke-width':1.6,class:'macdline',style:'transition-delay:.4s'},s);
  let rc=0;
  for(let i=1;i<rn;i++){if((rM[i-1]-rS[i-1])*(rM[i]-rS[i])<=0){
    rc++;
    const g=el('g',{style:'--i:16'},s);
    const cx=rX(i),cy=rY(rM[i]);
    el('path',{d:'M'+(cx-4)+' '+(cy-4)+' l8 8 M'+(cx+4)+' '+(cy-4)+' l-8 8',stroke:C.bear,'stroke-width':1.6,'stroke-linecap':'round',class:'rlbl'},g);
  }}
  txt(s,Bx+pw/2,T+272,'FALSE — '+rc+' CROSSES, ALL NOISE 假信号 ×'+rc,{'text-anchor':'middle','font-size':10,fill:C.bear,'font-weight':700,'letter-spacing':'.08em',class:'rlbl',style:'--i:17'});
  txt(s,Bx+pw/2,T+288,'crosses in a range are noise 震荡里的交叉全是噪音',{'text-anchor':'middle','font-size':9,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:17'});
}

const RENDER={macdlayout:drawMACDLayout,macdformula:drawMACDFormula,macdcross:drawMACDCross,
              macdhist:drawMACDHist,macdzero:drawMACDZero,macddiv:drawMACDDiv,
              macdparams:drawMACDParams,macdtrend:drawMACDTrend};
document.querySelectorAll('.rchart[data-r]').forEach(b=>{const f=RENDER[b.dataset.r];if(f)f(b);});

/* scaleX bars need their own keyframe since .rbar uses scaleY */
const styleFix=document.createElement('style');
styleFix.textContent='.in .rbar[style*="scaleX"]{transform:scaleX(1)!important;} .macdline{fill:none;stroke-width:2;stroke-dasharray:3600;stroke-dashoffset:3600;transition:stroke-dashoffset 1.6s cubic-bezier(.3,.7,.3,1) .2s;} .in .macdline{stroke-dashoffset:0;}';
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

