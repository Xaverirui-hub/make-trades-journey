# MTJ 靈魂注入 + em-dash 清理 + 語言嚴格互斥 — 整合 Spec（v4）

## 背景

MTJ 網站技術層 audit 已修完（gradient-text/codex-grid/layout-transition/hero 精簡全綠），但：
1. **缺少靈魂**（用戶原話：「好像缺少了一種吸引眼球、少了一種靈魂的感覺」）
2. **em-dash 全站殘留 1670 個**（AI cadence tell）
3. **語言切換未嚴格互斥**（中文模式仍顯示英文）

三個問題一次處理，出一個版本。**品牌資產全部保留**：深色主題、gold `#E8C877`、Sora/JetBrains Mono/Noto Sans SC、20+ 課內容、SVG 教學圖表、EXAM、localStorage key、admin 解鎖。

---

## Part A — 靈魂注入：「Chart-to-Language」敘事

### 診斷（為什麼現在沒靈魂）

| 問題 | 說明 |
|---|---|
| 無視覺錨 | Hero 只有文字 + 裝飾 canvas——剝掉文字，結構什麼都不是（skeleton test 失敗） |
| 無 signature motif | 全站只有 gold 色，無獨特視覺語言——跟任何 crypto dashboard 長一樣 |
| 全站無起伏 | 20 課卡全同構、stage 卡同構、工具卡同構——從上到下同一密度，沒有 peak |
| 無互動靈魂 | hover 只變色；考試通過解鎖無慶祝；鎖定卡無視覺層級 |

### 方向

MTJ 的 tagline 是 *"turning charts into a language you actually read"*——**靈魂 = 圖表本身**。把「讀懂圖表」變成全站視覺語言。

### A1. Hero Live-Chart（最高優先，視覺錨）

現在 hero 的 `<canvas id="heroChart">` 是裝飾性背景。升級為**敘事圖表**：

- 畫一條**金價 K 線/折線**在 hero 上（SVG 或 canvas 皆可，跟著 scroll 繪製）
- 沿圖表標記**課程節點**：第一根蠟燭（Module 4）→ 趨勢線（Module 6）→ Fibonacci（Module 7）→ 多週期（Module 8）……暗示「學完這 20 課你就讀得懂它」
- 節點 hover 顯示 module 名稱（小 tooltip）
- **必須 respect `prefers-reduced-motion`**：reduced 時直接顯示完整圖表不繪製動畫

**實現約束**：
- 用真實金價形狀（蠟燭/折線），不要抽象波浪
- 圖表是 hero 的**主角**，文字靠邊或疊加——skeleton test：只有圖表也能看懂這是交易教育網站
- 現有 `<canvas>` 若重繪成本高，可換內聯 SVG（課堂已有 SVG 繪圖函數可參考）

### A2. Signature Motif：「圖表標記」設計語言

全站統一用交易圖表元素當設計符號，取代 generic 裝飾：

- **Divider**：現在的分隔線加小蠟燭圖標（bull/bear 兩色）或支撐阻力線符號
- **Section 標題**：可選加 BOS（Break of Structure）標記點——`•` 前 gold 圓點 + 短線，像圖表上的結構標記
- **卡片 hover**：課程卡 hover 時顯示「價格標記線」動畫（左側 gold 線滑入 + 卡微抬升），像圖表上的水平線
- **統計數字**（20 MODULES 等）：用 mono font 大數字 + 下方細線，像 chart label

**注意**：motif 要**克制**——只在 divider/標題/hover 三處出現，不要每段都塞圖表元素（taste-skill: marquee/decoration max）。gold 是唯一 accent，不引入新色。

### A3. 卡層級起伏（打破全同構）

現在 20 課卡全部一模一樣。按狀態分三層：

| 狀態 | 視覺 |
|---|---|
| 已解鎖 + 已完成（exam pass） | 正常 gold 邊框 + 右上角 ✓ 標記（小） |
| 已解鎖但未完成 | 標準卡 |
| 鎖定（🔒 已刪，現在用文字） | **灰階**（opacity/desaturate）+ 無 hover 動畫 + 右下「PASS MODULE N EXAM TO UNLOCK」文字 |

**作用**：鎖定卡壓低 → 解鎖卡自然突出 → 頁面有節奏感。M1 永遠高亮（primary）。

### A4. Delight 時刻（互動靈魂）

- **考試通過解鎖**：`gradeExam()` 通過（≥70%）時，如果該卡在頁面上 → 觸發「點亮」動畫：卡從灰階過渡到 gold（`transition` 0.6s）+ 卡片標題閃一下。努力被認可的時刻。
  - **實作**：localStorage 已有 `mtj_exam_pass_<N>`；頁面載入時檢查各卡狀態套 class。通過瞬間的動畫在 exam 頁本頁（若卡在下方可見）或下一次回主頁載入時顯示。
  - **注意**：主頁卡和課程頁 exam 是不同頁面——exam 通過後回到主頁才會看到點亮，這是可接受的（載入時偵測 + 過渡）。
- **M20 畢業**：最後一課通過 → 卡片 gold 特別標記「GRADUATED · 畢業」。
- 不做：音效、彈窗、confetti 等過度慶祝（克制，proportional）。

### A5. Motion 升級

- 現有 reveal（IntersectionObserver fade-in）保留，但：
  - Hero 圖表 scroll 繪製（見 A1）
  - 卡 reveal 加**微上滑 + 錯峰**（stagger，延遲 40-80ms/卡），不要全頁同時 fade
- 所有 motion 尊重 `prefers-reduced-motion`
- 不引入 GSAP 等新依賴——純 CSS transition + IntersectionObserver（現有機制）

### A 部分驗收

- [ ] 剝掉文字，hero 圖表仍能傳達「交易教育」
- [ ] 全站出現 ≤3 種 chart motif（divider 蠟燭 / BOS 標記 / 卡 hover 線）
- [ ] 鎖定/解鎖/完成三層視覺可分辨
- [ ] exam 通過後回主頁看到解鎖卡「點亮」過渡
- [ ] reduced-motion 下無繪製動畫、無錯峰
- [ ] 無新色、無新字體、無新依賴

---

## Part B — em-dash 清理（全站 1670 個）

### 現況

impeccable detector：`em-dash-overuse` 全站 19 檔 advisory（主頁 16、課程頁合計 ~1424、工具 ~230）。taste-skill 9.G：**em-dash 完全禁令**（headlines/body/alt 全禁）。

### 修法

全站 `—`（U+2014）與 `–`（U+2013, 當分隔符使用時）替換：

| 語境 | 替換 |
|---|---|
| 句內停頓（"the journey — not the shortcut"） | 逗號或冒號或句號拆句 |
| 範圍（"2018-2026"） | 已用 hyphen 的部分保留；`–` 範圍改 `-` |
| 列表/解釋（"— from what a currency pair..."） | 冒號 + 逗號 |

**機械規則**（batch 可跑）：
1. `grep -o '—'` 每檔計數 → 目標 0
2. 主頁 hero sub「An education-first trading community — turning charts...」已見 hyphen 版（`-`）——**確認全站統一用普通 hyphen**（`-`）或完全重寫句式
3. 課程頁正文 em-dash 多為英文句（`—`），中文翻譯用 `——`（CJK 破折號）——**中文 `——` 保留**（它是正確的中文標點），只清英文 `—`
4. `–`（en-dash）在數字範圍時改 `-`

**驗收**：`grep -c '—' <每檔>` = 0；中文 `——` 不受影響（注意 `——` 包含 `—`，grep 時要排除雙連）

---

## Part C — 語言嚴格互斥（V3，STRICT 開啟）

### 現況

Claude 引擎 v2 已建好但 `STRICT=false`（每檔 line ~1013）：
- CSS 已備：`body.lang-zh.lang-strict .en{display:none}` + `body.lang-en .zh{display:none}`
- JS `markup()` 會自動把無 class 英文文本包 `<span class="en">`
- 阻塞：全站 **1520 個混雜節點**（同一 node 中英混排），選擇器拆不開

### 修法

1. **拆混雜節點**：所有「英文 + 中文同 node」拆成 `.en` + `.zh` 兩 span（優先順序：nav/品牌/title/hero → 章節標題 → 正文 → 工具頁）。可用批量腳本（模式重複：英文在前中文在後）
2. **品牌/title 替換**（用戶點名）：
   - `<title>`：`Make Trades Journey` ↔ `交易之旅`（`document.title` 由 setLang 更新）
   - hero H1：`Make Trades<br>Journey` ↔ `交易之旅`
   - logo 文字：`BY XRS TRADING LAB` ↔ `XRS 交易实验室`
   - nav：`ABOUT` ↔ `关于`、`PATH` ↔ `路径`、`COURSES` ↔ `课程`、`TOOLS` ↔ `工具`、`START` ↔ `开始`
   - section 標題 / footer 同理
3. **拆完後 `STRICT = true`**
4. **白名單**（中英都保留）：XRS、MT5、EA、FOMC、NFP、GDP、RSI、MACD、ADX、ATR、Fibonacci、Module（教學縮寫）

### 驗收（機械）

```js
// 中文模式
document.body.innerText.match(/[A-Za-z]{2,}/g)   // null（除白名單）
// 英文模式
document.body.innerText.match(/[\u4e00-\u9fff]/g)  // null（除白名單）
```

- [ ] `STRICT=true` 所有頁面
- [ ] 中文模式無英文殘留、英文模式無中文殘留
- [ ] `<title>`、hero、nav、footer 跟隨語言
- [ ] 跨頁持久（localStorage.mtj_lang 沿用）
- [ ] EXAM 題目/選項/解析雙模式各顯示對應語言
- [ ] 工具頁（Trade Journal/FOMC/Composer/Calculator）同樣互斥

---

## 通用約束

- **禁止改**：課程內容結構、SVG 教學圖表函數、EXAM 評分邏輯、localStorage key、admin 解鎖、FOMC/Composer 功能邏輯
- 全站 24 檔是模板複製：**先改模板源再批量同步**，或提供批量腳本
- 每檔改完 `node --check`（抽 JS）+ 瀏覽器實測
- 一個 commit 一個 Part（A/B/C 分開 commit，方便 review 對照）
