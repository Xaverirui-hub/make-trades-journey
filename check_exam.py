#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verify EXAM_QUESTIONS lines parse as JSON and dump the why texts in order."""
import json, re, sys

files = [
    "Three_Types_of_Analysis_MakeTradesJourney.html",
    "Trading_Sessions_MakeTradesJourney.html",
    "Candlestick_Patterns_MakeTradesJourney.html",
    "Chart_Patterns_MakeTradesJourney.html",
    "MA_Support_Resistance_MakeTradesJourney.html",
    "Fibonacci_MakeTradesJourney.html",
]
base = "/tmp/mtj/MTJ-Hub/courses/"
for fn in files:
    with open(base + fn, encoding="utf-8") as fh:
        lines = fh.readlines()
    idx = None
    for i, ln in enumerate(lines):
        if ln.lstrip().startswith("const EXAM_QUESTIONS"):
            idx = i
            break
    if idx is None:
        print(f"{fn}: NO EXAM_QUESTIONS LINE"); continue
    ln = lines[idx]
    start = ln.index("[")
    end = ln.rindex("]")
    arr = json.loads(ln[start:end+1])
    print(f"=== {fn} ({len(arr)} questions) ===")
    for j, it in enumerate(arr):
        print(f"  {j}: {it['why']!r}")
    assert ln.rstrip().endswith("];"), "line does not end with ];"
    # check why_zh absent
    assert "why_zh" not in ln, "why_zh already present!"
print("ALL OK")
