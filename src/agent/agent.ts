import type { ChatCompletion } from 'openai/resources/chat/completions'
import { runLLM } from './llm'
import { runTool } from './toolRunner'
import { searchKnowledgeBaseDefinition } from './tools/searchKnowledgeBase'
import { getTrendingTopicsDefinition } from './tools/getTrendingTopics'
import { getStoriesBySourceDefinition } from './tools/getStoriesBySource'
import type { AIMessage } from '../types'

export const runAgent = async (messages: AIMessage[]) => {
  const tools = [
    searchKnowledgeBaseDefinition,
    getTrendingTopicsDefinition,
    getStoriesBySourceDefinition,
  ]

  const history = [...messages]

  for (let step = 0; step < 10; step++) {
    const response = await runLLM({ messages: history, tools }) as ChatCompletion
    const message = response.choices[0].message
    
    if (message.tool_calls && message.tool_calls.length > 0) {
      history.push(message)
      for (const toolCall of message.tool_calls) {
        const toolResponse = await runTool(toolCall, messages[messages.length - 1].content as string)
        history.push({ 
          role: 'tool', 
          tool_call_id: toolCall.id, 
          content: toolResponse 
        })
      }
      continue
    }

    // No tool calls, stream the final response
    return runLLM({ messages: history, stream: true })
  }

  return runLLM({ messages: history, stream: true })
}