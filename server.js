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
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #FF6B9D 0%, #FFA06B 16%, #FFE66D 32%, #95E1D3 48%, #667eea 64%, #764ba2 80%, #FF6B9D 100%); background-size: 200% 200%; animation: gradientShift 8s ease infinite; min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 10px; }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        
        body.dark-mode { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); }
        
        .login-screen { width: 100%; max-width: 480px; background: white; border-radius: 28px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); padding: 40px; text-align: center; }
        .dark-mode .login-screen { background: #2a2a3e; color: white; }
        .login-screen h1 { font-size: 42px; margin-bottom: 8px; color: #333; font-weight: 800; }
        .dark-mode .login-screen h1 { color: white; }
        .login-screen p { font-size: 15px; color: #666; margin-bottom: 35px; font-weight: 500; }
        .dark-mode .login-screen p { color: #aaa; }
        
        .login-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .login-btn { padding: 16px; background: linear-gradient(90deg, #FF6B9D 0%, #FFA06B 25%, #FFE66D 50%, #95E1D3 75%, #667eea 100%); color: white; border: none; border-radius: 14px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
        .login-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6); }
        
        .container { width: 100%; max-width: 480px; background: white; border-radius: 28px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); display: none; flex-direction: column; height: 90vh; max-height: 750px; overflow: hidden; }
        .dark-mode .container { background: #2a2a3e; }
        .container.show { display: flex; }
        
        .header { background: linear-gradient(90deg, #FF6B9D 0%, #FFA06B 25%, #FFE66D 50%, #95E1D3 75%, #667eea 100%); color: white; padding: 16px; border-radius: 28px 28px 0 0; display: flex; justify-content: space-between; align-items: center; font-size: 20px; font-weight: 700; }
        .header-title { flex-grow: 1; }
        .logout-btn { background: rgba(255,255,255,0.25); border: none; color: white; padding: 6px 12px; border-radius: 10px; cursor: pointer; font-size: 11px; font-weight: 600; transition: all 0.3s; }
        .logout-btn:hover { background: rgba(255,255,255,0.35); }
        .dark-mode-btn { background: rgba(255,255,255,0.25); border: none; color: white; padding: 6px 12px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.3s; }
        .dark-mode-btn:hover { background: rgba(255,255,255,0.35); }
        
        .tabs { display: flex; gap: 6px; padding: 10px; background: #f8f9fb; border-bottom: 2px solid #e8eaf6; overflow-x: auto; }
        .dark-mode .tabs { background: #1a1a2e; border-color: #444; }
        .tab { padding: 10px 14px; background: white; border: 2px solid #e0e0e0; border-radius: 18px; cursor: pointer; font-weight: 600; font-size: 12px; white-space: nowrap; transition: all 0.3s; color: #666; }
        .dark-mode .tab { background: #3a3a4e; border-color: #555; color: #aaa; }
        .tab:hover { background: #f5f5f5; }
        .dark-mode .tab:hover { background: #4a4a5e; }
        .tab.active { background: linear-gradient(90deg, #FF6B9D 0%, #FFA06B 25%, #FFE66D 50%, #95E1D3 75%, #667eea 100%); color: white; border-color: #667eea; box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3); }
        
        .chat-display { flex: 1; overflow-y: auto; padding: 20px 16px; background: linear-gradient(135deg, #fff9f0 0%, #fef5e7 50%, #fff9f0 100%), radial-gradient(circle at 20% 80%, rgba(255, 107, 157, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(167, 230, 207, 0.05) 0%, transparent 50%); }
        .dark-mode .chat-display { background: #1a1a2e; }
        .message { margin-bottom: 12px; display: flex; flex-direction: column; animation: slideIn 0.25s ease-out; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .message.own { align-items: flex-end; }
        
        .message-content { display: flex; gap: 8px; align-items: flex-end; }
        .message.own .message-content { flex-direction: row-reverse; }
        .avatar { width: 28px; height: 28px; border-radius: 50%; font-size: 16px; display: flex; align-items: center; justify-content: center; }
        
        .message-bubble { max-width: 75%; padding: 12px 16px; border-radius: 16px; word-wrap: break-word; font-size: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-weight: 500; line-height: 1.5; position: relative; }
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
        .message.pinned::before { content: '📌 '; }
        
        .message-sender { font-size: 12px; color: #666; margin: 0 0 6px 0; font-weight: 600; text-transform: capitalize; letter-spacing: 0.2px; }
        .dark-mode .message-sender { color: #aaa; }
        .message.own .message-sender { text-align: right; }
        
        .message-reactions { display: flex; gap: 4px; margin-top: 6px; flex-wrap: wrap; }
        .reaction { background: rgba(255,255,255,0.3); padding: 2px 6px; border-radius: 12px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
        .reaction:hover { background: rgba(255,255,255,0.5); }
        
        .input-area { padding: 12px; background: white; border-top: 2px solid #e8eaf6; display: flex; flex-direction: column; gap: 8px; }
        .dark-mode .input-area { background: #2a2a3e; border-color: #444; }
        
        .emoji-picker { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; padding: 12px; background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%); border-radius: 14px; max-height: 200px; overflow-y: auto; border: 2px solid #ffc107; }
        .dark-mode .emoji-picker { background: #3a3a4e; border-color: #666; }
        .emoji-option { font-size: 24px; cursor: pointer; text-align: center; padding: 8px; border-radius: 10px; transition: all 0.2s; user-select: none; background: white; border: 1px solid transparent; }
        .dark-mode .emoji-option { background: #2a2a3e; }
        .emoji-option:hover { background: #fff9c4; transform: scale(1.2); }
        .dark-mode .emoji-option:hover { background: #4a4a5e; }
        
        .games-panel { display: none; background: #f5f5f5; border-radius: 14px; padding: 12px; border: 2px solid #e0e0e0; }
        .dark-mode .games-panel { background: #3a3a4e; border-color: #555; }
        .games-panel.show { display: block; }
        .game-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
        .game-btn { padding: 10px; background: linear-gradient(90deg, #FF6B9D 0%, #FFA06B 25%, #FFE66D 50%, #95E1D3 75%, #667eea 100%); color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 12px; transition: all 0.3s; }
        .game-btn:hover { transform: scale(1.05); }
        .game-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .rps-options { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
        .rps-btn { padding: 12px; background: white; border: 2px solid #e0e0e0; border-radius: 10px; cursor: pointer; font-size: 20px; transition: all 0.3s; font-weight: 700; }
        .dark-mode .rps-btn { background: #2a2a3e; border-color: #555; }
        .rps-btn:hover { border-color: #667eea; }
        .rps-btn.selected { border-color: #667eea; background: #f0f0ff; }
        .dark-mode .rps-btn.selected { background: #4a4a5e; }
        .canvas-container { border: 2px solid #e0e0e0; border-radius: 10px; overflow: hidden; background: white; margin-bottom: 8px; }
        .dark-mode .canvas-container { border-color: #555; background: #1a1a2e; }
        canvas { display: block; width: 100%; cursor: crosshair; }
        .canvas-controls { display: flex; gap: 8px; }
        .canvas-btn { flex: 1; padding: 8px; background: white; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 12px; transition: all 0.3s; }
        .dark-mode .canvas-btn { background: #3a3a4e; border-color: #555; color: white; }
        .canvas-btn:hover { border-color: #667eea; }
        .canvas-btn.send { background: linear-gradient(90deg, #FF6B9D 0%, #FFA06B 25%, #FFE66D 50%, #95E1D3 75%, #667eea 100%); color: white; border: none; }
        
        .input-container { display: flex; gap: 10px; align-items: center; }
        .input-field { flex: 1; padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 20px; font-size: 14px; font-family: inherit; font-weight: 500; transition: all 0.3s; height: 40px; min-width: 100px; }
        .dark-mode .input-field { background: #3a3a4e; border-color: #555; color: white; }
        .input-field:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
        .input-field::placeholder { color: #999; }
        .dark-mode .input-field::placeholder { color: #666; }
        
        .btn-emoji { border: none; padding: 8px 10px; border-radius: 12px; font-size: 16px; cursor: pointer; transition: all 0.3s; font-weight: 600; height: 40px; display: flex; align-items: center; background: white; border: 2px solid #ffc107; color: #333; }
        .dark-mode .btn-emoji { background: #3a3a4e; border-color: #666; color: white; }
        .btn-emoji:hover { background: #ffc107; }
        
        .btn-games { border: none; padding: 8px 10px; border-radius: 12px; font-size: 16px; cursor: pointer; transition: all 0.3s; font-weight: 600; height: 40px; display: flex; align-items: center; background: linear-gradient(90deg, #FF6B9D 0%, #FFA06B 25%, #FFE66D 50%, #95E1D3 75%, #667eea 100%); color: white; box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3); }
        .btn-games:hover { transform: scale(1.08); }
        
        .send-btn { background: linear-gradient(90deg, #FF6B9D 0%, #FFA06B 25%, #FFE66D 50%, #95E1D3 75%, #667eea 100%); color: white; border: none; padding: 8px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.3s; box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3); text-transform: uppercase; letter-spacing: 0.1px; white-space: nowrap; flex-shrink: 0; height: 40px; display: flex; align-items: center; min-width: 50px; justify-content: center; }
        .send-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4); }
        .send-btn:disabled { background: #ccc; box-shadow: none; cursor: not-allowed; }
        
        .empty { text-align: center; color: #999; padding: 40px 20px; font-size: 15px; font-weight: 500; }
        .dark-mode .empty { color: #666; }
        
        .rps-waiting { text-align: center; padding: 12px; background: #fff9e6; border-radius: 10px; color: #333; font-weight: 600; margin-bottom: 8px; }
        .dark-mode .rps-waiting { background: #3a3a4e; color: #aaa; }
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
            <button class="login-btn" onclick="login('nan')">🐱 Nan</button>
            <button class="login-btn" onclick="login('rishy')">😺 Rishy</button>
            <button class="login-btn" onclick="login('poppy')">😸 Poppy</button>
            <button class="login-btn" onclick="login('sienna')">😻 Sienna</button>
            <button class="login-btn" onclick="login('penelope')">😼 Penelope</button>
        </div>
    </div>

    <div class="container" id="app">
        <div class="header">
            <div class="header-title">💬 <span id="myname"></span></div>
            <div id="timeLock" style="display: none; background: rgba(255,0,0,0.3); padding: 6px 12px; border-radius: 10px; font-size: 11px; font-weight: 700; color: #fff;">⏰ Locked</div>
            <button class="dark-mode-btn" onclick="toggleDarkMode()" title="Dark Mode">🌙</button>
            <button class="logout-btn" onclick="logout()">Logout</button>
        </div>
        <div class="tabs" id="tabs"></div>
        <div class="chat-display" id="chat"><div class="empty">Loading...</div></div>
        
        <div class="input-area">
            <div id="emojiPicker" class="emoji-picker" style="display: none;"></div>
            <div id="gamesPanel" class="games-panel">
                <div class="game-buttons">
                    <button class="game-btn" onclick="playRPS()">🎮 Rock Paper</button>
                    <button class="game-btn" onclick="playDice()">🎲 Dice Roll</button>
                </div>
                <div id="rpsContainer" style="display: none;">
                    <div id="rpsStatus" class="rps-waiting">Waiting for other player...</div>
                    <div class="rps-options">
                        <button class="rps-btn" onclick="selectRPS('rock')">✊ Rock</button>
                        <button class="rps-btn" onclick="selectRPS('paper')">✋ Paper</button>
                        <button class="rps-btn" onclick="selectRPS('scissors')">✌️ Scissors</button>
                    </div>
                </div>
                <div id="diceContainer" style="display: none; text-align: center; padding: 12px;">
                    <div id="diceResult" style="font-size: 32px; margin-bottom: 10px;">🎲</div>
                    <button class="game-btn" onclick="sendDice()">Roll!</button>
                </div>
                <div id="drawContainer" style="display: none;">
                    <div class="canvas-container">
                        <canvas id="drawCanvas" width="300" height="150"></canvas>
                    </div>
                    <div class="canvas-controls">
                        <button class="canvas-btn" onclick="clearCanvas()">Clear</button>
                        <button class="canvas-btn send" onclick="sendDrawing()">Send</button>
                    </div>
                </div>
                <button class="game-btn" style="grid-column: 1/-1;" onclick="playDraw()">🎨 Draw</button>
            </div>
            <div class="input-container">
                <button class="btn-emoji" onclick="toggleEmoji()" title="Emoji">😀</button>
                <button class="btn-games" onclick="toggleGames()" title="Games">🎮</button>
                <input type="text" class="input-field" id="msg" placeholder="Type message..." disabled>
                <button class="send-btn" id="sendBtn" onclick="send()" disabled>Send</button>
            </div>
        </div>
    </div>

    <script>
        const EMOJIS = ['🌈','🌈','🌈','😀','😂','😍','🥰','😎','🤗','😊','🙂','🤓','🎉','🎊','🎈','🎁','🎂','🍰','🍕','🍔','🍟','☕','🍵','🧋','🥤','🍹','🍩','🍪','🐱','😺','😸','😻','😼','🐱','😺','😸','🐯','🦁','🐮','🐷','🦊','🐻','🐼','🐨','🐹','🐰','👍','👏','🙌','💪','🤝','💋','💕','💖','💗','💓','💞','💘','💝','⭐','✨','🌟','💫','🔥','⚡','🌈','🌈','🌈'];

        const USERS = {
            'esther': 'Esther', 'valley': 'Valley', 'amaaya': 'Amaaya', 'mama': 'Mama', 'mummy': 'Mummy',
            'hilary': 'Hilary', 'nan': 'Nan', 'rishy': 'Rishy', 'poppy': 'Poppy', 'sienna': 'Sienna', 'penelope': 'Penelope'
        };

        const AVATARS = {
            'esther': '🐱', 'valley': '😺', 'amaaya': '😸', 'mama': '😻', 'mummy': '😼',
            'hilary': '😽', 'nan': '🐱', 'rishy': '😺', 'poppy': '😸', 'sienna': '😻', 'penelope': '😼'
        };

        let currentUser = null, currentChat = 'group', allChats = [], messages = {}, ws = null, connected = false;
        let rpsChoice = null, rpsOtherChoice = null, rpsOtherUser = null;

        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        }

        function playNotificationSound() {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                if (ctx.state === 'suspended') ctx.resume();
                
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.setValueAtTime(1200, now);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                
                if (navigator.vibrate) navigator.vibrate(200);
            } catch (e) {}
        }

        function isAppLocked() {
            const now = new Date();
            const hour = now.getHours();
            return hour >= 21 || hour < 7;
        }

        function canViewChat(viewer, chatId) {
            if (['mama', 'mummy'].includes(viewer)) return true;
            if (chatId === 'group') {
                return ['esther', 'valley', 'amaaya', 'mama', 'mummy', 'hilary'].includes(viewer);
            }
            const [user1, user2] = chatId.split('-');
            return viewer === user1 || viewer === user2;
        }

        function updateTimeLock() {
            const locked = isAppLocked();
            const lockDiv = document.getElementById('timeLock');
            const msgInput = document.getElementById('msg');
            const sendBtn = document.getElementById('sendBtn');
            const emojiBtn = document.querySelector('.btn-emoji');
            const gamesBtn = document.querySelector('.btn-games');
            
            if (locked) {
                lockDiv.style.display = 'block';
                msgInput.disabled = true;
                sendBtn.disabled = true;
                emojiBtn.style.opacity = '0.5';
                emojiBtn.style.pointerEvents = 'none';
                gamesBtn.style.opacity = '0.5';
                gamesBtn.style.pointerEvents = 'none';
                msgInput.placeholder = 'Chat locked 9pm-7am';
            } else {
                lockDiv.style.display = 'none';
                msgInput.disabled = false;
                sendBtn.disabled = false;
                emojiBtn.style.opacity = '1';
                emojiBtn.style.pointerEvents = 'auto';
                gamesBtn.style.opacity = '1';
                gamesBtn.style.pointerEvents = 'auto';
                msgInput.placeholder = 'Type message...';
            }
        }

        function toggleEmoji() {
            const picker = document.getElementById('emojiPicker');
            const panel = document.getElementById('gamesPanel');
            panel.classList.remove('show');
            picker.style.display = picker.style.display === 'none' ? 'grid' : 'none';
        }

        function toggleGames() {
            const panel = document.getElementById('gamesPanel');
            const picker = document.getElementById('emojiPicker');
            picker.style.display = 'none';
            panel.classList.toggle('show');
        }

        function playRPS() {
            rpsChoice = null;
            rpsOtherChoice = null;
            rpsOtherUser = null;
            document.getElementById('rpsContainer').style.display = 'block';
            document.getElementById('diceContainer').style.display = 'none';
            document.getElementById('drawContainer').style.display = 'none';
            document.getElementById('rpsStatus').textContent = 'Waiting for other player...';
            document.querySelectorAll('.rps-btn').forEach(btn => btn.classList.remove('selected'));
        }

        function selectRPS(choice) {
            rpsChoice = choice;
            document.querySelectorAll('.rps-btn').forEach(btn => btn.classList.remove('selected'));
            event.target.closest('.rps-btn').classList.add('selected');
            
            if (connected) {
                ws.send(JSON.stringify({ type: 'rps_choice', user: currentUser, chatId: currentChat, choice: choice }));
            }
        }

        function playDice() {
            const result = Math.floor(Math.random() * 6) + 1;
            document.getElementById('diceResult').textContent = ['🥚','❶','❷','❸','❹','❺','❻'][result];
            document.getElementById('diceContainer').style.display = 'block';
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('drawContainer').style.display = 'none';
            window.diceResult = result;
        }

        function sendDice() {
            const result = window.diceResult || 1;
            const text = '🎲 ' + USERS[currentUser] + ' rolled ' + result + '!';
            if (connected) ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text }));
            document.getElementById('gamesPanel').classList.remove('show');
        }

        function playDraw() {
            document.getElementById('drawContainer').style.display = 'block';
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('diceContainer').style.display = 'none';
            setTimeout(initCanvas, 100);
        }

        function initCanvas() {
            const canvas = document.getElementById('drawCanvas');
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#667eea';
            
            let drawing = false;
            
            function startDrawing(e) {
                drawing = true;
                const rect = canvas.getBoundingClientRect();
                const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
                const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
                ctx.beginPath();
                ctx.moveTo(x, y);
            }
            
            function draw(e) {
                if (!drawing) return;
                e.preventDefault();
                const rect = canvas.getBoundingClientRect();
                const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
                const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
                ctx.lineTo(x, y);
                ctx.stroke();
            }
            
            function stopDrawing() {
                drawing = false;
                ctx.closePath();
            }
            
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseout', stopDrawing);
            
            canvas.addEventListener('touchstart', startDrawing);
            canvas.addEventListener('touchmove', draw);
            canvas.addEventListener('touchend', stopDrawing);
        }

        function clearCanvas() {
            const canvas = document.getElementById('drawCanvas');
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        function sendDrawing() {
            const canvas = document.getElementById('drawCanvas');
            const text = canvas.toDataURL();
            if (connected) ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text, isDrawing: true }));
            clearCanvas();
            document.getElementById('gamesPanel').classList.remove('show');
        }

        function addReaction(msgId, emoji) {
            if (connected) ws.send(JSON.stringify({ type: 'reaction', user: currentUser, msgId: msgId, emoji: emoji }));
        }

        function getAvailableChats(user) {
            const chats = [];
            const groupUsers = ['esther', 'valley', 'amaaya', 'mama', 'mummy', 'hilary'];
            
            if (groupUsers.includes(user) || ['mama', 'mummy'].includes(user)) {
                chats.push('group');
            }
            
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

        function login(user) {
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
            renderTabs();
            connect();
            updateTimeLock();
            setInterval(updateTimeLock, 60000);
            render();
            
            if (localStorage.getItem('darkMode') === 'true') {
                document.body.classList.add('dark-mode');
            }
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
                    Object.keys(messages).forEach(chat => {
                        localStorage.setItem('chat_' + chat, JSON.stringify(messages[chat]));
                    });
                    render();
                } else if (data.type === 'rps_choice') {
                    if (data.chatId === currentChat) {
                        rpsOtherChoice = data.choice;
                        rpsOtherUser = data.user;
                        document.getElementById('rpsStatus').textContent = USERS[data.user] + ' played ' + data.choice + '!';
                        if (rpsChoice) {
                            setTimeout(announceRPSResult, 500);
                        }
                    }
                } else if (data.type === 'message') {
                    const chatId = data.data.chatId;
                    if (!messages[chatId]) messages[chatId] = [];
                    messages[chatId].push(data.data);
                    localStorage.setItem('chat_' + chatId, JSON.stringify(messages[chatId]));
                    if (data.data.user !== currentUser) playNotificationSound();
                    if (chatId === currentChat) render();
                } else if (data.type === 'reaction') {
                    const msgId = data.msgId;
                    const msg = messages[currentChat]?.find(m => m.id === msgId);
                    if (msg) {
                        if (!msg.reactions) msg.reactions = [];
                        msg.reactions.push({ user: data.user, emoji: data.emoji });
                        localStorage.setItem('chat_' + currentChat, JSON.stringify(messages[currentChat]));
                        render();
                    }
                }
            };
            ws.onclose = () => { connected = false; setTimeout(connect, 3000); };
        }

        function announceRPSResult() {
            if (!rpsChoice || !rpsOtherChoice) return;
            
            const emojis = { 'rock': '✊', 'paper': '✋', 'scissors': '✌️' };
            const text = '🎮 ' + USERS[currentUser] + ' ' + emojis[rpsChoice] + ' vs ' + USERS[rpsOtherUser] + ' ' + emojis[rpsOtherChoice];
            if (connected) ws.send(JSON.stringify({ type: 'new_message', user: 'system', chatId: currentChat, text }));
            
            document.getElementById('gamesPanel').classList.remove('show');
            rpsChoice = null;
            rpsOtherChoice = null;
        }

        function renderTabs() {
            const div = document.getElementById('tabs');
            div.innerHTML = '';
            allChats.forEach(chatId => {
                if (!canViewChat(currentUser, chatId)) return;
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
            if (isAppLocked()) {
                alert('⏰ Chat is locked between 9pm-7am');
                return;
            }
            const inp = document.getElementById('msg');
            const text = inp.value.trim();
            if (!text || !connected) return;
            ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text }));
            
            const newMsg = {
                id: Date.now(),
                user: currentUser,
                text: text,
                chatId: currentChat,
                reactions: []
            };
            if (!messages[currentChat]) messages[currentChat] = [];
            messages[currentChat].push(newMsg);
            localStorage.setItem('chat_' + currentChat, JSON.stringify(messages[currentChat]));
            
            inp.value = '';
            render();
        }

        function render() {
            const div = document.getElementById('chat');
            div.innerHTML = '';
            const msgs = messages[currentChat] || [];
            if (msgs.length === 0) { div.innerHTML = '<div class="empty">No messages yet. Start chatting! 💬</div>'; return; }
            msgs.forEach(m => {
                const d = document.createElement('div');
                d.className = 'message ' + (m.user === currentUser ? 'own' : (m.user === 'system' ? 'system' : m.user));
                
                let content = '';
                if (m.isDrawing) {
                    content = '<div class="message-sender">' + USERS[m.user] + '</div><img src="' + m.text + '" style="max-width: 100%; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">';
                } else {
                    const sender = m.user === 'system' ? 'Game' : USERS[m.user];
                    const avatar = m.user === 'system' ? '' : '<div class="avatar">' + AVATARS[m.user] + '</div>';
                    content = '<div class="message-content">' + avatar + '<div><div class="message-sender">' + sender + '</div><div class="message-bubble">' + m.text + '</div><div class="message-reactions">';
                    
                    if (m.reactions && m.reactions.length > 0) {
                        const reactionCounts = {};
                        m.reactions.forEach(r => {
                            reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
                        });
                        Object.entries(reactionCounts).forEach(([emoji, count]) => {
                            content += '<span class="reaction" onclick="addReaction(' + m.id + ', \'' + emoji + '\')">' + emoji + ' ' + count + '</span>';
                        });
                    }
                    
                    content += '<span class="reaction" onclick="addReaction(' + m.id + ', \'❤️\')">❤️</span>';
                    content += '<span class="reaction" onclick="addReaction(' + m.id + ', \'😂\')">😂</span>';
                    content += '<span class="reaction" onclick="addReaction(' + m.id + ', \'👍\')">👍</span>';
                    content += '</div></div></div>';
                }
                
                d.innerHTML = content;
                div.appendChild(d);
            });
            div.scrollTop = div.scrollHeight;
        }

        document.getElementById('msg').addEventListener('keypress', (e) => { if (e.key === 'Enter') send(); });

        renderEmojiPicker();
        
        document.addEventListener('click', () => {
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }
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
  'esther-sienna': [],
  'esther-penelope': []
};

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'load_messages', messages }));

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      
      if (msg.type === 'rps_choice') {
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'rps_choice', user: msg.user, chatId: msg.chatId, choice: msg.choice }));
          }
        });
      } else if (msg.type === 'reaction') {
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'reaction', msgId: msg.msgId, user: msg.user, emoji: msg.emoji }));
          }
        });
      } else if (msg.type === 'new_message') {
        const newMsg = {
          id: Date.now(),
          user: msg.user,
          text: msg.text,
          chatId: msg.chatId,
          isDrawing: msg.isDrawing || false,
          reactions: []
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
