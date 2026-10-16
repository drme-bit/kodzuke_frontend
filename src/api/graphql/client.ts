import "client-only";
import { config } from "@/api/graphql/config";
import { requestGraphQL, type GraphQLRequester } from "@/api/graphql/transport";

/** Browser requests, including all personal data and mutations, are never server-cached. */
export const gql: GraphQLRequester = (query, variables, options = {}) =>
  requestGraphQL(config.gatewayUrl, query, variables, options, {
    cache: "no-store",
  });
