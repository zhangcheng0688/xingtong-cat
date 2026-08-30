// 星童猫咪 · 核心数据模型
export interface ChildProfile {
  id: string;
  name: string;              // 孩子小名
  age: number;
  gender: "boy" | "girl";
  diagnosis: string;         // 诊断情况，如「2025 年确诊 ASD，中度」
  languageLevel: string;     // 语言水平
  behaviors: string;         // 常见行为表现
  sensory: string;           // 感觉与敏感性
  interests: string;         // 兴趣与喜好
  triggers: string;          // 已知的情绪触发点
  createdAt: string;
}

export interface Scenario {
  title: string;
  setting: string;           // 场景背景（时间地点人物）
  trigger: string;           // 导火索
  childState: string;        // 孩子当下的状态
  challenge: string;         // 家长面临的挑战
  goal: string;              // 本次演练目标
}

export interface Message {
  id: string;
  role: "parent" | "child" | "expert" | "system";
  content: string;
  // expert 消息的附加结构
  expertNote?: {
    assessment: string;      // 对家长做法的评估
    suggestion: string;      // 具体建议
    method: string;          // 引用方法名
  };
  createdAt: string;
}

export interface Session {
  id: string;
  profileId: string;
  scenario: Scenario;
  knowledgeRefs: string[];   // 检索到的知识条目 title 列表
  knowledgeDigest: string;   // 检索知识摘要（注入各 Agent 上下文）
  messages: Message[];
  status: "active" | "ended";
  createdAt: string;
}

export interface Report {
  id: string;
  sessionId: string;
  overallScore: number;      // 0-100
  summary: string;           // 一句话总结
  highlights: { point: string; quote: string }[];      // 做得好的
  improvements: { point: string; quote: string; better: string }[]; // 可改进+示范说法
  childReading: string;      // 孩子特点解读
  methodTags: string[];      // 涉及方法
  nextSteps: string[];       // 未来注意事项/练习
  createdAt: string;
}

export interface KnowledgeChunk {
  id: string;
  title: string;
  tags: string[];
  scenarios: string[];
  methodId: string;
  content: string;
}

export const PRESET_SCENARIOS: { key: string; title: string; desc: string; icon: string }[] = [
  { key: "supermarket", title: "超市购物", desc: "孩子在超市看到玩具非要买，被拒绝后开始哭闹", icon: "🛒" },
  { key: "mealtime", title: "吃饭哭喊", desc: "到了饭点，孩子拒绝坐上餐椅，哭喊挣扎", icon: "🍚" },
  { key: "toy-meltdown", title: "玩具情绪失控", desc: "积木搭不好倒了，孩子突然崩溃摔玩具", icon: "🧸" },
  { key: "going-out", title: "出门换鞋", desc: "要出门了，孩子不肯换鞋，越催越抗拒", icon: "👟" },
  { key: "bedtime", title: "睡前兴奋", desc: "睡觉时间到了，孩子反而兴奋尖叫、满屋跑", icon: "🌙" },
];
