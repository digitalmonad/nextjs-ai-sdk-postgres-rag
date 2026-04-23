import { createWorkersAI } from "workers-ai-provider";

import { auth } from "@clerk/nextjs/server";

import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  InferUITools,
  UIDataTypes,
  stepCountIs,
} from "ai";

import { z } from "zod";
import { searchDocuments } from "@/lib/search";

const tools = {
  searchKnowledgeBase: tool({
    description: "Search the knowledge base for relevant information",
    inputSchema: z.object({
      query: z.string().describe("The search query to find relevant documents"),
    }),
    execute: async ({ query }) => {
      try {
        // Search the vector database
        const results = await searchDocuments(query, 3, 0.5);

        if (results.length === 0) {
          return "No relevant information found in the knowledge base.";
        }

        // Format results for the AI
        const formattedResults = results
          .map((r, i) => `[${i + 1}] ${r.content}`)
          .join("\n\n");

        return formattedResults;
      } catch (error) {
        console.error("Search error:", error);
        return "Error searching the knowledge base.";
      }
    },
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const { messages }: { messages: ChatMessage[] } = await req.json();

    const workersai = createWorkersAI({
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
      apiKey: process.env.CLOUDFLARE_API_TOKEN!,
    });

    const result = streamText({
      model: workersai("@cf/qwen/qwen3-30b-a3b-fp8"),
      system: `You are a helpful assistant with access to a knowledge base. 
          When users ask questions, always search the knowledge base for relevant information!.
          Always search before answering if the question might relate to uploaded documents.
          Base your answers on the search results when available. Give concise answers that correctly answer what the user is asking for. Do not flood them with all the information from the search results.`,
      messages: await convertToModelMessages(messages),
      stopWhen: stepCountIs(5),
      toolChoice: "auto",
      tools,
      onError(error) {
        console.error("streamText error:", error);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response("Fail when streaming chat response", { status: 500 });
  }
}
