import { test } from "node:test";
import assert from "node:assert/strict";
import { InProcessMcp } from "./in-process-mcp";

test("tools/list returns registered tools", async () => {
  const mcp = new InProcessMcp({ name: "test" });
  mcp.tool("hello", { description: "say hello" }, async () => "hi");

  const result = (await mcp.request("tools/list")) as { tools: Array<{ name: string; description: string }> };
  assert.strictEqual(result.tools.length, 1);
  assert.strictEqual(result.tools[0].name, "hello");
  assert.strictEqual(result.tools[0].description, "say hello");
});

test("tools/call invokes handler; output wrapped in content array", async () => {
  const mcp = new InProcessMcp();
  mcp.tool("echo", async (args) => args.msg);

  const result = (await mcp.request("tools/call", { name: "echo", arguments: { msg: "hey" } })) as {
    content: Array<{ type: string; text: string }>;
  };
  assert.strictEqual(result.content[0].type, "text");
  assert.strictEqual(result.content[0].text, "hey");
});

test("tools/call serialises non-string output as JSON", async () => {
  const mcp = new InProcessMcp();
  mcp.tool("obj", async () => ({ x: 1 }));

  const result = (await mcp.request("tools/call", { name: "obj", arguments: {} })) as {
    content: Array<{ text: string }>;
  };
  assert.deepEqual(JSON.parse(result.content[0].text), { x: 1 });
});

test("tools/call throws for unknown tool", async () => {
  const mcp = new InProcessMcp();
  await assert.rejects(() => mcp.request("tools/call", { name: "nope", arguments: {} }), /Tool not found/);
});

test("resources/list and resources/read", async () => {
  const mcp = new InProcessMcp();
  mcp.resource("data://test", async () => "file-content");

  const list = (await mcp.request("resources/list")) as { resources: Array<{ uri: string }> };
  assert.strictEqual(list.resources.length, 1);
  assert.strictEqual(list.resources[0].uri, "data://test");

  const read = (await mcp.request("resources/read", { uri: "data://test" })) as {
    contents: Array<{ text: string }>;
  };
  assert.strictEqual(read.contents[0].text, "file-content");
});

test("resources/read throws for missing resource", async () => {
  const mcp = new InProcessMcp();
  await assert.rejects(() => mcp.request("resources/read", { uri: "nope" }), /Resource not found/);
});

test("prompts/list and prompts/get", async () => {
  const mcp = new InProcessMcp();
  mcp.prompt("sys", async (args) => [{ role: "system", content: args.text }]);

  const list = (await mcp.request("prompts/list")) as { prompts: Array<{ name: string }> };
  assert.strictEqual(list.prompts[0].name, "sys");

  const got = (await mcp.request("prompts/get", { name: "sys", arguments: { text: "hello" } })) as {
    messages: unknown[];
  };
  assert.strictEqual(got.messages.length, 1);
});

test("prompts/get throws for missing prompt", async () => {
  const mcp = new InProcessMcp();
  await assert.rejects(() => mcp.request("prompts/get", { name: "nope", arguments: {} }), /Prompt not found/);
});

test("unknown method throws", async () => {
  const mcp = new InProcessMcp();
  await assert.rejects(() => mcp.request("unknown/method"), /Unknown method/);
});

test("emits request and response events on success", async () => {
  const mcp = new InProcessMcp();
  mcp.tool("noop", async () => null);
  const events: string[] = [];

  mcp.on("request", () => events.push("request"));
  mcp.on("response", () => events.push("response"));

  await mcp.request("tools/call", { name: "noop", arguments: {} });
  assert.deepEqual(events, ["request", "response"]);
});

test("emits request:error event on tool failure", async () => {
  const mcp = new InProcessMcp();
  mcp.tool("fail", async () => { throw new Error("oops"); });
  const errors: unknown[] = [];

  mcp.on("request:error", (e) => errors.push(e));

  await assert.rejects(() => mcp.request("tools/call", { name: "fail", arguments: {} }));
  assert.strictEqual(errors.length, 1);
});

test("request id increments across calls", async () => {
  const mcp = new InProcessMcp();
  mcp.tool("t", async () => null);
  const ids: number[] = [];

  mcp.on("request", (e: { id: number }) => ids.push(e.id));

  await mcp.request("tools/call", { name: "t", arguments: {} });
  await mcp.request("tools/call", { name: "t", arguments: {} });

  assert.strictEqual(ids[1], ids[0] + 1);
});

test("tool registered without schema gets empty schema", async () => {
  const mcp = new InProcessMcp();
  mcp.tool("bare", async () => "ok");

  const result = (await mcp.request("tools/list")) as { tools: Array<{ inputSchema: unknown }> };
  assert.deepEqual(result.tools[0].inputSchema, { type: "object", properties: {} });
});
