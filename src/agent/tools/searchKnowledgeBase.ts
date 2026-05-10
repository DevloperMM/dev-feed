import { retrieve } from "../../rag/retrieval/retriever";

export const searchKnowledgeBaseSchema = {
  type: "function",
  function: {
    name: "searchKnowledgeBase",
    description: "Search the tech news knowledge base for stories matching a query. Use this when the user asks about specific topics, technologies, or news.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query (e.g., 'Rust programming', 'AI news', 'TypeScript updates')",
        },
      },
      required: ["query"],
    },
  },
};

export async function searchKnowledgeBase(args: { query: string }) {
  const { context, stories } = await retrieve(args.query, 5);

  if (stories.length === 0) {
    return { success: false, message: "No matching stories found." };
  }

  return {
    success: true,
    context,
    stories: stories.map((s) => ({
      title: s.title,
      source: s.source,
      url: s.url,
    })),
  };
}