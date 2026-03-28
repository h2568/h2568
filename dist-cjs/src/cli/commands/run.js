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
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = runCommand;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const agent_loop_1 = require("../../sdk/agent-loop");
function runCommand(program) {
    program
        .command("run <prompt>")
        .description("Run an AI agent with a prompt")
        .option("-m, --model <model>", "Model to use", "claude-opus-4-6")
        .option("--max-turns <n>", "Maximum number of turns", "10")
        .option("-s, --system <prompt>", "System prompt")
        .option("--no-checkpoint", "Disable auto-checkpointing")
        .option("--tools", "Enable built-in file tools (read_file, write_file, list_files)", false)
        .action(async (prompt, opts) => {
        if (!process.env["ANTHROPIC_API_KEY"]) {
            console.error("Error: ANTHROPIC_API_KEY environment variable is not set.\n" +
                "Get your API key at https://console.anthropic.com");
            process.exit(1);
        }
        const loop = new agent_loop_1.AgentLoop({
            model: opts.model,
            maxTurns: parseInt(opts.maxTurns, 10),
            systemPrompt: opts.system,
            autoCheckpoint: opts.checkpoint,
        });
        if (opts.tools) {
            registerFileTools(loop);
        }
        console.error(`[claude-flow] model=${opts.model} maxTurns=${opts.maxTurns}`);
        console.error("");
        try {
            const result = await loop.run(prompt, (text) => {
                process.stdout.write(text);
            });
            process.stdout.write("\n\n");
            console.error(`[claude-flow] done — ${result.turns.length} turn(s), ` +
                `${result.totalToolCalls} tool call(s)` +
                (result.checkpointId ? `, checkpoint=${result.checkpointId}` : ""));
        }
        catch (err) {
            console.error(`Error: ${err.message}`);
            process.exit(1);
        }
    });
    return program;
}
function registerFileTools(loop) {
    loop.registerTool("read_file", "Read the contents of a file", {
        properties: {
            path: { type: "string", description: "Path to the file to read" },
        },
        required: ["path"],
    }, async ({ path: filePath }) => {
        return fs.readFileSync(filePath, "utf8");
    });
    loop.registerTool("write_file", "Write content to a file, creating it if it does not exist", {
        properties: {
            path: { type: "string", description: "Path to write to" },
            content: { type: "string", description: "Content to write" },
        },
        required: ["path", "content"],
    }, async ({ path: filePath, content }) => {
        const dir = path.dirname(filePath);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, content, "utf8");
        return `Written ${content.length} bytes to ${filePath}`;
    });
    loop.registerTool("list_files", "List files and directories in a directory", {
        properties: {
            directory: {
                type: "string",
                description: "Directory to list (default: current working directory)",
            },
        },
    }, async ({ directory }) => {
        const dir = directory ?? process.cwd();
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        return entries
            .map((e) => `${e.isDirectory() ? "d" : "f"}  ${e.name}`)
            .join("\n");
    });
}
//# sourceMappingURL=run.js.map