"use client";

import { useState } from "react";
import { Settings, Server, Key, Info, CheckCircle2, XCircle, Terminal } from "lucide-react";

const DEFAULT_API_URL =
  process.env.NEXT_PUBLIC_CLAW_API_URL ?? "http://localhost:3001";

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    setStatus("idle");
    try {
      const res = await fetch(`${apiUrl}/sessions`, { method: "GET" });
      setStatus(res.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[--background]">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-[--border] bg-[--surface] shrink-0">
        <Settings className="w-4 h-4 text-[--accent]" />
        <h1 className="text-xs font-mono font-bold text-[--foreground] tracking-wider">SYS_CONFIG</h1>
      </div>

      <div className="px-6 py-6 space-y-6 max-w-xl">
        {/* Backend connection */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-3.5 h-3.5 text-[--muted]" />
            <h2 className="text-xs font-mono font-semibold text-[--foreground]">{'// backend_connection'}</h2>
          </div>
          <div className="rounded border border-[--border] bg-[--surface] p-4 space-y-3">
            <div>
              <label className="block text-[10px] font-mono text-[--muted] mb-1.5 uppercase tracking-wider">
                API Endpoint
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full bg-[--background] border border-[--border] rounded px-3 py-2 text-xs font-mono text-[--foreground] outline-none focus:border-[--accent] transition-colors"
                placeholder="http://localhost:3001"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={testConnection}
                disabled={testing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[--border] bg-[--surface-raised] text-[10px] font-mono text-[--foreground] hover:border-[--accent] hover:text-[--accent] transition-colors disabled:opacity-50"
              >
                <Terminal className="w-3 h-3" />
                {testing ? "TESTING..." : "TEST_CONN"}
              </button>
              {status === "ok" && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-[--success]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> CONNECTED
                </span>
              )}
              {status === "error" && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-[--destructive]">
                  <XCircle className="w-3.5 h-3.5" /> UNREACHABLE
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-[--muted] leading-relaxed">
              {'> Rust axum server must be running.'}<br />
              {'> Start: '}<code className="text-[--accent]">cd rust && cargo run -p claw-cli</code>
            </p>
          </div>
        </section>

        {/* API Key */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-3.5 h-3.5 text-[--muted]" />
            <h2 className="text-xs font-mono font-semibold text-[--foreground]">{'// anthropic_api_key'}</h2>
          </div>
          <div className="rounded border border-[--border] bg-[--surface] p-4 space-y-3">
            <div>
              <label className="block text-[10px] font-mono text-[--muted] mb-1.5 uppercase tracking-wider">
                Secret Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-[--background] border border-[--border] rounded px-3 py-2 text-xs font-mono text-[--foreground] outline-none focus:border-[--accent] transition-colors"
                placeholder="sk-ant-..."
              />
            </div>
            <p className="text-[10px] font-mono text-[--muted] leading-relaxed">
              {'> Or set env var: '}
              <code className="text-[--accent]">ANTHROPIC_API_KEY</code>
              {' before starting the server.'}
            </p>
          </div>
        </section>

        {/* About */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-3.5 h-3.5 text-[--muted]" />
            <h2 className="text-xs font-mono font-semibold text-[--foreground]">{'// system_info'}</h2>
          </div>
          <div className="rounded border border-[--border] bg-[--surface] p-4 space-y-2 text-[11px] font-mono">
            {[
              ["product",   "JP Code"],
              ["version",   "1.6.1"],
              ["framework", "Next.js 16"],
              ["backend",   "Rust / axum"],
              ["model",     "claude-opus-4-6"],
              ["status",    "ONLINE"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-[--border-subtle] pb-1.5 last:border-0 last:pb-0">
                <span className="text-[--muted]">{k}</span>
                <span className="text-[--accent]">{v}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
