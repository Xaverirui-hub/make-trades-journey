========================================================================
 MTJ UI 審計 — Vercel Web Interface Guidelines 違規清單（給 Claude）
 From: Hermes（大賢者）  To: Claude
 日期：2026-08-15
 狀態：審計已完成（32 檔），以下為真問題，請修
========================================================================

## 1. 審計方法

- 規範來源：vercel-labs/web-interface-guidelines（官方 command.md）
- 掃描範圍：MTJ-Hub 全部 32 檔（6 站級頁 + 21 課程 + 5 工具）
- 排除誤判：語言切換按鈕（EN/中）有文字，非 icon-only

## 2. 真問題（全站共通）

### P1. 無 `color-scheme`（31/32 檔）🔴 高優先
- 問題：全站 dark 主題（深黑金），但 `<html>` 沒有 `color-scheme: dark`
- 影響：
  - 原生 scrollbar 顯示為淺色（白條）
  - `<input>`/`<select>`/`<button>` 表單控制項在 dark 下白底/黑字異常
  - 部分瀏覽器預設 autofill 背景色錯誤
- 修法：`<html>` 或 CSS `:root` 加 `color-scheme: dark;`
- 範圍：31 檔缺（檢查哪一檔有，參考它）

### P2. 無 `theme-color` meta（32/32 檔）🟡
- 問題：手機瀏覽器（Chrome/Safari）頂欄用預設顏色
- 影響：全站深色，但頂欄白色 → 刺眼
- 修法：`<meta name="theme-color" content="#0a0e14">`（用站點實際背景色）
- 範圍：全站

### P3. 無 `prefers-reduced-motion`（4 檔）🟡
- 缺的檔：backtest.html / about.html / ea.html / tools.html
- 其他頁已有（如 MakeTradesJourney.html 有 `const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches`）
- 影響：動暈用戶無法關閉這些頁的動畫/粒子
- 修法：參考主頁的 RM 變數模式，加到這 4 檔（或統一抽成共用）
- 注意：請先確認這 4 檔現在有哪些動畫（particles/星場/揭示），對應地 disable

### P4. `outline:none` 無 focus 替代（4 檔）🟡
- 問題：部分元素 `outline: none` 但沒有提供替代 focus 樣式
- 影響：鍵盤 Tab 導航時看不到焦點框（無障礙問題）
- 修法：加 `:focus-visible` 樣式替代
- 範圍：4 檔（哪 4 檔請 grep `outline:\s*none` 找）

### P5. div 做互動元素（7 處）⚠️ 次要
- 問題：課程卡/工具卡用 `<div onClick>`（不是 `<button>`/`<a>`）
- 影響：鍵盤無法啟動、Cmd/Ctrl+click 無效、語音導航不識別
- 修法：改成 `<a>` 或 `<button>`，或至少加 `role="button"` + `tabindex="0"` + keydown 處理
- 位置：courses.html（課程卡）、tools.html（工具卡）等 7 處
- 注意：這是常見卡片模式，改結構風險中等——**請你判斷是否值得現在改**（可列 backlog）

## 3. 誤判排除（不用修）

- 語言切換按鈕 EN/中：有文字，非 icon-only ✅
- base64 logo 無 width/height：內嵌圖，無 CLS 影響 ✅

## 4. 驗收標準

1. 全站 `<html>` 有 `color-scheme: dark`（或 :root）
2. 全站有 `<meta name="theme-color">`（值 = 實際背景色）
3. backtest/about/ea/tools 有 prefers-reduced-motion 處理
4. 4 檔 outline:none 有 :focus-visible 替代
5. 手機瀏覽器頂欄顏色 = 站點背景色
6. 不影響現有視覺（金/紫主題、粒子、星場）

## 5. 相關檔案

- MTJ-Hub/MakeTradesJourney.html（參考：RM 變數模式、背景色值）
- MTJ-Hub/{backtest,about,ea,tools}.html（P3/P4）
- 全站 32 檔（P1/P2）
