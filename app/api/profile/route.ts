import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import type { ChildProfile } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const profile: ChildProfile = {
      id: store.newId(),
      name: String(body.name ?? "").slice(0, 20),
      age: Number(body.age) || 0,
      gender: body.gender === "girl" ? "girl" : "boy",
      diagnosis: String(body.diagnosis ?? ""),
      languageLevel: String(body.languageLevel ?? ""),
      behaviors: String(body.behaviors ?? ""),
      sensory: String(body.sensory ?? ""),
      interests: String(body.interests ?? ""),
      triggers: String(body.triggers ?? ""),
      createdAt: new Date().toISOString(),
    };
    if (!profile.name || profile.age <= 0) {
      return NextResponse.json({ error: "请填写孩子小名和年龄" }, { status: 400 });
    }
    store.saveProfile(profile);
    return NextResponse.json({ profile });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ profiles: store.listProfiles() });
}
