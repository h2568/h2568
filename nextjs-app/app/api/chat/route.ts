import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, authEnabled } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";
import type { ApiMessage } from "@/lib/conversation";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DEFAULT_MODEL  = "claude-opus-4-6";
const DEFAULT_SYSTEM = "You are a helpful assistant.";

const VALID_MODELS = [
  "claude-opus-4-6",
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",
];

export async function POST(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  if (authEnabled()) {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // ── Rate limiting ───────────────────────────────────────────────────────────
  const ip    = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const limit = rateLimit(ip, { windowMs: 60_000, max: 20 });
  if (!limit.allowed) {
    return Response.json(
      { error: "Too many requests — please wait a moment." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } }
    );
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: { messages: ApiMessage[]; stream?: boolean; model?: string; systemPrompt?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages, stream = true, model = DEFAULT_MODEL, systemPrompt = DEFAULT_SYSTEM } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages array is required" }, { status: 400 });
  }
  if (!VALID_MODELS.includes(model)) {
    return Response.json({ error: `Invalid model. Choose: ${VALID_MODELS.join(", ")}` }, { status: 400 });
  }

  const sdkMessages = messages as Anthropic.MessageParam[];
  const headers     = { "X-RateLimit-Remaining": String(limit.remaining) };

  // ── Streaming ───────────────────────────────────────────────────────────────
  if (stream) {
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const send = (data: object) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        try {
          const s = client.messages.stream({ model, max_tokens: 8192, system: systemPrompt, messages: sdkMessages });
          for await (const event of s) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              send({ chunk: event.delta.text });
            }
          }
          const final = await s.finalMessage();
          send({ done: true, usage: { inputTokens: final.usage.input_tokens, outputTokens: final.usage.output_tokens } });
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          send({ error: (err as Error).message });
        } finally {
          controller.close();
        }
      },
    });
    return new Response(readable, {
      headers: { ...headers, "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
    });
  }

  // ── Non-streaming ───────────────────────────────────────────────────────────
  const response = await client.messages.create({ model, max_tokens: 8192, system: systemPrompt, messages: sdkMessages });
  const text = response.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map((b) => b.text).join("");
  return Response.json({ reply: text, usage: { inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens } }, { headers });
}
