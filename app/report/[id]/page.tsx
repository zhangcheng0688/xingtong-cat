"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Report, Session } from "@/lib/types";

function ScoreRing({ score }: { score: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#EDE6D6" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r} fill="none" stroke="#F0B429" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-3xl text-night">{score}</span>
        <span className="text-[10px] text-inklight">综合表现</span>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/session/${id}/report`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "加载失败");
        setReport(d.report);
        setSession(d.session);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <main className="app-shell flex flex-col items-center justify-center gap-4 px-8">
        <p className="text-inklight">{error}</p>
        <button className="btn-ghost border border-mist" onClick={() => router.push("/home")}>返回首页</button>
      </main>
    );
  }
  if (!report) {
    return (
      <main className="app-shell flex items-center justify-center">
        <div className="text-inklight">正在翻开报告…</div>
      </main>
    );
  }

  return (
    <main className="app-shell px-6 pb-12 pt-8">
      <div className="text-xs font-semibold tracking-widest text-stardeep">SESSION REPORT</div>
      <h1 className="mt-2 font-serif text-2xl text-night">演练总结报告</h1>
      {session && (
        <p className="mt-1 text-sm text-inklight">
          {session.scenario.title} · {new Date(report.createdAt).toLocaleString("zh-CN")}
        </p>
      )}

      {/* 总分 */}
      <div className="card mt-6 flex items-center gap-5">
        <ScoreRing score={report.overallScore} />
        <p className="flex-1 text-[14px] leading-relaxed text-ink">{report.summary}</p>
      </div>

      {/* 亮点 */}
      {report.highlights.length > 0 && (
        <section className="mt-7">
          <h2 className="font-serif text-lg text-night">✦ 做得好的地方</h2>
          <div className="mt-3 space-y-2.5">
            {report.highlights.map((h, i) => (
              <div key={i} className="rounded-xl border border-sage/25 bg-sagebg p-4">
                <p className="text-[14px] font-medium text-ink">{h.point}</p>
                <p className="mt-1.5 text-[13px] text-inklight">你说的：「{h.quote}」</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 改进 */}
      {report.improvements.length > 0 && (
        <section className="mt-7">
          <h2 className="font-serif text-lg text-night">✦ 下次可以这样试</h2>
          <div className="mt-3 space-y-2.5">
            {report.improvements.map((imp, i) => (
              <div key={i} className="rounded-xl border border-rose/20 bg-rosebg p-4">
                <p className="text-[14px] font-medium text-ink">{imp.point}</p>
                <p className="mt-1.5 text-[13px] text-inklight">你说的：「{imp.quote}」</p>
                <p className="mt-1.5 text-[13px] font-medium text-rose">试试说：「{imp.better}」</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 孩子解读 */}
      <section className="mt-7">
        <h2 className="font-serif text-lg text-night">✦ 读懂孩子</h2>
        <div className="card mt-3 text-[14px] leading-relaxed">{report.childReading}</div>
      </section>

      {/* 方法标签 */}
      {report.methodTags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {report.methodTags.map((t) => (
            <span key={t} className="chip">{t}</span>
          ))}
        </div>
      )}

      {/* 下一步 */}
      {report.nextSteps.length > 0 && (
        <section className="mt-7">
          <h2 className="font-serif text-lg text-night">✦ 未来一周的家庭练习</h2>
          <ol className="mt-3 space-y-2">
            {report.nextSteps.map((s, i) => (
              <li key={i} className="card flex gap-3 !p-4 text-[14px] leading-relaxed">
                <span className="font-serif text-stardeep">{i + 1}.</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-8 rounded-xl bg-mist/50 p-3.5 text-xs leading-relaxed text-inklight">
        本报告基于 AI 模拟演练生成，供家庭教育参考。若孩子出现自伤、攻击升级或严重睡眠/进食紊乱，请及时就诊儿童精神科或发育行为儿科。
      </p>

      <div className="mt-6 flex gap-3">
        <button className="btn-ghost flex-1 border border-mist" onClick={() => router.push("/home")}>
          回到星童空间
        </button>
        <button className="btn-primary flex-1" onClick={() => router.push("/home")}>
          再练一场
        </button>
      </div>
    </main>
  );
}
