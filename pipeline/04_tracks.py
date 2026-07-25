"""工序 4 · 维度轨道生成：按维度抽片段 → 时序 → 承接语 → 一条可看的「线」。

用法：python 04_tracks.py --clips work/clips.json --dim trust --out work/track_trust.json
"""

import argparse
import json

from common import DIM_ZH, extract_json, llm, save

SYSTEM = """你是影片交互分析产线的「轨道编织器」。
输入：同一维度下按时间排序的片段列表（含各自的机制说明与 delta）。
任务：为每两个相邻片段写一句「承接语」——解释从上一段到这一段之间，
该维度发生了什么演变（不复述剧情，写机制的推进）。另写一句整条线的「导语」。
只输出 JSON：
{"intro":"整条线的导语（一两句）","bridges":["片段1→2 的承接语", "片段2→3 的承接语", …]}
bridges 数量 = 片段数 - 1。"""


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--clips", required=True)
    ap.add_argument("--dim", required=True, help="trust / emotion / permission / body / …")
    ap.add_argument("--out", default=None)
    args = ap.parse_args()

    data = json.load(open(args.clips, encoding="utf-8"))
    picked = []
    for c in data["clips"]:
        hit = next((d for d in c["dimensions"] if d["dim"] == args.dim), None)
        if hit:
            picked.append({**c, "hit": hit})
    picked.sort(key=lambda c: c["t_start"])
    if len(picked) < 2:
        raise SystemExit(f"维度 {args.dim} 命中片段不足（{len(picked)} 个），无法成线")

    listing = "\n".join(
        f"{i + 1}. [{c['t_start']}] {c['event_desc']} ｜ {c['hit']['event_type']}"
        f"（delta {c['hit']['delta']:+d}）：{c['hit']['note']}"
        for i, c in enumerate(picked)
    )
    print(f"维度「{DIM_ZH.get(args.dim, args.dim)}」命中 {len(picked)} 段，生成承接语…")
    out = extract_json(llm(SYSTEM, f"维度：{DIM_ZH.get(args.dim, args.dim)}\n片段：\n{listing}"))

    track = {
        "film_id": data["film_id"],
        "subject": data["subject"],
        "dim": args.dim,
        "dim_zh": DIM_ZH.get(args.dim, args.dim),
        "intro": out.get("intro", ""),
        "stops": [
            {
                "clip_id": c["clip_id"],
                "t_start": c["t_start"],
                "t_end": c["t_end"],
                "event_desc": c["event_desc"],
                "event_type": c["hit"]["event_type"],
                "delta": c["hit"]["delta"],
                "note": c["hit"]["note"],
                "bridge_to_next": out["bridges"][i] if i < len(out.get("bridges", [])) else None,
            }
            for i, c in enumerate(picked)
        ],
    }
    save(args.out or f"work/track_{args.dim}.json", track)
    # 顺手打印一份人读版
    print(f"\n—— {data['subject']} · {track['dim_zh']}线（{len(picked)} 段）——")
    print(track["intro"])
    for s in track["stops"]:
        print(f"  [{s['t_start']}] {s['event_desc']}（{s['event_type']} {s['delta']:+d}）")
        if s["bridge_to_next"]:
            print(f"      ↓ {s['bridge_to_next']}")


if __name__ == "__main__":
    main()
