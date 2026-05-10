"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { WebContainer } from "@webcontainer/api";
import { Loader2, Terminal, RefreshCw, ExternalLink, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CodeFile {
  name: string;
  content: string;
  language: string;
}

// ── Detect project type ────────────────────────────────────────────────────────

function detectProjectType(files: CodeFile[]): "html" | "node" | "unknown" {
  const names = files.map((f) => f.name);
  if (names.includes("package.json")) return "node";
  if (files.some((f) => f.name.endsWith(".html"))) return "html";
  return "unknown";
}

// ── Build filesystem tree for WebContainer ─────────────────────────────────────

function buildFileTree(files: CodeFile[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tree: Record<string, any> = {};

  for (const file of files) {
    const parts = file.name.split("/");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let node = tree;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]]) node[parts[i]] = { directory: {} };
      node = node[parts[i]].directory;
    }
    node[parts[parts.length - 1]] = { file: { contents: file.content } };
  }
  return tree;
}

// ── Singleton WebContainer instance ───────────────────────────────────────────
// WebContainer can only be booted once per page

let wcInstance: WebContainer | null = null;
let wcBooting: Promise<WebContainer> | null = null;

async function getWebContainer(): Promise<WebContainer> {
  if (wcInstance) return wcInstance;
  if (wcBooting) return wcBooting;
  wcBooting = import("@webcontainer/api").then(({ WebContainer }) =>
    WebContainer.boot()
  ).then((wc) => {
    wcInstance = wc;
    return wc;
  });
  return wcBooting;
}

// ── Component ──────────────────────────────────────────────────────────────────

type Status =
  | { type: "idle" }
  | { type: "booting" }
  | { type: "installing"; output: string }
  | { type: "starting"; output: string }
  | { type: "ready"; url: string }
  | { type: "error"; message: string };

interface Props {
  files: CodeFile[];
  className?: string;
}

export function WebContainerPreview({ files, className }: Props) {
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const runningRef = useRef(false);
  const filesKey = files.map((f) => f.name + f.content.length).join("|");

  const appendLog = useCallback((line: string) => {
    setLogs((prev) => [...prev.slice(-200), line]);
  }, []);

  const run = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setLogs([]);

    const projectType = detectProjectType(files);

    // ── HTML-only: use blob URL (fast path) ───────────────────────────────────
    if (projectType === "html") {
      const html = files.find((f) => f.name.endsWith(".html"))!;
      let doc = html.content;
      const css = files.find((f) => f.name.endsWith(".css"));
      const js  = files.find((f) => f.name.endsWith(".js") && !f.name.endsWith(".min.js"));
      if (css && !doc.includes("<style>"))
        doc = doc.replace("</head>", `<style>${css.content}</style></head>`);
      if (js && !doc.includes("<script>"))
        doc = doc.replace("</body>", `<script>${js.content}</script></body>`);

      const url = URL.createObjectURL(new Blob([doc], { type: "text/html" }));
      setStatus({ type: "ready", url });
      runningRef.current = false;
      return;
    }

    // ── Node.js project: use WebContainer ─────────────────────────────────────
    if (projectType === "node") {
      try {
        setStatus({ type: "booting" });
        appendLog("> Booting WebContainer…");
        const wc = await getWebContainer();

        // Mount files
        await wc.mount(buildFileTree(files));
        appendLog("> Files mounted.");

        // Install dependencies
        setStatus({ type: "installing", output: "Running npm install…" });
        appendLog("> npm install");
        const install = await wc.spawn("npm", ["install"]);
        install.output.pipeTo(
          new WritableStream({ write: (chunk) => appendLog(chunk) })
        );
        const installCode = await install.exit;
        if (installCode !== 0) throw new Error(`npm install failed (exit ${installCode})`);
        appendLog("> Install complete.");

        // Find the dev command
        const pkgJson = files.find((f) => f.name === "package.json");
        let devCmd = "dev";
        if (pkgJson) {
          try {
            const pkg = JSON.parse(pkgJson.content);
            if (pkg.scripts?.dev) devCmd = "dev";
            else if (pkg.scripts?.start) devCmd = "start";
            else if (pkg.scripts?.serve) devCmd = "serve";
          } catch (_) { /* keep "dev" */ }
        }

        // Start dev server
        setStatus({ type: "starting", output: `npm run ${devCmd}…` });
        appendLog(`> npm run ${devCmd}`);
        const server = await wc.spawn("npm", ["run", devCmd]);
        server.output.pipeTo(
          new WritableStream({ write: (chunk) => appendLog(chunk) })
        );

        // Wait for server-ready event
        wc.on("server-ready", (_port: number, url: string) => {
          appendLog(`> Server ready at ${url}`);
          setStatus({ type: "ready", url });
        });

      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setStatus({ type: "error", message: msg });
        appendLog(`> Error: ${msg}`);
      } finally {
        runningRef.current = false;
      }
      return;
    }

    // Unknown project type
    setStatus({ type: "error", message: "No runnable files detected. Generate an HTML page or Node.js project." });
    runningRef.current = false;
  }, [files, appendLog]);

  // Re-run whenever files change (debounced)
  useEffect(() => {
    runningRef.current = false;
    setStatus({ type: "idle" });
    const t = setTimeout(() => run(), 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filesKey]);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className={cn("flex flex-col h-full bg-[--surface]", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[--border] shrink-0">
        <span className="text-[11px] font-mono text-[--muted] flex items-center gap-1.5">
          {status.type === "ready" ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[--accent] animate-pulse" />
              LIVE
            </>
          ) : status.type === "error" ? (
            <>
              <AlertCircle className="w-3 h-3 text-red-400" />
              ERROR
            </>
          ) : (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-[--accent]" />
              {status.type === "booting"    && "BOOTING…"}
              {status.type === "installing" && "INSTALLING…"}
              {status.type === "starting"   && "STARTING…"}
              {status.type === "idle"       && "WAITING…"}
            </>
          )}
        </span>

        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setShowLogs((v) => !v)}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-mono transition-colors",
              showLogs
                ? "border-[--accent]/40 bg-[--accent-dim] text-[--accent]"
                : "border-[--border] text-[--muted] hover:text-[--foreground]"
            )}
          >
            <Terminal className="w-2.5 h-2.5" />
            Logs
          </button>

          <button
            onClick={() => { runningRef.current = false; run(); }}
            className="flex items-center gap-1 px-2 py-0.5 rounded border border-[--border] text-[10px] font-mono text-[--muted] hover:text-[--foreground] hover:border-[--accent]/50 transition-colors"
            title="Restart"
          >
            <RefreshCw className="w-2.5 h-2.5" />
          </button>

          {status.type === "ready" && (
            <a
              href={status.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-0.5 rounded border border-[--border] text-[10px] font-mono text-[--muted] hover:text-[--foreground] hover:border-[--accent]/50 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Preview iframe */}
        <div className={cn("flex flex-col flex-1 min-w-0", showLogs && "w-1/2 flex-none")}>
          {status.type === "ready" ? (
            <iframe
              ref={iframeRef}
              key={status.url}
              src={status.url}
              title="Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
              className="flex-1 w-full border-0 bg-white"
            />
          ) : status.type === "error" ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-xs font-mono text-[--muted] leading-relaxed max-w-xs">
                {status.message}
              </p>
              <button
                onClick={() => { runningRef.current = false; run(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[--border] text-xs font-mono text-[--muted] hover:text-[--foreground] transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-[--accent]" />
              <p className="text-xs font-mono text-[--muted]">
                {status.type === "booting"    && "Starting WebContainer…"}
                {status.type === "installing" && "Installing dependencies…"}
                {status.type === "starting"   && "Starting dev server…"}
                {status.type === "idle"       && "Preparing…"}
              </p>
            </div>
          )}
        </div>

        {/* Terminal logs panel */}
        {showLogs && (
          <div className="w-1/2 border-l border-[--border] bg-black flex flex-col min-h-0 overflow-hidden">
            <div className="px-3 py-1.5 border-b border-[--border] shrink-0">
              <span className="text-[10px] font-mono text-green-400">Terminal</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {logs.map((line, i) => (
                <p key={i} className="text-[10px] font-mono text-green-300 leading-relaxed whitespace-pre-wrap">
                  {line}
                </p>
              ))}
              {logs.length === 0 && (
                <p className="text-[10px] font-mono text-green-700">Waiting for output…</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
