"use strict";

const questions = [
  {
    category: "Słowa, które zmieniły świat",
    icon: "📚",
    question: "Kto w XV wieku rozwinął w Europie druk z użyciem ruchomych metalowych czcionek?",
    answers: ["Leonardo da Vinci", "Johannes Gutenberg", "Isaac Newton", "Galileusz"],
    correct: 1,
    fact: "Ruchome czcionki znano w Azji wcześniej. Gutenberg połączył kilka rozwiązań w system, który umożliwił masowy druk książek w Europie.",
  },
  {
    category: "Halo, tu historia!",
    icon: "☎️",
    question: "Który wynalazek Alexander Graham Bell opatentował w 1876 roku?",
    answers: ["Radio", "Telewizor", "Telefon", "Aparat fotograficzny"],
    correct: 2,
    fact: "Nad przesyłaniem głosu pracowało wielu wynalazców. Historia telefonu to nie tylko Bell — ważną rolę odegrali też m.in. Antonio Meucci i Elisha Gray.",
  },
  {
    category: "Pomysły nabierają rozpędu",
    icon: "⚙️",
    question: "Z udoskonalenia jakiej maszyny słynie James Watt?",
    answers: ["Maszyny parowej", "Maszyny do pisania", "Maszyny do szycia", "Pralki elektrycznej"],
    correct: 0,
  },
  {
    category: "Kierunek: niebo",
    icon: "✈️",
    question: "W którym roku bracia Wright wykonali swoje pierwsze udane loty samolotem z napędem?",
    answers: ["1492", "1969", "2001", "1903"],
    correct: 3,
    fact: "Pierwszy lot Orville’a Wrighta trwał zaledwie 12 sekund, a samolot pokonał około 36 metrów. Wielkie zmiany czasem zaczynają się od krótkiego skoku!",
  },
  {
    category: "Świat na wyciągnięcie kliknięcia",
    icon: "🌐",
    question: "Kto stworzył World Wide Web, czyli system stron WWW?",
    answers: ["Albert Einstein", "Tim Berners-Lee", "Thomas Edison", "Nikola Tesla"],
    correct: 1,
    fact: "WWW to nie to samo co internet. Internet jest siecią łączącą komputery, a WWW to jedna z usług, które z niej korzystają. Pomysł WWW powstał w CERN w 1989 roku.",
  },
  {
    category: "Mały przedmiot, wielki pomysł",
    icon: "🖊️",
    question: "Do czego służy długopis, który udoskonalił László Bíró?",
    answers: ["Mierzenia temperatury", "Nagrywania dźwięku", "Pisania atramentem", "Mierzenia czasu"],
    correct: 2,
  },
];

const element = (id) => document.getElementById(id);
let questionIndex = 0;
let score = 0;
let answered = false;

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
  element("question-category").textContent = current.category;
  element("question-icon").textContent = current.icon;
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
  title.textContent = correct ? "Świetnie! Właśnie tak." : "Nie tym razem — ale teraz już wiesz!";
  feedback.append(title);
  if (!correct) {
    const answer = document.createElement("p");
    answer.textContent = `Poprawna odpowiedź: ${"ABCD"[current.correct]}. ${current.answers[current.correct]}.`;
    feedback.append(answer);
  }
  if (current.fact) {
    const fact = document.createElement("p");
    fact.className = "fact";
    fact.textContent = `A to ciekawe: ${current.fact}`;
    feedback.append(fact);
  }

  element("score-count").textContent = `Punkty: ${score}`;
  element("progress").setAttribute("aria-valuenow", String(questionIndex + 1));
  element("progress-fill").style.width = `${((questionIndex + 1) / questions.length) * 100}%`;
  element("next").disabled = false;
  element("next").focus({ preventScroll: true });
}

function startQuiz() {
  questionIndex = 0;
  score = 0;
  showScreen("quiz");
  renderQuestion();
}

element("start").addEventListener("click", startQuiz);
element("restart").addEventListener("click", startQuiz);
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
    ? "Komplet punktów! Masz nosa do wielkich pomysłów."
    : score >= questions.length / 2
      ? "Dobra robota! Kilka wielkich historii masz już w małym palcu."
      : "Pierwszy krok za Tobą! Teraz znasz już kilka niezwykłych historii.";
  showScreen("results");
  element("results-title").focus({ preventScroll: true });
});
