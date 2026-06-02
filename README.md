# Stash

The one place to stash all your developer knowledge. Snippets. Prompts. Commands. Notes. Files. Images. Links. 

Fast. Searchable. AI-enhanced.

## Tech Stack

- Next.js 16 / React 19 (TypeScript)
- Neon PostgreSQL + Prisma 7
- NextAuth v5 (email/password + GitHub OAuth)
- Tailwind CSS v4 + shadcn/ui
- Cloudflare R2 (file storage)
- OpenAI (AI features)
- Stripe (subscriptions)

## Getting Started

```bash
npm install
cp .env.example .env   # fill in env vars
npx prisma migrate dev
npm run dev            # http://localhost:3000
```

## Environment

Copy `.env.example` to `.env` and fill in the values.

## Commands

```bash
npm run dev     # Start dev server
npm run build   # Production build
npm run start   # Serve production build
npm run lint    # ESLint
npm run test    # Vitest unit tests
```

## Database

Use Prisma migrations for all schema changes. Never use `prisma db push`.

```bash
npx prisma migrate dev --name <name>   # development
npx prisma migrate deploy              # production
```