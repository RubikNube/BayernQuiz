import { createEvents } from "./events.js";
import { MAP_TOPICS, questionTopic, REGIONS, RIVERS, MOUNTAINS, SIGHTS, CITIES, NATURE_RESERVES, LAKES, answer, createCorrectionGame, createGame, createRetryGame, currentQuestion, getMistakeReview, makeSeatOptions, nextQuestion } from "./game.js";
import { createHighscores } from "./highscores.js";
import { createMistakes } from "./mistakes.js";
import { createLayout } from "./layout.js";
import { createInfoCards } from "./info-cards.js";
import { createMapView } from "./map-view.js";
import { createQuizView } from "./quiz-view.js";
import { createSettingsView } from "./settings-view.js";

export function createQuizController() {
  const events = createEvents();
  const elements = {
    autoNext: document.querySelector("#autoNext"),
    correctionActions: document.querySelector("#correctionActions"),
    count: document.querySelector("#count"),
    launchTopicButton: document.querySelector("#launchTopicButton"),
    mapHost: document.querySelector("#mapHost"),
    newRound: document.querySelector("#newRound"),
    next: document.querySelector("#next"),
    options: document.querySelector("#options"),
    question: document.querySelector("#question"),
    resetRecordsStatus: document.querySelector("#resetRecordsStatus"),
    restart: document.querySelector("#restart"),
    result: document.querySelector("#result"),
    resultTitle: document.querySelector("#resultTitle"),
    retryMistakes: document.querySelector("#retryMistakes"),
    settings: document.querySelector("#settings"),
    start: document.querySelector("#start"),
    topicDialog: document.querySelector("#topicDialog"),
  };
  const highscores = createHighscores();
  const mistakes = createMistakes();

  const layout = createLayout(() => ({ game, topic: activeTopic() }));
  const { revealQuestionMap } = layout;
  const info = createInfoCards(layout);
  const { showTargetInfo, showMapToast, hideMapToast, hideRiverInfo, showRiverInfo, hideMountainInfo, showMountainInfo, hideSightInfo, showSightInfo, hideNatureInfo, showNatureInfo, hideLakeInfo, showLakeInfo, showCityInfo } = info;
  const settings = createSettingsView({ ...layout, getState: snapshot, highscores, onResetRecords(all, target) {
    const success = all ? highscores.resetAll() : highscores.resetRecord(target.mode, target.count);
    if (success) {
      if (game?.finished && (all || (game.mode === target.mode && game.questions.length === target.count))) roundRecord = null;
      render();
    }
    return success;
  } });
  const { modeInputs, learnTopics, updateCountOptions, compactTopicSelection } = settings;
  const map = createMapView({ getState: snapshot, onSelect: ({ topic, code }) => ({ map: chooseRegion, river: chooseRiver, mountain: chooseMountain, lake: chooseLake, nature: chooseNature, city: chooseCity, sight: chooseSight })[topic](code) });
  const { resetMap, highlight, highlightRiver, highlightMountain, highlightSight, highlightNature, highlightLake, highlightCity } = map;
  const view = createQuizView({ highscores, mistakes });
  const { setFeedback } = view;
  function snapshot() { return { game, topic: activeTopic(), selectedMode, roundRecord, mixCount, learnTopics }; }
  function render() {
    updateCountOptions(selectedMode);
    map.updateMapMode(snapshot());
    resetMap();
    view.render(snapshot());
    if (!game || game.finished) return;
    const mode = activeTopic();
    const target = currentQuestion(game);
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

  }

  let selectedMode = modeInputs.find((input) => input.checked).value;
  let roundRecord = null;
  let game = null;
  let practiceSource = null;

  let advanceTimer = null;
  let mixCount = 10;
  let otherCount = 7;

  function activeTopic() {
    if (!["mix", "correction"].includes(selectedMode)) return selectedMode;
    return questionTopic(game, game ? currentQuestion(game) ?? game.questions.at(-1) : null) ?? "map";
  }

  function compareAnswer(selected) {
    if (!game?.answered || game.finished) return;
    const topic = activeTopic();
    const target = selected ? MAP_TOPICS[topic].find(item => item.code === game.selectedCode) : currentQuestion(game);
    showTargetInfo(topic, target);
    map.reveal(topic, target.code);
  }

  function cancelAdvance() {
    window.clearTimeout(advanceTimer);
    advanceTimer = null;
  }

  function resetMode() {
    elements.resetRecordsStatus.textContent = "";
    hideNatureInfo();
    hideLakeInfo();
    map.resetZoom();
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
    map.resetZoom();
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
    if (!game.finished && ["mix", "correction"].includes(game.mode) && activeTopic() !== previousTopic) map.resetZoom();
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
      if (!correct) map.reveal(topic, target.code);
    }
    if (correct && elements.autoNext.checked) {
      advanceTimer = window.setTimeout(advance, ["sight", "nature", "lake"].includes(topic) ? 5000 : 1600);
    }
  }

  events.on(elements.correctionActions, "click", event => {
    const button = event.target.closest("button[data-compare]");
    if (button) compareAnswer(button.dataset.compare === "selected");
  });

  events.on(elements.launchTopicButton, "click", () => {
    if (selectedMode !== "learn") {
      startGame();
      return;
    }
    compactTopicSelection();
    elements.settings.open = window.matchMedia("(min-width: 1100px)").matches;
    elements.question.focus();
    elements.question.scrollIntoView({ block: "nearest" });
  });

  for (const input of modeInputs) {
    events.on(input, "click", () => {
      if (elements.topicDialog.open && selectedMode === input.value) elements.topicDialog.close();
    });
    events.on(input, "change", () => {
      if (!input.checked || selectedMode === input.value) return;
      if (selectedMode === "mix") mixCount = Number(elements.count.value);
      else if (selectedMode !== "correction") otherCount = Number(elements.count.value);
      selectedMode = input.value;
      elements.count.value = String(selectedMode === "mix" ? mixCount : otherCount);
      resetMode();
      if (elements.topicDialog.open) elements.topicDialog.close();
    });
  }
  for (const checkbox of Object.values(learnTopics)) events.on(checkbox, "change", () => {
    hideNatureInfo();
    hideLakeInfo();
    settings.saveLearnTopics();
    resetMap();
    hideMapToast();
    hideRiverInfo();
    hideMountainInfo();
    hideSightInfo();
    render();
  });
  events.on(elements.count, "change", () => {
    if (selectedMode === "mix") mixCount = Number(elements.count.value);
    else otherCount = Number(elements.count.value);
    elements.resetRecordsStatus.textContent = "";
    if (!game || game.finished) render();
  });
  events.on(elements.start, "click", () => startGame());
  events.on(elements.newRound, "click", () => startGame());
  events.on(elements.restart, "click", () => {
    startGame(selectedMode !== "correction" && game?.isPractice ? createRetryGame(practiceSource) : null);
  });
  events.on(elements.retryMistakes, "click", () => {
    if (!game?.finished || !getMistakeReview(game).length) return;
    practiceSource = game;
    startGame(createRetryGame(practiceSource));
  });
  events.on(elements.next, "click", advance);
  events.on(elements.autoNext, "change", () => {
    if (!elements.autoNext.checked) cancelAdvance();
  });
  function handleSeatOptionClick(event) {
    const button = event.target.closest("button[data-code]");
    if (button && activeTopic() === "seat") submit(button.dataset.code);
  }
  events.on(elements.options, "click", handleSeatOptionClick);

  function chooseRegion(code) {
    if (!code || activeTopic() === "lake" || activeTopic() === "nature" || activeTopic() === "river" || activeTopic() === "mountain" || activeTopic() === "sight" || activeTopic() === "city") return;
    if (activeTopic() === "learn" && !learnTopics.regions.checked) return;
    const region = REGIONS.find((item) => item.code === code);
    if (!region) return;
    if (activeTopic() === "learn" || !game || game.finished || game.answered) {
      if (!game || game.finished) { resetMap(); highlight(region.code, "selected"); }
      showMapToast(`${region.name} – Regierungssitz: ${region.seat}.`, "", region.wikipediaTitle ?? region.name);
    } else if (activeTopic() === "map") {
      submit(region.code);
    }
  }

  function chooseRiver(code) {
    if (activeTopic() !== "river" && !(activeTopic() === "learn" && learnTopics.rivers.checked)) return;
    const river = RIVERS.find((item) => item.code === code);
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

  function chooseMountain(code) {
    if (activeTopic() !== "mountain" && !(activeTopic() === "learn" && learnTopics.mountains.checked)) return;
    const mountain = MOUNTAINS.find((item) => item.code === code);
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

  function chooseNature(code) {
    if (activeTopic() !== "nature" && !(activeTopic() === "learn" && learnTopics.nature.checked)) return;
    const reserve = NATURE_RESERVES.find((item) => item.code === code);
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

  function chooseLake(code) {
    if (activeTopic() !== "lake" && !(activeTopic() === "learn" && learnTopics.lakes.checked)) return;
    const lake = LAKES.find((item) => item.code === code);
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

  function chooseCity(code) {
    if (activeTopic() !== "city" && !(activeTopic() === "learn" && learnTopics.cities.checked)) return;
    const city = CITIES.find((item) => item.code === code);
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

  function chooseSight(code) {
    if (activeTopic() !== "sight" && !(activeTopic() === "learn" && learnTopics.sights.checked)) return;
    const sight = SIGHTS.find((item) => item.code === code);
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

  resetMode();
  map.loadMap();
  return { startGame, advance, submit, destroy() { events.destroy(); cancelAdvance(); layout.destroy(); map.destroy(); info.destroy(); settings.destroy(); } };

}
