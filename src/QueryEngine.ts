import Anthropic from "@anthropic-ai/sdk";

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
  private client: Anthropic;
  private options: Required<Omit<QueryOptions, "systemPrompt">> & { systemPrompt?: string };

  constructor(options?: QueryOptions) {
    this.client = new Anthropic();
    this.options = {
      model: options?.model ?? "claude-opus-4-6",
      maxTokens: options?.maxTokens ?? 8192,
      temperature: options?.temperature ?? 1,
      systemPrompt: options?.systemPrompt,
    };
  }

  async query(messages: QueryMessage[]): Promise<QueryResult> {
    const response = await this.client.messages.create({
      model: this.options.model,
      max_tokens: this.options.maxTokens,
      temperature: this.options.temperature,
      ...(this.options.systemPrompt ? { system: this.options.systemPrompt } : {}),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    return {
      content: text,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      stopReason: response.stop_reason ?? "end_turn",
      model: response.model,
    };
  }

  async *stream(messages: QueryMessage[]): AsyncGenerator<string> {
    const stream = this.client.messages.stream({
      model: this.options.model,
      max_tokens: this.options.maxTokens,
      temperature: this.options.temperature,
      ...(this.options.systemPrompt ? { system: this.options.systemPrompt } : {}),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
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
