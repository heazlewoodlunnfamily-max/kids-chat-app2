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
    <title>💬 Chat Games</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; overflow: hidden; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FFC4DB; display: flex; justify-content: center; }
        .login-screen { width: 100vw; height: 100vh; background: white; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 10px; text-align: center; }
        .login-screen h1 { font-size: 42px; margin-bottom: 8px; color: #9C27B0; font-weight: 800; }
        .login-screen p { font-size: 16px; color: #9C27B0; margin-bottom: 20px; font-weight: 600; }
        .login-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; max-width: 380px; }
        .login-btn { padding: 14px; background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: #9C27B0; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; cursor: pointer; }
        .login-btn:active { transform: scale(0.98); }
        .container { width: 100vw; height: 100vh; background: white; display: none; flex-direction: column; }
        .container.show { display: flex; }
        .header { background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: #9C27B0; padding: 12px 10px; display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: 700; flex-shrink: 0; gap: 8px; }
        #myname { color: #9C27B0; font-weight: 900; }
        .logout-btn { background: rgba(156, 39, 176, 0.25); border: none; color: #9C27B0; padding: 6px 10px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; }
        .dark-mode-btn { background: rgba(156, 39, 176, 0.25); border: none; color: #9C27B0; padding: 6px 10px; border-radius: 8px; cursor: pointer; font-size: 14px; }
        .tabs { display: flex; gap: 6px; padding: 10px; background: #f8f9fb; border-bottom: 2px solid #e8eaf6; overflow-x: auto; flex-shrink: 0; }
        .tab { padding: 8px 14px; background: white; border: 2px solid #e0e0e0; border-radius: 14px; cursor: pointer; font-weight: 600; font-size: 12px; white-space: nowrap; color: #9C27B0; flex-shrink: 0; }
        .tab.active { background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: #9C27B0; }
        .chat-display { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 12px 10px; -webkit-overflow-scrolling: touch; font-size: 14px; }
        .message { margin-bottom: 12px; display: flex; flex-direction: column; }
        .message.own { align-items: flex-end; }
        .message-content { display: flex; gap: 8px; align-items: flex-end; }
        .message.own .message-content { flex-direction: row-reverse; }
        .avatar { width: 32px; height: 32px; border-radius: 50%; font-size: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .message-bubble { max-width: 80%; padding: 10px 14px; border-radius: 14px; word-wrap: break-word; font-size: 13px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-weight: 500; line-height: 1.4; }
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
        .message-sender { font-size: 11px; color: #9C27B0; margin: 0 0 4px 0; font-weight: 600; }
        .message.own .message-sender { text-align: right; }
        .input-area { padding: 10px; background: white; border-top: 2px solid #e8eaf6; display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; min-height: 60px; }
        .emoji-picker { display: none; grid-template-columns: repeat(6, 1fr); gap: 6px; padding: 10px; background: #fff9e6; border-radius: 12px; max-height: 140px; overflow-y: auto; border: 2px solid #ffc107; margin-bottom: 0px; }
        .emoji-picker.show { display: grid; }
        .emoji-option { font-size: 20px; cursor: pointer; text-align: center; padding: 6px; }
        .emoji-option:active { transform: scale(1.15); }
        .games-panel { display: none; background: #f5f5f5; border-radius: 12px; padding: 10px; border: 2px solid #e0e0e0; margin-bottom: 0px; }
        .games-panel.show { display: block; }
        .game-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
        .game-btn { padding: 12px; background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: #9C27B0; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 13px; }
        .game-btn:active { transform: scale(0.97); }
        .game-btn:disabled { opacity: 0.5; }
        .letter-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin: 12px 0; }
        .letter-btn { padding: 8px; background: white; border: 2px solid #9C27B0; border-radius: 8px; cursor: pointer; font-weight: 700; color: #9C27B0; font-size: 12px; }
        .letter-btn:disabled { opacity: 0.3; }
        .hangman-word { font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; margin: 12px 0; font-family: monospace; color: #9C27B0; }
        .hangman-stage { font-size: 64px; text-align: center; margin: 8px 0; }
        .input-container { display: flex; gap: 8px; align-items: center; width: 100%; }
        .input-field { flex: 1; padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 20px; font-size: 14px; font-family: inherit; height: 44px; }
        .input-field:focus { outline: none; border-color: #667eea; }
        .input-field::placeholder { color: #999; }
        .emoji-btn { background: white; border: 2px solid #ffc107; color: #333; padding: 8px 12px; border-radius: 10px; font-size: 16px; cursor: pointer; height: 44px; min-width: 44px; flex-shrink: 0; }
        .games-btn { background: white; border: 2px solid #9C27B0; color: #9C27B0; padding: 8px 12px; border-radius: 10px; font-size: 16px; cursor: pointer; height: 44px; font-weight: 700; min-width: 44px; flex-shrink: 0; }
        .send-btn { background: linear-gradient(90deg, #FF9FBE 0%, #FFD180 25%, #FFFF99 50%, #B8E6DB 75%, #9DB8E6 100%); color: #9C27B0; border: none; padding: 8px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; cursor: pointer; height: 44px; min-width: 60px; flex-shrink: 0; }
        .send-btn:active { transform: scale(0.96); }
        .send-btn:disabled { background: #ccc; }
        .empty { text-align: center; color: #9C27B0; padding: 40px 15px; font-size: 16px; font-weight: 600; }
        .game-status { text-align: center; padding: 10px; background: #f3e5f5; border-radius: 10px; color: #9C27B0; font-weight: 600; margin-bottom: 8px; font-size: 13px; }
        .trivia-q { font-weight: 600; margin-bottom: 10px; color: #9C27B0; font-size: 14px; }
        .trivia-answers { display: grid; gap: 8px; margin-bottom: 10px; }
        .trivia-btn { padding: 10px; background: white; border: 2px solid #9C27B0; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; color: #9C27B0; }
        .trivia-btn:active { background: #f3e5f5; }
        .trivia-btn.correct { background: #4CAF50; color: white; border-color: #4CAF50; }
        .trivia-btn.wrong { background: #FF6B6B; color: white; border-color: #FF6B6B; }
        .trivia-result { text-align: center; margin-top: 10px; font-weight: 700; color: #9C27B0; font-size: 14px; }
        .trivia-score { text-align: center; margin-top: 8px; font-size: 12px; color: #9C27B0; }
        .players-score { text-align: center; font-size: 13px; color: #9C27B0; margin-top: 8px; }
    </style>
</head>
<body>
    <div class="login-screen" id="login">
        <h1>💜 Chat Games</h1>
        <p>Select Your Name 💜</p>
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
            <div>💬 <span id="myname"></span></div>
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
                    <div style="font-size: 32px; text-align: center; margin: 6px 0;" id="diceResult">🎲</div>
                    <button class="game-btn" style="width: 100%;" onclick="window.rollDice()">Roll</button>
                </div>

                <div id="triviaContainer" style="display: none;">
                    <div class="trivia-q" id="triviaQuestion"></div>
                    <div id="triviaAnswers" class="trivia-answers"></div>
                    <div class="trivia-result" id="triviaResult"></div>
                    <div class="players-score" id="playersScore"></div>
                    <div class="trivia-score" id="triviaScore"></div>
                </div>

                <div id="hangmanContainer" style="display: none;">
                    <div class="game-status" id="hangmanStatus">🎯 Hangman</div>
                    <div id="hangmanSetupPhase">
                        <input type="text" id="hangmanSetWord" placeholder="Word..." maxlength="12" style="width: 100%; padding: 4px; margin: 4px 0; border: 1px solid #9C27B0; border-radius: 6px; color: #9C27B0; font-size: 11px;">
                        <button class="game-btn" style="width: 100%; margin-top: 2px;" onclick="window.startHangman()">Set</button>
                    </div>
                    <div id="hangmanGamePhase" style="display: none;">
                        <div class="hangman-stage" id="hangmanStage">😊</div>
                        <div class="hangman-word" id="hangmanWord">_ _ _</div>
                        <div id="hangmanLetterGrid" class="letter-grid"></div>
                        <div id="hangmanResult" style="text-align: center; font-weight: 700; margin-top: 4px; color: #9C27B0; font-size: 10px;"></div>
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
            {q: 'Capital of Australia?', a: ['Sydney','Melbourne','Canberra','Brisbane'], c: 2},
            {q: 'Largest ocean?', a: ['Atlantic','Indian','Arctic','Pacific'], c: 3},
            {q: 'Tallest mountain?', a: ['Kilimanjaro','Everest','Denali','Blanc'], c: 1},
            {q: 'Capital of France?', a: ['Lyon','Marseille','Paris','Nice'], c: 2},
            {q: 'Fastest land animal?', a: ['Lion','Gazelle','Cheetah','Pronghorn'], c: 2},
            {q: 'Largest animal?', a: ['Elephant','Blue Whale','Giraffe','Hippo'], c: 1},
            {q: 'Longest river?', a: ['Amazon','Congo','Nile','Yangtze'], c: 2},
            {q: 'Capital of Japan?', a: ['Osaka','Kyoto','Tokyo','Yokohama'], c: 2},
            {q: 'Deepest trench?', a: ['Mariana','Tonga','Philippine','Kuril'], c: 0},
            {q: 'Capital of Egypt?', a: ['Alexandria','Cairo','Giza','Luxor'], c: 1},
            {q: 'Bird cannot fly?', a: ['Ostrich','Chicken','Penguin','Kiwi'], c: 0},
            {q: 'Capital of Brazil?', a: ['Rio','Brasília','Salvador','Sao Paulo'], c: 1},
            {q: 'Octopus legs?', a: ['6','8','10','12'], c: 1},
            {q: 'Capital of Canada?', a: ['Toronto','Vancouver','Ottawa','Montreal'], c: 2},
            {q: 'Capital of Germany?', a: ['Munich','Hamburg','Berlin','Cologne'], c: 2},
            {q: 'Largest desert?', a: ['Sahara','Gobi','Kalahari','Antarctic'], c: 3},
            {q: 'Capital of Italy?', a: ['Milan','Rome','Venice','Florence'], c: 1},
            {q: 'Continents total?', a: ['5','6','7','8'], c: 2},
            {q: 'Capital of Spain?', a: ['Barcelona','Madrid','Valencia','Seville'], c: 1},
            {q: 'Smallest country?', a: ['Monaco','Vatican','San Marino','Liechtenstein'], c: 1},
            {q: 'Fastest diver?', a: ['Eagle','Falcon','Peregrine','Hawk'], c: 2},
            {q: 'Most sleep?', a: ['Bear','Koala','Horse','Cat'], c: 1},
            {q: 'Capital of India?', a: ['Mumbai','New Delhi','Bangalore','Kolkata'], c: 1},
            {q: 'Violin strings?', a: ['3','4','5','6'], c: 1},
            {q: 'Capital of Mexico?', a: ['Cancun','Guadalajara','Mexico City','Monterrey'], c: 2},
            {q: 'Largest mammal?', a: ['Elephant','Whale','Giraffe','Hippo'], c: 1},
            {q: 'Capital of Russia?', a: ['St Petersburg','Moscow','Vladivostok','Novosibirsk'], c: 1},
            {q: 'Most salt ocean?', a: ['Pacific','Atlantic','Indian','Arctic'], c: 0},
            {q: 'Capital of Greece?', a: ['Thessaloniki','Athens','Patras','Larissa'], c: 1},
            {q: 'Human bones?', a: ['186','206','226','246'], c: 1},
            {q: 'Capital of Turkey?', a: ['Istanbul','Ankara','Izmir','Bursa'], c: 1},
            {q: 'Biggest cat?', a: ['Lion','Tiger','Leopard','Jaguar'], c: 1},
            {q: 'Capital of Portugal?', a: ['Porto','Lisbon','Covilha','Aveiro'], c: 1},
            {q: 'Arctic ocean?', a: ['Atlantic','Pacific','Indian','Arctic'], c: 3},
            {q: 'Capital of Poland?', a: ['Krakow','Gdansk','Warsaw','Wroclaw'], c: 2},
            {q: 'Squid hearts?', a: ['1','2','3','4'], c: 2},
            {q: 'Capital of Argentina?', a: ['Cordoba','Rosario','Buenos Aires','La Plata'], c: 2},
            {q: 'Peregrine speed?', a: ['150','200','250','300'], c: 2},
            {q: 'Capital S.Korea?', a: ['Busan','Seoul','Incheon','Daegu'], c: 1},
            {q: 'Panda country?', a: ['Japan','Korea','China','Vietnam'], c: 2},
            {q: 'Capital of Chile?', a: ['Valparaiso','Santiago','Concepcion','Temuco'], c: 1},
            {q: 'Ocean depth avg?', a: ['2km','3km','4km','5km'], c: 2},
            {q: 'Capital of Sweden?', a: ['Gothenburg','Malmö','Stockholm','Uppsala'], c: 2},
            {q: 'Shark teeth?', a: ['5000','10000','20000','40000'], c: 3},
            {q: 'Capital of Austria?', a: ['Salzburg','Graz','Vienna','Linz'], c: 2},
            {q: 'Tallest tree?', a: ['Oak','Pine','Eucalyptus','Redwood'], c: 3},
            {q: 'Capital of Belgium?', a: ['Antwerp','Ghent','Brussels','Liege'], c: 2},
            {q: 'Giraffe neck?', a: ['4ft','6ft','12ft','18ft'], c: 2},
            {q: 'Capital of Thailand?', a: ['Phuket','Chiang Mai','Bangkok','Pattaya'], c: 2},
            {q: 'Most element?', a: ['Oxygen','Nitrogen','Hydrogen','Helium'], c: 2},
            {q: 'Capital Netherlands?', a: ['Rotterdam','Utrecht','Amsterdam','Hague'], c: 2},
            {q: 'Turtle lifespan?', a: ['50','100','150','200'], c: 3},
            {q: 'Capital of Denmark?', a: ['Aarhus','Odense','Copenhagen','Aalborg'], c: 2},
            {q: 'Peregrine speed?', a: ['100','150','200','250'], c: 2},
            {q: 'Capital of Norway?', a: ['Bergen','Trondheim','Oslo','Stavanger'], c: 2},
            {q: 'Heart chambers?', a: ['2','3','4','5'], c: 2},
            {q: 'Capital of Finland?', a: ['Tampere','Turku','Helsinki','Oulu'], c: 2},
            {q: 'Ocean deepest?', a: ['5000m','7000m','9000m','11000m'], c: 3},
            {q: 'Capital of Ireland?', a: ['Cork','Galway','Dublin','Limerick'], c: 2},
            {q: 'Spider legs?', a: ['6','8','10','12'], c: 1},
            {q: 'Capital of Romania?', a: ['Cluj','Timisoara','Bucharest','Constanta'], c: 2},
            {q: 'Whale weight?', a: ['100','150','200','300'], c: 2},
            {q: 'Capital of Hungary?', a: ['Debrecen','Szeged','Budapest','Miskolc'], c: 2},
            {q: 'Human teeth?', a: ['28','30','32','36'], c: 2},
            {q: 'Capital of Czech?', a: ['Brno','Plzen','Prague','Olomouc'], c: 2},
            {q: 'Largest feline?', a: ['Tiger','Lion','Leopard','Jaguar'], c: 0},
            {q: 'Capital of Croatia?', a: ['Rijeka','Split','Zagreb','Osijek'], c: 2},
            {q: 'Bee eyes?', a: ['2','3','5','8'], c: 2},
            {q: 'Capital of Slovenia?', a: ['Maribor','Celje','Ljubljana','Koper'], c: 2},
            {q: 'Fastest fish?', a: ['Sailfish','Tuna','Marlin','Wahoo'], c: 0},
            {q: 'Capital of Serbia?', a: ['Nis','Novi Sad','Belgrade','Kragujevac'], c: 2},
            {q: 'Dinosaur size?', a: ['20ft','40ft','80ft','120ft'], c: 3},
            {q: 'Capital of Bulgaria?', a: ['Plovdiv','Varna','Sofia','Burgas'], c: 2},
            {q: 'Smartest?', a: ['Dolphin','Crow','Octopus','Chimp'], c: 3},
            {q: 'Capital of Albania?', a: ['Durrës','Vlore','Tirana','Fier'], c: 2},
            {q: 'Whale hold breath?', a: ['30m','1h','2h','4h'], c: 2},
            {q: 'Capital of Macedonia?', a: ['Bitola','Kumanovo','Skopje','Tetovo'], c: 2},
            {q: 'Pentagon sides?', a: ['4','5','6','7'], c: 1},
            {q: 'Capital of Bosnia?', a: ['Tuzla','Banja Luka','Sarajevo','Mostar'], c: 2},
            {q: 'Biggest sea?', a: ['Whale Shark','Great White','Octopus','Squid'], c: 0},
            {q: 'Capital of Iceland?', a: ['Akureyri','Hafnarfjordur','Reykjavik','Keflavik'], c: 2},
            {q: 'Rainbow colors?', a: ['5','6','7','8'], c: 2},
            {q: 'Capital of Luxembourg?', a: ['Differdange','Esch','Luxembourg','Dudelange'], c: 2},
            {q: 'Tallest bird?', a: ['Emu','Rhea','Ostrich','Cassowary'], c: 2},
            {q: 'Capital of Malta?', a: ['Sliema','Valletta','Naxxar','Paceville'], c: 1},
            {q: 'Neck bones?', a: ['5','7','9','12'], c: 1},
            {q: 'Capital of Cyprus?', a: ['Limassol','Paphos','Nicosia','Larnaca'], c: 2},
            {q: 'Strongest per lb?', a: ['Bull','Gorilla','Rhino','Bear'], c: 2},
            {q: 'Capital of Lebanon?', a: ['Tripoli','Sidon','Beirut','Tyre'], c: 2},
            {q: 'Human max age?', a: ['100','120','140','160'], c: 1},
            {q: 'Capital of Israel?', a: ['Tel Aviv','Haifa','Jerusalem','Rishon'], c: 2},
            {q: 'Longest snake?', a: ['Cobra','Python','Anaconda','Mamba'], c: 2},
            {q: 'Capital of Jordan?', a: ['Zarqa','Irbid','Amman','Aqaba'], c: 2}
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
                ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎮 Played RPS' }));
            }
        };

        window.playDice = function() {
            document.getElementById('diceContainer').style.display = 'block';
            document.getElementById('rpsContainer').style.display = 'none';
            document.getElementById('hangmanContainer').style.display = 'none';
            document.getElementById('triviaContainer').style.display = 'none';
            document.getElementById('diceResult').textContent = '🎲';
        };

        window.rollDice = function() {
            const result = Math.floor(Math.random() * 6) + 1;
            const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];
            document.getElementById('diceResult').textContent = emojis[result - 1];
            document.querySelector('#diceContainer .game-btn').disabled = true;
            ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🎲 Rolled: ' + result }));
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
            ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: '🧠 Started Trivia!' }));
            window.nextTriviaQuestion();
        };

        window.nextTriviaQuestion = function() {
            if (triviaTotal >= 5) {
                let scores = 'Final Scores: ';
                Object.entries(triviaScore).forEach(([u, s]) => { scores += u + ':' + s + ' '; });
                document.getElementById('triviaQuestion').textContent = 'Done!';
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
            document.getElementById('triviaResult').textContent = isCorrect ? '✅ Correct!' : '❌ Wrong!';
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
                document.getElementById('hangmanResult').textContent = won ? '🎉 WIN!' : '💀 Word: ' + hangmanWord;
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
