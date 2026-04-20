const fs = require('fs');
const path = require('path');

async function listModels() {
  try {
    const envPath = path.join(__dirname, '..', 'apps', 'backend', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    const apiKey = match ? match[1].trim() : null;

    if (!apiKey) return;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    
    if (data.models) {
        const models = data.models
            .filter(m => m.supportedGenerationMethods.includes('generateContent'))
            .map(m => m.name);
        console.log(models);
    }
  } catch (error) {}
}
listModels();
