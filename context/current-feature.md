# Current Feature
<!-- Title above as "# Current Feature: <name>", followed by a one- or two-sentence description of the feature/fix. -->

## Status
<!-- Not Started | In Progress | Complete -->

## Goals
<!-- What this feature needs to accomplish. List concrete, checkable goals. -->

## Notes
<!-- Implementation details, constraints, decisions, and references. -->

## History
- **Initial Setup** — Next.js 16 and Tailwind CSS v4 scaffold.
- **Dashboard UI Phase 1** — ShadCN setup, `/dashboard` route, shell layout, dark mode, top bar.
- **Dashboard UI Phase 2** — Sidebar with types/favorites/collections, user avatar footer, collapsible drawer, mobile overlay.
- **Dashboard UI Phase 3** — Main content area: stats cards, recent collections grid, pinned items, recent items list.
- **Prisma + Neon Setup** — Prisma 7 + Neon PostgreSQL schema, driver adapter, init migration, system item types seeded.
- **Seed Data** — Demo user, 5 collections, 18 items across snippets/prompts/commands/links.
- **Dashboard Collections** — Real-data fetcher, border color from dominant type, per-type icon chips.
- **Dashboard Items** — Pinned/recent/stats fetchers driving PinnedSection, RecentItemsSection, and StatsCards.
- **Sidebar Real Data** — Item-type and collection fetchers, item-type links to `/items/{name}s`, "View all collections" link.
- **Sidebar PRO Badge** — ShadCN Badge added; subtle PRO tag on Files and Images.
- **Audit Quick Wins** — Cached `getDemoUserId`, N+1 fix in `getRecentCollections`, tightened type constants, batched seed inserts.
- **Auth Phase 1** — NextAuth v5 + Prisma adapter, split edge-safe config, JWT strategy, proxy protecting `/dashboard/*`.
- **Auth Phase 2** — Credentials provider with bcrypt, `POST /api/auth/register` with validation and duplicate-email check.
- **Auth Phase 3** — Custom `/login` + `/register` pages, GitHub OAuth button, `UserAvatar`, sidebar avatar dropup, sonner toasts.
- **Email Verification** — Resend SDK, 24h hex tokens, verify/resend endpoints, dedicated pages, `EmailNotVerifiedError` in authorize.
- **Email Verification Toggle** — `EMAIL_VERIFICATION_ENABLED` env flag short-circuits the entire flow when off.
- **Forgot Password** — Reset token helpers (1h TTL, prefixed identifier), `/forgot-password` + `/reset-password` pages, no-enumeration API.
- **Profile Page** — Shared `(app)` route group, `/profile` with stats, change-password and delete-account server actions.
- **Auth Rate Limiting** — Upstash sliding-window limiters on login/register/forgot/reset/resend with 429 + `Retry-After`.
- **GitHub OAuth Redirect Fix** — `signInWithGitHub` server action replaces client-side `signIn`, removing pre-redirect fetches.
- **Items List View** — Dynamic `/items/[type]` route, `getItemsByType` fetcher, reusable `ItemCard` in 2-column grid, proxy protects `/items/*`.
- **Vitest Setup** — Vitest scoped to `src/actions/**` and `src/lib/**`, native tsconfig path resolution, `npm run test` / `test:watch` scripts, sample tests for `format-time` and `cn`.
- **Items List 3-Column Grid** — `/items/[type]` grid now scales to 3 columns at `lg`, keeping 1/2-col responsive behavior below.
- **All Items Page + Dashboard Nav Fix** — New `/items` route with `getAllItems` fetcher, DevStash logo wraps to `/dashboard`, sidebar active state driven by `usePathname()` across types, collections, and "View all collections".
- **Item Drawer** — Right-side shadcn Sheet opens on card click, fetches full detail via `/api/items/[id]`; action bar stubbed for Favorite/Pin/Edit/Delete.
- **Item Drawer Edit Mode** — Pencil swaps drawer into inline edit, Save/Cancel action bar, Zod-validated `updateItem` action + lib query (tag replace via `set: []` + `connectOrCreate`), toast + `router.refresh()` on save.
- **Item Delete** — Drawer Trash opens shadcn `AlertDialog`; `deleteItem` action + lib query with ownership check, toast + drawer close + `router.refresh()` on success.
- **Item Create** — Top bar "New Item" opens shadcn `Dialog` with type pills; conditional fields per type; Zod-validated `createItem` action + lib query (URL required for links), toast + close + `router.refresh()` on success.
- **Code Editor** — Monaco-based `CodeEditor` with macOS dots, copy button, language label, themed scrollbar, auto-sizing height (max 400px); used for snippet/command content in drawer (view + edit) and new-item dialog. New Item dialog also auto-selects type from `/items/[type]` route.
- **Markdown Editor** — `MarkdownEditor` with Write/Preview tabs, react-markdown + remark-gfm, copy button, `.markdown-preview` dark styles for headings/code/lists/blockquotes/links/tables; used for note + prompt content in drawer (view + edit) and new-item dialog.
- **File Upload + R2** — Cloudflare R2 uploads, `FileUpload` component, download proxy, image preview + download in `ItemDrawer`.
- **Image Gallery View** — `ImageCard` with `aspect-video` thumbnail, `object-cover`, 5%/300ms hover zoom, pin/favorite overlay; `/items/images` swaps `ItemCard` for `ImageCard` in the existing 3-col grid.
- **Item Drawer Favorite + Pin** — `toggleFavorite`/`togglePin` server actions + lib queries (ownership check, preserves `updatedAt` so toggling doesn't bump Recent), drawer buttons optimistic-flip with rollback-on-error and `router.refresh()` to sync cards/counts.
- **File List View** — `FileRow` component with extension-based lucide icons, name/size/date/download columns, keyboard-accessible row opens `ItemDrawer`, download `<a>` stops propagation; `/items/files` swaps grid for single-column list, stacks on mobile.
- **Quick Copy Icon** — `CopyButton` in `ItemCard` top-right (Copy→Pin→Star), copies content/URL, skipped for file/image; sonner toast on copy.
- **Collection Create** — Top bar "New Collection" opens shadcn `Dialog` with name + description; Zod-validated `createCollection` action + user-scoped lib query, toast + close + `router.refresh()` on success.
- **Item Collection Assignment** — `CollectionSelect` popover multi-select in New Item dialog and drawer edit, fed by `useCollectionOptions` hook + `GET /api/collections`; `collectionIds` validated in Zod shape, user-scoped via `filterOwnedCollectionIds`, synced on create and update (`deleteMany` + `create` reconcile).
- **Collections Pages** — `/collections` index and `/collections/[id]` detail; detail page splits items into an `ItemCard` grid plus separate Images and Files sections; proxy protects `/collections/*`.
- **Collection Edit/Delete/Favorite** — update/toggle-favorite/delete actions + queries (items preserved on delete); shared edit + delete dialogs, `DropdownMenu` on index cards, action buttons on detail page.
- **Global Search / Command Palette** — `cmdk` palette opened via Cmd/Ctrl+K or TopBar button; client-side fuzzy search over pre-fetched `getSearchData`, grouped Items/Collections, selects open item drawer or collection page.
- **Pagination** — DB-level `skip`/`take` + count on item/collection listings; `Pagination` component + `parsePage`/`getPageRange` utils (fixed 7-slot range), page sizes in `lib/constants/pagination.ts`.
- **Settings Page** — Protected `/settings` route; sidebar gear icon retargeted from `/profile`; change-password + delete-account sections moved out of profile into settings.
- **Editor Preferences** — `editorPreferences` JSON column + migration; auto-saving font/tab/theme/word-wrap/minimap settings via `EditorPreferencesProvider` applied to `CodeEditor`.