import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { generateReport } from "@/lib/agents";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = store.getSession(id);
    if (!session) return NextResponse.json({ error: "演练不存在" }, { status: 404 });

    const existing = store.getReportBySession(id);
    if (existing) return NextResponse.json({ report: existing });

    const parentTurns = session.messages.filter((m) => m.role === "parent").length;
    if (parentTurns < 2) {
      return NextResponse.json({ error: "再和孩子互动两轮，报告才更有参考价值" }, { status: 400 });
    }
    const profile = store.getProfile(session.profileId);
    if (!profile) return NextResponse.json({ error: "档案丢失" }, { status: 404 });

    const r = await generateReport(profile, session);
    const report = {
      ...r,
      id: store.newId(),
      sessionId: id,
      createdAt: new Date().toISOString(),
    };
    session.status = "ended";
    store.saveSession(session);
    store.saveReport(report);
    return NextResponse.json({ report });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = store.getReportBySession(id);
  if (!report) return NextResponse.json({ error: "报告尚未生成" }, { status: 404 });
  const session = store.getSession(id);
  return NextResponse.json({ report, session });
}
