import { config } from "@/lib/config";

export async function gql<T>(query: string, variables?: Record<string, unknown>, options?: { signal?: AbortSignal; fresh?: boolean; timeoutMs?: number }): Promise<T> {
  const url = config.gatewayUrl;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), options?.timeoutMs ?? 15000);
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      signal: options?.signal ? AbortSignal.any([ctrl.signal, options.signal]) : ctrl.signal,
      ...(options?.fresh ? { cache: "no-store" as const } : { next: { revalidate: 30 } }),
    });
  } catch (e: unknown) {
    clearTimeout(t);
    if (e instanceof Error && e.name === "AbortError") throw new Error(`[gql] timeout ${url} — gateway не отвечает, проверь docker ps`);
    throw new Error(`[gql] network error ${url}: ${(e as Error).message} — проверь что gateway :8080 запущен и NEXT_PUBLIC_GATEWAY_URL верный`);
  }
  clearTimeout(t);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`[gql] http ${res.status} ${res.statusText} ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`[gql] ${json.errors[0].message}`);
  }
  return json.data as T;
}

