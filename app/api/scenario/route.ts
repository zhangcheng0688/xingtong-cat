import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { createSession } from "@/lib/agents";

export async function POST(req: NextRequest) {
  try {
    const { profileId, description } = await req.json();
    const profile = store.getProfile(String(profileId ?? ""));
    if (!profile) return NextResponse.json({ error: "找不到星星档案，请先建档" }, { status: 404 });
    if (!description || String(description).trim().length < 2) {
      return NextResponse.json({ error: "请描述一下发生了什么" }, { status: 400 });
    }
    const session = await createSession(profile, String(description));
    return NextResponse.json({ session });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
