"use client";

import Link from "next/link";
import { use, useState } from "react";
import { getDeepDive } from "@/data/deepdive";

function curvePath(points: [number, number][], dur: number): string {
  return points
    .map((p, i) => {
      const x = (p[0] / dur) * 1000;
      const y = 88 - p[1] * 80;
      return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}
function valueAt(points: [number, number][], t: number): number {
  for (let i = 0; i < points.length - 1; i++) {
    const [t0, v0] = points[i];
    const [t1, v1] = points[i + 1];
    if (t >= t0 && t <= t1) return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0 || 1);
  }
  return points[points.length - 1][1];
}

const muted = (p: number) =>
  ({ color: `color-mix(in srgb, var(--color-text) ${p}%, transparent)` }) as const;

function SectionHead({ no, title, en }: { no: string; title: string; en: string }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
        <span
          className="num"
          style={{
            fontSize: "clamp(34px,4vw,46px)",
            fontWeight: 400,
            color: "var(--color-accent)",
            lineHeight: 1,
          }}
        >
          {no}
        </span>
        <h2 style={{ fontWeight: 600, fontSize: "clamp(24px,2.8vw,32px)", margin: 0 }}>
          {title}
        </h2>
        <span
          style={{
            flex: 1,
            textAlign: "right",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            ...muted(45),
          }}
        >
          {en}
        </span>
      </div>
      <hr className="hr" style={{ margin: "18px 0 24px" }} />
    </>
  );
}

export default function DeepDivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const d = getDeepDive(id);
  const [agent, setAgent] = useState(0);

  if (!d) {
    return (
      <main style={{ flex: 1, display: "grid", placeItems: "center", padding: 40 }}>
        <div style={{ textAlign: "center" }}>
          <p style={muted(60)}>深挖内容不存在</p>
          <Link href="/">返回首页</Link>
        </div>
      </main>
    );
  }

  return (
    <div className="lab-grid">
      <nav
        className="nav"
        style={{
          maxWidth: 1040,
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
          maxWidth: 1040,
          margin: "0 auto",
          padding: "0 clamp(20px,5vw,48px) 96px",
        }}
      >
        {/* HEADER */}
        <header style={{ paddingTop: "clamp(40px,7vw,68px)", maxWidth: 760 }}>
          <p
            className="num"
            style={{
              fontSize: 12,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "var(--color-accent-700)",
              margin: "0 0 20px",
            }}
          >
            单素材深挖 · 一个素材挖到极限
          </p>
          <h1
            className="display"
            style={{
              fontWeight: 400,
              fontSize: "clamp(36px,5.4vw,64px)",
              lineHeight: 1.06,
              letterSpacing: "-0.01em",
              margin: 0,
              textWrap: "balance",
            }}
          >
            {d.title}
          </h1>
          <p className="num" style={{ fontSize: 13, margin: "18px 0 0", ...muted(55) }}>
            {d.workMeta}
          </p>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.72,
              margin: "20px 0 0",
              maxWidth: "60ch",
              ...muted(80),
            }}
          >
            {d.summary}
          </p>
        </header>

        <hr className="hr" style={{ margin: "44px 0" }} />

        {/* MATERIAL: 时间线（左） + 视频（右） */}
        <section className="flex flex-col gap-7 lg:grid lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-[clamp(28px,4vw,52px)]">
          {/* 时间线（桌面在左；手机在视频下方） */}
          <figure
            className="order-2 lg:order-1"
            style={{
              border: "1px solid var(--color-divider)",
              borderRadius: "var(--radius-md)",
              padding: "18px 18px 14px",
              margin: 0,
              background: "var(--color-surface)",
            }}
          >
            <figcaption
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 10,
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: 14,
                ...muted(55),
              }}
            >
              <span>机制时间轴</span>
              <span style={{ display: "flex", gap: 14, letterSpacing: "0.02em", textTransform: "none" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i style={{ display: "inline-block", width: 16, height: 2, background: "var(--color-accent)" }} />
                  信任
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i
                    style={{
                      display: "inline-block",
                      width: 16,
                      height: 2,
                      background: "color-mix(in srgb, var(--color-text) 42%, transparent)",
                    }}
                  />
                  情绪
                </span>
              </span>
            </figcaption>
            <svg
              viewBox="0 0 1000 92"
              preserveAspectRatio="none"
              style={{ display: "block", width: "100%", height: 132, overflow: "visible" }}
            >
              <g stroke="var(--color-divider)" strokeWidth={1}>
                <line x1={250} y1={6} x2={250} y2={84} />
                <line x1={500} y1={6} x2={500} y2={84} />
                <line x1={750} y1={6} x2={750} y2={84} />
              </g>
              <path
                d={curvePath(d.emo, d.dur)}
                fill="none"
                stroke="color-mix(in srgb, var(--color-text) 40%, transparent)"
                strokeWidth={2}
                strokeDasharray="4 3"
              />
              <path d={curvePath(d.trust, d.dur)} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
              {d.beatMarks.map((m, i) => (
                <circle
                  key={m.t}
                  cx={(m.t / d.dur) * 1000}
                  cy={88 - valueAt(d.trust, m.t) * 80}
                  r={4.5}
                  fill={i === d.beatMarks.length - 1 ? "var(--color-accent)" : "var(--color-surface)"}
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                />
              ))}
            </svg>
            <div style={{ position: "relative", height: 16, marginTop: 4 }}>
              {d.beatMarks.map((m) => (
                <span
                  key={m.t}
                  className="num"
                  style={{
                    position: "absolute",
                    left: `${(m.t / d.dur) * 100}%`,
                    transform: "translateX(-50%)",
                    fontSize: 10,
                    whiteSpace: "nowrap",
                    ...muted(55),
                  }}
                >
                  {m.label}
                </span>
              ))}
            </div>
            <p
              style={{
                fontSize: 12,
                lineHeight: 1.6,
                margin: "16px 0 0",
                borderTop: "1px solid var(--color-divider)",
                paddingTop: 12,
                ...muted(62),
              }}
            >
              信任与情绪几乎同步爬升：大白从不用「说服」推高信任，靠形态与坚持——每个节点都是一次形态或权限的动作，而非一句话。
            </p>
          </figure>

          {/* 视频（桌面在右；手机最上） */}
          <div className="order-1 lg:order-2">
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <span
                className="num"
                style={{
                  fontSize: 12,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--color-accent-700)",
                }}
              >
                素材 · 站内播放
              </span>
              <span style={{ fontSize: 11, ...muted(48) }}>Watch here</span>
            </div>
            <figure className="plate">
              <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%" }}>
                <iframe
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                  src={`https://www.youtube-nocookie.com/embed/${d.videoId}?rel=0`}
                  title={d.videoLabel}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </figure>
            <p style={{ fontSize: 12, margin: "10px 0 0", ...muted(52) }}>
              🎬 {d.videoLabel}（YouTube 公开渠道嵌入）
            </p>
          </div>
        </section>

        {/* 01 逐拍 */}
        <section style={{ marginTop: 60 }}>
          <SectionHead no="01" title="逐拍时间线" en="Beat by beat" />
          <div style={{ marginTop: -6 }}>
            {d.beats.map((b, i) => (
              <div
                key={b.t}
                style={{
                  display: "grid",
                  gridTemplateColumns: "5.4rem 1fr",
                  gap: 24,
                  padding: "16px 6px",
                  borderBottom:
                    i === d.beats.length - 1 ? "none" : "1px solid var(--color-divider)",
                }}
              >
                <span className="num" style={{ fontSize: 15, color: "var(--color-accent-700)", paddingTop: 2 }}>
                  {b.t}
                </span>
                <div>
                  <p style={{ margin: "0 0 8px", fontSize: 16, lineHeight: 1.55 }}>{b.what}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {b.shifts.map((s) => (
                      <span
                        key={s.label}
                        className={`tag ${
                          s.kind === "hw"
                            ? "tag-accent"
                            : s.kind === "trust"
                              ? "tag-outline"
                              : "tag-neutral"
                        }`}
                      >
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 02 机制 */}
        <section style={{ marginTop: 64 }}>
          <SectionHead no="02" title="机制全解剖" en="Mechanisms" />
          <p style={{ fontSize: 14, margin: "-16px 0 20px", ...muted(62) }}>
            标{" "}
            <span className="tag tag-outline" style={{ fontSize: 10, padding: "1px 7px" }}>
              硬件
            </span>{" "}
            的，是纯软件 AI 拿不到的杠杆。
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
              gap: 16,
            }}
          >
            {d.mechanisms.map((m) => (
              <div
                key={m.title}
                className="card"
                style={
                  m.hardware
                    ? { borderColor: "var(--color-accent)", background: "var(--color-accent-100)" }
                    : undefined
                }
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    className="card-title"
                    style={m.hardware ? { color: "var(--color-accent-900)" } : undefined}
                  >
                    {m.title}
                  </span>
                  {m.hardware && (
                    <span className="tag tag-outline" style={{ fontSize: 10, padding: "1px 7px" }}>
                      硬件
                    </span>
                  )}
                </div>
                <p
                  className="card-body"
                  style={
                    m.hardware
                      ? { fontSize: 13.5, color: "var(--color-accent-800)" }
                      : { fontSize: 13.5 }
                  }
                >
                  {m.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 03 八视角 */}
        <section style={{ marginTop: 64 }}>
          <SectionHead no="03" title="八视角读同一场景" en="Eight lenses" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: -8 }}>
            {d.agents.map((a, i) => (
              <button
                key={a.name}
                onClick={() => setAgent(i)}
                className="serif"
                style={{
                  padding: "8px 14px",
                  fontSize: 13.5,
                  fontWeight: 600,
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  transition: "all .12s",
                  border:
                    i === agent
                      ? "1px solid var(--color-accent)"
                      : "1px solid var(--color-divider)",
                  background: i === agent ? "var(--color-accent-100)" : "transparent",
                  color:
                    i === agent
                      ? "var(--color-accent-800)"
                      : "color-mix(in srgb, var(--color-text) 70%, transparent)",
                }}
              >
                {a.name}
              </button>
            ))}
          </div>
          <div
            style={{
              marginTop: 20,
              border: "1px solid var(--color-divider)",
              borderRadius: "var(--radius-lg)",
              padding: "clamp(22px,3vw,32px)",
              background: "var(--color-neutral-100)",
            }}
          >
            <p
              style={{
                fontSize: 12,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-accent-700)",
                margin: "0 0 14px",
              }}
            >
              {d.agents[agent].name} 视角
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.75, margin: 0, ...muted(90) }}>
              {d.agents[agent].read}
            </p>
            <p
              style={{
                margin: "18px 0 0",
                paddingTop: 14,
                borderTop: "1px dashed var(--color-divider)",
                fontSize: 14,
                fontStyle: "italic",
                color: "var(--color-accent-800)",
              }}
            >
              {d.agents[agent].kicker}
            </p>
          </div>
        </section>

        {/* 04 迁移 */}
        <section style={{ marginTop: 64 }}>
          <SectionHead no="04" title="跨行业迁移" en="Migration" />
          <div style={{ marginTop: -20 }}>
            {d.migrations.map((m, i) => (
              <div
                key={m.industry}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(150px,1fr) minmax(0,2.4fr)",
                  gap: 24,
                  padding: "20px 6px",
                  borderBottom:
                    i === d.migrations.length - 1 ? "none" : "1px solid var(--color-divider)",
                  alignItems: "baseline",
                }}
              >
                <p
                  className="serif"
                  style={{ fontWeight: 600, fontSize: 20, margin: 0, color: "var(--color-accent-800)" }}
                >
                  {m.industry}
                </p>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, ...muted(80) }}>
                  {m.hypothesis}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 05 反事实 */}
        <section style={{ marginTop: 64 }}>
          <SectionHead no="05" title="反事实推演" en="Counterfactuals" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
              gap: 18,
              marginTop: -8,
            }}
          >
            {d.counterfactuals.map((c) => (
              <div key={c.q} style={{ borderLeft: "2px solid var(--color-accent)", padding: "4px 0 4px 20px" }}>
                <p
                  className="serif"
                  style={{ fontWeight: 600, fontSize: 19, margin: "0 0 8px", lineHeight: 1.25 }}
                >
                  {c.q}
                </p>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, ...muted(75) }}>{c.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 06 能力缺口 */}
        <section style={{ marginTop: 64 }}>
          <SectionHead no="06" title="能力缺口 · 最上游" en="Capability gap" />
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: "-16px 0 8px", maxWidth: "70ch", ...muted(62) }}>
            这个场景要求的东西，现在的 AI / 硬件能做到几成？缺口就是能反推「下一代能力」的地方。
          </p>
          <hr className="hr" style={{ margin: "10px 0 0" }} />
          <div>
            {d.gaps.map((g, i) => (
              <div
                key={g.text}
                style={{
                  padding: "18px 6px",
                  borderBottom: i === d.gaps.length - 1 ? "none" : "1px solid var(--color-divider)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "baseline" }}>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, maxWidth: "64ch" }}>{g.text}</p>
                  <span
                    className="num"
                    style={{ fontSize: 13, color: "var(--color-accent-700)", whiteSpace: "nowrap" }}
                  >
                    {g.label}
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "var(--color-neutral-200)",
                    borderRadius: 3,
                    overflow: "hidden",
                    marginTop: 12,
                  }}
                >
                  <div style={{ height: "100%", width: `${g.pct}%`, background: "var(--color-accent)" }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CLOSING */}
        <section
          style={{
            marginTop: 56,
            border: "1px solid var(--color-accent)",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-accent-100)",
            padding: "clamp(24px,4vw,40px)",
          }}
        >
          <p
            className="serif"
            style={{
              fontWeight: 600,
              fontSize: "clamp(22px,2.6vw,30px)",
              margin: 0,
              color: "var(--color-accent-900)",
            }}
          >
            这就是「一个素材挖到极限」的样子。
          </p>
          <p style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.7, color: "var(--color-accent-800)", maxWidth: "70ch" }}>
            六层：素材 → 逐拍 → 机制 → 八视角 → 迁移 → 反事实 → 缺口。深度才是抄不走的壁垒。
          </p>
        </section>

        <footer
          style={{
            marginTop: 56,
            paddingTop: 26,
            borderTop: "1px solid var(--color-divider)",
            fontSize: 12.5,
            lineHeight: 1.7,
            ...muted(52),
          }}
        >
          本页为结构化研究拆解，不含影视片段；视频为 YouTube 公开渠道嵌入，版权归原权利方所有。场景位置仅供你在正版渠道中查找原片。
        </footer>
      </main>
    </div>
  );
}
