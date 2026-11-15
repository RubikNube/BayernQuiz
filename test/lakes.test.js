import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LAKES, REGIONS, RIVERS, createGame, currentQuestion, answer, nextQuestion } from '../src/game.js';

test('lake rounds validate counts, reject foreign answers, score once, and finish', () => {
  for (const count of [3, 5, 7, 10, 15, 20]) {
    const game = createGame('lake', count, () => 0.5);
    assert.equal(game.questions.length, count);
    assert.equal(new Set(game.questions.map(x => x.code)).size, count);
    assert.equal(nextQuestion(game), false);
    for (const code of ['missing', REGIONS[0].code, RIVERS[0].code]) assert.equal(answer(game, code), null);
    const wrong = LAKES.find(x => x.code !== currentQuestion(game).code);
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
    assert.equal(answer(game, LAKES[0].code), null);
    assert.equal(nextQuestion(game), false);
  }
  for (const count of [0, 4, 21, 25, 30, '7', NaN]) assert.throws(() => createGame('lake', count), /Invalid question count/);
});

test('20 sourced lakes have accessible polygon targets and include natural and artificial lakes', () => {
  assert.equal(LAKES.length, 20);
  assert.equal(new Set(LAKES.map(x => x.code)).size, 20);
  const svg = readFileSync(new URL('../src/regions.svg', import.meta.url), 'utf8');
  const geometry = JSON.parse(readFileSync(new URL('../scripts/lake-geometry.json', import.meta.url), 'utf8'));
  assert.equal(geometry.crs, 'EPSG:3857');
  const groups = [...svg.matchAll(/<g class="lake"[^>]*data-lake="([^"]+)"[^>]*>([\s\S]*?)<\/g>/g)];
  assert.equal(groups.length, 20);
  assert.ok(svg.indexOf('id="lakesLayer"') < svg.indexOf('class="seat-locations"'));
  assert.ok(svg.indexOf('id="lakesLayer"') > svg.indexOf('id="unterfranken"'));
  for (const lake of LAKES) {
    assert.ok(lake.name && lake.location && lake.fact && lake.wikipediaTitle);
    assert.ok(lake.areaKm2 > 0);
    assert.ok(['natürlich', 'Stausee', 'Tagebausee'].includes(lake.kind));
    assert.equal(new URL(lake.sourceUrl).protocol, 'https:');
    assert.ok(geometry.polygons[lake.code].length);
    // Duplicate official names must not introduce distant, unrelated lakes.
    const points = geometry.polygons[lake.code].flat(2);
    const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
    assert.ok(Math.max(...xs) - Math.min(...xs) < 60000, lake.code);
    assert.ok(Math.max(...ys) - Math.min(...ys) < 60000, lake.code);
    const group = groups.find(x => x[1] === lake.code);
    assert.ok(group, lake.code);
    assert.ok(group[0].includes(`aria-label="${lake.name}"`));
    assert.match(group[0], /role="button"/);
    assert.match(group[0], /tabindex="-1"/);
    assert.match(group[2], /class="lake-shape"/);
    assert.match(group[2], /class="lake-hit"/);
    assert.doesNotMatch(group[2], /NaN|Infinity/);
    assert.match(group[2], / Z/);
  }
  assert.ok(LAKES.some(x => x.kind === 'natürlich'));
  assert.ok(LAKES.some(x => x.kind === 'Stausee'));
  assert.ok(LAKES.some(x => x.kind === 'Tagebausee'));
});

test('offline lake regeneration is idempotent and preserves all existing layers', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bayernquiz-lakes-'));
  try {
    const svgPath = join(directory, 'regions.svg');
    const original = readFileSync(new URL('../src/regions.svg', import.meta.url), 'utf8');
    const script = fileURLToPath(new URL('../scripts/generate-lakes.py', import.meta.url));
    writeFileSync(svgPath, original);
    execFileSync('python3', [script, svgPath]);
    assert.equal(readFileSync(svgPath, 'utf8'), original);
    const without = original.replace(/\n  <g\b[^>]*id="lakesLayer"[\s\S]*?\n  <\/g>/, '');
    assert.ok(without.length < original.length);
    writeFileSync(svgPath, without);
    execFileSync('python3', [script, svgPath]);
    assert.equal(readFileSync(svgPath, 'utf8'), original);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('every lake has a bundled JPEG and complete Commons credits', () => {
  const records = JSON.parse(readFileSync(new URL('../assets/lakes/metadata.json', import.meta.url), 'utf8'));
  const credits = readFileSync(new URL('../assets/lakes/ATTRIBUTION.md', import.meta.url), 'utf8');
  assert.equal(records.length, 20);
  assert.deepEqual(new Set(records.map(x => x.slug)), new Set(LAKES.map(x => x.code)));
  for (const lake of LAKES) {
    const record = records.find(x => x.slug === lake.code);
    assert.equal(record.path, `assets/lakes/${lake.code}.jpg`);
    assert.ok(record.artist && record.license);
    assert.equal(new URL(record.page_url).hostname, 'commons.wikimedia.org');
    assert.ok(credits.includes(record.page_url) && credits.includes(lake.name));
    const photo = readFileSync(new URL(`../${record.path}`, import.meta.url));
    assert.equal(photo[0], 0xff);
    assert.equal(photo[1], 0xd8);
    assert.ok(photo.length > 1000 && photo.length < 150000);
  }
});
