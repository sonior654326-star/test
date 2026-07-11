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

const S_HEAD =
  "font-mono text-[11px] tracking-[0.22em] text-teal-300/80 uppercase";
const CARD = "rounded-xl border border-zinc-800 bg-zinc-900/50 p-4";

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
      <main className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">深挖内容不存在</p>
          <Link href="/" className="mt-2 block text-sm text-teal-300">
            返回首页
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="lab-grid flex flex-1 flex-col items-center px-5 py-10">
      <div className="w-full max-w-6xl">
        <Link href="/" className="font-mono text-xs text-zinc-500 hover:text-teal-300">
          ← ImagineLab
        </Link>

        <header className="mt-5">
          <p className="font-mono text-[11px] tracking-[0.3em] text-teal-300/80 uppercase">
            单素材深挖 · Smart Hardware
          </p>
          <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-zinc-50">
            {d.title}
          </h1>
          <p className="mt-1 font-mono text-xs text-zinc-500">{d.workMeta}</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400">
            {d.summary}
          </p>
        </header>

        {/* 三列：中间=视频+能力缺口；左右=其余五层 */}
        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.15fr_1fr]">
          {/* ===== 中间列（源码放最前，手机端优先显示视频）===== */}
          <div className="flex flex-col gap-6 lg:col-start-2 lg:row-start-1">
            <section>
              <h2 className={S_HEAD}>素材 · 站内播放</h2>
              <div className="mt-3 overflow-hidden rounded-xl border border-zinc-800 bg-black">
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${d.videoId}?rel=0`}
                    title={d.videoLabel}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-zinc-500">🎬 {d.videoLabel}</p>

              {/* 时间轴曲线 */}
              <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                <div className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                  <span>机制时间轴</span>
                  <span className="flex gap-3">
                    <span className="flex items-center gap-1">
                      <i className="inline-block h-0.5 w-3 rounded bg-teal-300" />
                      信任
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="inline-block h-0.5 w-3 rounded bg-amber-400" />
                      情绪
                    </span>
                  </span>
                </div>
                <svg viewBox="0 0 1000 92" preserveAspectRatio="none" className="block h-[84px] w-full overflow-visible">
                  <g stroke="#232c3a" strokeWidth={1} opacity={0.5}>
                    <line x1={250} y1={6} x2={250} y2={84} />
                    <line x1={500} y1={6} x2={500} y2={84} />
                    <line x1={750} y1={6} x2={750} y2={84} />
                  </g>
                  <path d={curvePath(d.emo, d.dur)} fill="none" stroke="#fbbf24" strokeWidth={2} opacity={0.8} />
                  <path d={curvePath(d.trust, d.dur)} fill="none" stroke="#5eead4" strokeWidth={2.5} />
                  {d.beatMarks.map((m) => (
                    <circle
                      key={m.t}
                      cx={(m.t / d.dur) * 1000}
                      cy={88 - valueAt(d.trust, m.t) * 80}
                      r={5}
                      fill="#5eead4"
                      stroke="#5eead4"
                      strokeWidth={2}
                    />
                  ))}
                </svg>
                <div className="relative mt-1 h-3">
                  {d.beatMarks.map((m) => (
                    <span
                      key={m.t}
                      className="absolute -translate-x-1/2 font-mono text-[9.5px] text-zinc-500"
                      style={{ left: `${(m.t / d.dur) * 100}%` }}
                    >
                      {m.label}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* 能力缺口 */}
            <section>
              <h2 className={S_HEAD}>06 · 能力缺口 · 最上游</h2>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                这个场景要求的东西，现在的 AI / 硬件能做到几成？缺口就是能反推「下一代能力」的地方。
              </p>
              <div className="mt-3 space-y-2.5">
                {d.gaps.map((g) => (
                  <div key={g.text} className={CARD}>
                    <p className="text-[13px] leading-relaxed text-zinc-300">{g.text}</p>
                    <div className="mt-2.5 flex items-center gap-2.5">
                      <div className="h-1.5 flex-1 overflow-hidden rounded bg-zinc-800">
                        <div
                          className="h-full rounded bg-gradient-to-r from-teal-700 to-teal-300"
                          style={{ width: `${g.pct}%` }}
                        />
                      </div>
                      <span className="w-16 text-right font-mono text-[11px] text-zinc-500">
                        {g.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ===== 左列 ===== */}
          <div className="flex flex-col gap-6 lg:col-start-1 lg:row-start-1">
            <section>
              <h2 className={S_HEAD}>01 · 逐拍时间线</h2>
              <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4">
                {d.beats.map((b) => (
                  <div
                    key={b.t}
                    className="grid grid-cols-[46px_1fr] gap-3 border-b border-zinc-800/80 py-3 last:border-none"
                  >
                    <span className="pt-0.5 font-mono text-xs text-teal-300 tabular-nums">
                      {b.t}
                    </span>
                    <div>
                      <p className="text-[13px] text-zinc-200">{b.what}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {b.shifts.map((s) => (
                          <span
                            key={s.label}
                            className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${
                              s.kind === "hw"
                                ? "border-amber-400/35 text-amber-300/90"
                                : s.kind === "trust"
                                  ? "border-teal-700 text-teal-300"
                                  : "border-zinc-700 text-zinc-500"
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

            <section>
              <h2 className={S_HEAD}>02 · 机制全解剖</h2>
              <p className="mt-2 text-xs text-zinc-500">
                标 <span className="text-amber-300">硬件</span> 的，是纯软件 AI 拿不到的杠杆。
              </p>
              <div className="mt-3 space-y-2.5">
                {d.mechanisms.map((m) => (
                  <div
                    key={m.title}
                    className={`rounded-xl border p-4 ${
                      m.hardware
                        ? "border-teal-800/70 bg-teal-400/[0.04]"
                        : "border-zinc-800 bg-zinc-900/40"
                    }`}
                  >
                    <h3 className="flex items-center gap-2 text-[15px] font-medium text-zinc-100">
                      {m.title}
                      {m.hardware && (
                        <span className="rounded border border-amber-400/35 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-amber-300">
                          硬件
                        </span>
                      )}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-300">
                      {m.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ===== 右列 ===== */}
          <div className="flex flex-col gap-6 lg:col-start-3 lg:row-start-1">
            <section>
              <h2 className={S_HEAD}>03 · 八个视角读同一场景</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {d.agents.map((a, i) => (
                  <button
                    key={a.name}
                    onClick={() => setAgent(i)}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                      i === agent
                        ? "border-teal-400 bg-teal-400/10 text-teal-300"
                        : "border-zinc-700 text-zinc-400 hover:border-teal-400/40"
                    }`}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-xl border border-teal-800/70 bg-zinc-900/60 p-4">
                <p className="font-mono text-[11px] uppercase tracking-widest text-teal-300">
                  {d.agents[agent].name} Agent
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-200">
                  {d.agents[agent].read}
                </p>
                <p className="mt-3 border-t border-dashed border-zinc-700 pt-2.5 text-xs text-amber-300/90">
                  {d.agents[agent].kicker}
                </p>
              </div>
            </section>

            <section>
              <h2 className={S_HEAD}>04 · 跨行业迁移</h2>
              <div className="mt-3 space-y-2">
                {d.migrations.map((m) => (
                  <div key={m.industry} className={CARD}>
                    <p className="text-[13px] font-semibold text-teal-300">
                      {m.industry}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-zinc-300">
                      {m.hypothesis}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className={S_HEAD}>05 · 反事实推演</h2>
              <div className="mt-3 space-y-2.5">
                {d.counterfactuals.map((c) => (
                  <div
                    key={c.q}
                    className="rounded-r-xl border-l-2 border-red-400/70 bg-zinc-900/50 py-3 pl-4 pr-3"
                  >
                    <p className="text-[13.5px] font-medium text-zinc-100">{c.q}</p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-zinc-400">
                      {c.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-teal-800/60 bg-gradient-to-b from-teal-400/[0.06] to-transparent p-5">
          <p className="text-[15px] text-zinc-100">这就是「一个素材挖到极限」的样子。</p>
          <p className="mt-1.5 text-[13px] text-zinc-400">
            六层：素材 → 逐拍 → 机制 → 八视角 → 迁移 → 反事实 → 缺口。深度才是抄不走的壁垒。
          </p>
        </div>
      </div>
    </main>
  );
}
