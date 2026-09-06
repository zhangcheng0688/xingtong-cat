---
type: RAGFlow 运维
title: RAGFlow 接入、回退与故障定位
description: 说明 RAGFlow 服务启动、数据集配置、应用变量、验证方式和回退到本地语料的行为。
tags: [operations, ragflow, knowledge]
---
# RAGFlow 接入、回退与故障定位

RAGFlow 是可选检索引擎，不是应用启动前提。先按 `infra/ragflow/docker-compose.yml` 做本地简化启动，或由生产 Compose 启动 ES/MySQL/MinIO/Redis/RAGFlow；在管理端配置 embedding、创建数据集并灌入 `data/knowledge/` 内容，取得 dataset ID 和 API key，再设置 `KNOWLEDGE_BACKEND=ragflow` 与三个 RAGFLOW 变量。

应用只调用 `/api/v1/retrieval`，不管理上传或数据集生命周期。先运行 `node scripts/test-knowledge.ts`，它会显示 `ragflowConfigured()` 状态和命中；再以演练场景验证检索摘要进入 Agent。若连接、HTTP code、返回 code 或空命中异常，代码记录 warn 后自动本地检索，因此要同时检查 local corpus 仍在镜像内。

当前生产 Compose 未把 9380 发布到宿主机，不能照文档直接 SSH 到 localhost:9380；先修订端口策略。诊断顺序：Compose 服务健康→变量完整→数据集/embedding→API key→脚本命中→应用场景。检索算法细节见[检索](../knowledge/retrieval.md)。