---
type: Web 前端
title: App Router 页面地图与客户端数据流
description: 说明 Web 的路由、四 Tab、登录建档守卫链、页面 API 依赖和 localStorage 认证模式。
tags: [frontend, nextjs, web]
---
# App Router 页面地图与客户端数据流

主链：`/` 检查档案并按 `xt_token` 跳登录或 home；`/login` 写 token/user；`/onboarding` 四步提交档案；`/home` 创建场景。四 Tab 由 TabBar 固定到 home、learn、community、me。

| 路由族 | 责任 | 主要 API |
|---|---|---|
| login/onboarding/home | 登录、档案、发起演练 | auth/profile/credits/scenario |
| session/report | 对话、报告、可选语音 | session、voice tts |
| learn/[course]/[lesson] | 列表、详情、讲师、打卡 | profile、learn |
| community | 列表、详情、发帖、评论 | community |
| me/billing/weekly | 汇总、余额、周报、登出 | me/credits/weekly/auth |

页面直接 fetch；`authHeaders` 从 localStorage 附 Bearer 和 JSON Content-Type，但 session/report 页面目前直接请求而未附头，且后端恰好未鉴权。积分页和 scenario 使用认证；课程 POST 仅在首次扣费时需认证。页面层的跳转/guard 只是 UX，API 实际授权矩阵见[认证边界](../account/auth.md)。小程序对应和缺口见[原生小程序](miniprogram.md)。

目标客户端契约：所有受保护请求统一经一个 authenticated request；401 清 token 跳登录，402 显示余额/need 并跳充值，404 刷新资源列表，409 ended 刷新 session 并禁发，5xx 保留输入可重试。消息乐观项须有 client request ID：失败删除临时 parent、清 typing；成功按服务器 ID 合并去重，禁止本地和服务器双插入。

建档将多选/自由输入合并成 strings；任何字段模型变化须同步 `ChildProfile`、API、Web 表单和 Agent `profileText`。构建检查 `npm run build`，关键流程须按[验证清单](../development/validation.md)手动走通。