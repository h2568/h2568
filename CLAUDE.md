# CLAUDE.md

## Project Overview

`claude-flow` is an AI agent orchestration CLI and SDK for Claude. It provides:
- A CLI (`claude-flow`) for managing checkpoints and hooks
- A TypeScript SDK for building MCP-compatible tool servers with checkpointing, metrics, and hook middleware
- An in-process MCP server implementation for embedding MCP protocol handling without a network transport

The repo also hosts a local Claude Code configuration (`.claude/`) with an installed `claude-ads` plugin (v1.5.1) that bundles 19 advertising-audit skills and 10 specialized agents.

---

## Repository Layout

```
.
├── bin/
│   └── claude-flow.js          # CLI entry point (requires dist-cjs)
├── src/
│   ├── cli/
│   │   ├── simple-cli.ts       # CLI root (commander), registers subcommands
│   │   ├── help-formatter.ts   # HelpFormatter class + formatCommandHelp utility
│   │   ├── commands/
│   │   │   └── checkpoint.ts   # `claude-flow checkpoint` subcommand
│   │   └── simple-commands/
│   │       └── hooks.ts        # Hook management logic (NOT yet wired to CLI)
│   └── sdk/
│       ├── checkpoint-manager.ts        # CheckpointManager – persists state to JSON files
│       ├── claude-flow-mcp-integration.ts  # ClaudeFlowMcpIntegration – tool registry + hooks + metrics
│       └── in-process-mcp.ts            # InProcessMcp – EventEmitter-based in-process MCP server
├── dist-cjs/                   # Compiled CommonJS output (committed, do not hand-edit)
├── .claude/
│   ├── settings.json           # Claude Code project settings (model, permissions, hooks)
│   ├── agents/                 # Custom agent definitions (10 claude-ads agents)
│   └── skills/                 # Custom skill definitions (19 claude-ads skills)
├── .claude-flow/
│   └── metrics/                # Runtime metrics JSON (performance.json, task-metrics.json)
├── .claude-plugin/
│   └── marketplace.json        # Installed plugin registry
├── package.json
└── tsconfig.json
```

---

## Build & Development

### Prerequisites
- Node.js ≥ 18.0.0
- TypeScript (dev dependency, no global install required)

### Commands

```bash
npm run build   # tsc -p tsconfig.json → outputs to dist-cjs/
npm start       # node dist-cjs/src/cli/simple-cli.js
npm test        # node --test src/**/*.test.ts (no tests exist yet)
```

### TypeScript Configuration

- **Target**: ES2020, **Module**: CommonJS
- **rootDir**: `.` (includes `src/`), **outDir**: `dist-cjs/`
- Strict mode enabled (`strict: true`)
- Source maps and declaration files emitted alongside JS

### Important: `dist-cjs/` is committed

The compiled output lives in the repo. After any source change you must run `npm run build` before committing. Never edit files under `dist-cjs/` directly.

---

## SDK API

### `CheckpointManager` (`src/sdk/checkpoint-manager.ts`)

Persists agent state as JSON files.

```typescript
import { CheckpointManager } from 'claude-flow/checkpoint-manager';

const mgr = new CheckpointManager({ dir: '.claude-flow/checkpoints', max: 50 });
const cp  = mgr.create({ myKey: 'value' }, { tag: 'step-1' });
const state = mgr.restore(cp.id);
```

- IDs are 8-byte random hex strings (`crypto.randomBytes(8).toString('hex')`)
- Default storage: `.claude-flow/checkpoints/` (ignored by git)
- Default cap: 50 checkpoints; oldest are pruned automatically
- Key methods: `create`, `get`, `list`, `restore`, `delete`, `clear`, `latest`

### `ClaudeFlowMcpIntegration` (`src/sdk/claude-flow-mcp-integration.ts`)

Builder-pattern wrapper that adds a tool registry, before/after middleware hooks, metrics tracking, and checkpoint integration.

```typescript
import { createMcpIntegration } from 'claude-flow';

const flow = createMcpIntegration({ checkpoints: true, metrics: true, hooks: true });

flow
  .registerTool('myTool', async (params) => { /* ... */ }, { /* JSON schema */ })
  .before('myTool', async (params) => { /* pre-hook */ })
  .after('myTool', async (params, result) => { /* post-hook */ });

await flow.call('myTool', { arg: 'value' });
flow.getMetrics(); // { toolCalls, successfulCalls, failedCalls, totalDurationMs, averageDurationMs }
flow.toMcpServer(); // { tools, call } — MCP-compatible server shape
```

### `InProcessMcp` (`src/sdk/in-process-mcp.ts`)

An `EventEmitter` that implements the MCP wire protocol in-process (no network required).

```typescript
import { createInProcessMcp } from 'claude-flow/in-process-mcp';

const mcp = createInProcessMcp({ name: 'my-server' });

mcp.tool('echo', { description: 'Echo input' }, async (args) => args.text);
mcp.resource('data://config', async (uri) => '{ }');
mcp.prompt('greet', async (args) => [{ role: 'user', content: `Hello ${args.name}` }]);

const result = await mcp.request('tools/call', { name: 'echo', arguments: { text: 'hi' } });
```

Supported MCP methods: `tools/list`, `tools/call`, `resources/list`, `resources/read`, `prompts/list`, `prompts/get`.

Events emitted: `request`, `response`, `request:error`.

---

## CLI Usage

```bash
claude-flow --help
claude-flow checkpoint create [name] [-m <message>]
claude-flow checkpoint list
claude-flow checkpoint restore <id>
```

**Note:** Checkpoint IDs in the CLI use the format `cp_<timestamp>` (from `src/cli/commands/checkpoint.ts`), which differs from the SDK's random-hex format. These are two independent storage systems pointing at the same directory.

**Known gap:** `src/cli/simple-commands/hooks.ts` implements full hook management (`list`, `add`, `remove`, `run`) but `hooksCommand` is **not registered** in `simple-cli.ts`. The hooks subcommand is currently unreachable from the CLI.

---

## Claude Code Configuration (`.claude/`)

### Settings (`.claude/settings.json`)
- **Model**: `claude-opus-4-6`
- No custom permissions, environment variables, or hooks are currently configured

### Installed Plugin: `claude-ads` v1.5.1

Provides paid advertising audit and creative generation capabilities. Installed via `.claude-plugin/marketplace.json`.

**Skills** (invoke with `/ads-<name>` or `/<name>`):
`ads`, `ads-audit`, `ads-google`, `ads-meta`, `ads-youtube`, `ads-linkedin`, `ads-tiktok`, `ads-microsoft`, `ads-creative`, `ads-landing`, `ads-budget`, `ads-plan`, `ads-competitor`, `ads-math`, `ads-test`, `ads-dna`, `ads-generate`, `ads-photoshoot`, `ads-create`, `ads-apple`

**Agents** (spawned automatically by audit skills):
`audit-google`, `audit-meta`, `audit-creative`, `audit-tracking`, `audit-budget`, `audit-compliance`, `copy-writer`, `creative-strategist`, `format-adapter`, `visual-designer`

### Typical ads workflow
1. `/ads-dna <url>` — extract brand identity → writes `brand-profile.json`
2. `/ads-audit` — run full multi-platform audit → writes `*-audit-results.md` per platform
3. `/ads-create` — generate campaign brief → writes `campaign-brief.md`
4. `/ads-generate` — generate ad creatives → writes `generation-manifest.json` + `ad-assets/`

---

## Git Conventions

- Feature branches follow: `claude/<description>-<ID>` (e.g. `claude/claude-md-docs-CJH8A`)
- Commit messages are descriptive imperative sentences
- `dist-cjs/` changes are committed alongside source changes
- `.claude-flow/checkpoints/` is gitignored; `.claude-flow/metrics/` and `.claude-plugin/` are tracked

---

## Known Issues / TODOs

1. **`hooksCommand` not wired**: `src/cli/simple-commands/hooks.ts` is fully implemented but never registered in `simple-cli.ts`. Add `hooksCommand(program)` to `createCli()` to expose it.
2. **Dual checkpoint ID formats**: CLI uses `cp_<timestamp>`, SDK uses random hex. Checkpoints created by one are not restoreable by the other's `restore` command.
3. **No tests**: `npm test` reports "No tests found". The test script expects `src/**/*.test.ts`.
