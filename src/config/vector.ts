import "dotenv/config";
import { Index } from "@upstash/vector";

if (!process.env.UPSTASH_VECTOR_REST_URL) {
  throw new Error("UPSTASH_VECTOR_REST_URL is required");
}
if (!process.env.UPSTASH_VECTOR_REST_TOKEN) {
  throw new Error("UPSTASH_VECTOR_REST_TOKEN is required");
}

export const vector = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});