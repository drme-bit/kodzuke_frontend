# Personal library

The account page has two main sections, continue watching and saved anime, alongside a recent episode ratings sidebar. History is grouped by anime on the server before pagination. Filters use the latest active episode per anime; “Watched” refers to that episode, not completion of every season. Each card can expand its paginated episode history. Removing an anime sets a nullable removedAt timestamp for its history records; Undo restores them. A qualifying new playback restores that episode. Marking an episode watched updates only an existing record owned by the current user. Rating history reads the existing episode votes; there is no separate title-like model.

The browser obtains personal data through GraphQL with the current access token and no caching. The gateway forwards that token; anime-service validates its signature, expiry and access-token claims, and derives the user ID from it. No operation accepts a user ID from the caller. Public SSR data remains separate from this browser-only authenticated island.

`SavedAnime` has one record per user/anime. `WatchHistory` has one record per user/episode, with the last observed position, duration, completion and timestamp. Existing databases receive these additive tables through the service's current Hibernate schema-update configuration. The existing rating table is unchanged.

The player records history only after an actual playing event. History becomes eligible after 20 seconds in the playing state. Pauses, buffering and media seeks do not count toward that threshold. Timestamp updates are throttled to 15 seconds after eligibility, and flushed on pause, end and component disposal. Progress is bound to its originating login; queued requests are discarded after account changes. An abrupt browser/process termination can lose the latest interval. A provider without progress events can record the watched episode, but cannot provide precise resume positions. Resume links select the episode and seek after playback starts; they never force autoplay.

Verification:

- `LibraryIntegrationTest`: user isolation, idempotency, pagination, progress upserts, completion, existing votes and invalid/future progress. Uses the test database, never production fixtures.
- `node scripts/test-playback-recorder.mjs`: no history on page visit, throttling, pause/completion and anonymous sessions.
- Frontend type checking, lint and production build.
