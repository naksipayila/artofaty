# AGENTS.md

## Commands
- This is an npm project with a v3 lockfile: use `npm install` locally and `npm ci` in CI.
- Scripts are `npm run dev`, `npm run build`, `npm run generate`, and `npm run preview`; there are no lint, test, formatter, or typecheck scripts. Use `npm run build` for focused verification.
- GitHub Pages parity in PowerShell: `$env:NUXT_APP_BASE_URL = '/artofaty/'; npm run generate`. The static output is `.output/public`.
- Build/generate recreates `.nuxt`; a running dev server can briefly return 503 during that restart.

## Pages And Content
- `app.vue` mounts the default layout (`SiteHeader`, `<main>`, `SiteFooter`). Main routes are `/`, `/roblox`, `/about`, and `/works/[id]`; `/works` is a 301 redirect to `/`.
- `data/portfolio.ts` is the content source. `projects` drives detail routes, which `nuxt.config.ts` prerenders automatically.
- `robloxProjects` has no detail routes. `pages/roblox.vue` displays `robloxProjects.slice(0, 14)` as a six-card featured mosaic followed by eight additional cards; a video is the lightbox media when available, otherwise the cover is used.
- All lightboxes require `.project-lightbox`, `data-lenis-prevent`, and `data-scroll-dismiss-lightbox` for desktop wheel dismissal.

## UI Contracts
- `assets/css/main.css` is global and mobile-first; desktop overrides start at `@media (min-width: 761px)`. Preserve the mobile/desktop split when changing interactions.
- Mobile lightboxes use horizontal swipes and a visible close button; desktop retains edge navigation controls. Refresh `useCustomCursor()` after lightbox DOM changes.
- The Works dropdown is left-aligned on mobile and right-aligned on desktop to avoid mobile clipping.
- The desktop Roblox gallery uses a six-card featured mosaic followed by an eight-card secondary mosaic; their `nth-child` spans assume the current 14 displayed projects.

## Assets And Deployment
- Public URLs must honor `runtimeConfig.app.baseURL` or `withBaseURL`; never add root-absolute public paths. Montserrat is self-hosted in `public/fonts/` and declared/preloaded in `nuxt.config.ts`.
- `.gitignore` excludes `*.png`; explicitly unignore a PNG under `public/` before adding it. Do not edit `.nuxt/`, `.output/`, `dist/`, or `node_modules/`.
- `.github/workflows/deploy.yml` deploys pushes to `main` (or manual runs) with Node 22, `npm ci`, `NUXT_APP_BASE_URL=/artofaty/`, and `npm run generate`.

## Browser Checks
- `opencode.json` connects Playwright to Chrome DevTools Protocol at `http://127.0.0.1:9222`; a compatible browser must already be listening there for browser validation.
