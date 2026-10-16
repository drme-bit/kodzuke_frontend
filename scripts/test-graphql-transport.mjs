import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import ts from "typescript";
const source = readFileSync(
  new URL("../src/api/graphql/transport.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { requestGraphQL } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);
const originalFetch = globalThis.fetch;
try {
  let captured;
  globalThis.fetch = async (_url, options) => {
    captured = options;
    return { ok: true, json: async () => ({ data: { value: 42 } }) };
  };
  assert.deepEqual(
    await requestGraphQL(
      "http://example.test/graphql",
      "query Read { value }",
      { locale: "uk" },
      { token: "test-only" },
      { cache: "no-store" },
    ),
    { value: 42 },
  );
  assert.equal(captured.cache, "no-store");
  assert.equal(captured.headers.Authorization, "Bearer test-only");
  assert.deepEqual(JSON.parse(captured.body).variables, { locale: "uk" });

  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ errors: [{ message: "UNAUTHENTICATED" }] }),
  });
  await assert.rejects(
    requestGraphQL(
      "http://example.test/graphql",
      "query Read { value }",
      undefined,
      {},
      {},
    ),
    /UNAUTHENTICATED/,
  );

  // Headers can arrive promptly while the body stalls. The timeout must remain active.
  globalThis.fetch = async (_url, options) => ({
    ok: true,
    json: () =>
      new Promise((_resolve, reject) => {
        options.signal.addEventListener(
          "abort",
          () => reject(options.signal.reason),
          { once: true },
        );
      }),
  });
  await assert.rejects(
    requestGraphQL(
      "http://example.test/graphql",
      "query Read { value }",
      undefined,
      { timeoutMs: 10 },
      {},
    ),
    { name: "AbortError" },
  );
} finally {
  globalThis.fetch = originalFetch;
}
console.log(
  "GraphQL transport: request policy, authentication, errors and response-body timeout passed",
);
