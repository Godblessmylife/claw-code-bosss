import { streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: "anthropic/claude-opus-4-6",
    system:
      "You are Claw — an expert AI coding assistant, a fork of Claude Code. " +
      "You help developers write, review, debug, and understand code. " +
      "When showing code, always use markdown code fences with the language tag. " +
      "Be concise, precise, and always ready to dive deep into technical details. " +
      "You work inside Claw Code — an open-source AI coding agent built on top of Claude.",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
