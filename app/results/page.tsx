"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type { MatchResponse } from "@/lib/types";
import { MECHANISM_LABELS } from "@/lib/types";

const muted = (p: number) =>
  ({ color: `color-mix(in srgb, var(--color-text) ${p}%, transparent)` }) as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </p>
  );
}

function ResultsInner() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const [state, setState] = useState<{
    q: string;
    data?: MatchResponse;
    error?: string;
  }>({ q: "" });

  useEffect(() => {
    if (!q) return;
    let cancelled = false;
    fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("bad response");
        return r.json();
      })
      .then((d: MatchResponse) => {
        if (!cancelled) setState({ q, data: d });
      })
      .catch(() => {
        if (!cancelled) setState({ q, error: "匹配服务暂时不可用，请稍后重试。" });
      });
    return () => {
      cancelled = true;
    };
  }, [q]);

  const data = state.q === q ? state.data : undefined;
  const error = state.q === q ? state.error : undefined;

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
        <div
          style={{
            border: "1px solid var(--color-divider)",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-surface)",
            padding: 18,
          }}
        >
          <p style={{ fontSize: 12, margin: 0, ...muted(52) }}>你的问题</p>
          <p style={{ fontSize: 17, lineHeight: 1.6, margin: "6px 0 0" }}>
            {q || "（空）"}
          </p>
        </div>

        {error && (
          <p style={{ marginTop: 32, fontSize: 14, color: "#b23b3b" }}>{error}</p>
        )}
        {!data && !error && (
          <p style={{ marginTop: 32, fontSize: 14, ...muted(50) }}>
            正在匹配人类想象档案……
          </p>
        )}

        {data && (
          <>
            <section style={{ marginTop: 40 }}>
              <SectionLabel>系统对需求的理解</SectionLabel>
              <div
                style={{
                  marginTop: 14,
                  border: "1px solid var(--color-divider)",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--color-surface)",
                  padding: 18,
                }}
              >
                <p style={{ fontSize: 14, margin: 0, ...muted(60) }}>
                  产品形态：
                  <span style={{ color: "var(--color-text)" }}>
                    {data.understanding.productForm}
                  </span>
                </p>
                {data.understanding.matchedMechanisms.length > 0 && (
                  <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {data.understanding.matchedMechanisms.map((m) => (
                      <span key={m} className="tag tag-outline">
                        {MECHANISM_LABELS[m]}
                      </span>
                    ))}
                  </div>
                )}
                <ul style={{ margin: "18px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.understanding.coreQuestions.map((cq) => (
                    <li key={cq} style={{ display: "flex", gap: 10, fontSize: 15, lineHeight: 1.6, ...muted(85) }}>
                      <span style={{ color: "var(--color-accent-700)" }}>?</span>
                      {cq}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section style={{ marginTop: 40 }}>
              <SectionLabel>推荐的想象场景</SectionLabel>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
                {data.results.map(({ scene, reason }) => (
                  <Link
                    key={scene.id}
                    href={`/scene/${scene.id}?q=${encodeURIComponent(q)}`}
                    className="card"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <p className="num" style={{ fontSize: 12, margin: 0, ...muted(52) }}>
                      <span style={{ fontStyle: "italic" }}>《{scene.work.title}》</span>{" "}
                      {scene.work.originalTitle} · {scene.work.year}
                    </p>
                    <p
                      className="serif"
                      style={{ fontWeight: 600, fontSize: 21, lineHeight: 1.2, margin: "6px 0 8px" }}
                    >
                      {scene.sceneTitle}
                    </p>
                    <p style={{ fontSize: 14.5, lineHeight: 1.65, margin: 0, ...muted(70) }}>
                      {scene.summary}
                    </p>
                    <p
                      style={{
                        margin: "14px 0 0",
                        borderLeft: "2px solid var(--color-accent)",
                        paddingLeft: 12,
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: "var(--color-accent-800)",
                      }}
                    >
                      {reason}
                    </p>
                  </Link>
                ))}
              </div>
              <p className="num" style={{ marginTop: 16, fontSize: 11, ...muted(40) }}>
                {data.llmEnhanced
                  ? "MATCHING · LLM-ENHANCED"
                  : "MATCHING · LOCAL STRUCTURAL INDEX"}
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsInner />
    </Suspense>
  );
}
