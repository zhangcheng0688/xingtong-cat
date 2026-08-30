"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ChildProfile, Session } from "@/lib/types";

// 浏览器语音识别（Chrome 系）的最小类型
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
};

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
  // 语音模式：孩子的话自动朗读；🎙️ 语音输入家长话术
  const [voiceOn, setVoiceOn] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenRef = useRef("");
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

  // 语音模式开启时，朗读最新的孩子消息（【动作】标注不读）
  useEffect(() => {
    if (!voiceOn || !session) return;
    const last = session.messages[session.messages.length - 1];
    if (last?.role === "child") void speak(last.content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.messages.length, voiceOn]);

  const speak = async (raw: string) => {
    const text = raw.replace(/【[^】]*】/g, "").trim();
    if (!text || text === lastSpokenRef.current) return;
    lastSpokenRef.current = text;
    setSpeaking(true);
    try {
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("cloud tts unavailable");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioRef.current?.pause();
      const a = new Audio(url);
      audioRef.current = a;
      a.onended = () => { setSpeaking(false); URL.revokeObjectURL(url); };
      a.onerror = () => setSpeaking(false);
      await a.play();
    } catch {
      // 云端未配置时降级到浏览器本地语音合成
      try {
        const synth = window.speechSynthesis;
        if (!synth) { setSpeaking(false); return; }
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "zh-CN";
        u.rate = 0.95;
        u.onend = () => setSpeaking(false);
        u.onerror = () => setSpeaking(false);
        synth.speak(u);
      } catch {
        setSpeaking(false);
      }
    }
  };

  const listen = () => {
    if (listening) return;
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) {
      setError("当前浏览器不支持语音识别（请用 Chrome）；配置 DASHSCOPE_API_KEY 后可走云端识别");
      return;
    }
    const rec = new SR();
    rec.lang = "zh-CN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    setListening(true);
    rec.onresult = (e) => {
      const text = e.results?.[0]?.[0]?.transcript ?? "";
      if (text) setInput((v) => (v ? `${v}，${text}` : text));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => { setListening(false); setError("没有听清，再试一次或直接打字"); };
    rec.start();
  };

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceOn((v) => !v)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                voiceOn ? "bg-star/20 text-stardeep" : "bg-mist/60 text-inklight"
              }`}
              title="开启后，孩子的话会读出来（云端 TTS 优先，浏览器本地合成兜底）"
            >
              {speaking ? "🔊 播放中" : voiceOn ? "🔊 语音开" : "🔇 语音关"}
            </button>
            <button
              onClick={() => setShowInfo((v) => !v)}
              className="text-xs text-inklight underline-offset-2 hover:underline"
            >
              {showInfo ? "收起" : "场景详情"}
            </button>
          </div>
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
                className={`self-end rounded-xl px-4 py-3 text-[15px] transition active:scale-95 ${
                  listening ? "animate-pulse bg-rose text-white" : "bg-mist/70 text-ink"
                }`}
                onClick={listen}
                disabled={sending}
                title="语音输入：说一句家长话术"
              >
                {listening ? "●" : "🎙️"}
              </button>
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
