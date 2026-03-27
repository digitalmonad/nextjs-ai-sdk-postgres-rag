import { embed, embedMany } from "ai";
import { createWorkersAI } from "workers-ai-provider";

//https://github.com/cloudflare/ai/tree/main/packages/workers-ai-provider

//https://developers.cloudflare.com/workers-ai/models/qwen3-embedding-0.6b/

export async function generateEmbedding(text: string): Promise<number[]> {
  const input = text.replaceAll("\n", " ");

  const workersai = createWorkersAI({
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    apiKey: process.env.CLOUDFLARE_API_TOKEN!,
  });

  const { embedding } = await embed({
    model: workersai.textEmbedding("@cf/qwen/qwen3-embedding-0.6b"),
    value: input,
  });

  return embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const inputs = texts.map((text) => text.replaceAll("\n", " "));

  const workersai = createWorkersAI({
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    apiKey: process.env.CLOUDFLARE_API_TOKEN!,
  });

  const { embeddings } = await embedMany({
    model: workersai.textEmbedding("@cf/qwen/qwen3-embedding-0.6b"),
    values: inputs,
  });

  return embeddings;
}
