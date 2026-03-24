const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // Skip verification if secret not configured (dev / test)
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip || undefined }),
    });
    if (!res.ok) return false;
    const data: { success: boolean } = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}
