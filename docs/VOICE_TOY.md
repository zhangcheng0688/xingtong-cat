# 星童猫咪 · 语音交互与 AI 玩具接入白皮书

> 版本 v1.0 · 2026-08-30
> 本文回答三件事：**接什么声音模型**、**技术栈怎么备**、**玩具端怎么接**。

---

## 0. 一页摘要

- **架构决策**：语音层（听/说）与干预大脑（多专家 Agent 矩阵 + 循证 RAG）**解耦**，即「级联架构」。自闭症干预是有安全红线的专业场景，孩子听到的每一句话都必须经过我们可控的专家矩阵，不能交给黑盒端到端模型自由发挥。
- **声音模型推荐**：
  - **现在（MVP）**：阿里百炼 DashScope 一个 Key 同时解决 ASR + TTS，OpenAI 兼容 HTTP 接口，本次代码已完整实现，拿到 Key 填进 `.env.local` 即可发声。
  - **量产（玩具上市）**：火山引擎**豆包端到端实时语音大模型 SC2.0（Strong Character 角色扮演版）**——人设一致性最强、支持音色复刻（打造专属「小星」品牌音色）、全双工边听边讲，且有 100 万 tokens 免费试用额度。
- **玩具端**：ESP32-S3 开源硬件方案（BOM ¥60–100），固件只需调一个 HTTP 端点 `POST /api/voice/turn` 即可完成「听→想→说」闭环，本次已实现。

---

## 1. 本轮已实现的代码（开箱即用）

| 模块 | 路径 | 说明 |
|---|---|---|
| 语音层 | `lib/voice.ts` | ASR/TTS provider 抽象，默认走 DashScope OpenAI 兼容端点；模型/音色全部环境变量可配 |
| TTS 端点 | `app/api/voice/tts/route.ts` | `POST {text, voice?}` → mp3 音频流；未配置 Key 返回 501 + 配置指引 |
| ASR 端点 | `app/api/voice/asr/route.ts` | `POST multipart(audio)` → `{text}` 短音频一句话识别 |
| **玩具一站式端点** | `app/api/voice/turn/route.ts` | `POST` 音频或文本 → `{heard, reply, audio(base64 mp3), emotion, action, alert}` |
| 玩具大脑 | `lib/agents.ts → toyChat` | 第 6 位专家「小星玩伴」：短句、先情绪后事情、给选择不给命令、安全红线预警 |
| 会话持久化 | `lib/store.ts → toy` | 玩具对话按孩子档案持久化（保留最近 40 条上下文） |
| Web 语音模式 | `app/session/[id]/page.tsx` | 演练页「🔊 语音开关」：孩子的话自动朗读（云端 TTS 优先，浏览器本地合成兜底）；🎙️ 语音输入家长话术 |

**今天就能体验的降级链路**（零配置）：Web 演练页打开语音开关 → 孩子的话由浏览器中文语音包读出来；家长可打字或用 Chrome 语音识别输入。

**启用云端语音**（更好的音色、玩具端必需）：

```bash
# .env.local 追加（阿里云百炼控制台 https://bailian.console.aliyun.com 免费开通）
DASHSCOPE_API_KEY=sk-xxx
# 可选：升级更新的模型/音色
XINGTONG_TTS_MODEL=cosyvoice-v3-flash
XINGTONG_TTS_VOICE=longanyang
XINGTONG_ASR_MODEL=sensevoice-v1
```

---

## 2. 声音模型选型（2026-08 现状）

| 方案 | 角色/人设 | 儿童适配 | 延迟 | 免费额度 | 适合阶段 |
|---|---|---|---|---|---|
| **火山豆包实时语音 SC2.0** | ★★★★★ 角色扮演专版，人设可控、音色复刻 | 好（中文最优，其他语种弱） | 全双工，边听边讲 | 100 万 tokens | **量产主推** |
| **阿里 CosyVoice v3 / Qwen3-TTS** | ★★★☆ 指令控制情感、声音设计 | 好 | 流式低延迟 | 按量试用 | **MVP 已接入** |
| 豆包全双工 Seeduplex | 抗干扰/动态判停最强 | 好 | 最低 | 随实时语音包 | 量产锦上添花 |
| 讯飞儿童语音 | ★★★ 儿童 ASR 识别率行业标杆 | **ASR 最强**（口齿不清儿童语音） | 中 | 试用礼包 | ASR 专项补强 |
| OpenAI Realtime | ★★★★ | 中文一般 | 全双工 | 无 | 出海版备选 |
| 小红书 FireRedChat（开源） | 可私有化全双工 | 需自训 | 全双工 | 免费（自部署） | 远期数据自主 |

来源：火山引擎端到端实时语音文档（[火山引擎: 2026-08-20](https://docs.volcengine.com/docs/6561/1594356?lang=zh:)）、火山对话式 AI 计费页（[火山引擎: 2026-06-11](https://www.volcengine.com/docs/6348/1392584)）、阿里云实时语音合成指南（[阿里云: 2026-08-25](https://help.aliyun.com/zh/model-studio/realtime-tts-user-guide)）、豆包 Seeduplex 快讯（[腾讯云开发者社区: 2026-06-18](https://developer.cloud.tencent.com/news/4112309)）、FireRedChat 报道（同上快讯列表，2025-10）。

**为什么是豆包 SC2.0 做量产主推**：
1. 「SC = Strong Character」角色扮演路线专为**人设一致性**设计——「小星猫咪」的温柔性格不能漂移（[火山引擎: 2026-08-20](https://docs.volcengine.com/docs/6561/1594356?lang=zh:)）。
2. 音色复刻 2.0：克隆音色可同时用于 TTS 和实时语音，打造独一无二的品牌声音。
3. 角色控制指令体系：模型输出可携带**动作与表情描述**——与我们 `toyChat` 已输出的 `emotion`/`action` 字段天然衔接，直接驱动玩具的耳朵摆动和呼吸灯。

**级联 vs 端到端的落地形态**：闲聊陪伴走端到端全双工（体验流畅）；**干预引导走级联**（我们的大脑接管，安全可控）。两者用意图路由切换——这是量产期的目标架构，MVP 期全部走级联即可。

---

## 3. 玩具端技术栈准备

### 3.1 硬件参考方案（开源已验证）

| 部件 | 型号 | 作用 | 参考价 |
|---|---|---|---|
| 主控 | ESP32-S3-WROOM-1-N16R8 | Wi-Fi + 音频编解码 + 算力 | ¥35 |
| 麦克风 | INMP441（I2S 数字麦） | 收音 | ¥8 |
| 功放喇叭 | MAX98357A + 3W 喇叭 | 发声 | ¥10 |
| 电源 | 3.7V 锂电池 + Type-C 充电 | 便携 | ¥15 |
| 表达层 | 舵机×2（耳朵）+ RGB 呼吸灯 | `action` 字段驱动 | ¥20 |

开源参考：立创开源硬件平台已有「ESP32 直接对话大语言模型」完整工程（原理图 + PCB + 固件，讯飞 ASR + 豆包 LLM，响应 3s 内）（[立创开源硬件平台: 2024-06-27](http://mp.weixin.qq.com/s?__biz=Mzg4NzYzODIwMA==&mid=2247625586&idx=1&sn=b2687f61eb93a1b5a0de7c902b64de69)）。

### 3.2 接入协议（已实现，固件只管调）

**MVP：HTTP 一问一答**（按住说话 → 松开发送，开发最快）

```
POST /api/voice/turn
Content-Type: multipart/form-data
Authorization: Bearer <家长账号令牌>   // 烧录进玩具，绑定孩子档案

audio=<录音文件.wav>
mode=toy
profileId=<孩子档案ID>

→ 200
{
  "heard": "小星我今天搭了好高的积木",
  "mode": "toy",
  "reply": {
    "text": "哇，好高呀！想不想让我看看？",
    "emotion": "happy",
    "action": "light_rainbow",   // 固件映射：彩虹灯
    "alert": false
  },
  "audio": "data:audio/mp3;base64,//..."   // 直接解码播放
}
```

**量产：WebSocket / RTC 流式**（边听边讲、随时打断）——火山 RTC + 豆包实时语音 SDK（iOS/Android/嵌入式均有），协议升级不影响大脑层。

### 3.3 固件流程

```
按键/唤醒词 → INMP441 录音(Opus/PCM) → Wi-Fi HTTPS POST /api/voice/turn
→ 解析 JSON → MAX98357A 播放 mp3 → 按 action 驱动舵机/灯效
→ alert=true 时：灯效变安抚模式 + 家长端小程序收到提醒
```

---

## 4. 儿童安全与合规（这个品类的高压线）

1. **内容安全双层**：`toyChat` 输出先经安全红线 prompt 约束，`alert=true` 的话语（自伤/伤害线索）触发家长提醒机制；量产期再加一层独立的内容审核 API。
2. **个保法**：儿童语音属敏感个人信息——采集需监护人明示同意（登录页加勾选）、原始音频**识别后即弃**（当前实现不落盘）、提供「一键删除孩子全部数据」入口。
3. **防沉迷**：玩具定位是「家长干预的延伸」，不是电子保姆——白皮书建议每日对话时长默认上限 30 分钟，家长在小程序可调。
4. **广告与诱导**：玩具端永远不出现消费引导；积分/付费只在家长端。

## 5. 商业模式衔接

玩具 = 硬件一次性收入 + **订阅制大脑**（建议 ¥19–29/月，含无限陪伴对话 + 每周干预报告 + 课程解锁），家长端积分体系继续服务演练/课程。`POST /api/voice/turn` 的 `mode=toy` 留给订阅校验钩子（当前 MVP 免费）。

## 6. 下一步行动清单（需要你做）

| # | 事项 | 入口 | 预计耗时 |
|---|---|---|---|
| 1 | 开通阿里云百炼，拿 `DASHSCOPE_API_KEY` 填进 `.env.local`，重启即发声 | bailian.console.aliyun.com | 10 分钟 |
| 2 | 注册火山引擎，开通「豆包端到端实时语音大模型」试用（100 万 tokens 免费） | console.volcengine.com | 20 分钟 |
| 3 | 购买 ESP32-S3 开发板套件做首个硬件 PoC（¥100 内） | 淘宝/立创商城 | 3 天到货 |
| 4 | 确定「小星」品牌音色：豆包声音复刻录 2 分钟干声 | 火山控制台 | 30 分钟 |

拿到任何一步的 Key 或板子后告诉我，我接着把对应的 provider/固件联调做完。
