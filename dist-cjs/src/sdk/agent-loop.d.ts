import Anthropic from "@anthropic-ai/sdk";
export interface AgentOptions {
    apiKey?: string;
    model?: string;
    maxTokens?: number;
    maxTurns?: number;
    systemPrompt?: string;
    checkpointDir?: string;
    autoCheckpoint?: boolean;
}
export interface ToolCall {
    name: string;
    input: Record<string, unknown>;
    result: unknown;
    isError: boolean;
}
export interface AgentTurn {
    turnNumber: number;
    toolCalls: ToolCall[];
    text: string;
}
export interface AgentResult {
    finalResponse: string;
    turns: AgentTurn[];
    totalToolCalls: number;
    checkpointId?: string;
}
type ToolHandler = (params: Record<string, unknown>) => Promise<unknown>;
/** Minimal interface for the Anthropic messages API — used for dependency injection in tests. */
export interface MessagesApi {
    create(params: Anthropic.MessageCreateParamsNonStreaming): Promise<Anthropic.Message>;
}
/**
 * AgentLoop orchestrates a multi-turn conversation with Claude, handling tool
 * calls automatically and checkpointing state after each tool-use turn.
 */
export declare class AgentLoop {
    private readonly model;
    private readonly maxTokens;
    private readonly maxTurns;
    private readonly systemPrompt;
    private readonly autoCheckpoint;
    private readonly tools;
    private readonly checkpointManager;
    private readonly api;
    constructor(options?: AgentOptions, api?: MessagesApi);
    /**
     * Register a tool that Claude can call during the agent loop.
     *
     * @param name        Tool name (snake_case, no spaces)
     * @param description What the tool does — Claude reads this to decide when to use it
     * @param inputSchema JSON Schema for the tool's input parameters
     * @param handler     Function that executes the tool and returns a result
     */
    registerTool(name: string, description: string, inputSchema: Record<string, unknown>, handler: ToolHandler): this;
    private buildToolDefinitions;
    /**
     * Run the agent loop with a user prompt.
     *
     * @param prompt  The user's request
     * @param onText  Optional callback called with each text chunk as it arrives
     * @returns       The final result including all turns, tool calls, and a checkpoint ID
     */
    run(prompt: string, onText?: (text: string) => void): Promise<AgentResult>;
}
export declare function createAgentLoop(options?: AgentOptions): AgentLoop;
export {};
//# sourceMappingURL=agent-loop.d.ts.map