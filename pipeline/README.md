# 影片拆分产线（本地运行）

把一部影片拆成带维度标签的交互片段，并生成「信任线」等维度轨道。
**产线在你本地跑（需要片源文件与字幕）；平台只使用产出的时间码+标注，与版权解耦。**

## 工序总览

```
影片.mp4 + 字幕.srt
  → 01_shots.py     镜头粗切（PySceneDetect，免费无 LLM）
  → 02_events.py    事件聚合（LLM：镜头+台词 → 交互事件片段）
  → 03_annotate.py  多维标注（LLM：每片段的维度/事件类型/数值变化）
  → 04_tracks.py    维度轨道（信任线/权限线… 时序+承接语）
```

## 安装

```bash
pip install scenedetect[opencv] requests
# 没有 .srt 字幕才需要（有字幕跳过）：
pip install openai-whisper
```

## 配置模型（OpenAI 兼容接口，国产模型直接用）

```bash
# DeepSeek（推理，工序 2/3/4 默认）
export PIPELINE_BASE_URL=https://api.deepseek.com/v1
export PIPELINE_API_KEY=sk-xxxx
export PIPELINE_MODEL=deepseek-chat

# 或 Qwen（DashScope 兼容模式）
# export PIPELINE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
# export PIPELINE_MODEL=qwen-plus
```

安全提醒：key 只放环境变量；先在服务商后台设好消费上限再用。

## 运行（以《超能陆战队》为例）

```bash
cd pipeline
python 01_shots.py --video bighero6.mp4 --out work/shots.json
python 02_events.py --srt bighero6.srt --shots work/shots.json \
    --subject "大白 Baymax" --out work/events.json
python 03_annotate.py --events work/events.json --srt bighero6.srt \
    --out work/clips.json
python 04_tracks.py --clips work/clips.json --dim trust --out work/track_trust.json
```

产出：
- `clips.json` — 20-40 个片段，schema 见下
- `track_trust.json` — 信任线（片段时序 + 每段承接语），可直接导入网站

## 片段 schema

```json
{
  "film_id": "bighero6",
  "clip_id": "c07",
  "t_start": "00:26:10", "t_end": "00:27:40",
  "event_desc": "Hiro 说我很好，大白扫描后坚持护理",
  "characters": ["Hiro", "Baymax"],
  "dimensions": [
    {"dim": "trust", "event_type": "试探→被如实对待", "delta": 2,
     "note": "谎言被温柔戳穿，反而奠定信任"},
    {"dim": "body", "event_type": "传感即诊断", "delta": 0,
     "note": "扫描数据否决主观陈述"}
  ],
  "evidence_tier": "work"
}
```

维度枚举：trust(信任) / emotion(情绪) / permission(权限) / body(身体) /
space(空间) / proactivity(主动性) / memory(记忆)。
delta 是该维度的变化量（-5..+5），是网站时间轴曲线的数据来源。

## 成本参考

一部片：工序 1 免费；工序 2-4 用 DeepSeek 约几元～几十元人民币。
人工校验（切点微调+标注抽查）约 2-4 小时。
