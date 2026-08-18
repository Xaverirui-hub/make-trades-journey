/* ===================================================================
   FOMC 决议记录 —— 页面显示的内容全部来自这里，读者不需要输入任何东西。

   分工（这份档案的设计前提）：
     数字（利率 / 票数 / 市场反应 / 下一事件）→ CSV 导入，自动渲染，每场都有
     判断（take_en / take_zh）              → 你自己写，选填。没写就只显示记录，
                                              不会开天窗，更不会由程序编观点。

   要新增一场：用 FOMC_Analyzer 页面的【管理员导入】面板选 CSV，它会解析、
   预览，并给出更新后的这份档案内容 —— 覆盖本档、提交，学生那边就更新了。
   （站点现在是纯静态，没有服务器可以接收上传。Phase 2 服务器上线后把那个
     面板改成 POST 即可，这份档案的结构不用动。）

   CSV 表头（顺序不限，缺的栏位留空）：
     date,title_en,title_zh,rate,hold,hike,cut,chair,dissenters,streak,
     statement,dxy,gold,goldchg,us10y,equities,timeline,next,take_en,take_zh
   =================================================================== */

/* 未来的会议日期 —— 页面顶部的 NEXT FOMC 用它。过了就删掉该笔
   （或整场决议搬进下面的 FOMC_RECORDS）。 */
window.FOMC_UPCOMING = [
  { date: '2026.09.16', label_en: 'September FOMC', label_zh: '9 月 FOMC' },
  { date: '2026.11.04', label_en: 'November FOMC', label_zh: '11 月 FOMC' },
  { date: '2026.12.16', label_en: 'December FOMC', label_zh: '12 月 FOMC' },
  { date: '2027.01.27', label_en: 'January FOMC', label_zh: '1 月 FOMC' }
];

window.FOMC_RECORDS = [
  {
    date: '2026.07.29',
    title_en: 'Rates Held Steady, Hawkish Undertones',
    title_zh: '利率按兵不动，鹰声渐起',
    rate: '3.50–3.75%',
    hold: 9, hike: 3, cut: 0,
    chair: 'Kevin Warsh',
    dissenters: 'Hammack · Kashkari · Logan（主张 +25bp）',
    streak: '连续第 5 次维持 · 自 2025 年 12 月以来未变',
    statement: '再度精简：删前瞻指引、剥离宽松倾向，与 6/17 声明几乎一致。保留「经济稳步扩张」，结尾定调「委员会将实现价格稳定」。',
    dxy: '自 ~101 回落，决议后承压 ↓',
    gold: '$4,035 → 盘中冲 $4,100',
    goldchg: 0.27,
    us10y: '4.70% ↑ +7bp（2Y −4bp）',
    equities: '决议后走强',
    timeline: '决议前 $4,035 → 「未加息」+ 美元走弱快速上冲 → 盘中一度 $4,100 → 收盘 +0.27%',
    next: '9月 FOMC (Sep 16) · 8月 NFP · CPI',
    take_en: 'A mirror of June: same hold, opposite reaction. Last month a hawkish dot plot knocked gold $60 lower; this time the same decision sent it up, because there was no fresh hawkish dot plot, "no hike" read as relief, and the dollar softened. But the long end rose and the hawkish undertone stayed - which is exactly what caps this kind of bounce.',
    take_zh: '与 6 月「镜像」：同样是维持，反应却相反。上月因鹰派点阵图，黄金跌 $60；这次同样维持却由跌转涨 —— 没有新增鹰派点阵、「未加息」本身构成宽慰、美元走弱。但长端利率上行、鹰派底色仍在，这也正是给这类反弹戴上天花板的东西。'
  }
];
