#!/usr/bin/env python3
"""批量: 只加 opts_zh(選項中文) — q 已含中文不用動。
JSON: {q_en: [q_zh, [opts_zh...]]} — 但 key 是含中文的混合, 用模糊匹配定位。
"""
import json, re, subprocess, os

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

def extract_qs(html):
    """提取 HTML 中所有 q 值(帶引號格式)"""
    scripts = re.findall(r'<script>(.*?)</script>', html, re.S)
    qs = []
    for s in scripts:
        if 'EXAM_QUESTIONS' in s:
            for m in re.findall(r'"q":\s*"((?:[^"\\]|\\.)*)"', s):
                qs.append(m)
            break
    return qs

def match_q(json_key, html_q):
    """模糊匹配: JSON key 與 HTML q 是否同一題"""
    # 取 JSON key 的英文部分(第一個中文字前的部分)
    zh_idx = re.search(r'[\u4e00-\u9fff]', json_key)
    key_en = json_key[:zh_idx.start()].strip() if zh_idx else json_key.strip()
    zh_idx2 = re.search(r'[\u4e00-\u9fff]', html_q)
    html_en = html_q[:zh_idx2.start()].strip() if zh_idx2 else html_q.strip()
    return key_en[:25] in html_en or html_en[:25] in key_en or key_en == html_en

results = []
for key, course in MAP.items():
    path = f"MTJ-Hub/courses/{course}_MakeTradesJourney.html"
    zh_json = f"/tmp/mtj/{key}.json"
    if not os.path.exists(path) or not os.path.exists(zh_json):
        results.append(f"{course}: 檔案缺失")
        continue
    html = open(path, encoding='utf-8', errors='ignore').read()
    translations = json.load(open(zh_json, encoding='utf-8'))
    html_qs = extract_qs(html)
    if not html_qs:
        results.append(f"{course}: HTML 無題目")
        continue

    # 為每題(按 HTML 順序)找對應翻譯的 opts_zh
    done = 0
    for qi, html_q in enumerate(html_qs):
        # 找對應 JSON entry(模糊匹配)
        matched_key = None
        for jk in translations:
            if match_q(jk, html_q):
                matched_key = jk
                break
        if not matched_key:
            print(f"  {course} Q{qi+1} 無匹配: {html_q[:40]}")
            continue
        opts_zh = translations[matched_key][1]
        # 定位該題的 opts 陣列: 找 "opts": [ 在 q 之後
        q_pos = html.find(f'"{html_q}"')
        opts_marker = '"opts":'
        opts_idx = html.find(opts_marker, q_pos)
        if opts_idx < 0:
            opts_marker = 'opts:['
            opts_idx = html.find(opts_marker, q_pos)
            if opts_idx < 0:
                print(f"  {course} Q{qi+1} opts 找不到")
                continue
        opts_start = html.find('[', opts_idx)
        opts_end = html.find(']', opts_start)
        why_pos = html.find('"why"', q_pos)
        if why_pos < 0:
            why_pos = html.find('why:"', q_pos)
        assert opts_end < why_pos, f"{course} Q{qi+1} opts 越界"
        opts_zh_str = json.dumps(opts_zh, ensure_ascii=False)
        html = html[:opts_end+1] + ', "opts_zh": ' + opts_zh_str + html[opts_end+1:]
        done += 1

    # renderExam 加 optsArr(若無)
    if 'optsArr' not in html:
        old_r = 'item.opts.forEach(function(opt, oi){'
        new_r = '''var optsArr = (zhMode && item.opts_zh) ? item.opts_zh : item.opts;
    optsArr.forEach(function(opt, oi){'''
        # 需要先有 zhMode 定義
        if 'zhMode' not in html:
            old_z = 'var q = document.createElement("div");'
            new_z = '''var zhMode = document.body.classList.contains('lang-zh');
    var q = document.createElement("div");'''
            if old_z in html:
                html = html.replace(old_z, new_z, 1)
        if old_r in html:
            html = html.replace(old_r, new_r, 1)
        else:
            # 變體(帶縮排/不同空格)
            old_r2 = re.sub(r'\s+', '', old_r)
            html2 = re.sub(r'\s+', '', html)
            if old_r2 in html2:
                print(f"  {course} render 需手動(格式變體)")
            else:
                print(f"  {course} renderExam 未找到")

    open(path, 'w', encoding='utf-8').write(html)
    results.append(f"{course}: {done}/5 題 opts_zh")

print("\n===== 結果 =====")
for r in results:
    print(r)
