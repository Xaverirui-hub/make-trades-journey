#!/usr/bin/env python3
"""更新 26 頁（22課+4工具）navbar href：錨點 → 新頁
courses 頁:  #courses → #top(自身),  #tools → ../tools.html,  #about → ../MakeTradesJourney.html#about
tools 頁:    #courses → ../courses.html,  #tools → #top(自身),  #about → ../MakeTradesJourney.html#about
"""
import glob, re

def fix_course(path):
    html = open(path, encoding="utf-8").read()
    orig = html
    html = html.replace('href="../MakeTradesJourney.html#courses"', 'href="#top"')
    html = html.replace('href="../MakeTradesJourney.html#tools"', 'href="../tools.html"')
    # #about 保留指主頁（about 在主頁）
    html = html.replace('href="../MakeTradesJourney.html#about"', 'href="../MakeTradesJourney.html#about"')
    if html != orig:
        open(path, "w", encoding="utf-8").write(html)
        return True
    return False

def fix_tool(path):
    html = open(path, encoding="utf-8").read()
    orig = html
    html = html.replace('href="../MakeTradesJourney.html#courses"', 'href="../courses.html"')
    html = html.replace('href="../MakeTradesJourney.html#tools"', 'href="#top"')
    if html != orig:
        open(path, "w", encoding="utf-8").write(html)
        return True
    return False

n_c = sum(1 for p in glob.glob("/tmp/mtj/MTJ-Hub/courses/*.html") if fix_course(p))
n_t = sum(1 for p in glob.glob("/tmp/mtj/MTJ-Hub/tools/*.html") if fix_tool(p))
print(f"courses 頁更新: {n_c}, tools 頁更新: {n_t}")

# 驗證殘留
rem_c = sum(1 for p in glob.glob("/tmp/mtj/MTJ-Hub/courses/*.html") if "MakeTradesJourney.html#courses" in open(p, encoding="utf-8").read())
rem_t = sum(1 for p in glob.glob("/tmp/mtj/MTJ-Hub/tools/*.html") if "MakeTradesJourney.html#tools" in open(p, encoding="utf-8").read())
print(f"殘留 #courses: {rem_c}, 殘留 #tools: {rem_t}")
