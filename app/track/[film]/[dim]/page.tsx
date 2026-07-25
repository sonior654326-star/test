import Link from "next/link";
import { notFound } from "next/navigation";
import { clipById, DIM_ZH, getTrack, type Dim } from "@/data/clips";
import { getDeepDive } from "@/data/deepdive";

export function generateStaticParams() {
  return [{ film: "bighero6", dim: "trust" }];
}

const muted = (p: number) =>
  ({ color: `color-mix(in srgb, var(--color-text) ${p}%, transparent)` }) as const;

export default async function TrackPage({
  params,
}: {
  params: Promise<{ film: string; dim: string }>;
}) {
  const { film, dim } = await params;
  const track = getTrack(film, dim);
  if (!track) notFound();

  const dive = getDeepDive("baymax");

  // 预计算每一站的信任变化与累计值（曲线数据的来源）
  type Stop = {
    stop: (typeof track.stops)[number];
    clip: NonNullable<ReturnType<typeof clipById>>;
    hit: ReturnType<NonNullable<ReturnType<typeof clipById>>["dimensions"]["find"]>;
    running: number;
  };
  const stops = track.stops.reduce<Stop[]>((arr, stop) => {
    const clip = clipById(track.filmId, stop.clipId);
    if (!clip) return arr;
    const hit = clip.dimensions.find((d) => d.dim === track.dim);
    const prev = arr.length > 0 ? arr[arr.length - 1].running : 0;
    return [...arr, { stop, clip, hit, running: prev + (hit?.delta ?? 0) }];
  }, []);

  return (
    <div className="lab-grid">
      <nav
        className="nav"
        style={{
          maxWidth: 860,
          margin: "0 auto",
          paddingLeft: "clamp(20px,5vw,48px)",
          paddingRight: "clamp(20px,5vw,48px)",
        }}
      >
        <span className="nav-brand">
          未来遗产{" "}
          <span style={{ fontStyle: "italic", color: "var(--color-accent-700)" }}>
            Future Heritage
          </span>
        </span>
        <Link href="/deep/baymax">← 返回深挖</Link>
        <Link href="/">档案</Link>
      </nav>

      <main
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "0 clamp(20px,5vw,48px) 90px",
        }}
      >
        <header style={{ paddingTop: "clamp(40px,7vw,64px)", maxWidth: 720 }}>
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
            维度轨道 · {DIM_ZH[track.dim as Dim]}线
          </p>
          <h1
            className="display"
            style={{
              fontWeight: 400,
              fontSize: "clamp(34px,5vw,58px)",
              lineHeight: 1.06,
              margin: 0,
              textWrap: "balance",
            }}
          >
            {track.subject}：
            <br />
            信任是怎样一步步建立的
          </h1>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.75,
              margin: "20px 0 0",
              maxWidth: "58ch",
              ...muted(78),
            }}
          >
            {track.intro}
          </p>
          <p className="num" style={{ fontSize: 12.5, margin: "14px 0 0", ...muted(50) }}>
            {track.stops.length} 个片段 · 按发生顺序观看 · 每段标注该拍的信任变化
          </p>
        </header>

        {dive && (
          <p style={{ marginTop: 22 }}>
            <Link href={`/deep/${dive.id}`} className="btn btn-secondary" style={{ fontSize: 13, padding: "8px 18px" }}>
              ⟵ 这些片段的完整六层深挖
            </Link>
          </p>
        )}

        <hr className="hr" style={{ margin: "40px 0 0" }} />

        {/* 轨道 */}
        <div>
          {stops.map(({ stop, clip, hit, running }, i) => {
            return (
              <section key={stop.clipId}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "3.2rem 1fr auto",
                    gap: 20,
                    padding: "26px 6px 22px",
                    alignItems: "baseline",
                  }}
                >
                  <span className="num" style={{ fontSize: 15, color: "var(--color-accent-700)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="num" style={{ fontSize: 12, margin: 0, ...muted(50) }}>
                      {clip.tStart} – {clip.tEnd}
                    </p>
                    <p
                      className="serif"
                      style={{ fontWeight: 600, fontSize: 22, lineHeight: 1.25, margin: "6px 0 8px" }}
                    >
                      {clip.eventDesc}
                    </p>
                    {hit && (
                      <>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center" }}>
                          <span className="tag tag-outline">{hit.eventType}</span>
                          <span
                            className="tag tag-accent num"
                            title="本段信任变化量"
                          >
                            信任 {hit.delta >= 0 ? `+${hit.delta}` : hit.delta}
                          </span>
                          <span className="tag tag-neutral num" title="累计">
                            累计 {running}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: "12px 0 0",
                            borderLeft: "2px solid var(--color-accent)",
                            paddingLeft: 14,
                            fontSize: 14.5,
                            lineHeight: 1.65,
                            color: "var(--color-accent-800)",
                          }}
                        >
                          {hit.note}
                        </p>
                      </>
                    )}
                  </div>
                  <span style={{ fontSize: 18, color: "var(--color-accent)" }}>▶</span>
                </div>

                {stop.bridgeToNext && (
                  <div
                    style={{
                      margin: "0 0 0 3.2rem",
                      padding: "0 6px 24px 20px",
                      borderLeft: "1px dashed var(--color-divider)",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, fontStyle: "italic", ...muted(58) }}>
                      {stop.bridgeToNext}
                    </p>
                  </div>
                )}
                {i < stops.length - 1 && <hr className="hr" />}
              </section>
            );
          })}
        </div>

        <section
          style={{
            marginTop: 48,
            border: "1px solid var(--color-accent)",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-accent-100)",
            padding: "clamp(22px,3.6vw,36px)",
          }}
        >
          <p
            className="serif"
            style={{ fontWeight: 600, fontSize: "clamp(20px,2.4vw,26px)", margin: 0, color: "var(--color-accent-900)" }}
          >
            这条线由拆分产线自动生成的数据驱动。
          </p>
          <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.7, color: "var(--color-accent-800)", maxWidth: "66ch" }}>
            每个片段的「信任 ±N」来自产线工序 3 的多维标注，累计值就是深挖页那条信任曲线。
            同一个片段库还能织出权限线、身体线、情绪线——切一次，多线复用。
            片段视频将在版权片源接入后原位可播。
          </p>
        </section>

        <footer
          style={{
            marginTop: 48,
            paddingTop: 26,
            borderTop: "1px solid var(--color-divider)",
            fontSize: 12.5,
            lineHeight: 1.7,
            ...muted(52),
          }}
        >
          本页为结构化研究拆解；时间码为场景内相对时间，供在正版渠道中定位原片段。
        </footer>
      </main>
    </div>
  );
}
