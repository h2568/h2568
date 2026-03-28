import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import Anthropic from "@anthropic-ai/sdk";
import { AgentLoop, createAgentLoop, MessagesApi } from "./agent-loop";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function textMessage(text: string): Anthropic.Message {
  return {
    id: "msg_test",
    type: "message",
    role: "assistant",
    content: [{ type: "text", text }] as Anthropic.Message["content"],
    model: "claude-opus-4-6",
    stop_reason: "end_turn",
    stop_sequence: null,
    usage: { input_tokens: 10, output_tokens: 20 } as Anthropic.Usage,
  } as unknown as Anthropic.Message;
}

function toolUseMessage(
  id: string,
  name: string,
  input: Record<string, unknown>
): Anthropic.Message {
  return {
    id: "msg_test",
    type: "message",
    role: "assistant",
    content: [{ type: "tool_use", id, name, input }] as Anthropic.Message["content"],
    model: "claude-opus-4-6",
    stop_reason: "tool_use",
    stop_sequence: null,
    usage: { input_tokens: 10, output_tokens: 20 } as Anthropic.Usage,
  } as unknown as Anthropic.Message;
}

function mockApi(responses: Anthropic.Message[]): MessagesApi {
  let i = 0;
  return {
    async create(_params) {
      const res = responses[i++];
      if (!res) throw new Error("No more mock responses");
      return res;
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AgentLoop", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-loop-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns the final text response", async () => {
    const api = mockApi([textMessage("Hello world")]);
    const loop = new AgentLoop({ autoCheckpoint: false }, api);
    const result = await loop.run("Say hello");
    assert.equal(result.finalResponse, "Hello world");
    assert.equal(result.turns.length, 1);
    assert.equal(result.totalToolCalls, 0);
  });

  it("calls onText with each text chunk", async () => {
    const api = mockApi([textMessage("chunk1")]);
    const loop = new AgentLoop({ autoCheckpoint: false }, api);
    const chunks: string[] = [];
    await loop.run("test", (t) => chunks.push(t));
    assert.deepEqual(chunks, ["chunk1"]);
  });

  it("executes a tool and feeds the result back", async () => {
    const api = mockApi([
      toolUseMessage("tool_1", "greet", { name: "Alice" }),
      textMessage("Done"),
    ]);

    const loop = new AgentLoop({ autoCheckpoint: false }, api);
    loop.registerTool(
      "greet",
      "Greet someone",
      { properties: { name: { type: "string" } }, required: ["name"] },
      async ({ name }) => `Hello, ${name}!`
    );

    const result = await loop.run("Greet Alice");
    assert.equal(result.totalToolCalls, 1);
    assert.equal(result.turns[0]?.toolCalls[0]?.result, "Hello, Alice!");
    assert.equal(result.finalResponse, "Done");
  });

  it("marks tool result as error when tool throws", async () => {
    const api = mockApi([
      toolUseMessage("tool_1", "fail", {}),
      textMessage("Got error"),
    ]);

    const loop = new AgentLoop({ autoCheckpoint: false }, api);
    loop.registerTool("fail", "Fail", {}, async () => {
      throw new Error("boom");
    });

    const result = await loop.run("fail please");
    const toolCall = result.turns[0]?.toolCalls[0];
    assert.ok(toolCall?.isError);
    assert.ok((toolCall?.result as string).includes("boom"));
  });

  it("marks tool result as error for unknown tool", async () => {
    const api = mockApi([
      toolUseMessage("tool_1", "nonexistent", {}),
      textMessage("ok"),
    ]);

    const loop = new AgentLoop({ autoCheckpoint: false }, api);
    const result = await loop.run("call unknown");
    assert.ok(result.turns[0]?.toolCalls[0]?.isError);
  });

  it("handles multiple tool calls in one turn", async () => {
    const multiToolMsg: Anthropic.Message = {
      id: "msg_test",
      type: "message",
      role: "assistant",
      content: [
        { type: "tool_use", id: "t1", name: "add", input: { a: 1, b: 2 } },
        { type: "tool_use", id: "t2", name: "add", input: { a: 3, b: 4 } },
      ] as Anthropic.Message["content"],
      model: "claude-opus-4-6",
      stop_reason: "tool_use",
      stop_sequence: null,
      usage: { input_tokens: 10, output_tokens: 20 } as Anthropic.Usage,
    } as unknown as Anthropic.Message;

    const api = mockApi([multiToolMsg, textMessage("Results ready")]);
    const loop = new AgentLoop({ autoCheckpoint: false }, api);
    loop.registerTool("add", "Add two numbers", {}, async ({ a, b }) => (a as number) + (b as number));

    const result = await loop.run("add some numbers");
    assert.equal(result.totalToolCalls, 2);
    assert.equal(result.turns[0]?.toolCalls.length, 2);
  });

  it("respects maxTurns", async () => {
    // Always return tool_use to force maxTurns to kick in
    const responses = Array.from({ length: 5 }, (_, i) =>
      toolUseMessage(`t${i}`, "noop", {})
    );
    const api = mockApi(responses);
    const loop = new AgentLoop({ autoCheckpoint: false, maxTurns: 3 }, api);
    loop.registerTool("noop", "Do nothing", {}, async () => "ok");

    const result = await loop.run("loop forever");
    assert.ok(result.turns.length <= 3);
  });

  it("saves a checkpoint after each tool-use turn", async () => {
    const api = mockApi([
      toolUseMessage("tool_1", "noop", {}),
      textMessage("done"),
    ]);

    const loop = new AgentLoop(
      { autoCheckpoint: true, checkpointDir: tmpDir },
      api
    );
    loop.registerTool("noop", "Do nothing", {}, async () => "ok");

    const result = await loop.run("test");
    assert.ok(result.checkpointId, "should have a checkpoint ID");
    const files = fs.readdirSync(tmpDir);
    assert.ok(files.length > 0, "should have written a checkpoint file");
  });

  it("does not checkpoint when autoCheckpoint is false", async () => {
    const api = mockApi([
      toolUseMessage("tool_1", "noop", {}),
      textMessage("done"),
    ]);

    const loop = new AgentLoop({ autoCheckpoint: false }, api);
    loop.registerTool("noop", "Do nothing", {}, async () => "ok");

    const result = await loop.run("test");
    assert.equal(result.checkpointId, undefined);
  });

  it("supports method chaining on registerTool", () => {
    const loop = new AgentLoop({ autoCheckpoint: false });
    const returned = loop.registerTool("a", "desc", {}, async () => null);
    assert.ok(returned instanceof AgentLoop);
  });

  it("createAgentLoop factory returns an AgentLoop instance", () => {
    const loop = createAgentLoop({ autoCheckpoint: false });
    assert.ok(loop instanceof AgentLoop);
  });

  it("accumulates text across multiple text blocks", async () => {
    const multiTextMsg: Anthropic.Message = {
      id: "msg_test",
      type: "message",
      role: "assistant",
      content: [
        { type: "text", text: "Hello " },
        { type: "text", text: "world" },
      ] as Anthropic.Message["content"],
      model: "claude-opus-4-6",
      stop_reason: "end_turn",
      stop_sequence: null,
      usage: { input_tokens: 5, output_tokens: 5 } as Anthropic.Usage,
    } as unknown as Anthropic.Message;

    const api = mockApi([multiTextMsg]);
    const loop = new AgentLoop({ autoCheckpoint: false }, api);
    const result = await loop.run("say hello world");
    assert.equal(result.turns[0]?.text, "Hello world");
  });
});
