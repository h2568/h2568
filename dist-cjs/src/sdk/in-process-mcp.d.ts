import { EventEmitter } from "events";
export interface ToolSchema {
    description?: string;
    input?: Record<string, unknown>;
}
export interface Tool {
    name: string;
    schema: ToolSchema;
    handler: (args: Record<string, unknown>) => Promise<unknown>;
}
export interface McpOptions {
    name?: string;
}
export declare class InProcessMcp extends EventEmitter {
    private _tools;
    private _resources;
    private _prompts;
    private _requestId;
    options: McpOptions;
    constructor(options?: McpOptions);
    tool(name: string, handler: (args: Record<string, unknown>) => Promise<unknown>): this;
    tool(name: string, schema: ToolSchema, handler: (args: Record<string, unknown>) => Promise<unknown>): this;
    resource(uri: string, handler: (uri: string) => Promise<unknown>): this;
    prompt(name: string, handler: (args: Record<string, unknown>) => Promise<unknown>): this;
    request(method: string, params?: Record<string, unknown>): Promise<unknown>;
    private _dispatch;
    private _listTools;
    private _callTool;
    private _listResources;
    private _readResource;
    private _listPrompts;
    private _getPrompt;
}
export declare function createInProcessMcp(options?: McpOptions): InProcessMcp;
//# sourceMappingURL=in-process-mcp.d.ts.map