---
type: 语音服务
title: ASR 与 TTS 解耦语音层
description: 说明 lib/voice.ts 的可替换 ASR/TTS provider、两条协议路线、音频限制与浏览器降级。
tags: [voice, asr, tts]
---
# ASR 与 TTS 解耦语音层

`lib/voice.ts` 只负责听/说，干预决策仍交给 Agent。默认用 DashScope key/base；ASR 与 TTS 也可分别由 `VOICE_ASR_BASE_URL/KEY`、`VOICE_TTS_BASE_URL/KEY` 指向自部署兼容服务。`asrReady` 与 `ttsReady` 独立，未配置时抛 `VoiceUnavailable`，API 返回 501 和 `voiceGuide`。

TTS：当模型名含 `qwen3-tts`，调用原生 multimodal-generation，取得并下载 OSS audio URL，MIME 为 wav；其他模型 POST `{TTS_BASE}/audio/speech`，返回 mp3。ASR：模型名含 omni 时把 base64 音频放入 `/chat/completions` 的 input_audio；否则用 multipart `/audio/transcriptions`。`spokenText` 会去掉儿童文本的 `【动作】`，避免朗读动作。

两类 provider 都以服务端 Authorization Bearer key 鉴权：标准分支解析 transcription JSON 的 `text` 或 speech 二进制；omni 解析 choices message content；qwen3 解析 output audio URL 后下载。非 2xx、空文本或缺 URL 均抛错误，route 对未配置映射 501，其它上游错误当前多为 500。

`POST /api/voice/asr` 要 multipart `audio`，空文件 400，最大 10MB 413。`POST /api/voice/tts` 接收 text/voice，返回二进制。浏览器演练页面在 TTS 失败时用 Web Speech API，不能把这当成小程序能力。完整听想说见[玩具端点](toy-endpoint.md)；变量汇总见[配置](../operations/configuration.md)。