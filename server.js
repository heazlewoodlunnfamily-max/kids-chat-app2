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
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>💬 Chat Games</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; overflow: hidden; -webkit-user-select: none; user-select: none; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #FFC4DB 0%, #FFE5B4 16%, #FFFFCC 32%, #D4F1ED 48%, #C9D9F4 64%, #E0D4F7 80%, #FFC4DB 100%); display: flex; justify-content: center; align-items: center; padding: 0; }
        body.dark-mode { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); }
        .login-screen { width: 100%; height: 100vh; background: white; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; text-align: center; }
        .dark-mode .login-screen { background: #2a2a3e; color: white; }
        .login-screen h1 { font-size: 36px; margin-bottom: 8px; color: #9C27B0; font-weight: 800; }
        .login-screen p { font-size: 14px; color: #9C27B0; margin-bottom: 25px; font-weight: 600; }
        .login-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; max-width: 300px; }
        .login-btn { padding: 12px; background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: #9C27B0; border: none; border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 8px rgba(156, 39, 176, 0.2); }
        .login-btn:active { transform: scale(0.98); }
        .container { width: 100vw; height: 100vh; background: white; display: none; flex-direction: column; }
        .dark-mode .container { background: #2a2a3e; }
        .container.show { display: flex; }
        .header { background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: #9C27B0; padding: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 16px; font-weight: 700; flex-shrink: 0; }
        .header-title { flex-grow: 1; }
        #myname { color: #9C27B0; font-weight: 900; }
        .logout-btn { background: rgba(156, 39, 176, 0.25); border: none; color: #9C27B0; padding: 4px 8px; border-radius: 8px; cursor: pointer; font-size: 10px; font-weight: 600; }
        .dark-mode-btn { background: rgba(156, 39, 176, 0.25); border: none; color: #9C27B0; padding: 4px 8px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; }
        .tabs { display: flex; gap: 4px; padding: 8px; background: #f8f9fb; border-bottom: 2px solid #e8eaf6; overflow-x: auto; flex-shrink: 0; }
        .dark-mode .tabs { background: #1a1a2e; border-color: #444; }
        .tab { padding: 6px 10px; background: white; border: 2px solid #e0e0e0; border-radius: 14px; cursor: pointer; font-weight: 600; font-size: 11px; white-space: nowrap; color: #9C27B0; flex-shrink: 0; }
        .dark-mode .tab { background: #3a3a4e; border-color: #555; color: #9C27B0; }
        .tab.active { background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: #9C27B0; }
        .chat-display { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 12px 10px; -webkit-overflow-scrolling: touch; }
        .dark-mode .chat-display { background: #1a1a2e; }
        .message { margin-bottom: 10px; display: flex; flex-direction: column; }
        .message.own { align-items: flex-end; }
        .message-content { display: flex; gap: 6px; align-items: flex-end; }
        .message.own .message-content { flex-direction: row-reverse; }
        .avatar { width: 24px; height: 24px; border-radius: 50%; font-size: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .message-bubble { max-width: 85%; padding: 10px 12px; border-radius: 14px; word-wrap: break-word; font-size: 13px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); font-weight: 500; line-height: 1.4; }
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
        .message-sender { font-size: 10px; color: #9C27B0; margin: 0 0 4px 0; font-weight: 600; text-transform: capitalize; }
        .dark-mode .message-sender { color: #9C27B0; }
        .message.own .message-sender { text-align: right; }
        .input-area { padding: 8px; background: white; border-top: 2px solid #e8eaf6; display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
        .dark-mode .input-area { background: #2a2a3e; border-color: #444; }
        .emoji-picker { display: none; grid-template-columns: repeat(6, 1fr); gap: 4px; padding: 8px; background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%); border-radius: 10px; max-height: 120px; overflow-y: auto; border: 2px solid #ffc107; margin-bottom: 6px; }
        .emoji-picker.show { display: grid; }
        .emoji-option { font-size: 20px; cursor: pointer; text-align: center; padding: 4px; border-radius: 8px; user-select: none; background: white; }
        .emoji-option:active { transform: scale(1.1); }
        .games-panel { display: none; background: #f5f5f5; border-radius: 10px; padding: 8px; border: 2px solid #e0e0e0; margin-bottom: 6px; }
        .dark-mode .games-panel { background: #3a3a4e; border-color: #555; }
        .games-panel.show { display: block; }
        .game-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px; }
        .game-btn { padding: 10px; background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: #9C27B0; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 12px; }
        .game-btn:active { transform: scale(0.98); }
        .game-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .letter-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin: 8px 0; }
        .letter-btn { padding: 6px; background: white; border: 2px solid #9C27B0; border-radius: 6px; cursor: pointer; font-weight: 700; color: #9C27B0; font-size: 11px; }
        .letter-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .hangman-word { font-size: 24px; font-weight: 700; letter-spacing: 6px; text-align: center; margin: 8px 0; font-family: monospace; color: #9C27B0; }
        .hangman-stage { font-size: 48px; text-align: center; margin: 8px 0; }
        .input-container { display: flex; gap: 6px; align-items: center; }
        .input-field { flex: 1; padding: 8px 10px; border: 2px solid #e0e0e0; border-radius: 16px; font-size: 13px; font-family: inherit; height: 36px; }
        .dark-mode .input-field { background: #3a3a4e; border-color: #555; color: white; }
        .input-field:focus { outline: none; border-color: #667eea; }
        .emoji-btn { background: white; border: 2px solid #ffc107; color: #333; padding: 6px 8px; border-radius: 10px; font-size: 14px; cursor: pointer; height: 36px; }
        .games-btn { background: white; border: 2px solid #9C27B0; color: #9C27B0; padding: 6px 8px; border-radius: 10px; font-size: 14px; cursor: pointer; height: 36px; font-weight: 700; }
        .send-btn { background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: #9C27B0; border: none; padding: 6px 8px; border-radius: 16px; font-size: 10px; font-weight: 700; cursor: pointer; height: 36px; min-width: 45px; }
        .send-btn:active { transform: scale(0.95); }
        .send-btn:disabled { background: #ccc; cursor: not-allowed; }
        .empty { text-align: center; color: #9C27B0; padding: 40px 20px; font-size: 14px; font-weight: 600; }
        .game-status { text-align: center; padding: 8px; background: #f3e5f5; border-radius: 8px; color: #9C27B0; font-weight: 600; margin-bottom: 6px; font-size: 12px; }
        .trivia-container { display: none; }
        .trivia-container.show { display: block; }
        .trivia-q { font-weight: 600; margin-bottom: 8px; color: #9C27B0; font-size: 13px; }
        .trivia-answers { display: grid; gap: 6px; margin-bottom: 8px; }
        .trivia-btn { padding: 8px; background: white; border: 2px solid #9C27B0; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px; color: #9C27B0; }
        .trivia-btn:active { background: #f3e5f5; }
        .trivia-result { text-align: center; margin-top: 6px; font-weight: 700; color: #9C27B0; font-size: 12px; }
        .trivia-score { text-align: center; margin-top: 6px; font-size: 12px; color: #9C27B0; }
    </style>
</head>
<body>
    <div class="login-screen" id="login">
        <h1>💜 Chat</h1>
        <p>Pick Your Name 💜</p>
        <div class="login-buttons">
            <button class="login-btn" onclick="window.login('esther')">Esther</button>
            <button class="login-btn" onclick="window.login('valley')">Valley</button>
            <button class="login-btn" onclick="window.login('amaaya')">Amaaya</button>
            <button class="login-btn" onclick="window.login('mama')">Mama</button>
            <button class="login-btn" onclick="window.login('mummy')">Mummy</button>
            <button class="login-btn" onclick="window.login('hilary')">Hilary</button>
            <button class="login-btn" onclick="window.login('nan')">Nan</button>
            <button class="login-btn" onclick="window.login('rishy')">Rishy</button>
            <button class="login-btn" onclick="window.login('poppy')">Poppy</button>
            <button class="login-btn" onclick="window.login('sienna')">Sienna</button>
            <button class="login-btn" onclick="window.login('penelope')">Penelope</button>
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
                        <button class="game-btn" onclick="window.selectRPS('rock')">✊</button>
                        <button class="game-btn" onclick="window.selectRPS('paper')">✋</button>
                        <button class="game-btn" onclick="window.selectRPS('scissors')">✌️</button>
                    </div>
                </div>

                <div id="diceContainer" style="display: none;">
                    <div class="game-status">🎲 Roll!</div>
                    <div style="font-size: 36px; text-align: center; margin: 8px 0;" id="diceResult">🎲</div>
                    <button class="game-btn" style="width: 100%;" onclick="window.rollDice()">Roll</button>
                </div>

                <div id="triviaContainer" class="trivia-container">
                    <div class="trivia-q" id="triviaQuestion"></div>
                    <div id="triviaAnswers" class="trivia-answers"></div>
                    <div class="trivia-result" id="triviaResult"></div>
                    <div class="trivia-score" id="triviaScore"></div>
                </div>

                <div id="hangmanContainer" style="display: none;">
                    <div class="game-status" id="hangmanStatus">🎯 Hangman</div>
                    <div id="hangmanSetupPhase">
                        <input type="text" id="hangmanSetWord" placeholder="Word..." maxlength="15" style="width: 100%; padding: 6px; margin: 6px 0; border: 2px solid #9C27B0; border-radius: 6px; color: #9C27B0; font-size: 12px;">
                        <button class="game-btn" style="width: 100%;" onclick="window.startHangman()">Set</button>
                    </div>
                    <div id="hangmanGamePhase" style="display: none;">
                        <div class="hangman-stage" id="hangmanStage">😊</div>
                        <div class="hangman-word" id="hangmanWord">_ _ _</div>
                        <div id="hangmanLetterGrid" class="letter-grid"></div>
                        <div id="hangmanResult" style="text-align: center; font-weight: 700; margin-top: 6px; color: #9C27B0; font-size: 11px;"></div>
                    </div>
                </div>
            </div>
            <div class="input-container">
                <button class="emoji-btn" onclick="window.toggleEmoji()">😀</button>
                <button class="games-btn" onclick="window.toggleGames()">🎮</button>
                <input type="text" class="input-field" id="msg" placeholder="Message..." disabled>
                <button class="send-btn" id="sendBtn" onclick="window.send()" disabled>Send</button>
            </div>
        </div>
    </div>

    <script>
        const EMOJIS = ['😀','😂','😍','🥰','😎','🤗','😊','🎉','🎊','🎈','🎁','🎂','🍰','🍕','🍔','🍟','☕','🧋','🍹','🍩','🍪','🐱','😺','😸','😻','😼','🦁','🐮','🐷','🦊','🐻','🐼','🐨','🐹','🐰','👍','👏','🙌','💪','🤝','💋','💕','💖','💗','💓','💞','💘','💝','⭐','✨','🌟','💫','🔥','⚡','💜'];
        
        const TRIVIA_QUESTIONS = [
            {q: 'What is the capital of Australia?', a: ['Sydney','Melbourne','Canberra','Brisbane'], c: 2},
            {q: 'Which ocean is largest?', a: ['Atlantic','Indian','Arctic','Pacific'], c: 3},
            {q: 'Tallest mountain?', a: ['Kilimanjaro','Everest','Denali','Blanc'], c: 1},
            {q: 'What is the capital of France?', a: ['Lyon','Marseille','Paris','Nice'], c: 2},
            {q: 'Fastest land animal?', a: ['Lion','Gazelle','Cheetah','Pronghorn'], c: 2},
            {q: 'Largest animal ever?', a: ['Elephant','Blue Whale','Giraffe','Hippo'], c: 1},
            {q: 'Longest river?', a: ['Amazon','Congo','Nile','Yangtze'], c: 2},
            {q: 'Capital of Japan?', a: ['Osaka','Kyoto','Tokyo','Yokohama'], c: 2},
            {q: 'Deepest ocean trench?', a: ['Mariana','Tonga','Philippine','Kuril'], c: 0},
            {q: 'Capital of Egypt?', a: ['Alexandria','Cairo','Giza','Luxor'], c: 1},
            {q: 'Which bird cannot fly?', a: ['Ostrich','Chicken','Penguin','Kiwi'], c: 0},
            {q: 'Capital of Brazil?', a: ['Rio de Janeiro','Brasília','Salvador','Sao Paulo'], c: 1},
            {q: 'How many legs octopus?', a: ['6','8','10','12'], c: 1},
            {q: 'Capital of Canada?', a: ['Toronto','Vancouver','Ottawa','Montreal'], c: 2},
            {q: 'Capital of Germany?', a: ['Munich','Hamburg','Berlin','Cologne'], c: 2},
            {q: 'Largest desert?', a: ['Sahara','Gobi','Kalahari','Antarctic'], c: 3},
            {q: 'Capital of Italy?', a: ['Milan','Rome','Venice','Florence'], c: 1},
            {q: 'How many continents?', a: ['5','6','7','8'], c: 2},
            {q: 'Capital of Spain?', a: ['Barcelona','Madrid','Valencia','Seville'], c: 1},
            {q: 'Smallest country?', a: ['Monaco','Vatican City','San Marino','Liechtenstein'], c: 1},
            {q: 'Fastest animal overall?', a: ['Eagle','Falcon','Peregrine','Hawk'], c: 2},
            {q: 'Which animal sleeps most?', a: ['Bear','Koala','Horse','Cat'], c: 1},
            {q: 'Capital of India?', a: ['Mumbai','New Delhi','Bangalore','Kolkata'], c: 1},
            {q: 'How many strings violin?', a: ['3','4','5','6'], c: 1},
            {q: 'Capital of Mexico?', a: ['Cancun','Guadalajara','Mexico City','Monterrey'], c: 2},
            {q: 'Largest animal mammal?', a: ['Elephant','Whale','Giraffe','Hippo'], c: 1},
            {q: 'Capital of Russia?', a: ['St Petersburg','Moscow','Vladivostok','Novosibirsk'], c: 1},
            {q: 'Which ocean Arctic?', a: ['Pacific','Atlantic','Indian','Arctic'], c: 3},
            {q: 'Capital of Greece?', a: ['Thessaloniki','Athens','Patras','Larissa'], c: 1},
            {q: 'How many bones human?', a: ['186','206','226','246'], c: 1},
            {q: 'Capital of Turkey?', a: ['Istanbul','Ankara','Izmir','Bursa'], c: 1},
            {q: 'Biggest cat animal?', a: ['Lion','Tiger','Leopard','Jaguar'], c: 1},
            {q: 'Capital of Portugal?', a: ['Porto','Lisbon','Covilha','Aveiro'], c: 1},
            {q: 'Ocean has most salt?', a: ['Atlantic','Pacific','Indian','Arctic'], c: 0},
            {q: 'Capital of Poland?', a: ['Krakow','Gdansk','Warsaw','Wroclaw'], c: 2},
            {q: 'How many hearts squid?', a: ['1','2','3','4'], c: 2},
            {q: 'Capital of Argentina?', a: ['Cordoba','Rosario','Buenos Aires','La Plata'], c: 2},
            {q: 'Fastest bird dive?', a: ['150mph','200mph','250mph','300mph'], c: 2},
            {q: 'Capital of South Korea?', a: ['Busan','Seoul','Incheon','Daegu'], c: 1},
            {q: 'Which country pandas?', a: ['Japan','Korea','China','Vietnam'], c: 2},
            {q: 'Capital of Chile?', a: ['Valparaiso','Santiago','Concepcion','Temuco'], c: 1},
            {q: 'How deep ocean avg?', a: ['2km','3km','4km','5km'], c: 2},
            {q: 'Capital of Sweden?', a: ['Gothenburg','Malmö','Stockholm','Uppsala'], c: 2},
            {q: 'How many teeth shark?', a: ['5000','10000','20000','40000'], c: 3},
            {q: 'Capital of Austria?', a: ['Salzburg','Graz','Vienna','Linz'], c: 2},
            {q: 'Tallest tree type?', a: ['Oak','Pine','Eucalyptus','Redwood'], c: 3},
            {q: 'Capital of Belgium?', a: ['Antwerp','Ghent','Brussels','Liege'], c: 2},
            {q: 'How long giraffe neck?', a: ['4ft','6ft','12ft','18ft'], c: 2},
            {q: 'Capital of Thailand?', a: ['Phuket','Chiang Mai','Bangkok','Pattaya'], c: 2},
            {q: 'Most abundant element?', a: ['Oxygen','Nitrogen','Hydrogen','Helium'], c: 2},
            {q: 'Capital of Netherlands?', a: ['Rotterdam','Utrecht','Amsterdam','Hague'], c: 2},
            {q: 'How old turtle live?', a: ['50','100','150','200'], c: 3},
            {q: 'Capital of Denmark?', a: ['Aarhus','Odense','Copenhagen','Aalborg'], c: 2},
            {q: 'How fast peregrine?', a: ['100mph','150mph','200mph','250mph'], c: 2},
            {q: 'Capital of Norway?', a: ['Bergen','Trondheim','Oslo','Stavanger'], c: 2},
            {q: 'How many chambers heart?', a: ['2','3','4','5'], c: 2},
            {q: 'Capital of Finland?', a: ['Tampere','Turku','Helsinki','Oulu'], c: 2},
            {q: 'Deepest place ocean?', a: ['5000m','7000m','9000m','11000m'], c: 3},
            {q: 'Capital of Ireland?', a: ['Cork','Galway','Dublin','Limerick'], c: 2},
            {q: 'How many legs spider?', a: ['6','8','10','12'], c: 1},
            {q: 'Capital of Romania?', a: ['Cluj','Timisoara','Bucharest','Constanta'], c: 2},
            {q: 'Blue whale weight?', a: ['100 tons','150 tons','200 tons','300 tons'], c: 2},
            {q: 'Capital of Hungary?', a: ['Debrecen','Szeged','Budapest','Miskolc'], c: 2},
            {q: 'How many teeth human?', a: ['28','30','32','36'], c: 2},
            {q: 'Capital of Czech?', a: ['Brno','Plzen','Prague','Olomouc'], c: 2},
            {q: 'Largest feline cat?', a: ['Tiger','Lion','Leopard','Jaguar'], c: 0},
            {q: 'Capital of Croatia?', a: ['Rijeka','Split','Zagreb','Osijek'], c: 2},
            {q: 'How many eyes bee?', a: ['2','3','5','8'], c: 2},
            {q: 'Capital of Slovenia?', a: ['Maribor','Celje','Ljubljana','Koper'], c: 2},
            {q: 'Fastest fish water?', a: ['Sailfish','Tuna','Marlin','Wahoo'], c: 0},
            {q: 'Capital of Serbia?', a: ['Nis','Novi Sad','Belgrade','Kragujevac'], c: 2},
            {q: 'How big dinosaur?', a: ['20ft','40ft','80ft','120ft'], c: 3},
            {q: 'Capital of Bulgaria?', a: ['Plovdiv','Varna','Sofia','Burgas'], c: 2},
            {q: 'Smartest animal?', a: ['Dolphin','Crow','Octopus','Chimp'], c: 3},
            {q: 'Capital of Albania?', a: ['Durrës','Vlore','Tirana','Fier'], c: 2},
            {q: 'How long whale can hold?', a: ['30 min','1 hr','2 hrs','4 hrs'], c: 2},
            {q: 'Capital of Macedonia?', a: ['Bitola','Kumanovo','Skopje','Tetovo'], c: 2},
            {q: 'How many sides pentagon?', a: ['4','5','6','7'], c: 1},
            {q: 'Capital of Bosnia?', a: ['Tuzla','Banja Luka','Sarajevo','Mostar'], c: 2},
            {q: 'Largest sea creature?', a: ['Whale Shark','Great White','Octopus','Squid'], c: 0},
            {q: 'Capital of Iceland?', a: ['Akureyri','Hafnarfjordur','Reykjavik','Keflavik'], c: 2},
            {q: 'How many colors rainbow?', a: ['5','6','7','8'], c: 2},
            {q: 'Capital of Luxembourg?', a: ['Differdange','Esch','Luxembourg','Dudelange'], c: 2},
            {q: 'Tallest bird alive?', a: ['Emu','Rhea','Ostrich','Cassowary'], c: 2},
            {q: 'Capital of Malta?', a: ['Sliema','Valletta','Naxxar','Paceville'], c: 1},
            {q: 'How many bones neck?', a: ['5','7','9','12'], c: 1},
            {q: 'Capital of Cyprus?', a: ['Limassol','Paphos','Nicosia','Larnaca'], c: 2},
            {q: 'Strongest animal pound?', a: ['Bull','Gorilla','Rhino','Bear'], c: 2},
            {q: 'Capital of Lebanon?', a: ['Tripoli','Sidon','Beirut','Tyre'], c: 2},
            {q: 'How old can human live?', a: ['100','120','140','160'], c: 1},
            {q: 'Capital of Israel?', a: ['Tel Aviv','Haifa','Jerusalem','Rishon'], c: 2},
            {q: 'Which snake longest?', a: ['Cobra','Python','Anaconda','Mamba'], c: 2},
            {q: 'Capital of Jordan?', a: ['Zarqa','Irbid','Amman','Aqaba'], c: 2},
            {q: 'How many bones ribs?', a: ['10','12','14','16'], c: 1},
            {q: 'Capital of Syria?', a: ['Aleppo','Homs','Damascus','Latakia'], c: 2}
        ];

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
        let hangmanWord = '', hangmanGuessed = [], hangmanWrong = 0, hangmanGameActive = false;
        let triviaScore = 0, triviaTotal = 0, triviaAnswered = false, triviaCurrentQ = null;

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
                        document.getElementById('rpsStatus').textContent = data.user + ' chose!';
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
                btn.textContent = chatId === 'group' ? '👥' : '💜 ' + chatId.split('-')[1].substr(0, 3);
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
            document.getElementById('triviaContainer').classList.remove('show');
            document.getElementById('diceContainer').style.display = 'none';
            rpsTimeLeft = 10;
            document.getElementById('rpsStatus').textContent = '⏱️ 10s';
            rpsTimer = setInterval(() => {
                rpsTimeLeft--;
                document.getElementById('rpsStatus').textContent = '⏱️ ' + rpsTimeLeft + 's';
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
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎮 ' + currentUser + ' played RPS' }));
            }
        };

        window.playDice = function() {
            document.getElementById('diceContainer').style.display = 'block';
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('hangmanContainer').style.display = 'none';
            document.getElementById('triviaContainer').classList.remove('show');
            document.getElementById('diceResult').textContent = '🎲';
        };

        window.rollDice = function() {
            const result = Math.floor(Math.random() * 6) + 1;
            const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];
            document.getElementById('diceResult').textContent = emojis[result - 1];
            document.querySelector('#diceContainer .game-btn').disabled = true;
            ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎲 ' + currentUser + ': ' + result }));
        };

        window.playTrivia = function() {
            triviaScore = 0;
            triviaTotal = 0;
            triviaAnswered = false;
            document.getElementById('triviaContainer').classList.add('show');
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('hangmanContainer').style.display = 'none';
            document.getElementById('diceContainer').style.display = 'none';
            window.nextTriviaQuestion();
        };

        window.nextTriviaQuestion = function() {
            if (triviaTotal >= 10) {
                document.getElementById('triviaQuestion').textContent = 'Done! Score: ' + triviaScore + '/10';
                document.getElementById('triviaAnswers').innerHTML = '';
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🧠 Trivia: ' + triviaScore + '/10' }));
                return;
            }
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
            document.getElementById('triviaScore').textContent = (triviaTotal + 1) + '/10';
        };

        window.submitTriviaAnswer = function(idx) {
            if (triviaAnswered) return;
            triviaAnswered = true;
            if (idx === triviaCurrentQ.c) triviaScore++;
            document.getElementById('triviaResult').textContent = idx === triviaCurrentQ.c ? '✅' : '❌';
            triviaTotal++;
            setTimeout(window.nextTriviaQuestion, 800);
        };

        window.playHangman = function() {
            hangmanWord = '';
            hangmanGuessed = [];
            hangmanWrong = 0;
            hangmanGameActive = false;
            document.getElementById('hangmanContainer').style.display = 'block';
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('triviaContainer').classList.remove('show');
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
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎯 Hangman started!' }));
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
                document.getElementById('hangmanResult').textContent = won ? '🎉 WIN: ' + hangmanWord : '💀 LOSE: ' + hangmanWord;
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
            if (msgs.length === 0) { div.innerHTML = '<div class="empty">💬 Chat! 💜</div>'; return; }
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
server.listen(PORT, () => { console.log('💜 Server on ' + PORT); });
