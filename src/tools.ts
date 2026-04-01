import { ToolDefinition } from "./Tool";

const registry = new Map<string, ToolDefinition>();

export function registerTool(tool: ToolDefinition): void {
  registry.set(tool.name, tool);
}

export function getTool(name: string): ToolDefinition | undefined {
  return registry.get(name);
}

export function listTools(): ToolDefinition[] {
  return Array.from(registry.values());
}

export function hasTool(name: string): boolean {
  return registry.has(name);
}

export function unregisterTool(name: string): boolean {
  return registry.delete(name);
}
