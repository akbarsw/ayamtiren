import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "30");
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [logs, todayLogs, modelStats, dailyStats] = await Promise.all([
    // Recent logs
    prisma.usageLog.findMany({
      where: { userId: session.user.id, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    // Today stats
    prisma.usageLog.aggregate({
      where: {
        userId: session.user.id,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        success: true,
      },
      _sum: { totalTokens: true, cost: true },
      _count: { id: true },
    }),
    // Per-model stats
    prisma.usageLog.groupBy({
      by: ["model"],
      where: { userId: session.user.id, createdAt: { gte: since }, success: true },
      _sum: { totalTokens: true, cost: true },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    // Daily aggregation (raw groupBy date)
    prisma.usageLog.findMany({
      where: { userId: session.user.id, createdAt: { gte: since }, success: true },
      select: { createdAt: true, totalTokens: true, cost: true },
    }),
  ]);

  // Aggregate daily stats
  const dailyMap: Record<string, { date: string; requests: number; tokens: number; cost: number }> = {};
  for (const log of dailyStats) {
    const date = log.createdAt.toISOString().slice(0, 10);
    if (!dailyMap[date]) dailyMap[date] = { date, requests: 0, tokens: 0, cost: 0 };
    dailyMap[date].requests++;
    dailyMap[date].tokens += log.totalTokens;
    dailyMap[date].cost += log.cost;
  }
  const dailyArray = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

  // Total stats
  const totalAgg = await prisma.usageLog.aggregate({
    where: { userId: session.user.id, success: true },
    _sum: { totalTokens: true, cost: true },
    _count: { id: true },
  });

  return NextResponse.json({
    total: {
      requests: totalAgg._count.id,
      tokens: totalAgg._sum.totalTokens ?? 0,
      cost: totalAgg._sum.cost ?? 0,
    },
    today: {
      requests: todayLogs._count.id,
      tokens: todayLogs._sum.totalTokens ?? 0,
      cost: todayLogs._sum.cost ?? 0,
    },
    topModels: modelStats.map((m) => ({
      model: m.model,
      requests: m._count.id,
      tokens: m._sum.totalTokens ?? 0,
      cost: m._sum.cost ?? 0,
    })),
    daily: dailyArray,
    recentLogs: logs,
  });
}
