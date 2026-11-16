import { currentQuestion, questionTopic, resolveQuestion, shuffle } from "./game.js";

const STORAGE_KEY = "bayernQuizMistakes";

export function createMistakes(storageProvider = () => globalThis.localStorage) {
  const entries = new Map();
  const recorded = new WeakMap();
  let storage;
  let persistent = true;
  try {
    storage = storageProvider();
    const raw = storage.getItem(STORAGE_KEY);
    let saved;
    try { saved = JSON.parse(raw); } catch { /* Ignore malformed data. */ }
    if (saved?.version === 1 && Array.isArray(saved.entries)) {
      for (const entry of saved.entries) {
        if (entry && typeof entry.topic === "string" && typeof entry.code === "string"
          && (entry.streak === 0 || entry.streak === 1) && resolveQuestion(entry.topic, entry.code)) {
          const { topic, code, streak } = entry;
          entries.set(`${topic}:${code}`, { topic, code, streak });
        }
      }
    }
  } catch { persistent = false; }

  function save() {
    if (!persistent) return;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, entries: [...entries.values()] }));
    } catch { persistent = false; }
  }

  return {
    get persistent() { return persistent; },
    get count() { return entries.size; },
    get entries() { return [...entries.values()].map(entry => ({ ...entry })); },
    selectQuestions(random = Math.random) {
      const values = [...entries.values()];
      return [...shuffle(values.filter(entry => entry.streak === 0), random),
        ...shuffle(values.filter(entry => entry.streak === 1), random)].slice(0, 10)
        .map(entry => ({ ...entry }));
    },
    recordAnswer(game) {
      if (!game?.answered || game.finished) return null;
      const target = currentQuestion(game);
      const topic = questionTopic(game, target);
      const history = game.history.at(-1);
      if (!target || !history || history.questionCode !== target.code || !resolveQuestion(topic, target.code)
        || recorded.get(game) === game.history.length) return null;
      recorded.set(game, game.history.length);
      const key = `${topic}:${target.code}`;
      const previous = entries.get(key);
      if (history.correct && !previous) return null;
      const streak = history.correct ? previous.streak + 1 : 0;
      if (streak === 2) entries.delete(key);
      else entries.set(key, { topic, code: target.code, streak });
      save();
      return { streak, cleared: streak === 2 };
    },
  };
}
