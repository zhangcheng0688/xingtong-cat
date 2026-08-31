import fs from "fs";
import path from "path";
import type { KnowledgeChunk } from "./types";

// 知识检索双后端适配层（2026-08-31 用户决策：采纳 RAGFlow 作检索底座）
//   KNOWLEDGE_BACKEND=local    → 本地 Markdown 关键词检索（默认，零依赖）
//   KNOWLEDGE_BACKEND=ragflow  → RAGFlow HTTP API（需 RAGFLOW_* 三个环境变量）
// RAGFlow 不可达或检索失败时自动回退本地检索，保证演练流程永不中断。

const KB_DIR = path.join(process.cwd(), "data", "knowledge");

const BACKEND = process.env.KNOWLEDGE_BACKEND ?? "local";
const RAGFLOW_BASE_URL = (process.env.RAGFLOW_BASE_URL ?? "").replace(/\/$/, "");
const RAGFLOW_API_KEY = process.env.RAGFLOW_API_KEY ?? "";
// 支持逗号分隔多个 dataset
const RAGFLOW_DATASET_IDS = (process.env.RAGFLOW_DATASET_ID ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

let cache: KnowledgeChunk[] | null = null;

function parseFrontmatter(raw: string): { meta: Record<string, unknown>; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta: Record<string, unknown> = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const [, k, v] = kv;
    if (v.startsWith("[") && v.endsWith("]")) {
      meta[k] = v
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      meta[k] = v.trim();
    }
  }
  return { meta, body: m[2] };
}

export function loadKnowledge(): KnowledgeChunk[] {
  if (cache) return cache;
  if (!fs.existsSync(KB_DIR)) return [];
  cache = fs
    .readdirSync(KB_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const { meta, body } = parseFrontmatter(fs.readFileSync(path.join(KB_DIR, f), "utf-8"));
      return {
        id: f.replace(/\.md$/, ""),
        title: String(meta.title ?? f),
        tags: (meta.tags as string[]) ?? [],
        scenarios: (meta.scenarios as string[]) ?? [],
        methodId: String(meta.method_id ?? ""),
        content: body.trim(),
      };
    });
  return cache;
}

// 本地轻量检索：标题/标签/场景/正文关键词打分
export function retrieveLocal(query: string, topK = 3): KnowledgeChunk[] {
  const chunks = loadKnowledge();
  const tokens = query
    .replace(/[\s，。！？、,.!?「」""''：:；;（）()]/g, " ")
    .split(" ")
    .filter((t) => t.length > 0);
  // 单字也参与，中文按 2-gram 粗匹配
  const grams = new Set<string>();
  const flat = query.replace(/[\s，。！？、,.!?「」""''：:；;（）()]/g, "");
  for (let i = 0; i < flat.length - 1; i++) grams.add(flat.slice(i, i + 2));

  const scored = chunks.map((c) => {
    const hayTitle = c.title;
    const hayTags = c.tags.join(" ") + " " + c.scenarios.join(" ");
    const hayAll = hayTitle + " " + hayTags + " " + c.content;
    let score = 0;
    for (const t of tokens) {
      if (hayTitle.includes(t)) score += 5;
      if (hayTags.includes(t)) score += 4;
      else if (hayAll.includes(t)) score += 1;
    }
    for (const g of grams) {
      if (hayTitle.includes(g)) score += 2;
      if (hayTags.includes(g)) score += 2;
      else if (c.content.includes(g)) score += 0.2;
    }
    return { c, score };
  });
  return scored
    .filter((s) => s.score > 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.c);
}

// RAGFlow 检索：POST {base}/api/v1/retrieval（官方 HTTP API）
interface RagflowChunk {
  chunk_id?: string;
  content?: string;
  similarity?: number;
  document_id?: string;
  doc_name?: string;
}

async function retrieveRagflow(query: string, topK: number): Promise<KnowledgeChunk[]> {
  const res = await fetch(`${RAGFLOW_BASE_URL}/api/v1/retrieval`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RAGFLOW_API_KEY}`,
    },
    body: JSON.stringify({
      question: query,
      dataset_ids: RAGFLOW_DATASET_IDS,
      page: 1,
      page_size: topK,
      similarity_threshold: 0.2,
      vector_similarity_weight: 0.3,
      keyword: true,
    }),
    signal: AbortSignal.timeout(10_000), // 检索 10s 超时，超时走本地回退
  });
  if (!res.ok) throw new Error(`RAGFlow 检索失败 ${res.status}`);
  const data = (await res.json()) as {
    code?: number;
    data?: { chunks?: RagflowChunk[] };
  };
  if (data.code !== 0) throw new Error(`RAGFlow 返回错误码 ${data.code}`);
  return (data.data?.chunks ?? [])
    .filter((c) => typeof c.content === "string" && c.content.length > 0)
    .slice(0, topK)
    .map((c, i) => ({
      id: c.chunk_id ?? `ragflow-${i}`,
      title: c.doc_name ?? "RAGFlow 知识库",
      tags: [],
      scenarios: [],
      methodId: "",
      content: c.content as string,
    }));
}

export function ragflowConfigured(): boolean {
  return (
    BACKEND === "ragflow" &&
    Boolean(RAGFLOW_BASE_URL) &&
    Boolean(RAGFLOW_API_KEY) &&
    RAGFLOW_DATASET_IDS.length > 0
  );
}

// 统一入口：按 KNOWLEDGE_BACKEND 路由，RAGFlow 失败自动回退本地
export async function retrieveKnowledge(query: string, topK = 3): Promise<KnowledgeChunk[]> {
  if (ragflowConfigured()) {
    try {
      const chunks = await retrieveRagflow(query, topK);
      if (chunks.length > 0) return chunks;
      console.warn("[knowledge] RAGFlow 无命中，回退本地检索");
    } catch (err) {
      console.warn(`[knowledge] RAGFlow 不可用（${(err as Error).message}），回退本地检索`);
    }
  }
  return retrieveLocal(query, topK);
}
