#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import io, sys

SRC = "/tmp/mtj/MTJ-Hub/courses/Risk_Management_MakeTradesJourney.html"
DST = "/tmp/mtj/MTJ-Hub/courses/Supply_Demand_MakeTradesJourney.html"

with io.open(SRC, "r", encoding="utf-8") as f:
    html = f.read()

def rep(old, new, tag):
    global html
    n = html.count(old)
    if n != 1:
        print("FAIL[%s]: anchor count = %d" % (tag, n))
        sys.exit(1)
    html = html.replace(old, new)
    print("OK[%s]" % tag)

# ---- 1. title ----
rep("<title>Risk Management &amp; Position Sizing &#183; Make Trades Journey</title>",
    "<title>Supply &amp; Demand Zones &#183; Make Trades Journey</title>", "title")

# ---- 2. topbar live label ----
rep("<div class=\"live\"><span class=\"dot\"></span>Risk&nbsp;Course · Live</div>",
    "<div class=\"live\"><span class=\"dot\"></span>Supply&nbsp;&amp;&nbsp;Demand · Live</div>", "topbar-live")

# ---- 3. section nav ----
old_nav = """<nav class="secnav">
  <a href="#agenda-sec"><span class="lbl">Overview · 总览</span><span class="pt"></span></a>
  <a href="#math"><span class="lbl">The Math · 亏损数学</span><span class="pt"></span></a>
  <a href="#sizing"><span class="lbl">Position Size · 仓位</span><span class="pt"></span></a>
  <a href="#stops"><span class="lbl">Stop Loss · 止损</span><span class="pt"></span></a>
  <a href="#rr"><span class="lbl">R:R · 盈亏比</span><span class="pt"></span></a>
  <a href="#leverage"><span class="lbl">Leverage · 杠杆</span><span class="pt"></span></a>
  <a href="#rules"><span class="lbl">Rules · 帐户风控</span><span class="pt"></span></a>
  <a href="#practice"><span class="lbl">Practice · 实战</span><span class="pt"></span></a>
</nav>"""
new_nav = """<nav class="secnav">
  <a href="#agenda-sec"><span class="lbl">Overview · 总览</span><span class="pt"></span></a>
  <a href="#logic"><span class="lbl">The Logic · 机构逻辑</span><span class="pt"></span></a>
  <a href="#demand"><span class="lbl">Demand · 需求区</span><span class="pt"></span></a>
  <a href="#supply"><span class="lbl">Supply · 供应区</span><span class="pt"></span></a>
  <a href="#zoneline"><span class="lbl">Zone vs Line · 区与线</span><span class="pt"></span></a>
  <a href="#rtb"><span class="lbl">RTB · 回测</span><span class="pt"></span></a>
  <a href="#invalid"><span class="lbl">Failure · 失效</span><span class="pt"></span></a>
  <a href="#trend"><span class="lbl">Trend · 顺势</span><span class="pt"></span></a>
  <a href="#mistakes"><span class="lbl">Mistakes · 错误</span><span class="pt"></span></a>
</nav>"""
rep(old_nav, new_nav, "secnav")

# ---- 4. hero text ----
old_hero = """  <div class="course-tag">Trading Course · Required</div>
  <h1>Risk &amp;<br>Position Sizing</h1>
  <div class="h-zh">风 控 · 仓 位 计 算</div>
  <p class="h-sub">Entries make the story. Position size decides whether you're still here to tell it.
    <span class="zh">进场决定故事精不精彩，仓位决定你还在不在场上说这个故事。</span></p>"""
new_hero = """  <div class="course-tag">Trading Course · Module 14</div>
  <h1>Supply &amp;<br>Demand Zones</h1>
  <div class="h-zh">供 需 区</div>
  <p class="h-sub">Institutions leave footprints. Zones are where the footprints live — and where the next move is born.
    <span class="zh">机构会留下脚印。供需区就是脚印所在的地方 —— 也是下一波行情诞生的地方。</span></p>"""
rep(old_hero, new_hero, "hero")

# ---- 5. big body splice: agenda .. closing (keep footer marker) ----
start_marker = "<!-- ================= AGENDA ================= -->"
end_marker = "<!-- ================= FOOTER ================= -->"
i0 = html.find(start_marker)
i1 = html.find(end_marker)
if i0 < 0 or i1 < 0 or i1 <= i0:
    print("FAIL[body-splice]: markers not found", i0, i1)
    sys.exit(1)
with io.open("/tmp/mtj/new_body.html", "r", encoding="utf-8") as f:
    new_body = f.read()
html = html[:i0] + new_body + html[i1:]
print("OK[body-splice] replaced %d chars -> %d chars" % (i1 - i0, len(new_body)))

# ---- 6. big script splice: drawing functions .. render call ----
js_start = "/* ============ 1. recovery curve ============ */"
js_end = "document.querySelectorAll('.rchart[data-r]').forEach(b=>{const f=RENDER[b.dataset.r];if(f)f(b);});"
j0 = html.find(js_start)
j1 = html.find(js_end)
if j0 < 0 or j1 < 0 or j1 <= j0:
    print("FAIL[js-splice]: markers not found", j0, j1)
    sys.exit(1)
j1 = j1 + len(js_end)
with io.open("/tmp/mtj/new_script.js", "r", encoding="utf-8") as f:
    new_js = f.read()
html = html[:j0] + new_js + html[j1:]
print("OK[js-splice] replaced %d chars -> %d chars" % (j1 - j0, len(new_js)))

# ---- 7. footer copy line ----
rep("© <span id=\"yr\"></span> Make Trades Journey · By XRs Trading Lab · Risk Management &amp; Position Sizing</div>",
    "© <span id=\"yr\"></span> Make Trades Journey · By XRs Trading Lab · Supply &amp; Demand Zones</div>", "footer-copy")

with io.open(DST, "w", encoding="utf-8") as f:
    f.write(html)
print("WROTE", DST, len(html.encode("utf-8")), "bytes")
