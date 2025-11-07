const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

let messages = [];

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Friend Chat</title>
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}
.container {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  height: 90vh;
}
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  border-radius: 20px 20px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.users {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #f0f0f0;
  border-bottom: 2px solid #e0e0e0;
  justify-content: center;
  flex-wrap: wrap;
}
.user-btn {
  padding: 10px 15px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
}
.user-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}
.chat {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background: #fafafa;
}
.msg {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}
.msg.own {
  align-items: flex-end;
}
.bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 16px;
  word-wrap: break-word;
  font-size: 15px;
}
.msg.own .bubble {
  background: #667eea;
  color: white;
}
.msg.friend1 .bubble {
  background: #ff6b9d;
  color: white;
}
.msg.friend2 .bubble {
  background: #4ecdc4;
  color: white;
}
.msg.friend3 .bubble {
  background: #ffa502;
  color: white;
}
.sender {
  font-size: 12px;
  color: #999;
  margin: 4px 0;
  font-weight: 600;
}
.input-area {
  padding: 12px;
  background: white;
  border-top: 2px solid #e0e0e0;
  display: flex;
  gap: 8px;
}
input {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  font-size: 15px;
}
input:focus {
  outline: none;
  border-color: #667eea;
}
button {
  padding: 12px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
}
button:hover {
  background: #764ba2;
}
.emoji-btn {
  background: #fff;
  border: 2px solid #ffc107;
  color: #333;
  padding: 10px 14px;
  font-size: 20px;
}
.status {
  font-size: 12px;
  padding: 4px 8px;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  color: white;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4caf50;
  display: inline-block;
  margin-right: 4px;
}
.dot.off {
  background: #ff5252;
}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div>💬 Friend Chat</div>
    <div class="status">
      <span class="dot" id="dot"></span>
      <span id="stat">Connecting...</span>
    </div>
  </div>
  
  <div class="users" id="users"></div>
  
  <div class="chat" id="chat">
    <div style="text-align: center; color: #999;">Loading...</div>
  </div>
  
  <div class="input-area">
    <button class="emoji-btn" onclick="toggleEmoji()">😀</button>
    <input type="text" id="msg" placeholder="Type a message..." disabled>
    <button onclick="send()" disabled id="sendBtn">Send</button>
  </div>
</div>

<script>
const USERS = {
  you: 'Esther',
  friend1: 'Valley',
  friend2: 'Amaaya',
  friend3: 'Parent'
};

const EMOJIS = ['😀', '😂', '😍', '🥰', '😎', '🤗', '😭', '😤', '🤔', '🤐', '🤨', '😏', '😬', '🤥', '🙂', '🤓', '😉', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤮', '🤢', '🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🧁', '🍪', '🍩', '🍫', '🍬', '🍭', '🍮', '🍯', '🍕', '🍔', '🍟', '🌭', '🍿', '☕', '🧋', '🥤', '🍹', '🍸', '👍', '👏', '🙌', '🤲', '🤝', '💅', '👶', '👧', '🧒', '👦', '👨', '👩', '🎨', '🎭', '🎪', '🎬', '🎤', '🎧', '🎼', '🎹', '🎸', '🎺', '🎷', '🥁', '🎻', '🎲', '🎯', '🎳', '🎮', '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '✈️', '🛩️', '🛫', '🛬', '🚁', '🛶', '⛵', '🚤', '🛳️', '🛥️', '🚢', '⛴️', '🚀', '🛸', '🌟', '⭐', '✨', '💫', '⚡', '☄️', '💥', '🔥', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '🌬️', '💨', '💧', '💦', '🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇'];

let user = 'you';
let msgs = [];
let ws = null;
let connected = false;

function init() {
  renderUsers();
  connect();
}

function connect() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(proto + '//' + location.host);
  
  ws.onopen = () => {
    connected = true;
    updateStatus();
    document.getElementById('msg').disabled = false;
    document.getElementById('sendBtn').disabled = false;
  };
  
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === 'load') {
      msgs = data.messages;
      render();
    } else if (data.type === 'new') {
      msgs.push(data.message);
      render();
    }
  };
  
  ws.onclose = () => {
    connected = false;
    updateStatus();
    document.getElementById('msg').disabled = true;
    document.getElementById('sendBtn').disabled = true;
    setTimeout(connect, 3000);
  };
}

function updateStatus() {
  const dot = document.getElementById('dot');
  const stat = document.getElementById('stat');
  if (connected) {
    dot.classList.remove('off');
    stat.textContent = 'Connected';
  } else {
    dot.classList.add('off');
    stat.textContent = 'Reconnecting...';
  }
}

function renderUsers() {
  const div = document.getElementById('users');
  div.innerHTML = '';
  for (let key in USERS) {
    const btn = document.createElement('button');
    btn.className = 'user-btn' + (key === user ? ' active' : '');
    btn.textContent = USERS[key];
    btn.onclick = () => { user = key; renderUsers(); };
    btn.style.background = key === user ? '#667eea' : 'white';
    btn.style.color = key === user ? 'white' : 'black';
    btn.style.border = 'none';
    div.appendChild(btn);
  }
}

function send() {
  const inp = document.getElementById('msg');
  const text = inp.value.trim();
  if (!text || !connected) return;
  
  const msg = {
    type: 'new_message',
    user: user,
    text: text
  };
  ws.send(JSON.stringify(msg));
  inp.value = '';
}

function render() {
  const div = document.getElementById('chat');
  div.innerHTML = '';
  if (msgs.length === 0) {
    div.innerHTML = '<div style="text-align: center; color: #999;">No messages yet. Start chatting! 💬</div>';
    return;
  }
  msgs.forEach(m => {
    const d = document.createElement('div');
    d.className = 'msg ' + m.user;
    d.innerHTML = '<div class="sender">' + USERS[m.user] + '</div><div class="bubble">' + m.text + '</div>';
    div.appendChild(d);
  });
  div.scrollTop = div.scrollHeight;
}

function toggleEmoji() {
  alert('Emojis: ' + EMOJIS.slice(0, 20).join(''));
}

document.getElementById('msg').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') send();
});

init();
</script>
</body>
</html>`;

app.get('/', (req, res) => {
  res.send(html);
});

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.send(JSON.stringify({
    type: 'load',
    messages: messages
  }));
  
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'new_message') {
        const newMsg = {
          user: msg.user,
          text: msg.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        messages.push(newMsg);
        
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'new',
              message: newMsg
            }));
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
