import { createWorkersAI } from "workers-ai-provider";

import { streamText, UIMessage, convertToModelMessages } from "ai";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const workersai = createWorkersAI({
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
      apiKey: process.env.CLOUDFLARE_API_TOKEN!,
    });

    const result = streamText({
      model: workersai("@cf/qwen/qwen3-30b-a3b-fp8"),
      system: "You are a helpful assistant that answers the user's questions.",
      messages: await convertToModelMessages(messages),
      onError(error) {
        console.error("streamText error:", error);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    return new Response("Fail when streaming chat response", { status: 500 });
  }
}
