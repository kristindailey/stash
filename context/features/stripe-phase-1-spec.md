# Stripe Integration — Phase 1: Core Infrastructure

> Lay the foundation for DevStash Pro subscriptions: Stripe SDK, free-tier limit constants, server-side gating helpers, and quota enforcement. No webhooks, no UI, no payment flow yet. Gating ships **off by default** so dev work isn't blocked.

Reference: `docs/stripe-integration-plan.md` (§4.0–4.2, §4.5).

## Overview

Build the server-side primitives that everything else depends on. This phase is fully unit-testable (no Stripe CLI required) and changes nothing in dev until `PRO_GATING_ENABLED=true` is set. The `User` model already has `isPro`, `stripeCustomerId`, and `stripeSubscriptionId` — no migration needed.

## Goals

- Install the `stripe` Node SDK and add a guarded singleton (`getStripe()` / `isStripeEnabled()`)
- Define free-tier limits and a `PRO_GATING_ENABLED` flag (mirrors `EMAIL_VERIFICATION_ENABLED` pattern)
- Central server-only gate helpers in `src/lib/billing.ts` that short-circuit to "allowed" when gating is off
- Enforce item, collection, and Pro-type quotas at every server mutation point
- Unit test the gating logic thoroughly (Vitest)

## Non-Goals

- No webhook handler (Phase 2)
- No checkout / billing-portal actions (Phase 2)
- No session/`isPro` threading or `auth.ts` changes (Phase 2)
- No UI, billing section, or upgrade prompts (Phase 2)
- No schema changes (the optional period-end fields are deferred)
- No Stripe Dashboard product/price/webhook setup (Phase 2)

## Technical Approach

### Files to CREATE

1. **`src/lib/stripe.ts`** — SDK singleton. `stripe` is `null` when `STRIPE_SECRET_KEY` is unset; `getStripe()` throws a clear error; `isStripeEnabled()` reports presence. Pin `apiVersion` to the value the installed SDK ships with (check `node_modules/stripe/types` after install — do not hardcode the doc's version blindly).

2. **`src/lib/constants/limits.ts`**
   - `FREE_ITEM_LIMIT = 50`
   - `FREE_COLLECTION_LIMIT = 3`
   - `PRO_ONLY_TYPES = new Set(["file", "image"])`
   - `isProGatingEnabled()` → `process.env.PRO_GATING_ENABLED === "true"`

3. **`src/lib/billing.ts`** — server-only helpers, each returning an error string if blocked or `null` if allowed:
   - `getUserPlan(userId)` → `{ isPro }` via `prisma.user.findUnique`
   - `checkItemQuota(userId)` — null when gating off / Pro / under limit; error at ≥ `FREE_ITEM_LIMIT`
   - `checkCollectionQuota(userId)` — same shape at ≥ `FREE_COLLECTION_LIMIT`
   - `checkProType(userId, type)` — error for free users when `type` is in `PRO_ONLY_TYPES`
   - All short-circuit to `null` when `!isProGatingEnabled()`, so dev is unaffected.

### Files to MODIFY (quota enforcement only)

- **`src/actions/items.ts`** (`createItem`, ~line 116) — after parse, before `createItemQuery`: `checkItemQuota` then `checkProType(userId, parsed.data.type)`; return `{ success: false, error }` on block. Edits/toggles untouched.
- **`src/actions/collections.ts`** (`createCollection`, ~line 34) — `checkCollectionQuota` before `createCollectionQuery`.
- **`src/app/api/upload/route.ts`** — after the auth check, `checkProType(userId, kind)`; return `NextResponse.json({ error }, { status: 403 })` on block (route is callable directly, so it must guard independently).

### Environment variables introduced this phase

| Var                  | Purpose                                            |
| -------------------- | -------------------------------------------------- |
| `STRIPE_SECRET_KEY`  | Server SDK auth (`sk_test_…`)                      |
| `PRO_GATING_ENABLED` | `"true"` to enforce free-tier limits (off in dev)  |

The remaining Stripe env vars (`STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`) arrive in Phase 2.

## Testing

Unit tests only — no Stripe CLI needed. Mock `prisma` (and gating flag) with `vi.mock`.

- **`src/lib/billing.test.ts`** (primary deliverable for this phase)
  - `checkItemQuota` / `checkCollectionQuota`: return `null` when gating off, when under limit, and when user is Pro; return the error string at and over the limit for free users.
  - `checkProType`: `null` when gating off, when type is not Pro-only, and when user is Pro; error for free users on `file` / `image`.
  - `getUserPlan`: returns `{ isPro: false }` when the user is missing.
- **`src/actions/items.test.ts`** (extend) — `createItem` returns the quota error at 50 items for a free user; succeeds for Pro / when gating off; file/image type blocked for free user.
- **`src/actions/collections.test.ts`** (extend) — `createCollection` blocked at 3 collections for a free user.

Gates: `npm run test` and `npm run build` pass.

## Implementation Order

1. `npm install stripe`; add `STRIPE_SECRET_KEY` + `PRO_GATING_ENABLED` env vars; create `src/lib/stripe.ts`.
2. `src/lib/constants/limits.ts` + `src/lib/billing.ts` with `billing.test.ts`. Gating flag stays **off** — nothing changes in dev.
3. Wire quota checks into `createItem`, `createCollection`, `/api/upload`; extend their tests.
4. `npm run test` + `npm run build`.