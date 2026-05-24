# claude-flow Audit Report

**Date:** 2026-05-24  
**Version audited:** 1.0.0  
**Environment:** Node.js v22.22.2 · TypeScript 5.9.3

---

## Summary

| Category | Status |
|---|---|
| Build | FAIL (1 deprecation error) |
| CLI runtime | PASS (after `npm install`) |
| SDK runtime | PASS |
| Missing dependency | BUG — `commander` not installed |
| Known gaps | 3 (see Known Issues) |

---

## Bugs Found

### BUG-1 — `commander` not installed (Critical)

**File:** `package.json`  
**Symptom:** Running `claude-flow` immediately crashes with `Error: Cannot find module 'commander'`.  
**Root cause:** `node_modules/` is not present in the repo and `package-lock.json` is committed but `npm install` is never mentioned in the README or setup steps. Any fresh clone fails without `npm install`.  
**Fix applied:** `npm install` resolves this. No code change needed, but the dependency should be documented.  
**Verified fixed:** CLI runs correctly after install.

---

### BUG-2 — `tsconfig.json` uses deprecated `moduleResolution: "node"` (Build error)

**File:** `tsconfig.json:5`  
**Symptom:** `npm run build` exits with code 2:
```
tsconfig.json(5,25): error TS5107: Option 'moduleResolution=node10' is deprecated
and will stop functioning in TypeScript 7.0.
```
TypeScript 5.9.3 now treats `"node"` as `"node10"` and emits a hard error. The build fails, meaning `dist-cjs/` cannot be regenerated.  
**Fix:** Change `"moduleResolution": "node"` → `"moduleResolution": "node10"` or add `"ignoreDeprecations": "6.0"`.

---

### BUG-3 — CLI `checkpoint restore` is a silent no-op (Logic bug)

**File:** `src/cli/commands/checkpoint.ts:46`  
**Symptom:** `claude-flow checkpoint restore <id>` prints `Restored checkpoint: <id>` but never uses the returned `CheckpointEntry`. The state is loaded from disk and immediately discarded.  
**Root cause:** `restoreCheckpoint(id)` returns `CheckpointEntry` but the action handler ignores the return value.  
**Impact:** Users cannot actually recover any state through the CLI — the restore command is cosmetic.  
**Fix needed:** The command should output the checkpoint state (e.g., print JSON to stdout) or apply it to a target file.

---

### BUG-4 — `hooksCommand` implemented but never registered in CLI (Feature gap / silent omission)

**File:** `src/cli/simple-cli.ts:30` · `src/cli/simple-commands/hooks.ts`  
**Symptom:** `claude-flow hooks list` returns `Unknown command: hooks list` and exits 1.  
**Root cause:** `hooksCommand(program)` is never called in `createCli()`. Only `checkpointCommand(program)` is registered.  
**Fix needed:** Add `import { hooksCommand } from "./simple-commands/hooks"` and call `hooksCommand(program)` inside `createCli()`.

---

### BUG-5 — Dynamic `require('child_process')` inside `runHook()` (Code smell / reliability)

**File:** `src/cli/simple-commands/hooks.ts:133`  
**Symptom:** No runtime crash, but `require("child_process")` is called inside the function body on every invocation instead of being a top-level import.  
**Impact:** Not a bug in Node.js (modules are cached), but it bypasses TypeScript's static import analysis and is non-idiomatic.  
**Fix needed:** Move to a top-level `import { execSync } from "child_process"`.

---

### BUG-6 — `CheckpointManager` sequence counter resets across instances (Ordering limitation)

**File:** `src/sdk/checkpoint-manager.ts:30`  
**Symptom:** When two separate `CheckpointManager` instances write to the same directory (e.g. CLI + SDK both pointing at `.claude-flow/checkpoints/`), the `seq` counter restarts at 0. The `list()` sort falls back to `seq` for same-millisecond ties, producing unpredictable ordering.  
**Impact:** Low in practice (same-ms collision is rare), but the CLI and SDK use the same directory and different ID formats, so co-mingled checkpoints cannot be sorted deterministically.  
**Fix needed:** Seed `_seq` from the highest existing `seq` found on disk at construction time.

---

### BUG-7 — Dual checkpoint ID formats break cross-system restore (Design bug)

**File:** `src/cli/commands/checkpoint.ts:63` vs `src/sdk/checkpoint-manager.ts:45`  
**Symptom:** CLI creates IDs like `cp_1779623968697`; SDK creates IDs like `75e1c5644b0fd341`. They write to the same directory but `restore` on each side only recognises its own format by convention (both actually accept any filename, so this is not a crash — but the formats are undocumented and confusing).  
**Impact:** A user who creates a checkpoint via the SDK cannot restore it via the CLI `checkpoint restore` subcommand if they expect `cp_` prefixes.  
**Fix needed:** Unify to one format (random hex preferred) in both systems.

---

## Runtime Verification Results

All tests below were run against `dist-cjs/` built before the `moduleResolution` change.

| Test | Result |
|---|---|
| `claude-flow --help` | PASS — exits 0 |
| `claude-flow checkpoint create test -m msg` | PASS — creates `cp_<timestamp>.json` |
| `claude-flow checkpoint list` | PASS — lists checkpoints |
| `claude-flow checkpoint restore cp_BADID` | PASS — prints error and exits 1 |
| `claude-flow fakecommand` | PASS — unknown command message, exits 1 |
| `ClaudeFlowMcpIntegration.call()` with before/after hooks | PASS |
| `ClaudeFlowMcpIntegration.getMetrics()` | PASS — all counters accurate |
| `ClaudeFlowMcpIntegration.checkpoint()` disabled returns null | PASS |
| `ClaudeFlowMcpIntegration.toMcpServer()` shape | PASS |
| `ClaudeFlowMcpIntegration.call()` unknown tool throws | PASS |
| `ClaudeFlowMcpIntegration.call()` failed tool increments failedCalls | PASS |
| `CheckpointManager` pruning at max=3 with 4 inserts | PASS — 3 remain |
| `CheckpointManager.latest()` | PASS |
| `CheckpointManager.delete()` non-existent returns false | PASS |
| `CheckpointManager.restore()` non-existent throws | PASS |
| `CheckpointManager.clear()` | PASS |
| `CheckpointManager` seq tie-break sort | PASS |
| `InProcessMcp tools/list` | PASS |
| `InProcessMcp tools/call` | PASS |
| `InProcessMcp resources/list + resources/read` | PASS |
| `InProcessMcp prompts/list + prompts/get` | PASS |
| `InProcessMcp` 2-arg tool registration (no schema) | PASS |
| `InProcessMcp` null arguments guard (`?? {}`) | PASS |
| `InProcessMcp` unknown method emits `request:error` and throws | PASS |
| `hooksCommand` invalid event throws | PASS |
| `hooksCommand` add/remove/list/OOB | PASS |
| `HelpFormatter` long name wraps | PASS |
| `formatOptionHelp` with default value | PASS |
| `formatCommandHelp` no-subcommands usage line | PASS |

---

## Recommended Fix Priority

| # | Bug | Severity | Effort |
|---|---|---|---|
| 1 | BUG-2: build fails (`moduleResolution`) | High | 1 line |
| 2 | BUG-4: `hooksCommand` not wired | High | 2 lines |
| 3 | BUG-3: `restore` is a no-op | Medium | 5 lines |
| 4 | BUG-5: dynamic `require` in `runHook` | Low | 2 lines |
| 5 | BUG-6: `seq` counter resets across instances | Low | 5 lines |
| 6 | BUG-7: dual checkpoint ID formats | Low | refactor |
| 7 | BUG-1: `npm install` not documented | Info | docs only |
