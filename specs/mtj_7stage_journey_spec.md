# MTJ 從零到專業——7 段旅程全程網站規劃 spec

**日期**：2026-08-11
**狀態**：規劃定稿（待分階段實施）
**目標**：讓學員從零到 professional，全程只用 MTJ 網站

---

## §0 核心敘事

> 「從第一根 K 線，到你的第一個 EA——整個過程，一個網站。」

**賣點**：不用買書、不用找 mentor、不用開一堆軟體。課程 + 考核 + 工具 + 記錄全在網站，Composer 把「想法 → EA」的最後一哩也包了。

**品牌敘事（2026-08-11 定稿）**：**BUILD YOUR OWN TRADING JOURNEY**——不只是「build your own trader」（重造一個交易者），而是「build your own journey」（親手打造你自己的交易旅程）。每個學員走過的不是同一條路，是**自己動手蓋出來的**一段旅程：課程是藍圖、工具是建材、考核是路標、Journal 是施工記錄、Composer 是頂層的自主建造。參考 codecrafters-io/build-your-own-x——「What I cannot create, I do not understand」(Feynman)：**你親手建造的，才真正屬於你。**

---

## §1 學習路徑——7 段旅程（對齊 courses.html 現有 7 stage）

| Stage | 分類 | 課 | 里程碑 |
|---|---|---|---|
| **1. 認識市場** | Foundations | M1-3 | 通過 M3 考核 |
| **2. 讀懂圖表** | Chart Craft | M4-7 | 通過 M7 考核 |
| **3. 看懂大局** | Market Context | M8-9 | 通過 M9 考核（數據 + FOMC）|
| **4. 風控與執行** | Execution & Risk | M10-12 | 通過 M12 考核 |
| **5. 進階結構** | Advanced Craft | M13-14 | 通過 M14 考核 |
| **6. 系統化** | System & Execution | M15-17 | 通過 M17 考核 + Journal 統計 |
| **7. 工具與自動化** | Indicators & Platform | M18-22 | 通過 M22 考核 + Composer 產出第一個策略 |

---

## §2 閉環設計（professional 的靈魂）

**現狀**：單向教學——學完就結束。
**目標**：每個 stage 都有輸出物，形成閉環：

```
學習 → 考核 → 實作（用工具）→ 記錄（Journal）→ 回饋（數據）→ 下一 stage
```

| Stage | 網站支撐 | 輸出物 |
|---|---|---|
| 1 | 課程 + 考核 | 通過 M3 |
| 2 | 課程 + 圖表練習 | 通過 M7 |
| 3 | 課程 + **FOMC Analyzer** | 通過 M9 + 看懂一次數據報告 |
| 4 | 課程 + **Position Calculator** | 通過 M12 + 完成一筆風控計算 |
| 5 | 課程 | 通過 M14 |
| 6 | 課程 + **Trade Journal**（含統計）| 通過 M17 + Journal 有 20+ 筆記錄 |
| 7 | 課程 + **Strategy Composer** | 通過 M22 + 拼出第一個策略並匯出 |

---

## §3 功能缺口（要做的事）

| 缺口 | 現況 | 方案 | 優先級 |
|---|---|---|---|
| **Journal 統計儀表板** | Trade Journal 只記錄 | 加 PF/勝率/DD/期望值/曲線 | 🔴 P0 |
| **Stage 完成徽章/證書** | 考核過就解鎖 | Stage 1-7 完成 → 徽章 + 可下載證書 | 🟡 P1 |
| **回測 SOP 頁** | 課程說要回測 | 靜態 SOP 頁（Composer 回測當工具）| 🟡 P1 |
| **進度雲端同步** | localStorage | 會員 spec 已規劃（跨裝置）| 🟡 P1 |
| **免費層轉換點** | 全工具會員制 | 免費 M1-3 → 卡 M4 解鎖 → 轉換 | 🟢 P2 |

---

## §4 會員制分層

| 層級 | 內容 | 定位 |
|---|---|---|
| **免費（公開）** | Stage 1（M1-3）+ 考核 | 引流——「從零開始」第一哩 |
| **會員（核心）** | Stage 2-7 + 全部工具 + Journal 統計 + 雲端同步 | 主產品 |
| **進階（加值）** | Composer 進階（匯出/多策略）+ 證書 | 變現第二層 |

**免費層意義**：學到 M3 卡住 → 最強轉換點（已投資時間）。

---

## §5 實施順序建議

1. **P0**：Journal 統計儀表板（Stage 6 閉環的關鍵）—— ✅ 已完成（2026-08-11 Coach 診斷引擎）
2. **P1**：Stage 徽章/證書（7 段旅程的成就感）
3. **P1**：雲端同步（會員 spec 落地）
4. **P2**：回測 SOP 頁 + 免費層優化
5. **P2**：Build-your-own 系列任務頁（§7）

---

## §7 Build-your-own-X 動手重造（2026-08-11 新增）

**靈感**：codecrafters-io/build-your-own-x（GitHub，30 分類 × 數百個「從零重造」教學）。
**理念**：Feynman ——「我無法創造的東西，我就還不懂」。每個 Stage 加「動手重造」任務，學員從零做出東西來驗證理解——**這是「Build Your Own Trading Journey」的執行層**。

### 7 個 Stage 的重造任務

| Stage | Build your own | 用什麼做 | 驗證 |
|---|---|---|---|
| 1 | **報價計算器**（pip 價值/點差成本）| 網站內建計算器（頁面 JS）| 算出正確答案 |
| 2 | **iFractals 指標** | MT5 自寫指標（課程帶）| 圖表顯示一致 |
| 3 | **FOMC 數據判讀器**（非農→利率方向）| 網站互動練習 | 方向判斷正確 |
| 4 | **倉位計算器**（風險 %→手數）| Position Calculator 從零重造 | 與工具結果一致 |
| 5 | **供需區畫法** | MT5 圖表手動標記 | 助教/自評 |
| 6 | **自己的交易日誌** | 網站模板（含 Coach 數據）| 記 20 筆 + 診斷 |
| 7 | **第一個 EA/策略** | Strategy Composer | 匯出 EA + 回測報告 |

### 呈現方式（參考 repo 結構）

```
BUILD YOUR OWN TRADER 頁（tools/ 或 courses/ 下）
├── Build your own pip calculator      → Stage 1
├── Build your own iFractals           → Stage 2
├── Build your own position sizer      → Stage 4
├── Build your own journal             → Stage 6
└── Build your own first EA            → Stage 7
每條：任務說明 + 對應課程 + 可用工具 + 驗收標準
```

### 價值

- **學習**：重造 = 最深理解（比看課更牢固）
- **產品**：「build your own trader」是獨特敘事——沒人這樣教交易
- **閉環**：每個 Stage 的輸出物變成「作品集」→ 完成 7 個 = 有實力的證明
- **差異化**：免費教育內容多的是，但「從零重造」的體系化是護城河

### 實施注意

- 任務要「網站內可完成」（不要求 MT5 安裝）——pip 計算器/倉位/日誌用網頁，iFractals/EA 才上 MT5
- 每個任務給「驗收標準」（結果可對照），像 repo 的教學品質把關
- 可開放社群提交自製任務（PR 模式）——未來內容自生長

---

## §6 待確認（用戶決策）

- [ ] Journal 統計儀表板：同意優先做？（P0）
- [ ] Stage 證書：要做嗎？還是先 focus 內容/功能？
- [ ] 免費層範圍：M1-3 OK？還是 M1-7 當誘餌？
