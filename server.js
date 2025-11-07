const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

// HTML - Perfect design with rainbows, happy cats, and bubble tea
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>💬 Friend Chat</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #FF6B9D 0%, #FFA06B 16%, #FFE66D 32%, #95E1D3 48%, #667eea 64%, #764ba2 80%, #FF6B9D 100%); background-size: 200% 200%; animation: gradientShift 8s ease infinite; min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 10px; }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        
        .login-screen { width: 100%; max-width: 480px; background: white; border-radius: 28px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); padding: 40px; text-align: center; }
        .login-screen h1 { font-size: 42px; margin-bottom: 8px; color: #333; font-weight: 800; }
        .login-screen p { font-size: 15px; color: #666; margin-bottom: 35px; font-weight: 500; }
        
        .login-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .login-btn { padding: 16px; background: linear-gradient(90deg, #FF6B9D 0%, #FFA06B 25%, #FFE66D 50%, #95E1D3 75%, #667eea 100%); color: white; border: none; border-radius: 14px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
        .login-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6); }
        .login-btn:active { transform: translateY(0); }
        
        .container { width: 100%; max-width: 480px; background: white; border-radius: 28px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); display: none; flex-direction: column; height: 90vh; max-height: 750px; overflow: hidden; }
        .container.show { display: flex; }
        
        .header { background: linear-gradient(90deg, #FF6B9D 0%, #FFA06B 25%, #FFE66D 50%, #95E1D3 75%, #667eea 100%); color: white; padding: 16px; border-radius: 28px 28px 0 0; display: flex; justify-content: space-between; align-items: center; font-size: 20px; font-weight: 700; }
        .header-title { flex-grow: 1; }
        .logout-btn { background: rgba(255,255,255,0.25); border: none; color: white; padding: 6px 12px; border-radius: 10px; cursor: pointer; font-size: 11px; font-weight: 600; transition: all 0.3s; }
        .logout-btn:hover { background: rgba(255,255,255,0.35); }
        
        .tabs { display: flex; gap: 6px; padding: 10px; background: #f8f9fb; border-bottom: 2px solid #e8eaf6; overflow-x: auto; }
        .tab { padding: 10px 14px; background: white; border: 2px solid #e0e0e0; border-radius: 18px; cursor: pointer; font-weight: 600; font-size: 12px; white-space: nowrap; transition: all 0.3s; color: #666; }
        .tab:hover { background: #f5f5f5; }
        .tab.active { background: linear-gradient(90deg, #FF6B9D 0%, #FFA06B 25%, #FFE66D 50%, #95E1D3 75%, #667eea 100%); color: white; border-color: #667eea; box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3); }
        
        .chat-display { flex: 1; overflow-y: auto; padding: 16px; background: linear-gradient(135deg, #fff9f0 0%, #fef5e7 50%, #fff9f0 100%), radial-gradient(circle at 20% 80%, rgba(255, 107, 157, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(167, 230, 207, 0.05) 0%, transparent 50%); }
        .message { margin-bottom: 12px; display: flex; flex-direction: column; animation: slideIn 0.25s ease-out; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .message.own { align-items: flex-end; }
        
        .message-bubble { max-width: 75%; padding: 10px 14px; border-radius: 16px; word-wrap: break-word; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.12); font-weight: 500; line-height: 1.4; }
        .message.own .message-bubble { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-bottom-right-radius: 3px; }
        .message.esther .message-bubble { background: #5B6FC7; color: white; border-bottom-left-radius: 3px; }
        .message.valley .message-bubble { background: #E91E63; color: white; border-bottom-left-radius: 3px; }
        .message.amaaya .message-bubble { background: #00BCD4; color: white; border-bottom-left-radius: 3px; }
        .message.mama .message-bubble { background: #26A69A; color: white; border-bottom-left-radius: 3px; }
        .message.mummy .message-bubble { background: #FF6B6B; color: white; border-bottom-left-radius: 3px; }
        .message.hilary .message-bubble { background: #AB47BC; color: white; border-bottom-left-radius: 3px; }
        .message.nan .message-bubble { background: #EC407A; color: white; border-bottom-left-radius: 3px; }
        .message.rishy .message-bubble { background: #FF9800; color: white; border-bottom-left-radius: 3px; }
        .message.poppy .message-bubble { background: #4CAF50; color: white; border-bottom-left-radius: 3px; }
        .message.sienna .message-bubble { background: #9C27B0; color: white; border-bottom-left-radius: 3px; }
        
        .message-sender { font-size: 10px; color: #999; margin: 3px 0 4px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; }
        .message.own .message-sender { text-align: right; }
        
        .input-area { padding: 12px; background: white; border-top: 2px solid #e8eaf6; display: flex; flex-direction: column; gap: 8px; }
        
        .emoji-picker { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; padding: 12px; background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%); border-radius: 14px; max-height: 200px; overflow-y: auto; border: 2px solid #ffc107; }
        .emoji-option { font-size: 24px; cursor: pointer; text-align: center; padding: 8px; border-radius: 10px; transition: all 0.2s; user-select: none; background: white; border: 1px solid transparent; }
        .emoji-option:hover { background: #fff9c4; transform: scale(1.2); }
        
        .input-container { display: flex; gap: 7px; align-items: center; flex-wrap: wrap; }
        .input-field { flex: 1; min-width: 100px; padding: 13px 16px; border: 2px solid #e0e0e0; border-radius: 22px; font-size: 15px; font-family: inherit; font-weight: 500; transition: all 0.3s; height: 44px; }
        .input-field:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
        .input-field::placeholder { color: #999; }
        
        .btn-small { border: none; padding: 10px 12px; border-radius: 14px; font-size: 18px; cursor: pointer; transition: all 0.3s; font-weight: 600; height: 44px; display: flex; align-items: center; }
        .btn-emoji { background: white; border: 2px solid #ffc107; color: #333; }
        .btn-emoji:hover { background: #ffc107; }
        .btn-sound { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; box-shadow: 0 3px 10px rgba(76, 175, 80, 0.3); }
        .btn-sound:hover { transform: scale(1.08); }
        .btn-sound.muted { background: linear-gradient(135deg, #999 0%, #777 100%); }
        
        .send-btn { background: linear-gradient(90deg, #FF6B9D 0%, #FFA06B 25%, #FFE66D 50%, #95E1D3 75%, #667eea 100%); color: white; border: none; padding: 10px 14px; border-radius: 22px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.3s; box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3); text-transform: uppercase; letter-spacing: 0.2px; white-space: nowrap; flex-shrink: 0; height: 44px; display: flex; align-items: center; }
        .send-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4); }
        .send-btn:active { transform: translateY(0); }
        .send-btn:disabled { background: #ccc; box-shadow: none; cursor: not-allowed; }
        
        .empty { text-align: center; color: #999; padding: 40px 20px; font-size: 15px; font-weight: 500; }
    </style>
</head>
<body>
    <div class="login-screen" id="login">
        <h1>💬 Chat</h1>
        <p>Select your name</p>
        <div class="login-buttons">
            <button class="login-btn" onclick="login('esther')">🐱 Esther</button>
            <button class="login-btn" onclick="login('valley')">😺 Valley</button>
            <button class="login-btn" onclick="login('amaaya')">😸 Amaaya</button>
            <button class="login-btn" onclick="login('mama')">😻 Mama</button>
            <button class="login-btn" onclick="login('mummy')">😼 Mummy</button>
            <button class="login-btn" onclick="login('hilary')">😽 Hilary</button>
            <button class="login-btn" onclick="login('nan')">🙀 Nan</button>
            <button class="login-btn" onclick="login('rishy')">😿 Rishy</button>
            <button class="login-btn" onclick="login('poppy')">😾 Poppy</button>
            <button class="login-btn" onclick="login('sienna')">😺 Sienna</button>
        </div>
    </div>

    <div class="container" id="app">
        <div class="header">
            <div class="header-title">💬 <span id="myname"></span></div>
            <button class="logout-btn" onclick="logout()">Logout</button>
        </div>
        <div class="tabs" id="tabs"></div>
        <div class="chat-display" id="chat"><div class="empty">Loading...</div></div>
        
        <div class="input-area">
            <div id="emojiPicker" class="emoji-picker" style="display: none;"></div>
            <div class="input-container">
                <button class="btn-small btn-emoji" onclick="toggleEmoji()" title="Emoji">😀</button>
                <button class="btn-small btn-sound" id="soundBtn" onclick="toggleSound()" title="Sound">🔊</button>
                <input type="text" class="input-field" id="msg" placeholder="Type message..." disabled>
                <button class="send-btn" id="sendBtn" onclick="send()" disabled>Send</button>
            </div>
        </div>
    </div>

    <script>
        const EMOJIS = ['🌈','🌈','🌈','😀','😂','😍','🥰','😎','🤗','😊','🙂','🤓','🎉','🎊','🎈','🎁','🎂','🍰','🍕','🍔','🍟','☕','🍵','🧋','🥤','🍹','🍩','🍪','🐱','😺','😸','😻','😼','🐱','😺','😸','🐯','🦁','🐮','🐷','🦊','🐻','🐼','🐨','🐹','🐰','👍','👏','🙌','💪','🤝','💋','💕','💖','💗','💓','💞','💘','💝','⭐','✨','🌟','💫','🔥','⚡','🌈','🌈','🌈','☀️','🌙','⛅','🌤️','🌥️','☁️','🌧️','⛈️','❄️','☃️','🌺','🌸','🌼','🌻','🌷','🌹','🥀','💐','🎨','🎭','🎪','🎬','🎤','🎸','🎹','🎺','🎻','🎮','🕹️','🎲','🎯','🎳','⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎳','🎱','🏓','🏸','🏒','🏑','🥍','🏏','🥅','⛳','⛸️','🎣','🎽','🎿','🛷','🛹','🛼','🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍️','🛵','🚲','🛴','🛹','🛼','✈️','🛫','🛬','🛩️','🚁','🛸','🚀','⭐','🌟','✨','💫','🔥','🌈','🌈','🌈'];

        const USERS = {
            'esther': 'Esther', 'valley': 'Valley', 'amaaya': 'Amaaya', 'mama': 'Mama', 'mummy': 'Mummy',
            'hilary': 'Hilary', 'nan': 'Nan', 'rishy': 'Rishy', 'poppy': 'Poppy', 'sienna': 'Sienna'
        };

        let currentUser = null, currentChat = 'group', allChats = [], messages = {}, ws = null, connected = false;
        let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';

        function playSound() {
            if (!soundEnabled) return;
            try {
                // Create audio context on first user interaction (required for iPhone)
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                
                // Resume audio context if suspended (iPhone requirement)
                if (ctx.state === 'suspended') {
                    ctx.resume().then(() => playBeep(ctx));
                } else {
                    playBeep(ctx);
                }
            } catch (e) {
                console.log('Audio context error:', e);
            }
        }

        function playBeep(ctx) {
            const now = ctx.currentTime;
            
            // First beep
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(800, now);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
            
            // Second beep
            const osc2 = ctx.createOscillator();
            osc2.connect(gain);
            osc2.frequency.setValueAtTime(1000, now + 0.15);
            gain.gain.setValueAtTime(0.3, now + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            osc2.start(now + 0.15);
            osc2.stop(now + 0.25);
        }

        function toggleEmoji() {
            const picker = document.getElementById('emojiPicker');
            picker.style.display = picker.style.display === 'none' ? 'grid' : 'none';
        }

        function toggleSound() {
            soundEnabled = !soundEnabled;
            const btn = document.getElementById('soundBtn');
            if (soundEnabled) {
                btn.classList.remove('muted');
                btn.textContent = '🔊';
                localStorage.setItem('soundEnabled', 'true');
                playSound();
            } else {
                btn.classList.add('muted');
                btn.textContent = '🔇';
                localStorage.setItem('soundEnabled', 'false');
            }
        }

        function getAvailableChats(user) {
            const chats = [];
            if (['esther', 'valley', 'amaaya', 'mama', 'mummy', 'hilary'].includes(user)) chats.push('group');
            if (user === 'esther') {
                chats.push('esther-mama', 'esther-mummy', 'esther-hilary', 'esther-nan', 'esther-rishy', 'esther-poppy', 'esther-sienna');
            } else if (['mama', 'mummy', 'hilary', 'nan', 'rishy', 'poppy', 'sienna'].includes(user)) {
                chats.push('esther-' + user);
            }
            return chats;
        }

        function getChatName(chatId) {
            if (chatId === 'group') return '👥 Group';
            const parts = chatId.split('-');
            const other = parts[0] === currentUser ? parts[1] : parts[0];
            return USERS[other];
        }

        function login(user) {
            currentUser = user;
            localStorage.setItem('user', user);
            allChats = getAvailableChats(user);
            currentChat = allChats[0];
            allChats.forEach(chat => { if (!messages[chat]) messages[chat] = []; });
            document.getElementById('login').style.display = 'none';
            document.getElementById('app').classList.add('show');
            document.getElementById('myname').textContent = USERS[user];
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
                if (data.type === 'load_messages') {
                    messages = data.messages;
                    render();
                } else if (data.type === 'message') {
                    const chatId = data.data.chatId;
                    if (!messages[chatId]) messages[chatId] = [];
                    messages[chatId].push(data.data);
                    if (data.data.user !== currentUser) playSound();
                    if (chatId === currentChat) render();
                }
            };
            ws.onclose = () => { connected = false; setTimeout(connect, 3000); };
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

        function renderEmojiPicker() {
            const picker = document.getElementById('emojiPicker');
            picker.innerHTML = '';
            EMOJIS.forEach(emoji => {
                const btn = document.createElement('div');
                btn.className = 'emoji-option';
                btn.textContent = emoji;
                btn.onclick = () => { document.getElementById('msg').value += emoji; document.getElementById('msg').focus(); };
                picker.appendChild(btn);
            });
        }

        function send() {
            const inp = document.getElementById('msg');
            const text = inp.value.trim();
            if (!text || !connected) return;
            ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text }));
            inp.value = '';
        }

        function render() {
            const div = document.getElementById('chat');
            div.innerHTML = '';
            const msgs = messages[currentChat] || [];
            if (msgs.length === 0) { div.innerHTML = '<div class="empty">No messages yet. Start chatting! 💬</div>'; return; }
            msgs.forEach(m => {
                const d = document.createElement('div');
                d.className = 'message ' + (m.user === currentUser ? 'own' : m.user);
                d.innerHTML = '<div class="message-sender">' + USERS[m.user] + '</div><div class="message-bubble">' + m.text + '</div>';
                div.appendChild(d);
            });
            div.scrollTop = div.scrollHeight;
        }

        document.getElementById('msg').addEventListener('keypress', (e) => { if (e.key === 'Enter') send(); });

        renderEmojiPicker();
        
        // Request permissions on first interaction for iPhone
        document.addEventListener('click', () => {
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }
            // Resume audio context for iPhone
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                if (ctx.state === 'suspended') ctx.resume();
            } catch (e) {}
        }, { once: true });
        
        const savedUser = localStorage.getItem('user');
        if (savedUser) login(savedUser);
    </script>
</body>
</html>`;

app.get('/', (req, res) => {
  res.type('text/html').send(html);
});

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
  console.log(`🚀 Server running on port ${PORT}`);
});
