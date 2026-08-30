"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TabBar from "@/components/TabBar";

interface Post {
  id: string;
  topic: string;
  title: string;
  content: string;
  author: string;
  likes: number;
  comments: { id: string }[];
  isExpert?: boolean;
  createdAt: string;
}

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 3600000) return `${Math.max(1, Math.floor(d / 60000))} 分钟前`;
  if (d < 86400000) return `${Math.floor(d / 3600000)} 小时前`;
  return `${Math.floor(d / 86400000)} 天前`;
}

export default function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [active, setActive] = useState("全部");
  const [loading, setLoading] = useState(true);

  const load = (topic: string) => {
    fetch(`/api/community${topic === "全部" ? "" : `?topic=${encodeURIComponent(topic)}`}`)
      .then((r) => r.json())
      .then((d) => {
        setPosts(d.posts ?? []);
        setTopics(d.topics ?? []);
        setLoading(false);
      });
  };
  useEffect(() => load(active), [active]);

  return (
    <main className="app-shell pb-24">
      <div className="px-6 pb-3 pt-8">
        <h1 className="font-serif text-2xl text-night">星友社区</h1>
        <p className="mt-1 text-[13px] text-inklight">家长不再孤军奋战——经验、答疑与互相取暖</p>
      </div>

      {/* 话题条 */}
      <div className="flex gap-2 overflow-x-auto px-6 pb-3 [scrollbar-width:none]">
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] transition ${
              active === t
                ? "border-star bg-star/15 font-semibold text-stardeep"
                : "border-mist bg-white/60 text-inklight"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-inklight">正在加载话题…</div>
      ) : (
        <div className="space-y-3 px-6 pt-2">
          {posts.map((p) => (
            <button
              key={p.id}
              onClick={() => router.push(`/community/${p.id}`)}
              className="card w-full !p-4 text-left transition hover:border-star/60 hover:shadow-lift"
            >
              <div className="flex items-center gap-2 text-xs">
                <span className={`rounded-full px-2 py-0.5 font-medium ${
                  p.isExpert ? "bg-star/15 text-stardeep" : "bg-mist/70 text-inklight"
                }`}>
                  {p.isExpert ? "✦ " + p.topic : p.topic}
                </span>
                <span className="text-inklight/60">{p.author} · {timeAgo(p.createdAt)}</span>
              </div>
              <div className="mt-2 text-[15px] font-semibold leading-snug">{p.title}</div>
              <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-inklight">{p.content}</p>
              <div className="mt-2.5 flex gap-4 text-xs text-inklight/70">
                <span>♡ {p.likes}</span>
                <span>💬 {p.comments.length}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 发帖按钮 */}
      <button
        onClick={() => router.push("/community/new")}
        className="fixed bottom-[72px] right-[max(16px,calc(50%-240px+16px))] z-40 flex h-12 w-12 items-center justify-center rounded-full bg-night text-xl text-cream shadow-lift transition active:scale-95"
        aria-label="发帖"
      >
        ✎
      </button>
      <TabBar />
    </main>
  );
}
