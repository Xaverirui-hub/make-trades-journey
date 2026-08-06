#!/usr/bin/env python3
"""
MTJ 考試模組插入器 — 安全做法(2026-08-06 驗證):
1. 讀 HTML, 前置檢查(1 DOCTYPE / 1 </html> / 無 examBox)
2. exam HTML 插在 '<!-- ================= CLOSING ================= -->' 前
3. exam JS 插在最後 </body> 前
4. node --check 驗證 JS + HTML 完整性
用法: python3 add_exam.py <course.html> <module_num> <next_module_num>
題目在檔案內 EXAM_QUESTIONS 陣列(每課不同, 需自訂)。
"""
import re, subprocess, sys, json

def build_exam_html(mod, next_mod):
    return f'''
<!-- ================= EXAM MODULE ================= -->
<section class="section" id="exam" style="padding-top:70px;">
  <div class="group-head reveal">
    <span class="tier">EXAM</span>
    <div><div class="eyebrow">Module Check · 模块测验</div><h2 class="title">Pass the Quiz to Unlock Module {next_mod:02d}<span class="zh">通过测验解锁下一课</span></h2></div>
  </div>
  <div class="note" style="max-width:820px;line-height:1.9;">
    Answer all 5 questions. You need <b>4 of 5 (70%)</b> to pass. Wrong answers are explained — read them, then retry.
    <span class="zh">回答全部 5 题。答对 <b>4 题（70%）</b> 即通过。答错的题会给出解析 —— 看完再试。</span>
  </div>
  <div id="examBox" style="max-width:820px;margin:0 auto;display:flex;flex-direction:column;gap:22px;"></div>
  <div style="max-width:820px;margin:26px auto 0;text-align:center;">
    <button id="examSubmit" onclick="gradeExam()" style="background:var(--gold);color:#0a0e14;border:none;border-radius:30px;padding:14px 40px;font-family:'Sora',sans-serif;font-weight:700;font-size:15px;cursor:pointer;letter-spacing:.05em;">Submit Answers · 提交答案</button>
    <div id="examResult" style="margin-top:22px;"></div>
  </div>
</section>
'''

def build_exam_js(mod, questions):
    qs_json = json.dumps(questions, ensure_ascii=False)
    return f'''
<script>
/* ===== MTJ EXAM MODULE - Module {mod:02d} ===== */
const MTJ_EXAM_KEY = "mtj_exam_pass_{mod}";
const EXAM_QUESTIONS = {qs_json};
function renderExam(){{
  var box = document.getElementById("examBox"); if(!box) return;
  EXAM_QUESTIONS.forEach(function(item, qi){{
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
    item.opts.forEach(function(opt, oi){{
      var label = document.createElement("label");
      label.style.cssText = "display:flex;align-items:center;gap:10px;padding:10px 14px;margin:6px 0;border:1px solid var(--line-soft);border-radius:8px;cursor:pointer;font-size:14px;color:var(--text);transition:.2s;";
      var radio = document.createElement("input");
      radio.type = "radio"; radio.name = "exam_q" + qi; radio.value = oi;
      radio.style.cssText = "accent-color:var(--gold);";
      label.appendChild(radio);
      label.appendChild(document.createTextNode(opt));
      card.appendChild(label);
    }});
    var fb = document.createElement("div");
    fb.id = "exam_fb_" + qi;
    fb.style.cssText = "margin-top:10px;font-size:13px;line-height:1.7;display:none;";
    card.appendChild(fb);
    box.appendChild(card);
  }});
}}
function gradeExam(){{
  var correct = 0, answered = 0;
  var total = EXAM_QUESTIONS.length;
  EXAM_QUESTIONS.forEach(function(item, qi){{
    var sel = document.querySelector("input[name=exam_q" + qi + "]:checked");
    var fb = document.getElementById("exam_fb_" + qi);
    if(sel){{
      answered++;
      var user = parseInt(sel.value);
      if(user === item.ans){{
        correct++;
        fb.innerHTML = "<span style='color:var(--bull);font-weight:600;'>✓ Correct 正确</span><br><span style='color:var(--muted);font-size:12.5px;'>" + item.why + "</span>";
      }} else {{
        fb.innerHTML = "<span style='color:var(--bear);font-weight:600;'>✗ Wrong 错误</span><br><span style='color:var(--muted);font-size:12.5px;'>你的答案: <b>" + item.opts[user] + "</b> · 正确答案: <b>" + item.opts[item.ans] + "</b><br>为什么错: " + item.why + "</span>";
      }}
      fb.style.display = "block";
    }} else {{
      fb.innerHTML = "<span style='color:var(--muted);'>⚠ 未作答</span>";
      fb.style.display = "block";
    }}
  }});
  if(answered < total){{
    document.getElementById("examResult").innerHTML = "<span style='color:var(--bear);font-weight:600;'>请回答全部 " + total + " 题再提交。</span>";
    return;
  }}
  var res = document.getElementById("examResult");
  if(correct >= 4){{
    localStorage.setItem(MTJ_EXAM_KEY, "1");
    res.innerHTML = "<div style='background:rgba(44,217,138,.1);border:1px solid rgba(44,217,138,.4);border-radius:14px;padding:22px;'><div style='color:var(--bull);font-weight:700;font-size:18px;margin-bottom:6px;'>🎉 PASSED - " + correct + "/" + total + " 通过!</div><div style='color:var(--muted);font-size:13.5px;'>Module {next_mod:02d} 已解锁。回到目录继续学习。</div><a href='../MakeTradesJourney.html' style='display:inline-block;margin-top:14px;background:var(--gold);color:#0a0e14;border-radius:30px;padding:10px 24px;font-weight:600;font-size:13px;text-decoration:none;'>Continue · 继续</a></div>";
  }} else {{
    res.innerHTML = "<div style='background:rgba(255,92,99,.08);border:1px solid rgba(255,92,99,.35);border-radius:14px;padding:22px;'><div style='color:var(--bear);font-weight:700;font-size:18px;margin-bottom:6px;'>NOT PASSED - " + correct + "/" + total + " (" + Math.round(correct/total*100) + "%)</div><div style='color:var(--muted);font-size:13.5px;'>需要 70% (4/5)。阅读上面的错题解析，然后重试。</div></div>";
  }}
  document.getElementById("examSubmit").style.display = "none";
  res.scrollIntoView({{behavior:"smooth"}});
}}
renderExam();
</script>
'''

def add_exam(path, mod, next_mod, questions):
    html = open(path, encoding="utf-8", errors="ignore").read()
    assert html.count("<!DOCTYPE") == 1, f"{path}: 異常 DOCTYPE"
    assert html.count("</html>") == 1, f"{path}: 異常 </html>"
    assert "examBox" not in html, f"{path}: exam 已存在"

    exam_html = build_exam_html(mod, next_mod)
    anchor = "<!-- ================= CLOSING ================= -->"
    assert anchor in html, f"{path}: CLOSING anchor 找不到"
    html = html.replace(anchor, exam_html + "\n" + anchor, 1)

    exam_js = build_exam_js(mod, questions)
    body_end = html.rfind("</body>")
    assert body_end > 0, f"{path}: body 找不到"
    html = html[:body_end] + exam_js + html[body_end:]

    open(path, "w", encoding="utf-8").write(html)

    # 驗證
    scripts = re.findall(r"<script>(.*?)</script>", html, re.S)
    tmp = f"/tmp/exam_check_{mod}.js"
    open(tmp, "w").write(scripts[-1])
    r = subprocess.run(["node", "--check", tmp], capture_output=True, text=True)
    assert r.returncode == 0, f"{path}: JS 錯誤 {r.stderr[:200]}"
    assert html.count("</html>") == 1
    print(f"OK {path}: {len(html)} bytes, JS PASS")

if __name__ == "__main__":
    # 用法: python3 add_exam.py <path> <mod> <next_mod> '<questions_json>'
    path, mod, next_mod = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
    questions = json.loads(sys.argv[4])
    add_exam(path, mod, next_mod, questions)
