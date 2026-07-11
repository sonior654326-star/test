"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { MECHANISM_LABELS, type MechanismTag } from "@/lib/types";

// 上传视频 → 浏览器本地抽帧（视频不上传服务器）→ 多模态模型 14 维拆解草稿

const FRAME_COUNT = 8;
const FRAME_WIDTH = 480;

interface Draft {
  sceneTitle?: string;
  summary?: string;
  aiForm?: string;
  mechanisms?: string[];
  analysis?: Record<string, string>;
  agentViews?: {
    observationPrompts?: string[];
    empathy?: string;
    productInspiration?: string[];
    applicableProducts?: string[];
  };
}

const DIMENSION_LABELS: { key: string; label: string }[] = [
  { key: "humanGoal", label: "人的目标" },
  { key: "aiGoal", label: "AI 的目标" },
  { key: "trigger", label: "触发条件" },
  { key: "aiAction", label: "AI 的动作" },
  { key: "humanReaction", label: "人的反应" },
  { key: "feedbackLoop", label: "反馈回路" },
  { key: "emotionChange", label: "情绪变化" },
  { key: "trustChange", label: "信任变化" },
  { key: "permissionModel", label: "权限模型" },
  { key: "memoryModel", label: "记忆机制" },
  { key: "failureMode", label: "失败模式" },
  { key: "recovery", label: "恢复方式" },
  { key: "relationshipShift", label: "关系变化" },
  { key: "environmentRole", label: "环境角色" },
];

async function extractFrames(file: File): Promise<string[]> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("无法读取该视频文件"));
  });

  const duration = video.duration;
  if (!isFinite(duration) || duration <= 0) {
    URL.revokeObjectURL(url);
    throw new Error("无法读取视频时长");
  }

  const canvas = document.createElement("canvas");
  const scale = FRAME_WIDTH / video.videoWidth;
  canvas.width = FRAME_WIDTH;
  canvas.height = Math.round(video.videoHeight * scale);
  const ctx = canvas.getContext("2d")!;

  const frames: string[] = [];
  // 避开首尾各 3%，均匀取 FRAME_COUNT 帧
  for (let i = 0; i < FRAME_COUNT; i++) {
    const t = duration * (0.03 + (0.94 * i) / (FRAME_COUNT - 1));
    await new Promise<void>((resolve, reject) => {
      const onSeeked = () => {
        video.removeEventListener("seeked", onSeeked);
        resolve();
      };
      video.addEventListener("seeked", onSeeked);
      video.onerror = () => reject(new Error("视频解码失败"));
      video.currentTime = t;
    });
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    frames.push(canvas.toDataURL("image/jpeg", 0.7));
  }
  URL.revokeObjectURL(url);
  return frames;
}

export default function AnalyzePage() {
  const [frames, setFrames] = useState<string[]>([]);
  const [context, setContext] = useState("");
  const [phase, setPhase] = useState<"idle" | "extracting" | "analyzing" | "done">("idle");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setDraft(null);
    setFileName(file.name);
    setPhase("extracting");
    try {
      const fs = await extractFrames(file);
      setFrames(fs);
      setPhase("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "抽帧失败，请换一个视频格式（推荐 mp4）");
      setPhase("idle");
    }
  };

  const analyze = async () => {
    if (frames.length === 0) return;
    setPhase("analyzing");
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frames, context }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.detail
          ? `${data.error}\n\n服务商原文：${data.detail}`
          : data?.error || "分析失败";
        throw new Error(msg);
      }
      setDraft(data.draft);
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "分析失败，请重试");
      setPhase("idle");
    }
  };

  const copyJson = () => {
    if (draft) navigator.clipboard.writeText(JSON.stringify(draft, null, 2));
  };

  return (
    <main className="lab-grid flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <Link href="/" className="font-mono text-xs text-zinc-500 hover:text-teal-300">
          ← ImagineLab
        </Link>

        <h1 className="mt-6 text-2xl sm:text-3xl font-semibold text-zinc-50">
          上传视频，拆解机制 <span className="text-sm font-normal text-teal-300/80">Beta</span>
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          上传一段人机交互场景的视频（影视片段、产品 demo、机器人视频……），
          AI 将生成 14 维机制拆解草稿。
          <span className="text-zinc-500">
            视频只在你的浏览器里处理，不会上传到服务器——发送给模型的只有 {FRAME_COUNT} 张关键帧。
          </span>
        </p>

        {/* 上传区 */}
        <div
          className="mt-6 cursor-pointer rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-8 text-center transition hover:border-teal-400/50"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFile(e.dataTransfer.files?.[0]);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? undefined)}
          />
          <p className="text-zinc-300">
            {fileName ? `已选择：${fileName}` : "点击选择或拖入视频文件"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">推荐 mp4/webm，几十秒到几分钟的片段效果最好</p>
        </div>

        {phase === "extracting" && (
          <p className="mt-4 animate-pulse text-sm text-zinc-500">正在本地抽取关键帧……</p>
        )}

        {/* 帧预览 */}
        {frames.length > 0 && (
          <>
            <div className="mt-5 grid grid-cols-4 gap-2">
              {frames.map((f, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={f}
                  alt={`帧 ${i + 1}`}
                  className="rounded-md border border-zinc-800"
                />
              ))}
            </div>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={2}
              placeholder="（可选）背景说明：出自什么作品/产品？场景里发生了什么？"
              className="mt-4 w-full resize-none rounded-xl border border-zinc-700/80 bg-zinc-900/80 p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-teal-400/60 focus:outline-none"
            />
            <button
              onClick={analyze}
              disabled={phase === "analyzing"}
              className="mt-3 w-full rounded-xl bg-teal-400/90 py-3 font-medium text-zinc-950 transition hover:bg-teal-300 disabled:opacity-50 sm:w-auto sm:px-8"
            >
              {phase === "analyzing" ? "分析中（约 20-40 秒）……" : "开始机制拆解 →"}
            </button>
          </>
        )}

        {error && (
          <p className="mt-4 whitespace-pre-wrap rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {/* 拆解结果 */}
        {draft && (
          <section className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-xs tracking-[0.25em] text-teal-300/70 uppercase">
                拆解草稿
              </h2>
              <button
                onClick={copyJson}
                className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition hover:border-teal-400/40 hover:text-teal-200"
              >
                复制 JSON
              </button>
            </div>

            <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h3 className="text-xl font-semibold text-zinc-50">
                {draft.sceneTitle || "未命名场景"}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{draft.summary}</p>
              {draft.aiForm && (
                <p className="mt-2 text-xs text-zinc-500">AI 形态：{draft.aiForm}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(draft.mechanisms ?? []).map((m) => (
                  <span
                    key={m}
                    className="rounded-full border border-teal-400/30 bg-teal-400/10 px-2.5 py-0.5 text-xs text-teal-200"
                  >
                    {MECHANISM_LABELS[m as MechanismTag] ?? m}
                  </span>
                ))}
              </div>
            </div>

            {draft.analysis && (
              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-xs text-zinc-500">14 维机制拆解</p>
                <dl className="mt-3 divide-y divide-zinc-800/80">
                  {DIMENSION_LABELS.filter(({ key }) => draft.analysis?.[key]).map(
                    ({ key, label }) => (
                      <div key={key} className="grid grid-cols-[6.5rem_1fr] gap-3 py-2.5">
                        <dt className="pt-0.5 text-xs text-zinc-500">{label}</dt>
                        <dd className="text-sm leading-relaxed text-zinc-300">
                          {draft.analysis![key]}
                        </dd>
                      </div>
                    ),
                  )}
                </dl>
              </div>
            )}

            {draft.agentViews && (
              <div className="mt-4 space-y-4">
                {!!draft.agentViews.observationPrompts?.length && (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                    <p className="text-xs text-zinc-500">原始观察（自己去看的问题）</p>
                    <ul className="mt-3 space-y-3">
                      {draft.agentViews.observationPrompts.map((p, i) => (
                        <li key={i} className="flex gap-3 text-sm leading-relaxed text-zinc-200">
                          <span className="font-mono text-teal-300/70">{i + 1}</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {draft.agentViews.empathy && (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                    <p className="text-xs text-zinc-500">同理心视角</p>
                    <p className="mt-3 border-l-2 border-teal-400/40 pl-4 text-sm leading-loose text-zinc-200">
                      {draft.agentViews.empathy}
                    </p>
                  </div>
                )}
                {!!draft.agentViews.productInspiration?.length && (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                    <p className="text-xs text-zinc-500">产品启发</p>
                    <ul className="mt-3 space-y-3">
                      {draft.agentViews.productInspiration.map((p, i) => (
                        <li key={i} className="flex gap-3 text-sm leading-relaxed text-zinc-200">
                          <span className="text-teal-300/70">→</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                    {!!draft.agentViews.applicableProducts?.length && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {draft.agentViews.applicableProducts.map((p) => (
                          <span
                            key={p}
                            className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-xs text-zinc-300"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <p className="mt-4 text-xs leading-relaxed text-zinc-600">
              这是 AI 草稿：入库前请人工校对（判断标准见 DATA.md）。
              上传的视频未被存储；仅关键帧被发送给模型用于本次分析。
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
