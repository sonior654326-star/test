import { SCENES_WITH_WORK } from "@/data/scenes";
import type { SceneWithWork } from "@/lib/types";

// 行业入口：把「行业联想镜头」组织成"按行业进入"的导航。
// name 必须与 data/scenes.ts 里 industryLens[].industry 的字符串完全一致。

export interface Industry {
  slug: string;
  name: string;
  blurb: string;
}

export const INDUSTRIES: Industry[] = [
  {
    slug: "chat",
    name: "对话式 AI",
    blurb: "做 Claude、DeepSeek 这类对话与推理助手：主动、信任、透明、记忆、目标边界的联想。",
  },
  {
    slug: "agent",
    name: "智能体 Agent",
    blurb: "做自主 Agent、代理执行：权限、接管、异议、目标漂移、可审计的联想。",
  },
  {
    slug: "car",
    name: "汽车座舱",
    blurb: "做车载交互与辅助驾驶：主动介入、空间输出、接管时机、长期陪伴的联想。",
  },
  {
    slug: "companion",
    name: "陪伴 / 情感 AI",
    blurb: "做陪伴、角色、情感 AI：依恋、信任、操纵边界、退出设计的联想。",
  },
  {
    slug: "robot",
    name: "机器人 / 具身",
    blurb: "做机器人与具身智能：在场感、护理边界、退出仪式、自我保存的联想。",
  },
  {
    slug: "health",
    name: "医疗健康 AI",
    blurb: "做健康、监护、心理 AI：介入时机、体征触发、目标边界的联想。",
  },
];

export function industryBySlug(slug: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug);
}

export interface IndustryScene {
  scene: SceneWithWork;
  prompt: string;
}

/** 取某行业对应的全部场景及其专属联想提问 */
export function scenesForIndustry(name: string): IndustryScene[] {
  return SCENES_WITH_WORK.map((scene) => {
    const lens = scene.industryLens?.find((l) => l.industry === name);
    return lens ? { scene, prompt: lens.prompt } : null;
  }).filter((x): x is IndustryScene => x !== null);
}

/** 每个行业的场景数，用于首页入口展示 */
export function industryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const ind of INDUSTRIES) {
    counts[ind.slug] = scenesForIndustry(ind.name).length;
  }
  return counts;
}
