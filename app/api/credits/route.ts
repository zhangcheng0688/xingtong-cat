import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { currentUser, PACKAGES, PRICING, SIGNUP_BONUS } from "@/lib/credits";

// 积分中心：余额 + 流水 + 套餐
export async function GET(req: NextRequest) {
  const user = currentUser(req);
  if (!user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });
  return NextResponse.json({
    balance: store.getCredits(user.id),
    signupBonus: SIGNUP_BONUS,
    pricing: PRICING,
    packages: PACKAGES,
    txns: store.listCreditTxns(user.id).slice(0, 50),
  });
}

// 充值（预览环境为模拟支付，直接到账并记录流水；
// 小程序内替换为 wx.requestPayment → 微信支付回调 → 服务端验签后到账）
export async function POST(req: NextRequest) {
  const user = currentUser(req);
  if (!user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });
  let body: { packageId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
  const pkg = PACKAGES.find((p) => p.id === body.packageId);
  if (!pkg) return NextResponse.json({ error: "套餐不存在" }, { status: 404 });
  const balance = store.addCredits(user.id, pkg.credits, "purchase", pkg.id);
  return NextResponse.json({ ok: true, balance, added: pkg.credits, package: pkg });
}
