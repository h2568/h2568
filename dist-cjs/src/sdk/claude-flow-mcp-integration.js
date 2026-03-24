"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeFlowMcpIntegration = ClaudeFlowMcpIntegration;
exports.createMcpIntegration = createMcpIntegration;

const { CheckpointManager } = require("./checkpoint-manager");

const DEFAULT_OPTIONS = {
  checkpoints: true,
  metrics: true,
  hooks: true,
};

function ClaudeFlowMcpIntegration(options) {
  this.options = Object.assign({}, DEFAULT_OPTIONS, options);
  this.checkpointManager = new CheckpointManager(
    this.options.checkpointDir ? { dir: this.options.checkpointDir } : undefined
  );
  this._tools = {};
  this._hooks = { before: {}, after: {} };
  this._metrics = {
    toolCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    totalDurationMs: 0,
  };
}

ClaudeFlowMcpIntegration.prototype.registerTool = function (name, handler, schema) {
  this._tools[name] = { handler, schema: schema || {} };
  return this;
};

ClaudeFlowMcpIntegration.prototype.before = function (toolName, hook) {
  if (!this._hooks.before[toolName]) this._hooks.before[toolName] = [];
  this._hooks.before[toolName].push(hook);
  return this;
};

ClaudeFlowMcpIntegration.prototype.after = function (toolName, hook) {
  if (!this._hooks.after[toolName]) this._hooks.after[toolName] = [];
  this._hooks.after[toolName].push(hook);
  return this;
};

ClaudeFlowMcpIntegration.prototype.call = async function (toolName, params) {
  const tool = this._tools[toolName];
  if (!tool) {
    throw new Error(`Unknown tool: ${toolName}`);
  }

  const start = Date.now();
  this._metrics.toolCalls++;

  const beforeHooks = this._hooks.before[toolName] || [];
  for (const hook of beforeHooks) {
    await hook(params);
  }

  let result;
  try {
    result = await tool.handler(params);
    this._metrics.successfulCalls++;
  } catch (err) {
    this._metrics.failedCalls++;
    throw err;
  } finally {
    this._metrics.totalDurationMs += Date.now() - start;
  }

  const afterHooks = this._hooks.after[toolName] || [];
  for (const hook of afterHooks) {
    await hook(params, result);
  }

  return result;
};

ClaudeFlowMcpIntegration.prototype.checkpoint = function (state, metadata) {
  if (!this.options.checkpoints) return null;
  return this.checkpointManager.create(state, metadata);
};

ClaudeFlowMcpIntegration.prototype.restore = function (id) {
  return this.checkpointManager.restore(id);
};

ClaudeFlowMcpIntegration.prototype.getMetrics = function () {
  const avg =
    this._metrics.toolCalls > 0
      ? this._metrics.totalDurationMs / this._metrics.toolCalls
      : 0;
  return Object.assign({}, this._metrics, { averageDurationMs: avg });
};

ClaudeFlowMcpIntegration.prototype.listTools = function () {
  return Object.entries(this._tools).map(([name, tool]) => ({
    name,
    schema: tool.schema,
  }));
};

ClaudeFlowMcpIntegration.prototype.toMcpServer = function () {
  const self = this;
  return {
    tools: self.listTools(),
    call: (toolName, params) => self.call(toolName, params),
  };
};

function createMcpIntegration(options) {
  return new ClaudeFlowMcpIntegration(options);
}
