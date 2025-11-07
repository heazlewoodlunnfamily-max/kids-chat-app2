const express = require('express');
const app = express();

let allMessages = {};

app.use(express.json());

const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Chat</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;display:flex;justify-content:center;align-items:center;padding:10px}
.login{width:100%;max-width:500px;background:white;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.2);padding:40px 20px;text-align:center}
.login h1{font-size:28px;margin-bottom:10px}.login p{font-size:16px;color:#666;margin-bottom:30px}
.btns{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.btn{padding:15px;background:#667eea;color:white;border:none;border-radius:12px;font-size:14px;font-weight:bold;cursor:pointer}
.btn:hover{background:#764ba2}
.app{width:100%;max-width:500px;background:white;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.2);display:flex;flex-direction:column;height:90vh;display:none}
.app.show{display:flex}
.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:15px;text-align:center;font-size:22px;font-weight:bold;border-radius:20px 20px 0 0;display:flex;justify-content:space-between;align-items:center}
.logout{background:rgba(255,255,255,0.2);border:none;color:white;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:12px}
.tabs{display:flex;gap:4px;padding:10px;background:#f0f0f0;border-bottom:2px solid #e0e0e0;overflow-x:auto}
.tab{padding:8px 12px;background:white;border:2px solid #ddd;border-radius:15px;cursor:pointer;font-weight:600;font-size:13px;white-space:nowrap}
.tab.active{background:#667eea;color:white;border-color:#667eea}
.chat{flex:1;overflow-y:auto;padding:15px;background:#fafafa}
.msg{margin-bottom:12px;display:flex;flex-direction:column}
.msg.own{align-items:flex-end}
.bubble{max-width:80%;padding:10px 14px;border-radius:16px;word-wrap:break-word;font-size:15px}
.msg.own .bubble{background:#667eea;color:white}
.msg.esther .bubble{background:#667eea;color:white}
.msg.valley .bubble{background:#ff6b9d;color:white}
.msg.amaaya .bubble{background:#4ecdc4;color:white}
.msg.mama .bubble{background:#95e1d3;color:white}
.msg.mummy .bubble{background:#f38181;color:white}
.msg.hilary .bubble{background:#aa96da;color:white}
.msg.nan .bubble{background:#fcbad3;color:white}
.msg.poppy .bubble{background:#ffd1b3;color:white}
.msg.rishy .bubble{background:#a8e6cf;color:white}
.msg.millie .bubble{background:#ffd3a5;color:white}
.sender{font-size:12px;color:#999;margin:4px 0;font-weight:600}
.input{padding:12px;background:white;border-top:2px solid #e0e0e0;display:flex;gap:8px}
input{flex:1;padding:12px;border:2px solid #e0e0e0;border-radius:20px;font-size:15px}
input:focus{outline:none;border-color:#667eea}
button{padding:12px 20px;background:#667eea;color:white;border:none;border-radius:20px;font-weight:bold;cursor:pointer}
button:hover{background:#764ba2}
.emoji-btn{background:#fff;border:2px solid #ffc107;color:#333;padding:10px 14px;font-size:18px}
.empty{text-align:center;color:#999;padding:20px}
</style></head>
<body>

<div class="login" id="login">
  <h1>💬 Chat</h1>
  <p>Who are you?</p>
  <div class="btns">
    <button class="btn" onclick="login('esther')">Esther</button>
    <button class="btn" onclick="login('valley')">Valley</button>
    <button class="btn" onclick="login('amaaya')">Amaaya</button>
    <button class="btn" onclick="login('mama')">Mama</button>
    <button class="btn" onclick="login('mummy')">Mummy</button>
    <button class="btn" onclick="login('hilary')">Hilary</button>
    <button class="btn" onclick="login('nan')">Nan</button>
    <button class="btn" onclick="login('poppy')">Poppy</button>
    <button class="btn" onclick="login('rishy')">Rishy</button>
    <button class="btn" onclick="login('millie')">Millie</button>
  </div>
</div>

<div class="app" id="app">
  <div class="header">
    <div>💬 <span id="name"></span></div>
    <button class="logout" onclick="logout()">Logout</button>
  </div>
  <div class="tabs" id="tabs"></div>
  <div class="chat" id="chat"><div class="empty">No messages</div></div>
  <div class="input">
    <button class="emoji-btn" onclick="addEmoji()">😀</button>
    <input type="text" id="msg" placeholder="Type..." disabled>
    <button onclick="send()" disabled id="sendBtn">Send</button>
  </div>
</div>

<script>
const KIDS = {esther:'Esther',valley:'Valley',amaaya:'Amaaya',mama:'Mama',mummy:'Mummy',hilary:'Hilary',nan:'Nan',poppy:'Poppy',rishy:'Rishy',millie:'Millie'};
const GROUP=['esther','valley','amaaya','mama','mummy','hilary'];
const PAIRS=[['esther','nan'],['esther','poppy'],['esther','rishy'],['esther','millie']];
const EMOJIS=['😀','😂','😍','🥰','😎','🤗','🎉','🎊','👍','🎨','🌈','⭐','🐱','🍕','🍦','🚀','💕','✨','🔥','🎮'];

let user=null,chat='group',chats=[],msgs={},isDone=false;

function login(u){
  user=u;
  localStorage.setItem('user',u);
  chats=[];
  if(GROUP.includes(u))chats.push('group');
  PAIRS.forEach(p=>{if(p.includes(u)){const o=p[0]===u?p[1]:p[0];chats.push([u,o].sort().join('-'));}});
  chats.forEach(c=>{msgs[c]=msgs[c]||[];});
  chat=chats[0]||'group';
  document.getElementById('login').style.display='none';
  document.getElementById('app').classList.add('show');
  document.getElementById('name').textContent=KIDS[u];
  fetch('/load').then(r=>r.json()).then(d=>{msgs=d;render();});
  renderTabs();
}

function logout(){
  localStorage.removeItem('user');
  location.reload();
}

function renderTabs(){
  const d=document.getElementById('tabs');
  d.innerHTML='';
  chats.forEach(c=>{
    const b=document.createElement('button');
    b.className='tab'+(c===chat?' active':'');
    if(c==='group')b.textContent='👥 Group';
    else{const o=c.split('-').find(x=>x!==user);b.textContent=KIDS[o];}
    b.onclick=()=>{chat=c;renderTabs();render();};
    d.appendChild(b);
  });
}

function render(){
  const d=document.getElementById('chat');
  const m=msgs[chat]||[];
  d.innerHTML='';
  if(m.length===0){d.innerHTML='<div class="empty">No messages 💬</div>';return;}
  m.forEach(x=>{
    const e=document.createElement('div');
    e.className='msg '+(x.u===user?'own':x.u);
    e.innerHTML='<div class="sender">'+KIDS[x.u]+'</div><div class="bubble">'+x.t+'</div>';
    d.appendChild(e);
  });
  d.scrollTop=d.scrollHeight;
}

function send(){
  const i=document.getElementById('msg');
  const t=i.value.trim();
  if(!t)return;
  fetch('/msg',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({u:user,c:chat,t:t})});
  i.value='';
}

function addEmoji(){
  const i=document.getElementById('msg');
  i.value+=EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
}

document.getElementById('msg').addEventListener('keypress',e=>{if(e.key==='Enter')send();});

const saved=localStorage.getItem('user');
if(saved)login(saved);

setInterval(()=>{if(user)fetch('/load').then(r=>r.json()).then(d=>{msgs=d;render();});},1000);
</script>
</body>
</html>`;

app.get('/', (req, res) => {
  res.send(html);
});

app.get('/load', (req, res) => {
  res.json(allMessages);
});

app.post('/msg', (req, res) => {
  const {u, c, t} = req.body;
  if (!allMessages[c]) allMessages[c] = [];
  allMessages[c].push({u, t});
  res.json({ok: true});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
