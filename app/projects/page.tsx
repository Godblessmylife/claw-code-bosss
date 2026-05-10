"use client";

import { useState, useEffect } from "react";
import { useUserId } from "@/lib/useUserId";
import { loadProjects, deleteProject, type SavedProject, type SavedFile } from "@/lib/projectStorage";
import { useLang } from "@/lib/langContext";
import { cn } from "@/lib/utils";
import {
  FolderOpen,
  Code2,
  Download,
  Trash2,
  Rocket,
  Calendar,
  FileText,
  ExternalLink,
  Globe,
  Check,
  Copy,
  Eye,
  X,
  Play,
} from "lucide-react";

function formatDate(ms: number) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

async function downloadProjectZip(project: SavedProject) {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const folder = zip.folder(project.name) ?? zip;
  for (const file of project.files) folder.file(file.name, file.content);
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.name}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Code viewer modal ─────────────────────────────────────────────────────────

function buildPreviewHtml(files: SavedFile[]): string {
  const html = files.find((f) => f.language === "html" || f.name.endsWith(".html"));
  const css  = files.find((f) => f.language === "css"  || f.name.endsWith(".css"));
  const js   = files.find((f) => ["javascript","js"].includes(f.language) || f.name.endsWith(".js"));
  if (!html && !css && !js) return "";
  if (html) {
    let doc = html.content;
    if (css && !doc.includes("<style>"))  doc = doc.replace("</head>", `<style>${css.content}</style></head>`);
    if (js  && !doc.includes("<script>")) doc = doc.replace("</body>", `<script>${js.content}</script></body>`);
    return doc;
  }
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${css ? `<style>${css.content}</style>` : ""}</head><body>${js ? `<script>${js.content}</script>` : ""}</body></html>`;
}

function CodeViewerModal({ project, onClose }: { project: SavedProject; onClose: () => void }) {
  const [activeFile, setActiveFile] = useState(0);
  const [tab, setTab] = useState<"code" | "preview">("code");
  const file = project.files[activeFile];
  const previewHtml = buildPreviewHtml(project.files);
  const previewUrl  = previewHtml ? URL.createObjectURL(new Blob([previewHtml], { type: "text/html" })) : "";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[--background]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[--border] bg-[--surface] shrink-0">
        <Code2 className="w-3.5 h-3.5 text-[--accent]" />
        <span className="text-xs font-mono font-bold text-[--foreground] flex-1 truncate">{project.name}</span>
        {/* Tab switcher */}
        <div className="flex rounded border border-[--border] overflow-hidden text-[10px] font-mono">
          <button
            onClick={() => setTab("code")}
            className={cn("px-3 py-1.5 transition-colors", tab === "code" ? "bg-[--accent-dim] text-[--accent]" : "text-[--muted] hover:text-[--foreground]")}
          >
            Code
          </button>
          {previewUrl && (
            <button
              onClick={() => setTab("preview")}
              className={cn("px-3 py-1.5 border-l border-[--border] transition-colors", tab === "preview" ? "bg-[--accent-dim] text-[--accent]" : "text-[--muted] hover:text-[--foreground]")}
            >
              <Play className="w-3 h-3 inline mr-1" />
              Run
            </button>
          )}
        </div>
        <button onClick={onClose} className="p-1.5 rounded hover:bg-[--surface-raised] text-[--muted] hover:text-[--foreground] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* File tree sidebar */}
        <div className="hidden md:flex flex-col w-44 shrink-0 border-r border-[--border] bg-[--surface] overflow-y-auto">
          {project.files.map((f, i) => (
            <button
              key={i}
              onClick={() => { setActiveFile(i); setTab("code"); }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-[11px] font-mono text-left border-b border-[--border-subtle] last:border-0 transition-colors",
                i === activeFile ? "bg-[--accent-dim] text-[--accent]" : "text-[--muted] hover:bg-[--surface-raised] hover:text-[--foreground]"
              )}
            >
              <FileText className="w-3 h-3 shrink-0" />
              <span className="truncate">{f.name.split("/").pop()}</span>
            </button>
          ))}
        </div>

        {/* Mobile file tabs */}
        <div className="md:hidden flex overflow-x-auto border-b border-[--border] bg-[--surface] absolute top-[44px] left-0 right-0">
          {project.files.map((f, i) => (
            <button key={i} onClick={() => { setActiveFile(i); setTab("code"); }}
              className={cn("shrink-0 px-3 py-2 text-[11px] font-mono border-b-2 transition-colors",
                i === activeFile ? "border-[--accent] text-[--accent]" : "border-transparent text-[--muted]")}>
              {f.name.split("/").pop()}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "preview" && previewUrl ? (
          <iframe key={previewUrl} src={previewUrl} title="Preview" sandbox="allow-scripts" className="flex-1 w-full border-0 bg-white" />
        ) : (
          <div className="flex-1 overflow-auto bg-[--background]">
            <pre className="p-4 text-xs font-mono text-[--foreground] leading-relaxed">
              <code>{file?.content}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function ProjectCard({ project, onDelete }: { project: SavedProject; onDelete: () => void }) {
  const [showFiles, setShowFiles] = useState(false);
  const [showDeploy, setShowDeploy] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [domain, setDomain] = useState("");
  const [copied, setCopied] = useState(false);

  const vercelUrl = `https://vercel.com/new?template=other&name=${encodeURIComponent(project.name)}`;

  const copyCmd = async () => {
    await navigator.clipboard.writeText(`npx vercel --name ${project.name}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
    {showViewer && <CodeViewerModal project={project} onClose={() => setShowViewer(false)} />}
    <div className="rounded-xl border border-[--border] bg-[--surface] overflow-hidden hover:border-[--accent]/40 transition-colors">
      {/* Card header */}
      <div className="flex items-start gap-3 p-4">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[--accent-dim] border border-[--accent]/30 shrink-0">
          <Code2 className="w-4 h-4 text-[--accent]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-mono font-semibold text-[--foreground] truncate">{project.name}</h3>
          {project.description && (
            <p className="text-xs font-mono text-[--muted] mt-0.5 truncate">{project.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-[10px] font-mono text-[--muted]">
              <FileText className="w-3 h-3" />
              {project.files.length} file{project.files.length !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-[--muted]">
              <Calendar className="w-3 h-3" />
              {formatDate(project.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* File list (expandable) */}
      {showFiles && (
        <div className="px-4 pb-3 border-t border-[--border]">
          <div className="pt-3 flex flex-col gap-1">
            {project.files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1 rounded bg-[--surface-raised] border border-[--border]">
                <FileText className="w-3 h-3 text-[--accent] shrink-0" />
                <span className="text-[11px] font-mono text-[--foreground] truncate">{f.name}</span>
                <span className="ml-auto text-[10px] font-mono text-[--muted] shrink-0">{f.language}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deploy section */}
      {showDeploy && (
        <div className="px-4 pb-4 border-t border-[--border] pt-3 flex flex-col gap-3">
          <a
            href={vercelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[--border] bg-[--surface-raised] hover:border-[--accent] hover:bg-[--accent-dim] transition-colors text-xs font-mono text-[--foreground] hover:text-[--accent]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Deploy on Vercel
          </a>
          <button
            onClick={copyCmd}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[--border] bg-[--background] hover:border-[--accent] transition-colors text-xs font-mono text-[--muted] hover:text-[--foreground] text-left"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[--success]" /> : <Copy className="w-3.5 h-3.5" />}
            <code>npx vercel --name {project.name}</code>
          </button>
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2 flex-1 bg-[--surface-raised] border border-[--border] rounded-lg px-3 py-2 focus-within:border-[--accent] transition-colors">
              <Globe className="w-3.5 h-3.5 text-[--muted]" />
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
              href="https://vercel.com/docs/projects/domains/add-a-domain"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] font-mono text-[--accent] hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              How to connect {domain} on Vercel
            </a>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-[--border] bg-[--surface-raised]">
        <button
          onClick={() => setShowViewer(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[--accent]/40 bg-[--accent-dim] text-[11px] font-mono text-[--accent] hover:border-[--accent] transition-colors"
        >
          <Eye className="w-3 h-3" />
          View
        </button>

        <button
          onClick={() => setShowFiles((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[11px] font-mono transition-colors",
            showFiles
              ? "border-[--accent]/40 bg-[--accent-dim] text-[--accent]"
              : "border-[--border] text-[--muted] hover:border-[--accent] hover:text-[--accent]"
          )}
        >
          <FolderOpen className="w-3 h-3" />
          Files
        </button>

        <button
          onClick={() => downloadProjectZip(project)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[--border] text-[11px] font-mono text-[--muted] hover:border-[--accent] hover:text-[--accent] transition-colors"
        >
          <Download className="w-3 h-3" />
          ZIP
        </button>

        <button
          onClick={() => setShowDeploy((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[11px] font-mono transition-colors",
            showDeploy
              ? "border-[--accent]/40 bg-[--accent-dim] text-[--accent]"
              : "border-[--border] text-[--muted] hover:border-[--accent] hover:text-[--accent]"
          )}
        >
          <Rocket className="w-3 h-3" />
          Deploy
        </button>

        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[--border] text-[11px] font-mono text-[--muted] hover:border-[--destructive] hover:text-[--destructive] transition-colors ml-auto"
          title="Delete project"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
    </>
  );
}

export default function ProjectsPage() {
  const userId = useUserId();
  const { lang } = useLang();
  const [projects, setProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    if (!userId) return;
    setProjects(loadProjects(userId));
  }, [userId]);

  const handleDelete = (id: string) => {
    if (!userId) return;
    deleteProject(userId, id);
    setProjects(loadProjects(userId));
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[--border] bg-[--surface] shrink-0">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-[--accent]" />
          <span className="text-sm font-mono font-semibold text-[--foreground]">{lang === "ru" ? "Мои Проекты" : "My Projects"}</span>
          {projects.length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[--accent-dim] border border-[--accent]/30 text-[--accent]">
              {projects.length}
            </span>
          )}
        </div>
        <a
          href="/code"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[--accent]/40 bg-[--accent-dim] text-xs font-mono transition-colors hover:bg-[--accent]"
          style={{ color: "var(--accent)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--on-accent)"; e.currentTarget.style.background = "var(--accent)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.background = "var(--accent-dim)"; }}
        >
          <Code2 className="w-3.5 h-3.5" />
          New Project
        </a>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
            <FolderOpen className="w-12 h-12 text-[--muted]" />
            <div>
              <p className="text-sm font-mono font-semibold text-[--foreground] mb-1">
                {lang === "ru" ? "Проектов пока нет" : "No projects yet"}
              </p>
              <p className="text-xs font-mono text-[--muted] max-w-xs leading-relaxed">
                {lang === "ru"
                  ? "Перейди в Code Editor, сгенерируй код — проект сохранится автоматически."
                  : "Go to Code Editor, generate code — the project saves automatically."}
              </p>
            </div>
            <a
              href="/code"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[--accent]/40 bg-[--accent-dim] text-xs font-mono text-[--accent] hover:border-[--accent] transition-colors"
            >
              <Code2 className="w-3.5 h-3.5" />
              Open Code Editor
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} onDelete={() => handleDelete(p.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
