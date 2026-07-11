# 想象引擎 ImagineLab

帮助 AI 从业者从人类已有的想象、关系和场景中，发现下一代 AI 产品。

输入你正在思考的 AI 产品问题 → 系统理解需求 → 推荐相关的影视想象场景 →
用 4 个认知视角（原始观察 / 机制拆解 / 同理心 / 产品启发）帮你完成从剧情到产品机制的迁移。

项目文档：[PRODUCT.md](./PRODUCT.md)（定位与边界）· [DATA.md](./DATA.md)（数据结构与规则）· [BUILD.md](./BUILD.md)（开发状态）

## 本地运行

```bash
npm install
npm run dev
```

打开 http://localhost:3000。**无需任何 API key 即可完整运行**（本地结构化匹配）。

## 可选增强

在 `.env.local`（本地）或 Vercel 环境变量中配置：

| 变量 | 作用 |
| --- | --- |
| `OPENAI_API_KEY` | 启用 LLM 增强的需求理解与场景重排（失败自动回退本地匹配） |
| `OPENAI_MODEL` | 默认 `gpt-4o-mini` |

## 部署到 Vercel（三步）

1. 把本仓库连接到 [vercel.com/new](https://vercel.com/new)，框架选 Next.js，全部默认即可。
2. （可选）在 Project → Settings → Environment Variables 里添加 `OPENAI_API_KEY`。
3. Deploy。得到 `<项目名>.vercel.app` 公开网址；独立域名在 Settings → Domains 里绑定。

## 接入 Supabase（第二步，可后置）

1. 在 [supabase.com](https://supabase.com) 建项目，SQL Editor 里执行 `supabase/schema.sql`。
2. 数据迁移与 query_logs 写入见 BUILD.md 待办。

## 版权说明

本站不托管任何影视片段，只保存对场景的原创结构化研究拆解；
场景位置描述仅供用户在正版渠道查看原片。
