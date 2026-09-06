---
type: AI 讲师
title: 循证课程讲师 Agent
description: 说明 tutorChat 的输入契约、渐进式教学规则、历史窗口和课程 API 的计费耦合。
tags: [agents, learning, tutor]
---
# 循证课程讲师 Agent

`tutorChat(profile, course, lesson, history, userMessage?)` 位于 `lib/agents.ts`。它接收课程名/简介/证据、课时标题/要点/家庭练习及客户端传入的对话历史，返回 `TutorReply`：`teach`、`ask`、`readyToPractice`。首次没有 userMessage 时注入“课程开始”。

Prompt 的不变量：一次最多讲一个要点；以档案举例；家长跑题先答疑；完成全部要点且理解到位时才设置 `readyToPractice=true` 并布置练习。调用用 temperature 0.7、JSON 模式，但返回只经 `extractJson` 解析，不做 zod 校验。历史没有在函数内裁剪；Web 和小程序都重建并发送自身保留的历史，故需防止 UI 无界增长。

`POST /api/learn` 是唯一消费者：先解析静态 `COURSES` 的 course/lesson，再在“history 为空且课时未完成”时扣 2 积分，最后调用讲师。`PUT /api/learn` 才写完成态；`readyToPractice` 只驱动 UI 显示完成按钮，不自动完成。详见[互动课 API](../learn/lesson-api.md)和[积分失败语义](../account/credits.md)。

修改输出字段须同步 API、`app/learn/[courseId]/[lessonId]/page.tsx` 与 `miniprogram/pages/lesson`。验证为真实配置下 `node scripts/test-llm.ts` 加一节首次开课、回复、完成、复习的手动闭环。