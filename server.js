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
    <title>✨ Cosmic Anime Chat ✨</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 10px #FF00FF, 0 0 20px #00FFFF; } 50% { box-shadow: 0 0 20px #FF00FF, 0 0 40px #00FFFF; } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes shimmer { 0%, 100% { text-shadow: 0 0 10px #FF00FF; } 50% { text-shadow: 0 0 20px #00FFFF; } }
        html { height: 100%; }
        body { height: 100%; overflow: hidden; font-family: 'Arial Black', sans-serif; -webkit-user-select: none; user-select: none; background: #000814; }
        .stars { position: fixed; width: 100%; height: 100%; top: 0; left: 0; pointer-events: none; }
        .star { position: absolute; width: 2px; height: 2px; background: white; border-radius: 50%; animation: pulse 3s infinite; }
        .login-screen { position: fixed; width: 100vw; height: 100vh; background: radial-gradient(circle at 20% 50%, #001a4d 0%, #000814 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 10px; text-align: center; z-index: 100; }
        .login-screen h1 { font-size: 54px; margin-bottom: 10px; color: #00FFFF; font-weight: 900; text-shadow: 0 0 20px #00FFFF, 0 0 40px #FF00FF; animation: glow 2s infinite; }
        .login-screen p { font-size: 18px; color: #FFD700; margin-bottom: 30px; font-weight: 800; text-shadow: 0 0 10px #FFD700; }
        .login-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; max-width: 380px; }
        .login-btn { padding: 16px; background: linear-gradient(135deg, #FF00FF 0%, #00FFFF 50%, #FFD700 100%); color: #000814; border: none; border-radius: 20px; font-size: 16px; font-weight: 900; cursor: pointer; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 0 20px #FF00FF; transition: all 0.3s; }
        .login-btn:hover { transform: scale(1.05); box-shadow: 0 0 30px #00FFFF; }
        .login-btn:active { transform: scale(0.95); }
        .container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at 50% 50%, #001a4d 0%, #000814 100%); display: none; flex-direction: column; z-index: 50; }
        .container.show { display: flex; }
        .header { background: linear-gradient(90deg, #FF00FF 0%, #00FFFF 50%, #FFD700 100%); color: #000814; padding: 16px 10px; display: flex; justify-content: space-between; align-items: center; font-size: 20px; font-weight: 900; flex-shrink: 0; gap: 8px; text-shadow: 0 0 10px rgba(255,255,255,0.5); box-shadow: 0 8px 25px #FF00FF; }
        #myname { font-size: 22px; text-transform: uppercase; letter-spacing: 2px; }
        .logout-btn { background: rgba(0,8,20,0.7); border: 2px solid #FFD700; color: #FFD700; padding: 6px 12px; border-radius: 10px; cursor: pointer; font-size: 12px; font-weight: 900; text-transform: uppercase; }
        .dark-mode-btn { background: rgba(0,8,20,0.7); border: 2px solid #00FFFF; color: #00FFFF; padding: 6px 12px; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 900; }
        .tabs { display: flex; gap: 8px; padding: 12px; background: rgba(0,8,20,0.8); border-bottom: 3px solid #00FFFF; overflow-x: auto; flex-shrink: 0; box-shadow: 0 0 15px #00FFFF; }
        .tab { padding: 10px 18px; background: rgba(255,0,255,0.2); border: 2px solid #FF00FF; border-radius: 15px; cursor: pointer; font-weight: 900; font-size: 13px; white-space: nowrap; color: #00FFFF; flex-shrink: 0; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s; }
        .tab:hover { background: rgba(0,255,255,0.2); border-color: #00FFFF; box-shadow: 0 0 10px #00FFFF; }
        .tab.active { background: linear-gradient(135deg, #FF00FF, #00FFFF); color: #000814; border-color: #FFD700; box-shadow: 0 0 20px #00FFFF; }
        .chat-display { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; padding: 16px 10px; -webkit-overflow-scrolling: touch; font-size: 14px; background: rgba(0,8,20,0.6); position: relative; }
        .chat-display::before { content: ''; position: fixed; top: 90px; right: -30px; width: 350px; height: 350px; background: radial-gradient(circle, rgba(255,0,255,0.1) 0%, transparent 70%); pointer-events: none; z-index: 1; border-radius: 50%; }
        .message { margin-bottom: 14px; display: flex; flex-direction: column; animation: float 3s infinite; position: relative; z-index: 2; }
        .message.own { align-items: flex-end; }
        .message-content { display: flex; gap: 10px; align-items: flex-end; }
        .message.own .message-content { flex-direction: row-reverse; }
        .avatar { width: 36px; height: 36px; border-radius: 50%; font-size: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(0,255,255,0.2); border: 2px solid #00FFFF; box-shadow: 0 0 10px #00FFFF; }
        .message-bubble { max-width: 80%; padding: 12px 16px; border-radius: 18px; word-wrap: break-word; font-size: 13px; font-weight: 700; line-height: 1.4; border: 2px solid; }
        .message.own .message-bubble { background: linear-gradient(135deg, #FF00FF, #FF1493); color: #FFFFFF; border-color: #FFD700; box-shadow: 0 0 15px #FF00FF; text-transform: uppercase; }
        .message.esther .message-bubble { background: linear-gradient(135deg, #1E90FF, #00BFFF); color: white; border-color: #00FFFF; box-shadow: 0 0 12px #1E90FF; }
        .message.valley .message-bubble { background: linear-gradient(135deg, #FF1493, #FF69B4); color: white; border-color: #FFD700; box-shadow: 0 0 12px #FF1493; }
        .message.amaaya .message-bubble { background: linear-gradient(135deg, #00CED1, #40E0D0); color: #000814; border-color: #FFD700; box-shadow: 0 0 12px #00CED1; }
        .message.mama .message-bubble { background: linear-gradient(135deg, #32CD32, #00FF00); color: #000814; border-color: #FFD700; box-shadow: 0 0 12px #00FF00; }
        .message.mummy .message-bubble { background: linear-gradient(135deg, #FF4500, #FF6347); color: white; border-color: #FFD700; box-shadow: 0 0 12px #FF4500; }
        .message.hilary .message-bubble { background: linear-gradient(135deg, #9370DB, #BA55D3); color: white; border-color: #FFD700; box-shadow: 0 0 12px #9370DB; }
        .message.nan .message-bubble { background: linear-gradient(135deg, #FF00FF, #FF1493); color: white; border-color: #FFD700; box-shadow: 0 0 12px #FF00FF; }
        .message.rishy .message-bubble { background: linear-gradient(135deg, #FFD700, #FFA500); color: #000814; border-color: #FF00FF; box-shadow: 0 0 12px #FFD700; }
        .message.poppy .message-bubble { background: linear-gradient(135deg, #00FF7F, #32CD32); color: #000814; border-color: #FFD700; box-shadow: 0 0 12px #00FF7F; }
        .message.sienna .message-bubble { background: linear-gradient(135deg, #FF6347, #DC143C); color: white; border-color: #FFD700; box-shadow: 0 0 12px #FF6347; }
        .message.penelope .message-bubble { background: linear-gradient(135deg, #FF00FF, #FF69B4); color: white; border-color: #FFD700; box-shadow: 0 0 12px #FF00FF; }
        .message-sender { font-size: 12px; color: #00FFFF; margin: 0 0 4px 0; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 0 5px #00FFFF; }
        .message.own .message-sender { text-align: right; color: #FFD700; }
        .input-area { background: rgba(0,8,20,0.95); border-top: 3px solid #FF00FF; display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; padding: 10px; max-height: 50vh; overflow-y: auto; box-shadow: 0 -8px 25px #FF00FF; }
        .emoji-picker { display: none; grid-template-columns: repeat(6, 1fr); gap: 8px; padding: 12px; background: rgba(255,215,0,0.1); border-radius: 15px; max-height: 140px; overflow-y: auto; border: 2px solid #FFD700; }
        .emoji-picker.show { display: grid; }
        .emoji-option { font-size: 24px; cursor: pointer; text-align: center; padding: 8px; border-radius: 10px; background: rgba(0,255,255,0.1); transition: all 0.2s; }
        .emoji-option:hover { background: rgba(255,0,255,0.2); transform: scale(1.2); }
        .emoji-option:active { transform: scale(0.9); }
        .games-panel { display: none; background: rgba(255,0,255,0.1); border-radius: 15px; padding: 12px; border: 2px solid #FF00FF; max-height: 250px; overflow-y: auto; }
        .games-panel.show { display: block; }
        .game-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
        .game-btn { padding: 14px; background: linear-gradient(135deg, #FF00FF, #FF1493); color: white; border: 2px solid #FFD700; border-radius: 12px; font-weight: 900; cursor: pointer; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 0 12px #FF00FF; transition: all 0.3s; }
        .game-btn:hover { transform: scale(1.05); box-shadow: 0 0 20px #00FFFF; }
        .game-btn:active { transform: scale(0.95); }
        .game-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .input-container { display: flex; gap: 8px; align-items: center; width: 100%; }
        .input-field { flex: 1; padding: 12px 16px; border: 2px solid #00FFFF; border-radius: 20px; font-size: 14px; font-family: inherit; height: 48px; background: rgba(0,255,255,0.1); color: #00FFFF; font-weight: 700; }
        .input-field:focus { outline: none; border-color: #FF00FF; box-shadow: 0 0 15px #FF00FF; }
        .input-field::placeholder { color: #00FFFF; opacity: 0.7; }
        .emoji-btn { background: rgba(255,215,0,0.2); border: 2px solid #FFD700; color: #FFD700; padding: 10px 12px; border-radius: 12px; font-size: 18px; cursor: pointer; height: 48px; min-width: 48px; flex-shrink: 0; font-weight: 900; transition: all 0.3s; }
        .emoji-btn:hover { background: rgba(255,215,0,0.4); box-shadow: 0 0 12px #FFD700; }
        .games-btn { background: rgba(0,255,255,0.2); border: 2px solid #00FFFF; color: #00FFFF; padding: 10px 12px; border-radius: 12px; font-size: 18px; cursor: pointer; height: 48px; font-weight: 900; min-width: 48px; flex-shrink: 0; transition: all 0.3s; }
        .games-btn:hover { background: rgba(0,255,255,0.4); box-shadow: 0 0 12px #00FFFF; }
        .send-btn { background: linear-gradient(135deg, #FF00FF, #00FFFF); color: #000814; border: 2px solid #FFD700; padding: 10px 14px; border-radius: 20px; font-size: 12px; font-weight: 900; cursor: pointer; height: 48px; min-width: 60px; flex-shrink: 0; text-transform: uppercase; box-shadow: 0 0 15px #FF00FF; transition: all 0.3s; }
        .send-btn:hover { transform: scale(1.05); box-shadow: 0 0 25px #00FFFF; }
        .send-btn:active { transform: scale(0.95); }
        .send-btn:disabled { background: #333; cursor: not-allowed; }
        .empty { text-align: center; color: #00FFFF; padding: 50px 15px; font-size: 18px; font-weight: 900; text-transform: uppercase; text-shadow: 0 0 10px #00FFFF; }
        .game-status { text-align: center; padding: 12px; background: rgba(0,255,255,0.1); border-radius: 12px; color: #FFD700; font-weight: 900; margin-bottom: 10px; font-size: 14px; border: 2px solid #00FFFF; text-transform: uppercase; }
        .trivia-q { font-weight: 900; margin-bottom: 12px; color: #00FFFF; font-size: 15px; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 0 8px #00FFFF; }
        .trivia-answers { display: grid; gap: 10px; margin-bottom: 12px; }
        .trivia-btn { padding: 12px; background: rgba(0,255,255,0.1); border: 2px solid #00FFFF; border-radius: 10px; cursor: pointer; font-weight: 900; font-size: 13px; color: #00FFFF; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s; box-shadow: 0 0 8px #00FFFF; }
        .trivia-btn:hover { background: rgba(0,255,255,0.2); box-shadow: 0 0 15px #00FFFF; }
        .trivia-btn.correct { background: linear-gradient(135deg, #00FF7F, #32CD32); color: #000814; border-color: #FFD700; box-shadow: 0 0 15px #00FF7F; }
        .trivia-btn.wrong { background: linear-gradient(135deg, #FF4500, #FF6347); color: white; border-color: #FFD700; box-shadow: 0 0 15px #FF4500; }
        .trivia-result { text-align: center; margin-top: 12px; font-weight: 900; color: #FFD700; font-size: 16px; text-transform: uppercase; text-shadow: 0 0 10px #FFD700; }
        .letter-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 12px 0; }
        .letter-btn { padding: 10px; background: rgba(0,255,255,0.1); border: 2px solid #00FFFF; border-radius: 8px; cursor: pointer; font-weight: 900; color: #00FFFF; font-size: 12px; text-transform: uppercase; box-shadow: 0 0 8px #00FFFF; transition: all 0.2s; }
        .letter-btn:hover { background: rgba(0,255,255,0.2); box-shadow: 0 0 12px #FF00FF; }
        .letter-btn:disabled { opacity: 0.2; cursor: not-allowed; }
        .hangman-word { font-size: 36px; font-weight: 900; letter-spacing: 10px; text-align: center; margin: 14px 0; font-family: monospace; color: #00FFFF; text-shadow: 0 0 10px #00FFFF; }
        .hangman-stage { font-size: 60px; text-align: center; margin: 8px 0; animation: float 3s infinite; }
    </style>
</head>
<body>
    <div class="stars" id="stars"></div>
    
    <div class="login-screen" id="login">
        <h1>🚀 COSMIC CHAT 🚀</h1>
        <p>⭐ Pick Your Space Name ⭐</p>
        <div class="login-buttons">
            <button class="login-btn" onclick="window.login('esther')">🐱 ESTHER</button>
            <button class="login-btn" onclick="window.login('valley')">🎀 VALLEY</button>
            <button class="login-btn" onclick="window.login('amaaya')">✨ AMAAYA</button>
            <button class="login-btn" onclick="window.login('mama')">👑 MAMA</button>
            <button class="login-btn" onclick="window.login('mummy')">💎 MUMMY</button>
            <button class="login-btn" onclick="window.login('hilary')">🌟 HILARY</button>
            <button class="login-btn" onclick="window.login('nan')">💫 NAN</button>
            <button class="login-btn" onclick="window.login('rishy')">🔆 RISHY</button>
            <button class="login-btn" onclick="window.login('poppy')">🌈 POPPY</button>
            <button class="login-btn" onclick="window.login('sienna')">🎪 SIENNA</button>
            <button class="login-btn" onclick="window.login('penelope')">💝 PENELOPE</button>
        </div>
    </div>

    <div class="container" id="app">
        <div class="header">
            <div>🚀 <span id="myname"></span> 🚀</div>
            <button class="dark-mode-btn" onclick="window.toggleDarkMode()">🌙</button>
            <button class="logout-btn" onclick="window.logout()">LOGOUT</button>
        </div>
        <div class="tabs" id="tabs"></div>
        <div class="chat-display" id="chat"><div class="empty">🚀 LOADING COSMIC CHAT...</div></div>
        
        <div class="input-area">
            <div id="emojiPicker" class="emoji-picker"></div>
            <div id="gamesPanel" class="games-panel">
                <div class="game-buttons">
                    <button class="game-btn" onclick="window.playRPS()">✊ RPS</button>
                    <button class="game-btn" onclick="window.playDice()">🎲 DICE</button>
                    <button class="game-btn" onclick="window.playTrivia()">🧠 TRIVIA</button>
                    <button class="game-btn" onclick="window.playHangman()">🎯 HANGMAN</button>
                </div>

                <div id="rpsContainer" style="display: none;">
                    <div class="game-status" id="rpsStatus">⏱️ Choose in 10s!</div>
                    <div class="game-buttons">
                        <button class="game-btn" onclick="window.selectRPS('rock')">✊ ROCK</button>
                        <button class="game-btn" onclick="window.selectRPS('paper')">✋ PAPER</button>
                        <button class="game-btn" onclick="window.selectRPS('scissors')">✌️ SCISSORS</button>
                    </div>
                </div>

                <div id="diceContainer" style="display: none;">
                    <div class="game-status">🎲 ROLL THE DICE!</div>
                    <div style="font-size: 48px; text-align: center; margin: 12px 0; animation: spin 2s linear infinite;" id="diceResult">🎲</div>
                    <button class="game-btn" style="width: 100%;" onclick="window.rollDice()">🎲 ROLL!</button>
                </div>

                <div id="triviaContainer" style="display: none;">
                    <div class="trivia-q" id="triviaQuestion"></div>
                    <div id="triviaAnswers" class="trivia-answers"></div>
                    <div class="trivia-result" id="triviaResult"></div>
                    <div style="text-align: center; font-size: 13px; color: #00FFFF; margin-top: 8px;" id="playersScore"></div>
                    <div class="game-status" id="triviaScore"></div>
                </div>

                <div id="hangmanContainer" style="display: none;">
                    <div class="game-status" id="hangmanStatus">🎯 HANGMAN CHALLENGE</div>
                    <div id="hangmanSetupPhase">
                        <input type="text" id="hangmanSetWord" placeholder="Enter secret word..." maxlength="12" style="width: 100%; padding: 10px; margin: 6px 0; border: 2px solid #00FFFF; border-radius: 8px; color: #00FFFF; font-size: 13px; background: rgba(0,255,255,0.1); font-weight: 700;">
                        <button class="game-btn" style="width: 100%; margin-top: 6px;" onclick="window.startHangman()">🚀 SET WORD!</button>
                    </div>
                    <div id="hangmanGamePhase" style="display: none;">
                        <div class="hangman-stage" id="hangmanStage">😊</div>
                        <div class="hangman-word" id="hangmanWord">_ _ _</div>
                        <div id="hangmanLetterGrid" class="letter-grid"></div>
                        <div id="hangmanResult" style="text-align: center; font-weight: 900; margin-top: 8px; color: #FFD700; font-size: 14px; text-transform: uppercase;"></div>
                    </div>
                </div>
            </div>
            <div class="input-container">
                <button class="emoji-btn" onclick="window.toggleEmoji()">😀</button>
                <button class="games-btn" onclick="window.toggleGames()">🎮</button>
                <input type="text" class="input-field" id="msg" placeholder="💬 Say something..." disabled>
                <button class="send-btn" id="sendBtn" onclick="window.send()" disabled>SEND!</button>
            </div>
        </div>
    </div>

    <script>
        // Create stars background
        function createStars() {
            const starsContainer = document.getElementById('stars');
            for (let i = 0; i < 100; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';
                star.style.animationDuration = (Math.random() * 3 + 2) + 's';
                star.style.animationDelay = Math.random() * 2 + 's';
                starsContainer.appendChild(star);
            }
        }

        const EMOJIS = ['😀','😂','😍','🥰','😎','🤗','😊','🎉','🎊','🎈','🎁','🎂','🍰','🍕','🍔','🍟','☕','🧋','🍹','🍩','🍪','🐱','😺','😸','😻','😼','🦁','🐮','🐷','🦊','🐻','🐼','🐨','🐹','🐰','👍','👏','🙌','💪','🤝','💋','💕','💖','💗','💓','💞','💘','💝','⭐','✨','🌟','💫','🔥','⚡','💜','🚀','🛸'];
        
        const TRIVIA_QUESTIONS = [
            {q: '🌍 CAPITAL OF AUSTRALIA?', a: ['SYDNEY','MELBOURNE','CANBERRA','BRISBANE'], c: 2},
            {q: '🌊 LARGEST OCEAN?', a: ['ATLANTIC','INDIAN','ARCTIC','PACIFIC'], c: 3},
            {q: '⛰️ TALLEST MOUNTAIN?', a: ['KILIMANJARO','EVEREST','DENALI','BLANC'], c: 1},
            {q: '🇫🇷 CAPITAL OF FRANCE?', a: ['LYON','MARSEILLE','PARIS','NICE'], c: 2},
            {q: '🐆 FASTEST LAND ANIMAL?', a: ['LION','GAZELLE','CHEETAH','PRONGHORN'], c: 2},
            {q: '🐋 LARGEST ANIMAL?', a: ['ELEPHANT','BLUE WHALE','GIRAFFE','HIPPO'], c: 1},
            {q: '🌊 LONGEST RIVER?', a: ['AMAZON','CONGO','NILE','YANGTZE'], c: 2},
            {q: '🇯🇵 CAPITAL OF JAPAN?', a: ['OSAKA','KYOTO','TOKYO','YOKOHAMA'], c: 2},
            {q: '🕳️ DEEPEST TRENCH?', a: ['MARIANA','TONGA','PHILIPPINE','KURIL'], c: 0},
            {q: '🇪🇬 CAPITAL OF EGYPT?', a: ['ALEXANDRIA','CAIRO','GIZA','LUXOR'], c: 1},
            {q: '🦅 BIRD CANNOT FLY?', a: ['OSTRICH','CHICKEN','PENGUIN','KIWI'], c: 0},
            {q: '🇧🇷 CAPITAL OF BRAZIL?', a: ['RIO','BRASÍLIA','SALVADOR','SAO PAULO'], c: 1},
            {q: '🐙 OCTOPUS LEGS?', a: ['6','8','10','12'], c: 1},
            {q: '🇨🇦 CAPITAL OF CANADA?', a: ['TORONTO','VANCOUVER','OTTAWA','MONTREAL'], c: 2},
            {q: '🇩🇪 CAPITAL OF GERMANY?', a: ['MUNICH','HAMBURG','BERLIN','COLOGNE'], c: 2},
            {q: '🏜️ LARGEST DESERT?', a: ['SAHARA','GOBI','KALAHARI','ANTARCTIC'], c: 3},
            {q: '🇮🇹 CAPITAL OF ITALY?', a: ['MILAN','ROME','VENICE','FLORENCE'], c: 1},
            {q: '🌎 CONTINENTS TOTAL?', a: ['5','6','7','8'], c: 2},
            {q: '🇪🇸 CAPITAL OF SPAIN?', a: ['BARCELONA','MADRID','VALENCIA','SEVILLE'], c: 1},
            {q: '🏰 SMALLEST COUNTRY?', a: ['MONACO','VATICAN','SAN MARINO','LIECHTENSTEIN'], c: 1},
            {q: '🎬 MICKEY MOUSE CREATOR?', a: ['BOB KANE','WALT DISNEY','CHUCK JONES','HAL ROACH'], c: 1},
            {q: '🎨 VAN GOGH LOST BODY PART?', a: ['NOSE','EYE','FINGER','TOOTH'], c: 2},
            {q: '🍎 GRAVITY DISCOVERY?', a: ['NEWTON','EINSTEIN','GALILEO','ARCHIMEDES'], c: 0},
            {q: '⚡ ELECTRICITY SCIENTIST?', a: ['TESLA','NEWTON','KEPLER','BOYLE'], c: 0},
            {q: '🏀 BASKETBALL CREATOR?', a: ['NAISMITH','SPALDING','MORGAN','GULICK'], c: 0},
            {q: '🐢 FASTEST REPTILE?', a: ['SNAKE','IGUANA','LIZARD','CROCODILE'], c: 2},
            {q: '🎯 DARTS PERFECT SCORE?', a: ['100','180','150','200'], c: 1},
            {q: '📚 FIRST PRINTED BOOK?', a: ['BIBLE','QURAN','TORAH','DICTIONARY'], c: 0},
            {q: '🎸 GUITAR STRINGS?', a: ['5','6','7','8'], c: 1},
            {q: '🌸 FASTEST FLOWER?', a: ['BAMBOO','WATERLILY','SUNFLOWER','DANDELION'], c: 0},
            {q: '💎 HARDEST MATERIAL?', a: ['STEEL','DIAMOND','TUNGSTEN','TITANIUM'], c: 1},
            {q: '🎤 LOUDEST ANIMAL?', a: ['WHALE','LION','ELEPHANT','MONKEY'], c: 0},
            {q: '👁️ HUMAN EYE COLOR?', a: ['12','16','5','8'], c: 1},
            {q: '🦴 ADULT BONES?', a: ['206','216','186','226'], c: 0},
            {q: '❤️ HEARTBEATS PER MINUTE?', a: ['50-100','100-150','60-120','70-80'], c: 0},
            {q: '🧠 BRAIN WEIGHT PERCENT?', a: ['1%','2%','3%','5%'], c: 1},
            {q: '🌙 MOON FULL CYCLE DAYS?', a: ['20','25','28','30'], c: 2},
            {q: '☀️ SUN AGE BILLIONS YEARS?', a: ['3','4','5','6'], c: 2},
            {q: '🪐 PLANETS IN SOLAR SYSTEM?', a: ['7','8','9','10'], c: 1},
            {q: '🌡️ ABSOLUTE ZERO CELSIUS?', a: ['-273','-273.15','-300','-250'], c: 1}
        ];

        const HANGMAN_STAGES = ['😊', '😐', '😕', '😟', '😢', '😭', '💀'];

        const USERS = {
            esther: 'ESTHER', valley: 'VALLEY', amaaya: 'AMAAYA', mama: 'MAMA', mummy: 'MUMMY',
            hilary: 'HILARY', nan: 'NAN', rishy: 'RISHY', poppy: 'POPPY', sienna: 'SIENNA', penelope: 'PENELOPE'
        };

        const AVATARS = {
            esther: '🐱', valley: '🎀', amaaya: '✨', mama: '👑', mummy: '💎',
            hilary: '🌟', nan: '💫', rishy: '🔆', poppy: '🌈', sienna: '🎪', penelope: '💝'
        };

        let currentUser = null, currentChat = 'group', allChats = [], messages = {}, ws = null, connected = false;
        let rpsChoice = null, rpsTimeLeft = 0, rpsTimer = null;
        let hangmanWord = '', hangmanGuessed = [], hangmanWrong = 0, hangmanGameActive = false;
        let triviaScore = {}, triviaTotal = 0, triviaAnswered = false, triviaCurrentQ = null, triviaUsers = new Set();

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
                } else if (data.type === 'rps_choice') {
                    if (data.chatId === currentChat) {
                        document.getElementById('rpsStatus').textContent = '🎮 ' + data.user + ' chose!';
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
                btn.textContent = chatId === 'group' ? '👥 GROUP' : '💬 ' + chatId.split('-')[1].toUpperCase();
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
            rpsChoice = null;
            document.getElementById('rpsContainer').style.display = 'block';
            document.getElementById('hangmanContainer').style.display = 'none';
            document.getElementById('triviaContainer').style.display = 'none';
            document.getElementById('diceContainer').style.display = 'none';
            rpsTimeLeft = 10;
            document.getElementById('rpsStatus').textContent = '⏱️ Choose in 10s!';
            rpsTimer = setInterval(() => {
                rpsTimeLeft--;
                document.getElementById('rpsStatus').textContent = '⏱️ ' + rpsTimeLeft + 's left!';
                if (rpsTimeLeft <= 0) {
                    clearInterval(rpsTimer);
                    document.querySelectorAll('#rpsContainer .game-btn').forEach(b => b.disabled = true);
                }
            }, 1000);
        };

        window.selectRPS = function(choice) {
            rpsChoice = choice;
            document.querySelectorAll('#rpsContainer .game-btn').forEach(b => b.disabled = true);
            if (connected) {
                ws.send(JSON.stringify({ type: 'rps_choice', user: currentUser, chatId: currentChat, choice: choice }));
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎮 Played RPS: ' + choice.toUpperCase() }));
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
            ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎲 ROLLED: ' + result }));
        };

        window.playTrivia = function() {
            triviaScore = {};
            triviaTotal = 0;
            triviaUsers.clear();
            triviaAnswered = false;
            document.getElementById('triviaContainer').style.display = 'block';
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('hangmanContainer').style.display = 'none';
            document.getElementById('diceContainer').style.display = 'none';
            ws.send(JSON.stringify({ type: 'trivia_start', user: currentUser, chatId: currentChat }));
            ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🧠 TRIVIA CHALLENGE STARTED!' }));
            window.nextTriviaQuestion();
        };

        window.nextTriviaQuestion = function() {
            if (triviaTotal >= 5) {
                let scores = 'FINAL SCORES: ';
                Object.entries(triviaScore).forEach(([u, s]) => { scores += u + ':' + s + ' '; });
                document.getElementById('triviaQuestion').textContent = '🏆 DONE!';
                document.getElementById('triviaAnswers').innerHTML = '';
                document.getElementById('triviaResult').textContent = '';
                document.getElementById('playersScore').textContent = scores;
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🧠 ' + scores }));
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
            document.getElementById('playersScore').textContent = '';
            document.getElementById('triviaScore').textContent = 'QUESTION ' + triviaTotal + ' OF 5';
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
            document.getElementById('triviaResult').textContent = isCorrect ? '✅ CORRECT!' : '❌ WRONG!';
        };

        window.showTriviaResult = function() {
            let result = '';
            Object.entries(triviaScore).forEach(([u, s]) => { result += u + ':' + s + '  '; });
            document.getElementById('playersScore').textContent = result;
            setTimeout(window.nextTriviaQuestion, 1200);
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
            if (word.length < 3) { alert('Word too short!'); return; }
            hangmanWord = word;
            hangmanGuessed = [];
            hangmanWrong = 0;
            hangmanGameActive = true;
            document.getElementById('hangmanSetupPhase').style.display = 'none';
            document.getElementById('hangmanGamePhase').style.display = 'block';
            window.renderHangmanGame();
            if (connected) {
                ws.send(JSON.stringify({ type: 'hangman_start', user: currentUser, chatId: currentChat }));
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎯 HANGMAN CHALLENGE STARTED!' }));
            }
        };

        window.renderHangmanGame = function() {
            if (!hangmanGameActive) return;
            const display = hangmanWord.split('').map(l => hangmanGuessed.includes(l) ? l : '_').join(' ');
            document.getElementById('hangmanWord').textContent = display;
            document.getElementById('hangmanStage').textContent = HANGMAN_STAGES[Math.min(hangmanWrong, 6)];
            document.getElementById('hangmanStatus').textContent = '🎯 WRONG: ' + hangmanWrong + '/6';
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
                document.getElementById('hangmanResult').textContent = won ? '🎉 YOU WIN!' : '💀 WORD: ' + hangmanWord;
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
            if (msgs.length === 0) { div.innerHTML = '<div class="empty">🚀 COSMIC CHAT READY! 🚀</div>'; return; }
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
        createStars();
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
server.listen(PORT, () => { console.log('🚀 COSMIC CHAT SERVER LAUNCHED! 🚀'); });
