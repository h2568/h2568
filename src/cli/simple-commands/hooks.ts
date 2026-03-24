import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";

const SETTINGS_FILE = ".claude/settings.json";
const VALID_EVENTS = ["PreToolUse", "PostToolUse", "Stop", "Start"];

interface HookEntry {
  command: string;
  matcher?: string;
}

interface Settings {
  hooks?: Record<string, HookEntry[]>;
  [key: string]: unknown;
}

interface HookRecord {
  event: string;
  command: string;
  matcher: string | null;
}

export function hooksCommand(program: Command): Command {
  const cmd = program.command("hooks").description("Manage Claude Flow hooks");

  cmd
    .command("list")
    .description("List all configured hooks")
    .option("-e, --event <event>", "Filter by event type")
    .action((options: { event?: string }) => {
      const hooks = listHooks(options.event);
      if (hooks.length === 0) {
        console.log("No hooks configured.");
        return;
      }
      hooks.forEach((h) => {
        console.log(`[${h.event}] ${h.command}${h.matcher ? `  (matcher: ${h.matcher})` : ""}`);
      });
    });

  cmd
    .command("add <event> <command>")
    .description(`Add a hook for an event (${VALID_EVENTS.join(", ")})`)
    .option("-m, --matcher <pattern>", "Tool name matcher pattern")
    .action((event: string, command: string, options: { matcher?: string }) => {
      addHook(event, command, options.matcher);
      console.log(`Hook added for event: ${event}`);
    });

  cmd
    .command("remove <event> <index>")
    .description("Remove a hook by event and index")
    .action((event: string, index: string) => {
      removeHook(event, parseInt(index, 10));
      console.log(`Hook removed from event: ${event}`);
    });

  cmd
    .command("run <event>")
    .description("Manually trigger hooks for an event")
    .option("-d, --data <json>", "JSON data to pass to the hook")
    .action((event: string, options: { data?: string }) => {
      const data = options.data ? JSON.parse(options.data) : {};
      const results = runHook(event, data);
      console.log(`Ran ${results.length} hook(s) for event: ${event}`);
    });

  return cmd;
}

function loadSettings(): Settings {
  if (!fs.existsSync(SETTINGS_FILE)) return { hooks: {} };
  return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8")) as Settings;
}

function saveSettings(settings: Settings): void {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export function listHooks(eventFilter?: string): HookRecord[] {
  const settings = loadSettings();
  const hooks = settings.hooks ?? {};
  const result: HookRecord[] = [];

  Object.entries(hooks).forEach(([event, entries]) => {
    if (eventFilter && event !== eventFilter) return;
    (entries ?? []).forEach((entry) => {
      result.push({ event, command: entry.command, matcher: entry.matcher ?? null });
    });
  });

  return result;
}

export function addHook(event: string, command: string, matcher?: string): HookEntry {
  if (!VALID_EVENTS.includes(event)) {
    throw new Error(`Invalid event: ${event}. Must be one of: ${VALID_EVENTS.join(", ")}`);
  }

  const settings = loadSettings();
  if (!settings.hooks) settings.hooks = {};
  if (!settings.hooks[event]) settings.hooks[event] = [];

  const entry: HookEntry = { command };
  if (matcher) entry.matcher = matcher;
  settings.hooks[event].push(entry);

  saveSettings(settings);
  return entry;
}

export function removeHook(event: string, index: number): void {
  const settings = loadSettings();
  const hooks = (settings.hooks ?? {})[event];

  if (!hooks || index < 0 || index >= hooks.length) {
    throw new Error(`No hook at index ${index} for event: ${event}`);
  }

  hooks.splice(index, 1);
  saveSettings(settings);
}

export function runHook(event: string, data: unknown): { hook: HookRecord; success: boolean; output?: string; error?: string }[] {
  const hooks = listHooks(event);
  const results: { hook: HookRecord; success: boolean; output?: string; error?: string }[] = [];

  hooks.forEach((hook) => {
    try {
      const { execSync } = require("child_process");
      const output = execSync(hook.command, {
        input: JSON.stringify(data),
        encoding: "utf8",
        timeout: 30000,
      }) as string;
      results.push({ hook, success: true, output });
    } catch (err) {
      results.push({ hook, success: false, error: (err as Error).message });
    }
  });

  return results;
}
