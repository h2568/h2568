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
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const claude_flow_mcp_integration_1 = require("./claude-flow-mcp-integration");
function tmp() {
    return fs.mkdtempSync(path.join(os.tmpdir(), "cf-mcp-"));
}
(0, node_test_1.test)("registerTool adds to listTools", () => {
    const dir = tmp();
    const ig = new claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration({ checkpointDir: dir });
    ig.registerTool("greet", async () => "hi", { name: "greet" });
    const tools = ig.listTools();
    strict_1.default.strictEqual(tools.length, 1);
    strict_1.default.strictEqual(tools[0].name, "greet");
    fs.rmSync(dir, { recursive: true });
});
(0, node_test_1.test)("call invokes tool handler and returns result", async () => {
    const dir = tmp();
    const ig = new claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration({ checkpointDir: dir });
    ig.registerTool("add", async (p) => p.a + p.b);
    strict_1.default.strictEqual(await ig.call("add", { a: 2, b: 3 }), 5);
    fs.rmSync(dir, { recursive: true });
});
(0, node_test_1.test)("call throws for unknown tool", async () => {
    const dir = tmp();
    const ig = new claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration({ checkpointDir: dir });
    await strict_1.default.rejects(() => ig.call("nope", {}), /Unknown tool/);
    fs.rmSync(dir, { recursive: true });
});
(0, node_test_1.test)("before and after hooks fire in order", async () => {
    const dir = tmp();
    const ig = new claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration({ checkpointDir: dir });
    const log = [];
    ig.registerTool("t", async () => null);
    ig.before("t", async () => { log.push("before"); });
    ig.after("t", async () => { log.push("after"); });
    await ig.call("t", {});
    strict_1.default.deepEqual(log, ["before", "after"]);
    fs.rmSync(dir, { recursive: true });
});
(0, node_test_1.test)("after hook does not fire when handler throws", async () => {
    const dir = tmp();
    const ig = new claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration({ checkpointDir: dir });
    const log = [];
    ig.registerTool("boom", async () => { throw new Error("fail"); });
    ig.after("boom", async () => { log.push("after"); });
    await strict_1.default.rejects(() => ig.call("boom", {}));
    strict_1.default.deepEqual(log, []);
    fs.rmSync(dir, { recursive: true });
});
(0, node_test_1.test)("metrics track toolCalls, successes, failures, and averageDuration", async () => {
    const dir = tmp();
    const ig = new claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration({ checkpointDir: dir });
    ig.registerTool("ok", async () => "done");
    ig.registerTool("err", async () => { throw new Error("x"); });
    await ig.call("ok", {});
    await strict_1.default.rejects(() => ig.call("err", {}));
    const m = ig.getMetrics();
    strict_1.default.strictEqual(m.toolCalls, 2);
    strict_1.default.strictEqual(m.successfulCalls, 1);
    strict_1.default.strictEqual(m.failedCalls, 1);
    strict_1.default.ok(m.averageDurationMs >= 0);
    fs.rmSync(dir, { recursive: true });
});
(0, node_test_1.test)("checkpoint and restore round-trip", () => {
    const dir = tmp();
    const ig = new claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration({ checkpointDir: dir });
    const cp = ig.checkpoint({ value: 42 });
    strict_1.default.ok(cp !== null);
    strict_1.default.deepEqual(ig.restore(cp.id), { value: 42 });
    fs.rmSync(dir, { recursive: true });
});
(0, node_test_1.test)("checkpoint returns null when disabled", () => {
    const dir = tmp();
    const ig = new claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration({ checkpoints: false, checkpointDir: dir });
    strict_1.default.strictEqual(ig.checkpoint({ x: 1 }), null);
    fs.rmSync(dir, { recursive: true });
});
(0, node_test_1.test)("toMcpServer exposes tools list and call", async () => {
    const dir = tmp();
    const ig = new claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration({ checkpointDir: dir });
    ig.registerTool("ping", async () => "pong");
    const srv = ig.toMcpServer();
    strict_1.default.strictEqual(srv.tools.length, 1);
    strict_1.default.strictEqual(srv.tools[0].name, "ping");
    strict_1.default.strictEqual(await srv.call("ping", {}), "pong");
    fs.rmSync(dir, { recursive: true });
});
//# sourceMappingURL=claude-flow-mcp-integration.test.js.map