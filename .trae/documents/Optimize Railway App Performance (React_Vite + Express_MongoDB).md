## Summary
- Frontend: React + Vite; served via `vite preview`. Backend: Express (TypeScript) with MongoDB (Mongoose). No caching layer; compression and rate limiting enabled. Static assets under `public/`.
- Key files: `backend/src/app.ts`, `backend/src/config/database.ts`, `backend/src/routes/*`, `src/api/client.ts`, `vite.config.ts`.
- Goal: Reduce page load/CPU, shorten API latency, cut bundle size, add caching and CDN.

## Measure First
- Add request timing to logs to locate hotspots
  - Use `morgan(':method :url :status :res[content-length] - :response-time ms')` in `backend/src/app.ts:106-113`.
  - Add `response-time` header via middleware for quick client-side profiling.
- Capture slow Mongoose operations using `mongoose.set('debug', true)` gated by env.

## Backend: Caching & HTTP Optimizations
- Add Redis cache for hot GET endpoints (e.g., `/api/books`)
  - Key: hash of query params + user role; TTL 60–300s.
  - Invalidate on create/update/delete in `backend/src/routes/books.ts` (e.g., after `createBook`, `updateBook`, `deleteBook`).
- Implement HTTP caching
  - Add `ETag`/`Last-Modified` on GET responses; return `304` if unchanged.
  - Set `Cache-Control` for safe resources: `public, max-age=120, stale-while-revalidate=600`.
- Tune compression
  - Configure `compression({ level: 6, threshold: '1kb' })` in `backend/src/app.ts:99-101`.
- Keep-alive & trust proxy already set; ensure `CORS_ORIGIN` matches CDN/Frontend.

## Backend: Database Query Performance
- Use lean + projection on reads
  - Ensure services use `.lean()` and `.select()`; focus on `bookService.getBooks` used by `backend/src/routes/books.ts:12`.
- Verify indexes align with query filters
  - Add compound indexes to models for frequent filters (e.g., `gradeLevel`, `learningArea`, `publisher`, `status`).
- Replace skip/limit with cursor pagination when large pages
  - Filter by `_id > lastSeenId` or indexed field to avoid large `skip` costs.
- Connection tuning
  - Review `maxPoolSize/minPoolSize` in `backend/src/config/database.ts:12-15`; set `maxPoolSize` to 20–50 on Railway depending on instance size.
  - Disable `autoIndex` in prod to prevent background index build overhead.

## Frontend: Load-Time & Bundling
- Code split heavy modules and lazy load non-critical UI
  - Dynamic import for rarely used views/components (e.g., datepicker, PDF export, XLSX), show Suspense fallback.
- Vendor chunking in Vite
  - Add `build.rollupOptions.output.manualChunks` to split `react`, `react-dom`, `react-datepicker`, `jspdf`, `xlsx` into separate chunks in `vite.config.ts`.
- Optimize images
  - Convert large PNGs in `public/logos/*` to WebP; set `loading="lazy"`, width/height.
- Network caching on client
  - Add client-level caching for idempotent GETs (e.g., with TanStack Query) or respect `ETag/Cache-Control`.
- API client improvements
  - Reuse connections, batch concurrent requests with `p-limit`; keep `REQUEST_TIMEOUT` at `src/api/client.ts:7` reasonable (10s is OK). Consider `stale-while-revalidate` pattern.

## Static Assets & CDN
- Put Cloudflare (or similar) in front of Railway frontend
  - Cache hashed assets (`.js`, `.css`, `.png`, `.webp`) with `Cache-Control: public, max-age=31536000, immutable`.
  - Ensure Vite builds with content hashes (default) and serve via CDN.
- Preconnect and DNS-prefetch
  - Add `<link rel="preconnect" href={API origin}>` and `dns-prefetch` in `index.html`.

## External API Calls
- Debounce or batch client requests; cache server responses with Redis.
- Add circuit breaker & retries with jitter for flaky dependencies; return cached data on failure.

## Observability & Guardrails
- Add per-route timing logs; top-N slow queries dashboard.
- Health/metrics endpoint already exists (`backend/src/app.ts:126-151`); extend with DB + cache status.

## Implementation Steps
1) Introduce Redis client and cache utility; wire to `/api/books` GET.
2) Add `ETag`/`Cache-Control` middleware for GET routes.
3) Update service queries to use `.lean()`, `.select()`, and cursor pagination.
4) Vite: add manual vendor chunking; lazy-load heavy components; convert images.
5) Configure CDN and asset caching headers; add preconnect/dns-prefetch.
6) Add basic per-route timings and slow-query logging; tune Mongo pool sizes.
7) Roll out, measure, and iterate; adjust TTLs and chunking based on real metrics.

## Code References
- `backend/src/config/database.ts:11-16` – Mongoose connect options.
- `backend/src/app.ts:93-101` – Rate limit + compression.
- `backend/src/app.ts:153-160` – API route mounting.
- `backend/src/routes/books.ts:9-34` – GET `/api/books` handler.
- `backend/src/server.ts:23-31` – Server listen config.
- `vite.config.ts:6-26` – Vite server/preview/plugins/alias.
- `src/api/client.ts:58-113` – fetch wrapper with retries and timeout.
