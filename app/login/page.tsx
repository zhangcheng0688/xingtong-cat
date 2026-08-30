"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Mascot from "@/components/Mascot";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [busy, setBusy] = useState<"wx" | "phone" | "code" | null>(null);
  const [error, setError] = useState("");

  // 已登录则直接进入
  useEffect(() => {
    if (localStorage.getItem("xt_token")) router.replace("/home");
  }, [router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const enter = (token: string, user: { nickname: string }) => {
    localStorage.setItem("xt_token", token);
    localStorage.setItem("xt_user", JSON.stringify(user));
    router.replace("/home");
  };

  const loginWx = async () => {
    setBusy("wx");
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login_wx" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "微信登录失败");
      enter(data.token, data.user);
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  };

  const sendCode = async () => {
    if (!/^1\d{10}$/.test(phone)) {
      setError("请先输入 11 位手机号");
      return;
    }
    setBusy("code");
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_code", phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "发送失败");
      setCountdown(60);
      if (data.devCode) {
        setDevCode(data.devCode); // 开发预览环境：直接显示验证码
        setCode(data.devCode);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const loginPhone = async () => {
    if (!/^1\d{10}$/.test(phone) || !code.trim()) {
      setError("请输入手机号和验证码");
      return;
    }
    setBusy("phone");
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login_phone", phone, code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "登录失败");
      enter(data.token, data.user);
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  };

  return (
    <main className="app-shell flex flex-col px-8 pb-10 pt-16">
      <div className="flex flex-col items-center text-center">
        <Mascot size={120} bubble="你好呀，我是小星。以后陪你一起，慢慢懂孩子 ✦" />
        <h1 className="mt-6 font-serif text-[26px] text-ink">星童猫咪</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-inklight">
          AI 驱动的自闭症家庭干预伙伴
          <br />
          登录后，孩子的档案与成长记录只属于你
        </p>
      </div>

      <div className="mt-10">
        {/* 微信一键登录：小程序内调 wx.login + code2Session；此处为预览演示 */}
        <button
          onClick={loginWx}
          disabled={busy !== null}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#07C160] px-6 py-3.5 text-[15px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8.7 4C4.9 4 2 6.6 2 9.8c0 1.8 1 3.4 2.5 4.5l-.6 2 2.2-1.1c.7.2 1.4.3 2.1.3h.4A5.9 5.9 0 0 1 8.5 14c0-3 2.9-5.4 6.4-5.4h.3C14.6 6 12 4 8.7 4zM6.5 7.5a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zm4.5 0a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zM22 14.2c0-2.8-2.6-5-5.7-5s-5.7 2.2-5.7 5 2.6 5 5.7 5c.6 0 1.2-.1 1.8-.2l1.9 1-.5-1.7c1.4-1 2.5-2.4 2.5-4.1zm-7.7-1.7a.8.8 0 1 1 0 1.5.8.8 0 0 1 0-1.5zm3.8 0a.8.8 0 1 1 0 1.5.8.8 0 0 1 0-1.5z" />
          </svg>
          {busy === "wx" ? "正在登录…" : "微信一键登录"}
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-inklight/70">
          <span className="h-px flex-1 bg-mist" />
          或使用手机号
          <span className="h-px flex-1 bg-mist" />
        </div>

        <label className="label">手机号</label>
        <input
          className="input"
          inputMode="numeric"
          maxLength={11}
          placeholder="输入常用手机号"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
        />
        <div className="mt-3 flex gap-2">
          <input
            className="input flex-1"
            inputMode="numeric"
            maxLength={6}
            placeholder="6 位验证码"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
          <button
            onClick={sendCode}
            disabled={busy !== null || countdown > 0}
            className="shrink-0 rounded-xl border border-star/60 bg-star/10 px-4 text-sm font-medium text-stardeep transition active:scale-[0.98] disabled:opacity-50"
          >
            {countdown > 0 ? `${countdown}s` : "获取验证码"}
          </button>
        </div>
        {devCode && (
          <p className="mt-2 text-xs text-sage">预览演示模式：验证码 {devCode}（正式环境走短信通道，不回显）</p>
        )}
        <button onClick={loginPhone} disabled={busy !== null} className="btn-primary mt-5">
          {busy === "phone" ? "正在登录…" : "登录"}
        </button>
        {error && <p className="mt-3 text-center text-[13px] text-rose">{error}</p>}
      </div>

      <p className="mt-auto pt-10 text-center text-[11px] leading-relaxed text-inklight/70">
        登录即代表同意《用户协议》与《隐私政策》
        <br />
        孩子的所有数据仅用于为你提供干预支持，绝不外传
      </p>
    </main>
  );
}
