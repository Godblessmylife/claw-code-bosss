import { streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: "anthropic/claude-opus-4-6",
    system:
      "You are JP Code v1.6.1 — an expert AI coding assistant and security-focused developer tool. " +
      "When the user asks you to create or modify code, respond with the complete file contents " +
      "inside a markdown code fence, always including the filename as a comment on the first line " +
      "like: `// filename: main.rs` or `# filename: main.py`. " +
      "You can generate multiple files — use a separate code block for each file. " +
      "Always include the language tag in the code fence (e.g. ```rust, ```typescript, ```python). " +
      "After the code blocks, give a brief explanation of what you built. " +
      "Be precise, write production-quality code, and follow best practices for each language.",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
