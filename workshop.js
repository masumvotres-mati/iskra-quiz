"use strict";

let lockState = { boat: "start", level: "low", leftOpen: true, rightOpen: false, busy: false, complete: false };
let lockTimer;
let lockFocusTarget;

function cancelLockMotion() {
  window.clearTimeout(lockTimer);
  lockTimer = undefined;
  lockFocusTarget = null;
  lockState.busy = false;
  element("lock-scene").dataset.busy = "false";
  element("lock-scene").dataset.flow = "";
}

function lockMessage(message, warning = false) {
  element("lock-status").textContent = message;
  element("lock-status").classList.toggle("warning", warning);
}

function renderLock() {
  const waterY = lockState.level === "low" ? 220 : 140;
  const boatX = lockState.boat === "start" ? 95 : lockState.boat === "chamber" ? 320 : 550;
  const boatY = lockState.boat === "start" ? 220 : lockState.boat === "chamber" ? waterY : 140;
  element("lock-chamber-water").style.transform = `translateY(${waterY}px)`;
  element("lock-boat").style.transform = `translate(${boatX}px, ${boatY}px)`;
  element("lock-left-gate").style.opacity = lockState.leftOpen ? "0.12" : "1";
  element("lock-right-gate").style.opacity = lockState.rightOpen ? "0.12" : "1";
  element("lock-scene").dataset.busy = String(lockState.busy);
  element("workshop").classList.toggle("is-complete", lockState.complete);
  element("lock-controls").setAttribute("aria-busy", String(lockState.busy));
  for (const button of element("lock-controls").querySelectorAll("button")) {
    button.disabled = lockState.busy || lockState.complete;
    button.classList.remove("recommended");
  }
  for (const side of ["left", "right"]) {
    const open = lockState[`${side}Open`];
    element(`lock-${side}-state`).textContent = open ? "Otwarte · zamknij" : "Zamknięte · otwórz";
    element(`lock-${side}`).setAttribute("aria-label",
      `${side === "left" ? "Lewe" : "Prawe"} wrota: ${open ? "otwarte. Zamknij" : "zamknięte. Otwórz"}`);
  }
  element("lock-water-state").textContent = lockState.level === "low" ? "Napełnij komorę" : "Opróżnij komorę";
  element("lock-water").setAttribute("aria-label", element("lock-water-state").textContent);
  element("lock-sail-state").textContent = lockState.boat === "start" ? "Wpłyń do komory"
    : lockState.complete ? "Na miejscu!" : "Wypłyń na górę";
  element("lock-sail").setAttribute("aria-label", element("lock-sail-state").textContent);
  element("lock-hint").disabled = lockState.busy || lockState.complete;
  const stage = lockState.boat === "start" ? 0 : lockState.boat === "chamber"
    ? lockState.level === "low" ? 1 : 2 : 3;
  Array.from(element("lock-stages").children).forEach((item, index) => {
    item.classList.toggle("done", index < stage);
    if (index === stage) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  });
  const boatDescription = lockState.boat === "start" ? "przed śluzą w dolnym kanale"
    : lockState.boat === "chamber" ? "w komorze" : "w górnym kanale, u celu";
  element("lock-scene-description").textContent = `Statek jest ${boatDescription}. Poziom wody w komorze: ${lockState.level === "low" ? "niski" : "wysoki"}. Lewe wrota ${lockState.leftOpen ? "otwarte" : "zamknięte"}, prawe ${lockState.rightOpen ? "otwarte" : "zamknięte"}.${lockState.busy ? " Trwa ruch mechanizmu." : ""}`;
}

function startWorkshop() {
  cancelLockMotion();
  lockState = { boat: "start", level: "low", leftOpen: true, rightOpen: false, busy: false, complete: false };
  element("lock-success").hidden = true;
  element("lock-learning").open = false;
  element("lock-source").replaceChildren();
  showScreen("workshop");
  renderLock();
  lockMessage("Wpłyń statkiem do komory.");
  element("workshop-title").focus({ preventScroll: true });
}

function finishLockMotion(message) {
  const focusTarget = lockFocusTarget;
  cancelLockMotion();
  if (element("workshop").hidden) return;
  if (lockState.boat === "finish") {
    lockState.complete = true;
    element("lock-success").hidden = false;
    const explanation = document.createElement("p");
    annotateTerms(explanation, "Przy zamkniętych wrotach woda z wyższego odcinka napływa do komory i unosi statek. Po wyrównaniu poziomów można otworzyć górne wrota i wypłynąć.", () => lockState.complete);
    element("lock-source").append(explanation);
    appendStudySources(element("lock-source"), questionBank.find((item) => item.id === "history-24"), () => lockState.complete);
    lockMessage("Udało się! Statek dotarł na wyższy poziom.");
    playSound("complete");
    celebrate();
    element("lock-success-title").focus({ preventScroll: true });
  } else {
    lockMessage(message);
    playSound("correct");
  }
  renderLock();
  if (!lockState.complete && focusTarget && document.activeElement === document.body) {
    focusTarget.focus({ preventScroll: true });
  }
}

function lockAction(action) {
  if (element("workshop").hidden || lockState.busy || lockState.complete) return;
  let message;
  let duration = 180;
  let warning;
  let flow = "";
  if (action === "left") {
    if (!lockState.leftOpen && lockState.level !== "low") {
      warning = "Poziomy są różne. Najpierw opróżnij komorę.";
    } else {
      lockState.leftOpen = !lockState.leftOpen;
      message = lockState.leftOpen ? "Lewe wrota otwarte." : "Lewe wrota zamknięte.";
    }
  } else if (action === "right") {
    if (!lockState.rightOpen && lockState.level !== "high") {
      warning = "Najpierw wyrównaj wodę w komorze z górnym kanałem.";
    } else {
      lockState.rightOpen = !lockState.rightOpen;
      message = lockState.rightOpen ? "Prawe wrota otwarte." : "Prawe wrota zamknięte.";
    }
  } else if (action === "water") {
    if (lockState.leftOpen || lockState.rightOpen) {
      warning = "Najpierw zamknij wrota po obu stronach.";
    } else {
      lockState.level = lockState.level === "low" ? "high" : "low";
      flow = lockState.level === "high" ? "in" : "out";
      duration = 900;
      message = lockState.level === "high" ? "Poziom wyrównany z górnym kanałem." : "Poziom wyrównany z dolnym kanałem.";
    }
  } else if (action === "sail") {
    if (lockState.boat === "start") {
      if (!lockState.leftOpen || lockState.level !== "low") {
        warning = "Do wpłynięcia potrzebujesz otwartych lewych wrót i niskiej wody.";
      } else {
        lockState.boat = "chamber";
        message = "Statek w komorze. Zamknij za nim lewe wrota.";
      }
    } else if (lockState.level !== "high") {
      warning = "Podnieś wodę w komorze do górnego poziomu.";
    } else if (!lockState.rightOpen) {
      warning = "Poziomy są równe. Otwórz prawe wrota.";
    } else {
      lockState.boat = "finish";
      message = "Statek dotarł do celu.";
    }
    duration = 700;
  } else {
    warning = "Nie rozpoznano wybranego działania.";
  }
  if (warning) {
    lockMessage(warning, true);
    playSound("incorrect");
    return;
  }
  duration = motionPreference.matches ? 0 : duration;
  lockFocusTarget = document.activeElement === element(`lock-${action}`) ? document.activeElement : null;
  lockState.busy = duration > 0;
  element("lock-scene").style.setProperty("--lock-duration", `${duration}ms`);
  element("lock-scene").dataset.flow = flow;
  renderLock();
  if (duration === 0) {
    finishLockMotion(message);
  } else {
    lockMessage(flow === "in" ? "Woda napływa…" : flow === "out" ? "Woda odpływa…" : "Mechanizm pracuje…");
    playSound("click");
    lockTimer = window.setTimeout(() => finishLockMotion(message), duration);
  }
}

function showLockHint() {
  if (element("workshop").hidden || lockState.busy || lockState.complete) return;
  let action;
  let message;
  if (lockState.boat === "start") {
    if (lockState.level === "high") {
      action = lockState.rightOpen ? "right" : "water";
      message = lockState.rightOpen ? "Zamknij prawe wrota, żeby móc opróżnić komorę." : "Opróżnij komorę, żeby zrównać ją z dolnym kanałem.";
    } else {
      action = lockState.leftOpen ? "sail" : "left";
      message = lockState.leftOpen ? "Statek może teraz wpłynąć do komory." : "Otwórz lewe wrota, aby wpuścić statek.";
    }
  } else if (lockState.leftOpen) {
    action = "left";
    message = "Zamknij lewe wrota za statkiem.";
  } else if (lockState.level === "low") {
    action = "water";
    message = "Napełnij komorę wodą z górnego kanału.";
  } else {
    action = lockState.rightOpen ? "sail" : "right";
    message = lockState.rightOpen ? "Droga wolna — wypłyń na górę!" : "Woda jest wyrównana. Otwórz prawe wrota.";
  }
  for (const button of element("lock-controls").querySelectorAll("button")) button.classList.remove("recommended");
  element(`lock-${action}`).classList.add("recommended");
  lockMessage(message);
}

element("workshop-open").addEventListener("click", startWorkshop);
element("lock-reset").addEventListener("click", startWorkshop);
element("workshop-exit").addEventListener("click", () => {
  cancelLockMotion();
  showScreen("welcome");
  element("workshop-open").focus();
});
for (const action of ["left", "right", "water", "sail"]) {
  element(`lock-${action}`).addEventListener("click", () => lockAction(action));
}
element("lock-hint").addEventListener("click", showLockHint);
motionPreference.addEventListener("change", () => {
  if (motionPreference.matches && lockState.busy) finishLockMotion("Mechanizm gotowy.");
});
