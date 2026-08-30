"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TabBar from "@/components/TabBar";

interface CourseItem {
  id: string;
  name: string;
  enName: string;
  category: string;
  brief: string;
  evidence: string;
  lessonCount: number;
  doneCount: number;
  fitScore: number;
}

const CAT_ICON: Record<string, string> = {
  行为基础: "◈",
  沟通语言: "❝",
  社交情绪: "❤",
  感觉与环境: "✺",
  家长赋能: "✋",
};

export default function LearnPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [childName, setChildName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(async (d) => {
        const pid = d.profiles?.[0]?.id ?? "";
        setChildName(d.profiles?.[0]?.name ?? "");
        const r2 = await fetch(`/api/learn?profile=${pid}`);
        const d2 = await r2.json();
        setCourses(d2.courses ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = [...new Set(courses.map((c) => c.category))];

  return (
    <main className="app-shell pb-24">
      <div className="px-6 pb-4 pt-8">
        <h1 className="font-serif text-2xl text-night">循证干预课程</h1>
        <p className="mt-1 text-[13px] text-inklight">
          {childName ? `已按${childName}的档案个性化排序 · ` : ""}机构级知识，拆解成家庭可执行的每日练习
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-inklight">正在准备课程…</div>
      ) : (
        categories.map((cat) => (
          <section key={cat} className="mt-2 px-6">
            <h2 className="mb-2.5 flex items-center gap-2 text-sm font-bold text-inklight">
              <span className="text-stardeep">{CAT_ICON[cat]}</span> {cat}
            </h2>
            <div className="space-y-2.5">
              {courses
                .filter((c) => c.category === cat)
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => router.push(`/learn/${c.id}`)}
                    className="card flex w-full items-center gap-3.5 !p-4 text-left transition hover:border-star/60 hover:shadow-lift"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-semibold">{c.name}</span>
                        <span className="text-[11px] text-inklight/60">{c.enName}</span>
                        {c.fitScore >= 3 && (
                          <span className="rounded-full bg-star/15 px-2 py-0.5 text-[10px] font-bold text-stardeep">
                            推荐
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-1 text-[13px] text-inklight">{c.brief}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-mist">
                          <div
                            className="h-full rounded-full bg-sage transition-all"
                            style={{ width: `${c.lessonCount ? (c.doneCount / c.lessonCount) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-inklight/70">
                          {c.doneCount}/{c.lessonCount} 节
                        </span>
                      </div>
                    </div>
                    <span className="text-inklight/40">→</span>
                  </button>
                ))}
            </div>
          </section>
        ))
      )}
      <TabBar />
    </main>
  );
}
