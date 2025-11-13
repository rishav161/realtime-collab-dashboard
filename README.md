# Next.js 15 Full-Stack Dashboard

A modern full-stack application built with Next.js 15, TypeScript, and a comprehensive tech stack.

## Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS, TypeScript, Zustand, Framer Motion
- **Backend**: Next.js API Routes, Socket.IO
- **Auth**: Clerk
- **Database**: PostgreSQL (Neon/Supabase)
- **ORM**: Prisma
- **Deployment**: Vercel

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local` and fill in your credentials:

```env
# Database (get from Neon or Supabase)
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Clerk Auth (get from clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/users/          # User API routes
│   ├── sign-in/            # Clerk sign-in page
│   ├── sign-up/            # Clerk sign-up page
│   └── page.tsx            # Dashboard with real-time features
├── components/
│   └── ActivityIndicator.tsx  # Shows active users
├── hooks/
│   └── useSocket.ts        # Custom Socket.IO hook
├── lib/
│   ├── store/
│   │   └── collabStore.ts  # Collaboration state (users, messages)
│   ├── prisma.ts           # Prisma client
│   └── store.ts            # App state (counter, etc.)
├── prisma/
│   └── schema.prisma       # Database schema
├── server.js               # Custom Node.js server with Socket.IO
└── middleware.ts           # Clerk auth middleware
```

## Features

- ✅ Authentication with Clerk
- ✅ PostgreSQL database with Prisma ORM
- ✅ State management with Zustand
- ✅ Animations with Framer Motion
- ✅ Real-time updates with Socket.IO (custom server)
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling

## Real-Time Collaboration Engine

Built with a lightweight Socket.IO + Zustand architecture for instant synchronization:

### Features
- **Collaborative Dashboard** (`/dashboard`) - Full-featured real-time workspace
  - Active users panel with online indicators
  - Real-time chat with message history
  - Beautiful dark theme with smooth animations
  - Responsive design for all screen sizes
- **Demo Page** (`/`) - Simple counter and chat examples
- **Activity Indicator** - Visual display of online collaborators with avatars
- **Connection Status** - Live indicator showing Socket.IO connection state

### Architecture
- **Custom Hook**: `hooks/useSocket.ts` handles all Socket.IO logic
- **Collab Store**: `lib/store/collabStore.ts` manages users & messages
- **App Store**: `lib/store.ts` for non-collaborative state
- **Server Events**: `user_joined`, `user_left`, `new_message`, `data_sync`
- **Clean Structure**: Organized hooks and stores, minimal complexity

### How It Works
```
Client A                    Server (server.js)              Client B
   │                              │                            │
   ├─ useSocket() ───────────────>│                            │
   │  (connects)                   │                            │
   │                              │<──────────── useSocket() ──┤
   │                              │              (connects)     │
   │                              │                            │
   ├─ user_joined ───────────────>│                            │
   │                              ├─ active_users ────────────>│
   │                              │                            │
   ├─ data_sync (count: 5) ──────>│                            │
   │                              ├─ data_sync ───────────────>│
   │                              │  (broadcasts)              │
   │                              │                            │
   │  Zustand Store Updates       │       Zustand Store Updates│
   │  ✓ count = 5                 │       ✓ count = 5         │
```

Open multiple browser tabs to see the magic! ✨

### Pages
- **`/`** - Home page with demo counter and chat
- **`/dashboard`** - Full collaborative dashboard with users panel and live chat

## Deployment

Deploy to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add your environment variables in the Vercel dashboard.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
