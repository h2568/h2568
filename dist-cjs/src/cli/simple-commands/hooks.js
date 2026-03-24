"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.hooksCommand = hooksCommand;
exports.listHooks = listHooks;
exports.addHook = addHook;
exports.removeHook = removeHook;
exports.runHook = runHook;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const SETTINGS_FILE = ".claude/settings.json";
const VALID_EVENTS = ["PreToolUse", "PostToolUse", "Stop", "Start"];
function hooksCommand(program) {
    const cmd = program.command("hooks").description("Manage Claude Flow hooks");
    cmd
        .command("list")
        .description("List all configured hooks")
        .option("-e, --event <event>", "Filter by event type")
        .action((options) => {
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
        .action((event, command, options) => {
        addHook(event, command, options.matcher);
        console.log(`Hook added for event: ${event}`);
    });
    cmd
        .command("remove <event> <index>")
        .description("Remove a hook by event and index")
        .action((event, index) => {
        removeHook(event, parseInt(index, 10));
        console.log(`Hook removed from event: ${event}`);
    });
    cmd
        .command("run <event>")
        .description("Manually trigger hooks for an event")
        .option("-d, --data <json>", "JSON data to pass to the hook")
        .action((event, options) => {
        const data = options.data ? JSON.parse(options.data) : {};
        const results = runHook(event, data);
        console.log(`Ran ${results.length} hook(s) for event: ${event}`);
    });
    return cmd;
}
function loadSettings() {
    if (!fs.existsSync(SETTINGS_FILE))
        return { hooks: {} };
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8"));
}
function saveSettings(settings) {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}
function listHooks(eventFilter) {
    const settings = loadSettings();
    const hooks = settings.hooks ?? {};
    const result = [];
    Object.entries(hooks).forEach(([event, entries]) => {
        if (eventFilter && event !== eventFilter)
            return;
        (entries ?? []).forEach((entry) => {
            result.push({ event, command: entry.command, matcher: entry.matcher ?? null });
        });
    });
    return result;
}
function addHook(event, command, matcher) {
    if (!VALID_EVENTS.includes(event)) {
        throw new Error(`Invalid event: ${event}. Must be one of: ${VALID_EVENTS.join(", ")}`);
    }
    const settings = loadSettings();
    if (!settings.hooks)
        settings.hooks = {};
    if (!settings.hooks[event])
        settings.hooks[event] = [];
    const entry = { command };
    if (matcher)
        entry.matcher = matcher;
    settings.hooks[event].push(entry);
    saveSettings(settings);
    return entry;
}
function removeHook(event, index) {
    const settings = loadSettings();
    const hooks = (settings.hooks ?? {})[event];
    if (!hooks || index < 0 || index >= hooks.length) {
        throw new Error(`No hook at index ${index} for event: ${event}`);
    }
    hooks.splice(index, 1);
    saveSettings(settings);
}
function runHook(event, data) {
    const hooks = listHooks(event);
    const results = [];
    hooks.forEach((hook) => {
        try {
            const { execSync } = require("child_process");
            const output = execSync(hook.command, {
                input: JSON.stringify(data),
                encoding: "utf8",
                timeout: 30000,
            });
            results.push({ hook, success: true, output });
        }
        catch (err) {
            results.push({ hook, success: false, error: err.message });
        }
    });
    return results;
}
//# sourceMappingURL=hooks.js.map