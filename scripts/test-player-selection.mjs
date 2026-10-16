import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import ts from "typescript";
const source = readFileSync(new URL("../src/features/anime/playbackSelection.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { playbackSelection: select } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const sources = [
  { id:"alloha-a", source:"Alloha", name:"A" },
  { id:"kodik-b", source:"Kodik", name:"B" },
  { id:"kodik-a", source:"Kodik", name:"A" },
];
const pick = (list, player, voice) => select(list,player,voice,s=>s.source,s=>s.name);
assert.deepEqual(pick(sources,"Kodik",null).voices,["B","A"]);
assert.equal(pick(sources,"Kodik","A").source.id,"kodik-a");
assert.equal(pick(sources,"Kodik","B").activePlayer,"Kodik");
assert.equal(pick(sources,"Alloha","B").source.id,"alloha-a");
assert.deepEqual(pick(sources,"Alloha","B").voices,["A"]);
// A new episode has different source IDs and source ordering.
const next=[{id:"new-alloha",source:"Alloha",name:"C"},{id:"new-kodik",source:"Kodik",name:"A"}];
assert.equal(pick(next,"Kodik","B").source.id,"new-kodik");
assert.equal(pick(next,"Missing","B").activePlayer,"Alloha");
assert.equal(pick([],"Kodik","A").source,undefined);
console.log("Player-first selection: audio isolation, provider switching, episode transitions and empty sources passed");
