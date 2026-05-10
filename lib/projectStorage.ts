// lib/projectStorage.ts
// Per-user project storage — saved to localStorage under a namespaced key.

export interface SavedFile {
  name: string;
  language: string;
  content: string;
}

export interface SavedProject {
  id: string;
  name: string;
  description: string;
  files: SavedFile[];
  savedAt: number; // Unix ms
  updatedAt: number;
}

function storageKey(userId: string) {
  return `jp_projects_${userId}`;
}

export function loadProjects(userId: string): SavedProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProjects(userId: string, projects: SavedProject[]): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(projects));
  } catch { /* quota */ }
}

export function upsertProject(
  userId: string,
  project: Omit<SavedProject, "id" | "savedAt" | "updatedAt"> & { id?: string }
): SavedProject {
  const projects = loadProjects(userId);
  const now = Date.now();
  const existing = project.id ? projects.find((p) => p.id === project.id) : null;

  const updated: SavedProject = existing
    ? { ...existing, ...project, id: existing.id, savedAt: existing.savedAt, updatedAt: now }
    : { ...project, id: crypto.randomUUID(), savedAt: now, updatedAt: now };

  const filtered = projects.filter((p) => p.id !== updated.id);
  saveProjects(userId, [updated, ...filtered]);
  return updated;
}

export function deleteProject(userId: string, projectId: string): void {
  const projects = loadProjects(userId).filter((p) => p.id !== projectId);
  saveProjects(userId, projects);
}
