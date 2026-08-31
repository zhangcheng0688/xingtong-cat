// LLM 客户端（LangChain 内核）：走 OpenAI 兼容接口（KIMI_BASE_URL / KIMI_API_KEY）
//
// 稳定性四件套（2026-08-31 用户决策：采纳 LangChain 作底座）：
//   1. 超时 —— ChatOpenAI timeout=30s，请求不再无限悬挂
//   2. 重试 —— withRetry(stopAfterAttempt=3)，指数退避，抖动/限流自动恢复
//   3. 降级 —— 配置 XINGTONG_FALLBACK_MODEL 后主模型连续失败自动切备用模型
//   4. 结构化校验 —— chatJson() 用 zod 校验模型输出，不合规自动修复重试一次
//
// 对外签名保持兼容：chatCompletion / extractJson 原样导出，agents.ts 无需改动。
import { ChatOpenAI } from "@langchain/openai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { Runnable } from "@langchain/core/runnables";
import { z } from "zod";

const BASE_URL = process.env.KIMI_BASE_URL ?? "https://agent-gw.kimi.com/coding/v1";
const API_KEY = process.env.KIMI_API_KEY ?? "";
const MODEL = process.env.XINGTONG_MODEL ?? "k3-agent";
const FALLBACK_MODEL = process.env.XINGTONG_FALLBACK_MODEL ?? "";
const TIMEOUT_MS = Number(process.env.XINGTONG_LLM_TIMEOUT_MS ?? 30_000);

export interface ChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

type LcMessage = [role: "system" | "user" | "assistant", content: string];

// 普通/JSON 两种模式各缓存一条链（JSON 模式需在模型层绑定 response_format）
const chainCache = new Map<string, Runnable<LcMessage[], unknown>>();

function buildModel(
  model: string,
  jsonMode: boolean,
  tempOpt: { temperature?: number } = {}
): BaseChatModel {
  return new ChatOpenAI({
    model,
    apiKey: API_KEY,
    configuration: { baseURL: BASE_URL },
    timeout: TIMEOUT_MS,
    maxRetries: 0, // 重试统一交给 withRetry，避免双重退避
    ...tempOpt,
    ...(jsonMode ? { modelKwargs: { response_format: { type: "json_object" } } } : {}),
  });
}

function getChain(jsonMode: boolean, temperature?: number): Runnable<LcMessage[], unknown> {
  if (!API_KEY) throw new Error("缺少 KIMI_API_KEY 环境变量");
  // temperature 属于模型参数而非调用配置，纳入缓存键
  const key = `${jsonMode ? "json" : "plain"}:${temperature ?? "d"}`;
  const cached = chainCache.get(key);
  if (cached) return cached;

  const tempOpt = temperature !== undefined ? { temperature } : {};
  const primary = buildModel(MODEL, jsonMode, tempOpt).withRetry({ stopAfterAttempt: 3 });
  const chain = FALLBACK_MODEL
    ? primary.withFallbacks([
        buildModel(FALLBACK_MODEL, jsonMode, tempOpt).withRetry({ stopAfterAttempt: 2 }),
      ])
    : primary;
  chainCache.set(key, chain as Runnable<LcMessage[], unknown>);
  return chain as Runnable<LcMessage[], unknown>;
}

function contentToString(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) =>
        part && typeof part === "object" && "text" in part ? String((part as { text: unknown }).text) : ""
      )
      .join("");
  }
  return "";
}

export async function chatCompletion(
  messages: ChatMsg[],
  opts: { temperature?: number; json?: boolean } = {}
): Promise<string> {
  const chain = getChain(Boolean(opts.json), opts.temperature);
  const lcMessages = messages.map((m): LcMessage => [m.role, m.content]);
  const result = await chain.invoke(lcMessages);
  const content = contentToString((result as { content?: unknown })?.content);
  if (!content) throw new Error("LLM 返回为空");
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

// 结构化输出：JSON 模式调用 + zod 校验；不合规时自动要求模型修复重试一次
export async function chatJson<S extends z.ZodType>(
  messages: ChatMsg[],
  schema: S,
  opts: { temperature?: number } = {}
): Promise<z.output<S>> {
  // 把目标结构显式告诉模型（zod v4 可导出 JSON Schema），否则它只能瞎猜字段
  const schemaHint: ChatMsg = {
    role: "system",
    content: `你必须严格按以下 JSON Schema 输出，只输出一个 JSON 对象，不要输出任何解释或 Markdown 代码块：\n${JSON.stringify(
      z.toJSONSchema(schema)
    )}`,
  };
  const guided: ChatMsg[] = [schemaHint, ...messages];

  const first = await chatCompletion(guided, { ...opts, json: true });
  const parsed = schema.safeParse(extractJson(first));
  if (parsed.success) return parsed.data;

  const issues = parsed.error.issues
    .map((i) => `${i.path.join(".") || "(根)"}: ${i.message}`)
    .join("; ");
  const repair: ChatMsg[] = [
    ...guided,
    { role: "assistant", content: first },
    {
      role: "user",
      content: `你上次的输出不符合约定的 JSON 结构（${issues}）。请修正后只输出一个合法的 JSON 对象，不要输出任何解释、Markdown 代码块或其他文字。`,
    },
  ];
  const second = await chatCompletion(repair, { ...opts, json: true });
  const reparsed = schema.safeParse(extractJson(second));
  if (!reparsed.success) {
    throw new Error(`模型输出结构校验失败: ${reparsed.error.issues[0]?.message ?? "未知原因"}`);
  }
  return reparsed.data;
}
