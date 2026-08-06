
/* ===== MTJ EXAM MODULE - Module 07 ===== */
const MTJ_EXAM_KEY = "mtj_exam_pass_7";
const EXAM_QUESTIONS = [{"q": "In the Fibonacci sequence, each number divided by the next is approximately: 斐波那契数列中，每个数除以后一个数约等于？", "opts": ["0.382", "0.5", "0.618", "0.786"], "ans": 2, "why": "In 1,1,2,3,5,8,13... each number divided by the next is about 0.618 - the Golden Ratio.", "why_zh": "在 1,1,2,3,5,8,13… 数列中，每个数除以后一个数都约等于 0.618——即黄金比例。"}, {"q": "Which retracement level do traders watch the most? 交易者最关注哪个回撤位？", "opts": ["23.6%", "61.8%", "78.6%", "100%"], "ans": 1, "why": "61.8% (together with 50%) is the most watched of the standard levels.", "why_zh": "61.8%（连同 50%）是标准回撤位中最受关注的。"}, {"q": "To draw a retracement in an uptrend, you drag the tool: 上涨趋势画回撤时，工具怎么拉？", "opts": ["From the swing high to the swing low", "From the current price to the 200 MA", "From the 61.8% level to the 0% level", "From the swing low to the swing high"], "ans": 3, "why": "In an uptrend, drag from the swing low to the swing high - 100% sits at the low and 0% at the high.", "why_zh": "上涨趋势中，从摆动低点拖到摆动高点——100% 在低点，0% 在高点。"}, {"q": "The golden pocket is the zone between: 黄金口袋是哪个区间？", "opts": ["0.236 and 0.382", "0.382 and 0.5", "1.272 and 1.618", "0.618 and about 0.65"], "ans": 3, "why": "The golden pocket is 0.618 to about 0.65 - where trend pullbacks most often reverse.", "why_zh": "黄金口袋是 0.618 到约 0.65 的区间——趋势回撤最常在此反转。"}, {"q": "Fibonacci extensions like 127.2% and 161.8% are mainly used for: 斐波那契扩展位主要用来？", "opts": ["Setting stop losses", "Taking profit targets", "Finding the entry point", "Measuring volume"], "ans": 1, "why": "Extensions project where price may go after bouncing from the pocket - common take-profit targets.", "why_zh": "扩展位投射价格从黄金口袋反弹后可能到达的位置——常用作止盈目标。"}];
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
    res.innerHTML = "<div style='background:rgba(44,217,138,.1);border:1px solid rgba(44,217,138,.4);border-radius:14px;padding:22px;'><div style='color:var(--bull);font-weight:700;font-size:18px;margin-bottom:6px;'>🎉 PASSED - " + correct + "/" + total + " 通过!</div><div style='color:var(--muted);font-size:13.5px;'>Module 08 已解锁。回到目录继续学习。</div><a href='../MakeTradesJourney.html' style='display:inline-block;margin-top:14px;background:var(--gold);color:#0a0e14;border-radius:30px;padding:10px 24px;font-weight:600;font-size:13px;text-decoration:none;'>Continue · 继续</a></div>";
  } else {
    res.innerHTML = "<div style='background:rgba(255,92,99,.08);border:1px solid rgba(255,92,99,.35);border-radius:14px;padding:22px;'><div style='color:var(--bear);font-weight:700;font-size:18px;margin-bottom:6px;'>NOT PASSED - " + correct + "/" + total + " (" + Math.round(correct/total*100) + "%)</div><div style='color:var(--muted);font-size:13.5px;'>需要 70% (4/5)。阅读上面的错题解析，然后重试。</div></div>";
  }
  document.getElementById("examSubmit").style.display = "none";
  res.scrollIntoView({behavior:"smooth"});
}
renderExam();
