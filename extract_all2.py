import re, json

files = [
    ("Three_Types_of_Analysis_MakeTradesJourney.html", "three"),
    ("Trading_Sessions_MakeTradesJourney.html", "sessions"),
    ("Candlestick_Patterns_MakeTradesJourney.html", "candle"),
    ("Chart_Patterns_MakeTradesJourney.html", "chart"),
    ("MA_Support_Resistance_MakeTradesJourney.html", "ma"),
    ("Fibonacci_MakeTradesJourney.html", "fibo"),
]

out = {}
for fn, key in files:
    path = "/tmp/mtj/MTJ-Hub/courses/" + fn
    html = open(path, encoding="utf-8", errors="ignore").read()
    scripts = re.findall(r"<script>(.*?)</script>", html, re.S)
    for s in scripts:
        if "EXAM_QUESTIONS" in s:
            m = re.search(r"EXAM_QUESTIONS\s*=\s*(\[.*?\])\s*;\s*\n?function", s, re.S)
            if not m:
                m = re.search(r"EXAM_QUESTIONS\s*=\s*(\[.*?\]);", s, re.S)
            data = json.loads(m.group(1))
            print(f"##### {key} ({fn}) COUNT={len(data)}")
            for i, q in enumerate(data):
                print(f"--- Q{i+1} q={json.dumps(q['q'], ensure_ascii=False)}")
                print(f"    opts={json.dumps(q['opts'], ensure_ascii=False)}")
                print(f"    ans={q.get('ans')}")
            break
