# Stash
A developer knowledge hub for snippets, commands, prompts, notes, files, images, links, and custom types.

## Context Files
Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Critical: Next.js version
@AGENTS.md

This project runs **Next.js 16.2.6** with **React 19.2.4**. This is newer than most training data, and APIs/conventions have breaking changes. The full version-matched docs ship inside the repo at `node_modules/next/dist/docs/` — read the relevant `.md` guide there before writing routing, data-fetching, caching, or rendering code. Do not rely on remembered Next.js behavior.

Notable gotchas surfaced in those docs:
- **Instant navigation**: `Suspense` alone does not fix slow client-side navigations. The route must also export `unstable_instant`. See `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md`.

## Commands

```bash
npm run dev         # Start dev server at http://localhost:3000
npm run build       # Production build
npm run start       # Serve the production build
npm run lint        # ESLint
npm run test        # Vitest unit tests (single run)
npm run test:watch  # Vitest in watch mode
```

Vitest covers server actions (`src/actions/**`) and utilities (`src/lib/**`) only — no React component tests. See `context/coding-standards.md` Testing section for conventions.

## Neon MCP

When using the Neon MCP in this project, **always** use:

- **Project:** `stash` (id: `icy-queen-08131444`)
- **Branch:** `development` (id: `br-lively-dust-akj9eq2s`)

Rules:
- Never run queries against the `production` branch (`br-damp-thunder-akgjg9i7`) unless I explicitly say "production" in the request.
- Always pass `projectId: "icy-queen-08131444"` and `branchId: "br-lively-dust-akj9eq2s"` to Neon MCP tool calls (e.g. `run_sql`, `describe_branch`, `get_database_tables`).
- Skip the `list_projects` / `describe_project` discovery calls — the IDs above are authoritative.
- If a request is ambiguous about which branch to use, default to `development` and mention it in your response.
- Never run destructive SQL (DROP, DELETE, TRUNCATE, UPDATE/INSERT without explicit instruction) on any branch without asking first.