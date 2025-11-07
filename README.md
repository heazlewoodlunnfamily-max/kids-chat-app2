# Friend Chat App 💬

Real-time group and private messaging app with voice-to-text and emoji support.

## Features

✅ **Group Chat** - Esther, Valley, Amaaya, Mama, Mummy, Hilary  
✅ **Private Chats** - Nan, Poppy, Rishy, Mama, Hilary, Mummy, Sienna (1-on-1 with Esther)  
✅ **✍️ Compose & Drafts** - Write longer messages and save them as drafts  
✅ **😀 150+ Emojis** - Full emoji picker  
✅ **🎤 Voice to Text** - Speak messages instead of typing  
✅ **Real-time Syncing** - Messages appear instantly across all devices  
✅ **iPhone & iPad** - Works on all mobile devices  

## Users

**Group Chat (6 people):**
- Esther
- Valley
- Amaaya
- Mama
- Mummy
- Hilary

**Private Chats with Esther (7 people):**
- Mama
- Mummy
- Hilary
- Nan
- Rishy
- Poppy
- Sienna

## How to Deploy

### Option 1: Render (FREE & EASIEST)

1. **Create GitHub Account** - go to github.com and sign up
2. **Create Repository**
   - Name: `kids-chat-app`
   - Public
   - Upload all files from this folder
3. **Deploy on Render**
   - Go to render.com
   - New Web Service
   - Connect GitHub
   - Select your repository
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Click Deploy
4. **Get Your URL** - Render will give you a public URL to share

### Option 2: Local Testing

```bash
npm install
npm start
```

Then open http://localhost:3000

## File Structure

```
kids-chat-app/
├── server.js          (Backend server)
├── package.json       (Dependencies)
├── README.md          (This file)
└── public/
    └── index.html     (Frontend app)
```

## How to Use

1. **Open the app** on any device
2. **Click your name** to log in
3. **Select a chat** from the tabs
4. **Send messages:**
   - Type in the text box and click Send
   - Click 😀 to add emojis
   - Click 🎤 to speak messages
   - Click ✍️ to compose longer messages

## Features Explained

### ✍️ Compose & Drafts
- Click ✍️ button to open composer
- Write your message
- It auto-saves as a draft
- Click "Send" to send or "Clear" to delete

### 😀 Emojis
- Click 😀 button to open emoji picker
- Tap any emoji to add it
- Over 150 emojis available

### 🎤 Voice to Text
- Click 🎤 button
- Speak clearly
- Your words appear as text in the message box

### Real-time Syncing
- Messages appear instantly on all devices
- Works across different houses/locations
- Uses WebSocket for live updates

## Troubleshooting

**Can't connect?**
- Check if server is running
- Make sure you're on the same internet
- Refresh the page

**Messages not sending?**
- Check connection status (should show online)
- Try refreshing
- Make sure message box isn't empty

**Voice not working?**
- Only works on modern browsers
- Need to allow microphone permission
- Works best in quiet rooms

## Technical Details

- **Backend:** Node.js + Express + WebSocket
- **Frontend:** HTML5 + CSS3 + Vanilla JavaScript
- **Deployment:** Render.com (free tier)
- **Real-time:** WebSocket (ws/wss)

## Support

For help with deployment or features, check:
- Render docs: render.com/docs
- Express docs: expressjs.com
- WebSocket docs: developer.mozilla.org/en-US/docs/Web/API/WebSocket

---

Built with ❤️ for easy family messaging
