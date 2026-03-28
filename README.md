# claude-flow

AI agent orchestration CLI and SDK for Claude. Provides checkpoint management, tool wrapping with hooks, and metrics tracking for MCP integrations.

## Install

```bash
npm install claude-flow
```

Or run directly:

```bash
npx claude-flow --help
```

## CLI

### Checkpoints

Save and restore snapshots of your agent's state.

```bash
# Create a checkpoint
claude-flow checkpoint create my-save
claude-flow checkpoint create --message "before risky operation"

# List all checkpoints
claude-flow checkpoint list

# Restore a checkpoint
claude-flow checkpoint restore cp_1234567890abcdef
```

## SDK

### ClaudeFlowMcpIntegration

Wrap MCP tool handlers with hooks and metrics.

```typescript
import { createMcpIntegration } from 'claude-flow';

const mcp = createMcpIntegration();

// Register tools
mcp.registerTool('search', async ({ query }) => {
  return await mySearchFunction(query as string);
}, {
  type: 'object',
  properties: { query: { type: 'string' } }
});

// Add before/after hooks
mcp.before('search', async (params) => {
  console.log('Searching for:', params.query);
});

mcp.after('search', async (params, result) => {
  console.log('Search complete');
});

// Call a tool
const result = await mcp.call('search', { query: 'hello world' });

// Get metrics
const metrics = mcp.getMetrics();
console.log(`${metrics.toolCalls} calls, ${metrics.averageDurationMs}ms avg`);

// Export for MCP server
const server = mcp.toMcpServer();
```

### CheckpointManager

File-based checkpoint storage.

```typescript
import { CheckpointManager } from 'claude-flow/checkpoint-manager';

const manager = new CheckpointManager({
  dir: '.my-checkpoints',  // default: .claude-flow/checkpoints
  max: 50                  // max checkpoints to keep (default: 50)
});

// Save state
const cp = manager.create({ step: 3, data: [...] }, { label: 'after-step-3' });
console.log(cp.id); // e.g. "a1b2c3d4e5f6g7h8"

// List checkpoints (newest first)
const all = manager.list();

// Restore state
const state = manager.restore(cp.id);

// Get latest
const latest = manager.latest();
```

## Development

```bash
npm install          # install dependencies
npm run build        # compile TypeScript → dist-cjs/
npm test             # build + run tests
npx tsc --noEmit     # type check only
```

### Available slash commands (Claude Code)

| Command | Description |
|---------|-------------|
| `/build` | Compile the project |
| `/typecheck` | Run type checking |
| `/test` | Run the test suite |
| `/audit` | Check for outdated deps and vulnerabilities |
| `/stats` | Show codebase statistics |
| `/checkpoint` | Save a checkpoint |
| `/reset` | Restore a checkpoint |
| `/explain` | Explain a file in plain English |
| `/docs` | Generate documentation for a file |

## License

MIT
