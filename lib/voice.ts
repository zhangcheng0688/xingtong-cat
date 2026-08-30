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

export class VoiceUnavailable extends Error {
  constructor() {
    super("云端语音未配置");
  }
}

export const voiceReady = () => Boolean(DASH_KEY);

export const voiceGuide = () =>
  "在 .env.local 中配置 DASHSCOPE_API_KEY 即可启用云端语音（阿里云百炼控制台领取免费额度）；模型/音色可用 XINGTONG_TTS_MODEL、XINGTONG_TTS_VOICE、XINGTONG_ASR_MODEL 覆盖。详见 docs/VOICE_TOY.md";

// 孩子话术中的【动作】标注不应被读出来
export function spokenText(text: string): string {
  return text.replace(/【[^】]*】/g, "").replace(/\s+/g, " ").trim();
}

// 文本 → 语音（返回 mp3 字节）
export async function tts(text: string, voice?: string): Promise<Buffer> {
  if (!DASH_KEY) throw new VoiceUnavailable();
  const res = await fetch(`${DASH_BASE}/audio/speech`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${DASH_KEY}` },
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
  if (!DASH_KEY) throw new VoiceUnavailable();
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(audio)]), filename);
  form.append("model", ASR_MODEL);
  const res = await fetch(`${DASH_BASE}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${DASH_KEY}` },
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
