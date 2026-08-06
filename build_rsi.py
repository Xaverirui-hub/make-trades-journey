#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Transform Risk_Management template -> RSI_Indicator Module 18 course."""
import re, sys

SRC = '/tmp/mtj/MTJ-Hub/courses/Risk_Management_MakeTradesJourney.html'
DST = '/tmp/mtj/MTJ-Hub/courses/RSI_Indicator_MakeTradesJourney.html'

html = open(SRC, encoding='utf-8').read()
orig = html

# ---------------------------------------------------------------- title
html = html.replace(
    '<title>Risk Management &amp; Position Sizing &#183; Make Trades Journey</title>',
    '<title>RSI Indicator &#183; Make Trades Journey</title>')

# ---------------------------------------------------------------- topbar live
html = html.replace(
    '<div class="live"><span class="dot"></span>Risk&nbsp;Course · Live</div>',
    '<div class="live"><span class="dot"></span>RSI&nbsp;Course · Live</div>')

# ---------------------------------------------------------------- secnav
NAV = '''<nav class="secnav">
  <a href="#agenda-sec"><span class="lbl">Overview · 总览</span><span class="pt"></span></a>
  <a href="#rsi-what"><span class="lbl">What is RSI · 什么是RSI</span><span class="pt"></span></a>
  <a href="#rsi-levels"><span class="lbl">70 / 30 · 超买超卖</span><span class="pt"></span></a>
  <a href="#rsi-divergence"><span class="lbl">Divergence · 背离</span><span class="pt"></span></a>
  <a href="#rsi-trend"><span class="lbl">Trend · 趋势</span><span class="pt"></span></a>
  <a href="#rsi-price-action"><span class="lbl">Price Action · 价格行为</span><span class="pt"></span></a>
  <a href="#practice"><span class="lbl">Practice · 实战</span><span class="pt"></span></a>
</nav>'''
pre, sep, post = html.partition('<nav class="secnav">')
assert sep, 'nav marker missing'
html = pre + NAV + post.split('</nav>', 1)[1]

# ---------------------------------------------------------------- hero
html = html.replace(
    '<div class="course-tag">Trading Course · Required</div>',
    '<div class="course-tag">Module 18 · RSI Indicator</div>')
html = html.replace(
    '<h1>Risk &amp;<br>Position Sizing</h1>',
    '<h1>RSI<br>Indicator</h1>')
html = html.replace(
    '<div class="h-zh">风 控 · 仓 位 计 算</div>',
    '<div class="h-zh">相 对 强 弱 指 标</div>')
html = html.replace(
    '<p class="h-sub">Entries make the story. Position size decides whether you\'re still here to tell it.\n    <span class="zh">进场决定故事精不精彩，仓位决定你还在不在场上说这个故事。</span></p>',
    '<p class="h-sub">Momentum, compressed into one line from 0 to 100. The levels are warnings; the trend is the context.\n    <span class="zh">把动能压缩成 0–100 的一条线。阈值是警报，趋势才是背景。</span></p>')

# ---------------------------------------------------------------- agenda + note
AGENDA = '''<!-- ================= AGENDA ================= -->
<section class="section" id="agenda-sec">
  <div class="eyebrow reveal">Content · 目录</div>
  <h2 class="title reveal">What we'll cover<span class="zh">本课涵盖内容</span></h2>
  <div class="agenda">
    <div class="card reveal"><div class="n">01</div><h3>What Is RSI</h3><div class="zh">定义 · 14 期 · 0–100</div></div>
    <div class="card reveal"><div class="n">02</div><h3>70 Overbought · 30 Oversold</h3><div class="zh">超买超卖 · 黄金与主流外汇</div></div>
    <div class="card reveal"><div class="n">03</div><h3>MT5 &amp; Divergence</h3><div class="zh">MT5 显示 · 顶背离与底背离</div></div>
    <div class="card reveal"><div class="n">04</div><h3>RSI Inside a Trend</h3><div class="zh">强趋势可以一直超买 · 50 中线</div></div>
    <div class="card reveal"><div class="n">05</div><h3>Price Action + RSI</h3><div class="zh">支撑阻力共振 · 确认过滤器</div></div>
    <div class="card reveal"><div class="n">06</div><h3>Common Misuses</h3><div class="zh">五个烧钱的错误用法</div></div>
  </div>
</section>

<section class="section reveal" style="padding-top:20px;padding-bottom:20px;">
  <div class="note" style="max-width:820px;line-height:1.9;">// Why this indicator deserves its own module 为什么这个指标值得单独一课：
    RSI is the most-installed oscillator in MetaTrader and the most misused. Most traders treat 70 and 30 as
    automatic signals; the entire skill is knowing <b>which regime</b> you are in before you read them.
    <span class="zh">RSI 是 MT 里安装最多、也被滥用最多的震荡指标。多数人把 70 和 30 当成自动信号；真正的本事，是在读数之前先判断<b>当前处于哪种市场状态</b>。</span></div>
</section>

'''

# ---------------------------------------------------------------- main content
CONTENT = '''<!-- ================= PART 01 · WHAT IS RSI ================= -->
<section class="divider">
  <div class="rail reveal">Part 01 · 第一部分</div>
  <h2 class="reveal">What Is RSI</h2>
  <div class="zh reveal">RSI 是 什 么</div>
</section>

<section class="section" id="rsi-what">
  <div class="group-head reveal"><span class="tier">01</span>
    <div><div class="eyebrow">Definition · 定义</div><h2 class="title">One Line, 0 to 100</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">RSI.01</span><h3>Relative Strength Index<span class="zh">相对强弱指标</span></h3><span class="tag neu">Foundation 基础</span></div>
    <div class="pattern-desc">
      <p>RSI is a momentum oscillator invented by J. Welles Wilder in 1978. It measures the <b>speed and size of recent price moves</b> — not direction, not volume — and compresses the result into a single line that always stays between <b>0 and 100</b>.
        <span class="zh">RSI（相对强弱指标）由 J. Welles Wilder 于 1978 年发明。它衡量<b>近期价格波动的速度与幅度</b>——不是方向，也不是成交量——并把结果压缩成一条永远介于 <b>0 到 100</b> 之间的线。</span></p>
      <p>The default setting is <b>14 periods</b> — on H1 that means the last 14 hourly candles. The number 14 is a convention, not a law; it has survived because it filters noise without lagging too much. Most traders never change it, and you should not either until you have a reason.
        <span class="zh">默认参数是 <b>14 期</b>——在 H1 图上就是最近 14 根小时 K 线。14 只是惯例，不是铁律；它能过滤噪音又不过度滞后，所以沿用至今。多数交易者从不改它，在没有充分理由之前，你也别改。</span></p>
      <ul class="points">
        <li><b>Range</b> — always 0–100, never beyond.<span class="zh">取值范围永远是 0–100，不会越界。</span></li>
        <li><b>Momentum</b> — it answers "how strong is the move right now", not "which way is the trend".<span class="zh">它回答「现在这波走得有多强」，不回答「趋势往哪边走」。</span></li>
        <li><b>Lagging</b> — like every indicator built on past candles, it confirms what already happened.<span class="zh">和所有基于历史 K 线的指标一样，它确认的是已经发生的事。</span></li>
      </ul>
      <div class="note">// RSI is a speedometer, not a map. It tells you how fast the car is going — never where the road turns.
        RSI 是车速表，不是地图。它告诉你车开得多快——绝不告诉你路在哪里转弯。</div>
    </div>
  </article>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">RSI.02</span><h3>The Formula, In Plain Words<span class="zh">公式的直觉：平均涨 vs 平均跌</span></h3><span class="tag neu">Intuition 直觉</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="rsiFormula"></div>
      <figcaption>Average gain vs. average loss over the last 14 periods<span class="zh">过去 14 期的平均涨幅 vs 平均跌幅</span></figcaption></figure>
    <div class="pattern-desc">
      <p>RSI = 100 − 100 ÷ (1 + RS), where RS = <b>average gain ÷ average loss</b> over 14 periods. Don't memorise the algebra — feel it: when gains are bigger and more frequent than losses, RS is large and RSI climbs toward 100. When losses dominate, RSI sinks toward 0.
        <span class="zh">RSI = 100 − 100 ÷ (1 + RS)，其中 RS = <b>平均涨幅 ÷ 平均跌幅</b>（14 期内）。不用背公式，感受它：当涨幅比跌幅更大更频繁，RS 变大，RSI 就升向 100；当跌幅占优，RSI 就沉向 0。</span></p>
      <p>Because it is a <b>ratio</b>, RSI is self-normalising — it does not care whether EURUSD is at 1.0800 or gold at 2650. The same reading of 65 means the same strength on any symbol, any timeframe. That is what makes it usable across markets.
        <span class="zh">因为本质是<b>比值</b>，RSI 会自我归一化——它不在乎欧美在 1.0800 还是黄金在 2650。65 这个读数在任何品种、任何周期都代表同样的强度。这正是它能跨市场通用的原因。</span></p>
      <div class="calcbox">
        <div class="fx">RS<span class="op">=</span><b>Avg Gain (14)</b><span class="op">÷</span><b>Avg Loss (14)</b><span class="op">→</span>RSI<span class="op">=</span>100 − 100 ÷ ( 1 + RS )</div>
        <div class="cap">平均涨幅 ÷ 平均跌幅 = RS → 代入公式得 0–100 的数值</div>
      </div>
    </div>
  </article>
</section>

<!-- ================= PART 02 · LEVELS ================= -->
<section class="divider">
  <div class="rail reveal">Part 02 · 第二部分</div>
  <h2 class="reveal">The 70 / 30 Levels</h2>
  <div class="zh reveal">超 买 70 · 超 卖 30</div>
</section>

<section class="section" id="rsi-levels">
  <div class="group-head reveal"><span class="tier">02</span>
    <div><div class="eyebrow">Zones · 区域</div><h2 class="title">70 Is Not a Sell Signal</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">RSI.03</span><h3>Overbought 70 · Oversold 30<span class="zh">超买 70 · 超卖 30</span></h3><span class="tag bear">The classic 经典</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="rsiLevels"></div>
      <figcaption>RSI in its three zones — overbought, neutral, oversold<span class="zh">RSI 的三个区域——超买、中性、超卖</span></figcaption></figure>
    <div class="pattern-desc">
      <p>Above <b>70</b> the market is considered overbought; below <b>30</b>, oversold. In a <b>range</b>, these extremes mark where price is stretched and likely to revert — the zone where fade trades live.
        <span class="zh">高于 <b>70</b> 视为超买，低于 <b>30</b> 视为超卖。在<b>震荡市</b>里，这两个极端代表价格被拉得过远、随时可能回归——这正是做反转（fade）交易的区域。</span></p>
      <p>Gold and the major forex pairs behave differently here. <b>Gold</b> reaches 70/30 often and holds there briefly, so the levels work well in ranges. <b>EURUSD and GBPUSD</b> spend most of their time between 40 and 60, so a touch of 70 is a rarer, more meaningful event. Know your instrument's "normal" range before reading its RSI.
        <span class="zh">黄金和主流外汇在这里表现不同。<b>黄金</b>经常触及 70/30 但停留时间短，所以震荡时这两个位置很有效。<b>欧美、镑美</b>大部分时间在 40–60 之间游走，触到 70 是更罕见、更有意义的事件。读 RSI 之前，先要知道你那个品种的「常态区间」。</span></p>
      <ul class="points">
        <li><b>70+ overbought</b> — momentum is hot; in a range expect mean reversion.<span class="zh">超买——动能过热；震荡市里预期回归均值。</span></li>
        <li><b>30− oversold</b> — momentum is exhausted; in a range look for a bounce.<span class="zh">超卖——动能耗尽；震荡市里找反弹。</span></li>
        <li><b>40–60 neutral</b> — where most major-forex time is spent; levels matter less here.<span class="zh">中性区——主流外汇大部分时间待在这里；此时阈值意义不大。</span></li>
      </ul>
      <div class="note">// The level is a warning light, not a command. It tells you price is stretched — you still need a reason to act.
        阈值是警示灯，不是命令。它告诉你价格被拉伸了——行动仍然需要理由。</div>
    </div>
  </article>
</section>

<!-- ================= PART 03 · MT5 + DIVERGENCE ================= -->
<section class="divider">
  <div class="rail reveal">Part 03 · 第三部分</div>
  <h2 class="reveal">MT5 &amp; Divergence</h2>
  <div class="zh reveal">MT5 显 示 与 背 离</div>
</section>

<section class="section" id="rsi-mt5">
  <div class="group-head reveal"><span class="tier">03</span>
    <div><div class="eyebrow">MetaTrader 5 · 终端</div><h2 class="title">Find It in the Navigator</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">RSI.04</span><h3>How RSI Looks in MT5<span class="zh">MT5 里长什么样</span></h3><span class="tag neu">Setup 设置</span></div>
    <div class="pattern-desc">
      <p>In MT5, RSI is an <b>oscillator</b>: it opens in its own <b>sub-window</b> below the price chart — not on top of candles. You get one line, a horizontal 0–100 scale, and two dashed guide levels at 30 and 70.
        <span class="zh">在 MT5 里，RSI 属于<b>震荡指标</b>：它显示在价格图<b>下方的附属窗口</b>，而不是叠在 K 线上。你会看到一条线、0–100 的横轴刻度，以及 30 和 70 两条虚线参考位。</span></p>
      <p>Add it from the Navigator panel: <b>Indicators → Oscillators → Relative Strength Index</b>. Leave the period at 14 and the price at Close. The window is roughly a fifth of the chart height — that vertical room is exactly what makes divergence visible.
        <span class="zh">从导航器添加：<b>指标 → 震荡指标 → Relative Strength Index</b>。周期保持 14，价格用收盘价。这个窗口大约占图表高度的五分之一——正是这段纵向空间让背离一眼可见。</span></p>
      <ul class="points">
        <li><b>One line</b> — no clouds, no histogram; the single curve is the whole indicator.<span class="zh">一条线——没有云带、没有柱状图；这条曲线就是全部。</span></li>
        <li><b>0–100 scale</b> — fixed, identical on every symbol and timeframe.<span class="zh">0–100 固定刻度——任何品种、任何周期都完全一样。</span></li>
        <li><b>30 / 70 guides</b> — dashed by default; set them solid if you want them to stand out.<span class="zh">30/70 默认虚线；想更醒目可以改成实线。</span></li>
      </ul>
    </div>
  </article>
</section>

<section class="section" id="rsi-divergence">
  <div class="group-head reveal"><span class="tier">04</span>
    <div><div class="eyebrow">The real signal · 真正的信号</div><h2 class="title">Divergence: Price Lies, RSI Tells</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">RSI.05</span><h3>Bearish &amp; Bullish Divergence<span class="zh">顶背离与底背离</span></h3><span class="tag bull">High value 高价值</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="rsiDivergence"></div>
      <figcaption>Both divergences on one chart — price against momentum<span class="zh">一张图看两种背离——价格 vs 动能</span></figcaption></figure>
    <div class="pattern-desc">
      <p><b>Bearish (top) divergence:</b> price makes a higher high, but RSI makes a <b>lower high</b>. Momentum is not confirming the breakout — the engine is losing power even as the car looks fastest. In a range this is a high-quality short setup.
        <span class="zh"><b>顶背离（看跌）：</b>价格创新高，但 RSI 却<b>没创新高</b>。动能没有确认突破——车看起来最快的时候，引擎其实在熄火。在震荡市里这是高质量的做空机会。</span></p>
      <p><b>Bullish (bottom) divergence:</b> price makes a lower low, but RSI makes a <b>higher low</b>. Sellers are running out of ammunition; the drop is happening on weakening momentum. In a range this is a high-quality long setup.
        <span class="zh"><b>底背离（看涨）：</b>价格创新低，但 RSI 却<b>没创新低</b>。空头弹药快打完了；下跌是在动能减弱中进行的。在震荡市里这是高质量的做多机会。</span></p>
      <div class="cmp">
        <div class="col bad">
          <div class="ch">✕ What beginners do · 新手常犯</div>
          <ol>
            <li>Spot one divergence and short immediately<span class="zh">看到一个背离立刻做空</span></li>
            <li>No level, no structure, no confirmation<span class="zh">没有关键位、没有结构、没有确认</span></li>
            <li>Price keeps trending — stop hit<span class="zh">价格继续走——止损被打</span></li>
          </ol>
          <div class="verdict">→ Divergence without a trend context is a coin flip.<br>没有趋势背景的背离，跟抛硬币没区别。</div>
        </div>
        <div class="col good">
          <div class="ch">✓ What works · 正确做法</div>
          <ol>
            <li>Divergence forms at resistance / range top<span class="zh">背离出现在阻力位 / 区间顶部</span></li>
            <li>Wait for a rejection candle (pin, engulfing)<span class="zh">等一根拒绝 K 线（锤子、吞没）</span></li>
            <li>Short below the swing low, stop above the high<span class="zh">在摆动低点下方进场，止损放高点上方</span></li>
          </ol>
          <div class="verdict">→ Divergence + level + confirmation = edge.<br>背离 + 关键位 + 确认 = 优势。</div>
        </div>
      </div>
      <div class="note">// Divergence is a warning, not a trigger. The reversal only counts when price action agrees.
        背离是警报，不是扳机。只有价格行为也同意时，反转才算数。</div>
    </div>
  </article>
</section>

<!-- ================= PART 04 · TREND ================= -->
<section class="divider">
  <div class="rail reveal">Part 04 · 第四部分</div>
  <h2 class="reveal">RSI Inside a Trend</h2>
  <div class="zh reveal">趋 势 中 的 RSI</div>
</section>

<section class="section" id="rsi-trend">
  <div class="group-head reveal"><span class="tier">05</span>
    <div><div class="eyebrow">Context first · 先看背景</div><h2 class="title">Overbought Can Stay Overbought</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">RSI.06</span><h3>Strong Trends Ignore the Levels<span class="zh">强趋势可以一直超买</span></h3><span class="tag neu">Key nuance 关键细节</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="rsiTrend"></div>
      <figcaption>In a strong uptrend RSI rides 60–80; fading it at 70 keeps losing money<span class="zh">强上升趋势中 RSI 在 60–80 运行；在 70 反手做空会一直亏</span></figcaption></figure>
    <div class="pattern-desc">
      <p>Here is the mistake that separates accounts: in a <b>strong uptrend</b>, RSI can sit above 70 for weeks. Overbought is not a reason to short a trend — it is what a strong trend <b>looks like</b>. Fading every 70 print in a trending market is donating money.
        <span class="zh">这是区分帐户盈亏的关键错误：在<b>强上升趋势</b>中，RSI 可以在 70 上方待好几周。超买不是做空趋势的理由——超买本身就是强趋势的<b>样子</b>。在趋势行情里见 70 就反手，等于在送钱。</span></p>
      <p>The rule of thumb: in a range, fade 70/30. In a trend, <b>trade with it</b> — treat 40–50 as the buy zone (pullback) and 60–70 as continuation, not exhaustion. The same reading means opposite things depending on context. That context comes from price structure, never from RSI itself.
        <span class="zh">经验法则：震荡里反着做 70/30；趋势里<b>顺着做</b>——把 40–50 当买入区（回调），60–70 当延续而非力竭。同一个读数，在不同背景下含义完全相反。而背景来自价格结构，永远不来自 RSI 本身。</span></p>
      <ul class="points">
        <li><b>Range</b> — 70/30 marks the edges; fade toward the middle.<span class="zh">震荡——70/30 是边界；朝中间反向做。</span></li>
        <li><b>Uptrend</b> — RSI above 50 is normal; pullbacks into 40–50 are entries.<span class="zh">上升趋势——RSI 在 50 上方是常态；回踩 40–50 是进场点。</span></li>
        <li><b>Downtrend</b> — RSI below 50 is normal; rallies into 50–60 are shorts.<span class="zh">下降趋势——RSI 在 50 下方是常态；反弹到 50–60 是做空点。</span></li>
      </ul>
    </div>
  </article>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">RSI.07</span><h3>The 50 Line Is the Trend Switch<span class="zh">50 中线的方向开关</span></h3><span class="tag bull">Underused 被低估</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="rsi50"></div>
      <figcaption>RSI crossing 50 confirms the shift from bearish to bullish momentum<span class="zh">RSI 突破 50 确认动能由空转多</span></figcaption></figure>
    <div class="pattern-desc">
      <p>50 is the midline where average gains equal average losses. <b>Above 50, bulls control the last 14 candles; below, bears do.</b> A clean cross of 50 is a quieter but often more reliable signal than the 70/30 extremes — it confirms momentum direction without waiting for exhaustion.
        <span class="zh">50 是中位线，代表平均涨幅等于平均跌幅。<b>50 上方，多头掌控最近 14 根 K 线；下方，空头掌控。</b>干净利落地突破 50，往往比 70/30 的极端位更安静也更能打——它确认动能方向，却不必等力竭。</span></p>
      <p>Use it as a filter: in an uptrend, you only take longs that form while RSI holds above 50 — or buy the first close back above it after a pullback. The cross works best on H1 and above; on M1–M5 it fires constantly and means little.
        <span class="zh">把它当过滤器用：上升趋势里只做「RSI 守在 50 上方时」形成的多单——或者等回调后第一次收盘站回 50 上方再买。这个信号在 H1 及以上周期最有效；在 M1–M5 上它频繁触发，意义不大。</span></p>
      <div class="note">// 70/30 says "stretched". 50 says "who is in control". The second question comes first.
        70/30 回答「拉得过远吗」，50 回答「现在谁说了算」。后一个问题应该先问。</div>
    </div>
  </article>
</section>

<!-- ================= PART 05 · APPLICATION ================= -->
<section class="divider">
  <div class="rail reveal">Part 05 · 第五部分</div>
  <h2 class="reveal">Putting It Together</h2>
  <div class="zh reveal">结 合 价 格 行 为</div>
</section>

<section class="section" id="rsi-price-action">
  <div class="group-head reveal"><span class="tier">07</span>
    <div><div class="eyebrow">Confluence · 共振</div><h2 class="title">RSI Is a Filter, Price Is the Trigger</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">RSI.08</span><h3>Support / Resistance + RSI<span class="zh">支撑阻力 + RSI 共振</span></h3><span class="tag bull">The workflow 工作流</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="rsiPractice"></div>
      <figcaption>Levels first, RSI second — the A+ setups only appear when both agree<span class="zh">先有位、后有 RSI——两边一致时才出现 A+ 信号</span></figcaption></figure>
    <div class="pattern-desc">
      <p>RSI is at its best as a <b>confirmation filter</b> on setups you already found with price action. The workflow: find a level with support/resistance or supply/demand → wait for price to reach it → check what RSI says → take the trade only when both agree.
        <span class="zh">RSI 最擅长的角色，是给「已经用价格行为找到的形态」做<b>确认过滤器</b>。流程：先用支撑阻力或供需找到关键位 → 等价格到位 → 看 RSI 怎么说 → 两边一致才动手。</span></p>
      <p>Three high-quality combos: <b>(1)</b> long at support with bullish divergence and a rejection candle; <b>(2)</b> short at resistance with bearish divergence and a rejection candle; <b>(3)</b> in an uptrend, buy the pullback to a support zone while RSI holds above 50. Every one of them is a level first, RSI second.
        <span class="zh">三个高质量组合：<b>①</b> 支撑位 + 底背离 + 拒绝 K 线做多；<b>②</b> 阻力位 + 顶背离 + 拒绝 K 线做空；<b>③</b> 上升趋势中，RSI 守在 50 上方时回踩支撑区做多。每一个都是「先有位，后有 RSI」。</span></p>
      <div class="note">// If the RSI filter rejects a trade, the trade was not "almost right" — it was incomplete.
        如果 RSI 过滤掉了某笔交易，不是「差一点就对了」——是它本来就不完整。</div>
    </div>
  </article>
</section>

<section class="section" id="rsi-misuse">
  <div class="group-head reveal"><span class="tier">08</span>
    <div><div class="eyebrow">Traps · 陷阱</div><h2 class="title">Common Ways RSI Gets Misused</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">RSI.09</span><h3>Five Mistakes That Cost Money<span class="zh">五个烧钱的错误用法</span></h3><span class="tag bear">Read this 必读</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="rsiMisuse"></div>
      <figcaption>The five classic RSI mistakes — every one of them ignores context<span class="zh">五种经典 RSI 误用——共同点：都无视背景</span></figcaption></figure>
    <div class="pattern-desc">
      <ul class="points">
        <li><b>1 · Fading 70/30 blindly</b> — shorting every 70 in a trend. The trend is the context; overbought is its normal state.<span class="zh">① 无脑反着做 70/30——趋势里见 70 就空。趋势就是背景，超买是它的常态。</span></li>
        <li><b>2 · Trading divergence alone</b> — no level, no confirmation, no structure. Divergence without context flips both ways.<span class="zh">② 光靠背离交易——没有关键位、没有确认、没有结构。没有背景的背离上下都骗人。</span></li>
        <li><b>3 · Chasing the cross</b> — entering on the 50 cross alone at market, buying the top of a move. Wait for a pullback or a candle close.<span class="zh">③ 追突破——只看 50 穿越就市价进场，常常买在波动的顶部。等回调，或等收盘确认。</span></li>
        <li><b>4 · Using it on low timeframes</b> — M1/M5 RSI whipsaws nonstop. Below H1 the signal-to-noise ratio collapses.<span class="zh">④ 在小周期上用——M1/M5 的 RSI 来回抽嘴巴。低于 H1，信噪比崩塌。</span></li>
        <li><b>5 · Letting it replace the plan</b> — the indicator decides, not your rules. RSI is one vote in a committee; the plan is the chairman.<span class="zh">⑤ 让指标替你做决定——不是你的规则说了算。RSI 只是委员会里的一票，交易计划才是主席。</span></li>
      </ul>
      <div class="note">// Every misuse above has one root cause: asking RSI to do its job without telling it which market regime it is in.
        以上所有误用只有一个根源：让 RSI 干活，却不告诉它现在处于哪种市场状态。</div>
    </div>
  </article>
</section>

<section class="section" id="practice">
  <div class="group-head reveal"><span class="tier">09</span>
    <div><div class="eyebrow">Do it yourself · 自己看一次</div><h2 class="title">Three Charts, One Method</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-desc" style="margin-bottom:6px;">
      <p>Open MT5, add RSI (14) to XAUUSD H1 and EURUSD H1. For each case below, decide: range or trend? Then state what RSI allows — and what it forbids.
        <span class="zh">打开 MT5，给 XAUUSD H1 和 EURUSD H1 加上 RSI(14)。对下面每个案例先判断：震荡还是趋势？然后说出 RSI 允许什么——以及禁止什么。</span></p>
    </div>

    <div class="case reveal">
      <div class="ct"><span class="cn">CASE 01</span><h4>Gold · Range</h4><span class="zh">黄金 · 震荡</span></div>
      <div class="caserow">
        <div class="c"><div class="k">Regime</div><div class="v">Range 震荡</div></div>
        <div class="c"><div class="k">RSI at top</div><div class="v gold">72 + bearish divergence</div></div>
        <div class="c"><div class="k">Action</div><div class="v bull">Short at resistance</div></div>
        <div class="c"><div class="k">Invalid</div><div class="v bear">Close above range high</div></div>
      </div>
      <div class="work">
        <b>1.</b> Regime <span class="res">= range (clear S/R, no trend)</span><br>
        <b>2.</b> RSI <span class="res">= 72 overbought + lower high = bearish divergence</span><br>
        <b>3.</b> Price action <span class="res">= rejection candle at resistance</span><br>
        <b>→</b> Short below the rejection low <span class="res">stop above resistance ✓ 与 RSI 一致才动手</span>
      </div>
      <div class="note" style="margin-top:14px;">// In a range, every RSI extreme is a candidate for reversal — but only with a level and a candle.
        <span class="zh">震荡里，每个 RSI 极端都是反转候选——但必须配上关键位和一根 K 线。</span></div>
    </div>

    <div class="case reveal">
      <div class="ct"><span class="cn">CASE 02</span><h4>EURUSD · Uptrend</h4><span class="zh">欧美 · 上升趋势</span></div>
      <div class="caserow">
        <div class="c"><div class="k">Regime</div><div class="v">Uptrend 上升趋势</div></div>
        <div class="c"><div class="k">RSI</div><div class="v gold">65, holding above 50</div></div>
        <div class="c"><div class="k">Action</div><div class="v bull">Buy the pullback</div></div>
        <div class="c"><div class="k">Invalid</div><div class="v bear">Close below 50 + trendline</div></div>
      </div>
      <div class="work">
        <b>1.</b> Regime <span class="res">= uptrend (higher highs / higher lows)</span><br>
        <b>2.</b> RSI <span class="res">= 65 overbought, but that is NORMAL in a trend</span><br>
        <b>3.</b> Action <span class="res">= do NOT short 65 — wait for the pullback into 45–50</span><br>
        <b>→</b> Buy the pullback at support <span class="res">stop below the swing low ✓ 趋势中 70 不是做空理由</span>
      </div>
    </div>

    <div class="case reveal">
      <div class="ct"><span class="cn">CASE 03</span><h4>Gold · Fake Signal</h4><span class="zh">黄金 · 假信号</span></div>
      <div class="caserow">
        <div class="c"><div class="k">Regime</div><div class="v">Uptrend 上升趋势</div></div>
        <div class="c"><div class="k">RSI</div><div class="v gold">73 — no divergence</div></div>
        <div class="c"><div class="k">Temptation</div><div class="v bear">Short "because overbought"</div></div>
        <div class="c"><div class="k">Verdict</div><div class="v bull">No trade — context forbids</div></div>
      </div>
      <div class="work">
        <b>1.</b> Regime <span class="res">= uptrend — higher highs intact</span><br>
        <b>2.</b> RSI <span class="res">= 73 with a matching new high (no divergence)</span><br>
        <b>3.</b> Rule <span class="res">= never fade a trend without divergence + level</span><br>
        <b>→</b> Verdict <span class="res">= sit on hands. The trend is healthy. ✓ 不交易也是一种交易</span>
      </div>
      <div class="note" style="margin-top:14px;">// Passing on a tempting but contextless signal is a win. The chart pays you for patience.
        <span class="zh">放弃一个诱人但没有背景的信号，就是赢。图表会用耐心回报你。</span></div>
    </div>
  </article>

  <div class="toolcta reveal">
    <div class="tt">
      <span class="tag">Next up · 下一步</span>
      <h4>Test yourself in the Module Quiz</h4>
      <div class="zh">用 模 块 测 验 验 收</div>
      <p>Scroll down and take the 5-question quiz — you need 4 of 5 to unlock Module 19.
        <span style="display:block;font-family:'Noto Sans SC';color:var(--muted-2);margin-top:6px;">
        往下滚动，完成 5 题测验——答对 4 题即可解锁 Module 19。</span></p>
    </div>
    <a class="btn" href="#exam">Take the Quiz <span class="ar">→</span></a>
  </div>
</section>

'''
pre, sep, post = html.partition('<!-- ================= PART 01')
assert sep, 'content start marker missing'
html = pre + CONTENT + post.split('<!-- ================= EXAM MODULE', 1)[1]

# ---------------------------------------------------------------- agenda + note (after content, so PART 01 marker exists)
pre, sep, post = html.partition('<!-- ================= AGENDA ================= -->')
assert sep, 'agenda marker missing'
html = pre + AGENDA + post.split('<!-- ================= PART 01', 1)[1]

# ---------------------------------------------------------------- closing
html = html.replace(
    '<p class="quote">Amateurs think about how much they can <em>make</em>.<br>Professionals think about how much they can <em>lose</em>.</p>',
    '<p class="quote">The indicator never tells you what to do.<br>It tells you how strong the move <em>is</em> — you bring the context.</p>')
html = html.replace(
    '<div class="quote-zh">业余的人想的是能赚多少，专业的人想的是能亏多少。</div>',
    '<div class="quote-zh">指标从不告诉你该怎么做，它只告诉你这波走得有多强——背景由你带来。</div>')
html = html.replace(
    '<span>Risk First</span><span class="sep">·</span><span>Size Second</span><span class="sep">·</span><span>Entry Last</span>',
    '<span>Context First</span><span class="sep">·</span><span>Level Second</span><span class="sep">·</span><span>RSI Confirms</span>')

# ---------------------------------------------------------------- footer copy
html = html.replace(
    'Make Trades Journey · By XRs Trading Lab · Risk Management &amp; Position Sizing</div>',
    'Make Trades Journey · By XRs Trading Lab · RSI Indicator</div>')

# ---------------------------------------------------------------- CSS comment rename
html = html.replace(
    '/* ===================== Risk Management additions ===================== */',
    '/* ===================== RSI Module additions ===================== */')

# ---------------------------------------------------------------- draw functions
DRAWS = '''/* ============ RSI.01 levels 70/30 ============ */
function drawRSILevels(box){
  const W=720,H=300,L=46,R=26,T=20,B=30;
  const s=svgFor(box,W,H);
  const vals=[52,58,63,60,66,71,74,70,64,58,52,46,41,35,31,28,32,38,44,50,56,61,65,62,57,53,49,54,60,66,72,68,61,55,48,42,47,53,58,64];
  const n=vals.length, plotW=W-L-R, plotH=H-T-B;
  const X=i=>L+plotW*(i/(n-1));
  const Y=v=>T+plotH-(v/100)*plotH;
  el('rect',{x:L,y:Y(100),width:plotW,height:Y(70)-Y(100),fill:'rgba(255,92,99,.07)',class:'rbar',style:'--i:0'},s);
  el('rect',{x:L,y:Y(30),width:plotW,height:Y(0)-Y(30),fill:'rgba(44,217,138,.07)',class:'rbar',style:'--i:1'},s);
  [[70,C.bear,'OVERBOUGHT 超买'],[50,C.gold,'50 MIDLINE 中线'],[30,C.bull,'OVERSOLD 超卖']].forEach(d=>{
    el('line',{x1:L,x2:L+plotW,y1:Y(d[0]),y2:Y(d[0]),stroke:d[1],'stroke-opacity':.55,'stroke-dasharray':'6 5','stroke-width':1.2},s);
    txt(s,L+plotW+6,Y(d[0])+3.5,d[2],{'font-size':9,fill:d[1],'font-family':"'Noto Sans SC',sans-serif",'letter-spacing':'.05em'});
  });
  [20,40,60,80].forEach(v=>{el('line',{x1:L,x2:L+plotW,y1:Y(v),y2:Y(v),class:'rgrid'},s);});
  const pts=vals.map((v,i)=>[X(i),Y(v)]);
  el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')+' L'+X(n-1).toFixed(1)+','+Y(0).toFixed(1)+' L'+X(0).toFixed(1)+','+Y(0).toFixed(1)+' Z',
    fill:'rgba(232,200,119,.08)',class:'rbar',style:'--i:2'},s);
  el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),stroke:C.gold,'stroke-width':2.2,fill:'none',class:'rline'},s);
  const peak=6, trough=11;
  txt(s,X(peak),Y(vals[peak])-10,'74',{'text-anchor':'middle','font-size':12,'font-weight':700,fill:C.bear,class:'rlbl'});
  txt(s,X(trough),Y(vals[trough])+18,'28',{'text-anchor':'middle','font-size':12,'font-weight':700,fill:C.bull,class:'rlbl'});
  txt(s,L+plotW/2,H-10,'RSI (14) — 0–100 OSCILLATOR  震荡指标',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.16em','font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ RSI.02 formula intuition ============ */
function drawRSIFormula(box){
  const W=720,H=290,s=svgFor(box,W,H);
  const sc=[
    {t:'STRONG UPTREND 强势上涨',g:13,l:2.5,rsi:84,c:C.bull},
    {t:'BALANCED 势均力敌',g:6,l:6,rsi:50,c:C.gold},
    {t:'STRONG DOWNTREND 强势下跌',g:2.5,l:13,rsi:16,c:C.bear}];
  const cw=(W-40)/3, base=158, SC=90/13;
  txt(s,20+cw*1.5,18,'AVG GAIN ÷ AVG LOSS — LAST 14 PERIODS  14 期平均涨幅 ÷ 平均跌幅',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.14em','font-family':"'Noto Sans SC',sans-serif"});
  sc.forEach((c,i)=>{
    const x=20+cw*i, g=el('g',{style:'--i:'+i},s);
    el('rect',{x:x+7,y:32,width:cw-14,height:H-62,rx:14,fill:'rgba(255,255,255,.016)',stroke:'rgba(232,200,119,.12)',class:'rbar'},g);
    txt(g,x+cw/2,54,c.t,{'text-anchor':'middle','font-size':9.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
    const gh=c.g*SC, lh=c.l*SC;
    el('rect',{x:x+cw/2-42,y:base-gh,width:34,height:gh,rx:3,fill:C.bull,'fill-opacity':.6,stroke:C.bull,'stroke-opacity':.5,class:'rbar'},g);
    txt(g,x+cw/2-25,base-gh-7,'+'+c.g,{'text-anchor':'middle','font-size':11,fill:C.bull,'font-weight':700,class:'rlbl'});
    el('rect',{x:x+cw/2+8,y:base,width:34,height:lh,rx:3,fill:C.bear,'fill-opacity':.6,stroke:C.bear,'stroke-opacity':.5,class:'rbar'},g);
    txt(g,x+cw/2+25,base+lh+15,'−'+c.l,{'text-anchor':'middle','font-size':11,fill:C.bear,'font-weight':700,class:'rlbl'});
    txt(g,x+cw/2-25,base+14,'GAIN 涨',{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
    txt(g,x+cw/2+25,base+14,'LOSS 跌',{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
    el('rect',{x:x+cw/2-46,y:base+44,width:92,height:46,rx:10,fill:'rgba(232,200,119,.08)',stroke:'rgba(232,200,119,.35)',class:'rbar'},g);
    txt(g,x+cw/2,base+63,'RSI',{'text-anchor':'middle','font-size':9,fill:C.muted2,'letter-spacing':'.18em'});
    txt(g,x+cw/2,base+80,c.rsi,{'text-anchor':'middle','font-size':19,'font-weight':700,fill:c.c,class:'rlbl'});
  });
  txt(s,W/2,H-12,'Bigger ratio → RSI toward 100 · 比值越大，RSI 越接近 100',{'text-anchor':'middle','font-size':10,fill:C.goldB,'font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ RSI.03 divergence ============ */
function drawRSIDivergence(box){
  const W=720,H=390,L=46,R=30,T=22,B=18;
  const s=svgFor(box,W,H);
  const topH=150, gap=26;
  const botY=T+topH+gap, botH=H-B-botY;
  const plotW=W-L-R;
  const X=i=>L+plotW*(i/4);
  const P=[{v:100},{v:112},{v:106},{v:98},{v:107}];
  const pmn=92,pmx=116;
  const PY=v=>T+(pmx-v)/(pmx-pmn)*topH;
  const RS=[{v:58},{v:47},{v:52},{v:62},{v:71}];
  const RY=v=>botY+(100-v)/100*botH;
  txt(s,L,T-8,'PRICE  价格',{'font-size':9.5,fill:C.text,'letter-spacing':'.2em'});
  txt(s,L,botY-8,'RSI (14)  相对强弱指标',{'font-size':9.5,fill:C.gold,'letter-spacing':'.1em','font-family':"'Noto Sans SC',sans-serif"});
  [70,50,30].forEach(v=>{el('line',{x1:L,x2:L+plotW,y1:RY(v),y2:RY(v),stroke:'rgba(255,255,255,.06)','stroke-dasharray':'4 4'},s);});
  const ppts=P.map((p,i)=>[X(i),PY(p.v)]);
  el('path',{d:ppts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),stroke:C.text,'stroke-width':2,fill:'none',class:'rline'},s);
  P.forEach((p,i)=>{el('circle',{cx:X(i),cy:PY(p.v),r:4,fill:C.text,class:'rlbl'},s);});
  const rpts=RS.map((r,i)=>[X(i),RY(r.v)]);
  el('path',{d:rpts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),stroke:C.gold,'stroke-width':2,fill:'none',class:'rline'},s);
  RS.forEach((r,i)=>{el('circle',{cx:X(i),cy:RY(r.v),r:4,fill:C.gold,class:'rlbl'},s);});
  [0,1,2,3].forEach(i=>{el('line',{x1:X(i),x2:X(i),y1:PY(P[i].v),y2:RY(RS[i].v),stroke:'rgba(232,200,119,.22)','stroke-dasharray':'3 5'},s);});
  /* bearish divergence: P0->P1 up, R0->R1 down */
  el('line',{x1:X(0),x2:X(1),y1:PY(P[0].v),y2:PY(P[1].v),stroke:C.bear,'stroke-width':1.7,'stroke-dasharray':'6 4',class:'rlbl'},s);
  el('line',{x1:X(0),x2:X(1),y1:RY(RS[0].v),y2:RY(RS[1].v),stroke:C.bear,'stroke-width':1.7,'stroke-dasharray':'6 4',class:'rlbl'},s);
  /* bullish divergence: P2->P3 down, R2->R3 up */
  el('line',{x1:X(2),x2:X(3),y1:PY(P[2].v),y2:PY(P[3].v),stroke:C.bull,'stroke-width':1.7,'stroke-dasharray':'6 4',class:'rlbl'},s);
  el('line',{x1:X(2),x2:X(3),y1:RY(RS[2].v),y2:RY(RS[3].v),stroke:C.bull,'stroke-width':1.7,'stroke-dasharray':'6 4',class:'rlbl'},s);
  txt(s,X(0),PY(P[0].v)+16,'1',{'text-anchor':'middle','font-size':11,fill:C.muted2});
  txt(s,X(1),PY(P[1].v)-10,'2 · higher high',{'text-anchor':'middle','font-size':10,fill:C.bear,class:'rlbl'});
  txt(s,X(2),PY(P[2].v)+16,'3',{'text-anchor':'middle','font-size':11,fill:C.muted2});
  txt(s,X(3),PY(P[3].v)+16,'4 · lower low',{'text-anchor':'middle','font-size':10,fill:C.bull,class:'rlbl'});
  txt(s,X(1),RY(RS[1].v)+16,'RSI lower high 不创新高',{'text-anchor':'middle','font-size':9.5,fill:C.bear,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  txt(s,X(3),RY(RS[3].v)-10,'RSI higher low 不创新低',{'text-anchor':'middle','font-size':9.5,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  txt(s,L+plotW/2,T+topH-14,'PRICE HIGHER HIGH 2>1 · RSI LOWER HIGH — BEARISH 顶背离',{'text-anchor':'middle','font-size':9.5,fill:C.bear,'letter-spacing':'.08em',class:'rlbl'});
  txt(s,L+plotW/2,H-12,'PRICE LOWER LOW 4<3 · RSI HIGHER LOW — BULLISH 底背离',{'text-anchor':'middle','font-size':9.5,fill:C.bull,'letter-spacing':'.08em',class:'rlbl'});
}

/* ============ RSI.04 trend context ============ */
function drawRSITrend(box){
  const W=720,H=370,L=46,R=26,T=20,B=16;
  const s=svgFor(box,W,H);
  const topH=152, gap=26;
  const botY=T+topH+gap, botH=H-B-botY;
  const plotW=W-L-R;
  const n=16;
  const X=i=>L+plotW*(i/(n-1));
  const prices=[100,104,103,109,113,111,118,122,120,127,131,129,136,140,138,146];
  const pmn=96,pmx=150;
  const PY=v=>T+(pmx-v)/(pmx-pmn)*topH;
  const rsi=[58,62,60,66,70,68,72,75,73,76,79,77,74,78,80,77];
  const RY=v=>botY+(100-v)/100*botH;
  txt(s,L,T-8,'PRICE — UPTREND  价格 · 上升趋势',{'font-size':9.5,fill:C.text,'letter-spacing':'.12em','font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L,botY-8,'RSI (14)  趋势中 70 是常态',{'font-size':9.5,fill:C.gold,'letter-spacing':'.1em','font-family':"'Noto Sans SC',sans-serif"});
  el('rect',{x:L,y:RY(100),width:plotW,height:RY(70)-RY(100),fill:'rgba(255,92,99,.09)',class:'rbar',style:'--i:0'},s);
  el('line',{x1:L,x2:L+plotW,y1:RY(70),y2:RY(70),stroke:C.bear,'stroke-opacity':.55,'stroke-dasharray':'6 5'},s);
  el('line',{x1:L,x2:L+plotW,y1:RY(50),y2:RY(50),stroke:C.gold,'stroke-opacity':.4,'stroke-dasharray':'4 5'},s);
  txt(s,L+plotW+5,RY(70)+3.5,'70',{'font-size':9,fill:C.bear});
  txt(s,L+plotW+5,RY(50)+3.5,'50',{'font-size':9,fill:C.gold});
  const ppts=prices.map((p,i)=>[X(i),PY(p)]);
  el('path',{d:ppts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),stroke:C.text,'stroke-width':2,fill:'none',class:'rline'},s);
  el('line',{x1:X(0),x2:X(n-1),y1:PY(99),y2:PY(141),stroke:C.bull,'stroke-width':1.6,'stroke-dasharray':'7 5','stroke-opacity':.8,class:'rlbl'},s);
  txt(s,X(n-1)+4,PY(141)-7,'trendline 趋势线',{'font-size':9,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  const rpts=rsi.map((v,i)=>[X(i),RY(v)]);
  el('path',{d:rpts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),stroke:C.gold,'stroke-width':2,fill:'none',class:'rline'},s);
  txt(s,X(4)+8,RY(rsi[4])-9,'✕ SHORT HERE = LOSS 这里做空 = 亏',{'font-size':9.5,fill:C.bear,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  const zi0=12, zi1=14;
  el('rect',{x:X(zi0),y:RY(50),width:X(zi1)-X(zi0),height:RY(40)-RY(50),fill:'rgba(44,217,138,.14)',class:'rbar',style:'--i:1'},s);
  txt(s,(X(zi0)+X(zi1))/2,RY(50)-8,'✓ BUY ZONE 40–50 买入区',{'text-anchor':'middle','font-size':9,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  txt(s,L+plotW/2,H-11,'RSI 70–80 FOR WEEKS = STRONG TREND, NOT A SHORT  连续数周 70–80 = 强趋势，不是做空信号',{'text-anchor':'middle','font-size':9.5,fill:C.goldB,'font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ RSI.05 50 midline ============ */
function drawRSI50(box){
  const W=720,H=290,L=46,R=30,T=22,B=30;
  const s=svgFor(box,W,H);
  const vals=[38,34,31,35,41,46,44,49,55,52,58,63,61,66,70,68,72];
  const n=vals.length, plotW=W-L-R, plotH=H-T-B;
  const X=i=>L+plotW*(i/(n-1));
  const Y=v=>T+plotH-(v/100)*plotH;
  el('rect',{x:L,y:Y(100),width:plotW,height:Y(50)-Y(100),fill:'rgba(44,217,138,.07)',class:'rbar',style:'--i:0'},s);
  el('rect',{x:L,y:Y(50),width:plotW,height:Y(0)-Y(50),fill:'rgba(255,92,99,.05)',class:'rbar',style:'--i:1'},s);
  [70,30].forEach(v=>{el('line',{x1:L,x2:L+plotW,y1:Y(v),y2:Y(v),stroke:'rgba(255,255,255,.07)','stroke-dasharray':'5 5'},s);});
  el('line',{x1:L,x2:L+plotW,y1:Y(50),y2:Y(50),stroke:C.gold,'stroke-width':1.6,'stroke-dasharray':'8 5','stroke-opacity':.9},s);
  txt(s,L+plotW+6,Y(50)+3.5,'50',{'font-size':9,fill:C.gold});
  const pts=vals.map((v,i)=>[X(i),Y(v)]);
  el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),stroke:C.cyan,'stroke-width':2.2,fill:'none',class:'rline'},s);
  const ci=7;
  el('circle',{cx:X(ci),cy:Y(55),r:6,fill:'none',stroke:C.bull,'stroke-width':2,class:'rlbl'},s);
  el('line',{x1:X(ci),x2:X(ci),y1:Y(55),y2:Y(55)-36,stroke:C.bull,'stroke-width':1.4,'stroke-dasharray':'3 4',class:'rlbl'},s);
  txt(s,X(ci),Y(55)-44,'CROSS 突破',{'text-anchor':'middle','font-size':10,fill:C.bull,'font-weight':700,class:'rlbl'});
  txt(s,X(ci),Y(55)-30,'momentum turns bullish 动能转多',{'text-anchor':'middle','font-size':8.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  txt(s,L+14,Y(26),'BEARS 空方掌控',{'font-size':9,fill:C.bear,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L+14,Y(76),'BULLS 多方掌控',{'font-size':9,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L+plotW/2,H-10,'ABOVE 50 BULLS · BELOW 50 BEARS  50 上方多方 · 下方空方',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.1em','font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ RSI.06 price action practice ============ */
function drawRSIPractice(box){
  const W=720,H=390,L=46,R=30,T=22,B=18;
  const s=svgFor(box,W,H);
  const topH=152, gap=26;
  const botY=T+topH+gap, botH=H-B-botY;
  const plotW=W-L-R;
  const n=18;
  const X=i=>L+plotW*(i/(n-1));
  const prices=[104,108,105,112,116,113,109,114,110,103,98,102,106,101,95,99,104,108];
  const pmn=90,pmx=120;
  const PY=v=>T+(pmx-v)/(pmx-pmn)*topH;
  const rsi=[55,60,52,66,71,64,58,68,63,52,44,50,56,48,38,46,54,60];
  const RY=v=>botY+(100-v)/100*botH;
  txt(s,L,T-8,'PRICE — RANGE WITH LEVELS  价格 · 震荡 + 关键位',{'font-size':9.5,fill:C.text,'letter-spacing':'.08em','font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L,botY-8,'RSI (14) — CONFIRMATION FILTER  确认过滤器',{'font-size':9.5,fill:C.gold,'letter-spacing':'.08em','font-family':"'Noto Sans SC',sans-serif"});
  const res=114, sup=98;
  el('line',{x1:L,x2:L+plotW,y1:PY(res),y2:PY(res),stroke:C.bear,'stroke-width':1.5,'stroke-dasharray':'8 5','stroke-opacity':.8},s);
  txt(s,L+plotW+6,PY(res)+3.5,'RESISTANCE 阻力',{'font-size':9,fill:C.bear,'font-family':"'Noto Sans SC',sans-serif"});
  el('line',{x1:L,x2:L+plotW,y1:PY(sup),y2:PY(sup),stroke:C.bull,'stroke-width':1.5,'stroke-dasharray':'8 5','stroke-opacity':.8},s);
  txt(s,L+plotW+6,PY(sup)+3.5,'SUPPORT 支撑',{'font-size':9,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif"});
  const ppts=prices.map((p,i)=>[X(i),PY(p)]);
  el('path',{d:ppts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),stroke:C.text,'stroke-width':2,fill:'none',class:'rline'},s);
  [50,30].forEach(v=>{el('line',{x1:L,x2:L+plotW,y1:RY(v),y2:RY(v),stroke:'rgba(255,255,255,.06)','stroke-dasharray':'4 4'},s);});
  el('line',{x1:L,x2:L+plotW,y1:RY(70),y2:RY(70),stroke:C.bear,'stroke-opacity':.5,'stroke-dasharray':'6 5'},s);
  const rpts=rsi.map((v,i)=>[X(i),RY(v)]);
  el('path',{d:rpts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),stroke:C.gold,'stroke-width':2,fill:'none',class:'rline'},s);
  const si=4, li=14;
  el('circle',{cx:X(si),cy:PY(res),r:5,fill:'none',stroke:C.bear,'stroke-width':2,class:'rlbl'},s);
  el('line',{x1:X(si),x2:X(si),y1:PY(res),y2:RY(rsi[si]),stroke:'rgba(255,92,99,.4)','stroke-dasharray':'3 5'},s);
  txt(s,X(si),RY(rsi[si])+16,'71 overbought 超买',{'text-anchor':'middle','font-size':9,fill:C.bear,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  el('line',{x1:X(si)+5,x2:X(si)+5,y1:PY(prices[si]),y2:PY(prices[si])+28,stroke:C.bear,'stroke-width':2.4,class:'rlbl'},s);
  txt(s,X(si)+15,PY(prices[si])+20,'SELL 做空',{'font-size':9,fill:C.bear,'font-weight':700,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  el('circle',{cx:X(li),cy:PY(sup),r:5,fill:'none',stroke:C.bull,'stroke-width':2,class:'rlbl'},s);
  el('line',{x1:X(li),x2:X(li),y1:PY(sup),y2:RY(rsi[li]),stroke:'rgba(44,217,138,.4)','stroke-dasharray':'3 5'},s);
  txt(s,X(li),RY(rsi[li])+16,'38 oversold 超卖',{'text-anchor':'middle','font-size':9,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  el('line',{x1:X(li)+5,x2:X(li)+5,y1:PY(prices[li]),y2:PY(prices[li])+28,stroke:C.bull,'stroke-width':2.4,class:'rlbl'},s);
  txt(s,X(li)+15,PY(prices[li])+20,'BUY 做多',{'font-size':9,fill:C.bull,'font-weight':700,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  txt(s,L+plotW/2,H-11,'LEVEL + RSI EXTREME + PRICE ACTION = ONE TRADE  关键位 + RSI 极端 + 价格行为 = 一笔交易',{'text-anchor':'middle','font-size':9.5,fill:C.goldB,'font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ RSI.07 misuse list ============ */
function drawRSIMisuse(box){
  const W=720,H=320,s=svgFor(box,W,H);
  const rows=[
    ['1','Fade every 70 in a trend','趋势里见 70 就反手做空'],
    ['2','Trade divergence with no level','没有关键位就光靠背离交易'],
    ['3','Chase the 50 cross at market','50 穿越就市价追单'],
    ['4','Trust M1–M5 RSI','在 M1–M5 上信任 RSI'],
    ['5','Let the indicator replace the plan','让指标代替交易计划做决定']];
  const rh=(H-50)/rows.length;
  txt(s,W/2,26,'FIVE WAYS RSI GETS MISUSED  五种误用',{'text-anchor':'middle','font-size':10.5,fill:C.muted2,'letter-spacing':'.18em','font-family':"'Noto Sans SC',sans-serif"});
  rows.forEach((r,i)=>{
    const y=38+rh*i, g=el('g',{style:'--i:'+i},s);
    el('rect',{x:20,y:y+4,width:W-40,height:rh-12,rx:10,fill:'rgba(255,92,99,.05)',stroke:'rgba(255,92,99,.22)',class:'rbar'},g);
    el('circle',{cx:50,cy:y+rh/2-1,r:13,fill:'rgba(255,92,99,.15)',class:'rlbl'},g);
    txt(g,50,y+rh/2+4,'✕',{'text-anchor':'middle','font-size':13,fill:C.bear,'font-weight':700,class:'rlbl'});
    txt(g,78,y+rh/2-3,r[1],{'font-size':12.5,fill:C.text,'font-weight':600});
    txt(g,78,y+rh/2+13,r[2],{'font-size':10.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
    txt(g,W-30,y+rh/2+4,r[0],{'text-anchor':'end','font-size':16,'font-weight':700,fill:'rgba(255,92,99,.35)'});
  });
}

const RENDER={rsiLevels:drawRSILevels,rsiFormula:drawRSIFormula,rsiDivergence:drawRSIDivergence,
              rsiTrend:drawRSITrend,rsi50:drawRSI50,rsiPractice:drawRSIPractice,rsiMisuse:drawRSIMisuse};
document.querySelectorAll('.rchart[data-r]').forEach(b=>{const f=RENDER[b.dataset.r];if(f)f(b);});
'''
start_marker = '/* ============ 1. recovery curve ============ */'
end_marker = "document.querySelectorAll('.rchart[data-r]').forEach(b=>{const f=RENDER[b.dataset.r];if(f)f(b);});"
pre, sep, post = html.partition(start_marker)
assert sep, 'draw start marker missing'
html = pre + DRAWS + post.split(end_marker, 1)[1]

# ---------------------------------------------------------------- exam module 18
html = html.replace('const MTJ_EXAM_KEY = "mtj_exam_pass_10";', 'const MTJ_EXAM_KEY = "mtj_exam_pass_18";')
html = html.replace('/* ===== MTJ EXAM MODULE - Module 10 ===== */', '/* ===== MTJ EXAM MODULE - Module 18 ===== */')
html = html.replace('Pass the Quiz to Unlock Module 11', 'Pass the Quiz to Unlock Module 19')
html = html.replace('Module 11 已解锁', 'Module 19 已解锁')

QUESTIONS = '''[{"q": "RSI stands for Relative Strength Index. What does it actually measure?", "opts": ["The trend direction of the market", "The speed and size of recent price moves, compressed to 0–100", "Volume flowing into the asset", "The distance to the next support level"], "ans": 1, "why": "RSI measures momentum — the speed and magnitude of recent price changes — and normalizes it to a 0–100 oscillator. It does not measure direction, volume, or distance to levels.", "why_zh": "RSI 衡量动能——近期价格变化的速度与幅度——并归一化到 0–100。它不衡量方向、成交量，也不衡量到关键位的距离。"}, {"q": "In a strong uptrend, RSI sits at 75 with no divergence. The best action is…", "opts": ["Short immediately because it is overbought", "Wait for a pullback and buy — overbought is normal in a trend", "Close all positions and sit out", "Buy at market chasing the move"], "ans": 1, "why": "In a strong trend RSI can stay above 70 for a long time. Overbought is the trend's normal state; fading it loses money. The correct play is buying pullbacks, not shorting strength.", "why_zh": "强趋势中 RSI 可以长时间待在 70 上方。超买是趋势的常态；反手做空会亏钱。正确做法是等回调买入，而不是逆着强势做空。"}, {"q": "Price makes a higher high, but RSI makes a lower high. This is…", "opts": ["Bullish (bottom) divergence — buy", "A normal trend continuation", "Bearish (top) divergence — momentum not confirming", "A signal that RSI is broken"], "ans": 2, "why": "Price higher high + RSI lower high = bearish (top) divergence. The move is not confirmed by momentum, which in a range often precedes a reversal.", "why_zh": "价格创新高 + RSI 不创新高 = 顶背离（看跌）。这波上涨没有得到动能确认，在震荡市里往往预示着反转。"}, {"q": "RSI crossing above the 50 midline from below suggests…", "opts": ["The market is about to crash", "Bulls have taken control of the last 14 periods", "You should double your position", "The indicator is overbought"], "ans": 1, "why": "50 is where average gains equal average losses. A cross above it means buyers controlled the recent candles — momentum has shifted bullish. It is a trend filter, not an overbought reading.", "why_zh": "50 是平均涨幅等于平均跌幅的位置。站上 50 意味着最近 14 期由买方掌控——动能转多。它是趋势过滤器，不是超买信号。"}, {"q": "Which combination is the strongest RSI-based setup in a range?", "opts": ["RSI at 45 with no other context", "Price at resistance + bearish divergence + rejection candle", "RSI crossing 50 on M1", "RSI at 30 in a strong downtrend"], "ans": 1, "why": "RSI works as a confirmation filter: a level (resistance) + momentum warning (divergence) + price action (rejection candle) all agree. Context, level and confirmation — never the indicator alone.", "why_zh": "RSI 是确认过滤器：关键位（阻力）+ 动能警告（顶背离）+ 价格行为（拒绝 K 线）三者共振。背景 + 关键位 + 确认——绝不让指标单独做决定。"}];'''
pattern = re.compile(r'const EXAM_QUESTIONS = \[.*?\];', re.S)
html, subs = pattern.subn('const EXAM_QUESTIONS = ' + QUESTIONS, html, count=1)
assert subs == 1, 'EXAM_QUESTIONS not replaced'

# sanity: nothing from the old course should remain
for token in ['drawRecovery', 'drawStreak', 'drawLots', 'drawStopPlace', 'drawRR', 'drawExpect',
              'drawLeverage', 'drawDefense', 'Position Sizing', '风 控', 'R.0', 'recovery:drawRecovery',
              'mtj_exam_pass_10', 'Module 11', '亏损的不对称']:
    assert token not in html, 'stale token still present: ' + token

assert html.count('MTJ_EXAM_KEY = "mtj_exam_pass_18"') == 1
assert 'data-r="rsiLevels"' in html and 'data-r="rsiDivergence"' in html
assert 'data-r="rsiTrend"' in html and 'data-r="rsiPractice"' in html

open(DST, 'w', encoding='utf-8').write(html)
print('OK wrote', DST, len(html.encode('utf-8')), 'bytes')
