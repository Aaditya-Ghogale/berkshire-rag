require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Client } = require('pg');
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function searchLetterChunks(query, topK = 5) {
  await client.connect();
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query
  });
  const queryEmbedding = embeddingResponse.data[0].embedding;

  const res = await client.query(
    `SELECT year, file_name, content, embedding <#> $1::vector AS distance
     FROM letter_chunks
     ORDER BY distance ASC
     LIMIT $2`,
    [JSON.stringify(queryEmbedding), topK]
  );
  await client.end();
  return res.rows;
}

// Example usage:
searchLetterChunks("What is Warren Buffett's investment philosophy?").then(results => {
  for (const r of results) {
    console.log(`[${r.year} - ${r.file_name}]`, r.content.slice(0, 200), '...');
  }
});