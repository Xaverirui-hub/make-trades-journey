#!/usr/bin/env python3
"""MTJ 考試題目中文化 v3 — 逐題字串替換(最穩):
對 EXAM_QUESTIONS 陣列內每題:
  q:"EN"  → q:"EN", q_zh:"ZH"
  opts:[...]  → opts:[...], opts_zh:[...]
錨點: 每題的 {q: 開頭, 該題的 why:" 前為邊界。"""
import re, json, sys, subprocess

path = sys.argv[1]
translations = json.load(open(sys.argv[2], encoding='utf-8'))  # {q_en: [q_zh, [opts_zh...]]}

html = open(path, encoding='utf-8', errors='ignore').read()
assert html.count('<!DOCTYPE') == 1 and html.count('</html>') == 1
assert 'q_zh' not in html, "已含 q_zh, 中止"

# 在 exam script 內逐題處理
scripts = re.findall(r'<script>(.*?)</script>', html, re.S)
exam_script = [s for s in scripts if 'EXAM_QUESTIONS' in s][0]
s_start = html.find(exam_script)  # 該 script 在全文的位置

done = 0
for q_en, (q_zh, opts_zh) in translations.items():
    # 錨點: {q:"EN"
    anchor = '{q:"' + q_en + '"'
    idx = html.find(anchor)
    if idx < 0:
        # 可能是 "q": " 帶空格格式
        anchor2 = '{ q:"' + q_en + '"'
        idx = html.find(anchor2)
        if idx < 0:
            print(f'⚠️ 找不到: {q_en[:40]}')
            continue
        anchor = anchor2
    # 題目物件邊界: 到該題 why:" 前(先定位再操作)
    why_marker = 'why:"'
    why_idx = html.find(why_marker, idx)
    assert why_idx > 0, f'why 找不到: {q_en[:40]}'
    # 先加 opts_zh(在 opts:[...] 的 ] 後)
    opts_marker = 'opts:['
    opts_idx = html.find(opts_marker, idx)
    assert opts_idx > 0 and opts_idx < why_idx, f'opts 找不到: {q_en[:40]}'
    opts_close = html.find(']', opts_idx)
    assert opts_close > 0 and opts_close < why_idx
    opts_zh_json = json.dumps(opts_zh, ensure_ascii=False)
    html = html[:opts_close+1] + ', opts_zh:' + opts_zh_json + html[opts_close+1:]
    # 再加 q_zh(在 q:"..." 值後) — 注意 opts 插入已偏移, 重新定位 q
    q_idx = html.find(anchor)
    # anchor = {q:"EN 或 { q:"EN。q 值結束 = anchor 結束(不含尾引號? 含)
    # 精確: q 值 = q_en, 它在 anchor 內的位置是 '{q:"' 之後(4 字符)
    q_prefix = anchor[:anchor.find('"')+1]  # {q:"
    q_val_start = q_idx + len(q_prefix)
    q_end = q_val_start + len(q_en)  # q 值結束(不含關閉引號)
    html = html[:q_end] + '", q_zh:"' + q_zh + '"' + html[q_end:]
    done += 1

open(path, 'w', encoding='utf-8').write(html)
print(f"✅ {done} 題已中文化, 大小: {len(html)}")

# 驗證
scripts = re.findall(r'<script>(.*?)</script>', html, re.S)
tmp = f"/tmp/zh3_{sys.argv[1].split('/')[-1][:16]}.js"
open(tmp, 'w').write(scripts[-1])
r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True)
print("JS:", "PASS" if r.returncode == 0 else "FAIL " + r.stderr[:200])
print("q_zh 數:", html.count('q_zh'))
