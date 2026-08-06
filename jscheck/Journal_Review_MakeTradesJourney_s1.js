
/* ===== MTJ EXAM MODULE - Module 11 ===== */
const MTJ_EXAM_KEY = "mtj_exam_pass_11";
const EXAM_QUESTIONS = [{"q": "Without a journal, at month-end you know…", "opts": ["Exactly which setup pays", "Your expectancy by setup", "Only the balance — whether you made money, not why", "Your rule-following rate"], "ans": 2, "why": "Without a journal you only have the balance. Memory distorts the rest — it over-remembers wins and recent trades, and rewrites reasons afterwards.", "why_zh": "没有交易日志，你只有账户余额。记忆会扭曲其余一切——它过度记住盈利和最近的交易，事后还会改写原因。"}, {"q": "Which field is the most important column in a journal entry?", "opts": ["Setup name", "Followed rules — kept or broke (yes/no)", "Entry time", "P&L in dollars"], "ans": 1, "why": "Kept/broke is the most important column — it is the one thing you can judge honestly on every single trade.", "why_zh": "遵守/违反规则是最重要的一栏——这是你在每一笔交易上都能诚实评判的唯一事项。"}, {"q": "You kept every rule but the trade lost. Which quadrant is this, and what do you do?", "opts": ["KEPT + LOSS — a good loss; change nothing", "BROKE + LOSS — deserved; double down", "KEPT + WIN — repeat forever", "BROKE + WIN — lock it in"], "ans": 0, "why": "A kept-rules loss is the cost of doing business. You did everything right — it is supposed to happen, often. Do not change anything.", "why_zh": "遵守规则的亏损是做交易的正常成本。你做得完全正确——这种情况经常发生，本就应该存在。不要做任何改动。"}, {"q": "Which quadrant is called the most expensive box on the page?", "opts": ["KEPT + LOSS", "KEPT + WIN", "BROKE + WIN — the market rewarded broken rules", "BROKE + LOSS"], "ans": 2, "why": "BROKE + WIN pays you for moving the stop or overtrading — exactly the behaviour that eventually destroys the account.", "why_zh": "违反规则 + 盈利会奖励你移动止损或过度交易——这正是最终毁掉账户的行为。"}, {"q": "Your true 50% win-rate system just lost 10 in a row. With under 30 trades, the right response is…", "opts": ["Change the core rules now", "Record only — change nothing; otherwise it is noise-chasing", "Cut the worst setup with confidence", "Double the risk to recover faster"], "ans": 1, "why": "Under 30 trades the observed win rate can range from 28% to 72% by chance alone. Changing the system after 10 losses is chasing noise, not discipline.", "why_zh": "在不到 30 笔交易的情况下，仅凭运气观察到的胜率就可能在 28% 到 72% 之间波动。连亏 10 次就改系统是在追逐噪音，不是纪律。"}];
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
    res.innerHTML = "<div style='background:rgba(44,217,138,.1);border:1px solid rgba(44,217,138,.4);border-radius:14px;padding:22px;'><div style='color:var(--bull);font-weight:700;font-size:18px;margin-bottom:6px;'>🎉 PASSED - " + correct + "/" + total + " 通过!</div><div style='color:var(--muted);font-size:13.5px;'>Module 12 已解锁。回到目录继续学习。</div><a href='../MakeTradesJourney.html' style='display:inline-block;margin-top:14px;background:var(--gold);color:#0a0e14;border-radius:30px;padding:10px 24px;font-weight:600;font-size:13px;text-decoration:none;'>Continue · 继续</a></div>";
  } else {
    res.innerHTML = "<div style='background:rgba(255,92,99,.08);border:1px solid rgba(255,92,99,.35);border-radius:14px;padding:22px;'><div style='color:var(--bear);font-weight:700;font-size:18px;margin-bottom:6px;'>NOT PASSED - " + correct + "/" + total + " (" + Math.round(correct/total*100) + "%)</div><div style='color:var(--muted);font-size:13.5px;'>需要 70% (4/5)。阅读上面的错题解析，然后重试。</div></div>";
  }
  document.getElementById("examSubmit").style.display = "none";
  res.scrollIntoView({behavior:"smooth"});
}
renderExam();
