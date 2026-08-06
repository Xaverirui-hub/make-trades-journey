#!/usr/bin/env python3
"""診斷: JSON key vs HTML q 匹配率"""
import json, re, os

MAP = {
  "zh_three": "Three_Types_of_Analysis",
  "zh_sessions": "Trading_Sessions",
  "zh_candle": "Candlestick_Patterns",
  "zh_chart": "Chart_Patterns",
  "zh_ma": "MA_Support_Resistance",
  "zh_fibo": "Fibonacci",
  "zh_multitf": "Multi_Timeframe_Trading",
  "zh_usdata": "US_High_Impact_Data",
  "zh_risk": "Risk_Management",
  "zh_journal": "Journal_Review",
  "zh_psych": "Psychology_Discipline",
  "zh_trend": "Trendlines_Channels",
  "zh_supply": "Supply_Demand",
  "zh_trademgmt": "Trade_Management",
  "zh_backtest": "Backtesting_System_Design",
  "zh_plan": "Trading_Plan_Routine",
  "zh_rsi": "RSI_Indicator",
  "zh_sto": "Stochastic_Indicator",
  "zh_macd": "MACD_Indicator",
}

for key, course in MAP.items():
    path = f"MTJ-Hub/courses/{course}_MakeTradesJourney.html"
    if not os.path.exists(path):
        continue
    html = open(path, encoding='utf-8', errors='ignore').read()
    scripts = re.findall(r'<script>(.*?)</script>', html, re.S)
    html_qs = []
    for s in scripts:
        if 'EXAM_QUESTIONS' in s:
            for m in re.findall(r'\{q:"([^"]*)', s):
                html_qs.append(m)
            break
    d = json.load(open(f"{key}.json", encoding='utf-8'))
    json_keys = list(d.keys())
    # 匹配率
    matched = sum(1 for k in json_keys if k in html_qs)
    print(f"{course}: HTML {len(html_qs)}題 / JSON {len(json_keys)}題 / 匹配 {matched}")
    if matched < len(json_keys):
        for k in json_keys[:3]:
            print(f"   JSON key: {k[:50]} | 在HTML: {k in html_qs}")
        print(f"   HTML q[0]: {html_qs[0][:50] if html_qs else 'NONE'}")
