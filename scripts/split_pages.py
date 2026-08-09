#!/usr/bin/env python3
"""MTJ 拆頁正式版 — 從 MakeTradesJourney.html 拆出 courses.html + tools.html
策略：
1. 主頁：砍 path/courses/tools 段，換新 About（v4+VM+Values+金句）
2. 生成 courses.html（stage + 課程庫）
3. 生成 tools.html（工具台）
4. 更新 navbar/secnav href 指向新頁
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

# ---- 區段定位 ----
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
i_path_div   = find_line("LEARNING PATH")
i_path_sec   = find_line('<section class="section" id="path">')
i_path_end   = find_line("</section>", i_path_sec) + 1
i_course_div = find_line("COURSES =================")
i_course_sec = find_line('<section class="section" id="courses">')
i_course_end = find_line("</section>", i_course_sec) + 1
i_tool_div   = find_line("TOOLS =================")
i_tool_sec   = find_line('<section class="section" id="tools">')
i_tool_end   = find_line("</section>", i_tool_sec) + 1
i_close_sec  = find_line('<section class="section closing"')
i_close_end  = find_line("</section>", i_close_sec) + 1
i_footer     = find_line('<footer class="footer">')
i_footer_end = find_line("</footer>") + 1
i_wrap_end   = find_line("</div><!-- /wrap -->")
i_script     = find_line("<script>")

head_block      = "\n".join(lines[:i_head_end+1])
navbar_block    = "\n".join(lines[i_nav_start:i_nav_end])
secnav_block    = "\n".join(lines[i_secnav:i_secnav_end])
bg_block        = "\n".join(lines[i_nav_end:i_wrap_start])
hero_block      = "\n".join(lines[i_hero_start:i_hero_end])
stats_block     = "\n".join(lines[i_stats_start:i_stats_end])
about_block     = "\n".join(lines[i_about_start:i_about_end])
path_div_block  = "\n".join(lines[i_path_div:i_path_sec])
path_block      = "\n".join(lines[i_path_sec:i_path_end])
course_div_block= "\n".join(lines[i_course_div:i_course_sec])
course_block    = "\n".join(lines[i_course_sec:i_course_end])
tool_div_block  = "\n".join(lines[i_tool_div:i_tool_sec])
tool_block      = "\n".join(lines[i_tool_sec:i_tool_end])
close_block     = "\n".join(lines[i_close_sec:i_close_end])
footer_block    = "\n".join(lines[i_footer:i_footer_end])
script_block    = "\n".join(lines[i_script:])

# ---- 新 About ----
NEW_ABOUT = """<section class="section" id="about">
  <div class="eyebrow reveal">Who we are · 关于我们</div>
  <h2 class="title reveal">We build traders,<br>not shortcuts.<span class="zh">我们教的不是捷径，是成为专业交易者的路。</span></h2>
  <p class="lead reveal" style="max-width:860px;">Make Trades Journey was founded in 2022 - born from one belief: that trading can be taught properly, or not at all. This is not a place that promises easy money or a shortcut to comfort. It is a place where discipline is built, chart by chart, decision by decision, until the trader you become is the trader you respect.
    <span class="zh">Make Trades Journey 创立于 2022 年，始于一个信念：交易可以被认真教会，也可以一败涂地。这里不承诺轻松获利，也不贩卖一夜暴富的捷径。这里只用一张张图表、一次次决策，把纪律一寸寸练成你的本能——直到你成为自己都尊重的那位交易者。</span></p>

  <div class="vm-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:44px;max-width:860px;">
    <div class="vm-card reveal" style="border:1px solid var(--line-soft);border-radius:14px;padding:22px 24px;background:linear-gradient(180deg,rgba(232,200,119,.05),transparent);">
      <div class="vm-tag" style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.24em;color:var(--gold);text-transform:uppercase;">Vision · 愿景</div>
      <p style="margin:12px 0 0;font-size:14px;color:var(--text);line-height:1.8;">A world where anyone who truly wants to trade can be taught properly - and chooses discipline over shortcuts.
        <span class="zh" style="display:block;font-family:'Noto Sans SC';font-size:13px;color:var(--muted);margin-top:6px;">让每一个真正想交易的人，都有机会被正确地教会——并且选择纪律，而非捷径。</span></p>
    </div>
    <div class="vm-card reveal" style="border:1px solid var(--line-soft);border-radius:14px;padding:22px 24px;background:linear-gradient(180deg,rgba(232,200,119,.05),transparent);">
      <div class="vm-tag" style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.24em;color:var(--gold);text-transform:uppercase;">Mission · 使命</div>
      <p style="margin:12px 0 0;font-size:14px;color:var(--text);line-height:1.8;">To build professional traders through structured, bilingual, visual education - one concept, one chart, one disciplined decision at a time.
        <span class="zh" style="display:block;font-family:'Noto Sans SC';font-size:13px;color:var(--muted);margin-top:6px;">通过系统化、双语、图解式的教育培养专业交易者——一个概念、一张图、一次有纪律的决策。</span></p>
    </div>
  </div>
  <style>@media(max-width:700px){.vm-grid{grid-template-columns:1fr !important;}}</style>

  <div class="pillars" style="margin-top:16px;">
    <div class="pil reveal">
      <div class="ico">RESPECT</div>
      <h3>Respect the Market</h3>
      <div class="zh">敬畏市场</div>
      <p>The market owes you nothing. Every edge is borrowed, every win is rented - humility is not a virtue here, it is survival.
        <span class="zh" style="display:block;">市场不欠你任何东西。每一分优势都是借来的，每一次盈利都是租来的——敬畏不是美德，是生存。</span></p>
    </div>
    <div class="pil reveal">
      <div class="ico">DISCIPLINE</div>
      <h3>Discipline Over Shortcuts</h3>
      <div class="zh">纪律胜过捷径</div>
      <p>There is no secret indicator, no holy grail, no overnight formula. There is only the slow, boring, repeatable process that works.
        <span class="zh" style="display:block;">没有秘密指标，没有圣杯，没有一夜暴富的公式。只有那个缓慢、枯燥、可以重复执行的过程。</span></p>
    </div>
    <div class="pil reveal">
      <div class="ico">RISK FIRST</div>
      <h3>Risk Before Reward</h3>
      <div class="zh">风控优先</div>
      <p>How much you can lose matters more than how much you can win. Protect the account first, and the profits will have somewhere to live.
        <span class="zh" style="display:block;">你能亏多少，比你能赚多少更重要。先保护好账户，盈利才有地方住。</span></p>
    </div>
  </div>

  <div class="manifesto reveal" style="max-width:860px;margin:56px auto 0;text-align:center;border-top:1px solid var(--line-soft);padding-top:40px;">
    <p style="font-size:clamp(19px,2.6vw,26px);font-weight:700;line-height:1.7;color:var(--text);letter-spacing:-.01em;">The shortcut trader chases the win and loses the craft.<br>
      The disciplined trader builds the craft and earns the win.
      <span class="zh" style="display:block;font-family:'Noto Sans SC';font-weight:500;font-size:clamp(14px,1.9vw,18px);color:var(--muted);margin-top:14px;">走捷径的人，追着盈利跑，最后丢掉了手艺；<br>守纪律的人，先把手艺练成，盈利自会到来。</span></p>
  </div>
</section>"""

# ---- href 重寫 ----
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

# navbar：主頁
nav_home = rewrite_nav(navbar_block, "#top", "courses.html", "tools.html", "#about")
secnav_home = rewrite_secnav(secnav_block, [("About · 关于", "#about"), ("Start · 开始", "#close")])
# courses 頁 navbar
nav_course = rewrite_nav(navbar_block, "MakeTradesJourney.html", "#top", "tools.html", "MakeTradesJourney.html#about")
secnav_course = rewrite_secnav(secnav_block, [("Path · 路径", "#path"), ("Courses · 课程", "#courses"), ("Start · 开始", "#close")])
# tools 頁 navbar
nav_tool = rewrite_nav(navbar_block, "MakeTradesJourney.html", "courses.html", "#top", "MakeTradesJourney.html#about")
secnav_tool = rewrite_secnav(secnav_block, [("Tools · 工具", "#tools")])

# hero CTA / closing CTA
hero_home = hero_block.replace('href="#courses"', 'href="courses.html"')
close_home = close_block.replace('href="#courses"', 'href="courses.html"')

# bg（移除殘留 secnav）
body_prefix = re.sub(r'<nav class="secnav">.*?</nav>', '', bg_block, flags=re.S) + '\n<div class="wrap">\n'

# ===== 1. 主頁 =====
home = (head_block + "\n<body>\n" + nav_home + "\n" + secnav_home + "\n" + body_prefix
        + hero_home + "\n" + stats_block + "\n"
        + NEW_ABOUT + "\n"
        + close_home + "\n" + footer_block + "\n"
        + "</div><!-- /wrap -->\n" + script_block)
open(SRC, "w", encoding="utf-8").write(home)

# ===== 2. courses.html =====
courses = (head_block + "\n<body>\n" + nav_course + "\n" + secnav_course + "\n" + body_prefix
        + path_div_block + "\n" + path_block + "\n"
        + course_div_block + "\n" + course_block + "\n"
        + close_block.replace('href="courses/Trading_Basics_MakeTradesJourney.html"', 'href="courses/Trading_Basics_MakeTradesJourney.html"').replace('href="#courses"', 'href="courses.html"')
        + "\n" + footer_block + "\n"
        + "</div><!-- /wrap -->\n" + script_block)
# courses 頁無 hero → wrap 加頂部 padding 避開 fixed navbar
courses = courses.replace('<div class="wrap">', '<div class="wrap" style="padding-top:57px;">', 1)
open(f"{ROOT}/courses.html", "w", encoding="utf-8").write(courses)

# ===== 3. tools.html =====
tools = (head_block + "\n<body>\n" + nav_tool + "\n" + secnav_tool + "\n" + body_prefix
        + tool_div_block + "\n" + tool_block + "\n"
        + close_block.replace('href="#courses"', 'href="courses.html"')
        + "\n" + footer_block + "\n"
        + "</div><!-- /wrap -->\n" + script_block)
tools = tools.replace('<div class="wrap">', '<div class="wrap" style="padding-top:57px;">', 1)
open(f"{ROOT}/tools.html", "w", encoding="utf-8").write(tools)

print("OK — 3 files written")
for f in ["MakeTradesJourney.html", "courses.html", "tools.html"]:
    print(f"  {f}: {os.path.getsize(f'{ROOT}/{f}'):,} bytes")
