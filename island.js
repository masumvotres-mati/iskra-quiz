"use strict";

const islandItems = [
  {
    id: "water", name: "Woda", growth: [{ crops: 1 }, { workshop: 2 }],
    stages: ["Kanał doprowadzający wodę", "Sieć nawadniająca pola", "Regulowany dopływ"],
    explanation: "Kanał zasila pola i koło wodne. Rozbudowa sieci oraz wykonanie urządzeń regulujących wodę wymagają współpracy i umiejętności rzemieślników.",
    sources: ["history-6"],
  },
  {
    id: "crops", name: "Uprawy", growth: [{ water: 1 }, { water: 2 }],
    stages: ["Zasiane pole", "Zielone uprawy", "Zbiory i zapasy"],
    explanation: "W tej osadzie pola potrzebują nawadniania. Nadwyżka żywności pozwala części mieszkańców poświęcić czas rzemiosłu.",
    sources: ["history-4", "history-6"],
  },
  {
    id: "workshop", name: "Warsztat", growth: [{ crops: 2 }, { wheel: 2 }],
    stages: ["Stanowisko rzemieślnika", "Mały warsztat", "Praca z napędem wodnym"],
    explanation: "Żywność wspiera rozwój rzemiosła, a przekazanie ruchu koła wodnego do urządzeń pomaga w produkcji. To scenariusz tej osady, nie twierdzenie, że każde rzemiosło wymagało rolnictwa.",
    sources: ["history-4", "history-64"],
  },
  {
    id: "wheel", name: "Koło wodne", growth: [{ water: 1, workshop: 1 }, { water: 2, workshop: 2 }],
    stages: ["Zmontowana konstrukcja", "Koło wprawione w ruch", "Rozwinięty układ napędowy"],
    explanation: "Płynąca woda obraca koło. Rzemieślnicy mogą przekazać ten ruch do warsztatu i prądnicy. Samo ustawienie koła bez wody nie daje napędu.",
    sources: ["history-64"],
  },
  {
    id: "generator", name: "Prądnica", growth: [{ wheel: 2, workshop: 2 }, { wheel: 3 }],
    stages: ["Magnes i zwojnica", "Wytwarzanie prądu", "Zasilanie urządzeń osady"],
    explanation: "Prądnica wykorzystuje indukcję elektromagnetyczną, przekształcając energię ruchu w energię elektryczną. Tutaj ruch dostarcza koło wodne.",
    sources: ["history-38"],
  },
  {
    id: "telegraph", name: "Telegraf", growth: [{ generator: 2 }, { generator: 3 }],
    stages: ["Dwa stanowiska", "Sygnał w przewodzie", "Wiadomość odebrana"],
    explanation: "Działający telegraf elektryczny potrzebuje źródła prądu i obwodu. W tej grze zasilasz go prądnicą; historycznie wykorzystywano też baterie. Etapy gry nie oznaczają rzeczywistego czasu przesyłania wiadomości.",
    sources: ["history-39"],
  },
];

function emptyIslandLevels() {
  return Object.fromEntries(islandItems.map((item) => [item.id, 0]));
}

function growIsland(levels) {
  return Object.fromEntries(islandItems.map((item) => {
    const level = levels[item.id];
    const grows = level > 0 && level < 3 &&
      Object.entries(item.growth[level - 1]).every(([id, minimum]) => levels[id] >= minimum);
    return [item.id, level + Number(grows)];
  }));
}

let islandState = { levels: emptyIslandLevels(), order: [], busy: false, finished: false };
let islandTimer;
let islandFinalSeason = false;
let islandVisualLevels = null;
let islandVisualTimers = [];
let islandAnimations = [];
let islandMotionPaused = false;

const islandRoutes = {
  irrigation: { type: "water", points: [[203, 185], [270, 202], [356, 185], [442, 182]] },
  river: { type: "water", points: [[202, 185], [246, 220], [285, 248], [326, 268]] },
  food: { type: "food", points: [[525, 226], [444, 251], [334, 309], [230, 339]] },
  tools: { type: "tools", points: [[205, 316], [183, 270], [209, 233], [232, 205]] },
  workshopDrive: { type: "gear", points: [[325, 269], [300, 292], [278, 316], [245, 329]] },
  generatorDrive: { type: "gear", points: [[350, 279], [389, 298], [427, 316], [462, 330]] },
  power: { type: "power", points: [[507, 326], [550, 292], [582, 302], [607, 319]] },
  message: { type: "message", points: [[607, 319], [589, 260], [575, 198], [578, 133]] },
};

function islandCanAnimate() {
  return !motionPreference.matches && !islandMotionPaused;
}

function clearIslandEffects() {
  for (const timer of islandVisualTimers) window.clearTimeout(timer);
  islandVisualTimers = [];
  for (const animation of islandAnimations) animation.cancel();
  islandAnimations = [];
  element("island-effects").replaceChildren();
  for (const item of element("island").querySelectorAll(".inspected")) item.classList.remove("inspected");
}

function animateIslandAsset(id) {
  if (!islandCanAnimate()) return;
  const body = element(`island-asset-${id}`).querySelector(".island-grow-body");
  islandAnimations.push(body.animate([
    { transform: "translateY(7px) scale(.93)" },
    { transform: "translateY(-3px) scale(1.04)", offset: 0.65 },
    { transform: "translateY(0) scale(1)" },
  ], { duration: 390, easing: "ease-out" }));
}

function sendIslandEffect(routeId) {
  if (!islandCanAnimate()) return;
  const route = islandRoutes[routeId];
  const token = document.createElementNS("http://www.w3.org/2000/svg", "g");
  token.classList.add("island-traveller");
  token.dataset.route = routeId;
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "use");
  icon.setAttribute("href", `#island-token-${route.type}`);
  token.append(icon);
  element("island-effects").append(token);
  const animation = token.animate(route.points.map(([x, y], index) => ({
    transform: `translate(${x}px, ${y}px)`,
    opacity: index === 0 || index === route.points.length - 1 ? 0 : 1,
  })), { duration: 500, easing: "ease-in-out" });
  animation.onfinish = () => token.remove();
  islandAnimations.push(animation);
}

function reactIslandAsset(id, levels = islandState.levels) {
  animateIslandAsset(id);
  if (id === "water" && levels.water >= 3) sendIslandEffect("tools");
  if (id === "water" && levels.water >= 2 && levels.crops) sendIslandEffect("irrigation");
  if (id === "crops" && levels.water) sendIslandEffect("irrigation");
  if (id === "workshop" && levels.workshop >= 2) {
    sendIslandEffect(levels.workshop >= 3 ? "workshopDrive" : "food");
  }
  if (id === "wheel" && levels.wheel >= 2) sendIslandEffect("river");
  if (id === "generator" && levels.generator >= 2) sendIslandEffect("generatorDrive");
  if (id === "telegraph" && levels.telegraph >= 2) {
    sendIslandEffect(levels.telegraph >= 3 ? "message" : "power");
  }
}

function cancelIslandMotion() {
  window.clearTimeout(islandTimer);
  islandTimer = undefined;
  islandState.busy = false;
  islandFinalSeason = false;
  islandVisualLevels = null;
  clearIslandEffects();
  element("island-scene").dataset.busy = "false";
}

function renderIsland(grown = []) {
  const levels = islandVisualLevels ?? islandState.levels;
  const completed = islandItems.filter((item) => levels[item.id] === 3).length;
  element("island-count").textContent = `Dodane: ${islandState.order.length} / ${islandItems.length}`;
  element("island-level-count").textContent = `Rozwinięte: ${completed} / ${islandItems.length}`;
  element("island-scene").dataset.busy = String(islandState.busy);
  element("island-scene").dataset.live = String(islandCanAnimate() && !document.hidden && !element("island").hidden);
  element("island-scene").dataset.powered = String(levels.generator >= 2);
  element("island-scene").dataset.complete = String(completed === islandItems.length);
  element("island-motion").textContent = islandMotionPaused ? "Wznów animacje" : "Pauza animacji";
  element("island-motion").setAttribute("aria-pressed", String(islandMotionPaused));
  element("island").classList.toggle("is-finished", islandState.finished);
  element("island-controls").setAttribute("aria-busy", String(islandState.busy));
  const descriptions = [];
  for (const item of islandItems) {
    const level = levels[item.id];
    const asset = element(`island-asset-${item.id}`);
    asset.dataset.level = String(level);
    asset.classList.toggle("grew", grown.includes(item.id));
    const button = element(`island-pick-${item.id}`);
    button.disabled = islandState.busy;
    button.classList.toggle("placed", level > 0);
    button.classList.toggle("maxed", level === 3);
    const order = islandState.order.indexOf(item.id);
    element(`island-order-${item.id}`).textContent = order === -1 ? "" : String(order + 1);
    element(`island-level-${item.id}`).textContent = level === 0 ? "Dodaj" : level === 3 ? "MAX" : `${level} / 3`;
    button.setAttribute("aria-label", level === 0 ? `Dodaj: ${item.name}`
      : `Obejrzyj: ${item.name}, poziom ${level} z 3, wybór ${order + 1}`);
    Array.from(button.querySelectorAll(".island-level-dots span")).forEach((dot, index) => {
      dot.classList.toggle("filled", index < level);
    });
    if (level) descriptions.push(`${item.name}: ${item.stages[level - 1]}`);
  }
  element("island-scene-description").textContent = descriptions.length
    ? descriptions.join(". ") + "." : "Pusta wyspa ze źródłem wody. Wybierz pierwszy element rozwoju.";
  element("island-season").hidden = islandState.order.length !== islandItems.length || islandState.finished;
  element("island-season").disabled = islandState.busy;
}

function startIsland() {
  cancelIslandMotion();
  islandState = { levels: emptyIslandLevels(), order: [], busy: false, finished: false };
  element("island-results").hidden = true;
  element("island-learning").replaceChildren();
  element("island-explanations").open = false;
  element("island-build-order").textContent = "";
  showScreen("island");
  renderIsland();
  element("island-status").textContent = "Wybierz pierwszy element. Każdy dodasz tylko raz.";
  element("island-title").focus({ preventScroll: true });
}

function finishIslandTurn() {
  const finishing = islandFinalSeason;
  cancelIslandMotion();
  if (element("island").hidden) return;
  if (finishing) {
    islandState.finished = true;
    showIslandResults();
  } else {
    element("island-status").textContent = islandState.order.length === islandItems.length
      ? "Wszystko dodane. Daj osadzie jeszcze jeden sezon."
      : "Wyspa się zmienia. Wybierz następny element.";
  }
  renderIsland();
  const next = islandState.finished ? element("island-result-title")
    : islandState.order.length === islandItems.length ? element("island-season")
      : islandItems.filter((item) => islandState.levels[item.id] === 0)
        .map((item) => element(`island-pick-${item.id}`)).find((button) => !button.disabled);
  if (islandState.finished || document.activeElement === document.body) next.focus({ preventScroll: true });
}

function runIslandTurn(grown, finishing, previous, added = null) {
  clearIslandEffects();
  islandFinalSeason = finishing;
  islandState.busy = islandCanAnimate();
  islandVisualLevels = islandState.busy ? { ...previous } : null;
  if (islandVisualLevels && added) islandVisualLevels[added] = 1;
  renderIsland();
  const names = grown.map((id) => islandItems.find((item) => item.id === id).name);
  element("island-status").textContent = names.length > 1
    ? `Reakcja łańcuchowa: ${names.join(" · ")}`
    : names.length ? `Rozwija się: ${names[0]}` : "Osada czeka na brakujące połączenia.";
  if (!finishing) playSound(grown.length > 1 ? "streak" : "correct");
  if (!islandState.busy) {
    finishIslandTurn();
    return;
  }
  if (added) animateIslandAsset(added);
  const steps = grown.filter((id) => islandState.levels[id] > islandVisualLevels[id]);
  steps.forEach((id, index) => {
    islandVisualTimers.push(window.setTimeout(() => {
      islandVisualLevels[id] = islandState.levels[id];
      renderIsland([id]);
      reactIslandAsset(id);
    }, 140 + index * 110));
  });
  islandTimer = window.setTimeout(finishIslandTurn, Math.max(500, 140 + (steps.length - 1) * 110 + 510));
}

function pickIslandItem(id) {
  if (element("island").hidden || islandState.busy) return;
  if (!islandItems.some((item) => item.id === id)) {
    notifyCourse("Nie rozpoznano wybranego elementu wyspy.");
    return;
  }
  if (islandState.levels[id] > 0) {
    inspectIslandItem(id);
    return;
  }
  if (islandState.finished) return;
  const previous = islandState.levels;
  const seeded = { ...previous, [id]: 1 };
  islandState.order.push(id);
  islandState.levels = growIsland(seeded);
  runIslandTurn(islandItems.filter((item) => islandState.levels[item.id] > previous[item.id]).map((item) => item.id), false, previous, id);
}

function playIslandSeason() {
  if (element("island").hidden || islandState.busy || islandState.finished ||
      islandState.order.length !== islandItems.length) return;
  const previous = islandState.levels;
  islandState.levels = growIsland(previous);
  runIslandTurn(islandItems.filter((item) => islandState.levels[item.id] > previous[item.id]).map((item) => item.id), true, previous);
}

function inspectIslandItem(id) {
  clearIslandEffects();
  const item = islandItems.find((other) => other.id === id);
  const level = islandState.levels[id];
  for (const other of islandItems) {
    element(`island-asset-${other.id}`).classList.toggle("inspected", other.id === id);
    element(`island-pick-${other.id}`).classList.toggle("inspected", other.id === id);
  }
  element("island-status").textContent = `${item.name} · ${level}/3: ${item.stages[level - 1]}.`;
  reactIslandAsset(id);
  playSound("click");
}

function showIslandResults() {
  const maxed = islandItems.filter((item) => islandState.levels[item.id] === 3).length;
  element("island-results").hidden = false;
  element("island-result-title").textContent = maxed === islandItems.length ? "Wyspa tętni życiem!" : "Twoja wyspa już żyje";
  element("island-result-score").textContent = `${maxed} / ${islandItems.length} na poziomie MAX`;
  element("island-status").textContent = maxed === islandItems.length
    ? "Wszystkie elementy rozwinęły się w pełni!" : "Inna kolejność może dać osadzie więcej czasu na rozwój.";
  element("island-build-order").textContent = islandState.order.map((id, index) =>
    `${index + 1}. ${islandItems.find((item) => item.id === id).name}`).join(" → ");
  for (const item of islandItems) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    const level = islandState.levels[item.id];
    summary.textContent = `${item.name} · ${level === 3 ? "MAX" : `${level}/3`} — ${item.stages[level - 1]}`;
    const explanation = document.createElement("p");
    annotateTerms(explanation, item.explanation, () => islandState.finished);
    details.append(summary, explanation);
    if (level < 3) {
      const needs = document.createElement("p");
      const missing = Object.entries(item.growth[level - 1])
        .filter(([id, minimum]) => islandState.levels[id] < minimum)
        .map(([id]) => islandItems.find((other) => other.id === id).name);
      needs.textContent = missing.length ? `Brakowało rozwinięcia: ${missing.join(", ")}.`
        : "Warunki są już gotowe, ale zabrakło kolejnego etapu. Spróbuj dodać ten element wcześniej.";
      details.append(needs);
    }
    const sources = document.createElement("div");
    sources.className = "feedback";
    for (const id of item.sources) {
      appendStudySources(sources, questionBank.find((question) => question.id === id), () => islandState.finished);
    }
    details.append(sources);
    element("island-learning").append(details);
  }
  playSound(maxed === islandItems.length ? "complete" : "finish");
  if (maxed === islandItems.length) celebrate();
}

element("island-open").addEventListener("click", startIsland);
element("island-reset").addEventListener("click", startIsland);
element("island-replay").addEventListener("click", startIsland);
element("island-season").addEventListener("click", playIslandSeason);
element("island-exit").addEventListener("click", () => {
  cancelIslandMotion();
  showScreen("welcome");
  element("island-scene").dataset.live = "false";
  element("island-open").focus();
});
element("island-motion").addEventListener("click", () => {
  islandMotionPaused = !islandMotionPaused;
  if (islandState.busy && !islandCanAnimate()) finishIslandTurn();
  else {
    clearIslandEffects();
    renderIsland();
  }
});
for (const item of islandItems) {
  element(`island-pick-${item.id}`).addEventListener("click", () => pickIslandItem(item.id));
}
motionPreference.addEventListener("change", () => {
  if (motionPreference.matches && islandState.busy) finishIslandTurn();
  if (!islandCanAnimate()) clearIslandEffects();
  renderIsland();
});
document.addEventListener("visibilitychange", () => {
  element("island-scene").dataset.live = String(islandCanAnimate() && !document.hidden && !element("island").hidden);
});
