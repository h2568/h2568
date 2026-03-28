"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentLoop = void 0;
exports.createAgentLoop = createAgentLoop;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const checkpoint_manager_1 = require("./checkpoint-manager");
const DEFAULTS = {
    model: "claude-opus-4-6",
    maxTokens: 8096,
    maxTurns: 10,
    systemPrompt: "",
    checkpointDir: ".claude-flow/checkpoints",
    autoCheckpoint: true,
};
/**
 * AgentLoop orchestrates a multi-turn conversation with Claude, handling tool
 * calls automatically and checkpointing state after each tool-use turn.
 */
class AgentLoop {
    constructor(options = {}, api) {
        this.tools = new Map();
        this.model = options.model ?? DEFAULTS.model;
        this.maxTokens = options.maxTokens ?? DEFAULTS.maxTokens;
        this.maxTurns = options.maxTurns ?? DEFAULTS.maxTurns;
        this.systemPrompt = options.systemPrompt ?? DEFAULTS.systemPrompt;
        this.autoCheckpoint = options.autoCheckpoint ?? DEFAULTS.autoCheckpoint;
        const checkpointDir = options.checkpointDir ?? DEFAULTS.checkpointDir;
        this.checkpointManager = this.autoCheckpoint
            ? new checkpoint_manager_1.CheckpointManager({ dir: checkpointDir })
            : null;
        if (api) {
            this.api = api;
        }
        else {
            const apiKey = options.apiKey ?? process.env["ANTHROPIC_API_KEY"] ?? "";
            this.api = new sdk_1.default({ apiKey }).messages;
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
    registerTool(name, description, inputSchema, handler) {
        this.tools.set(name, { name, description, inputSchema, handler });
        return this;
    }
    buildToolDefinitions() {
        return Array.from(this.tools.values()).map(({ name, description, inputSchema }) => ({
            name,
            description,
            input_schema: {
                type: "object",
                ...(inputSchema.properties
                    ? { properties: inputSchema.properties }
                    : {}),
                ...(inputSchema.required ? { required: inputSchema.required } : {}),
            },
        }));
    }
    /**
     * Run the agent loop with a user prompt.
     *
     * @param prompt  The user's request
     * @param onText  Optional callback called with each text chunk as it arrives
     * @returns       The final result including all turns, tool calls, and a checkpoint ID
     */
    async run(prompt, onText) {
        const messages = [
            { role: "user", content: prompt },
        ];
        const turns = [];
        let totalToolCalls = 0;
        let finalResponse = "";
        let checkpointId;
        for (let i = 0; i < this.maxTurns; i++) {
            const toolDefs = this.buildToolDefinitions();
            const params = {
                model: this.model,
                max_tokens: this.maxTokens,
                messages,
                ...(toolDefs.length > 0 && { tools: toolDefs }),
                ...(this.systemPrompt && { system: this.systemPrompt }),
            };
            const response = await this.api.create(params);
            const turn = { turnNumber: i + 1, toolCalls: [], text: "" };
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
                const toolResults = [];
                for (const block of response.content) {
                    if (block.type !== "tool_use")
                        continue;
                    totalToolCalls++;
                    const toolInput = block.input;
                    const tool = this.tools.get(block.name);
                    let result;
                    let isError = false;
                    try {
                        if (!tool) {
                            result = `Error: unknown tool "${block.name}"`;
                            isError = true;
                        }
                        else {
                            result = await tool.handler(toolInput);
                        }
                    }
                    catch (err) {
                        result = `Error: ${err.message}`;
                        isError = true;
                    }
                    turn.toolCalls.push({ name: block.name, input: toolInput, result, isError });
                    toolResults.push({
                        type: "tool_result",
                        tool_use_id: block.id,
                        content: typeof result === "string"
                            ? result
                            : JSON.stringify(result, null, 2),
                        ...(isError && { is_error: true }),
                    });
                }
                messages.push({ role: "user", content: toolResults });
                turns.push(turn);
                if (this.checkpointManager) {
                    const cp = this.checkpointManager.create({ messages, turns, totalToolCalls }, { turn: i + 1, prompt });
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
exports.AgentLoop = AgentLoop;
function createAgentLoop(options) {
    return new AgentLoop(options);
}
//# sourceMappingURL=agent-loop.js.map