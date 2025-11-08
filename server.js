const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover, maximum-scale=1.0">
    <title>Chat</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        html { height: 100%; }
        body { height: 100%; overflow: hidden; font-family: 'Arial', sans-serif; -webkit-user-select: none; user-select: none; background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 20%, #ffecd2 40%, #fcb69f 60%, #ff9a9e 80%, #fad0c4 100%); }
        .login-screen { position: fixed; width: 100vw; height: 100vh; background: linear-gradient(135deg, #ffd89b 0%, #19547b 25%, #ffd89b 50%, #ff9a9e 75%, #fad0c4 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; text-align: center; z-index: 100; }
        .login-screen p { font-size: 28px; color: #333; margin-bottom: 40px; font-weight: bold; text-shadow: 2px 2px 4px rgba(255,255,255,0.3); }
        .login-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 100%; max-width: 420px; }
        .login-btn { padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 20px; font-size: 18px; font-weight: bold; cursor: pointer; text-transform: uppercase; box-shadow: 0 6px 20px rgba(0,0,0,0.15); transition: all 0.3s; letter-spacing: 1px; }
        .login-btn:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .login-btn:active { transform: scale(0.95); }
        .container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #ffd89b 0%, #19547b 25%, #ffecd2 50%, #ff9a9e 75%, #fad0c4 100%); display: none; flex-direction: column; z-index: 50; }
        .container.show { display: flex; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: bold; flex-shrink: 0; gap: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
        #myname { font-size: 18px; text-transform: uppercase; }
        .logout-btn { background: #764ba2; color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 11px; font-weight: bold; text-transform: uppercase; }
        .tabs { display: flex; gap: 8px; padding: 10px; background: linear-gradient(90deg, rgba(255,154,158,0.3), rgba(250,208,196,0.3)); border-bottom: 2px solid rgba(102,126,234,0.4); overflow-x: auto; flex-shrink: 0; }
        .tab { padding: 8px 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 12px; white-space: nowrap; color: white; flex-shrink: 0; text-transform: uppercase; transition: all 0.3s; }
        .tab:hover { opacity: 0.8; }
        .tab.active { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .chat-display { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; padding: 15px; -webkit-overflow-scrolling: touch; font-size: 22px; background: linear-gradient(135deg, rgba(255,240,245,0.7), rgba(240,248,255,0.7)); position: relative; }
        .message { margin-bottom: 12px; display: flex; flex-direction: column; position: relative; z-index: 2; animation: fadeIn 0.3s; }
        .message.own { align-items: flex-end; }
        .message-sender { font-size: 14px; color: #666; margin: 0 0 4px 0; font-weight: bold; letter-spacing: 1px; }
        .message-sender .heart { font-size: 12px; margin: 0 4px; }
        .message.own .message-sender .heart { color: #f093fb; }
        .message.esther .message-sender .heart { color: #06b6d4; }
        .message.valley .message-sender .heart { color: #f093fb; }
        .message.amaaya .message-sender .heart { color: #10b981; }
        .message.mama .message-sender .heart { color: #f59e0b; }
        .message.mummy .message-sender .heart { color: #ec4899; }
        .message.hilary .message-sender .heart { color: #8b5cf6; }
        .message.nan .message-sender .heart { color: #ef4444; }
        .message.rishy .message-sender .heart { color: #f97316; }
        .message.poppy .message-sender .heart { color: #0ea5e9; }
        .message.sienna .message-sender .heart { color: #f472b6; }
        .message.penelope .message-sender .heart { color: #d8b4fe; }
        .message.lola .message-sender .heart { color: #ec4899; }
        .message-bubble { max-width: 70%; padding: 8px 12px; border-radius: 14px; word-wrap: break-word; font-size: 18px; font-weight: 500; line-height: 1.4; border: 1px solid rgba(255,255,255,0.3); width: fit-content; display: inline-block; }
        .message.own .message-bubble { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
        .message.esther .message-bubble { background: #a5f3fc; color: #0c4a6e; }
        .message.valley .message-bubble { background: #e9d5ff; color: #5b21b6; }
        .message.amaaya .message-bubble { background: #bbf7d0; color: #166534; }
        .message.mama .message-bubble { background: #fef3c7; color: #92400e; }
        .message.mummy .message-bubble { background: #fce7f3; color: #831843; }
        .message.hilary .message-bubble { background: #ede9fe; color: #5b21b6; }
        .message.nan .message-bubble { background: #fee2e2; color: #991b1b; }
        .message.rishy .message-bubble { background: #ffedd5; color: #92400e; }
        .message.poppy .message-bubble { background: #cffafe; color: #0c4a6e; }
        .message.sienna .message-bubble { background: #fbcfe8; color: #831843; }
        .message.penelope .message-bubble { background: #f3e8ff; color: #6b21a8; }
        .message.lola .message-bubble { background: #fbcfe8; color: #831843; }
        .input-area { background: linear-gradient(90deg, rgba(255,154,158,0.2), rgba(250,208,196,0.2)); border-top: 2px solid rgba(102,126,234,0.3); display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; padding: 10px; }
        .emoji-picker { display: none; grid-template-columns: repeat(6, 1fr); gap: 6px; padding: 10px; background: linear-gradient(135deg, #ffecd2, #fcb69f); border-radius: 10px; max-height: 120px; overflow-y: auto; border: 1px solid rgba(102,126,234,0.3); }
        .emoji-picker.show { display: grid; }
        .emoji-option { font-size: 20px; cursor: pointer; text-align: center; padding: 6px; border-radius: 8px; transition: all 0.2s; }
        .emoji-option:hover { transform: scale(1.15); }
        .input-container { display: flex; gap: 6px; align-items: center; width: 100%; }
        .input-field { flex: 1; padding: 10px 12px; border: 2px solid #667eea; border-radius: 10px; font-size: 13px; font-family: inherit; height: auto; min-height: 40px; background: white; color: #333; font-weight: 500; }
        .input-field:focus { outline: none; border-color: #764ba2; background: #fafafa; }
        .input-field::placeholder { color: #999; }
        .emoji-btn { background: linear-gradient(135deg, #667eea, #764ba2); border: 2px solid #f093fb; color: white; padding: 8px 10px; border-radius: 8px; font-size: 16px; cursor: pointer; height: 40px; min-width: 40px; flex-shrink: 0; font-weight: bold; transition: all 0.3s; }
        .emoji-btn:hover { background: linear-gradient(135deg, #764ba2, #f093fb); }
        .send-btn { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 8px 12px; border-radius: 10px; font-size: 11px; font-weight: bold; cursor: pointer; height: 40px; min-width: 50px; flex-shrink: 0; text-transform: uppercase; transition: all 0.3s; }
        .send-btn:hover { transform: translateY(-1px); }
        .send-btn:active { transform: scale(0.95); }
        .send-btn:disabled { background: #ccc; cursor: not-allowed; }
        .empty { text-align: center; color: #999; padding: 40px 15px; font-size: 16px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="login-screen" id="login">
        <p>Pick Your Character</p>
        <div class="login-buttons">
            <button class="login-btn" onclick="window.login('esther')">🐱 Esther</button>
            <button class="login-btn" onclick="window.login('valley')">🎀 Valley</button>
            <button class="login-btn" onclick="window.login('amaaya')">✨ Amaaya</button>
            <button class="login-btn" onclick="window.login('mama')">👑 Mama</button>
            <button class="login-btn" onclick="window.login('mummy')">💎 Mummy</button>
            <button class="login-btn" onclick="window.login('hilary')">🌸 Hilary</button>
            <button class="login-btn" onclick="window.login('nan')">💜 Nan</button>
            <button class="login-btn" onclick="window.login('rishy')">⭐ Rishy</button>
            <button class="login-btn" onclick="window.login('poppy')">🌷 Poppy</button>
            <button class="login-btn" onclick="window.login('sienna')">🦖 Sienna</button>
            <button class="login-btn" onclick="window.login('penelope')">💝 Penelope</button>
            <button class="login-btn" onclick="window.login('lola')">💖 Lola</button>
        </div>
    </div>

    <div class="container" id="app">
        <div class="header">
            <div><span id="myname"></span></div>
            <button class="logout-btn" onclick="window.logout()">Logout</button>
        </div>
        <div class="tabs" id="tabs"></div>
        <div class="chat-display" id="chat"><div class="empty">Loading chat...</div></div>
        
        <div class="input-area">
            <div id="emojiPicker" class="emoji-picker"></div>
            <div class="input-container">
                <button class="emoji-btn" onclick="window.toggleEmoji()">😊</button>
                <input type="text" class="input-field" id="msg" placeholder="Say something..." disabled>
                <button class="send-btn" id="sendBtn" onclick="window.send()" disabled>Send</button>
            </div>
        </div>
    </div>

    <script>
        const EMOJIS = ['😊','😂','😍','🥰','😎','🤗','😜','😝','🤪','😏','😒','😡','🤬','😤','😠','😈','👿','💀','☠️','🎉','🎊','🎈','🎁','🍰','🍕','🍔','🍟','🌭','🥪','🥙','🌮','🌯','🥗','🍜','🍝','🍱','🍛','🍲','🍥','🥘','🍚','🍙','🥟','🍢','🍣','🍤','🍙','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','☕','🧋','🥤','🧃','🥛','🍼','🍵','🍶','🍾','🍷','🍸','🍹','🍺','🍻','🥂','🥃','🥤','🧉','🧊','⭐','✨','🌟','💫','🌠','🌌','🌃','🌆','🌇','🌉','🌁','⛅','🌤️','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️','💨','💧','💦','☔','🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍞','🥐','🥖','🥨','🥯','🧀','🥓','🥚','🍳','🧈','🥞','🧇','🥓','🥞','🍗','🍖','🌭','🍔','🍟','🍕','🥪','🥙','🧆','🌮','🌯','🥗','🥘','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','☕','🍵','🍶','🍾','🍷','🍸','🍹','🍺','🍻','🥂','🥃','🥤','🧉','🧊','🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪰','🕷️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🧒','👶','👧','🧑','👦','👨','👩','👴','👵','🥰','💕','💖','💗','💓','💞','💝','💟','❣️','💔','❤️','🧡','💛','💚','💙','💜','🖤','🖤','🤍','🤎','💯','💢','💥','💫','💦','💨','🕳️','💬','👁️‍🗨️','🗨️','🗯️','💭','💤'];

        
        const AVATARS = {
            esther: '🐱', valley: '🎀', amaaya: '✨', mama: '👑', mummy: '💎',
            hilary: '🌸', nan: '💜', rishy: '⭐', poppy: '🌷', sienna: '🦖', penelope: '💝', lola: '💖'
        };

        let currentUser = null, currentChat = 'group', allChats = [], messages = {}, ws = null, connected = false;

        window.login = function(user) {
            if (!user) return;
            currentUser = user;
            localStorage.setItem('user', user);
            allChats = ['group'];
            if (user === 'esther') {
                allChats = ['group', 'esther-mama', 'esther-mummy', 'esther-hilary', 'esther-nan', 'esther-rishy', 'esther-poppy', 'esther-sienna', 'esther-penelope'];
            } else if (user === 'mama') {
                allChats = ['group', 'esther-mama'];
            } else if (user === 'mummy') {
                allChats = ['group', 'esther-mummy'];
            } else if (['valley', 'amaaya', 'hilary'].includes(user)) {
                allChats = ['group', 'esther-' + user];
            } else if (['nan', 'rishy', 'poppy', 'sienna', 'penelope'].includes(user)) {
                allChats = ['esther-' + user];
            } else if (user === 'lola') {
                allChats = ['group', 'lola-nan', 'lola-mummy', 'lola-mama', 'lola-poppy'];
            }
            currentChat = allChats[0];
            allChats.forEach(chat => {
                if (!messages[chat]) {
                    const saved = localStorage.getItem('chat_' + chat);
                    messages[chat] = saved ? JSON.parse(saved) : [];
                }
            });
            document.getElementById('login').style.display = 'none';
            document.getElementById('app').classList.add('show');
            document.getElementById('myname').textContent = user.toUpperCase();
            window.renderTabs();
            window.connect();
            window.render();
        };

        window.logout = function() {
            localStorage.removeItem('user');
            location.reload();
        };

        window.connect = function() {
            const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
            ws = new WebSocket(proto + '//' + location.host);
            ws.onopen = () => {
                connected = true;
                document.getElementById('msg').disabled = false;
                document.getElementById('sendBtn').disabled = false;
            };
            ws.onmessage = (e) => {
                const data = JSON.parse(e.data);
                if (data.type === 'load_messages') {
                    messages = data.messages;
                    window.render();
                } else if (data.type === 'message') {
                    if (!messages[data.data.chatId]) messages[data.data.chatId] = [];
                    messages[data.data.chatId].push(data.data);
                    localStorage.setItem('chat_' + data.data.chatId, JSON.stringify(messages[data.data.chatId]));
                    if (data.data.chatId === currentChat) window.render();
                }
            };
            ws.onclose = () => { connected = false; setTimeout(window.connect, 3000); };
        };

        window.renderTabs = function() {
            const div = document.getElementById('tabs');
            div.innerHTML = '';
            allChats.forEach(chatId => {
                const btn = document.createElement('button');
                btn.className = 'tab' + (chatId === currentChat ? ' active' : '');
                if (chatId === 'group') {
                    btn.textContent = '👥 Group';
                } else {
                    if (currentUser === 'esther') {
                        const parts = chatId.split('-');
                        const otherName = parts[0] === 'esther' ? parts[1] : parts[0];
                        btn.textContent = '💬 ' + otherName.toUpperCase();
                    } else {
                        btn.textContent = '💬 ESTHER';
                    }
                }
                btn.onclick = () => { currentChat = chatId; window.renderTabs(); window.render(); };
                div.appendChild(btn);
            });
        };

        window.renderEmojiPicker = function() {
            const picker = document.getElementById('emojiPicker');
            picker.innerHTML = '';
            EMOJIS.forEach(emoji => {
                const btn = document.createElement('div');
                btn.className = 'emoji-option';
                btn.textContent = emoji;
                btn.onclick = () => { document.getElementById('msg').value += emoji; };
                picker.appendChild(btn);
            });
        };

        window.toggleEmoji = function() {
            const picker = document.getElementById('emojiPicker');
            picker.classList.toggle('show');
        };

        window.send = function() {
            const inp = document.getElementById('msg');
            const text = inp.value.trim();
            if (!text || !connected) return;
            ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: text }));
            inp.value = '';
        };

        window.render = function() {
            const div = document.getElementById('chat');
            div.innerHTML = '';
            const msgs = messages[currentChat] || [];
            if (msgs.length === 0) { div.innerHTML = '<div class="empty">Chat ready!</div>'; return; }
            msgs.forEach(m => {
                const d = document.createElement('div');
                let displayName = m.user;
                
                if (currentChat !== 'group') {
                    if (currentUser === 'esther') {
                        displayName = m.user === 'esther' ? 'ESTHER' : m.user;
                    } else {
                        if (m.user === currentUser) {
                            displayName = currentUser;
                        } else {
                            displayName = 'ESTHER';
                        }
                    }
                }
                
                d.className = 'message ' + (m.user === currentUser ? 'own' : m.user);
                const sender = '<div class="message-sender"><span class="heart">💕</span>' + displayName.toUpperCase() + '<span class="heart">💕</span></div>';
                const content = '<div class="message-bubble">' + m.text + '</div>';
                d.innerHTML = sender + content;
                div.appendChild(d);
            });
            div.scrollTop = div.scrollHeight;
        };

        window.renderEmojiPicker();
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('msg').addEventListener('keypress', (e) => { if (e.key === 'Enter') window.send(); });
            const savedUser = localStorage.getItem('user');
            if (savedUser) window.login(savedUser);
        });
    </script>
</body>
</html>`;

app.get('/', (req, res) => { res.type('text/html').send(html); });

let messages = {
  'group': [],
  'esther-mama': [],
  'esther-mummy': [],
  'esther-hilary': [],
  'esther-nan': [],
  'esther-rishy': [],
  'esther-poppy': [],
  'esther-sienna': [],
  'esther-penelope': [],
  'lola-nan': [],
  'lola-mummy': [],
  'lola-mama': [],
  'lola-poppy': []
};

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'load_messages', messages }));
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'new_message') {
        const newMsg = { id: Date.now(), user: msg.user, text: msg.text, chatId: msg.chatId };
        const chatId = msg.chatId || 'group';
        if (!messages[chatId]) messages[chatId] = [];
        messages[chatId].push(newMsg);
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'message', data: newMsg }));
          }
        });
      }
    } catch (error) {}
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { console.log('Chat Server Running'); });
