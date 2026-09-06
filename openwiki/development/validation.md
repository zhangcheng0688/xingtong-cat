---
type: 开发与验证
title: 本地开发、构建和主链路冒烟
description: 说明仓库现有脚本、最小验证命令、真实服务依赖和无单元测试框架的现状。
tags: [development, validation, testing]
---
# 本地开发、构建和主链路冒烟

基础命令：`npm install` 后 `npm run dev`；发布前运行 `npm run build`。`tsconfig.json` 排除 `scripts`，脚本以支持 TypeScript 类型剥离的 Node 环境直接执行。仓库未配置 Jest/Vitest/Playwright 或 CI 测试工作流，不能把 README 的链路描述当自动化测试结果。

| 检查 | 命令 | 覆盖 |
|---|---|---|
| 编译 | `npm run build` | Next 路由和 TypeScript 构建 |
| LLM | `node scripts/test-llm.ts` | 普通对话和 `chatJson` zod 校验，真实网关 |
| 检索 | `node scripts/test-knowledge.ts` | 装载语料、超市查询至少命中一条 |
| Compose | `docker compose -f infra/docker-compose.prod.yml --env-file .env.production config` | 编排展开 |

后二脚本会读取本地环境文件；仅在已安全配置的开发环境执行，不要回显内容。当前执行环境若无 Node，构建会以 `env: node: No such file or directory` 失败，这不是源码成功证据。

手动主链：登录→建档→创建场景→两轮 parent→报告→首次课程/完成/复习→有演练后生成周报→发帖评论→402 与充值预览。还应验证 Web/小程序各自的 401/402 UX。安全和账务失败情况须按[认证](../account/auth.md)与[积分](../account/credits.md)单独检查。