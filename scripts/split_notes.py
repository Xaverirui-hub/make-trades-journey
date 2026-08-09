#!/usr/bin/env python3
"""note 註釋拆雙語：// 英文句 + 中文句 → span.en + span.zh"""
import re, glob

def process(path):
    raw = open(path, encoding="utf-8").read()
    orig = raw
    count = 0
    lines = raw.split('\n')
    out = []
    i = 0
    while i < len(lines):
        ln = lines[i]
        # 找 class="note" 開頭的行
        if 'class="note"' in ln and not re.search(r'<span class="(en|zh)"', ln):
            # 收集到 </div> 的完整 note 區塊
            block = [ln]
            j = i + 1
            while j < len(lines) and '</div>' not in block[-1]:
                block.append(lines[j])
                j += 1
            full = '\n'.join(block)
            # 剝 HTML tag 拿純文字
            text = re.sub(r'<[^>]+>', '', full)
            # 找第一個 CJK 位置
            m = re.search(r'[\u4e00-\u9fff]', text)
            if m:
                idx = m.start()
                en_part = text[:idx].strip()
                zh_part = text[idx:].strip()
                if re.search(r'[A-Za-z]{4,}', en_part) and re.search(r'[\u4e00-\u9fff]{2,}', zh_part):
                    # 重建：保留 div 屬性，內容換成 span 對
                    div_attr = re.search(r'<div class="note"([^>]*)>', full)
                    attr = div_attr.group(1) if div_attr else ''
                    # 保留原始閉合數（有些行是 </div></div> 雙閉合）
                    n_close = full.count('</div>')
                    new_block = [f'<div class="note"{attr}><span class="en">{en_part}</span><span class="zh">{zh_part}</span>' + '</div>' * n_close]
                    out.extend(new_block)
                    count += 1
                    i = j
                    continue
            out.extend(block)
            i = j
            continue
        out.append(ln)
        i += 1
    result = '\n'.join(out)
    if result != orig:
        open(path, "w", encoding="utf-8").write(result)
    return count

total = 0
for f in glob.glob("/tmp/mtj/MTJ-Hub/courses/*.html"):
    c = process(f)
    total += c
    if c: print(f"{f.split('/')[-1]}: 拆 {c}")
print(f"TOTAL note 拆分: {total}")
