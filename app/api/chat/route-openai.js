import { NextResponse } from "next/server";
import OpenAI from "openai";

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

export async function POST(req) {
  const openai = new OpenAI();
  const data = await req.json();

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...data,
    ],
    model: "gpt-4o-mini",
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
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
}
