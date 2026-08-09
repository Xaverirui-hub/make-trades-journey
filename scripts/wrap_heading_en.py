#!/usr/bin/env python3
"""第二輪：標題級英文包 .en
模式：<h2/h3 ...>純英文</h2/h3> 且 下一個兄弟是 .zh（中文副標）
→ 英文包 <span class="en">
這樣 ZH 模式：英文標題隱藏、中文副標顯示
EN 模式：英文標題顯示、中文副標隱藏
"""
import re, glob, sys

def has_cjk(s): return any('\u4e00' <= c <= '\u9fff' for c in s)

HEAD = re.compile(r'^(\s*<(h[23])([^>]*)>)([^<]{2,60})(</\2>)')
ZH_NEXT = re.compile(r'^\s*<div class="zh[^"]*"[^>]*>', re.M)

def process_file(path, dry=False):
    raw = open(path, encoding="utf-8").read()
    lines = raw.split('\n')
    count = 0
    out = []
    for i, ln in enumerate(lines):
        m = HEAD.match(ln)
        if m:
            open_tag, tag, attrs, txt, close = m.groups()
            txt_stripped = txt.strip()
            # 純英文（無中文、無 span）
            if (re.search(r'[A-Za-z]{3,}', txt_stripped)
                    and not has_cjk(txt_stripped)
                    and 'span' not in txt_stripped
                    and 'class=' not in txt_stripped):
                # 檢查下一行是否有 .zh 副標
                has_zh_next = False
                for j in range(i+1, min(i+4, len(lines))):
                    if ZH_NEXT.match(lines[j]):
                        has_zh_next = True
                        break
                    if lines[j].strip() and not lines[j].strip().startswith('<div class="zh'):
                        break
                if has_zh_next:
                    new_txt = f'<span class="en">{txt_stripped}</span>'
                    ln = f'{open_tag}{new_txt}{close}'
                    count += 1
        out.append(ln)
    if not dry:
        open(path, "w", encoding="utf-8").write('\n'.join(out))
    return count

if __name__ == "__main__":
    dry = '--dry' in sys.argv
    files = [a for a in sys.argv[1:] if a.endswith('.html') and not a.startswith('--')]
    if not files:
        files = glob.glob("MTJ-Hub/courses/*.html")
    total = 0
    for f in files:
        c = process_file(f, dry)
        total += c
        print(f"{f.split('/')[-1]}: 包 {c}")
    print(f"TOTAL: {total}")
