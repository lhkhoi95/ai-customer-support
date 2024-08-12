const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();

const INDEX_NAME = "ai-customer-support";
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const pineconeIndex = pc.index(INDEX_NAME);

async function deleteVectors() {
  await pineconeIndex.deleteAll({ deleteAll: true, namespace: "default" });
}

function main() {
  deleteVectors().then(() => {
    console.log("All vectors have been deleted.");
  });
}

main();
