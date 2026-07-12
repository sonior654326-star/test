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

const muted = (p: number) =>
  ({ color: `color-mix(in srgb, var(--color-text) ${p}%, transparent)` }) as const;

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
    <div className="lab-grid">
      <nav
        className="nav"
        style={{
          maxWidth: 900,
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
          maxWidth: 900,
          margin: "0 auto",
          padding: "0 clamp(20px,5vw,48px) 80px",
        }}
      >
        <header style={{ paddingTop: "clamp(40px,7vw,64px)" }}>
          <p
            className="num"
            style={{
              fontSize: 12,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "var(--color-accent-700)",
              margin: "0 0 18px",
            }}
          >
            按行业进入 · Industry Lens
          </p>
          <h1
            className="display"
            style={{
              fontWeight: 400,
              fontSize: "clamp(32px,4.6vw,52px)",
              lineHeight: 1.08,
              margin: 0,
              textWrap: "balance",
            }}
          >
            为「{industry.name}」从业者挑的素材
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.65, margin: "16px 0 0", maxWidth: "60ch", ...muted(72) }}>
            {industry.blurb}
          </p>
        </header>

        <nav style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {INDUSTRIES.map((i) => (
            <Link
              key={i.slug}
              href={`/industry/${i.slug}`}
              className={i.slug === slug ? "tag tag-outline" : "tag tag-neutral"}
              style={{ fontSize: 13, padding: "5px 12px", textDecoration: "none" }}
            >
              {i.name}
            </Link>
          ))}
        </nav>

        <hr className="hr" style={{ margin: "28px 0 4px" }} />
        <p className="num" style={{ fontSize: 13, margin: "0 0 4px", ...muted(55) }}>
          {items.length} 条素材能启发你 ↓
        </p>

        <div>
          {items.map(({ scene, prompt }) => (
            <Link
              key={scene.id}
              href={`/scene/${scene.id}`}
              className="scene-row"
              style={{
                display: "block",
                padding: "22px 6px",
                borderBottom: "1px solid var(--color-divider)",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <p className="num" style={{ fontSize: 12, margin: 0, ...muted(52) }}>
                <span style={{ fontStyle: "italic" }}>《{scene.work.title}》</span>{" "}
                {scene.work.originalTitle} · {scene.work.year}
                {scene.video && (
                  <>
                    {" "}
                    <span className="tag tag-outline" style={{ fontSize: 10, padding: "1px 7px" }}>
                      片段
                    </span>
                  </>
                )}
              </p>
              <p
                className="serif"
                style={{ fontWeight: 600, fontSize: 22, lineHeight: 1.2, margin: "6px 0 10px" }}
              >
                {scene.sceneTitle}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {scene.mechanisms.slice(0, 3).map((m) => (
                  <span key={m} className="tag tag-neutral">
                    {MECHANISM_LABELS[m]}
                  </span>
                ))}
              </div>
              <p
                style={{
                  margin: "12px 0 0",
                  borderLeft: "2px solid var(--color-accent)",
                  paddingLeft: 14,
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  color: "var(--color-accent-800)",
                }}
              >
                {prompt}
              </p>
            </Link>
          ))}
        </div>

        <footer
          style={{
            marginTop: 40,
            paddingTop: 26,
            borderTop: "1px solid var(--color-divider)",
            fontSize: 12.5,
            lineHeight: 1.7,
            ...muted(52),
          }}
        >
          这些联想只是入口 —— 点进任意场景，还有 14 维机制拆解与多个认知视角。
        </footer>
      </main>
    </div>
  );
}
