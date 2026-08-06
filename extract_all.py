import re, json, sys

files = {
    "Three_Types_of_Analysis_MakeTradesJourney.html": "three",
    "Trading_Sessions_MakeTradesJourney.html": "sessions",
    "Candlestick_Patterns_MakeTradesJourney.html": "candle",
    "Chart_Patterns_MakeTradesJourney.html": "chart",
    "MA_Support_Resistance_MakeTradesJourney.html": "ma",
    "Fibonacci_MakeTradesJourney.html": "fibo",
}

for fn, key in files.items():
    path = "/tmp/mtj/MTJ-Hub/courses/" + fn
    html = open(path, encoding="utf-8", errors="ignore").read()
    scripts = re.findall(r"<script>(.*?)</script>", html, re.S)
    found = False
    for s in scripts:
        if "EXAM_QUESTIONS" in s:
            m = re.search(r"EXAM_QUESTIONS\s*=\s*(\[.*?\])\s*;?", s, re.S)
            if m:
                data = json.loads(m.group(1))
                print(f"### {key} ({fn}): COUNT={len(data)}")
                for q in data:
                    print("Q:", repr(q.get("q")))
                    opts = q.get("options") or q.get("choices") or []
                    print("  opts:", repr(opts))
                    a = q.get("a") or q.get("answer") or q.get("correct")
                    print("  ans:", repr(a))
                found = True
                break
            else:
                i = s.find("EXAM_QUESTIONS")
                print(f"### {key}: no array match, snippet:")
                print(s[i:i+2000])
                found = True
    if not found:
        print(f"### {key}: EXAM_QUESTIONS NOT FOUND in any script block")
