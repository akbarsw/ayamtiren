import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/apikey";
import { z } from "zod";

// GET /api/keys - list all API keys for current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { usageLogs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const sanitized = keys.map((k) => ({
    id: k.id,
    name: k.name,
    prefix: k.prefix,
    isActive: k.isActive,
    rateLimit: k.rateLimit,
    monthlyLimit: k.monthlyLimit,
    createdAt: k.createdAt,
    lastUsedAt: k.lastUsedAt,
    totalRequests: k._count.usageLogs,
    expiresAt: k.expiresAt,
  }));

  return NextResponse.json({ keys: sanitized });
}

// POST /api/keys - create new API key
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schema = z.object({
    name: z.string().min(1).max(50),
    rateLimit: z.number().int().min(1).max(1000).optional(),
    monthlyLimit: z.number().int().min(100).optional(),
    expiresAt: z.string().datetime().optional(),
  });

  try {
    const body = schema.parse(await req.json());
    const { key, prefix } = generateApiKey();

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        name: body.name,
        key,
        prefix,
        rateLimit: body.rateLimit ?? 100,
        monthlyLimit: body.monthlyLimit ?? 10000,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });

    // Return the full key only once on creation
    return NextResponse.json({
      id: apiKey.id,
      name: apiKey.name,
      key,   // ← only time full key is returned
      prefix,
      createdAt: apiKey.createdAt,
    }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
