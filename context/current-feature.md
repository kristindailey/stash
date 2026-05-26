# Current Feature: Email Verification on Sign Up

## Status
In Progress

## Goals
- New users receive a verification email after registering
- Email contains a unique, time-limited verification link
- Clicking the link marks the user's email as verified (`User.emailVerified`)
- Unverified users are blocked from signing in (or shown a clear "verify your email" state)
- Resend-powered email delivery using `RESEND_API_KEY` from `.env`
- Ability to resend the verification email if the link expires or is lost

## Notes
- Using Resend for transactional email delivery; API key already present in `.env` as `RESEND_API_KEY`
- Credentials flow only — GitHub OAuth users are already verified by the provider
- Reuse NextAuth's `VerificationToken` model in the Prisma schema for token storage
- Token should be a secure random string with a reasonable expiry (e.g., 24h)
- Registration flow (`POST /api/auth/register`) currently creates the user and returns success — needs to also generate a token and send the email
- Need a new route (e.g., `GET /api/auth/verify-email?token=...`) that validates the token, sets `emailVerified`, and redirects to `/login?verified=1`
- Credentials `authorize` in `auth.ts` should reject login when `emailVerified` is null
- Consider a "Resend verification" action on the login page when a user tries to sign in with an unverified account

## History
- **2026-05-21** — Initial Next.js and Tailwind CSS setup.
- **2026-05-21** — Dashboard UI Phase 1: ShadCN setup, `/dashboard` route, shell layout, dark mode, display-only top bar.
- **2026-05-25** — Dashboard UI Phase 2: sidebar with types/favorites/collections sections, user avatar footer, collapsible drawer toggle, mobile drawer overlay.
- **2026-05-25** — Dashboard UI Phase 3: main content area with 4 stats cards, recent collections grid, pinned items, and 10 most-recent items list.
- **2026-05-25** — Prisma 7 + Neon PostgreSQL setup: schema, `prisma.config.ts`, Neon driver adapter, init migration, system item types seeded, `scripts/test-db.ts`.
- **2026-05-25** — Seed data: demo user (bcryptjs), 5 collections, 18 items across snippets/prompts/commands/links; `test-db.ts` updated to display demo data.
- **2026-05-25** — Dashboard Collections: `src/lib/db/collections.ts` fetcher, CollectionsSection on real data, border color from dominant type, per-type icon chips, dashboard route forced dynamic.
- **2026-05-25** — Dashboard Items: `src/lib/db/items.ts` fetchers (pinned/recent/stats), PinnedSection + RecentItemsSection + StatsCards on real data, seeded pinned/favorite flags, pinned cards hide content preview.
- **2026-05-25** — Sidebar on real data: `getSidebarItemTypes` + `getSidebarCollections` fetchers, dashboard layout passes data to Sidebar, item-type links go to `/items/{name}s`, added "View all collections" link.
- **2026-05-25** — Sidebar PRO badge: installed ShadCN Badge, subtle "PRO" tag on Files and Images item types.
- **2026-05-25** — Audit quick wins: cached shared `getDemoUserId` (React.cache), N+1 fix in `getRecentCollections` (Prisma `select` + narrow `itemCollection.findMany`), tightened `ITEM_TYPE_*` constants to `Partial<Record>`, removed duplicate `TYPE_ICONS` from Sidebar, batched seed item inserts via nested create.
- **2026-05-26** — Auth Phase 1: NextAuth v5 (beta) + `@auth/prisma-adapter`, split config (`auth.config.ts` edge-safe + `auth.ts` with PrismaAdapter & JWT strategy), `/api/auth/[...nextauth]` route, `src/proxy.ts` protecting `/dashboard/*` with redirect to NextAuth default sign-in, Session/JWT type augmentation exposing `user.id`.
- **2026-05-26** — Auth Phase 2: Credentials provider in split config (placeholder in `auth.config.ts`, bcrypt-backed `authorize` in `auth.ts`), `POST /api/auth/register` route with field validation, duplicate-email check, and bcryptjs hashing.
- **2026-05-26** — Auth Phase 3: custom `/login` + `/register` pages (Credentials + GitHub, validation, error display), `pages.signIn` override + proxy redirect updated, reusable `UserAvatar` (image or initials), inline `GithubIcon` (lucide 1.x dropped brands), sidebar footer driven by `auth()` session with avatar dropup → Sign out and gear icon → `/profile`, sonner toaster mounted with post-register success toast on `/login?registered=1`.
