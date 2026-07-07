# AGENTS.md

## Commands
- Use npm; `package-lock.json` is present.
- Install: `npm install`
- Dev server: `npm run dev`
- Production verification: `npm run build`
- Static deploy build: `npm run generate` writes `.output/public`.
- GitHub Pages deploy runs on Node 22 with `npm ci`, then `NUXT_APP_BASE_URL=/artofaty/ npm run generate` via `.github/workflows/deploy.yml`.
- No lint/test/formatter/typecheck scripts exist; use `npm run build` for focused verification.

## App Shape
- Single Nuxt 3 app: `app.vue` renders `NuxtLayout`/`NuxtPage`, and `layouts/default.vue` renders `SiteHeader`, `<main>`, and `SiteFooter`.
- `components/ProjectCard.vue` exists but is not currently mounted; do not wire it back in unless asked.
- Portfolio/profile data lives in `data/portfolio.ts`; main project `id` values drive `/portfolio/:id`, prev/next nav, and `nitro.prerender.routes`.
- Only main `projects` have detail pages. `robloxProjects` render inside `/portfolio` and open the lightbox; do not add Roblox detail routes unless asked.
- Images are external ArtStation CDN URLs in `data/portfolio.ts`; `public/logo.png` is the local logo/favicon.
- Local public asset URLs must respect Nuxt `app.baseURL`; this repo is deployed under `/artofaty/` on GitHub Pages, not a custom domain.
- `plugins/lenis.client.ts` adds desktop-only smooth wheel scrolling; it disables on touch/reduced-motion and stops whenever `.project-lightbox` exists.

## Routing
- Keep the portfolio list at `pages/portfolio/index.vue` and details at `pages/portfolio/[id].vue`.
- Do not replace this with `pages/portfolio.vue` unless it renders `<NuxtPage />`; otherwise `/portfolio/:id` can resolve to the list page.
- `/about` intentionally renders a blank deferred page. `/contact` has been removed; use mail links instead of recreating the route unless asked.
- When adding/removing main project IDs, update `nitro.prerender.routes` in `nuxt.config.ts`.

## Styling
- Global CSS is centralized in `assets/css/main.css`; no Tailwind or component library is configured.
- Brand accent is blue via `--accent: #62a8ff`; do not restore the old orange accent unless asked.
- CSS is mobile-first. The `760px` breakpoint is mobile; use `@media (min-width: 761px)` for desktop-only requests.
- Header top spacing is `.site-shell { padding-top: 40px; }` plus `.site-header { top: 40px; margin: 0 auto; }`; do not reintroduce header `margin-top`, which caused a margin-collapse black strip.
- Portfolio list width is coordinated by `.fabrica-page { --portfolio-content-width: 1240px; }`; keep heading, tabs, Main, and Roblox grids on that shared shell.
- The dark Portfolio-style background is global on `html`; do not reintroduce a page-only `.fabrica-page::before` dark overlay unless asked.
- Lightboxes use `.project-lightbox` plus `data-lenis-prevent`; keep these when adding gallery overlays so Lenis does not scroll the page behind them.
- Do not edit generated/ignored folders: `.nuxt/`, `.output/`, `dist/`, `node_modules/`.

## Current UI Contracts
- Home page keeps only hero and Process grid; do not re-add removed location/stat/feature/home-card/contact CTA sections unless asked.
- Footer is a thin bottom bar only; do not re-add the large footer CTA card unless asked.
- Portfolio tabs use `.fabrica-panel__header`/`.fabrica-tabs` inside `.fabrica-page__top`; Main Portfolio is 2x2 on desktop and Roblox Portfolio is 3 columns at `min-width: 1200px`.
- Roblox cards are buttons, not links; the lightbox plays optional `video` URLs and otherwise falls back to the large image.
- Detail pages keep hero, overview, gallery lightbox with thumbnails, and prev/next nav only; do not re-add Work Process, Approach, Quote, Solution, Related Project, or share links unless asked.
- Detail hero images use optional `heroImage` plus per-project `heroCrop`, `heroScale`, and `heroOrigin` from `data/portfolio.ts`.
- `Project.details.workProcess`, `approach`, `quote`, and `solution` still exist in data but are not rendered by current detail pages.

## Tooling Noise
- `opencode.json` configures Playwright MCP through Brave CDP at `http://127.0.0.1:9222`; expect failures if Brave is not running with that CDP endpoint.
- `npm run build` / `npm run generate` may print Nitro `cache-driver.js` external and Vue trailing-slash deprecation warnings; these have been non-fatal when the command exits successfully.
