"use server";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { Pinecone } from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { v4 as uuidv4 } from "uuid";
import { redirect } from "next/navigation";

const EMBED_MODEL = "text-embedding-3-small";
const INDEX_NAME = "ai-customer-support";
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const pineconeIndex = pc.index(INDEX_NAME);
import { sql } from "@vercel/postgres";

// Let the model study the Youtube video
export async function feedModel(prevState, url) {
  // await pineconeIndex.deleteAll({ deleteAll: true, namespace: "default" });
  let videoId;
  try {
    // Check if the URL is a valid Youtube URL
    videoId = YoutubeLoader.getVideoID(url);
  } catch (error) {
    return { message: "Invalid Youtube URL" };
  }

  const isExisting = await urlExists(url);
  if (!isExisting) {
    await storeUrl(url);
    try {
      const texts = await getYoutubeTranscript(videoId);
      const docs = await getTextSplitter(texts);
      await insertDataToPinecone(docs);
    } catch (error) {
      console.log("Error feeding model:", error);
      await removeUrl(url);

      if (
        error.message.includes(
          "Failed to get YouTube video transcription: [YoutubeTranscript]"
        )
      ) {
        return { message: "This video does not have transcripts." };
      }

      return { message: "Error feeding model." };
    }
  }

  redirect("/chatbot/youtube");
}

async function getYoutubeTranscript(videoId) {
  const loader = new YoutubeLoader({ videoId: videoId });

  const docs = await loader.load();
  return docs;
}

async function getTextSplitter(texts) {
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const textToSplit = texts;
  const docs = await textSplitter.splitDocuments(textToSplit);
  return docs;
}

async function insertDataToPinecone(docs) {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    model: EMBED_MODEL,
  });

  for (const doc of docs) {
    const embedding = await embeddings.embedQuery(doc.pageContent);
    await pineconeIndex.upsert([
      {
        id: uuidv4(),
        values: embedding,
        metadata: {
          text: doc.pageContent,
          source: doc.metadata.source,
        },
      },
    ]);
  }
}

async function urlExists(url) {
  try {
    const dbURL = await sql`SELECT * FROM youtube_urls WHERE url = ${url}`;
    return dbURL.rows.length > 0;
  } catch (error) {
    console.log(error);
  }
}

async function storeUrl(url) {
  try {
    await sql`INSERT INTO youtube_urls (url) VALUES (${url})`;
  } catch (error) {
    console.log(error);
  }
}

async function removeUrl(url) {
  try {
    await sql`DELETE FROM youtube_urls WHERE url = ${url}`;
  } catch (error) {
    console.log(error);
  }
}

function isValidYoutubeUrl(url) {
  const youtubeRegex =
    /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/watch\?v=.+$/.test(url);

  return youtubeRegex;
}
