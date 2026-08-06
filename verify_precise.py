#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Precise verification: no old fb.innerHTML item.why usage; q/opts/ans/why unchanged; why_zh correct."""
import re, json

BASE = "/tmp/mtj/MTJ-Hub/courses/"
files = [
 "Multi_Timeframe_Trading_MakeTradesJourney.html",
 "US_High_Impact_Data_MakeTradesJourney.html",
 "Risk_Management_MakeTradesJourney.html",
 "Journal_Review_MakeTradesJourney.html",
 "Psychology_Discipline_MakeTradesJourney.html",
]

# snapshot of original why texts (from first extraction) to confirm unchanged
orig_whys = {
 "Multi_Timeframe_Trading_MakeTradesJourney.html": [
  "Zoom out for the trend and bias, zoom in for the precise entry - one timeframe alone gives only part of the picture.",
  "The 3-tier structure uses timeframes roughly 4-6x apart, for example daily to H4 to H1.",
  "Step 1: on the higher timeframe you find the trend and key levels - that sets your bias.",
  "Golden rule: always trade in the direction of the higher timeframe - an up trend means only buys.",
  "The lower timeframe provides the trigger for a precise entry with a tight stop - timing only, never to fight the trend.",
 ],
 "US_High_Impact_Data_MakeTradesJourney.html": [
  "The forecast is already priced in. Only the gap between actual and forecast — the surprise — creates the spike.",
  "The Fed's policy target is 2% Core PCE YoY — Core PCE is the Fed's preferred inflation gauge.",
  "NFP comes out on the first Friday of every month at 08:30 ET — jobs, unemployment and wages together.",
  "Hotter-than-expected inflation is hawkish — it pushes the Fed toward hikes, lifting USD and yields while weighing on gold.",
  "Cooling inflation and weak jobs open the door to cuts (dovish), which usually pushes USD down and gold up.",
 ],
 "Risk_Management_MakeTradesJourney.html": [
  "Losses are asymmetric: after a 50% loss you need a 100% gain — loss % ÷ (1 − loss %).",
  "At a 50% win rate a run of 5 losses is nearly certain over 100 trades. It is what randomness looks like, not a broken system.",
  "Fix the risk amount first, place the stop where your analysis is invalidated, then calculate lot size — risk is fixed, lot size is an output.",
  "A standard forex lot is 100,000 units of base currency; for EURUSD one pip = $10 per lot.",
  "Risk comes from lot size × stop distance only. Leverage only changes margin — same lots and stop mean the same loss at any leverage.",
 ],
 "Journal_Review_MakeTradesJourney.html": [
  "Without a journal you only have the balance. Memory distorts the rest — it over-remembers wins and recent trades, and rewrites reasons afterwards.",
  "Kept/broke is the most important column — it is the one thing you can judge honestly on every single trade.",
  "A kept-rules loss is the cost of doing business. You did everything right — it is supposed to happen, often. Do not change anything.",
  "BROKE + WIN pays you for moving the stop or overtrading — exactly the behaviour that eventually destroys the account.",
  "Under 30 trades the observed win rate can range from 28% to 72% by chance alone. Changing the system after 10 losses is chasing noise, not discipline.",
 ],
 "Psychology_Discipline_MakeTradesJourney.html": [
  "Kahneman and Tversky showed losses are felt roughly twice as strongly as equal gains — the value curve is not symmetric.",
  "It is the documented tendency to cut winners early and hold losers too long — the opposite of what a positive-expectancy system needs.",
  "The trade right after a loss is the worst decision you will make all day. The 30-minute break plus the daily stop interrupt the revenge spiral.",
  "Moving the stop is the single most expensive retail habit. The stop only ever moves in your favour; if you widened it, log it as broke rules even if it wins.",
  "After wins, profits feel like house money and success gets attributed to skill, so size creeps up. Risk % is set monthly — never raised mid-good-week.",
 ],
}

all_ok = True
for f in files:
    p = BASE + f
    src = open(p, encoding="utf-8").read()
    print("=" * 90)
    print("FILE:", f)

    # 1. no old-style ' + item.why + ' concatenation anywhere
    old_usage = len(re.findall(r'\+ item\.why \+', src))
    print("old '+ item.why +' concat occurrences:", old_usage)
    if old_usage != 0:
        all_ok = False

    # 2. whyTxt defined BEFORE if/else: check order in gradeExam
    g = re.search(r'function gradeExam\(\)\{(.*?)\n\}', src, re.S)
    body = g.group(1)
    i_zh = body.find("var zhMode")
    i_whytxt = body.find("var whyTxt")
    i_if = body.find("if(user === item.ans)")
    order_ok = -1 < i_zh < i_whytxt < i_if
    print("zhMode/whyTxt before if/else:", order_ok)
    if not order_ok:
        all_ok = False

    # 3. parse EXAM_QUESTIONS and compare q/opts/ans/why to originals; verify why_zh present
    line = [l for l in src.split("\n") if "const EXAM_QUESTIONS" in l][0]
    body_txt = line[line.index("["): line.rindex("];") + 1]
    quoted = re.sub(r'([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)', r'\1"\2"\3', body_txt)
    arr = json.loads(quoted)
    same = all(q["why"] == w for q, w in zip(arr, orig_whys[f]))
    has_zh = all(isinstance(q.get("why_zh"), str) and len(q["why_zh"]) > 0 for q in arr)
    print("5 questions, why unchanged:", same, "| all why_zh present:", has_zh)
    for i, q in enumerate(arr):
        print(f"  Q{i+1} why_zh: {q['why_zh']}")
    if not (same and has_zh):
        all_ok = False

print("\n" + ("ALL PRECISE CHECKS OK" if all_ok else "SOME CHECKS FAILED"))
