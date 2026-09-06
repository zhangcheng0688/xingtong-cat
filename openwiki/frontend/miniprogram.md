---
type: 原生微信小程序
title: 微信小程序工程与 Web 对等范围
description: 说明 miniprogram 的应用配置、共享 API 包装、已实现页面、尚未迁移的 Web 能力及上线域名边界。
tags: [miniprogram, wechat, frontend]
---
# 微信小程序工程与 Web 对等范围

`miniprogram/app.js` 的 globalData 提供 `apiBase`（当前 `http://localhost:7199`）和 `requireAuth`；`app.json` 注册 8 页、4 Tab。`utils/api.js` 封装 `wx.request`，从 Storage 注入 Bearer token，401 跳 login、402 弹积分不足。

已实现：登录（`wx.login` code 或手机号）、首页建场景、文本演练/报告、课程列表/互动课/打卡、社区列表/筛选/点赞、我的基础信息/登出。它们调用和 Web 相同的 auth/profile/credits/scenario/session/learn/community 路由。

未迁移：建档、课程详情/课时选择、社区详情/评论/发帖、周报、积分中心/充值、语音录制/TTS、完整我的待办。无档案时首页和学习页明确提示使用 Web 建档。小程序客户端的 401 处理不补足服务端资源授权，见[认证边界](../account/auth.md)。

会话、sendMessage、endSession、report、profiles、courses、completeLesson 等封装调用显式 `auth:false`；这与小程序 request 默认携带 token 不同，也与目前多数未鉴权 API 相互掩盖。积分读取/场景等按默认携带 token。生产应删除 auth:false，按 Web 的统一 401/402/404/409/5xx 恢复契约处理，并测试缺失/过期 token、积分不足、消息失败、ended 与重复完成。

`project.config.json` 的 `urlCheck:false` 与 localhost 仅适合开发者工具；正式版需要备案 HTTPS 域名、微信后台合法 request 域名和真实 API base。上线与类目/隐私要求见 `docs/MINIPROGRAM_DEPLOY.md`。