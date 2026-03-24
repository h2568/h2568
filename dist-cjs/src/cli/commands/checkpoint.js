"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkpointCommand = checkpointCommand;
exports.createCheckpoint = createCheckpoint;
exports.listCheckpoints = listCheckpoints;
exports.restoreCheckpoint = restoreCheckpoint;

const fs = require("fs");
const path = require("path");

const CHECKPOINT_DIR = ".claude-flow/checkpoints";

function checkpointCommand(program) {
  const cmd = program.command("checkpoint").description("Manage Claude Flow checkpoints");

  cmd
    .command("create [name]")
    .description("Create a new checkpoint")
    .option("-m, --message <message>", "Checkpoint message")
    .action((name, options) => {
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
        console.log(`${cp.id}  ${cp.createdAt}  ${cp.name || cp.message || ""}`);
      });
    });

  cmd
    .command("restore <id>")
    .description("Restore a checkpoint by ID")
    .action((id) => {
      try {
        restoreCheckpoint(id);
        console.log(`Restored checkpoint: ${id}`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  return cmd;
}

function createCheckpoint(name, message) {
  const dir = CHECKPOINT_DIR;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const id = `cp_${Date.now()}`;
  const checkpoint = {
    id,
    name: name || null,
    message: message || null,
    createdAt: new Date().toISOString(),
    state: {},
  };

  fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(checkpoint, null, 2));
  return checkpoint;
}

function listCheckpoints() {
  const dir = CHECKPOINT_DIR;
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function restoreCheckpoint(id) {
  const file = path.join(CHECKPOINT_DIR, `${id}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`Checkpoint not found: ${id}`);
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
