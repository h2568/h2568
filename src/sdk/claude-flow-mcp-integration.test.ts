import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ClaudeFlowMcpIntegration, createMcpIntegration } from './claude-flow-mcp-integration';

describe('ClaudeFlowMcpIntegration', () => {
  it('registers and calls a tool', async () => {
    const mcp = new ClaudeFlowMcpIntegration();
    mcp.registerTool('add', async ({ a, b }) => (a as number) + (b as number));
    const result = await mcp.call('add', { a: 1, b: 2 });
    assert.equal(result, 3);
  });

  it('throws for an unknown tool', async () => {
    const mcp = new ClaudeFlowMcpIntegration();
    await assert.rejects(() => mcp.call('unknown', {}), /Unknown tool/);
  });

  it('supports method chaining on registerTool', () => {
    const mcp = new ClaudeFlowMcpIntegration();
    const result = mcp.registerTool('a', async () => null);
    assert.ok(result instanceof ClaudeFlowMcpIntegration);
  });

  it('tracks call counts in metrics', async () => {
    const mcp = new ClaudeFlowMcpIntegration();
    mcp.registerTool('noop', async () => null);
    await mcp.call('noop', {});
    await mcp.call('noop', {});
    const m = mcp.getMetrics();
    assert.equal(m.toolCalls, 2);
    assert.equal(m.successfulCalls, 2);
    assert.equal(m.failedCalls, 0);
  });

  it('counts failed calls in metrics', async () => {
    const mcp = new ClaudeFlowMcpIntegration();
    mcp.registerTool('fail', async () => { throw new Error('boom'); });
    await assert.rejects(() => mcp.call('fail', {}));
    const m = mcp.getMetrics();
    assert.equal(m.failedCalls, 1);
    assert.equal(m.successfulCalls, 0);
  });

  it('computes averageDurationMs', async () => {
    const mcp = new ClaudeFlowMcpIntegration();
    mcp.registerTool('noop', async () => null);
    await mcp.call('noop', {});
    const m = mcp.getMetrics();
    assert.ok(m.averageDurationMs >= 0);
  });

  it('runs before hooks in order', async () => {
    const mcp = new ClaudeFlowMcpIntegration();
    const calls: string[] = [];
    mcp.registerTool('t', async () => null);
    mcp.before('t', async () => { calls.push('before1'); });
    mcp.before('t', async () => { calls.push('before2'); });
    await mcp.call('t', {});
    assert.deepEqual(calls, ['before1', 'before2']);
  });

  it('runs after hooks with result', async () => {
    const mcp = new ClaudeFlowMcpIntegration();
    let captured: unknown;
    mcp.registerTool('t', async () => 'result-value');
    mcp.after('t', async (_, result) => { captured = result; });
    await mcp.call('t', {});
    assert.equal(captured, 'result-value');
  });

  it('supports method chaining on before/after', () => {
    const mcp = new ClaudeFlowMcpIntegration();
    mcp.registerTool('t', async () => null);
    const result = mcp.before('t', async () => {}).after('t', async () => {});
    assert.ok(result instanceof ClaudeFlowMcpIntegration);
  });

  it('lists registered tools with schemas', () => {
    const mcp = new ClaudeFlowMcpIntegration();
    mcp.registerTool('a', async () => null, { type: 'object' });
    mcp.registerTool('b', async () => null);
    const tools = mcp.listTools();
    assert.equal(tools.length, 2);
    assert.ok(tools.find(t => t.name === 'a'));
    assert.ok(tools.find(t => t.name === 'b'));
  });

  it('toMcpServer exposes tools and call', async () => {
    const mcp = new ClaudeFlowMcpIntegration();
    mcp.registerTool('x', async () => 42);
    const server = mcp.toMcpServer();
    assert.ok(typeof server.call === 'function');
    assert.ok(Array.isArray(server.tools));
    const result = await server.call('x', {});
    assert.equal(result, 42);
  });

  it('createMcpIntegration factory returns an instance', () => {
    const mcp = createMcpIntegration();
    assert.ok(mcp instanceof ClaudeFlowMcpIntegration);
  });

  it('disabling checkpoints returns null from checkpoint()', () => {
    const mcp = new ClaudeFlowMcpIntegration({ checkpoints: false });
    const cp = mcp.checkpoint({ x: 1 });
    assert.equal(cp, null);
  });
});
