// 实测知识检索：本地后端立即可用；RAGFlow 配好 KNOWLEDGE_BACKEND=ragflow 后走 HTTP
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const { retrieveKnowledge, ragflowConfigured, loadKnowledge } = await import("../lib/knowledge.ts");

const local = loadKnowledge();
console.log(`[0] 本地知识库装载 ${local.length} 篇：${local.map((c) => c.title).join("、")}`);

const query = "孩子在超市收银台排队时突然大哭大闹，躺地上打滚";
const t0 = Date.now();
const chunks = await retrieveKnowledge(query, 3);
console.log(
  `[1] 检索后端=${ragflowConfigured() ? "ragflow" : "local"} (${Date.now() - t0}ms)，命中 ${chunks.length} 条：`
);
for (const c of chunks) {
  console.log(`    - 《${c.title}》 ${c.content.slice(0, 50)}…`);
}
if (chunks.length === 0) throw new Error("检索无命中");
console.log("知识检索链路 OK ✅");
