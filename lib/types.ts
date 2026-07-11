// 数据模型：与 supabase/schema.sql 中的表结构一一对应。
// Demo 阶段数据来自 data/scenes.ts 的静态种子；接入 Supabase 后类型不变。

/** 机制标签：场景检索与交叉索引的主轴 */
export type MechanismTag =
  | "voice-interaction" // 语音交互
  | "proactive-intervention" // 主动介入
  | "long-term-memory" // 长期记忆
  | "emotion-relationship" // 情绪与关系
  | "spatial-presence" // 空间存在
  | "robot-collaboration" // 机器人协作
  | "permission-control" // 权限与控制
  | "multi-user" // 多人交互
  | "failure-takeover" // 错误与人类接管
  | "personified-expression" // 人格化表达
  | "transparency" // 状态透明度
  | "trust-building" // 信任建立
  | "goal-alignment" // 目标对齐
  | "privacy-boundary"; // 隐私边界

export const MECHANISM_LABELS: Record<MechanismTag, string> = {
  "voice-interaction": "语音交互",
  "proactive-intervention": "主动介入",
  "long-term-memory": "长期记忆",
  "emotion-relationship": "情绪与关系",
  "spatial-presence": "空间存在",
  "robot-collaboration": "机器人协作",
  "permission-control": "权限与控制",
  "multi-user": "多人交互",
  "failure-takeover": "错误与人类接管",
  "personified-expression": "人格化表达",
  transparency: "状态透明度",
  "trust-building": "信任建立",
  "goal-alignment": "目标对齐",
  "privacy-boundary": "隐私边界",
};

/** 作品层 */
export interface Work {
  id: string;
  title: string;
  originalTitle: string;
  year: number;
  type: "film" | "tv" | "animation" | "game";
  description: string;
}

/** 机制拆解：从"剧情"到"机制"的 14 维结构化分析 */
export interface SceneAnalysis {
  humanGoal: string; // 人的目标
  aiGoal: string; // AI 的目标
  trigger: string; // 触发条件
  aiAction: string; // AI 的动作
  humanReaction: string; // 人的反应
  feedbackLoop: string; // 反馈回路
  emotionChange: string; // 情绪变化
  trustChange: string; // 信任变化
  permissionModel: string; // 权限如何建立
  memoryModel: string; // 记忆机制
  failureMode: string; // 失败模式
  recovery: string; // 失败后如何恢复
  relationshipShift: string; // 关系变化
  environmentRole: string; // 环境如何参与交互
}

/** 认知视角输出（第一版内置：原始观察 / 同理心 / 产品启发） */
export interface AgentViews {
  /** 原始观察：不下结论，只提出让用户自己看的问题 */
  observationPrompts: string[];
  /** 同理心视角：场景中人的真实感受与需求 */
  empathy: string;
  /** 产品启发：可迁移的机制与产品机会 */
  productInspiration: string[];
  /** 可迁移行业/产品形态 */
  applicableProducts: string[];
}

/**
 * 场景关联视频：仅嵌入 YouTube 上官方/公开渠道的预告片或片段，
 * 平台自身不托管任何影视文件。
 */
export interface SceneVideo {
  youtubeId: string;
  /** 视频是什么：官方预告片 / 官方片段等 */
  label: string;
  /** 来源频道说明 */
  source: string;
}

/** 场景层：平台的原子单位 */
export interface Scene {
  id: string;
  workId: string;
  sceneTitle: string;
  /** 场景在作品中的位置描述（供用户自行查看原片；平台不托管片源） */
  position: string;
  summary: string;
  context: string;
  characters: string[];
  aiForm: string; // AI 的存在形态：语音 / 全息 / 机器人 / 系统…
  mechanisms: MechanismTag[];
  analysis: SceneAnalysis;
  agentViews: AgentViews;
  /** 检索用关键词（中文），本地匹配的补充信号 */
  keywords: string[];
  /** 可选：关联视频（官方预告/片段的 YouTube 嵌入） */
  video?: SceneVideo;
  /**
   * 行业联想镜头：把这个场景的机制，翻译成对特定行业从业者的直接联想提问。
   * 目的是让 chat AI / 智能体 / 汽车座舱 等行业的人，看到素材就能联想到自己的产品。
   */
  industryLens?: { industry: string; prompt: string }[];
}

export interface SceneWithWork extends Scene {
  work: Work;
}

/** /api/match 的响应 */
export interface MatchResponse {
  /** 系统对需求的理解 */
  understanding: {
    productForm: string;
    coreQuestions: string[];
    matchedMechanisms: MechanismTag[];
  };
  results: {
    scene: SceneWithWork;
    score: number;
    reason: string;
  }[];
  /** 是否使用了 LLM 增强（未配 API key 时为 false，走本地匹配） */
  llmEnhanced: boolean;
}
