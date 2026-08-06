/* ============ Supply & Demand chart helpers ============ */
function sdCandles(s,cs,X,Y,bw,start){
  cs.forEach((c,i)=>{
    const g=el('g',{style:'--i:'+(i+start),class:'rbar'},s);
    const up=c.c>=c.o, col=up?C.bull:C.bear;
    const hi=Math.max(c.o,c.c)+0.55, lo=Math.min(c.o,c.c)-0.55;
    el('line',{x1:X(i),x2:X(i),y1:Y(hi),y2:Y(lo),stroke:col,'stroke-width':1.7,'stroke-opacity':.9},g);
    const top=Y(Math.max(c.o,c.c));
    el('rect',{x:X(i)-bw/2,y:top,width:bw,height:Math.max(Math.abs(Y(c.o)-Y(c.c)),1.8),rx:1.5,
      fill:col,'fill-opacity':.8},g);
  });
}
function sdArrow(s,x1,y1,x2,y2,cls){
  const g=el('g',{class:cls},s);
  el('path',{d:'M'+x1+' '+y1+' L'+x2+' '+y2,class:'proj-line'},g);
  const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;
  const px=-uy,py=ux,hx=x2-ux*14,hy=y2-uy*14;
  el('path',{d:'M'+x2+' '+y2+' L'+(hx+px*5).toFixed(1)+' '+(hy+py*5).toFixed(1)+
    ' M'+x2+' '+y2+' L'+(hx-px*5).toFixed(1)+' '+(hy-py*5).toFixed(1),class:'proj-head'},g);
}

/* ============ 1. demand zone formation ============ */
function drawDemand(box){
  const W=720,H=360,L=46,R=214,T=30,B=44;
  const s=svgFor(box,W,H);
  const cs=[{o:62.5,c:61},{o:61,c:59.5},{o:59.5,c:58},{o:58,c:56.5},
            {o:56.5,c:55},{o:55,c:53.5},{o:53.5,c:52},{o:52,c:50.5},
            {o:50.5,c:49.6},{o:49.4,c:49},{o:48.8,c:49.5},{o:49.2,c:50},
            {o:50,c:56.5},{o:56.5,c:58},{o:58,c:60.5},{o:60.5,c:62.5}];
  const mn=44,mx=66,plotW=W-L-R,plotH=H-T-B,step=plotW/cs.length;
  const X=i=>L+step*(i+0.5), Y=p=>T+(mx-p)/(mx-mn)*plotH;
  const bw=Math.min(step*0.6,17);
  [48,54,60].forEach(g=>{
    el('line',{x1:L,x2:L+plotW,y1:Y(g),y2:Y(g),class:'rgrid'},s);
    txt(s,L-8,Y(g)+3.5,g,{'text-anchor':'end',class:'rax'});
  });
  const zT=51.3,zB=48.0;
  el('rect',{x:X(8)-bw/2,y:Y(zT),width:X(11)+bw/2-(X(8)-bw/2),height:Y(zB)-Y(zT),rx:9,
    class:'proj-zone up',stroke:'rgba(44,217,138,.5)','stroke-width':1.1},s);
  [zT,zB].forEach(z=>el('line',{x1:L,x2:L+plotW,y1:Y(z),y2:Y(z),class:'proj-sep'},s));
  const hl=el('g',{class:'hl'},s);
  el('rect',{x:X(12)-bw/2-6,y:Y(57.6),width:bw+12,height:Y(49.1)-Y(57.6),rx:8,class:'cndl-halo'},hl);
  sdCandles(s,cs,X,Y,bw,0);
  txt(s,X(9.5),(Y(zT)+Y(zB))/2+4,'DEMAND ZONE 需求区',{'text-anchor':'middle','font-size':13,
    'font-weight':700,fill:C.goldB,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:12'});
  txt(s,L+12,(Y(zT)+Y(zB))/2+4,'BASE 横盘带',{'font-size':10.5,fill:C.muted,
    'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:13'});
  txt(s,X(12),Y(58.6),'IGNITION 起爆点',{'text-anchor':'middle','font-size':11,fill:C.bull,
    'font-weight':700,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:14'});
  txt(s,X(3),Y(65.6),'DROP 急跌',{'text-anchor':'middle','font-size':10.5,fill:C.bear,
    'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:2'});
  txt(s,X(14.5),Y(64.8),'RALLY 拉升',{'text-anchor':'middle','font-size':10.5,fill:C.bull,
    'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:15'});
  sdArrow(s,X(12),Y(56.8),W-92,Y(63.9),'proj-arrow up');
}

/* ============ 2. supply zone formation ============ */
function drawSupply(box){
  const W=720,H=360,L=46,R=214,T=30,B=44;
  const s=svgFor(box,W,H);
  const cs=[{o:44.5,c:46},{o:46,c:47.5},{o:47.5,c:49},{o:49,c:50.5},
            {o:50.5,c:52},{o:52,c:53.5},{o:53.5,c:55},{o:55,c:56.5},
            {o:56.5,c:57.2},{o:57.4,c:57.6},{o:57.8,c:57.2},{o:57.5,c:56.8},
            {o:56.8,c:50.5},{o:50.5,c:49},{o:49,c:47.5},{o:47.5,c:46}];
  const mn=44,mx=66,plotW=W-L-R,plotH=H-T-B,step=plotW/cs.length;
  const X=i=>L+step*(i+0.5), Y=p=>T+(mx-p)/(mx-mn)*plotH;
  const bw=Math.min(step*0.6,17);
  [48,54,60].forEach(g=>{
    el('line',{x1:L,x2:L+plotW,y1:Y(g),y2:Y(g),class:'rgrid'},s);
    txt(s,L-8,Y(g)+3.5,g,{'text-anchor':'end',class:'rax'});
  });
  const zT=58.4,zB=55.9;
  el('rect',{x:X(8)-bw/2,y:Y(zT),width:X(11)+bw/2-(X(8)-bw/2),height:Y(zB)-Y(zT),rx:9,
    class:'proj-zone down',stroke:'rgba(255,92,99,.5)','stroke-width':1.1},s);
  [zT,zB].forEach(z=>el('line',{x1:L,x2:L+plotW,y1:Y(z),y2:Y(z),class:'proj-sep'},s));
  const hl=el('g',{class:'hl'},s);
  el('rect',{x:X(12)-bw/2-6,y:Y(58.9),width:bw+12,height:Y(49.4)-Y(58.9),rx:8,class:'cndl-halo'},hl);
  sdCandles(s,cs,X,Y,bw,0);
  txt(s,X(9.5),(Y(zT)+Y(zB))/2+4,'SUPPLY ZONE 供应区',{'text-anchor':'middle','font-size':13,
    'font-weight':700,fill:C.goldB,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:12'});
  txt(s,L+12,(Y(zT)+Y(zB))/2+4,'BASE 横盘带',{'font-size':10.5,fill:C.muted,
    'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:13'});
  txt(s,X(12),Y(48.2),'IGNITION 起爆点',{'text-anchor':'middle','font-size':11,fill:C.bear,
    'font-weight':700,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:14'});
  txt(s,X(3),Y(44.9),'RALLY 拉升',{'text-anchor':'middle','font-size':10.5,fill:C.bull,
    'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:2'});
  txt(s,X(14.5),Y(45.8),'DUMP 急跌',{'text-anchor':'middle','font-size':10.5,fill:C.bear,
    'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:15'});
  sdArrow(s,X(12),Y(51.2),W-92,Y(45.6),'proj-arrow down');
}

/* ============ 3. RTB — return to base entry ============ */
function drawRTB(box){
  const W=720,H=360,L=46,R=214,T=30,B=44;
  const s=svgFor(box,W,H);
  const cs=[{o:62.5,c:61},{o:61,c:59.5},{o:59.5,c:58},{o:58,c:56.5},{o:56.5,c:55.2},
            {o:55,c:54.2},{o:54,c:53.6},{o:53.4,c:54.2},{o:54,c:54.8},
            {o:54.8,c:60.5},{o:60.5,c:62},{o:62,c:63.5},{o:63.5,c:62.8},{o:62.8,c:61.6},
            {o:61.6,c:58.5},{o:58.5,c:56.5},{o:56.5,c:55.2},
            {o:55.2,c:56.8},{o:56.8,c:60},{o:60,c:62.5}];
  const mn=50,mx=66,plotW=W-L-R,plotH=H-T-B,step=plotW/cs.length;
  const X=i=>L+step*(i+0.5), Y=p=>T+(mx-p)/(mx-mn)*plotH;
  const bw=Math.min(step*0.6,15);
  [52,56,60,64].forEach(g=>{
    el('line',{x1:L,x2:L+plotW,y1:Y(g),y2:Y(g),class:'rgrid'},s);
    txt(s,L-8,Y(g)+3.5,g,{'text-anchor':'end',class:'rax'});
  });
  const zT=55.7,zB=52.9;
  el('rect',{x:X(5)-bw/2,y:Y(zT),width:X(8)+bw/2-(X(5)-bw/2),height:Y(zB)-Y(zT),rx:9,
    class:'proj-zone up',stroke:'rgba(44,217,138,.5)','stroke-width':1.1},s);
  [zT,zB].forEach(z=>el('line',{x1:L,x2:L+plotW,y1:Y(z),y2:Y(z),class:'proj-sep'},s));
  sdCandles(s,cs,X,Y,bw,0);
  /* stop below zone */
  const stopY=52.3,tgtY=64.1;
  el('line',{x1:L,x2:L+plotW,y1:Y(stopY),y2:Y(stopY),stroke:C.bear,'stroke-width':1.5,
    'stroke-dasharray':'6 4',class:'rlbl',style:'--i:16'},s);
  txt(s,L+plotW+12,Y(stopY)-3,'STOP 止损',{'font-size':10.5,fill:C.bear,'font-weight':700,
    'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:16'});
  el('line',{x1:L,x2:L+plotW,y1:Y(tgtY),y2:Y(tgtY),stroke:C.bull,'stroke-width':1.5,
    'stroke-dasharray':'6 4',class:'rlbl',style:'--i:17'},s);
  txt(s,L+plotW+12,Y(tgtY)-3,'TARGET 目标',{'font-size':10.5,fill:C.bull,'font-weight':700,
    'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:17'});
  /* entry marker on reaction candle (idx 17) */
  el('circle',{cx:X(17),cy:Y(55.2),r:5.5,fill:C.gold,class:'rlbl',style:'--i:18'},s);
  el('circle',{cx:X(17),cy:Y(55.2),r:9,fill:'none',stroke:C.gold,'stroke-opacity':.6,
    'stroke-width':1.2,class:'rlbl',style:'--i:18'},s);
  txt(s,X(17),Y(52.6),'ENTRY 进场',{'text-anchor':'middle','font-size':11,fill:C.goldB,
    'font-weight':700,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:18'});
  txt(s,X(9.5),(Y(zT)+Y(zB))/2+4,'DEMAND ZONE 需求区',{'text-anchor':'middle','font-size':12,
    'font-weight':700,fill:C.goldB,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:12'});
  txt(s,X(15.5),Y(58.6),'RTB 回测',{'text-anchor':'middle','font-size':11,fill:C.cyan,
    'font-weight':700,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:15'});
  txt(s,X(11),Y(64.9),'SWING HIGH 前高',{'text-anchor':'middle','font-size':9.5,fill:C.muted,
    'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:12'});
  sdArrow(s,X(14.5),Y(62.6),X(17),Y(57.2),'proj-arrow down');
  sdArrow(s,X(18),Y(59.2),W-92,Y(63.8),'proj-arrow up');
}

/* ============ 4. breakout & invalidation ============ */
function drawInvalid(box){
  const W=720,H=360,L=46,R=214,T=30,B=44;
  const s=svgFor(box,W,H);
  const cs=[{o:62,c:60.5},{o:60.5,c:59},{o:59,c:57.5},{o:57.5,c:56},{o:56,c:54.8},
            {o:54.6,c:53.8},{o:53.6,c:53.2},{o:53,c:53.8},{o:53.6,c:54.2},
            {o:54.2,c:59.5},{o:59.5,c:61},{o:61,c:62},{o:62,c:61.2},
            {o:61.2,c:58},{o:58,c:56},{o:56,c:54.6},
            {o:54.6,c:55.6},{o:55.6,c:52.2},{o:52.2,c:51.2},{o:51.2,c:50.4}];
  const mn=50,mx=64,plotW=W-L-R,plotH=H-T-B,step=plotW/cs.length;
  const X=i=>L+step*(i+0.5), Y=p=>T+(mx-p)/(mx-mn)*plotH;
  const bw=Math.min(step*0.6,15);
  [52,56,60].forEach(g=>{
    el('line',{x1:L,x2:L+plotW,y1:Y(g),y2:Y(g),class:'rgrid'},s);
    txt(s,L-8,Y(g)+3.5,g,{'text-anchor':'end',class:'rax'});
  });
  const zT=55.3,zB=52.5;
  el('rect',{x:X(5)-bw/2,y:Y(zT),width:X(8)+bw/2-(X(5)-bw/2),height:Y(zB)-Y(zT),rx:9,
    class:'proj-zone up',stroke:'rgba(44,217,138,.45)','stroke-width':1.1},s);
  [zT,zB].forEach(z=>el('line',{x1:L,x2:L+plotW,y1:Y(z),y2:Y(z),class:'proj-sep'},s));
  sdCandles(s,cs,X,Y,bw,0);
  /* breakdown candle halo */
  const hg=el('g',{class:'hl'},s);
  el('rect',{x:X(17)-bw/2-5,y:Y(57.1),width:bw+10,height:Y(50.5)-Y(57.1),rx:7,class:'cndl-halo'},hg);
  /* invalid cross */
  txt(s,X(6.5),(Y(zT)+Y(zB))/2+2,'✕',{'text-anchor':'middle','font-size':30,'font-weight':700,
    fill:C.bear,class:'rlbl',style:'--i:18'});
  txt(s,X(6.5),(Y(zT)+Y(zB))/2+22,'INVALID 已失效',{'text-anchor':'middle','font-size':11,
    'font-weight':700,fill:C.bear,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:18'});
  txt(s,L+plotW+12,Y(zB)-2,'BREAK 跌破',{'font-size':10.5,fill:C.bear,'font-weight':700,
    'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:17'});
  txt(s,X(15.5),Y(58.2),'WEAK BOUNCE 反弹无力',{'text-anchor':'middle','font-size':10,fill:C.muted,
    'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:16'});
  txt(s,X(19),Y(48.8),'FOLLOW-THROUGH 持续下跌',{'text-anchor':'end','font-size':10.5,fill:C.bear,
    'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:19'});
  sdArrow(s,X(17),Y(52.4),W-92,Y(46.6),'proj-arrow down');
}

/* ============ 5. zone vs line ============ */
function drawZoneLine(box){
  const W=720,H=310,s=svgFor(box,W,H);
  txt(s,W/2,26,'SAME PRICES, TWO DRAWINGS  同一段价格，两种画法',{'text-anchor':'middle',
    'font-size':10.5,fill:C.muted2,'letter-spacing':'.18em','font-family':"'Noto Sans SC',sans-serif"});
  const drawC=function(g,x,o,c,hi,lo,bw){
    const up=c>=o,col=up?C.bull:C.bear;
    el('line',{x1:x,x2:x,y1:hi,y2:lo,stroke:col,'stroke-width':1.6,'stroke-opacity':.9},g);
    el('rect',{x:x-bw/2,y:Math.min(o,c),width:bw,height:Math.max(Math.abs(c-o),1.8),rx:1.5,
      fill:col,'fill-opacity':.8},g);
  };
  /* ---- left panel : the line ---- */
  const Lx=24,pw=318,lineY=150;
  const lg=el('g',{style:'--i:0',class:'rbar'},s);
  el('rect',{x:Lx,y:38,width:pw,height:236,rx:14,fill:'rgba(255,255,255,.016)',
    stroke:'rgba(232,200,119,.12)'},lg);
  txt(s,Lx+18,62,'S/R LINE  一条线',{'font-size':11,fill:C.gold,'font-weight':700,
    'font-family':"'Noto Sans SC',sans-serif"});
  el('line',{x1:Lx+14,x2:Lx+pw-14,y1:lineY,y2:lineY,stroke:C.gold,'stroke-width':1.4,
    'stroke-dasharray':'7 4',class:'proj-sep'},s);
  txt(s,Lx+16,lineY-7,'S/R',{'font-size':9,fill:C.gold,'letter-spacing':'.1em'});
  const lc=[[112,98,90,124],[130,116,108,142],[144,132,124,150],[152,146,138,174],[146,162,138,166]];
  lc.forEach((c,i)=>{
    const g=el('g',{style:'--i:'+(i+1),class:'rbar'},s);
    drawC(g,Lx+42+i*56,c[0],c[1],c[2],c[3],30);
  });
  const stopX=Lx+42+3*56;
  el('circle',{cx:stopX,cy:158,r:4.5,fill:C.bear,class:'rlbl',style:'--i:6'},s);
  txt(s,stopX+9,162,'✕ stop here 止损放这',{'font-size':9.5,fill:C.bear,
    'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:6'});
  txt(s,Lx+pw/2,292,'wick pierces → stop hit  影线穿透 → 止损被扫',
    {'text-anchor':'middle','font-size':10,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
  /* ---- right panel : the zone ---- */
  const Rx=378;
  const rg2=el('g',{style:'--i:0',class:'rbar'},s);
  el('rect',{x:Rx,y:38,width:pw,height:236,rx:14,fill:'rgba(255,255,255,.016)',
    stroke:'rgba(232,200,119,.12)'},rg2);
  txt(s,Rx+18,62,'ZONE  一条带子',{'font-size':11,fill:C.gold,'font-weight':700,
    'font-family':"'Noto Sans SC',sans-serif"});
  el('rect',{x:Rx+14,y:136,width:pw-28,height:44,rx:8,class:'proj-zone up',
    stroke:'rgba(44,217,138,.5)','stroke-width':1.1},s);
  el('line',{x1:Rx+14,x2:Rx+pw-14,y1:136,y2:136,class:'proj-sep'},s);
  el('line',{x1:Rx+14,x2:Rx+pw-14,y1:180,y2:180,class:'proj-sep'},s);
  txt(s,Rx+22,168,'DEMAND ZONE',{'font-size':10,fill:C.goldB,'font-weight':700,'letter-spacing':'.06em'});
  const rc=[[114,100,92,126],[132,118,110,144],[146,134,126,154],[152,146,140,178],[146,164,140,170]];
  rc.forEach((c,i)=>{
    const g=el('g',{style:'--i:'+(i+1),class:'rbar'},s);
    drawC(g,Rx+42+i*56,c[0],c[1],c[2],c[3],30);
  });
  txt(s,Rx+42+3*56,196,'✓ absorbed  过冲被吸收',{'text-anchor':'middle','font-size':9.5,fill:C.bull,
    'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:6'});
  txt(s,Rx+pw/2,292,'overshoot absorbed → trade as planned  过冲被吸收 → 交易按计划走',
    {'text-anchor':'middle','font-size':10,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 6. with-trend vs counter-trend ============ */
function drawTrend(box){
  const W=720,H=310,s=svgFor(box,W,H);
  const v2y=v=>270-(v-48)/(64-48)*210;
  const drawC=function(g,x,o,c,bw){
    const up=c>=o,col=up?C.bull:C.bear;
    const hi=Math.max(o,c)-6,lo=Math.min(o,c)+6;
    el('line',{x1:x,x2:x,y1:v2y(hi),y2:v2y(lo),stroke:col,'stroke-width':1.6,'stroke-opacity':.9},g);
    el('rect',{x:x-bw/2,y:v2y(Math.max(o,c)),width:bw,height:Math.max(Math.abs(v2y(o)-v2y(c)),1.8),rx:1.5,
      fill:col,'fill-opacity':.8},g);
  };
  /* ---- left : with trend ---- */
  const Lx=24,pw=318;
  el('rect',{x:Lx,y:38,width:pw,height:236,rx:14,fill:'rgba(255,255,255,.016)',
    stroke:'rgba(44,217,138,.25)'},s);
  txt(s,Lx+18,62,'WITH TREND  顺势 ✓',{'font-size':11,fill:C.bull,'font-weight':700,
    'font-family':"'Noto Sans SC',sans-serif"});
  el('line',{x1:Lx+30,y1:v2y(52.6),x2:Lx+pw-30,y2:v2y(60.2),stroke:C.gold,'stroke-width':1.3,
    'stroke-dasharray':'6 4',class:'proj-sep'},s);
  el('rect',{x:Lx+118,y:v2y(56.4),width:104,height:v2y(54.6)-v2y(56.4),rx:7,class:'proj-zone up',
    stroke:'rgba(44,217,138,.5)','stroke-width':1.1},s);
  txt(s,Lx+170,(v2y(56.4)+v2y(54.6))/2+4,'DEMAND',{'text-anchor':'middle','font-size':9.5,
    fill:C.goldB,'font-weight':700,'letter-spacing':'.08em'});
  const wt=[[52,54],[54,53.5],[53.5,55.5],[55.5,57],[57,56.2],[56.2,55.2],[55.2,56.5],[56.5,58.5],[58.5,60],[60,61.5]];
  wt.forEach((c,i)=>{
    const g=el('g',{style:'--i:'+(i+1),class:'rbar'},s);
    drawC(g,Lx+34+i*26,c[0],c[1],17);
  });
  txt(s,Lx+pw/2,292,'RTB with the tide  顺势回测 · 顺水推舟',
    {'text-anchor':'middle','font-size':10,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
  sdArrow(s,Lx+280,v2y(58.5),Lx+pw-16,v2y(62.5),'proj-arrow up');
  /* ---- right : counter trend ---- */
  const Rx=378;
  el('rect',{x:Rx,y:38,width:pw,height:236,rx:14,fill:'rgba(255,255,255,.016)',
    stroke:'rgba(255,92,99,.25)'},s);
  txt(s,Rx+18,62,'COUNTER  逆势 ⚠',{'font-size':11,fill:C.bear,'font-weight':700,
    'font-family':"'Noto Sans SC',sans-serif"});
  el('line',{x1:Rx+30,y1:v2y(58.6),x2:Rx+pw-30,y2:v2y(52.2),stroke:C.bear,'stroke-width':1.3,
    'stroke-dasharray':'6 4',class:'proj-sep'},s);
  el('rect',{x:Rx+118,y:v2y(57.9),width:104,height:v2y(55.0)-v2y(57.9),rx:7,class:'proj-zone up',
    stroke:'rgba(255,92,99,.5)','stroke-width':1.1},s);
  txt(s,Rx+170,(v2y(57.9)+v2y(55.0))/2+4,'✕ ZONE',{'text-anchor':'middle','font-size':9.5,
    fill:C.bear,'font-weight':700,'letter-spacing':'.08em'});
  const ct=[[60.5,58.5],[58.5,57],[57,55.5],[55.5,56.8],[56.8,57.4],[57.4,56.6],[56.6,54],[54,52.5],[52.5,51],[51,50]];
  ct.forEach((c,i)=>{
    const g=el('g',{style:'--i:'+(i+1),class:'rbar'},s);
    drawC(g,Rx+34+i*26,c[0],c[1],17);
  });
  txt(s,Rx+pw/2,292,'counter-trend zone fights the tide  逆势供需区 · 逆水行舟',
    {'text-anchor':'middle','font-size':10,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
  sdArrow(s,Rx+150,v2y(53.2),Rx+pw-16,v2y(48.9),'proj-arrow down');
}

const RENDER={demand:drawDemand,supply:drawSupply,rtb:drawRTB,invalid:drawInvalid,
              zoneline:drawZoneLine,trend:drawTrend};
document.querySelectorAll('.rchart[data-r]').forEach(b=>{const f=RENDER[b.dataset.r];if(f)f(b);});
