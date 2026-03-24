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
exports.checkpointCommand = checkpointCommand;
exports.createCheckpoint = createCheckpoint;
exports.listCheckpoints = listCheckpoints;
exports.restoreCheckpoint = restoreCheckpoint;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
            console.log(`${cp.id}  ${cp.createdAt}  ${cp.name ?? cp.message ?? ""}`);
        });
    });
    cmd
        .command("restore <id>")
        .description("Restore a checkpoint by ID")
        .action((id) => {
        try {
            restoreCheckpoint(id);
            console.log(`Restored checkpoint: ${id}`);
        }
        catch (err) {
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
        name: name ?? null,
        message: message ?? null,
        createdAt: new Date().toISOString(),
        state: {},
    };
    fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(checkpoint, null, 2));
    return checkpoint;
}
function listCheckpoints() {
    const dir = CHECKPOINT_DIR;
    if (!fs.existsSync(dir))
        return [];
    return fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".json"))
        .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
function restoreCheckpoint(id) {
    const file = path.join(CHECKPOINT_DIR, `${id}.json`);
    if (!fs.existsSync(file)) {
        throw new Error(`Checkpoint not found: ${id}`);
    }
    return JSON.parse(fs.readFileSync(file, "utf8"));
}
//# sourceMappingURL=checkpoint.js.map