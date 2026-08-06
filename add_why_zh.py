#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Add why_zh (Simplified Chinese) to each EXAM_QUESTION in the 6 course files.
Keeps q/opts/ans/why text untouched; only appends "why_zh" per question.
"""
import json

base = "/tmp/mtj/MTJ-Hub/courses/"

TRANS = {
"Three_Types_of_Analysis_MakeTradesJourney.html": [
 "技术分析直接读取价格图表——所有重要信息都假定已反映在价格中。",
 "强劲经济与加息等现实力量会改变货币的供需——这就是基本面分析。",
 "情绪分析解读恐惧与贪婪——当几乎所有人都站在同一侧时，市场往往已酝酿反转。",
 "恐惧与贪婪指数、持仓数据以及社交媒体热度都属于情绪分析工具。",
 "许多交易者以一种分析为主导、用其他分析来确认：技术面找入场点，基本面定方向，情绪面择反转时机。",
],
"Trading_Sessions_MakeTradesJourney.html": [
 "流动性与波动率在伦敦与纽约重叠时段（13:00–17:00 UTC / 北京时间 21:00–01:00）达到峰值——这是交易主要货币对和黄金的最佳窗口。",
 "亚盘是最安静的时段——流动性薄、波动小、多以区间震荡为主。它常常奠定当日初始区间，随后由伦敦突破；亚盘活跃的是日元、澳元、纽元等货币对。",
 "伦敦是成交量最大的时段——流动性激增、点差收窄，开盘时常出现突破亚盘区间的强烈方向性行情。真正的趋势从这里开始。",
 "黄金在亚盘平静，伦敦开盘时苏醒，在伦敦–纽约重叠时段（北京时间 21:00–01:00）达到高潮——干净可交易的黄金行情就在这里。",
 "非农、CPI 和美联储决议可能在几秒内让黄金波动数十美元。务必尊重数据发布——围绕它们做计划，或保持空仓。",
],
"Candlestick_Patterns_MakeTradesJourney.html": [
 "实体涵盖开盘到收盘的区间。影线（上下影）显示该周期的最高价与最低价。",
 "开盘价与收盘价几乎落在同一价位——完全均衡。把它视为犹豫不决，等待确认信号。",
 "锤子线——小实体在上方、带长下影线——出现在下跌趋势之后，暗示买方已开始反击。",
 "看涨吞没 = 一根大阳线实体完全吞没前一根小阴线实体，暗示趋势可能转涨。",
 "没有影线意味着价格从未回撤——完全单边的力量，方向与蜡烛一致。",
],
"Chart_Patterns_MakeTradesJourney.html": [
 "M 形两次在阻力位失败，随后跌破颈线——这是看跌反转形态。",
 "跌破颈线才是确认信号；头肩形态本身只是形态结构（前奏）。",
 "它是持续形态——价格通常会延续三角形形成之前的原有趋势继续运行。",
 "旗杆是凌厉的拉升；旗面是突破继续向上之前、逆势的小幅回调整理。",
 "目标位 = 从颈线向上投射形态高度——标准的量度移动目标。",
],
"MA_Support_Resistance_MakeTradesJourney.html": [
 "SMA 对所有蜡烛一视同仁，EMA 则更看重近期价格——因此 EMA 转向更快、更贴近价格。",
 "金叉 = 快线上穿慢线——看涨动能转变。死叉则相反。",
 "价格不断回踩上升的均线并反弹——每一次回踩都是潜在的多头入场点。",
 "角色互换——一旦跌破，支撑就变成阻力。回踩测试就是干净的入场区域。",
 "价格很少精确到某个价位——把支撑阻力当作区域而非线条，观察价格在区域内的表现。",
],
"Fibonacci_MakeTradesJourney.html": [
 "在 1,1,2,3,5,8,13… 数列中，每个数除以后一个数都约等于 0.618——即黄金比例。",
 "61.8%（连同 50%）是标准回撤位中最受关注的。",
 "上涨趋势中，从摆动低点拖到摆动高点——100% 在低点，0% 在高点。",
 "黄金口袋是 0.618 到约 0.65 的区间——趋势回撤最常在此反转。",
 "扩展位投射价格从黄金口袋反弹后可能到达的位置——常用作止盈目标。",
],
}

for fn, zh_list in TRANS.items():
    path = base + fn
    with open(path, encoding="utf-8") as fh:
        lines = fh.readlines()
    idx = None
    for i, ln in enumerate(lines):
        if ln.lstrip().startswith("const EXAM_QUESTIONS"):
            idx = i
            break
    assert idx is not None, fn
    ln = lines[idx]
    start = ln.index("[")
    end = ln.rindex("]")
    arr = json.loads(ln[start:end+1])
    assert len(arr) == len(zh_list), f"{fn}: count mismatch {len(arr)} vs {len(zh_list)}"
    for it, zh in zip(arr, zh_list):
        it["why_zh"] = zh
    new_ln = "const EXAM_QUESTIONS = " + json.dumps(arr, ensure_ascii=False) + ";\n"
    # sanity: original q/opts/ans/why preserved
    old_arr = json.loads(ln[start:end+1])
    for o, n in zip(old_arr, arr):
        for k in ("q", "opts", "ans", "why"):
            assert o[k] == n[k], f"{fn}: field {k} changed!"
    lines[idx] = new_ln
    with open(path, "w", encoding="utf-8") as fh:
        fh.writelines(lines)
    print(f"{fn}: added {len(zh_list)} why_zh -> {len(arr)} questions")

print("DONE")
