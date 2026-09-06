---
type: LLM 客户端
title: LangChain 模型内核
description: 说明 OpenAI 兼容模型链的超时、重试、回退、缓存、JSON 提取和 zod 校验行为。
tags: [llm, langchain, reliability]
---
# LangChain 模型内核

`lib/llm.ts` 是唯一模型适配层。`ChatOpenAI` 使用 `KIMI_BASE_URL`、`KIMI_API_KEY`、`XINGTONG_MODEL`，默认网关和 `k3-agent`；timeout 来自 `XINGTONG_LLM_TIMEOUT_MS`（默认 30 秒）。缺少 key 时 `getChain` 抛错，密钥不得进入客户端。

`getChain(jsonMode, temperature)` 以 plain/json 与 temperature 为键缓存链。底层 `maxRetries:0`，主链 `withRetry(stopAfterAttempt:3)`；若配 `XINGTONG_FALLBACK_MODEL`，主链最终失败后用备用链重试两次。JSON 模式绑定 `response_format: json_object`。

- `chatCompletion`：转换角色元组并取文本 content；空内容报错。
- `extractJson`：优先取 fenced JSON，否则截取首尾花括号再 `JSON.parse`。它不验证字段。
- `chatJson`：把 `z.toJSONSchema` 注入 system，首轮解析并 `safeParse`；失败后带 issue 再修复一次，仍失败抛错。

现有 Agent 多用 `chatCompletion + extractJson`，只有显式改用 `chatJson` 才有 schema 防线。真实网关冒烟是 `node scripts/test-llm.ts`，该脚本读取 `.env.local`，不要在文档或日志中输出其中内容。Prompt 约定见[prompt 约定](prompt-conventions.md)。