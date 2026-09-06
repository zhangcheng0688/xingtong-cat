---
type: 运行配置
title: 环境变量与配置边界
description: 汇总模型、检索、语音、微信和部署使用的环境变量及安全配置原则。
tags: [operations, configuration, environment]
---
# 环境变量与配置边界

变量只应来自部署环境或本地占位示例，绝不可提交实际密钥。`.gitignore` 忽略 `.env.*` 和 `data/store/`；`.env.example` 可用于了解占位键。

| 组 | 变量 | 用途 |
|---|---|---|
| LLM | `KIMI_API_KEY`, `KIMI_BASE_URL`, `XINGTONG_MODEL`, `XINGTONG_FALLBACK_MODEL`, `XINGTONG_LLM_TIMEOUT_MS` | OpenAI 兼容模型、回退和超时 |
| 检索 | `KNOWLEDGE_BACKEND`, `RAGFLOW_BASE_URL`, `RAGFLOW_API_KEY`, `RAGFLOW_DATASET_ID` | local/ragflow 路由 |
| 语音 | `DASHSCOPE_API_KEY`, `DASHSCOPE_BASE_URL`, `VOICE_ASR_BASE_URL`, `VOICE_ASR_API_KEY`, `VOICE_TTS_BASE_URL`, `VOICE_TTS_API_KEY`, `XINGTONG_TTS_MODEL`, `XINGTONG_TTS_VOICE`, `XINGTONG_ASR_MODEL` | ASR/TTS provider 与模型 |
| 微信 | `WX_APPID`, `WX_SECRET` | code2Session 登录 |

缺 LLM key 时模型调用立即失败；RAGFlow 不完整或不可达会回退 local；ASR/TTS 各自缺 key 返回 501。详细运行机制见[LLM](../llm/llm-client.md)、[检索](../knowledge/retrieval.md)、[语音](../voice/voice-layer.md)。生产 Compose 还使用 `DOMAIN`、数据库/对象存储/缓存配置，必须替换默认凭据并以 secret 管理。