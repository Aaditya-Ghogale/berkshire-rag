// scripts/test-vector-search.js
const path = require('path');

async function testVectorSearch() {
  try {
    console.log('🔍 Testing vector search connection...');
    
    // Try to import and test Mastra's search functionality
    try {
      const { search } = await import('@mastra/rag');
      console.log('✅ Mastra RAG module imported successfully');
      
      // Test search with a simple query
      const results = await search({
        query: 'investment philosophy',
        limit: 3
      });
      
      if (results && results.length > 0) {
        console.log(`✅ Vector search working! Found ${results.length} results:`);
        results.forEach((result, index) => {
          console.log(`${index + 1}. Year: ${result.metadata?.year || 'Unknown'}`);
          console.log(`   Source: ${result.metadata?.source || result.metadata?.fileName || 'Unknown'}`);
          console.log(`   Preview: ${(result.content || result.text || '').substring(0, 100)}...`);
          console.log(`   Score: ${result.score || 'N/A'}\n`);
        });
        return true;
      } else {
        console.log('⚠️ Vector search returned no results - documents may not be properly indexed');
        return false;
      }
    } catch (importError) {
      console.error('❌ Failed to import Mastra RAG:', importError.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Vector search test failed:', error);
    return false;
  }
}

async function checkDocumentCorpus() {
  const fs = require('fs');
  const dataDir = './data';
  
  console.log('📁 Checking document corpus...');
  
  if (fs.existsSync(dataDir)) {
    const files = fs.readdirSync(dataDir);
    const txtFiles = files.filter(f => f.endsWith('.txt'));
    console.log(`✅ Found ${txtFiles.length} text files in data directory`);
    
    if (txtFiles.length > 0) {
      console.log('📄 Sample files:');
      txtFiles.slice(0, 5).forEach(file => {
        const filePath = path.join(dataDir, file);
        const stats = fs.statSync(filePath);
        console.log(`   - ${file} (${stats.size} bytes)`);
      });
    }
    return txtFiles.length > 0;
  } else {
    console.log('❌ Data directory not found');
    return false;
  }
}

async function runDiagnostics() {
  console.log('🚀 Running RAG System Diagnostics\n');
  
  const hasDocuments = await checkDocumentCorpus();
  const hasVectorSearch = await testVectorSearch();
  
  console.log('\n📊 Diagnostic Summary:');
  console.log(`Documents Available: ${hasDocuments ? '✅' : '❌'}`);
  console.log(`Vector Search Working: ${hasVectorSearch ? '✅' : '❌'}`);
  
  if (hasDocuments && hasVectorSearch) {
    console.log('\n🎉 Your RAG system is ready for full functionality!');
  } else if (hasDocuments && !hasVectorSearch) {
    console.log('\n⚠️ Documents are available but vector search needs configuration');
    console.log('💡 Suggestion: Check your vector database connection and ensure ingestion completed successfully');
  } else {
    console.log('\n❌ System needs setup before full functionality is available');
  }
}

runDiagnostics().catch(console.error);
