# Static deployment (Cloudflare Pages or any static host)

All calculations run in the browser. No external API calls or server functions are required. Currency conversion offers manual rates and bundled dated historical snapshots; there is no live-rate mode.

## Build and preview

Requires Node.js 24+ only for development/build:

```sh
npm ci
npm run build
npm run preview
```

Open http://localhost:3000. `npm run start` also serves the generated `out/` folder. `npm run dev` remains available for editing. Do not open HTML using file://; JavaScript modules require an HTTP server.

## Cloudflare Pages

- Repository: joshua880604-web/codex-test
- Production branch: financial-calculators (after this static update is synchronized)
- Root directory: repository root
- Build command: npm run build
- Output directory: out
- Build environment: NODE_VERSION=24
- No Worker, Functions, database, API token or runtime environment variables needed.
- Upload only the contents of out/ for direct upload. Do not upload source, node_modules or .next.

For search indexing, set SITE_URL=https://your-real-domain and SITE_INDEXABLE=true before building. Without those settings this review build remains noindex. These are build-time values; changing them requires a rebuild.

`public/_redirects` sends / to /financial-calculator.html. The build finalizer preserves the existing .html URLs by normalizing Next.js export filenames. This application uses normal HTML links with full document navigation; adding Next Link/prefetch later requires revalidating the export routing/RSC assets. On hosts other than Pages configure the same homepage redirect if desired; index.html remains usable.

Saved exchange-rate dates are displayed; update the bundled data and rebuild to refresh them. Manual rates support BTC without providing market data. Official tax/CPI tables are also bundled and change only with a new build. Source attribution links are ordinary links, not automatic API requests.
