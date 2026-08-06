#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build Trading_Plan_Routine_MakeTradesJourney.html from the Risk template."""
import io, sys

SRC = "/tmp/mtj/MTJ-Hub/courses/Risk_Management_MakeTradesJourney.html"
DST = "/tmp/mtj/MTJ-Hub/courses/Trading_Plan_Routine_MakeTradesJourney.html"

with io.open(SRC, "r", encoding="utf-8") as f:
    html = f.read()

# ---------------------------------------------------------------- 1. title
html = html.replace(
    "<title>Risk Management &amp; Position Sizing &#183; Make Trades Journey</title>",
    "<title>Trading Plan &amp; Routine &#183; Make Trades Journey</title>",
)

# ---------------------------------------------------------------- 2. topbar live
html = html.replace(
    '<span class="dot"></span>Risk&nbsp;Course · Live',
    '<span class="dot"></span>Trading&nbsp;Plan · Live',
)

# ---------------------------------------------------------------- 3. secnav
old_nav_start = html.index('<nav class="secnav">')
old_nav_end = html.index("</nav>") + len("</nav>")
new_nav = """<nav class="secnav">
  <a href="#agenda-sec"><span class="lbl">Overview · 总览</span><span class="pt"></span></a>
  <a href="#why"><span class="lbl">Why Plan · 为什么</span><span class="pt"></span></a>
  <a href="#anatomy"><span class="lbl">Anatomy · 组成</span><span class="pt"></span></a>
  <a href="#template"><span class="lbl">Template · 模板</span><span class="pt"></span></a>
  <a href="#premarket"><span class="lbl">Pre-Market · 盘前</span><span class="pt"></span></a>
  <a href="#execution"><span class="lbl">Execution · 盘中</span><span class="pt"></span></a>
  <a href="#review"><span class="lbl">Review · 盘后</span><span class="pt"></span></a>
  <a href="#metrics"><span class="lbl">Metrics · 指标</span><span class="pt"></span></a>
  <a href="#drawdown"><span class="lbl">Drawdown · 连亏</span><span class="pt"></span></a>
  <a href="#cooldown"><span class="lbl">Cooldown · 冷却</span><span class="pt"></span></a>
  <a href="#habit"><span class="lbl">Habit · 习惯</span><span class="pt"></span></a>
</nav>"""
html = html[:old_nav_start] + new_nav + html[old_nav_end:]

# ---------------------------------------------------------------- 4. hero
html = html.replace(
    '<div class="course-tag">Trading Course · Required</div>',
    '<div class="course-tag">Module 17 · Trading Course</div>',
)
html = html.replace(
    "<h1>Risk &amp;<br>Position Sizing</h1>",
    "<h1>Trading Plan<br>&amp; Routine</h1>",
)
html = html.replace(
    '<div class="h-zh">风 控 · 仓 位 计 算</div>',
    '<div class="h-zh">交 易 计 划 与 日 常</div>',
)
html = html.replace(
    """<p class="h-sub">Entries make the story. Position size decides whether you're still here to tell it.
    <span class="zh">进场决定故事精不精彩，仓位决定你还在不在场上说这个故事。</span></p>""",
    """<p class="h-sub">The market rewards preparation and punishes improvisation. Every impulse trade is a
    decision you outsourced to your emotions.
    <span class="zh">市场奖励准备，惩罚即兴。每一笔冲动交易，都是你把决定外包给了情绪。</span></p>""",
)

# ---------------------------------------------------------------- 5. content sections (agenda .. closing)
old_sec_start = html.index("<!-- ================= AGENDA ================= -->")
old_sec_end = html.index("<!-- ================= FOOTER ================= -->")

SECTIONS = """<!-- ================= AGENDA ================= -->
<section class="section" id="agenda-sec">
  <div class="eyebrow reveal">Content · 目录</div>
  <h2 class="title reveal">What we'll cover<span class="zh">本课涵盖内容</span></h2>
  <div class="agenda">
    <div class="card reveal"><div class="n">01</div><h3>Why a Plan</h3><div class="zh">冲动 vs. 纪律 · 为什么需要计划</div></div>
    <div class="card reveal"><div class="n">02</div><h3>The Anatomy</h3><div class="zh">市场 / 周期 / 进 / 出 / 风控 / 日目标</div></div>
    <div class="card reveal"><div class="n">03</div><h3>Pre-Market Routine</h3><div class="zh">盘前检查清单 · 盘中执行 · 盘后复盘</div></div>
    <div class="card reveal"><div class="n">04</div><h3>The Numbers</h3><div class="zh">交易日记的量化指标</div></div>
    <div class="card reveal"><div class="n">05</div><h3>Drawdown Protocol</h3><div class="zh">连续亏损时的计划调整</div></div>
    <div class="card reveal"><div class="n">06</div><h3>Cooldown &amp; Habit</h3><div class="zh">心理保护机制 · 30 天养成</div></div>
  </div>
</section>

<section class="section reveal" style="padding-top:20px;padding-bottom:20px;">
  <div class="note" style="max-width:820px;line-height:1.9;">// The uncomfortable truth 一个不太舒服的事实：
    most traders do not lose because their entries are bad. They lose because they never decided, in advance,
    what they would do. A plan is not paperwork — it is the <b>only</b> thing standing between you and your impulses.
    <span class="zh">多数交易者亏钱不是因为进场不好，而是因为他们从未提前决定自己要做什么。计划不是文书工作——它是挡在你和冲动之间的<b>唯一</b>防线。</span></div>
</section>

<!-- ================= PART 01 · WHY ================= -->
<section class="divider">
  <div class="rail reveal">Part 01 · 第一部分</div>
  <h2 class="reveal">Why a Plan</h2>
  <div class="zh reveal">为 什 么 需 要 计 划</div>
</section>

<section class="section" id="why">
  <div class="group-head reveal"><span class="tier">01</span>
    <div><div class="eyebrow">Impulse vs. Discipline · 冲动与纪律</div><h2 class="title">Two Traders, Same Chart</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">P.01</span><h3>Impulse vs. Discipline<span class="zh">冲动 vs. 纪律</span></h3><span class="tag bear">Critical 关键</span></div>
    <div class="pattern-desc">
      <p>Without a plan, every trade is a reaction. Price moves up and you feel the pull to buy; price drops and you feel
        the need to "fix" it. The chart is not talking to you — your emotions are.
        <span class="zh">没有计划，每一笔交易都是反应。价格涨，你想追；价格跌，你想「补救」。跟你说话的不是图表，是你的情绪。</span></p>
      <p>A plan inserts a pause between the stimulus and the click. That pause is the entire difference between a trader
        and a gambler.
        <span class="zh">计划在「刺激」和「下单」之间插入一个停顿。这个停顿，就是交易者与赌徒的全部区别。</span></p>
      <div class="cmp">
        <div class="col bad">
          <div class="ch">Impulse · 冲动交易</div>
          <ol>
            <li>Buys because price is moving<span class="zh">因为价格在动就买</span></li>
            <li>Sizes by feeling<span class="zh">凭感觉定手数</span></li>
            <li>Moves the stop to avoid the loss<span class="zh">移动止损逃避亏损</span></li>
            <li>Doubles down after a loss<span class="zh">亏了之后加倍下注</span></li>
          </ol>
          <div class="verdict">One decision per trade — made twice: at entry, and again at the first sign of pain. 每笔交易做两次决定：进场一次，遇到疼痛时又一次。</div>
        </div>
        <div class="col good">
          <div class="ch">Plan · 按计划交易</div>
          <ol>
            <li>Enters only when the setup prints<span class="zh">只在形态出现时进场</span></li>
            <li>Risk is fixed before entry<span class="zh">进场前风险已定死</span></li>
            <li>The stop is sacred<span class="zh">止损神圣不可动</span></li>
            <li>After a loss: same plan, same size<span class="zh">亏损之后：同样的计划，同样的手数</span></li>
          </ol>
          <div class="verdict">One decision per trade — made once, calmly, before the open. 每笔交易只做一次决定：开盘前，冷静地。</div>
        </div>
      </div>
      <div class="note">// You don't need a plan to make money once. You need one to make money consistently.
        你不需要计划来赚一次钱，你需要计划来稳定地赚钱。</div>
    </div>
  </article>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">P.02</span><h3>What a Written Plan Actually Buys You<span class="zh">一份写下来的计划到底给你什么</span></h3><span class="tag bull">Payoff 回报</span></div>
    <div class="pattern-desc">
      <ul class="points">
        <li><b>It kills the debate mid-trade.</b> When price reaches your entry, the plan has already voted. You just execute.<span class="zh">它在交易中途替你关掉争论。价格到进场位时，计划已经投过票了，你只管执行。</span></li>
        <li><b>It makes your mistakes countable.</b> A broken rule is a data point; a feeling cannot be measured.<span class="zh">它让你的错误可以被计数。破一条规则是一个数据点；感觉无法被量化。</span></li>
        <li><b>It protects you from your best days.</b> Euphoria after a win is as dangerous as despair after a loss.<span class="zh">它保护你不被「最好的一天」伤害。赢钱后的兴奋和亏损后的绝望一样危险。</span></li>
        <li><b>It turns trading into a job.</b> Show up, follow the checklist, go home. Boring is the goal.<span class="zh">它把交易变成一份工作：到场、照清单执行、下班。无聊就是目标。</span></li>
      </ul>
      <div class="note">// Discipline is not a personality trait. It is a document you re-read every morning.
        纪律不是性格，是一份你每天早上重读的文件。</div>
    </div>
  </article>
</section>

<!-- ================= PART 02 · ANATOMY ================= -->
<section class="divider">
  <div class="rail reveal">Part 02 · 第二部分</div>
  <h2 class="reveal">Anatomy of a Plan</h2>
  <div class="zh reveal">计 划 的 六 大 组 成</div>
</section>

<section class="section" id="anatomy">
  <div class="group-head reveal"><span class="tier">02</span>
    <div><div class="eyebrow">Six parts · 六个部分</div><h2 class="title">One Page, Six Decisions</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">P.03</span><h3>The Six Building Blocks<span class="zh">计划的六大组成</span></h3><span class="tag neu">Structure 结构</span></div>
    <div class="pattern-desc">
      <p>Every trading plan answers six questions before the market opens. If a question has no answer, the plan has a
        hole — and the market will find it.
        <span class="zh">每份交易计划都要在市场开盘前回答六个问题。只要有一个问题没有答案，计划就有洞——而市场一定会找到那个洞。</span></p>
      <div class="terms">
        <div class="term"><div class="th">01 · Market <span class="ar">→</span></div><p style="margin:10px 0 0;font-size:13px;color:var(--muted);line-height:1.7;">Which instrument, which direction bias. One market, not three.</p><div class="zh">做哪个品种、什么方向倾向。一个市场，不是三个。</div></div>
        <div class="term"><div class="th">02 · Timeframe <span class="ar">→</span></div><p style="margin:10px 0 0;font-size:13px;color:var(--muted);line-height:1.7;">Where you decide and where you act. HTF bias, LTF execution.</p><div class="zh">在哪里决策、在哪里执行。大周期定方向，小周期找进场。</div></div>
        <div class="term"><div class="th">03 · Entry <span class="ar">→</span></div><p style="margin:10px 0 0;font-size:13px;color:var(--muted);line-height:1.7;">The exact condition that triggers a trade. Written so a stranger could execute it.</p><div class="zh">触发交易的确切条件。写到陌生人也能照着执行。</div></div>
        <div class="term"><div class="th">04 · Exit <span class="ar">→</span></div><p style="margin:10px 0 0;font-size:13px;color:var(--muted);line-height:1.7;">Stop placement plus target. Both decided before the entry, never after.</p><div class="zh">止损位置加目标位。两者都在进场前决定，绝不在进场后。</div></div>
        <div class="term"><div class="th">05 · Risk <span class="ar">→</span></div><p style="margin:10px 0 0;font-size:13px;color:var(--muted);line-height:1.7;">Fixed % per trade and per day. The number never changes.</p><div class="zh">单笔与每日固定的风险比例。这个数字永远不变。</div></div>
        <div class="term"><div class="th">06 · Daily Target <span class="ar">→</span></div><p style="margin:10px 0 0;font-size:13px;color:var(--muted);line-height:1.7;">A number that ends your day — in profit or in loss.</p><div class="zh">一个结束你一天的数字，无论当天是赚是亏。</div></div>
      </div>
      <div class="note">// Six blanks. Fill them before the open, or the market will fill them for you — with your money.
        六个空格。开盘前填好，否则市场会替你来填——用你的钱。</div>
    </div>
  </article>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">P.04</span><h3>The Daily Target Is an Exit, Not a Goal<span class="zh">每日目标是退出条件，不是愿望</span></h3><span class="tag bull">Key 关键</span></div>
    <div class="pattern-desc">
      <p>Most traders set a daily profit target and then chase it. The correct daily target is a rule that ends your
        session: +2R and you're done; −1R and you're done. Both are wins for the plan.
        <span class="zh">多数人设定每日盈利目标然后去追。正确的每日目标是一条结束你一天的规则：+2R 收工，−1R 也收工。对计划来说两者都是胜利。</span></p>
      <p>Chasing a target turns a good day into a bad one — you keep trading after the plan is satisfied and give the
        profit back.
        <span class="zh">追目标会把好日子变成坏日子——计划已经完成你还继续交易，然后把利润还回去。</span></p>
      <div class="calcbox">
        <div class="fx">Daily session rule<span class="op">=</span><b>+2R</b><span class="op">→</span> stop trading <span class="op">·</span><b>−1R</b><span class="op">→</span> stop trading</div>
        <div class="cap">每日规则：赚到 +2R 收工，亏到 −1R 也收工 —— 目标不是梦想，是纪律开关</div>
      </div>
    </div>
  </article>
</section>

<!-- ================= PART 03 · TEMPLATE ================= -->
<section class="divider">
  <div class="rail reveal">Part 03 · 第三部分</div>
  <h2 class="reveal">Write Your Own</h2>
  <div class="zh reveal">写 你 自 己 的 计 划</div>
</section>

<section class="section" id="template">
  <div class="group-head reveal"><span class="tier">03</span>
    <div><div class="eyebrow">Template · 模板</div><h2 class="title">The One-Page Plan</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">P.05</span><h3>A Plan You Can Fill in Two Minutes<span class="zh">两分钟能填完的计划</span></h3><span class="tag neu">Template 范本</span></div>
    <div class="pattern-desc">
      <p>If writing the plan takes more than two minutes, you won't write it daily. Keep it to blanks and checkboxes —
        one page, no paragraphs.
        <span class="zh">如果写计划要超过两分钟，你就不会每天写。把它保持成空格和勾选框——一页纸，不要段落。</span></p>
      <div class="case">
        <div class="ct"><span class="cn">MY PLAN · 我的计划</span><h4>Fill Before the Open — 开盘前填写</h4><div class="zh">每天两分钟 · 信号出现前必须填完</div></div>
        <div class="caserow">
          <div class="c"><div class="k">Market 市场</div><div class="v">XAUUSD</div></div>
          <div class="c"><div class="k">Bias 方向</div><div class="v gold">H4 trend only</div></div>
          <div class="c"><div class="k">Timeframe 周期</div><div class="v">H4 → M15</div></div>
          <div class="c"><div class="k">Setup 形态</div><div class="v">0.618 + engulfing</div></div>
          <div class="c"><div class="k">Entry 进场</div><div class="v">__________</div></div>
          <div class="c"><div class="k">Stop 止损</div><div class="v bear">__________</div></div>
          <div class="c"><div class="k">Target 目标</div><div class="v bull">__________</div></div>
          <div class="c"><div class="k">Risk 风险</div><div class="v">1% · $____</div></div>
          <div class="c"><div class="k">Session 时段</div><div class="v">08:00 – 11:00</div></div>
          <div class="c"><div class="k">Day Cap 日上限</div><div class="v bear">−1R = done</div></div>
        </div>
        <div class="work">Rule 规则：If any blank is empty when the signal appears → <b>NO TRADE</b>.
          <span class="res">任何一格没填，信号出现也不做。</span></div>
      </div>
      <div class="note">// The template is not the plan. The filled template is the plan.
        模板不是计划，填好的模板才是计划。</div>
    </div>
  </article>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">P.06</span><h3>Plan for the Trades You'll Skip<span class="zh">为那些你不做的交易做计划</span></h3><span class="tag bear">The hard part 难点</span></div>
    <div class="pattern-desc">
      <p>A plan that only says what you'll buy is a wish list. A real plan also says what you won't do: no news trading,
        no averaging down, no chasing breakouts after 3 PM.
        <span class="zh">只写「要买什么」的计划是愿望清单。真正的计划还会写「不做什么」：不做数据行情、不摊平、下午三点后不追突破。</span></p>
      <p>Write your personal "no" list from your actual history — the mistakes you repeat are the rules you never wrote down.
        <span class="zh">从你自己的交易历史里写一份「不做」清单——你反复犯的错，就是那些你从没写下来的规则。</span></p>
      <div class="note">// Every rule you break is a rule you never wrote. 每条被你违反的规则，都是你从没写下来的规则。</div>
    </div>
  </article>
</section>

<!-- ================= PART 04 · THE DAY ================= -->
<section class="divider">
  <div class="rail reveal">Part 04 · 第四部分</div>
  <h2 class="reveal">A Day Inside the Plan</h2>
  <div class="zh reveal">计 划 之 中 的 一 天</div>
</section>

<section class="section" id="premarket">
  <div class="group-head reveal"><span class="tier">04</span>
    <div><div class="eyebrow">Pre-Market · 盘前</div><h2 class="title">The Ten-Minute Checklist</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">P.07</span><h3>Pre-Market Routine<span class="zh">盘前检查清单</span></h3><span class="tag bull">SOP 标准流程</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="checklist"></div>
      <figcaption>Ten minutes before the open — no pass, no trade<span class="zh">开盘前十分钟 —— 不过关，不下单</span></figcaption></figure>
    <div class="pattern-desc">
      <p>The pre-market routine is the highest-leverage ten minutes of your day. It converts yesterday's review into
        today's plan.
        <span class="zh">盘前流程是你一天里杠杆率最高的十分钟。它把昨天的复盘变成今天的计划。</span></p>
      <p>Do it at the same time, in the same order, every day — even on days you don't plan to trade. The routine is the
        job; the trade is optional.
        <span class="zh">每天同一时间、同一顺序执行，哪怕那天不打算交易。流程才是工作，交易只是可选项。</span></p>
      <div class="note">// If you can't pass your own checklist, you can't take the trade.
        过不了自己的检查清单，就没有资格下单。</div>
    </div>
  </article>
</section>

<section class="section" id="execution">
  <div class="group-head reveal"><span class="tier">05</span>
    <div><div class="eyebrow">In-Session · 盘中</div><h2 class="title">Execute, Don't Improvise</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">P.08</span><h3>The Session Flow<span class="zh">盘中执行流程</span></h3><span class="tag neu">Flow 流程</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="routine"></div>
      <figcaption>One loop with two traps — FOMO and revenge<span class="zh">一条主回路，两个陷阱 —— 冲动追价与报复交易</span></figcaption></figure>
    <div class="pattern-desc">
      <p>During the session your only job is to check the chart against the checklist. Setup present → execute exactly
        as written. Setup absent → do nothing, and call it a successful day.
        <span class="zh">盘中你唯一的任务，是把图表对照检查清单。形态在 → 照写好的执行；形态不在 → 什么都不做，并把这一天算作成功。</span></p>
      <p>The three danger moments are predictable: price leaving without you (FOMO), a stop hit right after entry
        (doubt), and a loss followed by the urge to win it back (revenge).
        <span class="zh">三个危险时刻是可以预料的：价格不等你就走（FOMO）、进场就被打止损（怀疑）、亏了之后急着赚回来（报复）。</span></p>
    </div>
  </article>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">P.09</span><h3>FOMO and Revenge Are the Same Trade<span class="zh">FOMO 和报复交易是同一笔交易</span></h3><span class="tag bear">Critical 关键</span></div>
    <div class="pattern-desc">
      <p>FOMO is buying because the move is happening. Revenge is buying because you just lost. Both are trades taken
        because of the last event, not the setup — which makes them the same trade.
        <span class="zh">FOMO 是因为行情正在发生而买；报复是因为刚亏了而买。两者都是因为「上一个事件」而不是因为形态而下单——所以它们是同一笔交易。</span></p>
      <div class="cmp">
        <div class="col bad">
          <div class="ch">The Trap · 陷阱</div>
          <ol>
            <li>Price breaks out without you<span class="zh">价格突破，你没上车</span></li>
            <li>You buy late, above your plan level<span class="zh">你在计划位之上追进</span></li>
            <li>Stop is far, size is big<span class="zh">止损远，手数还大</span></li>
            <li>One trade now feels more urgent than the plan<span class="zh">当下的这一单，比计划更急迫</span></li>
          </ol>
          <div class="verdict">The market is never "leaving you behind" — it is filtering out the unprepared. 市场从不「丢下你」——它只是在过滤没准备的人。</div>
        </div>
        <div class="col good">
          <div class="ch">The Plan · 计划</div>
          <ol>
            <li>Missed it → it wasn't your setup<span class="zh">错过？那本来就不是你的形态</span></li>
            <li>There is always another session<span class="zh">永远有下一个时段</span></li>
            <li>A missed trade costs zero<span class="zh">错过一单，成本为零</span></li>
            <li>A forced trade costs the plan<span class="zh">强做一单，毁掉整个计划</span></li>
          </ol>
          <div class="verdict">The best trade of the day is often the one you didn't take. 一天中最好的交易，常常是你没做的那一笔。</div>
        </div>
      </div>
      <div class="note">// Never trade to feel better. Trade only because the setup is there.
        永远不要为了「感觉好一点」而交易。只因为形态在那里才交易。</div>
    </div>
  </article>
</section>

<section class="section" id="review">
  <div class="group-head reveal"><span class="tier">06</span>
    <div><div class="eyebrow">After the Close · 盘后</div><h2 class="title">The Daily Review</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">P.10</span><h3>Five Questions, Five Minutes<span class="zh">五个问题，五分钟</span></h3><span class="tag neu">Review 复盘</span></div>
    <div class="pattern-desc">
      <p>The review has one purpose: extract the lesson while the day is still fresh, then close the file. Five
        questions are enough.
        <span class="zh">复盘只有一个目的：趁当天记忆还新鲜时提取教训，然后合上档案。五个问题就够了。</span></p>
      <ul class="points">
        <li><b>01 · Did I follow the plan?</b> 100% or not — no partial credit.<span class="zh">我遵守计划了吗？要么 100%，没有部分得分。</span></li>
        <li><b>02 · Did I trade only my setup?</b> Every trade maps to a written condition.<span class="zh">我只做了自己的形态吗？每一笔都能对应到写下来的条件。</span></li>
        <li><b>03 · Were entry / stop / target where I wrote them?</b><span class="zh">进 / 止 / 目标位和我写的一致吗？</span></li>
        <li><b>04 · Given the same chart, what would I do differently?</b> One sentence.<span class="zh">同样的图表重来一次，我会改什么？一句话。</span></li>
        <li><b>05 · What is tomorrow's one-line plan?</b> Bias + the one level that matters.<span class="zh">明天的一句话计划是什么？方向 + 唯一重要的那个价位。</span></li>
      </ul>
      <div class="note">// Review the process, not the P&amp;L. A correct losing trade is a good day's work.
        复盘过程，不要复盘盈亏。一笔执行正确的亏损交易，也是好的一天。</div>
    </div>
  </article>
</section>

<!-- ================= PART 05 · THE NUMBERS ================= -->
<section class="divider">
  <div class="rail reveal">Part 05 · 第五部分</div>
  <h2 class="reveal">What the Journal Says</h2>
  <div class="zh reveal">数 字 说 了 什 么</div>
</section>

<section class="section" id="metrics">
  <div class="group-head reveal"><span class="tier">07</span>
    <div><div class="eyebrow">Metrics · 量化指标</div><h2 class="title">Read the Numbers, Not the Feelings</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">P.11</span><h3>Five Numbers That Run Your Plan<span class="zh">五个管理计划的数字</span></h3><span class="tag bull">Metrics 指标</span></div>
    <div class="pattern-desc">
      <p>Feelings are useless data. These numbers, tracked weekly, tell you whether the plan is actually working.
        <span class="zh">感觉是没用的数据。这些数字按周追踪，告诉你计划到底有没有在运作。</span></p>
      <div class="defense">
        <div class="dline"><div class="dn">01</div><div class="dv">≥90%</div><h4>Adherence 守规率</h4><div class="zh">按计划执行的交易 ÷ 总交易</div><p>Trades that followed the plan ÷ all trades. This number comes first — if it's low, nothing else matters.<span style="display:block;font-family:'Noto Sans SC';color:var(--muted-2);margin-top:6px;">这个数字优先；它低的话，其他数字都没意义。</span></p></div>
        <div class="dline"><div class="dn">02</div><div class="dv">+0.2R</div><h4>Expectancy 期望值</h4><div class="zh">最近 20 笔的平均 R</div><p>Average R per trade over the last 20. Positive and stable beats big and random.<span style="display:block;font-family:'Noto Sans SC';color:var(--muted-2);margin-top:6px;">稳定为正，好过大起大落。</span></p></div>
        <div class="dline"><div class="dn">03</div><div class="dv">≤6R</div><h4>Max Drawdown 最大回撤</h4><div class="zh">期间最深的权益低谷</div><p>Worst equity valley in the period. If it exceeds your plan's assumption, the size is wrong.<span style="display:block;font-family:'Noto Sans SC';color:var(--muted-2);margin-top:6px;">超过计划的假设，说明手数错了。</span></p></div>
      </div>
      <ul class="points">
        <li><b>Win rate matters least.</b> A 35% win rate with 1:3 exits prints money; a 70% win rate with 1:0.5 bleeds.<span class="zh">胜率最不重要。35% 胜率配 1:3 出场能赚钱；70% 胜率配 1:0.5 会流血。</span></li>
        <li><b>Track R, not dollars.</b> R makes your numbers comparable across accounts and markets.<span class="zh">记 R 不记美元。R 让你的数字在不同帐户和市场之间可以比较。</span></li>
        <li><b>Track adherence separately from P&amp;L.</b> A green day with a broken rule is a red day for the system.<span class="zh">守规率和盈亏分开记。破规则还赚钱的日子，对系统来说是红字。</span></li>
      </ul>
      <div class="note">// The journal answers one question: is the plan alive, or is it just a document?
        日志只回答一个问题：计划是活的，还是只是一份文件？</div>
    </div>
  </article>
</section>

<section class="section" id="drawdown">
  <div class="group-head reveal"><span class="tier">08</span>
    <div><div class="eyebrow">Drawdown · 连亏</div><h2 class="title">When the Plan Itself Is Tested</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">P.12</span><h3>Losing Streaks Are Part of the Schedule<span class="zh">连亏本来就排在日程表上</span></h3><span class="tag bear">Expect it 要有预期</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="drawdown"></div>
      <figcaption>With plan vs. without plan — same streak, different outcome<span class="zh">有计划 vs. 没计划 —— 同样的连亏，不同的结局</span></figcaption></figure>
    <div class="pattern-desc">
      <p>If your system has a 50% win rate, five losses in a row will happen roughly every 30 trades. It is not a signal
        to change anything.
        <span class="zh">如果系统胜率 50%，大约每 30 笔就会出现一次五连亏。这不是任何「需要改变」的信号。</span></p>
      <p>The plan must contain a pre-written response to drawdown, decided while you are calm. During the streak you will
        not be calm.
        <span class="zh">计划里必须预先写好对连亏的反应，在你还冷静的时候决定。连亏进行中，你不可能冷静。</span></p>
    </div>
  </article>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">P.13</span><h3>The Drawdown Playbook<span class="zh">连亏应对手册</span></h3><span class="tag neu">Protocol 流程</span></div>
    <div class="pattern-desc">
      <p>The playbook has three stages, keyed to your equity — never to your mood.
        <span class="zh">手册分三个阶段，以权益为触发条件，永远不看心情。</span></p>
      <div class="steps">
        <div class="step"><div class="sn">Stage 01 · 阶段一</div><h4>−3R from peak</h4><div class="zh">距高点 −3R</div><p>Halve the size. Keep trading the same setups — the system is untouched, only the exposure drops.<span style="display:block;font-family:'Noto Sans SC';color:var(--muted);font-size:12.5px;margin-top:6px;">手数减半，形态照做——系统不动，只降暴露。</span></p><div class="out">→ Halve size 手数减半</div></div>
        <div class="step"><div class="sn">Stage 02 · 阶段二</div><h4>−6R from peak</h4><div class="zh">距高点 −6R</div><p>Stop live trading entirely. Review the last 30 journal entries before the next live trade.<span style="display:block;font-family:'Noto Sans SC';color:var(--muted);font-size:12.5px;margin-top:6px;">完全停掉实盘。下一笔实盘前，先复盘最近 30 笔日志。</span></p><div class="out">→ Stop &amp; review 停机复盘</div></div>
        <div class="step"><div class="sn">Stage 03 · 阶段三</div><h4>Plan change?</h4><div class="zh">要改计划吗？</div><p>Only with 30+ trades of evidence, never after 5 losses. The streak is data; the sample is the verdict.<span style="display:block;font-family:'Noto Sans SC';color:var(--muted);font-size:12.5px;margin-top:6px;">只有 30 笔以上的证据才能改计划，五笔亏损永远不够。连亏是数据，样本才是判决。</span></p><div class="out">→ Evidence only 只看证据</div></div>
      </div>
      <div class="note">// Change the plan on evidence, not on emotion. The market does not owe you a recovery this week.
        凭证据改计划，不凭情绪。市场不欠你这周的回血。</div>
    </div>
  </article>
</section>

<!-- ================= PART 06 · PROTECTION ================= -->
<section class="divider">
  <div class="rail reveal">Part 06 · 第六部分</div>
  <h2 class="reveal">Protect the Mind</h2>
  <div class="zh reveal">保 护 心 理 崩 溃</div>
</section>

<section class="section" id="cooldown">
  <div class="group-head reveal"><span class="tier">09</span>
    <div><div class="eyebrow">Cooldown · 冷却规则</div><h2 class="title">Circuit Breakers for Your Brain</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">P.14</span><h3>The Cooldown Rules<span class="zh">冷却规则</span></h3><span class="tag bear">Non-negotiable 不可谈判</span></div>
    <div class="pattern-desc">
      <p>A cooling rule is a physical action triggered by a measurable state. It removes the decision from the moment of
        maximum emotion.
        <span class="zh">冷却规则是由可量测状态触发的物理动作。它把决定权，从情绪最强烈的那个时刻手里拿走。</span></p>
      <div class="defense">
        <div class="dline"><div class="dn">01</div><div class="dv">−1R</div><h4>Daily Loss Line 单日亏损线</h4><div class="zh">连亏两笔 → 离开 30 分钟</div><p>Two consecutive losses → close the platform, stand up, walk away for 30 minutes.<span style="display:block;font-family:'Noto Sans SC';color:var(--muted-2);margin-top:6px;">连亏两笔 → 关掉平台，站起来，离开 30 分钟。</span></p></div>
        <div class="dline"><div class="dn">02</div><div class="dv">3×</div><h4>Tilt Trigger 失控触发</h4><div class="zh">一天破三次规则 → 明天禁做</div><p>Three rule breaks in a day → no trading tomorrow. The penalty is the protection.<span style="display:block;font-family:'Noto Sans SC';color:var(--muted-2);margin-top:6px;">一天破规则三次 → 明天禁做。惩罚本身就是保护。</span></p></div>
        <div class="dline"><div class="dn">03</div><div class="dv">48h</div><h4>Forced Stop 强制停机</h4><div class="zh">打穿日上限 → 离开图表 48 小时</div><p>After a blown daily cap → 48 hours off the charts, review only, no entries.<span style="display:block;font-family:'Noto Sans SC';color:var(--muted-2);margin-top:6px;">单日上限被打穿 → 离开图表 48 小时，只复盘，不下单。</span></p></div>
      </div>
      <p>The rules must be physical and immediate: close the app, stand up, leave the room. Thinking "I'll just watch"
        is not a cooldown.
        <span class="zh">规则必须物理且立即：关掉 App、站起来、离开房间。「我就看看」不是冷却。</span></p>
      <div class="note">// The market will still be there tomorrow. Your capital and your sanity are not guaranteed.
        市场明天还在。你的资金和理智，不保证。</div>
    </div>
  </article>
</section>

<!-- ================= PART 07 · HABIT ================= -->
<section class="divider">
  <div class="rail reveal">Part 07 · 第七部分</div>
  <h2 class="reveal">From Plan to Habit</h2>
  <div class="zh reveal">从 计 划 到 习 惯</div>
</section>

<section class="section" id="habit">
  <div class="group-head reveal"><span class="tier">10</span>
    <div><div class="eyebrow">Habit · 习惯</div><h2 class="title">Thirty Days to Automatic</h2></div></div>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">P.15</span><h3>The 30-Day Build<span class="zh">30 天养成曲线</span></h3><span class="tag bull">Formation 养成</span></div>
    <figure class="chart-fig wide"><div class="rchart" data-r="habit"></div>
      <figcaption>Effort falls, consistency compounds — 30 days to automatic<span class="zh">意志力递减，坚持复利 —— 30 天走向自动执行</span></figcaption></figure>
    <div class="pattern-desc">
      <p>The first week feels like effort, the second week feels like routine, the third week feels strange when you
        skip it. That is the curve — effort high, then falling, then automatic.
        <span class="zh">第一周像努力，第二周像日常，第三周没做反而浑身不自在。这就是那条曲线——意志力先高后降，最后自动化。</span></p>
      <p>For 30 days, protect the routine above the trades. Even a day with zero trades must include the checklist and
        the review.
        <span class="zh">30 天里，保护流程优先于交易。哪怕一单不做，检查清单和复盘也必须完成。</span></p>
    </div>
  </article>

  <article class="pattern reveal">
    <div class="pattern-head"><span class="idx">P.16</span><h3>Environment Beats Willpower<span class="zh">环境胜过意志力</span></h3><span class="tag neu">Design 设计</span></div>
    <div class="pattern-desc">
      <ul class="points">
        <li><b>Remove the phone from the desk.</b> The phone is a FOMO machine.<span class="zh">把手机拿离桌面。手机就是一台 FOMO 机器。</span></li>
        <li><b>Trade at a fixed desk, at fixed hours.</b> Your brain learns the context.<span class="zh">固定书桌、固定时段交易。让你的大脑学会这个情境。</span></li>
        <li><b>Print the checklist and the plan.</b> Physical paper outranks a tab you can close.<span class="zh">把检查清单和计划打印出来。实体纸，比一个随时能关掉的标签页更有分量。</span></li>
        <li><b>Announce your rules to someone.</b> Accountability is a discipline multiplier.<span class="zh">把你的规则告诉某个人。被监督是纪律的倍增器。</span></li>
      </ul>
      <div class="note">// Thirty days of a boring routine beats ten years of brilliant improvisation.
        三十天无聊的流程，胜过十年精彩的即兴发挥。</div>
    </div>
  </article>
</section>

<!-- ================= CLOSING ================= -->
<section class="closing">
  <p class="quote">A plan you follow for one day is a <em>wish</em>.<br>A plan you follow for thirty days is a <em>system</em>.</p>
  <div class="quote-zh">执行一天的计划是愿望，执行三十天的计划是系统。</div>
  <div class="verbs">
    <span>Plan</span><span class="sep">·</span><span>Check</span><span class="sep">·</span><span>Execute</span><span class="sep">·</span><span>Review</span><span class="sep">·</span><span>Repeat</span>
  </div>
  <div class="once">Once hope it possible — start tomorrow morning, same time.</div>
</section>

"""

html = html[:old_sec_start] + SECTIONS + html[old_sec_end:]

# ---------------------------------------------------------------- 6. footer copy
html = html.replace(
    "· Risk Management &amp; Position Sizing</div>",
    "· Trading Plan &amp; Routine</div>",
)

# ---------------------------------------------------------------- 7. script draw functions
draw_start = html.index("/* ============ 1. recovery curve ============ */")
draw_end = html.index("document.head.appendChild(styleFix);") + len("document.head.appendChild(styleFix);")

NEW_DRAWS = r"""/* ============ 1. pre-market checklist ============ */
function drawChecklist(box){
  const W=720,H=350,s=svgFor(box,W,H);
  txt(s,W/2,30,'PRE-MARKET CHECKLIST  盘前检查清单',{'text-anchor':'middle','font-size':13,'font-weight':700,fill:C.goldB,'letter-spacing':'.22em'});
  txt(s,W/2,50,'10 minutes · no pass, no trade  十分钟 · 不过关不下单',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.14em','font-family':"'Noto Sans SC',sans-serif"});
  const items=[
    {en:'Market bias written on chart',zh:'方向已写在图上',tag:'BIAS',c:C.gold},
    {en:'Key levels marked',zh:'关键位已标注',tag:'LEVELS',c:C.gold},
    {en:'Economic calendar checked',zh:'财经日历已查',tag:'NEWS',c:C.cyan},
    {en:'Entry · Stop · Target on chart',zh:'进 · 止 · 目标已标图',tag:'PLAN',c:C.gold},
    {en:'Risk % confirmed',zh:'风险比例已确认',tag:'RISK',c:C.bull},
    {en:'Daily cap −1R armed',zh:'每日上限已启动',tag:'CAP',c:C.bear}
  ];
  items.forEach((it,i)=>{
    const y=74+i*38, g=el('g',{style:'--i:'+i},s);
    el('line',{x1:44,x2:W-150,y1:y,y2:y,stroke:'rgba(232,200,119,.07)'},s);
    el('rect',{x:56,y:y-11,width:20,height:20,rx:5,fill:'rgba(255,255,255,.02)',stroke:it.c,'stroke-opacity':.55,class:'rbar'},g);
    const tick=el('path',{d:'M62 '+(y-3)+' l5 5 l10 -12',stroke:it.c,'stroke-width':2.4,'fill':'none',
      'stroke-linecap':'round','stroke-linejoin':'round','stroke-dasharray':30,'stroke-dashoffset':30,class:'rline'},g);
    tick.style.transitionDelay=(.25+i*.08)+'s';
    txt(g,92,y+5,it.en,{'font-size':12.5,fill:C.text,'font-weight':600});
    txt(g,92,y+21,it.zh,{'font-size':10,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
    const tw=it.tag.length*7.5+18;
    el('rect',{x:W-142,y:y-11,width:tw,height:20,rx:10,fill:'rgba(232,200,119,.05)',stroke:'rgba(232,200,119,.22)',class:'rbar'},g);
    txt(g,W-142+tw/2,y+5,it.tag,{'text-anchor':'middle','font-size':9.5,fill:it.c,'letter-spacing':'.14em',class:'rlbl'});
  });
  const by=74+items.length*38+12;
  el('rect',{x:56,y:by,width:W-112,height:34,rx:9,fill:'rgba(44,217,138,.06)',stroke:'rgba(44,217,138,.35)',class:'rbar',style:'--i:7'},s);
  txt(s,W/2,by+22,'ALL PASSED → TRADE  全部通过 → 才能交易',{'text-anchor':'middle','font-size':11.5,'font-weight':700,fill:C.bull,'letter-spacing':'.18em','font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
}

/* ============ 2. session flow ============ */
function drawRoutine(box){
  const W=720,H=330,s=svgFor(box,W,H);
  txt(s,W/2,26,'THE TRADING DAY  交易的一天',{'text-anchor':'middle','font-size':13,'font-weight':700,fill:C.goldB,'letter-spacing':'.22em'});
  const phases=[
    {t:'PRE-MARKET',zh:'盘前',sub:'checklist ✓',c:C.bull},
    {t:'SESSION',zh:'时段',sub:'wait for setup 等形态',c:C.gold},
    {t:'EXECUTE',zh:'执行',sub:'as written 照计划',c:C.gold},
    {t:'MANAGE',zh:'管理',sub:'stop · target 止·标',c:C.gold},
    {t:'REVIEW',zh:'复盘',sub:'5 questions 五问',c:C.bull}
  ];
  const n=phases.length, bw=104, gap=(W-60-bw*n)/(n-1), y0=96, bh=64;
  const X=i=>30+bw*i+gap*i;
  phases.forEach((p,i)=>{
    const g=el('g',{style:'--i:'+i},s);
    el('rect',{x:X(i),y:y0,width:bw,height:bh,rx:12,fill:'rgba(255,255,255,.02)',
      stroke:p.c,'stroke-opacity':.5,class:'rbar'},g);
    txt(g,X(i)+bw/2,y0+26,p.t,{'text-anchor':'middle','font-size':11,'font-weight':700,fill:p.c,'letter-spacing':'.12em',class:'rlbl'});
    txt(g,X(i)+bw/2,y0+43,p.zh,{'text-anchor':'middle','font-size':10,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
    txt(g,X(i)+bw/2,y0+58,p.sub,{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
    if(i<n-1){
      const ax=X(i)+bw+gap/2;
      el('line',{x1:ax-9,x2:ax+9,y1:y0+bh/2,y2:y0+bh/2,stroke:C.gold,'stroke-opacity':.5,'stroke-width':1.6},g);
      el('path',{d:'M'+(ax+9)+' '+(y0+bh/2)+' l-6 -4 m6 4 l-6 4',stroke:C.gold,'stroke-opacity':.5,'stroke-width':1.6,'fill':'none'},g);
    }
  });
  /* danger zones above the flow */
  const d1=X(1)+bw+gap/2, d2=X(2)+bw+gap/2;
  [[d1,'FOMO ZONE','冲动追价',C.bear],[d2,'TILT ZONE','失控报复',C.bear]].forEach((d,i)=>{
    const g=el('g',{style:'--i:'+(i+5)},s);
    el('line',{x1:d[0],x2:d[0],y1:64,y2:y0-2,stroke:d[3],'stroke-opacity':.55,'stroke-width':1.4,'stroke-dasharray':'4 4',class:'rlbl'},g);
    el('path',{d:'M'+(d[0]-6)+' 64 l6 -7 l6 7 z',fill:d[3],'fill-opacity':.85,class:'rlbl'},g);
    txt(g,d[0],58,d[1],{'text-anchor':'middle','font-size':9,'font-weight':700,fill:d[3],'letter-spacing':'.1em',class:'rlbl'});
    txt(g,d[0],76,d[2],{'text-anchor':'middle','font-size':8.5,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
  });
  /* revenge loop: red dashed arc back from REVIEW to EXECUTE */
  const loop=el('path',{d:'M'+(X(4)+bw/2)+' '+(y0+bh+14)+' C '+(X(4)+bw/2+70)+' '+(y0+bh+64)+' '+(X(3)+bw/2-60)+' '+(y0+bh+64)+' '+(X(3)+bw/2)+' '+(y0+bh+14),
    stroke:C.bear,'stroke-opacity':.6,'stroke-width':1.6,'fill':'none','stroke-dasharray':'6 5',class:'rline'},s);
  loop.style.transitionDelay='.7s';
  el('path',{d:'M'+(X(3)+bw/2)+' '+(y0+bh+14)+' l-7 -4 m7 4 l7 -4',stroke:C.bear,'stroke-opacity':.6,'stroke-width':1.6,'fill':'none',class:'rlbl',style:'--i:8'},s);
  txt(s,(X(3)+X(4))/2+bw/2,y0+bh+68,'REVENGE LOOP  报复回路 — break it with the cooldown rule  用冷却规则打断它',
    {'text-anchor':'middle','font-size':10,fill:C.bear,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:8'});
  /* green exit path down from REVIEW */
  const ex=el('path',{d:'M'+(X(4)+bw/2)+' '+(y0+bh)+' l0 30',stroke:C.bull,'stroke-opacity':.6,'stroke-width':1.6,'stroke-dasharray':'4 4',class:'rline'},s);
  ex.style.transitionDelay='.9s';
  txt(s,X(4)+bw/2+14,y0+bh+44,'journal → done  日志 → 收工',{'font-size':9.5,fill:C.bull,'font-family':"'Noto Sans SC',sans-serif",class:'rlbl',style:'--i:9'});
  txt(s,W/2,H-12,'06:00 checklist · session window · 15:00 review  06:00 清单 · 时段窗口 · 15:00 复盘',
    {'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.12em','font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 3. drawdown cycle ============ */
function drawDrawdown(box){
  const W=720,H=340,L=48,R=128,T=30,B=42;
  const s=svgFor(box,W,H);
  const plotW=W-L-R, plotH=H-T-B, mn=70, mx=122;
  const X=i=>L+plotW*(i/30);
  const Y=v=>T+(mx-v)/(mx-mn)*plotH;
  [70,80,90,100,110,120].forEach(v=>{
    el('line',{x1:L,x2:L+plotW,y1:Y(v),y2:Y(v),class:'rgrid'},s);
    txt(s,L-8,Y(v)+3.5,v,{'text-anchor':'end',class:'rax'});
  });
  for(let i=0;i<=30;i+=5) txt(s,X(i),T+plotH+18,i,{'text-anchor':'middle','font-size':10,fill:C.muted2});
  txt(s,L+plotW/2,H-8,'TRADE NUMBER  交易序号',{'text-anchor':'middle','font-size':9.5,fill:C.muted2,'letter-spacing':'.18em'});
  /* zone bands */
  const z1=T+plotH-Y(100), z2=T+plotH-Y(94), z3=T+plotH-Y(84);
  const bands=[
    {y:Y(100),h:Y(70)-Y(100),c:'rgba(44,217,138,.05)',l:'NORMAL 正常'},
    {y:Y(94),h:Y(70)-Y(94),c:'rgba(232,200,119,.06)',l:'WARNING 警戒 −3R'},
    {y:Y(84),h:Y(70)-Y(84),c:'rgba(255,92,99,.07)',l:'COOLDOWN 冷却 −6R'}
  ];
  bands.forEach((b,i)=>{
    const g=el('g',{style:'--i:'+i},s);
    el('rect',{x:L,y:b.y,width:plotW,height:b.h,fill:b.c,class:'rbar'},g);
    txt(g,L+10,b.y+14,b.l,{'font-size':9,fill:C.muted2,'letter-spacing':'.1em','font-family':"'Noto Sans SC',sans-serif",class:'rlbl'});
  });
  /* equity: no plan (red, keeps trading) */
  const noPlan=[100,102,104,103,105,107,109,111,112,110,108,106,104,101,99,96,93,90,87,84,81,78,75,72,70,70,70,70,70,70,70];
  const pts=noPlan.map((v,i)=>[X(i),Y(v)]);
  el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
    stroke:C.bear,'stroke-opacity':.8,'stroke-width':2,'stroke-dasharray':'7 5',class:'rline'},s);
  /* equity: with plan (gold, halves size at -3R, stops at -6R, recovers) */
  const plan=[100,102,104,103,105,107,109,111,112,110,108,106,104,101,99,96,93,90,88,86,88,91,95,100,106,112,117,121,124,126,128];
  const pts2=plan.map((v,i)=>[X(i),Y(v)]);
  el('path',{d:pts2.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
    stroke:C.gold,'stroke-width':2.4,class:'rline',style:'transition-delay:.5s'},s);
  /* markers */
  [[X(16),Y(94),'−3R · halve size 减半',C.gold,'--i:8'],[X(20),Y(86),'−6R · stop & review 停机',C.bear,'--i:9'],[X(30),Y(128),'+28R plan 计划 +28R',C.bull,'--i:10']].forEach(m=>{
    const g=el('g',{style:m[4]},s);
    el('circle',{cx:m[0],cy:m[1],r:5,fill:m[3],class:'rlbl'},g);
    txt(g,m[0],m[1]-11,m[2],{'text-anchor':'middle','font-size':10,'font-weight':700,fill:m[3],class:'rlbl','font-family':"'Noto Sans SC',sans-serif"});
  });
  txt(s,W-R+6,T+8,'RED  no plan  无计划',{'font-size':9.5,fill:C.bear,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,W-R+6,T+24,'GOLD  with plan  有计划',{'font-size':9.5,fill:C.gold,'font-family':"'Noto Sans SC',sans-serif"});
  txt(s,L+plotW/2,H-26,'The streak is identical. Only the response differs.  连亏完全一样，不同的只是应对。',
    {'text-anchor':'middle','font-size':10,fill:C.goldB,'font-family':"'Noto Sans SC',sans-serif"});
}

/* ============ 4. habit formation ============ */
function drawHabit(box){
  const W=720,H=340,s=svgFor(box,W,H);
  txt(s,W/2,26,'EFFORT REQUIRED  所需意志力',{'text-anchor':'middle','font-size':12,'font-weight':700,fill:C.goldB,'letter-spacing':'.2em'});
  /* effort curve */
  const L=46,R=30,T=40,B=120,plotW=W-L-R,plotH=86;
  const X=i=>L+plotW*(i/30);
  const eff=d=>95*Math.exp(-d/6)+12;
  const Y=v=>T+plotH-(v-10)/(110-10)*plotH;
  el('line',{x1:L,x2:L+plotW,y1:Y(107),y2:Y(107),stroke:'rgba(232,200,119,.08)','stroke-dasharray':'3 5'},s);
  const pts=[];for(let i=0;i<=30;i++)pts.push([X(i),Y(eff(i))]);
  el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
    stroke:C.cyan,'stroke-width':2.2,class:'rline'},s);
  [[7,'day 07 · first win 初见成效',C.gold],[21,'day 21 · routine 已成日常',C.cyan],[30,'day 30 · automatic 自动执行',C.bull]].forEach((m,i)=>{
    const g=el('g',{style:'--i:'+(i+3)},s);
    el('circle',{cx:X(m[0]),cy:Y(eff(m[0])),r:5,fill:m[2],class:'rlbl'},g);
    txt(g,X(m[0]),Y(eff(m[0]))-11,m[1],{'text-anchor':'middle','font-size':9.5,fill:m[2],class:'rlbl','font-family':"'Noto Sans SC',sans-serif"});
  });
  txt(s,L, T+plotH+16,'day 1',{'font-size':9,fill:C.muted2});
  txt(s,L+plotW, T+plotH+16,'day 30',{'text-anchor':'end','font-size':9,fill:C.muted2});
  /* 30-day grid */
  const gy=200, gr=11, gx0=72, gapX=64, gapY=40, cols=10;
  for(let d=0;d<30;d++){
    const c=d%cols, r=Math.floor(d/cols);
    const col=d<7?'#FF9A4D':(d<22?C.gold:C.bull);
    const g=el('g',{style:'--i:'+d},s);
    el('circle',{cx:gx0+c*gapX,cy:gy+r*gapY,r:gr,fill:col,'fill-opacity':.16,
      stroke:col,'stroke-opacity':.7,'stroke-width':1.4,class:'rbar'},g);
    txt(g,gx0+c*gapX,gy+r*gapY+3.5,d+1,{'text-anchor':'middle','font-size':7.5,fill:col,class:'rlbl'});
  }
  [[1,'START 开始'],[7,'',''],[21,'',''],[30,'KEEP 保持']].forEach(m=>{
    const c=(m[0]-1)%cols, r=Math.floor((m[0]-1)/cols);
    if(m[1]){
      txt(s,gx0+c*gapX,gy+r*gapY+gr+18,m[1],{'text-anchor':'middle','font-size':9,fill:C.goldB,'font-family':"'Noto Sans SC',sans-serif"});
      el('circle',{cx:gx0+c*gapX,cy:gy+r*gapY,r:gr+5,fill:'none',stroke:C.goldB,'stroke-opacity':.5,'stroke-dasharray':'3 3',class:'rlbl',style:'--i:31'},s);
    }
  });
  const ly=gy+2*gapY+gr+34;
  [[0,'WEEK 1 · effort 第 1 周 · 靠意志',C.gold],[1,'WEEK 2-3 · routine 第 2-3 周 · 成日常',C.gold],[2,'WEEK 4 · automatic 第 4 周 · 自动化',C.bull]].forEach((m,i)=>{
    el('circle',{cx:66+i*210,cy:ly-3,r:5,fill:m[2],'fill-opacity':.5,stroke:m[2],'stroke-opacity':.8},s);
    txt(s,78+i*210,ly,m[1],{'font-size':9.5,fill:C.muted2,'font-family':"'Noto Sans SC',sans-serif"});
  });
}

const RENDER={checklist:drawChecklist,routine:drawRoutine,drawdown:drawDrawdown,habit:drawHabit};
document.querySelectorAll('.rchart[data-r]').forEach(b=>{const f=RENDER[b.dataset.r];if(f)f(b);});

/* scaleX bars need their own keyframe since .rbar uses scaleY */
const styleFix=document.createElement('style');
styleFix.textContent='.in .rbar[style*="scaleX"]{transform:scaleX(1)!important;}';
document.head.appendChild(styleFix);
"""

html = html[:draw_start] + NEW_DRAWS + html[draw_end:]

with io.open(DST, "w", encoding="utf-8") as f:
    f.write(html)

print("written", DST)
