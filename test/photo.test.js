import test from "node:test";
import assert from "node:assert/strict";
import { SIGHTS, MAP_TOPICS, createGame, createCorrectionGame, createRetryGame, makePhotoOptions,
  currentQuestion, questionTopic, resolveQuestion, questionText, getAllowedQuestionCounts,
  answer, nextQuestion, getMistakeReview } from "../src/game.js";
import { createMistakes } from "../src/mistakes.js";
import { createHighscores } from "../src/highscores.js";

function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}
function respond(game, correct = true) {
  if (questionTopic(game) === "photo") makePhotoOptions(game, () => .5);
  return answer(game, correct ? currentQuestion(game).code : game.options.find(x => x.code !== currentQuestion(game).code).code);
}

test("photo rounds have distinct targets and four stable valid options at every supported length", () => {
  assert.deepEqual(getAllowedQuestionCounts("photo"), [3, 5, 7, 10, 15, 20]);
  assert.equal(MAP_TOPICS.photo, undefined);
  for (const count of getAllowedQuestionCounts("photo")) {
    const game = createGame("photo", count, () => .5);
    assert.equal(new Set(game.questions.map(x => x.code)).size, count);
    while (!game.finished) {
      const target = currentQuestion(game);
      const options = makePhotoOptions(game, () => .5);
      assert.equal(options.length, 4);
      assert.equal(new Set(options.map(x => x.code)).size, 4);
      assert.ok(options.some(x => x.code === target.code));
      assert.ok(options.every(x => SIGHTS.includes(x)));
      assert.equal(makePhotoOptions(game, () => 0), options);
      assert.equal(answer(game, SIGHTS.find(x => !options.includes(x)).code), null);
      assert.equal(answer(game, "missing"), null);
      assert.equal(nextQuestion(game), false);
      assert.equal(answer(game, target.code), true);
      assert.equal(answer(game, target.code), null);
      nextQuestion(game);
      assert.deepEqual(game.options, []);
    }
    assert.equal(game.score, count);
    assert.equal(answer(game, SIGHTS[0].code), null);
  }
  for (const count of [0, 1, 4, 21, "10"]) assert.throws(() => createGame("photo", count));
  assert.equal(resolveQuestion("photo", SIGHTS[0].code), SIGHTS[0]);
  assert.equal(questionText("photo", SIGHTS[0]), "Welche Sehenswürdigkeit siehst du?");
});

test("photo reviews retain names and retries shrink to one question without records", () => {
  const db = storage();
  const records = createHighscores(() => db);
  const game = createGame("photo", 3, () => .5);
  respond(game, false); nextQuestion(game);
  respond(game); nextQuestion(game);
  respond(game, false); nextQuestion(game);
  assert.equal(getMistakeReview(game).length, 2);
  assert.match(getMistakeReview(game)[0].question, new RegExp(game.questions[0].name));
  records.recordCompletedRound(game);
  assert.equal(createHighscores(() => db).getBest("photo", 3), 1);
  assert.equal(records.getBest("sight", 3), null);
  const retry = createRetryGame(game);
  assert.equal(retry.mode, "photo");
  assert.equal(retry.questions.length, 2);
  respond(retry); nextQuestion(retry);
  respond(retry, false); nextQuestion(retry);
  assert.equal(records.recordCompletedRound(retry), null);
  const last = createRetryGame(retry);
  assert.equal(last.questions.length, 1);
  respond(last); nextQuestion(last);
  assert.deepEqual(getMistakeReview(last), []);
  assert.equal(records.getBest("photo", 3), 1);
});

test("saved photo mistakes coexist with map mistakes and clear after two correct answers", () => {
  const db = storage();
  let mistakes = createMistakes(() => db);
  const reference = { topic: "photo", code: SIGHTS[0].code };
  const game = createCorrectionGame([reference]);
  respond(game, false); mistakes.recordAnswer(game);
  const sightGame = createCorrectionGame([{ ...reference, topic: "sight" }]);
  answer(sightGame, SIGHTS[1].code); mistakes.recordAnswer(sightGame);
  mistakes = createMistakes(() => db);
  assert.equal(mistakes.count, 2);
  const mixed = createCorrectionGame(mistakes.selectQuestions());
  assert.deepEqual(new Set(mixed.questions.map(x => x.topic)), new Set(["sight", "photo"]));
  for (let round = 0; round < 2; round++) {
    const correction = createCorrectionGame([reference]);
    assert.equal(respond(correction), true);
    mistakes.recordAnswer(correction);
    mistakes.recordAnswer(correction); // Repeated recording cannot clear early.
    assert.equal(mistakes.count, round === 0 ? 2 : 1);
    mistakes = createMistakes(() => db);
  }
  assert.equal(mistakes.entries[0].topic, "sight");
});
