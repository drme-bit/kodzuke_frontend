import assert from "node:assert/strict";
import fs from "node:fs/promises";
import ts from "typescript";
async function module(path) {
  const source = await fs.readFile(new URL(path, import.meta.url), "utf8");
  const compiled = ts.transpile(source, {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
  );
}
const { readAdvertisementEvent: read } = await module(
  "../src/features/anime/playbackEvents.ts",
);
assert.equal(read({ event: "vast_Impression" }), true);
assert.equal(read(JSON.stringify({ event: "vast_Start" })), true);
assert.equal(read({ event: "vast_finish" }), false);
assert.equal(read({ key: "kodik_player_advert_ended" }), false);
assert.equal(read({ key: "kodik_player_video_started" }), false);
for (const event of [
  "pause",
  "buffering",
  "play",
  "vast_Complete",
  "vast_Skip",
  "vast_ClickTracking",
])
  assert.equal(read({ event }), null);
assert.equal(read("broken JSON"), null);
assert.equal(read(null), null);
const { PlaybackRecorder } = await module(
  "../src/features/library/PlaybackRecorder.ts",
);
let now = 1000;
const writes = [];
const recorder = new PlaybackRecorder(
  "episode",
  "token",
  "session",
  async (...args) => writes.push(args),
  () => now,
);
recorder.state("advertising");
now += 60000;
await recorder.flush();
assert.equal(writes.length, 0, "Ads must not count as viewing");
recorder.state("playing");
now += 10000;
recorder.state("advertising");
now += 30000;
await recorder.flush();
assert.equal(writes.length, 0, "Midroll pauses the eligibility clock");
recorder.state("playing");
now += 10000;
await recorder.flush();
assert.equal(writes.length, 1);
console.log("Ad lifecycle parsing and exclusion from viewing history passed");
