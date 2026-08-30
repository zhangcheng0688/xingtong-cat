import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { generateWeekly } from "@/lib/agents";

export async function POST(req: NextRequest) {
  try {
    const { profileId } = await req.json();
    const profile = store.getProfile(String(profileId ?? ""));
    if (!profile) return NextResponse.json({ error: "请先建立星星档案" }, { status: 404 });

    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const sessions = store
      .listSessions(profile.id)
      .filter((s) => new Date(s.createdAt) >= weekAgo);
    const reports = store
      .listReports(profile.id)
      .filter((r) => new Date(r.createdAt) >= weekAgo);

    if (sessions.length === 0) {
      return NextResponse.json(
        { error: "本周还没有演练记录，先去完成一场孪生演练吧" },
        { status: 400 }
      );
    }

    const content = await generateWeekly(profile, sessions, reports);
    const scores = reports.map((r) => r.overallScore);
    const weekly = {
      id: store.newId(),
      profileId: profile.id,
      weekStart: weekAgo.toISOString().slice(0, 10),
      sessions: sessions.length,
      avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
      content,
      createdAt: new Date().toISOString(),
    };
    store.saveWeekly(weekly);
    return NextResponse.json({ weekly });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get("profile") ?? "";
  return NextResponse.json({ list: store.listWeekly(profileId) });
}
