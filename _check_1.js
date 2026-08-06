
/* ===== MTJ EXAM MODULE - Module 18 ===== */
const MTJ_EXAM_KEY = "mtj_exam_pass_18";
const EXAM_QUESTIONS = [{"q": "RSI stands for Relative Strength Index. What does it actually measure?", "opts": ["The trend direction of the market", "The speed and size of recent price moves, compressed to 0–100", "Volume flowing into the asset", "The distance to the next support level"], "ans": 1, "why": "RSI measures momentum — the speed and magnitude of recent price changes — and normalizes it to a 0–100 oscillator. It does not measure direction, volume, or distance to levels.", "why_zh": "RSI 衡量动能——近期价格变化的速度与幅度——并归一化到 0–100。它不衡量方向、成交量，也不衡量到关键位的距离。"}, {"q": "In a strong uptrend, RSI sits at 75 with no divergence. The best action is…", "opts": ["Short immediately because it is overbought", "Wait for a pullback and buy — overbought is normal in a trend", "Close all positions and sit out", "Buy at market chasing the move"], "ans": 1, "why": "In a strong trend RSI can stay above 70 for a long time. Overbought is the trend's normal state; fading it loses money. The correct play is buying pullbacks, not shorting strength.", "why_zh": "强趋势中 RSI 可以长时间待在 70 上方。超买是趋势的常态；反手做空会亏钱。正确做法是等回调买入，而不是逆着强势做空。"}, {"q": "Price makes a higher high, but RSI makes a lower high. This is…", "opts": ["Bullish (bottom) divergence — buy", "A normal trend continuation", "Bearish (top) divergence — momentum not confirming", "A signal that RSI is broken"], "ans": 2, "why": "Price higher high + RSI lower high = bearish (top) divergence. The move is not confirmed by momentum, which in a range often precedes a reversal.", "why_zh": "价格创新高 + RSI 不创新高 = 顶背离（看跌）。这波上涨没有得到动能确认，在震荡市里往往预示着反转。"}, {"q": "RSI crossing above the 50 midline from below suggests…", "opts": ["The market is about to crash", "Bulls have taken control of the last 14 periods", "You should double your position", "The indicator is overbought"], "ans": 1, "why": "50 is where average gains equal average losses. A cross above it means buyers controlled the recent candles — momentum has shifted bullish. It is a trend filter, not an overbought reading.", "why_zh": "50 是平均涨幅等于平均跌幅的位置。站上 50 意味着最近 14 期由买方掌控——动能转多。它是趋势过滤器，不是超买信号。"}, {"q": "Which combination is the strongest RSI-based setup in a range?", "opts": ["RSI at 45 with no other context", "Price at resistance + bearish divergence + rejection candle", "RSI crossing 50 on M1", "RSI at 30 in a strong downtrend"], "ans": 1, "why": "RSI works as a confirmation filter: a level (resistance) + momentum warning (divergence) + price action (rejection candle) all agree. Context, level and confirmation — never the indicator alone.", "why_zh": "RSI 是确认过滤器：关键位（阻力）+ 动能警告（顶背离）+ 价格行为（拒绝 K 线）三者共振。背景 + 关键位 + 确认——绝不让指标单独做决定。"}];
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
    res.innerHTML = "<div style='background:rgba(44,217,138,.1);border:1px solid rgba(44,217,138,.4);border-radius:14px;padding:22px;'><div style='color:var(--bull);font-weight:700;font-size:18px;margin-bottom:6px;'>🎉 PASSED - " + correct + "/" + total + " 通过!</div><div style='color:var(--muted);font-size:13.5px;'>Module 19 已解锁。回到目录继续学习。</div><a href='../MakeTradesJourney.html' style='display:inline-block;margin-top:14px;background:var(--gold);color:#0a0e14;border-radius:30px;padding:10px 24px;font-weight:600;font-size:13px;text-decoration:none;'>Continue · 继续</a></div>";
  } else {
    res.innerHTML = "<div style='background:rgba(255,92,99,.08);border:1px solid rgba(255,92,99,.35);border-radius:14px;padding:22px;'><div style='color:var(--bear);font-weight:700;font-size:18px;margin-bottom:6px;'>NOT PASSED - " + correct + "/" + total + " (" + Math.round(correct/total*100) + "%)</div><div style='color:var(--muted);font-size:13.5px;'>需要 70% (4/5)。阅读上面的错题解析，然后重试。</div></div>";
  }
  document.getElementById("examSubmit").style.display = "none";
  res.scrollIntoView({behavior:"smooth"});
}
renderExam();
