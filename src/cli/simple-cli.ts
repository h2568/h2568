import { Command } from "commander";
import { checkpointCommand } from "./commands/checkpoint";
import { pluginCommand } from "./commands/plugin";
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
            { name: "checkpoint", description: "Manage checkpoints" },
            { name: "plugin", description: "Manage plugins" },
          ],
          [],
          [
            "claude-flow checkpoint create my-save",
            "claude-flow checkpoint list",
            "claude-flow checkpoint restore cp_1234567890",
            "claude-flow plugin marketplace add AgriciDaniel/claude-ads",
            "claude-flow plugin install claude-ads@agricidaniel-claude-ads",
            "claude-flow plugin list",
          ]
        )
    );

  checkpointCommand(program);
  pluginCommand(program);

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
