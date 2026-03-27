# claude-flow

AI agent orchestration CLI and SDK built with TypeScript.

## Stack

- **Language**: TypeScript (strict mode, ES2020, CommonJS output)
- **Runtime**: Node.js 18+
- **Build output**: `dist-cjs/`
- **Key dependency**: `commander` (CLI framework)

## Project Structure

```
src/
  cli/
    simple-cli.ts          # CLI entry point — createCli() / run()
    commands/
      checkpoint.ts        # checkpoint create|list|restore commands
    help-formatter.ts      # Formats help text blocks
  sdk/
    claude-flow-mcp-integration.ts  # Main SDK — ClaudeFlowMcpIntegration class
    checkpoint-manager.ts           # CheckpointManager — file-based checkpoint storage
bin/
  claude-flow.js           # Executable entry point
dist-cjs/                  # Compiled output (do not edit)
.claude-flow/checkpoints/  # Runtime checkpoint storage (JSON files)
```

## Common Commands

```bash
# Build
npm run build          # tsc compile to dist-cjs/

# Type check (no emit)
npx tsc --noEmit

# Run CLI directly
node dist-cjs/src/cli/simple-cli.js --help
npx . checkpoint create my-save
npx . checkpoint list
npx . checkpoint restore cp_<id>

# Install dependencies
npm install
```

## Key Concepts

### CheckpointManager (`src/sdk/checkpoint-manager.ts`)
- Stores checkpoint JSON files in `.claude-flow/checkpoints/` by default
- Auto-prunes to max 50 checkpoints (configurable)
- IDs are random 8-byte hex strings

### ClaudeFlowMcpIntegration (`src/sdk/claude-flow-mcp-integration.ts`)
- Wraps tool handlers with before/after hooks
- Tracks metrics (call counts, durations)
- Exposes `toMcpServer()` for MCP integration

### CLI (`src/cli/`)
- Built with `commander`
- Currently exposes: `checkpoint` subcommand
- Unknown commands exit with code 1

## Conventions

- All source in `src/`, compiled to `dist-cjs/` (mirrors directory structure)
- Strict TypeScript — no `any`, explicit return types preferred
- No test framework yet; `npm test` uses `node --test`
- Exports via `package.json#exports` map — update when adding new public entry points
