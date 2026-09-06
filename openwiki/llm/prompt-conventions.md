---
type: Prompt 约定
title: Prompt、JSON 与安全修改约定
description: 说明 COSTAR、档案上下文、JSON 输出、温度选择与提示修改必须同步的调用契约。
tags: [llm, prompts, structured-output]
---
# Prompt、JSON 与安全修改约定

`lib/agents.ts` 的角色 system prompt 都以 `profileText()` 注入同一档案块。保持该函数作为唯一档案格式化点，避免角色各自遗漏语言、感觉或触发点字段。演练场景/专家/报告通常 temperature 0.5，儿童开场和回合 0.85，讲师 0.7，周报 0.6；修改温度会进入 LLM 链缓存键。

所有结构化 Prompt 必须明确“只输出 JSON”及字段形状，且与 `extractJson` 的对象解析兼容。若字段有生产关键约束，应定义 zod schema 并调用 `chatJson`，不要仅靠自然语言要求。变更字段要同步类型、路由持久化和两个客户端 UI；相关例子见[演练专家](../agents/roleplay-agents.md)和[讲师](../agents/tutor.md)。

安全限制（危险信号、非诊断、短句）目前主要是 Prompt 约束，非独立审核层。不能把 prompt 文案视为合规控制；生产需加输入/输出审核、升级处置与可审计事件。