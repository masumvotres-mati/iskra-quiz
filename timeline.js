"use strict";

const timelineEvents = [
  [1712, "Maszyna parowa Newcomena rozpoczyna pracę", 33],
  [1733, "Latające czółenko Johna Kaya", 28],
  [1779, "Maszyna przędzalnicza Samuela Cromptona", 29],
  [1800, "Bateria elektryczna Alessandra Volty", 37],
  [1804, "Lokomotywa Trevithicka na walijskiej kolejce", 76],
  [1807, "Regularne rejsy parostatku Fultona po Hudsonie", 35],
  [1830, "Otwarcie kolei Liverpool–Manchester", 78],
  [1831, "Badania Faradaya nad indukcją elektromagnetyczną", 38],
  [1853, "Lampa naftowa Łukasiewicza", 45],
  [1863, "Otwarcie londyńskiej kolei podziemnej", 42],
  [1867, "Dynamit Alfreda Nobla", 41],
  [1876, "Telefon Alexandra Grahama Bella", 46],
  [1882, "Elektrownia miejska Edisona w Nowym Jorku", 83],
  [1903, "Samolot braci Wright z silnikiem", 53],
  [1913, "Taśmowa produkcja samochodów w zakładach Forda", 55],
  [1942, "Uruchomienie reaktora Fermiego w Chicago", 113],
  [1947, "Bell X-1 przekracza prędkość dźwięku", 102],
  [1952, "Comet w regularnej komunikacji pasażerskiej", 101],
  [1961, "Lot człowieka na orbitę w Wostoku 1", 116],
  [1969, "Pierwsze kroki człowieka na Księżycu", 117],
].map(([year, title, number]) => ({
  year, title, questionId: `history-${number}`,
}));

const timelineRoundLength = 5;
let timelineQueue = [];
let timelinePlaced = [];
let timelineIndex = 0;
let timelineScore = 0;
let timelineAnswered = false;

function startTimeline() {
  const pack = shuffled(timelineEvents).slice(0, timelineRoundLength + 1);
  timelinePlaced = [pack[0]];
  timelineQueue = pack.slice(1);
  timelineIndex = 0;
  timelineScore = 0;
  showScreen("timeline");
  renderTimelineRound();
  element("timeline-title").focus({ preventScroll: true });
}

function timelineCard(event, isNew = false) {
  const item = document.createElement("li");
  item.className = `timeline-card${isNew ? " just-placed" : ""}`;
  const date = document.createElement("strong");
  date.className = "timeline-card-year";
  date.textContent = String(event.year);
  const title = document.createElement("span");
  annotateTerms(title, event.title, () => true);
  item.append(date, title);
  if (isNew) {
    const label = document.createElement("small");
    label.textContent = "Właściwe miejsce tej karty";
    item.append(label);
  }
  return item;
}

function timelineSlotLabel(index) {
  const before = timelinePlaced[index - 1];
  const after = timelinePlaced[index];
  return !before ? `Przed ${after.year}` : !after ? `Po ${before.year}` : `Między ${before.year} a ${after.year}`;
}

function renderTimelineBoard() {
  const board = element("timeline-board");
  board.replaceChildren();
  for (let index = 0; index <= timelinePlaced.length; index += 1) {
    if (!timelineAnswered) {
      const slot = document.createElement("li");
      slot.className = "timeline-slot";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "timeline-place";
      button.textContent = `＋ ${timelineSlotLabel(index)}`;
      const before = timelinePlaced[index - 1];
      const after = timelinePlaced[index];
      button.setAttribute("aria-label", !before ? `Umieść przed: ${after.title}, ${after.year}`
        : !after ? `Umieść po: ${before.title}, ${before.year}`
          : `Umieść między: ${before.title}, ${before.year}, a ${after.title}, ${after.year}`);
      button.addEventListener("click", () => placeTimelineEvent(index));
      slot.append(button);
      board.append(slot);
    }
    if (index < timelinePlaced.length) {
      board.append(timelineCard(timelinePlaced[index],
        timelineAnswered && timelinePlaced[index] === timelineQueue[timelineIndex]));
    }
  }
}

function updateTimelineProgress() {
  const completed = timelineIndex + Number(timelineAnswered);
  element("timeline-score").textContent = `Punkty: ${timelineScore}`;
  element("timeline-progress").setAttribute("aria-valuemax", String(timelineQueue.length));
  element("timeline-progress").setAttribute("aria-valuenow", String(completed));
  element("timeline-progress-fill").style.width = `${completed / timelineQueue.length * 100}%`;
}

function renderTimelineRound() {
  closeGlossary();
  timelineAnswered = false;
  const current = timelineQueue[timelineIndex];
  element("timeline-count").textContent = `Karta ${timelineIndex + 1} z ${timelineQueue.length}`;
  annotateTerms(element("timeline-current"), current.title, () => timelineAnswered);
  element("timeline-year").textContent = "Rok: ?";
  element("timeline-target").classList.remove("revealed");
  element("timeline-verdict").replaceChildren();
  element("timeline-verdict").className = "feedback";
  element("timeline-source").replaceChildren();
  element("timeline-next").disabled = true;
  element("timeline-next").textContent = timelineIndex === timelineQueue.length - 1
    ? "Zobacz swoją oś →" : "Następna karta →";
  updateTimelineProgress();
  renderTimelineBoard();
}

function placeTimelineEvent(index) {
  if (element("timeline").hidden || timelineAnswered) return;
  if (!Number.isInteger(index) || index < 0 || index > timelinePlaced.length) {
    notifyCourse("Nie można wybrać tego miejsca na osi czasu.");
    return;
  }
  const current = timelineQueue[timelineIndex];
  const correctIndex = timelinePlaced.filter((event) => event.year < current.year).length;
  const selectedPosition = timelineSlotLabel(index);
  const correctPosition = timelineSlotLabel(correctIndex);
  timelineAnswered = true;
  const correct = index === correctIndex;
  if (correct) timelineScore += 1;
  playSound(correct ? "correct" : "incorrect");
  closeGlossary();
  timelinePlaced.splice(correctIndex, 0, current);
  element("timeline-year").textContent = String(current.year);
  element("timeline-target").classList.add("revealed");
  const feedback = element("timeline-verdict");
  feedback.className = correct ? "feedback" : "feedback wrong";
  const title = document.createElement("strong");
  title.textContent = correct ? "Dobre miejsce! +1 punkt" : "Poprawiamy oś — uczysz się dalej";
  const explanation = document.createElement("p");
  explanation.textContent = correct ? `${current.year} — ${correctPosition.toLocaleLowerCase("pl")}.`
    : `Wybrano: ${selectedPosition.toLocaleLowerCase("pl")}. Właściwe miejsce: ${correctPosition.toLocaleLowerCase("pl")} (${current.year}).`;
  feedback.append(title, explanation);
  const question = questionBank.find((item) => item.id === current.questionId);
  const fact = document.createElement("p");
  fact.className = "fact";
  annotateTerms(fact, question.explanation, () => timelineAnswered);
  element("timeline-source").append(fact);
  appendStudySources(element("timeline-source"), question, () => timelineAnswered);
  renderTimelineBoard();
  updateTimelineProgress();
  element("timeline-next").disabled = false;
  element("timeline-next").focus({ preventScroll: true });
}

function finishTimeline() {
  element("timeline-final-score").textContent = `${timelineScore} / ${timelineQueue.length}`;
  element("timeline-result-note").textContent = timelineScore === timelineQueue.length
    ? "Wszystkie wydarzenia od razu na swoich miejscach!"
    : "Oś jest uporządkowana, także po pomyłkach. Kolejna runda to nowy zestaw do przećwiczenia.";
  element("timeline-final-board").replaceChildren(...timelinePlaced.map((event) => timelineCard(event)));
  const perfect = timelineScore === timelineQueue.length;
  element("timeline-results").classList.toggle("celebrating", perfect);
  showScreen("timeline-results");
  playSound(perfect ? "complete" : "finish");
  if (perfect) celebrate();
  element("timeline-results-title").focus({ preventScroll: true });
}

function leaveTimeline() {
  timelineAnswered = false;
  showScreen("welcome");
  element("timeline-open").focus();
}

element("timeline-open").addEventListener("click", startTimeline);
element("timeline-restart").addEventListener("click", startTimeline);
element("timeline-exit").addEventListener("click", leaveTimeline);
element("timeline-home").addEventListener("click", leaveTimeline);
element("timeline-next").addEventListener("click", () => {
  if (element("timeline").hidden || !timelineAnswered) return;
  if (timelineIndex === timelineQueue.length - 1) {
    finishTimeline();
    return;
  }
  timelineIndex += 1;
  renderTimelineRound();
  window.scrollTo({ top: 0, behavior: "instant" });
  element("timeline-current").focus({ preventScroll: true });
});
