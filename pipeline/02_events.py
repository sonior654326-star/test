"""工序 2 · 事件聚合：镜头 + 台词 → 交互事件片段。

切分单位是「交互事件」（触发→发起→动作→回应→关系变化），不是镜头。
用法：python 02_events.py --srt film.srt --shots work/shots.json \
        --subject "大白 Baymax" --out work/events.json
"""

import argparse
import json

from common import extract_json, llm, parse_srt, save

SYSTEM = """你是影片交互分析产线的「事件切分器」。
输入：一部影片的带时间戳台词（可能还有镜头边界）。
任务：把影片聚合为叙事事件列表。切分单位是「交互事件」——
一个完整回合：触发 → 谁发起 → 做了什么 → 对方如何回应 → 关系/状态变化。
规则：
1) 一个事件通常 30 秒到 3 分钟，覆盖一个完整回合，不要按镜头碎切。
2) 标记每个事件是否与指定的「新主体」（机器人/AI 角色）直接相关。
3) 只依据台词与时间线做判断，不要编造画面细节。
只输出 JSON 数组，每项：
{"t_start":"HH:MM:SS","t_end":"HH:MM:SS","event_desc":"一句话事件描述",
 "characters":["出场角色"],"subject_related":true/false}"""


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--srt", required=True)
    ap.add_argument("--shots", default=None, help="可选：01 的产出，辅助断点")
    ap.add_argument("--subject", required=True, help='新主体名，如 "大白 Baymax"')
    ap.add_argument("--out", default="work/events.json")
    ap.add_argument("--chunk", type=int, default=250, help="每批送入的台词条数")
    args = ap.parse_args()

    subs = parse_srt(args.srt)
    print(f"台词 {len(subs)} 条。")
    shots_note = ""
    if args.shots:
        shots = json.load(open(args.shots, encoding="utf-8"))
        shots_note = f"（参考：全片共 {shots['shot_count']} 个镜头切点）"

    events = []
    for i in range(0, len(subs), args.chunk):
        batch = subs[i : i + args.chunk]
        lines = "\n".join(f"[{s['start']}] {s['text']}" for s in batch)
        print(f"事件聚合 {i}-{i + len(batch)} …")
        out = llm(
            SYSTEM,
            f"新主体：{args.subject}{shots_note}\n\n台词（{batch[0]['start']} 起）：\n{lines}",
        )
        events.extend(extract_json(out))

    related = [e for e in events if e.get("subject_related")]
    save(args.out, {"subject": args.subject, "all_events": events, "related": related})
    print(f"共 {len(events)} 个事件，其中与新主体相关 {len(related)} 个。下一步：03_annotate.py")


if __name__ == "__main__":
    main()
