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
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const checkpoint_manager_1 = require("./checkpoint-manager");
function tmp() {
    return fs.mkdtempSync(path.join(os.tmpdir(), "cf-cm-"));
}
(0, node_test_1.test)("create returns checkpoint with correct shape", () => {
    const dir = tmp();
    const mgr = new checkpoint_manager_1.CheckpointManager({ dir });
    const cp = mgr.create({ key: "val" }, { tag: "smoke" });
    strict_1.default.ok(typeof cp.id === "string");
    strict_1.default.deepEqual(cp.state, { key: "val" });
    strict_1.default.deepEqual(cp.metadata, { tag: "smoke" });
    strict_1.default.strictEqual(cp.seq, 1);
    strict_1.default.ok(typeof cp.createdAt === "string");
    strict_1.default.ok(typeof cp.createdAtMs === "number");
    fs.rmSync(dir, { recursive: true });
});
(0, node_test_1.test)("seq increments across creates", () => {
    const dir = tmp();
    const mgr = new checkpoint_manager_1.CheckpointManager({ dir });
    const a = mgr.create({});
    const b = mgr.create({});
    strict_1.default.strictEqual(b.seq, a.seq + 1);
    fs.rmSync(dir, { recursive: true });
});
(0, node_test_1.test)("get returns checkpoint by id; null for missing", () => {
    const dir = tmp();
    const mgr = new checkpoint_manager_1.CheckpointManager({ dir });
    const cp = mgr.create({ x: 1 });
    const fetched = mgr.get(cp.id);
    strict_1.default.ok(fetched !== null);
    strict_1.default.deepEqual(fetched.state, { x: 1 });
    strict_1.default.strictEqual(mgr.get("nonexistent"), null);
    fs.rmSync(dir, { recursive: true });
});
(0, node_test_1.test)("list returns checkpoints sorted newest first", async () => {
    const dir = tmp();
    const mgr = new checkpoint_manager_1.CheckpointManager({ dir });
    const a = mgr.create({ n: 1 });
    await new Promise((r) => setTimeout(r, 10));
    const b = mgr.create({ n: 2 });
    const list = mgr.list();
    strict_1.default.strictEqual(list.length, 2);
    strict_1.default.strictEqual(list[0].id, b.id);
    strict_1.default.strictEqual(list[1].id, a.id);
    fs.rmSync(dir, { recursive: true });
});
(0, node_test_1.test)("restore returns state; throws for missing id", () => {
    const dir = tmp();
    const mgr = new checkpoint_manager_1.CheckpointManager({ dir });
    const cp = mgr.create({ foo: "bar" });
    strict_1.default.deepEqual(mgr.restore(cp.id), { foo: "bar" });
    strict_1.default.throws(() => mgr.restore("nope"), /Checkpoint not found/);
    fs.rmSync(dir, { recursive: true });
});
(0, node_test_1.test)("delete removes checkpoint; returns false for ghost", () => {
    const dir = tmp();
    const mgr = new checkpoint_manager_1.CheckpointManager({ dir });
    const cp = mgr.create({});
    strict_1.default.ok(mgr.delete(cp.id));
    strict_1.default.strictEqual(mgr.get(cp.id), null);
    strict_1.default.strictEqual(mgr.delete("ghost"), false);
    fs.rmSync(dir, { recursive: true });
});
(0, node_test_1.test)("clear removes all checkpoints and returns count", () => {
    const dir = tmp();
    const mgr = new checkpoint_manager_1.CheckpointManager({ dir });
    mgr.create({});
    mgr.create({});
    mgr.create({});
    strict_1.default.strictEqual(mgr.clear(), 3);
    strict_1.default.strictEqual(mgr.list().length, 0);
    fs.rmSync(dir, { recursive: true });
});
(0, node_test_1.test)("latest returns most recent; null when empty", async () => {
    const dir = tmp();
    const mgr = new checkpoint_manager_1.CheckpointManager({ dir });
    strict_1.default.strictEqual(mgr.latest(), null);
    mgr.create({ v: 1 });
    await new Promise((r) => setTimeout(r, 10));
    const last = mgr.create({ v: 2 });
    strict_1.default.strictEqual(mgr.latest()?.id, last.id);
    fs.rmSync(dir, { recursive: true });
});
(0, node_test_1.test)("prune keeps only max checkpoints", () => {
    const dir = tmp();
    const mgr = new checkpoint_manager_1.CheckpointManager({ dir, max: 3 });
    for (let i = 0; i < 5; i++)
        mgr.create({ i });
    strict_1.default.strictEqual(mgr.list().length, 3);
    fs.rmSync(dir, { recursive: true });
});
//# sourceMappingURL=checkpoint-manager.test.js.map