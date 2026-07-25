// 轻量内存限流：按 key（通常 IP+路由）在时间窗内计数。
// 说明：Serverless 每个实例内存独立，这不是精确全局限流，
// 但足以挡住机器人连刷与额度盗刷；未来量大再换 KV/Redis。

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** 时间窗限流：窗口 windowMs 内超过 limit 次则拒绝。返回 true=放行 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  b.count += 1;
  if (buckets.size > 10_000) {
    // 防内存膨胀：清理过期桶
    for (const [k, v] of buckets) if (now >= v.resetAt) buckets.delete(k);
  }
  return b.count <= limit;
}

/** 从请求头取客户端 IP（Vercel 提供 x-forwarded-for / x-real-ip） */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** 当日全局熔断：整个实例当天累计超过 cap 次则拒绝（额度保险丝）。返回 true=放行 */
let dayKey = "";
let dayCount = 0;
export function dailyCap(cap: number): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== dayKey) {
    dayKey = today;
    dayCount = 0;
  }
  dayCount += 1;
  return dayCount <= cap;
}
