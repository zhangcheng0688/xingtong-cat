# 星童猫咪 · 开源方案选型与接入清单

> 版本 v1.0 · 2026-08-30
> 数据均来自 GitHub API 实时检索（star 数与更新时间为检索当日值）。
> 原则：**自研只投在差异化上**（多专家矩阵、循证知识库、家长产品体验），通用能力全部用成熟开源/云服务。

---

## 1. 决策总表

| 环节 | 选择 | 方案 | 状态 |
|---|---|---|---|
| AI 玩具固件 | **接入生态** | xiaozhi-esp32（29.4k★） | ✅ 协议已兼容，指引见下 |
| 玩具设备管理后端 | **参考** | xiaozhi-esp32-server（10.5k★，JS） | 📖 规模化后引入 |
| ASR 语音识别 | **双轨** | 云端百炼（已实现）+ FunASR 自部署（20k★） | ✅ 代码已支持 |
| TTS 语音合成 | **双轨** | 云端百炼（已实现）+ CosyVoice 自部署（23k★） | ✅ 代码已支持 |
| 音色克隆（小星品牌声） | **接入** | 豆包声音复刻（云）或 GPT-SoVITS（61.3k★，自部署） | 📖 文档级 |
| 全双工通话（边听边讲） | **量产引入** | 火山 RTC + 豆包（云）或 FireRedChat（581★，私有化） | 📖 路线图 |
| 小程序 UI 组件库 | **不用** | 自研温馨设计系统 | ❌ 决策见 §6 |
| LLM 编排 / RAG 框架 | **不用** | 自研轻量实现（已上线） | ❌ 决策见 §6 |

---

## 2. AI 玩具固件：xiaozhi-esp32 生态（本周就能用）

**[78/xiaozhi-esp32](https://github.com/78/xiaozhi-esp32)** — 29,453★ · C++ · 2026-08-30 仍在更新
ESP32 开源 AI 聊天机器人固件的事实标准：面包板可跑，支持按键对话/唤醒词、MCP 工具调用、LCD 表情屏，中文社区教程极多。

**接入我们的方式（协议已兼容，无需改固件架构）**：

```
xiaozhi 固件（OTA 配自定义服务器地址）
    ↓ WebSocket/HTTP
我们的后端（Next.js）
    /api/voice/turn  ← 已在 v1.3 实现：音频进 → {回应文本 + mp3 + emotion/action} 出
    ↓
多专家矩阵（toyChat 小星玩伴）+ 循证 RAG
```

- **PoC 阶段**：按 xiaozhi 官方文档编译固件 → 把服务器地址指向我们的部署 → 对话流量经 `/api/voice/turn` 进入小星大脑。xiaozhi 支持自定义 OTA/服务器地址，这是官方用法。
- **规模化阶段**：参考 **[xinnan-tech/xiaozhi-esp32-server](https://github.com/xinnan-tech/xiaozhi-esp32-server)**（10,454★ · JavaScript · 2026-08-30 更新）——它已解决设备绑定、音色管理、对话记录、OTA 升级，语言与我们的技术栈一致（JS），可直接 fork 裁剪，把它的「智能体」层替换成我们的专家矩阵。
- 备选参考：[joey-zhou/xiaozhi-esp32-server-java](https://github.com/joey-zhou/xiaozhi-esp32-server-java)（1,336★，Java 企业级管理台）、[hackers365/xiaozhi-esp32-server-golang](https://github.com/hackers365/xiaozhi-esp32-server-golang)（402★，Go，含声纹识别）。

## 3. 语音模型：云端 + 自部署双轨（代码已落地）

`lib/voice.ts` 的 ASR/TTS provider 是**端点可替换**设计——同一套 OpenAI 兼容调用，指向谁就用谁：

| 部署形态 | 配置 | 适合 |
|---|---|---|
| 云端百炼（默认） | `DASHSCOPE_API_KEY=sk-xxx` | MVP/小规模运营，免运维 |
| **自部署 ASR**：[modelscope/FunASR](https://github.com/modelscope/FunASR)（20,079★） | `VOICE_ASR_BASE_URL=http://你的服务器:10096/v1` | 量产降本 + 儿童语音数据不出内网 |
| **自部署 TTS**：[QwenAudio/CosyVoice](https://github.com/QwenAudio/CosyVoice)（23,241★） | `VOICE_TTS_BASE_URL=http://你的服务器:50000/v1` | 量产降本 + 定制音色私有化 |

- FunASR 官方 runtime 自带 OpenAI 兼容的 `/audio/transcriptions` 服务（含 Paraformer 流式、SenseVoice、VAD、标点、说话人分离），docker 一条命令起服务。
- CosyVoice 官方提供推理/训练/部署全栈；社区有现成 API 包装 [jianchang512/cosyvoice-api](https://github.com/jianchang512/cosyvoice-api)（335★）。
- 两者都支持**音色克隆**：量产时用 2 分钟干声训练「小星」专属声音，孩子听到的永远是同一只猫。

## 4. 音色克隆与全双工（路线图）

- **[RVC-Boss/GPT-SoVITS](https://github.com/RVC-Boss/GPT-SoVITS)** — 61,347★ · Python · 2026-08-30 更新。1 分钟样本即可训练 TTS 音色，是「小星品牌声」自部署路线的首选；云端等价物是豆包声音复刻 2.0（音色可同步用于 TTS 和实时语音）。
- **[FireRedTeam/FireRedChat](https://github.com/FireRedTeam/FireRedChat)** — 581★ · Python · 2026-08-27 更新。小红书开源的**全双工语音交互私有化方案**（边听边讲、精准打断），基于 LiveKit 生态。量产期如果要数据完全自主（儿童语音最敏感），用它替换火山 RTC 方案；否则直接用火山 RTC + 豆包 SC2.0 更省事。

## 5. 哪些**不用**引入（同样重要的决策）

| 候选 | 为什么不引入 |
|---|---|
| [Tencent/tdesign-miniprogram](https://github.com/Tencent/tdesign-miniprogram)（1,747★）等通用组件库 | 我们的核心竞争力之一是「温馨手绘调性」设计系统（奶油/蜜柑/雾青 + 圆体 + 吉祥物气泡），通用组件库会稀释品牌感；且小程序 npm 构建增加链路复杂度。自研样式已覆盖全部 8 页。 |
| LangChain / Dify 等 LLM 编排框架 | 我们的 Agent 矩阵是 6 个 prompt 角色 + 顺序编排，200 行代码透明可控；引入框架只会增加黑盒与升级成本。RAG 同理：当前是关键词加权的轻量检索（`lib/knowledge.ts`），知识库规模在千条级时完全够用；**当知识库超过 1 万条或需要语义检索时**，再引入向量库（建议 pgvector，届时 Neon/Supabase 一个插件即可）。 |
| 微信登录/支付第三方 SDK | 微信小程序登录（code2session）与支付都是 HTTPS 直连，官方协议足够简单，已在 `app/api/auth/route.ts` 实现；不需要 SDK。 |

## 6. 接入工作量清单（剩下的都是「领钥匙」）

| # | 动作 | 依赖 | 产出 |
|---|---|---|---|
| 1 | 百炼控制台领 `DASHSCOPE_API_KEY` 填入 `.env.local` | 无 | 全产品云端语音即刻启用 |
| 2 | 按 xiaozhi-esp32 文档编译固件，服务器地址指向我们 | ESP32-S3 开发板（¥100） | 第一只会说话的「小星」样机 |
| 3 | 录 2 分钟「小星」干声 → 豆包声音复刻或 GPT-SoVITS | 无 | 品牌音色 |
| 4 | （量产）docker 部署 FunASR + CosyVoice，改两个环境变量切换 | GPU 服务器或云主机 | 语音成本降至接近零 + 数据自主 |
| 5 | （量产）评估 FireRedChat 私有化全双工 vs 火山 RTC | 4 完成后 | 边听边讲的自然对话 |

每一步完成后告诉我，对应的联调/切换代码我来写。
