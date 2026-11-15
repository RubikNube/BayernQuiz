import test from "node:test";
import assert from "node:assert/strict";
import { answer, createGame, currentQuestion, makeSeatOptions, nextQuestion } from "../src/game.js";
import { createHighscores, highscoreMessage } from "../src/highscores.js";

function memoryStorage(initial = null) {
  let value = initial;
  let writes = 0;
  return {
    getItem(key) { assert.equal(key, "bayernQuizHighscores"); return value; },
    setItem(key, next) { assert.equal(key, "bayernQuizHighscores"); value = next; writes += 1; },
    removeItem(key) { assert.equal(key, "bayernQuizHighscores"); value = null; },
    get writes() { return writes; },
  };
}

function finish(mode = "map", count = 3, score = count) {
  const game = createGame(mode, count);
  while (!game.finished) {
    if (mode === "seat") makeSeatOptions(game);
    const correct = currentQuestion(game).code;
    const wrong = mode === "seat" ? game.options.find(x => x.code !== correct).code
      : createGame(mode, count).questions.find(x => x.code !== correct).code;
    answer(game, game.index < score ? correct : wrong);
    nextQuestion(game);
  }
  return game;
}

test("first scores (including zero), improvements, ties and lower scores retain the best", () => {
  const storage = memoryStorage();
  const scores = createHighscores(() => storage);
  assert.equal(scores.getBest("map", 3), null);
  const first = scores.recordCompletedRound(finish("map", 3, 0));
  assert.equal(highscoreMessage(first), "Erster Rekord: 0/3!");
  assert.equal(highscoreMessage(scores.recordCompletedRound(finish("map", 3, 2))), "Neuer Rekord: 2/3!");
  assert.equal(highscoreMessage(scores.recordCompletedRound(finish("map", 3, 2))), "Rekord eingestellt: 2/3!");
  assert.equal(highscoreMessage(scores.recordCompletedRound(finish("map", 3, 1))), "Dein Rekord: 2/3.");
  assert.equal(scores.getBest("map", 3), 2);
  assert.equal(storage.writes, 2);
});

test("every quiz mode and round length has an independent persistent record", () => {
  const storage = memoryStorage();
  const scores = createHighscores(() => storage);
  for (const mode of ["map", "seat", "river", "mountain", "sight", "city", "nature", "lake"]) {
    scores.recordCompletedRound(finish(mode, 3, 2));
    assert.equal(scores.getBest(mode, 7), null);
  }
  scores.recordCompletedRound(finish("map", 7, 5));
  const reloaded = createHighscores(() => storage);
  for (const mode of ["map", "seat", "river", "mountain", "sight", "city", "nature", "lake"]) {
    assert.equal(reloaded.getBest(mode, 3), 2);
  }
  assert.equal(reloaded.getBest("map", 7), 5);
  assert.equal(reloaded.getBest("seat", 7), null);
});

test("incomplete rounds save nothing and completion is recorded exactly once", () => {
  const storage = memoryStorage();
  const scores = createHighscores(() => storage);
  const game = createGame("map", 3);
  assert.equal(scores.recordCompletedRound(game), null);
  for (let i = 0; i < 3; i++) {
    answer(game, currentQuestion(game).code);
    assert.equal(scores.recordCompletedRound(game), null);
    nextQuestion(game);
  }
  const result = scores.recordCompletedRound(game);
  assert.equal(result.kind, "first");
  assert.equal(scores.recordCompletedRound(game), result);
  assert.equal(storage.writes, 1);
});

test("malformed data and unsupported versions start empty and can be replaced", () => {
  for (const raw of [null, "{", "null", "[]", '{"version":2,"records":{"map:3":3}}', '{"version":1,"records":[]}']) {
    const storage = memoryStorage(raw);
    const scores = createHighscores(() => storage);
    assert.equal(scores.getBest("map", 3), null);
    assert.equal(scores.persistent, true);
    scores.recordCompletedRound(finish());
    assert.equal(createHighscores(() => storage).getBest("map", 3), 3);
  }
});

test("invalid saved records are ignored without discarding valid records", () => {
  const storage = memoryStorage(JSON.stringify({ version: 1, records: {
    "map:3": 0, "seat:7": 6, "learn:3": 3, "unknown:3": 2, "map:20": 10,
    "lake:3": 4, "city:5": -1, "river:7": 1.5, "nature:3": "2",
    "mountain:03": 2, "sight:3:extra": 2,
  } }));
  const scores = createHighscores(() => storage);
  assert.equal(scores.getBest("map", 3), 0);
  assert.equal(scores.getBest("seat", 7), 6);
  for (const [mode, count] of [["learn", 3], ["unknown", 3], ["map", 20], ["lake", 3],
    ["city", 5], ["river", 7], ["nature", 3], ["mountain", 3], ["sight", 3]]) {
    assert.equal(scores.getBest(mode, count), null);
  }
});

test("storage access, read, and write failures preserve session records", () => {
  for (const provider of [
    () => { throw new Error("blocked access"); },
    () => ({ getItem() { throw new Error("blocked read"); } }),
    () => ({ getItem() { return null; }, setItem() { throw new Error("quota"); } }),
  ]) {
    const scores = createHighscores(provider);
    assert.equal(scores.recordCompletedRound(finish()).kind, "first");
    assert.equal(scores.getBest("map", 3), 3);
    assert.equal(scores.persistent, false);
    assert.equal(scores.recordCompletedRound(finish()).kind, "tied");
  }
});

test("invalid completions and learning mode are never stored", () => {
  const storage = memoryStorage();
  const scores = createHighscores(() => storage);
  for (const game of [null, { finished: true }, { ...finish(), mode: "learn" },
    { ...finish(), score: 4 }, { ...finish(), score: -1 }, { ...finish(), questions: [] }]) {
    assert.equal(scores.recordCompletedRound(game), null);
  }
  assert.equal(storage.writes, 0);
});

test("resetting one record preserves other modes and counts after reload", () => {
  const storage = memoryStorage();
  const scores = createHighscores(() => storage);
  assert.equal(scores.hasRecords, false);
  scores.recordCompletedRound(finish("map", 3, 0));
  scores.recordCompletedRound(finish("map", 7, 5));
  scores.recordCompletedRound(finish("seat", 3, 2));
  assert.equal(scores.hasRecords, true);
  assert.equal(scores.resetRecord("map", 3), true);
  assert.equal(scores.getBest("map", 3), null);
  const reloaded = createHighscores(() => storage);
  assert.equal(reloaded.getBest("map", 3), null);
  assert.equal(reloaded.getBest("map", 7), 5);
  assert.equal(reloaded.getBest("seat", 3), 2);
  assert.equal(scores.resetRecord("learn", 3), false);
  assert.equal(scores.resetRecord("map", 3), true);
});

test("resetting all or the last record removes only highscore storage", () => {
  const data = new Map([["bayernQuizLearnTopics", '{"cities":false}']]);
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
  const scores = createHighscores(() => storage);
  scores.recordCompletedRound(finish());
  scores.recordCompletedRound(finish("seat"));
  assert.equal(scores.resetAll(), true);
  assert.equal(scores.hasRecords, false);
  assert.equal(data.has("bayernQuizHighscores"), false);
  assert.equal(createHighscores(() => storage).hasRecords, false);
  assert.equal(data.get("bayernQuizLearnTopics"), '{"cities":false}');
  scores.recordCompletedRound(finish());
  assert.equal(scores.resetRecord("map", 3), true);
  assert.equal(data.has("bayernQuizHighscores"), false);
});

test("resetting cannot be undone by recording an old completed game again", () => {
  const storage = memoryStorage();
  const scores = createHighscores(() => storage);
  const game = finish();
  scores.recordCompletedRound(game);
  scores.resetAll();
  scores.recordCompletedRound(game);
  assert.equal(scores.hasRecords, false);
  assert.equal(storage.getItem("bayernQuizHighscores"), null);
  assert.equal(scores.recordCompletedRound(finish()).kind, "first");
});

test("failed writes and removals retain persistent and in-memory records, and can be retried", () => {
  for (const all of [false, true]) {
    const storage = memoryStorage();
    const scores = createHighscores(() => storage);
    scores.recordCompletedRound(finish());
    scores.recordCompletedRound(finish("seat"));
    const method = all ? "removeItem" : "setItem";
    const original = storage[method];
    storage[method] = () => { throw new Error("blocked reset"); };
    const reset = () => all ? scores.resetAll() : scores.resetRecord("map", 3);
    assert.equal(reset(), false);
    assert.equal(scores.getBest("map", 3), 3);
    assert.equal(scores.getBest("seat", 3), 3);
    assert.equal(createHighscores(() => storage).getBest("map", 3), 3);
    storage[method] = original;
    assert.equal(reset(), true);
    assert.equal(scores.getBest("map", 3), null);
  }
});

test("session-only records can be reset when storage was unavailable at startup", () => {
  for (const provider of [() => { throw new Error("blocked access"); }, () => ({ getItem() { throw new Error("blocked read"); } })]) {
    const scores = createHighscores(provider);
    scores.recordCompletedRound(finish());
    scores.recordCompletedRound(finish("seat"));
    assert.equal(scores.resetRecord("map", 3), true);
    assert.equal(scores.getBest("map", 3), null);
    assert.equal(scores.getBest("seat", 3), 3);
    assert.equal(scores.resetAll(), true);
    assert.equal(scores.hasRecords, false);
    assert.equal(scores.persistent, false);
  }
});

test("a previous save failure still requires a successful storage reset", () => {
  const storage = memoryStorage();
  const scores = createHighscores(() => storage);
  scores.recordCompletedRound(finish());
  storage.setItem = () => { throw new Error("quota"); };
  scores.recordCompletedRound(finish("seat"));
  assert.equal(scores.persistent, false);
  assert.equal(scores.resetRecord("map", 3), false);
  assert.equal(scores.getBest("map", 3), 3);
  assert.equal(scores.resetAll(), true);
  assert.equal(storage.getItem("bayernQuizHighscores"), null);
  assert.equal(scores.hasRecords, false);
});
