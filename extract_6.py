#!/usr/bin/env python3
import re, json

files = {
    "multitf": "Multi_Timeframe_Trading_MakeTradesJourney.html",
    "usdata": "US_High_Impact_Data_MakeTradesJourney.html",
    "risk": "Risk_Management_MakeTradesJourney.html",
    "journal": "Journal_Review_MakeTradesJourney.html",
    "psych": "Psychology_Discipline_MakeTradesJourney.html",
    "trend": "Trendlines_Channels_MakeTradesJourney.html",
}

for short, f in files.items():
    path = "/tmp/mtj/MTJ-Hub/courses/" + f
    content = open(path, encoding="utf-8").read()
    m = re.search(r'const EXAM_QUESTIONS = (\[.*?\]);', content, re.S)
    assert m, f"EXAM_QUESTIONS not found in {f}"
    body = m.group(1)
    quoted = re.sub(r'([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)', r'\1"\2"\3', body)
    arr = json.loads(quoted)
    print("=" * 100)
    print(f"{short}: {f} -> {len(arr)} questions")
    for i, q in enumerate(arr):
        print(f"--- Q{i+1} ---")
        print("q:   ", json.dumps(q["q"], ensure_ascii=False))
        print("opts:", json.dumps(q["opts"], ensure_ascii=False))
