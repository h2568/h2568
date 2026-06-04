import { test } from "node:test";
import assert from "node:assert/strict";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import { ClaudeFlowMcpIntegration } from "./claude-flow-mcp-integration";

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "cf-mcp-"));
}

test("registerTool adds to listTools", () => {
  const dir = tmp();
  const ig = new ClaudeFlowMcpIntegration({ checkpointDir: dir });
  ig.registerTool("greet", async () => "hi", { name: "greet" });

  const tools = ig.listTools();
  assert.strictEqual(tools.length, 1);
  assert.strictEqual(tools[0].name, "greet");

  fs.rmSync(dir, { recursive: true });
});

test("call invokes tool handler and returns result", async () => {
  const dir = tmp();
  const ig = new ClaudeFlowMcpIntegration({ checkpointDir: dir });
  ig.registerTool("add", async (p) => (p.a as number) + (p.b as number));

  assert.strictEqual(await ig.call("add", { a: 2, b: 3 }), 5);

  fs.rmSync(dir, { recursive: true });
});

test("call throws for unknown tool", async () => {
  const dir = tmp();
  const ig = new ClaudeFlowMcpIntegration({ checkpointDir: dir });

  await assert.rejects(() => ig.call("nope", {}), /Unknown tool/);

  fs.rmSync(dir, { recursive: true });
});

test("before and after hooks fire in order", async () => {
  const dir = tmp();
  const ig = new ClaudeFlowMcpIntegration({ checkpointDir: dir });
  const log: string[] = [];

  ig.registerTool("t", async () => null);
  ig.before("t", async () => { log.push("before"); });
  ig.after("t", async () => { log.push("after"); });

  await ig.call("t", {});
  assert.deepEqual(log, ["before", "after"]);

  fs.rmSync(dir, { recursive: true });
});

test("after hook does not fire when handler throws", async () => {
  const dir = tmp();
  const ig = new ClaudeFlowMcpIntegration({ checkpointDir: dir });
  const log: string[] = [];

  ig.registerTool("boom", async () => { throw new Error("fail"); });
  ig.after("boom", async () => { log.push("after"); });

  await assert.rejects(() => ig.call("boom", {}));
  assert.deepEqual(log, []);

  fs.rmSync(dir, { recursive: true });
});

test("metrics track toolCalls, successes, failures, and averageDuration", async () => {
  const dir = tmp();
  const ig = new ClaudeFlowMcpIntegration({ checkpointDir: dir });
  ig.registerTool("ok", async () => "done");
  ig.registerTool("err", async () => { throw new Error("x"); });

  await ig.call("ok", {});
  await assert.rejects(() => ig.call("err", {}));

  const m = ig.getMetrics();
  assert.strictEqual(m.toolCalls, 2);
  assert.strictEqual(m.successfulCalls, 1);
  assert.strictEqual(m.failedCalls, 1);
  assert.ok(m.averageDurationMs >= 0);

  fs.rmSync(dir, { recursive: true });
});

test("checkpoint and restore round-trip", () => {
  const dir = tmp();
  const ig = new ClaudeFlowMcpIntegration({ checkpointDir: dir });

  const cp = ig.checkpoint({ value: 42 });
  assert.ok(cp !== null);
  assert.deepEqual(ig.restore(cp!.id), { value: 42 });

  fs.rmSync(dir, { recursive: true });
});

test("checkpoint returns null when disabled", () => {
  const dir = tmp();
  const ig = new ClaudeFlowMcpIntegration({ checkpoints: false, checkpointDir: dir });

  assert.strictEqual(ig.checkpoint({ x: 1 }), null);

  fs.rmSync(dir, { recursive: true });
});

test("toMcpServer exposes tools list and call", async () => {
  const dir = tmp();
  const ig = new ClaudeFlowMcpIntegration({ checkpointDir: dir });
  ig.registerTool("ping", async () => "pong");

  const srv = ig.toMcpServer();
  assert.strictEqual(srv.tools.length, 1);
  assert.strictEqual(srv.tools[0].name, "ping");
  assert.strictEqual(await srv.call("ping", {}), "pong");

  fs.rmSync(dir, { recursive: true });
});
