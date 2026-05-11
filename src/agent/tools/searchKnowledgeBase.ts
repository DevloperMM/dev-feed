import { z } from 'zod'
import type { ToolFn } from '../../types'
import { retrieve } from '../../rag/retrieval/retriever'

export const searchKnowledgeBaseDefinition = {
  name: 'searchKnowledgeBase',
  description: 'Search the TechPulse knowledge base for tech discussions matching a query',
  parameters: z.object({
    query: z.string().describe('The search query'),
  }),
}

type Args = z.infer<typeof searchKnowledgeBaseDefinition.parameters>

export const searchKnowledgeBase: ToolFn<Args, string> = async ({ toolArgs }) => {
  const { context, stories } = await retrieve(toolArgs.query, 5)
  if (stories.length === 0) {
    return 'No matching stories found.'
  }
  return context
}