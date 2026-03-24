"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpFormatter = HelpFormatter;
exports.formatCommandHelp = formatCommandHelp;
exports.formatOptionHelp = formatOptionHelp;

const INDENT = "  ";
const COL_WIDTH = 28;

function HelpFormatter(options) {
  this.options = Object.assign(
    {
      indent: INDENT,
      colWidth: COL_WIDTH,
      maxWidth: 80,
    },
    options
  );
}

HelpFormatter.prototype.format = function (helpInfo) {
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
      lines.push(formatRow(cmd.name, cmd.description, this.options));
    });
    lines.push("");
  }

  if (helpInfo.options && helpInfo.options.length > 0) {
    lines.push("Options:");
    helpInfo.options.forEach((opt) => {
      lines.push(formatRow(opt.flags, opt.description, this.options));
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
};

function formatCommandHelp(name, description, subcommands, options, examples) {
  const formatter = new HelpFormatter();
  return formatter.format({
    description,
    usage: subcommands ? `${name} <command> [options]` : `${name} [options]`,
    commands: subcommands || [],
    options: options || [],
    examples: examples || [],
  });
}

function formatOptionHelp(flags, description, defaultValue) {
  const pad = flags.padEnd(COL_WIDTH);
  const def = defaultValue !== undefined ? ` (default: ${defaultValue})` : "";
  return `${INDENT}${pad}${description}${def}`;
}

function formatRow(left, right, opts) {
  const indent = opts.indent || INDENT;
  const colWidth = opts.colWidth || COL_WIDTH;
  const padded = left.padEnd(colWidth);
  if (left.length >= colWidth) {
    return `${indent}${left}\n${indent}${" ".repeat(colWidth)}${right}`;
  }
  return `${indent}${padded}${right}`;
}
