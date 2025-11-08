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
    <title>💬 Chat Games</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #FFC4DB 0%, #FFE5B4 16%, #FFFFCC 32%, #D4F1ED 48%, #C9D9F4 64%, #E0D4F7 80%, #FFC4DB 100%); min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 10px; }
        body.dark-mode { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); }
        .login-screen { width: 100%; max-width: 480px; background: white; border-radius: 28px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); padding: 40px; text-align: center; }
        .dark-mode .login-screen { background: #2a2a3e; color: white; }
        .login-screen h1 { font-size: 42px; margin-bottom: 8px; color: #9C27B0; font-weight: 800; }
        .dark-mode .login-screen h1 { color: #9C27B0; }
        .login-screen p { font-size: 15px; color: #9C27B0; margin-bottom: 35px; font-weight: 600; }
        .dark-mode .login-screen p { color: #9C27B0; }
        .login-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .login-btn { padding: 16px; background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: #9C27B0; border: none; border-radius: 14px; font-size: 16px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
        .login-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6); }
        .container { width: 100%; max-width: 480px; background: white; border-radius: 28px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); display: none; flex-direction: column; height: 90vh; max-height: 750px; overflow: hidden; }
        .dark-mode .container { background: #2a2a3e; }
        .container.show { display: flex; }
        .header { background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: #9C27B0; padding: 16px; border-radius: 28px 28px 0 0; display: flex; justify-content: space-between; align-items: center; font-size: 20px; font-weight: 700; }
        .header-title { flex-grow: 1; }
        #myname { color: #9C27B0; font-weight: 900; }
        .logout-btn { background: rgba(156, 39, 176, 0.25); border: none; color: #9C27B0; padding: 6px 12px; border-radius: 10px; cursor: pointer; font-size: 11px; font-weight: 600; }
        .logout-btn:hover { background: rgba(156, 39, 176, 0.35); }
        .dark-mode-btn { background: rgba(156, 39, 176, 0.25); border: none; color: #9C27B0; padding: 6px 12px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; }
        .dark-mode-btn:hover { background: rgba(156, 39, 176, 0.35); }
        .tabs { display: flex; gap: 6px; padding: 10px; background: #f8f9fb; border-bottom: 2px solid #e8eaf6; overflow-x: auto; }
        .dark-mode .tabs { background: #1a1a2e; border-color: #444; }
        .tab { padding: 10px 14px; background: white; border: 2px solid #e0e0e0; border-radius: 18px; cursor: pointer; font-weight: 600; font-size: 12px; white-space: nowrap; color: #9C27B0; }
        .dark-mode .tab { background: #3a3a4e; border-color: #555; color: #9C27B0; }
        .tab.active { background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: #9C27B0; box-shadow: 0 3px 10px rgba(156, 39, 176, 0.3); }
        .chat-display { flex: 1; overflow-y: auto; padding: 20px 16px; }
        .dark-mode .chat-display { background: #1a1a2e; }
        .message { margin-bottom: 12px; display: flex; flex-direction: column; }
        .message.own { align-items: flex-end; }
        .message-content { display: flex; gap: 8px; align-items: flex-end; }
        .message.own .message-content { flex-direction: row-reverse; }
        .avatar { width: 28px; height: 28px; border-radius: 50%; font-size: 16px; display: flex; align-items: center; justify-content: center; }
        .message-bubble { max-width: 75%; padding: 12px 16px; border-radius: 16px; word-wrap: break-word; font-size: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-weight: 500; line-height: 1.5; }
        .message.own .message-bubble { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .message.esther .message-bubble { background: #5B6FC7; color: white; }
        .message.valley .message-bubble { background: #E91E63; color: white; }
        .message.amaaya .message-bubble { background: #00BCD4; color: white; }
        .message.mama .message-bubble { background: #26A69A; color: white; }
        .message.mummy .message-bubble { background: #FF6B6B; color: white; }
        .message.hilary .message-bubble { background: #AB47BC; color: white; }
        .message.nan .message-bubble { background: #EC407A; color: white; }
        .message.rishy .message-bubble { background: #FF9800; color: white; }
        .message.poppy .message-bubble { background: #4CAF50; color: white; }
        .message.sienna .message-bubble { background: #9C27B0; color: white; }
        .message.penelope .message-bubble { background: #FF1493; color: white; }
        .message-sender { font-size: 12px; color: #9C27B0; margin: 0 0 6px 0; font-weight: 600; text-transform: capitalize; }
        .dark-mode .message-sender { color: #9C27B0; }
        .message.own .message-sender { text-align: right; }
        .input-area { padding: 12px; background: white; border-top: 2px solid #e8eaf6; display: flex; flex-direction: column; gap: 8px; }
        .dark-mode .input-area { background: #2a2a3e; border-color: #444; }
        .emoji-picker { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; padding: 12px; background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%); border-radius: 14px; max-height: 200px; overflow-y: auto; border: 2px solid #ffc107; }
        .emoji-option { font-size: 24px; cursor: pointer; text-align: center; padding: 8px; border-radius: 10px; user-select: none; background: white; }
        .emoji-option:hover { transform: scale(1.2); }
        .games-panel { display: none; background: #f5f5f5; border-radius: 14px; padding: 12px; border: 2px solid #e0e0e0; margin-bottom: 8px; }
        .dark-mode .games-panel { background: #3a3a4e; border-color: #555; }
        .games-panel.show { display: block; }
        .game-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
        .game-btn { padding: 12px; background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: #9C27B0; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 13px; }
        .game-btn:hover { transform: scale(1.02); }
        .game-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .letter-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin: 12px 0; }
        .letter-btn { padding: 8px; background: white; border: 2px solid #9C27B0; border-radius: 8px; cursor: pointer; font-weight: 700; color: #9C27B0; }
        .letter-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .hangman-word { font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; margin: 12px 0; font-family: monospace; color: #9C27B0; }
        .hangman-stage { font-size: 64px; text-align: center; margin: 12px 0; }
        .input-container { display: flex; gap: 10px; align-items: center; }
        .input-field { flex: 1; padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 20px; font-size: 14px; font-family: inherit; height: 40px; }
        .dark-mode .input-field { background: #3a3a4e; border-color: #555; color: white; }
        .input-field:focus { outline: none; border-color: #667eea; }
        .input-field::placeholder { color: #999; }
        .emoji-btn { background: white; border: 2px solid #ffc107; color: #333; padding: 8px 10px; border-radius: 12px; font-size: 16px; cursor: pointer; height: 40px; }
        .emoji-btn:hover { background: #ffc107; }
        .games-btn { background: white; border: 2px solid #9C27B0; color: #9C27B0; padding: 8px 10px; border-radius: 12px; font-size: 16px; cursor: pointer; height: 40px; font-weight: 700; }
        .games-btn:hover { background: #f3e5f5; }
        .send-btn { background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: #9C27B0; border: none; padding: 8px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; cursor: pointer; height: 40px; min-width: 50px; }
        .send-btn:hover { transform: translateY(-2px); }
        .send-btn:disabled { background: #ccc; cursor: not-allowed; }
        .empty { text-align: center; color: #9C27B0; padding: 40px 20px; font-size: 15px; font-weight: 600; }
        .game-status { text-align: center; padding: 12px; background: #f3e5f5; border-radius: 10px; color: #9C27B0; font-weight: 600; margin-bottom: 8px; }
    </style>
</head>
<body>
    <div class="login-screen" id="login">
        <h1>💜 Chat</h1>
        <p>Select Your Name 💜</p>
        <div class="login-buttons">
            <button class="login-btn" onclick="window.login('esther')">🐱 Esther</button>
            <button class="login-btn" onclick="window.login('valley')">😺 Valley</button>
            <button class="login-btn" onclick="window.login('amaaya')">😸 Amaaya</button>
            <button class="login-btn" onclick="window.login('mama')">😻 Mama</button>
            <button class="login-btn" onclick="window.login('mummy')">😼 Mummy</button>
            <button class="login-btn" onclick="window.login('hilary')">😽 Hilary</button>
            <button class="login-btn" onclick="window.login('nan')">🐱 Nan</button>
            <button class="login-btn" onclick="window.login('rishy')">😺 Rishy</button>
            <button class="login-btn" onclick="window.login('poppy')">😸 Poppy</button>
            <button class="login-btn" onclick="window.login('sienna')">😻 Sienna</button>
            <button class="login-btn" onclick="window.login('penelope')">😼 Penelope</button>
        </div>
    </div>

    <div class="container" id="app">
        <div class="header">
            <div class="header-title">💬 <span id="myname"></span></div>
            <button class="dark-mode-btn" onclick="window.toggleDarkMode()">🌙</button>
            <button class="logout-btn" onclick="window.logout()">Logout</button>
        </div>
        <div class="tabs" id="tabs"></div>
        <div class="chat-display" id="chat"><div class="empty">Loading...</div></div>
        
        <div class="input-area">
            <div id="emojiPicker" class="emoji-picker" style="display: none;"></div>
            <div id="gamesPanel" class="games-panel">
                <div class="game-buttons">
                    <button class="game-btn" onclick="window.playRPS()">✊ RPS</button>
                    <button class="game-btn" onclick="window.playDice()">🎲 Dice</button>
                    <button class="game-btn" onclick="window.playHangman()">🎯 Hangman</button>
                    <button class="game-btn" onclick="window.playWordle()">🎮 Wordle</button>
                </div>

                <div id="rpsContainer" style="display: none;">
                    <div class="game-status" id="rpsStatus">Choose in 10 seconds!</div>
                    <div class="game-buttons">
                        <button class="game-btn" onclick="window.selectRPS('rock')">✊ Rock</button>
                        <button class="game-btn" onclick="window.selectRPS('paper')">✋ Paper</button>
                        <button class="game-btn" onclick="window.selectRPS('scissors')">✌️ Scissors</button>
                    </div>
                </div>

                <div id="diceContainer" style="display: none;">
                    <div class="game-status">🎲 Closest to 6 wins!</div>
                    <div style="font-size: 48px; text-align: center; margin: 12px 0;" id="diceResult">🎲</div>
                    <button class="game-btn" style="width: 100%;" onclick="window.rollDice()">🎲 Roll</button>
                </div>

                <div id="hangmanContainer" style="display: none;">
                    <div class="game-status" id="hangmanStatus">🎯 Hangman</div>
                    <div id="hangmanSetupPhase">
                        <input type="text" id="hangmanSetWord" placeholder="Enter word..." maxlength="15" style="width: 100%; padding: 8px; margin: 8px 0; border: 2px solid #9C27B0; border-radius: 8px; color: #9C27B0;">
                        <button class="game-btn" style="width: 100%;" onclick="window.startHangman()">🎯 Set Word</button>
                    </div>
                    <div id="hangmanGamePhase" style="display: none;">
                        <div class="hangman-stage" id="hangmanStage">😊</div>
                        <div class="hangman-word" id="hangmanWord">_ _ _ _ _</div>
                        <div id="hangmanLetterGrid" class="letter-grid"></div>
                        <div id="hangmanResult" style="text-align: center; font-weight: 700; margin-top: 8px; color: #9C27B0;"></div>
                    </div>
                </div>

                <div id="wordleContainer" style="display: none;">
                    <div class="game-status">🎮 Guess the word!</div>
                    <div id="wordleGuesses" style="text-align: center; margin: 12px 0;"></div>
                    <input type="text" id="wordleInput" placeholder="5 letters..." maxlength="5" style="width: 100%; padding: 8px; margin: 8px 0; border: 2px solid #9C27B0; border-radius: 8px; color: #9C27B0;">
                    <button class="game-btn" style="width: 100%;" onclick="window.submitWordleGuess()">🎮 Guess</button>
                </div>
            </div>
            <div class="input-container">
                <button class="emoji-btn" onclick="window.toggleEmoji()">😀</button>
                <button class="games-btn" onclick="window.toggleGames()">🎮</button>
                <input type="text" class="input-field" id="msg" placeholder="Type message..." disabled>
                <button class="send-btn" id="sendBtn" onclick="window.send()" disabled>Send</button>
            </div>
        </div>
    </div>

    <script>
        const EMOJIS = ['😀','😂','😍','🥰','😎','🤗','😊','🎉','🎊','🎈','🎁','🎂','🍰','🍕','🍔','🍟','☕','🧋','🍹','🍩','🍪','🐱','😺','😸','😻','😼','🦁','🐮','🐷','🦊','🐻','🐼','🐨','🐹','🐰','👍','👏','🙌','💪','🤝','💋','💕','💖','💗','💓','💞','💘','💝','⭐','✨','🌟','💫','🔥','⚡','💜','💜','💜'];
        const WORDLE_WORDS = ['HAPPY', 'SMILE', 'DANCE', 'PIZZA', 'BEACH', 'MUSIC', 'DREAM', 'MAGIC', 'SUNNY', 'HEART', 'FRIEND', 'LAUGH', 'PARTY', 'CANDY', 'KITTY', 'PUPPY', 'GAME', 'CHAT', 'PLAY', 'FUN'];
        const HANGMAN_STAGES = ['😊', '😐', '😕', '😟', '😢', '😭', '💀'];

        const USERS = {
            esther: 'Esther', valley: 'Valley', amaaya: 'Amaaya', mama: 'Mama', mummy: 'Mummy',
            hilary: 'Hilary', nan: 'Nan', rishy: 'Rishy', poppy: 'Poppy', sienna: 'Sienna', penelope: 'Penelope'
        };

        const AVATARS = {
            esther: '🐱', valley: '😺', amaaya: '😸', mama: '😻', mummy: '😼',
            hilary: '😽', nan: '🐱', rishy: '😺', poppy: '😸', sienna: '😻', penelope: '😼'
        };

        let currentUser = null, currentChat = 'group', allChats = [], messages = {}, ws = null, connected = false;
        let rpsChoice = null, rpsTimeLeft = 0, rpsTimer = null;
        let hangmanWord = '', hangmanGuessed = [], hangmanWrong = 0, hangmanGameActive = false, hangmanSetBy = '';
        let wordleWord = '', wordleGuesses = [], wordleGameOver = false;
        let diceRolls = {};

        window.toggleDarkMode = function() {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        };

        window.login = function(user) {
            if (!user) return;
            currentUser = user;
            localStorage.setItem('user', user);
            allChats = ['group'];
            
            if (user === 'esther') {
                allChats = ['group', 'esther-mama', 'esther-mummy', 'esther-hilary', 'esther-nan', 'esther-rishy', 'esther-poppy', 'esther-sienna', 'esther-penelope'];
            } else if (['mama', 'mummy'].includes(user)) {
                allChats = ['group', 'esther-mama', 'esther-mummy', 'esther-hilary', 'esther-nan', 'esther-rishy', 'esther-poppy', 'esther-sienna', 'esther-penelope'];
            } else if (['valley', 'amaaya', 'hilary'].includes(user)) {
                allChats.push('esther-' + user);
            } else if (['nan', 'rishy', 'poppy', 'sienna', 'penelope'].includes(user)) {
                allChats = ['esther-' + user];
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
            document.getElementById('myname').textContent = user;
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
                } else if (data.type === 'rps_choice') {
                    if (data.chatId === currentChat) {
                        document.getElementById('rpsStatus').textContent = data.user + ' chose ' + data.choice + ' ✊';
                    }
                } else if (data.type === 'hangman_start') {
                    if (data.chatId === currentChat && data.user !== currentUser) {
                        hangmanSetBy = data.user;
                        hangmanGameActive = true;
                        hangmanGuessed = [];
                        hangmanWrong = 0;
                        document.getElementById('hangmanSetupPhase').style.display = 'none';
                        document.getElementById('hangmanGamePhase').style.display = 'block';
                        window.renderHangmanGame();
                    }
                } else if (data.type === 'hangman_guess') {
                    if (data.chatId === currentChat) {
                        hangmanGuessed.push(data.letter);
                        if (!data.correct) hangmanWrong++;
                        window.renderHangmanGame();
                    }
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
                btn.textContent = chatId === 'group' ? '👥 Group' : '💜 ' + chatId.split('-')[1];
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
            picker.style.display = picker.style.display === 'none' ? 'grid' : 'none';
        };

        window.toggleGames = function() {
            document.getElementById('gamesPanel').classList.toggle('show');
        };

        window.playRPS = function() {
            rpsChoice = null;
            document.getElementById('rpsContainer').style.display = 'block';
            document.getElementById('hangmanContainer').style.display = 'none';
            document.getElementById('wordleContainer').style.display = 'none';
            document.getElementById('diceContainer').style.display = 'none';
            rpsTimeLeft = 10;
            document.getElementById('rpsStatus').textContent = '⏱️ 10 seconds to choose!';
            rpsTimer = setInterval(() => {
                rpsTimeLeft--;
                document.getElementById('rpsStatus').textContent = '⏱️ ' + rpsTimeLeft + ' seconds left';
                if (rpsTimeLeft <= 0) {
                    clearInterval(rpsTimer);
                    document.querySelectorAll('#rpsContainer .game-btn').forEach(b => b.disabled = true);
                }
            }, 1000);
        };

        window.selectRPS = function(choice) {
            rpsChoice = choice;
            document.querySelectorAll('#rpsContainer .game-btn').forEach(b => b.disabled = true);
            if (connected) ws.send(JSON.stringify({ type: 'rps_choice', user: currentUser, chatId: currentChat, choice: choice }));
            const emojis = { rock: '✊', paper: '✋', scissors: '✌️' };
            ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎮 ' + currentUser + ' played ' + emojis[choice] }));
        };

        window.playDice = function() {
            diceRolls = {};
            document.getElementById('diceContainer').style.display = 'block';
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('hangmanContainer').style.display = 'none';
            document.getElementById('wordleContainer').style.display = 'none';
            document.getElementById('diceResult').textContent = '🎲';
        };

        window.rollDice = function() {
            const result = Math.floor(Math.random() * 6) + 1;
            const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];
            document.getElementById('diceResult').textContent = emojis[result - 1];
            document.querySelector('#diceContainer .game-btn').disabled = true;
            ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎲 ' + currentUser + ' rolled: ' + result }));
        };

        window.playHangman = function() {
            hangmanWord = '';
            hangmanGuessed = [];
            hangmanWrong = 0;
            hangmanGameActive = false;
            hangmanSetBy = '';
            document.getElementById('hangmanContainer').style.display = 'block';
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('wordleContainer').style.display = 'none';
            document.getElementById('diceContainer').style.display = 'none';
            document.getElementById('hangmanSetupPhase').style.display = 'block';
            document.getElementById('hangmanGamePhase').style.display = 'none';
            document.getElementById('hangmanSetWord').value = '';
        };

        window.startHangman = function() {
            const word = document.getElementById('hangmanSetWord').value.toUpperCase();
            if (word.length < 3) { alert('Word too short!'); return; }
            hangmanWord = word;
            hangmanGuessed = [];
            hangmanWrong = 0;
            hangmanSetBy = currentUser;
            hangmanGameActive = true;
            document.getElementById('hangmanSetupPhase').style.display = 'none';
            document.getElementById('hangmanGamePhase').style.display = 'block';
            window.renderHangmanGame();
            if (connected) {
                ws.send(JSON.stringify({ type: 'hangman_start', user: currentUser, chatId: currentChat, wordLength: word.length }));
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎯 ' + currentUser + ' started Hangman! Guess the word.' }));
            }
        };

        window.renderHangmanGame = function() {
            if (!hangmanGameActive) return;
            const display = hangmanWord.split('').map(l => hangmanGuessed.includes(l) ? l : '_').join(' ');
            document.getElementById('hangmanWord').textContent = display;
            document.getElementById('hangmanStage').textContent = HANGMAN_STAGES[hangmanWrong];
            document.getElementById('hangmanStatus').textContent = '🎯 Wrong: ' + hangmanWrong + '/6';
            
            const grid = document.getElementById('hangmanLetterGrid');
            if (grid.children.length === 0) {
                for (let i = 65; i <= 90; i++) {
                    const btn = document.createElement('button');
                    btn.textContent = String.fromCharCode(i);
                    btn.className = 'letter-btn';
                    btn.onclick = () => window.guessHangmanLetter(String.fromCharCode(i));
                    grid.appendChild(btn);
                }
            }
            document.querySelectorAll('.letter-btn').forEach(btn => {
                if (hangmanGuessed.includes(btn.textContent)) btn.disabled = true;
            });

            const won = hangmanWord.split('').every(l => hangmanGuessed.includes(l));
            const lost = hangmanWrong >= 6;
            if (won) {
                hangmanGameActive = false;
                document.getElementById('hangmanResult').textContent = '🎉 YOU WIN! Word: ' + hangmanWord;
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎯 Someone won Hangman! Word: ' + hangmanWord }));
            } else if (lost) {
                hangmanGameActive = false;
                document.getElementById('hangmanResult').textContent = '💀 GAME OVER! Word: ' + hangmanWord;
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎯 Hangman over. Word: ' + hangmanWord }));
            }
        };

        window.guessHangmanLetter = function(letter) {
            if (!hangmanGameActive || hangmanGuessed.includes(letter)) return;
            hangmanGuessed.push(letter);
            if (!hangmanWord.includes(letter)) hangmanWrong++;
            if (connected) ws.send(JSON.stringify({ type: 'hangman_guess', user: currentUser, chatId: currentChat, letter: letter, correct: hangmanWord.includes(letter) }));
            window.renderHangmanGame();
        };

        window.playWordle = function() {
            wordleWord = WORDLE_WORDS[Math.floor(Math.random() * WORDLE_WORDS.length)];
            wordleGuesses = [];
            wordleGameOver = false;
            document.getElementById('wordleContainer').style.display = 'block';
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('hangmanContainer').style.display = 'none';
            document.getElementById('diceContainer').style.display = 'none';
            document.getElementById('wordleInput').value = '';
            document.getElementById('wordleGuesses').innerHTML = '';
            ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎮 ' + currentUser + ' started Wordle! Guess the 5-letter word.' }));
        };

        window.submitWordleGuess = function() {
            const input = document.getElementById('wordleInput').value.toUpperCase();
            if (input.length !== 5) return;
            wordleGuesses.push(input);
            document.getElementById('wordleInput').value = '';
            const div = document.getElementById('wordleGuesses');
            div.innerHTML = '';
            wordleGuesses.forEach(guess => {
                let row = '';
                for (let i = 0; i < 5; i++) {
                    const letter = guess[i];
                    const color = letter === wordleWord[i] ? '#4CAF50' : wordleWord.includes(letter) ? '#FFC107' : '#CCC';
                    row += '<span style="display: inline-block; width: 28px; height: 28px; line-height: 28px; background: ' + color + '; color: white; margin: 2px; border-radius: 4px; font-weight: 700;">' + letter + '</span>';
                }
                div.innerHTML += row + '<br>';
            });
            if (input === wordleWord) {
                wordleGameOver = true;
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎮 Someone won Wordle! Word: ' + wordleWord }));
            } else if (wordleGuesses.length >= 6) {
                wordleGameOver = true;
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎮 Wordle over. Word: ' + wordleWord }));
            }
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
            div.innerHTML = '';
            const msgs = messages[currentChat] || [];
            if (msgs.length === 0) { div.innerHTML = '<div class="empty">💬 Start chatting! 💜</div>'; return; }
            msgs.forEach(m => {
                const d = document.createElement('div');
                d.className = 'message ' + (m.user === currentUser ? 'own' : m.user);
                const avatar = '<div class="avatar">' + AVATARS[m.user] + '</div>';
                const content = '<div class="message-content">' + avatar + '<div><div class="message-sender">' + m.user + '</div><div class="message-bubble">' + m.text + '</div></div></div>';
                d.innerHTML = content;
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
  'esther-penelope': []
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
      } else {
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(data);
          }
        });
      }
    } catch (error) {}
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { console.log('💜 Server running on ' + PORT); });
