import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { runTurn } from "@/lib/agents";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = store.getSession(id);
    if (!session) return NextResponse.json({ error: "演练不存在" }, { status: 404 });
    if (session.status !== "active") {
      return NextResponse.json({ error: "本场演练已结束" }, { status: 400 });
    }
    const profile = store.getProfile(session.profileId);
    if (!profile) return NextResponse.json({ error: "档案丢失" }, { status: 404 });

    const { message } = await req.json();
    if (!message || !String(message).trim()) {
      return NextResponse.json({ error: "请输入内容" }, { status: 400 });
    }

    const now = new Date().toISOString();
    session.messages.push({ id: store.newId(), role: "parent", content: String(message), createdAt: now });

    const { child, expert } = await runTurn(profile, session, String(message));

    session.messages.push({
      id: store.newId(),
      role: "child",
      content: child.reply,
      createdAt: new Date().toISOString(),
    });
    session.messages.push({
      id: store.newId(),
      role: "expert",
      content: expert.assessment,
      expertNote: expert,
      createdAt: new Date().toISOString(),
    });
    store.saveSession(session);
    return NextResponse.json({ session, turn: { child, expert } });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
