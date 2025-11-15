# Socket.IO Server

Standalone WebSocket server for real-time features.

## Deploy to Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Deploy from this directory:
```bash
cd socket-server
railway init
railway up
```

4. Add environment variable in Railway dashboard:
```
FRONTEND_URL=https://your-vercel-app.vercel.app
```

5. Copy the Railway URL (e.g., `https://your-app.railway.app`)

6. Add to your Vercel environment variables:
```
NEXT_PUBLIC_SOCKET_URL=https://your-app.railway.app
```

## Local Development

```bash
cd socket-server
npm install
npm start
```

Server will run on http://localhost:3002
