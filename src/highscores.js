import { getAllowedQuestionCounts } from "./game.js";

const STORAGE_KEY = "bayernQuizHighscores";

function validRecord(mode, count, score) {
  return getAllowedQuestionCounts(mode).includes(count)
    && Number.isInteger(score) && score >= 0 && score <= count;
}

// Resolve browser storage inside the try block: accessing localStorage can itself throw.
export function createHighscores(storageProvider = () => globalThis.localStorage) {
  const records = new Map();
  const completed = new WeakMap();
  let storage;
  let persistent = true;
  try {
    storage = storageProvider();
    const raw = storage.getItem(STORAGE_KEY);
    let saved;
    try { saved = JSON.parse(raw); } catch { /* Discard malformed data. */ }
    if (saved?.version === 1 && saved.records && typeof saved.records === "object" && !Array.isArray(saved.records)) {
      for (const [key, score] of Object.entries(saved.records)) {
        const [mode, countText] = key.split(":");
        const count = Number(countText);
        if (key === `${mode}:${count}` && validRecord(mode, count, score)) records.set(key, score);
      }
    }
  } catch {
    persistent = false;
  }
  const sessionOnly = !persistent;

  function resetTo(next) {
    // A failed persistent reset must leave both copies of the records intact.
    if (!sessionOnly) {
      try {
        if (next.size) storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, records: Object.fromEntries(next) }));
        else storage.removeItem(STORAGE_KEY);
      } catch {
        return false;
      }
      persistent = true;
    }
    records.clear();
    for (const [key, score] of next) records.set(key, score);
    return true;
  }

  return {
    get persistent() { return persistent; },
    get hasRecords() { return records.size > 0; },
    getBest(mode, count) { return records.get(`${mode}:${count}`) ?? null; },
    resetRecord(mode, count) {
      if (!getAllowedQuestionCounts(mode).includes(count)) return false;
      const next = new Map(records);
      if (!next.delete(`${mode}:${count}`)) return true;
      return resetTo(next);
    },
    resetAll() { return resetTo(new Map()); },
    recordCompletedRound(game) {
      if (!game || game.isPractice || game.finished !== true || !Array.isArray(game.questions)
        || !validRecord(game.mode, game.questions.length, game.score)) return null;
      if (completed.has(game)) return completed.get(game);

      const count = game.questions.length;
      const key = `${game.mode}:${count}`;
      const previous = records.get(key);
      const kind = previous === undefined ? "first" : game.score > previous ? "improved"
        : game.score === previous ? "tied" : "lower";
      const best = Math.max(previous ?? 0, game.score);
      const result = { kind, best, count };
      completed.set(game, result);
      if (kind === "first" || kind === "improved") {
        records.set(key, best);
        if (persistent) {
          try {
            storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, records: Object.fromEntries(records) }));
          } catch {
            persistent = false;
          }
        }
      }
      return result;
    },
  };
}

export function highscoreMessage(result) {
  if (!result) return "";
  const labels = { first: "Erster Rekord", improved: "Neuer Rekord", tied: "Rekord eingestellt", lower: "Dein Rekord" };
  return `${labels[result.kind]}: ${result.best}/${result.count}${result.kind === "lower" ? "." : "!"}`;
}
