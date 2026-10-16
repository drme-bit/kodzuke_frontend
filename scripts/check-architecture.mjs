import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
const root = new URL("../src/", import.meta.url);
const files = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.tsx?$/.test(file)) files.push(file);
  }
}
walk(fileURLToPath(root));
const failures = [];
for (const file of files) {
  const relative = path
    .relative(fileURLToPath(root), file)
    .replaceAll(path.sep, "/");
  const code = fs.readFileSync(file, "utf8");
  const tree = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);
  const api = relative.startsWith("api/");
  const dto = relative.startsWith("dto/");
  for (const node of tree.statements) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const importPath = node.moduleSpecifier?.text;
      if (typeof importPath !== "string") continue;
      if (importPath.startsWith("../"))
        failures.push(
          `${relative}: use @/ instead of parent-relative imports (${importPath})`,
        );
      if (/^(?:@\/shared\/api|@\/lib\/(?:api|graphql))/.test(importPath))
        failures.push(`${relative}: legacy API import ${importPath}`);
      if (api && /@\/(?:features|app|components|i18n)(?:\/|$)/.test(importPath))
        failures.push(`${relative}: API depends on UI ${importPath}`);
      if (!api && importPath.startsWith("@/api/graphql/"))
        failures.push(`${relative}: low-level GraphQL belongs in api/`);
      if (
        dto &&
        (ts.isImportDeclaration(node)
          ? !node.importClause?.isTypeOnly
          : !node.isTypeOnly)
      )
        failures.push(`${relative}: DTO imports/exports must be type-only`);
    }
    if (
      dto &&
      !ts.isImportDeclaration(node) &&
      !ts.isExportDeclaration(node) &&
      !ts.isInterfaceDeclaration(node) &&
      !ts.isTypeAliasDeclaration(node)
    )
      failures.push(`${relative}: DTO contains runtime code`);
  }
  if (!api && /\b(?:gql|publicGraphql|fetch)\s*(?:<[^;]*?>)?\s*\(/.test(code))
    failures.push(`${relative}: network access belongs in api/`);
  if (
    relative.startsWith("api/server/") ||
    relative === "api/graphql/server.ts"
  ) {
    if (!/import ["']server-only["']/.test(code))
      failures.push(`${relative}: missing server-only guard`);
  }
  if (
    api &&
    /(?:@\/api\/graphql\/server|["']\.\/graphql["'])/.test(code) &&
    !relative.startsWith("api/server/")
  )
    failures.push(`${relative}: server transport imported into browser module`);
}
for (const obsolete of ["shared/api", "lib/api.ts", "lib/graphql.ts"]) {
  if (fs.existsSync(new URL(obsolete, root)))
    failures.push(`Obsolete entry point remains: ${obsolete}`);
}
if (failures.length) throw new Error(failures.join("\n"));
console.log(
  `Architecture checked: ${files.length} files, API/DTO/SSR separation intact.`,
);
