# MTJ Design & Code Audit — Fix Spec (impeccable + taste-skill)

## 背景

用 impeccable detector 全 repo 掃描（20 課 + 3 工具 + 主頁），**72 個 anti-patterns + 24 個 advisory**。全站統一設計語言但帶系統性 AI 生成痕跡。目標：移除 AI tells，保留品牌（深色 + gold #E8C877 + Sora/JetBrains Mono/Noto Sans SC）。

## Audit Health（impeccable 5 維）

| # | 維度 | 分數 | 關鍵發現 |
|---|------|------|---------|
| 1 | Accessibility | 3/4 | 深色對比 OK；SCROLL 提示多餘 |
| 2 | Performance | 3/4 | transition:width 1 處（Trade_Journal） |
| 3 | Theming | 3/4 | 全站 dark 一致 ✅，但有 hard-coded color glow |
| 4 | Responsive | 3/4 | 未見破壞性固定寬度 |
| 5 | Implementation Integrity | 1/4 | **72 個 anti-patterns = 系統性 AI 痕跡** |

## P0 — 全站批量修正（detector 機械可驗證）

### 1. dark-glow（26 處，全站）
- **位置**：每頁 CSS 的 zero-offset box-shadow glow（`#2cd98a` 綠 / `#e8c877` 金）
- **問題**：colored glow shadow = AI 生成 UI 的 signature「cool」look
- **修法**：移除 chromatic glow（box-shadow 0 偏移彩色光暈），改中性 elevation shadow（`rgba(0,0,0,.3)` 級別）或無 shadow。金色 hover 光暈只保留 CTA 按鈕上一處（品牌 accent 合理使用）

### 2. codex-grid-background（25 處，全站）
- **位置**：每頁 body 背景的 two-axis grid-line linear-gradient（hairline grid 圖案）
- **問題**：裝飾性 grid 背景是 recurring generated-UI signature
- **修法**：移除 grid-line 背景層，改純色深背景（`#0a0e14` 級）或單一 radial vignette。保留 particles canvas（hero 互動是內容）

### 3. gradient-text（20 處，全部課程頁）
- **位置**：每課 hero/標題的 `background-clip: text + gradient`
- **問題**：漸層文字 = decorative 非 meaningful，AI tell（尤其 heading）
- **修法**：標題改 solid color（白或 gold 純色）。保留「閱讀進度」等 stateful 元素不需要漸層

### 4. layout-transition（1 處，Trade_Journal）
- **位置**：Trade_Journal.html line ~190 `transition: width`
- **問題**：animating width 造成 layout thrash
- **修法**：改 `transform: scaleX()` 或 `grid-template-rows`，或移除

### 5. em-dash-overuse（24 處，全站 advisory）
- **位置**：全站 body copy（主頁 46 個，課程頁 20+ 個）
- **問題**：em-dash 飽和 = AI cadence tell（impeccable advisory + taste-skill 9.G 完全禁令）
- **修法**：全站 `—` 換成逗號/句號/冒號/括號或 hyphen。**機械掃描：`grep -c '—'` 每頁 = 0**

## P1 — 主頁結構（taste-skill audit）

### 5.5 語言切換：中英互斥顯示 + 全域持久（2026-08-08 用戶要求）

**現況問題**：
- 中文模式下**英文原文和中文翻譯同時顯示**（CSS 只處理了 `lang-en .zh{display:none}`，沒有隱藏英文文本）→ 切到中文還是滿頁英文，切換不分明
- `localStorage.mtj_lang` + 每頁載入 `setLang(saved)` 機制已存在，但需確認**全站 24 頁（20 課 + 3 工具 + 主頁）都有**這段恢復代碼，且互斥顯示要做到位

**需求**：
1. **中文模式 = 只顯示中文字**；英文模式 = 只顯示英文字。兩個模式互斥，不再混排
2. **切一次語言，之後打開的所有頁面都是該語言**——不需要每進一個頁面就重切一次

**實現方向（方案 Claude 定，以下是約束）**：
- 現況結構：英文是元素文本（如 `<p>An education-first trading community...</p>`），中文是後綴 `<span class="zh">`。CSS 無法隱藏純文本節點，需方案之一：
  - a) 英文文本包 `<span class="en">`，CSS：`body.lang-en .zh{display:none}` + `body.lang-zh .en{display:none}`（全站批量標記）
  - b) JS 方案：setLang 時遍歷 DOM 隱藏/顯示（但 text node 不能 display:none，需包節點）
  - c) 元素級標記：給含雙語的容器加 class，CSS 用子選擇器
- **禁止改**：EXAM 考試邏輯、SVG 圖表、localStorage key（mtj_lang 沿用）、admin 解鎖
- 全站 24 頁是模板複製，優先改模板源再批量同步（同 P0 批量策略）

**驗收**：
- [ ] `body.lang-zh` 下頁面可見文本 = 全中文（無英文殘留）
- [ ] `body.lang-en` 下頁面可見文本 = 全英文（無中文殘留）
- [ ] 切到中文 → 打開另一頁（課程/工具/主頁）→ 自動中文，無需重切
- [ ] 刷新後語言保持

### 6. Scroll cue
- **位置**：主頁 + 課程頁 hero 底部 `.scroll-hint`（「SCROLL」+ mouse icon）
- **修法**：刪除整個 `.scroll-hint` 區塊（banned: users know what scroll is）

### 7. Section-number eyebrows
- **位置**：主頁 `01 / STRUCTURE`、`02 / BILINGUAL`、`03 / VISUAL`、`04 / RISK FIRST`、stage `01-04`
- **修法**：刪掉編號前綴，只留文字 label（`STRUCTURE` 或直接沒 eyebrow，headline 已足夠）。課程頁 `PART 01 · 第一部分`、`B.01` 是內容編號可保留（教育目錄用途合理）

### 8. Hero 元素超載
- **位置**：主頁 hero（eyebrow + h1 + 中文 + para + 4 stats + 2 CTAs + scroll ≈ 9 元素）
- **修法**：砍到 ≤4：h1 + 中文 + para + 1 primary CTA。stats（20/04/03/EN）移到 hero 下方獨立 strip；`SCROLL` 刪除；secondary CTA「ABOUT US」併入 nav

### 9. Middle-dot 濫用
- **位置**：nav 每項 `ABOUT · 关于`、footer `© 2026 · By XRs · Learning Hub`
- **修法**：nav 用中英分行或空格分隔（`ABOUT 关于`），減少 `·` 密度（每行 ≤1）

### 10. 🔒 emoji
- **位置**：主頁鎖定課程 `🔒 PASS MODULE 1 EXAM TO UNLOCK`、COMING SOON 卡
- **修法**：emoji 換 inline SVG icon（鎖圖示）或純文字 `LOCKED · PASS MODULE 1 EXAM TO UNLOCK`

### 11. 過時文案
- **位置**：主頁 WHO WE ARE「Nine modules in a deliberate order」→ 應為 **Twenty modules**
- **修法**：改「Twenty modules」，全站 hero stats 已顯示 20 一致化

## P2 — 內容/結構

### 12. 課程卡同構
- **位置**：主頁 20 張 module 卡全同構（MODULE N + 3 chips + OPEN）
- **修法**：維持卡結構（教育目錄需要一致性），但每 stage 標題區可加細微視覺差異（icon glyph 或 stage 色標）。**不要大改——一致性是教育網站資產**

### 13. FOMC 靜態數據
- **位置**：主頁 FOMC Analyzer 卡「FED FUNDS RATE 3.50–3.75% HOLD · 第 5 次」
- **修法**：加「as of <日期>」或從最新 fomc_reports 讀取；不硬編碼

## 驗收（detector 機械驗證）

```bash
# 每頁（20 課 + 3 工具 + 主頁）跑：
node <impeccable-cli>/cli.js detect <file>
# 期望：0 anti-patterns（除 layout-transition 已修）

# em-dash：
grep -c '—' <file>   # = 0
```

- [ ] `dark-glow` / `codex-grid-background` / `gradient-text` / `layout-transition` = 0
- [ ] em-dash = 0（全站）
- [ ] `.scroll-hint` 不存在
- [ ] 主頁無 `01 /` 編號 eyebrow
- [ ] hero stats 移出 hero 區
- [ ] 🔒 emoji 換 icon
- [ ] "Nine modules" → "Twenty modules"
- [ ] 視覺不變：深色 + gold + 字體保留，課程內容/SVG 圖表完全不動

## 注意

- **只改 CSS 視覺層 + copy**，**禁止改**：課程 HTML 內容結構、SVG 圖表函數、EXAM JS、localStorage 機制、語言切換邏輯、admin 解鎖
- 全站 24 個檔案是模板複製的，CSS 在每頁 head 內嵌 —— 優先改 template 源（Risk_Management 模板）再批量同步，或提供批量替換腳本
- 品牌底子好（非 Inter、單 accent、深色一致），這是 polish 不是 redesign
