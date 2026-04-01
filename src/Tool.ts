export interface ToolInput {
  [key: string]: unknown;
}

export interface ToolResultContent {
  type: "text" | "image" | "resource";
  text?: string;
  [key: string]: unknown;
}

export interface ToolResult {
  content: ToolResultContent[];
  isError?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  handler: (input: ToolInput) => Promise<ToolResult>;
}
