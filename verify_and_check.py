#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verify edits + extract <script> blocks for node --check."""
import re, subprocess, sys, os

BASE = "/tmp/mtj/MTJ-Hub/courses/"
files = [
 "Multi_Timeframe_Trading_MakeTradesJourney.html",
 "US_High_Impact_Data_MakeTradesJourney.html",
 "Risk_Management_MakeTradesJourney.html",
 "Journal_Review_MakeTradesJourney.html",
 "Psychology_Discipline_MakeTradesJourney.html",
]
os.makedirs("/tmp/mtj/jscheck", exist_ok=True)
all_ok = True

for f in files:
    p = BASE + f
    src = open(p, encoding="utf-8").read()
    # --- structural checks ---
    css_ok = "body.lang-en .zh{display:none !important;}" in src and "body.lang-zh .zh{display:block !important;}" in src
    btn_ok = src.count('id="langEn"') == 1 and src.count('id="langZh"') == 1 and "setLang('en')" in src and "setLang('zh')" in src
    fn_ok = "function setLang(l)" in src and "mtj_lang" in src
    why_zh_cnt = src.count('"why_zh"')
    old_why_left = len(re.findall(r'item\.why', src))  # should be 0 after fix
    zhmode_ok = "var zhMode = document.body.classList.contains('lang-zh');" in src
    whytxt_ok = "var whyTxt = (zhMode && item.why_zh) ? item.why_zh : item.why;" in src
    # ensure no leftover plain item.why inside gradeExam
    g = re.search(r'function gradeExam\(\)\{.*?\n\}', src, re.S)
    gbody = g.group(0) if g else ""
    item_why_in_grade = gbody.count("item.why")
    # buttons NOT inside mtjBack link: check no 'langEn' appears between '<a href' and 'mtjBack'
    m = re.search(r'<a href="\.\./MakeTradesJourney\.html" id="mtjBack".*?</a>', src, re.S)
    btn_in_link = (m is not None and 'langEn' in m.group(0))
    print(f"== {f}")
    print(f"  CSS rules: {css_ok} | buttons: {btn_ok} | setLang fn: {fn_ok}")
    print(f"  why_zh count: {why_zh_cnt} | zhMode: {zhmode_ok} | whyTxt: {whytxt_ok} | item.why left in gradeExam: {item_why_in_grade}")
    print(f"  buttons inside mtjBack link: {btn_in_link}")
    # --- script extraction & node --check ---
    scripts = re.findall(r'<script>(.*?)</script>', src, re.S)
    print(f"  script blocks: {len(scripts)}")
    ok = True
    for i, s in enumerate(scripts):
        jsfile = f"/tmp/mtj/jscheck/{f.replace('.html','')}_s{i}.js"
        open(jsfile, "w", encoding="utf-8").write(s)
        r = subprocess.run(["node", "--check", jsfile], capture_output=True, text=True)
        status = "OK" if r.returncode == 0 else "FAIL"
        if r.returncode != 0:
            ok = False
        print(f"    script#{i}: node --check -> {status}" + ("" if r.returncode == 0 else f"\n    {r.stderr.strip()[:300]}"))
    all_ok = all_ok and css_ok and btn_ok and fn_ok and why_zh_cnt == 5 and zhmode_ok and whytxt_ok and item_why_in_grade == 0 and not btn_in_link and ok
print("\nALL OK" if all_ok else "\nSOME CHECKS FAILED")
