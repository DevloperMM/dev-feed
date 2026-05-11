import { z } from 'zod'
import type { ToolFn } from '../../types'
import { getTrendingTopics as dbGetTrendingTopics } from '../../db/topics'

export const getTrendingTopicsDefinition = {
  name: 'getTrendingTopics',
  description: 'Get the trending topic tags from the TechPulse database',
  parameters: z.object({
    limit: z.number().nullable().describe('Maximum number of topics to return (default: 10)'),
  }),
}

type Args = z.infer<typeof getTrendingTopicsDefinition.parameters>

export const getTrendingTopics: ToolFn<Args, string> = async ({ toolArgs }) => {
  const topics = await dbGetTrendingTopics(toolArgs.limit ?? 10)
  if (topics.length === 0) {
    return 'No trending topics found.'
  }
  return topics
    .map((t) => `${t.name} (${t._count.stories} stories)`)
    .join('\n')
}