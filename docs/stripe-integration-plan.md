# Stripe Integration Plan — DevStash Pro

> Research document. No source code was modified. This is a complete implementation plan for adding Stripe subscriptions (Pro: **$8/mo** or **$72/yr**) to DevStash.

---

## 1. Current State Analysis

### 1.1 User model (already Stripe-ready)

`prisma/schema.prisma` already has every field we need — **no migration is required for the core flow**:

```prisma
model User {
  id                   String   @id @default(cuid())
  email                String   @unique
  isPro                Boolean  @default(false)
  stripeCustomerId     String?  @unique
  stripeSubscriptionId String?  @unique
  // ...
}
```

Both Stripe IDs are `@unique`, which is exactly right for webhook lookups (`findUnique({ where: { stripeCustomerId } })`).

**Optional schema additions (recommended, see §6):** to make the UI honest about renewal/cancel state we may add:

```prisma
stripePriceId          String?
stripeCurrentPeriodEnd DateTime?
```

These are not strictly required to gate features, but they let the settings page show "Renews on…" / "Cancels on…". If added, follow the project rule — `npx prisma migrate dev --name add_stripe_period_fields`, never `db push`.

### 1.2 NextAuth configuration & session handling

- **Strategy:** JWT (`src/auth.ts`, `session: { strategy: "jwt" }`). Adapter is Prisma, but sessions are stateless JWTs.
- **Split config:** edge-safe `src/auth.config.ts` (used by `src/proxy.ts`) vs full `src/auth.ts` (Node, uses Prisma/bcrypt).
- **Current callbacks** only thread `user.id` → `token.id` → `session.user.id`:

```ts
// src/auth.ts
callbacks: {
  jwt({ token, user }) {
    if (user) token.id = user.id;
    return token;
  },
  session({ session, token }) {
    if (token.id && session.user) session.user.id = token.id as string;
    return session;
  },
},
```

- **Types:** `src/types/next-auth.d.ts` augments `Session.user` with `id` and `JWT` with `id?`. We will add `isPro` here.

**Key consequence:** because sessions are JWTs (not DB-backed), a webhook that flips `isPro` in the database is **invisible to the existing token** until the JWT is regenerated. This is the central problem the integration must solve — see §1.3 and §4.2.

### 1.3 How user data is accessed

- **Server actions** (`src/actions/*.ts`): every action calls `const session = await auth();` then guards on `session.user.id`. Consistent `ActionResult<T>` discriminated-union return shape: `{ success: true, data } | { success: false, error }`.
- **Server components / fetchers** (`src/lib/db/*.ts`): call `auth()` directly (e.g. `getProfile`) or accept a `userId` param.
- **DB access** is always via the singleton `prisma` from `src/lib/prisma.ts` (Prisma 7 + Neon adapter, generated client at `@/generated/prisma/client`).

For Pro gating, the **source of truth must be the database `isPro` column**, read either directly in server actions (most reliable) or via the session token (good enough for UI). See §4.2 for the trade-off.

### 1.4 Existing payment-related code

**None.** No `src/lib/stripe.ts`, no `stripe` dependency in `package.json`, no `/api/webhooks/*` route, no billing UI. This is a greenfield integration. The Stripe fields on `User` were scaffolded in the initial schema but are completely unused.

---

## 2. Feature Gating Analysis

### 2.1 Free-tier limits (from `context/project-overview.md`)

| Resource           | Free | Pro       |
| ------------------ | ---- | --------- |
| Items (total)      | 50   | Unlimited |
| Collections        | 3    | Unlimited |
| File & Image types | ❌   | ✅        |
| AI features        | ❌   | ✅        |
| Custom types       | ❌   | 🔜        |
| Data export        | ❌   | ✅        |

> **Important:** `project-overview.md` states *"During development, all users can access all features. Pro gating will be enabled before launch."* So gating should be **toggleable** (mirror the existing `EMAIL_VERIFICATION_ENABLED` pattern with a `PRO_GATING_ENABLED` flag) so dev work isn't blocked.

There are currently **no limit constants anywhere** — they must be created (`src/lib/constants/limits.ts`).

### 2.2 Where counts are checked / where to enforce

Counts already exist and are cheap to reuse:

- **Items:** `prisma.item.count({ where: { userId } })` — used in `src/lib/db/profile.ts:58`.
- **Collections:** `prisma.collection.count({ where: { userId } })` — `src/lib/db/profile.ts:59`.

**Enforcement points (server-side, the only place that matters):**

| Limit                | Enforce in                                   | Notes                                                                                  |
| -------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------- |
| 50 items             | `createItem` action (`src/actions/items.ts:116`) | Count before `createItemQuery`. Edits/toggles don't add items, so leave them alone.    |
| 3 collections        | `createCollection` action (`src/actions/collections.ts:34`) | Count before `createCollectionQuery`.                                                  |
| File/Image type      | `createItem` action **and** `/api/upload`    | Block `type === "file" \| "image"` for free users in the action; also guard the upload route (`src/app/api/upload/route.ts`) since it's hit directly. |
| AI features          | (future) each AI action/route                | Not built yet — note for later.                                                        |
| Export               | (future) export action/route                 | Not built yet.                                                                          |

Client-side hiding (e.g. disabling the File/Image pills in `NewItemDialog`, hiding "New Item" when at cap) is **UX only** — the server checks are the real gate.

### 2.3 Pro-only features in the codebase today

- **File & Image uploads** — fully built: `src/app/api/upload/route.ts`, `FileUpload.tsx`, file/image item types. These are the **only** Pro-tier features currently implemented, so they're the primary gating target.
- File/Image already carry a "PRO" badge in the sidebar (per History: *"Sidebar PRO Badge"*).
- AI, custom types, export: **not implemented** — out of scope for this plan beyond leaving hooks.

### 2.4 Settings page structure

`src/app/(app)/settings/page.tsx` is a server component using `getProfile()`, rendering stacked `<section>`s:

- `EditorPreferencesSection`
- Account: `ChangePasswordSection` (conditional on `hasPassword`) + `DeleteAccountSection`

**This is the natural home for a new `BillingSection`** (subscription status + upgrade/manage buttons). The section pattern is: a `<section>` with `h2`, containing a client component that calls server actions and shows toasts (sonner is already wired).

---

## 3. API & Webhook Patterns (to mirror)

- **Route handlers:** `src/app/api/**/route.ts`, export named HTTP methods, `export const runtime = "nodejs"` where Node APIs/Prisma are needed (see `upload/route.ts`). POST handlers are **not cached** in Next 16 (confirmed in `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`), so no extra config needed for the webhook.
- **Raw body for Stripe signatures:** use `await request.text()` in the webhook handler (App Router gives raw body access directly — there is no `bodyParser` config to disable like in the old Pages API).
- **Auth in routes:** `const session = await auth(); if (!session?.user?.id) return 401`.
- **Error shape:** routes return `NextResponse.json({ error }, { status })`; actions return `ActionResult<T>`.
- **Env access:** read `process.env.X` at module top or in a small helper; gate optional integrations on presence (see `rate-limit.ts` creating `redis` only when URL+token exist, and `email.ts` `isEmailVerificationEnabled()`). **Mirror this**: a `getStripe()` that throws clearly if `STRIPE_SECRET_KEY` is missing.
- **Validation:** Zod (v4) everywhere user input is parsed.
- **No `.env.example` exists** — env vars are documented in `CLAUDE.md`/context only. We'll list the new ones in §4.7 and the doc should be added to whatever the project uses for env docs.

---

## 4. Implementation Plan

### 4.0 Install dependency

```bash
npm install stripe
```

Use the official `stripe` Node SDK (server-side only). No client-side Stripe.js is needed because we redirect to **Stripe Checkout** (hosted) and the **Billing Portal** (hosted) — the lightest, most secure approach and the best fit for a solo-built app.

---

### 4.1 Files to CREATE

#### `src/lib/stripe.ts` — SDK singleton + helpers

```ts
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = secretKey
	? new Stripe(secretKey, { apiVersion: "2025-10-29.acacia" }) // pin to installed SDK's version
	: null;

export function getStripe(): Stripe {
	if (!stripe) throw new Error("STRIPE_SECRET_KEY is not set");
	return stripe;
}

export function isStripeEnabled(): boolean {
	return stripe !== null;
}
```

> Pin `apiVersion` to whatever the installed SDK ships with (the SDK errors if it disagrees). Check `node_modules/stripe/types` after install.

#### `src/lib/constants/limits.ts` — free-tier limits + gating flag

```ts
export const FREE_ITEM_LIMIT = 50;
export const FREE_COLLECTION_LIMIT = 3;

export const PRO_ONLY_TYPES = new Set<string>(["file", "image"]);

export function isProGatingEnabled(): boolean {
	return process.env.PRO_GATING_ENABLED === "true";
}
```

#### `src/lib/billing.ts` — central gate helpers (server-only)

```ts
import { prisma } from "@/lib/prisma";
import {
	FREE_ITEM_LIMIT,
	FREE_COLLECTION_LIMIT,
	PRO_ONLY_TYPES,
	isProGatingEnabled,
} from "@/lib/constants/limits";

export async function getUserPlan(userId: string): Promise<{ isPro: boolean }> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { isPro: true },
	});
	return { isPro: user?.isPro ?? false };
}

// Returns an error string if blocked, or null if allowed.
export async function checkItemQuota(userId: string): Promise<string | null> {
	if (!isProGatingEnabled()) return null;
	const { isPro } = await getUserPlan(userId);
	if (isPro) return null;
	const count = await prisma.item.count({ where: { userId } });
	return count >= FREE_ITEM_LIMIT
		? `Free plan is limited to ${FREE_ITEM_LIMIT} items. Upgrade to Pro for unlimited.`
		: null;
}

export async function checkCollectionQuota(userId: string): Promise<string | null> {
	if (!isProGatingEnabled()) return null;
	const { isPro } = await getUserPlan(userId);
	if (isPro) return null;
	const count = await prisma.collection.count({ where: { userId } });
	return count >= FREE_COLLECTION_LIMIT
		? `Free plan is limited to ${FREE_COLLECTION_LIMIT} collections. Upgrade to Pro for unlimited.`
		: null;
}

export async function checkProType(userId: string, type: string): Promise<string | null> {
	if (!isProGatingEnabled()) return null;
	if (!PRO_ONLY_TYPES.has(type)) return null;
	const { isPro } = await getUserPlan(userId);
	return isPro ? null : "File and image uploads are a Pro feature. Upgrade to unlock.";
}
```

> These short-circuit to "allowed" when gating is off, so development is unaffected (matches the project's stated dev posture). Each does at most one extra cheap `count`/`findUnique`.

#### `src/actions/billing.ts` — checkout + portal server actions

```ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getBaseUrl } from "@/lib/get-base-url";

export type ActionResult<T> =
	| { success: true; data: T }
	| { success: false; error: string };

const PRICE_IDS = {
	monthly: process.env.STRIPE_PRICE_MONTHLY!,
	yearly: process.env.STRIPE_PRICE_YEARLY!,
} as const;

export async function createCheckoutSession(
	plan: "monthly" | "yearly",
): Promise<ActionResult<{ url: string }>> {
	const session = await auth();
	if (!session?.user?.id || !session.user.email) {
		return { success: false, error: "Not authenticated" };
	}

	const stripe = getStripe();
	const price = PRICE_IDS[plan];
	if (!price) return { success: false, error: "Plan not configured" };

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { stripeCustomerId: true, isPro: true },
	});
	if (user?.isPro) return { success: false, error: "Already subscribed" };

	// Reuse an existing customer so we don't create duplicates.
	let customerId = user?.stripeCustomerId ?? undefined;
	if (!customerId) {
		const customer = await stripe.customers.create({
			email: session.user.email,
			metadata: { userId: session.user.id },
		});
		customerId = customer.id;
		await prisma.user.update({
			where: { id: session.user.id },
			data: { stripeCustomerId: customerId },
		});
	}

	// getBaseUrl() needs a Request, which actions don't have — read env directly. See §5.
	const baseUrl = process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
	if (!baseUrl) return { success: false, error: "App URL not configured" };
	const checkout = await stripe.checkout.sessions.create({
		mode: "subscription",
		customer: customerId,
		line_items: [{ price, quantity: 1 }],
		success_url: `${baseUrl}/settings?checkout=success`,
		cancel_url: `${baseUrl}/settings?checkout=cancelled`,
		// client_reference_id is a robust fallback for mapping back to our user.
		client_reference_id: session.user.id,
		allow_promotion_codes: true,
	});

	if (!checkout.url) return { success: false, error: "Could not start checkout" };
	return { success: true, data: { url: checkout.url } };
}

export async function createBillingPortalSession(): Promise<
	ActionResult<{ url: string }>
> {
	const session = await auth();
	if (!session?.user?.id) return { success: false, error: "Not authenticated" };

	const stripe = getStripe();
	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { stripeCustomerId: true },
	});
	if (!user?.stripeCustomerId) {
		return { success: false, error: "No billing account found" };
	}

	const portal = await stripe.billingPortal.sessions.create({
		customer: user.stripeCustomerId,
		return_url: `${process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL}/settings`,
	});
	return { success: true, data: { url: portal.url } };
}
```

> The client component calls the action, then does `window.location.href = result.data.url` to redirect to Stripe's hosted page.

#### `src/app/api/webhooks/stripe/route.ts` — webhook handler

```ts
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
	if (!webhookSecret) {
		return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
	}

	const stripe = getStripe();
	const signature = request.headers.get("stripe-signature");
	if (!signature) {
		return NextResponse.json({ error: "Missing signature" }, { status: 400 });
	}

	const rawBody = await request.text(); // RAW body — required for signature check

	let event: Stripe.Event;
	try {
		event = await stripe.webhooks.constructEventAsync(
			rawBody,
			signature,
			webhookSecret,
		);
	} catch (err) {
		console.error("[stripe webhook] signature verification failed", err);
		return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
	}

	try {
		switch (event.type) {
			case "checkout.session.completed": {
				const cs = event.data.object as Stripe.Checkout.Session;
				if (cs.mode !== "subscription") break;
				const customerId = cs.customer as string;
				const subscriptionId = cs.subscription as string;
				const sub = await stripe.subscriptions.retrieve(subscriptionId);
				await syncSubscription(customerId, sub, cs.client_reference_id);
				break;
			}
			case "customer.subscription.created":
			case "customer.subscription.updated":
			case "customer.subscription.deleted": {
				const sub = event.data.object as Stripe.Subscription;
				await syncSubscription(sub.customer as string, sub, null);
				break;
			}
			default:
				break;
		}
	} catch (err) {
		console.error(`[stripe webhook] handler error for ${event.type}`, err);
		// 500 → Stripe retries. Good for transient DB errors.
		return NextResponse.json({ error: "Handler failed" }, { status: 500 });
	}

	return NextResponse.json({ received: true });
}

async function syncSubscription(
	customerId: string,
	sub: Stripe.Subscription,
	clientReferenceId: string | null,
) {
	const active = sub.status === "active" || sub.status === "trialing";

	// Find our user: prefer stripeCustomerId, fall back to client_reference_id.
	let user = await prisma.user.findUnique({
		where: { stripeCustomerId: customerId },
		select: { id: true },
	});
	if (!user && clientReferenceId) {
		user = await prisma.user.findUnique({
			where: { id: clientReferenceId },
			select: { id: true },
		});
		if (user) {
			await prisma.user.update({
				where: { id: user.id },
				data: { stripeCustomerId: customerId },
			});
		}
	}
	if (!user) {
		console.warn("[stripe webhook] no user for customer", customerId);
		return;
	}

	await prisma.user.update({
		where: { id: user.id },
		data: {
			isPro: active,
			stripeSubscriptionId: active ? sub.id : null,
			// If §6 fields are added:
			// stripePriceId: sub.items.data[0]?.price.id ?? null,
			// stripeCurrentPeriodEnd: new Date(sub.items.data[0].current_period_end * 1000),
		},
	});
}
```

> **Idempotency:** these handlers are naturally idempotent (they set absolute state, not deltas), so Stripe's at-least-once delivery / retries are safe. No event-dedup table needed for v1.

#### `src/app/(app)/settings/billing-section.tsx` — client UI

A client component (mirrors `change-password-section.tsx` structure) that:
- Receives `isPro` (and optionally period-end) as props from the server `settings/page.tsx`.
- **Free users:** shows monthly/yearly toggle + "Upgrade to Pro" button → calls `createCheckoutSession(plan)` → `window.location.href = url`.
- **Pro users:** shows status + "Manage subscription" button → calls `createBillingPortalSession()` → redirect.
- Reads `?checkout=success|cancelled` from `useSearchParams()` to fire a sonner toast on return. On `success`, a `router.refresh()` (or full reload) picks up the new `isPro` once the webhook has landed (see §4.2 timing note).

#### `src/components/shared/UpgradePrompt.tsx` (optional)

Small reusable "Upgrade to Pro" inline card/toast helper, shown when a gated action returns its quota error (e.g. in `NewItemDialog`, file/image pills).

---

### 4.2 Files to MODIFY — making `isPro` visible to the session

This is the crux. The research prompt's note is correct that `trigger === "update"` from `useSession().update()` is unreliable for a webhook-driven change (the client never knows when the webhook lands, and `update()` only merges client-supplied data unless the jwt callback re-reads the DB).

**Chosen approach (per research note): re-read `isPro` from the DB in the `jwt` callback on every token validation.**

`src/auth.ts`:

```ts
callbacks: {
	async jwt({ token, user }) {
		if (user) token.id = user.id;

		// Always sync isPro from the DB so webhook updates are reflected.
		if (token.id) {
			const dbUser = await prisma.user.findUnique({
				where: { id: token.id as string },
				select: { isPro: true },
			});
			token.isPro = dbUser?.isPro ?? false;
		}
		return token;
	},
	session({ session, token }) {
		if (token.id && session.user) {
			session.user.id = token.id as string;
			session.user.isPro = (token.isPro as boolean) ?? false;
		}
		return session;
	},
},
```

`src/types/next-auth.d.ts`:

```ts
declare module "next-auth" {
	interface Session {
		user: { id: string; isPro: boolean } & DefaultSession["user"];
	}
}
declare module "next-auth/jwt" {
	interface JWT {
		id?: string;
		isPro?: boolean;
	}
}
```

> ⚠️ **Honest trade-off (flagged for the implementer).** This adds **one DB query to every JWT validation** — i.e. effectively every authenticated server request/`auth()` call — which partially defeats the point of the stateless JWT strategy. It's simple and correct, and at DevStash's scale it's fine. Two lighter alternatives worth considering:
> 1. **Don't put `isPro` in the session at all.** Gating already happens server-side via `src/lib/billing.ts` reading the DB directly (the authoritative path). Use the session's `isPro` only for *cosmetic* UI. If you accept "UI may lag by up to one token refresh," you can drop the per-request query and instead set `token.isPro` only at sign-in + on `trigger === "update"`, and call `useSession().update()` after the user returns from checkout. The server gate stays correct regardless.
> 2. **Throttle the re-read:** store a `proCheckedAt` timestamp in the token and only re-query if it's older than e.g. 60s.
>
> Recommendation: ship approach (1)'s *server-side gate as the source of truth* regardless, and use the prompt's per-request `jwt` re-read **only if** you want `session.user.isPro` to be reliably fresh for UI. Don't rely on the session value for the actual gate — always re-check in `billing.ts` at mutation time. Either way, **a page reload after checkout is sufficient**, as the note states.

#### `src/actions/items.ts` — enforce item + Pro-type quotas in `createItem`

After auth, before `createItemQuery` (around line 124):

```ts
import { checkItemQuota, checkProType } from "@/lib/billing";
// ...
const quotaError = await checkItemQuota(session.user.id);
if (quotaError) return { success: false, error: quotaError };

const typeError = await checkProType(session.user.id, parsed.data.type);
if (typeError) return { success: false, error: typeError };
```

(`parsed` is available after the existing `safeParse`; put the type check after parsing, the count check can go before or after.)

#### `src/actions/collections.ts` — enforce collection quota in `createCollection`

After auth, before `createCollectionQuery` (around line 51):

```ts
import { checkCollectionQuota } from "@/lib/billing";
// ...
const quotaError = await checkCollectionQuota(session.user.id);
if (quotaError) return { success: false, error: quotaError };
```

#### `src/app/api/upload/route.ts` — block uploads for free users

After the auth check (line 12), since this route is callable directly:

```ts
import { checkProType } from "@/lib/billing";
// ... after kind is validated:
const proError = await checkProType(session.user.id, kind); // kind is "file" | "image"
if (proError) return NextResponse.json({ error: proError }, { status: 403 });
```

#### `src/app/(app)/settings/page.tsx` — add Billing section

`getProfile()` doesn't currently return `isPro`. Either extend it or fetch directly:

```ts
// add to settings/page.tsx (server component)
import { getUserPlan } from "@/lib/billing";
import { BillingSection } from "./billing-section";
// inside the component, after profile:
const { isPro } = await getUserPlan(profile.user.id);
// render <BillingSection isPro={isPro} /> as a new <section>
```

(Or add `isPro` + optional period-end to `getProfile`'s user select in `src/lib/db/profile.ts` for one fewer query.)

#### `src/lib/db/profile.ts` — (optional) surface `isPro`

Add `isPro: true` (and period-end fields if added) to the `prisma.user.findUnique` select at line 47, and to `ProfileUser`. Lets both `/profile` and `/settings` show plan status without an extra query.

#### Client UX gating (cosmetic, optional but recommended)

- `src/components/items/NewItemDialog.tsx` — disable File/Image type pills (with a "PRO" hint) when `!session.user.isPro` and gating is on; show the upgrade prompt on the quota error toast.
- `src/components/layout/SidebarUser.tsx` / sidebar — optional "Upgrade to Pro" entry for free users.
- File/Image already show a PRO badge in the sidebar — wire those to actually point at `/settings`.

---

### 4.3 Stripe Dashboard setup steps

1. **Create the Product:** Dashboard → Products → *DevStash Pro*.
2. **Add two recurring Prices** under that product:
   - `$8.00 USD / month` → copy the price ID → `STRIPE_PRICE_MONTHLY`.
   - `$72.00 USD / year` → copy the price ID → `STRIPE_PRICE_YEARLY`.
3. **API keys:** Developers → API keys → copy **Secret key** → `STRIPE_SECRET_KEY` (use **test mode** keys for dev).
4. **Configure the Billing Portal:** Settings → Billing → Customer portal → enable it, allow plan cancellation/switching, save. (Required for `billingPortal.sessions.create` to work.)
5. **Create the webhook endpoint:** Developers → Webhooks → Add endpoint:
   - URL: `https://YOUR_DOMAIN/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.
   - Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`.
6. **Local dev:** install the Stripe CLI and run
   `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   — it prints a `whsec_…` signing secret to use as `STRIPE_WEBHOOK_SECRET` locally. Trigger test events with `stripe trigger checkout.session.completed`.

---

### 4.4 Environment variables to add

| Var                     | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| `STRIPE_SECRET_KEY`     | Server SDK auth (`sk_test_…` / `sk_live_…`)      |
| `STRIPE_WEBHOOK_SECRET` | Verify webhook signatures (`whsec_…`)            |
| `STRIPE_PRICE_MONTHLY`  | Price ID for $8/mo                               |
| `STRIPE_PRICE_YEARLY`   | Price ID for $72/yr                              |
| `PRO_GATING_ENABLED`    | `"true"` to enforce free-tier limits (off in dev)|

All read via `process.env` (matches existing pattern). No `NEXT_PUBLIC_*` needed — checkout/portal redirects are created server-side.

---

### 4.5 Testing checklist

**Unit (Vitest — actions + lib only, per project rules):**

- [ ] `src/lib/billing.test.ts` — `checkItemQuota` / `checkCollectionQuota` / `checkProType` return `null` when gating off, when under limit, and when Pro; return error string at/over limit for free users. Mock `prisma` with `vi.mock`.
- [ ] `src/actions/items.test.ts` — extend: `createItem` returns quota error at 50 items (free), succeeds for Pro / when gating off; file/image type blocked for free user.
- [ ] `src/actions/collections.test.ts` — extend: `createCollection` blocked at 3 collections for free user.
- [ ] `src/actions/billing.test.ts` — `createCheckoutSession` rejects unauthenticated / already-Pro; reuses existing `stripeCustomerId`; creates customer when absent. Mock `stripe` and `prisma`.

> No webhook/route unit tests (the project scopes Vitest to `src/actions/**` and `src/lib/**`, not routes). Verify the webhook manually with the Stripe CLI.

**Manual / integration:**

- [ ] Free user hits 50 items → 51st blocked with upgrade message.
- [ ] Free user hits 3 collections → 4th blocked.
- [ ] Free user blocked from file/image create **and** from `/api/upload` directly (curl with a valid session).
- [ ] Upgrade flow: click Upgrade → Stripe Checkout (test card `4242 4242 4242 4242`) → redirect back to `/settings?checkout=success`.
- [ ] Webhook fires `checkout.session.completed` → `isPro` flips to `true` in DB (check Neon `development` branch).
- [ ] After reload, `session.user.isPro` is `true`; gated features unlock.
- [ ] Manage subscription → Billing Portal opens → cancel → `customer.subscription.deleted` → `isPro` back to `false`, `stripeSubscriptionId` cleared.
- [ ] Bad signature returns 400; missing env returns clean 500.
- [ ] `npm run build` and `npm run test` pass.

---

### 4.6 Implementation order

1. `npm install stripe`; add env vars; create `src/lib/stripe.ts`.
2. `src/lib/constants/limits.ts` + `src/lib/billing.ts` (+ unit tests). **Gate logic first, gating flag off** — nothing changes in dev yet.
3. Wire quota checks into `createItem`, `createCollection`, `/api/upload` (+ extend action tests).
4. `src/actions/billing.ts` (checkout + portal) (+ tests).
5. `src/app/api/webhooks/stripe/route.ts`; test with Stripe CLI.
6. Update `src/auth.ts` jwt/session callbacks + `next-auth.d.ts` for `isPro`.
7. `billing-section.tsx` + add to `settings/page.tsx`; surface `isPro` via `getProfile`/`getUserPlan`.
8. Cosmetic client gating (NewItemDialog pills, upgrade prompts).
9. Stripe Dashboard setup (products, prices, portal, webhook).
10. Full manual run-through; `npm run build` + `npm run test`.
11. Flip `PRO_GATING_ENABLED=true` only when intentionally enforcing limits (per project's "enable gating before launch").

---

## 5. Gotchas & notes for the implementer

- **`getBaseUrl` requires a `Request` — don't use it in `billing.ts`.** The actual signature is `getBaseUrl(request: Request)`: it returns `process.env.AUTH_URL` → `process.env.NEXT_PUBLIC_APP_URL` → `new URL(request.url).origin`. Server actions have no `Request`, so calling it there won't compile/work. In `billing.ts` build the base URL directly from env, e.g. `const baseUrl = process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;` (one of these **must** be set for actions to produce absolute success/return URLs). Replace the `getBaseUrl()` calls in the §4.1 `billing.ts` example accordingly.
- **Raw body:** never `request.json()` in the webhook before verifying — Stripe signature checks the exact raw bytes. Use `await request.text()` + `constructEventAsync` (async variant works in all runtimes).
- **`current_period_end` location:** in recent Stripe API versions this moved onto the subscription *item* (`sub.items.data[0].current_period_end`), not the top-level subscription. Confirm against the installed SDK's types before persisting period-end (§6).
- **API version pin:** the `stripe` constructor's `apiVersion` must match the installed SDK; check the value the SDK exports rather than hardcoding the one in this doc.
- **Webhook is excluded from auth proxy:** `src/proxy.ts` matcher already excludes `/api` (`"/((?!api|...).*)"`), so the webhook route is reachable without a session. Good — but double-check no later catch-all guards `/api/webhooks`.
- **Don't trust the client for plan state:** all real gates live server-side in `billing.ts`, re-checked at mutation time. `session.user.isPro` is for UI only.
- **Migrations:** if adding the §6 fields, use `npx prisma migrate dev` against the Neon `development` branch — never `db push`, never touch `production`.
- **Currency/amount:** $72/yr = `7200` cents; $8/mo = `800` cents — but these are set in the Stripe Dashboard, not in code, so the app only references price IDs.

---

## 6. Optional schema additions (nice-to-have)

```prisma
model User {
  // ...existing...
  stripePriceId          String?
  stripeCurrentPeriodEnd DateTime?
}
```

Enables the settings UI to show "Renews on {date}" / "Access until {date}" after cancel, and to distinguish monthly vs yearly. Populate both in `syncSubscription`. Migration: `npx prisma migrate dev --name add_stripe_period_fields`. Skip for a minimal v1 — `isPro` + `stripeSubscriptionId` are enough to gate features.

---

## 7. Summary of file changes

**Create (8):**
- `src/lib/stripe.ts`
- `src/lib/constants/limits.ts`
- `src/lib/billing.ts` (+ `billing.test.ts`)
- `src/actions/billing.ts` (+ `billing.test.ts`)
- `src/app/api/webhooks/stripe/route.ts`
- `src/app/(app)/settings/billing-section.tsx`
- `src/components/shared/UpgradePrompt.tsx` (optional)

**Modify (7):**
- `src/auth.ts` (jwt/session callbacks → `isPro`)
- `src/types/next-auth.d.ts` (`isPro` on Session + JWT)
- `src/actions/items.ts` (item + Pro-type quota in `createItem`)
- `src/actions/collections.ts` (collection quota in `createCollection`)
- `src/app/api/upload/route.ts` (block free users)
- `src/app/(app)/settings/page.tsx` (render BillingSection)
- `src/lib/db/profile.ts` (surface `isPro`, optional)

**Schema (optional):** `prisma/schema.prisma` + migration for `stripePriceId` / `stripeCurrentPeriodEnd`.

**Config:** `package.json` (`stripe` dep), 5 new env vars.
