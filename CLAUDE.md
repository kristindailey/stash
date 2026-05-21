# DevStash
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
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Serve the production build
npm run lint     # ESLint
```

There is no test framework configured in this repo.