import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { OTHER_CITIES, REGIONS, RIVERS, answer, createGame, currentQuestion, makeSeatOptions, nextQuestion } from "../src/game.js";

test("each official region has a unique code and government seat", () => {
  assert.equal(REGIONS.length, 7);
  assert.equal(new Set(REGIONS.map((region) => region.code)).size, 7);
  assert.equal(new Set(REGIONS.map((region) => region.seat)).size, 7);
  assert.deepEqual(Object.fromEntries(REGIONS.map(({ name, seat }) => [name, seat])), {
    Oberbayern: "München",
    Niederbayern: "Landshut",
    Oberpfalz: "Regensburg",
    Oberfranken: "Bayreuth",
    Mittelfranken: "Ansbach",
    Unterfranken: "Würzburg",
    Schwaben: "Augsburg",
  });
});

test("map rounds use distinct regions, score once, and end after the selected count", () => {
  const game = createGame("map", 3, () => 0.5);
  assert.equal(new Set(game.questions.map((region) => region.code)).size, 3);
  const first = currentQuestion(game);
  assert.equal(answer(game, first.code), true);
  assert.equal(answer(game, first.code), null);
  assert.equal(game.score, 1);
  assert.equal(nextQuestion(game), true);
  assert.equal(answer(game, first.code), false);
  assert.equal(game.score, 1);
  assert.equal(nextQuestion(game), true);
  assert.equal(answer(game, currentQuestion(game).code), true);
  assert.equal(nextQuestion(game), true);
  assert.equal(game.finished, true);
  assert.equal(game.score, 2);
  assert.equal(nextQuestion(game), false);
});

test("seat rounds mix government seats with other Bavarian cities", () => {
  const seatCodes = new Set(REGIONS.map((region) => region.code));
  const seatNames = new Set(REGIONS.map((region) => region.seat));
  assert.ok(OTHER_CITIES.every((city) => !seatNames.has(city.seat)));
  assert.equal(new Set(OTHER_CITIES.map((city) => city.code)).size, OTHER_CITIES.length);
  const game = createGame("seat", 7, () => 0.3);
  for (let i = 0; i < 7; i += 1) {
    const target = currentQuestion(game);
    const options = makeSeatOptions(game, () => 0.7);
    assert.equal(options.length, 4);
    assert.equal(new Set(options.map((region) => region.seat)).size, 4);
    assert.ok(options.some((region) => region.code === target.code));
    assert.equal(options.filter((option) => seatCodes.has(option.code)).length, 2);
    assert.equal(options.filter((option) => !seatCodes.has(option.code)).length, 2);
    assert.ok(options.some((option) => option.regionCode === target.code));
    assert.equal(answer(game, target.code), true);
    nextQuestion(game);
  }
  assert.equal(game.finished, true);
  assert.equal(game.score, 7);
});

test("a non-seat city is a valid wrong answer and cannot be scored twice", () => {
  const game = createGame("seat", 3, () => 0.3);
  const options = makeSeatOptions(game, () => 0.7);
  const city = options.find((option) => option.regionCode);
  assert.equal(answer(game, city.code), false);
  assert.equal(game.score, 0);
  assert.equal(answer(game, currentQuestion(game).code), null);
});

test("all 20 river records have distinct identifiers, lengths, and map paths", () => {
  assert.equal(RIVERS.length, 20);
  assert.equal(new Set(RIVERS.map((river) => river.code)).size, 20);
  assert.ok(RIVERS.every((river) => river.name && Number.isFinite(river.lengthKm) && river.lengthKm > 0));
  const svg = readFileSync(new URL("../src/regions.svg", import.meta.url), "utf8");
  const groups = [...svg.matchAll(/<g class="river"[^>]*data-river="([^"]+)"[^>]*>([\s\S]*?)<\/g>/g)];
  const mapCodes = groups.map((match) => match[1]);
  assert.deepEqual(new Set(mapCodes), new Set(RIVERS.map((river) => river.code)));
  assert.equal(mapCodes.length, RIVERS.length);
  for (const [, code, content] of groups) {
    const visible = content.match(/class="river-line" d="([^"]+)"/);
    const hit = content.match(/class="river-hit" d="([^"]+)"/);
    assert.ok(visible && hit, `${code} needs a visible route and a click target`);
    assert.equal(visible[1], hit[1]);
    assert.ok(visible[1].startsWith("M "));
  }
});

test("river rounds use distinct questions, score once, and finish at the chosen count", () => {
  for (const count of [3, 5, 7, 10, 15, 20]) {
    const game = createGame("river", count, () => 0.5);
    assert.equal(new Set(game.questions.map((river) => river.code)).size, count);
    assert.equal(answer(game, "missing-river"), null);
    for (let i = 0; i < count; i += 1) {
      const target = currentQuestion(game);
      assert.equal(answer(game, target.code), true);
      assert.equal(answer(game, target.code), null);
      assert.equal(nextQuestion(game), true);
    }
    assert.equal(game.score, count);
    assert.equal(game.finished, true);
    assert.equal(nextQuestion(game), false);
  }
  assert.throws(() => createGame("map", 20), /Invalid question count/);
});
