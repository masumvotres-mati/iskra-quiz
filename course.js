"use strict";

const passingPercent = 80;
const chapters = [
  ["everyday-ideas", "Wynalazki, które rozumiesz", "history", [1, 5, 6, 10, 12, 17, 18, 22, 24, 44], "Zacznij od zastosowań, które łatwo sobie wyobrazić."],
  ["protecting-ideas", "Czyj pomysł, czyje prawo?", "law", [1, 3, 4, 5, 6, 38, 41, 45, 46, 47], "Twórca, nazwa, wygląd i rozwiązanie techniczne."],
  ["early-civilizations", "Pierwsze wielkie pomysły", "history", [2, 3, 4, 7, 8, 9, 11, 61, 62, 63], "Od kamienia i ognia do pisma, metali i papieru."],
  ["patent-foundations", "Patent bez tajemnic", "law", [7, 8, 9, 10, 11, 12, 13, 14, 15, 16], "Nowość, pierwszeństwo i podstawowe warunki ochrony."],
  ["water-wind-print", "Woda, wiatr i druk", "history", [13, 14, 15, 16, 19, 20, 21, 64, 65, 66], "Jak wykorzystywano siły natury i przekazywano wiedzę."],
  ["filing-invention", "Od pomysłu do zgłoszenia", "law", [17, 18, 19, 20, 21, 22, 23, 61, 62, 63], "Dokumenty, zastrzeżenia i publikacja zgłoszenia."],
  ["renaissance-science", "Eksperyment zmienia świat", "history", [23, 25, 26, 27, 67, 68, 69, 70, 71, 72], "Zegary, przyrządy i konstruktorzy renesansu."],
  ["patent-boundaries", "Co wolno właścicielowi?", "law", [24, 25, 26, 27, 28, 64, 65, 66, 67, 68], "Granice patentu, wyjątki i przenoszenie praw."],
  ["industrial-revolution", "Para i przemysł", "history", [28, 29, 30, 31, 32, 33, 34, 73, 74, 75], "Włókiennictwo, górnictwo i rewolucja przemysłowa."],
  ["licensing", "Licencje krok po kroku", "law", [29, 30, 31, 32, 33, 34, 35, 36, 69, 70], "Pełna, niewyłączna, otwarta i przymusowa."],
  ["transport-networks", "Świat nabiera prędkości", "history", [35, 36, 42, 55, 56, 76, 77, 78, 79, 80], "Kolej, parowce, kanały i masowa produkcja."],
  ["utility-and-design", "Budowa czy wygląd?", "law", [39, 40, 42, 43, 44, 80, 81, 82, 83, 84], "Dokładniej o wzorach użytkowych i przemysłowych."],
  ["electric-world", "Prąd i wiadomości", "history", [37, 38, 39, 46, 47, 52, 81, 82, 83, 84], "Od baterii do telefonów i radiotelegrafii."],
  ["trademarks", "Znaki, które rozpoznajesz", "law", [2, 48, 49, 50, 51, 52, 53, 85, 86, 87], "Rejestracja marki, terminy i wcześniejsi użytkownicy."],
  ["new-materials", "Nowe materiały, nowe możliwości", "history", [41, 43, 45, 85, 86, 87, 88, 89, 90, 91], "Stal, tworzywa i rozwiązania inżynierskie."],
  ["origin-and-fair-trade", "Pochodzenie i uczciwy obrót", "law", [54, 55, 88, 89, 90, 91, 92, 93, 94, 95], "Oznaczenia geograficzne, cudze marki i autorstwo."],
  ["sound-and-image", "Zatrzymać głos i obraz", "history", [40, 50, 51, 58, 92, 93, 94, 95, 96, 97], "Fotografia, kino, zapis dźwięku i telewizja."],
  ["chip-layouts", "Sekrety układów scalonych", "law", [56, 57, 58, 59, 60, 96, 97, 98, 99, 100], "Topografie: oryginalność, terminy i wyjątki."],
  ["engines-and-flight", "Silniki i podbój przestworzy", "history", [48, 49, 53, 98, 99, 100, 101, 102, 103, 104], "Precyzyjne skojarzenia konstruktorów i osiągnięć."],
  ["maintaining-rights", "Utrzymać i obronić ochronę", "law", [37, 71, 72, 73, 74, 75, 76, 77, 78, 79], "Opłaty, unieważnienie, wygaśnięcie i formalności."],
  ["polish-pioneers", "Polscy pionierzy techniki", "history", [54, 57, 105, 106, 107, 108, 109, 110, 111, 112], "Nazwiska, miejsca i mniej oczywiste dokonania."],
  ["biotech-and-secrecy", "Biotechnologia i wynalazki tajne", "law", [101, 102, 103, 104, 105, 106, 107, 108, 109, 110], "Szczególne przepisy, wyłączenia i właściwe organy."],
  ["twentieth-century", "Atom, elektronika i kosmos", "history", [59, 60, 113, 114, 115, 116, 117, 118, 119, 120], "Ostatnia część podręcznika i osiągnięcia XX wieku."],
  ["office-and-procedure", "Urząd i trudniejsze przepisy", "law", [111, 112, 113, 114, 115, 116, 117, 118, 119, 120], "Organy, rejestry, środki prawne i ustawowe wyjątki."],
].map(([id, title, subject, numbers, description]) => ({
  id, title, subject, description,
  questionIds: numbers.map((number) => `${subject}-${number}`),
}));

const courseStorageKey = "iskra-course-v1";
const appNotices = new Set();

function notifyCourse(message) {
  appNotices.add(message);
  const notice = document.getElementById("app-notice");
  notice.textContent = [...appNotices].join(" ");
  notice.hidden = false;
}

function loadCourseState() {
  const initial = { version: 1, bestScores: {}, muted: false };
  let stored;
  try {
    stored = localStorage.getItem(courseStorageKey);
  } catch (error) {
    notifyCourse("Przeglądarka blokuje zapis postępu. Odblokowania i ustawienia będą działać tylko w tej otwartej karcie.");
    return initial;
  }
  if (stored === null) return initial;
  let value;
  try {
    value = JSON.parse(stored);
  } catch (error) {
    notifyCourse("Nie można odczytać uszkodzonego zapisu postępu. Uruchomiono nową ścieżkę.");
    return initial;
  }
  if (!value || value.version !== 1 || typeof value.muted !== "boolean" ||
      !value.bestScores || typeof value.bestScores !== "object" || Array.isArray(value.bestScores) ||
      !Object.entries(value.bestScores).every(([id, result]) =>
        chapters.some((chapter) => chapter.id === id) &&
        Number.isInteger(result) && result >= 0 && result <= 100)) {
    notifyCourse("Zapis postępu ma nieobsługiwany format. Uruchomiono nową ścieżkę.");
    return initial;
  }
  return value;
}

const courseState = loadCourseState();

function saveCourseState() {
  try {
    localStorage.setItem(courseStorageKey, JSON.stringify(courseState));
  } catch (error) {
    notifyCourse("Nie udało się zapisać postępu lub ustawień. Zmiany pozostaną tylko w tej otwartej karcie.");
  }
}

function isChapterUnlocked(index) {
  return index >= 0 && index < chapters.length &&
    chapters.slice(0, index).every((chapter) => (courseState.bestScores[chapter.id] || 0) >= passingPercent);
}
