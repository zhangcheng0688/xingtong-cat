---
type: 检索架构
title: 本地检索与 RAGFlow 回退
description: 说明 KNOWLEDGE_BACKEND 的后端选择、本地中文打分、RAGFlow HTTP 调用与不中断回退语义。
tags: [knowledge, rag, ragflow]
---
# 本地检索与 RAGFlow 回退

`lib/knowledge.ts` 通过 `retrieveKnowledge(query, topK)` 提供统一入口。默认 `KNOWLEDGE_BACKEND=local`；只有 backend 为 ragflow 且 `RAGFLOW_BASE_URL`、`RAGFLOW_API_KEY`、至少一个逗号分隔 `RAGFLOW_DATASET_ID` 全部存在时才调用 RAGFlow。网络错误、非零 code 或空 chunks 均回退本地，因此演练不会因远端检索中断。

本地 `loadKnowledge()` 从 `process.cwd()/data/knowledge/*.md` 读取，模块缓存直到进程重启。frontmatter 解析 title/tags/scenarios/method_id；检索按 token 和中文 2-gram 打分：标题 5/2、标签和场景 4/2、正文 1/0.2，过滤 score ≤0.5，排序取 topK。

远端请求为 `POST {base}/api/v1/retrieval`，10 秒 abort，`similarity_threshold:0.2`、`vector_similarity_weight:0.3`、`keyword:true`。返回被投影为 `KnowledgeChunk`，不会保留 RAGFlow 相似度。`retrieveProfessionalContext` 使用 top 3 并把正文拼入 Agent prompt，见[演练专家](../agents/roleplay-agents.md)。

## 观测、变更与测试

为每次检索记录结构化事件：backend、结果类型 `configured|success|empty|timeout|http_error|fallback`、耗时、topK、命中数量和文档 ID/title；不得记录 API key、完整档案或完整查询。Session 已保存 `knowledgeRefs` 与 `knowledgeDigest`，生产应为每段注入摘要保存 chunk ID/版本/哈希，才能把引用指回实际内容。

本地 cache 目前只能进程重启失效；语料改动后应重启或提供受控 `reloadKnowledge()`。RAGFlow 数据集更新需记录 dataset/version 并在发布后做命中检查。补充 frontmatter 缺失、中文排序、topK、远端空结果、超时和 500 回退测试。验证 `node scripts/test-knowledge.ts`：加载语料、以超市哭闹查询并断言至少一个命中。运维接入见[RAGFlow 运维](../operations/ragflow-ops.md)。