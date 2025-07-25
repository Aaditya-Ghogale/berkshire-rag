// Usage: require and call searchLettersTool({ query: 'your question', topK: 5 })
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function searchLettersTool({ query, topK = 5 }) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
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
  return res.rows.map(r => ({
    content: r.content,
    year: r.year,
    source: r.file_name,
    distance: r.distance
  }));
}

// Example usage (uncomment to test standalone):
// searchLettersTool({ query: "What is Warren Buffett's investment philosophy?", topK: 5 }).then(results => {
//   for (const r of results) {
//     console.log(`[${r.year} - ${r.source}]`, r.content.slice(0, 200), '...');
//   }
// });

module.exports = { searchLettersTool };
