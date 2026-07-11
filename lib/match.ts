import { SCENES_WITH_WORK } from "@/data/scenes";
import type { MatchResponse, MechanismTag, SceneWithWork } from "@/lib/types";
import { MECHANISM_LABELS } from "@/lib/types";

// 本地匹配引擎：不依赖任何外部 API 即可完成「需求理解 → 场景推荐」。
// 配置 OPENAI_API_KEY 后，app/api/match/route.ts 会在此结果之上做 LLM 增强重排。

/** 中文关键词 → 机制标签 的信号词典 */
const KEYWORD_TO_MECHANISM: [string[], MechanismTag][] = [
  [["语音", "声音", "对话", "说话", "voice", "播客", "耳机"], "voice-interaction"],
  [
    ["主动", "介入", "提醒", "打扰", "打断", "推送", "干预", "时机"],
    "proactive-intervention",
  ],
  [["记忆", "记住", "遗忘", "忘记", "历史", "连续", "上下文"], "long-term-memory"],
  [
    ["情绪", "情感", "陪伴", "孤独", "关系", "亲密", "恋爱", "伴侣", "心理"],
    "emotion-relationship",
  ],
  [["空间", "全息", "投影", "AR", "VR", "眼镜", "在场", "房间", "环境"], "spatial-presence"],
  [["机器人", "机械", "具身", "实体", "硬件", "协作", "工厂"], "robot-collaboration"],
  [["权限", "授权", "控制", "允许", "访问", "范围"], "permission-control"],
  [["多人", "家庭", "团队", "群", "成员", "协同", "多用户"], "multi-user"],
  [
    ["失败", "错误", "接管", "兜底", "失控", "安全", "关机", "熔断", "故障"],
    "failure-takeover",
  ],
  [["人格", "性格", "角色", "拟人", "形象", "个性", "幽默"], "personified-expression"],
  [["透明", "解释", "可见", "状态", "坦白", "审计", "黑箱"], "transparency"],
  [["信任", "依赖", "可靠", "放心", "接受"], "trust-building"],
  [["目标", "对齐", "价值观", "意图", "动机"], "goal-alignment"],
  [["隐私", "监视", "偷看", "数据", "边界", "秘密"], "privacy-boundary"],
];

/** 常见产品形态词，用于生成「系统对需求的理解」 */
const PRODUCT_FORM_HINTS: [string[], string][] = [
  [["桌面", "电脑", "办公"], "桌面 Agent"],
  [["手机", "App", "app"], "移动端 AI 产品"],
  [["车", "座舱", "驾驶"], "车载智能体"],
  [["机器人", "具身", "硬件"], "具身机器人产品"],
  [["家庭", "家居", "老人", "孩子"], "家庭场景 AI"],
  [["陪伴", "伴侣", "角色", "恋爱"], "陪伴/角色型 AI"],
  [["客服", "销售", "营销"], "客户交互 Agent"],
  [["医疗", "健康", "心理"], "健康关怀类 AI"],
  [["教育", "学习", "老师"], "教育类 AI"],
  [["企业", "员工", "团队", "办公"], "企业级 Agent"],
];

export function extractMechanisms(query: string): MechanismTag[] {
  const hits = new Map<MechanismTag, number>();
  for (const [words, tag] of KEYWORD_TO_MECHANISM) {
    for (const w of words) {
      if (query.toLowerCase().includes(w.toLowerCase())) {
        hits.set(tag, (hits.get(tag) ?? 0) + 1);
      }
    }
  }
  return [...hits.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)
    .slice(0, 5);
}

function detectProductForm(query: string): string {
  for (const [words, form] of PRODUCT_FORM_HINTS) {
    if (words.some((w) => query.includes(w))) return form;
  }
  return "AI 产品";
}

function scoreScene(
  scene: SceneWithWork,
  query: string,
  mechanisms: MechanismTag[],
): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  // 机制标签重合：主信号
  const overlap = scene.mechanisms.filter((m) => mechanisms.includes(m));
  score += overlap.length * 10;
  if (overlap.length > 0) {
    reasons.push(
      `涉及你关注的机制：${overlap.map((m) => MECHANISM_LABELS[m]).join("、")}`,
    );
  }

  // 关键词命中：辅助信号
  const kwHits = scene.keywords.filter((k) => query.includes(k));
  score += kwHits.length * 4;
  if (kwHits.length > 0) {
    reasons.push(`与「${kwHits.slice(0, 3).join("、")}」直接相关`);
  }

  // 全文弱信号：需求词出现在摘要/分析中
  const text =
    scene.summary + scene.analysis.humanGoal + scene.analysis.failureMode;
  const chars = query.replace(/[，。,.!？?\s]/g, "").split("");
  const bigrams = new Set<string>();
  for (let i = 0; i < chars.length - 1; i++) bigrams.add(chars[i] + chars[i + 1]);
  let weak = 0;
  for (const bg of bigrams) if (text.includes(bg)) weak++;
  score += Math.min(weak, 8);

  return {
    score,
    reason: reasons.join("；") || "机制结构与你的问题存在潜在同构",
  };
}

const CORE_QUESTION_BY_MECHANISM: Partial<Record<MechanismTag, string>> = {
  "proactive-intervention": "AI 应该在什么信号出现时介入？介入被拒绝后怎么办？",
  "privacy-boundary": "用户如何感知「被帮助」和「被监视」的边界？",
  "trust-building": "第一次信任是靠什么瞬间建立的？靠什么行为维持？",
  "permission-control": "权限请求的时机和粒度如何设计？",
  "long-term-memory": "AI 应该记住什么、忘掉什么？遗忘权归谁？",
  "emotion-relationship": "关系深度靠什么积累？如何避免操纵式亲密？",
  "spatial-presence": "AI 存在于哪些空间？在场感如何设计？",
  "failure-takeover": "失败时人类如何接管？控制通道是否独立于 AI？",
  "personified-expression": "人格是否可调、可解释、可预期？",
  transparency: "AI 的判断依据对用户可见吗？",
  "goal-alignment": "AI 优化的目标和用户以为的目标一致吗？",
  "multi-user": "多个用户之间，AI 的立场和信息墙如何设计？",
  "voice-interaction": "语音交互中的打断、停顿、沉默如何处理？",
  "robot-collaboration": "人机分工的边界在哪里？谁做判断，谁做执行？",
};

export function localMatch(query: string, limit = 4): MatchResponse {
  const mechanisms = extractMechanisms(query);
  const scored = SCENES_WITH_WORK.map((scene) => ({
    scene,
    ...scoreScene(scene, query, mechanisms),
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const coreQuestions = mechanisms
    .map((m) => CORE_QUESTION_BY_MECHANISM[m])
    .filter((q): q is string => !!q)
    .slice(0, 4);

  return {
    understanding: {
      productForm: detectProductForm(query),
      coreQuestions:
        coreQuestions.length > 0
          ? coreQuestions
          : ["这个 AI 与人的关系是什么？它靠什么获得存在的许可？"],
      matchedMechanisms: mechanisms,
    },
    results: scored,
    llmEnhanced: false,
  };
}
