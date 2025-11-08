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
    <title>✨ Anime Chat ✨</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        html { height: 100%; }
        body { height: 100%; overflow: hidden; font-family: 'Arial', sans-serif; -webkit-user-select: none; user-select: none; background: linear-gradient(135deg, #FFB6E1 0%, #FFE4E1 25%, #E1F5FF 50%, #F0E6FF 75%, #FFE4F0 100%); }
        .login-screen { position: fixed; width: 100vw; height: 100vh; background: linear-gradient(135deg, #FFB6E1 0%, #FFE4E1 25%, #E1F5FF 50%, #F0E6FF 75%, #FFE4F0 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; text-align: center; z-index: 100; }
        .login-screen h1 { font-size: 48px; margin-bottom: 15px; color: white; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
        .login-screen p { font-size: 16px; color: white; margin-bottom: 30px; font-weight: bold; }
        .login-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; max-width: 360px; }
        .login-btn { padding: 14px; background: white; color: #FF1493; border: none; border-radius: 12px; font-size: 14px; font-weight: bold; cursor: pointer; text-transform: uppercase; box-shadow: 0 4px 8px rgba(0,0,0,0.2); transition: all 0.3s; }
        .login-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.3); }
        .login-btn:active { transform: scale(0.95); }
        .container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #FFB6E1 0%, #FFE4E1 25%, #E1F5FF 50%, #F0E6FF 75%, #FFE4F0 100%); display: none; flex-direction: column; z-index: 50; }
        .container.show { display: flex; }
        .header { background: white; color: #FF1493; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: bold; flex-shrink: 0; gap: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
        #myname { font-size: 18px; text-transform: uppercase; }
        .logout-btn { background: #FF1493; color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 11px; font-weight: bold; text-transform: uppercase; }
        .tabs { display: flex; gap: 8px; padding: 10px; background: rgba(255,255,255,0.4); border-bottom: 2px solid rgba(255,255,255,0.5); overflow-x: auto; flex-shrink: 0; }
        .tab { padding: 8px 14px; background: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 12px; white-space: nowrap; color: #FF1493; flex-shrink: 0; text-transform: uppercase; transition: all 0.3s; }
        .tab:hover { opacity: 0.8; }
        .tab.active { background: #FFB6E1; color: white; }
        .chat-display { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; padding: 15px; -webkit-overflow-scrolling: touch; font-size: 13px; background: rgba(255,255,255,0.3); position: relative; }
        .chat-display::before { content: ''; position: fixed; bottom: -30px; right: -30px; width: 350px; height: 350px; background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><ellipse cx="80" cy="150" rx="50" ry="70" fill="rgba(0,0,0,0.08)"/><ellipse cx="150" cy="100" rx="45" ry="60" fill="rgba(0,0,0,0.08)"/><ellipse cx="220" cy="160" rx="40" ry="55" fill="rgba(0,0,0,0.08)"/></svg>'); background-size: contain; background-repeat: no-repeat; background-position: center; pointer-events: none; z-index: 0; }
        .message { margin-bottom: 12px; display: flex; flex-direction: column; position: relative; z-index: 2; animation: fadeIn 0.3s; }
        .message.own { align-items: flex-end; }
        .message-sender { font-size: 11px; color: #666; margin: 0 0 4px 0; font-weight: bold; letter-spacing: 1px; }
        .message-bubble { max-width: 70%; padding: 10px 14px; border-radius: 14px; word-wrap: break-word; font-size: 13px; font-weight: 500; line-height: 1.4; border: 1px solid rgba(255,255,255,0.3); }
        .message.own .message-bubble { background: linear-gradient(135deg, #FF1493, #FFD700); color: white; }
        .message.esther .message-bubble { background: rgba(0,200,255,0.8); color: white; }
        .message.valley .message-bubble { background: rgba(255,20,147,0.8); color: white; }
        .message.amaaya .message-bubble { background: rgba(50,205,50,0.8); color: white; }
        .message.mama .message-bubble { background: rgba(255,215,0,0.8); color: #333; }
        .message.mummy .message-bubble { background: rgba(255,105,180,0.8); color: white; }
        .message.hilary .message-bubble { background: rgba(147,112,219,0.8); color: white; }
        .message.nan .message-bubble { background: rgba(220,20,60,0.8); color: white; }
        .message.rishy .message-bubble { background: rgba(255,165,0,0.8); color: white; }
        .message.poppy .message-bubble { background: rgba(0,191,255,0.8); color: white; }
        .message.sienna .message-bubble { background: rgba(240,128,128,0.8); color: white; }
        .message.penelope .message-bubble { background: rgba(255,192,203,0.8); color: #333; }
        .input-area { background: rgba(255,255,255,0.85); border-top: 2px solid rgba(255,255,255,0.5); display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; padding: 10px; max-height: 50vh; overflow-y: auto; }
        .emoji-picker { display: none; grid-template-columns: repeat(6, 1fr); gap: 6px; padding: 10px; background: white; border-radius: 10px; max-height: 120px; overflow-y: auto; border: 1px solid #ddd; }
        .emoji-picker.show { display: grid; }
        .emoji-option { font-size: 20px; cursor: pointer; text-align: center; padding: 6px; border-radius: 8px; transition: all 0.2s; }
        .emoji-option:hover { transform: scale(1.15); }
        .games-panel { display: none; background: white; border-radius: 10px; padding: 10px; border: 1px solid #ddd; max-height: 220px; overflow-y: auto; }
        .games-panel.show { display: block; }
        .game-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
        .game-btn { padding: 10px; background: linear-gradient(135deg, #FF1493, #FFD700); color: white; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 12px; text-transform: uppercase; transition: all 0.3s; }
        .game-btn:hover { transform: translateY(-1px); }
        .game-btn:active { transform: scale(0.95); }
        .game-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .input-container { display: flex; gap: 6px; align-items: center; width: 100%; }
        .input-field { flex: 1; padding: 10px 12px; border: 2px solid #FFB6E1; border-radius: 10px; font-size: 13px; font-family: inherit; height: 40px; background: white; color: #333; font-weight: 500; }
        .input-field:focus { outline: none; border-color: #FF1493; }
        .input-field::placeholder { color: #999; }
        .emoji-btn { background: white; border: 2px solid #FFD700; color: #FF1493; padding: 8px 10px; border-radius: 8px; font-size: 16px; cursor: pointer; height: 40px; min-width: 40px; flex-shrink: 0; font-weight: bold; transition: all 0.3s; }
        .emoji-btn:hover { background: #FFD700; }
        .games-btn { background: white; border: 2px solid #FFB6E1; color: #FF1493; padding: 8px 10px; border-radius: 8px; font-size: 16px; cursor: pointer; height: 40px; font-weight: bold; min-width: 40px; flex-shrink: 0; transition: all 0.3s; }
        .games-btn:hover { background: #FFE4E1; }
        .send-btn { background: linear-gradient(135deg, #FF1493, #FFD700); color: white; border: none; padding: 8px 12px; border-radius: 10px; font-size: 11px; font-weight: bold; cursor: pointer; height: 40px; min-width: 50px; flex-shrink: 0; text-transform: uppercase; transition: all 0.3s; }
        .send-btn:hover { transform: translateY(-1px); }
        .send-btn:active { transform: scale(0.95); }
        .send-btn:disabled { background: #ccc; cursor: not-allowed; }
        .empty { text-align: center; color: white; padding: 40px 15px; font-size: 16px; font-weight: bold; }
        .game-status { text-align: center; padding: 10px; background: white; border-radius: 8px; color: #FF1493; font-weight: bold; margin-bottom: 8px; font-size: 12px; }
        .trivia-q { font-weight: bold; margin-bottom: 10px; color: #333; font-size: 13px; text-transform: uppercase; }
        .trivia-answers { display: grid; gap: 8px; margin-bottom: 10px; }
        .trivia-btn { padding: 10px; background: white; border: 2px solid #FF1493; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 12px; color: #FF1493; text-transform: uppercase; transition: all 0.3s; }
        .trivia-btn:hover { background: rgba(255,20,147,0.1); }
        .trivia-btn.correct { background: #00FF00; color: white; border-color: #00FF00; }
        .trivia-btn.wrong { background: #FF6347; color: white; border-color: #FF6347; }
        .trivia-result { text-align: center; margin-top: 8px; font-weight: bold; color: #333; font-size: 14px; }
        .letter-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin: 10px 0; }
        .letter-btn { padding: 8px; background: white; border: 2px solid #FF1493; border-radius: 6px; cursor: pointer; font-weight: bold; color: #FF1493; font-size: 11px; transition: all 0.2s; }
        .letter-btn:hover { background: rgba(255,20,147,0.1); }
        .letter-btn:disabled { opacity: 0.2; cursor: not-allowed; }
        .hangman-word { font-size: 28px; font-weight: bold; letter-spacing: 6px; text-align: center; margin: 12px 0; font-family: monospace; color: #FF1493; }
        .hangman-stage { font-size: 48px; text-align: center; margin: 8px 0; }
    </style>
</head>
<body>
    <div class="login-screen" id="login">
        <h1>✨ Anime Chat ✨</h1>
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
            <button class="login-btn" onclick="window.login('sienna')">🌺 Sienna</button>
            <button class="login-btn" onclick="window.login('penelope')">💝 Penelope</button>
        </div>
    </div>

    <div class="container" id="app">
        <div class="header">
            <div>✨ <span id="myname"></span></div>
            <button class="logout-btn" onclick="window.logout()">Logout</button>
        </div>
        <div class="tabs" id="tabs"></div>
        <div class="chat-display" id="chat"><div class="empty">Loading chat...</div></div>
        
        <div class="input-area">
            <div id="emojiPicker" class="emoji-picker"></div>
            <div id="gamesPanel" class="games-panel">
                <div class="game-buttons">
                    <button class="game-btn" onclick="window.playRPS()">✊ RPS</button>
                    <button class="game-btn" onclick="window.playDice()">🎲 Dice</button>
                    <button class="game-btn" onclick="window.playTrivia()">🧠 Trivia</button>
                    <button class="game-btn" onclick="window.playHangman()">🎯 Hangman</button>
                </div>

                <div id="rpsContainer" style="display: none;">
                    <div class="game-status" id="rpsStatus">Choose in 10s!</div>
                    <div class="game-buttons">
                        <button class="game-btn" onclick="window.selectRPS('rock')">✊ Rock</button>
                        <button class="game-btn" onclick="window.selectRPS('paper')">✋ Paper</button>
                        <button class="game-btn" onclick="window.selectRPS('scissors')">✌️ Scissors</button>
                    </div>
                </div>

                <div id="diceContainer" style="display: none;">
                    <div class="game-status">Roll the Dice!</div>
                    <div style="font-size: 36px; text-align: center; margin: 10px 0;" id="diceResult">🎲</div>
                    <button class="game-btn" style="width: 100%;" onclick="window.rollDice()">Roll!</button>
                </div>

                <div id="triviaContainer" style="display: none;">
                    <div class="trivia-q" id="triviaQuestion"></div>
                    <div id="triviaAnswers" class="trivia-answers"></div>
                    <div class="trivia-result" id="triviaResult"></div>
                    <div class="game-status" id="triviaScore"></div>
                </div>

                <div id="hangmanContainer" style="display: none;">
                    <div class="game-status" id="hangmanStatus">Hangman</div>
                    <div id="hangmanSetupPhase">
                        <input type="text" id="hangmanSetWord" placeholder="Enter word..." maxlength="12" style="width: 100%; padding: 8px; margin: 6px 0; border: 2px solid #FF1493; border-radius: 8px; color: #333; font-size: 12px; font-weight: bold;">
                        <button class="game-btn" style="width: 100%; margin-top: 6px;" onclick="window.startHangman()">Set Word</button>
                    </div>
                    <div id="hangmanGamePhase" style="display: none;">
                        <div class="hangman-stage" id="hangmanStage">😊</div>
                        <div class="hangman-word" id="hangmanWord">_ _ _</div>
                        <div id="hangmanLetterGrid" class="letter-grid"></div>
                        <div id="hangmanResult" style="text-align: center; font-weight: bold; margin-top: 8px; color: #FF1493; font-size: 13px;"></div>
                    </div>
                </div>
            </div>
            <div class="input-container">
                <button class="emoji-btn" onclick="window.toggleEmoji()">😊</button>
                <button class="games-btn" onclick="window.toggleGames()">🎮</button>
                <input type="text" class="input-field" id="msg" placeholder="Say something..." disabled>
                <button class="send-btn" id="sendBtn" onclick="window.send()" disabled>Send</button>
            </div>
        </div>
    </div>

    <script>
        const EMOJIS = ['😊','😂','😍','🥰','😎','🤗','🎉','🎊','🎈','🎁','🍰','🍕','🍔','☕','🧋','🐱','😺','😸','👍','💕','💖','⭐','✨','🌟','💫'];
        const HEART_EMOJIS = ['💕', '💖', '💗', '💓', '💞', '💘', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤍', '🤎', '🖤'];
        
        const TRIVIA_QUESTIONS = [
            {q: 'Capital of France?', a: ['Paris','Lyon','Nice','Marseille'], c: 0},
            {q: 'Largest ocean?', a: ['Pacific','Atlantic','Indian','Arctic'], c: 0},
            {q: 'Fastest land animal?', a: ['Cheetah','Lion','Horse','Gazelle'], c: 0},
            {q: 'Largest animal?', a: ['Blue Whale','Elephant','Giraffe','Hippo'], c: 0},
            {q: 'Capital of Japan?', a: ['Tokyo','Osaka','Kyoto','Yokohama'], c: 0},
            {q: 'Deepest ocean trench?', a: ['Mariana','Tonga','Philippine','Kuril'], c: 0},
            {q: 'Capital of Egypt?', a: ['Cairo','Alexandria','Giza','Luxor'], c: 0},
            {q: 'Bird cannot fly?', a: ['Penguin','Ostrich','Kiwi','Chicken'], c: 0},
            {q: 'Capital of Brazil?', a: ['Brasília','Rio','São Paulo','Salvador'], c: 0},
            {q: 'Octopus legs?', a: ['8','6','10','12'], c: 0},
            {q: 'Capital of Canada?', a: ['Ottawa','Toronto','Vancouver','Montreal'], c: 0},
            {q: 'Capital of Germany?', a: ['Berlin','Munich','Hamburg','Cologne'], c: 0},
            {q: 'Largest desert?', a: ['Antarctic','Sahara','Gobi','Kalahari'], c: 0},
            {q: 'Capital of Italy?', a: ['Rome','Milan','Venice','Florence'], c: 0},
            {q: 'Continents total?', a: ['7','5','6','8'], c: 0},
            {q: 'Capital of Spain?', a: ['Madrid','Barcelona','Valencia','Seville'], c: 0},
            {q: 'Smallest country?', a: ['Vatican','Monaco','San Marino','Liechtenstein'], c: 0},
            {q: 'Mickey Mouse creator?', a: ['Walt Disney','Bob Kane','Chuck Jones','Hal Roach'], c: 0},
            {q: 'Gravity scientist?', a: ['Newton','Einstein','Galileo','Archimedes'], c: 0},
            {q: 'Basketball inventor?', a: ['Naismith','Spalding','Morgan','Gulick'], c: 0}
        ];

        const HANGMAN_STAGES = ['😊', '😐', '😕', '😟', '😢', '😭', '💀'];

        const AVATARS = {
            esther: '🐱', valley: '🎀', amaaya: '✨', mama: '👑', mummy: '💎',
            hilary: '🌸', nan: '💜', rishy: '⭐', poppy: '🌷', sienna: '🌺', penelope: '💝'
        };

        let currentUser = null, currentChat = 'group', allChats = [], messages = {}, ws = null, connected = false;
        let rpsTimeLeft = 0, rpsTimer = null;
        let hangmanWord = '', hangmanGuessed = [], hangmanWrong = 0, hangmanGameActive = false;
        let triviaScore = {}, triviaTotal = 0, triviaAnswered = false, triviaCurrentQ = null, triviaUsers = new Set();

        function getRandomHeartEmoji() {
            return HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
        }

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
                } else if (data.type === 'trivia_start') {
                    if (data.chatId === currentChat) {
                        triviaScore = {};
                        triviaTotal = 0;
                        triviaUsers.clear();
                        triviaAnswered = false;
                        document.getElementById('triviaContainer').style.display = 'block';
                        window.nextTriviaQuestion();
                    }
                } else if (data.type === 'trivia_answer') {
                    if (data.chatId === currentChat && !triviaScore[data.user]) {
                        triviaScore[data.user] = data.correct ? 1 : 0;
                        triviaUsers.add(data.user);
                        if (triviaUsers.size >= 2) {
                            window.showTriviaResult();
                        }
                    }
                } else if (data.type === 'hangman_start') {
                    if (data.chatId === currentChat && data.user !== currentUser) {
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
                btn.textContent = chatId === 'group' ? '👥 Group' : '💬 ' + chatId.split('-')[1];
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
                btn.onclick = () => { document.getElementById('msg').value += emoji; picker.classList.remove('show'); };
                picker.appendChild(btn);
            });
        };

        window.toggleEmoji = function() {
            const picker = document.getElementById('emojiPicker');
            picker.classList.toggle('show');
            document.getElementById('gamesPanel').classList.remove('show');
        };

        window.toggleGames = function() {
            const games = document.getElementById('gamesPanel');
            games.classList.toggle('show');
            document.getElementById('emojiPicker').classList.remove('show');
        };

        window.playRPS = function() {
            document.getElementById('rpsContainer').style.display = 'block';
            document.getElementById('hangmanContainer').style.display = 'none';
            document.getElementById('triviaContainer').style.display = 'none';
            document.getElementById('diceContainer').style.display = 'none';
            rpsTimeLeft = 10;
            document.getElementById('rpsStatus').textContent = 'Choose in 10s!';
            rpsTimer = setInterval(() => {
                rpsTimeLeft--;
                document.getElementById('rpsStatus').textContent = rpsTimeLeft + 's left!';
                if (rpsTimeLeft <= 0) {
                    clearInterval(rpsTimer);
                    document.querySelectorAll('#rpsContainer .game-btn').forEach(b => b.disabled = true);
                }
            }, 1000);
        };

        window.selectRPS = function(choice) {
            document.querySelectorAll('#rpsContainer .game-btn').forEach(b => b.disabled = true);
            if (connected) {
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: 'Played: ' + choice }));
            }
        };

        window.playDice = function() {
            document.getElementById('diceContainer').style.display = 'block';
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('hangmanContainer').style.display = 'none';
            document.getElementById('triviaContainer').style.display = 'none';
        };

        window.rollDice = function() {
            const result = Math.floor(Math.random() * 6) + 1;
            const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];
            document.getElementById('diceResult').textContent = emojis[result - 1];
            document.querySelector('#diceContainer .game-btn').disabled = true;
            ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: 'Rolled: ' + result }));
        };

        window.playTrivia = function() {
            triviaScore = {};
            triviaTotal = 0;
            triviaUsers.clear();
            triviaAnswered = false;
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('diceContainer').style.display = 'none';
            document.getElementById('hangmanContainer').style.display = 'none';
            document.getElementById('triviaContainer').style.display = 'block';
            ws.send(JSON.stringify({ type: 'trivia_start', user: currentUser, chatId: currentChat }));
            ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: 'Started Trivia!' }));
            window.nextTriviaQuestion();
        };

        window.nextTriviaQuestion = function() {
            if (triviaTotal >= 5) {
                let scores = 'Final: ';
                Object.entries(triviaScore).forEach(([u, s]) => { scores += u + ':' + s + ' '; });
                document.getElementById('triviaQuestion').textContent = 'Done!';
                document.getElementById('triviaAnswers').innerHTML = '';
                document.getElementById('triviaResult').textContent = '';
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: scores }));
                return;
            }
            triviaTotal++;
            triviaUsers.clear();
            triviaAnswered = false;
            triviaCurrentQ = TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)];
            document.getElementById('triviaQuestion').textContent = triviaCurrentQ.q;
            const answers = document.getElementById('triviaAnswers');
            answers.innerHTML = '';
            triviaCurrentQ.a.forEach((ans, idx) => {
                const btn = document.createElement('button');
                btn.className = 'trivia-btn';
                btn.textContent = ans;
                btn.onclick = () => window.submitTriviaAnswer(idx);
                answers.appendChild(btn);
            });
            document.getElementById('triviaResult').textContent = '';
            document.getElementById('triviaScore').textContent = triviaTotal + '/5';
        };

        window.submitTriviaAnswer = function(idx) {
            if (triviaAnswered) return;
            triviaAnswered = true;
            const isCorrect = idx === triviaCurrentQ.c;
            if (!triviaScore[currentUser]) triviaScore[currentUser] = 0;
            if (isCorrect) triviaScore[currentUser]++;
            ws.send(JSON.stringify({ type: 'trivia_answer', user: currentUser, chatId: currentChat, correct: isCorrect }));
            document.querySelectorAll('.trivia-btn').forEach((b, i) => {
                if (i === triviaCurrentQ.c) b.classList.add('correct');
                else if (i === idx) b.classList.add('wrong');
            });
            document.getElementById('triviaResult').textContent = isCorrect ? '✓' : '✗';
        };

        window.showTriviaResult = function() {
            setTimeout(window.nextTriviaQuestion, 1000);
        };

        window.playHangman = function() {
            hangmanWord = '';
            hangmanGuessed = [];
            hangmanWrong = 0;
            hangmanGameActive = false;
            document.getElementById('hangmanContainer').style.display = 'block';
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('triviaContainer').style.display = 'none';
            document.getElementById('diceContainer').style.display = 'none';
            document.getElementById('hangmanSetupPhase').style.display = 'block';
            document.getElementById('hangmanGamePhase').style.display = 'none';
            document.getElementById('hangmanSetWord').value = '';
        };

        window.startHangman = function() {
            const word = document.getElementById('hangmanSetWord').value.toUpperCase();
            if (word.length < 3) { alert('Too short!'); return; }
            hangmanWord = word;
            hangmanGuessed = [];
            hangmanWrong = 0;
            hangmanGameActive = true;
            document.getElementById('hangmanSetupPhase').style.display = 'none';
            document.getElementById('hangmanGamePhase').style.display = 'block';
            window.renderHangmanGame();
            if (connected) {
                ws.send(JSON.stringify({ type: 'hangman_start', user: currentUser, chatId: currentChat }));
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: 'Started Hangman!' }));
            }
        };

        window.renderHangmanGame = function() {
            if (!hangmanGameActive) return;
            const display = hangmanWord.split('').map(l => hangmanGuessed.includes(l) ? l : '_').join(' ');
            document.getElementById('hangmanWord').textContent = display;
            document.getElementById('hangmanStage').textContent = HANGMAN_STAGES[Math.min(hangmanWrong, 6)];
            document.getElementById('hangmanStatus').textContent = hangmanWrong + '/6';
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
            if (won || lost) {
                hangmanGameActive = false;
                document.getElementById('hangmanResult').textContent = won ? 'Won!' : 'Lost: ' + hangmanWord;
            }
        };

        window.guessHangmanLetter = function(letter) {
            if (!hangmanGameActive || hangmanGuessed.includes(letter)) return;
            hangmanGuessed.push(letter);
            if (!hangmanWord.includes(letter)) hangmanWrong++;
            if (connected) ws.send(JSON.stringify({ type: 'hangman_guess', user: currentUser, chatId: currentChat, letter: letter, correct: hangmanWord.includes(letter) }));
            window.renderHangmanGame();
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
            if (msgs.length === 0) { div.innerHTML = '<div class="empty">Chat ready!</div>'; return; }
            msgs.forEach(m => {
                const d = document.createElement('div');
                d.className = 'message ' + (m.user === currentUser ? 'own' : m.user);
                const heartEmoji = getRandomHeartEmoji();
                const sender = '<div class="message-sender">' + heartEmoji + ' ' + m.user + ' ' + heartEmoji + '</div>';
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
server.listen(PORT, () => { console.log('Anime Chat Server Running'); });
