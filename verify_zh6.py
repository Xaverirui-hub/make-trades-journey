#!/usr/bin/env python3
import re, json

files = {
    "zh_multitf.json": "Multi_Timeframe_Trading_MakeTradesJourney.html",
    "zh_usdata.json": "US_High_Impact_Data_MakeTradesJourney.html",
    "zh_risk.json": "Risk_Management_MakeTradesJourney.html",
    "zh_journal.json": "Journal_Review_MakeTradesJourney.html",
    "zh_psych.json": "Psychology_Discipline_MakeTradesJourney.html",
    "zh_trend.json": "Trendlines_Channels_MakeTradesJourney.html",
}

all_ok = True
for zf, htmlf in files.items():
    content = open("/tmp/mtj/MTJ-Hub/courses/" + htmlf, encoding="utf-8").read()
    m = re.search(r'const EXAM_QUESTIONS = (\[.*?\]);', content, re.S)
    body = m.group(1)
    quoted = re.sub(r'([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)', r'\1"\2"\3', body)
    arr = json.loads(quoted)

    trans = json.load(open("/tmp/mtj/" + zf, encoding="utf-8"))
    n_html = len(arr)
    n_zh = len(trans)
    ok = True
    for q in arr:
        key = q["q"]
        if key not in trans:
            print(f"  MISSING KEY in {zf}: {key[:60]!r}")
            ok = False
            continue
        val = trans[key]
        if len(val) != 2 or not isinstance(val[1], list) or len(val[1]) != len(q["opts"]):
            print(f"  BAD VALUE in {zf}: {key[:60]!r} opts_zh={len(val[1])} vs opts={len(q['opts'])}")
            ok = False
        if not val[0].strip():
            print(f"  EMPTY 中文題目 in {zf}: {key[:40]!r}")
            ok = False
    # extra keys check
    html_keys = {q["q"] for q in arr}
    for k in trans:
        if k not in html_keys:
            print(f"  EXTRA KEY in {zf}: {k[:60]!r}")
            ok = False
    status = "OK " if ok else "FAIL"
    if not ok:
        all_ok = False
    print(f"[{status}] {zf}: {n_zh} 題目 (HTML 有 {n_html} 題), 全 key 精確匹配: {ok}")

print("ALL OK" if all_ok else "HAS ERRORS")
