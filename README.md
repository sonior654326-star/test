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

## AI 能力配置

在 `.env.local`（本地）或 Vercel 环境变量中配置。兼容 OpenAI 及所有 OpenAI 格式的服务商（Sakana、DeepSeek、Moonshot 等）：

| 变量 | 作用 |
| --- | --- |
| `OPENAI_API_KEY` | 必填（用 AI 功能时）。启用 LLM 匹配增强与视频分析 |
| `OPENAI_BASE_URL` | 服务商接口地址，默认 `https://api.openai.com/v1` |
| `OPENAI_MODEL` | 文本任务模型，默认 `gpt-4o-mini` |
| `OPENAI_VISION_MODEL` | 视频分析用的视觉模型，默认取 `OPENAI_MODEL` |

**使用 Sakana AI（console.sakana.ai）的配置：**

```
OPENAI_API_KEY=<你的 Sakana key>
OPENAI_BASE_URL=https://api.sakana.ai/v1
OPENAI_MODEL=fugu
OPENAI_VISION_MODEL=fugu-ultra
```

注意：`/analyze` 视频分析需要视觉模型；Sakana 只有 `fugu-ultra` 支持图片输入。

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
