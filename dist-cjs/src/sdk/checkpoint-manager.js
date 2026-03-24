"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckpointManager = CheckpointManager;

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DEFAULT_DIR = ".claude-flow/checkpoints";
const DEFAULT_MAX = 50;

function CheckpointManager(options) {
  this.dir = (options && options.dir) || DEFAULT_DIR;
  this.max = (options && options.max) || DEFAULT_MAX;
  this._seq = 0;
  this._ensureDir();
}

CheckpointManager.prototype._ensureDir = function () {
  if (!fs.existsSync(this.dir)) {
    fs.mkdirSync(this.dir, { recursive: true });
  }
};

CheckpointManager.prototype._filePath = function (id) {
  return path.join(this.dir, `${id}.json`);
};

CheckpointManager.prototype.create = function (state, metadata) {
  const id = crypto.randomBytes(8).toString("hex");
  const checkpoint = {
    id,
    createdAt: new Date().toISOString(),
    createdAtMs: Date.now(),
    seq: ++this._seq,
    metadata: metadata || {},
    state: state || {},
  };

  fs.writeFileSync(this._filePath(id), JSON.stringify(checkpoint, null, 2));
  this._prune();
  return checkpoint;
};

CheckpointManager.prototype.get = function (id) {
  const file = this._filePath(id);
  if (!fs.existsSync(file)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
};

CheckpointManager.prototype.list = function () {
  return fs
    .readdirSync(this.dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(this.dir, f), "utf8"));
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => {
      const msDiff = (b.createdAtMs || 0) - (a.createdAtMs || 0);
      if (msDiff !== 0) return msDiff;
      return (b.seq || 0) - (a.seq || 0);
    });
};

CheckpointManager.prototype.restore = function (id) {
  const checkpoint = this.get(id);
  if (!checkpoint) {
    throw new Error(`Checkpoint not found: ${id}`);
  }
  return checkpoint.state;
};

CheckpointManager.prototype.delete = function (id) {
  const file = this._filePath(id);
  if (!fs.existsSync(file)) {
    return false;
  }
  fs.unlinkSync(file);
  return true;
};

CheckpointManager.prototype.clear = function () {
  const checkpoints = this.list();
  checkpoints.forEach((cp) => this.delete(cp.id));
  return checkpoints.length;
};

CheckpointManager.prototype.latest = function () {
  const all = this.list();
  return all.length > 0 ? all[0] : null;
};

CheckpointManager.prototype._prune = function () {
  const all = this.list();
  if (all.length > this.max) {
    all.slice(this.max).forEach((cp) => this.delete(cp.id));
  }
};
