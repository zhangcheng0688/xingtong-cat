import { NextRequest, NextResponse } from "next/server";
import { asr, VoiceUnavailable, voiceGuide } from "@/lib/voice";

// POST /api/voice/asr  multipart/form-data（字段名 audio）
// 短音频一句话识别：玩具按键说话、小程序按住说话都走这里。
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("audio");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请上传音频文件（字段名 audio）" }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.length === 0) return NextResponse.json({ error: "音频为空" }, { status: 400 });
    if (buf.length > 10 * 1024 * 1024) return NextResponse.json({ error: "音频过大（限 10MB）" }, { status: 413 });
    const text = await asr(buf, file.name || "audio.wav");
    return NextResponse.json({ text });
  } catch (e) {
    if (e instanceof VoiceUnavailable) {
      return NextResponse.json({ error: e.message, guide: voiceGuide(), code: "VOICE_NOT_CONFIGURED" }, { status: 501 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
