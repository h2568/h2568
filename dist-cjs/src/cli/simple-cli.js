"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCli = createCli;
exports.run = run;
const commander_1 = require("commander");
const checkpoint_1 = require("./commands/checkpoint");
const run_1 = require("./commands/run");
const help_formatter_1 = require("./help-formatter");
const VERSION = "1.0.0";
function createCli() {
    const program = new commander_1.Command();
    program
        .name("claude-flow")
        .description("Claude Flow - AI agent orchestration CLI")
        .version(VERSION)
        .addHelpText("after", "\n" +
        (0, help_formatter_1.formatCommandHelp)("claude-flow", "", [
            { name: "run", description: "Run an AI agent with a prompt" },
            { name: "checkpoint", description: "Manage checkpoints" },
        ], [], [
            "claude-flow run \"summarise the src/ directory\"",
            "claude-flow run --tools \"list the TypeScript files and count lines\"",
            "claude-flow checkpoint create my-save",
            "claude-flow checkpoint list",
        ]));
    (0, run_1.runCommand)(program);
    (0, checkpoint_1.checkpointCommand)(program);
    program.on("command:*", () => {
        console.error(`Unknown command: ${program.args.join(" ")}`);
        console.error("Run 'claude-flow --help' for usage.");
        process.exit(1);
    });
    return program;
}
function run(argv) {
    const cli = createCli();
    cli.parse(argv ?? process.argv);
    return cli;
}
if (require.main === module) {
    run();
}
//# sourceMappingURL=simple-cli.js.map