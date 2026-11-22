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
let islandTurnMessage = "";

const islandRoutes = {
  irrigation: { type: "water", points: [[203, 185], [270, 202], [356, 185], [442, 182]] },
  river: { type: "water", points: [[202, 185], [246, 220], [285, 248], [326, 268]] },
  food: { type: "food", points: [[525, 226], [444, 251], [334, 309], [230, 339]] },
  tools: { type: "tools", points: [[205, 316], [183, 270], [209, 233], [232, 205]] },
  workshopDrive: { type: "gear", points: [[325, 269], [300, 292], [278, 316], [245, 329]] },
  generatorDrive: { type: "gear", points: [[350, 279], [389, 298], [427, 316], [462, 330]] },
  power: { type: "power", points: [[507, 326], [550, 292], [582, 302], [607, 319]] },
  message: { type: "message", points: [[607, 319], [589, 260], [575, 198], [578, 133]] },
  harvest: { type: "farmer", points: [[551, 215], [504, 189], [478, 202], [526, 227]] },
  wheelTools: { type: "tools", points: [[217, 327], [261, 313], [303, 289], [332, 266]] },
  lighting: { type: "power", points: [[499, 324], [398, 263], [276, 262], [156, 314]] },
};

function islandInteraction(id, level) {
  const interactions = {
    water: [
      { route: "irrigation", during: "Kanał doprowadza wodę do nowych pól…", result: "Woda płynie teraz również do upraw." },
      { route: "tools", during: "Rzemieślnik montuje regulator dopływu…", result: "Gotowe wrota pomagają regulować wodę." },
    ],
    crops: [
      { route: "irrigation", during: "Woda dociera do zasianego pola…", result: "Nawodnione nasiona wypuszczają kiełki!" },
      { route: "harvest", during: "Rolnik dogląda nawodnionych upraw…", result: "Zboże dojrzało. Osada ma zapasy żywności!" },
    ],
    workshop: [
      { route: "food", during: "Zapasy jadą do rzemieślników…", result: "Żywność pozwala mieszkańcom rozbudować warsztat." },
      { route: "workshopDrive", during: "Koło przekazuje ruch do warsztatu…", result: "Napęd dotarł. Młot zaczyna pracować!" },
    ],
    wheel: [
      { route: "river", during: "Strumień napiera na łopatki koła…", result: "Płynąca woda wprawia koło w ruch!" },
      { route: "wheelTools", during: "Z warsztatu docierają nowe części…", result: "Przekładnie mogą przekazać napęd dalej." },
    ],
    generator: [
      { route: "generatorDrive", during: "Koło napędza nową prądnicę…", result: "Prądnica ruszyła i wytwarza prąd!" },
      { route: "lighting", during: "Prąd płynie do zabudowań…", result: "W oknach warsztatu zapala się światło!" },
    ],
    telegraph: [
      { route: "power", during: "Prądnica zasila stanowisko telegrafu…", result: "Obwód działa. Można nadać sygnał!" },
      { route: "message", during: "Wiadomość biegnie do drugiej stacji…", result: "Wiadomość odebrana — druga stacja odpowiada!" },
    ],
  };
  return level >= 2 ? interactions[id][level - 2] : null;
}

function islandCanAnimate() {
  return !motionPreference.matches && !islandMotionPaused;
}

function clearIslandEffects() {
  for (const timer of islandVisualTimers) window.clearTimeout(timer);
  islandVisualTimers = [];
  for (const animation of islandAnimations) animation.cancel();
  islandAnimations = [];
  element("island-effects").replaceChildren();
  for (const item of element("island").querySelectorAll(".inspected, .receiving")) {
    item.classList.remove("inspected", "receiving");
  }
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

function sendIslandEffect(routeId, recipient) {
  if (!islandCanAnimate()) return;
  const route = islandRoutes[routeId];
  const token = document.createElementNS("http://www.w3.org/2000/svg", "g");
  token.classList.add("island-traveller");
  token.dataset.route = routeId;
  token.dataset.recipient = recipient;
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "use");
  icon.setAttribute("href", `#island-token-${route.type}`);
  icon.setAttribute("transform", "scale(1.25)");
  token.append(icon);
  element("island-effects").append(token);
  const animation = token.animate(route.points.map(([x, y], index) => ({
    transform: `translate(${x}px, ${y}px)`,
    opacity: index === 0 || index === route.points.length - 1 ? 0 : 1,
  })), { duration: 560, easing: "ease-in-out" });
  animation.onfinish = () => token.remove();
  islandAnimations.push(animation);
}

function reactIslandAsset(id, levels = islandState.levels) {
  animateIslandAsset(id);
  const interaction = islandInteraction(id, levels[id]);
  if (interaction) sendIslandEffect(interaction.route, id);
}

function cancelIslandMotion() {
  window.clearTimeout(islandTimer);
  islandTimer = undefined;
  islandState.busy = false;
  islandFinalSeason = false;
  islandVisualLevels = null;
  clearIslandEffects();
  element("island-scene").dataset.busy = "false";
  element("island-scene").dataset.phase = "idle";
}

function renderIsland(grown = []) {
  const levels = islandVisualLevels ?? islandState.levels;
  const completed = islandItems.filter((item) => levels[item.id] === 3).length;
  element("island-count").textContent = `Dodane: ${islandState.order.length} / ${islandItems.length}`;
  element("island-level-count").textContent = `Rozwinięte: ${completed} / ${islandItems.length}`;
  element("island-scene").dataset.busy = String(islandState.busy);
  element("island-scene").dataset.live = String(islandCanAnimate() && !document.hidden && !element("island").hidden);
  element("island-scene").dataset.powered = String(levels.generator >= 2);
  element("island-scene").dataset.gridReady = String(levels.generator >= 3);
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
  islandTurnMessage = "";
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
      : islandTurnMessage || "Wyspa się zmienia. Wybierz następny element.";
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
  const item = islandItems.find((other) => other.id === added);
  islandTurnMessage = item ? `${item.name}: ${item.stages[0]}.` : "Osada czeka na brakujące połączenia.";
  element("island-status").textContent = item ? `Najpierw pojawia się: ${item.name}.` : "Zobaczmy efekty ostatniego sezonu.";
  if (!finishing) playSound("click");
  if (!islandState.busy) {
    const last = grown.map((id) => islandInteraction(id, islandState.levels[id])).filter(Boolean).at(-1);
    if (last) islandTurnMessage = last.result;
    finishIslandTurn();
    return;
  }
  element("island-scene").dataset.phase = added ? "placing" : "waiting";
  if (added) animateIslandAsset(added);
  const steps = grown.filter((id) => islandState.levels[id] > islandVisualLevels[id]);
  const placementDelay = added ? 520 : 160;
  steps.forEach((id, index) => {
    const arrival = placementDelay + index * 800 + 560;
    const interaction = islandInteraction(id, islandState.levels[id]);
    islandVisualTimers.push(window.setTimeout(() => {
      element("island-scene").dataset.phase = "interacting";
      element(`island-asset-${id}`).classList.add("receiving");
      element("island-status").textContent = interaction.during;
      sendIslandEffect(interaction.route, id);
    }, placementDelay + index * 800));
    islandVisualTimers.push(window.setTimeout(() => {
      element("island-scene").dataset.phase = "result";
      islandVisualLevels[id] = islandState.levels[id];
      renderIsland([id]);
      element(`island-asset-${id}`).classList.remove("receiving");
      animateIslandAsset(id);
      islandTurnMessage = interaction.result;
      element("island-status").textContent = interaction.result;
      if (id === added) playSound("correct");
    }, arrival));
  });
  islandTimer = window.setTimeout(finishIslandTurn,
    steps.length ? placementDelay + (steps.length - 1) * 800 + 970 : 520);
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
