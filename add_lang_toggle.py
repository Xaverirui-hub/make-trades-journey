#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Add language toggle + Chinese why_zh explanations to 5 course pages (template pattern)."""
import io, sys

BASE = "/tmp/mtj/MTJ-Hub/courses/"

# original why text -> simplified Chinese translation
TRANS = {
"Trendlines_Channels_MakeTradesJourney.html": {
  "One touch is a guess, two touches draw a line, three touches make a level the market cares about.":
    "一次触碰只是猜测，两次触碰画出趋势线，三次触碰才形成市场真正在意的关键位。",
  "An uptrend is higher highs and higher lows, so its line connects the lows — it is the buyers' floor. Never mix: a line touching both is a channel.":
    "上升趋势是高点更高、低点更低，所以趋势线连接的是低点——它是多头的底线。切勿混用：同时触碰高低点的线是通道。",
  "A break counts on the close, not the wick. A fakeout spikes through, fills the stacked orders, then closes back inside and reverses hard.":
    "突破以收盘价为准，而不是影线。假突破刺穿趋势线、吃掉堆积的挂单，然后收回线内并猛烈反转。",
  "The lower rail is the trading edge: pullback entry with a reaction candle, stop below the rail, target the upper rail. The middle is no-man's land.":
    "下轨才是交易边界：等回踩出现反应K线进场，止损放下轨下方，目标看上轨。通道中间是无主之地。",
  "A broken trendline flips roles: an uptrend line broken from above becomes resistance; a downtrend line broken from below becomes support. The retest tests that role change.":
    "被跌破的趋势线角色互换：上升趋势线从上方跌破后变成阻力；下降趋势线从下方突破后变成支撑。回测检验的正是这个角色转换。",
},
"Supply_Demand_MakeTradesJourney.html": {
  "Zones are leftover resting orders from institutional accumulation. Unfilled orders pull price back — that is exactly why zones get retested.":
    "供需区是机构吸筹后留下的未成交挂单。未成交的挂单会把价格拉回来——这正是供需区会被反复回测的原因。",
  "The zone is the base — the tight 3-7 candle consolidation right before the ignition. Mark the whole band top to bottom; it is not the low of the drop.":
    "供需区指的是起爆前那段 3-7 根K线的紧凑横盘带（base）。要自上而下标记整条带子；它不是急跌的最低点。",
  "Zones are consumable — every touch removes resting orders. Old, repeatedly-tapped zones are noise; trade only fresh and violent zones.":
    "供需区是可消耗的——每一次触碰都会消耗挂单。被反复触碰的旧区域只是噪音；只交易新鲜而有力的区域。",
  "Stop goes beyond the zone with a small buffer, never inside it. The zone is where price breathes; a stop inside it gets hunted by the overshoot.":
    "止损放在区域之外并留一点缓冲，绝不放区域内部。区域是价格喘息的地方；止损放里面会被过冲扫掉。",
  "A wick through is a test; a close through the whole band with follow-through is the verdict. The resting orders are gone — the zone has no fuel left.":
    "影线穿透只是试探；收盘穿过整条带子并连续确认才是失效的判决。挂单已经耗尽——区域再也没有燃料。",
},
"Trade_Management_MakeTradesJourney.html": {
  "A stop only moves in the direction of the trade and never widens. Widening a stop is not management — it is hope wearing a disguise, and a brand-new unknown risk.":
    "止损只能朝交易有利的方向移动，绝不加宽。加宽止损不是管理——那是披着伪装的希望，以及一笔全新的未知风险。",
  "Realized R = (1/3 x 1R) + (1/3 x 2R) + (1/3 x 3R) = 2.0R. The 1R you give up is the insurance cost for a much higher win rate.":
    "已实现 R = (1/3 x 1R) + (1/3 x 2R) + (1/3 x 3R) = 2.0R。你放弃的那 1R，是为更高胜率付出的保险费。",
  "The standard trigger is +1R — price has paid for the risk once, so the trade is free to run. Moving at +0.2R just donates the trade to normal noise.":
    "标准触发点是 +1R——价格已经为风险付过一次钱，交易可以自由奔跑。在 +0.2R 就移动止损，只是把交易白白送给正常波动。",
  "Progress means reaching 1R or breaking a meaningful structure level — nothing else. A trade that stops moving is telling you the setup is not working; time is the resource you cannot buy back.":
    "有意义的进展指到达 1R 或突破有意义的结构位——仅此而已。不再移动的交易是在告诉你这个形态没有起作用；时间是你买不回来的资源。",
  "A trend system with a fixed stop cuts every trend, and a range system with a trail gives back every range. Fixed stops fit range systems; trails fit trend systems.":
    "趋势系统用固定止损会把每段趋势都砍掉，区间系统用移动止损会把每段区间都还回去。固定止损适合区间系统；移动止损适合趋势系统。",
},
"Backtesting_System_Design_MakeTradesJourney.html": {
  "Edge is a statistical property of a sequence, never of one trade. A coin flip can produce ten winners; only positive expectancy repeated over many trades separates skill from luck.":
    "优势是序列的统计属性，绝不是某一笔交易的属性。抛硬币也能连赢十次；只有在大量交易中反复兑现的正期望值，才能把技术与运气区分开。",
  "Lookahead bias means your rules quietly use information that was not available in real time — impossible live, invisible in the spreadsheet. Define rules before seeing data.":
    "前视偏差意味着你的规则悄悄使用了当时无法实时获得的信息——实盘做不到，在回测表里也看不出来。要在看到数据之前先定义规则。",
  "With 30 trades the 95% range spans roughly 37%-73% — indistinguishable from a coin flip. 100-150 is the practical minimum; 300+ earns a real opinion.":
    "30 笔样本的 95% 区间大约横跨 37%-73%——和抛硬币无法区分。100-150 笔是实际的最低要求；300 笔以上才配谈真正的结论。",
  "A narrow spike sweet spot, in-sample profit that degrades out-of-sample, and too many parameters are the classic tells. A real edge is a plateau, not a spike.":
    "窄尖峰的最优区、样本内盈利但样本外明显缩水、参数过多——这些是过拟合的典型特征。真正的优势是一片高原，而不是一根尖峰。",
  "You enter at the ask and exit at the bid, so the spread is paid twice per round trip. A backtest without costs is a fantasy — net R = gross R minus costs.":
    "你按卖价进场、按买价出场，所以一次往返要付两次点差。不计成本的回测只是幻想——净 R = 毛 R 减去成本。",
},
"Trading_Plan_Routine_MakeTradesJourney.html": {
  "A plan inserts a pause between the stimulus and the click. That pause is the entire difference between a trader and a gambler — one decision per trade, made once before the open.":
    "计划在「刺激」和「下单」之间插入一个停顿。这个停顿就是交易者与赌徒的全部区别——每笔交易只有一个决策，而且在开盘前只做一次。",
  "The six blocks are Market, Timeframe, Entry, Exit, Risk and Daily Target. Adding to a winner is not one of them — risk stays a fixed number that never changes.":
    "六大组成是市场、周期、进场、出场、风险与每日目标。盈利后加仓不在其中——风险始终是一个固定不变的数字。",
  "The routine is the job; the trade is optional. You run the checklist at the same time in the same order every day — even on zero-trade days, and especially during the 30-day build.":
    "例行程序才是工作；交易只是可选项。每天在同一时间、按同一顺序执行检查清单——即使是不交易的日子，尤其是 30 天养成期。",
  "Stage 1 at -3R: halve the size but keep trading the same setups — the system is untouched, only exposure drops. Plan changes need 30+ trades of evidence, never 5 losses.":
    "-3R 属于第一阶段：手数减半，但继续做同一套形态——系统本身不变，只是敞口降低。修改计划需要 30 笔以上的证据，绝不是亏 5 笔就改。",
  "Two consecutive losses → close the platform, stand up, walk away for 30 minutes. Cooldown rules must be physical and immediate — I will just watch is not a cooldown.":
    "连续亏损两笔 → 关掉平台，站起来，离开 30 分钟。冷却规则必须是身体力行、立即执行的——「我就看看」不算冷却。",
},
}

# topbar .live line per file -> wrapped with lang buttons
LIVE_WRAP = {
"Trendlines_Channels_MakeTradesJourney.html":
  '  <div class="live"><span class="dot"></span>Module&nbsp;13 · Trendlines</div>',
"Supply_Demand_MakeTradesJourney.html":
  '  <div class="live"><span class="dot"></span>Supply&nbsp;&amp;&nbsp;Demand · Live</div>',
"Trade_Management_MakeTradesJourney.html":
  '  <div class="live"><span class="dot"></span>Trade&nbsp;Course · Live</div>',
"Backtesting_System_Design_MakeTradesJourney.html":
  '  <div class="live"><span class="dot"></span>Backtest&nbsp;Course · Live</div>',
"Trading_Plan_Routine_MakeTradesJourney.html":
  '  <div class="live"><span class="dot"></span>Trading&nbsp;Plan · Live</div>',
}

BTN_ON  = "background:var(--gold);color:#0a0e14;border-color:var(--gold);border-radius:20px;padding:5px 14px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.1em;cursor:pointer;font-weight:700;"
BTN_OFF = "background:none;border:1px solid var(--line);color:var(--muted);border-radius:20px;padding:5px 14px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.1em;cursor:pointer;"
BTN_BASE = "background:none;border:1px solid var(--line);color:var(--muted);border-radius:20px;padding:5px 14px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.1em;cursor:pointer;"

def wrap_live(live_line):
    indent = live_line[:live_line.index('<')]
    inner = live_line.strip()
    return (indent + '<div style="display:flex;align-items:center;gap:14px;">\n'
            + indent + '  ' + inner + '\n'
            + indent + '  <div style="display:flex;align-items:center;gap:6px;">\n'
            + indent + '    <button onclick="setLang(\'en\')" id="langEn" style="' + BTN_BASE + '">EN</button>\n'
            + indent + '    <button onclick="setLang(\'zh\')" id="langZh" style="' + BTN_BASE + '">中</button>\n'
            + indent + '  </div>\n'
            + indent + '</div>')

OLD_GRADE = """      var user = parseInt(sel.value);
      if(user === item.ans){
        correct++;
        fb.innerHTML = "<span style='color:var(--bull);font-weight:600;'>✓ Correct 正确</span><br><span style='color:var(--muted);font-size:12.5px;'>" + item.why + "</span>";
      } else {
        fb.innerHTML = "<span style='color:var(--bear);font-weight:600;'>✗ Wrong 错误</span><br><span style='color:var(--muted);font-size:12.5px;'>你的答案: <b>" + item.opts[user] + "</b> · 正确答案: <b>" + item.opts[item.ans] + "</b><br>为什么错: " + item.why + "</span>";
      }"""

NEW_GRADE = """      var user = parseInt(sel.value);
      var zhMode = document.body.classList.contains('lang-zh');
      var whyTxt = (zhMode && item.why_zh) ? item.why_zh : item.why;
      if(user === item.ans){
        correct++;
        fb.innerHTML = "<span style='color:var(--bull);font-weight:600;'>✓ Correct 正确</span><br><span style='color:var(--muted);font-size:12.5px;'>" + whyTxt + "</span>";
      } else {
        fb.innerHTML = "<span style='color:var(--bear);font-weight:600;'>✗ Wrong 错误</span><br><span style='color:var(--muted);font-size:12.5px;'>你的答案: <b>" + item.opts[user] + "</b> · 正确答案: <b>" + item.opts[item.ans] + "</b><br>为什么错: " + whyTxt + "</span>";
      }"""

CSS_LANG = "body.lang-en .zh{display:none !important;}\nbody.lang-zh .zh{display:block !important;}\n"

SETLANG_JS = """
<script>
/* ===== MTJ Language Toggle (course) ===== */
function setLang(l){
  document.body.classList.remove('lang-en','lang-zh');
  document.body.classList.add('lang-'+l);
  try{ localStorage.setItem('mtj_lang', l); }catch(e){}
  var en=document.getElementById('langEn'), zh=document.getElementById('langZh');
  var on = '""" + BTN_ON + """';
  var off = '""" + BTN_OFF + """';
  if(en) en.style.cssText = l==='en' ? on : off;
  if(zh) zh.style.cssText = l==='zh' ? on : off;
}
(function(){
  var saved='en'; try{ saved=localStorage.getItem('mtj_lang')||'en'; }catch(e){}
  setLang(saved);
})();
</script>

"""

def main():
    ok = True
    for fname, trans in TRANS.items():
        path = BASE + fname
        with io.open(path, encoding='utf-8') as f:
            c = f.read()
        # 1) add why_zh after each why
        for orig, zh in trans.items():
            old = '"why": "' + orig + '"'
            new = '"why": "' + orig + '", "why_zh": "' + zh + '"'
            n = c.count(old)
            if n != 1:
                print("FAIL[why] %s count=%d for: %s" % (fname, n, orig[:50])); ok = False; continue
            c = c.replace(old, new)
        # 2) gradeExam scope
        n = c.count(OLD_GRADE)
        if n != 1:
            print("FAIL[grade] %s count=%d" % (fname, n)); ok = False
        else:
            c = c.replace(OLD_GRADE, NEW_GRADE)
        # 3) CSS before </style>
        n = c.count('</style>')
        if n != 1:
            print("FAIL[style] %s count=%d" % (fname, n)); ok = False
        else:
            c = c.replace('</style>', CSS_LANG + '</style>', 1)
        # 4) topbar buttons
        live = LIVE_WRAP[fname]
        n = c.count(live)
        if n != 1:
            print("FAIL[live] %s count=%d" % (fname, n)); ok = False
        else:
            c = c.replace(live, wrap_live(live), 1)
        # 5) setLang before </body>
        n = c.count('</body>')
        if n != 1:
            print("FAIL[body] %s count=%d" % (fname, n)); ok = False
        else:
            c = c.replace('</body>', SETLANG_JS + '</body>', 1)
        with io.open(path, 'w', encoding='utf-8') as f:
            f.write(c)
        print("OK %s  why_zh added=%d" % (fname, len(trans)))
    sys.exit(0 if ok else 1)

if __name__ == '__main__':
    main()
