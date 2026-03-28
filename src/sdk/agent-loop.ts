import Anthropic from "@anthropic-ai/sdk";
import { CheckpointManager } from "./checkpoint-manager";

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

interface RegisteredTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: ToolHandler;
}

/** Minimal interface for the Anthropic messages API — used for dependency injection in tests. */
export interface MessagesApi {
  create(
    params: Anthropic.MessageCreateParamsNonStreaming
  ): Promise<Anthropic.Message>;
}

const DEFAULTS = {
  model: "claude-opus-4-6",
  maxTokens: 8096,
  maxTurns: 10,
  systemPrompt: "",
  checkpointDir: ".claude-flow/checkpoints",
  autoCheckpoint: true,
} as const;

/**
 * AgentLoop orchestrates a multi-turn conversation with Claude, handling tool
 * calls automatically and checkpointing state after each tool-use turn.
 */
export class AgentLoop {
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly maxTurns: number;
  private readonly systemPrompt: string;
  private readonly autoCheckpoint: boolean;
  private readonly tools: Map<string, RegisteredTool> = new Map();
  private readonly checkpointManager: CheckpointManager | null;
  private readonly api: MessagesApi;

  constructor(options: AgentOptions = {}, api?: MessagesApi) {
    this.model = options.model ?? DEFAULTS.model;
    this.maxTokens = options.maxTokens ?? DEFAULTS.maxTokens;
    this.maxTurns = options.maxTurns ?? DEFAULTS.maxTurns;
    this.systemPrompt = options.systemPrompt ?? DEFAULTS.systemPrompt;
    this.autoCheckpoint = options.autoCheckpoint ?? DEFAULTS.autoCheckpoint;

    const checkpointDir = options.checkpointDir ?? DEFAULTS.checkpointDir;
    this.checkpointManager = this.autoCheckpoint
      ? new CheckpointManager({ dir: checkpointDir })
      : null;

    if (api) {
      this.api = api;
    } else {
      const apiKey = options.apiKey ?? process.env["ANTHROPIC_API_KEY"] ?? "";
      this.api = new Anthropic({ apiKey }).messages as MessagesApi;
    }
  }

  /**
   * Register a tool that Claude can call during the agent loop.
   *
   * @param name        Tool name (snake_case, no spaces)
   * @param description What the tool does — Claude reads this to decide when to use it
   * @param inputSchema JSON Schema for the tool's input parameters
   * @param handler     Function that executes the tool and returns a result
   */
  registerTool(
    name: string,
    description: string,
    inputSchema: Record<string, unknown>,
    handler: ToolHandler
  ): this {
    this.tools.set(name, { name, description, inputSchema, handler });
    return this;
  }

  private buildToolDefinitions(): Anthropic.Tool[] {
    return Array.from(this.tools.values()).map(
      ({ name, description, inputSchema }) => ({
        name,
        description,
        input_schema: {
          type: "object" as const,
          ...(inputSchema.properties
            ? { properties: inputSchema.properties as Record<string, unknown> }
            : {}),
          ...(inputSchema.required ? { required: inputSchema.required as string[] } : {}),
        } as Anthropic.Tool["input_schema"],
      })
    );
  }

  /**
   * Run the agent loop with a user prompt.
   *
   * @param prompt  The user's request
   * @param onText  Optional callback called with each text chunk as it arrives
   * @returns       The final result including all turns, tool calls, and a checkpoint ID
   */
  async run(
    prompt: string,
    onText?: (text: string) => void
  ): Promise<AgentResult> {
    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: prompt },
    ];

    const turns: AgentTurn[] = [];
    let totalToolCalls = 0;
    let finalResponse = "";
    let checkpointId: string | undefined;

    for (let i = 0; i < this.maxTurns; i++) {
      const toolDefs = this.buildToolDefinitions();

      const params: Anthropic.MessageCreateParamsNonStreaming = {
        model: this.model,
        max_tokens: this.maxTokens,
        messages,
        ...(toolDefs.length > 0 && { tools: toolDefs }),
        ...(this.systemPrompt && { system: this.systemPrompt }),
      };

      const response = await this.api.create(params);
      const turn: AgentTurn = { turnNumber: i + 1, toolCalls: [], text: "" };

      for (const block of response.content) {
        if (block.type === "text") {
          turn.text += block.text;
          finalResponse = block.text;
          onText?.(block.text);
        }
      }

      messages.push({ role: "assistant", content: response.content });

      if (response.stop_reason === "end_turn") {
        turns.push(turn);
        break;
      }

      if (response.stop_reason === "tool_use") {
        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const block of response.content) {
          if (block.type !== "tool_use") continue;

          totalToolCalls++;
          const toolInput = block.input as Record<string, unknown>;
          const tool = this.tools.get(block.name);
          let result: unknown;
          let isError = false;

          try {
            if (!tool) {
              result = `Error: unknown tool "${block.name}"`;
              isError = true;
            } else {
              result = await tool.handler(toolInput);
            }
          } catch (err) {
            result = `Error: ${(err as Error).message}`;
            isError = true;
          }

          turn.toolCalls.push({ name: block.name, input: toolInput, result, isError });

          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content:
              typeof result === "string"
                ? result
                : JSON.stringify(result, null, 2),
            ...(isError && { is_error: true }),
          });
        }

        messages.push({ role: "user", content: toolResults });
        turns.push(turn);

        if (this.checkpointManager) {
          const cp = this.checkpointManager.create(
            { messages, turns, totalToolCalls },
            { turn: i + 1, prompt }
          );
          checkpointId = cp.id;
        }

        continue;
      }

      turns.push(turn);
      break;
    }

    return { finalResponse, turns, totalToolCalls, checkpointId };
  }
}

export function createAgentLoop(options?: AgentOptions): AgentLoop {
  return new AgentLoop(options);
}
