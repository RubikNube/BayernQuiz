export const REGIONS = Object.freeze([
  { code: "oberbayern", name: "Oberbayern", seat: "München" },
  { code: "niederbayern", name: "Niederbayern", seat: "Landshut" },
  { code: "oberpfalz", name: "Oberpfalz", seat: "Regensburg" },
  { code: "oberfranken", name: "Oberfranken", seat: "Bayreuth" },
  { code: "mittelfranken", name: "Mittelfranken", seat: "Ansbach" },
  { code: "unterfranken", name: "Unterfranken", seat: "Würzburg" },
  { code: "schwaben", name: "Schwaben", seat: "Augsburg" },
]);

// Other Bavarian cities used as plausible answers in the government-seat quiz.
export const OTHER_CITIES = Object.freeze([
  { code: "ingolstadt", seat: "Ingolstadt", regionCode: "oberbayern" },
  { code: "rosenheim", seat: "Rosenheim", regionCode: "oberbayern" },
  { code: "passau", seat: "Passau", regionCode: "niederbayern" },
  { code: "straubing", seat: "Straubing", regionCode: "niederbayern" },
  { code: "amberg", seat: "Amberg", regionCode: "oberpfalz" },
  { code: "bamberg", seat: "Bamberg", regionCode: "oberfranken" },
  { code: "coburg", seat: "Coburg", regionCode: "oberfranken" },
  { code: "hof", seat: "Hof", regionCode: "oberfranken" },
  { code: "nuernberg", seat: "Nürnberg", regionCode: "mittelfranken" },
  { code: "fuerth", seat: "Fürth", regionCode: "mittelfranken" },
  { code: "erlangen", seat: "Erlangen", regionCode: "mittelfranken" },
  { code: "aschaffenburg", seat: "Aschaffenburg", regionCode: "unterfranken" },
  { code: "schweinfurt", seat: "Schweinfurt", regionCode: "unterfranken" },
  { code: "kempten", seat: "Kempten", regionCode: "schwaben" },
  { code: "memmingen", seat: "Memmingen", regionCode: "schwaben" },
  { code: "kaufbeuren", seat: "Kaufbeuren", regionCode: "schwaben" },
]);

export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createGame(mode, count, random = Math.random) {
  if (mode !== "map" && mode !== "seat") throw new Error("Unknown mode");
  if (![3, 5, 7].includes(count)) throw new Error("Invalid question count");
  return {
    mode,
    questions: shuffle(REGIONS, random).slice(0, count),
    index: 0,
    score: 0,
    answered: false,
    selectedCode: null,
    options: [],
    finished: false,
  };
}

export function currentQuestion(game) {
  return game.questions[game.index] ?? null;
}

export function makeSeatOptions(game, random = Math.random) {
  const target = currentQuestion(game);
  if (!target || game.mode !== "seat") return [];
  const otherSeat = shuffle(REGIONS.filter((region) => region.code !== target.code), random)[0];
  const localCity = shuffle(OTHER_CITIES.filter((city) => city.regionCode === target.code), random)[0];
  const otherCity = shuffle(OTHER_CITIES.filter((city) => city.regionCode !== target.code), random)[0];
  game.options = shuffle([target, otherSeat, localCity, otherCity], random);
  return game.options;
}

export function answer(game, selectedCode) {
  if (game.finished || game.answered) return null;
  const target = currentQuestion(game);
  if (!target) return null;
  const valid = game.mode === "seat"
    ? game.options.some((option) => option.code === selectedCode)
    : REGIONS.some((region) => region.code === selectedCode);
  if (!valid) return null;
  const correct = target.code === selectedCode;
  game.answered = true;
  game.selectedCode = selectedCode;
  if (correct) game.score += 1;
  return correct;
}

export function nextQuestion(game) {
  if (!game.answered || game.finished) return false;
  game.index += 1;
  game.answered = false;
  game.selectedCode = null;
  game.options = [];
  game.finished = game.index >= game.questions.length;
  return true;
}
