// 片段库：影片拆分产线（pipeline/）的产出格式在网站侧的对应。
// 大白 8 片段为人工校验过的样板数据；后续影片由产线生成后导入。

export type Dim =
  | "trust"
  | "emotion"
  | "permission"
  | "body"
  | "space"
  | "proactivity"
  | "memory";

export const DIM_ZH: Record<Dim, string> = {
  trust: "信任",
  emotion: "情绪",
  permission: "权限",
  body: "身体",
  space: "空间",
  proactivity: "主动性",
  memory: "记忆",
};

export interface ClipDimension {
  dim: Dim;
  eventType: string;
  delta: number; // -5..+5，时间轴曲线的数据来源
  note: string; // 一句话机制（非剧情复述）
}

export interface Clip {
  filmId: string;
  clipId: string;
  tStart: string;
  tEnd: string;
  eventDesc: string;
  characters: string[];
  dimensions: ClipDimension[];
  evidenceTier: "creator" | "work" | "reconstructed";
}

export interface Track {
  filmId: string;
  subject: string;
  dim: Dim;
  intro: string;
  stops: {
    clipId: string;
    bridgeToNext?: string;
  }[];
}

export const BAYMAX_CLIPS: Clip[] = [
  {
    filmId: "bighero6",
    clipId: "c01",
    tStart: "00:00",
    tEnd: "00:08",
    eventDesc: "大白瘪在充电座里待机",
    characters: ["Baymax"],
    dimensions: [
      { dim: "body", eventType: "待机即物理状态", delta: 0, note: "存在感低调不打扰，待机形态本身传达「非监视」" },
      { dim: "space", eventType: "角落存在", delta: 0, note: "不占据房间中心，等待被需要" },
    ],
    evidenceTier: "work",
  },
  {
    filmId: "bighero6",
    clipId: "c02",
    tStart: "00:08",
    tEnd: "00:14",
    eventDesc: "Hiro 撞到脚一声「Ow」，大白自动充气激活",
    characters: ["Hiro", "Baymax"],
    dimensions: [
      { dim: "trust", eventType: "被动出现", delta: 1, note: "由生理信号触发而非闯入，信任的起点是「无压迫的出现」" },
      { dim: "proactivity", eventType: "生理信号激活", delta: 2, note: "不需要求助意愿——最需要关怀的人恰恰不会开口" },
      { dim: "permission", eventType: "自我激活", delta: 1, note: "痛觉即授权：以体征而非指令作为服务启动条件" },
    ],
    evidenceTier: "work",
  },
  {
    filmId: "bighero6",
    clipId: "c03",
    tStart: "00:14",
    tEnd: "00:26",
    eventDesc: "起身靠近，软体碰撞家具毫无威胁",
    characters: ["Hiro", "Baymax"],
    dimensions: [
      { dim: "body", eventType: "形态即安全", delta: 0, note: "碰撞无害的身体省去了软件层的信任说服" },
      { dim: "trust", eventType: "戒备但不设防", delta: 1, note: "亲近的成本被形态降到极低" },
      { dim: "space", eventType: "进入贴身距离", delta: 0, note: "能靠多近，取决于碰撞有多安全" },
    ],
    evidenceTier: "work",
  },
  {
    filmId: "bighero6",
    clipId: "c04",
    tStart: "00:26",
    tEnd: "00:38",
    eventDesc: "Hiro 反复说「我很好」，大白扫描后坚持护理",
    characters: ["Hiro", "Baymax"],
    dimensions: [
      { dim: "trust", eventType: "试探→被如实对待", delta: 2, note: "谎言被温柔戳穿，反而奠定信任——用客观信号校验主观陈述" },
      { dim: "body", eventType: "传感即诊断", delta: 0, note: "传感器套件是它敢于「坚持」的底气" },
    ],
    evidenceTier: "work",
  },
  {
    filmId: "bighero6",
    clipId: "c05",
    tStart: "00:38",
    tEnd: "00:44",
    eventDesc: "被驱赶，不退也不加压，只调整方式",
    characters: ["Hiro", "Baymax"],
    dimensions: [
      { dim: "trust", eventType: "坚持的分寸", delta: 1, note: "被拒绝不是退出信号，是换方式的信号——目标坚定、手段柔软" },
      { dim: "proactivity", eventType: "拒绝后的策略", delta: 0, note: "不撤销关怀、只改变方法，避开「字面服从=抛弃」陷阱" },
    ],
    evidenceTier: "work",
  },
  {
    filmId: "bighero6",
    clipId: "c06",
    tStart: "00:44",
    tEnd: "00:52",
    eventDesc: "检测到神经递质异常，识别真实问题是哀伤而非外伤",
    characters: ["Hiro", "Baymax"],
    dimensions: [
      { dim: "emotion", eventType: "目标层切换", delta: 2, note: "从表层诉求（外伤）自动升级到真实问题（哀伤）" },
      { dim: "trust", eventType: "被真正看见", delta: 2, note: "「它懂我没说出口的」是信任的第二级台阶" },
    ],
    evidenceTier: "work",
  },
  {
    filmId: "bighero6",
    clipId: "c07",
    tStart: "00:52",
    tEnd: "00:58",
    eventDesc: "一个拥抱，Hiro 崩溃接受",
    characters: ["Hiro", "Baymax"],
    dimensions: [
      { dim: "trust", eventType: "信任跃迁", delta: 3, note: "语言接不住的情绪由物理陪伴承接" },
      { dim: "body", eventType: "触觉优先", delta: 0, note: "硬件专属带宽：触感/温度/包裹感，在情绪场景胜过任何文本" },
      { dim: "emotion", eventType: "崩溃→接纳", delta: 3, note: "抗拒到依赖的转折点发生在身体接触，不在对话" },
    ],
    evidenceTier: "work",
  },
  {
    filmId: "bighero6",
    clipId: "c08",
    tStart: "00:58",
    tEnd: "01:00",
    eventDesc: "只有听到「我对我的护理很满意」才停用",
    characters: ["Hiro", "Baymax"],
    dimensions: [
      { dim: "permission", eventType: "退出仪式", delta: 2, note: "终止权在用户，但以显式契约防止关怀被情绪化关闭" },
      { dim: "trust", eventType: "信任的最终形态", delta: 1, note: "「它不会在我最糟时消失」——可预期的存在本身即信任" },
    ],
    evidenceTier: "work",
  },
];

export const BAYMAX_TRUST_TRACK: Track = {
  filmId: "bighero6",
  subject: "大白 Baymax",
  dim: "trust",
  intro:
    "大白从不用「说服」推高信任。这条线上的每一步都是一次形态或权限的动作——被动出现、如实对待、坚持的分寸、真正看见、物理承接、显式契约。信任是被做出来的，不是被说出来的。",
  stops: [
    { clipId: "c02", bridgeToNext: "出现方式解决了「它会不会压迫我」，下一步要解决「它靠近我安不安全」——答案不在软件里，在身体上。" },
    { clipId: "c03", bridgeToNext: "身体让靠近变得零成本，但真正的考验是第一次冲突：当人撒谎说「我很好」，它信还是不信？" },
    { clipId: "c04", bridgeToNext: "被如实对待之后，Hiro 开始驱赶它——这是所有关怀型产品的死亡谷：退出等于抛弃，强推等于骚扰。" },
    { clipId: "c05", bridgeToNext: "分寸稳住了关系，接下来发生质变：它看见了没被说出口的真实问题。" },
    { clipId: "c06", bridgeToNext: "看见之后怎么回应？语言在哀伤面前是无力的——信任跃迁发生在一个拥抱里。" },
    { clipId: "c07", bridgeToNext: "关系建立了，最后一块拼图是退出机制：它如何保证「不会在我最糟的时候消失」。" },
    { clipId: "c08" },
  ],
};

export function getTrack(filmId: string, dim: string): Track | undefined {
  if (filmId === "bighero6" && dim === "trust") return BAYMAX_TRUST_TRACK;
  return undefined;
}

export function clipById(filmId: string, clipId: string): Clip | undefined {
  return BAYMAX_CLIPS.find((c) => c.filmId === filmId && c.clipId === clipId);
}
