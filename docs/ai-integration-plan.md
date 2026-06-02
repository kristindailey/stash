# AI Integration Plan — OpenAI `gpt-5-nano`

> Research doc only. No code has been written. This captures best practices and
> the concrete patterns Stash should follow when wiring the four Pro AI
> features: **auto-tagging**, **AI summaries**, **code explanation**, and
> **prompt optimization**.

---

## 1. Why `gpt-5-nano`

`gpt-5-nano` is the fastest, cheapest GPT-5 tier — purpose-built for
summarization and classification, which is exactly the shape of all four
Stash features.

| Attribute       | Value                                            |
| --------------- | ------------------------------------------------ |
| Input price     | ~$0.05 / 1M tokens                               |
| Output price    | ~$0.40 / 1M tokens                               |
| Best for        | Summaries, classification, short rewrites, tagging |
| New params      | `reasoning_effort`, `verbosity`                  |

### GPT-5 family parameters (replace the old `temperature`/`max_tokens` mindset)

- **`reasoning_effort`**: `minimal | low | medium | high`. Use **`minimal`** for
  auto-tagging and code explanation (deterministic, latency-sensitive, no chain
  of thought needed). Use **`low`** for prompt optimization where a little
  reasoning improves quality.
- **`verbosity`**: `low | medium | high`. Use **`low`** for tags (just the
  labels), **`medium`** for summaries and explanations.

> Note: explicit instructions in the prompt override `verbosity`. Keep system
> prompts tight so the two don't fight.

**Sources:**
- [GPT-5 nano model](https://developers.openai.com/api/docs/models/gpt-5-nano)
- [Introducing GPT-5 for developers](https://openai.com/index/introducing-gpt-5-for-developers/)
- [GPT-5 new params and tools (cookbook)](https://cookbook.openai.com/examples/gpt-5/gpt-5_new_params_and_tools)

---

## 2. SDK setup & configuration

### Dependency

Add the official SDK (do **not** add the Vercel `ai` SDK — see §4):

```bash
npm install openai
```

The repo already uses **Zod v4** (`zod@^4.4.3`). Be aware: the OpenAI SDK's
`zodResponseFormat` / `.parse()` helper historically imports from `zod/v3`.
With structured outputs under Zod v4, prefer one of:
- pass a hand-written JSON schema to `response_format`, or
- import the helper-compatible schema via `zod/v3` for the AI helpers only.

Validate this against the installed SDK version before committing — this is the
single most likely integration snag given our Zod major version.

### Environment variable

Add to `.env.example` (currently has **no** OpenAI key):

```
OPENAI_API_KEY=
```

The key is **server-only**. It must never appear in a `'use client'` file, in
`NEXT_PUBLIC_*`, or be returned to the browser. All four features run inside
server actions, so the key never leaves the server.

### Client singleton — `src/lib/openai.ts`

Mirror the guarded-singleton pattern already used in `src/lib/stripe.ts` and
`src/lib/rate-limit.ts` (graceful no-op when the env var is absent, so local dev
and CI don't crash):

```typescript
import OpenAI from "openai";
import "server-only";

const apiKey = process.env.OPENAI_API_KEY;

export const openai = apiKey ? new OpenAI({ apiKey }) : null;

export const AI_MODEL = "gpt-5-nano";
```

Add `import "server-only"` so an accidental client import is a build error.
Every consumer must handle `openai === null` (return a friendly "AI is not
configured" error), exactly how `rate-limit.ts` fails open when Redis is
missing.

**Source:** [OpenAI Node SDK](https://github.com/openai/openai-node)

---

## 3. Server action patterns (match existing codebase conventions)

Every AI feature should be a server action that reuses the **exact** shape used
across `src/actions/*.ts`:

1. `"use server"` at the top of the file (e.g. `src/actions/ai.ts`).
2. `const session = await auth();` → bail with `{ success: false }` if no user.
3. **Pro gate** (see §6) before doing any work.
4. **Rate limit** check (see §5).
5. Zod-validate the input.
6. Call OpenAI; wrap in try/catch.
7. Return the shared `ActionResult<T>` discriminated union.

The codebase already exports this contract from `src/actions/items.ts`:

```typescript
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### Skeleton for an AI action

```typescript
"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { openai, AI_MODEL } from "@/lib/openai";
import { requireProForAI } from "@/lib/billing";       // see §6
import { checkAiRateLimit } from "@/lib/rate-limit";    // see §5
import type { ActionResult } from "@/actions/items";

const tagInput = z.object({
  content: z.string().min(1).max(20_000),
  title: z.string().max(200).optional(),
});

export async function suggestTags(
  input: z.input<typeof tagInput>,
): Promise<ActionResult<{ tags: string[] }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const proError = await requireProForAI(session.user.id);
  if (proError) return { success: false, error: proError };

  const rl = await checkAiRateLimit(session.user.id);
  if (!rl.success) {
    return { success: false, error: "Too many AI requests. Try again shortly." };
  }

  const parsed = tagInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (!openai) {
    return { success: false, error: "AI is not configured." };
  }

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      reasoning: { effort: "minimal" },
      text: { verbosity: "low" },
      input: [
        { role: "system", content: "Suggest 3-6 short lowercase tags. Return JSON {\"tags\": string[]}." },
        { role: "user", content: parsed.data.content.slice(0, 20_000) },
      ],
    });
    const tags = parseTags(response.output_text);
    return { success: true, data: { tags } };
  } catch (err) {
    console.error("[ai] suggestTags failed", err);
    return { success: false, error: "Could not generate tags. Please try again." };
  }
}
```

> Per repo standards (`coding-standards.md`), AI actions live in
> `src/actions/ai.ts` and are unit-testable with Vitest (`vi.mock()` the
> `openai` client, just like Prisma/Resend are mocked today). Components are not
> tested.

### Responses API vs Chat Completions

Prefer the **Responses API** (`openai.responses.create`) for GPT-5 — it's the
current first-class surface and supports `reasoning` / `text.verbosity`. Use
`response.output_text` for the concatenated text. Chat Completions
(`chat.completions.parse` + `zodResponseFormat`) still works and is the cleanest
path for **structured** tag output, but watch the Zod v3/v4 helper caveat (§2).

**Source:** [OpenAI Node — Responses & streaming](https://github.com/openai/openai-node/blob/master/README.md)

---

## 4. Streaming vs non-streaming

Decide per feature — don't stream everything.

| Feature            | Mode          | Why                                              |
| ------------------ | ------------- | ------------------------------------------------ |
| Auto-tagging       | Non-streaming | Tiny output (a few tags); render all at once.    |
| AI summary         | Streaming     | Multi-sentence; perceived speed matters.         |
| Code explanation   | Streaming     | Longer prose; users want to read as it arrives.  |
| Prompt optimizer   | Streaming     | Rewrites can be long; show progress.             |

**Recommendation: do NOT add the Vercel `ai` SDK.** It's the popular path for
chat UIs, but Stash has no chat surface, already standardizes on plain server
actions + `ActionResult`, and adding a second framework layer fights the
existing patterns. Two viable native approaches:

1. **Simplest (recommended to start): non-streaming server actions for all
   four.** `gpt-5-nano` with `reasoning_effort: minimal` is fast; for short
   summaries/tags the latency is acceptable and the code stays identical to
   every other action in the repo. Show a spinner, return the full result.

2. **Streaming when needed:** use a **Route Handler** (`app/api/ai/.../route.ts`)
   that returns the SDK's SSE stream, since React Server Actions are not the
   natural fit for token streaming. The OpenAI SDK streams directly:

   ```typescript
   const stream = await openai.responses.create({
     model: AI_MODEL,
     input: prompt,
     stream: true,
   });
   for await (const event of stream) { /* forward delta to client */ }
   ```

   Per `coding-standards.md`, API routes are the right tool for "long-running
   operations" — streaming qualifies. The client reads the stream and appends
   deltas to local state.

Start with approach #1 for the MVP of all four features; promote summary /
explanation / optimizer to approach #2 only if latency feels bad in practice.

**Sources:**
- [Streamlining OpenAI responses in Next.js](https://www.creolestudios.com/streamline-openai-responses-nextjs/)
- [Real-time AI in Next.js with the Vercel AI SDK (LogRocket)](https://blog.logrocket.com/nextjs-vercel-ai-sdk-streaming/)

---

## 5. Error handling & rate limiting

### Error handling

- Always `try/catch` around the OpenAI call (repo standard for actions).
- Log the raw error server-side (`console.error("[ai] ...", err)`), return a
  **generic** user-facing message — never leak the OpenAI error body, which can
  echo input or internal details.
- Handle the `openai === null` (unconfigured) case explicitly.
- Map common failures: 429 from OpenAI → "AI is busy, try again";
  timeout/network → "Could not reach AI service."
- Surface all of this via the existing **sonner toast** pattern the UI already
  uses for CRUD results.

### Rate limiting

Reuse `src/lib/rate-limit.ts` (Upstash sliding window). It currently defines
auth limiters; add an AI limiter **keyed by `userId`** (not IP — these are
authenticated, costed calls):

```typescript
// add to the limiters map in src/lib/rate-limit.ts
aiRequest: buildLimiter(20, "1 h", "ai-request"),
```

Then a thin helper:

```typescript
export async function checkAiRateLimit(userId: string) {
  return checkRateLimit("aiRequest", `user:${userId}`);
}
```

This piggybacks on the existing fail-open behavior (if Redis is unset, calls are
allowed) and the `RateLimitResult` shape. Pick limits that protect the OpenAI
bill — e.g. 20 AI calls/hour/user as a starting point, tune later. The Pro gate
already caps the audience to paying users, so the limiter is a cost backstop,
not an abuse wall.

---

## 6. Pro user gating

Per `project-overview.md`, all four AI features are **Pro-only**. Gating already
exists in `src/lib/billing.ts` and is toggled by `PRO_GATING_ENABLED`.

`billing.ts` exposes `getUserPlan(userId)` → `{ isPro }`. Add a parallel helper
matching the style of `checkProType` (returns an error string or `null`):

```typescript
// src/lib/billing.ts
export async function requireProForAI(userId: string): Promise<string | null> {
  if (process.env.PRO_GATING_ENABLED !== "true") return null; // dev: open
  const { isPro } = await getUserPlan(userId);
  if (isPro) return null;
  return "AI features are a Pro feature. Upgrade to Pro to use them.";
}
```

This mirrors how `checkItemQuota` / `checkProType` return a message consumed by
the action and shown via toast. Note the existing pattern keys gating off
`PRO_GATING_ENABLED` so AI works for everyone in development and only locks down
before launch — match that exactly.

UI side: reuse the existing **Upgrade** affordances (the `/upgrade` page, crown
icon, ghost "Upgrade" TopBar button already shipped). For free users, AI buttons
should show a locked/crowned state that routes to `/upgrade`, the same way Files
& Images already redirect free users there.

---

## 7. Cost optimization

`gpt-5-nano` is already the cheapest tier; layer these on top:

- **`reasoning_effort: minimal`** for tagging/explanation — fewer reasoning
  tokens = lower cost + lower latency.
- **`verbosity: low`** for tags; cap output with tight prompts. Output tokens
  cost 8× input, so short outputs matter most.
- **Truncate input** before sending (`.slice(0, N)`), and skip the call entirely
  for trivially short content (e.g. < 20 chars → no tags worth generating).
- **Cache results on the item.** Summaries/explanations don't change unless the
  content changes. Consider persisting AI output (e.g. a `summary` /
  `aiTags` column, or a small `AiResult` table keyed by item + feature +
  content hash) so re-opening a drawer doesn't re-bill. This needs a Prisma
  migration (`prisma migrate dev`, never `db push`).
- **Per-user rate limit** (§5) caps worst-case spend.
- **Debounce** auto-tag triggers — don't fire on every keystroke; fire on a
  button click or on blur/save.
- Log `response.usage` (token counts) server-side to monitor real spend.

**Source:** [GPT-5 nano model & pricing](https://developers.openai.com/api/docs/models/gpt-5-nano)

---

## 8. UI patterns (loading / accept-reject)

Match the existing drawer + dialog + sonner conventions already in the app.

- **Loading**: disable the trigger button, swap its icon for a spinner; for
  streaming, render incoming text live in the target field. Skeletons for
  larger blocks (consistent with the app's skeleton loading states).
- **Auto-tagging — accept/reject**: render suggested tags as **pending chips**
  with a ✓ (add) and ✗ (dismiss) per chip, plus "Add all". Don't auto-apply —
  the user confirms. On accept, merge into the existing `tags` array that
  `updateItem` already handles (it dedupes + `connectOrCreate`).
- **Summary / explanation**: show output in a bordered panel with a **Copy**
  button (reuse the existing `CopyButton`) and an **Insert** / **Save** action
  if it should persist to the item's `description`/`content`.
- **Prompt optimizer**: side-by-side or before/after view; **Replace** button
  swaps the prompt content, **Keep original** dismisses. Always let the user
  reject — never silently overwrite their content.
- **Errors**: sonner toast with the generic message; keep the user's original
  input intact on failure.
- **Pro-locked state**: crown badge on the AI button for free users → `/upgrade`.

Place these inside the existing `ItemDrawer` (view + edit modes) where the
content already lives, and the New Item dialog where relevant (auto-tag on
create).

**Source:** [Vercel AI SDK streaming UI patterns](https://callsphere.ai/blog/vercel-ai-sdk-streaming-interfaces-react-nextjs-usechat)

---

## 9. Security considerations

- **API key**: server-only env var, guarded singleton, `import "server-only"` in
  `src/lib/openai.ts`. Never `NEXT_PUBLIC_`, never returned to the client.
- **Auth on every action**: `await auth()` + `session.user.id` check before any
  AI work — identical to every existing action.
- **Input validation/sanitization**: Zod-validate and **length-cap** all input
  (`.max(...)`) before sending to OpenAI — bounds cost and limits prompt-
  injection surface. Treat item content as untrusted user data.
- **Prompt injection**: keep system instructions authoritative and separate from
  user content (distinct message roles, as in §3). Don't let user content
  redefine the task. For tagging, validate the model output (must be an array of
  short strings) before persisting — never trust raw model JSON.
- **Output handling**: AI output is also untrusted. When rendering summaries/
  explanations as markdown, reuse the existing sanitized markdown renderer; do
  not `dangerouslySetInnerHTML` raw model output.
- **No PII leakage in logs**: log token usage and error codes, not full prompts/
  content.
- **Rate limit by user** (§5) to prevent a single account from running up the
  bill.

---

## 10. Suggested implementation order

1. `src/lib/openai.ts` singleton + `OPENAI_API_KEY` in `.env.example`.
2. `requireProForAI` in `src/lib/billing.ts` + `aiRequest` limiter in
   `src/lib/rate-limit.ts`.
3. `src/actions/ai.ts` with `suggestTags` (non-streaming, simplest, highest
   value) + Vitest mocks.
4. Wire auto-tag accept/reject UI into `ItemDrawer` edit mode.
5. Add `summarize` + `explainCode` actions (start non-streaming).
6. Add `optimizePrompt` action + before/after UI.
7. (Optional) Promote long-output features to streaming Route Handlers if
   latency warrants.
8. (Optional) Persist/cache AI results via a Prisma migration to cut repeat cost.

---

## Open questions for the team

- **Caching/persistence**: store AI output on the item (needs migration) or
  regenerate each time? Affects schema + cost.
- **Zod v4 + OpenAI structured-output helper**: confirm `zodResponseFormat`
  compatibility on the installed SDK version, or go with raw JSON schema.
- **Rate limit numbers**: 20/hour/user is a placeholder — set against an actual
  budget.
- **Streaming**: ship non-streaming MVP first, or invest in streaming Route
  Handlers up front for summary/explanation/optimizer?