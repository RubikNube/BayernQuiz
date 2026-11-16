import { createPhotoQuestion } from "./photo-question.js";
import { TOPIC_LABELS, currentQuestion, getMistakeReview, getAllowedQuestionCounts } from "./game.js";
import { highscoreMessage } from "./highscores.js";
export function createQuizView({ highscores, mistakes }) {
  const elements = {
    autoLabel: document.querySelector("#autoLabel"),
    correctionActions: document.querySelector("#correctionActions"),
    correctionProgress: document.querySelector("#correctionProgress"),
    correctionSummary: document.querySelector("#correctionSummary"),
    count: document.querySelector("#count"),
    countLabel: document.querySelector("#countLabel"),
    currentTopic: document.querySelector("#currentTopic"),
    feedback: document.querySelector("#feedback"),
    finalScore: document.querySelector("#finalScore"),
    finalTotal: document.querySelector("#finalTotal"),
    highscoreResult: document.querySelector("#highscoreResult"),
    highscoreStorage: document.querySelector("#highscoreStorage"),
    highscores: document.querySelector("#highscores"),
    launchDetails: document.querySelector("#launchDetails"),
    launchTopic: document.querySelector("#launchTopic"),
    launchTopicButton: document.querySelector("#launchTopicButton"),
    learnTopics: document.querySelector("#learnTopics"),
    mistakeHelp: document.querySelector("#mistakeHelp"),
    mistakeReview: document.querySelector("#mistakeReview"),
    mistakeStorage: document.querySelector("#mistakeStorage"),
    modeCards: document.querySelector("#modeCards"),
    newRound: document.querySelector("#newRound"),
    next: document.querySelector("#next"),
    options: document.querySelector("#options"),
    personalBest: document.querySelector("#personalBest"),
    practiceLabel: document.querySelector("#practiceLabel"),
    progress: document.querySelector("#quizProgress"),
    progressLabel: document.querySelector("#progressLabel"),
    question: document.querySelector("#question"),
    questionTopic: document.querySelector("#questionTopic"),
    quizControls: document.querySelector("#quizControls"),
    resetRecords: document.querySelector("#resetRecords"),
    resetRecordsHint: document.querySelector("#resetRecordsHint"),
    restart: document.querySelector("#restart"),
    result: document.querySelector("#result"),
    resultTitle: document.querySelector("#resultTitle"),
    retryMistakes: document.querySelector("#retryMistakes"),
    reviewSuccess: document.querySelector("#reviewSuccess"),
    reviewTitle: document.querySelector("#reviewTitle"),
    round: document.querySelector("#round"),
    score: document.querySelector("#score"),
    settings: document.querySelector("#settings"),
    start: document.querySelector("#start"),
    stats: document.querySelector("#stats"),
    totalRounds: document.querySelector("#totalRounds"),
  };
  const photo = createPhotoQuestion();
  function setFeedback(message, tone = "") {
    elements.feedback.textContent = message;
    elements.feedback.className = `feedback ${tone}`;
  }

  function renderOptions(game, mode) {
    elements.options.replaceChildren();
    if (!game || !["seat", "photo"].includes(mode) || game.finished) {
      elements.options.classList.add("hidden");
      return;
    }
    const target = currentQuestion(game);
    for (const region of game.options) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option";
      button.dataset.code = region.code;
      button.textContent = mode === "photo" ? region.name : region.seat;
      if (mode === "photo") button.disabled = !photo.ready;
      if (game.answered) {
        button.disabled = true;
        if (region.code === target.code) button.classList.add("correct");
        if (region.code === game.selectedCode && region.code !== target.code) button.classList.add("wrong");
      }
      elements.options.append(button);
    }
    elements.options.classList.remove("hidden");
  }

  function renderReview(game) {
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

  function render({ game, topic: mode, selectedMode, roundRecord, mixCount, photoCount, learnTopics }) {
    photo.render(game, mode);
    const isPhoto = mode === "photo";
    document.body.classList.toggle("photoMode", isPhoto);
    document.querySelector(".mapWrap").classList.toggle("hidden", isPhoto && (!game || (!game.finished && !game.answered)));
    document.querySelector("#infoPanel").classList.toggle("hidden", isPhoto && (!game || (!game.finished && !game.answered)));
    const isLearn = mode === "learn";
    const isCorrection = selectedMode === "correction";
    elements.currentTopic.textContent = document.querySelector(`#mode-${selectedMode}-title`).textContent;
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
    elements.newRound.textContent = isCorrection ? "Neue Übungsrunde" : "Neue Runde";
    elements.correctionProgress.textContent = game?.answered ? game.correctionMessage ?? "" : "";
    elements.correctionSummary.textContent = isCorrection && game?.finished
      ? `${game.clearedCount ?? 0} Fragen korrigiert. ${mistakes.count ? `${mistakes.count} offene Fragen verbleiben.` : "Alle gespeicherten Fehler korrigiert!"}` : "";
    for (const bestLabel of elements.modeCards.querySelectorAll("[data-mode-best]")) {
      const cardMode = bestLabel.dataset.modeBest;
      if (cardMode === "learn") continue;
      const requestedCount = cardMode === "mix" ? mixCount : cardMode === "photo" ? photoCount : Number(elements.count.value);
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
      elements.question.textContent = mode === "photo"
        ? "Erkenne die Sehenswürdigkeit auf dem Foto und wähle einen von vier Namen. Drücke Start."
        : mode === "lake"
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
      renderReview(game);
      elements.options.classList.add("hidden");
      setFeedback(mode === "lake" ? "Wähle einen See, um mehr zu erfahren, oder starte eine neue Runde." : mode === "nature" ? "Wähle ein Naturschutzgebiet, um mehr zu erfahren, oder starte eine neue Runde." : mode === "city" ? "Wähle eine Stadt, um mehr zu erfahren, oder starte eine neue Runde." : mode === "sight" ? "Wähle eine Sehenswürdigkeit, um mehr zu erfahren, oder starte eine neue Runde." : mode === "mountain" ? "Wähle ein Gebirge, um mehr darüber zu erfahren, oder starte eine neue Runde."
        : mode === "river" ? "Wähle einen Fluss, um seine Länge zu sehen, oder starte eine neue Runde."
          : "Wähle Neue Runde für eine neue Runde.");
      return;
    }

    const target = currentQuestion(game);
    if (mode === "photo") {
      elements.question.textContent = "Welche Sehenswürdigkeit siehst du?";
      renderOptions(game, mode);
      return;
    }
    const name = document.createElement("strong");
    name.className = "question__target";
    name.textContent = target.name;
    elements.question.replaceChildren(document.createTextNode(mode === "seat" ? "Wähle den Regierungssitz von:" : "Finde auf der Karte:"), name);
    renderOptions(game, mode);
  }
  return { render, setFeedback, photoReady: () => photo.ready, destroy: () => photo.destroy() };
}
