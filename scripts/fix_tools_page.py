#!/usr/bin/env python3
"""tools.html 卡片級中英分明（工具本身不動）"""
import re

f = "/tmp/mtj/MTJ-Hub/tools.html"
html = open(f, encoding="utf-8").read()
orig = html

# 1) tag 混雜 → 拆 span
html = html.replace('>Review Tool · 复盘工具</span>',
                    '><span class="en">Review Tool</span><span class="zh">复盘工具</span></span>')
html = html.replace('>Macro Tool &middot; 宏观工具</span>',
                    '><span class="en">Macro Tool</span><span class="zh">宏观工具</span></span>')
html = html.replace('>Risk Tool · 风控工具</span>',
                    '><span class="en">Risk Tool</span><span class="zh">风控工具</span></span>')
html = html.replace('>Strategy Lab &middot; 策略实验室</span>',
                    '><span class="en">Strategy Lab</span><span class="zh">策略实验室</span></span>')

# 2) h3 英文標題 → 包 .en（中文 zh-t 已存在）
for h3 in ['Trade Journal', 'FOMC Analyzer', 'Position Size Calculator', 'XRs Strategy Composer']:
    html = html.replace(f'<h3>{h3}</h3>', f'<h3><span class="en">{h3}</span></h3>')

# 3) tool-feats 標籤混雜 → 拆
feats = [
    ('Import 汇入', 'Import', '汇入'),
    ('Stats 统计', 'Stats', '统计'),
    ('Quadrants 四象限', 'Quadrants', '四象限'),
    ('Private 隐私', 'Private', '隐私'),
    ('Vote 投票结构', 'Vote', '投票结构'),
    ('Market 市场反应', 'Market', '市场反应'),
    ('Archive 决议存档', 'Archive', '决议存档'),
    ('Handoff 连动', 'Handoff', '连动'),
    ('Symbols 品种', 'Symbols', '品种'),
    ('Risk 风险', 'Risk', '风险'),
    ('Margin 保证金', 'Margin', '保证金'),
    ('Rules 风控', 'Rules', '风控'),
    ('Blocks 积木', 'Blocks', '积木'),
    ('Scoring 评分', 'Scoring', '评分'),
    ('Equity 曲线', 'Equity', '曲线'),
    ('Real Data 实盘数据', 'Real Data', '实盘数据'),
]
for old, en, zh in feats:
    html = html.replace(f'<b>{old}</b>', f'<b><span class="en">{en}</span><span class="zh">{zh}</span></b>')

# 4) CTA 按鈕 → 拆
html = html.replace('>Open the Journal <span class="ar">→</span></a>',
                    '><span class="en">Open the Journal</span><span class="zh">打开日志</span> <span class="ar">→</span></a>')
html = html.replace('>Open the Analyzer <span class="ar">&rarr;</span></a>',
                    '><span class="en">Open the Analyzer</span><span class="zh">打开分析器</span> <span class="ar">→</span></a>')

# 5) acc-open 混雜 → 拆
html = html.replace('>OPEN FOR NOW &middot; 暂时开放</span>',
                    '><span class="en">OPEN FOR NOW</span><span class="zh">暂时开放</span></span>')

# 6) MEMBERS ONLY 按鈕 → 拆（.zh 已有「会员专属」在旁，按鈕文字改純 en）
html = html.replace('>MEMBERS ONLY <span class="ar">&#183;</span></span>',
                    '><span class="en">MEMBERS ONLY</span><span class="zh">会员专属</span> <span class="ar">·</span></span>')

# 7) sellpoint 標題「// WHY IT'S SPECIAL 独特之处」→ 拆
html = html.replace('<h4>// Why It\'s Special 独特之处</h4>',
                    '<h4><span class="en">// Why It\'s Special</span><span class="zh">独特之处</span></h4>')

# 8) 主標題「Where theory meets a testbench. 理论走进测试台的地方。」已是 .zh 結構，檢查
# note 標籤「// The lab is part of the membership...」雙語已在

open(f, "w", encoding="utf-8").write(html)
print("patched" if html != orig else "NO CHANGE")
