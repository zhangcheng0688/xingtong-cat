---
type: 演练界面
title: 演练、报告与语音交互界面
description: 说明 Web 和小程序演练页面的乐观渲染、动作文本、浏览器语音降级与报告展示。
tags: [practice, frontend, voice]
---
# 演练、报告与语音交互界面

`app/home/page.tsx` 选择 `PRESET_SCENARIOS` 或自定义描述后调用 scenario API；`app/session/[id]/page.tsx` 先 GET session，再乐观添加家长消息，提交后以服务端 session 替换。它用 `renderChildText` 区分 `【动作】`，Enter 发送；结束请求成功后跳 `/report/[id]`。

Web session 的朗读先请求 `/api/voice/tts`，失败使用浏览器 `speechSynthesis`；输入使用 Web Speech API，故浏览器能力是可选降级而非服务端 ASR 保证。当前失败回滚以页面实现为准，生产应为每条乐观 parent 加 request ID：请求失败删除该临时项、finally 清 typing；成功按 server message ID 合并去重。401 重新登录、402 充值、404 返回列表、409/ended 刷新并禁发、5xx 保留输入重试。`app/report/[id]/page.tsx` 以 ScoreRing、亮点、改进、孩子解读和下周练习显示 Report，并保留线下支持提示。

小程序 `pages/home/session/report` 实现同一文本主链，但不含录音和 TTS。预设场景定义在 `lib/types.ts`，更改应同步 Web 与小程序文案。API 状态和计费见[生命周期](session-lifecycle.md)，云语音契约见[语音层](../voice/voice-layer.md)。