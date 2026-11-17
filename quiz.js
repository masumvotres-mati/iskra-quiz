"use strict";

const element = (id) => document.getElementById(id);
let questions = [];
let questionIndex = 0;
let score = 0;
let answered = false;
let mistakes = [];
let subject = "mixed";
let reviewing = false;
let activeChapterIndex = null;
const remaining = { history: [], law: [] };

function renderCourse() {
  const completed = chapters.filter((chapter) => (courseState.bestScores[chapter.id] || 0) >= passingPercent).length;
  element("course-summary").textContent = `Zaliczone rozdziały: ${completed} / ${chapters.length}`;
  element("start").textContent = completed === chapters.length
    ? "Cała ścieżka zaliczona — powtórz →" : `${completed === 0 ? "Rozpocznij" : "Kontynuuj"} rozdział ${completed + 1} →`;
  element("chapter-list").replaceChildren();
  chapters.forEach((chapter, index) => {
    const best = courseState.bestScores[chapter.id];
    const passed = (best || 0) >= passingPercent;
    const unlocked = isChapterUnlocked(index);
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chapter-button${passed ? " completed" : unlocked ? " current" : ""}`;
    button.disabled = !unlocked;
    const number = document.createElement("span");
    number.className = "chapter-number";
    number.textContent = passed ? "✓" : String(index + 1);
    number.setAttribute("aria-hidden", "true");
    const copy = document.createElement("span");
    copy.className = "chapter-copy";
    const title = document.createElement("strong");
    title.textContent = `${index + 1}. ${chapter.title}`;
    const description = document.createElement("small");
    description.textContent = `${chapter.subject === "history" ? "Historia" : "Prawo"} · ${chapter.questionIds.length} pytań. ${chapter.description}`;
    const state = document.createElement("small");
    state.className = "chapter-state";
    state.textContent = !unlocked ? "Zablokowany — zalicz poprzedni rozdział"
      : passed ? `Zaliczony · najlepszy wynik ${best}% · powtórz`
        : best === undefined ? "Odblokowany · zalicz od 80%" : `Najlepszy wynik ${best}% · potrzeba 80%`;
    copy.append(title, description, state);
    button.append(number, copy);
    button.addEventListener("click", () => startChapter(index));
    item.append(button);
    element("chapter-list").append(item);
  });
}

function startChapter(index) {
  if (!isChapterUnlocked(index)) {
    notifyCourse("Ten rozdział jest zablokowany. Najpierw zalicz poprzednie rozdziały wynikiem co najmniej 80%.");
    return;
  }
  activeChapterIndex = index;
  startSession(chapters[index].questionIds.map((id) => questionBank.find((item) => item.id === id)));
}

function shuffled(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function takeQuestions(selectedSubject, count) {
  const selected = [];
  while (selected.length < count) {
    if (remaining[selectedSubject].length === 0) {
      remaining[selectedSubject] = shuffled(questionBank.filter((item) =>
        item.subject === selectedSubject && !selected.some((chosen) => chosen.id === item.id)));
    }
    selected.push(remaining[selectedSubject].pop());
  }
  return selected;
}

function showScreen(id) {
  closeGlossary();
  for (const screen of document.querySelectorAll(".screen")) {
    screen.hidden = screen.id !== id;
  }
  window.scrollTo({ top: 0, behavior: "instant" });
}

function renderQuestion() {
  closeGlossary();
  const current = questions[questionIndex];
  answered = false;
  element("question-count").textContent = `Pytanie ${questionIndex + 1} z ${questions.length}`;
  element("score-count").textContent = `Punkty: ${score}`;
  element("question-category").textContent = `${activeChapterIndex === null ? "" : `Rozdział ${activeChapterIndex + 1} · `}${current.subject === "history" ? "Historia" : "Prawo"} · ${current.topic}`;
  element("question-icon").textContent = current.subject === "history" ? "⚙️" : "⚖️";
  annotateTerms(element("question-title"), current.question);
  element("progress").setAttribute("aria-valuemax", String(questions.length));
  element("progress").setAttribute("aria-valuenow", String(questionIndex));
  element("progress-fill").style.width = `${(questionIndex / questions.length) * 100}%`;
  element("feedback").replaceChildren();
  element("feedback").className = "feedback";
  element("next").disabled = true;
  element("next").firstChild.textContent = questionIndex === questions.length - 1 ? "Zobacz wynik " : "Dalej ";
  element("answers").replaceChildren();

  current.answers.forEach((answer, index) => {
    const card = document.createElement("div");
    card.className = "answer";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-select";
    const letter = document.createElement("span");
    letter.className = "answer-letter";
    letter.textContent = "ABCD"[index];
    letter.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    text.className = "answer-text";
    annotateTerms(text, answer);
    button.setAttribute("aria-label", `${"ABCD"[index]}. ${answer}`);
    button.addEventListener("click", () => selectAnswer(index));
    card.append(button, letter, text);
    element("answers").append(card);
  });
  element("question-title").focus({ preventScroll: true });
}

function selectAnswer(index) {
  if (answered) return;
  answered = true;
  const current = questions[questionIndex];
  const correct = index === current.correct;
  playSound(correct ? "correct" : "incorrect");
  if (correct) score += 1;
  else mistakes.push(questionBank.find((item) => item.id === current.id));

  closeGlossary();
  Array.from(element("answers").children).forEach((card, answerIndex) => {
    card.querySelector(".answer-select").disabled = true;
    if (answerIndex === current.correct || (answerIndex === index && !correct)) {
      const isCorrect = answerIndex === current.correct;
      card.classList.add(isCorrect ? "correct" : "incorrect");
      const mark = document.createElement("span");
      mark.className = "answer-mark";
      mark.textContent = isCorrect ? "✓" : "×";
      mark.setAttribute("aria-hidden", "true");
      card.append(mark);
    }
  });

  const feedback = element("feedback");
  feedback.className = correct ? "feedback" : "feedback wrong";
  const title = document.createElement("strong");
  title.textContent = correct ? "Dobrze!" : "Nie tym razem";
  feedback.append(title);
  if (!correct) {
    const answer = document.createElement("p");
    annotateTerms(answer, `Poprawna odpowiedź: ${"ABCD"[current.correct]}. ${current.answers[current.correct]}`);
    feedback.append(answer);
  }
  const explanation = document.createElement("p");
  explanation.className = "fact";
  annotateTerms(explanation, current.explanation);
  const excerpt = document.createElement("figure");
  excerpt.className = "source-excerpt";
  const excerptLabel = document.createElement("p");
  excerptLabel.className = "excerpt-label";
  excerptLabel.textContent = "Fragment źródła";
  const quote = document.createElement("blockquote");
  const quoteText = document.createElement("p");
  annotateTerms(quoteText, current.quote);
  quote.append(quoteText);
  const reference = document.createElement("figcaption");
  const link = document.createElement("a");
  const source = questionSources[current.subject];
  link.href = `${source.url}#page=${current.page}`;
  quote.cite = link.href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  const pages = current.sourceEndPage === current.page ? current.page : `${current.page}–${current.sourceEndPage}`;
  const citation = document.createElement("span");
  citation.textContent = `${source.title}, s. ${pages}${current.article ? `, ${current.article}` : ""}`;
  link.textContent = "Otwórz pełny PDF";
  reference.className = "source-reference";
  reference.append(citation, link);
  excerpt.append(excerptLabel, quote, reference);
  feedback.append(explanation, excerpt);

  element("score-count").textContent = `Punkty: ${score}`;
  element("progress").setAttribute("aria-valuenow", String(questionIndex + 1));
  element("progress-fill").style.width = `${((questionIndex + 1) / questions.length) * 100}%`;
  element("next").disabled = false;
}

function startSession(items, isReview = false) {
  questions = shuffled(items).map((item) => {
    const order = shuffled([0, 1, 2, 3]);
    return { ...item, answers: order.map((index) => item.answers[index]), correct: order.indexOf(item.correct) };
  });
  reviewing = isReview;
  questionIndex = 0;
  score = 0;
  mistakes = [];
  showScreen("quiz");
  renderQuestion();
}

function startQuiz() {
  activeChapterIndex = null;
  const items = subject === "mixed"
    ? [...takeQuestions("history", 10), ...takeQuestions("law", 10)]
    : takeQuestions(subject, 20);
  startSession(items);
}

element("bank-count").textContent = `${questionBank.length} w bazie`;
element("start").addEventListener("click", () => {
  const next = chapters.findIndex((chapter) => (courseState.bestScores[chapter.id] || 0) < passingPercent);
  startChapter(next === -1 ? 0 : next);
});
element("practice-start").addEventListener("click", () => {
  subject = document.querySelector('input[name="subject"]:checked').value;
  startQuiz();
});
element("restart").addEventListener("click", () => activeChapterIndex === null ? startQuiz() : startChapter(activeChapterIndex));
element("retry").addEventListener("click", () => startSession(mistakes, true));
element("change-subject").addEventListener("click", () => {
  renderCourse();
  showScreen("welcome");
  element("welcome-title").focus({ preventScroll: true });
});
element("next-chapter").addEventListener("click", () => {
  if (activeChapterIndex !== null) startChapter(activeChapterIndex + 1);
});
element("next").addEventListener("click", () => {
  if (!answered) return;
  if (questionIndex < questions.length - 1) {
    questionIndex += 1;
    renderQuestion();
    window.scrollTo({ top: 0, behavior: "instant" });
    return;
  }

  const chapter = activeChapterIndex === null ? null : chapters[activeChapterIndex];
  const percent = Math.round(score / questions.length * 100);
  const passed = percent >= passingPercent;
  if (chapter && !reviewing) {
    const previous = courseState.bestScores[chapter.id];
    if (previous === undefined || percent > previous) {
      courseState.bestScores[chapter.id] = percent;
      saveCourseState();
    }
    renderCourse();
  }
  element("final-score").textContent = `${score} / ${questions.length}`;
  element("results-title").textContent = reviewing ? "Powtórka ukończona!"
    : chapter ? passed ? "Rozdział zaliczony!" : "Jeszcze trochę!" : "Trening ukończony!";
  element("result-message").textContent = reviewing
    ? "Utrwalasz trudniejsze pytania. Powtórka błędów nie zmienia zaliczenia rozdziału."
    : chapter
      ? passed
        ? activeChapterIndex === chapters.length - 1 ? "Cała ścieżka zaliczona! Możesz wracać do dowolnego rozdziału."
          : `Wynik ${percent}% — kolejny rozdział jest odblokowany.`
        : `Wynik ${percent}%. Do zaliczenia potrzeba co najmniej ${Math.ceil(questions.length * passingPercent / 100)} poprawnych odpowiedzi w jednej pełnej próbie.`
      : score === questions.length ? "Komplet punktów w tej serii!" : "Przeczytane wyjaśnienia to kolejny krok.";
  const reviewNote = mistakes.length ? `Do powtórki: ${mistakes.length}.` : "Wszystkie odpowiedzi poprawne.";
  element("result-note").textContent = `${reviewNote}${chapter && !reviewing ? ` Najlepszy wynik rozdziału: ${courseState.bestScores[chapter.id]}%.` : ""}`;
  element("next-chapter").hidden = !chapter || activeChapterIndex === chapters.length - 1 ||
    !isChapterUnlocked(activeChapterIndex + 1);
  element("restart").textContent = chapter ? "Powtórz rozdział" : "Nowa seria";
  element("retry").hidden = mistakes.length === 0;
  element("retry").textContent = `Powtórz błędy (${mistakes.length})`;
  showScreen("results");
  element("results-title").focus({ preventScroll: true });
});
renderCourse();
