---
type: 认证与安全边界
title: 登录、令牌与当前 API 授权模型
description: 说明手机号和微信登录、Bearer token、当前各 API 的认证和资源归属检查，以及生产隔离缺口。
tags: [authentication, authorization, security]
---
# 登录、令牌与当前 API 授权模型

`POST /api/auth` 有 send_code、login_phone、login_wx、logout；GET 返回当前公开用户。手机号匹配 `^1\d{10}$`，验证码存 5 分钟，非 production 会返回 `devCode`；微信生产路径调用 `jscode2session`，未配 `WX_APPID/WX_SECRET` 时用开发模拟身份。新用户建 `User` 并加 30 积分，`store.issueToken` 生成随机 48 hex token；token 仅显式 logout 撤销，**无过期、轮换和设备边界**。

Web 将 token 存 `localStorage.xt_token`，`lib/client.ts` 发送 `Authorization: Bearer`; 小程序 `utils/api.js` 从 Storage 发送同头，对 401 跳登录、402 弹窗。这是客户端便利机制，不等于服务端对资源授权。

## 当前端点矩阵

| 域 | 当前认证 | 当前归属检查 | 结论 |
|---|---|---|---|
| auth、profile | profile GET/POST 无认证 | profile 无 `userId`，GET 返回全部 | 全局档案 |
| credits、scenario | 必须 Bearer user | 只扣当前 user；scenario 所给 profile 不验证归属 | 计费用户与档案可脱钩 |
| session/message/report、me | 无认证 | 仅 sessionId/profileId | 知道 ID 可读改 |
| learn GET/PUT | 无认证 | 仅 profileId；PUT 可写任意进度 | 无资源隔离 |
| learn POST、weekly POST | 仅首次计费/生成时需 user | profile 不验证归属 | 账户可为他人档案付费 |
| weekly GET、community、voice | 无认证 | community author 由客户端；voice 仅 ID | 匿名或全局访问 |

`/api/weekly` POST、`/api/learn` POST 的部分认证不表示其 GET/PUT 均受保护。玩具和 roleplay voice turn 也未验证 profile/session 归属。有关持久化关系见[数据模型](../architecture/data-model.md)。

## 安全改造顺序

## 目标授权契约与响应

为 `ChildProfile` 增加不可变 `userId`；Session/Progress/Weekly/Toy 以 profile owner 间接归属，Report 以 session owner 间接归属（可冗余 owner 便于索引）。所有 profile 列表只返回 current user；所有按 profile/session/report 的读取、写入、列表都先解析资源 owner。匿名或无效/过期 token 返回 401，已认证但非 owner 返回 403，未知资源返回 404；不得以 404 掩盖已知 owner 的写入错误。覆盖 session GET/message/report GET+POST、learn PUT、weekly GET、profile GET/POST、voice toy/roleplay 的跨用户读写拒绝测试。

## 生产认证加固契约

`send_code(phone)` 写带发送时间、尝试计数、expiry 的验证码挑战；每手机号/IP/设备限频，错误次数达到阈值锁定，成功即 `clearSmsCode`，过期读取时删除，production 永不返回 code。`login_phone(phone,code)` 只消费未锁定挑战；`login_wx(code,nickname)` 对 code2Session 的网络、非 JSON 和上游错误统一返回不泄露细节的 401/502 认证错误，DEV openid 仅允许 `NODE_ENV!==production`。logout 撤销当前 token，GET 当前用户需有效 token。

token 应含 expiry、会话/设备 ID 和可轮换版本；服务端每次验证 expiry/revocation，客户端优先安全 Cookie 或受限 storage，临近到期轮换。自动化覆盖验证码重放/猜测/过期、生产无 code 泄露、上游微信失败、过期 token 与 logout 后 token。

相关域：[演练](../practice/session-lifecycle.md)、[课程](../learn/lesson-api.md)、[社区](../community/community.md)、[积分](credits.md)。