"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { MECHANISM_LABELS, type MechanismTag } from "@/lib/types";

// 上传视频 → 浏览器本地抽帧（视频不上传服务器）→ 多模态模型 14 维拆解草稿

const FRAME_COUNT = 8;
const FRAME_WIDTH = 480;

const muted = (p: number) =>
  ({ color: `color-mix(in srgb, var(--color-text) ${p}%, transparent)` }) as const;

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

  const panel = {
    border: "1px solid var(--color-divider)",
    borderRadius: "var(--radius-lg)",
    background: "var(--color-surface)",
    padding: 20,
  } as const;

  return (
    <div className="lab-grid">
      <nav
        className="nav"
        style={{
          maxWidth: 780,
          margin: "0 auto",
          paddingLeft: "clamp(20px,5vw,48px)",
          paddingRight: "clamp(20px,5vw,48px)",
        }}
      >
        <span className="nav-brand">
          想象引擎{" "}
          <span style={{ fontStyle: "italic", color: "var(--color-accent-700)" }}>
            ImagineLab
          </span>
        </span>
        <Link href="/">← 返回档案</Link>
      </nav>

      <main
        style={{
          maxWidth: 780,
          margin: "0 auto",
          padding: "clamp(32px,5vw,52px) clamp(20px,5vw,48px) 80px",
        }}
      >
        <h1
          className="display"
          style={{
            fontWeight: 400,
            fontSize: "clamp(30px,4.4vw,48px)",
            lineHeight: 1.08,
            margin: 0,
          }}
        >
          上传视频，拆解机制{" "}
          <span style={{ fontSize: 15, color: "var(--color-accent-700)" }}>Beta</span>
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.7, margin: "16px 0 0", ...muted(75) }}>
          上传一段人机交互场景的视频（影视片段、产品 demo、机器人视频……），AI
          将生成 14 维机制拆解草稿。
          <span style={muted(55)}>
            {" "}
            视频只在你的浏览器里处理，不会上传到服务器——发送给模型的只有 {FRAME_COUNT} 张关键帧。
          </span>
        </p>

        {/* 上传区 */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFile(e.dataTransfer.files?.[0]);
          }}
          style={{
            marginTop: 24,
            cursor: "pointer",
            border: "1px dashed var(--color-accent)",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-accent-100)",
            padding: 32,
            textAlign: "center",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            style={{ display: "none" }}
            onChange={(e) => onFile(e.target.files?.[0] ?? undefined)}
          />
          <p className="serif" style={{ fontSize: 18, fontWeight: 600, margin: 0, color: "var(--color-accent-900)" }}>
            {fileName ? `已选择：${fileName}` : "点击选择或拖入视频文件"}
          </p>
          <p style={{ fontSize: 12.5, margin: "6px 0 0", color: "var(--color-accent-800)" }}>
            推荐 mp4/webm，几十秒到几分钟的片段效果最好
          </p>
        </div>

        {phase === "extracting" && (
          <p style={{ marginTop: 16, fontSize: 14, ...muted(50) }}>正在本地抽取关键帧……</p>
        )}

        {/* 帧预览 */}
        {frames.length > 0 && (
          <>
            <div
              style={{
                marginTop: 20,
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 8,
              }}
            >
              {frames.map((f, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={f}
                  alt={`帧 ${i + 1}`}
                  style={{ width: "100%", borderRadius: 8, border: "1px solid var(--color-divider)" }}
                />
              ))}
            </div>
            <textarea
              className="input"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={2}
              placeholder="（可选）背景说明：出自什么作品/产品？场景里发生了什么？"
              style={{ marginTop: 16, fontSize: 14 }}
            />
            <button
              onClick={analyze}
              disabled={phase === "analyzing"}
              className="btn btn-primary"
              style={{ marginTop: 14, opacity: phase === "analyzing" ? 0.5 : 1 }}
            >
              {phase === "analyzing" ? "分析中（约 20-40 秒）……" : "开始机制拆解 →"}
            </button>
          </>
        )}

        {error && (
          <p
            style={{
              marginTop: 16,
              whiteSpace: "pre-wrap",
              borderRadius: "var(--radius-md)",
              border: "1px solid #d9a3a3",
              background: "#f6e9e6",
              padding: 12,
              fontSize: 14,
              color: "#8a3030",
            }}
          >
            {error}
          </p>
        )}

        {/* 拆解结果 */}
        {draft && (
          <section style={{ marginTop: 40 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p
                className="num"
                style={{
                  fontSize: 12,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--color-accent-700)",
                  margin: 0,
                }}
              >
                拆解草稿
              </p>
              <button
                onClick={copyJson}
                className="btn btn-secondary"
                style={{ fontSize: 12, padding: "6px 14px" }}
              >
                复制 JSON
              </button>
            </div>

            <div style={{ ...panel, marginTop: 14 }}>
              <h3 className="serif" style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>
                {draft.sceneTitle || "未命名场景"}
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.7, margin: "10px 0 0", ...muted(82) }}>
                {draft.summary}
              </p>
              {draft.aiForm && (
                <p style={{ fontSize: 13, margin: "8px 0 0", ...muted(52) }}>
                  AI 形态：{draft.aiForm}
                </p>
              )}
              <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 7 }}>
                {(draft.mechanisms ?? []).map((m) => (
                  <span key={m} className="tag tag-outline">
                    {MECHANISM_LABELS[m as MechanismTag] ?? m}
                  </span>
                ))}
              </div>
            </div>

            {draft.analysis && (
              <div style={{ ...panel, marginTop: 16 }}>
                <p style={{ fontSize: 13, margin: 0, ...muted(55) }}>14 维机制拆解</p>
                <dl style={{ margin: "12px 0 0" }}>
                  {DIMENSION_LABELS.filter(({ key }) => draft.analysis?.[key]).map(
                    ({ key, label }) => (
                      <div
                        key={key}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "6.5rem 1fr",
                          gap: 12,
                          padding: "10px 0",
                          borderBottom: "1px solid var(--color-divider)",
                        }}
                      >
                        <dt className="num" style={{ fontSize: 13, paddingTop: 1, ...muted(50) }}>
                          {label}
                        </dt>
                        <dd style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, ...muted(85) }}>
                          {draft.analysis![key]}
                        </dd>
                      </div>
                    ),
                  )}
                </dl>
              </div>
            )}

            {draft.agentViews && (
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
                {!!draft.agentViews.observationPrompts?.length && (
                  <div style={panel}>
                    <p style={{ fontSize: 13, margin: 0, ...muted(55) }}>
                      原始观察（自己去看的问题）
                    </p>
                    <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                      {draft.agentViews.observationPrompts.map((p, i) => (
                        <li key={i} style={{ display: "flex", gap: 12, fontSize: 15, lineHeight: 1.65, ...muted(85) }}>
                          <span className="num" style={{ color: "var(--color-accent-700)" }}>
                            {i + 1}
                          </span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {draft.agentViews.empathy && (
                  <div style={panel}>
                    <p style={{ fontSize: 13, margin: 0, ...muted(55) }}>同理心视角</p>
                    <p
                      style={{
                        margin: "12px 0 0",
                        borderLeft: "2px solid var(--color-accent)",
                        paddingLeft: 16,
                        fontSize: 15.5,
                        lineHeight: 1.75,
                        ...muted(85),
                      }}
                    >
                      {draft.agentViews.empathy}
                    </p>
                  </div>
                )}
                {!!draft.agentViews.productInspiration?.length && (
                  <div style={panel}>
                    <p style={{ fontSize: 13, margin: 0, ...muted(55) }}>产品启发</p>
                    <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                      {draft.agentViews.productInspiration.map((p, i) => (
                        <li key={i} style={{ display: "flex", gap: 12, fontSize: 15, lineHeight: 1.65, ...muted(85) }}>
                          <span style={{ color: "var(--color-accent-700)" }}>→</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                    {!!draft.agentViews.applicableProducts?.length && (
                      <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {draft.agentViews.applicableProducts.map((p) => (
                          <span key={p} className="tag tag-accent" style={{ fontSize: 13, padding: "5px 12px" }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <p style={{ marginTop: 16, fontSize: 12.5, lineHeight: 1.7, ...muted(50) }}>
              这是 AI 草稿：入库前请人工校对（判断标准见 DATA.md）。上传的视频未被存储；仅关键帧被发送给模型用于本次分析。
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
