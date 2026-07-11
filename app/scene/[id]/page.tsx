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
      <main className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">场景不存在</p>
          <Link href="/" className="mt-2 block text-sm text-teal-300">
            返回首页
          </Link>
        </div>
      </main>
    );
  }

  const a = scene.analysis as unknown as Record<string, string>;

  return (
    <main className="lab-grid flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <Link href="/" className="font-mono text-xs text-zinc-500 hover:text-teal-300">
          ← ImagineLab
        </Link>

        {/* 场景头部 */}
        <header className="mt-6">
          <p className="font-mono text-xs text-zinc-500">
            《{scene.work.title}》({scene.work.originalTitle}, {scene.work.year})
            · {scene.position}
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-zinc-50">
            {scene.sceneTitle}
          </h1>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {scene.mechanisms.map((m) => (
              <span
                key={m}
                className="rounded-full border border-teal-400/30 bg-teal-400/10 px-2.5 py-0.5 text-xs text-teal-200"
              >
                {MECHANISM_LABELS[m]}
              </span>
            ))}
          </div>
        </header>

        {/* 关联视频：官方预告/公开片段的 YouTube 嵌入，平台不托管片源 */}
        {scene.video && (
          <section className="mt-6">
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-black">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${scene.video.youtubeId}`}
                  title={scene.video.label}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
              <p>
                🎬 {scene.video.label} · 来源：{scene.video.source}
              </p>
              <a
                href={`https://www.youtube.com/watch?v=${scene.video.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-300/80 hover:text-teal-200"
              >
                无法播放？在 YouTube 打开 ↗
              </a>
            </div>
          </section>
        )}

        {/* 原始场景：所有视角共享的素材层 */}
        <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-sm leading-relaxed text-zinc-300">{scene.summary}</p>
          <div className="mt-4 grid gap-3 text-xs text-zinc-500 sm:grid-cols-2">
            <p>
              <span className="text-zinc-400">背景：</span>
              {scene.context}
            </p>
            <p>
              <span className="text-zinc-400">AI 形态：</span>
              {scene.aiForm}
              <br />
              <span className="text-zinc-400">角色：</span>
              {scene.characters.join("；")}
            </p>
          </div>
        </section>

        {/* 行业联想镜头：把机制翻译成对特定行业从业者的直接联想 */}
        {scene.industryLens && scene.industryLens.length > 0 && (
          <section className="mt-6 rounded-xl border border-teal-400/25 bg-teal-400/[0.04] p-5">
            <p className="font-mono text-[11px] tracking-[0.2em] text-teal-300/80 uppercase">
              如果你在做这些，先想想 · INDUSTRY LENS
            </p>
            <div className="mt-4 space-y-4">
              {scene.industryLens.map((l) => (
                <div key={l.industry} className="flex flex-col gap-1.5 sm:flex-row sm:gap-4">
                  <span className="shrink-0 sm:w-24">
                    <span className="inline-block rounded-md border border-teal-400/30 bg-teal-400/10 px-2.5 py-1 text-xs text-teal-200">
                      {l.industry}
                    </span>
                  </span>
                  <p className="text-sm leading-relaxed text-zinc-200">{l.prompt}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 认知视角切换 */}
        <nav className="mt-8 flex gap-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition ${
                tab === t
                  ? "bg-teal-400/90 font-medium text-zinc-950"
                  : "border border-zinc-700 text-zinc-400 hover:border-teal-400/40"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        <section className="mt-5">
          {tab === "原始观察" && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              <p className="text-xs text-zinc-500">
                先不要结论。带着这些问题，自己去看这个场景：
              </p>
              <ul className="mt-4 space-y-4">
                {scene.agentViews.observationPrompts.map((p, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-mono text-teal-300/70">{i + 1}</span>
                    <p className="text-sm leading-relaxed text-zinc-200">{p}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === "机制拆解" && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              <p className="text-xs text-zinc-500">
                从「剧情」到「机制」：这个场景里真正发生了什么。
              </p>
              <dl className="mt-4 divide-y divide-zinc-800/80">
                {DIMENSION_LABELS.map(({ key, label }) => (
                  <div key={key} className="grid grid-cols-[6.5rem_1fr] gap-3 py-2.5">
                    <dt className="text-xs text-zinc-500 pt-0.5">{label}</dt>
                    <dd className="text-sm leading-relaxed text-zinc-300">
                      {a[key]}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {tab === "同理心视角" && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              <p className="text-xs text-zinc-500">场景中的人，真正的感受和需求是什么：</p>
              <p className="mt-4 border-l-2 border-teal-400/40 pl-4 text-sm leading-loose text-zinc-200">
                {scene.agentViews.empathy}
              </p>
            </div>
          )}

          {tab === "产品启发" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-xs text-zinc-500">可迁移的机制：</p>
                <ul className="mt-3 space-y-3">
                  {scene.agentViews.productInspiration.map((p, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed text-zinc-200">
                      <span className="text-teal-300/70">→</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-xs text-zinc-500">可能落地的产品方向：</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {scene.agentViews.applicableProducts.map((p) => (
                    <span
                      key={p}
                      className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-xs text-zinc-300"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <footer className="mt-10 border-t border-zinc-800 pt-5 text-xs text-zinc-600">
          本页为结构化研究拆解，不含影视片段；场景位置仅供你在正版渠道中查找原片。
        </footer>
      </div>
    </main>
  );
}
