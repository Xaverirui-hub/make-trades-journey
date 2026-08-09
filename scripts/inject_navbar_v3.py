#!/usr/bin/env python3
"""全站 Navbar v3 注入器 — 玻璃擬態 + logo + 語言整合。

替換舊 navbar（HOME/COURSES/TOOLS/ABOUT 簡單版）為 v3：
- 左: logo + Make Trades Journey
- 中: nav links
- 右: EN/中 語言 toggle
- 玻璃擬態 CSS
- 移除舊 topbar 的 brand/live/語言按鈕（整個 topbar 刪除）
- body padding-top 57px（navbar 高度）

用法: python3 inject_navbar_v3.py <repo根>
"""
import re, glob, sys

NAVBAR_V3_CSS = """
/* ===== Global Navbar v3 (glass + logo + lang) ===== */
.navbar{
  position:fixed;top:0;left:0;right:0;z-index:95;
  display:flex;align-items:center;justify-content:space-between;
  gap:12px;padding:10px clamp(14px,3vw,28px);
  background:rgba(10,10,14,.55);
  -webkit-backdrop-filter:blur(18px) saturate(160%);
  backdrop-filter:blur(18px) saturate(160%);
  border-bottom:1px solid rgba(232,200,119,.14);
  box-shadow:0 1px 0 rgba(255,255,255,.04) inset, 0 8px 32px rgba(0,0,0,.18);
  font-family:'JetBrains Mono',ui-monospace,monospace;
}
.navbar .nb-brand{display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0;}
.navbar .nb-brand img{height:30px;width:auto;border-radius:6px;}
.navbar .nb-brand .nb-name{font-size:11px;font-weight:700;letter-spacing:.14em;color:var(--text);text-transform:uppercase;}
.navbar .nb-links{display:flex;align-items:center;gap:2px;flex-wrap:nowrap;}
.navbar .nb-links a{
  font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;
  color:var(--muted);text-decoration:none;padding:6px 12px;border-radius:16px;transition:.25s;white-space:nowrap;
}
.navbar .nb-links a:hover{color:var(--gold-bright);background:rgba(232,200,119,.08);}
.navbar .nb-links a.active{color:var(--gold-bright);border:1px solid rgba(232,200,119,.35);background:rgba(232,200,119,.1);}
.navbar .nb-right{display:flex;align-items:center;gap:8px;flex-shrink:0;}
.navbar .nb-lang{display:flex;align-items:center;gap:4px;background:rgba(232,200,119,.08);border:1px solid rgba(232,200,119,.2);border-radius:20px;padding:3px;}
.navbar .nb-lang button{
  background:none;border:none;color:var(--muted);font-family:'JetBrains Mono',monospace;
  font-size:10px;letter-spacing:.08em;padding:4px 10px;border-radius:16px;cursor:pointer;transition:.2s;
}
.navbar .nb-lang button.on{color:var(--gold-bright);background:rgba(232,200,119,.18);}
@media(max-width:640px){
  .navbar{flex-wrap:wrap;padding:8px 10px;gap:6px;}
  .navbar .nb-brand .nb-name{display:none;}
  .navbar .nb-links{order:3;width:100%;justify-content:center;gap:0;}
  .navbar .nb-links a{font-size:9px;padding:5px 8px;letter-spacing:.1em;}
  .navbar .nb-right{margin-left:auto;}
}
"""

def get_logo(html):
    """從頁面抽出 base64 logo（JPEG 或 PNG，任何 alt=Make Trades Journey 的 img）"""
    for pat in [
        r'<img[^>]*src="(data:image/(?:jpeg|png);base64,[^"]+)"[^>]*alt="Make Trades Journey"[^>]*>',
        r'<a class="brand"[^>]*>\s*<img src="(data:image/(?:jpeg|png);base64,[^"]+)"',
        r'<img class="logo"[^>]*src="(data:image/(?:jpeg|png);base64,[^"]+)"',
    ]:
        m = re.search(pat, html, re.DOTALL)
        if m:
            return m.group(1)
    return None

def build_navbar(active, prefix, logo_src):
    links = [
        ('home', 'Home', f'{prefix}#top'),
        ('courses', 'Courses', f'{prefix}#courses'),
        ('tools', 'Tools', f'{prefix}#tools'),
        ('about', 'About', f'{prefix}#about'),
    ]
    items = []
    for sec, en, href in links:
        cls = ' class="active"' if sec == active else ''
        zh = {'home': '首页', 'courses': '课程', 'tools': '工具', 'about': '关于'}[sec]
        items.append(f'    <a href="{href}" data-sec="{sec}"{cls}>{en} <span class="zh">· {zh}</span></a>')
    return f'''<nav class="navbar" id="globalNav">
  <a class="nb-brand" href="{prefix}#top">
    <img src="{logo_src}" alt="Make Trades Journey">
    <span class="nb-name">Make Trades Journey</span>
  </a>
  <div class="nb-links">
{chr(10).join(items)}
  </div>
  <div class="nb-right">
    <div class="nb-lang">
      <button id="langEn" onclick="setLang('en')">EN</button>
      <button id="langZh" onclick="setLang('zh')">中</button>
    </div>
  </div>
</nav>
'''

def process(fpath, page_type):
    s = open(fpath, encoding="utf-8").read()
    if 'Global Navbar v3' in s:
        return 'skip'

    logo = get_logo(s)
    if not logo:
        return f'err: no logo in {fpath}'

    # active / prefix
    if page_type == 'home':
        active, prefix = 'home', ''
    elif page_type == 'course':
        active, prefix = 'courses', '../MakeTradesJourney.html'
    else:
        active, prefix = 'tools', '../MakeTradesJourney.html'

    navbar_html = build_navbar(active, prefix, logo)

    # 1. 移除舊 navbar（v1/v2 簡單版）
    s = re.sub(r'<nav class="navbar" id="globalNav"[^>]*>.*?</nav>\s*', '', s, flags=re.DOTALL)
    # 移除舊 navbar CSS 相關（.navbar{position:fixed;top:... 塊 + media query）
    s = re.sub(r'\.navbar\{position:fixed;[^}]+\}\s*', '', s)
    s = re.sub(r'\.navbar a\{[^}]+\}\s*', '', s)
    s = re.sub(r'\.navbar a:hover\{[^}]+\}\s*', '', s)
    s = re.sub(r'\.navbar a\.active\{[^}]+\}\s*', '', s)
    s = re.sub(r'@media\(max-width:560px\)\{\.navbar[^}]*\}\s*', '', s)
    s = re.sub(r'/\* ===== Global navbar[^/]*\*/\s*', '', s, flags=re.DOTALL)
    # scroll spy 舊 JS
    s = re.sub(r'<script>\s*/\* ===== Global navbar scroll spy ===== \*/.*?</script>\s*', '', s, flags=re.DOTALL)

    # 2. 插入 v3 CSS（</style> 前）
    style_end = s.rfind('</style>')
    if style_end > 0:
        s = s[:style_end] + NAVBAR_V3_CSS + s[style_end:]

    # 3. 插入 v3 navbar（<body> 後）
    body_start = s.find('<body')
    body_tag_end = s.find('>', body_start) + 1
    s = s[:body_tag_end] + '\n' + navbar_html + s[body_tag_end:]

    # 4. 移除舊 topbar（brand/live/語言按鈕）— 整個 <div class="topbar">...</div>
    topbar_start = s.find('<div class="topbar">')
    if topbar_start >= 0:
        depth = 0
        i = topbar_start
        while i < len(s):
            if s.startswith('</div>', i):
                depth -= 1
                if depth == 0:
                    s = s[:topbar_start] + s[i+6:]
                    break
                i += 6
            elif s.startswith('<div', i):
                depth += 1
                i += 4
            else:
                i += 1

    # 5. 移除殘留語言按鈕（不在 navbar 的）
    s = re.sub(r'\s*<button onclick="setLang\(\'en\'\)" id="langEn"[^>]*>EN</button>\s*', '\n', s)
    s = re.sub(r'\s*<button onclick="setLang\(\'zh\'\)" id="langZh"[^>]*>中</button>\s*', '\n', s)
    # 移除 Learning Hub Live
    s = re.sub(r'\s*<div class="live">.*?</div>\s*', '\n', s, flags=re.DOTALL)
    # 移除 topbar CSS（不再使用）
    s = re.sub(r'\.topbar\{[^}]+\}\s*', '', s)
    s = re.sub(r'\.brand\{[^}]+\}\s*', '', s)

    # 6. body padding-top（防 navbar 蓋內容）
    s = re.sub(r'<body[^>]*>', lambda m: m.group(0), s, count=1)
    if 'padding-top:57px' not in s:
        s = re.sub(r'body\{\s*margin:0;', 'body{\n  margin:0;padding-top:57px;', s, count=1)

    # 7. setLang 高亮 class
    s = s.replace("""    var en = document.getElementById('langEn'), zh = document.getElementById('langZh');""",
                  """    var en = document.getElementById('langEn'), zh = document.getElementById('langZh');
    if(en) en.classList.toggle('on', l !== 'zh');
    if(zh) zh.classList.toggle('on', l === 'zh');""")

    open(fpath, "w", encoding="utf-8").write(s)
    return 'ok'

if __name__ == "__main__":
    root = sys.argv[1] if len(sys.argv) > 1 else "/tmp/mtj"
    files = [('home', root + "/MTJ-Hub/MakeTradesJourney.html")]
    for f in glob.glob(root + "/MTJ-Hub/courses/*.html"):
        files.append(('course', f))
    for f in glob.glob(root + "/MTJ-Hub/tools/*.html"):
        files.append(('tool', f))
    ok = skip = err = 0
    for ptype, f in files:
        r = process(f, ptype)
        if r == 'ok': ok += 1
        elif r == 'skip': skip += 1
        else: err += 1; print(r)
    print(f"完成: ok={ok} skip={skip} err={err} 總數={len(files)}")
