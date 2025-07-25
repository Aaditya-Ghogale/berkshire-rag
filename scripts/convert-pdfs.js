const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function convertPdfsToText() {
  const dataDir = './data';
  const pdfFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.pdf'));
  
  console.log(`Found ${pdfFiles.length} PDF files to convert`);
  
  for (const pdfFile of pdfFiles) {
    const pdfPath = path.join(dataDir, pdfFile);
    const txtPath = path.join(dataDir, pdfFile.replace('.pdf', '.txt'));
    
    if (!fs.existsSync(txtPath)) {
      console.log(`Converting ${pdfFile}...`);
      
      try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const pdfData = await pdf(dataBuffer);
        
        fs.writeFileSync(txtPath, pdfData.text);
        console.log(`✅ Converted ${pdfFile} to ${pdfFile.replace('.pdf', '.txt')}`);
      } catch (error) {
        console.error(`❌ Error converting ${pdfFile}:`, error.message);
      }
    } else {
      console.log(`⏭️ ${txtPath} already exists, skipping`);
    }
  }
}

convertPdfsToText().catch(console.error);
