import { zodFunction } from 'openai/helpers/zod'
import { z } from 'zod'
import { openai, OPENAI_CHAT_MODEL } from '../config/openai'
import { systemPrompt } from './systemPrompt'
import type { AIMessage } from '../types'

export const runLLM = async ({
  messages,
  tools = [],
  stream = false,
}: {
  messages: AIMessage[]
  tools?: { name: string; description: string; parameters: z.ZodTypeAny }[]
  stream?: boolean
}) => {
  const formattedTools = tools.map(zodFunction)

  return openai.chat.completions.create({
    model: OPENAI_CHAT_MODEL,
    temperature: 0.1,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    ...(formattedTools.length > 0 && {
      tools: formattedTools,
      tool_choice: 'auto',
      parallel_tool_calls: false,
    }),
    ...(stream && { stream: true }),
  })
}