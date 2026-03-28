import { Command } from "commander";
import { checkpointCommand } from "./commands/checkpoint";
import { runCommand } from "./commands/run";
import { formatCommandHelp } from "./help-formatter";

const VERSION = "1.0.0";

export function createCli(): Command {
  const program = new Command();

  program
    .name("claude-flow")
    .description("Claude Flow - AI agent orchestration CLI")
    .version(VERSION)
    .addHelpText(
      "after",
      "\n" +
        formatCommandHelp(
          "claude-flow",
          "",
          [
            { name: "run", description: "Run an AI agent with a prompt" },
            { name: "checkpoint", description: "Manage checkpoints" },
          ],
          [],
          [
            "claude-flow run \"summarise the src/ directory\"",
            "claude-flow run --tools \"list the TypeScript files and count lines\"",
            "claude-flow checkpoint create my-save",
            "claude-flow checkpoint list",
          ]
        )
    );

  runCommand(program);
  checkpointCommand(program);

  program.on("command:*", () => {
    console.error(`Unknown command: ${program.args.join(" ")}`);
    console.error("Run 'claude-flow --help' for usage.");
    process.exit(1);
  });

  return program;
}

export function run(argv?: string[]): Command {
  const cli = createCli();
  cli.parse(argv ?? process.argv);
  return cli;
}

if (require.main === module) {
  run();
}
