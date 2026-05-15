"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

interface UsageData {
  total: { requests: number; tokens: number; cost: number };
  today: { requests: number; tokens: number; cost: number };
  topModels: { model: string; requests: number; tokens: number; cost: number }[];
  daily: { date: string; requests: number; tokens: number; cost: number }[];
  recentLogs: {
    id: string; model: string; provider: string; totalTokens: number;
    cost: number; latencyMs: number; success: boolean; createdAt: string;
  }[];
}

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const tabs = ["Requests", "Tokens", "Cost"] as const;
type Tab = typeof tabs[number];

export default function UsagePage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [days, setDays] = useState(30);
  const [activeTab, setActiveTab] = useState<Tab>("Requests");
  const [credits, setCredits] = useState<{ balance: number; totalSpent: number } | null>(null);

  useEffect(() => {
    fetch(`/api/usage?days=${days}`)
      .then((r) => r.json())
      .then(setData);
    fetch("/api/credits")
      .then((r) => r.json())
      .then((d) => setCredits(d.credits));
  }, [days]);

  const tabKey: Record<Tab, "requests" | "tokens" | "cost"> = {
    Requests: "requests",
    Tokens: "tokens",
    Cost: "cost",
  };

  const formatValue = (v: number, tab: Tab) => {
    if (tab === "Cost") return `$${v.toFixed(6)}`;
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return v.toString();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usage & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Detailed breakdown of your API consumption</p>
        </div>
        <select
          className="input w-auto"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {!data ? (
        <div className="text-center py-20 text-slate-400">Loading analytics...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Balance", value: `$${credits?.balance.toFixed(4) ?? "0.0000"}`, icon: "💰", color: "text-emerald-600 bg-emerald-50" },
              { label: "Total Requests", value: data.total.requests.toLocaleString(), icon: "⚡", color: "text-indigo-600 bg-indigo-50" },
              { label: "Total Tokens", value: data.total.tokens >= 1e6 ? `${(data.total.tokens/1e6).toFixed(2)}M` : `${(data.total.tokens/1000).toFixed(1)}K`, icon: "◈", color: "text-violet-600 bg-violet-50" },
              { label: "Total Cost", value: `$${data.total.cost.toFixed(4)}`, icon: "📊", color: "text-amber-600 bg-amber-50" },
            ].map((s) => (
              <div key={s.label} className="card p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${s.color}`}>{s.icon}</div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{s.label}</p>
                  <p className="text-xl font-bold text-slate-900">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Daily Usage</h2>
              <div className="flex gap-1">
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      activeTab === t
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {data.daily.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                No data yet — make some requests first!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.daily} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#cbd5e1" tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} stroke="#cbd5e1" tickFormatter={(v) => activeTab === "Cost" ? `$${v.toFixed(4)}` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                  <Tooltip
                    formatter={(v: number) => [formatValue(v, activeTab), activeTab]}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey={tabKey[activeTab]} fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            {/* Model Distribution Pie */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Model Distribution</h2>
              {data.topModels.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={data.topModels}
                      dataKey="requests"
                      nameKey="model"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ model, percent }) =>
                        `${model.split("-")[0]} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {data.topModels.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => [v.toLocaleString(), "requests"]}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Cost by Model */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Cost by Model (Top 5)</h2>
              {data.topModels.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
              ) : (
                <div className="space-y-3 mt-2">
                  {data.topModels.slice(0, 5).map((m, i) => {
                    const maxCost = Math.max(...data.topModels.map((x) => x.cost));
                    return (
                      <div key={m.model} className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-sm flex-shrink-0"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-slate-700 truncate">{m.model}</span>
                            <span className="text-slate-500 ml-2">${m.cost.toFixed(6)}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(m.cost / (maxCost || 1)) * 100}%`,
                                background: COLORS[i % COLORS.length],
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Logs Table */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Recent Requests</h2>
            </div>
            {data.recentLogs.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">No requests yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {["Model", "Provider", "Tokens", "Cost", "Latency", "Status", "Time"].map((h) => (
                        <th key={h} className="text-left px-6 py-3 text-xs text-slate-500 font-semibold uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.recentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-mono text-xs text-slate-700">{log.model}</td>
                        <td className="px-6 py-3 text-xs">
                          <span className={`badge ${
                            log.provider === "openai" ? "bg-emerald-100 text-emerald-700" :
                            log.provider === "anthropic" ? "bg-violet-100 text-violet-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {log.provider}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-xs text-slate-600">{log.totalTokens.toLocaleString()}</td>
                        <td className="px-6 py-3 text-xs text-slate-600">${log.cost.toFixed(6)}</td>
                        <td className="px-6 py-3 text-xs text-slate-600">{log.latencyMs}ms</td>
                        <td className="px-6 py-3">
                          <span className={`badge ${log.success ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                            {log.success ? "✓ OK" : "✗ ERR"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-xs text-slate-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
