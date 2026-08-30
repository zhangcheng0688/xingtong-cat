"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { authHeaders } from "@/lib/client";

interface Weekly {
  id: string;
  weekStart: string;
  sessions: number;
  avgScore: number | null;
  content: {
    headline: string;
    growth: string[];
    parentGrowth: string[];
    focus: string;
    encouragement: string;
  };
  createdAt: string;
}

export default function WeeklyPage() {
  const router = useRouter();
  const [list, setList] = useState<Weekly[]>([]);
  const [current, setCurrent] = useState<Weekly | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [profileId, setProfileId] = useState("");
  const [childName, setChildName] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(async (d) => {
        const p = d.profiles?.[0];
        if (!p) return;
        setProfileId(p.id);
        setChildName(p.name);
        const r2 = await fetch(`/api/weekly?profile=${p.id}`);
        const d2 = await r2.json();
        const l = d2.list ?? [];
        setList(l);
        if (l[0]) setCurrent(l[0]);
      });
  }, []);

  const generate = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/weekly", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ profileId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "INSUFFICIENT_CREDITS") {
          setError(`CREDITS:${data.balance}:${data.need}`);
          return;
        }
        throw new Error(data.error || "生成失败");
      }
      setList((l) => [data.weekly, ...l]);
      setCurrent(data.weekly);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="app-shell pb-10">
      <NavBar title="干预周报" subtitle={childName ? `${childName}的每周成长` : undefined} />
      <div className="px-6 pt-5">
        {current ? (
          <div key={current.id}>
            {/* 头版 */}
            <div className="card !border-0 !bg-night text-cream">
              <div className="text-[11px] font-semibold tracking-widest text-star">WEEKLY · 星童周报</div>
              <h2 className="mt-2 font-serif text-lg leading-relaxed">{current.content.headline}</h2>
              <div className="mt-3 flex gap-4 text-xs text-cream/70">
                <span>本周演练 {current.sessions} 场</span>
                {current.avgScore !== null && <span>平均得分 {current.avgScore}</span>}
                <span>{current.weekStart} 起</span>
              </div>
            </div>

            {current.content.growth.length > 0 && (
              <section className="mt-6">
                <h3 className="font-serif text-[17px] text-night">✦ 孩子的进步信号</h3>
                <ul className="mt-2.5 space-y-2">
                  {current.content.growth.map((g, i) => (
                    <li key={i} className="rounded-xl border border-sage/25 bg-sagebg p-3.5 text-[14px] leading-relaxed">
                      {g}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {current.content.parentGrowth.length > 0 && (
              <section className="mt-6">
                <h3 className="font-serif text-[17px] text-night">✦ 家长的成长</h3>
                <ul className="mt-2.5 space-y-2">
                  {current.content.parentGrowth.map((g, i) => (
                    <li key={i} className="card !p-4 text-[14px] leading-relaxed">{g}</li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-6">
              <h3 className="font-serif text-[17px] text-night">✦ 下周焦点</h3>
              <div className="card mt-2.5 !border-star/40 !bg-star/5 text-[14px] leading-relaxed">
                {current.content.focus}
              </div>
            </section>

            <section className="mt-6">
              <div className="rounded-2xl border border-star/30 bg-star/10 p-5">
                <div className="text-xs font-bold text-stardeep">主编寄语</div>
                <p className="mt-2 font-serif text-[15px] leading-relaxed text-ink">
                  {current.content.encouragement}
                </p>
              </div>
            </section>
          </div>
        ) : (
          <div className="card py-12 text-center text-inklight">
            <div className="text-3xl">☾</div>
            <p className="mt-3 text-sm">还没有周报。完成几场演练后，每周来这领取成长报告。</p>
          </div>
        )}

        {error && error.startsWith("CREDITS:") ? (
          <div className="mt-4 rounded-xl bg-rosebg p-4 text-[13px] leading-relaxed text-rose">
            积分不足，生成周报需要 3 积分。
            <button
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-rose px-4 py-2 font-semibold text-white active:scale-[0.98]"
              onClick={() => router.push("/billing")}
            >
              去补充积分 →
            </button>
          </div>
        ) : (
          error && <p className="mt-4 text-sm text-rose">{error}</p>
        )}
        <button className="btn-primary mt-6" disabled={generating} onClick={generate}>
          {generating ? "周报主编撰写中…" : current ? "重新生成本周周报" : "生成本周周报 ✦"}
        </button>
        {list.length > 1 && (
          <div className="mt-8">
            <h3 className="text-sm font-bold text-inklight">历史周报</h3>
            <div className="mt-2 space-y-2">
              {list.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setCurrent(w)}
                  className={`card w-full !p-3.5 text-left text-sm transition ${
                    current?.id === w.id ? "border-star/60" : ""
                  }`}
                >
                  {w.weekStart} 周 · {w.sessions} 场{w.avgScore !== null ? ` · ${w.avgScore} 分` : ""}
                </button>
              ))}
            </div>
          </div>
        )}
        <button className="btn-ghost mt-6 w-full border border-mist" onClick={() => router.push("/home")}>
          去演练一场
        </button>
      </div>
    </main>
  );
}
