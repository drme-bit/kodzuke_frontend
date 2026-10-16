# Rendering and data loading

## Server

Route `page.tsx` files render initial public content. They import data functions
from `src/api/server/`, protected by `server-only`. These functions use
`GRAPHQL_URL` (private server/network URL), falling back to
`NEXT_PUBLIC_GATEWAY_URL` for local development.

Public GraphQL reads use the Next.js Data Cache with a 30-second revalidation
window. React `cache()` deduplicates identical section reads during one render.
No session tokens or personal responses are accepted by this public cache.
Route entries call `connection()` outside their error handlers before loading data, so production builds do not
require a live backend; explicit fetch revalidation still controls the data cache.
Public pages do not use `force-dynamic`, which would opt their fetches out of
this cache. The root locale header still makes route rendering request-aware.

Home's text, links, FAQ and footer render independently of remote data. Background
trailers and shelves stream through separate Suspense boundaries. The anime
route loads a small overview first; player/episodes, gallery, release schedule
and seasons render as separate server sections. Shared episode/schedule reads
are deduplicated. Completed anime do not request a next-episode schedule for the
player. Loading placeholders reserve player height to limit layout shifts.

`src/app/[locale]/loading.tsx` provides an immediate route transition fallback.
It improves perceived navigation latency; it does not make a slow provider
response itself faster.

## Browser

`api/graphql/client.ts`, `api/catalog/client.ts` and `api/anime/client.ts` are explicitly `client-only`.
Filtering, search, pagination, hover previews, player controls, auth, profile and
rating mutations use these browser entry points, always with `no-store`.
The first browse/catalog results come from server props; hydration does not
repeat that initial request. Account tokens currently live in sessionStorage,
so the authenticated profile remains a small browser island.

Client Components are still initially rendered by Next.js and then hydrated.
`use client` defines the interactive module graph; it does not disable SSR.

`api/catalog/queries.ts`, `dto/` and `api/graphql/transport.ts` are environment-neutral:
query definitions/types and HTTP handling, with no session, environment lookup
or rendering/cache policy. Compatibility barrels under `src/lib` are for browser
callers only. Do not import them in a Server Component.

## Checks

- `npm run build`: Next.js validates server-only/client-only import boundaries.
- `node scripts/test-graphql-transport.mjs`: headers, policy, GraphQL errors,
  and timeouts while reading a stalled response body.
- `npm run check:styles`: globals remains tokens only.

Measure cold and warm requests separately and exclude development compilation
when comparing performance. A streamed first byte is not the same metric as
all page data or the embedded player becoming ready.

References: [Next.js fetching and streaming](https://nextjs.org/docs/app/getting-started/fetching-data),
[fetch caching options](https://nextjs.org/docs/app/api-reference/functions/fetch).
