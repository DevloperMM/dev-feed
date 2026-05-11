import { z } from 'zod'
import type { ToolFn } from '../../types'
import { fetchStories } from '../../db/stories'

export const getStoriesBySourceDefinition = {
  name: 'getStoriesBySource',
  description: 'Get stories from a specific source (HN, Reddit, or GitHub)',
  parameters: z.object({
    source: z.enum(['HN', 'REDDIT', 'GITHUB']).describe('The source to filter by'),
    page: z.number().nullable().describe('Page number (default: 1)'),
    limit: z.number().nullable().describe('Number of stories per page (default: 10)'),
  }),
}

type Args = z.infer<typeof getStoriesBySourceDefinition.parameters>

export const getStoriesBySource: ToolFn<Args, string> = async ({ toolArgs }) => {
  const sourceMap: Record<string, 'HN' | 'REDDIT' | 'GITHUB'> = {
    HN: 'HN',
    REDDIT: 'REDDIT',
    GITHUB: 'GITHUB',
  }

  const stories = await fetchStories({
    source: sourceMap[toolArgs.source],
    page: toolArgs.page ?? 1,
    limit: toolArgs.limit ?? 10,
  })

  if (stories.length === 0) {
    return 'No stories found for this source.'
  }

  return stories
    .map((s) => `[${s.source}] ${s.title} - ${s.url ?? 'no URL'}`)
    .join('\n')
}