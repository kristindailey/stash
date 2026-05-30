# Stripe Integration — Phase 2: Webhooks, Feature Gating & UI

> Build the live subscription flow on top of Phase 1: checkout + billing-portal actions, the Stripe webhook that flips `isPro`, session threading so the UI sees plan state, and the billing/upgrade UI. Requires the Stripe CLI for local webhook testing.

Reference: `docs/stripe-integration-plan.md` (§4.1 webhook/actions/UI, §4.2 session, §4.3 dashboard, §4.6, §5). **Depends on Phase 1** (`src/lib/stripe.ts`, `src/lib/billing.ts`, limits, quota enforcement).

## Overview

Phase 1 made the gates exist but inert (off by default) and added no payment path. Phase 2 wires the actual money flow: hosted Stripe Checkout and Billing Portal (no client-side Stripe.js), a signature-verified webhook that is the source of truth for `isPro`, and the settings UI that lets a user upgrade and manage their subscription. The webhook and end-to-end flow are verified manually with the Stripe CLI (Vitest is scoped to `actions`/`lib`, not routes).

## Goals

- Server actions to start Checkout (`monthly`/`yearly`) and open the Billing Portal
- Webhook handler that verifies signatures and syncs subscription state to the DB (idempotent)
- Make `isPro` visible to the session so the UI reflects plan state after a reload
- Billing section in `/settings` (upgrade for free users, manage for Pro users)
- Optional cosmetic client gating (disabled File/Image pills, upgrade prompts)
- Stripe Dashboard setup (product, two prices, portal, webhook endpoint)

## Non-Goals

- No client-side Stripe.js — redirect to hosted Checkout/Portal only
- No event-dedup table (handlers set absolute state, so they are naturally idempotent)
- No AI / export / custom-type gating (those features aren't built — leave hooks only)
- No required schema change; the optional `stripePriceId` / `stripeCurrentPeriodEnd` fields are a nice-to-have (see "Optional schema")

## Technical Approach

### Files to CREATE

1. **`src/actions/billing.ts`** — `"use server"`, `ActionResult<T>` shape.
   - `createCheckoutSession(plan)` — auth-guard; reject if already Pro; reuse `stripeCustomerId` or create a Stripe customer (store the id); create a `mode: "subscription"` checkout with `client_reference_id = userId`, `success_url`/`cancel_url` to `/settings?checkout=success|cancelled`, `allow_promotion_codes: true`; return `{ url }`.
   - `createBillingPortalSession()` — auth-guard; require `stripeCustomerId`; create portal session with `return_url` to `/settings`; return `{ url }`.
   - **Build the base URL from env directly** (`process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL`) — `getBaseUrl()` needs a `Request` and won't work in an action (§5).

2. **`src/app/api/webhooks/stripe/route.ts`** — `export const runtime = "nodejs"`.
   - 500 if `STRIPE_WEBHOOK_SECRET` missing; 400 on missing/invalid signature.
   - Read **raw body** with `await request.text()` (never `request.json()` before verifying); verify via `stripe.webhooks.constructEventAsync`.
   - Handle `checkout.session.completed` (retrieve the subscription), `customer.subscription.created|updated|deleted`.
   - `syncSubscription(customerId, sub, clientReferenceId)` — locate the user by `stripeCustomerId`, fall back to `client_reference_id` (and backfill `stripeCustomerId`); set `isPro = active` (active/trialing), set/clear `stripeSubscriptionId`. Return 500 on handler error so Stripe retries.

3. **`src/app/(app)/settings/billing-section.tsx`** — client component (mirrors `change-password-section.tsx`).
   - Free: monthly/yearly toggle + "Upgrade to Pro" → `createCheckoutSession(plan)` → `window.location.href = url`.
   - Pro: status + "Manage subscription" → `createBillingPortalSession()` → redirect.
   - Read `?checkout=success|cancelled` via `useSearchParams()` for a sonner toast; on success `router.refresh()` to pick up the new `isPro` once the webhook lands.

4. **`src/components/shared/UpgradePrompt.tsx`** (optional) — small reusable inline "Upgrade to Pro" card/toast shown when a gated action returns its quota error.

### Files to MODIFY

- **`src/auth.ts`** — `jwt` callback re-reads `isPro` from the DB so webhook updates reflect in the token; `session` callback exposes `session.user.isPro`. (Trade-off per §4.2: one DB read per JWT validation. Acceptable at this scale; the real gate stays server-side in `billing.ts`. A page reload after checkout is sufficient.)
- **`src/types/next-auth.d.ts`** — add `isPro` to `Session.user` and `JWT`.
- **`src/app/(app)/settings/page.tsx`** — fetch `isPro` (via `getUserPlan` or extended `getProfile`) and render `<BillingSection isPro={...} />`.
- **`src/lib/db/profile.ts`** (optional) — add `isPro` (and period-end fields if added) to the user `select` so `/profile` and `/settings` get plan status without an extra query.
- **Cosmetic client gating** (optional, recommended): `NewItemDialog` disables File/Image pills with a "PRO" hint when `!isPro` and gating is on; wire the existing sidebar File/Image PRO badges to point at `/settings`.

### Optional schema additions

`stripePriceId String?` + `stripeCurrentPeriodEnd DateTime?` on `User` to show "Renews on…/Access until…". Populate in `syncSubscription`. Migration: `npx prisma migrate dev --name add_stripe_period_fields` against the Neon **development** branch — never `db push`, never `production`. Note `current_period_end` now lives on the subscription *item* (`sub.items.data[0].current_period_end`) in recent API versions — confirm against installed SDK types (§5).

### Environment variables introduced this phase

| Var                     | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| `STRIPE_WEBHOOK_SECRET` | Verify webhook signatures (`whsec_…`)         |
| `STRIPE_PRICE_MONTHLY`  | Price ID for $8/mo                            |
| `STRIPE_PRICE_YEARLY`   | Price ID for $72/yr                           |

(One of `AUTH_URL` / `NEXT_PUBLIC_APP_URL` must be set for actions to build absolute redirect URLs.)

### Stripe Dashboard setup (test mode)

1. Product **DevStash Pro** with two recurring prices: `$8/mo` → `STRIPE_PRICE_MONTHLY`, `$72/yr` → `STRIPE_PRICE_YEARLY`.
2. Copy the **Secret key** → `STRIPE_SECRET_KEY` (test mode).
3. Enable the **Customer Billing Portal** (allow cancel/switch).
4. Webhook endpoint at `/api/webhooks/stripe` for the four events above → **Signing secret** → `STRIPE_WEBHOOK_SECRET`.
5. Local: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (prints the `whsec_…` to use locally); `stripe trigger checkout.session.completed` for test events.

## Testing

**Unit (Vitest):**
- **`src/actions/billing.test.ts`** — `createCheckoutSession` rejects unauthenticated and already-Pro; reuses an existing `stripeCustomerId`; creates a customer when absent. Mock `stripe` and `prisma`. (No webhook/route unit tests — routes are out of Vitest scope.)

**Manual / integration (Stripe CLI):**
- Upgrade flow: Upgrade → Checkout (test card `4242 4242 4242 4242`) → back to `/settings?checkout=success`.
- `checkout.session.completed` → `isPro` flips to `true` in Neon `development`; after reload `session.user.isPro` is `true` and gated features unlock.
- Manage → Portal → cancel → `customer.subscription.deleted` → `isPro` back to `false`, `stripeSubscriptionId` cleared.
- Bad signature → 400; missing webhook env → clean 500.
- With `PRO_GATING_ENABLED=true`: free user blocked at 50 items, 3 collections, and on file/image create **and** direct `/api/upload` (curl with a valid session).
- `npm run build` + `npm run test` pass.

## Implementation Order

1. `src/actions/billing.ts` (checkout + portal) + `billing.test.ts`.
2. `src/app/api/webhooks/stripe/route.ts`; verify with Stripe CLI.
3. `src/auth.ts` jwt/session callbacks + `next-auth.d.ts` for `isPro`.
4. `billing-section.tsx` + render in `settings/page.tsx`; surface `isPro` via `getProfile`/`getUserPlan`.
5. Cosmetic client gating (NewItemDialog pills, upgrade prompts).
6. Stripe Dashboard setup (product, prices, portal, webhook).
7. Full manual run-through; `npm run build` + `npm run test`.
8. Flip `PRO_GATING_ENABLED=true` only when intentionally enforcing limits (per the project's "enable gating before launch").