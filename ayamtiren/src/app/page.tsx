import Link from "next/link";

const features = [
  {
    icon: "🔀",
    title: "Smart Cost-Aware Routing",
    desc: "Automatically picks the cheapest model that can handle your task. Save up to 80% on LLM costs without sacrificing quality.",
  },
  {
    icon: "⛓️",
    title: "Automatic Fallback Chain",
    desc: "If OpenAI is down or rate-limited, requests instantly fall back to Gemini, Claude, and more. Zero downtime.",
  },
  {
    icon: "🔑",
    title: "API Key Management",
    desc: "Issue multiple API keys per account. Set rate limits, monthly quotas, and expiry dates per key.",
  },
  {
    icon: "📊",
    title: "Usage Analytics Dashboard",
    desc: "Real-time charts for requests, tokens, cost per model, and daily trends. Know exactly what you're spending.",
  },
  {
    icon: "💰",
    title: "Credit-Based Billing",
    desc: "Top up credits and pay only for what you use. No subscriptions, no surprise bills.",
  },
  {
    icon: "🛡️",
    title: "Unified OpenAI-Compatible API",
    desc: "One endpoint, one API key. Drop-in replacement for OpenAI SDK — no code changes needed.",
  },
];

const models = [
  { name: "GPT-4o", provider: "OpenAI", tier: "Premium", cost: "$5 / 1M", color: "bg-emerald-100 text-emerald-700" },
  { name: "GPT-4o Mini", provider: "OpenAI", tier: "Cheap", cost: "$0.15 / 1M", color: "bg-emerald-100 text-emerald-700" },
  { name: "Claude 3.5 Sonnet", provider: "Anthropic", tier: "Premium", cost: "$3 / 1M", color: "bg-violet-100 text-violet-700" },
  { name: "Claude 3 Haiku", provider: "Anthropic", tier: "Cheap", cost: "$0.25 / 1M", color: "bg-violet-100 text-violet-700" },
  { name: "Gemini 1.5 Pro", provider: "Google", tier: "Mid", cost: "$1.25 / 1M", color: "bg-blue-100 text-blue-700" },
  { name: "Gemini 1.5 Flash", provider: "Google", tier: "Cheap", cost: "$0.075 / 1M", color: "bg-blue-100 text-blue-700" },
];

const steps = [
  { n: "01", title: "Create an account", desc: "Sign up free and get $1.00 credit instantly — no card required." },
  { n: "02", title: "Generate an API key", desc: "Create a key from the dashboard and set your preferred limits." },
  { n: "03", title: "Send requests", desc: "Point your app to our /api/v1/chat endpoint and let the router do the rest." },
  { n: "04", title: "Monitor & optimize", desc: "Watch usage analytics, compare models, and optimize your spend." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 sticky top-0 bg-slate-900/90 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="text-2xl">⚡</span> RouterAI
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#models" className="hover:text-white transition-colors">Models</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#docs" className="hover:text-white transition-colors">Docs</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors px-3 py-2">
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 rounded-full px-4 py-1.5 text-indigo-300 text-sm mb-8">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          Supporting OpenAI · Anthropic · Google
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
          One API Key<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
            All LLM Providers
          </span>
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Smart router that cuts LLM costs by up to <strong className="text-white">80%</strong> with
          cost-aware routing, automatic fallback chains, and real-time usage analytics.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/register"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-indigo-600/25"
          >
            Start for Free — $1 Credit Included
          </Link>
          <Link
            href="/login"
            className="bg-white/10 hover:bg-white/15 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors border border-white/10"
          >
            View Dashboard →
          </Link>
        </div>
        <p className="text-slate-500 text-sm mt-5">No credit card required · Free $1 credit on signup</p>

        {/* Code Preview */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden text-left shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700 bg-slate-800/50">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="ml-2 text-slate-400 text-xs font-mono">Request</span>
            </div>
            <pre className="p-6 text-sm font-mono overflow-x-auto text-slate-300">
              <span className="text-slate-500"># Same as OpenAI SDK — just change the base URL</span>{"\n"}
              <span className="text-emerald-400">curl</span>{" "}
              <span className="text-amber-300">https://yourdomain.com/api/v1/chat</span> \{"\n"}
              {"  "}<span className="text-indigo-400">-H</span>{" "}
              <span className="text-emerald-300">&quot;Authorization: Bearer sk-rt-xxx&quot;</span> \{"\n"}
              {"  "}<span className="text-indigo-400">-d</span>{" "}
              <span className="text-emerald-300">&apos;&#123;&quot;messages&quot;: [...], &quot;prefer&quot;: &quot;cost&quot;&#125;&apos;</span>{"\n\n"}
              <span className="text-slate-500"># Router picks cheapest available model</span>{"\n"}
              <span className="text-slate-500"># → gpt-4o-mini · gemini-flash · claude-haiku</span>{"\n"}
              <span className="text-slate-500"># → auto fallback if one fails</span>
            </pre>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to ship faster</h2>
          <p className="text-slate-400 text-lg">Built for developers who want power without complexity</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-indigo-500/40 transition-colors"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Models */}
      <section id="models" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Supported Models</h2>
          <p className="text-slate-400">Route across 7+ models from 3 providers. More coming soon.</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 border-b border-slate-700">
              <tr>
                {["Model", "Provider", "Tier", "Input Cost"].map((h) => (
                  <th key={h} className="text-left px-6 py-4 text-xs text-slate-400 font-semibold uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {models.map((m) => (
                <tr key={m.name} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-semibold">{m.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${m.color}`}>
                      {m.provider}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{m.tier}</td>
                  <td className="px-6 py-4 font-mono text-emerald-400">{m.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get started in 4 steps</h2>
          <p className="text-slate-400">From zero to production in under 5 minutes</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="relative">
              <div className="text-5xl font-black text-slate-800 mb-4">{s.n}</div>
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-slate-400">Pay only for what you use. No monthly fees, no hidden charges.</p>
        </div>
        <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            <h3 className="font-bold text-xl mb-1">Starter</h3>
            <p className="text-slate-400 text-sm mb-6">Perfect for personal projects</p>
            <div className="text-4xl font-black mb-1">$0</div>
            <p className="text-slate-400 text-sm mb-6">+ $1 free credit on signup</p>
            <ul className="space-y-2 text-sm text-slate-300 mb-8">
              {["$1 free credit on signup", "All models available", "Unlimited API keys", "Usage analytics", "Fallback chain included"].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> {i}
                </li>
              ))}
            </ul>
            <Link href="/register" className="block text-center bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold py-3 rounded-xl transition-colors">
              Get Started Free
            </Link>
          </div>
          {/* Pay as you go */}
          <div className="bg-indigo-600 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-full">
              RECOMMENDED
            </div>
            <h3 className="font-bold text-xl mb-1">Pay As You Go</h3>
            <p className="text-indigo-200 text-sm mb-6">For teams and production apps</p>
            <div className="text-4xl font-black mb-1">Usage-based</div>
            <p className="text-indigo-200 text-sm mb-6">Top up credits anytime</p>
            <ul className="space-y-2 text-sm text-indigo-100 mb-8">
              {["Pass-through pricing + small margin", "Priority support", "Higher rate limits", "Export billing reports", "Team access (coming soon)"].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-indigo-200">✓</span> {i}
                </li>
              ))}
            </ul>
            <Link href="/register" className="block text-center bg-white text-indigo-700 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-colors">
              Start Building →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 rounded-3xl p-12">
          <h2 className="text-4xl font-bold mb-4">Ready to cut your LLM bill?</h2>
          <p className="text-slate-400 text-lg mb-8">
            Join developers saving up to 80% on AI costs with smart routing.
          </p>
          <Link
            href="/register"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-10 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-indigo-600/25"
          >
            Get Started Free — $1 Credit Included
          </Link>
          <p className="text-slate-500 text-sm mt-4">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold">
            <span>⚡</span> RouterAI
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} RouterAI. Built with Next.js 14.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
