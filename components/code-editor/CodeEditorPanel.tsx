"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { cn } from "@/lib/utils";
import { useUserId } from "@/lib/useUserId";
import { upsertProject, type SavedProject } from "@/lib/projectStorage";
import { useLang } from "@/lib/langContext";
import {
  Send,
  Loader2,
  Code2,
  FileText,
  Terminal,
  Eye,
  Zap,
  ChevronRight,
  Copy,
  Check,
  Plus,
  FolderOpen,
  ChevronDown,
  Folder,
  MessageSquare,
  Download,
  Save,
  Globe,
  X,
  Rocket,
  ExternalLink,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface CodeFile {
  name: string;
  language: string;
  content: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return "";
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

/** Parse all ```lang ... ``` blocks from a text into CodeFile objects */
function parseCodeBlocks(text: string): CodeFile[] {
  const files: CodeFile[] = [];
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const lang = match[1] ?? "text";
    const content = match[2].trimEnd();
    // Look for a filename comment on the first line
    const firstLine = content.split("\n")[0];
    const filenameMatch =
      firstLine.match(/\/\/\s*filename:\s*(.+)/) ??
      firstLine.match(/#\s*filename:\s*(.+)/);
    const name = filenameMatch
      ? filenameMatch[1].trim()
      : `file.${langToExt(lang)}`;
    const cleanContent = filenameMatch
      ? content.split("\n").slice(1).join("\n")
      : content;
    files.push({ name, language: lang, content: cleanContent });
  }
  return files;
}

function langToExt(lang: string): string {
  const map: Record<string, string> = {
    rust: "rs",
    typescript: "ts",
    javascript: "js",
    python: "py",
    go: "go",
    toml: "toml",
    json: "json",
    yaml: "yml",
    html: "html",
    css: "css",
    bash: "sh",
    shell: "sh",
    sql: "sql",
  };
  return map[lang.toLowerCase()] ?? lang;
}

/** Strip code blocks from text leaving prose only */
function stripCodeBlocks(text: string): string {
  return text.replace(/```[\s\S]*?```/g, "").trim();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 text-[--muted] hover:text-[--foreground] transition-colors text-[10px]"
    >
      {copied ? (
        <Check className="w-3 h-3 text-[--success]" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function buildPreviewHtml(files: CodeFile[]): string {
  const html = files.find((f) => f.language === "html" || f.name.endsWith(".html"));
  const css = files.find((f) => f.language === "css" || f.name.endsWith(".css"));
  const js = files.find(
    (f) =>
      f.language === "javascript" ||
      f.language === "js" ||
      f.name.endsWith(".js")
  );

  if (!html && !css && !js) return "";

  if (html) {
    let doc = html.content;
    if (css && !doc.includes("<style>")) {
      doc = doc.replace("</head>", `<style>${css.content}</style></head>`);
    }
    if (js && !doc.includes("<script>")) {
      doc = doc.replace("</body>", `<script>${js.content}</script></body>`);
    }
    return doc;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
${css ? `<style>${css.content}</style>` : ""}
</head>
<body>
${js ? `<script>${js.content}</script>` : ""}
</body>
</html>`;
}

function PreviewPane({ files }: { files: CodeFile[] }) {
  const html = buildPreviewHtml(files);

  if (!html) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[--surface]">
        <Terminal className="w-8 h-8 text-[--muted]" />
        <div className="text-center">
          <p className="text-sm font-mono font-medium text-[--foreground] mb-1">Preview</p>
          <p className="text-xs font-mono text-[--muted] max-w-xs leading-relaxed">
            Preview works for HTML/CSS/JS files.
            <br />
            Ask JP Code to build a web page or UI component.
          </p>
        </div>
      </div>
    );
  }

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[--border] bg-[--surface] shrink-0">
        <Eye className="w-3 h-3 text-[--accent]" />
        <span className="text-[11px] font-mono text-[--muted]">LIVE PREVIEW</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[--accent] animate-pulse ml-auto" />
      </div>
      <iframe
        key={url}
        src={url}
        title="Preview"
        sandbox="allow-scripts"
        className="flex-1 w-full border-0 bg-white"
      />
    </div>
  );
}

// ── ZIP download helper ────────────────────────────────────────────────────────

async function downloadZip(files: CodeFile[], projectName: string) {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const folder = zip.folder(projectName) ?? zip;
  for (const file of files) {
    folder.file(file.name, file.content);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${projectName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Save / Name dialog ────────────────────────────────────────────────────────

function SaveDialog({
  defaultName,
  onSave,
  onCancel,
}: {
  defaultName: string;
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-[--border] bg-[--surface] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[--border]">
          <div className="flex items-center gap-2">
            <Save className="w-3.5 h-3.5 text-[--accent]" />
            <span className="text-xs font-mono font-semibold text-[--foreground]">Save Project</span>
          </div>
          <button onClick={onCancel} className="text-[--muted] hover:text-[--foreground] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4 py-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[--muted]">Project name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && name.trim() && onSave(name.trim(), description)}
              className="w-full bg-[--surface-raised] border border-[--border] rounded-lg px-3 py-2 text-sm font-mono text-[--foreground] outline-none focus:border-[--accent] transition-colors"
              placeholder="my-awesome-project"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[--muted]">Description (optional)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[--surface-raised] border border-[--border] rounded-lg px-3 py-2 text-sm font-mono text-[--foreground] outline-none focus:border-[--accent] transition-colors"
              placeholder="What does this project do?"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={onCancel}
              className="flex-1 px-3 py-2 rounded-lg border border-[--border] text-xs font-mono text-[--muted] hover:text-[--foreground] hover:border-[--accent] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => name.trim() && onSave(name.trim(), description)}
              disabled={!name.trim()}
              className="flex-1 px-3 py-2 rounded-lg bg-[--accent] text-xs font-mono transition-colors hover:bg-[--accent-hover] disabled:opacity-50"
              style={{ color: "var(--on-accent)" }}
            >
              Save & Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Deploy modal ───────────────────────────────────────────────────────────────

function DeployModal({ projectName, onClose }: { projectName: string; onClose: () => void }) {
  const [domain, setDomain] = useState("");
  const [copied, setCopied] = useState(false);

  const vercelUrl = `https://vercel.com/new?template=other&name=${encodeURIComponent(projectName)}`;

  const copyCommand = async () => {
    await navigator.clipboard.writeText(`npx vercel --name ${projectName}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-[--border] bg-[--surface] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[--border]">
          <div className="flex items-center gap-2">
            <Rocket className="w-3.5 h-3.5 text-[--accent]" />
            <span className="text-xs font-mono font-semibold text-[--foreground]">Deploy / Domain</span>
          </div>
          <button onClick={onClose} className="text-[--muted] hover:text-[--foreground] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-4 flex flex-col gap-4">
          {/* Step 1 — Download */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[--muted]">Step 1 — Download your project</p>
            <p className="text-xs font-mono text-[--foreground] leading-relaxed">
              Save the ZIP and extract it locally, then initialize a git repo.
            </p>
          </div>

          {/* Step 2 — Deploy to Vercel */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[--muted]">Step 2 — Deploy to Vercel</p>
            <a
              href={vercelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[--border] bg-[--surface-raised] hover:border-[--accent] hover:bg-[--accent-dim] transition-colors text-xs font-mono text-[--foreground] hover:text-[--accent]"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              Deploy on Vercel
            </a>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-[--border]" />
              <span className="text-[10px] font-mono text-[--muted]">or via CLI</span>
              <div className="flex-1 h-px bg-[--border]" />
            </div>
            <button
              onClick={copyCommand}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[--border] bg-[--background] hover:border-[--accent] transition-colors text-xs font-mono text-[--muted] hover:text-[--foreground] text-left"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[--success] shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
              <code className="flex-1">npx vercel --name {projectName}</code>
            </button>
          </div>

          {/* Step 3 — Custom domain */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[--muted]">Step 3 — Add custom domain</p>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 flex-1 bg-[--surface-raised] border border-[--border] rounded-lg px-3 py-2 focus-within:border-[--accent] transition-colors">
                <Globe className="w-3.5 h-3.5 text-[--muted] shrink-0" />
                <input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="yourdomain.com"
                  className="flex-1 bg-transparent text-xs font-mono text-[--foreground] outline-none placeholder:text-[--muted]"
                />
              </div>
            </div>
            {domain && (
              <a
                href={`https://vercel.com/docs/projects/domains/add-a-domain`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] font-mono text-[--accent] hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                How to connect {domain} on Vercel
              </a>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[--border] text-xs font-mono text-[--muted] hover:text-[--foreground] hover:border-[--accent] transition-colors mt-1"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Project toolbar (Download + Save + Deploy) ─────────────────────────────────

function ProjectToolbar({
  files,
  userId,
  projectId,
  projectName,
  onProjectSaved,
}: {
  files: CodeFile[];
  userId: string | null;
  projectId: string | null;
  projectName: string;
  onProjectSaved: (project: SavedProject) => void;
}) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [savedBadge, setSavedBadge] = useState(false);

  const handleSaveAndDownload = (name: string, description: string) => {
    setShowSaveDialog(false);
    // Save to projects list
    if (userId) {
      const saved = upsertProject(userId, {
        id: projectId ?? undefined,
        name,
        description,
        files,
      });
      onProjectSaved(saved);
      setSavedBadge(true);
      setTimeout(() => setSavedBadge(false), 2500);
    }
    // Download ZIP
    downloadZip(files, name);
  };

  if (files.length === 0) return null;

  return (
    <>
      {showSaveDialog && (
        <SaveDialog
          defaultName={projectName}
          onSave={handleSaveAndDownload}
          onCancel={() => setShowSaveDialog(false)}
        />
      )}
      {showDeployModal && (
        <DeployModal
          projectName={projectName}
          onClose={() => setShowDeployModal(false)}
        />
      )}

      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-[--border] bg-[--surface] shrink-0">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[--border] bg-[--surface-raised] hover:border-[--accent] hover:bg-[--accent-dim] transition-colors text-[11px] font-mono"
          style={{ color: savedBadge ? "var(--accent)" : "var(--muted)" }}
          title="Save project & download ZIP"
        >
          {savedBadge ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
          <span className="hidden sm:inline">{savedBadge ? "Saved!" : "Save"}</span>
        </button>

        <button
          onClick={() => downloadZip(files, projectName)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[--border] bg-[--surface-raised] hover:border-[--accent] hover:bg-[--accent-dim] transition-colors text-[11px] font-mono text-[--muted] hover:text-[--accent]"
          title="Download ZIP"
        >
          <Download className="w-3 h-3" />
          <span className="hidden sm:inline">Download ZIP</span>
        </button>

        <button
          onClick={() => setShowDeployModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[--accent]/40 bg-[--accent-dim] hover:bg-[--accent] transition-colors text-[11px] font-mono ml-auto"
          style={{ color: "var(--accent)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--on-accent)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
          title="Deploy & connect domain"
        >
          <Rocket className="w-3 h-3" />
          <span className="hidden sm:inline">Deploy</span>
        </button>
      </div>
    </>
  );
}

function CodePane({
  files,
  userId,
  projectId,
  projectName,
  onProjectSaved,
}: {
  files: CodeFile[];
  userId: string | null;
  projectId: string | null;
  projectName: string;
  onProjectSaved: (p: SavedProject) => void;
}) {
  const [activeFile, setActiveFile] = useState(0);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");

  // Only clamp if out of bounds — never force back to 0 when files grow
  const safeIdx = files.length === 0 ? 0 : Math.min(activeFile, files.length - 1);

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
        <FolderOpen className="w-8 h-8 text-[--muted]" />
        <p className="text-sm text-[--muted]">
          Files will appear here as JP Code generates code
        </p>
        <p className="text-xs text-[--muted] max-w-xs leading-relaxed">
          Try: &ldquo;Create a Rust HTTP server&rdquo; or &ldquo;Write a Python script to parse JSON&rdquo;
        </p>
      </div>
    );
  }

  const file = files[safeIdx];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Project action toolbar */}
      <ProjectToolbar
        files={files}
        userId={userId}
        projectId={projectId}
        projectName={projectName}
        onProjectSaved={onProjectSaved}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Desktop file tree sidebar */}
      <FileTreeSidebar files={files} activeFile={safeIdx} onSelect={setActiveFile} />

      {/* Editor + Preview area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top tab bar: Code | Preview + breadcrumb */}
        <div className="flex items-center border-b border-[--border] bg-[--surface] shrink-0">
          <button
            onClick={() => setActiveTab("code")}
            className={cn(
              "flex items-center gap-1.5 px-3 md:px-4 py-2.5 text-xs border-b-2 transition-colors",
              activeTab === "code"
                ? "border-[--accent] text-[--accent]"
                : "border-transparent text-[--muted] hover:text-[--foreground]"
            )}
          >
            <Code2 className="w-3 h-3" />
            Code
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={cn(
              "flex items-center gap-1.5 px-3 md:px-4 py-2.5 text-xs border-b-2 transition-colors",
              activeTab === "preview"
                ? "border-[--accent] text-[--accent]"
                : "border-transparent text-[--muted] hover:text-[--foreground]"
            )}
          >
            <Eye className="w-3 h-3" />
            Preview
          </button>
          {/* Breadcrumb — desktop only */}
          <div className="hidden md:flex items-center gap-1.5 ml-auto pr-4 text-[10px] font-mono text-[--muted]">
            <span className="truncate max-w-[200px]">{file.name}</span>
            <span className="px-1 py-0.5 rounded border border-[--border] text-[9px]">{file.language}</span>
            <CopyButton text={file.content} />
          </div>
          {/* Copy — mobile only */}
          <div className="md:hidden ml-auto pr-3">
            <CopyButton text={file.content} />
          </div>
        </div>

        {/* Mobile file tabs (horizontal scroll) */}
        <MobileFileTabs files={files} activeFile={safeIdx} onSelect={setActiveFile} />

        {/* Content */}
        {activeTab === "code" ? (
          <div className="flex-1 overflow-auto bg-[--background]">
            <pre className="p-3 md:p-4 text-xs font-mono text-[--foreground] leading-relaxed overflow-x-auto">
              <code>{file.content}</code>
            </pre>
          </div>
        ) : (
          <PreviewPane files={files} />
        )}
      </div>
      </div>
    </div>
  );
}

function MsgBubble({ msg }: { msg: UIMessage }) {
  const isUser = msg.role === "user";
  const raw = getMessageText(msg);
  const prose = stripCodeBlocks(raw);
  const files = parseCodeBlocks(raw);

  return (
    <div className={cn("flex gap-3 px-4 py-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-full shrink-0 mt-0.5",
          isUser
            ? "bg-[--surface-raised] text-[--foreground]"
            : "bg-[--accent-dim] text-[--accent]"
        )}
      >
        {isUser ? (
          <span className="text-[10px] font-bold">U</span>
        ) : (
          <Zap className="w-3.5 h-3.5" />
        )}
      </div>
      <div className={cn("flex flex-col gap-2 max-w-[85%]", isUser && "items-end")}>
        {prose && (
          <div
            className={cn(
              "rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
              isUser
                ? "bg-[--surface-raised] border border-[--border-subtle]"
                : "bg-[--surface] border border-[--border]"
            )}
          >
            {prose}
          </div>
        )}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2 py-1 rounded border border-[--accent]/30 bg-[--accent-dim] text-[10px] font-mono text-[--accent]"
              >
                <FileText className="w-3 h-3" />
                {f.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Generation progress component ─────────────────────────────────────────────

const GENERATION_STEPS = [
  { label: "Analyzing request",  sub: "Reading context and requirements…"      },
  { label: "Planning structure", sub: "Deciding files to create or modify…"    },
  { label: "Writing code",       sub: "Generating production-quality code…"    },
  { label: "Finalizing",         sub: "Completing files and checking output…"  },
];

function GenerationProgress({
  fileCount,
  liveFiles,
}: {
  fileCount: number;
  liveFiles: CodeFile[];
}) {
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const bar = setInterval(() => {
      setProgress((p) => {
        if (p >= 92) return p;
        return p + Math.random() * 3.5;
      });
    }, 280);
    const step = setInterval(() => {
      setStepIdx((i) => Math.min(i + 1, GENERATION_STEPS.length - 1));
    }, 2400);
    return () => { clearInterval(bar); clearInterval(step); };
  }, []);

  // Once files start appearing, jump to "Writing code" step
  useEffect(() => {
    if (liveFiles.length > 0 && stepIdx < 2) setStepIdx(2);
  }, [liveFiles.length, stepIdx]);

  const currentStep = GENERATION_STEPS[stepIdx];

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[--border] bg-[--surface] px-4 py-3.5 mx-4 my-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 text-[--accent] animate-spin shrink-0" />
          <span className="text-xs font-mono font-semibold text-[--foreground]">
            {currentStep.label}
          </span>
        </div>
        {fileCount > 0 && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[--accent]/30 bg-[--accent-dim] text-[--accent]">
            {fileCount} file{fileCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-[3px] w-full rounded-full bg-[--border] overflow-hidden">
        <div
          className="h-full rounded-full bg-[--accent] transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 92)}%` }}
        />
      </div>

      {/* Sub-label */}
      <p className="text-[10px] font-mono text-[--muted]">{currentStep.sub}</p>

      {/* Live file chips — appear as files are parsed during streaming */}
      {liveFiles.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {liveFiles.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-1 px-2 py-0.5 rounded border border-[--accent]/30 bg-[--accent-dim] text-[10px] font-mono text-[--accent]"
            >
              <FileText className="w-2.5 h-2.5 shrink-0" />
              {f.name.split("/").pop()}
            </div>
          ))}
        </div>
      )}

      {/* Step dots */}
      <div className="flex items-center gap-2">
        {GENERATION_STEPS.map((_, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                i < stepIdx  ? "bg-[--accent]"
                : i === stepIdx ? "bg-[--accent] animate-pulse"
                : "bg-[--border]"
              )}
            />
            {i < GENERATION_STEPS.length - 1 && <span className="w-4 h-px bg-[--border]" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── File tree sidebar ─────────────────────────────────────────────────────────

interface FileTreeNode {
  name: string;
  path: string;
  children?: FileTreeNode[];
  fileIndex?: number;
}

function buildFileTree(files: CodeFile[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];

  files.forEach((file, idx) => {
    const parts = file.name.split("/");
    let nodes = root;

    parts.forEach((part, depth) => {
      const isLeaf = depth === parts.length - 1;
      let existing = nodes.find((n) => n.name === part);

      if (!existing) {
        existing = {
          name: part,
          path: parts.slice(0, depth + 1).join("/"),
          ...(isLeaf ? { fileIndex: idx } : { children: [] }),
        };
        nodes.push(existing);
      }
      if (!isLeaf && existing.children) {
        nodes = existing.children;
      }
    });
  });

  return root;
}

function TreeNode({
  node,
  depth,
  activeFile,
  onSelect,
}: {
  node: FileTreeNode;
  depth: number;
  activeFile: number;
  onSelect: (idx: number) => void;
}) {
  const [open, setOpen] = useState(true);
  const isFolder = node.children !== undefined;
  const isActive = node.fileIndex === activeFile;

  if (isFolder) {
    return (
      <div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 w-full px-2 py-[3px] hover:bg-[--surface-raised] transition-colors text-[11px] font-mono text-[--muted]"
          style={{ paddingLeft: `${8 + depth * 12}px` }}
        >
          <ChevronDown
            className={cn(
              "w-3 h-3 shrink-0 transition-transform",
              !open && "-rotate-90"
            )}
          />
          <Folder className="w-3 h-3 shrink-0 text-[--accent] opacity-70" />
          <span className="truncate">{node.name}</span>
        </button>
        {open && node.children?.map((child) => (
          <TreeNode
            key={child.path}
            node={child}
            depth={depth + 1}
            activeFile={activeFile}
            onSelect={onSelect}
          />
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => typeof node.fileIndex === "number" && onSelect(node.fileIndex)}
      className={cn(
        "flex items-center gap-1.5 w-full px-2 py-[3px] text-[11px] font-mono transition-colors truncate",
        isActive
          ? "bg-[--accent-dim] text-[--accent]"
          : "text-[--muted] hover:bg-[--surface-raised] hover:text-[--foreground]"
      )}
      style={{ paddingLeft: `${8 + depth * 12}px` }}
    >
      <FileText className="w-3 h-3 shrink-0" />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

function FileTreeSidebar({
  files,
  activeFile,
  onSelect,
}: {
  files: CodeFile[];
  activeFile: number;
  onSelect: (idx: number) => void;
}) {
  const tree = buildFileTree(files);

  return (
    <div className="hidden md:flex flex-col h-full w-[180px] shrink-0 border-r border-[--border] bg-[--surface] overflow-hidden">
      {/* Sidebar header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[--border] shrink-0">
        <FolderOpen className="w-3 h-3 text-[--accent]" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-[--muted]">
          Explorer
        </span>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {tree.length === 0 ? (
          <p className="text-[10px] font-mono text-[--muted] px-3 py-2">No files yet</p>
        ) : (
          tree.map((node) => (
            <TreeNode key={node.path} node={node} depth={0} activeFile={activeFile} onSelect={onSelect} />
          ))
        )}
      </div>
    </div>
  );
}

/** Mobile file tabs — horizontal scroll row shown only on small screens */
function MobileFileTabs({
  files,
  activeFile,
  onSelect,
}: {
  files: CodeFile[];
  activeFile: number;
  onSelect: (idx: number) => void;
}) {
  if (files.length === 0) return null;
  return (
    <div className="md:hidden flex items-center overflow-x-auto border-b border-[--border] bg-[--surface] shrink-0">
      {files.map((f, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 shrink-0 text-[11px] font-mono border-b-2 transition-colors whitespace-nowrap",
            i === activeFile
              ? "border-[--accent] text-[--accent]"
              : "border-transparent text-[--muted] hover:text-[--foreground]"
          )}
        >
          <FileText className="w-3 h-3" />
          {f.name.split("/").pop()}
        </button>
      ))}
    </div>
  );
}

// ── Project preferences modal ─────────────────────────────────────────────────

interface ProjectPrefs {
  complexity: "simple" | "medium" | "complex";
  stack: string;
  lang: "en" | "ru";
}

const COMPLEXITY_OPTIONS = [
  { value: "simple",  label: "Simple",  labelRu: "Простой",   desc: "Script, small util, single file" },
  { value: "medium",  label: "Medium",  labelRu: "Средний",   desc: "Multi-file app, REST API, SPA"   },
  { value: "complex", label: "Complex", labelRu: "Сложный",   desc: "Full-stack, microservices, ML"   },
] as const;

const STACK_PRESETS = [
  "HTML / CSS / JS (Browser / Game)",
  "TypeScript / React / Next.js",
  "Python / FastAPI",
  "Rust / Axum",
  "Node.js / Express",
  "Go",
  "Solidity / Web3",
  "React Native",
];

function ProjectPrefsModal({
  isRu,
  onConfirm,
  onSkip,
}: {
  isRu: boolean;
  onConfirm: (prefs: ProjectPrefs) => void;
  onSkip: () => void;
}) {
  const [complexity, setComplexity] = useState<ProjectPrefs["complexity"]>("medium");
  const [stack, setStack] = useState("TypeScript / React / Next.js");
  const [customStack, setCustomStack] = useState("");
  const [lang, setLang] = useState<"en" | "ru">(isRu ? "ru" : "en");

  const finalStack = customStack.trim() || stack;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[--border] bg-[--surface] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[--border]">
          <Zap className="w-3.5 h-3.5 text-[--accent]" />
          <span className="text-xs font-mono font-bold text-[--foreground]">
            {isRu ? "Настройки проекта" : "Project Preferences"}
          </span>
        </div>

        <div className="px-4 py-4 flex flex-col gap-4">
          {/* Complexity */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[--muted]">
              {isRu ? "Сложность" : "Complexity"}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {COMPLEXITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setComplexity(opt.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border text-[10px] font-mono transition-all",
                    complexity === opt.value
                      ? "border-[--accent] bg-[--accent-dim] text-[--accent]"
                      : "border-[--border] text-[--muted] hover:border-[--accent]/50 hover:text-[--foreground]"
                  )}
                >
                  <span className="font-semibold text-[11px]">{isRu ? opt.labelRu : opt.label}</span>
                  <span className="opacity-70 text-center leading-tight">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stack */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[--muted]">
              {isRu ? "Технологии" : "Tech Stack"}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {STACK_PRESETS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStack(s); setCustomStack(""); }}
                  className={cn(
                    "px-2.5 py-1 rounded-lg border text-[10px] font-mono transition-all",
                    stack === s && !customStack
                      ? "border-[--accent] bg-[--accent-dim] text-[--accent]"
                      : "border-[--border] text-[--muted] hover:border-[--accent]/50 hover:text-[--foreground]"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <input
              value={customStack}
              onChange={(e) => setCustomStack(e.target.value)}
              placeholder={isRu ? "Или введи свой стек…" : "Or type your own stack…"}
              className="w-full bg-[--surface-raised] border border-[--border] rounded-lg px-3 py-2 text-xs font-mono text-[--foreground] outline-none focus:border-[--accent] transition-colors placeholder:text-[--muted]"
            />
          </div>

          {/* Code language */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[--muted]">
              {isRu ? "Язык объяснений" : "Explanation Language"}
            </label>
            <div className="flex gap-2">
              {(["en", "ru"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cn(
                    "flex-1 py-2 rounded-xl border text-xs font-mono font-bold transition-all",
                    lang === l
                      ? "border-[--accent] bg-[--accent-dim] text-[--accent]"
                      : "border-[--border] text-[--muted] hover:border-[--accent]/50"
                  )}
                >
                  {l === "en" ? "English" : "Русский"}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onSkip}
              className="px-4 py-2 rounded-xl border border-[--border] text-xs font-mono text-[--muted] hover:text-[--foreground] hover:border-[--accent]/50 transition-colors"
            >
              {isRu ? "Пропустить" : "Skip"}
            </button>
            <button
              onClick={() => onConfirm({ complexity, stack: finalStack, lang })}
              className="flex-1 py-2 rounded-xl bg-[--accent] text-xs font-mono font-bold transition-colors hover:bg-[--accent-hover]"
              style={{ color: "var(--on-accent)" }}
            >
              {isRu ? "Начать разработку" : "Start Building"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── History helpers ───────────────────────────────────────────────────────────

function codeStorageKey(userId: string) {
  return `jp_code_editor_history_${userId}`;
}

function loadCodeHistory(userId: string) {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(codeStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCodeHistory(userId: string, messages: UIMessage[]) {
  try {
    localStorage.setItem(codeStorageKey(userId), JSON.stringify(messages));
  } catch { /* ignore quota */ }
}

// ── Chat Pane (stable component — never inline as JSX expression) ─────────────

interface ChatPaneProps {
  messages: UIMessage[];
  isStreaming: boolean;
  activeFiles: CodeFile[];
  input: string;
  setInput: (v: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  onSubmit: () => void;
  onPrompt: (p: string) => void;
  onClear: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onInput: () => void;
}

function ChatPane({
  messages,
  isStreaming,
  activeFiles,
  input,
  setInput,
  textareaRef,
  bottomRef,
  onSubmit,
  onPrompt,
  onClear,
  onKeyDown,
  onInput,
}: ChatPaneProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 md:px-4 py-2.5 border-b border-[--border] bg-[--surface] shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-[--accent]" />
          <span className="text-xs font-mono font-semibold text-[--foreground]">JP_CODE_EDITOR</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-[11px] font-mono text-[--muted]">Claude O.G</span>
          {messages.length > 0 && (
            <button
              onClick={onClear}
              title="New session"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[--border] bg-[--surface-raised] hover:border-[--accent] hover:text-[--accent] text-[--muted] text-xs transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span className="hidden sm:inline">New</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain py-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-full gap-3 px-5 py-8 text-center">
            <Zap className="w-8 h-8 text-[--accent]" />
            <p className="text-xs font-mono text-[--muted] leading-relaxed">
              {">"} Describe what to build.
              <br />
              {">"} JP Code generates the files.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {(lang === "ru" ? [
                "Сделай игру змейка на HTML/CSS/JS",
                "Создай 2D платформер на HTML Canvas",
                "Построй REST API на Python FastAPI",
                "Напиши HTTP сервер на Rust + Axum",
              ] : [
                "Build a Snake game in HTML/CSS/JS",
                "Create a 2D platformer on HTML Canvas",
                "Build a Python FastAPI with JWT auth",
                "Create a Rust HTTP server with Axum",
              ]).map((p) => (
                <button
                  key={p}
                  onClick={() => onPrompt(p)}
                  className="text-left px-3 py-2.5 rounded-lg border border-[--border] bg-[--surface] hover:border-[--accent] hover:bg-[--accent-dim] transition-colors text-xs font-mono text-[--muted] hover:text-[--accent] active:scale-95"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              // During streaming: skip rendering the last (in-progress) assistant message —
              // GenerationProgress below takes its place, exactly like v0 does.
              const isLastAssistantStreaming =
                isStreaming &&
                msg.role === "assistant" &&
                idx === messages.length - 1;
              if (isLastAssistantStreaming) return null;
              return <MsgBubble key={msg.id} msg={msg} />;
            })}
            {isStreaming && <GenerationProgress fileCount={activeFiles.length} liveFiles={activeFiles} />}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-[--border] bg-[--surface] shrink-0">
        <div className="flex items-end gap-2 rounded-xl border border-[--border] bg-[--surface-raised] px-3 py-2 focus-within:border-[--accent] transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            onInput={onInput}
            rows={1}
            placeholder="Describe what you want to build…"
            className="flex-1 resize-none bg-transparent text-sm text-[--foreground] placeholder:text-[--muted] outline-none leading-relaxed min-h-[24px] max-h-[120px] py-0.5 font-mono"
          />
          <button
            onClick={onSubmit}
            disabled={isStreaming || !input.trim()}
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-lg transition-colors shrink-0 active:scale-95",
              input.trim() && !isStreaming
                ? "bg-[--accent] hover:bg-[--accent-hover]"
                : "bg-[--border] text-[--muted] cursor-not-allowed"
            )}
            style={input.trim() && !isStreaming ? { color: "var(--on-accent)" } : undefined}
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="hidden md:block text-[10px] text-[--muted] mt-1.5 px-1 font-mono">
          Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function CodeEditorPanel() {
  const userId = useUserId();
  const { lang } = useLang();
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/code" }),
  });

  const [input, setInput] = useState("");
  const [mobileTab, setMobileTab] = useState<"chat" | "code">("chat");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("my-project");
  const [showPrefs, setShowPrefs] = useState(false);
  const [pendingMsg, setPendingMsg] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isStreaming = status === "streaming" || status === "submitted";
  const historyLoaded = useRef(false);

  const handleProjectSaved = useCallback((p: SavedProject) => {
    setProjectId(p.id);
    setProjectName(p.name);
  }, []);

  // Load per-user history
  useEffect(() => {
    if (!userId || historyLoaded.current) return;
    historyLoaded.current = true;
    const saved = loadCodeHistory(userId);
    if (saved.length > 0) setMessages(saved);
  }, [userId, setMessages]);

  // Persist per-user history
  useEffect(() => {
    if (!userId || messages.length === 0) return;
    saveCodeHistory(userId, messages);
  }, [userId, messages]);

  // Accumulate all code files across ALL assistant messages.
  // Never reset to empty — if a follow-up reply has no code blocks,
  // keep showing the files from the previous code-generating reply.
  const allFiles = messages
    .filter((m) => m.role === "assistant")
    .flatMap((m) => parseCodeBlocks(getMessageText(m)));

  // Deduplicate by filename — later message wins (edit/update semantics)
  const fileMap = new Map<string, CodeFile>();
  for (const f of allFiles) {
    fileMap.set(f.name, f);
  }
  const activeFiles = Array.from(fileMap.values());

  // Auto-save after each completed generation (streaming → idle transition)
  const prevStreaming = useRef(false);
  useEffect(() => {
    const wasStreaming = prevStreaming.current;
    prevStreaming.current = isStreaming;
    if (wasStreaming && !isStreaming && activeFiles.length > 0 && userId) {
      const saved = upsertProject(userId, {
        id: projectId ?? undefined,
        name: projectName,
        description: "",
        files: activeFiles,
      });
      if (!projectId) setProjectId(saved.id);
    }
  // activeFiles changes every render but we only want to trigger on isStreaming change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming, userId, projectId, projectName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendWithPrefs = useCallback((text: string, prefs?: ProjectPrefs) => {
    let finalText = text;
    if (prefs) {
      finalText =
        `[Project context — complexity: ${prefs.complexity}, stack: ${prefs.stack}, ` +
        `explain in: ${prefs.lang === "ru" ? "Russian" : "English"}]\n\n${text}`;
    }
    sendMessage({ text: finalText });
  }, [sendMessage]);

  const submit = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    // Show prefs modal only on the very first message of a fresh session
    if (messages.length === 0) {
      setPendingMsg(trimmed);
      setShowPrefs(true);
    } else {
      sendWithPrefs(trimmed);
    }
  };

  const handlePrefsConfirm = useCallback((prefs: ProjectPrefs) => {
    setShowPrefs(false);
    if (pendingMsg) {
      sendWithPrefs(pendingMsg, prefs);
      setPendingMsg(null);
    }
  }, [pendingMsg, sendWithPrefs]);

  const handlePrefsSkip = useCallback(() => {
    setShowPrefs(false);
    if (pendingMsg) {
      sendWithPrefs(pendingMsg);
      setPendingMsg(null);
    }
  }, [pendingMsg, sendWithPrefs]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const clearHistory = () => {
    if (!userId) return;
    // Reset chat
    setMessages([]);
    localStorage.removeItem(codeStorageKey(userId));
    // Reset project identity so next generation creates a new project
    setProjectId(null);
    setProjectName("my-project");
    // Reset pending prefs so the modal shows again on the next message
    setPendingMsg(null);
    setShowPrefs(false);
    // On mobile, go back to chat tab
    setMobileTab("chat");
    // Focus the input
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  return (
    <>
    {showPrefs && (
      <ProjectPrefsModal
        isRu={lang === "ru"}
        onConfirm={handlePrefsConfirm}
        onSkip={handlePrefsSkip}
      />
    )}
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── MOBILE: tab switcher ─────────────────────────────────────── */}
      <div className="flex md:hidden border-b border-[--border] bg-[--surface] shrink-0">
        <button
          onClick={() => setMobileTab("chat")}
          className={cn(
            "flex items-center gap-2 flex-1 justify-center py-2.5 text-xs font-mono border-b-2 transition-colors",
            mobileTab === "chat"
              ? "border-[--accent] text-[--accent]"
              : "border-transparent text-[--muted]"
          )}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Chat
        </button>
        <button
          onClick={() => setMobileTab("code")}
          className={cn(
            "flex items-center gap-2 flex-1 justify-center py-2.5 text-xs font-mono border-b-2 transition-colors",
            mobileTab === "code"
              ? "border-[--accent] text-[--accent]"
              : "border-transparent text-[--muted]"
          )}
        >
          <Code2 className="w-3.5 h-3.5" />
          Code
          {activeFiles.length > 0 && (
            <span className="text-[9px] px-1 rounded bg-[--accent-dim] border border-[--accent]/30 text-[--accent]">
              {activeFiles.length}
            </span>
          )}
        </button>
      </div>

      {/* ── MOBILE: single-pane view ─────────────────────────────────── */}
      <div className="flex md:hidden flex-1 min-h-0 overflow-hidden">
        {mobileTab === "chat" ? (
          <ChatPane
            messages={messages}
            isStreaming={isStreaming}
            activeFiles={activeFiles}
            input={input}
            setInput={setInput}
            textareaRef={textareaRef}
            bottomRef={bottomRef}
            onSubmit={() => { submit(); setMobileTab("code"); }}
            onPrompt={(p) => { sendMessage({ text: p }); setMobileTab("code"); }}
            onClear={clearHistory}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
          />
        ) : (
          <div className="flex-1 overflow-hidden bg-[--background]">
            <CodePane
              files={activeFiles}
              userId={userId}
              projectId={projectId}
              projectName={projectName}
              onProjectSaved={handleProjectSaved}
            />
          </div>
        )}
      </div>

      {/* ── DESKTOP: side-by-side layout ─────────────────────────────── */}
      <div className="hidden md:flex flex-1 min-h-0 overflow-hidden">
        <div className="flex flex-col w-[420px] shrink-0 border-r border-[--border] overflow-hidden">
          <ChatPane
            messages={messages}
            isStreaming={isStreaming}
            activeFiles={activeFiles}
            input={input}
            setInput={setInput}
            textareaRef={textareaRef}
            bottomRef={bottomRef}
            onSubmit={submit}
            onPrompt={(p) => {
              // Show prefs modal if this is the first message
              if (messages.length === 0) {
                setPendingMsg(p);
                setShowPrefs(true);
              } else {
                sendMessage({ text: p });
              }
            }}
            onClear={clearHistory}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
          />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden bg-[--background]">
          <CodePane
            files={activeFiles}
            userId={userId}
            projectId={projectId}
            projectName={projectName}
            onProjectSaved={handleProjectSaved}
          />
        </div>
      </div>
    </div>
    </>
  );
}
