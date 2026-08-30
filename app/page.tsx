"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Landing() {
  const router = useRouter();
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setHasProfile((d.profiles ?? []).length > 0))
      .catch(() => {});
  }, []);

  return (
    <main className="app-shell relative flex flex-col overflow-hidden px-7 pb-10 pt-16">
      {/* 星光 */}
      <div className="pointer-events-none absolute -top-24 right-[-60px] h-64 w-64 rounded-full bg-star/15 blur-3xl" />
      <div className="pointer-events-none absolute top-40 left-[-80px] h-56 w-56 rounded-full bg-night/5 blur-3xl" />

      <div className="relative">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-star/40 bg-star/10 px-3 py-1 text-xs font-semibold tracking-wide text-stardeep">
          <span className="text-sm">✦</span> CARE AUTISM TOGETHER
        </div>

        <h1 className="font-serif text-[40px] leading-[1.2] tracking-tight text-night">
          星童猫咪
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-ink">
          让每个家庭都请得起一位
          <br />
          <span className="font-semibold text-stardeep">「懂孩子的干预专家」</span>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-inklight">
          AI 扮演你的孩子，陪你在安全的演练里学会正确的回应 —— 先懂孩子，再教孩子。
        </p>
      </div>

      {/* 核心三步 */}
      <div className="relative mt-10 space-y-3">
        {[
          { n: "01", t: "建一份星星档案", d: "诊断、行为、感觉与敏感、兴趣——孩子的数字孪生由此生成" },
          { n: "02", t: "一句话生成孪生场景", d: "描述发生了什么，AI 以孩子的身份与你实时演练" },
          { n: "03", t: "专家点评与总结报告", d: "每一句话都有专家督导，结束后收获结构化干预建议" },
        ].map((s) => (
          <div key={s.n} className="card flex gap-4 !p-4">
            <div className="font-serif text-xl text-stardeep/80">{s.n}</div>
            <div>
              <div className="text-[15px] font-semibold">{s.t}</div>
              <div className="mt-0.5 text-[13px] leading-relaxed text-inklight">{s.d}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative mt-auto pt-10">
        <button
          className="btn-primary"
          onClick={() => router.push(hasProfile && localStorage.getItem("xt_token") ? "/home" : "/login")}
        >
          {hasProfile ? "进入我的星童空间" : "登录，开始建立星星档案"}
          <span aria-hidden>→</span>
        </button>
        <p className="mt-4 text-center text-xs leading-relaxed text-inklight/70">
          本产品是家庭教育支持工具，不构成医疗诊断或治疗建议
        </p>
      </div>
    </main>
  );
}
