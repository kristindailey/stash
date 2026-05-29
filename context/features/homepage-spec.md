# Homepage Spec

Turn the static prototype in `prototypes/homepage/` into the real homepage at `/` (`src/app/page.tsx`), using the project's stack and conventions while matching the prototype visually.

## Architecture

- `src/app/page.tsx` is a **server component** that composes the sections; add a marketing `metadata` export (title/description from the prototype `<head>`).
- Section components live in `src/components/marketing/`. Keep the homepage **outside** the `(app)` route group so it renders standalone (own nav + footer, no dashboard layout).
- Only add `'use client'` for interactivity (animation, scroll, local state); everything else stays server.
- DRY: put feature cards, preview-mock data, and pricing plans in `src/lib/constants/marketing.ts`. Reuse the existing item type colors from `src/lib/constants/item-types.ts` — don't redefine hex codes.

### Components

| Component | Type | Notes |
| --- | --- | --- |
| `MarketingNav` | client | Fixed nav, opaque/border on scroll. Logo, Features/Pricing anchors, Sign In + Get Started. |
| `HeroSection` | server | Gradient headline, subheadline, CTAs; renders `ChaosVisual` + `DashboardPreview`. |
| `ChaosVisual` | client | Floating-icon box (rAF: drift, wall bounce, mouse repel). Skip on `prefers-reduced-motion`; clean up rAF + listeners on unmount. |
| `DashboardPreview` | server | Static dashboard mock from constants. |
| `FeaturesSection` | server | 6 cards from constants, accent = item type color. |
| `AISection` | server | Pro badge, checklist, static code-editor mock with "AI Generated Tags". |
| `PricingSection` | client | Monthly/Yearly toggle swaps Pro `$8/mo` ↔ `$72/yr`. Free + Pro (Most Popular). |
| `CTASection` | server | Closing headline + button. |
| `MarketingFooter` | server | Logo, link columns, copyright year (server-computed). |
| `Reveal` | client | Shared `IntersectionObserver` fade-in wrapper; falls back to visible without observer / reduced motion. |

## Styling

- Tailwind v4 utilities + theme tokens (`bg-background`, `text-muted-foreground`, …); no `tailwind.config`, don't port `styles.css` verbatim.
- shadcn `Button` for CTAs (primary/outline/ghost), `Badge` for "Pro Feature" / "Most Popular".
- Item accent colors via one mapping (`style={{ '--c': color }}` or arbitrary values) — no repeated hex.
- Dark-mode first; prefer existing palette tokens. Keep custom keyframes minimal (prefer `tw-animate-css`); add to `globals.css` only if needed.

## Links

`<Link>` for internal routes, `<a href="#…">` for anchors.

| Element | Destination |
| --- | --- |
| Logo | `/` |
| Features / Pricing (nav, footer) | `#features` / `#pricing` (+ `#ai`) |
| Sign In | `/login` |
| Get Started / Get Started Free, Unlock Pro, Upgrade to Pro, Free "Get Started", final CTA | `/register` |
| Footer Company/Legal | `#` placeholder until pages exist |

## Animations (client)

Chaos rAF loop (skip on reduced motion); CSS arrow pulse; `Reveal` fade-in; nav scroll style.

## Responsive

- Hero stacks chaos/arrow/preview vertically on mobile; arrow rotates 90° to point down.
- Features/pricing single column on mobile, grids above. Use Tailwind responsive prefixes.

## Done when

`/` matches the prototype, server/client split as above (no unnecessary `'use client'`), all links correct, `npm run build` + `npm run lint` pass.