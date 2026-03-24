#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCli = createCli;
exports.run = run;

const { Command } = require("commander");
const { checkpointCommand } = require("./commands/checkpoint");
const { formatCommandHelp } = require("./help-formatter");

const VERSION = "1.0.0";

function createCli() {
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
          ],
          [],
          [
            "claude-flow checkpoint create my-save",
            "claude-flow checkpoint list",
            "claude-flow checkpoint restore cp_1234567890",
          ]
        )
    );

  checkpointCommand(program);

  program.on("command:*", () => {
    console.error(`Unknown command: ${program.args.join(" ")}`);
    console.error("Run 'claude-flow --help' for usage.");
    process.exit(1);
  });

  return program;
}

function run(argv) {
  const cli = createCli();
  cli.parse(argv || process.argv);
  return cli;
}

if (require.main === module) {
  run();
}
