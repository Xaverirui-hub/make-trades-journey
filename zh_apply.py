#!/usr/bin/env python3
"""MTJ 考試題目中文化批量 — 安全做法(v2 修正):
1. 讀 zh_<課>.json 翻譯表
2. 逐題字串替換: {q:"EN" → {q:"EN", q_zh:"ZH"; opts:[...] → opts:[...], opts_zh:[...]
3. renderExam 加 zhMode/optsArr 邏輯
4. setLang 加 exam 重渲染
5. node --check 驗證
用法: python3 zh_apply.py <course.html> <zh.json>"""
import re, json, sys, subprocess

path, zh_json = sys.argv[1], sys.argv[2]
translations = json.load(open(zh_json, encoding='utf-8'))
html = open(path, encoding='utf-8', errors='ignore').read()
assert html.count('<!DOCTYPE') == 1 and html.count('</html>') == 1

done = 0
for q_en, (q_zh, opts_zh) in translations.items():
    # 1. q_zh
    old_q = '{q:"' + q_en + '"'
    new_q = '{q:"' + q_en + '", q_zh:"' + q_zh + '"'
    if old_q not in html:
        old_q2 = '{ q:"' + q_en + '"'
        if old_q2 in html:
            old_q, new_q = old_q2, '{ q:"' + q_en + '", q_zh:"' + q_zh + '"'
        else:
            print(f'⚠️ q 找不到: {q_en[:40]}')
            continue
    html = html.replace(old_q, new_q, 1)
    # 2. opts_zh (定位該題 opts 用 q_en 位置)
    q_pos = html.find(q_en)
    opts_start = html.find('opts:[', q_pos)
    if opts_start < 0:
        opts_start = html.find('opts: [', q_pos)
        if opts_start < 0:
            print(f'⚠️ opts 找不到: {q_en[:40]}')
            continue
        opts_start += 1
    opts_end = html.find(']', opts_start)
    why_pos = html.find('why:"', q_pos)
    next_q = html.find('{q:', opts_end)
    assert opts_end < why_pos, f'opts 越界: {q_en[:40]}'
    opts_zh_str = json.dumps(opts_zh, ensure_ascii=False)
    html = html[:opts_end+1] + ', opts_zh:' + opts_zh_str + html[opts_end+1:]
    done += 1

# 3. renderExam zhMode(若未加)
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
        # 變體(無縮排)
        old_r2 = 'q.textContent = item.q;'
        if old_r2 in html:
            print('⚠️ render 結構不同, 需手動檢查')
        else:
            print('⚠️ renderExam 未找到')

# 4. setLang 重渲染(若未加)
if 'typeof renderExam' not in html:
    old_s = 'if(zh) zh.style.cssText = l===\'zh\' ? on : off;\n}'
    new_s = '''if(zh) zh.style.cssText = l==='zh' ? on : off;
  var box = document.getElementById('examBox');
  if(box && typeof renderExam === 'function'){ box.innerHTML=''; renderExam(); }
}'''
    if old_s in html:
        html = html.replace(old_s, new_s, 1)
    else:
        print('⚠️ setLang 重渲染未加(檢查)')

open(path, 'w', encoding='utf-8').write(html)
print(f'✅ {done} 題已中文化: {path}')

# 驗證
scripts = re.findall(r'<script>(.*?)</script>', html, re.S)
tmp = '/tmp/zh_check.js'
open(tmp, 'w').write(scripts[-1])
r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True)
print('JS:', 'PASS' if r.returncode == 0 else 'FAIL ' + r.stderr[:150])
