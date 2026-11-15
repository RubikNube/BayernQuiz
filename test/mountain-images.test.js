import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MOUNTAINS } from "../src/game.js";

test("every mountain range has a small local JPEG with complete Commons credits", () => {
  const metadata = JSON.parse(readFileSync(new URL("../assets/mountains/metadata.json", import.meta.url), "utf8"));
  const credits = readFileSync(new URL("../assets/mountains/ATTRIBUTION.md", import.meta.url), "utf8");
  assert.equal(metadata.length, MOUNTAINS.length);
  assert.deepEqual(new Set(metadata.map(({ slug }) => slug)), new Set(MOUNTAINS.map(({ code }) => code)));
  for (const mountain of MOUNTAINS) {
    const record = metadata.find(({ slug }) => slug === mountain.code);
    assert.equal(record.path, `assets/mountains/${mountain.code}.jpg`);
    assert.ok(record.artist && record.license);
    assert.ok(record.license_url || record.license === "Public domain");
    assert.equal(new URL(record.page_url).hostname, "commons.wikimedia.org");
    assert.ok(credits.includes(record.page_url) && credits.includes(mountain.name));
    const photo = readFileSync(new URL(`../${record.path}`, import.meta.url));
    assert.equal(photo[0], 0xff);
    assert.equal(photo[1], 0xd8);
    assert.ok(photo.length > 1000 && photo.length < 150_000, `${mountain.code}: thumbnail size`);
  }
});
