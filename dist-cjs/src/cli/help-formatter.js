"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpFormatter = void 0;
exports.formatCommandHelp = formatCommandHelp;
exports.formatOptionHelp = formatOptionHelp;
const INDENT = "  ";
const COL_WIDTH = 28;
class HelpFormatter {
    constructor(options) {
        this.options = {
            indent: options?.indent ?? INDENT,
            colWidth: options?.colWidth ?? COL_WIDTH,
            maxWidth: options?.maxWidth ?? 80,
        };
    }
    format(helpInfo) {
        const lines = [];
        if (helpInfo.description) {
            lines.push(helpInfo.description);
            lines.push("");
        }
        if (helpInfo.usage) {
            lines.push("Usage:");
            lines.push(`${this.options.indent}${helpInfo.usage}`);
            lines.push("");
        }
        if (helpInfo.commands && helpInfo.commands.length > 0) {
            lines.push("Commands:");
            helpInfo.commands.forEach((cmd) => {
                lines.push(this._formatRow(cmd.name, cmd.description));
            });
            lines.push("");
        }
        if (helpInfo.options && helpInfo.options.length > 0) {
            lines.push("Options:");
            helpInfo.options.forEach((opt) => {
                lines.push(this._formatRow(opt.flags, opt.description));
            });
            lines.push("");
        }
        if (helpInfo.examples && helpInfo.examples.length > 0) {
            lines.push("Examples:");
            helpInfo.examples.forEach((ex) => {
                lines.push(`${this.options.indent}${ex}`);
            });
            lines.push("");
        }
        return lines.join("\n").trimEnd();
    }
    _formatRow(left, right) {
        const { indent, colWidth } = this.options;
        if (left.length >= colWidth) {
            return `${indent}${left}\n${indent}${" ".repeat(colWidth)}${right}`;
        }
        return `${indent}${left.padEnd(colWidth)}${right}`;
    }
}
exports.HelpFormatter = HelpFormatter;
function formatCommandHelp(name, description, subcommands, options, examples) {
    const formatter = new HelpFormatter();
    return formatter.format({
        description,
        usage: subcommands ? `${name} <command> [options]` : `${name} [options]`,
        commands: subcommands ?? [],
        options: options ?? [],
        examples: examples ?? [],
    });
}
function formatOptionHelp(flags, description, defaultValue) {
    const pad = flags.padEnd(COL_WIDTH);
    const def = defaultValue !== undefined ? ` (default: ${defaultValue})` : "";
    return `${INDENT}${pad}${description}${def}`;
}
//# sourceMappingURL=help-formatter.js.map