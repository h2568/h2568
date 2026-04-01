/**
 * Minimal Express chat server.
 *
 * POST /chat          — single-turn reply (JSON)
 * POST /chat/stream   — streaming reply (Server-Sent Events)
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... node dist-cjs/src/server/chat-server.js
 */

import * as http from "http";
import { QueryEngine, QueryMessage } from "../QueryEngine";
import { CheckpointManager } from "../services/checkpoint-manager";
import { CostTracker } from "../cost-tracker";

const PORT = Number(process.env.PORT ?? 3001);

const engine = new QueryEngine({
  model: process.env.MODEL ?? "claude-opus-4-6",
  systemPrompt: process.env.SYSTEM_PROMPT ?? "You are a helpful assistant.",
});
const checkpoints = new CheckpointManager();
const costs = new CostTracker();

// ── tiny router ──────────────────────────────────────────────────────────────

type Handler = (req: http.IncomingMessage, res: http.ServerResponse) => Promise<void>;
const routes = new Map<string, Handler>();

function route(method: string, path: string, handler: Handler) {
  routes.set(`${method} ${path}`, handler);
}

async function readBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

function json(res: http.ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(payload);
}

// ── POST /chat ────────────────────────────────────────────────────────────────

route("POST", "/chat", async (req, res) => {
  const body = (await readBody(req)) as { messages: QueryMessage[]; save?: boolean };
  const { messages, save } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return json(res, 400, { error: "messages array required" });
  }

  const result = await engine.query(messages);
  costs.record(result.model, result.inputTokens, result.outputTokens);

  if (save) {
    checkpoints.create({ messages: [...messages, { role: "assistant", content: result.content }] });
  }

  json(res, 200, {
    reply: result.content,
    usage: { inputTokens: result.inputTokens, outputTokens: result.outputTokens },
    cost: costs.summary(),
  });
});

// ── POST /chat/stream ─────────────────────────────────────────────────────────

route("POST", "/chat/stream", async (req, res) => {
  const body = (await readBody(req)) as { messages: QueryMessage[] };
  const { messages } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return json(res, 400, { error: "messages array required" });
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  for await (const chunk of engine.stream(messages)) {
    res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
  }

  res.write("data: [DONE]\n\n");
  res.end();
});

// ── GET /health ───────────────────────────────────────────────────────────────

route("GET", "/health", async (_req, res) => {
  json(res, 200, { status: "ok", model: engine.getModel() });
});

// ── server ────────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  const key = `${req.method} ${req.url}`;
  const handler = routes.get(key);

  if (!handler) {
    return json(res, 404, { error: "Not found" });
  }

  try {
    await handler(req, res);
  } catch (err) {
    console.error(err);
    json(res, 500, { error: (err as Error).message });
  }
});

server.listen(PORT, () => {
  console.log(`claude-flow chat server running on http://localhost:${PORT}`);
});

export { server };
