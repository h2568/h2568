"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const checkpoint_manager_1 = require("./checkpoint-manager");
(0, node_test_1.describe)('CheckpointManager', () => {
    let dir;
    let manager;
    (0, node_test_1.beforeEach)(() => {
        dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cp-test-'));
        manager = new checkpoint_manager_1.CheckpointManager({ dir });
    });
    (0, node_test_1.afterEach)(() => {
        fs.rmSync(dir, { recursive: true, force: true });
    });
    (0, node_test_1.it)('creates a checkpoint and returns it', () => {
        const cp = manager.create({ key: 'value' });
        strict_1.default.ok(cp.id);
        strict_1.default.deepEqual(cp.state, { key: 'value' });
        strict_1.default.ok(cp.createdAt);
        strict_1.default.equal(cp.seq, 1);
    });
    (0, node_test_1.it)('persists checkpoint to disk', () => {
        const cp = manager.create({ foo: 'bar' });
        const file = path.join(dir, `${cp.id}.json`);
        strict_1.default.ok(fs.existsSync(file));
    });
    (0, node_test_1.it)('stores metadata', () => {
        const cp = manager.create({}, { tag: 'test' });
        strict_1.default.deepEqual(cp.metadata, { tag: 'test' });
    });
    (0, node_test_1.it)('lists checkpoints in reverse chronological order', () => {
        manager.create({ n: 1 });
        manager.create({ n: 2 });
        manager.create({ n: 3 });
        const list = manager.list();
        strict_1.default.equal(list.length, 3);
        strict_1.default.deepEqual(list[0].state, { n: 3 });
        strict_1.default.deepEqual(list[2].state, { n: 1 });
    });
    (0, node_test_1.it)('returns empty list when no checkpoints', () => {
        strict_1.default.deepEqual(manager.list(), []);
    });
    (0, node_test_1.it)('gets a checkpoint by id', () => {
        const cp = manager.create({ x: 1 });
        const fetched = manager.get(cp.id);
        strict_1.default.deepEqual(fetched?.state, { x: 1 });
    });
    (0, node_test_1.it)('returns null for unknown id', () => {
        strict_1.default.equal(manager.get('nonexistent'), null);
    });
    (0, node_test_1.it)('restores state from a checkpoint', () => {
        const cp = manager.create({ foo: 'bar' });
        const state = manager.restore(cp.id);
        strict_1.default.deepEqual(state, { foo: 'bar' });
    });
    (0, node_test_1.it)('throws when restoring unknown id', () => {
        strict_1.default.throws(() => manager.restore('nonexistent'), /not found/i);
    });
    (0, node_test_1.it)('deletes a checkpoint', () => {
        const cp = manager.create({});
        strict_1.default.equal(manager.delete(cp.id), true);
        strict_1.default.equal(manager.get(cp.id), null);
    });
    (0, node_test_1.it)('returns false when deleting unknown id', () => {
        strict_1.default.equal(manager.delete('nonexistent'), false);
    });
    (0, node_test_1.it)('returns the latest checkpoint', () => {
        manager.create({ n: 1 });
        manager.create({ n: 2 });
        strict_1.default.deepEqual(manager.latest()?.state, { n: 2 });
    });
    (0, node_test_1.it)('returns null for latest when empty', () => {
        strict_1.default.equal(manager.latest(), null);
    });
    (0, node_test_1.it)('prunes old checkpoints beyond max', () => {
        const mgr = new checkpoint_manager_1.CheckpointManager({ dir, max: 3 });
        for (let i = 0; i < 5; i++)
            mgr.create({ i });
        strict_1.default.equal(mgr.list().length, 3);
    });
    (0, node_test_1.it)('clears all checkpoints and returns count', () => {
        manager.create({});
        manager.create({});
        const count = manager.clear();
        strict_1.default.equal(count, 2);
        strict_1.default.equal(manager.list().length, 0);
    });
    (0, node_test_1.it)('increments seq on each checkpoint', () => {
        const a = manager.create({});
        const b = manager.create({});
        strict_1.default.equal(b.seq, a.seq + 1);
    });
});
//# sourceMappingURL=checkpoint-manager.test.js.map