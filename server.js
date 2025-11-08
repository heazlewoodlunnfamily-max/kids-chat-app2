const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover, maximum-scale=1.0">
    <title>✨ Anime Chat ✨</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes drift { 0%, 100% { transform: translateY(0px) translateX(0px); } 25% { transform: translateY(-15px) translateX(5px); } 75% { transform: translateY(-10px) translateX(-5px); } }
        @keyframes flutter { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes shimmer { 0%, 100% { background-position: 0% center; } 50% { background-position: 100% center; } }
        html { height: 100%; }
        body { height: 100%; overflow: hidden; font-family: 'Poppins', sans-serif; -webkit-user-select: none; user-select: none; background: linear-gradient(135deg, #D4E8D9 0%, #E8D9E8 25%, #E8E0D9 50%, #D9E8E8 75%, #E8DDD9 100%); }
        .login-screen { position: fixed; width: 100vw; height: 100vh; background: linear-gradient(135deg, #D4E8D9 0%, #E8D9E8 25%, #E8E0D9 50%, #D9E8E8 75%, #E8DDD9 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; text-align: center; z-index: 100; }
        .login-screen h1 { font-size: 52px; margin-bottom: 8px; color: #6B4423; font-weight: 800; text-shadow: 0 4px 8px rgba(107, 68, 35, 0.15); font-family: 'Poppins'; letter-spacing: 1px; }
        .login-screen p { font-size: 18px; color: #8B6F47; margin-bottom: 25px; font-weight: 700; }
        .login-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; max-width: 380px; }
        .login-btn { padding: 16px; background: linear-gradient(135deg, #A89F87 0%, #B8AFAA 100%); color: #6B4423; border: 3px solid #6B4423; border-radius: 18px; font-size: 15px; font-weight: 800; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 6px 12px rgba(107, 68, 35, 0.15); transition: all 0.3s; font-family: 'Poppins'; }
        .login-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 18px rgba(107, 68, 35, 0.25); }
        .login-btn:active { transform: scale(0.96); }
        .container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #D4E8D9 0%, #E8D9E8 25%, #E8E0D9 50%, #D9E8E8 75%, #E8DDD9 100%); display: none; flex-direction: column; z-index: 50; }
        .container.show { display: flex; }
        .header { background: linear-gradient(90deg, #A89F87 0%, #B8AFAA 50%, #C0B5AA 100%); color: #6B4423; padding: 14px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: 800; flex-shrink: 0; gap: 8px; box-shadow: 0 6px 15px rgba(107, 68, 35, 0.12); border-bottom: 3px solid #6B4423; font-family: 'Poppins'; }
        #myname { font-size: 20px; text-transform: uppercase; letter-spacing: 1px; }
        .logout-btn { background: rgba(255, 255, 255, 0.7); border: 2px solid #6B4423; color: #6B4423; padding: 6px 12px; border-radius: 12px; cursor: pointer; font-size: 11px; font-weight: 800; text-transform: uppercase; }
        .dark-mode-btn { background: rgba(255, 255, 255, 0.7); border: 2px solid #8B6F47; color: #6B4423; padding: 6px 12px; border-radius: 12px; cursor: pointer; font-size: 16px; font-weight: 700; }
        .tabs { display: flex; gap: 8px; padding: 12px; background: rgba(255, 255, 255, 0.5); border-bottom: 2px solid #A89F87; overflow-x: auto; flex-shrink: 0; }
        .tab { padding: 10px 16px; background: rgba(168, 159, 135, 0.2); border: 2px solid #A89F87; border-radius: 16px; cursor: pointer; font-weight: 700; font-size: 13px; white-space: nowrap; color: #6B4423; flex-shrink: 0; text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.3s; }
        .tab:hover { background: rgba(168, 159, 135, 0.4); transform: scale(1.05); }
        .tab.active { background: linear-gradient(135deg, #A89F87, #8B6F47); color: #FFFAF0; border-color: #6B4423; box-shadow: 0 4px 12px rgba(107, 68, 35, 0.2); }
        .chat-display { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; padding: 14px 10px; -webkit-overflow-scrolling: touch; font-size: 14px; background: rgba(255, 255, 255, 0.4); position: relative; }
        .chat-display::before { content: ''; position: fixed; top: 90px; right: -20px; width: 300px; height: 300px; background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjwhLS0gUGxhY2Vob2xkZXIgZm9yIGN1dGUgY2F0IGltYWdlcyAtLT4KPC9zdmc+'); background-size: contain; background-repeat: no-repeat; opacity: 0.15; pointer-events: none; z-index: 1; }
        .message { margin-bottom: 14px; display: flex; flex-direction: column; animation: drift 6s infinite ease-in-out; position: relative; z-index: 2; }
        .message.own { align-items: flex-end; }
        .message-content { display: flex; gap: 10px; align-items: flex-end; }
        .message.own .message-content { flex-direction: row-reverse; }
        .avatar { width: 40px; height: 40px; border-radius: 50%; font-size: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: linear-gradient(135deg, #C0B5AA, #A89F87); border: 3px solid #8B6F47; box-shadow: 0 4px 10px rgba(107, 68, 35, 0.15); }
        .message-bubble { max-width: 80%; padding: 12px 16px; border-radius: 18px; word-wrap: break-word; font-size: 13px; font-weight: 600; line-height: 1.4; border: 2px solid; }
        .message.own .message-bubble { background: linear-gradient(135deg, #A89F87, #8B6F47); color: #FFFAF0; border-color: #6B4423; box-shadow: 0 6px 12px rgba(107, 68, 35, 0.2); }
        .message.esther .message-bubble { background: linear-gradient(135deg, #B8D4E8, #A8C4D8); color: #2C3E50; border-color: #6B9BB0; box-shadow: 0 4px 10px rgba(107, 155, 176, 0.15); }
        .message.valley .message-bubble { background: linear-gradient(135deg, #D4A89F, #C89890); color: #6B4423; border-color: #8B6F47; box-shadow: 0 4px 10px rgba(107, 68, 35, 0.15); }
        .message.amaaya .message-bubble { background: linear-gradient(135deg, #B8D8B0, #A8C8A0); color: #2C5F2C; border-color: #6B9B6B; box-shadow: 0 4px 10px rgba(107, 155, 107, 0.15); }
        .message.mama .message-bubble { background: linear-gradient(135deg, #D4C8A8, #C8BCA0); color: #6B4423; border-color: #8B7F47; box-shadow: 0 4px 10px rgba(107, 68, 35, 0.15); }
        .message.mummy .message-bubble { background: linear-gradient(135deg, #D8B8B0, #C8A8A0); color: #6B4423; border-color: #8B6F47; box-shadow: 0 4px 10px rgba(107, 68, 35, 0.15); }
        .message.hilary .message-bubble { background: linear-gradient(135deg, #D4B0D8, #C8A0C8); color: #4A2C4A; border-color: #7B4F7B; box-shadow: 0 4px 10px rgba(123, 79, 123, 0.15); }
        .message.nan .message-bubble { background: linear-gradient(135deg, #D4A0C0, #C89FB0); color: #6B2C4A; border-color: #8B5F7B; box-shadow: 0 4px 10px rgba(107, 68, 80, 0.15); }
        .message.rishy .message-bubble { background: linear-gradient(135deg, #D8D0A8, #C8C0A0); color: #6B6423; border-color: #8B7F47; box-shadow: 0 4px 10px rgba(107, 100, 35, 0.15); }
        .message.poppy .message-bubble { background: linear-gradient(135deg, #D4B8D0, #C8A8C0); color: #6B2C4A; border-color: #8B5F7B; box-shadow: 0 4px 10px rgba(107, 68, 80, 0.15); }
        .message.sienna .message-bubble { background: linear-gradient(135deg, #D8A88F, #C89880); color: #6B4423; border-color: #8B6F47; box-shadow: 0 4px 10px rgba(107, 68, 35, 0.15); }
        .message.penelope .message-bubble { background: linear-gradient(135deg, #D4A8C0, #C89FB0); color: #6B2C4A; border-color: #8B5F7B; box-shadow: 0 4px 10px rgba(107, 68, 80, 0.15); }
        .message-sender { font-size: 12px; color: #6B4423; margin: 0 0 4px 0; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .message.own .message-sender { text-align: right; color: #8B7F47; }
        .input-area { background: rgba(255, 255, 255, 0.7); border-top: 3px solid #A89F87; display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; padding: 10px; max-height: 50vh; overflow-y: auto; box-shadow: 0 -6px 15px rgba(107, 68, 35, 0.1); }
        .emoji-picker { display: none; grid-template-columns: repeat(6, 1fr); gap: 8px; padding: 12px; background: rgba(232, 232, 232, 0.5); border-radius: 15px; max-height: 140px; overflow-y: auto; border: 2px solid #C0B5AA; }
        .emoji-picker.show { display: grid; }
        .emoji-option { font-size: 24px; cursor: pointer; text-align: center; padding: 8px; border-radius: 12px; background: rgba(168, 159, 135, 0.1); transition: all 0.2s; }
        .emoji-option:hover { background: rgba(168, 159, 135, 0.3); transform: scale(1.2) rotate(5deg); }
        .emoji-option:active { transform: scale(0.9); }
        .games-panel { display: none; background: rgba(232, 224, 216, 0.5); border-radius: 15px; padding: 12px; border: 2px solid #C0B5AA; max-height: 250px; overflow-y: auto; }
        .games-panel.show { display: block; }
        .game-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
        .game-btn { padding: 14px; background: linear-gradient(135deg, #A89F87, #B8AFAA); color: #6B4423; border: 3px solid #6B4423; border-radius: 14px; font-weight: 800; cursor: pointer; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 6px 12px rgba(107, 68, 35, 0.15); transition: all 0.3s; font-family: 'Poppins'; }
        .game-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 16px rgba(107, 68, 35, 0.2); }
        .game-btn:active { transform: scale(0.95); }
        .game-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .input-container { display: flex; gap: 8px; align-items: center; width: 100%; }
        .input-field { flex: 1; padding: 12px 16px; border: 3px solid #A89F87; border-radius: 18px; font-size: 14px; font-family: inherit; height: 48px; background: rgba(255, 255, 255, 0.9); color: #6B4423; font-weight: 600; }
        .input-field:focus { outline: none; border-color: #8B6F47; box-shadow: 0 0 12px rgba(107, 68, 35, 0.15); }
        .input-field::placeholder { color: #A89F87; }
        .emoji-btn { background: rgba(255, 255, 255, 0.8); border: 3px solid #C0B5AA; color: #6B4423; padding: 10px 12px; border-radius: 12px; font-size: 18px; cursor: pointer; height: 48px; min-width: 48px; flex-shrink: 0; font-weight: 700; transition: all 0.3s; }
        .emoji-btn:hover { background: rgba(192, 181, 170, 0.2); transform: scale(1.1); }
        .games-btn { background: rgba(255, 255, 255, 0.8); border: 3px solid #A89F87; color: #6B4423; padding: 10px 12px; border-radius: 12px; font-size: 18px; cursor: pointer; height: 48px; font-weight: 800; min-width: 48px; flex-shrink: 0; transition: all 0.3s; }
        .games-btn:hover { background: rgba(168, 159, 135, 0.2); transform: scale(1.1); }
        .send-btn { background: linear-gradient(135deg, #A89F87, #8B6F47); color: #FFFAF0; border: 3px solid #6B4423; padding: 10px 14px; border-radius: 18px; font-size: 12px; font-weight: 800; cursor: pointer; height: 48px; min-width: 60px; flex-shrink: 0; text-transform: uppercase; box-shadow: 0 6px 12px rgba(107, 68, 35, 0.15); transition: all 0.3s; font-family: 'Poppins'; }
        .send-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(107, 68, 35, 0.2); }
        .send-btn:active { transform: scale(0.95); }
        .send-btn:disabled { background: #ccc; cursor: not-allowed; }
        .empty { text-align: center; color: #6B4423; padding: 50px 15px; font-size: 18px; font-weight: 800; text-transform: uppercase; text-shadow: 0 2px 4px rgba(107, 68, 35, 0.1); }
        .game-status { text-align: center; padding: 12px; background: rgba(168, 159, 135, 0.15); border-radius: 12px; color: #6B4423; font-weight: 800; margin-bottom: 10px; font-size: 14px; border: 2px solid #A89F87; text-transform: uppercase; }
        .trivia-q { font-weight: 800; margin-bottom: 12px; color: #6B4423; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; }
        .trivia-answers { display: grid; gap: 10px; margin-bottom: 12px; }
        .trivia-btn { padding: 12px; background: rgba(168, 159, 135, 0.15); border: 2px solid #A89F87; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 13px; color: #6B4423; text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.3s; }
        .trivia-btn:hover { background: rgba(168, 159, 135, 0.3); transform: scale(1.02); }
        .trivia-btn.correct { background: linear-gradient(135deg, #B8D8B0, #A8C8A0); color: #2C5F2C; border-color: #6B9B6B; }
        .trivia-btn.wrong { background: linear-gradient(135deg, #D4A89F, #C89890); color: #6B4423; border-color: #8B6F47; }
        .trivia-result { text-align: center; margin-top: 12px; font-weight: 800; color: #6B4423; font-size: 16px; text-transform: uppercase; }
        .letter-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 12px 0; }
        .letter-btn { padding: 10px; background: rgba(168, 159, 135, 0.15); border: 2px solid #A89F87; border-radius: 10px; cursor: pointer; font-weight: 700; color: #6B4423; font-size: 12px; text-transform: uppercase; transition: all 0.2s; }
        .letter-btn:hover { background: rgba(168, 159, 135, 0.3); transform: scale(1.05); }
        .letter-btn:disabled { opacity: 0.2; cursor: not-allowed; }
        .hangman-word { font-size: 36px; font-weight: 800; letter-spacing: 8px; text-align: center; margin: 14px 0; font-family: 'Poppins'; color: #6B4423; }
        .hangman-stage { font-size: 60px; text-align: center; margin: 8px 0; animation: drift 4s infinite ease-in-out; }
    </style>
</head>
<body>
    <div class="login-screen" id="login">
        <h1>✨ Anime Chat ✨</h1>
        <p>💚 Pick Your Character 💚</p>
        <div class="login-buttons">
            <button class="login-btn" onclick="window.login('esther')">🐱 ESTHER</button>
            <button class="login-btn" onclick="window.login('valley')">🎀 VALLEY</button>
            <button class="login-btn" onclick="window.login('amaaya')">✨ AMAAYA</button>
            <button class="login-btn" onclick="window.login('mama')">👑 MAMA</button>
            <button class="login-btn" onclick="window.login('mummy')">💎 MUMMY</button>
            <button class="login-btn" onclick="window.login('hilary')">🌸 HILARY</button>
            <button class="login-btn" onclick="window.login('nan')">💜 NAN</button>
            <button class="login-btn" onclick="window.login('rishy')">⭐ RISHY</button>
            <button class="login-btn" onclick="window.login('poppy')">🌷 POPPY</button>
            <button class="login-btn" onclick="window.login('sienna')">🌺 SIENNA</button>
            <button class="login-btn" onclick="window.login('penelope')">💝 PENELOPE</button>
        </div>
    </div>

    <div class="container" id="app">
        <div class="header">
            <div>💚 <span id="myname"></span> 💚</div>
            <button class="dark-mode-btn" onclick="window.toggleDarkMode()">🌙</button>
            <button class="logout-btn" onclick="window.logout()">LOGOUT</button>
        </div>
        <div class="tabs" id="tabs"></div>
        <div class="chat-display" id="chat"><div class="empty">💚 loading anime chat...</div></div>
        
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
                    <div class="game-status">🎲 ROLL!</div>
                    <div style="font-size: 48px; text-align: center; margin: 12px 0;" id="diceResult">🎲</div>
                    <button class="game-btn" style="width: 100%;" onclick="window.rollDice()">🎲 ROLL!</button>
                </div>

                <div id="triviaContainer" style="display: none;">
                    <div class="trivia-q" id="triviaQuestion"></div>
                    <div id="triviaAnswers" class="trivia-answers"></div>
                    <div class="trivia-result" id="triviaResult"></div>
                    <div style="text-align: center; font-size: 13px; color: #6B4423; margin-top: 8px; font-weight: 700;" id="playersScore"></div>
                    <div class="game-status" id="triviaScore"></div>
                </div>

                <div id="hangmanContainer" style="display: none;">
                    <div class="game-status" id="hangmanStatus">🎯 HANGMAN</div>
                    <div id="hangmanSetupPhase">
                        <input type="text" id="hangmanSetWord" placeholder="Enter word..." maxlength="12" style="width: 100%; padding: 10px; margin: 6px 0; border: 2px solid #A89F87; border-radius: 10px; color: #6B4423; font-size: 13px; background: rgba(168, 159, 135, 0.1); font-weight: 700;">
                        <button class="game-btn" style="width: 100%; margin-top: 6px;" onclick="window.startHangman()">💚 SET!</button>
                    </div>
                    <div id="hangmanGamePhase" style="display: none;">
                        <div class="hangman-stage" id="hangmanStage">😊</div>
                        <div class="hangman-word" id="hangmanWord">_ _ _</div>
                        <div id="hangmanLetterGrid" class="letter-grid"></div>
                        <div id="hangmanResult" style="text-align: center; font-weight: 800; margin-top: 8px; color: #6B4423; font-size: 14px; text-transform: uppercase;"></div>
                    </div>
                </div>
            </div>
            <div class="input-container">
                <button class="emoji-btn" onclick="window.toggleEmoji()">😊</button>
                <button class="games-btn" onclick="window.toggleGames()">🎮</button>
                <input type="text" class="input-field" id="msg" placeholder="💬 say something..." disabled>
                <button class="send-btn" id="sendBtn" onclick="window.send()" disabled>SEND</button>
            </div>
        </div>
    </div>

    <script>
        const EMOJIS = ['😊','😍','🥰','😘','😻','🐱','💚','💜','💕','✨','🌸','🌺','🌼','🌷','🎀','👯','🎉','🎊','🎈','🎁','🍰','🍪','☕','🧋','🍭','🍬','💚','🎀','⭐','🌟','💫'];
        
        const TRIVIA_QUESTIONS = [
            {q: '🌍 Capital of Australia?', a: ['Sydney','Melbourne','Canberra','Brisbane'], c: 2},
            {q: '🌊 Largest ocean?', a: ['Atlantic','Indian','Arctic','Pacific'], c: 3},
            {q: '⛰️ Tallest mountain?', a: ['Kilimanjaro','Everest','Denali','Blanc'], c: 1},
            {q: '🇫🇷 Capital of France?', a: ['Lyon','Marseille','Paris','Nice'], c: 2},
            {q: '🐆 Fastest land animal?', a: ['Lion','Gazelle','Cheetah','Pronghorn'], c: 2},
            {q: '🐋 Largest animal?', a: ['Elephant','Blue Whale','Giraffe','Hippo'], c: 1},
            {q: '🌊 Longest river?', a: ['Amazon','Congo','Nile','Yangtze'], c: 2},
            {q: '🇯🇵 Capital of Japan?', a: ['Osaka','Kyoto','Tokyo','Yokohama'], c: 2},
            {q: '🕳️ Deepest trench?', a: ['Mariana','Tonga','Philippine','Kuril'], c: 0},
            {q: '🇪🇬 Capital of Egypt?', a: ['Alexandria','Cairo','Giza','Luxor'], c: 1},
            {q: '🦅 Bird cannot fly?', a: ['Ostrich','Chicken','Penguin','Kiwi'], c: 0},
            {q: '🇧🇷 Capital of Brazil?', a: ['Rio','Brasília','Salvador','Sao Paulo'], c: 1},
            {q: '🐙 Octopus legs?', a: ['6','8','10','12'], c: 1},
            {q: '🇨🇦 Capital of Canada?', a: ['Toronto','Vancouver','Ottawa','Montreal'], c: 2},
            {q: '🇩🇪 Capital of Germany?', a: ['Munich','Hamburg','Berlin','Cologne'], c: 2},
            {q: '🏜️ Largest desert?', a: ['Sahara','Gobi','Kalahari','Antarctic'], c: 3},
            {q: '🇮🇹 Capital of Italy?', a: ['Milan','Rome','Venice','Florence'], c: 1},
            {q: '🌎 Continents total?', a: ['5','6','7','8'], c: 2},
            {q: '🇪🇸 Capital of Spain?', a: ['Barcelona','Madrid','Valencia','Seville'], c: 1},
            {q: '🏰 Smallest country?', a: ['Monaco','Vatican','San Marino','Liechtenstein'], c: 1}
        ];

        const HANGMAN_STAGES = ['😊', '😐', '😕', '😟', '😢', '😭', '💀'];

        const USERS = {
            esther: 'ESTHER', valley: 'VALLEY', amaaya: 'AMAAYA', mama: 'MAMA', mummy: 'MUMMY',
            hilary: 'HILARY', nan: 'NAN', rishy: 'RISHY', poppy: 'POPPY', sienna: 'SIENNA', penelope: 'PENELOPE'
        };

        const AVATARS = {
            esther: '🐱', valley: '🎀', amaaya: '✨', mama: '👑', mummy: '💎',
            hilary: '🌸', nan: '💜', rishy: '⭐', poppy: '🌷', sienna: '🌺', penelope: '💝'
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
                        document.getElementById('rpsStatus').textContent = '💚 ' + data.user + ' chose!';
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
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎮 Played: ' + choice.toUpperCase() }));
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
            ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎲 rolled: ' + result }));
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
            ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🧠 trivia started!' }));
            window.nextTriviaQuestion();
        };

        window.nextTriviaQuestion = function() {
            if (triviaTotal >= 5) {
                let scores = 'FINAL: ';
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
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎯 hangman started!' }));
            }
        };

        window.renderHangmanGame = function() {
            if (!hangmanGameActive) return;
            const display = hangmanWord.split('').map(l => hangmanGuessed.includes(l) ? l : '_').join(' ');
            document.getElementById('hangmanWord').textContent = display;
            document.getElementById('hangmanStage').textContent = HANGMAN_STAGES[Math.min(hangmanWrong, 6)];
            document.getElementById('hangmanStatus').textContent = '🎯 ' + hangmanWrong + '/6';
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
                document.getElementById('hangmanResult').textContent = won ? '🎉 WIN!' : '💀 ' + hangmanWord;
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
            if (msgs.length === 0) { div.innerHTML = '<div class="empty">💚 anime chat ready 💚</div>'; return; }
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
server.listen(PORT, () => { console.log('💚 anime chat ready 💚'); });
