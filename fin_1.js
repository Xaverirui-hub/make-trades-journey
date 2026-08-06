
/* ===== MTJ EXAM MODULE - Module 19 ===== */
const MTJ_EXAM_KEY = "mtj_exam_pass_19";
const EXAM_QUESTIONS = [{"q": "What does the Stochastic Oscillator measure?", "opts": ["Average gains vs average losses over N periods", "Where the closing price sits inside the recent high–low range", "Volume-weighted price momentum", "Distance from the 200-period moving average"], "ans": 1, "why": "%K = (Close − Lowest Low) ÷ (Highest High − Lowest Low) × 100. It locates the latest close inside the look-back range — a direct read on short-term momentum.", "why_zh": "%K =（收盘价 − 最低价）÷（最高价 − 最低价）× 100。它衡量最新收盘价在回看区间内的位置——直接反映短期动能。"}, {"q": "What are MT5's default Stochastic Oscillator parameters?", "opts": ["14, 3, 3", "5, 3, 3", "9, 1, 3", "20, 5, 5"], "ans": 1, "why": "MT5 defaults to 5, 3, 3 (%K period 5, %D period 3, slowing 3). The classic 14, 3, 3 is the other common choice — 14 is smoother, 5 is more sensitive.", "why_zh": "MT5 默认参数是 5, 3, 3（%K 周期 5、%D 周期 3、平滑 3）。经典的 14, 3, 3 是另一个常用选择——14 更平滑，5 更灵敏。"}, {"q": "A golden cross (%K crossing above %D) is most reliable when it happens…", "opts": ["Above 80", "Below 20", "Exactly at 50", "Anywhere — location doesn't matter"], "ans": 1, "why": "The classic bullish setup is a golden cross in the oversold zone (below 20). A golden cross near 80 is late, and in strong trends it is often a false signal.", "why_zh": "经典的看涨形态是超卖区（20 以下）的金叉。在 80 附近的金叉太晚，强趋势里还常常是假信号。"}, {"q": "Bearish divergence means…", "opts": ["Price makes a higher high but %K makes a lower high", "%K crosses below %D below 20", "Both %K and %D stay above 80", "Price makes a lower low while %K makes a higher low"], "ans": 0, "why": "Price printing a new high while %K fails to confirm means momentum is fading — a warning that the move may be exhausting. It is a filter, not a standalone reversal signal.", "why_zh": "价格创新高但 %K 没有同步创新高，说明动能正在衰竭——这波上涨可能接近尾声的警告。它是过滤器，不是独立的反转信号。"}, {"q": "The most common misuse of Stochastic is…", "opts": ["Using it in ranging markets", "Using it as a standalone system in strong trends — it pins in the 80+/20− zones and fires premature counter-trend signals", "Setting the %K period below 5", "Combining it with RSI"], "ans": 1, "why": "Stochastic is a range-bound tool. In a strong trend it stalls (钝化), camping above 80 or below 20, so counter-trend overbought/oversold trades get run over. Use it in ranges or as a trend-filtered timing tool.", "why_zh": "随机指标是震荡市工具。强趋势中它会钝化，长期贴死在 80 上方或 20 下方，逆势的超买/超卖交易会被趋势碾过去。应该只在震荡市用，或作为顺势的择时工具。"}];
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
    res.innerHTML = "<div style='background:rgba(44,217,138,.1);border:1px solid rgba(44,217,138,.4);border-radius:14px;padding:22px;'><div style='color:var(--bull);font-weight:700;font-size:18px;margin-bottom:6px;'>🎉 PASSED - " + correct + "/" + total + " 通过!</div><div style='color:var(--muted);font-size:13.5px;'>Module 20 已解锁。回到目录继续学习。</div><a href='../MakeTradesJourney.html' style='display:inline-block;margin-top:14px;background:var(--gold);color:#0a0e14;border-radius:30px;padding:10px 24px;font-weight:600;font-size:13px;text-decoration:none;'>Continue · 继续</a></div>";
  } else {
    res.innerHTML = "<div style='background:rgba(255,92,99,.08);border:1px solid rgba(255,92,99,.35);border-radius:14px;padding:22px;'><div style='color:var(--bear);font-weight:700;font-size:18px;margin-bottom:6px;'>NOT PASSED - " + correct + "/" + total + " (" + Math.round(correct/total*100) + "%)</div><div style='color:var(--muted);font-size:13.5px;'>需要 70% (4/5)。阅读上面的错题解析，然后重试。</div></div>";
  }
  document.getElementById("examSubmit").style.display = "none";
  res.scrollIntoView({behavior:"smooth"});
}
renderExam();
