import test from "node:test";
import assert from "node:assert/strict";
import { createMistakes } from "../src/mistakes.js";
import { MAP_TOPICS, REGIONS, createCorrectionGame, createGame, createRetryGame,
  currentQuestion, questionTopic, answer, nextQuestion, makeSeatOptions, getMistakeReview } from "../src/game.js";
import { createHighscores } from "../src/highscores.js";

function storage(initial) {
  const values = new Map(initial === undefined ? [] : [["bayernQuizMistakes", initial]]);
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key) };
}
function saved(entries) { return JSON.stringify({ version: 1, entries }); }
const reference = { topic: "map", code: REGIONS[0].code };
function respond(store, correct, ref = reference) {
  const game = createCorrectionGame([ref]);
  if (ref.topic === "seat") makeSeatOptions(game);
  const items = ref.topic === "seat" ? game.options : MAP_TOPICS[ref.topic];
  answer(game, correct ? ref.code : items.find(item => item.code !== ref.code).code);
  return { game, result: store.recordAnswer(game) };
}

test("mistakes persist immediately, require two correct rounds, reset on error, and can recur", () => {
  const db = storage();
  let store = createMistakes(() => db);
  assert.equal(respond(store, true).result, null);
  assert.equal(store.count, 0);
  const { game } = respond(store, false);
  assert.equal(game.finished, false); // Already saved before advancing or finishing.
  store = createMistakes(() => db);
  assert.deepEqual(store.entries, [{ ...reference, streak: 0 }]);
  assert.deepEqual(respond(store, true).result, { streak: 1, cleared: false });
  store = createMistakes(() => db);
  assert.equal(store.entries[0].streak, 1);
  respond(store, false);
  assert.equal(store.entries[0].streak, 0);
  respond(store, true);
  assert.deepEqual(respond(store, true).result, { streak: 2, cleared: true });
  assert.equal(createMistakes(() => db).count, 0);
  respond(store, false);
  assert.equal(store.count, 1);
});

test("only accepted answers count; duplicate recording cannot advance or re-add a question", () => {
  const store = createMistakes(() => storage());
  respond(store, false);
  const game = createCorrectionGame([reference]);
  assert.equal(store.recordAnswer(game), null);
  assert.equal(answer(game, "missing"), null);
  assert.equal(store.recordAnswer(game), null);
  assert.equal(answer(game, reference.code), true);
  assert.equal(store.recordAnswer(game).streak, 1);
  assert.equal(answer(game, reference.code), null);
  assert.equal(store.recordAnswer(game), null);
  assert.equal(store.count, 1);
  nextQuestion(game);
  assert.equal(store.recordAnswer(game), null);
  const cleared = respond(store, true).game;
  assert.equal(store.recordAnswer(cleared), null);
  assert.equal(store.count, 0);
});

test("normal and mixed questions share progress; existing retries contribute", () => {
  const store = createMistakes(() => storage());
  const original = createGame("map", 3);
  while (!original.finished) {
    answer(original, REGIONS.find(item => item.code !== currentQuestion(original).code).code);
    store.recordAnswer(original);
    nextQuestion(original);
  }
  const retry = createRetryGame(original);
  const target = currentQuestion(retry);
  answer(retry, target.code);
  assert.equal(store.recordAnswer(retry).streak, 1);
  const mix = createGame("mix", 7);
  // A mix round uses the same canonical question identity as the original topic.
  const mapped = mix.questions.findIndex(item => item.topic === "map");
  mix.index = mapped;
  mix.questions[mapped] = { ...target, topic: "map", key: `map:${target.code}` };
  answer(mix, target.code);
  assert.equal(store.recordAnswer(mix).cleared, true);
  assert.equal(store.count, 2);
});

test("same-named lake/sight and map/seat questions stay separate", () => {
  const refs = [reference, { ...reference, topic: "seat" },
    { topic: "lake", code: "koenigssee" }, { topic: "sight", code: "koenigssee" }];
  const store = createMistakes(() => storage());
  for (const ref of refs) respond(store, false, ref);
  assert.equal(store.count, 4);
  respond(store, true, reference);
  respond(store, true, reference);
  assert.equal(store.count, 3);
  assert.equal(store.entries.find(entry => entry.topic === "seat").streak, 0);
});

test("selection handles empty/small/large pools, prioritizes zero streaks, and exposes copies", () => {
  const refs = Object.entries(MAP_TOPICS).flatMap(([topic, items]) => items.map(({ code }) => ({ topic, code, streak: 0 })));
  for (const count of [0, 1, 2, 10, 25]) {
    const store = createMistakes(() => storage(saved(refs.slice(0, count))));
    const selected = store.selectQuestions(() => 0.5);
    assert.equal(selected.length, Math.min(10, count));
    assert.equal(new Set(selected.map(entry => `${entry.topic}:${entry.code}`)).size, selected.length);
    if (count) {
      selected[0].streak = 1;
      store.entries[0].streak = 1;
      assert.equal(store.entries[0].streak, 0);
    }
  }
  const store = createMistakes(() => storage(saved(refs.slice(0, 22).map((entry, index) => ({ ...entry, streak: index < 11 ? 1 : 0 })))));
  assert.ok(store.selectQuestions(() => 0.5).every(entry => entry.streak === 0));
});

test("malformed, unsupported and invalid stored entries are discarded independently", () => {
  for (const initial of ["{", "null", saved(null), JSON.stringify({ version: 2, entries: [reference] })]) {
    assert.equal(createMistakes(() => storage(initial)).count, 0);
  }
  const initial = saved([null, {}, { ...reference, streak: 2 }, { ...reference, streak: "0" },
    { ...reference, topic: "toString", streak: 0 }, { ...reference, code: "unknown", streak: 0 },
    { ...reference, streak: 1, name: "ignored" }]);
  assert.deepEqual(createMistakes(() => storage(initial)).entries, [{ ...reference, streak: 1 }]);
});

test("storage access/read/write failures keep working in memory and preserve unrelated data", () => {
  assert.equal(createMistakes(() => ({ getItem() { throw Error("read"); } })).persistent, false);
  for (const provider of [() => { throw Error("access"); }, () => ({ getItem() { throw Error("read"); } }),
    () => ({ getItem: () => null, setItem() { throw Error("write"); } })]) {
    const store = createMistakes(provider);
    respond(store, false);
    assert.equal(store.persistent, false);
    respond(store, true);
    respond(store, true);
    assert.equal(store.count, 0);
  }
  const db = storage();
  db.setItem("bayernQuizHighscores", "untouched");
  db.setItem("bayernQuizLearnTopics", "untouched");
  respond(createMistakes(() => db), false);
  assert.equal(db.getItem("bayernQuizHighscores"), "untouched");
  assert.equal(db.getItem("bayernQuizLearnTopics"), "untouched");
});

test("correction rounds switch between all topics, validate answers, review and retry correctly", () => {
  const refs = [...Object.entries(MAP_TOPICS).map(([topic, items]) => ({ topic, code: items[0].code })),
    { topic: "seat", code: REGIONS[0].code }];
  const game = createCorrectionGame(refs, () => 0.5);
  assert.equal(game.isPractice, true);
  assert.equal(game.questions.length, 8);
  while (!game.finished) {
    const topic = questionTopic(game);
    const target = currentQuestion(game);
    const options = topic === "seat" ? makeSeatOptions(game) : MAP_TOPICS[topic];
    assert.equal(answer(game, "missing"), null);
    assert.equal(answer(game, options.find(item => item.code !== target.code).code), false);
    assert.equal(answer(game, target.code), null);
    nextQuestion(game);
  }
  const review = getMistakeReview(game);
  assert.equal(review.length, 8);
  const seatIndex = game.questions.findIndex(item => item.topic === "seat");
  assert.equal(review[seatIndex].correctAnswer, REGIONS[0].seat);
  const retry = createRetryGame(game);
  assert.equal(retry.mode, "correction");
  assert.equal(retry.questions.length, 8);
  while (!retry.finished) {
    if (questionTopic(retry) === "seat") makeSeatOptions(retry);
    answer(retry, currentQuestion(retry).code);
    nextQuestion(retry);
  }
  assert.equal(retry.score, 8);
  assert.equal(createHighscores(() => storage()).recordCompletedRound(retry), null);
});

test("correction construction rejects empty, duplicate, oversized and invalid selections", () => {
  for (const refs of [[], [reference, reference], Array(11).fill(reference), [{ topic: "missing", code: "missing" }]]) {
    assert.throws(() => createCorrectionGame(refs));
  }
});
