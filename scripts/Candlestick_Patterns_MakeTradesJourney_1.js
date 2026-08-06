
/* ===== MTJ EXAM MODULE - Module 04 ===== */
const MTJ_EXAM_KEY = "mtj_exam_pass_4";
const EXAM_QUESTIONS = [{"q": "What does the body of a candlestick show? 蜡烛实体表示什么？", "opts": ["The open-to-close range", "The session high and low", "Total traded volume", "The closing price only"], "ans": 0, "why": "The body spans open to close. The wicks (shadows) show the high and low of the period.", "why_zh": "实体涵盖开盘到收盘的区间。影线（上下影）显示该周期的最高价与最低价。"}, {"q": "A doji has almost no body. What does it signal? 几乎无实体的十字星代表什么？", "opts": ["Strong buying pressure", "Balance and indecision between buyers and sellers", "A guaranteed reversal", "Heavy volume"], "ans": 1, "why": "Open and close land at nearly the same price - total balance. Treat it as indecision and wait for confirmation.", "why_zh": "开盘价与收盘价几乎落在同一价位——完全均衡。把它视为犹豫不决，等待确认信号。"}, {"q": "Which pattern is a bullish reversal signal after a downtrend? 下跌末端哪个是看涨反转信号？", "opts": ["Hanging Man", "Shooting Star", "Three Red Crows", "Hammer"], "ans": 3, "why": "A hammer - small body on top with a long lower shadow - appears after a downtrend and hints that buyers fought back.", "why_zh": "锤子线——小实体在上方、带长下影线——出现在下跌趋势之后，暗示买方已开始反击。"}, {"q": "In a bullish engulfing pattern, which candle swallows which? 看涨吞没中谁吞谁？", "opts": ["A small green candle swallows a large red one", "A large red candle swallows a small green one", "A large green candle completely swallows the prior small red candle", "Two equal candles overlap"], "ans": 2, "why": "Bullish engulfing = a big green body completely covers the previous small red body, hinting the trend may turn up.", "why_zh": "看涨吞没 = 一根大阳线实体完全吞没前一根小阴线实体，暗示趋势可能转涨。"}, {"q": "A marubozu candle has no shadows at all. What does that tell you? 无影线的光头光脚线说明什么？", "opts": ["Indecision between the two sides", "Strong one-sided momentum", "A guaranteed reversal", "Very low volume"], "ans": 1, "why": "No shadows means price never pulled back - pure one-sided pressure in the direction of the candle.", "why_zh": "没有影线意味着价格从未回撤——完全单边的力量，方向与蜡烛一致。"}];
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
    res.innerHTML = "<div style='background:rgba(44,217,138,.1);border:1px solid rgba(44,217,138,.4);border-radius:14px;padding:22px;'><div style='color:var(--bull);font-weight:700;font-size:18px;margin-bottom:6px;'>🎉 PASSED - " + correct + "/" + total + " 通过!</div><div style='color:var(--muted);font-size:13.5px;'>Module 05 已解锁。回到目录继续学习。</div><a href='../MakeTradesJourney.html' style='display:inline-block;margin-top:14px;background:var(--gold);color:#0a0e14;border-radius:30px;padding:10px 24px;font-weight:600;font-size:13px;text-decoration:none;'>Continue · 继续</a></div>";
  } else {
    res.innerHTML = "<div style='background:rgba(255,92,99,.08);border:1px solid rgba(255,92,99,.35);border-radius:14px;padding:22px;'><div style='color:var(--bear);font-weight:700;font-size:18px;margin-bottom:6px;'>NOT PASSED - " + correct + "/" + total + " (" + Math.round(correct/total*100) + "%)</div><div style='color:var(--muted);font-size:13.5px;'>需要 70% (4/5)。阅读上面的错题解析，然后重试。</div></div>";
  }
  document.getElementById("examSubmit").style.display = "none";
  res.scrollIntoView({behavior:"smooth"});
}
renderExam();
