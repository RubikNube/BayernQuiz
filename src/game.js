export const REGIONS = Object.freeze([
  { code: "oberbayern", name: "Oberbayern", seat: "München" },
  { code: "niederbayern", name: "Niederbayern", seat: "Landshut" },
  { code: "oberpfalz", name: "Oberpfalz", seat: "Regensburg" },
  { code: "oberfranken", name: "Oberfranken", seat: "Bayreuth" },
  { code: "mittelfranken", name: "Mittelfranken", seat: "Ansbach" },
  { code: "unterfranken", name: "Unterfranken", seat: "Würzburg" },
  { code: "schwaben", name: "Schwaben", seat: "Augsburg" },
]);

// Bayerisches Landesamt für Umwelt: 30 längste Fließgewässer, Länge in Bayern (km), Stand 2016.
export const RIVERS = Object.freeze([
  { code: "main", name: "Main", lengthKm: 407.52 },
  { code: "donau", name: "Donau", lengthKm: 380.84 },
  { code: "isar", name: "Isar", lengthKm: 270.53 },
  { code: "inn", name: "Inn", lengthKm: 218.76 },
  { code: "altmuehl", name: "Altmühl", lengthKm: 196.19 },
  { code: "lech", name: "Lech", lengthKm: 166.46 },
  { code: "fraenkische-saale", name: "Fränkische Saale", lengthKm: 140.18 },
  { code: "iller", name: "Iller", lengthKm: 139.47 },
  { code: "wertach", name: "Wertach", lengthKm: 137.44 },
  { code: "paar", name: "Paar", lengthKm: 134.42 },
  { code: "woernitz", name: "Wörnitz", lengthKm: 131.81 },
  { code: "pegnitz", name: "Pegnitz", lengthKm: 113.46, wikipediaTitle: "Pegnitz (Fluss)" },
  { code: "regnitz", name: "Regnitz", lengthKm: 63.7 },
  { code: "rednitz", name: "Rednitz", lengthKm: 46.7 },
  { code: "rott", name: "Rott", lengthKm: 112.16 },
  { code: "regen", name: "Regen", lengthKm: 107.55 },
  { code: "amper", name: "Amper", lengthKm: 105.49 },
  { code: "loisach", name: "Loisach", lengthKm: 98.70 },
  { code: "naab", name: "Naab", lengthKm: 97.77 },
  { code: "zusam", name: "Zusam", lengthKm: 97.46 },
  { code: "schmutter", name: "Schmutter", lengthKm: 95.77 },
  { code: "grosse-laber", name: "Große Laber", lengthKm: 88.19 },
  { code: "vils-naab", name: "Vils (Naab)", lengthKm: 87.64 },
  { code: "schwarzach", name: "Schwarzach", lengthKm: 85.98 },
  { code: "aisch", name: "Aisch", lengthKm: 84.18 },
  { code: "ilm", name: "Ilm", lengthKm: 83.31 },
  { code: "vils-donau", name: "Vils (Donau)", lengthKm: 82.63 },
  { code: "isen", name: "Isen", lengthKm: 81.02 },
  { code: "mindel", name: "Mindel", lengthKm: 80.82 },
  { code: "fraenkische-rezat", name: "Fränkische Rezat", lengthKm: 78.84 },
  { code: "wiesent", name: "Wiesent", lengthKm: 78.48 },
  { code: "schwarze-laber", name: "Schwarze Laber", lengthKm: 77.87 },
]);

// Approximate elevations of notable summits in the Bavarian part of each range.
export const MOUNTAINS = Object.freeze([
  { code: "allgaeuer-alpen", name: "Allgäuer Alpen", region: "Südwestbayern", peak: "Hochfrottspitze", peakMeters: 2648 },
  { code: "ammergauer-alpen", name: "Ammergauer Alpen", region: "Südbayern zwischen Füssen und Garmisch-Partenkirchen", peak: "Kreuzspitze", peakMeters: 2185 },
  { code: "wettersteingebirge", name: "Wettersteingebirge", region: "Südbayern bei Garmisch-Partenkirchen", peak: "Zugspitze", peakMeters: 2962 },
  { code: "bayerische-voralpen", name: "Bayerische Voralpen", region: "Südbayern zwischen Isar und Inn", peak: "Benediktenwand", peakMeters: 1801 },
  { code: "chiemgauer-alpen", name: "Chiemgauer Alpen", region: "Südostbayern im Chiemgau", peak: "Sonntagshorn", peakMeters: 1961 },
  { code: "berchtesgadener-alpen", name: "Berchtesgadener Alpen", region: "Äußerster Südosten Bayerns", peak: "Watzmann", peakMeters: 2713 },
  { code: "rhoen", name: "Rhön", region: "Nordwestbayern", peak: "Kreuzberg", peakMeters: 928 },
  { code: "spessart", name: "Spessart", region: "Westliches Unterfranken", peak: "Geiersberg", peakMeters: 586 },
  { code: "steigerwald", name: "Steigerwald", region: "Zwischen Unterfranken, Mittelfranken und Oberfranken", peak: "Schwanberg", peakMeters: 475 },
  { code: "hassberge", name: "Haßberge", region: "Nördliches Unterfranken", peak: "Bramberg", peakMeters: 494 },
  { code: "frankenwald", name: "Frankenwald", region: "Nordostbayern", peak: "Döbraberg", peakMeters: 794 },
  { code: "fichtelgebirge", name: "Fichtelgebirge", region: "Nordostbayern bei Wunsiedel", peak: "Schneeberg", peakMeters: 1051 },
  { code: "fraenkische-alb", name: "Fränkische Alb", region: "Zwischen Oberfranken und der Donau", peak: "Poppberg", peakMeters: 652 },
  { code: "oberpfaelzer-wald", name: "Oberpfälzer Wald", region: "Ostbayern an der tschechischen Grenze", peak: "Entenbühl", peakMeters: 901 },
  { code: "bayerischer-wald", name: "Bayerischer Wald", region: "Ostbayern an der tschechischen Grenze", peak: "Großer Arber", peakMeters: 1456 },
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
  if (!["map", "seat", "river", "mountain"].includes(mode)) throw new Error("Unknown mode");
  const allowedCounts = mode === "river" ? [3, 5, 7, 10, 15, 20, 25, 30]
    : mode === "mountain" ? [3, 5, 7, 10, 15] : [3, 5, 7];
  if (!allowedCounts.includes(count)) {
    throw new Error("Invalid question count");
  }
  return {
    mode,
    questions: shuffle(mode === "river" ? RIVERS : mode === "mountain" ? MOUNTAINS : REGIONS, random).slice(0, count),
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
    : (game.mode === "river" ? RIVERS : game.mode === "mountain" ? MOUNTAINS : REGIONS).some((item) => item.code === selectedCode);
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
