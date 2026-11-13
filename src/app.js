import { REGIONS, RIVERS, answer, createGame, currentQuestion, makeSeatOptions, nextQuestion } from "./game.js";

const elements = {
  mode: document.querySelector("#mode"),
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
  quizBanner: document.querySelector("#quizBanner"),
  bannerQuestion: document.querySelector("#bannerQuestion"),
  bannerOptions: document.querySelector("#bannerOptions"),
  bannerFeedback: document.querySelector("#bannerFeedback"),
  bannerNext: document.querySelector("#bannerNext"),
  bannerRestart: document.querySelector("#bannerRestart"),
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
let advanceTimer = null;

function cancelAdvance() {
  window.clearTimeout(advanceTimer);
  advanceTimer = null;
}

function setFeedback(message, tone = "") {
  elements.feedback.textContent = message;
  elements.feedback.className = `feedback ${tone}`;
}

function showMapToast(message, tone = "") {
  elements.mapToast.textContent = message;
  elements.mapToast.className = `mapToast ${tone}`;
}

function hideMapToast() {
  elements.mapToast.classList.add("hidden");
}

function hideRiverInfo() {
  elements.riverInfo.classList.add("hidden");
}

function showRiverInfo(river) {
  elements.riverInfoName.textContent = river.name;
  elements.riverInfoLength.textContent = `Länge in Bayern: ca. ${Math.round(river.lengthKm).toLocaleString("de-DE")} km`;
  elements.riverInfo.classList.remove("hidden");
}

function updateCountOptions() {
  const isRiver = elements.mode.value === "river";
  for (const option of elements.count.querySelectorAll("[data-river-count]")) {
    option.hidden = !isRiver;
    option.disabled = !isRiver;
  }
  if (!isRiver && Number(elements.count.value) > 7) elements.count.value = "7";
}

function updateMapMode() {
  const isRiver = elements.mode.value === "river";
  const svg = elements.mapHost.querySelector("#bayernMap");
  if (!svg) return;
  svg.classList.toggle("river-mode", isRiver);
  svg.querySelector("#riversLayer")?.classList.toggle("hidden", !isRiver);
  svg.querySelector(".seat-locations")?.classList.toggle("hidden", isRiver);
  svg.querySelectorAll(".region, .seat-dot").forEach((node) => {
    node.setAttribute("tabindex", isRiver ? "-1" : "0");
  });
  svg.querySelectorAll(".river").forEach((node) => {
    node.setAttribute("tabindex", isRiver ? "0" : "-1");
  });
  elements.mapHost.setAttribute("aria-label", isRiver ? "Bayernkarte mit Flüssen" : "Bayernkarte mit Regierungsbezirken");
  elements.mapHost.parentElement.querySelector(".mapLegend")?.classList.toggle("hidden", isRiver);
}

function nearestRiverAt(clientX, clientY, fallback) {
  const svg = elements.mapHost.querySelector("#bayernMap");
  const matrix = svg?.getScreenCTM();
  if (!matrix) return fallback;
  const point = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
  let nearest = fallback;
  let best = Infinity;
  for (const river of svg.querySelectorAll(".river")) {
    const path = river.querySelector(".river-line");
    const length = path.getTotalLength();
    for (let distance = 0; distance <= length; distance += 4) {
      const sample = path.getPointAtLength(distance);
      const squared = (sample.x - point.x) ** 2 + (sample.y - point.y) ** 2;
      if (squared < best) {
        best = squared;
        nearest = river;
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
}

function highlight(code, className) {
  const path = elements.mapHost.querySelector(`#${code}`);
  path?.classList.add(className);
}

function highlightRiver(code, className) {
  elements.mapHost.querySelector(`.river[data-river="${code}"]`)?.classList.add(className);
}

function renderOptions() {
  elements.options.replaceChildren();
  elements.bannerOptions.replaceChildren();
  if (!game || game.mode !== "seat" || game.finished) {
    elements.options.classList.add("hidden");
    elements.bannerOptions.classList.add("hidden");
    return;
  }
  if (!game.options.length) makeSeatOptions(game);
  const target = currentQuestion(game);
  for (const container of [elements.options, elements.bannerOptions]) {
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
      container.append(button);
    }
    container.classList.remove("hidden");
  }
}

function renderBanner() {
  const active = Boolean(game && !game.finished && elements.mode.value !== "learn");
  elements.quizBanner.classList.toggle("hidden", !active);
  if (!active) return;
  const target = currentQuestion(game);
  elements.bannerQuestion.textContent = game.mode === "river"
    ? `Wo fließt ${target.name}?`
    : game.mode === "map" ? `Wo liegt ${target.name}?`
      : `Wo ist der Sitz der Regierung von ${target.name}?`;
  elements.bannerFeedback.textContent = game.answered ? elements.feedback.textContent : "";
  const tone = game.answered ? (elements.feedback.classList.contains("good") ? "good" : "bad") : "";
  elements.bannerFeedback.className = `quizBanner__feedback ${tone}`;
  elements.bannerNext.classList.toggle("hidden", !game.answered);
  elements.bannerNext.disabled = !game.answered;
}

function render() {
  const mode = elements.mode.value;
  const isLearn = mode === "learn";
  updateCountOptions();
  updateMapMode();
  elements.countLabel.classList.toggle("hidden", isLearn);
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
  renderBanner();

  if (isLearn) {
    elements.question.textContent = "Wähle einen Regierungsbezirk auf der Karte.";
    elements.options.classList.add("hidden");
    elements.bannerOptions.classList.add("hidden");
    return;
  }
  if (!game) {
    elements.question.textContent = mode === "river"
      ? "Wähle einen Fluss auf der Karte, um seinen Namen und seine Länge zu sehen, oder drücke Start."
      : mode === "map" ? "Finde die Regierungsbezirke auf der Karte."
        : "Ordne jedem Regierungsbezirk seinen Regierungssitz zu.";
    elements.options.classList.add("hidden");
    elements.bannerOptions.classList.add("hidden");
    setFeedback(mode === "river" ? "" : "Drücke Start, um das Quiz zu beginnen.");
    return;
  }
  if (game.finished) {
    elements.question.textContent = "Geschafft!";
    elements.finalScore.textContent = String(game.score);
    elements.finalTotal.textContent = String(game.questions.length);
    elements.options.classList.add("hidden");
    elements.bannerOptions.classList.add("hidden");
    setFeedback(mode === "river" ? "Wähle einen Fluss, um seine Länge zu sehen, oder starte eine neue Runde." : "Wähle Start für eine neue Runde.");
    return;
  }

  const target = currentQuestion(game);
  elements.question.textContent = mode === "river"
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
  renderOptions();
}

function resetMode() {
  cancelAdvance();
  hideMapToast();
  hideRiverInfo();
  game = null;
  elements.result.classList.add("hidden");
  setFeedback(elements.mode.value === "learn" ? "Tippe auf einen Bezirk, um seinen Regierungssitz zu sehen." : "");
  render();
}

function startGame() {
  cancelAdvance();
  hideMapToast();
  hideRiverInfo();
  if (elements.mode.value === "river" && elements.mapHost.querySelectorAll(".river").length !== RIVERS.length) {
    setFeedback("Die Flusskarte konnte nicht geladen werden.", "bad");
    return;
  }
  game = createGame(elements.mode.value, Number(elements.count.value));
  if (game.mode === "seat") makeSeatOptions(game);
  setFeedback(game.mode === "river" ? "Wähle den gesuchten Fluss auf der Karte." : game.mode === "map" ? "Wähle den gesuchten Bezirk auf der Karte." : "Wähle den richtigen Regierungssitz.");
  render();
}

function advance() {
  cancelAdvance();
  hideMapToast();
  hideRiverInfo();
  if (!game || !nextQuestion(game)) return;
  if (!game.finished && game.mode === "seat") makeSeatOptions(game);
  setFeedback(game.finished ? "" : game.mode === "river" ? "Wähle den gesuchten Fluss auf der Karte." : game.mode === "map" ? "Wähle den gesuchten Bezirk auf der Karte." : "Wähle den richtigen Regierungssitz.");
  render();
}

function submit(code) {
  if (!game) return;
  const correct = answer(game, code);
  if (correct === null) return;
  const target = currentQuestion(game);
  const selected = (game.mode === "river" ? RIVERS : REGIONS).find((item) => item.code === code);
  if (correct) {
    setFeedback("Richtig!", "good");
  } else if (game.mode === "river") {
    setFeedback(`Leider falsch: Das war ${selected.name}. ${target.name} ist grün markiert.`, "bad");
  } else if (game.mode === "map") {
    setFeedback(`Leider falsch: Das war ${selected.name}. ${target.name} ist grün markiert.`, "bad");
  } else {
    setFeedback(`Leider falsch. Der Regierungssitz von ${target.name} ist ${target.seat}.`, "bad");
  }
  render();
  if (correct && elements.autoNext.checked) {
    advanceTimer = window.setTimeout(advance, 1600);
  }
}

elements.mode.addEventListener("change", resetMode);
elements.count.addEventListener("change", () => {
  if (!game || game.finished) render();
});
elements.start.addEventListener("click", startGame);
elements.restart.addEventListener("click", startGame);
elements.next.addEventListener("click", advance);
elements.bannerRestart.addEventListener("click", startGame);
elements.bannerNext.addEventListener("click", advance);
elements.autoNext.addEventListener("change", () => {
  if (!elements.autoNext.checked) cancelAdvance();
});
function handleSeatOptionClick(event) {
  const button = event.target.closest("button[data-code]");
  if (button && game?.mode === "seat") submit(button.dataset.code);
}
elements.options.addEventListener("click", handleSeatOptionClick);
elements.bannerOptions.addEventListener("click", handleSeatOptionClick);

function chooseRegion(path) {
  if (!path || elements.mode.value === "river") return;
  const region = REGIONS.find((item) => item.code === path.id);
  if (!region) return;
  if (elements.mode.value === "learn") {
    resetMap();
    highlight(region.code, "selected");
    setFeedback(`${region.name} – Regierungssitz: ${region.seat}.`);
    showMapToast(elements.feedback.textContent);
  } else if (game?.mode === "map") {
    submit(region.code);
  }
}

function chooseRiver(node) {
  if (elements.mode.value !== "river") return;
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

elements.mapHost.addEventListener("click", (event) => {
  if (elements.mode.value === "river") {
    const river = event.target.closest(".river");
    if (river) chooseRiver(nearestRiverAt(event.clientX, event.clientY, river));
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
  if (elements.mode.value === "river") {
    const river = event.target.closest(".river");
    if (!river) return;
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
    elements.mapHost.setAttribute("aria-busy", "false");
    updateMapMode();
  } catch {
    elements.mapHost.textContent = "Die Karte konnte nicht geladen werden.";
    elements.mapHost.setAttribute("aria-busy", "false");
  }
}

resetMode();
loadMap();
