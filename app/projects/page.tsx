"use client";

import { useState, useEffect } from "react";
import { useUserId } from "@/lib/useUserId";
import { loadProjects, deleteProject, type SavedProject } from "@/lib/projectStorage";
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

function ProjectCard({ project, onDelete }: { project: SavedProject; onDelete: () => void }) {
  const [showFiles, setShowFiles] = useState(false);
  const [showDeploy, setShowDeploy] = useState(false);
  const [domain, setDomain] = useState("");
  const [copied, setCopied] = useState(false);

  const vercelUrl = `https://vercel.com/new?template=other&name=${encodeURIComponent(project.name)}`;

  const copyCmd = async () => {
    await navigator.clipboard.writeText(`npx vercel --name ${project.name}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
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
  );
}

export default function ProjectsPage() {
  const userId = useUserId();
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
          <span className="text-sm font-mono font-semibold text-[--foreground]">My Projects</span>
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
              <p className="text-sm font-mono font-semibold text-[--foreground] mb-1">No projects yet</p>
              <p className="text-xs font-mono text-[--muted] max-w-xs leading-relaxed">
                Go to Code Editor, generate code, then click{" "}
                <span className="text-[--accent]">Save</span> to save your first project.
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
