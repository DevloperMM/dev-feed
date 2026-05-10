import "dotenv/config";
import OpenAI from "openai";

if (!process.env.OPENAI_TOKEN) {
  throw new Error("OPENAI_TOKEN is required");
}
if (!process.env.OPENAI_ENDPOINT) {
  throw new Error("OPENAI_ENDPOINT is required");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_TOKEN,
  baseURL: process.env.OPENAI_ENDPOINT,
});

export const OPENAI_EMBEDDING_MODEL = "text-embedding-3-small";
export const OPENAI_CHAT_MODEL = "gpt-4o-mini";