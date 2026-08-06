#!/usr/bin/env python3
"""MTJ 考試題目中文化 v2 — 安全做法:
1. 用 JS 物件字面量解析器提取 EXAM_QUESTIONS 陣列
2. 每題加 q_zh/opts_zh(翻譯表在 translate 字典)
3. 整體替換陣列文字
4. node --check 驗證"""
import re, json, sys, subprocess

def parse_js_array(s, start):
    """從 start 位置的 [ 開始, 追蹤括號找到配對的 ]"""
    depth = 0
    in_str = False
    esc = False
    for j in range(start, len(s)):
        ch = s[j]
        if in_str:
            if esc: esc = False
            elif ch == '\\': esc = True
            elif ch == '"': in_str = False
        else:
            if ch == '"': in_str = True
            elif ch == '[': depth += 1
            elif ch == ']':
                depth -= 1
                if depth == 0:
                    return j
    return -1

def js_to_json(arr_str):
    """JS 物件字面量(無引號 key) → JSON"""
    return re.sub(r'([{,]\s*)(\w+)(\s*:)', r'\1"\2"\3', arr_str)

path = sys.argv[1]
html = open(path, encoding='utf-8', errors='ignore').read()
assert html.count('<!DOCTYPE') == 1 and html.count('</html>') == 1
assert 'q_zh' not in html, "已含 q_zh, 中止"

# 找 EXAM_QUESTIONS =
scripts = re.findall(r'<script>(.*?)</script>', html, re.S)
exam_script = None
for s in scripts:
    if 'EXAM_QUESTIONS' in s:
        exam_script = s
        break
assert exam_script

i = exam_script.find('EXAM_QUESTIONS')
eq = exam_script.find('=', i)
arr_start = exam_script.find('[', eq)
arr_end = parse_js_array(exam_script, arr_start)
assert arr_end > 0
arr_str = exam_script[arr_start:arr_end+1]
questions = json.loads(js_to_json(arr_str))
print(f"解析 {len(questions)} 題")

# 翻譯表: 每課調用方提供 {q_en: (q_zh, [opts_zh...])}
translations = json.loads(open(sys.argv[2], encoding='utf-8').read())

new_arr = []
for q in questions:
    q_en = q['q']
    if q_en in translations:
        q_zh, opts_zh = translations[q_en]
        q['q_zh'] = q_zh
        q['opts_zh'] = opts_zh
    else:
        print(f"⚠️ 無翻譯: {q_en[:50]}")
    new_arr.append(q)

new_arr_str = json.dumps(new_arr, ensure_ascii=False)
new_arr_str = new_arr_str.replace('"q"', 'q').replace('"opts"', 'opts').replace('"ans"', 'ans').replace('"why"', 'why').replace('"why_zh"', 'why_zh').replace('"q_zh"', 'q_zh').replace('"opts_zh"', 'opts_zh')

html = html[:exam_script.find(arr_str, 0)] + html[:0]  # placeholder
# 替換: 在 exam_script 內的 arr_str → new_arr_str
full = html
sidx = full.find(arr_str)
assert sidx > 0
full = full[:sidx] + new_arr_str + full[sidx+len(arr_str):]
open(path, 'w', encoding='utf-8').write(full)
print(f"✅ 已寫入, 大小: {len(full)}")

# 驗證
scripts = re.findall(r'<script>(.*?)</script>', full, re.S)
tmp = f"/tmp/zh_{sys.argv[1].split('/')[-1][:20]}.js"
open(tmp, 'w').write(scripts[-1])
r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True)
print("JS:", "PASS" if r.returncode == 0 else "FAIL " + r.stderr[:200])
print("q_zh 數:", full.count('q_zh'))
