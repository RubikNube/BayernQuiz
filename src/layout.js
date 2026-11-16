
export function createLayout(getState) {
  let destroyed = false;
  const elements = {
    mapHost: document.querySelector("#mapHost"),
    modeCards: document.querySelector("#modeCards"),
    quizControls: document.querySelector("#quizControls"),
    topicLaunch: document.querySelector("#topicLaunch"),
  };
  function revealQuestionMap() {
    // Let closing details and browser scroll adjustments settle before measuring.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (destroyed) return;
      const { game, topic } = getState();
      if (!game || game.finished || window.matchMedia("(min-width: 1100px)").matches) return;
      const questionBar = document.querySelector(".questionBar");
      const sticky = getComputedStyle(questionBar).position === "sticky";
      // Keep answer options visible for seat questions, and the prompt on short screens.
      const target = !sticky ? questionBar
        : topic === "seat" ? elements.quizControls : elements.mapHost.closest(".mapWrap");
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
      if (destroyed || !card.getClientRects().length) return;
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

  return { revealQuestionMap, revealInfo, updateWorkspaceTop, destroy() { destroyed = true; workspaceObserver.disconnect(); window.removeEventListener("resize", updateWorkspaceTop); } };
}
