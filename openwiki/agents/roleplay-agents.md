---
type: AI 演练编排
title: 演练专家与回合契约
description: 说明场景理解、检索、儿童模拟、观察点评和报告生成的提示约束、并行关系与持久化契约。
tags: [agents, roleplay, practice]
---
# 演练专家与回合契约

`createSession(profile, description)` 是演练的服务端入口：`understandScenario` 以 temperature 0.5 输出六字段 Scenario；`retrieveProfessionalContext` 用场景和档案字段检索 top 3，空命中时保留通识兜底摘要；随后儿童 Agent 以 temperature 0.85 生成开场并保存 active session。调用者是 `POST /api/scenario`，全流程见[生命周期](../practice/session-lifecycle.md)。

`runTurn(profile, session, parentMessage)` 仅回放最近 12 条 parent/child 消息。它并行调用：

- 儿童 Prompt 要求第一人称、不出戏、动作写为 `【…】`，随家长应对以 1–10 连续情绪强度回应；返回 `{reply, emotion, inner}`。
- 专家 Prompt 读取同一检索摘要和文字记录，先接住努力、一次一个可执行建议，返回 `{assessment,suggestion,method}`；出现自伤、用药或家长崩溃线索时要求建议线下支持。

路由将一轮 parent、child、expert 三条 `Message` 落库；专家结构同时放入 `expertNote`。前端只展示 child `reply` 与 expert note，`inner` 不落库。

`generateReport` 汇总 parent/child 对话及 expert notes。Prompt 限分数 60–95，`improvements` 不超过两条且每条必须有原话和更好说法；返回值由报告路由补上 ID、sessionId、时间。报告请求必须已有至少两条 parent 消息；成功后 session 改 `ended`。

## 可恢复性与 schema 改造

当前 `runTurn` 在内存先 push parent，任一并行 Agent/JSON 失败时不会 save，重试会重跑且可能分叉；report 是先查既有、生成、依次 save session/report，局部失败也无恢复状态。生产应持久化 turn request ID 与 `pending|completed|failed`，先原子保存 parent/pending，再按 request ID 重试；子/专家结果分别持久化，聚合完成才对 UI 标记完成。报告也需 pending/delivered 状态与原子 status+report 写入。

为 Scenario（六个非空字符串）、TurnResult（reply 非空、emotion 整数 1–10、三项专家字符串）、TutorReply、Report（分数 60–95、improvements ≤2）、WeeklyContent 和 ToyTurn（reply ≤2 短句、emotion 枚举、alert boolean）建 zod schema 并以 `chatJson` 返回；畸形/空 JSON 返回可重试的 502，不落半成品。测试主/备用均失败、空输出、畸形 JSON、仅 child 成功、报告失败、重复报告和断点重试。

## 修改与验证

角色契约改变时必须同步：`lib/types.ts`、`app/api/session/[id]/message/route.ts` 或 report route、`app/session/[id]/page.tsx`/`app/report/[id]/page.tsx`，及小程序 session/report 页面。`node scripts/test-llm.ts` 只验证普通与 zod JSON 调用，不能覆盖这些 Prompt；需用建档→场景→两轮→报告手动冒烟。计费/失败顺序见[积分](../account/credits.md)。