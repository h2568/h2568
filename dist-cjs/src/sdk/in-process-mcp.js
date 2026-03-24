"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InProcessMcp = void 0;
exports.createInProcessMcp = createInProcessMcp;
const events_1 = require("events");
class InProcessMcp extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.options = options ?? {};
        this._tools = new Map();
        this._resources = new Map();
        this._prompts = new Map();
        this._requestId = 0;
    }
    tool(name, schemaOrHandler, handler) {
        if (typeof schemaOrHandler === "function") {
            this._tools.set(name, { name, schema: {}, handler: schemaOrHandler });
        }
        else {
            this._tools.set(name, { name, schema: schemaOrHandler, handler: handler });
        }
        return this;
    }
    resource(uri, handler) {
        this._resources.set(uri, { uri, handler });
        return this;
    }
    prompt(name, handler) {
        this._prompts.set(name, { name, handler });
        return this;
    }
    async request(method, params) {
        const id = ++this._requestId;
        this.emit("request", { id, method, params });
        let result;
        try {
            result = await this._dispatch(method, params);
        }
        catch (err) {
            this.emit("request:error", { id, method, error: err });
            throw err;
        }
        this.emit("response", { id, method, result });
        return result;
    }
    async _dispatch(method, params) {
        switch (method) {
            case "tools/list":
                return this._listTools();
            case "tools/call": {
                const { name, arguments: args } = (params ?? {});
                return this._callTool(name, args);
            }
            case "resources/list":
                return this._listResources();
            case "resources/read": {
                const { uri } = (params ?? {});
                return this._readResource(uri);
            }
            case "prompts/list":
                return this._listPrompts();
            case "prompts/get": {
                const { name, arguments: args } = (params ?? {});
                return this._getPrompt(name, args);
            }
            default:
                throw new Error(`Unknown method: ${method}`);
        }
    }
    _listTools() {
        return {
            tools: Array.from(this._tools.values()).map((t) => ({
                name: t.name,
                description: t.schema.description ?? "",
                inputSchema: t.schema.input ?? { type: "object", properties: {} },
            })),
        };
    }
    async _callTool(name, args) {
        const tool = this._tools.get(name);
        if (!tool)
            throw new Error(`Tool not found: ${name}`);
        const output = await tool.handler(args ?? {});
        return {
            content: [{ type: "text", text: typeof output === "string" ? output : JSON.stringify(output, null, 2) }],
        };
    }
    _listResources() {
        return { resources: Array.from(this._resources.values()).map((r) => ({ uri: r.uri, name: r.uri })) };
    }
    async _readResource(uri) {
        const resource = this._resources.get(uri);
        if (!resource)
            throw new Error(`Resource not found: ${uri}`);
        const content = await resource.handler(uri);
        return {
            contents: [{ uri, mimeType: "text/plain", text: typeof content === "string" ? content : JSON.stringify(content, null, 2) }],
        };
    }
    _listPrompts() {
        return { prompts: Array.from(this._prompts.values()).map((p) => ({ name: p.name })) };
    }
    async _getPrompt(name, args) {
        const prompt = this._prompts.get(name);
        if (!prompt)
            throw new Error(`Prompt not found: ${name}`);
        const messages = await prompt.handler(args ?? {});
        return { messages: Array.isArray(messages) ? messages : [messages] };
    }
}
exports.InProcessMcp = InProcessMcp;
function createInProcessMcp(options) {
    return new InProcessMcp(options);
}
//# sourceMappingURL=in-process-mcp.js.map