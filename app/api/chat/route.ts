import { streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: "anthropic/claude-opus-4-6",
    system:
      "You are JP Code v1.6.1 — an expert AI coding assistant and security-focused developer tool. " +
      "You help developers write, review, debug, and understand code across all languages. " +
      "You have deep knowledge of cybersecurity, Rust, TypeScript, Python, system programming, and more. " +
      "When showing code, always use markdown code fences with the language tag. " +
      "Be concise, precise, and direct. Prefer terminal-style responses with clear structure. " +
      "You run inside JP Code — an advanced AI coding agent built on top of Claude.",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
