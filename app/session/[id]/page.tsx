"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ChildProfile, Session } from "@/lib/types";

function renderChildText(text: string) {
  // 【动作】渲染为灰色斜体感（非 italic，用颜色+字重区分）
  const parts = text.split(/(【[^】]*】)/g);
  return parts.map((p, i) =>
    p.startsWith("【") ? (
      <span key={i} className="msg-action font-medium">
        {p}
      </span>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState("");
  const [showInfo, setShowInfo] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/session/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setSession(d.session);
        setProfile(d.profile);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages.length, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    setError("");
    // 乐观渲染家长消息
    setSession((s) =>
      s
        ? {
            ...s,
            messages: [
              ...s.messages,
              { id: "tmp", role: "parent", content: text, createdAt: new Date().toISOString() },
            ],
          }
        : s
    );
    try {
      const res = await fetch(`/api/session/${id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "发送失败");
      setSession(data.session);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const finish = async () => {
    setEnding(true);
    setError("");
    try {
      const res = await fetch(`/api/session/${id}/report`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成报告失败");
      router.push(`/report/${id}`);
    } catch (e) {
      setError((e as Error).message);
      setEnding(false);
    }
  };

  if (error && !session) {
    return (
      <main className="app-shell flex flex-col items-center justify-center gap-4 px-8">
        <p className="text-inklight">{error}</p>
        <button className="btn-ghost border border-mist" onClick={() => router.push("/home")}>
          返回首页
        </button>
      </main>
    );
  }
  if (!session || !profile) {
    return (
      <main className="app-shell flex items-center justify-center">
        <div className="text-inklight">正在进入场景…</div>
      </main>
    );
  }

  const ended = session.status === "ended";

  return (
    <main className="app-shell flex h-dvh flex-col">
      {/* 场景头部 */}
      <header className="border-b border-mist/70 bg-cream/95 px-5 pb-3 pt-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-serif text-lg text-night">{session.scenario.title}</div>
            <div className="mt-0.5 text-xs text-inklight">目标：{session.scenario.goal}</div>
          </div>
          <button
            onClick={() => setShowInfo((v) => !v)}
            className="text-xs text-inklight underline-offset-2 hover:underline"
          >
            {showInfo ? "收起" : "场景详情"}
          </button>
        </div>
        {showInfo && (
          <div className="msg-in mt-3 rounded-xl bg-mist/50 p-3 text-xs leading-relaxed text-inklight">
            <p>{session.scenario.setting}</p>
            {session.knowledgeRefs.length > 0 && (
              <p className="mt-1.5">
                专家参考：
                {session.knowledgeRefs.map((r) => (
                  <span key={r} className="chip mr-1 !bg-white/80">{r}</span>
                ))}
              </p>
            )}
          </div>
        )}
      </header>

      {/* 消息流 */}
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {session.messages.map((m) => {
          if (m.role === "child") {
            return (
              <div key={m.id} className="msg-in flex gap-2.5">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-night text-sm text-cream">
                  {profile.name.slice(0, 1)}
                </div>
                <div className="max-w-[78%] rounded-2xl rounded-tl-md border border-mist/80 bg-white/80 px-4 py-3 text-[15px] leading-relaxed">
                  {renderChildText(m.content)}
                </div>
              </div>
            );
          }
          if (m.role === "parent") {
            return (
              <div key={m.id} className="msg-in flex justify-end">
                <div className="max-w-[78%] rounded-2xl rounded-tr-md bg-night px-4 py-3 text-[15px] leading-relaxed text-cream">
                  {m.content}
                </div>
              </div>
            );
          }
          if (m.role === "expert" && m.expertNote) {
            return (
              <div key={m.id} className="msg-in rounded-xl border border-sage/20 bg-sagebg px-4 py-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sage">
                  <span>✦ 观察专家</span>
                  <span className="font-normal text-sage/70">· {m.expertNote.method}</span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink">{m.expertNote.assessment}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-sage">{m.expertNote.suggestion}</p>
              </div>
            );
          }
          return null;
        })}

        {sending && (
          <div className="msg-in flex gap-2.5">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-night text-sm text-cream">
              {profile.name.slice(0, 1)}
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-mist/80 bg-white/80 px-4 py-3.5">
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-inklight" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-inklight" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-inklight" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 输入区 */}
      <footer className="border-t border-mist/70 bg-cream px-4 pb-5 pt-3">
        {error && <p className="mb-2 text-xs text-rose">{error}</p>}
        {ended ? (
          <button className="btn-primary" onClick={() => router.push(`/report/${id}`)}>
            查看本次总结报告
          </button>
        ) : (
          <>
            <div className="flex gap-2">
              <textarea
                className="input max-h-28 min-h-[46px] flex-1 resize-none"
                placeholder={`对${profile.name}说点什么，或描述你做的动作…`}
                value={input}
                disabled={sending}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <button
                className="self-end rounded-xl bg-night px-5 py-3 text-[15px] font-semibold text-cream transition active:scale-95 disabled:opacity-40"
                disabled={!input.trim() || sending}
                onClick={send}
              >
                发送
              </button>
            </div>
            <button
              className="mt-3 w-full rounded-xl border border-star/50 bg-star/10 py-2.5 text-sm font-semibold text-stardeep transition hover:bg-star/20 disabled:opacity-50"
              disabled={ending || sending}
              onClick={finish}
            >
              {ending ? "协调总结专家生成报告中…" : "结束演练，生成总结报告"}
            </button>
          </>
        )}
      </footer>
    </main>
  );
}
