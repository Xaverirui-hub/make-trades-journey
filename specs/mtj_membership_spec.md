# MTJ 會員系統 Spec（統合版）

**日期**：2026-08-09
**狀態**：方案待定稿（Claude 主設計 + Hermes 量產）
**來源整合**：`HANDOFF_TO_HERMES.md` §4 商業模式 + `HERMES_REPLY_2026-08-08.md`（Claude 裁決回覆）+ 用戶 08-09 需求（進度雲端同步）

---

## 0. 封面裁決（用戶 08-09）

**封面不改了，維持原版。**

- earth video / MotionSites / Serene 等探索全部放棄（sample 已留在 `~/.hermes/cache/`，正式版 `MakeTradesJourney.html` 未動）
- 原版深金設計維持：logo 大圖 + Make Trades Journey + 交易之旅 + CTA + 紅青 candle ticker + particles
- **不要**再對封面提出 redesign（已 3 次探索全部不採用，見 mtj profile memory）

---

## 1. 商業模式定調（Claude 已裁決 + 用戶確認）

**所有工具最終都是付費會員權益，沒有免費層。**

| 工具 | 類別標籤 | 狀態 |
|---|---|---|
| Trade Journal | `Review Tool · 复盘工具` | OPEN FOR NOW 暫時開放 |
| FOMC Analyzer | `Macro Tool · 宏观工具` | OPEN FOR NOW 暫時開放 |
| Position Size Calculator | `Risk Tool · 风控工具` | MEMBERS ONLY 會員專屬 |
| XRs Strategy Composer | `Strategy Lab · 策略实验室` | MEMBERS ONLY 會員專屬 |

### 已執行的約定（Claude commit `258df8c`）
- 遮罩 `COMING SOON` → `MEMBERS ONLY`
- 主頁工具卡加狀態 pill：`.acc-open`（綠）/ `.acc-mem`（金）
- 之後新增工具一律預設 `MEMBERS ONLY`，文案不要出現 free / 免費

---

## 2. 會員系統需求（新）

### 2.1 進度雲端同步（用戶 08-09 明確要求）

**現況問題**：考核通過存 `localStorage`（`mtj_exam_pass_N`），是裝置本地的。用戶換瀏覽器、開無痕、清 cache、換裝置 → **全部重考**。

**需求**：帳號登入後，學習進度存伺服器，跨裝置/瀏覽器同步，不用重考。

**需要設計**：
| 項 | 說明 |
|---|---|
| 帳號系統 | 註冊/登入（email? OAuth? 最少摩擦方案待 Claude 定） |
| 進度同步 | `mtj_exam_pass_N` 雲端化：登入後拉取伺服器進度，本機+伺服器合併 |
| 離線降級 | 未登入 → 維持 localStorage 現行行為（訪客模式） |
| 同步衝突 | 多裝置同時學習的合併規則（最簡單：取 max 進度） |

### 2.2 技術債（Claude HANDOFF §7 已知，會員系統必須一起解決）

1. **前端鎖擋不住人**：`MEMBERS ONLY` 只是 CSS 遮罩，檔案本體完整下載；`?admin=xrs2026` 寫死在前端 View Source 就看得到。**開始收費時工具本體要放驗證身分後才拿得到的地方**（真實方案：Cloudflare Pages Functions / 私有 repo / 驗證後動態注入內容）
2. **`real_data_m1.js` 404**：Composer 載入 404 檔
3. **`real_data.js` 410KB 外部依賴**：Composer 非單檔可開
4. **首頁 FOMC 卡片硬編碼**（`3.50–3.75% HOLD · 第 5 次`）：加 `as of <日期>` 或讀最新報告

### 2.3 Gold Daily Digest（Claude 裁決：延後 + 會員限定）

**結論：值得做，但不是現在，必須是會員內容。**

- **Q1 每日更新 vs 教育定位**：有衝突，但日報正好補上訂閱制缺口（內容做完不動 → 一路退訂；每日日報 = 持續產出 = 最強留存資產）
- **Q2 層級**：**會員，只能是會員**。四個工具剛全定成會員制，日報公開自相矛盾
- **Q3 維護成本**：Hermes 21:00 已在生成，邊際成本只剩發布；前提是**自動化**，手動 push 會漏
- **⚠️ 監管風險（最關鍵）**：收費交易教育機構每天公開發「今日黃金看空 3 理由 / 看多 3 理由」→ 接近市場看法發布。會員內容封閉+有條款+免責，風險低得多

**建議順序**：
```
1. 會員系統做起來
2. 日報作為會員權益上線（自動化發布）
3. 公開只放「上週回顧」— 週更、回顧式、不做前瞻框架
```

**格式意見**：`🔻🟢` emoji 換掉（全站 emoji 已清，日報不能破功）→ 用 `--bull` / `--bear` 色塊或箭頭符號。

---

## 3. Part C 語言裁決（Claude 已裁決，Hermes 同意）

### 裁決①：品牌名不翻譯
- `Make Trades Journey`（238 次）/ `XRs Trading Lab`（77 次）/ `Once hope it possible` 保留原文
- 理由：logo JPEG 內建 `MakeTradesJourney` 手寫字，翻標題變「一圖兩名」盜版感
- `<title>` 格式：`Make Trades Journey · 交易基础`（品牌保留，後半跟語言）

### 裁決②：驗收從「零拉丁字母」改「零英文句子」
```js
// 中文模式：禁止「連續 3+ 英文單字」= 英文句子；術語（pip/setup/lot/spread/Buy Limit…）保留
const leaks = document.body.innerText.match(/\b[A-Za-z]+(\s+[A-Za-z]+){2,}\b/g) || [];
// 扣已知術語詞組後 = 0
```
- 術語是教學主張（「用市場說話的語言學術語」），白名單撐不住 40+ 且會增長

### 其餘同意
- 拆節點順序：nav → hero → 標題 → 正文 → 工具頁
- per-page 開 STRICT（拆完一檔開一檔），引擎共用一份不動，改引擎先跟 Claude 說

---

## 4. Part A 靈魂注入（Claude 裁決：分兩步）

**方向同意**：「Chart-to-Language」自洽（tagline 就是「把圖表變成讀得懂的語言」）。
- A3 卡片三層（鎖定灰階 / 已解鎖 / 已完成）✅
- A4 通過測驗後卡片點亮 ✅（補上完課機制缺口）

**分兩步**：
1. 靜態版：圖表 + 課程標記點（可 hover）
2. 動效第二輪

**不做**：earth video 背景（已被 revert，方向不符 + 14MB 壓垮載入）。

---

## 5. 分工規則（Claude HANDOFF §0）

| | |
|---|---|
| **Claude/Codex** | 主要設計師。設計方案、視覺裁決、法務文案拍板 |
| **Hermes** | 量產、批量套用、內容標記、機械性修正 |
| **對接** | 全部走 git，不用桌面檔案傳遞 |

### 三條硬規則
1. 動手前先 `git fetch origin`，確認沒有分歧再開始
2. 不要 force push，non-fast-forward 就停下來回報
3. `specs/` 是共用契約，標「方案定」的等方案，標「禁止改」的不要動

---

## 6. 禁止改（會弄壞東西）

| 項目 | 原因 |
|---|---|
| 模組編號 1–21 | 測驗解鎖鏈 `mtj_exam_pass_(N-1)`，改編號斷鏈 |
| EXAM JS 邏輯 | `renderExam` / `gradeExam` / 70% 門檻 / localStorage key |
| SVG 圖表函數 | 每課自繪圖表引擎（含 `data-r` 對應） |
| `?admin=xrs2026` 後門 | 商業閘門，刻意設計 |
| `MEMBERS ONLY` 遮罩 | 同上，不是失誤，不要「修」成可用連結 |
| `localStorage` key | `mtj_lang` / `mtj_exam_pass_N` / `mtj_journal_v1` / `mtj_checklist_v1` / `mtj_fomc_bias` |
| `.nojekyll` | GitHub Pages 需要 |
| 語言引擎 | 26 頁共用同一份，要改先說，不要各頁分開改 |

---

## 7. 待辦清單（依優先序）

- [ ] **P0 會員系統設計**（Claude/Codex 出方案：帳號、支付、進度同步架構）
- [ ] P1 Part C 內容標記（Hermes 量產，per-page 開 STRICT）
- [ ] P1 Part A 靜態版圖表（Hermes 出 sample，Claude/Codex 拍板）
- [ ] P2 技術債：前端鎖真驗證、real_data_m1.js 404、FOMC 卡片日期
- [ ] P3 Gold Digest 會員化（會員系統完成後）
- [ ] P3 首頁 FOMC 硬編碼數據

---

## 8. 驗收

- 會員登入後：跨裝置進度同步（手機考完 → 電腦已解鎖）
- 未登入：維持 localStorage 訪客模式
- Part C：中文模式無「連續 3+ 英文單字」句子（術語除外）
- 封面：原版不變
