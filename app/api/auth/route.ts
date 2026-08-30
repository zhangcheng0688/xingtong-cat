import { NextResponse } from "next/server";
import { store, type User } from "@/lib/store";
import { SIGNUP_BONUS } from "@/lib/credits";

// 认证 API：小程序与 Web 共用同一套语义。
// 小程序内：login_wx 的 code 来自 wx.login()，服务端用 AppID+AppSecret 调
// auth.code2Session 换 openid；Web 预览环境没有微信容器，用 dev 模拟通道。
const DEV = process.env.NODE_ENV !== "production";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function publicUser(u: User) {
  return { id: u.id, nickname: u.nickname, channel: u.channel, credits: u.credits ?? 0, phone: u.phone ? u.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2") : undefined };
}

export async function POST(req: Request) {
  let body: { action?: string; phone?: string; code?: string; nickname?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "请求格式错误" }, 400);
  }
  const now = new Date().toISOString();

  // —— ① 发送短信验证码 ——
  if (body.action === "send_code") {
    const phone = (body.phone ?? "").trim();
    if (!/^1\d{10}$/.test(phone)) return json({ error: "请输入 11 位手机号" }, 400);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    store.saveSmsCode({ phone, code, expiresAt: Date.now() + 5 * 60 * 1000 });
    // 生产环境：此处对接短信服务商（腾讯云短信/阿里云短信）发送验证码。
    // 开发/预览环境：直接回显验证码，方便演示完整流程。
    return json({ ok: true, ...(DEV ? { devCode: code } : {}) });
  }

  // —— ② 手机号 + 验证码登录 ——
  if (body.action === "login_phone") {
    const phone = (body.phone ?? "").trim();
    const saved = store.getSmsCode(phone);
    if (!saved || saved.code !== (body.code ?? "").trim()) {
      return json({ error: "验证码错误或已过期" }, 401);
    }
    store.clearSmsCode(phone);
    let user = store.findUserByPhone(phone);
    if (!user) {
      user = {
        id: store.newId(),
        phone,
        nickname: `星友${phone.slice(-4)}`,
        channel: "phone",
        credits: 0,
        createdAt: now,
        lastLoginAt: now,
      };
      store.saveUser(user);
      store.addCredits(user.id, SIGNUP_BONUS, "signup_bonus");
      user = store.getUser(user.id)!; // 重新读取，拿到赠送后的余额
    } else {
      user.lastLoginAt = now;
      store.saveUser(user);
    }
    return json({ ok: true, token: store.issueToken(user.id), user: publicUser(user) });
  }

  // —— ③ 微信一键登录 ——
  if (body.action === "login_wx") {
    // 小程序正式环境：const { code } = body;
    //   GET https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=code&grant_type=authorization_code
    //   → openid，用它做 findUserByWx。
    // Web 预览环境没有微信容器：用模拟 openid 演示完整链路。
    const openid = DEV ? "dev_wechat_user" : (body.code ?? "");
    if (!openid) return json({ error: "缺少微信登录凭证" }, 400);
    let user = store.findUserByWx(openid);
    if (!user) {
      user = {
        id: store.newId(),
        wxOpenid: openid,
        nickname: body.nickname?.trim() || "微信星友",
        channel: "wechat",
        credits: 0,
        createdAt: now,
        lastLoginAt: now,
      };
      store.saveUser(user);
      store.addCredits(user.id, SIGNUP_BONUS, "signup_bonus");
      user = store.getUser(user.id)!;
    } else {
      user.lastLoginAt = now;
      store.saveUser(user);
    }
    return json({ ok: true, token: store.issueToken(user.id), user: publicUser(user) });
  }

  // —— ④ 退出登录 ——
  if (body.action === "logout") {
    const token = req.headers.get("authorization")?.replace(/^Bearer /i, "");
    if (token) store.revokeToken(token);
    return json({ ok: true });
  }

  return json({ error: "未知操作" }, 400);
}

// 当前登录用户
export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer /i, "");
  const user = store.userByToken(token);
  if (!user) return json({ error: "未登录" }, 401);
  return json({ user: publicUser(user) });
}
