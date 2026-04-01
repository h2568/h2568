import * as os from "os";
import * as path from "path";
import * as fs from "fs";

export interface ContextInfo {
  platform: NodeJS.Platform;
  shell: string | undefined;
  cwd: string;
  home: string;
  claudeConfigDir: string;
  isCI: boolean;
}

export function collectContext(): ContextInfo {
  return {
    platform: os.platform(),
    shell: process.env.SHELL ?? process.env.ComSpec,
    cwd: process.cwd(),
    home: os.homedir(),
    claudeConfigDir: path.join(os.homedir(), ".claude"),
    isCI: Boolean(process.env.CI || process.env.CONTINUOUS_INTEGRATION),
  };
}

export function buildSystemPrompt(extra?: string): string {
  const ctx = collectContext();
  const lines: string[] = [
    `Platform: ${ctx.platform}`,
    `CWD: ${ctx.cwd}`,
  ];
  if (ctx.shell) lines.push(`Shell: ${ctx.shell}`);
  if (extra) {
    lines.push("");
    lines.push(extra);
  }
  return lines.join("\n");
}

export function readClaudeConfig<T = unknown>(filename: string): T | null {
  const ctx = collectContext();
  const filePath = path.join(ctx.claudeConfigDir, filename);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch {
    return null;
  }
}
