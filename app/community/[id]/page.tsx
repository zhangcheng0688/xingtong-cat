"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}
interface Post {
  id: string;
  topic: string;
  title: string;
  content: string;
  author: string;
  likes: number;
  comments: Comment[];
  isExpert?: boolean;
}

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = () =>
    fetch(`/api/community`)
      .then((r) => r.json())
      .then((d) => setPost(d.posts?.find((p: Post) => p.id === id) ?? null));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const act = async (action: string, content?: string) => {
    if (busy) return;
    setBusy(true);
    await fetch("/api/community", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: id, action, content, author: "我" }),
    });
    setComment("");
    setBusy(false);
    load();
  };

  if (!post) {
    return (
      <main className="app-shell">
        <NavBar title="帖子详情" />
        <div className="py-20 text-center text-inklight">加载中…</div>
      </main>
    );
  }

  return (
    <main className="app-shell flex min-h-dvh flex-col pb-8">
      <NavBar title={post.topic} subtitle={post.author} />
      <article className="px-6 pt-5">
        <h1 className="font-serif text-xl leading-snug text-night">{post.title}</h1>
        <div className="mt-2 flex items-center gap-2 text-xs text-inklight/70">
          <span className={`rounded-full px-2 py-0.5 ${post.isExpert ? "bg-star/15 text-stardeep font-medium" : "bg-mist/70"}`}>
            {post.isExpert ? "✦ 官方" : post.author}
          </span>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-[15px] leading-[1.9] text-ink">{post.content}</p>

        <button
          onClick={() => {
            if (!liked) {
              setLiked(true);
              act("like");
            }
          }}
          className={`mt-5 rounded-full border px-4 py-2 text-sm transition ${
            liked ? "border-rose/40 bg-rosebg text-rose" : "border-mist text-inklight"
          }`}
        >
          {liked ? "❤" : "♡"} {post.likes} 有用
        </button>
      </article>

      <section className="mt-8 flex-1 px-6">
        <h2 className="text-sm font-bold text-inklight">全部评论 · {post.comments.length}</h2>
        <div className="mt-3 space-y-3">
          {post.comments.length === 0 && (
            <p className="py-6 text-center text-[13px] text-inklight/60">还没有评论，来说句暖心的话吧</p>
          )}
          {post.comments.map((c) => (
            <div key={c.id} className="rounded-xl bg-mist/40 p-3.5">
              <div className="text-xs font-semibold text-inklight">{c.author}</div>
              <p className="mt-1 text-[14px] leading-relaxed">{c.content}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 flex gap-2 border-t border-mist/70 px-4 pt-3">
        <input
          className="input flex-1"
          placeholder="写下你的回应…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing && comment.trim()) act("comment", comment);
          }}
        />
        <button
          className="rounded-xl bg-night px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-40"
          disabled={!comment.trim() || busy}
          onClick={() => act("comment", comment)}
        >
          发送
        </button>
      </div>
    </main>
  );
}
