import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { AgentLoop } from "../../sdk/agent-loop";

interface RunOptions {
  model: string;
  maxTurns: string;
  system?: string;
  checkpoint: boolean;
  tools: boolean;
}

export function runCommand(program: Command): Command {
  program
    .command("run <prompt>")
    .description("Run an AI agent with a prompt")
    .option("-m, --model <model>", "Model to use", "claude-opus-4-6")
    .option("--max-turns <n>", "Maximum number of turns", "10")
    .option("-s, --system <prompt>", "System prompt")
    .option("--no-checkpoint", "Disable auto-checkpointing")
    .option("--tools", "Enable built-in file tools (read_file, write_file, list_files)", false)
    .action(async (prompt: string, opts: RunOptions) => {
      if (!process.env["ANTHROPIC_API_KEY"]) {
        console.error(
          "Error: ANTHROPIC_API_KEY environment variable is not set.\n" +
          "Get your API key at https://console.anthropic.com"
        );
        process.exit(1);
      }

      const loop = new AgentLoop({
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
        console.error(
          `[claude-flow] done — ${result.turns.length} turn(s), ` +
          `${result.totalToolCalls} tool call(s)` +
          (result.checkpointId ? `, checkpoint=${result.checkpointId}` : "")
        );
      } catch (err) {
        console.error(`Error: ${(err as Error).message}`);
        process.exit(1);
      }
    });

  return program;
}

function registerFileTools(loop: AgentLoop): void {
  loop.registerTool(
    "read_file",
    "Read the contents of a file",
    {
      properties: {
        path: { type: "string", description: "Path to the file to read" },
      },
      required: ["path"],
    },
    async ({ path: filePath }) => {
      return fs.readFileSync(filePath as string, "utf8");
    }
  );

  loop.registerTool(
    "write_file",
    "Write content to a file, creating it if it does not exist",
    {
      properties: {
        path: { type: "string", description: "Path to write to" },
        content: { type: "string", description: "Content to write" },
      },
      required: ["path", "content"],
    },
    async ({ path: filePath, content }) => {
      const dir = path.dirname(filePath as string);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath as string, content as string, "utf8");
      return `Written ${(content as string).length} bytes to ${filePath}`;
    }
  );

  loop.registerTool(
    "list_files",
    "List files and directories in a directory",
    {
      properties: {
        directory: {
          type: "string",
          description: "Directory to list (default: current working directory)",
        },
      },
    },
    async ({ directory }) => {
      const dir = (directory as string | undefined) ?? process.cwd();
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      return entries
        .map((e) => `${e.isDirectory() ? "d" : "f"}  ${e.name}`)
        .join("\n");
    }
  );
}
