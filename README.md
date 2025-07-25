# Berkshire Hathaway RAG Assignment

This project demonstrates a Retrieval-Augmented Generation (RAG) pipeline for making Berkshire Hathaway shareholder letters searchable and answerable by an AI agent. It includes both a custom ingestion pipeline using OpenAI embeddings and Postgres (pgvector), and a Mastra-native ingestion and agent workflow.

---

## Project Structure

- `data/` — Contains the .txt files of shareholder letters (one per year).
- `scripts/ingest-txts-to-pgvector.cjs` — Script to ingest .txt files into Postgres using OpenAI embeddings.
- `src/workflows/ingestLetters.ts` — (Mastra) Workflow for ingesting and chunking documents for RAG.
- `src/mastra/agents/buffettAgent.ts` — (Mastra) Agent for searching the ingested data.
- `mastra.config.mjs` — Mastra configuration file.
- `.env` — Environment variables (OpenAI API key, Postgres connection string, etc).

---

## Ingestion Pipeline (OpenAI + Postgres)

- **Goal:** Convert .txt files into vector embeddings and store them in a Postgres database with pgvector.
- **How it works:**
  1. Reads all .txt files from `data/`.
  2. Splits each file into overlapping chunks.
  3. Uses OpenAI's `text-embedding-ada-002` model to embed each chunk.
  4. Stores each chunk, its metadata, and its embedding in the `letter_chunks` table in Postgres.
- **Run it:**
  ```sh
  node scripts/ingest-txts-to-pgvector.cjs
  ```
  (Requires `.env` with `OPENAI_API_KEY` and `DATABASE_URL` set.)

---

## Mastra RAG Workflow (Recommended)

- **Goal:** Use the Mastra framework to ingest, chunk, embed, and search documents natively.
- **How it works:**
  1. Loads .txt files from `data/`.
  2. Adds metadata and splits into chunks.
  3. Embeds and stores chunks using Mastra's built-in tools.
  4. Enables agent-based search with citations.
- **Run ingestion:**
  ```sh
  npx mastra run ingestLetters
  ```
- **Test agent search:**
  Use the Mastra playground or your agent endpoint to ask questions about the letters.

---

## Why Chunk Documents?
- Large documents are split into smaller, overlapping pieces (chunks) so the AI can retrieve and cite only the most relevant parts.
- Improves search accuracy and allows for precise, cited answers.

---

## Troubleshooting
- If Mastra CLI does not detect workflows, ensure:
  - Your workflow files are in `src/workflows/`.
  - Your `mastra.config.mjs` points to the correct folder.
  - TypeScript files are compiled to JavaScript if needed.
- For Postgres ingestion, ensure your database is running and the `letter_chunks` table exists with a pgvector column.

---

## Environment Variables
Create a `.env` file in the project root with:
```
OPENAI_API_KEY=your-openai-key
DATABASE_URL=your-postgres-connection-string
```

---

## Summary
- This project sets up a full RAG pipeline for Berkshire Hathaway letters.
- You can ingest, chunk, embed, and search documents using either a custom script or the Mastra framework.
- The Mastra approach is recommended for full agent and workflow support.

---

## Contact
For questions or help, contact the project maintainer or refer to the Mastra documentation.
