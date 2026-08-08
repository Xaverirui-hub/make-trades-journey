#!/usr/bin/env python3
"""MTJ 全站 navbar 注入器 — 純追加模式（不刪任何原版內容）。

用法:
  python3 inject_navbar.py <repo根目錄>

對每個 HTML 檔:
  1. CSS: </style> 前追加 navbar CSS
  2. HTML: <body> 後插入 navbar（依頁面類型決定 active 和連結）
  3. JS: </body> 前追加 scroll spy

頁面類型判定:
  - 主頁 (MakeTradesJourney.html): active=home, 連結用 #top/#courses/#tools/#about
  - 課程 (courses/*.html): active=courses, 連結用 ../MakeTradesJourney.html#...
  - 工具 (tools/*.html): active=tools, 連結用 ../MakeTradesJourney.html#...
"""
import re, glob, sys, os

NAVBAR_CSS = """
/* ===== Global navbar (appended, original untouched) ===== */
.navbar{position:fixed;top:62px;left:0;right:0;z-index:39;display:flex;align-items:center;justify-content:center;
  gap:clamp(8px,2vw,20px);padding:8px 20px;background:linear-gradient(to bottom,rgba(6,6,8,.9),rgba(6,6,8,.45) 75%,transparent);
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}
.navbar a{font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;
  color:var(--muted);text-decoration:none;padding:5px 14px;border-radius:18px;transition:.25s;white-space:nowrap;}
.navbar a:hover{color:var(--gold-bright);background:rgba(232,200,119,.08);}
.navbar a.active{color:var(--gold-bright);border:1px solid rgba(232,200,119,.35);background:rgba(232,200,119,.1);}
@media(max-width:560px){.navbar{gap:2px;top:62px;padding:6px 4px;}.navbar a{font-size:9px;letter-spacing:.1em;padding:4px 7px;}}
"""

NAVBAR_SPY = """
<script>
/* ===== Global navbar scroll spy ===== */
(function(){
  var nav = document.getElementById('globalNav'); if(!nav) return;
  var links = nav.querySelectorAll('a[data-sec]');
  var secs = {};
  links.forEach(function(a){ var id = a.getAttribute('data-sec'); var el = document.getElementById(id); if(el) secs[id]=el; });
  var secList = [];
  for(var id in secs){ secList.push({id:id, top:secs[id].offsetTop}); }
  secList.sort(function(a,b){ return a.top - b.top; }); /* 依頁面位置排序 */
  var hasSecs = secList.length > 0;
  function spy(){
    if(!hasSecs) return; /* 無對應 section（課程/工具頁）→ 保持初始 active */
    var cur = links.length ? links[0].getAttribute('data-sec') : ''; /* 初始 = 首項(home) */
    var y = window.scrollY + 140;
    for(var i=0;i<secList.length;i++){
      if(secList[i].top <= y) cur = secList[i].id;
    }
    links.forEach(function(a){ a.classList.toggle('active', a.getAttribute('data-sec')===cur); });
  }
  window.addEventListener('scroll', spy, {passive:true});
  spy();
})();
</script>
"""

def navbar_html(active, prefix=''):
    """prefix: 課程/工具頁連結主頁的相對路徑 (../MakeTradesJourney.html 或空)"""
    links = [
        ('home', 'Home', f'{prefix}#top'),
        ('courses', 'Courses', f'{prefix}#courses'),
        ('tools', 'Tools', f'{prefix}#tools'),
        ('about', 'About', f'{prefix}#about'),
    ]
    items = []
    for sec, en, href in links:
        cls = ' class="active"' if sec == active else ''
        items.append(f'  <a href="{href}" data-sec="{sec}"{cls}>{en} <span class="zh">· {zh_label(sec)}</span></a>')
    return '<!-- ===== Global navbar ===== -->\n<nav class="navbar" id="globalNav">\n' + '\n'.join(items) + '\n</nav>\n'

def zh_label(sec):
    return {'home': '首页', 'courses': '课程', 'tools': '工具', 'about': '关于'}[sec]

def inject(fpath):
    s = open(fpath).read()
    if 'id="globalNav"' in s:
        return 'skip'
    base = os.path.basename(fpath)
    dirn = os.path.dirname(fpath)
    if base == 'MakeTradesJourney.html':
        active, prefix = 'home', ''
    elif 'courses' in dirn:
        active, prefix = 'courses', '../MakeTradesJourney.html'
    elif 'tools' in dirn:
        active, prefix = 'tools', '../MakeTradesJourney.html'
    else:
        active, prefix = 'home', ''
    
    # 1. CSS
    style_end = s.rfind('</style>')
    if style_end == -1:
        return 'no-style'
    s = s[:style_end] + NAVBAR_CSS + s[style_end:]
    
    # 2. HTML
    body_start = s.find('<body>')
    if body_start == -1:
        return 'no-body'
    s = s[:body_start+6] + '\n' + navbar_html(active, prefix) + s[body_start+6:]
    
    # 3. JS
    body_end = s.rfind('</body>')
    if body_end == -1:
        return 'no-body-end'
    s = s[:body_end] + NAVBAR_SPY + s[body_end:]
    
    open(fpath, 'w').write(s)
    return 'ok'

def main():
    root = sys.argv[1] if len(sys.argv) > 1 else '/tmp/mtj'
    hub = os.path.join(root, 'MTJ-Hub')
    if not os.path.isdir(hub):
        print(f'❌ {hub} 不存在')
        sys.exit(1)
    
    files = [os.path.join(hub, 'MakeTradesJourney.html')]
    files += sorted(glob.glob(os.path.join(hub, 'courses/*.html')))
    files += sorted(glob.glob(os.path.join(hub, 'tools/*.html')))
    
    results = {'ok': 0, 'skip': 0, 'err': 0}
    for f in files:
        r = inject(f)
        results[r if r in results else 'err'] = results.get(r if r in results else 'err', 0) + 1
        print(f'{r:>8} {os.path.relpath(f, root)}')
    
    print(f'\n完成: ok={results["ok"]} skip={results["skip"]} err={results["err"]}')

if __name__ == '__main__':
    main()
