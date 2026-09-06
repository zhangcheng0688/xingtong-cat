---
type: AI 玩具陪伴
title: 小星玩伴 Agent
description: 说明 toyChat 面向儿童的短句陪伴、硬件表达字段、告警标记与玩具上下文持久化。
tags: [agents, toy, voice]
---
# 小星玩伴 Agent

`toyChat(profile, history, utterance)` 与演练儿童模拟者方向相反：AI 是陪伴者“小星猫咪”，直接回应儿童。它仅注入最近 10 条 toy 历史，输出 `ToyTurn`：`reply`、`emotion`、`action`、`alert`。解析后仅对 emotion 白名单 `calm|happy|thinking|comforting` 兜底为 calm；action 是字符串，不在服务端校验。

Prompt 要求最多两句、每句不超过 15 字；先接住情绪再谈事情；给选择不用命令；以档案兴趣搭桥。出现自伤、伤人、被伤害或严重害怕/疼痛线索时应安抚并 `alert=true`。这只是模型标记，当前 `/api/voice/turn` 返回它但没有通知、人工升级或硬件强制策略。

玩具模式调用路由取得 `store.getToyHistory(profileId)`，依次写 child 和 toy 两条记录，`appendToy` 只保存最近 40 条。它没有认证或 profile 所有权校验；投入真实儿童语音前必须先解决[认证边界](../account/auth.md)。协议与听想说链路见[玩具端点](../voice/toy-endpoint.md)。