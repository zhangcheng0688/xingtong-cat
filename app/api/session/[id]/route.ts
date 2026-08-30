import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = store.getSession(id);
  if (!session) return NextResponse.json({ error: "演练不存在" }, { status: 404 });
  const profile = store.getProfile(session.profileId);
  return NextResponse.json({ session, profile });
}
