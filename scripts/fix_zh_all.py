#!/usr/bin/env python3
"""批量修 22 課 + 工具頁 .zh 灰色 → inherit + 字號加大（剝 base64 防回溯 + 還原）"""
import re, glob

FILES = (sorted(glob.glob("/tmp/mtj/MTJ-Hub/courses/*.html"))
         + sorted(glob.glob("/tmp/mtj/MTJ-Hub/tools/*.html")))

B64 = re.compile(r'data:image/[^;]+;base64,[A-Za-z0-9+/=]+')
CSS_RULE = re.compile(r'([^{}]*\.zh[^{}]*)\{([^}]*)\}')
INLINE_ZH = re.compile(r'(class="zh"[^>]*style="[^"]*)color:var\(--muted-?2?\)')

def fix(path):
    raw = open(path, encoding="utf-8").read()
    # 剝離 base64 → 佔位符
    holder = {}
    def stash(m):
        key = f"__B64_{len(holder)}__"
        holder[key] = m.group(0)
        return key
    html = B64.sub(stash, raw)
    orig = html

    def css_sub(m):
        sel, body = m.group(1), m.group(2)
        if ".zh" in sel:
            body = re.sub(r'color:var\(--muted-?2?\)', 'color:inherit', body)
            fm = re.search(r'font-size:([\d.]+)(px|em)', body)
            if fm:
                val, unit = float(fm.group(1)), fm.group(2)
                if unit == 'px' and val < 14:
                    body = body.replace(f"font-size:{fm.group(1)}px",
                                        f"font-size:{min(val+1.5, 16):.1f}px")
                elif unit == 'em' and val < 1.0:
                    body = body.replace(f"font-size:{fm.group(1)}em",
                                        f"font-size:{val+0.12:.2f}em")
        return sel + "{" + body + "}"

    html = CSS_RULE.sub(css_sub, html)
    html = INLINE_ZH.sub(r'\1color:inherit', html)

    if html != orig:
        # 還原 base64
        for k, v in holder.items():
            html = html.replace(k, v)
        open(path, "w", encoding="utf-8").write(html)
        return True
    return False

n = 0
for f in FILES:
    if fix(f):
        n += 1
print(f"patched {n}/{len(FILES)} files")
