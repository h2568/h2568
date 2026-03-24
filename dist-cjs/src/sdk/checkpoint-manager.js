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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckpointManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const DEFAULT_DIR = ".claude-flow/checkpoints";
const DEFAULT_MAX = 50;
class CheckpointManager {
    constructor(options) {
        this.dir = options?.dir ?? DEFAULT_DIR;
        this.max = options?.max ?? DEFAULT_MAX;
        this._seq = 0;
        this._ensureDir();
    }
    _ensureDir() {
        if (!fs.existsSync(this.dir)) {
            fs.mkdirSync(this.dir, { recursive: true });
        }
    }
    _filePath(id) {
        return path.join(this.dir, `${id}.json`);
    }
    create(state, metadata) {
        const id = crypto.randomBytes(8).toString("hex");
        const checkpoint = {
            id,
            createdAt: new Date().toISOString(),
            createdAtMs: Date.now(),
            seq: ++this._seq,
            metadata: metadata ?? {},
            state: state ?? {},
        };
        fs.writeFileSync(this._filePath(id), JSON.stringify(checkpoint, null, 2));
        this._prune();
        return checkpoint;
    }
    get(id) {
        const file = this._filePath(id);
        if (!fs.existsSync(file))
            return null;
        return JSON.parse(fs.readFileSync(file, "utf8"));
    }
    list() {
        return fs
            .readdirSync(this.dir)
            .filter((f) => f.endsWith(".json"))
            .map((f) => {
            try {
                return JSON.parse(fs.readFileSync(path.join(this.dir, f), "utf8"));
            }
            catch {
                return null;
            }
        })
            .filter((c) => c !== null)
            .sort((a, b) => {
            const msDiff = (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0);
            if (msDiff !== 0)
                return msDiff;
            return (b.seq ?? 0) - (a.seq ?? 0);
        });
    }
    restore(id) {
        const checkpoint = this.get(id);
        if (!checkpoint)
            throw new Error(`Checkpoint not found: ${id}`);
        return checkpoint.state;
    }
    delete(id) {
        const file = this._filePath(id);
        if (!fs.existsSync(file))
            return false;
        fs.unlinkSync(file);
        return true;
    }
    clear() {
        const checkpoints = this.list();
        checkpoints.forEach((cp) => this.delete(cp.id));
        return checkpoints.length;
    }
    latest() {
        const all = this.list();
        return all.length > 0 ? all[0] : null;
    }
    _prune() {
        const all = this.list();
        if (all.length > this.max) {
            all.slice(this.max).forEach((cp) => this.delete(cp.id));
        }
    }
}
exports.CheckpointManager = CheckpointManager;
//# sourceMappingURL=checkpoint-manager.js.map