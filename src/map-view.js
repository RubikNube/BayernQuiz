import { createEvents } from "./events.js";
import { createMapZoom } from "./map-zoom.js";
export function createMapView({ getState, onSelect }) {
  const events = createEvents();
  const elements = {
    mapHost: document.querySelector("#mapHost"),
  };
  let mapZoom = null;
  const loading = new AbortController();
  function targetElement(topic, code) {
    return elements.mapHost.querySelector(topic === "map" ? `#${code}` : `.${topic}[data-${topic}="${code}"]`);
  }

  function updateMapMode({ topic, selectedMode, learnTopics }) {
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

  function highlightSight(code, className) {
    elements.mapHost.querySelector(`.sight[data-sight="${code}"]`)?.classList.add(className);
  }

  function highlightNature(code, className) {
    elements.mapHost.querySelector(`.nature[data-nature="${code}"]`)?.classList.add(className);
  }

  function highlightLake(code, className) {
    elements.mapHost.querySelector(`.lake[data-lake="${code}"]`)?.classList.add(className);
  }

  function highlightCity(code, className) {
    elements.mapHost.querySelector(`.city[data-city="${code}"]`)?.classList.add(className);
  }

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

  async function loadMap() {
    try {
      const response = await fetch("regions.svg", { signal: loading.signal });
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
      updateMapMode(getState());
    } catch {
      if (loading.signal.aborted) return;
      elements.mapHost.textContent = "Die Karte konnte nicht geladen werden.";
      elements.mapHost.setAttribute("aria-busy", "false");
    }
  }
  function selectRegion(node) { if (node) onSelect({ topic: "map", code: node.id }); }

  function selectRiver(node) { if (node) onSelect({ topic: "river", code: node.dataset.river }); }

  function selectMountain(node) { if (node) onSelect({ topic: "mountain", code: node.dataset.mountain }); }

  function selectLake(node) { if (node) onSelect({ topic: "lake", code: node.dataset.lake }); }

  function selectNature(node) { if (node) onSelect({ topic: "nature", code: node.dataset.nature }); }

  function selectCity(node) { if (node) onSelect({ topic: "city", code: node.dataset.city }); }

  function selectSight(node) { if (node) onSelect({ topic: "sight", code: node.dataset.sight }); }

  events.on(elements.mapHost, "click", (event) => {
    const { topic, learnTopics } = getState();
    const learning = topic === "learn";
    const lake = event.target.closest(".lake");
    if (lake) {
      selectLake(lakeAt(event, lake));
      return;
    }
    const nature = event.target.closest(".nature");
    if (nature) {
      selectNature(nearestMarkerAt(event, nature, ".nature", ".nature-dot"));
      return;
    }
    const sight = event.target.closest(".sight");
    if (sight) {
      selectSight(nearestMarkerAt(event, sight, ".sight", ".sight-dot"));
      return;
    }
    const city = event.target.closest(".city");
    if (city) {
      selectCity(nearestMarkerAt(event, city, ".city", ".city-dot"));
      return;
    }
    const mountain = event.target.closest(".mountain");
    if (mountain && (!learning || learnTopics.mountains.checked)) {
      selectMountain(nearestRouteAt(event.clientX, event.clientY, mountain, ".mountain", ".mountain-line"));
      return;
    }
    const river = event.target.closest(".river");
    if (river && (!learning || learnTopics.rivers.checked)) {
      selectRiver(nearestRouteAt(event.clientX, event.clientY, river, ".river", ".river-line"));
      return;
    }
    const path = event.target.closest(".region, .seat-dot");
    if (path?.classList.contains("seat-dot")) {
      selectRegion(elements.mapHost.querySelector(`#${path.dataset.region}`));
      return;
    }
    if (path) selectRegion(path);
  });
  events.on(elements.mapHost, "keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const { topic, learnTopics } = getState();
    const learning = topic === "learn";
    const lake = event.target.closest(".lake");
    if (lake) {
      event.preventDefault();
      selectLake(lake);
      return;
    }
    const nature = event.target.closest(".nature");
    if (nature) {
      event.preventDefault();
      selectNature(nature);
      return;
    }
    const sight = event.target.closest(".sight");
    if (sight) {
      event.preventDefault();
      selectSight(sight);
      return;
    }
    const city = event.target.closest(".city");
    if (city) {
      event.preventDefault();
      selectCity(city);
      return;
    }
    const mountain = event.target.closest(".mountain");
    if (mountain && (!learning || learnTopics.mountains.checked)) {
      event.preventDefault();
      selectMountain(mountain);
      return;
    }
    const river = event.target.closest(".river");
    if (river && (!learning || learnTopics.rivers.checked)) {
      event.preventDefault();
      selectRiver(river);
      return;
    }
    const path = event.target.closest(".region, .seat-dot");
    if (!path) return;
    event.preventDefault();
    selectRegion(path.classList.contains("seat-dot")
      ? elements.mapHost.querySelector(`#${path.dataset.region}`)
      : path);
  });

  return { updateMapMode, resetMap, highlight, highlightRiver, highlightMountain, highlightSight, highlightNature, highlightLake, highlightCity, loadMap, resetZoom() { mapZoom?.reset(); }, reveal(topic, code) { mapZoom?.reveal(targetElement(topic, code)); }, destroy() { loading.abort(); events.destroy(); mapZoom?.destroy(); } };
}
