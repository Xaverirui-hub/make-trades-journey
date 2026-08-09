#!/usr/bin/env python3
"""架構調整 v2：
- 首頁: 封面 + "We build traders, not shortcuts" (H2+金句) + CTA
- about.html (新): MTJ 介紹(2022) + Vision + Mission + 3 Values + 金句
"""
import re, os

ROOT = "/tmp/mtj/MTJ-Hub"
SRC = f"{ROOT}/MakeTradesJourney.html"

html = open(SRC, encoding="utf-8").read()
lines = html.split("\n")

def find_line(pattern, start=0):
    for i in range(start, len(lines)):
        if pattern in lines[i]:
            return i
    raise ValueError(f"not found: {pattern}")

i_head_end   = find_line("</head>")
i_nav_start  = find_line('<nav class="navbar"')
i_nav_end    = find_line("</nav>") + 1
i_secnav     = find_line('<nav class="secnav">')
i_secnav_end = find_line("</nav>", i_secnav) + 1
i_wrap_start = find_line('<div class="wrap">')
i_hero_start = find_line('<header class="hero"')
i_hero_end   = find_line("</header>") + 1
i_stats_start= find_line('<div class="hero-stats">')
i_stats_end  = find_line("</div>", i_stats_start) + 1
i_about_start= find_line('<section class="section" id="about">')
i_about_end  = find_line("</section>", i_about_start) + 1
i_close_sec  = find_line('<section class="section closing"')
i_close_end  = find_line("</section>", i_close_sec) + 1
i_footer     = find_line('<footer class="footer">')
i_footer_end = find_line("</footer>") + 1
i_script     = find_line("<script>")

head_block   = "\n".join(lines[:i_head_end+1])
navbar_block = "\n".join(lines[i_nav_start:i_nav_end])
secnav_block = "\n".join(lines[i_secnav:i_secnav_end])
bg_block     = "\n".join(lines[i_nav_end:i_wrap_start])
hero_block   = "\n".join(lines[i_hero_start:i_hero_end])
stats_block  = "\n".join(lines[i_stats_start:i_stats_end])
about_block  = "\n".join(lines[i_about_start:i_about_end])   # 完整 About (Who/VM/Values/manifesto)
close_block  = "\n".join(lines[i_close_sec:i_close_end])
footer_block = "\n".join(lines[i_footer:i_footer_end])
script_block = "\n".join(lines[i_script:])

# ---- 首頁用的精簡版 About（只留 H2 + 金句 manifesto）----
HOME_ABOUT = """<section class="section" id="about" style="text-align:center;">
  <div class="eyebrow reveal" style="justify-content:center;">Who we are · 关于我们</div>
  <h2 class="title reveal">We build traders,<br>not shortcuts.<span class="zh">我们教的不是捷径，是成为专业交易者的路。</span></h2>
  <div class="manifesto reveal" style="max-width:860px;margin:48px auto 0;text-align:center;border-top:1px solid var(--line-soft);padding-top:40px;">
    <p style="font-size:clamp(19px,2.6vw,26px);font-weight:700;line-height:1.7;color:var(--text);letter-spacing:-.01em;">The shortcut trader chases the win and loses the craft.<br>
      The disciplined trader builds the craft and earns the win.
      <span class="zh" style="display:block;font-family:'Noto Sans SC';font-weight:500;font-size:clamp(14px,1.9vw,18px);color:var(--muted);margin-top:14px;">走捷径的人，追着盈利跑，最后丢掉了手艺；<br>守纪律的人，先把手艺练成，盈利自会到来。</span></p>
  </div>
  <div class="cta-row reveal" style="justify-content:center;margin-top:40px;">
    <a class="btn primary" href="about.html">More About Us <span class="ar">→</span></a>
  </div>
</section>"""

# about.html 標題調整（About 頁有自己的 H2）
ABOUT_PAGE_HEAD = """<section class="section" id="about">
  <div class="eyebrow reveal">Who we are · 关于我们</div>
  <h2 class="title reveal">About Make Trades Journey<span class="zh">关于我们</span></h2>
  <p class="lead reveal" style="max-width:860px;">Make Trades Journey was founded in 2022 - born from one belief: that trading can be taught properly, or not at all. This is not a place that promises easy money or a shortcut to comfort. It is a place where discipline is built, chart by chart, decision by decision, until the trader you become is the trader you respect.
    <span class="zh">Make Trades Journey 创立于 2022 年，始于一个信念：交易可以被认真教会，也可以一败涂地。这里不承诺轻松获利，也不贩卖一夜暴富的捷径。这里只用一张张图表、一次次决策，把纪律一寸寸练成你的本能——直到你成为自己都尊重的那位交易者。</span></p>
"""

# 從 about_block 拆出「VM + Values + manifesto」部分（去掉原 h2+lead 段落）
def extract_rest(block):
    # 保留從 vm-grid 開始到 </section> 之前
    m = re.search(r'(<div class="vm-grid".*?)</section>', block, re.S)
    return m.group(1) if m else ""

vm_values_manifesto = extract_rest(about_block)
about_page_body = ABOUT_PAGE_HEAD + "\n" + vm_values_manifesto + "\n</section>"

# ---- navbar 重寫 ----
def rewrite_nav(nav, home, courses, tools, about):
    nav = nav.replace('href="#top" data-sec="home"', 'href="#top" data-sec="home"')
    nav = nav.replace('href="#courses" data-sec="courses"', f'href="{courses}" data-sec="courses"')
    nav = nav.replace('href="#tools" data-sec="tools"', f'href="{tools}" data-sec="tools"')
    nav = nav.replace('href="#about" data-sec="about"', f'href="{about}" data-sec="about"')
    return nav

def rewrite_secnav(sec, links):
    m = re.search(r'<nav class="secnav">(.*?)</nav>', sec, re.S)
    inner = m.group(1)
    new_inner = "".join(f'<a href="{h}"><span class="lbl">{l}</span><span class="pt"></span></a>\n' for l, h in links)
    return sec[:m.start(1)] + new_inner + sec[m.end(1):]

# 主頁
nav_home = rewrite_nav(navbar_block, "#top", "courses.html", "tools.html", "about.html")
secnav_home = rewrite_secnav(secnav_block, [("About · 关于", "about.html"), ("Start · 开始", "#close")])
# about 頁
nav_about = rewrite_nav(navbar_block, "MakeTradesJourney.html", "courses.html", "tools.html", "#top")
secnav_about = rewrite_secnav(secnav_block, [("Who We Are · 关于我们", "#about"), ("Vision · 愿景", "#vision"), ("Values · 价值观", "#values")])
# courses 頁
nav_course = rewrite_nav(navbar_block, "MakeTradesJourney.html", "#top", "tools.html", "about.html")
secnav_course = rewrite_secnav(secnav_block, [("Path · 路径", "#path"), ("Courses · 课程", "#courses"), ("Start · 开始", "#close")])
# tools 頁
nav_tool = rewrite_nav(navbar_block, "MakeTradesJourney.html", "courses.html", "#top", "about.html")
secnav_tool = rewrite_secnav(secnav_block, [("Tools · 工具", "#tools")])

hero_home = hero_block.replace('href="#courses"', 'href="courses.html"')
close_home = close_block.replace('href="#courses"', 'href="courses.html"')
close_about = close_block.replace('href="courses/Trading_Basics_MakeTradesJourney.html"', 'href="courses.html"').replace('href="#courses"', 'href="courses.html"')

body_prefix = re.sub(r'<nav class="secnav">.*?</nav>', '', bg_block, flags=re.S) + '\n<div class="wrap">\n'

# ===== 1. 首頁 =====
home = (head_block + "\n<body>\n" + nav_home + "\n" + secnav_home + "\n" + body_prefix
        + hero_home + "\n" + stats_block + "\n"
        + HOME_ABOUT + "\n"
        + close_home + "\n" + footer_block + "\n"
        + "</div><!-- /wrap -->\n" + script_block)
open(SRC, "w", encoding="utf-8").write(home)

# ===== 2. about.html =====
about = (head_block + "\n<body>\n" + nav_about + "\n" + secnav_about + "\n" + body_prefix
         + about_page_body + "\n"
         + close_about + "\n" + footer_block + "\n"
         + "</div><!-- /wrap -->\n" + script_block)
about = about.replace('<div class="wrap">', '<div class="wrap" style="padding-top:57px;">', 1)
open(f"{ROOT}/about.html", "w", encoding="utf-8").write(about)

# ===== 3. courses.html（navbar about → about.html）=====
courses_path = f"{ROOT}/courses.html"
courses = open(courses_path, encoding="utf-8").read()
courses = courses.replace('href="MakeTradesJourney.html#about"', 'href="about.html"')
open(courses_path, "w", encoding="utf-8").write(courses)

# ===== 4. tools.html（navbar about → about.html）=====
tools_path = f"{ROOT}/tools.html"
tools = open(tools_path, encoding="utf-8").read()
tools = tools.replace('href="MakeTradesJourney.html#about"', 'href="about.html"')
open(tools_path, "w", encoding="utf-8").write(tools)

print("OK")
for f in ["MakeTradesJourney.html", "about.html", "courses.html", "tools.html"]:
    print(f"  {f}: {os.path.getsize(f'{ROOT}/{f}'):,} bytes")
