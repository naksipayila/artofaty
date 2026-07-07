# AGENTS.md

## Commands
- Use npm; `package-lock.json` is present.
- Install: `npm install`
- Dev server: `npm run dev`
- Production verification: `npm run build`
- Static deploy build: `npm run generate` writes `.output/public`.
- GitHub Pages project-page deploy uses `NUXT_APP_BASE_URL=/artofaty/ npm run generate` via `.github/workflows/deploy.yml`.
- No lint/test/formatter/typecheck scripts exist; use `npm run build` for focused verification.

## App Shape
- Single Nuxt 3 app: `app.vue` renders `NuxtLayout`/`NuxtPage`, and `layouts/default.vue` renders `SiteHeader` plus `<main>` only.
- `components/SiteFooter.vue` and `components/ProjectCard.vue` exist but are not currently mounted; do not wire them back in unless asked.
- Portfolio/profile data lives in `data/portfolio.ts`; main project `id` values drive `/portfolio/:id`, prev/next nav, and `nitro.prerender.routes`.
- Only main `projects` have detail pages. `robloxProjects` render inside `/portfolio` and open the lightbox; do not add Roblox detail routes unless asked.
- Images are external ArtStation CDN URLs in `data/portfolio.ts`; `public/logo.png` is the only local image and is both header logo and favicon.
- Local public asset URLs must respect Nuxt `app.baseURL`; this repo is deployed under `/artofaty/` on GitHub Pages, not a custom domain.

## Routing
- Keep the portfolio list at `pages/portfolio/index.vue` and details at `pages/portfolio/[id].vue`.
- Do not replace this with `pages/portfolio.vue` unless it renders `<NuxtPage />`; otherwise `/portfolio/:id` can resolve to the list page.
- `/about` and `/contact` intentionally render blank deferred pages; do not rebuild their content unless asked.
- When adding/removing main project IDs, update `nitro.prerender.routes` in `nuxt.config.ts`.

## Styling
- Global CSS is centralized in `assets/css/main.css`; no Tailwind or component library is configured.
- Brand accent is blue via `--accent: #62a8ff`; do not restore the old orange accent unless asked.
- CSS is mobile-first. The `760px` breakpoint is mobile; use `@media (min-width: 761px)` for desktop-only requests.
- Header top spacing is `.site-shell { padding-top: 40px; }` plus `.site-header { top: 40px; margin: 0 auto; }`; do not reintroduce header `margin-top`, which caused a margin-collapse black strip.
- Do not edit generated/ignored folders: `.nuxt/`, `.output/`, `dist/`, `node_modules/`.

## Current UI Contracts
- Home page keeps only hero, Process grid, and Contact CTA; do not re-add removed location/stat/feature/home-card sections unless asked.
- Portfolio tabs live inside `.fabrica-panel` as a glass toolbar with count badges. Main Portfolio is centered 2x2 on desktop; Roblox Portfolio is 3 columns at `min-width: 1200px`.
- Roblox cards are buttons, not links; the lightbox plays optional `video` URLs and otherwise falls back to the large image.
- Detail pages keep hero, overview, gallery lightbox, and prev/next nav only; do not re-add Work Process, Approach, Quote, Solution, Related Project, or share links unless asked.
- Detail hero images use optional `heroImage` plus per-project `heroCrop`, `heroScale`, and `heroOrigin` from `data/portfolio.ts`.

## Tooling Noise
- `opencode.json` configures Playwright MCP through Brave CDP at `http://127.0.0.1:9222`; do not take screenshots unless explicitly requested.
- `npm run build` / `npm run generate` may print Nitro `cache-driver.js` external and Vue trailing-slash deprecation warnings; these have been non-fatal when the command exits successfully.
