#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verify all 6 files: why_zh count, CSS rules, buttons, gradeExam scope fix, setLang JS."""
import json, re

base = "/tmp/mtj/MTJ-Hub/courses/"
files = [
    "Three_Types_of_Analysis_MakeTradesJourney.html",
    "Trading_Sessions_MakeTradesJourney.html",
    "Candlestick_Patterns_MakeTradesJourney.html",
    "Chart_Patterns_MakeTradesJourney.html",
    "MA_Support_Resistance_MakeTradesJourney.html",
    "Fibonacci_MakeTradesJourney.html",
]
allok = True
for fn in files:
    with open(base + fn, encoding="utf-8") as fh:
        txt = fh.read()
    errs = []
    # why_zh count
    m = re.search(r"const EXAM_QUESTIONS = (\[.*?\]);", txt, re.S)
    arr = json.loads(m.group(1))
    n_zh = sum(1 for it in arr if isinstance(it.get("why_zh"), str) and it["why_zh"].strip())
    if n_zh != 5:
        errs.append(f"why_zh count={n_zh}")
    # original fields untouched
    for it in arr:
        assert "q" in it and "opts" in it and "ans" in it and "why" in it, fn
    # CSS rules
    if "body.lang-en .zh{display:none !important;}" not in txt:
        errs.append("missing lang-en CSS")
    if "body.lang-zh .zh{display:block !important;}" not in txt:
        errs.append("missing lang-zh CSS")
    # buttons
    if txt.count('id="langEn"') != 1 or txt.count('id="langZh"') != 1:
        errs.append("button count wrong")
    # gradeExam scope fix: whyTxt defined before if/else, used in both branches
    gm = re.search(r"function gradeExam\(\).*?\n\}", txt, re.S)
    if gm:
        g = gm.group(0)
        if "var zhMode = document.body.classList.contains('lang-zh');" not in g:
            errs.append("gradeExam missing zhMode")
        if "var whyTxt = (zhMode && item.why_zh) ? item.why_zh : item.why;" not in g:
            errs.append("gradeExam missing whyTxt")
        # whyTxt must appear in BOTH branches (correct + wrong)
        if g.count("whyTxt") < 3:
            errs.append("whyTxt not used in both branches")
        if re.search(r"\+ item\.why \+", g):
            errs.append("gradeExam still uses item.why directly")
        # ensure whyTxt defined before any use
        pos_def = g.find("var whyTxt")
        pos_use = g.find("whyTxt", pos_def + 1)
        if pos_def == -1 or pos_use < pos_def:
            errs.append("whyTxt scope order wrong")
    else:
        errs.append("gradeExam not found")
    # setLang JS
    if "function setLang(l)" not in txt:
        errs.append("missing setLang")
    if "mtj_lang" not in txt:
        errs.append("missing localStorage")
    if "setLang(saved)" not in txt:
        errs.append("missing init call")
    status = "OK" if not errs else "FAIL: " + "; ".join(errs)
    if errs:
        allok = False
    print(f"{fn}: {status} (why_zh={n_zh})")
print("ALL VERIFIED" if allok else "PROBLEMS FOUND")
