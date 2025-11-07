const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

let privateMessages = {};

const KIDS = {
  'esther': 'Esther',
  'valley': 'Valley',
  'amaaya': 'Amaaya',
  'mama': 'Mama',
  'mummy': 'Mummy',
  'hilary': 'Hilary',
  'nan': 'Nan',
  'poppy': 'Poppy',
  'rishy': 'Rishy',
  'millie': 'Millie'
};

const GROUP_MEMBERS = ['esther', 'valley', 'amaaya', 'mama', 'mummy', 'hilary'];
const GROUP_CHAT = 'group';
const PRIVATE_PAIRS = [
  ['esther', 'nan'],
  ['esther', 'poppy'],
  ['esther', 'rishy'],
  ['esther', 'millie']
];

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Chat</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 10px; }
.login-screen { width: 100%; max-width: 500px; background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); padding: 40px 20px; text-align: center; }
.login-screen h1 { font-size: 28px; margin-bottom: 10px; color: #333; }
.login-screen p { font-size: 16px; color: #666; margin-bottom: 30px; }
.login-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.login-btn { padding: 15px 20px; background: #667eea; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; }
.login-btn:hover { background: #764ba2; }
.container { width: 100%; max-width: 500px; background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); display: flex; flex-direction: column; height: 90vh; display: none; }
.container.show { display: flex; }
.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; text-align: center; font-size: 22px; font-weight: bold; border-radius: 20px 20px 0 0; display: flex; justify-content: space-between; align-items: center; }
.logout-btn { background: rgba(255,255,255,0.2); border: none; color: white; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; }
.tabs { display: flex; gap: 4px; padding: 10px; background: #f0f0f0; border-bottom: 2px solid #e0e0e0; overflow-x: auto; }
.tab { padding: 8px 12px; background: white; border: 2px solid #ddd; border-radius: 15px; cursor: pointer; font-weight: 600; font-size: 13px; white-space: nowrap; }
.tab.active { background: #667eea; color: white; border-color: #667eea; }
.chat { flex: 1; overflow-y: auto; padding: 15px; background: #fafafa; }
.msg { margin-bottom: 12px; display: flex; flex-direction: column; }
.msg.own { align-items: flex-end; }
.bubble { max-width: 80%; padding: 10px 14px; border-radius: 16px; word-wrap: break-word; font-size: 15px; }
.msg.own .bubble { background: #667eea; color: white; }
.msg.esther .bubble { background: #667eea; color: white; }
.msg.valley .bubble { background: #ff6b9d; color: white; }
.msg.amaaya .bubble { background: #4ecdc4; color: white; }
.msg.mama .bubble { background: #95e1d3; color: white; }
.msg.mummy .bubble { background: #f38181; color: white; }
.msg.hilary .bubble { background: #aa96da; color: white; }
.msg.nan .bubble { background: #fcbad3; color: white; }
.msg.poppy .bubble { background: #ffd1b3; color: white; }
.msg.rishy .bubble { background: #a8e6cf; color: white; }
.msg.millie .bubble { background: #ffd3a5; color: white; }
.sender { font-size: 12px; color: #999; margin: 4px 0; font-weight: 600; }
.input-area { padding: 12px; background: white; border-top: 2px solid #e0e0e0; display: flex; gap: 8px; }
input { flex: 1; padding: 12px; border: 2px solid #e0e0e0; border-radius: 20px; font-size: 15px; }
input:focus { outline: none; border-color: #667eea; }
button { padding: 12px 20px; background: #667eea; color: white; border: none; border-radius: 20px; font-weight: bold; cursor: pointer; }
button:hover { background: #764ba2; }
.emoji-btn { background: #fff; border: 2px solid #ffc107; color: #333; padding: 10px 14px; font-size: 18px; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: #4caf50; display: inline-block; margin-right: 4px; }
.dot.off { background: #ff5252; }
.empty { text-align: center; color: #999; padding: 20px; }
</style>
</head>
<body>

<div class="login-screen" id="login">
  <h1>💬 Chat</h1>
  <p>Who are you?</p>
  <div class="login-buttons">
    <button class="login-btn" onclick="login('esther')">Esther</button>
    <button class="login-btn" onclick="login('valley')">Valley</button>
    <button class="login-btn" onclick="login('amaaya')">Amaaya</button>
    <button class="login-btn" onclick="login('mama')">Mama</button>
    <button class="login-btn" onclick="login('mummy')">Mummy</button>
    <button class="login-btn" onclick="login('hilary')">Hilary</button>
    <button class="login-btn" onclick="login('nan')">Nan</button>
    <button class="login-btn" onclick="login('poppy')">Poppy</button>
    <button class="login-btn" onclick="login('rishy')">Rishy</button>
    <button class="login-btn" onclick="login('millie')">Millie</button>
  </div>
</div>

<div class="container" id="app">
  <div class="header">
    <div>💬 <span id="myname"></span></div>
    <div>
      <span class="dot" id="dot"></span>
      <span id="stat">Online</span>
    </div>
    <button class="logout-btn" onclick="logout()">Logout</button>
  </div>
  
  <div class="tabs" id="tabs"></div>
  
  <div class="chat" id="chat">
    <div class="empty">Loading...</div>
  </div>
  
  <div class="input-area">
    <button class="emoji-btn" onclick="addEmoji()">😀</button>
    <input type="text" id="msg" placeholder="Type message..." disabled>
    <button onclick="send()" disabled id="sendBtn">Send</button>
  </div>
</div>

<script>
const EMOJIS = ['😀', '😂', '😍', '🥰', '😎', '🤗', '🎉', '🎊', '👍', '🎨', '🌈', '⭐', '🐱', '🍕', '🍦', '🚀', '💕', '✨', '🔥', '🎮', '🌟', '💫', '🎸', '🎵', '🎭'];

const KIDS = {
  'esther': 'Esther', 'valley': 'Valley', 'amaaya': 'Amaaya', 'mama': 'Mama', 'mummy': 'Mummy', 'hilary': 'Hilary', 'nan': 'Nan', 'poppy': 'Poppy', 'rishy': 'Rishy', 'millie': 'Millie'
};

const GROUP_MEMBERS = ['esther', 'valley', 'amaaya', 'mama', 'mummy', 'hilary'];
const GROUP_CHAT = 'group';
const PRIVATE_PAIRS = [['esther', 'nan'], ['esther', 'poppy'], ['esther', 'rishy'], ['esther', 'millie']];

let currentUser = null, currentChat = GROUP_CHAT, allChats = [GROUP_CHAT], messages = {}, ws = null, connected = false;

function login(user) {
  currentUser = user;
  localStorage.setItem('user', user);
  allChats = [];
  if (GROUP_MEMBERS.includes(user)) allChats.push(GROUP_CHAT);
  PRIVATE_PAIRS.forEach(pair => {
    if (pair.includes(user)) {
      const other = pair[0] === user ? pair[1] : pair[0];
      allChats.push([user, other].sort().join('-'));
    }
  });
  allChats.forEach(chat => { messages[chat] = []; });
  document.getElementById('login').style.display = 'none';
  document.getElementById('app').classList.add('show');
  document.getElementById('myname').textContent = KIDS[user];
  renderTabs();
  connect();
}

function logout() {
  localStorage.removeItem('user');
  location.reload();
}

function connect() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(proto + '//' + location.host);
  ws.onopen = () => {
    connected = true;
    document.getElementById('msg').disabled = false;
    document.getElementById('sendBtn').disabled = false;
  };
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === 'load') {
      messages = data.messages;
      render();
    } else if (data.type === 'new') {
      const chatId = data.chatId;
      if (!messages[chatId]) messages[chatId] = [];
      messages[chatId].push(data.message);
      if (chatId === currentChat) render();
    }
  };
  ws.onclose = () => {
    connected = false;
    setTimeout(connect, 3000);
  };
}

function getChatName(chatId) {
  if (chatId === 'group') return '👥 Group';
  const parts = chatId.split('-');
  const other = parts[0] === currentUser ? parts[1] : parts[0];
  return KIDS[other];
}

function renderTabs() {
  const div = document.getElementById('tabs');
  div.innerHTML = '';
  allChats.forEach(chatId => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (chatId === currentChat ? ' active' : '');
    btn.textContent = getChatName(chatId);
    btn.onclick = () => { currentChat = chatId; renderTabs(); render(); };
    div.appendChild(btn);
  });
}

function send() {
  const inp = document.getElementById('msg');
  const text = inp.value.trim();
  if (!text || !connected) return;
  ws.send(JSON.stringify({type: 'new_message', user: currentUser, chatId: currentChat, text: text}));
  inp.value = '';
}

function render() {
  const div = document.getElementById('chat');
  div.innerHTML = '';
  const msgs = messages[currentChat] || [];
  if (msgs.length === 0) {
    div.innerHTML = '<div class="empty">No messages yet 💬</div>';
    return;
  }
  msgs.forEach(m => {
    const d = document.createElement('div');
    d.className = 'msg ' + (m.user === currentUser ? 'own' : m.user);
    d.innerHTML = '<div class="sender">' + KIDS[m.user] + '</div><div class="bubble">' + m.text + '</div>';
    div.appendChild(d);
  });
  div.scrollTop = div.scrollHeight;
}

function addEmoji() {
  const inp = document.getElementById('msg');
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  inp.value += emoji;
  inp.focus();
}

document.getElementById('msg').addEventListener('keypress', (e) => { if (e.key === 'Enter') send(); });

const savedUser = localStorage.getItem('user');
if (savedUser) login(savedUser);
</script>
</body>
</html>`);
});

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({type: 'load', messages: privateMessages}));
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'new_message') {
        const newMsg = {user: msg.user, text: msg.text, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})};
        const chatId = msg.chatId;
        if (!privateMessages[chatId]) privateMessages[chatId] = [];
        privateMessages[chatId].push(newMsg);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({type: 'new', chatId: chatId, message: newMsg}));
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
