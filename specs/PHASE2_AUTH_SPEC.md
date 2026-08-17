# Phase 2 实作规格 — 认证与受保护页面

日期：2026-08-17
对应：`web_project_next_phase_plan.txt` PHASE 2 / PHASE 5 / Codex Task 2–3
前置：[架构审计](ARCHITECTURE_AUDIT_2026-08-17.md) · [Phase 3/4 决定](PHASE3_4_DECISIONS.md)

---

## 零、这一步会改变项目的性质

必须先讲清楚：**做完这一步，网站就不再是纯静态文件了。**

付费墙选了 B（课程页由服务器下发才挡得住），这个决定本身就已经要求有服务器。
所以下面不是「要不要加服务器」，而是「加什么」。

具体后果：

- GitHub Pages 不能再托管受保护的那一半（它只会发静态文件，不会验身份）
- 多出一个要跑、要监控、要备份的进程
- 部署从「push 到 git」变成「构建镜像 + 重启容器」

这些都在原计划的 Phase 6–8 里，只是提前说明白。

---

## 一、选型（我定，理由附上）

| 项目 | 选择 | 为什么 |
|---|---|---|
| 运行时 | **Node.js**（LTS） | 机器上已经有,也是全站现有脚本的语言。不引入第二种运行时 |
| Web 框架 | **Fastify** | 内建 schema 校验 —— 认证端点正是最该做入参校验的地方;结构化日志开箱即用 |
| 数据库 | **SQLite**（better-sqlite3） | 单文件。备份 = 复制一个文件;Mac mini 还要跑 MT4/MT5/EA/Hermes,少一个容器就是少一份风险 |
| 密码哈希 | **argon2id**（`argon2` 包） | 现行推荐。**绝不自己写加密** —— 计划里也这么要求 |
| 会话 | **服务端 session + httpOnly cookie** | 不用 JWT。理由见下 |
| 限流 | `@fastify/rate-limit` | 只挂在认证端点上 |

### 为什么是 session 不是 JWT

JWT 签发出去就收不回来 —— 用户点「登出」，令牌在过期前依然有效；改密码、封号同理。
课程站要能真正踢人下线，所以会话状态放服务端、cookie 只存一个不可猜的 id。
代价是每次请求查一次库；SQLite 查主键索引是微秒级，这个量级不用担心。

### 为什么是 SQLite 不是 Postgres

这是个课程站，不是交易撮合。写入集中在注册、登录、付款回调、进度更新，
每天几百次量级。SQLite 绰绰有余，而且**备份就是复制一个文件**，对一台
还在跑实盘 EA 的机器来说，这个简单性是有价值的。

数据访问全部收在一层里（见第四节），将来真要换 Postgres 只改那一层。

---

## 二、静态与受保护的分界

**一个源站，全部走 Cloudflare Tunnel。** 不做「静态放 Pages + API 走隧道」的
两源站方案 —— 那会带来跨域和 cookie 域名的一堆麻烦，而 Cloudflare 本来就会
帮我们缓存静态资源。

```
public/                     谁都能看,直接发
  MakeTradesJourney.html    首页
  courses.html  ea.html  tools.html  about.html   各索引页
  login.html
  assets/**                 字体 / 特效 / nav.js / vendor
  tools/Position_Calculator.html
  tools/Trade_Journal.html
  tools/FOMC_Analyzer.html

protected/                  服务器验过权限才发,不在静态目录里
  courses/*.html            21 门交易课 + EA 课
  tools/XRs_Strategy_Composer_v2.4.html
  backtest.html
```

受保护的页面**不需要改写**：它们是自包含的 HTML，服务器读文件流出去即可，
页面里的内联 JS 照常工作。

> 现在这些文件都在 `MTJ-Hub/` 下。目录拆分在部署时做，不改仓库结构 ——
> 本地预览仍然是一个静态目录，开发体验不变。

---

## 三、路由

```
GET   /                          → 首页
GET   /login.html                → 登录页(已完成)

POST  /api/auth/register         注册    限流 5 次 / 15 分钟 / IP
POST  /api/auth/login            登录    限流 10 次 / 15 分钟 / IP
POST  /api/auth/logout           登出
GET   /api/auth/me               当前用户 + 权限摘要
POST  /api/auth/verify/:token    邮箱验证
POST  /api/auth/reset/request    申请重置密码   限流 3 次 / 小时 / IP
POST  /api/auth/reset/:token     用 token 改密码

GET   /api/progress              读进度
PUT   /api/progress/:module      写进度(通过考试)
POST  /api/progress/import       一次性:把浏览器 localStorage 的旧进度并进来

GET   /courses/:slug             受保护 —— 验 entitlement 后发 HTML
GET   /tools/composer            受保护
```

### 未登录访问受保护页

**不是 404,也不是直接跳登录页。** 发一个「这一课需要登录 / 需要开通」的
页面，带上原地址，登录后跳回去。理由：直接 302 到登录页会让用户不知道
自己点的是什么，也不利于分享链接。

---

## 四、数据层的边界

所有 SQL 收在 `db/` 一层，路由只调函数、不写 SQL：

```
db/index.js        连接 + 迁移执行
db/migrations/     0001_init.sql, 0002_....sql  —— 只增不改
db/users.js        createUser / findByEmail / verifyEmail / setPassword
db/sessions.js     create / find / revoke / revokeAllForUser / gcExpired
db/entitlements.js grantFromOrder / listForUser / hasScope
db/progress.js     get / setPassed / importLegacy
db/payments.js     recordEvent(providerEventId 唯一) / hasProcessed
```

表结构照 [Phase 3/4 决定](PHASE3_4_DECISIONS.md) 第五节，不在这里重复。

**硬约束**

- 能不能看课，**只查 `entitlements`**。不查订阅状态、不查订单、绝不信前端
- `payment_events.provider_event_id` 唯一索引 —— 重复 webhook 靠它挡
- 迁移只增不改：改过的迁移在别人机器上不会重跑
- 密码字段永远不出现在日志、错误信息、API 响应里

---

## 五、安全底线（做不到就不上线）

- [ ] 密码 argon2id，绝不明文、绝不自研加密
- [ ] cookie：`httpOnly` + `Secure` + `SameSite=Lax`
- [ ] 会话可撤销；改密码时撤销该用户全部会话
- [ ] 认证端点限流
- [ ] 登录失败信息**不区分**「邮箱不存在」和「密码错误」——否则等于送人一个查号器
- [ ] 任何用户都不能读到别人的进度 / 权限（每个查询都带 user_id 条件）
- [ ] 密钥走环境变量，绝不进仓库、绝不进前端
- [ ] 邮箱验证前不发放任何付费权限

---

## 六、旧进度怎么办

现在 21 课的解锁状态全在浏览器 `localStorage.mtj_exam_pass_N` 里。

**首次登录时做一次性导入**：前端把本地已通过的模块号 POST 到
`/api/progress/import`，服务端取并集（本地有、服务端没有的记上），
之后以服务端为准，前端不再写 localStorage。

不归零 —— 已经学到一半的人不该因为上线登录而从头再来。

---

## 七、验收标准

Codex 或我做完之后，逐条过：

- [ ] 注册 → 收到验证邮件 → 验证 → 能登录
- [ ] 登录 → 刷新页面仍是登录态 → 登出 → 受保护页面进不去
- [ ] 会话过期后自动失效
- [ ] 改密码后，其它设备上的会话立刻失效
- [ ] 用户 A 拿不到用户 B 的任何数据（换 id 试)
- [ ] 未登录直接访问 `/courses/trading-basics` → 提示页,不是 404、不是裸跳转
- [ ] 无权限用户访问受保护页 → 挡住
- [ ] 认证端点被暴力尝试 → 限流生效
- [ ] 登录失败信息不泄露邮箱是否存在
- [ ] 旧 localStorage 进度能正确导入,且只导一次
- [ ] `grep -r` 构建产物与日志,搜不到密码 / 密钥

---

## 八、不在这一步做

划清楚，免得越做越大：

- 付款（Phase 4，且卡在 Stripe 开户）
- Docker / Cloudflare（Phase 6–7，先让应用在本机跑通）
- 邮件发送用什么服务 —— 先留接口，本地开发把邮件打到日志
- 用户头像、社交登录、双因素

---

## 九、下一步

1. 我先搭骨架：Fastify + SQLite + 迁移 + 三个端点（注册/登录/登出）
2. 跑通之后接上已完成的 `login.html`，把「这是设计稿」那段换成真的 fetch
3. 再做受保护页面下发与进度导入
4. 每一步都能在本地验，验完再进下一步

邮件服务和 Stripe 开户是你那边的事，不挡我这几步。
