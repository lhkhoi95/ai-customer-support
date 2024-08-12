import { NextResponse } from "next/server";
import OpenAI from "openai";
const { OpenAIEmbeddings } = require("@langchain/openai");
const { Pinecone } = require("@pinecone-database/pinecone");

const EMBED_MODEL = "text-embedding-3-small";
const INDEX_NAME = "ai-customer-support";
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const pineconeIndex = pc.index(INDEX_NAME);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `
You are an AI assistant that only uses the provided context to answer questions about a specific YouTube video. If the user is not asking a question, you can respond with 'Hi there! I can only answer questions about the videos that I was trained on. For general inquiries, please use the general Chatbot. How can I help you today?'`;

export async function POST(req) {
  const data = await req.json();
  const query = data[data.length - 1].content;
  const chatHistory = data
    .slice(0, data.length - 1)
    .map((item) => item.content)
    .join("\n");

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    model: EMBED_MODEL,
  });

  const queryEmbedding = await embeddings.embedQuery(query);

  const queryResponse = await pineconeIndex.query({
    vector: queryEmbedding,
    topK: 10,
    includeMetadata: true,
  });

  const context = queryResponse.matches
    .map((match, index) => {
      return `[${index + 1}] ${match.metadata.text}`;
    })
    .join("\n\n");

  const prompt = `You are an AI assistant that answers questions based ONLY on the following context from a YouTube video transcript. Do not use any external knowledge.

Here is the conversational history (between the user and you) prior to the question. It could be empty if there is no history:
  <history>
  ${chatHistory}
  </history>

Top 3 relevant parts of the video transcript:
<transcript>
${context}
</transcript>

Question: ${query}

Instructions:
1. Answer the question using ONLY the information provided in the context.
2. If the answer is not contained in the context, say "I don't have enough information from the video transcript to answer this question. Try asking something more specific."
3. Use citations like [1], [2], [3] to indicate which part of the context you're using for each part of your answer.
4. Do not make up or infer any information that is not explicitly stated in the context.


Answer:`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: prompt,
      },
      ...data,
    ],
    temperature: 0.5, // Lower temperature for more focused answers
    max_tokens: 300, // Limit the length of the response
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
