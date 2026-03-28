"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const agent_loop_1 = require("./agent-loop");
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function textMessage(text) {
    return {
        id: "msg_test",
        type: "message",
        role: "assistant",
        content: [{ type: "text", text }],
        model: "claude-opus-4-6",
        stop_reason: "end_turn",
        stop_sequence: null,
        usage: { input_tokens: 10, output_tokens: 20 },
    };
}
function toolUseMessage(id, name, input) {
    return {
        id: "msg_test",
        type: "message",
        role: "assistant",
        content: [{ type: "tool_use", id, name, input }],
        model: "claude-opus-4-6",
        stop_reason: "tool_use",
        stop_sequence: null,
        usage: { input_tokens: 10, output_tokens: 20 },
    };
}
function mockApi(responses) {
    let i = 0;
    return {
        async create(_params) {
            const res = responses[i++];
            if (!res)
                throw new Error("No more mock responses");
            return res;
        },
    };
}
// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
(0, node_test_1.describe)("AgentLoop", () => {
    let tmpDir;
    (0, node_test_1.beforeEach)(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-loop-test-"));
    });
    (0, node_test_1.afterEach)(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });
    (0, node_test_1.it)("returns the final text response", async () => {
        const api = mockApi([textMessage("Hello world")]);
        const loop = new agent_loop_1.AgentLoop({ autoCheckpoint: false }, api);
        const result = await loop.run("Say hello");
        strict_1.default.equal(result.finalResponse, "Hello world");
        strict_1.default.equal(result.turns.length, 1);
        strict_1.default.equal(result.totalToolCalls, 0);
    });
    (0, node_test_1.it)("calls onText with each text chunk", async () => {
        const api = mockApi([textMessage("chunk1")]);
        const loop = new agent_loop_1.AgentLoop({ autoCheckpoint: false }, api);
        const chunks = [];
        await loop.run("test", (t) => chunks.push(t));
        strict_1.default.deepEqual(chunks, ["chunk1"]);
    });
    (0, node_test_1.it)("executes a tool and feeds the result back", async () => {
        const api = mockApi([
            toolUseMessage("tool_1", "greet", { name: "Alice" }),
            textMessage("Done"),
        ]);
        const loop = new agent_loop_1.AgentLoop({ autoCheckpoint: false }, api);
        loop.registerTool("greet", "Greet someone", { properties: { name: { type: "string" } }, required: ["name"] }, async ({ name }) => `Hello, ${name}!`);
        const result = await loop.run("Greet Alice");
        strict_1.default.equal(result.totalToolCalls, 1);
        strict_1.default.equal(result.turns[0]?.toolCalls[0]?.result, "Hello, Alice!");
        strict_1.default.equal(result.finalResponse, "Done");
    });
    (0, node_test_1.it)("marks tool result as error when tool throws", async () => {
        const api = mockApi([
            toolUseMessage("tool_1", "fail", {}),
            textMessage("Got error"),
        ]);
        const loop = new agent_loop_1.AgentLoop({ autoCheckpoint: false }, api);
        loop.registerTool("fail", "Fail", {}, async () => {
            throw new Error("boom");
        });
        const result = await loop.run("fail please");
        const toolCall = result.turns[0]?.toolCalls[0];
        strict_1.default.ok(toolCall?.isError);
        strict_1.default.ok((toolCall?.result).includes("boom"));
    });
    (0, node_test_1.it)("marks tool result as error for unknown tool", async () => {
        const api = mockApi([
            toolUseMessage("tool_1", "nonexistent", {}),
            textMessage("ok"),
        ]);
        const loop = new agent_loop_1.AgentLoop({ autoCheckpoint: false }, api);
        const result = await loop.run("call unknown");
        strict_1.default.ok(result.turns[0]?.toolCalls[0]?.isError);
    });
    (0, node_test_1.it)("handles multiple tool calls in one turn", async () => {
        const multiToolMsg = {
            id: "msg_test",
            type: "message",
            role: "assistant",
            content: [
                { type: "tool_use", id: "t1", name: "add", input: { a: 1, b: 2 } },
                { type: "tool_use", id: "t2", name: "add", input: { a: 3, b: 4 } },
            ],
            model: "claude-opus-4-6",
            stop_reason: "tool_use",
            stop_sequence: null,
            usage: { input_tokens: 10, output_tokens: 20 },
        };
        const api = mockApi([multiToolMsg, textMessage("Results ready")]);
        const loop = new agent_loop_1.AgentLoop({ autoCheckpoint: false }, api);
        loop.registerTool("add", "Add two numbers", {}, async ({ a, b }) => a + b);
        const result = await loop.run("add some numbers");
        strict_1.default.equal(result.totalToolCalls, 2);
        strict_1.default.equal(result.turns[0]?.toolCalls.length, 2);
    });
    (0, node_test_1.it)("respects maxTurns", async () => {
        // Always return tool_use to force maxTurns to kick in
        const responses = Array.from({ length: 5 }, (_, i) => toolUseMessage(`t${i}`, "noop", {}));
        const api = mockApi(responses);
        const loop = new agent_loop_1.AgentLoop({ autoCheckpoint: false, maxTurns: 3 }, api);
        loop.registerTool("noop", "Do nothing", {}, async () => "ok");
        const result = await loop.run("loop forever");
        strict_1.default.ok(result.turns.length <= 3);
    });
    (0, node_test_1.it)("saves a checkpoint after each tool-use turn", async () => {
        const api = mockApi([
            toolUseMessage("tool_1", "noop", {}),
            textMessage("done"),
        ]);
        const loop = new agent_loop_1.AgentLoop({ autoCheckpoint: true, checkpointDir: tmpDir }, api);
        loop.registerTool("noop", "Do nothing", {}, async () => "ok");
        const result = await loop.run("test");
        strict_1.default.ok(result.checkpointId, "should have a checkpoint ID");
        const files = fs.readdirSync(tmpDir);
        strict_1.default.ok(files.length > 0, "should have written a checkpoint file");
    });
    (0, node_test_1.it)("does not checkpoint when autoCheckpoint is false", async () => {
        const api = mockApi([
            toolUseMessage("tool_1", "noop", {}),
            textMessage("done"),
        ]);
        const loop = new agent_loop_1.AgentLoop({ autoCheckpoint: false }, api);
        loop.registerTool("noop", "Do nothing", {}, async () => "ok");
        const result = await loop.run("test");
        strict_1.default.equal(result.checkpointId, undefined);
    });
    (0, node_test_1.it)("supports method chaining on registerTool", () => {
        const loop = new agent_loop_1.AgentLoop({ autoCheckpoint: false });
        const returned = loop.registerTool("a", "desc", {}, async () => null);
        strict_1.default.ok(returned instanceof agent_loop_1.AgentLoop);
    });
    (0, node_test_1.it)("createAgentLoop factory returns an AgentLoop instance", () => {
        const loop = (0, agent_loop_1.createAgentLoop)({ autoCheckpoint: false });
        strict_1.default.ok(loop instanceof agent_loop_1.AgentLoop);
    });
    (0, node_test_1.it)("accumulates text across multiple text blocks", async () => {
        const multiTextMsg = {
            id: "msg_test",
            type: "message",
            role: "assistant",
            content: [
                { type: "text", text: "Hello " },
                { type: "text", text: "world" },
            ],
            model: "claude-opus-4-6",
            stop_reason: "end_turn",
            stop_sequence: null,
            usage: { input_tokens: 5, output_tokens: 5 },
        };
        const api = mockApi([multiTextMsg]);
        const loop = new agent_loop_1.AgentLoop({ autoCheckpoint: false }, api);
        const result = await loop.run("say hello world");
        strict_1.default.equal(result.turns[0]?.text, "Hello world");
    });
});
//# sourceMappingURL=agent-loop.test.js.map