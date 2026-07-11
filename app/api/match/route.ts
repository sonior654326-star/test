import { NextResponse } from "next/server";
import { localMatch } from "@/lib/match";
import { SCENES_WITH_WORK } from "@/data/scenes";
import type { MatchResponse } from "@/lib/types";

export const runtime = "nodejs";

// POST /api/match  { query: string }
// 无 OPENAI_API_KEY 时走纯本地匹配；有 key 时用 LLM 增强需求理解与重排。
// LLM 调用失败一律静默回退到本地结果，保证接口永远可用。

export async function POST(req: Request) {
  let query = "";
  try {
    const body = await req.json();
    query = String(body?.query ?? "").trim();
  } catch {
    // fallthrough
  }
  if (!query) {
    return NextResponse.json({ error: "请输入你正在思考的问题" }, { status: 400 });
  }
  if (query.length > 500) query = query.slice(0, 500);

  const local = localMatch(query);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json(local);

  try {
    const enhanced = await llmEnhance(query, local, apiKey);
    return NextResponse.json(enhanced);
  } catch {
    return NextResponse.json(local);
  }
}

async function llmEnhance(
  query: string,
  local: MatchResponse,
  apiKey: string,
): Promise<MatchResponse> {
  const catalog = SCENES_WITH_WORK.map(
    (s) =>
      `- id:${s.id}｜《${s.work.title}》${s.sceneTitle}｜机制:${s.mechanisms.join(",")}｜${s.summary.slice(0, 60)}`,
  ).join("\n");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "你是一个 AI 产品创新顾问。用户会描述正在思考的 AI 产品问题，你从给定的影视场景库中选出最能启发他的场景。" +
            "只输出 JSON：{productForm:string, coreQuestions:string[](最多4条，第一性问题), sceneIds:string[](按启发度排序，最多4个，只能用库中id), reasons:{[id]:string(一句话，说明该场景对他的问题有何启发)}}",
        },
        {
          role: "user",
          content: `用户的问题：${query}\n\n场景库：\n${catalog}`,
        },
      ],
    }),
  }).finally(() => clearTimeout(timer));

  if (!res.ok) throw new Error(`openai ${res.status}`);
  const data = await res.json();
  const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");

  const byId = new Map(SCENES_WITH_WORK.map((s) => [s.id, s]));
  const ids: string[] = Array.isArray(parsed.sceneIds) ? parsed.sceneIds : [];
  const results = ids
    .filter((id) => byId.has(id))
    .map((id, i) => ({
      scene: byId.get(id)!,
      score: 100 - i * 10,
      reason: String(parsed.reasons?.[id] ?? "LLM 推荐"),
    }));

  if (results.length === 0) throw new Error("empty llm result");

  return {
    understanding: {
      productForm: String(parsed.productForm || local.understanding.productForm),
      coreQuestions: Array.isArray(parsed.coreQuestions)
        ? parsed.coreQuestions.slice(0, 4).map(String)
        : local.understanding.coreQuestions,
      matchedMechanisms: local.understanding.matchedMechanisms,
    },
    results,
    llmEnhanced: true,
  };
}
