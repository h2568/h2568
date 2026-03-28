"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const claude_flow_mcp_integration_1 = require("./claude-flow-mcp-integration");
(0, node_test_1.describe)('ClaudeFlowMcpIntegration', () => {
    (0, node_test_1.it)('registers and calls a tool', async () => {
        const mcp = new claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration();
        mcp.registerTool('add', async ({ a, b }) => a + b);
        const result = await mcp.call('add', { a: 1, b: 2 });
        strict_1.default.equal(result, 3);
    });
    (0, node_test_1.it)('throws for an unknown tool', async () => {
        const mcp = new claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration();
        await strict_1.default.rejects(() => mcp.call('unknown', {}), /Unknown tool/);
    });
    (0, node_test_1.it)('supports method chaining on registerTool', () => {
        const mcp = new claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration();
        const result = mcp.registerTool('a', async () => null);
        strict_1.default.ok(result instanceof claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration);
    });
    (0, node_test_1.it)('tracks call counts in metrics', async () => {
        const mcp = new claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration();
        mcp.registerTool('noop', async () => null);
        await mcp.call('noop', {});
        await mcp.call('noop', {});
        const m = mcp.getMetrics();
        strict_1.default.equal(m.toolCalls, 2);
        strict_1.default.equal(m.successfulCalls, 2);
        strict_1.default.equal(m.failedCalls, 0);
    });
    (0, node_test_1.it)('counts failed calls in metrics', async () => {
        const mcp = new claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration();
        mcp.registerTool('fail', async () => { throw new Error('boom'); });
        await strict_1.default.rejects(() => mcp.call('fail', {}));
        const m = mcp.getMetrics();
        strict_1.default.equal(m.failedCalls, 1);
        strict_1.default.equal(m.successfulCalls, 0);
    });
    (0, node_test_1.it)('computes averageDurationMs', async () => {
        const mcp = new claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration();
        mcp.registerTool('noop', async () => null);
        await mcp.call('noop', {});
        const m = mcp.getMetrics();
        strict_1.default.ok(m.averageDurationMs >= 0);
    });
    (0, node_test_1.it)('runs before hooks in order', async () => {
        const mcp = new claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration();
        const calls = [];
        mcp.registerTool('t', async () => null);
        mcp.before('t', async () => { calls.push('before1'); });
        mcp.before('t', async () => { calls.push('before2'); });
        await mcp.call('t', {});
        strict_1.default.deepEqual(calls, ['before1', 'before2']);
    });
    (0, node_test_1.it)('runs after hooks with result', async () => {
        const mcp = new claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration();
        let captured;
        mcp.registerTool('t', async () => 'result-value');
        mcp.after('t', async (_, result) => { captured = result; });
        await mcp.call('t', {});
        strict_1.default.equal(captured, 'result-value');
    });
    (0, node_test_1.it)('supports method chaining on before/after', () => {
        const mcp = new claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration();
        mcp.registerTool('t', async () => null);
        const result = mcp.before('t', async () => { }).after('t', async () => { });
        strict_1.default.ok(result instanceof claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration);
    });
    (0, node_test_1.it)('lists registered tools with schemas', () => {
        const mcp = new claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration();
        mcp.registerTool('a', async () => null, { type: 'object' });
        mcp.registerTool('b', async () => null);
        const tools = mcp.listTools();
        strict_1.default.equal(tools.length, 2);
        strict_1.default.ok(tools.find(t => t.name === 'a'));
        strict_1.default.ok(tools.find(t => t.name === 'b'));
    });
    (0, node_test_1.it)('toMcpServer exposes tools and call', async () => {
        const mcp = new claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration();
        mcp.registerTool('x', async () => 42);
        const server = mcp.toMcpServer();
        strict_1.default.ok(typeof server.call === 'function');
        strict_1.default.ok(Array.isArray(server.tools));
        const result = await server.call('x', {});
        strict_1.default.equal(result, 42);
    });
    (0, node_test_1.it)('createMcpIntegration factory returns an instance', () => {
        const mcp = (0, claude_flow_mcp_integration_1.createMcpIntegration)();
        strict_1.default.ok(mcp instanceof claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration);
    });
    (0, node_test_1.it)('disabling checkpoints returns null from checkpoint()', () => {
        const mcp = new claude_flow_mcp_integration_1.ClaudeFlowMcpIntegration({ checkpoints: false });
        const cp = mcp.checkpoint({ x: 1 });
        strict_1.default.equal(cp, null);
    });
});
//# sourceMappingURL=claude-flow-mcp-integration.test.js.map