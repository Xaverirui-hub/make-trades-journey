# 架构审计 — Phase 1 交付物

日期：2026-08-17
对应：`web_project_next_phase_plan.txt` PHASE 1 / Codex Task 1
方法：全仓静态审计 + 浏览器实测，所有数字都是查出来的，不是估的。

---

## 结论先行：这份计划有一个前提不成立

计划从 Phase 2 开始的写法，是「在现有网站上加认证」，并叮嘱「保留现有设计、不要重写无关页面」。

**但现在没有「应用」可以加东西。** 没有框架、没有后端、没有 API、没有数据库、没有建置步骤。是 34 个静态 HTML 文件挂在 GitHub Pages 上。

这不是说计划错了，而是 Phase 2 的工作量被这个措辞盖住了：不是「加一个登录页」，是**从零建一个服务端**，再决定这 34 个页面怎么跟它说话。

### 最要紧的一件事：课程内容现在是公开的

21 个课程页是可以直接抓的静态文件。考试门禁的全部实作是：

```js
localStorage.setItem("mtj_exam_pass_1", "1");   // 这就是「通过第 1 课」
```

- 解锁链读 `localStorage.mtj_exam_pass_N`，浏览器控制台一行就能全解锁
- **考题答案随页面一起下发**（`ans:1` 明文在 HTML 里）
- 管理员密钥 `xrs2026` 硬编码在 21 个文件里，`?admin=xrs2026` 即可激活

也就是说，**即使认证做得完美，只要页面还在 GitHub Pages 上，付费内容对所有人仍然是一个 URL 的距离。**

这决定了 Phase 2 的架构选择，而计划里没有提到这个岔路：

| 方案 | 含义 | 代价 |
|---|---|---|
| A. 页面继续静态托管，只把 API 放到 tunnel 后 | 认证能做，但内容挡不住 | 付费墙形同虚设 |
| B. 课程页改由应用服务器下发 | 真正能挡 | 34 个页面要接入服务端渲染或鉴权代理 |

**这是 Phase 2 动工前必须先定的事**，比选认证方案更靠前。

---

## 好消息：Phase 3 是全新地基，没有迁移包袱

现在**不存在**任何会员 / 订阅 / 权限概念。localStorage 里那 4 个键全是装饰性的本地状态：

| 键 | 用途 | 是否需要迁移 |
|---|---|---|
| `mtj_lang` | 中英切换 | 否，留在前端就好 |
| `mtj_exam_pass_N` | 课程解锁（21 个） | 否，要在服务端重做 |
| `mtj_admin` | 管理员视图 | 否，密钥已泄露，废弃 |
| `mtj_fomc_bias` | FOMC 工具的本地偏好 | 否 |

所以 Phase 3 的 users / subscriptions / entitlements 可以照计划里的模型直接建，不用考虑兼容旧数据。**学员进度目前也没有任何服务端记录，这意味着上线认证那天，所有人的进度会归零** —— 需要你决定是接受，还是做一次「首次登录时把本地进度上传」的一次性迁移。

---

## Phase 1 要求的七项交付

### 1. 架构摘要

```
GitHub Pages (public repo)
  └── index.html  ──redirect──▶  MTJ-Hub/MakeTradesJourney.html
                                   └── 34 个自包含 HTML
                                        · CSS 内联
                                        · JS 内联
                                        · logo / favicon 是 base64 data URI
                                        · 唯一共享的是 assets/*.js（特效）
```

- 框架：**无**。原生 HTML + CSS + vanilla JS
- 建置步骤：**无**（唯一例外见「依赖」一节的 vendor 打包）
- 规模：34 页，合计 11.3 MB，平均 342 KB/页
- 本地开发：`.claude/devserver.mjs`，静态服务器，根目录是 `MTJ-Hub`

### 2. 现有路由

不是路由，是文件路径。GitHub Pages 直接按路径映射。

**顶层（6）**
`MakeTradesJourney.html` 首页 · `courses.html` 交易课程 · `ea.html` EA 课程 · `tools.html` 工具 · `about.html` 关于 · `backtest.html`

**课程（22）** — `courses/*_MakeTradesJourney.html`
21 个交易模块（Trading_Basics … Platform_Costs）+ 1 个 `Expert_Advisor`（由 `ea.html` 链接，非孤儿）

**工具（5）** — `tools/`
`XRs_Strategy_Composer_v2.4.html` · `Position_Calculator.html` · `Trade_Journal.html` · `FOMC_Analyzer.html` · `fomc_reports/FOMC_2026_07_29_report.html`

**其余** `index.html`（根 + MTJ-Hub 各一，都是跳转）

### 3. 现有组件

没有组件系统。复用靠**复制**：导航栏、语言引擎、考试模块在 34 个页面里各存一份。

唯一真正共享的是 `assets/` 下的特效模块（ES module，动态 import）：

| 文件 | 用途 |
|---|---|
| `galaxy.js` `hyperspeed.js` | 首页 / about 背景 |
| `lightfall.js` `letterglitch.js` `gridscan.js` | 课程 / EA / 工具封面 |
| `particles.js` `moltenmetal.js` `gradientwaves.js` `slicedwaves.js` | 六个阶段的课程封面 |
| `vendor/three-postprocessing.js` | three 0.166 + postprocessing 6.36（自架，804 KB） |

**影响 Phase 2**：改一次导航栏 = 改 34 个文件。加登录状态、用户菜单、登出按钮都会撞上这一点。要么先抽出共享 header，要么接受每次都批量改。

### 4. 现有后端 / API

**没有。** 全仓唯一的 `fetch(` 出现在 vendored three.js 内部（它自己的资源加载器）。零 XHR、零 axios、零后端调用。

### 5. 现有数据库

**没有。** 全部状态在 `localStorage`，见上表。

### 6. 依赖

| 类型 | 内容 | 风险 |
|---|---|---|
| 自架 | `assets/vendor/three-postprocessing.js` | 无。2026-08-17 从 esm.sh 改为自架 |
| **外部 CDN** | **Google Fonts：62 处 `fonts.googleapis.com` + 31 处 `fonts.gstatic.com`** | **大陆全部被墙** |
| 包管理 | 无 `package.json` / `requirements.txt` | — |

### 7. 潜在冲突

**① Google Fonts 在大陆不可达（建议 Phase 2 之前处理）**

93 处引用，覆盖每一个页面。Sora / JetBrains Mono / Noto Sans SC 三套字体在大陆全部加载失败，页面会掉到系统默认字体。

这和刚修掉的 esm.sh 是同一类问题，但影响面大得多——那个只是首页一个特效，这个是**全站排版**。而且从墙外测试完全看不出来。目标读者是中文用户，这是上线前的硬伤。修法同 vendor：把字体文件下载进 `assets/fonts/`，改 `@font-face`。

**② 管理员密钥已泄露**

`xrs2026` 明文在 21 个文件里，仓库如果是公开的（GitHub Pages 通常意味着公开），这个密钥等同公开。它现在没保护什么值钱的东西，但**绝不能带进新系统**，Phase 2 的角色系统要另起。

**③ 仓库根目录有 165 个建置残留**

88 个 .js + 47 个 .py 一次性脚本、PNG 截图、`chrome_err.log`，全部在版本控制里。Phase 8 打 Docker image 时这些会一起进去。属于噪音 + 轻微信息泄露面，建议在 Dockerize 之前清一次或用 `.dockerignore` 挡掉。

**④ 页面自包含带来的重复体积**

每页内联同一份 base64 logo（约 62 KB）。34 页 ≈ 2 MB 纯重复。静态托管无所谓（CDN 缓存各页一次），但一旦改成服务端下发就值得抽出来。

**⑤ 计划里 Phase 5「数据库如果还没有就建」的措辞**

确认：没有。Phase 5 不是可选项，是 Phase 2 的前置。

---

## 需要你先决定的三件事

计划本身写了「不要让 Codex 自己选支付架构」。同样的道理，下面三件也该你定，定完再动工：

1. **付费墙要不要真的挡内容？**（上面的 A / B 方案）
   决定了 Phase 2 是「加一个 API」还是「把 34 个页面搬到服务端」，工作量差一个数量级。

2. **支付渠道 / 目标国家。**
   计划列了选型维度但没给答案。这个不定，Phase 4 无法开工。

3. **上线认证时，现有学员的本地进度怎么办？**
   归零，还是做一次性迁移。

---

## 建议的修订顺序

计划的 Task 1–11 大方向没问题，我只建议插两件事、调一处：

```
Task 0（新）  Google Fonts 自架          ← 独立、低风险、不碰架构，但影响每一页
Task 1        本审计                     ← 已完成
Task 1.5（新） 定 A/B 方案 + 支付渠道      ← 你的决定,不是实作
Task 2        抽出共享 header/nav         ← 从 Task 2 拆出来先做
Task 3        认证
...           后续照原计划
```

`Task 0` 和 `Task 2` 都不依赖任何架构决定，可以在你想支付渠道的同时并行推进。

---

## 本次审计没有覆盖的

诚实标注：

- **仓库是否公开** —— 本机没查（需要网络），按「可能公开」处理
- **Mac mini 现状** —— Phase 6–8 全部基于计划里的描述，我没有那台机器的访问权
- **Hermes 的凭证边界** —— 同上，没看过
- **实际流量 / 用户量** —— 无数据，VPS 迁移时机无法判断
