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

---

# 執行記錄與設計裁決（Claude，2026-08-08）

主設計 = Claude；Hermes 為助手。以下為本輪實際執行狀況與兩處與原 spec 不同的裁決。

## 已完成

| # | 項目 | 狀態 |
|---|------|------|
| 2 | codex-grid-background | ✅ 全站 26 頁移除 `.bg-grid` 規則與元素，保留 glow + particles + logo 浮水印 |
| 3 | gradient-text | ✅ `.hero h1` 與 `.divider h2` 改 solid `--gold-bright`，連帶移除 60px text-shadow |
| 4 | layout-transition | ✅ Trade_Journal 進度條改 `transform:scaleX()` |
| 5.5 | 語言切換 | ✅ 見下方「語言引擎 v2」 |
| 6 | scroll cue | ✅ `.scroll-hint` CSS + 元素 + `@keyframes wheel` 全數移除 |
| 7 | 編號 eyebrow | ✅ 主頁 pillar `01 / STRUCTURE` → `STRUCTURE`；課程頁 `PART 01` 保留 |
| 8 | hero 超載 | ✅ 砍至 logo + h1 + 中文 + 一段文字 + 一個 CTA；stats 移出成獨立 strip；eyebrow 刪除 |
| 10 | 🔒 emoji | ✅ 改純文字 `LOCKED · PASS MODULE N EXAM TO UNLOCK` |
| 11 | 過時文案 | ✅ 「Nine modules」→「Twenty-one modules」 |

## 裁決一：dark-glow 不全砍（與 spec #1 不同）

實際掃描後，帶 zero-offset 彩色 glow 的選擇器只有這幾類：

- `.dot` — 即時狀態指示（呼吸燈）
- `#progress` — 閱讀進度條
- `.secnav a.active .pt` — 當前區塊高亮
- `.btn:hover` / `.btn.gold:hover` — CTA 互動回饋
- `.head img` / `.logo-hero` — 品牌 logo

**這些是狀態語意與品牌識別，不是裝飾**。全部移除會讓即時指示、進度、導航高亮、按鈕回饋一起消失，是功能倒退而非 polish。

**已執行**：只移除純裝飾的 `.points li::before` 光暈。狀態類與品牌類保留。

> 給 Hermes：detector 的 dark-glow 計數不要當作必須歸零的指標。判準是「這個光暈有沒有傳達狀態或品牌」，有就留。

## 裁決二：em-dash 不歸零（與 spec #5 不同）

`——` 是**中文標準標點（破折號）**，不是 AI cadence tell。`grep -c '—' = 0` 這條驗收會把中文標點一起清掉，讀起來會壞。

**已執行**：只替換「ASCII 字元包夾」的 ` — `（純英文語境）→ ` - `。保留：
- 中文 `——`
- 中英混排句中的分隔破折號（例：`黄金口袋 — the high-probability entry`），機械替換會更難看

驗收改為：`grep -oE '[A-Za-z0-9] — [A-Za-z0-9]' <file> | wc -l` = 0

## 語言引擎 v2（spec 5.5 的方案）

採方案 (b) 的改良版：**載入時自動包裹，不需要人工標記 24 頁**。

- 掃描所有 `.zh`，把同層的英文兄弟節點包進 `<span class="en">`
- 只包**文字節點**與**無 class 的行內/標題元素**；數字、圖表標籤、`.idx`/`.tier`/`.n` 等帶 class 區塊不受影響
- CSS：`body.lang-en .zh{display:none}` + `body.lang-zh.lang-strict .en{display:none}`
- 全站 26 頁共用同一份引擎；語言跨頁持久（key 沿用 `mtj_lang`）；新訪客預設中文

### ⚠️ 互斥顯示（lang-strict）目前關閉，需要 Hermes 做內容標記

實測：**大量文案把中英文混在同一個文字節點裡**，沒有 `.zh` 標記，任何選擇器都切不開。例如：

```html
<div class="note">// How to read every chart 每张图怎么看： the gold lines are ...</div>
<figcaption>Fibonacci retracement levels 回撤比率 · 0 → 100%</figcaption>
```

單 Fibonacci 一頁就有 53 處英文、16 處中文屬於這類。現在開啟互斥，中文模式會變成「中文 + 零碎英文殘渣」，**比雙語並陳更差**，所以先關著。

**Hermes 的工作（純機械，適合批量）**：把上述混排段落改成標準結構

```html
<!-- 改前 -->
<div class="note">// How to read every chart 每张图怎么看： the gold lines are the Fibonacci levels</div>

<!-- 改後 -->
<div class="note">// How to read every chart: the gold lines are the Fibonacci levels<span class="zh">// 每张图怎么看：金色线是斐波那契回撤位</span></div>
```

規則：
1. 一個元素內，英文寫在前（裸文字即可，引擎會自動包 `.en`），中文整段放進 `<span class="zh">`
2. **不要**把中英文混在同一個句子裡
3. 優先處理：`.note`、`figcaption`、`.chips span`、`.tags span`、`.hint`
4. **不要動**：SVG 內的 `<text>`（圖表標籤，語言中性，兩種模式都該顯示）

**完成後**：把各頁語言引擎裡的 `var STRICT = false` 改成 `true`，互斥即生效。

**驗收腳本**：
```bash
# 混排殘留（同一元素內中英夾雜且無 .zh 包裹）
grep -oE '<(div|p|figcaption)[^>]*>[^<]*[A-Za-z]{3,}[^<]*[一-鿿]{2,}[^<]*<' <file> | wc -l   # 目標 0
```

## 其餘項目

- **#9 middle-dot**：暫緩。`·` 在中英並列標籤（`About · 关于`）是有效分隔符，密度未到干擾程度；等互斥顯示上線後這些標籤會各自單語，屆時再評估
- **#12 課程卡同構**：依 spec 不動
- **#13 FOMC 靜態數據**：FOMC Analyzer 已整頁重寫，報告改原生渲染並標注日期；主頁卡片待下一輪
- **課程分組**：順手修正。模組 13–21（趨勢線/供需區/指標）原本全掛在「Execution & Risk」下，已重整為 7 組，模組編號不變（測驗解鎖鏈依賴編號）

## 順手修掉的線上 bug（不在原 spec 內）

**XRs Strategy Composer 的 COMING SOON 遮罩，返回按鈕是隱形的。**

遮罩用了 `var(--gold)` 與 `var(--muted)`，但這兩個變數**在 Composer 這個檔案裡從未定義**（它的調色盤是 `--kengold` / `--dim`）。結果：

- 「← Back to Hub」按鈕 `background:var(--gold)` 解析失敗 → 透明，看不見
- 標題與說明文字也拿不到顏色

線上訪客點進 Composer 會撞到一面 COMING SOON 牆，**而且找不到出口**。

已改用實際色碼 `#E8B44A` / `#9A9384`。順帶把 🔒 emoji 換成 inline SVG 鎖圖示（spec #10）。

Position Calculator 的同款遮罩沒有這個問題（該檔有定義 `--gold`）。

> 給 Hermes：跨檔案複製 UI 區塊時，記得確認用到的 CSS 變數在目標檔案裡有定義。
> 這幾個工具檔的調色盤變數名稱並不一致（`--gold` vs `--kengold`）。

## 商業模式定調（2026-08-08 用戶確認）

**所有工具最終都是付費會員權益，沒有免費層。**

原文案「解鎖後免費使用 / unlocks with your free account」與商業模式衝突，已全站移除。

| 工具 | 類別標籤 | 目前狀態 |
|---|---|---|
| Trade Journal | `Review Tool · 复盘工具` | OPEN FOR NOW 暫時開放 |
| FOMC Analyzer | `Macro Tool · 宏观工具` | OPEN FOR NOW 暫時開放 |
| Position Size Calculator | `Risk Tool · 风控工具` | MEMBERS ONLY 會員專屬 |
| XRs Strategy Composer | `Strategy Lab · 策略实验室` | MEMBERS ONLY 會員專屬 |

- 遮罩標題 `COMING SOON` → `MEMBERS ONLY`
- 遮罩內文改為「是 Make Trades Journey 的會員工具，訂閱後開放使用」
- 主頁工具卡加上取用狀態 pill（`.acc-open` 綠 / `.acc-mem` 金）
- 工具區開頭加一句：實驗室屬於會員權益，會員系統建置期間兩個工具暫時開放

> 給 Hermes：之後新增工具一律預設 `MEMBERS ONLY`，文案不要出現 free / 免費。

## 結構修正：FOMC Analyzer 原本被巢狀在 Trade Journal 卡片裡

主頁工具區原本只有 3 張 `.tool` 卡，FOMC Analyzer 的整個 `.tool-card` 區塊被塞在
**Trade Journal 的 `.tool-body` 內部**（夾在日誌描述與 `.tool-feats` 之間），
所以 FOMC 沒有自己的類別、自己的側欄，視覺上像是日誌的附屬功能。

已抽出成獨立 `.tool` 卡，四個工具各有各的類別標籤與側欄警語。

> 給 Hermes：新工具請複製既有 `.tool` 卡的完整結構（tool-body + tool-side），
> 不要插進別張卡的 body 裡。
