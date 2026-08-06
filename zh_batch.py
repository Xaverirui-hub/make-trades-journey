#!/usr/bin/env python3
"""批量應用考試中文化 — 用 zh_apply 邏輯對 19 課"""
import json, re, subprocess, sys, os

MAP = {
  "zh_three": "Three_Types_of_Analysis",
  "zh_sessions": "Trading_Sessions",
  "zh_candle": "Candlestick_Patterns",
  "zh_chart": "Chart_Patterns",
  "zh_ma": "MA_Support_Resistance",
  "zh_fibo": "Fibonacci",
  "zh_multitf": "Multi_Timeframe_Trading",
  "zh_usdata": "US_High_Impact_Data",
  "zh_risk": "Risk_Management",
  "zh_journal": "Journal_Review",
  "zh_psych": "Psychology_Discipline",
  "zh_trend": "Trendlines_Channels",
  "zh_supply": "Supply_Demand",
  "zh_trademgmt": "Trade_Management",
  "zh_backtest": "Backtesting_System_Design",
  "zh_plan": "Trading_Plan_Routine",
  "zh_rsi": "RSI_Indicator",
  "zh_sto": "Stochastic_Indicator",
  "zh_macd": "MACD_Indicator",
}

# 引入 zh_apply 的函數邏輯
def apply_zh(path, zh_json):
    translations = json.load(open(zh_json, encoding='utf-8'))
    html = open(path, encoding='utf-8', errors='ignore').read()
    assert html.count('<!DOCTYPE') == 1 and html.count('</html>') == 1

    done = 0
    for q_en, (q_zh, opts_zh) in translations.items():
        old_q = '{q:"' + q_en + '"'
        new_q = '{q:"' + q_en + '", q_zh:"' + q_zh + '"'
        if old_q not in html:
            old_q2 = '{ q:"' + q_en + '"'
            if old_q2 in html:
                old_q, new_q = old_q2, '{ q:"' + q_en + '", q_zh:"' + q_zh + '"'
            else:
                print(f'  ⚠️ q 找不到: {q_en[:40]}')
                continue
        html = html.replace(old_q, new_q, 1)
        q_pos = html.find(q_en)
        opts_start = html.find('opts:[', q_pos)
        if opts_start < 0:
            opts_start = html.find('opts: [', q_pos)
            if opts_start < 0:
                print(f'  ⚠️ opts 找不到: {q_en[:40]}')
                continue
            opts_start += 1
        opts_end = html.find(']', opts_start)
        why_pos = html.find('why:"', q_pos)
        assert opts_end < why_pos, f'opts 越界: {q_en[:40]}'
        opts_zh_str = json.dumps(opts_zh, ensure_ascii=False)
        html = html[:opts_end+1] + ', opts_zh:' + opts_zh_str + html[opts_end+1:]
        done += 1

    if 'zhMode' not in html:
        old_r = 'q.textContent = item.q;\n    card.appendChild(q);\n    item.opts.forEach(function(opt, oi){'
        new_r = '''var zhMode = document.body.classList.contains('lang-zh');
    q.textContent = (zhMode && item.q_zh) ? item.q_zh : item.q;
    card.appendChild(q);
    var optsArr = (zhMode && item.opts_zh) ? item.opts_zh : item.opts;
    optsArr.forEach(function(opt, oi){'''
        if old_r in html:
            html = html.replace(old_r, new_r, 1)
        else:
            # 試變體
            old_r2 = 'q.textContent = item.q;'
            if old_r2 in html:
                print('  ⚠️ render 結構不同(未改)')
            else:
                print('  ⚠️ renderExam 未找到')

    if 'typeof renderExam' not in html:
        old_s = "if(zh) zh.style.cssText = l==='zh' ? on : off;\n}"
        new_s = """if(zh) zh.style.cssText = l==='zh' ? on : off;
  var box = document.getElementById('examBox');
  if(box && typeof renderExam === 'function'){ box.innerHTML=''; renderExam(); }
}"""
        if old_s in html:
            html = html.replace(old_s, new_s, 1)
        else:
            print('  ⚠️ setLang 重渲染未加')

    open(path, 'w', encoding='utf-8').write(html)
    return done

results = []
for key, course in MAP.items():
    path = f"MTJ-Hub/courses/{course}_MakeTradesJourney.html"
    zh_json = f"/tmp/mtj/{key}.json"
    if not os.path.exists(path):
        print(f"❌ 課程不存在: {course}")
        continue
    try:
        done = apply_zh(path, zh_json)
        # node check
        html = open(path, encoding='utf-8').read()
        scripts = re.findall(r'<script>(.*?)</script>', html, re.S)
        open('/tmp/zh_batch_check.js', 'w').write(scripts[-1])
        r = subprocess.run(['node', '--check', '/tmp/zh_batch_check.js'], capture_output=True, text=True)
        js = 'PASS' if r.returncode == 0 else 'FAIL'
        results.append(f"{course}: {done}題 {js}")
    except Exception as e:
        results.append(f"{course}: ❌ {str(e)[:60]}")

print("\n===== 結果 =====")
for r in results:
    print(r)
