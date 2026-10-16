import "server-only";
import { requestGraphQL, type GraphQLRequester } from "@/api/graphql/transport";

const url =
  process.env.GRAPHQL_URL ||
  process.env.NEXT_PUBLIC_GATEWAY_URL ||
  "http://localhost:8080/graphql";
/** Public read queries only. Never accept or cache a user's Authorization header. */
export const publicGraphql: GraphQLRequester = async (
  query,
  variables,
  options = {},
) => {
  if (options.token)
    throw new Error("Personal queries must not use the public server cache");
  return requestGraphQL(
    url,
    query,
    variables,
    options,
    options.fresh
      ? { cache: "no-store" }
      : { cache: "force-cache", next: { revalidate: 30 } },
  );
};
