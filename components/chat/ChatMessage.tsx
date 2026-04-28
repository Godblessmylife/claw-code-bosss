import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMsg } from "@/lib/useSession";
import { Zap, User, Wrench } from "lucide-react";

interface Props {
  message: ChatMsg;
}

const roleConfig = {
  assistant: {
    icon: Zap,
    label: "Claw",
    iconClass: "text-[--accent] bg-[--accent-dim]",
    bubbleClass: "bg-[--surface] border border-[--border]",
  },
  user: {
    icon: User,
    label: "You",
    iconClass: "text-[--foreground] bg-[--surface-raised]",
    bubbleClass: "bg-[--surface-raised] border border-[--border-subtle]",
  },
  tool: {
    icon: Wrench,
    label: "Tool",
    iconClass: "text-[--muted] bg-[--surface-raised]",
    bubbleClass: "bg-transparent border border-[--border-subtle]",
  },
  system: {
    icon: Zap,
    label: "System",
    iconClass: "text-[--muted] bg-[--surface-raised]",
    bubbleClass: "bg-transparent border border-[--border-subtle]",
  },
} as const;

function formatText(text: string): React.ReactNode {
  // Simple inline code + code blocks
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${i}`}
            className="bg-[--surface-raised] border border-[--border] rounded-md px-3.5 py-3 my-2 overflow-x-auto"
          >
            <code className="text-xs font-mono text-[--foreground] leading-relaxed">
              {codeLines.join("\n")}
            </code>
          </pre>
        );
        codeLines = [];
        codeLang = "";
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
      }
    } else if (inCodeBlock) {
      codeLines.push(line);
    } else {
      // Inline code
      const parts = line.split(/(`[^`]+`)/g);
      const rendered = parts.map((part, j) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code
            key={j}
            className="text-xs font-mono bg-[--surface-raised] border border-[--border] rounded px-1 py-0.5 text-[--accent]"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          <span key={j}>{part}</span>
        )
      );
      elements.push(
        <span key={`line-${i}`} className="block">
          {rendered}
        </span>
      );
    }
  }

  // Flush unclosed code block
  if (inCodeBlock && codeLines.length > 0) {
    elements.push(
      <pre
        key="code-unclosed"
        className="bg-[--surface-raised] border border-[--border] rounded-md px-3.5 py-3 my-2 overflow-x-auto"
      >
        <code className="text-xs font-mono text-[--foreground] leading-relaxed">
          {codeLines.join("\n")}
        </code>
      </pre>
    );
  }

  return <>{elements}</>;
}

export function ChatMessageItem({ message }: Props) {
  const role = message.role in roleConfig ? message.role : "system";
  const cfg = roleConfig[role as keyof typeof roleConfig];
  const Icon = cfg.icon;
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3",
        isUser && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-full shrink-0 mt-0.5",
          cfg.iconClass
        )}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "rounded-xl px-3.5 py-2.5 text-sm leading-relaxed max-w-[80%]",
          cfg.bubbleClass,
          isUser ? "text-right" : "text-left"
        )}
      >
        <div className="prose-chat text-[--foreground]">
          {formatText(message.text)}
        </div>
        <div
          className={cn(
            "text-[10px] mt-1.5 text-[--muted]",
            isUser ? "text-right" : "text-left"
          )}
        >
          {cfg.label}
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-3">
      <div className="flex items-center justify-center w-7 h-7 rounded-full shrink-0 mt-0.5 text-[--accent] bg-[--accent-dim]">
        <Zap className="w-3.5 h-3.5" />
      </div>
      <div className="rounded-xl px-3.5 py-3 bg-[--surface] border border-[--border]">
        <div className="flex items-center gap-1 h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="typing-dot w-1.5 h-1.5 rounded-full bg-[--muted]"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
