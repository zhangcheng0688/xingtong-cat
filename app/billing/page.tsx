"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import Mascot from "@/components/Mascot";
import { authHeaders } from "@/lib/client";

interface Pkg {
  id: string;
  price: number;
  credits: number;
  label: string;
  tagline: string;
  hot?: boolean;
}
interface Txn {
  id: string;
  delta: number;
  reason: string;
  createdAt: string;
}

const REASON_LABEL: Record<string, string> = {
  signup_bonus: "新用户见面礼",
  purchase: "积分充值",
  scenario: "孪生演练一场",
  lesson: "互动课一节",
  weekly: "AI 干预周报一期",
};

export default function BillingPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [signupBonus, setSignupBonus] = useState(30);
  const [pricing, setPricing] = useState<Record<string, number>>({});
  const [buying, setBuying] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const load = () => {
    fetch("/api/credits", { headers: authHeaders() })
      .then((r) => {
        if (r.status === 401) {
          router.replace("/login");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        setBalance(d.balance);
        setPackages(d.packages ?? []);
        setTxns(d.txns ?? []);
        setSignupBonus(d.signupBonus ?? 30);
        setPricing(d.pricing ?? {});
      })
      .catch(() => {});
  };

  useEffect(load, [router]);

  const buy = async (pkg: Pkg) => {
    setBuying(pkg.id);
    setToast("");
    try {
      // 预览演示：模拟支付成功。小程序内此处调 wx.requestPayment，
      // 微信支付回调验签后由服务端加积分（接口语义完全一致）。
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ packageId: pkg.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "充值失败");
      setBalance(data.balance);
      setToast(`已到账 ${data.added} 积分（演示支付，小程序内走微信支付）`);
      load();
    } catch (e) {
      setToast((e as Error).message);
    } finally {
      setBuying(null);
    }
  };

  return (
    <main className="app-shell pb-10">
      <NavBar title="积分中心" subtitle="每一点积分，都是陪孩子练习的时光" />
      <div className="px-6 pt-6">
        {/* 余额卡 */}
        <div className="card relative overflow-hidden !border-0 !bg-night text-cream">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-star/20 blur-2xl" />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-cream/60">当前余额</div>
              <div className="mt-1 font-serif text-4xl">
                {balance ?? "…"} <span className="text-sm text-cream/60">积分</span>
              </div>
            </div>
            <Mascot size={64} />
          </div>
          <div className="mt-3 text-[11px] leading-relaxed text-cream/50">
            新用户注册即送 {signupBonus} 积分 · 演练 {pricing.scenario ?? 5} 积分/场 · 课程 {pricing.lesson ?? 2} 积分/节 · 周报 {pricing.weekly ?? 3} 积分/期
          </div>
        </div>

        {/* 套餐 */}
        <h2 className="mt-7 font-serif text-lg text-night">补充积分</h2>
        <div className="mt-3 space-y-2.5">
          {packages.map((p) => (
            <button
              key={p.id}
              disabled={buying !== null}
              onClick={() => buy(p)}
              className="card relative flex w-full items-center gap-4 !p-4 text-left transition hover:border-star/60 hover:shadow-lift disabled:opacity-60"
            >
              {p.hot && (
                <span className="absolute -top-2 right-4 rounded-full bg-star px-2 py-0.5 text-[10px] font-bold text-night">
                  最受欢迎
                </span>
              )}
              <div className="flex-1">
                <div className="text-[15px] font-semibold">
                  {p.label} · {p.credits} 积分
                </div>
                <div className="mt-0.5 text-xs text-inklight">{p.tagline}</div>
              </div>
              <div className="shrink-0 rounded-xl bg-night px-4 py-2 text-sm font-semibold text-cream">
                {buying === p.id ? "支付中…" : `¥${p.price}`}
              </div>
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-inklight/70">
          预览环境为模拟支付，点击即到账；小程序内将调起微信支付。
          <br />
          积分永不过期，仅用于产品内服务消耗，不支持提现。
        </p>
        {toast && <p className="mt-3 text-center text-[13px] text-sage">{toast}</p>}

        {/* 流水 */}
        <h2 className="mt-8 font-serif text-lg text-night">积分明细</h2>
        <div className="mt-3 space-y-2">
          {txns.length === 0 && (
            <p className="card py-6 text-center text-sm text-inklight">还没有积分记录</p>
          )}
          {txns.map((t) => (
            <div key={t.id} className="card flex items-center gap-3 !p-3.5">
              <div className="flex-1">
                <div className="text-[14px] font-medium">{REASON_LABEL[t.reason] ?? t.reason}</div>
                <div className="text-[11px] text-inklight/70">
                  {new Date(t.createdAt).toLocaleString("zh-CN")}
                </div>
              </div>
              <div className={`font-serif text-base ${t.delta > 0 ? "text-sage" : "text-rose"}`}>
                {t.delta > 0 ? `+${t.delta}` : t.delta}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
