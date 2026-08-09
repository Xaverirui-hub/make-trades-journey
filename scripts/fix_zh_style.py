#!/usr/bin/env python3
"""中文字體優化：.zh 顏色從灰色改 inherit（跟英文一樣白），字號加大。
套用頁面：MakeTradesJourney / about / courses / tools（同源 CSS）
"""
import glob

PAGES = [
    "/tmp/mtj/MTJ-Hub/MakeTradesJourney.html",
    "/tmp/mtj/MTJ-Hub/about.html",
    "/tmp/mtj/MTJ-Hub/courses.html",
    "/tmp/mtj/MTJ-Hub/tools.html",
]

CSS_REPL = [
    # h2 title zh: 加大 + inherit
    ("h2.title .zh{display:block;font-family:'Noto Sans SC';font-weight:500;font-size:.42em;letter-spacing:.06em;color:var(--muted);margin-top:10px;}",
     "h2.title .zh{display:block;font-family:'Noto Sans SC';font-weight:500;font-size:.5em;letter-spacing:.06em;color:inherit;margin-top:10px;}"),
    # lead zh
    (" .lead .zh{display:block;font-family:'Noto Sans SC';font-size:.94em;color:var(--muted-2);margin-top:8px;line-height:1.9;}",
     " .lead .zh{display:block;font-family:'Noto Sans SC';font-size:1.06em;color:inherit;margin-top:8px;line-height:1.9;}"),
    # hero h-sub zh
    (" .hero .h-sub .zh{display:block;font-family:'Noto Sans SC';font-size:.92em;color:var(--muted-2);margin-top:6px;}",
     " .hero .h-sub .zh{display:block;font-family:'Noto Sans SC';font-size:1.02em;color:inherit;margin-top:6px;}"),
    # divider zh
    (".divider .zh{font-family:'Noto Sans SC';font-weight:500;letter-spacing:.3em;color:var(--muted);margin-top:8px;font-size:clamp(12px,1.8vw,16px);}",
     ".divider .zh{font-family:'Noto Sans SC';font-weight:500;letter-spacing:.3em;color:inherit;margin-top:8px;font-size:clamp(14px,2vw,18px);}"),
    # pil zh
    (".pil .zh{font-family:'Noto Sans SC';font-size:12.5px;color:var(--muted-2);letter-spacing:.06em;position:relative;}",
     ".pil .zh{font-family:'Noto Sans SC';font-size:14px;color:inherit;letter-spacing:.06em;position:relative;}"),
    # stage zh
    (".stage .zh{font-family:'Noto Sans SC';font-size:13px;color:var(--muted-2);letter-spacing:.1em;margin-top:4px;}",
     ".stage .zh{font-family:'Noto Sans SC';font-size:14.5px;color:inherit;letter-spacing:.1em;margin-top:4px;}"),
    # group-head zh
    (".group-head .zh{font-family:'Noto Sans SC';font-size:12.5px;color:var(--muted-2);letter-spacing:.16em;margin-top:2px;}",
     ".group-head .zh{font-family:'Noto Sans SC';font-size:14px;color:inherit;letter-spacing:.16em;margin-top:2px;}"),
    # mod p zh
    (".mod p .zh{display:block;font-family:'Noto Sans SC';font-size:12.5px;color:var(--muted-2);margin-top:6px;line-height:1.8;}",
     ".mod p .zh{display:block;font-family:'Noto Sans SC';font-size:14px;color:inherit;margin-top:6px;line-height:1.8;}"),
    # tool-body p zh
    (".tool-body p .zh{display:block;font-family:'Noto Sans SC';font-size:13px;color:var(--muted-2);margin-top:6px;}",
     ".tool-body p .zh{display:block;font-family:'Noto Sans SC';font-size:14.5px;color:inherit;margin-top:6px;}"),
    # disc zh (無字號 → 加)
    (".disc .zh{display:block;font-family:'Noto Sans SC';margin-top:4px;}",
     ".disc .zh{display:block;font-family:'Noto Sans SC';font-size:1.02em;color:inherit;margin-top:4px;}"),
    # foot-brand zh
    (".foot-brand .txt .zh{font-family:'Noto Sans SC';font-size:11.5px;letter-spacing:.16em;text-transform:none;color:var(--muted);}",
     ".foot-brand .txt .zh{font-family:'Noto Sans SC';font-size:13px;letter-spacing:.16em;text-transform:none;color:inherit;}"),
]

# inline style 修正：color:var(--muted) → color:inherit + 字號加大
INLINE_REPL = [
    ("font-size:clamp(14px,1.9vw,18px);color:var(--muted);margin-top:14px;",
     "font-size:clamp(16px,2.2vw,20px);color:inherit;margin-top:14px;"),
    ("font-family:'Noto Sans SC';font-size:13px;color:var(--muted);margin-top:6px;",
     "font-family:'Noto Sans SC';font-size:14.5px;color:inherit;margin-top:6px;"),
]

for p in PAGES:
    html = open(p, encoding="utf-8").read()
    orig = html
    for old, new in CSS_REPL:
        if old in html:
            html = html.replace(old, new)
    for old, new in INLINE_REPL:
        if old in html:
            html = html.replace(old, new)
    if html != orig:
        open(p, "w", encoding="utf-8").write(html)
        print(f"patched {p.split('/')[-1]}")
    else:
        print(f"no change {p.split('/')[-1]}")

# 驗證殘留灰色 zh
import re
for p in PAGES:
    html = open(p, encoding="utf-8").read()
    # CSS 規則內 color:var(--muted) 且含 .zh
    bad_css = re.findall(r'[^{}]*\.zh[^{}]*color:var\(--muted[^{}]*\}', html)
    bad_inline = re.findall(r'class="zh"[^>]*color:var\(--muted', html)
    if bad_css or bad_inline:
        print(f"  {p.split('/')[-1]}: 殘留 CSS={len(bad_css)} inline={len(bad_inline)}")
print("DONE")
