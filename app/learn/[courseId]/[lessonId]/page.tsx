"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import NavBar from "@/components/NavBar";
import { authHeaders } from "@/lib/client";

interface Msg {
  role: "user" | "assistant";
  content: string; // assistant: teach + ask 拼接展示
  ask?: string;
}

function LessonInner() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const profileId = searchParams.get("profile") ?? "";

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  const call = async (message?: string, historyOverride?: Msg[]) => {
    setBusy(true);
    setError("");
    try {
      const history = (historyOverride ?? msgs).map((m) => ({
        role: m.role,
        content: m.role === "assistant" ? m.content + (m.ask ? `\n提问：${m.ask}` : "") : m.content,
      }));
      const res = await fetch("/api/learn", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ profileId, courseId, lessonId, history, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "INSUFFICIENT_CREDITS") {
          setError(`CREDITS:${data.balance}:${data.need}`);
          return;
        }
        throw new Error(data.error || "讲师开小差了，请重试");
      }
      const r = data.reply;
      setMsgs((m) => [...m, { role: "assistant", content: r.teach, ask: r.ask }]);
      if (r.readyToPractice) setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    call(undefined, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next = [...msgs, { role: "user" as const, content: text }];
    setMsgs(next);
    await call(text, next);
  };

  const finish = async () => {
    await fetch("/api/learn", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, courseId, lessonId }),
    });
    setCompleted(true);
    setTimeout(() => router.push(`/learn/${courseId}`), 1200);
  };

  return (
    <main className="app-shell flex h-dvh flex-col">
      <NavBar title="互动课" subtitle="AI 讲师 · 循证干预方法" />
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="msg-in flex justify-end">
              <div className="max-w-[82%] rounded-2xl rounded-tr-md bg-night px-4 py-3 text-[15px] leading-relaxed text-cream">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={i} className="msg-in flex gap-2.5">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-star/20 text-sm">
                🎓
              </div>
              <div className="max-w-[82%] space-y-2">
                <div className="rounded-2xl rounded-tl-md border border-mist/80 bg-white/80 px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {m.content}
                </div>
                {m.ask && (
                  <div className="rounded-xl border border-star/40 bg-star/10 px-4 py-2.5 text-[14px] leading-relaxed text-stardeep">
                    💬 {m.ask}
                  </div>
                )}
              </div>
            </div>
          )
        )}
        {busy && (
          <div className="msg-in flex gap-2.5">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-star/20 text-sm">🎓</div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-mist/80 bg-white/80 px-4 py-3.5">
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-inklight" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-inklight" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-inklight" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <footer className="border-t border-mist/70 bg-cream px-4 pb-5 pt-3">
        {error && error.startsWith("CREDITS:") ? (
          <div className="mb-2 rounded-xl bg-rosebg p-3 text-xs leading-relaxed text-rose">
            积分不足，一节课需要 2 积分。
            <button className="ml-2 font-semibold underline" onClick={() => router.push("/billing")}>
              去充值 →
            </button>
          </div>
        ) : (
          error && <p className="mb-2 text-xs text-rose">{error}</p>
        )}
        {completed ? (
          <div className="rounded-xl bg-sagebg py-3 text-center text-sm font-semibold text-sage">
            ✓ 本节完成，练习已加入你的家庭作业
          </div>
        ) : done ? (
          <button className="btn-primary !bg-sage" onClick={finish}>
            完成本课，领取家庭练习 ✓
          </button>
        ) : (
          <div className="flex gap-2">
            <textarea
              className="input max-h-28 min-h-[46px] flex-1 resize-none"
              placeholder="回应讲师的问题，或随时提问…"
              value={input}
              disabled={busy}
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
              disabled={!input.trim() || busy}
              onClick={send}
            >
              发送
            </button>
          </div>
        )}
      </footer>
    </main>
  );
}

export default function LessonPage() {
  return (
    <Suspense>
      <LessonInner />
    </Suspense>
  );
}
