import { REGIONS, RIVERS, MOUNTAINS, SIGHTS, answer, createGame, currentQuestion, makeSeatOptions, nextQuestion } from "./game.js";
import { createMapZoom } from "./map-zoom.js";

const elements = {
  sightInfo: document.querySelector("#sightInfo"),
  sightInfoClose: document.querySelector("#sightInfoClose"),
  sightInfoImage: document.querySelector("#sightInfoImage"),
  sightInfoName: document.querySelector("#sightInfoName"),
  sightInfoLocation: document.querySelector("#sightInfoLocation"),
  sightInfoFact: document.querySelector("#sightInfoFact"),
  sightInfoWikipedia: document.querySelector("#sightInfoWikipedia"),
  mode: document.querySelector("#mode"),
  learnTopics: document.querySelector("#learnTopics"),
  count: document.querySelector("#count"),
  countLabel: document.querySelector("#countLabel"),
  autoNext: document.querySelector("#autoNext"),
  autoLabel: document.querySelector("#autoLabel"),
  question: document.querySelector("#question"),
  options: document.querySelector("#options"),
  feedback: document.querySelector("#feedback"),
  mapHost: document.querySelector("#mapHost"),
  mapToast: document.querySelector("#mapToast"),
  riverInfo: document.querySelector("#riverInfo"),
  riverInfoName: document.querySelector("#riverInfoName"),
  riverInfoLength: document.querySelector("#riverInfoLength"),
  riverInfoWikipedia: document.querySelector("#riverInfoWikipedia"),
  mountainInfo: document.querySelector("#mountainInfo"),
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
  finalScore: document.querySelector("#finalScore"),
  finalTotal: document.querySelector("#finalTotal"),
  stats: document.querySelector("#stats"),
  round: document.querySelector("#round"),
  totalRounds: document.querySelector("#totalRounds"),
  score: document.querySelector("#score"),
};

let game = null;
let mapZoom = null;
let advanceTimer = null;
const learnTopics = Object.fromEntries(["regions", "rivers", "mountains", "sights"].map((topic) => {
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

function revealInfo(card) {
  requestAnimationFrame(() => {
    if (!window.matchMedia("(min-width: 1100px)").matches) return;
    const sidebar = document.querySelector(".sidebar");
    const panel = sidebar.getBoundingClientRect();
    const detail = card.getBoundingClientRect();
    // Scroll only the sidebar, leaving the map and the page in place.
    if (detail.height > sidebar.clientHeight) sidebar.scrollTop += detail.top - panel.top;
    else if (detail.bottom > panel.bottom) sidebar.scrollTop += detail.bottom - panel.bottom;
  });
}

const workspace = document.querySelector(".workspace");
function updateWorkspaceTop() {
  workspace.style.setProperty("--workspace-top", `${Math.max(16, workspace.getBoundingClientRect().top)}px`);
}
new ResizeObserver(updateWorkspaceTop).observe(document.querySelector(".topbar"));
window.addEventListener("resize", updateWorkspaceTop);
updateWorkspaceTop();

function wikipediaUrl(title) {
  return `https://de.wikipedia.org/wiki/${encodeURIComponent((title ?? "").replace(/ /g, "_"))}`;
}

function showMapToast(message, tone = "", wikipediaTitle = "") {
  hideRiverInfo();
  hideMountainInfo();
  hideSightInfo();
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
}

function showMountainInfo(mountain) {
  hideMapToast();
  hideRiverInfo();
  hideSightInfo();
  elements.mountainInfoName.textContent = mountain.name;
  elements.mountainInfoRegion.textContent = `Lage: ${mountain.region}`;
  elements.mountainInfoPeak.textContent = `Markanter Gipfel: ${mountain.peak} – ca. ${mountain.peakMeters.toLocaleString("de-DE")} m`;
  elements.mountainInfoWikipedia.href = wikipediaUrl(mountain.wikipediaTitle ?? mountain.name);
  elements.mountainInfo.classList.remove("hidden");
  revealInfo(elements.mountainInfo);
}

function hideSightInfo() {
  elements.sightInfo.classList.add("hidden");
  elements.sightInfoImage.removeAttribute("src");
}

function showSightInfo(sight) {
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

elements.sightInfoClose.addEventListener("click", () => {
  hideSightInfo();
  elements.mapHost.querySelector(".sight.learned, .sight.wrong, .sight.correct")?.focus();
});
document.querySelectorAll("[data-close-info]").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById(button.dataset.closeInfo).classList.add("hidden");
    elements.mapHost.focus({ preventScroll: true });
  });
});

elements.sightInfoImage.addEventListener("error", () => {
  elements.sightInfoImage.hidden = true;
});
elements.sightInfoImage.addEventListener("load", () => {
  elements.sightInfoImage.hidden = false;
});

function updateCountOptions() {
  const mode = elements.mode.value;
  for (const option of elements.count.options) {
    const allowed = Number(option.value) <= (mode === "sight" ? SIGHTS.length : mode === "river" ? RIVERS.length : mode === "mountain" ? MOUNTAINS.length : REGIONS.length);
    option.hidden = !allowed;
    option.disabled = !allowed;
  }
  if (elements.count.selectedOptions[0]?.disabled) elements.count.value = "7";
}

function updateMapMode() {
  const isRiver = elements.mode.value === "river";
  const isMountain = elements.mode.value === "mountain";
  const isSight = elements.mode.value === "sight";
  const isMapQuiz = isRiver || isMountain || isSight;
  const svg = elements.mapHost.querySelector("#bayernMap");
  if (!svg) return;
  const learning = elements.mode.value === "learn";
  const showRegions = !learning || learnTopics.regions.checked;
  const showRivers = isRiver || (learning && learnTopics.rivers.checked);
  const showMountains = isMountain || (learning && learnTopics.mountains.checked);
  const showSights = isSight || (learning && learnTopics.sights.checked);
  svg.classList.toggle("sight-mode", isSight);
  svg.querySelector("#sightsLayer")?.classList.toggle("hidden", !showSights);
  svg.querySelectorAll(".sight").forEach((node) => node.setAttribute("tabindex", showSights ? "0" : "-1"));
  svg.classList.toggle("river-mode", isRiver || (learning && showRivers));
  svg.classList.toggle("mountain-mode", isMountain || (learning && showMountains));
  svg.querySelector("#riversLayer")?.classList.toggle("hidden", !showRivers);
  svg.querySelector("#mountainsLayer")?.classList.toggle("hidden", !showMountains);
  svg.querySelector(".seat-locations")?.classList.toggle("hidden", isMapQuiz || (learning && !showRegions));
  svg.querySelectorAll(".region, .seat-dot").forEach((node) => {
    node.setAttribute("tabindex", isMapQuiz || (learning && !showRegions) ? "-1" : "0");
  });
  svg.querySelectorAll(".river").forEach((node) => {
    node.setAttribute("tabindex", isRiver || (learning && showRivers) ? "0" : "-1");
  });
  svg.querySelectorAll(".mountain").forEach((node) => {
    node.setAttribute("tabindex", isMountain || (learning && showMountains) ? "0" : "-1");
  });
  elements.mapHost.setAttribute("aria-label", isSight ? "Bayernkarte mit Sehenswürdigkeiten" : isRiver ? "Bayernkarte mit Flüssen" : isMountain ? "Bayernkarte mit Gebirgen" : "Bayernkarte mit Regierungsbezirken");
  elements.mapHost.parentElement.querySelector(".mapLegend")?.classList.toggle("hidden", isMapQuiz);
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
  elements.mapHost.querySelectorAll(".sight").forEach((node) => node.classList.remove("correct", "wrong", "learned"));
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
  if (!game || game.mode !== "seat" || game.finished) {
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

function render() {
  const mode = elements.mode.value;
  const isLearn = mode === "learn";
  updateCountOptions();
  updateMapMode();
  elements.countLabel.classList.toggle("hidden", isLearn);
  elements.learnTopics.classList.toggle("hidden", !isLearn);
  elements.autoLabel.classList.toggle("hidden", isLearn);
  elements.stats.classList.toggle("hidden", isLearn);
  elements.count.disabled = Boolean(game && !game.finished);
  elements.start.classList.toggle("hidden", isLearn || Boolean(game && !game.finished));
  elements.restart.classList.toggle("hidden", isLearn || !game || game.finished);
  elements.next.classList.toggle("hidden", !game || game.finished || !game.answered);
  elements.next.disabled = !game?.answered;
  elements.result.classList.toggle("hidden", !game?.finished);
  elements.totalRounds.textContent = String(game?.questions.length ?? Number(elements.count.value));
  elements.round.textContent = game && !game.finished ? String(game.index + 1) : "–";
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
    elements.question.textContent = mode === "sight"
      ? "Wähle eine Sehenswürdigkeit, um ein Foto und Informationen zu sehen, oder drücke Start."
      : mode === "mountain"
      ? "Wähle ein Gebirge auf der Karte, um seine Lage und einen markanten Gipfel zu sehen, oder drücke Start."
      : mode === "river"
      ? "Wähle einen Fluss auf der Karte, um seinen Namen und seine Länge zu sehen, oder drücke Start."
      : mode === "map" ? "Finde die Regierungsbezirke auf der Karte."
        : "Ordne jedem Regierungsbezirk seinen Regierungssitz zu.";
    elements.options.classList.add("hidden");
    setFeedback(mode === "river" || mode === "mountain" || mode === "sight" ? "" : "Drücke Start, um das Quiz zu beginnen.");
    return;
  }
  if (game.finished) {
    elements.settings.open = true;
    elements.question.textContent = "Geschafft!";
    elements.finalScore.textContent = String(game.score);
    elements.finalTotal.textContent = String(game.questions.length);
    elements.options.classList.add("hidden");
    setFeedback(mode === "sight" ? "Wähle eine Sehenswürdigkeit, um mehr zu erfahren, oder starte eine neue Runde." : mode === "mountain" ? "Wähle ein Gebirge, um mehr darüber zu erfahren, oder starte eine neue Runde."
      : mode === "river" ? "Wähle einen Fluss, um seine Länge zu sehen, oder starte eine neue Runde."
        : "Wähle Start für eine neue Runde.");
    return;
  }

  const target = currentQuestion(game);
  elements.question.textContent = (mode === "sight" || mode === "mountain")
    ? `Finde ${target.name} auf der Karte.`
    : mode === "river"
    ? `Wo fließt ${target.name}?`
    : mode === "map" ? `Wo liegt ${target.name}?`
      : `Wo ist der Sitz der Regierung von ${target.name}?`;
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
  renderOptions();
}

function resetMode() {
  mapZoom?.reset();
  cancelAdvance();
  hideMapToast();
  hideRiverInfo();
  hideMountainInfo();
  hideSightInfo();
  game = null;
  elements.result.classList.add("hidden");
  elements.settings.open = true;
  setFeedback("");
  render();
}

function startGame() {
  cancelAdvance();
  hideMapToast();
  hideRiverInfo();
  hideMountainInfo();
  hideSightInfo();
  if (elements.mode.value === "river" && elements.mapHost.querySelectorAll(".river").length !== RIVERS.length) {
    setFeedback("Die Flusskarte konnte nicht geladen werden.", "bad");
    return;
  }
  if (elements.mode.value === "mountain" && elements.mapHost.querySelectorAll(".mountain").length !== MOUNTAINS.length) {
    setFeedback("Die Gebirgskarte konnte nicht geladen werden.", "bad");
    return;
  }
  if (elements.mode.value === "sight" && elements.mapHost.querySelectorAll(".sight").length !== SIGHTS.length) {
    setFeedback("Die Sehenswürdigkeitenkarte konnte nicht geladen werden.", "bad");
    return;
  }
  game = createGame(elements.mode.value, Number(elements.count.value));
  elements.settings.open = window.matchMedia("(min-width: 1100px)").matches;
  mapZoom?.reset();
  if (game.mode === "seat") makeSeatOptions(game);
  setFeedback(game.mode === "sight" ? "Wähle die gesuchte Sehenswürdigkeit auf der Karte." : game.mode === "mountain" ? "Wähle das gesuchte Gebirge auf der Karte." : game.mode === "river" ? "Wähle den gesuchten Fluss auf der Karte." : game.mode === "map" ? "Wähle den gesuchten Bezirk auf der Karte." : "Wähle den richtigen Regierungssitz.");
  render();
}

function advance() {
  cancelAdvance();
  hideMapToast();
  hideRiverInfo();
  hideMountainInfo();
  hideSightInfo();
  if (!game || !nextQuestion(game)) return;
  if (!game.finished && game.mode === "seat") makeSeatOptions(game);
  setFeedback(game.finished ? "" : game.mode === "sight" ? "Wähle die gesuchte Sehenswürdigkeit auf der Karte." : game.mode === "mountain" ? "Wähle das gesuchte Gebirge auf der Karte." : game.mode === "river" ? "Wähle den gesuchten Fluss auf der Karte." : game.mode === "map" ? "Wähle den gesuchten Bezirk auf der Karte." : "Wähle den richtigen Regierungssitz.");
  render();
}

function submit(code) {
  if (!game) return;
  const correct = answer(game, code);
  if (correct === null) return;
  const target = currentQuestion(game);
  const selected = (game.mode === "sight" ? SIGHTS : game.mode === "river" ? RIVERS : game.mode === "mountain" ? MOUNTAINS : REGIONS).find((item) => item.code === code);
  if (correct) {
    setFeedback("Richtig!", "good");
  } else if (game.mode === "sight" || game.mode === "mountain" || game.mode === "river") {
    setFeedback(`Leider falsch: Das war ${selected.name}. ${target.name} ist grün markiert.`, "bad");
  } else if (game.mode === "map") {
    setFeedback(`Leider falsch: Das war ${selected.name}. ${target.name} ist grün markiert.`, "bad");
  } else {
    setFeedback(`Leider falsch. Der Regierungssitz von ${target.name} ist ${target.seat}.`, "bad");
  }
  render();
  if (game.mode === "sight") showSightInfo(selected);
  if (correct && elements.autoNext.checked) {
    advanceTimer = window.setTimeout(advance, game.mode === "sight" ? 5000 : 1600);
  }
}

elements.mode.addEventListener("change", resetMode);
for (const checkbox of Object.values(learnTopics)) checkbox.addEventListener("change", () => {
  try { localStorage.setItem("bayernQuizLearnTopics", JSON.stringify(Object.fromEntries(Object.entries(learnTopics).map(([topic, input]) => [topic, input.checked])))); } catch { /* In-memory selection remains active. */ }
  resetMap();
  hideMapToast();
  hideRiverInfo();
  hideMountainInfo();
  hideSightInfo();
  render();
});
elements.count.addEventListener("change", () => {
  if (!game || game.finished) render();
});
elements.start.addEventListener("click", startGame);
elements.restart.addEventListener("click", startGame);
elements.next.addEventListener("click", advance);
elements.autoNext.addEventListener("change", () => {
  if (!elements.autoNext.checked) cancelAdvance();
});
function handleSeatOptionClick(event) {
  const button = event.target.closest("button[data-code]");
  if (button && game?.mode === "seat") submit(button.dataset.code);
}
elements.options.addEventListener("click", handleSeatOptionClick);

function chooseRegion(path) {
  if (!path || elements.mode.value === "river" || elements.mode.value === "mountain" || elements.mode.value === "sight") return;
  if (elements.mode.value === "learn" && !learnTopics.regions.checked) return;
  const region = REGIONS.find((item) => item.code === path.id);
  if (!region) return;
  if (elements.mode.value === "learn") {
    resetMap();
    highlight(region.code, "selected");
    showMapToast(`${region.name} – Regierungssitz: ${region.seat}.`, "", region.wikipediaTitle ?? region.name);
  } else if (game?.mode === "map") {
    submit(region.code);
  }
}

function chooseRiver(node) {
  if (elements.mode.value !== "river" && !(elements.mode.value === "learn" && learnTopics.rivers.checked)) return;
  const river = RIVERS.find((item) => item.code === node?.dataset.river);
  if (!river) return;
  if (!game || game.finished) {
    resetMap();
    highlightRiver(river.code, "learned");
    showRiverInfo(river);
    return;
  }
  submit(river.code);
}

function chooseMountain(node) {
  if (elements.mode.value !== "mountain" && !(elements.mode.value === "learn" && learnTopics.mountains.checked)) return;
  const mountain = MOUNTAINS.find((item) => item.code === node?.dataset.mountain);
  if (!mountain) return;
  if (!game || game.finished) {
    resetMap();
    highlightMountain(mountain.code, "learned");
    showMountainInfo(mountain);
    return;
  }
  submit(mountain.code);
}

function highlightSight(code, className) {
  elements.mapHost.querySelector(`.sight[data-sight="${code}"]`)?.classList.add(className);
}

function nearestSightAt(event, fallback) {
  // Keyboard and programmatic clicks already identify the intended marker.
  if (!event.detail) return fallback;
  const svg = elements.mapHost.querySelector("#bayernMap");
  const matrix = svg?.getScreenCTM();
  if (!matrix) return fallback;
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
  let nearest = fallback;
  let distance = Infinity;
  for (const marker of svg.querySelectorAll(".sight")) {
    const dot = marker.querySelector(".sight-dot");
    const squared = (dot.cx.baseVal.value - point.x) ** 2 + (dot.cy.baseVal.value - point.y) ** 2;
    if (squared < distance) {
      distance = squared;
      nearest = marker;
    }
  }
  return nearest;
}

function chooseSight(node) {
  if (elements.mode.value !== "sight" && !(elements.mode.value === "learn" && learnTopics.sights.checked)) return;
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
  const learning = elements.mode.value === "learn";
  const sight = event.target.closest(".sight");
  if (sight) {
    chooseSight(nearestSightAt(event, sight));
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
  const learning = elements.mode.value === "learn";
  const sight = event.target.closest(".sight");
  if (sight) {
    event.preventDefault();
    chooseSight(sight);
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
