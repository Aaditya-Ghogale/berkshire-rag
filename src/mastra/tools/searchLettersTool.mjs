// Usage: import and call searchLettersTool({ query: 'your question', topK: 5 })
import { search } from '@mastra/rag';

export async function searchLettersTool({ query, topK = 5 }) {
  const results = await search({
    query,
    limit: topK
  });
  return results.map(r => ({
    content: r.content || r.text,
    year: r.metadata?.year || r.metadata?.fileName?.match(/(19|20)\d{2}/)?.[0] || 'Unknown',
    source: r.metadata?.source || r.metadata?.fileName || 'Unknown',
    score: r.score
  }));
}

// Example usage (uncomment to test standalone):
// searchLettersTool({ query: "What is Warren Buffett's investment philosophy?", topK: 5 }).then(results => {
//   for (const r of results) {
//     console.log(`[${r.year} - ${r.source}]`, r.content.slice(0, 200), '...');
//   }
// });
