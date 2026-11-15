import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { NATURE_RESERVES, REGIONS, CITIES, RIVERS, MOUNTAINS, SIGHTS, createGame, currentQuestion, answer, nextQuestion } from "../src/game.js";

test("nature rounds validate counts, score once, and finish without repeated questions", () => {
  for (const count of [3, 5, 7, 10, 15, 20]) {
    const game = createGame("nature", count, () => 0.5);
    assert.equal(game.questions.length, count);
    assert.equal(new Set(game.questions.map(({ code }) => code)).size, count);
    assert.equal(nextQuestion(game), false);
    for (const code of ["missing", REGIONS[0].code, CITIES[0].code, RIVERS[0].code, MOUNTAINS[0].code, SIGHTS[0].code]) {
      assert.equal(answer(game, code), null);
    }
    assert.equal(game.answered, false);
    const wrong = NATURE_RESERVES.find(({ code }) => code !== currentQuestion(game).code);
    assert.equal(answer(game, wrong.code), false);
    assert.equal(game.selectedCode, wrong.code);
    assert.equal(answer(game, currentQuestion(game).code), null);
    assert.equal(nextQuestion(game), true);
    while (!game.finished) {
      assert.equal(answer(game, currentQuestion(game).code), true);
      assert.equal(answer(game, currentQuestion(game).code), null);
      assert.equal(nextQuestion(game), true);
    }
    assert.equal(game.score, count - 1);
    assert.equal(currentQuestion(game), null);
    assert.equal(answer(game, NATURE_RESERVES[0].code), null);
    assert.equal(nextQuestion(game), false);
  }
  for (const count of [0, 4, 21, 25, 30, "7", NaN]) {
    assert.throws(() => createGame("nature", count), /Invalid question count/);
  }
});

test("20 reserves cover all regions and have sourced data and accessible markers", () => {
  assert.equal(NATURE_RESERVES.length, 20);
  assert.equal(new Set(NATURE_RESERVES.map(({ code }) => code)).size, 20);
  assert.equal(new Set(NATURE_RESERVES.map(({ nsgId }) => nsgId)).size, 20);
  assert.deepEqual(new Set(NATURE_RESERVES.map(({ regionCode }) => regionCode)), new Set(REGIONS.map(({ code }) => code)));
  const otherCodes = new Set([...REGIONS, ...CITIES, ...RIVERS, ...MOUNTAINS, ...SIGHTS].map(({ code }) => code));
  const svg = readFileSync(new URL("../src/regions.svg", import.meta.url), "utf8");
  const groups = [...svg.matchAll(/<g class="nature"[^>]*data-nature="([^"]+)"[^>]*>([\s\S]*?)<\/g>/g)];
  assert.equal(groups.length, 20);
  for (const reserve of NATURE_RESERVES) {
    assert.ok(!otherCodes.has(reserve.code));
    assert.match(reserve.code, /^[a-z]+(?:-[a-z]+)*$/);
    assert.ok(reserve.nsgId.startsWith("NSG-"));
    assert.ok(reserve.name && reserve.location && reserve.fact && reserve.wikipediaTitle);
    assert.equal(new URL(reserve.sourceUrl).protocol, "https:");
    assert.ok(reserve.lat > 47 && reserve.lat < 51 && reserve.lon > 8 && reserve.lon < 14);
    const marker = groups.find((group) => group[1] === reserve.code);
    assert.ok(marker, reserve.code);
    assert.ok(marker[0].includes(`aria-label="${reserve.name}"`));
    assert.match(marker[0], /role="button"/);
    assert.match(marker[0], /tabindex="-1"/);
    assert.match(marker[2], /class="nature-hit"/);
    assert.match(marker[2], /class="nature-dot"/);
    const circles = [...marker[2].matchAll(/cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)];
    assert.equal(circles.length, 2);
    assert.deepEqual(circles[0].slice(1, 3), circles[1].slice(1, 3));
    assert.ok(Number(circles[0][3]) > Number(circles[1][3]));
    assert.ok(Number(circles[1][1]) >= 0 && Number(circles[1][1]) <= 740);
    assert.ok(Number(circles[1][2]) >= 0 && Number(circles[1][2]) <= 740);
  }
});

test("offline reserve generator is idempotent and preserves every other SVG layer", () => {
  const directory = mkdtempSync(join(tmpdir(), "bayernquiz-nature-"));
  try {
    const svgPath = join(directory, "regions.svg");
    const original = readFileSync(new URL("../src/regions.svg", import.meta.url), "utf8");
    writeFileSync(svgPath, original);
    const script = fileURLToPath(new URL("../scripts/generate-nature-reserves.py", import.meta.url));
    execFileSync("python3", [script, svgPath]);
    const generated = readFileSync(svgPath, "utf8");
    assert.equal(generated, original);
    execFileSync("python3", [script, svgPath]);
    assert.equal(readFileSync(svgPath, "utf8"), generated);
    // Verify adding the overlay to a map without it preserves all existing bytes.
    const withoutLayer = original.replace(/\n  <g\b[^>]*id="natureReservesLayer"[\s\S]*\n  <\/g>\n(?=<\/svg>)/, "\n");
    assert.ok(withoutLayer.length < original.length, "reserve overlay removed from fixture");
    writeFileSync(svgPath, withoutLayer);
    execFileSync("python3", [script, svgPath]);
    assert.equal(readFileSync(svgPath, "utf8"), original);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
