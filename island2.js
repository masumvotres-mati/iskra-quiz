"use strict";

let island2State;
let island2Visual;
let island2Story;
let island2Queue = [];
let island2Current;
let island2Timer;
let island2Paused = false;
let island2Skipping = false;

function island2CanAnimate() {
  return !motionPreference.matches && !island2Paused && !island2Skipping && !document.hidden;
}

function island2Context() {
  return { levels: island2Visual, branches: island2State.branches, story: island2Story,
    placed: island2State.placed, turn: island2State.order.length, busy: island2State.busy,
    finished: island2State.finished, live: island2CanAnimate() && !element("island2").hidden };
}

function island2Stage(id, level) {
  const item = island2Items.find((candidate) => candidate.id === id);
  return island2Track(item, island2State.branches).stages[level - 1];
}

function inspectIsland2(id) {
  const key = id === "crate" || id === "lid" ? "timber" : id;
  const item = island2Items.find((candidate) => candidate.id === key);
  if (!item || !island2State.levels[key] || island2State.busy) return;
  const progress = island2Preparation(item, island2State.levels, island2State.placed,
    island2State.order.length, island2State.branches);
  const clue = progress?.total && progress.done < progress.total
    ? ` Przygotowanie: ${progress.done}/${progress.total}. Każdy wybór daje czas na dalszą pracę.`
    : progress && !progress.ready ? " Dalsza praca wymaga współpracy z innymi przedmiotami." : "";
  element("island2-status").textContent = `${item.name}: ${island2Stage(key, island2State.levels[key])}.${clue}`;
  playSound("click");
}

function renderIsland2() {
  const scene = element("island2-scene");
  scene.dataset.live = String(island2CanAnimate() && !element("island2").hidden);
  scene.dataset.action = island2Current?.scene || island2Current?.action || island2Current?.kind || "";
  element("island2-count").textContent = `${island2State.order.length} / 8`;
  element("island2-controls").setAttribute("aria-busy", String(island2State.busy));
  for (const item of island2Items) {
    const button = element(`island2-pick-${item.id}`);
    const level = island2Visual[item.id];
    const track = island2Track(item, island2State.branches);
    button.disabled = island2State.busy || !island2Renderer.ready;
    button.classList.toggle("placed", level > 0);
    button.classList.toggle("maxed", level === track.stages.length);
    button.querySelector("small").textContent = !level ? "Dodaj"
      : `${island2State.order.indexOf(item.id) + 1} · ${level === track.stages.length ? "MAX" : `${level}/${track.stages.length}`}`;
    button.setAttribute("aria-label", level ? `${item.name}: ${island2Stage(item.id, level)}. Obejrzyj.` : `Dodaj: ${item.name}`);
  }
  element("island2-skip").hidden = !island2State.busy;
  element("island2-look").disabled = !island2Renderer.ready;
  element("island2-motion").setAttribute("aria-pressed", String(island2Paused));
  element("island2-motion").textContent = island2Paused ? "Wznów animacje" : "Pauza animacji";
  if (island2Renderer.ready) island2Renderer.sync(island2Context());
  if (!element("island2").hidden) setIslandMusicStage(island2Visual.copper >= 3 || island2Story.sailing || island2Story.tradeDone ? 2 : island2Visual.wheel >= 2 ? 1 : 0);
}

function island2StartStep(step) {
  element("island2-status").textContent = step.text;
  const result = island2Cinema.start(step);
  if (typeof result === "number") step.duration = result;
  renderIsland2();
}

function island2CommitStep(step, silent = false) {
  island2Renderer.finishStep(silent);
  island2Cinema.commit(step);
  if (step.level) {
    island2Visual[step.id] = step.level;
    if (step.id === "lamp" && step.level >= 2) island2Story.boatSeen = true;
  }
  island2Current = undefined;
  renderIsland2();
}

function island2Pump() {
  island2Timer = undefined;
  while (island2Queue.length) {
    const step = island2Queue.shift();
    island2Current = step;
    island2StartStep(step);
    if (island2CanAnimate()) {
      island2Timer = window.setTimeout(() => {
        island2CommitStep(step);
        island2Pump();
      }, step.duration || 300);
      return;
    }
    island2CommitStep(step, true);
  }
  island2State.busy = false;
  island2Skipping = false;
  renderIsland2();
  if (island2State.order.length === 8) finishIsland2();
  else element("island2-status").textContent = "Co dodasz teraz? Dotknij użytego przedmiotu, aby go obejrzeć.";
}

function island2Skip() {
  if (!island2State?.busy) return;
  window.clearTimeout(island2Timer);
  island2Timer = undefined;
  island2Skipping = true;
  if (island2Current) island2CommitStep(island2Current, true);
  island2Pump();
}

function pickIsland2(id) {
  if (element("island2").hidden || island2State.busy || !island2Renderer.ready) return;
  const item = island2Items.find((candidate) => candidate.id === id);
  if (!item) { notifyCourse("Nie rozpoznano przedmiotu wyspy."); return; }
  if (island2State.levels[id]) { inspectIsland2(id); return; }
  if (island2State.finished) return;
  const previous = { ...island2State.levels };
  island2State.branches = island2BranchOnPlacement(previous, island2State.branches, id);
  island2State.order.push(id);
  island2State.placed[id] = island2State.order.length;
  const seeded = { ...previous, [id]: 1 };
  const result = advanceIsland2(seeded, island2State.placed, island2State.order.length, island2State.branches);
  island2State.levels = result.levels;
  island2State.busy = true;
  island2Queue = island2Cinema.turn(id, previous, result);
  renderIsland2();
  island2Pump();
}

function island2BranchHint(id) {
  if (id === "seeds" && island2State.branches.seeds === "pond") return "Nasiona trafiły na już zalaną grządkę. Powstał staw zamiast pola. Zmień kolejność zasiewu i doprowadzenia wody.";
  if (id === "wheel" && island2State.branches.wheel === "pottery") return "Krążek trafił do już działającej pracowni. Garncarz zatrzymał go dla siebie. Żeby posłużył za napęd, musi wcześniej dostać inne zadanie.";
  return "";
}

function finishIsland2() {
  if (island2State.finished) return;
  island2State.finished = true;
  const levels = island2State.levels;
  const full = island2Story.ending === "beacon";
  const maxed = island2Items.filter((item) => levels[item.id] === island2Track(item, island2State.branches).stages.length).length;
  const late = island2Items.filter((item) => {
    if (island2BranchHint(item.id)) return false;
    const rule = island2Track(item, island2State.branches).growth[levels[item.id] - 1];
    return rule && 8 - island2State.placed[item.id] < rule.age && island2NeedsReady(levels, rule.needs, island2State.branches);
  }).map((item) => item.name);
  element("island2-results").hidden = false;
  element("island2-result-title").textContent = island2Story.tradeDone
    ? island2Story.leafSail ? "Żeglujący ogrodnicy" : island2Story.craftKind === "leaf" ? "Ogród wypłynął w świat!" : "Mała wyprawa garncarzy"
    : full ? "Witaj w Porcie Świetlików!"
      : island2Story.ending === "pond" ? levels.seeds >= 2 ? "Wyspa lilii wodnych" : "Wyspa małego stawu"
        : island2Story.ending === "pottery" ? "Osada garncarzy" : island2Story.ending === "light" ? "Światło to nie wszystko"
          : levels.wheel === 1 ? "Herbaciarnia na Skale" : "Wyspa małych rzemieślników";
  const advice = island2Story.tradeDone ? "Niezwykła wyprawa wróciła z nowymi nasionami. Inna kolejność tworzy inną historię."
    : full ? "Woda, praca mieszkańców, napęd i światło złożyły się w jedną działającą wyspę."
      : island2BranchHint("seeds") || island2BranchHint("wheel") ||
        (late.length ? `Wcześniej dodaj: ${late.join(", ")}. Pozostałe przedmioty czekały na ich rozwój.`
          : "Sprawdź odkryte połączenia poniżej.");
  element("island2-result-text").textContent = `${maxed} / 8 elementów w pełni rozwiniętych. ${advice}`;
  element("island2-order").textContent = island2State.order.map((id) => island2Items.find((item) => item.id === id).name).join(" → ");
  element("island2-status").textContent = island2Story.tradeDone ? "Podarunek dotarł. Teraz ogrodnik ma nowy pomysł!"
    : full ? "Statek w porcie, dostawa na górze. Udało się!" : "Ta wyspa znalazła inne zastosowania.";
  for (const item of island2Items) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    const level = levels[item.id];
    const track = island2Track(item, island2State.branches);
    summary.textContent = `${item.name} · ${level}/${track.stages.length} — ${island2Stage(item.id, level)}`;
    const explanation = document.createElement("p");
    annotateTerms(explanation, item.explanation, () => island2State.finished);
    details.append(summary, explanation);
    if (level < track.stages.length) {
      const rule = track.growth[level - 1];
      const missing = Object.entries(rule.needs).filter(([id, minimum]) => !island2NeedsReady(levels, { [id]: minimum }, island2State.branches))
        .map(([id, minimum]) => id === "wheel" && minimum >= 2 && island2State.branches.wheel === "pottery"
          ? "napęd wodny (krążek został kołem garncarskim)" : id === "seeds" && minimum >= 3 && island2State.branches.seeds === "pond"
            ? "zapasy zboża (zamiast pola powstał staw)" : island2Items.find((other) => other.id === id).name);
      const hint = document.createElement("p");
      hint.textContent = island2BranchHint(item.id) || (missing.length ? `Nie były jeszcze gotowe: ${missing.join(", ")}.`
        : "Warunki są już gotowe, ale ten przedmiot trafił na wyspę zbyt późno.");
      details.append(hint);
    }
    for (const source of item.sources) {
      const panel = document.createElement("div");
      panel.className = "feedback";
      appendStudySources(panel, questionBank.find((question) => question.id === source), () => island2State.finished);
      details.append(panel);
    }
    element("island2-learning").append(details);
  }
  if (full) celebrate();
  else if (!document.hidden) playSound(island2Story.tradeDone ? "complete" : "finish");
  renderIsland2();
  element("island2-result-title").focus({ preventScroll: true });
}

function cancelIsland2() {
  window.clearTimeout(island2Timer);
  island2Timer = undefined;
  island2Queue = [];
  island2Current = undefined;
  island2Renderer.cancel();
}

function startIsland2() {
  cancelIsland2();
  stopIslandMusic();
  setIslandMusicStage(0);
  island2Skipping = false;
  island2State = { levels: emptyIsland2Levels(), placed: {}, order: [], branches: { seeds: "field", wheel: "drive" }, busy: false, finished: false };
  island2Visual = emptyIsland2Levels();
  island2Story = island2Cinema.newStory();
  element("island2-results").hidden = true;
  element("island2-explanations").open = false;
  element("island2-learning").replaceChildren();
  showScreen("island2");
  if (island2Renderer.mount(inspectIsland2, () => {
    cancelIsland2();
    renderIsland2();
  })) island2Renderer.reset(island2Context());
  renderIsland2();
  element("island2-status").textContent = island2Renderer.ready
    ? "Osiem drobiazgów. Od czego zaczną mieszkańcy?" : "Grafika 3D jest niedostępna. Możesz wrócić do pozostałych gier.";
  element("island2-title").focus({ preventScroll: true });
}

for (const item of island2Items) {
  const button = document.createElement("button");
  button.id = `island2-pick-${item.id}`;
  button.type = "button";
  button.dataset.feedbackSound = "";
  button.innerHTML = `<svg viewBox="0 0 32 34" aria-hidden="true" fill="none" stroke="#56786a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${item.icon}</svg><span>${item.name}</span><small>Dodaj</small>`;
  button.addEventListener("click", () => pickIsland2(item.id));
  element("island2-controls").append(button);
}
for (const id of ["open", "reset", "replay"]) element(`island2-${id}`).addEventListener("click", startIsland2);
element("island2-skip").addEventListener("click", island2Skip);
element("island2-look").addEventListener("click", () => island2Renderer.cameraReset());
element("island2-exit").addEventListener("click", () => {
  showScreen("welcome");
  element("island2-open").focus();
});
element("island2-motion").addEventListener("click", () => {
  island2Paused = !island2Paused;
  if (island2Paused) island2Skip();
  renderIsland2();
});
document.addEventListener("iskra-screen-change", (event) => {
  if (!island2State || event.detail === "island2") return;
  cancelIsland2();
  island2State.busy = false;
});
document.addEventListener("visibilitychange", () => {
  if (!island2State || element("island2").hidden) return;
  if (document.hidden) island2Skip();
  renderIsland2();
});
motionPreference.addEventListener("change", () => {
  if (!island2State) return;
  if (motionPreference.matches) island2Skip();
  renderIsland2();
});
