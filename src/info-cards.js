import { createEvents } from "./events.js";
import { REGIONS } from "./game.js";
export function createInfoCards({ revealInfo }) {
  const events = createEvents();
  const elements = {
    lakeInfo: document.querySelector("#lakeInfo"),
    lakeInfoArea: document.querySelector("#lakeInfoArea"),
    lakeInfoFact: document.querySelector("#lakeInfoFact"),
    lakeInfoImage: document.querySelector("#lakeInfoImage"),
    lakeInfoLocation: document.querySelector("#lakeInfoLocation"),
    lakeInfoName: document.querySelector("#lakeInfoName"),
    lakeInfoWikipedia: document.querySelector("#lakeInfoWikipedia"),
    mapHost: document.querySelector("#mapHost"),
    mapToast: document.querySelector("#mapToast"),
    mapToastContent: document.querySelector("#mapToastContent"),
    mountainInfo: document.querySelector("#mountainInfo"),
    mountainInfoImage: document.querySelector("#mountainInfoImage"),
    mountainInfoName: document.querySelector("#mountainInfoName"),
    mountainInfoPeak: document.querySelector("#mountainInfoPeak"),
    mountainInfoRegion: document.querySelector("#mountainInfoRegion"),
    mountainInfoWikipedia: document.querySelector("#mountainInfoWikipedia"),
    natureInfo: document.querySelector("#natureInfo"),
    natureInfoFact: document.querySelector("#natureInfoFact"),
    natureInfoImage: document.querySelector("#natureInfoImage"),
    natureInfoLocation: document.querySelector("#natureInfoLocation"),
    natureInfoName: document.querySelector("#natureInfoName"),
    natureInfoWikipedia: document.querySelector("#natureInfoWikipedia"),
    riverInfo: document.querySelector("#riverInfo"),
    riverInfoLength: document.querySelector("#riverInfoLength"),
    riverInfoName: document.querySelector("#riverInfoName"),
    riverInfoWikipedia: document.querySelector("#riverInfoWikipedia"),
    sightInfo: document.querySelector("#sightInfo"),
    sightInfoClose: document.querySelector("#sightInfoClose"),
    sightInfoFact: document.querySelector("#sightInfoFact"),
    sightInfoImage: document.querySelector("#sightInfoImage"),
    sightInfoLocation: document.querySelector("#sightInfoLocation"),
    sightInfoName: document.querySelector("#sightInfoName"),
    sightInfoWikipedia: document.querySelector("#sightInfoWikipedia"),
  };
  function showTargetInfo(topic, target) {
    if (topic === "map") showMapToast(`${target.name} – Regierungssitz: ${target.seat}.`, "", target.name);
    else ({ river: showRiverInfo, mountain: showMountainInfo, sight: showSightInfo,
      city: showCityInfo, nature: showNatureInfo, lake: showLakeInfo })[topic]?.(target);
  }

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

  function showCityInfo(city) {
    const region = REGIONS.find((item) => item.code === city.regionCode);
    showMapToast(`${city.name} – Regierungsbezirk: ${region.name}.`, "", city.wikipediaTitle);
    const coat = document.createElement("img");
    coat.className = "cityCoat";
    coat.src = `assets/cities/${city.code}.png`;
    coat.alt = `Wappen von ${city.name}`;
    coat.width = 64;
    coat.height = 72;
    events.on(coat, "error", () => coat.remove(), { once: true });
    events.on(coat, "load", () => revealInfo(elements.mapToast), { once: true });
    const details = document.createElement("div");
    details.append(...elements.mapToastContent.childNodes);
    elements.mapToastContent.classList.add("cityInfoContent");
    elements.mapToastContent.replaceChildren(coat, details);
  }
  events.on(elements.sightInfoClose, "click", () => {
    hideSightInfo();
    elements.mapHost.querySelector(".sight.learned, .sight.wrong, .sight.correct")?.focus();
  });
  document.querySelectorAll("[data-close-info]").forEach((button) => {
    events.on(button, "click", () => {
      if (button.dataset.closeInfo === "mountainInfo") hideMountainInfo();
      else document.getElementById(button.dataset.closeInfo).classList.add("hidden");
      elements.mapHost.focus({ preventScroll: true });
    });
  });

  events.on(elements.mountainInfoImage, "error", () => {
    elements.mountainInfoImage.hidden = true;
  });
  events.on(elements.mountainInfoImage, "load", () => {
    if (!elements.mountainInfoImage.hasAttribute("src")) return;
    elements.mountainInfoImage.hidden = false;
    revealInfo(elements.mountainInfo);
  });

  events.on(elements.sightInfoImage, "error", () => {
    elements.sightInfoImage.hidden = true;
  });
  events.on(elements.sightInfoImage, "load", () => {
    elements.sightInfoImage.hidden = false;
    revealInfo(elements.sightInfo);
  });

  events.on(elements.natureInfoImage, "error", () => {
    elements.natureInfoImage.hidden = true;
  });
  events.on(elements.natureInfoImage, "load", () => {
    elements.natureInfoImage.hidden = false;
    revealInfo(elements.natureInfo);
  });

  events.on(elements.lakeInfoImage, "error", () => {
    elements.lakeInfoImage.hidden = true;
  });
  events.on(elements.lakeInfoImage, "load", () => {
    elements.lakeInfoImage.hidden = false;
    revealInfo(elements.lakeInfo);
  });

  return { destroy: events.destroy, showTargetInfo, showMapToast, hideMapToast, hideRiverInfo, showRiverInfo, hideMountainInfo, showMountainInfo, hideSightInfo, showSightInfo, hideNatureInfo, showNatureInfo, hideLakeInfo, showLakeInfo, showCityInfo };
}
