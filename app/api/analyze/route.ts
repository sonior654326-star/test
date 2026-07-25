import { NextResponse } from "next/server";
import { MECHANISM_LABELS } from "@/lib/types";
import { clientIp, dailyCap, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/analyze  { frames: string[](dataURL jpeg), context?: string }
// 用多模态模型对用户本地抽取的视频帧做 14 维场景拆解，返回结构化草稿。
// 视频文件本身从不上传：浏览器端抽帧，这里只收到少量图片。

const MAX_FRAMES = 8;

export async function POST(req: Request) {
  // 防盗刷：每 IP 每分钟 2 次、每天 20 次；全站每天上限（额度保险丝）
  const ip = clientIp(req);
  if (
    !rateLimit(`az:m:${ip}`, 2, 60_000) ||
    !rateLimit(`az:d:${ip}`, 20, 86_400_000)
  ) {
    return NextResponse.json(
      { error: "请求太频繁，请稍后再试" },
      { status: 429 },
    );
  }
  if (!dailyCap(Number(process.env.ANALYZE_DAILY_CAP || 200))) {
    return NextResponse.json(
      { error: "今日分析额度已用完，明天再来" },
      { status: 429 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "视频分析需要配置 OPENAI_API_KEY（Vercel → Settings → Environment Variables）" },
      { status: 501 },
    );
  }
  const baseUrl = (
    process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
  ).replace(/\/$/, "");
  // 视觉任务优先用 OPENAI_VISION_MODEL（如 Sakana 的 fugu-ultra），
  // 未配置时退回 OPENAI_MODEL，再退回 gpt-4o-mini
  const visionModel =
    process.env.OPENAI_VISION_MODEL ||
    process.env.OPENAI_MODEL ||
    "gpt-4o-mini";

  let frames: string[] = [];
  let context = "";
  try {
    const body = await req.json();
    frames = Array.isArray(body?.frames) ? body.frames.slice(0, MAX_FRAMES) : [];
    context = String(body?.context ?? "").slice(0, 1000);
  } catch {
    // fallthrough
  }
  frames = frames.filter(
    (f) => typeof f === "string" && f.startsWith("data:image/") && f.length < 600_000,
  );
  if (frames.length === 0) {
    return NextResponse.json({ error: "没有收到有效的视频帧" }, { status: 400 });
  }

  const mechanismList = Object.entries(MECHANISM_LABELS)
    .map(([k, v]) => `${k}（${v}）`)
    .join("、");

  const systemPrompt = `你是「想象引擎 ImagineLab」的场景分析引擎，专门把影视/视频中的人机交互场景拆解为可迁移的产品机制。
用户会给你一段视频的关键帧（按时间顺序）和可选的背景说明。你输出一份结构化拆解草稿，严格遵守：
1) 写"机制"不写"剧情复述"：每一维都要对 AI 产品设计师有迁移价值（检验：遮住作品名这句话是否仍然有用）。
2) 只基于画面与用户说明中可见/可推断的内容，看不出的维度诚实写"画面中无法判断"。
3) 观察问题只提问不下结论，指向具体瞬间。
只输出 JSON，结构如下：
{
 "sceneTitle": "给场景起个名字",
 "summary": "2-3句场景概述",
 "aiForm": "AI 的存在形态（若无AI则描述核心交互体）",
 "mechanisms": ["从这些标签中选1-5个: ${mechanismList}，只输出英文标签"],
 "analysis": {"humanGoal":"","aiGoal":"","trigger":"","aiAction":"","humanReaction":"","feedbackLoop":"","emotionChange":"","trustChange":"","permissionModel":"","memoryModel":"","failureMode":"","recovery":"","relationshipShift":"","environmentRole":""},
 "agentViews": {
   "observationPrompts": ["3个只提问不下结论的观察问题"],
   "empathy": "同理心视角：场景中人的真实感受与需求，最后落到产品含义",
   "productInspiration": ["3个命名的可迁移机制"],
   "applicableProducts": ["3-4个可落地的产品方向"]
 }
}`;

  const userContent: object[] = [
    {
      type: "text",
      text: `这是一段视频的 ${frames.length} 张关键帧（按时间顺序）。${context ? `背景说明：${context}` : "（用户未提供背景说明）"}`,
    },
    ...frames.map((f) => ({
      type: "image_url",
      image_url: { url: f, detail: "low" },
    })),
  ];

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 55000);
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: visionModel,
        temperature: 0.5,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      }),
    }).finally(() => clearTimeout(timer));

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      let error = `模型调用失败（HTTP ${res.status}）`;
      if (res.status === 401 || res.status === 403) {
        error =
          `密钥被服务商拒绝（HTTP ${res.status}）。请检查：` +
          `1) OPENAI_API_KEY 的值是否复制正确、无多余空格；` +
          `2) Sakana 账号是否已开通额度/计费；` +
          `3) OPENAI_BASE_URL 是否为 https://api.sakana.ai/v1`;
      } else if (res.status === 404) {
        error = `模型不存在（HTTP 404）。视频分析需要视觉模型，请把 OPENAI_VISION_MODEL 设为 fugu-ultra`;
      }
      return NextResponse.json(
        { error, detail: detail.slice(0, 400) },
        { status: 502 },
      );
    }
    const data = await res.json();
    const draft = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
    return NextResponse.json({ draft });
  } catch {
    return NextResponse.json({ error: "分析超时或网络错误，请重试" }, { status: 502 });
  }
}
