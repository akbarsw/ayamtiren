import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/StatCard";
import Link from "next/link";

async function getDashboardData(userId: string) {
  const since30d = new Date();
  since30d.setDate(since30d.getDate() - 30);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [credits, totalAgg, todayAgg, topModels, recentLogs, keyCount] =
    await Promise.all([
      prisma.creditBalance.findUnique({ where: { userId } }),
      prisma.usageLog.aggregate({
        where: { userId, success: true },
        _sum: { totalTokens: true, cost: true },
        _count: { id: true },
      }),
      prisma.usageLog.aggregate({
        where: { userId, success: true, createdAt: { gte: todayStart } },
        _sum: { totalTokens: true, cost: true },
        _count: { id: true },
      }),
      prisma.usageLog.groupBy({
        by: ["model"],
        where: { userId, success: true, createdAt: { gte: since30d } },
        _count: { id: true },
        _sum: { totalTokens: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
      prisma.usageLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.apiKey.count({ where: { userId, isActive: true } }),
    ]);

  return { credits, totalAgg, todayAgg, topModels, recentLogs, keyCount };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const { credits, totalAgg, todayAgg, topModels, recentLogs, keyCount } =
    await getDashboardData(session!.user.id);

  const balance = credits?.balance ?? 0;
  const totalReqs = totalAgg._count.id;
  const totalTokens = totalAgg._sum.totalTokens ?? 0;
  const totalCost = totalAgg._sum.cost ?? 0;
  const todayReqs = todayAgg._count.id;
  const todayCost = todayAgg._sum.cost ?? 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-500 text-sm mt-1">
          Welcome back, {session?.user?.name ?? "there"} 👋
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Credit Balance"
          value={`$${balance.toFixed(4)}`}
          sub={`$${(credits?.totalSpent ?? 0).toFixed(4)} spent total`}
          icon="💰"
          color="emerald"
        />
        <StatCard
          title="Total Requests"
          value={totalReqs.toLocaleString()}
          sub={`${todayReqs} today`}
          icon="⚡"
          color="indigo"
        />
        <StatCard
          title="Total Tokens"
          value={totalTokens >= 1000000
            ? `${(totalTokens / 1000000).toFixed(2)}M`
            : totalTokens >= 1000
            ? `${(totalTokens / 1000).toFixed(1)}K`
            : totalTokens.toString()}
          sub="All time"
          icon="◈"
          color="violet"
        />
        <StatCard
          title="Total Cost"
          value={`$${totalCost.toFixed(4)}`}
          sub={`$${todayCost.toFixed(6)} today`}
          icon="📊"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top Models */}
        <div className="card p-6 xl:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Top Models (30d)</h2>
            <Link href="/dashboard/usage" className="text-xs text-indigo-600 hover:underline">
              View all →
            </Link>
          </div>
          {topModels.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm">No requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topModels.map((m, i) => (
                <div key={m.model} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 truncate">
                        {m.model}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">
                        {m._count.id} reqs
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${(m._count.id / (topModels[0]._count.id || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Logs */}
        <div className="card p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Recent Requests</h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="badge bg-emerald-100 text-emerald-700">● Active keys: {keyCount}</span>
            </div>
          </div>
          {recentLogs.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="text-4xl mb-3">🔌</p>
              <p className="text-sm font-medium mb-1">No requests yet</p>
              <p className="text-xs">Create an API key and make your first request</p>
              <Link href="/dashboard/keys" className="inline-block mt-3 btn-primary text-xs">
                Create API Key
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 text-xs text-slate-400 font-medium">Model</th>
                    <th className="text-left py-2 text-xs text-slate-400 font-medium">Tokens</th>
                    <th className="text-left py-2 text-xs text-slate-400 font-medium">Cost</th>
                    <th className="text-left py-2 text-xs text-slate-400 font-medium">Latency</th>
                    <th className="text-left py-2 text-xs text-slate-400 font-medium">Status</th>
                    <th className="text-left py-2 text-xs text-slate-400 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2.5 font-mono text-xs text-slate-700">{log.model}</td>
                      <td className="py-2.5 text-xs text-slate-600">{log.totalTokens.toLocaleString()}</td>
                      <td className="py-2.5 text-xs text-slate-600">${log.cost.toFixed(6)}</td>
                      <td className="py-2.5 text-xs text-slate-600">{log.latencyMs}ms</td>
                      <td className="py-2.5">
                        <span className={`badge ${log.success ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                          {log.success ? "OK" : "ERR"}
                        </span>
                      </td>
                      <td className="py-2.5 text-xs text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
