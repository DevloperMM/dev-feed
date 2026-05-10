import { getTrendingTopics } from "../../db/topics";

export const getTrendingTopicsSchema = {
  type: "function",
  function: {
    name: "getTrendingTopics",
    description: "Get the trending topic tags from the tech news database. Use this when the user asks about what's popular or trending.",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of topics to return (default: 10)",
        },
      },
      required: [],
    },
  },
};

export async function getTrendingTopicsTool(args: { limit?: number }) {
  const topics = await getTrendingTopics(args.limit ?? 10);

  return {
    success: true,
    topics: topics.map((t) => ({
      name: t.name,
      slug: t.slug,
      count: t._count.stories,
    })),
  };
}