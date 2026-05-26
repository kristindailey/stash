# Current Feature: Forgot Password
<!-- Feature name appended after H1 when active, e.g. "# Current Feature: Add Navbar" -->
Add a forgot password flow that lets users reset their password via a token-based email link, reusing the existing `VerificationToken` model.

## Status
In Progress

## Goals
- "Forgot password?" link on the `/login` page
- `/forgot-password` page with email form that triggers the reset email (no enumeration in response)
- `POST /api/auth/forgot-password` route generates a reset token (reusing `VerificationToken` model, distinct identifier prefix) and sends a reset email via Resend
- `/reset-password?token=...` page with new password form (validation + confirmation)
- `POST /api/auth/reset-password` consumes the token, updates `User.password` (bcryptjs), and invalidates the token
- Tokens expire (1h TTL) and are single-use
- Sensible error states: invalid/expired token, weak password, etc.
- Password reset email always sends via Resend (independent of `EMAIL_VERIFICATION_ENABLED`)

## Notes
- Reuse `src/lib/email.ts` (Resend) and add `sendPasswordResetEmail`
- Reuse `src/lib/verification-token.ts` patterns (32-byte hex, store in `VerificationToken`); use a namespaced identifier like `password-reset:<email>` to avoid colliding with email-verification tokens
- Use bcryptjs for hashing the new password to match existing auth code
- Keep responses no-enumeration on `/api/auth/forgot-password` (always 200 ok)
- Follow existing page/component patterns from `/verify-email` and `/login` for styling/UX consistency

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
