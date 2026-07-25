"""工序 1 · 镜头粗切（无 LLM）。

用法：python 01_shots.py --video film.mp4 --out work/shots.json
"""

import argparse

from common import save


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", required=True, help="影片文件路径")
    ap.add_argument("--out", default="work/shots.json")
    ap.add_argument("--threshold", type=float, default=27.0, help="切分灵敏度，越小越碎")
    args = ap.parse_args()

    from scenedetect import detect, ContentDetector  # noqa: PLC0415 - 延迟导入给出友好报错

    print(f"检测镜头边界：{args.video}（几分钟，取决于片长）…")
    scenes = detect(args.video, ContentDetector(threshold=args.threshold))
    shots = [
        {
            "index": i,
            "start": s[0].get_timecode()[:8],
            "end": s[1].get_timecode()[:8],
        }
        for i, s in enumerate(scenes)
    ]
    save(args.out, {"video": args.video, "shot_count": len(shots), "shots": shots})
    print(f"共 {len(shots)} 个镜头。下一步：02_events.py")


if __name__ == "__main__":
    main()
