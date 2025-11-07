const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store messages by chat room
let messages = {
  'group': [],
  'esther-mama': [],
  'esther-mummy': [],
  'esther-hilary': [],
  'esther-nan': [],
  'esther-rishy': [],
  'esther-poppy': [],
  'esther-millie': []
};

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.send(JSON.stringify({
    type: 'load_messages',
    messages: messages
  }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      if (message.type === 'new_message') {
        const newMsg = {
          id: Date.now(),
          user: message.user,
          text: message.text,
          chatId: message.chatId,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toLocaleDateString()
        };
        
        const chatId = message.chatId || 'group';
        if (!messages[chatId]) {
          messages[chatId] = [];
        }
        messages[chatId].push(newMsg);
        console.log('Message saved to', chatId, ':', newMsg);

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'message',
              data: newMsg
            }));
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

app.post('/api/admin/clear', (req, res) => {
  messages = {
    'group': [],
    'esther-mama': [],
    'esther-mummy': [],
    'esther-hilary': [],
    'esther-nan': [],
    'esther-rishy': [],
    'esther-poppy': [],
    'esther-millie': []
  };
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'messages_cleared' }));
    }
  });
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
