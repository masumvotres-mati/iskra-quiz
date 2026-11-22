"use strict";

let soundContext;
let soundOutput;

const soundPatterns = {
  click: { notes: [650], duration: 0.035, spacing: 0, volume: 0.025 },
  correct: { notes: [523.25, 659.25, 783.99], duration: 0.14, spacing: 0.065, volume: 0.045 },
  incorrect: { notes: [293.66, 261.63], duration: 0.14, spacing: 0.09, volume: 0.03 },
  streak: { notes: [659.25, 783.99, 1046.5], duration: 0.18, spacing: 0.075, volume: 0.045 },
  complete: { notes: [523.25, 659.25, 783.99, 1046.5], duration: 0.24, spacing: 0.09, volume: 0.045 },
  finish: { notes: [523.25, 659.25], duration: 0.18, spacing: 0.08, volume: 0.035 },
};

function updateSoundControl() {
  const button = document.getElementById("sound-toggle");
  button.textContent = courseState.muted ? "♪ ×" : "♪";
  button.setAttribute("aria-label", courseState.muted ? "Włącz dźwięki" : "Wycisz dźwięki");
  button.setAttribute("aria-pressed", String(!courseState.muted));
  if (soundOutput) soundOutput.gain.setTargetAtTime(courseState.muted ? 0 : 1, soundContext.currentTime, 0.01);
}

function playSound(kind) {
  if (courseState.muted) return;
  const pattern = soundPatterns[kind];
  if (!pattern) {
    notifyCourse("Nie rozpoznano efektu dźwiękowego.");
    return;
  }
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    notifyCourse("Ta przeglądarka nie obsługuje dźwięków quizu.");
    return;
  }
  try {
    if (!soundContext) {
      soundContext = new AudioContextClass();
      soundOutput = soundContext.createGain();
      soundOutput.connect(soundContext.destination);
    }
    if (soundContext.state === "suspended") {
      soundContext.resume().catch(() => notifyCourse("Nie udało się włączyć dźwięku. Sprawdź ustawienia przeglądarki."));
    }
    pattern.notes.forEach((frequency, index) => {
      const start = soundContext.currentTime + index * pattern.spacing;
      const oscillator = soundContext.createOscillator();
      const volume = soundContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      volume.gain.setValueAtTime(0, start);
      volume.gain.linearRampToValueAtTime(pattern.volume, start + 0.006);
      volume.gain.exponentialRampToValueAtTime(0.001, start + pattern.duration);
      oscillator.connect(volume);
      volume.connect(soundOutput);
      oscillator.addEventListener("ended", () => {
        oscillator.disconnect();
        volume.disconnect();
      }, { once: true });
      oscillator.start(start);
      oscillator.stop(start + pattern.duration + 0.01);
    });
  } catch (error) {
    notifyCourse("Dźwięk jest niedostępny. Możesz nadal korzystać z quizu bez dźwięku.");
  }
}

document.getElementById("sound-toggle").addEventListener("click", () => {
  courseState.muted = !courseState.muted;
  saveCourseState();
  updateSoundControl();
  playSound("click");
});
document.addEventListener("click", (event) => {
  const button = event.target instanceof Element ? event.target.closest("button") : null;
  if (button && !button.disabled && button.id !== "sound-toggle" && !button.matches(".answer-select, .timeline-place")) {
    if (button.id === "next" && !document.getElementById("results").hidden) return;
    if (button.id === "timeline-next" && !document.getElementById("timeline-results").hidden) return;
    playSound("click");
  }
});
updateSoundControl();
