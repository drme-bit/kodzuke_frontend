import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import vm from "node:vm";
const root = new URL("../src/i18n/", import.meta.url).pathname;
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  const compiledModule = { exports };
  cache.set(file, exports);
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const require = (specifier) => {
    if (!specifier.startsWith("."))
      throw new Error(`Unexpected i18n dependency ${specifier}`);
    return load(path.resolve(path.dirname(file), specifier) + ".ts");
  };
  vm.runInNewContext(
    source,
    { exports, module: compiledModule, require, Intl },
    { filename: file },
  );
  return compiledModule.exports;
}
function shape(value) {
  if (typeof value === "string") return "string";
  if (Array.isArray(value)) return [...value].map(shape);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, shape(value[key])]),
    );
  return typeof value;
}
const selectors = {
  auth: "authCopy",
  profile: "profileCopy",
  library: "libraryCopy",
  history: "historyCopy",
  ratings: "ratingCopy",
  home: "homeContent",
  genres: "genreCopy",
  gallery: "galleryCopy",
  heroRatings: "heroRatingCopy",
};
for (const [file, name] of Object.entries(selectors)) {
  const fn = load(path.join(root, `messages/${file}.ts`))[name];
  for (const locale of ["ru", "uk"])
    assert.deepEqual(
      shape(fn(locale)),
      shape(fn("en")),
      `${file}: keys differ for ${locale}`,
    );
  assert.deepEqual(
    shape(fn("invalid")),
    shape(fn("ru")),
    `${file}: invalid locale fallback differs`,
  );
}
for (const [file, name] of [
  ["common", "uiMessages"],
  ["landing", "messages"],
  ["plurals", "pluralForms"],
]) {
  const messages = load(path.join(root, `messages/${file}.ts`))[name];
  for (const locale of ["ru", "uk"])
    assert.deepEqual(
      shape(messages[locale]),
      shape(messages.en),
      `${file}: missing keys for ${locale}`,
    );
}
const ui = load(path.join(root, "ui.ts"));
assert.equal(ui.translator("en")("results", { n: 2 }), "2 results");
assert.equal(ui.translator("ru")("results", { n: 2 }), "2 результата");
assert.equal(ui.translator("uk")("results", { n: 5 }), "5 результатів");
console.log("I18n checked: EN/RU/UK keys, locale fallback and plural forms.");
