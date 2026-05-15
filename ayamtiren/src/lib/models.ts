import { LLMModel, LLMProvider } from "@/types";

export const MODELS: LLMModel[] = [
  // OpenAI
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    costPerInputToken: 0.005,
    costPerOutputToken: 0.015,
    maxTokens: 128000,
    tier: "premium",
    capabilities: ["chat", "vision", "code", "analysis"],
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    costPerInputToken: 0.00015,
    costPerOutputToken: 0.0006,
    maxTokens: 128000,
    tier: "cheap",
    capabilities: ["chat", "code"],
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "openai",
    costPerInputToken: 0.0005,
    costPerOutputToken: 0.0015,
    maxTokens: 16385,
    tier: "cheap",
    capabilities: ["chat"],
  },
  // Anthropic
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    costPerInputToken: 0.003,
    costPerOutputToken: 0.015,
    maxTokens: 200000,
    tier: "premium",
    capabilities: ["chat", "code", "analysis", "vision"],
  },
  {
    id: "claude-3-haiku-20240307",
    name: "Claude 3 Haiku",
    provider: "anthropic",
    costPerInputToken: 0.00025,
    costPerOutputToken: 0.00125,
    maxTokens: 200000,
    tier: "cheap",
    capabilities: ["chat", "code"],
  },
  // Google
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    costPerInputToken: 0.00125,
    costPerOutputToken: 0.005,
    maxTokens: 1000000,
    tier: "mid",
    capabilities: ["chat", "vision", "code", "analysis"],
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "google",
    costPerInputToken: 0.000075,
    costPerOutputToken: 0.0003,
    maxTokens: 1000000,
    tier: "cheap",
    capabilities: ["chat", "code"],
  },
];

export const PROVIDERS: Record<string, LLMProvider> = {
  openai: {
    name: "OpenAI",
    models: MODELS.filter((m) => m.provider === "openai"),
    baseUrl: "https://api.openai.com/v1",
    envKey: "OPENAI_API_KEY",
  },
  anthropic: {
    name: "Anthropic",
    models: MODELS.filter((m) => m.provider === "anthropic"),
    baseUrl: "https://api.anthropic.com/v1",
    envKey: "ANTHROPIC_API_KEY",
  },
  google: {
    name: "Google",
    models: MODELS.filter((m) => m.provider === "google"),
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    envKey: "GOOGLE_API_KEY",
  },
};

export function getModelById(id: string): LLMModel | undefined {
  return MODELS.find((m) => m.id === id);
}

export function getCheapestModel(): LLMModel {
  return MODELS.filter((m) => m.tier === "cheap").sort(
    (a, b) => a.costPerInputToken - b.costPerInputToken
  )[0];
}

export function selectModel(
  requested?: string,
  prefer: "cost" | "speed" | "quality" = "cost"
): LLMModel {
  if (requested) {
    const found = getModelById(requested);
    if (found) return found;
  }
  if (prefer === "quality") {
    return MODELS.filter((m) => m.tier === "premium")[0];
  }
  if (prefer === "speed") {
    return MODELS.filter((m) => m.tier === "cheap").sort(
      (a, b) => a.costPerInputToken - b.costPerInputToken
    )[0];
  }
  // default: cost-aware
  return getCheapestModel();
}

export function calculateCost(
  model: LLMModel,
  promptTokens: number,
  completionTokens: number
): number {
  return (
    (promptTokens / 1000) * model.costPerInputToken +
    (completionTokens / 1000) * model.costPerOutputToken
  );
}

// Fallback chain per provider
export const FALLBACK_CHAIN: string[] = [
  "gpt-4o-mini",
  "gemini-1.5-flash",
  "claude-3-haiku-20240307",
  "gpt-3.5-turbo",
];
