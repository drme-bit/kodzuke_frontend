import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import ts from "typescript";
const source = readFileSync(
  new URL("../src/features/auth/navigation.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { safeReturnPath, authUrl } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);
assert.equal(
  safeReturnPath("/en/anime/test?episode=2#watch", "en"),
  "/en/anime/test?episode=2#watch",
);
for (const path of [
  "https://evil.test",
  "//evil.test",
  "/en/../account",
  "/ru/catalog",
  "/en/account",
  "/en/login",
  "/en/register/?returnTo=/en/login",
  "/en/\\evil.test",
  "/en/\nattack",
]) {
  assert.equal(safeReturnPath(path, "en"), "/en", path);
}
assert.equal(safeReturnPath(undefined, "uk"), "/uk");
assert.equal(
  new URL(
    authUrl("en", "/en/anime/test#watch"),
    "https://kodzuke.local",
  ).searchParams.get("returnTo"),
  "/en/anime/test#watch",
);
console.log(
  "Account return navigation: local routes preserved, external and invalid redirects rejected",
);

assert.equal(
  new URL(authUrl("uk", "/uk/catalog", "register"), "https://kodzuke.local")
    .pathname,
  "/uk/register",
);
assert.equal(
  new URL(authUrl("ru", "/ru/browse"), "https://kodzuke.local").pathname,
  "/ru/login",
);
