# Item CRUD Architecture

Design for a unified CRUD system that handles all 7 item types (snippet, prompt, command, note, file, image, link) through one set of server actions, one set of db fetchers, one dynamic route, and shared components that adapt by type.

The schema treats every item as a row in `Item` with a single `ContentType` (`TEXT` | `FILE` | `URL`) and a foreign key to `ItemType`. That uniformity is what makes a single CRUD pipeline possible — the *type* drives presentation, but the data layer is one shape.

See also: [`docs/item-types.md`](./item-types.md) for the per-type breakdown this doc builds on.

---

## Guiding principles

1. **One mutation surface.** All writes for all 7 types go through one server-action file. Different types are different payload shapes, not different actions.
2. **Read directly in server components.** Fetchers live in `src/lib/db/` and are called from server components — no API routes for reads, no client fetches.
3. **One dynamic route.** `/items/[type]` (and `/items/[type]/[id]`) for list + detail/edit. Page-level code is type-agnostic; type-specific branching happens inside components.
4. **Type-specific logic lives in components, not actions.** The action accepts a discriminated union, validates it, and writes; it does not contain `if (type === "snippet") ...` UI logic.
5. **Auth at the action boundary.** Every mutation calls `auth()` and refuses if `session.user.id` is missing. Fetchers do the same.
6. **Validate at the boundary.** Zod schemas — one per `ContentType` — feed a discriminated union. Internal code trusts the validated shape.
7. **Pro gating where required.** `file` and `image` types are gated server-side in the action; the UI hides the option, but the action enforces it.

---

## File structure

```
src/
├── actions/
│   └── items.ts              # ← create/update/delete/toggle for ALL item types
├── lib/
│   ├── db/
│   │   └── items.ts          # ← read fetchers (already exists; extend)
│   ├── validation/
│   │   └── item.ts           # ← Zod schemas keyed by ContentType
│   └── constants/
│       └── item-types.ts     # ← already exists (icons, colors, labels)
├── app/
│   └── (app)/
│       └── items/
│           └── [type]/
│               ├── page.tsx                # list page
│               ├── new/
│               │   └── page.tsx            # create page
│               └── [id]/
│                   └── page.tsx            # detail / edit page
├── components/
│   └── items/
│       ├── ItemList.tsx                    # type-agnostic list shell
│       ├── ItemCard.tsx                    # row/card, branches by ContentType
│       ├── ItemForm.tsx                    # form shell, picks editor by type
│       ├── editors/
│       │   ├── TextEditor.tsx              # snippet / prompt / command / note
│       │   ├── FileUploader.tsx            # file / image
│       │   └── UrlInput.tsx                # link
│       ├── viewers/
│       │   ├── TextViewer.tsx              # markdown / code render
│       │   ├── FileViewer.tsx
│       │   ├── ImageViewer.tsx
│       │   └── LinkViewer.tsx
│       ├── ItemActions.tsx                 # pin / favorite / delete buttons
│       └── ItemTypeBadge.tsx               # icon + label chip
```

**Why one `items.ts` instead of `snippets.ts`, `prompts.ts`, etc.:** The data model is identical across types; the only variation is *which fields are meaningful*. Splitting would force every fetch/mutation to be re-implemented 7×.

---

## How `/items/[type]` routing works

### Single dynamic segment

Per `context/project-overview.md`, types route as `/items/snippets`, `/items/prompts`, etc. We use `[type]` as the dynamic segment and accept the **plural** name in the URL (`snippets`, `links`, ...). The page strips the trailing `s` to look up the item type by its system name.

```
/items/snippets             → list of snippets
/items/snippets/new         → create form, type pre-selected
/items/snippets/{id}        → detail/edit
```

### Validating the type segment

Each page is responsible for:

1. Reading `params.type` (e.g. `"snippets"`).
2. Singularizing to `"snippet"`.
3. Looking up the `ItemType` by name + `userId` (system types have `userId: null`, custom types belong to the user).
4. Calling `notFound()` if the type doesn't exist for the user.

This lookup belongs in a helper in `src/lib/db/items.ts`:

```ts
// resolves "snippets" → ItemType row (system or user-owned) or null
export async function getItemTypeBySlug(slug: string): Promise<ItemType | null>
```

### Pages stay thin

The page itself doesn't render type-specific UI:

```tsx
// app/(app)/items/[type]/page.tsx
export default async function ItemListPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const itemType = await getItemTypeBySlug(type);
  if (!itemType) notFound();

  const items = await getItemsByType(itemType.id);
  return <ItemList itemType={itemType} items={items} />;
}
```

Same shape for `[id]/page.tsx`: load the item, hand it to a shared `ItemView` or `ItemForm`.

---

## Server actions: `src/actions/items.ts`

One file. Mutations only. Each function is named for the verb, not the type.

```ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createItemSchema, updateItemSchema } from "@/lib/validation/item";
import { revalidatePath } from "next/cache";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createItem(input: unknown): Promise<ActionResult<{ id: string }>>
export async function updateItem(id: string, input: unknown): Promise<ActionResult>
export async function deleteItem(id: string): Promise<ActionResult>
export async function toggleFavorite(id: string): Promise<ActionResult>
export async function togglePin(id: string): Promise<ActionResult>
```

### Inside each action

1. **Auth check** — `const session = await auth(); if (!session?.user?.id) return { success: false, error: "Not authenticated" };`
2. **Parse + validate** — `const parsed = createItemSchema.safeParse(input);` returns a discriminated union over `ContentType`.
3. **Authorize** — for update/delete, confirm `item.userId === session.user.id` (don't trust the client). For Pro-gated types, check `user.isPro`.
4. **Write** — single `prisma.item.create / update / delete` call.
5. **Revalidate** — `revalidatePath(\`/items/${typeName}s\`)` and `revalidatePath("/dashboard")` for pinned/recent.
6. **Return** — `{ success, data | error }`.

### Discriminated payload (Zod)

`src/lib/validation/item.ts`:

```ts
const baseItem = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  itemTypeId: z.string().cuid(),
  tags: z.array(z.string()).max(20).default([]),
  collectionIds: z.array(z.string().cuid()).default([]),
});

const textItem = baseItem.extend({
  contentType: z.literal("TEXT"),
  content: z.string().min(1),
  language: z.string().optional(),
});

const fileItem = baseItem.extend({
  contentType: z.literal("FILE"),
  fileUrl: z.string().url(),
  fileName: z.string(),
  fileSize: z.number().int().positive(),
});

const urlItem = baseItem.extend({
  contentType: z.literal("URL"),
  url: z.string().url(),
});

export const createItemSchema = z.discriminatedUnion("contentType", [
  textItem, fileItem, urlItem,
]);
export const updateItemSchema = createItemSchema.partial({ contentType: true });
```

The action does **not** branch on `itemType.name`. It branches on `contentType`, of which there are only three. All seven types collapse into one of those branches.

---

## Data fetching: `src/lib/db/items.ts`

Already partially built (existing exports: `getPinnedItems`, `getRecentItems`, `getSidebarItemTypes`, `getDashboardStats`). Extend with:

```ts
export async function getItemTypeBySlug(slug: string): Promise<ItemType | null>
export async function getItemsByType(itemTypeId: string, opts?: {
  search?: string;
  collectionId?: string;
  limit?: number;
  cursor?: string;
}): Promise<DashboardItem[]>
export async function getItemById(id: string): Promise<DashboardItem | null>
```

**Rules for fetchers:**

- Always scoped to `userId` from `auth()` (the current demo-user fallback in `getDemoUserId` should be replaced with the real session once auth is wired into reads — `src/actions/profile.ts` already uses `auth()`).
- Called directly from server components — no `"use server"`, no API route wrapper.
- Return the existing `DashboardItem` shape (or a wider `ItemDetail` for the single-item view that includes the full `content`/`fileUrl`/`url` and collection memberships).
- Use the existing `itemInclude` / `toDashboardItem` helpers so all reads share one normalization.

---

## Components: where type-specific logic lives

The action layer doesn't care about types. The UI does. This is where the seven types diverge.

### `ItemList.tsx` (server component)

- Receives `{ itemType, items }`.
- Renders a header (icon + label + count + "New" button via `ITEM_TYPE_ICONS` / `ITEM_TYPE_COLORS` / `ITEM_TYPE_LABELS`).
- Maps `items` into `<ItemCard>`. Doesn't know what type they are.

### `ItemCard.tsx` (server component, with a small client island for actions)

- Branches on `item.contentType`:
  - `TEXT` → show truncated `content` preview, plus `language` chip if set.
  - `URL` → show `url` (hostname only) as the preview.
  - `FILE` → show `fileName` + formatted `fileSize`; image type may show a thumbnail from `fileUrl`.
- Pin/favorite/delete buttons live in a small `"use client"` `ItemActions` child that calls the server actions.

### `ItemForm.tsx` (client component)

- One form, three editor slots — picks one based on the item type's expected `ContentType`:
  - `TEXT` → `<TextEditor>` (markdown for `note`, code editor with `language` selector for `snippet`, plain textarea for `prompt` / `command`).
  - `FILE` → `<FileUploader>` (Pro-only; uploads to R2, sets `fileUrl` / `fileName` / `fileSize`).
  - `URL` → `<UrlInput>`.
- Shared fields (title, description, tags, collections, favorite/pin) render around the editor regardless of type.
- On submit: calls `createItem` or `updateItem` server action, shows toast, redirects.

### `ItemActions.tsx` (client component)

- Tiny wrappers around `toggleFavorite`, `togglePin`, `deleteItem`.
- Same behavior for every type — no branching.

### `viewers/*.tsx`

- Read-only renderers. Same pattern as editors: one per `ContentType`, plus a thin specialization (e.g. `ImageViewer` shows the image inline, `FileViewer` shows a download button).

### Type-specific behavior summary

| Behavior                          | Lives in                                |
| --------------------------------- | --------------------------------------- |
| Icon + color on cards/headers     | `ITEM_TYPE_ICONS` / `ITEM_TYPE_COLORS`  |
| Plural label / route              | derived from `itemType.name + "s"`      |
| Markdown vs code vs textarea      | `TextEditor` reads `itemType.name`      |
| Show file uploader vs URL input   | branches on `ContentType`               |
| Thumbnail for images              | `ImageViewer` / `ItemCard` special case |
| Hide content preview on pinned    | `PinnedSection` (existing)              |
| Syntax highlighting language      | `language` field, shown for snippets    |

**Type-specific logic that lives in components — *not* in actions:**
- "Notes use a markdown editor" — `TextEditor` decision.
- "Images render a thumbnail" — `ImageViewer` decision.
- "Commands are usually one line" — `TextEditor` default rows.
- "Snippets get a language picker" — `TextEditor` shows it when `itemType.name === "snippet"`.

The action just stores whatever shape Zod validated. The component decides how to collect and present it.

---

## Auth & authorization

| Concern                 | Where it's enforced                                 |
| ----------------------- | --------------------------------------------------- |
| Authenticated?          | Every action and fetcher calls `await auth()`       |
| Owns the item?          | `prisma.item.findFirst({ where: { id, userId } })`  |
| Pro-only type (file/image) | Action checks `user.isPro` for `ContentType.FILE` |
| Custom item type ownership | When `itemType.userId` is set, must equal session user |

Route protection (`/items/*`) goes in `src/proxy.ts` next to the existing `/dashboard`, `/profile` rules.

---

## Revalidation

Every mutation calls `revalidatePath` for the affected surfaces:

| Mutation                | Revalidate                                    |
| ----------------------- | --------------------------------------------- |
| `createItem`            | `/items/{type}s`, `/dashboard`                |
| `updateItem`            | `/items/{type}s`, `/items/{type}s/{id}`, `/dashboard` |
| `deleteItem`            | `/items/{type}s`, `/dashboard`                |
| `toggleFavorite`        | `/items/{type}s`, `/dashboard`                |
| `togglePin`             | `/items/{type}s`, `/dashboard`                |

Path is derived from the item's `itemType.name` after the write, so the action looks up the type name from the same query that loads the item.

---

## What this design deliberately doesn't do

- **No per-type action files.** No `src/actions/snippets.ts`, no `src/actions/links.ts`. One file, one set of verbs.
- **No per-type route folders.** No `app/(app)/items/snippets/page.tsx`. One dynamic `[type]` segment.
- **No type-discrimination in the action body.** Branching is over `ContentType` (3 cases), not `itemType.name` (7 cases). The action treats `note` and `prompt` identically.
- **No API routes for CRUD.** Server actions for mutations; direct Prisma in server components for reads. API routes are reserved for file upload (progress tracking) and webhooks, per `context/coding-standards.md`.

---

## Implementation order (suggested)

1. Add `getItemTypeBySlug`, `getItemsByType`, `getItemById` to `src/lib/db/items.ts`.
2. Create `src/lib/validation/item.ts` with the discriminated Zod union.
3. Create `src/actions/items.ts` with `createItem`, `updateItem`, `deleteItem`, `toggleFavorite`, `togglePin`.
4. Build `app/(app)/items/[type]/page.tsx` with a stub `ItemList`.
5. Build the shared form (`ItemForm` + `editors/TextEditor` first; defer file upload until R2 is wired).
6. Build detail/edit page `[type]/[id]/page.tsx`.
7. Wire pin/favorite/delete buttons on dashboard `RecentItemsSection` and `PinnedSection` (they currently navigate; they should call actions).
8. Add Pro gating for `file` / `image` once Stripe is in place.
9. Migrate the `getDemoUserId` reads to `auth()`-based session reads.