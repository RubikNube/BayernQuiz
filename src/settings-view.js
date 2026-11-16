import { createEvents } from "./events.js";
import { getAllowedQuestionCounts } from "./game.js";

export function createSettingsView({ updateWorkspaceTop, getState, highscores, onResetRecords }) {
  const events = createEvents();
  const elements = {
    cancelResetRecords: document.querySelector("#cancelResetRecords"),
    changeTopic: document.querySelector("#changeTopic"),
    closeTopics: document.querySelector("#closeTopics"),
    count: document.querySelector("#count"),
    learnTopics: document.querySelector("#learnTopics"),
    modeCards: document.querySelector("#modeCards"),
    personalBest: document.querySelector("#personalBest"),
    resetAllRecords: document.querySelector("#resetAllRecords"),
    resetRecords: document.querySelector("#resetRecords"),
    resetRecordsDescription: document.querySelector("#resetRecordsDescription"),
    resetRecordsDialog: document.querySelector("#resetRecordsDialog"),
    resetRecordsError: document.querySelector("#resetRecordsError"),
    resetRecordsForm: document.querySelector("#resetRecordsForm"),
    resetRecordsStatus: document.querySelector("#resetRecordsStatus"),
    resetSelectedLabel: document.querySelector("#resetSelectedLabel"),
    resetSelectedRecord: document.querySelector("#resetSelectedRecord"),
    topicDialog: document.querySelector("#topicDialog"),
    topicDialogContent: document.querySelector("#topicDialogContent"),
    topicLaunch: document.querySelector("#topicLaunch"),
    topicSwitcher: document.querySelector("#topicSwitcher"),
  };
  const modeInputs = [...elements.modeCards.querySelectorAll('input[name="mode"]')];
  function updateCountOptions(mode) {
    for (const option of elements.count.options) {
      const allowed = getAllowedQuestionCounts(mode).includes(Number(option.value));
      option.hidden = !allowed;
      option.disabled = !allowed;
    }
    if (!["learn", "correction"].includes(mode) && elements.count.selectedOptions[0]?.disabled) elements.count.value = ["mix", "photo"].includes(mode) ? "10" : "7";
  }
  function compactTopicSelection() {
    if (elements.topicDialogContent.contains(elements.modeCards)) return;
    elements.topicDialogContent.append(elements.modeCards);
    elements.topicLaunch.classList.add("hidden");
    elements.topicSwitcher.classList.remove("hidden");
    updateWorkspaceTop();
  }
  const learnTopics = Object.fromEntries(["regions", "rivers", "mountains", "sights", "cities", "nature", "lakes"].map((topic) => {
    const checkbox = elements.learnTopics.querySelector(`[data-learn-topic="${topic}"]`);
    try {
      const saved = JSON.parse(localStorage.getItem("bayernQuizLearnTopics"));
      if (typeof saved?.[topic] === "boolean") checkbox.checked = saved[topic];
    } catch { /* Keep the default selection. */ }
    return [topic, checkbox];
  }));

  events.on(elements.changeTopic, "click", () => {
    elements.topicDialog.showModal();
    modeInputs.find((input) => input.checked).focus();
  });
  events.on(elements.closeTopics, "click", () => elements.topicDialog.close());
  events.on(elements.topicDialog, "close", () => {
    if (!elements.topicDialog.open) elements.changeTopic.focus({ preventScroll: true });
  });

  let resetTarget = null;
  function updateResetDescription() {
    elements.resetRecordsDescription.textContent = elements.resetAllRecords.checked
      ? "Alle Rekorde für alle Modi und Fragenanzahlen in diesem Browser werden gelöscht."
      : `Nur der Rekord für ${resetTarget.label} mit ${resetTarget.count} Fragen wird gelöscht. Andere Rekorde bleiben erhalten.`;
  }

  events.on(elements.resetRecords, "click", () => {
    const { game, selectedMode } = getState();
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
    events.on(input, "change", updateResetDescription);
  }
  events.on(elements.cancelResetRecords, "click", () => elements.resetRecordsDialog.close());
  events.on(elements.resetRecordsDialog, "close", () => {
    // A queued close event may arrive after the dialog has already been reopened.
    if (elements.resetRecordsDialog.open) return;
    resetTarget = null;
    (elements.resetRecords.disabled ? elements.personalBest : elements.resetRecords).focus();
  });
  events.on(elements.resetRecordsForm, "submit", (event) => {
    event.preventDefault();
    if (!resetTarget || !elements.resetRecordsDialog.open) return;
    const all = elements.resetAllRecords.checked;
    const success = onResetRecords(all, resetTarget);
    if (!success) {
      elements.resetRecordsError.textContent = "Die Rekorde konnten nicht zurückgesetzt werden. Bitte versuche es erneut.";
      return;
    }
    elements.resetRecordsStatus.textContent = all ? "Alle Rekorde zurückgesetzt." : "Rekord zurückgesetzt.";
    elements.resetRecordsDialog.close();
  });

  function saveLearnTopics() {
    try { localStorage.setItem("bayernQuizLearnTopics", JSON.stringify(Object.fromEntries(Object.entries(learnTopics).map(([topic, input]) => [topic, input.checked])))); } catch { /* In-memory selection remains active. */ }
  }
  return { destroy: events.destroy, saveLearnTopics, updateCountOptions, compactTopicSelection, learnTopics, modeInputs };
}
