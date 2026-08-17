# assets/vendor

第三方程式庫。這裡的檔案**不要手改** —— 要換版本就照下面重新產生。

## three-postprocessing.js

`hyperspeed.js`(首頁封面的公路特效)需要 three.js 和 postprocessing。
原本這兩個是從 `https://esm.sh/...` 即時抓的,大陸連不上 esm.sh,所以首頁
封面在大陸是靜的 —— 動態 import 外面包了 try/catch,失敗是無聲的,不會報錯,
只是沒有公路。改成自架就沒這問題。

- three **0.166.0**(MIT)
- postprocessing **6.36.0**(Zlib)

授權聲明保留在檔案結尾。

### 為什麼是打包不是兩個原檔

postprocessing 只出兩種 build:`postprocessing.min.js` 是 IIFE 全域版
(要 `window.THREE`,ESM 用不了),ESM 版 `index.js` 沒壓縮、617KB,而且裡面
78 處 `from "three"` 是裸模組名,瀏覽器直接載會解析失敗,得靠 import map 或
逐處改寫。打包一次把這些都解決掉,順便 tree-shaking。

打包後 804KB(gzip 239KB)。全部打成一包(連 hyperspeed.js 一起)可以再小
48KB(gzip),但那樣 hyperspeed.js 就變成產物、改完要重打包 —— 這個 repo
其他地方都沒有建置步驟,不值得為 48KB 加這個坑。所以只打包第三方,
`hyperspeed.js` 維持可以直接編輯的原始碼。

### 重新產生

```bash
mkdir -p /tmp/v && cd /tmp/v
npm pack three@0.166.0 postprocessing@6.36.0
mkdir -p node_modules
tar xzf three-0.166.0.tgz && mv package node_modules/three
tar xzf postprocessing-6.36.0.tgz && mv package node_modules/postprocessing

cat > vendor-entry.js <<'EOF'
export * as THREE from 'three';
export { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset } from 'postprocessing';
EOF

npx esbuild@0.23.1 vendor-entry.js --bundle --format=esm --minify \
  --outfile=three-postprocessing.js --legal-comments=eof
```

`vendor-entry.js` 匯出哪些東西,要跟 `hyperspeed.js` 的 import 對齊。
現在是 `THREE` 命名空間 + postprocessing 的 6 個符號。
