# 中文缺口清单 — 交给 Hermes

日期：2026-08-13 · 对应 commit `c41bd3e`（语言引擎 v4）与 `760aec2`（EA 分页）
作者：Claude（主设计）· 执行：Hermes

---

## 0. 先读这段，不然会改错方向

语言引擎改过了。旧规则是「中文模式一律隐藏 `.en`」，结果是**没有中文译文的英文也被藏掉，留下空框**——货币代码整排消失、tag 徽章变成空的圆角框、`GBP` 只剩一个 `P`。

新规则一句话：

> **英文只有在同一个 host 真的带中文时才隐藏。没有译文的英文，留着显示。**

所以现在中文模式下看到英文，**不是 bug，是缺翻译**。这份文件就是那份缺口清单。

补上中文之后，英文会自动隐藏——**不需要动 CSS，不需要动 JS**。

### 怎么补（唯一正确的写法）

在同一个元素内，英文后面加一个 `<span class="zh">`：

```html
<!-- 改前：中文模式显示 "Currency Codes" -->
<h3>Currency Codes</h3>

<!-- 改后：英文模式显示 Currency Codes，中文模式显示 货币代码 -->
<h3>Currency Codes<span class="zh">货币代码</span></h3>
```

**必须在同一个元素内。**放到兄弟元素里不算配对，英文不会隐藏，两个语言会同时显示。

唯一的例外是分隔屏，那个跨元素配对已经在引擎里特判过了，照抄现有写法即可：

```html
<h2><span class="en">Currencies</span></h2>
<div class="zh">货 币</div>
```

---

## 1. 实测规模

用浏览器实跑 27 个页面统计（方法见第 6 节）：

| 指标 | 数量 |
|---|---|
| 中文模式下显示英文的位置 | **934 处** |
| 去重后的唯一字串 | **710 条** |
| 涉及页面 | 27 页中的 26 页（首页 0 处，已全部双语） |

> 更正一下：我先前口头说「整站约 40–50 处」。那是 Trading Basics **单页**的数字，整站是 934 处。以这份文件为准。

### 每页缺口数（已扣除第 3 节的共用字串）

| 页面 | 缺口 | 页面 | 缺口 |
|---|---|---|---|
| MakeTradesJourney.html | 0 | Risk_Management | **57** |
| about.html | 4 | Journal_Review | 35 |
| courses.html | **60** | Psychology_Discipline | **41** |
| ea.html | 20 | Trendlines_Channels | 28 |
| tools.html | 9 | Supply_Demand | 27 |
| backtest.html | 1 | Trade_Management | **43** |
| Trading_Basics | 33 | Backtesting_System_Design | 31 |
| Three_Types_of_Analysis | 9 | Trading_Plan_Routine | 37 |
| Trading_Sessions | 9 | RSI_Indicator | **48** |
| Candlestick_Patterns | 25 | Stochastic_Indicator | **41** |
| Chart_Patterns | 11 | MACD_Indicator | 27 |
| MA_Support_Resistance | 25 | Platform_Costs | 38 |
| Fibonacci | 14 | Multi_Timeframe_Trading | 19 |
| US_High_Impact_Data | 27 | | |

---

## 2. 三类工作，不要混在一起做

### A 类 — 要改代码，不是改标记（先做，最省事）

这些字串是 **JS 在运行时生成**的，页面里搜不到，改 HTML 没用。

| 字串 | 出现次数 | 位置 |
|---|---|---|
| `LOCKED · PASS MODULE N EXAM TO UNLOCK` | 20 | `courses.html` 的 EXAM LOCK 脚本（`lock.textContent = ...`），`ea.html` 同一段 |
| `QUESTION N / 5` | 100（20 页 × 5） | 各课程页考试脚本 |

改法：生成时同时塞入 `.en` / `.zh` 两个 span，而不是纯文字。例如

```js
lock.innerHTML = '<span class="en">LOCKED · PASS MODULE ' + (m-1) + ' EXAM TO UNLOCK</span>'
               + '<span class="zh">未解锁 · 通过第 ' + (m-1) + ' 课测验后开启</span>';
```

**这两条改完，934 处直接掉掉 120 处。性价比最高，先做。**

### B 类 — 共用模板字串（改一次的思路，但要逐页落地）

出现 6 次以上、每页都有一份拷贝的：

| 字串 | 次数 | 建议中文 |
|---|---|---|
| `Learn` / `Trade` / `Earn` / `Enjoy` | 各 9 | 学习 / 交易 / 盈利 / 享受（页面已有这行中文版，是英文那份没配对） |
| `Trading Course · Required` | 8 | 交易课程 · 必修 |
| `OPEN MODULE →` | 6 | 打开课程 → |
| `Reversal` | 7 | 反转 |
| `Continuation` | 6 | 持续 |
| `Entry` | 6 | 进场 |

### C 类 — 内容翻译（大头，见第 5 节完整清单）

主要集中在四种元素：

| 类型 | 说明 | 例 |
|---|---|---|
| `.agenda .card h3` | 课前目录的小标题 | `Currency Codes`、`The Math of Loss` |
| `h2.title` | 每个 section 的大标题 | `Codes & the 8 Majors`、`Losses Don't Hurt Evenly` |
| `.tag` | 每个 pattern 右上角的徽章 | `3 letters`、`Most traded`、`How you earn` |
| `.k` / `.v` / `.res` | 案例栏的字段名与结果行 | `Balance`、`Stop`、`= $5.00 ÷ $250 = 0.02 lots` |

---

## 3. 翻译约定（照做，不要自由发挥）

1. **代号一律不翻**：`GBP`、`EURUSD`、`XAUUSD`、`RSI`、`MACD`、`ATR`、`EMA(12)`、`M15`、`VPS`、`1R`、`0.618`。引擎已有 SYMBOL 规则保护无空格全大写短词，你不需要额外标记。
2. **公式整条不拆**：`= $50 ÷ $500 = 0.10 lots` 这类，要嘛整条给一个中文版本，要嘛整条不动。**绝对不要**只翻里面的英文词——上一版就是这样把 `Gain needed to break even = Loss % ÷ (1 − Loss %)` 弄成了 `= ÷ ( 1 −`。
3. **简体，不是繁体**。全站是简体。（例外：`tools/XRs_Strategy_Composer_v2.4.html` 内部是繁体，那是另一件事，暂时不要动。）
4. **语气跟现有中文一致**：短句、直白、不用「您」、不堆形容词。参照 `Risk_Management` 已有的中文段落。
5. **标点用中文全角**，但公式和代号周围保持半角空格。
6. **标题不要加句号**，正文句子要加句号。
7. **`.tag` 徽章要短**，2–5 个字，长了会撑破圆角框。

---

## 4. 优先级

1. **A 类两条 JS**（掉 120 处，一小时内能做完）
2. **courses.html（60）**——这是所有人第一个看到的目录页
3. **ea.html（20）+ tools.html（9）+ about.html（4）**——站级页面，量小
4. **Risk_Management（57）、RSI_Indicator（48）、Trade_Management（43）、Psychology_Discipline（41）、Stochastic_Indicator（41）**——最严重的五课
5. 其余课程页

**每做完一页，跑一次第 6 节的脚本确认该页归零**，不要一次改十页再验。

---

## 5. 完整清单

格式：`- #锚点 \`英文原文\``。锚点是该字串所在 section 的 id，方便定位。第 3 节的共用字串已从下面扣除。

### about.html (4)
- #about `Respect the Market`
- #about `Build Over Shortcuts`
- #about `RISK FIRST`
- #about `Risk Before Reward`

### courses.html (60)
- #path `Foundations`
- #path `What you are actually trading, the three lenses used to analyse it, and when the market is worth trading at all.`
- #path `Chart Craft`
- #path `The technical toolkit: candles, patterns, moving averages, key levels and Fibonacci - the skills you use on every single chart.`
- #path `Market Context`
- #path `Zoom out. Align timeframes, then understand the data and central-bank decisions that move price in the first place.`
- #path `Execution & Risk`
- #path `Reading a chart is half the job. This is the other half - how much to put on, where the stop belongs, the loop that turns every trade into feedback, and the discipline to actually follow it.`
- #path `Advanced Craft`
- #path `Trendlines, channels, supply & demand — the structural zones where institutions leave footprints.`
- #path `System & Execution`
- #path `Trade management, backtesting and the daily routine — turning decisions into a repeatable system.`
- #path `Indicators & Platform`
- #path `RSI, Stochastic, MACD, platform costs and Expert Advisors — the tools and the machinery of trading.`
- #courses `Trading Basics`
- #courses `Three Types of Analysis`
- #courses `Trading Sessions`
- #courses `Candlestick Patterns`
- #courses `Chart Patterns`
- #courses `Moving Averages & Key Levels`
- #courses `Fibonacci`
- #courses `Multi-Timeframe Trading`
- #courses `US High-Impact Data`
- #courses `Risk & Position Sizing`
- #courses `The Journal & Review Loop`
- #courses `Psychology & Discipline`
- #courses `Trendlines & Channels`
- #courses `Supply & Demand Zones`
- #courses `Trade Management`
- #courses `Backtesting & System Design`
- #courses `Trading Plan & Routine`
- #courses `RSI Indicator`
- #courses `Stochastic Indicator`
- #courses `MT5 Style`
- #courses `Platform & Trading Costs`
- #stage-indicators `Indicators`
- #stage-platform `Platform`
- #stage-ea `Automation`
- #courses `SEPARATE TRACK`
- #courses `EA Courses`
- #courses `OPEN TRACK →`
- #close `Browse All Modules`
- （另有 17 处 `LOCKED · PASS MODULE N EXAM TO UNLOCK` 属 A 类，改 JS）

### ea.html (20)
- #start `EA 01 · BACKGROUND`
- #start `What is an Expert Advisor?`
- #composer `Set the Account First`
- #composer `Fill the Five Zones`
- #composer `Look at the Chart, Not the Score`
- #composer `Then Read Why the Score Moved`
- #composer `Break It on Purpose`
- #composer `Read the Curve, Not the Total`
- #composer `ACCOUNT CURVE · RESULTS`
- #composer `OPEN TOOL →`
- #backtest `Plan the Sample`
- #backtest `Prepare the Data`
- #backtest `Run It and Record It`
- #backtest `Read the Five Numbers`
- #backtest `Give the Verdict`
- #backtest `Know the Traps`
- #backtest `Backtest SOP`
- #backtest `OPEN SOP →`
- #backtest `Backtesting & System Design`
- #backtest `LOCKED · PASS MODULE 16 EXAM TO UNLOCK`（A 类）

> 注：ea.html 的 6 个步骤标题（`Set the Account First` 等）下面已经有中文小标，但那是 `.zh` 兄弟元素，不构成配对。补的时候直接把中文塞进 `h3` 里，然后删掉重复的那行。

### tools.html (9)
- #tools `Trade Journal`
- #tools `FOMC Analyzer`
- #tools `Position Size Calculator`
- #tools `MEMBERS ONLY`
- #tools `// SCORE ≠ PROFIT`
- #tools `EA Logic Maker`
- #tools `70 Block Library`
- #tools `Verified by IS/OOS/Val`
- #close `Browse All Modules`

### backtest.html (1)
- `100+ trades`

### Trading_Basics (33)
- #agenda-sec `Currency Codes` / `Pairs & Quotes` / `Bid · Ask · Spread` / `Terms & Pips` / `Profit & Why Price Moves` / `Japanese Candlesticks`
- #currencies `Codes & the 8 Majors` · `3 letters` · `Most traded`
- #currencies `// USD = US + Dollar · JPY = JP + Yen · EUR = EU + euRo`
- #currencies 国家名 8 条：`United States` `Eurozone` `Japan` `United Kingdom` `Switzerland` `Australia` `New Zealand` `Canada`
- #pairs `Reading a Quote` · `The quote` · `1 EUR = 1.10500 USD` · `Corrected` · `sell` · `buy` · `always higher` · `Spread`
- `Vocabulary` · `Where is a pip?`
- #action `Making Sense of Price` · `How you earn` · `Supply & demand` · `Anatomy`
- #close `because it longed to fly.`

### Three_Types_of_Analysis (9)
- #agenda-sec `FUNDAMENTAL`
- #technical `Studying Price Itself` · `The chart`
- #fundamental `The Forces Behind Price` · `The economy`
- #sentiment `How the Crowd Feels` · `The crowd`
- `Side by Side`
- #close `they learn to read all three.`

### Trading_Sessions (9)
- #sessions `Know Each Shift` · `Range` · `Trend` · `Volatile`
- #gold `When Gold Wakes Up` · `00:00–09:00 UTC` · `08:00–17:00 UTC` · `13:00–22:00 UTC`
- #close `at the right hour.`

### Candlestick_Patterns (25)
- #agenda-sec `Candlestick & Chart Pattern` · `Japanese Candlestick` · `Body & Shadow Anatomy` · `Candlestick Patterns` · `Basic` · `Single` · `Dual` · `Triple`
- #intro `01 · Fundamentals` · `One of the core methods of Technical Analysis.` · `Predict the next move by reading the shape of the candle / chart.` · `The basic building block of Price Action.`
- #history `02 · Origin` · #anatomy `03 · Anatomy`
- #basic `Basic Candlestick Patterns` · `Indecision` · `Strong momentum` · `Momentum fading`
- #single `Single Candlestick Patterns` · `Bullish reversal` · `Bearish reversal`
- #dual `Dual Candlestick Patterns`
- #triple `Triple Candlestick Patterns` · `Strong trend`
- #close `successful self-acceptance.`

### Chart_Patterns (11)
- #agenda-sec `Reversal Patterns` · `Continuation Patterns` · `Wedges & Cup` · `Breakout & Target`
- `cyan box` · `cyan dashed line`
- #reversal `Tops & Bottoms`
- #continuation `The Trend Takes a Breath`
- #cont-adv `Squeeze & Saucer` · `Reversal / Continuation`
- #close `but its patterns rhyme.`

### MA_Support_Resistance (25)
- #agenda-sec `Moving Averages` · `Using Moving Averages` · `Support & Resistance` · `Breakouts & Flips`
- #ma-basics `The Trend, Made Visible` · `Trend` · `Two types` · `Timeframes` · `Fast MA` · `Slow MA`
- #ma-basics `// EMA = faster & more sensitive · SMA = smoother & steadier`
- #ma-usage `How Traders Use MAs` · `Bias` · `Above = bullish` · `Below = bearish` · `Rebound entry` · `Momentum shift`
- #sr-basics `Floors & Ceilings` · `Concept` · `Strength` · `Resistance`
- #sr-adv `When Levels Break` · `Broken support` · `Zones`
- #close `respect the levels.`

### Fibonacci (14)
- #top `Fibonacci`
- #agenda-sec `The Golden Ratio` · `How to Draw It` · `The Golden Pocket` · `Extensions & Targets`
- `Fibonacci levels` · `cyan 0.618 line & band`
- #ratios `Numbers the Market Watches` · `The ratios`
- #how-to `Drawing a Retracement`
- #trade `Pocket & Extensions` · `Entry zone` · `Targets`
- #close `but only at the right level.`

### Multi_Timeframe_Trading (19)
- #agenda-sec `What & Why` · `The 3-Tier Structure` · `Top-Down Workflow` · `Alignment & Combos`
- #concept `Zoom Out, Then Zoom In` · `Concept` · `trend & bias` · `Daily · 4H` · `setup` · `entry`
- #topdown `Direction → Setup → Entry` · `Direction` · `Setup`
- #align `Trade With the Tide` · `Cheat sheet` · `Daily` · `Weekly` · `timing`
- #close `zoom in for the entry.`

### US_High_Impact_Data (27)
- #agenda-sec `Actual vs Forecast` · `The Big Releases` · `Reading Inflation` · `Predicting the Fed`
- #releases `The Surprise Is the Signal` · `The surprise` · `High impact` · `Core PCE` · `MED–HIGH` · `Retail Sales` · `Jobless Claims` · `Tap to open`
- #inflation `Is Inflation Hot or Cooling?` · `Inflation` · `Headline vs Core` · `YoY vs MoM` · `The 2% Target` · `2% Core PCE` · `vs Forecast`
- #fed `Hike, Hold or Cut?` · `well above 2%` · `USD ↑ · Gold ↓` · `near 2%` · `falling to / below 2%` · `USD ↓ · Gold ↑` · `The logic`
- #close `trade the surprise.`

### Risk_Management (57) ← 最严重
- #agenda-sec `The Math of Loss` · `Position Sizing` · `Stop Loss` · `R:R & Expectancy` · `Leverage` · `Account Rules`
- #math `Losses Don't Hurt Evenly` · `Loss %`
- #sizing `What a Lot Actually Costs`
- #sizing `Fix the Risk` + `Decide the money before you look at the chart. 1% of a $5,000 account is $50 - that number does not change because a setup "looks good".`
- #sizing `Place the Stop` + `Put it where your analysis is invalidated - beyond structure, not at a round dollar figure you feel comfortable with.`
- #sizing `Derive the Lots` + `Now the position size is simply arithmetic. There is no judgement left in this step - which is exactly the point.`
- #sizing `$50 ÷ $500 = 0.10 lots`（公式，整条处理）
- #sizing `Lot Size` · `Risk Amount` · `Stop Distance` · `Value per Point per Lot` · `Position Size Calculator`
- #stops `A Stop Is a Statement, Not a Budget`
- #rr `Win Rate Alone Means Nothing` · `Expectancy`
- #leverage `Leverage Doesn't Set Your Risk` · `Margin` · `Risk comes from lot size and stop distance`
- #rules `Rules You Set Before You're Emotional`
- #rules `Per Trade` + `Beginners should sit at 0.5–1%. This is the number the calculator uses to derive your lot size.`
- #rules `Per Day` + `Or 2–3 losses in a row - whichever comes first. Then you are done for the day. Platform closed.`
- #rules `Per Month` + `Hit this and you stop, review the journal, and go back to demo or half size until the edge is re-established.`
- #practice `Three Accounts, Same Method` · `Small Account · Gold` · `Mid Account · EURUSD` · `Funded-Size Account · Gold + Daily Cap`
- #practice 字段名：`Balance` · `Risk` · `Symbol` · `Stop` · `Lots`
- #practice 结果行（公式，整条处理）：`= $5.00 ÷ $250 = 0.02 lots` · `= 0.00300 = 30 pips` · `= 30 pips × $10 = $300` · `= $30 ÷ $300 = 0.10 lots` · `= $8.00 (short - stop above entry)` · `= $100 ÷ $800 = 0.125 → round down 0.12` · `= $300 → 3 losing trades and the day is over` · `= (100 × 2650 × 0.12) ÷ 100 = $318 (3.2% of balance)`
- #practice `Run all three in the Calculator`
- 结语字带：`make` · `lose` · `Risk First` · `Size Second` · `Entry Last`

### Journal_Review (35)
- #agenda-sec `Why Log at All` · `What to Record` · `The Four Quadrants` · `The Review Loop` · `Reading the Numbers` · `When to Change`
- #why `Memory Is a Terrible Record`
- #what `One Complete Record` · `XAUUSD · BUY` · `Golden Pocket` · `London`
- #quadrant `Judge the Process, Not the Result`
- #quadrant `✓ KEPT + WIN` / `Process Win` + `The system worked and you executed it. This is the only quadrant that is genuinely repeatable.`
- #quadrant `✓ KEPT + LOSS` / `A Good Loss` + `You did everything right and still lost. This is the cost of doing business - it is supposed to happen, often.`
- #quadrant `✕ BROKE + WIN` / `The Dangerous Win` + `You moved the stop, doubled down, or entered without your setup - and got paid for it. The market just rewarded the exact behaviour that will eventually destroy the account.`
- #quadrant `✕ BROKE + LOSS` / `A Deserved Loss` + `Painful, but honest. The feedback matches the behaviour, which makes it the easiest kind of mistake to correct.`
- #cadence `Daily, Weekly, Monthly` · `Record & Rate` · `Count & Compare` · `Decide`
- #numbers `Six Numbers That Matter` · `Trade Journal`
- #change `Bad Run or Bad System?`
- 结语字带：`reasons` · `Record` · `Review` · `Repeat`

### Psychology_Discipline (41)
- #agenda-sec `Wired to Lose` · `The Four Killers` · `Surviving Drawdown` · `The Danger After Winning` · `Externalise the Rules` · `The Daily Loop`
- #wired `Your Brain Was Not Built for This`
- #killers `How Accounts Actually Die` · `Killer 01`–`Killer 04` · `Revenge Trading` · `Cutting Winners Short` · `Moving the Stop` · `double the usual size` · `no stop level that makes sense`
- #killers `Looks like: closing at +0.6R "to lock it in" while the plan said 1:2. Feels responsible. Quietly turns a profitable system into a losing one.`
- #killers `Looks like: widening the stop as price approaches it, because "it's about to bounce". This is the single most expensive habit in retail trading - it converts a planned 1R loss into an unplanned 4R one.`
- #streak `Trust the Process - Up to a Point`
- #winning `Your Best Week Sets Up Your Worst`
- #external `Stop Relying on Discipline`
- #external `Write the Plan Down` + `Entry conditions, stop logic, targets, and what you will not trade. On one page, visible while you trade - not in your head.`
- #external `Pre-Commit the Orders` + `Place the stop and the target at entry, in the platform. A decision executed by software cannot be talked out of it.`
- #external `Use the Checklist` + `Pilots do not skip the checklist because they are experienced. Run it before every session - it catches the state you cannot self-diagnose.`
- #external `Design the Environment` + `Close the platform after the daily stop. Remove the app from your phone. Make the bad action require effort.`
- #external `Score the Process` + `Log kept/broke on every trade. What gets measured gets managed - and the number is uncomfortable enough to work.`
- #external `Trade Journal & Checklist`
- #daily `What a Disciplined Day Looks Like` · `Decide while calm` · `Execute, don't decide` · `Record before you judge`
- 结语字带：`already decided` · `Decide Early` · `Write It Down` · `Follow It`

### Trendlines_Channels (28)
- #top `Module 13 · Trend Analysis`
- #agenda-sec `What Is a Trendline` · `How to Draw It` · `Breakouts & Fakeouts` · `Channels` · `Trendline + Moving Average` · `Common Mistakes`
- #basics `The Line Is a Story, Not a Drawing`
- #drawing `Two Points Confirm, the Third Validates`
- #breakouts `A Break Is a Close, Not a Wick`
- #channels `Price Moves in Corridors, Not Lines`
- #channels `STRATEGY A` / `Fade the Rails` + `Buy the lower rail, sell the upper rail - while the channel is intact and the higher timeframe trend agrees. Defined R:R every time.` + `Buy low rail → target high rail`
- #channels `STRATEGY B` / `Breakout Follow` + `Wait for a close beyond a rail, then trade the retest of the broken rail - the channel is ending and a faster move is starting.` + `Close beyond rail → retest entry`
- #channels `Never Both at Once` + `Fading a broken channel or chasing a breakout inside an intact channel are the two classic ways to give the money back.` + `One strategy per setup`
- #combine `Structure Plus Momentum Beats Either Alone`
- #mistakes `Why Trendlines Fail for Most Traders`
- 结语字带：`three times` · `Connect` · `Validate` · `Respect`

### Supply_Demand (27)
- #top `Trading Course · Module 14`
- #agenda-sec `The Institutional Logic` · `Demand Zones` · `Supply Zones` · `Zone vs Line` · `RTB Entry` · `Break & Failure` · `Trend Context` · `Common Mistakes`
- #logic `Price Leaves Footprints`
- #demand `The Base Before the Drop`
- #supply `The Base Before the Fall`
- #zoneline `Zones Absorb, Lines Describe`
- #rtb `Let the Zone Come to You`
- #invalid `A Broken Zone Is a Message`
- #trend `Zones Are Stronger With the Tide`
- #mistakes `The Zone Is Not the Problem - You Are`
- #mistakes `Mark the Zone` + `Base + ignition + fresh. If the zone is old or weak, it is not a zone.`
- #mistakes `Wait for RTB` + `Let price come to you. Entry on the reaction, stop beyond the band.`
- #mistakes `Respect the Invalidation` + `Close through the zone = done. No averaging, no hoping.`
- 结语字带：`orders` · `Mark the Base` · `Wait for the Return` · `Respect the Break`

### Trade_Management (43)
- #top `Module 15 · Trade Management`
- #agenda-sec `The Exit Is the Trade` · `Three Ways to Move a Stop` · `The Math of Scaling Out` · `Trailing Stops` · `Break-Even & Time Stops` · `Psychology & Workflow`
- #exit `The Trade Is Won After Entry`
- #moves `Every Stop Movement Is One of Three`
- #scaling `Why Close One Trade as Three Trades` · `Realized R`
- #trailing `Two Ways to Trail: ATR or Structure` · `N × ATR`
- #be `Break-Even: When the Trade Stops Costing`
- #time `How Long Should You Wait for a Dead Trade?`
- #psych `Why We Scream to Take Profit`
- #compare `Different Exits, Different Personalities`
- #workflow `One Trade, Managed Start to Finish`
- #workflow `Define Invalidation` + `The initial stop, at structure + buffer. This is the price where the trade is simply wrong. Fixed before entry, never widened.` + `SL = structure − buffer`
- #workflow `Plan the Exits` + `First target (scale-out point + BE trigger) and the trail method - ATR or structure, decided now, not mid-trade.` + `TP1 = 1R · trail = 1.5 ATR`
- #workflow `Set the Time Stop` + `N bars without meaningful progress → exit at market or BE. Prevents dead capital from sitting forever.` + `N = 8 bars`
- #workflow `Written before entry` · `Stop` · `Scale` · `Trail` · `Time` · `8 bars`
- #workflow 结果行（公式）：`= +0.33R banked` · `= stop now 2653.50` · `= +1.83R open` · `= +1.55R - never at risk after step 1`
- #workflow `Journal Every Exit`
- 结语字带：`entry` · `exit` · `Plan the Exit` · `Manage the Open` · `Let Winners Run`

### Backtesting_System_Design (31)
- #top `Module 16 · Backtesting & System Design`
- #agenda-sec `Why Backtest` · `History & Bias` · `Data Quality` · `Sample & Metrics` · `Overfitting & Portfolio` · `Paper → Live`
- #why `Edge = a statistical property of a sequence` · `Backtest = a controlled experiment` · `Edge`
- #data `Net R` · `Gross R` · `per trade`
- #metrics `Profit Factor` · `Expectancy` · `Max Drawdown` · `Sharpe`
- #rules `A trigger you can describe in one sentence, plus a filter that keeps you out more often than it lets you in.` + `if close > MA20 and RSI < 70 → long`
- #rules `Exit` + `Where the idea is invalidated, where you bank profit, and when you leave simply because the trade took too long.` + `stop = structure · target = 2R · time = 5 days`
- #rules `Risk` + `Fixed % per trade, capped per day and per month - the numbers from the Risk Management module.` + `1% / trade · 3% / day · 10% / month`
- #bridge `Log Every Paper Trade`
- 结语字带：`love letter` · `cross-examination` · `Backtest First` · `Paper Second` · `Live Last`

### Trading_Plan_Routine (37)
- #top `Module 17 · Trading Course`
- #agenda-sec `Why a Plan` · `The Anatomy` · `Pre-Market Routine` · `The Numbers` · `Drawdown Protocol` · `Cooldown & Habit`
- #why `Two Traders, Same Chart`
- #anatomy `One Page, Six Decisions`
- #anatomy `Which instrument, which direction bias. One market, not three.`
- #anatomy `Where you decide and where you act. HTF bias, LTF execution.`
- #anatomy `The exact condition that triggers a trade. Written so a stranger could execute it.`
- #anatomy `Stop placement plus target. Both decided before the entry, never after.`
- #anatomy `Fixed % per trade and per day. The number never changes.`
- #anatomy `A number that ends your day - in profit or in loss.`
- #template `The One-Page Plan` · `H4 trend only` · `0.618 + engulfing` · `−1R = done`
- #premarket `The Ten-Minute Checklist`
- #execution `Execute, Don't Improvise`
- #review `The Daily Review` · `03 · Were entry / stop / target where I wrote them?`
- #metrics `Read the Numbers, Not the Feelings`
- #drawdown `When the Plan Itself Is Tested` · `−3R from peak` · `−6R from peak` · `Plan change?`
- #cooldown `Circuit Breakers for Your Brain`
- #habit `Thirty Days to Automatic`
- 结语字带：`wish` · `system` · `Plan` · `Check` · `Execute` · `Review` · `Repeat`

### RSI_Indicator (48)
- #top `Module 18 · RSI Indicator`
- #agenda-sec `What Is RSI` · `70 Overbought · 30 Oversold` · `MT5 & Divergence` · `RSI Inside a Trend` · `Price Action + RSI` · `Common Misuses`
- #rsi-what `One Line, 0 to 100` · `Avg Gain (14)` · `Avg Loss (14)`
- #rsi-levels `70 Is Not a Sell Signal`
- #rsi-mt5 `Find It in the Navigator`
- #rsi-divergence `Divergence: Price Lies, RSI Tells`
- #rsi-trend `Overbought Can Stay Overbought`
- #rsi-price-action `RSI Is a Filter, Price Is the Trigger`
- #rsi-misuse `Common Ways RSI Gets Misused`
- #practice `Three Charts, One Method`
- #practice 案例一 `Gold · Range`：`Regime` · `RSI at top` · `72 + bearish divergence` · `Action` · `Short at resistance` · `Invalid` · `Close above range high` · `= range (clear S/R, no trend)` · `= 72 overbought + lower high = bearish divergence` · `= rejection candle at resistance`
- #practice 案例二 `EURUSD · Uptrend`：`65, holding above 50` · `Buy the pullback` · `Close below 50 + trendline` · `= uptrend (higher highs / higher lows)` · `= 65 overbought, but that is NORMAL in a trend` · `= do NOT short 65 - wait for the pullback into 45–50`
- #practice 案例三 `Gold · Fake Signal`：`73 - no divergence` · `Temptation` · `Short "because overbought"` · `Verdict` · `No trade - context forbids` · `= uptrend - higher highs intact` · `= 73 with a matching new high (no divergence)` · `= never fade a trend without divergence + level`
- #practice `Test yourself in the Module Quiz`
- 结语字带：`Context First` · `Level Second` · `RSI Confirms`

### Stochastic_Indicator (41)
- #agenda-sec `What is Stochastic` · `The Formula` · `Range` · `Close` · `Parameters` · `Levels` · `Crosses` · `Golden` · `Death` · `Divergence` · `Bearish` · `Bullish` · `Slow vs Fast` · `Fast` · `Slow` · `Use & Misuse` · `Trend`
- #what `An Oscillator in the Sub-Window` · `MT5 default` · `Stochastic Oscillator` · `Lowest Low` · `Highest High`
- #levels `Know Your Numbers` · `Defaults` · `Slowing (3)` · `Key levels`
- #crosses `Location Beats the Cross`
- #divergence `When Price Lies` · `Warning`
- #slowfast `Fast, Slow, and the Noise` · `Smoothing`
- #rsivs `Different Questions, Different Speed` · `Compare` · `STOCHASTIC`
- #trend `Stochastic Inside a Trend` · `Trend filter`
- #mistakes `The #1 Misuse` · `Common error`
- 结语字带：`Context First` · `Range Tool` · `Trend Filter`

### MACD_Indicator (27)
- #top `Module 20 · Trading Course`
- #agenda-sec `MT5 MACD Anatomy` · `The Formula` · `Golden & Death Cross` · `Histogram & Zero Line` · `Divergence` · `Parameters & Trend`
- #layout `What MT5's MACD Actually Draws`
- #formula `Three Averages, Stacked Twice` · `MACD Line` · `EMA(12)` · `EMA(26)` · `Signal` · `EMA(9)` · `Histogram`
- #cross `Golden Cross, Death Cross`
- #hist `Shrinking Bars Are a Warning`
- #zero `Above Zero, Below Zero - Who Is Winning`
- #divergence `Price Says One Thing, MACD Says Another`
- #params `12/26/9 vs 5/35/5 - What the Numbers Do`
- #trend `MACD Works With the Trend, Not Against It`
- #misuse `Why MACD Lies to Most People`
- 结语字带：`winning` · `matters` · `Trend First` · `Divergence Second` · `Cross Last`

### Platform_Costs (38)
- #agenda-sec `Order Types` · `Placing a Trade` · `The Real Costs` · `Demo → Live`
- #orders `Four Pending Orders, One Diagram` · `better` · `break through` · `Buy on a pullback` · `SELL LIMIT` · `Sell on a bounce` · `Buy on a breakout` · `Sell on a breakdown`
- #execute `Set the Stop Before You Click`
- #costs `Four Costs, Every Trade` · `Spread` · `always` · `Commission` · `per lot` · `Swap` · `per night` · `Slippage` · `varies` · `Total drag`
- #golive `Small Money Beats Fake Money`
- #golive `Demo` + `Learn the platform only. Order types, stops, the calculator, and the journal habit. Nothing about your emotions here is real.` + `Pass: 30 trades logged, 80%+ rules kept`
- #golive `Small Live` + `The smallest real account you can open, at 0.5% risk. The amount should be small enough not to hurt, but real enough to feel.` + `Pass: 50 trades, positive expectancy, rules still kept`
- #golive `Scale Up` + `Increase size in steps, never in one jump. Any step that breaks your rule-following rate means you moved too fast - go back one.` + `Rule: size up only at the monthly review`
- #golive `Calculator + Journal`
- 结语字带：`after` · `Know the Cost` · `Set the Stop` · `Then Click`

---

## 6. 验收脚本（每改完一页跑一次）

起本地服务：

```bash
node .claude/devserver.mjs MTJ-Hub
```

打开要验的页面，F12 控制台贴这段：

```js
(function(){
  var vis = e => e.getClientRects().length > 0;
  var els = [...document.querySelectorAll('body *')]
    .filter(e => !['SCRIPT','STYLE','CANVAS'].includes(e.tagName) && !e.closest('svg'));
  setLang('en'); var A = new Map(els.map(e => [e, [vis(e), (e.innerText||'').trim()]]));
  setLang('zh'); var B = new Map(els.map(e => [e, [vis(e), (e.innerText||'').trim()]]));

  // 1) 空洞：元素还在渲染，内容却没了
  var holes = els.filter(e => A.get(e)[1] && B.get(e)[0] && !B.get(e)[1]);
  holes = holes.filter(e => !holes.some(o => o !== e && o.contains(e)));

  // 2) 中文模式下还在显示的英文 = 剩余缺口
  setLang('zh');
  var left = [...new Set(els.filter(e =>
      !e.children.length && vis(e) &&
      !e.closest('svg,script,style,.nb-lang,.navbar,.secnav,.footer') &&
      !/[一-鿿]/.test(e.textContent||'') &&
      /[A-Za-z]{3,}/.test(e.textContent||'')
    ).map(e => e.textContent.trim()))];

  console.table({ 空洞: holes.length, 剩余英文: left.length,
                  巢状语言标签: document.querySelectorAll('.zh .zh,.en .en,.zh .en,.en .zh').length });
  console.log(left);
})();
```

**三个数字都要是 0：**

| 指标 | 必须 | 含义 |
|---|---|---|
| 空洞 | **0** | 有元素被掏空了 —— 这是最严重的，永远不许出现 |
| 剩余英文 | 0 | 该页翻译完成 |
| 巢状语言标签 | **0** | `.zh` 里又包了一层 `.zh`，会把句子拆成三行 |

`空洞 > 0` 表示你把英文藏了但没给中文——比不翻还糟，必须立刻回退。

---

## 7. 不要碰的东西

- `assets/galaxy.js`、`assets/hyperspeed.js`
- 各页 `<style>` 末尾那段 `===== Chinese is not a subtitle =====` 的 CSS —— 中文的字号与标题角色由它统一控制，逐页去调会又散掉
- 语言引擎本体（`hasZh` / `pairedEn` / `SYMBOL` / `isNotation`）——要改先跟我说
- `tools/XRs_Strategy_Composer_v2.4.html` 的繁体用字（另案处理）
- 任何 `localStorage` 的 key（`mtj_exam_pass_*`、`mtj_lang`、`mtj_admin` 等）

---

## 8. 交付方式

一页一个 commit，commit message 写清楚哪一页、补了多少条、验收三个数字。走 git，不要发文件。
