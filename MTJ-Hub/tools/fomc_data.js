/* ===================================================================
   FOMC 决议记录 —— 页面显示的内容全部来自这里,读者不需要输入任何东西。

   要新增一次决议:用 FOMC_Analyzer 页面上的【管理员导入】面板选一个 CSV,
   它会解析、预览,并给出更新后的这份档案内容 —— 覆盖本档、提交,学生那边
   就更新了。

   为什么是「产出档案再提交」而不是直接上传:现在站点是纯静态(GitHub
   Pages),没有服务器可以接收上传。等 Phase 2 的服务器上线,那个面板改成
   POST 到接口即可,这份档案的结构不用动。

   CSV 表头(顺序不限,缺的栏位留空即可):
     date,rate,hold,hike,cut,statement,dxy,gold,goldchg,us10y,equities,timeline,next
   =================================================================== */
/* 未来的会议日期 —— 页面顶部的 NEXT FOMC 用它。
   过了就把该笔删掉(或整场决议搬进下面的 FOMC_RECORDS)。
   这几个日期是这支工具原本就带的,不是新编的。 */
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
    statement: '声明精简，删除前瞻指引，保留经济稳步扩张表述',
    dxy: '101.2 → 100.8 (走弱 -0.4%)',
    gold: '$4,120',
    goldchg: 0.8,
    us10y: '4.55% ↓ -6bp',
    equities: '+0.9%',
    timeline: '决议前 $4,080 → 决议后冲 $4,150 → 收盘 $4,120',
    next: '11月 FOMC (Nov 4-5) · 10月 NFP · CPI'
  }
];
