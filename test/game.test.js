import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CITIES, MOUNTAINS, OTHER_CITIES, REGIONS, RIVERS, SIGHTS, answer, createGame, currentQuestion, makeSeatOptions, nextQuestion } from "../src/game.js";

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

test("all 32 river records have distinct identifiers, lengths, and map paths", () => {
  assert.equal(RIVERS.length, 32);
  assert.equal(new Set(RIVERS.map((river) => river.code)).size, 32);
  assert.equal(new Set(RIVERS.map((river) => river.name)).size, 32);
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

test("river Wikipedia titles identify the mapped waterways", () => {
  for (const river of RIVERS) {
    assert.equal(typeof river.wikipediaTitle, "string", `${river.code} needs an explicit article title`);
    assert.ok(river.wikipediaTitle.trim(), `${river.code} needs a nonempty article title`);
  }
  const titles = Object.fromEntries(RIVERS.map(({ code, wikipediaTitle }) => [code, wikipediaTitle]));
  const ambiguousTitles = {
    wertach: "Wertach (Fluss)",
    paar: "Paar (Donau)",
    pegnitz: "Pegnitz (Fluss)",
    rott: "Rott (Inn, Neuhaus am Inn)",
    regen: "Regen (Fluss)",
    schwarzach: "Schwarzach (Naab)",
    ilm: "Ilm (Abens)",
    isen: "Isen (Fluss)",
    wiesent: "Wiesent (Regnitz)",
    "vils-naab": "Vils (Naab)",
    "vils-donau": "Vils (Donau)",
  };
  for (const [code, title] of Object.entries(ambiguousTitles)) {
    assert.equal(titles[code], title, `${code} must link to its river article`);
  }
});

test("river rounds use distinct questions, score once, and finish at the chosen count", () => {
  for (const count of [3, 5, 7, 10, 15, 20, 25, 30]) {
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

test("all 15 mountain records have distinct identifiers, summits, and clickable map routes", () => {
  assert.equal(MOUNTAINS.length, 15);
  assert.equal(new Set(MOUNTAINS.map((mountain) => mountain.code)).size, 15);
  assert.equal(new Set(MOUNTAINS.map((mountain) => mountain.name)).size, 15);
  assert.ok(MOUNTAINS.every((mountain) => mountain.region && mountain.peak && Number.isFinite(mountain.peakMeters) && mountain.peakMeters > 0));
  const svg = readFileSync(new URL("../src/regions.svg", import.meta.url), "utf8");
  const groups = [...svg.matchAll(/<g class="mountain"[^>]*data-mountain="([^"]+)"[^>]*>([\s\S]*?)<\/g>/g)];
  assert.deepEqual(new Set(groups.map((match) => match[1])), new Set(MOUNTAINS.map((mountain) => mountain.code)));
  assert.equal(groups.length, MOUNTAINS.length);
  for (const [, code, content] of groups) {
    const visible = content.match(/class="mountain-line" d="([^"]+)"/);
    const hit = content.match(/class="mountain-hit" d="([^"]+)"/);
    assert.ok(visible && hit, `${code} needs a visible route and a click target`);
    assert.equal(visible[1], hit[1]);
    assert.ok(visible[1].startsWith("M "));
  }
});

test("mountain rounds use distinct questions, score once, and finish at the chosen count", () => {
  for (const count of [3, 5, 7, 10, 15]) {
    const game = createGame("mountain", count, () => 0.5);
    assert.equal(new Set(game.questions.map((mountain) => mountain.code)).size, count);
    assert.equal(answer(game, "missing-mountain"), null);
    const wrong = MOUNTAINS.find((mountain) => mountain.code !== currentQuestion(game).code);
    assert.equal(answer(game, wrong.code), false);
    assert.equal(answer(game, currentQuestion(game).code), null);
    assert.equal(nextQuestion(game), true);
    for (let i = 1; i < count; i += 1) {
      assert.equal(answer(game, currentQuestion(game).code), true);
      assert.equal(nextQuestion(game), true);
    }
    assert.equal(game.score, count - 1);
    assert.equal(game.finished, true);
    assert.equal(nextQuestion(game), false);
  }
  assert.throws(() => createGame("mountain", 20), /Invalid question count/);
});

test("sight rounds validate counts, reject foreign codes, score once, and finish", () => {
  for (const count of [3, 5, 7, 10, 15, 20]) {
    const game = createGame("sight", count, () => 0.5);
    assert.equal(game.questions.length, count);
    assert.equal(new Set(game.questions.map(({ code }) => code)).size, count);
    assert.equal(nextQuestion(game), false);
    assert.equal(answer(game, "missing"), null);
    assert.equal(answer(game, REGIONS[0].code), null);
    const wrong = SIGHTS.find(({ code }) => code !== currentQuestion(game).code);
    assert.equal(answer(game, wrong.code), false);
    assert.equal(answer(game, currentQuestion(game).code), null);
    nextQuestion(game);
    while (!game.finished) {
      assert.equal(answer(game, currentQuestion(game).code), true);
      assert.equal(answer(game, currentQuestion(game).code), null);
      nextQuestion(game);
    }
    assert.equal(game.score, count - 1);
    assert.equal(answer(game, SIGHTS[0].code), null);
    assert.equal(nextQuestion(game), false);
  }
  for (const count of [0, 4, 25, 30]) assert.throws(() => createGame("sight", count), /Invalid question count/);
});

test("20 sights cover all regions and have matching accessible markers and credited photos", () => {
  assert.equal(SIGHTS.length, 20);
  assert.equal(new Set(SIGHTS.map(({ code }) => code)).size, 20);
  assert.deepEqual(new Set(SIGHTS.map(({ regionCode }) => regionCode)), new Set(REGIONS.map(({ code }) => code)));
  const svg = readFileSync(new URL("../src/regions.svg", import.meta.url), "utf8");
  const metadata = JSON.parse(readFileSync(new URL("../assets/sights/metadata.json", import.meta.url), "utf8"));
  const credits = readFileSync(new URL("../assets/sights/ATTRIBUTION.md", import.meta.url), "utf8");
  const groups = [...svg.matchAll(/<g class="sight"[^>]*data-sight="([^"]+)"[^>]*>([\s\S]*?)<\/g>/g)];
  assert.equal(groups.length, 20);
  assert.equal(metadata.length, 20);
  for (const sight of SIGHTS) {
    assert.ok(sight.name && sight.location && sight.fact && sight.wikipediaTitle);
    assert.ok(sight.sourceUrl.startsWith("https://"));
    assert.ok(sight.lat > 47 && sight.lat < 51 && sight.lon > 8 && sight.lon < 14);
    const marker = groups.find((group) => group[1] === sight.code);
    assert.ok(marker, sight.code);
    assert.match(marker[0], /role="button"/);
    assert.match(marker[0], /aria-label="[^"]+"/);
    assert.match(marker[2], /class="sight-hit"/);
    assert.match(marker[2], /class="sight-dot"/);
    const image = metadata.find(({ slug }) => slug === sight.code);
    assert.ok(image.artist && image.license && image.page_url);
    assert.ok(credits.includes(image.page_url));
    const photo = readFileSync(new URL(`../assets/sights/${sight.code}.jpg`, import.meta.url));
    assert.equal(photo[0], 0xff);
    assert.equal(photo[1], 0xd8);
  }
});


test("city rounds validate counts, reject foreign codes, score once, and finish", () => {
  for (const count of [3, 5, 7, 10, 15, 20, 25]) {
    const game = createGame("city", count, () => 0.5);
    assert.equal(game.questions.length, count);
    assert.equal(new Set(game.questions.map(({ code }) => code)).size, count);
    assert.equal(nextQuestion(game), false);
    for (const code of ["missing", REGIONS[0].code, RIVERS[0].code, SIGHTS[0].code]) {
      assert.equal(answer(game, code), null);
      assert.equal(game.answered, false);
      assert.equal(game.score, 0);
    }
    const wrong = CITIES.find(({ code }) => code !== currentQuestion(game).code);
    assert.equal(answer(game, wrong.code), false);
    assert.equal(answer(game, currentQuestion(game).code), null);
    assert.equal(nextQuestion(game), true);
    while (!game.finished) {
      assert.equal(answer(game, currentQuestion(game).code), true);
      assert.equal(answer(game, currentQuestion(game).code), null);
      assert.equal(nextQuestion(game), true);
    }
    assert.equal(game.score, count - 1);
    assert.equal(currentQuestion(game), null);
    assert.equal(answer(game, CITIES[0].code), null);
    assert.equal(nextQuestion(game), false);
  }
  for (const count of [0, 4, 26, 30]) assert.throws(() => createGame("city", count), /Invalid question count/);
});

test("25 independent cities cover all regions with accessible, aligned map markers", () => {
  assert.equal(CITIES.length, 25);
  assert.equal(new Set(CITIES.map(({ code }) => code)).size, 25);
  assert.equal(new Set(CITIES.map(({ name }) => name)).size, 25);
  assert.deepEqual(REGIONS.map(({ code }) => CITIES.filter((city) => city.regionCode === code).length), [3, 3, 3, 4, 5, 3, 4]);
  const seats = JSON.parse(readFileSync(new URL("../scripts/seat-locations.json", import.meta.url), "utf8"));
  for (const region of REGIONS) {
    const city = CITIES.find(({ name }) => name === region.seat);
    assert.equal(city.regionCode, region.code);
    assert.equal(city.lat, seats[region.code].lat);
    assert.equal(city.lon, seats[region.code].lon);
  }
  const svg = readFileSync(new URL("../src/regions.svg", import.meta.url), "utf8");
  const groups = [...svg.matchAll(/<g class="city"[^>]*data-city="([^"]+)"[^>]*>([\s\S]*?)<\/g>/g)];
  assert.equal(groups.length, 25);
  assert.deepEqual(new Set(groups.map((group) => group[1])), new Set(CITIES.map(({ code }) => code)));
  for (const city of CITIES) {
    assert.ok(city.name && city.wikipediaTitle);
    assert.ok(city.lat > 47 && city.lat < 51 && city.lon > 8 && city.lon < 14);
    const marker = groups.find((group) => group[1] === city.code);
    assert.match(marker[0], /role="button"/);
    assert.ok(marker[0].includes(`aria-label="${city.name}"`));
    assert.match(marker[0], /tabindex="-1"/);
    const hit = marker[2].match(/class="city-hit" cx="([^"]+)" cy="([^"]+)" r="([^"]+)"/);
    const dot = marker[2].match(/class="city-dot" cx="([^"]+)" cy="([^"]+)" r="([^"]+)"/);
    assert.ok(hit && dot, city.code);
    assert.deepEqual(hit.slice(1, 3), dot.slice(1, 3));
    assert.ok(Number(hit[3]) > Number(dot[3]));
    assert.ok(Number(dot[1]) > 0 && Number(dot[1]) < 800);
    assert.ok(Number(dot[2]) > 0 && Number(dot[2]) < 800);
  }
});


test("every city has a locally bundled, credited PNG coat of arms", () => {
  const metadata = JSON.parse(readFileSync(new URL("../assets/cities/metadata.json", import.meta.url), "utf8"));
  const credits = readFileSync(new URL("../assets/cities/ATTRIBUTION.md", import.meta.url), "utf8");
  assert.equal(metadata.length, CITIES.length);
  assert.deepEqual(new Set(metadata.map(({ slug }) => slug)), new Set(CITIES.map(({ code }) => code)));
  for (const city of CITIES) {
    const image = metadata.find(({ slug }) => slug === city.code);
    assert.equal(image.path, `assets/cities/${city.code}.png`);
    assert.equal(image.name, city.name);
    assert.ok(image.artist && image.license);
    assert.ok(image.page_url.startsWith("https://commons.wikimedia.org/wiki/File:"));
    assert.ok(credits.includes(image.page_url));
    const png = readFileSync(new URL(`../${image.path}`, import.meta.url));
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(png.readUInt32BE(16), 120);
    assert.ok(png.readUInt32BE(20) > 0);
  }
});
