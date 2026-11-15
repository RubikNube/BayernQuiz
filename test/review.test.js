import test from "node:test";
import assert from "node:assert/strict";
import { REGIONS, CITIES, LAKES, RIVERS, MOUNTAINS, SIGHTS, NATURE_RESERVES,
  createGame, createRetryGame, currentQuestion, answer, nextQuestion, makeSeatOptions,
  getMistakeReview, questionText } from "../src/game.js";
import { createHighscores } from "../src/highscores.js";

const datasets = { map: REGIONS, seat: REGIONS, city: CITIES, lake: LAKES,
  river: RIVERS, mountain: MOUNTAINS, sight: SIGHTS, nature: NATURE_RESERVES };

function complete(game, missed = 0) {
  while (!game.finished) {
    const target = currentQuestion(game);
    const options = game.mode === "seat" ? makeSeatOptions(game) : datasets[game.mode];
    const selected = game.index < missed ? options.find(x => x.code !== target.code).code : target.code;
    assert.equal(answer(game, selected), game.index >= missed);
    nextQuestion(game);
  }
  return game;
}

for (const [mode, items] of Object.entries(datasets)) {
  test(`${mode}: history captures accepted answers only and review retains question order`, () => {
    const game = createGame(mode, 3);
    assert.equal(game.isPractice, false);
    assert.deepEqual(game.history, []);
    assert.deepEqual(getMistakeReview(game), []);
    assert.equal(answer(game, "missing"), null);
    assert.deepEqual(game.history, []);
    const expected = [];
    while (!game.finished) {
      const target = currentQuestion(game);
      const options = mode === "seat" ? makeSeatOptions(game) : items;
      const correct = game.index === 1;
      const selected = correct ? target : options.find(x => x.code !== target.code);
      assert.equal(answer(game, selected.code), correct);
      if (!correct) expected.push({ question: questionText(mode, target),
        selectedAnswer: mode === "seat" ? selected.seat : selected.name,
        correctAnswer: mode === "seat" ? target.seat : target.name });
      const snapshot = structuredClone(game.history);
      assert.equal(answer(game, target.code), null);
      assert.deepEqual(game.history, snapshot);
      nextQuestion(game);
    }
    assert.equal(game.history.length, 3);
    assert.equal(game.score, 1);
    assert.deepEqual(getMistakeReview(game), expected);
    assert.equal(answer(game, items[0].code), null);
    assert.equal(game.history.length, 3);
  });

  test(`${mode}: retries shrink from two mistakes to one without mutating their source`, () => {
    const original = complete(createGame(mode, 3), 2);
    const snapshot = structuredClone(original);
    const retry = createRetryGame(original, () => 0);
    assert.deepEqual(original, snapshot);
    assert.equal(retry.isPractice, true);
    assert.equal(retry.mode, mode);
    assert.equal(retry.score, 0);
    assert.equal(retry.index, 0);
    assert.equal(retry.answered, false);
    assert.equal(retry.finished, false);
    assert.equal(retry.selectedCode, null);
    assert.deepEqual(retry.options, []);
    assert.deepEqual(retry.history, []);
    assert.deepEqual(retry.questions.map(x => x.code), original.questions.slice(0, 2).reverse().map(x => x.code));
    complete(retry, 1);
    const last = createRetryGame(retry);
    assert.deepEqual(last.questions.map(x => x.code), [retry.history[0].questionCode]);
    complete(last);
    assert.deepEqual(getMistakeReview(last), []);
    assert.throws(() => createRetryGame(last), /No mistakes/);
    assert.deepEqual(original, snapshot);
    // Restarting an attempt uses the unchanged source and includes its full subset.
    assert.equal(createRetryGame(original).questions.length, 2);
  });

  test(`${mode}: perfect rounds cannot retry; all-wrong rounds retry every question`, () => {
    assert.throws(() => createRetryGame(createGame(mode, 3)), /finished round/);
    const perfect = complete(createGame(mode, 3));
    assert.deepEqual(getMistakeReview(perfect), []);
    assert.throws(() => createRetryGame(perfect), /No mistakes/);
    const wrong = complete(createGame(mode, 3), 3);
    assert.deepEqual(new Set(createRetryGame(wrong).questions.map(x => x.code)),
      new Set(wrong.questions.map(x => x.code)));
  });
}

test("government-seat review resolves distractor city names", () => {
  const game = createGame("seat", 3);
  const expected = [];
  while (!game.finished) {
    const target = currentQuestion(game);
    const selected = makeSeatOptions(game).find(x => x.regionCode);
    expected.push({ question: questionText("seat", target), selectedAnswer: selected.seat, correctAnswer: target.seat });
    answer(game, selected.code);
    nextQuestion(game);
  }
  assert.deepEqual(getMistakeReview(game), expected);
});

test("practice never writes records, including normal lengths of three and seven", () => {
  let writes = 0;
  const scores = createHighscores(() => ({ getItem: () => null, setItem: () => { writes += 1; } }));
  for (const mode of Object.keys(datasets)) {
    for (const count of [3, 7]) {
      const normal = complete(createGame(mode, count), count);
      scores.recordCompletedRound(normal);
      const previousWrites = writes;
      const retry = complete(createRetryGame(normal));
      assert.equal(scores.recordCompletedRound(retry), null);
      assert.equal(scores.recordCompletedRound(retry), null);
      assert.equal(scores.getBest(mode, count), 0);
      assert.equal(writes, previousWrites);
    }
  }
});
