"use strict";

const changeCases = [
  {
    id: "employee",
    title: "Pomysł pracownika",
    context: "Anna jest pracownicą i stworzyła wynalazek. Nie ma innej umowy ani zlecenia dotyczącego tego rozwiązania.",
    prompt: "Czy prawo do uzyskania patentu co do zasady przysługuje pracodawcy?",
    versions: [
      { fact: "Wynalazek powstał w prywatnym hobby, poza obowiązkami pracowniczymi.", correct: "no", questionId: "law-4",
        explanation: "Samo zatrudnienie nie odbiera twórcy prawa do patentu. W tej wersji wynalazek nie wynika z obowiązków pracowniczych." },
      { fact: "Wynalazek powstał w wyniku wykonywania obowiązków pracowniczych.", correct: "yes", questionId: "law-5",
        explanation: "Zmienił się związek wynalazku z pracą. Gdy wynika z wykonywania obowiązków, prawo co do zasady przysługuje pracodawcy, chyba że strony ustaliły inaczej." },
    ],
  },
  {
    id: "written-license",
    title: "Podpis pod licencją",
    context: "Strony uzgodniły warunki licencji na wynalazek. Sprawdzasz tylko ustawowy wymóg formy umowy.",
    prompt: "Czy zachowano wymaganą formę umowy licencyjnej?",
    versions: [
      { fact: "Strony zawarły umowę wyłącznie ustnie.", correct: "no", questionId: "law-29",
        explanation: "Ustne uzgodnienie nie spełnia wymogu formy pisemnej pod rygorem nieważności." },
      { fact: "Strony zawarły umowę pisemnie, z własnoręcznymi podpisami.", correct: "yes", questionId: "law-29",
        explanation: "Pisemna umowa z podpisami spełnia wskazany wymóg formy. Oceniasz formę, nie pozostałe warunki umowy." },
    ],
  },
  {
    id: "sublicense",
    title: "Druga fabryka",
    context: "Fabryka ma licencję na wynalazek i chce udzielić innej firmie pierwszej sublicencji. Nie chodzi o kolejną sublicencję od sublicencjobiorcy.",
    prompt: "Czy spełniono wymóg zgody na udzielenie sublicencji?",
    versions: [
      { fact: "Uprawniony z patentu nie wyraził zgody.", correct: "no", questionId: "law-32",
        explanation: "Sama licencja nie wystarcza: sublicencja wymaga zgody uprawnionego z patentu." },
      { fact: "Uprawniony z patentu wyraził zgodę.", correct: "yes", questionId: "law-32",
        explanation: "Zgoda uprawnionego spełnia wskazany wymóg. Nie znosi to zakazu udzielania dalszej sublicencji." },
    ],
  },
  {
    id: "full-license",
    title: "Granice umowy",
    context: "Umowa dotyczy licencji na opatentowany wynalazek. Oceniasz tylko zakres korzystania.",
    prompt: "Czy jest to licencja pełna?",
    versions: [
      { fact: "Umowa nie ogranicza zakresu korzystania z wynalazku.", correct: "yes", questionId: "law-30",
        explanation: "Brak ograniczeń zakresu oznacza licencję pełną. Nie przesądza, czy jest ona wyłączna." },
      { fact: "Umowa ogranicza korzystanie do jednej wskazanej fabryki.", correct: "no", questionId: "law-30",
        explanation: "Dodano ograniczenie zakresu korzystania, więc nie jest to licencja pełna w rozumieniu tego przepisu." },
    ],
  },
  {
    id: "territory",
    title: "Za granicą",
    context: "Firma ma wyłącznie polski patent. Nie uzyskała ochrony w innych państwach.",
    prompt: "Czy sam ten patent zapewnia firmie ochronę w opisanym kraju?",
    versions: [
      { fact: "Firma chce korzystać z ochrony w Niemczech.", correct: "no", questionId: "law-26",
        explanation: "Polski patent działa na terytorium Polski. Sam nie ustanawia ochrony w Niemczech." },
      { fact: "Firma chce korzystać z ochrony we Francji.", correct: "no", questionId: "law-26",
        explanation: "Zmiana jednego zagranicznego państwa na inne nie zmienia zasady: sam polski patent nie daje ochrony we Francji." },
    ],
  },
  {
    id: "agriculture",
    title: "Gdzie działa wynalazek?",
    context: "Nowy sposób techniczny można rzeczywiście wykorzystywać w opisanej działalności. Oceniasz tylko przemysłową stosowalność.",
    prompt: "Czy takie zastosowanie może spełniać wymóg przemysłowej stosowalności?",
    versions: [
      { fact: "Sposób może być wykorzystywany w fabryce.", correct: "yes", questionId: "law-13",
        explanation: "Możliwość wykorzystania sposobu technicznego w działalności przemysłowej odpowiada temu kryterium." },
      { fact: "Sposób może być wykorzystywany w gospodarstwie rolnym.", correct: "yes", questionId: "law-13",
        explanation: "Odpowiedź pozostaje taka sama. Ustawa wprost nie wyklucza rolnictwa z przemysłowej stosowalności." },
    ],
  },
  {
    id: "technical-design",
    title: "Wygląd czy konieczność?",
    context: "Zgłoszono wzór przemysłowy obudowy. Badasz jedną wskazaną cechę, nie całe zgłoszenie.",
    prompt: "Czy tę cechę wyłącza przepis o wyłącznie technicznej funkcji?",
    versions: [
      { fact: "Cecha wynika wyłącznie z funkcji technicznej obudowy.", correct: "yes", questionId: "law-44",
        explanation: "Cechy wynikające wyłącznie z funkcji technicznej nie są objęte wskazanym prawem z rejestracji." },
      { fact: "Cecha jest wyłącznie dekoracją, bez funkcji technicznej.", correct: "no", questionId: "law-44",
        explanation: "Ten konkretny zakaz nie wyłącza czysto dekoracyjnej cechy. Nadal trzeba spełnić inne warunki ochrony wzoru." },
    ],
  },
  {
    id: "research",
    title: "Po co używasz wynalazku?",
    context: "Patent jest ważny, a użytkownik nie ma zgody uprawnionego. Badasz tylko wyjątek dotyczący badań.",
    prompt: "Czy opisane użycie mieści się w wyjątku badawczym?",
    versions: [
      { fact: "Wynalazek służy wyłącznie doświadczeniom badającym jego działanie.", correct: "yes", questionId: "law-28",
        explanation: "Ustawa dopuszcza stosowanie wynalazku do celów badawczych i doświadczalnych. Tu właśnie taki cel opisano." },
      { fact: "Wynalazek służy wyłącznie zwykłej produkcji towarów na sprzedaż.", correct: "no", questionId: "law-28",
        explanation: "Zwykła produkcja handlowa nie staje się badaniem tylko dlatego, że korzysta z wynalazku. Ten wyjątek jej nie obejmuje." },
    ],
  },
  {
    id: "treatment",
    title: "Leczenie i produkty",
    context: "Zgłoszenie dotyczy rozwiązania medycznego. Sprawdzasz tylko wyłączenie określonych sposobów leczenia.",
    prompt: "Czy ten przedmiot jest wyłączony właśnie jako sposób leczenia?",
    versions: [
      { fact: "Przedmiotem jest sposób leczenia człowieka metodą chirurgiczną.", correct: "yes", questionId: "law-16",
        explanation: "Wskazany przepis wyłącza sposoby leczenia metodami chirurgicznymi." },
      { fact: "Przedmiotem jest nowa substancja stosowana w leczeniu człowieka.", correct: "no", questionId: "law-16",
        explanation: "Wyłączenie sposobów leczenia nie dotyczy produktów, w szczególności substancji i mieszanin. Nie gwarantuje to jednak uzyskania patentu." },
    ],
  },
];

const officeCases = [
  {
    id: "water-process", title: "Oczyszczanie wody",
    context: "Laboratorium opracowało nowy chemiczny sposób oczyszczania wody.",
    goal: "Klient chce chronić sposób techniczny, nie nazwę ani wygląd produktu.",
    correct: "patent", questionId: "law-1",
    explanation: "Spośród tych trzech dróg patent odpowiada ochronie wynalazku, w tym sposobu technicznego.",
  },
  {
    id: "coating-mixture", title: "Powłoka ochronna",
    context: "Firma opracowała nową mieszaninę chemiczną do powlekania metalu.",
    goal: "Klient chce chronić rozwiązanie dotyczące składu mieszaniny.",
    correct: "patent", questionId: "law-1",
    explanation: "Chodzi o rozwiązanie techniczne dotyczące produktu chemicznego, nie o jego oznaczenie czy wygląd.",
  },
  {
    id: "fertilizer-process", title: "Produkcja nawozu",
    context: "Zespół opracował nowy techniczny sposób produkcji nawozu.",
    goal: "Klient chce chronić ten sposób wytwarzania.",
    correct: "patent", questionId: "law-1",
    explanation: "Patent może chronić wynalazek dotyczący sposobu wytwarzania. Przeznaczenie produktu dla rolnictwa tego nie wyklucza.",
  },
  {
    id: "plastic-mixture", title: "Nowe tworzywo",
    context: "Chemicy opracowali nową mieszaninę polimerów o zastosowaniu technicznym.",
    goal: "Klient chce chronić rozwiązanie materiałowe, nie wygląd wyrobów.",
    correct: "patent", questionId: "law-1",
    explanation: "Wybrany cel dotyczy wynalazku materiałowego. Ochrona wyglądu lub znaku nie zastępuje patentu na takie rozwiązanie.",
  },
  {
    id: "bottle-shape", title: "Butelka",
    context: "Projektant nadał butelce nową, ozdobną formę.",
    goal: "Klient chce chronić wyłącznie jej wygląd, nie funkcję techniczną ani oznaczenie pochodzenia.",
    correct: "design", questionId: "law-41",
    explanation: "Ochronie wyglądu wytworu odpowiada wzór przemysłowy. Tutaj celem nie jest ochrona oznaczenia firmy.",
  },
  {
    id: "fabric-pattern", title: "Tkanina",
    context: "Projektant przygotował nowy ornament na tkaninie.",
    goal: "Klient chce chronić ozdobny wygląd, nie używać ornamentu jako znaku firmy.",
    correct: "design", questionId: "law-41",
    explanation: "Ornamentacja jest cechą postaci wytworu. Spośród podanych dróg temu celowi odpowiada wzór przemysłowy.",
  },
  {
    id: "chair-back", title: "Krzesło",
    context: "Oparcie krzesła otrzymało nowy dekoracyjny kształt, niewynikający z funkcji technicznej.",
    goal: "Klient chce chronić tę postać produktu, nie jego mechanizm.",
    correct: "design", questionId: "law-41",
    explanation: "Cel dotyczy wyglądu krzesła. Wzór przemysłowy nie jest tym samym co ochrona technicznego mechanizmu.",
  },
  {
    id: "lamp-housing", title: "Lampa",
    context: "Obudowę lampy zdobi nowa kompozycja linii i kolorów.",
    goal: "Klient chce chronić wygląd obudowy, nie obwód elektryczny ani markę.",
    correct: "design", questionId: "law-41",
    explanation: "Linie i kolorystyka tworzą wygląd wytworu, do którego odnosi się wzór przemysłowy.",
  },
  {
    id: "drink-name", title: "Napój",
    context: "Firma wymyśliła nazwę pozwalającą odróżniać jej napoje od napojów innych firm.",
    goal: "Klient chce chronić oznaczenie towarów.",
    correct: "trademark", questionId: "law-45",
    explanation: "Nazwa ma wskazywać pochodzenie handlowe napojów. To funkcja znaku towarowego.",
  },
  {
    id: "shoe-logo", title: "Buty",
    context: "Nowe logo pozwala klientom rozpoznawać buty jednego przedsiębiorstwa.",
    goal: "Klient chce chronić logo jako oznaczenie pochodzenia towarów.",
    correct: "trademark", questionId: "law-45",
    explanation: "W tym celu logo pełni funkcję znaku towarowego, a nie patentu na technologię produkcji butów.",
  },
  {
    id: "soap-sound", title: "Mydło",
    context: "Krótki dźwięk pozwala odróżniać mydła danej firmy od produktów konkurencji.",
    goal: "Klient chce chronić ten dźwięk jako oznaczenie swoich towarów.",
    correct: "trademark", questionId: "law-46",
    explanation: "Znakiem towarowym może być także dźwięk, jeśli spełnia ustawowe warunki. Nie musi to być słowo ani rysunek.",
  },
  {
    id: "tool-name", title: "Narzędzia",
    context: "Producent umieszcza na narzędziach odróżniającą nazwę swojej serii.",
    goal: "Klient chce chronić nazwę jako oznaczenie towarów, nie budowę narzędzia.",
    correct: "trademark", questionId: "law-45",
    explanation: "Chroniony cel to odróżnianie towarów przedsiębiorstwa. Odpowiada mu znak towarowy.",
  },
];

const legalGameModes = {
  change: {
    title: "Jedna zmiana", entry: "change-open", cases: changeCases, count: 3,
    instructions: "Najpierw oceń sytuację, potem zmienimy jeden szczegół. Czasem odpowiedź się zmieni, a czasem nie. Trzy sprawy, po dwie decyzje.",
    choices: [{ id: "yes", label: "Tak" }, { id: "no", label: "Nie" }],
  },
  office: {
    title: "Biuro pomysłów", entry: "office-open", cases: officeCases, count: 5,
    instructions: "Dobierz jedną z trzech dróg ochrony do celu klienta. Zakładamy spełnienie pozostałych warunków ochrony; to nie jest pełne badanie zgłoszenia. Pięć spraw, bez zegara.",
    choices: [{ id: "patent", label: "Patent" }, { id: "design", label: "Wzór przemysłowy" }, { id: "trademark", label: "Znak towarowy" }],
  },
};

let legalGameMode = "change";
let legalGameDeck = [];
let legalGameIndex = 0;
let legalGameVersion = 0;
let legalGameScore = 0;
let legalGameAnswered = false;

function legalGameDecision() {
  const current = legalGameDeck[legalGameIndex];
  return legalGameMode === "change" ? current.versions[legalGameVersion] : current;
}

function legalGameTotal() {
  return legalGameDeck.length * (legalGameMode === "change" ? 2 : 1);
}

function startLegalGame(mode) {
  if (!Object.hasOwn(legalGameModes, mode)) {
    notifyCourse("Nie rozpoznano wybranej gry.");
    return;
  }
  legalGameMode = mode;
  const config = legalGameModes[mode];
  legalGameDeck = shuffled(config.cases).slice(0, config.count);
  legalGameIndex = 0;
  legalGameVersion = 0;
  legalGameScore = 0;
  element("legal-game-title").textContent = config.title;
  element("legal-game-instructions").textContent = config.instructions;
  element("legal-game").dataset.mode = mode;
  showScreen("legal-game");
  renderLegalCase();
  element("legal-game-title").focus({ preventScroll: true });
}

function updateLegalGameProgress() {
  const steps = legalGameMode === "change" ? 2 : 1;
  const completed = legalGameIndex * steps + legalGameVersion + Number(legalGameAnswered);
  element("legal-game-score").textContent = `Punkty: ${legalGameScore}`;
  element("legal-game-progress").setAttribute("aria-valuemax", String(legalGameTotal()));
  element("legal-game-progress").setAttribute("aria-valuenow", String(completed));
  element("legal-game-progress-fill").style.width = `${completed / legalGameTotal() * 100}%`;
}

function renderLegalCase() {
  closeGlossary();
  legalGameAnswered = false;
  const current = legalGameDeck[legalGameIndex];
  const decision = legalGameDecision();
  const changing = legalGameMode === "change";
  element("legal-game-count").textContent = `Sprawa ${legalGameIndex + 1} z ${legalGameDeck.length}${changing ? ` · wersja ${legalGameVersion + 1}/2` : ""}`;
  element("legal-case-label").textContent = changing && legalGameVersion ? "ZMIENIAMY JEDEN SZCZEGÓŁ" : "TECZKA SPRAWY";
  element("legal-case-title").textContent = current.title;
  annotateTerms(element("legal-case-context"), current.context, () => legalGameAnswered);
  element("legal-case-previous").hidden = !changing || !legalGameVersion;
  element("legal-case-previous").replaceChildren();
  if (changing && legalGameVersion) {
    annotateTerms(element("legal-case-previous"), `Wcześniej: ${current.versions[0].fact}`, () => legalGameAnswered);
  }
  annotateTerms(element("legal-case-fact"), changing ? decision.fact : current.goal, () => legalGameAnswered);
  element("legal-case-fact").classList.toggle("changed", changing && legalGameVersion === 1);
  annotateTerms(element("legal-case-prompt"), changing ? current.prompt : "Która droga ochrony odpowiada temu celowi?", () => legalGameAnswered);
  element("legal-game-feedback").replaceChildren();
  element("legal-game-feedback").className = "feedback";
  element("legal-case-stamp").hidden = true;
  element("legal-case-stamp").textContent = "";
  element("legal-game-next").disabled = true;
  element("legal-game-next").textContent = changing && !legalGameVersion ? "Zobacz jedną zmianę →"
    : legalGameIndex === legalGameDeck.length - 1 ? "Zobacz wynik →" : "Następna sprawa →";
  element("legal-case-choices").replaceChildren();
  for (const choice of legalGameModes[legalGameMode].choices) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "legal-case-choice";
    button.dataset.choice = choice.id;
    button.dataset.feedbackSound = "";
    button.textContent = choice.label;
    button.addEventListener("click", () => chooseLegalAnswer(choice.id));
    element("legal-case-choices").append(button);
  }
  updateLegalGameProgress();
}

function chooseLegalAnswer(choiceId) {
  if (element("legal-game").hidden || legalGameAnswered) return;
  const choices = legalGameModes[legalGameMode].choices;
  if (!choices.some((choice) => choice.id === choiceId)) {
    notifyCourse("Nie rozpoznano wybranej odpowiedzi w grze.");
    return;
  }
  const decision = legalGameDecision();
  const correct = choiceId === decision.correct;
  const answer = choices.find((choice) => choice.id === decision.correct).label;
  legalGameAnswered = true;
  if (correct) legalGameScore += 1;
  playSound(correct ? "correct" : "incorrect");
  closeGlossary();
  for (const button of element("legal-case-choices").children) {
    button.disabled = true;
    const isAnswer = button.dataset.choice === decision.correct;
    const isWrong = button.dataset.choice === choiceId && !correct;
    button.classList.toggle("correct", isAnswer);
    button.classList.toggle("incorrect", isWrong);
    if (isAnswer || isWrong) {
      const mark = document.createElement("span");
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = isAnswer ? "✓" : "×";
      button.append(mark);
    }
  }
  element("legal-case-stamp").textContent = correct ? "DOBRA DECYZJA" : "SPRAWDŹ WYJAŚNIENIE";
  element("legal-case-stamp").hidden = false;
  const feedback = element("legal-game-feedback");
  feedback.className = correct ? "feedback" : "feedback wrong";
  const title = document.createElement("strong");
  title.textContent = correct ? "Dobra decyzja! +1 punkt" : `Poprawna odpowiedź: ${answer}`;
  const explanation = document.createElement("p");
  explanation.className = "fact";
  annotateTerms(explanation, decision.explanation, () => legalGameAnswered);
  feedback.append(title, explanation);
  appendStudySources(feedback, questionBank.find((item) => item.id === decision.questionId), () => legalGameAnswered);
  updateLegalGameProgress();
  element("legal-game-next").disabled = false;
  element("legal-game-next").focus({ preventScroll: true });
}

function finishLegalGame() {
  const perfect = legalGameScore === legalGameTotal();
  element("legal-game-result-name").textContent = legalGameModes[legalGameMode].title;
  element("legal-game-final-score").textContent = `${legalGameScore} / ${legalGameTotal()}`;
  element("legal-game-result-note").textContent = legalGameMode === "change"
    ? "Liczy się znaczenie zmienionego szczegółu — odpowiedź nie musi zmieniać się za każdym razem."
    : "Ta sama rzecz może mieć różne aspekty ochrony. Dobierasz ją do konkretnego celu, nie do samej nazwy produktu.";
  element("legal-game-results").classList.toggle("celebrating", perfect);
  showScreen("legal-game-results");
  playSound(perfect ? "complete" : "finish");
  if (perfect) celebrate();
  element("legal-game-results-title").focus({ preventScroll: true });
}

function leaveLegalGame() {
  legalGameAnswered = false;
  showScreen("welcome");
  element(legalGameModes[legalGameMode].entry).focus();
}

element("change-open").addEventListener("click", () => startLegalGame("change"));
element("office-open").addEventListener("click", () => startLegalGame("office"));
element("legal-game-exit").addEventListener("click", leaveLegalGame);
element("legal-game-home").addEventListener("click", leaveLegalGame);
element("legal-game-restart").addEventListener("click", () => startLegalGame(legalGameMode));
element("legal-game-next").addEventListener("click", () => {
  if (element("legal-game").hidden || !legalGameAnswered) return;
  if (legalGameMode === "change" && legalGameVersion === 0) {
    legalGameVersion = 1;
  } else if (legalGameIndex < legalGameDeck.length - 1) {
    legalGameIndex += 1;
    legalGameVersion = 0;
  } else {
    finishLegalGame();
    return;
  }
  playSound("click");
  renderLegalCase();
  window.scrollTo({ top: 0, behavior: "instant" });
  element("legal-case-title").focus({ preventScroll: true });
});
