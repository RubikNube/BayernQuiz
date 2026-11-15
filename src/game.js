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

// Curated sights: WGS84 marker coordinates and official information sources.
export const SIGHTS = Object.freeze([
  {
    "code": "linderhof",
    "name": "Schloss Linderhof",
    "regionCode": "oberbayern",
    "location": "Ettal",
    "fact": "Das Schloss Ludwigs II. liegt in einem Park in den Ammergauer Alpen.",
    "wikipediaTitle": "Schloss Linderhof",
    "sourceUrl": "https://www.schlosslinderhof.de/",
    "lat": 47.57033,
    "lon": 10.95817611
  },
  {
    "code": "herrenchiemsee",
    "name": "Schloss Herrenchiemsee",
    "regionCode": "oberbayern",
    "location": "Herreninsel im Chiemsee",
    "fact": "Ludwig II. ließ das Neue Schloss nach dem Vorbild von Versailles errichten.",
    "wikipediaTitle": "Neues Schloss Herrenchiemsee",
    "sourceUrl": "https://www.herrenchiemsee.de/deutsch/n_schloss/index.htm",
    "lat": 47.86020833,
    "lon": 12.40031111
  },
  {
    "code": "koenigssee",
    "name": "Königssee",
    "regionCode": "oberbayern",
    "location": "Schönau am Königssee",
    "fact": "Der See liegt zwischen steilen Bergen. Der Kartenpunkt zeigt die Wallfahrtskirche St. Bartholomä am Westufer.",
    "wikipediaTitle": "Königssee",
    "sourceUrl": "https://www.berchtesgaden.de/koenigssee",
    "lat": 47.54424,
    "lon": 12.9721
  },
  {
    "code": "zugspitze",
    "name": "Zugspitze",
    "regionCode": "oberbayern",
    "location": "Bei Garmisch-Partenkirchen",
    "fact": "Deutschlands höchster Berg liegt an der Grenze zu Österreich. Der Punkt markiert den Gipfel.",
    "wikipediaTitle": "Zugspitze",
    "sourceUrl": "https://zugspitze.de/de/Unsere-Bergwelten/Die-Gebiete/Zugspitze",
    "lat": 47.42122,
    "lon": 10.9863
  },
  {
    "code": "befreiungshalle",
    "name": "Befreiungshalle",
    "regionCode": "niederbayern",
    "location": "Kelheim",
    "fact": "Der Rundbau auf dem Michelsberg erinnert an die Befreiungskriege gegen Napoleon.",
    "wikipediaTitle": "Befreiungshalle",
    "sourceUrl": "https://www.schloesser.bayern.de/deutsch/schloss/objekte/kelheim.htm",
    "lat": 48.91833333,
    "lon": 11.86055556
  },
  {
    "code": "weltenburg",
    "name": "Kloster Weltenburg",
    "regionCode": "niederbayern",
    "location": "Bei Kelheim",
    "fact": "Das Benediktinerkloster liegt an einer Donauschleife beim Donaudurchbruch.",
    "wikipediaTitle": "Kloster Weltenburg",
    "sourceUrl": "https://www.kloster-weltenburg.de/",
    "lat": 48.89922222,
    "lon": 11.82038889
  },
  {
    "code": "veste-oberhaus",
    "name": "Veste Oberhaus",
    "regionCode": "niederbayern",
    "location": "Passau",
    "fact": "Die Burganlage über der Donau war eine Festung der Passauer Fürstbischöfe.",
    "wikipediaTitle": "Veste Oberhaus",
    "sourceUrl": "https://tourismus.passau.de/passau-sehen-erleben/baugestalten/die-14-objekte/veste-oberhaus/",
    "lat": 48.5775,
    "lon": 13.47027778
  },
  {
    "code": "walhalla",
    "name": "Walhalla",
    "regionCode": "oberpfalz",
    "location": "Donaustauf",
    "fact": "Der tempelartige Bau über der Donau beherbergt Büsten und Gedenktafeln bedeutender Persönlichkeiten.",
    "wikipediaTitle": "Walhalla",
    "sourceUrl": "https://www.schloesser.bayern.de/deutsch/schloss/objekte/walhalla.htm",
    "lat": 49.03148611,
    "lon": 12.22408889
  },
  {
    "code": "steinerne-bruecke",
    "name": "Steinerne Brücke",
    "regionCode": "oberpfalz",
    "location": "Regensburg",
    "fact": "Die mittelalterliche Steinbrücke führt über die Donau und verbindet die Altstadt mit Stadtamhof.",
    "wikipediaTitle": "Steinerne Brücke",
    "sourceUrl": "https://tourismus.regensburg.de/",
    "lat": 49.02269444,
    "lon": 12.09726667
  },
  {
    "code": "burg-falkenberg",
    "name": "Burg Falkenberg",
    "regionCode": "oberpfalz",
    "location": "Falkenberg in der Oberpfalz",
    "fact": "Die Burg thront auf einem markanten Granitfelsen über dem Ort an der Waldnaab.",
    "wikipediaTitle": "Burg Falkenberg",
    "sourceUrl": "https://www.burg-falkenberg.bayern/",
    "lat": 49.8593,
    "lon": 12.2249
  },
  {
    "code": "bamberger-dom",
    "name": "Bamberger Dom",
    "regionCode": "oberfranken",
    "location": "Bamberg",
    "fact": "Der Dom mit seinen vier Türmen ist unter anderem für den Bamberger Reiter bekannt.",
    "wikipediaTitle": "Bamberger Dom",
    "sourceUrl": "https://www.domberg-bamberg.de/highlights/dom-st-peter-und-st-georg/",
    "lat": 49.89083333,
    "lon": 10.8825
  },
  {
    "code": "opernhaus",
    "name": "Markgräfliches Opernhaus",
    "regionCode": "oberfranken",
    "location": "Bayreuth",
    "fact": "Das barocke Hoftheater ist für seinen reich geschmückten Zuschauerraum aus Holz bekannt.",
    "wikipediaTitle": "Markgräfliches Opernhaus",
    "sourceUrl": "https://www.bayreuth-wilhelmine.de/deutsch/opernh/index.htm",
    "lat": 49.94442222,
    "lon": 11.57847222
  },
  {
    "code": "veste-coburg",
    "name": "Veste Coburg",
    "regionCode": "oberfranken",
    "location": "Coburg",
    "fact": "Die große Burganlage über der Stadt wird auch Fränkische Krone genannt.",
    "wikipediaTitle": "Veste Coburg",
    "sourceUrl": "https://www.kunstsammlungen-coburg.de/",
    "lat": 50.26388889,
    "lon": 10.98138889
  },
  {
    "code": "kaiserburg",
    "name": "Nürnberger Kaiserburg",
    "regionCode": "mittelfranken",
    "location": "Nürnberg",
    "fact": "Die Kaiserburg auf dem Sandsteinfelsen prägt die Silhouette der Nürnberger Altstadt.",
    "wikipediaTitle": "Nürnberger Burg",
    "sourceUrl": "https://www.kaiserburg-nuernberg.de/deutsch/burg/index.htm",
    "lat": 49.45786667,
    "lon": 11.07592222
  },
  {
    "code": "ploenlein",
    "name": "Plönlein",
    "regionCode": "mittelfranken",
    "location": "Rothenburg ob der Tauber",
    "fact": "Das bekannte Altstadtmotiv zeigt ein Fachwerkhaus zwischen zwei Straßen mit Stadttoren.",
    "wikipediaTitle": "Plönlein",
    "sourceUrl": "https://www.rothenburg-tourismus.de/highlights/sehenswuerdigkeiten",
    "lat": 49.37378,
    "lon": 10.17956
  },
  {
    "code": "residenz-wuerzburg",
    "name": "Würzburger Residenz",
    "regionCode": "unterfranken",
    "location": "Würzburg",
    "fact": "Der barocke Fürstbischofspalast ist für sein Treppenhaus mit einem Deckenfresko von Tiepolo bekannt.",
    "wikipediaTitle": "Würzburger Residenz",
    "sourceUrl": "https://www.residenz-wuerzburg.de/deutsch/residenz/index.htm",
    "lat": 49.79265,
    "lon": 9.93862
  },
  {
    "code": "mespelbrunn",
    "name": "Schloss Mespelbrunn",
    "regionCode": "unterfranken",
    "location": "Mespelbrunn im Spessart",
    "fact": "Das Wasserschloss liegt in einem Seitental des Spessarts und ist von einem Teich umgeben.",
    "wikipediaTitle": "Schloss Mespelbrunn",
    "sourceUrl": "https://www.schloss-mespelbrunn.de/",
    "lat": 49.90541944,
    "lon": 9.30734444
  },
  {
    "code": "johannisburg",
    "name": "Schloss Johannisburg",
    "regionCode": "unterfranken",
    "location": "Aschaffenburg",
    "fact": "Das Schloss aus rotem Sandstein steht unmittelbar über dem Main.",
    "wikipediaTitle": "Schloss Johannisburg",
    "sourceUrl": "https://www.schloesser.bayern.de/deutsch/schloss/objekte/as_joh.htm",
    "lat": 49.97642,
    "lon": 9.14102
  },
  {
    "code": "neuschwanstein",
    "name": "Schloss Neuschwanstein",
    "regionCode": "schwaben",
    "location": "Schwangau bei Füssen",
    "fact": "Ludwig II. ließ das Schloss im Stil einer mittelalterlichen Ritterburg errichten.",
    "wikipediaTitle": "Schloss Neuschwanstein",
    "sourceUrl": "https://www.neuschwanstein.de/",
    "lat": 47.55758,
    "lon": 10.7498
  },
  {
    "code": "lindau",
    "name": "Lindauer Hafeneinfahrt",
    "regionCode": "schwaben",
    "location": "Lindau am Bodensee",
    "fact": "Bayerischer Löwe und Neuer Leuchtturm flankieren die Hafeneinfahrt. Der Punkt liegt zwischen beiden.",
    "wikipediaTitle": "Lindau (Bodensee)",
    "sourceUrl": "https://www.lindau.de/addresses/lindauer-hafeneinfahrt/",
    "lat": 47.54394,
    "lon": 9.68324
  }
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

// All 25 kreisfreie Städte: https://www.bayernportal.de/dokumente/behoerde/0154617984105
// WGS84 coordinates: GeoNames cities15000 extract (2026-11-15), CC BY 4.0.
// Government seats reuse scripts/seat-locations.json. See README for sources.
export const CITIES = Object.freeze([
  { code: "ingolstadt", name: "Ingolstadt", regionCode: "oberbayern", lat: 48.76508, lon: 11.42372, wikipediaTitle: "Ingolstadt", sourceUrl: "https://www.geonames.org/2895992/" },
  { code: "muenchen", name: "München", regionCode: "oberbayern", lat: 48.137433, lon: 11.575491, wikipediaTitle: "München" },
  { code: "rosenheim", name: "Rosenheim", regionCode: "oberbayern", lat: 47.85637, lon: 12.12247, wikipediaTitle: "Rosenheim", sourceUrl: "https://www.geonames.org/2844988/" },
  { code: "landshut", name: "Landshut", regionCode: "niederbayern", lat: 48.529612, lon: 12.161791, wikipediaTitle: "Landshut" },
  { code: "passau", name: "Passau", regionCode: "niederbayern", lat: 48.5665, lon: 13.43122, wikipediaTitle: "Passau", sourceUrl: "https://www.geonames.org/2855328/" },
  { code: "straubing", name: "Straubing", regionCode: "niederbayern", lat: 48.88126, lon: 12.57385, wikipediaTitle: "Straubing", sourceUrl: "https://www.geonames.org/2826099/" },
  { code: "amberg", name: "Amberg", regionCode: "oberpfalz", lat: 49.44287, lon: 11.86267, wikipediaTitle: "Amberg", sourceUrl: "https://www.geonames.org/2956656/" },
  { code: "regensburg", name: "Regensburg", regionCode: "oberpfalz", lat: 49.01513, lon: 12.10161, wikipediaTitle: "Regensburg" },
  { code: "weiden", name: "Weiden in der Oberpfalz", regionCode: "oberpfalz", lat: 49.67682, lon: 12.15613, wikipediaTitle: "Weiden in der Oberpfalz", sourceUrl: "https://www.geonames.org/2813040/" },
  { code: "bamberg", name: "Bamberg", regionCode: "oberfranken", lat: 49.89873, lon: 10.90067, wikipediaTitle: "Bamberg", sourceUrl: "https://www.geonames.org/2952984/" },
  { code: "bayreuth", name: "Bayreuth", regionCode: "oberfranken", lat: 49.947823, lon: 11.578935, wikipediaTitle: "Bayreuth" },
  { code: "coburg", name: "Coburg", regionCode: "oberfranken", lat: 50.25937, lon: 10.96384, wikipediaTitle: "Coburg", sourceUrl: "https://www.geonames.org/2939951/" },
  { code: "hof", name: "Hof", regionCode: "oberfranken", lat: 50.31297, lon: 11.91261, wikipediaTitle: "Hof (Saale)", sourceUrl: "https://www.geonames.org/2902768/" },
  { code: "ansbach", name: "Ansbach", regionCode: "mittelfranken", lat: 49.304808, lon: 10.593098, wikipediaTitle: "Ansbach" },
  { code: "erlangen", name: "Erlangen", regionCode: "mittelfranken", lat: 49.59099, lon: 11.00783, wikipediaTitle: "Erlangen", sourceUrl: "https://www.geonames.org/2929567/" },
  { code: "fuerth", name: "Fürth", regionCode: "mittelfranken", lat: 49.47593, lon: 10.98856, wikipediaTitle: "Fürth", sourceUrl: "https://www.geonames.org/2923544/" },
  { code: "nuernberg", name: "Nürnberg", regionCode: "mittelfranken", lat: 49.45421, lon: 11.07752, wikipediaTitle: "Nürnberg", sourceUrl: "https://www.geonames.org/2861650/" },
  { code: "schwabach", name: "Schwabach", regionCode: "mittelfranken", lat: 49.33047, lon: 11.02346, wikipediaTitle: "Schwabach", sourceUrl: "https://www.geonames.org/2835537/" },
  { code: "aschaffenburg", name: "Aschaffenburg", regionCode: "unterfranken", lat: 49.97704, lon: 9.15214, wikipediaTitle: "Aschaffenburg", sourceUrl: "https://www.geonames.org/2955272/" },
  { code: "schweinfurt", name: "Schweinfurt", regionCode: "unterfranken", lat: 50.04937, lon: 10.22175, wikipediaTitle: "Schweinfurt", sourceUrl: "https://www.geonames.org/2834498/" },
  { code: "wuerzburg", name: "Würzburg", regionCode: "unterfranken", lat: 49.793912, lon: 9.951214, wikipediaTitle: "Würzburg" },
  { code: "augsburg", name: "Augsburg", regionCode: "schwaben", lat: 48.371538, lon: 10.898514, wikipediaTitle: "Augsburg" },
  { code: "kaufbeuren", name: "Kaufbeuren", regionCode: "schwaben", lat: 47.88238, lon: 10.62192, wikipediaTitle: "Kaufbeuren", sourceUrl: "https://www.geonames.org/2892080/" },
  { code: "kempten", name: "Kempten (Allgäu)", regionCode: "schwaben", lat: 47.72674, lon: 10.31389, wikipediaTitle: "Kempten (Allgäu)", sourceUrl: "https://www.geonames.org/2891621/" },
  { code: "memmingen", name: "Memmingen", regionCode: "schwaben", lat: 47.98372, lon: 10.18527, wikipediaTitle: "Memmingen", sourceUrl: "https://www.geonames.org/2871992/" },
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
  if (!["map", "seat", "river", "mountain", "sight", "city"].includes(mode)) throw new Error("Unknown mode");
  const allowedCounts = mode === "city" ? [3, 5, 7, 10, 15, 20, 25] : mode === "river" ? [3, 5, 7, 10, 15, 20, 25, 30]
    : mode === "sight" ? [3, 5, 7, 10, 15, 20] : mode === "mountain" ? [3, 5, 7, 10, 15] : [3, 5, 7];
  if (!allowedCounts.includes(count)) {
    throw new Error("Invalid question count");
  }
  return {
    mode,
    questions: shuffle(mode === "city" ? CITIES : mode === "sight" ? SIGHTS : mode === "river" ? RIVERS : mode === "mountain" ? MOUNTAINS : REGIONS, random).slice(0, count),
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
    : (game.mode === "city" ? CITIES : game.mode === "sight" ? SIGHTS : game.mode === "river" ? RIVERS : game.mode === "mountain" ? MOUNTAINS : REGIONS).some((item) => item.code === selectedCode);
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
