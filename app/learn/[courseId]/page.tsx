"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";

interface LessonItem {
  id: string;
  title: string;
  minutes: number;
  done: boolean;
}
interface CourseDetail {
  id: string;
  name: string;
  enName: string;
  category: string;
  brief: string;
  evidence: string;
  lessons: LessonItem[];
}

export default function CourseDetailPage() {
  const { courseId: id } = useParams<{ courseId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [profileId, setProfileId] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(async (d) => {
        const pid = d.profiles?.[0]?.id ?? "";
        setProfileId(pid);
        const r2 = await fetch(`/api/learn?profile=${pid}`);
        const d2 = await r2.json();
        const found = d2.courses?.find((c: CourseDetail) => c.id === id) ?? null;
        if (!found) setLoadError("课程不存在或加载失败");
        setCourse(found);
      })
      .catch((e) => setLoadError(String(e)));
  }, [id]);

  if (!course) {
    return (
      <main className="app-shell">
        <NavBar title="课程详情" />
        <div className="py-20 text-center text-inklight">{loadError || "加载中…"}</div>
      </main>
    );
  }

  return (
    <main className="app-shell pb-10">
      <NavBar title={course.name} subtitle={course.enName} />
      <div className="px-6 pt-5">
        <div className="card !border-0 !bg-night text-cream">
          <p className="text-[15px] leading-relaxed">{course.brief}</p>
          <p className="mt-2 text-xs text-cream/60">✦ {course.evidence}</p>
        </div>

        <h2 className="mt-7 font-serif text-lg text-night">课程大纲</h2>
        <div className="mt-3 space-y-2.5">
          {course.lessons.map((l, i) => (
            <button
              key={l.id}
              onClick={() => router.push(`/learn/${course.id}/${l.id}?profile=${profileId}`)}
              className="card flex w-full items-center gap-4 !p-4 text-left transition hover:border-star/60"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  l.done ? "bg-sage text-white" : "bg-star/15 text-stardeep"
                }`}
              >
                {l.done ? "✓" : i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-[15px] font-semibold ${l.done ? "text-inklight" : ""}`}>
                  {l.title}
                </div>
                <div className="mt-0.5 text-xs text-inklight/70">
                  约 {l.minutes} 分钟 · 互动课{l.done ? " · 已完成" : ""}
                </div>
              </div>
              <span className="text-inklight/40">→</span>
            </button>
          ))}
        </div>

        <p className="mt-6 rounded-xl bg-mist/50 p-3.5 text-xs leading-relaxed text-inklight">
          每节课都是与 AI 讲师的对话式学习：讲师会结合孩子的档案举例，带你一步步掌握方法，最后布置家庭练习。
        </p>
      </div>
    </main>
  );
}
