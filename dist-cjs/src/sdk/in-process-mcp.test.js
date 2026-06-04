"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const in_process_mcp_1 = require("./in-process-mcp");
(0, node_test_1.test)("tools/list returns registered tools", async () => {
    const mcp = new in_process_mcp_1.InProcessMcp({ name: "test" });
    mcp.tool("hello", { description: "say hello" }, async () => "hi");
    const result = (await mcp.request("tools/list"));
    strict_1.default.strictEqual(result.tools.length, 1);
    strict_1.default.strictEqual(result.tools[0].name, "hello");
    strict_1.default.strictEqual(result.tools[0].description, "say hello");
});
(0, node_test_1.test)("tools/call invokes handler; output wrapped in content array", async () => {
    const mcp = new in_process_mcp_1.InProcessMcp();
    mcp.tool("echo", async (args) => args.msg);
    const result = (await mcp.request("tools/call", { name: "echo", arguments: { msg: "hey" } }));
    strict_1.default.strictEqual(result.content[0].type, "text");
    strict_1.default.strictEqual(result.content[0].text, "hey");
});
(0, node_test_1.test)("tools/call serialises non-string output as JSON", async () => {
    const mcp = new in_process_mcp_1.InProcessMcp();
    mcp.tool("obj", async () => ({ x: 1 }));
    const result = (await mcp.request("tools/call", { name: "obj", arguments: {} }));
    strict_1.default.deepEqual(JSON.parse(result.content[0].text), { x: 1 });
});
(0, node_test_1.test)("tools/call throws for unknown tool", async () => {
    const mcp = new in_process_mcp_1.InProcessMcp();
    await strict_1.default.rejects(() => mcp.request("tools/call", { name: "nope", arguments: {} }), /Tool not found/);
});
(0, node_test_1.test)("resources/list and resources/read", async () => {
    const mcp = new in_process_mcp_1.InProcessMcp();
    mcp.resource("data://test", async () => "file-content");
    const list = (await mcp.request("resources/list"));
    strict_1.default.strictEqual(list.resources.length, 1);
    strict_1.default.strictEqual(list.resources[0].uri, "data://test");
    const read = (await mcp.request("resources/read", { uri: "data://test" }));
    strict_1.default.strictEqual(read.contents[0].text, "file-content");
});
(0, node_test_1.test)("resources/read throws for missing resource", async () => {
    const mcp = new in_process_mcp_1.InProcessMcp();
    await strict_1.default.rejects(() => mcp.request("resources/read", { uri: "nope" }), /Resource not found/);
});
(0, node_test_1.test)("prompts/list and prompts/get", async () => {
    const mcp = new in_process_mcp_1.InProcessMcp();
    mcp.prompt("sys", async (args) => [{ role: "system", content: args.text }]);
    const list = (await mcp.request("prompts/list"));
    strict_1.default.strictEqual(list.prompts[0].name, "sys");
    const got = (await mcp.request("prompts/get", { name: "sys", arguments: { text: "hello" } }));
    strict_1.default.strictEqual(got.messages.length, 1);
});
(0, node_test_1.test)("prompts/get throws for missing prompt", async () => {
    const mcp = new in_process_mcp_1.InProcessMcp();
    await strict_1.default.rejects(() => mcp.request("prompts/get", { name: "nope", arguments: {} }), /Prompt not found/);
});
(0, node_test_1.test)("unknown method throws", async () => {
    const mcp = new in_process_mcp_1.InProcessMcp();
    await strict_1.default.rejects(() => mcp.request("unknown/method"), /Unknown method/);
});
(0, node_test_1.test)("emits request and response events on success", async () => {
    const mcp = new in_process_mcp_1.InProcessMcp();
    mcp.tool("noop", async () => null);
    const events = [];
    mcp.on("request", () => events.push("request"));
    mcp.on("response", () => events.push("response"));
    await mcp.request("tools/call", { name: "noop", arguments: {} });
    strict_1.default.deepEqual(events, ["request", "response"]);
});
(0, node_test_1.test)("emits request:error event on tool failure", async () => {
    const mcp = new in_process_mcp_1.InProcessMcp();
    mcp.tool("fail", async () => { throw new Error("oops"); });
    const errors = [];
    mcp.on("request:error", (e) => errors.push(e));
    await strict_1.default.rejects(() => mcp.request("tools/call", { name: "fail", arguments: {} }));
    strict_1.default.strictEqual(errors.length, 1);
});
(0, node_test_1.test)("request id increments across calls", async () => {
    const mcp = new in_process_mcp_1.InProcessMcp();
    mcp.tool("t", async () => null);
    const ids = [];
    mcp.on("request", (e) => ids.push(e.id));
    await mcp.request("tools/call", { name: "t", arguments: {} });
    await mcp.request("tools/call", { name: "t", arguments: {} });
    strict_1.default.strictEqual(ids[1], ids[0] + 1);
});
(0, node_test_1.test)("tool registered without schema gets empty schema", async () => {
    const mcp = new in_process_mcp_1.InProcessMcp();
    mcp.tool("bare", async () => "ok");
    const result = (await mcp.request("tools/list"));
    strict_1.default.deepEqual(result.tools[0].inputSchema, { type: "object", properties: {} });
});
//# sourceMappingURL=in-process-mcp.test.js.map