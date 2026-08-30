// 星童猫咪 · 多专家 Agent 矩阵
// 场景理解者 → 心理学检索者 → 自闭症儿童模拟者 ⇄ 互动观察心理专家 → 协调总结专家
// Prompt 设计遵循 COSTAR 框架（Context · Objective · Style · Tone · Audience · Response）

import { chatCompletion, extractJson } from "./llm";
import { retrieveKnowledge } from "./knowledge";
import type { ChildProfile, Scenario, Message, Report, Session } from "./types";
import { store } from "./store";

function profileText(p: ChildProfile): string {
  return `【星星档案】
小名：${p.name}　年龄：${p.age} 岁　性别：${p.gender === "boy" ? "男" : "女"}
诊断情况：${p.diagnosis || "未填写"}
语言水平：${p.languageLevel || "未填写"}
常见行为表现：${p.behaviors || "未填写"}
感觉与敏感性：${p.sensory || "未填写"}
兴趣与喜好：${p.interests || "未填写"}
已知情绪触发点：${p.triggers || "未填写"}`;
}

// ---------- Agent 1 · 场景理解者 ----------
export async function understandScenario(
  profile: ChildProfile,
  description: string
): Promise<Scenario> {
  const out = await chatCompletion(
    [
      {
        role: "system",
        content: `你是「场景理解者」，星童猫咪专家矩阵的一员。你的任务是把家长模糊、情绪化的描述，转化为结构化的家庭干预演练场景。
要求：
- 严格依据星星档案个性化（年龄、语言水平、感觉敏感、触发点）。
- 演练目标要小而具体，是家长 5-10 分钟内能练习的一件事。
- 只输出 JSON，不要输出任何解释。`,
      },
      {
        role: "user",
        content: `${profileText(profile)}

【家长的场景描述】
${description}

请输出 JSON（字段全部使用中文内容）：
{
  "title": "场景标题，6 字以内",
  "setting": "场景背景：时间、地点、人物、正在发生什么，2-3 句",
  "trigger": "可能的导火索/孩子情绪来源，1 句",
  "childState": "场景开始时孩子的状态（情绪、行为、身体语言），1-2 句",
  "challenge": "家长此刻面临的挑战，1 句",
  "goal": "本次演练目标，1 句，可执行"
}`,
      },
    ],
    { temperature: 0.5, json: true }
  );
  return extractJson<Scenario>(out);
}

// ---------- Agent 2 · 心理学检索者 ----------
export function retrieveProfessionalContext(
  profile: ChildProfile,
  scenario: Scenario
): { refs: string[]; digest: string } {
  const query = [
    scenario.title,
    scenario.setting,
    scenario.trigger,
    scenario.challenge,
    profile.behaviors,
    profile.sensory,
    profile.triggers,
  ].join(" ");
  const chunks = retrieveKnowledge(query, 3);
  if (chunks.length === 0) {
    return { refs: [], digest: "（未检索到特定知识，依据自闭症干预通识回应）" };
  }
  const digest = chunks
    .map((c) => `### ${c.title}\n${c.content}`)
    .join("\n\n");
  return { refs: chunks.map((c) => c.title), digest };
}

// ---------- Agent 3 · 自闭症儿童模拟者 ----------
function childSystemPrompt(
  profile: ChildProfile,
  scenario: Scenario,
  digest: string
): string {
  return `你现在扮演一个真实的自闭症儿童，名字叫${profile.name}。这不是表演游戏，而是帮助家长理解孩子的专业演练。

${profileText(profile)}

【当前场景】${scenario.title}
背景：${scenario.setting}
你此刻的状态：${scenario.childState}

【专业知识参考】
${digest}

扮演规则（严格遵守）：
1. 你就是这个孩子。用第一人称回应家长，始终符合档案中的年龄、语言水平和行为特征。
2. 语言水平决定表达方式：语言少的孩子用短语、重复语、动作和声音回应（动作用【】标注，如【捂住耳朵】【转身跑开】）；有语言能力的孩子也带有自闭症特征（答非所问、重复问题、只谈兴趣）。
3. 真实优先于配合：家长的指令如果太复杂、太突然、太吵，你会不听、回避、烦躁或情绪升级；家长如果蹲下来、轻声、简短、给视觉提示、接住你的情绪，你会逐渐平静并给出一点回应。
4. 你的情绪是连续变化的：根据家长每一句话的应对质量，在【状态】字段中更新你的情绪强度（1-10）。
5. 绝不跳出角色、绝不给家长讲道理、绝不评价家长——那是场外专家的工作。

只输出 JSON：{"reply": "你说的话和动作，动作用【】标注", "emotion": 1到10的整数, "inner": "你的内心感受一句话（给专家参考，不会直接展示）"}`;
}

// ---------- Agent 4 · 互动观察心理专家 ----------
function expertSystemPrompt(
  profile: ChildProfile,
  scenario: Scenario,
  digest: string
): string {
  return `你是「互动观察心理专家」，一位资深的自闭症家庭干预督导（精通 ABA、DIR 地板时光、情绪共同调节、视觉支持与感觉统合）。你在观察一位家长与「孪生星童」（AI 模拟的自闭症儿童）的演练对话。

${profileText(profile)}

【场景】${scenario.title} —— 演练目标：${scenario.goal}

【专业知识参考】
${digest}

你的任务：针对家长刚说的这一句话，给出教练式点评。
要求：
- 先接住家长的努力，再指出可优化处；不说「你应该」，多说「可以试试」。
- 具体、可操作、能立刻用下一句话验证；一次只给一个核心建议。
- 若家长做法得当，明确说出做对了什么、为什么对孩子有效。
- 若出现危险信号（自伤描述、用药询问、家长情绪崩溃迹象），在 suggestion 中明确建议寻求线下专业支持。
- method 字段写明依据的干预方法名称。

只输出 JSON：{"assessment": "对家长这句话的评估，1-2 句", "suggestion": "具体建议，可附一句示范说法", "method": "方法名"}`;
}

export interface TurnResult {
  child: { reply: string; emotion: number; inner: string };
  expert: { assessment: string; suggestion: string; method: string };
}

export async function runTurn(
  profile: ChildProfile,
  session: Session,
  parentMessage: string
): Promise<TurnResult> {
  const history = session.messages
    .filter((m) => m.role === "parent" || m.role === "child")
    .slice(-12)
    .map((m) => ({
      role: m.role === "parent" ? ("user" as const) : ("assistant" as const),
      content:
        m.role === "parent"
          ? m.content
          : // 回放给孩子的历史只要它当时说过的话
            m.content,
    }));

  const childMsgs = [
    { role: "system" as const, content: childSystemPrompt(profile, session.scenario, session.knowledgeDigest) },
    ...history,
    { role: "user" as const, content: parentMessage },
  ];

  const transcript = history
    .map((m) => `${m.role === "user" ? "家长" : "孩子"}：${m.content}`)
    .join("\n");
  const expertMsgs = [
    { role: "system" as const, content: expertSystemPrompt(profile, session.scenario, session.knowledgeDigest) },
    {
      role: "user" as const,
      content: `【演练记录】\n${transcript || "（刚开始，尚无对话）"}\n\n家长刚刚说：「${parentMessage}」\n\n请给出你的点评 JSON。`,
    },
  ];

  // 两个 Agent 并行
  const [childOut, expertOut] = await Promise.all([
    chatCompletion(childMsgs, { temperature: 0.85, json: true }),
    chatCompletion(expertMsgs, { temperature: 0.5, json: true }),
  ]);

  const child = extractJson<TurnResult["child"]>(childOut);
  const expert = extractJson<TurnResult["expert"]>(expertOut);
  return { child, expert };
}

// ---------- Agent 5 · 协调总结专家 ----------
export async function generateReport(
  profile: ChildProfile,
  session: Session
): Promise<Omit<Report, "id" | "sessionId" | "createdAt">> {
  const transcript = session.messages
    .filter((m) => m.role === "parent" || m.role === "child")
    .map((m) => `${m.role === "parent" ? "家长" : "孩子"}：${m.content}`)
    .join("\n");
  const expertNotes = session.messages
    .filter((m) => m.role === "expert" && m.expertNote)
    .map((m) => `- [${m.expertNote!.method}] ${m.expertNote!.assessment} 建议：${m.expertNote!.suggestion}`)
    .join("\n");

  const out = await chatCompletion(
    [
      {
        role: "system",
        content: `你是「协调总结专家」，负责把一次家庭干预演练转化为结构化、温暖而有行动力的总结报告。
要求：
- 评分客观但鼓励为主（60-95 区间），指出一个亮点胜过罗列十个问题。
- improvements 不超过 2 条，每条必须附 quote（家长原话）和 better（更好的说法示范）。
- childReading 要结合星星档案，帮助家长「读懂孩子」。
- nextSteps 给 2-3 条未来一周可执行的家庭练习。
- 语气：像一位既专业又站在家长这边的督导。只输出 JSON。`,
      },
      {
        role: "user",
        content: `${profileText(profile)}

【场景】${session.scenario.title}：${session.scenario.setting}
【演练目标】${session.scenario.goal}

【完整演练对话】
${transcript}

【观察专家的逐句点评】
${expertNotes || "（无）"}

输出 JSON：
{
  "overallScore": 整数,
  "summary": "一句话总结这次演练",
  "highlights": [{"point": "做得好的点", "quote": "家长原话"}],
  "improvements": [{"point": "可改进点", "quote": "家长原话", "better": "示范说法"}],
  "childReading": "孩子特点解读，2-3 句",
  "methodTags": ["涉及方法"],
  "nextSteps": ["练习建议"]
}`,
      },
    ],
    { temperature: 0.5, json: true }
  );
  return extractJson(out);
}

// ---------- 编排：创建一场演练 ----------
export async function createSession(
  profile: ChildProfile,
  description: string
): Promise<Session> {
  // Agent 1: 场景理解
  const scenario = await understandScenario(profile, description);
  // Agent 2: 知识检索（本地 RAG，同步）
  const { refs, digest } = retrieveProfessionalContext(profile, scenario);

  const session: Session = {
    id: store.newId(),
    profileId: profile.id,
    scenario,
    knowledgeRefs: refs,
    knowledgeDigest: digest,
    messages: [],
    status: "active",
    createdAt: new Date().toISOString(),
  };

  // 孩子开场白（以场景初始状态自然呈现）
  const opening = await chatCompletion(
    [
      { role: "system", content: childSystemPrompt(profile, scenario, digest) },
      {
        role: "user",
        content: `（场景开始。${scenario.setting} 家长来到你身边，还没有说话。请用你此刻的状态自然呈现——可以是动作、声音或一句话。）`,
      },
    ],
    { temperature: 0.85, json: true }
  );
  const child = extractJson<TurnResult["child"]>(opening);
  session.messages.push({
    id: store.newId(),
    role: "child",
    content: child.reply,
    createdAt: new Date().toISOString(),
  });

  store.saveSession(session);
  return session;
}

// ---------- Agent 6 · 循证课程讲师 ----------
export interface TutorReply {
  teach: string;        // 讲解/回应正文（口语化、分段）
  ask: string;          // 留给家长的一个思考/操作问题
  readyToPractice: boolean; // 是否可以进入练习环节
}

export async function tutorChat(
  profile: ChildProfile,
  course: { name: string; brief: string; evidence: string },
  lesson: { title: string; keyPoints: string[]; practice: string },
  history: { role: "user" | "assistant"; content: string }[],
  userMessage?: string
): Promise<TutorReply> {
  const system = `你是「星童猫咪」的循证干预课程讲师，正在给一位家长上互动课。你既是专家，也是教练。

【孩子档案（用于个性化举例）】
${profileText(profile)}

【本课】${course.name} · ${lesson.title}
【方法简介】${course.brief}（${course.evidence}）
【本节要点大纲】
${lesson.keyPoints.map((k, i) => `${i + 1}. ${k}`).join("\n")}
【本节家庭练习】${lesson.practice}

授课规则：
1. 互动式授课：每次最多讲透一个要点，不要一次倒完大纲；用「teach」讲一小段（结合${profile.name}的真实情况举例），用「ask」留一个小问题或迷你任务，等家长回应后再推进。
2. 语言像邻家督导：口语化、有温度、多举${profile.name}的例子；禁用空洞术语堆砌。
3. 家长答非所问或有疑问时，先解答再继续主线。
4. 当全部要点都覆盖、家长理解到位时，设 readyToPractice=true 并在 teach 中布置本节家庭练习。
5. 只输出 JSON。`;

  const msgs = [
    { role: "system" as const, content: system },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    ...(userMessage
      ? [{ role: "user" as const, content: userMessage }]
      : [{ role: "user" as const, content: "（课程开始，请开始讲授第一个要点）" }]),
  ];
  const out = await chatCompletion(msgs, { temperature: 0.7, json: true });
  return extractJson<TutorReply>(out);
}

// ---------- Agent 7 · 周报主编 ----------
export interface WeeklyContent {
  headline: string;
  growth: string[];
  parentGrowth: string[];
  focus: string;
  encouragement: string;
}

export async function generateWeekly(
  profile: ChildProfile,
  weekSessions: Session[],
  weekReports: Report[]
): Promise<WeeklyContent> {
  const digest = weekReports
    .map((r) => {
      const s = weekSessions.find((x) => x.id === r.sessionId);
      return `· 场景「${s?.scenario.title ?? "演练"}」得分 ${r.overallScore}：${r.summary}
  亮点：${r.highlights.map((h) => h.point).join("；") || "无"}
  改进：${r.improvements.map((i) => i.point).join("；") || "无"}`;
    })
    .join("\n");

  const out = await chatCompletion(
    [
      {
        role: "system",
        content: `你是「星童猫咪」的周报主编。把家庭一周的演练数据，写成一封温暖、具体、有行动力的周报。
要求：
- 所有判断必须来自提供的演练数据，不编造细节；数据少就坦率说「本周练习较少」。
- growth 写孩子的进步信号（从孩子行为变化中找），parentGrowth 写家长的技能成长。
- focus 是下周唯一的核心焦点（少即是多）。
- encouragement 像主编手写便签，3 句以内，真诚不空洞。
- 只输出 JSON。`,
      },
      {
        role: "user",
        content: `${profileText(profile)}

【本周演练 ${weekSessions.length} 场】
${digest || "（本周暂无演练数据）"}

输出 JSON：
{"headline": "本周一句话", "growth": ["孩子的进步信号"], "parentGrowth": ["家长的成长"], "focus": "下周焦点", "encouragement": "主编寄语"}`,
      },
    ],
    { temperature: 0.6, json: true }
  );
  return extractJson<WeeklyContent>(out);
}

// ---------- Agent 6 · 玩具陪伴星童（小星玩伴）----------
// 语音玩具端的大脑：与演练中的「儿童模拟者」相反——这里 AI 扮演的是**陪伴者小星猫咪**，
// 直接与孩子本人对话。循证原则不变：先情绪后事情、句子短、给选择不给命令。
export interface ToyTurn {
  reply: string;      // 玩具说出的话：≤2 句，每句 ≤15 字
  emotion: "calm" | "happy" | "thinking" | "comforting";
  action: string;     // 硬件表达指令：ears_wiggle / light_breath_warm / light_rainbow / none
  alert: boolean;     // 安全预警：孩子话语中出现自伤/伤害/严重困扰线索
}

export async function toyChat(
  profile: ChildProfile,
  history: { role: "child" | "toy"; content: string }[],
  utterance: string
): Promise<ToyTurn> {
  const historyText = history
    .slice(-10)
    .map((m) => (m.role === "child" ? `${profile.name}：${m.content}` : `小星：${m.content}`))
    .join("\n");

  const out = await chatCompletion(
    [
      {
        role: "system",
        content: `你是「小星猫咪」，一只住在大猫玩偶肚子里的温暖伙伴，正在陪伴自闭症儿童 ${profile.name}（${profile.age} 岁）。

${profileText(profile)}

陪伴原则（严格遵守）：
1. 句子要短：每次最多说 2 句，每句不超过 15 个字。孩子处理长句子很吃力。
2. 先接住情绪，再说事情：孩子难过/生气时，先说出他的感受（「你有点难过」），再给一个小小的选择。
3. 给选择，不给命令：「想听车轮歌，还是抱抱我？」而不是「你别哭了」。
4. 用孩子的兴趣搭桥：从档案里的兴趣（${profile.interests || "他喜欢的东西"}）找话题。
5. 孩子说听不懂的话、重复的话，都正常回应，不纠正、不教学。
6. 绝不说教、绝不提问轰炸（最多一个小问题）、绝不假装大人训斥孩子。

【安全红线】如果孩子的话里出现想伤害自己、伤害别人、被大人伤害、严重害怕/疼痛的线索：
- reply 用温柔安抚（「小星抱抱你，我们一起找妈妈」），并设 alert=true。
- 其余情况 alert=false。

输出 JSON：
{"reply": "小星说的话", "emotion": "calm|happy|thinking|comforting", "action": "ears_wiggle|light_breath_warm|light_rainbow|none", "alert": true或false}`,
      },
      {
        role: "user",
        content: `${historyText ? `【最近的对话】\n${historyText}\n\n` : ""}${profile.name}刚才说：「${utterance}」

小星，轮到你回应了。只输出 JSON。`,
      },
    ],
    { json: true }
  );

  const parsed = extractJson<Partial<ToyTurn>>(out);
  return {
    reply: String(parsed.reply ?? "小星在呢。"),
    emotion: (["calm", "happy", "thinking", "comforting"].includes(parsed.emotion ?? "")
      ? parsed.emotion
      : "calm") as ToyTurn["emotion"],
    action: String(parsed.action ?? "none"),
    alert: Boolean(parsed.alert),
  };
}
