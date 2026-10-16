/** Environment-neutral GraphQL transport. Rendering/cache policy belongs to its caller. */
export type GraphQLOptions = {
  signal?: AbortSignal;
  fresh?: boolean;
  timeoutMs?: number;
  token?: string;
};
export type GraphQLRequester = <T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: GraphQLOptions,
) => Promise<T>;

export async function requestGraphQL<T>(
  url: string,
  query: string,
  variables: Record<string, unknown> | undefined,
  options: GraphQLOptions,
  policy: RequestInit,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 15000,
  );
  try {
    const response = await fetch(url, {
      ...policy,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
      signal: options.signal
        ? AbortSignal.any([controller.signal, options.signal])
        : controller.signal,
    });
    if (!response.ok) throw new Error(`[gql] HTTP ${response.status}`);
    const json = await response.json();
    if (json.errors?.length) throw new Error(`[gql] ${json.errors[0].message}`);
    return json.data as T;
  } finally {
    // Includes reading/parsing the response body, not just receiving its headers.
    clearTimeout(timeout);
  }
}
