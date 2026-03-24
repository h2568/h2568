const CONTACT_LIMIT  = 5;
const CONTACT_WINDOW = 10 * 60;
const ADMIN_LIMIT    = 10;
const ADMIN_WINDOW   = 15 * 60;
async function redisIncr(key: string, windowSecs: number): Promise<number> {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("no-redis");
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, windowSecs, "NX"],
    ]),
  });
  if (!res.ok) throw new Error(`Upstash error: ${res.status}`);
  const data: [[string, number], [string, number]] = await res.json();
  return data[0][1];
}
const memStore = new Map<string, { count: number; expiresAt: number }>();
function memIncr(key: string, windowSecs: number): number {
  const now = Date.now();
  const rec = memStore.get(key);
  if (!rec || rec.expiresAt < now) {
    memStore.set(key, { count: 1, expiresAt: now + windowSecs * 1000 });
    return 1;
  }
  rec.count++;
  return rec.count;
}
export async function checkRateLimit(
  key: string | null,
  type: "contact" | "admin" = "contact"
): Promise<{ allowed: boolean }> {
  if (!key) return { allowed: true };
  const limit    = type === "admin" ? ADMIN_LIMIT    : CONTACT_LIMIT;
  const window   = type === "admin" ? ADMIN_WINDOW   : CONTACT_WINDOW;
  const redisKey = `rl:${type}:${key}`;
  try {
    const count = await redisIncr(redisKey, window);
    return { allowed: count <= limit };
  } catch {
    const count = memIncr(redisKey, window);
    return { allowed: count <= limit };
  }
}
