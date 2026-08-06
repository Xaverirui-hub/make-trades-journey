
/* ===== MTJ EXAM MODULE - Module 02 ===== */
const MTJ_EXAM_KEY = "mtj_exam_pass_2";
const EXAM_QUESTIONS = [{"q": "Technical analysis studies: 技术分析研究什么？", "opts": ["The price chart itself", "Central bank policies", "Trader emotions", "Economic growth"], "ans": 0, "why": "Technical analysis reads the price chart directly - everything important is assumed to be reflected in price.", "why_zh": "技术分析直接读取价格图表——所有重要信息都假定已反映在价格中。"}, {"q": "Which is a fundamental factor that can strengthen a currency? 哪个基本面因素可能使货币走强？", "opts": ["A single green candlestick", "A strong economy and rising interest rates", "High social media buzz", "A Fibonacci retracement"], "ans": 1, "why": "Real-world forces such as a strong economy and rising rates change the supply and demand of a currency - fundamental analysis.", "why_zh": "强劲经济与加息等现实力量会改变货币的供需——这就是基本面分析。"}, {"q": "Sentiment analysis is mainly about: 情绪分析主要关注什么？", "opts": ["Exact price levels", "Company earnings", "How traders feel and where the crowd is positioned", "Chart patterns"], "ans": 2, "why": "Sentiment reads fear and greed - when almost everyone is on one side, the market can be primed to turn.", "why_zh": "情绪分析解读恐惧与贪婪——当几乎所有人都站在同一侧时，市场往往已酝酿反转。"}, {"q": "Which tool belongs to sentiment analysis? 哪个工具属于情绪分析？", "opts": ["Moving averages", "GDP reports", "Support and resistance", "Fear and Greed index"], "ans": 3, "why": "The Fear and Greed index, positioning data and social buzz are sentiment tools.", "why_zh": "恐惧与贪婪指数、持仓数据以及社交媒体热度都属于情绪分析工具。"}, {"q": "A common way to combine the three types is: 三种分析常用的组合方式是？", "opts": ["Use them one at a time in separate trades", "Use only fundamentals", "Technicals for entry, fundamentals for direction, sentiment for timing", "Only technical analysis"], "ans": 2, "why": "Many traders lead with one and confirm with the others: technicals for the entry, fundamentals for the direction, sentiment for the timing of turns.", "why_zh": "许多交易者以一种分析为主导、用其他分析来确认：技术面找入场点，基本面定方向，情绪面择反转时机。"}];
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
    res.innerHTML = "<div style='background:rgba(44,217,138,.1);border:1px solid rgba(44,217,138,.4);border-radius:14px;padding:22px;'><div style='color:var(--bull);font-weight:700;font-size:18px;margin-bottom:6px;'>🎉 PASSED - " + correct + "/" + total + " 通过!</div><div style='color:var(--muted);font-size:13.5px;'>Module 03 已解锁。回到目录继续学习。</div><a href='../MakeTradesJourney.html' style='display:inline-block;margin-top:14px;background:var(--gold);color:#0a0e14;border-radius:30px;padding:10px 24px;font-weight:600;font-size:13px;text-decoration:none;'>Continue · 继续</a></div>";
  } else {
    res.innerHTML = "<div style='background:rgba(255,92,99,.08);border:1px solid rgba(255,92,99,.35);border-radius:14px;padding:22px;'><div style='color:var(--bear);font-weight:700;font-size:18px;margin-bottom:6px;'>NOT PASSED - " + correct + "/" + total + " (" + Math.round(correct/total*100) + "%)</div><div style='color:var(--muted);font-size:13.5px;'>需要 70% (4/5)。阅读上面的错题解析，然后重试。</div></div>";
  }
  document.getElementById("examSubmit").style.display = "none";
  res.scrollIntoView({behavior:"smooth"});
}
renderExam();
