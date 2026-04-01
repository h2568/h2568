const INDENT = "  ";
const COL_WIDTH = 28;

export interface HelpFormatterOptions {
  indent?: string;
  colWidth?: number;
  maxWidth?: number;
}

export interface HelpInfo {
  description?: string;
  usage?: string;
  commands?: { name: string; description: string }[];
  options?: { flags: string; description: string }[];
  examples?: string[];
}

export class HelpFormatter {
  private options: Required<HelpFormatterOptions>;

  constructor(options?: HelpFormatterOptions) {
    this.options = {
      indent: options?.indent ?? INDENT,
      colWidth: options?.colWidth ?? COL_WIDTH,
      maxWidth: options?.maxWidth ?? 80,
    };
  }

  format(helpInfo: HelpInfo): string {
    const lines: string[] = [];

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

  private _formatRow(left: string, right: string): string {
    const { indent, colWidth } = this.options;
    if (left.length >= colWidth) {
      return `${indent}${left}\n${indent}${" ".repeat(colWidth)}${right}`;
    }
    return `${indent}${left.padEnd(colWidth)}${right}`;
  }
}

export function formatCommandHelp(
  name: string,
  description: string,
  subcommands?: { name: string; description: string }[],
  options?: { flags: string; description: string }[],
  examples?: string[]
): string {
  const formatter = new HelpFormatter();
  return formatter.format({
    description,
    usage: subcommands ? `${name} <command> [options]` : `${name} [options]`,
    commands: subcommands ?? [],
    options: options ?? [],
    examples: examples ?? [],
  });
}

export function formatOptionHelp(flags: string, description: string, defaultValue?: unknown): string {
  const pad = flags.padEnd(COL_WIDTH);
  const def = defaultValue !== undefined ? ` (default: ${defaultValue})` : "";
  return `${INDENT}${pad}${description}${def}`;
}
