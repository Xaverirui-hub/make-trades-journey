# GitHub Pages → Cloudflare Pages 搬迁 SOP

建立 2026-11-02

## 谁做哪一段

| 段 | 做什麽 | 谁做 | 多久 |
|---|---|---|---|
| **A** | 注册 Cloudflare、连 GitHub、建 Pages 专案 | **你** | 约 15 分 |
| **B** | 照清单验收新站 | **你** | 约 5 分 |
| — | **B 全打勾 → 跟我说一声** | | |
| **C** | 关 GitHub Pages、repo 转私有、清旧档 | **我** | 约 5 分 |

**交接点就是 B 做完。** A 和 B 全是在浏览器里点 ——
注册帐号、授权、按按钮这些我不能替你做。
C 全是指令,我来跑,而且动手前会再问你一次。

中间卡住随时喊停,不用硬着头皮做完 A。

---

## 0. 开工前先知道三件事

**① 这次搬的不是主机,是地基。**
GitHub Pages 免费版只能接公开 repo,这就是为什么 28 门课的完整内容一直
挂在公网上。Cloudflare Pages 可以接**私有** repo —— 而且它有 Access /
Workers / Functions,做得出真正的付费墙。GitHub Pages 什么都没有。

**② 转私有收不回已经公开过的东西。**
这个 repo 从 2026-09 起就是公开的。任何人都可能已经 clone 或 fork,
搜索引擎也可能收录了。转私有只挡住以後的人。
`xrs2026` 这把管理员钥匙写死在 20 多个档案里 —— **当作已经洩露,
Phase 2 不要沿用**。

**③ Cloudflare Pages 同样是公开静态托管。**
搬过去之後,知道网址的人照样能直接打开任何一个课程档案。
「锁住的课程其实还在原始码里」这个问题,搬家本身不解决。那是 Phase 2 的事。

### 顺带修掉的一个洞

GitHub Pages 服务的是**仓库根目录**,所以现在线上公开的不只是网站:

| 路径 | 现在的状态 |
|---|---|
| `specs/PHASE2_AUTH_SPEC.md` | 200 公开 |
| `specs/ARCHITECTURE_AUDIT_2026-08-17.md` | 200 公开 |
| `scripts/inject_admin.py` | 200 公开 |
| `.claude/devserver.mjs` | 200 公开 |

那份架构审计写着网站有哪些弱点、锁是假的、管理员钥匙是什麽。
**步骤 A3 把输出目录设成 `MTJ-Hub`,这些目录就根本不会被部署。**

---

## 步骤 A — 在 Cloudflare 建站(你做,约 15 分钟)

### A1 · 注册 Cloudflare 帐号

1. 开 **https://dash.cloudflare.com/sign-up**
2. 填 Email + 密码 → Sign Up
   建议用你平常在收的信箱。这个帐号以後会管网域、付费墙、可能还有金流,
   不要用临时信箱。
3. 去信箱收验证信,点里面的连结。**没验证的话建不了 Pages 专案。**
4. 回到 dashboard。

**方案选免费的就够。** Pages 免费方案:流量不限、请求不限,每月 500 次建置。
这个站一个月建置不到 20 次。不要买 Pro($20/月),那是给网站流量分析和
进阶安全用的,你现在用不到。

> **⚠ 注册完会有一个坑**
> Cloudflare 会引导你「Add a site / 新增网站」,要你输入一个网域,
> 甚至推荐你买一个。
> **跳过它。** 你现在没有自己的网域,也还不需要 —— Pages 会免费给你
> 一个 `xxx.pages.dev`。看到要你填网域的画面就直接关掉 / 按跳过,
> 从左侧选单走 A2。
> (买网域是以後的事,见文末「之後」。)

### A2 · 连接 GitHub

1. 左侧选单 → **Workers & Pages**
2. **Create application** → **Pages** 分页 → **Connect to Git**
3. 选 **GitHub** → 授权

> 这一步会跳到 GitHub 的授权页。
> **Repository access 选 `Only select repositories`,只勾
> `make-trades-journey`。**
> 不要给 All repositories —— 你另外七个私有 repo(EA 源码在内)
> 没必要让 Cloudflare 看到。
> 之後要加 repo 随时能回 GitHub 设定里改。

4. 按 **Install & Authorize**
5. 清单里选 `Xaverirui-hub/make-trades-journey` → **Begin setup**

### A3 · 建置设定 ← 整个 SOP 最重要的一格

画面标题是 **Set up builds and deployments**。

| 栏位 | 填什麽 | 为什麽 |
|---|---|---|
| Project name | `mtj-hub` | 决定网址 `mtj-hub.pages.dev`,之後不好改 |
| Production branch | `main` | |
| Framework preset | **None** | 没有建置步骤,这是纯静态站 |
| Build command | **留空** | 填了会失败 |
| **Build output directory** | **`MTJ-Hub`** | **← 不是 `/`** |
| Root directory (advanced) | 不用动 | 预设就是仓库根目录 |
| Environment variables | 不用填 | 没有建置步骤,没东西可传 |

**输出目录必须是 `MTJ-Hub`,不能是 `/`。** 两个理由:

1. 填 `/` 的话 `specs/` 和 `scripts/` 会一起上线 —— 就是上面那个洞。
2. 填 `MTJ-Hub` 的话网站直接在网域根目录,网址是
   `mtj-hub.pages.dev/courses.html`,乾乾净净。
   填 `/` 会变成 `mtj-hub.pages.dev/MTJ-Hub/courses.html`,难看而且多一层。

`_headers` 已经放在 `MTJ-Hub/` 里了,输出目录设对它才会生效(见 B4)。

按 **Save and Deploy**,等 1-2 分钟。

---

## 步骤 B — 验收(你做,约 5 分钟)

拿到 `https://mtj-hub.pages.dev` 之後,**逐项确认**。
任何一项不过都先别往下走,直接告诉我。

- [ ] **B1 首页**
      开 `mtj-hub.pages.dev`,会自动跳到 MakeTradesJourney.html,星空背景有动。

- [ ] **B2 课程页**
      `/courses.html` —— 20 张卡都在,卡片下面的 topic 色块有闪烁,
      六条阶段进度条都在。

- [ ] **B3 中英切换**
      右上角按「中」,整页变中文、没有中英混在一起的句子。

- [ ] **B4 `_headers` 有生效** ← 别跳过这项
      按 F12 → Network → 点第一个 document → Response Headers,
      要看到 `content-security-policy`。
      **看不到的话就是 A3 的输出目录填错了**,回去改成 `MTJ-Hub`。

- [ ] **B5 主控台乾净**
      F12 → Console,不该有红色错误。
      特别留意写着 `Content Security Policy` 的 ——
      那代表 CSP 挡到了不该挡的东西,马上告诉我,我来调。

- [ ] **B6 内部文件已经挡住** ← 这是这次搬家真正修掉的洞
      开 `mtj-hub.pages.dev/specs/PHASE2_AUTH_SPEC.md`
      **应该是 404。是 200 的话输出目录就是填错了。**

- [ ] **B7 工具页**
      `/tools/Compound_Calculator.html` 能算、
      `/tools/Trade_Journal.html` 能开。

- [ ] **B8 手机**
      用手机开一次首页和课程页,版面没有跑掉、不会左右横向捲动。

---

## 步骤 C — 收尾(跟我说一声,我来做)

B 全部打勾之後跟我说。我会**先再问你一次**才动手,这两步都是对外的:

1. **关掉 GitHub Pages**
   `gh api -X DELETE repos/Xaverirui-hub/make-trades-journey/pages`
   旧网址 `xaverirui-hub.github.io/make-trades-journey/` 会失效。

2. **Repo 转私有**
   `gh repo edit Xaverirui-hub/make-trades-journey --visibility private`
   Cloudflare 已经授权过,转私有之後**照常自动部署**,不用重接。

3. 顺手:把 `.nojekyll` 和根目录那个 `index.html` 跳转页清掉 ——
   两个都是 GitHub Pages 专用的,搬完就没用了。

**顺序不能反。** 先接通 Cloudflare、确认能开,再关 GitHub Pages。
反过来中间会断线。

---

## 常见坑

| 症状 | 原因 | 怎麽修 |
|---|---|---|
| 整页没有样式、一片白 | 输出目录填了 `/` | A3 改成 `MTJ-Hub`,重新部署 |
| `/specs/...` 还是 200 | 同上 | 同上 |
| 看不到 CSP 标头 | 同上(`_headers` 不在输出目录里) | 同上 |
| 主控台一堆 CSP 错误 | CSP 挡到了不该挡的 | 告诉我,我调 `MTJ-Hub/_headers` |
| 建置失败 | Build command 不是空的 | 清空它 |
| 改了程式码线上没变 | Cloudflare 还在建置 | 等 1-2 分钟;Deployments 分页看进度 |

---

## 之後(这次不做)

- **自订网域** —— 想好要不要买 `maketradesjourney.com` 之类的。
  Cloudflare 接自己的网域很简单,但网域名称一旦印出去就不好换,
  等商业模式(订阅还是买断)定了再说。
- **Cloudflare Access / Functions** —— 真正的付费墙,Phase 2。
  这次搬家的全部意义就是为了让这件事变成可能。
