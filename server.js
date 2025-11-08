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
        body { height: 100%; overflow: hidden; font-family: 'Arial', sans-serif; -webkit-user-select: none; user-select: none; background: linear-gradient(135deg, #1a1f3a 0%, #2d4a7f 20%, #4a3a8f 40%, #5a3d7f 60%, #7a4aaf 80%, #4a3a8f 100%); }
        .login-screen { position: fixed; width: 100vw; height: 100vh; background: linear-gradient(135deg, #1f2f5f 0%, #2d4a7f 25%, #5a3d7f 50%, #7a4aaf 75%, #4a3a8f 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; text-align: center; z-index: 100; }
        .login-screen p { font-size: 28px; color: white; margin-bottom: 40px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
        .login-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 100%; max-width: 420px; }
        .login-btn { padding: 20px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; border: none; border-radius: 20px; font-size: 18px; font-weight: bold; cursor: pointer; text-transform: uppercase; box-shadow: 0 6px 20px rgba(0,0,0,0.15); transition: all 0.3s; letter-spacing: 1px; }
        .login-btn:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .login-btn:active { transform: scale(0.95); }
        .container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #1a1f3a 0%, #2d4a7f 20%, #4a3a8f 40%, #5a3d7f 60%, #7a4aaf 80%, #4a3a8f 100%); display: none; flex-direction: column; z-index: 50; }
        .container.show { display: flex; }
        .header { background: linear-gradient(135deg, #2d4a7f 0%, #5a5fdf 50%, #9a5fff 100%); color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: bold; flex-shrink: 0; gap: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
        #myname { font-size: 18px; text-transform: uppercase; }
        .logout-btn { background: #8b5cf6; color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 11px; font-weight: bold; text-transform: uppercase; }
        .tabs { display: flex; gap: 8px; padding: 10px; background: linear-gradient(135deg, rgba(45, 74, 127, 0.4), rgba(154, 90, 255, 0.3)); border-bottom: 2px solid rgba(90, 95, 223, 0.6); overflow-x: auto; flex-shrink: 0; }
        .tab { padding: 8px 14px; background: linear-gradient(135deg, #2d4a7f 0%, #5a5fdf 100%); border: none; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 12px; white-space: nowrap; color: white; flex-shrink: 0; text-transform: uppercase; transition: all 0.3s; }
        .tab:hover { opacity: 0.8; }
        .tab.active { background: linear-gradient(135deg, #5a5fdf 0%, #9a5fff 100%); }
        .chat-display { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; padding: 15px; -webkit-overflow-scrolling: touch; font-size: 22px; background: linear-gradient(135deg, rgba(26, 31, 58, 0.5), rgba(90, 95, 223, 0.15)); position: relative; }
        .message { margin-bottom: 12px; display: flex; flex-direction: column; position: relative; z-index: 2; animation: fadeIn 0.3s; }
        .message.own { align-items: flex-end; }
        .message-sender { font-size: 14px; color: #a0aec0; margin: 0 0 4px 0; font-weight: bold; letter-spacing: 1px; }
        .message-sender .heart { font-size: 12px; margin: 0 4px; }
        .message.own .message-sender .heart { color: #a855f7; }
        .message.esther .message-sender .heart { color: #06b6d4; }
        .message.valley .message-sender .heart { color: #a855f7; }
        .message.amaaya .message-sender .heart { color: #10b981; }
        .message.mama .message-sender .heart { color: #f59e0b; }
        .message.mummy .message-sender .heart { color: #ec4899; }
        .message.hilary .message-sender .heart { color: #8b5cf6; }
        .message.nan .message-sender .heart { color: #ef4444; }
        .message.rishy .message-sender .heart { color: #f97316; }
        .message.poppy .message-sender .heart { color: #0ea5e9; }
        .message.sienna .message-sender .heart { color: #f472b6; }
        .message.penelope .message-sender .heart { color: #d8b4fe; }
        .message-bubble { max-width: 70%; padding: 8px 12px; border-radius: 14px; word-wrap: break-word; font-size: 18px; font-weight: 500; line-height: 1.4; border: 1px solid rgba(255,255,255,0.1); width: fit-content; display: inline-block; }
        .message.own .message-bubble { background: linear-gradient(135deg, #6a5adf, #a47fff); color: white; }
        .message.esther .message-bubble { background: #d4d9e8; color: #0f1218; }
        .message.valley .message-bubble { background: #d4d9e8; color: #0f1218; }
        .message.amaaya .message-bubble { background: #d4d9e8; color: #0f1218; }
        .message.mama .message-bubble { background: #d4d9e8; color: #0f1218; }
        .message.mummy .message-bubble { background: #d4d9e8; color: #0f1218; }
        .message.hilary .message-bubble { background: #d4d9e8; color: #0f1218; }
        .message.nan .message-bubble { background: #d4d9e8; color: #0f1218; }
        .message.rishy .message-bubble { background: #d4d9e8; color: #0f1218; }
        .message.poppy .message-bubble { background: #d4d9e8; color: #0f1218; }
        .message.sienna .message-bubble { background: #d4d9e8; color: #0f1218; }
        .message.penelope .message-bubble { background: #d4d9e8; color: #0f1218; }
        .input-area { background: linear-gradient(135deg, rgba(45, 74, 127, 0.35), rgba(154, 90, 255, 0.25)); border-top: 2px solid rgba(90, 95, 223, 0.6); display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; padding: 10px; max-height: 50vh; overflow-y: auto; }
        .emoji-picker { display: none; grid-template-columns: repeat(6, 1fr); gap: 6px; padding: 10px; background: linear-gradient(135deg, #2d4a7f, #5a3d7f); border-radius: 10px; max-height: 120px; overflow-y: auto; border: 1px solid rgba(90, 95, 223, 0.7); }
        .emoji-picker.show { display: grid; }
        .emoji-option { font-size: 20px; cursor: pointer; text-align: center; padding: 6px; border-radius: 8px; transition: all 0.2s; }
        .emoji-option:hover { transform: scale(1.15); }
        .games-panel { display: none; background: linear-gradient(135deg, #2d4a7f, #5a3d7f); border-radius: 10px; padding: 10px; border: 1px solid rgba(90, 95, 223, 0.7); max-height: 220px; overflow-y: auto; }
        .games-panel.show { display: block; }
        .game-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
        .game-btn { padding: 12px 16px; background: linear-gradient(135deg, #2d4a7f, #9a5fff); color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 14px; text-transform: uppercase; transition: all 0.3s; }
        .game-btn:hover { transform: translateY(-1px); }
        .game-btn:active { transform: scale(0.95); }
        .game-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .input-container { display: flex; gap: 6px; align-items: center; width: 100%; }
        .input-field { flex: 1; padding: 10px 12px; border: 2px solid #7c8fff; border-radius: 10px; font-size: 13px; font-family: inherit; height: auto; min-height: 40px; background: #f0f2f7; color: #1a1f3a; font-weight: 500; }
        .input-field:focus { outline: none; border-color: #5a5fdf; background: #f9fafc; }
        .input-field::placeholder { color: #9ca3af; }
        .emoji-btn { background: linear-gradient(135deg, #2d4a7f, #5a5fdf); border: 2px solid #9a5fff; color: white; padding: 8px 10px; border-radius: 8px; font-size: 16px; cursor: pointer; height: 40px; min-width: 40px; flex-shrink: 0; font-weight: bold; transition: all 0.3s; }
        .emoji-btn:hover { background: linear-gradient(135deg, #5a5fdf, #9a5fff); }
        .games-btn { background: linear-gradient(135deg, #2d4a7f, #5a5fdf); border: 2px solid #9a5fff; color: white; padding: 8px 10px; border-radius: 8px; font-size: 16px; cursor: pointer; height: 40px; font-weight: bold; min-width: 40px; flex-shrink: 0; transition: all 0.3s; }
        .games-btn:hover { background: linear-gradient(135deg, #5a5fdf, #9a5fff); }
        .send-btn { background: linear-gradient(135deg, #2d4a7f, #9a5fff); color: white; border: none; padding: 8px 12px; border-radius: 10px; font-size: 11px; font-weight: bold; cursor: pointer; height: 40px; min-width: 50px; flex-shrink: 0; text-transform: uppercase; transition: all 0.3s; }
        .send-btn:hover { transform: translateY(-1px); }
        .send-btn:active { transform: scale(0.95); }
        .send-btn:disabled { background: #4b5563; cursor: not-allowed; }
        .empty { text-align: center; color: #a0aec0; padding: 40px 15px; font-size: 16px; font-weight: bold; }
        .game-status { text-align: center; padding: 12px; background: linear-gradient(135deg, rgba(45, 74, 127, 0.4), rgba(154, 90, 255, 0.3)); border-radius: 8px; color: #b8d4ff; font-weight: bold; margin-bottom: 8px; font-size: 14px; }
        #triviaContainer { max-width: 600px; margin: auto; }
        .trivia-q { font-weight: bold; margin-bottom: 15px; color: #d4dcff; font-size: 18px; }
        .trivia-answers { display: grid; gap: 8px; margin-bottom: 10px; }
        .trivia-btn { padding: 12px; background: linear-gradient(135deg, #2d4a7f, #5a3d7f); border: 2px solid #5a5fdf; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; color: #d4dcff; transition: all 0.3s; }
        .trivia-btn:hover { background: rgba(90, 95, 223, 0.4); }
        .trivia-btn.correct { background: #10b981; color: white; border-color: #059669; }
        .trivia-btn.wrong { background: #ef4444; color: white; border-color: #dc2626; }
        .trivia-result { text-align: center; margin-top: 8px; font-weight: bold; color: #a0e7e5; font-size: 14px; }
        .letter-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin: 10px 0; }
        .letter-btn { padding: 8px; background: linear-gradient(135deg, #2d4a7f, #5a3d7f); border: 2px solid #5a5fdf; border-radius: 6px; cursor: pointer; font-weight: bold; color: #d4dcff; font-size: 11px; transition: all 0.2s; }
        .letter-btn:hover { background: rgba(90, 95, 223, 0.4); }
        .letter-btn:disabled { opacity: 0.2; cursor: not-allowed; }
        .hangman-word { font-size: 28px; font-weight: bold; letter-spacing: 6px; text-align: center; margin: 12px 0; font-family: monospace; color: #a0e7e5; }
        .hangman-stage { font-size: 48px; text-align: center; margin: 8px 0; }
        .story-input { width: 100%; padding: 10px; border: 2px solid #7c8fff; border-radius: 8px; font-size: 13px; margin-bottom: 8px; background: #f0f2f7; color: #1a1f3a; resize: vertical; min-height: 40px; }
        .story-line { background: rgba(61, 78, 200, 0.2); padding: 10px 12px; border-radius: 8px; margin: 8px 0; border-left: 4px solid #7c8fff; color: #d4dcff; font-size: 14px; line-height: 1.6; }
        .generator-btn { width: 100%; padding: 8px; background: linear-gradient(135deg, #2d4a7f, #9a5fff); color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin: 8px 0; }
        .rps-display { font-size: 48px; text-align: center; margin: 12px 0; }
        .dice-display { text-align: center; margin: 12px 0; }
        .dice-emoji { font-size: 36px; }
        .dice-number { font-size: 24px; font-weight: bold; color: #a0e7e5; margin-top: 8px; }
        #rpsContainer, #diceContainer, #storyContainer, #hangmanContainer { 
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            z-index: 9999 !important;
            max-height: 85vh !important;
            max-width: 85vw !important;
            background: linear-gradient(135deg, #2d4a7f, #5a3d7f) !important;
            border: 3px solid #7c8fff !important;
            border-radius: 25px !important;
            padding: 30px !important;
            box-shadow: 0 0 30px rgba(124, 143, 255, 0.8) !important;
            overflow-y: auto !important;
        }
        .hangman-display-word { font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; margin: 10px 0; font-family: monospace; color: #a0e7e5; }
        .hangman-display-stage { font-size: 48px; text-align: center; margin: 10px 0; }
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
            <div id="gamesPanel" class="games-panel">
                <div class="game-buttons">
                    <button class="game-btn" onclick="window.playRPS()">✊ RPS</button>
                    <button class="game-btn" onclick="window.playDice()">🎲 Dice</button>
                    <button class="game-btn" onclick="window.playTrivia()">🧠 Trivia</button>
                    <button class="game-btn" onclick="window.playHangman()">🎯 Hangman</button>
                    <button class="game-btn" onclick="window.playStory()">📖 Story</button>
                </div>

                <div id="rpsContainer" style="display: none;">
                    <div class="game-status" id="rpsStatus">Choose in 10s!</div>
                    <div class="game-buttons">
                        <button class="game-btn" onclick="window.selectRPS('rock', '✊')">✊ Rock</button>
                        <button class="game-btn" onclick="window.selectRPS('paper', '✋')">✋ Paper</button>
                        <button class="game-btn" onclick="window.selectRPS('scissors', '✌️')">✌️ Scissors</button>
                    </div>
                </div>

                <div id="diceContainer" style="display: none;">
                    <div class="game-status">Roll the Dice!</div>
                    <div class="dice-display" id="diceResult"></div>
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
                        <div style="text-align: center; margin-bottom: 20px; font-size: 18px; color: #d4dcff;"><strong>Set a Word for Others to Guess!</strong></div>
                        <input type="text" id="hangmanSetWord" placeholder="Enter word..." maxlength="12" style="width: 100%; padding: 10px; margin: 10px 0; border: 2px solid #7c8fff; border-radius: 8px; color: #1a1f3a; font-size: 14px; font-weight: bold; background: #f0f2f7;">
                        <button class="game-btn" style="width: 100%; margin-top: 10px; padding: 14px;" onclick="window.startHangman()">Start Game!</button>
                    </div>
                    <div id="hangmanGamePhase" style="display: none;">
                        <div class="hangman-stage" id="hangmanStage" style="font-size: 64px; text-align: center; margin: 15px 0;">😊</div>
                        <div class="hangman-word" id="hangmanWord" style="font-size: 48px; letter-spacing: 12px; text-align: center; margin: 20px 0; font-family: monospace; color: #a0e7e5; font-weight: bold;">_ _ _</div>
                        <div id="hangmanResult" style="text-align: center; font-weight: bold; margin: 15px 0; color: #d4dcff; font-size: 16px;"></div>
                        <input type="text" id="hangmanGuessInput" maxlength="1" placeholder="Type a letter & press Enter" style="width: 100%; padding: 12px; margin: 10px 0; border: 2px solid #7c8fff; border-radius: 8px; color: #1a1f3a; font-size: 16px; font-weight: bold; background: #f0f2f7; text-align: center; text-transform: uppercase;" onkeypress="if(event.key==='Enter') { window.guessHangmanLetter(document.getElementById('hangmanGuessInput').value.toUpperCase()); document.getElementById('hangmanGuessInput').value=''; }">
                    </div>
                </div>

                <div id="storyContainer" style="display: none;">
                    <div class="game-status" style="font-size: 18px; margin-bottom: 20px;">📖 Write a Story Together!</div>
                    <div id="storyText" style="background: linear-gradient(135deg, rgba(45, 74, 127, 0.3), rgba(90, 95, 223, 0.2)); padding: 15px; border-radius: 12px; margin-bottom: 15px; max-height: 350px; min-height: 200px; overflow-y: auto; font-size: 16px; color: #d4dcff; border: 2px solid rgba(124, 143, 255, 0.5); line-height: 1.8;"></div>
                    <textarea id="storyLine" class="story-input" placeholder="Add your line to the story..." maxlength="150" style="font-size: 14px; min-height: 60px;"></textarea>
                    <button class="game-btn" style="width: 100%; padding: 14px; font-size: 14px;" onclick="window.addStoryLine()">📖 Add Line</button>
                    <button class="generator-btn" style="padding: 12px; font-size: 14px;" onclick="window.generateStoryIdea()">💡 Get Story Idea</button>
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
            {q: 'Capital of Italy?', a: ['Rome','Milan','Venice','Florence'], c: 0},
            {q: 'Longest river?', a: ['Nile','Amazon','Yangtze','Mississippi'], c: 0},
            {q: 'Tallest mountain?', a: ['Everest','K2','Kangchenjunga','Lhotse'], c: 0},
            {q: 'Capital of Spain?', a: ['Madrid','Barcelona','Seville','Valencia'], c: 0},
            {q: 'Smallest country?', a: ['Vatican','Monaco','Liechtenstein','Malta'], c: 0},
            {q: 'How many continents?', a: ['7','5','6','8'], c: 0},
            {q: 'Capital of Canada?', a: ['Ottawa','Toronto','Vancouver','Montreal'], c: 0},
            {q: 'Hottest planet?', a: ['Venus','Mercury','Mars','Jupiter'], c: 0},
            {q: 'How many bones in body?', a: ['206','186','226','196'], c: 0},
            {q: 'Largest desert?', a: ['Antarctica','Sahara','Arabian','Gobi'], c: 0},
            {q: 'Capital of Germany?', a: ['Berlin','Munich','Hamburg','Frankfurt'], c: 0},
            {q: 'Speed of light?', a: ['300,000 km/s','150,000 km/s','450,000 km/s','200,000 km/s'], c: 0},
            {q: 'How many strings violin?', a: ['4','5','6','3'], c: 0},
            {q: 'Capital of India?', a: ['New Delhi','Mumbai','Bangalore','Kolkata'], c: 0},
            {q: 'Largest mammal?', a: ['Blue Whale','Elephant','Giraffe','Rhino'], c: 0},
            {q: 'How many sides pentagon?', a: ['5','6','7','4'], c: 0},
            {q: 'Capital of Greece?', a: ['Athens','Thessaloniki','Patras','Heraklion'], c: 0},
            {q: 'Smallest bone in body?', a: ['Stapes','Malleus','Incus','Vomer'], c: 0},
            {q: 'How many colors rainbow?', a: ['7','5','6','8'], c: 0},
            {q: 'Capital of Mexico?', a: ['Mexico City','Cancun','Guadalajara','Monterrey'], c: 0},
            {q: 'Largest feline?', a: ['Tiger','Lion','Jaguar','Cougar'], c: 0},
            {q: 'Capital of Russia?', a: ['Moscow','St. Petersburg','Novosibirsk','Yekaterinburg'], c: 0},
            {q: 'How many wheels bike?', a: ['2','3','4','1'], c: 0},
            {q: 'Capital of Turkey?', a: ['Ankara','Istanbul','Izmir','Bursa'], c: 0},
            {q: 'Fastest fish?', a: ['Sailfish','Tuna','Marlin','Barracuda'], c: 0},
            {q: 'How many minutes hour?', a: ['60','50','70','80'], c: 0},
            {q: 'Capital of Sweden?', a: ['Stockholm','Gothenburg','Malmo','Uppsala'], c: 0},
            {q: 'Smallest bird?', a: ['Hummingbird','Sparrow','Wren','Finch'], c: 0},
            {q: 'How many planets?', a: ['8','9','7','10'], c: 0},
            {q: 'Capital of Poland?', a: ['Warsaw','Krakow','Gdansk','Wroclaw'], c: 0},
            {q: 'Largest reptile?', a: ['Saltwater Croc','Anaconda','Komodo Dragon','Python'], c: 0},
            {q: 'How many teeth human?', a: ['32','28','30','36'], c: 0},
            {q: 'Capital of Norway?', a: ['Oslo','Bergen','Stavanger','Trondheim'], c: 0},
            {q: 'Strongest animal?', a: ['Dung Beetle','Ant','Ox','Elephant'], c: 0},
            {q: 'How many letters alphabet?', a: ['26','24','28','25'], c: 0},
            {q: 'Capital of Netherlands?', a: ['Amsterdam','Rotterdam','The Hague','Utrecht'], c: 0},
            {q: 'Loudest animal?', a: ['Sperm Whale','Elephant','Lion','Howler Monkey'], c: 0},
            {q: 'How many legs spider?', a: ['8','6','10','4'], c: 0},
            {q: 'Capital of Portugal?', a: ['Lisbon','Porto','Braga','Covilha'], c: 0},
            {q: 'Best sense eagle?', a: ['Vision','Hearing','Smell','Touch'], c: 0},
            {q: 'How many chambers heart?', a: ['4','3','5','6'], c: 0},
            {q: 'Capital of Belgium?', a: ['Brussels','Antwerp','Ghent','Bruges'], c: 0},
            {q: 'Fastest bird?', a: ['Peregrine Falcon','Ostrich','Cheetah','Roadrunner'], c: 0},
            {q: 'How many bones ear?', a: ['3','2','4','5'], c: 0},
            {q: 'Capital of Austria?', a: ['Vienna','Salzburg','Innsbruck','Graz'], c: 0},
            {q: 'Largest snake?', a: ['Anaconda','Python','Cobra','Mamba'], c: 0},
            {q: 'How many muscles tongue?', a: ['16','12','20','8'], c: 0},
            {q: 'Capital of Hungary?', a: ['Budapest','Debrecen','Szeged','Pécs'], c: 0},
            {q: 'Smartest ape?', a: ['Chimpanzee','Gorilla','Orangutan','Baboon'], c: 0},
            {q: 'How many taste buds?', a: ['10,000','5,000','15,000','20,000'], c: 0},
            {q: 'Capital of Czech?', a: ['Prague','Brno','Ostrava','Pilsen'], c: 0},
            {q: 'Most intelligent mammal?', a: ['Dolphin','Whale','Elephant','Ape'], c: 0},
            {q: 'How many chambers stomach?', a: ['1','2','3','4'], c: 0},
            {q: 'Capital of Romania?', a: ['Bucharest','Cluj','Iasi','Timisoara'], c: 0},
            {q: 'Rarest big cat?', a: ['Amur Leopard','Snow Leopard','Sumatran Tiger','Javan Rhino'], c: 0},
            {q: 'How many pairs ribs?', a: ['12','10','14','11'], c: 0},
            {q: 'Capital of Bulgaria?', a: ['Sofia','Plovdiv','Varna','Burgas'], c: 0},
            {q: 'Best dancer animal?', a: ['Porcupine','Deer','Flamingo','Swan'], c: 0},
            {q: 'How many lobes brain?', a: ['4','2','3','5'], c: 0},
            {q: 'Capital of Ireland?', a: ['Dublin','Cork','Galway','Limerick'], c: 0},
            {q: 'Deadliest snake?', a: ['Inland Taipan','Black Mamba','King Cobra','Viper'], c: 0},
            {q: 'How many eyelids camel?', a: ['3','2','4','1'], c: 0},
            {q: 'Capital of Serbia?', a: ['Belgrade','Nis','Novi Sad','Ub'], c: 0},
            {q: 'Highest jumping animal?', a: ['Flea','Grasshopper','Rabbit','Antelope'], c: 0},
            {q: 'How many chambers squid?', a: ['3','2','4','5'], c: 0},
            {q: 'Capital of Croatia?', a: ['Zagreb','Split','Rijeka','Zadar'], c: 0},
            {q: 'Best sense bear?', a: ['Smell','Sight','Hearing','Touch'], c: 0},
            {q: 'How many arms octopus?', a: ['8','6','10','7'], c: 0},
            {q: 'Capital of Ukraine?', a: ['Kyiv','Kharkiv','Odesa','Lviv'], c: 0},
            {q: 'Largest bird alive?', a: ['Ostrich','Emu','Cassowary','Rhea'], c: 0},
            {q: 'How many eyes spider?', a: ['8','6','10','4'], c: 0},
            {q: 'Capital of Greece?', a: ['Athens','Thessaloniki','Patras','Heraklion'], c: 0},
            {q: 'Animal sleeps upright?', a: ['Giraffe','Elephant','Horse','Cow'], c: 0},
            {q: 'How many wheels car?', a: ['4','3','5','6'], c: 0},
            {q: 'Capital of Israel?', a: ['Jerusalem','Tel Aviv','Haifa','Beer Sheva'], c: 0},
            {q: 'Largest insect?', a: ['Goliath Beetle','Dragonfly','Cicada','Grasshopper'], c: 0},
            {q: 'How many fingers hand?', a: ['5','4','6','3'], c: 0},
            {q: 'Capital of Thailand?', a: ['Bangkok','Chiang Mai','Phuket','Pattaya'], c: 0},
            {q: 'Best climber animal?', a: ['Monkey','Squirrel','Lizard','Cat'], c: 0},
            {q: 'How many toes foot?', a: ['5','4','6','3'], c: 0},
            {q: 'Capital of Singapore?', a: ['Singapore City','Sentosa','Changi','Bukit'], c: 0},
        ];

        const STORY_IDEAS = [
            'Once upon a time, there was a magical forest...',
            'A mysterious door appeared in the wall...',
            'The adventure began when they found a secret map...',
            'Nobody expected what happened next...',
            'In a faraway kingdom, there lived...',
            'The treasure was hidden where nobody could find it...',
            'It all started on a rainy Tuesday evening...',
            'The ancient book revealed a shocking secret...',
            'They never believed in magic until that day...',
            'The journey took them to a place beyond imagination...'
        ];

        const HANGMAN_STAGES = ['😊', '😐', '😕', '😟', '😢', '😭', '💀'];

        const AVATARS = {
            esther: '🐱', valley: '🎀', amaaya: '✨', mama: '👑', mummy: '💎',
            hilary: '🌸', nan: '💜', rishy: '⭐', poppy: '🌷', sienna: '🦖', penelope: '💝'
        };

        let currentUser = null, currentChat = 'group', allChats = [], messages = {}, ws = null, connected = false;
        let rpsTimeLeft = 0, rpsTimer = null;
        let hangmanWord = '', hangmanGuessed = [], hangmanWrong = 0, hangmanGameActive = false, hangmanSetter = '';
        let triviaScore = {}, triviaTotal = 0, triviaAnswered = false, triviaCurrentQ = null, triviaUsers = new Set();
        let usedTriviaQuestions = [];
        let playerTriviaQuestions = {};

        window.playTrivia = function() {
            triviaScore = {};
            triviaTotal = 0;
            triviaUsers.clear();
            triviaAnswered = false;
            usedTriviaQuestions = [];
            playerTriviaQuestions[currentUser] = [];
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('diceContainer').style.display = 'none';
            document.getElementById('hangmanContainer').style.display = 'none';
            document.getElementById('storyContainer').style.display = 'none';
            document.getElementById('triviaContainer').style.display = 'block';
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
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🧠 Trivia finished! ' + scores }));
                return;
            }
            triviaTotal++;
            triviaUsers.clear();
            triviaAnswered = false;
            
            let triviaCurrentQ;
            do {
                const randomIdx = Math.floor(Math.random() * TRIVIA_QUESTIONS.length);
                triviaCurrentQ = TRIVIA_QUESTIONS[randomIdx];
            } while (playerTriviaQuestions[currentUser] && playerTriviaQuestions[currentUser].includes(triviaCurrentQ.q));
            
            if (!playerTriviaQuestions[currentUser]) playerTriviaQuestions[currentUser] = [];
            playerTriviaQuestions[currentUser].push(triviaCurrentQ.q);
            
            document.getElementById('triviaQuestion').textContent = triviaCurrentQ.q;
            const answers = document.getElementById('triviaAnswers');
            answers.innerHTML = '';
            triviaCurrentQ.a.forEach((ans, idx) => {
                const btn = document.createElement('button');
                btn.className = 'trivia-btn';
                btn.textContent = ans;
                btn.onclick = () => window.submitTriviaAnswer(idx, triviaCurrentQ);
                answers.appendChild(btn);
            });
            document.getElementById('triviaResult').textContent = '';
            document.getElementById('triviaScore').textContent = triviaTotal + '/5';
        };

        window.submitTriviaAnswer = function(idx, question) {
            if (triviaAnswered) return;
            triviaAnswered = true;
            const isCorrect = idx === question.c;
            if (!triviaScore[currentUser]) triviaScore[currentUser] = 0;
            if (isCorrect) triviaScore[currentUser]++;
            document.querySelectorAll('.trivia-btn').forEach((b, i) => {
                if (i === question.c) b.classList.add('correct');
                else if (i === idx) b.classList.add('wrong');
            });
            document.getElementById('triviaResult').textContent = isCorrect ? '✓ Correct!' : '✗ Wrong!';
            ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🧠 ' + currentUser + ': ' + (isCorrect ? '✓ Correct!' : '✗ Wrong!') }));
            setTimeout(window.nextTriviaQuestion, 2000);
        };

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
                } else if (data.type === 'game_state') {
                    // Sync game state from other player
                    const gameData = data.data;
                    if (gameData.game === 'hangman_start') {
                        // Open hangman for both players
                        document.getElementById('hangmanContainer').style.display = 'block';
                        document.getElementById('rpsContainer').style.display = 'none';
                        document.getElementById('triviaContainer').style.display = 'none';
                        document.getElementById('diceContainer').style.display = 'none';
                        document.getElementById('storyContainer').style.display = 'none';
                        document.getElementById('hangmanSetupPhase').style.display = 'block';
                        document.getElementById('hangmanGamePhase').style.display = 'none';
                    } else if (gameData.game === 'hangman') {
                        // Update hangman game state
                        hangmanWord = gameData.word;
                        hangmanGuessed = gameData.guessed;
                        hangmanWrong = gameData.wrong;
                        hangmanGameActive = gameData.active;
                        hangmanSetter = gameData.setter;
                        document.getElementById('hangmanContainer').style.display = 'block';
                        document.getElementById('rpsContainer').style.display = 'none';
                        document.getElementById('triviaContainer').style.display = 'none';
                        document.getElementById('diceContainer').style.display = 'none';
                        document.getElementById('storyContainer').style.display = 'none';
                        document.getElementById('hangmanSetupPhase').style.display = 'none';
                        document.getElementById('hangmanGamePhase').style.display = 'block';
                        window.renderHangmanGame();
                    } else if (gameData.game === 'story_start') {
                        // Open story for both players
                        document.getElementById('storyContainer').style.display = 'block';
                        document.getElementById('rpsContainer').style.display = 'none';
                        document.getElementById('diceContainer').style.display = 'none';
                        document.getElementById('triviaContainer').style.display = 'none';
                        document.getElementById('hangmanContainer').style.display = 'none';
                    } else if (gameData.game === 'story') {
                        storyLines = gameData.storyLines;
                        document.getElementById('storyText').innerHTML = '';
                        storyLines.forEach(line => {
                            const p = document.createElement('div');
                            p.className = 'story-line';
                            const parts = line.split(': ');
                            const playerName = parts[0];
                            const playerLine = parts.slice(1).join(': ');
                            p.innerHTML = '<strong style="color: #a0e7e5;">' + playerName + ':</strong> <span style="color: #d4dcff;">' + playerLine + '</span>';
                            document.getElementById('storyText').appendChild(p);
                        });
                        document.getElementById('storyText').scrollTop = document.getElementById('storyText').scrollHeight;
                    }
                } else if (data.type === 'rps_reveal') {
                    rpsChoices[data.user] = data.choice;
                    if (Object.keys(rpsChoices).length >= 2) {
                        let result = '';
                        Object.entries(rpsChoices).forEach(([user, choice]) => {
                            result += user + ': ' + choice.emoji + ' ';
                        });
                        ws.send(JSON.stringify({ type: 'new_message', user: 'Game', chatId: data.chatId, text: '✊ RPS Results: ' + result }));
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
                if (chatId === 'group') {
                    btn.textContent = '👥 Group';
                } else {
                    // If current user is Esther, show the other person's name
                    if (currentUser === 'esther') {
                        const parts = chatId.split('-');
                        const otherName = parts[0] === 'esther' ? parts[1] : parts[0];
                        btn.textContent = '💬 ' + otherName.toUpperCase();
                    } else {
                        // If current user is NOT Esther, always show ESTHER
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

        let rpsChoice = null;
        let rpsChoices = {};

        window.playRPS = function() {
            document.getElementById('rpsContainer').style.display = 'block';
            document.getElementById('hangmanContainer').style.display = 'none';
            document.getElementById('triviaContainer').style.display = 'none';
            document.getElementById('diceContainer').style.display = 'none';
            document.getElementById('storyContainer').style.display = 'none';
            rpsChoice = null;
            rpsChoices = {};
            rpsTimeLeft = 10;
            document.getElementById('rpsStatus').textContent = 'Choose in 10s!';
            document.querySelectorAll('#rpsContainer .game-btn').forEach(b => {
                if (b.textContent.includes('Rock') || b.textContent.includes('Paper') || b.textContent.includes('Scissors')) {
                    b.disabled = false;
                }
            });
            if (connected) {
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: 'Started RPS game!' }));
            }
            rpsTimer = setInterval(() => {
                rpsTimeLeft--;
                document.getElementById('rpsStatus').textContent = rpsTimeLeft + 's left!';
                if (rpsTimeLeft <= 0) {
                    clearInterval(rpsTimer);
                    document.querySelectorAll('#rpsContainer .game-btn').forEach(b => b.disabled = true);
                    if (rpsChoice) {
                        if (connected) {
                            ws.send(JSON.stringify({ type: 'rps_reveal', user: currentUser, chatId: currentChat, choice: rpsChoice }));
                        }
                    }
                }
            }, 1000);
        };

        window.selectRPS = function(choice, emoji) {
            rpsChoice = { choice: choice, emoji: emoji };
            document.querySelectorAll('#rpsContainer .game-btn').forEach(b => {
                if (b.textContent.includes('Rock') || b.textContent.includes('Paper') || b.textContent.includes('Scissors')) {
                    b.disabled = true;
                }
            });
            document.getElementById('rpsStatus').textContent = 'Waiting for others... (' + emoji + ')';
        };

        window.playDice = function() {
            document.getElementById('diceContainer').style.display = 'block';
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('hangmanContainer').style.display = 'none';
            document.getElementById('triviaContainer').style.display = 'none';
            document.getElementById('storyContainer').style.display = 'none';
        };

        window.rollDice = function() {
            const result = Math.floor(Math.random() * 6) + 1;
            const diceEmojis = ['🎲', '🎲', '🎲', '🎲', '🎲', '🎲'];
            document.getElementById('diceResult').innerHTML = '<div class="dice-emoji">' + diceEmojis[result-1] + '</div><div class="dice-number">Number: ' + result + '</div>';
            if (connected) {
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎲 rolled ' + result }));
            }
        };

        window.playRPS = function() {
            document.getElementById('rpsContainer').style.display = 'block';
            document.getElementById('hangmanContainer').style.display = 'none';
            document.getElementById('triviaContainer').style.display = 'none';
            document.getElementById('diceContainer').style.display = 'none';
            document.getElementById('storyContainer').style.display = 'none';
            rpsChoice = null;
            rpsChoices = {};
            rpsPlayers = {};
            rpsTimeLeft = 10;
            document.getElementById('rpsStatus').textContent = 'Choose in 10s!';
            document.querySelectorAll('#rpsContainer .game-btn').forEach(b => {
                if (b.textContent.includes('Rock') || b.textContent.includes('Paper') || b.textContent.includes('Scissors')) {
                    b.disabled = false;
                }
            });
            if (connected) {
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '✊ ' + currentUser + ' started RPS game!' }));
            }
            rpsTimer = setInterval(() => {
                rpsTimeLeft--;
                document.getElementById('rpsStatus').textContent = rpsTimeLeft + 's left!';
                if (rpsTimeLeft <= 0) {
                    clearInterval(rpsTimer);
                    document.querySelectorAll('#rpsContainer .game-btn').forEach(b => b.disabled = true);
                    if (rpsChoice) {
                        if (connected) {
                            ws.send(JSON.stringify({ type: 'rps_choice', user: currentUser, chatId: currentChat, choice: rpsChoice }));
                        }
                    }
                }
            }, 1000);
        };

        window.selectRPS = function(choice, emoji) {
            rpsChoice = { choice: choice, emoji: emoji };
            document.querySelectorAll('#rpsContainer .game-btn').forEach(b => {
                if (b.textContent.includes('Rock') || b.textContent.includes('Paper') || b.textContent.includes('Scissors')) {
                    b.disabled = true;
                }
            });
            document.getElementById('rpsStatus').textContent = 'Your choice: ' + emoji + ' (Waiting for opponent...)';
            if (connected) {
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '✊ ' + currentUser + ' chose: ' + emoji }));
            }
        };

        window.playDice = function() {
            document.getElementById('diceContainer').style.display = 'block';
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('hangmanContainer').style.display = 'none';
            document.getElementById('triviaContainer').style.display = 'none';
            document.getElementById('storyContainer').style.display = 'none';
        };

        window.rollDice = function() {
            const result = Math.floor(Math.random() * 6) + 1;
            const diceEmojis = ['🎲', '🎲', '🎲', '🎲', '🎲', '🎲'];
            document.getElementById('diceResult').innerHTML = '<div class="dice-emoji">' + diceEmojis[result-1] + '</div><div class="dice-number">Number: ' + result + '</div>';
            if (connected) {
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎲 rolled ' + result }));
            }
        };

        window.playTrivia = function() {
            triviaScore = {};
            triviaTotal = 0;
            triviaUsers.clear();
            triviaAnswered = false;
            usedTriviaQuestions = [];
            playerTriviaQuestions[currentUser] = [];
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('diceContainer').style.display = 'none';
            document.getElementById('hangmanContainer').style.display = 'none';
            document.getElementById('storyContainer').style.display = 'none';
            document.getElementById('triviaContainer').style.display = 'block';
            document.getElementById('triviaContainer').style.position = 'fixed';
            document.getElementById('triviaContainer').style.top = '50%';
            document.getElementById('triviaContainer').style.left = '50%';
            document.getElementById('triviaContainer').style.transform = 'translate(-50%, -50%)';
            document.getElementById('triviaContainer').style.zIndex = '9999';
            document.getElementById('triviaContainer').style.maxHeight = '90vh';
            document.getElementById('triviaContainer').style.maxWidth = '90vw';
            document.getElementById('triviaContainer').style.background = 'linear-gradient(135deg, #2d4a7f, #5a3d7f)';
            document.getElementById('triviaContainer').style.border = '3px solid #7c8fff';
            document.getElementById('triviaContainer').style.borderRadius = '20px';
            document.getElementById('triviaContainer').style.padding = '30px';
            document.getElementById('triviaContainer').style.boxShadow = '0 0 30px rgba(124, 143, 255, 0.6)';
            ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🧠 ' + currentUser + ' started Trivia!' }));
            window.nextTriviaQuestion();
        };

        window.playHangman = function() {
            hangmanWord = '';
            hangmanGuessed = [];
            hangmanWrong = 0;
            hangmanGameActive = false;
            hangmanSetter = '';
            document.getElementById('hangmanContainer').style.display = 'block';
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('triviaContainer').style.display = 'none';
            document.getElementById('diceContainer').style.display = 'none';
            document.getElementById('storyContainer').style.display = 'none';
            document.getElementById('hangmanSetupPhase').style.display = 'block';
            document.getElementById('hangmanGamePhase').style.display = 'none';
            document.getElementById('hangmanSetWord').value = '';
            if (connected) {
                // Broadcast that hangman game is starting
                ws.send(JSON.stringify({ type: 'game_state', data: { game: 'hangman_start' } }));
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎯 ' + currentUser + ' started Hangman!' }));
            }
        };

        window.startHangman = function() {
            const word = document.getElementById('hangmanSetWord').value.toUpperCase();
            if (word.length < 3) { alert('Too short!'); return; }
            hangmanWord = word;
            hangmanSetter = currentUser;
            hangmanGuessed = [];
            hangmanWrong = 0;
            hangmanGameActive = true;
            document.getElementById('hangmanSetupPhase').style.display = 'none';
            document.getElementById('hangmanGamePhase').style.display = 'block';
            window.renderHangmanGame();
            if (connected) {
                const display = hangmanWord.split('').map(l => '_').join(' ');
                // Broadcast hangman game start to all players
                ws.send(JSON.stringify({ type: 'game_state', data: { game: 'hangman', word: hangmanWord, guessed: hangmanGuessed, wrong: hangmanWrong, active: hangmanGameActive, setter: hangmanSetter, display: display } }));
                ws.send(JSON.stringify({ type: 'new_message', user: 'Game', chatId: currentChat, text: '🎯 HANGMAN STARTED! Setter: ' + hangmanSetter + ' | Guessers: Everyone else | ' + HANGMAN_STAGES[0] + ' | Word: ' + display + ' | Wrong: 0/6' }));
            }
        };

        window.renderHangmanGame = function() {
            if (!hangmanGameActive) return;
            const display = hangmanWord.split('').map(l => hangmanGuessed.includes(l) ? l : '_').join(' ');
            document.getElementById('hangmanWord').textContent = display;
            document.getElementById('hangmanStage').textContent = HANGMAN_STAGES[Math.min(hangmanWrong, 6)];
            document.getElementById('hangmanStatus').textContent = 'Word Setter: ' + hangmanSetter + ' | Wrong: ' + hangmanWrong + '/6 | Guessed: ' + hangmanGuessed.join(' ');
            
            const won = hangmanWord.split('').every(l => hangmanGuessed.includes(l));
            const lost = hangmanWrong >= 6;
            if (won || lost) {
                hangmanGameActive = false;
                const result = won ? '✓ WON! Word was: ' + hangmanWord + ' (Guessers win!)' : '✗ LOST! Word was: ' + hangmanWord + ' (Setter wins!)';
                document.getElementById('hangmanResult').textContent = result;
                if (connected) {
                    ws.send(JSON.stringify({ type: 'new_message', user: 'Game', chatId: currentChat, text: '🎯 ' + result }));
                }
            }
        };

        window.guessHangmanLetter = function(letter) {
            if (!hangmanGameActive || hangmanGuessed.includes(letter)) return;
            hangmanGuessed.push(letter);
            if (!hangmanWord.includes(letter)) hangmanWrong++;
            
            const display = hangmanWord.split('').map(l => hangmanGuessed.includes(l) ? l : '_').join(' ');
            const won = hangmanWord.split('').every(l => hangmanGuessed.includes(l));
            const lost = hangmanWrong >= 6;
            
            window.renderHangmanGame();
            
            if (connected) {
                // Broadcast hangman state to all players for real-time sync
                ws.send(JSON.stringify({ type: 'game_state', data: { game: 'hangman', word: hangmanWord, guessed: hangmanGuessed, wrong: hangmanWrong, active: hangmanGameActive, setter: hangmanSetter } }));
                
                let status = '🎯 ' + currentUser + ' guessed: ' + letter + ' | ' + HANGMAN_STAGES[Math.min(hangmanWrong, 6)] + ' | ' + display + ' | Wrong: ' + hangmanWrong + '/6';
                if (won) {
                    status = '🎯 WON! The word was: ' + hangmanWord + ' ✓ (Guessers win!)';
                } else if (lost) {
                    status = '🎯 LOST! The word was: ' + hangmanWord + ' ✗ (Setter ' + hangmanSetter + ' wins!)';
                }
                ws.send(JSON.stringify({ type: 'new_message', user: 'Game', chatId: currentChat, text: status }));
            }
        };

        window.playStory = function() {
            document.getElementById('storyContainer').style.display = 'block';
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('diceContainer').style.display = 'none';
            document.getElementById('triviaContainer').style.display = 'none';
            document.getElementById('hangmanContainer').style.display = 'none';
            if (storyLines.length === 0) {
                storyLines = [];
                document.getElementById('storyText').innerHTML = '';
            }
            document.getElementById('storyLine').value = '';
            if (connected) {
                // Broadcast that story game is starting
                ws.send(JSON.stringify({ type: 'game_state', data: { game: 'story_start' } }));
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '📖 ' + currentUser + ' started a Story!' }));
            }
        };

        window.addStoryLine = function() {
            const line = document.getElementById('storyLine').value.trim();
            if (!line) return;
            storyLines.push(currentUser + ': ' + line);
            const storyDiv = document.getElementById('storyText');
            const p = document.createElement('div');
            p.className = 'story-line';
            p.innerHTML = '<strong style="color: #a0e7e5;">' + currentUser + ':</strong> <span style="color: #d4dcff;">' + line + '</span>';
            storyDiv.appendChild(p);
            storyDiv.scrollTop = storyDiv.scrollHeight;
            document.getElementById('storyLine').value = '';
            if (connected) {
                // Broadcast story state to all players
                ws.send(JSON.stringify({ type: 'game_state', data: { game: 'story', storyLines: storyLines } }));
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '📖 ' + currentUser + ': ' + line }));
            }
        };

        window.generateStoryIdea = function() {
            const idea = STORY_IDEAS[Math.floor(Math.random() * STORY_IDEAS.length)];
            document.getElementById('storyLine').value = idea;
        };

        window.send = function() {
            const inp = document.getElementById('msg');
            const text = inp.value.trim().toUpperCase();
            if (!text || !connected) return;
            
            // Check if hangman is active and input is a single letter
            if (hangmanGameActive && text.length === 1 && /[A-Z]/.test(text)) {
                if (hangmanGuessed.includes(text)) {
                    inp.value = '';
                    return; // Already guessed
                }
                hangmanGuessed.push(text);
                if (!hangmanWord.includes(text)) hangmanWrong++;
                
                const display = hangmanWord.split('').map(l => hangmanGuessed.includes(l) ? l : '_').join(' ');
                const won = hangmanWord.split('').every(l => hangmanGuessed.includes(l));
                const lost = hangmanWrong >= 6;
                
                let status = '🎯 ' + currentUser + ' guessed: ' + text + ' | ' + HANGMAN_STAGES[Math.min(hangmanWrong, 6)] + ' | ' + display + ' | Wrong: ' + hangmanWrong + '/6';
                if (won) {
                    status = '🎯 Won! The word was: ' + hangmanWord + ' ✓';
                    hangmanGameActive = false;
                    document.getElementById('msg').placeholder = 'Say something...';
                } else if (lost) {
                    status = '🎯 Lost! The word was: ' + hangmanWord + ' ✗';
                    hangmanGameActive = false;
                    document.getElementById('msg').placeholder = 'Say something...';
                }
                ws.send(JSON.stringify({ type: 'new_message', user: 'Game', chatId: currentChat, text: status }));
                inp.value = '';
            } else {
                // Normal message
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: text }));
                inp.value = '';
            }
        };

        window.render = function() {
            const div = document.getElementById('chat');
            div.innerHTML = '';
            const msgs = messages[currentChat] || [];
            if (msgs.length === 0) { div.innerHTML = '<div class="empty">Chat ready!</div>'; return; }
            msgs.forEach(m => {
                const d = document.createElement('div');
                let displayName = m.user;
                let bubbleName = m.user;
                
                // If in a private chat (not group)
                if (currentChat !== 'group') {
                    // If current user is Esther, show real names
                    if (currentUser === 'esther') {
                        displayName = m.user === 'esther' ? 'ESTHER' : m.user;
                        bubbleName = m.user === 'esther' ? 'ESTHER' : m.user;
                    } else {
                        // If current user is NOT Esther, show their own name, but bubble says ESTHER
                        if (m.user === currentUser) {
                            displayName = currentUser;
                            bubbleName = 'ESTHER';
                        } else {
                            displayName = 'ESTHER';
                            bubbleName = 'ESTHER';
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
      } else if (msg.type === 'rps_choice') {
        // Add RPS choice message to chat
        const newMsg = { id: Date.now(), user: msg.user, text: '✊ ' + msg.user + ' chose: ' + msg.choice.emoji, chatId: msg.chatId };
        const chatId = msg.chatId || 'group';
        if (!messages[chatId]) messages[chatId] = [];
        messages[chatId].push(newMsg);
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'message', data: newMsg }));
          }
        });
      } else if (msg.type === 'game_state') {
        // Broadcast game state to all clients so everyone sees the same thing
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'game_state', data: msg.data }));
          }
        });
      } else if (msg.type === 'rps_reveal') {
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
server.listen(PORT, () => { console.log('Chat Server Running'); });
