import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";

const CHECKPOINT_DIR = ".claude-flow/checkpoints";

interface CheckpointEntry {
  id: string;
  name: string | null;
  message: string | null;
  createdAt: string;
  state: Record<string, unknown>;
}

export function checkpointCommand(program: Command): Command {
  const cmd = program.command("checkpoint").description("Manage Claude Flow checkpoints");

  cmd
    .command("create [name]")
    .description("Create a new checkpoint")
    .option("-m, --message <message>", "Checkpoint message")
    .action((name: string, options: { message?: string }) => {
      const result = createCheckpoint(name, options.message);
      console.log(`Checkpoint created: ${result.id}`);
    });

  cmd
    .command("list")
    .description("List all checkpoints")
    .action(() => {
      const checkpoints = listCheckpoints();
      if (checkpoints.length === 0) {
        console.log("No checkpoints found.");
        return;
      }
      checkpoints.forEach((cp) => {
        console.log(`${cp.id}  ${cp.createdAt}  ${cp.name ?? cp.message ?? ""}`);
      });
    });

  cmd
    .command("restore <id>")
    .description("Restore a checkpoint by ID")
    .action((id: string) => {
      try {
        restoreCheckpoint(id);
        console.log(`Restored checkpoint: ${id}`);
      } catch (err) {
        console.error(`Error: ${(err as Error).message}`);
        process.exit(1);
      }
    });

  return cmd;
}

export function createCheckpoint(name?: string, message?: string): CheckpointEntry {
  const dir = CHECKPOINT_DIR;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const id = `cp_${Date.now()}`;
  const checkpoint: CheckpointEntry = {
    id,
    name: name ?? null,
    message: message ?? null,
    createdAt: new Date().toISOString(),
    state: {},
  };

  fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(checkpoint, null, 2));
  return checkpoint;
}

export function listCheckpoints(): CheckpointEntry[] {
  const dir = CHECKPOINT_DIR;
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as CheckpointEntry)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function restoreCheckpoint(id: string): CheckpointEntry {
  const file = path.join(CHECKPOINT_DIR, `${id}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`Checkpoint not found: ${id}`);
  }
  return JSON.parse(fs.readFileSync(file, "utf8")) as CheckpointEntry;
}
