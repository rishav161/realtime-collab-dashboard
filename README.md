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
│   ├── api/          # API routes
│   ├── sign-in/      # Clerk sign-in page
│   ├── sign-up/      # Clerk sign-up page
│   └── page.tsx      # Home page
├── lib/
│   ├── prisma.ts     # Prisma client
│   └── store.ts      # Zustand store
├── prisma/
│   └── schema.prisma # Database schema
└── middleware.ts     # Clerk auth middleware
```

## Features

- ✅ Authentication with Clerk
- ✅ PostgreSQL database with Prisma ORM
- ✅ State management with Zustand
- ✅ Animations with Framer Motion
- ✅ Real-time updates with Socket.IO
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling

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
