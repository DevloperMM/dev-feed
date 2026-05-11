import { searchKnowledgeBase } from './tools/searchKnowledgeBase'
import { getTrendingTopics } from './tools/getTrendingTopics'
import { getStoriesBySource } from './tools/getStoriesBySource'

export const runTool = async (
  toolCall: { function: { name: string; arguments: string } },
  userMessage: string,
) => {
  const input = {
    userMessage,
    toolArgs: JSON.parse(toolCall.function.arguments ?? '{}'),
  }

  switch (toolCall.function.name) {
    case 'searchKnowledgeBase':
      return searchKnowledgeBase(input)
    case 'getTrendingTopics':
      return getTrendingTopics(input)
    case 'getStoriesBySource':
      return getStoriesBySource(input)
    default:
      return `Unknown tool: ${toolCall.function.name}`
  }
}