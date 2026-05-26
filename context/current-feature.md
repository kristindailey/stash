# Current Feature
Audit Quick Wins — low-risk fixes from the code-scanner report.

## Status
In Progress

## Goals
- Fix N+1 in `getRecentCollections` (`src/lib/db/collections.ts:68-107`) — replace the nested `include` payload with Prisma's `groupBy` on `ItemCollection` (joined to `Item` via a filtered fetch) so type counts are aggregated in the database. No raw SQL — stick to Prisma Client APIs.
- Dedupe redundant user lookups by wrapping `getDemoUserId()` with `React.cache` in a shared helper (e.g. `src/lib/db/get-user-id.ts`) and import it from `collections.ts` and `items.ts`.
- Tighten `ITEM_TYPE_COLORS` / `ITEM_TYPE_ICONS` types in `src/lib/constants/item-types.ts` to surface `undefined` for unknown keys, then add guards at the two `CollectionsSection.tsx` call sites.
- Remove the duplicate `TYPE_ICONS` map from `src/components/layout/Sidebar.tsx` and import from `src/lib/constants/item-types.ts` instead.
- Batch the seed item inserts in `prisma/seed.ts:374-394` using `createMany` or `Promise.all`.
- Remove the stale `prisma.config.ts` reference from `context/project-overview.md`.

## Notes
- Auth-related items (dashboard guard, `mockUser` in Sidebar) are explicitly out of scope — auth is not implemented yet.
- Credential rotation is an ops task, not a code change — out of scope.
- `formatRelativeTime` caching concern is deferred; the dashboard uses `force-dynamic` so no current bug.
- All changes should pass `npm run build` and `npm run lint`.

## History
<!-- Detail history here. Keep updated. Earliest to latest. -->

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
