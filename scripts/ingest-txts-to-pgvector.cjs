// Ingest .txt files from ./data into Postgres with OpenAI embeddings
// Usage: node scripts/ingest-txts-to-pgvector.js

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const DATA_DIR = path.resolve(__dirname, '../data');
const EMBEDDING_DIM = 1536; 

const client = new Client({ connectionString: process.env.DATABASE_URL });

function chunkText(text, chunkSize = 800, overlap = 150) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
}

function extractYearFromFileName(fileName) {
  const match = fileName.match(/(19|20)\d{2}/);
  return match ? parseInt(match[0], 10) : null;
}

async function embedText(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  });
  return response.data[0].embedding;
}

(async () => {
  await client.connect();
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.txt'));
  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const text = fs.readFileSync(filePath, 'utf8');
    const year = extractYearFromFileName(file);
    const chunks = chunkText(text);
    for (const chunk of chunks) {
      if (chunk.trim().length < 10) continue; // skip tiny chunks
      try {
        const embedding = await embedText(chunk);
        await client.query(
          'INSERT INTO letter_chunks (year, file_name, content, embedding) VALUES ($1, $2, $3, $4)',
          [year, file, chunk, embedding]
        );
        console.log(`Inserted chunk from ${file}`);
      } catch (err) {
        console.error(`Error embedding chunk from ${file}:`, err.message);
      }
    }
  }
  await client.end();
  console.log('Ingestion complete.');
})();
