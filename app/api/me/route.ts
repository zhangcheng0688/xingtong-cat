import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get("profile") ?? "";
  const sessions = store
    .listSessions(profileId || undefined)
    .map((s) => ({
      id: s.id,
      scenario: { title: s.scenario.title },
      status: s.status,
      createdAt: s.createdAt,
    }));
  const reportCount = profileId ? store.listReports(profileId).length : 0;
  return NextResponse.json({ sessions, reportCount });
}
