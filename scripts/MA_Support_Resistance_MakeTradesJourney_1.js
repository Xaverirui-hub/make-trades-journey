
/* ===== MTJ EXAM MODULE - Module 06 ===== */
const MTJ_EXAM_KEY = "mtj_exam_pass_6";
const EXAM_QUESTIONS = [{"q": "What is the main difference between an SMA and an EMA? SMA 与 EMA 的主要区别？", "opts": ["SMA weighs every candle equally; EMA gives more weight to recent prices and reacts faster", "EMA is always slower than SMA", "SMA uses only the highest price", "EMA ignores closing prices"], "ans": 0, "why": "SMA weights all candles equally, while EMA favors recent prices - so the EMA turns faster and hugs price more closely.", "why_zh": "SMA 对所有蜡烛一视同仁，EMA 则更看重近期价格——因此 EMA 转向更快、更贴近价格。"}, {"q": "A golden cross happens when: 金叉发生在？", "opts": ["The fast MA crosses above the slow MA", "The slow MA crosses above the fast MA", "Price touches the 200 MA", "The 50 MA goes flat"], "ans": 0, "why": "Golden Cross = fast MA crossing above the slow MA - a bullish momentum shift. The Death Cross is the reverse.", "why_zh": "金叉 = 快线上穿慢线——看涨动能转变。死叉则相反。"}, {"q": "In an uptrend, a rising moving average acts as: 上涨中上升的均线扮演什么角色？", "opts": ["Dynamic resistance", "Dynamic support", "A volume indicator", "A guaranteed sell signal"], "ans": 1, "why": "Price keeps dipping back to the rising MA and bouncing - each pullback is a potential long entry.", "why_zh": "价格不断回踩上升的均线并反弹——每一次回踩都是潜在的多头入场点。"}, {"q": "When a support level breaks and price returns to it, the old support usually becomes: 支撑跌破后回踩时，旧支撑通常变成？", "opts": ["Resistance (role reversal)", "Stronger support", "A double bottom", "A gap"], "ans": 0, "why": "Role reversal - once broken, support flips into resistance. The retest is the clean entry zone.", "why_zh": "角色互换——一旦跌破，支撑就变成阻力。回踩测试就是干净的入场区域。"}, {"q": "How should support and resistance levels be treated? 支撑阻力应如何对待？", "opts": ["As exact prices to the tick", "As zones, not lines", "As permanent levels", "As only valid on daily charts"], "ans": 1, "why": "Price rarely respects an exact price - treat levels as zones and read how price behaves inside them.", "why_zh": "价格很少精确到某个价位——把支撑阻力当作区域而非线条，观察价格在区域内的表现。"}];
function renderExam(){
  var box = document.getElementById("examBox"); if(!box) return;
  EXAM_QUESTIONS.forEach(function(item, qi){
    var card = document.createElement("div");
    card.style.cssText = "background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:22px;";
    var head = document.createElement("div");
    head.style.cssText = "font-family:monospace;font-size:11px;color:var(--gold);letter-spacing:.15em;margin-bottom:8px;";
    head.textContent = "QUESTION " + (qi+1) + " / " + EXAM_QUESTIONS.length;
    card.appendChild(head);
    var q = document.createElement("div");
    q.style.cssText = "font-weight:600;font-size:15px;color:var(--text);margin-bottom:14px;";
    q.textContent = item.q;
    card.appendChild(q);
    item.opts.forEach(function(opt, oi){
      var label = document.createElement("label");
      label.style.cssText = "display:flex;align-items:center;gap:10px;padding:10px 14px;margin:6px 0;border:1px solid var(--line-soft);border-radius:8px;cursor:pointer;font-size:14px;color:var(--text);transition:.2s;";
      var radio = document.createElement("input");
      radio.type = "radio"; radio.name = "exam_q" + qi; radio.value = oi;
      radio.style.cssText = "accent-color:var(--gold);";
      label.appendChild(radio);
      label.appendChild(document.createTextNode(opt));
      card.appendChild(label);
    });
    var fb = document.createElement("div");
    fb.id = "exam_fb_" + qi;
    fb.style.cssText = "margin-top:10px;font-size:13px;line-height:1.7;display:none;";
    card.appendChild(fb);
    box.appendChild(card);
  });
}
function gradeExam(){
  var correct = 0, answered = 0;
  var total = EXAM_QUESTIONS.length;
  EXAM_QUESTIONS.forEach(function(item, qi){
    var sel = document.querySelector("input[name=exam_q" + qi + "]:checked");
    var fb = document.getElementById("exam_fb_" + qi);
    if(sel){
      answered++;
      var user = parseInt(sel.value);
      var zhMode = document.body.classList.contains('lang-zh');
      var whyTxt = (zhMode && item.why_zh) ? item.why_zh : item.why;
      if(user === item.ans){
        correct++;
        fb.innerHTML = "<span style='color:var(--bull);font-weight:600;'>✓ Correct 正确</span><br><span style='color:var(--muted);font-size:12.5px;'>" + whyTxt + "</span>";
      } else {
        fb.innerHTML = "<span style='color:var(--bear);font-weight:600;'>✗ Wrong 错误</span><br><span style='color:var(--muted);font-size:12.5px;'>你的答案: <b>" + item.opts[user] + "</b> · 正确答案: <b>" + item.opts[item.ans] + "</b><br>为什么错: " + whyTxt + "</span>";
      }
      fb.style.display = "block";
    } else {
      fb.innerHTML = "<span style='color:var(--muted);'>⚠ 未作答</span>";
      fb.style.display = "block";
    }
  });
  if(answered < total){
    document.getElementById("examResult").innerHTML = "<span style='color:var(--bear);font-weight:600;'>请回答全部 " + total + " 题再提交。</span>";
    return;
  }
  var res = document.getElementById("examResult");
  if(correct >= 4){
    localStorage.setItem(MTJ_EXAM_KEY, "1");
    res.innerHTML = "<div style='background:rgba(44,217,138,.1);border:1px solid rgba(44,217,138,.4);border-radius:14px;padding:22px;'><div style='color:var(--bull);font-weight:700;font-size:18px;margin-bottom:6px;'>🎉 PASSED - " + correct + "/" + total + " 通过!</div><div style='color:var(--muted);font-size:13.5px;'>Module 07 已解锁。回到目录继续学习。</div><a href='../MakeTradesJourney.html' style='display:inline-block;margin-top:14px;background:var(--gold);color:#0a0e14;border-radius:30px;padding:10px 24px;font-weight:600;font-size:13px;text-decoration:none;'>Continue · 继续</a></div>";
  } else {
    res.innerHTML = "<div style='background:rgba(255,92,99,.08);border:1px solid rgba(255,92,99,.35);border-radius:14px;padding:22px;'><div style='color:var(--bear);font-weight:700;font-size:18px;margin-bottom:6px;'>NOT PASSED - " + correct + "/" + total + " (" + Math.round(correct/total*100) + "%)</div><div style='color:var(--muted);font-size:13.5px;'>需要 70% (4/5)。阅读上面的错题解析，然后重试。</div></div>";
  }
  document.getElementById("examSubmit").style.display = "none";
  res.scrollIntoView({behavior:"smooth"});
}
renderExam();
