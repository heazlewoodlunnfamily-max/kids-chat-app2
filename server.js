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
        .logout-btn { background: rgba(255,255,255,0.25); border: none; color: white; padding: 6px 12px; border-radius: 10px; cursor: pointer; font-size: 11px; font-weight: 600; transition: opacity 0.15s; }
        .logout-btn:hover { background: rgba(255,255,255,0.35); }
        .dark-mode-btn { background: rgba(255,255,255,0.25); border: none; color: white; padding: 6px 12px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; transition: opacity 0.15s; }
        .dark-mode-btn:hover { background: rgba(255,255,255,0.35); }
        
        .tabs { display: flex; gap: 6px; padding: 10px; background: #f8f9fb; border-bottom: 2px solid #e8eaf6; overflow-x: auto; }
        .dark-mode .tabs { background: #1a1a2e; border-color: #444; }
        .tab { padding: 10px 14px; background: white; border: 2px solid #e0e0e0; border-radius: 18px; cursor: pointer; font-weight: 600; font-size: 12px; white-space: nowrap; transition: opacity 0.15s; color: #666; }
        .dark-mode .tab { background: #3a3a4e; border-color: #555; color: #aaa; }
        .tab:hover { background: #f5f5f5; }
        .dark-mode .tab:hover { background: #4a4a5e; }
        .tab.active { background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: white; border-color: #667eea; box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3); }
        
        .chat-display { flex: 1; overflow-y: auto; padding: 20px 16px; background: linear-gradient(135deg, #fff9f0 0%, #fef5e7 50%, #fff9f0 100%), radial-gradient(circle at 20% 80%, rgba(255, 107, 157, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(167, 230, 207, 0.05) 0%, transparent 50%); }
        .dark-mode .chat-display { background: #1a1a2e; }
        .message { margin-bottom: 12px; display: flex; flex-direction: column; animation: slideIn 0.1s ease-out; }
        @keyframes slideIn { from { opacity: 0; } to { opacity: 1; } }
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
        .reaction { background: rgba(255,255,255,0.3); padding: 2px 6px; border-radius: 12px; font-size: 12px; cursor: pointer; transition: transform 0.1s; }
        .reaction:hover { background: rgba(255,255,255,0.5); }
        
        .input-area { padding: 12px; background: white; border-top: 2px solid #e8eaf6; display: flex; flex-direction: column; gap: 8px; }
        .dark-mode .input-area { background: #2a2a3e; border-color: #444; }
        
        .emoji-picker { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; padding: 12px; background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%); border-radius: 14px; max-height: 200px; overflow-y: auto; border: 2px solid #ffc107; }
        .dark-mode .emoji-picker { background: #3a3a4e; border-color: #666; }
        .emoji-option { font-size: 24px; cursor: pointer; text-align: center; padding: 8px; border-radius: 10px; transition: transform 0.1s; user-select: none; background: white; border: 1px solid transparent; }
        .dark-mode .emoji-option { background: #2a2a3e; }
        .emoji-option:hover { background: #fff9c4; transform: scale(1.2); }
        .dark-mode .emoji-option:hover { background: #4a4a5e; }
        
        .games-panel { display: none; background: #f5f5f5; border-radius: 14px; padding: 12px; border: 2px solid #e0e0e0; }
        .dark-mode .games-panel { background: #3a3a4e; border-color: #555; }
        .games-panel.show { display: block; }
        .game-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
        .game-btn { padding: 16px 12px; background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 14px; transition: transform 0.15s; }
        .game-btn:hover { transform: scale(1.02); }
        .game-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .rps-options { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
        .rps-btn { padding: 12px; background: white; border: 2px solid #e0e0e0; border-radius: 10px; cursor: pointer; font-size: 20px; transition: opacity 0.15s; font-weight: 700; }
        .dark-mode .rps-btn { background: #2a2a3e; border-color: #555; }
        .rps-btn:hover { border-color: #667eea; }
        .rps-btn.selected { border-color: #667eea; background: #f0f0ff; }
        .dark-mode .rps-btn.selected { background: #4a4a5e; }
        .canvas-container { border: 2px solid #e0e0e0; border-radius: 10px; overflow: hidden; background: white; margin-bottom: 8px; }
        .dark-mode .canvas-container { border-color: #555; background: #1a1a2e; }
        canvas { display: block; width: 100%; cursor: crosshair; }
        .canvas-controls { display: flex; gap: 8px; }
        .canvas-btn { flex: 1; padding: 8px; background: white; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 12px; transition: opacity 0.15s; }
        .dark-mode .canvas-btn { background: #3a3a4e; border-color: #555; color: white; }
        .canvas-btn:hover { border-color: #667eea; }
        .canvas-btn.send { background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: white; border: none; }
        
        .input-container { display: flex; gap: 10px; align-items: center; }
        .input-field { flex: 1; padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 20px; font-size: 14px; font-family: inherit; font-weight: 500; transition: opacity 0.15s; height: 40px; min-width: 100px; }
        .dark-mode .input-field { background: #3a3a4e; border-color: #555; color: white; }
        .input-field:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
        .input-field::placeholder { color: #999; }
        .dark-mode .input-field::placeholder { color: #666; }
        
        .btn-emoji { border: none; padding: 8px 10px; border-radius: 12px; font-size: 16px; cursor: pointer; transition: opacity 0.15s; font-weight: 600; height: 40px; display: flex; align-items: center; background: white; border: 2px solid #ffc107; color: #333; }
        .dark-mode .btn-emoji { background: #3a3a4e; border-color: #666; color: white; }
        .btn-emoji:hover { background: #ffc107; }
        
        .btn-games { border: none; padding: 8px 10px; border-radius: 12px; font-size: 16px; cursor: pointer; transition: opacity 0.15s; font-weight: 600; height: 40px; display: flex; align-items: center; background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: white; box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3); }
        .btn-games:hover { transform: scale(1.08); }
        
        .send-btn { background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: white; border: none; padding: 8px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; cursor: pointer; transition: opacity 0.15s; box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3); text-transform: uppercase; letter-spacing: 0.1px; white-space: nowrap; flex-shrink: 0; height: 40px; display: flex; align-items: center; min-width: 50px; justify-content: center; }
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
            <button type="button" class="login-btn" onclick="try { window.login('esther'); } catch(e) { console.error(e); }">🐱 Esther</button>
            <button type="button" class="login-btn" onclick="try { window.login('valley'); } catch(e) { console.error(e); }">😺 Valley</button>
            <button type="button" class="login-btn" onclick="try { window.login('amaaya'); } catch(e) { console.error(e); }">😸 Amaaya</button>
            <button type="button" class="login-btn" onclick="try { window.login('mama'); } catch(e) { console.error(e); }">😻 Mama</button>
            <button type="button" class="login-btn" onclick="try { window.login('mummy'); } catch(e) { console.error(e); }">😼 Mummy</button>
            <button type="button" class="login-btn" onclick="try { window.login('hilary'); } catch(e) { console.error(e); }">😽 Hilary</button>
            <button type="button" class="login-btn" onclick="try { window.login('nan'); } catch(e) { console.error(e); }">🐱 Nan</button>
            <button type="button" class="login-btn" onclick="try { window.login('rishy'); } catch(e) { console.error(e); }">😺 Rishy</button>
            <button type="button" class="login-btn" onclick="try { window.login('poppy'); } catch(e) { console.error(e); }">😸 Poppy</button>
            <button type="button" class="login-btn" onclick="try { window.login('sienna'); } catch(e) { console.error(e); }">😻 Sienna</button>
            <button type="button" class="login-btn" onclick="try { window.login('penelope'); } catch(e) { console.error(e); }">😼 Penelope</button>
        </div>
    </div>

    <div class="container" id="app">
        <div class="header">
            <div class="header-title">💬 <span id="myname"></span></div>
            <div id="timeLock" style="display: none; background: rgba(255,0,0,0.3); padding: 6px 12px; border-radius: 10px; font-size: 11px; font-weight: 700; color: #fff;">⏰ Locked</div>
            <button class="dark-mode-btn" onclick="window.toggleDarkMode()" title="Dark Mode">🌙</button>
            <button class="logout-btn" onclick="window.logout()">Logout</button>
        </div>
        <div class="tabs" id="tabs"></div>
        <div class="chat-display" id="chat"><div class="empty">Loading...</div></div>
        
        <div class="input-area">
            <div id="emojiPicker" class="emoji-picker" style="display: none;"></div>
            <div id="gamesPanel" class="games-panel">
                <div class="game-buttons">
                    <button class="game-btn" onclick="window.playRPS()">🎮 Rock Paper</button>
                    <button class="game-btn" onclick="window.playDice()">🎲 Dice Roll</button>
                </div>
                <div id="rpsContainer" style="display: none;">
                    <div id="rpsStatus" class="rps-waiting">Waiting for other player...</div>
                    <div class="rps-options">
                        <button class="rps-btn" onclick="window.selectRPS('rock')">✊ Rock</button>
                        <button class="rps-btn" onclick="window.selectRPS('paper')">✋ Paper</button>
                        <button class="rps-btn" onclick="window.selectRPS('scissors')">✌️ Scissors</button>
                    </div>
                </div>
                <div id="diceContainer" style="display: none; text-align: center; padding: 12px;">
                    <div style="font-weight: 600; margin-bottom: 12px;">🎲 CLOSEST TO 6 WINS!</div>
                    <div id="diceResult" style="font-size: 48px; margin-bottom: 12px;">🎲</div>
                    <div id="diceScores" style="margin-bottom: 12px; font-size: 14px; color: #666;"></div>
                    <button class="game-btn" id="diceRollBtn" onclick="window.rollDice()" style="grid-column: 1/-1; margin: 0;">Roll Now!</button>
                    <div id="diceWinner" style="margin-top: 12px; font-weight: 700; font-size: 16px;"></div>
                </div>
                <div id="drawContainer" style="display: none;">
                    <div class="canvas-container">
                        <canvas id="drawCanvas" width="300" height="150"></canvas>
                    </div>
                    <div class="canvas-controls">
                        <button class="canvas-btn" onclick="window.clearCanvas()">Clear</button>
                        <button class="canvas-btn send" onclick="window.sendDrawing()">Send</button>
                    </div>
                </div>
                <div id="wordleContainer" style="display: none;">
                    <div id="wordleSetupPhase" style="text-align: center;">
                        <div style="margin-bottom: 12px; font-weight: 600;">Set a 5-letter word for others to guess!</div>
                        <input type="text" id="wordleSetWord" placeholder="Type 5-letter word..." maxlength="5" style="width: 100%; padding: 8px; border: 2px solid #667eea; border-radius: 8px; font-size: 14px; text-transform: uppercase; margin-bottom: 8px;">
                        <button class="game-btn" style="grid-column: 1/-1; margin: 0;" onclick="window.startWordle()">Set Word!</button>
                    </div>
                    <div id="wordleGamePhase" style="display: none;">
                        <div style="text-align: center; margin-bottom: 10px; font-weight: 600; color: #333;">Guess the 5-letter word! (Set by: <span id="wordleSetBy"></span>)</div>
                        <div id="wordleGuesses" style="display: grid; gap: 6px; margin-bottom: 10px;"></div>
                        <input type="text" id="wordleInput" placeholder="Type 5 letters..." maxlength="5" style="width: 100%; padding: 8px; border: 2px solid #667eea; border-radius: 8px; font-size: 14px; text-transform: uppercase; margin-bottom: 8px;">
                        <button class="game-btn" style="grid-column: 1/-1; margin: 0;" onclick="window.submitWordleGuess()">Guess!</button>
                        <div id="wordleResult" style="text-align: center; margin-top: 10px; font-weight: 700;"></div>
                    </div>
                </div>
                <div id="hangmanContainer" style="display: none;">
                    <div id="hangmanSetupPhase" style="text-align: center;">
                        <div style="margin-bottom: 12px; font-weight: 600;">Set a word for others to guess!</div>
                        <input type="text" id="hangmanSetWord" placeholder="Type a word..." style="width: 100%; padding: 8px; border: 2px solid #667eea; border-radius: 8px; font-size: 14px; text-transform: uppercase; margin-bottom: 8px;">
                        <button class="game-btn" style="grid-column: 1/-1; margin: 0;" onclick="window.startHangman()">Set Word!</button>
                    </div>
                    <div id="hangmanGamePhase" style="display: none;">
                        <div style="text-align: center; margin-bottom: 10px;">
                            <div id="hangmanDrawing" style="font-size: 48px; margin-bottom: 8px;">😊</div>
                            <div id="hangmanWord" style="font-size: 24px; letter-spacing: 8px; font-weight: 700; font-family: monospace;"></div>
                            <div id="hangmanGuesses" style="margin-top: 8px; font-size: 12px; color: #666;"></div>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-bottom: 8px;" id="hangmanLetterGrid"></div>
                        <div id="hangmanResult" style="text-align: center; font-weight: 700;"></div>
                    </div>
                </div>
                <div id="triviaContainer" style="display: none;">
                    <div id="triviaQuestion" style="font-weight: 600; margin-bottom: 12px; font-size: 14px;"></div>
                    <div id="triviaAnswers" style="display: grid; gap: 8px;"></div>
                    <div id="triviaResult" style="text-align: center; margin-top: 10px; font-weight: 700;"></div>
                    <div id="triviaScore" style="text-align: center; margin-top: 8px; font-size: 12px; color: #666;"></div>
                </div>
                <div class="game-buttons" style="margin-bottom: 12px;">
                    <button class="game-btn" onclick="window.playWordle()">🎮 Wordle</button>
                    <button class="game-btn" onclick="window.playHangman()">🎯 Hangman</button>
                    <button class="game-btn" onclick="window.playTrivia()">🧠 Trivia</button>
                </div>
                <button class="game-btn" style="grid-column: 1/-1;" onclick="window.playDraw()">🎨 Draw</button>
            </div>
            <div class="input-container">
                <button class="btn-emoji" onclick="window.toggleEmoji()" title="Emoji">😀</button>
                <button class="btn-games" onclick="window.toggleGames()" title="Games">🎮</button>
                <input type="text" class="input-field" id="msg" placeholder="Type message..." disabled>
                <button class="send-btn" id="sendBtn" onclick="window.send()" disabled>Send</button>
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
        let rpsChoice = null, rpsOtherChoice = null, rpsOtherUser = null, rpsTimer = null, rpsTimeLeft = 0;
        let diceRolls = {}, diceGameActive = false;
        let hangmanGameActive = false, hangmanSetByUser = '', hangmanWordLength = 0, hangmanOtherGuessed = [], hangmanOtherWrong = 0;

        // WORDLE GAME STATE
        const WORDLE_WORDS = ['HAPPY', 'SMILE', 'DANCE', 'PIZZA', 'BEACH', 'MUSIC', 'DREAM', 'MAGIC', 'SUNNY', 'HEART', 'FRIEND', 'LAUGH', 'PARTY', 'CANDY', 'KITTY', 'PUPPY', 'FLOWER', 'RAINBOW'];
        let wordleWord = '', wordleGuesses = [], wordleGameOver = false, wordleSetBy = '';

        // HANGMAN GAME STATE
        const HANGMAN_WORDS = ['RAINBOW', 'BUTTERFLY', 'ELEPHANT', 'ADVENTURE', 'CHOCOLATE', 'DINOSAUR', 'PIRATE', 'DRAGON', 'TREASURE', 'CASTLE', 'WIZARD', 'UNICORN', 'ROCKET', 'ASTRONAUT', 'WHALE', 'PENGUIN', 'SKATEBOARD', 'ADVENTURE'];
        const HANGMAN_STAGES = ['😊', '😐', '😕', '😟', '😢', '😭', '💀'];
        let hangmanWord = '', hangmanGuessed = [], hangmanWrong = 0, hangmanGameOver = false, hangmanSetBy = '';

        // TRIVIA GAME STATE
        const TRIVIA_QUESTIONS = [
            { q: 'What is the capital of Australia?', a: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correct: 2 },
            { q: 'Which ocean is the largest?', a: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correct: 3 },
            { q: 'What is the tallest mountain in the world?', a: ['Kilimanjaro', 'Mount Everest', 'Denali', 'Mont Blanc'], correct: 1 },
            { q: 'Which country has the most islands?', a: ['Indonesia', 'Philippines', 'Sweden', 'Norway'], correct: 0 },
            { q: 'What is the only mammal that lays eggs?', a: ['Platypus', 'Koala', 'Emu', 'Echidna'], correct: 0 },
            { q: 'What is the deepest ocean trench?', a: ['Mariana Trench', 'Tonga Trench', 'Philippine Trench', 'Kuril Trench'], correct: 0 },
            { q: 'Which animal is the fastest land runner?', a: ['Lion', 'Gazelle', 'Cheetah', 'Pronghorn'], correct: 2 },
            { q: 'What is the largest animal ever to exist?', a: ['African Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'], correct: 1 },
            { q: 'Which country is home to the Great Barrier Reef?', a: ['Fiji', 'Australia', 'Philippines', 'Thailand'], correct: 1 },
            { q: 'What is the only continent without active volcanoes?', a: ['South America', 'Africa', 'Australia', 'Europe'], correct: 2 },
            { q: 'How many species of penguin exist?', a: ['12', '17', '22', '28'], correct: 1 },
            { q: 'What is the capital of Brazil?', a: ['Rio de Janeiro', 'Brasília', 'Salvador', 'São Paulo'], correct: 1 },
            { q: 'Which ocean borders 4 continents?', a: ['Pacific', 'Atlantic', 'Indian', 'Arctic'], correct: 2 },
            { q: 'What is the smallest country in the world?', a: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'], correct: 1 },
            { q: 'Which animal can hold its breath the longest?', a: ['Dolphin', 'Sea Turtle', 'Sperm Whale', 'Manatee'], correct: 2 },
            { q: 'What is the driest place on Earth?', a: ['Sahara', 'Atacama Desert', 'Gobi Desert', 'Antarctic Dry Valleys'], correct: 3 },
            { q: 'How many legs does an octopus have?', a: ['6', '8', '10', '12'], correct: 1 },
            { q: 'Which country has the most time zones?', a: ['Russia', 'France', 'USA', 'China'], correct: 1 },
            { q: 'What is the Amazon rainforest often called?', a: ['The World\'s Heart', 'The Planet\'s Lungs', 'The Green Gold', 'The Earth\'s Crown'], correct: 1 },
            { q: 'Which animal is the fastest swimmer?', a: ['Dolphin', 'Sailfish', 'Tuna', 'Marlin'], correct: 1 },
            { q: 'What is the capital of Egypt?', a: ['Alexandria', 'Cairo', 'Giza', 'Luxor'], correct: 1 },
            { q: 'Which bird cannot fly?', a: ['Ostrich', 'Chicken', 'Penguin', 'Kiwi'], correct: 0 },
            { q: 'What is the longest river in the world?', a: ['Amazon', 'Congo', 'Nile', 'Yangtze'], correct: 2 },
            { q: 'Which country is the largest by area?', a: ['Canada', 'USA', 'Russia', 'China'], correct: 2 },
            { q: 'What is the capital of Japan?', a: ['Osaka', 'Kyoto', 'Tokyo', 'Yokohama'], correct: 2 },
            { q: 'How many strings does a violin have?', a: ['4', '5', '6', '8'], correct: 0 },
            { q: 'Which animal has the longest neck?', a: ['Ostrich', 'Llama', 'Giraffe', 'Alpaca'], correct: 2 },
            { q: 'What is the capital of Canada?', a: ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'], correct: 2 },
            { q: 'Which country is known as the Land Down Under?', a: ['New Zealand', 'Australia', 'Fiji', 'Samoa'], correct: 1 },
            { q: 'What is the hottest planet in our solar system?', a: ['Mars', 'Mercury', 'Venus', 'Jupiter'], correct: 2 }
        ];
        let triviaScore = 0, triviaTotal = 0, triviaCurrentQ = null, triviaAnswered = false;

        window.playWordle = function() {
            document.getElementById('wordleContainer').style.display = 'block';
            document.getElementById('hangmanContainer').style.display = 'none';
            document.getElementById('triviaContainer').style.display = 'none';
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('diceContainer').style.display = 'none';
            document.getElementById('drawContainer').style.display = 'none';
            document.getElementById('wordleSetupPhase').style.display = 'block';
            document.getElementById('wordleGamePhase').style.display = 'none';
            document.getElementById('wordleSetWord').value = '';
        };

        window.startWordle = function() {
            const input = document.getElementById('wordleSetWord').value.toUpperCase().trim();
            if (input.length !== 5 || !/^[A-Z]+$/.test(input)) {
                alert('Please enter exactly 5 letters!');
                return;
            }
            wordleWord = input;
            wordleGuesses = [];
            wordleGameOver = false;
            wordleSetBy = USERS[currentUser];
            document.getElementById('wordleSetupPhase').style.display = 'none';
            document.getElementById('wordleGamePhase').style.display = 'block';
            document.getElementById('wordleSetBy').textContent = wordleSetBy;
            document.getElementById('wordleInput').value = '';
            document.getElementById('wordleResult').textContent = '';
            window.renderWordleBoard();
            const text = '🎮 ' + USERS[currentUser] + ' started a Wordle game! Everyone guess the 5-letter word!';
            if (connected) ws.send(JSON.stringify({ type: 'new_message', user: 'system', chatId: currentChat, text }));
        };

        window.submitWordleGuess = function() {
            const input = document.getElementById('wordleInput').value.toUpperCase().trim();
            if (!wordleGameOver && input.length === 5) {
                wordleGuesses.push(input);
                document.getElementById('wordleInput').value = '';
                window.renderWordleBoard();
            }
        };

        window.renderWordleBoard = function() {
            const div = document.getElementById('wordleGuesses');
            div.innerHTML = '';
            wordleGuesses.forEach((guess, idx) => {
                let row = '<div style="display: flex; gap: 4px; justify-content: center;">';
                for (let i = 0; i < 5; i++) {
                    const letter = guess[i];
                    let color = '#ccc';
                    if (letter === wordleWord[i]) color = '#4CAF50';
                    else if (wordleWord.includes(letter)) color = '#FFC107';
                    row += '<div style="width: 32px; height: 32px; background: ' + color + '; color: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 700;">' + letter + '</div>';
                }
                row += '</div>';
                div.innerHTML += row;
            });

            if (wordleGuesses[wordleGuesses.length - 1] === wordleWord) {
                wordleGameOver = true;
                document.getElementById('wordleResult').textContent = '🎉 YOU WIN! Word: ' + wordleWord;
                const text = '🎮 ' + USERS[currentUser] + ' won Wordle! 🎉 Word: ' + wordleWord;
                if (connected) ws.send(JSON.stringify({ type: 'new_message', user: 'system', chatId: currentChat, text }));
                document.getElementById('gamesPanel').classList.remove('show');
            } else if (wordleGuesses.length >= 6) {
                wordleGameOver = true;
                document.getElementById('wordleResult').textContent = '😢 GAME OVER! Word: ' + wordleWord;
                const text = '🎮 ' + USERS[currentUser] + ' tried Wordle! Word was: ' + wordleWord;
                if (connected) ws.send(JSON.stringify({ type: 'new_message', user: 'system', chatId: currentChat, text }));
                document.getElementById('gamesPanel').classList.remove('show');
            }
        };

        window.playHangman = function() {
            document.getElementById('hangmanContainer').style.display = 'block';
            document.getElementById('wordleContainer').style.display = 'none';
            document.getElementById('triviaContainer').style.display = 'none';
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('diceContainer').style.display = 'none';
            document.getElementById('drawContainer').style.display = 'none';
            document.getElementById('hangmanSetupPhase').style.display = 'block';
            document.getElementById('hangmanGamePhase').style.display = 'none';
            document.getElementById('hangmanSetWord').value = '';
        };

        window.startHangman = function() {
            const input = document.getElementById('hangmanSetWord').value.toUpperCase().trim();
            if (input.length < 3 || !/^[A-Z]+$/.test(input)) {
                alert('Please enter at least 3 letters!');
                return;
            }
            hangmanWord = input;
            hangmanGuessed = [];
            hangmanWrong = 0;
            hangmanGameOver = false;
            hangmanSetBy = USERS[currentUser];
            document.getElementById('hangmanSetupPhase').style.display = 'none';
            document.getElementById('hangmanGamePhase').style.display = 'block';
            window.renderHangmanLetters();
            window.renderHangman();
            const text = '🎮 ' + USERS[currentUser] + ' started a Hangman game! Everyone guess the word!';
            if (connected) {
                ws.send(JSON.stringify({ type: 'new_message', user: 'system', chatId: currentChat, text }));
                ws.send(JSON.stringify({ type: 'hangman_start', user: currentUser, chatId: currentChat, wordLength: hangmanWord.length }));
            }
        };

        window.renderHangmanLetters = function() {
            const grid = document.getElementById('hangmanLetterGrid');
            grid.innerHTML = '';
            for (let i = 65; i <= 90; i++) {
                const letter = String.fromCharCode(i);
                const btn = document.createElement('button');
                btn.className = 'rps-btn';
                btn.style.padding = '6px';
                btn.style.fontSize = '14px';
                btn.textContent = letter;
                btn.onclick = () => window.guessHangmanLetter(letter);
                grid.appendChild(btn);
            }
        };

        window.guessHangmanLetter = function(letter) {
            if (hangmanGameOver || hangmanGuessed.includes(letter)) return;
            hangmanGuessed.push(letter);
            if (!hangmanWord.includes(letter)) hangmanWrong++;
            if (connected) {
                ws.send(JSON.stringify({ type: 'hangman_guess', user: currentUser, chatId: currentChat, letter: letter, isCorrect: hangmanWord.includes(letter) }));
            }
            window.renderHangman();
        };

        window.renderHangman = function() {
            const word = hangmanWord.split('').map(l => hangmanGuessed.includes(l) ? l : '_').join(' ');
            document.getElementById('hangmanWord').textContent = word;
            document.getElementById('hangmanDrawing').textContent = HANGMAN_STAGES[hangmanWrong];
            document.getElementById('hangmanGuesses').textContent = 'Wrong: ' + hangmanWrong + '/6 | Guessed: ' + hangmanGuessed.join(', ');

            document.querySelectorAll('#hangmanContainer .rps-btn').forEach(btn => {
                if (hangmanGuessed.includes(btn.textContent)) {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                }
            });

            const won = hangmanWord.split('').every(l => hangmanGuessed.includes(l));
            if (won) {
                hangmanGameOver = true;
                document.getElementById('hangmanResult').textContent = '🎉 YOU WIN!';
                const text = '🎮 ' + USERS[currentUser] + ' won Hangman! Word: ' + hangmanWord;
                if (connected) ws.send(JSON.stringify({ type: 'new_message', user: 'system', chatId: currentChat, text }));
                document.getElementById('gamesPanel').classList.remove('show');
            } else if (hangmanWrong >= 6) {
                hangmanGameOver = true;
                document.getElementById('hangmanResult').textContent = '😢 GAME OVER! Word: ' + hangmanWord;
                const text = '🎮 ' + USERS[currentUser] + ' tried Hangman! Word: ' + hangmanWord;
                if (connected) ws.send(JSON.stringify({ type: 'new_message', user: 'system', chatId: currentChat, text }));
                document.getElementById('gamesPanel').classList.remove('show');
            }
        };

        window.playTrivia = function() {
            triviaScore = 0;
            triviaTotal = 0;
            triviaAnswered = false;
            document.getElementById('triviaContainer').style.display = 'block';
            document.getElementById('wordleContainer').style.display = 'none';
            document.getElementById('hangmanContainer').style.display = 'none';
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('diceContainer').style.display = 'none';
            document.getElementById('drawContainer').style.display = 'none';
            window.nextTriviaQuestion();
        };

        window.nextTriviaQuestion = function() {
            if (triviaTotal >= 10) {
                document.getElementById('triviaQuestion').textContent = '🎉 Quiz Complete!';
                document.getElementById('triviaAnswers').innerHTML = '';
                document.getElementById('triviaResult').textContent = '';
                document.getElementById('triviaScore').textContent = 'Score: ' + triviaScore + '/10';
                const text = '🎮 ' + USERS[currentUser] + ' scored ' + triviaScore + '/10 on Trivia!';
                if (connected) ws.send(JSON.stringify({ type: 'new_message', user: 'system', chatId: currentChat, text }));
                setTimeout(() => document.getElementById('gamesPanel').classList.remove('show'), 2000);
                return;
            }
            triviaCurrentQ = TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)];
            triviaAnswered = false;
            document.getElementById('triviaQuestion').textContent = triviaCurrentQ.q;
            const answers = document.getElementById('triviaAnswers');
            answers.innerHTML = '';
            triviaCurrentQ.a.forEach((ans, idx) => {
                const btn = document.createElement('button');
                btn.className = 'game-btn';
                btn.style.margin = '0';
                btn.style.paddingRight = '16px';
                btn.style.paddingLeft = '16px';
                btn.textContent = ans;
                btn.onclick = () => window.submitTriviaAnswer(idx);
                answers.appendChild(btn);
            });
            document.getElementById('triviaResult').textContent = '';
            document.getElementById('triviaScore').textContent = 'Question ' + (triviaTotal + 1) + '/10';
        };

        window.submitTriviaAnswer = function(idx) {
            if (triviaAnswered) return;
            triviaAnswered = true;
            triviaTotal++;
            if (idx === triviaCurrentQ.correct) {
                triviaScore++;
                document.getElementById('triviaResult').textContent = '✅ Correct!';
            } else {
                document.getElementById('triviaResult').textContent = '❌ Wrong! Answer: ' + triviaCurrentQ.a[triviaCurrentQ.correct];
            }
            setTimeout(window.nextTriviaQuestion, 1500);
        };

        window.toggleDarkMode = function() {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        };

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

        window.toggleEmoji = function() {
            const picker = document.getElementById('emojiPicker');
            const panel = document.getElementById('gamesPanel');
            panel.classList.remove('show');
            picker.style.display = picker.style.display === 'none' ? 'grid' : 'none';
        };

        window.toggleGames = function() {
            const panel = document.getElementById('gamesPanel');
            const picker = document.getElementById('emojiPicker');
            picker.style.display = 'none';
            panel.classList.toggle('show');
        };

        window.playRPS = function() {
            rpsChoice = null;
            rpsOtherChoice = null;
            rpsOtherUser = null;
            document.getElementById('rpsContainer').style.display = 'block';
            document.getElementById('diceContainer').style.display = 'none';
            document.getElementById('drawContainer').style.display = 'none';
            document.getElementById('wordleContainer').style.display = 'none';
            document.getElementById('hangmanContainer').style.display = 'none';
            document.getElementById('triviaContainer').style.display = 'none';
            document.getElementById('rpsStatus').textContent = '⏱️ 10 seconds to choose!';
            document.querySelectorAll('#rpsContainer .rps-btn').forEach(btn => {
                btn.classList.remove('selected');
                btn.disabled = false;
            });
            
            rpsTimeLeft = 10;
            if (rpsTimer) clearInterval(rpsTimer);
            rpsTimer = setInterval(() => {
                rpsTimeLeft--;
                document.getElementById('rpsStatus').textContent = '⏱️ ' + rpsTimeLeft + ' seconds to choose!';
                
                if (rpsTimeLeft <= 0) {
                    clearInterval(rpsTimer);
                    document.querySelectorAll('#rpsContainer .rps-btn').forEach(btn => btn.disabled = true);
                    
                    if (rpsChoice) {
                        document.getElementById('rpsStatus').textContent = '⏳ Revealing choices...';
                        setTimeout(window.announceRPSResult, 1000);
                    } else {
                        document.getElementById('rpsStatus').textContent = '⏰ TIME UP! You did not choose!';
                        setTimeout(() => {
                            document.getElementById('gamesPanel').classList.remove('show');
                        }, 2000);
                    }
                }
            }, 1000);
            
            const text = '🎮 ' + USERS[currentUser] + ' started Rock Paper Scissors! Everyone choose in 10 seconds!';
            if (connected) ws.send(JSON.stringify({ type: 'new_message', user: 'system', chatId: currentChat, text }));
        };

        window.selectRPS = function(choice) {
            if (rpsChoice) return;
            rpsChoice = choice;
            document.querySelectorAll('#rpsContainer .rps-btn').forEach(btn => btn.disabled = true);
            
            const emojis = { 'rock': '✊', 'paper': '✋', 'scissors': '✌️' };
            document.getElementById('rpsStatus').textContent = '✅ You chose ' + emojis[choice] + '! Waiting for countdown to finish...';
            
            if (connected) {
                ws.send(JSON.stringify({ type: 'rps_choice', user: currentUser, chatId: currentChat, choice: choice }));
            }
        };

        window.playDice = function() {
            diceRolls = {};
            diceGameActive = true;
            document.getElementById('diceContainer').style.display = 'block';
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('drawContainer').style.display = 'none';
            document.getElementById('wordleContainer').style.display = 'none';
            document.getElementById('hangmanContainer').style.display = 'none';
            document.getElementById('triviaContainer').style.display = 'none';
            document.getElementById('diceResult').textContent = '🎲';
            document.getElementById('diceScores').textContent = 'Waiting for rolls...';
            document.getElementById('diceWinner').textContent = '';
            document.getElementById('diceRollBtn').disabled = false;
            document.getElementById('diceRollBtn').textContent = 'Roll Now!';
            
            const text = '🎲 ' + USERS[currentUser] + ' started a Dice Game! Closest to 6 wins! Everyone roll!';
            if (connected) ws.send(JSON.stringify({ type: 'new_message', user: 'system', chatId: currentChat, text }));
        };

        window.rollDice = function() {
            const result = Math.floor(Math.random() * 6) + 1;
            const diceEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];
            
            diceRolls[currentUser] = result;
            document.getElementById('diceResult').textContent = diceEmojis[result - 1];
            document.getElementById('diceRollBtn').disabled = true;
            document.getElementById('diceRollBtn').textContent = '✅ Rolled ' + result + '!';
            
            if (connected) {
                ws.send(JSON.stringify({ 
                    type: 'dice_roll', 
                    user: currentUser, 
                    chatId: currentChat, 
                    result: result 
                }));
            }
            
            window.updateDiceScores();
            
            setTimeout(() => {
                if (Object.keys(diceRolls).length > 1) {
                    window.determineDiceWinner();
                }
            }, 3000);
        };

        window.updateDiceScores = function() {
            let scores = '';
            Object.entries(diceRolls).forEach(([user, roll]) => {
                scores += USERS[user] + ': ' + roll + '  ';
            });
            document.getElementById('diceScores').textContent = scores || 'Waiting for rolls...';
        };

        window.determineDiceWinner = function() {
            if (Object.keys(diceRolls).length === 0) return;
            
            let winner = null;
            let minDiff = 6;
            let winningRoll = 0;
            
            Object.entries(diceRolls).forEach(([user, roll]) => {
                const diff = Math.abs(6 - roll);
                if (diff < minDiff) {
                    minDiff = diff;
                    winner = user;
                    winningRoll = roll;
                }
            });
            
            const diceEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];
            let resultText = '🏆 ' + USERS[winner] + ' WINS with ' + diceEmojis[winningRoll - 1] + ' (closest to 6!)';
            
            document.getElementById('diceWinner').textContent = resultText;
            
            const text = '🎲 ' + resultText + ' | Rolls: ' + Object.entries(diceRolls).map(([u, r]) => USERS[u] + ' rolled ' + r).join(', ');
            if (connected) ws.send(JSON.stringify({ type: 'new_message', user: 'system', chatId: currentChat, text }));
            
            diceGameActive = false;
            setTimeout(() => document.getElementById('gamesPanel').classList.remove('show'), 2000);
        };

        window.playDraw = function() {
            document.getElementById('drawContainer').style.display = 'block';
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('diceContainer').style.display = 'none';
            setTimeout(window.initCanvas, 100);
        };

        window.initCanvas = function() {
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
            let lastX = 0;
            let lastY = 0;
            
            function startDrawing(e) {
                drawing = true;
                const rect = canvas.getBoundingClientRect();
                lastX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
                lastY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
            }
            
            function draw(e) {
                if (!drawing) return;
                e.preventDefault();
                const rect = canvas.getBoundingClientRect();
                const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
                const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
                
                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(x, y);
                ctx.stroke();
                
                lastX = x;
                lastY = y;
            }
            
            function stopDrawing() {
                drawing = false;
            }
            
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseout', stopDrawing);
            
            canvas.addEventListener('touchstart', startDrawing, false);
            canvas.addEventListener('touchmove', draw, false);
            canvas.addEventListener('touchend', stopDrawing, false);
        };

        window.clearCanvas = function() {
            const canvas = document.getElementById('drawCanvas');
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

        window.sendDrawing = function() {
            const canvas = document.getElementById('drawCanvas');
            const text = canvas.toDataURL();
            if (connected) ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text, isDrawing: true }));
            window.clearCanvas();
            document.getElementById('gamesPanel').classList.remove('show');
        };

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

        window.login = function(user) {
            if (!user) {
                return;
            }
            
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
            updateTimeLock();
            setInterval(updateTimeLock, 60000);
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
                } else if (data.type === 'rps_choice') {
                    if (data.chatId === currentChat) {
                        rpsOtherChoice = data.choice;
                        rpsOtherUser = data.user;
                        document.getElementById('rpsStatus').textContent = USERS[data.user] + ' played ' + data.choice + '!';
                        if (rpsChoice) {
                            setTimeout(window.announceRPSResult, 500);
                        }
                    }
                } else if (data.type === 'hangman_start') {
                    if (data.chatId === currentChat && data.user !== currentUser) {
                        hangmanGameActive = true;
                        hangmanSetByUser = data.user;
                        hangmanWordLength = data.wordLength;
                        hangmanOtherGuessed = [];
                        hangmanOtherWrong = 0;
                        document.getElementById('hangmanSetupPhase').style.display = 'none';
                        document.getElementById('hangmanGamePhase').style.display = 'block';
                        window.renderHangmanLetters();
                    }
                } else if (data.type === 'hangman_guess') {
                    if (data.chatId === currentChat && hangmanGameActive) {
                        if (!hangmanOtherGuessed.includes(data.letter)) {
                            hangmanOtherGuessed.push(data.letter);
                            if (!data.isCorrect) hangmanOtherWrong++;
                        }
                    }
                } else if (data.type === 'dice_roll') {
                    if (data.chatId === currentChat && diceGameActive) {
                        diceRolls[data.user] = data.result;
                        window.updateDiceScores();
                        playNotificationSound();
                    }
                } else if (data.type === 'message') {
                    const chatId = data.data.chatId;
                    if (!messages[chatId]) messages[chatId] = [];
                    messages[chatId].push(data.data);
                    localStorage.setItem('chat_' + chatId, JSON.stringify(messages[chatId]));
                    if (data.data.user !== currentUser) playNotificationSound();
                    if (chatId === currentChat) window.render();
                } else if (data.type === 'reaction') {
                    const msgId = data.msgId;
                    const msg = messages[currentChat]?.find(m => m.id === msgId);
                    if (msg) {
                        if (!msg.reactions) msg.reactions = [];
                        msg.reactions.push({ user: data.user, emoji: data.emoji });
                        localStorage.setItem('chat_' + currentChat, JSON.stringify(messages[currentChat]));
                        window.render();
                    }
                }
            };
            
            ws.onerror = (error) => {
            };
            
            ws.onclose = () => {
                connected = false;
                setTimeout(window.connect, 3000);
            };
        };

        window.announceRPSResult = function() {
            if (!rpsChoice) {
                document.getElementById('rpsStatus').textContent = '❌ No choice made!';
                setTimeout(() => document.getElementById('gamesPanel').classList.remove('show'), 1500);
                return;
            }
            
            clearInterval(rpsTimer);
            const emojis = { 'rock': '✊', 'paper': '✋', 'scissors': '✌️' };
            
            const text = '🎮 ' + USERS[currentUser] + ' ' + emojis[rpsChoice] + ' - RESULT REVEALED!';
            if (connected) ws.send(JSON.stringify({ type: 'new_message', user: 'system', chatId: currentChat, text }));
            
            document.getElementById('rpsStatus').textContent = '🎉 You chose ' + emojis[rpsChoice] + '!';
            document.getElementById('gamesPanel').classList.remove('show');
            
            rpsChoice = null;
            rpsOtherChoice = null;
        };

        window.renderTabs = function() {
            const div = document.getElementById('tabs');
            if (!div) {
                return;
            }
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

        window.send = function() {
            if (isAppLocked()) {
                alert('⏰ Chat is locked between 9pm-7am');
                return;
            }
            const inp = document.getElementById('msg');
            const text = inp.value.trim();
            if (!text || !connected) return;
            ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text }));
            
            inp.value = '';
        };

        window.render = function() {
            const div = document.getElementById('chat');
            if (!div) {
                return;
            }
            div.innerHTML = '';
            const msgs = messages[currentChat] || [];
            if (msgs.length === 0) { div.innerHTML = '<div class="empty">No messages yet. Start chatting! 💬</div>'; return; }
            msgs.forEach(m => {
                const d = document.createElement('div');
                d.className = 'message ' + (m.user === currentUser ? 'own' : (m.user === 'system' ? 'system' : m.user));
                
                let content = '';
                if (m.isDrawing) {
                    const avatar = '<div class="avatar">' + AVATARS[m.user] + '</div>';
                    content = '<div class="message-content">' + avatar + '<div><div class="message-sender">' + USERS[m.user] + '</div><img src="' + m.text + '" style="max-width: 100%; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"></div></div>';
                } else {
                    const sender = m.user === 'system' ? 'Game' : USERS[m.user];
                    const avatar = m.user === 'system' ? '' : '<div class="avatar">' + AVATARS[m.user] + '</div>';
                    content = '<div class="message-content">' + avatar + '<div><div class="message-sender">' + sender + '</div><div class="message-bubble">' + m.text + '</div>';
                    
                    if (m.reactions && m.reactions.length > 0) {
                        const reactionCounts = {};
                        m.reactions.forEach(r => {
                            reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
                        });
                        content += '<div class="message-reactions">';
                        Object.entries(reactionCounts).forEach(([emoji, count]) => {
                            content += '<span class="reaction">' + emoji + ' ' + count + '</span>';
                        });
                        content += '</div>';
                    }
                    
                    content += '</div></div></div>';
                }
                
                d.innerHTML = content;
                div.appendChild(d);
            });
            div.scrollTop = div.scrollHeight;
        };

        window.renderEmojiPicker();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                document.getElementById('msg').addEventListener('keypress', (e) => { if (e.key === 'Enter') window.send(); });
                
                document.addEventListener('click', () => {
                    if ('Notification' in window && Notification.permission === 'default') {
                        Notification.requestPermission();
                    }
                }, { once: true });
                
                const savedUser = localStorage.getItem('user');
                if (savedUser) window.login(savedUser);
            });
        } else {
            document.getElementById('msg').addEventListener('keypress', (e) => { if (e.key === 'Enter') window.send(); });
            
            document.addEventListener('click', () => {
                if ('Notification' in window && Notification.permission === 'default') {
                    Notification.requestPermission();
                }
            }, { once: true });
            
            const savedUser = localStorage.getItem('user');
            if (savedUser) window.login(savedUser);
        }
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
      } else if (msg.type === 'hangman_start') {
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'hangman_start', user: msg.user, chatId: msg.chatId, wordLength: msg.wordLength }));
          }
        });
      } else if (msg.type === 'hangman_guess') {
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'hangman_guess', user: msg.user, chatId: msg.chatId, letter: msg.letter, isCorrect: msg.isCorrect }));
          }
        });
      } else if (msg.type === 'dice_roll') {
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'dice_roll', user: msg.user, chatId: msg.chatId, result: msg.result }));
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
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
});
