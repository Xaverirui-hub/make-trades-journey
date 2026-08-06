
/* ===== MTJ EXAM MODULE - Module 10 ===== */
const MTJ_EXAM_KEY = "mtj_exam_pass_10";
const EXAM_QUESTIONS = [{"q": "You lose 50% of your account. What gain gets you back to break-even?", "opts": ["50%", "100%", "25%", "150%"], "ans": 1, "why": "Losses are asymmetric: after a 50% loss you need a 100% gain — loss % ÷ (1 − loss %).", "why_zh": "亏损是不对称的：亏损 50% 后需要盈利 100% 才能回本——亏损百分比 ÷ (1 − 亏损百分比)。"}, {"q": "With a 50% win rate over 100 trades, a run of 5 consecutive losses is…", "opts": ["Proof the system is broken", "Impossible", "Close to certain — normal randomness", "A signal to double size"], "ans": 2, "why": "At a 50% win rate a run of 5 losses is nearly certain over 100 trades. It is what randomness looks like, not a broken system.", "why_zh": "在 50% 胜率下，100 笔交易中出现 5 连亏几乎是必然的。这就是随机性的本来面目，不代表系统出了问题。"}, {"q": "What is the correct order for sizing a trade?", "opts": ["Pick the lot size, then place the stop", "Fix risk %, place the stop where invalidated, then derive lot size", "Choose leverage, then lots, then stop", "Set the target first, then the risk"], "ans": 1, "why": "Fix the risk amount first, place the stop where your analysis is invalidated, then calculate lot size — risk is fixed, lot size is an output.", "why_zh": "先确定风险金额，把止损放在分析失效的位置，再计算手数——风险是固定的，手数是算出来的结果。"}, {"q": "For EURUSD, 1.00 standard lot: one pip (0.0001) is worth…", "opts": ["$1", "$100", "$0.10", "$10"], "ans": 3, "why": "A standard forex lot is 100,000 units of base currency; for EURUSD one pip = $10 per lot.", "why_zh": "外汇标准手为 100,000 单位基准货币；对 EURUSD 来说，每手 1 点 = 10 美元。"}, {"q": "0.10 lots of gold with a $5 stop at 1:20 vs 1:500 leverage — the loss is…", "opts": ["$50 in both cases — leverage does not set risk", "$50 at 1:20 but $1,250 at 1:500", "Larger at higher leverage", "Zero at 1:500"], "ans": 0, "why": "Risk comes from lot size × stop distance only. Leverage only changes margin — same lots and stop mean the same loss at any leverage.", "why_zh": "风险只取决于手数 × 止损距离。杠杆只改变保证金——手数和止损相同，无论杠杆多少，亏损都一样。"}];
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
    res.innerHTML = "<div style='background:rgba(44,217,138,.1);border:1px solid rgba(44,217,138,.4);border-radius:14px;padding:22px;'><div style='color:var(--bull);font-weight:700;font-size:18px;margin-bottom:6px;'>🎉 PASSED - " + correct + "/" + total + " 通过!</div><div style='color:var(--muted);font-size:13.5px;'>Module 11 已解锁。回到目录继续学习。</div><a href='../MakeTradesJourney.html' style='display:inline-block;margin-top:14px;background:var(--gold);color:#0a0e14;border-radius:30px;padding:10px 24px;font-weight:600;font-size:13px;text-decoration:none;'>Continue · 继续</a></div>";
  } else {
    res.innerHTML = "<div style='background:rgba(255,92,99,.08);border:1px solid rgba(255,92,99,.35);border-radius:14px;padding:22px;'><div style='color:var(--bear);font-weight:700;font-size:18px;margin-bottom:6px;'>NOT PASSED - " + correct + "/" + total + " (" + Math.round(correct/total*100) + "%)</div><div style='color:var(--muted);font-size:13.5px;'>需要 70% (4/5)。阅读上面的错题解析，然后重试。</div></div>";
  }
  document.getElementById("examSubmit").style.display = "none";
  res.scrollIntoView({behavior:"smooth"});
}
renderExam();
