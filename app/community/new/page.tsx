"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import NavBar from "@/components/NavBar";

const TOPICS = ["经验分享", "情绪崩溃", "互相取暖", "提问求助"];

export default function NewPostPage() {
  const router = useRouter();
  const [topic, setTopic] = useState(TOPICS[0]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, title, content, author: "我" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "发布失败");
      router.push(`/community/${data.post.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <main className="app-shell flex min-h-dvh flex-col">
      <NavBar title="发到社区" subtitle="你的经验，是别人的光" />
      <div className="flex-1 space-y-5 px-6 pt-6">
        <div>
          <label className="label">选择话题</label>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] transition ${
                  topic === t
                    ? "border-star bg-star/15 font-semibold text-stardeep"
                    : "border-mist bg-white/60 text-inklight"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">标题</label>
          <input
            className="input"
            placeholder="一句话说清楚，如「视觉日程表救了我们家的早晨」"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="label">正文</label>
          <textarea
            className="input min-h-[180px] resize-none"
            placeholder="发生了什么？你是怎么应对的？孩子有什么变化？"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-rose">{error}</p>}
      </div>
      <div className="px-6 pb-8 pt-4">
        <button className="btn-primary" disabled={!title.trim() || !content.trim() || busy} onClick={submit}>
          {busy ? "发布中…" : "发布到星友社区"}
        </button>
      </div>
    </main>
  );
}
