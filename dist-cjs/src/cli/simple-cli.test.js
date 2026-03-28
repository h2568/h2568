"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const simple_cli_1 = require("./simple-cli");
(0, node_test_1.describe)('CLI', () => {
    (0, node_test_1.it)('exports createCli and run functions', () => {
        strict_1.default.equal(typeof simple_cli_1.createCli, 'function');
        strict_1.default.equal(typeof simple_cli_1.run, 'function');
    });
    (0, node_test_1.it)('createCli returns a program named claude-flow', () => {
        const cli = (0, simple_cli_1.createCli)();
        strict_1.default.equal(cli.name(), 'claude-flow');
    });
    (0, node_test_1.it)('program has version 1.0.0', () => {
        const cli = (0, simple_cli_1.createCli)();
        strict_1.default.equal(cli.version(), '1.0.0');
    });
    (0, node_test_1.it)('program has checkpoint subcommand', () => {
        const cli = (0, simple_cli_1.createCli)();
        const names = cli.commands.map(c => c.name());
        strict_1.default.ok(names.includes('checkpoint'));
    });
    (0, node_test_1.it)('checkpoint command has create, list, restore subcommands', () => {
        const cli = (0, simple_cli_1.createCli)();
        const checkpoint = cli.commands.find(c => c.name() === 'checkpoint');
        strict_1.default.ok(checkpoint);
        const subNames = checkpoint.commands.map(c => c.name());
        strict_1.default.ok(subNames.includes('create'));
        strict_1.default.ok(subNames.includes('list'));
        strict_1.default.ok(subNames.includes('restore'));
    });
});
//# sourceMappingURL=simple-cli.test.js.map