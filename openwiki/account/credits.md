---
type: 积分与计费
title: 积分账本、402 与失败补偿边界
description: 说明价格、余额流水、模拟充值、扣费顺序、非原子 JSON 写入及当前未补偿的失败语义。
tags: [credits, billing, reliability]
---
# 积分账本、402 与失败补偿边界

`lib/credits.ts` 固定 `scenario:5`、`lesson:2`、`weekly:3`，注册赠送 30；套餐 p1/p2/p3 为 100/330/800。`spend` 先取余额，不足抛 `InsufficientCredits`；路由转换为 HTTP 402，形如 `{code:"INSUFFICIENT_CREDITS",balance,need}`。Web `lib/client.ts` 和小程序 API 封装识别该语义。

`store.addCredits` 保证计算后余额不为负；成功时先重写 `users.json`，再重写 `creditTxns.json`。因此余额和流水不是原子事务，进程崩溃或并发 read-modify-write 可造成丢失更新或只写其一。`POST /api/credits` 是预览模拟支付：有效 token 加合法 packageId 即直接入账，没有订单、回调验签或退款。

## 实际扣费顺序与失败结果

| 流程 | 当前顺序 | 幂等/恢复事实 |
|---|---|---|
| 场景 | `spend` → `createSession`（LLM/RAG/写 session） | 创建失败不退款；重复请求可重复收费、建多 session |
| 首次课程 | 条件满足时 `spend` → `tutorChat` | LLM 失败不退款；“history 非空”可避开首次收费条件 |
| 周报 | `spend` → 查询近 7 天 session → 可能 400 → LLM → save | 无 session 仍已扣费；重复成功 POST 会重复收费并写多份 |
| 报告 | 场景已付费后生成 | 已有 report 直接返回，不再次生成/收费 |

没有自动补偿、幂等键、后台对账或管理员退款 API。人工恢复只能在受控维护环境中核对 users 与 creditTxns 后做同 reason/refId 的补偿；不要暴露任意加分端点。生产改造应先将“计费意图/请求 ID”持久化，在事务中写订单和账本，业务成功后捕获，失败则释放或补偿，并对支付回调验签去重。

## 目标交付账本

以数据库事务建立 `charge_request`：`idempotencyKey` 唯一、user/action/ref、金额、状态 `pending|delivered|compensated|failed`。同 key 重试返回同一结果；同一用户余额更新和不可变 ledger 在一个事务中提交，按 user 行/事务隔离并发扣费。先建 pending，再交付 createSession/tutorChat/generateWeekly；成功标 delivered，失败执行同 ref 的补偿或保留 pending 给对账 worker，绝不静默扣款。周报应先验证窗口数据再创建 charge。

生产充值建立 payment order（package、user、金额、provider order），只由验签且幂等的支付回调入账；客户端 packageId 仅能创建待支付订单。测试：余额不足、各 LLM 失败、空周、同 key 重试、并发扣费、伪造回调/充值、补偿后余额和 ledger 一致。

流程入口：[演练](../practice/session-lifecycle.md)、[互动课](../learn/lesson-api.md)、[周报](../agents/weekly-editor.md)。资源授权问题独立见[认证边界](auth.md)。