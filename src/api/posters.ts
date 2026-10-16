import "client-only";
import type { AccountPoster } from "@/dto";
import { gql } from "@/api/graphql/client";

export async function fetchAccountPosters(
  signal: AbortSignal,
): Promise<AccountPoster[]> {
  const data = await gql<{ catalogPage: { items: AccountPoster[] } }>(
    `query AccountPosters { catalogPage(limit: 24, sort: "score") { items { id posterUrl } } }`,
    undefined,
    { signal, timeoutMs: 10000 },
  );
  const images = new Set<string>();
  return data.catalogPage.items.filter((poster) => {
    if (!poster.posterUrl || images.has(poster.posterUrl)) return false;
    images.add(poster.posterUrl);
    return true;
  });
}
