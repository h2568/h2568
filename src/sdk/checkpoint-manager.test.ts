import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { CheckpointManager } from './checkpoint-manager';

describe('CheckpointManager', () => {
  let dir: string;
  let manager: CheckpointManager;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cp-test-'));
    manager = new CheckpointManager({ dir });
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('creates a checkpoint and returns it', () => {
    const cp = manager.create({ key: 'value' });
    assert.ok(cp.id);
    assert.deepEqual(cp.state, { key: 'value' });
    assert.ok(cp.createdAt);
    assert.equal(cp.seq, 1);
  });

  it('persists checkpoint to disk', () => {
    const cp = manager.create({ foo: 'bar' });
    const file = path.join(dir, `${cp.id}.json`);
    assert.ok(fs.existsSync(file));
  });

  it('stores metadata', () => {
    const cp = manager.create({}, { tag: 'test' });
    assert.deepEqual(cp.metadata, { tag: 'test' });
  });

  it('lists checkpoints in reverse chronological order', () => {
    manager.create({ n: 1 });
    manager.create({ n: 2 });
    manager.create({ n: 3 });
    const list = manager.list();
    assert.equal(list.length, 3);
    assert.deepEqual(list[0].state, { n: 3 });
    assert.deepEqual(list[2].state, { n: 1 });
  });

  it('returns empty list when no checkpoints', () => {
    assert.deepEqual(manager.list(), []);
  });

  it('gets a checkpoint by id', () => {
    const cp = manager.create({ x: 1 });
    const fetched = manager.get(cp.id);
    assert.deepEqual(fetched?.state, { x: 1 });
  });

  it('returns null for unknown id', () => {
    assert.equal(manager.get('nonexistent'), null);
  });

  it('restores state from a checkpoint', () => {
    const cp = manager.create({ foo: 'bar' });
    const state = manager.restore(cp.id);
    assert.deepEqual(state, { foo: 'bar' });
  });

  it('throws when restoring unknown id', () => {
    assert.throws(() => manager.restore('nonexistent'), /not found/i);
  });

  it('deletes a checkpoint', () => {
    const cp = manager.create({});
    assert.equal(manager.delete(cp.id), true);
    assert.equal(manager.get(cp.id), null);
  });

  it('returns false when deleting unknown id', () => {
    assert.equal(manager.delete('nonexistent'), false);
  });

  it('returns the latest checkpoint', () => {
    manager.create({ n: 1 });
    manager.create({ n: 2 });
    assert.deepEqual(manager.latest()?.state, { n: 2 });
  });

  it('returns null for latest when empty', () => {
    assert.equal(manager.latest(), null);
  });

  it('prunes old checkpoints beyond max', () => {
    const mgr = new CheckpointManager({ dir, max: 3 });
    for (let i = 0; i < 5; i++) mgr.create({ i });
    assert.equal(mgr.list().length, 3);
  });

  it('clears all checkpoints and returns count', () => {
    manager.create({});
    manager.create({});
    const count = manager.clear();
    assert.equal(count, 2);
    assert.equal(manager.list().length, 0);
  });

  it('increments seq on each checkpoint', () => {
    const a = manager.create({});
    const b = manager.create({});
    assert.equal(b.seq, a.seq + 1);
  });
});
