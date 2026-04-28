"use client";

import { useState } from "react";
import { Settings, Server, Key, Info, CheckCircle2, XCircle } from "lucide-react";

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
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[--border] bg-[--surface] shrink-0">
        <Settings className="w-5 h-5 text-[--accent]" />
        <h1 className="text-base font-semibold text-[--foreground]">Settings</h1>
      </div>

      <div className="px-6 py-6 space-y-6 max-w-xl">
        {/* Backend connection */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-4 h-4 text-[--muted]" />
            <h2 className="text-sm font-semibold text-[--foreground]">Backend Connection</h2>
          </div>
          <div className="rounded-xl border border-[--border] bg-[--surface] p-4 space-y-3">
            <div>
              <label className="block text-xs text-[--muted] mb-1.5">
                Claw API URL
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full bg-[--surface-raised] border border-[--border] rounded-lg px-3 py-2 text-sm font-mono text-[--foreground] outline-none focus:border-[--accent] transition-colors"
                placeholder="http://localhost:3001"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={testConnection}
                disabled={testing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[--surface-raised] border border-[--border] text-xs text-[--foreground] hover:border-[--accent] hover:text-[--accent] transition-colors disabled:opacity-50"
              >
                {testing ? "Testing…" : "Test connection"}
              </button>
              {status === "ok" && (
                <span className="flex items-center gap-1 text-xs text-[--success]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                </span>
              )}
              {status === "error" && (
                <span className="flex items-center gap-1 text-xs text-red-400">
                  <XCircle className="w-3.5 h-3.5" /> Unreachable
                </span>
              )}
            </div>
            <p className="text-xs text-[--muted] leading-relaxed">
              The Rust axum server must be running on this address.
              Start it with <code className="font-mono text-[--accent] text-[11px] bg-[--surface-raised] px-1 rounded">cd rust && cargo run -p claw-cli</code>
            </p>
          </div>
        </section>

        {/* API Key */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-4 h-4 text-[--muted]" />
            <h2 className="text-sm font-semibold text-[--foreground]">Anthropic API Key</h2>
          </div>
          <div className="rounded-xl border border-[--border] bg-[--surface] p-4 space-y-3">
            <div>
              <label className="block text-xs text-[--muted] mb-1.5">
                API Key <span className="text-[--muted]">(stored locally)</span>
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-[--surface-raised] border border-[--border] rounded-lg px-3 py-2 text-sm font-mono text-[--foreground] outline-none focus:border-[--accent] transition-colors"
                placeholder="sk-ant-…"
              />
            </div>
            <p className="text-xs text-[--muted] leading-relaxed">
              Used by the Rust backend. Alternatively, set the
              <code className="font-mono text-[--accent] text-[11px] bg-[--surface-raised] px-1 mx-0.5 rounded">ANTHROPIC_API_KEY</code>
              environment variable before starting the server.
            </p>
          </div>
        </section>

        {/* About */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-[--muted]" />
            <h2 className="text-sm font-semibold text-[--foreground]">About</h2>
          </div>
          <div className="rounded-xl border border-[--border] bg-[--surface] p-4 space-y-2 text-xs text-[--muted] font-mono">
            <div className="flex justify-between">
              <span>Claw Code Web</span>
              <span className="text-[--foreground]">v0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span>Next.js</span>
              <span className="text-[--foreground]">16</span>
            </div>
            <div className="flex justify-between">
              <span>Backend</span>
              <span className="text-[--foreground]">Rust / axum</span>
            </div>
            <div className="flex justify-between">
              <span>Model</span>
              <span className="text-[--foreground]">claude-opus-4-6</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
