import { Command } from "commander";
interface CheckpointEntry {
    id: string;
    name: string | null;
    message: string | null;
    createdAt: string;
    state: Record<string, unknown>;
}
export declare function checkpointCommand(program: Command): Command;
export declare function createCheckpoint(name?: string, message?: string): CheckpointEntry;
export declare function listCheckpoints(): CheckpointEntry[];
export declare function restoreCheckpoint(id: string): CheckpointEntry;
export {};
//# sourceMappingURL=checkpoint.d.ts.map