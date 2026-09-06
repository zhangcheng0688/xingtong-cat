---
type: 快速开始
title: 星童猫咪代码 Wiki 导航
description: 面向工程师与编码代理的仓库地图、主链路、任务路由和最小验证参考。
tags: [quickstart, navigation]
---
# 星童猫咪代码 Wiki 导航

星童猫咪是面向自闭症家庭干预的 Next.js 15 全栈原型：Web 提供完整移动端产品，原生微信小程序复用 API 但只覆盖部分功能。核心价值是以儿童档案为上下文的场景演练、课程、周报、社区与语音玩具能力。

## 从这里理解系统

- [全栈架构](architecture/overview.md)：入口、分层和运行拓扑；[数据模型](architecture/data-model.md)：JSON 实体与迁移边界。
- [多专家 Agent](agents/overview.md)：演练、讲师、周报、玩伴；[LLM 内核](llm/llm-client.md)与[检索](knowledge/retrieval.md)。
- [演练生命周期](practice/session-lifecycle.md)、[课程体系](learn/courses.md)、[社区](community/community.md)。
- [认证边界](account/auth.md)与[积分账务](account/credits.md)是任何生产改动的必读页。
- [语音层](voice/voice-layer.md)、[Web 页面](frontend/web-pages.md)、[小程序](frontend/miniprogram.md)。
- [部署](operations/deployment.md)、[配置](operations/configuration.md)、[验证](development/validation.md)、[路线图](development/roadmap.md)。

## 主链路

登录→建档→付费创建场景→儿童模拟与专家并行回合→至少两轮后报告；课程首次开课收费、完成后复习免费；周报汇总近七天 session/report；社区独立保存帖子；玩具端点可将音频转写、调用陪伴 Agent、再合成语音。

## 任务路由

| 需求 | Wiki 页面 | 代码入口 | 最小验证 |
|---|---|---|---|
| 改演练反馈/报告 | [演练专家](agents/roleplay-agents.md) | `lib/agents.ts`、session routes | 两轮演练到报告 |
| 改课程/适配 | [课程](learn/courses.md) | `lib/courses.ts`、`/api/learn` | 首开→完成→复习 |
| 改登录/隔离 | [认证](account/auth.md) | auth、profile、所有资源 route | Web/小程序 401 与越权检查 |
| 改价格/支付 | [积分](account/credits.md) | `lib/credits.ts`、store、credits route | 402 与流水核对 |
| 改知识/RAG | [检索](knowledge/retrieval.md) | `lib/knowledge.ts` | `node scripts/test-knowledge.ts` |
| 改语音/玩具 | [玩具端点](voice/toy-endpoint.md) | `lib/voice.ts`、voice routes | JSON、multipart、无 TTS |
| 部署 | [部署](operations/deployment.md) | Docker/infra/workflow | compose config |

## Backlog

- 以 `docs/开发计划.md` 为锚：数据库、支付、内容安全、正式小程序能力、RAGFlow 灌库和硬件仍未完成。
- 以 `lib/types.ts`、`lib/store.ts` 和 API 路由为锚：多用户数据隔离、token 生命周期、事务账务/补偿是上线阻塞项。
- 以 README 内容边界为锚：知识/课程尚待专家审校；不得把 Agent 输出当诊断或治疗建议。

开始改动前先跑[验证](development/validation.md)，再按关联页面的源码入口和不变量缩小影响面。