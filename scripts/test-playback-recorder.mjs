import assert from "node:assert/strict";
import fs from "node:fs/promises";
import ts from "typescript";
const source = await fs.readFile(
  new URL("../src/features/library/PlaybackRecorder.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpile(source, {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ES2022,
});
const { PlaybackRecorder } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);
let now = 1000;
const writes = [];
const recorder = new PlaybackRecorder(
  "episode",
  "account-token",
  "session",
  async (...args) => writes.push(args),
  () => now,
);
recorder.update({ time: 900, duration: 1200 });
await recorder.flush();
assert.equal(writes.length, 0, "Seeking on page load is not a view");
recorder.state("playing");
now += 10000;
recorder.update({ time: 1000, duration: 1200 });
recorder.state("paused");
await recorder.flush();
assert.equal(writes.length, 0, "Less than 20 seconds must not be persisted");
now += 60000;
await recorder.flush();
assert.equal(writes.length, 0, "Paused time does not qualify");
recorder.state("playing");
now += 9000;
recorder.tick();
await recorder.flush();
assert.equal(writes.length, 0);
now += 1000;
recorder.update({ time: 1010, duration: 1200 });
await recorder.flush();
assert.equal(writes.at(-1)[1], 1010);
assert.equal(writes.at(-1)[4], "account-token");
const previous = writes.length;
now += 500;
recorder.update({ time: 1011, duration: 1200 });
await Promise.resolve();
assert.equal(writes.length, previous, "Frequent progress is throttled");
recorder.state("buffering");
now += 30000;
recorder.state("playing");
now += 1000;
recorder.state("paused");
await recorder.flush();
assert.equal(writes.at(-1)[3], false);
recorder.state("playing");
now += 2000;
recorder.update({ time: 1200, duration: 1200 });
await recorder.flush(true);
assert.equal(writes.at(-1)[3], true);
const anonymous = new PlaybackRecorder(
  "episode",
  null,
  "anonymous",
  async () => assert.fail("Anonymous progress must not persist"),
  () => now,
);
anonymous.state("playing");
now += 21000;
await anonymous.flush();
console.log(
  "Playback recorder: 20-second threshold, pause, seek, throttling and completion passed",
);
