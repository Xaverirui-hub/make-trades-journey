# -*- coding: utf-8 -*-
import re, json, os

# translations keyed by course -> question index -> [zh_q, [zh_opts...]]
T = {
 "three": {
  0: ["技术分析研究什么？", ["价格图表本身", "中央银行政策", "交易者情绪", "经济增长"]],
  1: ["哪个基本面因素可能使货币走强？", ["一根绿色K线", "强劲的经济和上升的利率", "社交媒体上的高热度", "斐波那契回撤"]],
  2: ["情绪分析主要关注什么？", ["精确的价格水平", "公司盈利", "交易者的感受以及大众的持仓方向", "图表形态"]],
  3: ["哪个工具属于情绪分析？", ["移动平均线", "GDP报告", "支撑与阻力", "恐惧与贪婪指数"]],
  4: ["三种分析常用的组合方式是？", ["在不同交易中一次只使用一种", "只使用基本面分析", "技术面找入场点，基本面定方向，情绪面择时机", "只使用技术分析"]],
 },
 "sessions": {
  0: ["外汇市场流动性与波动最高的时段是?", ["亚盘开盘", "伦敦与纽约重叠时段(13:00–17:00 UTC)", "周五收盘前", "东京午休"]],
  1: ["亚盘(东京)的主要特征是?", ["波动最大，趋势最明显", "最安静，流动性薄，常区间震荡，并奠定当天的初始区间", "成交量最大，点差最窄", "主要由美国数据主导"]],
  2: ["欧盘(伦敦)的主要特征是?", ["成交量最大，开盘常出现强烈方向性行情并突破亚盘区间", "流动性最差，点差最宽", "最适合做区间交易", "黄金波动最小"]],
  3: ["黄金(XAU/USD)什么时候最活跃?", ["亚盘时段", "欧盘开盘与伦敦–纽约重叠时段(21:00–01:00 北京时间)", "周一凌晨", "美盘收盘之后"]],
  4: ["为什么做黄金必须尊重数据公布(NFP、CPI、FOMC)?", ["数据公布时点差会自动变小", "非农、CPI 与美联储决议可能在几秒内让黄金波动数十美元", "数据只影响股票，不影响外汇", "数据行情更适合重仓进场"]],
 },
 "candle": {
  0: ["蜡烛实体表示什么？", ["开盘到收盘的区间", "当日的最高价和最低价", "总成交量", "仅收盘价"]],
  1: ["几乎无实体的十字星代表什么？", ["强烈的买盘压力", "多空双方力量均衡、犹豫不决", "必定反转", "巨大成交量"]],
  2: ["下跌末端哪个是看涨反转信号？", ["吊颈线", "射击之星", "三只乌鸦", "锤子线"]],
  3: ["看涨吞没中谁吞谁？", ["一根小的阳线吞没一根大的阴线", "一根大的阴线吞没一根小的阳线", "一根大的阳线完全吞没前一根小的阴线", "两根大小相同的K线相互重叠"]],
  4: ["无影线的光头光脚线说明什么？", ["多空双方犹豫不决", "强劲的单边动能", "必定反转", "极低的成交量"]],
 },
 "chart": {
  0: ["什么是双顶？", ["两次在相同高点失败，随后跌破颈线", "两个相同的低点后迎来上涨", "三个峰顶且中间峰最高", "强劲上涨后的小幅回调"]],
  1: ["头肩顶何时确认反转？", ["当价格触及头部时", "当价格跌破连接两个谷底的颈线时", "当右肩形成时", "当成交量翻倍时"]],
  2: ["对称三角形通常向哪个方向突破？", ["原有趋势的方向", "总是逆着原有趋势", "横盘整理，方向不明", "只在最末端突破"]],
  3: ["牛旗中旗面指什么？", ["初期陡峭的上涨", "旗杆之后小幅逆势回调", "量度目标位", "颈线"]],
  4: ["双底的量度目标怎么算？", ["从颈线向上投射形态的高度", "将形态的宽度翻倍", "加上旗杆的高度", "将整个区间减半"]],
 },
 "ma": {
  0: ["SMA 与 EMA 的主要区别？", ["SMA 对每根K线一视同仁；EMA 更侧重近期价格，反应更快", "EMA 总是比 SMA 慢", "SMA 只使用最高价", "EMA 忽略收盘价"]],
  1: ["金叉发生在？", ["快线上穿慢线", "慢线上穿快线", "价格触及200均线", "50均线走平"]],
  2: ["上涨中上升的均线扮演什么角色？", ["动态阻力", "动态支撑", "成交量指标", "确定的卖出信号"]],
  3: ["支撑跌破后回踩时，旧支撑通常变成？", ["阻力（角色互换）", "更强的支撑", "双底", "跳空缺口"]],
  4: ["支撑阻力应如何对待？", ["精确到每个点的价格", "视为区域而非线条", "视为永久有效的水平位", "只在日线图上有效"]],
 },
 "fibo": {
  0: ["斐波那契数列中，每个数除以后一个数约等于？", ["0.382", "0.5", "0.618", "0.786"]],
  1: ["交易者最关注哪个回撤位？", ["23.6%", "61.8%", "78.6%", "100%"]],
  2: ["上涨趋势画回撤时，工具怎么拉？", ["从摆动高点拉到摆动低点", "从当前价格拉到200均线", "从61.8%位置拉到0%位置", "从摆动低点拉到摆动高点"]],
  3: ["黄金口袋是哪个区间？", ["0.236 和 0.382 之间", "0.382 和 0.5 之间", "1.272 和 1.618 之间", "0.618 到约 0.65 之间"]],
  4: ["斐波那契扩展位主要用来？", ["设置止损", "设定止盈目标", "寻找入场点", "测量成交量"]],
 },
}

FILES = [
 ("Three_Types_of_Analysis_MakeTradesJourney.html", "three", "zh_three.json"),
 ("Trading_Sessions_MakeTradesJourney.html", "sessions", "zh_sessions.json"),
 ("Candlestick_Patterns_MakeTradesJourney.html", "candle", "zh_candle.json"),
 ("Chart_Patterns_MakeTradesJourney.html", "chart", "zh_chart.json"),
 ("MA_Support_Resistance_MakeTradesJourney.html", "ma", "zh_ma.json"),
 ("Fibonacci_MakeTradesJourney.html", "fibo", "zh_fibo.json"),
]

os.makedirs("/tmp/mtj", exist_ok=True)

for fn, key, outname in FILES:
    path = "/tmp/mtj/MTJ-Hub/courses/" + fn
    html = open(path, encoding="utf-8", errors="ignore").read()
    scripts = re.findall(r"<script>(.*?)</script>", html, re.S)
    data = None
    for s in scripts:
        if "EXAM_QUESTIONS" in s:
            m = re.search(r"EXAM_QUESTIONS\s*=\s*(\[.*?\])\s*;\s*\n?function", s, re.S)
            if not m:
                m = re.search(r"EXAM_QUESTIONS\s*=\s*(\[.*?\]);", s, re.S)
            data = json.loads(m.group(1))
            break
    assert data is not None, f"EXAM_QUESTIONS not found in {fn}"
    assert len(data) == 5, f"{fn} has {len(data)} questions, expected 5"

    out = {}
    for i, q in enumerate(data):
        exact_q = q["q"]
        zh_q, zh_opts = T[key][i]
        assert len(zh_opts) == len(q["opts"]), f"{fn} Q{i+1} option count mismatch"
        out[exact_q] = [zh_q, zh_opts]

    outpath = f"/tmp/mtj/{outname}"
    with open(outpath, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"WROTE {outpath}  questions={len(out)}")
