#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build MACD_Indicator_MakeTradesJourney.html from Risk_Management template."""
import sys

TPL = "/tmp/mtj/MTJ-Hub/courses/Risk_Management_MakeTradesJourney.html"
OUT = "/tmp/mtj/MTJ-Hub/courses/MACD_Indicator_MakeTradesJourney.html"

src = open(TPL, encoding="utf-8").read()
done = []

def rep(old, new, tag):
    global src
    c = src.count(old)
    if c != 1:
        print(f"FAIL [{tag}]: anchor count = {c}")
        print("  anchor head:", repr(old[:90]))
        sys.exit(1)
    src = src.replace(old, new, 1)
    done.append(tag)

# ---------- 1. title ----------
rep("<title>Risk Management &amp; Position Sizing &#183; Make Trades Journey</title>",
    "<title>MACD Indicator &#183; Make Trades Journey</title>", "title")

# ---------- 2. topbar live ----------
rep('<span class="dot"></span>Risk&nbsp;Course · Live',
    '<span class="dot"></span>MACD&nbsp;Indicator · Live', "topbar-live")

# ---------- 3. section nav ----------
rep("""<nav class="secnav">
  <a href="#agenda-sec"><span class="lbl">Overview · 总览</span><span class="pt"></span></a>
  <a href="#math"><span class="lbl">The Math · 亏损数学</span><span class="pt"></span></a>
  <a href="#sizing"><span class="lbl">Position Size · 仓位</span><span class="pt"></span></a>
  <a href="#stops"><span class="lbl">Stop Loss · 止损</span><span class="pt"></span></a>
  <a href="#rr"><span class="lbl">R:R · 盈亏比</span><span class="pt"></span></a>
  <a href="#leverage"><span class="lbl">Leverage · 杠杆</span><span class="pt"></span></a>
  <a href="#rules"><span class="lbl">Rules · 帐户风控</span><span class="pt"></span></a>
  <a href="#practice"><span class="lbl">Practice · 实战</span><span class="pt"></span></a>
</nav>""",
"""<nav class="secnav">
  <a href="#agenda-sec"><span class="lbl">Overview · 总览</span><span class="pt"></span></a>
  <a href="#layout"><span class="lbl">Anatomy · 结构</span><span class="pt"></span></a>
  <a href="#formula"><span class="lbl">Formula · 公式</span><span class="pt"></span></a>
  <a href="#cross"><span class="lbl">Crosses · 金叉死叉</span><span class="pt"></span></a>
  <a href="#hist"><span class="lbl">Histogram · 柱状图</span><span class="pt"></span></a>
  <a href="#zero"><span class="lbl">Zero Line · 零轴</span><span class="pt"></span></a>
  <a href="#divergence"><span class="lbl">Divergence · 背离</span><span class="pt"></span></a>
  <a href="#params"><span class="lbl">Parameters · 参数</span><span class="pt"></span></a>
  <a href="#trend"><span class="lbl">Trend · 趋势</span><span class="pt"></span></a>
  <a href="#misuse"><span class="lbl">Misuse · 误用</span><span class="pt"></span></a>
</nav>""", "secnav")

# ---------- 4. hero ----------
rep("""  <div class="course-tag">Trading Course · Required</div>
  <h1>Risk &amp;<br>Position Sizing</h1>
  <div class="h-zh">风 控 · 仓 位 计 算</div>
  <p class="h-sub">Entries make the story. Position size decides whether you're still here to tell it.
    <span class="zh">进场决定故事精不精彩，仓位决定你还在不在场上说这个故事。</span></p>""",
"""  <div class="course-tag">Module 20 · Trading Course</div>
  <h1>MACD<br>Indicator</h1>
  <div class="h-zh">移 动 平 均 收 敛 散 发</div>
  <p class="h-sub">One line. One signal. One histogram. The momentum engine every charting platform ships by default — and the most misread.
    <span class="zh">一条线、一条信号线、一组红绿柱。每个看盘软件默认自带的动能引擎——也是被误读最多的指标。</span></p>""", "hero")

# ---------- 5. agenda ----------
rep("""  <div class="agenda">
    <div class="card reveal"><div class="n">01</div><h3>The Math of Loss</h3><div class="zh">亏损的不对称 · 连亏是必然</div></div>
    <div class="card reveal"><div class="n">02</div><h3>Position Sizing</h3><div class="zh">手数怎么算 · 正确顺序</div></div>
    <div class="card reveal"><div class="n">03</div><h3>Stop Loss</h3><div class="zh">止损放哪 · 两种错误</div></div>
    <div class="card reveal"><div class="n">04</div><h3>R:R &amp; Expectancy</h3><div class="zh">盈亏比 · 期望值</div></div>
    <div class="card reveal"><div class="n">05</div><h3>Leverage</h3><div class="zh">杠杆的真相 · 保证金</div></div>
    <div class="card reveal"><div class="n">06</div><h3>Account Rules</h3><div class="zh">三道防线 · 每日停损</div></div>
  </div>""",
"""  <div class="agenda">
    <div class="card reveal"><div class="n">01</div><h3>MT5 MACD Anatomy</h3><div class="zh">附属窗长什么样 · 线+柱</div></div>
    <div class="card reveal"><div class="n">02</div><h3>The Formula</h3><div class="zh">快慢 EMA 之差 · 减两次</div></div>
    <div class="card reveal"><div class="n">03</div><h3>Golden &amp; Death Cross</h3><div class="zh">金叉死叉 · 线穿信号线</div></div>
    <div class="card reveal"><div class="n">04</div><h3>Histogram &amp; Zero Line</h3><div class="zh">柱状收缩 · 零轴多空</div></div>
    <div class="card reveal"><div class="n">05</div><h3>Divergence</h3><div class="zh">顶背离 · 底背离</div></div>
    <div class="card reveal"><div class="n">06</div><h3>Parameters &amp; Trend</h3><div class="zh">参数调整 · 顺势才有效</div></div>
  </div>""", "agenda")

# ---------- 6. intro note ----------
rep("""<section class="section reveal" style="padding-top:20px;padding-bottom:20px;">
  <div class="note" style="max-width:820px;line-height:1.9;">// Why this course comes before any strategy 为什么这课排在所有策略之前：
    you can lose money with a good entry and survive with a bad one — the variable that decides which,
    is <b>how much you put on</b>. Everything in this module is arithmetic, not opinion.
    <span class="zh">好的进场也可能亏钱，差的进场也可能活下来 —— 决定结果的变数是<b>你下了多大</b>。这一课全部是算术，没有个人意见。</span></div>
</section>""",
"""<section class="section reveal" style="padding-top:20px;padding-bottom:20px;">
  <div class="note" style="max-width:820px;line-height:1.9;">// MACD is the most-installed indicator on MT5 — and the most misread 为什么单独开一课讲 MACD：
    it measures <b>momentum</b>, not direction. Read correctly it tells you who is winning; read carelessly
    it fabricates signals inside every range. This module is about the second reading.
    <span class="zh">MACD 是 MT5 上安装率最高的指标，也是被误读最多的指标。它度量的是<b>动能</b>，不是方向。读对了，它告诉你谁在赢；读错了，它在每个震荡区间里给你造假信号。这一课讲的就是「怎么读对」。</span></div>
</section>""", "intro-note")

# ---------- 7. content sections (divider + sections + exam) ----------
CONTENT = """<!-- ================= PART 01 · ANATOMY ================= -->
<section class="divider">
  <div class="rail reveal">Part 01 · 第一部分</div>
  <h2 class="reveal">The Anatomy</h2>
  <div class="zh reveal">长 什 么 样</div>
</section>

<section class="section" id="layout">
  <div class="group-head reveal"><span class="tier">01</span>
    <div><div class="eyebrow">MT5 accessory window · 附属窗口</div><h2 class="title">What MT5's MACD Actually Draws</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">M.01</span><h3>One Line, One Signal, One Histogram<span class="zh">一条线 · 一条信号线 · 一组红绿柱</span></h3><span class="tag neu">MT5 layout MT5 界面</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="macdlayout"></div>
      <figcaption>MT5 MACD (12, 26, 9) in its accessory window<span class="zh">MT5 MACD(12,26,9) 附属窗口全景</span></figcaption></figure>
    <div class="pattern-desc">
      <p>On MT5, MACD lives in a <b>separate window below the price chart</b>. It draws exactly three things:
        the <b>MACD line</b> (fast EMA minus slow EMA), the <b>Signal line</b> (a smoothed MACD line), and
        red/green <b>histogram bars</b> growing around a horizontal zero axis.
        <span class="zh">在 MT5 上，MACD 显示在<b>价格图下方的独立附属窗口</b>里。它只画三样东西：<b>MACD 线</b>（快 EMA 减 慢 EMA）、<b>信号线</b>（MACD 线的平滑值）、以及围绕水平<b>零轴</b>生长的红绿<b>柱状图</b>。</span></p>
      <p>Because it has its own window, MACD has its <b>own scale</b> — a reading of +0.0035 is meaningless in
        dollars. It only matters relative to the indicator's own recent history.
        <span class="zh">因为有自己的窗口，MACD 有<b>自己的刻度</b>——+0.0035 换成美元毫无意义，它只有与指标自身近期历史比较时才有意义。</span></p>
      <ul class="points">
        <li><b>MACD line</b> — EMA(12) − EMA(26). Fast minus slow.<span class="zh">MACD 线：EMA(12) − EMA(26)，快线减慢线。</span></li>
        <li><b>Signal line</b> — EMA(9) of the MACD line. The cross partner.<span class="zh">信号线：MACD 线的 9 期 EMA，金叉死叉的配对对象。</span></li>
        <li><b>Histogram</b> — MACD line − Signal line. The gap, drawn as bars.<span class="zh">柱状图：MACD 线 − 信号线，把差距画成柱子。</span></li>
      </ul>
      <div class="note">// MT4's two-line MACD is a different animal. MT5 = one line + one signal + one histogram, in a single window.
        MT4 的双线 MACD 是另一种东西。MT5 = 一条线 + 一条信号 + 一组柱，全在一个窗口里。</div>
    </div>
  </article>
</section>

<section class="section" id="formula">
  <div class="group-head reveal"><span class="tier">02</span>
    <div><div class="eyebrow">The intuition · 公式直觉</div><h2 class="title">Three Averages, Stacked Twice</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">M.02</span><h3>Fast Minus Slow — Twice<span class="zh">快减慢，减两次</span></h3><span class="tag neu">Formula 公式</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="macdformula"></div>
      <figcaption>Step 1: EMA(12) − EMA(26) → MACD line. Step 2: line − signal → histogram<span class="zh">第一步：EMA(12) − EMA(26) = MACD 线；第二步：线 − 信号 = 柱状图</span></figcaption></figure>
    <div class="pattern-desc">
      <p>MACD subtracts a <b>slow</b> EMA(26) from a <b>fast</b> EMA(12). When price rises quickly the fast
        average runs above the slow one, so the difference is positive and growing. When momentum stalls,
        the gap narrows toward zero.
        <span class="zh">MACD 用<b>慢</b> EMA(26) 减去<b>快</b> EMA(12)。价格快速上涨时，快均线跑在慢均线上方，差值为正且不断变大；动能一停，差距就朝零收窄。</span></p>
      <p>The histogram then subtracts the signal — an EMA(9) of the line itself — from the MACD line.
        It measures the <b>acceleration</b> of the line, not its level.
        <span class="zh">柱状图再用 MACD 线减去信号线（线的 9 期 EMA）。它度量的是 MACD 线的<b>加速度</b>，不是它的水平。</span></p>
      <div class="calcbox">
        <div class="fx"><b>MACD Line</b><span class="op">=</span><b>EMA(12)</b><span class="op">−</span><b>EMA(26)</b></div>
        <div class="fx"><b>Signal</b><span class="op">=</span><b>EMA(9)</b> of MACD Line<span class="op">·</span><b>Histogram</b><span class="op">=</span><b>MACD Line</b><span class="op">−</span><b>Signal</b></div>
        <div class="cap">MACD 线 = EMA(12) − EMA(26)；信号线 = MACD 线的 EMA(9)；柱 = 线 − 信号</div>
      </div>
      <div class="note">// You never compute this by hand. But knowing the order — line, then signal, then histogram — tells you which piece reacts first. 你永远不用手算。但知道顺序——先有线、再有信号、最后有柱——你就知道谁先动。</div>
    </div>
  </article>
</section>

<!-- ================= PART 02 · THE SIGNALS ================= -->
<section class="divider">
  <div class="rail reveal">Part 02 · 第二部分</div>
  <h2 class="reveal">The Signals</h2>
  <div class="zh reveal">交 叉 与 柱</div>
</section>

<section class="section" id="cross">
  <div class="group-head reveal"><span class="tier">03</span>
    <div><div class="eyebrow">Crossovers · 交叉</div><h2 class="title">Golden Cross, Death Cross</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">M.03</span><h3>The Line Crossing the Signal<span class="zh">线穿过信号线</span></h3><span class="tag bull">Golden 金叉</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="macdcross"></div>
      <figcaption>Golden cross (bull) vs. death cross (bear)<span class="zh">金叉（多）vs. 死叉（空）</span></figcaption></figure>
    <div class="pattern-desc">
      <p>A <b>golden cross</b> happens when the MACD line cuts <b>up through</b> the signal line — momentum is
        picking up. A <b>death cross</b> is the mirror image: the line cuts down through the signal.
        <span class="zh"><b>金叉</b>是 MACD 线<b>向上穿过</b>信号线——动能正在增强。<b>死叉</b>正好相反：线向下穿过信号线。</span></p>
      <p>The crosses are the most-used MACD signal — and the most abused. They are <b>lagging</b>: both lines
        are averages, so a cross always confirms a move that has already started.
        <span class="zh">交叉是 MACD 最常用的信号——也是被滥用得最狠的。它们是<b>滞后的</b>：两条线都是均线，交叉发生永远是在行情已经启动之后。</span></p>
      <ul class="points">
        <li><b>Golden cross above zero</b> — momentum and trend agree. Stronger context.<span class="zh">零轴上方的金叉——动能与趋势同向，背景更强。</span></li>
        <li><b>Golden cross below zero</b> — a rebound inside a downtrend. Weaker.<span class="zh">零轴下方的金叉——下跌趋势中的反弹，较弱。</span></li>
        <li><b>Crosses inside a range</b> — they fire back and forth. Noise.<span class="zh">震荡区间里的交叉——来回触发，是噪音。</span></li>
      </ul>
      <div class="note">// A cross is a starting gun, not a finish line. It says momentum changed — it does not say the trade will win. 交叉是发令枪，不是终点线。它只说明动能变了，不保证这笔交易会赢。</div>
    </div>
  </article>
</section>

<section class="section" id="hist">
  <div class="group-head reveal"><span class="tier">04</span>
    <div><div class="eyebrow">Momentum decay · 动能衰减</div><h2 class="title">Shrinking Bars Are a Warning</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">M.04</span><h3>Read the Size of the Bars, Not Just Their Color<span class="zh">看柱子大小，别只看颜色</span></h3><span class="tag bear">Warning 预警</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="macdhist"></div>
      <figcaption>Histogram peaks, then contracts before the cross — momentum dies before the lines cross<span class="zh">柱状图见顶后先收缩，交叉还没发生动能就先熄火</span></figcaption></figure>
    <div class="pattern-desc">
      <p>The histogram is the difference between line and signal. When the bars <b>shrink toward zero</b>,
        the two lines are converging — the move is losing fuel <em>before</em> the lines actually cross.
        <span class="zh">柱是线与信号的差。当柱子<b>朝零收缩</b>时，两条线正在靠拢——在真正交叉之前，这波行情就已经在失去燃料了。</span></p>
      <p>Shrinking histogram on the same side as your trade is the earliest exit warning MACD gives you.
        It does not mean "reverse now" — it means the push is over; the follow-through is gone.
        <span class="zh">持仓方向上的柱子收缩，是 MACD 能给你的最早离场预警。它不是叫你「马上反手」——它只是说推力结束了，后续动能没了。</span></p>
      <ul class="points">
        <li><b>Growing bars</b> — momentum accelerating. The move has room.<span class="zh">柱子变大——动能加速，行情还有空间。</span></li>
        <li><b>Shrinking bars</b> — momentum decaying. Start managing the trade.<span class="zh">柱子变小——动能衰减，开始管理持仓。</span></li>
        <li><b>Bars flipping color</b> — the cross has happened. Old trend, new context.<span class="zh">柱子变色——交叉已经发生，趋势换挡。</span></li>
      </ul>
      <div class="note">// Treat shrinking bars as "the trend is getting tired", not as an instant sell signal. 把柱子收缩理解为「趋势累了」，而不是「立刻卖出」。</div>
    </div>
  </article>
</section>

<section class="section" id="zero">
  <div class="group-head reveal"><span class="tier">05</span>
    <div><div class="eyebrow">The zero axis · 零轴</div><h2 class="title">Above Zero, Below Zero — Who Is Winning</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">M.05</span><h3>The Zero Line Is the Bull/Bear Border<span class="zh">零轴就是多空分界</span></h3><span class="tag neu">Context 背景</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="macdzero"></div>
      <figcaption>MACD above zero = bulls in control · below zero = bears in control<span class="zh">零轴上方=多方控盘 · 零轴下方=空方控盘</span></figcaption></figure>
    <div class="pattern-desc">
      <p>When the MACD line is <b>above zero</b>, the fast EMA is above the slow EMA — recent average price
        sits above the older average, so the market is net bullish. Below zero is the mirror.
        <span class="zh">MACD 线在<b>零轴上方</b>时，快 EMA 高于慢 EMA——近期均价高于长期均价，市场整体偏多。零轴下方正好相反。</span></p>
      <p>Zero is the <b>context filter</b> for everything else: a golden cross above zero is a trend pullback
        resuming; the same cross below zero is a counter-trend bounce. Same shape, opposite meaning.
        <span class="zh">零轴是其他一切信号的<b>背景过滤器</b>：零轴上方的金叉是趋势回踩后延续；同一个金叉发生在零轴下方，只是逆势反弹。形状一样，含义相反。</span></p>
      <ul class="points">
        <li><b>Above zero</b> — favor longs. Crosses up are meaningful, crosses down are caution.<span class="zh">零轴上方——偏多。上叉有意义，下叉要警惕。</span></li>
        <li><b>Below zero</b> — favor shorts. Crosses down are meaningful, crosses up are bounces.<span class="zh">零轴下方——偏空。下叉有意义，上叉只是反弹。</span></li>
        <li><b>Around zero</b> — no side has control. Choppy. Stand aside.<span class="zh">贴着零轴——没有一方控盘，来回拉锯，观望。</span></li>
      </ul>
      <div class="note">// Zero answers "who is winning?". The crosses answer "when to act?". Never swap the two questions. 零轴回答「谁在赢」，交叉回答「何时动手」。别把这两个问题搞混。</div>
    </div>
  </article>
</section>

<!-- ================= PART 03 · DIVERGENCE ================= -->
<section class="divider">
  <div class="rail reveal">Part 03 · 第三部分</div>
  <h2 class="reveal">Divergence</h2>
  <div class="zh reveal">背 离</div>
</section>

<section class="section" id="divergence">
  <div class="group-head reveal"><span class="tier">06</span>
    <div><div class="eyebrow">Divergence · 背离</div><h2 class="title">Price Says One Thing, MACD Says Another</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">M.06</span><h3>Top &amp; Bottom Divergence<span class="zh">顶背离与底背离</span></h3><span class="tag bear">Warning 预警</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="macddiv"></div>
      <figcaption>Top divergence: price higher high + MACD lower high · bottom divergence: price lower low + MACD higher low<span class="zh">顶背离：价格更高高点配 MACD 更低高点 · 底背离：价格更低低点配 MACD 更高低点</span></figcaption></figure>
    <div class="pattern-desc">
      <p><b>Top divergence</b>: price prints a higher high, but MACD prints a lower high. Price is moving
        forward on fumes — the momentum behind the new high is weaker than the one before it.
        <span class="zh"><b>顶背离</b>：价格创出更高的高点，MACD 却走出更低的高点。价格是靠余气在冲——支撑新高点的动能比上一波弱。</span></p>
      <p><b>Bottom divergence</b> is the mirror at lows: price makes a lower low, MACD makes a higher low —
        sellers are exhausting. Both are <b>warnings, not triggers</b>: divergence tells you a move is
        losing conviction; the entry still needs confirmation (structure break, cross, and so on).
        <span class="zh"><b>底背离</b>是低点的镜像：价格创更低的低点，MACD 却走出更高的低点——卖方在衰竭。两者都只是<b>预警，不是触发信号</b>：背离告诉你行情正在失去底气；进场仍然需要确认（结构破位、交叉等）。</span></p>
      <ul class="points">
        <li><b>Classic divergence</b> — compare price swing points with MACD swing points.<span class="zh">经典背离——拿价格的摆动点跟 MACD 的摆动点比。</span></li>
        <li><b>Hidden divergence</b> — price higher low + MACD lower low: trend continuation, not reversal.<span class="zh">隐藏背离——价格更高的低点配 MACD 更低的低点：趋势延续，不是反转。</span></li>
        <li><b>In strong trends</b> — divergence can stay "wrong" for a long time. Context first.<span class="zh">强趋势里背离可以「错」很久，先看背景。</span></li>
      </ul>
      <div class="note">// Divergence on higher timeframes is worth far more than the same pattern on M5. 大周期的背离比 M5 上的同一个形态值钱得多。</div>
    </div>
  </article>
</section>

<!-- ================= PART 04 · CONTEXT & MISUSE ================= -->
<section class="divider">
  <div class="rail reveal">Part 04 · 第四部分</div>
  <h2 class="reveal">Context &amp; Misuse</h2>
  <div class="zh reveal">背 景 与 误 用</div>
</section>

<section class="section" id="params">
  <div class="group-head reveal"><span class="tier">07</span>
    <div><div class="eyebrow">MT5 settings · 参数设置</div><h2 class="title">12/26/9 vs 5/35/5 — What the Numbers Do</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">M.07</span><h3>Fast, Slow, Signal — Three Knobs<span class="zh">快线、慢线、信号——三个旋钮</span></h3><span class="tag neu">Settings 参数</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="macdparams"></div>
      <figcaption>Default (12,26,9) vs. more sensitive (5,35,5) on the same market<span class="zh">同一段行情：默认(12,26,9) vs. 更敏感(5,35,5)</span></figcaption></figure>
    <div class="pattern-desc">
      <p>The three numbers are <b>fast EMA period, slow EMA period, signal period</b>. Smaller fast/slow
        numbers track price more tightly — more crosses, more noise. Larger numbers smooth more — fewer,
        later, cleaner signals.
        <span class="zh">三个数字分别是<b>快线 EMA 周期、慢线 EMA 周期、信号线周期</b>。快慢线周期越小越贴价格——交叉更多、噪音更多；周期越大越平滑——信号更少、更晚、更干净。</span></p>
      <p>(5,35,5) reacts faster to reversals and produces far more crosses; (12,26,9) is the platform default
        for a reason — it sits between noise and lag. Changing parameters changes the <b>meaning</b> of every
        cross; backtest the pair you actually trade.
        <span class="zh">(5,35,5) 对反转反应更快，但交叉数量暴增；(12,26,9) 是平台默认值是有道理的——它正好在噪音与滞后之间。改参数等于改每个交叉的<b>含义</b>；用你真正交易的组合去回测。</span></p>
      <div class="cmp">
        <div class="col good">
          <div class="ch">✓ Default 12/26/9 · 默认参数</div>
          <ol>
            <li>Balanced — moderate cross count<span class="zh">均衡——交叉数量适中</span></li>
            <li>Works on H1 and above<span class="zh">适合 H1 及以上周期</span></li>
            <li>Fewer false crosses in ranges<span class="zh">震荡区假交叉较少</span></li>
          </ol>
        </div>
        <div class="col bad">
          <div class="ch">⚠ Custom 5/35/5 · 自调参数</div>
          <ol>
            <li>Fast line hugs price — many crosses<span class="zh">快线贴价格——交叉很多</span></li>
            <li>Better on scalping timeframes<span class="zh">适合超短周期</span></li>
            <li>More noise, needs a filter<span class="zh">噪音更大，必须配过滤器</span></li>
          </ol>
        </div>
      </div>
      <div class="note">// Changing only the signal period only changes the histogram's smoothing — it does not change the MACD line itself. 只改信号周期只影响柱状图的平滑，MACD 线本身不变。</div>
    </div>
  </article>
</section>

<section class="section" id="trend">
  <div class="group-head reveal"><span class="tier">08</span>
    <div><div class="eyebrow">Context · 背景</div><h2 class="title">MACD Works With the Trend, Not Against It</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">M.08</span><h3>Trend-Following Crosses Only<span class="zh">顺趋势的交叉才有效</span></h3><span class="tag bull">Trend 顺势</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="macdtrend"></div>
      <figcaption>The same golden cross: valid in an uptrend, false inside a range<span class="zh">同一个金叉：上升趋势里有效，震荡区间里是假的</span></figcaption></figure>
    <div class="pattern-desc">
      <p>MACD is a <b>momentum</b> indicator — it has no opinion about trend until you add one. The single
        biggest upgrade: only take golden crosses that agree with the higher-timeframe trend, and death
        crosses that agree with a downtrend. Counter-trend crosses are lottery tickets.
        <span class="zh">MACD 是<b>动能</b>指标——你不给它背景，它自己对趋势没有任何看法。最大的一次升级：只做与更大周期趋势一致的金叉、与下跌趋势一致的死叉。逆势交叉等于买彩票。</span></p>
      <p>How to filter: draw a trendline or check the 200 EMA on the higher timeframe. If the market is
        making higher highs and MACD sits above zero, a pullback golden cross is a high-quality entry.
        The same cross with price chopping sideways is a coin flip.
        <span class="zh">怎么过滤：在更大周期画趋势线或看 200 EMA。如果市场高点不断抬高、MACD 在零轴上方，回踩后的金叉就是高质量进场；同样的交叉发生在横盘里，等于抛硬币。</span></p>
      <ul class="points">
        <li><b>Uptrend + golden cross above zero</b> — trend pullback entry. Highest quality.<span class="zh">上升趋势 + 零轴上方金叉——趋势回踩进场，质量最高。</span></li>
        <li><b>Uptrend + golden cross below zero</b> — early reversal attempt. Wait for the zero cross.<span class="zh">上升趋势 + 零轴下方金叉——早期反转尝试，等它上零轴。</span></li>
        <li><b>Range + any cross</b> — false-signal factory. Stand aside or use only divergence.<span class="zh">震荡 + 任何交叉——假信号工厂，观望或只看背离。</span></li>
      </ul>
      <div class="note">// Ask first: "what is the higher timeframe doing?" — then let MACD time the entry inside it. 先问：「大周期在干嘛？」，再让 MACD 在它里面帮你择时。</div>
    </div>
  </article>
</section>

<section class="section" id="misuse">
  <div class="group-head reveal"><span class="tier">09</span>
    <div><div class="eyebrow">Common mistakes · 常见误用</div><h2 class="title">Why MACD Lies to Most People</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">M.09</span><h3>The False-Signal Machine in Ranges<span class="zh">震荡市里的假信号机器</span></h3><span class="tag bear">Warning 警示</span></div>
    <div class="pattern-desc">
      <p>In a ranging market, price oscillates around a value and MACD oscillates around zero —
        and every oscillation produces a cross. A sideways market can generate <b>dozens of golden and death
        crosses</b> in a week, each one a losing trade if you act on it.
        <span class="zh">震荡市里价格围绕一个中枢来回摆，MACD 也围绕零轴来回摆——每一次摆动都会产生一个交叉。横盘一周可以制造<b>几十个金叉死叉</b>，每一个都照着做就是一笔亏损。</span></p>
      <p>The fix is never a better MACD setting — it is <b>identifying the regime first</b>. If the market is
        ranging, MACD cross signals are noise by construction. Trade ranges with range tools, not momentum crosses.
        <span class="zh">解法从来不是调更好的参数，而是<b>先识别市场状态</b>。市场在震荡时，MACD 交叉信号从构造上就是噪音。震荡就用震荡工具，别用动能交叉。</span></p>
      <div class="cmp">
        <div class="col bad">
          <div class="ch">✕ How beginners use it · 新手用法</div>
          <ol>
            <li>Take every golden cross<span class="zh">每个金叉都做</span></li>
            <li>Ignore the zero line and the trend<span class="zh">不看零轴、不看趋势</span></li>
            <li>Call divergence "reversal confirmed"<span class="zh">把背离当成「反转确认」</span></li>
            <li>Change parameters after every loss<span class="zh">每亏一次就换参数</span></li>
          </ol>
          <div class="verdict">→ Gets chopped to pieces in ranges.<br>在震荡里被反复打脸。</div>
        </div>
        <div class="col good">
          <div class="ch">✓ How it's actually used · 正确用法</div>
          <ol>
            <li>Filter by trend and zero line first<span class="zh">先用趋势和零轴过滤</span></li>
            <li>Take crosses only with the trend<span class="zh">只做顺势的交叉</span></li>
            <li>Use divergence as a warning, confirm with structure<span class="zh">背离只当预警，用结构确认</span></li>
            <li>One setting, backtested, forever<span class="zh">一套参数，回测过，一直用</span></li>
          </ol>
          <div class="verdict">→ MACD becomes a timing tool inside a plan.<br>MACD 变成计划里的择时工具。</div>
        </div>
      </div>
      <div class="note">// The indicator is not broken. The context is missing. 指标没坏，是背景缺失。</div>
    </div>
  </article>
</section>

<!-- ================= EXAM MODULE 20 ================= -->
<section class="section" id="exam">
  <div class="group-head reveal">
    <span class="tier">EXAM</span>
    <div><div class="eyebrow">Final Exam · 毕业考试</div><h2 class="title">Pass the Final Quiz to Graduate<span class="zh">通过最终测验 · 课程毕业</span></h2></div>
  </div>
  <div class="note" style="max-width:820px;line-height:1.9;">
    Answer all 5 questions. You need <b>4 of 5 (70%)</b> to pass. Wrong answers are explained — read them, then retry.
    <span class="zh">回答全部 5 题。答对 <b>4 题（70%）</b> 即通过。答错的题会给出解析 —— 看完再试。</span>
  </div>
  <div id="examBox" style="max-width:820px;margin:0 auto;display:flex;flex-direction:column;gap:22px;"></div>
  <div style="max-width:820px;margin:26px auto 0;text-align:center;">
    <button id="examSubmit" onclick="gradeExam()" style="background:var(--gold);color:#0a0e14;border:none;border-radius:30px;padding:14px 40px;font-family:'Sora',sans-serif;font-weight:700;font-size:15px;cursor:pointer;letter-spacing:.05em;">Submit Answers · 提交答案</button>
    <div id="examResult" style="margin-top:22px;"></div>
  </div>
</section>

"""

start_a7 = "<!-- ================= PART 01 · THE MATH ================= -->"
end_a7 = "<!-- ================= CLOSING ================= -->"
i1 = src.index(start_a7); i2 = src.index(end_a7)
if i1 < 0 or i2 < 0 or i2 <= i1:
    print("FAIL [content]: anchors not found"); sys.exit(1)
src = src[:i1] + CONTENT + src[i2:]
done.append("content")

# ---------- 8. closing quote ----------
rep("""  <p class="quote">Amateurs think about how much they can <em>make</em>.<br>Professionals think about how much they can <em>lose</em>.</p>
  <div class="quote-zh">业余的人想的是能赚多少，专业的人想的是能亏多少。</div>
  <div class="verbs">
    <span>Risk First</span><span class="sep">·</span><span>Size Second</span><span class="sep">·</span><span>Entry Last</span>
  </div>""",
"""  <p class="quote">Momentum tells you who is <em>winning</em>.<br>Structure tells you whether the win <em>matters</em>.</p>
  <div class="quote-zh">动能告诉你谁在赢，结构告诉你这场胜利算不算数。</div>
  <div class="verbs">
    <span>Trend First</span><span class="sep">·</span><span>Divergence Second</span><span class="sep">·</span><span>Cross Last</span>
  </div>""", "closing")

# ---------- 9. footer copy ----------
rep("© <span id=\"yr\"></span> Make Trades Journey · By XRs Trading Lab · Risk Management &amp; Position Sizing",
    "© <span id=\"yr\"></span> Make Trades Journey · By XRs Trading Lab · MACD Indicator", "footer")

# ---------- 10. chart functions ----------
CHART_JS = r"""/* ============ MT5 MACD indicator charts ============ */
function genMACD(n,pf,ps,psig){
  const price=[];let v=100;
  for(let i=0;i<n;i++){
    v+=Math.sin(i*0.30)*0.8+Math.sin(i*0.13)*1.5+Math.sin(i*0.045+2)*2.2+(Math.random()-0.5)*0.35;
    price.push(v);
  }
  const ema=(arr,per)=>{const k=2/(per+1),out=[];let e=arr[0];arr.forEach(x=>{e=x*k+e*(1-k);out.push(e);});return out;};
  const ef=ema(price,pf),es=ema(price,ps);
  const macd=ef.map((e,i)=>e-es[i]);
  const sig=ema(macd,psig);
  return {price,macd,sig,hist:macd.map((m,i)=>m-sig[i])};
}
function pathFor(pts){return pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');}
function scaleFor(vals,padR){
  let mn=Math.min.apply(null,vals),mx=Math.max.apply(null,vals);
  const pad=(mx-mn)*padR;return {mn:mn-pad,mx:mx+pad};
}
function countCross(a,b){let c=0;for(let i=1;i<a.length;i++){if((a[i-1]-b[i-1])*(a[i]-b[i])<=0)c++;}return c;}

/* ============ 1. MT5 accessory-window layout ============ */
function drawMACDLayout(box){
  const W=720,H=300,L=34,R=24,T=30,B=26;
  const s=svgFor(box,W,H);
  const d=genMACD(60,12,26,9);
  const sc=scaleFor(d.macd.concat(d.sig).concat(d.hist),0.15);
  const plotW=W-L-R,plotH=H-T-B,n=d.macd.length;
  const X=i=>L+plotW*(i/(n-1));
  const Y=v=>T+(sc.mx-v)/(sc.mx-sc.mn)*plotH;
  const zeroY=Y(0);
  el('line',{x1:L,x2:L+plotW,y1:zeroY,y2:zeroY,stroke:C.muted2,'stroke-width':1.1,'stroke-dasharray':'6 4'},s);
  txt(s,L+4,zeroY-6,'0 · ZERO AXIS 零轴',{'font-size':9,fill:C.muted2,'letter-spacing':'.08em'});
  const bw=Math.max(plotW/n*0.6,2);
  d.hist.forEach((h,i)=>{
    const g=el('g',{style:'--i:'+Math.min(i,20)},s);
    const y=Y(Math.max(h,0));
    el('rect',{x:X(i)-bw/2,y:y,width:bw,height:Math.max(Math.abs(Y(h)-zeroY),1),rx:1,
      fill:h>=0?C.bull:C.bear,'fill-opacity':h>=0?.72:.66,class:'rbar'},g);
  });
  el('path',{d:pathFor(d.macd.map((v,i)=>[X(i),Y(v)])),stroke:C.gold,'stroke-width':2.2,class:'macdline'},s);
  el('path',{d:pathFor(d.sig.map((v,i)=>[X(i),Y(v)])),stroke:C.cyan,'stroke-width':1.7,class:'macdline',style:'transition-delay:.4s'},s);
  txt(s,L,16,'MACD (12, 26, 9)',{'font-size':11,fill:C.goldB,'font-weight':700,'letter-spacing':'.1em'});
  el('line',{x1:L+128,x2:L+146,y1:12,y2:12,stroke:C.gold,'stroke-width':2.4},s);
  txt(s,L+150,16,'MACD line',{'font-size':9,fill:C.muted});
  el('line',{x1:L+224,x2:L+242,y1:12,y2:12,stroke:C.cyan,'stroke-width':2.4},s);
  txt(s,L+246,16,'Signal',{'font-size':9,fill:C.muted});
  el('rect',{x:L+296,y:8,width:10,height:8,rx:2,fill:C.bull,'fill-opacity':.72},s);
  el('rect',{x:L+310,y:8,width:10,height:8,rx:2,fill:C.bear,'fill-opacity':.66},s);
  txt(s,L+324,16,'Histogram',{'font-size':9,fill:C.muted});
  txt(s,L+plotW/2,zeroY-14,'ABOVE ZERO = BULLS 零轴上方 = 多方控盘',{'text-anchor':'middle','font-size':9.5,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:23'});
  txt(s,L+plotW/2,zeroY+22,'BELOW ZERO = BEARS 零轴下方 = 空方控盘',{'text-anchor':'middle','font-size':9.5,fill:C.bear,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:24'});
}

/* ============ 2. formula chain ============ */
function drawMACDFormula(box){
  const W=720,H=216,L=14,T=14;
  const s=svgFor(box,W,H);
  const d=genMACD(30,12,26,9),n=d.macd.length;
  const sc=scaleFor(d.macd,0.18);
  const bx=[L,L+186,L+356],bw=[162,160,220],bh=150;
  const X=i=>bx[1]+30+bw[1]*0.62*(i/(n-1));
  const Y=v=>T+38+(sc.mx-v)/(sc.mx-sc.mn)*82;
  /* panel A: inputs */
  el('rect',{x:bx[0],y:T,width:bw[0],height:bh,rx:14,fill:'rgba(255,255,255,.016)',stroke:'rgba(232,200,119,.12)'},s);
  txt(s,bx[0]+16,T+20,'STEP 1 · 第一步',{'font-size':9.5,fill:C.goldD,'letter-spacing':'.18em'});
  el('rect',{x:bx[0]+16,y:T+36,width:12,height:12,rx:3,fill:C.gold,'fill-opacity':.85},s);
  txt(s,bx[0]+36,T+47,'EMA(12) 快线',{'font-size':11,fill:C.text,'font-family':"'Noto Sans SC',sans-serif"});
  el('rect',{x:bx[0]+16,y:T+60,width:12,height:12,rx:3,fill:C.muted,'fill-opacity':.8},s);
  txt(s,bx[0]+36,T+71,'EMA(26) 慢线',{'font-size':11,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,bx[0]+16,T+104,'FAST − SLOW',{'font-size':10,fill:C.muted2,'letter-spacing':'.1em'});
  txt(s,bx[0]+16,T+122,'快线减慢线',{'font-size':10,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,bx[0]+bw[0]/2,T+bh+12,'−',{'text-anchor':'middle','font-size':20,fill:C.goldB,'font-weight':700});
  /* panel B: MACD line sparkline */
  el('rect',{x:bx[1],y:T,width:bw[1],height:bh,rx:14,fill:'rgba(255,255,255,.016)',stroke:'rgba(232,200,119,.12)'},s);
  txt(s,bx[1]+16,T+20,'= MACD LINE 线',{'font-size':9.5,fill:C.gold,'letter-spacing':'.12em'});
  el('path',{d:pathFor(d.macd.map((v,i)=>[X(i),Y(v)])),stroke:C.gold,'stroke-width':2.2,class:'macdline'},s);
  el('line',{x1:bx[1]+30,x2:bx[1]+30+bw[1]*0.62,y1:Y(0),y2:Y(0),stroke:C.muted2,'stroke-width':1,'stroke-dasharray':'4 4'},s);
  txt(s,bx[1]+16,T+bh-16,'EMA12 − EMA26',{'font-size':10,fill:C.muted2});
  /* arrow */
  txt(s,bx[1]+bw[1]+6,T+bh/2,'→',{'font-size':20,fill:C.goldD,'font-weight':700});
  /* panel C: histogram bars */
  el('rect',{x:bx[2],y:T,width:bw[2],height:bh,rx:14,fill:'rgba(255,255,255,.016)',stroke:'rgba(232,200,119,.12)'},s);
  txt(s,bx[2]+16,T+20,'= HISTOGRAM 柱状图',{'font-size':9.5,fill:C.gold,'letter-spacing':'.12em'});
  const hsc=scaleFor(d.hist,0.2),hbw=bw[2]*0.6/30;
  const HX=i=>bx[2]+20+bw[2]*0.6*(i/(n-1));
  const HY=v=>T+44+(hsc.mx-v)/(hsc.mx-hsc.mn)*86;
  const hz=HY(0);
  el('line',{x1:bx[2]+20,x2:bx[2]+20+bw[2]*0.6,y1:hz,y2:hz,stroke:C.muted2,'stroke-width':1,'stroke-dasharray':'4 4'},s);
  d.hist.forEach((h,i)=>{
    const g=el('g',{style:'--i:'+Math.min(i,18)},s);
    const y=HY(Math.max(h,0));
    el('rect',{x:HX(i)-hbw/2,y:y,width:hbw,height:Math.max(Math.abs(HY(h)-hz),1),rx:1,
      fill:h>=0?C.bull:C.bear,'fill-opacity':h>=0?.72:.66,class:'rbar'},g);
  });
  txt(s,bx[2]+16,T+bh-16,'LINE − SIGNAL 线减信号',{'font-size':10,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,W/2,H-8,'Build order: line → signal → histogram. 顺序：先有线，再有信号，最后有柱。',
    {'text-anchor':'middle','font-size':10,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 3. golden / death cross ============ */
function drawMACDCross(box){
  const W=720,H=276,L=14,T=30,R=14,B=14;
  const s=svgFor(box,W,H);
  const gm=[-4.0,-3.6,-3.1,-2.6,-2.1,-1.6,-1.2,-0.9,-0.7,-0.55,-0.45,-0.35,-0.25,-0.12,0.0,0.2,0.5,0.85,1.2,1.6,2.0,2.4,2.7,2.9,3.0,2.9,2.7,2.4];
  const gs=[-2.5,-2.1,-1.7,-1.3,-1.0,-0.8,-0.65,-0.5,-0.35,-0.22,-0.12,-0.05,0.0,0.02,0.0,-0.05,-0.1,-0.05,0.1,0.35,0.7,1.1,1.5,1.9,2.3,2.6,2.7,2.55];
  const dm=gs.map(v=>-v),ds=gm.map(v=>-v);
  const pw=(W-L-R-12)/2,n=gm.length;
  function panel(px,title,ln,sg,verdict,col,arrowUp){
    const sc=scaleFor(ln.concat(sg),0.12);
    const plotW=pw-36,plotH=H-T-B-14;
    const X=i=>px+26+plotW*(i/(n-1));
    const Y=v=>T+8+(sc.mx-v)/(sc.mx-sc.mn)*plotH;
    const zeroY=Y(0);
    el('line',{x1:px+26,x2:px+26+plotW,y1:zeroY,y2:zeroY,stroke:C.muted2,'stroke-width':1,'stroke-dasharray':'5 4'},s);
    const diffs=ln.map((v,i)=>v-sg[i]);
    const bw=Math.max(plotW/n*0.62,1.5);
    diffs.forEach((h,i)=>{
      const g=el('g',{style:'--i:'+Math.min(i,16)},s);
      const y=Y(Math.max(h,0));
      el('rect',{x:X(i)-bw/2,y:y,width:bw,height:Math.max(Math.abs(Y(h)-zeroY),1),rx:1,
        fill:h>=0?C.bull:C.bear,'fill-opacity':h>=0?.68:.62,class:'rbar'},g);
    });
    el('path',{d:pathFor(ln.map((v,i)=>[X(i),Y(v)])),stroke:C.gold,'stroke-width':2.2,class:'macdline'},s);
    el('path',{d:pathFor(sg.map((v,i)=>[X(i),Y(v)])),stroke:C.cyan,'stroke-width':1.7,class:'macdline',style:'transition-delay:.35s'},s);
    let ci=-1;
    for(let i=1;i<n;i++){const a=diffs[i-1],b=diffs[i];if(a*b<=0){ci=i;break;}}
    const cxp=X(ci),cyp=Y(ln[ci]);
    el('line',{x1:cxp,x2:cxp,y1:Y(sc.mx),y2:Y(sc.mn),stroke:col,'stroke-width':1.1,'stroke-dasharray':'3 3',class:'rlbl',style:'--i:20'},s);
    const cg=el('g',{style:'--i:21'},s);
    el('circle',{cx:cxp,cy:cyp,r:6,fill:col,'fill-opacity':.25,stroke:col,'stroke-width':2,class:'rlbl'},cg);
    el('path',{d:arrowUp?'M'+cxp+' '+(cyp+16)+' l-6 -9 M'+cxp+' '+(cyp+16)+' l6 -9':'M'+cxp+' '+(cyp-16)+' l-6 9 M'+cxp+' '+(cyp-16)+' l6 9',
      stroke:col,'stroke-width':2.2,'fill':'none','stroke-linecap':'round',class:'rlbl',style:'--i:22'},cg);
    txt(s,px+26+plotW/2,T+plotH+22,title,{'text-anchor':'middle','font-size':10.5,fill:col,'font-weight':700,'letter-spacing':'.14em'});
    txt(s,px+26+plotW/2,T+plotH+37,verdict,{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
    txt(s,px+26+plotW/2,T-2,'LINE 线 / SIGNAL 信号',{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'letter-spacing':'.12em'});
  }
  panel(L,'GOLDEN CROSS 金叉','momentum turning up 动能转强','bull',true);
  panel(L+pw+12,'DEATH CROSS 死叉','momentum turning down 动能转弱','bear',false);
}

/* ============ 4. histogram contraction ============ */
function drawMACDHist(box){
  const W=720,H=262,L=30,R=24,T=28,B=24;
  const s=svgFor(box,W,H);
  const hist=[0.1,0.25,0.5,0.8,1.2,1.6,2.0,2.35,2.6,2.75,2.8,2.75,2.6,2.4,2.15,1.85,1.55,1.25,0.95,0.7,0.5,0.35,0.25,0.18,0.14,0.1,0.05,0.0,-0.1,-0.3,-0.55,-0.8,-1.0,-1.05,-0.95,-0.75,-0.5,-0.3,-0.15,-0.05,0.0,0.05,0.1,0.12];
  const macd=[-3.6,-3.4,-3.1,-2.7,-2.2,-1.7,-1.2,-0.7,-0.3,0.05,0.35,0.6,0.85,1.1,1.35,1.6,1.85,2.1,2.3,2.5,2.7,2.85,3.0,3.15,3.3,3.4,3.5,3.58,3.62,3.6,3.55,3.48,3.4,3.3,3.2,3.1,3.0,2.9,2.82,2.75,2.7,2.66,2.63,2.6];
  const sig=macd.map((m,i)=>m-hist[i]);
  const n=hist.length;
  const sc=scaleFor(macd.concat(sig),0.12);
  const plotW=W-L-R,plotH=H-T-B;
  const X=i=>L+plotW*(i/(n-1));
  const Y=v=>T+(sc.mx-v)/(sc.mx-sc.mn)*plotH;
  const zeroY=Y(0);
  const peak=10,crossIdx=27;
  el('rect',{x:X(peak),y:T,width:X(crossIdx)-X(peak),height:plotH,fill:'rgba(255,92,99,.05)',class:'rbar',style:'--i:2'},s);
  const bw=Math.max(plotW/n*0.6,2);
  hist.forEach((h,i)=>{
    const g=el('g',{style:'--i:'+Math.min(i,20)},s);
    const y=Y(Math.max(h,0));
    el('rect',{x:X(i)-bw/2,y:y,width:bw,height:Math.max(Math.abs(Y(h)-zeroY),1),rx:1,
      fill:h>=0?C.bull:C.bear,'fill-opacity':h>=0?.7:.64,class:'rbar'},g);
  });
  el('path',{d:pathFor(macd.map((v,i)=>[X(i),Y(v)])),stroke:C.gold,'stroke-width':2.2,class:'macdline'},s);
  el('path',{d:pathFor(sig.map((v,i)=>[X(i),Y(v)])),stroke:C.cyan,'stroke-width':1.7,class:'macdline',style:'transition-delay:.4s'},s);
  el('line',{x1:L,x2:L+plotW,y1:zeroY,y2:zeroY,stroke:C.muted2,'stroke-width':1,'stroke-dasharray':'6 4'},s);
  /* peak marker */
  el('line',{x1:X(peak),x2:X(peak),y1:T,y2:T+plotH,stroke:C.gold,'stroke-width':1.1,'stroke-dasharray':'3 3',class:'rlbl',style:'--i:22'},s);
  txt(s,X(peak),T+16,'PEAK 动能顶峰',{'text-anchor':'middle','font-size':9.5,fill:C.goldB,'font-weight':700,class:'rlbl',style:'--i:22'});
  txt(s,(X(peak)+X(crossIdx))/2,T+34,'MOMENTUM DECAY 动能衰减区',{'text-anchor':'middle','font-size':9.5,fill:C.bear,'font-weight':700,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:23'});
  txt(s,X(crossIdx),zeroY-12,'CROSS 交叉',{'text-anchor':'middle','font-size':9.5,fill:C.cyan,'font-weight':700,class:'rlbl',style:'--i:24'});
  txt(s,L+plotW/2,H-6,'Bars shrink toward zero before the lines cross — momentum dies first. 柱子先朝零收缩，线才交叉——动能先熄火。',
    {'text-anchor':'middle','font-size':10,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 5. zero line zones ============ */
function drawMACDZero(box){
  const W=720,H=250,L=30,R=24,T=30,B=24;
  const s=svgFor(box,W,H);
  const z=[-3.2,-3.0,-2.8,-2.5,-2.2,-1.9,-1.6,-1.35,-1.1,-0.9,-0.7,-0.55,-0.42,-0.3,-0.2,-0.12,-0.05,0.04,0.14,0.26,0.4,0.58,0.78,1.0,1.24,1.5,1.75,2.0,2.25,2.5,2.7,2.85,2.95,3.0,3.0,2.95,2.85,2.7,2.55,2.4];
  const n=z.length;
  const sc=scaleFor(z,0.12);
  const plotW=W-L-R,plotH=H-T-B;
  const X=i=>L+plotW*(i/(n-1));
  const Y=v=>T+(sc.mx-v)/(sc.mx-sc.mn)*plotH;
  const zeroY=Y(0);
  el('rect',{x:L,y:T,width:plotW,height:zeroY-T,fill:'rgba(44,217,138,.05)'},s);
  el('rect',{x:L,y:zeroY,width:plotW,height:T+plotH-zeroY,fill:'rgba(255,92,99,.05)'},s);
  el('line',{x1:L,x2:L+plotW,y1:zeroY,y2:zeroY,stroke:C.goldB,'stroke-width':1.6},s);
  txt(s,L+8,T+14,'BULLS IN CONTROL 多方控盘',{'font-size':10,fill:C.bull,'font-weight':700,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:2'});
  txt(s,L+8,T+plotH-6,'BEARS IN CONTROL 空方控盘',{'font-size':10,fill:C.bear,'font-weight':700,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:3'});
  /* small bars consistent with line sign */
  const bw=Math.max(plotW/n*0.55,2);
  z.forEach((v,i)=>{
    const g=el('g',{style:'--i:'+Math.min(i,18)},s);
    const hv=v*0.16;
    const y=Y(Math.max(hv,0));
    el('rect',{x:X(i)-bw/2,y:y,width:bw,height:Math.max(Math.abs(Y(hv)-zeroY),1),rx:1,
      fill:hv>=0?C.bull:C.bear,'fill-opacity':hv>=0?.5:.45,class:'rbar'},g);
  });
  el('path',{d:pathFor(z.map((v,i)=>[X(i),Y(v)])),stroke:C.gold,'stroke-width':2.2,class:'macdline'},s);
  /* zero cross marker */
  let zi=-1;for(let i=1;i<n;i++){if(z[i-1]*z[i]<=0){zi=i;break;}}
  el('line',{x1:X(zi),x2:X(zi),y1:T,y2:T+plotH,stroke:C.gold,'stroke-width':1.1,'stroke-dasharray':'3 3',class:'rlbl',style:'--i:20'},s);
  const cg=el('g',{style:'--i:21'},s);
  el('circle',{cx:X(zi),cy:zeroY,r:6,fill:C.goldB,'fill-opacity':.25,stroke:C.goldB,'stroke-width':2,class:'rlbl'},cg);
  txt(s,X(zi),zeroY-12,'ZERO CROSS 上穿零轴',{'text-anchor':'middle','font-size':9.5,fill:C.goldB,'font-weight':700,class:'rlbl',style:'--i:22'});
  txt(s,L+plotW/2,H-6,'Zero is the border: line above = net buyers, below = net sellers. 零轴是分界线：线在上方=净买方，在下方=净卖方。',
    {'text-anchor':'middle','font-size':10,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 6. divergence ============ */
function drawMACDDiv(box){
  const W=720,H=330,L=14,T=26,R=14,B=10;
  const s=svgFor(box,W,H);
  const pw=(W-L-R-12)/2;
  const px=[100,101,102.5,103,102,101.5,102,103.5,104,104.8,105.2,104.5,103.8,104.2,105.3,106,106.4];
  const mx=[0.5,0.9,1.4,1.7,1.5,1.2,1.0,1.3,1.6,1.9,2.2,1.8,1.4,1.2,1.5,1.75,1.6];
  const py=[100,99,98,97.5,98,98.5,97.8,96.8,96,95.5,96,96.6,95.8,94.9,94.2,93.8];
  const my=[0,-0.4,-1.0,-1.8,-1.6,-1.2,-0.95,-1.1,-1.35,-1.5,-1.55,-1.35,-1.2,-1.35,-1.5,-1.5];
  function panel(x,price,macd,title,zh,verdict,ph1,ph2,mh1,mh2,up){
    el('rect',{x:x,y:T,width:pw,height:H-T-B,rx:14,fill:'rgba(255,255,255,.016)',stroke:'rgba(232,200,119,.12)'},s);
    txt(s,x+16,T+18,title,{'font-size':10.5,fill:C.text,'font-weight':700,'letter-spacing':'.12em'});
    txt(s,x+16,T+33,zh,{'font-size':9.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
    /* price plot */
    const psc=scaleFor(price,0.08);
    const X=i=>x+18+pw*0.5*(i/(price.length-1));
    const PY=v=>T+52+(psc.mx-v)/(psc.mx-psc.mn)*74;
    el('path',{d:pathFor(price.map((v,i)=>[X(i),PY(v)])),stroke:C.text,'stroke-width':2,class:'macdline'},s);
    el('line',{x1:X(ph1),x2:X(ph2),y1:PY(price[ph1]),y2:PY(price[ph2]),stroke:C.text,'stroke-width':1.1,'stroke-dasharray':'4 4','stroke-opacity':.6,class:'rlbl',style:'--i:8'},s);
    [ph1,ph2].forEach((hi,i)=>{
      const g=el('g',{style:'--i:'+(9+i)},s);
      el('circle',{cx:X(hi),cy:PY(price[hi]),r:4.5,fill:C.text,class:'rlbl'},g);
      txt(g,X(hi),PY(price[hi])+(up?-12:16),up?(i?'HH 更高高点':'H1'):(i?'LL 更低低点':'L1'),
        {'text-anchor':'middle','font-size':8.5,fill:C.text,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
    });
    txt(s,x+pw*0.25,T+140,'PRICE 价格',{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'letter-spacing':'.12em'});
    /* macd plot */
    const msc=scaleFor(macd,0.12);
    const MX=i=>x+18+pw*0.5*(i/(macd.length-1));
    const MY=v=>T+152+(msc.mx-v)/(msc.mx-msc.mn)*74;
    el('line',{x1:x+18,x2:x+18+pw*0.5,y1:MY(0),y2:MY(0),stroke:C.muted2,'stroke-width':1,'stroke-dasharray':'5 4'},s);
    el('path',{d:pathFor(macd.map((v,i)=>[MX(i),MY(v)])),stroke:C.gold,'stroke-width':2,class:'macdline'},s);
    el('line',{x1:MX(mh1),x2:MX(mh2),y1:MY(macd[mh1]),y2:MY(macd[mh2]),stroke:C.gold,'stroke-width':1.1,'stroke-dasharray':'4 4','stroke-opacity':.6,class:'rlbl',style:'--i:10'},s);
    [mh1,mh2].forEach((hi,i)=>{
      const g=el('g',{style:'--i:'+(11+i)},s);
      el('circle',{cx:MX(hi),cy:MY(macd[hi]),r:4.5,fill:C.gold,class:'rlbl'},g);
      txt(g,MX(hi),MY(macd[hi])+(up?-12:16),up?(i?'LH 更低高点':'M1'):(i?'HL 更高低点':'M1'),
        {'text-anchor':'middle','font-size':8.5,fill:C.gold,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
    });
    txt(s,x+pw*0.25,T+240,'MACD',{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'letter-spacing':'.12em'});
    const tag=el('g',{style:'--i:13'},s);
    el('rect',{x:x+16,y:T+252,width:pw-32,height:34,rx:9,fill:up?'rgba(255,92,99,.09)':'rgba(44,217,138,.09)',
      stroke:up?'rgba(255,92,99,.4)':'rgba(44,217,138,.4)',class:'rlbl'},tag);
    txt(s,x+pw/2,T+265,verdict,{'text-anchor':'middle','font-size':10.5,fill:up?C.bear:C.bull,'font-weight':700,class:'rlbl'});
    txt(s,x+pw/2,T+280,up?'WARNING · NOT A TRIGGER 预警 · 不是触发':'WARNING · NOT A TRIGGER 预警 · 不是触发',
      {'text-anchor':'middle','font-size':8.5,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  }
  panel(L,px,mx,'TOP DIVERGENCE 顶背离','price HH + MACD LH 价格更高高点 · MACD 更低高点','PRICE HIGHER HIGH, MACD LOWER HIGH 价格新高，动能不新高',10,16,10,16,true);
  panel(L+pw+12,py,my,'BOTTOM DIVERGENCE 底背离','price LL + MACD HL 价格更低低点 · MACD 更高低点','PRICE LOWER LOW, MACD HIGHER LOW 价格新低，动能不新低',3,15,3,15,false);
}

/* ============ 7. parameter comparison ============ */
function drawMACDParams(box){
  const W=720,H=252,L=30,R=20,T=28,B=26;
  const s=svgFor(box,W,H);
  const d1=genMACD(50,12,26,9),d2=genMACD(50,5,35,5);
  const c1=countCross(d1.macd,d1.sig),c2=countCross(d2.macd,d2.sig);
  const sc=scaleFor(d1.macd.concat(d2.macd),0.15);
  const plotW=W-L-R,plotH=H-T-B,n=d1.macd.length;
  const X=i=>L+plotW*(i/(n-1));
  const Y=v=>T+(sc.mx-v)/(sc.mx-sc.mn)*plotH;
  const zeroY=Y(0);
  el('line',{x1:L,x2:L+plotW,y1:zeroY,y2:zeroY,stroke:C.muted2,'stroke-width':1,'stroke-dasharray':'6 4'},s);
  el('path',{d:pathFor(d1.macd.map((v,i)=>[X(i),Y(v)])),stroke:C.gold,'stroke-width':2.4,class:'macdline'},s);
  el('path',{d:pathFor(d2.macd.map((v,i)=>[X(i),Y(v)])),stroke:C.cyan,'stroke-width':1.5,class:'macdline',style:'transition-delay:.35s'},s);
  /* cross markers on the fast line */
  d2.macd.forEach((v,i)=>{
    if(i>0&&(d2.macd[i-1]-d2.sig[i-1])*(v-d2.sig[i])<=0){
      const g=el('g',{style:'--i:18'},s);
      el('circle',{cx:X(i),cy:Y(v),r:3,fill:C.cyan,'fill-opacity':.9,class:'rlbl'},g);
    }
  });
  txt(s,L,16,'DEFAULT 默认 12/26/9',{'font-size':10.5,fill:C.gold,'font-weight':700,'letter-spacing':'.08em'});
  el('line',{x1:L+150,x2:L+168,y1:12,y2:12,stroke:C.gold,'stroke-width':2.4},s);
  txt(s,L+172,16,c1+' crosses 次交叉',{'font-size':9.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L+286,16,'FAST 快速 5/35/5',{'font-size':10.5,fill:C.cyan,'font-weight':700,'letter-spacing':'.08em'});
  el('line',{x1:L+410,x2:L+428,y1:12,y2:12,stroke:C.cyan,'stroke-width':2.4},s);
  txt(s,L+432,16,c2+' crosses 次交叉 · dots=每叉',{'font-size':9.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L+plotW/2,H-8,'Same market, two settings — smaller periods cross more and earlier. 同一段行情、两套参数——周期越小交叉越多越早。',
    {'text-anchor':'middle','font-size':10,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 8. trend vs range ============ */
function drawMACDTrend(box){
  const W=720,H=320,L=14,T=26,R=14,B=10;
  const s=svgFor(box,W,H);
  const pw=(W-L-R-12)/2;
  function panel(x,title,zh,price,macd,trendLine){
    el('rect',{x:x,y:T,width:pw,height:H-T-B,rx:14,fill:'rgba(255,255,255,.016)',stroke:'rgba(232,200,119,.12)'},s);
    txt(s,x+16,T+18,title,{'font-size':10.5,fill:C.text,'font-weight':700,'letter-spacing':'.1em'});
    txt(s,x+16,T+33,zh,{'font-size':9.5,fill:C.muted,'font-family':"'Noto Sans SC',sans-serif"});
    const n=price.length;
    const psc=scaleFor(price,0.08);
    const X=i=>x+18+pw*0.58*(i/(n-1));
    const PY=v=>T+52+(psc.mx-v)/(psc.mx-psc.mn)*72;
    el('path',{d:pathFor(price.map((v,i)=>[X(i),PY(v)])),stroke:C.text,'stroke-width':2,class:'macdline'},s);
    if(trendLine){
      el('line',{x1:X(0),y1:PY(price[0]),x2:X(n-1),y2:PY(price[n-1]),stroke:C.gold,'stroke-width':1.4,'stroke-dasharray':'6 4','stroke-opacity':.8,class:'rlbl',style:'--i:6'},s);
    }
    txt(s,x+pw*0.29,T+134,'PRICE 价格',{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'letter-spacing':'.12em'});
    const msc=scaleFor(macd,0.15);
    const MX=i=>x+18+pw*0.58*(i/(n-1));
    const MY=v=>T+150+(msc.mx-v)/(msc.mx-msc.mn)*76;
    el('line',{x1:x+18,x2:x+18+pw*0.58,y1:MY(0),y2:MY(0),stroke:C.muted2,'stroke-width':1,'stroke-dasharray':'5 4'},s);
    el('path',{d:pathFor(macd.map((v,i)=>[MX(i),MY(v)])),stroke:C.gold,'stroke-width':2,class:'macdline'},s);
    return {X:MX,Y:MY,baseY:MY(0)};
  }
  /* left: uptrend */
  const upP=[100,101,100.5,102,103,102.5,104,105.5,105,106,107.5,108,107.5,109,110.5,112];
  const upM=[-1.2,-1.0,-0.8,-0.6,-0.4,-0.2,0.05,0.3,0.6,0.9,1.2,1.5,1.8,2.1,2.4,2.7];
  const upS=upM.map((v,i)=>v+[0.6,0.55,0.5,0.45,0.4,0.35,0.3,0.25,0.2,0.15,0.1,0.05,0.0,-0.05,-0.1,-0.15][i]);
  const A=panel(L,'UPTREND + GOLDEN CROSS 上升趋势 + 金叉','顺趋势回踩 · 零轴上方金叉',upP,upM,true);
  const upn=upM.length;
  const upX=i=>L+18+pw*0.58*(i/(upn-1));
  const upSc=scaleFor(upM,0.15);
  const upY=v=>T+150+(upSc.mx-v)/(upSc.mx-upSc.mn)*76;
  let ui=-1;for(let i=1;i<upn;i++){if((upM[i-1]-upS[i-1])*(upM[i]-upS[i])<=0){ui=i;break;}}
  el('path',{d:pathFor(upS.map((v,i)=>[upX(i),upY(v)])),stroke:C.cyan,'stroke-width':1.6,class:'macdline',style:'transition-delay:.4s'},s);
  const ug=el('g',{style:'--i:14'},s);
  el('circle',{cx:upX(ui),cy:upY(upM[ui]),r:5,fill:C.bull,'fill-opacity':.3,stroke:C.bull,'stroke-width':2,class:'rlbl'},ug);
  txt(s,upX(ui),upY(upM[ui])-12,'✓',{'text-anchor':'middle','font-size':14,fill:C.bull,'font-weight':700,class:'rlbl'});
  txt(s,L+pw/2,T+272,'VALID — WITH THE TREND 顺势有效',{'text-anchor':'middle','font-size':10,fill:C.bull,'font-weight':700,'letter-spacing':'.08em',class:'rlbl',style:'--i:15'});
  txt(s,L+pw/2,T+288,'golden cross above zero 零轴上方金叉',{'text-anchor':'middle','font-size':9,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:15'});
  /* right: range */
  const rP=[100,101,99.5,100.8,99.2,101.2,99,100.6,99.4,101,99.3,100.8,99.5,101.1,99.4,100.5];
  const rM=[-0.6,0.2,-0.4,0.5,-0.3,0.4,-0.5,0.3,-0.2,0.4,-0.4,0.3,-0.5,0.4,-0.3,0.2];
  const rS=rM.map(v=>v-0.15);
  const Bx=L+pw+12;
  const RB=panel(Bx,'RANGE + CROSSES 震荡区间 + 交叉','横盘来回摆 · 假信号工厂',rP,rM,false);
  const rn=rM.length;
  const rX=i=>Bx+18+pw*0.58*(i/(rn-1));
  const rSc=scaleFor(rM,0.15);
  const rY=v=>T+150+(rSc.mx-v)/(rSc.mx-rSc.mn)*76;
  el('path',{d:pathFor(rS.map((v,i)=>[rX(i),rY(v)])),stroke:C.cyan,'stroke-width':1.6,class:'macdline',style:'transition-delay:.4s'},s);
  let rc=0;
  for(let i=1;i<rn;i++){if((rM[i-1]-rS[i-1])*(rM[i]-rS[i])<=0){
    rc++;
    const g=el('g',{style:'--i:16'},s);
    const cx=rX(i),cy=rY(rM[i]);
    el('path',{d:'M'+(cx-4)+' '+(cy-4)+' l8 8 M'+(cx+4)+' '+(cy-4)+' l-8 8',stroke:C.bear,'stroke-width':1.6,'stroke-linecap':'round',class:'rlbl'},g);
  }}
  txt(s,Bx+pw/2,T+272,'FALSE — '+rc+' CROSSES, ALL NOISE 假信号 ×'+rc,{'text-anchor':'middle','font-size':10,fill:C.bear,'font-weight':700,'letter-spacing':'.08em',class:'rlbl',style:'--i:17'});
  txt(s,Bx+pw/2,T+288,'crosses in a range are noise 震荡里的交叉全是噪音',{'text-anchor':'middle','font-size':9,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:17'});
}

const RENDER={macdlayout:drawMACDLayout,macdformula:drawMACDFormula,macdcross:drawMACDCross,
              macdhist:drawMACDHist,macdzero:drawMACDZero,macddiv:drawMACDDiv,
              macdparams:drawMACDParams,macdtrend:drawMACDTrend};
document.querySelectorAll('.rchart[data-r]').forEach(b=>{const f=RENDER[b.dataset.r];if(f)f(b);});"""

start_a10 = "/* ============ 1. recovery curve ============ */"
end_a10 = "document.querySelectorAll('.rchart[data-r]').forEach(b=>{const f=RENDER[b.dataset.r];if(f)f(b);});"
i1 = src.index(start_a10)
i2 = src.index(end_a10) + len(end_a10)
src = src[:i1] + CHART_JS + src[i2:]
done.append("charts")

# ---------- 11. styleFix extension (macdline animation) ----------
rep("styleFix.textContent='.in .rbar[style*=\"scaleX\"]{transform:scaleX(1)!important;}';",
    "styleFix.textContent='.in .rbar[style*=\"scaleX\"]{transform:scaleX(1)!important;} .macdline{fill:none;stroke-width:2;stroke-dasharray:3600;stroke-dashoffset:3600;transition:stroke-dashoffset 1.6s cubic-bezier(.3,.7,.3,1) .2s;} .in .macdline{stroke-dashoffset:0;}';",
    "stylefix")

# ---------- 12. exam module header/key/questions ----------
EXAM_JS = r"""/* ===== MTJ EXAM MODULE - Module 20 ===== */
const MTJ_EXAM_KEY = "mtj_exam_pass_20";
const EXAM_QUESTIONS = [{"q": "What does MT5's MACD (12, 26, 9) actually draw?", "opts": ["Two moving-average lines overlaid on the price chart", "A separate window with one MACD line, one signal line and a red/green histogram", "A single line that predicts future price", "Three oscillators stacked in one panel"], "ans": 1, "why": "MT5's MACD is a single-window indicator: the MACD line (EMA12 − EMA26), the signal line (EMA9 of the line) and the red/green histogram, drawn below price in an accessory window.", "why_zh": "MT5 的 MACD 是单窗口指标：一条 MACD 线（EMA12 − EMA26）、一条信号线（线的 9 期 EMA）和红绿柱状图，画在价格下方的附属窗口里。"}, {"q": "The histogram bar of MT5's MACD equals…", "opts": ["EMA(26) − EMA(12)", "MACD line − Signal line", "Close price − EMA(12)", "Signal line − Close price"], "ans": 1, "why": "Histogram = MACD line − Signal line. It measures the gap (acceleration) between the two lines — when the gap shrinks, momentum is decaying.", "why_zh": "柱状图 = MACD 线 − 信号线。它度量两条线之间的差距（加速度）——差距收缩时，动能正在衰减。"}, {"q": "A golden cross happens when…", "opts": ["Price makes a new high", "The MACD line cuts up through the signal line", "The histogram turns green", "The MACD line crosses the zero line upward"], "ans": 1, "why": "A golden cross is the MACD line crossing up through the signal line — momentum picking up. A zero-line cross is a completely different signal.", "why_zh": "金叉是 MACD 线向上穿过信号线——动能增强。穿越零轴是另一个完全不同的信号。"}, {"q": "The histogram bars shrink toward zero while you are long. What does this mean?", "opts": ["The move is accelerating — add size", "Momentum is decaying — start managing the trade", "Nothing; only crosses matter", "Reverse the position immediately"], "ans": 1, "why": "Shrinking bars mean line and signal are converging — the push is losing fuel. It is the earliest exit warning, not an instant reverse signal.", "why_zh": "柱子收缩意味着线与信号线正在靠拢——这波推力正在失去燃料。这是最早的离场预警，不是立刻反手信号。"}, {"q": "In a ranging market, most MACD crosses are…", "opts": ["Reliable reversal signals", "False signals — noise produced by the oscillation itself", "Stronger than in trends", "Only valid above zero"], "ans": 1, "why": "In a range, price oscillates around a value and MACD oscillates around zero — every swing manufactures a cross. Filter by trend and the zero line first.", "why_zh": "震荡市里价格围绕一个中枢摆动，MACD 也围绕零轴摆动——每一次摆动都会制造一个交叉。先用趋势和零轴过滤。"}];
function renderExam(){"""

start_a12 = "/* ===== MTJ EXAM MODULE - Module 10 ===== */"
end_a12 = "function renderExam(){"
i1 = src.index(start_a12)
i2 = src.index(end_a12)
src = src[:i1] + EXAM_JS + src[i2 + len(end_a12):]
done.append("exam")

# ---------- 13. exam pass message (final module -> graduate) ----------
rep("Module 11 已解锁。回到目录继续学习。",
    "课程全部完成!恭喜毕业!回到目录查看你的学习成果。", "pass-msg")
rep(">Continue · 继续</a>", ">查看目录 · Back to Catalog</a>", "pass-btn")

open(OUT, "w", encoding="utf-8").write(src)
print("OK — replaced:", ", ".join(done))
print("output:", OUT)
