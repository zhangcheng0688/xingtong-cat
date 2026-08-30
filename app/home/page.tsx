"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PRESET_SCENARIOS, type ChildProfile } from "@/lib/types";
import { authHeaders, readApiError, isCreditError } from "@/lib/client";
import TabBar from "@/components/TabBar";
import Mascot from "@/components/Mascot";

function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [custom, setCustom] = useState("");
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("xt_token")) {
      router.replace("/login");
      return;
    }
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        const profiles: ChildProfile[] = d.profiles ?? [];
        const want = searchParams.get("profile");
        const p = profiles.find((x) => x.id === want) ?? profiles[0] ?? null;
        setProfile(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    fetch("/api/credits", { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setBalance(d.balance))
      .catch(() => {});
  }, [searchParams]);

  const startScenario = async (desc: string, key: string) => {
    if (!profile) return;
    setCreating(key);
    setError("");
    try {
      const res = await fetch("/api/scenario", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ profileId: profile.id, description: desc }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "INSUFFICIENT_CREDITS") {
          setError(`CREDITS:${data.balance}:${data.need}`);
        } else {
          throw new Error(data.error || "创建失败");
        }
        setCreating(null);
        return;
      }
      router.push(`/session/${data.session.id}`);
    } catch (e) {
      setError((e as Error).message);
      setCreating(null);
    }
  };

  if (loading) {
    return (
      <main className="app-shell flex items-center justify-center">
        <div className="text-inklight">正在打开星童空间…</div>
      </main>
    );
  }

  if (!profile) {
    router.replace("/onboarding");
    return null;
  }

  return (
    <main className="app-shell flex flex-col px-6 pb-10 pt-8">
      {/* 吉祥物问候 + 积分入口 */}
      <div className="mb-5 flex items-end gap-3">
        <Mascot size={72} />
        <div className="msg-in relative mb-2 flex-1 rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 text-[13px] leading-relaxed text-ink shadow-soft">
          {profile.name}妈妈/爸爸，今天也来练一轮吧——在安全的地方，允许试错。
        </div>
        <button
          onClick={() => router.push("/billing")}
          className="mb-2 shrink-0 rounded-full border border-star/50 bg-star/10 px-3 py-1.5 text-xs font-semibold text-stardeep active:scale-[0.97]"
        >
          ✦ {balance ?? "…"} 积分
        </button>
      </div>

      {/* 孩子卡片 */}
      <div className="card relative overflow-hidden !border-0 !bg-night text-cream">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-star/20 blur-2xl" />
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-star/20 text-2xl">
            {profile.gender === "boy" ? "👦" : "👧"}
          </div>
          <div>
            <div className="font-serif text-xl">
              {profile.name} <span className="text-sm text-cream/60">· {profile.age} 岁</span>
            </div>
            <div className="mt-0.5 text-xs text-cream/70">{profile.languageLevel || "星星档案已建立"}</div>
          </div>
        </div>
        {profile.interests && (
          <div className="mt-3 text-xs leading-relaxed text-cream/60">喜欢：{profile.interests}</div>
        )}
      </div>

      {/* 预置场景 */}
      <div className="mt-8">
        <h2 className="font-serif text-lg text-night">常见场景，开箱即练</h2>
        <div className="mt-3 space-y-2.5">
          {PRESET_SCENARIOS.map((s) => (
            <button
              key={s.key}
              disabled={creating !== null}
              onClick={() => startScenario(`${s.title}：${s.desc}`, s.key)}
              className="card flex w-full items-center gap-4 !p-4 text-left transition hover:border-star/60 hover:shadow-lift disabled:opacity-60"
            >
              <div className="text-2xl">{s.icon}</div>
              <div className="flex-1">
                <div className="text-[15px] font-semibold">{s.title}</div>
                <div className="mt-0.5 text-[13px] text-inklight">{s.desc}</div>
              </div>
              <div className="text-inklight/50">
                {creating === s.key ? (
                  <span className="text-xs text-stardeep">构建中…</span>
                ) : (
                  <span aria-hidden>→</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 自定义场景 */}
      <div className="mt-8">
        <h2 className="font-serif text-lg text-night">描述你刚刚遇到的场景</h2>
        <p className="mt-1 text-[13px] text-inklight">
          一句话就行，比如「刚才在商场他非要买玩具，躺地上哭」
        </p>
        <textarea
          className="input mt-3 min-h-[80px] resize-none"
          placeholder="发生了什么？"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
        <button
          className="btn-primary mt-3"
          disabled={custom.trim().length < 2 || creating !== null}
          onClick={() => startScenario(custom, "custom")}
        >
          {creating === "custom" ? "多专家协作构建场景中…" : "生成孪生场景，开始演练 ✦"}
        </button>
        {creating && (
          <p className="mt-2 text-center text-xs text-inklight">
            场景理解者 → 心理学检索者 → 孪生星童生成中，约需 10-20 秒
          </p>
        )}
        {error && error.startsWith("CREDITS:") ? (
          <div className="mt-3 rounded-xl bg-rosebg p-4 text-[13px] leading-relaxed text-rose">
            积分用完了——小星还等着陪你练呢。
            <button
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-rose px-4 py-2 font-semibold text-white active:scale-[0.98]"
              onClick={() => router.push("/billing")}
            >
              去补充积分 →
            </button>
          </div>
        ) : (
          error && <p className="mt-3 text-sm text-rose">{error}</p>
        )}
      </div>
      <div className="pb-20" />
      <TabBar />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}
