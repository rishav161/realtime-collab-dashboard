# Deployment Guide - Vercel + Railway

This guide will help you deploy your app with full real-time features using Vercel (frontend) + Railway (WebSocket server).

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Vercel    │────────▶│   Railway    │◀────────│   Client    │
│  (Frontend) │         │  (Socket.IO) │         │  (Browser)  │
└─────────────┘         └──────────────┘         └─────────────┘
      │                                                  │
      │                                                  │
      ▼                                                  ▼
┌─────────────┐                                  WebSocket
│    Neon     │                                  Connection
│ (Database)  │
└─────────────┘
```

## Step 1: Deploy Socket.IO Server to Railway (5 minutes)

### 1.1 Install Railway CLI
```bash
npm install -g @railway/cli
```

### 1.2 Login to Railway
```bash
railway login
```

### 1.3 Deploy Socket Server
```bash
cd socket-server
railway init
railway up
```

### 1.4 Get Your Railway URL
After deployment, Railway will give you a URL like:
```
https://your-app-production-xxxx.up.railway.app
```

### 1.5 Add Environment Variable in Railway
Go to Railway dashboard → Your project → Variables → Add:
```
FRONTEND_URL=https://your-vercel-app.vercel.app
```
(You'll update this after Vercel deployment)

## Step 2: Deploy Frontend to Vercel (3 minutes)

### 2.1 Push to GitHub
```bash
git add .
git commit -m "Add external Socket.IO server support"
git push origin main
```

### 2.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:

```env
DATABASE_URL=your_neon_database_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_SOCKET_URL=https://your-railway-url.railway.app
```

5. Click "Deploy"

### 2.3 Update Railway Environment Variable
Go back to Railway dashboard and update:
```
FRONTEND_URL=https://your-actual-vercel-url.vercel.app
```

## Step 3: Test Real-time Features

1. Open your Vercel URL in two browser tabs
2. Sign in to both
3. Try:
   - Sending messages (should appear in both tabs)
   - Incrementing counter (should sync across tabs)
   - See active users list update

## Local Development

### Terminal 1 - Socket Server
```bash
cd socket-server
npm install
npm start
```

### Terminal 2 - Next.js App
```bash
npm run dev
```

The app will connect to `http://localhost:3002` automatically.

## Troubleshooting

### WebSocket not connecting
- Check Railway logs: `railway logs`
- Verify `NEXT_PUBLIC_SOCKET_URL` in Vercel
- Check browser console for connection errors

### CORS errors
- Ensure `FRONTEND_URL` is set correctly in Railway
- Check Railway logs for CORS messages

### Users not syncing
- Verify Socket.IO server is running: visit `https://your-railway-url.railway.app/health`
- Should return: `{"status":"ok","users":0,"timestamp":"..."}`

## Cost

- **Vercel**: Free tier (100GB bandwidth, unlimited requests)
- **Railway**: Free tier ($5 credit/month, ~500 hours)
- **Neon**: Free tier (3GB storage, 1 database)

**Total: $0/month** for hobby projects! 🎉

## Support

If you encounter issues:
1. Check Railway logs: `railway logs`
2. Check Vercel logs in dashboard
3. Check browser console for errors
