import test from "node:test";
import assert from "node:assert/strict";
import { MAP_TOPICS, LAKES, SIGHTS, createGame, currentQuestion, questionTopic,
  getAllowedQuestionCounts, answer, nextQuestion, getMistakeReview, createRetryGame } from "../src/game.js";
import { createHighscores } from "../src/highscores.js";

function finish(game, missed = []) {
  while (!game.finished) {
    const target = currentQuestion(game);
    const code = missed.includes(target.key)
      ? MAP_TOPICS[target.topic].find(item => item.code !== target.code).code : target.code;
    answer(game, code);
    nextQuestion(game);
  }
  return game;
}

test("mixed rounds are balanced, deterministic, and distinct at every supported length", () => {
  assert.deepEqual(getAllowedQuestionCounts("mix"), [7, 10, 15, 20]);
  for (const count of getAllowedQuestionCounts("mix")) {
    for (const random of [() => 0, () => 0.5, () => 0.999]) {
      const game = createGame("mix", count, random);
      assert.equal(game.questions.length, count);
      assert.deepEqual(game, createGame("mix", count, random));
      assert.equal(new Set(game.questions.map(item => item.key)).size, count);
      const counts = Object.keys(MAP_TOPICS).map(topic => game.questions.filter(item => item.topic === topic).length);
      assert.ok(Math.min(...counts) >= 1);
      assert.ok(Math.max(...counts) - Math.min(...counts) <= 1);
      for (const item of game.questions) {
        assert.equal(item.key, `${item.topic}:${item.code}`);
        assert.ok(MAP_TOPICS[item.topic].some(target => target.code === item.code));
      }
    }
  }
  for (const count of [0, 3, 5, 8, 25, "10", NaN]) assert.throws(() => createGame("mix", count), /Invalid question count/);
});

test("mixed questions accept only their active topic, score once, and finish after advancing", () => {
  const game = createGame("mix", 20);
  assert.equal(nextQuestion(game), false);
  while (!game.finished) {
    const target = currentQuestion(game);
    assert.equal(questionTopic(game), target.topic);
    const otherCode = Object.values(MAP_TOPICS).flat().find(item => !MAP_TOPICS[target.topic].some(x => x.code === item.code)).code;
    assert.equal(answer(game, otherCode), null);
    assert.equal(answer(game, target.code), true);
    assert.equal(answer(game, target.code), null);
    assert.equal(game.history.at(-1).questionKey, target.key);
    assert.equal(game.history.at(-1).topic, target.topic);
    assert.equal(game.finished, false);
    assert.equal(nextQuestion(game), true);
  }
  assert.equal(game.score, 20);
  assert.equal(game.history.length, 20);
  assert.equal(currentQuestion(game), null);
  assert.equal(answer(game, "chiemsee"), null);
  assert.equal(nextQuestion(game), false);
});

test("shared place identifiers remain distinct in reviews and shrinking practice rounds", () => {
  const game = createGame("mix", 7);
  game.questions = [
    { ...LAKES.find(item => item.code === "koenigssee"), topic: "lake", key: "lake:koenigssee" },
    { ...SIGHTS.find(item => item.code === "koenigssee"), topic: "sight", key: "sight:koenigssee" },
  ];
  finish(game, ["lake:koenigssee"]);
  assert.equal(getMistakeReview(game).length, 1);
  assert.equal(getMistakeReview(game)[0].correctAnswer, "Königssee");
  const original = structuredClone(game);
  const retry = createRetryGame(game);
  assert.deepEqual(retry.questions.map(item => item.key), ["lake:koenigssee"]);
  assert.equal(retry.isPractice, true);
  assert.equal(questionTopic(retry), "lake");
  finish(retry);
  assert.deepEqual(getMistakeReview(retry), []);
  assert.throws(() => createRetryGame(retry), /No mistakes/);
  assert.deepEqual(game, original);

  const bothWrong = finish({ ...createGame("mix", 7), questions: original.questions }, original.questions.map(item => item.key));
  const bothRetry = createRetryGame(bothWrong);
  assert.equal(bothRetry.questions.length, 2);
  finish(bothRetry, [bothRetry.questions[0].key]);
  assert.equal(createRetryGame(bothRetry).questions.length, 1);
});

test("mixed records persist separately by count; unfinished and practice rounds do not write", () => {
  let saved = JSON.stringify({ version: 1, records: { "map:7": 5 } });
  const storage = { getItem: () => saved, setItem: (_, value) => { saved = value; } };
  const scores = createHighscores(() => storage);
  const game = createGame("mix", 10);
  assert.equal(scores.recordCompletedRound(game), null);
  const failedKeys = game.questions.slice(0, 2).map(item => item.key);
  finish(game, failedKeys);
  assert.equal(scores.recordCompletedRound(game).best, 8);
  assert.equal(scores.getBest("mix", 7), null);
  const practice = finish(createRetryGame(game));
  const beforePractice = saved;
  assert.equal(scores.recordCompletedRound(practice), null);
  assert.equal(saved, beforePractice);
  const reloaded = createHighscores(() => storage);
  assert.equal(reloaded.getBest("mix", 10), 8);
  assert.equal(reloaded.getBest("map", 7), 5);
});
