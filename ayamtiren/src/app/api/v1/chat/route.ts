import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey, deductCredits } from "@/lib/apikey";
import { routeRequest } from "@/lib/router";
import { RouterRequest } from "@/types";
import { z } from "zod";

const schema = z.object({
  model: z.string().optional(),
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string(),
    })
  ).min(1),
  max_tokens: z.number().int().positive().max(32000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  prefer: z.enum(["cost", "speed", "quality"]).optional(),
});

export async function POST(req: NextRequest) {
  const start = Date.now();

  // Extract API key from Authorization header
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 });
  }
  const keyValue = authHeader.replace("Bearer ", "").trim();

  // Validate API key
  const apiKey = await validateApiKey(keyValue);
  if (!apiKey) {
    return NextResponse.json({ error: "Invalid or inactive API key" }, { status: 401 });
  }

  const user = apiKey.user;
  const credits = user.credits;

  // Check credit balance
  if (!credits || credits.balance <= 0) {
    return NextResponse.json({ error: "Insufficient credits. Please top up your balance." }, { status: 402 });
  }

  // Parse request body
  let body: RouterRequest;
  try {
    const raw = await req.json();
    body = schema.parse(raw) as RouterRequest;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let response;
  let success = true;
  let errorMessage: string | undefined;

  try {
    response = await routeRequest(body);
  } catch (err) {
    success = false;
    errorMessage = err instanceof Error ? err.message : "Router error";
    const latencyMs = Date.now() - start;

    // Log failed attempt
    await prisma.usageLog.create({
      data: {
        userId: user.id,
        apiKeyId: apiKey.id,
        model: body.model ?? "auto",
        provider: "router",
        totalTokens: 0,
        cost: 0,
        latencyMs,
        statusCode: 500,
        success: false,
        errorMessage,
      },
    });

    return NextResponse.json({ error: errorMessage }, { status: 502 });
  }

  const cost = response.cost;

  // Deduct credits & log usage
  await Promise.all([
    deductCredits(
      user.id,
      cost,
      `${response.model} - ${response.usage.total_tokens} tokens`
    ),
    prisma.usageLog.create({
      data: {
        userId: user.id,
        apiKeyId: apiKey.id,
        model: response.model,
        provider: response.provider,
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
        cost,
        latencyMs: response.latency_ms,
        statusCode: 200,
        success: true,
      },
    }),
  ]);

  return NextResponse.json(response);
}
