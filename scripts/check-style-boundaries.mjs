import { readFileSync } from "node:fs";
const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
for (const match of css.matchAll(/([^{}]+)\{/g)) {
  const selector = match[1].trim();
  if (selector !== ":root" && !selector.startsWith("@theme") && !selector.startsWith("@media")) throw new Error(`globals.css may contain only tokens: ${selector}`);
}
for (const match of css.matchAll(/(?:^|[;{])\s*([\w-]+)\s*:/g)) {
  if (!match[1].startsWith("--")) throw new Error(`Non-token declaration in globals.css: ${match[1]}`);
}
console.log("Style boundaries checked: globals.css contains tokens only.");
