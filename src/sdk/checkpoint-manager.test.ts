import { test } from "node:test";
import assert from "node:assert/strict";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import { CheckpointManager } from "./checkpoint-manager";

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "cf-cm-"));
}

test("create returns checkpoint with correct shape", () => {
  const dir = tmp();
  const mgr = new CheckpointManager({ dir });
  const cp = mgr.create({ key: "val" }, { tag: "smoke" });

  assert.ok(typeof cp.id === "string");
  assert.deepEqual(cp.state, { key: "val" });
  assert.deepEqual(cp.metadata, { tag: "smoke" });
  assert.strictEqual(cp.seq, 1);
  assert.ok(typeof cp.createdAt === "string");
  assert.ok(typeof cp.createdAtMs === "number");

  fs.rmSync(dir, { recursive: true });
});

test("seq increments across creates", () => {
  const dir = tmp();
  const mgr = new CheckpointManager({ dir });

  const a = mgr.create({});
  const b = mgr.create({});
  assert.strictEqual(b.seq, a.seq + 1);

  fs.rmSync(dir, { recursive: true });
});

test("get returns checkpoint by id; null for missing", () => {
  const dir = tmp();
  const mgr = new CheckpointManager({ dir });
  const cp = mgr.create({ x: 1 });

  const fetched = mgr.get(cp.id);
  assert.ok(fetched !== null);
  assert.deepEqual(fetched!.state, { x: 1 });
  assert.strictEqual(mgr.get("nonexistent"), null);

  fs.rmSync(dir, { recursive: true });
});

test("list returns checkpoints sorted newest first", async () => {
  const dir = tmp();
  const mgr = new CheckpointManager({ dir });

  const a = mgr.create({ n: 1 });
  await new Promise((r) => setTimeout(r, 10));
  const b = mgr.create({ n: 2 });

  const list = mgr.list();
  assert.strictEqual(list.length, 2);
  assert.strictEqual(list[0].id, b.id);
  assert.strictEqual(list[1].id, a.id);

  fs.rmSync(dir, { recursive: true });
});

test("restore returns state; throws for missing id", () => {
  const dir = tmp();
  const mgr = new CheckpointManager({ dir });
  const cp = mgr.create({ foo: "bar" });

  assert.deepEqual(mgr.restore(cp.id), { foo: "bar" });
  assert.throws(() => mgr.restore("nope"), /Checkpoint not found/);

  fs.rmSync(dir, { recursive: true });
});

test("delete removes checkpoint; returns false for ghost", () => {
  const dir = tmp();
  const mgr = new CheckpointManager({ dir });
  const cp = mgr.create({});

  assert.ok(mgr.delete(cp.id));
  assert.strictEqual(mgr.get(cp.id), null);
  assert.strictEqual(mgr.delete("ghost"), false);

  fs.rmSync(dir, { recursive: true });
});

test("clear removes all checkpoints and returns count", () => {
  const dir = tmp();
  const mgr = new CheckpointManager({ dir });
  mgr.create({});
  mgr.create({});
  mgr.create({});

  assert.strictEqual(mgr.clear(), 3);
  assert.strictEqual(mgr.list().length, 0);

  fs.rmSync(dir, { recursive: true });
});

test("latest returns most recent; null when empty", async () => {
  const dir = tmp();
  const mgr = new CheckpointManager({ dir });

  assert.strictEqual(mgr.latest(), null);

  mgr.create({ v: 1 });
  await new Promise((r) => setTimeout(r, 10));
  const last = mgr.create({ v: 2 });

  assert.strictEqual(mgr.latest()?.id, last.id);

  fs.rmSync(dir, { recursive: true });
});

test("prune keeps only max checkpoints", () => {
  const dir = tmp();
  const mgr = new CheckpointManager({ dir, max: 3 });

  for (let i = 0; i < 5; i++) mgr.create({ i });

  assert.strictEqual(mgr.list().length, 3);

  fs.rmSync(dir, { recursive: true });
});
