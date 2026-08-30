import { NextRequest } from "next/server";
import { store, type User } from "./store";

// —— 定价表（单位：积分；1 元 = 10 积分）——
export const PRICING = {
  scenario: 5,   // 创建一场孪生演练（含全程对话 + 总结报告）
  lesson: 2,     // 一节互动课（首次开课收取，复习免费）
  weekly: 3,     // 生成一期 AI 干预周报
} as const;

// 新用户注册赠送积分（≈ 6 场演练 + 若干课程）
export const SIGNUP_BONUS = 30;

// 充值套餐（预览环境为模拟支付；小程序内接微信支付）
export const PACKAGES = [
  { id: "p1", price: 9.9, credits: 100, label: "体验包", tagline: "约 20 场演练" },
  { id: "p2", price: 29.9, credits: 330, label: "坚持包", tagline: "约 66 场演练 · 多送 10%", hot: true },
  { id: "p3", price: 68, credits: 800, label: "陪伴包", tagline: "约 160 场演练 · 多送 18%" },
] as const;

export type PricedAction = keyof typeof PRICING;

export class InsufficientCredits extends Error {
  balance: number;
  need: number;
  constructor(balance: number, need: number) {
    super("积分不足");
    this.balance = balance;
    this.need = need;
  }
}

/** 从请求头解析当前登录用户；未登录返回 null */
export function currentUser(req: NextRequest): User | null {
  const token = req.headers.get("authorization")?.replace(/^Bearer /i, "");
  return store.userByToken(token);
}

/**
 * 为一次计费动作扣积分。
 * @throws InsufficientCredits 余额不足（调用方应返回 402）
 */
export function spend(userId: string, action: PricedAction, refId?: string): number {
  const need = PRICING[action];
  const balance = store.getCredits(userId);
  if (balance < need) throw new InsufficientCredits(balance, need);
  return store.addCredits(userId, -need, action, refId)!;
}
