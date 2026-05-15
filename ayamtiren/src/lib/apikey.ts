import { v4 as uuidv4 } from "uuid";
import { prisma } from "./prisma";

export function generateApiKey(): { key: string; prefix: string } {
  const raw = uuidv4().replace(/-/g, "");
  const key = `sk-rt-${raw}`;
  const prefix = `sk-rt-${raw.slice(0, 6)}...`;
  return { key, prefix };
}

export async function validateApiKey(key: string) {
  if (!key || !key.startsWith("sk-rt-")) return null;

  const apiKey = await prisma.apiKey.findUnique({
    where: { key },
    include: {
      user: {
        include: { credits: true },
      },
    },
  });

  if (!apiKey || !apiKey.isActive) return null;
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

  // Update lastUsedAt
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return apiKey;
}

export async function deductCredits(
  userId: string,
  cost: number,
  description: string
) {
  await prisma.$transaction([
    prisma.creditBalance.update({
      where: { userId },
      data: {
        balance: { decrement: cost },
        totalSpent: { increment: cost },
      },
    }),
    prisma.transaction.create({
      data: {
        userId,
        type: "USAGE",
        amount: -cost,
        description,
        status: "COMPLETED",
      },
    }),
  ]);
}
