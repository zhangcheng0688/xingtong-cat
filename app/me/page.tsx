"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TabBar from "@/components/TabBar";
import type { ChildProfile } from "@/lib/types";

interface SessionLite {
  id: string;
  scenario: { title: string };
  status: string;
  createdAt: string;
}

export default function MePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [sessions, setSessions] = useState<SessionLite[]>([]);
  const [reportCount, setReportCount] = useState(0);
  const [lessonDone, setLessonDone] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("xt_token")) {
      router.replace("/login");
      return;
    }
    fetch("/api/profile")
      .then((r) => r.json())
      .then(async (d) => {
        const p: ChildProfile | undefined = d.profiles?.[0];
        if (!p) {
          router.replace("/onboarding");
          return;
        }
        setProfile(p);
        const r2 = await fetch(`/api/learn?profile=${p.id}`);
        const d2 = await r2.json();
        setLessonDone(
          (d2.courses ?? []).reduce((sum: number, c: { doneCount: number }) => sum + c.doneCount, 0)
        );
      });
  }, [router]);

  useEffect(() => {
    if (!profile) return;
    fetch(`/api/me?profile=${profile.id}`)
      .then((r) => r.json())
      .then((d) => {
        setSessions(d.sessions ?? []);
        setReportCount(d.reportCount ?? 0);
      })
      .catch(() => {});
  }, [profile]);

  if (!profile) {
    return (
      <main className="app-shell flex items-center justify-center pb-24">
        <div className="text-inklight">加载中…</div>
        <TabBar />
      </main>
    );
  }

  return (
    <main className="app-shell pb-24">
      <div className="px-6 pt-8">
        {/* 档案卡 */}
        <div className="card relative overflow-hidden !border-0 !bg-night text-cream">
          <div className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full bg-star/20 blur-2xl" />
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-star/20 text-3xl">
              {profile.gender === "boy" ? "👦" : "👧"}
            </div>
            <div>
              <div className="font-serif text-xl">{profile.name}</div>
              <div className="mt-0.5 text-xs text-cream/70">
                {profile.age} 岁 · {profile.languageLevel || "星星档案"}
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-white/10 py-2.5">
              <div className="font-serif text-lg">{sessions.length}</div>
              <div className="text-[10px] text-cream/60">演练场次</div>
            </div>
            <div className="rounded-xl bg-white/10 py-2.5">
              <div className="font-serif text-lg">{reportCount}</div>
              <div className="text-[10px] text-cream/60">总结报告</div>
            </div>
            <div className="rounded-xl bg-white/10 py-2.5">
              <div className="font-serif text-lg">{lessonDone}</div>
              <div className="text-[10px] text-cream/60">已修课程</div>
            </div>
          </div>
        </div>

        {/* 功能入口 */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={() => router.push("/weekly")}
            className="card flex w-full items-center gap-3.5 !p-4 text-left transition hover:border-star/60"
          >
            <span className="text-xl">☾</span>
            <div className="flex-1">
              <div className="text-[15px] font-semibold">干预周报</div>
              <div className="text-xs text-inklight">AI 汇总本周演练，看见孩子的进步曲线</div>
            </div>
            <span className="text-inklight/40">→</span>
          </button>
          <button
            onClick={() => router.push("/onboarding")}
            className="card flex w-full items-center gap-3.5 !p-4 text-left transition hover:border-star/60"
          >
            <span className="text-xl">✎</span>
            <div className="flex-1">
              <div className="text-[15px] font-semibold">新建星星档案</div>
              <div className="text-xs text-inklight">为另一个孩子建档（当前默认使用最新档案）</div>
            </div>
            <span className="text-inklight/40">→</span>
          </button>
        </div>

        {/* 演练历史 */}
        <h2 className="mt-8 font-serif text-lg text-night">演练历史</h2>
        <div className="mt-3 space-y-2">
          {sessions.length === 0 && (
            <p className="card py-8 text-center text-sm text-inklight">还没有演练记录，去「演练」页开始第一场</p>
          )}
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() =>
                router.push(s.status === "ended" ? `/report/${s.id}` : `/session/${s.id}`)
              }
              className="card flex w-full items-center gap-3 !p-3.5 text-left transition hover:border-star/60"
            >
              <span className={`h-2 w-2 rounded-full ${s.status === "ended" ? "bg-sage" : "bg-star"}`} />
              <div className="flex-1 text-[14px] font-medium">{s.scenario.title}</div>
              <span className="text-xs text-inklight/60">
                {new Date(s.createdAt).toLocaleDateString("zh-CN")}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-8 rounded-xl bg-mist/50 p-3.5 text-xs leading-relaxed text-inklight">
          隐私说明：所有档案与演练数据仅保存在服务端本地存储中，用于生成个性化干预内容。特殊群体数据敏感，正式版本将支持端侧部署选项。本产品不构成医疗诊断或治疗建议。
        </p>

        {/* 账号与退出 */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-mist/80 bg-cream px-4 py-3 text-[13px]">
          <span className="text-inklight">
            当前账号：{typeof window !== "undefined" ? (JSON.parse(localStorage.getItem("xt_user") || "{}").nickname ?? "—") : "—"}
          </span>
          <button
            className="font-medium text-rose"
            onClick={async () => {
              const t = localStorage.getItem("xt_token");
              await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
                body: JSON.stringify({ action: "logout" }),
              }).catch(() => {});
              localStorage.removeItem("xt_token");
              localStorage.removeItem("xt_user");
              router.replace("/login");
            }}
          >
            退出登录
          </button>
        </div>
      </div>
      <TabBar />
    </main>
  );
}
