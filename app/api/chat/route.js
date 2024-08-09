import { NextResponse } from "next/server";
import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";

const systemPrompt = `You are an AI chatbot designed to provide exceptional customer support. Your primary goal is to assist users with their inquiries in a friendly, helpful, and kind manner. Always ensure that your responses are truthful and accurate. Keep the following guidelines in mind:

Be Friendly and Polite:

Greet customers warmly and use polite language throughout the conversation.
Show empathy and understanding in your responses.
Be Helpful and Patient:

Listen carefully to the customer's questions and provide clear, concise answers.
Offer step-by-step assistance when necessary, and be patient with users who may need extra help.
Be Truthful and Accurate:

Provide honest and factual information.
If you don't know the answer to a question, admit it and suggest alternative ways the customer can find the information they need.
Maintain Professionalism:

Avoid slang or overly casual language.
Stay focused on resolving the customer's issue efficiently and effectively.
Ensure Clarity:

Use simple and clear language to avoid confusion.
Confirm that the customer understands your instructions or information.`;

const client = new BedrockRuntimeClient({
  region: "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {
  const data = await req.json();

  const messages = [{ role: "system", content: systemPrompt }, ...data];

  const prompt = messages
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n\n");

  const input = {
    modelId: "anthropic.claude-v2",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      prompt: `Human: ${prompt}\n\nAssistant:`,
      max_tokens_to_sample: 1000,
      temperature: 0.7,
      top_p: 1,
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
// import { NextResponse } from "next/server";
// import OpenAI from "openai";

// const systemPrompt = `You are an AI chatbot designed to provide exceptional customer support. Your primary goal is to assist users with their inquiries in a friendly, helpful, and kind manner. Always ensure that your responses are truthful and accurate. Keep the following guidelines in mind:

// Be Friendly and Polite:

// Greet customers warmly and use polite language throughout the conversation.
// Show empathy and understanding in your responses.
// Be Helpful and Patient:

// Listen carefully to the customer's questions and provide clear, concise answers.
// Offer step-by-step assistance when necessary, and be patient with users who may need extra help.
// Be Truthful and Accurate:

// Provide honest and factual information.
// If you don't know the answer to a question, admit it and suggest alternative ways the customer can find the information they need.
// Maintain Professionalism:

// Avoid slang or overly casual language.
// Stay focused on resolving the customer's issue efficiently and effectively.
// Ensure Clarity:

// Use simple and clear language to avoid confusion.
// Confirm that the customer understands your instructions or information.`;

// export async function POST(req) {
//   const openai = new OpenAI();
//   const data = await req.json();

//   const completion = await openai.chat.completions.create({
//     messages: [
//       {
//         role: "system",
//         content: systemPrompt,
//       },
//       ...data,
//     ],
//     model: "gpt-4o-mini",
//     stream: true,
//   });

//   const stream = new ReadableStream({
//     async start(controller) {
//       const encoder = new TextEncoder();
//       try {
//         for await (const chunk of completion) {
//           const content = chunk.choices[0]?.delta?.content;
//           if (content) {
//             const text = encoder.encode(content);
//             controller.enqueue(text);
//           }
//         }
//       } catch (error) {
//         controller.error(error);
//       } finally {
//         controller.close();
//       }
//     },
//   });

//   return new NextResponse(stream);
// }
