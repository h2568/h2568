/**
 * Next.js App Router API route for the chat endpoint.
 *
 * Copy this file to:  app/api/chat/route.ts  in your Next.js project.
 *
 * Supports both regular JSON replies and streaming (Server-Sent Events).
 *
 * Example fetch from your frontend:
 *
 *   // Streaming
 *   const res = await fetch('/api/chat', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello!' }], stream: true }),
 *   });
 *   const reader = res.body.getReader();
 *   // read chunks ...
 *
 *   // Non-streaming
 *   const { reply } = await res.json();
 */

import { QueryEngine, QueryMessage } from "../QueryEngine";
import { CostTracker } from "../cost-tracker";

const engine = new QueryEngine({
  model: process.env.MODEL ?? "claude-opus-4-6",
  systemPrompt: process.env.SYSTEM_PROMPT ?? "You are a helpful assistant.",
});
const costs = new CostTracker();

// ── POST /api/chat ────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  let body: { messages: QueryMessage[]; stream?: boolean };

  try {
    body = (await request.json()) as { messages: QueryMessage[]; stream?: boolean };
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages, stream } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages array required" }, { status: 400 });
  }

  // ── streaming response ────────────────────────────────────────────────────
  if (stream) {
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of engine.stream(messages)) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: (err as Error).message })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // ── non-streaming response ────────────────────────────────────────────────
  const result = await engine.query(messages);
  costs.record(result.model, result.inputTokens, result.outputTokens);

  return Response.json({
    reply: result.content,
    usage: { inputTokens: result.inputTokens, outputTokens: result.outputTokens },
    cost: costs.summary(),
  });
}
