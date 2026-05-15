"use client";

import { useState, useEffect, useCallback } from "react";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  isActive: boolean;
  rateLimit: number;
  monthlyLimit: number;
  createdAt: string;
  lastUsedAt?: string;
  totalRequests: number;
  expiresAt?: string;
}

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyVisible, setNewKeyVisible] = useState<{ key: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchKeys = useCallback(async () => {
    const res = await fetch("/api/keys");
    const data = await res.json();
    setKeys(data.keys ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  async function createKey() {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewKeyVisible({ key: data.key, name: data.name });
        setNewKeyName("");
        fetchKeys();
      } else {
        alert(data.error ?? "Failed to create key");
      }
    } finally {
      setCreating(false);
    }
  }

  async function toggleKey(id: string, isActive: boolean) {
    await fetch(`/api/keys/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchKeys();
  }

  async function deleteKey(id: string, name: string) {
    if (!confirm(`Delete key "${name}"? This action cannot be undone.`)) return;
    await fetch(`/api/keys/${id}`, { method: "DELETE" });
    fetchKeys();
  }

  function copyKey(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">API Keys</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your API keys. Keep them secret — they grant access to your credit balance.
        </p>
      </div>

      {/* Create Key */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-3">Create New Key</h2>
        <div className="flex gap-3">
          <input
            className="input max-w-xs"
            placeholder="Key name (e.g. Production App)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createKey()}
          />
          <button
            className="btn-primary"
            onClick={createKey}
            disabled={creating || !newKeyName.trim()}
          >
            {creating ? "Creating..." : "+ Create Key"}
          </button>
        </div>
      </div>

      {/* Newly created key banner */}
      {newKeyVisible && (
        <div className="card border-emerald-200 bg-emerald-50 p-5 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-800 font-semibold text-sm mb-1">
                ✅ Key created: <span className="font-bold">{newKeyVisible.name}</span>
              </p>
              <p className="text-emerald-700 text-xs mb-3">
                Copy your key now — it will NOT be shown again.
              </p>
              <div className="flex items-center gap-2">
                <code className="bg-white border border-emerald-200 px-3 py-2 rounded-lg text-sm font-mono text-slate-800">
                  {newKeyVisible.key}
                </code>
                <button
                  className="btn-secondary text-xs"
                  onClick={() => copyKey(newKeyVisible.key)}
                >
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <button
              onClick={() => setNewKeyVisible(null)}
              className="text-emerald-600 hover:text-emerald-800 text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Keys Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-4xl mb-3">⚿</p>
            <p className="text-sm font-medium">No API keys yet</p>
            <p className="text-xs mt-1">Create your first key to start using the router</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs text-slate-500 font-semibold uppercase tracking-wide">Name</th>
                <th className="text-left px-6 py-3 text-xs text-slate-500 font-semibold uppercase tracking-wide">Key</th>
                <th className="text-left px-6 py-3 text-xs text-slate-500 font-semibold uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-3 text-xs text-slate-500 font-semibold uppercase tracking-wide">Requests</th>
                <th className="text-left px-6 py-3 text-xs text-slate-500 font-semibold uppercase tracking-wide">Last Used</th>
                <th className="text-left px-6 py-3 text-xs text-slate-500 font-semibold uppercase tracking-wide">Created</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {keys.map((key) => (
                <tr key={key.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{key.name}</td>
                  <td className="px-6 py-4">
                    <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                      {key.prefix}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleKey(key.id, key.isActive)}
                      className={`badge cursor-pointer ${
                        key.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {key.isActive ? "● Active" : "○ Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {key.totalRequests.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {key.lastUsedAt
                      ? new Date(key.lastUsedAt).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => deleteKey(key.id, key.name)}
                      className="text-rose-500 hover:text-rose-700 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Usage Docs */}
      <div className="card p-6 mt-6">
        <h3 className="font-semibold text-slate-900 mb-3">How to use your API key</h3>
        <div className="space-y-3 text-sm">
          <p className="text-slate-600">Send requests to the router endpoint:</p>
          <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto">
{`curl https://yourdomain.com/api/v1/chat \\
  -H "Authorization: Bearer sk-rt-your-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [{"role": "user", "content": "Hello!"}],
    "prefer": "cost"
  }'`}
          </pre>
          <p className="text-slate-500 text-xs">
            <strong>prefer</strong>: <code>"cost"</code> (cheapest model) · <code>"speed"</code> (fastest) · <code>"quality"</code> (best model)
          </p>
        </div>
      </div>
    </div>
  );
}
