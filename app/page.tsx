"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SCENES_WITH_WORK } from "@/data/scenes";
import { MECHANISM_LABELS } from "@/lib/types";
import { INDUSTRIES, industryCounts } from "@/lib/industries";
import Link from "next/link";

const IND_COUNTS = industryCounts();

const EXAMPLES = [
  "我想做一个能主动帮助用户、但又不会让人感到被监视的桌面 Agent",
  "AI 陪伴产品如何建立长期信任，而不是靠讨好和操纵？",
  "家庭机器人面对多个家庭成员时，立场和权限应该怎么设计？",
  "我的 Agent 拿到了很高的系统权限，失控时用户怎么接管？",
];

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const go = (q: string) => {
    const v = q.trim();
    if (!v) return;
    router.push(`/results?q=${encodeURIComponent(v)}`);
  };

  return (
    <main className="lab-grid flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl">
        <p className="font-mono text-xs tracking-[0.3em] text-teal-300/70 uppercase">
          ImagineLab · 人机关系实验档案馆
        </p>
        <h1 className="mt-4 text-3xl sm:text-4xl font-semibold leading-snug text-zinc-50">
          你正在思考什么样的 AI 产品？
        </h1>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          影视已经替人类预演了大量尚未被工程实现的人机关系。输入你的问题，
          从这些想象实验中获得交互机制与产品启发。
        </p>

        <div className="mt-8">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                go(query);
              }
            }}
            rows={3}
            placeholder="描述你的产品、你卡住的交互问题，或一个模糊的想法……"
            className="w-full resize-none rounded-xl border border-zinc-700/80 bg-zinc-900/80 p-4 text-zinc-100 placeholder:text-zinc-500 focus:border-teal-400/60 focus:outline-none"
          />
          <button
            onClick={() => go(query)}
            className="mt-3 w-full rounded-xl bg-teal-400/90 py-3 font-medium text-zinc-950 transition hover:bg-teal-300 sm:w-auto sm:px-8"
          >
            进入想象空间 →
          </button>
        </div>

        <Link
          href="/deep/baymax"
          className="mt-6 block rounded-xl border border-teal-400/30 bg-teal-400/[0.06] p-4 transition hover:border-teal-400/60"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-teal-300/80">
            单素材深挖 · 样板
          </p>
          <p className="mt-1.5 font-medium text-zinc-100">
            大白：一个素材，挖到极限 →
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            视频站内直看 · 逐拍 / 机制 / 八视角 / 迁移 / 反事实 / 能力缺口 六层深挖
          </p>
        </Link>

        <p className="mt-3 text-sm">
          <Link href="/analyze" className="text-teal-300/80 hover:text-teal-200">
            或者：上传一段视频，让 AI 拆解它的交互机制 →
          </Link>
        </p>

        <div className="mt-8 space-y-2">
          <p className="text-xs text-zinc-500">试试这些问题：</p>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => go(ex)}
              className="block w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-left text-sm text-zinc-400 transition hover:border-teal-400/40 hover:text-zinc-200"
            >
              {ex}
            </button>
          ))}
        </div>

        <div className="mt-14 border-t border-zinc-800 pt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-medium text-zinc-300">按行业进入</h2>
            <p className="font-mono text-[10px] text-zinc-600">FIND WHAT SPARKS YOU</p>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            你在做哪类 AI？直接看最能启发你的素材。
          </p>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {INDUSTRIES.map((ind) => (
              <Link
                key={ind.slug}
                href={`/industry/${ind.slug}`}
                className="group flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 transition hover:border-teal-400/40"
              >
                <div>
                  <p className="font-medium text-zinc-200 group-hover:text-teal-200">
                    {ind.name}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-zinc-500">
                    {ind.blurb}
                  </p>
                </div>
                <span className="ml-3 shrink-0 font-mono text-xs text-teal-300/70">
                  {IND_COUNTS[ind.slug]} →
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-zinc-800 pt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-medium text-zinc-300">
              场景档案 · {SCENES_WITH_WORK.length} 条
            </h2>
            <p className="font-mono text-[10px] text-zinc-600">
              STRUCTURED HUMAN-AI SCENE ARCHIVE
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SCENES_WITH_WORK.map((s) => (
              <Link
                key={s.id}
                href={`/scene/${s.id}`}
                className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition hover:border-teal-400/40"
              >
                <p className="font-mono text-[10px] text-zinc-500">
                  《{s.work.title}》 {s.work.year}
                  {s.video && <span className="ml-1.5 text-teal-300/80">🎬 可看片段</span>}
                </p>
                <p className="mt-1 font-medium text-zinc-200 group-hover:text-teal-200">
                  {s.sceneTitle}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.mechanisms.slice(0, 3).map((m) => (
                    <span
                      key={m}
                      className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-400"
                    >
                      {MECHANISM_LABELS[m]}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-zinc-800 pt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-medium text-zinc-300">开放放映室</h2>
            <p className="font-mono text-[10px] text-zinc-600">OPEN LICENSE SCREENING</p>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            《Tears of Steel》—— Blender 基金会的开源科幻短片（CC-BY 授权，可自由观看）：
            人类与失控机器人的战争，源于一段关于机器人的记忆重演实验。
          </p>
          <div className="mt-3 overflow-hidden rounded-xl border border-zinc-800 bg-black">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 h-full w-full"
                src="https://www.youtube-nocookie.com/embed/R6MlUcmOul8"
                title="Tears of Steel - Blender VFX Open Movie"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <footer className="mt-14 border-t border-zinc-800 pt-6 text-xs leading-relaxed text-zinc-600">
          本站不托管任何影视片段；场景视频均为 YouTube 官方/公开渠道嵌入，版权归原权利方所有。
          结构化拆解为本站原创研究内容。
        </footer>
      </div>
    </main>
  );
}
