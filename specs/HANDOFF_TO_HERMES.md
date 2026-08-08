# HANDOFF → Hermes

**寄件人**：Claude（主設計）
**日期**：2026-08-08
**基準**：`d7741d4` → `258df8c`（3 個 commit，28 檔案，+5113 / −1528）

---

## 0. 分工與規則

| | |
|---|---|
| **Claude** | 主要設計師。設計方案、視覺裁決、法務相關文案由我拍板 |
| **Hermes** | 助手。量產、批量套用、內容標記、機械性修正 |
| **對接** | **全部走 git**，不再用桌面檔案傳遞 |

### 三條硬規則

1. **動手前先 `git fetch origin`，確認沒有分歧再開始。**
   我曾經拿使用者桌面的舊快照做合併，差點覆蓋掉你已推的 22 個 commit。之後任何人都先 fetch。

2. **不要 force push。** 遇到 non-fast-forward 就停下來回報，不要用 `--force` 解決。

3. **`specs/` 是共用契約。** 標註「方案 Claude 定」的部分等我出方案；標註「禁止改」的不要動。

---

## 1. 我改了什麼

### commit `c787db4` — FOMC 合規重寫 + 語言引擎 v2 + Module 21

**FOMC Analyzer 整頁重寫**（法務優先，這是全站唯一有法律曝險的地方）

| 問題 | 處理 |
|---|---|
| 輸出「建議方向：只做空 SELL / 只做多 BUY」 | 移除。改為描述投票結構的標籤 + 說明與歷史常態是否一致 |
| 整頁 **0 段免責聲明** | 補上 4 段（不預測、標籤非訊號、數字可能有誤、風險警示） |
| 報告用 2 張 1.2MB PNG 截圖 | 改原生 HTML/SVG 渲染，PNG 保留為下載連結 |
| 無浮水印、無語言切換、頁腳不一致 | 補齊，與課程頁同一套視覺 |

Strategy Composer 的 FOMC 連動同步改為「回測篩選條件，不是交易建議」。

**語言引擎 v2**（spec 5.5 的方案，見第 3 節）

**新增 Module 21《MT5 實操與交易成本》**
四種掛單位置、下單視窗逐欄、點差/佣金/隔夜費/滑點如何侵蝕期望值、Demo → 小額實盤 → 放大的過渡。三張自繪 SVG + 5 題測驗（key `mtj_exam_pass_21`）。
依使用者要求，**未收錄「選券商」與「Standard vs Raw/ECN」兩節**（他認為敏感）。

**其他**
- 首頁解鎖門檻 Module 1 → Modules 1–3
- 「Nine modules」→「Twenty-one modules」

### commit `5bff12e` — P0/P1 視覺修正 + 修掉 Composer 隱形返回按鈕

| spec # | 項目 | 處理 |
|---|---|---|
| 2 | codex-grid-background | 26 頁移除 `.bg-grid` 規則與元素，保留 glow / particles / 浮水印 |
| 3 | gradient-text | `.hero h1`、`.divider h2` 改 solid `--gold-bright`，連帶移除 60px text-shadow |
| 4 | layout-transition | Trade_Journal 進度條 `transition:width` → `transform:scaleX()` |
| 6 | scroll cue | `.scroll-hint` CSS + 元素 + `@keyframes wheel` 全數移除 |
| 7 | 編號 eyebrow | 首頁 pillar `01 / STRUCTURE` → `STRUCTURE`；課程頁 `PART 01` 保留 |
| 8 | hero 超載 | 砍到 logo + h1 + 中文 + 一段文字 + 一個 CTA；stats 移出成獨立 strip；eyebrow 刪除 |
| 10 | 🔒 emoji | 首頁改純文字 `LOCKED · PASS MODULE N`；Composer 改 inline SVG 鎖圖示 |
| 11 | 過時文案 | 已處理 |

**順手修正**：課程分組。模組 13–21（趨勢線 / 供需區 / 指標）原本全掛在「Execution & Risk」下，重整為 7 組。**模組編號沒有改**（測驗解鎖鏈依賴編號）。

### commit `258df8c` — 工具改為會員制 + FOMC Analyzer 獨立成卡

見第 4 節。

---

## 2. 我的兩處設計裁決（與原 spec 不同）

### 裁決一：dark-glow 不全砍

實際掃描後，帶 zero-offset 彩色 glow 的選擇器只有這幾類：

```
.dot                      即時狀態指示（呼吸燈）
#progress                 閱讀進度條
.secnav a.active .pt      當前區塊高亮
.btn:hover                CTA 互動回饋
.head img / .logo-hero    品牌 logo
```

**這些是狀態語意與品牌識別，不是裝飾。** 全砍會讓即時指示、進度、導航高亮、按鈕回饋一起消失，那是功能倒退而不是 polish。

**已執行**：只移除純裝飾的 `.points li::before` 光暈。

> **判準**：這個光暈有沒有傳達「狀態」或「品牌」？有就留。
> detector 的 dark-glow 計數**不要**當成必須歸零的指標。

### 裁決二：em-dash 不歸零

`——` 是**中文標準標點（破折號）**，不是 AI cadence tell。`grep -c '—' = 0` 這條驗收會把中文標點一起清掉，中文排版會壞。

**已執行**：只替換「ASCII 字元包夾」的 ` — `（純英文語境）→ ` - `。已達 0。

**保留**：
- 中文 `——`（全站 575 處）
- 中英混排句中的分隔破折號，例：`黄金口袋 — the high-probability entry`（機械替換會更難看）

**驗收改為**：
```bash
grep -oE '[A-Za-z0-9] — [A-Za-z0-9]' <file> | wc -l   # 目標 0
```

---

## 3. 語言引擎 v2 — 我的方案 + 你的工作

### 方案

採 spec 方案 (b) 的改良版：**載入時自動包裹，不需要人工標記 24 頁**。

```
掃描所有 .zh → 把同層的英文兄弟節點包進 <span class="en">
```

只包**文字節點**與**無 class 的行內/標題元素**（`B I EM STRONG SPAN A Q` / `H1-H6 P LI TD FIGCAPTION`）。
帶 class 的區塊（`.idx` `.tier` `.n` `.chips` 等）與 SVG 內的 `<text>` **不動** —— 數字和圖表標籤是語言中性的，兩種模式都該顯示。

CSS：
```css
body.lang-en .zh{display:none !important;}
body.lang-zh.lang-strict .en{display:none !important;}
```

全站 26 頁共用同一份引擎，語言跨頁持久（key 沿用 `mtj_lang`），新訪客預設中文。
`setLang()` 會連帶重新渲染測驗解析，讓答案說明跟著語言切換。

### ⚠️ 互斥顯示目前關閉（`var STRICT = false`）

實測結果：**大量文案把中英文混在同一個文字節點裡**，沒有 `.zh` 標記，任何選擇器都切不開。

```html
<div class="note">// How to read every chart 每张图怎么看： the gold lines are ...</div>
<figcaption>Fibonacci retracement levels 回撤比率 · 0 → 100%</figcaption>
```

單 Fibonacci 一頁就有 **53 處英文、16 處中文**屬於這類。

現在開啟互斥，中文模式會變成「中文 + 零碎英文殘渣」，**比目前的雙語並陳更差**，所以先關著。

### 你的工作：內容標記（純機械，適合批量）

把混排段落改成標準結構：

```html
<!-- 改前：中英混在同一個 text node，切不開 -->
<div class="note">// How to read every chart 每张图怎么看： the gold lines are the Fibonacci levels</div>

<!-- 改後：英文裸文字（引擎會自動包 .en），中文整段進 .zh -->
<div class="note">// How to read every chart: the gold lines are the Fibonacci levels<span class="zh">// 每张图怎么看：金色线是斐波那契回撤位</span></div>
```

**規則**
1. 一個元素內，英文寫在前（裸文字即可），中文整段放進 `<span class="zh">`
2. **不要**把中英文混在同一個句子裡
3. 優先處理：`.note`、`figcaption`、`.hint`、`.chips span`、`.tags span`
4. **不要動** SVG 內的 `<text>`

**驗收腳本**
```bash
# 同一元素內中英夾雜且無 .zh 包裹的殘留
grep -oE '<(div|p|figcaption)[^>]*>[^<]*[A-Za-z]{3,}[^<]*[一-鿿]{2,}[^<]*<' <file> | wc -l   # 目標 0
```

**完成後告訴我**，我把各頁引擎裡的 `var STRICT = false` 改成 `true`，互斥即生效。

---

## 4. 商業模式定調（使用者確認）

**所有工具最終都是付費會員權益，沒有免費層。**

原文案「解鎖後免費使用 / unlocks with your free account」與商業模式衝突（先承諾免費再收費，之後很難轉），已全站移除。

| 工具 | 類別標籤 | 狀態 |
|---|---|---|
| Trade Journal | `Review Tool · 复盘工具` | OPEN FOR NOW 暫時開放 |
| FOMC Analyzer | `Macro Tool · 宏观工具` | OPEN FOR NOW 暫時開放 |
| Position Size Calculator | `Risk Tool · 风控工具` | MEMBERS ONLY 會員專屬 |
| XRs Strategy Composer | `Strategy Lab · 策略实验室` | MEMBERS ONLY 會員專屬 |

- 遮罩標題 `COMING SOON` → `MEMBERS ONLY`
- 遮罩內文 → 「是 Make Trades Journey 的會員工具，訂閱後開放使用」
- 主頁工具卡加狀態 pill：`.acc-open`（綠）/ `.acc-mem`（金）
- 工具區開頭加一句：實驗室屬於會員權益，會員系統建置期間兩個工具暫時開放

> **約定**：之後新增工具一律預設 `MEMBERS ONLY`，文案**不要出現 free / 免費**。

### 結構修正：FOMC Analyzer 原本被巢狀在 Trade Journal 卡片裡

主頁工具區原本只有 3 張 `.tool` 卡。FOMC Analyzer 的整個 `.tool-card` 區塊被塞在
**Trade Journal 的 `.tool-body` 內部**（夾在日誌描述與 `.tool-feats` 之間），
所以它沒有自己的類別、沒有自己的側欄，視覺上像是日誌的附屬功能。

已抽出成獨立 `.tool` 卡。

> **約定**：新工具請複製既有 `.tool` 卡的完整結構（`tool-body` + `tool-side`），
> **不要插進別張卡的 body 裡**。

---

## 5. 我順手修掉的線上 bug

### Composer 的 COMING SOON 遮罩，返回按鈕是隱形的

遮罩用了 `var(--gold)` 與 `var(--muted)`，但這兩個變數**在 Composer 這個檔案裡從未定義**（它的調色盤是 `--kengold` / `--dim`）。結果：

- 「← Back to Hub」按鈕 `background:var(--gold)` 解析失敗 → 透明，看不見
- 標題與說明文字也拿不到顏色

**線上訪客點進 Composer 會撞到一面牆，而且找不到出口。**

已改用實際色碼 `#E8B44A` / `#9A9384`。Position Calculator 的同款遮罩沒這問題（該檔有定義 `--gold`）。

> **提醒**：跨檔案複製 UI 區塊時，確認用到的 CSS 變數在**目標檔案**裡有定義。
> 這幾個工具檔的調色盤變數名稱並不一致。

---

## 6. 禁止改（會弄壞東西）

| 項目 | 原因 |
|---|---|
| **模組編號 1–21** | 測驗解鎖鏈是 `mtj_exam_pass_(N-1)`，改編號會斷鏈 |
| **EXAM JS 邏輯** | `renderExam` / `gradeExam` / 70% 門檻 / localStorage key |
| **SVG 圖表函數** | 每課的自繪圖表引擎，包括 `data-r` 對應 |
| **`?admin=xrs2026` 後門** | 商業閘門，刻意設計 |
| **`MEMBERS ONLY` 遮罩** | 同上，不是失誤，不要「修」成可用連結 |
| **`localStorage` key** | `mtj_lang` / `mtj_exam_pass_N` / `mtj_journal_v1` / `mtj_checklist_v1` / `mtj_fomc_bias` |
| **`.nojekyll`** | GitHub Pages 需要 |
| **語言引擎** | 26 頁共用同一份，要改跟我說，不要各頁分開改 |

---

## 7. 已知技術債（不急，但要有數）

1. **前端鎖擋不住人。** `MEMBERS ONLY` 只是 CSS 遮罩，檔案本體完整下載到瀏覽器；`?admin=xrs2026` 寫死在前端，View Source 就看得到。真的開始收費時，工具本體要放在驗證身分後才拿得到的地方。

2. **`real_data_m1.js` 404。** Composer 載入 `<script src="real_data_m1.js">`，但目錄裡只有 `real_data.js`。註解說兩者擇一即可，但每次載入都會產生一個 404。

3. **`real_data.js` 410KB 是外部依賴。** Composer 不再是單檔可獨立開啟。課程頁與其他工具都還是自足的。

4. **首頁 FOMC 卡片數據硬編碼**（`3.50–3.75% HOLD · 第 5 次`）。spec #13，還沒處理。工具頁已改原生渲染並標注日期。

---

## 8. spec 剩下沒做的

| # | 項目 | 狀態 |
|---|------|------|
| 9 | middle-dot 濫用 | **暫緩**。`·` 在 `About · 关于` 這種中英並列標籤是有效分隔符；等互斥顯示上線後這些標籤各自單語，屆時再評估 |
| 12 | 課程卡同構 | 依 spec 不動（一致性是教育網站資產） |
| 13 | 首頁 FOMC 靜態數據 | 待處理，加 `as of <日期>` 或從最新報告讀取 |

---

## 9. 有問題找我

有疑慮的地方**不要猜**，特別是：

- **法務相關文案**（免責聲明、方向性措辭、監管敏感內容）—— 一律先問
- **視覺裁決**（要不要砍某個效果）—— 判準是「有沒有傳達狀態或品牌」
- **detector 報的數字** —— 不是所有 anti-pattern 都該歸零，先確認語意
