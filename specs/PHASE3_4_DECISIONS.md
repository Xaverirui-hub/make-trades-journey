# Phase 3 / 4 决定 — 权限模型与收款通道

日期：2026-08-17
对应：`web_project_next_phase_plan.txt` PHASE 3 / PHASE 4
前置：[架构审计](ARCHITECTURE_AUDIT_2026-08-17.md)

> 计划里写「不要让 Codex 自己选支付架构」。这份文件就是那个 spec。
> 下面标了「**已查证**」的是当天从官方文档读到的；标了「**你要确认**」的
> 是我查不到、或会随时间变的，动工前要核实。

---

## 一、已定的事

| 项目 | 决定 | 谁定的 |
|---|---|---|
| 付费墙 | **B — 课程页由应用服务器下发,真正挡内容** | 用户 |
| 卖家所在地 | 马来西亚,目前个人身份,之后可能注册 SSM | 用户 |
| 目标市场 | **马来西亚 + 新加坡 + 国际信用卡;v1 不做中国大陆** | 我建议 |
| 收款通道 | **Stripe Malaysia(标准版,非 MoR)** | 我建议 |
| 商品形态 | **以「定期通行证」一次性付款为主,信用卡自动续订为辅** | 我建议 |

---

## 二、为什么不做中国大陆(v1)

不是看不上这个市场,是三道墙叠在一起:

1. **Stripe 的 MoR 产品明确把中国列为受限客户国家**（已查证）。
2. 计划里的 Cloudflare Tunnel 在大陆访问不稳,整个部署方案要另做一套。
3. 外汇保证金交易在大陆面向个人有监管限制,这条我不懂,但足以构成风险。

站上有繁体痕迹(Composer 用 `Microsoft JhengHei` / `PingFang TC`),
如果你本来想的是台港,那和大陆是两回事 —— **台港用信用卡,Stripe 直接支持**,
不受上面三条影响。这点你可以之后再告诉我。

设计上留好口子:加支付宝 / 微信支付是**改配置**,不是重写。

---

## 三、为什么是 Stripe Malaysia,而不是 Paddle 或 Stripe MoR

我查了三条路：

### ✗ Stripe Managed Payments(Stripe 自己的 MoR)—— 用不了

**已查证**:卖家所在地白名单里亚太只有 `AU / HK / JP / SG`,**没有马来西亚**。
而且客户国家把中国列为受限。这条直接排除。

### △ Paddle(第三方 MoR)—— 能用,但不合适

**已查证**:马来西亚在支持的卖家国家内,全球可付款,税务由他们负责。
对个人开户友好,这点符合你现在的状况。

**但**:Paddle 以信用卡 + PayPal 为主,**没有 FPX**。马来西亚人网购最常用的
就是 FPX 网银转账 —— 主力市场的主力付款方式用不了,转化率会吃亏。
手续费也比 Stripe 高一截。

### ✓ Stripe Malaysia(标准版)—— 选这条

**已查证**:
- 马来西亚是 **Generally Available**,不是 preview
- 支持 **FPX**(MYR / MY)、**GrabPay**(MYR / MY / SG)、信用卡
- 订阅、Webhook、Checkout 都是成熟功能

**代价**:你自己是 merchant of record,税务合规是你的事,不是 Stripe 的。

**你要确认**:
- 个人(无 SSM)能不能开 Stripe Malaysia 户 —— 官方文档没写清楚,注册时才知道。
  如果不行,就先注册 SSM 独资(网上查到约 RM30–60/年,1–2 个工作日)。
- **数字服务的 SST 有没有登记门槛、你会不会碰到** —— 这是税务问题,
  我不懂也不该给建议,**找会计师问一句就清楚了**。这也是你说的
  「如果需要报账的话」那件事。

---

## 四、一个会影响定价的技术事实

**已查证**,而且很重要:

> Stripe 的 FPX 和 GrabPay **不支持自动续订**。
> 官方文档在 Checkout 那栏标了脚注「Not supported when using Checkout in
> subscription mode」,订阅栏直接是 Unsupported。只有**信用卡**能自动续订。

意思是:

- 做成**每月自动扣款的订阅** → 马来西亚客户只能刷卡,用不了 FPX/网银
- 做成**一次性买断的定期通行证**(例如 6 个月 / 12 个月 / 终身)→ FPX、
  GrabPay、卡全都能用

马来西亚线上付款 FPX 占比很高。所以我的建议是:

**主推「一次性付款 + 到期日」的通行证,信用卡自动续订作为可选项。**

到期前发邮件提醒续费,而不是靠自动扣款。少一点 MRR 的漂亮数字,
多一大截能付款的人。

这也意味着 Phase 3 的权限模型**不能只按订阅设计**,必须同时支持
「买断到某个日期」。见下。

---

## 五、Phase 3 权限模型

刻意做成**与支付商无关**。上面那些选择万一要改(换 Paddle、加支付宝、
以后注册公司换方案),只需要重写 `payment_events` → `entitlements` 那一层,
课程侧的判断逻辑完全不动。

```
users
  id, email, password_hash, email_verified_at, created_at
  role                     -- 'student' | 'admin'

sessions                   -- 服务端 session,不是 JWT
  id, user_id, expires_at, created_at, revoked_at

plans                      -- 卖什么
  id, code, name_en, name_zh, price_cents, currency,
  duration_days            -- NULL = 终身
  is_recurring             -- 卡自动续订才 true

orders                     -- 一次付款
  id, user_id, plan_id, amount_cents, currency, status,
  provider, provider_ref   -- 'stripe' + checkout session / PI id

entitlements               -- 【唯一】决定能不能看课的表
  id, user_id, scope, granted_at, expires_at, source_order_id
  -- scope: 'course:all' | 'course:<slug>' | 'tool:composer' ...
  -- expires_at NULL = 永久

payment_events             -- webhook 原始记录,幂等靠它
  id, provider, provider_event_id UNIQUE, type, payload,
  received_at, processed_at
```

**关键约束**

- 能不能看课,**只查 `entitlements`**。不查订阅状态、不查订单、更不信前端。
- `payment_events.provider_event_id` 加唯一索引 —— 计划里点名的
  「重复 webhook 防护」靠这一个索引就够,不用写复杂逻辑。
- webhook 必须**验签**后才落库。前端说「付款成功」一律不算数。
- 「订阅」在这个模型里只是「会自动产生新 entitlement 的东西」,
  不是权限本身。所以一次性通行证和自动续订可以共存。

**学员现有进度**:目前 21 课的解锁状态全在浏览器 localStorage 里
(`mtj_exam_pass_N`)。上线认证时做一次性迁移 —— 首次登录把本地进度
上传,之后以服务端为准。不归零。

---

## 六、Phase 4 收款流程

严格照计划里那张图,一步不省:

```
用户 → 定价页 → 后端建 Checkout Session → Stripe 托管收银台
                                              ↓
                                          用户付款
                                              ↓
                          Stripe webhook → 后端验签 → 写 payment_events
                                              ↓
                                    幂等检查(provider_event_id)
                                              ↓
                                       写 orders + entitlements
                                              ↓
                                          用户拿到权限
```

前端全程只负责跳转和显示,**任何时候都不参与判断付款是否成功**。

---

## 七、下一步

不依赖任何外部决定、我可以直接做的:

- [x] Task 0 字体自架
- [x] Task 2 导航栏抽共用
- [ ] 清理仓库根目录 165 个建置残留(Dockerize 前要做)
- [ ] Composer 繁简体统一

需要你动手的(我不能代劳,也不该代劳):

- [ ] 去 Stripe 注册,确认个人身份能不能开户;不行就先办 SSM
- [ ] 找会计师问一句数字服务的税务义务
- [ ] 决定卖什么价、分几档(我可以给建议,但定价是你的生意)

需要你再给一个信息:

- [ ] **台港算不算目标市场?** 算的话不影响方案(信用卡就行),
      但定价和文案的繁体版要认真做,不能只是简转繁。

---

## 八、这份文件的有效期

支付商的国家名单、费率、功能支持**会变**。上面标「已查证」的是
2026-08-17 当天从官方文档读到的。真正动工 Phase 4 之前,
重新核对一次这几项:

- Stripe Managed Payments 的卖家国家名单有没有加马来西亚
- FPX / GrabPay 有没有开始支持自动续订
- Stripe Malaysia 的个人开户政策
