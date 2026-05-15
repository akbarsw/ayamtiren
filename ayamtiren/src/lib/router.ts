import { ChatMessage, RouterRequest, RouterResponse } from "@/types";
import {
  FALLBACK_CHAIN,
  calculateCost,
  getModelById,
  selectModel,
} from "./models";

async function callOpenAI(
  model: string,
  messages: ChatMessage[],
  max_tokens: number,
  temperature: number
): Promise<{ content: string; promptTokens: number; completionTokens: number }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key not configured");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, max_tokens, temperature }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    content: data.choices[0].message.content,
    promptTokens: data.usage.prompt_tokens,
    completionTokens: data.usage.completion_tokens,
  };
}

async function callAnthropic(
  model: string,
  messages: ChatMessage[],
  max_tokens: number,
  temperature: number
): Promise<{ content: string; promptTokens: number; completionTokens: number }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Anthropic API key not configured");

  // Extract system message if present
  const systemMsg = messages.find((m) => m.role === "system")?.content;
  const chatMessages = messages.filter((m) => m.role !== "system");

  const body: Record<string, unknown> = {
    model,
    messages: chatMessages,
    max_tokens,
    temperature,
  };
  if (systemMsg) body.system = systemMsg;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    content: data.content[0].text,
    promptTokens: data.usage.input_tokens,
    completionTokens: data.usage.output_tokens,
  };
}

async function callGoogle(
  model: string,
  messages: ChatMessage[],
  max_tokens: number,
  temperature: number
): Promise<{ content: string; promptTokens: number; completionTokens: number }> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("Google API key not configured");

  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: { maxOutputTokens: max_tokens, temperature },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const content = data.candidates[0].content.parts[0].text;
  const usage = data.usageMetadata;
  return {
    content,
    promptTokens: usage?.promptTokenCount ?? 0,
    completionTokens: usage?.candidatesTokenCount ?? 0,
  };
}

async function callModel(
  modelId: string,
  messages: ChatMessage[],
  max_tokens: number,
  temperature: number
) {
  const model = getModelById(modelId);
  if (!model) throw new Error(`Model ${modelId} not found`);

  switch (model.provider) {
    case "openai":
      return { result: await callOpenAI(modelId, messages, max_tokens, temperature), model };
    case "anthropic":
      return { result: await callAnthropic(modelId, messages, max_tokens, temperature), model };
    case "google":
      return { result: await callGoogle(modelId, messages, max_tokens, temperature), model };
    default:
      throw new Error(`Provider ${model.provider} not supported`);
  }
}

export async function routeRequest(req: RouterRequest): Promise<RouterResponse> {
  const selectedModel = selectModel(req.model, req.prefer ?? "cost");
  const max_tokens = req.max_tokens ?? 1024;
  const temperature = req.temperature ?? 0.7;

  // Build fallback chain: selected model first, then fallbacks
  const chain = [
    selectedModel.id,
    ...FALLBACK_CHAIN.filter((id) => id !== selectedModel.id),
  ];

  const startTime = Date.now();
  let lastError: Error | null = null;

  for (const modelId of chain) {
    try {
      const { result, model } = await callModel(
        modelId,
        req.messages,
        max_tokens,
        temperature
      );
      const latencyMs = Date.now() - startTime;
      const cost = calculateCost(model, result.promptTokens, result.completionTokens);

      return {
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: modelId,
        provider: model.provider,
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: result.content },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: result.promptTokens,
          completion_tokens: result.completionTokens,
          total_tokens: result.promptTokens + result.completionTokens,
        },
        cost,
        latency_ms: latencyMs,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[Router] Model ${modelId} failed: ${lastError.message}, trying next...`);
      continue;
    }
  }

  throw lastError ?? new Error("All models in fallback chain failed");
}
