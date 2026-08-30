// LLM 客户端：走 OpenAI 兼容接口（KIMI_BASE_URL / KIMI_API_KEY）
const BASE_URL = process.env.KIMI_BASE_URL ?? "https://agent-gw.kimi.com/coding/v1";
const API_KEY = process.env.KIMI_API_KEY ?? "";
const MODEL = process.env.XINGTONG_MODEL ?? "k3-agent";

export interface ChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatCompletion(
  messages: ChatMsg[],
  opts: { temperature?: number; json?: boolean } = {}
): Promise<string> {
  if (!API_KEY) throw new Error("缺少 KIMI_API_KEY 环境变量");
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM 调用失败 ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") throw new Error("LLM 返回为空");
  return content;
}

// 从模型输出中稳健提取 JSON 对象
export function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("模型输出中未找到 JSON");
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}
