import "client-only";
import { gql } from "@/api/graphql/client";
import { createCatalogApi } from "@/api/catalog/queries";
export const {
  fetchAnimes,
  fetchLoloan,
  fetchCatalogPage,
  searchTitles,
  fetchGenres,
} = createCatalogApi(gql);
