import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

const DEFAULT_DIR = ".claude-flow/checkpoints";
const DEFAULT_MAX = 50;

export interface CheckpointOptions {
  dir?: string;
  max?: number;
}

export interface Checkpoint {
  id: string;
  createdAt: string;
  metadata: Record<string, unknown>;
  state: Record<string, unknown>;
}

export class CheckpointManager {
  private dir: string;
  private max: number;

  constructor(options?: CheckpointOptions) {
    this.dir = options?.dir ?? DEFAULT_DIR;
    this.max = options?.max ?? DEFAULT_MAX;
    this._ensureDir();
  }

  private _ensureDir(): void {
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
  }

  private _filePath(id: string): string {
    return path.join(this.dir, `${id}.json`);
  }

  create(state: Record<string, unknown>, metadata?: Record<string, unknown>): Checkpoint {
    const id = crypto.randomBytes(8).toString("hex");
    const checkpoint: Checkpoint = {
      id,
      createdAt: new Date().toISOString(),
      metadata: metadata ?? {},
      state: state ?? {},
    };
    fs.writeFileSync(this._filePath(id), JSON.stringify(checkpoint, null, 2));
    this._prune();
    return checkpoint;
  }

  get(id: string): Checkpoint | null {
    const file = this._filePath(id);
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, "utf8")) as Checkpoint;
  }

  list(): Checkpoint[] {
    return fs
      .readdirSync(this.dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        try {
          return JSON.parse(fs.readFileSync(path.join(this.dir, f), "utf8")) as Checkpoint;
        } catch {
          return null;
        }
      })
      .filter((c): c is Checkpoint => c !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  restore(id: string): Record<string, unknown> {
    const checkpoint = this.get(id);
    if (!checkpoint) throw new Error(`Checkpoint not found: ${id}`);
    return checkpoint.state;
  }

  delete(id: string): boolean {
    const file = this._filePath(id);
    if (!fs.existsSync(file)) return false;
    fs.unlinkSync(file);
    return true;
  }

  clear(): number {
    const checkpoints = this.list();
    checkpoints.forEach((cp) => this.delete(cp.id));
    return checkpoints.length;
  }

  latest(): Checkpoint | null {
    const all = this.list();
    return all.length > 0 ? all[0] : null;
  }

  private _prune(): void {
    const all = this.list();
    if (all.length > this.max) {
      all.slice(this.max).forEach((cp) => this.delete(cp.id));
    }
  }
}
