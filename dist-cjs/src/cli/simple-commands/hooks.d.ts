import { Command } from "commander";
interface HookEntry {
    command: string;
    matcher?: string;
}
interface HookRecord {
    event: string;
    command: string;
    matcher: string | null;
}
export declare function hooksCommand(program: Command): Command;
export declare function listHooks(eventFilter?: string): HookRecord[];
export declare function addHook(event: string, command: string, matcher?: string): HookEntry;
export declare function removeHook(event: string, index: number): void;
export declare function runHook(event: string, data: unknown): {
    hook: HookRecord;
    success: boolean;
    output?: string;
    error?: string;
}[];
export {};
//# sourceMappingURL=hooks.d.ts.map