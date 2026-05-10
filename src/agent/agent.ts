import { openai, OPENAI_CHAT_MODEL } from "../config/openai";
import type { ChatMessage } from "../types";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";
import {
  searchKnowledgeBase,
  searchKnowledgeBaseSchema,
} from "./tools/searchKnowledgeBase";
import {
  getTrendingTopicsTool,
  getTrendingTopicsSchema,
} from "./tools/getTrendingTopics";
import {
  getStoriesBySourceTool,
  getStoriesBySourceSchema,
} from "./tools/getStoriesBySource";
import { streamAnswer } from "../rag/generation/generator";

const MAX_ITERATIONS = 5;

const tools = [
  { schema: searchKnowledgeBaseSchema, execute: searchKnowledgeBase },
  { schema: getTrendingTopicsSchema, execute: getTrendingTopicsTool },
  { schema: getStoriesBySourceSchema, execute: getStoriesBySourceTool },
];

export async function runAgent(messages: ChatMessage[]): Promise<ReadableStream<Uint8Array>> {
  const conversation: ChatCompletionMessageParam[] = [...messages] as ChatCompletionMessageParam[];

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      messages: conversation,
      tools: tools.map((t) => t.schema as unknown as ChatCompletionTool),
      tool_choice: "auto",
    });

    const choice = response.choices[0];
    const assistantMessage = choice.message;

    conversation.push(assistantMessage);

    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      // No tool calls - stream final answer
      const lastMessage = messages[messages.length - 1].content as string;
      const context = assistantMessage.content || "";
      return streamAnswer(lastMessage, context);
    }

    // Execute tool calls
    for (const toolCall of assistantMessage.tool_calls) {
      if (toolCall.type !== "function") continue;

      const tool = tools.find((t) => t.schema.function.name === toolCall.function.name);
      if (!tool) continue;

      const args = JSON.parse(toolCall.function.arguments);
      const result = await tool.execute(args);

      conversation.push({
        role: "tool",
        content: JSON.stringify(result),
        tool_call_id: toolCall.id,
      });
    }
  }

  // Max iterations reached - return final response
  const lastUserMessage = messages[messages.length - 1].content as string;
  return streamAnswer(lastUserMessage, "Maximum tool iterations reached.");
}