-- ImagineLab 数据库结构（Supabase / PostgreSQL）
-- Demo 阶段数据在 data/scenes.ts 中静态维护；迁移到 Supabase 时执行本文件。
-- 向量检索依赖 pgvector 扩展。

create extension if not exists vector;

-- 作品层
create table if not exists works (
  id text primary key,
  title text not null,
  original_title text,
  year int,
  type text check (type in ('film', 'tv', 'animation', 'game')),
  poster_url text,
  description text,
  created_at timestamptz default now()
);

-- 场景层：平台的原子单位
create table if not exists scenes (
  id text primary key,
  work_id text references works(id) on delete cascade,
  scene_title text not null,
  episode text,
  position text,            -- 场景在原片中的位置描述（不托管片源）
  scene_summary text,
  context text,
  characters jsonb default '[]',
  ai_form text,
  mechanisms text[] default '{}',
  keywords text[] default '{}',
  source_url text,
  created_at timestamptz default now()
);

-- 分析层：14 维机制拆解 + 检索向量
create table if not exists scene_analyses (
  scene_id text primary key references scenes(id) on delete cascade,
  human_goal text,
  ai_goal text,
  trigger_condition text,
  ai_action text,
  human_reaction text,
  feedback_loop text,
  emotion_change text,
  trust_change text,
  permission_model text,
  memory_model text,
  failure_mode text,
  recovery text,
  relationship_shift text,
  environment_role text,
  design_questions jsonb default '[]',
  applicable_products jsonb default '[]',
  embedding vector(1536),   -- OpenAI text-embedding-3-small
  updated_at timestamptz default now()
);

-- 认知 Agent 输出层（含第二版预留的 agent_type，如 'cto'）
create table if not exists agent_outputs (
  id bigint generated always as identity primary key,
  scene_id text references scenes(id) on delete cascade,
  agent_type text not null, -- observation / empathy / product / cto / ethics ...
  observation_prompts jsonb default '[]',
  inspiration text,
  migration_suggestions jsonb default '[]',
  model_version text,
  created_at timestamptz default now()
);

-- 用户查询日志：认知轨迹数据的起点（上线即开始积累）
create table if not exists query_logs (
  id bigint generated always as identity primary key,
  query text not null,
  matched_mechanisms text[] default '{}',
  result_scene_ids text[] default '{}',
  clicked_scene_id text,
  llm_enhanced boolean default false,
  created_at timestamptz default now()
);

create index if not exists scenes_mechanisms_idx on scenes using gin (mechanisms);
create index if not exists scene_analyses_embedding_idx
  on scene_analyses using ivfflat (embedding vector_cosine_ops) with (lists = 100);
