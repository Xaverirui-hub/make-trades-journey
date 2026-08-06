#!/usr/bin/env python3
# Build Stochastic_Indicator_MakeTradesJourney.html from Risk_Management template
import re, json, sys

SRC = "/tmp/mtj/MTJ-Hub/courses/Risk_Management_MakeTradesJourney.html"
DST = "/tmp/mtj/MTJ-Hub/courses/Stochastic_Indicator_MakeTradesJourney.html"

s = open(SRC, encoding="utf-8").read()

# extract the logo base64 (identical in brand/hero/closing/CSS)
m = re.search(r'src="data:image/jpeg;base64,([^"]+)"', s)
LOGO = m.group(1)

# ---------- 1. title ----------
s = s.replace(
    "<title>Risk Management &amp; Position Sizing &#183; Make Trades Journey</title>",
    "<title>Stochastic Indicator &#183; Make Trades Journey</title>")

# ---------- 2. topbar live label ----------
s = s.replace("Risk&nbsp;Course · Live", "Stochastic&nbsp;Course · Live")

# ---------- 3. section nav ----------
SECNAV = '''<nav class="secnav">
  <a href="#agenda-sec"><span class="lbl">Overview · 总览</span><span class="pt"></span></a>
  <a href="#what"><span class="lbl">What is STO · 是什么</span><span class="pt"></span></a>
  <a href="#levels"><span class="lbl">Levels · 80 / 20</span><span class="pt"></span></a>
  <a href="#crosses"><span class="lbl">Crosses · 金叉死叉</span><span class="pt"></span></a>
  <a href="#divergence"><span class="lbl">Divergence · 背离</span><span class="pt"></span></a>
  <a href="#slowfast"><span class="lbl">Fast vs Slow · 快慢</span><span class="pt"></span></a>
  <a href="#rsivs"><span class="lbl">RSI vs STO · 对比</span><span class="pt"></span></a>
  <a href="#trend"><span class="lbl">Trend · 趋势</span><span class="pt"></span></a>
  <a href="#mistakes"><span class="lbl">Misuse · 误用</span><span class="pt"></span></a>
</nav>'''
a, b = s.split('<nav class="secnav">', 1); b2, rest = b.split('</nav>', 1)
s = a + SECNAV + rest

# ---------- 4. wrap body content ----------
WRAP = '''<div class="wrap">

<!-- ================= HERO ================= -->
<header class="hero" id="top">
  <canvas class="hero-chart" id="heroChart"></canvas>
  <img class="logo-hero" src="data:image/jpeg;base64,{{LOGO}}">
  <div class="course-tag">Trading Course · Required</div>
  <h1>Stochastic<br>Indicator</h1>
  <div class="h-zh">随 机 指 标</div>
  <p class="h-sub">An oscillator that measures where the last close sits inside the recent range — and tells you when the crowd is stretched too far.
    <span class="zh">一个衡量「最新收盘价落在近期区间哪个位置」的震荡指标——告诉你人群什么时候被拉得过远。</span></p>
  <div class="scroll-hint"><span class="m"></span>Scroll</div>
</header>

<!-- ================= AGENDA ================= -->
<section class="section" id="agenda-sec">
  <div class="eyebrow reveal">Content · 目录</div>
  <h2 class="title reveal">What we'll cover<span class="zh">本课涵盖内容</span></h2>
  <div class="agenda">
    <div class="card reveal"><div class="n">01</div><h3>What is Stochastic</h3><div class="zh">%K 与 %D 两条线 · MT5 显示</div><div class="sub"><span>%K</span><span>%D</span><span>0–100</span></div></div>
    <div class="card reveal"><div class="n">02</div><h3>The Formula</h3><div class="zh">收盘在近期高低范围的位置</div><div class="sub"><span>Range</span><span>Close</span></div></div>
    <div class="card reveal"><div class="n">03</div><h3>Parameters</h3><div class="zh">5/3/3 与 14/3/3</div><div class="sub"><span>5,3,3</span><span>14,3,3</span></div></div>
    <div class="card reveal"><div class="n">04</div><h3>Levels</h3><div class="zh">超买 80 · 超卖 20</div><div class="sub"><span>80</span><span>50</span><span>20</span></div></div>
    <div class="card reveal"><div class="n">05</div><h3>Crosses</h3><div class="zh">金叉与死叉 · 低位金叉</div><div class="sub"><span>Golden</span><span>Death</span></div></div>
    <div class="card reveal"><div class="n">06</div><h3>Divergence</h3><div class="zh">价格新高 · %K 没新高</div><div class="sub"><span>Bearish</span><span>Bullish</span></div></div>
    <div class="card reveal"><div class="n">07</div><h3>Slow vs Fast</h3><div class="zh">慢速与快速 Stochastic</div><div class="sub"><span>Fast</span><span>Slow</span></div></div>
    <div class="card reveal"><div class="n">08</div><h3>Use &amp; Misuse</h3><div class="zh">结合趋势 · 常见误用</div><div class="sub"><span>Trend</span><span>Range</span></div></div>
  </div>
</section>

<section class="section reveal" style="padding-top:20px;padding-bottom:20px;">
  <div class="note" style="max-width:820px;line-height:1.9;">// Why this indicator earns its place 为什么这个指标值得学：
    Stochastic quantifies what your eyes already see — that price closed near the top or bottom of its recent range —
    and turns it into repeatable rules. It answers <b>when</b>; the trend answers <b>which way</b>.
    <span class="zh">随机指标把你眼睛已经看到的东西量化——价格收在近期区间的顶部或底部附近——并把它变成可重复的规则。它回答<b>何时</b>，趋势回答<b>朝哪个方向</b>。</span></div>
</section>

<!-- ================= PART 01 · WHAT IS STOCHASTIC ================= -->
<section class="divider">
  <div class="rail reveal">Part 01 · 第一部分</div>
  <h2 class="reveal">What is Stochastic</h2>
  <div class="zh reveal">随 机 指 标 是 什 么</div>
</section>

<section class="section" id="what">
  <div class="group-head reveal"><span class="tier">01</span>
    <div><div class="eyebrow">The basics · 基础</div><h2 class="title">An Oscillator in the Sub-Window</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">S.01</span><h3>The Two Lines: %K and %D<span class="zh">%K 与 %D 两条线</span></h3><span class="tag neu">MT5 default</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="stoMT5"></div>
      <figcaption>MT5 sub-window: %K (fast) and %D (signal) with 80 / 20 levels<span class="zh">MT5 子窗口：%K（快线）与 %D（信号线），附 80 / 20 水平线</span></figcaption></figure>
    <div class="pattern-desc">
      <p>The Stochastic Oscillator lives in a sub-window below price, scaled <b>0–100</b>. It has two lines: <b>%K</b>, the fast line, and <b>%D</b>, its smoothed signal line. When %K is high, the last close sits near the top of the recent range; when it is low, near the bottom.
        <span class="zh">随机指标（Stochastic Oscillator）显示在价格下方的子窗口里，范围 <b>0–100</b>。它有两条线：<b>%K</b> 快线，以及它的平滑信号线 <b>%D</b>。%K 高，说明最新收盘价位于近期区间顶部附近；%K 低，则位于底部附近。</span></p>
      <p>In MT5: Insert → Indicators → Oscillators → <b>Stochastic Oscillator</b>. The default preset is <b>5, 3, 3</b>, and it draws exactly the two lines you see above — nothing more, nothing less.
        <span class="zh">在 MT5 中：插入 → 技术指标 → 震荡指标 → <b>Stochastic Oscillator</b>。默认参数是 <b>5, 3, 3</b>，画出来的就是上面这两条线——不多也不少。</span></p>
      <div class="note">// %K is the raw reading. %D is %K's moving average — treat it as the "confirm line". %K 是原始读数，%D 是 %K 的均线——把它当作「确认线」。</div>
    </div>
  </article>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">S.02</span><h3>What the Formula Means<span class="zh">公式的直觉</span></h3><span class="tag neu">0–100</span></div>
    <div class="pattern-desc">
      <p>Take the last N bars. Find the <b>highest high</b> and the <b>lowest low</b>. Then ask one question: where does the latest close sit inside that range? If it sits 10% up from the bottom, %K reads 10 — near the lows. If it sits 90% up, %K reads 90 — near the highs.
        <span class="zh">取最近 N 根 K 线，找出<b>最高价</b>和<b>最低价</b>，然后只问一个问题：最新收盘价落在这个区间的什么位置？如果从底部上来只有 10%，%K 就是 10——靠近低点；如果是 90%，%K 就是 90——靠近高点。</span></p>
      <p>That is the entire idea. Stochastic is not predicting anything — it is measuring <b>where the close is relative to the recent range</b>, which is a direct read on short-term momentum.
        <span class="zh">整个思路就这些。随机指标不做预测——它只测量<b>收盘价相对近期区间的位置</b>，而这直接反映短期动能。</span></p>
      <div class="calcbox">
        <div class="fx">%K = ( <b>Close</b> <span class="op">−</span> <b>Lowest Low</b> ) <span class="op">÷</span> ( <b>Highest High</b> <span class="op">−</span> <b>Lowest Low</b> ) <span class="op">×</span> <b>100</b></div>
        <div class="cap">%K =（收盘价 − 最低价）÷（最高价 − 最低价）× 100 —— 过去 N 根 K 线</div>
      </div>
      <div class="note">// Range widens → readings get stuck mid-scale. Range tightens → readings swing harder. 区间越宽，读数越容易停在中间；区间越窄，读数摆动越剧烈。</div>
    </div>
  </article>
</section>

<!-- ================= PART 02 · PARAMETERS & LEVELS ================= -->
<section class="divider">
  <div class="rail reveal">Part 02 · 第二部分</div>
  <h2 class="reveal">Parameters &amp; Levels</h2>
  <div class="zh reveal">参 数 与 区 域</div>
</section>

<section class="section" id="levels">
  <div class="group-head reveal"><span class="tier">02</span>
    <div><div class="eyebrow">Settings &amp; zones · 参数与区域</div><h2 class="title">Know Your Numbers</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">S.03</span><h3>5/3/3 vs 14/3/3<span class="zh">默认参数</span></h3><span class="tag neu">Defaults</span></div>
    <div class="pattern-desc">
      <p>The three numbers are <b>%K period, %D period, slowing</b>. Each one changes how fast the indicator reacts.
        <span class="zh">三个数字分别是<b>%K 周期、%D 周期、平滑</b>。每一个都改变指标的反应速度。</span></p>
      <ul class="points">
        <li><b>%K period (5 or 14)</b> — how many bars are in the look-back range. 5 reacts fast; 14 filters noise.<span class="zh">%K 周期（5 或 14）——回看区间包含多少根 K 线。5 反应快；14 过滤噪音。</span></li>
        <li><b>%D period (3)</b> — the moving-average length used for the signal line.<span class="zh">%D 周期（3）——计算信号线所用的均线长度。</span></li>
        <li><b>Slowing (3)</b> — smooths %K before it is drawn. 1 = fast stochastic, 3 = slow stochastic.<span class="zh">平滑（3）——画线前先对 %K 做平滑。1 就是快速随机指标，3 是慢速随机指标。</span></li>
        <li><b>MT5 default 5, 3, 3</b> — sensitive. The classic <b>14, 3, 3</b> — steadier, fewer signals.<span class="zh">MT5 默认 5, 3, 3——偏灵敏；经典 14, 3, 3——更稳、信号更少。</span></li>
      </ul>
      <div class="note">// Shorter periods = more signals, more false ones. Longer = fewer signals, higher quality. 周期越短信号越多、假信号也越多；周期越长信号越少、质量越高。</div>
    </div>
  </article>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">S.04</span><h3>Overbought 80 / Oversold 20<span class="zh">超买 80 · 超卖 20</span></h3><span class="tag bull">Key levels</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="stoLevels"></div>
      <figcaption>The oscillator pinned above 80 and below 20 — the stretched zones<span class="zh">指标贴到 80 以上和 20 以下——被拉伸的区域</span></figcaption></figure>
    <div class="pattern-desc">
      <p>Above <b>80</b> the market is overbought — the close has been hugging the top of the range. Below <b>20</b> it is oversold — the close has been hugging the bottom. The 50 line is the neutral midline.
        <span class="zh">高于 <b>80</b> 为超买——收盘价一直贴着区间上沿；低于 <b>20</b> 为超卖——收盘价一直贴着区间下沿。50 是中性分界线。</span></p>
      <p>Important: overbought does <b>not</b> mean "sell now". In a strong trend the oscillator can camp above 80 for a long time. The level only tells you price is stretched — you still need a trigger (a cross, or price action) before acting.
        <span class="zh">注意：超买<b>不是</b>「马上做空」。强趋势里指标可以长期待在 80 上方。水平线只告诉你价格被拉伸了——行动前还需要一个触发信号（交叉或价格行为）。</span></p>
      <div class="note">// 80/20 are the classic zones, not magic numbers — some traders use 85/15 in trends and 75/25 in ranges. 80/20 是经典区域但不是魔法数字——趋势市有人用 85/15，震荡市有人用 75/25。</div>
    </div>
  </article>
</section>

<!-- ================= PART 03 · CROSSES ================= -->
<section class="divider">
  <div class="rail reveal">Part 03 · 第三部分</div>
  <h2 class="reveal">Golden &amp; Death Crosses</h2>
  <div class="zh reveal">金 叉 与 死 叉</div>
</section>

<section class="section" id="crosses">
  <div class="group-head reveal"><span class="tier">03</span>
    <div><div class="eyebrow">Signal triggers · 触发信号</div><h2 class="title">Location Beats the Cross</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">S.05</span><h3>Golden Cross at Low, Death Cross at High<span class="zh">低位金叉 · 高位死叉</span></h3><span class="tag bull">Bullish</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="stoCross"></div>
      <figcaption>Left: %K crosses above %D below 20 (bullish). Right: %K crosses below %D above 80 (bearish)<span class="zh">左：%K 在 20 下方上穿 %D（看涨）。右：%K 在 80 上方下穿 %D（看跌）</span></figcaption></figure>
    <div class="pattern-desc">
      <p>A <b>golden cross</b> is %K crossing <b>above</b> %D; a <b>death cross</b> is %K crossing <b>below</b> %D. The cross by itself is weak — its <b>location</b> is what matters.
        <span class="zh"><b>金叉</b>是 %K 上穿 %D；<b>死叉</b>是 %K 下穿 %D。单看交叉本身很弱——<b>发生的位置</b>才重要。</span></p>
      <p>The classic bullish setup is a golden cross in the <b>oversold zone (below 20)</b>, ideally after both lines have hooked downward first. A golden cross near 80 is late and unreliable. Mirror the logic for the death cross above 80.
        <span class="zh">经典的看涨形态是<b>超卖区（20 以下）的金叉</b>，最好是在两条线先向下钩过之后。在 80 附近的金叉太晚、不可靠。高位死叉同理，反过来用。</span></p>
      <div class="note">// Cross quality: oversold golden cross &gt; mid-range cross &gt; overbought golden cross. 交叉质量排序：超卖金叉 &gt; 中段金叉 &gt; 超买金叉。</div>
    </div>
  </article>
</section>

<!-- ================= PART 04 · DIVERGENCE ================= -->
<section class="divider">
  <div class="rail reveal">Part 04 · 第四部分</div>
  <h2 class="reveal">Divergence</h2>
  <div class="zh reveal">背 离</div>
</section>

<section class="section" id="divergence">
  <div class="group-head reveal"><span class="tier">04</span>
    <div><div class="eyebrow">Momentum vs price · 动能与价格</div><h2 class="title">When Price Lies</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">S.06</span><h3>Bearish &amp; Bullish Divergence<span class="zh">顶背离 · 底背离</span></h3><span class="tag bear">Warning</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="stoDivergence"></div>
      <figcaption>Price makes a higher high while %K makes a lower high — bearish divergence<span class="zh">价格创新高，%K 却没能创新高——顶背离</span></figcaption></figure>
    <div class="pattern-desc">
      <p><b>Bearish divergence</b>: price prints a new high, but %K fails to exceed its previous peak. The move is running out of momentum — the crowd is still buying, but the tape is no longer confirming. It is a <b>warning</b>, not a reversal signal by itself.
        <span class="zh"><b>顶背离</b>：价格创新高，%K 却没有突破前一个高点。这波上涨的动能正在衰竭——人群还在买，但盘面已经不再确认。它是个<b>警告</b>，单靠它不能构成反转信号。</span></p>
      <p><b>Bullish divergence</b> is the mirror: price makes a lower low while %K prints a higher low — selling pressure is fading. Divergence works best at the edges (near 80/20) and as a <b>filter</b>, not a standalone entry.
        <span class="zh"><b>底背离</b>正好相反：价格创新低，%K 却做出更高的低点——抛压在衰竭。背离在边缘位置（80/20 附近）最有效，而且应该当<b>过滤器</b>用，不是单独的进场信号。</span></p>
      <div class="note">// Divergence can persist for a long time in trends. Wait for confirmation (a cross or price action) before acting. 趋势中背离可以持续很久。先等确认（交叉或价格行为）再动手。</div>
    </div>
  </article>
</section>

<!-- ================= PART 05 · SLOW VS FAST ================= -->
<section class="divider">
  <div class="rail reveal">Part 05 · 第五部分</div>
  <h2 class="reveal">Fast vs Slow</h2>
  <div class="zh reveal">快 速 与 慢 速</div>
</section>

<section class="section" id="slowfast">
  <div class="group-head reveal"><span class="tier">05</span>
    <div><div class="eyebrow">Sensitivity · 灵敏度</div><h2 class="title">Fast, Slow, and the Noise</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">S.07</span><h3>Slow vs Fast Stochastic<span class="zh">慢速 vs 快速</span></h3><span class="tag neu">Smoothing</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="stoSlow"></div>
      <figcaption>Fast %K reacts to every bar; slow %K filters the spikes<span class="zh">快速 %K 每根 K 线都反应；慢速 %K 过滤掉毛刺</span></figcaption></figure>
    <div class="pattern-desc">
      <p><b>Fast stochastic</b> (slowing 1) follows price bar by bar — sensitive, but full of whipsaws. <b>Slow stochastic</b> (slowing 3, the MT5 default) smooths %K before drawing it — fewer signals, and fewer false ones.
        <span class="zh"><b>快速随机指标</b>（平滑 1）逐根 K 线紧跟价格——灵敏，但充满假动作。<b>慢速随机指标</b>（平滑 3，MT5 默认）先把 %K 平滑再画——信号更少，假信号也更少。</span></p>
      <p>Slow stochastic is what most traders actually mean by "Stochastic" — it is the standard preset on MT5 and TradingView. Use fast only if you scalp and can tolerate noise.
        <span class="zh">大多数人口中的「随机指标」其实就是慢速版——它是 MT5 和 TradingView 的默认预设。只有超短线才用快速版，而且要能忍受噪音。</span></p>
      <div class="note">// Same levels, same crosses — only the smoothness changes. 规则完全一样（水平线、交叉），变的只是平滑程度。</div>
    </div>
  </article>
</section>

<!-- ================= PART 06 · RSI VS STOCHASTIC ================= -->
<section class="divider">
  <div class="rail reveal">Part 06 · 第六部分</div>
  <h2 class="reveal">RSI vs Stochastic</h2>
  <div class="zh reveal">与 R S I 的 区 别</div>
</section>

<section class="section" id="rsivs">
  <div class="group-head reveal"><span class="tier">06</span>
    <div><div class="eyebrow">Two oscillators · 两个震荡指标</div><h2 class="title">Different Questions, Different Speed</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">S.08</span><h3>Why Stochastic Is More Sensitive<span class="zh">为什么随机指标更敏感</span></h3><span class="tag neu">Compare</span></div>
    <div class="pattern-desc">
      <p>Both are bounded oscillators, but they answer different questions. RSI asks <b>"how strong is the recent momentum?"</b> Stochastic asks <b>"where is the close inside the range?"</b> That is why Stochastic reacts faster to price — a single close near the range edge moves it hard.
        <span class="zh">两者都是有边界的震荡指标，但回答的问题不同。RSI 问<b>「近期动能有多强？」</b>，随机指标问<b>「收盘价在区间内什么位置？」</b>。这就是为什么随机指标对价格更敏感——一根收在区间边缘的 K 线就能让它大幅跳动。</span></p>
      <div class="cmp">
        <div class="col">
          <div class="ch">RSI · 相对强弱</div>
          <ol>
            <li>Measures average <b>gains vs losses</b> over N periods — internal momentum.<span class="zh">衡量 N 期内平均涨幅与跌幅之比——内部动能。</span></li>
            <li>Reads 0–100 with classic 70/30 zones.<span class="zh">0–100，经典区域 70/30。</span></li>
            <li>Smoother and more stable — reacts with a lag.<span class="zh">更平滑、更稳定——反应有滞后。</span></li>
          </ol>
          <div class="verdict">// Slow &amp; steady 慢而稳</div>
        </div>
        <div class="col">
          <div class="ch">STOCHASTIC · 随机指标</div>
          <ol>
            <li>Measures where the close sits <b>inside the recent range</b> — relative position.<span class="zh">衡量收盘价在近期区间内的位置——相对位置。</span></li>
            <li>Reads 0–100 with 80/20 zones.<span class="zh">0–100，区域 80/20。</span></li>
            <li>More sensitive — every close moves it, more spikes.<span class="zh">更灵敏——每根收盘价都影响它，毛刺更多。</span></li>
          </ol>
          <div class="verdict">// Fast &amp; jumpy 快而跳</div>
        </div>
      </div>
      <p style="margin-top:18px;">In practice they often agree, and many traders use them together: RSI for the bigger momentum picture, Stochastic for finer timing. Just remember they are cousins, not the same tool.
        <span class="zh">实战中两者常常同步，很多交易者会一起用：RSI 看大方向的动能，随机指标做更精细的择时。但要记住它们是表亲，不是同一个工具。</span></p>
      <div class="note">// If you only keep one, keep the one whose question matches your style. 如果只留一个，就留那个「问题」最贴合你交易风格的工具。</div>
    </div>
  </article>
</section>

<!-- ================= PART 07 · TREND & MISUSE ================= -->
<section class="divider">
  <div class="rail reveal">Part 07 · 第七部分</div>
  <h2 class="reveal">Trend &amp; Misuse</h2>
  <div class="zh reveal">趋 势 与 误 用</div>
</section>

<section class="section" id="trend">
  <div class="group-head reveal"><span class="tier">07</span>
    <div><div class="eyebrow">Context first · 先看背景</div><h2 class="title">Stochastic Inside a Trend</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">S.09</span><h3>Buy Dips in Uptrends, Sell Rallies in Downtrends<span class="zh">顺势回调进场</span></h3><span class="tag bull">Trend filter</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="stoTrend"></div>
      <figcaption>Uptrend: buy when the oscillator dips and turns up — it rarely needs to reach 20<span class="zh">上升趋势：等指标回落并拐头时买入——它很少需要跌到 20</span></figcaption></figure>
    <div class="pattern-desc">
      <p>Stochastic is a <b>mean-reversion tool</b>: it shines in ranges, where price swings between stretched and stretched-the-other-way. In an uptrend, the "buy zone" is not 20 — it is any dip where price holds a higher low and %K turns up again.
        <span class="zh">随机指标是<b>均值回归工具</b>：它在震荡市里最好用，价格在两个拉伸方向之间来回摆动。在上升趋势里，「买入区」不是 20——而是价格守住更高低点、%K 重新拐头向上的任何一次回调。</span></p>
      <p>Filter first: is price above the trendline, making higher lows? Then only take <b>bullish</b> setups. In a downtrend, only take bearish ones. Stochastic tells you when the swing is stretched; the trend tells you which way to trade it.
        <span class="zh">先过滤：价格是否在趋势线上方、是否在抬高低点？是，就只做<b>看涨</b>形态。下降趋势里只做看跌形态。随机指标告诉你摆动何时被拉伸；趋势告诉你该往哪个方向交易。</span></p>
      <div class="note">// One-direction rule: never take counter-trend Stochastic signals without strong divergence. 单向原则：没有强烈背离，就不要做逆势的随机指标信号。</div>
    </div>
  </article>
</section>

<section class="section" id="mistakes">
  <div class="group-head reveal"><span class="tier">08</span>
    <div><div class="eyebrow">Where it breaks · 它失效的地方</div><h2 class="title">The #1 Misuse</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">S.10</span><h3>A Range Tool Used in a Trend<span class="zh">震荡工具用在趋势市</span></h3><span class="tag bear">Common error</span></div>
    <div class="pattern-desc">
      <p>The single most common misuse: trading Stochastic as a standalone system in a trending market. In a strong trend the oscillator <b>stalls (钝化)</b> — it camps in the overbought/oversold zone, and every "overbought, sell" fires early and gets run over.
        <span class="zh">最常见的误用：在趋势市里把随机指标当独立系统用。强趋势中指标会<b>钝化</b>——长期停在超买/超卖区，每一次「超买就做空」都过早触发，然后被趋势碾过去。</span></p>
      <div class="cmp">
        <div class="col bad">
          <div class="ch">✗ THE MISTAKE · 常见错误</div>
          <ol>
            <li>Strong uptrend: the oscillator pins above 80 for days.<span class="zh">强上升趋势：指标连续多天贴死在 80 上方。</span></li>
            <li>Trader sells the "overbought" — the trend keeps going, stop hit.<span class="zh">交易者看到「超买」就做空——趋势继续走，止损被打掉。</span></li>
            <li>In a strong downtrend the same thing happens below 20.<span class="zh">强下降趋势里，20 下方会发生同样的事。</span></li>
          </ol>
          <div class="verdict">// Stuck &amp; wrong 钝化 · 做反</div>
        </div>
        <div class="col good">
          <div class="ch">✓ THE FIX · 正确用法</div>
          <ol>
            <li>Check the higher timeframe / trendline first.<span class="zh">先看大周期 / 趋势线。</span></li>
            <li>In a trend: wait for a pullback + turn, trade with the trend.<span class="zh">趋势中：等回调 + 拐头，顺势交易。</span></li>
            <li>In a range: use the 80/20 zones and crosses normally.<span class="zh">震荡市：正常使用 80/20 区域和交叉。</span></li>
          </ol>
          <div class="verdict">// Filtered &amp; right 过滤 · 做对</div>
        </div>
      </div>
      <p style="margin-top:18px;">Stochastic earns its keep in <b>ranging markets</b>, or as a <b>timing filter inside a trend</b>. If you remember one rule from this module: <b>the market environment decides whether the indicator works</b>.
        <span class="zh">随机指标在<b>震荡市</b>里最能发挥价值，或者作为<b>顺势交易里的择时过滤器</b>。如果这一课只记一条规则，那就是：<b>由市场环境决定指标是否有效</b>。</span></p>
      <div class="note">// 震荡市用它找拐点，趋势市用它找回调点——方向永远由趋势定。 Use it to find turns in ranges and pullbacks in trends — direction is always set by the trend.</div>
    </div>
  </article>
</section>

<!-- ================= EXAM MODULE ================= -->
<section class="section" id="exam" style="padding-top:70px;">
  <div class="group-head reveal">
    <span class="tier">EXAM</span>
    <div><div class="eyebrow">Module Check · 模块测验</div><h2 class="title">Pass the Quiz to Unlock Module 20<span class="zh">通过测验解锁下一课</span></h2></div>
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

<!-- ================= CLOSING ================= -->
<section class="closing">
  <p class="quote">The indicator is a mirror, not a crystal ball.<br>It shows where price is stretched — it does not tell the future.</p>
  <div class="quote-zh">指标是镜子，不是水晶球。它只告诉你价格被拉伸到了哪里，不负责预测未来。</div>
  <div class="verbs">
    <span>Context First</span><span class="sep">·</span><span>Range Tool</span><span class="sep">·</span><span>Trend Filter</span>
  </div>
  <img class="logo-close" src="data:image/jpeg;base64,{{LOGO}}">
  <div class="once">Once hope it possible</div>
</section>

<!-- ================= FOOTER ================= -->
<footer class="footer">
  <div class="footer-in">
    <div class="disc-title reveal">Disclaimer · 免责声明</div>
    <p class="disc reveal">This document is for educational purposes only and does not constitute financial, investment, or legal advice. All figures, prices and examples are illustrative.
      <span class="zh">本文件仅供教育用途，不构成任何财务、投资或法律建议。文中所有数字、价格与案例均为示意。</span></p>
    <p class="disc reveal">Indicator settings and their defaults vary between platforms and brokers — MT5, TradingView and others may plot slightly different values for the same preset. Always confirm what your own chart is showing.
      <span class="zh">指标的参数与默认值在不同平台和券商之间会有差异——MT5、TradingView 等对同一预设可能画出略有不同的数值。请务必确认你自己图表上的实际显示。</span></p>
    <p class="disc reveal">Trading involves substantial risk. Indicators improve the quality of your decisions; they do not guarantee profit, and no oscillator can eliminate the risk of loss.
      <span class="zh">交易存在重大风险。指标能提高决策质量，但不保证获利；没有任何震荡指标能消除亏损风险。</span></p>
    <p class="disc reveal">This document is owned by Make Trades Journey and may not be used by third parties for commercial or other purposes without permission.
      <span class="zh">本文件版权归 Make Trades Journey 所有，未经许可，第三方不得用于商业或其他用途。</span></p>

    <div class="foot-brand reveal">
      <img src="data:image/jpeg;base64,{{LOGO}}">
      <div class="txt">
        <b>Make Trades Journey</b>
        <span>By XRs Trading Lab</span>
        <span class="zh">学习 · 交易 · 盈利 · 享受 — Once hope it possible</span>
      </div>
    </div>
    <div class="copy reveal">© <span id="yr"></span> Make Trades Journey · By XRs Trading Lab · Stochastic Indicator</div>
  </div>
</footer>

</div><!-- /wrap -->'''
WRAP = WRAP.replace("{{LOGO}}", LOGO)
a, b = s.split('<div class="wrap">', 1); b2, rest = b.split('</div><!-- /wrap -->', 1)
s = a + WRAP + rest

# ---------- 5. draw functions ----------
DRAWJS = '''/* ============ Stochastic Oscillator charts ============ */

/* 1. MT5 sub-window: %K / %D */
function drawSTOMT5(box){
  const W=780,H=450,L=46,R=36,T=14,B=18;
  const s=svgFor(box,W,H);
  const pT=14,pH=196,oY0=252,oH=158;
  const cd=[[100,102,103,99],[102,101,104,100],[101,104,105,100],[104,103,106,102],
            [103,100,104,99],[100,98,101,97],[98,96,99,95],[96,98,100,95],
            [98,101,102,97],[101,104,105,100],[104,107,108,103],[107,106,109,105],
            [106,109,110,105],[109,112,113,108],[112,114,116,111],[114,116,117,113]];
  const n=cd.length,plotW=W-L-R,bw=plotW/n*0.62;
  const X=i=>L+plotW/n*(i+0.5);
  const Yp=v=>pT+pH-(v-90)/(117-90)*pH;
  const Yo=v=>oY0+oH-(v/100)*oH;
  el('rect',{x:L-6,y:pT-10,width:plotW+12,height:pH+16,rx:8,fill:'rgba(255,255,255,.014)',stroke:'rgba(232,200,119,.10)'},s);
  txt(s,L+plotW/2,pT+16,'PRICE  价格 — dips below the range, then reclaims it',{'text-anchor':'middle','font-size':9,fill:C.muted2,'letter-spacing':'.14em'});
  cd.forEach((k,i)=>{
    const g=el('g',{style:'--i:'+i,class:'cndl'},s);
    const up=k.c>=k.o, col=up?C.bull:C.bear, x=X(i);
    el('line',{x1:x,x2:x,y1:Yp(k[3]),y2:Yp(k[2]),class:'wick '+(up?'bull':'bear')},g);
    const y1=Yp(Math.max(k[0],k[1])),y2=Yp(Math.min(k[0],k[1]));
    el('rect',{x:x-bw/2,y:y1,width:bw,height:Math.max(y2-y1,2),rx:1.5,class:'body '+(up?'bull':'bear')},g);
  });
  el('rect',{x:L-6,y:oY0-10,width:plotW+12,height:oH+16,rx:8,fill:'rgba(255,255,255,.014)',stroke:'rgba(232,200,119,.10)'},s);
  [80,50,20].forEach(v=>{el('line',{x1:L,x2:L+plotW,y1:Yo(v),y2:Yo(v),class:'rgrid'},s);txt(s,L-8,Yo(v)+3.5,v,{'text-anchor':'end',class:'rax'});});
  el('rect',{x:L,y:Yo(80),width:plotW,height:Yo(0)-Yo(80),fill:'rgba(255,92,99,.05)'},s);
  el('rect',{x:L,y:Yo(20),width:plotW,height:Yo(20)-Yo(0),fill:'rgba(44,217,138,.05)'},s);
  const kArr=[55,48,62,58,38,22,8,15,32,48,63,58,68,78,85,82];
  const dArr=[55,52,55,56,53,39,23,15,18,32,48,56,63,68,77,82];
  const line=(arr,col,w,delay)=>{const pts=arr.map((v,i)=>[X(i),Yo(v)]);
    el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
      stroke:col,'stroke-width':w,'stroke-linecap':'round',class:'rline',style:'transition-delay:'+delay+'s'},s);};
  line(kArr,C.cyan,2,.15);line(dArr,C.gold,2.2,.3);
  const lg=el('g',{style:'--i:17'},s);
  el('line',{x1:L+250,y1:oY0+oH+22,x2:L+268,y2:oY0+oH+22,stroke:C.cyan,'stroke-width':2},lg);
  txt(lg,L+274,oY0+oH+26,'%K (5)',{'font-size':10,fill:C.cyan});
  el('line',{x1:L+330,y1:oY0+oH+22,x2:L+348,y2:oY0+oH+22,stroke:C.gold,'stroke-width':2.2},lg);
  txt(lg,L+354,oY0+oH+26,'%D (3)',{'font-size':10,fill:C.gold});
  txt(lg,L+430,oY0+oH+26,'Stochastic Oscillator (5,3,3) · MT5 sub-window',{'font-size':9.5,fill:C.muted2,'letter-spacing':'.14em'});
}

/* 2. overbought / oversold levels */
function drawSTOLevels(box){
  const W=780,H=340,L=46,R=24,T=26,B=34;
  const s=svgFor(box,W,H);
  const plotW=W-L-R,plotH=H-T-B;
  const X=i=>L+plotW/24*(i+0.5);
  const Y=v=>T+plotH-(v/100)*plotH;
  [80,50,20].forEach(v=>{el('line',{x1:L,x2:L+plotW,y1:Y(v),y2:Y(v),class:'rgrid'},s);txt(s,L-8,Y(v)+3.5,v,{'text-anchor':'end',class:'rax'});});
  el('rect',{x:L,y:Y(100),width:plotW,height:Y(80)-Y(100),fill:'rgba(255,92,99,.06)'},s);
  el('rect',{x:L,y:Y(20),width:plotW,height:Y(0)-Y(20),fill:'rgba(44,217,138,.06)'},s);
  txt(s,L+plotW/2,Y(80)-10,'OVERBOUGHT  超买区',{'text-anchor':'middle','font-size':9,fill:C.bear,'letter-spacing':'.18em','opacity':.75});
  txt(s,L+plotW/2,Y(20)+16,'OVERSOLD  超卖区',{'text-anchor':'middle','font-size':9,fill:C.bull,'letter-spacing':'.18em','opacity':.75});
  const kArr=[50,44,38,30,24,18,12,9,14,22,30,38,46,55,64,72,78,84,88,86,80,72,63,55];
  const dArr=[null,null,44,37.3,30.7,24,18,13,11.7,15,22,30,38,46.3,55,63.7,71.3,78,83.3,86,84.7,79.3,71.7,63.3];
  const line=(arr,col,w,delay)=>{const pts=arr.map((v,i)=>v==null?null:[X(i),Y(v)]).filter(Boolean);
    el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
      stroke:col,'stroke-width':w,'stroke-linecap':'round',class:'rline',style:'transition-delay:'+delay+'s'},s);};
  line(kArr,C.cyan,2,.1);line(dArr,C.gold,2,.25);
  const g1=el('g',{style:'--i:8'},s);
  el('circle',{cx:X(7),cy:Y(9),r:5,fill:C.bull,class:'rlbl'},g1);
  txt(g1,X(7),Y(9)+18,'%K 9 — oversold  超卖',{'text-anchor':'middle','font-size':10,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif"});
  const g2=el('g',{style:'--i:18'},s);
  el('circle',{cx:X(18),cy:Y(88),r:5,fill:C.bear,class:'rlbl'},g2);
  txt(g2,X(18),Y(88)-14,'%K 88 — overbought  超买',{'text-anchor':'middle','font-size':10,fill:C.bear,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L+plotW/2,H-8,'%K CYAN · %D GOLD — STRETCHED ZONES AT THE EDGES',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.18em'});
}

/* 3. golden cross (low) / death cross (high) */
function drawSTOCross(box){
  const W=780,H=360,L=46,R=24,T=22,B=26;
  const s=svgFor(box,W,H);
  const pw=(W-L-R-30)/2;
  const X0=(ox,i)=>ox+pw/10*(i+0.5);
  const Y=(v,oT)=>oT+150-(v/100)*150;
  const panel=(ox,title,zoneV,zoneCol,kArr,dArr,crossI,crossLvl,crossCol,crossTxt,arrowDir)=>{
    const oT=T+16;
    el('rect',{x:ox-6,y:oT-12,width:pw+12,height:174,rx:8,fill:'rgba(255,255,255,.014)',stroke:'rgba(232,200,119,.10)'},s);
    txt(s,ox+pw/2,oT+6,title,{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.14em'});
    [zoneV].forEach(v=>{el('line',{x1:ox,x2:ox+pw,y1:Y(v,oT),y2:Y(v,oT),class:'rgrid'},s);txt(s,ox-8,Y(v,oT)+3.5,v,{'text-anchor':'end',class:'rax'});});
    el('rect',{x:ox,y:zoneV>50?Y(100,oT):Y(20,oT),width:pw,height:zoneV>50?(Y(80,oT)-Y(100,oT)):(Y(20,oT)-Y(0,oT)),fill:zoneCol},s);
    const line=(arr,col,w,delay)=>{const pts=arr.map((v,i)=>v==null?null:[X0(ox,i),Y(v,oT)]).filter(Boolean);
      el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
        stroke:col,'stroke-width':w,'stroke-linecap':'round',class:'rline',style:'transition-delay:'+delay+'s'},s);};
    line(kArr,C.cyan,2,.1);line(dArr,C.gold,2,.25);
    el('line',{x1:X0(ox,crossI),x2:X0(ox,crossI),y1:Y(100,oT),y2:Y(0,oT),stroke:crossCol,'stroke-width':1,'stroke-dasharray':'3 4','opacity':.6,class:'rline'},s);
    const g=el('g',{style:'--i:10'},s);
    el('circle',{cx:X0(ox,crossI),cy:Y(crossLvl,oT),r:6,fill:'none',stroke:crossCol,'stroke-width':2.2,class:'rlbl'},g);
    el('path',{d:'M'+(X0(ox,crossI)+18)+','+(Y(crossLvl,oT)+ (arrowDir>0?22:-22))+' L'+(X0(ox,crossI)+18)+','+(Y(crossLvl,oT)+(arrowDir>0?2:-2)),
      stroke:crossCol,'stroke-width':2,'stroke-linecap':'round',class:'rline'},g);
    txt(g,X0(ox,crossI),Y(crossLvl,oT)+(arrowDir>0?-12:26),crossTxt,{'text-anchor':'middle','font-size':11,'font-weight':700,fill:crossCol,'font-family':"'Noto Sans SC',sans-serif"});
  };
  panel(L,'GOLDEN CROSS BELOW 20  低位金叉',20,'rgba(44,217,138,.07)',
    [55,42,30,20,12,8,10,18,28,40],[null,null,42.3,30.7,20.7,13.3,10,12,18.7,28.7],
    7,15,C.bull,'金叉 · BUY',1);
  panel(L+pw+30,'DEATH CROSS ABOVE 80  高位死叉',80,'rgba(255,92,99,.07)',
    [45,55,65,74,82,88,90,84,74,62],[null,null,55,64.7,73.7,81.3,86.7,87.3,82.7,73.3],
    7,85,C.bear,'死叉 · SELL',-1);
  txt(s,L+pw+15,H-6,'%K  CYAN · %D  GOLD   —  LOCATION DECIDES QUALITY',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.16em'});
}

/* 4. bearish divergence */
function drawSTODivergence(box){
  const W=780,H=440,L=46,R=24,T=16,B=20;
  const s=svgFor(box,W,H);
  const pT=16,pH=196,oY0=252,oH=158;
  const n=18,plotW=W-L-R;
  const X=i=>L+plotW*(i/(n-1));
  const Yp=v=>pT+pH-(v-74)/(108-74)*pH;
  const Yo=v=>oY0+oH-(v/100)*oH;
  el('rect',{x:L-6,y:pT-8,width:plotW+12,height:pH+14,rx:8,fill:'rgba(255,255,255,.014)',stroke:'rgba(232,200,119,.10)'},s);
  txt(s,L+plotW/2,pT+10,'PRICE  价格 — NEW HIGH 新高',{'text-anchor':'middle','font-size':9,fill:C.muted2,'letter-spacing':'.14em'});
  const price=[78,80,84,88,92,97,100,96,90,92,97,102,106,102,96,92,90,91];
  const kArr=[40,45,52,60,66,70,68,60,52,50,55,58,62,56,48,42,40,41];
  const dArr=[null,null,45.7,52.3,59.3,65.3,68,66,60,54,52.3,54.3,58.3,58.7,55.3,48.7,43.3,41];
  const poly=(arr,Xf,Yf,col,w,delay)=>{const pts=arr.map((v,i)=>[Xf(i),Yf(v)]);
    el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
      stroke:col,'stroke-width':w,'stroke-linecap':'round',class:'rline',style:'transition-delay:'+delay+'s'},s);};
  poly(price,X,Yp,C.text,2.2,.1);
  el('rect',{x:L-6,y:oY0-8,width:plotW+12,height:oH+14,rx:8,fill:'rgba(255,255,255,.014)',stroke:'rgba(232,200,119,.10)'},s);
  txt(s,L+plotW/2,oY0+10,'%K  随机指标 — LOWER HIGH 更低的高点',{'text-anchor':'middle','font-size':9,fill:C.muted2,'letter-spacing':'.14em','font-family':"'Noto Sans SC',sans-serif"});
  [80,50,20].forEach(v=>{el('line',{x1:L,x2:L+plotW,y1:Yo(v),y2:Yo(v),class:'rgrid'},s);txt(s,L-8,Yo(v)+3.5,v,{'text-anchor':'end',class:'rax'});});
  poly(dArr,X,Yo,C.gold,1.4,.35);
  poly(kArr,X,Yo,C.cyan,2.1,.2);
  [6,12].forEach(i=>el('line',{x1:X(i),x2:X(i),y1:pT,y2:Yo(0),stroke:'rgba(232,200,119,.22)','stroke-width':1,'stroke-dasharray':'3 5',class:'rline'},s));
  const tg1=el('g',{style:'--i:14'},s);
  el('line',{x1:X(6),y1:Yp(100),x2:X(12),y2:Yp(106),stroke:C.bull,'stroke-width':1.8,'stroke-dasharray':'5 4',class:'rline'},tg1);
  txt(tg1,(X(6)+X(12))/2,Yp(106)-10,'HIGHER HIGH 更高的高点',{'text-anchor':'middle','font-size':10,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif"});
  const tg2=el('g',{style:'--i:15'},s);
  el('line',{x1:X(5),y1:Yo(70),x2:X(12),y2:Yo(62),stroke:C.bear,'stroke-width':1.8,'stroke-dasharray':'5 4',class:'rline'},tg2);
  txt(tg2,(X(5)+X(12))/2,Yo(62)-10,'LOWER HIGH 更低的高点',{'text-anchor':'middle','font-size':10,fill:C.bear,'font-family':"'Noto Sans SC',sans-serif"});
  const g3=el('g',{style:'--i:16'},s);
  el('circle',{cx:X(6),cy:Yp(100),r:5,fill:C.bull,class:'rlbl'},g3);
  el('circle',{cx:X(12),cy:Yp(106),r:5,fill:C.bull,class:'rlbl'},g3);
  el('circle',{cx:X(5),cy:Yo(70),r:5,fill:C.bear,class:'rlbl'},g3);
  el('circle',{cx:X(12),cy:Yo(62),r:5,fill:C.bear,class:'rlbl'},g3);
  txt(s,L+plotW/2,H-6,'BEARISH DIVERGENCE  顶背离 — PRICE UP, %K DOWN',{'text-anchor':'middle','font-size':10,'font-weight':700,fill:C.bear,'letter-spacing':'.16em','font-family':"'Noto Sans SC',sans-serif"});
}

/* 5. fast vs slow */
function drawSTOSlow(box){
  const W=780,H=340,L=46,R=24,T=26,B=34;
  const s=svgFor(box,W,H);
  const plotW=W-L-R,plotH=H-T-B;
  const X=i=>L+plotW/22*(i+0.5);
  const Y=v=>T+plotH-(v/100)*plotH;
  [80,50,20].forEach(v=>{el('line',{x1:L,x2:L+plotW,y1:Y(v),y2:Y(v),class:'rgrid'},s);txt(s,L-8,Y(v)+3.5,v,{'text-anchor':'end',class:'rax'});});
  const fast=[45,60,52,48,70,55,40,62,48,38,58,66,50,72,60,46,64,52,42,60,70,58];
  const slow=[null,null,52.3,53.3,57.7,55,49,53.3,49.3,48,48,54,58,62.7,59.3,57.3,50.7,54,52.7,51.3,57.3,62.7];
  const line=(arr,col,w,delay,dash)=>{const pts=arr.map((v,i)=>v==null?null:[X(i),Y(v)]).filter(Boolean);
    el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
      stroke:col,'stroke-width':w,'stroke-linecap':'round','stroke-dasharray':dash||'none',class:'rline',style:'transition-delay:'+delay+'s'},s);};
  line(fast,C.cyan,1.6,.1,'2 3');
  line(slow,C.gold,2.6,.3);
  const g1=el('g',{style:'--i:12'},s);
  el('circle',{cx:X(13),cy:Y(72),r:5,fill:C.cyan,class:'rlbl'},g1);
  txt(g1,X(13),Y(72)-14,'FAST %K (5,1,3)  快速 — 毛刺多',{'text-anchor':'middle','font-size':10,fill:C.cyan,'font-family':"'Noto Sans SC',sans-serif"});
  const g2=el('g',{style:'--i:20'},s);
  el('circle',{cx:X(13),cy:Y(62.7),r:5,fill:C.gold,class:'rlbl'},g2);
  txt(g2,X(13),Y(62.7)+20,'SLOW %K (5,3,3)  慢速 — 更平滑',{'text-anchor':'middle','font-size':10,fill:C.gold,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L+plotW/2,H-8,'FAST JUMPS · SLOW FILTERS — SAME RULES, LESS NOISE',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.16em'});
}

/* 6. trend filter — buy dips in an uptrend */
function drawSTOTrend(box){
  const W=780,H=440,L=46,R=24,T=16,B=20;
  const s=svgFor(box,W,H);
  const pT=16,pH=196,oY0=252,oH=158;
  const n=18,plotW=W-L-R;
  const X=i=>L+plotW*(i/(n-1));
  const Yp=v=>pT+pH-(v-56)/(100-56)*pH;
  const Yo=v=>oY0+oH-(v/100)*oH;
  el('rect',{x:L-6,y:pT-8,width:plotW+12,height:pH+14,rx:8,fill:'rgba(255,255,255,.014)',stroke:'rgba(232,200,119,.10)'},s);
  txt(s,L+plotW/2,pT+10,'PRICE  价格 — UPTREND, HIGHER LOWS 上升趋势 · 更高的低点',{'text-anchor':'middle','font-size':9,fill:C.muted2,'letter-spacing':'.14em','font-family':"'Noto Sans SC',sans-serif"});
  const price=[60,64,70,66,62,68,76,80,84,80,75,82,90,94,98,93,88,95];
  const kArr=[50,55,62,58,48,40,45,55,65,60,50,44,52,62,70,64,56,60];
  const dArr=[null,null,55.7,58.3,56,50,44.3,46.7,55,60,58.3,54.7,48.7,49.3,56,61.3,63.3,60];
  const poly=(arr,Xf,Yf,col,w,delay)=>{const pts=arr.map((v,i)=>[Xf(i),Yf(v)]);
    el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
      stroke:col,'stroke-width':w,'stroke-linecap':'round',class:'rline',style:'transition-delay:'+delay+'s'},s);};
  poly(price,X,Yp,C.text,2.2,.1);
  const tg=el('g',{style:'--i:13'},s);
  el('line',{x1:X(4),y1:Yp(62),x2:X(16),y2:Yp(88),stroke:C.gold,'stroke-width':1.6,'stroke-dasharray':'6 4',class:'rline'},tg);
  txt(tg,X(16)+6,Yp(88)-6,'TRENDLINE 趋势线',{'font-size':9.5,fill:C.gold,'font-family':"'Noto Sans SC',sans-serif"});
  el('rect',{x:L-6,y:oY0-8,width:plotW+12,height:oH+14,rx:8,fill:'rgba(255,255,255,.014)',stroke:'rgba(232,200,119,.10)'},s);
  txt(s,L+plotW/2,oY0+10,'%K 随机指标 — DIPS STAY ABOVE 20 回调不破 20',{'text-anchor':'middle','font-size':9,fill:C.muted2,'letter-spacing':'.14em','font-family':"'Noto Sans SC',sans-serif"});
  [80,50,20].forEach(v=>{el('line',{x1:L,x2:L+plotW,y1:Yo(v),y2:Yo(v),class:'rgrid'},s);txt(s,L-8,Yo(v)+3.5,v,{'text-anchor':'end',class:'rax'});});
  poly(dArr,X,Yo,C.gold,1.4,.35);
  poly(kArr,X,Yo,C.cyan,2.1,.2);
  [6,12].forEach(i=>el('line',{x1:X(i),x2:X(i),y1:pT,y2:Yo(0),stroke:'rgba(232,200,119,.22)','stroke-width':1,'stroke-dasharray':'3 5',class:'rline'},s));
  [[6,45],[12,52]].forEach((p,i)=>{
    const g=el('g',{style:'--i:'+(14+i)},s);
    el('circle',{cx:X(p[0]),cy:Yo(p[1]),r:5,fill:C.bull,class:'rlbl'},g);
    txt(g,X(p[0]),Yo(p[1])+(i?20:-12),'BUY DIP 回调买入',{'text-anchor':'middle','font-size':10,'font-weight':700,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif"});
  });
  txt(s,L+plotW/2,H-6,'IN AN UPTREND, BUY THE TURN — NOT THE 20 LINE',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.16em'});
}

const RENDER={stoMT5:drawSTOMT5,stoLevels:drawSTOLevels,stoCross:drawSTOCross,stoDivergence:drawSTODivergence,stoSlow:drawSTOSlow,stoTrend:drawSTOTrend};
document.querySelectorAll('.rchart[data-r]').forEach(b=>{const f=RENDER[b.dataset.r];if(f)f(b);});

/* scaleX bars need their own keyframe since .rbar uses scaleY */
const styleFix=document.createElement('style');
styleFix.textContent='.in .rbar[style*="scaleX"]{transform:scaleX(1)!important;}';
document.head.appendChild(styleFix);'''

a, b = s.split('/* ============ 1. recovery curve ============ */', 1)
b2, rest = b.split('document.head.appendChild(styleFix);', 1)
s = a + DRAWJS + rest

# ---------- 6. exam module ----------
s = s.replace("/* ===== MTJ EXAM MODULE - Module 10 ===== */",
              "/* ===== MTJ EXAM MODULE - Module 19 ===== */")
s = s.replace('"mtj_exam_pass_10"', '"mtj_exam_pass_19"')

exam_qs = [
  {"q": "What does the Stochastic Oscillator measure?",
   "opts": ["Average gains vs average losses over N periods",
            "Where the closing price sits inside the recent high–low range",
            "Volume-weighted price momentum",
            "Distance from the 200-period moving average"],
   "ans": 1,
   "why": "%K = (Close − Lowest Low) ÷ (Highest High − Lowest Low) × 100. It locates the latest close inside the look-back range — a direct read on short-term momentum.",
   "why_zh": "%K =（收盘价 − 最低价）÷（最高价 − 最低价）× 100。它衡量最新收盘价在回看区间内的位置——直接反映短期动能。"},
  {"q": "What are MT5's default Stochastic Oscillator parameters?",
   "opts": ["14, 3, 3", "5, 3, 3", "9, 1, 3", "20, 5, 5"],
   "ans": 1,
   "why": "MT5 defaults to 5, 3, 3 (%K period 5, %D period 3, slowing 3). The classic 14, 3, 3 is the other common choice — 14 is smoother, 5 is more sensitive.",
   "why_zh": "MT5 默认参数是 5, 3, 3（%K 周期 5、%D 周期 3、平滑 3）。经典的 14, 3, 3 是另一个常用选择——14 更平滑，5 更灵敏。"},
  {"q": "A golden cross (%K crossing above %D) is most reliable when it happens…",
   "opts": ["Above 80", "Below 20", "Exactly at 50", "Anywhere — location doesn't matter"],
   "ans": 1,
   "why": "The classic bullish setup is a golden cross in the oversold zone (below 20). A golden cross near 80 is late, and in strong trends it is often a false signal.",
   "why_zh": "经典的看涨形态是超卖区（20 以下）的金叉。在 80 附近的金叉太晚，强趋势里还常常是假信号。"},
  {"q": "Bearish divergence means…",
   "opts": ["Price makes a higher high but %K makes a lower high",
            "%K crosses below %D below 20",
            "Both %K and %D stay above 80",
            "Price makes a lower low while %K makes a higher low"],
   "ans": 0,
   "why": "Price printing a new high while %K fails to confirm means momentum is fading — a warning that the move may be exhausting. It is a filter, not a standalone reversal signal.",
   "why_zh": "价格创新高但 %K 没有同步创新高，说明动能正在衰竭——这波上涨可能接近尾声的警告。它是过滤器，不是独立的反转信号。"},
  {"q": "The most common misuse of Stochastic is…",
   "opts": ["Using it in ranging markets",
            "Using it as a standalone system in strong trends — it pins in the 80+/20− zones and fires premature counter-trend signals",
            "Setting the %K period below 5",
            "Combining it with RSI"],
   "ans": 1,
   "why": "Stochastic is a range-bound tool. In a strong trend it stalls (钝化), camping above 80 or below 20, so counter-trend overbought/oversold trades get run over. Use it in ranges or as a trend-filtered timing tool.",
   "why_zh": "随机指标是震荡市工具。强趋势中它会钝化，长期贴死在 80 上方或 20 下方，逆势的超买/超卖交易会被趋势碾过去。应该只在震荡市用，或作为顺势的择时工具。"},
]
a, b = s.split('const EXAM_QUESTIONS = [', 1)
b2, rest = b.split('];', 1)
s = a + 'const EXAM_QUESTIONS = ' + json.dumps(exam_qs, ensure_ascii=False) + ';' + rest
s = s.replace("Module 11 已解锁", "Module 20 已解锁")

open(DST, "w", encoding="utf-8").write(s)
print("wrote", DST, len(s.encode("utf-8")), "bytes")
