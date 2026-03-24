"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeFlowMcpIntegration = void 0;
exports.createMcpIntegration = createMcpIntegration;
const checkpoint_manager_1 = require("./checkpoint-manager");
const DEFAULT_OPTIONS = {
    checkpoints: true,
    metrics: true,
    hooks: true,
};
class ClaudeFlowMcpIntegration {
    constructor(options) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.checkpointManager = new checkpoint_manager_1.CheckpointManager(this.options.checkpointDir ? { dir: this.options.checkpointDir } : undefined);
        this._tools = new Map();
        this._hooks = { before: {}, after: {} };
        this._metrics = { toolCalls: 0, successfulCalls: 0, failedCalls: 0, totalDurationMs: 0 };
    }
    registerTool(name, handler, schema) {
        this._tools.set(name, { handler, schema: schema ?? {} });
        return this;
    }
    before(toolName, hook) {
        if (!this._hooks.before[toolName])
            this._hooks.before[toolName] = [];
        this._hooks.before[toolName].push(hook);
        return this;
    }
    after(toolName, hook) {
        if (!this._hooks.after[toolName])
            this._hooks.after[toolName] = [];
        this._hooks.after[toolName].push(hook);
        return this;
    }
    async call(toolName, params) {
        const tool = this._tools.get(toolName);
        if (!tool)
            throw new Error(`Unknown tool: ${toolName}`);
        const start = Date.now();
        this._metrics.toolCalls++;
        for (const hook of this._hooks.before[toolName] ?? []) {
            await hook(params);
        }
        let result;
        try {
            result = await tool.handler(params);
            this._metrics.successfulCalls++;
        }
        catch (err) {
            this._metrics.failedCalls++;
            throw err;
        }
        finally {
            this._metrics.totalDurationMs += Date.now() - start;
        }
        for (const hook of this._hooks.after[toolName] ?? []) {
            await hook(params, result);
        }
        return result;
    }
    checkpoint(state, metadata) {
        if (!this.options.checkpoints)
            return null;
        return this.checkpointManager.create(state, metadata);
    }
    restore(id) {
        return this.checkpointManager.restore(id);
    }
    getMetrics() {
        const avg = this._metrics.toolCalls > 0 ? this._metrics.totalDurationMs / this._metrics.toolCalls : 0;
        return { ...this._metrics, averageDurationMs: avg };
    }
    listTools() {
        return Array.from(this._tools.entries()).map(([name, tool]) => ({ name, schema: tool.schema }));
    }
    toMcpServer() {
        return {
            tools: this.listTools(),
            call: (toolName, params) => this.call(toolName, params),
        };
    }
}
exports.ClaudeFlowMcpIntegration = ClaudeFlowMcpIntegration;
function createMcpIntegration(options) {
    return new ClaudeFlowMcpIntegration(options);
}
//# sourceMappingURL=claude-flow-mcp-integration.js.map