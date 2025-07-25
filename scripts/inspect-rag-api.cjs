// scripts/inspect-rag-api.cjs
async function inspectRagAPI() {
  try {
    console.log('🔍 Inspecting @mastra/rag API...\n');
    
    // Import the entire module to see what's available
    const ragModule = await import('@mastra/rag');
    
    console.log('📦 Available exports:');
    Object.keys(ragModule).forEach(key => {
      console.log(`   - ${key}: ${typeof ragModule[key]}`);
    });
    
    // Check for common search function names
    const possibleSearchFunctions = ['search', 'vectorSearch', 'query', 'searchDocuments', 'findSimilar'];
    
    console.log('\n🔍 Looking for search functions:');
    possibleSearchFunctions.forEach(funcName => {
      if (ragModule[funcName]) {
        console.log(`   ✅ Found: ${funcName} (${typeof ragModule[funcName]})`);
      } else {
        console.log(`   ❌ Not found: ${funcName}`);
      }
    });
    
    console.log('\n📚 Full module structure:');
    console.log(ragModule);
    
  } catch (error) {
    console.error('❌ Error inspecting RAG module:', error);
  }
}

inspectRagAPI();
