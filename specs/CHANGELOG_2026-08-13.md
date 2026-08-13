# CHANGELOG → Hermes

**寄件人**：Claude（主设计）
**日期**：2026-08-13
**基准**：`5152e21` → `f243fc6`（4 个 commit，34 文件，+4999 / −86）
**配套文件**：`specs/HERMES_ZH_TRANSLATION_BACKLOG.md`（你的下一个任务在那里）

---

## 摘要

| commit | 一句话 | 影响面 |
|---|---|---|
| `9bb4370` | 首页封面以下 + 关于页改用 Galaxy 星场 | 2 页 + 1 个新 asset |
| `c41bd3e` | **语言引擎 v4** — 不再藏没有中文可换的英文；中文从副标题升回正职 | **全站 31 页** |
| `760aec2` | 新增 EA 课程分页；课程改名交易课程；修掉一段吃掉 CSS 规则的残骸 | **全站 32 页** |
| `f243fc6` | 中文缺口清单 | 文档 |

**对你最重要的是 `c41bd3e`。它改了「什么时候该隐藏英文」这条根本规则。往下看第 2 节。**

---

## 1. `9bb4370` — Galaxy 星场

新文件 `MTJ-Hub/assets/galaxy.js`（约 9KB）。React Bits `<Galaxy />` 的原生 ESM 移植。

- **上游依赖 `ogl`，我把它整个去掉了。** ogl 在这里只提供 renderer / program / 三角形这些样板，整个效果就是一支全屏 fragment shader，所以直接对着 WebGL1 写了那层样板。运行时不抓 CDN，不受墙影响，从自己的 origin 出。
- 配色：原 shader 每颗星的色相来自随机基色，单靠 `hueShift` 只是转动整条彩虹，永远落不到单一品牌色。改成 `saturation` 压近 0（灰星）+ 新增 `uTint` 统一乘上 MTJ 金。`uTint` 是对原 shader 唯一的改动。
- 首页：hero 保留 Hyperspeed，`#about` 起到 footer 包一层 `.galaxy-zone`。canvas 用 **sticky + 视口高**，不是跟区块等高——每帧像素数不随页面变长。
- **`.galaxy-bg` 刻意不加 `overflow:hidden`**：加了它会变成滚动容器，里面的 sticky 子元素就不再跟随视口，效果直接废掉。淡出用 `mask-image` 做。
- 关于页没有 hero，星场直接 `fixed` 铺满整页。
- 降级：无 WebGL / `prefers-reduced-motion` 一律不挂载；只有真正画出第一帧才加 `.is-live` 淡入，失败不会留黑块。离屏与切后台暂停 raf。

> **遗留**：`hyperspeed.js` 还在从 `esm.sh` 抓 three.js，大陆读者可能拉不到。建议同样自托管，但先别动，等我确认。

---

## 2. `c41bd3e` — 语言引擎 v4 ⚠️ 规则变了

### 出了什么事

用户报了三件事：中文版有些标题从金色变白色、`GBP` 到中文版只剩一个 `P`、中文字太小。

查下去是同一个根，而且比三个症状严重得多：

| 页面 | 中文模式下的**空洞**（元素还在，内容没了） |
|---|---|
| Trading Basics | **49 处** |
| Risk Management | **136 处** |
| 全站 27 页 | 修复后 **全部 0** |

`GBP` 的例子最典型：原始码是 `<span class="c1">GB</span><span class="c2">P</span>`。`GB` 被判成英文藏起来，`P` 只有一个字母、短到分类器不认，于是只剩一个 `P`。同一条规则还清空了：8 大货币卡片的全部代码、8 个国家名、所有 tag 徽章、每一课的 hero 标题、每一个分隔屏标题。

### 根本原因

`.zh` 当年是写在英文**下面**的副标题——更小、更暗、有时干脆另开一个元素放。strict 模式让它变成唯一的一行之后，它还带着副标题的身份；而没有中文对照的英文被一并藏掉，直接留下空框。

### 新规则（记住这一条就够）

> **英文只有在同一个 host 真的带中文时才隐藏。没有译文的英文，留着显示。**

未翻译的英文再难看，也好过一个空框。

实现分三处：

| 机制 | 作用 |
|---|---|
| `hasZh(host)` | 引擎自动包装时：host 里没有 CJK 就不打 `.en` 标记 |
| `pairedEn(el)` | 手写的 `<span class="en">`：父元素里没有 `.zh` 就加 `.en-keep`。另特判分隔屏的跨元素配对（`<h2><span class="en">…</span></h2>` + 兄弟 `<div class="zh">`） |
| `SYMBOL` | 无空格全大写短词（`GBP` `EURUSD` `RSI` `M15`）永远两边都在。手写成 `.en` 的也一样，否则 RSI 课的分隔屏只剩「是 什 么」 |

CSS 侧新增 `body.lang-zh.lang-strict .en:not(.en-keep){display:none !important;}`。

### 中文升回正职

各页 `<style>` 末尾追加了一段 `===== Chinese is not a subtitle =====`：

- 标题里的 `.zh` 回到 `1em`（`h2.title .zh` 原本 `.54em`，48px 的标题一换语言就变 26px）
- 正文 `.zh` 加 6%（同样像素下汉字比拉丁字看着小）
- 分隔屏的 `<div class="zh">` 接过 h2 的排版
- `.h-zh` / `.zh-t` / `.quote-zh` 这类只装中文的壳，在英文模式整个收起，不再留 7px 空 margin

**这段 CSS 统一控制全站中文的字号与标题角色。不要逐页去调，会又散掉。**

### 验证方法也修了

之前只查「泄漏」（中文模式看到英文），没查「空洞」（元素还在但内容没了），所以上一轮那句「0 泄漏」是真的，却漏掉了这一整类。

现在两个方向都查，且**按元素是否仍被渲染**来判定——一个 `.en` span 自己被隐藏，那是切换机制在正常工作，不是空洞。把它算进去等于在量机制，不是量损伤。

脚本见 `HERMES_ZH_TRANSLATION_BACKLOG.md` 第 6 节。

---

## 3. `760aec2` — EA 分页 + 改名 + 一个既有 bug

### 新页 `MTJ-Hub/ea.html`

由 `courses.html` 生成，**只换 body**，所以设计系统、语言引擎、navbar 完全同源，不存在第二份要各自维护。要改公共部分时，改 `courses.html` 再重新生成即可。

内容不是课程大纲，只教两件事：怎么用 Strategy Composer 拼策略、怎么好好回测。**每一步都对应工具里真实存在的面板或 SOP 里真实存在的步骤**（PARAMETERS / ASSEMBLY 五个区 / TACTICAL DISPLAY / CORE DRIVE / STRESS TEST / ACCOUNT CURVE；回测 SOP 的 5 步）。原本 5 张「即将推出」的占位卡已全部拿掉——不写还没做出来的模块。

### 改名与导航

- `courses.html` → Trading Courses / 交易课程，模块数 22 → 21，学习路线第七阶段移除 22，EA 那组换成指向新页的入口
- Expert Advisor 课改标 `EA Course · Lesson 01`，返回键指向 `ea.html`。**`localStorage` 的 `mtj_exam_pass_22` 保持不动**，不动已有进度
- navbar 全站 32 页：`Courses` 拆成 `Trading` + `EA Courses`

> EN 标签用「EA Courses」而不是「EA」：光秃秃的 `EA` 会被 SYMBOL 规则当成代号留在中文模式里，那一项就会变成「EA · EA 课程」。**以后加导航项，英文标签避免用纯大写短词。**

### 顺手修的既有 bug（不是这次改出来的）

5 个页面里躺着一段孤儿 keyframes 尾巴：

```css
30%{opacity:1}100%{opacity:0;transform:translate(-50%,11px)}}
```

开头那行不知何时被删了，只剩尾巴。CSS 解析器把多出来的那个 `}` 算进去，**会连带吞掉紧接着的下一条规则**：

| 页面 | 被吞掉的规则 | 后果 |
|---|---|---|
| courses / ea / about / tools | `.divider{max-width;padding;text-align:center}` | 所有分隔屏一直贴着左边缘，没内距也没居中 |
| 首页 | `.galaxy-zone{position:relative}` | 星场铺到了 hero 后面 |

删掉那一行即全部恢复。首页星场现在实测边界 735 = 735，正好卡在 hero 结束处。

> **教训值得记**：改 CSS 时如果一条规则「明明写了却没生效」，先去看它**上一条**是不是语法坏了。别急着加 `!important`。

---

## 4. `f243fc6` — 中文缺口清单

`specs/HERMES_ZH_TRANSLATION_BACKLOG.md`。实测 **934 处 / 710 条唯一**，分 A/B/C 三类，附每页清单与验收脚本。

> 更正：我先前口头说的「整站 40–50 处」是 Trading Basics 单页的数字。以清单为准。

**这是你的下一个任务。** 优先级：先做 A 类那两段 JS（`LOCKED…` 20 处 + `QUESTION N/5` 100 处），一次掉 120 处。

---

## 5. 补翻译时唯一正确的写法

```html
<!-- 改前：中文模式显示 "Currency Codes" -->
<h3>Currency Codes</h3>

<!-- 改后：英文模式 Currency Codes，中文模式 货币代码 -->
<h3>Currency Codes<span class="zh">货币代码</span></h3>
```

**必须在同一个元素内。**放兄弟元素里不构成配对，英文不会隐藏，两个语言会同时显示。
唯一例外是分隔屏，引擎已特判，照抄现有写法。

补上中文后英文自动隐藏，**不需要动 CSS，不需要动 JS**。

---

## 6. 不要碰

- `assets/galaxy.js`、`assets/hyperspeed.js`
- 各页 `<style>` 末尾的 `===== Chinese is not a subtitle =====` 那段
- 语言引擎本体：`hasZh` / `pairedEn` / `SYMBOL` / `isNotation` / `isBrandMark`
- 任何 `localStorage` key（`mtj_exam_pass_*`、`mtj_lang`、`mtj_admin`、`mtj_journal_v1`、`mtj_checklist_v1`、`mtj_fomc_bias`）
- `tools/XRs_Strategy_Composer_v2.4.html` 的繁体用字（另案，我还没决定）
- Composer 的 `?admin=xrs2026` COMING SOON 门（刻意保留）

要改上面任何一项，先跟我说。

---

## 7. 硬规则（不变）

1. **动手前先 `git fetch origin`**，确认没有分歧再开始。任何情况下不 force push。
2. **一页一个 commit**，message 写清楚哪一页、改了什么、验收数字。
3. **一页做完验一页**，不要改十页再验。验收三个数字必须全为 0：

| 指标 | 必须 | 含义 |
|---|---|---|
| 空洞 | **0** | 元素被掏空 —— 最严重，永远不许出现 |
| 剩余英文 | 0 | 该页翻译完成 |
| 巢状语言标签 | **0** | `.zh` 里又包一层 `.zh`，会把句子拆成三行 |

**`空洞 > 0` 表示你把英文藏了但没给中文——比不翻还糟，必须立刻回退。**

---

## 8. 还没定的（等用户拍板，先别动）

- 课程节奏收紧的 CSS 要不要铺到其余 21 课（样板在 `Risk_Management`，已把该课从 20.3 屏压到 15.6 屏，一个字没删）
- 课程互动化要做到多深
- Composer 要不要在会员系统做好之前先放开
- `hyperspeed.js` 的 three.js 自托管
