
document.getElementById('yr').textContent=new Date().getFullYear();
const RM=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const NS='http://www.w3.org/2000/svg';
const C={bull:'#2CD98A',bear:'#FF5C63',gold:'#E8C877',goldB:'#FCE9A8',goldD:'#C9A227',
         muted:'#9A968C',muted2:'#6f6c64',cyan:'#2FE0D6',text:'#EDEBE2'};
const MONO="'JetBrains Mono',monospace";

function el(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function txt(p,x,y,s,o){const t=el('text',Object.assign({x:x,y:y,'font-family':MONO,'font-size':11,fill:C.muted},o||{}),p);t.textContent=s;return t;}
function svgFor(box,w,h){const s=el('svg',{viewBox:'0 0 '+w+' '+h,preserveAspectRatio:'xMidYMid meet'});box.appendChild(s);return s;}

/* ============ shared chart helpers ============ */
const FZH="'Noto Sans SC',sans-serif";
function candles(s,X,Y,bars,bw,base){
  bars.forEach((b,i)=>{
    const o=b[0],c=b[1],hi=b[2],lo=b[3];
    const up=c>=o, col=up?C.bull:C.bear;
    const g=el('g',{style:'--i:'+(base+i),class:'rbar'},s);
    el('line',{x1:X(i),x2:X(i),y1:Y(hi),y2:Y(lo),stroke:col,'stroke-width':1.7,'stroke-opacity':.9},g);
    const top=Y(Math.max(o,c)), hgt=Math.max(Math.abs(Y(o)-Y(c)),1.8);
    el('rect',{x:X(i)-bw/2,y:top,width:bw,height:hgt,rx:1.5,fill:col,'fill-opacity':.8},g);
  });
}
function mkChan(lowFn,upFn,N,seed,tL,tU){
  const bars=[];
  for(let i=0;i<N;i++){
    const lo0=lowFn(i)+0.35, hi0=upFn(i)-0.45;
    const w=Math.sin(seed+i*1.9)*0.8+Math.sin(seed*2+i*0.7)*0.6;
    let o=lo0+1.3+w*1.1, c=lo0+2.7+w*1.5;
    o=Math.max(lo0+0.3,Math.min(hi0-0.6,o));
    c=Math.max(lo0+0.3,Math.min(hi0-0.6,c));
    let hi=Math.max(hi0,o,c)+0.5, lo=Math.min(lo0,o,c)-0.5;
    bars.push([o,c,hi,lo]);
  }
  (tL||[]).forEach(i=>{bars[i][3]=lowFn(i)+0.06;
    bars[i][0]=Math.max(bars[i][0],bars[i][3]+0.6);
    bars[i][1]=Math.max(bars[i][1],bars[i][3]+0.6);});
  (tU||[]).forEach(i=>{bars[i][2]=upFn(i)-0.06;
    bars[i][0]=Math.min(bars[i][0],bars[i][2]-0.6);
    bars[i][1]=Math.min(bars[i][1],bars[i][2]-0.6);});
  return bars;
}
function arrow(s,x1,y1,x2,y2,col,delay){
  const g=el('g',{class:'rlbl',style:'--i:'+delay},s);
  el('line',{x1:x1,y1:y1,x2:x2,y2:y2,stroke:col,'stroke-width':2.2,'stroke-linecap':'round'},g);
  const ang=Math.atan2(y2-y1,x2-x1),L=9;
  el('path',{d:'M'+x2+','+y2+'L'+(x2-L*Math.cos(ang-0.42)).toFixed(1)+','+(y2-L*Math.sin(ang-0.42)).toFixed(1)
    +'L'+(x2-L*Math.cos(ang+0.42)).toFixed(1)+','+(y2-L*Math.sin(ang+0.42)).toFixed(1)+'Z',fill:col},g);
}

/* ============ 1. how to draw a trendline ============ */
function drawTrendline(box){
  const W=720,H=340,L=16,R=168,T=22,B=32;
  const s=svgFor(box,W,H);
  const mn=48,mx=72;
  const bars=[[50,51,52,49.5],[51,52.5,53.5,50],[52.5,51.5,54,51],[51.5,53.5,54.5,51.5],
              [53.5,54.5,56,53],[54.5,55.8,57,54.2],[55.8,56.5,57.5,55],[56.5,55.5,57.8,55.2],
              [55.5,57.5,58.5,55.5],[57.5,58.8,60,57],[58.8,59.5,60.5,58.2],
              [60.2,61.5,62.5,60],[61.5,60.5,62.8,60.4],[60.5,62.5,63.5,60.6],
              [62.5,63.8,65,62],[63.8,64.5,66,63.2],[64.5,66.5,67.5,64],[66.5,68,69,66]];
  const N=bars.length, plotW=W-L-R, plotH=H-T-B;
  const X=i=>L+plotW/N*(i+0.5);
  const Y=p=>T+(mx-p)/(mx-mn)*plotH;
  const bw=Math.min(plotW/N*0.56,15);
  const tl=i=>50+(i-1);
  /* buy zone above the line */
  el('polygon',{points:(X(1).toFixed(1)+','+Y(50).toFixed(1))+' '+(X(17).toFixed(1)+','+Y(66).toFixed(1))
    +' '+(X(17).toFixed(1)+','+T)+' '+(X(1).toFixed(1)+','+T),
    fill:'rgba(44,217,138,.05)',class:'rlbl',style:'--i:16'},s);
  /* confirmed segment */
  el('line',{x1:X(1),y1:Y(50),x2:X(6),y2:Y(55),stroke:C.gold,'stroke-width':2.2,class:'rline'},s);
  /* projected segment */
  el('line',{x1:X(6),y1:Y(55),x2:X(17),y2:Y(66),stroke:C.gold,'stroke-width':1.8,
    'stroke-dasharray':'6 5','stroke-opacity':.75,class:'rline',style:'transition-delay:.55s'},s);
  candles(s,X,Y,bars,bw,0);
  /* anchors 1 / 2 / 3 */
  [[1,50,C.gold],[6,55,C.gold],[11,60,C.goldB]].forEach((m,i)=>{
    const g=el('g',{style:'--i:'+(i+8)},s);
    el('circle',{cx:X(m[0]),cy:Y(m[1]),r:9,fill:'rgba(6,6,8,.92)',stroke:m[2],'stroke-width':1.6},g);
    txt(g,X(m[0]),Y(m[1])+3.5,String(i+1),{'text-anchor':'middle','font-size':9.5,fill:m[2],'font-weight':700,class:'rlbl'});
  });
  /* validation ring on the third touch */
  el('circle',{cx:X(11),cy:Y(60),r:13,fill:'none',stroke:C.goldB,'stroke-width':1.2,
    'stroke-dasharray':'3 3',class:'rlbl',style:'--i:12'},s);
  /* right labels */
  const rx=L+plotW+14;
  txt(s,rx,Y(50)-10,'1 + 2  CONFIRM',{'font-size':10,fill:C.gold,'font-weight':700,class:'rlbl',style:'--i:13'});
  txt(s,rx,Y(50)+4,'two swing points',{'font-size':9.5,fill:C.muted2,class:'rlbl',style:'--i:14'});
  txt(s,rx,Y(50)+17,'两点确认',{'font-size':9.5,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:14'});
  txt(s,rx,Y(60)+14,'3  VALIDATES',{'font-size':10,fill:C.goldB,'font-weight':700,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(60)+28,'third touch = real',{'font-size':9.5,fill:C.muted2,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(60)+41,'三次触碰=有效',{'font-size':9.5,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:15'});
  txt(s,L+plotW/2,H-9,'TWO POINTS CONFIRM · THE THIRD VALIDATES  两点连线 · 三次触碰验证',
    {'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.16em','font-family':FZH});
}

/* ============ 2. three trendline types ============ */
function drawTLTypes(box){
  const W=720,H=252,s=svgFor(box,W,H);
  const pw=216,gap=18,px0=16,py=44,ph=142;
  const panels=[
    {t:'UPTREND',zh:'上升趋势',c:C.bull,line:i=>30.6+0.9*i,dir:1,
     bars:[[31.2,33,34.2,30.8],[33,32,34.6,31.4],[32,34.5,35.6,31.9],[34.5,33.5,36.1,32.4],
           [33.5,36,37.1,33.2],[36,35.2,37.4,33.8],[35.2,37.5,38.6,34.4],[37.5,40.2,41.2,35.6]]},
    {t:'DOWNTREND',zh:'下降趋势',c:C.bear,line:i=>44-0.9*i,dir:-1,
     bars:[[42,40.5,43.6,39.6],[40.5,41.5,43.2,39.8],[41.5,39.8,42.4,38.8],[39.8,40.8,41.5,38.9],
           [40.8,39,40.6,38],[39,40,39.7,38.2],[40,38.2,39.2,37.4],[38.2,36.5,38,35.6]]},
    {t:'SIDEWAYS',zh:'横盘趋势',c:C.gold,line:i=>38,dir:0,
     bars:[[37.5,38.8,40,36.8],[38.8,37.2,39.6,36.2],[37.2,38.5,40.2,36.6],[38.5,37.8,39.8,36.4],
           [37.8,39,40.5,36.8],[39,38,40.1,36.9],[38,39.2,40.8,37],[39.2,40.5,41.6,37.6]]}
  ];
  const mn=33,mx=47;
  panels.forEach((p,pi)=>{
    const x=px0+pi*(pw+gap);
    const X=i=>x+20+(pw-32)/8*(i+0.5);
    const Y=v=>py+(mx-v)/(mx-mn)*ph;
    /* snap touch points onto the line */
    const bars=p.bars.map(b=>b.slice());
    const snap=(p.dir>0?[1,3,5,7]:p.dir<0?[1,3,5,7]:[1,3,5,7]);
    snap.forEach(i=>{
      const lv=p.line(i);
      if(p.dir>=0){bars[i][3]=lv-0.05;bars[i][0]=Math.max(bars[i][0],lv+0.5);bars[i][1]=Math.max(bars[i][1],lv+0.5);}
      if(p.dir<=0){bars[i][2]=lv+0.05;bars[i][0]=Math.min(bars[i][0],lv-0.5);bars[i][1]=Math.min(bars[i][1],lv-0.5);}
    });
    const bw=(pw-32)/8*0.5;
    el('line',{x1:X(0),y1:Y(p.line(0)),x2:X(7),y2:Y(p.line(7)),stroke:C.gold,'stroke-width':1.8,class:'rline'},s);
    candles(s,X,Y,bars,bw,pi*2);
    snap.forEach(i=>{
      const g=el('g',{style:'--i:'+(pi*2+4)},s);
      el('circle',{cx:X(i),cy:Y(p.line(i)),r:3.4,fill:p.c,class:'rlbl'},g);
    });
    txt(s,x+4,28,p.t,{'font-size':12,'font-weight':700,fill:p.c,'letter-spacing':'.16em',class:'rlbl',style:'--i:'+pi});
    txt(s,x+pw-4,28,p.zh,{'text-anchor':'end','font-size':11,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:'+pi});
  });
  txt(s,px0+pw*1.5,py+ph+24,'UPTREND: line under the lows  上升趋势线连接低点',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'font-family':FZH});
  txt(s,px0+pw*2.5+gap,py+ph+24,'DOWNTREND: line above the highs  下降趋势线连接高点',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'font-family':FZH});
  txt(s,px0+pw*3.5+gap*2,py+ph+24,'SIDEWAYS: flat = range  水平线=区间',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'font-family':FZH});
}

/* ============ 3. ascending channel ============ */
function drawChannel(box){
  const W=720,H=340,L=16,R=168,T=22,B=34;
  const s=svgFor(box,W,H);
  const N=18,mn=50,mx=78,plotW=W-L-R,plotH=H-T-B;
  const X=i=>L+plotW/N*(i+0.5);
  const Y=p=>T+(mx-p)/(mx-mn)*plotH;
  const lowFn=i=>52.2+i, upFn=i=>60.1+i;
  const bars=mkChan(lowFn,upFn,N,0,[0,6,12],[3,9,15]);
  const bw=plotW/N*0.5;
  /* channel band */
  el('polygon',{points:(X(0).toFixed(1)+','+Y(lowFn(0)).toFixed(1))+' '+(X(17).toFixed(1)+','+Y(lowFn(17)).toFixed(1))
    +' '+(X(17).toFixed(1)+','+Y(upFn(17)).toFixed(1))+' '+(X(0).toFixed(1)+','+Y(upFn(0)).toFixed(1)),
    fill:'rgba(232,200,119,.05)',class:'rlbl',style:'--i:14'},s);
  /* rails */
  el('line',{x1:X(0),y1:Y(lowFn(0)),x2:X(17),y2:Y(lowFn(17)),stroke:C.gold,'stroke-width':2.2,class:'rline'},s);
  el('line',{x1:X(0),y1:Y(upFn(0)),x2:X(17),y2:Y(upFn(17)),stroke:C.gold,'stroke-width':1.8,
    'stroke-dasharray':'7 5','stroke-opacity':.8,class:'rline',style:'transition-delay:.5s'},s);
  candles(s,X,Y,bars,bw,0);
  /* touches */
  [0,6,12].forEach((i,d)=>{
    const g=el('g',{style:'--i:'+(d+10)},s);
    el('circle',{cx:X(i),cy:Y(lowFn(i)),r:4.5,fill:C.bull,class:'rlbl'},g);
  });
  [3,9,15].forEach((i,d)=>{
    const g=el('g',{style:'--i:'+(d+13)},s);
    el('circle',{cx:X(i),cy:Y(upFn(i)),r:4.5,fill:'none',stroke:C.cyan,'stroke-width':1.6,class:'rlbl'},g);
  });
  /* right labels */
  const rx=L+plotW+14;
  txt(s,rx,Y(lowFn(0))-10,'LOWER RAIL · SUPPORT',{'font-size':10,fill:C.bull,'font-weight':700,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(lowFn(0))+4,'buy zone 买入区',{'font-size':9.5,fill:C.muted2,'font-family':FZH,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(upFn(0))+8,'UPPER RAIL · TARGET',{'font-size':10,fill:C.bear,'font-weight':700,class:'rlbl',style:'--i:16'});
  txt(s,rx,Y(upFn(0))+22,'target zone 目标区',{'font-size':9.5,fill:C.muted2,'font-family':FZH,class:'rlbl',style:'--i:16'});
  txt(s,rx,Y(upFn(0))+44,'parallel rails',{'font-size':9.5,fill:C.muted2,class:'rlbl',style:'--i:16'});
  txt(s,rx,Y(upFn(0))+57,'平行轨道',{'font-size':9.5,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:16'});
  /* slope indicator */
  arrow(s,X(2),Y(lowFn(2)),X(2)+26,Y(lowFn(2))-22,C.goldB,17);
  txt(s,X(2)+13,Y(lowFn(2))-30,'SLOPE',{'text-anchor':'middle','font-size':8.5,fill:C.gold,'letter-spacing':'.14em',class:'rlbl',style:'--i:17'});
  txt(s,L+plotW/2,H-9,'ASCENDING CHANNEL · LOWER RAIL BUYS, UPPER RAIL TARGETS  上升通道 · 下轨买 · 上轨卖',
    {'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.14em','font-family':FZH});
}

/* ============ 4. three channel types ============ */
function drawChannelTypes(box){
  const W=720,H=252,s=svgFor(box,W,H);
  const pw=216,gap=18,px0=16,py=44,ph=142;
  const panels=[
    {t:'ASCENDING',zh:'上升通道',c:C.bull,low:i=>30+0.95*i,up:i=>36+0.95*i,tL:[0,3],tU:[1,4],seed:1},
    {t:'DESCENDING',zh:'下降通道',c:C.bear,low:i=>38-0.95*i,up:i=>44-0.95*i,tL:[1,4],tU:[0,3],seed:2},
    {t:'HORIZONTAL',zh:'水平通道',c:C.gold,low:i=>36,up:i=>43,tL:[0,3],tU:[1,4],seed:3}
  ];
  const mn=33,mx=47;
  panels.forEach((p,pi)=>{
    const x=px0+pi*(pw+gap);
    const X=i=>x+20+(pw-32)/6*(i+0.5);
    const Y=v=>py+(mx-v)/(mx-mn)*ph;
    const bars=mkChan(p.low,p.up,6,p.seed,p.tL,p.tU);
    const bw=(pw-32)/6*0.5;
    el('polygon',{points:(X(0).toFixed(1)+','+Y(p.low(0)).toFixed(1))+' '+(X(5).toFixed(1)+','+Y(p.low(5)).toFixed(1))
      +' '+(X(5).toFixed(1)+','+Y(p.up(5)).toFixed(1))+' '+(X(0).toFixed(1)+','+Y(p.up(0)).toFixed(1)),
      fill:'rgba(232,200,119,.045)',class:'rlbl',style:'--i:12'},s);
    el('line',{x1:X(0),y1:Y(p.low(0)),x2:X(5),y2:Y(p.low(5)),stroke:C.gold,'stroke-width':1.8,class:'rline'},s);
    el('line',{x1:X(0),y1:Y(p.up(0)),x2:X(5),y2:Y(p.up(5)),stroke:C.gold,'stroke-width':1.4,
      'stroke-dasharray':'5 4','stroke-opacity':.7,class:'rline',style:'transition-delay:.5s'},s);
    candles(s,X,Y,bars,bw,pi*2);
    p.tL.forEach(i=>{const g=el('g',{style:'--i:'+(pi*2+4)},s);
      el('circle',{cx:X(i),cy:Y(p.low(i)),r:3.4,fill:C.bull,class:'rlbl'},g);});
    p.tU.forEach(i=>{const g=el('g',{style:'--i:'+(pi*2+5)},s);
      el('circle',{cx:X(i),cy:Y(p.up(i)),r:3.4,fill:'none',stroke:C.cyan,'stroke-width':1.4,class:'rlbl'},g);});
    txt(s,x+4,28,p.t,{'font-size':12,'font-weight':700,fill:p.c,'letter-spacing':'.14em',class:'rlbl',style:'--i:'+pi});
    txt(s,x+pw-4,28,p.zh,{'text-anchor':'end','font-size':11,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:'+pi});
  });
  txt(s,px0+pw*1.5,py+ph+24,'fade the rails  高抛低吸',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'font-family':FZH});
  txt(s,px0+pw*2.5+gap,py+ph+24,'sell rallies, buy dips  反弹卖 · 回踩买',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'font-family':FZH});
  txt(s,px0+pw*3.5+gap*2,py+ph+24,'range = accumulation  区间 = 蓄势',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'font-family':FZH});
}

/* ============ 5. valid breakout ============ */
function drawBreakout(box){
  const W=720,H=340,L=16,R=168,T=22,B=32;
  const s=svgFor(box,W,H);
  const mn=38,mx=64;
  const bars=[[58,56.5,59.5,55.6],[56.5,55,58,54.2],[55,54,57.2,52.9],[54,52.8,56,51.9],
              [52.8,51.5,54.8,50.6],[51.5,50.8,53.5,49.9],[50.8,52.2,54,49.6],[52.2,51,53.8,50.2],
              [51,50.2,53,49.3],[50.2,49.5,52.2,48.7],[49.5,49,51.8,48.1],
              [49,53,53.8,48.6],[53,51.8,54.2,48.5],[51.8,54,55.5,51.3],
              [54,55.8,57.2,53.4],[55.8,57.5,59,55.2],[57.5,59,60.4,56.8],[59,60.6,62,58.4]];
  const N=bars.length, plotW=W-L-R, plotH=H-T-B;
  const X=i=>L+plotW/N*(i+0.5);
  const Y=p=>T+(mx-p)/(mx-mn)*plotH;
  const bw=plotW/N*0.5;
  const tl=i=>62-1.2*i;
  /* zone above the broken line */
  el('polygon',{points:(X(11).toFixed(1)+','+Y(48.8).toFixed(1))+' '+(X(17).toFixed(1)+','+Y(41.6).toFixed(1))
    +' '+(X(17).toFixed(1)+','+T)+' '+(X(11).toFixed(1)+','+T),
    fill:'rgba(44,217,138,.05)',class:'rlbl',style:'--i:13'},s);
  el('line',{x1:X(0),y1:Y(62),x2:X(11),y2:Y(48.8),stroke:C.gold,'stroke-width':2,class:'rline'},s);
  el('line',{x1:X(11),y1:Y(48.8),x2:X(17),y2:Y(41.6),stroke:C.gold,'stroke-width':1.6,
    'stroke-dasharray':'6 5','stroke-opacity':.6,class:'rline',style:'transition-delay:.55s'},s);
  candles(s,X,Y,bars,bw,0);
  /* breakout marker */
  const gb=el('g',{style:'--i:10'},s);
  el('circle',{cx:X(11),cy:Y(53),r:8,fill:'rgba(232,200,119,.14)',stroke:C.goldB,'stroke-width':1.3,class:'rlbl'},gb);
  /* retest marker */
  const gr=el('g',{style:'--i:12'},s);
  el('circle',{cx:X(12),cy:Y(48.5),r:8,fill:'none',stroke:C.bull,'stroke-width':1.4,'stroke-dasharray':'3 3',class:'rlbl'},gr);
  /* continuation arrow */
  arrow(s,X(14),Y(52),X(16),Y(58),C.bull,14);
  /* right labels */
  const rx=L+plotW+14;
  txt(s,rx,Y(53)-10,'BREAKOUT',{'font-size':10,fill:C.goldB,'font-weight':700,class:'rlbl',style:'--i:14'});
  txt(s,rx,Y(53)+4,'close beyond the line',{'font-size':9.5,fill:C.muted2,class:'rlbl',style:'--i:14'});
  txt(s,rx,Y(53)+17,'收盘在线外',{'font-size':9.5,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:14'});
  txt(s,rx,Y(48.5)+10,'RETEST HOLDS',{'font-size':10,fill:C.bull,'font-weight':700,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(48.5)+24,'resistance → support',{'font-size':9.5,fill:C.muted2,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(48.5)+37,'阻力变成支撑',{'font-size':9.5,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:15'});
  txt(s,L+plotW/2,H-9,'VALID BREAKOUT · CLOSE, RETEST, CONTINUE  有效突破 · 收盘 · 回踩 · 延续',
    {'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.14em','font-family':FZH});
}

/* ============ 6. fakeout ============ */
function drawFakeout(box){
  const W=720,H=340,L=16,R=168,T=22,B=32;
  const s=svgFor(box,W,H);
  const mn=38,mx=64;
  const bars=[[58,56,59.5,55.2],[56,54.5,57.8,53.8],[54.5,53,56.4,52.4],[53,51.8,55.2,51],
              [51.8,50.5,53.8,49.8],[50.5,49.2,52.4,48.5],[49.2,50.5,52.2,48.3],[50.5,49.5,52,48.6],
              [49.5,48.2,51.5,47.5],[48.2,47,50.2,46.2],[47,46,49.2,45.3],
              [46,45.4,51.6,44.9],[45.4,44,47.8,43.4],[44,43,46.2,42.2],
              [43,41.8,45,40.9],[41.8,42.5,44.3,40.7],[42.5,41,44.2,40.2],[41,40.2,43,39.2]];
  const N=bars.length, plotW=W-L-R, plotH=H-T-B;
  const X=i=>L+plotW/N*(i+0.5);
  const Y=p=>T+(mx-p)/(mx-mn)*plotH;
  const bw=plotW/N*0.5;
  const tl=i=>62-1.1*i;
  /* danger zone above the line */
  el('polygon',{points:(X(8).toFixed(1)+','+Y(53.2).toFixed(1))+' '+(X(14).toFixed(1)+','+Y(46.6).toFixed(1))
    +' '+(X(14).toFixed(1)+','+T)+' '+(X(8).toFixed(1)+','+T),
    fill:'rgba(255,92,99,.05)',class:'rlbl',style:'--i:13'},s);
  el('line',{x1:X(0),y1:Y(62),x2:X(17),y2:Y(43.3),stroke:C.gold,'stroke-width':2,class:'rline'},s);
  candles(s,X,Y,bars,bw,0);
  /* trap marker */
  const gt=el('g',{style:'--i:10'},s);
  el('circle',{cx:X(11),cy:Y(51.6),r:8,fill:'rgba(255,92,99,.16)',stroke:C.bear,'stroke-width':1.3,class:'rlbl'},gt);
  /* decline arrow */
  arrow(s,X(13),Y(44),X(15),Y(41),C.bear,14);
  /* right labels */
  const rx=L+plotW+14;
  txt(s,rx,Y(51.6)-10,'THE TRAP',{'font-size':10,fill:C.bear,'font-weight':700,class:'rlbl',style:'--i:14'});
  txt(s,rx,Y(51.6)+4,'wick above · close back',{'font-size':9.5,fill:C.muted2,class:'rlbl',style:'--i:14'});
  txt(s,rx,Y(51.6)+17,'影线穿越 · 收盘回落',{'font-size':9.5,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:14'});
  txt(s,rx,Y(45.4)+8,'CLOSE IS THE VERDICT',{'font-size':10,fill:C.goldB,'font-weight':700,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(45.4)+22,'never trade the wick',{'font-size':9.5,fill:C.muted2,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(45.4)+35,'收盘才是判决',{'font-size':9.5,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:15'});
  txt(s,L+plotW/2,H-9,'FAKEOUT · WICK THROUGH, CLOSE BACK  假突破 · 影线穿越 · 收盘回落',
    {'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.14em','font-family':FZH});
}

/* ============ 7. trendline + MA confluence ============ */
function drawMAConfluence(box){
  const W=720,H=340,L=16,R=168,T=22,B=32;
  const s=svgFor(box,W,H);
  const mn=48,mx=78;
  const bars=[[53,54,55.2,52.4],[54,55.5,56.6,53],[55.5,54.8,56.8,53.9],[54.8,57,58.2,54.2],
              [57,58.2,59.4,56.2],[58.2,57.5,59.6,56.4],[57.5,60,61.2,56.6],[60,61.2,62.4,59.2],
              [61.2,60.5,62.6,59.6],[60.5,63,64.2,60],[63,64.2,65.4,62.2],
              [64.2,63.5,65.6,62.6],[63.5,62,64.4,61.3],[62,61.2,63.4,61.1],
              [61.2,62.8,64,60.7],[62.8,65,66.2,62.2],[65,66.5,67.8,64.2],[66.5,68,69.4,65.8]];
  const N=bars.length, plotW=W-L-R, plotH=H-T-B;
  const X=i=>L+plotW/N*(i+0.5);
  const Y=p=>T+(mx-p)/(mx-mn)*plotH;
  const bw=plotW/N*0.5;
  const tl=i=>53.2+0.68*(i-1);
  /* MA-5 of closes */
  const closes=bars.map(b=>b[1]);
  const ma=[];
  for(let i=0;i<N;i++){if(i>=4)ma.push([i,(closes[i-4]+closes[i-3]+closes[i-2]+closes[i-1]+closes[i])/5]);}
  /* confluence zone */
  el('rect',{x:X(12),y:Y(62.8),width:X(14)-X(12),height:Y(61.3)-Y(62.8),
    fill:'rgba(44,217,138,.09)',stroke:'rgba(44,217,138,.4)','stroke-dasharray':'3 3',class:'rlbl',style:'--i:12'},s);
  txt(s,X(13),Y(63.4),'CONFLUENCE',{'text-anchor':'middle','font-size':9,fill:C.goldB,'font-weight':700,'letter-spacing':'.12em',class:'rlbl',style:'--i:12'});
  txt(s,X(13),Y(64.2),'共振区',{'text-anchor':'middle','font-size':9,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:12'});
  /* trendline */
  el('line',{x1:X(1),y1:Y(53.2),x2:X(17),y2:Y(tl(17)),stroke:C.gold,'stroke-width':2,class:'rline'},s);
  /* MA curve */
  el('path',{d:ma.map((m,j)=>(j?'L':'M')+X(m[0]).toFixed(1)+','+Y(m[1]).toFixed(1)).join(' '),
    stroke:C.cyan,'stroke-width':2,class:'rline',style:'transition-delay:.5s'},s);
  candles(s,X,Y,bars,bw,0);
  /* touch at the confluence */
  el('circle',{cx:X(13),cy:Y(61.1),r:7,fill:'none',stroke:C.goldB,'stroke-width':1.4,'stroke-dasharray':'3 3',class:'rlbl',style:'--i:13'},s);
  /* entry arrow */
  arrow(s,X(14),Y(64),X(15.6),Y(66),C.bull,14);
  /* right labels */
  const rx=L+plotW+14;
  txt(s,rx,Y(53.2)-8,'TRENDLINE',{'font-size':10,fill:C.gold,'font-weight':700,class:'rlbl',style:'--i:14'});
  txt(s,rx,Y(53.2)+6,'structure 结构',{'font-size':9.5,fill:C.muted2,'font-family':FZH,class:'rlbl',style:'--i:14'});
  txt(s,rx,Y(62.8)+10,'MA-5',{'font-size':10,fill:C.cyan,'font-weight':700,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(62.8)+24,'momentum 动量',{'font-size':9.5,fill:C.muted2,'font-family':FZH,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(59.8),'line + MA agree',{'font-size':9.5,fill:C.muted2,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(59.8)+13,'线与均线同向',{'font-size':9.5,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:15'});
  txt(s,L+plotW/2,H-9,'PULLBACK INTO THE CONFLUENCE ZONE · ONE TOUCH, TWO REASONS  回踩共振区 · 一次触碰 · 两个理由',
    {'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.12em','font-family':FZH});
}

const RENDER={trendline:drawTrendline,tltypes:drawTLTypes,channel:drawChannel,
              channeltypes:drawChannelTypes,breakout:drawBreakout,fakeout:drawFakeout,
              ma:drawMAConfluence};
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

