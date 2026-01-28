
import https from 'https';
import path from 'path';
import fs from 'fs';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

const apiKey = process.env.OPENROUTER_KEY;
if (!apiKey) {
    console.error("No API key found!");
    process.exit(1);
}

const postData = JSON.stringify({
    model: 'arcee-ai/trinity-large-preview:free',
    messages: [
        { role: 'user', content: 'Say hello' }
    ]
});

console.log('Testing OpenRouter connection with model: arcee-ai/trinity-large-preview:free');

const options = {
    hostname: 'openrouter.ai',
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://forthix-chatbot.vercel.app',
        'X-Title': 'Forthix Chatbot',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Body:', data);
    });
});

req.on('error', (e) => {
    console.error('Request Error:', e);
});

req.write(postData);
req.end();
