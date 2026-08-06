
/* ===== MTJ EXAM MODULE - Module 09 ===== */
const MTJ_EXAM_KEY = "mtj_exam_pass_9";
const EXAM_QUESTIONS = [{"q": "What actually creates the price spike when a major US release comes out?", "opts": ["The previous month's value", "The forecast number", "The surprise: how far the actual lands from the forecast", "The headline number alone"], "ans": 2, "why": "The forecast is already priced in. Only the gap between actual and forecast — the surprise — creates the spike.", "why_zh": "市场已提前消化预期值。只有实际值与预期值之间的差距——即意外值——才会制造价格飙升。"}, {"q": "Which measure does the Fed officially target at 2%?", "opts": ["Core PCE year-over-year", "Headline CPI", "PPI", "Retail sales"], "ans": 0, "why": "The Fed's policy target is 2% Core PCE YoY — Core PCE is the Fed's preferred inflation gauge.", "why_zh": "美联储的政策目标是核心 PCE 年率 2%——核心 PCE 是美联储最看重的通胀指标。"}, {"q": "When is the NFP (Non-Farm Payrolls) report released each month?", "opts": ["Every 6 weeks", "First Friday of each month, 08:30 ET", "Mid-month", "The last trading day"], "ans": 1, "why": "NFP comes out on the first Friday of every month at 08:30 ET — jobs, unemployment and wages together.", "why_zh": "非农数据在每月第一个周五美东时间 08:30 发布——就业、失业率和薪资数据同时公布。"}, {"q": "CPI comes in hotter than expected. What is the typical market reaction?", "opts": ["USD down, gold up", "No reaction at all", "USD up, gold down (hawkish)", "Yields fall sharply"], "ans": 2, "why": "Hotter-than-expected inflation is hawkish — it pushes the Fed toward hikes, lifting USD and yields while weighing on gold.", "why_zh": "通胀高于预期属于鹰派信号——会推动美联储加息，提振美元和收益率，同时打压黄金。"}, {"q": "Inflation is falling toward 2% and the job market is weakening. The Fed is most likely to…", "opts": ["Hike rates", "Cut rates — USD down, gold up (dovish)", "Hold forever", "Raise the 2% target"], "ans": 1, "why": "Cooling inflation and weak jobs open the door to cuts (dovish), which usually pushes USD down and gold up.", "why_zh": "通胀降温加上就业疲软为降息打开大门（鸽派），通常会使美元走低、黄金走高。"}];
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
    res.innerHTML = "<div style='background:rgba(44,217,138,.1);border:1px solid rgba(44,217,138,.4);border-radius:14px;padding:22px;'><div style='color:var(--bull);font-weight:700;font-size:18px;margin-bottom:6px;'>🎉 PASSED - " + correct + "/" + total + " 通过!</div><div style='color:var(--muted);font-size:13.5px;'>Module 10 已解锁。回到目录继续学习。</div><a href='../MakeTradesJourney.html' style='display:inline-block;margin-top:14px;background:var(--gold);color:#0a0e14;border-radius:30px;padding:10px 24px;font-weight:600;font-size:13px;text-decoration:none;'>Continue · 继续</a></div>";
  } else {
    res.innerHTML = "<div style='background:rgba(255,92,99,.08);border:1px solid rgba(255,92,99,.35);border-radius:14px;padding:22px;'><div style='color:var(--bear);font-weight:700;font-size:18px;margin-bottom:6px;'>NOT PASSED - " + correct + "/" + total + " (" + Math.round(correct/total*100) + "%)</div><div style='color:var(--muted);font-size:13.5px;'>需要 70% (4/5)。阅读上面的错题解析，然后重试。</div></div>";
  }
  document.getElementById("examSubmit").style.display = "none";
  res.scrollIntoView({behavior:"smooth"});
}
renderExam();
