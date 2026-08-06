
/* ===== MTJ EXAM MODULE - Module 03 ===== */
const MTJ_EXAM_KEY = "mtj_exam_pass_3";
const EXAM_QUESTIONS = [{"q": "外匯市場流動性與波動最高的時段是?", "opts": ["亞盤開盤", "倫敦與紐約重疊時段(13:00–17:00 UTC)", "週五收盤前", "東京午休"], "ans": 1, "why": "Liquidity and volatility peak where London and New York overlap (13:00-17:00 UTC / 21:00-01:00 Beijing) — the best window to trade majors and gold.", "why_zh": "流动性与波动率在伦敦与纽约重叠时段（13:00–17:00 UTC / 北京时间 21:00–01:00）达到峰值——这是交易主要货币对和黄金的最佳窗口。"}, {"q": "亞盤(東京)的主要特徵是?", "opts": ["波動最大,趨勢最明顯", "最安靜,流動性薄,常區間震盪,並奠定當天的初始區間", "成交量最大,點差最窄", "主要由美國數據主導"], "ans": 1, "why": "Asia is the quietest shift — thin liquidity, low volatility, lots of ranging. It often sets the day's initial range that London later breaks; it favours JPY/AUD/NZD pairs.", "why_zh": "亚盘是最安静的时段——流动性薄、波动小、多以区间震荡为主。它常常奠定当日初始区间，随后由伦敦突破；亚盘活跃的是日元、澳元、纽元等货币对。"}, {"q": "歐盤(倫敦)的主要特徵是?", "opts": ["成交量最大,開盤常出現強烈方向性行情並突破亞盤區間", "流動性最差,點差最寬", "最適合做區間交易", "黃金波動最小"], "ans": 0, "why": "London is the biggest session by volume — liquidity surges, spreads tighten, and the open often makes a strong directional move that breaks the Asian range. Real trends begin here.", "why_zh": "伦敦是成交量最大的时段——流动性激增、点差收窄，开盘时常出现突破亚盘区间的强烈方向性行情。真正的趋势从这里开始。"}, {"q": "黃金(XAU/USD)什麼時候最活躍?", "opts": ["亞盤時段", "歐盤開盤與倫敦–紐約重疊時段(21:00–01:00 北京時間)", "週一凌晨", "美盤收盤之後"], "ans": 1, "why": "Gold is calm in Asia, wakes at the London open, and peaks in the London-NY overlap (21:00-01:00 Beijing) — that is where the clean, tradeable gold moves live.", "why_zh": "黄金在亚盘平静，伦敦开盘时苏醒，在伦敦–纽约重叠时段（北京时间 21:00–01:00）达到高潮——干净可交易的黄金行情就在这里。"}, {"q": "為什麼做黃金必須尊重數據公布(NFP、CPI、FOMC)?", "opts": ["數據公布時點差會自動變小", "非農、CPI 與美聯儲決議可能在幾秒內讓黃金波動數十美元", "數據只影響股票,不影響外匯", "數據行情更適合重倉進場"], "ans": 1, "why": "NFP, CPI and Fed decisions can move gold dozens of dollars in seconds. Always respect news releases — plan around them or stay flat.", "why_zh": "非农、CPI 和美联储决议可能在几秒内让黄金波动数十美元。务必尊重数据发布——围绕它们做计划，或保持空仓。"}];
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
    res.innerHTML = "<div style='background:rgba(44,217,138,.1);border:1px solid rgba(44,217,138,.4);border-radius:14px;padding:22px;'><div style='color:var(--bull);font-weight:700;font-size:18px;margin-bottom:6px;'>🎉 PASSED - " + correct + "/" + total + " 通过!</div><div style='color:var(--muted);font-size:13.5px;'>Module 04 已解锁。回到目录继续学习。</div><a href='../MakeTradesJourney.html' style='display:inline-block;margin-top:14px;background:var(--gold);color:#0a0e14;border-radius:30px;padding:10px 24px;font-weight:600;font-size:13px;text-decoration:none;'>Continue · 继续</a></div>";
  } else {
    res.innerHTML = "<div style='background:rgba(255,92,99,.08);border:1px solid rgba(255,92,99,.35);border-radius:14px;padding:22px;'><div style='color:var(--bear);font-weight:700;font-size:18px;margin-bottom:6px;'>NOT PASSED - " + correct + "/" + total + " (" + Math.round(correct/total*100) + "%)</div><div style='color:var(--muted);font-size:13.5px;'>需要 70% (4/5)。阅读上面的错题解析，然后重试。</div></div>";
  }
  document.getElementById("examSubmit").style.display = "none";
  res.scrollIntoView({behavior:"smooth"});
}
renderExam();
