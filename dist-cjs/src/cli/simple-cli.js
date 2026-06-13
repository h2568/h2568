"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCli = createCli;
exports.run = run;
const commander_1 = require("commander");
const checkpoint_1 = require("./commands/checkpoint");
const plugin_1 = require("./commands/plugin");
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
            { name: "checkpoint", description: "Manage checkpoints" },
            { name: "plugin", description: "Manage plugins" },
        ], [], [
            "claude-flow checkpoint create my-save",
            "claude-flow checkpoint list",
            "claude-flow checkpoint restore cp_1234567890",
            "claude-flow plugin marketplace add AgriciDaniel/claude-ads",
            "claude-flow plugin install claude-ads@agricidaniel-claude-ads",
            "claude-flow plugin list",
        ]));
    (0, checkpoint_1.checkpointCommand)(program);
    (0, plugin_1.pluginCommand)(program);
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