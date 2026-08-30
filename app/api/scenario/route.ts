import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { createSession } from "@/lib/agents";
import { currentUser, spend, InsufficientCredits, PRICING } from "@/lib/credits";

export async function POST(req: Request) {
  try {
    const user = currentUser(req as never);
    if (!user) {
      return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });
    }
    const { profileId, description } = await req.json();
    const profile = store.getProfile(String(profileId ?? ""));
    if (!profile) return NextResponse.json({ error: "找不到星星档案，请先建档" }, { status: 404 });
    if (!description || String(description).trim().length < 2) {
      return NextResponse.json({ error: "请描述一下发生了什么" }, { status: 400 });
    }

    // 计费：一场演练 = 5 积分（含全程对话 + 总结报告）
    try {
      spend(user.id, "scenario");
    } catch (e) {
      if (e instanceof InsufficientCredits) {
        return NextResponse.json(
          { error: `积分不足：一场演练需要 ${PRICING.scenario} 积分`, code: "INSUFFICIENT_CREDITS", balance: e.balance, need: e.need },
          { status: 402 }
        );
      }
      throw e;
    }

    const session = await createSession(profile, String(description));
    return NextResponse.json({ session, balance: store.getCredits(user.id) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
