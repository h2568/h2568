import { CheckpointManager, Checkpoint } from "./checkpoint-manager";
import { AgentLoop, AgentOptions, AgentResult, MessagesApi } from "./agent-loop";

export interface McpIntegrationOptions {
  checkpoints?: boolean;
  metrics?: boolean;
  hooks?: boolean;
  checkpointDir?: string;
  /** Override Anthropic API client — used in tests to avoid real network calls. */
  _testApi?: MessagesApi;
}

type ToolHandler = (params: Record<string, unknown>) => Promise<unknown>;
type BeforeHook = (params: Record<string, unknown>) => Promise<void>;
type AfterHook = (params: Record<string, unknown>, result: unknown) => Promise<void>;

interface Metrics {
  toolCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalDurationMs: number;
}

const DEFAULT_OPTIONS: McpIntegrationOptions = {
  checkpoints: true,
  metrics: true,
  hooks: true,
};

export class ClaudeFlowMcpIntegration {
  private options: McpIntegrationOptions;
  private checkpointManager: CheckpointManager;
  private _tools: Map<string, { handler: ToolHandler; schema: Record<string, unknown> }>;
  private _hooks: { before: Record<string, BeforeHook[]>; after: Record<string, AfterHook[]> };
  private _metrics: Metrics;

  constructor(options?: McpIntegrationOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.checkpointManager = new CheckpointManager(
      this.options.checkpointDir ? { dir: this.options.checkpointDir } : undefined
    );
    this._tools = new Map();
    this._hooks = { before: {}, after: {} };
    this._metrics = { toolCalls: 0, successfulCalls: 0, failedCalls: 0, totalDurationMs: 0 };
  }

  registerTool(name: string, handler: ToolHandler, schema?: Record<string, unknown>): this {
    this._tools.set(name, { handler, schema: schema ?? {} });
    return this;
  }

  before(toolName: string, hook: BeforeHook): this {
    if (!this._hooks.before[toolName]) this._hooks.before[toolName] = [];
    this._hooks.before[toolName].push(hook);
    return this;
  }

  after(toolName: string, hook: AfterHook): this {
    if (!this._hooks.after[toolName]) this._hooks.after[toolName] = [];
    this._hooks.after[toolName].push(hook);
    return this;
  }

  async call(toolName: string, params: Record<string, unknown>): Promise<unknown> {
    const tool = this._tools.get(toolName);
    if (!tool) throw new Error(`Unknown tool: ${toolName}`);

    const start = Date.now();
    this._metrics.toolCalls++;

    for (const hook of this._hooks.before[toolName] ?? []) {
      await hook(params);
    }

    let result: unknown;
    try {
      result = await tool.handler(params);
      this._metrics.successfulCalls++;
    } catch (err) {
      this._metrics.failedCalls++;
      throw err;
    } finally {
      this._metrics.totalDurationMs += Date.now() - start;
    }

    for (const hook of this._hooks.after[toolName] ?? []) {
      await hook(params, result);
    }

    return result;
  }

  checkpoint(state: Record<string, unknown>, metadata?: Record<string, unknown>): Checkpoint | null {
    if (!this.options.checkpoints) return null;
    return this.checkpointManager.create(state, metadata);
  }

  restore(id: string): Record<string, unknown> {
    return this.checkpointManager.restore(id);
  }

  getMetrics(): Metrics & { averageDurationMs: number } {
    const avg = this._metrics.toolCalls > 0 ? this._metrics.totalDurationMs / this._metrics.toolCalls : 0;
    return { ...this._metrics, averageDurationMs: avg };
  }

  listTools(): { name: string; schema: Record<string, unknown> }[] {
    return Array.from(this._tools.entries()).map(([name, tool]) => ({ name, schema: tool.schema }));
  }

  toMcpServer() {
    return {
      tools: this.listTools(),
      call: (toolName: string, params: Record<string, unknown>) => this.call(toolName, params),
    };
  }

  /**
   * Run an agent loop with the registered tools wired in.
   *
   * @param prompt      The user's request
   * @param agentOpts   Optional overrides for model, maxTurns, systemPrompt, etc.
   * @param onText      Called with each text chunk as it arrives from the model
   */
  async run(
    prompt: string,
    agentOpts?: AgentOptions,
    onText?: (text: string) => void
  ): Promise<AgentResult> {
    const loop = new AgentLoop(
      {
        checkpointDir: this.options.checkpointDir,
        autoCheckpoint: this.options.checkpoints,
        ...agentOpts,
      },
      this.options._testApi
    );

    for (const [name, { handler, schema }] of this._tools) {
      const description =
        typeof schema["description"] === "string"
          ? schema["description"]
          : `Tool: ${name}`;
      loop.registerTool(name, description, schema, handler);
    }

    return loop.run(prompt, onText);
  }
}

export function createMcpIntegration(options?: McpIntegrationOptions): ClaudeFlowMcpIntegration {
  return new ClaudeFlowMcpIntegration(options);
}
