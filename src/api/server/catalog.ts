import "server-only";
import { cache } from "react";
import { createCatalogApi } from "@/api/catalog/queries";
import { publicGraphql } from "@/api/graphql/server";

const api = createCatalogApi(publicGraphql);
export const getBrowseRows = cache((shelf?: string) => api.fetchLoloan(shelf));
export const getCatalogPage = api.fetchCatalogPage;
export const getGenres = cache(api.fetchGenres);
export const getBackgroundTrailers = cache(async () => {
  const data = await publicGraphql<{
    backgroundTrailers: import("@/dto").BackgroundTrailer[];
  }>(`query BackgroundTrailers { backgroundTrailers { id title trailerUrl } }`);
  return data.backgroundTrailers;
});
