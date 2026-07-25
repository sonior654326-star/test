"""产线公共工具：LLM 调用（OpenAI 兼容）、srt 解析、JSON 落盘。"""

import json
import os
import re
import sys
import time
import urllib.request

BASE_URL = os.environ.get("PIPELINE_BASE_URL", "https://api.deepseek.com/v1").rstrip("/")
API_KEY = os.environ.get("PIPELINE_API_KEY", "")
MODEL = os.environ.get("PIPELINE_MODEL", "deepseek-chat")

DIMS = ["trust", "emotion", "permission", "body", "space", "proactivity", "memory"]
DIM_ZH = {
    "trust": "信任", "emotion": "情绪", "permission": "权限", "body": "身体",
    "space": "空间", "proactivity": "主动性", "memory": "记忆",
}


def llm(system: str, user: str, retries: int = 3) -> str:
    """调用 OpenAI 兼容 chat 接口，返回文本。要求 JSON 时由调用方在 prompt 中约束。"""
    if not API_KEY:
        sys.exit("缺少 PIPELINE_API_KEY 环境变量（见 pipeline/README.md）")
    body = json.dumps({
        "model": MODEL,
        "temperature": 0.3,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }).encode()
    req = urllib.request.Request(
        f"{BASE_URL}/chat/completions",
        data=body,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {API_KEY}"},
    )
    for i in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                data = json.load(r)
            return data["choices"][0]["message"]["content"]
        except Exception as e:  # noqa: BLE001 - 简单产线脚本，重试后报错即可
            if i == retries - 1:
                raise
            print(f"  LLM 调用失败（{e}），{2 ** i * 2}s 后重试…", file=sys.stderr)
            time.sleep(2 ** i * 2)
    raise RuntimeError("unreachable")


def extract_json(text: str):
    """从模型输出中提取 JSON（容忍 ```json 围栏与前后杂讯）。"""
    m = re.search(r"```(?:json)?\s*([\[{].*?[\]}])\s*```", text, re.S)
    if m:
        return json.loads(m.group(1))
    start = min([i for i in (text.find("["), text.find("{")) if i >= 0], default=-1)
    if start < 0:
        raise ValueError(f"模型输出中找不到 JSON：{text[:200]}")
    return json.loads(text[start:])


def parse_srt(path: str):
    """解析 .srt → [{start, end, text}]，时间为 'HH:MM:SS' 字符串。"""
    raw = open(path, encoding="utf-8-sig", errors="replace").read()
    entries = []
    for block in re.split(r"\n\s*\n", raw.strip()):
        lines = [l.strip() for l in block.splitlines() if l.strip()]
        if len(lines) < 2:
            continue
        tl = next((l for l in lines if "-->" in l), None)
        if not tl:
            continue
        m = re.match(r"(\d+:\d+:\d+)[,.]\d+\s*-->\s*(\d+:\d+:\d+)", tl)
        if not m:
            continue
        text = " ".join(l for l in lines[lines.index(tl) + 1:])
        text = re.sub(r"<[^>]+>", "", text)
        if text:
            entries.append({"start": m.group(1), "end": m.group(2), "text": text})
    return entries


def save(path: str, obj) -> None:
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
    print(f"✓ 写入 {path}")
