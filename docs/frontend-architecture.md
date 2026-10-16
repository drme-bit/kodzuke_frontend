# Frontend structure

The frontend has one location for network access, one for wire contracts, and one for localization. Feature modules own UI behavior and state; they do not define GraphQL operations.

```text
src/
  app/                   Next.js routes and server composition
  api/
    graphql/             transport, browser client, public server client, config
    anime/               browser anime/episode requests and shared field selections
    catalog/             catalog query implementation and browser adapter
    server/              server-only, cached public queries
    auth.ts              login, registration, refresh, revocation requests
    user.ts              current user and profile update requests
    library.ts           saved titles, history and progress requests
    ratings.ts           community votes and external/card ratings
    posters.ts           lightweight auth-gallery query
  dto/                   type-only request and response contracts by domain
  i18n/
    config.ts            supported locales, fallback and normalization
    index.ts             landing messages entry point
    client.ts            locale/translator hook for Client Components
    ui.ts                common translator, interpolation and plural selection
    anime.ts             anime metadata labels
    content.ts           localized title/description selection
    genres.ts            localized genre names from backend data
    messages/            EN/RU/UK dictionaries grouped by domain
  shared/
    auth/session.ts      browser session storage, subscription and refresh lifecycle
    hooks/               reusable non-domain hooks
    ui/                  reusable UI primitives
  features/              domain UI, hooks, state, player integrations and styles
  components/            shared application composition (cards/footer)
```

## Import rules

- Components and hooks call named functions in `api/`. GraphQL strings and HTTP transport stay inside `api/`.
- Routes load public data from `api/server/`. These modules and `api/graphql/server.ts` are guarded by `server-only`. The browser adapter is guarded by `client-only`.
- `api/catalog/queries.ts` and `api/anime/fields.ts` are environment-neutral. The actual server/browser adapters set cache and authentication policy. There is no mixed runtime barrel for both environments.
- Personal browser requests use `no-store`. Public server queries reject tokens and retain the existing 30-second revalidation policy.
- DTOs contain only types/interfaces and type-only imports/exports. They have no React dependencies, translations, fetches or session state. `@/dto` is a type-only barrel; direct domain imports also work.
- Feature-local UI state and component props remain in their feature. They are not backend DTOs.
- `api/` does not import features, components, routes or translation dictionaries. Authentication lifecycle belongs in `shared/auth/session.ts`; login/logout and profile UI actions coordinate the session with raw API functions.
- Dictionaries live in `i18n/messages/`. Locale normalization and the default locale are defined once in `i18n/config.ts`. Server code never imports the browser locale hook.
- Backend content translations (anime/episode descriptions and names) are DTO data, not interface dictionaries. Their selection rules live in `i18n/content.ts`.
- The former `lib/api`, `lib/graphql`, `shared/api` and feature-level API/copy entry points have been removed. Import the concrete new module directly.

## Adding a feature

1. Define its request/response contracts in the corresponding `dto/` file.
2. Add network operations in `api/`; choose a server-only or browser-only entry point explicitly.
3. Add UI copy for all three locales in `i18n/messages/`.
4. Compose the UI and state in `features/`, then use it from a route.

## Verification

`npm run build` runs the style, architecture and i18n guards before Next.js compilation. `npm run lint` runs the same guards before ESLint.

- `check:architecture` rejects obsolete import paths, low-level network access outside API modules, UI dependencies from API modules and runtime code in DTOs.
- `check:i18n` compares dictionary keys for EN/RU/UK and checks locale fallback and plural selection.
- The existing scripts under `scripts/test-*.mjs` cover transport cancellation/authentication, account redirects, player selection, advertisement events, playback eligibility and content localization.
