#!/usr/bin/env python3
"""修復: renderExam 缺 zhMode 定義(檢查+注入)"""
import re, os, subprocess

files = [f'MTJ-Hub/courses/{f}' for f in os.listdir('MTJ-Hub/courses') if f.endswith('_MakeTradesJourney.html')]

for path in files:
    html = open(path, encoding='utf-8', errors='ignore').read()
    # 該課 exam script
    scripts = re.findall(r'<script>(.*?)</script>', html, re.S)
    for s in scripts:
        if 'renderExam' in s and 'optsArr' in s:
            # 檢查 zhMode 是否在 renderExam 內定義(在 optsArr 前)
            ri = s.find('function renderExam')
            seg = s[ri:s.find('optsArr', ri)]
            if 'zhMode' not in seg:
                # 在 var q = document.createElement 前注入
                anchor = 'var q = document.createElement("div");'
                assert anchor in seg, f'{path}: 無 q 錨點'
                # 在整個 html 中定位該 anchor(在 exam script 內)
                a_pos = html.find(anchor)
                # 確認這是 renderExam 內的(往前找 function renderExam)
                fe = html.rfind('function renderExam', 0, a_pos)
                assert fe > 0, f'{path}: renderExam 位置錯'
                inject = '''var zhMode = document.body.classList.contains('lang-zh');
    ''' + anchor
                html = html[:a_pos] + inject + html[a_pos+len(anchor):]
                print(f'{path}: zhMode 已注入')
            else:
                print(f'{path}: OK')
            break
    open(path, 'w', encoding='utf-8').write(html)

# 驗證全部
fails = []
for path in files:
    html = open(path, encoding='utf-8', errors='ignore').read()
    scripts = re.findall(r'<script>(.*?)</script>', html, re.S)
    for s in scripts:
        if 'renderExam' in s:
            open('/tmp/check2.js','w').write(s)
            r = subprocess.run(['node','--check','/tmp/check2.js'], capture_output=True, text=True)
            if r.returncode != 0:
                fails.append((path, r.stderr[:80]))
            break
print(f'驗證: {len(files)} 課, 失敗 {len(fails)}')
for f, e in fails[:5]:
    print(' ', f, e)
