# AGENTS.md

## Commands
- Use npm; `package-lock.json` v3 is present. Install with `npm install`; CI deploy uses `npm ci`.
- Dev server: `npm run dev`; production verification: `npm run build`.
- Static GitHub Pages output: `NUXT_APP_BASE_URL=/artofaty/ npm run generate` writes `.output/public`; preview built output with `npm run preview`.
- No lint/test/formatter/typecheck scripts exist; use `npm run build` as the focused verification step.
- Non-fatal build/generate noise seen here: Vite chunk-size warning, Nitro `cache-driver.js` external warning, Vue trailing-slash deprecation warning.

## Deploy And Assets
- `.github/workflows/deploy.yml` deploys on `main` pushes or manual dispatch using Node 22, `npm ci`, `npm run generate`, and `NUXT_APP_BASE_URL=/artofaty/`.
- Public asset URLs must respect Nuxt `app.baseURL`; use `runtimeConfig.app.baseURL` or helpers, not hard-coded `/logo.png` or `/models/...` paths.
- Do not edit generated/ignored folders: `.nuxt/`, `.output/`, `dist/`, `node_modules/`.

## App Shape
- Single Nuxt 3 app: `app.vue` renders `NuxtLayout`/`NuxtPage`; `layouts/default.vue` renders `SiteHeader`, `<main>`, and `SiteFooter`.
- Portfolio/profile data lives in `data/portfolio.ts`; main `projects[].id` values drive `/portfolio/:id`, prev/next nav, and `nitro.prerender.routes`.
- Only main `projects` have detail pages. `robloxProjects` render inside `/portfolio`, use button cards, and open the lightbox; do not add Roblox detail routes unless asked.
- `components/ProjectCard.vue` exists but is unused; do not wire it back in unless asked.
- Home hero 3D viewer uses `components/HomeModelViewer.vue`, `public/models/MissFortune_low.fbx`, and `public/models/tex/*.webp`; artwork images are ArtStation CDN URLs in `data/portfolio.ts`.

## Routing
- Keep the portfolio list at `pages/portfolio/index.vue` and details at `pages/portfolio/[id].vue`; replacing this with `pages/portfolio.vue` breaks child detail routing unless it renders `<NuxtPage />`.
- When adding/removing main project IDs, update both `data/portfolio.ts` and `nitro.prerender.routes` in `nuxt.config.ts`.
- `/about` is a compact hero-only artist page; `/contact` is minimal text links.

## Styling And UI Contracts
- Global CSS is centralized in `assets/css/main.css`; no Tailwind or component library is configured.
- CSS is mobile-first: `760px` is the mobile breakpoint, and desktop-only overrides start at `@media (min-width: 761px)`.
- Brand accent is blue via `--accent: #62a8ff`; do not restore the old orange accent unless asked.
- Header is logo-only with split desktop nav and a mobile menu; keep `.site-shell { padding-top: 40px; }` plus `.site-header { top: 40px; margin: 0 auto; }`, not header `margin-top`.
- On desktop, `.site-header::before` owns the full-viewport scrolled/menu background; keep the logo and nav links inside the centered `var(--container)` header.
- Background lives on `html`; do not reintroduce a `body::before` square grid or page-only `.fabrica-page::before` overlay.
- Portfolio width is coordinated by `.fabrica-page { --portfolio-content-width: ...; }`; keep tabs plus Main/Roblox grids on that shared shell.
- Portfolio tabs are text-only `Main Portfolio | Roblox Portfolio`; no wrapper border/background, underline, or pill state.
- Portfolio cards have no title overlays; hover should only zoom the image, not lift/glow/border the card.
- Main and Roblox Portfolio grids use 4 columns at `min-width: 1200px`.
- Lightboxes must keep `.project-lightbox` and `data-lenis-prevent`; `plugins/lenis.client.ts` uses that class to stop desktop Lenis scrolling behind overlays.
- Home stays hero-only, footer stays a thin bottom bar, and detail pages stay hero/overview/gallery lightbox/prev-next only.
- `Project.details.workProcess`, `approach`, `quote`, and `solution` remain in data but are intentionally not rendered.

## Tooling
- `opencode.json` configures Playwright MCP through Brave CDP at `http://127.0.0.1:9222`; browser checks fail if Brave is not running with that endpoint.


- ben diyinceye kadar mobil sürüme dokunma