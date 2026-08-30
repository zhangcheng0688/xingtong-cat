import fs from "fs";
import path from "path";
import type { KnowledgeChunk } from "./types";

const KB_DIR = path.join(process.cwd(), "data", "knowledge");

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

// 轻量检索：标题/标签/场景/正文关键词打分
export function retrieveKnowledge(query: string, topK = 3): KnowledgeChunk[] {
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
