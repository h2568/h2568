import { Checkpoint } from "./checkpoint-manager";
export interface McpIntegrationOptions {
    checkpoints?: boolean;
    metrics?: boolean;
    hooks?: boolean;
    checkpointDir?: string;
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
export declare class ClaudeFlowMcpIntegration {
    private options;
    private checkpointManager;
    private _tools;
    private _hooks;
    private _metrics;
    constructor(options?: McpIntegrationOptions);
    registerTool(name: string, handler: ToolHandler, schema?: Record<string, unknown>): this;
    before(toolName: string, hook: BeforeHook): this;
    after(toolName: string, hook: AfterHook): this;
    call(toolName: string, params: Record<string, unknown>): Promise<unknown>;
    checkpoint(state: Record<string, unknown>, metadata?: Record<string, unknown>): Checkpoint | null;
    restore(id: string): Record<string, unknown>;
    getMetrics(): Metrics & {
        averageDurationMs: number;
    };
    listTools(): {
        name: string;
        schema: Record<string, unknown>;
    }[];
    toMcpServer(): {
        tools: {
            name: string;
            schema: Record<string, unknown>;
        }[];
        call: (toolName: string, params: Record<string, unknown>) => Promise<unknown>;
    };
}
export declare function createMcpIntegration(options?: McpIntegrationOptions): ClaudeFlowMcpIntegration;
export {};
//# sourceMappingURL=claude-flow-mcp-integration.d.ts.map