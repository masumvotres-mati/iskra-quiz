"use strict";

const element = (id) => document.getElementById(id);
let questions = [];
let questionIndex = 0;
let score = 0;
let answered = false;
let mistakes = [];
let subject = "mixed";
let reviewing = false;
const remaining = { history: [], law: [] };

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
  for (const screen of document.querySelectorAll(".screen")) {
    screen.hidden = screen.id !== id;
  }
  window.scrollTo({ top: 0, behavior: "instant" });
}

function renderQuestion() {
  const current = questions[questionIndex];
  answered = false;
  element("question-count").textContent = `Pytanie ${questionIndex + 1} z ${questions.length}`;
  element("score-count").textContent = `Punkty: ${score}`;
  element("question-category").textContent = `${current.subject === "history" ? "Historia" : "Prawo"} · ${current.topic}`;
  element("question-icon").textContent = current.subject === "history" ? "⚙️" : "⚖️";
  element("question-title").textContent = current.question;
  element("progress").setAttribute("aria-valuemax", String(questions.length));
  element("progress").setAttribute("aria-valuenow", String(questionIndex));
  element("progress-fill").style.width = `${(questionIndex / questions.length) * 100}%`;
  element("feedback").replaceChildren();
  element("feedback").className = "feedback";
  element("next").disabled = true;
  element("next").firstChild.textContent = questionIndex === questions.length - 1 ? "Zobacz wynik " : "Dalej ";
  element("answers").replaceChildren();

  current.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer";
    const letter = document.createElement("span");
    letter.className = "answer-letter";
    letter.textContent = "ABCD"[index];
    letter.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    text.className = "answer-text";
    text.textContent = answer;
    button.setAttribute("aria-label", `${"ABCD"[index]}. ${answer}`);
    button.append(letter, text);
    button.addEventListener("click", () => selectAnswer(index));
    element("answers").append(button);
  });
  element("question-title").focus({ preventScroll: true });
}

function selectAnswer(index) {
  if (answered) return;
  answered = true;
  const current = questions[questionIndex];
  const correct = index === current.correct;
  if (correct) score += 1;
  else mistakes.push(questionBank.find((item) => item.id === current.id));

  Array.from(element("answers").children).forEach((button, answerIndex) => {
    button.disabled = true;
    if (answerIndex === current.correct || (answerIndex === index && !correct)) {
      const isCorrect = answerIndex === current.correct;
      button.classList.add(isCorrect ? "correct" : "incorrect");
      const mark = document.createElement("span");
      mark.className = "answer-mark";
      mark.textContent = isCorrect ? "✓" : "×";
      mark.setAttribute("aria-hidden", "true");
      button.append(mark);
    }
  });

  const feedback = element("feedback");
  feedback.className = correct ? "feedback" : "feedback wrong";
  const title = document.createElement("strong");
  title.textContent = correct ? "Dobrze!" : "Nie tym razem";
  feedback.append(title);
  if (!correct) {
    const answer = document.createElement("p");
    answer.textContent = `Poprawna odpowiedź: ${"ABCD"[current.correct]}. ${current.answers[current.correct]}`;
    feedback.append(answer);
  }
  const explanation = document.createElement("p");
  explanation.className = "fact";
  explanation.textContent = current.explanation;
  const reference = document.createElement("p");
  const link = document.createElement("a");
  const source = questionSources[current.subject];
  link.href = `${source.url}#page=${current.page}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = `${source.title}, s. ${current.page}${current.article ? `, ${current.article}` : ""}`;
  reference.className = "source-reference";
  reference.append(link);
  feedback.append(explanation, reference);

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
  const items = subject === "mixed"
    ? [...takeQuestions("history", 10), ...takeQuestions("law", 10)]
    : takeQuestions(subject, 20);
  startSession(items);
}

element("bank-count").textContent = `${questionBank.length} w bazie`;
element("start").addEventListener("click", () => {
  subject = document.querySelector('input[name="subject"]:checked').value;
  startQuiz();
});
element("restart").addEventListener("click", startQuiz);
element("retry").addEventListener("click", () => startSession(mistakes, true));
element("change-subject").addEventListener("click", () => {
  showScreen("welcome");
  element("welcome-title").focus({ preventScroll: true });
});
element("next").addEventListener("click", () => {
  if (!answered) return;
  if (questionIndex < questions.length - 1) {
    questionIndex += 1;
    renderQuestion();
    window.scrollTo({ top: 0, behavior: "instant" });
    return;
  }

  element("final-score").textContent = `${score} / ${questions.length}`;
  element("result-message").textContent = score === questions.length
    ? "Komplet punktów w tej serii!"
    : "Przeczytane wyjaśnienia to kolejny krok. Teraz możesz utrwalić trudniejsze pytania.";
  element("result-note").textContent = mistakes.length
    ? `Do powtórki: ${mistakes.length}. Powtórka obejmuje tylko błędy z tej ${reviewing ? "powtórki" : "serii"}.`
    : "Wszystkie odpowiedzi poprawne. Przejdź do kolejnej serii.";
  element("retry").hidden = mistakes.length === 0;
  element("retry").textContent = `Powtórz błędy (${mistakes.length})`;
  showScreen("results");
  element("results-title").focus({ preventScroll: true });
});
