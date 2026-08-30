// 星童猫咪 · 语音层（Voice Layer）
//
// 架构决策：ASR/TTS 与「多专家 Agent 大脑」解耦（级联架构）。
// 语音层只负责「听清、说好」，干预决策永远由我们自有的循证专家矩阵完成——
// 这是产品在自闭症干预场景的安全红线与差异化壁垒，详见 docs/VOICE_TOY.md。
//
// 默认 provider：阿里百炼 DashScope 的 OpenAI 兼容端点，
// 一个 DASHSCOPE_API_KEY 同时搞定 ASR + TTS（百炼控制台可免费领取额度）。
// 模型/音色名均可通过环境变量覆盖，便于升级到 CosyVoice v3 / Qwen3-TTS 等新版本。

const DASH_KEY = process.env.DASHSCOPE_API_KEY ?? "";
const DASH_BASE = (process.env.DASHSCOPE_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1").replace(/\/$/, "");
const TTS_MODEL = process.env.XINGTONG_TTS_MODEL ?? "cosyvoice-v1";
const TTS_VOICE = process.env.XINGTONG_TTS_VOICE ?? "longwan";
const ASR_MODEL = process.env.XINGTONG_ASR_MODEL ?? "sensevoice-v1";

// ASR 与 TTS 可分别指向不同服务——同一套代码通吃三种部署形态：
// ① 云端百炼（默认）② 自部署 FunASR（20k★，OpenAI 兼容 /audio/transcriptions）
// ③ 自部署 CosyVoice（23k★，经社区 API 包装）。见 docs/OPENSOURCE_STACK.md
const ASR_BASE = (process.env.VOICE_ASR_BASE_URL ?? DASH_BASE).replace(/\/$/, "");
const ASR_KEY = process.env.VOICE_ASR_API_KEY ?? DASH_KEY;
const TTS_BASE = (process.env.VOICE_TTS_BASE_URL ?? DASH_BASE).replace(/\/$/, "");
const TTS_KEY = process.env.VOICE_TTS_API_KEY ?? DASH_KEY;

export class VoiceUnavailable extends Error {
  constructor() {
    super("云端语音未配置");
  }
}

export const asrReady = () => Boolean(ASR_KEY);
export const ttsReady = () => Boolean(TTS_KEY);
export const voiceReady = () => asrReady() || ttsReady();

export const voiceGuide = () =>
  "在 .env.local 配置 DASHSCOPE_API_KEY（阿里云百炼，免费），或指向自部署服务：VOICE_ASR_BASE_URL（FunASR）/ VOICE_TTS_BASE_URL（CosyVoice）。模型/音色可用 XINGTONG_TTS_MODEL、XINGTONG_TTS_VOICE、XINGTONG_ASR_MODEL 覆盖。详见 docs/VOICE_TOY.md 与 docs/OPENSOURCE_STACK.md";

// qwen3-tts 原生接口返回 WAV；/audio/speech 路线返回 MP3
export const ttsMime = () => (TTS_MODEL.includes("qwen3-tts") ? "audio/wav" : "audio/mpeg");

// 孩子话术中的【动作】标注不应被读出来
export function spokenText(text: string): string {
  return text.replace(/【[^】]*】/g, "").replace(/\s+/g, " ").trim();
}

// 文本 → 语音（返回音频字节；MIME 用 ttsMime() 获取）
export async function tts(text: string, voice?: string): Promise<Buffer> {
  if (!TTS_KEY) throw new VoiceUnavailable();

  // qwen3-tts 路线：走原生 DashScope multimodal-generation 接口。
  // 百炼工作区网关（ws-*.maas.aliyuncs.com）无 /audio/speech 路由且会丢弃内联音频，
  // 但原生接口返回的限时 OSS URL 可正常下载（公共 DashScope 同样支持此接口）。
  if (TTS_MODEL.includes("qwen3-tts")) {
    const host = TTS_BASE.replace(/\/compatible-mode\/v1$/, "").replace(/\/v1$/, "");
    const res = await fetch(`${host}/api/v1/services/aigc/multimodal-generation/generation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${TTS_KEY}` },
      body: JSON.stringify({
        model: TTS_MODEL,
        input: { text, voice: voice ?? TTS_VOICE },
      }),
    });
    const data = await res.json().catch(() => ({}) as Record<string, never>);
    if (!res.ok) {
      const msg = (data as { message?: string })?.message ?? (data as { error?: { message?: string } })?.error?.message ?? "";
      throw new Error(
        `TTS 调用失败 ${res.status}: ${String(msg).slice(0, 200)}（可用 XINGTONG_TTS_MODEL / XINGTONG_TTS_VOICE 调整模型与音色）`
      );
    }
    const url = (data as { output?: { audio?: { url?: string } } })?.output?.audio?.url;
    if (!url) throw new Error("TTS 未返回音频地址");
    const audio = await fetch(url);
    if (!audio.ok) throw new Error(`TTS 音频下载失败 ${audio.status}`);
    return Buffer.from(await audio.arrayBuffer());
  }

  // 标准 OpenAI 兼容路线：/audio/speech（cosyvoice-v1 / 自部署 CosyVoice）
  const res = await fetch(`${TTS_BASE}/audio/speech`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TTS_KEY}` },
    body: JSON.stringify({
      model: TTS_MODEL,
      input: text,
      voice: voice ?? TTS_VOICE,
      response_format: "mp3",
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(
      `TTS 调用失败 ${res.status}: ${t.slice(0, 200)}（可用 XINGTONG_TTS_MODEL / XINGTONG_TTS_VOICE 调整模型与音色）`
    );
  }
  return Buffer.from(await res.arrayBuffer());
}

// 语音 → 文本（一句话/短音频识别）
export async function asr(audio: Buffer, filename = "audio.wav"): Promise<string> {
  if (!ASR_KEY) throw new VoiceUnavailable();

  // omni 路线：百炼工作区专属端点等网关不暴露 /audio/transcriptions，
  // 但 qwen3-omni-flash 可经 chat/completions 接收音频输入完成转写（已实测）
  if (ASR_MODEL.includes("omni")) {
    const ext = filename.split(".").pop()?.toLowerCase() ?? "wav";
    const mime = ext === "mp3" ? "audio/mpeg" : ext === "m4a" ? "audio/mp4" : "audio/wav";
    const res = await fetch(`${ASR_BASE}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ASR_KEY}` },
      body: JSON.stringify({
        model: ASR_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "input_audio", input_audio: { data: `data:${mime};base64,${audio.toString("base64")}` } },
              { type: "text", text: "请逐字转写这段中文语音，只输出转写文本本身，不要解释、不要加引号" },
            ],
          },
        ],
      }),
    });
    const data = await res.json().catch(() => ({} as Record<string, never>));
    if (!res.ok) {
      const msg = (data as { error?: { message?: string } })?.error?.message ?? "";
      throw new Error(`ASR 调用失败 ${res.status}: ${msg.slice(0, 200)}（可用 XINGTONG_ASR_MODEL 调整识别模型）`);
    }
    const text = String(
      (data as { choices?: { message?: { content?: string } }[] })?.choices?.[0]?.message?.content ?? ""
    ).trim();
    if (!text) throw new Error("没有听清，请再靠近一点说");
    return text;
  }

  // 标准 OpenAI 兼容路线：/audio/transcriptions（DashScope 公共端点 sensevoice-v1 / 自部署 FunASR）
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(audio)]), filename);
  form.append("model", ASR_MODEL);
  const res = await fetch(`${ASR_BASE}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ASR_KEY}` },
    body: form,
  });
  const data = await res.json().catch(() => ({}) as Record<string, { message?: string } | undefined>);
  if (!res.ok) {
    throw new Error(
      `ASR 调用失败 ${res.status}: ${(data?.error?.message ?? "").slice(0, 200)}（可用 XINGTONG_ASR_MODEL 调整识别模型）`
    );
  }
  const text = String(data.text ?? "").trim();
  if (!text) throw new Error("没有听清，请再靠近一点说");
  return text;
}
