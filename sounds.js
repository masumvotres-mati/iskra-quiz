"use strict";

let soundContext;
let soundOutput;

function updateSoundControl() {
  const button = document.getElementById("sound-toggle");
  button.textContent = courseState.muted ? "♪ ×" : "♪";
  button.setAttribute("aria-label", courseState.muted ? "Włącz dźwięki" : "Wycisz dźwięki");
  button.setAttribute("aria-pressed", String(!courseState.muted));
  if (soundOutput) soundOutput.gain.setTargetAtTime(courseState.muted ? 0 : 1, soundContext.currentTime, 0.01);
}

function playSound(kind) {
  if (courseState.muted) return;
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
    const notes = kind === "correct" ? [523.25, 659.25, 783.99] : kind === "incorrect" ? [220, 164.81] : [650];
    const duration = kind === "click" ? 0.045 : 0.12;
    notes.forEach((frequency, index) => {
      const start = soundContext.currentTime + index * duration * 0.7;
      const oscillator = soundContext.createOscillator();
      const volume = soundContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      volume.gain.setValueAtTime(0, start);
      volume.gain.linearRampToValueAtTime(kind === "click" ? 0.025 : 0.06, start + 0.008);
      volume.gain.exponentialRampToValueAtTime(0.001, start + duration);
      oscillator.connect(volume);
      volume.connect(soundOutput);
      oscillator.addEventListener("ended", () => {
        oscillator.disconnect();
        volume.disconnect();
      }, { once: true });
      oscillator.start(start);
      oscillator.stop(start + duration + 0.01);
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
  if (button && !button.disabled && button.id !== "sound-toggle" && !button.classList.contains("answer-select")) {
    playSound("click");
  }
});
updateSoundControl();
