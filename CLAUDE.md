# CLAUDE.md

This file provides guidance for AI assistants (Claude and others) working in this repository.

## Project Overview

**Claude Flow** is an AI agent orchestration CLI and SDK for Node.js. It provides:
- A programmatic SDK for integrating MCP (Model Context Protocol) tools with checkpointing, metrics, and hooks
- A CLI for managing checkpoints and hook configurations
- An in-process MCP server implementation for embedding MCP servers in Node.js apps

**Language:** TypeScript (compiled to CommonJS)  
**Node.js requirement:** >=18.0.0  
**License:** MIT

## Repository Structure

```
/
├── bin/
│   └── claude-flow.js              # CLI executable entry point
├── src/
│   ├── sdk/
│   │   ├── claude-flow-mcp-integration.ts  # Main SDK class (ClaudeFlowMcpIntegration)
│   │   ├── checkpoint-manager.ts           # Checkpoint persistence
│   │   └── in-process-mcp.ts               # In-process MCP server (InProcessMcp)
│   └── cli/
│       ├── simple-cli.ts                   # Commander.js CLI entry point
│       ├── commands/
│       │   └── checkpoint.ts               # checkpoint subcommands (create/list/restore)
│       ├── simple-commands/
│       │   └── hooks.ts                    # hooks subcommands (list/add/remove/run)
│       └── help-formatter.ts               # CLI help text formatting utility
├── dist-cjs/                       # Compiled output — DO NOT edit manually
├── .claude/
│   └── settings.json               # Claude Code settings (model, permissions, hooks)
├── .claude-flow/
│   ├── checkpoints/                # Persisted checkpoint JSON files
│   └── metrics/                    # Performance/task metrics JSON files
├── .claude-plugin/
│   └── marketplace.json            # Plugin registry metadata
├── package.json
└── tsconfig.json
```

## Build & Development Commands

```bash
npm run build   # Compile TypeScript → dist-cjs/ (tsc -p tsconfig.json)
npm start       # Run the CLI directly from dist-cjs
npm test        # Run tests (currently none exist; outputs "No tests found")
```

Always run `npm run build` after editing any TypeScript source file before testing CLI behavior.

## Key Modules

### `ClaudeFlowMcpIntegration` (`src/sdk/claude-flow-mcp-integration.ts`)

The main SDK class. Supports fluent chaining.

```typescript
import { createMcpIntegration } from 'claude-flow';

const integration = createMcpIntegration({ checkpoints: true, metrics: true });

integration
  .registerTool('my-tool', async (params) => { /* ... */ }, { /* JSON schema */ })
  .before('my-tool', async (params) => { /* pre-hook */ })
  .after('my-tool', async (params, result) => { /* post-hook */ });

const result = await integration.call('my-tool', { key: 'value' });
const metrics = integration.getMetrics();
const checkpoint = integration.checkpoint({ agentState: '...' });
```

**Options (`McpIntegrationOptions`):**
- `checkpoints` (default: `true`) — enable checkpoint creation
- `metrics` (default: `true`) — track call counts and durations
- `hooks` (default: `true`) — enable before/after hooks
- `checkpointDir` — override checkpoint storage directory

### `CheckpointManager` (`src/sdk/checkpoint-manager.ts`)

Persists agent state snapshots to disk as JSON files.

- Default storage: `.claude-flow/checkpoints/`
- Default max checkpoints: 50 (auto-prunes oldest)
- Checkpoint IDs: 16-char hex strings (crypto.randomBytes)
- Sorted by `createdAtMs` then `seq` (deterministic)

Key methods: `create(state, metadata?)`, `get(id)`, `list()`, `restore(id)`, `delete(id)`, `clear()`, `latest()`

### `InProcessMcp` (`src/sdk/in-process-mcp.ts`)

An in-process MCP server extending `EventEmitter`. Implements MCP protocol methods:
- `tools/list`, `tools/call`
- `resources/list`, `resources/read`
- `prompts/list`, `prompts/get`

Emits `request`, `response`, and `request:error` events. Use `request:error` (not `error`) for error handling.

```typescript
import { createInProcessMcp } from 'claude-flow/in-process-mcp';

const mcp = createInProcessMcp({ name: 'my-server' });
mcp.tool('greet', { description: 'Greet someone' }, async ({ name }) => `Hello, ${name}!`);

const result = await mcp.request('tools/call', { name: 'greet', arguments: { name: 'World' } });
```

### CLI

```bash
claude-flow checkpoint create [--name <name>] [--message <msg>]
claude-flow checkpoint list
claude-flow checkpoint restore <id>

claude-flow hooks list
claude-flow hooks add <event> <command> [--tool <matcher>]
claude-flow hooks remove <event> <index>
claude-flow hooks run <event> [--tool <name>]
```

Hook events: `PreToolUse`, `PostToolUse`, `Stop`, `Start`  
Hooks are stored in `.claude/settings.json` and executed via `child_process.execSync()`.

## Package Exports

```json
{
  ".":                    "dist-cjs/src/sdk/claude-flow-mcp-integration.js",
  "./checkpoint-manager": "dist-cjs/src/sdk/checkpoint-manager.js",
  "./in-process-mcp":     "dist-cjs/src/sdk/in-process-mcp.js",
  "./cli":                "dist-cjs/src/cli/simple-cli.js"
}
```

## Code Conventions

- **TypeScript strict mode** is enabled — all code must pass `tsc` without errors
- **2-space indentation**
- **Classes for stateful modules** (CheckpointManager, ClaudeFlowMcpIntegration, InProcessMcp)
- **Factory functions** exported alongside classes (`createMcpIntegration`, `createInProcessMcp`)
- **Fluent/builder pattern** — methods that configure state return `this` for chaining
- **Private members** use `_` prefix (e.g., `_tools`, `_hooks`, `_metrics`)
- **Synchronous fs** operations for checkpoint/config I/O
- **No test files currently exist** — when adding tests, use Node.js built-in test runner (`node --test`)

## Runtime Data

Do not commit these runtime-generated files/directories:
- `.claude-flow/checkpoints/*.json` — checkpoint snapshots
- `.claude-flow/metrics/*.json` — metrics data

These are included in `package.json`'s `files` array for distribution but are generated at runtime.

## Claude Code Settings (`.claude/settings.json`)

- Model: `claude-opus-4-6`
- Hook arrays (`PreToolUse`, `PostToolUse`, `Stop`) start empty and are populated via `claude-flow hooks add`
- Permissions `allow`/`deny` lists are empty by default

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `commander` | ^12.0.0 | CLI argument parsing |
| `typescript` | ^5.9.3 | Dev: TypeScript compiler |
| `@types/node` | ^20.19.37 | Dev: Node.js type definitions |

No external runtime dependencies beyond `commander`. All other functionality uses Node.js built-ins (`fs`, `path`, `crypto`, `events`, `child_process`).

## What Does NOT Exist (yet)

- No CI/CD configuration (no `.github/workflows/`)
- No test files
- No linter configuration (no ESLint/Prettier)
- No README.md
