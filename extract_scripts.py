#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Extract all inline <script> blocks from each course file into /tmp/mtj/scripts/ for node --check."""
import re, os

base = "/tmp/mtj/MTJ-Hub/courses/"
outdir = "/tmp/mtj/scripts"
os.makedirs(outdir, exist_ok=True)
files = [
    "Three_Types_of_Analysis_MakeTradesJourney.html",
    "Trading_Sessions_MakeTradesJourney.html",
    "Candlestick_Patterns_MakeTradesJourney.html",
    "Chart_Patterns_MakeTradesJourney.html",
    "MA_Support_Resistance_MakeTradesJourney.html",
    "Fibonacci_MakeTradesJourney.html",
]
for fn in files:
    with open(base + fn, encoding="utf-8") as fh:
        txt = fh.read()
    # find all <script ...> ... </script> without src
    blocks = re.findall(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", txt, re.S)
    stem = fn.replace(".html", "")
    for i, b in enumerate(blocks):
        p = f"{outdir}/{stem}_{i}.js"
        with open(p, "w", encoding="utf-8") as fh:
            fh.write(b)
    print(f"{fn}: {len(blocks)} inline scripts extracted (last = {stem}_{len(blocks)-1}.js)")
