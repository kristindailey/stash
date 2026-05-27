# Current Feature: Rate Limiting for Auth
<!-- Feature name appended after H1 when active, e.g. "# Current Feature: Add Navbar" -->
<!-- Brief description of the feature to implement -->

## Status
In Progress

## Goals
- Add rate limiting to auth-related API routes using Upstash Redis + `@upstash/ratelimit`
- Create reusable `src/lib/rate-limit.ts` utility (sliding window, fail-open)
- Protect endpoints with these limits:
  - `/api/auth/callback/credentials` — 5 / 15 min, keyed by IP + email
  - `/api/auth/register` — 3 / 1 hour, keyed by IP
  - `/api/auth/forgot-password` — 3 / 1 hour, keyed by IP
  - `/api/auth/reset-password` — 5 / 15 min, keyed by IP
  - `/api/auth/resend-verification` — 3 / 15 min, keyed by IP + email
- Return 429 with JSON `{ error }` + `Retry-After` header
- Surface friendly toast on the frontend for 429s

## Notes
- Extract IP from `x-forwarded-for` (Vercel) with request fallback
- Rate limit checks return `{ success, remaining, reset }`
- Fail open if Upstash is unavailable so auth never breaks on outage
- Login limiting on NextAuth Credentials may need a custom sign-in handler / wrapping `authorize`
- Env: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Upstash free tier (10k req/day) is sufficient
- Spec: `context/features/rate-limiting-spec.md`

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
- **2026-05-26** — Email Verification: Resend SDK + `src/lib/email.ts` (`sendVerificationEmail`), `src/lib/verification-token.ts` (32-byte hex, 24h TTL) reusing NextAuth `VerificationToken` model; register route generates token + sends email; `GET /api/auth/verify-email` consumes token and sets `User.emailVerified`; `POST /api/auth/resend-verification` (no-enumeration); Credentials `authorize` throws `EmailNotVerifiedError` for unverified users; dedicated `/verify-email` (check-inbox + resend + error states) and `/verify-email/verified` (success) pages; login form shows "Resend verification email" link on failed sign-in. Added `scripts/delete-non-demo-users.ts` for dev cleanup.
- **2026-05-26** — Email Verification Toggle: `EMAIL_VERIFICATION_ENABLED` env flag via `isEmailVerificationEnabled()` in `src/lib/email.ts` (default off); register route auto-sets `emailVerified` and skips Resend when disabled; Credentials `authorize` skips `EmailNotVerifiedError`; resend-verification short-circuits; register form redirects to `/login?registered=1` when verification not required; login page hides resend link via server-passed `verificationEnabled` prop.
- **2026-05-26** — Forgot Password: `createPasswordResetToken` / `consumePasswordResetToken` / `buildResetPasswordUrl` in `src/lib/verification-token.ts` using `password-reset:<email>` identifier prefix (1h TTL, single-use), `consumeVerificationToken` hardened to reject reset-prefixed tokens; `sendPasswordResetEmail` in `src/lib/email.ts` (always sends, independent of verification toggle); `POST /api/auth/forgot-password` (no-enumeration, only sends when `user.password` is set); `POST /api/auth/reset-password` (validates token + 8-char password + confirm, bcryptjs hash, structured `reason` on failure); `/forgot-password` + `/reset-password` pages with check-inbox / missing-token / invalid-token states; login form "Forgot password?" link and `/login?reset=1` success banner.
- **2026-05-26** — Profile Page: moved dashboard layout into shared `(app)` route group so `/dashboard` and `/profile` share sidebar+topbar; `getProfile` in `src/lib/db/profile.ts` (auth-session user + item/collection counts + per-type breakdown including zero-count types); `src/actions/profile.ts` server actions `changePassword` (bcrypt verify current) + `deleteAccount` (email-typing confirmation, `signOut` after delete); `/profile` server component renders user header (`UserAvatar` + joined date), stats cards, type breakdown, and account sections; client `ChangePasswordSection` (hidden when no `User.password`) and `DeleteAccountSection` (email confirm, redirects to `/login`); proxy now protects `/profile`; sidebar avatar dropdown gains a `Profile` link above `Sign out`.
