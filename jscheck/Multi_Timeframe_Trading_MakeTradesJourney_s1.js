
/* ===== MTJ EXAM MODULE - Module 08 ===== */
const MTJ_EXAM_KEY = "mtj_exam_pass_8";
const EXAM_QUESTIONS = [{"q": "The core idea of multi-timeframe trading is to: 多周期交易的核心是？", "opts": ["Use a higher timeframe for the trend and a lower one for entry timing", "Trade on as many timeframes as possible", "Only ever look at one timeframe", "Always trade against the higher timeframe"], "ans": 0, "why": "Zoom out for the trend and bias, zoom in for the precise entry - one timeframe alone gives only part of the picture.", "why_zh": "先放大看趋势与方向倾向，再缩小看精确入场——只看单一周期只能得到部分信息。"}, {"q": "The recommended timeframes are usually about how far apart? 推荐的时间周期通常相隔多少？", "opts": ["The same size", "4-6 times apart", "100 times apart", "1.5 times apart"], "ans": 1, "why": "The 3-tier structure uses timeframes roughly 4-6x apart, for example daily to H4 to H1.", "why_zh": "三层结构使用相隔约 4-6 倍的周期，例如日线到 H4 再到 H1。"}, {"q": "In the top-down workflow, what is the job of the higher timeframe? 自上而下流程中，高周期的任务是什么？", "opts": ["Set the trend and bias", "Give the exact entry tick", "Set the stop loss", "Confirm the news"], "ans": 0, "why": "Step 1: on the higher timeframe you find the trend and key levels - that sets your bias.", "why_zh": "第一步：在高周期上找到趋势和关键价位——这就确定了你的方向倾向。"}, {"q": "If the higher timeframe trend is up, you should: 高周期趋势向上时你应该？", "opts": ["Look for short setups", "Only look for buys", "Trade both directions", "Stop trading"], "ans": 1, "why": "Golden rule: always trade in the direction of the higher timeframe - an up trend means only buys.", "why_zh": "黄金法则：永远顺着高周期的方向交易——上升趋势意味着只做多。"}, {"q": "What is the lower timeframe used for? 低周期用来做什么？", "opts": ["Deciding the trend", "Setting the bias", "Timing the entry with a trigger", "Ignoring it"], "ans": 2, "why": "The lower timeframe provides the trigger for a precise entry with a tight stop - timing only, never to fight the trend.", "why_zh": "低周期提供精确入场和紧凑止损的触发信号——只负责择时，绝不逆势交易。"}];
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
    res.innerHTML = "<div style='background:rgba(44,217,138,.1);border:1px solid rgba(44,217,138,.4);border-radius:14px;padding:22px;'><div style='color:var(--bull);font-weight:700;font-size:18px;margin-bottom:6px;'>🎉 PASSED - " + correct + "/" + total + " 通过!</div><div style='color:var(--muted);font-size:13.5px;'>Module 09 已解锁。回到目录继续学习。</div><a href='../MakeTradesJourney.html' style='display:inline-block;margin-top:14px;background:var(--gold);color:#0a0e14;border-radius:30px;padding:10px 24px;font-weight:600;font-size:13px;text-decoration:none;'>Continue · 继续</a></div>";
  } else {
    res.innerHTML = "<div style='background:rgba(255,92,99,.08);border:1px solid rgba(255,92,99,.35);border-radius:14px;padding:22px;'><div style='color:var(--bear);font-weight:700;font-size:18px;margin-bottom:6px;'>NOT PASSED - " + correct + "/" + total + " (" + Math.round(correct/total*100) + "%)</div><div style='color:var(--muted);font-size:13.5px;'>需要 70% (4/5)。阅读上面的错题解析，然后重试。</div></div>";
  }
  document.getElementById("examSubmit").style.display = "none";
  res.scrollIntoView({behavior:"smooth"});
}
renderExam();
