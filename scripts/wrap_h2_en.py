#!/usr/bin/env python3
"""H2 純英文標題包 .en（ZH 模式隱藏，中文由同區 eyebrow/.zh 提供）"""
import re, glob

B64 = re.compile(r'data:image/[^;]+;base64,[A-Za-z0-9+/=]+')

def process(path):
    raw = open(path, encoding="utf-8").read()
    html = B64.sub("B64HOLDER", raw)
    orig = html
    count = 0

    def wrap(m):
        nonlocal count
        pre, attrs, txt = m.group(1), m.group(2), m.group(3).strip()
        if (re.search(r'[A-Za-z]{4,}', txt)
                and not re.search(r'[\u4e00-\u9fff]', txt)
                and 'span' not in txt
                and 'class=' not in txt):
            count += 1
            return f'<h2{attrs}><span class="en">{txt}</span></h2>'
        return m.group(0)

    html = re.sub(r'(<h2([^>]*)>)([^<]{2,60})(</h2>)', wrap, html)
    if html != orig:
        # 還原 base64
        holders = html.count("B64HOLDER")
        b64s = B64.findall(raw)
        for b in b64s:
            html = html.replace("B64HOLDER", b, 1)
        open(path, "w", encoding="utf-8").write(html)
    return count

files = glob.glob("/tmp/mtj/MTJ-Hub/courses/*.html")
total = 0
for f in files:
    c = process(f)
    total += c
    if c: print(f"{f.split('/')[-1]}: 包 {c}")
print(f"TOTAL: {total}")
