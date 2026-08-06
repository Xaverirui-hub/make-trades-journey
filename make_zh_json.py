#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""MTJ 7 課程 EXAM_QUESTIONS 中文翻譯 JSON 生成器。
key = HTML 中 q 的逐字符原文(程式直接從 HTML 讀取, 保證完全一致)。
RSI/Stochastic/MACD: 英文 q → 中文翻譯 (index 對照表)
Supply/TradeMgmt/Backtest/Plan: q 原本即中文, 值為自身 (identity, 已本地化)
"""
import re, json

BASE = "/tmp/mtj/MTJ-Hub/courses/"

JOBS = [
    # (html 檔名, 輸出 json, 翻譯表 {index: [q_zh, [opts_zh...]]} 或 None=identity)
    ("Supply_Demand_MakeTradesJourney.html", "/tmp/mtj/zh_supply.json", None),
    ("Trade_Management_MakeTradesJourney.html", "/tmp/mtj/zh_trademgmt.json", None),
    ("Backtesting_System_Design_MakeTradesJourney.html", "/tmp/mtj/zh_backtest.json", None),
    ("Trading_Plan_Routine_MakeTradesJourney.html", "/tmp/mtj/zh_plan.json", None),
    ("RSI_Indicator_MakeTradesJourney.html", "/tmp/mtj/zh_rsi.json", {
        0: ["RSI 代表相对强弱指标（Relative Strength Index）。它实际上衡量的是什么？",
            ["市场的趋势方向",
             "近期价格波动的速度与幅度，压缩到 0–100 区间",
             "流入该资产的成交量",
             "到下一个支撑位的距离"]],
        1: ["在强劲的上升趋势中，RSI 位于 75 且没有背离。最佳做法是……",
            ["立即做空，因为已经超买",
             "等待回调后买入——超买在趋势中是正常现象",
             "平掉所有仓位并观望",
             "市价追涨买入"]],
        2: ["价格创出更高的高点，但 RSI 却创出更低的高点。这是……",
            ["看涨（底部）背离——买入",
             "正常的趋势延续",
             "看跌（顶部）背离——动能未得到确认",
             "RSI 失灵的信号"]],
        3: ["RSI 自下而上穿越 50 中轴线表明……",
            ["市场即将崩盘",
             "多头已经掌控了最近 14 个周期",
             "你应该加倍仓位",
             "该指标已超买"]],
        4: ["在震荡区间内，哪种组合是最强的基于 RSI 的入场信号？",
            ["RSI 位于 45，且没有其他背景信息",
             "价格触及阻力位 + 看跌背离 + 拒绝K线",
             "RSI 在 M1 周期穿越 50",
             "在强劲下跌趋势中 RSI 位于 30"]],
    }),
    ("Stochastic_Indicator_MakeTradesJourney.html", "/tmp/mtj/zh_sto.json", {
        0: ["随机震荡指标（Stochastic Oscillator）衡量的是什么？",
            ["N 个周期内平均涨幅与平均跌幅之比",
             "收盘价在近期最高价与最低价区间内的位置",
             "成交量加权的价格动能",
             "与 200 周期移动平均线的距离"]],
        1: ["MT5 的随机震荡指标默认参数是什么？",
            ["14, 3, 3", "5, 3, 3", "9, 1, 3", "20, 5, 5"]],
        2: ["金叉（%K 上穿 %D）在什么时候发生最可靠？",
            ["在 80 以上",
             "在 20 以下",
             "正好在 50",
             "任何位置——位置无关紧要"]],
        3: ["看跌背离意味着……",
            ["价格创出更高的高点，但 %K 创出更低的高点",
             "%K 在 20 以下下穿 %D",
             "%K 和 %D 都保持在 80 以上",
             "价格创出更低的低点，而 %K 创出更高的低点"]],
        4: ["随机震荡指标最常见的误用是……",
            ["在震荡行情中使用它",
             "在强劲趋势中把它当作独立系统使用——指标会在 80+/20− 区域贴边钝化，并发出过早的逆势信号",
             "把 %K 周期设置为 5 以下",
             "将它和 RSI 结合使用"]],
    }),
    ("MACD_Indicator_MakeTradesJourney.html", "/tmp/mtj/zh_macd.json", {
        0: ["MT5 的 MACD (12, 26, 9) 实际上绘制的是什么？",
            ["叠加在价格图表上的两条移动平均线",
             "一个独立窗口，包含一条 MACD 线、一条信号线和红/绿柱状图",
             "一条能预测未来价格的单线",
             "堆叠在一个面板中的三个震荡指标"]],
        1: ["MT5 的 MACD 柱状图数值等于……",
            ["EMA(26) − EMA(12)",
             "MACD 线 − 信号线",
             "收盘价 − EMA(12)",
             "信号线 − 收盘价"]],
        2: ["金叉发生在……",
            ["价格创出新高",
             "MACD 线向上穿越信号线",
             "柱状图变绿",
             "MACD 线向上穿越零轴"]],
        3: ["当你持有多单时，柱状图收缩并趋向零轴。这意味着什么？",
            ["行情正在加速——加仓",
             "动能正在衰减——开始管理这笔交易",
             "没什么；只有交叉才有意义",
             "立即反转仓位"]],
        4: ["在震荡行情中，大多数 MACD 交叉是……",
            ["可靠的反转信号",
             "虚假信号——震荡本身产生的噪音",
             "比趋势行情中更强",
             "只有在零轴以上才有效"]],
    }),
]

def extract_questions(html):
    m = re.search(r'const EXAM_QUESTIONS = (\[.*?\]);', html, re.S)
    assert m, "EXAM_QUESTIONS not found"
    return json.loads(m.group(1))

summary = []
for fname, out_path, table in JOBS:
    html = open(BASE + fname, encoding='utf-8', errors='ignore').read()
    arr = extract_questions(html)
    assert len(arr) == 5, f"{fname}: 題數 {len(arr)} != 5"
    result = {}
    for i, item in enumerate(arr):
        q = item['q']                      # 直接取自 HTML, 逐字符一致
        opts = item['opts']
        assert len(opts) == 4
        if table is None:
            # 課程原本即中文: identity(已本地化)
            q_zh, opts_zh = q, opts
        else:
            q_zh, opts_zh = table[i]
            assert len(opts_zh) == 4, f"{fname} Q{i} opts 數量錯誤"
        result[q] = [q_zh, opts_zh]
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    # 驗證: 每個 key 都必須出現在 HTML 的 EXAM_QUESTIONS 中
    for k in result:
        assert ('"q": "' + k + '"') in html, f"key 不在 HTML: {k[:40]}"
    summary.append((out_path, len(result), "已中文(identity)" if table is None else "英→中翻譯"))

print("=== 完成 ===")
for p, n, note in summary:
    print(f"{p}  {n} 題  [{note}]")
