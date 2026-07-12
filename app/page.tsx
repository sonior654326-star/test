"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { SCENES_WITH_WORK } from "@/data/scenes";
import { MECHANISM_LABELS } from "@/lib/types";
import { INDUSTRIES, industryCounts } from "@/lib/industries";

const IND_COUNTS = industryCounts();

const EXAMPLES = [
  "我想做一个能主动帮助用户、但又不会让人感到被监视的桌面 Agent",
  "AI 陪伴产品如何建立长期信任，而不是靠讨好和操纵？",
  "家庭机器人面对多个家庭成员时，立场和权限应该怎么设计？",
  "我的 Agent 拿到了很高的系统权限，失控时用户怎么接管？",
];

const muted = (p: number) =>
  ({ color: `color-mix(in srgb, var(--color-text) ${p}%, transparent)` }) as const;

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const go = (q: string) => {
    const v = q.trim();
    if (v) router.push(`/results?q=${encodeURIComponent(v)}`);
  };

  return (
    <div className="lab-grid">
      <nav
        className="nav"
        style={{
          maxWidth: 1000,
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
        <a href="#archive">场景档案</a>
        <a href="#industry">按行业</a>
        <Link href="/analyze">上传拆解</Link>
      </nav>

      <main
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "0 clamp(20px,5vw,48px) 80px",
        }}
      >
        {/* HERO */}
        <section style={{ paddingTop: "clamp(52px,9vw,96px)" }}>
          <p
            className="num"
            style={{
              fontSize: 12,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "var(--color-accent-700)",
              margin: "0 0 22px",
            }}
          >
            ImagineLab · 人机关系实验档案馆
          </p>
          <h1
            className="display"
            style={{
              fontWeight: 400,
              fontSize: "clamp(40px,6vw,74px)",
              lineHeight: 1.08,
              letterSpacing: "-0.01em",
              margin: 0,
              textWrap: "balance",
            }}
          >
            你正在思考
            <br />
            什么样的 AI 产品？
          </h1>
          <p
            className="lead"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 19,
              lineHeight: 1.7,
              maxWidth: "52ch",
              margin: "28px 0 0",
              ...muted(78),
            }}
          >
            影视已经替人类预演了大量尚未被工程实现的人机关系。输入你的问题，从这些想象实验中获得可迁移的交互机制与产品启发。
          </p>

          {/* composer */}
          <div style={{ marginTop: 36, maxWidth: 680 }}>
            <textarea
              className="input"
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  go(query);
                }
              }}
              placeholder="描述你的产品、你卡住的交互问题，或一个模糊的想法……"
              style={{ fontSize: 16, lineHeight: 1.6 }}
            />
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                alignItems: "center",
                marginTop: 16,
              }}
            >
              <button className="btn btn-primary" onClick={() => go(query)}>
                进入想象空间 →
              </button>
              <Link href="/analyze" className="btn btn-ghost">
                或上传一段视频，让 AI 拆解它的交互机制 →
              </Link>
            </div>
          </div>

          {/* examples */}
          <div style={{ marginTop: 40, maxWidth: 720 }}>
            <p
              style={{
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                margin: "0 0 14px",
                ...muted(55),
              }}
            >
              试试这些问题
            </p>
            <div
              style={{
                display: "grid",
                gap: 1,
                background: "var(--color-divider)",
                border: "1px solid var(--color-divider)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
              }}
            >
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => go(ex)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    background: "var(--color-bg)",
                    border: 0,
                    cursor: "pointer",
                    padding: "14px 18px",
                    font: "inherit",
                    fontSize: 15,
                    lineHeight: 1.5,
                    ...muted(82),
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </section>

        <hr className="hr" style={{ margin: "68px 0" }} />

        {/* FEATURED DEEP DIVE */}
        <Link
          href="/deep/baymax"
          className="card"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 28,
            alignItems: "center",
            borderColor: "var(--color-accent)",
            background: "var(--color-accent-100)",
            padding: "clamp(24px,4vw,40px)",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div>
            <p
              className="num"
              style={{
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-accent-700)",
                margin: "0 0 12px",
              }}
            >
              单素材深挖 · 样板
            </p>
            <h2
              className="display"
              style={{
                fontWeight: 400,
                fontSize: "clamp(28px,3.4vw,40px)",
                lineHeight: 1.1,
                margin: 0,
                color: "var(--color-accent-900)",
              }}
            >
              大白：一个素材，挖到极限
            </h2>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.65,
                color: "var(--color-accent-800)",
                margin: "14px 0 0",
                maxWidth: "60ch",
              }}
            >
              视频站内直看 · 逐拍时间线 / 机制全解剖 / 八视角对读 / 跨行业迁移 /
              反事实推演 / 能力缺口 —— 六层深挖，深度才是抄不走的壁垒。
            </p>
          </div>
          <span
            className="btn btn-secondary"
            style={{ whiteSpace: "nowrap", borderColor: "var(--color-accent-700)" }}
          >
            开始阅读 →
          </span>
        </Link>

        {/* INDUSTRY */}
        <section id="industry" style={{ marginTop: 80, scrollMarginTop: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <h2 style={{ fontWeight: 600, fontSize: "clamp(26px,3vw,34px)", margin: 0 }}>
              按行业进入
            </h2>
            <span
              className="num"
              style={{
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                ...muted(45),
              }}
            >
              Find what sparks you
            </span>
          </div>
          <p style={{ fontSize: 15, margin: "8px 0 0", ...muted(62) }}>
            你在做哪类 AI？直接看最能启发你的素材。
          </p>
          <hr className="hr" style={{ margin: "20px 0 28px" }} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
              gap: 16,
            }}
          >
            {INDUSTRIES.map((ind) => (
              <Link
                key={ind.slug}
                href={`/industry/${ind.slug}`}
                className="card"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <span className="card-title">{ind.name}</span>
                  <span
                    className="num"
                    style={{ fontSize: 13, color: "var(--color-accent-700)" }}
                  >
                    {IND_COUNTS[ind.slug]} →
                  </span>
                </div>
                <p className="card-body" style={{ fontSize: 13 }}>
                  {ind.blurb}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* SCENE ARCHIVE */}
        <section id="archive" style={{ marginTop: 80, scrollMarginTop: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <h2 style={{ fontWeight: 600, fontSize: "clamp(26px,3vw,34px)", margin: 0 }}>
              场景档案{" "}
              <span
                className="num"
                style={{ fontWeight: 400, color: "var(--color-accent-700)" }}
              >
                · {SCENES_WITH_WORK.length} 条
              </span>
            </h2>
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                ...muted(45),
              }}
            >
              Structured human-AI scene archive
            </span>
          </div>
          <hr className="hr" style={{ margin: "20px 0 4px" }} />

          <div>
            {SCENES_WITH_WORK.map((s, i) => (
              <Link
                key={s.id}
                href={`/scene/${s.id}`}
                className="scene-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.6rem 1fr auto",
                  gap: 20,
                  alignItems: "baseline",
                  padding: "20px 12px",
                  borderBottom: "1px solid var(--color-divider)",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <span
                  className="num"
                  style={{ fontSize: 15, color: "var(--color-accent-700)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p
                    className="num"
                    style={{
                      fontSize: 12,
                      letterSpacing: "0.04em",
                      margin: 0,
                      ...muted(52),
                    }}
                  >
                    <span style={{ fontStyle: "italic" }}>《{s.work.title}》</span>{" "}
                    {s.work.originalTitle} · {s.work.year}
                    {s.video && (
                      <>
                        {" "}
                        <span
                          className="tag tag-outline"
                          style={{ fontSize: 10, padding: "1px 7px" }}
                        >
                          片段
                        </span>
                      </>
                    )}
                  </p>
                  <p
                    className="serif"
                    style={{
                      fontWeight: 600,
                      fontSize: 22,
                      lineHeight: 1.2,
                      margin: "6px 0 10px",
                    }}
                  >
                    {s.sceneTitle}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {s.mechanisms.slice(0, 3).map((m) => (
                      <span key={m} className="tag tag-neutral">
                        {MECHANISM_LABELS[m]}
                      </span>
                    ))}
                  </div>
                </div>
                <span style={{ color: "var(--color-accent)", fontSize: 18 }}>→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* OPEN SCREENING */}
        <section id="screening" style={{ marginTop: 80, scrollMarginTop: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <h2 style={{ fontWeight: 600, fontSize: "clamp(26px,3vw,34px)", margin: 0 }}>
              开放放映室
            </h2>
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                ...muted(45),
              }}
            >
              Open license screening
            </span>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.65, margin: "10px 0 0", maxWidth: "64ch", ...muted(68) }}>
            《Tears of Steel》—— Blender 基金会的开源科幻短片（CC-BY 授权，可自由观看）：人类与失控机器人的战争，源于一段关于机器人的记忆重演实验。
          </p>
          <figure className="plate" style={{ marginTop: 24 }}>
            <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%" }}>
              <iframe
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                src="https://www.youtube-nocookie.com/embed/R6MlUcmOul8"
                title="Tears of Steel — Blender VFX Open Movie"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </figure>
        </section>

        <footer
          style={{
            marginTop: 72,
            paddingTop: 28,
            borderTop: "1px solid var(--color-divider)",
            fontSize: 12.5,
            lineHeight: 1.7,
            ...muted(52),
          }}
        >
          本站不托管任何影视片段；场景视频均为 YouTube 官方 / 公开渠道嵌入，版权归原权利方所有。结构化拆解为本站原创研究内容。
        </footer>
      </main>
    </div>
  );
}
