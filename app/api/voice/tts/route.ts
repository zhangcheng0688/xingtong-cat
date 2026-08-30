import { NextRequest, NextResponse } from "next/server";
import { tts, ttsMime, spokenText, VoiceUnavailable, voiceGuide } from "@/lib/voice";

// POST /api/voice/tts  { text, voice? } → audio/mpeg
// Web / 小程序 / 玩具端共用。未配置 DASHSCOPE_API_KEY 时返回 501 + 配置指引，
// 前端收到 501 应降级到本地合成（浏览器 speechSynthesis）。
export async function POST(req: NextRequest) {
  try {
    const { text, voice } = await req.json();
    const spoken = spokenText(String(text ?? ""));
    if (!spoken) return NextResponse.json({ error: "没有可朗读的内容" }, { status: 400 });
    const audio = await tts(spoken, voice ? String(voice) : undefined);
    return new NextResponse(new Uint8Array(audio), {
      headers: { "Content-Type": ttsMime(), "Cache-Control": "no-store" },
    });
  } catch (e) {
    if (e instanceof VoiceUnavailable) {
      return NextResponse.json({ error: e.message, guide: voiceGuide(), code: "VOICE_NOT_CONFIGURED" }, { status: 501 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
