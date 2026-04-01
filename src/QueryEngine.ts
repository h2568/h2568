export interface QueryOptions {
  model?: string;
  maxTokens?: number;
  systemPrompt?: string;
  temperature?: number;
}

export interface QueryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface QueryResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
  stopReason: string;
  model: string;
}

export class QueryEngine {
  private options: Required<Omit<QueryOptions, "systemPrompt">> & { systemPrompt?: string };

  constructor(options?: QueryOptions) {
    this.options = {
      model: options?.model ?? "claude-opus-4-6",
      maxTokens: options?.maxTokens ?? 8192,
      temperature: options?.temperature ?? 1,
      systemPrompt: options?.systemPrompt,
    };
  }

  // Wire up the Anthropic SDK to implement this method.
  async query(_messages: QueryMessage[]): Promise<QueryResult> {
    throw new Error("QueryEngine.query() not yet implemented — wire up Anthropic SDK");
  }

  getModel(): string {
    return this.options.model;
  }

  withModel(model: string): QueryEngine {
    return new QueryEngine({ ...this.options, model });
  }

  withSystem(systemPrompt: string): QueryEngine {
    return new QueryEngine({ ...this.options, systemPrompt });
  }
}
