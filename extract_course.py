#!/usr/bin/env python3
"""Extract readable text content from a course HTML for question design."""
import re, sys, html as h

path = sys.argv[1]
data = open(path, encoding="utf-8", errors="ignore").read()

# Cut out the head/style/scripts to reduce noise
body = data.split("</head>", 1)[-1]
body = re.sub(r"<script.*?</script>", " ", body, flags=re.S)
body = re.sub(r"<style.*?</style>", " ", body, flags=re.S)
# Cut everything from CLOSING onward
body = body.split("<!-- ================= CLOSING", 1)[0]

# Split into sections by tier markers
sections = re.split(r'(?=<div class="group-head[^>]*>\s*<span class="tier">)', body)
for sec in sections:
    m = re.search(r'<span class="tier">([^<]*)</span>', sec)
    if not m:
        continue
    tier = m.group(1).strip()
    t = re.search(r'<h2 class="title">([^<]*)<', sec)
    title = t.group(1).strip() if t else "?"
    # strip tags, decode entities, collapse whitespace
    txt = re.sub(r"<[^>]+>", " ", sec)
    txt = h.unescape(txt)
    txt = re.sub(r"\s+", " ", txt).strip()
    print(f"\n===== {tier} | {title} =====")
    print(txt[:2600])
