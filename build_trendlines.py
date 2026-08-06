#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build Trendlines_Channels_MakeTradesJourney.html from the Risk Management template."""
import re, io, sys

TPL = '/tmp/mtj/MTJ-Hub/courses/Risk_Management_MakeTradesJourney.html'
OUT = '/tmp/mtj/MTJ-Hub/courses/Trendlines_Channels_MakeTradesJourney.html'

src = io.open(TPL, encoding='utf-8').read()

# ---------- extract hero logo data URI (reused in hero + closing) ----------
m = re.search(r'<img class="logo-hero" src="([^"]+)"', src)
assert m, 'logo-hero not found'
HERO_LOGO = m.group(1)

# ---------- 1. title ----------
old_title = '<title>Risk Management &amp; Position Sizing &#183; Make Trades Journey</title>'
new_title = '<title>Trendlines &amp; Channels &#183; Make Trades Journey</title>'
assert old_title in src
src = src.replace(old_title, new_title)

# ---------- 2. topbar live label ----------
old_live = '<div class="live"><span class="dot"></span>Risk&nbsp;Course · Live</div>'
new_live = '<div class="live"><span class="dot"></span>Module&nbsp;13 · Trendlines</div>'
assert old_live in src
src = src.replace(old_live, new_live)

# ---------- 3. section nav ----------
NEW_NAV = '''<!-- section nav -->
<nav class="secnav">
  <a href="#agenda-sec"><span class="lbl">Overview · 总览</span><span class="pt"></span></a>
  <a href="#basics"><span class="lbl">What Is It · 什么是趋势线</span><span class="pt"></span></a>
  <a href="#drawing"><span class="lbl">How to Draw · 怎么画</span><span class="pt"></span></a>
  <a href="#breakouts"><span class="lbl">Breakouts · 突破</span><span class="pt"></span></a>
  <a href="#channels"><span class="lbl">Channels · 通道</span><span class="pt"></span></a>
  <a href="#combine"><span class="lbl">Trendline + MA · 均线结合</span><span class="pt"></span></a>
  <a href="#mistakes"><span class="lbl">Mistakes · 常见错误</span><span class="pt"></span></a>
</nav>'''
i = src.index('<!-- section nav -->')
j = src.index('</nav>', i) + len('</nav>')
src = src[:i] + NEW_NAV + src[j:]

# ---------- 4. hero ----------
NEW_HERO = '''<!-- ================= HERO ================= -->
<header class="hero" id="top">
  <canvas class="hero-chart" id="heroChart"></canvas>
  <img class="logo-hero" src="__HEROLOGO__">
  <div class="course-tag">Module 13 · Trend Analysis</div>
  <h1>Trendlines &amp;<br>Channels</h1>
  <div class="h-zh">趋 势 线 与 通 道</div>
  <p class="h-sub">The market remembers where it has been defended. Draw the line where price keeps reacting — then wait for the third touch.
    <span class="zh">市场记得自己被防守过的地方。在价格反复反应的位置画线 —— 然后等第三次触碰。</span></p>
  <div class="scroll-hint"><span class="m"></span>Scroll</div>
</header>'''
i = src.index('<!-- ================= HERO ================= -->')
j = src.index('</header>', i) + len('</header>')
src = src[:i] + NEW_HERO + src[j:]

# ---------- 5. content sections (agenda .. closing) ----------
NEW_CONTENT = '''<!-- ================= AGENDA ================= -->
<section class="section" id="agenda-sec">
  <div class="eyebrow reveal">Content · 目录</div>
  <h2 class="title reveal">What we'll cover<span class="zh">本课涵盖内容</span></h2>
  <div class="agenda">
    <div class="card reveal"><div class="n">01</div><h3>What Is a Trendline</h3><div class="zh">市场记忆 · 三种趋势线</div></div>
    <div class="card reveal"><div class="n">02</div><h3>How to Draw It</h3><div class="zh">两点连线 · 三次触碰验证</div></div>
    <div class="card reveal"><div class="n">03</div><h3>Breakouts &amp; Fakeouts</h3><div class="zh">有效突破 · 假突破陷阱</div></div>
    <div class="card reveal"><div class="n">04</div><h3>Channels</h3><div class="zh">上升 / 下降 / 水平通道</div></div>
    <div class="card reveal"><div class="n">05</div><h3>Trendline + Moving Average</h3><div class="zh">结构 + 动量 · 共振区</div></div>
    <div class="card reveal"><div class="n">06</div><h3>Common Mistakes</h3><div class="zh">为什么多数人画错</div></div>
  </div>
</section>

<section class="section reveal" style="padding-top:20px;padding-bottom:20px;">
  <div class="note" style="max-width:820px;line-height:1.9;">// Why this course comes before most strategies 为什么这课排在大多数策略之前：
    a trendline is not decoration — it is the market's memory of where buyers and sellers kept defending a level.
    Learn to draw it correctly and the chart starts telling you where the next reaction is likely to be.
    <span class="zh">趋势线不是装饰 —— 它是市场对「买卖双方反复防守价位」的记忆。学会正确地画它，图表就开始告诉你下一次反应可能出现在哪里。</span></div>
</section>

<!-- ================= PART 01 · WHAT IS A TRENDLINE ================= -->
<section class="divider">
  <div class="rail reveal">Part 01 · 第一部分</div>
  <h2 class="reveal">What Is a Trendline</h2>
  <div class="zh reveal">什 么 是 趋 势 线</div>
</section>

<section class="section" id="basics">
  <div class="group-head reveal"><span class="tier">01</span>
    <div><div class="eyebrow">Trend definition · 趋势定义</div><h2 class="title">The Line Is a Story, Not a Drawing</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">T.01</span><h3>A Trendline Is Market Memory<span class="zh">趋势线是市场的记忆</span></h3><span class="tag neu">Concept 观念</span></div>
    <div class="pattern-desc">
      <p>A trendline is a straight line drawn through a series of swing points that shows the market's direction. It is not an opinion you impose on the chart — it is a record of where price has repeatedly reacted.
        <span class="zh">趋势线是连接一系列摆动点、用来显示市场方向的直线。它不是你对图表的个人意见 —— 它是价格反复做出反应之处的记录。</span></p>
      <p>Every touch is a memory: buyers defended that angle before, so they are likely to defend it again. The more touches a line has, the more participants have agreed on it — and the more violently price reacts when it finally breaks.
        <span class="zh">每一次触碰都是一段记忆：买家以前在那条角度上防守过，所以他们很可能再次防守。一条线的触碰越多，认同它的参与者就越多 —— 而当它最终被突破时，价格的反应就越剧烈。</span></p>
      <ul class="points">
        <li><b>Uptrend line</b> — drawn under rising swing lows; it is the buyers' floor.<span class="zh">上升趋势线 —— 画在抬高的摆动低点下方，是买家的地板。</span></li>
        <li><b>Downtrend line</b> — drawn above falling swing highs; it is the sellers' ceiling.<span class="zh">下降趋势线 —— 画在下降的摆动高点上方，是卖家的天花板。</span></li>
        <li><b>Horizontal line</b> — flat, marking a range where neither side is winning.<span class="zh">水平线 —— 平坦，标记一个双方都没有赢的区间。</span></li>
      </ul>
      <div class="note">// A line with one touch is a wish. A line with three touches is a fact.
        只有一次触碰的线是愿望，有三次触碰的线才是事实。</div>
    </div>
  </article>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">T.02</span><h3>Three Kinds of Trendline<span class="zh">三种趋势线</span></h3><span class="tag neu">Types 类型</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="tltypes"></div>
      <figcaption>Up / down / sideways — the line always connects the same kind of swing point<span class="zh">上升 / 下降 / 横盘 —— 趋势线永远连接同一类摆动点</span></figcaption></figure>
    <div class="pattern-desc">
      <p>Trendlines are named after the trend they follow. An uptrend is a series of higher highs and higher lows, so its line connects the lows. A downtrend makes lower lows and lower highs, so its line connects the highs. A sideways market makes neither — the line is flat and the market is deciding what to do next.
        <span class="zh">趋势线按它所跟随的趋势命名。上升趋势由一浪高过一浪的高点与低点组成，所以线连接低点；下降趋势的低点与高点都越来越低，所以线连接高点；横盘市场两者都不是 —— 线是水平的，市场正在决定下一步。</span></p>
      <p>Never mix the two: an uptrend line must touch lows, a downtrend line must touch highs. A line that touches both is not a trendline — it is a channel, which we cover later.
        <span class="zh">永远不要混用：上升趋势线必须触碰低点，下降趋势线必须触碰高点。一条同时触碰两者的线不是趋势线 —— 那是通道，我们后面会讲。</span></p>
      <div class="note">// Slope matters: very steep lines break easily, very flat lines behave like support and resistance.
        斜率很重要：太陡的线容易被突破，太平的线就退化成支撑与阻力。</div>
    </div>
  </article>
</section>

<!-- ================= PART 02 · HOW TO DRAW ================= -->
<section class="divider">
  <div class="rail reveal">Part 02 · 第二部分</div>
  <h2 class="reveal">How to Draw It</h2>
  <div class="zh reveal">怎 么 画</div>
</section>

<section class="section" id="drawing">
  <div class="group-head reveal"><span class="tier">02</span>
    <div><div class="eyebrow">Method · 方法</div><h2 class="title">Two Points Confirm, the Third Validates</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">T.03</span><h3>Two Points, Then a Third Touch<span class="zh">两点连线 · 三次触碰验证</span></h3><span class="tag bull">The rule 核心规则</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="trendline"></div>
      <figcaption>Anchor 1 + anchor 2 draw the line — touch 3 makes it tradeable<span class="zh">锚点 1 + 锚点 2 画出线 —— 第三次触碰才让它值得交易</span></figcaption></figure>
    <div class="pattern-desc">
      <p>Find two clean swing lows (or highs) and connect them. That is the hypothesis. Then wait: if price pulls back to the line a third time and reacts — bounces off an uptrend line, falls off a downtrend line — the line is validated.
        <span class="zh">找到两个干净的摆动低点（或高点）连起来，这是假设。然后等待：如果价格第三次回撤到这条线并做出反应 —— 在上升趋势线上弹起、在下降趋势线上回落 —— 这条线才算被验证。</span></p>
      <p>One touch is a guess, two touches draw a line, three touches make a level the market cares about. The more touches, the stronger the line — and the more significant the break when it finally happens.
        <span class="zh">一次触碰是猜测，两次触碰画出线，三次触碰才成为市场在意的价位。触碰越多线越强 —— 最终被突破时，意义也越大。</span></p>
      <ul class="points">
        <li><b>Connect swing points</b>, not random candles — the low or high must be a visible reaction point.<span class="zh">连接摆动点，而不是随便一根 K 线 —— 这个低点或高点必须是看得见的反应点。</span></li>
        <li><b>Use the wicks consistently</b> — pick extremes or closes and stay consistent; do not switch between them.<span class="zh">影线用法要一致 —— 选极值或选收盘都行，但别换来换去。</span></li>
        <li><b>Extend the line forward</b> — the interesting part is where price will meet it next.<span class="zh">把线向前延伸 —— 有趣的部分是价格下一次遇到它的地方。</span></li>
      </ul>
      <div class="note">// If you cannot find two clean swing points, there is no trendline to draw yet.
        找不到两个干净的摆动点，就还没有趋势线可画。</div>
    </div>
  </article>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">T.04</span><h3>How NOT to Draw<span class="zh">最常见的画法错误</span></h3><span class="tag bear">Watch out 注意</span></div>
    <div class="pattern-desc">
      <p>Most failed trendlines are not the market's fault — they are drawing errors. The line must reflect the market's memory, not your hope.
        <span class="zh">多数失败的趋势线不是市场的错 —— 是画法的问题。线要反映市场的记忆，而不是你的期望。</span></p>
      <div class="cmp">
        <div class="col bad">
          <div class="ch">✕ Bad · 错误画法</div>
          <ol>
            <li>Forcing the line through candle bodies instead of swing points<span class="zh">硬把线穿过 K 线实体，而不是穿过摆动点</span></li>
            <li>Angling the line to make it fit your bias<span class="zh">为了符合自己的观点而调整线的角度</span></li>
            <li>Drawing over too few bars — noise, not trend<span class="zh">覆盖的 K 线太少 —— 那是噪音，不是趋势</span></li>
            <li>Keeping a broken line because you are still in the trade<span class="zh">线已经破了还留着，因为自己还拿着单子</span></li>
          </ol>
          <div class="verdict">→ A line you bend is a mirror, not a map.<br>被你拗弯的线是镜子，不是地图。</div>
        </div>
        <div class="col good">
          <div class="ch">✓ Good · 正确画法</div>
          <ol>
            <li>Connect clean swing points only<span class="zh">只连接干净的摆动点</span></li>
            <li>Draw on the timeframe you actually trade<span class="zh">在你实际交易的周期上画</span></li>
            <li>Let the line sit where price agrees to sit<span class="zh">让线待在价格自己愿意待的地方</span></li>
            <li>Redraw or delete the moment it is invalidated<span class="zh">一旦失效，立刻重画或删除</span></li>
          </ol>
          <div class="verdict">→ An honest line tells you when you are wrong.<br>诚实的线会告诉你什么时候你错了。</div>
        </div>
      </div>
      <div class="note">// If the line only looks right when you squint, it is not right.
        如果这条线要眯着眼睛看才顺眼，那它就不对。</div>
    </div>
  </article>
</section>

<!-- ================= PART 03 · BREAKOUTS ================= -->
<section class="divider">
  <div class="rail reveal">Part 03 · 第三部分</div>
  <h2 class="reveal">Breakouts &amp; Fakeouts</h2>
  <div class="zh reveal">突 破 与 假 突 破</div>
</section>

<section class="section" id="breakouts">
  <div class="group-head reveal"><span class="tier">03</span>
    <div><div class="eyebrow">The break · 突破</div><h2 class="title">A Break Is a Close, Not a Wick</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">T.05</span><h3>The Valid Breakout<span class="zh">有效突破</span></h3><span class="tag bull">Trade it 可交易</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="breakout"></div>
      <figcaption>Close beyond the line → retest holds → old resistance becomes support<span class="zh">收盘突破 → 回踩不破 → 原阻力变成支撑</span></figcaption></figure>
    <div class="pattern-desc">
      <p>A valid breakout has three parts. First, price <b>closes</b> beyond the line — a wick poking through is not a break. Second, it does not immediately collapse back inside. Third, when it pulls back to the broken line, the line holds and price continues in the breakout direction.
        <span class="zh">有效突破有三个部分。第一，价格<b>收盘</b>在线外 —— 影线穿过去不算突破。第二，它没有立刻跌回线内。第三，当它回踩到被突破的线时，线撑住了，价格继续朝突破方向前进。</span></p>
      <p>The broken trendline changes its role: an uptrend line that is broken from above becomes <b>resistance</b>; a downtrend line broken from below becomes <b>support</b>. That role change is what the retest is testing.
        <span class="zh">被突破的趋势线会换角色：从上方被突破的上升趋势线变成<b>阻力</b>；从下方被突破的下降趋势线变成<b>支撑</b>。这个角色转换正是回踩要检验的东西。</span></p>
      <ul class="points">
        <li><b>Close, not wick</b> — a break only counts if the candle finishes on the other side.<span class="zh">看收盘不看影线 —— 只有 K 线收在线外才算突破。</span></li>
        <li><b>Volume expands</b> — real breaks usually come with noticeably larger volume.<span class="zh">放量 —— 真正的突破通常伴随明显放大的成交量。</span></li>
        <li><b>Trade the retest, not the spike</b> — the best risk-to-reward entry is the pullback that holds.<span class="zh">交易回踩，不追 spike —— 盈亏比最好的进场是「撑住了的回踩」。</span></li>
      </ul>
      <div class="note">// Wait for the close, then wait for the retest. Two confirmations, one entry.
        先等收盘，再等回踩。两次确认，一次进场。</div>
    </div>
  </article>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">T.06</span><h3>The Fakeout<span class="zh">假突破</span></h3><span class="tag bear">The trap 陷阱</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="fakeout"></div>
      <figcaption>Wick above the line, close back inside — the market collects the impatient<span class="zh">影线穿线、收盘回落 —— 市场收割没耐心的人</span></figcaption></figure>
    <div class="pattern-desc">
      <p>The fakeout is the reason you wait for the close. Price spikes through the line, triggers every breakout buy order sitting above it, then closes back inside and reverses hard. Everyone who chased the wick is now holding the wrong position at the worst price.
        <span class="zh">假突破就是你要等收盘的原因。价格冲过趋势线，触发上方所有突破买单，然后收盘回到线内并剧烈反转。每个追影线的人，现在都在最差的价格上拿着错误的仓位。</span></p>
      <p>Fakeouts cluster where everyone can see the level — obvious trendlines, round numbers, yesterday's high. The market needs counterparties: the more orders stacked on a level, the more attractive it is to run through them.
        <span class="zh">假突破集中在人人都看得见的价位 —— 明显的趋势线、整数关口、昨日高点。市场需要对手盘：一个价位上堆积的单子越多，就越值得被扫一遍。</span></p>
      <ul class="points">
        <li><b>The close is the verdict</b> — judge the break by where the candle finishes, never by the wick.<span class="zh">收盘才是判决 —— 用 K 线收在哪来判突破，绝不用影线。</span></li>
        <li><b>Wait for the second attempt</b> — a level tested twice after failing once is far more reliable.<span class="zh">等第二次试探 —— 失败一次后再次测试的价位可靠得多。</span></li>
        <li><b>A fakeout often marks the real turn</b> — the trap is frequently the last push before a reversal.<span class="zh">假突破常常标记真正的转折 —— 陷阱往往是反转前的最后一冲。</span></li>
      </ul>
      <div class="note">// If you must trade the break, wait for the close. The market will happily pay you for patience.
        如果你一定要交易突破，就等收盘。市场很乐意为你的耐心付钱。</div>
    </div>
  </article>
</section>

<!-- ================= PART 04 · CHANNELS ================= -->
<section class="divider">
  <div class="rail reveal">Part 04 · 第四部分</div>
  <h2 class="reveal">Channels</h2>
  <div class="zh reveal">通 道</div>
</section>

<section class="section" id="channels">
  <div class="group-head reveal"><span class="tier">04</span>
    <div><div class="eyebrow">The corridor · 通道</div><h2 class="title">Price Moves in Corridors, Not Lines</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">T.07</span><h3>Three Kinds of Channel<span class="zh">三种通道</span></h3><span class="tag neu">Types 类型</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="channeltypes"></div>
      <figcaption>A channel is a trendline plus its parallel twin<span class="zh">通道 = 一条趋势线 + 一条平行线</span></figcaption></figure>
    <div class="pattern-desc">
      <p>When the market moves between two parallel lines, it is trading in a channel. The lower rail is support, the upper rail is resistance, and price oscillates between them like a ball in a corridor.
        <span class="zh">当价格在两条平行线之间运动时，它就在通道里交易。下轨是支撑，上轨是阻力，价格像走廊里的球一样在两者之间来回。</span></p>
      <ul class="points">
        <li><b>Ascending channel</b> — higher highs and higher lows; the trend is up, buy the lower rail.<span class="zh">上升通道 —— 高点更高、低点更高；趋势向上，在下轨买。</span></li>
        <li><b>Descending channel</b> — lower highs and lower lows; the trend is down, sell the upper rail.<span class="zh">下降通道 —— 高点更低、低点更低；趋势向下，在上轨卖。</span></li>
        <li><b>Horizontal channel</b> — a range; buy the bottom, sell the top until one side breaks.<span class="zh">水平通道 —— 一个区间；下沿买、上沿卖，直到某一侧被突破。</span></li>
      </ul>
      <div class="note">// The two rails must be parallel. If they are not, you have drawn a wedge — a different pattern with different rules.
        两条轨道必须平行。不平行的话你画的是楔形 —— 那是规则不同的另一种形态。</div>
    </div>
  </article>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">T.08</span><h3>The Ascending Channel in Detail<span class="zh">上升通道详解</span></h3><span class="tag bull">Longs 做多</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="channel"></div>
      <figcaption>Lower rail = buy zone · upper rail = target zone — every rail needs at least two touches<span class="zh">下轨=买入区 · 上轨=目标区 —— 每条轨至少要被触碰两次</span></figcaption></figure>
    <div class="pattern-desc">
      <p>In an ascending channel, the lower rail is the trading edge: price has bounced there repeatedly, so a pullback to the rail gives you a defined entry, a defined stop below the rail, and a target at the upper rail. The channel width defines your risk-to-reward before you enter.
        <span class="zh">在上升通道里，下轨就是交易优势所在：价格反复在那里弹起，所以回踩到下轨给了你明确的进场、轨下的明确止损，以及上轨处的目标。通道宽度在你进场之前就定义了盈亏比。</span></p>
      <p>Do not trade the middle of the channel — that is the no-man's land where risk and reward are both undefined. Wait for price to come to you.
        <span class="zh">不要在通道中间交易 —— 那是风险与回报都无法定义的三不管地带。等价格来找你。</span></p>
      <ul class="points">
        <li><b>Entry</b> — pullback to the lower rail with a reaction candle.<span class="zh">进场 —— 回踩下轨，出现反应 K 线。</span></li>
        <li><b>Stop</b> — just below the lower rail, beyond the structure.<span class="zh">止损 —— 下轨下方一点，结构之外。</span></li>
        <li><b>Target</b> — the upper rail, or scale out part of the position there.<span class="zh">目标 —— 上轨，或在上轨先平一部分。</span></li>
      </ul>
      <div class="note">// Two touches on a rail is the minimum. One touch is still a guess.
        一条轨至少两次触碰。一次触碰仍然是猜测。</div>
    </div>
  </article>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">T.09</span><h3>Two Ways to Trade a Channel<span class="zh">通道的两种交易方式</span></h3><span class="tag neu">Strategy 策略</span></div>
    <div class="pattern-desc">
      <p>There are two legitimate ways to trade a channel, and mixing them is how traders get chopped up. Pick one per setup and be honest about which one you are in.
        <span class="zh">交易通道有两种正规打法，混着用就是被来回打脸的原因。每个 setup 选一种，并且诚实地说清自己现在处于哪种。</span></p>
      <div class="steps">
        <div class="step reveal">
          <div class="sn">STRATEGY A</div>
          <h4>Fade the Rails</h4><div class="zh">通道内高抛低吸</div>
          <p>Buy the lower rail, sell the upper rail — while the channel is intact and the higher timeframe trend agrees. Defined R:R every time.</p>
          <div class="out">Buy low rail → target high rail</div>
        </div>
        <div class="step reveal">
          <div class="sn">STRATEGY B</div>
          <h4>Breakout Follow</h4><div class="zh">突破跟进</div>
          <p>Wait for a close beyond a rail, then trade the retest of the broken rail — the channel is ending and a faster move is starting.</p>
          <div class="out">Close beyond rail → retest entry</div>
        </div>
        <div class="step reveal">
          <div class="sn">RULE</div>
          <h4>Never Both at Once</h4><div class="zh">绝不两种同时用</div>
          <p>Fading a broken channel or chasing a breakout inside an intact channel are the two classic ways to give the money back.</p>
          <div class="out">One strategy per setup</div>
        </div>
      </div>
      <div class="note">// In an intact channel you fade. The moment a rail closes broken, you switch to breakout mode.
        通道完好时你做高抛低吸；某条轨收盘被突破的那一刻，切换到突破模式。</div>
    </div>
  </article>
</section>

<!-- ================= PART 05 · TRENDLINE + MA ================= -->
<section class="divider">
  <div class="rail reveal">Part 05 · 第五部分</div>
  <h2 class="reveal">Trendline + Moving Average</h2>
  <div class="zh reveal">趋 势 线 与 均 线</div>
</section>

<section class="section" id="combine">
  <div class="group-head reveal"><span class="tier">05</span>
    <div><div class="eyebrow">Confluence · 共振</div><h2 class="title">Structure Plus Momentum Beats Either Alone</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">T.10</span><h3>The Confluence Zone<span class="zh">共振区</span></h3><span class="tag bull">High probability 高概率</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="ma"></div>
      <figcaption>Trendline and a rising moving average meet near the same price — one pullback, two reasons<span class="zh">趋势线与上行均线在相近价位汇合 —— 一次回踩，两个理由</span></figcaption></figure>
    <div class="pattern-desc">
      <p>The trendline describes structure — where the market has defended before. The moving average describes momentum — whether the crowd is still pushing. When both point the same way, a pullback to the zone where they meet is a high-probability entry.
        <span class="zh">趋势线描述结构 —— 市场以前在哪里防守过；移动平均线描述动量 —— 人群是否还在推。当两者方向一致时，回踩到它们交汇的区域就是高概率进场点。</span></p>
      <p>Check the agreement first: the MA must be sloping the same direction as the trendline, and price should be on the same side of both. If the MA is flat or opposing the line, the confluence is an illusion.
        <span class="zh">先检查一致性：均线的斜率必须与趋势线同向，价格必须待在两者的同一侧。如果均线走平或与趋势线相反，这个共振就是错觉。</span></p>
      <ul class="points">
        <li><b>Direction</b> — rising MA under an uptrend line: both say up.<span class="zh">方向 —— 上行均线 + 上升趋势线：两者都说涨。</span></li>
        <li><b>Entry</b> — pullback into the zone where the line and the MA meet.<span class="zh">进场 —— 回踩到趋势线与均线交汇的区域。</span></li>
        <li><b>Invalidation</b> — a close below both the line and the MA ends the confluence.<span class="zh">失效 —— 收盘同时跌破趋势线和均线，共振结束。</span></li>
        <li><b>MA choice</b> — 20-period MAs suit swing trading; higher timeframes need heavier MAs.<span class="zh">均线选择 —— 波段用 20 周期均线；更大周期用更重的均线。</span></li>
      </ul>
      <div class="note">// Structure tells you where. Momentum tells you whether. Confluence is when they agree.
        结构告诉你「在哪」，动量告诉你「成不成」。共振就是两者意见一致的时候。</div>
    </div>
  </article>
</section>

<!-- ================= PART 06 · COMMON MISTAKES ================= -->
<section class="divider">
  <div class="rail reveal">Part 06 · 第六部分</div>
  <h2 class="reveal">Common Mistakes</h2>
  <div class="zh reveal">常 见 错 误</div>
</section>

<section class="section" id="mistakes">
  <div class="group-head reveal"><span class="tier">06</span>
    <div><div class="eyebrow">Review · 复盘</div><h2 class="title">Why Trendlines Fail for Most Traders</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">T.11</span><h3>The Six Mistakes<span class="zh">六个错误</span></h3><span class="tag bear">Checklist 清单</span></div>
    <div class="pattern-desc">
      <p>Trendlines do not fail because they are a weak tool. They fail because they are drawn, traded and managed badly. Run this checklist before every line you draw.
        <span class="zh">趋势线不是因为它是个弱工具而失败，而是因为画得差、交易得差、管理得差。每画一条线之前，先过一遍这个清单。</span></p>
      <ul class="points">
        <li><b>Drawing on the wrong timeframe</b> — a 5-minute line means nothing on your daily decision.<span class="zh">画错周期 —— 5 分钟的趋势线，对你按日线做的决定毫无意义。</span></li>
        <li><b>Forcing the line</b> — bending the angle to fit your bias instead of the swing points.<span class="zh">硬拗线条 —— 为了迎合自己的观点去调角度，而不是顺着摆动点。</span></li>
        <li><b>Trading the first touch</b> — one touch is a guess; wait for the validation.<span class="zh">第一次触碰就交易 —— 一次触碰是猜测，等验证。</span></li>
        <li><b>Ignoring the fakeout</b> — acting on the wick instead of the close.<span class="zh">无视假突破 —— 用影线做决定，而不是用收盘。</span></li>
        <li><b>Stop inside the line</b> — placing the stop exactly on the level where everyone else's stop lives.<span class="zh">止损贴着线放 —— 放在所有人止损都堆着的位置。</span></li>
        <li><b>Holding a broken line</b> — keeping the trade and the line alive because you refuse to be wrong.<span class="zh">线破了还留着 —— 因为不愿认错，让交易和线一起「续命」。</span></li>
      </ul>
      <div class="note">// The market will redraw every line you draw. Your job is to respect yours until it does.
        市场会重画你画的每一条线。你的工作是：在它重画之前，尊重你自己的线。</div>
    </div>
  </article>
</section>

<!-- ================= CLOSING ================= -->
<section class="closing">
  <p class="quote">Price draws the line once, confirms it <em>three times</em>, and breaks it when the story changes.</p>
  <div class="quote-zh">价格只画一次线，用三次触碰确认它，并在故事改变时打破它。</div>
  <div class="verbs">
    <span>Connect</span><span class="sep">·</span><span>Validate</span><span class="sep">·</span><span>Respect</span>
  </div>
  <img class="logo-close" src="__HEROLOGO__">
  <div class="once">Once hope it possible</div>
</section>

'''
i = src.index('<!-- ================= AGENDA ================= -->')
j = src.index('<!-- ================= FOOTER ================= -->')
src = src[:i] + NEW_CONTENT + src[j:]

# ---------- 6. footer copyright line ----------
old_copy = '· Risk Management &amp; Position Sizing</div>'
new_copy = '· Trendlines &amp; Channels</div>'
assert old_copy in src
src = src.replace(old_copy, new_copy)

# ---------- 7. replace chart functions + RENDER map ----------
NEW_JS = '''/* ============ shared chart helpers ============ */
const FZH="'Noto Sans SC',sans-serif";
function candles(s,X,Y,bars,bw,base){
  bars.forEach((b,i)=>{
    const o=b[0],c=b[1],hi=b[2],lo=b[3];
    const up=c>=o, col=up?C.bull:C.bear;
    const g=el('g',{style:'--i:'+(base+i),class:'rbar'},s);
    el('line',{x1:X(i),x2:X(i),y1:Y(hi),y2:Y(lo),stroke:col,'stroke-width':1.7,'stroke-opacity':.9},g);
    const top=Y(Math.max(o,c)), hgt=Math.max(Math.abs(Y(o)-Y(c)),1.8);
    el('rect',{x:X(i)-bw/2,y:top,width:bw,height:hgt,rx:1.5,fill:col,'fill-opacity':.8},g);
  });
}
function mkChan(lowFn,upFn,N,seed,tL,tU){
  const bars=[];
  for(let i=0;i<N;i++){
    const lo0=lowFn(i)+0.35, hi0=upFn(i)-0.45;
    const w=Math.sin(seed+i*1.9)*0.8+Math.sin(seed*2+i*0.7)*0.6;
    let o=lo0+1.3+w*1.1, c=lo0+2.7+w*1.5;
    o=Math.max(lo0+0.3,Math.min(hi0-0.6,o));
    c=Math.max(lo0+0.3,Math.min(hi0-0.6,c));
    let hi=Math.max(hi0,o,c)+0.5, lo=Math.min(lo0,o,c)-0.5;
    bars.push([o,c,hi,lo]);
  }
  (tL||[]).forEach(i=>{bars[i][3]=lowFn(i)+0.06;
    bars[i][0]=Math.max(bars[i][0],bars[i][3]+0.6);
    bars[i][1]=Math.max(bars[i][1],bars[i][3]+0.6);});
  (tU||[]).forEach(i=>{bars[i][2]=upFn(i)-0.06;
    bars[i][0]=Math.min(bars[i][0],bars[i][2]-0.6);
    bars[i][1]=Math.min(bars[i][1],bars[i][2]-0.6);});
  return bars;
}
function arrow(s,x1,y1,x2,y2,col,delay){
  const g=el('g',{class:'rlbl',style:'--i:'+delay},s);
  el('line',{x1:x1,y1:y1,x2:x2,y2:y2,stroke:col,'stroke-width':2.2,'stroke-linecap':'round'},g);
  const ang=Math.atan2(y2-y1,x2-x1),L=9;
  el('path',{d:'M'+x2+','+y2+'L'+(x2-L*Math.cos(ang-0.42)).toFixed(1)+','+(y2-L*Math.sin(ang-0.42)).toFixed(1)
    +'L'+(x2-L*Math.cos(ang+0.42)).toFixed(1)+','+(y2-L*Math.sin(ang+0.42)).toFixed(1)+'Z',fill:col},g);
}

/* ============ 1. how to draw a trendline ============ */
function drawTrendline(box){
  const W=720,H=340,L=16,R=168,T=22,B=32;
  const s=svgFor(box,W,H);
  const mn=48,mx=72;
  const bars=[[50,51,52,49.5],[51,52.5,53.5,50],[52.5,51.5,54,51],[51.5,53.5,54.5,51.5],
              [53.5,54.5,56,53],[54.5,55.8,57,54.2],[55.8,56.5,57.5,55],[56.5,55.5,57.8,55.2],
              [55.5,57.5,58.5,55.5],[57.5,58.8,60,57],[58.8,59.5,60.5,58.2],
              [60.2,61.5,62.5,60],[61.5,60.5,62.8,60.4],[60.5,62.5,63.5,60.6],
              [62.5,63.8,65,62],[63.8,64.5,66,63.2],[64.5,66.5,67.5,64],[66.5,68,69,66]];
  const N=bars.length, plotW=W-L-R, plotH=H-T-B;
  const X=i=>L+plotW/N*(i+0.5);
  const Y=p=>T+(mx-p)/(mx-mn)*plotH;
  const bw=Math.min(plotW/N*0.56,15);
  const tl=i=>50+(i-1);
  /* buy zone above the line */
  el('polygon',{points:(X(1).toFixed(1)+','+Y(50).toFixed(1))+' '+(X(17).toFixed(1)+','+Y(66).toFixed(1))
    +' '+(X(17).toFixed(1)+','+T)+' '+(X(1).toFixed(1)+','+T),
    fill:'rgba(44,217,138,.05)',class:'rlbl',style:'--i:16'},s);
  /* confirmed segment */
  el('line',{x1:X(1),y1:Y(50),x2:X(6),y2:Y(55),stroke:C.gold,'stroke-width':2.2,class:'rline'},s);
  /* projected segment */
  el('line',{x1:X(6),y1:Y(55),x2:X(17),y2:Y(66),stroke:C.gold,'stroke-width':1.8,
    'stroke-dasharray':'6 5','stroke-opacity':.75,class:'rline',style:'transition-delay:.55s'},s);
  candles(s,X,Y,bars,bw,0);
  /* anchors 1 / 2 / 3 */
  [[1,50,C.gold],[6,55,C.gold],[11,60,C.goldB]].forEach((m,i)=>{
    const g=el('g',{style:'--i:'+(i+8)},s);
    el('circle',{cx:X(m[0]),cy:Y(m[1]),r:9,fill:'rgba(6,6,8,.92)',stroke:m[2],'stroke-width':1.6},g);
    txt(g,X(m[0]),Y(m[1])+3.5,String(i+1),{'text-anchor':'middle','font-size':9.5,fill:m[2],'font-weight':700,class:'rlbl'});
  });
  /* validation ring on the third touch */
  el('circle',{cx:X(11),cy:Y(60),r:13,fill:'none',stroke:C.goldB,'stroke-width':1.2,
    'stroke-dasharray':'3 3',class:'rlbl',style:'--i:12'},s);
  /* right labels */
  const rx=L+plotW+14;
  txt(s,rx,Y(50)-10,'1 + 2  CONFIRM',{'font-size':10,fill:C.gold,'font-weight':700,class:'rlbl',style:'--i:13'});
  txt(s,rx,Y(50)+4,'two swing points',{'font-size':9.5,fill:C.muted2,class:'rlbl',style:'--i:14'});
  txt(s,rx,Y(50)+17,'两点确认',{'font-size':9.5,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:14'});
  txt(s,rx,Y(60)+14,'3  VALIDATES',{'font-size':10,fill:C.goldB,'font-weight':700,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(60)+28,'third touch = real',{'font-size':9.5,fill:C.muted2,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(60)+41,'三次触碰=有效',{'font-size':9.5,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:15'});
  txt(s,L+plotW/2,H-9,'TWO POINTS CONFIRM · THE THIRD VALIDATES  两点连线 · 三次触碰验证',
    {'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.16em','font-family':FZH});
}

/* ============ 2. three trendline types ============ */
function drawTLTypes(box){
  const W=720,H=252,s=svgFor(box,W,H);
  const pw=216,gap=18,px0=16,py=44,ph=142;
  const panels=[
    {t:'UPTREND',zh:'上升趋势',c:C.bull,line:i=>30.6+0.9*i,dir:1,
     bars:[[31.2,33,34.2,30.8],[33,32,34.6,31.4],[32,34.5,35.6,31.9],[34.5,33.5,36.1,32.4],
           [33.5,36,37.1,33.2],[36,35.2,37.4,33.8],[35.2,37.5,38.6,34.4],[37.5,40.2,41.2,35.6]]},
    {t:'DOWNTREND',zh:'下降趋势',c:C.bear,line:i=>44-0.9*i,dir:-1,
     bars:[[42,40.5,43.6,39.6],[40.5,41.5,43.2,39.8],[41.5,39.8,42.4,38.8],[39.8,40.8,41.5,38.9],
           [40.8,39,40.6,38],[39,40,39.7,38.2],[40,38.2,39.2,37.4],[38.2,36.5,38,35.6]]},
    {t:'SIDEWAYS',zh:'横盘趋势',c:C.gold,line:i=>38,dir:0,
     bars:[[37.5,38.8,40,36.8],[38.8,37.2,39.6,36.2],[37.2,38.5,40.2,36.6],[38.5,37.8,39.8,36.4],
           [37.8,39,40.5,36.8],[39,38,40.1,36.9],[38,39.2,40.8,37],[39.2,40.5,41.6,37.6]]}
  ];
  const mn=33,mx=47;
  panels.forEach((p,pi)=>{
    const x=px0+pi*(pw+gap);
    const X=i=>x+20+(pw-32)/8*(i+0.5);
    const Y=v=>py+(mx-v)/(mx-mn)*ph;
    /* snap touch points onto the line */
    const bars=p.bars.map(b=>b.slice());
    const snap=(p.dir>0?[1,3,5,7]:p.dir<0?[1,3,5,7]:[1,3,5,7]);
    snap.forEach(i=>{
      const lv=p.line(i);
      if(p.dir>=0){bars[i][3]=lv-0.05;bars[i][0]=Math.max(bars[i][0],lv+0.5);bars[i][1]=Math.max(bars[i][1],lv+0.5);}
      if(p.dir<=0){bars[i][2]=lv+0.05;bars[i][0]=Math.min(bars[i][0],lv-0.5);bars[i][1]=Math.min(bars[i][1],lv-0.5);}
    });
    const bw=(pw-32)/8*0.5;
    el('line',{x1:X(0),y1:Y(p.line(0)),x2:X(7),y2:Y(p.line(7)),stroke:C.gold,'stroke-width':1.8,class:'rline'},s);
    candles(s,X,Y,bars,bw,pi*2);
    snap.forEach(i=>{
      const g=el('g',{style:'--i:'+(pi*2+4)},s);
      el('circle',{cx:X(i),cy:Y(p.line(i)),r:3.4,fill:p.c,class:'rlbl'},g);
    });
    txt(s,x+4,28,p.t,{'font-size':12,'font-weight':700,fill:p.c,'letter-spacing':'.16em',class:'rlbl',style:'--i:'+pi});
    txt(s,x+pw-4,28,p.zh,{'text-anchor':'end','font-size':11,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:'+pi});
  });
  txt(s,px0+pw*1.5,py+ph+24,'UPTREND: line under the lows  上升趋势线连接低点',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'font-family':FZH});
  txt(s,px0+pw*2.5+gap,py+ph+24,'DOWNTREND: line above the highs  下降趋势线连接高点',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'font-family':FZH});
  txt(s,px0+pw*3.5+gap*2,py+ph+24,'SIDEWAYS: flat = range  水平线=区间',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'font-family':FZH});
}

/* ============ 3. ascending channel ============ */
function drawChannel(box){
  const W=720,H=340,L=16,R=168,T=22,B=34;
  const s=svgFor(box,W,H);
  const N=18,mn=50,mx=78,plotW=W-L-R,plotH=H-T-B;
  const X=i=>L+plotW/N*(i+0.5);
  const Y=p=>T+(mx-p)/(mx-mn)*plotH;
  const lowFn=i=>52.2+i, upFn=i=>60.1+i;
  const bars=mkChan(lowFn,upFn,N,0,[0,6,12],[3,9,15]);
  const bw=plotW/N*0.5;
  /* channel band */
  el('polygon',{points:(X(0).toFixed(1)+','+Y(lowFn(0)).toFixed(1))+' '+(X(17).toFixed(1)+','+Y(lowFn(17)).toFixed(1))
    +' '+(X(17).toFixed(1)+','+Y(upFn(17)).toFixed(1))+' '+(X(0).toFixed(1)+','+Y(upFn(0)).toFixed(1)),
    fill:'rgba(232,200,119,.05)',class:'rlbl',style:'--i:14'},s);
  /* rails */
  el('line',{x1:X(0),y1:Y(lowFn(0)),x2:X(17),y2:Y(lowFn(17)),stroke:C.gold,'stroke-width':2.2,class:'rline'},s);
  el('line',{x1:X(0),y1:Y(upFn(0)),x2:X(17),y2:Y(upFn(17)),stroke:C.gold,'stroke-width':1.8,
    'stroke-dasharray':'7 5','stroke-opacity':.8,class:'rline',style:'transition-delay:.5s'},s);
  candles(s,X,Y,bars,bw,0);
  /* touches */
  [0,6,12].forEach((i,d)=>{
    const g=el('g',{style:'--i:'+(d+10)},s);
    el('circle',{cx:X(i),cy:Y(lowFn(i)),r:4.5,fill:C.bull,class:'rlbl'},g);
  });
  [3,9,15].forEach((i,d)=>{
    const g=el('g',{style:'--i:'+(d+13)},s);
    el('circle',{cx:X(i),cy:Y(upFn(i)),r:4.5,fill:'none',stroke:C.cyan,'stroke-width':1.6,class:'rlbl'},g);
  });
  /* right labels */
  const rx=L+plotW+14;
  txt(s,rx,Y(lowFn(0))-10,'LOWER RAIL · SUPPORT',{'font-size':10,fill:C.bull,'font-weight':700,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(lowFn(0))+4,'buy zone 买入区',{'font-size':9.5,fill:C.muted2,'font-family':FZH,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(upFn(0))+8,'UPPER RAIL · TARGET',{'font-size':10,fill:C.bear,'font-weight':700,class:'rlbl',style:'--i:16'});
  txt(s,rx,Y(upFn(0))+22,'target zone 目标区',{'font-size':9.5,fill:C.muted2,'font-family':FZH,class:'rlbl',style:'--i:16'});
  txt(s,rx,Y(upFn(0))+44,'parallel rails',{'font-size':9.5,fill:C.muted2,class:'rlbl',style:'--i:16'});
  txt(s,rx,Y(upFn(0))+57,'平行轨道',{'font-size':9.5,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:16'});
  /* slope indicator */
  arrow(s,X(2),Y(lowFn(2)),X(2)+26,Y(lowFn(2))-22,C.goldB,17);
  txt(s,X(2)+13,Y(lowFn(2))-30,'SLOPE',{'text-anchor':'middle','font-size':8.5,fill:C.gold,'letter-spacing':'.14em',class:'rlbl',style:'--i:17'});
  txt(s,L+plotW/2,H-9,'ASCENDING CHANNEL · LOWER RAIL BUYS, UPPER RAIL TARGETS  上升通道 · 下轨买 · 上轨卖',
    {'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.14em','font-family':FZH});
}

/* ============ 4. three channel types ============ */
function drawChannelTypes(box){
  const W=720,H=252,s=svgFor(box,W,H);
  const pw=216,gap=18,px0=16,py=44,ph=142;
  const panels=[
    {t:'ASCENDING',zh:'上升通道',c:C.bull,low:i=>30+0.95*i,up:i=>36+0.95*i,tL:[0,3],tU:[1,4],seed:1},
    {t:'DESCENDING',zh:'下降通道',c:C.bear,low:i=>38-0.95*i,up:i=>44-0.95*i,tL:[1,4],tU:[0,3],seed:2},
    {t:'HORIZONTAL',zh:'水平通道',c:C.gold,low:i=>36,up:i=>43,tL:[0,3],tU:[1,4],seed:3}
  ];
  const mn=33,mx=47;
  panels.forEach((p,pi)=>{
    const x=px0+pi*(pw+gap);
    const X=i=>x+20+(pw-32)/6*(i+0.5);
    const Y=v=>py+(mx-v)/(mx-mn)*ph;
    const bars=mkChan(p.low,p.up,6,p.seed,p.tL,p.tU);
    const bw=(pw-32)/6*0.5;
    el('polygon',{points:(X(0).toFixed(1)+','+Y(p.low(0)).toFixed(1))+' '+(X(5).toFixed(1)+','+Y(p.low(5)).toFixed(1))
      +' '+(X(5).toFixed(1)+','+Y(p.up(5)).toFixed(1))+' '+(X(0).toFixed(1)+','+Y(p.up(0)).toFixed(1)),
      fill:'rgba(232,200,119,.045)',class:'rlbl',style:'--i:12'},s);
    el('line',{x1:X(0),y1:Y(p.low(0)),x2:X(5),y2:Y(p.low(5)),stroke:C.gold,'stroke-width':1.8,class:'rline'},s);
    el('line',{x1:X(0),y1:Y(p.up(0)),x2:X(5),y2:Y(p.up(5)),stroke:C.gold,'stroke-width':1.4,
      'stroke-dasharray':'5 4','stroke-opacity':.7,class:'rline',style:'transition-delay:.5s'},s);
    candles(s,X,Y,bars,bw,pi*2);
    p.tL.forEach(i=>{const g=el('g',{style:'--i:'+(pi*2+4)},s);
      el('circle',{cx:X(i),cy:Y(p.low(i)),r:3.4,fill:C.bull,class:'rlbl'},g);});
    p.tU.forEach(i=>{const g=el('g',{style:'--i:'+(pi*2+5)},s);
      el('circle',{cx:X(i),cy:Y(p.up(i)),r:3.4,fill:'none',stroke:C.cyan,'stroke-width':1.4,class:'rlbl'},g);});
    txt(s,x+4,28,p.t,{'font-size':12,'font-weight':700,fill:p.c,'letter-spacing':'.14em',class:'rlbl',style:'--i:'+pi});
    txt(s,x+pw-4,28,p.zh,{'text-anchor':'end','font-size':11,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:'+pi});
  });
  txt(s,px0+pw*1.5,py+ph+24,'fade the rails  高抛低吸',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'font-family':FZH});
  txt(s,px0+pw*2.5+gap,py+ph+24,'sell rallies, buy dips  反弹卖 · 回踩买',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'font-family':FZH});
  txt(s,px0+pw*3.5+gap*2,py+ph+24,'range = accumulation  区间 = 蓄势',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'font-family':FZH});
}

/* ============ 5. valid breakout ============ */
function drawBreakout(box){
  const W=720,H=340,L=16,R=168,T=22,B=32;
  const s=svgFor(box,W,H);
  const mn=38,mx=64;
  const bars=[[58,56.5,59.5,55.6],[56.5,55,58,54.2],[55,54,57.2,52.9],[54,52.8,56,51.9],
              [52.8,51.5,54.8,50.6],[51.5,50.8,53.5,49.9],[50.8,52.2,54,49.6],[52.2,51,53.8,50.2],
              [51,50.2,53,49.3],[50.2,49.5,52.2,48.7],[49.5,49,51.8,48.1],
              [49,53,53.8,48.6],[53,51.8,54.2,48.5],[51.8,54,55.5,51.3],
              [54,55.8,57.2,53.4],[55.8,57.5,59,55.2],[57.5,59,60.4,56.8],[59,60.6,62,58.4]];
  const N=bars.length, plotW=W-L-R, plotH=H-T-B;
  const X=i=>L+plotW/N*(i+0.5);
  const Y=p=>T+(mx-p)/(mx-mn)*plotH;
  const bw=plotW/N*0.5;
  const tl=i=>62-1.2*i;
  /* zone above the broken line */
  el('polygon',{points:(X(11).toFixed(1)+','+Y(48.8).toFixed(1))+' '+(X(17).toFixed(1)+','+Y(41.6).toFixed(1))
    +' '+(X(17).toFixed(1)+','+T)+' '+(X(11).toFixed(1)+','+T),
    fill:'rgba(44,217,138,.05)',class:'rlbl',style:'--i:13'},s);
  el('line',{x1:X(0),y1:Y(62),x2:X(11),y2:Y(48.8),stroke:C.gold,'stroke-width':2,class:'rline'},s);
  el('line',{x1:X(11),y1:Y(48.8),x2:X(17),y2:Y(41.6),stroke:C.gold,'stroke-width':1.6,
    'stroke-dasharray':'6 5','stroke-opacity':.6,class:'rline',style:'transition-delay:.55s'},s);
  candles(s,X,Y,bars,bw,0);
  /* breakout marker */
  const gb=el('g',{style:'--i:10'},s);
  el('circle',{cx:X(11),cy:Y(53),r:8,fill:'rgba(232,200,119,.14)',stroke:C.goldB,'stroke-width':1.3,class:'rlbl'},gb);
  /* retest marker */
  const gr=el('g',{style:'--i:12'},s);
  el('circle',{cx:X(12),cy:Y(48.5),r:8,fill:'none',stroke:C.bull,'stroke-width':1.4,'stroke-dasharray':'3 3',class:'rlbl'},gr);
  /* continuation arrow */
  arrow(s,X(14),Y(52),X(16),Y(58),C.bull,14);
  /* right labels */
  const rx=L+plotW+14;
  txt(s,rx,Y(53)-10,'BREAKOUT',{'font-size':10,fill:C.goldB,'font-weight':700,class:'rlbl',style:'--i:14'});
  txt(s,rx,Y(53)+4,'close beyond the line',{'font-size':9.5,fill:C.muted2,class:'rlbl',style:'--i:14'});
  txt(s,rx,Y(53)+17,'收盘在线外',{'font-size':9.5,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:14'});
  txt(s,rx,Y(48.5)+10,'RETEST HOLDS',{'font-size':10,fill:C.bull,'font-weight':700,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(48.5)+24,'resistance → support',{'font-size':9.5,fill:C.muted2,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(48.5)+37,'阻力变成支撑',{'font-size':9.5,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:15'});
  txt(s,L+plotW/2,H-9,'VALID BREAKOUT · CLOSE, RETEST, CONTINUE  有效突破 · 收盘 · 回踩 · 延续',
    {'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.14em','font-family':FZH});
}

/* ============ 6. fakeout ============ */
function drawFakeout(box){
  const W=720,H=340,L=16,R=168,T=22,B=32;
  const s=svgFor(box,W,H);
  const mn=38,mx=64;
  const bars=[[58,56,59.5,55.2],[56,54.5,57.8,53.8],[54.5,53,56.4,52.4],[53,51.8,55.2,51],
              [51.8,50.5,53.8,49.8],[50.5,49.2,52.4,48.5],[49.2,50.5,52.2,48.3],[50.5,49.5,52,48.6],
              [49.5,48.2,51.5,47.5],[48.2,47,50.2,46.2],[47,46,49.2,45.3],
              [46,45.4,51.6,44.9],[45.4,44,47.8,43.4],[44,43,46.2,42.2],
              [43,41.8,45,40.9],[41.8,42.5,44.3,40.7],[42.5,41,44.2,40.2],[41,40.2,43,39.2]];
  const N=bars.length, plotW=W-L-R, plotH=H-T-B;
  const X=i=>L+plotW/N*(i+0.5);
  const Y=p=>T+(mx-p)/(mx-mn)*plotH;
  const bw=plotW/N*0.5;
  const tl=i=>62-1.1*i;
  /* danger zone above the line */
  el('polygon',{points:(X(8).toFixed(1)+','+Y(53.2).toFixed(1))+' '+(X(14).toFixed(1)+','+Y(46.6).toFixed(1))
    +' '+(X(14).toFixed(1)+','+T)+' '+(X(8).toFixed(1)+','+T),
    fill:'rgba(255,92,99,.05)',class:'rlbl',style:'--i:13'},s);
  el('line',{x1:X(0),y1:Y(62),x2:X(17),y2:Y(43.3),stroke:C.gold,'stroke-width':2,class:'rline'},s);
  candles(s,X,Y,bars,bw,0);
  /* trap marker */
  const gt=el('g',{style:'--i:10'},s);
  el('circle',{cx:X(11),cy:Y(51.6),r:8,fill:'rgba(255,92,99,.16)',stroke:C.bear,'stroke-width':1.3,class:'rlbl'},gt);
  /* decline arrow */
  arrow(s,X(13),Y(44),X(15),Y(41),C.bear,14);
  /* right labels */
  const rx=L+plotW+14;
  txt(s,rx,Y(51.6)-10,'THE TRAP',{'font-size':10,fill:C.bear,'font-weight':700,class:'rlbl',style:'--i:14'});
  txt(s,rx,Y(51.6)+4,'wick above · close back',{'font-size':9.5,fill:C.muted2,class:'rlbl',style:'--i:14'});
  txt(s,rx,Y(51.6)+17,'影线穿越 · 收盘回落',{'font-size':9.5,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:14'});
  txt(s,rx,Y(45.4)+8,'CLOSE IS THE VERDICT',{'font-size':10,fill:C.goldB,'font-weight':700,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(45.4)+22,'never trade the wick',{'font-size':9.5,fill:C.muted2,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(45.4)+35,'收盘才是判决',{'font-size':9.5,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:15'});
  txt(s,L+plotW/2,H-9,'FAKEOUT · WICK THROUGH, CLOSE BACK  假突破 · 影线穿越 · 收盘回落',
    {'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.14em','font-family':FZH});
}

/* ============ 7. trendline + MA confluence ============ */
function drawMAConfluence(box){
  const W=720,H=340,L=16,R=168,T=22,B=32;
  const s=svgFor(box,W,H);
  const mn=48,mx=78;
  const bars=[[53,54,55.2,52.4],[54,55.5,56.6,53],[55.5,54.8,56.8,53.9],[54.8,57,58.2,54.2],
              [57,58.2,59.4,56.2],[58.2,57.5,59.6,56.4],[57.5,60,61.2,56.6],[60,61.2,62.4,59.2],
              [61.2,60.5,62.6,59.6],[60.5,63,64.2,60],[63,64.2,65.4,62.2],
              [64.2,63.5,65.6,62.6],[63.5,62,64.4,61.3],[62,61.2,63.4,61.1],
              [61.2,62.8,64,60.7],[62.8,65,66.2,62.2],[65,66.5,67.8,64.2],[66.5,68,69.4,65.8]];
  const N=bars.length, plotW=W-L-R, plotH=H-T-B;
  const X=i=>L+plotW/N*(i+0.5);
  const Y=p=>T+(mx-p)/(mx-mn)*plotH;
  const bw=plotW/N*0.5;
  const tl=i=>53.2+0.68*(i-1);
  /* MA-5 of closes */
  const closes=bars.map(b=>b[1]);
  const ma=[];
  for(let i=0;i<N;i++){if(i>=4)ma.push([i,(closes[i-4]+closes[i-3]+closes[i-2]+closes[i-1]+closes[i])/5]);}
  /* confluence zone */
  el('rect',{x:X(12),y:Y(62.8),width:X(14)-X(12),height:Y(61.3)-Y(62.8),
    fill:'rgba(44,217,138,.09)',stroke:'rgba(44,217,138,.4)','stroke-dasharray':'3 3',class:'rlbl',style:'--i:12'},s);
  txt(s,X(13),Y(63.4),'CONFLUENCE',{'text-anchor':'middle','font-size':9,fill:C.goldB,'font-weight':700,'letter-spacing':'.12em',class:'rlbl',style:'--i:12'});
  txt(s,X(13),Y(64.2),'共振区',{'text-anchor':'middle','font-size':9,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:12'});
  /* trendline */
  el('line',{x1:X(1),y1:Y(53.2),x2:X(17),y2:Y(tl(17)),stroke:C.gold,'stroke-width':2,class:'rline'},s);
  /* MA curve */
  el('path',{d:ma.map((m,j)=>(j?'L':'M')+X(m[0]).toFixed(1)+','+Y(m[1]).toFixed(1)).join(' '),
    stroke:C.cyan,'stroke-width':2,class:'rline',style:'transition-delay:.5s'},s);
  candles(s,X,Y,bars,bw,0);
  /* touch at the confluence */
  el('circle',{cx:X(13),cy:Y(61.1),r:7,fill:'none',stroke:C.goldB,'stroke-width':1.4,'stroke-dasharray':'3 3',class:'rlbl',style:'--i:13'},s);
  /* entry arrow */
  arrow(s,X(14),Y(64),X(15.6),Y(66),C.bull,14);
  /* right labels */
  const rx=L+plotW+14;
  txt(s,rx,Y(53.2)-8,'TRENDLINE',{'font-size':10,fill:C.gold,'font-weight':700,class:'rlbl',style:'--i:14'});
  txt(s,rx,Y(53.2)+6,'structure 结构',{'font-size':9.5,fill:C.muted2,'font-family':FZH,class:'rlbl',style:'--i:14'});
  txt(s,rx,Y(62.8)+10,'MA-5',{'font-size':10,fill:C.cyan,'font-weight':700,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(62.8)+24,'momentum 动量',{'font-size':9.5,fill:C.muted2,'font-family':FZH,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(59.8),'line + MA agree',{'font-size':9.5,fill:C.muted2,class:'rlbl',style:'--i:15'});
  txt(s,rx,Y(59.8)+13,'线与均线同向',{'font-size':9.5,fill:C.muted,'font-family':FZH,class:'rlbl',style:'--i:15'});
  txt(s,L+plotW/2,H-9,'PULLBACK INTO THE CONFLUENCE ZONE · ONE TOUCH, TWO REASONS  回踩共振区 · 一次触碰 · 两个理由',
    {'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.12em','font-family':FZH});
}

const RENDER={trendline:drawTrendline,tltypes:drawTLTypes,channel:drawChannel,
              channeltypes:drawChannelTypes,breakout:drawBreakout,fakeout:drawFakeout,
              ma:drawMAConfluence};
document.querySelectorAll('.rchart[data-r]').forEach(b=>{const f=RENDER[b.dataset.r];if(f)f(b);});
'''
anchor = "document.querySelectorAll('.rchart[data-r]').forEach(b=>{const f=RENDER[b.dataset.r];if(f)f(b);});"
i = src.index('/* ============ 1. recovery curve ============ */')
j = src.index(anchor) + len(anchor)
src = src[:i] + NEW_JS + src[j:]

# ---------- hero logo placeholder ----------
assert '__HEROLOGO__' in src
src = src.replace('__HEROLOGO__', HERO_LOGO)
assert '__HEROLOGO__' not in src

io.open(OUT, 'w', encoding='utf-8').write(src)
print('written:', OUT)
print('bytes:', len(src.encode('utf-8')))
