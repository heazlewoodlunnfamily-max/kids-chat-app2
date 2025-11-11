<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Heazlewood-Lunn Family Planner</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
        html, body { width: 100vw; height: 100vh; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        
        body {
            background: linear-gradient(135deg, #FFE5F1 0%, #FFD9E5 15%, #FFE5D4 30%, #FFFDD4 45%, #E8F5E9 60%, #E0F7FA 75%, #F3E5F5 90%, #FFE5F1 100%);
            background-attachment: fixed;
        }

        .app { width: 100%; height: 100%; display: flex; flex-direction: column; }

        .header {
            background: linear-gradient(135deg, rgba(255, 212, 229, 0.95), rgba(255, 229, 212, 0.95));
            padding: 8px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 50px;
            flex-shrink: 0;
            gap: 12px;
        }

        .header h1 { font-size: 18px; font-weight: 700; color: #333; }

        .family-members { display: flex; gap: 8px; }
        .member-badge { padding: 8px 12px; border-radius: 6px; color: white; font-size: 12px; font-weight: 600; cursor: pointer; min-height: 44px; display: flex; align-items: center; transition: all 0.2s; }
        .member-badge:active { transform: scale(0.95); }

        .esther-badge { background: #2E7D32; }
        .lola-badge { background: #00897B; }
        .mama-badge { background: #1565C0; }
        .mummy-badge { background: #7B1FA2; }

        .content { flex: 1; overflow: hidden; min-height: 0; }
        .page { display: none !important; width: 100%; height: 100%; overflow: hidden; flex-direction: column; }
        .page.active { display: flex !important; }

        #homePage { 
            padding: 6px; 
            gap: 6px; 
            background: linear-gradient(135deg, rgba(255, 212, 229, 0.9), rgba(212, 241, 212, 0.9)); 
            overflow: hidden;
            flex-direction: column;
        }

        .home-layout { 
            display: flex; 
            flex-direction: column; 
            gap: 6px; 
            width: 100%; 
            height: 100%; 
            overflow: hidden;
            flex: 1;
        }

        
        .home-row { 
            display: grid; 
            gap: 6px; 
            flex: 1; 
            min-height: 0;
            overflow: hidden;
        }
        
        .home-top { 
            grid-template-columns: 1fr 1fr; 
            flex: 1;
        }
        
        .home-middle { 
            grid-template-columns: 1fr 1fr 1fr; 
            flex: 1;
        }
        
        .home-bottom { 
            grid-template-columns: 1fr 1fr; 
            flex: 1;
        }

        .widget { 
            background: white; 
            border-radius: 8px; 
            padding: 10px; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.1); 
            border-left: 3px solid; 
            display: flex; 
            flex-direction: column; 
            overflow: hidden;
            min-height: 0;
        }
        
        .widget-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
        .widget-content { font-size: 20px; font-weight: 700; flex: 1; overflow: hidden; line-height: 1.2; }

        .weather-widget { border-color: #1565C0; background: linear-gradient(135deg, rgba(21, 101, 192, 0.08), rgba(100, 181, 246, 0.08)); }
        .wisdom-widget { border-color: #7B1FA2; background: linear-gradient(135deg, rgba(123, 31, 162, 0.08), rgba(206, 147, 216, 0.08)); }
        .chat-widget-container { border-color: #FF6B6B; background: linear-gradient(135deg, rgba(255, 107, 107, 0.08), rgba(255, 183, 183, 0.08)); }
        .event-widget { border-color: #F9A825; background: linear-gradient(135deg, rgba(249, 168, 37, 0.08), rgba(255, 213, 79, 0.08)); }
        .todo-widget { border-color: #2E7D32; background: linear-gradient(135deg, rgba(46, 125, 50, 0.08), rgba(165, 214, 167, 0.08)); }

        .widget-title.weather { color: #1565C0; }
        .widget-title.wisdom { color: #7B1FA2; }
        .widget-title.chat { color: #FF6B6B; }
        .widget-title.event { color: #F9A825; }
        .widget-title.todo { color: #2E7D32; }

        .chat-messages-box { flex: 1; overflow-y: auto; margin-bottom: 8px; display: flex; flex-direction: column; gap: 6px; font-size: 12px; padding: 6px; }
        .chat-msg { padding: 8px 10px; border-radius: 6px; max-width: 95%; word-wrap: break-word; }
        .chat-msg.user { background: #FF6B6B; color: white; align-self: flex-end; border-bottom-right-radius: 2px; }
        .chat-msg.other { background: #e0e0e0; align-self: flex-start; border-bottom-left-radius: 2px; }
        .chat-input-box { display: flex; gap: 4px; align-items: stretch; }
        .chat-input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; min-height: 32px; }
        .chat-voice-btn { padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; }

        .todo-input, .todo-btn { 
            padding: 8px; 
            margin: 4px 0; 
            border-radius: 4px; 
            border: 1px solid #ddd; 
            font-size: 14px; 
        }
        .todo-btn { 
            background: #2E7D32; 
            color: white; 
            cursor: pointer; 
            border: none; 
            min-height: 32px; 
            font-weight: 600;
        }
        .todo-btn:active { transform: scale(0.95); }

        .todo-list { 
            font-size: 13px; 
            max-height: 100%; 
            overflow-y: auto; 
            flex: 1;
            min-height: 0;
        }
        
        .todo-item { 
            padding: 6px; 
            background: #f5f5f5; 
            margin: 3px 0; 
            border-radius: 3px; 
            display: flex; 
            gap: 6px; 
            align-items: center; 
            font-size: 12px;
        }

        #calendarPage { padding: 8px; gap: 8px; }
        .calendar-header { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; height: auto; }
        .calendar-header h2 { font-size: 20px; color: #333; }
        .view-btn, .nav-btn { padding: 8px 14px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; min-height: 36px; transition: all 0.2s; }
        .view-btn:active, .nav-btn:active { transform: scale(0.95); }
        .view-btn { background: #2E7D32; color: white; }
        .nav-btn { background: #1565C0; color: white; }

        .event-legend { display: flex; gap: 10px; flex-wrap: wrap; font-size: 11px; margin-bottom: 6px; }
        .legend-item { display: flex; gap: 4px; align-items: center; }
        .legend-color { width: 14px; height: 14px; border-radius: 2px; }

        .calendar-content { flex: 1; overflow: hidden; }
        .month-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; height: 100%; }
        .month-day { background: white; border-radius: 6px; padding: 8px; border: 2px solid #eee; font-size: 12px; overflow-y: auto; }
        .month-day.today { border: 2px solid #F9A825; background: rgba(249, 168, 37, 0.05); }
        .month-day-num { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
        .month-event { font-size: 10px; padding: 2px 4px; border-radius: 2px; color: white; margin-bottom: 2px; font-weight: 600; }

        .week-view { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; height: 100%; }
        .day-column { background: white; border-radius: 6px; padding: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); display: flex; flex-direction: column; }
        .day-column.today { border: 2px solid #F9A825; background: rgba(249, 168, 37, 0.05); }
        .day-header { font-weight: 700; font-size: 12px; margin-bottom: 4px; padding-bottom: 4px; border-bottom: 1px solid #eee; }
        .day-content { flex: 1; overflow-y: auto; font-size: 11px; }
        .event { padding: 4px; border-radius: 3px; color: white; font-weight: 600; margin-bottom: 3px; cursor: pointer; }

        .event-school { background: #2E7D32; }
        .event-work { background: #1565C0; }
        .event-holiday { background: #FF6B6B; }
        .event-shabbat { background: #7B1FA2; }

        #shoppingPage { padding: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .shopping-input { padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; }
        .shopping-add-btn { padding: 8px 14px; background: #1565C0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; min-height: 32px; margin-top: 4px; }
        .shopping-list { flex: 1; overflow-y: auto; font-size: 12px; }
        .shopping-item { padding: 8px; background: #f5f5f5; border-radius: 4px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; }
        .shopping-item button { padding: 4px 8px; background: #FF6B6B; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px; }

        .user-page { 
            padding: 10px; 
            display: flex; 
            flex-direction: row; 
            gap: 12px;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        .user-section { 
            background: white; 
            border-radius: 12px; 
            padding: 14px; 
            border-left: 4px solid; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
            overflow-y: auto;
            min-height: 0;
        }
        .user-section h3 { 
            font-size: 18px; 
            font-weight: 700; 
            margin-bottom: 12px; 
        }
        .user-section p { 
            font-size: 14px; 
            color: #666; 
            line-height: 1.8;
        }
        .user-section h3 { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
        .user-section p { font-size: 12px; color: #666; }

        .bottom-nav {
            display: flex;
            justify-content: space-around;
            background: linear-gradient(135deg, rgba(255, 212, 229, 0.95), rgba(255, 229, 212, 0.95));
            border-top: 1px solid rgba(0,0,0,0.1);
            height: 50px;
            flex-shrink: 0;
            z-index: 100;
            position: relative;
        }

        .nav-item {
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            font-size: 12px;
            font-weight: 600;
            color: #999;
            transition: all 0.2s;
            flex: 1;
            text-align: center;
            min-height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* Touch optimization */
        input, button {
            min-height: 44px;
            font-size: 16px;
        }
        
        input:active, button:active {
            opacity: 0.8;
        }

        .nav-item:active { transform: scale(0.95); }
        .nav-item.active { background: linear-gradient(135deg, #2E7D32, #1565C0); color: white; }

        input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="app">
        <div class="header">
            <h1>Family Planner</h1>
            <div class="family-members">
                <div class="member-badge esther-badge" onclick="navigateTo('esther'); setCurrentChatUser('Esther');">🟢 Esther</div>
                <div class="member-badge lola-badge" onclick="navigateTo('lola'); setCurrentChatUser('Lola');">🔵 Lola</div>
                <div class="member-badge mama-badge" onclick="navigateTo('mama'); setCurrentChatUser('Mama');">💙 Mama</div>
                <div class="member-badge mummy-badge" onclick="navigateTo('mummy'); setCurrentChatUser('Mummy');">💜 Mummy</div>
            </div>
        </div>

        <div class="content">
            <!-- HOME -->
            <div id="homePage" class="page active">
                <div class="home-layout">
                    <div class="home-row home-top">
                        <div class="widget" style="background: white; border: none; display: flex; justify-content: center; align-items: center; flex-direction: column; padding: 6px;">
                            <div style="font-size: 84px; font-weight: 900; color: #7B1FA2; font-family: 'Courier New'; letter-spacing: 3px;" id="clock">00:00</div>
                            <div style="font-size: 16px; color: #7B1FA2; margin-top: 4px; font-weight: 600;" id="dateDisplay">Monday, Jan 1</div>
                        </div>
                        <div class="widget" style="background: linear-gradient(135deg, #FFB3D9, #FF8FB3); border: none; color: white; justify-content: center; align-items: center; text-align: center; padding: 12px;">
                            <div style="font-size: 56px; font-weight: 900; letter-spacing: 0px; margin-bottom: 4px;">Chesed</div>
                            <div style="font-size: 16px; line-height: 1.5; margin-bottom: 6px; font-weight: 600;">We see others<br>We care<br>We act</div>
                            <div style="font-size: 48px;">🤍</div>
                        </div>
                    </div>

                    <div class="home-row home-middle">
                        <div class="widget weather-widget" style="background: linear-gradient(135deg, #E3F2FD, #BBDEFB); border-left: 4px solid #1565C0; position: relative; overflow: hidden;">
                            <div style="position: absolute; top: -10px; right: -10px; font-size: 60px; opacity: 0.15;">☀️</div>
                            <div class="widget-title weather">Weather</div>
                            <div class="widget-content" id="weather" style="font-size: 18px; color: #1565C0; line-height: 1.6;">
                                <div style="font-size: 24px;">☀️ 24°C</div>
                                <div style="font-size: 13px; color: #666; font-weight: 500;">Sunny</div>
                                <div style="font-size: 36px; margin-top: 3px;" id="moonEmoji">🌙</div>
                                <div style="font-size: 13px; color: #333; font-weight: 600;" id="moonPhase">Waxing</div>
                            </div>
                        </div>
                        <div class="widget todo-widget">
                            <div class="widget-title todo">To Do</div>
                            <input class="todo-input" id="todoInput" placeholder="Add..." style="margin-bottom: 6px; padding: 6px; font-size: 12px; border: 1px solid #ddd; border-radius: 4px;">
                            <button class="todo-btn" onclick="addTodo()" style="margin-bottom: 6px; padding: 6px; font-size: 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Add</button>
                            <div class="todo-list" id="todoList" style="font-size: 13px; flex: 1; overflow-y: auto;"></div>
                        </div>
                        <div class="widget chat-widget-container">
                            <div class="widget-title chat">💬 Family Chat</div>
                            <div class="chat-messages-box" id="chatMessagesBox"></div>
                            <div class="chat-input-box">
                                <input type="text" id="chatInputField" class="chat-input" placeholder="Type to chat..." onkeypress="if(event.key==='Enter') { sendChatMsg(); event.preventDefault(); }">
                                <button onclick="startVoiceChat()" class="chat-voice-btn">🎤 Listening</button>
                            </div>
                        </div>
                    </div>

                    <div class="home-row home-bottom">
                        <div class="widget event-widget" style="background: linear-gradient(135deg, #FFF3E0, #FFE0B2); border-left: 4px solid #F9A825; position: relative; overflow: hidden;">
                            <div style="position: absolute; top: -20px; right: -20px; font-size: 80px; opacity: 0.1;">🎉</div>
                            <div class="widget-title event">Next Event</div>
                            <div class="widget-content" id="event" style="font-size: 12px; line-height: 1.4;"></div>
                        </div>
                        <div class="widget wisdom-widget">
                            <div class="widget-title wisdom">Daily Wisdom</div>
                            <div class="widget-content" id="dailyWisdom" style="font-size: 26px; font-weight: normal; line-height: 1.5; padding: 2px;"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CALENDAR -->
            <div id="calendarPage" class="page">
                <div class="calendar-header">
                    <h2 id="calTitle">Calendar</h2>
                    <button class="view-btn" onclick="setView('week')">Week</button>
                    <button class="view-btn" onclick="setView('month')">Month</button>
                    <button class="nav-btn" onclick="prevMonth()">←</button>
                    <button class="nav-btn" onclick="nextMonth()">→</button>
                    <button class="nav-btn" onclick="today()" style="background: #7B1FA2;">Today</button>
                    <button class="nav-btn" onclick="navigateTo('home')" style="background: #2E7D32; margin-left: auto;">🏠 Home</button>
                </div>
                <div class="event-legend">
                    <div class="legend-item"><div class="legend-color event-school"></div> School</div>
                    <div class="legend-item"><div class="legend-color event-work"></div> Work</div>
                    <div class="legend-item"><div class="legend-color event-shabbat"></div> Shabbat</div>
                    <div class="legend-item"><div class="legend-color event-holiday"></div> Holiday</div>
                </div>
                <div class="calendar-content" id="calContent"></div>
            </div>

            <!-- SHOPPING -->
            <div id="shoppingPage" class="page" style="flex-direction: column; gap: 8px; padding: 8px; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: center; height: 32px; padding-bottom: 4px; border-bottom: 1px solid #ddd;">
                    <h2 style="font-size: 18px; margin: 0; color: #333;">🛒 Shopping & 💳 Bills</h2>
                    <button onclick="navigateTo('home')" style="padding: 6px 12px; background: #2E7D32; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 11px;">🏠 Home</button>
                </div>
                <div style="display: flex; gap: 8px; overflow: hidden; flex: 1;">
                <div style="flex: 1; background: white; border-radius: 8px; padding: 10px; border-left: 4px solid #E91E63; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; display: flex; flex-direction: column;">
                    <h2 style="font-size: 16px; margin: 0 0 8px 0; color: #E91E63;">🛒 Shopping</h2>
                    <input class="shopping-input" id="shopInput" placeholder="Add item..." style="padding: 6px; font-size: 11px; margin-bottom: 6px; border: 1px solid #ddd; border-radius: 4px;">
                    <button class="shopping-add-btn" onclick="addShop()" style="padding: 6px; font-size: 11px; margin-bottom: 6px; background: #E91E63; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Add</button>
                    <div class="shopping-list" id="shopList" style="flex: 1; overflow-y: auto; font-size: 11px;"></div>
                </div>
                <div style="flex: 1; background: white; border-radius: 8px; padding: 10px; border-left: 4px solid #FF9800; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; display: flex; flex-direction: column;">
                    <h2 style="font-size: 16px; margin: 0 0 8px 0; color: #FF9800;">💳 Bills</h2>
                    <input class="shopping-input" id="billInput" placeholder="Add bill..." style="padding: 6px; font-size: 11px; margin-bottom: 6px; border: 1px solid #ddd; border-radius: 4px;">
                    <button class="shopping-add-btn" onclick="addBill()" style="padding: 6px; font-size: 11px; margin-bottom: 6px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Add</button>
                    <div class="shopping-list" id="billList" style="flex: 1; overflow-y: auto; font-size: 11px;"></div>
                </div>
                </div>
            </div>

            <!-- ESTHER PAGE -->
            <div id="estherPage" class="page user-page" style="flex-direction: row; gap: 12px; padding: 10px;">
                <div class="user-section" style="border-color: #2E7D32; flex: 1.5;">
                    <h3 style="font-size: 18px; margin-bottom: 12px; color: #2E7D32;">🟢 Esther's Chores</h3>
                    <div id="estherChores" style="display: flex; flex-direction: column; gap: 8px; font-size: 14px; overflow-y: auto;"></div>
                </div>
                <div class="user-section" style="border-color: #2E7D32; flex: 1;">
                    <h3 style="font-size: 18px; margin-bottom: 12px; color: #2E7D32;">📅 Calendar</h3>
                    <p style="font-size: 13px; line-height: 1.8;">School 9-3pm Mon-Fri<br>Shabbat Fri evening<br>Homework time 4pm</p>
                </div>
                <div class="user-section" style="border-color: #2E7D32; flex: 1;">
                    <h3 style="font-size: 18px; margin-bottom: 12px; color: #2E7D32;">✅ To Do</h3>
                    <input class="shopping-input" id="estherTodoInput" placeholder="Add item..." style="font-size: 13px; padding: 8px; margin-bottom: 6px;">
                    <button class="shopping-add-btn" onclick="addEstherTodo()" style="font-size: 12px; padding: 8px; margin-bottom: 6px;">Add</button>
                    <div id="estherTodoList" style="font-size: 13px; overflow-y: auto;"></div>
                </div>
            </div>

            <!-- LOLA PAGE -->
            <div id="lolaPage" class="page user-page" style="flex-direction: row; gap: 12px; padding: 10px;">
                <div class="user-section" style="border-color: #00897B; flex: 1.5;">
                    <h3 style="font-size: 18px; margin-bottom: 12px; color: #00897B;">🔵 Lola's Chores</h3>
                    <div id="lolaChores" style="display: flex; flex-direction: column; gap: 8px; font-size: 14px; overflow-y: auto;"></div>
                </div>
                <div class="user-section" style="border-color: #00897B; flex: 1;">
                    <h3 style="font-size: 18px; margin-bottom: 12px; color: #00897B;">📅 Calendar</h3>
                </div>
                <div class="user-section" style="border-color: #00897B; flex: 1;">
                    <h3 style="font-size: 18px; margin-bottom: 12px; color: #00897B;">✅ To Do</h3>
                    <input class="shopping-input" id="lolaTodoInput" placeholder="Add item..." style="font-size: 13px; padding: 8px; margin-bottom: 6px;">
                    <button class="shopping-add-btn" onclick="addLolaTodo()" style="font-size: 12px; padding: 8px; margin-bottom: 6px;">Add</button>
                    <div id="lolaTodoList" style="font-size: 13px; overflow-y: auto;"></div>
                </div>
            </div>

            <!-- MAMA PAGE -->
            <div id="mamaPage" class="page user-page" style="flex-direction: row; gap: 12px; padding: 10px;">
                <div class="user-section" style="border-color: #1565C0; flex: 1;">
                    <h3 style="font-size: 18px; margin-bottom: 12px; color: #1565C0;">🛒 Shopping</h3>
                    <input class="shopping-input" id="mamaShopInput" placeholder="Add item..." style="font-size: 13px; padding: 8px; margin-bottom: 6px;">
                    <button class="shopping-add-btn" onclick="addMamaShop()" style="font-size: 12px; padding: 8px; margin-bottom: 6px;">Add</button>
                    <div id="mamaShopList" style="font-size: 13px; overflow-y: auto;"></div>
                </div>
                <div class="user-section" style="border-color: #1565C0; flex: 1;">
                    <h3 style="font-size: 18px; margin-bottom: 12px; color: #1565C0;">💳 Bills</h3>
                    <input class="shopping-input" id="mamaBillInput" placeholder="Add bill..." style="font-size: 13px; padding: 8px; margin-bottom: 6px;">
                    <button class="shopping-add-btn" onclick="addMamaBill()" style="font-size: 12px; padding: 8px; margin-bottom: 6px;">Add</button>
                    <div id="mamaBillList" style="font-size: 13px; overflow-y: auto;"></div>
                </div>
                <div class="user-section" style="border-color: #1565C0; flex: 1;">
                    <h3 style="font-size: 18px; margin-bottom: 12px; color: #1565C0;">📅 Calendar</h3>
                    <p style="font-size: 13px; line-height: 1.8;">Work 8:30-2pm<br>Pick up kids 2:30pm<br>Dinner prep 5pm<br>Family time 7pm</p>
                </div>
                <div class="user-section" style="border-color: #1565C0; flex: 1;">
                    <h3 style="font-size: 18px; margin-bottom: 12px; color: #1565C0;">✅ To Do</h3>
                    <input class="shopping-input" id="mamaTodoInput" placeholder="Add item..." style="font-size: 13px; padding: 8px; margin-bottom: 6px;">
                    <button class="shopping-add-btn" onclick="addMamaTodo()" style="font-size: 12px; padding: 8px; margin-bottom: 6px;">Add</button>
                    <div id="mamaTodoList" style="font-size: 13px; overflow-y: auto;"></div>
                </div>
            </div>

            <!-- REWARDS PAGE -->
            <div id="rewardsPage" class="page" style="flex-direction: column; gap: 8px; padding: 8px; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: center; height: 32px; padding-bottom: 4px; border-bottom: 1px solid #ddd;">
                    <h2 style="font-size: 18px; margin: 0; color: #333;">🎁 Rewards</h2>
                    <button onclick="navigateTo('home')" style="padding: 6px 12px; background: #2E7D32; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 11px;">🏠 Home</button>
                </div>
                <div style="display: flex; flex-direction: row; gap: 8px; overflow: hidden; flex: 1;">
                <div style="flex: 1; display: flex; flex-direction: column; gap: 12px; overflow: hidden;">
                    <!-- Esther Rewards -->
                    <div style="background: white; border-radius: 12px; padding: 14px; border-left: 4px solid #2E7D32; box-shadow: 0 2px 8px rgba(0,0,0,0.1); flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                        <h3 style="font-size: 18px; margin-bottom: 12px; color: #2E7D32;">🟢 Esther's Rewards</h3>
                        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                            <input id="estherRewardInput" placeholder="What do you want?" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 12px;">
                            <input id="estherRewardTokens" placeholder="Tokens" type="number" min="1" style="width: 70px; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 12px;">
                            <button onclick="addEstherReward()" style="padding: 8px 14px; background: #2E7D32; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;">Add</button>
                        </div>
                        <div id="estherRewardsList" style="flex: 1; overflow-y: auto; font-size: 12px;"></div>
                    </div>

                    <!-- Lola Rewards -->
                    <div style="background: white; border-radius: 12px; padding: 14px; border-left: 4px solid #00897B; box-shadow: 0 2px 8px rgba(0,0,0,0.1); flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                        <h3 style="font-size: 18px; margin-bottom: 12px; color: #00897B;">🔵 Lola's Rewards</h3>
                        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                            <input id="lolaRewardInput" placeholder="What do you want?" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 12px;">
                            <input id="lolaRewardTokens" placeholder="Tokens" type="number" min="1" style="width: 70px; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 12px;">
                            <button onclick="addLolaReward()" style="padding: 8px 14px; background: #00897B; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;">Add</button>
                        </div>
                        <div id="lolaRewardsList" style="flex: 1; overflow-y: auto; font-size: 12px;"></div>
                    </div>
                </div>

                <div style="flex: 1; display: flex; flex-direction: column; gap: 12px; overflow: hidden;">
                    <!-- Token Tracker -->
                    <div style="background: linear-gradient(135deg, #FFF3E0, #FFE0B2); border-radius: 12px; padding: 14px; border-left: 4px solid #F9A825; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <h3 style="font-size: 18px; margin-bottom: 12px; color: #F9A825;">🪙 Token Tracker</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div style="background: white; padding: 12px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 28px; font-weight: 900; color: #2E7D32;" id="estherTokens">0</div>
                                <div style="font-size: 12px; color: #666; font-weight: 600; margin-top: 4px;">Esther Tokens</div>
                            </div>
                            <div style="background: white; padding: 12px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 28px; font-weight: 900; color: #00897B;" id="lolaTokens">0</div>
                                <div style="font-size: 12px; color: #666; font-weight: 600; margin-top: 4px;">Lola Tokens</div>
                            </div>
                        </div>
                    </div>

                    <!-- Redeem Rewards -->
                    <div style="background: white; border-radius: 12px; padding: 14px; border-left: 4px solid #1565C0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                        <h3 style="font-size: 18px; margin-bottom: 12px; color: #1565C0;">✨ Redeem Rewards</h3>
                        <div style="font-size: 12px; margin-bottom: 8px; font-weight: 600;">Select a child to see their rewards:</div>
                        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                            <button onclick="showEstherRedeemable()" style="flex: 1; padding: 8px; background: #2E7D32; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;">Esther</button>
                            <button onclick="showLolaRedeemable()" style="flex: 1; padding: 8px; background: #00897B; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;">Lola</button>
                        </div>
                        <div id="redeemableList" style="flex: 1; overflow-y: auto; font-size: 12px;"></div>
                    </div>
                </div>
                </div>
            </div>

            <!-- MUMMY PAGE -->
            <div id="mummyPage" class="page user-page" style="flex-direction: row; gap: 12px; padding: 10px;">
                <div class="user-section" style="border-color: #7B1FA2; flex: 1;">
                    <h3 style="font-size: 18px; margin-bottom: 12px; color: #7B1FA2;">💳 Bills</h3>
                    <input class="shopping-input" id="mummyBillInput" placeholder="Add bill..." style="font-size: 13px; padding: 8px; margin-bottom: 6px;">
                    <button class="shopping-add-btn" onclick="addMummyBill()" style="font-size: 12px; padding: 8px; margin-bottom: 6px;">Add</button>
                    <div id="mummyBillList" style="font-size: 13px; overflow-y: auto;"></div>
                </div>
                <div class="user-section" style="border-color: #7B1FA2; flex: 1;">
                    <h3 style="font-size: 18px; margin-bottom: 12px; color: #7B1FA2;">📅 Calendar</h3>
                    <p style="font-size: 13px; line-height: 1.8;">Family planning<br>Shabbat prep<br>Community events<br>Family gatherings</p>
                </div>
                <div class="user-section" style="border-color: #7B1FA2; flex: 1;">
                    <h3 style="font-size: 18px; margin-bottom: 12px; color: #7B1FA2;">✅ To Do</h3>
                    <input class="shopping-input" id="mummyTodoInput" placeholder="Add item..." style="font-size: 13px; padding: 8px; margin-bottom: 6px;">
                    <button class="shopping-add-btn" onclick="addMummyTodo()" style="font-size: 12px; padding: 8px; margin-bottom: 6px;">Add</button>
                    <div id="mummyTodoList" style="font-size: 13px; overflow-y: auto;"></div>
                </div>
            </div>
        </div>

        <div class="bottom-nav">
            <button class="nav-item active" onclick="navigateTo('home')">Home</button>
            <button class="nav-item" onclick="navigateTo('calendar')">Calendar</button>
            <button class="nav-item" onclick="navigateTo('shopping')">Shopping</button>
            <button class="nav-item" onclick="navigateTo('rewards')">Rewards</button>
        </div>
    </div>

    <script>
        let choresData = {
            esther: JSON.parse(localStorage.getItem('estherChores')) || [
                { id: 1, task: "Do homework - Math", done: false },
                { id: 2, task: "Do homework - English", done: false },
                { id: 3, task: "Do homework - Other subjects", done: false },
                { id: 4, task: "Unpack school bag - Take out lunch box", done: false },
                { id: 5, task: "Unpack school bag - Take out books", done: false },
                { id: 6, task: "Unpack school bag - Take out uniform", done: false },
                { id: 7, task: "Put washing on - Collect dirty clothes", done: false },
                { id: 8, task: "Put washing on - Put in washing machine", done: false },
                { id: 9, task: "Put washing on - Add detergent", done: false },
                { id: 10, task: "Shower - Wash whole body", done: false },
                { id: 11, task: "Shower - Wash behind ears", done: false },
                { id: 12, task: "Shower - Dry off and get dressed", done: false },
                { id: 13, task: "Wash hair (once a week) - Wet hair", done: false },
                { id: 14, task: "Wash hair (once a week) - Apply shampoo", done: false },
                { id: 15, task: "Wash hair (once a week) - Rinse thoroughly", done: false },
                { id: 16, task: "Put rubbish in bin - Collect rubbish", done: false },
                { id: 17, task: "Put rubbish in bin - Put in bin", done: false }
            ],
            lola: JSON.parse(localStorage.getItem('lolaChores')) || [
                { id: 1, task: "Put rubbish in bin - Find rubbish", done: false },
                { id: 2, task: "Put rubbish in bin - Walk to bin", done: false },
                { id: 3, task: "Put rubbish in bin - Throw in", done: false },
                { id: 4, task: "Put plates and cups in sink - Carry plate", done: false },
                { id: 5, task: "Put plates and cups in sink - Carry cup", done: false },
                { id: 6, task: "Put plates and cups in sink - Put in sink gently", done: false },
                { id: 7, task: "Shower - Get undressed", done: false },
                { id: 8, task: "Shower - Wet body with water", done: false },
                { id: 9, task: "Shower - Wash face", done: false },
                { id: 10, task: "Shower - Wash arms and legs", done: false },
                { id: 11, task: "Shower - Wash tummy and back", done: false },
                { id: 12, task: "Shower - Rinse all soap off", done: false },
                { id: 13, task: "Shower - Dry off", done: false },
                { id: 14, task: "Put nappy in bin - Get dirty nappy", done: false },
                { id: 15, task: "Put nappy in bin - Roll up nappy", done: false },
                { id: 16, task: "Put nappy in bin - Put in bin", done: false },
                { id: 17, task: "Clean toys - Pick up toys from floor", done: false },
                { id: 18, task: "Clean toys - Wipe toys with cloth", done: false },
                { id: 19, task: "Clean toys - Put toys in toy box", done: false }
            ]
        };

        function renderChores(child) {
            const container = document.getElementById(child + 'Chores');
            if (!container) return; // Exit if element doesn't exist
            const chores = choresData[child];
            let html = '';
            
            chores.forEach(chore => {
                const completed = chore.done ? 'opacity: 0.6; text-decoration: line-through;' : '';
                html += `<div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #f5f5f5; border-radius: 6px; ${completed}">
                    <input type="checkbox" ${chore.done ? 'checked' : ''} onchange="toggleChore('${child}', ${chore.id})" style="width: 22px; height: 22px; cursor: pointer;">
                    <span style="flex: 1; font-size: 15px; font-weight: 500;">${chore.task}</span>
                </div>`;
            });
            
            container.innerHTML = html;
        }

        function toggleChore(child, id) {
            const chore = choresData[child].find(c => c.id === id);
            if (chore) {
                chore.done = !chore.done;
                if (chore.done) {
                    // Award 1 token per completed chore
                    if (child === 'esther') {
                        estherTokens += 1;
                        localStorage.setItem('estherTokens', estherTokens);
                        updateTokenDisplay();
                    } else if (child === 'lola') {
                        lolaTokens += 1;
                        localStorage.setItem('lolaTokens', lolaTokens);
                        updateTokenDisplay();
                    }
                }
                localStorage.setItem(child + 'Chores', JSON.stringify(choresData[child]));
                renderChores(child);
            }
        }
        let estherRewards = JSON.parse(localStorage.getItem('estherRewards')) || [];
        let lolaRewards = JSON.parse(localStorage.getItem('lolaRewards')) || [];
        let estherTokens = parseInt(localStorage.getItem('estherTokens')) || 0;
        let lolaTokens = parseInt(localStorage.getItem('lolaTokens')) || 0;
        let shop = JSON.parse(localStorage.getItem('shop')) || [];
        let bills = JSON.parse(localStorage.getItem('bills')) || [];

        function addEstherReward() {
            const reward = document.getElementById('estherRewardInput').value.trim();
            const tokens = parseInt(document.getElementById('estherRewardTokens').value) || 0;
            if (reward && tokens > 0) {
                estherRewards.push({id: Date.now(), reward: reward, tokens: tokens});
                localStorage.setItem('estherRewards', JSON.stringify(estherRewards));
                document.getElementById('estherRewardInput').value = '';
                document.getElementById('estherRewardTokens').value = '';
                renderEstherRewards();
            }
        }

        function renderEstherRewards() {
            const el = document.getElementById('estherRewardsList');
            if (el) el.innerHTML = estherRewards.map(r => 
                `<div style="padding: 8px; background: #f5f5f5; margin-bottom: 6px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                    <div><strong>${r.reward}</strong><br><span style="color: #666;">${r.tokens} tokens</span></div>
                    <button onclick="delEstherReward(${r.id})" style="padding: 4px 8px; background: #FF6B6B; color: white; border: none; border-radius: 3px; font-size: 11px; cursor: pointer;">Delete</button>
                </div>`
            ).join('');
        }

        function delEstherReward(id) {
            estherRewards = estherRewards.filter(r => r.id !== id);
            localStorage.setItem('estherRewards', JSON.stringify(estherRewards));
            renderEstherRewards();
        }

        function addLolaReward() {
            const reward = document.getElementById('lolaRewardInput').value.trim();
            const tokens = parseInt(document.getElementById('lolaRewardTokens').value) || 0;
            if (reward && tokens > 0) {
                lolaRewards.push({id: Date.now(), reward: reward, tokens: tokens});
                localStorage.setItem('lolaRewards', JSON.stringify(lolaRewards));
                document.getElementById('lolaRewardInput').value = '';
                document.getElementById('lolaRewardTokens').value = '';
                renderLolaRewards();
            }
        }

        function renderLolaRewards() {
            const el = document.getElementById('lolaRewardsList');
            if (el) el.innerHTML = lolaRewards.map(r => 
                `<div style="padding: 8px; background: #f5f5f5; margin-bottom: 6px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                    <div><strong>${r.reward}</strong><br><span style="color: #666;">${r.tokens} tokens</span></div>
                    <button onclick="delLolaReward(${r.id})" style="padding: 4px 8px; background: #FF6B6B; color: white; border: none; border-radius: 3px; font-size: 11px; cursor: pointer;">Delete</button>
                </div>`
            ).join('');
        }

        function delLolaReward(id) {
            lolaRewards = lolaRewards.filter(r => r.id !== id);
            localStorage.setItem('lolaRewards', JSON.stringify(lolaRewards));
            renderLolaRewards();
        }

        function updateTokenDisplay() {
            const estherTokensEl = document.getElementById('estherTokens');
            const lolaTokensEl = document.getElementById('lolaTokens');
            if (estherTokensEl) estherTokensEl.textContent = estherTokens;
            if (lolaTokensEl) lolaTokensEl.textContent = lolaTokens;
        }

        function showEstherRedeemable() {
            const el = document.getElementById('redeemableList');
            if (!el) return;
            let html = '<div style="font-size: 13px;">';
            estherRewards.forEach(r => {
                const canRedeem = estherTokens >= r.tokens;
                html += `<div style="padding: 8px; background: ${canRedeem ? '#e8f5e9' : '#ffebee'}; margin-bottom: 6px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                    <div><strong>${r.reward}</strong><br><span style="color: #666; font-size: 11px;">${r.tokens} tokens</span></div>
                    <button onclick="redeemEsther(${r.tokens}, ${r.id})" ${!canRedeem ? 'disabled' : ''} style="padding: 6px 10px; background: ${canRedeem ? '#4CAF50' : '#ccc'}; color: white; border: none; border-radius: 3px; font-size: 11px; cursor: ${canRedeem ? 'pointer' : 'not-allowed'};">Redeem</button>
                </div>`;
            });
            html += '</div>';
            el.innerHTML = html;
        }

        function showLolaRedeemable() {
            const el = document.getElementById('redeemableList');
            if (!el) return;
            let html = '<div style="font-size: 13px;">';
            lolaRewards.forEach(r => {
                const canRedeem = lolaTokens >= r.tokens;
                html += `<div style="padding: 8px; background: ${canRedeem ? '#e0f2f1' : '#ffebee'}; margin-bottom: 6px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                    <div><strong>${r.reward}</strong><br><span style="color: #666; font-size: 11px;">${r.tokens} tokens</span></div>
                    <button onclick="redeemLola(${r.tokens}, ${r.id})" ${!canRedeem ? 'disabled' : ''} style="padding: 6px 10px; background: ${canRedeem ? '#4CAF50' : '#ccc'}; color: white; border: none; border-radius: 3px; font-size: 11px; cursor: ${canRedeem ? 'pointer' : 'not-allowed'};">Redeem</button>
                </div>`;
            });
            html += '</div>';
            el.innerHTML = html;
        }

        function redeemEsther(tokens, rewardId) {
            if (estherTokens >= tokens) {
                estherTokens -= tokens;
                localStorage.setItem('estherTokens', estherTokens);
                updateTokenDisplay();
                showEstherRedeemable();
                alert('🎉 Reward redeemed! Esther now has ' + estherTokens + ' tokens left!');
            }
        }

        function redeemLola(tokens, rewardId) {
            if (lolaTokens >= tokens) {
                lolaTokens -= tokens;
                localStorage.setItem('lolaTokens', lolaTokens);
                updateTokenDisplay();
                showLolaRedeemable();
                alert('🎉 Reward redeemed! Lola now has ' + lolaTokens + ' tokens left!');
            }
        }
        let todos = JSON.parse(localStorage.getItem('todos')) || [];
        let estherTodos = JSON.parse(localStorage.getItem('estherTodos')) || [];
        let lolaTodos = JSON.parse(localStorage.getItem('lolaTodos')) || [];
        let mamaTodos = JSON.parse(localStorage.getItem('mamaTodos')) || [];
        let mummyTodos = JSON.parse(localStorage.getItem('mummyTodos')) || [];
        let mamaShop = JSON.parse(localStorage.getItem('mamaShop')) || [];
        let mamaBills = JSON.parse(localStorage.getItem('mamaBills')) || [];
        let mummyShop = JSON.parse(localStorage.getItem('mummyShop')) || [];
        let mummyBills = JSON.parse(localStorage.getItem('mummyBills')) || [];

        function addEstherTodo() { const v = document.getElementById('estherTodoInput').value.trim(); if (v) { estherTodos.push({id: Date.now(), text: v, done: false}); localStorage.setItem('estherTodos', JSON.stringify(estherTodos)); document.getElementById('estherTodoInput').value = ''; renderEstherTodos(); } }
        function renderEstherTodos() { document.getElementById('estherTodoList').innerHTML = estherTodos.map(t => `<div style="padding: 6px; background: #f5f5f5; margin-bottom: 4px; border-radius: 4px; display: flex; gap: 6px; align-items: center;"><input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleEstherTodo(${t.id})" style="width: 18px;"><span style="flex:1; ${t.done ? 'opacity: 0.6; text-decoration: line-through;' : ''}">${t.text}</span><button onclick="delEstherTodo(${t.id})" style="padding: 2px 6px; background: #FF6B6B; color: white; border: none; border-radius: 3px; font-size: 11px; cursor: pointer;">X</button></div>`).join(''); }
        function toggleEstherTodo(id) { estherTodos.find(t => t.id === id).done = !estherTodos.find(t => t.id === id).done; localStorage.setItem('estherTodos', JSON.stringify(estherTodos)); renderEstherTodos(); }
        function delEstherTodo(id) { estherTodos = estherTodos.filter(t => t.id !== id); localStorage.setItem('estherTodos', JSON.stringify(estherTodos)); renderEstherTodos(); }

        function addLolaTodo() { const v = document.getElementById('lolaTodoInput').value.trim(); if (v) { lolaTodos.push({id: Date.now(), text: v, done: false}); localStorage.setItem('lolaTodos', JSON.stringify(lolaTodos)); document.getElementById('lolaTodoInput').value = ''; renderLolaTodos(); } }
        function renderLolaTodos() { document.getElementById('lolaTodoList').innerHTML = lolaTodos.map(t => `<div style="padding: 6px; background: #f5f5f5; margin-bottom: 4px; border-radius: 4px; display: flex; gap: 6px; align-items: center;"><input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleLolaTodo(${t.id})" style="width: 18px;"><span style="flex:1; ${t.done ? 'opacity: 0.6; text-decoration: line-through;' : ''}">${t.text}</span><button onclick="delLolaTodo(${t.id})" style="padding: 2px 6px; background: #FF6B6B; color: white; border: none; border-radius: 3px; font-size: 11px; cursor: pointer;">X</button></div>`).join(''); }
        function toggleLolaTodo(id) { lolaTodos.find(t => t.id === id).done = !lolaTodos.find(t => t.id === id).done; localStorage.setItem('lolaTodos', JSON.stringify(lolaTodos)); renderLolaTodos(); }
        function delLolaTodo(id) { lolaTodos = lolaTodos.filter(t => t.id !== id); localStorage.setItem('lolaTodos', JSON.stringify(lolaTodos)); renderLolaTodos(); }

        function addMamaTodo() { const v = document.getElementById('mamaTodoInput').value.trim(); if (v) { mamaTodos.push({id: Date.now(), text: v, done: false}); localStorage.setItem('mamaTodos', JSON.stringify(mamaTodos)); document.getElementById('mamaTodoInput').value = ''; renderMamaTodos(); } }
        function renderMamaTodos() { document.getElementById('mamaTodoList').innerHTML = mamaTodos.map(t => `<div style="padding: 6px; background: #f5f5f5; margin-bottom: 4px; border-radius: 4px; display: flex; gap: 6px; align-items: center;"><input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleMamaTodo(${t.id})" style="width: 18px;"><span style="flex:1; ${t.done ? 'opacity: 0.6; text-decoration: line-through;' : ''}">${t.text}</span><button onclick="delMamaTodo(${t.id})" style="padding: 2px 6px; background: #FF6B6B; color: white; border: none; border-radius: 3px; font-size: 11px; cursor: pointer;">X</button></div>`).join(''); }
        function toggleMamaTodo(id) { mamaTodos.find(t => t.id === id).done = !mamaTodos.find(t => t.id === id).done; localStorage.setItem('mamaTodos', JSON.stringify(mamaTodos)); renderMamaTodos(); }
        function delMamaTodo(id) { mamaTodos = mamaTodos.filter(t => t.id !== id); localStorage.setItem('mamaTodos', JSON.stringify(mamaTodos)); renderMamaTodos(); }

        function addMummyTodo() { const v = document.getElementById('mummyTodoInput').value.trim(); if (v) { mummyTodos.push({id: Date.now(), text: v, done: false}); localStorage.setItem('mummyTodos', JSON.stringify(mummyTodos)); document.getElementById('mummyTodoInput').value = ''; renderMummyTodos(); } }
        function renderMummyTodos() { document.getElementById('mummyTodoList').innerHTML = mummyTodos.map(t => `<div style="padding: 6px; background: #f5f5f5; margin-bottom: 4px; border-radius: 4px; display: flex; gap: 6px; align-items: center;"><input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleMummyTodo(${t.id})" style="width: 18px;"><span style="flex:1; ${t.done ? 'opacity: 0.6; text-decoration: line-through;' : ''}">${t.text}</span><button onclick="delMummyTodo(${t.id})" style="padding: 2px 6px; background: #FF6B6B; color: white; border: none; border-radius: 3px; font-size: 11px; cursor: pointer;">X</button></div>`).join(''); }
        function toggleMummyTodo(id) { mummyTodos.find(t => t.id === id).done = !mummyTodos.find(t => t.id === id).done; localStorage.setItem('mummyTodos', JSON.stringify(mummyTodos)); renderMummyTodos(); }
        function delMummyTodo(id) { mummyTodos = mummyTodos.filter(t => t.id !== id); localStorage.setItem('mummyTodos', JSON.stringify(mummyTodos)); renderMummyTodos(); }

        function addMamaShop() { const v = document.getElementById('mamaShopInput').value.trim(); if (v) { mamaShop.push({id: Date.now(), item: v}); localStorage.setItem('mamaShop', JSON.stringify(mamaShop)); document.getElementById('mamaShopInput').value = ''; renderMamaShop(); } }
        function renderMamaShop() { document.getElementById('mamaShopList').innerHTML = mamaShop.map(s => `<div style="padding: 6px; background: #f5f5f5; margin-bottom: 4px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;"><span>• ${s.item}</span><button onclick="delMamaShop(${s.id})" style="padding: 2px 6px; background: #FF6B6B; color: white; border: none; border-radius: 3px; font-size: 11px; cursor: pointer;">Remove</button></div>`).join(''); }
        function delMamaShop(id) { mamaShop = mamaShop.filter(s => s.id !== id); localStorage.setItem('mamaShop', JSON.stringify(mamaShop)); renderMamaShop(); }

        function addMamaBill() { const v = document.getElementById('mamaBillInput').value.trim(); if (v) { mamaBills.push({id: Date.now(), bill: v}); localStorage.setItem('mamaBills', JSON.stringify(mamaBills)); document.getElementById('mamaBillInput').value = ''; renderMamaBill(); } }
        function renderMamaBill() { document.getElementById('mamaBillList').innerHTML = mamaBills.map(b => `<div style="padding: 6px; background: #f5f5f5; margin-bottom: 4px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;"><span>💳 ${b.bill}</span><button onclick="delMamaBill(${b.id})" style="padding: 2px 6px; background: #FF6B6B; color: white; border: none; border-radius: 3px; font-size: 11px; cursor: pointer;">Remove</button></div>`).join(''); }
        function delMamaBill(id) { mamaBills = mamaBills.filter(b => b.id !== id); localStorage.setItem('mamaBills', JSON.stringify(mamaBills)); renderMamaBill(); }

        function addMummyShop() { const v = document.getElementById('mummyShopInput').value.trim(); if (v) { mummyShop.push({id: Date.now(), item: v}); localStorage.setItem('mummyShop', JSON.stringify(mummyShop)); document.getElementById('mummyShopInput').value = ''; renderMummyShop(); } }
        function renderMummyShop() { document.getElementById('mummyShopList').innerHTML = mummyShop.map(s => `<div style="padding: 6px; background: #f5f5f5; margin-bottom: 4px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;"><span>• ${s.item}</span><button onclick="delMummyShop(${s.id})" style="padding: 2px 6px; background: #FF6B6B; color: white; border: none; border-radius: 3px; font-size: 11px; cursor: pointer;">Remove</button></div>`).join(''); }
        function delMummyShop(id) { mummyShop = mummyShop.filter(s => s.id !== id); localStorage.setItem('mummyShop', JSON.stringify(mummyShop)); renderMummyShop(); }

        function addMummyBill() { const v = document.getElementById('mummyBillInput').value.trim(); if (v) { mummyBills.push({id: Date.now(), bill: v}); localStorage.setItem('mummyBills', JSON.stringify(mummyBills)); document.getElementById('mummyBillInput').value = ''; renderMummyBill(); } }
        function renderMummyBill() { document.getElementById('mummyBillList').innerHTML = mummyBills.map(b => `<div style="padding: 6px; background: #f5f5f5; margin-bottom: 4px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;"><span>💳 ${b.bill}</span><button onclick="delMummyBill(${b.id})" style="padding: 2px 6px; background: #FF6B6B; color: white; border: none; border-radius: 3px; font-size: 11px; cursor: pointer;">Remove</button></div>`).join(''); }
        function delMummyBill(id) { mummyBills = mummyBills.filter(b => b.id !== id); localStorage.setItem('mummyBills', JSON.stringify(mummyBills)); renderMummyBill(); }
        let calView = 'month';
        let calDate = new Date();

        function navigateTo(p) {
            document.querySelectorAll('.page').forEach(e => e.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
            if (p === 'home') {
                document.getElementById('homePage').classList.add('active');
                document.querySelector('.nav-item').classList.add('active');
            } else if (p === 'calendar') {
                document.getElementById('calendarPage').classList.add('active');
                document.querySelectorAll('.nav-item')[1].classList.add('active');
                renderCal();
            } else if (p === 'shopping') {
                document.getElementById('shoppingPage').classList.add('active');
                document.querySelectorAll('.nav-item')[2].classList.add('active');
                renderShop();
            } else if (p === 'rewards') {
                document.getElementById('rewardsPage').classList.add('active');
                document.querySelectorAll('.nav-item')[3].classList.add('active');
                updateTokenDisplay();
            } else {
                document.getElementById(p + 'Page').classList.add('active');
            }
        }

        function addTodo() {
            const v = document.getElementById('todoInput').value.trim();
            if (v) { todos.push({id: Date.now(), text: v, done: false}); localStorage.setItem('todos', JSON.stringify(todos)); document.getElementById('todoInput').value = ''; renderTodos(); }
        }

        function renderTodos() {
            const el = document.getElementById('todoList');
            if (el) el.innerHTML = todos.map(t => `<div class="todo-item"><input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTodo(${t.id})"><span style="flex:1">${t.text}</span><button onclick="delTodo(${t.id})" style="padding:2px 6px; font-size:10px;">X</button></div>`).join('');
        }

        function toggleTodo(id) { todos.find(t => t.id === id).done = !todos.find(t => t.id === id).done; localStorage.setItem('todos', JSON.stringify(todos)); renderTodos(); }
        function delTodo(id) { todos = todos.filter(t => t.id !== id); localStorage.setItem('todos', JSON.stringify(todos)); renderTodos(); }

        function addShop() { const v = document.getElementById('shopInput').value.trim(); if (v) { shop.push({id: Date.now(), item: v}); localStorage.setItem('shop', JSON.stringify(shop)); document.getElementById('shopInput').value = ''; renderShop(); } }
        function renderShop() { 
            const el = document.getElementById('shopList');
            if (el) el.innerHTML = shop.map(s => `<div class="shopping-item"><span>• ${s.item}</span><button onclick="delShop(${s.id})">Remove</button></div>`).join(''); 
        }
        function delShop(id) { shop = shop.filter(s => s.id !== id); localStorage.setItem('shop', JSON.stringify(shop)); renderShop(); }

        function addBill() { const v = document.getElementById('billInput').value.trim(); if (v) { bills.push({id: Date.now(), bill: v}); localStorage.setItem('bills', JSON.stringify(bills)); document.getElementById('billInput').value = ''; renderBill(); } }
        function renderBill() { 
            const el = document.getElementById('billList');
            if (el) el.innerHTML = bills.map(b => `<div class="shopping-item"><span>💳 ${b.bill}</span><button onclick="delBill(${b.id})">Remove</button></div>`).join(''); 
        }
        function delBill(id) { bills = bills.filter(b => b.id !== id); localStorage.setItem('bills', JSON.stringify(bills)); renderBill(); }

        function setView(v) { calView = v; renderCal(); }
        function prevMonth() { calDate.setMonth(calDate.getMonth() - 1); renderCal(); }
        function nextMonth() { calDate.setMonth(calDate.getMonth() + 1); renderCal(); }
        function today() { calDate = new Date(); renderCal(); }

        function renderCal() {
            if (calView === 'month') renderMonth();
            else renderWeek();
        }

        function renderMonth() {
            const y = calDate.getFullYear(), m = calDate.getMonth();
            const fd = new Date(y, m, 1).getDay(), ld = new Date(y, m + 1, 0).getDate();
            let html = '<div class="month-grid">';
            ['S','M','T','W','T','F','S'].forEach(d => html += `<div style="font-weight:700;text-align:center;padding:4px;background:#f0f0f0;border-radius:4px;font-size:11px;">${d}</div>`);
            for (let i = 0; i < fd; i++) html += '<div></div>';
            for (let d = 1; d <= ld; d++) {
                const date = new Date(y, m, d);
                const today = new Date().toDateString() === date.toDateString();
                let events = '';
                if ([5].includes(date.getDay())) events += '<div class="month-event event-shabbat">Shabbat</div>';
                if (date.getDay() !== 0 && date.getDay() !== 6 && isSchoolTerm(date)) events += '<div class="month-event event-school">🏫</div>';
                if ([1,2,3,4,5].includes(date.getDay())) events += '<div class="month-event event-work">💼</div>';
                html += `<div class="month-day ${today ? 'today' : ''}"><div class="month-day-num">${d}</div>${events}</div>`;
            }
            html += '</div>';
            document.getElementById('calContent').innerHTML = html;
            document.getElementById('calTitle').textContent = new Date(y, m).toLocaleDateString('en-AU', {month:'long', year:'numeric'});
        }

        function renderWeek() {
            const start = new Date(calDate);
            start.setDate(calDate.getDate() - calDate.getDay());
            
            let timeSlots = [];
            for (let h = 8; h <= 18; h++) {
                timeSlots.push(h);
            }
            
            let html = '<div style="display: flex; height: 100%; overflow: hidden;">';
            
            // Time column
            html += '<div style="width: 60px; border-right: 2px solid #eee; flex-shrink: 0; overflow-y: auto;">';
            html += '<div style="height: 40px;"></div>';
            timeSlots.forEach(h => {
                html += `<div style="height: 80px; text-align: center; font-size: 11px; font-weight: 600; color: #999; padding-top: 4px; border-bottom: 1px solid #eee;">${h}:00</div>`;
            });
            html += '</div>';
            
            // Days columns
            html += '<div style="flex: 1; display: grid; grid-template-columns: repeat(7, 1fr); gap: 0; overflow-y: auto;">';
            
            for (let i = 0; i < 7; i++) {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                const today = new Date().toDateString() === d.toDateString();
                const dn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
                const colors = ['#2E7D32', '#00897B', '#1565C0', '#7B1FA2', '#F9A825', '#FF6B6B', '#FF9800'];
                
                html += `<div style="border-right: 1px solid #eee; ${today ? 'background: rgba(249, 168, 37, 0.05);' : ''}">
                    <div style="font-weight: 700; text-align: center; padding: 8px; border-bottom: 2px solid #eee; font-size: 12px; background: ${colors[i]}; color: white;">${dn} ${d.getDate()}</div>
                    <div style="position: relative; height: ${timeSlots.length * 80}px; padding: 4px;">`;
                
                // School - Mon-Fri 9am-3pm - starts at 9am (80px down)
                if (d.getDay() !== 0 && d.getDay() !== 6 && isSchoolTerm(d)) {
                    const topPos = (9 - 8) * 80; // Start at 9am
                    html += `<div style="position: absolute; top: ${topPos}px; left: 8px; right: 8px; height: 50px; background: #2E7D32; color: white; border-radius: 4px; padding: 6px; font-size: 9px; font-weight: 600;">🏫 School<br>9:00am - 3:00pm</div>`;
                }
                
                // Work - Mon-Fri 8:30am-2pm - starts at 8:30am
                if ([1,2,3,4,5].includes(d.getDay())) {
                    const topPos = (8.5 - 8) * 80; // Start at 8:30am
                    html += `<div style="position: absolute; top: ${topPos}px; left: 8px; right: 8px; height: 50px; background: #1565C0; color: white; border-radius: 4px; padding: 6px; font-size: 9px; font-weight: 600;">💼 Work<br>8:30am - 2:00pm</div>`;
                }
                
                // Shabbat - Friday evening (17:00 = 5pm)
                if (d.getDay() === 5) {
                    const topPos = (17 - 8) * 80; // Start at 5pm
                    html += `<div style="position: absolute; top: ${topPos}px; left: 8px; right: 8px; height: 50px; background: #7B1FA2; color: white; border-radius: 4px; padding: 6px; font-size: 9px; font-weight: 600;">🕯️ Shabbat<br>5:00pm</div>`;
                }
                
                html += '</div></div>';
            }
            
            html += '</div></div>';
            document.getElementById('calContent').innerHTML = html;
            document.getElementById('calTitle').textContent = `Week of ${start.toLocaleDateString('en-AU', {month:'short', day:'numeric', year:'numeric'})}`;
        }

        function isSchoolTerm(d) {
            const terms = [[new Date(2025,0,27), new Date(2025,3,11)], [new Date(2025,3,28), new Date(2025,6,4)], [new Date(2025,6,21), new Date(2025,8,26)], [new Date(2025,8,29), new Date(2025,11,12)]];
            return terms.some(t => d >= t[0] && d <= t[1]);
        }

        function getMoonPhase() {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const day = now.getDate();
            
            // Known new moon date: January 29, 2025
            const knownNewMoon = new Date(2025, 0, 29);
            const lunarCycle = 29.53; // days
            
            const diffTime = Math.abs(now - knownNewMoon);
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            const daysInCycle = diffDays % lunarCycle;
            
            const phases = [
                { name: "New Moon", emoji: "🌑", range: [0, 1.84] },
                { name: "Waxing Crescent", emoji: "🌒", range: [1.84, 7.38] },
                { name: "First Quarter", emoji: "🌓", range: [7.38, 9.23] },
                { name: "Waxing Gibbous", emoji: "🌔", range: [9.23, 14.77] },
                { name: "Full Moon", emoji: "🌕", range: [14.77, 16.61] },
                { name: "Waning Gibbous", emoji: "🌖", range: [16.61, 22.15] },
                { name: "Last Quarter", emoji: "🌗", range: [22.15, 23.99] },
                { name: "Waning Crescent", emoji: "🌘", range: [23.99, 29.53] }
            ];
            
            for (let phase of phases) {
                if (daysInCycle >= phase.range[0] && daysInCycle < phase.range[1]) {
                    return { name: phase.name, emoji: phase.emoji };
                }
            }
            return { name: "New Moon", emoji: "🌑" };
        }
        
        function updateMoonPhase() {
            const phase = getMoonPhase();
            document.getElementById('moonEmoji').textContent = phase.emoji;
            document.getElementById('moonPhase').textContent = phase.name;
        }
        
        function updateClock() {
            const now = new Date();
            const h = (now.getHours() % 12 || 12).toString().padStart(2, '0');
            const m = now.getMinutes().toString().padStart(2, '0');
            document.getElementById('clock').textContent = `${h}:${m}`;
            
            const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
            const monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][now.getMonth()];
            const dateStr = `${dayName}, ${now.getDate()} ${monthName} ${now.getFullYear()}`;
            document.getElementById('dateDisplay').textContent = dateStr;
        }

        const jewishWisdom = [
            { author: "Hillel", teaching: "Do not do unto others that which is hateful to you.", practice: "💡 Help someone carry something heavy today." },
            { author: "Pirkei Avot", teaching: "Who is rich? One happy with their portion.", practice: "💡 Thank your family for 3 things you're grateful for." },
            { author: "Talmud", teaching: "To save one life is to save the whole world.", practice: "💡 Help someone who is sad or hurt." },
            { author: "Baal Shem Tov", teaching: "In every person there is a spark to kindle.", practice: "💡 Tell someone something good you see in them." },
            { author: "Tikkun Olam", teaching: "Every person has power to change the world.", practice: "💡 Do one kind thing without being asked." },
            { author: "Jewish Wisdom", teaching: "Kindness is the language the deaf can hear.", practice: "💡 Give someone a big smile or hug today." },
            { author: "Deuteronomy", teaching: "Choose life and good for your children.", practice: "💡 Make one good choice today." },
            { author: "Pirkei Avot", teaching: "Do not judge until you stand in their place.", practice: "💡 Ask someone why before getting upset." },
            { author: "Pirkei Avot", teaching: "The world is sustained by justice, truth, peace.", practice: "💡 Tell the truth even when it's hard." },
            { author: "Jewish Wisdom", teaching: "Listen more than you speak.", practice: "💡 Listen to someone without interrupting." },
            { author: "Pirkei Avot", teaching: "We are not obligated to complete the work.", practice: "💡 Do your best on one task today." },
            { author: "Maimonides", teaching: "The highest level of charity is helping someone become independent.", practice: "💡 Teach someone how to do something new." },
            { author: "Jewish Wisdom", teaching: "Your words have power; use them wisely.", practice: "💡 Say only kind words today." },
            { author: "Pirkei Avot", teaching: "Stand with those who need you.", practice: "💡 Sit with someone who feels lonely." },
            { author: "Jewish Wisdom", teaching: "Together we are stronger; alone we are weaker.", practice: "💡 Work as a team on one task." },
            { author: "Pirkei Avot", teaching: "A smile costs nothing but gives so much.", practice: "💡 Smile at someone new you meet." },
            { author: "Talmud", teaching: "Help your neighbor before helping yourself.", practice: "💡 Ask if someone needs help first." },
            { author: "Pirkei Avot", teaching: "Patience is the fruit of wisdom.", practice: "💡 Take deep breaths when frustrated." },
            { author: "Jewish Wisdom", teaching: "Peace begins in the heart.", practice: "💡 Calm yourself before speaking in anger." },
            { author: "Jewish Wisdom", teaching: "Let your actions speak louder than words.", practice: "💡 Show respect through your actions." },
            { author: "Jewish Wisdom", teaching: "Give with an open heart, not a full hand.", practice: "💡 Share something you love with someone." },
            { author: "Jewish Wisdom", teaching: "See the good in everyone.", practice: "💡 Find one good thing in each person." },
            { author: "Jewish Wisdom", teaching: "Forgiveness is the greatest gift.", practice: "💡 Say 'I'm sorry' and truly mean it." },
            { author: "Jewish Wisdom", teaching: "Speak truth with kindness always.", practice: "💡 Be honest but gentle in what you say." },
            { author: "Jewish Wisdom", teaching: "Your character is built through small acts.", practice: "💡 Do one small good deed today." },
            { author: "Jewish Wisdom", teaching: "Celebrate others' joy as your own.", practice: "💡 Cheer for someone else's success." },
            { author: "Jewish Wisdom", teaching: "Honesty and integrity build trust.", practice: "💡 Keep a promise you make today." },
            { author: "Jewish Wisdom", teaching: "We rise by lifting others.", practice: "💡 Help someone do something hard." },
            { author: "Jewish Wisdom", teaching: "Live today as if it were your last.", practice: "💡 Spend quality time with family today." },
            { author: "Jewish Wisdom", teaching: "Judge people by how they treat others.", practice: "💡 Notice how people treat those who can't help them." },
            { author: "Jewish Wisdom", teaching: "Shabbat is time for family and peace.", practice: "💡 Enjoy a family meal together." },
            { author: "Jewish Wisdom", teaching: "Every moment is a chance to be kind.", practice: "💡 Choose kindness in every moment." },
            { author: "Maimonides", teaching: "Respect your parents, your community, your heritage.", practice: "💡 Thank your parents or elders." },
            { author: "Jewish Wisdom", teaching: "Education and learning are treasures.", practice: "💡 Learn one new thing today." },
            { author: "Pirkei Avot", teaching: "Make wisdom your friend.", practice: "💡 Ask someone wise for advice." },
            { author: "Torah", teaching: "Love your neighbor as yourself.", practice: "💡 Treat someone exactly as you want to be treated." },
            { author: "Jewish Wisdom", teaching: "Your family is your greatest treasure.", practice: "💡 Tell your family you love them." },
            { author: "Pirkei Avot", teaching: "Who is strong? One who controls their emotions.", practice: "💡 Stay calm when something upsets you." },
            { author: "Jewish Wisdom", teaching: "Laughter brings joy and heals the heart.", practice: "💡 Make someone laugh today." },
            { author: "Maimonides", teaching: "Treat animals with compassion and respect.", practice: "💡 Pet an animal gently and kindly." },
            { author: "Jewish Wisdom", teaching: "Silence is sometimes the wisest response.", practice: "💡 Listen instead of speaking first." },
            { author: "Pirkei Avot", teaching: "Ask questions to gain understanding.", practice: "💡 Ask 'why?' and really listen to the answer." },
            { author: "Jewish Wisdom", teaching: "Mistakes are opportunities to learn and grow.", practice: "💡 Learn something from a mistake today." },
            { author: "Talmud", teaching: "The study of Torah brings peace to the soul.", practice: "💡 Learn something meaningful today." },
            { author: "Jewish Wisdom", teaching: "Gratitude transforms ordinary moments into miracles.", practice: "💡 Say 'thank you' with real feeling." },
            { author: "Pirkei Avot", teaching: "Small acts of kindness create big changes.", practice: "💡 Do something small but kind today." },
            { author: "Jewish Wisdom", teaching: "Your presence is a gift to others.", practice: "💡 Be fully with someone, no distractions." },
            { author: "Torah", teaching: "Remember to rest and recharge.", practice: "💡 Take time to rest without feeling guilty." },
            { author: "Jewish Wisdom", teaching: "Courage is being afraid but doing it anyway.", practice: "💡 Do something brave and kind today." }
        ];
        
        function getDailyWisdom() {
            const today = new Date();
            const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
            const index = dayOfYear % jewishWisdom.length;
            return jewishWisdom[index];
        }
        
        function updateDailyWisdom() { 
            const wisdom = getDailyWisdom();
            const html = `<div style="font-size: 20px; color: #5B4C8A; margin-bottom: 8px; font-weight: 700;">${wisdom.author}</div>
                         <div style="font-size: 18px; margin-bottom: 8px; line-height: 1.5; font-weight: 600;">"${wisdom.teaching}"</div>
                         <div style="font-size: 16px; color: #7B1FA2; font-style: italic; font-weight: 700;">${wisdom.practice}</div>`;
            document.getElementById('dailyWisdom').innerHTML = html;
        }
        
        const dailyTrivia = [
            { fact: "Honey never spoils! Archaeologists found 3,000-year-old honey in Egyptian tombs that was still edible.", category: "🍯 Nature" },
            { fact: "A group of flamingos is called a 'flamboyance'.", category: "🦩 Animals" },
            { fact: "Octopuses have three hearts - two pump blood to the gills, one pumps it to the rest of the body.", category: "🐙 Ocean" },
            { fact: "Bananas are berries, but strawberries are not!", category: "🍌 Food" },
            { fact: "A day on Venus is longer than its year!", category: "🪐 Space" },
            { fact: "Butterflies taste with their feet.", category: "🦋 Insects" },
            { fact: "Sharks have been around longer than dinosaurs.", category: "🦈 Ocean" },
            { fact: "A giraffe's tongue can be up to 20 inches long.", category: "🦒 Animals" },
            { fact: "Penguins propose to their mates with pebbles.", category: "🐧 Animals" },
            { fact: "Cows have best friends and get stressed when separated.", category: "🐄 Animals" },
            { fact: "Sloths only go to the bathroom once a week.", category: "🦥 Animals" },
            { fact: "A group of crows is called a 'murder'.", category: "🐦 Animals" },
            { fact: "Honey tastes the same in space as it does on Earth.", category: "🍯 Space" },
            { fact: "Otters hold hands while sleeping so they don't drift apart.", category: "🦦 Animals" },
            { fact: "The smell of rain comes from bacteria called actinomycetes.", category: "🌧️ Nature" },
            { fact: "Cats have a special collarbone that lets them squeeze through tight spaces.", category: "🐱 Animals" },
            { fact: "A blue whale's heart weighs as much as an elephant.", category: "🐋 Ocean" },
            { fact: "Starfish don't have brains.", category: "⭐ Ocean" },
            { fact: "Pandas are carnivores but eat only bamboo 99% of the time.", category: "🐼 Animals" },
            { fact: "A group of jellyfish is called a 'smack'.", category: "🪼 Ocean" },
            { fact: "Wombat poop is cube-shaped!", category: "🦘 Animals" },
            { fact: "Peacocks are actually called peafowls, and the males are peacocks.", category: "🦚 Animals" },
            { fact: "Horses can't vomit - their stomach is one-way.", category: "🐴 Animals" },
            { fact: "Snakes smell through their mouths.", category: "🐍 Animals" },
            { fact: "Crocodiles cry real tears when eating.", category: "🐊 Animals" },
            { fact: "A camel can drink 40 gallons of water in one sitting.", category: "🐪 Animals" },
            { fact: "Frogs don't drink water - they absorb it through their skin.", category: "🐸 Animals" },
            { fact: "Koalas have fingerprints almost identical to humans.", category: "🐨 Animals" },
            { fact: "Dolphins call each other by name.", category: "🐬 Ocean" },
            { fact: "A cockroach can live for a week without its head.", category: "🪳 Insects" },
            { fact: "Bees do a dance to communicate where flowers are.", category: "🐝 Insects" },
            { fact: "Lightning is hotter than the surface of the sun.", category: "⚡ Nature" },
            { fact: "Rainbows are actually full circles - you can only see the arc from the ground.", category: "🌈 Nature" },
            { fact: "Sand is actually tiny pieces of rocks and shells.", category: "🏖️ Nature" },
            { fact: "Clouds can weigh millions of pounds but float on air.", category: "☁️ Nature" },
            { fact: "Humans share 60% of their DNA with bananas.", category: "🍌 Science" },
            { fact: "Your nose can remember 50,000 different smells.", category: "👃 Body" },
            { fact: "Fingernails grow faster in summer than winter.", category: "💅 Body" },
            { fact: "Your tongue has 10,000 taste buds.", category: "👅 Body" },
            { fact: "A sneeze travels at 100 miles per hour.", category: "🤧 Body" },
            { fact: "Your body has enough iron to make a nail.", category: "⚙️ Body" },
            { fact: "The Great Wall of China is not visible from space.", category: "🏯 Facts" },
            { fact: "Glass is made from sand heated to very high temperatures.", category: "🪟 Science" },
            { fact: "A pizza is cut into 8 slices but a pie has only 1 slice of itself.", category: "🍕 Food" },
            { fact: "The color orange was named after the fruit, not the other way around.", category: "🟠 Facts" },
            { fact: "A group of puppies is called a 'litter' or 'kindle'.", category: "🐶 Animals" },
            { fact: "Cheetahs cannot roar - they purr like house cats.", category: "🐆 Animals" },
            { fact: "An ostrich's eye is bigger than its brain.", category: "🦅 Animals" },
            { fact: "Polar bears have black skin under their white fur.", category: "🐻 Animals" },
            { fact: "A mantis shrimp can see colors humans can't even imagine.", category: "🦐 Ocean" }
        ];
        
        function getDailyTrivia() {
            const today = new Date();
            const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
            const index = dayOfYear % dailyTrivia.length;
            return dailyTrivia[index];
        }
        
        function updateInspiration() { 
            const trivia = getDailyTrivia();
            const html = `<div style="font-size: 20px; color: #5B4C8A; margin-bottom: 8px; font-weight: 700;">${trivia.category}</div>
                         <div style="font-size: 18px; line-height: 1.5; font-weight: 600;">${trivia.fact}</div>`;
            document.getElementById('inspiration').innerHTML = html;
        }

        const events = [
            {name:"Esther Birthday",d:new Date(2025,4,22)}, 
            {name:"Mummy Birthday",d:new Date(2025,11,18)}, 
            {name:"Christmas",d:new Date(2025,11,25)}
        ];
        
        function updateEvent() {
            const now = new Date();
            let nextEvents = [];
            events.forEach(e => {
                const d = new Date(e.d);
                if (d < now) d.setFullYear(d.getFullYear() + 1);
                const days = Math.ceil((d - now) / (1000*60*60*24));
                nextEvents.push({name: e.name, days: days});
            });
            nextEvents.sort((a, b) => a.days - b.days);
            
            // Show top 2 events (Mummy Birthday and Christmas)
            const filtered = nextEvents.filter(e => e.name === "Mummy Birthday" || e.name === "Christmas").slice(0, 2);
            
            let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
            filtered.forEach(e => {
                html += `<div style="text-align: center; padding: 10px; background: rgba(255, 255, 255, 0.3); border-radius: 6px;">
                    <div style="font-size: 48px; font-weight: 900; color: #F9A825;">${e.days} <span style="font-size: 24px; font-weight: 600;">days</span></div>
                    <div style="font-size: 18px; color: #333; font-weight: 700; margin-top: 4px;">${e.name}</div>
                </div>`;
            });
            html += '</div>';
            document.getElementById('event').innerHTML = html;
        }

        setInterval(updateClock, 1000);
        try { updateClock(); } catch(e) {}
        try { updateMoonPhase(); } catch(e) {}
        try { updateInspiration(); } catch(e) {}
        try { updateDailyWisdom(); } catch(e) {}
        try { updateEvent(); } catch(e) {}
        try { renderTodos(); } catch(e) {}
        try { renderShop(); } catch(e) {}
        try { renderBill(); } catch(e) {}
        try { renderChores('esther'); } catch(e) {}
        try { renderChores('lola'); } catch(e) {}
        try { renderEstherTodos(); } catch(e) {}
        try { renderLolaTodos(); } catch(e) {}
        try { renderMamaTodos(); } catch(e) {}
        try { renderMummyTodos(); } catch(e) {}
        try { renderMamaShop(); } catch(e) {}
        try { renderMamaBill(); } catch(e) {}
        try { renderMummyShop(); } catch(e) {}
        try { renderMummyBill(); } catch(e) {}
        try { renderEstherRewards(); } catch(e) {}
        try { renderLolaRewards(); } catch(e) {}
        try { updateTokenDisplay(); } catch(e) {}
        try { initializeChat(); } catch(e) {}

        // Chat functionality
        let chatHistory = JSON.parse(localStorage.getItem('familyChatHistory')) || [];
        let currentChatUser = 'Family';

        function setCurrentChatUser(name) {
            currentChatUser = name;
            renderChatMessages();
        }

        let recognition = null;
        let voiceActive = false;
        
        function initializeChat() {
            renderChatMessages();
            initVoiceRecognition();
        }
        
        function initVoiceRecognition() {
            try {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SpeechRecognition) {
                    console.log('Speech Recognition not available');
                    return;
                }
                
                recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = false;
                recognition.language = 'en-US';
                
                recognition.onstart = () => {
                    voiceActive = true;
                    console.log('✓ Listening for "Hey Planner"...');
                };
                
                recognition.onresult = (event) => {
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript.toLowerCase().trim();
                        const isFinal = event.results[i].isFinal;
                        
                        console.log('Heard:', transcript, 'Final:', isFinal);
                        
                        if (isFinal && transcript) {
                            // Check if contains "hey planner"
                            if (transcript.includes('hey planner')) {
                                let question = transcript.replace('hey planner', '').trim();
                                if (question) {
                                    handleVoiceQuestion(question);
                                }
                            }
                        }
                    }
                };
                
                recognition.onerror = (event) => {
                    console.error('Voice error:', event.error);
                };
                
                recognition.onend = () => {
                    console.log('Voice ended, restarting...');
                    voiceActive = false;
                    // Restart listening
                    setTimeout(() => {
                        if (recognition && !voiceActive) {
                            recognition.start();
                        }
                    }, 500);
                };
                
                recognition.start();
            } catch (error) {
                console.error('Voice init error:', error);
            }
        }
        
        function handleVoiceQuestion(question) {
            console.log('Processing question:', question);
            
            // Add user message
            chatHistory.push({
                user: currentChatUser,
                text: question,
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            });
            localStorage.setItem('familyChatHistory', JSON.stringify(chatHistory));
            renderChatMessages();
            
            // Get AI response
            getAIResponse(question);
        }

        function sendChatMsg() {
            const input = document.getElementById('chatInputField');
            if (input.value.trim()) {
                chatHistory.push({
                    user: currentChatUser,
                    text: input.value.trim(),
                    time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                });
                localStorage.setItem('familyChatHistory', JSON.stringify(chatHistory));
                input.value = '';
                renderChatMessages();
            }
        }

        function renderChatMessages() {
            const box = document.getElementById('chatMessagesBox');
            if (!box) return;
            const recent = chatHistory.slice(-15); // Show last 15 messages
            box.innerHTML = recent.map(msg => 
                `<div class="chat-msg ${msg.user === currentChatUser ? 'user' : 'other'}"><strong>${msg.user}:</strong> ${msg.text}</div>`
            ).join('');
            // Auto-scroll to bottom
            setTimeout(() => {
                box.scrollTop = box.scrollHeight;
            }, 10);
        }

        function startVoiceChat() {
            if (recognition) {
                if (voiceActive) {
                    recognition.stop();
                    voiceActive = false;
                    console.log('Voice stopped');
                } else {
                    recognition.start();
                    voiceActive = true;
                    console.log('Voice started');
                }
            }
        }
        
        async function getAIResponse(question) {
            try {
                console.log('Getting AI response for:', question);
                
                // Add a "thinking" message
                chatHistory.push({
                    user: 'Family Planner',
                    text: '🤔 Thinking...',
                    time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                });
                renderChatMessages();
                
                const response = await fetch("https://api.anthropic.com/v1/messages", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": localStorage.getItem('anthropicApiKey') || '',
                        "anthropic-version": "2023-06-01"
                    },
                    body: JSON.stringify({
                        model: "claude-sonnet-4-20250514",
                        max_tokens: 150,
                        messages: [
                            {
                                role: "user",
                                content: `Answer this question in a fun, short way for kids (1-2 sentences max, no emojis): ${question}`
                            }
                        ]
                    })
                });
                
                // Remove "thinking" message
                if (chatHistory[chatHistory.length - 1].text === '🤔 Thinking...') {
                    chatHistory.pop();
                }
                
                if (response.ok) {
                    const data = await response.json();
                    const answer = data.content[0].text;
                    
                    console.log('AI answered:', answer);
                    
                    // Add AI response
                    chatHistory.push({
                        user: 'Family Planner',
                        text: answer,
                        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                    });
                    localStorage.setItem('familyChatHistory', JSON.stringify(chatHistory));
                    renderChatMessages();
                    
                    // Speak response
                    speakResponse(answer);
                } else {
                    console.error('API error:', response.status);
                    const error = await response.json();
                    console.error('Error details:', error);
                    
                    const fallback = "I'm having trouble thinking right now. Try again!";
                    chatHistory.push({
                        user: 'Family Planner',
                        text: fallback,
                        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                    });
                    renderChatMessages();
                    speakResponse(fallback);
                }
            } catch (error) {
                console.error('Error:', error);
                
                // Remove "thinking" message
                if (chatHistory[chatHistory.length - 1] && chatHistory[chatHistory.length - 1].text === '🤔 Thinking...') {
                    chatHistory.pop();
                }
                
                const fallback = "Oops! Something went wrong. Ask again!";
                chatHistory.push({
                    user: 'Family Planner',
                    text: fallback,
                    time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                });
                renderChatMessages();
            }
        }
        
        function speakResponse(text) {
            if (!('speechSynthesis' in window)) {
                console.log('Speech synthesis not available');
                return;
            }
            
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.8; // Female voice
            utterance.volume = 1;
            
            // Wait for voices to load
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                // Try to find female voice
                let selectedVoice = voices.find(v => 
                    v.name.includes('Female') || 
                    v.name.includes('woman') ||
                    v.name.includes('female')
                );
                
                // If no explicit female voice, use a different voice
                if (!selectedVoice && voices.length > 1) {
                    selectedVoice = voices[1];
                }
                
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }
            }
            
            try {
                window.speechSynthesis.speak(utterance);
                console.log('Speaking:', text);
            } catch (e) {
                console.error('Speech error:', e);
            }
        }
    </script>
</body>
</html>
