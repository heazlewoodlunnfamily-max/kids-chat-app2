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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>💬 Friend Chat</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #FFC4DB 0%, #FFE5B4 16%, #FFFFCC 32%, #D4F1ED 48%, #C9D9F4 64%, #E0D4F7 80%, #FFC4DB 100%); min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 10px; }
        body.dark-mode { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); }
        .login-screen { width: 100%; max-width: 480px; background: white; border-radius: 28px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); padding: 40px; text-align: center; }
        .dark-mode .login-screen { background: #2a2a3e; color: white; }
        .login-screen h1 { font-size: 42px; margin-bottom: 8px; color: #333; font-weight: 800; }
        .dark-mode .login-screen h1 { color: white; }
        .login-screen p { font-size: 15px; color: #666; margin-bottom: 35px; font-weight: 500; }
        .dark-mode .login-screen p { color: #aaa; }
        .login-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .login-btn { padding: 16px; background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: #9C27B0; border: none; border-radius: 14px; font-size: 16px; font-weight: 700; cursor: pointer; transition: opacity 0.15s; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
        .login-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6); }
        .container { width: 100%; max-width: 480px; background: white; border-radius: 28px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); display: none; flex-direction: column; height: 90vh; max-height: 750px; overflow: hidden; }
        .dark-mode .container { background: #2a2a3e; }
        .container.show { display: flex; }
        .header { background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: white; padding: 16px; border-radius: 28px 28px 0 0; display: flex; justify-content: space-between; align-items: center; font-size: 20px; font-weight: 700; }
        .header-title { flex-grow: 1; }
        #myname { color: #9C27B0; font-weight: 900; }
        .logout-btn { background: rgba(255,255,255,0.25); border: none; color: white; padding: 6px 12px; border-radius: 10px; cursor: pointer; font-size: 11px; font-weight: 600; }
        .logout-btn:hover { background: rgba(255,255,255,0.35); }
        .dark-mode-btn { background: rgba(255,255,255,0.25); border: none; color: white; padding: 6px 12px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; }
        .dark-mode-btn:hover { background: rgba(255,255,255,0.35); }
        .tabs { display: flex; gap: 6px; padding: 10px; background: #f8f9fb; border-bottom: 2px solid #e8eaf6; overflow-x: auto; }
        .dark-mode .tabs { background: #1a1a2e; border-color: #444; }
        .tab { padding: 10px 14px; background: white; border: 2px solid #e0e0e0; border-radius: 18px; cursor: pointer; font-weight: 600; font-size: 12px; white-space: nowrap; color: #666; }
        .dark-mode .tab { background: #3a3a4e; border-color: #555; color: #aaa; }
        .tab:hover { background: #f5f5f5; }
        .dark-mode .tab:hover { background: #4a4a5e; }
        .tab.active { background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: white; border-color: #667eea; box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3); }
        .chat-display { flex: 1; overflow-y: auto; padding: 20px 16px; background: linear-gradient(135deg, #fff9f0 0%, #fef5e7 50%, #fff9f0 100%); }
        .dark-mode .chat-display { background: #1a1a2e; }
        .message { margin-bottom: 12px; display: flex; flex-direction: column; }
        .message.own { align-items: flex-end; }
        .message-content { display: flex; gap: 8px; align-items: flex-end; }
        .message.own .message-content { flex-direction: row-reverse; }
        .avatar { width: 28px; height: 28px; border-radius: 50%; font-size: 16px; display: flex; align-items: center; justify-content: center; }
        .message-bubble { max-width: 75%; padding: 12px 16px; border-radius: 16px; word-wrap: break-word; font-size: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-weight: 500; line-height: 1.5; }
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
        .message.penelope .message-bubble { background: #FF1493; color: white; border-bottom-left-radius: 3px; }
        .message-sender { font-size: 12px; color: #666; margin: 0 0 6px 0; font-weight: 600; text-transform: capitalize; }
        .dark-mode .message-sender { color: #aaa; }
        .message.own .message-sender { text-align: right; }
        .input-area { padding: 12px; background: white; border-top: 2px solid #e8eaf6; display: flex; flex-direction: column; gap: 8px; }
        .dark-mode .input-area { background: #2a2a3e; border-color: #444; }
        .emoji-picker { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; padding: 12px; background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%); border-radius: 14px; max-height: 200px; overflow-y: auto; border: 2px solid #ffc107; }
        .dark-mode .emoji-picker { background: #3a3a4e; border-color: #666; }
        .emoji-option { font-size: 24px; cursor: pointer; text-align: center; padding: 8px; border-radius: 10px; user-select: none; background: white; }
        .dark-mode .emoji-option { background: #2a2a3e; }
        .emoji-option:hover { background: #fff9c4; transform: scale(1.2); }
        .dark-mode .emoji-option:hover { background: #4a4a5e; }
        .input-container { display: flex; gap: 10px; align-items: center; }
        .input-field { flex: 1; padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 20px; font-size: 14px; font-family: inherit; font-weight: 500; height: 40px; }
        .dark-mode .input-field { background: #3a3a4e; border-color: #555; color: white; }
        .input-field:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
        .input-field::placeholder { color: #999; }
        .emoji-btn { background: white; border: 2px solid #ffc107; color: #333; padding: 8px 10px; border-radius: 12px; font-size: 16px; cursor: pointer; height: 40px; }
        .dark-mode .emoji-btn { background: #3a3a4e; border-color: #666; color: white; }
        .emoji-btn:hover { background: #ffc107; }
        .send-btn { background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: white; border: none; padding: 8px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; cursor: pointer; box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3); height: 40px; min-width: 50px; }
        .send-btn:hover { transform: translateY(-2px); }
        .send-btn:disabled { background: #ccc; cursor: not-allowed; }
        .empty { text-align: center; color: #999; padding: 40px 20px; font-size: 15px; font-weight: 500; }
        .dark-mode .empty { color: #666; }
    </style>
</head>
<body>
    <div class="login-screen" id="login">
        <h1>💬 Chat</h1>
        <p>Select your name</p>
        <div class="login-buttons">
            <button type="button" class="login-btn" onclick="window.login('esther')">🐱 Esther</button>
            <button type="button" class="login-btn" onclick="window.login('valley')">😺 Valley</button>
            <button type="button" class="login-btn" onclick="window.login('amaaya')">😸 Amaaya</button>
            <button type="button" class="login-btn" onclick="window.login('mama')">😻 Mama</button>
            <button type="button" class="login-btn" onclick="window.login('mummy')">😼 Mummy</button>
            <button type="button" class="login-btn" onclick="window.login('hilary')">😽 Hilary</button>
            <button type="button" class="login-btn" onclick="window.login('nan')">🐱 Nan</button>
            <button type="button" class="login-btn" onclick="window.login('rishy')">😺 Rishy</button>
            <button type="button" class="login-btn" onclick="window.login('poppy')">😸 Poppy</button>
            <button type="button" class="login-btn" onclick="window.login('sienna')">😻 Sienna</button>
            <button type="button" class="login-btn" onclick="window.login('penelope')">😼 Penelope</button>
        </div>
    </div>

    <div class="container" id="app">
        <div class="header">
            <div class="header-title">💬 <span id="myname"></span></div>
            <button class="dark-mode-btn" onclick="window.toggleDarkMode()" title="Dark Mode">🌙</button>
            <button class="logout-btn" onclick="window.logout()">Logout</button>
        </div>
        <div class="tabs" id="tabs"></div>
        <div class="chat-display" id="chat"><div class="empty">Loading...</div></div>
        
        <div class="input-area">
            <div id="emojiPicker" class="emoji-picker" style="display: none;"></div>
            <div class="input-container">
                <button class="emoji-btn" onclick="window.toggleEmoji()">😀</button>
                <input type="text" class="input-field" id="msg" placeholder="Type message..." disabled>
                <button class="send-btn" id="sendBtn" onclick="window.send()" disabled>Send</button>
            </div>
        </div>
    </div>

    <script>
        const EMOJIS = ['🌈','😀','😂','😍','🥰','😎','🤗','😊','🙂','🤓','🎉','🎊','🎈','🎁','🎂','🍰','🍕','🍔','🍟','☕','🍵','🧋','🥤','🍹','🍩','🍪','🐱','😺','😸','😻','😼','🐯','🦁','🐮','🐷','🦊','🐻','🐼','🐨','🐹','🐰','👍','👏','🙌','💪','🤝','💋','💕','💖','💗','💓','💞','💘','💝','⭐','✨','🌟','💫','🔥','⚡'];

        const USERS = {
            esther: 'Esther', valley: 'Valley', amaaya: 'Amaaya', mama: 'Mama', mummy: 'Mummy',
            hilary: 'Hilary', nan: 'Nan', rishy: 'Rishy', poppy: 'Poppy', sienna: 'Sienna', penelope: 'Penelope'
        };

        const AVATARS = {
            esther: '🐱', valley: '😺', amaaya: '😸', mama: '😻', mummy: '😼',
            hilary: '😽', nan: '🐱', rishy: '😺', poppy: '😸', sienna: '😻', penelope: '😼'
        };

        let currentUser = null, currentChat = 'group', allChats = [], messages = {}, ws = null, connected = false;

        window.toggleDarkMode = function() {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        };

        function getAvailableChats(user) {
            const chats = [];
            const groupUsers = ['esther', 'valley', 'amaaya', 'mama', 'mummy', 'hilary'];
            if (groupUsers.includes(user)) chats.push('group');
            if (user === 'esther') {
                chats.push('esther-mama', 'esther-mummy', 'esther-hilary', 'esther-nan', 'esther-rishy', 'esther-poppy', 'esther-sienna', 'esther-penelope');
            } else if (['mama', 'mummy', 'hilary', 'nan', 'rishy', 'poppy', 'sienna', 'penelope'].includes(user)) {
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

        window.login = function(user) {
            if (!user) return;
            currentUser = user;
            localStorage.setItem('user', user);
            allChats = getAvailableChats(user);
            currentChat = allChats[0];
            allChats.forEach(chat => {
                if (!messages[chat]) {
                    const saved = localStorage.getItem('chat_' + chat);
                    messages[chat] = saved ? JSON.parse(saved) : [];
                }
            });
            document.getElementById('login').style.display = 'none';
            document.getElementById('app').classList.add('show');
            document.getElementById('myname').textContent = USERS[user];
            window.renderTabs();
            window.connect();
            window.render();
            if (localStorage.getItem('darkMode') === 'true') {
                document.body.classList.add('dark-mode');
            }
        };

        window.logout = function() {
            localStorage.removeItem('user');
            location.reload();
        };

        window.connect = function() {
            const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = proto + '//' + location.host;
            ws = new WebSocket(wsUrl);
            ws.onopen = () => {
                connected = true;
                const msgInput = document.getElementById('msg');
                const sendBtn = document.getElementById('sendBtn');
                if (msgInput) msgInput.disabled = false;
                if (sendBtn) sendBtn.disabled = false;
            };
            ws.onmessage = (e) => {
                const data = JSON.parse(e.data);
                if (data.type === 'load_messages') {
                    messages = data.messages;
                    Object.keys(messages).forEach(chat => {
                        localStorage.setItem('chat_' + chat, JSON.stringify(messages[chat]));
                    });
                    window.render();
                } else if (data.type === 'message') {
                    const chatId = data.data.chatId;
                    if (!messages[chatId]) messages[chatId] = [];
                    messages[chatId].push(data.data);
                    localStorage.setItem('chat_' + chatId, JSON.stringify(messages[chatId]));
                    if (chatId === currentChat) window.render();
                }
            };
            ws.onclose = () => {
                connected = false;
                setTimeout(window.connect, 3000);
            };
        };

        window.renderTabs = function() {
            const div = document.getElementById('tabs');
            if (!div) return;
            div.innerHTML = '';
            allChats.forEach(chatId => {
                const btn = document.createElement('button');
                btn.className = 'tab' + (chatId === currentChat ? ' active' : '');
                btn.textContent = getChatName(chatId);
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
                btn.onclick = () => { document.getElementById('msg').value += emoji; document.getElementById('msg').focus(); };
                picker.appendChild(btn);
            });
        };

        window.toggleEmoji = function() {
            const picker = document.getElementById('emojiPicker');
            picker.style.display = picker.style.display === 'none' ? 'grid' : 'none';
        };

        window.send = function() {
            const inp = document.getElementById('msg');
            const text = inp.value.trim();
            if (!text || !connected) return;
            ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text }));
            inp.value = '';
        };

        window.render = function() {
            const div = document.getElementById('chat');
            if (!div) return;
            div.innerHTML = '';
            const msgs = messages[currentChat] || [];
            if (msgs.length === 0) {
                div.innerHTML = '<div class="empty">No messages yet. Start chatting! 💬</div>';
                return;
            }
            msgs.forEach(m => {
                const d = document.createElement('div');
                d.className = 'message ' + (m.user === currentUser ? 'own' : m.user);
                const sender = USERS[m.user];
                const avatar = '<div class="avatar">' + AVATARS[m.user] + '</div>';
                const content = '<div class="message-content">' + avatar + '<div><div class="message-sender">' + sender + '</div><div class="message-bubble">' + m.text + '</div></div></div>';
                d.innerHTML = content;
                div.appendChild(d);
            });
            div.scrollTop = div.scrollHeight;
        };

        window.renderEmojiPicker();

        document.addEventListener('DOMContentLoaded', () => {
            const msgInput = document.getElementById('msg');
            if (msgInput) {
                msgInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') window.send();
                });
            }
            const savedUser = localStorage.getItem('user');
            if (savedUser) window.login(savedUser);
        });
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
  'esther-sienna': [],
  'esther-penelope': []
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
          chatId: msg.chatId
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
  console.log('Server running on port ' + PORT);
});
