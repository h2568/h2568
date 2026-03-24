export interface CheckpointOptions {
    dir?: string;
    max?: number;
}
export interface Checkpoint {
    id: string;
    createdAt: string;
    createdAtMs: number;
    seq: number;
    metadata: Record<string, unknown>;
    state: Record<string, unknown>;
}
export declare class CheckpointManager {
    private dir;
    private max;
    private _seq;
    constructor(options?: CheckpointOptions);
    private _ensureDir;
    private _filePath;
    create(state: Record<string, unknown>, metadata?: Record<string, unknown>): Checkpoint;
    get(id: string): Checkpoint | null;
    list(): Checkpoint[];
    restore(id: string): Record<string, unknown>;
    delete(id: string): boolean;
    clear(): number;
    latest(): Checkpoint | null;
    private _prune;
}
//# sourceMappingURL=checkpoint-manager.d.ts.map