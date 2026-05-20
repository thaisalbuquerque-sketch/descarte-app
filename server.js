const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  console.error('\n❌ ERRO: Variável GEMINI_API_KEY não definida!');
  console.error('   Adicione GEMINI_API_KEY nas variáveis de ambiente.\n');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon',
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'POST' && req.url === '/api/claude') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);

        // Converter formato Anthropic → Gemini
        const parts = [];
        const msg = payload.messages[0];

        if (Array.isArray(msg.content)) {
          for (const block of msg.content) {
            if (block.type === 'text') {
              parts.push({ text: block.text });
            } else if (block.type === 'image') {
              parts.push({
                inline_data: {
                  mime_type: block.source.media_type,
                  data: block.source.data
                }
              });
            }
          }
        } else {
          parts.push({ text: msg.content });
        }

        const geminiPayload = JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.2
          }
        });

        const options = {
          hostname: 'generativelanguage.googleapis.com',
          path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(geminiPayload)
          }
        };

        const proxyReq = https.request(options, proxyRes => {
          let data = '';
          proxyRes.on('data', chunk => data += chunk);
          proxyRes.on('end', () => {
            try {
              const geminiResp = JSON.parse(data);
              // Converter resposta Gemini → formato Anthropic
              const text = geminiResp?.candidates?.[0]?.content?.parts?.[0]?.text || '';
              const anthropicFormat = {
                content: [{ type: 'text', text }]
              };
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(anthropicFormat));
            } catch (e) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Erro ao processar resposta do Gemini', detail: data }));
            }
          });
        });

        proxyReq.on('error', err => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        });

        proxyReq.write(geminiPayload);
        proxyReq.end();

      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload inválido', detail: e.message }));
      }
    });
    return;
  }

  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, 'public', filePath);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      return res.end('Não encontrado');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`\n✅ Servidor Gemini rodando na porta ${PORT}`);
  console.log(`   Local: http://localhost:${PORT}\n`);
});
