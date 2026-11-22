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
  irrigation: { kind: "flow", points: [[220, 254], [262, 277], [367, 242], [409, 259]] },
  river: { kind: "flow", points: [[220, 254], [282, 285], [316, 329], [324, 350]] },
  food: { kind: "worker", carry: "food", points: [[481, 300], [420, 334], [300, 386], [228, 400]] },
  tools: { kind: "worker", carry: "tools", points: [[205, 390], [253, 340], [242, 290], [260, 260]] },
  workshopDrive: { kind: "drive", points: [[324, 345], [307, 362], [285, 374], [270, 375]] },
  generatorDrive: { kind: "drive", points: [[346, 360], [366, 376], [390, 385], [410, 385]] },
  power: { kind: "current", points: [[445, 381], [478, 352], [508, 347], [535, 367]] },
  message: { kind: "current", points: [[535, 304], [554, 250], [539, 195], [510, 165]] },
  harvest: { kind: "worker", carry: "food", points: [[503, 300], [458, 265], [424, 270], [482, 298]] },
  wheelTools: { kind: "worker", carry: "tools", points: [[210, 390], [270, 385], [309, 376], [324, 365]] },
  lighting: { kind: "current", points: [[443, 380], [360, 313], [255, 332], [160, 349]] },
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
  element("island-scene").dataset.action = "";
  for (const item of element("island").querySelectorAll(".inspected, .receiving")) {
    item.classList.remove("inspected", "receiving");
  }
}

function animateIslandAsset(id) {
  if (!islandCanAnimate()) return;
  const body = element(`island-asset-${id}`).querySelector(".island-grow-body");
  islandAnimations.push(body.animate([
    { transform: "translateY(-58px) scale(.82)", opacity: 0 },
    { transform: "translateY(4px) scale(1.03)", opacity: 1, offset: 0.7 },
    { transform: "translateY(0) scale(1)" },
  ], { duration: 420, easing: "ease-out" }));
}

function sendIslandEffect(routeId, recipient) {
  if (!islandCanAnimate()) return;
  const route = islandRoutes[routeId];
  const svg = (tag) => document.createElementNS("http://www.w3.org/2000/svg", tag);
  const action = svg("g");
  action.classList.add("island-action");
  action.dataset.route = routeId;
  action.dataset.recipient = recipient;
  action.dataset.kind = route.kind;
  element("island-effects").append(action);
  element("island-scene").dataset.action = routeId;
  if (route.kind === "worker") {
    const pose = svg("g");
    pose.classList.add("island-person-pose");
    const person = svg("use");
    person.setAttribute("href", "#island-resident");
    person.setAttribute("x", "-23");
    person.setAttribute("y", "-78");
    person.setAttribute("width", "46");
    person.setAttribute("height", "78");
    const cargo = svg("use");
    cargo.setAttribute("href", `#island-token-${route.carry}`);
    cargo.classList.add("island-hand-tool");
    const holder = svg("g");
    holder.setAttribute("transform", route.carry === "food" ? "translate(25 -3)" : "translate(20 -29)");
    holder.append(cargo);
    pose.append(person, holder);
    action.append(pose);
    action.classList.add("walking");
    const frames = route.points.map(([x, y], index) => ({
      transform: `translate(${x}px, ${y}px)`, offset: index * 0.22,
    }));
    const [x, y] = route.points.at(-1);
    frames.push({ transform: `translate(${x}px, ${y}px)`, offset: 1 });
    islandAnimations.push(action.animate(frames, { duration: 560, fill: "forwards", easing: "ease-in-out" }));
    islandVisualTimers.push(window.setTimeout(() => {
      action.classList.remove("walking");
      action.classList.add("working");
    }, 370));
  } else {
    const path = svg("path");
    path.setAttribute("d", route.points.map(([x, y], index) => `${index ? "L" : "M"}${x} ${y}`).join(" "));
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke", route.kind === "flow" ? "#8deaf0" : route.kind === "drive" ? "#ad8351" : "#ffe67d");
    path.setAttribute("stroke-width", route.kind === "flow" ? "13" : route.kind === "drive" ? "8" : "5");
    action.append(path);
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length} ${length}`;
    islandAnimations.push(path.animate([
      { strokeDashoffset: length }, { strokeDashoffset: 0 },
    ], { duration: 560, fill: "forwards", easing: "ease-in-out" }));
    if (route.kind === "drive") {
      const bearing = svg("g");
      const [x, y] = route.points.at(-1);
      bearing.setAttribute("transform", `translate(${x} ${y})`);
      const gear = svg("use");
      gear.setAttribute("href", "#island-token-gear");
      gear.classList.add("island-contact-gear");
      bearing.append(gear);
      action.append(bearing);
    }
  }
  islandVisualTimers.push(window.setTimeout(() => action.remove(), 950));
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
    const hotspot = element("island-scene").querySelector(`[data-island-inspect="${item.id}"]`);
    hotspot.hidden = level === 0;
    hotspot.disabled = islandState.busy;
    hotspot.setAttribute("aria-label", `${item.name}: ${level ? item.stages[level - 1] : "jeszcze nie dodano"}. Obejrzyj działanie.`);
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
for (const button of element("island-scene").querySelectorAll("[data-island-inspect]")) {
  button.dataset.feedbackSound = "";
  button.addEventListener("click", () => {
    if (!islandState.busy) inspectIslandItem(button.dataset.islandInspect);
  });
}
motionPreference.addEventListener("change", () => {
  if (motionPreference.matches && islandState.busy) finishIslandTurn();
  if (!islandCanAnimate()) clearIslandEffects();
  renderIsland();
});
document.addEventListener("visibilitychange", () => {
  element("island-scene").dataset.live = String(islandCanAnimate() && !document.hidden && !element("island").hidden);
});
