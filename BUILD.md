# BUILD.md — 开发状态

## 技术栈

Next.js 16 (App Router) + Tailwind 4 + TypeScript。
Demo 阶段无外部依赖；Supabase / OpenAI 为可选增强（见 README 部署章节）。

## 已完成（Day 1 骨架）

- [x] 项目脚手架（Next.js 16 + Tailwind 4）
- [x] 数据模型 `lib/types.ts`（与 supabase/schema.sql 对应）
- [x] 种子数据：11 个深度结构化场景（data/scenes.ts）
- [x] 首页：需求输入 + 示例问题 + 场景档案浏览
- [x] /api/match：本地结构化匹配（关键词→机制标签→打分），
      配置 OPENAI_API_KEY 后自动启用 LLM 重排，失败静默回退
- [x] 结果页：需求理解（产品形态/核心问题/机制标签）+ 推荐场景
- [x] 场景详情页：原始观察 / 机制拆解(14维) / 同理心视角 / 产品启发
- [x] Supabase schema（含 query_logs 认知轨迹表、agent_outputs 预留）
- [x] 场景视频：6 个场景嵌入 YouTube 官方预告/公开片段（youtube-nocookie，
      带"在 YouTube 打开"兜底）；首页"开放放映室"嵌入 CC 授权的 Tears of Steel

## 待办（按优先级）

- [ ] 部署到 Vercel，拿到公开网址（需要用户的 Vercel 账号）
- [ ] 配置 OPENAI_API_KEY 环境变量，启用 LLM 增强匹配
- [ ] 接入 Supabase：数据迁移脚本 + query_logs 写入
- [ ] embedding 语义检索（替代/补充本地匹配）
- [ ] 场景数据扩充到 50 条
- [ ] 反馈入口（每个场景页"这个场景对你有启发吗"）
- [ ] 访问统计
- [ ] 独立域名

## 已知限制

- 本地匹配基于关键词词典，对词典外的表述召回有限（LLM 增强可缓解）
- 无用户系统，query_logs 尚未实际写入（等 Supabase 接入）
