#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Add why_zh (Simplified Chinese) translation to each EXAM_QUESTIONS object.
Only appends ', "why_zh": "..."' before each object's closing '}' — never touches q/opts/ans/why."""
import json

BASE = "/tmp/mtj/MTJ-Hub/courses/"

# file -> list of 5 translations, in question order (same order as why texts)
TRANSLATIONS = {
 "Multi_Timeframe_Trading_MakeTradesJourney.html": [
  "先放大看趋势与方向倾向，再缩小看精确入场——只看单一周期只能得到部分信息。",
  "三层结构使用相隔约 4-6 倍的周期，例如日线到 H4 再到 H1。",
  "第一步：在高周期上找到趋势和关键价位——这就确定了你的方向倾向。",
  "黄金法则：永远顺着高周期的方向交易——上升趋势意味着只做多。",
  "低周期提供精确入场和紧凑止损的触发信号——只负责择时，绝不逆势交易。",
 ],
 "US_High_Impact_Data_MakeTradesJourney.html": [
  "市场已提前消化预期值。只有实际值与预期值之间的差距——即意外值——才会制造价格飙升。",
  "美联储的政策目标是核心 PCE 年率 2%——核心 PCE 是美联储最看重的通胀指标。",
  "非农数据在每月第一个周五美东时间 08:30 发布——就业、失业率和薪资数据同时公布。",
  "通胀高于预期属于鹰派信号——会推动美联储加息，提振美元和收益率，同时打压黄金。",
  "通胀降温加上就业疲软为降息打开大门（鸽派），通常会使美元走低、黄金走高。",
 ],
 "Risk_Management_MakeTradesJourney.html": [
  "亏损是不对称的：亏损 50% 后需要盈利 100% 才能回本——亏损百分比 ÷ (1 − 亏损百分比)。",
  "在 50% 胜率下，100 笔交易中出现 5 连亏几乎是必然的。这就是随机性的本来面目，不代表系统出了问题。",
  "先确定风险金额，把止损放在分析失效的位置，再计算手数——风险是固定的，手数是算出来的结果。",
  "外汇标准手为 100,000 单位基准货币；对 EURUSD 来说，每手 1 点 = 10 美元。",
  "风险只取决于手数 × 止损距离。杠杆只改变保证金——手数和止损相同，无论杠杆多少，亏损都一样。",
 ],
 "Journal_Review_MakeTradesJourney.html": [
  "没有交易日志，你只有账户余额。记忆会扭曲其余一切——它过度记住盈利和最近的交易，事后还会改写原因。",
  "遵守/违反规则是最重要的一栏——这是你在每一笔交易上都能诚实评判的唯一事项。",
  "遵守规则的亏损是做交易的正常成本。你做得完全正确——这种情况经常发生，本就应该存在。不要做任何改动。",
  "违反规则 + 盈利会奖励你移动止损或过度交易——这正是最终毁掉账户的行为。",
  "在不到 30 笔交易的情况下，仅凭运气观察到的胜率就可能在 28% 到 72% 之间波动。连亏 10 次就改系统是在追逐噪音，不是纪律。",
 ],
 "Psychology_Discipline_MakeTradesJourney.html": [
  "卡尼曼和特沃斯基的研究表明，亏损带来的痛苦大约是同等盈利带来快乐的 2 倍——价值曲线是不对称的。",
  "这是有据可查的倾向：过早了结盈利单、过久持有亏损单——与正期望系统所需要的恰恰相反。",
  "亏损后的下一笔交易将是你一天中最糟糕的决定。30 分钟离场休息加上每日止损限制，可以打断报复性交易循环。",
  "移动止损是散户最昂贵的习惯。止损只能朝有利方向移动；如果你放宽了止损，即使盈利也要记作违反规则。",
  "盈利之后，利润感觉像“捡来的钱”，成功被归因于能力，仓位就会悄悄加大。风险百分比按月设定——绝不在顺风的一周中途调高。",
 ],
}

def main():
    for fname, zh_list in TRANSLATIONS.items():
        path = BASE + fname
        with open(path, encoding="utf-8") as fh:
            lines = fh.read().split("\n")
        idx = [i for i, l in enumerate(lines) if "const EXAM_QUESTIONS" in l]
        assert len(idx) == 1, f"{fname}: EXAM_QUESTIONS line not unique ({idx})"
        li = idx[0]
        line = lines[li]

        # parse to get why texts in order
        body = line[line.index("["): line.rindex("];") + 1]
        import re
        quoted = re.sub(r'([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)', r'\1"\2"\3', body)
        arr = json.loads(quoted)
        assert len(arr) == len(zh_list), f"{fname}: {len(arr)} questions vs {len(zh_list)} translations"

        # inject
        new_line = line
        for i, (qobj, zh) in enumerate(zip(arr, zh_list)):
            why = qobj["why"]
            anchor = '"why": "' + why + '"}' if i < len(arr) - 1 else None
            # all objects end with "why": "..."} (last one followed by ];)
            anchor = '"why": "' + why + '"}' 
            repl = '"why": "' + why + '", "why_zh": ' + json.dumps(zh, ensure_ascii=False) + '}'
            cnt = new_line.count(anchor)
            assert cnt == 1, f"{fname}: Q{i+1} anchor count = {cnt}"
            new_line = new_line.replace(anchor, repl, 1)
        assert new_line.count('"why_zh"') == len(arr), f"{fname}: why_zh count wrong"

        lines[li] = new_line
        with open(path, "w", encoding="utf-8") as fh:
            fh.write("\n".join(lines))
        print(f"OK {fname}: injected {len(arr)} why_zh")

if __name__ == "__main__":
    main()
