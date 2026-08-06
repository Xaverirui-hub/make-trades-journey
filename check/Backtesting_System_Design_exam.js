
document.getElementById('yr').textContent=new Date().getFullYear();
const RM=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const NS='http://www.w3.org/2000/svg';
const C={bull:'#2CD98A',bear:'#FF5C63',gold:'#E8C877',goldB:'#FCE9A8',goldD:'#C9A227',
         muted:'#9A968C',muted2:'#6f6c64',cyan:'#2FE0D6',text:'#EDEBE2'};
const MONO="'JetBrains Mono',monospace";

function el(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function txt(p,x,y,s,o){const t=el('text',Object.assign({x:x,y:y,'font-family':MONO,'font-size':11,fill:C.muted},o||{}),p);t.textContent=s;return t;}
function svgFor(box,w,h){const s=el('svg',{viewBox:'0 0 '+w+' '+h,preserveAspectRatio:'xMidYMid meet'});box.appendChild(s);return s;}

/* ============ 1. edge vs luck equity curves ============ */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function niceStep(raw){const p=Math.pow(10,Math.floor(Math.log10(raw)));const r=raw/p;return (r<1.5?1:r<3?2:r<7?5:10)*p;}

function drawEquityCurve(box){
  const W=720,H=340,L=52,R=140,T=30,B=46;
  const s=svgFor(box,W,H);
  const N=200,rnd=mulberry32(20260806);
  const edge=[0],luck=[0];
  for(let i=1;i<=N;i++){
    edge.push(edge[i-1]+(rnd()<0.55?1.2:-1.0));
    luck.push(luck[i-1]+(rnd()<0.5?1.0:-1.0));
  }
  let mn=Infinity,mx=-Infinity;
  edge.concat(luck).forEach(v=>{mn=Math.min(mn,v);mx=Math.max(mx,v);});
  const pad=(mx-mn)*0.12;mn-=pad;mx+=pad;
  const plotW=W-L-R,plotH=H-T-B;
  const X=i=>L+plotW*(i/N);
  const Y=v=>T+(mx-v)/(mx-mn)*plotH;
  const step=niceStep((mx-mn)/4);
  for(let g=Math.ceil(mn/step)*step;g<mx;g+=step){
    el('line',{x1:L,x2:L+plotW,y1:Y(g),y2:Y(g),class:'rgrid'},s);
    txt(s,L-8,Y(g)+3.5,(g>0?'+':'')+g.toFixed(0)+'R',{'text-anchor':'end',class:'rax'});
  }
  [0,50,100,150,200].forEach(n=>txt(s,X(n),T+plotH+18,n,{'text-anchor':'middle','font-size':10,fill:C.muted2}));
  /* shaded first-30 band: where edge and luck are indistinguishable */
  const band=el('g',{style:'--i:0'},s);
  el('rect',{x:L,y:T,width:X(30)-L,height:plotH,fill:'rgba(232,200,119,.05)',stroke:'rgba(232,200,119,.25)','stroke-dasharray':'4 4'},band);
  txt(band,L+(X(30)-L)/2,T+16,'FIRST 30 — IDENTICAL 前30笔：看不出区别',{'text-anchor':'middle','font-size':9,fill:C.gold,'font-family':"'Noto Sans SC',sans-serif"});
  /* luck line */
  const lp=luck.map((v,i)=>[X(i),Y(v)]);
  el('path',{d:lp.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
    stroke:C.cyan,'stroke-opacity':.65,'stroke-width':1.8,class:'rline'},s);
  /* edge line */
  const ep=edge.map((v,i)=>[X(i),Y(v)]);
  el('path',{d:ep.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
    stroke:C.goldB,'stroke-width':2.4,class:'rline'},s);
  /* end labels */
  const eg=el('g',{style:'--i:6'},s);
  el('circle',{cx:X(N),cy:Y(edge[N]),r:5,fill:C.goldB},eg);
  txt(eg,L+plotW+12,Y(edge[N])+4,'EDGE +'+(edge[N]>0?'':'−')+Math.abs(edge[N]).toFixed(1)+'R',{'font-size':11,fill:C.goldB,'font-weight':700});
  txt(eg,L+plotW+12,Y(edge[N])+19,'expectancy +0.21R',{'font-size':9,fill:C.muted2});
  const lg=el('g',{style:'--i:7'},s);
  el('circle',{cx:X(N),cy:Y(luck[N]),r:5,fill:C.cyan},lg);
  txt(lg,L+plotW+12,Y(luck[N])+4,'LUCK '+(luck[N]>0?'+':'−')+Math.abs(luck[N]).toFixed(1)+'R',{'font-size':11,fill:C.cyan,'font-weight':700});
  txt(lg,L+plotW+12,Y(luck[N])+19,'coin flip, 0 edge',{'font-size':9,fill:C.muted2});
  txt(s,L+plotW/2,H-8,'TRADES  交易次数 — 大数定律慢慢把两者分开',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.14em','font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 2. lookahead bias ============ */
function drawLookahead(box){
  const W=720,H=340,L=20,R=176,T=30,B=46;
  const s=svgFor(box,W,H);
  const closes=[60,61,59.5,62,63.5,62,64.5,66,65,67.5,69,68,70.5,72,71,73.5,75,74,76.5,78,77,79.5];
  const N=closes.length, plotW=W-L-R, plotH=H-T-B;
  const mn=56,mx=83;
  const step=plotW/N;
  const X=i=>L+step*(i+0.5);
  const Y=v=>T+(mx-v)/(mx-mn)*plotH;
  [60,65,70,75,80].forEach(g=>{
    el('line',{x1:L,x2:L+plotW,y1:Y(g),y2:Y(g),class:'rgrid'},s);
    txt(s,L-8,Y(g)+3.5,g,{'text-anchor':'end',class:'rax'});
  });
  /* candles */
  closes.forEach((c,i)=>{
    const o=i?closes[i-1]:58.5;
    const up=c>=o,col=up?C.bull:C.bear;
    const g=el('g',{style:'--i:'+i},s);
    el('line',{x1:X(i),x2:X(i),y1:Y(Math.max(o,c)+0.9),y2:Y(Math.min(o,c)-0.9),stroke:col,'stroke-width':1.6,'stroke-opacity':.85},g);
    el('rect',{x:X(i)-5,y:Y(Math.max(o,c)),width:10,height:Math.max(Math.abs(Y(o)-Y(c)),1.6),rx:1.5,fill:col,'fill-opacity':.75,class:'rbar'},g);
  });
  /* MA5 line */
  const ma=[];for(let i=0;i<N;i++){
    if(i<4){ma.push(null);continue;}
    let sum=0;for(let k=i-4;k<=i;k++)sum+=closes[k];
    ma.push(sum/5);
  }
  const maPts=[];ma.forEach((v,i)=>{if(v!==null)maPts.push([X(i),Y(v)]);});
  el('path',{d:maPts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
    stroke:C.gold,'stroke-opacity':.7,'stroke-width':1.4,class:'rline'},s);
  /* the future candle: bar 9 — circled, flagged */
  const fg=el('g',{style:'--i:3'},s);
  el('circle',{cx:X(9),cy:Y(closes[9]),r:13,fill:'none',stroke:C.bear,'stroke-width':1.6,'stroke-dasharray':'5 4'},fg);
  txt(fg,X(9),Y(closes[9])-20,'FUTURE 未来K线',{'text-anchor':'middle','font-size':9.5,fill:C.bear,'font-weight':700,'font-family':"'Noto Sans SC',sans-serif"});
  txt(fg,X(9),Y(closes[9])+30,'(not known at bar 8)',{'text-anchor':'middle','font-size':9,fill:C.muted2});
  /* signal at bar 8 — its rule needs bar 9's close */
  const sg=el('g',{style:'--i:10'},s);
  el('circle',{cx:X(8),cy:Y(closes[8]),r:5,fill:C.goldB,'stroke':'#060608','stroke-width':2},sg);
  txt(sg,X(8),Y(closes[8])+22,'SIGNAL 信号',{'text-anchor':'middle','font-size':9.5,fill:C.goldB,'font-weight':700,'font-family':"'Noto Sans SC',sans-serif"});
  txt(sg,X(8),Y(closes[8])+36,'rule: "close &gt; MA5 and next close &gt; close"',{'text-anchor':'middle','font-size':8.5,fill:C.muted2});
  /* callout */
  const cx=W-R+14;
  const cg=el('g',{style:'--i:13'},s);
  el('rect',{x:cx,y:T+18,width:150,height:118,rx:12,fill:'rgba(255,92,99,.07)',stroke:'rgba(255,92,99,.38)'},cg);
  txt(cg,cx+75,T+40,'LOOKAHEAD',{'text-anchor':'middle','font-size':9,fill:C.muted2,'letter-spacing':'.2em'});
  txt(cg,cx+75,T+66,'前视偏差',{'text-anchor':'middle','font-size':15,fill:C.bear,'font-weight':700,'font-family':"'Noto Sans SC',sans-serif"});
  txt(cg,cx+75,T+92,'The backtest saw',{'text-anchor':'middle','font-size':9.5,fill:C.muted});
  txt(cg,cx+75,T+110,'tomorrow.',{'text-anchor':'middle','font-size':9.5,fill:C.muted});
  txt(s,L+plotW/2,H-8,'BAR 9 CLOSE — USED AT BAR 8  第8根K线用了第9根的收盘价',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.12em','font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 3. cost waterfall ============ */
function drawDataQuality(box){
  const W=720,H=340,L=70,R=30,T=34,B=64;
  const s=svgFor(box,W,H);
  const plotW=W-L-R,plotH=H-T-B;
  const maxV=40;
  const Y=v=>T+plotH-v/maxV*plotH;
  [0,10,20,30,40].forEach(g=>{
    el('line',{x1:L,x2:L+plotW,y1:Y(g),y2:Y(g),class:'rgrid'},s);
    txt(s,L-10,Y(g)+3.5,g+'R',{'text-anchor':'end',class:'rax'});
  });
  const segs=[
    {k:'GROSS',zh:'毛优势',v:30,c:C.bull},
    {k:'SPREAD',zh:'点差',v:-8,c:C.bear},
    {k:'COMM',zh:'佣金',v:-6,c:C.bear},
    {k:'SLIP',zh:'滑点',v:-5,c:C.bear},
    {k:'NET',zh:'净优势',v:11,c:C.goldB,fin:true}
  ];
  const cw=plotW/segs.length;
  let cum=0;
  segs.forEach((d,i)=>{
    const x=L+cw*i, y0=Y(cum), y1=Y(cum+d.v);
    const g=el('g',{style:'--i:'+i},s);
    el('rect',{x:x+14,y:Math.min(y0,y1),width:cw-28,height:Math.max(Math.abs(y1-y0),2),rx:4,
      fill:d.c,'fill-opacity':.42,stroke:d.c,'stroke-opacity':.7,class:'rbar'},g);
    const mid=(y0+y1)/2;
    txt(g,x+cw/2,mid-8,(d.v>0?'+':'')+d.v+'R',{'text-anchor':'middle','font-size':13,'font-weight':700,fill:d.c,class:'rlbl'});
    txt(g,x+cw/2,T+plotH+22,d.k,{'text-anchor':'middle','font-size':11.5,fill:C.text});
    txt(g,x+cw/2,T+plotH+38,d.zh,{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
    if(d.fin){
      el('line',{x1:L,x2:L+plotW,y1:y0,y2:y0,stroke:C.muted2,'stroke-dasharray':'3 4','stroke-opacity':.5},g);
      txt(g,x+cw/2,Math.min(y0,y1)-9,'per 100 trades',{'text-anchor':'middle','font-size':8.5,fill:C.muted2,class:'rlbl'});
    }
    cum+=d.v;
  });
  txt(s,L+plotW/2,H-8,'GROSS +0.30R / TRADE  →  NET +0.11R / TRADE  每笔毛 +0.30R → 净 +0.11R',{'text-anchor':'middle','font-size':10,fill:C.goldB,'font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 4. sample size confidence ============ */
function drawSampleSize(box){
  const W=720,H=330,L=54,R=30,T=34,B=56;
  const s=svgFor(box,W,H);
  const plotW=W-L-R,plotH=H-T-B;
  const mn=30,mx=80;
  const Y=v=>T+(mx-v)/(mx-mn)*plotH;
  [30,40,50,60,70,80].forEach(g=>{
    el('line',{x1:L,x2:L+plotW,y1:Y(g),y2:Y(g),class:'rgrid'},s);
    txt(s,L-8,Y(g)+3.5,g+'%',{'text-anchor':'end',class:'rax'});
  });
  const trueRate=55;
  el('line',{x1:L,x2:L+plotW,y1:Y(trueRate),y2:Y(trueRate),stroke:C.gold,'stroke-opacity':.75,
    'stroke-dasharray':'7 4','stroke-width':1.4,class:'rlbl',style:'--i:0'},s);
  txt(s,L+plotW,Y(trueRate)-7,'TRUE 55% 真实胜率',{'text-anchor':'end','font-size':10,fill:C.gold,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:0'});
  const rows=[
    {n:'30',hw:17.8,note:'a rumor 传闻'},
    {n:'100',hw:9.7,note:'first verdict 初步结论'},
    {n:'300',hw:5.6,note:'real opinion 真正的观点'},
    {n:'1,000',hw:3.1,note:'close to truth 接近真相'}
  ];
  const cw=plotW/rows.length;
  rows.forEach((d,i)=>{
    const x=L+cw*i+cw/2, g=el('g',{style:'--i:'+(i+1)},s);
    el('line',{x1:x,x2:x,y1:Y(trueRate-d.hw),y2:Y(trueRate+d.hw),stroke:C.bull,'stroke-width':2.2,'stroke-opacity':.9,class:'rbar'},g);
    el('line',{x1:x-9,x2:x+9,y1:Y(trueRate-d.hw),y2:Y(trueRate-d.hw),stroke:C.bull,'stroke-width':2.2},g);
    el('line',{x1:x-9,x2:x+9,y1:Y(trueRate+d.hw),y2:Y(trueRate+d.hw),stroke:C.bull,'stroke-width':2.2},g);
    el('circle',{cx:x,cy:Y(trueRate),r:4.5,fill:C.goldB},g);
    txt(g,x,Y(trueRate-d.hw)-9,'±'+d.hw+'%',{'text-anchor':'middle','font-size':12,'font-weight':700,fill:C.bull,class:'rlbl'});
    txt(g,x,Y(trueRate+d.hw)+22,(trueRate-d.hw).toFixed(1)+'–'+(trueRate+d.hw).toFixed(1)+'%',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,class:'rlbl'});
    txt(g,x,T+plotH+22,'N = '+d.n,{'text-anchor':'middle','font-size':12.5,fill:C.text});
    txt(g,x,T+plotH+39,d.note,{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
  });
  /* minimum line between 30 and 100 */
  const minx=L+cw*1;
  const mg=el('g',{style:'--i:6'},s);
  el('line',{x1:minx,x2:minx,y1:T,y2:T+plotH,stroke:C.bear,'stroke-width':1.4,'stroke-dasharray':'6 4','stroke-opacity':.8},mg);
  txt(mg,minx+10,T+10,'MINIMUM 100 最低 100 笔',{'font-size':10.5,fill:C.bear,'font-weight':700,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L+plotW/2,H-8,'MEASURED WIN RATE ± 95% CONFIDENCE  实测胜率 ± 95% 置信区间',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.12em','font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 5. five metrics comparison ============ */
function drawMetrics(box){
  const W=720,H=340,L=20,R=20,T=44,B=64;
  const s=svgFor(box,W,H);
  const plotW=W-L-R,plotH=H-T-B;
  const base=T+plotH;
  const metrics=[
    {k:'PROFIT FACTOR',zh:'盈利因子',a:1.62,b:0.94,la:'1.62',lb:'0.94'},
    {k:'WIN RATE',zh:'胜率',a:42,b:68,la:'42%',lb:'68%'},
    {k:'EXPECTANCY',zh:'期望值',a:0.22,b:-0.05,la:'+0.22R',lb:'−0.05R'},
    {k:'MAX DRAWDOWN',zh:'最大回撤',a:8,b:22,la:'−8%',lb:'−22%'},
    {k:'SHARPE',zh:'夏普',a:1.41,b:0.18,la:'1.41',lb:'0.18'}
  ];
  el('line',{x1:L,x2:L+plotW,y1:base,y2:base,stroke:'rgba(232,200,119,.25)'},s);
  const cw=plotW/metrics.length;
  metrics.forEach((m,i)=>{
    const sc=Math.max(Math.abs(m.a),Math.abs(m.b));
    const g=el('g',{style:'--i:'+i*2},s);
    const bw=cw*0.24;
    const xA=L+cw*i+cw*0.30-bw/2, xB=L+cw*i+cw*0.70-bw/2;
    /* A */
    const hA=Math.abs(m.a)/sc*(plotH*0.72);
    const gA=el('g',{style:'--i:'+(i*2+1)},g);
    el('rect',{x:xA,y:base-hA,width:bw,height:Math.max(hA,2),rx:3,fill:C.gold,'fill-opacity':.55,
      stroke:C.gold,'stroke-opacity':.65,class:'rbar'},gA);
    txt(gA,xA+bw/2,base-hA-9,m.la,{'text-anchor':'middle','font-size':11.5,'font-weight':700,fill:C.goldB,class:'rlbl'});
    /* B */
    const hB=Math.abs(m.b)/sc*(plotH*0.72);
    const gB=el('g',{style:'--i:'+(i*2+2)},g);
    el('rect',{x:xB,y:base-hB,width:bw,height:Math.max(hB,2),rx:3,fill:C.bear,'fill-opacity':.5,
      stroke:C.bear,'stroke-opacity':.6,class:'rbar'},gB);
    txt(gB,xB+bw/2,base-hB-9,m.lb,{'text-anchor':'middle','font-size':11.5,'font-weight':700,fill:C.bear,class:'rlbl'});
    txt(g,xA+bw/2,base+20,'A',{'text-anchor':'middle','font-size':10.5,fill:C.gold,'font-weight':700});
    txt(g,xB+bw/2,base+20,'B',{'text-anchor':'middle','font-size':10.5,fill:C.bear,'font-weight':700});
    txt(g,L+cw*i+cw/2,T+plotH+34,m.k,{'text-anchor':'middle','font-size':9,fill:C.muted,'letter-spacing':'.08em'});
    txt(g,L+cw*i+cw/2,T+plotH+50,m.zh,{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
  });
  /* legend */
  const lg=el('g',{style:'--i:12'},s);
  el('rect',{x:L+10,y:14,width:11,height:11,rx:2,fill:C.gold,'fill-opacity':.6},lg);
  txt(lg,L+28,24,'SYSTEM A 系统A',{'font-size':10,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
  el('rect',{x:L+118,y:14,width:11,height:11,rx:2,fill:C.bear,'fill-opacity':.6},lg);
  txt(lg,L+136,24,'SYSTEM B 系统B',{'font-size':10,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L+plotW/2,H-8,'A WINS LESS BUT SURVIVES · B WINS MORE BUT BLEEDS  系统A赢得少但活着，系统B赢得勤但流血',{'text-anchor':'middle','font-size':10,fill:C.goldB,'font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 6. overfitting sweep ============ */
function drawOverfit(box){
  const W=720,H=340,L=54,R=190,T=30,B=46;
  const s=svgFor(box,W,H);
  const plotW=W-L-R,plotH=H-T-B,maxV=48;
  const Y=v=>T+plotH-v/maxV*plotH;
  [0,10,20,30,40].forEach(g=>{
    el('line',{x1:L,x2:L+plotW,y1:Y(g),y2:Y(g),class:'rgrid'},s);
    txt(s,L-8,Y(g)+3.5,g+'%',{'text-anchor':'end',class:'rax'});
  });
  const rnd=mulberry32(777);
  const P=30,opt=18;
  const ins=[],oos=[];
  for(let p=0;p<P;p++){
    const dist=Math.abs(p-opt);
    ins.push(4+38*Math.exp(-(dist*dist)/10)+(rnd()-0.5)*3);
    oos.push(4+(rnd()-0.5)*4);
  }
  const X=p=>L+plotW*(p/(P-1));
  /* mirage band around the optimum */
  const band=el('g',{style:'--i:0'},s);
  el('rect',{x:X(13),y:T,width:X(23)-X(13),height:plotH,fill:'rgba(232,200,119,.05)',stroke:'rgba(232,200,119,.22)','stroke-dasharray':'4 4'},band);
  txt(band,(X(13)+X(23))/2,T+16,'THE MIRAGE 幻影区',{'text-anchor':'middle','font-size':9,fill:C.gold,'font-family':"'Noto Sans SC',sans-serif"});
  /* out-of-sample line */
  const op=oos.map((v,p)=>[X(p),Y(v)]);
  el('path',{d:op.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
    stroke:C.cyan,'stroke-width':1.8,'stroke-opacity':.8,class:'rline'},s);
  /* in-sample line */
  const ip=ins.map((v,p)=>[X(p),Y(v)]);
  el('path',{d:ip.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
    stroke:C.goldB,'stroke-width':2.3,class:'rline'},s);
  /* optimum marker */
  const mg=el('g',{style:'--i:5'},s);
  el('line',{x1:X(opt),x2:X(opt),y1:Y(ins[opt]),y2:T+plotH,stroke:C.gold,'stroke-dasharray':'6 4','stroke-width':1.2,'stroke-opacity':.8},mg);
  el('circle',{cx:X(opt),cy:Y(ins[opt]),r:6,fill:C.goldB,'stroke':'#060608','stroke-width':2},mg);
  txt(mg,X(opt),Y(ins[opt])-12,'OPTIMUM 最优参数',{'text-anchor':'middle','font-size':9.5,fill:C.goldB,'font-weight':700,'font-family':"'Noto Sans SC',sans-serif"});
  txt(mg,X(opt),Y(ins[opt])+26,'+42.0% in-sample',{'text-anchor':'middle','font-size':9,fill:C.muted2});
  /* callout */
  const cx=W-R+16;
  const cg=el('g',{style:'--i:9'},s);
  el('rect',{x:cx,y:T+16,width:160,height:128,rx:12,fill:'rgba(232,200,119,.06)',stroke:'rgba(232,200,119,.32)'},cg);
  txt(cg,cx+80,T+38,'SAME PARAMETER',{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'letter-spacing':'.14em'});
  txt(cg,cx+80,T+64,'+42%',{'text-anchor':'middle','font-size':24,fill:C.goldB,'font-weight':700});
  txt(cg,cx+80,T+84,'in-sample 样本内',{'text-anchor':'middle','font-size':9.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
  txt(cg,cx+80,T+106,'+4%',{'text-anchor':'middle','font-size':24,fill:C.cyan,'font-weight':700});
  txt(cg,cx+80,T+126,'out-of-sample 样本外',{'text-anchor':'middle','font-size':9.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L+plotW/2,H-8,'PARAMETER VALUE  参数值 — 真优势是高原，不是尖峰',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.12em','font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 7. backtest → paper → live ladder ============ */
function drawBridge(box){
  const W=720,H=300,L=24,R=24,T=52,B=34;
  const s=svgFor(box,W,H);
  const stages=[
    {k:'BACKTEST',zh:'回测',c:C.cyan,line1:'300+ trades',line2:'net PF > 1.3'},
    {k:'PAPER',zh:'纸上交易',c:C.gold,line1:'30–50 trades',line2:'rules followed'},
    {k:'SMALL LIVE',zh:'小仓实盘',c:C.bull,line1:'20–30 trades',line2:'edge intact'},
    {k:'FULL SIZE',zh:'正常仓位',c:C.goldB,line1:'step up 50%',line2:'half risk first month'}
  ];
  txt(s,W/2,26,'THE VALIDATION LADDER  验证阶梯 — fail any gate, go back 任何一关不过就退回',{'text-anchor':'middle','font-size':10,fill:C.muted2,'letter-spacing':'.14em','font-family':"'Noto Sans SC',sans-serif"});
  const plotW=W-L-R, bw=plotW/4;
  const by=T+56, bh=118;
  stages.forEach((st,i)=>{
    const x=L+bw*i;
    const g=el('g',{style:'--i:'+i*2},s);
    el('rect',{x:x+8,y:by,width:bw-16,height:bh,rx:14,fill:'rgba(255,255,255,.015)',
      stroke:st.c,'stroke-opacity':.55,'stroke-width':1.4,class:'rbar'},g);
    const tg=el('g',{style:'--i:'+(i*2+1)},g);
    txt(tg,x+bw/2,by+30,st.k,{'text-anchor':'middle','font-size':13,'font-weight':700,fill:st.c,'letter-spacing':'.14em',class:'rlbl'});
    txt(tg,x+bw/2,by+48,st.zh,{'text-anchor':'middle','font-size':10.5,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
    el('line',{x1:x+26,x2:x+bw-26,y1:by+60,y2:by+60,stroke:'rgba(232,200,119,.14)'},tg);
    txt(tg,x+bw/2,by+80,st.line1,{'text-anchor':'middle','font-size':10.5,fill:C.text,class:'rlbl'});
    txt(tg,x+bw/2,by+97,st.line2,{'text-anchor':'middle','font-size':10,fill:C.muted,class:'rlbl'});
    if(i<3){
      const ax=L+bw*i+bw-6, ay=by+bh/2;
      const ag=el('g',{style:'--i:'+(i*2+1)},s);
      el('line',{x1:ax,x2:ax+12,y1:ay,y2:ay,stroke:C.cyan,'stroke-width':1.8,'stroke-opacity':.85,class:'rlbl'},ag);
      el('path',{d:'M'+(ax+12)+','+ay+' l-6,-4 v8 z',fill:C.cyan,'fill-opacity':.85,class:'rlbl'},ag);
    }
  });
  txt(s,W/2,H-10,'EACH STAGE USES LIVE DATA AND REAL COSTS — ONLY THE MONEY GETS BIGGER  每级都用真实行情与真实成本 —— 变大的只有金额',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.08em','font-family':"'Noto Sans SC',sans-serif"});
}

const RENDER={equity:drawEquityCurve,lookahead:drawLookahead,dataq:drawDataQuality,
              sample:drawSampleSize,metrics:drawMetrics,overfit:drawOverfit,bridge:drawBridge};
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

