import { NextResponse } from "next/server";
import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {
  const data = await req.json();

  const chatHistory = data.slice(0, data.length - 1);
  const userMessage = data[data.length - 1].content;

  const prompt = `
  Human: You will be acting as an AI Customer Support named Joe. Your goal is to give advice to users.

  Here are some important rules for the interaction:
  - Be Friendly and Polite
  - Avoid Slang or Overly Casual Language
  - Do not start with "Hi" or "Hello" in your response except for the first message.

  Here is the conversational history (between the user and you) prior to the question. It could be empty if there is no history:
  ${chatHistory}

  Here is the user's question: 
  ${userMessage}

  Respond to the user's question directly, without using any XML tags or special formatting. Just provide the response as plain text.
  `;

  const input = {
    modelId: "anthropic.claude-v2:1",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      prompt: `Human: ${prompt}\n\nAssistant:`,
      max_tokens_to_sample: 4000,
      temperature: 0,
      stop_sequences: ["\n\nHuman:"],
    }),
  };

  const command = new InvokeModelWithResponseStreamCommand(input);

  try {
    const response = await client.send(command);
    const completion = response.body;
    if (completion) {
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of completion) {
              const decodedChunk = new TextDecoder("utf-8").decode(
                chunk.chunk.bytes
              );
              const parsedChunk = JSON.parse(decodedChunk);
              if (parsedChunk.type === "completion") {
                controller.enqueue(parsedChunk.completion);
              }
            }
          } catch (error) {
            controller.error(error);
          } finally {
            controller.close();
          }
        },
      });
      return new NextResponse(stream);
    } else {
      return new NextResponse(
        "An error occurred while processing your request."
      );
    }
  } catch (error) {
    console.error("Error invoking Bedrock:", error);
    return new NextResponse("An error occurred while processing your request.");
  }
}
