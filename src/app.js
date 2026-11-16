import { MAP_TOPICS, TOPIC_LABELS, questionTopic, REGIONS, RIVERS, MOUNTAINS, SIGHTS, CITIES, NATURE_RESERVES, LAKES, getAllowedQuestionCounts, answer, createCorrectionGame, createGame, createRetryGame, currentQuestion, getMistakeReview, makeSeatOptions, nextQuestion } from "./game.js";
import { createMapZoom } from "./map-zoom.js";
import { createHighscores, highscoreMessage } from "./highscores.js";
import { createMistakes } from "./mistakes.js";

const elements = {
  mistakeHelp: document.querySelector("#mistakeHelp"),
  mistakeStorage: document.querySelector("#mistakeStorage"),
  correctionProgress: document.querySelector("#correctionProgress"),
  correctionSummary: document.querySelector("#correctionSummary"),
  practiceSaved: document.querySelector("#practiceSaved"),

  lakeInfo: document.querySelector("#lakeInfo"),
  lakeInfoImage: document.querySelector("#lakeInfoImage"),
  lakeInfoName: document.querySelector("#lakeInfoName"),
  lakeInfoLocation: document.querySelector("#lakeInfoLocation"),
  lakeInfoFact: document.querySelector("#lakeInfoFact"),
  lakeInfoWikipedia: document.querySelector("#lakeInfoWikipedia"),
  lakeInfoArea: document.querySelector("#lakeInfoArea"),
  natureInfo: document.querySelector("#natureInfo"),
  natureInfoImage: document.querySelector("#natureInfoImage"),
  natureInfoName: document.querySelector("#natureInfoName"),
  natureInfoLocation: document.querySelector("#natureInfoLocation"),
  natureInfoFact: document.querySelector("#natureInfoFact"),
  natureInfoWikipedia: document.querySelector("#natureInfoWikipedia"),
  sightInfo: document.querySelector("#sightInfo"),
  sightInfoClose: document.querySelector("#sightInfoClose"),
  sightInfoImage: document.querySelector("#sightInfoImage"),
  sightInfoName: document.querySelector("#sightInfoName"),
  sightInfoLocation: document.querySelector("#sightInfoLocation"),
  sightInfoFact: document.querySelector("#sightInfoFact"),
  sightInfoWikipedia: document.querySelector("#sightInfoWikipedia"),
  modeCards: document.querySelector("#modeCards"),
  topicLaunch: document.querySelector("#topicLaunch"),
  launchTopic: document.querySelector("#launchTopic"),
  launchDetails: document.querySelector("#launchDetails"),
  launchTopicButton: document.querySelector("#launchTopicButton"),
  topicSwitcher: document.querySelector("#topicSwitcher"),
  currentTopic: document.querySelector("#currentTopic"),
  changeTopic: document.querySelector("#changeTopic"),
  topicDialog: document.querySelector("#topicDialog"),
  topicDialogContent: document.querySelector("#topicDialogContent"),
  closeTopics: document.querySelector("#closeTopics"),
  learnTopics: document.querySelector("#learnTopics"),
  count: document.querySelector("#count"),
  countLabel: document.querySelector("#countLabel"),
  autoNext: document.querySelector("#autoNext"),
  autoLabel: document.querySelector("#autoLabel"),
  question: document.querySelector("#question"),
  questionTopic: document.querySelector("#questionTopic"),
  progress: document.querySelector("#quizProgress"),
  progressLabel: document.querySelector("#progressLabel"),
  correctionActions: document.querySelector("#correctionActions"),
  options: document.querySelector("#options"),
  feedback: document.querySelector("#feedback"),
  mapHost: document.querySelector("#mapHost"),
  mapToast: document.querySelector("#mapToast"),
  riverInfo: document.querySelector("#riverInfo"),
  riverInfoName: document.querySelector("#riverInfoName"),
  riverInfoLength: document.querySelector("#riverInfoLength"),
  riverInfoWikipedia: document.querySelector("#riverInfoWikipedia"),
  mountainInfo: document.querySelector("#mountainInfo"),
  mountainInfoImage: document.querySelector("#mountainInfoImage"),
  mountainInfoName: document.querySelector("#mountainInfoName"),
  mountainInfoRegion: document.querySelector("#mountainInfoRegion"),
  mountainInfoPeak: document.querySelector("#mountainInfoPeak"),
  mountainInfoWikipedia: document.querySelector("#mountainInfoWikipedia"),
  settings: document.querySelector("#settings"),
  quizControls: document.querySelector("#quizControls"),
  mapToastContent: document.querySelector("#mapToastContent"),
  start: document.querySelector("#start"),
  next: document.querySelector("#next"),
  restart: document.querySelector("#restart"),
  result: document.querySelector("#result"),
  resultTitle: document.querySelector("#resultTitle"),
  practiceLabel: document.querySelector("#practiceLabel"),
  reviewTitle: document.querySelector("#reviewTitle"),
  mistakeReview: document.querySelector("#mistakeReview"),
  reviewSuccess: document.querySelector("#reviewSuccess"),
  retryMistakes: document.querySelector("#retryMistakes"),
  newRound: document.querySelector("#newRound"),
  finalScore: document.querySelector("#finalScore"),
  finalTotal: document.querySelector("#finalTotal"),
  stats: document.querySelector("#stats"),
  round: document.querySelector("#round"),
  totalRounds: document.querySelector("#totalRounds"),
  score: document.querySelector("#score"),
  highscores: document.querySelector("#highscores"),
  personalBest: document.querySelector("#personalBest"),
  highscoreStorage: document.querySelector("#highscoreStorage"),
  highscoreResult: document.querySelector("#highscoreResult"),
  resetRecords: document.querySelector("#resetRecords"),
  resetRecordsHint: document.querySelector("#resetRecordsHint"),
  resetRecordsStatus: document.querySelector("#resetRecordsStatus"),
  resetRecordsDialog: document.querySelector("#resetRecordsDialog"),
  resetRecordsForm: document.querySelector("#resetRecordsForm"),
  resetSelectedRecord: document.querySelector("#resetSelectedRecord"),
  resetAllRecords: document.querySelector("#resetAllRecords"),
  resetSelectedLabel: document.querySelector("#resetSelectedLabel"),
  resetRecordsDescription: document.querySelector("#resetRecordsDescription"),
  resetRecordsError: document.querySelector("#resetRecordsError"),
  cancelResetRecords: document.querySelector("#cancelResetRecords"),
};

const highscores = createHighscores();
const mistakes = createMistakes();
const modeInputs = [...elements.modeCards.querySelectorAll('input[name="mode"]')];
let selectedMode = modeInputs.find((input) => input.checked).value;
let roundRecord = null;
let resetTarget = null;
let game = null;
let practiceSource = null;
let mapZoom = null;
let advanceTimer = null;
let mixCount = 10;
let otherCount = 7;

function activeTopic() {
  if (!["mix", "correction"].includes(selectedMode)) return selectedMode;
  return questionTopic(game, game ? currentQuestion(game) ?? game.questions.at(-1) : null) ?? "map";
}

function showTargetInfo(topic, target) {
  if (topic === "map") showMapToast(`${target.name} – Regierungssitz: ${target.seat}.`, "", target.name);
  else ({ river: showRiverInfo, mountain: showMountainInfo, sight: showSightInfo,
    city: showCityInfo, nature: showNatureInfo, lake: showLakeInfo })[topic]?.(target);
}

function targetElement(topic, code) {
  return elements.mapHost.querySelector(topic === "map" ? `#${code}` : `.${topic}[data-${topic}="${code}"]`);
}

function compareAnswer(selected) {
  if (!game?.answered || game.finished) return;
  const topic = activeTopic();
  const target = selected ? MAP_TOPICS[topic].find(item => item.code === game.selectedCode) : currentQuestion(game);
  showTargetInfo(topic, target);
  mapZoom?.reveal(targetElement(topic, target.code));
}

const learnTopics = Object.fromEntries(["regions", "rivers", "mountains", "sights", "cities", "nature", "lakes"].map((topic) => {
  const checkbox = elements.learnTopics.querySelector(`[data-learn-topic="${topic}"]`);
  try {
    const saved = JSON.parse(localStorage.getItem("bayernQuizLearnTopics"));
    if (typeof saved?.[topic] === "boolean") checkbox.checked = saved[topic];
  } catch { /* Keep the default selection. */ }
  return [topic, checkbox];
}));

function cancelAdvance() {
  window.clearTimeout(advanceTimer);
  advanceTimer = null;
}

function setFeedback(message, tone = "") {
  elements.feedback.textContent = message;
  elements.feedback.className = `feedback ${tone}`;
}

function revealQuestionMap() {
  // Let closing details and browser scroll adjustments settle before measuring.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (!game || game.finished || window.matchMedia("(min-width: 1100px)").matches) return;
    const questionBar = document.querySelector(".questionBar");
    const sticky = getComputedStyle(questionBar).position === "sticky";
    // Keep answer options visible for seat questions, and the prompt on short screens.
    const target = !sticky ? questionBar
      : activeTopic() === "seat" ? elements.quizControls : elements.mapHost.closest(".mapWrap");
    const top = (window.visualViewport?.offsetTop ?? 0)
      + (sticky ? questionBar.getBoundingClientRect().height : 0) + 12;
    const delta = target.getBoundingClientRect().top - top;
    if (Math.abs(delta) > 1) window.scrollTo({
      top: Math.max(0, window.scrollY + delta),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }));
}

function revealInfo(card) {
  requestAnimationFrame(() => {
    if (!card.getClientRects().length) return;
    if (!window.matchMedia("(min-width: 1100px)").matches) {
      const viewport = window.visualViewport;
      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight);
      const questionBar = document.querySelector(".questionBar");
      const stickyHeight = getComputedStyle(questionBar).position === "sticky"
        ? questionBar.getBoundingClientRect().height : 0;
      const top = viewportTop + stickyHeight + 12;
      const bottom = viewportBottom - 12;
      const detail = card.getBoundingClientRect();
      const delta = detail.height > bottom - top || detail.top < top
        ? detail.top - top : Math.max(0, detail.bottom - bottom);
      if (Math.abs(delta) > 1) window.scrollBy({
        top: delta,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
      return;
    }
    const sidebar = document.querySelector(".sidebar");
    const panel = sidebar.getBoundingClientRect();
    const detail = card.getBoundingClientRect();
    const questionBar = document.querySelector(".questionBar");
    const stickyHeight = getComputedStyle(questionBar).position === "sticky"
      ? questionBar.getBoundingClientRect().height + 12 : 0;
    const top = panel.top + stickyHeight;
    // Reveal details below the pinned question, leaving the map and page in place.
    if (detail.height > sidebar.clientHeight - stickyHeight || detail.top < top) sidebar.scrollTop += detail.top - top;
    else if (detail.bottom > panel.bottom) sidebar.scrollTop += detail.bottom - panel.bottom;
  });
}

const workspace = document.querySelector(".workspace");
function updateWorkspaceTop() {
  workspace.style.setProperty("--workspace-top", `${Math.max(16, workspace.getBoundingClientRect().top + window.scrollY)}px`);
}
const workspaceObserver = new ResizeObserver(updateWorkspaceTop);
workspaceObserver.observe(document.querySelector(".topbar"));
workspaceObserver.observe(elements.modeCards);
workspaceObserver.observe(elements.topicLaunch);
window.addEventListener("resize", updateWorkspaceTop);
updateWorkspaceTop();

function wikipediaUrl(title) {
  return `https://de.wikipedia.org/wiki/${encodeURIComponent((title ?? "").replace(/ /g, "_"))}`;
}

function showMapToast(message, tone = "", wikipediaTitle = "") {
  hideNatureInfo();
  hideLakeInfo();
  hideRiverInfo();
  hideMountainInfo();
  hideSightInfo();
  elements.mapToastContent.classList.remove("cityInfoContent");
  elements.mapToastContent.replaceChildren(document.createTextNode(message));
  if (wikipediaTitle) {
    const link = document.createElement("a");
    link.href = wikipediaUrl(wikipediaTitle);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Mehr auf Wikipedia ↗";
    elements.mapToastContent.append(document.createElement("br"), link);
  }
  elements.mapToast.className = `mapToast ${tone}`;
  revealInfo(elements.mapToast);
}

function hideMapToast() {
  elements.mapToast.classList.add("hidden");
}

function hideRiverInfo() {
  elements.riverInfo.classList.add("hidden");
}

function showRiverInfo(river) {
  hideNatureInfo();
  hideLakeInfo();
  hideMapToast();
  hideMountainInfo();
  hideSightInfo();
  elements.riverInfoName.textContent = river.name;
  elements.riverInfoLength.textContent = `Länge in Bayern: ca. ${Math.round(river.lengthKm).toLocaleString("de-DE")} km`;
  elements.riverInfoWikipedia.href = wikipediaUrl(river.wikipediaTitle ?? river.name);
  elements.riverInfo.classList.remove("hidden");
  revealInfo(elements.riverInfo);
}

function hideMountainInfo() {
  elements.mountainInfo.classList.add("hidden");
  elements.mountainInfoImage.removeAttribute("src");
  elements.mountainInfoImage.hidden = true;
}

function showMountainInfo(mountain) {
  hideNatureInfo();
  hideLakeInfo();
  hideMapToast();
  hideRiverInfo();
  hideSightInfo();
  elements.mountainInfoName.textContent = mountain.name;
  elements.mountainInfoRegion.textContent = `Lage: ${mountain.region}`;
  elements.mountainInfoPeak.textContent = `Markanter Gipfel: ${mountain.peak} – ca. ${mountain.peakMeters.toLocaleString("de-DE")} m`;
  elements.mountainInfoWikipedia.href = wikipediaUrl(mountain.wikipediaTitle ?? mountain.name);
  elements.mountainInfoImage.hidden = true;
  elements.mountainInfoImage.alt = `Foto: ${mountain.name}`;
  elements.mountainInfoImage.src = `assets/mountains/${mountain.code}.jpg`;
  elements.mountainInfo.classList.remove("hidden");
  revealInfo(elements.mountainInfo);
}

function hideSightInfo() {
  elements.sightInfo.classList.add("hidden");
  elements.sightInfoImage.removeAttribute("src");
}

function showSightInfo(sight) {
  hideNatureInfo();
  hideLakeInfo();
  hideMapToast();
  hideRiverInfo();
  hideMountainInfo();
  elements.sightInfoName.textContent = sight.name;
  const region = REGIONS.find((item) => item.code === sight.regionCode);
  elements.sightInfoLocation.textContent = `${sight.location} – ${region.name}`;
  elements.sightInfoFact.textContent = sight.fact;
  elements.sightInfoWikipedia.href = wikipediaUrl(sight.wikipediaTitle);
  elements.sightInfoImage.src = `assets/sights/${sight.code}.jpg`;
  elements.sightInfoImage.alt = `Foto: ${sight.name}`;
  elements.sightInfo.classList.remove("hidden");
  revealInfo(elements.sightInfo);
}

function hideNatureInfo() {
  elements.natureInfo.classList.add("hidden");
  elements.natureInfoImage.removeAttribute("src");
  elements.natureInfoImage.hidden = true;
}

function showNatureInfo(reserve) {
  hideLakeInfo();
  hideMapToast();
  hideRiverInfo();
  hideMountainInfo();
  hideSightInfo();
  const region = REGIONS.find((item) => item.code === reserve.regionCode);
  elements.natureInfoName.textContent = reserve.name;
  elements.natureInfoLocation.textContent = `${reserve.location} – ${region.name}`;
  elements.natureInfoFact.textContent = reserve.fact;
  elements.natureInfoWikipedia.href = wikipediaUrl(reserve.wikipediaTitle);
  elements.natureInfoImage.hidden = true;
  elements.natureInfoImage.alt = `Foto: ${reserve.name}`;
  elements.natureInfoImage.src = `assets/nature-reserves/${reserve.code}.jpg`;
  elements.natureInfo.classList.remove("hidden");
  revealInfo(elements.natureInfo);
}

function hideLakeInfo() {
  elements.lakeInfo.classList.add("hidden");
  elements.lakeInfoImage.removeAttribute("src");
  elements.lakeInfoImage.hidden = true;
}

function showLakeInfo(lake) {
  hideNatureInfo();
  hideMapToast();
  hideRiverInfo();
  hideMountainInfo();
  hideSightInfo();
  elements.lakeInfoName.textContent = lake.name;
  elements.lakeInfoLocation.textContent = `${lake.location} – ${lake.kind === "natürlich" ? "Natürlicher See" : lake.kind}`;
  elements.lakeInfoArea.textContent = `Fläche${lake.code === "bodensee" ? " des gesamten Sees" : ""}: ca. ${lake.areaKm2.toLocaleString("de-DE")} km²${lake.code === "bodensee" ? "; Karte: bayerischer Uferbereich" : ""}`;
  elements.lakeInfoFact.textContent = lake.fact;
  elements.lakeInfoWikipedia.href = wikipediaUrl(lake.wikipediaTitle);
  elements.lakeInfoImage.hidden = true;
  elements.lakeInfoImage.alt = `Foto: ${lake.name}`;
  elements.lakeInfoImage.src = `assets/lakes/${lake.code}.jpg`;
  elements.lakeInfo.classList.remove("hidden");
  revealInfo(elements.lakeInfo);
}

elements.sightInfoClose.addEventListener("click", () => {
  hideSightInfo();
  elements.mapHost.querySelector(".sight.learned, .sight.wrong, .sight.correct")?.focus();
});
document.querySelectorAll("[data-close-info]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.closeInfo === "mountainInfo") hideMountainInfo();
    else document.getElementById(button.dataset.closeInfo).classList.add("hidden");
    elements.mapHost.focus({ preventScroll: true });
  });
});

elements.mountainInfoImage.addEventListener("error", () => {
  elements.mountainInfoImage.hidden = true;
});
elements.mountainInfoImage.addEventListener("load", () => {
  if (!elements.mountainInfoImage.hasAttribute("src")) return;
  elements.mountainInfoImage.hidden = false;
  revealInfo(elements.mountainInfo);
});

elements.sightInfoImage.addEventListener("error", () => {
  elements.sightInfoImage.hidden = true;
});
elements.sightInfoImage.addEventListener("load", () => {
  elements.sightInfoImage.hidden = false;
  revealInfo(elements.sightInfo);
});

elements.natureInfoImage.addEventListener("error", () => {
  elements.natureInfoImage.hidden = true;
});
elements.natureInfoImage.addEventListener("load", () => {
  elements.natureInfoImage.hidden = false;
  revealInfo(elements.natureInfo);
});

elements.lakeInfoImage.addEventListener("error", () => {
  elements.lakeInfoImage.hidden = true;
});
elements.lakeInfoImage.addEventListener("load", () => {
  elements.lakeInfoImage.hidden = false;
  revealInfo(elements.lakeInfo);
});

function updateCountOptions() {
  const mode = selectedMode;
  for (const option of elements.count.options) {
    const allowed = getAllowedQuestionCounts(mode).includes(Number(option.value));
    option.hidden = !allowed;
    option.disabled = !allowed;
  }
  if (!["learn", "correction"].includes(mode) && elements.count.selectedOptions[0]?.disabled) elements.count.value = mode === "mix" ? "10" : "7";
}

function updateMapMode() {
  const topic = activeTopic();
  const isRiver = topic === "river";
  const isMountain = topic === "mountain";
  const isSight = topic === "sight";
  const isCity = topic === "city";
  const isLake = topic === "lake";
  const isNature = topic === "nature";
  const isMapQuiz = isRiver || isMountain || isSight || isCity || isNature || isLake;
  const svg = elements.mapHost.querySelector("#bayernMap");
  if (!svg) return;
  const learning = topic === "learn";
  const hideSeats = selectedMode === "mix" || (selectedMode === "correction" && topic !== "seat");
  const showRegions = !learning || learnTopics.regions.checked;
  const showRivers = isRiver || (learning && learnTopics.rivers.checked);
  const showMountains = isMountain || (learning && learnTopics.mountains.checked);
  const showSights = isSight || (learning && learnTopics.sights.checked);
  const showCities = isCity || (learning && learnTopics.cities.checked);
  const showNature = isNature || (learning && learnTopics.nature.checked);
  const showLakes = isLake || (learning && learnTopics.lakes.checked);
  svg.classList.toggle("lake-mode", isLake);
  svg.querySelector("#lakesLayer")?.classList.toggle("hidden", !showLakes);
  svg.querySelectorAll(".lake").forEach((node) => node.setAttribute("tabindex", showLakes ? "0" : "-1"));
  svg.classList.toggle("nature-mode", isNature);
  svg.querySelector("#natureReservesLayer")?.classList.toggle("hidden", !showNature);
  svg.querySelectorAll(".nature").forEach((node) => node.setAttribute("tabindex", showNature ? "0" : "-1"));
  svg.classList.toggle("city-mode", isCity);
  svg.querySelector("#citiesLayer")?.classList.toggle("hidden", !showCities);
  svg.querySelectorAll(".city").forEach((node) => node.setAttribute("tabindex", showCities ? "0" : "-1"));
  svg.classList.toggle("sight-mode", isSight);
  svg.querySelector("#sightsLayer")?.classList.toggle("hidden", !showSights);
  svg.querySelectorAll(".sight").forEach((node) => node.setAttribute("tabindex", showSights ? "0" : "-1"));
  svg.classList.toggle("river-mode", isRiver || (learning && showRivers));
  svg.classList.toggle("mountain-mode", isMountain || (learning && showMountains));
  svg.querySelector("#riversLayer")?.classList.toggle("hidden", !showRivers);
  svg.querySelector("#mountainsLayer")?.classList.toggle("hidden", !showMountains);
  svg.querySelector(".seat-locations")?.classList.toggle("hidden", isMapQuiz || hideSeats || showCities || (learning && !showRegions));
  svg.querySelectorAll(".region, .seat-dot").forEach((node) => {
    node.setAttribute("tabindex", isMapQuiz || (learning && !showRegions) || (node.classList.contains("seat-dot") && (showCities || hideSeats)) ? "-1" : "0");
  });
  svg.querySelectorAll(".river").forEach((node) => {
    node.setAttribute("tabindex", isRiver || (learning && showRivers) ? "0" : "-1");
  });
  svg.querySelectorAll(".mountain").forEach((node) => {
    node.setAttribute("tabindex", isMountain || (learning && showMountains) ? "0" : "-1");
  });
  elements.mapHost.setAttribute("aria-label", learning ? "Bayernkarte mit ausgewählten Lernthemen" : isLake ? "Bayernkarte mit Seen" : isNature ? "Bayernkarte mit Naturschutzgebieten" : isCity ? "Bayernkarte mit Städten" : isSight ? "Bayernkarte mit Sehenswürdigkeiten" : isRiver ? "Bayernkarte mit Flüssen" : isMountain ? "Bayernkarte mit Gebirgen" : "Bayernkarte mit Regierungsbezirken");
  elements.mapHost.parentElement.querySelector(".mapLegend")?.classList.toggle("hidden", isMapQuiz || hideSeats || showCities || (learning && !showRegions));
}

function nearestRouteAt(clientX, clientY, fallback, groupSelector, lineSelector) {
  const svg = elements.mapHost.querySelector("#bayernMap");
  const matrix = svg?.getScreenCTM();
  if (!matrix) return fallback;
  const point = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
  let nearest = fallback;
  let best = Infinity;
  for (const route of svg.querySelectorAll(groupSelector)) {
    const path = route.querySelector(lineSelector);
    const length = path.getTotalLength();
    const steps = Math.max(1, Math.ceil(length / 4));
    for (let step = 0; step <= steps; step += 1) {
      const sample = path.getPointAtLength((length * step) / steps);
      const squared = (sample.x - point.x) ** 2 + (sample.y - point.y) ** 2;
      if (squared < best) {
        best = squared;
        nearest = route;
      }
    }
  }
  return nearest;
}

function resetMap() {
  elements.mapHost.querySelectorAll(".region").forEach((path) => {
    path.classList.remove("correct", "wrong", "selected");
  });
  elements.mapHost.querySelectorAll(".river").forEach((river) => {
    river.classList.remove("correct", "wrong", "learned");
  });
  elements.mapHost.querySelectorAll(".sight, .city, .nature, .lake").forEach((node) => node.classList.remove("correct", "wrong", "learned"));
  elements.mapHost.querySelectorAll(".mountain").forEach((mountain) => {
    mountain.classList.remove("correct", "wrong", "learned");
  });
}

function highlight(code, className) {
  const path = elements.mapHost.querySelector(`#${code}`);
  path?.classList.add(className);
}

function highlightRiver(code, className) {
  elements.mapHost.querySelector(`.river[data-river="${code}"]`)?.classList.add(className);
}

function highlightMountain(code, className) {
  elements.mapHost.querySelector(`.mountain[data-mountain="${code}"]`)?.classList.add(className);
}

function renderOptions() {
  elements.options.replaceChildren();
  if (!game || activeTopic() !== "seat" || game.finished) {
    elements.options.classList.add("hidden");
    return;
  }
  if (!game.options.length) makeSeatOptions(game);
  const target = currentQuestion(game);
  for (const region of game.options) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option";
    button.dataset.code = region.code;
    button.textContent = region.seat;
    if (game.answered) {
      button.disabled = true;
      if (region.code === target.code) button.classList.add("correct");
      if (region.code === game.selectedCode && region.code !== target.code) button.classList.add("wrong");
    }
    elements.options.append(button);
  }
  elements.options.classList.remove("hidden");
}

function renderReview() {
  const mistakes = getMistakeReview(game);
  elements.resultTitle.textContent = game.isPractice ? "Übungsrunde beendet" : "Quiz beendet";
  elements.mistakeReview.replaceChildren();
  for (const mistake of mistakes) {
    const item = document.createElement("li");
    const question = document.createElement("strong");
    question.textContent = mistake.question;
    const selected = document.createElement("p");
    selected.textContent = `Deine Antwort: ${mistake.selectedAnswer}`;
    const correct = document.createElement("p");
    correct.className = "reviewCorrect";
    correct.textContent = `Richtige Antwort: ${mistake.correctAnswer}`;
    item.append(question, selected, correct);
    elements.mistakeReview.append(item);
  }
  elements.reviewTitle.classList.toggle("hidden", !mistakes.length);
  elements.mistakeReview.classList.toggle("hidden", !mistakes.length);
  elements.retryMistakes.classList.toggle("hidden", !mistakes.length || game.mode === "correction");
  elements.retryMistakes.textContent = `Fehler wiederholen (${mistakes.length})`;
  elements.reviewSuccess.classList.toggle("hidden", Boolean(mistakes.length));
  elements.reviewSuccess.textContent = game.mode === "correction" ? "In dieser Runde alles richtig!" : game.isPractice ? "Alle Fehler geschafft!" : "Alles richtig!";
}

function render() {
  const mode = activeTopic();
  const isLearn = mode === "learn";
  const isCorrection = selectedMode === "correction";
  elements.currentTopic.textContent = document.querySelector(`#mode-${selectedMode}-title`).textContent;
  updateCountOptions();
  elements.launchTopic.textContent = elements.currentTopic.textContent;
  elements.launchDetails.textContent = isCorrection ? `${mistakes.count} offene Fragen · Ohne Rekordwertung` : isLearn ? "Ohne Wertung" : `${elements.count.value} Fragen`;
  document.querySelector("#mode-correction-best").textContent = `${mistakes.count} offene Fragen`;
  elements.mistakeHelp.classList.toggle("hidden", !isCorrection);
  elements.mistakeStorage.textContent = mistakes.persistent
    ? "Fehler werden nur in diesem Browser gespeichert."
    : "Fehler und Korrekturen bleiben für diese Sitzung erhalten; dauerhaftes Speichern ist nicht verfügbar.";
  elements.launchTopicButton.disabled = isCorrection && !mistakes.count;
  elements.start.disabled = isCorrection && !mistakes.count;
  elements.newRound.disabled = isCorrection && !mistakes.count;
  elements.restart.disabled = isCorrection && !mistakes.count;
  elements.launchTopicButton.textContent = isCorrection ? "Fehler korrigieren" : isLearn ? "Karte erkunden" : "Quiz starten";
  elements.practiceSaved.classList.toggle("hidden", !mistakes.count);
  elements.practiceSaved.textContent = `${isCorrection ? "Weiter üben" : "Fehler korrigieren"} (${mistakes.count})`;
  elements.newRound.textContent = isCorrection ? "Neue Übungsrunde" : "Neue Runde";
  elements.correctionProgress.textContent = game?.answered ? game.correctionMessage ?? "" : "";
  elements.correctionSummary.textContent = isCorrection && game?.finished
    ? `${game.clearedCount ?? 0} Fragen korrigiert. ${mistakes.count ? `${mistakes.count} offene Fragen verbleiben.` : "Alle gespeicherten Fehler korrigiert!"}` : "";
  updateMapMode();
  for (const bestLabel of elements.modeCards.querySelectorAll("[data-mode-best]")) {
    const cardMode = bestLabel.dataset.modeBest;
    if (cardMode === "learn") continue;
    const requestedCount = cardMode === "mix" ? mixCount : Number(elements.count.value);
    const count = getAllowedQuestionCounts(cardMode).includes(requestedCount) ? requestedCount : 7;
    const best = highscores.getBest(cardMode, count);
    bestLabel.textContent = best === null
      ? `Dein Rekord: noch keiner · ${count} Fragen`
      : `Dein Rekord: ${best}/${count}`;
  }
  elements.highscores.classList.toggle("hidden", isLearn || isCorrection);
  const best = highscores.getBest(selectedMode, Number(elements.count.value));
  elements.personalBest.textContent = best === null ? "Dein Rekord: noch keiner" : `Dein Rekord: ${best}/${elements.count.value}`;
  elements.highscoreStorage.textContent = highscores.persistent
    ? "Rekorde werden nur in diesem Browser gespeichert."
    : "Rekorde bleiben für diese Sitzung erhalten; dauerhaftes Speichern ist nicht verfügbar.";
  const roundActive = Boolean(game && !game.finished);
  elements.resetRecords.disabled = roundActive || !highscores.hasRecords;
  elements.resetRecordsHint.classList.toggle("hidden", !roundActive);
  elements.countLabel.classList.toggle("hidden", isLearn || isCorrection);
  elements.learnTopics.classList.toggle("hidden", !isLearn);
  elements.autoLabel.classList.toggle("hidden", isLearn);
  elements.stats.classList.toggle("hidden", isLearn);
  elements.count.disabled = Boolean(game && !game.finished);
  elements.start.classList.toggle("hidden", isLearn || Boolean(game));
  elements.restart.classList.toggle("hidden", isLearn || !game || game.finished);
  elements.restart.textContent = game?.isPractice ? "Übung neu starten" : "Neustart";
  elements.practiceLabel.textContent = isCorrection ? "Fehler korrigieren · Übungsrunde – ohne Rekordwertung" : "Fehler üben · Übungsrunde – ohne Rekordwertung";
  elements.practiceLabel.classList.toggle("hidden", !game?.isPractice);
  elements.next.classList.toggle("hidden", !game || game.finished || !game.answered);
  elements.next.disabled = !game?.answered;
  elements.result.classList.toggle("hidden", !game?.finished);
  elements.totalRounds.textContent = String(game?.questions.length ?? (isCorrection ? Math.min(10, mistakes.count) : Number(elements.count.value)));
  elements.round.textContent = game ? String(Math.min(game.index + 1, game.questions.length)) : "–";
  const answered = game?.history.length ?? 0;
  const total = game?.questions.length ?? (isCorrection ? Math.min(10, mistakes.count) : Number(elements.count.value));
  elements.progress.max = total;
  elements.progress.value = answered;
  elements.progressLabel.textContent = `${answered} von ${total} Fragen beantwortet`;
  elements.progress.hidden = isLearn;
  elements.progressLabel.hidden = isLearn;
  elements.questionTopic.textContent = ["mix", "correction"].includes(selectedMode) && game && !game.finished ? TOPIC_LABELS[mode] : "";
  elements.correctionActions.classList.toggle("hidden", !game?.answered || game.finished || game.selectedCode === currentQuestion(game)?.code || mode === "seat");
  elements.next.textContent = game && game.index === game.questions.length - 1 ? "Ergebnis ansehen" : "Weiter";
  elements.score.textContent = String(game?.score ?? 0);
  resetMap();
  document.body.classList.toggle("quizActive", Boolean(game && !game.finished));
  elements.quizControls.classList.toggle("hidden", isLearn);

  if (isLearn) {
    elements.question.textContent = Object.values(learnTopics).some((checkbox) => checkbox.checked)
      ? "Wähle ein markiertes Thema auf der Karte." : "Wähle mindestens ein Thema aus.";
    elements.options.classList.add("hidden");
    return;
  }
  if (!game) {
    if (isCorrection) {
      elements.question.textContent = mistakes.count ? `${mistakes.count} offene Fragen aus deinen bisherigen Quizantworten.` : "Keine offenen Fehler. Spiele ein Quiz, um schwierige Fragen hier zu sammeln.";
      elements.options.classList.add("hidden");
      setFeedback(mistakes.count ? "Drücke Start, um deine Fehler zu korrigieren." : "");
      return;
    }
    if (selectedMode === "mix") {
      elements.question.textContent = "Sieben Kartenthemen, eine Runde: Finde Orte, Gewässer und Regionen in ganz Bayern.";
      elements.options.classList.add("hidden");
      setFeedback("Drücke Start für deinen Bayern-Mix.");
      return;
    }
    elements.question.textContent = mode === "lake"
      ? "Wähle einen See, um ein Foto und Informationen zu sehen, oder drücke Start."
      : mode === "nature"
      ? "Wähle ein Naturschutzgebiet, um mehr darüber zu erfahren, oder drücke Start."
      : mode === "city"
      ? "Wähle eine Stadt, um ihren Namen und Regierungsbezirk zu sehen, oder drücke Start."
      : mode === "sight"
      ? "Wähle eine Sehenswürdigkeit, um ein Foto und Informationen zu sehen, oder drücke Start."
      : mode === "mountain"
      ? "Wähle ein Gebirge auf der Karte, um seine Lage und einen markanten Gipfel zu sehen, oder drücke Start."
      : mode === "river"
      ? "Wähle einen Fluss auf der Karte, um seinen Namen und seine Länge zu sehen, oder drücke Start."
      : mode === "map" ? "Finde die Regierungsbezirke auf der Karte."
        : "Ordne jedem Regierungsbezirk seinen Regierungssitz zu.";
    elements.options.classList.add("hidden");
    setFeedback(mode === "lake" || mode === "nature" || mode === "city" || mode === "river" || mode === "mountain" || mode === "sight" ? "" : "Drücke Start, um das Quiz zu beginnen.");
    return;
  }
  if (game.finished) {
    elements.settings.open = true;
    elements.question.textContent = "Geschafft!";
    elements.finalScore.textContent = String(game.score);
    elements.finalTotal.textContent = String(game.questions.length);
    elements.highscoreResult.textContent = highscoreMessage(roundRecord);
    renderReview();
    elements.options.classList.add("hidden");
    setFeedback(mode === "lake" ? "Wähle einen See, um mehr zu erfahren, oder starte eine neue Runde." : mode === "nature" ? "Wähle ein Naturschutzgebiet, um mehr zu erfahren, oder starte eine neue Runde." : mode === "city" ? "Wähle eine Stadt, um mehr zu erfahren, oder starte eine neue Runde." : mode === "sight" ? "Wähle eine Sehenswürdigkeit, um mehr zu erfahren, oder starte eine neue Runde." : mode === "mountain" ? "Wähle ein Gebirge, um mehr darüber zu erfahren, oder starte eine neue Runde."
      : mode === "river" ? "Wähle einen Fluss, um seine Länge zu sehen, oder starte eine neue Runde."
        : "Wähle Neue Runde für eine neue Runde.");
    return;
  }

  const target = currentQuestion(game);
  const name = document.createElement("strong");
  name.className = "question__target";
  name.textContent = target.name;
  elements.question.replaceChildren(document.createTextNode(mode === "seat" ? "Wähle den Regierungssitz von:" : "Finde auf der Karte:"), name);
  if (mode === "seat") highlight(target.code, "selected");
  if (game.answered && mode === "map") {
    highlight(target.code, "correct");
    if (game.selectedCode !== target.code) highlight(game.selectedCode, "wrong");
  }
  if (game.answered && mode === "river") {
    highlightRiver(target.code, "correct");
    if (game.selectedCode !== target.code) highlightRiver(game.selectedCode, "wrong");
  }
  if (game.answered && mode === "mountain") {
    highlightMountain(target.code, "correct");
    if (game.selectedCode !== target.code) highlightMountain(game.selectedCode, "wrong");
  }
  if (game.answered && mode === "sight") {
    highlightSight(target.code, "correct");
    if (game.selectedCode !== target.code) highlightSight(game.selectedCode, "wrong");
  }
  if (game.answered && mode === "city") {
    highlightCity(target.code, "correct");
    if (game.selectedCode !== target.code) highlightCity(game.selectedCode, "wrong");
  }
  if (game.answered && mode === "nature") {
    highlightNature(target.code, "correct");
    if (game.selectedCode !== target.code) highlightNature(game.selectedCode, "wrong");
  }
  if (game.answered && mode === "lake") {
    highlightLake(target.code, "correct");
    if (game.selectedCode !== target.code) highlightLake(game.selectedCode, "wrong");
  }
  renderOptions();
}

function resetMode() {
  elements.resetRecordsStatus.textContent = "";
  hideNatureInfo();
  hideLakeInfo();
  mapZoom?.reset();
  cancelAdvance();
  hideMapToast();
  hideRiverInfo();
  hideMountainInfo();
  hideSightInfo();
  game = null;
  practiceSource = null;
  roundRecord = null;
  elements.result.classList.add("hidden");
  elements.settings.open = true;
  setFeedback("");
  render();
}

function compactTopicSelection() {
  if (elements.topicDialogContent.contains(elements.modeCards)) return;
  elements.topicDialogContent.append(elements.modeCards);
  elements.topicLaunch.classList.add("hidden");
  elements.topicSwitcher.classList.remove("hidden");
  updateWorkspaceTop();
}

function startGame(practiceGame = null) {
  elements.resetRecordsStatus.textContent = "";
  hideNatureInfo();
  hideLakeInfo();
  cancelAdvance();
  hideMapToast();
  hideRiverInfo();
  hideMountainInfo();
  hideSightInfo();
  if (selectedMode === "correction" && !mistakes.count) return;
  const candidate = selectedMode === "correction" ? createCorrectionGame(mistakes.selectQuestions())
    : practiceGame ?? createGame(selectedMode, Number(elements.count.value));
  const requiredTopics = [...new Set(candidate.questions.map(target => {
    const topic = questionTopic(candidate, target);
    return topic === "seat" ? "map" : topic;
  }))];
  if (requiredTopics.some(topic => elements.mapHost.querySelectorAll(topic === "map" ? ".region" : `.${topic}`).length !== MAP_TOPICS[topic].length)) {
    setFeedback("Die benötigten Kartenebenen konnten nicht geladen werden. Bitte lade die Seite neu.", "bad");
    return;
  }
  game = candidate;
  if (!practiceGame) practiceSource = null;
  roundRecord = null;
  compactTopicSelection();
  elements.settings.open = window.matchMedia("(min-width: 1100px)").matches;
  mapZoom?.reset();
  if (activeTopic() === "seat") makeSeatOptions(game);
  setFeedback(activeTopic() === "seat" ? "Wähle den richtigen Regierungssitz." : "Wähle die gesuchte Antwort auf der Karte.");
  render();
  elements.question.focus({ preventScroll: true });
  if (window.matchMedia("(min-width: 1100px)").matches) elements.question.scrollIntoView({ block: "nearest" });
  revealQuestionMap();
}

function advance() {
  hideNatureInfo();
  hideLakeInfo();
  cancelAdvance();
  hideMapToast();
  hideRiverInfo();
  hideMountainInfo();
  hideSightInfo();
  const previousTopic = activeTopic();
  if (!game || !nextQuestion(game)) return;
  if (!game.finished && ["mix", "correction"].includes(game.mode) && activeTopic() !== previousTopic) mapZoom?.reset();
  if (game.finished) roundRecord = game.isPractice ? null : highscores.recordCompletedRound(game);
  if (!game.finished && activeTopic() === "seat") makeSeatOptions(game);
  setFeedback(game.finished ? "" : activeTopic() === "seat" ? "Wähle den richtigen Regierungssitz." : "Wähle die gesuchte Antwort auf der Karte.");
  render();
  if (game.finished) elements.resultTitle.focus();
  else {
    elements.question.focus({ preventScroll: true });
    revealQuestionMap();
  }
}

function submit(code) {
  if (!game) return;
  const correct = answer(game, code);
  if (correct === null) return;
  const progress = mistakes.recordAnswer(game);
  game.correctionMessage = progress ? progress.cleared ? "Fehler korrigiert!"
    : correct ? "1 von 2 richtig" : "Noch einmal üben · 0 von 2 richtig" : "";
  if (progress?.cleared) game.clearedCount = (game.clearedCount ?? 0) + 1;
  const topic = activeTopic();
  const target = currentQuestion(game);
  const selected = (topic === "seat" ? game.options : MAP_TOPICS[topic]).find(item => item.code === code);
  setFeedback(correct ? "✓ Richtig!" : `Deine Antwort: ${topic === "seat" ? selected.seat : selected.name}. Richtige Antwort: ${topic === "seat" ? target.seat : target.name}.`, correct ? "good" : "bad");
  render();
  if (topic !== "seat") {
    showTargetInfo(topic, target);
    if (!correct) mapZoom?.reveal(targetElement(topic, target.code));
  }
  if (correct && elements.autoNext.checked) {
    advanceTimer = window.setTimeout(advance, ["sight", "nature", "lake"].includes(topic) ? 5000 : 1600);
  }
}

elements.correctionActions.addEventListener("click", event => {
  const button = event.target.closest("button[data-compare]");
  if (button) compareAnswer(button.dataset.compare === "selected");
});

function updateResetDescription() {
  elements.resetRecordsDescription.textContent = elements.resetAllRecords.checked
    ? "Alle Rekorde für alle Modi und Fragenanzahlen in diesem Browser werden gelöscht."
    : `Nur der Rekord für ${resetTarget.label} mit ${resetTarget.count} Fragen wird gelöscht. Andere Rekorde bleiben erhalten.`;
}

elements.resetRecords.addEventListener("click", () => {
  if ((game && !game.finished) || !highscores.hasRecords) return;
  resetTarget = { mode: selectedMode, count: Number(elements.count.value), label: document.querySelector(`#mode-${selectedMode}-title`).textContent };
  const hasSelectedRecord = highscores.getBest(resetTarget.mode, resetTarget.count) !== null;
  elements.resetSelectedLabel.textContent = `Diesen Rekord: ${resetTarget.label}, ${resetTarget.count} Fragen`;
  elements.resetSelectedRecord.disabled = !hasSelectedRecord;
  elements.resetSelectedRecord.checked = hasSelectedRecord;
  elements.resetAllRecords.checked = !hasSelectedRecord;
  elements.resetRecordsError.textContent = "";
  elements.resetRecordsStatus.textContent = "";
  updateResetDescription();
  elements.resetRecordsDialog.showModal();
  elements.cancelResetRecords.focus();
});
for (const input of [elements.resetSelectedRecord, elements.resetAllRecords]) {
  input.addEventListener("change", updateResetDescription);
}
elements.cancelResetRecords.addEventListener("click", () => elements.resetRecordsDialog.close());
elements.resetRecordsDialog.addEventListener("close", () => {
  // A queued close event may arrive after the dialog has already been reopened.
  if (elements.resetRecordsDialog.open) return;
  resetTarget = null;
  (elements.resetRecords.disabled ? elements.personalBest : elements.resetRecords).focus();
});
elements.resetRecordsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!resetTarget || !elements.resetRecordsDialog.open) return;
  const all = elements.resetAllRecords.checked;
  const success = all ? highscores.resetAll() : highscores.resetRecord(resetTarget.mode, resetTarget.count);
  if (!success) {
    elements.resetRecordsError.textContent = "Die Rekorde konnten nicht zurückgesetzt werden. Bitte versuche es erneut.";
    return;
  }
  if (game?.finished && (all || (game.mode === resetTarget.mode && game.questions.length === resetTarget.count))) roundRecord = null;
  render();
  elements.resetRecordsStatus.textContent = all ? "Alle Rekorde zurückgesetzt." : "Rekord zurückgesetzt.";
  elements.resetRecordsDialog.close();
});

elements.launchTopicButton.addEventListener("click", () => {
  if (selectedMode !== "learn") {
    startGame();
    return;
  }
  compactTopicSelection();
  elements.settings.open = window.matchMedia("(min-width: 1100px)").matches;
  elements.question.focus();
  elements.question.scrollIntoView({ block: "nearest" });
});

elements.changeTopic.addEventListener("click", () => {
  elements.topicDialog.showModal();
  modeInputs.find((input) => input.checked).focus();
});
elements.closeTopics.addEventListener("click", () => elements.topicDialog.close());
elements.topicDialog.addEventListener("close", () => {
  if (!elements.topicDialog.open) elements.changeTopic.focus({ preventScroll: true });
});

for (const input of modeInputs) {
  input.addEventListener("click", () => {
    if (elements.topicDialog.open && selectedMode === input.value) elements.topicDialog.close();
  });
  input.addEventListener("change", () => {
    if (!input.checked || selectedMode === input.value) return;
    if (selectedMode === "mix") mixCount = Number(elements.count.value);
    else if (selectedMode !== "correction") otherCount = Number(elements.count.value);
    selectedMode = input.value;
    elements.count.value = String(selectedMode === "mix" ? mixCount : otherCount);
    resetMode();
    if (elements.topicDialog.open) elements.topicDialog.close();
  });
}
for (const checkbox of Object.values(learnTopics)) checkbox.addEventListener("change", () => {
  hideNatureInfo();
  hideLakeInfo();
  try { localStorage.setItem("bayernQuizLearnTopics", JSON.stringify(Object.fromEntries(Object.entries(learnTopics).map(([topic, input]) => [topic, input.checked])))); } catch { /* In-memory selection remains active. */ }
  resetMap();
  hideMapToast();
  hideRiverInfo();
  hideMountainInfo();
  hideSightInfo();
  render();
});
elements.count.addEventListener("change", () => {
  if (selectedMode === "mix") mixCount = Number(elements.count.value);
  else otherCount = Number(elements.count.value);
  elements.resetRecordsStatus.textContent = "";
  if (!game || game.finished) render();
});
elements.start.addEventListener("click", () => startGame());
elements.newRound.addEventListener("click", () => startGame());
elements.restart.addEventListener("click", () => {
  startGame(selectedMode !== "correction" && game?.isPractice ? createRetryGame(practiceSource) : null);
});
elements.retryMistakes.addEventListener("click", () => {
  if (!game?.finished || !getMistakeReview(game).length) return;
  practiceSource = game;
  startGame(createRetryGame(practiceSource));
});
elements.practiceSaved.addEventListener("click", () => {
  if (!mistakes.count) return;
  if (selectedMode === "mix") mixCount = Number(elements.count.value);
  else if (selectedMode !== "correction") otherCount = Number(elements.count.value);
  modeInputs.find(input => input.value === "correction").checked = true;
  selectedMode = "correction";
  resetMode();
  startGame();
});
elements.next.addEventListener("click", advance);
elements.autoNext.addEventListener("change", () => {
  if (!elements.autoNext.checked) cancelAdvance();
});
function handleSeatOptionClick(event) {
  const button = event.target.closest("button[data-code]");
  if (button && activeTopic() === "seat") submit(button.dataset.code);
}
elements.options.addEventListener("click", handleSeatOptionClick);

function chooseRegion(path) {
  if (!path || activeTopic() === "lake" || activeTopic() === "nature" || activeTopic() === "river" || activeTopic() === "mountain" || activeTopic() === "sight" || activeTopic() === "city") return;
  if (activeTopic() === "learn" && !learnTopics.regions.checked) return;
  const region = REGIONS.find((item) => item.code === path.id);
  if (!region) return;
  if (activeTopic() === "learn" || !game || game.finished || game.answered) {
    if (!game || game.finished) { resetMap(); highlight(region.code, "selected"); }
    showMapToast(`${region.name} – Regierungssitz: ${region.seat}.`, "", region.wikipediaTitle ?? region.name);
  } else if (activeTopic() === "map") {
    submit(region.code);
  }
}

function chooseRiver(node) {
  if (activeTopic() !== "river" && !(activeTopic() === "learn" && learnTopics.rivers.checked)) return;
  const river = RIVERS.find((item) => item.code === node?.dataset.river);
  if (!river) return;
  if (!game || game.finished || game.answered) {
    if (!game || game.finished) {
      resetMap();
      highlightRiver(river.code, "learned");
    }
    showRiverInfo(river);
    return;
  }
  submit(river.code);
}

function chooseMountain(node) {
  if (activeTopic() !== "mountain" && !(activeTopic() === "learn" && learnTopics.mountains.checked)) return;
  const mountain = MOUNTAINS.find((item) => item.code === node?.dataset.mountain);
  if (!mountain) return;
  if (!game || game.finished || game.answered) {
    if (!game || game.finished) {
      resetMap();
      highlightMountain(mountain.code, "learned");
    }
    showMountainInfo(mountain);
    return;
  }
  submit(mountain.code);
}

function highlightSight(code, className) {
  elements.mapHost.querySelector(`.sight[data-sight="${code}"]`)?.classList.add(className);
}

function highlightNature(code, className) {
  elements.mapHost.querySelector(`.nature[data-nature="${code}"]`)?.classList.add(className);
}

function chooseNature(node) {
  if (activeTopic() !== "nature" && !(activeTopic() === "learn" && learnTopics.nature.checked)) return;
  const reserve = NATURE_RESERVES.find((item) => item.code === node?.dataset.nature);
  if (!reserve) return;
  if (!game || game.finished) {
    resetMap();
    highlightNature(reserve.code, "learned");
    showNatureInfo(reserve);
  } else if (game.answered) {
    showNatureInfo(reserve);
  } else {
    submit(reserve.code);
  }
}

function highlightLake(code, className) {
  elements.mapHost.querySelector(`.lake[data-lake="${code}"]`)?.classList.add(className);
}

function chooseLake(node) {
  if (activeTopic() !== "lake" && !(activeTopic() === "learn" && learnTopics.lakes.checked)) return;
  const lake = LAKES.find((item) => item.code === node?.dataset.lake);
  if (!lake) return;
  if (!game || game.finished) {
    resetMap();
    highlightLake(lake.code, "learned");
    showLakeInfo(lake);
  } else if (game.answered) {
    showLakeInfo(lake);
  } else {
    submit(lake.code);
  }
}

// Prefer the visible water surface when enlarged selection strokes overlap.
function lakeAt(event, fallback) {
  if (!event.detail) return fallback;
  const svg = elements.mapHost.querySelector("#bayernMap");
  const matrix = svg?.getScreenCTM();
  if (!matrix) return fallback;
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
  for (const lake of svg.querySelectorAll(".lake")) {
    if (lake.querySelector(".lake-shape").isPointInFill(point)) return lake;
  }
  return nearestRouteAt(event.clientX, event.clientY, fallback, ".lake", ".lake-shape");
}

function nearestMarkerAt(event, fallback, markerSelector, dotSelector) {
  // Keyboard and programmatic clicks already identify the intended marker.
  if (!event.detail) return fallback;
  const svg = elements.mapHost.querySelector("#bayernMap");
  const matrix = svg?.getScreenCTM();
  if (!matrix) return fallback;
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
  let nearest = fallback;
  let distance = Infinity;
  for (const marker of svg.querySelectorAll(markerSelector)) {
    const dot = marker.querySelector(dotSelector);
    const squared = (dot.cx.baseVal.value - point.x) ** 2 + (dot.cy.baseVal.value - point.y) ** 2;
    if (squared < distance) {
      distance = squared;
      nearest = marker;
    }
  }
  return nearest;
}

function highlightCity(code, className) {
  elements.mapHost.querySelector(`.city[data-city="${code}"]`)?.classList.add(className);
}

function showCityInfo(city) {
  const region = REGIONS.find((item) => item.code === city.regionCode);
  showMapToast(`${city.name} – Regierungsbezirk: ${region.name}.`, "", city.wikipediaTitle);
  const coat = document.createElement("img");
  coat.className = "cityCoat";
  coat.src = `assets/cities/${city.code}.png`;
  coat.alt = `Wappen von ${city.name}`;
  coat.width = 64;
  coat.height = 72;
  coat.addEventListener("error", () => coat.remove(), { once: true });
  coat.addEventListener("load", () => revealInfo(elements.mapToast), { once: true });
  const details = document.createElement("div");
  details.append(...elements.mapToastContent.childNodes);
  elements.mapToastContent.classList.add("cityInfoContent");
  elements.mapToastContent.replaceChildren(coat, details);
}

function chooseCity(node) {
  if (activeTopic() !== "city" && !(activeTopic() === "learn" && learnTopics.cities.checked)) return;
  const city = CITIES.find((item) => item.code === node?.dataset.city);
  if (!city) return;
  if (!game || game.finished) {
    resetMap();
    highlightCity(city.code, "learned");
    showCityInfo(city);
  } else if (game.answered) {
    showCityInfo(city);
  } else {
    submit(city.code);
  }
}

function chooseSight(node) {
  if (activeTopic() !== "sight" && !(activeTopic() === "learn" && learnTopics.sights.checked)) return;
  const sight = SIGHTS.find((item) => item.code === node?.dataset.sight);
  if (!sight) return;
  if (!game || game.finished) {
    resetMap();
    highlightSight(sight.code, "learned");
    showSightInfo(sight);
  } else if (game.answered) {
    showSightInfo(sight);
  } else {
    submit(sight.code);
  }
}

elements.mapHost.addEventListener("click", (event) => {
  const learning = activeTopic() === "learn";
  const lake = event.target.closest(".lake");
  if (lake) {
    chooseLake(lakeAt(event, lake));
    return;
  }
  const nature = event.target.closest(".nature");
  if (nature) {
    chooseNature(nearestMarkerAt(event, nature, ".nature", ".nature-dot"));
    return;
  }
  const sight = event.target.closest(".sight");
  if (sight) {
    chooseSight(nearestMarkerAt(event, sight, ".sight", ".sight-dot"));
    return;
  }
  const city = event.target.closest(".city");
  if (city) {
    chooseCity(nearestMarkerAt(event, city, ".city", ".city-dot"));
    return;
  }
  const mountain = event.target.closest(".mountain");
  if (mountain && (!learning || learnTopics.mountains.checked)) {
    chooseMountain(nearestRouteAt(event.clientX, event.clientY, mountain, ".mountain", ".mountain-line"));
    return;
  }
  const river = event.target.closest(".river");
  if (river && (!learning || learnTopics.rivers.checked)) {
    chooseRiver(nearestRouteAt(event.clientX, event.clientY, river, ".river", ".river-line"));
    return;
  }
  const path = event.target.closest(".region, .seat-dot");
  if (path?.classList.contains("seat-dot")) {
    chooseRegion(elements.mapHost.querySelector(`#${path.dataset.region}`));
    return;
  }
  if (path) chooseRegion(path);
});
elements.mapHost.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const learning = activeTopic() === "learn";
  const lake = event.target.closest(".lake");
  if (lake) {
    event.preventDefault();
    chooseLake(lake);
    return;
  }
  const nature = event.target.closest(".nature");
  if (nature) {
    event.preventDefault();
    chooseNature(nature);
    return;
  }
  const sight = event.target.closest(".sight");
  if (sight) {
    event.preventDefault();
    chooseSight(sight);
    return;
  }
  const city = event.target.closest(".city");
  if (city) {
    event.preventDefault();
    chooseCity(city);
    return;
  }
  const mountain = event.target.closest(".mountain");
  if (mountain && (!learning || learnTopics.mountains.checked)) {
    event.preventDefault();
    chooseMountain(mountain);
    return;
  }
  const river = event.target.closest(".river");
  if (river && (!learning || learnTopics.rivers.checked)) {
    event.preventDefault();
    chooseRiver(river);
    return;
  }
  const path = event.target.closest(".region, .seat-dot");
  if (!path) return;
  event.preventDefault();
  chooseRegion(path.classList.contains("seat-dot")
    ? elements.mapHost.querySelector(`#${path.dataset.region}`)
    : path);
});

async function loadMap() {
  try {
    const response = await fetch("regions.svg");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    elements.mapHost.innerHTML = await response.text();
    mapZoom?.destroy();
    mapZoom = createMapZoom({
      svg: elements.mapHost.querySelector("#bayernMap"),
      host: elements.mapHost,
      zoomIn: document.querySelector("#mapZoomIn"),
      zoomOut: document.querySelector("#mapZoomOut"),
      resetButton: document.querySelector("#mapZoomReset"),
      percentage: document.querySelector("#mapZoomPercentage"),
    });
    elements.mapHost.setAttribute("aria-busy", "false");
    updateMapMode();
  } catch {
    elements.mapHost.textContent = "Die Karte konnte nicht geladen werden.";
    elements.mapHost.setAttribute("aria-busy", "false");
  }
}

resetMode();
loadMap();
