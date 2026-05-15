export interface LLMProvider {
  name: string;
  models: LLMModel[];
  baseUrl: string;
  envKey: string;
}

export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  costPerInputToken: number;   // USD per 1K tokens
  costPerOutputToken: number;  // USD per 1K tokens
  maxTokens: number;
  tier: 'cheap' | 'mid' | 'premium';
  capabilities: string[];
}

export interface RouterRequest {
  model?: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
  prefer?: 'cost' | 'speed' | 'quality';
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface RouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  provider: string;
  choices: Choice[];
  usage: TokenUsage;
  cost: number;
  latency_ms: number;
}

export interface Choice {
  index: number;
  message: ChatMessage;
  finish_reason: string;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ApiKeyWithStats {
  id: string;
  name: string;
  prefix: string;
  isActive: boolean;
  rateLimit: number;
  monthlyLimit: number;
  createdAt: string;
  lastUsedAt?: string;
  totalRequests?: number;
  totalTokens?: number;
}

export interface DashboardStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  balance: number;
  requestsToday: number;
  tokensToday: number;
  costToday: number;
  topModels: { model: string; requests: number; tokens: number }[];
  dailyUsage: { date: string; requests: number; tokens: number; cost: number }[];
}
