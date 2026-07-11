import Link from "next/link";
import { notFound } from "next/navigation";
import {
  INDUSTRIES,
  industryBySlug,
  scenesForIndustry,
} from "@/lib/industries";
import { MECHANISM_LABELS } from "@/lib/types";

export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ slug: i.slug }));
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = industryBySlug(slug);
  if (!industry) notFound();

  const items = scenesForIndustry(industry.name);

  return (
    <main className="lab-grid flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <Link href="/" className="font-mono text-xs text-zinc-500 hover:text-teal-300">
          ← ImagineLab
        </Link>

        <header className="mt-6">
          <p className="font-mono text-[11px] tracking-[0.28em] text-teal-300/80 uppercase">
            按行业进入 · Industry Lens
          </p>
          <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-zinc-50">
            为「{industry.name}」从业者挑的素材
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{industry.blurb}</p>
        </header>

        {/* 其他行业快速切换 */}
        <nav className="mt-6 flex flex-wrap gap-2">
          {INDUSTRIES.map((i) => (
            <Link
              key={i.slug}
              href={`/industry/${i.slug}`}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                i.slug === slug
                  ? "border-teal-400 bg-teal-400/10 text-teal-300"
                  : "border-zinc-700 text-zinc-400 hover:border-teal-400/40 hover:text-zinc-200"
              }`}
            >
              {i.name}
            </Link>
          ))}
        </nav>

        <p className="mt-8 font-mono text-xs text-zinc-500">
          {items.length} 条素材能启发你 ↓
        </p>

        <div className="mt-4 space-y-3">
          {items.map(({ scene, prompt }) => (
            <Link
              key={scene.id}
              href={`/scene/${scene.id}`}
              className="group block rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-teal-400/40"
            >
              <p className="font-mono text-[10px] text-zinc-500">
                《{scene.work.title}》({scene.work.year})
                {scene.video && (
                  <span className="ml-1.5 text-teal-300/80">🎬 可看片段</span>
                )}
              </p>
              <p className="mt-1 text-lg font-medium text-zinc-100 group-hover:text-teal-200">
                {scene.sceneTitle}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {scene.mechanisms.slice(0, 3).map((m) => (
                  <span
                    key={m}
                    className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-400"
                  >
                    {MECHANISM_LABELS[m]}
                  </span>
                ))}
              </div>
              <p className="mt-3 border-l-2 border-teal-400/40 pl-3 text-sm leading-relaxed text-teal-100/90">
                {prompt}
              </p>
            </Link>
          ))}
        </div>

        <footer className="mt-12 border-t border-zinc-800 pt-6 text-xs leading-relaxed text-zinc-600">
          这些联想只是入口 —— 点进任意场景，还有 14 维机制拆解与多个认知视角。
        </footer>
      </div>
    </main>
  );
}
