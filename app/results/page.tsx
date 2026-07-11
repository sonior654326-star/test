"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type { MatchResponse } from "@/lib/types";
import { MECHANISM_LABELS } from "@/lib/types";

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
        if (!cancelled)
          setState({ q, error: "匹配服务暂时不可用，请稍后重试。" });
      });
    return () => {
      cancelled = true;
    };
  }, [q]);

  // 只展示与当前查询对应的结果；查询变化期间视为加载中
  const data = state.q === q ? state.data : undefined;
  const error = state.q === q ? state.error : undefined;

  return (
    <main className="lab-grid flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <Link href="/" className="font-mono text-xs text-zinc-500 hover:text-teal-300">
          ← ImagineLab
        </Link>

        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-xs text-zinc-500">你的问题</p>
          <p className="mt-1 text-zinc-100">{q || "（空）"}</p>
        </div>

        {error && <p className="mt-8 text-sm text-red-400">{error}</p>}
        {!data && !error && (
          <p className="mt-8 animate-pulse text-sm text-zinc-500">
            正在匹配人类想象档案……
          </p>
        )}

        {data && (
          <>
            <section className="mt-8">
              <h2 className="font-mono text-xs tracking-[0.25em] text-teal-300/70 uppercase">
                系统对需求的理解
              </h2>
              <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                <p className="text-sm text-zinc-400">
                  产品形态：
                  <span className="text-zinc-200">{data.understanding.productForm}</span>
                </p>
                {data.understanding.matchedMechanisms.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {data.understanding.matchedMechanisms.map((m) => (
                      <span
                        key={m}
                        className="rounded-full border border-teal-400/30 bg-teal-400/10 px-2.5 py-0.5 text-xs text-teal-200"
                      >
                        {MECHANISM_LABELS[m]}
                      </span>
                    ))}
                  </div>
                )}
                <ul className="mt-4 space-y-2">
                  {data.understanding.coreQuestions.map((cq) => (
                    <li key={cq} className="flex gap-2 text-sm text-zinc-300">
                      <span className="text-teal-300/70">?</span>
                      {cq}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="mt-8">
              <h2 className="font-mono text-xs tracking-[0.25em] text-teal-300/70 uppercase">
                推荐的想象场景
              </h2>
              <div className="mt-3 space-y-3">
                {data.results.map(({ scene, reason }) => (
                  <Link
                    key={scene.id}
                    href={`/scene/${scene.id}?q=${encodeURIComponent(q)}`}
                    className="group block rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-teal-400/40"
                  >
                    <p className="font-mono text-[10px] text-zinc-500">
                      《{scene.work.title}》({scene.work.originalTitle},{" "}
                      {scene.work.year})
                    </p>
                    <p className="mt-1 text-lg font-medium text-zinc-100 group-hover:text-teal-200">
                      {scene.sceneTitle}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      {scene.summary}
                    </p>
                    <p className="mt-3 border-l-2 border-teal-400/40 pl-3 text-xs text-teal-200/80">
                      {reason}
                    </p>
                  </Link>
                ))}
              </div>
              <p className="mt-4 font-mono text-[10px] text-zinc-600">
                {data.llmEnhanced
                  ? "MATCHING: LLM-ENHANCED"
                  : "MATCHING: LOCAL STRUCTURAL INDEX"}
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsInner />
    </Suspense>
  );
}
