import { createHmac } from "crypto";
import { headers } from "next/headers";
export function getClientIp(): string | null {
  const hdrs = headers();
  return (
    hdrs.get("x-real-ip") ||
    hdrs.get("x-forwarded-for")?.split(",")[0].trim() ||
    null
  );
}
export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT;
  if (!salt) return null;
  return createHmac("sha256", salt).update(ip).digest("hex").slice(0, 16);
}
