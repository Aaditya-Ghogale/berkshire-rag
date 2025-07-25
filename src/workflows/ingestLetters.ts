import { createWorkflow, createStep } from '@mastra/core/workflows';
import { MDocument } from '@mastra/rag';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';


console.log("🚀 ingestLetters.ts loaded");

const loadStep = createStep({
  id: 'loadLetters',
  description: 'Load text files into MDocument format with enhanced metadata',
  inputSchema: z.object({}),
  outputSchema: z.object({ 
    docs: z.array(z.any())
  }),
  execute: async () => {
    try {
      const dataPath = path.resolve(process.cwd(), 'data');
      console.log(`🔍 Looking for files in: ${dataPath}`);
      
      const files = await fs.readdir(dataPath);
      const txtFiles = files.filter(f => f.endsWith('.txt'));
      console.log(`📄 Text files found: ${txtFiles.length}`);
      
      if (txtFiles.length === 0) {
        console.warn('⚠️ No .txt files found. Convert PDFs first using the conversion script.');
        return { docs: [] };
      }
      
      const docs = await Promise.all(
        txtFiles.map(async f => {
          try {
            const filePath = path.join(dataPath, f);
            const text = await fs.readFile(filePath, 'utf-8');
            const year = f.match(/(\d{4})/)?.[1] || 'Unknown';
            
            console.log(`📖 Loaded ${f}: ${text.length} characters, Year: ${year}`);
            
            return MDocument.fromText(text, {
              fileName: f,
              year: year,
              source: `Berkshire Hathaway ${year} Letter`,
              type: 'shareholder_letter',
              processed_at: new Date().toISOString(),
              document_length: text.length
            });
          } catch (error) {
            console.error(`❌ Error processing ${f}:`, error);
            return null;
          }
        })
      );
      
      const validDocs = docs.filter(doc => doc !== null);
      console.log(`✅ Successfully loaded ${validDocs.length} documents`);
      
      return { docs: validDocs };
    } catch (error) {
      console.error('❌ Error loading files:', error);
      return { docs: [] };
    }
  },
});

const chunkStep = createStep({
  id: 'chunkAndEmbed',
  description: 'Chunk documents with optimal settings for financial content',
  inputSchema: z.object({ docs: z.array(z.any()) }),
  outputSchema: z.object({ result: z.string() }),
  execute: async ({ inputData }) => {
    console.log(`🔄 Processing ${inputData.docs.length} documents...`);
    
    if (inputData.docs.length === 0) {
      return { result: '❌ No documents to process' };
    }
    
    try {
      let totalChunks = 0;
      
      for (const doc of inputData.docs) {
        const chunks = await doc.chunk({
          size: 1000,
          overlap: 200,
          separator: '\n\n'
        });
        
        console.log(`📝 Document ${doc.metadata.fileName}: ${chunks.length} chunks created`);
        
        for (const chunk of chunks) {
          await chunk.embedAndStore();
        }
        
        totalChunks += chunks.length;
      }
      
      console.log(`✅ Created and stored ${totalChunks} total chunks`);
      return { 
        result: `✅ Successfully processed ${inputData.docs.length} documents into ${totalChunks} searchable chunks`
      };
    } catch (error) {
      console.error('❌ Error during chunking and embedding:', error);
      return { 
        result: `❌ Error processing documents: ${error.message}` 
      };
    }
  },
});

export const ingestLetters = createWorkflow({
  id: 'ingestLetters',
  inputSchema: z.object({}),
  outputSchema: z.object({ result: z.string() }),
})

  .then(loadStep)
  .then(chunkStep)
  .commit();
