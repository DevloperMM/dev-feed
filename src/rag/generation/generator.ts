import { openai, OPENAI_CHAT_MODEL } from "../../config/openai";
import { SYSTEM_PROMPT, buildUserMessage } from "./prompts";

export async function* generateAnswer(
  query: string,
  context: string
): AsyncGenerator<string, void, unknown> {
  const userMessage = buildUserMessage(query, context);

  const stream = await openai.chat.completions.create({
    model: OPENAI_CHAT_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    stream: true,
    temperature: 0.7,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

export function streamAnswer(query: string, context: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of generateAnswer(query, context)) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return stream;
}