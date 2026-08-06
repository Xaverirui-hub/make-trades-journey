#!/usr/bin/env python3
import re, json, sys

files = [
 "Multi_Timeframe_Trading_MakeTradesJourney.html",
 "US_High_Impact_Data_MakeTradesJourney.html",
 "Risk_Management_MakeTradesJourney.html",
 "Journal_Review_MakeTradesJourney.html",
 "Psychology_Discipline_MakeTradesJourney.html",
]

for f in files:
    path = "/tmp/mtj/MTJ-Hub/courses/" + f
    with open(path, encoding="utf-8") as fh:
        content = fh.read()
    lines = content.split("\n")
    idx = [i for i,l in enumerate(lines) if "const EXAM_QUESTIONS" in l]
    print("="*100)
    print(f"FILE: {f}  (EXAM_QUESTIONS at line {idx[0]+1 if idx else 'NOT FOUND'})")
    if not idx:
        continue
    line = lines[idx[0]]
    # count object-end markers
    print("count of '\"}' markers:", line.count('"}'))
    # parse objects via JS-style: quote keys then json
    body = line[line.index("["): line.rindex("];")+1]
    quoted = re.sub(r'([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)', r'\1"\2"\3', body)
    try:
        arr = json.loads(quoted)
    except Exception as e:
        print("PARSE ERROR:", e)
        continue
    print("num questions:", len(arr))
    for i, q in enumerate(arr):
        print(f"--- Q{i+1} ---")
        print("q:  ", q["q"])
        print("why:", q["why"])
