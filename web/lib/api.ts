/**
 * Claw Code REST + SSE API client
 * Connects to the Rust axum server at NEXT_PUBLIC_CLAW_API_URL (default: http://localhost:3001)
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_CLAW_API_URL ?? "http://localhost:3001";

// ── Types ────────────────────────────────────────────────────────────────────

export interface SessionSummary {
  id: string;
  created_at: number;
  message_count: number;
}

export interface ContentBlock {
  type: "text" | "tool_use" | "tool_result";
  text?: string;
  id?: string;
  name?: string;
  input?: string;
  tool_use_id?: string;
  tool_name?: string;
  output?: string;
  is_error?: boolean;
}

export interface ConversationMessage {
  role: "user" | "assistant" | "system" | "tool";
  blocks: ContentBlock[];
  usage?: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens: number;
    cache_read_input_tokens: number;
  };
}

export interface SessionDetails {
  id: string;
  created_at: number;
  session: {
    version: number;
    messages: ConversationMessage[];
  };
}

export interface CreateSessionResponse {
  session_id: string;
}

// ── API calls ────────────────────────────────────────────────────────────────

export async function createSession(): Promise<CreateSessionResponse> {
  const res = await fetch(`${API_BASE}/sessions`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to create session: ${res.status}`);
  return res.json() as Promise<CreateSessionResponse>;
}

export async function listSessions(): Promise<SessionSummary[]> {
  const res = await fetch(`${API_BASE}/sessions`);
  if (!res.ok) throw new Error(`Failed to list sessions: ${res.status}`);
  const data = (await res.json()) as { sessions: SessionSummary[] };
  return data.sessions;
}

export async function getSession(id: string): Promise<SessionDetails> {
  const res = await fetch(`${API_BASE}/sessions/${id}`);
  if (!res.ok) throw new Error(`Failed to get session: ${res.status}`);
  return res.json() as Promise<SessionDetails>;
}

export async function sendMessage(
  sessionId: string,
  message: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Failed to send message: ${res.status}`);
}

export function streamSessionEvents(
  sessionId: string,
  onEvent: (type: string, data: unknown) => void,
  onError?: (err: Event) => void
): EventSource {
  const source = new EventSource(
    `${API_BASE}/sessions/${sessionId}/events`
  );
  source.addEventListener("snapshot", (e) => {
    try {
      onEvent("snapshot", JSON.parse((e as MessageEvent).data));
    } catch {
      /* ignore */
    }
  });
  source.addEventListener("message", (e) => {
    try {
      onEvent("message", JSON.parse((e as MessageEvent).data));
    } catch {
      /* ignore */
    }
  });
  if (onError) source.onerror = onError;
  return source;
}
