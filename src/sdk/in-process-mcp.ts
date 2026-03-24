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

export class InProcessMcp extends EventEmitter {
  private _tools: Map<string, Tool>;
  private _resources: Map<string, { uri: string; handler: (uri: string) => Promise<unknown> }>;
  private _prompts: Map<string, { name: string; handler: (args: Record<string, unknown>) => Promise<unknown> }>;
  private _requestId: number;
  options: McpOptions;

  constructor(options?: McpOptions) {
    super();
    this.options = options ?? {};
    this._tools = new Map();
    this._resources = new Map();
    this._prompts = new Map();
    this._requestId = 0;
  }

  tool(name: string, handler: (args: Record<string, unknown>) => Promise<unknown>): this;
  tool(name: string, schema: ToolSchema, handler: (args: Record<string, unknown>) => Promise<unknown>): this;
  tool(name: string, schemaOrHandler: ToolSchema | ((args: Record<string, unknown>) => Promise<unknown>), handler?: (args: Record<string, unknown>) => Promise<unknown>): this {
    if (typeof schemaOrHandler === "function") {
      this._tools.set(name, { name, schema: {}, handler: schemaOrHandler });
    } else {
      this._tools.set(name, { name, schema: schemaOrHandler, handler: handler! });
    }
    return this;
  }

  resource(uri: string, handler: (uri: string) => Promise<unknown>): this {
    this._resources.set(uri, { uri, handler });
    return this;
  }

  prompt(name: string, handler: (args: Record<string, unknown>) => Promise<unknown>): this {
    this._prompts.set(name, { name, handler });
    return this;
  }

  async request(method: string, params?: Record<string, unknown>): Promise<unknown> {
    const id = ++this._requestId;
    this.emit("request", { id, method, params });
    let result: unknown;
    try {
      result = await this._dispatch(method, params);
    } catch (err) {
      this.emit("request:error", { id, method, error: err });
      throw err;
    }
    this.emit("response", { id, method, result });
    return result;
  }

  private async _dispatch(method: string, params?: Record<string, unknown>): Promise<unknown> {
    switch (method) {
      case "tools/list":
        return this._listTools();
      case "tools/call": {
        const { name, arguments: args } = (params ?? {}) as { name: string; arguments: Record<string, unknown> };
        return this._callTool(name, args);
      }
      case "resources/list":
        return this._listResources();
      case "resources/read": {
        const { uri } = (params ?? {}) as { uri: string };
        return this._readResource(uri);
      }
      case "prompts/list":
        return this._listPrompts();
      case "prompts/get": {
        const { name, arguments: args } = (params ?? {}) as { name: string; arguments: Record<string, unknown> };
        return this._getPrompt(name, args);
      }
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  private _listTools() {
    return {
      tools: Array.from(this._tools.values()).map((t) => ({
        name: t.name,
        description: t.schema.description ?? "",
        inputSchema: t.schema.input ?? { type: "object", properties: {} },
      })),
    };
  }

  private async _callTool(name: string, args: Record<string, unknown>) {
    const tool = this._tools.get(name);
    if (!tool) throw new Error(`Tool not found: ${name}`);
    const output = await tool.handler(args ?? {});
    return {
      content: [{ type: "text", text: typeof output === "string" ? output : JSON.stringify(output, null, 2) }],
    };
  }

  private _listResources() {
    return { resources: Array.from(this._resources.values()).map((r) => ({ uri: r.uri, name: r.uri })) };
  }

  private async _readResource(uri: string) {
    const resource = this._resources.get(uri);
    if (!resource) throw new Error(`Resource not found: ${uri}`);
    const content = await resource.handler(uri);
    return {
      contents: [{ uri, mimeType: "text/plain", text: typeof content === "string" ? content : JSON.stringify(content, null, 2) }],
    };
  }

  private _listPrompts() {
    return { prompts: Array.from(this._prompts.values()).map((p) => ({ name: p.name })) };
  }

  private async _getPrompt(name: string, args: Record<string, unknown>) {
    const prompt = this._prompts.get(name);
    if (!prompt) throw new Error(`Prompt not found: ${name}`);
    const messages = await prompt.handler(args ?? {});
    return { messages: Array.isArray(messages) ? messages : [messages] };
  }
}

export function createInProcessMcp(options?: McpOptions): InProcessMcp {
  return new InProcessMcp(options);
}
