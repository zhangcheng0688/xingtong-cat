---
type: 互动课 API
title: 互动课开课、计费与完成状态
description: 说明 /api/learn 的 GET、POST、PUT 合约，客户端历史、首次开课收费与进度写入。
tags: [learning, api, credits]
---
# 互动课开课、计费与完成状态

`GET /api/learn` 返回按档案排序的课程投影。`POST` 接收 `profileId, courseId, lessonId, history, message?`：先解析档案、课程、课时；当 `history.length===0` 且该课时未完成时，要求 Bearer user 并扣 lesson 2 积分，之后调用 `tutorChat` 返回 `{reply,balance?}`。`PUT` 接收三 ID，调用 `store.completeLesson` 并返回 progress。

Web 课时页维护 history，`readyToPractice` 时显示完成；小程序 `pages/lesson` 同样从本地 history 重建请求。完成状态以 profile/course/lesson 去重，复习已完成课时免费。

重要现状：POST 的首次收费依赖客户端 history，传非空历史可绕过首次收费；PUT 无认证且资源没有 userId。目标应在服务端持久化 enrollment/lesson attempt，按 user+profile+lesson+idempotency key 判定首次开课，完成用幂等写入，客户端 history 仅作上下文。课程改动与安全修复必须同时阅读[认证边界](../account/auth.md)；扣费发生在 LLM 之前，失败不退款且重复行为无幂等键，见[积分](../account/credits.md)。

窄手动验证：首次空 history 扣分→讲师回复→PUT 完成→再次空 history 确认不再扣分；再检查 402 UI。