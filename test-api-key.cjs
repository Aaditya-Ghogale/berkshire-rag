// test-api-key.js
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testApiKey() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: "Say hello" }],
      max_tokens: 10
    });
    console.log("✅ API Key works:", response.choices[0].message.content);
  } catch (error) {
    console.error("❌ API Key error:", error.message);
  }
}

testApiKey();
