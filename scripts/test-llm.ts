// 实测 LangChain 内核：普通对话 + chatJson 结构化校验（真实网关调用）
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const { chatCompletion, chatJson } = await import("../lib/llm.ts");
const { z } = await import("zod");

const t0 = Date.now();
const ping = await chatCompletion([
  { role: "system", content: "你是星童猫咪，一个温暖的自闭症家庭干预伙伴。" },
  { role: "user", content: "用一句话向家长打招呼。" },
]);
console.log(`[1] 普通对话 OK (${Date.now() - t0}ms):`, ping.slice(0, 80));

const t1 = Date.now();
const data = await chatJson(
  [{ role: "user", content: "家长说：孩子今天在幼儿园主动和小朋友分享玩具了。请给出回应。" }],
  z.object({
    reply: z.string(),
    mood: z.enum(["encourage", "neutral", "concern"]),
  })
);
console.log(`[2] chatJson zod 校验通过 (${Date.now() - t1}ms):`, JSON.stringify(data).slice(0, 120));
console.log("全部通过 ✅");
