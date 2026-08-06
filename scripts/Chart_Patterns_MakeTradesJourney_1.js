
/* ===== MTJ EXAM MODULE - Module 05 ===== */
const MTJ_EXAM_KEY = "mtj_exam_pass_5";
const EXAM_QUESTIONS = [{"q": "What is a double top? 什么是双顶？", "opts": ["Two failed attempts at the same high, then a break below the neckline", "Two equal lows followed by a rally", "Three peaks with a higher middle peak", "A small pullback after a strong rally"], "ans": 0, "why": "The M-shape fails twice at resistance, then breaks the neckline - a bearish reversal.", "why_zh": "M 形两次在阻力位失败，随后跌破颈线——这是看跌反转形态。"}, {"q": "In a head and shoulders pattern, when is the reversal confirmed? 头肩顶何时确认反转？", "opts": ["When price touches the head", "When price breaks the neckline connecting the two valleys", "When the right shoulder forms", "When volume doubles"], "ans": 1, "why": "The neckline break is the confirmation; the head and shoulders are just the setup.", "why_zh": "跌破颈线才是确认信号；头肩形态本身只是形态结构（前奏）。"}, {"q": "A symmetrical triangle usually breaks out in which direction? 对称三角形通常向哪个方向突破？", "opts": ["The direction of the prior trend", "Always against the prior trend", "Sideways with no clear direction", "Only at the very tip"], "ans": 0, "why": "It is a continuation pattern - price usually keeps moving in the trend that existed before the triangle.", "why_zh": "它是持续形态——价格通常会延续三角形形成之前的原有趋势继续运行。"}, {"q": "In a bull flag, what is the flag? 牛旗中旗面指什么？", "opts": ["The sharp initial rally", "The small counter-trend pullback after the pole", "The measured-move target", "The neckline"], "ans": 1, "why": "The pole is the sharp move; the flag is the small pause against the trend before the breakout continues up.", "why_zh": "旗杆是凌厉的拉升；旗面是突破继续向上之前、逆势的小幅回调整理。"}, {"q": "How is the measured-move target of a double bottom calculated? 双底的量度目标怎么算？", "opts": ["Projecting the pattern height from the neckline", "Doubling the width of the pattern", "Adding the flag pole height", "Halving the whole range"], "ans": 0, "why": "Target = the pattern height projected from the neckline - the standard measured move.", "why_zh": "目标位 = 从颈线向上投射形态高度——标准的量度移动目标。"}];
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
    res.innerHTML = "<div style='background:rgba(44,217,138,.1);border:1px solid rgba(44,217,138,.4);border-radius:14px;padding:22px;'><div style='color:var(--bull);font-weight:700;font-size:18px;margin-bottom:6px;'>🎉 PASSED - " + correct + "/" + total + " 通过!</div><div style='color:var(--muted);font-size:13.5px;'>Module 06 已解锁。回到目录继续学习。</div><a href='../MakeTradesJourney.html' style='display:inline-block;margin-top:14px;background:var(--gold);color:#0a0e14;border-radius:30px;padding:10px 24px;font-weight:600;font-size:13px;text-decoration:none;'>Continue · 继续</a></div>";
  } else {
    res.innerHTML = "<div style='background:rgba(255,92,99,.08);border:1px solid rgba(255,92,99,.35);border-radius:14px;padding:22px;'><div style='color:var(--bear);font-weight:700;font-size:18px;margin-bottom:6px;'>NOT PASSED - " + correct + "/" + total + " (" + Math.round(correct/total*100) + "%)</div><div style='color:var(--muted);font-size:13.5px;'>需要 70% (4/5)。阅读上面的错题解析，然后重试。</div></div>";
  }
  document.getElementById("examSubmit").style.display = "none";
  res.scrollIntoView({behavior:"smooth"});
}
renderExam();
