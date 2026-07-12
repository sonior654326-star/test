"use client";

import Link from "next/link";
import { use, useState } from "react";
import { getSceneById } from "@/data/scenes";
import { MECHANISM_LABELS } from "@/lib/types";

// 认知视角的展示顺序刻意从「不下结论」到「给建议」：
// 原始观察 → 机制拆解 → 同理心视角 → 产品启发
const TABS = ["原始观察", "机制拆解", "同理心视角", "产品启发"] as const;
type Tab = (typeof TABS)[number];

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

const muted = (p: number) =>
  ({ color: `color-mix(in srgb, var(--color-text) ${p}%, transparent)` }) as const;

const panel = {
  border: "1px solid var(--color-divider)",
  borderRadius: "var(--radius-lg)",
  background: "var(--color-surface)",
  padding: 20,
} as const;

export default function ScenePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const scene = getSceneById(id);
  const [tab, setTab] = useState<Tab>("原始观察");

  if (!scene) {
    return (
      <main style={{ flex: 1, display: "grid", placeItems: "center", padding: 40 }}>
        <div style={{ textAlign: "center" }}>
          <p style={muted(60)}>场景不存在</p>
          <Link href="/">返回首页</Link>
        </div>
      </main>
    );
  }

  const a = scene.analysis as unknown as Record<string, string>;

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
          padding: "0 clamp(20px,5vw,48px) 80px",
        }}
      >
        {/* 头部 */}
        <header style={{ paddingTop: "clamp(36px,6vw,60px)" }}>
          <p className="num" style={{ fontSize: 13, margin: 0, ...muted(55) }}>
            <span style={{ fontStyle: "italic" }}>《{scene.work.title}》</span>{" "}
            {scene.work.originalTitle} · {scene.work.year} &nbsp;·&nbsp; {scene.position}
          </p>
          <h1
            className="display"
            style={{
              fontWeight: 400,
              fontSize: "clamp(32px,4.6vw,52px)",
              lineHeight: 1.08,
              margin: "12px 0 0",
              textWrap: "balance",
            }}
          >
            {scene.sceneTitle}
          </h1>
          <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 7 }}>
            {scene.mechanisms.map((m) => (
              <span key={m} className="tag tag-outline">
                {MECHANISM_LABELS[m]}
              </span>
            ))}
          </div>
        </header>

        {/* 视频 */}
        {scene.video && (
          <section style={{ marginTop: 28 }}>
            <figure className="plate">
              <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%" }}>
                <iframe
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                  src={`https://www.youtube-nocookie.com/embed/${scene.video.youtubeId}?rel=0`}
                  title={scene.video.label}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </figure>
            <p style={{ fontSize: 12, margin: "10px 0 0", ...muted(52) }}>
              🎬 {scene.video.label} · 来源：{scene.video.source}
            </p>
          </section>
        )}

        {/* 原始场景 */}
        <section style={{ ...panel, marginTop: 28 }}>
          <p style={{ fontSize: 15, lineHeight: 1.7, margin: 0, ...muted(85) }}>
            {scene.summary}
          </p>
          <div
            style={{
              marginTop: 16,
              display: "grid",
              gap: 12,
              fontSize: 13,
              gridTemplateColumns: "1fr",
              ...muted(58),
            }}
          >
            <p style={{ margin: 0 }}>
              <span style={muted(45)}>背景：</span>
              {scene.context}
            </p>
            <p style={{ margin: 0 }}>
              <span style={muted(45)}>AI 形态：</span>
              {scene.aiForm}
              <br />
              <span style={muted(45)}>角色：</span>
              {scene.characters.join("；")}
            </p>
          </div>
        </section>

        {/* 行业联想 */}
        {scene.industryLens && scene.industryLens.length > 0 && (
          <section
            style={{
              marginTop: 24,
              border: "1px solid var(--color-accent)",
              background: "var(--color-accent-100)",
              borderRadius: "var(--radius-lg)",
              padding: 20,
            }}
          >
            <p
              className="num"
              style={{
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-accent-700)",
                margin: 0,
              }}
            >
              如果你在做这些，先想想 · Industry Lens
            </p>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
              {scene.industryLens.map((l) => (
                <div
                  key={l.industry}
                  style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "baseline" }}
                >
                  <span className="tag tag-outline" style={{ flexShrink: 0 }}>
                    {l.industry}
                  </span>
                  <p style={{ flex: 1, minWidth: 220, margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "var(--color-accent-900)" }}>
                    {l.prompt}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 认知视角切换 */}
        <nav style={{ marginTop: 36, display: "flex", gap: 8, overflowX: "auto" }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={tab === t ? "btn btn-primary" : "btn btn-secondary"}
              style={{ whiteSpace: "nowrap", fontSize: 14, padding: "8px 16px" }}
            >
              {t}
            </button>
          ))}
        </nav>

        <section style={{ marginTop: 20 }}>
          {tab === "原始观察" && (
            <div style={panel}>
              <p style={{ fontSize: 13, margin: 0, ...muted(55) }}>
                先不要结论。带着这些问题，自己去看这个场景：
              </p>
              <ul style={{ margin: "16px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
                {scene.agentViews.observationPrompts.map((p, i) => (
                  <li key={i} style={{ display: "flex", gap: 12 }}>
                    <span className="num" style={{ color: "var(--color-accent-700)" }}>
                      {i + 1}
                    </span>
                    <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, ...muted(88) }}>{p}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === "机制拆解" && (
            <div style={panel}>
              <p style={{ fontSize: 13, margin: 0, ...muted(55) }}>
                从「剧情」到「机制」：这个场景里真正发生了什么。
              </p>
              <dl style={{ margin: "16px 0 0" }}>
                {DIMENSION_LABELS.map(({ key, label }) => (
                  <div
                    key={key}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "6.5rem 1fr",
                      gap: 12,
                      padding: "11px 0",
                      borderBottom: "1px solid var(--color-divider)",
                    }}
                  >
                    <dt className="num" style={{ fontSize: 13, paddingTop: 1, ...muted(50) }}>
                      {label}
                    </dt>
                    <dd style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, ...muted(85) }}>
                      {a[key]}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {tab === "同理心视角" && (
            <div style={panel}>
              <p style={{ fontSize: 13, margin: 0, ...muted(55) }}>
                场景中的人，真正的感受和需求是什么：
              </p>
              <p
                style={{
                  margin: "16px 0 0",
                  borderLeft: "2px solid var(--color-accent)",
                  paddingLeft: 16,
                  fontSize: 16,
                  lineHeight: 1.8,
                  ...muted(88),
                }}
              >
                {scene.agentViews.empathy}
              </p>
            </div>
          )}

          {tab === "产品启发" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={panel}>
                <p style={{ fontSize: 13, margin: 0, ...muted(55) }}>可迁移的机制：</p>
                <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                  {scene.agentViews.productInspiration.map((p, i) => (
                    <li key={i} style={{ display: "flex", gap: 12, fontSize: 15, lineHeight: 1.65, ...muted(88) }}>
                      <span style={{ color: "var(--color-accent-700)" }}>→</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={panel}>
                <p style={{ fontSize: 13, margin: 0, ...muted(55) }}>可能落地的产品方向：</p>
                <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {scene.agentViews.applicableProducts.map((p) => (
                    <span key={p} className="tag tag-accent" style={{ fontSize: 13, padding: "5px 12px" }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <footer
          style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: "1px solid var(--color-divider)",
            fontSize: 12.5,
            lineHeight: 1.7,
            ...muted(52),
          }}
        >
          本页为结构化研究拆解，不含影视片段；场景位置仅供你在正版渠道中查找原片。
        </footer>
      </main>
    </div>
  );
}
