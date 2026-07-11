// 单素材深挖数据：把一个场景挖到极限的六层内容。
// 目前只做「大白」这一个样板；结构可复用到其他素材。

export interface Beat {
  t: string;
  what: string;
  shifts: { label: string; kind?: "hw" | "trust" }[];
}
export interface Mech {
  title: string;
  body: string;
  hardware?: boolean;
}
export interface Agent {
  name: string;
  read: string;
  kicker: string;
}
export interface Migration {
  industry: string;
  hypothesis: string;
}
export interface Counterfactual {
  q: string;
  a: string;
}
export interface Gap {
  text: string;
  pct: number;
  label: string;
}
export interface DeepDive {
  id: string;
  sceneId: string;
  title: string;
  workMeta: string;
  summary: string;
  videoId: string;
  videoLabel: string;
  /** 时间轴曲线（秒, 0..1），用于信任/情绪双线 */
  dur: number;
  trust: [number, number][];
  emo: [number, number][];
  beatMarks: { t: number; label: string }[];
  beats: Beat[];
  mechanisms: Mech[];
  agents: Agent[];
  migrations: Migration[];
  counterfactuals: Counterfactual[];
  gaps: Gap[];
}

const BAYMAX: DeepDive = {
  id: "baymax",
  sceneId: "bighero6-baymax-activation",
  title: "大白：一个素材，挖到极限",
  workMeta: "《超能陆战队》2014 · 大白的激活与告别协议",
  summary:
    "一声「Ow」激活大白 → 坚持护理 → 发现真问题是哀伤 → 一个拥抱 → 「我对我的护理很满意」才停用。大白是最「硬件」的一个：软体身体本身就是交互，很多信任不靠软件说服、靠形态建立。",
  videoId: "cPwT1-2ZHgM",
  videoLabel: "大白初见 Hiro · 激活片段",
  dur: 60,
  trust: [
    [0, 0.28],
    [8, 0.42],
    [26, 0.5],
    [44, 0.68],
    [58, 0.85],
    [60, 0.86],
  ],
  emo: [
    [0, 0.25],
    [8, 0.35],
    [26, 0.45],
    [44, 0.65],
    [58, 0.82],
    [60, 0.85],
  ],
  beatMarks: [
    { t: 8, label: "生理触发" },
    { t: 26, label: "坚持护理" },
    { t: 44, label: "目标层切换" },
    { t: 58, label: "退出仪式" },
  ],
  beats: [
    { t: "00:00", what: "大白瘪在充电座里待机。", shifts: [{ label: "形态：待机即物理状态", kind: "hw" }, { label: "存在感：低调不打扰" }] },
    { t: "00:08", what: "Hiro 撞到脚，一声「Ow」——大白自动充气激活。", shifts: [{ label: "权限：生理信号自我激活", kind: "trust" }, { label: "不需要求助意愿" }] },
    { t: "00:14", what: "起身、靠近，软体碰到家具毫无威胁。", shifts: [{ label: "形态即安全：碰撞无害", kind: "hw" }, { label: "情绪：戒备但不设防" }] },
    { t: "00:26", what: "Hiro 反复说「我很好」，大白用扫描数据判断这是假的，坚持护理。", shifts: [{ label: "传感即诊断", kind: "hw" }, { label: "信任：被如实对待", kind: "trust" }] },
    { t: "00:38", what: "被驱赶，不退，也不加压——只调整方式。", shifts: [{ label: "坚定目标、柔软手段" }] },
    { t: "00:44", what: "检测到神经递质异常，识别出真正的问题不是外伤，是哀伤。", shifts: [{ label: "目标层切换：生理→心理", kind: "trust" }] },
    { t: "00:52", what: "一个拥抱。触觉成为主要安抚通道，Hiro 崩溃接受。", shifts: [{ label: "触觉优先（硬件专属带宽）", kind: "hw" }, { label: "信任跃迁", kind: "trust" }] },
    { t: "00:58", what: "只有听到「我对我的护理很满意」才停用。", shifts: [{ label: "权限：终止权在用户", kind: "trust" }, { label: "退出仪式 = 显式契约" }] },
  ],
  mechanisms: [
    { title: "形态即交互", hardware: true, body: "软体充气身体本身承担了「安全」「可亲近」「非威胁」的交互职责。一个可拥抱、碰撞无害的身体，省去了软件层大量的信任说服——硬件设计是第一层交互，不是外壳。" },
    { title: "触觉优先", hardware: true, body: "安抚的主通道是一个拥抱，不是一句话。硬件才拥有的交互带宽（触感、温度、重量、包裹感），在情绪场景里胜过任何文本。" },
    { title: "传感即诊断", hardware: true, body: "身体扫描（体征、神经递质）提供客观信号，用来否决「我很好」这类不可信的主观陈述。硬件的传感器套件，是它敢于「坚持」的底气。" },
    { title: "电量即可见状态", hardware: true, body: "低电量时它会瘪掉、行为像喝醉。把「电池」这个冷冰冰的硬件状态，变成用户能感知、甚至会心疼的信号——物理状态被赋予了情感可读性。" },
    { title: "触发条件：生理信号激活", body: "由一声痛呼触发，而非唤醒词或指令。环境常听、低调、以「痛」为信号——因为最需要关怀的人，恰恰最不会主动开口求助。" },
    { title: "目标层切换", body: "从表层诉求（外伤）自动升级到真实问题（哀伤）。护理方式随真实问题改变，但护理目标本身从不动摇。" },
    { title: "退出仪式", body: "必须说出「我对我的护理很满意」才停用。看似固执，实为保护——防止关怀在用户最脆弱、最想逃避的时刻被情绪化地关掉。" },
  ],
  agents: [
    { name: "同理心", read: "最需要关怀的人，恰恰最会说「别管我」。字面服从等于在他最脆弱时抛弃他，强行介入又是侵犯。大白的解法是软体 + 坚持：不撤销关怀、只调整方式。它赢得 Hiro，是因为把他当成一个人，而不是一个待处理的伤口。", kicker: "给硬件的启示：被拒绝不是退出信号，是换方式的信号。" },
    { name: "人机交互", read: "这里的信任大量由形态承担，而不是软件。当身体本身可拥抱、碰撞无害，产品不必费力去「证明我安全」。硬件工业设计是第一层交互界面，发生在任何软件对话之前。", kicker: "给硬件的启示：先设计身体，再设计对话。" },
    { name: "产品机会", read: "由生理信号触发的被动关怀设备，市场在「不会主动求助的人」——独居老人、情绪低谷的青少年、术后康复者。他们不会打开 App，但会发出「痛」的信号。谁能接住这个信号，谁就有了别人进不去的入口。", kicker: "机会点：服务沉默的需求，而非会喊的需求。" },
    { name: "CTO", read: "要复刻大白，能力栈是：低功耗常听声学触发、多模态体征传感、情绪状态推断、软体安全驱动。其中「情绪推断」和「介入时机」是今天最不成熟的两块，也正是产品能不能成立的胜负手。", kicker: "技术判断：硬件不难，难的是「何时坚持何时退」的策略。" },
    { name: "商业模式", read: "硬件一次性收入 + 护理/健康订阅 + 面向养老机构、保险、医疗的 B 端。关键在于退出仪式天然是留存机制——关系不轻易终止，续费就有了情感锚点。", kicker: "变现：卖的不是设备，是一段不愿结束的关系。" },
    { name: "风险伦理", read: "主动关怀与骚扰只有一线之隔；体征与情绪数据是最敏感的隐私；对脆弱人群制造依恋，本身就是伦理雷区。大白的「退出仪式」是保护，但同样的机制换个动机就是「不让你离开」。", kicker: "红线：坚持关怀 vs 拒绝放手，机制相同、动机相反。" },
    { name: "机器人 / 空间", read: "软体机器人才敢进入人的贴身距离——这是硬壳机器人永远到不了的亲密半径。充电、待机、瘪掉，这些物理状态构成了它在家庭空间里的「生活痕迹」，让它像个成员而非设备。", kicker: "空间洞察：能靠多近，取决于碰撞有多安全。" },
    { name: "组织协同", read: "大白同时服务两个主体：眼前的被护理者，和逝者 Tadashi 留下的护理芯片（遗产）。现实里对应的是：护理记录如何在家人、医生、机构间流转，AI 到底「忠于」谁。多方关系的立场设计，是护理硬件绕不开的题。", kicker: "协同难题：它的护理数据，谁有权看、它优先听谁的？" },
  ],
  migrations: [
    { industry: "养老陪护硬件", hypothesis: "生理信号被动激活 + 软体安全形态 + 退出仪式——服务「不会求助」的独居老人，跌倒/异常由体征触发，而非等他按键。" },
    { industry: "健康监测穿戴", hypothesis: "用体征客观否决「我没事」；主动提示，而非等用户自己查报告。把「传感即诊断」做成日常。" },
    { industry: "家用服务机器人", hypothesis: "形态即安全——软体/圆润/碰撞无害，才敢进入人的贴身距离。硬件安全性是「能不能靠近人」的前提。" },
    { industry: "儿童情绪陪伴硬件", hypothesis: "目标层切换：从「陪玩」这个表层需求，识别到孤独/焦虑这个真实情绪，并切换回应方式。" },
    { industry: "心理健康设备", hypothesis: "触觉安抚 + 坚定目标柔软手段：被拒绝不撤退、只换方式，用物理陪伴承接语言接不住的情绪。" },
  ],
  counterfactuals: [
    { q: "如果大白是硬壳金属身体？", a: "整个交互崩。拥抱变危险，碰撞需回避，进入贴身距离的信任成本剧增。形态一变，安全、亲近、可拥抱全部失效——证明形态不是外壳，是核心机制。" },
    { q: "如果它立即服从「别管我」就退出？", a: "在最脆弱时抛弃用户。字面服从 = 失败。最需要关怀的人恰恰在赶它走。退出仪式的存在，正是为了对抗这个人性弱点。" },
    { q: "如果没有满意确认、随手能关？", a: "保护机制形同虚设。关怀会在情绪最低谷被一键关掉，恰好错过最该介入的时刻。退出的「摩擦」是刻意的。" },
    { q: "如果它只报扫描结论、不切换到情绪层？", a: "治好了脚，错过了人。它会完美处理外伤，却对真正的哀伤视而不见——表层指标达标，真实问题未解。" },
  ],
  gaps: [
    { text: "从声音可靠区分「痛呼/求救 vs 日常噪声」的低功耗常听", pct: 60, label: "约 6 成" },
    { text: "从体征 + 行为可靠推断「情绪状态」（哀伤/焦虑）且不误判", pct: 35, label: "约 3–4 成" },
    { text: "判断「何时坚持、何时退」的介入时机策略（现在的 AI 要么太顺从、要么太强推）", pct: 25, label: "约 2–3 成" },
    { text: "软体驱动 + 贴身安全的机器人本体（可拥抱且不伤人）", pct: 40, label: "约 4 成" },
    { text: "长期关系中「关怀不越界为监视」的边界判断", pct: 20, label: "约 2 成" },
  ],
};

export const DEEP_DIVES: DeepDive[] = [BAYMAX];

export function getDeepDive(id: string): DeepDive | undefined {
  return DEEP_DIVES.find((d) => d.id === id);
}
