
/* ===== MTJ EXAM MODULE - Module 20 ===== */
const MTJ_EXAM_KEY = "mtj_exam_pass_20";
const EXAM_QUESTIONS = [{"q": "What does MT5's MACD (12, 26, 9) actually draw?", "opts": ["Two moving-average lines overlaid on the price chart", "A separate window with one MACD line, one signal line and a red/green histogram", "A single line that predicts future price", "Three oscillators stacked in one panel"], "ans": 1, "why": "MT5's MACD is a single-window indicator: the MACD line (EMA12 − EMA26), the signal line (EMA9 of the line) and the red/green histogram, drawn below price in an accessory window.", "why_zh": "MT5 的 MACD 是单窗口指标：一条 MACD 线（EMA12 − EMA26）、一条信号线（线的 9 期 EMA）和红绿柱状图，画在价格下方的附属窗口里。"}, {"q": "The histogram bar of MT5's MACD equals…", "opts": ["EMA(26) − EMA(12)", "MACD line − Signal line", "Close price − EMA(12)", "Signal line − Close price"], "ans": 1, "why": "Histogram = MACD line − Signal line. It measures the gap (acceleration) between the two lines — when the gap shrinks, momentum is decaying.", "why_zh": "柱状图 = MACD 线 − 信号线。它度量两条线之间的差距（加速度）——差距收缩时，动能正在衰减。"}, {"q": "A golden cross happens when…", "opts": ["Price makes a new high", "The MACD line cuts up through the signal line", "The histogram turns green", "The MACD line crosses the zero line upward"], "ans": 1, "why": "A golden cross is the MACD line crossing up through the signal line — momentum picking up. A zero-line cross is a completely different signal.", "why_zh": "金叉是 MACD 线向上穿过信号线——动能增强。穿越零轴是另一个完全不同的信号。"}, {"q": "The histogram bars shrink toward zero while you are long. What does this mean?", "opts": ["The move is accelerating — add size", "Momentum is decaying — start managing the trade", "Nothing; only crosses matter", "Reverse the position immediately"], "ans": 1, "why": "Shrinking bars mean line and signal are converging — the push is losing fuel. It is the earliest exit warning, not an instant reverse signal.", "why_zh": "柱子收缩意味着线与信号线正在靠拢——这波推力正在失去燃料。这是最早的离场预警，不是立刻反手信号。"}, {"q": "In a ranging market, most MACD crosses are…", "opts": ["Reliable reversal signals", "False signals — noise produced by the oscillation itself", "Stronger than in trends", "Only valid above zero"], "ans": 1, "why": "In a range, price oscillates around a value and MACD oscillates around zero — every swing manufactures a cross. Filter by trend and the zero line first.", "why_zh": "震荡市里价格围绕一个中枢摆动，MACD 也围绕零轴摆动——每一次摆动都会制造一个交叉。先用趋势和零轴过滤。"}];
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
    res.innerHTML = "<div style='background:rgba(44,217,138,.1);border:1px solid rgba(44,217,138,.4);border-radius:14px;padding:22px;'><div style='color:var(--bull);font-weight:700;font-size:18px;margin-bottom:6px;'>🎉 PASSED - " + correct + "/" + total + " 通过!</div><div style='color:var(--muted);font-size:13.5px;'>课程全部完成!恭喜毕业!回到目录查看你的学习成果。</div><a href='../MakeTradesJourney.html' style='display:inline-block;margin-top:14px;background:var(--gold);color:#0a0e14;border-radius:30px;padding:10px 24px;font-weight:600;font-size:13px;text-decoration:none;'>查看目录 · Back to Catalog</a></div>";
  } else {
    res.innerHTML = "<div style='background:rgba(255,92,99,.08);border:1px solid rgba(255,92,99,.35);border-radius:14px;padding:22px;'><div style='color:var(--bear);font-weight:700;font-size:18px;margin-bottom:6px;'>NOT PASSED - " + correct + "/" + total + " (" + Math.round(correct/total*100) + "%)</div><div style='color:var(--muted);font-size:13.5px;'>需要 70% (4/5)。阅读上面的错题解析，然后重试。</div></div>";
  }
  document.getElementById("examSubmit").style.display = "none";
  res.scrollIntoView({behavior:"smooth"});
}
renderExam();
