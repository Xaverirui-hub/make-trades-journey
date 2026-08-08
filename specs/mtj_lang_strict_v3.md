# MTJ 語言嚴格互斥 — Language Strict Mode v3

## 需求（用戶原話，2026-08-08）

> 開華語的時候不顯示英文，開英文的時候不顯示華語。每個界面都有 title——華語版就拿封面來說，「Make Trades Journey」就換成「交易之旅」，不顯示「Make Trades Journey」，以此類推。

**一句話**：語言切換 = 頁面**完全**變成該語言。中文模式下頁面上**零英文字母**（品牌名/標題/nav/正文全中文化），英文模式下**零中文字**。不是隱藏翻譯，是**替換顯示**。

## 現況（Claude 語言引擎 v2，已 push）

引擎機制已建好但**故意關閉**：
- `make-trades-journey/MTJ-Hub/MakeTradesJourney.html` line ~958-1048 語言引擎
- CSS 已備：`body.lang-zh.lang-strict .en{display:none}` + `body.lang-en .zh{display:none}`（line 262-264）
- JS 已備：`markup()` 自動把無 class 英文文本節點包 `<span class="en">`（data-bi 標記）
- **但 `var STRICT = false`（line 1013）**——註解明說「a lot of copy still mixes both languages inside one text node (.note, figcaption), which no selector can split. Flip STRICT to true once that pass lands.」

**阻塞原因**：全站仍有 **1382 個混雜節點**（同一 text node 內中英混排），選擇器拆不開 → 開 STRICT 會留下英文殘片。實測：

```
MakeTradesJourney.html: 138
Trading_Plan_Routine: 105 | US_High_Impact_Data: 129 | RSI: 87 | MACD: 83 | Trade_Management: 76 ...
共 24 檔 1382 節點
```

## 需求拆解

### 1. 拆完混雜節點 → 開 STRICT

所有「英文 + 中文同 node」的 copy 拆成兩份：
```html
<!-- 現在（混雜） -->
<p>About · 关于</p>
<!-- 拆後 -->
<p><span class="en">About</span><span class="zh">关于</span></p>
```
- **優先順序**：nav / 品牌名 / title / hero / 章節標題 → 正文 → 工具頁
- **混雜節點清單**：上面的 scan 結果是完整清單（每檔的節點原文）
- 拆完一檔驗一檔，**每檔拆完後**（不是全站拆完）即可開 STRICT——STRICT 是 body class，per-page 生效

### 2. 品牌名 / 標題替換（用戶特別點名）

| 元素 | 英文模式 | 中文模式 |
|---|---|---|
| `<title>`（瀏覽器 tab） | Make Trades Journey · Trading Basics 等 | 交易之旅 · 交易基础 等 |
| hero H1「Make Trades Journey」 | Make Trades Journey | 交易之旅 |
| logo 文字 | Make Trades Journey / BY XRS TRADING LAB | 交易之旅 / XRS 交易实验室 |
| nav（ABOUT/PATH/COURSES/TOOLS/START） | About / Path / Courses / Tools / Start | 关于 / 路径 / 课程 / 工具 / 开始 |
| section 標題 | Who We Are / The Route... | 关于我们 / 学习路线... |
| footer | Make Trades Journey · By XRs Trading Lab | 交易之旅 · XRS 交易实验室 |

**要求**：不是「英文隱藏、中文顯示」的並排，而是**同一位置替換**。中文模式 `title` 屬性也要換（`document.title` 由 setLang 更新）。

### 3. 機械可驗證的完成定義

```js
// 中文模式：可見文本 0 個拉丁字母序列（2+ 連字母）
document.body.innerText.match(/[A-Za-z]{2,}/g)  // 必須 = null（除品牌縮寫如 XRS/EA/MT5 白名單）
// 英文模式：可見文本 0 個 CJK 字符
document.body.innerText.match(/[\u4e00-\u9fff]/g)  // 必須 = null
```

**白名單**（中英都保留的術語，可討論）：`XRS`、`MT5`、`EA`、`FOMC`、`NFP`、`GDP`、`RSI`、`MACD`、`ADX`、`ATR`、`Fibonacci`（教學縮寫，屬術語非文案）

## 驗收

- [ ] `STRICT = true`（所有頁面）
- [ ] 中文模式：每頁 `innerText` 無拉丁字母序列（白名單除外）
- [ ] 英文模式：每頁 `innerText` 無 CJK 字符（白名單除外）
- [ ] `<title>` 跟隨語言切換
- [ ] hero 品牌名：中文模式顯示「交易之旅」而非「Make Trades Journey」
- [ ] nav / section 標題 / footer 全部替換式互斥
- [ ] 語言偏好跨頁持久（localStorage.mtj_lang，已存在）
- [ ] 考試（EXAM）題目/選項/解析在兩種模式各顯示對應語言
- [ ] 工具頁（Trade Journal / FOMC / Composer / Calculator）同樣互斥
- [ ] SVG 圖表內的文字 label：能互斥就互斥，技術上難拆的（如圖表軸標籤）至少不違反「術語白名單」精神

## 注意

- **禁止改**：課程內容結構之外的邏輯、EXAM 評分邏輯、localStorage key、admin 解鎖、SVG 繪圖函數（除非只改 label 文字）
- 混雜節點是**批量可拆的**（同一模式重複）：英文在前中文在後 → 用腳本拆，勿手改 400KB 檔
- 拆完用 `node --check` + 瀏覽器實測雙模式
- 引擎（markup/setLang/STRICT）Claude 已寫好，這版主要是**內容拆分 + 開關**
