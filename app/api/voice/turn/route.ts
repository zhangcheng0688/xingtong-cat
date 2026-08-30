import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { runTurn, toyChat } from "@/lib/agents";
import { asr, tts, spokenText, voiceReady, voiceGuide } from "@/lib/voice";

// POST /api/voice/turn —— 语音一站式对话轮次：「听 → 想 → 说」一次完成
//
// 两种输入：
//   1) multipart/form-data：audio 音频文件 + 字段（玩具端/小程序按住说话）
//   2) application/json：直接传 text（客户端本地已识别，或纯文本调试）
//
// 两种模式：
//   mode=roleplay（默认）：家长语音演练，body 带 sessionId，走现有多专家矩阵（孩子模拟+教练点评）
//   mode=toy：玩具陪伴模式，body 带 profileId，走「小星玩伴」Agent，直接回应孩子本人
//
// 返回：{ heard, mode, reply:{...}, audio: "data:audio/mp3;base64,..." | null, audioGuide? }
// audio 内嵌 base64，玩具/小程序一次调用即可拿到可播放声音；云端语音未配置时为 null 并附配置指引。

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let heard = "";
    let mode = "roleplay";
    let sessionId = "";
    let profileId = "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("audio");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "请上传音频文件（字段名 audio）" }, { status: 400 });
      }
      const buf = Buffer.from(await file.arrayBuffer());
      if (buf.length === 0) return NextResponse.json({ error: "音频为空" }, { status: 400 });
      if (buf.length > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "音频过大（限 10MB）" }, { status: 413 });
      }
      heard = await asr(buf, file.name || "audio.wav");
      mode = String(form.get("mode") ?? "roleplay");
      sessionId = String(form.get("sessionId") ?? "");
      profileId = String(form.get("profileId") ?? "");
    } else {
      const body = await req.json();
      heard = String(body.text ?? "").trim();
      mode = String(body.mode ?? "roleplay");
      sessionId = String(body.sessionId ?? "");
      profileId = String(body.profileId ?? "");
    }

    if (!heard) return NextResponse.json({ error: "没有听清，请再说一次" }, { status: 400 });

    // ---------- 想：分发到对应的大脑 ----------
    let replyText = "";
    let extra: Record<string, unknown> = {};

    if (mode === "toy") {
      const profile = store.getProfile(profileId);
      if (!profile) return NextResponse.json({ error: "星星档案不存在" }, { status: 404 });
      const history = store.getToyHistory(profile.id);
      const turn = await toyChat(profile, history, heard);
      store.appendToy(profile.id, { role: "child", content: heard });
      store.appendToy(profile.id, { role: "toy", content: turn.reply, emotion: turn.emotion, action: turn.action });
      replyText = turn.reply;
      extra = { emotion: turn.emotion, action: turn.action, alert: turn.alert };
    } else {
      const session = store.getSession(sessionId);
      if (!session) return NextResponse.json({ error: "演练不存在" }, { status: 404 });
      if (session.status !== "active") {
        return NextResponse.json({ error: "本场演练已结束" }, { status: 400 });
      }
      const profile = store.getProfile(session.profileId);
      if (!profile) return NextResponse.json({ error: "档案丢失" }, { status: 404 });

      const now = new Date().toISOString();
      session.messages.push({ id: store.newId(), role: "parent", content: heard, createdAt: now });
      const { child, expert } = await runTurn(profile, session, heard);
      session.messages.push({ id: store.newId(), role: "child", content: child.reply, createdAt: new Date().toISOString() });
      session.messages.push({
        id: store.newId(),
        role: "expert",
        content: expert.assessment,
        expertNote: expert,
        createdAt: new Date().toISOString(),
      });
      store.saveSession(session);
      replyText = child.reply;
      extra = { expert, childEmotion: child.emotion, sessionId: session.id };
    }

    // ---------- 说：云端 TTS（未配置时优雅降级）----------
    let audio: string | null = null;
    let audioGuide: string | undefined;
    const spoken = spokenText(replyText);
    if (voiceReady() && spoken) {
      try {
        const mp3 = await tts(spoken);
        audio = `data:audio/mp3;base64,${mp3.toString("base64")}`;
      } catch {
        audioGuide = "语音合成失败，已回退为纯文本";
      }
    } else {
      audioGuide = voiceGuide();
    }

    return NextResponse.json({
      heard,
      mode,
      reply: { text: replyText, ...extra },
      audio,
      ...(audio ? {} : { audioGuide }),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
