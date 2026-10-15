export const config = {
  gatewayUrl: process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080/graphql",
  gatewayBase: (process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080/graphql").replace(/\/graphql\/?$/, ""),
} as const;
export type AppConfig = typeof config;
