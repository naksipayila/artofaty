# AGENTS.md

## Commands
- Use npm with the v3 lockfile: `npm install` locally; CI uses `npm ci`.
- `npm run dev` starts the Nuxt server. `npm run build` is the only focused verification; no lint, test, formatter, or typecheck scripts exist.
- For GitHub Pages parity in PowerShell: `$env:NUXT_APP_BASE_URL = '/artofaty/'; npm run generate`. The static output is `.output/public`.
- Build/generate recreates `.nuxt`; a concurrently running dev server can briefly return 503 while it restarts.

## Deploy And Assets
- `.github/workflows/deploy.yml` deploys pushes to `main` (or manual dispatch) with Node 22, `npm ci`, `NUXT_APP_BASE_URL=/artofaty/`, and `npm run generate`.
- All public asset paths must honor `runtimeConfig.app.baseURL`; use the existing helpers rather than root-absolute paths.
- `.gitignore` ignores `*.png`; explicitly unignore a PNG under `public/` before adding it to Git.
- Do not edit generated folders: `.nuxt/`, `.output/`, `dist/`, or `node_modules/`.

## App Shape
- This is one Nuxt app: `app.vue` mounts the default layout, which provides `SiteHeader`, `<main>`, and `SiteFooter`.
- `pages/index.vue` is the works gallery. `/works` is a 301 redirect to `/`; only `pages/works/[id].vue` provides project detail pages.
- `data/portfolio.ts` is the content source. `projects` drives main detail pages and `nuxt.config.ts` derives their prerender routes automatically.
- `robloxProjects` has no detail routes. The home page renders only `robloxProjects.slice(0, 6)` in its lightbox-backed Roblox tab. Keep video first in each Roblox media list so clicking a card opens its turntable; the cover is the next media item.
- Main-project detail lightboxes use `data-scroll-dismiss-lightbox` for downward-wheel dismissal. All lightboxes need `.project-lightbox` and `data-lenis-prevent` so `plugins/lenis.client.ts` can manage background scrolling.

## UI Contracts
- Global CSS is `assets/css/main.css`. Mobile styles are the default and desktop overrides begin at `@media (min-width: 761px)`; do not change mobile behavior unless explicitly requested.
- The accent is `--accent: #62a8ff`. The desktop header is sticky and hides only while scrolling down; its full-width dark background belongs to `.site-header::before`.
- The desktop Roblox gallery is intentionally a compact five-column, two-row mosaic: Wendigo and Leshen span two rows, while the four remaining cards are smaller. Keep its explicit spans coordinated when changing the displayed six projects.
- `useCustomCursor()` must be refreshed after lightbox DOM changes; both gallery and detail lightboxes already call `refresh()` after `nextTick()`.

## Browser Checks
- `opencode.json` connects Playwright to a browser CDP endpoint at `http://127.0.0.1:9222`; start a compatible browser with that port before browser validation.
