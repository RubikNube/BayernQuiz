import { currentQuestion } from "./game.js";

// Each request owns its image element. Detached images cannot update a later question.
export function createPhotoQuestion() {
  const host = document.querySelector("#photoQuestion");
  const frame = document.querySelector("#photoFrame");
  const status = document.querySelector("#photoStatus");
  const retry = document.querySelector("#retryPhoto");
  let game = null;
  let target = null;
  let image = null;
  let ready = false;
  let destroyed = false;

  function updateButtons() {
    document.querySelectorAll("#options button").forEach(button => {
      button.disabled = !ready || game.answered;
    });
  }
  function load() {
    const requested = new Image();
    image = requested;
    ready = false;
    frame.replaceChildren(requested);
    requested.alt = "Foto einer bayerischen Sehenswürdigkeit";
    retry.hidden = true;
    status.textContent = "Foto wird geladen …";
    updateButtons();
    requested.onload = () => {
      if (destroyed || image !== requested) return;
      ready = true;
      status.textContent = "";
      updateButtons();
    };
    requested.onerror = () => {
      if (destroyed || image !== requested) return;
      ready = false;
      requested.hidden = true;
      status.textContent = "Das Foto konnte nicht geladen werden. Bitte versuche es erneut.";
      retry.hidden = false;
      updateButtons();
    };
    requested.src = `assets/sights/${target.code}.jpg`;
  }
  retry.addEventListener("click", load);
  return {
    get ready() { return ready; },
    render(nextGame, topic) {
      const nextTarget = nextGame && !nextGame.finished && topic === "photo" ? currentQuestion(nextGame) : null;
      host.classList.toggle("hidden", !nextTarget);
      if (!nextTarget) {
        image = null;
        target = null;
        game = null;
        ready = false;
        frame.replaceChildren();
        return;
      }
      const changed = game !== nextGame || target !== nextTarget;
      game = nextGame;
      target = nextTarget;
      if (changed) load();
    },
    destroy() {
      destroyed = true;
      image = null;
      retry.removeEventListener("click", load);
    },
  };
}
