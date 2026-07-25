"""工序 3 · 多维标注：每个片段的维度 / 事件类型 / 数值变化(delta) / 一句话机制。

delta（-5..+5）是网站时间轴信任/情绪曲线的数据来源。
用法：python 03_annotate.py --events work/events.json --srt film.srt --out work/clips.json
"""

import argparse
import json

from common import DIM_ZH, DIMS, extract_json, llm, parse_srt, save

SYSTEM = f"""你是影片交互分析产线的「多维标注器」，为人机交互片段打维度标签。
维度枚举（只能用这些英文名）：{", ".join(f"{d}({DIM_ZH[d]})" for d in DIMS)}
规则：
1) 一个片段可属多个维度（如拥抱=trust 跃迁 + body 触觉）。只标真正发生变化或被展示的维度。
2) delta 为该维度的变化量，整数 -5..+5（信任崩塌= -5，信任跃迁= +3 之类；无净变化=0）。
3) note 写「机制」不写剧情复述——检验：遮住片名这句话对产品设计师还有没有用。
4) 只依据给出的台词证据判断；台词看不出的不要编，宁可少标。
只输出 JSON：
{{"dimensions":[{{"dim":"trust","event_type":"简短类型标签","delta":2,"note":"一句话机制"}}]}}"""


def sub_text_between(subs, t_start: str, t_end: str) -> str:
    return "\n".join(s["text"] for s in subs if t_start <= s["start"] <= t_end)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--events", required=True)
    ap.add_argument("--srt", required=True)
    ap.add_argument("--film-id", default="film")
    ap.add_argument("--out", default="work/clips.json")
    args = ap.parse_args()

    data = json.load(open(args.events, encoding="utf-8"))
    subs = parse_srt(args.srt)
    clips = []
    for i, e in enumerate(data["related"]):
        dialogue = sub_text_between(subs, e["t_start"], e["t_end"]) or "（本段无台词）"
        print(f"标注 {i + 1}/{len(data['related'])}：{e['event_desc'][:30]}…")
        out = llm(
            SYSTEM,
            f"新主体：{data['subject']}\n片段：{e['t_start']}-{e['t_end']}"
            f"「{e['event_desc']}」\n角色：{'、'.join(e.get('characters', []))}\n"
            f"台词证据：\n{dialogue}",
        )
        ann = extract_json(out)
        clips.append({
            "film_id": args.film_id,
            "clip_id": f"c{i + 1:02d}",
            "t_start": e["t_start"],
            "t_end": e["t_end"],
            "event_desc": e["event_desc"],
            "characters": e.get("characters", []),
            "dimensions": ann.get("dimensions", []),
            "evidence_tier": "work",  # 台词推导级；人工校验时可升级
        })

    save(args.out, {"film_id": args.film_id, "subject": data["subject"], "clips": clips})
    print(f"共 {len(clips)} 个标注片段。下一步：04_tracks.py（或先人工校验本文件）")


if __name__ == "__main__":
    main()
