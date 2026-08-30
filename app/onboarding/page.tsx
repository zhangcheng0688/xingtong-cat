"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STEPS = [
  { key: "basic", title: "认识一下小星星", hint: "先从一个名字开始" },
  { key: "diagnosis", title: "诊断与语言", hint: "帮助 AI 更准确地扮演孩子" },
  { key: "behavior", title: "行为与感觉", hint: "孩子的日常表现和敏感点" },
  { key: "interest", title: "兴趣与触发点", hint: "懂喜好，才懂安抚" },
];

const LANGUAGE_OPTS = ["无口语", "单词阶段", "短语短句", "能简单对话", "语言接近同龄"];
const BEHAVIOR_OPTS = ["叫名不应", "重复刻板动作", "情绪容易崩溃", "睡眠困难", "挑食明显", "不喜对视"];
const SENSORY_OPTS = ["怕噪音", "抗拒触摸", "挑食口感敏感", "喜欢旋转/跳跃", "怕强光", "衣物标签敏感"];
const INTEREST_OPTS = ["汽车/车轮", "数字/字母", "旋转的东西", "音乐", "绘本", "水/沙子", "灯光", "积木"];
const TRIGGER_OPTS = ["需求被拒绝", "环境嘈杂", "计划突然改变", "陌生环境", "排队等待", "大人催促"];

function ChipSelect({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            type="button"
            key={o}
            onClick={() => onToggle(o)}
            className={`rounded-full border px-3 py-1.5 text-[13px] transition ${
              on
                ? "border-star bg-star/15 font-semibold text-stardeep"
                : "border-mist bg-white/60 text-inklight hover:border-star/50"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "boy" as "boy" | "girl",
    diagnosis: "",
    languageLevel: "",
    behaviors: [] as string[],
    behaviorsExtra: "",
    sensory: [] as string[],
    sensoryExtra: "",
    interests: [] as string[],
    interestsExtra: "",
    triggers: [] as string[],
    triggersExtra: "",
  });

  const toggle = (key: "behaviors" | "sensory" | "interests" | "triggers", v: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v],
    }));

  const canNext =
    step === 0 ? form.name.trim().length > 0 && Number(form.age) > 0 : true;

  const join = (arr: string[], extra: string) =>
    [...arr, ...extra.split(/[,，、\s]+/).filter(Boolean)].join("、");

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          age: form.age,
          gender: form.gender,
          diagnosis: form.diagnosis,
          languageLevel: form.languageLevel,
          behaviors: join(form.behaviors, form.behaviorsExtra),
          sensory: join(form.sensory, form.sensoryExtra),
          interests: join(form.interests, form.interestsExtra),
          triggers: join(form.triggers, form.triggersExtra),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存失败");
      router.push(`/home?profile=${data.profile.id}`);
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <main className="app-shell flex flex-col px-7 pb-10 pt-8">
      {/* 进度 */}
      <div className="mb-8">
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s.key}
              className={`h-1 flex-1 rounded-full transition ${
                i <= step ? "bg-star" : "bg-mist"
              }`}
            />
          ))}
        </div>
        <div className="mt-4 font-serif text-2xl text-night">{STEPS[step].title}</div>
        <div className="mt-1 text-sm text-inklight">{STEPS[step].hint}</div>
      </div>

      <div className="flex-1 space-y-5">
        {step === 0 && (
          <>
            <div>
              <label className="label">孩子的小名</label>
              <input
                className="input"
                placeholder="如：乐乐"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">年龄</label>
              <input
                className="input"
                type="number"
                min={1}
                max={18}
                placeholder="如：4"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </div>
            <div>
              <label className="label">性别</label>
              <div className="grid grid-cols-2 gap-3">
                {(["boy", "girl"] as const).map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setForm({ ...form, gender: g })}
                    className={`rounded-xl border py-3 text-[15px] transition ${
                      form.gender === g
                        ? "border-star bg-star/15 font-semibold text-stardeep"
                        : "border-mist bg-white/60 text-inklight"
                    }`}
                  >
                    {g === "boy" ? "男孩" : "女孩"}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <label className="label">诊断情况</label>
              <textarea
                className="input min-h-[88px] resize-none"
                placeholder="如：2025 年在儿童医院确诊 ASD，中度；未诊断可填「尚未确诊，疑似」"
                value={form.diagnosis}
                onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
              />
            </div>
            <div>
              <label className="label">目前语言水平</label>
              <div className="space-y-2">
                {LANGUAGE_OPTS.map((o) => (
                  <button
                    type="button"
                    key={o}
                    onClick={() => setForm({ ...form, languageLevel: o })}
                    className={`w-full rounded-xl border px-4 py-2.5 text-left text-[14px] transition ${
                      form.languageLevel === o
                        ? "border-star bg-star/15 font-semibold text-stardeep"
                        : "border-mist bg-white/60 text-inklight"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="label">常见行为表现（可多选）</label>
              <ChipSelect options={BEHAVIOR_OPTS} selected={form.behaviors} onToggle={(v) => toggle("behaviors", v)} />
              <input
                className="input mt-3"
                placeholder="其他补充，如：会反复排列小汽车"
                value={form.behaviorsExtra}
                onChange={(e) => setForm({ ...form, behaviorsExtra: e.target.value })}
              />
            </div>
            <div>
              <label className="label">感觉与敏感性（可多选）</label>
              <ChipSelect options={SENSORY_OPTS} selected={form.sensory} onToggle={(v) => toggle("sensory", v)} />
              <input
                className="input mt-3"
                placeholder="其他补充，如：吹风机的声音会让他捂耳朵"
                value={form.sensoryExtra}
                onChange={(e) => setForm({ ...form, sensoryExtra: e.target.value })}
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <label className="label">兴趣与喜好（可多选）</label>
              <ChipSelect options={INTEREST_OPTS} selected={form.interests} onToggle={(v) => toggle("interests", v)} />
              <input
                className="input mt-3"
                placeholder="其他补充，如：特别喜欢电梯"
                value={form.interestsExtra}
                onChange={(e) => setForm({ ...form, interestsExtra: e.target.value })}
              />
            </div>
            <div>
              <label className="label">已知的情绪触发点（可多选）</label>
              <ChipSelect options={TRIGGER_OPTS} selected={form.triggers} onToggle={(v) => toggle("triggers", v)} />
              <input
                className="input mt-3"
                placeholder="其他补充，如：别人动他的东西"
                value={form.triggersExtra}
                onChange={(e) => setForm({ ...form, triggersExtra: e.target.value })}
              />
            </div>
          </>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-rose">{error}</p>}

      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <button className="btn-ghost border border-mist" onClick={() => setStep(step - 1)}>
            上一步
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button className="btn-primary" disabled={!canNext} onClick={() => setStep(step + 1)}>
            继续
          </button>
        ) : (
          <button className="btn-primary" disabled={submitting} onClick={submit}>
            {submitting ? "正在为" + (form.name || "孩子") + "点亮星星…" : "生成星星档案 ✦"}
          </button>
        )}
      </div>
    </main>
  );
}
