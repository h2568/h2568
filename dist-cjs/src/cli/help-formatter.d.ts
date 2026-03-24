export interface HelpFormatterOptions {
    indent?: string;
    colWidth?: number;
    maxWidth?: number;
}
export interface HelpInfo {
    description?: string;
    usage?: string;
    commands?: {
        name: string;
        description: string;
    }[];
    options?: {
        flags: string;
        description: string;
    }[];
    examples?: string[];
}
export declare class HelpFormatter {
    private options;
    constructor(options?: HelpFormatterOptions);
    format(helpInfo: HelpInfo): string;
    private _formatRow;
}
export declare function formatCommandHelp(name: string, description: string, subcommands?: {
    name: string;
    description: string;
}[], options?: {
    flags: string;
    description: string;
}[], examples?: string[]): string;
export declare function formatOptionHelp(flags: string, description: string, defaultValue?: unknown): string;
//# sourceMappingURL=help-formatter.d.ts.map