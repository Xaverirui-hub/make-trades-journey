#!/usr/bin/env python3
"""混雜節點自動拆分器 v4 — 掃行內所有 <tag>text</tag> 子串"""
import re, glob, sys

def has_cjk(s):
    return any('\u4e00' <= c <= '\u9fff' for c in s)

def has_lat(s):
    return bool(re.search(r'[A-Za-z]{3,}', s))

# 行內 <tag attrs>text</tag>（text 不含 < >）
TAG = re.compile(r'<([a-zA-Z][a-zA-Z0-9]*)((?:[^>"\']|"[^"]*"|\'[^\']*\')*)>([^<>]*)</\1>')

def split_pair(inner):
    inner = inner.strip()
    if not has_lat(inner) or not has_cjk(inner):
        return None
    if re.search(r'[=;{}\[\]]', inner):
        return None
    # 1) DOT
    if ' \u00b7 ' in inner or ' · ' in inner:
        parts = re.split(r'\s*\u00b7\s*', inner)
        if len(parts) >= 2 and has_lat(parts[0]) and has_cjk(' '.join(parts[1:])):
            return parts[0].strip(), ' '.join(parts[1:]).strip()
    # 2) PAREN
    m = re.match(r'^([^()]*?)\s*\(([^()]*)\)\s*$', inner)
    if m:
        a, b = m.group(1).strip(), m.group(2).strip()
        if has_cjk(a) and has_lat(b):
            return b, a
        if has_lat(a) and has_cjk(b):
            return a, b
    # 3) PLAIN
    m = re.search(r'[\u4e00-\u9fff]', inner)
    if m:
        idx = m.start()
        en_part = inner[:idx].strip()
        zh_part = inner[idx:].strip()
        if has_lat(en_part) and has_cjk(zh_part):
            en_part = re.sub(r'[\s.,;:]+$', '', en_part)
            if en_part:
                return en_part, zh_part
    return None

def process_file(path, dry=False):
    raw = open(path, encoding="utf-8").read()
    lines = raw.split('\n')
    count = 0
    out = []
    for ln in lines:
        if 'base64,' in ln or len(ln) > 800:
            out.append(ln)
            continue
        matches = list(TAG.finditer(ln))
        if not matches:
            out.append(ln)
            continue
        new_line = ln
        replaced = 0
        for m in reversed(matches):
            tag, attrs, inner = m.group(1), m.group(2), m.group(3)
            # 保護：inner 含 < >（有子元素）或已是 en/zh span → 不拆
            if '<' in inner or '>' in inner:
                continue
            if 'class="en"' in attrs or 'class="zh"' in attrs or 'class="zh-t"' in attrs:
                continue
            pair = split_pair(inner)
            if pair and pair[0] and pair[1]:
                en, zh = pair
                new_inner = '<span class="en">' + en + '</span><span class="zh">' + zh + '</span>'
                new_line = new_line[:m.start()] + '<' + tag + attrs + '>' + new_inner + '</' + tag + '>' + new_line[m.end():]
                replaced += 1
        out.append(new_line)
        count += replaced
    if not dry:
        open(path, "w", encoding="utf-8").write('\n'.join(out))
    return count

if __name__ == "__main__":
    dry = '--dry' in sys.argv
    files = [a for a in sys.argv[1:] if a.endswith('.html') and not a.startswith('--')]
    if not files:
        files = glob.glob("MTJ-Hub/courses/*.html") + ["MTJ-Hub/MakeTradesJourney.html"]
    total = 0
    for f in files:
        c = process_file(f, dry)
        total += c
        print(f"{f.split('/')[-1]}: 拆 {c}")
    print(f"TOTAL: {total}")
