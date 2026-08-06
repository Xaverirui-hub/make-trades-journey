
/* ===== MTJ EXAM MODULE - Module 12 ===== */
const MTJ_EXAM_KEY = "mtj_exam_pass_12";
const EXAM_QUESTIONS = [{"q": "Per prospect theory, losing $100 feels…", "opts": ["About the same as winning $100", "Roughly twice as bad as winning $100 feels good", "Ten times worse", "Only half as bad as winning feels good"], "ans": 1, "why": "Kahneman and Tversky showed losses are felt roughly twice as strongly as equal gains — the value curve is not symmetric.", "why_zh": "卡尼曼和特沃斯基的研究表明，亏损带来的痛苦大约是同等盈利带来快乐的 2 倍——价值曲线是不对称的。"}, {"q": "The disposition effect is the tendency to…", "opts": ["Sell winners too early and hold losers too long", "Buy at the lower rail of a channel", "Trade only at emotion score 5", "Average down on every loser"], "ans": 0, "why": "It is the documented tendency to cut winners early and hold losers too long — the opposite of what a positive-expectancy system needs.", "why_zh": "这是有据可查的倾向：过早了结盈利单、过久持有亏损单——与正期望系统所需要的恰恰相反。"}, {"q": "You just took a loss. What does the course say to do next?", "opts": ["Re-enter immediately at double size", "Stand up and leave the screen for 30 minutes — a rule, not a suggestion", "Move the stop to give the trade room", "Treat it as proof the system is broken"], "ans": 1, "why": "The trade right after a loss is the worst decision you will make all day. The 30-minute break plus the daily stop interrupt the revenge spiral.", "why_zh": "亏损后的下一笔交易将是你一天中最糟糕的决定。30 分钟离场休息加上每日止损限制，可以打断报复性交易循环。"}, {"q": "Widening your stop as price approaches it converts…", "opts": ["A planned 1R loss into an unplanned ~4R loss", "A loss into a win", "Nothing — stops are flexible", "1R into 2R"], "ans": 0, "why": "Moving the stop is the single most expensive retail habit. The stop only ever moves in your favour; if you widened it, log it as broke rules even if it wins.", "why_zh": "移动止损是散户最昂贵的习惯。止损只能朝有利方向移动；如果你放宽了止损，即使盈利也要记作违反规则。"}, {"q": "A large share of blown accounts happen right after…", "opts": ["The worst losing streak of the year", "The best winning run of the year — house money and overconfidence", "A completely flat month", "Switching brokers"], "ans": 1, "why": "After wins, profits feel like house money and success gets attributed to skill, so size creeps up. Risk % is set monthly — never raised mid-good-week.", "why_zh": "盈利之后，利润感觉像“捡来的钱”，成功被归因于能力，仓位就会悄悄加大。风险百分比按月设定——绝不在顺风的一周中途调高。"}];
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
    res.innerHTML = "<div style='background:rgba(44,217,138,.1);border:1px solid rgba(44,217,138,.4);border-radius:14px;padding:22px;'><div style='color:var(--bull);font-weight:700;font-size:18px;margin-bottom:6px;'>🎉 PASSED - " + correct + "/" + total + " 通过!</div><div style='color:var(--muted);font-size:13.5px;'>Module 13 已解锁。回到目录继续学习。</div><a href='../MakeTradesJourney.html' style='display:inline-block;margin-top:14px;background:var(--gold);color:#0a0e14;border-radius:30px;padding:10px 24px;font-weight:600;font-size:13px;text-decoration:none;'>Continue · 继续</a></div>";
  } else {
    res.innerHTML = "<div style='background:rgba(255,92,99,.08);border:1px solid rgba(255,92,99,.35);border-radius:14px;padding:22px;'><div style='color:var(--bear);font-weight:700;font-size:18px;margin-bottom:6px;'>NOT PASSED - " + correct + "/" + total + " (" + Math.round(correct/total*100) + "%)</div><div style='color:var(--muted);font-size:13.5px;'>需要 70% (4/5)。阅读上面的错题解析，然后重试。</div></div>";
  }
  document.getElementById("examSubmit").style.display = "none";
  res.scrollIntoView({behavior:"smooth"});
}
renderExam();
