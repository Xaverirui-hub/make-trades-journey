# Composer 雙版本規範 — PSC vs DSC

> 2026-08-09 定案。同一策略拼陣台引擎，兩個版本服務不同對象。

## 版本定義

| | **PSC (Public SC)** | **DSC (Daikenja SC)** |
|---|---|---|
| **對象** | MTJ 大眾用戶 | Daikenja 內部（自家 EA 開發） |
| **位置** | `/tmp/mtj/MTJ-Hub/tools/XRs_Strategy_Composer_v2.4.html`（線上） | `~/Composer/XRs_Strategy_Composer_v2.6.html`（本地） |
| **本質** | 賣工具 | 內部生產工具 |

## 差異表（鐵律）

| 特性 | PSC | DSC |
|---|---|---|
| Daikenja 依賴 | ❌ 零依賴（編譯 standalone） | ✅ 含 DaikenjaLog 橋接（開倉/權益記錄） |
| EA 品質門檻 | ❌ 無（任何策略匯出） | ✅ 過閘：score≥60 / OOS PF≥1.15 / VAL PF / OOS≥30 |
| 馬丁/反馬丁 | ✅ 支持匯出 | ❌ 拒絕生成（破產風險紅線） |
| 倉位上限 | ❌ 無（不干預用戶） | ✅ 保證金上限保護（內部風控） |
| 合成數據 | ⚠️ confirm 警示後可匯出 | ❌ block（必須真實數據） |
| 生成 EA 頭註 | 「工具只生成不評判」 | 「過閘:score/PF」+ Fable 回報 |
| 日誌庫 | 無 | DaikenjaLog.mqh |

## 維護規則

1. **改 PSC 不碰 DSC，改 DSC 不碰 PSC**——兩邊是獨立檔案，不要同步合併
2. PSC 的任何改動（賣點文案/UI/navbar）可隨時做，不影響內部
3. DSC 是內部生產工具——品質門檻/馬丁紅線/Daikenja 橋接**永遠保留**（那是大賢者自家 EA 的驗收標準）
4. 新功能先在 DSC 驗證（內部測試），穩定後可考慮移植到 PSC（去掉門檻/依賴）
5. PSC 生成的 EA 若有 Daikenja 字樣 = **bug**（違反零依賴鐵律）

## 為什麼要區分

- **PSC**：大眾工具不能綁內部庫（用戶編譯失敗 = 災難），不能設品質門檻（賣工具不當裁判）
- **DSC**：大賢者自家 EA 必須嚴格驗收（PF/score/馬丁紅線），Daikenja 日誌是自家 pipeline 的一部分

## 驗證命令

```bash
# PSC 零依賴檢查（應輸出 0）
grep -c "Daikenja\|g_db\|EnableDaikenjaLog" MTJ-Hub/tools/XRs_Strategy_Composer_v2.4.html

# DSC 含門檻檢查（應輸出 >0）
grep -c "Daikenja\|EA_GATE\|過閘" ~/Composer/XRs_Strategy_Composer_v2.6.html
```
