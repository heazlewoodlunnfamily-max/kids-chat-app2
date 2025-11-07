const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

let htmlContent = '';
try {
  htmlContent = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
} catch (err) {
  console.error('Error loading HTML:', err);
}

app.get('/', (req, res) => {
  res.type('text/html').send(htmlContent);
});

app.use(express.static(path.join(__dirname, 'public')));

let messages = {
  'group': [],
  'esther-mama': [],
  'esther-mummy': [],
  'esther-hilary': [],
  'esther-nan': [],
  'esther-rishy': [],
  'esther-poppy': [],
  'esther-sienna': []
};

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'load_messages', messages }));

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'new_message') {
        const newMsg = {
          id: Date.now(),
          user: msg.user,
          text: msg.text,
          chatId: msg.chatId,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toLocaleDateString()
        };
        
        const chatId = msg.chatId || 'group';
        if (!messages[chatId]) messages[chatId] = [];
        messages[chatId].push(newMsg);

        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'message', data: newMsg }));
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
