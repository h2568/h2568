export interface TokenCost {
  inputCostPer1M: number;
  outputCostPer1M: number;
}

const MODEL_COSTS: Record<string, TokenCost> = {
  "claude-opus-4-6":           { inputCostPer1M: 15.0,  outputCostPer1M: 75.0  },
  "claude-sonnet-4-6":         { inputCostPer1M: 3.0,   outputCostPer1M: 15.0  },
  "claude-haiku-4-5-20251001": { inputCostPer1M: 0.25,  outputCostPer1M: 1.25  },
};

export interface UsageEntry {
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  timestamp: string;
}

export class CostTracker {
  private entries: UsageEntry[] = [];

  record(model: string, inputTokens: number, outputTokens: number): UsageEntry {
    const costs = MODEL_COSTS[model] ?? { inputCostPer1M: 0, outputCostPer1M: 0 };
    const costUsd =
      (inputTokens / 1_000_000) * costs.inputCostPer1M +
      (outputTokens / 1_000_000) * costs.outputCostPer1M;
    const entry: UsageEntry = {
      model,
      inputTokens,
      outputTokens,
      costUsd,
      timestamp: new Date().toISOString(),
    };
    this.entries.push(entry);
    return entry;
  }

  totalCost(): number {
    return this.entries.reduce((sum, e) => sum + e.costUsd, 0);
  }

  totalTokens(): { input: number; output: number } {
    return {
      input:  this.entries.reduce((sum, e) => sum + e.inputTokens, 0),
      output: this.entries.reduce((sum, e) => sum + e.outputTokens, 0),
    };
  }

  summary(): string {
    const tokens = this.totalTokens();
    const cost = this.totalCost();
    return `Tokens — in: ${tokens.input}, out: ${tokens.output} | Cost: $${cost.toFixed(6)}`;
  }

  reset(): void {
    this.entries = [];
  }

  getEntries(): UsageEntry[] {
    return [...this.entries];
  }
}

export function modelCost(model: string): TokenCost | undefined {
  return MODEL_COSTS[model];
}
